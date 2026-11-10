# Presentation API — Company Campus

CompanyAPI.create(seed, { autonomous: true }) สร้างเกมที่เปิดระบบอัตโนมัติ snapshot() และ subscribe() ส่งสำเนา frozen; UI ไม่แก้ world หรือเรียก RNG จำลอง การวาด Canvas ใช้ข้อมูลจาก snapshot และเวลาวาดแยกจากเวลา simulation

snapshot.people มี id, role, roleName, profile, state, affect, skills, activity, position, path, buildingId, isIndoors และ visual. profile มาจากแกนมนุษย์ที่ล็อก การแก้ตัวละครเฉพาะรายผ่าน directorEdit สร้าง profile ที่ตรวจและ freeze ใหม่

snapshot.campus.buildings แสดงอาคาร ระดับ 1–3 ตำแหน่ง ผู้ใช้งานและสถานะงาน; campus.facilityDecision แสดงการประเมินล่าสุดของ CEO และ campus.trainingMinutes คือเวลาฝึกที่ศูนย์ฝึกจริง. gate เป็นทางเข้า ไม่อัปเกรด

Simulation จัดการ CEO ลงทุนอาคารจากเงินสำรองและภาระงาน ต้นทุนบันทึกใน ledger ประเภท equipment. ระดับโรงงาน/คลัง/HQ/วิจัยส่งผลต่อความเร็วงาน ระดับโรงอาหาร/สวนส่งผลต่อการพัก ระดับศูนย์ฝึกส่งผลต่อการฝึกที่สถานีฝึก

UI แสดงข้อมูลและส่งคำสั่ง Edit Hub สำหรับเสกวัตถุดิบ แก้ชื่อ นิสัย ค่านิยม ฟื้นฟู หรือฝึกทักษะตัวละคร; ปุ่มควบคุมเวลา/กล้องเป็นการดู simulation ไม่มีปุ่มให้ผู้เล่นอนุมัติออเดอร์หรือสั่ง CEO ลงทุน

layout เป็นกริดการเดินและสถานีที่ simulation ใช้จริง ส่วนภาพอาคารและประตูสร้างจากข้อมูล presentation: ยังไม่ใช่ระบบจำลองภายในอาคารหรือระบบชนผนังเต็มรูปแบบ อย่าอ้างว่ารองรับสิ่งเหล่านี้แล้ว
