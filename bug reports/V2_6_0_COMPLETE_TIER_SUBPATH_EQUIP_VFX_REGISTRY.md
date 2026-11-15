# ทะเบียนวิชวลเอฟเฟกต์ครบทุกระดับขั้น (T1–T7), ตราสายย่อย/มรรคา และเอฟเฟกต์อุปกรณ์/แอคชั่นการรบ (`JS2-v2.6.0`)

เอกสารฉบับนี้บันทึกโครงสร้างและจำนวนรูปแบบเอฟเฟกต์ทั้งหมดที่ติดตั้งใน `GAME_SOURCE/js/skills.js` และ `GAME_SOURCE/js/render.js` เพื่อป้องกันงานซ้ำและใช้ตรวจสอบความถูกต้องของสเกลความอลังการตามระดับขั้น

## 1. เพดานสเกลความอลังการตามระดับวิชา (`SK.NONLEGENDARY_VFX_BUDGET` & `SK.TIER_MOTIF_SCALE_CEILING`)

| ระดับขั้น | รัศมีต่ำสุด (`rMin`) | รัศมีสูงสุด (`rMax`) | อายุการแสดงผล (`life`) | เพดานลวดลาย (`marks`) | เพดานสเกลตราสายย่อย (`tierScale`) | คลังเอฟเฟกต์หลัก | จำนวนรูปแบบ |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| **T1** | `11 px` | `15 px` | `540 ms` | `3` | `0.42` | `SK.T1_VFX_FAMILIES` (`COMMON` 30 + `T1_EXT` 34) | **64 รูปแบบ** |
| **T2** | `11 px` | `15 px` | `540 ms` | `3` | `0.50` | `SK.T2_VFX_FAMILIES` | **64 รูปแบบ** |
| **T3** | `16 px` | `20 px` | `680 ms` | `5` | `0.60` | `SK.T3_GROUP_FAMILIES` (`T3_VFX` 24 + `T3_EXT` 44) | **68 รูปแบบ** |
| **T4** | `24 px` | `29 px` | `850 ms` | `6` | `0.72` | `SK.T4_VFX_FAMILIES` | **72 รูปแบบ** |
| **T5** | `32 px` | `39 px` | `1,050 ms` | `8` | `0.85` | `SK.T5_VFX_FAMILIES` | **68 รูปแบบ** |
| **T6** | `42 px` | `47 px` | `1,250 ms` | `10` | `0.96` | `SK.T6_ALL_VFX_FAMILIES` (`T6_VFX` 50 + `T6_EXT` 14) | **64 รูปแบบ** |
| **T7** | `50 px` | `56 px` | `1,450 ms` | `12` | `1.08` | `SK.T7_VFX_CATALOG` | **71 รูปแบบ** |
| **Legendary** | `60 px` | `84 px` | `2,100–2,500 ms` | `4 ช่วง` | `Apex` | `Render.LEGENDARY_SCENES` / `LEGENDARY_RELIC_SCENES` | **47 วิชา + 27 ศาสตรา** |

## 2. สรุปความครอบคลุมของวิชาทั้งหมดในเกม (`JD.TECH.techniques` 1,726 รายการ + `JD.TECH.mantras` 122 รายการ)

- **T1**: วิชาใช้ร่าย `213` รายการ (`SK.TECH_TO_T1_VFX`) + พาสซีฟ `22` รายการ (`SK.PASSIVE_TO_T1_VFX`) + มนตรา `10` รายการ
- **T2**: วิชาใช้ร่าย `148` รายการ (`SK.TECH_TO_T2_VFX`) + พาสซีฟ/มนตราปราณ `89` รายการ (`SK.PASSIVE_TO_T2_VFX`)
- **T3**: วิชาใช้ร่าย `169` รายการ (`SK.TECH_TO_T3_GROUP_VFX`, คง 26 รายการเดิมใน `SK.TECH_TO_T3_VFX`) + พาสซีฟ/มรรคาติดตัว `94` รายการ (`SK.PASSIVE_TO_T3_GROUP_VFX`)
- **T4**: วิชาใช้ร่าย `395` รายการ (`SK.TECH_TO_T4_VFX`, รวม `INNATE_SUBPATH` 36, `INNATE_GRAND_DAO` 154, `LIGHTNESS_GRAND_DAO` 16, `DEFENSIVE_GRAND_DAO` 16) + พาสซีฟ/มนตรา `54` รายการ (`SK.PASSIVE_TO_T4_VFX`)
- **T5**: วิชาใช้ร่าย `158` รายการ (`SK.TECH_TO_T5_VFX`, รวม `SUPPORT_GRAND_DAO` 16, `FORBIDDEN_ART` 13) + พาสซีฟ/มนตรา `94` รายการ (`SK.PASSIVE_TO_T5_VFX`)
- **T6**: วิชาใช้ร่าย `132` รายการ (`SK.TECH_TO_T6_VFX` 114 + `SK.TECH_TO_T6_EXT_VFX` 18 รวม `FORBIDDEN_GRAND_DAO` 16) + พาสซีฟ/มนตรา `37` รายการ (`SK.PASSIVE_TO_T6_VFX` 8 + `SK.PASSIVE_TO_T6_EXT_VFX` 29)
- **T7**: วิชาใช้ร่าย `71` รายการ (`SK.T7_VFX_CATALOG`)
- **Legendary**: วิชาตำนาน `50` รายการ (`47` ใช้ร่าย + `3` พาสซีฟ)
- **คัมภีร์บ่มเพาะปราณ (`JD.TECH.mantras`)**: `122` รายการ (`SK.MANTRA_TO_VFX_MOTIF`)

## 3. ทะเบียนเอฟเฟกต์ประจำทักษะอุปกรณ์และแอคชั่นการรบ (`SK.EQUIP_EFFECT_VFX_CATALOG` & `SK.COMBAT_ACTION_VFX_CATALOG`)

- **`SK.EQUIP_EFFECT_VFX_CATALOG` (64 รูปแบบหลัก + 17 aliases + 31 เซ็ต `RES_*`)**:
  - แยกการยึดพิกัดตามกลไกจริง: `anchor: 'target'` (แสดงที่ตัวคู่ต่อสู้พร้อมเส้นเชื่อมจากผู้โจมตี), `anchor: 'conduit'` (สายดูดเลือด/ดูดปราณ/ช่วงชิงบัฟจากคู่ต่อสู้กลับหาผู้ร่าย), และ `anchor: 'self'` (เกราะคุ้มกาย/ฟื้นฟู/เร้นเงาที่ตัวผู้สวมใส่)
- **`SK.COMBAT_ACTION_VFX_CATALOG` (36 รูปแบบ)**:
  - ครอบคลุม `FINISHER_*` 13 กลุ่มวิถี, `DUET_RESONANCE_STRIKE`, `CHARGED_SKILL_RELEASE`, `ELEMENTAL_REACTION_BURST`, `MARK_DETONATION_BURST`, `ACUPOINT_SEAL_STRIKE`, `MANTRA_*` 6 รูปแบบ, `DEF_*` 4 รูปแบบ, `SUP_*` 2 รูปแบบ, `FORB_*` 2 รูปแบบ, `PET_GUARDIAN_INTERCEPT`, `SAMURAI_PARRY_COUNTER`, `SHADOW_CLONE_INTERCEPT`, และ `WOOD_SUBSTITUTION_SAVE`
