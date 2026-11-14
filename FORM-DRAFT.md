# FORM DRAFT — Codex Community Hackathon – Hanoi | Nộp sản phẩm

- Form: "Codex Community Hackathon – Hanoi | Nộp sản phẩm / Project Submission", deadline **16:30 ngày 14/11/2026** (giờ Việt Nam). Tất cả 11 ô đều bắt buộc, toàn chữ tự do.
- Cách dùng: copy từng ô bên dưới vào form. Các ô đánh dấu **TODO** phải điền tay — không đoán.
- Nguồn: Codex call 1 (draft, 8.802 token) + call 2 (redteam, xem log cuối file). Codex trên máy này KHÔNG đọc/ghi/chạy file được (thiếu binary `codex-code-mode-host` — đã kiểm chứng), nên mọi câu trả lời đều do agent viết tay từ facts đã kiểm chứng + 2 bản Codex trả về.
- Nhánh: `migga/form-draft`. Chỉ thêm file này, không sửa code app, không nộp form.

## 1. Email — TODO

> TODO — điền email của người đại diện nộp bài (submitter). Không đoán.

DO NOT CLAIM: Không đoán email người nộp.

## 2. Tên đội / Team name

> Optimus

DO NOT CLAIM: Không thêm/bớt thành viên, không đổi tên đội.

## 3. Tên sản phẩm / Product name

> Đàm Phán Sống

DO NOT CLAIM: Không đổi tên sản phẩm.

## 4. Thành viên thực tế / Actual team members — TODO

> TODO — ghi họ tên + email đăng ký Luma của từng thành viên, mỗi người một dòng:
> - Trần Hoàng Anh — [email Luma?]
> - Phạm Tuấn Huy — [email Luma?]
> - Nguyễn Vũ Đức Thịnh — [email Luma?]
> - Ngọc Anh — [email Luma?]
>
> Email Luma của 3 thành viên chưa có — phải hỏi trực tiếp, không đoán. Nếu ai được BTC duyệt ngoài Luma thì dùng email đã cung cấp cho BTC.

DO NOT CLAIM: Không đoán bất kỳ email Luma nào.

## 5. Người dùng, vấn đề và bằng chứng / Users, problem, and evidence

> Đàm Phán Sống hướng đến người muốn luyện những cuộc trò chuyện khó và kỹ năng đàm phán trong đời sống. Vấn đề app nhắm tới: nhiều người đứng trước một cuộc nói chuyện khó mà không biết mở lời — sợ mất phòng, sợ bị từ chối nên gật đại một điều khoản bất lợi. Phòng demo là thương lượng tiền thuê nhà ở Hà Nội: giá niêm yết 3,5 triệu/tháng, mức sàn 3,2 triệu. Bằng chứng đã đo: trong thử nghiệm 5 lượt người thuê nài giá, giá chạm sàn ở lượt 2 và không xuống thấp hơn. Ứng dụng lưu phiên luyện tập, tổng số tiền tiết kiệm và điểm cao nhất trên thiết bị.

DO NOT CLAIM: Vấn đề trên là vấn đề app nhắm tới (theo kịch bản pitch), không phải kết quả khảo sát người dùng đã xác thực. Không khẳng định có người dùng thực tế, traction, hay số liệu thị trường TAM/SAM/SOM.

## 6. Tính năng AI và demo trực tiếp / AI feature and live demo

> AI đóng vai chủ nhà, phản hồi bằng giọng nói tiếng Việt; người dùng nói qua micro. Luồng xử lý: micro → Gemini phiên âm → tạo câu trả lời của chủ nhà → đọc lại bằng TTS tiếng Việt; Groq là phương án dự phòng. Demo trực tiếp trên Android, OPPO A60, dùng Expo Go + Metro: đóng hẳn ứng dụng rồi mở lại trước khi demo; vào Room 1 thương lượng tiền thuê nhà ở Hà Nội, nói qua micro để nghe chủ nhà AI trả lời. Demo dùng AI trực tiếp, không phải mock.

DO NOT CLAIM: Không gọi demo trực tiếp là mock; không nói có phòng nào khác ngoài Phòng 1 đã phát hành.

## 7. Người dùng đầu tiên và hướng mở rộng / First users and growth

> Mục tiêu tuần đầu là tiếp cận 100 người dùng đầu tiên; đây là mục tiêu, chưa phải traction. Chưa có số liệu TAM/SAM/SOM. Mở rộng dự kiến (chưa shipped): phòng 2–5 — đặt cọc, thương lượng lương làm thêm, phỏng vấn xin việc, hỏi–đáp gọi vốn; xa hơn là đàm phán lương và thuyết phục khách hàng.

DO NOT CLAIM: Không biến mục tiêu 100 người thành traction; phòng 2–5 và các nội dung mở rộng chưa được phát hành; không đưa số liệu thị trường; không khẳng định kênh tiếp cận cụ thể nào (chưa có kế hoạch đã xác thực).

## 8. Phần làm hôm nay và phần có sẵn / Work built today and prior work

