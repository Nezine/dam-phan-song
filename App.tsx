import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';
import { File } from 'expo-file-system';
import { customerTurn, transcribeAudio, mimeTypeForAudioUri, GEMINI_API_KEY } from './src/lib/gemini';
import { groqCustomerTurn, GROQ_API_KEY } from './src/lib/groq';
import { mockCustomerTurn } from './src/lib/mock';
import { scoreNegotiation, type ScoreResult } from './src/lib/score';
import { loadProgress, recordSession, type Progress } from './src/lib/progress';
import { randomQuote } from './src/lib/highlights';
import type { Scenario, Turn } from './src/lib/types';

const fmt = (n: number) => n.toLocaleString('vi-VN');
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const MOCK = !GEMINI_API_KEY; // không có key → MOCK MODE (banner đỏ trên màn hình, không đem demo như AI thật)

// File ghi âm nhỏ hơn mức này coi như không nghe được (bấm nhầm / im lặng) —
// không gọi API transcribe. 500 bytes ≈ 0,1s âm thanh nén, dưới mức một từ nói.
const MIN_VOICE_BYTES = 500;

const MOOD_LABEL: Record<NonNullable<Turn['emotion']>, string> = {
  friendly: 'Vui vẻ',
  neutral: 'Bình thường',
  annoyed: 'Khó chịu',
};

// Lỗi kỹ thuật -> câu tiếng Việt thân thiện cho người dùng (P0-5).
const friendlyError = (e: unknown): string => {
  const s = e instanceof Error ? e.message : String(e);
  if (/429|quota|rate limit/i.test(s)) return 'Máy chủ AI đang bận (quá tải) — bấm Thử lại nhé.';
  if (/network|fetch|failed|timeout|timed out|ECONN/i.test(s))
    return 'Mạng yếu — kiểm tra 4G/wifi rồi bấm Thử lại.';
  if (/micro|permission|quyền/i.test(s)) return 'Chưa có quyền micro — bật quyền trong Cài đặt rồi thử lại.';
  if (/transcri|nghe/i.test(s)) return 'Chưa nghe rõ — bấm mic nói lại nhé.';
  return 'Có lỗi xảy ra — bấm Thử lại nhé.';
};

const CUSTOMER_MAX_BUDGET = 4_800_000;

const TWISTS: { key: Scenario['twist']; label: string; desc: string; opening: string }[] = [
  {
    key: 'price',
    label: '1. Phòng 1 · Băn khoăn về giá',
    desc: 'Khách thích sản phẩm nhưng thấy giá hơi cao',
    opening: 'Sản phẩm nhìn tốt đó em, nhưng 5 triệu hơi cao hơn mức anh dự tính. Có lựa chọn nào hợp lý hơn không?',
  },
  {
    key: 'need',
    label: '2. Phòng 1 · Chưa thấy cần thiết',
    desc: 'Khách chưa rõ sản phẩm giải quyết nhu cầu nào',
    opening: 'Anh đang dùng một sản phẩm khác rồi. Em giúp anh hiểu món này hữu ích hơn ở điểm nào nhé?',
  },
  {
    key: 'trust',
    label: '3. Phòng 1 · Cần thêm niềm tin',
    desc: 'Khách muốn hiểu rõ chất lượng và chính sách',
    opening: 'Anh muốn tìm hiểu thêm về chất lượng và bảo hành trước khi quyết định mua.',
  },
  {
    key: 'timing',
    label: '4. Phòng 1 · Chưa đúng thời điểm',
    desc: 'Khách chưa sẵn sàng quyết định ngay',
    opening: 'Anh thấy sản phẩm phù hợp, nhưng có lẽ tháng sau anh mới cần. Có lý do gì nên mua hôm nay không?',
  },
];

