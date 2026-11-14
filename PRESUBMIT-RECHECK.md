# PRESUBMIT RECHECK — Đàm Phán Sống — Codex "AI IN YOUR PALM"

- Written: 2026-11-14 ~15:50 ICT (build ends 16:00, pitch 16:15, form deadline 16:30)
- Branch: `migga/presubmit-recheck` (this file only — no app code changed)
- Master HEAD at writing: `62f5db9` (verified via `git rev-parse HEAD` in the main clone). `tsc --noEmit` CLEAN on 62f5db9 (verified, exit 0).
- Sources: old checklist `migga/submit-checklist:SUBMIT-CHECKLIST.md` (15:15, CONDITIONAL-GO), consistency audit `migga/demo-consistency:CONSISTENCY.md`, `git log/diff 5a4e63b..62f5db9`, `BadgeGrid.tsx` read, repo grep for the form (no hit).
- Codex: call 1 fresh review 7,858 tokens; call 2 hostile redteam 8,012 tokens. Total 15,870. Zero file changes from Codex (code-mode-host missing, as known).

## VERDICT — SPLIT, read both lines

- **FORM: CONDITIONAL-GO — submit before 16:30, and do the 2-minute field check FIRST (see §3).** The form exists, a draft is prepared, the repo is public. The single condition that matters most: open the actual form, read all 11 labels + required markers, then submit immediately. Do not wait until 16:30.
- **DEMO: NOT GO — pending the phone check.** The live demo is unready until one voice turn passes on the OPPO on the current build. Do not treat the form verdict as demo readiness; they are separable decisions.

## 1. WHAT CHANGED SINCE THE 15:15 CHECKLIST

| Change | Effect on submission/demo |
|---|---|
| Form CONFIRMED (Mie 15:16): Google Form, 11 fields, deadline 16:30 | Supersedes "no form found". Draft prepared, NOT submitted. |
| All 7 `migga/*` branches pushed to origin | Old risk "local-only branches lost if VM dies" — CLOSED. |
| Master 7646ee6 → 5a4e63b → 62f5db9 | 7 commits since the sync check. Demo round files (App.tsx, gemini.ts, mock.ts, score.ts, groq.ts, progress.ts) UNTOUCHED — scored round identical to frozen build f746bf3 except merged extractVnd fix 6494f19. |
| Arch pulled to 5a4e63b (15:34), Metro running | Phone demo build is 7 commits BEHIND master. Delta is retention only: Home badge grid (real stats, `BadgeGrid.tsx` verified — renders state/title/desc, does not use the now-empty icon strings), emoji removed from UI (room icons now "1"–"5"), eas.json preview buildType apk, retention docs, 132 icon assets. |
| Consistency fixes pushed (pitch ffa2706, runbook d0c1df9, video 80b5ca4) | 5 contradictions fixed: no rehearsal score on stage, 30s/turn rule, runbook ladder, cumulative savings, fixed (not secret) floor. |
| QA drill added (migga/qa-drill @ 4269f4c) | 5 hardest judge questions, ≤60-word answers, repo evidence. |
| Derent deferred; 4G test dropped (Tuấn) | No content change before the pitch; no 4G test expected. |
| APK build c04a3528 (from 96b20e4) | Was RUNNING at 15:29. Status now UNKNOWN to this task (separate browser task checking). Do not count on it. |

## 2. BLOCKING vs READY

### FORM-BLOCKERS (can stop the submission itself)

1. **3 members' Luma emails — NOT supplied.** Nobody has posted them; this task does not have them. Whether they block submission depends on whether those fields are required — unknown until the form is opened (§3). If required and missing, submission fails at the deadline.
2. **The 11 field names have never been seen by any agent.** No URL or field list in the repo (grep for forms.gle / luma / "google form" / "nộp sản phẩm" returned nothing). The draft cannot be confirmed to cover every field. The form may require something the team has NOT prepared (e.g. a video link, a pitch-deck link, a repo link in a specific format). Cheapest fix: open the form now, 2 minutes.
3. **"Draft prepared" ≠ "submission succeeds"** (Codex call 2 — missed failure mode). A required field that cannot be completed, a form rejection, or running out of time while resolving it all kill the submission at 16:30. Submit early; do not wait for the deadline.

### DEMO RISKS (submission can proceed; stage can still fail)

1. **Phone check NOT done — the #1 demo risk.** Kill-and-reopen, no MOCK banner, 1 voice turn end-to-end, TTS audible from the back of the room — none verified on the current build. Smoke test was requested ~15:34; outcome unknown to this task.
2. **No backup video FILE.** Only the script exists. If voice/network fails on stage there is no verified video fallback. Typed input is a WEAK fallback (Codex call 2, blunt): it preserves the negotiation flow but does not prove voice works — judges will reasonably see a materially diminished demo. It is damage control, not an equivalent fallback.
3. **APK status UNKNOWN.** Do not count on it as a backup.
4. **7-commit gap phone vs public repo — INFLATED as a judge risk (Codex call 2).** Judges will not compare the Home screen pixel-for-pixel. Real harm is narrower: provenance/reproducibility — the public repo shows a Home (badge grid, no emoji) the judges did not see on the phone. Downgraded from primary risk to a note: be ready to explain the repo is newer than the demo build.
5. **6494f19 (extractVnd fix) still never judge-verified.** No record exists. Could invite a scoring question; unlikely to stop the demo itself.

