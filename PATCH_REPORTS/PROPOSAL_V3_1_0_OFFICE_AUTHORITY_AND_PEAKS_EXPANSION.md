# เอกสารข้อเสนอแนะทางสถาปัตยกรรมและการออกแบบระบบ — v3.1.0: Office Authority, Sect Governance & Peaks Sanctuary

> **เอกสารข้อเสนอแนะทางเทคนิคและสถาปัตยกรรมสำหรับ Gemini Work (Argon 4)**  
> จัดทำโดย: Antigravity AI เพื่อเป็นแนวทางประกอบการตัดสินใจและพัฒนาแพตช์ v3.1.0

---

## 1. การวิเคราะห์ปัญหาเดิมในฐานโค้ด v3.0.0

### 1.1 ปัญหาตำแหน่งใน `SECT.PLANNED_POSTS` ค้างล็อกในหน้า UI
- **พิกัดโค้ด:** `GAME_SOURCE/js/sect.js` (บรรทัด 277–282) และ `GAME_SOURCE/js/ui.js` (บรรทัด 2990–2992)
- **สาเหตุ:** `SECT.PLANNED_POSTS` มีคีย์ `diplomacy`, `intelligence`, `beastcare`, `formation` ในขณะที่ฟังก์ชันใน `SECT.POSTS` ถูกเพิ่มในภายหลังด้วยชื่อ `envoy`, `spymaster`, `beastmaster`, `arraymaster`
- **โค้ดที่เกิดปัญหาใน `ui.js`:**
  ```javascript
  const locked = Object.entries(SECT.PLANNED_POSTS).filter(([id]) => !SECT.POSTS[id]);
  h += '<h3>ตำแหน่งที่เตรียมไว้สำหรับอนาคต</h3><div class="card muted">เมื่อระบบรองรับเปิดใช้งาน เจ้าสำนักจึงจะพิจารณาหาคนมาประจำ</div>';
  h += locked.map(([id, p]) => '<div class="card" data-locked-office="' + id + '"><b>🔒 ' + esc(p.nameTh) + ' · ยังไม่ปลดล็อก</b><div class="muted">รอ' + esc(p.requires) + '</div></div>').join('');
  ```
- **แนวทางแก้ไขที่แนะนำ:**
  - กำหนดความสัมพันธ์แบบ Alias หรือผสานคีย์: ให้ `diplomacy` ชี้ไปยัง `envoy`, `intelligence` ชี้ไปยัง `spymaster`, `beastcare` ชี้ไปยัง `beastmaster`, และ `formation` ชี้ไปยัง `arraymaster` (หรือใช้ชื่อทางการที่เป็นมาตรฐานเดียวกัน)
  - ล้างรายการใน `SECT.PLANNED_POSTS` เมื่อตำแหน่งได้รับการปลดล็อกแล้ว หรือย้ายเข้าสู่ `SECT.POSTS` อย่างเป็นทางการ 100%

### 1.2 ปัญหาความอัดแน่นของแท็บ `over` (ภาพรวม) ในหมวดสำนัก
- **พิกัดโค้ด:** `GAME_SOURCE/js/ui.js` (ฟังก์ชัน `UI.rSect` บรรทัด 2710–2900)
- **สาเหตุ:** แท็บ `over` มีความยาวเกินไปเพราะรวมเอาระบบยอดเขา 8 สาย (`SECT.PEAKS`), สภาผู้อาวุโส 4 ก๊ก (`SECT.ELDER_COUNCIL_EDICTS`), ค่ายกลฮวงจุ้ย (`SECT.FENG_SHUI`), แดนลับโบราณ 5 โหนด (`SECT.SECRET_REALM_NODES`), และคู่บำเพ็ญไว้ในหน้าเดียว
- **แนวทางแก้ไข:** แยกหน้าต่าง `⛰️ หุบเขา/ยอดเขา` ออกมาเป็นแท็บย่อยเฉพาะของตัวเอง เพื่อให้ผู้เล่นเข้าถึง จัดการ และติดตามความสัมพันธ์ของทั้ง 8 ยอดเขาได้อย่างสะดวก

---

## 2. โมเดลข้อมูลของระบบตำแหน่งบริหารครบ 6 ทำเนียบฝ่าย (24 ตำแหน่ง)

