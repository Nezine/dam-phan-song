// Màn Home — điểm vào của app.
// Khung rộng: app luyện kỹ năng đàm phán (nói chuyện khó), mặc cả giá chỉ là Phòng 1.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RoomId } from '../lib/rooms';
import { ROOMS } from '../lib/rooms';
import type { RoomProgress } from '../lib/roomProgress';
import { LEVELS } from '../lib/roadmap';
import { BadgeGrid, DailyGoalCard, XpBar, unlockedBadgeCount, xpForLevel } from '../components/gamification';
import { todayChallenge } from '../lib/highlights';
import { AppIcon, RoomIconImage } from '../components/icons';
import type { GamificationStats } from '../lib/gamification';

type Props = {
  progress: RoomProgress;
  onOpenMap: () => void;
  onStartRoom: (roomId: RoomId) => void;
  onQuickStart: () => void;
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

export default function HomeScreen({ progress, onOpenMap, onStartRoom, onQuickStart }: Props) {
  const currentRoom = ROOMS.find((r) => r.id === progress.currentRoomId) ?? ROOMS[0];
  // Tổng XP tích lũy = XP tích lũy tới cấp hiện tại + XP trong cấp — khớp với
  // thang gamification (levelFromXp), để XpBar hiện đúng cấp/XP như tiến bộ.
  const totalXp = xpForLevel(progress.level) + progress.xp;
  const suggested = currentRoom.scenarios[0];
  const lesson = lessonOfDay();
  const challenge = todayChallenge();
  // Suy ra GamificationStats từ tiến bộ thật (docs/retention-mechanics.md §2.3).
  // Không bịa số nào: mọi vòng đã ghi đều là vòng chốt thỏa thuận nên
  // roundsWon = roundsPlayed; kho lưu không giữ % tiết kiệm từng vòng nên
  // bestSavingPct = 0 (huy hiệu "Mặc cả cứng" chỉ mở khi có dữ liệu thật);
  // chuỗi ngày kho lưu chỉ chứng minh được 0/1 nên maxStreakDays = streakDays.
  const badgeStats: GamificationStats = {
    totalXp,
    roundsPlayed: progress.sessionsTotal,
    roundsWon: progress.sessionsTotal,
    bestSavingPct: 0,
    streakDays: progress.streakDays,
    maxStreakDays: progress.maxStreakDays,
    roundsToday: progress.roundsToday,
  };
  const badgesUnlocked = unlockedBadgeCount(badgeStats);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.pad}>
      <Text style={styles.eyebrow}>ĐÀM PHÁN SỐNG</Text>
      <Text style={styles.h1}>{greeting()}</Text>
      <Text style={styles.sub}>Luyện nói chuyện khó — mỗi ngày một vòng.</Text>

      {/* Luyện nhanh: vào thẳng Phòng 1 preset 1, không qua màn chuẩn bị */}
      <Pressable style={styles.quickBtn} onPress={onQuickStart}>
        <Text style={styles.quickBtnText}>Luyện nhanh 1 phút</Text>
        <Text style={styles.quickBtnSub}>Vào thẳng tình huống Phòng 1 — bỏ qua bước chuẩn bị</Text>
      </Pressable>

      {/* Luyện hôm nay */}
      <View style={styles.todayCard}>
        <Text style={styles.cardLabel}>LUYỆN HÔM NAY</Text>
        <View style={styles.todayTitleRow}>
          <View style={styles.roomTile}>
            <RoomIconImage room={currentRoom.id} size={28} />
          </View>
          <Text style={styles.todayTitle}>{currentRoom.title}</Text>
        </View>
        <Text style={styles.todayDesc}>Tình huống gợi ý: “{suggested}” — {currentRoom.tagline.toLowerCase()}.</Text>
        <Pressable style={styles.bigBtn} onPress={() => onStartRoom(currentRoom.id)}>
          <View style={styles.btnRow}>
            <Text style={styles.bigBtnText}>Luyện ngay</Text>
            <AppIcon name="arrow-right" size={18} color="#fff" />
          </View>
        </Pressable>
      </View>

      {/* Tóm tắt tiến bộ */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <View style={styles.statNumRow}>
            <AppIcon name="streak-flame" size={16} color="#ffd43b" />
            <Text style={styles.statNum}>{progress.streakDays}</Text>
          </View>
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

      {/* Huy hiệu — bật lưới đã viết sẵn (retention #3): chỉ hiện số thật */}
      <View style={styles.badgeBox}>
        <Text style={styles.cardLabel}>HUY HIỆU · {badgesUnlocked}/8 ĐÃ MỞ</Text>
        <BadgeGrid stats={badgeStats} />
      </View>

      {/* Bài học tâm lý hôm nay — nội dung thật từ lộ trình, xoay theo ngày */}
      <View style={styles.lessonCard}>
        <Text style={styles.cardLabel}>BÀI HỌC HÔM NAY</Text>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonText}>{lesson.lesson}</Text>
      </View>

      {/* Thử thách hôm nay — ngoài đời thật, dưới 5 phút */}
      <View style={styles.lessonCard}>
        <Text style={styles.cardLabel}>THỬ THÁCH HÔM NAY · {challenge.minutes} PHÚT</Text>
        <Text style={styles.lessonText}>{challenge.text}</Text>
      </View>

      {/* Vào bản đồ phòng tập */}
      <Pressable style={styles.mapBtn} onPress={onOpenMap}>
        <View style={styles.btnRow}>
          <AppIcon name="map" size={18} color="#2f81f7" />
          <Text style={styles.mapBtnText}>Xem bản đồ phòng tập</Text>
        </View>
        <Text style={styles.mapBtnSub}>5 phòng tập · từ mặc cả đến gọi vốn</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#101418' },
  pad: { padding: 20, paddingTop: 56, gap: 14, paddingBottom: 32 },
  eyebrow: { color: '#2f81f7', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: -6 },
  h1: { color: '#fff', fontSize: 28, fontWeight: '800' },
  sub: { color: '#9fb0bf', marginBottom: 4, fontSize: 14, lineHeight: 20 },
  cardLabel: { color: '#9fb0bf', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  todayCard: {
    backgroundColor: '#16283d',
    borderColor: '#2f81f7',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 10,
  },
  todayTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roomTile: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#22384f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayTitle: { color: '#fff', fontSize: 20, fontWeight: '800', flex: 1 },
  todayDesc: { color: '#c3d0dc', fontSize: 13, lineHeight: 19 },
  bigBtn: { backgroundColor: '#2f81f7', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bigBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: '#1b232b', borderRadius: 14, paddingVertical: 12, alignItems: 'center', gap: 2 },
  statNumRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statNum: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#9fb0bf', fontSize: 11 },
  levelBox: { backgroundColor: '#1b232b', borderRadius: 14, padding: 14 },
  badgeBox: { backgroundColor: '#1b232b', borderRadius: 14, padding: 14, gap: 8 },
  quickBtn: { backgroundColor: '#2f81f7', borderRadius: 12, padding: 14, gap: 2 },
  quickBtnText: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  quickBtnSub: { color: '#dbeafe', fontSize: 12 },
  lessonCard: { backgroundColor: '#0b2518', borderColor: '#2f9e44', borderWidth: 1, borderRadius: 18, padding: 16, gap: 6 },
  lessonTitle: { color: '#8ce99a', fontWeight: '800', fontSize: 16 },
  lessonText: { color: '#c3fae8', fontSize: 13, lineHeight: 19 },
  mapBtn: { backgroundColor: '#1b232b', borderColor: '#232c35', borderWidth: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 2 },
  mapBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  mapBtnSub: { color: '#9fb0bf', fontSize: 11 },
});
