// Gamification: XP, cấp độ, streak, huy hiệu, mục tiêu ngày.
// Chỉ dùng react-native thuần, không thêm dependency. Copy tiếng Việt,
// không gắn với bất kỳ tình huống cụ thể nào (đàm phán là kỹ năng chung).

export type GamificationStats = {
  totalXp: number; // tổng XP tích lũy
  roundsPlayed: number; // tổng số vòng đã luyện
  roundsWon: number; // số vòng chốt được thỏa thuận
  bestSavingPct: number; // % tốt nhất đạt được so với giá mở đầu (0–100)
  streakDays: number; // số ngày luyện liên tiếp hiện tại
  maxStreakDays: number; // chuỗi dài nhất từng đạt
  roundsToday: number; // số vòng đã luyện hôm nay
  dailyGoalAwardedToday: boolean; // đã nhận thưởng mục tiêu ngày hôm nay chưa
};

// XP cần để lên từ cấp L lên L+1.
export const xpNeededForLevel = (level: number): number => 100 * level;

// Tổng XP tích lũy cần để đạt cấp L (cấp 1 bắt đầu từ 0 XP).
export const xpForLevel = (level: number): number => 50 * level * (level - 1);

// Từ tổng XP -> cấp hiện tại + XP trong cấp + XP cần cho cấp tiếp theo.
export const levelFromXp = (totalXp: number): { level: number; xpInLevel: number; xpToNext: number; progress: number } => {
  let level = 1;
  while (totalXp >= xpForLevel(level + 1)) level += 1;
  const xpInLevel = totalXp - xpForLevel(level);
  const xpToNext = xpNeededForLevel(level);
  return { level, xpInLevel, xpToNext, progress: Math.min(1, xpInLevel / xpToNext) };
};

// Tên cấp theo cấp độ (hiển thị, không ảnh hưởng logic).
export const levelTitle = (level: number): string => {
  if (level >= 10) return 'Bậc thầy đàm phán';
  if (level >= 7) return 'Nhà đàm phán cứng';
  if (level >= 5) return 'Người thương lượng';
  if (level >= 3) return 'Người luyện tập';
  return 'Người mới bắt đầu';
};

// XP thưởng cho các sự kiện trong app.
export const XP_REWARD = {
  finishRound: 50, // hoàn thành 1 vòng đàm phán
  winDeal: 100, // chốt được thỏa thuận
  goodTactic: 20, // dùng 1 chiến thuật tốt (do thang chấm quyết định)
  streakBonus: 30, // luyện đủ 3 ngày liên tiếp (cộng 1 lần/ngày khi đạt mốc)
  dailyGoal: 50, // đạt mục tiêu ngày (cộng 1 lần/ngày, qua awardDailyGoal)
} as const;

export type Badge = {
  id: string;
  icon: string; // emoji
  title: string;
  desc: string;
  unlocked: boolean;
  progress?: number; // 0–1, chỉ dùng khi chưa mở khóa
};

export const allBadges = (s: GamificationStats): Badge[] => [
  {
    id: 'first-round',
    icon: '🎤',
    title: 'Mở lời',
    desc: 'Hoàn thành vòng đàm phán đầu tiên',
    unlocked: s.roundsPlayed >= 1,
    progress: Math.min(1, s.roundsPlayed / 1),
  },
  {
    id: 'first-win',
    icon: '🤝',
    title: 'Chốt đầu tiên',
    desc: 'Chốt được thỏa thuận đầu tiên',
    unlocked: s.roundsWon >= 1,
    progress: Math.min(1, s.roundsWon / 1),
  },
  {
    id: 'streak-3',
    icon: '🔥',
    title: '3 ngày liên tiếp',
    desc: 'Luyện 3 ngày liên tiếp',
    unlocked: s.maxStreakDays >= 3,
    progress: Math.min(1, s.maxStreakDays / 3),
  },
  {
    id: 'streak-7',
    icon: '🌟',
    title: 'Tuần vàng',
    desc: 'Luyện 7 ngày liên tiếp',
    unlocked: s.maxStreakDays >= 7,
    progress: Math.min(1, s.maxStreakDays / 7),
  },
  {
    id: 'saving-10',
    icon: '💰',
    title: 'Mặc cả cứng',
    desc: 'Đạt thỏa thuận tốt hơn giá mở đầu 10%',
    unlocked: s.bestSavingPct >= 10,
    progress: Math.min(1, s.bestSavingPct / 10),
  },
  {
    id: 'rounds-10',
    icon: '🎯',
    title: 'Kiên trì',
    desc: 'Hoàn thành 10 vòng đàm phán',
    unlocked: s.roundsPlayed >= 10,
    progress: Math.min(1, s.roundsPlayed / 10),
  },
  {
    id: 'day-5',
    icon: '⚡',
    title: 'Không bỏ cuộc',
    desc: 'Luyện 5 vòng trong 1 ngày',
    unlocked: s.roundsToday >= 5,
    progress: Math.min(1, s.roundsToday / 5),
  },
  {
    id: 'level-5',
    icon: '👑',
    title: 'Lên cấp 5',
    desc: 'Đạt cấp độ 5',
    unlocked: levelFromXp(s.totalXp).level >= 5,
    progress: Math.min(1, levelFromXp(s.totalXp).level / 5),
  },
];

export const unlockedBadgeCount = (s: GamificationStats): number =>
  allBadges(s).filter((b) => b.unlocked).length;

// Thưởng mục tiêu ngày: cộng XP_REWARD.dailyGoal đúng 1 lần khi roundsToday
// đạt mục tiêu trong ngày. Trả về stats mới + awarded (false nếu chưa đạt
// hoặc đã nhận rồi — chống cộng lặp).
export function awardDailyGoal(
  s: GamificationStats,
  targetRounds = 1,
): { stats: GamificationStats; awarded: boolean } {
  if (s.roundsToday < targetRounds || s.dailyGoalAwardedToday) return { stats: s, awarded: false };
  return {
    stats: { ...s, totalXp: s.totalXp + XP_REWARD.dailyGoal, dailyGoalAwardedToday: true },
    awarded: true,
  };
}
