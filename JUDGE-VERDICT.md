# JUDGE VERDICT — Đàm Phán Sống UI (hackathon, Sat 14/11)

**Judge:** independent judge subagent — fresh context, no production history, built nothing in this repo.
**Bar applied:** frontend-kit (no slop, taste 8/10, builder never self-grades) + taste-reference + PRODUCT-VISION.md ("Duolingo for negotiation", frontend-first, no rent framing).
**Method / limits — read this first:** CODE-ONLY grade. No screenshots exist, no Expo run, no `tsc --noEmit` (no `node_modules` on this VM) — the builders state the same. Render-dependent claims (alignment at 390px, overflow, tap sizes, the 12-dot ring on a real screen) are UNVERIFIED and marked as such below. Every defect below was read in the code; nothing is invented. I modified nothing.
**Scope note:** repo `AGENTS.md` says "use Expo Router", but `expo-router` is NOT installed (`package.json`: expo ~58.0.25, no router dep) and Slice 1 navigates by state machine. All three branches correctly matched the real codebase instead of the template rule. Do NOT "fix" this by adding a router mid-hackathon.

## Verdicts at a glance

| Branch | Commit | Verdict | Taste /10 |
|---|---|---|---|
| Roadmap screens | `muse/roadmap-screens` @ ba49a28 | **PASS WITH FIXES** | **8** |
| Room map + home | `muse/room-map` @ 2f42aa6 | **PASS WITH FIXES** | **7** |
| Gamification | `muse/gamification` @ 6207680 | **PASS WITH FIXES** | **8** |

**MERGE BLOCK (conditional, read before merging all three):** no branch blocks on its own, but the three together must NOT ship until the 4 unification fixes in §4 land — three incompatible XP/level economies, two progress-fill colours, three muted grays, and a navigation dead-end. Each fix is small and listed with exact file + change.

---

## 1. Roadmap screens — PASS WITH FIXES — taste 8/10

Files graded: `src/lib/roadmap.ts`, `src/components/RoadmapScreen.tsx`, `src/components/RoadmapItemDetail.tsx`, `ROADMAP_INTEGRATION.md`. Zero Slice 1 files modified (verified: `git diff c0b0edf..ba49a28` shows only the 4 new files; branch is pushed to origin — local checkout of this clone has since moved to `muse/vision`, grade is of ba49a28).

| Axis | Evidence (one line, observable in code) | Score /5 |
|---|---|---|
| Type | Copy is specific, hierarchy clear (26/16/14/12); quiz options 14px/19lh; H1 26 vs App.tsx h1 28 | 4 |
| Layout | Level cards + item rows on a steady 12/8 gap rhythm; selecting a quiz option adds a 2px border with no base border → 4px layout jump | 4 |
| Colour | Palette matches App.tsx exactly; one new gray #c9d4de for body text (desc/lesson/practice) | 4 |
| Space | Padding 16/12, gaps 12/8, consistent with App.tsx (12/14) | 4 |

**What is genuinely good (not slop):** 15 quiz questions, every correct answer verifiably correct with plausible distractors and real explanations; psychology lessons are specific (mỏ neo, BATNA, 3-second pause, conditional concession). Zero rent anchoring — grep finds 0 "trọ" in all three new files. XP math is internally consistent (10/20/30 per item, TOTAL_XP computed = 350). Unlock logic is consistent. Persistence uses `expo-file-system`, the same API App.tsx uses.

**Slop / defects found:**
1. **Generic footer (minor slop).** `RoadmapScreen.tsx` footCard: "Đàm phán là kỹ năng — luyện được như mọi kỹ năng khác" is motivational filler with zero information. Fix: replace with the next unlock preview (e.g. "Xong bài test cấp này để mở Cấp 2: Đọc vị đối phương") or delete the card.
2. **Selection layout shift.** `RoadmapItemDetail.tsx` styles `opt` has no `borderWidth`, while `optSelected`/`optRight`/`optWrong` add `borderWidth: 2` — tapping an option grows the row by 4px. Fix: add `borderWidth: 2, borderColor: 'transparent'` to base `opt`.
3. **Practice CTA is a dead end until wired.** `RoadmapItemDetail.tsx` "Bắt đầu thực hành 🎤" calls `onStartPractice`; the integration doc's example wiring just does `setScreen('setup')` — i.e. the button goes back to setup and does nothing. Fix at merge (App.tsx, per ROADMAP_INTEGRATION.md): wire it into the existing voice loop; do NOT demo the button unwired.
4. **Type-scale drift.** RoadmapScreen h1 is 26, App.tsx h1 is 28, detail title is 24. Fix: `RoadmapScreen.tsx` h1 26 → 28.
5. **Unverified.** No `tsc --noEmit` / Expo Go run. Fix: run both on a machine with deps before merge (builder-flagged).

