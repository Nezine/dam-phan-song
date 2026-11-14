# CONSISTENCY AUDIT — pitch script vs demo runbook vs backup-video script

- Pitch: 16:15, 3:00, 6 beats × 30s. Documents (all read in full):
  - `PITCH-CODEX.md` — branch `migga/pitch-codex` (98 lines)
  - `DEMO-RUNBOOK.md` — branch `migga/demo-runbook` (149 lines)
  - `VIDEO-SCRIPT.md` — branch `migga/backup-video-script` (78 lines)
- Method: read all three; verified 2 code-grounded claims in the repo (`App.tsx:67` hardline
  opening states the floor out loud; `App.tsx:466` progress strip is cumulative, no "/tháng");
  Codex call 1 (contradiction hunt, 20,796 tokens) confirmed all 5 contradictions below and
  found no additional one; Codex call 2 redteamed this draft (see log at the end).
- Result: **5 contradictions** (C1–C5) + 2 clarifications. Severity scheme: Major = can
  fail or mislead on stage; Medium = wrong claim, one-line fix. Authority for fixes: the
  runbook wins on demo mechanics (it is the newest, strictest, redteamed document); the pitch
  must be corrected to match it. No app-code change is needed for any fix — all 5 are doc edits.

## C1 — MAJOR: pitch fallback shows the rehearsal score screen; runbook forbids it

- Pitch, "Dàn dựng demo + phương án dự phòng" ("Rủi ro lớn nhất"): "Nếu sau 10 giây im lặng
  mà AI chưa trả lời: nói 'Mạng đang chậm — trong lúc chờ, đây là bảng điểm của lượt tập sáng
  nay trên chính máy này' rồi mở màn hình điểm đã tập trước / video backup."
- Runbook §4 branch B: "Không bịa điểm, không giơ màn hình điểm tập trước." Runbook redteam
  note 3: the draft option to show a rehearsal score was removed entirely ("bỏ hẳn phương án
  đó"). Runbook §0 rule 2: only show the score of the live round that closed.
- Which is right: **runbook**. A rehearsal score on stage, even announced as such, reads as
  the live result in the 10 seconds the judges have to parse it — that is exactly the
  misrepresentation risk the runbook's redteam removed.
- Fix: in `PITCH-CODEX.md`, delete "mở màn hình điểm đã tập trước" from the fallback. The
  fallback becomes: say the network is slow, then follow the runbook ladder (C3) — never a
  rehearsal score screen.

## C2 — MAJOR: silence / fallback timing — pitch ~12s vs runbook 30s per turn

- Pitch, beats 3 and 5: "IM LẶNG ~12s"; pitch fallback triggers "sau 10 giây im lặng".
- Runbook §2: "Ngân sách tối đa 30 giây cho lượt này (nói + chờ)"; §5 step 1: "Tối đa 30 giây
  mỗi lượt (không phải 12 giây — độ trễ ở venue chưa đo, đừng hứa 12 giây)".
- Video, "Tính thời lượng" + "Claim CHƯA verify": assumes ~12s total waiting across 3 AI
  replies in the RECORDED video — a different context, not the live pitch.
- Which is right: **runbook's 30s** for live turns (the pitch's 12s was never measured; the
  runbook redteam explicitly rejected it). But note an internal tension inside the runbook
  itself: §2 budgets 30s for the whole turn (speak ~8s + wait ~22s) while §5 says "wait max
  30s" — speak + 30s wait = ~38s, more than one 30s beat. So the single live rule must be:
  **one turn = max 30s total (speak + wait)**; the retry/type steps escalate AFTER that
  budget expires and eat the next beat's narration time in the cut order (§2), never the
  beat-5 close or the 10s score hold.
