# Patch Report: JS2 v3.8.2 — Novel-Grade Era 0–1 Chaos Lore Archive & Dedicated Lore JS Architecture

- **Version**: `SIM.PATCH_VERSION = '3.8.2'`
- **Save Schema**: `SIM.SAVE_SCHEMA_VERSION = '3.8.2-chaos-era-lore-archive'` (backward-compatible with `3.8.1-world-calendar-epoch` and all prior schemas)
- **Protected Locks**:
  - `AGENTS.md`: `67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4` (untouched)
  - `GAME_SOURCE/js/human_core.js`: `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (untouched)
  - Script Tags: Exact `40` `<script>` tags preserved.

## Summary of Changes
1. **Dedicated Standalone Lore JS Architecture (`GAME_SOURCE/data/lore_chronicle_e0_e1.js` + `GAME_SOURCE/tools/sync_lore_bundle.js`)**:
   - Separated novel-grade Lore authoring into a clean standalone file (`GAME_SOURCE/data/lore_chronicle_e0_e1.js`, 45 KB) and added `node GAME_SOURCE/tools/sync_lore_bundle.js` to sync it cleanly into `data_expansion.js` without violating the 40 `<script>` tag lock.
2. **Novel-Grade Era 0–1 Chaos Lore Archive (`JD.LORE_CHRONICLE_E0_E1`)**:
   - **18 Detailed Historical Events (`EVENTS`)**: 6 Era 0 Pre-Tiangu & Shattered Gate events (`ก่อน ศ.ท. 12,000 ปี` → `ยุคที่ 0 ปีที่ 0`) + 12 Era 1 Post-Tiangu Chaos events (`ยุคที่ 1 ปีที่ 1` → `ยุคที่ 1 ปีที่ 880`), each with full novel-style narrative, locations, key figures, long-term aftermath, and structured `reusableHooks` for future quests/events/ruins.
   - **18 Era 0–1 Figures With Survival Status (`FIGURES_E0_E1`)**: 8 expanded canon figures + 10 brand-new characters (`หมอสนามเร้นนาม เสินอวิ๋น`, `นายช่างเตาเถ้า เถี่ยซาน`, `รัชทายาทจินเยี่ยน เหยียนอู๋โยว`, `ธิดาหุ่นหยก ม่อหลิง`, `ขุนพลผู้ทิ้งธง ฉินป้า`, `อาลักษณ์ตาบอด ฟางซือ`, `แม่ชีเฝ้าหอกลอง หลินชิว`, `นางรำไร้เงา หลิ่วเยว่`, `ศิษย์เฝ้าด่าน เฉินม่อ`, `ต้นหนเรือหลงหมอก อาหู่`) tagged with 5 survival states (`ALIVE_HIDDEN`, `ALIVE_STASIS`, `SOUL_RELIC`, `UNDEAD_GUARDIAN`, `UNKNOWN_MISSING`), survival methods, possible modern locations, and reusable hooks.
   - **6 Fallen Ancient Sects (`FALLEN_SECTS_E0_E1`)**: `สำนักกระบี่รักษาด่านเทียนกู่`, `หอโอสถเตาหลวงไป๋เฉ่า`, `สำนักหุ่นหยกและกลไกเทียนกง`, `หอดาราพิพากษาชะตา`, `สำนักเงากระจกเก้าหยิน`, `อารามบัวเถ้าถ่านชายแดน`.
3. **Lore Window Upgrade (`GAME_SOURCE/js/ui.js`)**:
   - Added tab **`📖 มหากาพย์ยุค 0–1`** inside `UI.rLore()` with 3 read-only sub-tabs (`📜 เหตุการณ์ระดับนิยาย`, `👁️ บุคคลที่อาจยังมีชีวิต`, `🏯 สำนักโบราณล่มสลาย`) and era/survival-status filter pills (zero `W.rng`, zero `W` mutation).
