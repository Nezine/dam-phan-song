# UX Review — Đàm Phán Sống: does the app make the user do stupid things?

**Lens:** one only — unnecessary steps, dead ends, confusing labels, redundant taps,
things the user must remember or re-enter, flows that punish a mistake.
**Method:** read the actual code. Branches reviewed (tips at time of review):
`muse/roadmap-screens` @ 9d50d80, `muse/room-map` @ 0436c8e,
`muse/gamification` @ 1eb5591, Slice 1 `slice-1-negotiation-core` (App.tsx).
**Not verified:** no Expo run, no device — render-dependent claims are not made here.
**Note:** the UNI-fixes subagent is editing these branches concurrently; line numbers
may shift. The integration team is merging into `try/roommap` — items already fixed
there are not re-checked here.

Ranked worst-first, by how stupid each one makes the user feel.

## 1. The whole navigation shell is unreachable — the app boots past Home, Map, Roadmap, gamification
- **Where:** `index.ts:3` (room-map clone) — `import App from './App';`
- **What the user is forced to do:** nothing — that is the problem. The user opens
  the app and lands directly on the 5-field setup form. Home, the room map, the
  learning roadmap and all gamification components exist only on branches; none
  of them renders in the running app.
- **Fix:** flip the one line per `INTEGRATION.md` (`import App from './src/AppShell'`)
  and verify in Expo Go that Home actually appears on launch.

## 2. No way out of a negotiation — the user must kill the app to leave mid-round
- **Where:** `App.tsx` negotiation view (header ~lines 470–485 has only the mute
  button); `backToSetup` exists but is only called from the result screen and
  the win card. `src/AppShell.tsx:20–23` admits it in a comment.
- **What the user is forced to do:** if they tap the wrong room, get a bad
  transcription, or just want out, the only exit is force-closing the app.
- **Fix:** add a `‹ Thoát` button in the negotiation header calling `backToSetup`
  (confirm first if any turns exist, so a stray tap does not wipe the round).