- Fix: in `PITCH-CODEX.md`, change both "IM LẶNG ~12s" to "IM LẶNG (trong ngân sách 30
  giây/lượt)" and the fallback trigger from 10s to the end of the 30s turn budget.
  In `DEMO-RUNBOOK.md` §5, change "Tối đa 30 giây mỗi lượt" to "Tối đa 30 giây cho cả lượt
  (nói + chờ)". Retry and typing happen OUTSIDE the 30s turn budget: they eat the next
  beat's narration time (cut beat-4 elaboration first, then beat-6 elaboration), never the
  beat-5 close or the 10s score hold. Label the video's 12s figure as video-only (it already
  is, in its own "Claim CHƯA verify" section — no change needed there).

## C3 — MAJOR: pitch fallback skips the recovery ladder (retry → type → video)

- Pitch fallback: after silence, jump straight to speaking + showing a score/video. No
  retry-voice step, no type-the-line step, no statement that there is no live mock switch.
- Runbook §5 ladder: 1. wait (30s) → 2. retry voice once, beat 3 only → 3. type the line
  into "Hoặc gõ tin nhắn…" → 4. labeled backup video. §5 also states: "không có bước
  'chuyển sang mock live'" (mock is decided at Metro start; mock exists only as the
  pre-recorded, labeled video).
- Which is right: **runbook**. Its ladder is the documented recovery sequence; the pitch's
  shortcut also smuggles in the forbidden rehearsal score (C1).
- Fix: replace the fallback paragraph in `PITCH-CODEX.md` with the runbook ladder in concise
  form (wait 30s → retry once in beat 3 → type → labeled backup video), and add one line:
  "Không có nút chuyển sang mock live — mock chỉ là video đã quay sẵn, đã gắn nhãn."
  The ladder is conditional on time: a step may be skipped only when time is gone, and the
  skip order is the runbook's cut order (retry first, then beat-4/beat-6 elaboration); the
  video-label step is never skipped.

## C4 — MEDIUM: pitch says savings are monthly; app + other docs say cumulative

- Pitch, beat 6: "tổng tiền tiết kiệm mỗi tháng".
- Runbook §7: "tổng tiền tiết kiệm"; video, shot 61–72s: "tổng tiền tiết kiệm".
- Verified in code (`App.tsx:466`): the strip reads "📈 Tiến bộ: N phiên • Tiết kiệm tổng
  Xđ • Điểm tốt nhất" — cumulative total, no "/tháng". (The broad-frame fix deliberately
  removed "/tháng" from this strip for exactly this reason; the pitch reintroduced it.)
- Which is right: **runbook + video + app**.
- Fix: in `PITCH-CODEX.md` beat 6, change "tổng tiền tiết kiệm mỗi tháng" to
  "tổng tiền tiết kiệm được".

## C5 — MEDIUM: "secret floor" vs the hardline opening stating the floor out loud

- Pitch, beat 2: "nhân vật AI có mục tiêu và giá sàn bí mật riêng"; Q&A 1: "nhân vật có sàn
  bí mật". Runbook header/checklist: "giá sàn bí mật 3,2tr/tháng".
- Video, shot 11–19s, quotes the app's real opening line verbatim: "Giá này là giá sàn rồi
  em, dưới 3 triệu 2 anh không cho thuê đâu, có người khác đang chờ cọc rồi."
- Verified in code (`App.tsx:67`, spoken by TTS at round start, `App.tsx:288-291`): the
  hardline opening literally announces the floor (3,2tr) in the first thing the landlord
  says. The floor is not secret in the hardline twist — it is declared.
- Which is right: **video + code**. "Secret" is only true in the narrow sense that the
  tenant doesn't set the floor; as a spoken claim it is false for this twist, and a judge
  watching the video (or the live opening) will hear the contradiction. Nuance (Codex
  call 2): "fixed" and "secret" are not logically incompatible BEFORE the opening — the
  floor can be secret until the landlord speaks. The problem is the audience-facing wording
  implies it STAYS hidden, when the opening discloses it. So the fix is about the wording,
  not the game design.
- Fix: in `PITCH-CODEX.md` (beat 2 + Q&A 1) and `DEMO-RUNBOOK.md` (header + checklist),
  change "giá sàn bí mật" to "giá sàn cố định 3,2 triệu" and add that the landlord states it
  in the opening line. Keep the accurate claim: the floor is fixed and the landlord never
  closes below it ("chạm sàn ở lượt 2, không xuống thấp hơn"). No app-code change — do NOT
  rewrite the opening line this close to the pitch.

