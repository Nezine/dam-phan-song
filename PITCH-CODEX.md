# Đàm Phán Sống — Pitch 3:00 (Codex draft + redteam)

- Tổng thời gian: **3:00, 6 nhịp × 30 giây**, theo PITCH.md / slide của địa điểm. Không phải 5:00.
- Demo: live trên OPPO A60 suốt bài pitch, không slide trong lúc demo. Kill-and-reopen app trước giờ pitch.
- Nguồn: Codex (3 calls, xem log cuối file) + redteam của Codex + sửa tay theo bằng chứng trong repo.
- Nhánh: `migga/pitch-codex`, base `e63a38e`. Chỉ thêm file này, không sửa code app.

## Kịch bản cuối — 3:00

### Nhịp 1 — Vấn đề (00:00–00:30)
*[Cầm điện thoại, app đã mở sẵn ở Phòng 1 · Giá sàn cứng. Không chiếu slide.]*

Ai cũng từng đứng trước một cuộc nói chuyện khó mà không biết mở lời — xin giảm tiền trọ, giữ tiền cọc, xin tăng lương. Biết mình đúng, nhưng sợ mất phòng, sợ bị từ chối, nên gật đại một điều khoản bất lợi. Vấn đề không phải thiếu lời khuyên — mà là chưa từng được tập nói, dưới áp lực, trước khi bước vào cuộc thật.

### Nhịp 2 — Giải pháp (00:30–01:00)
*[Mở app, chọn Phòng 1. Cuối nhịp: bấm ghi âm.]*

Đàm Phán Sống là chỗ tập cho những cuộc đó — Duolingo cho đàm phán. Mở app, chọn phòng tập, rồi nói chuyện bằng giọng nói với một nhân vật AI có mục tiêu và giá sàn cố định 3,2 triệu riêng. Phòng 1 là tiền trọ, chỉ là phòng đầu tiên. Tình huống, nhân vật, luật chơi đã dọn sẵn — không bắt đầu từ ô chat trống. ChatGPT là cái bếp trống — bọn em là món ăn đã dọn sẵn.

### Nhịp 3 — Vì sao bây giờ, vì sao chúng tôi (01:00–01:30)
*[NÓI VÀO ĐIỆN THOẠI, câu 1 (~8s): "Em thích phòng này, ở lâu dài được. Ngân sách của em là 3 triệu một tháng, đóng đúng hạn — anh cân nhắc giúp em được không ạ?"]*
*[IM LẶNG (trong ngân sách 30 giây/lượt) — nghe nhân vật trả lời bằng giọng nói.]*

AI giọng nói giờ đủ tốt để tập một cuộc đối thoại thật. Nhân vật có tính cách và giá sàn riêng — 5 lượt nài giá, chạm sàn lượt 2, không xuống thấp hơn. *[Câu này CÓ THỂ BỎ nếu AI trả lời lâu — nhịp 4 vẫn đủ ý.]*

### Nhịp 4 — Thị trường (01:30–02:00)
*[Nói đủ nhịp. Cuối nhịp: bấm ghi âm, chuẩn bị câu 2.]*

Thị trường là tất cả những ai phải đàm phán trong đời sống và công việc — tiền trọ, lương, mua bán, phỏng vấn. Người Việt trẻ luyện kỹ năng trên điện thoại là nhóm chúng em chạm tới đầu tiên. Chúng em chưa có số liệu đủ tin cậy để chốt TAM/SAM/SOM — mục tiêu đo được là 100 người luyện tập trong tuần đầu, rồi đo họ luyện phòng nào và có quay lại không.

### Nhịp 5 — Bằng chứng + mô hình (02:00–02:30)
*[NÓI VÀO ĐIỆN THOẠI, câu 2 (~8s): "Vậy mình chốt 3 triệu 2, em ký 6 tháng, đóng đúng ngày — được không anh?"]*
*[IM LẶNG (trong ngân sách 30 giây/lượt) — chủ trọ chốt, màn hình điểm hiện lên. Giơ màn hình về phía giám khảo.]*

Sáu quy tắc cố định — câu yếu nhất hiện nguyên văn kèm lý do. Đây là bằng chứng, không phải lời hứa.

### Nhịp 6 — Lời mời (02:30–03:00)
*[Giữ màn hình điểm, nhìn khán giả.]*

Chúng em cần 100 người dùng thử đầu tiên để đo nhu cầu thật — phòng nào họ luyện, họ có quay lại không. Hôm nay app lưu 3 chỉ số: số buổi, tổng tiền tiết kiệm được, điểm cao nhất. Roadmap, XP, cấp độ — đó là bước tiếp theo, chưa có trong bản này. Đàm Phán Sống: tập trước, để bước vào cuộc thật với sự chuẩn bị tốt hơn. Cảm ơn ban giám khảo.

