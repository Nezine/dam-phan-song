// Thẻ mục tiêu ngày: luyện đủ N vòng trong ngày để nhận thưởng XP.
// Khi đạt mục tiêu thì đổi trạng thái thành "đã xong" (xanh lá).
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  roundsToday: number;
  targetRounds?: number; // mặc định 1 vòng/ngày
  rewardXp?: number; // XP thưởng khi đạt mục tiêu, mặc định 50
};

export const DailyGoalCard = ({ roundsToday, targetRounds = 1, rewardXp = 50 }: Props) => {
  const done = roundsToday >= targetRounds;
  const progress = Math.min(1, roundsToday / targetRounds);
  const remaining = Math.max(0, targetRounds - roundsToday);
  return (
    <View style={[styles.wrap, done && styles.wrapDone]}>
      <View style={styles.row}>
        <Text style={styles.icon}>{done ? '✅' : '🎯'}</Text>
        <View style={styles.textCol}>
          <Text style={styles.title}>Mục tiêu hôm nay</Text>
          <Text style={styles.sub}>
            {done
              ? `Xong! Bạn đã luyện ${roundsToday}/${targetRounds} vòng — +${rewardXp} XP`
              : `Luyện thêm ${remaining} vòng nữa để nhận +${rewardXp} XP`}
          </Text>
        </View>
        <Text style={styles.count}>
          {roundsToday}/{targetRounds}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, done ? styles.fillDone : styles.fillTodo, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#1b232b', borderRadius: 12, padding: 12, gap: 8 },
  wrapDone: { borderColor: '#2f9e44', borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { fontSize: 22 },
  textCol: { flex: 1, gap: 2 },
  title: { color: '#fff', fontWeight: '800', fontSize: 14 },
  sub: { color: '#9fb0bf', fontSize: 12 },
  count: { color: '#ffd43b', fontWeight: '800', fontSize: 14 },
  track: { height: 8, borderRadius: 4, backgroundColor: '#243040', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  fillTodo: { backgroundColor: '#2f81f7' },
  fillDone: { backgroundColor: '#2f9e44' },
});
