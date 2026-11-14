# RETENTION-SPEC — Đàm Phán Sống: giữ chân + hook

Mục tiêu: user quay lại ngày mai, không phải vì bị ép, mà vì có thứ đang chờ.
Khung chung (Hooked — Eyal): Trigger → Action → Thưởng biến đổi → Đầu tư.
Mỗi vòng luyện xong phải để lại 1 thứ khiến lần mở app sau dễ hơn lần trước.

---

## 1. Chuỗi ngày + 1 lần giữ chuỗi (S)
- **Nguyên lý:** Loss aversion — mất chuỗi đau gấp ~2 lần niềm vui được chuỗi
  (Kahneman & Tversky 1979, trích trong các phân tích về Duolingo). Người có
  chuỗi 7+ ngày giữ chân gấp 2,4 lần người chưa từng lập chuỗi (theo phân
  tích của Propel về Duolingo).
- **Làm:** `src/screens/HomeScreen.tsx` + `src/lib/roomProgress.ts` (nối dây
  `awardDailyGoal` đã có sẵn, hiện chưa có caller). Hiện số chuỗi to, rõ.
  Copy: `Chuỗi 3 ngày — mai luyện tiếp để giữ chuỗi`
  Mất 1 ngày: cho 1 lần giữ chuỗi miễn phí, copy trung tính:
  `Hôm qua bạn bận — giữ chuỗi 1 lần miễn phí, mai quay lại nhé`
- **Nỗ lực:** S (chỉ nối dây có sẵn + copy, 1 flag giữ chuỗi).

## 2. Phút đầu tiên thắng ngay (S)
- **Nguyên lý:** Fogg B=MAP — hành vi xảy ra khi Động lực + Khả năng + Lời
  nhắc cùng lúc; động lực unreliable nên đánh vào Khả năng: làm thật dễ.
  Time-to-value: Duolingo cho user xong bài đầu + XP đầu trong 60 giây;
  flow kéo dài quá 10 phút tới giá trị thì bỏ cuộc tăng ~3 lần (theo
  vmobify, trích Amplitude). 70–80% user mới mất trong 3 ngày đầu.
- **Làm:** `src/screens/HomeScreen.tsx` — nút chính to nhất là
  `Luyện nhanh 1 phút`, bấm là vào thẳng scenario ngắn nhất, mic sẵn sàng,
  KHÔNG qua form setup trước. Copy phụ: `Mở miệng là thắng — 60 giây thôi`
- **Nỗ lực:** S (copy + đổi đích mặc định của CTA chính).

## 3. Thưởng biến đổi ở thẻ thắng (S)
- **Nguyên lý:** Hooked — thưởng BIẾN ĐỔI (không đoán trước) giữ chân hơn
  thưởng cố định. Loại "thưởng của bản thân": cảm giác thành thạo, hoàn thành.
- **Làm:** màn hình điểm/thẻ thắng (`App.tsx` + `src/lib/score.ts`) — sau mỗi
  buổi, hiện thêm 1 `Câu vàng` rút NGẪU NHIÊN từ `src/data/skill-content.json`
  (38 kỹ thuật có sẵn) + thỉnh thoảng (khoảng 1/3 buổi) thưởng bất ngờ +10 XP.
  Copy: `Câu vàng hôm nay: <tên kỹ thuật>` / `Thưởng bất ngờ +10 XP`
- **Nỗ lực:** S (random từ mảng có sẵn, không thêm dữ liệu).

## 4. Cam kết mục tiêu ngày (S)
- **Nguyên lý:** Cialdini — Commitment & Consistency: đã cam kết (dù nhỏ,
  tự chọn) thì hành vi sẽ uốn theo cho nhất quán.
- **Làm:** lần mở đầu tiên: 1 chạm chọn mục tiêu `Mỗi ngày 1 buổi` (không
  form dài). Lưu 1 chuỗi vào `src/lib/roomProgress.ts`. `HomeScreen` nhắc lại
  cam kết của chính user: `Bạn đã hứa với chính mình: 1 buổi mỗi ngày`
  + `Hôm nay: 0/1 buổi — 1 phút là xong`
- **Nỗ lực:** S (1 giá trị lưu trữ + copy).

## 5. "Còn X nữa lên cấp" (S)
- **Nguyên lý:** Goal-gradient (Hull 1932; Kivetz và cộng sự 2006, nghiên
  cứu thẻ cà phê): càng gần đích càng tăng tốc. Endowed progress
  (Nunes & Drèze 2006): cho sẵn 1 đoạn tiến độ đầu thì hoàn thành nhanh hơn.
