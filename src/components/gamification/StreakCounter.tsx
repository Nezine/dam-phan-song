// Đếm chuỗi ngày luyện liên tiếp (streak) — động lực quay lại mỗi ngày.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../icons';

type Props = {
  streakDays: number;
  maxStreakDays?: number;
};

export const StreakCounter = ({ streakDays, maxStreakDays }: Props) => {
  const [countScale] = useState(() => new Animated.Value(1));
  const previousStreak = useRef(streakDays);

  useEffect(() => {
    if (previousStreak.current === streakDays) return;
    previousStreak.current = streakDays;

    const animation = Animated.sequence([
      Animated.timing(countScale, {
        toValue: 1.04,
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(countScale, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [countScale, streakDays]);

  const label =
    streakDays <= 0
      ? 'Luyện ngay hôm nay để bắt đầu chuỗi ngày!'
      : streakDays === 1
        ? 'Ngày đầu đã xong — quay lại vào ngày mai.'
        : `${streakDays} ngày liên tiếp — giữ nhịp tốt.`;
  return (
    <View style={styles.wrap}>
      <View style={styles.textCol}>
        <View style={styles.daysRow}>
          <AppIcon name="streak-flame" size={20} color="#ffd43b" />
          <Animated.Text style={[styles.days, { transform: [{ scale: countScale }] }]}>{streakDays} ngày</Animated.Text>
        </View>
        <Text style={styles.label}>{label}</Text>
        {maxStreakDays != null && maxStreakDays > streakDays ? (
          <Text style={styles.best}>Kỷ lục của bạn: {maxStreakDays} ngày</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#1b232b', borderRadius: 14, padding: 14 },
  textCol: { flex: 1, gap: 2 },
  daysRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  days: { color: '#2f81f7', fontWeight: '800', fontSize: 17 },
  label: { color: '#9fb0bf', fontSize: 12 },
  best: { color: '#9fb0bf', fontSize: 11, fontWeight: '700' },
});
