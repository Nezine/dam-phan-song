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
import type { Scenario, Turn } from './src/lib/types';

const fmt = (n: number) => n.toLocaleString('vi-VN');

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

  const startNegotiation = () => {
    const s: Scenario = {
      tenantName: tenantName.trim() || 'bạn',
      city: city.trim() || 'TP.HCM',
      roomType: roomType.trim() || 'phòng trọ',
      listedPrice: Number(listedPrice) || 3500000,
      floorPrice: Number(floorPrice) || 3000000,
      moveIn: 'tháng tới',
    };
    setScenario(s);
    setTurns([]);
    setError(null);
    setStarted(true);
  };

  const sendToLandlord = async (tenantText: string) => {
    if (!scenario) return;
    setBusy(true);
    setError(null);
    setTurns((t) => [...t, { speaker: 'tenant', text: tenantText }]);
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
        <Pressable style={styles.bigBtn} onPress={startNegotiation}>
          <Text style={styles.bigBtnText}>Bắt đầu đàm phán →</Text>
        </Pressable>
        {!GEMINI_API_KEY && <Text style={styles.err}>Chưa có EXPO_PUBLIC_GEMINI_API_KEY</Text>}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.screen}>
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
          <Text style={styles.winSaved}>💰 Tiết kiệm {fmt(saved)}đ/tháng = {fmt(saved * 12)}đ/năm</Text>
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
  winSaved: { color: '#ffd43b', fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  micBtn: { backgroundColor: '#243040', borderRadius: 24, paddingVertical: 16, alignItems: 'center' },
  micBtnActive: { backgroundColor: '#e03131' },
  micText: { color: '#fff', fontWeight: '700' },
  err: { color: '#ff8787', fontSize: 12 },
});
