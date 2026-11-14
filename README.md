# Đàm Phán Sống — App luyện kỹ năng đàm phán kiểu Duolingo (Codex hackathon 14/11)

## Chạy
```bash
npm install
cp .env.example .env.local
# điền EXPO_PUBLIC_GEMINI_API_KEY + EXPO_PUBLIC_GROQ_API_KEY
npx expo start --lan
```
Mở **Expo Go** trên điện thoại, nhập địa chỉ `exp://...` hiện trên terminal (điện thoại và máy dev phải cùng wifi).

## Demo
Màn hình setup Phòng 1 (mặc cả giá) → chọn 1 trong 3 tình huống khó (**giá sàn cứng / phòng ẩm mốc / cọc 2 tháng**) → bấm ghi âm, nói → AI (vai chủ trọ) trả lời bằng giọng nói → chốt giá → thẻ tiết kiệm hiện số tiền.

## Không có key
App tự chạy **MOCK MODE** (banner đỏ) — chỉ để test UI/TTS, không phải AI thật.

## Stack
- Expo SDK 58 (Expo Go, không dev build, không native module mới)
- Gemini 3.5-flash-lite (chính) → Groq gpt-oss-20b (dự phòng)
- Ghi âm `expo-audio` → transcribe Gemini → persona đối tác đàm phán (Phòng 1: chủ trọ, giá sàn ẩn, nhượng bộ từng bước) → đọc lại `expo-speech` vi-VN