---

## Dàn dựng demo + phương án dự phòng

- Trước 16:15: kill-and-reopen app trên OPPO A60, mở sẵn Phòng 1 · Giá sàn cứng (Hà Nội, rao 3,5tr, sàn 3,2tr). Để điện thoại ở chế độ không khóa màn hình.
- Nhịp 3 và 5 có khoảng IM LẶNG thật — đừng nói chen vào lúc AI đang trả lời, giám khảo cần nghe nhân vật.
- **Rủi ro lớn nhất (redteam chỉ ra): một lượt AI (ghi âm → transcribe → Gemini → đọc lại) không đảm bảo vừa trong ngân sách 30 giây/lượt, nhất là trên wifi hội trường.** Một lượt = tối đa 30 giây (nói + chờ). Hết ngân sách mà AI chưa trả lời thì đi tiếp phần nói của nhịp sau; chỉ quay lại cứu khi còn thời gian và không được cắt nhịp 5 hay 10 giây giữ màn hình điểm — thứ tự cứu: thử nói lại 1 lần (chỉ nhịp 3) → gõ đúng câu vào ô tin nhắn. Không có video dự phòng (Tuấn đã giết — không quay gì nữa), không bao giờ giơ màn hình điểm của lượt tập trước. Nếu tới nhịp 5 vẫn không có gì để chốt thì nói thẳng: lượt trực tiếp chưa chốt được nên chưa có điểm, rồi nói nhịp 6 trên nền màn hình chat dở dang. Không có nút chuyển sang mock live.
- Câu 2 đã tính để chốt đúng sàn (3,2tr): nếu chủ trọ trả giá khác, cứ chốt theo giá nó đưa miễn là ≥ sàn, điểm số vẫn hiện.
- Các câu nói trong nhịp 3 và 6 được đánh dấu CÓ THỂ BỎ — nếu demo lố giờ, bỏ chúng trước, không bỏ nhịp 5.

## Thẻ hỏi–đáp (dự kiến giám khảo hỏi sau pitch)

### 1. "Sao không dùng ChatGPT miễn phí là đủ?"
ChatGPT là ô chat trống: bạn phải tự viết tình huống, tự đặt vai, tự đặt luật — rồi nó nhượng nhanh, không nhất quán, không chấm điểm, không lưu tiến độ. Bọn em khác ở 4 điểm đã demo: phòng tập dựng sẵn, mở là tập; nhân vật có sàn cố định 3,2 triệu và giữ sàn (test 5 lượt nài, chạm sàn lượt 2, không xuống thấp hơn; code cũng chặn chốt dưới sàn); 6 quy tắc chấm cố định, chỉ ra câu yếu nhất kèm lý do; tiến độ được lưu. Luyện bằng giọng nói, tiếng Việt, trên điện thoại.

### 2. "Sao không mặc cả thật trên Zalo luôn?"
Zalo là cuộc thật, không phải phòng tập: một câu sai mất tiền thật, mất lòng thật — không có điểm số, không có làm lại. App là phòng tập: cùng áp lực, không hậu quả, chấm điểm từng câu, tập lại bao nhiêu lần cũng được. Cứng tay rồi mới ra Zalo mà chốt.

### 3. "Phòng 2–5 đâu?"
Chưa ship — chỉ có Phòng 1 hôm nay. Tiếp theo, theo kế hoạch: tiền cọc, lương part-time, phỏng vấn xin việc, hỏi–đáp gọi vốn. Thứ tự do 100 người dùng thử đầu tiên quyết định — họ muốn luyện phòng nào nhất thì bọn em làm phòng đó. Roadmap, XP, cấp độ cũng là bước tiếp theo, chưa có trong bản demo hôm nay, nên bọn em không hứa ngày cụ thể.

---

## Những điểm đã sửa theo redteam (Codex call 3)

