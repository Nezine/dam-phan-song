# Tích hợp Home + Bản đồ phòng tập (nhánh `muse/room-map`)

> Chỉ thêm file mới — không sửa file Slice 1 nào (`App.tsx`, `src/lib/*` cũ giữ nguyên).

## File mới

| File | Nội dung |
|---|---|
| `src/lib/rooms.ts` | Danh mục 5 phòng tập: thuê trọ (P1, mở), giữ cọc (P2), lương làm thêm (P3), phỏng vấn (P4), trả lời nhà đầu tư (P5). Mỗi phòng: icon, tagline, mô tả, bộ tình huống, độ khó 1–3, điều kiện mở khóa. Copy khung rộng, không đóng khung vào trọ. |
| `src/lib/roomProgress.ts | Tiến bộ in-memory (đổi tên khi merge để khỏi trùng progress.ts của màn chấm) (cấp, XP, streak, buổi/tuần, phòng đã xong). `getProgress()`, `completeRoom()`, `isRoomUnlocked()`. Seed demo: cấp 2, 120/200 XP, streak 3 ngày. TODO: thay bằng AsyncStorage sau hackathon. |
| `src/screens/HomeScreen.tsx` | Chào theo giờ, gợi ý luyện hôm nay (Phòng 1), tóm tắt streak/cấp/XP, bài học tâm lý, nút vào bản đồ phòng tập. |
| `src/screens/RoomMapScreen.tsx` | 5 thẻ phòng nối nhau bằng đường dọc, có độ khó (chấm), chip tình huống, badge Mở/Đang luyện/🔒 Khóa + điều kiện mở khóa. Phòng khóa bấm không được. |
| `src/screens/index.ts` | Barrel export 2 màn. |
| `src/AppShell.tsx` | Vỏ điều hướng: `home → map → negotiate` (negotiate = `<App />` Slice 1). |

## Cách bật (1 dòng, Migga làm)

Trong `index.ts`, đổi:

```ts
import App from './App';
```

thành:

```ts
import App from './src/AppShell';
```

Không cần sửa gì khác. `App.tsx` giữ nguyên làm màn đàm phán Phòng 1.

## Việc còn lại (không làm trong nhánh này)

1. **Nút quay lại Home từ vòng đàm phán:** `App.tsx` chưa có. Cần thêm 1 nút "‹ Trang chủ" trong `App.tsx` gọi callback `onExit` — việc của Migga (sửa file Slice 1, ngoài phạm vi nhánh này). Hiện tại thoát vòng = đóng/mở lại app.
2. **Lưu tiến bộ thật:** `progress.ts` đang là seed in-memory — mất khi đóng app. Nối AsyncStorage sau hackathon.
3. **Luồng đàm phán cho Phòng 2–5:** chưa có — bấm vào phòng mở nhưng chưa build thì ở lại Map. Slice 2 (chấm điểm) của Milo có thể nối `completeRoom('rent')` khi thẻ tiết kiệm hiện ra để mở Phòng 2.
4. **Verify:** chưa chạy được `tsc`/`expo start` ở đây (không có `node_modules`, không chạy `npm install` theo yêu cầu). Code viết theo đúng pattern/style của `App.tsx` hiện có (cùng màu `#101418`/`#1b232b`/`#2f81f7`/`#243040`, cùng component RN). Team chạy `npx tsc --noEmit` + `npx expo start` trên máy có deps để kiểm chứng trước khi merge.
