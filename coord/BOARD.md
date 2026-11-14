# Đàm Phán Sống — Board (15:00 freeze)

Mainline: master. Coordinator: Muse (fixed). Deputy: Milo (backup: Migga). Term: 1.
Target: everything DONE by 15:00 for team testing. Submit 16:00, pitch 16:15 (3 min, 6 beats — see PITCH.md).

## Rules (muse-fleet buffet mode, compressed)
- Coordinator merges only. Builder never grades its own work. Red-team SEVERE = block.
- The repo is the coordination channel. Messenger = milestones only.
- No force-push. Never rebase another agent's branch. Poll: git pull every 15 min.
- **UX first: never make the user do stupid things.** Every flow must be obvious, with as few steps as possible — no redundant taps, no re-entering what the app already knows, no dead ends, no punishing a mistake. If a first-time user can do it wrong, the flow is wrong.

## Slices
| Slice | Owner | Status | Min | Definition of done |
| INT-1 integrate 3 branches | Migga | working | 25 | App runs in Expo Go; home → map → negotiate + back button; no dead ends; tsc clean |
| UNI-1 unification fixes | Muse subagents | working | 20 | One XP economy (gamification.ts); fill #2f81f7 only; gray #9fb0bf; H1 28; rubric = merged 6-rule system |
| DEMO-1 live demo proof | Milo + human | submitted | 25 | Kill/reopen + weak WiFi + 4G switch pass on OPPO A60 |
| PITCH-1 pitch ready | Milo | working | 20 | Timed rehearsal ≤ 3:00, 6 beats × 30s |
| FIX-1 red-team killers | TBD on REDTEAM.md | submitted | 15 | All DEMO-KILLERs fixed + re-verified |
| GATE-1 merged-tree build | laptop Codex | working | 25 | npm ci + tsc + eslint + bundle export green on merged tree |

## Notes
- Roadmap rubric is 5 criteria; merged scoring is 6 rules + %. Reconcile in UNI-1 (merged 6-rule system wins).
- All commits by Muse are now authored phamTuan207 (fixed 14:35). Future commits use the same identity.
- Flagged file: App.tsx (hot shared file — one owner per round: Migga for INT-1).
