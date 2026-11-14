// Local-only progress storage (no account, no cloud).
// "Lưu được" = survives app restart on the same phone.
// Uses the SDK 58 expo-file-system API (Paths.document + File) throughout;
// the legacy FileSystem.*Async helpers are runtime stubs in SDK 58 and
// must not be used here.
import { Paths, File } from 'expo-file-system';

export type Progress = {
  sessions: number; // completed negotiation sessions
  totalSaved: number; // total VND/month saved across sessions
  bestScore: number; // best rule-based score percent (0-100)
  updatedAt: string; // ISO timestamp
  days: string[]; // ngày địa phương 'YYYY-MM-DD' đã luyện (mới nhất cuối, tối đa 30)
  bonusXp: number; // XP thưởng ĐÃ trả thật: quà khởi động + mục tiêu ngày
  dailyGoalAwardedOn: string; // ngày đã trả thưởng mục tiêu ngày, '' = chưa
  streakSaveUsedOn: string; // ngày đã dùng 1 lần giữ chuỗi, '' = chưa dùng
};

export const STARTER_XP = 20; // quà khởi động cho người mới (retention spec #5)
export const DAILY_GOAL_XP = 50; // khớp số DailyGoalCard đang hiện — nay trả thật

const EMPTY: Progress = {
  sessions: 0,
  totalSaved: 0,
  bestScore: 0,
  updatedAt: '',
  days: [],
  bonusXp: 0,
  dailyGoalAwardedOn: '',
  streakSaveUsedOn: '',
};

/** Ngày địa phương dạng 'YYYY-MM-DD'. */
export function localDay(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function shiftDay(day: string, delta: number): string {
  const [y, m, dd] = day.split('-').map(Number);
  return localDay(new Date(y, m - 1, dd + delta));
}

/**
 * Chuỗi ngày từ danh sách ngày đã luyện — chỉ đếm những gì dữ liệu chứng minh
 * được. saveWouldApply = chuỗi chỉ đứng vững nhờ 1 lần giữ chuỗi (1 ngày trống
 * duy nhất, chỉ khi chưa từng dùng). Xem docs/retention-mechanics.md §2.4.
 */
export function computeStreak(
  days: string[],
  saveUsedOn: string,
  today = localDay(),
): { streak: number; maxStreak: number; saveWouldApply: boolean } {
  const set = new Set(days);
  // Chuỗi dài nhất trong toàn bộ lịch sử (không dùng giữ chuỗi).
  let maxStreak = 0;
  for (const d of set) {
    if (set.has(shiftDay(d, -1))) continue; // không phải đầu chuỗi
    let n = 0;
    let cur = d;
    while (set.has(cur)) {
      n += 1;
      cur = shiftDay(cur, 1);
    }
    maxStreak = Math.max(maxStreak, n);
  }
  // Chuỗi hiện tại: neo hôm nay, hoặc hôm qua (chuỗi còn sống tới hết hôm nay).
  const anchor = set.has(today) ? today : set.has(shiftDay(today, -1)) ? shiftDay(today, -1) : null;
  if (!anchor) return { streak: 0, maxStreak, saveWouldApply: false };
  let streak = 0;
  let saveWouldApply = false;
  let cur = anchor;
  for (;;) {
    if (set.has(cur)) {
      streak += 1;
      cur = shiftDay(cur, -1);
      continue;
    }
    // Đứt 1 ngày duy nhất + còn lượt giữ chuỗi -> ngày trống đó vẫn tính.
    if (!saveWouldApply && saveUsedOn === '' && set.has(shiftDay(cur, -1))) {
      saveWouldApply = true;
      streak += 1;
      cur = shiftDay(cur, -1);
      continue;
    }
    break;
  }
  return { streak, maxStreak, saveWouldApply };
}

/** Trả thưởng mục tiêu ngày (trước đây chỉ hiện chữ "+50 XP", nay cộng thật). */
export function awardDailyGoal(p: Progress, today: string): Progress {
  if (p.dailyGoalAwardedOn === today) return p;
  return { ...p, bonusXp: p.bonusXp + DAILY_GOAL_XP, dailyGoalAwardedOn: today };
}

function progressFile(): File {
  return new File(Paths.document, 'dam-phan-song-progress.json');
}

export async function loadProgress(): Promise<Progress> {
  try {
    const f = progressFile();
    // Chưa từng có file = người mới tinh -> tặng quà khởi động 20 XP. Số này
    // được ghi cứng vào đĩa ở lần recordSession đầu tiên; bản cài cũ (đã có
    // file) giữ nguyên bonusXp đã lưu, không tặng ngược.
    if (!f.exists) return { ...EMPTY, days: [], bonusXp: STARTER_XP };
    const raw = await f.text();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      sessions: typeof parsed.sessions === 'number' ? parsed.sessions : 0,
      totalSaved: typeof parsed.totalSaved === 'number' ? parsed.totalSaved : 0,
      bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      days: Array.isArray(parsed.days) ? parsed.days.filter((d): d is string => typeof d === 'string') : [],
      bonusXp: typeof parsed.bonusXp === 'number' ? parsed.bonusXp : 0,
      dailyGoalAwardedOn: typeof parsed.dailyGoalAwardedOn === 'string' ? parsed.dailyGoalAwardedOn : '',
      streakSaveUsedOn: typeof parsed.streakSaveUsedOn === 'string' ? parsed.streakSaveUsedOn : '',
    };
  } catch {
    return { ...EMPTY, days: [] };
  }
}

export async function recordSession(savedPerMonth: number, scorePercent: number): Promise<Progress> {
  const prev = await loadProgress();
  const today = localDay();
  const days = prev.days.includes(today) ? prev.days : [...prev.days, today].sort().slice(-30);
  let next: Progress = {
    ...prev,
    sessions: prev.sessions + 1,
    totalSaved: prev.totalSaved + Math.max(0, savedPerMonth),
    bestScore: Math.max(prev.bestScore, scorePercent),
    updatedAt: new Date().toISOString(),
    days,
  };
  // Hoàn thành 1 vòng trong ngày = đạt mục tiêu ngày -> trả +50 XP thật.
  next = awardDailyGoal(next, today);
  // Chuỗi chỉ đứng vững nhờ giữ chuỗi -> ghi nhận đã dùng lượt giữ (1 lần duy nhất).
  if (next.streakSaveUsedOn === '' && computeStreak(days, '', today).saveWouldApply) {
    next = { ...next, streakSaveUsedOn: today };
  }
  try {
    await progressFile().write(JSON.stringify(next));
  } catch {
    // Progress is best-effort; a failed write must never break the demo.
  }
  return next;
}
