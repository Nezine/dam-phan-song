// Thẻ mục tiêu ngày: luyện đủ N vòng trong ngày để nhận thưởng XP.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../icons';

type Props = {
  roundsToday: number;
  targetRounds?: number; // mặc định 1 vòng/ngày
  rewardXp?: number; // XP thưởng khi đạt mục tiêu, mặc định 50
};

export const DailyGoalCard = ({ roundsToday, targetRounds = 1, rewardXp = 50 }: Props) => {
  const done = roundsToday >= targetRounds;
  const progress = Math.min(1, roundsToday / targetRounds);
  const remaining = Math.max(0, targetRounds - roundsToday);
  const [animatedProgress] = useState(() => new Animated.Value(progress));
  const previousProgress = useRef(progress);

  useEffect(() => {
    if (previousProgress.current === progress) return;
    previousProgress.current = progress;

    const animation = Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [animatedProgress, progress]);

  const fillWidth = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <AppIcon name="target" size={16} color="#2f81f7" />
            <Text style={styles.title}>Mục tiêu hôm nay</Text>
          </View>
          <Text style={[styles.sub, done && styles.subDone]}>
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
        <Animated.View style={[styles.fill, { width: fillWidth }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#1b232b', borderRadius: 14, padding: 14, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  textCol: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { color: '#fff', fontWeight: '800', fontSize: 14 },
  sub: { color: '#9fb0bf', fontSize: 12 },
  subDone: { color: '#8ce99a' },
  count: { color: '#2f81f7', fontWeight: '800', fontSize: 14 },
  track: { height: 8, borderRadius: 4, backgroundColor: '#243040', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: '#2f81f7' },
});
