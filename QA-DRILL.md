# Q&A DRILL — 5 câu khó nhất sau pitch 3:00 (Đàm Phán Sống)

- Pitch 16:15, 3:00, 6 nhịp, demo live Phòng 1 (hardline, HN, rao 3,5tr, sàn 3,2tr) trên OPPO A60.
- File này là 5 câu TIẾP THEO — không lặp lại 5 câu đã có: (1) sao không dùng ChatGPT, (2) sao không mặc cả thật trên Zalo, (3) Phòng 2–5 đâu (đều trong `PITCH-CODEX.md`); (4) chủ nhà chốt sớm / không chốt, (5) mạng chậm thì cái gì chạy trên máy (đều trong `DEMO-RUNBOOK.md` §8).
- Quy tắc: mỗi câu trả lời nói được trên sân khấu, ≤60 từ (đã đếm bằng script). Nói thật phần chưa chứng minh — không bịa user, doanh thu, hay số TAM/SAM/SOM.
- Nguồn: Codex call 1 (nháp, 9.209 token) + Codex call 2 (redteam kiểu giám khảo thù địch, 8.721 token) — xem log cuối file. Codex chỉ trả text (không đọc/ghi file được); mọi bằng chứng file:line dưới đây do agent tự đọc code.

## Q1 — "Đây chẳng phải chỉ là prompt wrapper trên Gemini sao?"

**Trả lời (59 từ):** "Gemini xử lý hội thoại, nhưng sản phẩm không chỉ là prompt: bộ chấm điểm theo sáu luật cố định, kèm câu yếu nguyên văn và lý do mất điểm. Phần này đã chạy được; chúng tôi chưa chứng minh nó đủ khác biệt để người dùng trả tiền. Tiếp theo: đo quay lại và sẵn lòng trả tiền."

**Bằng chứng:**
- Hội thoại = Gemini thật: `src/lib/gemini.ts:102` (model `gemini-3.5-flash-lite`, temp 0.9, JSON schema); fallback Groq `openai/gpt-oss-20b` (`src/lib/groq.ts:1,6,18`).
- Nhưng sản phẩm có phần KHÔNG phải prompt: `src/lib/score.ts:96` — chấm điểm rule-based, 6 luật cố định R1–R6 (`score.ts:105-152`), câu yếu nguyên văn (`score.ts:197+`); chặn chốt dưới sàn ở cấp mã cả hai đường mock và live (`App.tsx:313-319`, `App.tsx:348-354`).

**DO NOT SAY:** "Chúng tôi có mô hình AI độc quyền." — không có model riêng; lớp AI thay thế được.

**Giám khảo sẽ hỏi dồn:** "Vậy anh thừa nhận lớp AI thay thế được. Ngoài prompt ra, anh đã xây được gì?" → Trả lời bằng bộ chấm điểm + chặn sàn ở trên, đừng quay lại cãi về model.

## Q2 — "Người chơi gian lận điểm thì sao? Chủ nhà nói bừa giá dưới sàn bằng lời thì sao?"

**Trả lời (59 từ):** "Điểm tính bằng luật cố định, không phải AI tự chấm theo cảm tính. Cả luồng mock lẫn live đều chặn ở cấp mã: kết quả dưới sàn không tính là thắng. Chúng tôi chưa chứng minh điểm không thể bị tối ưu câu chữ. Tiếp theo: thử các cách chơi điểm, kiểm tra mọi kết quả chạm sàn."

**Bằng chứng:**
- Điểm = luật cố định, không phải AI chấm: `src/lib/score.ts:105-152` (R1 giá mục tiêu, R2 lý do, R3 điều khoản, R4 kiên trì, R5 lịch sự, R6 chốt); câu yếu = lượt không thêm thông tin mới (`score.ts:197+`).
- Chốt dưới sàn bị chặn bằng code: `App.tsx:313-319` (mock) + `App.tsx:348-354` (live) — `agreed` dưới sàn → hiện câu từ chối, không có màn hình điểm; mock cũng chặn (`src/lib/mock.ts:92,113`).
- Nhưng lời NÓI của AI thì code không chặn được: temp 0.9 (`gemini.ts:102`) — chủ nhà có thể NÓI giá dưới sàn, chỉ có kết quả chốt là bị chặn. Runbook đã dặn người demo chặn bằng miệng (mục 3, câu chốt).

