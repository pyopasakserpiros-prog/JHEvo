# JianghuSect 2 v3.0.0 — Source Tree

This folder contains the editable source and tests for the current game.

## Version identity

- Package release: JS2-v3.0.0 Living Continent
- Runtime: `SIM.VERSION 1.10.11`
- Patch: `SIM.PATCH_VERSION 3.0.0`
- Elemental authority: `ELEM.VERSION 2.0.1`
- Save marker: `3.0.0-living-continent`

The atlas uses the same fixed 1,000 × 1,000 li frame as its travel simulation. Both the overview painting and the detailed zoom art are embedded in the offline build. See the [Living Continent report](../PATCH_REPORTS/LIVING_CONTINENT_JS2_V3_0_0.md).

## Files

- `index.html`: modular source entry.
- `JianghuSect_single.html`: generated offline standalone build.
- `data/`: canonical game content registries.
- `js/`: runtime systems and UI.
- `css/`: local styles.
- `assets/`: local runtime assets.
- `test/`: JavaScript regression and integration test source.
- `tools/`: build, browser and simulation tools.
- `docs/`: architecture references and UI metadata.

## Commands

```bash
node tools/build_single.js
node test/run_all.js
node tools/run_parallel_tests.js
node test/standalone.js
node test/core_lock.js
```

Browser tests require the available Playwright/Chromium environment. If browser startup is unavailable, report that limitation honestly.

## Engineering invariants

- Keep `js/human_core.js` byte-identical to SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`.
- Preserve `HC.FINGERPRINT === "155:2f9c9dd7"`.
- Use current system authorities; avoid parallel state.
- Keep the standalone offline-capable.
- Old-save backward compatibility is not required; new-schema save/load is required.


## อัปเดตสถานะล่าสุด: แก้ไขครบหมวด 01–13 (V2.6.0 Complete Audit Remediation)
- แก้ไขและตรวจสอบครบทุกหมวด **01 ถึง 13** (รวมหมวด 13 `13_JS2_Deep_Audit_Lore_Cosmology_CanonSync_Terminology_and_Worldbuilding.pdf` และ `13B_JS2_Deep_Audit_Lore_Part2_LowerWorldCeiling_StageTitles_PowerScaling_SubpathBoilerplate_and_CanonCrises.pdf`)
- ชุดทดสอบถดถอยใหม่: `GAME_SOURCE/test/v260_bugfix_category_13_suite.js` และรายงานฉบับสมบูรณ์ `PATCH_REPORTS/BUGFIX_CATEGORY_13_JS2_V2_6_0.md`
- ผลรันชุดทดสอบทั้งหมดในโปรเจกต์: **ผ่านครบ 100% (0 errors, 0 warnings)** โดยรักษา `AGENTS.md` และ `human_core.js` (`155:2f9c9dd7`) ไม่เปลี่ยนแปลง


## สถานะปล่อยตัวเต็ม (Final Release Ready — 174/174 Test Suites PASS)
- ตรวจสอบและเก็บรายละเอียดครบทุกหมวด **01 ถึง 13** พร้อมชุดทดสอบตรวจสอบขั้นสุดท้าย `GAME_SOURCE/test/v260_final_release_audit_suite.js` และรายงานสรุป `PATCH_REPORTS/FINAL_RELEASE_MASTER_AUDIT_01_13_JS2_V2_6_0.md`
- ชุดทดสอบทั้งหมด **174/174 ชุด** (`node tools/run_parallel_tests.js` และ `node tools/validate_data_schema.js`) ผ่านครบ 100% (`0 errors, 0 warnings, 0 failures`)
