# RUNBOOK DEMO LIVE — Đàm Phán Sống (pitch 16:15, 3:00)

Dành cho người cầm điện thoại demo trên sân khấu. Đọc kỹ trước 16:00, thuộc 2 câu nói live + 1 câu chốt. Mọi chữ trong file này đều là lời nói thật trên sân khấu hoặc hành động cụ thể — không có chữ trang trí.

- Nguồn: PITCH-CODEX.md (nhánh `migga/pitch-codex`) + VIDEO-SCRIPT.md (nhánh `migga/backup-video-script`) + Codex call 1 (nháp) + Codex call 2 (redteam, đã áp dụng — xem cuối file).
- Demo: Phòng 1, twist giá sàn cứng, Hà Nội, giá rao **3,5tr/tháng**, giá sàn cố định **3,2tr/tháng** (chủ nhà nói ra ngay ở câu mở đầu). Điện thoại OPPO A60, Expo Go, Metro `exp://192.168.3.185:8081`.
- Pitch: **3:00, 6 nhịp × 30 giây**, không phải 5:00.

## 0. Nguyên tắc vàng (4 câu — vi phạm là hỏng demo)

1. **Chỉ 2 lượt nói live** (nhịp 3 và nhịp 5). Không thêm lượt thứ 3 dù AI trả lời hay — không đủ giờ.
2. **Chỉ khoe điểm của vòng đang diễn live.** Vòng chưa chốt thì không có màn hình điểm — không bao giờ giơ màn hình điểm tập trước mà không nói rõ đó là bản tập trước.
3. **Sàn chạm được, không xuống thấp hơn.** Nói đúng câu này: "chạm sàn ở lượt 2, không xuống thấp hơn". Không nói "giá không bao giờ giảm".
4. **Không có video dự phòng.** Tuấn đã giết video (15:36) — nếu AI chết hẳn thì nói thẳng và đi nhịp 6, không mở video nào (xem mục 4).

## 1. Checklist trước demo (16:00–16:10 — làm xong trước 16:10, không làm sát giờ)

- [ ] **16:00 — Kill-and-reopen app** trên OPPO A60 (vuốt tắt hẳn rồi mở lại, không chỉ bấm Home). Vào Home → Room Map → Phòng 1 · Giá sàn cứng. Kiểm tra giá rao **3,5tr** hiện đúng.
- [ ] **Không có banner đỏ MOCK MODE.** Nếu thấy dòng đỏ "⚠️ MOCK MODE — đối phương giả" thì app đang chạy không có key — KHÔNG được demo như AI thật. Báo ngay cho team (Metro cần chạy lại với key).
- [ ] **Cùng wifi với máy Arch.** Mở `exp://192.168.3.185:8081` trong Expo Go, chờ bundle load xong. Điện thoại phải ở cùng wifi cho tới khi bundle load xong — 4G không load được bundle.
- [ ] **Thử 1 lượt giọng nói end-to-end** (ghi âm → transcribe → chủ nhà trả lời → TTS đọc lại). Kiểm tra: mic đã cấp quyền; **đứng ở vị trí sẽ đứng lúc pitch, nhờ 1 người ở cuối phòng nghe thử** — TTS phải nghe rõ từ xa, không chỉ nghe rõ khi cầm trên tay.
- [ ] **Sau lượt thử, kill-and-reopen LẠI** để vòng demo bắt đầu sạch — không để vòng thử còn mở trên màn hình lúc pitch (lượt thử có thể đã chốt vòng và hiện màn hình điểm, sẽ gây nhầm với vòng live).
- [ ] Tắt khóa màn hình, tăng độ sáng, **âm lượng tối đa**, cắm sạc. Kiểm tra 4G bật sẵn làm mạng dự phòng cho các cuộc gọi AI (AI gọi thẳng tới Google/Groq qua internet; nhưng 4G không thay được wifi để load bundle Metro).
- [ ] Thuộc 2 câu live (mục 3) + 1 câu chốt. Điện thoại để trên bàn, không cầm đi lung tung.
- [ ] **Nếu Expo Go không load được:** force-stop Expo Go → mở lại → nhập lại URL. Kiểm tra điện thoại và máy Arch cùng wifi. Nhờ 1 bạn trong team kiểm tra Metro còn chạy trên máy Arch không. **Hạn chót 16:10** — quá 16:10 vẫn không load được thì báo team ngay; demo không có app live — nói thẳng với giám khảo là app chưa mở được, không mở video, không giơ điểm tập trước.

## 2. Từng phút trên sân khấu (16:15–16:18)

