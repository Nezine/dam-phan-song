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
import { landlordTurn, transcribeAudio, mimeTypeForAudioUri, GEMINI_API_KEY } from './src/lib/gemini';
import { groqLandlordTurn, GROQ_API_KEY } from './src/lib/groq';
import { mockLandlordTurn } from './src/lib/mock';
import { scoreNegotiation, type ScoreResult } from './src/lib/score';
import { AppIcon } from './src/components/icons';
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

// Mặt đối phương theo tâm trạng — icon có nghĩa, đi kèm chữ (không thay chữ).
const MOOD_ICON: Record<NonNullable<Turn['emotion']>, { name: 'face-smile' | 'face-neutral' | 'face-annoyed'; color: string }> = {
  friendly: { name: 'face-smile', color: '#8ce99a' },
  neutral: { name: 'face-neutral', color: '#9fb0bf' },
  annoyed: { name: 'face-annoyed', color: '#ff8787' },
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

const TWISTS: { key: Scenario['twist']; label: string; desc: string; city: string; room: string; listed: string; floor: string; opening: string }[] = [
  {
    key: 'hardline',
    label: '1. Phòng 1 · Giá sàn cứng',
    desc: 'Đối phương chốt 3tr2, có người chờ cọc',
    city: 'Hà Nội',
    room: 'phòng trọ có gác lửng',
    listed: '3500000',
    floor: '3200000',
    opening: 'Giá này là giá sàn rồi em, dưới 3 triệu 2 anh không cho thuê đâu, có người khác đang chờ cọc rồi.',
  },
  {
    key: 'mold',
    label: '2. Phòng 1 · Phòng ẩm mốc',
    desc: 'Tường ẩm, đối phương gạt "ở được"',
    city: 'TP.HCM',
    room: 'phòng trọ 20m2',
    listed: '3000000',
    floor: '2700000',
    opening: 'Phòng này ở được em ơi, ai cũng ở vậy thôi, tường ẩm chút thì sơn lại là hết.',
  },
  {
    key: 'deposit',
    label: '3. Phòng 1 · Cọc 2 tháng',
    desc: 'Đóng 3 tháng/lần, tiền mặt ~20 triệu',
    city: 'Đà Nẵng',
    room: 'căn hộ mini 25m2',
    listed: '4000000',
    floor: '3600000',
    opening: 'Quy dãy em ơi, cọc 2 tháng, đóng 3 tháng một lần, tổng đâu vào khoảng 20 triệu.',
  },
];

export default function App({ onExit, quickStart }: { onExit?: () => void; quickStart?: boolean }) {
  // --- setup state (đơn giản hóa cho demo: nhập trước khi bấm Bắt đầu) ---
  const [started, setStarted] = useState(false);
  const [tenantName, setTenantName] = useState('Minh');
  const [city, setCity] = useState('TP.HCM');
  const [roomType, setRoomType] = useState('phòng trọ có gác lửng');
  const [listedPrice, setListedPrice] = useState('3500000');
  const [floorPrice, setFloorPrice] = useState('3000000');

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [busyPhase, setBusyPhase] = useState<'transcribe' | 'landlord' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const [agreedPrice, setAgreedPrice] = useState<number | null>(null);
  // Câu vàng: chọn 1 lần mỗi khi chốt giá (đổi theo số vòng đã nói).
  const winQuote = useMemo(() => (agreedPrice == null ? null : randomQuote(turns.length * 7 + agreedPrice)), [agreedPrice]);
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
    if (busyPhase !== 'landlord') return;
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
    recordSession(scenario.listedPrice - agreedPrice, s.percent)
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
      tenantName: tenantName.trim() || 'bạn',
      city: preset?.city ?? (city.trim() || 'Hà Nội'),
      roomType: preset?.room ?? (roomType.trim() || 'phòng trọ'),
      listedPrice: Number(preset?.listed ?? listedPrice) || 3500000,
      floorPrice: Number(preset?.floor ?? floorPrice) || 3000000,
      moveIn: 'tháng tới',
      twist: preset?.key,
      opening: preset?.opening,
    };
    resetSession();
    setScenario(s);
    setStarted(true);
    if (s.opening) {
      const opening: Turn = { speaker: 'landlord', text: s.opening };
      setTurns([opening]);
      speak(s.opening);
    }
  };

  // Đàm phán lại cùng tình huống khó (giữ twist cho giám khảo).
  const restartSameScenario = () => {
    const preset = TWISTS.find((t) => t.key === scenario?.twist);
    startNegotiation(preset);
  };

  // Luyện nhanh 1 phút (retention spec #2): vào thẳng preset 1, không qua
  // màn chuẩn bị — chỉ chạy 1 lần khi AppShell mở bằng nút Luyện nhanh.
  const quickStartedRef = useRef(false);
  useEffect(() => {
    if (!quickStart || quickStartedRef.current) return;
    quickStartedRef.current = true;
    startNegotiation(TWISTS[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickStart]);

  // Gọi chủ trọ (không thêm lượt người thuê — dùng cho Thử lại, P0-5).
  const callLandlord = async (tenantText: string) => {
    if (!scenario) return;
    setBusy(true);
    setBusyPhase('landlord');
    if (MOCK) {
      // MOCK MODE: luật cứng, không gọi API
      const reply = mockLandlordTurn(scenario, turns, tenantText);
      setTurns((t) => [
        ...t,
        { speaker: 'landlord', text: reply.message, price: reply.currentPrice ?? undefined, emotion: reply.emotion },
      ]);
      if (reply.agreed && reply.agreedPrice && reply.agreedPrice >= scenario.floorPrice) {
        setAgreedPrice(reply.agreedPrice);
      } else if (reply.agreed && reply.agreedPrice) {
        // Chủ trọ đồng ý dưới sàn — không chốt được: nói rõ để người chơi đề
        // nghị lại, thay vì nuốt im (trước đây landlord nói "chốt rồi" nhưng
        // không có thẻ thắng / màn hình điểm).
        const msg = `Giá ${reply.agreedPrice.toLocaleString('vi-VN')}đ thấp hơn sàn rồi, không chốt được đâu em — đề nghị lại giúp anh nhé.`;
        setTurns((t) => [...t, { speaker: 'landlord', text: msg, emotion: 'annoyed' }]);
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
        reply = await landlordTurn(scenario, turns, tenantText);
      } catch (geminiErr) {
        if (!GROQ_API_KEY) throw geminiErr;
        usedFallback = true;
        reply = await groqLandlordTurn(scenario, turns, tenantText);
      }
    } catch (e) {
      setLastFailedText(tenantText);
      setError(friendlyError(e));
      setBusy(false);
      setBusyPhase(null);
      return;
    }
    setTurns((t) => [
      ...t,
      { speaker: 'landlord', text: reply.message, price: reply.currentPrice ?? undefined, emotion: reply.emotion },
    ]);
    if (reply.agreed && reply.agreedPrice && reply.agreedPrice >= scenario.floorPrice) {
      setAgreedPrice(reply.agreedPrice);
    } else if (reply.agreed && reply.agreedPrice) {
      // Chủ trọ (AI) đồng ý dưới sàn — không chốt được: nói rõ để người chơi
      // đề nghị lại, thay vì nuốt im (landlord nói "chốt rồi" nhưng không có
      // thẻ thắng / màn hình điểm).
      const msg = `Giá ${reply.agreedPrice.toLocaleString('vi-VN')}đ thấp hơn sàn rồi, không chốt được đâu em — đề nghị lại giúp anh nhé.`;
      setTurns((t) => [...t, { speaker: 'landlord', text: msg, emotion: 'annoyed' }]);
      speak(msg);
    } else {
      speak(reply.message);
    }
    if (usedFallback) console.log('[fallback] dùng Groq');
    setBusy(false);
    setBusyPhase(null);
  };

  const sendToLandlord = async (tenantText: string) => {
    if (!scenario) return;
    const text = tenantText.trim();
    if (!text) return;
    setBusy(true);
    setBusyPhase('landlord');
    setError(null);
    setLastFailedText(null);
    setTurns((t) => [...t, { speaker: 'tenant', text }]);
    await callLandlord(text);
  };

  const retryLast = () => {
    const t = lastFailedText;
    if (!t) return;
    setError(null);
    setLastFailedText(null);
    void callLandlord(t);
  };

  // Nhập text dự phòng khi voice lỗi (P0-2).
  const sendText = () => {
    const t = textDraft.trim();
    if (!t || busy || agreedPrice != null) return;
    setTextDraft('');
    void sendToLandlord(t);
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
        await sendToLandlord(transcript);
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

  const saved = agreedPrice != null && scenario ? scenario.listedPrice - agreedPrice : 0;
  // twist "cọc 2 tháng": tiền mặt ban đầu trước/sau khi đàm phán điều khoản
  const upfrontBefore = agreedPrice != null && scenario ? scenario.listedPrice * 5 : 0; // cọc 2 tháng + đóng 3 tháng
  const upfrontAfter = agreedPrice != null && scenario ? agreedPrice * 2 : 0; // cọc 1 tháng + đóng tháng đầu

  // Giá chủ trọ đang giữ (P1-7): lượt landlord gần nhất có giá, nếu không thì giá rao.
  const lastPriced = [...turns].reverse().find((t) => t.price != null);
  const currentPrice = lastPriced?.price ?? scenario?.listedPrice ?? 0;
  const twistLabel = TWISTS.find((t) => t.key === scenario?.twist)?.label ?? 'Phòng 1 · Thuê trọ';

  if (!started) {
    return (
      <KeyboardAvoidingView style={[styles.screen, styles.pad]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {onExit ? (
          <Pressable style={[styles.backBtn, { alignSelf: 'flex-start' }]} onPress={onExit}>
            <Text style={styles.backText}>‹ Trang chủ</Text>
          </Pressable>
        ) : null}
        <View style={styles.titleRow}>
          <AppIcon name="deal" size={30} color="#2f81f7" />
          <Text style={styles.h1}>Đàm Phán Sống</Text>
        </View>
        <Text style={styles.sub}>Luyện kỹ năng đàm phán / nói chuyện khó — bằng giọng nói thật.</Text>
        <Text style={styles.roomChip}>Phòng 1 · Đàm phán tiền trọ — phòng tập đầu tiên trong 5 phòng luyện nói chuyện khó.</Text>
        {progress && progress.sessions > 0 ? (
          <Text style={styles.progressStrip}>
            Tiến bộ: {progress.sessions} phiên • Tiết kiệm tổng {fmt(progress.totalSaved)}đ • Điểm tốt nhất{' '}
            {progress.bestScore}%
          </Text>
        ) : null}
        <Text style={styles.sectionHead}>Thiết lập tình huống — Phòng 1</Text>
        <Text style={styles.label}>Tên bạn</Text>
        <TextInput style={styles.input} value={tenantName} onChangeText={setTenantName} placeholder="Minh" />
        <Text style={styles.label}>Thành phố</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="TP.HCM" />
        <Text style={styles.label}>Loại phòng</Text>
        <TextInput style={styles.input} value={roomType} onChangeText={setRoomType} placeholder="phòng trọ có gác lửng" />
        <Text style={styles.label}>Giá rao (đ/tháng)</Text>
        <TextInput
          style={styles.input}
          value={listedPrice}
          onChangeText={setListedPrice}
          placeholder="3500000"
          keyboardType="number-pad"
        />
        <Text style={styles.label}>Giá sàn của đối phương (bí mật — AI không chốt thấp hơn)</Text>
        <TextInput
          style={styles.input}
          value={floorPrice}
          onChangeText={setFloorPrice}
          placeholder="3000000"
          keyboardType="number-pad"
        />
        <Pressable style={styles.bigBtn} onPress={() => startNegotiation()}>
          <Text style={styles.bigBtnText}>Bắt đầu đàm phán →</Text>
        </Pressable>
        <Text style={styles.twistTitle}>Phòng 1 — Luyện tình huống khó:</Text>
        {TWISTS.map((t) => (
          <Pressable key={t.key} style={styles.twistBtn} onPress={() => startNegotiation(t)}>
            <AppIcon name="target" size={20} color="#2f81f7" />
            <View style={styles.twistTextCol}>
              <Text style={styles.twistLabel}>{t.label}</Text>
              <Text style={styles.twistDesc}>{t.desc}</Text>
            </View>
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
        <View style={styles.scoreHero}>
          <AppIcon name="trophy" size={36} color="#ffd43b" />
        </View>
        <Text style={styles.scoreBig}>{result.percent}%</Text>
        <Text style={styles.gradeText}>
          {result.grade} • {result.points}/{result.max} tiêu chí
        </Text>
        {agreedPrice != null ? (
          <Text style={styles.winSaved}>
            Tiết kiệm {fmt(saved)}đ/tháng = {fmt(saved * 12)}đ/năm
          </Text>
        ) : null}
        <Text style={styles.sectionTitle}>Chấm từng tiêu chí</Text>
        {result.rules.map((r) => (
          <View key={r.id} style={styles.ruleRow}>
            <View style={styles.ruleHead}>
              <AppIcon name={r.passed ? 'check' : 'x'} size={18} color={r.passed ? '#8ce99a' : '#ff8787'} />
              <Text style={styles.ruleLabel}>
                {r.passed ? 'Đạt' : 'Chưa đạt'} — {r.label}
              </Text>
            </View>
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
          Luyện tiếp: mở đầu bằng số cụ thể → nêu 1 lý do → mặc cả điều khoản khi đối phương cứng giá. Mỗi phiên
          hoàn thành sẽ lưu vào tiến bộ trên máy này.
        </Text>
        <Pressable style={styles.bigBtn} onPress={restartSameScenario}>
          <Text style={styles.bigBtnText}>Đàm phán lại tình huống này</Text>
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
          <Text style={styles.mockText}>MOCK MODE — đối phương giả, chỉ test UI</Text>
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
            Phòng 1 · Luyện đàm phán
          </Text>
          <Text style={styles.headerSub}>
            {twistLabel} • {scenario?.roomType} {fmt(scenario?.listedPrice ?? 0)}đ/tháng • Đối phương đang giữ: {fmt(currentPrice)}đ/tháng
          </Text>
        </View>
        <Pressable style={styles.muteBtn} onPress={() => setMuted((m) => !m)}>
          <View style={styles.btnRowSm}>
            <AppIcon name={muted ? 'volume-off' : 'volume-on'} size={16} color={muted ? '#9fb0bf' : '#fff'} />
            <Text style={styles.muteText}>{muted ? 'Tắt tiếng' : 'Bật tiếng'}</Text>
          </View>
        </Pressable>
      </View>
      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={{ padding: 12, gap: 8 }}>
        {turns.map((t, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bubble,
              t.speaker === 'tenant' ? styles.me : styles.them,
              i === turns.length - 1 && {
                opacity: messageEntry,
                transform: [{ translateY: messageEntry.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
              },
            ]}
          >
            <View style={styles.speakerRow}>
              {t.speaker === 'landlord' && t.emotion ? (
                <AppIcon name={MOOD_ICON[t.emotion].name} size={14} color={MOOD_ICON[t.emotion].color} />
              ) : null}
              <Text style={styles.speaker}>
                {t.speaker === 'tenant' ? 'Bạn' : `Đối phương${t.emotion ? ` · ${MOOD_LABEL[t.emotion]}` : ''}`}
              </Text>
            </View>
            <Text style={styles.bubbleText}>{t.text}</Text>
            {t.price ? <Text style={styles.price}>→ {fmt(t.price)}đ/tháng</Text> : null}
          </Animated.View>
        ))}
        {busy && (
          <View style={styles.busyRow}>
            {busyPhase === 'landlord' ? (
              <View style={styles.typingDots}>
                {typingDots.map((dot, i) => (
                  <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
                ))}
              </View>
            ) : (
              <ActivityIndicator />
            )}
            <Text style={styles.busyText}>
              {busyPhase === 'transcribe' ? 'Đang nghe lại…' : 'Đối phương đang trả lời…'}
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
      {agreedPrice != null && (
        <Animated.View style={[styles.winCard, { transform: [{ scale: winPulse }] }]}>
          <AppIcon name="trophy" size={40} color="#ffd43b" />
          <Text style={styles.winTitle}>CHỐT ĐƯỢC RỒI!</Text>
          <Text style={styles.winPrice}>{fmt(agreedPrice)}đ/tháng</Text>
          {saved > 0 ? (
            <Text style={styles.winSaved}>Tiết kiệm {fmt(saved)}đ/tháng = {fmt(saved * 12)}đ/năm</Text>
          ) : scenario?.twist === 'deposit' ? (
            <Text style={styles.winSaved}>Chốt ở giá rao — thành công nhờ điều khoản thanh toán</Text>
          ) : (
            <Text style={styles.winSaved}>Chốt ở giá rao — lần sau thử đưa giá mục tiêu + lý do để mặc cả nhé</Text>
          )}
          {scenario?.twist === 'deposit' ? (
            <Text style={styles.winSub}>
              Tiền mặt ban đầu: {fmt(upfrontBefore)}đ → {fmt(upfrontAfter)}đ (cọc 1 tháng, đóng theo tháng)
            </Text>
          ) : null}
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
            <View style={styles.btnRow}>
              <AppIcon name="chart-bar" size={18} color="#fff" />
              <Text style={styles.bigBtnText}>Xem chấm điểm</Text>
            </View>
          </Pressable>
          <Pressable style={styles.bigBtn} onPress={backToSetup}>
            <Text style={styles.bigBtnText}>Đàm phán tình huống khác →</Text>
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
            <View style={styles.btnRow}>
              <AppIcon
                name={recState.isRecording ? 'stop' : 'mic'}
                size={18}
                color={recState.isRecording ? '#ff8787' : '#fff'}
              />
              <Text style={styles.micText}>{recState.isRecording ? 'Bấm để gửi' : 'Bấm để nói'}</Text>
            </View>
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
    borderColor: '#232c35',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnRowSm: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bigBtn: { backgroundColor: '#2f81f7', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
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
  muteText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  backBtn: { backgroundColor: '#243040', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  backText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  chat: { flex: 1 },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 12 },
  me: { alignSelf: 'flex-end', backgroundColor: '#2f81f7', borderBottomRightRadius: 4 },
  them: { alignSelf: 'flex-start', backgroundColor: '#243040', borderBottomLeftRadius: 4 },
  speakerRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  speaker: { color: '#c3fae8', fontSize: 11, fontWeight: '800' },
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
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  winTitle: { color: '#8ce99a', fontWeight: '900', fontSize: 20, letterSpacing: 1 },
  winPrice: { color: '#fff', fontWeight: '800', fontSize: 30 },
  winSaved: { color: '#ffd43b', fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  winSub: { color: '#c3fae8', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  winQuote: { color: '#c3fae8', fontSize: 13, fontStyle: 'italic', textAlign: 'center', marginTop: 8 },
  mockBanner: { backgroundColor: '#e03131', paddingVertical: 6, alignItems: 'center', marginTop: 32 },
  mockText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  twistTitle: { color: '#9fb0bf', fontSize: 12, fontWeight: '700', marginTop: 12 },
  twistBtn: {
    backgroundColor: '#1b232b',
    borderColor: '#232c35',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  twistTextCol: { flex: 1, gap: 2 },
  twistLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  twistDesc: { color: '#9fb0bf', fontSize: 12, lineHeight: 16 },
  micBtn: { backgroundColor: '#243040', borderRadius: 24, paddingVertical: 16, alignItems: 'center' },
  micBtnActive: { backgroundColor: '#e03131' },
  micText: { color: '#fff', fontWeight: '700' },
  err: { color: '#ff8787', fontSize: 12 },
  resultPad: { padding: 20, paddingBottom: 40, gap: 10 },
  scoreHero: { alignItems: 'center', marginTop: 8 },
  scoreBig: { color: '#ffd43b', fontSize: 64, fontWeight: '900', textAlign: 'center', marginTop: -4 },
  gradeText: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 12 },
  ruleRow: { backgroundColor: '#1b232b', borderColor: '#232c35', borderWidth: 1, borderRadius: 12, padding: 12, gap: 4 },
  ruleHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleLabel: { color: '#fff', fontWeight: '700', flex: 1 },
  ruleEvidence: { color: '#c3fae8', fontSize: 13, fontStyle: 'italic' },
  ruleTip: { color: '#ffd43b', fontSize: 13 },
  lessonText: { color: '#e7f5ff', fontSize: 14, lineHeight: 20 },
});
