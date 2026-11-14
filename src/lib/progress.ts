// progress.ts — Lưu tiến bộ + lộ trình Đàm Phán Sống (lane của Milo).
// Dùng expo-file-system (đã có trong package.json) — lưu JSON ngay trên máy,
// không cần đăng nhập, không cần server. Mỗi phiên chấm xong ghi 1 dòng.
import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';
import type { ScoreReport } from './scoring';

export type SessionRecord = {
  at: string; // ISO time
  room: string; // vd "thuê trọ"
  twist?: string;
  total: number;
  grade: string;
  agreedPrice: number | null;
  savedPerMonth: number;
};

const FILE = Paths.document.uri + 'dam-phan-song-progress.json';

export async function loadProgress(): Promise<SessionRecord[]> {
  try {
    const info = await FileSystem.getInfoAsync(FILE);
    if (!info.exists) return [];
    const raw = await FileSystem.readAsStringAsync(FILE);
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function saveSession(rec: SessionRecord): Promise<SessionRecord[]> {
  const all = await loadProgress();
  all.push(rec);
  await FileSystem.writeAsStringAsync(FILE, JSON.stringify(all));
  return all;
}

export function recordFromReport(room: string, twist: string | undefined, r: ScoreReport): SessionRecord {
  return {
    at: new Date().toISOString(),
    room,
    twist,
    total: r.total,
    grade: r.grade,
    agreedPrice: r.agreedPrice,
    savedPerMonth: r.savedPerMonth,
  };
}

// Lộ trình phòng 1 (thuê trọ): độ khó tăng dần — preset twist trong App.tsx
// là level 2–4; level 1 là tự nhập tình huống của mình.
export const ROADMAP = [
  { level: 1, label: 'Tự nhập phòng của mình', desc: 'Giá thật, phòng thật bạn sắp thuê' },
  { level: 2, label: 'Phòng ẩm mốc', desc: 'Chủ trọ gạt khuyết điểm — tập dùng khuyết điểm để giảm giá' },
  { level: 3, label: 'Cọc 2 tháng', desc: 'Kẹt tiền mặt — tập đàm phán điều khoản thay vì giá' },
  { level: 4, label: 'Giá sàn cứng', desc: 'Chủ trọ có người chờ cọc — cấp khó nhất phòng 1' },
];

export function nextLevel(records: SessionRecord[]): number {
  // Qua 1 level khi có ít nhất 1 phiên ở level đó đạt >= 70đ.
  const passed = new Set<number>();
  for (const r of records) {
    const lv = ROADMAP.findIndex((x) => x.label === r.twist);
    if (r.total >= 70 && lv >= 0) passed.add(lv + 1);
    if (r.total >= 70 && !r.twist) passed.add(1);
  }
  for (let lv = 1; lv <= ROADMAP.length; lv++) if (!passed.has(lv)) return lv;
  return ROADMAP.length;
}