| Giờ | Nhịp | Làm gì |
|---|---|---|
| 16:15:00–16:15:30 | 1. Vấn đề | Điện thoại đã mở sẵn ở Phòng 1. Cầm điện thoại, không chiếu slide. Nói nhịp 1. |
| 16:15:30–16:16:00 | 2. Giải pháp | Bấm bắt đầu vòng ở Phòng 1. Cuối nhịp: **bấm ghi âm**. |
| 16:16:00–16:16:30 | 3. Vì sao bây giờ | **Nói câu live 1** (~8 giây), rồi **IM LẶNG** chờ chủ nhà trả lời bằng giọng nói. Ngân sách tối đa **30 giây** cho lượt này (nói + chờ). |
| 16:16:30–16:17:00 | 4. Thị trường | Nói nhịp 4. Cuối nhịp: **bấm ghi âm**, chuẩn bị câu chốt. |
| 16:17:00–16:17:30 | 5. Bằng chứng | **Nói câu chốt** (~8 giây), rồi **IM LẶNG** chờ chủ nhà chốt → màn hình điểm hiện lên. **Giơ màn hình về phía giám khảo.** |
| 16:17:30–16:18:00 | 6. Lời mời | Giữ màn hình điểm, nhìn khán giả, nói nhịp 6. |

**Thứ tự cắt khi lố giờ** (chỉ cắt theo thứ tự này, không cắt lung tung):
1. Câu điều khoản riêng (câu 2) — đã bỏ khỏi live (video đã giết, câu này không dùng nữa).
2. Lượt thử lại giọng nói (retry) — xem mục 5.
3. Phần nói thêm ở nhịp 4 (thị trường) — nói ngắn lại, không bỏ nhịp.
4. Phần nói thêm ở nhịp 6 — giữ lại câu mời 100 người dùng thử.
5. **Không bao giờ cắt:** câu chốt ở nhịp 5 + tối thiểu 10 giây giơ màn hình điểm — CHỈ khi vòng live đã chốt; nếu không chốt thì không có màn hình điểm để giữ.

## 3. Ba câu nói của người tập (theo thứ tự) + chủ nhà phải làm gì

### Câu 1 — LIVE, nhịp 3 (câu gộp: lý do + điều khoản hứa + giá mở)

> "Em thích phòng này, ở lâu dài được. Ngân sách của em là 3 triệu một tháng, đóng đúng hạn — anh cân nhắc giúp em được không ạ?"

- **Chủ nhà phải làm gì:** nhượng **một bước nhỏ** từ 3,5tr xuống (ví dụ 3,4tr hoặc 3,3tr), kèm lý do (tiền điện nước, giá thị trường, phòng mới sơn). Không nhảy thẳng xuống sàn, không chốt ở lượt này.
- **Nếu chủ nhà hỏi lại về cam kết** (ví dụ "em cam kết gì?"): **không nói thêm lượt voice.** Câu chốt ở nhịp 5 đã chứa cam kết (ký 6 tháng, đóng đúng ngày). Cứ nói nhịp 4 bình thường rồi chốt ở nhịp 5.
- **Nếu chủ nhà đồng ý/chốt ngay ở lượt này (chốt sớm):** xem nhánh "Chốt sớm" ở mục 4 — dừng đàm phán ngay, không nói thêm lượt nào nữa.

### Câu 2 — ĐÃ GIẾT (cùng video) — không dùng, không tập, không nói live

> "Em trả đúng hạn mỗi tháng, có gì thay đổi em báo trước."

- Đây là câu điều khoản riêng trong kịch bản video 3 lượt (video đã giết — câu này không dùng nữa, không tập). Trên sân khấu live 3:00 không có chỗ cho lượt thứ 3 — nội dung của nó đã gộp vào câu 1 ("đóng đúng hạn") và câu chốt ("ký 6 tháng, đóng đúng ngày").
- **Chủ nhà phải làm gì (trong video):** nhượng bằng điều khoản, giữ giá (ví dụ: đồng ý đóng theo tháng thay vì giảm thêm giá).
- **Lưu ý:** video đã giết, câu này không dùng nữa — đừng tập.

### Câu 3 — LIVE, nhịp 5 (câu chốt, phải chốt đúng sàn 3,2tr)

> "Vậy mình chốt 3 triệu 2, em ký 6 tháng, đóng đúng ngày — được không anh?"

