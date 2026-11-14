# UX Audit — Đàm Phán Sống, Slice 1 (Room 1: thuê trọ)
Audit: 2026-11-14 ~14:20 ICT, repo Nezine/dam-phan-song, PR #1 head `4c514d1`, branch `slice-1-negotiation-core`.
Scope: `App.tsx` (333 lines, single screen), `src/lib/types.ts`, `gemini.ts`, `groq.ts`, `mock.ts`.
Every finding cites file:line from the audited head. No claim about behaviour that isn't in this code.

## What exists today (verified in code)
- Setup screen (`App.tsx:193-233`): 5 inputs, start button, 3 twist presets, MOCK MODE warning (`:231`).
- Negotiation screen (`App.tsx:235-291`): chat bubbles, landlord price line, mic toggle button, win card on agreement (`:252-270`).
- Landlord persona + floor-price rules exist in `src/lib/gemini.ts:15-49` and `src/lib/groq.ts:5-16`; mock landlord in `src/lib/mock.ts:22-113`.
- What does NOT exist anywhere in the code: scoring screen, rubric, weak-sentence feedback, roadmap, saved progress, psychology lessons, gamification, text-input fallback, retry, mute, recording timer, speaker labels, back navigation.

## P0 — blocks the 16:00 demo (fix today)
| # | Finding | Evidence |
|---|---------|----------|
| P0-1 | Mic button label LIES about the interaction: idle says "Giữ lịch sự: nói xong bấm gửi" ("giữ" = hold, but the button is tap-to-start/tap-to-stop), recording says "Nhả ra để gửi" ("release to send", but nothing is held). On stage the judge will hold the button and nothing will happen — or release mid-sentence. | `App.tsx:276` |
| P0-2 | NO text-input fallback. Voice is the ONLY way to talk to the landlord. Hall noise / mic permission denied / transcribe 429 → the demo is dead with no recovery path. | Whole `App.tsx` — no `TextInput` on the chat screen (`:235-291`); only input is the setup form (`:197-214`) |
| P0-3 | NO scoring at all. The brief requires fixed-rubric scoring naming weak sentences + why. Today the flow ends at a price card. Without a result screen, differentiator #3 (chấm điểm) cannot be demoed. Fix: rule-based rubric computed from the real transcript (transparent, no AI claim), rendered as a result screen. | Absent from `App.tsx`; `src/lib/types.ts` has no score type |
| P0-4 | Win-card "Đàm phán tình huống khác →" is a dead end: it clears `turns` to `[]` and `agreedPrice` to null but keeps the same scenario, does NOT re-add the landlord opening line and does NOT re-speak it (`App.tsx:265-267`). The user lands in an empty chat with no guidance and no way back to setup (no back button exists anywhere). | `App.tsx:265-267` |
| P0-5 | Raw API errors shown to the user: `setError(String(e))` renders strings like `Gemini landlord 429: {...}` in 12px red text at the bottom of the chat, with NO retry button. On weak network / 4G this is exactly what the judges will see. | `App.tsx:147`, `App.tsx:177`, rendered at `:249` |
| P0-6 | Empty/silent recording is sent to the API: `onRecordPress` transcribes and calls `sendToLandlord(transcript)` with no empty check (`App.tsx:170-182`). Silence → a wasted Gemini call → a confusing landlord reply to nothing. | `App.tsx:170-182` |
| P0-7 | `saved = 0` copy is WRONG for non-deposit twists: "Chốt ở giá rao — thành công nhờ điều khoản thanh toán" claims a payment-terms win even when the user just agreed at list price with no terms discussed. | `App.tsx:258` |
| P0-8 | Mic stays live after the deal closes: the mic button is only disabled while `busy`; after `agreedPrice` is set the user can keep recording into a finished negotiation. | `App.tsx:272-279` (`disabled={busy}` only) |

## P1 — visible polish (fix today if time, all safe)
| # | Finding | Evidence |
|---|---------|----------|
| P1-1 | Landlord `emotion` (friendly/neutral/annoyed) is returned by every backend (`src/lib/types.ts:24`, `gemini.ts` schema, `mock.ts`) but the UI DROPS it — turns are stored without it, so the "difficult + consistent landlord" has no visible mood cue. | `App.tsx:131-133`, `:153-159` (turns appended without emotion); `src/lib/types.ts:9-13` (`Turn` has no emotion field) |
| P1-2 | No speaker labels: bubbles rely on colour alone. On a projector / phone held up on stage, judges can't tell who said what at a glance. | `App.tsx:240-246` |
| P1-3 | Busy state is a bare spinner (`App.tsx:248`) — no text. User can't tell "đang nghe lại" (transcribing) from "chủ trọ đang trả lời" (waiting on API). | `App.tsx:248` |
| P1-4 | No recording indicator: while recording, only the button turns red. No timer, no "Đang ghi âm…" text. A 20s ramble has no visible length. | `App.tsx:272-279` |
| P1-5 | Setup inputs have placeholders only, no labels; the floor-price field is mislabelled "Giá bạn muốn chốt (đ/tháng)" — but `floorPrice` is the LANDLORD's secret floor (`gemini.ts:21`), not the user's target. A judge filling the form will misunderstand the field. | `App.tsx:197-214` |
| P1-6 | No mute / replay for TTS. `Speech.speak` fires on every landlord turn (`App.tsx:115`, `:132`, `:158`); on a noisy stage the presenter cannot silence or replay it. | `App.tsx:115`, `:132`, `:158` |
| P1-7 | Header shows only room + listed price (`App.tsx:226-230`). It doesn't show the twist name (which hard scenario is running) or the landlord's current price — the two numbers the pitch cares about. | `App.tsx:226-230` |
| P1-8 | NO roadmap / saved progress / lessons / gamification anywhere — all four are in the brief ("lộ trình + tiến bộ lưu được", "bài học tâm lý", "gamification"). Fix: result screen with rule-based lessons + a local progress strip persisted with `expo-file-system` (already a dependency). | Absent from `App.tsx` |

