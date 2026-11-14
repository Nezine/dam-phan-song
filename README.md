# Đàm Phán Sống — AI luyện kỹ năng thuyết phục bằng giọng nói

## Chạy ứng dụng

```bash
npm install
cp .env.example .env.local
# điền EXPO_PUBLIC_GEMINI_API_KEY và EXPO_PUBLIC_GROQ_API_KEY
npx expo start --lan
```

Mở Expo Go trên điện thoại và kết nối cùng mạng Wi-Fi với máy chạy ứng dụng.

## Phòng 1

Người chơi vào vai người bán máy pha cà phê mini, luyện tư vấn cho khách hàng đang cân nhắc mua. Giá niêm yết mặc định là **5.000.000đ**, giá mục tiêu là **4.500.000đ**; ngân sách tối đa của khách hàng được giữ trong tình huống, không có ô nhập trên màn hình.

Người chơi có thể chọn một trong bốn băn khoăn: giá, nhu cầu, niềm tin hoặc thời điểm. Khi khách đồng ý mua, thẻ kết quả hiện giá chốt và phần chênh so với giá mục tiêu.

## Không có khóa API

Ứng dụng chạy chế độ mô phỏng để trình diễn giao diện và giọng đọc. Khi có khóa API, Gemini xử lý chính và Groq là phương án dự phòng.

## Công nghệ

- Expo SDK 58, React Native và TypeScript
- Gemini và Groq cho hội thoại; `expo-audio` ghi âm, Gemini chuyển lời nói thành chữ, `expo-speech` đọc phản hồi tiếng Việt
- Tiến độ lưu cục bộ trên thiết bị
