# Ghi chú tích hợp

## Luồng ứng dụng

`src/AppShell.tsx` kết nối Home, bản đồ phòng luyện và vòng hội thoại trong `App.tsx`. Phòng 1 có luồng hoạt động; các phòng tiếp theo hiển thị trạng thái sắp có cho tới khi được xây dựng.

## Dữ liệu phòng

`src/lib/rooms.ts` khai báo năm phòng: bán hàng, đàm phán thu nhập, giảng dạy, diễn thuyết, và phát triển tài chính cùng bản thân. Mã phòng đầu tiên là `sales`.

## Hội thoại Phòng 1

- `src/lib/types.ts` định nghĩa khách hàng, người bán, tình huống và lượt hội thoại.
- `src/lib/gemini.ts` chạy persona khách hàng và chuyển giọng nói thành chữ.
- `src/lib/groq.ts` là phương án hội thoại dự phòng.
- `src/lib/mock.ts` mô phỏng phản hồi khi chưa cấu hình khóa API.
- `src/lib/score.ts` giữ nguyên sáu tiêu chí kỹ năng: giá mục tiêu, lý do, điều kiện, kiên trì, lịch sự và chốt đơn.

## Kiểm tra

Chạy `npx tsc --noEmit` để kiểm tra kiểu TypeScript. Không cần khởi động máy chủ phát triển để làm bước này.
