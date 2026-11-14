// Vòng tiến độ cấp độ: 12 chấm xếp thành vòng tròn (thuần react-native,
// không cần SVG). Số chấm sáng = tiến độ lên cấp tiếp theo. Giữa vòng là cấp.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { levelFromXp } from '../../lib/gamification';

const DOTS = 12;
const SIZE = 96;
const DOT = 10;

type Props = {
  totalXp: number;
  size?: number; // đường kính vòng, mặc định 96
};

export const LevelRing = ({ totalXp, size = SIZE }: Props) => {
  const { level, progress } = levelFromXp(totalXp);
  const [animatedProgress] = useState(() => new Animated.Value(progress));
  const previousProgress = useRef(progress);

  useEffect(() => {
    if (previousProgress.current === progress) return;
    previousProgress.current = progress;

    const animation = Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [animatedProgress, progress]);

  const radius = size / 2 - DOT;
  const dots = Array.from({ length: DOTS }, (_, i) => {
    const angle = (i / DOTS) * Math.PI * 2 - Math.PI / 2;
    const x = size / 2 + radius * Math.cos(angle) - DOT / 2;
    const y = size / 2 + radius * Math.sin(angle) - DOT / 2;
    const opacity = animatedProgress.interpolate({
      inputRange: [i / DOTS, (i + 1) / DOTS],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    return { x, y, opacity };
  });
  return (
    <View style={[styles.ring, { width: size, height: size }]}>
      {dots.map((dot, i) => (
        <View key={i} style={[styles.dotPosition, { left: dot.x, top: dot.y }]}>
          <View style={[styles.dot, styles.dotOff]} />
          <Animated.View style={[styles.dot, styles.dotOn, { opacity: dot.opacity }]} />
        </View>
      ))}
      <View style={styles.center}>
        <Text style={styles.levelNum}>{level}</Text>
        <Text style={styles.levelLabel}>CẤP</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: { alignItems: 'center', justifyContent: 'center' },
  dotPosition: { position: 'absolute', width: DOT, height: DOT },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
  dotOn: { position: 'absolute', backgroundColor: '#2f81f7' },
  dotOff: { backgroundColor: '#243040' },
  center: { alignItems: 'center' },
  levelNum: { color: '#fff', fontWeight: '900', fontSize: 26 },
  levelLabel: { color: '#9fb0bf', fontWeight: '700', fontSize: 10 },
});