1. **Demo vừa đồng hồ:** bản nháp đầu nói liên tục trong lúc demo chạy — không khả thi. Bản cuối chèn khoảng IM LẶNG thật ở nhịp 3 và 5, đánh dấu câu droppable, và có thang cứu theo runbook (thử lại → gõ chữ; không có video dự phòng).
2. **Bỏ claim chưa chứng minh:** bản nháp nói "sau quy tắc" mơ hồ → sửa thành "sáu quy tắc cố định"; freemium chỉ nói là hướng đi, không nói "các phòng cốt lõi miễn phí" như đã chốt.
3. **Thị trường:** bản nháp gắn nhãn TAM/SAM/SOM rỗng, không số, không nguồn. Bản cuối GIỮ nhãn (slide địa điểm yêu cầu) nhưng nói thẳng là chưa có số liệu đủ tin cậy, chỉ đưa mục tiêu đo được (100 người tuần đầu).
4. **Khung rộng:** bản nháp mở đầu bằng tiền trọ rồi mới gỡ. Bản cuối mở bằng "cuộc nói chuyện khó" nói chung, tiền trọ chỉ là một ví dụ trong liệt kê, Phòng 1 được gọi là "phòng đầu tiên".
5. **Sàn:** bản nháp nói chung chung "không nhượng dưới sàn". Bản cuối dùng đúng số test: "5 lượt nài giá, chạm sàn lượt 2, không xuống thấp hơn".
6. **Câu bếp trống:** redteam chê ẩn dụ này khó hiểu, dễ bị hỏi "có phải chỉ là prompt wrapper". Giữ lại vì là câu one-liner đã chốt của team ("ChatGPT là cái bếp trống — bọn em là món ăn đã dọn sẵn"), nhưng đặt sau một câu dẫn thẳng ("Tình huống, nhân vật, luật chơi đã dọn sẵn — không bắt đầu từ ô chat trống") để giám khảo hiểu ngay.
7. **Câu "4 người + 4 trợ lý AI xây trong một ngày" bị cắt** vì không đủ chỗ trong 30 giây nhịp 3 — demo live tự chứng minh năng lực team.

## Claim CHƯA chứng minh được — không nói trên sân khấu

- **Số liệu TAM/SAM/SOM:** không có số nguồn nào. Nhịp 4 đã nói thẳng điều này. Đừng tự bịa số khi bị hỏi dồn — trả lời "chưa có, mục tiêu đầu tiên là đo 100 người dùng thử".
- **"100 người tuần đầu":** là mục tiêu, không phải traction. Đừng trình bày như đã có người dùng.
- **Độ trễ của lượt AI live:** chưa đo trên wifi hội trường. Phương án dự phòng ở trên là bắt buộc, không phải tùy chọn.
- **Phòng 2–5, roadmap, XP, cấp độ:** chưa ship (thẻ Q&A số 3 đã nói rõ).

## Claim ĐÃ kiểm chứng trong repo (tự đọc code, không phải Codex đọc)

- Gemini 3.5-flash-lite là model chính, Groq `openai/gpt-oss-20b` là fallback khi Gemini lỗi (`src/lib/gemini.ts`, `src/lib/groq.ts`, `App.tsx` thử Gemini trước rồi mới Groq).
- Đọc lại bằng giọng tiếng Việt: `Speech.speak(text, { language: 'vi-VN' })` (`App.tsx:123`).
- Chốt dưới sàn bị chặn bằng code ở CẢ hai đường mock và live-AI: `reply.agreedPrice >= scenario.floorPrice` (`App.tsx:220` + `:247`).
- 6 quy tắc chấm + câu yếu nguyên văn: `src/lib/score.ts`.
- Chỉ 3 chỉ số tiến độ được lưu: sessions, totalSaved, bestScore (`src/lib/progress.ts`, ghi ở `App.tsx:157`). File `src/lib/gamification.ts` (XP/level) tồn tại nhưng KHÔNG nối vào luồng demo — không được claim là đã ship.
- 3 twist Phòng 1: giá sàn cứng HN 3,5tr/3,2tr; ẩm mốc TP.HCM 3tr/2,7tr; cọc 2 tháng ĐN 4tr/3,6tr (`App.tsx:56-88`).

## Log Codex (đốt credit theo lệnh owner)

Codex trên máy này KHÔNG đọc/ghi/chạy file được (thiếu binary `codex-code-mode-host` — đã kiểm chứng), nên mọi context đều được paste vào prompt, Codex chỉ trả text.

1. **Call 1 — nháp 5:00 (ĐÃ HỦY):** 8.716 tokens, session không ghi lại. Giả định 5:00 theo brief gốc — SAI, PITCH.md/slide địa điểm quy định 3:00. Bản này đã bỏ, không dùng.
2. **Call 2 — nháp 3:00:** 8.616 tokens, session `01a1d90e-3a1c-7bd0-a5db-15c58ef6ccba`, model `gpt-6-luna`. Ra đủ 6 nhịp × 30s, demo chạy xuyên suốt.
3. **Call 3 — redteam bản 3:00:** 9.258 tokens, session `01a1d90e-cc9f-7a22-81f8-d0aa47ac948a`, model `gpt-6-luna`. Chấm FAIL ở 5/7 mục (claim, timing, frame, market, câu yếu nhất) + 2 câu hỏi giám khảo khó nhất + top 3 fix — đã áp dụng ở trên, trừ 2 điểm có ghi chú (câu bếp trống giữ theo chốt của team; nhãn TAM/SAM/SOM giữ theo slide địa điểm).
4. **Tổng task này: 26.590 tokens** (8.716 + 8.616 + 9.258). Không file nào bị Codex sửa — đúng như dự kiến.
