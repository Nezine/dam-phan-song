// Đếm chuỗi ngày luyện liên tiếp (streak) — động lực quay lại mỗi ngày.
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  streakDays: number;
  maxStreakDays?: number;
};

export const StreakCounter = ({ streakDays, maxStreakDays }: Props) => {
  const label =
    streakDays <= 0
      ? 'Luyện ngay hôm nay để bắt đầu chuỗi ngày!'
      : streakDays === 1
        ? 'Ngày 1 — giữ lửa, mai quay lại nhé!'
        : `${streakDays} ngày liên tiếp — đang cháy!`;
  return (
    <View style={styles.wrap}>
      <Text style={styles.flame}>🔥</Text>
      <View style={styles.textCol}>
        <Text style={styles.days}>{streakDays} ngày</Text>
        <Text style={styles.label}>{label}</Text>
        {maxStreakDays != null && maxStreakDays > streakDays ? (
          <Text style={styles.best}>Kỷ lục của bạn: {maxStreakDays} ngày</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1b232b', borderRadius: 12, padding: 12 },
  flame: { fontSize: 30 },
  textCol: { flex: 1, gap: 2 },
  days: { color: '#fff', fontWeight: '800', fontSize: 17 },
  label: { color: '#9fb0bf', fontSize: 12 },
  best: { color: '#ffd43b', fontSize: 11, fontWeight: '700' },
});
