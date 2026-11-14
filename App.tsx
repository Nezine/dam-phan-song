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
import type { Scenario, Turn } from './src/lib/types';

const fmt = (n: number) => n.toLocaleString('vi-VN');

const MOCK = !GEMINI_API_KEY; // không có key → MOCK MODE (banner đỏ trên màn hình, không đem demo như AI thật)

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
    desc: 'Đóng 3 tháng/lần, tiền mặt ~10tr',
    city: 'Đà Nẵng',
    room: 'căn hộ mini 25m2',
    listed: '4000000',
    floor: '3600000',
    opening: 'Quy dãy em ơi, cọc 2 tháng, đóng 3 tháng một lần, tổng đâu vào khoảng 10 triệu.',
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
  const [error, setError] = useState<string | null>(null);
  const [agreedPrice, setAgreedPrice] = useState<number | null>(null);
  const scrollRef = useRef<ScrollViewInstance | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recState = useAudioRecorderState(recorder);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) setError('Chưa có quyền micro');
      await setAudioModeAsync({ playsInSilentMode: false, allowsRecording: true });
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [turns]);

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
    setScenario(s);
    setTurns([]);
    setAgreedPrice(null);
    setError(null);
    setStarted(true);
    if (s.opening) {
      const opening: Turn = { speaker: 'landlord', text: s.opening };
      setTurns([opening]);
      Speech.speak(s.opening, { language: 'vi-VN', rate: 1.0 });
    }
  };

  const sendToLandlord = async (tenantText: string) => {
    if (!scenario) return;
    setBusy(true);
    setError(null);
    setTurns((t) => [...t, { speaker: 'tenant', text: tenantText }]);
    if (MOCK) {
      // MOCK MODE: luật cứng, không gọi API
      const reply = mockLandlordTurn(scenario, turns, tenantText);
      setTurns((t) => [
        ...t,
        { speaker: 'landlord', text: reply.message, price: reply.currentPrice ?? undefined },
      ]);
      if (reply.agreed && reply.agreedPrice) setAgreedPrice(reply.agreedPrice);
      else Speech.speak(reply.message, { language: 'vi-VN', rate: 1.0 });
      setBusy(false);
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
      setError(String(e));
      setBusy(false);
      return;
    }
    setTurns((t) => [
      ...t,
      { speaker: 'landlord', text: reply.message, price: reply.currentPrice ?? undefined },
    ]);
    if (reply.agreed && reply.agreedPrice) {
      setAgreedPrice(reply.agreedPrice);
    } else {
      Speech.speak(reply.message, { language: 'vi-VN', rate: 1.0 });
    }
    if (usedFallback) console.log('[fallback] dùng Groq');
    setBusy(false);
  };

  const onRecordPress = async () => {
    if (recState.isRecording) {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) return;
      try {
        setBusy(true);
        const file = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const transcript = await transcribeAudio(file, 'audio/mp4');
        await sendToLandlord(transcript);
      } catch (e) {
        setError(String(e));
        setBusy(false);
      }
    } else {
      setError(null);
      await recorder.prepareToRecordAsync();
      recorder.record();
    }
  };

  const saved = agreedPrice != null && scenario ? scenario.listedPrice - agreedPrice : 0;
  // twist "cọc 2 tháng": tiền mặt ban đầu trước/sau khi đàm phán điều khoản
  const upfrontBefore = agreedPrice != null && scenario ? scenario.listedPrice * 5 : 0; // cọc 2 tháng + đóng 3 tháng
  const upfrontAfter = agreedPrice != null && scenario ? agreedPrice * 2 : 0; // cọc 1 tháng + đóng tháng đầu

  if (!started) {
    return (
      <KeyboardAvoidingView style={[styles.screen, styles.pad]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.h1}>🤝 Đàm Phán Sống</Text>
        <Text style={styles.sub}>Luyện đàm phán giá trọ với chủ trọ AI — bằng giọng nói thật.</Text>
        <TextInput style={styles.input} value={tenantName} onChangeText={setTenantName} placeholder="Tên bạn" />
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Thành phố" />
        <TextInput style={styles.input} value={roomType} onChangeText={setRoomType} placeholder="Loại phòng" />
        <TextInput
          style={styles.input}
          value={listedPrice}
          onChangeText={setListedPrice}
          placeholder="Giá rao (đ/tháng)"
          keyboardType="number-pad"
        />
        <TextInput
          style={styles.input}
          value={floorPrice}
          onChangeText={setFloorPrice}
          placeholder="Giá bạn muốn chốt (đ/tháng)"
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

  return (
    <View style={styles.screen}>
      {MOCK && (
        <View style={styles.mockBanner}>
          <Text style={styles.mockText}>⚠️ MOCK MODE — landlord giả, chỉ test UI</Text>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.h2}>
          🏠 {scenario?.roomType} — {fmt(scenario?.listedPrice ?? 0)}đ/tháng
        </Text>
      </View>
      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={{ padding: 12, gap: 8 }}>
        {turns.map((t, i) => (
          <View key={i} style={[styles.bubble, t.speaker === 'tenant' ? styles.me : styles.them]}>
            <Text style={styles.bubbleText}>{t.text}</Text>
            {t.price ? <Text style={styles.price}>→ {fmt(t.price)}đ/tháng</Text> : null}
          </View>
        ))}
        {busy && <ActivityIndicator />}
        {error ? <Text style={styles.err}>{error}</Text> : null}
      </ScrollView>
      {agreedPrice != null && (
        <View style={styles.winCard}>
          <Text style={styles.winTitle}>✅ CHỐT ĐƯỢC RỒI!</Text>
          <Text style={styles.winPrice}>{fmt(agreedPrice)}đ/tháng</Text>
          {saved > 0 ? (
            <Text style={styles.winSaved}>💰 Tiết kiệm {fmt(saved)}đ/tháng = {fmt(saved * 12)}đ/năm</Text>
          ) : (
            <Text style={styles.winSaved}>✅ Chốt ở giá rao — thành công nhờ điều khoản thanh toán</Text>
          )}
          {scenario?.twist === 'deposit' ? (
            <Text style={styles.winSub}>
              Tiền mặt ban đầu: {fmt(upfrontBefore)}đ → {fmt(upfrontAfter)}đ (cọc 1 tháng, đóng theo tháng)
            </Text>
          ) : null}
          <Pressable style={styles.bigBtn} onPress={() => { setAgreedPrice(null); setTurns([]); }}>
            <Text style={styles.bigBtnText}>Đàm phán tình huống khác →</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.footer}>
        <Pressable
          style={[styles.micBtn, recState.isRecording && styles.micBtnActive]}
          onPress={onRecordPress}
          disabled={busy}
        >
          <Text style={styles.micText}>{recState.isRecording ? '⏹ Nhả ra để gửi' : '🎤 Giữ lịch sự: nói xong bấm gửi'}</Text>
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
  input: {
    backgroundColor: '#1b232b',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bigBtn: { backgroundColor: '#2f81f7', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  bigBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  header: { paddingTop: 48, paddingBottom: 8, paddingHorizontal: 14, borderBottomColor: '#232c35', borderBottomWidth: 1 },
  chat: { flex: 1 },
  bubble: { maxWidth: '85%', borderRadius: 14, padding: 10 },
  me: { alignSelf: 'flex-end', backgroundColor: '#2f81f7' },
  them: { alignSelf: 'flex-start', backgroundColor: '#243040' },
  bubbleText: { color: '#fff' },
  price: { color: '#8ce99a', fontWeight: '700', marginTop: 4 },
  footer: { padding: 14, paddingBottom: 28 },
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
});
