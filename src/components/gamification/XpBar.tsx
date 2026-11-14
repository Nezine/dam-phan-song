// Thanh XP: hiển thị cấp hiện tại, XP trong cấp và tiến độ lên cấp tiếp theo.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { levelFromXp, levelTitle } from '../../lib/gamification';

type Props = {
  totalXp: number;
  compact?: boolean; // bản gọn: chỉ thanh + số XP, không hiện tên cấp
};

export const XpBar = ({ totalXp, compact = false }: Props) => {
  const { level, xpInLevel, xpToNext, progress } = levelFromXp(totalXp);
  const [animatedProgress] = useState(() => new Animated.Value(progress));
  const previousProgress = useRef(progress);
  const previousLevel = useRef(level);

  useEffect(() => {
    if (previousProgress.current === progress && previousLevel.current === level) return;
    // Lên cấp: progress tụt (0.95 -> 0.05) — chạy nốt tới 100% rồi đặt lại
    // về đầu cấp mới, thay vì để thanh chạy NGƯỢC trông như mất XP.
    const leveledUp = level > previousLevel.current;
    previousProgress.current = progress;
    previousLevel.current = level;
    if (leveledUp) {
      const fill = Animated.timing(animatedProgress, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      });
      fill.start(({ finished }) => {
        if (finished) animatedProgress.setValue(progress);
      });
      return () => fill.stop();
    }
    const animation = Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [animatedProgress, progress, level]);

  const fillWidth = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.level}>Cấp {level}</Text>
        {!compact && <Text style={styles.title}>{levelTitle(level)}</Text>}
        <Text style={styles.xp}>
          {xpInLevel}/{xpToNext} XP
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: fillWidth }]} />
      </View>
      {!compact && (
        <Text style={styles.remaining}>Còn {Math.max(0, xpToNext - xpInLevel)} XP nữa lên cấp {level + 1}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  level: { color: '#2f81f7', fontWeight: '800', fontSize: 15 },
  title: { color: '#9fb0bf', fontSize: 12, flex: 1 },
  xp: { color: '#fff', fontWeight: '700', fontSize: 12 },
  remaining: { color: '#9fb0bf', fontSize: 12 },
  track: { height: 10, borderRadius: 5, backgroundColor: '#243040', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5, backgroundColor: '#2f81f7' },
});
