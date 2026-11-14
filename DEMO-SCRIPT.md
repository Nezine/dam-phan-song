# Đàm Phán Sống — Live Demo Script (3-minute pitch)

**Read this first — timing conflict.** The judges' slide requires a 3-minute pitch (6 beats × 30s). The team's `docs/pitch-v2.md` is a 5-minute script. THIS script follows the 3-minute frame. If the judges give 5 minutes on the day, run the 5-minute version in `docs/pitch-v2.md` instead — do not stretch this one.

**Roles.** 1 speaker (talks) + 1 phone holder (taps). Phone: OPPO A60, Expo Go 58.0.5. Golden path: preset 1 ("1️⃣ Phòng 1 · Giá sàn cứng", listed 3.5tr, floor 3.2tr). Never use preset 3 for numbers on stage — its upfront-cash figures disagree between the opening line and the win card.

## 1. Pre-demo checklist (do before 16:00)

- [ ] Phone charged, charger plugged in at the table.
- [ ] Ring mode ON, volume up — the landlord speaks out loud; silent mode mutes it.
- [ ] Screen sleep OFF (never lock mid-demo).
- [ ] Expo Go open, app loaded from Metro (port 8081). Keys in `.env.local` (Gemini + Groq).
- [ ] No red "⚠️ MOCK MODE" banner on the negotiation screen. If the banner is there, the Gemini key is missing — stop, fix `.env.local`, reload.
- [ ] Mic permission granted (Expo Go → allow microphone). Tap the mic once and speak a test word.
- [ ] Kill the app fully (swipe away) and reopen it once — the demo starts from a cold open.

## 2. Beat map — what is on screen during each 30s beat

| Beat | Time | Say (speaker) | On screen / do (phone holder) |
|---|---|---|---|
| PROBLEM | 0:00–0:30 | "Every year, a Hanoi student loses about 2.4 million VND — just by not knowing how to bargain. Rent is 2.4 million a month on a 5–7 million budget. Save 200k a month and that's 2.4 million a year. But most students go silent in front of the landlord. We built Đàm Phán Sống — practice speaking before you lose real money." | Setup screen, phone in hand. Do nothing yet. |
| SOLUTION | 0:30–1:00 | "This is Đàm Phán Sống — Duolingo for negotiation. Today: Room 1, rent. Judges — pick one of these 3 landlords." | Show the 3 twist buttons. If no pick in 10s, tap preset 1. Landlord speaks the opening. |
| WHY NOW | 1:00–1:30 | "Voice AI is finally good and cheap enough to play a stubborn landlord in real time." | Turn 1 (offer 3.1tr). |
| MARKET | 1:30–2:00 | "Everyone negotiates — rent, salary, deals. First 100 practice users in week one." + hold line | Turn 2 (beg 3.0tr — landlord HOLDS). |
| PROOF | 2:00–2:30 | "Watch the score — fixed rules, not AI praise." | Turn 3 (accept 3.2tr) → win card → tap "📊 Xem chấm điểm". |
| ASK | 2:30–3:00 | "Try it now. Be one of the first 100. Tell us which room to build next." | Score screen stays up. |

## 3. The live run, tap by tap

**Setup (before the clock or during PROBLEM).** Fields are pre-filled — do NOT type anything. Tap a twist preset to start; the preset sets city, room, listed and floor prices. Note: the "Giá sàn" field still shows the default 3.0tr — the preset overrides it to 3.2tr. Do not point at that field.

**Turn 1 — WHY NOW.** Tap "🎤 Bấm để nói". Say: "Dạ anh, em là sinh viên, thuê ở lâu dài ít nhất một năm. Anh bớt cho em xuống 3 triệu 1 được không anh?" Tap "⏹ Bấm để gửi". Wait for "Đối phương đang trả lời…" (~5–10s). Landlord counters near 3.2tr.

**Turn 2 — MARKET (the differentiation moment).** Tap mic. Say: "Thôi mà anh, giảm thêm cho em 200 nữa đi, tròn 3 triệu cho đẹp, em sinh viên nghèo lắm." Tap send. The landlord HOLDS at 3.2tr — its secret floor. Speaker, to the judges: "ChatGPT would have caved. This one holds its floor."

**Turn 3 — PROOF.** Tap mic. Say: "Dạ được anh, em chốt 3 triệu 2, cọc em giữ nguyên 2 tháng, đóng theo tháng nhé anh." Tap send. Win card appears: "✅ CHỐT ĐƯỢC RỒI! 3.200.000đ/tháng — Tiết kiệm 300.000đ/tháng = 3.600.000đ/năm". Tap "📊 Xem chấm điểm". Score screen: read the % and grade out loud, point at the 6 rules (target / reason / terms / persist / polite / close) and the weakest sentence. Followed exactly, the lines above pass all 6 rules.

**If the landlord does not agree:** repeat the accept line once ("Dạ được anh, em chốt 3 triệu 2, đóng theo tháng."). If it still does not agree, type in "Hoặc gõ tin nhắn…" — "Em chốt 3 triệu 2, đóng theo tháng" — and tap "Gửi". Never tap "📊 Xem chấm điểm" before the win card appears — there is no way back to the chat from the score screen.

**If an error box appears:** tap "🔁 Thử lại" once. If it appears again, switch to 4G (see §5) and tap "🔁 Thử lại" again.

## 4. Weak-network + real 4G test (rehearsal, 15:00)

1. On venue WiFi: run the full script once, top to bottom. Note any turn slower than ~10s.
2. Turn WiFi OFF on the phone (leave mobile data on). Kill the app, reopen, run the script again on real 4G.
3. Mid-round switch: during turn 2, turn WiFi off and 4G on — the next tap of "🔁 Thử lại" must recover the round. If a turn fails twice in a row on both networks, go to §6.

## 5. Kill-and-reopen test (rehearsal, 15:00)

1. Mid-negotiation (after turn 1), swipe the app away fully. Reopen from Expo Go.
2. The app restarts at the setup screen (progress is saved on the phone; a finished score survives a kill). Start again from preset 1.
3. Confirm the setup screen shows no error banner and the mic still records.

## 6. Fallbacks — if the network dies mid-demo

- **Flaky network:** tap "🔁 Thử lại". Switch WiFi → 4G and retry once. Keep talking while it retries ("the AI is thinking — like a real landlord").
- **Dead network, key present:** the app CANNOT switch to mock mode by itself (mock only starts when the Gemini key is missing). Pre-planned switch: quit Expo Go, remove the Gemini key from `.env.local`, reload the bundle — the app boots with the red "⚠️ MOCK MODE" banner. Say out loud: "This is the backup build, not the live AI."
- **Mock mode rules (read before you need them):** voice transcription still needs the network, so in mock mode TYPE every line — never speak numbers. Type full digits ("3200000"). Offer exactly 3.200.000 (the floor): the mock agrees at the floor, and anything below it gets a verbal "yes" but no win card.
- **Never** present mock as the real AI. If neither network nor mock works, say so, show the setup screen and the score screen from the rehearsal, and close on the ASK.

## 7. Timing (hard stops)

- Win card MUST be on screen by 2:15. Score screen by 2:25. If turn 2 runs long, skip the beg and go straight to the accept line.
- Total pitch 3:00. Rehearse twice at 15:00 (WiFi, then 4G) with a stopwatch; cut the beg if the run passes 2:30 at the win card.
