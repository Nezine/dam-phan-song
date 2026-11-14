// Gamification helpers — pure functions, no UI, no storage.
// The app wires AsyncStorage later; these functions only compute values.
export type Badge = {
  id: string;
  name: string;
  desc: string;
};

export const BADGES: Badge[] = [
  {
    id: 'first-round',
    name: 'Vòng đầu',
    desc: 'Hoàn thành vòng đàm phán đầu tiên',
  },
  {
    id: 'saver-200k',
    name: 'Tiết kiệm 200k/tháng',
    desc: 'Chốt giá thấp hơn giá rao ít nhất 200.000đ/tháng',
  },
  {
    id: 'streak-3',
    name: '3 vòng liên tiếp',
    desc: 'Hoàn thành 3 vòng đàm phán',
  },
];

/** XP for one finished round: base 50 XP, +1 XP per 10.000đ saved vs listed
 *  (bonus capped at 50). No agreement = 0 XP. */
export function xpForRound(input: { agreedPrice: number | null; listedPrice: number }): number {
  const { agreedPrice, listedPrice } = input;
  if (agreedPrice === null || listedPrice <= 0) return 0;
  const saved = Math.max(0, listedPrice - agreedPrice);
  const bonus = Math.min(50, Math.floor(saved / 10_000));
  return 50 + bonus;
}

/** Badge ids earned from the player's totals so far. */
export function checkBadges(input: {
  totalRounds: number;
  savedPerMonth: number;
  currentStreak: number;
}): string[] {
  const earned: string[] = [];
  if (input.totalRounds >= 1) earned.push('first-round');
  if (input.savedPerMonth >= 200_000) earned.push('saver-200k');
  if (input.currentStreak >= 3) earned.push('streak-3');
  return earned;
}

/** Day-number (UTC) for a YYYY-MM-DD date string; NaN when unparseable. */
function dayNumber(date: string): number {
  const parts = date.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return NaN;
  return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86_400_000);
}

/** Streak after playing today. Same day = unchanged, yesterday = +1,
 *  otherwise (gap, or first ever play) = reset to 1. */
export function streakAfter(
  lastPlayedDay: string | null,
  today: string,
  currentStreak: number,
): number {
  if (lastPlayedDay === null) return 1;
  const last = dayNumber(lastPlayedDay);
  const now = dayNumber(today);
  if (Number.isNaN(last) || Number.isNaN(now)) return 1;
  const diff = now - last;
  if (diff === 0) return currentStreak;
  if (diff === 1) return currentStreak + 1;
  return 1;
}