### 2.1 โครงสร้างอ็อบเจกต์ตำแหน่งที่สมบูรณ์ใน `SECT.POSTS`
แนะนำให้ปรับโครงสร้างข้อมูลใน `GAME_SOURCE/js/sect.js` ให้มีฟิลด์ครบถ้วน:
```javascript
SECT.POST_CATALOG = {
  // 1. ทำเนียบยุทธการและการศึก (War & Vanguard Directorate)
  commander: {
    id: 'commander',
    nameTh: 'แม่ทัพสำนัก',
    category: 'war',
    hall: 'training_ground',
    minRank: 4, // ผู้อาวุโส
    stipendBonus: 35, // ศิลา/เดือน
    authority: 85,
    skillsRequired: ['combat', 'leadership'],
    descTh: 'ประเมินศัตรู ระดมกำลัง และนำการป้องกันสำนัก'
  },
  martial: {
    id: 'martial',
    nameTh: 'ผู้อาวุโสหอยุทธ์',
    category: 'war',
    hall: 'training_ground',
    minRank: 4,
    stipendBonus: 25,
    authority: 75,
    skillsRequired: ['combat', 'teaching'],
    descTh: 'ฝึกศิษย์ จัดประลอง กำหนดหลักสูตรยุทธ์'
  },
  guard: {
    id: 'guard',
    nameTh: 'หัวหน้าองครักษ์',
    category: 'war',
    hall: 'gate',
    minRank: 3, // ศิษย์แกนกลาง
    stipendBonus: 18,
    authority: 60,
    skillsRequired: ['combat', 'vigilance'],
    descTh: 'เฝ้าประตูสำนัก ตรวจตรา ป้องกันศัตรูบุกรุก'
  },
  vanguard: {
    id: 'vanguard',
    nameTh: 'ผู้อาวุโสกองหน้าพิทักษ์ด่าน',
    category: 'war',
    hall: 'gate',
    minRank: 3,
    stipendBonus: 20,
    authority: 65,
    skillsRequired: ['defense', 'combat'],
    descTh: 'สกัดกั้นแนวหน้า บัญชาการ Zone of Control และเข้าคุ้มกันศิษย์แถวหลัง'
  },

  // 2. ทำเนียบวิเทศสัมพันธ์และข่าวกรอง (Diplomacy & Intelligence Directorate)
  envoy: {
    id: 'envoy',
    nameTh: 'ราชทูตยุทธภพและกิจการบริวาร',
    category: 'diplomacy',
    hall: 'main_hall',
    minRank: 4,
    stipendBonus: 30,
    authority: 80,
    skillsRequired: ['diplomacy', 'charisma'],
    descTh: 'เจรจาสนธิสัญญา 19 สำนัก กำหนดนโยบายบรรณาการสำนักบริวาร และประสานสมาพันธ์ยุทธภพ'
  },
  spymaster: {
    id: 'spymaster',
    nameTh: 'เจ้าหอข่าวกรองและเบาะแส',
    category: 'diplomacy',
    hall: 'mission_hall',
    minRank: 4,
    stipendBonus: 28,
    authority: 70,
    skillsRequired: ['stealth', 'perceptiveness'],
    descTh: 'สืบข่าวลือโรงเตี๊ยม ตรวจจับวาสนาฟ้าดิน และสอดส่องคลื่นใต้น้ำในสำนัก'
  },
  warden: {
    id: 'warden',
    nameTh: 'ผู้คุมทัณฑ์และเชลยศึก',
    category: 'diplomacy',
    hall: 'discipline', // หรือ dungeon
    minRank: 3,
    stipendBonus: 18,
    authority: 65,
    skillsRequired: ['intimidation', 'judgement'],
    descTh: 'ควบคุมคุกใต้ดิน เรียกค่าไถ่เชลยศึก เค้นคัมภีร์ยุทธ์ และกล่อมแปรพักตร์'
  },

  // 3. ทำเนียบทรัพยากรและเศรษฐการ (Treasury & Commerce Directorate)
  treasury: {
    id: 'treasury',
    nameTh: 'ผู้อาวุโสหอคลังหลวง',
    category: 'economy',
    hall: 'treasury',
    minRank: 4,
    stipendBonus: 35,
    authority: 85,
    skillsRequired: ['administration', 'numeracy'],
    descTh: 'คุมศิลาวิญญาณ จัดสรรเบี้ยหวัด สวัสดิการโอสถ และงบประมาณสำนัก'
  },
  quartermaster: {
    id: 'quartermaster',
    nameTh: 'แม่ทัพยุทธปัจจัยและคาราวาน',
    category: 'economy',
    hall: 'treasury',
    minRank: 4,
    stipendBonus: 25,
    authority: 70,
    skillsRequired: ['trading', 'administration'],
    descTh: 'จัดสรรเสบียงทัพ ควบคุมเส้นทางคาราวานการค้าเสรี และดูแลคลังยุทธปัจจัย'
  },
  provision: {
    id: 'provision',
    nameTh: 'ผู้อาวุโสฝ่ายเสบียงและโรงครัว',
    category: 'economy',
    hall: 'main_hall',
    minRank: 3,
    stipendBonus: 15,
    authority: 55,
    skillsRequired: ['cooking', 'agriculture'],
    descTh: 'ตรวจอาหารสำรอง วางแผนเพาะปลูกและปรุงอาหารปราณแจกจ่าย'
  },
  marketmaster: {
    id: 'marketmaster',
    nameTh: 'นายวาณิชย์ตลาดภายนอก',
    category: 'economy',
    hall: 'mission_hall',
    minRank: 2, // ศิษย์ใน
    stipendBonus: 15,
    authority: 50,
    skillsRequired: ['trading'],
    descTh: 'ดูแลการค้าตลาดภายนอก แลกเปลี่ยนวัตถุดิบและตั้งราคาที่เป็นธรรม'
  },

  // 4. ทำเนียบเต๋า โอสถ และช่าง (Alchemy, Craft & Formations Directorate)
  alchemy: {
    id: 'alchemy',
    nameTh: 'ปรมาจารย์หอโอสถเซียน',
    category: 'craft',
    hall: 'alchemy',
    minRank: 4,
    stipendBonus: 30,
    authority: 75,
    skillsRequired: ['alchemy'],
    descTh: 'กำหนดการปรุงโอสถ วิจัยตำรับยาผสานธาตุ ดูแลสต็อกโอสถ'
  },
  forge: {
    id: 'forge',
    nameTh: 'ปรมาจารย์โรงหลอมศาสตรา',
    category: 'craft',
    hall: 'forge',
    minRank: 4,
    stipendBonus: 30,
    authority: 75,
    skillsRequired: ['forging'],
    descTh: 'ดูแลหลอมอาวุธ เกราะ ตรวจสอบจิตวิญญาณศาสตราตื่นรู้ (Soul Forge)'
  },
  arraymaster: {
    id: 'arraymaster',
    nameTh: 'ปรมาจารย์ค่ายกลและปราการ',
    category: 'craft',
    hall: 'forge',
    minRank: 4,
    stipendBonus: 28,
    authority: 75,
    skillsRequired: ['array', 'talisman'],
    descTh: 'บำรุงรักษาค่ายกลพิทักษ์สำนัก ปรับจูนชีพจรฮวงจุ้ยอาคาร และคุมม่านพลัง'
  },
  herbal: {
    id: 'herbal',
    nameTh: 'ผู้อาวุโสสวนสมุนไพรทิพย์',
    category: 'craft',
    hall: 'main_hall',
    minRank: 2,
    stipendBonus: 15,
    authority: 50,
    skillsRequired: ['herbalism'],
    descTh: 'ประเมินสมุนไพรที่ขาด ประสานการเพาะปลูกและเก็บเกี่ยวสมุนไพรวิญญาณ'
  },

  // 5. ทำเนียบสัตว์วิญญาณและนิเวศ (Beasts & Ecology Directorate)
  beastmaster: {
    id: 'beastmaster',
    nameTh: 'เจ้าอุทยานสัตว์วิญญาณและพาหนะ',
    category: 'beasts',
    hall: 'gate',
    minRank: 4,
    stipendBonus: 25,
    authority: 70,
    skillsRequired: ['beast_taming'],
    descTh: 'ดูแลโรงเพาะเลี้ยงสัตว์วิญญาณ ให้อาหาร ฟื้นฟูพาหนะ และจัดทัพอสูรเฝ้าประตู'
  },
  wildwarden: {
    id: 'wildwarden',
    nameTh: 'ผู้อาวุโสฝ่ายพรานและลาดตระเวน',
    category: 'beasts',
    hall: 'gate',
    minRank: 3,
    stipendBonus: 18,
    authority: 60,
    skillsRequired: ['survival', 'combat'],
    descTh: 'ตรวจพื้นที่อสูรนอกสำนัก ลาดตระเวนรังอสูร และแจ้งเตือนภัย'
  },

  // 6. ทำเนียบจารีต กฎระเบียบ และการปกครองใน (Law, Governance & Succession Directorate)
  discipline: {
    id: 'discipline',
    nameTh: 'ผู้คุมกฎสำนักและทัณฑ์สถาน',
    category: 'governance',
    hall: 'discipline',
    minRank: 4,
    stipendBonus: 35,
    authority: 85,
    skillsRequired: ['integrity', 'judgement'],
    descTh: 'บังคับใช้กฎ ลงโทษ สืบสวนทุจริต และพิจารณาความผิดศิษย์'
  },
  censor: {
    id: 'censor',
    nameTh: 'ผู้ตรวจการสภาและคลื่นใต้น้ำ',
    category: 'governance',
    hall: 'discipline',
    minRank: 4,
    stipendBonus: 30,
    authority: 80,
    skillsRequired: ['integrity', 'read_people'],
    descTh: 'ถ่วงดุลก๊กการเมืองภายในสำนัก ตรวจสอบการใช้อำนาจ และระงับคลื่นใต้น้ำ'
  },
  scripture: {
    id: 'scripture',
    nameTh: 'ผู้อาวุโสหอคัมภีร์',
    category: 'governance',
    hall: 'scripture',
    minRank: 4,
    stipendBonus: 25,
    authority: 75,
    skillsRequired: ['scholarship'],
    descTh: 'คุมตำราวิชา วิจัยตำรับใหม่ และควบคุมการเข้าถึงคัมภีร์ลับ'
  },
  registry: {
    id: 'registry',
    nameTh: 'ผู้อาวุโสหอทะเบียน',
    category: 'governance',
    hall: 'main_hall',
    minRank: 4,
    stipendBonus: 20,
    authority: 65,
    skillsRequired: ['read_people', 'administration'],
    descTh: 'พิจารณาผู้สมัครเข้าสำนัก จัดทำทะเบียนศิษย์ แทนเจ้าสำนัก'
  },
  healer: {
    id: 'healer',
    nameTh: 'หมอหลวงสำนัก',
    category: 'governance',
    hall: 'infirmary',
    minRank: 3,
    stipendBonus: 20,
    authority: 65,
    skillsRequired: ['healing'],
    descTh: 'รักษาผู้บาดเจ็บ ดูแลสุขภาพทั้งสำนัก ชำระไอพิษและจิตมาร'
  },
  steward: {
    id: 'steward',
    nameTh: 'ผู้อาวุโสฝ่ายอาคารสถานที่',
    category: 'governance',
    hall: 'main_hall',
    minRank: 3,
    stipendBonus: 18,
    authority: 60,
    skillsRequired: ['building', 'planning'],
    descTh: 'ตรวจสถานีแออัด เสนอการบูรณะและขยายสิ่งปลูกสร้าง'
  },
  disciples: {
    id: 'disciples',
    nameTh: 'ศิษย์เอกสืบทอด',
    category: 'governance',
    hall: 'main_hall',
    minRank: 3,
    stipendBonus: 25,
    authority: 80,
    skillsRequired: ['combat', 'leadership'],
    descTh: 'ศิษย์เอกผู้สืบทอดตำแหน่งเจ้าสำนัก ผ่านการเลือกตั้งและโหวตรับรองจากสภา'
  }
};
```