### READY (verified)

- Repo PUBLIC (`Nezine/dam-phan-song`), master 62f5db9 pushed, tsc clean.
- Pitch 3:00 (6 beats), runbook, video script, QA drill — all pushed, consistency-fixed.
- Demo round byte-identical to the frozen build except the merged extractVnd fix.
- All `migga/*` branches on origin.

## 3. WHAT TO PUT IN THE FORM — content bank + honest gaps

**I do not know the 11 field names.** No agent in this task has seen the form. Everything below is the verified content bank the submitter needs; map it to the actual labels when the form is open. Anything marked GUESS is not verified — do not present it as fact.

Verified facts to use:
- App name: **Đàm Phán Sống**
- Repo (public): **https://github.com/Nezine/dam-phan-song** — master HEAD 62f5db9 at submission time; demo build on the phone is 5a4e63b (7 commits behind; demo round identical).
- What it is: voice negotiation-practice app (Duolingo for negotiation); Room 1 = rent negotiation, live AI landlord with a fixed floor of 3.2tr/month, 6 fixed scoring rules + verbatim weakest line, progress saved on device.
- Demo: live on a real phone (OPPO A60) + 3:00 pitch at 16:15. No emulator, no video-as-demo.
- Team members (names only; Luma emails MISSING — collect before submitting): Trần Hoàng Anh, Phạm Tuấn Huy, Nguyễn Vũ Đức Thịnh, Ngọc Anh (full name unverified).
- Team name: GUESS — group is "Optimus [ Prime ]"; no verified team name for this event. Confirm with the team, do not guess on the form.
- Backup video link: NONE — no video file exists. If the form requires one, that field CANNOT be completed truthfully. Do not paste the script link as a video.
- Pitch deck link: UNKNOWN — no deck is mentioned anywhere in the repo. If required, that is a blocker to resolve on site, not something to invent.
- Market numbers: NONE — no TAM/SAM/SOM. "100 users week 1" is a TARGET, not traction. Do not write it as traction.

2-minute check before submitting: open the form, read all 11 labels + which are required, confirm each has a truthful value from the bank above. If a required field has no truthful value (Luma emails, video link), fix it on the spot or ask BTC on site — do not leave it to 16:30.

## 4. THREE THINGS MOST LIKELY TO GO WRONG BEFORE 16:15 (30-second fix each)

1. **Team keeps changing code / pulls 62f5db9 to Arch.** PULLING NOW IS A TRAP (both Codex calls agree): ~30 min left, phone is on the known-good 5a4e63b, the delta is Home cosmetics not in the scored round — a pull buys rebuild + re-test risk for nothing. 30s fix: FREEZE. No more pulls, no more merges. Say it out loud in the group.
2. **Voice fails on stage and there is no video file.** 30s fix: do the phone check NOW (one voice turn, TTS from the back of the room). If voice fails, go to typed input and say so plainly — show the scoring + transcript, do not fake a voice demo, do not show a rehearsal score screen.
3. **Form submission fails at the deadline.** 30s fix: open the form NOW, check the required fields, submit as soon as the Luma emails (or a decision on them) land. Submitting at 16:29 with an uncompletable required field is a failed submission, not a late one.

## Codex log (owner order: use heavily, burn tokens)

- Call 1 — fresh GO/NO-GO review: **7,858 tokens**. Verdict CONDITIONAL-GO. Ranked blockers (form: Luma emails, unknown fields; demo: phone check, no video file, APK unknown, 7-commit gap, 6494f19). Most likely failure: team keeps pulling/rebuilding instead of confirming the phone. Pull = trap.
- Call 2 — hostile redteam of the draft: **8,012 tokens**. Corrections applied above: (a) split the verdict — form CONDITIONAL-GO, demo NOT GO; (b) 7-commit gap downgraded from judge-confusion to provenance note; (c) Luma-email assumption unsupported — unknown fields are the larger uncertainty, 2-min form check is the fix; (d) typed input is a weak fallback, not equivalent — voice failure means the central proof fails; (e) missed failure mode added: the submission itself can fail at the deadline.
- **Total: 15,870 tokens. Zero file changes from Codex** (code-mode-host missing, as known).

## NOT VERIFIED — flagged plainly

- The form's 11 field names / which are required / the form URL (never seen by this task).
- The 3 members' Luma emails (not supplied anywhere this task can read).
- Whether a backup video file exists anywhere (only the script was ever verified).
- APK build c04a3528 status (separate browser task checking; UNKNOWN here).
- Outcome of the 16:00–16:10 phone check / the 15:34 smoke test (not reported back to this task).
- Whether 6494f19 was ever judge-verified (no record).
- Whether the landlord closes at exactly 3.2tr live (temperature 0.9; runbook branch B covers no-close).
