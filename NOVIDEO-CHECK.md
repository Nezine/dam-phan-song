# NOVIDEO-CHECK — redteam of the no-video fallback ladder

- Pitch: 16:15, 3:00, 6 beats × 30s. Documents read in full at current heads:
  - `PITCH-CODEX.md` — branch `migga/pitch-codex` @ `74e0079` (98 lines)
  - `DEMO-RUNBOOK.md` — branch `migga/demo-runbook` @ `34d9e34` (150 lines)
  - Cross-checked: `QA-DRILL.md` — `migga/qa-drill` @ `4269f4c`; `CONSISTENCY.md` — `migga/demo-consistency` @ `d06e913`
- Method: full read of both docs + grep verification (`video`, `bí mật`, `tiết kiệm`, `12s`/`12 giây`, `30 giây`, `nói thẳng`); Codex call 1 (ladder completeness) + call 2 (hostile judge on the say-it-plainly fallback). Codex text-only, 0 file changes.
- Background: backup video killed by Tuấn 15:36 — no video file exists, nothing will be recorded. Intended ladder: wait max 30s/turn (speak + wait) → retry voice once (beat 3 only) → type the exact line → if still nothing, say plainly the live round did not close and speak beat 6 over the unfinished chat screen. Never show a rehearsal score screen. No live mock switch.

## VERDICT: FAIL

The pitch script is clean. The runbook is NOT safe to follow as written: **5 operative places still route the presenter (or the phone holder) to open, play, or verify a backup video that does not exist**, plus 2 stale redteam notes and 1 dead section that still describe the video as if it were real. The fixed ladder (§5) is sound, but the doc as a whole still has live paths into a dead end. A presenter who hits Expo-Go failure at 16:10 or a dead AI on stage and follows §1 / §4C / §8 will look for a video that isn't there — in front of the judges.

## Check 1 — video references: PITCH CLEAN, RUNBOOK FAILS

### Pitch (2 mentions, both "no video" — clean)
- L48 fallback paragraph: "Không có video dự phòng (Tuấn đã giết — không quay gì nữa)" — no video action. ✓
- L67 redteam note 1: "(thử lại → gõ chữ; không có video dự phòng)" — clean. ✓

### Runbook (18 mentions; 6 fixed, 5 operative, 2 stale, 1 dead section, 1 provenance)
Fixed / correct (no action needed):
- L14 (§0 rule 4): "Không có video dự phòng. Tuấn đã giết video (15:36)…" ✓
- L39 (cut order 1): dead terms line "(video đã giết, câu này không dùng nữa)" ✓
- L83 (§4B): "Không có video dự phòng (Tuấn đã giết…)" ✓
- L96 (§5 step 4): "Nói thẳng + nhịp 6… Không có video dự phòng." ✓
- L98 (mock note): "Mock không tồn tại dưới dạng nào trên sân khấu hôm nay" ✓
- L116 (§7): "hôm nay không có video dự phòng." ✓

