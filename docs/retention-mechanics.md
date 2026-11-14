# Retention Mechanics — Đàm Phán Sống

Cơ chế giữ người dùng quay lại, đối chiếu với những gì app **đã có thật** trong repo.
Base: master `a9be1bf` (2026-11-14). Mọi khẳng định "đã có / chưa có" đều kiểm chứng
bằng code ở commit này — không bịa số, không bịa tính năng.

## 0. Những gì đã có thật (đã kiểm chứng trong code)

| Cơ chế | Trạng thái | Bằng chứng trong repo |
|---|---|---|
| XP + cấp độ | CÓ, chạy thật | `src/lib/gamification.ts`: `levelFromXp`, `xpForLevel`; `src/lib/roomProgress.ts:22`: XP = sessions × 150 (50 chốt vòng + 100 thắng deal) |
| Tiến bộ lưu trên máy | CÓ | `src/lib/progress.ts`: `dam-phan-song-progress.json` (sessions / totalSaved / bestScore / updatedAt), chỉ ghi khi chốt thỏa thuận |
| Mục tiêu ngày | CÓ, nhưng thưởng chỉ hiện chứ chưa trả | `src/components/gamification/DailyGoalCard.tsx`: mục tiêu 1 vòng/ngày, hiện "+50 XP" khi xong — **không có code nào cộng 50 XP này** |
| Chuỗi ngày (streak) | CÓ MỘT NỬA — chỉ dám 0/1 | `src/lib/roomProgress.ts`: streak chỉ 0 hoặc 1 vì kho lưu chỉ giữ mốc vòng gần nhất; chuỗi nhiều ngày **không chứng minh được** từ dữ liệu hiện tại |
| Huy hiệu (8 cái) | ĐÃ VIẾT, CHƯA AI THẤY | `src/lib/gamification.ts` `allBadges` (Mở lời, Chốt đầu tiên, 3 ngày, Tuần vàng, Mặc cả cứng, Kiên trì, Không bỏ cuộc, Lên cấp 5); `BadgeGrid.tsx` **không được render ở màn nào** |
| Đếm chuỗi ngày UI | ĐÃ VIẾT, CHƯA AI THẤY | `StreakCounter.tsx` không được render ở màn nào; prop `maxStreakDays` không có nguồn dữ liệu nào điền được |
| Phòng mở khóa dần | CÓ | `src/lib/rooms.ts`: 5 phòng, mở dần (P2 cần xong P1, P4 cần cấp 5, P5 cần cấp 8) |
| Lộ trình 20 mục | ĐÃ VIẾT, KHÔNG VÀO ĐƯỢC | `src/lib/roadmap.ts`: 5 cấp × 4 mục (2 bài tập + 1 test + 1 thực hành), quiz 3 câu/cấp, RUBRIC 5 tiêu chí × 2 = 10, lưu `roadmap-progress.json` — nhưng `RoadmapScreen.tsx` **không được import ở đâu**, AppShell chỉ có 3 màn home / map / negotiate |
| Nội dung 38 kỹ thuật / 45 MCQ / 25 bài tập / 15 milestone | CÓ DỮ LIỆU, KHÔNG CÓ UI | `src/data/skill-content.json` (5 phòng: techniques 8+8+7+8+7 = 38, quiz 9×5 = 45, exercises 5×5 = 25, milestones 3×5 = 15); chữ "milestone" **không xuất hiện lần nào** trong `src/` |
| Chấm điểm + câu yếu | CÓ DỮ LIỆU, CHƯA DÙNG LẠI | `src/lib/score.ts`: 6 quy tắc, `weakSentences` + `lessons` cho mỗi quy tắc rớt — nhưng `progress.ts` chỉ lưu tổng hợp, không lưu quy tắc nào rớt, không có vòng luyện nào dùng lại dữ liệu này |
| XP thưởng đã định nghĩa mà chưa trả | CHẾT | `XP_REWARD.streakBonus` (30 XP, 3 ngày liên tiếp) và `XP_REWARD.goodTactic` (20 XP) **không có code nào cộng** |
| Hai hệ XP song song | RỦI RO | XP vòng đàm phán (`roomProgress.ts`) và XP lộ trình (`roadmap.ts` `totalXp`) tính riêng, chưa thống nhất — người dùng sẽ thấy 2 con số XP khác nhau nếu cả 2 đều hiện |
| Nhắc quay lại (prompt) | KHÔNG CÓ | Không có `expo-notifications` trong `package.json`, không có nhắc hẹn nào trong code |

## 1. Nguồn

