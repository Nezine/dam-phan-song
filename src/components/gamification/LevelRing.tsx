// Vòng tiến độ cấp độ: 12 chấm xếp thành vòng tròn (thuần react-native,
// không cần SVG). Số chấm sáng = tiến độ lên cấp tiếp theo. Giữa vòng là cấp.
import { StyleSheet, Text, View } from 'react-native';
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
  const lit = Math.round(progress * DOTS);
  const radius = size / 2 - DOT;
  const dots = Array.from({ length: DOTS }, (_, i) => {
    const angle = (i / DOTS) * Math.PI * 2 - Math.PI / 2;
    const x = size / 2 + radius * Math.cos(angle) - DOT / 2;
    const y = size / 2 + radius * Math.sin(angle) - DOT / 2;
    return { x, y, on: i < lit };
  });
  return (
    <View style={[styles.ring, { width: size, height: size }]}>
      {dots.map((d, i) => (
        <View key={i} style={[styles.dot, { left: d.x, top: d.y }, d.on ? styles.dotOn : styles.dotOff]} />
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
  dot: { position: 'absolute', width: DOT, height: DOT, borderRadius: DOT / 2 },
  dotOn: { backgroundColor: '#2f81f7' },
  dotOff: { backgroundColor: '#243040' },
  center: { alignItems: 'center' },
  levelNum: { color: '#fff', fontWeight: '900', fontSize: 26 },
  levelLabel: { color: '#9fb0bf', fontWeight: '700', fontSize: 10 },
});
