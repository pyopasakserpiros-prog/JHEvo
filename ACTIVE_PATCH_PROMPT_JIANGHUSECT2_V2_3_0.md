# ACTIVE PATCH PROMPT — JIANGHUSECT 2 (`v2.3.0: Higher-Realm Ascension Expeditions, Shinobi Shadow Ops & Pantheon Relic Forging`)

## 🎯 เป้าหมายแพตช์ถัดไป (`v2.3.0`)
หลังจากที่ `v2.2.0` ได้ขยายระบบสู่ **43 มหาวิถี (286 สายย่อย)**, **ทำเนียบ 5 มหาพิภพ 20 องค์เทพเบื้องบน (`CULT.HIGHER_REALMS_PANTHEON`)**, **แท่นบูชาทวยเทพ (`SECT.COSMIC_SHRINE`)**, และ **วงจรชีวิตคัมภีร์วิถี (`processVaultManuals` / `sellSurplusManuals`)** เรียบร้อยแล้ว แพตช์ `v2.3.0` มีเป้าหมายในการต่อยอดระบบเกมเพลย์ระดับสูงดังนี้:

1. **Pillar 1: Higher-Realm Ascension Rifts & Pantheon Trials (`EXPLORE.COSMIC_RIFTS`)**:
   - เปิดรอยแยกมิติเชื่อมโยงสู่ 5 มหาพิภพเบื้องบน (`HEAVENLY_COURT_DAO`, `VEDIC_VAJRA_REALM`, `DUAT_NETHER_SANDS`, `OLYMPUS_TARTARUS`, `HIMAVANTA_SIAM_DEVA`) สำหรับศิษย์ขั้น 7–9 เพื่อท้าทายเงาอวตารแห่ง 20 องค์เทพและรวบรวมวัตถุดิบเทวะ
2. **Pillar 2: Shinobi Covert Operations & Bushido Duel Grounds (`EXPED.SHINOBI_OPS` & `SECT.IAI_DOJO`)**:
   - ระบบปฏิบัติการลับนินจา (`NINPO_SHADOW`, `NINPO_ELEMENTAL`) สำหรับแทรกซึมสำนักคู่แข่ง สืบข่าวกรอง และวางค่ายกลยันต์ระเบิด
   - ลานประลองอิไอ (`IAI_DOJO`) สำหรับผู้ฝึกวิถี `SHADOW_SAMURAI` ขัดเกลาสมาธิอิไอ (`IAI_FOCUS`) และดวลดาบเดียวตัดสินเป็นตาย
3. **Pillar 3: Occult Yantra Consecration & Ancestral Necropolis (`SECT.OCCULT_SANCTUM`)**:
   - พิธีสักยันต์อาคมคงกระพัน (`OCCULT_MAGE`), การหลอมอวัยวะอสูรขั้นสูง (`DEVOURING_FLESH`), และการปลุกกองทัพหุ่นศพบรรพชนจากสุสานสำนัก (`NETHER_GRAVE`)

## 🔒 กฎเหล็กทางวิศวกรรม (Mandatory Engineering Invariants)
- ห้ามแก้ไข `GAME_SOURCE/js/human_core.js` (`HC.FINGERPRINT === '155:2f9c9dd7'`)
- รักษา `node tools/validate_data_schema.js` ให้ผ่านด้วย `Errors: 0, Warnings: 0`
- รักษาชุดทดสอบทั้งหมดใน `node test/run_all.js` ให้ผ่าน 100%
