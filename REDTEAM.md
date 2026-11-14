# RED TEAM — Đàm Phán Sống (hackathon, Sat 14/11, ~85 min to submit)

**Role:** independent red team. Built nothing, graded nothing before this. Every defect below was read in the actual code on `origin` (fresh clone, 14:31). Nothing invented. No files edited, committed, or pushed.

**Method:** read all new files on `muse/roadmap-screens`, `muse/room-map`, `muse/gamification`, `slice-1-negotiation-core` (`App.tsx`, `score.ts`, `mock.ts`, `progress.ts`, `types.ts`), the three integration docs, and `JUDGE-VERDICT.md`. Cross-checked branch bases with `git merge-base` and `git diff`. One web crawl for Duolingo UI references (see §3).

**Headline:** 2 DEMO-KILLERs, 15 MAJORs, 11 MINORs. The worst bug is not in any screen — it is a merge collision the judge missed entirely (§0). The second worst is also one the judge misattributed.

---

## §0 — THE MERGE HAZARD (read first, before anyone merges anything)

**All three feature branches were cut from `c0b0edf` — the PRE-PR#3 Slice 1.** Verified: `git merge-base` = `c0b0edf` for all three; all three branches' `App.tsx` is byte-identical to `c0b0edf:App.tsx` (`e5448ba`). At `c0b0edf`, `src/lib/` contained only `gemini.ts`, `groq.ts`, `mock.ts`, `types.ts` — **no `progress.ts`, no `score.ts`, no `UX-FIXES.md`**.

Slice-1 head (after PR #3, merged 14:24) **added** `src/lib/progress.ts` (persistent: `loadProgress`/`recordSession`, `Progress = { sessions, totalSaved, bestScore, updatedAt }`), `src/lib/score.ts` (rule-based scoring), and a heavily rewritten `App.tsx` (result screen, mute, retry, rec timer, friendly errors).

**D-0. `src/lib/progress.ts` — add/add merge conflict, room-map vs slice-1. DEMO-KILLER.**
`muse/room-map` added its own `src/lib/progress.ts` (in-memory: `getProgress`/`completeRoom`/`isRoomUnlocked`, `Progress = { level, xp, xpForNextLevel, streakDays, sessionsThisWeek, roomsCompleted, currentRoomId }`). Same path, entirely different API and type, both added after the base. A merge **will** conflict on this file, and either wrong resolution breaks the build:
- Take slice-1's version → `HomeScreen`/`RoomMapScreen`/`AppShell` fail to compile (`getProgress`, `completeRoom`, `isRoomUnlocked` missing; `Progress` shape wrong).
- Take room-map's version → `App.tsx` fails to compile (`loadProgress`, `recordSession` missing; `progress.sessions` / `totalSaved` / `bestScore` don't exist).
Fix: **before merging, rename room-map's file to `src/lib/roomProgress.ts`** (and its imports) or merge the two `Progress` types into one file. Do not let anyone resolve this conflict by picking a side.

**D-0b. Staleness: the branches predate PR #3.** The judge graded each branch against `c0b0edf`, so its "zero Slice 1 files modified" is true only against that old base. Consequences: (a) the integration docs were written against the old `App.tsx` (no result screen, no `showResult`, no `progress` strip); (b) nobody has run `tsc` on the merged tree; (c) `POLISH-NOTES.md`'s mount advice targets the old setup screen. Fix: rebase all three branches onto current slice-1 head (or master) and re-run `tsc --noEmit` on the merged tree before the 15:30 freeze.

---

## §1 — RANKED DEFECT LIST

### DEMO-KILLER

**D-1. No exit from an in-progress negotiation — Slice 1 itself, not AppShell.**
File: `App.tsx` (slice-1-negotiation-core), chat screen `return` lines 438–549.
The chat header (lines 445–457) has only a mute button. `backToSetup()` exists (lines 171–175) but is wired **only** from the win card (line 513) and the result screen (line 431). If the negotiation stalls — AI slow on weak venue Wi-Fi, presenter flubs a line, wrong twist tapped — there is no way out except kill/reopen the app. The judge flagged the dead end but blamed AppShell; the root cause is Slice 1: even without AppShell, a stalled round strands the presenter in front of the judges.
Fix: add a "✕ Thoát" button in the chat header calling `backToSetup()` (and, if AppShell is the entry, an `onExit` prop). 5 minutes, highest priority.