export default function App({ onExit, quickStart }: { onExit?: () => void; quickStart?: boolean }) {
  // --- setup state (đơn giản hóa cho demo: nhập trước khi bấm Bắt đầu) ---
  const [started, setStarted] = useState(false);
  const [sellerName, setSellerName] = useState('Minh');
  const [city, setCity] = useState('TP.HCM');
  const [productName, setProductName] = useState('Máy pha cà phê mini');
  const [listedPrice, setListedPrice] = useState('5000000');
  const [targetPrice, setTargetPrice] = useState('4500000');

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [busyPhase, setBusyPhase] = useState<'transcribe' | 'customer' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const [agreedPrice, setAgreedPrice] = useState<number | null>(null);
  const winQuote = useMemo(
    () => (agreedPrice == null ? null : randomQuote(turns.length * 7 + agreedPrice)),
    [agreedPrice, turns.length],
  );
  const [textDraft, setTextDraft] = useState('');
  const [muted, setMuted] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const [messageEntry] = useState(() => new Animated.Value(1));
  const [micPulse] = useState(() => new Animated.Value(1));
  const [typingDots] = useState(() => [new Animated.Value(0.35), new Animated.Value(0.35), new Animated.Value(0.35)]);
  const [winPulse] = useState(() => new Animated.Value(1));
  const mutedRef = useRef(false);
  const recordedRef = useRef<number | null>(null); // agreedPrice đã ghi tiến bộ

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recState = useAudioRecorderState(recorder);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const speak = (text: string) => {
    if (!mutedRef.current) Speech.speak(text, { language: 'vi-VN', rate: 1.0 });
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) setError('Chưa có quyền micro');
      await setAudioModeAsync({ playsInSilentMode: false, allowsRecording: true });
    })();
  }, []);

  // Tiến bộ đã lưu trên máy (P1-8).
  useEffect(() => {
    loadProgress().then(setProgress).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [turns]);

  useEffect(() => {
    if (!turns.length) return;
    messageEntry.setValue(0);
    const animation = Animated.timing(messageEntry, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [turns, messageEntry]);

  useEffect(() => {
    if (!recState.isRecording) {
      micPulse.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, {
          toValue: 1.025,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(micPulse, {
          toValue: 1,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [recState.isRecording, micPulse]);

  useEffect(() => {
    typingDots.forEach((dot) => dot.setValue(0.35));
    if (busyPhase !== 'customer') return;
    const pulse = Animated.loop(
      Animated.sequence(
        typingDots.flatMap((dot) => [
          Animated.timing(dot, {
            toValue: 1,
            duration: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.35,
            duration: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    pulse.start();
    return () => pulse.stop();
  }, [busyPhase, typingDots]);

  useEffect(() => {
    if (agreedPrice == null) {
      winPulse.setValue(1);
      return;
    }
    winPulse.setValue(0.98);
    const pulse = Animated.sequence([
      Animated.timing(winPulse, {
        toValue: 1.035,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(winPulse, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    pulse.start();
    return () => pulse.stop();
  }, [agreedPrice, winPulse]);

  // Đồng hồ ghi âm (P1-4).
  useEffect(() => {
    if (!recState.isRecording) return;
    const id = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recState.isRecording]);

  // Chốt giá -> chấm điểm rule-based + ghi tiến bộ 1 lần (P0-3, P1-8).
  useEffect(() => {
    if (agreedPrice == null || !scenario) return;
    if (recordedRef.current === agreedPrice) return;
    recordedRef.current = agreedPrice;
    const s = scoreNegotiation(turns, scenario, agreedPrice);
    setResult(s);
    recordSession(agreedPrice - scenario.targetPrice, s.percent)
      .then(setProgress)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agreedPrice]);

  const resetSession = () => {
    setTurns([]);
    setAgreedPrice(null);
    setError(null);
    setLastFailedText(null);
    setTextDraft('');
    setShowResult(false);
    setResult(null);
    setRecSeconds(0);
    recordedRef.current = null;
  };

  const backToSetup = () => {
    resetSession();
    setScenario(null);
    setStarted(false);
  };

  const startNegotiation = (preset?: typeof TWISTS[number]) => {
    const s: Scenario = {
      sellerName: sellerName.trim() || 'bạn',
      city: city.trim() || 'TP.HCM',
      productName: productName.trim() || 'Máy pha cà phê mini',
      listedPrice: Number(listedPrice) || 5_000_000,
      targetPrice: Number(targetPrice) || 4_500_000,
      maxBudget: CUSTOMER_MAX_BUDGET,
      twist: preset?.key,
      opening: preset?.opening,
    };
    resetSession();
    setScenario(s);
    setStarted(true);
    if (s.opening) {
      const opening: Turn = { speaker: 'customer', text: s.opening };
      setTurns([opening]);
      speak(s.opening);
    }
  };

  // Luyện lại cùng băn khoăn của khách hàng.
  const restartSameScenario = () => {
    const preset = TWISTS.find((t) => t.key === scenario?.twist);
    startNegotiation(preset);
  };

  // Luyện nhanh: vào thẳng tình huống đầu tiên, bỏ qua màn chuẩn bị.
  const quickStartedRef = useRef(false);
  useEffect(() => {
    if (!quickStart || quickStartedRef.current) return;
    quickStartedRef.current = true;
    startNegotiation(TWISTS[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickStart]);

  // Gọi khách hàng (không thêm lượt người bán — dùng cho Thử lại, P0-5).
  const callCustomer = async (sellerText: string) => {
    if (!scenario) return;
    setBusy(true);
    setBusyPhase('customer');
    if (MOCK) {
      // MOCK MODE: luật cứng, không gọi API
      const reply = mockCustomerTurn(scenario, turns, sellerText);
      setTurns((t) => [
        ...t,
        { speaker: 'customer', text: reply.message, price: reply.currentPrice ?? undefined, emotion: reply.emotion },
      ]);
      if (
        reply.agreed &&
        reply.agreedPrice &&
        reply.agreedPrice >= scenario.targetPrice &&
        reply.agreedPrice <= scenario.maxBudget
      ) {
        setAgreedPrice(reply.agreedPrice);
      } else if (reply.agreed && reply.agreedPrice) {
        const msg = 'Mức giá này chưa thể chốt. Hãy tiếp tục tư vấn hoặc điều chỉnh đề xuất của bạn nhé.';
        setTurns((t) => [...t, { speaker: 'customer', text: msg, emotion: 'annoyed' }]);
        speak(msg);
      } else speak(reply.message);
      setBusy(false);
      setBusyPhase(null);
      return;
    }
    let reply;
    let usedFallback = false;
    try {
      try {
        reply = await customerTurn(scenario, turns, sellerText);
      } catch (geminiErr) {
        if (!GROQ_API_KEY) throw geminiErr;
        usedFallback = true;
        reply = await groqCustomerTurn(scenario, turns, sellerText);
      }
    } catch (e) {
      setLastFailedText(sellerText);
      setError(friendlyError(e));
      setBusy(false);
      setBusyPhase(null);
      return;
    }
    setTurns((t) => [
      ...t,
      { speaker: 'customer', text: reply.message, price: reply.currentPrice ?? undefined, emotion: reply.emotion },
    ]);
    if (
      reply.agreed &&
      reply.agreedPrice &&
      reply.agreedPrice >= scenario.targetPrice &&
      reply.agreedPrice <= scenario.maxBudget
    ) {
      setAgreedPrice(reply.agreedPrice);
    } else if (reply.agreed && reply.agreedPrice) {
      const msg = 'Mức giá này chưa thể chốt. Hãy tiếp tục tư vấn hoặc điều chỉnh đề xuất của bạn nhé.';
      setTurns((t) => [...t, { speaker: 'customer', text: msg, emotion: 'annoyed' }]);
      speak(msg);
    } else {
      speak(reply.message);
    }
    if (usedFallback) console.log('[fallback] dùng Groq');
    setBusy(false);
    setBusyPhase(null);
  };

  const sendToCustomer = async (sellerText: string) => {
    if (!scenario) return;
    const text = sellerText.trim();
    if (!text) return;
    setBusy(true);
    setBusyPhase('customer');
    setError(null);
    setLastFailedText(null);
    setTurns((t) => [...t, { speaker: 'seller', text }]);
    await callCustomer(text);
  };

  const retryLast = () => {
    const t = lastFailedText;
    if (!t) return;
    setError(null);
    setLastFailedText(null);
    void callCustomer(t);
  };

  // Nhập text dự phòng khi voice lỗi (P0-2).
  const sendText = () => {
    const t = textDraft.trim();
    if (!t || busy || agreedPrice != null) return;
    setTextDraft('');
    void sendToCustomer(t);
  };

  const onRecordPress = async () => {
    if (recState.isRecording) {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        setError('Không nghe rõ, anh nói lại giúp em nhé');
        return;
      }
      try {
        setBusy(true);
        setBusyPhase('transcribe');
        setError(null);
        // SDK 58: FileSystem.readAsStringAsync (legacy) NÉM LỖI lúc chạy —
        // dùng API File mới. Kiểm tra file tồn tại + đủ lớn TRƯỚC khi gọi API,
        // để ghi âm rỗng/hỏng không bao giờ tới được Gemini.
        const audioFile = new File(uri);
        if (!audioFile.exists || audioFile.size < MIN_VOICE_BYTES) {
          setBusy(false);
          setBusyPhase(null);
          setError('Không nghe rõ, anh nói lại giúp em nhé');
          return;
        }
        const base64 = await audioFile.base64();
        const transcript = await transcribeAudio(base64, mimeTypeForAudioUri(uri));
        setBusyPhase(null);
        // P0-6: ghi âm im lặng -> không gọi API.
        if (!transcript.trim()) {
          setBusy(false);
          setError('Chưa nghe rõ, bấm mic nói lại nhé.');
          return;
        }
        await sendToCustomer(transcript);
      } catch (e) {
        setBusy(false);
        setBusyPhase(null);
        const detail = e instanceof Error ? e.message : String(e);
        setError(`Lỗi chuyển giọng nói: ${friendlyError(e)} (Chi tiết: ${detail.slice(0, 120)})`);
      }
    } else {
      setError(null);
      setRecSeconds(0);
      try {
        await recorder.prepareToRecordAsync();
        recorder.record();
      } catch (e) {
        setError(`Không ghi âm được: ${String(e)}. Dùng ô "gửi chữ" bên dưới để đàm phán tiếp.`);
      }
    }
  };

  const gain = agreedPrice != null && scenario ? agreedPrice - scenario.targetPrice : 0;

  // Giá gần nhất được nêu trong hội thoại.
  const lastPriced = [...turns].reverse().find((t) => t.price != null);
  const currentPrice = lastPriced?.price ?? scenario?.listedPrice ?? 0;
  const twistLabel = TWISTS.find((t) => t.key === scenario?.twist)?.label ?? 'Phòng 1 · Khách mua hàng';

  if (!started) {
    return (
      <KeyboardAvoidingView style={[styles.screen, styles.pad]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {onExit ? (
          <Pressable style={[styles.backBtn, { alignSelf: 'flex-start' }]} onPress={onExit}>
            <Text style={styles.backText}>‹ Trang chủ</Text>
          </Pressable>
        ) : null}
        <Text style={styles.h1}>Đàm Phán Sống</Text>
        <Text style={styles.sub}>Luyện kỹ năng thuyết phục khách hàng — bằng giọng nói thật.</Text>
        <Text style={styles.roomChip}>Phòng 1 · Thuyết phục khách mua hàng — phòng tập đầu tiên trong 5 phòng.</Text>
        {progress && progress.sessions > 0 ? (
          <Text style={styles.progressStrip}>
            Tiến bộ: {progress.sessions} phiên • Phần chênh cộng dồn {fmt(progress.totalSaved)}đ • Điểm tốt nhất{' '}
            {progress.bestScore}%
          </Text>
        ) : null}
        <Text style={styles.sectionHead}>Thiết lập tình huống — Phòng 1</Text>
        <Text style={styles.label}>Tên người bán</Text>
        <TextInput style={styles.input} value={sellerName} onChangeText={setSellerName} placeholder="Minh" />
        <Text style={styles.label}>Khu vực</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="TP.HCM" />
        <Text style={styles.label}>Sản phẩm</Text>
        <TextInput style={styles.input} value={productName} onChangeText={setProductName} placeholder="Máy pha cà phê mini" />
        <Text style={styles.label}>Giá niêm yết (đ)</Text>
        <TextInput
          style={styles.input}
          value={listedPrice}
          onChangeText={setListedPrice}
          placeholder="5000000"
          keyboardType="number-pad"
        />
        <Text style={styles.label}>Giá mục tiêu — mức thấp nhất bạn chấp nhận (đ)</Text>
        <TextInput
          style={styles.input}
          value={targetPrice}
          onChangeText={setTargetPrice}
          placeholder="4500000"
          keyboardType="number-pad"
        />
        <Pressable style={styles.bigBtn} onPress={() => startNegotiation(TWISTS[0])}>
          <Text style={styles.bigBtnText}>Bắt đầu luyện →</Text>
        </Pressable>
        <Text style={styles.twistTitle}>Phòng 1 — Luyện tình huống khó:</Text>
        {TWISTS.map((t) => (
          <Pressable key={t.key} style={styles.twistBtn} onPress={() => startNegotiation(t)}>
            <Text style={styles.twistLabel}>{t.label}</Text>
            <Text style={styles.twistDesc}>{t.desc}</Text>
          </Pressable>
        ))}
        {!GEMINI_API_KEY && <Text style={styles.err}>Chưa có EXPO_PUBLIC_GEMINI_API_KEY — sẽ chạy MOCK MODE</Text>}
      </KeyboardAvoidingView>
    );
  }

  // Màn kết quả chấm điểm (P0-3, P1-8): thang cố định, tính từ phiên thật.
  if (showResult && result && scenario) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.resultPad}>
        <Text style={styles.h1}>Kết quả đàm phán</Text>
        <Text style={styles.sub}>Thang chấm cố định — tính từ phiên của bạn (không phải AI chấm).</Text>
        <Text style={styles.scoreBig}>{result.percent}%</Text>
        <Text style={styles.gradeText}>
          {result.grade} • {result.points}/{result.max} tiêu chí
        </Text>
        {agreedPrice != null ? (
          <Text style={styles.winSaved}>
            Phần chênh so với giá mục tiêu: {fmt(gain)}đ
          </Text>
        ) : null}
        <Text style={styles.sectionTitle}>Chấm từng tiêu chí</Text>
        {result.rules.map((r) => (
          <View key={r.id} style={styles.ruleRow}>
            <Text style={styles.ruleLabel}>
              {r.passed ? 'Đạt' : 'Chưa đạt'} — {r.label}
            </Text>
            {r.evidence ? <Text style={styles.ruleEvidence}>“{r.evidence}”</Text> : null}
            {!r.passed ? <Text style={styles.ruleTip}>Gợi ý: {r.tip}</Text> : null}
          </View>
        ))}
        {result.weakSentences.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Câu nào yếu + vì sao</Text>
            {result.weakSentences.map((w, i) => (
              <View key={i} style={styles.ruleRow}>
                <Text style={styles.ruleEvidence}>“{w.text}”</Text>
                <Text style={styles.ruleTip}>{w.why}</Text>
              </View>
            ))}
          </>
        ) : null}
        {result.lessons.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Bài học tâm lý rút ra</Text>
            {result.lessons.map((l, i) => (
              <Text key={i} style={styles.lessonText}>
                • {l}
              </Text>
            ))}
          </>
        ) : null}
        <Text style={styles.sectionTitle}>Lộ trình luyện tiếp</Text>
        <Text style={styles.lessonText}>
          Luyện tiếp: nêu giá cụ thể → gắn lợi ích với nhu cầu → giải đáp băn khoăn trước khi chốt. Mỗi phiên
          hoàn thành sẽ lưu vào tiến bộ trên máy này.
        </Text>
        <Pressable style={styles.bigBtn} onPress={restartSameScenario}>
          <Text style={styles.bigBtnText}>Luyện lại tình huống này</Text>
        </Pressable>
        <Pressable style={styles.bigBtn} onPress={onExit ?? backToSetup}>
          <Text style={styles.bigBtnText}>Về màn hình chính</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.screen}>
      {MOCK && (
        <View style={styles.mockBanner}>
          <Text style={styles.mockText}>KHÁCH MÔ PHỎNG — chế độ trình diễn</Text>
        </View>
      )}
      <View style={styles.header}>
        {onExit ? (
          <Pressable style={styles.backBtn} onPress={onExit}>
            <Text style={styles.backText}>‹ Trang chủ</Text>
          </Pressable>
        ) : null}
        <View style={styles.headerText}>
          <Text style={styles.h2}>
            Phòng 1 · Luyện bán hàng
          </Text>
          <Text style={styles.headerSub}>
            {twistLabel} • {scenario?.productName} • Niêm yết {fmt(scenario?.listedPrice ?? 0)}đ • Mức gần nhất: {fmt(currentPrice)}đ
          </Text>
        </View>
        <Pressable style={styles.muteBtn} onPress={() => setMuted((m) => !m)}>
          <Text style={styles.muteText}>{muted ? 'Tắt tiếng' : 'Bật tiếng'}</Text>
        </Pressable>
      </View>
      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={{ padding: 12, gap: 8 }}>
        {turns.map((t, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bubble,
              t.speaker === 'seller' ? styles.me : styles.them,
              i === turns.length - 1 && {
                opacity: messageEntry,
                transform: [{ translateY: messageEntry.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
              },
            ]}
          >
            <Text style={styles.speaker}>
              {t.speaker === 'seller' ? 'Bạn' : `Khách hàng${t.emotion ? ` · ${MOOD_LABEL[t.emotion]}` : ''}`}
            </Text>
            <Text style={styles.bubbleText}>{t.text}</Text>
            {t.price ? <Text style={styles.price}>→ {fmt(t.price)}đ</Text> : null}
          </Animated.View>
        ))}
        {busy && (
          <View style={styles.busyRow}>
            {busyPhase === 'customer' ? (
              <View style={styles.typingDots}>
                {typingDots.map((dot, i) => (
                  <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
                ))}
              </View>
            ) : (
              <ActivityIndicator />
            )}
            <Text style={styles.busyText}>
              {busyPhase === 'transcribe' ? 'Đang nghe lại…' : 'Khách hàng đang trả lời…'}
            </Text>
          </View>
        )}
        {error ? (
          <View style={styles.errBox}>
            <Text style={styles.err}>{error}</Text>
            {lastFailedText ? (
              <Pressable style={styles.retryBtn} onPress={retryLast}>
                <Text style={styles.retryText}>Thử lại</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
      {agreedPrice != null && scenario != null && (
        <Animated.View style={[styles.winCard, { transform: [{ scale: winPulse }] }]}>
          <Text style={styles.winTitle}>ĐƠN HÀNG ĐÃ CHỐT!</Text>
          <Text style={styles.winSaved}>Khách hàng đồng ý mua {scenario.productName}</Text>
          <Text style={styles.winPrice}>{fmt(agreedPrice)}đ</Text>
          <Text style={styles.winSaved}>Phần chênh so với giá mục tiêu: {fmt(gain)}đ</Text>
          {winQuote ? (
            <Text style={styles.winQuote}>Câu vàng: “{winQuote.text}” — {winQuote.author}</Text>
          ) : null}
          <Pressable
            style={styles.bigBtn}
            onPress={() => {
              const s = scenario ? scoreNegotiation(turns, scenario, agreedPrice) : null;
              if (s) setResult(s);
              setShowResult(true);
            }}
          >
            <Text style={styles.bigBtnText}>Xem chấm điểm</Text>
          </Pressable>
          <Pressable style={styles.bigBtn} onPress={backToSetup}>
            <Text style={styles.bigBtnText}>Thử băn khoăn khác →</Text>
          </Pressable>
        </Animated.View>
      )}
      <View style={styles.footer}>
        {recState.isRecording ? (
          <Text style={styles.recText}>Đang ghi âm {fmtTime(recSeconds)}</Text>
        ) : null}
        <View style={styles.textRow}>
          <TextInput
            style={styles.textInput}
            value={textDraft}
            onChangeText={setTextDraft}
            placeholder="Hoặc gõ tin nhắn…"
            returnKeyType="send"
            onSubmitEditing={sendText}
            editable={!busy && agreedPrice == null}
          />
          <Pressable
            style={[styles.sendBtn, (!textDraft.trim() || busy || agreedPrice != null) && styles.sendBtnDisabled]}
            onPress={sendText}
            disabled={!textDraft.trim() || busy || agreedPrice != null}
          >
            <Text style={styles.sendBtnText}>Gửi</Text>
          </Pressable>
        </View>
        <Animated.View style={{ transform: [{ scale: micPulse }] }}>
          <Pressable
            style={[styles.micBtn, recState.isRecording && styles.micBtnActive]}
            onPress={onRecordPress}
            disabled={busy || agreedPrice != null}
          >
            <Text style={styles.micText}>{recState.isRecording ? 'Bấm để gửi' : 'Bấm để nói'}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#101418' },
  pad: { padding: 20, justifyContent: 'center', gap: 10 },
  h1: { color: '#fff', fontSize: 28, fontWeight: '800' },
  h2: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sub: { color: '#9fb0bf', marginBottom: 10 },
  roomChip: {
    color: '#ffd43b',
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: '#243040',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  sectionHead: { color: '#fff', fontSize: 14, fontWeight: '800', marginTop: 8 },
  label: { color: '#9fb0bf', fontSize: 12, fontWeight: '700', marginBottom: -6 },
  progressStrip: { color: '#8ce99a', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  input: {
    backgroundColor: '#1b232b',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bigBtn: { backgroundColor: '#2f81f7', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  bigBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  header: {
    paddingTop: 48,
    paddingBottom: 8,
    paddingHorizontal: 14,
    borderBottomColor: '#232c35',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  headerText: { flex: 1 },
  headerSub: { color: '#9fb0bf', fontSize: 12, marginTop: 2 },
  muteBtn: { backgroundColor: '#243040', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  muteText: { fontSize: 16 },
  backBtn: { backgroundColor: '#243040', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  backText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  chat: { flex: 1 },
  bubble: { maxWidth: '85%', borderRadius: 14, padding: 10 },
  me: { alignSelf: 'flex-end', backgroundColor: '#2f81f7' },
  them: { alignSelf: 'flex-start', backgroundColor: '#243040' },
  speaker: { color: '#c3fae8', fontSize: 11, fontWeight: '800', marginBottom: 2 },
  bubbleText: { color: '#fff' },
  price: { color: '#8ce99a', fontWeight: '700', marginTop: 4 },
  busyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9fb0bf' },
  busyText: { color: '#9fb0bf', fontSize: 13 },
  errBox: { backgroundColor: '#2b1a1a', borderRadius: 10, padding: 10, gap: 8 },
  retryBtn: { backgroundColor: '#e03131', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  retryText: { color: '#fff', fontWeight: '700' },
  footer: { padding: 14, paddingBottom: 28, gap: 8 },
  recText: { color: '#ff8787', fontWeight: '700', textAlign: 'center' },
  textRow: { flexDirection: 'row', gap: 8 },
  textInput: {
    flex: 1,
    backgroundColor: '#1b232b',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendBtn: { backgroundColor: '#2f81f7', borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#243040' },
  sendBtnText: { color: '#fff', fontWeight: '700' },
  winCard: {
    position: 'absolute',
    bottom: 110,
    left: 12,
    right: 12,
    backgroundColor: '#0b2518',
    borderColor: '#2f9e44',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  winTitle: { color: '#8ce99a', fontWeight: '900', fontSize: 18 },
  winPrice: { color: '#fff', fontWeight: '800', fontSize: 26 },
  winSaved: { color: '#ffd43b', fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  winQuote: { color: '#c3fae8', fontSize: 13, fontStyle: 'italic', textAlign: 'center', marginTop: 8 },
  winSub: { color: '#c3fae8', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  mockBanner: { backgroundColor: '#e03131', paddingVertical: 6, alignItems: 'center', marginTop: 32 },
  mockText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  twistTitle: { color: '#9fb0bf', fontSize: 12, marginTop: 12 },
  twistBtn: { backgroundColor: '#243040', borderRadius: 10, padding: 10 },
  twistLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  twistDesc: { color: '#9fb0bf', fontSize: 11, marginTop: 2 },
  micBtn: { backgroundColor: '#243040', borderRadius: 24, paddingVertical: 16, alignItems: 'center' },
  micBtnActive: { backgroundColor: '#e03131' },
  micText: { color: '#fff', fontWeight: '700' },
  err: { color: '#ff8787', fontSize: 12 },
  resultPad: { padding: 20, paddingBottom: 40, gap: 10 },
  scoreBig: { color: '#ffd43b', fontSize: 56, fontWeight: '900', textAlign: 'center' },
  gradeText: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 12 },
  ruleRow: { backgroundColor: '#1b232b', borderRadius: 10, padding: 10, gap: 4 },
  ruleLabel: { color: '#fff', fontWeight: '700' },
  ruleEvidence: { color: '#c3fae8', fontSize: 13, fontStyle: 'italic' },
  ruleTip: { color: '#ffd43b', fontSize: 13 },
  lessonText: { color: '#e7f5ff', fontSize: 14, lineHeight: 20 },
});