---

## 2. Room map + home — PASS WITH FIXES — taste 7/10

Files graded: `src/lib/rooms.ts`, `src/lib/progress.ts`, `src/screens/HomeScreen.tsx`, `src/screens/RoomMapScreen.tsx`, `src/screens/index.ts`, `src/AppShell.tsx`, `INTEGRATION.md`. Zero Slice 1 files modified (verified: diff vs c0b0edf shows only the 7 new files). Branch clean @ 2f42aa6.

| Axis | Evidence (one line, observable in code) | Score /5 |
|---|---|---|
| Type | H1 28 on Home matches App.tsx, 26 on Map; chip/unlock text 11px multiplies; greeting hardcodes "Minh" | 3 |
| Layout | Stats row + cards are clean, but entering negotiate strands the user (no way back — see defect 1); connector alignment (marginLeft 34 vs 28px icon) unverified on render | 3 |
| Colour | Two new grays #c3d0dc (body text) and #3a4756 (difficulty off-dots); XP fill yellow #ffd43b vs Roadmap/XpBar blue #2f81f7 | 3 |
| Space | Padding 20/16, gaps 12/10/8, consistent; connector 18px fine | 4 |

**What is good:** broad framing held everywhere; 5 rooms with specific scenario sets; locked cards are visibly locked AND disabled (no dead taps); AppShell composition is clean; INTEGRATION.md honestly lists every gap.