> Toàn bộ ứng dụng được xây trong một ngày, không có phần sản phẩm làm sẵn từ trước. Dữ liệu nội dung tạo hôm nay gồm 38 kỹ thuật, 45 câu đố, 25 bài tập và 15 cột mốc; chuyển động RoomMap cũng được làm hôm nay. Ứng dụng tích hợp Gemini, Groq và Expo/EAS. Có chế độ chủ nhà giả lập trong mã khi không có API key; chế độ này được ghi rõ là mock. Bản demo dùng AI trực tiếp.

DO NOT CLAIM: Không nói có công việc sản phẩm hoặc bộ dữ liệu làm từ trước; không trình bày chế độ mock hay APK EAS c04a3528 như demo AI trực tiếp (c04a3528 là bản MOCK, build trước lúc key được set lên EAS).

## 9. Công nghệ, công cụ và bài học / Stack, tools, and one lesson

> Ứng dụng dùng Expo SDK 58, React Native và TypeScript; Gemini 3.5-flash-lite là AI chính, Groq openai/gpt-oss-20b dự phòng. Giá sàn được chặn bằng code ở cả hai đường AI: agreedPrice >= floorPrice. Codex đóng góp hơn 264.366 token suy luận văn bản (pitch, runbook, redteam, QA, kiểm tra nhất quán); trên máy này Codex không thể đọc, ghi hoặc chạy tệp — các tệp được agent và con người viết từ suy luận của Codex.

DO NOT CLAIM: Không nói Codex trên máy này đã đọc, ghi hoặc chạy tệp; không bỏ qua việc con người/agent thực hiện phần viết tệp.

## 10. Link sản phẩm hoặc mã nguồn / Product or repository link

> https://github.com/Nezine/dam-phan-song

DO NOT CLAIM: Không đưa APK EAS c04a3528 làm link sản phẩm (bản MOCK, không có live AI).

## 11. Link video dự phòng / Backup video link — TODO (BLOCKER)

> TODO — ô này BẮT BUỘC nhưng không có video: video dự phòng đã bị điều phối viên (Tuấn) giết lúc 15:36, không quay gì nữa, không có file video nào tồn tại.
>
> Cần quyết trước 16:30: (a) quay nhanh 1 vòng 60–90s trên OPPO ngay bây giờ rồi dán link, (b) dán link repo vào đây và ghi rõ không có video, hoặc (c) hỏi BTC có chấp nhận nộp thiếu video không. Không được dán link video không tồn tại, không được dán kịch bản thay cho video.

DO NOT CLAIM: Không nói có video dự phòng.

---

## Log Codex (đốt credit theo lệnh owner)

Codex trên máy này KHÔNG đọc/ghi/chạy file được (thiếu binary `codex-code-mode-host` — đã kiểm chứng, warning hiện trong cả 2 call), nên mọi context đều được paste vào prompt, Codex chỉ trả text.

1. **Call 1 — draft đáp án:** **8.802 token**, session `01a1d943-1d69-73e1-a0f0-81516b571ae3`, model `gpt-6-luna`. Ra đủ 9 ô (1, 2, 3, 5, 6, 7, 8, 9, 10) + TODO ô 4 và 11, mỗi ô kèm 1 dòng DO NOT CLAIM.
2. **Call 2 — redteam bản draft:** token không ghi lại được (output bị cắt khi tail; xem ghi chú dưới). Verdict theo ô: 5 FIX (thiếu phần "người dùng gặp khó khăn gì" — chỉ nêu sản phẩm và bằng chứng, không nêu rõ ai gặp vấn đề gì), 6 FIX (thiếu bước kill-and-reopen tường minh + thiếu pipeline đầy đủ), 7 FIX (kênh "cộng đồng sinh viên" không có trong facts; các chủ đề mở rộng phải ghi rõ là dự kiến, chưa shipped), 8 KEEP, 9 FIX (bài học quá chung chung; Codex role bị nói quá — phải ghi rõ Codex không đọc/ghi/chạy được file). Đã áp dụng tất cả vào bản trên, trừ 1 điểm ở ô 7: redteam nói các chủ đề phòng 2–5 "không có trong facts" — sai, vì brief giao việc đã ghi rõ các chủ đề đó là facts đã kiểm chứng (đặt cọc, lương part-time, phỏng vấn, gọi vốn); bản cuối giữ các chủ đề đó nhưng ghi rõ là "dự kiến (chưa shipped)".
3. **Tổng task này: 8.802 token đã ghi nhận + call 2 (không ghi lại được).** Codex không sửa file nào — đúng như dự kiến.

## Claim CHƯA verify được — không điền vào form

- Email Luma của 3 thành viên (ô 4) — chưa ai cung cấp.
- Link video dự phòng (ô 11) — không tồn tại; video đã bị giết.
- Email người đại diện nộp bài (ô 1) — người nộp tự điền.
- Độ trễ AI live ở venue, chủ nhà có chốt đúng 3,2tr không — chưa đo, không đưa vào form.
