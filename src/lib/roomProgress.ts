// Tiến bộ luyện tập — suy ra THẬT từ kho lưu trữ tiến bộ (src/lib/progress.ts).
// Không còn số seed: chưa luyện vòng nào thì mọi số đều 0 / cấp 1.
// Mỗi session đã ghi = 1 vòng đàm phán đã chốt thỏa thuận (App.tsx chỉ gọi
// recordSession() khi chốt giá) nên XP = sessions × (finishRound 50 + winDeal 100).
// Chuỗi ngày: tính từ danh sách ngày đã luyện trong progress.ts (computeStreak),
// có 1 lần giữ chuỗi duy nhất cho 1 ngày trống — không bịa chuỗi dài hơn dữ liệu.
import { computeStreak, loadProgress, type Progress } from './progress';
import { levelFromXp, XP_REWARD } from './gamification';
import type { RoomId } from './rooms';

export type RoomProgress = {
  level: number;
  xp: number; // XP hiện tại trong cấp
  xpForNextLevel: number;
  streakDays: number; // chuỗi ngày liên tiếp THẬT tính từ danh sách ngày đã luyện
  maxStreakDays: number; // chuỗi dài nhất trong lịch sử đã lưu
  sessionsTotal: number; // tổng số vòng đã chốt thỏa thuận
  roundsToday: number; // 1 nếu hôm nay đã luyện (giới hạn dưới thật), 0 nếu chưa
  roomsCompleted: RoomId[]; // phòng đã hoàn thành (hiện chỉ Phòng 1 có luồng thật)
  currentRoomId: RoomId; // phòng đang luyện
};

const XP_PER_SESSION = XP_REWARD.finishRound + XP_REWARD.winDeal; // 150

export const EMPTY_PROGRESS: RoomProgress = {
  level: 1,
  xp: 0,
  xpForNextLevel: 100,
  streakDays: 0,
  maxStreakDays: 0,
  sessionsTotal: 0,
  roundsToday: 0,
  roomsCompleted: [],
  currentRoomId: 'sales',
};

function isToday(iso: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Suy ra tiến bộ hiển thị từ dữ liệu thật đã lưu — không bịa số nào. */
export function deriveRoomProgress(p: Progress): RoomProgress {
  // XP tổng = XP vòng đàm phán + XP thưởng đã trả thật (quà khởi động, mục
  // tiêu ngày) — 1 hệ XP duy nhất cho mọi màn hình.
  const totalXp = p.sessions * XP_PER_SESSION + p.bonusXp;
  const { level, xpInLevel, xpToNext } = levelFromXp(totalXp);
  const playedToday = isToday(p.updatedAt);
  const { streak, maxStreak } = computeStreak(p.days, p.streakSaveUsedOn);
  return {
    level,
    xp: xpInLevel,
    xpForNextLevel: xpToNext,
    streakDays: streak,
    maxStreakDays: maxStreak,
    sessionsTotal: p.sessions,
    roundsToday: playedToday ? 1 : 0,
    // Phòng 1 hoàn thành khi đã chốt ít nhất 1 thỏa thuận (recordSession chỉ
    // chạy khi chốt giá). Phòng khác chưa có luồng thật nên chưa thể xong.
    roomsCompleted: p.sessions > 0 ? ['sales'] : [],
    currentRoomId: 'sales',
  };
}

let snapshot: RoomProgress = { ...EMPTY_PROGRESS, roomsCompleted: [] };

/** Đọc tiến bộ thật từ đĩa (gọi khi mở app và mỗi lần đổi màn hình). */
export async function loadRoomProgress(): Promise<RoomProgress> {
  const p = await loadProgress();
  snapshot = deriveRoomProgress(p);
  return snapshot;
}

/** Ảnh chụp đồng bộ mới nhất đã tải (trống thật cho tới khi tải xong). */
export function getProgress(): RoomProgress {
  return snapshot;
}

/** Phòng đã mở chưa — theo điều kiện trong rooms.ts. */
export function isRoomUnlocked(
  room: { requiresRoomCompleted?: RoomId; requiresLevel?: number },
  p: RoomProgress,
): boolean {
  if (room.requiresRoomCompleted && !p.roomsCompleted.includes(room.requiresRoomCompleted)) return false;
  if (room.requiresLevel && p.level < room.requiresLevel) return false;
  return true;
}