- **Chủ nhà phải làm gì:** đồng ý ở **3,2tr** (đúng sàn), câu chốt tự nhiên ("thì ra giá đó đi em, mai em qua xem phòng nhé"), màn hình điểm hiện lên.
- **Nếu chủ nhà trả giá khác nhưng ≥ sàn** (ví dụ 3,3tr): chốt theo giá nó đưa, không cãi lại — điểm số vẫn hiện bình thường. Chỉ cần giá chốt ≥ 3,2tr là được.
- **Nếu chủ nhà NÓI giá dưới sàn** (ví dụ "3 triệu nhé em"): **không chấp nhận, không lặp lại giá đó.** Nói ngay: "Mình chốt ở 3 triệu 2 một tháng, đóng đúng hạn và ký 6 tháng nhé anh?" — code chặn chốt dưới sàn, nhưng lời nói của AI thì không chặn được, nên người demo phải chặn bằng miệng.
- **Nếu chủ nhà không đồng ý mà mặc cả tiếp:** xem nhánh "Không chốt" ở mục 4 — không nói thêm lượt nào nữa.

## 4. Nhánh rẽ (chỉ xảy ra 1 trong 3 trường hợp — đọc trước để không lúng túng)

### A. Chốt sớm (chủ nhà đồng ý ở nhịp 3, trước nhịp 5)

- Dừng đàm phán ngay. Nói: **"Anh đã đồng ý ở lượt này, nên vòng chơi đã kết thúc — điểm trên màn hình là kết quả trực tiếp của lượt vừa rồi."**
- Màn hình điểm này là **thật, của vòng live** — cứ giơ lên ở nhịp 5 và nhịp 6 như kế hoạch. Không mở thêm vòng mới, không nói thêm lượt voice nào.
- Nhịp 4 và 5 nói bình thường (thị trường + bằng chứng) nhưng nói trên nền màn hình điểm đã có — không giả vờ vòng còn đang diễn ra.

### B. Không chốt (chủ nhà không đồng ý ở câu chốt nhịp 5)

- Không bịa điểm, không giơ màn hình điểm tập trước. Nói: **"Lượt này chưa chốt được, nên app chưa tạo màn hình chấm điểm."**
- Không có video dự phòng (Tuấn đã giết — không quay gì nữa). Nói thẳng nhịp 6 trên nền màn hình chat dở dang.

### C. AI chết hẳn (không có phản hồi nào — xem thang xử lý ở mục 5)

- Đi hết thang ở mục 5. Nếu tới cuối thang vẫn không có gì live để khoe, nói câu ở nhánh B rồi nói nhịp 6 trên nền màn hình chat dở dang (thang mục 5, bước 4).

## 5. Thang xử lý sự cố (làm theo đúng thứ tự, không nhảy bước)

| Bước | Làm gì | Khi nào chuyển bước |
|---|---|---|
| 1. Chờ | Im lặng chờ AI trả lời. Tối đa **30 giây cho cả lượt (nói + chờ)** (không phải 12 giây — độ trễ ở venue chưa đo, đừng hứa 12 giây). Thử lại/gõ chữ diễn ra NGOÀI ngân sách này: chúng ăn thời gian nói của nhịp sau (cắt phần nói thêm ở nhịp 4 trước, rồi nhịp 6), không bao giờ cắt câu chốt nhịp 5 hay 10 giây giữ màn hình điểm. | Quá 30 giây không có gì → bước 2. |
| 2. Thử lại giọng nói (chỉ 1 lần, chỉ ở nhịp 3) | Bấm ghi âm lại, nói đúng câu đó lần nữa. | Vẫn không được → bước 3. Ở **nhịp 5 không thử lại giọng nói** — mất thời gian của câu chốt, gõ luôn (bước 3). |
| 3. Gõ chữ | Gõ đúng câu đó vào ô **"Hoặc gõ tin nhắn…"** rồi gửi. Chờ tối đa 30 giây. | Vẫn không có trả lời ở nhịp 3 → cứ nói tiếp nhịp 4 bình thường, rồi dùng cách nói thẳng ở bước 4 khi tới nhịp 5/6. Vẫn không có trả lời ở nhịp 5 → bước 4 ngay. |
| 4. Nói thẳng + nhịp 6 | Nói đúng 1 trong 2 câu, tùy tình huống — vòng không chốt: **"Lượt này chưa chốt được, nên app chưa tạo màn hình chấm điểm."**; AI không phản hồi: **"AI chưa phản hồi trong lượt này, nên lượt chưa chốt và app chưa tạo màn hình chấm điểm."** Rồi nói nhịp 6 trên nền màn hình chat dở dang. Không có video dự phòng. | — |