**D-2. (see D-0) `progress.ts` add/add merge conflict.** Resolving it wrong = no build = no demo.

### MAJOR

**D-3. Every quiz answer is the middle option — the tests are gameable by position.**
File: `src/lib/roadmap.ts` (muse/roadmap-screens), `correct: 1` at lines 97, 107, 117, 175, 185, 195, 253, 263, 273, 331, 341, 351, 409, 419, 429.
All 15 quiz questions across all 5 levels have the correct answer at index 1 (the middle of 3 options). Anyone who takes two tests — including a judge — spots the pattern and scores 10/10 by tapping middle-middle-middle. The judge praised the quiz ("every correct answer verifiably correct") and missed this.
Fix: shuffle the options of each question (or vary the correct index per question) before the demo.

**D-4. Scoring reads "3 tháng" as 3,000,000đ — false evidence on the result screen.**
File: `src/lib/score.ts` (slice-1), `extractVnd` lines 35–54.
The regex's bare-number fallback (`else if (raw >= 1 && raw <= 100) out.push(raw * 1_000_000)`, line 51) turns any small bare number into millions. "Em đóng 3 tháng một lần" → `[3,000,000]` → rule R1 "Đưa ra giá mục tiêu cụ thể" **passes** with that sentence shown as evidence (lines 91–99), and R4 persistence counts "3 tháng" + "2 tháng" as two distinct counter-offers (lines 107–114). The result screen — the "fixed scoring scale" that pitch point #3 rests on — will display payment-schedule talk as proof of a target price. A judge reading the evidence line catches it instantly.
Fix: only treat a bare number as millions when it is adjacent to a price cue, or require an explicit unit (`tr`/`triệu`/`k`) for R1/R4; ignore numbers followed by `tháng`/`người`/`ngày`.

**D-5. AppShell silently swallows taps on rooms 2–5.**
Files: `src/AppShell.tsx` lines 30–34 and 43–45; `src/screens/RoomMapScreen.tsx` line 85.
`onEnterRoom` only acts when `roomId === 'rent'`; any other room is a silent no-op. Yet the card still shows "Vào luyện →" (via a dead ternary that renders the same text on both branches). If the team wires `completeRoom('rent')` so Room 2 unlocks (as `INTEGRATION.md` suggests), tapping it does nothing in front of the judges.
Fix: either give rooms 2–5 a real (even stub) negotiation entry, or change the button text for unbuilt rooms to "Sắp có" and disable the press.

**D-6. The streak can never advance — display-only feature.**
Files: `src/components/gamification/StreakCounter.tsx`; `POLISH-NOTES.md` lines 16–21.
The mount snippet updates only `totalXp`, `roundsPlayed`, `roundsWon`, `roundsToday`, `bestSavingPct` — nothing anywhere increments `streakDays`, and no last-played-date logic exists (POLISH-NOTES line 65 admits this). Mounted as documented, the streak shows "0 ngày" forever, no matter how much the user plays. The judge praised the "honest zero-states" without noticing the zero is permanent.
Fix: increment `streakDays` on first round of a new day (store last-played date); for the demo, seed streak at 1 after the first completed round in the session.

**D-7. DailyGoalCard promises +50 XP that is never awarded.**
File: `src/components/gamification/DailyGoalCard.tsx` lines 22–24.
On completion the card says "Xong! Bạn đã luyện 1/1 vòng — +50 XP", but no code path awards a daily-goal bonus: `XP_REWARD` (gamification.ts lines 40–45) has no daily-goal entry and the mount snippet never adds it. The card's promise is a lie on screen.
Fix: add `dailyGoal: 50` to `XP_REWARD` and award it once when `roundsToday` first reaches the target, or remove "+50 XP" from the card copy.

