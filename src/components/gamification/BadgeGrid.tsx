// Lưới huy hiệu: huy hiệu đã mở khóa sáng + rõ, chưa mở khóa mờ + hiện tiến độ.
import { StyleSheet, Text, View } from 'react-native';
import { allBadges, type GamificationStats } from '../../lib/gamification';

type Props = {
  stats: GamificationStats;
  columns?: number; // mặc định 4 cột
};

export const BadgeGrid = ({ stats, columns = 4 }: Props) => {
  const badges = allBadges(stats);
  const unlocked = badges.filter((b) => b.unlocked).length;
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>🏅 Huy hiệu</Text>
        <Text style={styles.count}>
          {unlocked}/{badges.length}
        </Text>
      </View>
      <View style={styles.grid}>
        {badges.map((b) => (
          <View
            key={b.id}
            style={[styles.cell, { width: `${Math.floor(100 / columns) - 2}%` }, !b.unlocked && styles.lockedCell]}
          >
            <Text style={[styles.icon, !b.unlocked && styles.lockedIcon]}>{b.unlocked ? b.icon : '🔒'}</Text>
            <Text style={[styles.badgeTitle, !b.unlocked && styles.lockedText]}>{b.title}</Text>
            <Text style={styles.badgeDesc}>{b.desc}</Text>
            {!b.unlocked && b.progress != null && (
              <View style={styles.miniTrack}>
                <View style={[styles.miniFill, { width: `${Math.round(b.progress * 100)}%` }]} />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { color: '#fff', fontWeight: '800', fontSize: 16 },
  count: { color: '#ffd43b', fontWeight: '700', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { backgroundColor: '#1b232b', borderRadius: 12, padding: 10, alignItems: 'center', gap: 4 },
  lockedCell: { opacity: 0.6 },
  icon: { fontSize: 26 },
  lockedIcon: { fontSize: 22 },
  badgeTitle: { color: '#fff', fontWeight: '700', fontSize: 12, textAlign: 'center' },
  badgeDesc: { color: '#9fb0bf', fontSize: 11, textAlign: 'center' },
  lockedText: { color: '#9fb0bf' },
  miniTrack: { height: 4, width: '100%', borderRadius: 2, backgroundColor: '#243040', overflow: 'hidden', marginTop: 2 },
  miniFill: { height: '100%', backgroundColor: '#2f81f7' },
});
