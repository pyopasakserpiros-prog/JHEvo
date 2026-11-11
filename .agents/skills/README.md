# สกิลสำหรับ AI ในโปรเจกต์ Company Simulation (นิคมอิเล็กทรอนิกส์สยาม)

โฟลเดอร์นี้บรรจุสกิลเฉพาะสำหรับเกมบริษัท (`COMPANY_SOURCE/`) โดยแยกออกจากสกิลของ JS2 อย่างชัดเจน:

1. **`company-evolution-dev/SKILL.md`** (และสำเนาที่ `SKILL.md` รากโปรเจกต์):
   - Master Skill ภาพรวมสถาปัตยกรรมและระบบทั้งหมดของเกมบริษัท (อัปเดตถึงแพตช์ **v0.2.0**) ต้องอัปเดตไฟล์นี้ทุกครั้งหลังจบแพตช์ใหม่
2. **`company-for-every-patch/SKILL.md`**:
   - Evergreen Skill สำหรับใช้กับทุกแพตช์ กำหนดขั้นตอนก่อนทำแพตช์ กฎเหล็ก (Locked Human Core 1.0.0, Closed-Loop Accounting, 100% Autonomous NPC) และรายการตรวจสอบบังคับหลังทำแพตช์เสร็จ