**D-8. Interview (level 5) and investor (level 8) rooms can NEVER unlock in room-map's own system.**
File: `src/lib/progress.ts` (muse/room-map), SEED lines 18–26; `completeRoom` lines 35–40.
`progress.level` is set only in the SEED (2) and **nothing ever changes it** — `completeRoom` touches only `roomsCompleted`. `isRoomUnlocked` gates interview on `level >= 5` and investor on `level >= 8` (rooms.ts lines 66, 78). As written, those rooms are permanently locked. (Separately: even under the judge's unification fix, roadmap completion is 350 XP → level 3 in `levelFromXp`, so the roadmap alone can never reach level 5 either — the gates need re-tuning to level 3/4 or the roadmap needs to award more XP.)
Fix: derive `level` from XP via `levelFromXp(totalXp)` and lower the gates (interview 3, investor 5), or wire level-ups into `completeRoom`.

**D-9. AppShell's progress goes stale and can never refresh — the judge's "acceptable" is wrong.**
File: `src/AppShell.tsx` line 17; `src/lib/progress.ts` line 28.
`AppShell` calls `getProgress()` during render and holds no state; `completeRoom` reassigns the module-level `progress` variable, so the rendered screens keep the old object and nothing re-renders. The judge called this "minor… refreshes on navigation, so acceptable" — but there is **no navigation back** from the negotiate screen (D-1), so the refresh it relies on cannot happen. Even if `completeRoom` is wired, the unlock never becomes visible in a running app.
Fix: lift progress into AppShell state (`useState` + a `refreshProgress()` passed down) or re-read `getProgress()` on every screen transition.

**D-10. Two competing "home" screens; the gamification mount targets the wrong one.**
Files: `src/AppShell.tsx` lines 19–23; `POLISH-NOTES.md` line 24.
If AppShell is the entry, the real home is `HomeScreen.tsx` — but tapping "Luyện ngay" renders `<App/>`, which starts at its **own** setup form (name/city/price/twists). The demo flow is Home → form → negotiation: two setup screens back-to-back. Meanwhile `POLISH-NOTES.md` says to mount `DailyGoalCard` + `XpBar` on "the home screen, above the twist list" — i.e. the App.tsx setup form, which is the *second* screen the user sees, not the home. Mounted as documented, the gamification is invisible on the actual home.
Fix: mount `DailyGoalCard` + `XpBar` on `HomeScreen.tsx` (the AppShell home), and decide one entry flow — ideally skip the App.tsx form when launched from Home with a preset.

**D-11. 10 of 20 roadmap items are read-and-tick — no interactive content.**
File: `src/components/RoadmapItemDetail.tsx` lines 158–162.
Every exercise item is: read a lesson paragraph, tap "Đánh dấu đã làm +10 XP →". Self-certified, zero interaction, zero verification. In a demo, tapping an exercise shows static text and a checkbox. Duolingo's rule (from the crawl): one exercise, one input, minimal chrome — every lesson is *done*, not read.
Fix (cheap, before 15:30): give each exercise one quick interaction — a single tap-to-choose question or a "say it out loud" mic prompt — or hide the exercise detail and mark it done from the list with a long-press. At minimum, do not demo an exercise item live.

**D-12. Roadmap persistence uses the legacy `FileSystem.documentDirectory`, unverified on SDK 58 — fails silently.**
File: `src/lib/roadmap.ts` lines 518–538.
Slice-1's own `progress.ts` deliberately uses the SDK 58 API (`Paths.document` + `new File(...)`) with the comment "Uses the SDK 58 expo-file-system API". Roadmap uses the old `FileSystem.documentDirectory` constant instead. The code fails safe (`?? ''` guard, `try/catch` → `{}`), so the failure mode is silent: progress simply never persists and the "saved progress" pitch point (ChatGPT-differentiation #4) quietly doesn't work. Unverified — no `tsc` run on this branch.
Fix: switch to the `Paths.document` pattern from slice-1's `progress.ts`, and verify with a real Expo Go run.

**D-13. The win moment — the demo climax — is a static card; the landlord has no face.**
Files: `App.tsx` winCard lines 610–622; chat bubbles lines 458–467.
Duolingo's loop ends every lesson with celebration (animation, XP burst, sound). Our win card is static green text on a static screen — the emotional peak of the 3-minute demo is flat. Worse, the "opponent" is a text bubble labelled "Chủ trọ 😠" — no avatar, no face, no character. A voice negotiation app where the other side is invisible reads as a chatbot, which is exactly the "bolted-on chatbot" failure the judges score against.
Fix (cheap): a big animated XP burst on the win card (`+150 XP` with a scale pulse — no new deps, `Animated` from react-native), and a landlord avatar circle (emoji 🧑‍🦳/👨 in a colored ring) in the chat header that changes with `emotion`.

**D-14. Default name is "Minh" — the presenter is not Minh.**
File: `App.tsx` line 88 (`useState('Minh')`) and line 341 (placeholder "Minh").
Twist presets bypass the name field, so a demo launched from a twist addresses the user as "Minh" throughout (landlord lines, greeting, progress). The presenter is Phạm Tuấn Huy. The judge flagged the HomeScreen greeting but not that Slice 1 itself defaults to a wrong name.
Fix: default `tenantName` to `''` with placeholder "Tên bạn", falling back to "bạn" (already the fallback at line 179).

**D-15. `ROADMAP_INTEGRATION.md`'s own example wiring is a dead end (confirmed).**
File: `ROADMAP_INTEGRATION.md` lines 44–48.
The documented `onStartPractice` example calls `setScreen('setup')` — the user taps "Bắt đầu thực hành 🎤" and is dumped back to setup with no negotiation started and no feedback. (The judge caught this one too — it stands, and it is MAJOR, not minor: it is the only documented path for the practice CTA.)
Fix: wire it to `startNegotiation` with a preset built from the practice prompt, or remove the button until Slice 2 lands.

**D-16. XP gates vs badge mismatch: the level-5 badge and the interview room disagree about what "level 5" means.**
Files: `gamification.ts` line 118 (`levelFromXp(totalXp).level >= 5`); `rooms.ts` line 66 (`requiresLevel: 5` on room-map's separate `level`).
Two different "level 5"s from two different economies. After the judge's unification fix they converge, but as-shipped a user can hold the "Lên cấp 5" badge while the interview room stays locked (or vice versa).
Fix: fold into D-8's single-economy fix; do not demo the badge and the room gate in the same breath until unified.

**D-17. `recorder.stop()` sits outside try/catch — unhandled rejection risk on the mic path.**
File: `App.tsx` lines 282–286. `await recorder.stop()` is not wrapped; the `try` starts after it. If stop rejects, the press handler rejects unhandled (red error overlay in Expo Go dev). Low probability, high demo cost.
Fix: move `stop()` inside the `try`.

### MINOR

**D-18. Quiz option border jump.** `RoadmapItemDetail.tsx` line 212: base `opt` has no `borderWidth`; `optSelected`/`optRight`/`optWrong` add `borderWidth: 2` → 4px layout shift on tap. (Judge caught; confirmed.) Fix: `borderWidth: 2, borderColor: 'transparent'` on base `opt`.

**D-19. Type-scale + gray drift.** Roadmap h1 26 vs App.tsx 28; `#c9d4de` (roadmap detail body), `#c3d0dc` / `#3a4756` (room-map). (Judge caught; confirmed.) Fix: one gray `#9fb0bf`, H1 28.

**D-20. Dead ternary.** `RoomMapScreen.tsx` line 85: `room.id === 'rent' ? 'Vào luyện →' : 'Vào luyện →'`. (Judge caught; confirmed.)

**D-21. Static "Bài học hôm nay".** `HomeScreen.tsx` lines 74–81: one fixed lesson under a "today" label. (Judge caught; confirmed.) Fix: rotate by day-of-year or relabel "Bài học".

**D-22. `BadgeGrid` caption 10px; `saving-10` badge is price-scoped.** `BadgeGrid.tsx` line 53; `gamification.ts` line 93 ("giá mở đầu" meaningless for interview/investor rooms). (Judge caught both; confirmed.)

**D-23. Generic roadmap footer.** `RoadmapScreen.tsx` lines 150–156: motivational filler, zero information. (Judge caught; confirmed.)

**D-24. `LevelRing` lights all 12 dots at 96% progress.** `LevelRing.tsx` line 17: `Math.round(progress * 12)` — at 0.96 it shows a full ring before the level-up. Cosmetic. Fix: `Math.floor`.

**D-25. Room-map connector is ~4px off the icon centre (arithmetic, render-unverified).** `RoomMapScreen.tsx` line 112: `marginLeft: 34`; icon centre sits at ~30px from the card edge (padding 16 + 28px icon / 2). Fix: `marginLeft: 30`, verify on device.

**D-26. Result-screen home button uses 🏠.** `App.tsx` line 432: "🏠 Về màn hình chính" — house emoji on a generic screen; POLISH-NOTES only fixed the chat header. Fix: "← Trang chủ".

**D-27. `POLISH-NOTES.md` is stale.** Line 10 says the gamification branch is "local only, not pushed" — it is pushed (`origin/muse/gamification`). Fix: one line.

**D-28. Win-card XP line as written claims a level-up that may not happen.** `POLISH-NOTES.md` line 50: "`⭐ +150 XP — vòng này bạn lên Cấp X`". At some XP totals +150 does not level up. Fix: compute the level before/after and only claim the level-up when it actually happens.

---

## §2 — ATTACK ON THE JUDGE VERDICT

**What the judge missed (each is a real defect above):**
1. **The `progress.ts` add/add merge conflict (D-0/D-2)** — the single most dangerous item in the batch. The judge's "zero Slice 1 files modified" is true only against the stale base `c0b0edf`; it never compared branch file lists against current slice-1 head, where `progress.ts`/`score.ts` were added after the base.
2. **Quiz middle-answer pattern (D-3)** — praised the quiz, missed that all 15 correct answers sit at index 1.
3. **`score.ts` false positives (D-4)** — never read `score.ts` at all; its scope was the three branches + docs.
4. **AppShell swallowing non-rent taps (D-5)** — noted `completeRoom` has no caller, missed the silent no-op.
5. **Streak can never advance (D-6)** — praised "honest zero-states" for a counter that is permanently zero.
6. **Daily-goal +50 XP lie (D-7)** — never traced the reward to an awarding code path.
7. **Level gates unreachable (D-8)** — noted the economy conflict, never computed that `level` is never incremented and that 350 XP caps at level 3.
8. **Stale-progress reasoning wrong (D-9)** — called it "minor… refreshes on navigation", but no back-navigation exists.
9. **Two homes / wrong mount target (D-10)** — never traced the AppShell → App setup flow.
10. **Exercises are honor-system (D-11)** — never opened an exercise item's interaction model.
11. **Legacy `FileSystem.documentDirectory` (D-12)** — never compared the roadmap's storage API against slice-1's SDK 58 pattern.
12. **No-exit root cause is Slice 1, not AppShell (D-1)** — misattributed the dead end.
13. **Default name "Minh" in Slice 1 (D-14)** — flagged the greeting, not the default.

**What the judge got right (confirmed by re-reading the code):** navigation dead end exists; fake seeded progress is contradictory; hardcoded "Minh"; static daily lesson; dead ternary; `completeRoom` has no caller; token/gray drift; H1 drift; quiz border jump; generic footer; price-scoped badge; 10px caption; unmounted gamification; three XP economies. Its merge-block items 2–3 (one fill colour, one gray, H1 28) are correct and cheap.

**What the judge overstated or got wrong:**
- "Progress staleness (minor)… refreshes on navigation, so acceptable" — **wrong**: no back path exists from negotiate, so it never refreshes. This is MAJOR, not minor.
- "Branch clean / zero Slice 1 files modified" — **misleading**: true vs `c0b0edf` only; hides the `progress.ts` collision and the pre-PR#3 staleness.
- "15 quiz questions, every correct answer verifiably correct" — **true but blind**: correctness of the answers is not the defect; positional uniformity is.
- "StreakCounter's honest zero-states" — **misleading praise**: the zero is honest only once; it can never become anything else.
- Taste scores (8/7/8) are **generous** given D-3, D-6, D-7, D-11: the roadmap's quiz is gameable, its exercises are self-certified, and the gamification's two most visible numbers (streak, daily-goal XP) never move. A re-grade after §1 fixes would be fair; as-shipped, roadmap 6/10, room-map 6/10, gamification 7/10.

---

## §3 — DUOLINGO GAP CHECK (web crawl, 14/11)

Sources: Duolingo gamification case studies (blakecrosley.com/guides/design/duolingo; tenali/case-studies/duolingo.md; selah.fm UX research). What Duolingo does that we don't — and which gaps matter in the next 85 minutes:

1. **Colour as an energy system.** Duolingo assigns one saturated colour per meaning (orange = streak/fire, yellow = XP/reward). We use yellow for XP numerals AND XP fills AND difficulty dots AND badge minis — yellow overload, blue underused. Cheap fix: fills blue, numerals yellow only (already the judge's fix #2).
2. **The path is a game map, not a list.** Duolingo's skill tree winds with completion circles that visibly fill. Our RoomMap is a vertical stack of cards with a straight 2px connector — it reads as a settings list. Cheap fix: offset alternate cards left/right and make the connector a dotted path; or at minimum vary card alignment. (15 min, optional.)
3. **Streak has a weekly calendar row (Mon–Sun dots).** Ours is a bare number that never moves (D-6). If the streak is fixed, add the 7-day dot row — it is the single most recognizable Duolingo visual.
4. **A mascot/character with a face.** Duo reacts emotionally to user actions. Our landlord is text + emoji. The chat header needs a face (D-13).
5. **Celebration at the win.** Variable rewards, confetti, XP burst. Our win card is static (D-13). This is the demo's climax — a 10-line `Animated` pulse on "+150 XP" is the highest-ROI visual fix left.
6. **Hearts/lives = stakes.** Duolingo makes mistakes cost something. We have no stakes mechanic; the negotiation has no cost for a bad line. Out of scope for today — do not add.
7. **One exercise, one input, minimal chrome.** Our negotiation screen already does this well (mic + text). Keep it; do not add chrome to the chat screen.

---

## §4 — FIX ORDER (cheapest demo-critical first, before the 15:30 freeze)

1. **D-0:** rename room-map's `progress.ts` → `roomProgress.ts` (or unify types). Blocks every merge. 10 min.
2. **D-1:** "✕ Thoát" button in the chat header → `backToSetup()`. Unblocks the demo flow. 5 min.
3. **D-3:** shuffle quiz option order (vary `correct` index). 5 min.
4. **D-4:** fix `extractVnd` bare-number rule. 10 min — the scoring screen is a pitch pillar.
5. **D-8 + D-16:** derive level from XP; lower gates (interview 3, investor 5). 10 min.
6. **D-6 + D-7:** wire streak increment + daily-goal XP award (or delete the promises from the copy). 10 min.
7. **D-5 + D-9:** AppShell — real entries or honest "Sắp có" labels; lift progress into state. 15 min.
8. **D-13:** win-card XP pulse + landlord avatar in chat header. 15 min.
9. **D-10:** mount gamification on `HomeScreen`, not the App setup form. 10 min.
10. **D-14:** default name `''` / "bạn". 1 min.
11. **D-11:** make exercises interactive or don't demo them. 15 min or a demo-script note.
12. **D-12:** switch roadmap persistence to `Paths.document`. 5 min + a real Expo Go run.
13. **D-15:** wire `onStartPractice` to `startNegotiation` or remove the button. 10 min.
14. **D-17, D-18–D-28:** mechanical one-liners (try/catch, borders, grays, H1, ternary, labels). Batch at the end.
15. **Rebase all three branches onto slice-1 head; `tsc --noEmit` + Expo Go smoke test on the merged tree.** Non-negotiable before merging — none of the three branches has ever been typechecked, and none has been rendered.