### 2.2 วงจรการตัดสินใจอัตโนมัติ (Jurisdiction Loop)
ใน `GAME_SOURCE/js/sect.js`:
- ฟังก์ชัน `SECT.runOfficerJurisdictionSingle(W, post, officer, opts)` ควรได้รับการขยายให้รองรับทุกตำแหน่งอย่างแท้จริง
- เมื่อตำแหน่งทำงานสำเร็จ ให้ส่งข้อความแจ้งเตือนหรือบันทึกลงสู่พงศาวดาร (`EXPED.recordChronicle` หมวด `SYSTEM_LEDGER` หรือ `GRAND_CHRONICLE`)
- ให้เบี้ยหวัดตำแหน่ง (`stipendBonus`) ถูกหักจากคลังสำนักและจ่ายเข้ากระเป๋าศิษย์ผู้ดำรงตำแหน่งจริงในรอบ `SIM.dailyUpdate` หรือ `SIM.monthly`

---

## 3. การออกแบบหน้าต่าง UI หุบเขา/ยอดเขา (Peaks Sanctuary Hub)

### 3.1 การจัดแท็บย่อยใน `ui.js`
ใน `UI.open('sect', ...)` ให้เพิ่มแท็บย่อย:
```javascript
['over', 'ภาพรวม'],
['policy', 'นโยบาย/นิสัยผู้นำ'],
['posts', 'ตำแหน่งบริหาร'],
['peaks', '⛰️ หุบเขา/ยอดเขา'], // <-- แท็บใหม่เฉพาะระบบ 8 ยอดเขา
['library', '📚 หอคัมภีร์'],
['stock', 'ภาพรวมคลัง'],
['stockItems', '📦 คลังไอเทม'],
['shop', '🛒 ร้าน/คุณูปการ'],
['bld', 'อาคาร']
```