**DO NOT SAY:** "Không thể gian lận điểm" hoặc "AI không bao giờ nói sai giá." — cả hai đều chưa chứng minh; điểm keyword-based hoàn toàn có thể bị tối ưu câu chữ.

**Giám khảo sẽ hỏi dồn:** "Anh chưa chứng minh điểm chống được gian lận. Sao tôi tin điểm này, hay tin chủ nhà không tuyên bố một deal giả?" → Thừa nhận điểm chưa thử chống gian lận; giữ vững phần đã chứng minh: kết quả chốt dưới sàn không bao giờ được tính thắng.

## Q3 — "Sao đây là một doanh nghiệp, chứ không phải một tính năng Duolingo hay ChatGPT thêm trong một tuần?"

**Trả lời (55 từ):** "Chúng tôi chưa có moat được chứng minh; chỉ phòng 1 đã giao, phòng 2–5 mới là bản đồ kịch bản. Phần đã chạy: hội thoại giọng nói tiếng Việt, chấm điểm theo luật, lưu tiến độ cục bộ, chặn giá dưới sàn. Tiếp theo: đo người học có quay lại và trả tiền không."

**Bằng chứng:**
- Bản đồ 5 phòng tồn tại nhưng chỉ Phòng 1 chơi được: `src/lib/rooms.ts:5` (5 RoomId: rent, deposit, salary-parttime, interview, investor), `rooms.ts:21` (bảng ROOMS) — Phòng 2–5 là dữ liệu, chưa có vòng chơi.
- Phần đã chạy: hội thoại giọng nói (`gemini.ts`, transcribe Gemini-only), chấm điểm theo luật (`score.ts:96`), lưu tiến độ cục bộ không tài khoản (`src/lib/progress.ts:38`, file `dam-phan-song-progress.json`), chặn sàn (`App.tsx:313-319`).

**DO NOT SAY:** "Chúng tôi có lợi thế cạnh tranh bền vững" hoặc "5 phòng đã xong." — moat chưa chứng minh; chỉ 1 phòng chơi được.

**Giám khảo sẽ hỏi dồn:** "5 phòng? Anh vừa nói phòng 2–5 chưa giao. Đây có thật là hơn một tính năng không?" → Đừng cãi: thừa nhận chỉ 1 phòng đã giao, phòng 2–5 là bản đồ kịch bản; phần đã chạy là 4 mục liệt kê trên.

## Q4 — "Giá sàn đã nói ngay câu mở đầu — vậy còn bí mật gì, và người chơi học được gì?"

**Trả lời (59 từ):** "Giá sàn 3,2 triệu được nói rõ; đây không phải bài kiểm tra phát hiện bí mật. Người chơi luyện thương lượng bằng sáu luật chấm cố định, phản hồi nêu nguyên văn câu yếu, và persona có quy tắc công bằng. Kỹ năng chuyển sang đời thật chưa chứng minh. Tiếp theo: đo trước và sau luyện tập."

**Bằng chứng:**
- Sàn KHÔNG bí mật trong twist demo: `App.tsx:67` — câu mở đầu hardline (TTS đọc ngay khi vòng bắt đầu): "Giá này là giá sàn rồi em, dưới 3 triệu 2 anh không cho thuê đâu, có người khác đang chờ cọc rồi."
- Lưu ý mâu thuẫn nội bộ đã biết: prompt persona ghi "Giá sàn là bí mật, không bao giờ nói ra" (`gemini.ts:22`) nhưng câu mở đầu preset lại nói ra — bản pitch/runbook đã sửa wording thành "sàn cố định 3,2 triệu", KHÔNG gọi là bí mật (xem CONSISTENCY.md, C5). Đừng bao giờ nói "bí mật" trên sân khấu.
- Cái người chơi luyện: 6 luật chấm (`score.ts:105-152`) + quy tắc công bằng trong persona — chỉ giảm khi có nội dung thuyết phục MỚI (`gemini.ts:31`).

**DO NOT SAY:** "Người chơi phải khám phá giá sàn." — twist demo đã nói rõ sàn ngay từ đầu.

**Giám khảo sẽ hỏi dồn:** "Sàn đã công khai, lại chưa chứng minh chuyển giao kỹ năng — vậy anh đang claim mình dạy được gì?" → Đừng claim chuyển giao; claim đúng: người chơi luyện theo 6 luật có phản hồi cụ thể, và việc đo chuyển giao là bước tiếp theo.

