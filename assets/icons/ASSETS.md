# Đàm Phán Sống — Icon assets (retention set)

Source checked: `Nezine/dam-phan-song` master **`5a4e63b`** (fresh clone 2026-11-14 ~15:37).
Scope of the emoji audit: `App.tsx` (38 emoji occurrences) + `src/` (47 occurrences).
App theme is dark (`#101418` bg, `#fff` text) — all PNGs are rendered **white on
transparent** so `tintColor` recolors them at runtime.

## Icon infra verdict (read from package.json, master 5a4e63b)

- **No `react-native-svg`, no `expo-linear-gradient`, no `@expo/vector-icons`.**
  Deps: expo ~58.0.25, expo-audio, expo-file-system, expo-speech, expo-status-bar,
  react 19.3.0, react-native 0.88.1 only.
- **Therefore this set ships as PNG (ready to use, zero new deps) + SVG sources
  (for editing / future use).** No new dependency is introduced by these assets.
- Future option (NOT required now, Migga's call): `npx expo install react-native-svg`
  then render the files in `icons/svg/` directly with `SvgXml` — 1 dep, Expo-blessed.

## How Migga wires them in (zero deps)

1. Copy `icons/png/` into the repo as `assets/icons/png/` (keep `icons/svg/` alongside
   as `assets/icons/svg/` for later edits — SVG sources are not loaded at runtime).
2. Replace each emoji `<Text>` with an `<Image>` (Metro picks `@2x`/`@3x` automatically):

```tsx
import { Image } from 'react-native';
<Image source={require('../assets/icons/png/mic.png')} style={{ width: 24, height: 24 }} tintColor="#fff" />
```

3. Color per usage via `tintColor` (palette taken from `App.tsx` styles):

| Usage | tintColor |
|---|---|
| Default icon on dark bg | `#fff` |
| Primary action / active / accent | `#2f81f7` (locked progress blue) |
| Muted / inactive / secondary | `#9fb0bf` (locked muted gray) |
| Streak flame, XP star | `#ffd43b` |
| Success / saved money / pass | `#8ce99a` |
| Danger / alert / fail / annoyed mood | `#ff8787` |

4. Display size: **24×24 pt everywhere** unless noted. Room icons on the RoomMap
   cards: **32×32 pt**; trophy on milestone: **28×28 pt**; streak flame inline with
   the streak number: **20×20 pt**. (Note: at 32 pt on a 2x screen the 48 px file
   upscales slightly — acceptable for the demo; exact-size renders can be
   regenerated from the SVG sources with resvg.)

## Style contract (all 33 icons)

24×24 viewBox, 2 px stroke, round caps/joins, flat line icons, `currentColor`
stroke in the SVG sources. No gradients, no 3D blobs, no decorative fills —
except: `stop.svg` (solid square = the universal stop glyph) and the dot
centres of `target.svg` / face eyes. Every icon means one thing; nothing is
decoration for its own sake.

## A. App.tsx replacements (master 5a4e63b)

| File | Replaces | App.tsx lines | Usage (component / prop) | Size | tintColor |
|---|---|---|---|---|---|
| `mic.png` | 🎤 | 700 (`recText`/`micText` — "Bấm để nói") | Mic button label icon; `recState.isRecording ? stop : mic` | 24 | `#fff`, recording state `#ff8787` |
| `stop.png` | ⏹ | 700 ("Bấm để gửi") | Same mic button, recording state | 24 | `#ff8787` |
| `volume-on.png` | 🔊 | 591 (mute toggle) | Sound toggle, unmuted state | 24 | `#fff` |
| `volume-off.png` | 🔇 | 591 (mute toggle) | Sound toggle, muted state | 24 | `#9fb0bf` |
| `refresh.png` | 🔁 | 560 ("Đàm phán lại"), 635 ("Thử lại") | Retry / replay buttons | 24 | `#fff` |
| `home.png` | 🏠 | 463 (room chip), 563 ("Về màn hình chính") | Room chip + home button | 24 | `#fff` |
| `chart-bar.png` | 📊 | 512 ("Kết quả đàm phán"), 665 ("Xem chấm điểm") | Results / score screens | 24 | `#2f81f7` |
| `chart-up.png` | 📈 | 466 ("Tiến bộ: … phiên") | Progress line | 24 | `#8ce99a` |
| `money.png` | 💰 | 520, 646 ("Tiết kiệm …đ/tháng") | Saved-money lines | 24 | `#8ce99a` |
| `target.png` | 🎯 | 496 (twist title), 584 (scenario header) | Scenario / objective headers | 24 | `#2f81f7` |
| `check.png` | ✅ | 527 (rule passed), 643 ("CHỐT ĐƯỢC RỒI!"), 648 (win line) | Pass / win states | 24 | `#8ce99a` |
| `x.png` | ❌ | 527 (rule failed) | Fail state (paired with `check.png`) | 24 | `#ff8787` |
| `bulb.png` | 👉 | 530 (`ruleTip`) | Tip line — bulb means "tip", a pointing hand does not | 24 | `#ffd43b` |
| `alert.png` | ⚠️ | 573 (MOCK MODE banner) | Warning banner | 24 | `#ff8787` |
| `deal.png` | 🤝 | 461 (header "Đàm Phán Sống"), 650 (win line) | Header + deal-closed line. Drawn as a signed document + check: a literal handshake does not read at 24 px stroke (first attempt verified unreadable, discarded) | 24 | `#fff`, win line `#8ce99a` |
| `face-smile.png` | 😊 | 42 (customer mood `friendly`) | Customer mood in mock data | 24 | `#8ce99a` |
| `face-neutral.png` | 😐 | 43 (mood `neutral`) | Customer mood in mock data | 24 | `#9fb0bf` |
| `face-annoyed.png` | 😠 | 44 (mood `annoyed`) | Customer mood in mock data | 24 | `#ff8787` |
| `arrow-right.png` | → | 494, 560, 611, 668 + 3 more (button suffixes) | Optional: replace the text arrow on nav buttons. Plain text `→` is also acceptable — this file exists for visual consistency only | 24 | inherit button text color |

## B. Rooms + retention (new rooms from the content pack)

| File | Meaning | Usage | Size | tintColor |
|---|---|---|---|---|
| `room-sales.png` | Storefront (shop awning + door) | Room 1 — thuyết phục khách mua hàng (replaces the old rent Room 1) | 32 on map, 24 in lists | `#2f81f7` |
| `room-income.png` | Briefcase | Room 2 — thuyết phục / đàm phán thu nhập | 32 / 24 | `#2f81f7` |
| `room-teaching.png` | Open book | Room 3 — giảng dạy | 32 / 24 | `#2f81f7` |
| `room-speaking.png` | Megaphone | Room 4 — diễn giả / nói trước đám đông | 32 / 24 | `#2f81f7` |
| `room-wealth.png` | Stacked coins | Room 5 — làm giàu + cải thiện bản thân | 32 / 24 | `#ffd43b` |
| `streak-flame.png` | Flame | Streak counter (HomeScreen, gamification) | 20 inline, 24 standalone | `#ffd43b` |
| `xp-star.png` | Star | XP / level (gamification) | 24 | `#ffd43b` |
| `trophy.png` | Trophy | Milestone / achievement unlocked | 28 | `#ffd43b` |

## C. Badges + screens (from `src/`)

| File | Replaces | Where | Usage | Size | tintColor |
|---|---|---|---|---|---|
| `mic.png` | 🎤 | `src/lib/gamification.ts:59` (badge icon), `src/lib/rooms.ts:60` | Badge / room icon field | 24 | `#fff` |
| `deal.png` | 🤝 | `src/lib/gamification.ts:67` (badge icon) | Badge icon field | 24 | `#fff` |
| `streak-flame.png` | 🔥 | `gamification.ts:75`, `HomeScreen.tsx:63` (streak stat) | Badge + streak stat | 20–24 | `#ffd43b` |
| `xp-star.png` | 🌟 | `gamification.ts:83` (badge icon) | Badge icon field | 24 | `#ffd43b` |
| `money.png` | 💰 | `gamification.ts:91` (badge icon) | Badge icon field | 24 | `#8ce99a` |
| `target.png` | 🎯 | `gamification.ts:99`, `HomeScreen.tsx:50` ("LUYỆN HÔM NAY") | Badge + section label | 24 | `#2f81f7` |
| `bolt.png` | ⚡ | `gamification.ts:107` (badge icon) | Badge icon field | 24 | `#ffd43b` |
| `crown.png` | 👑 | `gamification.ts:115` (badge icon) | Badge icon field | 24 | `#ffd43b` |
| `room-income.png` | 💼 | `src/lib/rooms.ts:48` (room icon) | Room icon field | 24–32 | `#2f81f7` |
| `chart-up.png` | 📈 | `src/lib/rooms.ts:72` (room icon) | Room icon field | 24–32 | `#8ce99a` |
| `lesson-cap.png` | 🧠 | `HomeScreen.tsx:86` ("BÀI HỌC HÔM NAY") | Lesson section label. Drawn as a graduation cap: a brain does not draw clean at 24 px; the cap means "lesson" | 24 | `#2f81f7` |
| `map.png` | 🗺 | `HomeScreen.tsx:93` ("Xem bản đồ phòng tập"), `RoomMapScreen.tsx:132` (title) | Map buttons / title | 24 | `#fff` |
| `lock.png` | 🔒 | `RoomMapScreen.tsx:179, 200` (locked room) | Locked-room state | 24 | `#9fb0bf` |
| `clock.png` | 🕒 | `RoomMapScreen.tsx:183, 202, 220` ("Sắp có") | Coming-soon state | 24 | `#9fb0bf` |

## Deliberately no file (use a View/Text instead)

- **1️⃣2️⃣3️⃣** (`App.tsx:61, 71, 81`) — numbered scenario badges: a styled `<View>`
  circle (`backgroundColor #2f81f7`, 24×24, `borderRadius 12`) with a `<Text>`
  number. A number is text, not an icon.
- **🔴** (`App.tsx:674`, "Đang ghi âm") — recording dot: a styled `<View>` circle,
  10×10, `backgroundColor #e03131`. No image needed.
- **👋** (`HomeScreen.tsx:45`, greeting) — drop it. The greeting text needs no icon.
- **→** — see `arrow-right.png` above; text arrow is fine if time is short.

## Files delivered

- `icons/svg/` — 33 SVG sources (24×24, `currentColor` stroke, 2 px).
- `icons/png/` — 99 PNG renders: each icon at 24 px (`name.png`), 48 px
  (`name@2x.png`), 72 px (`name@3x.png`), white on transparent, RGBA.
- Rendered with `@resvg/resvg-js` (installed in `/tmp/svg-render`, not in the repo).
  All 33 rendered with 0 failures; 11 icons visually verified on a `#101418`
  background at 4x (deal, faces, bulb, cap, flame, trophy, storefront, megaphone,
  coin stack, handshake attempt rejected + replaced).
- The repo was **not** modified. Migga copies `icons/png/` into the repo and
  swaps the emoji `<Text>` nodes per the tables above.