- Nir Eyal, *Hooked* (2014) — vòng Trigger → Action → Variable Reward → Investment; 3 loại thưởng biến đổi: tribe (xã hội), hunt (săn tìm), self (làm chủ). https://kompassify.com/blog/hook-model-guide — https://resources.rework.com/libraries/growth-frameworks/hook-model — https://www.businessfloss.com/books/hooked
- BJ Fogg, Behavior Model B=MAP (2009) — hành vi xảy ra khi Motivation + Ability + Prompt cùng đến một lúc; sửa Ability trước, Prompt sau, Motivation cuối cùng; phương pháp Tiny Habits: neo vào thói quen có sẵn + hành vi nhỏ dưới 30 giây + ăn mừng ngay. https://www.thebehavioralscientist.com/articles/fogg-behavior-model — https://www.easyhabits.io/blog/tiny-habits-bj-fogg — bài gốc: https://doi.org/10.1145/1541948.1541999
- Robert Cialdini, *Influence* (1984; bản mở rộng 2021 thêm Unity) — 6 nguyên tắc: reciprocity, commitment & consistency, social proof, liking, authority, scarcity. https://hbr.org/2013/07/the-uses-and-abuses-of-influence — https://www.armandpatella.com/influence — https://ursummary.com/influence-robert-b-cialdini-book-summary/
- Số liệu thị trường trong repo: `MARKET-NUMBERS.md` (truy cập 2026-11-14) — EdTech VN 1,1 tỷ USD (2025), đào tạo kỹ năng mềm 148,8 triệu USD, SAM ~9,5 triệu người 18–34 thành thị / ~5,7 triệu người thuê.

## 2. Top 5 — xếp theo tác động / giờ làm

### 1. Thưởng biến đổi — thưởng bất ngờ sau mỗi vòng chốt (MISSING, S)
- **Cơ chế:** Hooked — Variable Reward (hunt + self). Thưởng cố định mất tác dụng dần; thưởng biến đổi giữ tò mò.
- **Hiện trạng:** XP cố định 150/vòng, biết trước 100%. Không có gì bất ngờ trong app.
- **Tính năng:** sau khi chốt thỏa thuận, tung xúc xắc: 1/3 cơ hội nhận thưởng bất ngờ +25 hoặc +50 XP, hiện ngay trên màn kết quả; thỉnh thoảng (1/5 vòng) mở "Tình huống bất ngờ" — một scenario ngẫu nhiên ngoài 3 scenario mặc định của phòng. Nói rõ là ngẫu nhiên, không giấu.
- **Copy:** "Thưởng bất ngờ: +50 XP — hôm nay bạn gặp đúng đối phương khó tính." / "Tình huống bất ngờ: khách hàng đổi ý vào phút chót. Thử không?"
- **Làm ở đâu:** `src/lib/progress.ts` (`recordSession`) + màn kết quả trong `App.tsx`. Không cần backend, không cần dữ liệu mới.
- **Effort:** S (~1 giờ).

### 2. Mở lối vào Lộ trình — bật 20 mục nội dung đã viết sẵn (MISSING, M)
- **Cơ chế:** Fogg B=MAP — sửa Ability trước: bỏ ma sát, đừng bắt người dùng leo qua rào mới. Nội dung đã có mà không vào được = Ability bằng 0.
- **Hiện trạng:** `RoadmapScreen` + `RoadmapItemDetail` đã viết, 20 mục + 45 câu quiz + bài thực hành, nhưng AppShell không có đường vào. Người dùng không bao giờ thấy.
- **Tính năng:** thêm 1 nút trên Home ("Lộ trình luyện tập") + 1 màn trong AppShell (`'roadmap'`); lộ trình dùng chung XP đã có, không tạo hệ XP thứ ba. Mở khóa tuần tự đã có sẵn trong `roadmap.ts` (`itemStatus`).
- **Copy:** "Lộ trình luyện tập — 20 bài, từ mở lời tới chốt như chuyên gia." / "Bài tiếp theo: Đặt câu hỏi mở — 5 phút, +10 XP."
- **Làm ở đâu:** `src/AppShell.tsx` + `src/screens/HomeScreen.tsx`. Lưu ý: trước khi bật, quyết định 1 hệ XP duy nhất (xem §4).
- **Effort:** M (~2–3 giờ).