## Q5 — "Chưa có người dùng, chưa có số thị trường — sao tin ai đó sẽ trả tiền?"

**Trả lời (59 từ):** "Chúng tôi chưa có người dùng hay bằng chứng họ sẽ trả tiền, và chưa có số TAM/SAM/SOM; mục tiêu 100 người tuần đầu chỉ là mục tiêu. Điều đã chứng minh: demo chạy trên điện thoại thật với chấm điểm theo luật và chặn sàn ở cấp mã. Tiếp theo: đo quay lại và sẵn lòng trả tiền."

**Bằng chứng:**
- Không có user, không có số: pitch nhịp 4 đã nói thẳng (xem `PITCH-CODEX.md` — "chưa có số liệu đủ tin cậy để chốt TAM/SAM/SOM"); "100 người tuần đầu" là mục tiêu, không phải traction.
- Không có tài khoản/cloud để đo user: tiến độ chỉ lưu cục bộ trên máy (`src/lib/progress.ts:38` — 3 chỉ số: số buổi, tổng tiền tiết kiệm, điểm cao nhất).

**DO NOT SAY:** "Đã có nhu cầu thị trường", hoặc nêu doanh thu / traction / TAM/SAM/SOM như số thật. — không có số nào cả.

**Giám khảo sẽ hỏi dồn:** "Không khách hàng, không sizing thị trường, không bằng chứng sẵn lòng trả tiền. Sao tôi tin đây là một doanh nghiệp?" → Đừng bịa; quay về điều đã chứng minh (demo thật + chấm điểm + chặn sàn) và bước đo tiếp theo.

---

## Những điểm đã sửa theo redteam (Codex call 2)

1. **Bản nháp đầu quá phòng thủ:** cả 5 câu đều kết bằng "chưa chứng minh được" mà không nêu phần đã xây. Call 2 chấm Q1/Q3/Q4 là over-concede, Q2/Q5 là fair. Bản cuối dẫn bằng phần đã chạy được, chỉ nhượng đúng phần chưa chứng minh.
2. **Q1:** thêm bộ chấm điểm + chặn sàn làm "phần đã xây" — không claim moat, không claim model riêng.
3. **Q3:** ghi rõ phòng 2–5 chỉ là "bản đồ kịch bản", không phải phòng đã giao — tránh bị hỏi dồn là nói quá.
4. **Q4:** bỏ hẳn từ "bí mật" (theo C5 trong CONSISTENCY.md); thêm quy tắc công bằng (`gemini.ts:31`) làm nội dung người chơi luyện.
5. **Q5:** dẫn bằng "chưa có" trước, rồi mới nói điều đã chứng minh — thứ tự này quan trọng: giám khảo nghe sự thật trước thì tin phần sau hơn.

## Log Codex (đốt credit theo lệnh owner)

Codex trên máy này KHÔNG đọc/ghi/chạy file được (thiếu binary `codex-code-mode-host` — đã kiểm chứng), nên mọi context đều được paste vào prompt, Codex chỉ trả text.

1. **Call 1 — nháp 5 câu:** **9.209 token.** Nháp đủ 5 câu, trung thực nhưng quá phòng thủ; không ghi được số dòng cho một số bằng chứng (agent tự bổ sung file:line bằng cách đọc code).
2. **Call 2 — redteam kiểu giám khảo thù địch:** **8.721 token.** Chấm Q1/Q3/Q4 over-concede, Q2/Q5 fair; đưa câu hỏi dồn cho từng câu; viết lại 5 câu trả lời (bản gốc 62–72 từ — agent cắt tay xuống ≤60 từ, giữ nguyên ý).
3. **Tổng task này: 17.930 token** (9.209 + 8.721). Không file nào bị Codex sửa — đúng như dự kiến.

## Không verify được

- Độ trễ AI live ở venue (ngân sách 30 giây/lượt chưa đo) — nếu demo chậm, câu trả lời Q&A không đổi, chỉ phần demo đổi theo runbook.
- Chủ nhà có chốt đúng 3,2tr ở vòng live không (temperature 0.9) — nếu không chốt, nhánh B runbook áp dụng; Q2 vẫn đúng vì chặn sàn là ở cấp mã.
- Điểm có bị gian lận được không — chưa thử; Q2 nói thẳng điều này, đừng claim ngược lại khi bị hỏi.
- Kỹ năng có chuyển sang đời thật không — chưa đo; Q4 nói thẳng điều này.
