# Patch Report — JS2 v3.15.0 (Part 2): Book #105 Canon Lore & 6 Grand Periodic Festivals (10yr – 10-Epoch)

- **Patch Version (Display):** `JS2 v3.15.0` (Save compatibility preserved: `SIM.PATCH_VERSION = '3.9.6'`, `SIM.SAVE_SCHEMA_VERSION = '3.9.6-deep-gameplay-integration'`)
- **Hard-Locked Files Preserved Byte-Identical:**
  - `AGENTS.md`: `67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`
  - `GAME_SOURCE/js/human_core.js`: `68,270` bytes, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === '155:2f9c9dd7'`
  - Exact **40 `<script>` tags** in `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html`.

---

## 1. Lore-First Canon: Book #105 (`lore_chronicle_b105_grand_periodic_festivals.js`)
- Authored standalone novel-grade **Book #105** (`JD.LORE_CHRONICLE_B105_GRAND_FESTIVALS`: 6 Grand Periodic Festivals, 6 Historical Events, 2 Founding Figures), registered in `tools/sync_lore_bundle.js`, synced into `data/data_expansion.js`, and verified with `tools/lint_lore_archive.js` (**105 books, 742 events, 0 Errors, 0 Warnings**).
- Preserves exact 40 `<script>` tags and canonical 1,000-year Epoch calendar (`ยุคที่ 101 ปีที่ 1–5`).

## 2. Live `EXPED.GRAND_FESTIVALS` Engine Derived from Book #105 (`expedition.js`, `sim.js`, `cultivation.js`, `economy.js`, `cognition.js`)
All 6 cycles converge organically during Epoch 101 Years 2–5 and recur on their true multi-decade/millennial schedules:
1. **10-Year Cycle (Year 2 M4 D15–19):** ⚔️ ลานประลองกระบี่รุ่นเยาว์สิบปี — showcases young disciples (`<= 30` yrs) & external sect prodigies symmetrically.
2. **1,000-Year / 1-Epoch Cycle (Year 2 M8 D12–18):** 🌟 มหางานชุมนุมศิลาพันปี — continental 7-day truce (`clashMult = 0.15`), `+250` auction tax treasury to Seven-Hall Federation, and `+12%` cult / `+5%` breakthrough.
3. **100-Year Cycle (Year 3 M6 D1–7):** 🌊 เทศกาลจุดประภาคารร้อยปี & ตลาดเรือสำเภาทะเลหมอก — boosts `GUILD_BROKER +2` clout in Seven-Hall politics and brings wandering coastal applicants into `W.sect.queue`.
4. **50-Year Cycle (Year 3 M10 D10–15):** ⚗️ มหกรรมแลกเปลี่ยนตำรับโอสถและเตาหลอมครึ่งศตวรรษ — `+25%` craft speed & `+12%` craft quality across alchemy and forging.
5. **120-Year Cycle (Year 4 M12 D12–18):** 🩸 คืนมหาพิธีดับสุริยคราสโลหิต & โคมสุริยันหมื่นดวง — Yin/Demon/Necro paths surge (`cultRate +15%`) while risking Heart Demon (`+2/day`), Orthodox/Light paths cleanse Heart Demon (`-2/day`), and has a `25%` chance to naturally awaken a Dormant Ancient (`CULT.LONGEVITY`).
6. **10,000-Year / 10-Epoch Cycle (Year 5 M1 D1–7):** 🔔 มหาพิธีเชิญเสียงระฆังหมื่นปี & แสงสะท้อนประตูฟ้าแตก — marks 100,000 years since the Shattered Gate, `+22%` cult / `+8%` breakthrough, `IRON_SCALE +2` clout, while keeping the 3 core cosmic mysteries open-ended.

## 3. Observer UI & Documentation Sync (`ui.js`, `css/style.css`, `MASTER_LORE_BIBLE.md`, `project_status_and_ai_onboarding.md`)
- Upgraded HUD festival pill (`#btnFestivalHud`) and World Calendar card in `UI.rWorld` with **🌠 มหาเทศกาลหกคาบเวลา (เล่ม 105)** countdown banner and 6-cycle schedule grid (Zero-RNG, 360px mobile-safe).
- Synced `MASTER_LORE_BIBLE.md`, `project_status_and_ai_onboarding.md`, `START_HERE_FOR_AI.md`, and verified all 8 session patch reports (`v3.9.9`–`v3.15.0`) in `PATCH_REPORTS/`.