- **Làm:** `src/components/gamification/*` + `src/lib/gamification.ts` (XP
  economy đã có) — thanh XP luôn hiện khoảng cách tới cấp sau, không chỉ
  tổng XP: `Còn 40 XP nữa lên Cấp 3 — 1 buổi luyện là đủ`
  Tặng khởi động: user mới nhận ngay 20 XP, thanh cấp 1 bắt đầu ở ~20% thay
  vì 0%: `Tặng 20 XP khởi động — bạn đã đi được 1 đoạn rồi`
- **Nỗ lực:** S (copy + 1 hằng số XP khởi động).

## 6. So với chính mình tuần trước (S)
- **Nguyên lý:** Cialdini — Social Proof mạnh nhất khi "người khác" giống
  mình; Duolingo dùng league (so với người khác) — ở đây dùng bản an toàn:
  so với chính mình, KHÔNG bịa số người dùng.
- **Làm:** `src/screens/HomeScreen.tsx` — dòng so sánh từ XP thật đã lưu:
  `Tuần này bạn hơn tuần trước 40 XP — giữ đà này!`
  Chưa có dữ liệu tuần trước: `Tuần đầu tiên — đặt nền móng đi!`
- **Nỗ lực:** S (tính từ progress đã lưu + copy; không có dữ liệu thì
  fallback, không bịa số).

## 7. Tặng trước, nhận sau (S)
- **Nguyên lý:** Cialdini — Reciprocity: nhận giá trị trước thì muốn đáp lại.
- **Làm:** sau buổi luyện đầu tiên, mở toàn bộ lộ trình xem trước, copy ở
  `src/components/RoadmapScreen.tsx`:
  `Tặng bạn lộ trình 5 phòng, 38 kỹ thuật — không cần đăng ký, cứ luyện`
  (5 phòng + 38 kỹ thuật là dữ liệu thật từ content-pack.)
- **Nỗ lực:** S (copy + đảm bảo roadmap hiện sau buổi 1).

## 8. Sổ tay đàm phán — giá trị tích lũy (M)
- **Nguyên lý:** Hooked — Investment: thứ user bỏ vào (thời gian, câu hay
  của chính mình) trở thành stored value, càng dùng càng khó bỏ, và nó load
  trigger cho lần sau.
- **Làm:** mỗi buổi xong, lưu câu được điểm cao nhất (từ `src/lib/score.ts`)
  vào sổ tay trong `src/lib/roomProgress.ts`. `HomeScreen` hiện 1 mục:
  `Sổ tay của bạn: 4 câu hay nhất` + lời nhắc quay lại:
  `Sổ tay đang chờ câu tiếp theo`
- **Nỗ lực:** M (1 danh sách local nhỏ + 1 mục HomeScreen; ~30 phút).

---

## KHÔNG làm (dark patterns — cấm)
- **Không đếm ngược giả / khan hiếm giả** ("Chỉ còn 1 suất!", "Ưu đãi hết
  trong 04:37") — deceptive.design (Brignull, 2010) xếp fake urgency là
  dark pattern; chỉ hiện urgency khi có thật.
- **Không confirmshaming / dọa bằng tội lỗi** ("Bạn đã phá hỏng chuỗi rồi",
  "Bỏ là thua đấy") — mất chuỗi thì nói trung tính: `Chuỗi dừng ở 5 ngày —
  bắt đầu chuỗi mới nhé`. Tối đa 1 lời nhắc/ngày, đúng giờ user hay luyện.
- **Không bịa số người dùng** ("2.314 người đang luyện") — mọi con số hiện
  ra phải là dữ liệu thật của chính user (XP, chuỗi, tuần trước).
- **Không khóa điểm số sau paywall** — điểm là phần thưởng, không phải mồi
  nhử trả tiền; không bắt share mới xem được kết quả.
- **Check cuối (Manipulation Matrix — Eyal):** "Mình có dùng app này
  không? Nó có giúp user thật không?" — câu nào trả lời không thì đừng làm.

## Thứ tự làm (còn ít thời gian)
1 → 2 → 5 (copy + nối dây có sẵn, xong trong ~15 phút) → 3 → 4 → 7 → 6 → 8.
Nguồn đầy đủ: xem `SOURCES.md` cùng thư mục. Sách gốc chưa đọc toàn văn —
xem ghi chú CHƯA ĐỌC trong đó.