### 3.2 การแสดงผลหน้า `peaks` แบบ Interactive Valley Hub
```javascript
UI.rSectPeaks = (W) => {
  const S = W.sect;
  const peaks = S.peaks || (SECT.PEAKS && SECT.PEAKS.ensure ? SECT.PEAKS.ensure(W) : []);
  const activePeakId = UI.activePeakId || 'OVERVIEW';

  let h = '';
  // 1. แถบเลือกยอดเขาแบบเลื่อนแนวนอน (Horizontal Scrollable Chips)
  h += '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:10px;scrollbar-width:thin">';
  h += '<button class="btn ' + (activePeakId === 'OVERVIEW' ? 'pri' : '') + '" data-do="select-peak-tab" data-arg="OVERVIEW">🗺️ ภาพรวม 8 ยอดเขา</button>';
  peaks.forEach(pk => {
    h += '<button class="btn ' + (activePeakId === pk.id ? 'pri' : '') + '" data-do="select-peak-tab" data-arg="' + pk.id + '">' + esc(pk.icon) + ' ' + esc(pk.nameTh) + '</button>';
  });
  h += '<button class="btn ok" data-do="select-peak-tab" data-arg="TOURNAMENT">🏆 ศึกประลองยอดเขา</button>';
  h += '</div>';

  if (activePeakId === 'OVERVIEW') {
    // 2. แสดงการ์ดภาพรวมเปรียบเทียบทั้ง 8 ยอดเขา
    // ...
  } else if (activePeakId === 'TOURNAMENT') {
    // 3. แสดงหน้าต่างจัดประลองยุทธ์ระหว่างยอดเขา
    // ...
  } else {
    // 4. แสดงรายละเอียดเจาะลึกของยอดเขาที่เลือก (ผู้นำ, รองผู้นำ, รายชื่อศิษย์, ปุ่มย้ายศิษย์เข้าสังกัด, นโยบาย)
    // ...
  }
  return h;
};
```

