// Màn Home — điểm vào của app.
// Khung rộng: app luyện kỹ năng đàm phán (nói chuyện khó), mặc cả giá chỉ là Phòng 1.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RoomId } from '../lib/rooms';
import { ROOMS } from '../lib/rooms';
import type { RoomProgress } from '../lib/roomProgress';
import { LEVELS } from '../lib/roadmap';
import { DailyGoalCard, XpBar, xpForLevel } from '../components/gamification';

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

// Bài học hôm nay lấy THẬT từ lộ trình (roadmap.ts) — xoay theo ngày trong năm,
// không còn đoạn văn cứng. Lộ trình có 21 bài học tâm lý, mỗi bài gắn 1 mục học.
const ALL_LESSONS = LEVELS.flatMap((l) => l.items);

function lessonOfDay(): { title: string; lesson: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return ALL_LESSONS[day % ALL_LESSONS.length];
}

export default function HomeScreen({ progress, onOpenMap, onStartRoom }: Props) {
  const currentRoom = ROOMS.find((r) => r.id === progress.currentRoomId) ?? ROOMS[0];
  // Tổng XP tích lũy = XP tích lũy tới cấp hiện tại + XP trong cấp — khớp với
  // thang gamification (levelFromXp), để XpBar hiện đúng cấp/XP như tiến bộ.
  const totalXp = xpForLevel(progress.level) + progress.xp;
  const suggested = currentRoom.scenarios[0];
  const lesson = lessonOfDay();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.pad}>
      <Text style={styles.h1}>{greeting()} 👋</Text>
      <Text style={styles.sub}>Luyện nói chuyện khó — mỗi ngày một vòng.</Text>

      {/* Luyện hôm nay */}
      <View style={styles.todayCard}>
        <Text style={styles.cardLabel}>🎯 LUYỆN HÔM NAY</Text>
        <Text style={styles.todayTitle}>
          {currentRoom.icon} {currentRoom.title}
        </Text>
        <Text style={styles.todayDesc}>Tình huống gợi ý: “{suggested}” — {currentRoom.tagline.toLowerCase()}.</Text>
        <Pressable style={styles.bigBtn} onPress={() => onStartRoom(currentRoom.id)}>
          <Text style={styles.bigBtnText}>Luyện ngay →</Text>
        </Pressable>
      </View>

      {/* Tóm tắt tiến bộ */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>🔥 {progress.streakDays}</Text>
          <Text style={styles.statLabel}>ngày liên tiếp</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{progress.sessionsTotal}</Text>
          <Text style={styles.statLabel}>vòng đã luyện</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>
            {progress.roomsCompleted.length}/{ROOMS.length}
          </Text>
          <Text style={styles.statLabel}>phòng xong</Text>
        </View>
      </View>
      <View style={styles.levelBox}>
        <XpBar totalXp={totalXp} />
      </View>

      {/* Mục tiêu ngày */}
      <DailyGoalCard roundsToday={progress.roundsToday} />

      {/* Bài học tâm lý hôm nay — nội dung thật từ lộ trình, xoay theo ngày */}
      <View style={styles.lessonCard}>
        <Text style={styles.cardLabel}>🧠 BÀI HỌC HÔM NAY</Text>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonText}>{lesson.lesson}</Text>
      </View>

      {/* Vào bản đồ phòng tập */}
      <Pressable style={styles.mapBtn} onPress={onOpenMap}>
        <Text style={styles.mapBtnText}>🗺️ Xem bản đồ phòng tập →</Text>
        <Text style={styles.mapBtnSub}>5 phòng tập · từ mặc cả đến gọi vốn</Text>
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
  levelBox: { backgroundColor: '#1b232b', borderRadius: 12, padding: 12 },
  lessonCard: { backgroundColor: '#0b2518', borderColor: '#2f9e44', borderWidth: 1, borderRadius: 16, padding: 16, gap: 6 },
  lessonTitle: { color: '#8ce99a', fontWeight: '800', fontSize: 16 },
  lessonText: { color: '#c3fae8', fontSize: 13, lineHeight: 19 },
  mapBtn: { backgroundColor: '#243040', borderRadius: 12, padding: 14, alignItems: 'center', gap: 2 },
  mapBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  mapBtnSub: { color: '#9fb0bf', fontSize: 11 },
});