**Slop / defects found (in fix order):**
1. **Navigation dead end — sharpest defect.** `AppShell.tsx`: entering `'negotiate'` renders `<App />` with no exit — App.tsx has no back button, so the user must kill/reopen the app. A judge exploring home → map → negotiate gets stranded. Fix (merge-time, Migga, 5 min): App.tsx takes an `onExit` prop + a "‹ Trang chủ" button; AppShell passes `() => setScreen('home')`. This is merge-blocking: do not ship the combined app without it.
2. **Fake progress — invented history.** `progress.ts` SEED: level 2, 120/200 XP, 3-day streak, 2 sessions/week, 0 rooms completed. Internally contradictory (3-day streak + 2 sessions, yet 0 rooms done) and false for a first-run user. Fix: seed at zero (level 1, 0 XP, 0 streak, 0 sessions); Home must show honest empty states.
3. **Hardcoded name.** `HomeScreen.tsx` greets "Minh" — App.tsx `tenantName` is user-editable. Fix: pass `name` as a prop from App state, or drop the name from the greeting.
4. **Static "Bài học hôm nay".** One fixed lesson ("Neo giá trước, nhượng bộ sau") under a "today" label — fake daily rotation. Fix: rotate by day-of-year from a 5–7 lesson list, or relabel the card "Bài học".
5. **Dead ternary (leftover scaffolding).** `RoomMapScreen.tsx` cardFoot: `{room.id === 'rent' ? 'Vào luyện →' : 'Vào luyện →'}` — identical branches. Fix: plain `'Vào luyện →'`.
6. **Unlock path unwired.** `completeRoom()` has no caller anywhere — rooms 2–5 can never unlock in the demo. Fix: call `completeRoom('rent')` when the win card shows (Milo's Slice 2 scoring hook).
7. **Token drift.** New grays #c3d0dc / #3a4756; XP fill yellow vs blue elsewhere; H1 26 vs 28. Fix: see §4 unification (one muted gray, one fill colour, H1 28).
8. **Progress staleness (minor).** `AppShell.tsx` reads `getProgress()` once per render; module-state mutations don't re-render. It refreshes on navigation, so acceptable for the demo; fix by lifting progress into AppShell state if time allows.
9. **Copy nit.** `HomeScreen.tsx` todayDesc lowercases the room tagline mid-sentence ("phòng tập đầu tiên — dễ nhất để bắt đầu."). Fix: use the tagline as-is or rephrase the sentence.

---

## 3. Gamification — PASS WITH FIXES — taste 8/10

Files graded: `src/lib/gamification.ts`, `src/components/gamification/{XpBar,StreakCounter,BadgeGrid,LevelRing,DailyGoalCard,index}.tsx`, `POLISH-NOTES.md`. Zero Slice 1 files modified (verified: diff vs c0b0edf shows only the 7 new files). Branch clean @ 6207680.

| Axis | Evidence (one line, observable in code) | Score /5 |
|---|---|---|
| Type | Consistent 12–17px scale; one slip: BadgeGrid badgeDesc 10px | 4 |
| Layout | Badge grid math fits 390px (4×23% + 3×8px gaps ≈ 99%); LevelRing 12-dot geometry checks arithmetically (radius 38, dots 33–43px from centre, ring 96px) — render unverified | 4 |
| Colour | Internals consistent (blue fills, yellow numerals); cross-branch fill mismatch is a §4 item, not this branch's | 4 |
| Space | Gaps 6/8/10/12, padding 10/12 — tight but deliberate | 5 |

**What is genuinely good (best internals of the three):** XP math verified coherent (`xpForLevel(L) = 50·L·(L−1)`, `levelFromXp` loop consistent); honest zero-states (StreakCounter's 0-day label encourages instead of inventing a streak — contrast with room-map's seeded 3 days); mount snippet starts all stats at 0; zero rent anchoring (0 "trọ" in all 7 files); zero new dependencies; `POLISH-NOTES.md` is the strongest artifact in the batch — it catches real Slice 1 rent anchoring (subtitle "Luyện đàm phán giá trọ…", twist title "(giám khảo ra)" leaking judge-facing wording into user UI, header 🏠 → 🤝, win-card overlap risk at `bottom: 110`, over-long MOCK banner) with exact edits.

**Slop / defects found:**
1. **Unmounted.** The components are a library with no mount — zero demo value until mounted per POLISH-NOTES (5-min job: DailyGoalCard + XpBar on home). Condition the demo on this landing.
2. **XP economy conflicts (cross-branch, see §4).** gamification awards 50/100/20/30 per event with levels at 100·L; roadmap awards 10/20/30 per item (350 total, no levels); room-map seeds level 2 at 120/200. Three economies. Fix: unify on `gamification.ts` (most complete).
3. **Price-scoped badge in a generic system.** `gamification.ts` badge `saving-10` ("đạt thỏa thuận tốt hơn giá mở đầu 10%") only applies to price rooms — meaningless for interview/investor rooms. Fix: scope its desc to price rooms ("trong các phòng mặc cả giá") or drop `bestSavingPct` from generic stats.
4. **Small caption.** `BadgeGrid.tsx` badgeDesc 10px. Fix: 11px.
5. **Unverified.** No `tsc --noEmit` / Expo Go run. Fix: run both on a machine with deps before merge.

---

## 4. Cross-branch MERGE BLOCK — do not ship the combination without these 4 fixes

These are not per-branch failures; each branch passes. The combination as-is ships three XP systems, two fill colours, three muted grays, and a dead-end navigation. All four fixes are small — do them at merge, then merge.

1. **One XP/level economy — unify on `gamification.ts`.** `src/lib/gamification.ts` `levelFromXp`/`XP_REWARD` is the single source of truth. `roadmap-screens/src/lib/roadmap.ts`: roadmap items award XP into the same `totalXp` (map exercise 10 / test 20 / practice 30 onto it; drop the separate 350-total framing or express it as `totalXp` progress). `room-map/src/lib/progress.ts`: delete the seed economy (level 2, 120/200) and derive level/XP from `levelFromXp(totalXp)`.
2. **One progress-fill colour: blue #2f81f7.** Change `room-map/src/screens/HomeScreen.tsx` `xpFill` and `RoomMapScreen.tsx` `xpFill` from #ffd43b to #2f81f7 (XpBar, RoadmapScreen progressFill, DailyGoalCard fillTodo are already blue). Keep #ffd43b for XP numerals/labels only. `BadgeGrid.tsx` miniFill may stay yellow as a micro-indicator, or go blue — pick one, no mix.
3. **One muted gray: #9fb0bf; H1 28 everywhere.** Delete #c9d4de (`roadmap-screens`, detail body text) and #c3d0dc / #3a4756 (`room-map`, body text / difficulty off-dots) — use #9fb0bf for secondary text and #243040 for off-dots. Set `RoadmapScreen.tsx` h1 and `RoomMapScreen.tsx` h1 from 26 → 28 to match App.tsx.
4. **Navigation exit + merge-time verification.** App.tsx: `onExit` prop + "‹ Trang chủ" button (room-map defect 1). Then run `npx tsc --noEmit` and an Expo Go smoke test on a machine with deps for all three branches together before merging — none of the three has been typechecked or rendered yet.

## Fix order (cheapest precise fixes first)

1. Merge-block fix 1 (XP unification, §4.1) — one file owns the economy, two files rewire to it.
2. Merge-block fix 4 (App.tsx back button) — 5 minutes, unblocks the demo flow.
3. Room-map defect 2 (seed progress to zero) — 5 numbers in `progress.ts`.
4. Roadmap defect 2 (transparent base border on quiz options) — 1 style line.
5. Merge-block fixes 2–3 (fill colour, grays, H1) — mechanical, ~8 one-line edits.
6. Gamification defect 3 (scope the saving badge) + defect 4 (badgeDesc 11px); room-map defects 3–6 (name prop, rotating lesson, dead ternary, wire `completeRoom('rent')`); roadmap defect 1 (footer copy) + defect 3 (wire practice CTA).