### 3. Hiện huy hiệu + chuỗi ngày đã viết sẵn (MISSING, S)
- **Cơ chế:** Hooked — Reward of the self (làm chủ, sưu tầm); Cialdini — Commitment: tiến bộ nhìn thấy được khiến người ta muốn giữ nhất quán với nó.
- **Hiện trạng:** `BadgeGrid` (8 huy hiệu, có thanh tiến độ) và `StreakCounter` đã viết xong, có animation, nhưng không màn nào render. Người dùng luyện 10 vòng cũng không thấy huy hiệu "Kiên trì".
- **Tính năng:** render `BadgeGrid` + `StreakCounter` trên Home (dưới `DailyGoalCard`), lấy số từ `roomProgress` đã có. Huy hiệu mở khóa hiện thông báo 1 lần trên màn kết quả ("Mở huy hiệu mới: Chốt đầu tiên").
- **Copy:** "Huy hiệu: 3/8 — còn 2 vòng nữa mở 'Kiên trì'." / "Chuỗi 1 ngày — luyện tiếp ngày mai để lên 2."
- **Làm ở đâu:** `src/screens/HomeScreen.tsx`; `GamificationStats` suy ra từ `RoomProgress` (roundsPlayed = sessionsTotal, roundsWon = sessionsTotal vì chỉ ghi khi chốt, bestSavingPct từ `bestScore` — ghi rõ cách suy ra trong code, không bịa).
- **Effort:** S (~1 giờ). Đây là việc "bật lên" rẻ nhất trong danh sách.

### 4. Chuỗi ngày thật + trả đúng XP đã hứa (PARTIAL / BROKEN, M)
- **Cơ chế:** Cialdini — Commitment & Consistency: cam kết nhỏ mỗi ngày + chuỗi nhìn thấy được là lý do quay lại. Hooked — Investment: chuỗi đã dài thì bỏ đi tiếc.
- **Hiện trạng:** streak chỉ 0/1 (không chứng minh được chuỗi dài); `DailyGoalCard` hiện "+50 XP" nhưng không trả; `streakBonus` 30 XP đã định nghĩa nhưng không trả. Ba lời hứa hiển thị, không lời nào thực thi.
- **Tính năng:** (a) mở rộng `progress.ts` lưu thêm danh sách 7 ngày gần nhất có luyện (vẫn local, file JSON); streak = số ngày liên tiếp thật tính từ đó; (b) cộng thật `streakBonus` khi chạm mốc 3 ngày và +50 XP khi xong mục tiêu ngày, trong `recordSession`; (c) không bao giờ hiện chuỗi dài hơn dữ liệu chứng minh được.
- **Copy:** "Chuỗi 3 ngày — đừng để đứt hôm nay." / "Xong mục tiêu hôm nay: +50 XP đã cộng vào tổng của bạn."
- **Làm ở đâu:** `src/lib/progress.ts`, `src/lib/roomProgress.ts`, `src/lib/gamification.ts` (dùng đúng `XP_REWARD` đã có).
- **Effort:** M (~2 giờ, gồm test lưu/tải 7 ngày).

### 5. Vòng luyện theo điểm yếu — dùng lại kết quả chấm điểm (MISSING, M)
- **Cơ chế:** Hooked — Investment (người dùng bỏ dữ liệu vào, app trả lại giá trị riêng); Fogg — Ability: thu nhỏ việc tiếp theo tới đúng chỗ yếu nhất thì dễ làm hơn là "luyện tiếp chung chung".
- **Hiện trạng:** `score.ts` đã tính sẵn câu yếu + bài học cho từng quy tắc rớt, nhưng không lưu lại và không vòng nào dùng tới. Người dùng rớt cùng 1 quy tắc 5 lần cũng không ai chỉ ra.
- **Tính năng:** lưu `lastFailedRules: RuleId[]` vào `progress.ts` khi chấm điểm; Home hiện 1 thẻ "Luyện tiếp" trỏ đúng quy tắc rớt nhiều nhất, bấm là vào scenario luyện quy tắc đó (2 phút, không cần setup lại). Khi quy tắc đó pass, thẻ đổi sang quy tắc yếu tiếp theo.
- **Copy:** "Điểm yếu nhất của bạn: nhượng bộ chưa có điều kiện. Luyện lại trong 2 phút." / "Bạn đã sửa được điểm này — điểm yếu tiếp theo: chốt chưa rõ thời hạn."
- **Làm ở đâu:** `src/lib/score.ts` (đã có `lessons`), `src/lib/progress.ts` (thêm trường), `src/screens/HomeScreen.tsx` (thẻ mới), `src/App.tsx` (nhận rule cần luyện).
- **Effort:** M (~2–3 giờ).

## 3. Các cơ chế còn lại (làm sau Top 5)

