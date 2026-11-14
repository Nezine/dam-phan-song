import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import * as FileSystem from 'expo-file-system';
import { landlordTurn, transcribeAudio, GEMINI_API_KEY } from './src/lib/gemini';
import { groqLandlordTurn, GROQ_API_KEY } from './src/lib/groq';
import { mockLandlordTurn } from './src/lib/mock';
import { scoreNegotiation, type ScoreResult } from './src/lib/score';
import { loadProgress, recordSession, type Progress } from './src/lib/progress';
import type { Scenario, Turn } from './src/lib/types';

const fmt = (n: number) => n.toLocaleString('vi-VN');
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const MOCK = !GEMINI_API_KEY; // không có key → MOCK MODE (banner đỏ trên màn hình, không đem demo như AI thật)

const EMOJI: Record<NonNullable<Turn['emotion']>, string> = {
  friendly: '😊',
  neutral: '😐',
  annoyed: '😠',
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
    label: '1️⃣ Giá sàn cứng',
    desc: 'Chủ trọ chốt 3tr2, có người chờ cọc',
    city: 'Hà Nội',
    room: 'phòng trọ có gác lửng',
    listed: '3500000',
    floor: '3200000',
    opening: 'Giá này là giá sàn rồi em, dưới 3 triệu 2 anh không cho thuê đâu, có người khác đang chờ cọc rồi.',
  },
  {
    key: 'mold',
    label: '2️⃣ Phòng ẩm mốc',
    desc: 'Tường ẩm, chủ trọ gạt "ở được"',
    city: 'TP.HCM',
    room: 'phòng trọ 20m2',
    listed: '3000000',
    floor: '2700000',
    opening: 'Phòng này ở được em ơi, ai cũng ở vậy thôi, tường ẩm chút thì sơn lại là hết.',
  },
  {
    key: 'deposit',
    label: '3️⃣ Cọc 2 tháng',
    desc: 'Đóng 3 tháng/lần, tiền mặt ~20 triệu',
    city: 'Đà Nẵng',
    room: 'căn hộ mini 25m2',
    listed: '4000000',
    floor: '3600000',
    opening: 'Quy dãy em ơi, cọc 2 tháng, đóng 3 tháng một lần, tổng đâu vào khoảng 20 triệu.',
  },
];

