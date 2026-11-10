# Company Simulation — วิธีเปิดและพัฒนา

## เล่น

เปิด CompanyFoundation_single.html ในเบราว์เซอร์ที่อนุญาตไฟล์ในเครื่อง หรือรันในโฟลเดอร์นี้:

    python3 -m http.server 8000

จากนั้นเข้า http://localhost:8000/index.html. เกมใช้ Canvas และไม่มีบริการภายนอกขณะเล่น ซูมด้วยปุ่ม +/−, ล้อเมาส์ หรือบีบนิ้ว ลากแผนที่เพื่อเลื่อน แตะคนหรืออาคารเพื่อดูข้อมูล แถบเลือกตัวละครมีปุ่มปิด

NPC/CEO ดำเนินกิจการเอง ผู้เล่นปรับเวลา/มุมมอง ตรวจข้อมูล เสกวัตถุดิบ และแก้ชื่อตัวละคร นิสัย ค่านิยม หรือฝึกทักษะในเมนู/แก้ไขได้ การแก้ตัวละครไม่เปลี่ยนไฟล์สูตรแกน

## สร้างและทดสอบ

ใช้ Node 20 ขึ้นไป การเล่นไฟล์ HTML ไม่ต้องติดตั้ง npm:

    npm ci
    npm run check
    npm test
    npm run build
    npx playwright install chromium
    npm run test:browser

หากมี Chromium ติดตั้งแล้ว กำหนด CHROMIUM_PATH แทนการดาวน์โหลด browser ได้ ตั้ง COMPANY_SCREENSHOTS_DIR เพื่อบันทึกภาพทดสอบ browser. ชุด test:browser จะ build HTML ก่อนและตรวจทั้งหน้าซอร์สกับไฟล์เดี่ยวบนขนาดมือถือ/เดสก์ท็อป

tools/build.cjs รวม index.html, css/debug.css และ js/ ตามลำดับใน index เป็น CompanyFoundation_single.html ไฟล์เดียว อย่าแก้ HTML ที่ build โดยไม่แก้ซอร์สต้นทาง

เซฟเก่าข้ามแพตช์ไม่จำเป็นต้องรองรับในช่วงพัฒนาแรก ตาม AGENTS.md; เก็บไฟล์เซฟจริงของผู้ใช้ไว้เสมอ