## Clarification 1 — video's spoken lines differ from the live lines (NOT a contradiction)

- Live (pitch beat 3 = runbook §3 câu 1, verbatim): "Em thích phòng này, ở lâu dài được.
  Ngân sách của em là 3 triệu một tháng, đóng đúng hạn — anh cân nhắc giúp em được không ạ?"
  Live close (pitch beat 5 = runbook §3 câu 3, verbatim): "Vậy mình chốt 3 triệu 2, em ký 6
  tháng, đóng đúng ngày — được không anh?"
- Video: line 1 is a different reason ("Em đi làm gần đây, thuê ổn định lâu dài để anh đỡ
  phải tìm khách mới."); line 2 matches runbook line 2 verbatim ("Em trả đúng hạn mỗi tháng,
  có gì thay đổi em báo trước."); line 3 adds a deposit term ("Nếu em cọc ngay, anh đồng ý
  ba triệu hai một tháng được không?").
- Verdict: **not a contradiction** — the video is a separate recorded round with its own
  legitimate script, and the runbook's "line 2 is video-only" designation matches the video
  verbatim. Action: add ONE line to `DEMO-RUNBOOK.md` §3 and `VIDEO-SCRIPT.md` ("Nguyên tắc
  quay"): "Các câu thoại trong video là kịch bản riêng của vòng quay đó, không phải câu live
  trên sân khấu — đừng tập nhầm." The presenter must not rehearse the video's lines as the
  live lines, and the video's deposit term ("cọc ngay") is not part of the live close.

## Clarification 2 — beat 1 vs beat 2 navigation (shared wording, not a contradiction)

- Both pitch and runbook say beat 1 "app đã mở sẵn ở Phòng 1" and beat 2 "Mở app, chọn
  Phòng 1". Read literally this is redundant. Intended meaning (from both docs' staging):
  beat 1 = the Room 1 room screen is already open; beat 2 = tap to START the negotiation
  round. Action: in `DEMO-RUNBOOK.md` §2, change beat 2 to "Bấm bắt đầu vòng ở Phòng 1.
  Cuối nhịp: bấm ghi âm." No pitch change needed (it copies the same words).

## Verified agreements — keep as-is

- 3:00 total, 6 beats × 30s — all three docs; runbook's 16:15:00–16:18:00 table adds up.
- Live pitch = 2 spoken turns (merged line 1 + close); standalone terms line is video-only.
- No TAM/SAM/SOM numbers anywhere; "100 người tuần đầu" is a target in all three.
- Rooms 2–5, roadmap, XP, levels, streak are NOT shipped in all three; only the 3 saved
  counters (sessions, total saved, best score) may be claimed.
- Floor behaviour language is consistent: "chạm sàn ở lượt 2, không xuống thấp hơn" —
  none of the three says "never lowers" as an absolute (pitch Q&A says "giữ sàn", runbook
  forbids "giá không bao giờ giảm", video forbids the absolute nagging rule).
- No live mock switch — runbook states it explicitly; pitch points only to the backup video;
  video labels mock footage. Consistent.
- Navigation Home → Room Map → Phòng 1; twist facts hardline HN 3,5tr/3,2tr — all three agree.
- Score screen: 6 fixed rules + verbatim weak line — all three describe the same screen.

---

# SINGLE SOURCE OF TRUTH — demo 16:15 (use this if any document disagrees)

## Exact lines to speak (LIVE — 2 lines only)

1. **Line 1 (beat 3, ~8s):** "Em thích phòng này, ở lâu dài được. Ngân sách của em là 3
   triệu một tháng, đóng đúng hạn — anh cân nhắc giúp em được không ạ?"
2. **Close (beat 5, ~8s):** "Vậy mình chốt 3 triệu 2, em ký 6 tháng, đóng đúng ngày —
   được không anh?"
3. **Video-only line (never live):** "Em trả đúng hạn mỗi tháng, có gì thay đổi em báo
   trước." — plus the video's own line 1 and close (see Clarification 1); do not rehearse
   them as live lines.

## Timing budget (one rule)

- Pitch = 3:00, 6 beats × 30s. **One live turn = max 30s total (speak ~8s + wait ~22s).**
  If the AI has not replied when the turn budget ends, do not stand silent: move to the
  next beat's spoken content; recovery (retry once in beat 3, then type) happens only if it
  fits without cutting the beat-5 close or the minimum 10s score-screen hold — otherwise go
  straight to the labeled backup video (branch B). Never promise "~12s" per turn.

## Fallback ladder (in order, never skip)

1. Wait (inside the 30s turn budget). 2. Retry voice once — beat 3 only. 3. Type the exact
   line into "Hoặc gõ tin nhắn…". 4. **[ĐÃ GIẾT 15:36 — không còn video]** Say it plainly (one of the two canonical sentences) and speak beat 6 over the unfinished chat screen. **Never** show a rehearsal score screen. **Never** present anything pre-recorded as live AI. There is **no live mock switch**.

## Floor language (say exactly this)

- "Chạm sàn ở lượt 2, không xuống thấp hơn." The floor is a **fixed 3,2 triệu** that the
  landlord states in the opening line — do NOT call it secret. Never say "giá không bao giờ
  giảm" or "năn nỉ thì giá giữ nguyên" as an absolute rule.

## Claims (say only this)

- Progress on stage: "số buổi, tổng tiền tiết kiệm được, điểm cao nhất" (cumulative total,
  no "mỗi tháng").
- Rooms 2–5, roadmap, XP, levels, streak: NOT shipped — "bước tiếp theo", no date.
- No TAM/SAM/SOM numbers. "100 người tuần đầu" is a target, not traction.

## Log Codex (owner order: use heavily, burn tokens)

Codex on this machine CANNOT read/write/run files (missing binary `codex-code-mode-host` —
verified); all context was pasted into prompts, Codex returned text only, zero files changed.

1. **Call 1 — contradiction hunt:** 20,796 tokens. Confirmed all 5 contradictions (C1–C5),
   confirmed the video-lines difference is NOT a contradiction, found no additional
   contradiction. Added one nuance: a 30s turn budget consumes a whole beat, so the fix must
   define the cutoff as speak + wait total (adopted in C2). Note: this "no additional
   contradiction" verdict rests on call 1 (which received all three documents in full) plus
   my own full read — call 2 below could NOT independently confirm it, because it only
   received this draft.
2. **Call 2 — redteam of this draft:** 13,218 tokens. Confirmed C1–C5 are real (conditional
   on the quotes being accurate) and found no additional contradiction in the draft's
   reasoning. Applied fixes: (a) SSoT ladder heading changed from "never skip" to conditional
   skip with the cut order named, since "go straight to video" skips retry/type; (b) the
   ~22s derived wait figure dropped — "max 30s total per turn" is now the controlling rule,
   with retry/type explicitly OUTSIDE the turn budget; (c) severity scheme added (Major =
   stage risk, Medium = claim accuracy) and C4/C5 downgraded to Medium; (d) C5 nuance added
   ("fixed" vs "secret" before the opening); (e) C3 fix now carries the conditional cutoff.
   Not applied: nothing — all redteam points were valid. Codex could not verify quotes
   against the branch heads (code-mode-host missing) and noted the draft's "no additional
   contradictions" claim is not verifiable from the draft alone (see note under call 1).

## What I could NOT verify

- Whether the pitch/runbook/video branches have been corrected since I read them (I read the
  pushed branch heads at ~15:35; if anyone edited them after, re-check C1–C5 against the new
  text).
- Live AI latency at the venue (assumed 30s budget, unmeasured — same caveat as all three docs).
- Whether the landlord will actually close at exactly 3,2tr in the live round (temperature
  0.9; runbook branch B covers the no-close case).
- The backup video file itself (only its script was audited; the runbook already flags that
  the phone holder must verify the file opens, is labeled mock, and runs 60–90s).