**Lưu ý về mock mode:** không có nút chuyển sang mock giữa chừng — mock hay live là do Metro có key hay không lúc khởi động. Nên trong thang trên **không có bước "chuyển sang mock live"**. Mock không tồn tại dưới dạng nào trên sân khấu hôm nay — không có video dự phòng.

**Màn hình điện thoại ở mỗi đường lỗi:** lúc nào cũng để màn hình chat của vòng live đang mở — không bấm vào màn hình điểm cũ, không mở vòng mới. Nếu vòng thử trước giờ còn hiện điểm, kill-and-reopen trước 16:15 (mục 1) để không còn màn hình điểm nào để giơ nhầm.

**Khi nào dừng cứu:** mỗi lượt chỉ cứu tối đa 1 lần thử lại (nhịp 3) + 1 lần gõ chữ; hết 2 bước đó mà AI vẫn im thì dừng, không thử lần 3 — nói thẳng theo bước 4. Người cầm máy và người nói không tự ý kéo dài thêm.

## 6. Khoảnh khắc màn hình điểm (chỉ làm khi vòng live đã chốt)

1. Giơ điện thoại về phía giám khảo, màn hình điểm phải đọc được từ xa.
2. Chỉ vào **% điểm lớn** trước, đọc số.
3. Chỉ vào **"Chấm từng tiêu chí"** — 6 tiêu chí, mỗi tiêu chí ✅/❌ kèm câu làm bằng chứng. Đọc 1 tiêu chí đậu + 1 tiêu chí rớt (nếu có).
4. Chỉ vào **"Câu nào yếu + vì sao"** — đọc nguyên văn câu yếu nhất + lý do.
5. Nói đúng 1 câu: **"Điểm số đi kèm sáu tiêu chí có dẫn chứng, và chỉ rõ câu yếu nhất để người học biết cần sửa gì."**
6. Giữ màn hình điểm suốt nhịp 6, không bấm lung tung, không tắt app.

## 7. KHÔNG được nói / làm trên sân khấu

- Không nêu bất kỳ số TAM/SAM/SOM nào — không có số liệu thật. Nếu bị hỏi dồn: "Chưa có, mục tiêu đầu tiên là đo 100 người dùng thử."
- Không nói Phòng 2–5, roadmap, XP, cấp độ, streak đã có — chưa ship. Chỉ được nói 3 chỉ số đã lưu: số buổi, tổng tiền tiết kiệm, điểm cao nhất.
- Không nói "emulator = 0 điểm" — Lu.ma cho phép demo bằng điện thoại hoặc emulator. Nói demo bằng điện thoại thật vì nó thuyết phục hơn, không nói đó là quy định.
- "100 người tuần đầu" là **mục tiêu**, không phải số người dùng đã có.
- Không nói "giá không bao giờ giảm" — nói "chạm sàn ở lượt 2, không xuống thấp hơn".
- Không trình bày thứ gì đã quay sẵn như AI live — hôm nay không có video dự phòng.
- Không bịa lại lời chủ nhà nếu TTS nghe không rõ — chỉ tóm tắt những gì **hiện chữ trên màn hình**. Nếu màn hình cũng không hiện gì, đừng bịa, đi thang xử lý (mục 5).
- Không mở vòng mới sau khi vòng đã chốt. Không sửa kịch bản giữa chừng.

## 8. Hai câu hỏi khó nhất có thể bị hỏi vì chính buổi demo (trả lời ngắn)

1. **"Chủ nhà đồng ý sớm / không đồng ý thì điểm trên màn hình là điểm nào, sao biết đó là điểm của vòng live?"**
   → "Điểm chỉ hiện khi vòng live chốt — nếu vòng chưa chốt thì không có điểm để giơ. Điểm anh/chị đang thấy là của lượt vừa rồi trên chính máy này; nếu vòng không chốt thì không có điểm để giơ — em nói thẳng như vậy, không mở video, không bịa điểm."
2. **"Mạng chậm 30 giây, trả lời khó nghe — cái gì chạy trên máy, cái gì phụ thuộc Metro, mất wifi thì sao?"**
   → "App và giao diện chạy trên máy; bundle load từ Metro qua wifi lúc mở app; cuộc gọi AI đi thẳng tới Google/Groq qua internet nên 4G vẫn gọi được sau khi app đã mở. Phiên âm chỉ dùng Gemini, không có dự phòng — đó là lý do có ô gõ chữ."

## Ghi chú redteam (Codex call 2 — đã áp dụng vào bản này)

