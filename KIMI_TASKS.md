# ✅ Final Tasks for Kimi 2 – Phase 7 Production Hardening

> Branch to review: `phase7-unified-final`
> Output branch: `kimi-final-release`

## 🎯 Objective
Transform the Phase 7 codebase into a **production-grade, hardened, logically structured, and fully testable** release version.

---

## 🧠 What You Must Do

### 1. 🔍 Code Audit
- Ensure routing, logic, and folder structure is modular and consistent
- Remove any leftover hacks, duplicates, or inconsistent patterns

### 2. 🔒 Security & Stability
- Harden all exposed API routes
- Validate auth, token handling, error flow, and form validation
- Fix any async/await issues or unsafe logic

### 3. 🧱 Architectural Enhancements
- Ensure `lib/`, `hooks/`, `api/`, and backend logic are clean and reusable
- Create helper modules where repetition exists
- Avoid tight coupling

### 4. ♟️ Chess Logic Enhancements
- Improve `PGN` processing if needed (`KimiChessBrain.ts`)
- Validate replay theater, annotations, and time slider logic
- Ensure smooth sync with voice

### 5. 📢 Voice & Narration
- Ensure ElevenLabs narration works across all stories and PGNs
- Fix stuttering, auto-play failure, browser permission issues

### 6. 🌐 Output: `kimi-final-release` branch
- Push all files — not just changed ones
- Clean, tested, linted, and hardened
- Add `NOTES.md` with changes, refactors, and important commentary

---

## ✅ Must Pass
- ESLint / TypeScript checks
- Preview mode testing (`NODE_ENV=preview`)
- Full voice + PGN sync in `/replay-theater`
- `/upgrade` flow for premium users
- Admin dashboard, abuse detection, and narration scheduler

---

Once complete, I will begin final testing, invite beta users, and launch to production.