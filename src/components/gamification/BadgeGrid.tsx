// Lưới huy hiệu: huy hiệu đã mở khóa sáng + rõ, chưa mở khóa mờ + hiện tiến độ.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { allBadges, type Badge, type GamificationStats } from '../../lib/gamification';

type Props = {
  stats: GamificationStats;
  columns?: number; // mặc định 4 cột
};

type BadgeCellProps = {
  badge: Badge;
  width: string;
};

const BadgeCell = ({ badge, width }: BadgeCellProps) => {
  const [revealProgress] = useState(() => new Animated.Value(badge.unlocked ? 1 : 0));
  const wasUnlocked = useRef(badge.unlocked);

  useEffect(() => {
    if (wasUnlocked.current === badge.unlocked) return;
    wasUnlocked.current = badge.unlocked;

    if (!badge.unlocked) {
      revealProgress.setValue(0);
      return;
    }

    const animation = Animated.timing(revealProgress, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [badge.unlocked, revealProgress]);

  const scale = revealProgress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });

  return (
    <Animated.View
      style={[
        styles.cell,
        { width, opacity: badge.unlocked ? revealProgress : 0.6, transform: [{ scale: badge.unlocked ? scale : 1 }] },
      ]}
    >
      <Text style={styles.state}>{badge.unlocked ? 'Đã mở' : 'Chưa mở'}</Text>
      <Text style={styles.badgeTitle}>{badge.title}</Text>
      <Text style={styles.badgeDesc}>{badge.desc}</Text>
      {!badge.unlocked && badge.progress != null && (
        <View style={styles.miniTrack}>
          <View style={[styles.miniFill, { width: `${Math.round(badge.progress * 100)}%` }]} />
        </View>
      )}
    </Animated.View>
  );
};

export const BadgeGrid = ({ stats, columns = 4 }: Props) => {
  const badges = allBadges(stats);
  const unlocked = badges.filter((b) => b.unlocked).length;
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Huy hiệu</Text>
        <Text style={styles.count}>
          {unlocked}/{badges.length}
        </Text>
      </View>
      <View style={styles.grid}>
        {badges.map((badge) => (
          <BadgeCell key={badge.id} badge={badge} width={`${Math.floor(100 / columns) - 2}%`} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { color: '#fff', fontWeight: '800', fontSize: 16 },
  count: { color: '#2f81f7', fontWeight: '700', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { backgroundColor: '#1b232b', borderRadius: 12, padding: 10, alignItems: 'center', gap: 4 },
  state: { color: '#9fb0bf', fontSize: 10, fontWeight: '700' },
  badgeTitle: { color: '#fff', fontWeight: '700', fontSize: 12, textAlign: 'center' },
  badgeDesc: { color: '#9fb0bf', fontSize: 11, textAlign: 'center' },
  miniTrack: { height: 4, width: '100%', borderRadius: 2, backgroundColor: '#243040', overflow: 'hidden', marginTop: 2 },
  miniFill: { height: '100%', backgroundColor: '#2f81f7' },
});
