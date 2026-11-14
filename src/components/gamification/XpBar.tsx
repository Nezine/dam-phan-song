// Thanh XP: hiển thị cấp hiện tại, XP trong cấp và tiến độ lên cấp tiếp theo.
import { StyleSheet, Text, View } from 'react-native';
import { levelFromXp, levelTitle } from '../../lib/gamification';

type Props = {
  totalXp: number;
  compact?: boolean; // bản gọn: chỉ thanh + số XP, không hiện tên cấp
};

export const XpBar = ({ totalXp, compact = false }: Props) => {
  const { level, xpInLevel, xpToNext, progress } = levelFromXp(totalXp);
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
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  level: { color: '#ffd43b', fontWeight: '800', fontSize: 15 },
  title: { color: '#9fb0bf', fontSize: 12, flex: 1 },
  xp: { color: '#fff', fontWeight: '700', fontSize: 12 },
  track: { height: 10, borderRadius: 5, backgroundColor: '#243040', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5, backgroundColor: '#2f81f7' },
});
