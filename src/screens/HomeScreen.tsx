// Màn Home — điểm vào của app.
// Khung rộng: app luyện kỹ năng đàm phán (nói chuyện khó), thuê trọ chỉ là Phòng 1.
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RoomId } from '../lib/rooms';
import { ROOMS } from '../lib/rooms';
import type { RoomProgress } from '../lib/roomProgress';

type Props = {
  progress: RoomProgress;
  onOpenMap: () => void;
  onStartRoom: (roomId: RoomId) => void;
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function LevelRing({ level, percent }: { level: number; percent: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: percent,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [percent, progress]);

  const rotation = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={styles.levelRing}
      accessibilityRole="progressbar"
      accessibilityLabel={`Cấp ${level}, ${percent}% XP đến cấp tiếp theo`}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
    >
      <View style={styles.levelRingTrack} />
      <Animated.View style={[styles.levelRingMarkerTrack, { transform: [{ rotate: rotation }] }]}>
        <View style={styles.levelRingMarker} />
      </Animated.View>
      <Text style={styles.levelRingValue}>{level}</Text>
    </View>
  );
}

export default function HomeScreen({ progress, onOpenMap, onStartRoom }: Props) {
  const currentRoom = ROOMS.find((r) => r.id === progress.currentRoomId) ?? ROOMS[0];
  const xpPct = Math.min(100, Math.round((progress.xp / progress.xpForNextLevel) * 100));
  const suggested = currentRoom.scenarios[0];
  const xpProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(xpProgress, {
      toValue: xpPct,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [xpPct, xpProgress]);

  const xpWidth = xpProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.pad}>
      <Text style={styles.h1}>{greeting()}, Minh</Text>
      <Text style={styles.sub}>Luyện nói chuyện khó — mỗi ngày một vòng.</Text>

      {/* Luyện hôm nay */}
      <View style={styles.todayCard}>
        <Text style={styles.cardLabel}>LUYỆN HÔM NAY</Text>
        <Text style={styles.todayTitle}>{currentRoom.title}</Text>
        <Text style={styles.todayDesc}>Tình huống gợi ý: “{suggested}” — {currentRoom.tagline.toLowerCase()}.</Text>
        <Pressable style={styles.bigBtn} onPress={() => onStartRoom(currentRoom.id)}>
          <Text style={styles.bigBtnText}>Luyện ngay →</Text>
        </Pressable>
      </View>

      {/* Tóm tắt tiến bộ */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{progress.streakDays}</Text>
          <Text style={styles.statLabel}>ngày liên tiếp</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{progress.sessionsThisWeek}</Text>
          <Text style={styles.statLabel}>buổi tuần này</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>
            {progress.roomsCompleted.length}/{ROOMS.length}
          </Text>
          <Text style={styles.statLabel}>phòng xong</Text>
        </View>
      </View>
      <View style={styles.levelBox}>
        <View style={styles.levelRow}>
          <View style={styles.levelMeta}>
            <Text style={styles.levelText}>Cấp</Text>
            <LevelRing level={progress.level} percent={xpPct} />
          </View>
          <Text style={styles.levelText}>
            {progress.xp}/{progress.xpForNextLevel} XP
          </Text>
        </View>
        <View style={styles.xpTrack}>
          <Animated.View style={[styles.xpFill, { width: xpWidth }]} />
        </View>
      </View>

      {/* Bài học tâm lý hôm nay */}
      <View style={styles.lessonCard}>
        <Text style={styles.cardLabel}>BÀI HỌC HÔM NAY</Text>
        <Text style={styles.lessonTitle}>Neo giá trước, nhượng bộ sau</Text>
        <Text style={styles.lessonText}>
          Ai đưa con số đầu tiên thường dẫn dắt cả cuộc mặc cả. Hãy chủ động neo trước,
          rồi nhượng bộ từng bước nhỏ — đừng nhảy giá ngay khi đối phương ép.
        </Text>
      </View>

      {/* Vào bản đồ phòng tập */}
      <Pressable style={styles.mapBtn} onPress={onOpenMap}>
        <Text style={styles.mapBtnText}>Xem bản đồ phòng tập →</Text>
        <Text style={styles.mapBtnSub}>5 phòng tập · từ thuê trọ đến gọi vốn</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#101418' },
  pad: { padding: 20, paddingTop: 56, gap: 12, paddingBottom: 32 },
  h1: { color: '#fff', fontSize: 28, fontWeight: '800' },
  sub: { color: '#9fb0bf', marginBottom: 4 },
  cardLabel: { color: '#9fb0bf', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  todayCard: { backgroundColor: '#1b232b', borderRadius: 16, padding: 16, gap: 8 },
  todayTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  todayDesc: { color: '#c3d0dc', fontSize: 13, lineHeight: 18 },
  bigBtn: { backgroundColor: '#2f81f7', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  bigBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: '#243040', borderRadius: 12, paddingVertical: 12, alignItems: 'center', gap: 2 },
  statNum: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#9fb0bf', fontSize: 11 },
  levelBox: { backgroundColor: '#1b232b', borderRadius: 12, padding: 12, gap: 8 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  levelText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  levelRing: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  levelRingTrack: { position: 'absolute', width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#243040' },
  levelRingMarkerTrack: { position: 'absolute', width: 42, height: 42, alignItems: 'center' },
  levelRingMarker: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2f81f7' },
  levelRingValue: { color: '#fff', fontSize: 12, fontWeight: '800' },
  xpTrack: { height: 8, backgroundColor: '#243040', borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: '#2f81f7', borderRadius: 4 },
  lessonCard: { backgroundColor: '#0b2518', borderColor: '#2f9e44', borderWidth: 1, borderRadius: 16, padding: 16, gap: 6 },
  lessonTitle: { color: '#8ce99a', fontWeight: '800', fontSize: 16 },
  lessonText: { color: '#c3fae8', fontSize: 13, lineHeight: 19 },
  mapBtn: { backgroundColor: '#243040', borderRadius: 12, padding: 14, alignItems: 'center', gap: 2 },
  mapBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  mapBtnSub: { color: '#9fb0bf', fontSize: 11 },
});