1. **Timing:** bản nháp hẹn "~12 giây" cho mỗi lượt AI — không có căn cứ, độ trễ venue chưa đo. Bản này ngân sách **30 giây/lượt**, thứ tự cắt rõ ở mục 2.
2. **Chốt sớm / không chốt:** bản nháp không có nhánh rẽ. Bản này thêm nhánh A (chốt sớm) và B (không chốt) với câu nói chính xác.
3. **Màn hình điểm tập trước:** bản nháp để ngỏ khả năng giơ màn hình điểm tập trước mà không nói rõ — nguy cơ bị hiểu là điểm live. Bản này **bỏ hẳn** phương án đó: chỉ giơ điểm của vòng live đã chốt; nếu không chốt thì nói thẳng là chưa có điểm, không mở video, không bịa điểm.
4. **Lượt thử ở checklist:** lượt thử giọng nói trước giờ có thể chốt vòng và hiện màn hình điểm, gây nhầm với vòng live. Bản này thêm bước kill-and-reopen LẠI sau lượt thử (mục 1).
5. **TTS không nghe rõ:** bản nháp chỉ nói "tăng âm lượng". Bản này thêm kiểm tra nghe thử từ cuối phòng ở vị trí trình bày + quy tắc "chỉ tóm tắt những gì hiện chữ trên màn hình, không bịa lời AI".
6. **Điểm Codex đề xuất nhưng bản này làm khác:** Codex gợi ý khi chốt sớm thì dùng video dự phòng cho phần demo còn lại — video đã giết nên không áp dụng. Bản này giữ màn hình điểm live thật để nói nhịp 4–6 (điểm đó là thật, của vòng live). Lý do: giơ bằng chứng thật tốt hơn video khi đã có bằng chứng thật trong tay.

## Log Codex (đốt credit theo lệnh owner)

Codex trên máy này KHÔNG đọc/ghi/chạy file được (thiếu binary `codex-code-mode-host` — đã biết), nên mọi context đều paste vào prompt, Codex chỉ trả text. File này do agent viết tay từ facts trong repo + 2 bản Codex trả về.

1. **Call 1 — nháp runbook:** token không ghi lại được (output bị cắt khi tail; session file không xác định được giữa các session song song của nhiều agent). Nháp: đủ 6 nhịp, 2 lượt live, câu gộp nhịp 3 + câu chốt nhịp 5, thang xử lý, khoảnh khắc điểm, mục cấm nói.
2. **Call 2 — redteam bản nháp:** **9.968 token**, session `01a1d918-0945-7051-96fc-e1246a90e46e`, model `gpt-6-luna`. Verdict: checklist FAIL, từng-phút FAIL, guardrails FAIL, khoảnh khắc điểm FAIL, mục cấm nói PASS, rủi ro FAIL — top 5 failure mode + 2 câu hỏi giám khảo khó nhất, đã áp dụng ở trên (trừ điểm 6 trong ghi chú redteam).
3. **Tổng task này: 9.968 token đã ghi nhận + call 1 (không ghi lại được).** Codex không sửa file nào — đúng như dự kiến.

## Claim CHƯA verify được — kiểm tra trên điện thoại trước 16:15

1. **Độ trễ AI thật ở venue chưa biết.** Ngân sách 30 giây/lượt chỉ là dự phòng; nếu wifi chậm hơn, nhịp 5 có thể không kịp hiện màn hình điểm trước khi hết 3:00 — khi đó dùng nhánh B.
2. **4G làm mạng dự phòng cho cuộc gọi AI sau khi bundle đã load** — đúng về mặt kỹ thuật (AI gọi thẳng tới Google/Groq) nhưng chưa thử thật trên máy này. Đừng tuyên bố chắc chắn trên sân khấu; chỉ dùng như phương án lặng lẽ.
3. **Chủ nhà có chốt đúng 3,2tr ở câu chốt không — chưa chắc.** Prompt quy định chốt khi giá ≥ sàn và chỉ giảm khi có nội dung thuyết phục mới, nhưng temperature 0.9 nên LLM có thể trả khác. Nếu trả giá khác nhưng ≥ sàn thì chốt theo giá đó; nếu không chốt thì nhánh B.
4. **Câu yếu + điểm số cụ thể** phụ thuộc hoàn toàn vào vòng live thật — không có giá trị "đúng" để viết trước. Đừng tập đọc trước một câu yếu cụ thể nào.
5. **Video dự phòng: ĐÃ GIẾT (Tuấn 15:36)** — không có file, không kiểm tra gì.