OPERATIVE — still instructs someone to open/play/verify a video (fix before 16:15):
- **V1 — L25 (§1 checklist):** "Hạn chót 16:10 — quá 16:10 vẫn không load được thì chuyển sang phương án video dự phòng (mục 4)…" — If Expo Go won't load, the phone holder is told to switch to a video that doesn't exist. This is the most time-critical one: it fires BEFORE the pitch, when there is still time to panic.
- **V2 — L87 (§4C, AI fully dead):** "nói câu ở nhánh B rồi mở video dự phòng." — The end state of the AI-dead branch is an impossible action.
- **V3 — L123 (§8 Q1, spoken answer to judges):** "nếu vòng không chốt, em mở video dự phòng đã gắn nhãn mock thay vì bịa điểm." — A promised action the presenter cannot perform. If a judge asks this question, the presenter will offer a video, then have nothing to open.
- **V4 — L125 (§8 Q2, spoken answer to judges):** "đó là lý do có ô gõ chữ và video dự phòng." — A false claim to judges that a backup video exists as a fallback.
- **V5 — L150 (Claim CHƯA verify #5):** "Video dự phòng đã quay xong chưa — file này giả định video đã có sẵn trên máy / sẵn sàng để mở. Người giữ máy kiểm tra lại trước 16:00: video mở được, có nhãn mock trên khung hình, dài 60–90s." — Tells the phone holder to verify a nonexistent file minutes before the pitch.

STALE — historical notes that still describe the video as the rule (fix or label unmistakably obsolete):
- **V6 — L131 (redteam note 3):** "nếu không chốt thì mở video mock đã gắn nhãn + nói rõ trước." — Internally contradicts its own sentence ("Bản này bỏ hẳn phương án đó"). A reader now reads it as the current rule.
- **V7 — L134 (redteam note 6):** "chỉ mở video nếu còn thời gian và giám khảo muốn xem thêm một vòng đầy đủ." — Same problem.

DEAD SECTION — no stage instruction, but misleading content:
- **V8 — L55–61 (§3 Câu 2):** header "CHỈ DÙNG KHI QUAY VIDEO DỰ PHÒNG" + body describing the 3-turn video round + "Chủ nhà phải làm gì (trong video)". No video will ever be recorded; the doc's own cut order (L39) says this line is "không dùng nữa". The section sits inside "Ba câu nói của người tập", so the presenter may waste time memorising it or believe a video round exists. Strike it or relabel "ĐÃ GIẾT — không dùng".

Provenance only (no fix needed, noted for completeness):
- L5 (source line): cites VIDEO-SCRIPT.md as a source — harmless provenance, but the source doc is now marked KILLED.

## Check 2 — ladder completeness: §5 PATH SOUND, BRANCH STRUCTURE BROKEN

Failure-path trace (Codex call 1 confirmed):
| Path | Ends at | Doable? |
|---|---|---|
| (a) Expo Go won't load by 16:10 | §1 L25 → "chuyển sang phương án video dự phòng" | **NO** — file doesn't exist. No no-video ending is specified for this failure at all. |
| (b) AI silent in beat 3 | Retry once → type the line | **PARTLY** — retry/type are actionable, but the docs never say what happens if the TYPED line also gets no reply at beat 3: continue to beat 4, or invoke the no-score ending? Undefined. |
| (c) AI silent in beat 5 | Pitch L48: say plainly, speak beat 6 over unfinished chat | **YES** |
| (d) Landlord refuses to close | §4B: say plainly, speak beat 6 over unfinished chat | **YES** |
| (e) AI dead all the way | §4C → "mở video dự phòng" | **NO** — impossible next step. §5 step 4 has the viable substitute ("nói nhịp 6 trên nền màn hình chat dở dang") but §4C doesn't point there. |

"Say it plainly" wording — NOT identical across docs (three variants, same meaning, different words):
- Pitch L48: "lượt trực tiếp chưa chốt được nên chưa có điểm" (used for the beat-5 no-close case)
- Runbook §4B: "Lượt trực tiếp chưa chốt được, nên app chưa tạo màn hình chấm điểm."
- Runbook §5 step 4: "Mạng trực tiếp không chạy được, lượt này chưa chốt nên chưa có điểm."
- The pitch conflates the two situations (no-close vs AI-dead) into one sentence; the runbook splits them but with different phrasing. Codex call 1 + call 2 both recommend TWO canonical sentences, one per situation (see fix F9). Sentence (iii) is the worst: it asserts "mạng không chạy được" when the team cannot know the cause — Codex call 2 calls it the most misleading of the three.

## Check 3 — timing: PASSES (with 2 nits)

- 30s/turn rule is present everywhere operative: pitch L22, L33, L48 ("IM LẶNG (trong ngân sách 30 giây/lượt)", "Một lượt = tối đa 30 giây (nói + chờ)"); runbook §2 beat 3 (L33, "Ngân sách tối đa 30 giây cho lượt này (nói + chờ)"), §5 step 1 (L93, "Tối đa 30 giây cho cả lượt (nói + chờ)").
- No operative ~12s promise: the only "12 giây" hits are a negation (L93, "không phải 12 giây — đừng hứa 12 giây") and a historical redteam note (L129, "bản nháp hẹn '~12 giây'"). ✓
- Cut order (L39–44) never cuts the beat-5 close or the 10s score hold; retry/type eat the next beat's narration (beat-4 elaboration first, then beat-6). Consistent between pitch L48 and runbook L93. ✓
- 3:00 / 6 beats × 30s consistent in both docs; runbook table 16:15:00–16:18:00 adds up. ✓
- NIT T1: the §2 table's beat-5 row doesn't repeat the 30s budget (beat 3's row does). §5 step 1 covers all turns, so this is a readability nit, not a failure.
- NIT T2 (found by Codex call 1): the cut order's "Không bao giờ cắt: câu chốt ở nhịp 5 + tối thiểu 10 giây giơ màn hình điểm" is UNCONDITIONAL, but in the no-score case there is no score screen to hold. Make the hold conditional on a live close (see fix F11).

## Check 4 — floor / savings language vs QA drill + consistency audit: PASSES

- "bí mật": ZERO occurrences as a claim in pitch or runbook — both say "giá sàn cố định 3,2 triệu" (pitch beat 2 + Q&A 1; runbook header + §0 rule 3 "chạm sàn ở lượt 2, không xuống thấp hơn"). ✓
- QA-DRILL.md mentions "bí mật" only inside Q4, which is ABOUT why the floor is not secret ("Đừng bao giờ nói 'bí mật' trên sân khấu"), and flags the known internal contradiction (persona prompt `gemini.ts:22` says the floor is secret while the hardline opening announces it). No contradiction with pitch/runbook — all three docs agree on the wording. ✓
- Savings: pitch "tổng tiền tiết kiệm được", runbook "tổng tiền tiết kiệm", QA drill same — cumulative, no "/tháng" anywhere. ✓
- QA drill has ZERO "video" mentions — it does not rely on a video. ✓
- Note: CONSISTENCY.md's Single Source of Truth still lists "4. Labeled backup video" as the last ladder step. That audit predates the kill (15:38 vs 15:36 kill — it was written from the pre-kill docs), so its SSoT is now superseded on the video step only. Its floor/savings findings (C4/C5) still hold. Not a contradiction in the two docs under review — just flag the audit as stale on video.

## Fixes still needed (ordered — do NOT apply here; this is verification only)

1. **F1 (V1, L25):** Rewrite the §1 Expo-Go-failure item with a real no-video ending, e.g. "quá 16:10 vẫn không load được thì báo team ngay; demo không có app live — nói thẳng với giám khảo, không mở video, không giơ điểm tập trước." (Needs a team decision on what the 16:10 failure actually means for the pitch.)
2. **F2 (V2, L87):** §4C must end at §5 step 4, not at a video: "…nói câu ở nhánh B rồi nói nhịp 6 trên nền màn hình chat dở dang (thang mục 5, bước 4)."
3. **F3 (V3, L123):** Rewrite §8 Q1's answer: "nếu vòng không chốt thì không có điểm để giơ — nói thẳng như nhánh B, không mở video, không bịa điểm."
4. **F4 (V4, L125):** §8 Q2: delete "và video dự phòng" — the fallback is the text box only.
5. **F5 (V5, L150):** Delete unverified-claim #5 entirely (there is no video to verify) or replace with "Video dự phòng: ĐÃ GIẾT — không có file, không kiểm tra gì."
6. **F6 (V6/V7, L131/L134):** Label both redteam notes as pre-kill history ("ghi chú này viết TRƯỚC khi video bị giết 15:36 — không còn áp dụng") or delete the video sentences.
7. **F7 (V8, L55–61):** Strike §3 Câu 2 or relabel "ĐÃ GIẾT — không dùng, không tập" so nobody memorises it.
8. **F8 (path b):** Define the beat-3 typed-no-reply ending: after typing, wait how long, then continue to beat 4 or invoke the no-score ending? (Codex call 1: "Set one rule: after typing, wait a defined period; if still no response, continue the pitch and use the no-score ending at the designated beat.")
9. **F9 (say-it-plainly):** Adopt TWO canonical sentences, verbatim in both docs — Codex call 2's wording: round didn't close → "Lượt này chưa chốt được, nên app chưa tạo màn hình chấm điểm."; AI never responded → "AI chưa phản hồi trong lượt này, nên lượt chưa chốt và app chưa tạo màn hình chấm điểm." Never say "Mạng trực tiếp không chạy được" (no evidence for the diagnosis).
10. **F10 (T2):** Make the 10s score hold conditional: "tối thiểu 10 giây giơ màn hình điểm — CHỈ khi vòng live đã chốt; nếu không chốt thì không có màn hình điểm để giữ."
11. **F11 (Codex call 1):** Add a concrete instruction for what screen the phone shows on each failure path, so the presenter never accidentally lands on (or reveals) a rehearsal score screen. The docs forbid showing one but never say how to avoid it.
12. **F12 (Codex call 1):** Define the give-up trigger explicitly — exactly when the team stops recovering (especially the typed line and a silent beat 3), so presenter and phone holder don't disagree in front of the judges.

## Codex log (owner order: use heavily, burn tokens)

Codex on this machine CANNOT read/write/run files (missing binary `codex-code-mode-host` — verified); all context was pasted into prompts, Codex returned text only, zero files changed.

1. **Call 1 — ladder completeness check:** input 18,970 tokens (10,880 cached) + output 1,644 = **20,614 tokens**. Confirmed all 6 live video routes + 2 stale notes I found, plus 3 new holes I had not listed: the beat-3 typed-no-reply gap, the unconditional 10s hold, and the undefined give-up trigger. Also flagged the Rule-4 cross-reference "(xem mục 4)" as a trapdoor into §4C's video line.
2. **Call 2 — hostile judge on the say-it-plainly fallback:** input 18,248 tokens (10,880 cached) + output 656 = **18,904 tokens**. Verdict: the fallback concedes the demo's main proof — the score screen IS the evidence the pitch is built around, and without a close there is nothing to hold up; beat 6 is an invitation, not a recovery. Sentence (ii) most honest, (iii) most misleading (asserts a network cause with no evidence). Most damaging judge question: "Your pitch's main evidence was the live score screen. The round didn't close, so where is that evidence?" Only honest answer: admit the proof is missing today and pivot to the 100-user test — it doesn't save the demo, it avoids making it worse.
3. **Total this task: 39,518 tokens** (20,614 + 18,904). Codex changed zero files — as expected.

## What I could NOT verify

- Live AI latency at the venue (30s/turn budget unmeasured — same caveat as all three docs).
- Whether the landlord closes at exactly 3.2tr live (temperature 0.9; branch B covers the no-close case).
- Whether the phone holder will actually follow the runbook under stage pressure (the doc is only as good as its rehearsal).
- APK / form / master state — out of scope for this check; the parent's other agents cover those.
- Note: my first worktree (`/tmp/wt-novideo`, branch `migga/novideo-check`) was wiped from /tmp mid-task by an environment cleanup; I rebuilt on `/tmp/wt-novideo2` / branch `migga/novideo-check2` and re-extracted all four docs from the branch heads before verifying. The branch heads cited above are what was actually read.