## 3. The setup form asks the user to type the LANDLORD's secret floor price
- **Where:** `App.tsx:354` (label "Giá sàn của chủ trọ (bí mật — AI không chốt
  thấp hơn"), `:92` (default `'3000000'`), `:183`
  (`floorPrice: Number(preset?.floor ?? floorPrice) || 3000000`).
- **What the user is forced to do:** the user plays the tenant, yet must invent
  the opponent's secret. A first-time user will type their own target price
  there — and then negotiate against their own number. If floor > listed
  (e.g. floor 4.000.000 > listed 3.500.000) the scenario is silently broken:
  the landlord can never agree below a floor above the asking price.
  No validation anywhere.
- **Fix:** delete the field from the form. The floor belongs to the
  scenario/character (the presets already carry it); for the custom path use
  `floor = listed − 500k` or let the user pick a difficulty instead.

## 4. Two start buttons with different silent semantics — the form is discarded without warning
- **Where:** `App.tsx:363` ("Bắt đầu đàm phán →" uses the form) vs `:365+`
  (3 twist buttons) + `startNegotiation` `:177–183` (a preset overrides
  city/room/listed/floor/opening entirely).
- **What the user is forced to do:** edit 5 fields carefully, then tap a twist —
  all 5 edits vanish silently and a different scenario starts. Nothing says
  the two paths differ.
- **Fix:** one start path. Tapping a twist fills the form visibly and the user
  taps one Start — or the twists start immediately and the form is removed.

## 5. Voice has no preview, no cancel, no undo — a misheard word goes straight to the landlord
- **Where:** `App.tsx:542–545` (one button toggles record → stop-and-send);
  `onRecordPress` `:281+` (on stop, transcribe then `sendToLandlord`
  immediately); no transcript preview, no discard.
- **What the user is forced to do:** misspeak once and the wrong text is already
  in the chat, already answered by the AI. The only repair is sending another
  message correcting it — which the AI may read as a new offer. There is also
  no way to abandon a recording in progress: stopping IS sending.
- **Fix:** after stop, put the transcript into the text box for edit/confirm
  before sending; add "Hủy" while recording.

## 6. Home / Map progress is fake and frozen — the user's real effort never shows up
- **Where:** `room-map/src/lib/progress.ts:19–24` (seed: level 2, 120/200 XP,
  3-day streak, 2 sessions, 0 rooms done); `completeRoom` has **zero callers**
  anywhere in the code; nothing awards XP.
- **What the user is forced to do:** finish rounds, save real money, and watch
  Home display the exact same numbers forever. Rooms 2–5 can never unlock:
  Room 2 needs rent completed (never recorded), Rooms 4–5 need levels 5/8
  (XP never increases).
- **Fix:** one progress store (see #7); wire `completeRoom('rent')` + an XP award
  on the result screen; delete the seed and start at 0.

## 7. There are THREE progress stores (plus gamification math) — and two files both named `src/lib/progress.ts`
- **Where:** Slice 1 `src/lib/progress.ts` (file-persisted sessions/totalSaved/
  bestScore, `loadProgress`/`recordSession`) vs room-map `src/lib/progress.ts`
  (in-memory seed, `getProgress`/`completeRoom`) vs roadmap `src/lib/roadmap.ts`
  (its own file-persisted XP) vs `gamification.ts` (pure math, nothing calls it).
- **What the user is forced to do:** live with three different XP/level numbers
  that never agree — setup shows real sessions, Home shows frozen seed numbers,
  Roadmap shows its own 0/350 XP. Also a merge hazard: the two
  `src/lib/progress.ts` files share a path with incompatible APIs, so merging
  `muse/room-map` will conflict, and whichever side wins breaks the other
  system's imports (`App.tsx` needs `recordSession`; `RoomMapScreen` needs
  `getProgress`).
- **Fix:** one store, one file. Pick the Slice 1 file-persisted store as the
  base, add level/XP/rooms to it, delete the room-map copy.

## 8. Home's suggestion is discarded — the user picks twice
- **Where:** `HomeScreen.tsx:25` (`suggested = currentRoom.scenarios[0]`) and
  `:39` ("Luyện ngay →" passes only the room id); `AppShell.tsx:44`.
- **What the user is forced to do:** read a suggested scenario on Home, tap
  "Luyện ngay", then land on the setup form and choose all over again from
  scratch. The suggestion is thrown away.
- **Fix:** pass the suggested scenario through and preselect it on setup —
  or start it directly and skip the form.

## 9. "Bắt đầu thực hành" drops the user at a blank form
- **Where:** `RoadmapItemDetail.tsx:167` ("Bắt đầu thực hành 🎤") +
  `ROADMAP_INTEGRATION.md:44–47` (the example callback is literally
  `setScreen('setup')`).
- **What the user is forced to do:** pick a practice scenario, tap start, and
  land on the generic setup form where they must re-enter name, city, room,
  and both prices. The practice context is discarded.
- **Fix:** wire the callback to `startNegotiation` with a preset built from
  the practice item — never route a started practice back to a blank form.

## 10. Prices are raw digit strings with no validation
- **Where:** `App.tsx:91–92` (`'3500000'` / `'3000000'`, `keyboardType="number-pad"`,
  no separators, no formatted preview); `:182–183`
  (`Number(...) || 3500000` silently swallows garbage).
- **What the user is forced to do:** type 7 digits on a number pad and pray
  they did not drop a zero (350.000 vs 3.500.000 = 10×). Clearing a field
  silently falls back to the default; floor above listed is accepted.
- **Fix:** format live (`3.500.000đ`) with a formatted preview under the field,
  and validate floor ≤ listed with an inline error.

## 11. The name is pre-filled "Minh" in two places that disagree
- **Where:** `App.tsx:88` (default `'Minh'`) and `HomeScreen.tsx:29`
  (hardcoded greeting `Minh`).
- **What the user is forced to do:** accept being called a stranger's name, or
  edit the name in setup and watch Home still greet the old one.
- **Fix:** one name store; empty default with placeholder "Tên bạn (không bắt buộc)"
  — the code already falls back to `'bạn'` when the field is empty.

## 12. Rooms 2–5 promise "Vào luyện →" on a button that does nothing
- **Where:** `RoomMapScreen.tsx:85` (dead ternary — both branches render the
  identical text "Vào luyện →"); `AppShell.tsx:30–31,44` (non-rent
  `onEnterRoom` is a no-op, user stays on the map with no feedback).
- **What the user is forced to do:** tap a button that promises entry and get
  silence. Currently unreachable (everything is locked), but the label is a
  lie waiting for the unlock wire.
- **Fix:** hide the CTA until a room has a real flow, or label it "Sắp có".

## 13. Exercises and practice complete on a single tap — XP for tapping, not learning
- **Where:** `RoadmapItemDetail.tsx:160` ("Đánh dấu đã làm +XP →") and `:170`
  ("Đã luyện xong — đánh dấu hoàn thành").
- **What the user is forced to do:** nothing — and that is the flaw. A user can
  tap through all 20 items, collect 350 XP, and learn nothing. The app
  rewards the tap, not the work.
- **Fix:** require the quiz for exercises too, or drop XP for honor-system taps.

## 14. Mic permission failure is silent on setup
- **Where:** `App.tsx:125` sets the error at startup, but the setup screen
  (`!started` branch) renders no error; `startNegotiation` → `resetSession`
  clears it.
- **What the user is forced to do:** discover voice is broken only after
  tapping the mic mid-round.
- **Fix:** show the permission error on the setup screen with a "Bật quyền" hint
  before Start.

## 15. The win card covers the chat, and the destructive button sits under the main action
- **Where:** `App.tsx:612` (`winCard`, `position: 'absolute', bottom: 110`,
  overlays the conversation); `:514` ("Đàm phán tình huống khác →" calls
  `backToSetup`, wiping the finished round with no confirm, directly under
  "Xem chấm điểm").
- **What the user is forced to do:** lose the conversation they may want to
  re-read behind an overlay, and risk one stray tap erasing the whole round.
- **Fix:** make the win state part of the flow, not an overlay; confirm before
  discarding a finished round.

## 16. Internal / demo language leaks into user-facing UI
- **Where:** `App.tsx:365` ("🎯 Luyện tình huống khó (giám khảo ra)"),
  mock banner ("MOCK MODE — landlord giả, chỉ test UI"), setup warning
  ("Chưa có EXPO_PUBLIC_GEMINI_API_KEY — sẽ chạy MOCK MODE").
- **What the user is forced to do:** read the team's internal labels instead of
  product copy.
- **Fix:** rename the section "Phòng luyện hôm nay"; hide key/config errors
  behind a generic "AI chưa sẵn sàng" line.

## What is NOT broken (checked, no issue under this lens)
- Quiz flow (`RoadmapItemDetail.tsx`): answers changeable before submit, submit
  blocked until all answered, retry resets cleanly, best score kept. Good.
- Locked rooms/levels (`RoomMapScreen.tsx`, `RoadmapScreen.tsx`): disabled
  pressables with a visible unlock condition — no dead tap. Good.
- Error retry (`App.tsx` `retryLast`): re-sends the failed text, clears the
  error. Good.
- `DailyGoalCard`, `StreakCounter`, `BadgeGrid`, `XpBar`: copy is clear,
  zero-states are honest, locked badges show progress. Good.

## Fix order for the 15:00 freeze (highest leverage first)
1. #1 wire `index.ts` → AppShell (without it, nothing else in this review matters).
2. #3 delete the floor-price field + #4 one start path (setup is the first screen
   the judges see).
3. #2 add an exit from negotiation + #5 transcript confirm before send.
4. #6/#7 one progress store, wire `completeRoom` + XP award (otherwise the
   Home/Map numbers stay fake during the demo).
5. #9 wire the practice callback; #8 carry the Home suggestion through.
6. #10–#16 as time allows — all one-liners except #15.
