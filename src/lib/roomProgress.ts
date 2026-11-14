// Tiến bộ luyện tập — lưu trong bộ nhớ (in-memory) cho bản demo.
// TODO (sau hackathon): thay bằng AsyncStorage để giữ streak/cấp qua lần mở app.
// Kinh tế XP dùng chung: cấp/xp suy ra từ tổng XP qua levelFromXp trong
// src/lib/gamification.ts (một hệ duy nhất cho cả app). Số liệu bắt đầu từ 0 —
// người dùng mới chưa có lịch sử nào.

import { levelFromXp } from './gamification';
import type { RoomId } from './rooms';

export type RoomProgress = {
  totalXp: number; // tổng XP tích lũy (nguồn duy nhất cho cấp/xp)
  level: number; // suy ra từ totalXp qua levelFromXp
  xp: number; // XP hiện tại trong cấp
  xpForNextLevel: number;
  streakDays: number; // số ngày luyện liên tiếp
  lastSessionDate: string | null; // ngày (toDateString) của buổi luyện gần nhất
  sessionsThisWeek: number;
  roomsCompleted: RoomId[]; // phòng đã hoàn thành
  currentRoomId: RoomId; // phòng đang luyện
};

const SEED: RoomProgress = {
  totalXp: 0,
  level: 1,
  xp: 0,
  xpForNextLevel: 100,
  streakDays: 0,
  lastSessionDate: null,
  sessionsThisWeek: 0,
  roomsCompleted: [],
  currentRoomId: 'rent',
};

let progress: RoomProgress = { ...SEED, roomsCompleted: [...SEED.roomsCompleted] };

function derive(totalXp: number): { level: number; xp: number; xpForNextLevel: number } {
  const { level, xpInLevel, xpToNext } = levelFromXp(totalXp);
  return { level, xp: xpInLevel, xpForNextLevel: xpToNext };
}

export function getProgress(): RoomProgress {
  return { ...progress, ...derive(progress.totalXp) };
}

/** Cộng XP vào tổng (điểm test/thực hành/vòng đàm phán đều cộng vào đây). */
export function addXp(amount: number): RoomProgress {
  if (amount > 0) progress = { ...progress, totalXp: progress.totalXp + amount };
  return getProgress();
}

/** Đánh dấu 1 phòng đã hoàn thành (gọi khi màn kết quả/chốt hiện ra). */
export function completeRoom(roomId: RoomId): RoomProgress {
  if (!progress.roomsCompleted.includes(roomId)) {
    progress = { ...progress, roomsCompleted: [...progress.roomsCompleted, roomId] };
  }
  progress = { ...progress, sessionsThisWeek: progress.sessionsThisWeek + 1 };
  // Streak tính theo ngày: lần đầu trong ngày mới thì tăng — hôm qua có luyện
  // thì nối tiếp, không thì bắt đầu lại từ 1.
  const today = new Date().toDateString();
  if (progress.lastSessionDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    progress = {
      ...progress,
      streakDays: progress.lastSessionDate === yesterday ? progress.streakDays + 1 : 1,
      lastSessionDate: today,
    };
  }
  return getProgress();
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