export default function App() {
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
  const [textDraft, setTextDraft] = useState('');
  const [muted, setMuted] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const scrollRef = useRef<ScrollViewInstance | null>(null);
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
      if (reply.agreed && reply.agreedPrice && reply.agreedPrice >= scenario.floorPrice) setAgreedPrice(reply.agreedPrice);
      else speak(reply.message);
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
      if (!uri) return;
      try {
        setBusy(true);
        setBusyPhase('transcribe');
        setError(null);
        const file = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const transcript = await transcribeAudio(file, 'audio/mp4');
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
        setError(friendlyError(e));
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
  const twistLabel = TWISTS.find((t) => t.key === scenario?.twist)?.label ?? 'Thuê trọ';

  if (!started) {
    return (
      <KeyboardAvoidingView style={[styles.screen, styles.pad]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.h1}>🤝 Đàm Phán Sống</Text>
        <Text style={styles.sub}>Luyện kỹ năng đàm phán / nói chuyện khó — bằng giọng nói thật.</Text>
        {progress && progress.sessions > 0 ? (
          <Text style={styles.progressStrip}>
            📈 Tiến bộ: {progress.sessions} phiên • Tiết kiệm tổng {fmt(progress.totalSaved)}đ/tháng • Điểm tốt nhất{' '}
            {progress.bestScore}%
          </Text>
        ) : null}
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
        <Text style={styles.label}>Giá sàn của chủ trọ (bí mật — AI không chốt thấp hơn)</Text>
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
        <Text style={styles.twistTitle}>🎯 Luyện tình huống khó (giám khảo ra):</Text>
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
        <Text style={styles.h1}>📊 Kết quả đàm phán</Text>
        <Text style={styles.sub}>Thang chấm cố định — tính từ phiên của bạn (không phải AI chấm).</Text>
        <Text style={styles.scoreBig}>{result.percent}%</Text>
        <Text style={styles.gradeText}>
          {result.grade} • {result.points}/{result.max} tiêu chí
        </Text>
        {agreedPrice != null ? (
          <Text style={styles.winSaved}>
            💰 Tiết kiệm {fmt(saved)}đ/tháng = {fmt(saved * 12)}đ/năm
          </Text>
        ) : null}
        <Text style={styles.sectionTitle}>Chấm từng tiêu chí</Text>
        {result.rules.map((r) => (
          <View key={r.id} style={styles.ruleRow}>
            <Text style={styles.ruleLabel}>
              {r.passed ? '✅' : '❌'} {r.label}
            </Text>
            {r.evidence ? <Text style={styles.ruleEvidence}>“{r.evidence}”</Text> : null}
            {!r.passed ? <Text style={styles.ruleTip}>👉 {r.tip}</Text> : null}
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
          Luyện tiếp: mở đầu bằng số cụ thể → nêu 1 lý do → mặc cả điều khoản khi chủ trọ cứng giá. Mỗi phiên
          hoàn thành sẽ lưu vào tiến bộ trên máy này.
        </Text>
        <Pressable style={styles.bigBtn} onPress={restartSameScenario}>
          <Text style={styles.bigBtnText}>🔁 Đàm phán lại tình huống này</Text>
        </Pressable>
        <Pressable style={styles.bigBtn} onPress={backToSetup}>
          <Text style={styles.bigBtnText}>🏠 Về màn hình chính</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.screen}>
      {MOCK && (
        <View style={styles.mockBanner}>
          <Text style={styles.mockText}>⚠️ MOCK MODE — landlord giả, chỉ test UI</Text>
        </View>
      )}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.h2}>
            🏠 {scenario?.roomType} — {fmt(scenario?.listedPrice ?? 0)}đ/tháng
          </Text>
          <Text style={styles.headerSub}>
            {twistLabel} • Chủ trọ đang giữ: {fmt(currentPrice)}đ/tháng
          </Text>
        </View>
        <Pressable style={styles.muteBtn} onPress={() => setMuted((m) => !m)}>
          <Text style={styles.muteText}>{muted ? '🔇' : '🔊'}</Text>
        </Pressable>
      </View>
      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={{ padding: 12, gap: 8 }}>
        {turns.map((t, i) => (
          <View key={i} style={[styles.bubble, t.speaker === 'tenant' ? styles.me : styles.them]}>
            <Text style={styles.speaker}>
              {t.speaker === 'tenant' ? 'Bạn' : `Chủ trọ${t.emotion ? ` ${EMOJI[t.emotion]}` : ''}`}
            </Text>
            <Text style={styles.bubbleText}>{t.text}</Text>
            {t.price ? <Text style={styles.price}>→ {fmt(t.price)}đ/tháng</Text> : null}
          </View>
        ))}
        {busy && (
          <View style={styles.busyRow}>
            <ActivityIndicator />
            <Text style={styles.busyText}>
              {busyPhase === 'transcribe' ? 'Đang nghe lại…' : 'Chủ trọ đang trả lời…'}
            </Text>
          </View>
        )}
        {error ? (
          <View style={styles.errBox}>
            <Text style={styles.err}>{error}</Text>
            {lastFailedText ? (
              <Pressable style={styles.retryBtn} onPress={retryLast}>
                <Text style={styles.retryText}>🔁 Thử lại</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
      {agreedPrice != null && (
        <View style={styles.winCard}>
          <Text style={styles.winTitle}>✅ CHỐT ĐƯỢC RỒI!</Text>
          <Text style={styles.winPrice}>{fmt(agreedPrice)}đ/tháng</Text>
          {saved > 0 ? (
            <Text style={styles.winSaved}>💰 Tiết kiệm {fmt(saved)}đ/tháng = {fmt(saved * 12)}đ/năm</Text>
          ) : scenario?.twist === 'deposit' ? (
            <Text style={styles.winSaved}>✅ Chốt ở giá rao — thành công nhờ điều khoản thanh toán</Text>
          ) : (
            <Text style={styles.winSaved}>🤝 Chốt ở giá rao — lần sau thử đưa giá mục tiêu + lý do để mặc cả nhé</Text>
          )}
          {scenario?.twist === 'deposit' ? (
            <Text style={styles.winSub}>
              Tiền mặt ban đầu: {fmt(upfrontBefore)}đ → {fmt(upfrontAfter)}đ (cọc 1 tháng, đóng theo tháng)
            </Text>
          ) : null}
          <Pressable
            style={styles.bigBtn}
            onPress={() => {
              const s = scenario ? scoreNegotiation(turns, scenario, agreedPrice) : null;
              if (s) setResult(s);
              setShowResult(true);
            }}
          >
            <Text style={styles.bigBtnText}>📊 Xem chấm điểm</Text>
          </Pressable>
          <Pressable style={styles.bigBtn} onPress={backToSetup}>
            <Text style={styles.bigBtnText}>Đàm phán tình huống khác →</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.footer}>
        {recState.isRecording ? (
          <Text style={styles.recText}>🔴 Đang ghi âm {fmtTime(recSeconds)}</Text>
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
        <Pressable
          style={[styles.micBtn, recState.isRecording && styles.micBtnActive]}
          onPress={onRecordPress}
          disabled={busy || agreedPrice != null}
        >
          <Text style={styles.micText}>{recState.isRecording ? '⏹ Bấm để gửi' : '🎤 Bấm để nói'}</Text>
        </Pressable>
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
  chat: { flex: 1 },
  bubble: { maxWidth: '85%', borderRadius: 14, padding: 10 },
  me: { alignSelf: 'flex-end', backgroundColor: '#2f81f7' },
  them: { alignSelf: 'flex-start', backgroundColor: '#243040' },
  speaker: { color: '#c3fae8', fontSize: 11, fontWeight: '800', marginBottom: 2 },
  bubbleText: { color: '#fff' },
  price: { color: '#8ce99a', fontWeight: '700', marginTop: 4 },
  busyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
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