---

## 4. ผลกระทบลูกโซ่ข้ามระบบที่ต้องตรวจสอบ (Cross-System Ripple Effects)

1. **งบประมาณสำนัก (Treasury Impact):**
   - การจ่ายเบี้ยหวัด 24 ตำแหน่งต้องไม่ทำให้สำนักเงินหมดในวันแรกที่เริ่มเล่น (ควรมีเงื่อนไขเปิดใช้งานตำแหน่งตามระดับชั้นของสำนัก `SECT.officeState`)
2. **ความสัมพันธ์ในสภาผู้อาวุโส (Council Alignment):**
   - ตำแหน่งต่าง ๆ สังกัดอยู่ในก๊กการเมือง 4 ขั้ว (ก๊กเหยี่ยว, ก๊กจารีต, ก๊กการค้า, ก๊กเมตตา) การแต่งตั้งศิษย์เข้าตำแหน่งควรเพิ่มคะแนนอิทธิพลของก๊กนั้น ๆ ในสภา
3. **การบันทึก/โหลดเซฟ (Save State Idempotency):**
   - โครงสร้างตำแหน่งใหม่ต้องไม่ทำให้เซฟเก่าพัง หากโหลดเซฟที่ไม่มีตำแหน่งใหม่ ระบบต้องทำ Hydration/Defaulting ให้อัตโนมัติใน `SIM.deserialize`

---
*เอกสารนี้รวบรวมขึ้นเพื่อเป็นแนวทางอิสระสำหรับ Gemini Work Argon 4 ในการพัฒนาแพตช์ v3.1.0*