## P2 — nice-to-have (only if P0+P1 are green)
- P2-1 Hardcoded header padding (`paddingTop: 48`, `App.tsx:305`) and banner offset (`marginTop: 32`, `:322`) instead of SafeArea — fragile on notched phones.
- P2-2 No validation: listed price < floor price produces a nonsense scenario (`App.tsx:99-110`).
- P2-3 No max recording duration; a forgotten recording runs until the user remembers (`App.tsx:163-184`).
- P2-4 Chat has no timestamps and no auto-scroll guard for the win card overlaying the last messages (`App.tsx:306-319`, `bottom: 110`).
- P2-5 Type hierarchy is flat: chat header 15px (`App.tsx:302`) vs body default 14 — weak scan hierarchy for the demo screen.

## Fixes implemented in this clone (see ux-fixes.diff)
- P0-1: mic labels → "🎤 Bấm để nói" / "⏹ Bấm để gửi".
- P0-2: text-input fallback in the footer (type + send, same `sendToLandlord` path).
- P0-3: new `src/lib/score.ts` — transparent 6-rule rubric computed from the real transcript (each rule cites the exact tenant sentence); new result screen rendering score, per-rule checklist, weak sentences + reasons.
- P0-4: win-card button now returns to setup (label "Đàm phán tình huống khác →" kept, action fixed).
- P0-5: friendly error mapping (`Gemini/Groq …` → Vietnamese copy) + "Thử lại" retry that re-calls the landlord without duplicating the tenant turn.
- P0-6: empty-transcript guard ("Chưa nghe rõ, bấm mic nói lại nhé", no API call).
- P0-7: `saved = 0` copy split by twist (deposit → payment-terms copy; otherwise → "chốt ở giá rao" nudge).
- P0-8: mic disabled once `agreedPrice != null`.
- P1-1: `Turn.emotion` added (`types.ts`); landlord bubbles show 😊/😐/😠 mood tag.
- P1-2: speaker labels "Bạn" / "Chủ trọ" on bubbles.
- P1-3: busy text ("Đang nghe lại…" / "Chủ trọ đang trả lời…").
- P1-4: recording timer ("Đang ghi âm 0:07").
- P1-5: labelled setup inputs; floor-price field relabelled "Giá sàn của chủ trọ (bí mật — AI không chốt thấp hơn)".
- P1-6: mute toggle in header (🔊/🔇).
- P1-7: header shows twist name + landlord's current price.
- P1-8: result screen has lessons (mapped from failed rules) + roadmap ("Luyện tiếp"); progress persisted locally via `src/lib/progress.ts` (`expo-file-system` JSON) and shown as a strip on the setup screen (sessions / total saved / best score).
- NOT done (left for builder/Milo): SafeArea (P2-1), input validation (P2-2), max recording duration (P2-3). No multi-room UI built (pitch-only, per brief).

## Honesty notes
- The rubric in `src/lib/score.ts` is RULE-BASED (keyword + number detection on the transcript), not an AI judge. The result screen labels it "Thang chấm cố định — tính từ phiên của bạn", never claims AI scoring. Milo's rubric should replace/augment these rules when ready.
- Progress is stored on-device only (no account, no cloud). "Lưu được" = survives app restart on the same phone.
- `tsc --noEmit` exit code after fixes: recorded below (see diff header / implementation report).

## Implementation record (2026-11-14 ~14:20 ICT, branch mie/ux-p0-fixes)
- All 8 P0 + safe P1s (P1-1..P1-8) implemented in this clone and verified.
- `npx tsc --noEmit` exit 0. Rule-based scorer smoke-tested at runtime (node): sample negotiation scores 6/6 "Xuất sắc", weak sentence "ừ, để em xem đã" correctly flagged.
- Note: the SDK 58 expo-file-system has no `documentDirectory` (removed); progress uses `Paths.document` + `new File(...)` for the URI, legacy read/write helpers for the JSON.