| # | Cơ chế (nguồn) | Tính năng | Trạng thái | Effort |
|---|---|---|---|---|
| 6 | Tiny Habit + ăn mừng (Fogg) | "Vòng 60 giây": chỉ luyện 1 câu mở lời, chấm 1 quy tắc, ăn mừng ngay trên màn kết quả. Neo: "Sau khi mở app buổi sáng, luyện 1 câu mở lời." | MISSING | S |
| 7 | Cam kết mỗi ngày (Cialdini — Commitment) | Nút "Hôm nay tôi luyện 1 vòng" trên Home buổi sáng; tối hiện "Bạn đã giữ lời hứa hôm nay" hoặc "Hứa rồi mà chưa luyện — còn 1 vòng 2 phút." Cần kho 7 ngày ở #4 trước. | MISSING | S (sau #4) |
| 8 | Bằng chứng xã hội, nói thật (Cialdini — Social Proof) | KHÔNG được bịa "X người đã luyện". Dùng số thật trong `MARKET-NUMBERS.md`: "65% ứng viên không tự tin đàm phán lương — bạn đang luyện đúng thứ đa số người tránh." + cho người dùng chụp màn hình huy hiệu/milestone để chia sẻ. | MISSING | S |
| 9 | Milestone từ content-pack (Hooked — self) | 15 milestone đã có trong `skill-content.json` (3/phòng) nhưng không có UI. Hiện milestone trên bản đồ phòng + màn kết quả khi chạm mốc. | MISSING (dữ liệu có) | M |
| 10 | Hồ sơ tiến bộ cá nhân (Hooked — Investment) | 1 màn "Tiến bộ của tôi": tổng vòng, tiền tiết kiệm được, điểm cao nhất, quy tắc mạnh/yếu, cấp + tên cấp (`levelTitle` đã có: Người mới → Bậc thầy đàm phán). Càng đầy, người dùng càng tiếc khi bỏ. | MISSING | M |
| 11 | Prompt quay lại (Fogg — Prompt) | KHÔNG có push notification (chưa cài `expo-notifications`, chưa xin quyền — không kịp xin trước giờ pitch). Thay bằng prompt trong app: lần mở app sau 1 ngày không luyện, Home hiện "Hôm qua bạn chưa luyện — 1 vòng 2 phút thôi?" | MISSING | S |
| 12 | Liking — đối tác AI có tính cách (Cialdini — Liking) | Mỗi phòng có 1 persona AI riêng có tên + tính cách ổn định (khó tính, vội, thân thiện) thay vì "chủ trọ chung chung"; người dùng quay lại vì muốn "thắng" đúng persona đó. Cần viết persona vào `rooms.ts` + prompt `gemini.ts`/`groq.ts`. | MISSING | M |
| 13 | Scarcity — tình huống giới hạn (Cialdini — Scarcity) | "Tình huống hôm nay" — 1 scenario chỉ mở trong ngày, mai đổi; bỏ lỡ thì phải chờ xoay lại. Chỉ làm khi đã có kho ngày (#4), nếu không sẽ thành đếm ngược giả. | MISSING | M (sau #4) |
| 14 | Reciprocity — cho trước (Cialdini — Reciprocity) | Tặng 1 bài học + 1 vòng luyện miễn phí không cần setup trước khi hỏi người dùng làm gì; sau vòng đầu mới gợi ý đặt mục tiêu ngày. App hiện tại đã gần như vậy ở Phòng 1 — giữ, đừng thêm paywall hay đăng nhập. | PARTIAL | S |

## 4. Những gì KHÔNG được làm (nói thật để khỏi vỡ demo)

1. **Không bịa số người dùng, số streak, số XP.** Chuỗi ngày chỉ hiện đúng những gì kho lưu chứng minh được; "X người đã luyện" không có dữ liệu thì không viết.
2. **Không hiện "+50 XP" khi chưa cộng.** Hoặc cộng thật (#4), hoặc đổi copy thành "Xong mục tiêu hôm nay" không kèm số XP.
3. **Không thêm push notification trước giờ pitch.** Chưa có thư viện, chưa xin quyền, chưa test trên máy thật — thêm vào lúc này chỉ tạo lỗi mới.
4. **Thống nhất 1 hệ XP trước khi bật lộ trình (#2).** Hiện có 2 hệ XP song song (vòng đàm phán vs lộ trình); bật cả 2 mà không gộp sẽ khiến người dùng thấy 2 con số khác nhau.
5. **Không đổi số liệu thị trường.** Mọi số dùng trong copy phải lấy từ `MARKET-NUMBERS.md` và ghi nguồn; SOM là giả định, không được đọc như số thật.
6. **Hooked có giới hạn đạo đức (Manipulation Matrix):** chỉ giữ người dùng bằng tiến bộ thật của chính họ, không dùng chuỗi giả hay phần thưởng mập mờ để níu kéo.
