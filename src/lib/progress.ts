// Tiến bộ luyện tập — lưu trong bộ nhớ (in-memory) cho bản demo.
// TODO (sau hackathon): thay bằng AsyncStorage để giữ streak/cấp qua lần mở app.
// Số liệu seed bên dưới là dữ liệu demo để màn Home/Map hiển thị được ngay;
// team thay bằng số thật khi nối kho lưu trữ.

import type { RoomId } from './rooms';

export type Progress = {
  level: number;
  xp: number; // XP hiện tại trong cấp
  xpForNextLevel: number;
  streakDays: number; // số ngày luyện liên tiếp
  sessionsThisWeek: number;
  roomsCompleted: RoomId[]; // phòng đã hoàn thành
  currentRoomId: RoomId; // phòng đang luyện
};

const SEED: Progress = {
  level: 2,
  xp: 120,
  xpForNextLevel: 200,
  streakDays: 3,
  sessionsThisWeek: 2,
  roomsCompleted: [],
  currentRoomId: 'rent',
};

let progress: Progress = { ...SEED, roomsCompleted: [...SEED.roomsCompleted] };

export function getProgress(): Progress {
  return progress;
}

/** Đánh dấu 1 phòng đã hoàn thành (gọi khi màn kết quả/chốt hiện ra). */
export function completeRoom(roomId: RoomId): Progress {
  if (!progress.roomsCompleted.includes(roomId)) {
    progress = { ...progress, roomsCompleted: [...progress.roomsCompleted, roomId] };
  }
  return progress;
}

/** Phòng đã mở chưa — theo điều kiện trong rooms.ts. */
export function isRoomUnlocked(
  room: { requiresRoomCompleted?: RoomId; requiresLevel?: number },
  p: Progress,
): boolean {
  if (room.requiresRoomCompleted && !p.roomsCompleted.includes(room.requiresRoomCompleted)) return false;
  if (room.requiresLevel && p.level < room.requiresLevel) return false;
  return true;
}
