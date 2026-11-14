// Icon PNG dùng chung — zero dep, ảnh trắng trong suốt, tô màu bằng tintColor.
// Mọi icon đều có nghĩa: không decor cho có. Palette theo tokens đã lock.
import { Image, type ImageStyle } from 'react-native';
import type { RoomId } from '../lib/rooms';

const SOURCES = {
  deal: require('../../assets/icons/png/deal.png'),
  money: require('../../assets/icons/png/money.png'),
  'room-income': require('../../assets/icons/png/room-income.png'),
  'room-speaking': require('../../assets/icons/png/room-speaking.png'),
  'chart-up': require('../../assets/icons/png/chart-up.png'),
  mic: require('../../assets/icons/png/mic.png'),
  stop: require('../../assets/icons/png/stop.png'),
  'volume-on': require('../../assets/icons/png/volume-on.png'),
  'volume-off': require('../../assets/icons/png/volume-off.png'),
  'chart-bar': require('../../assets/icons/png/chart-bar.png'),
  check: require('../../assets/icons/png/check.png'),
  x: require('../../assets/icons/png/x.png'),
  trophy: require('../../assets/icons/png/trophy.png'),
  'streak-flame': require('../../assets/icons/png/streak-flame.png'),
  'face-smile': require('../../assets/icons/png/face-smile.png'),
  'face-neutral': require('../../assets/icons/png/face-neutral.png'),
  'face-annoyed': require('../../assets/icons/png/face-annoyed.png'),
  target: require('../../assets/icons/png/target.png'),
  map: require('../../assets/icons/png/map.png'),
  'arrow-right': require('../../assets/icons/png/arrow-right.png'),
  lock: require('../../assets/icons/png/lock.png'),
  'xp-star': require('../../assets/icons/png/xp-star.png'),
  bulb: require('../../assets/icons/png/bulb.png'),
  crown: require('../../assets/icons/png/crown.png'),
  bolt: require('../../assets/icons/png/bolt.png'),
} as const;

export type IconName = keyof typeof SOURCES;

export function AppIcon({
  name,
  size = 24,
  color = '#fff',
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: ImageStyle;
}) {
  return <Image source={SOURCES[name]} style={[{ width: size, height: size }, style]} tintColor={color} />;
}

// Icon từng phòng — mỗi icon nói đúng phòng đó luyện gì.
const ROOM_ICONS: Record<RoomId, { name: IconName; color: string }> = {
  rent: { name: 'deal', color: '#2f81f7' }, // Mặc cả giá — chốt deal
  deposit: { name: 'money', color: '#8ce99a' }, // Đòi lại tiền cọc — tiền về tay
  'salary-parttime': { name: 'room-income', color: '#2f81f7' }, // Lương làm thêm — cặp táp
  interview: { name: 'room-speaking', color: '#2f81f7' }, // Phỏng vấn — nói trước áp lực
  investor: { name: 'chart-up', color: '#8ce99a' }, // Nhà đầu tư — số liệu đi lên
};

export function RoomIconImage({ room, size = 32 }: { room: RoomId; size?: number }) {
  const icon = ROOM_ICONS[room];
  return <AppIcon name={icon.name} size={size} color={icon.color} />;
}

// Icon từng huy hiệu — map theo id huy hiệu trong src/lib/gamification.ts.
export const BADGE_ICONS: Record<string, { name: IconName; color: string }> = {
  'first-round': { name: 'mic', color: '#2f81f7' }, // Mở lời — cất tiếng đầu tiên
  'first-win': { name: 'deal', color: '#8ce99a' }, // Chốt đầu tiên — deal đầu
  'streak-3': { name: 'streak-flame', color: '#ffd43b' }, // 3 ngày liên tiếp — lửa chuỗi
  'streak-7': { name: 'crown', color: '#ffd43b' }, // Tuần vàng — vương miện
  'saving-10': { name: 'money', color: '#8ce99a' }, // Mặc cả cứng — tiền tiết kiệm
  'rounds-10': { name: 'target', color: '#2f81f7' }, // Kiên trì — bền bỉ đúng mục tiêu
  'day-5': { name: 'bolt', color: '#ffd43b' }, // Không bỏ cuộc — 5 vòng/ngày
  'level-5': { name: 'xp-star', color: '#ffd43b' }, // Lên cấp 5 — ngôi sao cấp độ
};
