(function (root, factory) {
  "use strict";
  const value = factory(
    typeof module === "object" && module.exports
      ? require("./human-core.js")
      : root.CompanyCore,
  );
  if (typeof module === "object" && module.exports) module.exports = value;
  else root.CompanyData = value;
})(typeof globalThis !== "undefined" ? globalThis : this, function (H) {
  "use strict";
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const idPattern = /^[a-z][a-zA-Z0-9_-]{0,63}$/;
  const validId = (id) =>
    typeof id === "string" &&
    idPattern.test(id) &&
    !["constructor", "prototype"].includes(id);
  const deepFreeze = (o) => {
    Object.values(o).forEach((v) => {
      if (v && typeof v === "object") deepFreeze(v);
    });
    return Object.freeze(o);
  };

  // Multi-nationality demographic & name pools researched from authentic regional registries
  const NATIONALITIES = deepFreeze({
    TH: {
      id: "TH",
      nameTh: "ไทย",
      nameEn: "Thai",
      flag: "🇹🇭",
      codeTh: "TH · ไทย",
      hometowns: ["นนทบุรี", "สมุทรปราการ", "ปทุมธานี", "ชลบุรี", "เชียงใหม่", "ขอนแก่น", "นครราชสีมา", "ระยอง", "พระนครศรีอยุธยา", "ฉะเชิงเทรา"],
      educations: [
        "ปวส. เทคนิคอุตสาหกรรมและเมคคาทรอนิกส์",
        "ปริญญาตรี วิศวกรรมอุตสาหการและระบบการผลิต",
        "ปริญญาตรี บริหารธุรกิจและการจัดการซัพพลายเชน",
        "ปวส. ช่างกลโรงงานและควบคุมคุณภาพมาตรฐานสากล",
        "ปริญญาตรี บัญชีต้นทุนและการเงินธุรกิจอุตสาหกรรม"
      ],
      roleWeight: { sales: 0.72, admin: 0.78, engineer: 0.52, assembler: 0.58, inspector: 0.62, logistics: 0.64, coordinator: 0.72 }
    },
    JP: {
      id: "JP",
      nameTh: "ญี่ปุ่น",
      nameEn: "Japanese",
      flag: "🇯🇵",
      codeTh: "JP · ญี่ปุ่น",
      hometowns: ["โอซาก้า", "นาโกย่า", "โยโกฮาม่า", "ฟุกุโอกะ", "เกียวโต", "ฮามามัตสึ"],
      educations: [
        "สถาบันเทคโนโลยีแห่งโตเกียว (Monozukuri & Lean QC)",
        "ปริญญาตรี วิศวกรรมไมโครอิเล็กทรอนิกส์และยานยนต์ (Nagoya)",
        "ผู้เชี่ยวชาญมาตรฐาน Kaizen, 5S & IPC-A-610"
      ],
      roleWeight: { sales: 0.05, admin: 0.04, engineer: 0.18, assembler: 0.04, inspector: 0.14, logistics: 0.03, coordinator: 0.08 }
    },
    CN: {
      id: "CN",
      nameTh: "จีน",
      nameEn: "Chinese",
      flag: "🇨🇳",
      codeTh: "CN · จีน",
      hometowns: ["เซินเจิ้น", "ซูโจว", "กวางโจว", "เซี่ยงไฮ้", "ตงกวน", "หางโจว"],
      educations: [
        "วิศวกรรมฮาร์ดแวร์และซัพพลายเชนอุตสาหกรรม (Shenzhen)",
        "ปริญญาตรี วิศวกรรมระบบอัตโนมัติและพลังงานสะอาด",
        "การจัดการโลจิสติกส์และจัดซื้อชิ้นส่วนระดับโลก"
      ],
      roleWeight: { sales: 0.08, admin: 0.06, engineer: 0.14, assembler: 0.08, inspector: 0.08, logistics: 0.08, coordinator: 0.08 }
    },
    VN: {
      id: "VN",
      nameTh: "เวียดนาม",
      nameEn: "Vietnamese",
      flag: "🇻🇳",
      codeTh: "VN · เวียดนาม",
      hometowns: ["บั๊กนิญ", "ไฮฟอง", "ดานัง", "โฮจิมินห์", "ฮานอย", "บิ่ญเซือง"],
      educations: [
        "เทคนิคการประกอบ SMT และสายการผลิตความแม่นยำสูง (Bac Ninh)",
        "ปริญญาตรี วิศวกรรมไฟฟ้าและตรวจสอบคุณภาพผลิตภัณฑ์",
        "ประกาศนียบัตรวิชาชีพชั้นสูง ช่างเทคนิคอุตสาหกรรม"
      ],
      roleWeight: { sales: 0.04, admin: 0.04, engineer: 0.08, assembler: 0.14, inspector: 0.1, logistics: 0.1, coordinator: 0.04 }
    },
    MM: {
      id: "MM",
      nameTh: "เมียนมา",
      nameEn: "Myanmar",
      flag: "🇲🇲",
      codeTh: "MM · เมียนมา",
      hometowns: ["ย่างกุ้ง", "มัณฑะเลย์", "พะโค", "เมาะลำเลิง", "ตองยี"],
      educations: [
        "ใบรับรองช่างประกอบชิ้นส่วนอุตสาหกรรมและคลังสินค้า",
        "เทคนิคการประกอบละเอียดและการแพ็กกิ้งมาตรฐานส่งออก",
        "วิชาชีพช่างเทคนิคสายการผลิตและตรวจสอบเบื้องต้น"
      ],
      roleWeight: { sales: 0.02, admin: 0.02, engineer: 0.02, assembler: 0.14, inspector: 0.04, logistics: 0.13, coordinator: 0.03 }
    },
    EN: {
      id: "EN",
      nameTh: "สากล (ตะวันตก)",
      nameEn: "International",
      flag: "🇬🇧",
      codeTh: "EN · สากล",
      hometowns: ["ลอนดอน", "ซานโฮเซ", "ซิดนีย์", "แมนเชสเตอร์", "มิวนิก", "ซูริก"],
      educations: [
        "B.Eng. Embedded Systems & Industrial Automation",
        "B.Sc. Global Supply Chain & B2B Key Account Management",
        "M.Eng. Reliability Engineering & Six Sigma Black Belt"
      ],
      roleWeight: { sales: 0.09, admin: 0.06, engineer: 0.06, assembler: 0.02, inspector: 0.02, logistics: 0.02, coordinator: 0.05 }
    }
  });

  const NAME_POOLS = deepFreeze({
    TH: {
      maleFirst: [
        "ธนกฤต", "กิตติพงศ์", "ณัฐวุฒิ", "ศุภชัย", "ภูริพัฒน์", "ชยุต",
        "ภาคิน", "วรเมธ", "ธีรภัทร", "ปิยะพงษ์", "จิรายุ", "กัมปนาท",
        "อัครเดช", "พีรวิชญ์", "นรภัทร", "ศรัณย์", "พงศกร", "อนุชา",
        "ธนดล", "กฤตภาส", "ชานนท์", "ปรเมศวร์", "สิรภพ", "เจตนิพัทธ์"
      ],
      femaleFirst: [
        "กมลชนก", "พิมพ์ชนก", "ณัฐธิดา", "ศิริพร", "ชลธิชา", "กัญญาณัฐ",
        "ภัทรวดี", "วรัญญา", "อารยา", "สุภัสสรา", "นันท์นภัส", "ปภาวรินท์",
        "พิชญาภา", "รุ่งทิวา", "ธัญชนก", "อัญชลี", "ลลิตา", "มนัสนันท์",
        "ชนัญชิดา", "ปุณยนุช", "กานต์สินี", "แพรวพรรณ", "ญาดา", "เขมิกา"
      ],
      surnames: [
        "วงศ์สุวรรณ", "เจริญสุข", "ศรีสวัสดิ์", "เกียรติไพศาล", "รัตนโชติ",
        "พงษ์พานิช", "อัครเดชา", "วัฒนากุล", "โชติบริบูรณ์", "ตั้งเจริญ",
        "พิทักษ์สิน", "ธนากิจ", "ศิริวงศ์", "เลิศวิไล", "กิจเจริญ",
        "บุญญะริทธิ์", "สมบูรณ์ผล", "สุวรรณภูมิ", "จรัสแสง", "นิคมรัตน์",
        "วิริยะกิจ", "มหาดำรงค์", "เปี่ยมสุข", "สกุลไทย", "ทรัพย์ทวี"
      ],
      nicknamesMale: ["ภัทร", "ต้น", "กานต์", "ธีร์", "ภูมิ", "นนท์", "เจ", "อาร์ต", "แบงค์", "ก้อง", "เอิร์ธ", "ท็อป", "บอส", "พีท", "มาร์ค", "โอม", "คิว", "กาย"],
      nicknamesFemale: ["มิน", "น้ำ", "อิง", "ป่าน", "แพร", "ฟ้า", "เมย์", "โบว์", "พลอย", "มายด์", "เนย", "พิม", "เฟิร์น", "จูน", "เบลล์", "ออม", "ครีม", "กวาง"]
    },
    JP: {
      maleFirst: ["ฮารุโตะ (Haruto)", "เร็น (Ren)", "ทาคุมิ (Takumi)", "เคนจิ (Kenji)", "โซตะ (Sota)", "ไดกิ (Daiki)", "ยูโตะ (Yuto)", "นาโอกิ (Naoki)"],
      femaleFirst: ["ฮิมาริ (Himari)", "อาโออิ (Aoi)", "ยุย (Yui)", "ซากุระ (Sakura)", "มิโอะ (Mio)", "ริน (Rin)", "อายากะ (Ayaka)", "นานามิ (Nanami)"],
      surnames: ["ซาโต้ (Sato)", "ซูซูกิ (Suzuki)", "ทาคาฮาชิ (Takahashi)", "ทานากะ (Tanaka)", "วาตานาเบะ (Watanabe)", "อิโต้ (Ito)", "ยามามาโตะ (Yamamoto)", "โคบายาชิ (Kobayashi)"],
      nicknamesMale: ["เคน", "ทาคุ", "เร็น", "ฮารุ", "โซตะ", "ได"],
      nicknamesFemale: ["อาโออิ", "ยุย", "มิโอะ", "ริน", "ซากุระ", "นานะ"]
    },
    CN: {
      maleFirst: ["เหว่ย (Wei)", "ฮ่าวหราน (Haoran)", "จื้อหาว (Zihao)", "หมิงเจ๋อ (Mingze)", "เจี้ยนหัว (Jianhua)", "จวิ้นเจี๋ย (Junjie)", "อี้เฉิน (Yichen)", "ข่าย (Kai)"],
      femaleFirst: ["จื่อหาน (Zihan)", "อี้หนัว (Yinuo)", "ซินอี้ (Xinyi)", "เหม่ยหลิง (Meiling)", "เสี่ยวเหวิน (Xiaowen)", "เจียอี้ (Jiayi)", "หยูถง (Yutong)", "หลิน (Lin)"],
      surnames: ["หวัง (Wang)", "หลี่ (Li)", "จาง (Zhang)", "หลิว (Liu)", "เฉิน (Chen)", "หยาง (Yang)", "หวง (Huang)", "จ้าว (Zhao)"],
      nicknamesMale: ["เหว่ย", "ฮ่าว", "หมิง", "เจี้ยน", "ข่าย"],
      nicknamesFemale: ["หลิน", "เหม่ย", "ซิน", "เหวิน", "เจีย"]
    },
    VN: {
      maleFirst: ["มินห์ กวาน (Minh Quan)", "ฮว่าง นาม (Hoang Nam)", "ดึ๊ก อันห์ (Duc Anh)", "แทงห์ ตุง (Thanh Tung)", "กวาง ฮุย (Quang Huy)", "บ๋าว ลอง (Bao Long)"],
      femaleFirst: ["ถวิ ลินห์ (Thuy Linh)", "บิช หง็อก (Bich Ngoc)", "ไม อันห์ (Mai Anh)", "แทงห์ ห่า (Thanh Ha)", "ฟือง เถ่า (Phuong Thao)", "ลาน อันห์ (Lan Anh)"],
      surnames: ["เหงียน (Nguyen)", "เจิ่น (Tran)", "เล (Le)", "ฝ่าม (Pham)", "ฮหว่าง (Hoang)", "หวู (Vu)", "ดัง (Dang)", "บุ่ย (Bui)"],
      nicknamesMale: ["กวาน", "นาม", "ฮุย", "ตุง", "ลอง"],
      nicknamesFemale: ["ลินห์", "หง็อก", "ไม", "ห่า", "เถ่า"]
    },
    MM: {
      maleFirst: ["อ่อง จอ (Aung Kyaw)", "มิน ตัน (Min Thant)", "หม่อง ซอ (Maung Zaw)", "โก โก (Ko Ko)", "เท็ต แนง (Htet Naing)", "ซอ ลวิน (Zaw Lwin)"],
      femaleFirst: ["เม ตะซิน (May Thazin)", "ขิ่น ซู (Khin Su)", "เอ มิ (Aye Mi)", "นันท์ ซานดาร์ (Nand Sandar)", "ซู มยัต (Su Myat)", "พยู ซิน (Phyu Sin)"],
      surnames: ["สายช่างย่างกุ้ง", "สายเทคนิคมัณฑะเลย์", "สายงานพะโค", "สายอุตสาหกรรมเมียนมา"],
      nicknamesMale: ["อ่อง", "หม่อง", "ซอ", "เท็ต", "โก"],
      nicknamesFemale: ["เม", "ขิ่น", "เอ", "ซู", "พยู"]
    },
    EN: {
      maleFirst: ["อเล็กซานเดอร์ (Alexander)", "เจมส์ (James)", "โอลิเวอร์ (Oliver)", "ลูคัส (Lucas)", "แดเนียล (Daniel)", "มาร์คัส (Marcus)"],
      femaleFirst: ["ชาร์ล็อตต์ (Charlotte)", "เอมิลี่ (Emily)", "โซเฟีย (Sophia)", "คลาร่า (Clara)", "เอเลน่า (Elena)", "ฮันนาห์ (Hannah)"],
      surnames: ["สมิธ (Smith)", "จอห์นสัน (Johnson)", "มิลเลอร์ (Miller)", "แอนเดอร์สัน (Anderson)", "เทย์เลอร์ (Taylor)", "คลาร์ก (Clark)"],
      nicknamesMale: ["อเล็กซ์", "เจมส์", "ลุค", "แดน", "มาร์ค"],
      nicknamesFemale: ["เอมี่", "โซฟี", "คลาร่า", "เอเลน", "ฮันนาห์"]
    }
  });

  const STARTER_IDENTITIES = deepFreeze({
    "employee-1": { nationality: "TH", gender: "F", age: 27, firstName: "มินตรา", lastName: "วงศ์สุวรรณ", educationTh: "ปริญญาตรี บริหารธุรกิจและการตลาดอุตสาหกรรม B2B (ม.เกษตรฯ)", hometownTh: "นนทบุรี" },
    "employee-2": { nationality: "TH", gender: "M", age: 29, firstName: "ภัทรพล", lastName: "เจริญสุข", educationTh: "ปริญญาตรี การจัดการซัพพลายเชนและบัญชีต้นทุน", hometownTh: "สมุทรปราการ" },
    "employee-3": { nationality: "JP", gender: "F", age: 31, firstName: "นานามิ (Nanami)", lastName: "ทาคาฮาชิ (Takahashi)", educationTh: "วิศวกรรมระบบอุตสาหกรรมและนวัตกรรม (Osaka Institute of Tech)", hometownTh: "โอซาก้า" },
    "employee-4": { nationality: "TH", gender: "M", age: 24, firstName: "ต้นกล้า", lastName: "ศรีสวัสดิ์", educationTh: "ปวส. เทคนิคการผลิตและเมคคาทรอนิกส์โรงงาน", hometownTh: "ชลบุรี" },
    "employee-5": { nationality: "VN", gender: "F", age: 23, firstName: "ถวิ ลินห์ (Thuy Linh)", lastName: "เหงียน (Nguyen)", educationTh: "เทคนิคสายการผลิตอัตโนมัติและการประกอบความแม่นยำสูง (Bac Ninh)", hometownTh: "บั๊กนิญ" },
    "employee-6": { nationality: "TH", gender: "M", age: 30, firstName: "กานต์ชนก", lastName: "เกียรติไพศาล", educationTh: "ปริญญาตรี วิศวกรรมควบคุมคุณภาพ มาตรฐาน ISO 9001 & IQC", hometownTh: "ปทุมธานี" },
    "employee-7": { nationality: "MM", gender: "F", age: 25, firstName: "เม ตะซิน (May Thazin)", lastName: "สายเทคนิคย่างกุ้ง", educationTh: "วิชาชีพการจัดการคลังสินค้าและฟลีทขนส่งส่งออก", hometownTh: "ย่างกุ้ง" },
    "employee-8": { nationality: "CN", gender: "M", age: 34, firstName: "จื้อหาว (Zihao)", lastName: "เฉิน (Chen)", educationTh: "ปริญญาโท บริหารอุตสาหกรรมและกลยุทธ์องค์กร (Shenzhen Tech)", hometownTh: "เซินเจิ้น" }
  });

  // Real-World Corporate Organizational Divisions (สายงานหลัก 3 สายงาน)
  const CORPORATE_DIVISIONS = deepFreeze({
    executive: {
      id: "executive",
      nameTh: "สายงานบริหารสูงสุดและกลยุทธ์องค์กร (CEO & Executive Strategy Division)",
      zoneId: "office",
      icon: "👑",
      roles: ["coordinator"],
      descriptionTh: "กำหนดเข็มทิศกลยุทธ์ประจำสัปดาห์ บริหารเงินทุน ชำระหนี้ ขยายอาคาร/ที่ดิน สรรหาบุคลากร และอนุมัติเลื่อนตำแหน่ง"
    },
    office: {
      id: "office",
      nameTh: "สายงานพาณิชย์ การเงิน และวิจัยในออฟฟิศ (Commercial, Finance & R&D Office Division)",
      zoneId: "office",
      icon: "🏢",
      roles: ["sales", "admin", "engineer"],
      descriptionTh: "เจรจาดีลธุรกิจกับบริษัทคู่ค้า B2B จัดซื้อวัตถุดิบต้นน้ำ บริหารบัญชี/ใบแจ้งหนี้ และวิจัยพัฒนาแบบแปลนสินค้าใหม่"
    },
    factory: {
      id: "factory",
      nameTh: "สายงานปฏิบัติการโรงงานและโลจิสติกส์ (Manufacturing Plant & Supply Chain Division)",
      zoneId: "factory",
      icon: "🏭",
      roles: ["assembler", "inspector", "logistics"],
      descriptionTh: "เดินเครื่องสายการผลิต ประกอบชิ้นงาน ตรวจสอบคุณภาพ QC/QA แพ็กสินค้าลงกล่อง และปล่อยรถบรรทุกจัดส่งลูกค้า"
    }
  });

  const ROLE_DEPARTMENTS = deepFreeze({
    coordinator: {
      roleId: "coordinator",
      divisionId: "executive",
      divisionNameTh: "สายงานบริหารสูงสุดและทรัพยากรบุคคล (Executive & HR Division)",
      departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร (CEO & Corporate HR Department)",
      zoneTh: "อาคารสำนักงานใหญ่ (Office HQ)",
      coreDutiesTh: "กำหนดกลยุทธ์บริษัท บริหารสภาพคล่อง ลงทุนก่อสร้างอาคาร คัดเลือกคนเข้าทำงาน และประเมินเลื่อนขั้น"
    },
    sales: {
      roleId: "sales",
      divisionId: "office",
      divisionNameTh: "สายงานพาณิชย์และบริหารในออฟฟิศ (Commercial & Office Division)",
      departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B (Commercial & B2B Sales Department)",
      zoneTh: "อาคารสำนักงานใหญ่ (Office HQ)",
      coreDutiesTh: "ติดต่อบริษัทคู่ค้า เจรจาต่อรองราคาขาย เงื่อนไขมัดจำ และคัดเลือกคำสั่งซื้อที่ทำกำไรสูงสุด"
    },
    admin: {
      roleId: "admin",
      divisionId: "office",
      divisionNameTh: "สายงานพาณิชย์และบริหารในออฟฟิศ (Commercial & Office Division)",
      departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน (Procurement & Finance Department)",
      zoneTh: "อาคารสำนักงานใหญ่ / คลังวัตถุดิบ",
      coreDutiesTh: "วางแผนสั่งซื้อวัตถุดิบจากซัพพลายเออร์ ออกใบ PO สร้างเครดิตการค้า และวางบิลเรียกเก็บเงินลูกค้า (Invoice)"
    },
    engineer: {
      roleId: "engineer",
      divisionId: "office",
      divisionNameTh: "สายงานวิจัยพัฒนาและวิศวกรรม (R&D & Engineering Division)",
      departmentTh: "ฝ่ายวิจัยผลิตภัณฑ์และวิศวกรรมระบบ (R&D & Process Engineering Department)",
      zoneTh: "อาคารแล็บวิจัย (R&D Lab) & โรงงาน",
      coreDutiesTh: "วิจัยปลดล็อกสินค้าอุตสาหกรรมใหม่ ปรับปรุงกระบวนการผลิต และซ่อมบำรุงเครื่องจักรเชิงป้องกัน"
    },
    assembler: {
      roleId: "assembler",
      divisionId: "factory",
      divisionNameTh: "สายงานปฏิบัติการโรงงานผลิต (Manufacturing Operations Division)",
      departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน (Production & Assembly Department)",
      zoneTh: "อาคารโรงงานผลิต (Production Lines A/B/C/D)",
      coreDutiesTh: "เบิกวัตถุดิบตามสูตร BOM เดินเครื่องจักรประกอบชิ้นงาน และแก้ไขงานซ่อม (Rework)"
    },
    inspector: {
      roleId: "inspector",
      divisionId: "factory",
      divisionNameTh: "สายงานปฏิบัติการโรงงานผลิต (Manufacturing Operations Division)",
      departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (Quality Control & Assurance Department)",
      zoneTh: "แท่นตรวจมาตรฐานโรงงาน & ห้องแล็บ QA",
      coreDutiesTh: "ตรวจสอบความสมบูรณ์ของชิ้นงาน คัดกรองของเสียก่อนส่งมอบ และรักษามาตรฐานชื่อเสียงบริษัท"
    },
    logistics: {
      roleId: "logistics",
      divisionId: "factory",
      divisionNameTh: "สายงานปฏิบัติการโรงงานและคลังสินค้า (Warehouse & Fleet Division)",
      departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง (Warehouse & Outbound Logistics Department)",
      zoneTh: "อาคารคลังสินค้าและศูนย์กระจายสินค้าส่งออก",
      coreDutiesTh: "ตรวจรับวัตถุดิบเข้าคลัง แพ็กสินค้าสำเร็จรูปลงหีบห่อ และจัดส่งขึ้นรถบรรทุกไปถึงบริษัทลูกค้า"
    }
  });

  // 4-Tier Multi-Branch Organizational Hierarchy Tree:
  // Tier 1: Division (สายงาน) -> Tier 2: Department (ฝ่าย) -> Tier 3: Section (แผนก) -> Tier 4: Group/Line (กลุ่มงาน/ไลน์ย่อย)
  const ORG_TREE = deepFreeze({
    coordinator: {
      divisionId: "executive",
      divisionNameTh: "สายงานบริหารสูงสุดและกลยุทธ์องค์กร",
      departments: [
        {
          id: "dept_ceo_office",
          nameTh: "ฝ่ายสำนักประธานบริหารและกลยุทธ์องค์กร",
          sections: [
            {
              id: "sec_strategy",
              nameTh: "แผนกวางแผนกลยุทธ์และนักลงทุนสัมพันธ์",
              groups: [
                { id: "grp_corp_plan", nameTh: "กลุ่มยุทธศาสตร์นิคมและการลงทุน" },
                { id: "grp_board_gov", nameTh: "กลุ่มกำกับกิจการและบริหารความเสี่ยง" }
              ]
            },
            {
              id: "sec_hr_org",
              nameTh: "แผนกทรัพยากรบุคคลและพัฒนาองค์กร",
              groups: [
                { id: "grp_recruitment", nameTh: "กลุ่มสรรหาว่าจ้างและประเมินผล" },
                { id: "grp_welfare", nameTh: "กลุ่มสวัสดิการและวัฒนธรรมองค์กร" }
              ]
            }
          ]
        }
      ]
    },
    sales: {
      divisionId: "office",
      divisionNameTh: "สายงานพาณิชย์และบริหารสำนักงาน",
      departments: [
        {
          id: "dept_commercial_b2b",
          nameTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B",
          sections: [
            {
              id: "sec_domestic_b2b",
              nameTh: "แผนกขายลูกค้าองค์กรและอุตสาหกรรมในประเทศ",
              groups: [
                { id: "grp_sales_tech", nameTh: "กลุ่มลูกค้าสมาร์ตเทคและอิเล็กทรอนิกส์" },
                { id: "grp_sales_auto", nameTh: "กลุ่มลูกค้ายานยนต์ EV และพลังงาน" }
              ]
            },
            {
              id: "sec_export_trade",
              nameTh: "แผนกการค้าส่งออกและพันธมิตรข้ามชาติ",
              groups: [
                { id: "grp_sales_apac", nameTh: "กลุ่มคู่ค้าส่งออกญี่ปุ่น-เอเชียแปซิฟิก" },
                { id: "grp_sales_key", nameTh: "กลุ่มบริหารสัญญาเมกะโปรเจกต์ B2B" }
              ]
            }
          ]
        }
      ]
    },
    admin: {
      divisionId: "office",
      divisionNameTh: "สายงานพาณิชย์และบริหารสำนักงาน",
      departments: [
        {
          id: "dept_procurement_fin",
          nameTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน",
          sections: [
            {
              id: "sec_procurement",
              nameTh: "แผนกจัดซื้อวัตถุดิบและบริหารซัพพลายเออร์",
              groups: [
                { id: "grp_proc_semi", nameTh: "กลุ่มจัดซื้อเซมิคอนดักเตอร์และโลหะ" },
                { id: "grp_proc_bio", nameTh: "กลุ่มจัดซื้อสารสกัดและบรรจุภัณฑ์" }
              ]
            },
            {
              id: "sec_finance_acct",
              nameTh: "แผนกบัญชีต้นทุน การเงิน และเร่งรัดหนี้สิน",
              groups: [
                { id: "grp_acct_ar", nameTh: "กลุ่มวางบิล Invoice และบริหารลูกหนี้" },
                { id: "grp_acct_cost", nameTh: "กลุ่มบัญชีต้นทุนและงบการเงินนิคม" }
              ]
            }
          ]
        }
      ]
    },
    engineer: {
      divisionId: "office",
      divisionNameTh: "สายงานวิจัยพัฒนาและวิศวกรรมอุตสาหกรรม",
      departments: [
        {
          id: "dept_rnd_engineering",
          nameTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ",
          sections: [
            {
              id: "sec_product_rnd",
              nameTh: "แผนกวิจัยและออกแบบผลิตภัณฑ์ใหม่ (R&D)",
              groups: [
                { id: "grp_rnd_elec", nameTh: "กลุ่มวิจัยสมาร์ตดีไวซ์และเซนเซอร์ AI" },
                { id: "grp_rnd_green", nameTh: "กลุ่มวิจัยพลังงานสะอาดและชีวภาพ" }
              ]
            },
            {
              id: "sec_maint_automation",
              nameTh: "แผนกวิศวกรรมระบบและซ่อมบำรุงเครื่องกล",
              groups: [
                { id: "grp_maint_pm", nameTh: "กลุ่มซ่อมบำรุงเชิงป้องกัน (PM Workshop)" },
                { id: "grp_automation_line", nameTh: "กลุ่มวิศวกรรมหุ่นยนต์และสายพานอัตโนมัติ" }
              ]
            }
          ]
        }
      ]
    },
    assembler: {
      divisionId: "factory",
      divisionNameTh: "สายงานปฏิบัติการโรงงานและซัพพลายเชน",
      departments: [
        {
          id: "dept_manufacturing",
          nameTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน",
          sections: [
            {
              id: "sec_line_a",
              nameTh: "แผนกสายการผลิตหลักที่ 1 (Main Line A)",
              groups: [
                { id: "grp_line_a1", nameTh: "กลุ่มประกอบแผงวงจร SMT-A1", lineId: "lineA" },
                { id: "grp_line_a2", nameTh: "กลุ่มประกอบตัวถังและกลไก A2", lineId: "lineA" }
              ]
            },
            {
              id: "sec_line_b",
              nameTh: "แผนกสายการผลิตอัจฉริยะที่ 2 (Smart Line B)",
              groups: [
                { id: "grp_line_b1", nameTh: "กลุ่มประกอบความแม่นยำสูง B1", lineId: "lineB" },
                { id: "grp_line_b2", nameTh: "กลุ่มเทคนิคปรับแต่งและงานซ่อม Rework B2", lineId: "lineB" }
              ]
            },
            {
              id: "sec_line_c",
              nameTh: "แผนกสายการผลิตอัตโนมัติที่ 3 (Mega Line C)",
              groups: [
                { id: "grp_line_c1", nameTh: "กลุ่มหุ่นยนต์ประกอบความเร็วสูง C1", lineId: "lineC" },
                { id: "grp_line_c2", nameTh: "กลุ่มขึ้นรูปโลหะและเมคคาทรอนิกส์ C2", lineId: "lineC" }
              ]
            },
            {
              id: "sec_line_d",
              nameTh: "แผนกสายการผลิตปลอดเชื้อและพลังงานที่ 4 (Clean & HV Line D)",
              groups: [
                { id: "grp_line_d1", nameTh: "กลุ่มสกัดและบรรจุคลีนรูมปลอดเชื้อ D1", lineId: "lineD" },
                { id: "grp_line_d2", nameTh: "กลุ่มประกอบเซลล์พลังงานแรงดันสูง D2", lineId: "lineD" }
              ]
            }
          ]
        }
      ]
    },
    inspector: {
      divisionId: "factory",
      divisionNameTh: "สายงานปฏิบัติการโรงงานและซัพพลายเชน",
      departments: [
        {
          id: "dept_quality_assurance",
          nameTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)",
          sections: [
            {
              id: "sec_inline_qc",
              nameTh: "แผนกควบคุมคุณภาพในสายการผลิต (IQC & IPQC)",
              groups: [
                { id: "grp_qc_iqc", nameTh: "กลุ่มตรวจรับวัตถุดิบต้นน้ำ (IQC)" },
                { id: "grp_qc_ipqc", nameTh: "กลุ่มตรวจคุณภาพระหว่างสายพาน (IPQC)" }
              ]
            },
            {
              id: "sec_final_qa",
              nameTh: "แผนกประกันคุณภาพส่งออกและห้องแล็บมาตรฐาน (OQA & ISO)",
              groups: [
                { id: "grp_qa_oqa", nameTh: "กลุ่มตรวจรับรองสินค้าก่อนส่งออก (OQA)" },
                { id: "grp_qa_isolab", nameTh: "กลุ่มปฏิบัติการทดสอบความทนทาน ISO/IEC" }
              ]
            }
          ]
        }
      ]
    },
    logistics: {
      divisionId: "factory",
      divisionNameTh: "สายงานปฏิบัติการโรงงานและซัพพลายเชน",
      departments: [
        {
          id: "dept_warehouse_logistics",
          nameTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง",
          sections: [
            {
              id: "sec_warehouse_ops",
              nameTh: "แผนกคลังวัตถุดิบและบรรจุภัณฑ์สำเร็จรูป",
              groups: [
                { id: "grp_wh_raw", nameTh: "กลุ่มคลังวัตถุดิบและไซโลต้นน้ำ" },
                { id: "grp_wh_pack", nameTh: "กลุ่มสายพานแพ็กกิ้งและคลังสินค้าพร้อมส่ง" }
              ]
            },
            {
              id: "sec_dispatch_fleet",
              nameTh: "แผนกศูนย์กระจายสินค้าและฟลีทขนส่ง B2B",
              groups: [
                { id: "grp_fleet_b2b", nameTh: "กลุ่มปล่อยรถบรรทุกส่งออกลูกค้าองค์กร" },
                { id: "grp_fleet_route", nameTh: "กลุ่มบริหารเส้นทางและพิธีการศุลกากร" }
              ]
            }
          ]
        }
      ]
    }
  });

  // 10-Level Realistic Corporate & Factory Job Grade Hierarchy (Lv.1 / G1 to Lv.10 / G10)
  // Research-grounded from manufacturing & corporate hierarchy standards:
  // Lv.1 Operator/Staff -> Lv.2 Senior -> Lv.3 Group/Line Leader -> Lv.4 Section Supervisor/Foreman ->
  // Lv.5 Asst. Dept Manager -> Lv.6 Department Manager -> Lv.7 Deputy Division Director ->
  // Lv.8 Division Director / Plant Manager -> Lv.9 EVP / C-Suite -> Lv.10 CEO / Managing Director
  const LEVEL_TIERS = deepFreeze({
    1: { level: 1, gradeCode: "G1", tierNameTh: "พนักงานปฏิบัติการระดับต้น (Operational Staff / Jr. Operator)", chainRoleTh: "ผู้ปฏิบัติงานหน้างาน", reportsToLevel: 3 },
    2: { level: 2, gradeCode: "G2", tierNameTh: "พนักงานชำนาญการ / อาวุโส (Senior Specialist / Skilled Tech)", chainRoleTh: "พี่เลี้ยงและผู้ชำนาญการเฉพาะทาง", reportsToLevel: 3 },
    3: { level: 3, gradeCode: "G3", tierNameTh: "หัวหน้ากลุ่มงาน / หัวหน้าชุดในไลน์ผลิต (Group / Line Leader)", chainRoleTh: "หัวหน้ากลุ่มย่อย คุมทีม 4-6 คน", reportsToLevel: 4 },
    4: { level: 4, gradeCode: "G4", tierNameTh: "หัวหน้าหมวด / หัวหน้ากะสายการผลิต (Section Supervisor / Shift Foreman)", chainRoleTh: "หัวหน้าหมวด/หัวหน้ากะ คุมหลายกลุ่มงาน", reportsToLevel: 5 },
    5: { level: 5, gradeCode: "G5", tierNameTh: "รองหัวหน้าแผนก / ผู้ช่วยผู้จัดการแผนก (Assistant Department Manager)", chainRoleTh: "รองหัวหน้าแผนก ช่วยบริหารแผนก", reportsToLevel: 6 },
    6: { level: 6, gradeCode: "G6", tierNameTh: "หัวหน้าแผนก / ผู้จัดการแผนก (Department Manager)", chainRoleTh: "หัวหน้าแผนก คุมทุกกลุ่มในแผนก", reportsToLevel: 7 },
    7: { level: 7, gradeCode: "G7", tierNameTh: "รองหัวหน้าฝ่าย / รองผู้อำนวยการฝ่าย (Deputy Division Director / Deputy Plant Mgr)", chainRoleTh: "รองหัวหน้าฝ่าย กำกับหลายแผนก", reportsToLevel: 8 },
    8: { level: 8, gradeCode: "G8", tierNameTh: "หัวหน้าฝ่าย / ผู้อำนวยการฝ่าย / ผู้จัดการโรงงาน (Division Director / Plant GM)", chainRoleTh: "หัวหน้าฝ่าย/ผู้จัดการโรงงาน คุมทั้งฝ่าย", reportsToLevel: 9 },
    9: { level: 9, gradeCode: "G9", tierNameTh: "รองกรรมการผู้จัดการใหญ่ / ผู้บริหาร C-Suite (EVP / Chief Officer)", chainRoleTh: "ผู้บริหารสูงสุดสายงาน (C-Level / EVP)", reportsToLevel: 10 },
    10: { level: 10, gradeCode: "G10", tierNameTh: "ประธานเจ้าหน้าที่บริหารสูงสุด (Chief Executive Officer - CEO)", chainRoleTh: "ผู้นำสูงสุดขององค์กร (CEO)", reportsToLevel: 10 }
  });

  const CAREER_LADDERS = deepFreeze({
    sales: [
      { level: 1, gradeCode: "G1", titleTh: "เจ้าหน้าที่ฝ่ายขาย B2B ระดับต้น (Jr. B2B Sales Representative)", badge: "Lv.1", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "ติดต่อลูกค้าองค์กรและจัดทำใบเสนอราคาเบื้องต้น", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0 },
      { level: 2, gradeCode: "G2", titleTh: "เจ้าหน้าที่บริหารลูกค้าองค์กรอาวุโส (Sr. Key Account Executive)", badge: "Lv.2", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "เจรจาต่อรองราคาขายและเงื่อนไขมัดจำกับคู่ค้ารายใหญ่", minTasks: 2, minSkill: 48, minTenureDays: 2, wageBonus: 3500, mentorPower: 0.1 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มงานขายอุตสาหกรรม (B2B Sales Group Leader)", badge: "Lv.3", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "นำกลุ่มย่อยทีมขาย B2B ดูแลโควตาลูกค้าประจำกลุ่ม", minTasks: 5, minSkill: 54, minTenureDays: 4, wageBonus: 5500, mentorPower: 0.16 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดการค้าและลูกค้าสัมพันธ์ (Commercial Section Supervisor)", badge: "Lv.4", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "กำกับหมวดงานขายและประเมินผลงานหัวหน้ากลุ่มขาย", minTasks: 9, minSkill: 58, minTenureDays: 6, wageBonus: 8000, mentorPower: 0.22 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกขายและพัฒนาธุรกิจ (Asst. Commercial Sales Manager)", badge: "Lv.5", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "ช่วยบริหารแผนกขาย B2B และตรวจสอบสัญญาการค้า", minTasks: 13, minSkill: 61, minTenureDays: 9, wageBonus: 10500, mentorPower: 0.27 },
      { level: 6, gradeCode: "G6", titleTh: "หัวหน้าแผนกขายและการพาณิชย์ (Commercial Sales Department Manager)", badge: "Lv.6", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "บริหารแผนกขายทั้งหมด อนุมัติส่วนลดและประเมินเลื่อนขั้นในแผนก", minTasks: 18, minSkill: 64, minTenureDays: 12, wageBonus: 13500, mentorPower: 0.32 },
      { level: 7, gradeCode: "G7", titleTh: "รองผู้อำนวยการฝ่ายพาณิชย์และส่งออก (Deputy Commercial Director)", badge: "Lv.7", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "กำกับดูแลทั้งแผนกขายในประเทศและแผนกส่งออก", minTasks: 24, minSkill: 67, minTenureDays: 15, wageBonus: 17000, mentorPower: 0.37 },
      { level: 8, gradeCode: "G8", titleTh: "ผู้อำนวยการฝ่ายการพาณิชย์ (Commercial Division Director)", badge: "Lv.8", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "บริหารสายงานพาณิชย์ทั้งหมดและกำหนดเป้ายอดขายรายไตรมาส", minTasks: 30, minSkill: 70, minTenureDays: 19, wageBonus: 21000, mentorPower: 0.42 },
      { level: 9, gradeCode: "G9", titleTh: "รองกรรมการผู้จัดการใหญ่สายพาณิชย์ (EVP & Chief Commercial Officer - CCO)", badge: "Lv.9", division: "executive", departmentTh: "คณะผู้บริหารระดับสูงสายพาณิชย์", dutyTh: "กำหนดยุทธศาสตร์การตลาดระดับประเทศและดีลพันธมิตรข้ามชาติ", minTasks: 38, minSkill: 74, minTenureDays: 24, wageBonus: 26000, mentorPower: 0.48 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสายพาณิชย์และองค์กร (President & Co-CEO)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดสายพาณิชย์และยุทธศาสตร์การเติบโตของเครือบริษัท", minTasks: 48, minSkill: 78, minTenureDays: 30, wageBonus: 32000, mentorPower: 0.55 }
    ],
    admin: [
      { level: 1, gradeCode: "G1", titleTh: "เจ้าหน้าที่จัดซื้อและบัญชีระดับต้น (Jr. Procurement & Accounting Staff)", badge: "Lv.1", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "ออกใบสั่งซื้อ PO และจัดทำใบแจ้งหนี้วางบิลลูกค้า", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0 },
      { level: 2, gradeCode: "G2", titleTh: "นักวางแผนซัพพลายเชนและบัญชีอาวุโส (Sr. Supply Chain & Finance Specialist)", badge: "Lv.2", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "บริหารสต็อกวัตถุดิบต้นน้ำและเจรจาเครดิตซัพพลายเออร์", minTasks: 2, minSkill: 48, minTenureDays: 2, wageBonus: 3500, mentorPower: 0.1 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มงานจัดซื้อและบัญชี (Procurement & Accounting Group Leader)", badge: "Lv.3", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "คุมกลุ่มงานออกใบสั่งซื้อ PO และตรวจสอบความถูกต้องของใบแจ้งหนี้", minTasks: 5, minSkill: 54, minTenureDays: 4, wageBonus: 5500, mentorPower: 0.16 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดซัพพลายเชนและงบประมาณ (Supply Chain Section Supervisor)", badge: "Lv.4", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "กำกับหมวดจัดซื้อและหมวดบัญชีต้นทุน ควบคุมสภาพคล่องรายวัน", minTasks: 9, minSkill: 58, minTenureDays: 6, wageBonus: 8000, mentorPower: 0.22 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกจัดซื้อและการเงิน (Asst. Procurement & Finance Manager)", badge: "Lv.5", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "ช่วยผู้จัดการแผนกบริหารสัญญาซัพพลายเออร์และวงเงินสินเชื่อ", minTasks: 13, minSkill: 61, minTenureDays: 9, wageBonus: 10500, mentorPower: 0.27 },
      { level: 6, gradeCode: "G6", titleTh: "หัวหน้าแผนกจัดซื้อและบัญชีการเงิน (Supply Chain & Finance Dept Manager)", badge: "Lv.6", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "บริหารแผนกจัดซื้อและบัญชี อนุมัติงบสั่งซื้อล็อตใหญ่และประเมินทีม", minTasks: 18, minSkill: 64, minTenureDays: 12, wageBonus: 13500, mentorPower: 0.32 },
      { level: 7, gradeCode: "G7", titleTh: "รองผู้อำนวยการฝ่ายการเงินและซัพพลายเชน (Deputy Finance & SCM Director)", badge: "Lv.7", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "กำกับดูแลทั้งแผนกจัดซื้อและแผนกบัญชีการเงินของบริษัท", minTasks: 24, minSkill: 67, minTenureDays: 15, wageBonus: 17000, mentorPower: 0.37 },
      { level: 8, gradeCode: "G8", titleTh: "ผู้อำนวยการฝ่ายการเงินและซัพพลายเชน (Finance & Supply Chain Director)", badge: "Lv.8", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "บริหารโครงสร้างต้นทุน งบดุล และเครือข่ายซัพพลายเออร์ทั้งหมด", minTasks: 30, minSkill: 70, minTenureDays: 19, wageBonus: 21000, mentorPower: 0.42 },
      { level: 9, gradeCode: "G9", titleTh: "รองกรรมการผู้จัดการใหญ่สายการเงิน (EVP & Chief Financial Officer - CFO)", badge: "Lv.9", division: "executive", departmentTh: "คณะผู้บริหารระดับสูงสายการเงิน", dutyTh: "บริหารความเสี่ยงทางการเงิน การลงทุนขยายนิคม และการเตรียม IPO", minTasks: 38, minSkill: 74, minTenureDays: 24, wageBonus: 26000, mentorPower: 0.48 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสายการเงินและองค์กร (President & CFO Executive)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดด้านยุทธศาสตร์การเงินและธรรมาภิบาลขององค์กร", minTasks: 48, minSkill: 78, minTenureDays: 30, wageBonus: 32000, mentorPower: 0.55 }
    ],
    engineer: [
      { level: 1, gradeCode: "G1", titleTh: "วิศวกรวิจัยและกระบวนการผลิตระดับต้น (Jr. R&D & Process Engineer)", badge: "Lv.1", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "วิจัยพัฒนาผลิตภัณฑ์ใหม่และดูแลความพร้อมเครื่องจักร", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0.05 },
      { level: 2, gradeCode: "G2", titleTh: "วิศวกรระบบและเครื่องกลอาวุโส (Sr. Industrial & R&D Engineer)", badge: "Lv.2", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "พัฒนาแบบแปลนขั้นสูงและซ่อมบำรุงเชิงป้องกัน (PM)", minTasks: 2, minSkill: 50, minTenureDays: 2, wageBonus: 4500, mentorPower: 0.12 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มวิศวกรรมและวิจัย (Engineering & R&D Group Leader)", badge: "Lv.3", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "นำกลุ่มย่อยวิศวกรวิจัยและกลุ่มซ่อมบำรุงเครื่องจักรโรงงาน", minTasks: 5, minSkill: 55, minTenureDays: 4, wageBonus: 6500, mentorPower: 0.18 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดวิศวกรรมและนวัตกรรม (Engineering Section Supervisor)", badge: "Lv.4", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "กำกับหมวดวิจัยผลิตภัณฑ์และหมวดวิศวกรรมระบบอัตโนมัติ", minTasks: 9, minSkill: 59, minTenureDays: 6, wageBonus: 9000, mentorPower: 0.24 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกวิจัยและวิศวกรรม (Asst. R&D & Engineering Manager)", badge: "Lv.5", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "ช่วยบริหารแผนก R&D และวางมาตรฐานกระบวนการผลิต 5 ระบบ", minTasks: 13, minSkill: 62, minTenureDays: 9, wageBonus: 11500, mentorPower: 0.29 },
      { level: 6, gradeCode: "G6", titleTh: "หัวหน้าแผนกวิจัยและวิศวกรรม (R&D & Engineering Dept Manager)", badge: "Lv.6", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "บริหารแผนกวิจัยและซ่อมบำรุง อนุมัติสิทธิบัตรและประเมินวิศวกร", minTasks: 18, minSkill: 65, minTenureDays: 12, wageBonus: 14500, mentorPower: 0.34 },
      { level: 7, gradeCode: "G7", titleTh: "รองผู้อำนวยการฝ่ายเทคโนโลยีและวิศวกรรม (Deputy Engineering Director)", badge: "Lv.7", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "กำกับดูแลแล็บวิจัยและโรงซ่อมบำรุงเครื่องกลทั้งนิคม", minTasks: 24, minSkill: 68, minTenureDays: 15, wageBonus: 18000, mentorPower: 0.39 },
      { level: 8, gradeCode: "G8", titleTh: "ผู้อำนวยการฝ่ายวิจัยและวิศวกรรม (Engineering & R&D Division Director)", badge: "Lv.8", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "บริหารสายงานวิศวกรรมและวางผังเทคโนโลยีสายการผลิตใหม่", minTasks: 30, minSkill: 71, minTenureDays: 19, wageBonus: 22500, mentorPower: 0.44 },
      { level: 9, gradeCode: "G9", titleTh: "รองกรรมการผู้จัดการใหญ่สายเทคโนโลยี (EVP & Chief Technology Officer - CTO)", badge: "Lv.9", division: "executive", departmentTh: "คณะผู้บริหารระดับสูงสายเทคโนโลยี", dutyTh: "ขับเคลื่อนนวัตกรรมองค์กรและระบบโรงงานอัจฉริยะครบวงจร", minTasks: 38, minSkill: 75, minTenureDays: 24, wageBonus: 27500, mentorPower: 0.5 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสายเทคโนโลยีและนวัตกรรม (President & Chief Scientist)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดด้านวิศวกรรมและเทคโนโลยีอุตสาหกรรมระดับประเทศ", minTasks: 48, minSkill: 79, minTenureDays: 30, wageBonus: 34000, mentorPower: 0.56 }
    ],
    assembler: [
      { level: 1, gradeCode: "G1", titleTh: "พนักงานฝ่ายผลิตหน้าไลน์ (Production Line Operator)", badge: "Lv.1", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "เบิกวัตถุดิบตาม BOM เดินเครื่องจักรและประกอบชิ้นงานหน้าไลน์", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0 },
      { level: 2, gradeCode: "G2", titleTh: "ช่างเทคนิคสายการผลิตชำนาญการ (Sr. Line Technician)", badge: "Lv.2", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "คุมเครื่องจักรความแม่นยำสูง แก้ไขงาน Rework และสอนงานช่างใหม่", minTasks: 3, minSkill: 48, minTenureDays: 2, wageBonus: 3500, mentorPower: 0.12 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มในไลน์ผลิต (Production Line Group Leader)", badge: "Lv.3", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "คุมกลุ่มย่อยในสายพานการผลิต ตรวจสอบจังหวะงานและช่วยลูกทีมหน้าไลน์", minTasks: 6, minSkill: 54, minTenureDays: 4, wageBonus: 5500, mentorPower: 0.18 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดและหัวหน้ากะสายการผลิต (Production Shift Foreman / Supervisor)", badge: "Lv.4", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "ควบคุมโควตาการผลิตประจำกะ ดูแลความปลอดภัย และประเมินหัวหน้ากลุ่ม", minTasks: 10, minSkill: 58, minTenureDays: 6, wageBonus: 8000, mentorPower: 0.24 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกสายการผลิต (Asst. Production Department Manager)", badge: "Lv.5", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "ช่วยผู้จัดการแผนกบริหารตารางเดินเครื่องจักรและเกลี่ยกำลังคนระหว่างไลน์", minTasks: 14, minSkill: 61, minTenureDays: 9, wageBonus: 10500, mentorPower: 0.29 },
      { level: 6, gradeCode: "G6", titleTh: "หัวหน้าแผนกการผลิตประจำไลน์ (Production Department Manager)", badge: "Lv.6", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "บริหารแผนกสายการผลิต (Line A/B/C/D) และอนุมัติเลื่อนตำแหน่งในแผนก", minTasks: 19, minSkill: 64, minTenureDays: 12, wageBonus: 13500, mentorPower: 0.34 },
      { level: 7, gradeCode: "G7", titleTh: "รองหัวหน้าฝ่ายการผลิต / รองผู้จัดการโรงงาน (Deputy Plant & Production Director)", badge: "Lv.7", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "กำกับดูแลทุกแผนกสายการผลิตและประสานงานกับฝ่าย QC/คลังสินค้า", minTasks: 25, minSkill: 67, minTenureDays: 15, wageBonus: 17000, mentorPower: 0.39 },
      { level: 8, gradeCode: "G8", titleTh: "หัวหน้าฝ่ายการผลิต / ผู้จัดการโรงงาน (Plant General Manager / Production Director)", badge: "Lv.8", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "ผู้บัญชาการสูงสุดในโรงงาน คุมทุกอาคารการผลิตและกำหนดโหมดเดินเครื่อง", minTasks: 32, minSkill: 70, minTenureDays: 19, wageBonus: 21500, mentorPower: 0.45 },
      { level: 9, gradeCode: "G9", titleTh: "รองกรรมการผู้จัดการใหญ่สายอุตสาหกรรม (EVP of Manufacturing Operations)", badge: "Lv.9", division: "executive", departmentTh: "คณะผู้บริหารระดับสูงสายโรงงาน", dutyTh: "บริหารเครือข่ายโรงงานทั้งนิคมและวางยุทธศาสตร์การแตกไลน์ผลิตใหม่", minTasks: 40, minSkill: 74, minTenureDays: 24, wageBonus: 26500, mentorPower: 0.5 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสายปฏิบัติการโรงงาน (President of Industrial Operations)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดสายอุตสาหกรรมการผลิตของเครือบริษัท", minTasks: 50, minSkill: 78, minTenureDays: 30, wageBonus: 32500, mentorPower: 0.55 }
    ],
    inspector: [
      { level: 1, gradeCode: "G1", titleTh: "เจ้าหน้าที่ตรวจสอบคุณภาพหน้าไลน์ (QC Line Inspector)", badge: "Lv.1", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "ตรวจสอบคุณภาพชิ้นงานหน้าไลน์และคัดแยกของเสียส่งซ่อม", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0 },
      { level: 2, gradeCode: "G2", titleTh: "ผู้ตรวจสอบมาตรฐานคุณภาพอาวุโส (Sr. QA/IQC Auditor)", badge: "Lv.2", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "ตรวจรับรองมาตรฐานสินค้าสำเร็จรูปและตรวจรับวัตถุดิบ IQC", minTasks: 3, minSkill: 48, minTenureDays: 2, wageBonus: 3500, mentorPower: 0.12 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มตรวจสอบคุณภาพประจำไลน์ (QC Group Leader)", badge: "Lv.3", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "คุมกลุ่มผู้ตรวจ QC ประจำสายพานและสอบเทียบเครื่องมือวัด", minTasks: 6, minSkill: 54, minTenureDays: 4, wageBonus: 5500, mentorPower: 0.18 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดควบคุมคุณภาพกะการผลิต (QC Shift Supervisor)", badge: "Lv.4", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "กำกับหมวดตรวจคุณภาพประจำกะและอนุมัติปล่อยล็อตสินค้าผ่านเกณฑ์", minTasks: 10, minSkill: 58, minTenureDays: 6, wageBonus: 8000, mentorPower: 0.24 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกควบคุมและประกันคุณภาพ (Asst. QC/QA Department Manager)", badge: "Lv.5", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "ช่วยบริหารแผนก QC/QA และวิเคราะห์สาเหตุของเสียร่วมกับวิศวกร", minTasks: 14, minSkill: 61, minTenureDays: 9, wageBonus: 10500, mentorPower: 0.29 },
      { level: 6, gradeCode: "G6", titleTh: "หัวหน้าแผนกควบคุมและประกันคุณภาพ (QC/QA Department Manager)", badge: "Lv.6", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "บริหารแผนกคุณภาพ กำกับมาตรฐาน Zero-Defect และประเมินทีม QC", minTasks: 19, minSkill: 64, minTenureDays: 12, wageBonus: 13500, mentorPower: 0.34 },
      { level: 7, gradeCode: "G7", titleTh: "รองผู้อำนวยการฝ่ายประกันคุณภาพ (Deputy Quality Assurance Director)", badge: "Lv.7", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "กำกับดูแลทั้งแผนก IQC/IPQC และห้องแล็บทดสอบมาตรฐานส่งออก", minTasks: 25, minSkill: 67, minTenureDays: 15, wageBonus: 17000, mentorPower: 0.39 },
      { level: 8, gradeCode: "G8", titleTh: "ผู้อำนวยการฝ่ายประกันคุณภาพและมาตรฐานสากล (Quality Assurance Director)", badge: "Lv.8", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "บริหารระบบมาตรฐาน ISO/IPC ทั้งนิคมและรับรองคุณภาพระดับโลก", minTasks: 32, minSkill: 70, minTenureDays: 19, wageBonus: 21000, mentorPower: 0.44 },
      { level: 9, gradeCode: "G9", titleTh: "รองกรรมการผู้จัดการใหญ่สายคุณภาพและความยั่งยืน (EVP & Chief Quality Officer)", badge: "Lv.9", division: "executive", departmentTh: "คณะผู้บริหารระดับสูงสายคุณภาพ", dutyTh: "กำหนดนโยบายคุณภาพสูงสุดและธรรมาภิบาลสิ่งแวดล้อม ESG", minTasks: 40, minSkill: 74, minTenureDays: 24, wageBonus: 26000, mentorPower: 0.49 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสายมาตรฐานและคุณภาพองค์กร (President of Quality & ESG)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดด้านมาตรฐานคุณภาพและความเชื่อมั่นระดับนานาชาติ", minTasks: 50, minSkill: 78, minTenureDays: 30, wageBonus: 32000, mentorPower: 0.55 }
    ],
    logistics: [
      { level: 1, gradeCode: "G1", titleTh: "เจ้าหน้าที่คลังสินค้าและแพ็กกิ้ง (Warehouse & Packing Operator)", badge: "Lv.1", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "ตรวจรับวัตถุดิบเข้าคลังและแพ็กสินค้าสำเร็จรูปลงหีบห่อ", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0 },
      { level: 2, gradeCode: "G2", titleTh: "เจ้าหน้าที่ควบคุมสต็อกและจัดส่งอาวุโส (Sr. Dispatch & Inventory Specialist)", badge: "Lv.2", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "บริหารคิวรถขนส่งขาออกและควบคุมบัญชีสต็อกสินค้าสำเร็จรูป", minTasks: 3, minSkill: 48, minTenureDays: 2, wageBonus: 3500, mentorPower: 0.11 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มคลังสินค้าและแพ็กกิ้ง (Warehouse & Packing Group Leader)", badge: "Lv.3", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "คุมกลุ่มงานแพ็กกิ้งและกลุ่มท่าเทียบรถรับ-ส่งสินค้า", minTasks: 6, minSkill: 54, minTenureDays: 4, wageBonus: 5500, mentorPower: 0.17 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดคลังสินค้าและปล่อยรถขนส่ง (Warehouse & Fleet Supervisor)", badge: "Lv.4", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "กำกับหมวดคลังวัตถุดิบและหมวดปล่อยขบวนรถบรรทุกส่งออก", minTasks: 10, minSkill: 58, minTenureDays: 6, wageBonus: 8000, mentorPower: 0.23 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกคลังสินค้าและโลจิสติกส์ (Asst. Warehouse & Logistics Manager)", badge: "Lv.5", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "ช่วยผู้จัดการแผนกวางแผนเส้นทางรถบรรทุกและบริหารพื้นที่ไซโล", minTasks: 14, minSkill: 61, minTenureDays: 9, wageBonus: 10500, mentorPower: 0.28 },
      { level: 6, gradeCode: "G6", titleTh: "หัวหน้าแผนกคลังสินค้าและฟลีทขนส่ง (Warehouse & Fleet Dept Manager)", badge: "Lv.6", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "บริหารแผนกคลังสินค้าและศูนย์ส่งออก อนุมัติขบวนรถและประเมินทีม", minTasks: 19, minSkill: 64, minTenureDays: 12, wageBonus: 13500, mentorPower: 0.33 },
      { level: 7, gradeCode: "G7", titleTh: "รองผู้อำนวยการฝ่ายโลจิสติกส์และกระจายสินค้า (Deputy Logistics Director)", badge: "Lv.7", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "กำกับดูแลคลังวัตถุดิบต้นน้ำและศูนย์กระจายสินค้าส่งออกทั้งหมด", minTasks: 25, minSkill: 67, minTenureDays: 15, wageBonus: 17000, mentorPower: 0.38 },
      { level: 8, gradeCode: "G8", titleTh: "ผู้อำนวยการฝ่ายคลังพัสดุและโลจิสติกส์ (Logistics & Distribution Director)", badge: "Lv.8", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "บริหารเครือข่ายโลจิสติกส์และฟลีทขนส่งทั่วประเทศของนิคม", minTasks: 32, minSkill: 70, minTenureDays: 19, wageBonus: 21000, mentorPower: 0.43 },
      { level: 9, gradeCode: "G9", titleTh: "รองกรรมการผู้จัดการใหญ่สายซัพพลายเชน (EVP & Chief Supply Chain Officer - CSCO)", badge: "Lv.9", division: "executive", departmentTh: "คณะผู้บริหารระดับสูงสายโลจิสติกส์", dutyTh: "กำหนดยุทธศาสตร์ห่วงโซ่อุปทานโลกและศูนย์กระจายสินค้าอัจฉริยะ", minTasks: 40, minSkill: 74, minTenureDays: 24, wageBonus: 26000, mentorPower: 0.48 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสายซัพพลายเชนและโลจิสติกส์ (President of Global Logistics)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดด้านเครือข่ายซัพพลายเชนและการค้าระหว่างประเทศ", minTasks: 50, minSkill: 78, minTenureDays: 30, wageBonus: 32000, mentorPower: 0.55 }
    ],
    coordinator: [
      { level: 1, gradeCode: "G1", titleTh: "เจ้าหน้าที่ประสานงานบริหารและทรัพยากรบุคคล (HR & Corporate Coordinator)", badge: "Lv.1", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "ประสานงานระหว่างออฟฟิศกับโรงงานและดูแลสวัสดิการพนักงาน", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0.08 },
      { level: 2, gradeCode: "G2", titleTh: "นักบริหารทรัพยากรบุคคลและกลยุทธ์อาวุโส (Sr. HR & Corporate Planner)", badge: "Lv.2", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "คัดกรองผู้สมัครงาน ประเมินความพึงพอใจ และวางแผนกำลังคน", minTasks: 2, minSkill: 50, minTenureDays: 2, wageBonus: 4500, mentorPower: 0.15 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มงานสรรหาและพัฒนาบุคลากร (HR & Talent Group Leader)", badge: "Lv.3", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "นำกลุ่มงานบริหารบุคคลและศูนย์ฝึกอบรมพัฒนาทักษะ", minTasks: 5, minSkill: 55, minTenureDays: 4, wageBonus: 6500, mentorPower: 0.21 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดบริหารงานบุคคลและปฏิบัติการ (HR & Operations Supervisor)", badge: "Lv.4", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "กำกับหมวดงานบุคคลและประสานแผนปฏิบัติการประจำสัปดาห์", minTasks: 9, minSkill: 59, minTenureDays: 6, wageBonus: 9000, mentorPower: 0.27 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกทรัพยากรบุคคลและกลยุทธ์ (Asst. HR & Strategy Manager)", badge: "Lv.5", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "ช่วยบริหารแผนกบุคคล โครงสร้างค่าจ้าง และสวัสดิการนิคม", minTasks: 13, minSkill: 62, minTenureDays: 9, wageBonus: 11500, mentorPower: 0.32 },
      { level: 6, gradeCode: "G6", titleTh: "ผู้จัดการแผนกทรัพยากรบุคคลและพัฒนาองค์กร (HR & Organization Dept Manager)", badge: "Lv.6", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "บริหารแผนกทรัพยากรบุคคลและกลั่นกรองบัญชีเลื่อนขั้นประจำวัน", minTasks: 18, minSkill: 65, minTenureDays: 12, wageBonus: 14500, mentorPower: 0.37 },
      { level: 7, gradeCode: "G7", titleTh: "รองผู้อำนวยการฝ่ายบริหารและทรัพยากรบุคคล (Deputy Corporate & HR Director)", badge: "Lv.7", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "กำกับดูแลแผนกกลยุทธ์และแผนกทรัพยากรบุคคลทั้งองค์กร", minTasks: 24, minSkill: 68, minTenureDays: 15, wageBonus: 18500, mentorPower: 0.42 },
      { level: 8, gradeCode: "G8", titleTh: "ผู้อำนวยการฝ่ายบริหารและปฏิบัติการองค์กร (Corporate Operations Director)", badge: "Lv.8", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "บูรณาการการทำงานระหว่างสายงานออฟฟิศและสายงานโรงงาน", minTasks: 30, minSkill: 71, minTenureDays: 19, wageBonus: 23000, mentorPower: 0.47 },
      { level: 9, gradeCode: "G9", titleTh: "กรรมการผู้จัดการและประธานเจ้าหน้าที่ปฏิบัติการ (Managing Director & COO)", badge: "Lv.9", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "กำกับดูแลทุกสายงานและบริหารการขยายตัวของนิคมอุตสาหกรรม", minTasks: 38, minSkill: 75, minTenureDays: 24, wageBonus: 28000, mentorPower: 0.52 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสูงสุด (Chief Executive Officer - CEO)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดขององค์กร กำหนดวิสัยทัศน์ การลงทุนก่อสร้างอาคาร และอนุมัติผู้บริหารระดับสูง", minTasks: 48, minSkill: 79, minTenureDays: 30, wageBonus: 35000, mentorPower: 0.6 }
    ]
  });

  // 5 Distinct Industrial Production Modes (การแตกไลน์และรูปแบบการผลิตเฉพาะทาง 5 ระบบ)
  const PRODUCTION_MODES = deepFreeze({
    smt_precision: {
      id: "smt_precision",
      nameTh: "สายประกอบไมโครอิเล็กทรอนิกส์ความแม่นยำสูง (SMT Surface-Mount Precision)",
      shortNameTh: "ประกอบวงจร SMT",
      icon: "🔬",
      preferredLines: ["lineA", "lineB"],
      speedModifier: 1.0,
      qualityBonus: 0.03,
      wearRate: 0.9,
      keyAptitudes: ["precision", "analytical"],
      descriptionTh: "ใช้หัววางชิปความละเอียดสูงและกล้อง AOI ตรวจจับจุดบัดกรี เหมาะกับอุปกรณ์สมาร์ตเทคและเซนเซอร์"
    },
    cnc_mechanical: {
      id: "cnc_mechanical",
      nameTh: "สายขึ้นรูปโลหะและประกอบกลไกหนัก (CNC Machining & Mechatronics)",
      shortNameTh: "กลไกหนัก CNC",
      icon: "⚙️",
      preferredLines: ["lineA", "lineC"],
      speedModifier: 1.04,
      qualityBonus: 0.01,
      wearRate: 1.15,
      keyAptitudes: ["dexterity", "stamina"],
      descriptionTh: "ใช้เครื่องกลึง CNC และแขนกลประกอบโครงสร้างโลหะทนแรงบิดสูง เหมาะกับชิ้นส่วนยานยนต์และโรโบติกส์"
    },
    cleanroom_batch: {
      id: "cleanroom_batch",
      nameTh: "สายสกัดและบรรจุปลอดเชื้อแบบล็อต (Cleanroom Sterile Batch Line)",
      shortNameTh: "คลีนรูมปลอดเชื้อ",
      icon: "🧪",
      preferredLines: ["lineB", "lineD"],
      speedModifier: 1.12,
      qualityBonus: 0.04,
      wearRate: 0.75,
      keyAptitudes: ["attention", "precision"],
      descriptionTh: "ควบคุมความดันอากาศและอุณหภูมิปลอดเชื้อ มาตรฐาน GMP/HACCP เหมาะกับอาหารเสริมและชีวภาพ"
    },
    high_voltage_cell: {
      id: "high_voltage_cell",
      nameTh: "สายประกอบเซลล์พลังงานและทดสอบแรงดันสูง (High-Voltage Power Integration)",
      shortNameTh: "เซลล์พลังงาน HV",
      icon: "⚡",
      preferredLines: ["lineC", "lineD"],
      speedModifier: 0.96,
      qualityBonus: 0.05,
      wearRate: 1.1,
      keyAptitudes: ["controlPrecision", "composure"],
      descriptionTh: "เชื่อมต่อโมดูลกักเก็บพลังงานและอินเวอร์เตอร์แรงดันสูง พร้อมห้องทดสอบการคายประจุนิรภัย"
    },
    automated_modular: {
      id: "automated_modular",
      nameTh: "สายประกอบโมดูลอัตโนมัติความเร็วสูง (High-Speed Automated Modular Line)",
      shortNameTh: "โมดูลอัตโนมัติ",
      icon: "🤖",
      preferredLines: ["lineB", "lineC", "lineD"],
      speedModifier: 1.15,
      qualityBonus: 0.02,
      wearRate: 1.0,
      keyAptitudes: ["organization", "dexterity"],
      descriptionTh: "สายพานโมดูลาร์ความเร็วสูงที่สลับรุ่นการผลิตได้ยืดหยุ่น รองรับคำสั่งซื้อ B2B ล็อตใหญ่"
    },
    milling_refining: {
      id: "milling_refining",
      nameTh: "สายโม่บด สกัดบริสุทธิ์ และแปรรูปวัตถุดิบกลางน้ำ (Continuous Milling & Refining)",
      shortNameTh: "โรงโม่/สกัดกลางน้ำ",
      icon: "🌾",
      preferredLines: ["lineA", "lineB", "lineD"],
      speedModifier: 1.14,
      qualityBonus: 0.03,
      wearRate: 0.85,
      keyAptitudes: ["attention", "stamina"],
      descriptionTh: "แปรรูปผลผลิตต้นน้ำ (ข้าวเปลือก ปาล์มดิบ อ้อย น้ำยาง แร่ซิลิกา) ให้เป็นวัตถุดิบกลางน้ำคุณภาพสูงและผลิตภัณฑ์สกัดบริสุทธิ์"
    },
    continuous_food_bake: {
      id: "continuous_food_bake",
      nameTh: "สายอบเบเกอรี่และแปรรูปอาหารต่อเนื่อง (Continuous Tunnel Oven & Food Line)",
      shortNameTh: "สายอบเบเกอรี่/อาหาร",
      icon: "🍞",
      preferredLines: ["lineA", "lineB", "lineD"],
      speedModifier: 1.16,
      qualityBonus: 0.04,
      wearRate: 0.82,
      keyAptitudes: ["tasteSmell", "dexterity"],
      descriptionTh: "เตาอบอุโมงค์ความร้อนคงที่และสายพานแปรรูปอาหารต่อเนื่อง เหมาะสำหรับขนมปังโฮลเกรน เบเกอรี่ และอาหารพร้อมทาน"
    },
    semiconductor_fab: {
      id: "semiconductor_fab",
      nameTh: "ห้องปฏิบัติการหลอมเวเฟอร์และชิปนาโน (Semiconductor Wafer Fab & Nano Line)",
      shortNameTh: "แฟบเซมิคอนดักเตอร์",
      icon: "💎",
      preferredLines: ["lineB", "lineC", "lineD"],
      speedModifier: 0.95,
      qualityBonus: 0.06,
      wearRate: 1.05,
      keyAptitudes: ["analytical", "precision"],
      descriptionTh: "กระบวนการลิโธกราฟีและประกอบชิปความละเอียดระดับนาโนเมตรจากแผ่นซิลิคอนเวเฟอร์และแร่บริสุทธิ์"
    }
  });

  // 3 Corporate Supply Chain & Make-or-Buy Strategies (วิสัยทัศน์การจัดหาวัตถุดิบและบูรณาการแนวดิ่ง)
  const SUPPLY_CHAIN_STRATEGIES = deepFreeze({
    asset_light: {
      id: "asset_light",
      nameTh: "กลยุทธ์ตัวเบา ซื้อวัตถุดิบสำเร็จรูป (Asset-Light / Pure Outsourcing)",
      shortNameTh: "ซื้อสำเร็จรูป (Asset-Light)",
      icon: "🛒",
      descTh: "ไม่เน้นถือครองไร่หรือเดินสายแปรรูปกลางน้ำ สั่งซื้อแป้ง น้ำมัน ชิป และวัตถุดิบจากซัพพลายเออร์ทั้งหมดเพื่อรักษาเงินสดสำรอง"
    },
    balanced_hybrid: {
      id: "balanced_hybrid",
      nameTh: "กลยุทธ์ผสมผสาน แปรรูปเสริมคู่ขนานตลาด (Balanced Make & Buy Hybrid)",
      shortNameTh: "ผสมผสาน (Hybrid Make-or-Buy)",
      icon: "⚖️",
      descTh: "แปรรูปวัตถุดิบจากสินทรัพย์ภายนอกที่มีอยู่เพื่อลดต้นทุน และสั่งซื้อส่วนที่ขาดจากซัพพลายเออร์ควบคู่กันอย่างยืดหยุ่น"
    },
    vertical_integration: {
      id: "vertical_integration",
      nameTh: "กลยุทธ์บูรณาการแนวดิ่ง ต้นน้ำ-กลางน้ำ-ปลายน้ำ (Full Vertical Integration)",
      shortNameTh: "กินรวบห่วงโซ่ (Vertical Integration)",
      icon: "🏭",
      descTh: "มุ่งลงทุนสินทรัพย์ต้นน้ำ (ไร่ข้าว สวนปาล์ม เหมืองแร่) และเดินเครื่องโรงโม่/โรงกลั่นกลางน้ำเต็มพิกัดเพื่อพึ่งพาตนเองและทำกำไรสูงสุด"
    }
  });

  // 12 External Assets & Concessions (หมวดสินทรัพย์ภายนอกนิคมที่ส่งผลจริงต่อวัตถุดิบ ต้นทุน โลจิสติกส์ พลังงาน และราคาขาย)
  const EXTERNAL_ASSETS = deepFreeze({
    jasmine_rice_farm: {
      id: "jasmine_rice_farm",
      nameTh: "ไร่ข้าวหอมมะลิและธัญพืชอินทรีย์ทุ่งกุลาร้องไห้",
      shortNameTh: "ไร่ข้าวหอมมะลิ/ธัญพืช",
      category: "agro_upstream",
      categoryNameTh: "เกษตรกรรมและอาหารต้นน้ำ",
      locationTh: "ร้อยเอ็ด / สุรินทร์",
      icon: "🌾",
      cost: 2200000,
      dailyUpkeep: 15000,
      dailyDividend: 45000,
      harvestYields: { paddy_grain: 8 },
      linkedChainId: "chain_grain_flour_bakery",
      operationalEffectsTh: [
        "เก็บเกี่ยว ข้าวเปลือกหอมมะลิและธัญพืช (paddy_grain) +8 ชิ้น/วัน ส่งเข้าคลังโรงงานฟรี",
        "ป้อนโรงโม่แป้งกลางน้ำเพื่อผลิต แป้งข้าวหอม/แป้งสาลี (artisan_flour) สำหรับทำขนมปังโฮลเกรนและอาหารพร้อมทาน",
        "ส่งข้าวหอมมะลิเข้าโรงอาหารพนักงาน ช่วยลดความหิวและเพิ่มขวัญกำลังใจ (Morale) +1 ทุกวัน"
      ],
      moraleBonusDaily: 1,
      esgBonus: 1
    },
    palm_oil_plantation: {
      id: "palm_oil_plantation",
      nameTh: "สวนปาล์มน้ำมันและมะพร้าวอุตสาหกรรมสุราษฎร์ธานี",
      shortNameTh: "สวนปาล์มน้ำมันสุราษฎร์ฯ",
      category: "agro_upstream",
      categoryNameTh: "เกษตรกรรมและอาหารต้นน้ำ",
      locationTh: "สุราษฎร์ธานี / กระบี่",
      icon: "🌴",
      cost: 2500000,
      dailyUpkeep: 18000,
      dailyDividend: 52000,
      harvestYields: { crude_palm: 8 },
      linkedChainId: "chain_palm_oil_refinery",
      operationalEffectsTh: [
        "เก็บเกี่ยว ทะลายปาล์มสดและน้ำมันดิบ (crude_palm) +8 ชิ้น/วัน ส่งเข้าคลังโรงงานฟรี",
        "ป้อนโรงกลั่นกลางน้ำสกัดเป็น น้ำมันปาล์มบริสุทธิ์และเนยขาว (refined_palm_oil) สำหรับทำขนมปังและน้ำมันปรุงอาหาร",
        "ผลิตไบโอดีเซลใช้ในขบวนรถบรรทุกบริษัท ลดค่าโสหุ้ยขนส่งและเร่งงานจัดส่ง (Shipping) +6%"
      ],
      shippingSpeedBonus: 0.06,
      esgBonus: 1
    },
    sugarcane_estate: {
      id: "sugarcane_estate",
      nameTh: "ไร่อ้อยปลอดการเผาและโรงหีบน้ำตาลต้นน้ำนครปฐม",
      shortNameTh: "ไร่อ้อยและโรงหีบต้นน้ำ",
      category: "agro_upstream",
      categoryNameTh: "เกษตรกรรมและอาหารต้นน้ำ",
      locationTh: "นครปฐม / กาญจนบุรี",
      icon: "🎋",
      cost: 2000000,
      dailyUpkeep: 14000,
      dailyDividend: 40000,
      harvestYields: { raw_cane: 8 },
      linkedChainId: "chain_cane_sugar_ferment",
      operationalEffectsTh: [
        "เก็บเกี่ยว อ้อยสดและกากน้ำตาลธรรมชาติ (raw_cane) +8 ชิ้น/วัน ส่งเข้าคลังโรงงานฟรี",
        "ป้อนสายเคี่ยวกลางน้ำผลิต น้ำตาลทรายบริสุทธิ์และไซรัป (refined_sugar_syrup) ใช้ในเบเกอรี่และเครื่องดื่ม",
        "เชื้อเพลิงชีวมวลชานอ้อยช่วยลดค่าเช่าและสาธารณูปโภครายวันของนิคมลง 8%"
      ],
      rentReductionPct: 0.08,
      esgBonus: 1
    },
    smart_dairy_farm: {
      id: "smart_dairy_farm",
      nameTh: "ฟาร์มโคนมและเกษตรโปรตีนอัจฉริยะสระบุรี",
      shortNameTh: "ฟาร์มโคนมอัจฉริยะ",
      category: "agro_upstream",
      categoryNameTh: "เกษตรกรรมและอาหารต้นน้ำ",
      locationTh: "มวกเหล็ก สระบุรี",
      icon: "🐄",
      cost: 2800000,
      dailyUpkeep: 20000,
      dailyDividend: 58000,
      harvestYields: { fresh_milk_soy: 6, probiotic_culture: 2 },
      linkedChainId: "chain_dairy_probiotic_bio",
      operationalEffectsTh: [
        "ส่ง น้ำนมดิบและถั่วเหลืองออร์แกนิก (fresh_milk_soy) +6 ชิ้น/วัน และ หัวเชื้อโพรไบโอติกส์ +2 ชิ้น/วัน เข้าคลังฟรี",
        "ป้อนสายคลีนรูมผลิต เครื่องดื่มเวย์โปรตีนยูเอชที (dairy_protein_shake) และซองเจลโพรไบโอติกส์",
        "เสริมโภชนาการนมสดในโรงอาหาร ฟื้นฟูพลังงาน (Energy) พนักงานทุกคน +2 หน่วยทุกสิ้นวัน"
      ],
      energyBonusDaily: 2,
      esgBonus: 1
    },
    organic_herb_orchard: {
      id: "organic_herb_orchard",
      nameTh: "สวนสมุนไพรและผลไม้เมืองร้อนออร์แกนิกเชียงใหม่",
      shortNameTh: "สวนสมุนไพรออร์แกนิก",
      category: "agro_upstream",
      categoryNameTh: "เกษตรกรรมและอาหารต้นน้ำ",
      locationTh: "แม่ริม เชียงใหม่",
      icon: "🌿",
      cost: 2400000,
      dailyUpkeep: 16000,
      dailyDividend: 48000,
      harvestYields: { raw_extract: 6 },
      linkedChainId: "chain_herb_botanical_extract",
      operationalEffectsTh: [
        "เก็บเกี่ยว สารสกัดสมุนไพรและผลไม้ออร์แกนิก (raw_extract) +6 ชิ้น/วัน ส่งเข้าคลังโดยตรง",
        "ความสดบริสุทธิ์ของสมุนไพรต้นน้ำช่วยเพิ่มโอกาสผ่าน QC ของสินค้ากลุ่มอาหารและสุขภาพ +4%",
        "ยกระดับชื่อเสียงองค์กรสีเขียว (Reputation) +2 เมื่อเข้าถือครอง"
      ],
      foodQaBonus: 0.04,
      esgBonus: 2
    },
    rubber_polymer_estate: {
      id: "rubber_polymer_estate",
      nameTh: "สวนยางพาราและโรงสกัดโพลีเมอร์ชีวภาพระยอง",
      shortNameTh: "สวนยางพารา/โพลีเมอร์",
      category: "materials_mining",
      categoryNameTh: "เหมืองแร่ วัสดุศาสตร์ และป่าไม้",
      locationTh: "นิคมพัฒนา ระยอง",
      icon: "🌳",
      cost: 3000000,
      dailyUpkeep: 22000,
      dailyDividend: 64000,
      harvestYields: { natural_latex: 7, crude_petro_feedstock: 4, polymer_resin: 3 },
      linkedChainId: "chain_latex_polymer_compound",
      operationalEffectsTh: [
        "ส่ง น้ำยางพาราสด (natural_latex) +7 ชิ้น/วัน และ เม็ดพลาสติกเรซิน (polymer_resin) +3 ชิ้น/วัน เข้าคลังฟรี",
        "ป้อนสายวัลคาไนซ์ผลิตชิ้นส่วนยางแท่นเครื่องและช่วงล่าง EV (ev_suspension_kit) และตัวถังอิเล็กทรอนิกส์",
        "ซีลยางเกรดอุตสาหกรรมช่วยลดอัตราการสึกหรอของเครื่องจักรโรงงานลง 12%"
      ],
      wearReductionPct: 0.12,
      esgBonus: 1
    },
    silica_copper_mine: {
      id: "silica_copper_mine",
      nameTh: "สัมปทานเหมืองแร่ควอตซ์ซิลิกาและโรงถลุงทองแดง",
      shortNameTh: "เหมืองซิลิกาและทองแดง",
      category: "materials_mining",
      categoryNameTh: "เหมืองแร่ วัสดุศาสตร์ และป่าไม้",
      locationTh: "ลพบุรี / ตาก",
      icon: "⛏️",
      cost: 3800000,
      dailyUpkeep: 28000,
      dailyDividend: 82000,
      harvestYields: { silica_bauxite_ore: 6, copper_iron_ore: 5, lithium_brine_ore: 3, metallurgical_silicon: 2, copper_coil: 3, metal_sheet: 3 },
      linkedChainId: "chain_silica_wafer_semicon",
      operationalEffectsTh: [
        "ส่ง แร่ควอตซ์ซิลิกา (silica_bauxite_ore) +6 ชิ้น, ขดลวดทองแดง +3 ชิ้น และ แผ่นโลหะ +3 ชิ้น/วัน เข้าคลังฟรี",
        "ป้อนโรงหลอมผลึกสร้าง แผ่นซิลิคอนเวเฟอร์ (silicon_wafer) สำหรับผลิตชิป AI Edge และโซลาร์เซลล์",
        "ลดการพึ่งพิงการนำเข้าโลหะและแร่เซมิคอนดักเตอร์จากต่างประเทศ"
      ],
      esgBonus: 0
    },
    forestry_pulp_mill: {
      id: "forestry_pulp_mill",
      nameTh: "ป่าปลูกไม้เศรษฐกิจหมุนเวียนและโรงเยื่อกระดาษบรรจุภัณฑ์",
      shortNameTh: "ป่าเศรษฐกิจ/โรงเยื่อกระดาษ",
      category: "materials_mining",
      categoryNameTh: "เหมืองแร่ วัสดุศาสตร์ และป่าไม้",
      locationTh: "ปราจีนบุรี / สระแก้ว",
      icon: "🌲",
      cost: 2100000,
      dailyUpkeep: 15000,
      dailyDividend: 42000,
      harvestYields: { timber_bamboo_log: 6, pack_carton: 6, foil_pouch: 4 },
      linkedChainId: "chain_forestry_pulp_packaging",
      operationalEffectsTh: [
        "ผลิต กล่องบรรจุภัณฑ์มาตรฐาน (pack_carton) +6 ชิ้น/วัน และ ซองฟอยล์สุญญากาศ +4 ชิ้น/วัน ส่งเข้าคลังฟรี",
        "บรรจุภัณฑ์สั่งตัดตรงสเปกช่วยเร่งความเร็วงานแพ็กกิ้ง (Packing) ในคลังสินค้า +12%",
        "ดูดซับคาร์บอนเครดิต เพิ่มคะแนน ESG และชื่อเสียงบริษัท +2"
      ],
      packingSpeedBonus: 0.12,
      esgBonus: 2
    },
    offsite_solar_wind_farm: {
      id: "offsite_solar_wind_farm",
      nameTh: "ทุ่งกังหันลมและโซลาร์ฟาร์มเมกะวัตต์นอกนิคม",
      shortNameTh: "ทุ่งกังหันลม/โซลาร์ฟาร์ม",
      category: "energy_infra",
      categoryNameTh: "พลังงานและโครงสร้างพื้นฐาน",
      locationTh: "ชัยภูมิ / นครราชสีมา",
      icon: "🌬️",
      cost: 3400000,
      dailyUpkeep: 18000,
      dailyDividend: 75000,
      harvestYields: {},
      linkedChainId: null,
      operationalEffectsTh: [
        "จ่ายกระแสไฟฟ้าสะอาดเข้าสายส่งนิคม ลดภาระค่าเช่าและค่าไฟฟ้ารายวัน (rentDaily) ลง 28% ถาวร",
        "เสถียรภาพไฟฟ้าแรงดันสูงช่วยเร่งความเร็วการผลิตของทุกอาคาร +6%",
        "เพิ่มความพร้อมเข้าตลาดหลักทรัพย์ (IPO Readiness) +6% และรับรายได้ขายไฟเข้าระบบการไฟฟ้าทุกวัน"
      ],
      rentReductionPct: 0.28,
      productionSpeedBonus: 0.06,
      esgBonus: 3
    },
    deepsea_port_terminal: {
      id: "deepsea_port_terminal",
      nameTh: "ท่าเทียบเรือคอนเทนเนอร์และคลังทัณฑ์บนแหลมฉบัง",
      shortNameTh: "ท่าเทียบเรือแหลมฉบัง",
      category: "logistics_commercial",
      categoryNameTh: "โลจิสติกส์และเครือข่ายการค้า",
      locationTh: "ท่าเรือแหลมฉบัง ชลบุรี",
      icon: "🚢",
      cost: 4200000,
      dailyUpkeep: 26000,
      dailyDividend: 90000,
      harvestYields: {},
      linkedChainId: null,
      operationalEffectsTh: [
        "ทางด่วนศุลกากรและท่าเทียบเรือส่วนตัว ลดเวลารอวัตถุดิบขาเข้า (Lead Time) จากทุกซัพพลายเออร์ลง 30%",
        "เพิ่มขนาดขบวนรถบรรทุกขนส่งประจำนิคม +4 คันทันที",
        "เพิ่มอำนาจต่อรองราคาขายส่งออก B2B +4% สำหรับทุกออเดอร์"
      ],
      leadTimeReductionPct: 0.3,
      fleetBonus: 4,
      pricePremiumBonus: 0.04,
      esgBonus: 1
    },
    cold_chain_hub: {
      id: "cold_chain_hub",
      nameTh: "ศูนย์กระจายสินค้าห้องเย็นและฟลีทรถควบคุมอุณหภูมิ",
      shortNameTh: "คลังห้องเย็น Cold Chain",
      category: "logistics_commercial",
      categoryNameTh: "โลจิสติกส์และเครือข่ายการค้า",
      locationTh: "บางนา-ตราด สมุทรปราการ",
      icon: "❄️",
      cost: 2900000,
      dailyUpkeep: 20000,
      dailyDividend: 62000,
      harvestYields: {},
      linkedChainId: null,
      operationalEffectsTh: [
        "รักษาความสดของแป้ง นม สมุนไพร และเบเกอรี่ เพิ่มโอกาสผ่าน QC สินค้าหมวดอาหาร +6%",
        "เพิ่มขบวนรถห้องเย็น +3 คัน และยืดเวลาส่งมอบออเดอร์ (Deadline) ให้ยาวขึ้น +1 วัน",
        "สร้างรายได้ค่าเช่าพื้นที่คลังห้องเย็นจากคู่ค้าภายนอกทุกวัน"
      ],
      foodQaBonus: 0.06,
      fleetBonus: 3,
      deadlineBonusDays: 1,
      esgBonus: 1
    },
    retail_flagship_network: {
      id: "retail_flagship_network",
      nameTh: "เครือข่ายโชว์รูมและแฟรนไชส์ร้านค้าปลีก-ส่งทั่วประเทศ",
      shortNameTh: "เครือข่ายโชว์รูม/ร้านค้าปลีก",
      category: "logistics_commercial",
      categoryNameTh: "โลจิสติกส์และเครือข่ายการค้า",
      locationTh: "กรุงเทพฯ และหัวเมืองใหญ่ 12 สาขา",
      icon: "🏪",
      cost: 3600000,
      dailyUpkeep: 24000,
      dailyDividend: 85000,
      harvestYields: {},
      linkedChainId: null,
      operationalEffectsTh: [
        "บูรณาการปลายน้ำ (Forward Integration): ขายตรงถึงตลาดปลายทาง เพิ่มราคาขายต่อหน่วย (unitPrice) +7%",
        "เพิ่มสัดส่วนเงินมัดจำรับล่วงหน้าเมื่อปิดดีล (Deposit) จาก 30% เป็น 40% ช่วยหมุนเงินสดไวขึ้น",
        "ขยายส่วนแบ่งการตลาดของบริษัท (Market Share) +3.5% ทันที"
      ],
      pricePremiumBonus: 0.07,
      depositPctBonus: 0.1,
      marketShareBonus: 3.5,
      esgBonus: 1
    }
  });

  // 5-Tier Material & Product Value Chain Architecture (T0 ➔ T1 ➔ T2 ➔ T3 ➔ T4)
  const MATERIAL_TIERS = deepFreeze({
    0: {
      tier: 0,
      code: "T0_RAW",
      nameTh: "ขั้นที่ 0: ทรัพยากรธรรมชาติต้นน้ำ (ผลิตเองไม่ได้ ต้องเก็บเกี่ยวจากสินทรัพย์ภายนอกหรือซื้อซัพพลายเออร์)",
      shortNameTh: "T0 · วัตถุดิบธรรมชาติต้นน้ำ (Uncraftable)",
      badgeTh: "T0 · ต้นน้ำแท้",
      craftable: false,
      sellableB2B: true
    },
    1: {
      tier: 1,
      code: "T1_REFINED",
      nameTh: "ขั้นที่ 1: วัตถุดิบแปรรูปขั้นต้น (โม่/หีบ/ถลุงจาก T0 หรือซื้อตลาด • ใช้ผลิตต่อและขาย B2B ได้)",
      shortNameTh: "T1 · แปรรูปขั้นที่ 1 (First-Stage Refined)",
      badgeTh: "T1 · แปรรูปขั้นต้น",
      craftable: true,
      sellableB2B: true
    },
    2: {
      tier: 2,
      code: "T2_INTERMEDIATE",
      nameTh: "ขั้นที่ 2: วัสดุวิศวกรรมและกึ่งสำเร็จรูปขั้นกลาง (แปรรูปต่อจาก T1 • ใช้ประกอบชิ้นส่วนหรือขาย B2B ได้)",
      shortNameTh: "T2 · วัสดุขั้นที่ 2 (Advanced Intermediate)",
      badgeTh: "T2 · วัสดุขั้นกลาง",
      craftable: true,
      sellableB2B: true
    },
    3: {
      tier: 3,
      code: "T3_COMPONENT",
      nameTh: "ขั้นที่ 3: ชิ้นส่วนอิเล็กทรอนิกส์และโมดูลไฮเทค (ต้นเกมต้องซื้อ เมื่อมีทุนและแต้มวิจัย R&D ถึงเกณฑ์จึงผลิตเองและขาย B2B ได้)",
      shortNameTh: "T3 · ชิ้นส่วนไฮเทค (Tech-Gated Component)",
      badgeTh: "T3 · ชิ้นส่วนไฮเทค",
      craftable: true,
      sellableB2B: true
    },
    4: {
      tier: 4,
      code: "T4_PRODUCT",
      nameTh: "ขั้นที่ 4: สินค้าอุตสาหกรรมสำเร็จรูปปลายน้ำ 6 หมวดธุรกิจ (ส่งมอบดีล B2B และตลาดโลก)",
      shortNameTh: "T4 · สินค้าสำเร็จรูป (Finished Product)",
      badgeTh: "T4 · สินค้าปลายน้ำ",
      craftable: true,
      sellableB2B: true
    }
  });

  // 27 Multi-Stage Material & Component Recipes (ทุกวัตถุดิบตั้งแต่ Tier 1-3 ที่บริษัทสามารถผลิตเองเพื่อใช้เป็นวัตถุดิบตั้งต้นหรือขายเป็นสินค้า B2B)
  const MATERIAL_RECIPES = deepFreeze({
    // === TIER 1: First-Stage Refined Materials (Crafted from Tier 0 Uncraftable Raw Resources) ===
    artisan_flour: {
      id: "artisan_flour",
      outputMaterialId: "artisan_flour",
      nameTh: "โม่ข้าวเปลือกและธัญพืชเป็นแป้งโม่ละเอียด (T0 ➔ T1)",
      tier: 1,
      minResearch: 0,
      capitalRequirement: 0,
      inputs: { paddy_grain: 2 },
      outputs: { artisan_flour: 2 },
      b2bSellPrice: 5500,
      chainPathTh: "ข้าวเปลือก (T0) ➔ แป้งโม่ละเอียด (T1) ➔ โดว์เนยสด (T2) / ขนมปังโฮลเกรน (T4)"
    },
    refined_palm_oil: {
      id: "refined_palm_oil",
      outputMaterialId: "refined_palm_oil",
      nameTh: "กลั่นทะลายปาล์มสดเป็นน้ำมันปาล์มบริสุทธิ์และเนยขาว (T0 ➔ T1)",
      tier: 1,
      minResearch: 0,
      capitalRequirement: 0,
      inputs: { crude_palm: 2 },
      outputs: { refined_palm_oil: 2 },
      b2bSellPrice: 5900,
      chainPathTh: "ปาล์มดิบ (T0) ➔ น้ำมันบริสุทธิ์/เนยขาว (T1) ➔ โดว์เนยสด (T2) / น้ำมันโอเลอิน (T4)"
    },
    refined_sugar_syrup: {
      id: "refined_sugar_syrup",
      outputMaterialId: "refined_sugar_syrup",
      nameTh: "หีบอ้อยสดและเคี่ยวเป็นน้ำตาลทรายบริสุทธิ์/ไซรัป (T0 ➔ T1)",
      tier: 1,
      minResearch: 0,
      capitalRequirement: 0,
      inputs: { raw_cane: 2 },
      outputs: { refined_sugar_syrup: 2 },
      b2bSellPrice: 5000,
      chainPathTh: "อ้อยสด (T0) ➔ น้ำตาล/ไซรัปบริสุทธิ์ (T1) ➔ เบเกอรี่/เครื่องดื่มโปรตีน (T4)"
    },
    raw_extract: {
      id: "raw_extract",
      outputMaterialId: "raw_extract",
      nameTh: "สกัดสุญญากาศสมุนไพรและอ้อยเป็นสารสกัดเข้มข้น (T0 ➔ T1)",
      tier: 1,
      minResearch: 0,
      capitalRequirement: 0,
      inputs: { raw_cane: 1, fresh_milk_soy: 1 },
      outputs: { raw_extract: 2 },
      b2bSellPrice: 4600,
      chainPathTh: "อ้อยสด + น้ำนม/ถั่วเหลือง (T0) ➔ สารสกัดสมุนไพร/โปรตีน (T1) ➔ โภชนเภสัช (T4)"
    },
    metal_sheet: {
      id: "metal_sheet",
      outputMaterialId: "metal_sheet",
      nameTh: "ถลุงและรีดแร่เหล็ก-ทองแดงเป็นแผ่นโลหะขึ้นรูป (T0 ➔ T1)",
      tier: 1,
      minResearch: 15,
      capitalRequirement: 1500000,
      inputs: { copper_iron_ore: 2 },
      outputs: { metal_sheet: 2 },
      b2bSellPrice: 9100,
      chainPathTh: "แร่เหล็ก/ทองแดงดิบ (T0) ➔ แผ่นโลหะขึ้นรูป (T1) ➔ ตัวถัง/ฮีตซิงก์ (T2) ➔ ยานยนต์ EV (T4)"
    },
    copper_coil: {
      id: "copper_coil",
      outputMaterialId: "copper_coil",
      nameTh: "ถลุงแร่และรีดเส้นลวดเป็นขดลวดทองแดงบริสุทธิ์ (T0 ➔ T1)",
      tier: 1,
      minResearch: 15,
      capitalRequirement: 1500000,
      inputs: { copper_iron_ore: 2 },
      outputs: { copper_coil: 2 },
      b2bSellPrice: 7200,
      chainPathTh: "แร่ทองแดงดิบ (T0) ➔ ขดลวดทองแดง (T1) ➔ ชุดสายไฟ (T2) / แผงวงจร PCB (T3)"
    },
    polymer_resin: {
      id: "polymer_resin",
      outputMaterialId: "polymer_resin",
      nameTh: "สังเคราะห์น้ำยางสดและสารปิโตรเคมีเป็นเม็ดโพลีเมอร์เรซิน (T0 ➔ T1)",
      tier: 1,
      minResearch: 10,
      capitalRequirement: 1200000,
      inputs: { natural_latex: 2 },
      outputs: { polymer_resin: 2 },
      b2bSellPrice: 5300,
      chainPathTh: "น้ำยางสด/ปิโตรเคมี (T0) ➔ เม็ดพลาสติกเรซิน (T1) ➔ ตัวถัง/ชุดสายไฟ (T2)"
    },
    pack_carton: {
      id: "pack_carton",
      outputMaterialId: "pack_carton",
      nameTh: "แปรรูปไม้เศรษฐกิจและเส้นใยเป็นกล่องบรรจุภัณฑ์มาตรฐาน (T0 ➔ T1)",
      tier: 1,
      minResearch: 0,
      capitalRequirement: 0,
      inputs: { timber_bamboo_log: 2 },
      outputs: { pack_carton: 3 },
      b2bSellPrice: 2700,
      chainPathTh: "ท่อนไม้เศรษฐกิจ/เส้นใย (T0) ➔ กล่องบรรจุภัณฑ์ (T1) ➔ สินค้าส่งออกทุกหมวด (T4)"
    },
    glass_bottle: {
      id: "glass_bottle",
      outputMaterialId: "glass_bottle",
      nameTh: "หลอมทรายควอตซ์ซิลิกาเป็นขวดแก้วสุญญากาศและหลอดแก้ว (T0 ➔ T1)",
      tier: 1,
      minResearch: 10,
      capitalRequirement: 1000000,
      inputs: { silica_bauxite_ore: 1 },
      outputs: { glass_bottle: 2 },
      b2bSellPrice: 3300,
      chainPathTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แก้วบริสุทธิ์/ขวดสุญญากาศ (T1) ➔ เลนส์ออปติคัล (T2)"
    },
    metallurgical_silicon: {
      id: "metallurgical_silicon",
      outputMaterialId: "metallurgical_silicon",
      nameTh: "ถลุงทรายควอตซ์ซิลิกาด้วยเตาอาร์กไฟฟ้าเป็นแท่งซิลิคอนบริสุทธิ์ MG-Si (T0 ➔ T1)",
      tier: 1,
      minResearch: 35,
      capitalRequirement: 2000000,
      inputs: { silica_bauxite_ore: 2 },
      outputs: { metallurgical_silicon: 2 },
      b2bSellPrice: 6900,
      chainPathTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แท่งซิลิคอน MG-Si (T1) ➔ ซิลิคอนเวเฟอร์ (T2) ➔ ชิปไมโครโพรเซสเซอร์ (T3)"
    },

    // === TIER 2: Second-Stage Advanced Intermediates (Crafted from Tier 1 Inputs) ===
    bakery_dough_butter: {
      id: "bakery_dough_butter",
      outputMaterialId: "bakery_dough_butter",
      nameTh: "นวดหมักแป้งโม่ละเอียดและเนยปาล์มบริสุทธิ์เป็นโดว์ขนมปังและเนยเพสตรี้ (T1 ➔ T2)",
      tier: 2,
      minResearch: 25,
      capitalRequirement: 1200000,
      inputs: { artisan_flour: 1, refined_palm_oil: 1 },
      outputs: { bakery_dough_butter: 2 },
      b2bSellPrice: 7400,
      chainPathTh: "ข้าวเปลือก/ปาล์ม (T0) ➔ แป้ง + เนยบริสุทธิ์ (T1) ➔ โดว์ขนมปัง/เนยเพสตรี้ (T2) ➔ ครัวซองต์ส่งออก (T4)"
    },
    probiotic_culture: {
      id: "probiotic_culture",
      outputMaterialId: "probiotic_culture",
      nameTh: "หมักบ่มน้ำนมโคสดและถั่วเหลืองเป็นหัวเชื้อจุลินทรีย์โพรไบโอติกส์ (T0/T1 ➔ T2)",
      tier: 2,
      minResearch: 30,
      capitalRequirement: 1500000,
      inputs: { fresh_milk_soy: 2 },
      outputs: { probiotic_culture: 2 },
      b2bSellPrice: 6600,
      chainPathTh: "น้ำนมสด/ถั่วเหลือง (T0) ➔ หัวเชื้อโพรไบโอติกส์ (T2) ➔ โภชนเภสัชซินไบโอติกส์ (T4)"
    },
    foil_pouch: {
      id: "foil_pouch",
      outputMaterialId: "foil_pouch",
      nameTh: "เคลือบลามิเนตแผ่นโลหะและเรซินเป็นซองฟอยล์สุญญากาศเกรดการแพทย์ (T1 ➔ T2)",
      tier: 2,
      minResearch: 25,
      capitalRequirement: 1200000,
      inputs: { metal_sheet: 1, polymer_resin: 1 },
      outputs: { foil_pouch: 4 },
      b2bSellPrice: 3000,
      chainPathTh: "แร่โลหะ + ยางพารา (T0) ➔ แผ่นโลหะ + เรซิน (T1) ➔ ซองฟอยล์สุญญากาศ (T2)"
    },
    casing: {
      id: "casing",
      outputMaterialId: "casing",
      nameTh: "ฉีดขึ้นรูปเรซินและพับแผ่นโลหะเป็นตัวถังอุปกรณ์มาตรฐาน (T1 ➔ T2)",
      tier: 2,
      minResearch: 30,
      capitalRequirement: 1500000,
      inputs: { polymer_resin: 1, metal_sheet: 1 },
      outputs: { casing: 2 },
      b2bSellPrice: 6500,
      chainPathTh: "แร่เหล็ก + ยางพารา (T0) ➔ แผ่นโลหะ + เรซิน (T1) ➔ ตัวถังอุตสาหกรรม (T2)"
    },
    wire_harness: {
      id: "wire_harness",
      outputMaterialId: "wire_harness",
      nameTh: "หุ้มฉนวนเรซินและเข้าหัวขดลวดทองแดงเป็นชุดสายไฟแรงดันต่ำ (T1 ➔ T2)",
      tier: 2,
      minResearch: 35,
      capitalRequirement: 1500000,
      inputs: { copper_coil: 1, polymer_resin: 1 },
      outputs: { wire_harness: 2 },
      b2bSellPrice: 5900,
      chainPathTh: "แร่ทองแดง + ยางพารา (T0) ➔ ขดลวดทองแดง + เรซิน (T1) ➔ ชุดสายไฟ (T2)"
    },
    heat_sink: {
      id: "heat_sink",
      outputMaterialId: "heat_sink",
      nameTh: "กลึง CNC แผ่นโลหะและท่อทองแดงเป็นครีบระบายความร้อนอะลูมิเนียม (T1 ➔ T2)",
      tier: 2,
      minResearch: 40,
      capitalRequirement: 1800000,
      inputs: { metal_sheet: 1, copper_coil: 1 },
      outputs: { heat_sink: 3 },
      b2bSellPrice: 5300,
      chainPathTh: "แร่โลหะ (T0) ➔ แผ่นโลหะ + ทองแดง (T1) ➔ ครีบระบายความร้อน (T2)"
    },
    optical_lens: {
      id: "optical_lens",
      outputMaterialId: "optical_lens",
      nameTh: "เจียระไนแก้วควอตซ์และเคลือบโพลีเมอร์เป็นเลนส์ออปติคัลความละเอียดสูง (T1 ➔ T2)",
      tier: 2,
      minResearch: 75,
      capitalRequirement: 2200000,
      inputs: { glass_bottle: 2, polymer_resin: 1 },
      outputs: { optical_lens: 2 },
      b2bSellPrice: 8500,
      chainPathTh: "ทรายซิลิกา (T0) ➔ แก้วบริสุทธิ์ (T1) ➔ เลนส์ออปติคัล (T2) ➔ กล้อง AI / เครื่องมือแพทย์ (T4)"
    },
    cathode_electrolyte: {
      id: "cathode_electrolyte",
      outputMaterialId: "cathode_electrolyte",
      nameTh: "สกัดแร่ลิเธียมและทองแดงเป็นสารแคโทดและอิเล็กโทรไลต์แบตเตอรี่ (T0/T1 ➔ T2)",
      tier: 2,
      minResearch: 85,
      capitalRequirement: 2500000,
      inputs: { lithium_brine_ore: 2, copper_coil: 1 },
      outputs: { cathode_electrolyte: 2 },
      b2bSellPrice: 8900,
      chainPathTh: "แร่ลิเธียม (T0) + ทองแดง (T1) ➔ แคโทดและอิเล็กโทรไลต์ (T2) ➔ แบตเตอรี่ลิเธียม (T3)"
    },
    silicon_wafer: {
      id: "silicon_wafer",
      outputMaterialId: "silicon_wafer",
      nameTh: "หลอมผลึกเดี่ยว Czochralski และตัดแท่งซิลิคอน MG-Si เป็นแผ่นซิลิคอนเวเฟอร์ (T1 ➔ T2)",
      tier: 2,
      minResearch: 65,
      capitalRequirement: 2600000,
      inputs: { metallurgical_silicon: 2 },
      outputs: { silicon_wafer: 2 },
      b2bSellPrice: 10400,
      chainPathTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แท่งซิลิคอน MG-Si (T1) ➔ แผ่นซิลิคอนเวเฟอร์ (T2) ➔ ชิปนาโน (T3)"
    },

    // === TIER 3: Tech-Gated Sub-Assemblies & High-Tech Components (Early game must buy; mid/late game can fabricate & sell B2B) ===
    driver: {
      id: "driver",
      outputMaterialId: "driver",
      nameTh: "พันขดลวดเสียงและประกอบแม่เหล็กเป็นดอกลำโพงความแม่นยำสูง (T1+T2 ➔ T3)",
      tier: 3,
      minResearch: 95,
      capitalRequirement: 2800000,
      inputs: { copper_coil: 1, casing: 1 },
      outputs: { driver: 2 },
      b2bSellPrice: 7900,
      chainPathTh: "แร่โลหะ (T0) ➔ ขดลวดทองแดง (T1) + ตัวถัง (T2) ➔ ดอกลำโพง (T3) ➔ ลำโพงบลูทูธ (T4)"
    },
    pcb: {
      id: "pcb",
      outputMaterialId: "pcb",
      nameTh: "กัดลายทองแดงบนแผ่นไฟเบอร์เรซินเป็นแผงวงจรพิมพ์หลายชั้น PCB (T1 ➔ T3)",
      tier: 3,
      minResearch: 105,
      capitalRequirement: 3000000,
      inputs: { copper_coil: 1, polymer_resin: 1 },
      outputs: { pcb: 2 },
      b2bSellPrice: 11800,
      chainPathTh: "แร่ทองแดง + ยาง/เรซิน (T0/T1) ➔ แผงวงจรพิมพ์ PCB (T3) ➔ ชิปและอิเล็กทรอนิกส์ทุกชนิด (T4)"
    },
    led: {
      id: "led",
      outputMaterialId: "led",
      nameTh: "ตัดแผ่นซิลิคอนเวเฟอร์และครอบเลนส์เป็นโมดูลแสง SMD LED (T2 ➔ T3)",
      tier: 3,
      minResearch: 135,
      capitalRequirement: 3400000,
      inputs: { silicon_wafer: 1, optical_lens: 1 },
      outputs: { led: 2 },
      b2bSellPrice: 9800,
      chainPathTh: "ทรายซิลิกา (T0) ➔ แท่งซิลิคอน (T1) ➔ เวเฟอร์ + เลนส์ (T2) ➔ โมดูลแสง LED (T3)"
    },
    sensor: {
      id: "sensor",
      outputMaterialId: "sensor",
      nameTh: "สร้างวงจร MEMS บนแผ่นเวเฟอร์พร้อมชุดสายไฟเป็นเซนเซอร์อัจฉริยะ (T2 ➔ T3)",
      tier: 3,
      minResearch: 150,
      capitalRequirement: 3600000,
      inputs: { silicon_wafer: 1, wire_harness: 1 },
      outputs: { sensor: 2 },
      b2bSellPrice: 8000,
      chainPathTh: "ทรายซิลิกา (T0) ➔ แท่งซิลิคอน (T1) ➔ เวเฟอร์ + สายไฟ (T2) ➔ เซนเซอร์ MEMS (T3)"
    },
    solar_cell: {
      id: "solar_cell",
      outputMaterialId: "solar_cell",
      nameTh: "เคลือบสารกึ่งตัวนำบนซิลิคอนเวเฟอร์และกระจกนิรภัยเป็นเซลล์แสงอาทิตย์ (T1+T2 ➔ T3)",
      tier: 3,
      minResearch: 180,
      capitalRequirement: 4000000,
      inputs: { silicon_wafer: 1, glass_bottle: 1, copper_coil: 1 },
      outputs: { solar_cell: 2 },
      b2bSellPrice: 11200,
      chainPathTh: "ทรายซิลิกา (T0) ➔ แท่งซิลิคอน (T1) ➔ เวเฟอร์ (T2) ➔ แผงโซลาร์เซลล์ (T3)"
    },
    battery: {
      id: "battery",
      outputMaterialId: "battery",
      nameTh: "ประกอบสารแคโทดลิเธียม ซองฟอยล์ และแผ่นโลหะเป็นโมดูลแบตเตอรี่ลิเธียม (T1+T2 ➔ T3)",
      tier: 3,
      minResearch: 210,
      capitalRequirement: 4500000,
      inputs: { cathode_electrolyte: 1, metal_sheet: 1, foil_pouch: 1 },
      outputs: { battery: 2 },
      b2bSellPrice: 12600,
      chainPathTh: "แร่ลิเธียม (T0) ➔ แคโทดอิเล็กโทรไลต์ (T2) ➔ โมดูลแบตเตอรี่ลิเธียม (T3) ➔ แพ็กแบต EV/โดรน (T4)"
    },
    microchip: {
      id: "microchip",
      outputMaterialId: "microchip",
      nameTh: "ฉายแสงลิโธกราฟีระดับนาโนบนแผ่นซิลิคอนเวเฟอร์และแผง PCB เป็นชิปไมโครโพรเซสเซอร์ (T2+T3 ➔ T3)",
      tier: 3,
      minResearch: 250,
      capitalRequirement: 5200000,
      inputs: { silicon_wafer: 1, pcb: 1 },
      outputs: { microchip: 2 },
      b2bSellPrice: 11600,
      chainPathTh: "ทรายซิลิกา (T0) ➔ แท่งซิลิคอน MG-Si (T1) ➔ ซิลิคอนเวเฟอร์ (T2) ➔ ชิปไมโครโพรเซสเซอร์ (T3)"
    },
    power_inverter_ic: {
      id: "power_inverter_ic",
      outputMaterialId: "power_inverter_ic",
      nameTh: "ประกอบเวเฟอร์ซิลิคอนคาร์ไบด์เข้ากับฮีตซิงก์และขดลวดเป็นชิปกำลังไฟฟ้า IGBT (T1+T2 ➔ T3)",
      tier: 3,
      minResearch: 290,
      capitalRequirement: 5800000,
      inputs: { silicon_wafer: 1, heat_sink: 1, copper_coil: 1 },
      outputs: { power_inverter_ic: 2 },
      b2bSellPrice: 12800,
      chainPathTh: "ทรายซิลิกา (T0) ➔ แท่งซิลิคอน (T1) ➔ เวเฟอร์ + ฮีตซิงก์ (T2) ➔ ชิป IGBT แรงดันสูง (T3)"
    }
  });

  // 12 Multi-Stage Production Chains (ห่วงโซ่การผลิตแบบลูกโซ่หลายระดับ: T0 ➔ T1 ➔ T2 ➔ T3 ➔ T4)
  const PRODUCTION_CHAINS = deepFreeze({
    chain_grain_flour_bakery: {
      id: "chain_grain_flour_bakery",
      nameTh: "ห่วงโซ่ข้าวและธัญพืช › โรงโม่แป้ง › ขนมปังโฮลเกรนและอาหารพร้อมทาน",
      shortNameTh: "ข้าวเปลือก (T0) ➔ แป้งโม่ละเอียด (T1) ➔ ขนมปัง (T4)",
      icon: "🍞",
      sector: "food",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "jasmine_rice_farm",
      upstreamAssetNameTh: "ไร่ข้าวหอมมะลิและธัญพืชอินทรีย์",
      inputs: { paddy_grain: 2 },
      outputs: { artisan_flour: 2 },
      batchesPerDayBase: 4,
      downstreamProducts: ["artisan_bakery", "ready_meal_box", "plant_based_meat", "pastry_croissant_box"],
      makeOrBuyNoteTh: "โม่แป้งเองจากข้าวเปลือก (ต้นทุน ฿36/ชุด) เพื่อใช้ผลิตขนมปังหรือขายแป้งส่ง B2B (฿55/ชิ้น) หรือซื้อแป้งสำเร็จรูปจากตลาด"
    },
    chain_palm_oil_refinery: {
      id: "chain_palm_oil_refinery",
      nameTh: "ห่วงโซ่สวนปาล์ม › โรงกลั่นน้ำมันบริสุทธิ์/เนยขาว › เบเกอรี่และน้ำมันโอเลอิน",
      shortNameTh: "ปาล์มดิบ (T0) ➔ น้ำมันบริสุทธิ์/เนยขาว (T1) ➔ เบเกอรี่/น้ำมันพืช (T4)",
      icon: "🌴",
      sector: "food",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "palm_oil_plantation",
      upstreamAssetNameTh: "สวนปาล์มน้ำมันสุราษฎร์ธานี",
      inputs: { crude_palm: 2 },
      outputs: { refined_palm_oil: 2 },
      batchesPerDayBase: 4,
      downstreamProducts: ["artisan_bakery", "premium_cooking_oil", "ready_meal_box", "plant_based_meat"],
      makeOrBuyNoteTh: "สกัดน้ำมันปาล์มบริสุทธิ์/เนยขาวเองจากผลปาล์มสด ใช้ทำเบเกอรี่หรือขายส่งโรงงานอาหาร B2B (฿59/ชิ้น)"
    },
    chain_flour_butter_dough: {
      autoRun: false,
      id: "chain_flour_butter_dough",
      nameTh: "ห่วงโซ่ขั้นที่ 2: แป้งโม่ละเอียด + เนยขาวปาล์ม › ห้องหมักโดว์ › โดว์ขนมปังและเนยเพสตรี้พร้อมอบ",
      shortNameTh: "แป้ง (T1) + เนยปาล์ม (T1) ➔ โดว์ขนมปัง/เพสตรี้ (T2) ➔ ครัวซองต์ส่งออก (T4)",
      icon: "🥐",
      sector: "food",
      tierStep: "T1 ➔ T2",
      minResearch: 25,
      upstreamAssetId: "jasmine_rice_farm",
      upstreamAssetNameTh: "ไร่ข้าวหอมมะลิ + สวนปาล์มน้ำมัน",
      inputs: { artisan_flour: 1, refined_palm_oil: 1 },
      outputs: { bakery_dough_butter: 2 },
      batchesPerDayBase: 3,
      downstreamProducts: ["pastry_croissant_box", "artisan_bakery"],
      makeOrBuyNoteTh: "แปรรูปขั้นที่ 2 ผสมแป้งและเนยเป็นโดว์แช่แข็งส่งขายเชนเบเกอรี่ B2B (฿74/ชิ้น) หรืออบเป็นครัวซองต์พรีเมียม"
    },
    chain_cane_sugar_ferment: {
      id: "chain_cane_sugar_ferment",
      nameTh: "ห่วงโซ่ไร่อ้อย › โรงหีบและเคี่ยวไซรัป › เบเกอรี่และเครื่องดื่มสุขภาพ",
      shortNameTh: "อ้อยสด (T0) ➔ น้ำตาล/ไซรัปบริสุทธิ์ (T1) ➔ เบเกอรี่/เครื่องดื่ม (T4)",
      icon: "🎋",
      sector: "food",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "sugarcane_estate",
      upstreamAssetNameTh: "ไร่อ้อยและโรงหีบน้ำตาลต้นน้ำ",
      inputs: { raw_cane: 2 },
      outputs: { refined_sugar_syrup: 2 },
      batchesPerDayBase: 4,
      downstreamProducts: ["artisan_bakery", "dairy_protein_shake", "pastry_croissant_box"],
      makeOrBuyNoteTh: "เคี่ยวน้ำตาลและไซรัปเองจากอ้อยสด ใช้ในโรงงานหรือขายส่ง B2B ให้บริษัทเครื่องดื่มภายนอก"
    },
    chain_dairy_probiotic_bio: {
      id: "chain_dairy_probiotic_bio",
      nameTh: "ห่วงโซ่ฟาร์มโคนม › ห้องหมักหัวเชื้อชีวภาพ › นมโปรตีนและโภชนเภสัชการแพทย์",
      shortNameTh: "น้ำนมดิบ/ถั่วเหลือง (T0) ➔ หัวเชื้อโพรไบโอติกส์ (T2) ➔ ซินไบโอติกส์ (T4)",
      icon: "🥛",
      sector: "biomed",
      tierStep: "T0 ➔ T2",
      minResearch: 0,
      upstreamAssetId: "smart_dairy_farm",
      upstreamAssetNameTh: "ฟาร์มโคนมและเกษตรโปรตีนอัจฉริยะ",
      inputs: { fresh_milk_soy: 2 },
      outputs: { probiotic_culture: 2 },
      batchesPerDayBase: 3,
      downstreamProducts: ["dairy_protein_shake", "probioticElixir", "synbiotic_medical_drink"],
      makeOrBuyNoteTh: "เพาะหัวเชื้อโพรไบโอติกส์จากน้ำนมดิบ ป้อนสายไบโอเมดหรือขายหัวเชื้อให้บริษัทยา B2B (฿66/ชิ้น)"
    },
    chain_herb_botanical_extract: {
      id: "chain_herb_botanical_extract",
      nameTh: "ห่วงโซ่สวนสมุนไพร › โรงสกัดสุญญากาศ › เครื่องดื่มสมุนไพรและโภชนเภสัช",
      shortNameTh: "สมุนไพรสด/อ้อย (T0) ➔ สารสกัดเข้มข้น (T1) ➔ เครื่องดื่มสุขภาพ (T4)",
      icon: "🌿",
      sector: "food",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "organic_herb_orchard",
      upstreamAssetNameTh: "สวนสมุนไพรออร์แกนิกเชียงใหม่",
      inputs: { raw_cane: 1, fresh_milk_soy: 1 },
      outputs: { raw_extract: 2 },
      batchesPerDayBase: 3,
      downstreamProducts: ["herbalDrink", "energyProtein", "functionalShot", "plant_based_meat", "synbiotic_medical_drink"],
      makeOrBuyNoteTh: "สกัดสารสำคัญจากสมุนไพรและธัญพืช ใช้ผลิตอาหารอนาคตหรือขายสารสกัดให้คู่ค้า B2B"
    },
    chain_latex_polymer_compound: {
      id: "chain_latex_polymer_compound",
      nameTh: "ห่วงโซ่สวนยางพารา › โรงสังเคราะห์คอมปาวด์ › ช่วงล่าง EV และเรซินวิศวกรรม",
      shortNameTh: "น้ำยางสด (T0) ➔ เม็ดโพลีเมอร์เรซิน (T1) ➔ ช่วงล่าง EV/โดรน (T4)",
      icon: "🛞",
      sector: "automotive",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "rubber_polymer_estate",
      upstreamAssetNameTh: "สวนยางพาราและโพลีเมอร์ระยอง",
      inputs: { natural_latex: 2 },
      outputs: { polymer_resin: 2 },
      batchesPerDayBase: 3,
      downstreamProducts: ["ev_suspension_kit", "visionCamera", "autonomous_cargo_drone"],
      makeOrBuyNoteTh: "สังเคราะห์เม็ดพลาสติกเรซินและยางวิศวกรรมเองจากสวนยางพารา หรือขายเม็ดเรซินให้โรงงานภายนอก"
    },
    chain_ore_smelting_metal: {
      id: "chain_ore_smelting_metal",
      nameTh: "ห่วงโซ่เหมืองแร่ › โรงถลุงโลหะและรีดเส้นทองแดง › แผ่นโลหะและขดลวดทองแดง",
      shortNameTh: "แร่ทองแดง/เหล็กดิบ (T0) ➔ แผ่นโลหะ + ขดลวดทองแดง (T1)",
      icon: "🔩",
      sector: "automotive",
      tierStep: "T0 ➔ T1",
      minResearch: 15,
      upstreamAssetId: "silica_copper_mine",
      upstreamAssetNameTh: "สัมปทานเหมืองแร่ซิลิกาและทองแดง",
      inputs: { copper_iron_ore: 2 },
      outputs: { metal_sheet: 1, copper_coil: 1 },
      batchesPerDayBase: 3,
      downstreamProducts: ["evController", "servoActuator", "ev_suspension_kit", "autonomous_cargo_drone"],
      makeOrBuyNoteTh: "ถลุงแร่ทองแดงและเหล็กดิบจากเหมืองเป็นแผ่นโลหะและขดลวดทองแดง ลดการนำเข้าโลหะจากตลาด"
    },
    chain_silica_mg_silicon: {
      autoRun: false,
      id: "chain_silica_mg_silicon",
      nameTh: "ห่วงโซ่เซมิคอนดักเตอร์ ขั้นที่ 1: ทรายควอตซ์ซิลิกา › เตาหลอมอาร์กไฟฟ้า › แท่งซิลิคอนบริสุทธิ์ MG-Si",
      shortNameTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แท่งซิลิคอนบริสุทธิ์ MG-Si (T1)",
      icon: "🪨",
      sector: "tech",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "silica_copper_mine",
      upstreamAssetNameTh: "สัมปทานเหมืองแร่ควอตซ์ซิลิกา",
      inputs: { silica_bauxite_ore: 2 },
      outputs: { metallurgical_silicon: 2, silicon_wafer: 2 },
      batchesPerDayBase: 3,
      downstreamProducts: ["ai_edge_module", "vital_signs_monitor", "autonomous_cargo_drone"],
      makeOrBuyNoteTh: "ถลุงทรายควอตซ์ซิลิกาเป็นแท่งซิลิคอนบริสุทธิ์ (T1) และดึงผลึกเวเฟอร์ (T2) ส่งขายโรงงานชิปหรือใช้ผลิตเอง"
    },
    chain_silica_wafer_semicon: {
      id: "chain_silica_wafer_semicon",
      nameTh: "ห่วงโซ่เหมืองซิลิกา › โรงถลุงแท่งซิลิคอน MG-Si และดึงผลึกซิลิคอนเวเฟอร์ › ชิป AI Edge & โซลาร์",
      shortNameTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แท่งซิลิคอน (T1) ➔ ซิลิคอนเวเฟอร์ (T2)",
      icon: "💎",
      sector: "tech",
      tierStep: "T0 ➔ T1 ➔ T2",
      minResearch: 0,
      upstreamAssetId: "silica_copper_mine",
      upstreamAssetNameTh: "สัมปทานเหมืองแร่ซิลิกาและทองแดง",
      inputs: { silica_bauxite_ore: 2 },
      outputs: { metallurgical_silicon: 2, silicon_wafer: 2 },
      batchesPerDayBase: 3,
      downstreamProducts: ["ai_edge_module", "vital_signs_monitor", "autonomous_cargo_drone"],
      makeOrBuyNoteTh: "ดึงผลึกแท่งซิลิคอน MG-Si เป็นแผ่นซิลิคอนเวเฟอร์ขัดเงา (ขายส่ง B2B ได้ ฿104/แผ่น หรือนำไปผลิตชิป T3)"
    },
    chain_wafer_microchip_fab: {
      autoRun: false,
      id: "chain_wafer_microchip_fab",
      nameTh: "ห่วงโซ่เซมิคอนดักเตอร์ ขั้นที่ 3: แผ่นซิลิคอนเวเฟอร์ + PCB › ห้องคลีนรูมลิโธกราฟี › ชิปไมโครโพรเซสเซอร์ (ต้องมี R&D 250+)",
      shortNameTh: "ซิลิคอนเวเฟอร์ (T2) + PCB (T3) ➔ ชิปไมโครโพรเซสเซอร์ (T3) ➔ AI/โดรน (T4)",
      icon: "🧠",
      sector: "tech",
      tierStep: "T2 ➔ T3",
      minResearch: 250,
      upstreamAssetId: "silica_copper_mine",
      upstreamAssetNameTh: "เหมืองซิลิกา + แล็บวิจัยเซมิคอนดักเตอร์",
      inputs: { silicon_wafer: 1, pcb: 1 },
      outputs: { microchip: 2 },
      batchesPerDayBase: 2,
      downstreamProducts: ["iotController", "smartMeter", "visionCamera", "ai_edge_module", "vital_signs_monitor", "autonomous_cargo_drone"],
      makeOrBuyNoteTh: "ต้นเกมยังผลิตชิปเองไม่ได้ต้องซื้อจากเซินเจิ้น เมื่อสะสมแต้มวิจัย R&D ครบ 250 แต้มจึงผลิตชิปใช้เองและขายส่ง B2B ได้!"
    },
    chain_forestry_pulp_packaging: {
      id: "chain_forestry_pulp_packaging",
      nameTh: "ห่วงโซ่ป่าปลูกเศรษฐกิจ › โรงเยื่อกระดาษลูกฟูก › กล่องบรรจุภัณฑ์ป้อนทุกสายพาน",
      shortNameTh: "ไม้เศรษฐกิจ/เส้นใย (T0) ➔ กล่องบรรจุภัณฑ์ (T1) ➔ สินค้าส่งออกทุกชนิด (T4)",
      icon: "📦",
      sector: "general",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "forestry_pulp_mill",
      upstreamAssetNameTh: "ป่าปลูกไม้เศรษฐกิจและโรงเยื่อกระดาษ",
      inputs: { raw_cane: 1, natural_latex: 1 },
      outputs: { pack_carton: 3 },
      batchesPerDayBase: 3,
      downstreamProducts: ["artisan_bakery", "herbalDrink", "ready_meal_box", "premium_cooking_oil", "pastry_croissant_box"],
      makeOrBuyNoteTh: "ผลิตกล่องลูกฟูกและบรรจุภัณฑ์เองจากป่าปลูกและเยื่อชานอ้อย หรือขายส่งกล่องให้โรงงานข้างเคียง"
    }
  });

  // 3 Plant-Wide Production Regimes (โหมดควบคุมจังหวะการเดินเครื่องของโรงงาน)
  const PRODUCTION_REGIMES = deepFreeze({
    craft_precision: {
      id: "craft_precision",
      nameTh: "โหมดประณีตไร้ของเสีย (Zero-Defect Craftsmanship)",
      speedMultiplier: 0.94,
      qaBonus: 0.07,
      wearMultiplier: 0.8,
      descTh: "เน้นความละเอียดทุกขั้นตอน ลดความเร็วสายพานลงเล็กน้อยแต่เพิ่มอัตราผ่าน QC สูงสุด"
    },
    lean_balanced: {
      id: "lean_balanced",
      nameTh: "โหมดสมดุลมาตรฐานลีน (Lean Manufacturing Balance)",
      speedMultiplier: 1.0,
      qaBonus: 0.02,
      wearMultiplier: 1.0,
      descTh: "เดินเครื่องตามจังหวะ Takt Time มาตรฐาน สมดุลทั้งความเร็ว คุณภาพ และอายุเครื่องจักร"
    },
    mass_throughput: {
      id: "mass_throughput",
      nameTh: "โหมดเร่งกำลังผลิตล็อตใหญ่ (High-Throughput Mass Production)",
      speedMultiplier: 1.14,
      qaBonus: -0.02,
      wearMultiplier: 1.25,
      descTh: "เร่งความเร็วสายพานเต็มพิกัดเพื่อส่งมอบออเดอร์เร่งด่วน เครื่องจักรสึกหรอเร็วขึ้น"
    }
  });

  // 12 Constructible Greenfield Industrial Estate Expansion Plots across the 56x34 Campus
  const EXPANSION_PLOTS = deepFreeze({
    rawDepot: {
      id: "rawDepot",
      nameTh: "คลังวัตถุดิบต้นน้ำและท่าตรวจรับ IQC",
      shortNameTh: "คลังวัตถุดิบ (Raw Depot)",
      subtitleTh: "ไซโลเก็บวัตถุดิบ • ท่าเทียบรถซัพพลายเออร์ • ตรวจรับ IQC",
      icon: "🏗️",
      category: "logistics",
      cost: 1800000,
      minDay: 4,
      minStaff: 6,
      footprint: { x: 17, y: 15, width: 4, height: 5 },
      doorCell: { x: 19, y: 20 },
      benefitTh: "เพิ่มสถานีจัดซื้อ/รับของความจุสูง เร่งความเร็วออกใบ PO และรับวัตถุดิบ +20%",
      stations: [
        { id: "admin_depot", kind: "admin", x: 18, y: 17, ax: 18, ay: 18, capacity: 12 },
        { id: "receiving_depot", kind: "receiving", x: 20, y: 18, ax: 20, ay: 19, capacity: 12 }
      ]
    },
    prodLineB: {
      id: "prodLineB",
      nameTh: "อาคารสายการผลิตที่ 2 (Smart Line B)",
      shortNameTh: "ไลน์ผลิต 2 (Line B)",
      subtitleTh: "สายพานประกอบอัจฉริยะ SMT • แท่นตรวจ QC ประจำไลน์ B",
      icon: "⚙️",
      category: "production",
      cost: 2400000,
      minDay: 5,
      minStaff: 9,
      footprint: { x: 34, y: 2, width: 5, height: 9 },
      doorCell: { x: 36, y: 11 },
      benefitTh: "เปิดสายการผลิตที่ 2 (Smart Line B) เพิ่มความจุช่างประกอบ +24 คน และ QC +10 คน เร่งความเร็วผลิต +15%",
      stations: [
        { id: "assembly_b1", kind: "assembly", x: 35, y: 4, ax: 35, ay: 5, capacity: 12 },
        { id: "assembly_b2", kind: "assembly", x: 37, y: 4, ax: 37, ay: 5, capacity: 12 },
        { id: "quality_b1", kind: "quality", x: 36, y: 8, ax: 36, ay: 9, capacity: 10 }
      ]
    },
    dispatchHub: {
      id: "dispatchHub",
      nameTh: "ศูนย์กระจายสินค้าและท่าปล่อยรถส่งออก",
      shortNameTh: "ศูนย์ส่งออก (Dispatch Hub)",
      subtitleTh: "สายพานแพ็กกิ้งอัตโนมัติ • ท่าปล่อยรถบรรทุกส่งออก B2B",
      icon: "🚛",
      category: "logistics",
      cost: 2000000,
      minDay: 6,
      minStaff: 10,
      footprint: { x: 33, y: 18, width: 6, height: 4 },
      doorCell: { x: 35, y: 22 },
      benefitTh: "เพิ่มสถานีแพ็กและท่าปล่อยรถความจุสูง เร่งความเร็วแพ็กและส่งออก +25% พร้อมเพิ่มฟลีทรถขนส่ง",
      stations: [
        { id: "packing_hub", kind: "packing", x: 34, y: 19, ax: 34, ay: 20, capacity: 18 },
        { id: "shipping_hub", kind: "shipping", x: 37, y: 19, ax: 37, ay: 20, capacity: 16 }
      ]
    },
    execAnnex: {
      id: "execAnnex",
      nameTh: "ศูนย์พาณิชย์และห้องเจรจาธุรกิจ B2B",
      shortNameTh: "ศูนย์การค้า B2B (Trade Center)",
      subtitleTh: "ห้องรับรองคู่ค้า • ทีมขายองค์กร • ฝ่ายการเงินและนักลงทุนสัมพันธ์",
      icon: "🏛️",
      category: "office",
      cost: 1600000,
      minDay: 5,
      minStaff: 8,
      footprint: { x: 10, y: 2, width: 3, height: 5 },
      doorCell: { x: 11, y: 7 },
      benefitTh: "เพิ่มสถานีฝ่ายขายและบัญชี B2B ความจุสูง เพิ่มอำนาจต่อรองราคาขายกับลูกค้า +6%",
      stations: [
        { id: "sales_annex", kind: "sales", x: 11, y: 4, ax: 11, ay: 5, capacity: 14 },
        { id: "admin_annex", kind: "admin", x: 12, y: 8, ax: 12, ay: 9, capacity: 14 }
      ]
    },
    maintWorkshop: {
      id: "maintWorkshop",
      nameTh: "โรงซ่อมบำรุงเครื่องกลและวิศวกรรม",
      shortNameTh: "โรงซ่อมบำรุง (Maintenance)",
      subtitleTh: "ศูนย์ซ่อมบำรุงเชิงป้องกัน • ห้องสอบเทียบเครื่องมือวัด",
      icon: "🛠️",
      category: "engineering",
      cost: 1500000,
      minDay: 6,
      minStaff: 8,
      footprint: { x: 17, y: 11, width: 4, height: 3 },
      doorCell: { x: 19, y: 14 },
      benefitTh: "ลดอัตราการสึกหรอของเครื่องจักรโรงงานลง 35% และเพิ่มสถานีวิศวกรรมซ่อมบำรุง",
      stations: [
        { id: "research_maint", kind: "research", x: 19, y: 12, ax: 19, ay: 13, capacity: 12 }
      ]
    },
    prodLineC: {
      id: "prodLineC",
      nameTh: "อาคารสายการผลิตอัตโนมัติที่ 3 (Mega Line C)",
      shortNameTh: "ไลน์ผลิต 3 (Mega Line C)",
      subtitleTh: "โรงงานระบบอัตโนมัติและ CNC ความจุสูง • รองรับพนักงาน 200-500 คน",
      icon: "🤖",
      category: "production",
      cost: 3500000,
      minDay: 8,
      minStaff: 16,
      footprint: { x: 17, y: 2, width: 4, height: 8 },
      doorCell: { x: 19, y: 10 },
      benefitTh: "เปิดสายการผลิตที่ 3 (Mega Line C) เพิ่มความจุช่างประกอบ +60 คน และ QC +25 คน เร่งความเร็วผลิต +20%",
      stations: [
        { id: "assembly_c1", kind: "assembly", x: 18, y: 4, ax: 18, ay: 5, capacity: 30 },
        { id: "assembly_c2", kind: "assembly", x: 20, y: 4, ax: 20, ay: 5, capacity: 30 },
        { id: "quality_c1", kind: "quality", x: 19, y: 8, ax: 19, ay: 9, capacity: 25 }
      ]
    },
    solarPlant: {
      id: "solarPlant",
      nameTh: "สถานีพลังงานแสงอาทิตย์และหม้อแปลงนิคม",
      shortNameTh: "โซลาร์ฟาร์ม (Solar Grid)",
      subtitleTh: "ผลิตไฟฟ้าสะอาดใช้ในนิคม • ลดค่าโสหุ้ยรายวัน • เพิ่มคะแนน ESG",
      icon: "☀️",
      category: "utility",
      cost: 2200000,
      minDay: 7,
      minStaff: 10,
      footprint: { x: 9, y: 8, width: 3, height: 3 },
      doorCell: { x: 10, y: 11 },
      benefitTh: "ลดภาระค่าเช่าและสาธารณูปโภครายวันลง 20% และเพิ่มโบนัสชื่อเสียงบริษัทสีเขียว",
      stations: []
    },
    dormitory: {
      id: "dormitory",
      nameTh: "หอพักพนักงานและลานจอดรถนิคม",
      shortNameTh: "หอพัก/ลานจอดรถ (Dorm & Park)",
      subtitleTh: "ที่พักสวัสดิการพนักงาน • ลานจอดรถมอเตอร์ไซค์และรถยนต์ส่วนตัว",
      icon: "🏘️",
      category: "welfare",
      cost: 1400000,
      minDay: 5,
      minStaff: 8,
      footprint: { x: 5, y: 17, width: 6, height: 5 },
      doorCell: { x: 8, y: 22 },
      benefitTh: "เพิ่มความจุจุดพักผ่อนและโรงอาหารรองรับพนักงานระดับร้อยคน พร้อมฟื้นฟูกำลังใจรายวัน",
      stations: [
        { id: "lounge_dorm", kind: "lounge", x: 7, y: 19, ax: 7, ay: 20, capacity: 45 },
        { id: "meal_dorm", kind: "meal", x: 9, y: 19, ax: 9, ay: 20, capacity: 45 }
      ]
    },
    prodLineD: {
      id: "prodLineD",
      nameTh: "อาคารสายการผลิตคลีนรูมและพลังงานที่ 4 (Cleanroom & HV Line D)",
      shortNameTh: "ไลน์ผลิต 4 (Clean & HV Line D)",
      subtitleTh: "สายพานคลีนรูมปลอดเชื้อ & ห้องประกอบเซลล์พลังงานแรงดันสูงบนที่ดินขยายใหม่",
      icon: "⚡",
      category: "production",
      cost: 4200000,
      minDay: 10,
      minStaff: 22,
      footprint: { x: 42, y: 2, width: 9, height: 9 },
      doorCell: { x: 46, y: 11 },
      benefitTh: "เปิดสายการผลิตที่ 4 บนที่ดินฝั่งตะวันออก เพิ่มความจุช่างประกอบ +70 คน และ QC +30 คน เร่งความเร็วผลิต +25%",
      stations: [
        { id: "assembly_d1", kind: "assembly", x: 44, y: 4, ax: 44, ay: 5, capacity: 35 },
        { id: "assembly_d2", kind: "assembly", x: 48, y: 4, ax: 48, ay: 5, capacity: 35 },
        { id: "quality_d1", kind: "quality", x: 46, y: 8, ax: 46, ay: 9, capacity: 30 }
      ]
    },
    qaLab: {
      id: "qaLab",
      nameTh: "ศูนย์ปฏิบัติการทดสอบมาตรฐานสากลและแล็บวิจัย (ISO/IEC QA & R&D Center)",
      shortNameTh: "ศูนย์แล็บ ISO/QA (QA & R&D Lab)",
      subtitleTh: "ห้องทดสอบความทนทาน • ห้องแล็บวิจัยขั้นสูง • รับรองมาตรฐานส่งออกโลก",
      icon: "🔬",
      category: "engineering",
      cost: 2800000,
      minDay: 9,
      minStaff: 14,
      footprint: { x: 42, y: 13, width: 8, height: 6 },
      doorCell: { x: 45, y: 19 },
      benefitTh: "เพิ่มโอกาสผ่าน QC +6% เพิ่มความเร็ววิจัย R&D +20% และเพิ่มสถานีตรวจคุณภาพ/วิจัยความจุสูง",
      stations: [
        { id: "quality_lab1", kind: "quality", x: 44, y: 15, ax: 44, ay: 16, capacity: 24 },
        { id: "research_lab1", kind: "research", x: 47, y: 15, ax: 47, ay: 16, capacity: 18 }
      ]
    },
    waterPlant: {
      id: "waterPlant",
      nameTh: "โรงบำบัดน้ำเสียและระบบสาธารณูปโภคหมุนเวียน (Eco Water & Utility Plant)",
      shortNameTh: "โรงบำบัดน้ำ/ยูทิลิตี้ (Eco Utility)",
      subtitleTh: "ระบบน้ำหมุนเวียนโรงงาน • บำบัดของเสียสีเขียว • รองรับสายคลีนรูมและเคมี",
      icon: "💧",
      category: "utility",
      cost: 2500000,
      minDay: 9,
      minStaff: 12,
      footprint: { x: 42, y: 22, width: 9, height: 7 },
      doorCell: { x: 46, y: 29 },
      benefitTh: "ลดค่าบำรุงรักษาและสาธารณูปโภคเพิ่มเติม ยกระดับชื่อเสียง ESG +3 และเพิ่มความเสถียรสายการผลิต",
      stations: []
    },
    expoHall: {
      id: "expoHall",
      nameTh: "ศูนย์แสดงสินค้าอุตสาหกรรมและสถาบันฝึกอบรม (Corporate Expo & Academy)",
      shortNameTh: "ศูนย์เอ็กซ์โป/สถาบัน (Expo & Academy)",
      subtitleTh: "ฮอลล์จัดแสดงผลิตภัณฑ์ B2B • หอประชุมวิชาการและพัฒนาผู้นำ 10 ระดับ",
      icon: "🌐",
      category: "office",
      cost: 3000000,
      minDay: 11,
      minStaff: 18,
      footprint: { x: 4, y: 25, width: 9, height: 6 },
      doorCell: { x: 8, y: 25 },
      benefitTh: "ดึงดูดดีล B2B มูลค่าสูงขึ้น +8% และเพิ่มความเร็วการเรียนรู้ในศูนย์ฝึกอบรม +25%",
      stations: [
        { id: "sales_expo", kind: "sales", x: 6, y: 27, ax: 6, ay: 28, capacity: 20 },
        { id: "training_expo", kind: "training", x: 10, y: 27, ax: 10, ay: 28, capacity: 28 }
      ]
    },
    refineryMill: {
      id: "refineryMill",
      nameTh: "โรงโม่แป้งและโรงกลั่นสกัดวัตถุดิบกลางน้ำ (Midstream Milling & Refinery Plant)",
      shortNameTh: "โรงโม่/โรงกลั่นกลางน้ำ (Refinery Mill)",
      subtitleTh: "โม่ข้าวเปลือกเป็นแป้ง • กลั่นปาล์มดิบเป็นน้ำมันบริสุทธิ์ • หลอมซิลิคอนเวเฟอร์",
      icon: "🌾",
      category: "production",
      cost: 2600000,
      minDay: 6,
      minStaff: 10,
      footprint: { x: 21, y: 24, width: 9, height: 6 },
      doorCell: { x: 25, y: 24 },
      benefitTh: "เพิ่มกำลังการแปรรูปวัตถุดิบกลางน้ำในห่วงโซ่ลูกโซ่ +100% ต่อวัน และเพิ่มสถานีรับของ/ประกอบแปรรูป",
      stations: [
        { id: "assembly_mill1", kind: "assembly", x: 23, y: 26, ax: 23, ay: 27, capacity: 24 },
        { id: "receiving_mill1", kind: "receiving", x: 27, y: 26, ax: 27, ay: 27, capacity: 18 }
      ]
    },
    bakeryPlant: {
      id: "bakeryPlant",
      nameTh: "โรงอบเบเกอรี่และแปรรูปอาหารครบวงจร (Automated Bakery & Food Plant)",
      shortNameTh: "โรงอบเบเกอรี่/อาหาร (Bakery Plant)",
      subtitleTh: "เตาอบอุโมงค์ต่อเนื่อง • สายพานขนมปังโฮลเกรน อาหารพร้อมทาน และแพ็กกิ้งอาหาร",
      icon: "🍞",
      category: "production",
      cost: 2900000,
      minDay: 7,
      minStaff: 12,
      footprint: { x: 31, y: 24, width: 9, height: 6 },
      doorCell: { x: 35, y: 24 },
      benefitTh: "เร่งความเร็วการผลิตสินค้ากลุ่มเบเกอรี่และอาหารแปรรูป +20% พร้อมเพิ่มสถานีประกอบและแพ็กกิ้งความจุสูง",
      stations: [
        { id: "assembly_bake1", kind: "assembly", x: 33, y: 26, ax: 33, ay: 27, capacity: 28 },
        { id: "packing_bake1", kind: "packing", x: 37, y: 26, ax: 37, ay: 27, capacity: 24 }
      ]
    }
  });

  // External World & Living Off-Site Corporate Ecosystem Blueprint (16 บริษัทภายนอกที่มีชีวิตชีวา เป็นทั้งคู่ค้า ซัพพลายเออร์ พันธมิตร และคู่แข่งกันเอง)
  const EXTERNAL_WORLD_DEFAULTS = deepFreeze({
    corporations: [
      {
        id: "siam_tech",
        nameTh: "บมจ. สยามเทค โฮลดิ้งส์",
        symbol: "STECH",
        sector: "tech",
        sectorTh: "เทคโนโลยีและสมาร์ตดีไวซ์",
        originTh: "กรุงเทพฯ / นิคมลาดกระบัง",
        tierTh: "องค์กรมหาชน (SET100)",
        roles: ["client", "partner", "competitor"],
        relationshipMode: "cordial",
        baseTrust: 58,
        marketSharePct: 14.5,
        strength: 66,
        cashMillionBaht: 420,
        pricePremium: 0.05,
        paymentDays: 1,
        sellsMaterials: ["pcb", "casing", "led"],
        buysMaterials: ["silicon_wafer", "microchip", "pcb", "sensor", "optical_lens", "heat_sink"],
        buysProducts: ["speaker", "lamp", "iotController", "smartMeter", "visionCamera", "ai_edge_module"],
        rivalsWith: ["titan_elec", "tokyo_elec", "shenzhen_semi"],
        alliesWith: ["metro_retail", "green_power"],
        strategyTh: "ขยายแพลตฟอร์มสมาร์ตโฮมและ AI Edge พร้อมรับซื้อแผ่นเวเฟอร์และชิปจากโรงงานพันธมิตรในไทย"
      },
      {
        id: "shenzhen_semi",
        nameTh: "บจก. เซินเจิ้น เซมิคอนดักเตอร์ แอนด์ ฟาวน์ดรี",
        symbol: "SZSEMI",
        sector: "tech",
        sectorTh: "เซมิคอนดักเตอร์และชิ้นส่วนอิเล็กทรอนิกส์",
        originTh: "เซินเจิ้น / ท่าเรือแหลมฉบัง",
        tierTh: "ฟาวน์ดรีข้ามชาติระดับโลก",
        roles: ["supplier", "client", "competitor"],
        relationshipMode: "neutral",
        baseTrust: 52,
        marketSharePct: 16.0,
        strength: 74,
        cashMillionBaht: 680,
        pricePremium: 0.06,
        paymentDays: 1,
        sellsMaterials: ["pcb", "microchip", "led", "sensor", "heat_sink", "optical_lens", "power_inverter_ic", "silica_bauxite_ore", "metallurgical_silicon", "silicon_wafer"],
        buysMaterials: ["silica_bauxite_ore", "metallurgical_silicon", "silicon_wafer", "copper_coil"],
        buysProducts: ["ai_edge_module", "visionCamera"],
        rivalsWith: ["tokyo_elec", "titan_elec"],
        alliesWith: ["pacific_solar"],
        strategyTh: "ขายชิปและเวเฟอร์ให้โรงงานตั้งต้น แต่พร้อมรับซื้อแท่งซิลิคอนบริสุทธิ์ MG-Si และแข่งประมูลดีล AI"
      },
      {
        id: "tokyo_elec",
        nameTh: "บจก. โตเกียว อิเล็กทรอนิกส์ แอนด์ โรโบติกส์ (ประเทศไทย)",
        symbol: "TKELEC",
        sector: "tech",
        sectorTh: "อิเล็กทรอนิกส์ความแม่นยำสูงและหุ่นยนต์",
        originTh: "โอซาก้า / นิคมโรจนะ อยุธยา",
        tierTh: "คู่ค้าส่งออกญี่ปุ่น (JCCI)",
        roles: ["client", "partner", "supplier"],
        relationshipMode: "partner",
        baseTrust: 64,
        marketSharePct: 12.0,
        strength: 70,
        cashMillionBaht: 540,
        pricePremium: 0.08,
        paymentDays: 1,
        sellsMaterials: ["optical_lens", "sensor", "microchip", "driver"],
        buysMaterials: ["silicon_wafer", "metallurgical_silicon", "heat_sink", "wire_harness", "pcb"],
        buysProducts: ["iotController", "autoSensor", "smartMeter", "visionCamera", "servoActuator", "autonomous_cargo_drone"],
        rivalsWith: ["shenzhen_semi", "titan_elec"],
        alliesWith: ["asia_autoparts", "siam_aero_robotics"],
        strategyTh: "เน้นมาตรฐาน Zero-Defect ญี่ปุ่น รับซื้อชิ้นส่วนความแม่นยำสูงและโดรนขนส่งอุตสาหกรรม"
      },
      {
        id: "titan_elec",
        nameTh: "บมจ. ไททัน อิเล็กทรอนิกส์ อินดัสทรี",
        symbol: "TITAN",
        sector: "tech",
        sectorTh: "อิเล็กทรอนิกส์และอุปกรณ์สมาร์ตเทค",
        originTh: "สมุทรปราการ / บางปู",
        tierTh: "เจ้าตลาดสายพานล็อตใหญ่",
        roles: ["competitor", "client"],
        relationshipMode: "rival",
        baseTrust: 42,
        marketSharePct: 13.5,
        strength: 68,
        cashMillionBaht: 390,
        pricePremium: 0.02,
        paymentDays: 1,
        sellsMaterials: ["casing", "driver"],
        buysMaterials: ["pcb", "copper_coil", "polymer_resin", "pack_carton"],
        buysProducts: ["speaker", "lamp"],
        rivalsWith: ["siam_tech", "tokyo_elec", "apex_ind"],
        alliesWith: ["siam_metal"],
        strategyTh: "ทุ่มกำลังการผลิตขนาดใหญ่ตัดราคาคู่แข่ง แต่ยังต้องสั่งซื้อแผงวงจร PCB และขดลวดทองแดงจากตลาด"
      },
      {
        id: "asia_autoparts",
        nameTh: "บจก. เอเชีย ออโต้พาร์ท แอนด์ อีวี โมบิลิตี้",
        symbol: "ASIAEV",
        sector: "automotive",
        sectorTh: "ยานยนต์ไฟฟ้าและชิ้นส่วน OEM",
        originTh: "นิคมอีสเทิร์นซีบอร์ด ระยอง",
        tierTh: "ผู้ผลิตยานยนต์ OEM ระดับภูมิภาค",
        roles: ["client", "partner", "competitor"],
        relationshipMode: "cordial",
        baseTrust: 56,
        marketSharePct: 11.5,
        strength: 65,
        cashMillionBaht: 510,
        pricePremium: 0.06,
        paymentDays: 1,
        sellsMaterials: ["metal_sheet", "wire_harness"],
        buysMaterials: ["polymer_resin", "metal_sheet", "copper_coil", "wire_harness", "battery", "cathode_electrolyte"],
        buysProducts: ["autoSensor", "evController", "batteryPack", "servoActuator", "ev_suspension_kit"],
        rivalsWith: ["eastern_auto", "apex_ind"],
        alliesWith: ["tokyo_elec", "siam_metal"],
        strategyTh: "ขยายฐานประกอบรถยนต์ไฟฟ้า EV ใน EEC รับซื้อทั้งชุดควบคุม EV แพ็กแบตเตอรี่ และเม็ดโพลีเมอร์"
      },
      {
        id: "eastern_auto",
        nameTh: "บจก. อีสเทิร์น ออโต้เทค แอนด์ เมคคาทรอนิกส์",
        symbol: "EAUTO",
        sector: "automotive",
        sectorTh: "ชิ้นส่วนยานยนต์และระบบส่งกำลัง",
        originTh: "แหลมฉบัง ชลบุรี",
        tierTh: "คู่แข่งสายยานยนต์",
        roles: ["competitor", "client", "supplier"],
        relationshipMode: "rival",
        baseTrust: 45,
        marketSharePct: 10.5,
        strength: 64,
        cashMillionBaht: 350,
        pricePremium: 0.04,
        paymentDays: 1,
        sellsMaterials: ["wire_harness", "casing", "heat_sink"],
        buysMaterials: ["metal_sheet", "copper_coil", "polymer_resin", "sensor"],
        buysProducts: ["autoSensor", "ev_suspension_kit"],
        rivalsWith: ["asia_autoparts", "siam_metal"],
        alliesWith: ["petro_chem_siam"],
        strategyTh: "แข่งขันประมูลงานชิ้นส่วนยานยนต์กับเอเชียออโต้พาร์ท และรับซื้อแผ่นโลหะรีดเย็นจากโรงถลุง"
      },
      {
        id: "siam_metal",
        nameTh: "บจก. สยามเมทัล แอนด์ ฮาร์เนส อินดัสทรี",
        symbol: "SMETAL",
        sector: "automotive",
        sectorTh: "ถลุงโลหะ ขดลวดทองแดง และเหมืองแร่",
        originTh: "นิคมอมตะซิตี้ ชลบุรี / ลพบุรี",
        tierTh: "ซัพพลายเออร์โลหะหลัก",
        roles: ["supplier", "client", "partner"],
        relationshipMode: "cordial",
        baseTrust: 58,
        marketSharePct: 7.5,
        strength: 60,
        cashMillionBaht: 320,
        pricePremium: 0.03,
        paymentDays: 1,
        sellsMaterials: ["copper_iron_ore", "silica_bauxite_ore", "lithium_brine_ore", "metal_sheet", "copper_coil", "casing", "driver", "wire_harness", "heat_sink", "polymer_resin", "natural_latex"],
        buysMaterials: ["copper_iron_ore", "metallurgical_silicon", "polymer_resin"],
        buysProducts: ["servoActuator", "smartMeter"],
        rivalsWith: ["eastern_auto"],
        alliesWith: ["asia_autoparts", "titan_elec"],
        strategyTh: "จำหน่ายแร่ดิบและโลหะขึ้นรูปทุกชนิด พร้อมรับซื้อแขนกลเซอร์โวไปอัปเกรดโรงถลุง"
      },
      {
        id: "cp_health",
        nameTh: "บมจ. เจริญผล ฟู้ดแอนด์เฮลท์ โกลบอล",
        symbol: "CPFH",
        sector: "food",
        sectorTh: "อุตสาหกรรมอาหาร เบเกอรี่ และค้าปลีก",
        originTh: "กรุงเทพฯ / นครปฐม",
        tierTh: "เครือเกษตรและอาหารครบวงจร",
        roles: ["client", "partner", "supplier"],
        relationshipMode: "partner",
        baseTrust: 62,
        marketSharePct: 12.5,
        strength: 69,
        cashMillionBaht: 610,
        pricePremium: 0.05,
        paymentDays: 0,
        sellsMaterials: ["paddy_grain", "crude_palm", "raw_cane", "fresh_milk_soy", "artisan_flour", "refined_palm_oil", "refined_sugar_syrup"],
        buysMaterials: ["artisan_flour", "refined_palm_oil", "refined_sugar_syrup", "bakery_dough_butter", "probiotic_culture", "foil_pouch", "pack_carton"],
        buysProducts: ["artisan_bakery", "pastry_croissant_box", "plant_based_meat", "premium_cooking_oil", "ready_meal_box", "dairy_protein_shake", "herbalDrink", "energyProtein", "functionalShot", "probioticElixir"],
        rivalsWith: ["siam_naturals", "metro_retail"],
        alliesWith: ["thai_organic", "biomed_siam"],
        strategyTh: "รับซื้อทั้งแป้งโม่ละเอียด โดว์เนยสด น้ำมันปาล์มบริสุทธิ์ และสินค้าเบเกอรี่/โปรตีนจากพืชไปวางจำหน่ายทั่วเอเชีย"
      },
      {
        id: "thai_organic",
        nameTh: "สหกรณ์เกษตรอินทรีย์และโรงโม่แป้งสยาม",
        symbol: "THORG",
        sector: "food",
        sectorTh: "เกษตรต้นน้ำ สมุนไพร และบรรจุภัณฑ์",
        originTh: "เชียงใหม่ / สุรินทร์ / สุราษฎร์ธานี",
        tierTh: "เครือข่ายสหกรณ์ต้นน้ำ",
        roles: ["supplier", "client", "partner"],
        relationshipMode: "cordial",
        baseTrust: 60,
        marketSharePct: 6.0,
        strength: 54,
        cashMillionBaht: 210,
        pricePremium: 0.03,
        paymentDays: 0,
        sellsMaterials: ["paddy_grain", "crude_palm", "raw_cane", "fresh_milk_soy", "natural_latex", "timber_bamboo_log", "raw_extract", "glass_bottle", "pack_carton", "probiotic_culture", "foil_pouch", "artisan_flour", "refined_palm_oil", "refined_sugar_syrup", "bakery_dough_butter"],
        buysMaterials: ["pack_carton", "glass_bottle", "foil_pouch", "artisan_flour"],
        buysProducts: ["solarCharger", "herbalDrink", "premium_cooking_oil"],
        rivalsWith: ["siam_naturals"],
        alliesWith: ["cp_health"],
        strategyTh: "แหล่งวัตถุดิบเกษตรต้นน้ำที่ใหญ่ที่สุดในประเทศ พร้อมรับซื้อบรรจุภัณฑ์และเครื่องชาร์จโซลาร์สำหรับฟาร์ม"
      },
      {
        id: "siam_naturals",
        nameTh: "บมจ. สยามเนเชอรัล ฟู้ดส์ แอนด์ เบเกอรี่",
        symbol: "SNAT",
        sector: "food",
        sectorTh: "อาหารแปรรูปและเครื่องดื่มสุขภาพ",
        originTh: "ปทุมธานี / พระนครศรีอยุธยา",
        tierTh: "คู่แข่งสายอาหารสุขภาพ",
        roles: ["competitor", "client"],
        relationshipMode: "rival",
        baseTrust: 46,
        marketSharePct: 9.0,
        strength: 58,
        cashMillionBaht: 290,
        pricePremium: 0.03,
        paymentDays: 1,
        sellsMaterials: ["artisan_flour", "refined_sugar_syrup"],
        buysMaterials: ["artisan_flour", "refined_palm_oil", "bakery_dough_butter", "raw_extract", "glass_bottle", "pack_carton"],
        buysProducts: ["artisan_bakery", "pastry_croissant_box", "plant_based_meat"],
        rivalsWith: ["cp_health", "thai_organic"],
        alliesWith: ["metro_retail"],
        strategyTh: "แข่งแย่งพื้นที่เชลฟ์อาหารสุขภาพกับเจริญผล แต่หากผลิตแป้งและโดว์ไม่ทันจะสั่งซื้อจากโรงโม่ของเรา"
      },
      {
        id: "green_power",
        nameTh: "บจก. กรีนพาวเวอร์ โซลูชั่นส์ เอเชีย",
        symbol: "GPWR",
        sector: "energy",
        sectorTh: "พลังงานสะอาดและสมาร์ตกริด",
        originTh: "ชัยภูมิ / กรุงเทพฯ",
        tierTh: "พันธมิตรพลังงานสะอาด BOI",
        roles: ["client", "partner", "competitor"],
        relationshipMode: "partner",
        baseTrust: 57,
        marketSharePct: 8.5,
        strength: 62,
        cashMillionBaht: 460,
        pricePremium: 0.07,
        paymentDays: 1,
        sellsMaterials: ["solar_cell"],
        buysMaterials: ["solar_cell", "battery", "cathode_electrolyte", "power_inverter_ic", "silicon_wafer", "copper_coil"],
        buysProducts: ["solarCharger", "homeInverter", "batteryPack", "evFastCharger", "solid_state_powerwall", "smartMeter"],
        rivalsWith: ["solartech_asia"],
        alliesWith: ["pacific_solar", "siam_tech"],
        strategyTh: "ลงทุนเมกะโปรเจกต์โซลาร์ฟาร์มและสถานีชาร์จ EV รับซื้อทั้งเซลล์แสงอาทิตย์ แบตเตอรี่ และตู้ Powerwall"
      },
      {
        id: "pacific_solar",
        nameTh: "บจก. แปซิฟิก โซลาร์ แอนด์ ลิเธียม เพาเวอร์",
        symbol: "PSOLAR",
        sector: "energy",
        sectorTh: "เหมืองลิเธียม โซลาร์เซลล์ และแบตเตอรี่",
        originTh: "นิคมอีสเทิร์นซีบอร์ด ระยอง",
        tierTh: "ซัพพลายเออร์พลังงานและแร่แบตเตอรี่",
        roles: ["supplier", "client", "partner"],
        relationshipMode: "cordial",
        baseTrust: 53,
        marketSharePct: 7.0,
        strength: 61,
        cashMillionBaht: 380,
        pricePremium: 0.05,
        paymentDays: 1,
        sellsMaterials: ["lithium_brine_ore", "cathode_electrolyte", "solar_cell", "battery", "power_inverter_ic", "copper_coil"],
        buysMaterials: ["metallurgical_silicon", "silicon_wafer", "cathode_electrolyte", "heat_sink"],
        buysProducts: ["homeInverter", "solid_state_powerwall"],
        rivalsWith: ["solartech_asia"],
        alliesWith: ["green_power", "shenzhen_semi"],
        strategyTh: "นำเข้าแร่ลิเธียมและผลิตเซลล์พลังงาน พร้อมรับซื้อแผ่นซิลิคอนเวเฟอร์และสารแคโทดจากโรงงานในไทย"
      },
      {
        id: "solartech_asia",
        nameTh: "บจก. โซลาร์เทค เอเชีย แอนด์ เพาเวอร์กริด",
        symbol: "STECH-E",
        sector: "energy",
        sectorTh: "พลังงานแสงอาทิตย์และอินเวอร์เตอร์",
        originTh: "ฉะเชิงเทรา",
        tierTh: "คู่แข่งสายพลังงานสะอาด",
        roles: ["competitor", "client"],
        relationshipMode: "rival",
        baseTrust: 44,
        marketSharePct: 7.5,
        strength: 62,
        cashMillionBaht: 310,
        pricePremium: 0.04,
        paymentDays: 1,
        sellsMaterials: ["heat_sink"],
        buysMaterials: ["silicon_wafer", "solar_cell", "battery", "power_inverter_ic"],
        buysProducts: ["solarCharger", "evFastCharger"],
        rivalsWith: ["green_power", "pacific_solar"],
        alliesWith: ["apex_ind"],
        strategyTh: "แข่งขันประมูลโครงการโซลาร์รูฟท็อปกับกรีนพาวเวอร์ และรับซื้อชิปกำลังไฟฟ้า IGBT ไปประกอบ"
      },
      {
        id: "biomed_siam",
        nameTh: "บมจ. สยามไบโอเมด แอนด์ เมดิคัล ดีไวซ์",
        symbol: "SBIOMED",
        sector: "biomed",
        sectorTh: "เครื่องมือแพทย์และโภชนเภสัชชีวภาพ",
        originTh: "อุทยานวิทยาศาสตร์ ปทุมธานี",
        tierTh: "เครือโรงพยาบาลและนวัตกรรมการแพทย์",
        roles: ["client", "partner", "supplier"],
        relationshipMode: "partner",
        baseTrust: 61,
        marketSharePct: 6.5,
        strength: 63,
        cashMillionBaht: 490,
        pricePremium: 0.09,
        paymentDays: 1,
        sellsMaterials: ["probiotic_culture", "raw_extract", "foil_pouch", "optical_lens"],
        buysMaterials: ["probiotic_culture", "raw_extract", "optical_lens", "sensor", "microchip", "foil_pouch", "glass_bottle"],
        buysProducts: ["synbiotic_medical_drink", "vital_signs_monitor", "probioticElixir", "functionalShot"],
        rivalsWith: ["apex_ind"],
        alliesWith: ["cp_health", "tokyo_elec"],
        strategyTh: "จ่ายราคาพรีเมียมสูงสุดสำหรับเครื่องมอนิเตอร์สัญญาณชีพ โภชนเภสัชซินไบโอติกส์ และหัวเชื้อชีวภาพบริสุทธิ์"
      },
      {
        id: "siam_aero_robotics",
        nameTh: "บจก. สยาม แอโรสเปซ แอนด์ ออโตโนมัส โรโบติกส์",
        symbol: "SAERO",
        sector: "aerospace_robotics",
        sectorTh: "อากาศยานไร้คนขับและหุ่นยนต์อุตสาหกรรม",
        originTh: "นิคมการบินภาคตะวันออก อู่ตะเภา",
        tierTh: "ผู้นำดีพเทคและโลจิสติกส์ทางอากาศ",
        roles: ["client", "partner", "competitor"],
        relationshipMode: "cordial",
        baseTrust: 59,
        marketSharePct: 5.5,
        strength: 67,
        cashMillionBaht: 530,
        pricePremium: 0.1,
        paymentDays: 1,
        sellsMaterials: ["sensor", "casing"],
        buysMaterials: ["microchip", "battery", "sensor", "optical_lens", "polymer_resin", "copper_coil", "pcb"],
        buysProducts: ["autonomous_cargo_drone", "servoActuator", "ai_edge_module", "visionCamera"],
        rivalsWith: ["apex_ind", "titan_elec"],
        alliesWith: ["tokyo_elec", "green_power"],
        strategyTh: "พัฒนาฝูงโดรนขนส่งและแขนกลอัจฉริยะในเขต EEC รับซื้อชิป แบตเตอรี่ลิเธียม และโดรนสำเร็จรูปราคาสูง"
      },
      {
        id: "petro_chem_siam",
        nameTh: "บมจ. มาบตาพุด ปิโตรเคมี แอนด์ โพลีเมอร์",
        symbol: "MPETRO",
        sector: "automotive",
        sectorTh: "ปิโตรเคมี เม็ดพลาสติก และวัสดุศาสตร์",
        originTh: "นิคมมาบตาพุด ระยอง",
        tierTh: "ผู้ผลิตปิโตรเคมีต้นน้ำ-กลางน้ำ",
        roles: ["supplier", "client", "competitor"],
        relationshipMode: "neutral",
        baseTrust: 54,
        marketSharePct: 6.0,
        strength: 65,
        cashMillionBaht: 580,
        pricePremium: 0.04,
        paymentDays: 1,
        sellsMaterials: ["crude_petro_feedstock", "natural_latex", "polymer_resin", "foil_pouch", "pack_carton", "timber_bamboo_log"],
        buysMaterials: ["natural_latex", "polymer_resin", "refined_palm_oil", "foil_pouch"],
        buysProducts: ["premium_cooking_oil", "smartMeter", "iotController"],
        rivalsWith: ["thai_organic"],
        alliesWith: ["eastern_auto", "apex_ind"],
        strategyTh: "ป้อนสารตั้งต้นปิโตรเคมีและเม็ดเรซินให้โรงงานทั่วประเทศ และรับซื้อน้ำมันปาล์มบริสุทธิ์ไปผลิตไบโอพลาสติก"
      },
      {
        id: "metro_retail",
        nameTh: "บมจ. นครหลวง ดิสทริบิวชั่น แอนด์ โลจิสติกส์",
        symbol: "METRO",
        sector: "general",
        sectorTh: "ศูนย์ค้าส่งและเครือข่ายกระจายสินค้า",
        originTh: "กรุงเทพฯ / บางนา-ตราด",
        tierTh: "ศูนย์ค้าส่งทั่วประเทศ",
        roles: ["client", "partner"],
        relationshipMode: "cordial",
        baseTrust: 54,
        marketSharePct: 5.0,
        strength: 56,
        cashMillionBaht: 410,
        pricePremium: 0.03,
        paymentDays: 0,
        sellsMaterials: ["pack_carton", "glass_bottle", "foil_pouch"],
        buysMaterials: ["pack_carton", "foil_pouch", "glass_bottle", "artisan_flour", "refined_sugar_syrup"],
        buysProducts: ["speaker", "lamp", "herbalDrink", "solarCharger", "probioticElixir", "artisan_bakery", "pastry_croissant_box", "ready_meal_box"],
        rivalsWith: ["cp_health"],
        alliesWith: ["siam_naturals", "siam_tech"],
        strategyTh: "รับซื้อสินค้าอุปโภคบริโภคและบรรจุภัณฑ์ล็อตใหญ่ด้วยเงินสดทันใจ (COD) เพื่อกระจายสู่ร้านค้าทั่วประเทศ"
      },
      {
        id: "apex_ind",
        nameTh: "บมจ. เอเพ็กซ์ อินดัสเตรียล โฮลดิ้งส์ กรุ๊ป",
        symbol: "APEX",
        sector: "multi",
        sectorTh: "กลุ่มอุตสาหกรรมข้ามชาติครบวงจร",
        originTh: "กรุงเทพฯ / ชลบุรี",
        tierTh: "คู่แข่งกลุ่มทุนยักษ์ใหญ่",
        roles: ["competitor", "client"],
        relationshipMode: "rival",
        baseTrust: 40,
        marketSharePct: 11.0,
        strength: 74,
        cashMillionBaht: 750,
        pricePremium: 0.05,
        paymentDays: 1,
        sellsMaterials: ["metal_sheet", "casing"],
        buysMaterials: ["silicon_wafer", "microchip", "battery", "power_inverter_ic", "cathode_electrolyte"],
        buysProducts: ["ai_edge_module", "solid_state_powerwall", "autonomous_cargo_drone"],
        rivalsWith: ["siam_tech", "asia_autoparts", "biomed_siam", "siam_aero_robotics"],
        alliesWith: ["solartech_asia", "petro_chem_siam"],
        strategyTh: "กลุ่มทุนใหญ่ที่แข่งขันในหลายอุตสาหกรรม แต่ยังต้องพึ่งพาการสั่งซื้อแผ่นเวเฟอร์และชิปขั้นสูงจากผู้ผลิตที่มีแล็บ R&D"
      }
    ],
    clients: [
      { id: "siam_tech", nameTh: "บมจ. สยามเทค โฮลดิ้งส์", sector: "tech", tierTh: "องค์กรมหาชน (SET100)", baseTrust: 55, pricePremium: 0.04, paymentDays: 1, preferredProducts: ["speaker", "lamp", "iotController", "smartMeter", "visionCamera", "ai_edge_module"] },
      { id: "asia_autoparts", nameTh: "บจก. เอเชีย ออโต้พาร์ท แอนด์ อีวี", sector: "automotive", tierTh: "ผู้ผลิตยานยนต์ OEM", baseTrust: 52, pricePremium: 0.06, paymentDays: 1, preferredProducts: ["autoSensor", "evController", "batteryPack", "servoActuator", "ev_suspension_kit"] },
      { id: "cp_health", nameTh: "บมจ. เจริญผล ฟู้ดแอนด์เฮลท์", sector: "food", tierTh: "เครือค้าปลีกและสุขภาพ", baseTrust: 56, pricePremium: 0.03, paymentDays: 0, preferredProducts: ["artisan_bakery", "pastry_croissant_box", "plant_based_meat", "premium_cooking_oil", "ready_meal_box", "dairy_protein_shake", "herbalDrink", "energyProtein", "functionalShot", "probioticElixir"] },
      { id: "green_power", nameTh: "บจก. กรีนพาวเวอร์ โซลูชั่นส์ เอเชีย", sector: "energy", tierTh: "พันธมิตรพลังงานสะอาด BOI", baseTrust: 50, pricePremium: 0.07, paymentDays: 1, preferredProducts: ["solarCharger", "homeInverter", "batteryPack", "evFastCharger", "solid_state_powerwall"] },
      { id: "tokyo_elec", nameTh: "บจก. โตเกียว อิเล็กทรอนิกส์ (ประเทศไทย)", sector: "tech", tierTh: "คู่ค้าส่งออกญี่ปุ่น", baseTrust: 60, pricePremium: 0.08, paymentDays: 1, preferredProducts: ["iotController", "autoSensor", "smartMeter", "visionCamera", "servoActuator", "autonomous_cargo_drone"] },
      { id: "metro_retail", nameTh: "บมจ. นครหลวง ดิสทริบิวชั่น", sector: "general", tierTh: "ศูนย์ค้าส่งทั่วประเทศ", baseTrust: 48, pricePremium: 0.02, paymentDays: 0, preferredProducts: ["speaker", "lamp", "herbalDrink", "solarCharger", "probioticElixir", "artisan_bakery", "pastry_croissant_box"] },
      { id: "biomed_siam", nameTh: "บมจ. สยามไบโอเมด แอนด์ เมดิคัล ดีไวซ์", sector: "biomed", tierTh: "เครือโรงพยาบาลและนวัตกรรมการแพทย์", baseTrust: 61, pricePremium: 0.09, paymentDays: 1, preferredProducts: ["synbiotic_medical_drink", "vital_signs_monitor", "probioticElixir", "functionalShot"] },
      { id: "siam_aero_robotics", nameTh: "บจก. สยาม แอโรสเปซ แอนด์ ออโตโนมัส โรโบติกส์", sector: "aerospace_robotics", tierTh: "ผู้นำดีพเทคและโลจิสติกส์ทางอากาศ", baseTrust: 59, pricePremium: 0.1, paymentDays: 1, preferredProducts: ["autonomous_cargo_drone", "servoActuator", "ai_edge_module", "visionCamera"] }
    ],
    suppliers: [
      { id: "shenzhen_semi", nameTh: "บจก. เซินเจิ้น เซมิคอนดักเตอร์ ซัพพลาย", originTh: "เซินเจิ้น / ท่าเรือแหลมฉบัง", specialtyTh: "แผงวงจร ชิป เลนส์ออปติคัล เวเฟอร์ และแร่ซิลิกา", materials: ["pcb", "microchip", "led", "sensor", "heat_sink", "optical_lens", "power_inverter_ic", "silica_bauxite_ore", "metallurgical_silicon", "silicon_wafer"], baseTrust: 50, creditTermsTh: "COD / Net 7" },
      { id: "siam_metal", nameTh: "บจก. สยามเมทัล แอนด์ ฮาร์เนส อินดัสทรี", originTh: "นิคมอมตะซิตี้ ชลบุรี", specialtyTh: "แร่เหล็ก-ทองแดง แผ่นโลหะ ขดลวด ตัวถัง และชุดสายไฟ", materials: ["copper_iron_ore", "silica_bauxite_ore", "lithium_brine_ore", "casing", "driver", "metal_sheet", "wire_harness", "heat_sink", "copper_coil", "polymer_resin", "natural_latex"], baseTrust: 55, creditTermsTh: "Net 7" },
      { id: "thai_organic", nameTh: "สหกรณ์เกษตรอินทรีย์และสารสกัดไทย", originTh: "นครปฐม / เชียงใหม่", specialtyTh: "ผลผลิตเกษตรต้นน้ำ แป้งโม่ โดว์เนย สารสกัด และบรรจุภัณฑ์", materials: ["raw_extract", "glass_bottle", "pack_carton", "probiotic_culture", "foil_pouch", "paddy_grain", "crude_palm", "raw_cane", "fresh_milk_soy", "timber_bamboo_log", "artisan_flour", "refined_palm_oil", "refined_sugar_syrup", "bakery_dough_butter"], baseTrust: 58, creditTermsTh: "COD / Net 7" },
      { id: "pacific_solar", nameTh: "บจก. แปซิฟิก โซลาร์ แอนด์ ลิเธียม เพาเวอร์", originTh: "นิคมอีสเทิร์นซีบอร์ด ระยอง", specialtyTh: "แร่ลิเธียม แคโทดอิเล็กโทรไลต์ แผงโซลาร์เซลล์ และแบตเตอรี่", materials: ["lithium_brine_ore", "cathode_electrolyte", "solar_cell", "battery", "power_inverter_ic", "copper_coil"], baseTrust: 48, creditTermsTh: "Net 14" },
      { id: "petro_chem_siam", nameTh: "บมจ. มาบตาพุด ปิโตรเคมี แอนด์ โพลีเมอร์", originTh: "นิคมมาบตาพุด ระยอง", specialtyTh: "สารตั้งต้นปิโตรเคมี น้ำยางพารา เม็ดพลาสติกเรซิน และฟอยล์", materials: ["crude_petro_feedstock", "natural_latex", "polymer_resin", "foil_pouch", "pack_carton", "timber_bamboo_log"], baseTrust: 54, creditTermsTh: "Net 7" }
    ],
    competitors: [
      { id: "titan_elec", nameTh: "บมจ. ไททัน อิเล็กทรอนิกส์", sector: "tech", sectorTh: "อิเล็กทรอนิกส์และสมาร์ตเทค", marketSharePct: 22.0, strength: 68, strategyTh: "เน้นกำลังการผลิตขนาดใหญ่และตัดราคา" },
      { id: "eastern_auto", nameTh: "บจก. อีสเทิร์น ออโต้เทค", sector: "automotive", sectorTh: "ชิ้นส่วนยานยนต์และ EV", marketSharePct: 19.0, strength: 64, strategyTh: "เน้นมาตรฐาน QC เข้มงวดและสัญญาระยะยาว" },
      { id: "siam_naturals", nameTh: "บมจ. สยามเนเชอรัล ฟู้ดส์", sector: "food", sectorTh: "อาหารและเครื่องดื่มสุขภาพ", marketSharePct: 18.0, strength: 58, strategyTh: "เน้นกระจายสินค้าไวและออกสินค้าใหม่ต่อเนื่อง" },
      { id: "solartech_asia", nameTh: "บจก. โซลาร์เทค เอเชีย", sector: "energy", sectorTh: "พลังงานสะอาดและโซลาร์", marketSharePct: 16.5, strength: 62, strategyTh: "เน้นนวัตกรรม R&D และสิทธิประโยชน์ BOI" },
      { id: "apex_ind", nameTh: "บมจ. เอเพ็กซ์ อินดัสเตรียล กรุ๊ป", sector: "multi", sectorTh: "กลุ่มอุตสาหกรรมครบวงจร", marketSharePct: 14.5, strength: 74, strategyTh: "เน้นดึงตัวช่างฝีมือและแย่งประมูลดีล B2B" }
    ],
    governmentPolicies: [
      { id: "boi_smart_industry", nameTh: "บัตรส่งเสริมการลงทุน BOI อุตสาหกรรมเป้าหมาย", summaryTh: "ลดภาระภาษีนิติบุคคลและหนุนการวิจัย R&D อุตสาหกรรมอัจฉริยะ (+แต้มวิจัยไวขึ้น)", corporateTaxPct: 10, demandMultiplier: 1.08, greenBonus: 0 },
      { id: "export_stimulus", nameTh: "มาตรการกระตุ้นการส่งออกและโลจิสติกส์ EEC", summaryTh: "บริษัทคู่ค้า B2B สั่งซื้อล็อตใหญ่ขึ้นและจ่ายชำระเงินเร็วขึ้น", corporateTaxPct: 15, demandMultiplier: 1.15, greenBonus: 0 },
      { id: "green_esg_subsidy", nameTh: "มาตรการสนับสนุนโรงงานสีเขียวและพลังงานสะอาด (ESG)", summaryTh: "อุดหนุนสินค้ากลุ่มพลังงานสะอาด/เกษตรอินทรีย์ และเพิ่มชื่อเสียงองค์กรรักษ์โลก", corporateTaxPct: 12, demandMultiplier: 1.1, greenBonus: 2 },
      { id: "labor_welfare_push", nameTh: "นโยบายยกระดับคุณภาพชีวิตและทักษะแรงงานอุตสาหกรรม", summaryTh: "ส่งเสริมการฝึกอบรมทักษะในศูนย์ฝึกและเพิ่มขวัญกำลังใจพนักงานเมื่อมีสวัสดิการ", corporateTaxPct: 15, demandMultiplier: 1.04, greenBonus: 0 },
      { id: "industrial_stability", nameTh: "นโยบายรักษาเสถียรภาพเศรษฐกิจและซัพพลายเชน", summaryTh: "ตรึงราคาวัตถุดิบต้นน้ำและส่งเสริมสินเชื่อดอกเบี้ยต่ำสำหรับโรงงาน", corporateTaxPct: 15, demandMultiplier: 1.05, greenBonus: 0 }
    ],
    stockIndices: [
      { id: "SET_IND", symbol: "SET-IND", nameTh: "ดัชนีอุตสาหกรรมรวม (Siam Industrial Index)", baseValue: 1420.0 },
      { id: "TECH", symbol: "SIAM-TECH", nameTh: "กลุ่มเซมิคอนดักเตอร์ อิเล็กทรอนิกส์ และ AI", baseValue: 860.0 },
      { id: "AUTO", symbol: "SIAM-AUTO", nameTh: "กลุ่มยานยนต์ไฟฟ้า EV และโรโบติกส์", baseValue: 740.0 },
      { id: "FOOD", symbol: "SIAM-AGRO", nameTh: "กลุ่มเกษตรแปรรูป เบเกอรี่ และไบโอเมด", baseValue: 690.0 },
      { id: "GREEN", symbol: "SIAM-ESG", nameTh: "กลุ่มพลังงานสะอาดและแบตเตอรี่โซลิดสเตต", baseValue: 910.0 }
    ],
    ceoDirectives: [
      { id: "sales_blitz", nameTh: "ลุยยอดขายและขยายฐานคู่ค้า B2B (Commercial Blitz)", descTh: "เน้นเจรจาปิดดีล B2B ราคาดีและเร่งส่งมอบออเดอร์ลูกค้า" },
      { id: "cash_shield", nameTh: "รัดเข็มขัดรักษาสภาพคล่อง (Cash Runway Shield)", descTh: "สำรองกระแสเงินสด สั่งวัตถุดิบแบบ Just-in-Time และเร่งเก็บเงิน Invoice" },
      { id: "zero_defect", nameTh: "มาตรฐานช่างฝีมือไร้ของเสีย (Zero-Defect Quality)", descTh: "เน้นความประณีตในสายการผลิตและการตรวจ QC ลดอัตราของเสีย" },
      { id: "wellness_care", nameTh: "ดูแลบุคลากรและสร้างขวัญกำลังใจ (People & Retention)", descTh: "ป้องกันภาวะหมดไฟ สนับสนุนการพักผ่อนและรั้งตัวคนเก่ง" },
      { id: "rnd_sprint", nameTh: "เร่งเครื่องวิจัยและแตกไลน์อุตสาหกรรม (R&D Innovation Sprint)", descTh: "ทุ่มทรัพยากรวิจัยปลดล็อกการผลิตชิ้นส่วนไฮเทค (Tier 3) และสินค้าใหม่" },
      { id: "scale_expansion", nameTh: "ขยายอาณาจักรนิคมและกำลังการผลิต (Industrial Scale-Up)", descTh: "ลงทุนก่อสร้างอาคารใหม่ ขยายไลน์การผลิต และขายวัตถุดิบกลางน้ำส่ง B2B" }
    ]
  });

  const MOTIVE_FACTOR_LABELS = deepFreeze({
    effort: "ความทุ่มเทและแรงกายที่ใช้",
    delay: "ความเร่งด่วนของงานที่ค้าง",
    skillFit: "ความถนัดตรงสายงาน",
    change: "ความท้าทายและการปรับเปลี่ยน",
    risk: "การบริหารความเสี่ยง",
    hunger: "การเติมพลังด้วยมื้ออาหาร",
    social: "การพูดคุยและเชื่อมสัมพันธ์กับทีม",
    voice: "การสะท้อนปัญหาและออกความเห็น",
    craft: "ความประณีตและการสร้างผลงานด้วยฝีมือ",
    duty: "ความรับผิดชอบต่อหน้าที่และออเดอร์",
    routine: "ความคุ้นเคยและระเบียบแบบแผน",
    help: "การช่วยเหลือเกื้อกูลเพื่อนร่วมทีม",
    novelty: "การคิดค้นและเรียนรู้สิ่งใหม่",
    energy: "การฟื้นฟูพลังงานร่างกาย",
    stress: "การผ่อนคลายความเครียดสะสม",
    health: "การดูแลสุขภาพร่างกาย",
    burnout: "การป้องกันภาวะหมดไฟ",
    focus: "สมาธิและความต่อเนื่องในการทำงาน",
    mood: "อารมณ์และขวัญกำลังใจ",
    achievement: "คุณค่าความสำเร็จในงาน",
    security: "คุณค่าความมั่นคงปลอดภัย",
    income: "คุณค่ารายได้และผลตอบแทน",
    autonomy: "คุณค่าความเป็นอิสระในการทำงาน",
    fairness: "คุณค่าความเป็นธรรมในองค์กร",
    belonging: "คุณค่าการเป็นส่วนหนึ่งของทีม",
    learning: "คุณค่าการเรียนรู้และพัฒนาตน",
    meaning: "คุณค่าความหมายของงานที่ทำ",
    workLifeBalance: "คุณค่าสมดุลชีวิตและการพักผ่อน",
    recognition: "คุณค่าการได้รับการยอมรับและเกียรติภูมิ",
    family: "คุณค่าการดูแลครอบครัว",
    comfort: "คุณค่าคุณภาพชีวิตและความเป็นอยู่",
    humility: "ความถ่อมตน",
    optimism: "การมองโลกในแง่บวก",
    care: "ความเอื้ออาทรต่อผู้อื่น",
    stewardship: "ความรับผิดชอบต่อส่วนรวม",
    influence: "การมีบทบาทกำหนดทิศทาง",
    tradition: "การเคารพธรรมเนียมปฏิบัติ",
    variety: "ความหลากหลายของประสบการณ์",
    craftsmanship: "คุณค่าของฝีมือและความประณีต",
    sociability: "นิสัยชอบเข้าสังคม",
    conscientiousness: "นิสัยรับผิดชอบและมีวินัย",
    agreeableness: "นิสัยให้ความร่วมมือ",
    openness: "นิสัยเปิดรับสิ่งใหม่",
    riskTaking: "นิสัยกล้าตัดสินใจเสี่ยง",
    stressReactivity: "ความไวต่อความกดดัน",
    assertiveness: "ความกล้าแสดงออก",
    patience: "ความอดทนและใจเย็น",
    integrity: "ความซื่อสัตย์สุจริต",
    adaptability: "ความยืดหยุ่นในการปรับตัว",
    ambition: "แรงผลักดันและความทะเยอทะยาน",
    prudence: "ความรอบคอบก่อนลงมือ"
  });

  function hashStr(str) {
    let h = 2166136261 >>> 0;
    const s = String(str || "");
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function pickDet(arr, seedStr) {
    if (!arr || !arr.length) return "";
    return arr[hashStr(seedStr) % arr.length];
  }

  function getCareerStep(roleId, level) {
    const ladder = CAREER_LADDERS[roleId] || CAREER_LADDERS.assembler;
    const lv = Math.max(1, Math.min(ladder.length, Number(level) || 1));
    return ladder[lv - 1] || ladder[0];
  }

  function getNextCareerStep(roleId, level) {
    const ladder = CAREER_LADDERS[roleId] || CAREER_LADDERS.assembler;
    const lv = Math.max(1, Number(level) || 1);
    return lv < ladder.length ? ladder[lv] : null;
  }

  // Assign every employee to a specific 4-Tier Organizational Unit (Division -> Department -> Section -> Group/Line)
  function resolveOrgAssignment(roleId, level = 1, personId = "employee-1", constructedPlots = []) {
    const tree = ORG_TREE[roleId] || ORG_TREE.assembler;
    const dept = tree.departments[0];
    const sections = dept.sections || [];
    const h = hashStr(`${personId}:${roleId}`);

    let chosenSection = sections[0];
    if (roleId === "assembler" && sections.length >= 4) {
      // Map assembler sections to unlocked production lines when available
      const activeSecs = [sections[0]];
      if (constructedPlots.includes("prodLineB")) activeSecs.push(sections[1]);
      if (constructedPlots.includes("prodLineC")) activeSecs.push(sections[2]);
      if (constructedPlots.includes("prodLineD")) activeSecs.push(sections[3]);
      chosenSection = activeSecs[h % activeSecs.length] || sections[0];
    } else if (sections.length > 1) {
      chosenSection = sections[h % sections.length];
    }

    const groups = (chosenSection && chosenSection.groups) || [{ id: "grp_default", nameTh: "กลุ่มปฏิบัติการหลัก" }];
    const chosenGroup = groups[(h >>> 3) % groups.length] || groups[0];
    const tierSpec = LEVEL_TIERS[Math.max(1, Math.min(10, Number(level) || 1))] || LEVEL_TIERS[1];

    return {
      divisionId: tree.divisionId,
      divisionNameTh: tree.divisionNameTh,
      departmentId: dept.id,
      departmentNameTh: dept.nameTh,
      sectionId: chosenSection ? chosenSection.id : "sec_main",
      sectionNameTh: chosenSection ? chosenSection.nameTh : dept.nameTh,
      groupId: chosenGroup.id,
      groupNameTh: chosenGroup.nameTh,
      lineId: chosenGroup.lineId || null,
      gradeCode: tierSpec.gradeCode,
      tierNameTh: tierSpec.tierNameTh,
      chainRoleTh: tierSpec.chainRoleTh,
      reportsToLevel: tierSpec.reportsToLevel,
      orgPathTh: `${dept.nameTh} › ${chosenSection ? chosenSection.nameTh : ""} › ${chosenGroup.nameTh}`
    };
  }

  function createIdentity(seed, personId, baseName, roleId = "assembler") {
    const pid = String(personId || "employee-1");
    const preset = STARTER_IDENTITIES[pid];
    if (preset) {
      const nat = NATIONALITIES[preset.nationality] || NATIONALITIES.TH;
      const genderSymbol = preset.gender === "F" ? "♀" : "♂";
      const genderTh = preset.gender === "F" ? "หญิง" : "ชาย";
      const nickname = baseName || pid;
      const fullName = `${preset.firstName} ${preset.lastName}`;
      return {
        nationality: nat.id,
        nationalityTh: nat.nameTh,
        flag: nat.flag,
        codeTh: nat.codeTh,
        gender: preset.gender,
        genderTh,
        genderSymbol,
        age: preset.age,
        firstName: preset.firstName,
        lastName: preset.lastName,
        nickname,
        fullName,
        displayName: `${fullName} (${nickname})`,
        educationTh: preset.educationTh,
        hometownTh: preset.hometownTh
      };
    }

    const key = `${seed}:${pid}:${roleId}`;
    const h1 = hashStr(key + ":nat");
    const natOrder = ["TH", "JP", "CN", "VN", "MM", "EN"];
    let acc = 0;
    const roll = (h1 % 1000) / 1000;
    let chosenNatId = "TH";
    for (const nid of natOrder) {
      const w = (NATIONALITIES[nid].roleWeight && NATIONALITIES[nid].roleWeight[roleId]) || 0.05;
      acc += w;
      if (roll <= acc) {
        chosenNatId = nid;
        break;
      }
    }
    const nat = NATIONALITIES[chosenNatId] || NATIONALITIES.TH;
    const pool = NAME_POOLS[chosenNatId] || NAME_POOLS.TH;
    const gender = hashStr(key + ":gender") % 2 === 0 ? "M" : "F";
    const genderTh = gender === "F" ? "หญิง" : "ชาย";
    const genderSymbol = gender === "F" ? "♀" : "♂";
    const baseAgeMin = roleId === "engineer" || roleId === "coordinator" ? 25 : 21;
    const age = baseAgeMin + (hashStr(key + ":age") % 19);
    const firstName = pickDet(gender === "F" ? pool.femaleFirst : pool.maleFirst, key + ":first");
    const lastName = pickDet(pool.surnames, key + ":last");
    const nickname = baseName || pickDet(gender === "F" ? pool.nicknamesFemale : pool.nicknamesMale, key + ":nick");
    const fullName = `${firstName} ${lastName}`;
    return {
      nationality: nat.id,
      nationalityTh: nat.nameTh,
      flag: nat.flag,
      codeTh: nat.codeTh,
      gender,
      genderTh,
      genderSymbol,
      age,
      firstName,
      lastName,
      nickname,
      fullName,
      displayName: `${fullName} (${nickname})`,
      educationTh: pickDet(nat.educations, key + ":edu"),
      hometownTh: pickDet(nat.hometowns, key + ":home")
    };
  }

  function translateMotiveFactor(factor, extraLabels = {}) {
    const raw = String(factor || "").trim();
    if (!raw) return "ความเหมาะสมตามสถานการณ์";
    if (MOTIVE_FACTOR_LABELS[raw]) return MOTIVE_FACTOR_LABELS[raw];
    if (extraLabels && extraLabels[raw]) return extraLabels[raw];

    const parts = raw.split(":");
    const prefix = parts.length > 1 ? parts[0] : "";
    const key = parts.length > 1 ? parts.slice(1).join(":") : raw;

    if (MOTIVE_FACTOR_LABELS[key]) return MOTIVE_FACTOR_LABELS[key];
    if (extraLabels && extraLabels[key]) {
      return prefix === "value" ? `คุณค่า${extraLabels[key]}` : extraLabels[key];
    }
    return "ดุลยพินิจตามความเหมาะสมของงาน";
  }

  const INDUSTRY_SKILL_TEMPLATES = deepFreeze({
    software: {
      id: "software",
      nameTh: "วิศวกรรมซอฟต์แวร์และระบบ",
      aptitudes: {
        analytical: 0.45,
        memory: 0.2,
        learningSpeed: 0.2,
        precision: 0.15,
      },
    },
    construction: {
      id: "construction",
      nameTh: "งานก่อสร้างและโครงสร้าง",
      aptitudes: {
        strength: 0.35,
        stamina: 0.3,
        spatial: 0.2,
        dexterity: 0.15,
      },
    },
    architecture: {
      id: "architecture",
      nameTh: "สถาปัตยกรรมและผังโครงสร้าง",
      aptitudes: {
        spatial: 0.4,
        creativity: 0.3,
        analytical: 0.2,
        precision: 0.1,
      },
    },
    driving: {
      id: "driving",
      nameTh: "การขับขี่และควบคุมยานพาหนะ",
      aptitudes: {
        spatial: 0.35,
        composure: 0.25,
        sensory: 0.2,
        dexterity: 0.2,
      },
    },
    design: {
      id: "design",
      nameTh: "การออกแบบและสุนทรียศาสตร์",
      aptitudes: {
        creativity: 0.45,
        sensory: 0.3,
        spatial: 0.15,
        emotionalInsight: 0.1,
      },
    },
    customerCare: {
      id: "customerCare",
      nameTh: "บริการและดูแลลูกค้า",
      aptitudes: {
        emotionalInsight: 0.4,
        communication: 0.35,
        composure: 0.25,
      },
    },
    aerospaceEngineering: {
      id: "aerospaceEngineering",
      nameTh: "วิศวกรรมอวกาศ",
      aptitudes: {
        analytical: 0.25,
        numerical: 0.2,
        spatial: 0.2,
        problemSensitivity: 0.15,
        precision: 0.2,
      },
    },
    missionControl: {
      id: "missionControl",
      nameTh: "ควบคุมภารกิจและระบบวิกฤต",
      aptitudes: {
        attention: 0.25,
        uncertaintyReasoning: 0.25,
        composure: 0.2,
        communication: 0.15,
        problemSensitivity: 0.15,
      },
    },
    automotiveEngineering: {
      id: "automotiveEngineering",
      nameTh: "ออกแบบระบบยานยนต์",
      aptitudes: {
        analytical: 0.3,
        spatial: 0.25,
        numerical: 0.2,
        creativity: 0.15,
        precision: 0.1,
      },
    },
    vehicleMaintenance: {
      id: "vehicleMaintenance",
      nameTh: "วิเคราะห์และซ่อมยานยนต์",
      aptitudes: {
        problemSensitivity: 0.25,
        dexterity: 0.25,
        hearing: 0.15,
        visualAcuity: 0.15,
        analytical: 0.2,
      },
    },
    financialAnalysis: {
      id: "financialAnalysis",
      nameTh: "วิเคราะห์การเงินและการลงทุน",
      aptitudes: {
        numerical: 0.35,
        uncertaintyReasoning: 0.3,
        analytical: 0.2,
        verbal: 0.15,
      },
    },
    riskManagement: {
      id: "riskManagement",
      nameTh: "บริหารความเสี่ยง",
      aptitudes: {
        uncertaintyReasoning: 0.35,
        problemSensitivity: 0.25,
        numerical: 0.2,
        composure: 0.2,
      },
    },
    animalHusbandry: {
      id: "animalHusbandry",
      nameTh: "ดูแลและสังเกตพฤติกรรมสัตว์",
      aptitudes: {
        attention: 0.2,
        emotionalInsight: 0.2,
        problemSensitivity: 0.2,
        dexterity: 0.15,
        sensory: 0.15,
        stamina: 0.1,
      },
    },
    veterinaryCare: {
      id: "veterinaryCare",
      nameTh: "ความรู้และหัตถการสัตวแพทย์",
      aptitudes: {
        analytical: 0.2,
        memory: 0.2,
        dexterity: 0.2,
        precision: 0.2,
        problemSensitivity: 0.2,
      },
    },
    foodPreparation: {
      id: "foodPreparation",
      nameTh: "ประกอบอาหารและควบคุมรสชาติ",
      aptitudes: {
        tasteSmell: 0.25,
        dexterity: 0.2,
        organization: 0.15,
        creativity: 0.15,
        colorDiscrimination: 0.1,
        coordination: 0.15,
      },
    },
    foodSafety: {
      id: "foodSafety",
      nameTh: "สุขอนามัยและความปลอดภัยอาหาร",
      aptitudes: {
        problemSensitivity: 0.25,
        precision: 0.25,
        attention: 0.2,
        memory: 0.15,
        sensory: 0.15,
      },
    },
    structuralEngineering: {
      id: "structuralEngineering",
      nameTh: "วิศวกรรมโครงสร้าง",
      aptitudes: {
        numerical: 0.25,
        spatial: 0.25,
        analytical: 0.3,
        problemSensitivity: 0.2,
      },
    },
    heavyEquipment: {
      id: "heavyEquipment",
      nameTh: "ควบคุมเครื่องจักรหนัก",
      aptitudes: {
        controlPrecision: 0.3,
        reactionSpeed: 0.2,
        spatial: 0.2,
        coordination: 0.15,
        attention: 0.15,
      },
    },
    fieldConstruction: {
      id: "fieldConstruction",
      nameTh: "งานก่อสร้างภาคสนาม",
      aptitudes: {
        strength: 0.2,
        stamina: 0.2,
        balance: 0.2,
        flexibility: 0.15,
        coordination: 0.15,
        spatial: 0.1,
      },
    },
    medicine: {
      id: "medicine",
      nameTh: "ความรู้และดูแลสุขภาพ",
      aptitudes: {
        analytical: 0.25,
        memory: 0.25,
        problemSensitivity: 0.2,
        emotionalInsight: 0.15,
        precision: 0.15,
      },
    },
    law: {
      id: "law",
      nameTh: "กฎหมายและการให้เหตุผล",
      aptitudes: {
        verbal: 0.35,
        analytical: 0.25,
        memory: 0.2,
        communication: 0.2,
      },
    },
    education: {
      id: "education",
      nameTh: "การสอนและอธิบาย",
      aptitudes: {
        verbal: 0.2,
        communication: 0.25,
        emotionalInsight: 0.25,
        speechClarity: 0.15,
        organization: 0.15,
      },
    },
    agriculture: {
      id: "agriculture",
      nameTh: "เพาะปลูกและดูแลระบบเกษตร",
      aptitudes: {
        problemSensitivity: 0.2,
        organization: 0.2,
        sensory: 0.2,
        stamina: 0.2,
        analytical: 0.2,
      },
    },
    creativeProduction: {
      id: "creativeProduction",
      nameTh: "ผลิตสื่อและศิลปะ",
      aptitudes: {
        creativity: 0.3,
        colorDiscrimination: 0.2,
        hearing: 0.15,
        communication: 0.2,
        sensory: 0.15,
      },
    },
    logisticsPlanning: {
      id: "logisticsPlanning",
      nameTh: "วางแผนโลจิสติกส์",
      aptitudes: {
        organization: 0.3,
        numerical: 0.2,
        spatial: 0.2,
        attention: 0.15,
        perceptualSpeed: 0.15,
      },
    },
    energyOperations: {
      id: "energyOperations",
      nameTh: "ปฏิบัติการพลังงานและระบบสาธารณูปโภค",
      aptitudes: {
        attention: 0.25,
        controlPrecision: 0.2,
        problemSensitivity: 0.2,
        composure: 0.2,
        reactionSpeed: 0.15,
      },
    },
  });

  // Headcount Quota Limits across all 10 Career Levels (Scales realistically from 5 to 500 NPCs)
  const CAREER_QUOTAS = deepFreeze({
    1: { level: 1, gradeCode: "G1", nameTh: "พนักงานปฏิบัติการระดับต้น (Operator/Staff)", quotaType: "unlimited" },
    2: { level: 2, gradeCode: "G2", nameTh: "พนักงานชำนาญการ/อาวุโส (Senior/Specialist)", maxRatio: 0.45, minDeptSize: 2 },
    3: { level: 3, gradeCode: "G3", nameTh: "หัวหน้ากลุ่มในไลน์ผลิต/กลุ่มงาน (Group/Line Leader)", baseSlots: 1, expandThreshold: 4, spanOfControl: 5 },
    4: { level: 4, gradeCode: "G4", nameTh: "หัวหน้าหมวด/หัวหน้ากะ (Section Supervisor/Foreman)", baseSlots: 1, expandThreshold: 8, spanOfControl: 8 },
    5: { level: 5, gradeCode: "G5", nameTh: "รองหัวหน้าแผนก (Asst. Department Manager)", baseSlots: 1, expandThreshold: 10, spanOfControl: 10 },
    6: { level: 6, gradeCode: "G6", nameTh: "หัวหน้าแผนก/ผู้จัดการแผนก (Department Manager)", baseSlots: 1, expandThreshold: 12, spanOfControl: 14 },
    7: { level: 7, gradeCode: "G7", nameTh: "รองหัวหน้าฝ่าย/รองผู้จัดการโรงงาน (Deputy Division Director)", baseSlots: 1, expandThreshold: 16, spanOfControl: 20 },
    8: { level: 8, gradeCode: "G8", nameTh: "หัวหน้าฝ่าย/ผู้อำนวยการฝ่าย/ผู้จัดการโรงงาน (Division Director/Plant GM)", baseSlots: 1, expandThreshold: 20, spanOfControl: 28 },
    9: { level: 9, gradeCode: "G9", nameTh: "รองกรรมการผู้จัดการใหญ่ C-Suite (EVP/CCO/CFO/CTO/COO)", baseSlots: 1, expandThreshold: 28, spanOfControl: 40 },
    10: { level: 10, gradeCode: "G10", nameTh: "ประธานเจ้าหน้าที่บริหารสูงสุด (Chief Executive Officer - CEO)", baseSlots: 1, maxCompanyWide: 1 }
  });

  // 5-Person Lean Startup Roster (สำหรับเริ่มตั้งบริษัทขนาดเล็ก 5 คน แล้วค่อยเติบโตสู่ระดับ 100-500 คน)
  const LEAN_STARTERS = deepFreeze([
    { name: "ธีร์", role: "coordinator", dailyWage: 35000 }, // CEO & ผู้ก่อตั้ง
    { name: "มิน", role: "sales", dailyWage: 38000 },        // ฝ่ายขาย B2B (ออฟฟิศ)
    { name: "ภัทร", role: "admin", dailyWage: 35000 },       // ฝ่ายจัดซื้อและบัญชี (ออฟฟิศ)
    { name: "ต้น", role: "assembler", dailyWage: 40000 },    // ช่างฝ่ายผลิต (โรงงาน)
    { name: "กานต์", role: "inspector", dailyWage: 36000 },  // ฝ่าย QC และช่วยงานคลัง (โรงงาน)
  ]);

  const defaults = {
    version: "1.2.0",
    skills: {
      sales: {
        id: "sales",
        nameTh: "การขายและเจรจาธุรกิจ B2B",
        aptitudes: {
          communication: 0.55,
          emotionalInsight: 0.25,
          organization: 0.1,
          composure: 0.1,
        },
      },
      admin: {
        id: "admin",
        nameTh: "จัดซื้อ บัญชี และซัพพลายเชน",
        aptitudes: { organization: 0.5, precision: 0.3, memory: 0.2 },
      },
      engineering: {
        id: "engineering",
        nameTh: "วิศวกรรม วิจัย และซ่อมบำรุง",
        aptitudes: {
          analytical: 0.4,
          creativity: 0.3,
          learningSpeed: 0.2,
          spatial: 0.1,
        },
      },
      assembly: {
        id: "assembly",
        nameTh: "การผลิตและประกอบชิ้นงาน",
        aptitudes: {
          dexterity: 0.45,
          precision: 0.25,
          stamina: 0.2,
          spatial: 0.1,
        },
      },
      quality: {
        id: "quality",
        nameTh: "ควบคุมและประกันคุณภาพ (QC/QA)",
        aptitudes: { precision: 0.5, analytical: 0.3, sensory: 0.2 },
      },
      logistics: {
        id: "logistics",
        nameTh: "คลังสินค้าและโลจิสติกส์ขนส่ง",
        aptitudes: {
          organization: 0.45,
          stamina: 0.25,
          strength: 0.15,
          spatial: 0.15,
        },
      },
      leadership: {
        id: "leadership",
        nameTh: "ภาวะผู้นำและบริหารองค์กร",
        aptitudes: {
          communication: 0.35,
          emotionalInsight: 0.35,
          organization: 0.15,
          composure: 0.15,
        },
      },
    },
    materials: {
      // === TIER 0: Uncraftable Primary Raw Resources (10 ชนิด — ผลิตเองจากศูนย์ไม่ได้ ต้องเก็บเกี่ยวจากสินทรัพย์ภายนอกหรือซื้อจากซัพพลายเออร์) ===
      paddy_grain: { id: "paddy_grain", nameTh: "ข้าวเปลือกหอมมะลิและธัญพืชต้นน้ำ", unitCost: 1800, leadMinutes: 720, tier: 0, tierCode: "T0_RAW", craftable: false, minResearch: 0, b2bSellPrice: 2300 },
      crude_palm: { id: "crude_palm", nameTh: "ทะลายปาล์มสดและน้ำมันปาล์มดิบ (CPO)", unitCost: 2000, leadMinutes: 720, tier: 0, tierCode: "T0_RAW", craftable: false, minResearch: 0, b2bSellPrice: 2600 },
      raw_cane: { id: "raw_cane", nameTh: "อ้อยสดและกากน้ำตาลธรรมชาติต้นน้ำ", unitCost: 1600, leadMinutes: 720, tier: 0, tierCode: "T0_RAW", craftable: false, minResearch: 0, b2bSellPrice: 2100 },
      fresh_milk_soy: { id: "fresh_milk_soy", nameTh: "น้ำนมโคสดและถั่วเหลืองออร์แกนิกต้นน้ำ", unitCost: 2200, leadMinutes: 720, tier: 0, tierCode: "T0_RAW", craftable: false, minResearch: 0, b2bSellPrice: 2800 },
      natural_latex: { id: "natural_latex", nameTh: "น้ำยางพาราสดและเส้นใยชีวภาพต้นน้ำ", unitCost: 2400, leadMinutes: 720, tier: 0, tierCode: "T0_RAW", craftable: false, minResearch: 0, b2bSellPrice: 3100 },
      silica_bauxite_ore: { id: "silica_bauxite_ore", nameTh: "ทรายควอตซ์ซิลิกาและแร่บ็อกไซต์ต้นน้ำ", unitCost: 3200, leadMinutes: 1440, tier: 0, tierCode: "T0_RAW", craftable: false, minResearch: 0, b2bSellPrice: 4100 },
      copper_iron_ore: { id: "copper_iron_ore", nameTh: "แร่ทองแดงและแร่เหล็กดิบจากเหมืองต้นน้ำ", unitCost: 2600, leadMinutes: 1440, tier: 0, tierCode: "T0_RAW", craftable: false, minResearch: 0, b2bSellPrice: 3400 },
      lithium_brine_ore: { id: "lithium_brine_ore", nameTh: "แร่ลิเธียมสปอดูมีนและเกลือแร่แบตเตอรี่ต้นน้ำ", unitCost: 3600, leadMinutes: 1440, tier: 0, tierCode: "T0_RAW", craftable: false, minResearch: 0, b2bSellPrice: 4700 },
      crude_petro_feedstock: { id: "crude_petro_feedstock", nameTh: "แนฟทาและสารตั้งต้นปิโตรเคมีต้นน้ำ", unitCost: 2200, leadMinutes: 720, tier: 0, tierCode: "T0_RAW", craftable: false, minResearch: 0, b2bSellPrice: 2900 },
      timber_bamboo_log: { id: "timber_bamboo_log", nameTh: "ท่อนไม้เศรษฐกิจและเยื่อไผ่ธรรมชาติต้นน้ำ", unitCost: 1400, leadMinutes: 720, tier: 0, tierCode: "T0_RAW", craftable: false, minResearch: 0, b2bSellPrice: 1900 },

      // === TIER 1: First-Stage Refined Materials (10 ชนิด — แปรรูปขั้นที่ 1 จาก T0 หรือซื้อตลาด • ใช้เป็นวัตถุดิบขั้นต่อไปหรือขายส่ง B2B ได้) ===
      artisan_flour: { id: "artisan_flour", nameTh: "แป้งข้าวหอมและแป้งสาลีโม่ละเอียด (แปรรูป T1)", unitCost: 4200, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", craftable: true, minResearch: 0, b2bSellPrice: 5500 },
      refined_palm_oil: { id: "refined_palm_oil", nameTh: "น้ำมันปาล์มบริสุทธิ์และเนยขาวเบเกอรี่ (แปรรูป T1)", unitCost: 4500, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", craftable: true, minResearch: 0, b2bSellPrice: 5900 },
      refined_sugar_syrup: { id: "refined_sugar_syrup", nameTh: "น้ำตาลทรายบริสุทธิ์และไซรัปกลูโคส (แปรรูป T1)", unitCost: 3800, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", craftable: true, minResearch: 0, b2bSellPrice: 5000 },
      raw_extract: { id: "raw_extract", nameTh: "สารสกัดสมุนไพร/ผลไม้ออร์แกนิก (แปรรูป T1)", unitCost: 3500, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", craftable: true, minResearch: 0, b2bSellPrice: 4600 },
      metal_sheet: { id: "metal_sheet", nameTh: "แผ่นโลหะขึ้นรูป (แปรรูป T1)", unitCost: 7000, leadMinutes: 1440, tier: 1, tierCode: "T1_REFINED", craftable: true, minResearch: 15, b2bSellPrice: 9100 },
      copper_coil: { id: "copper_coil", nameTh: "ขดลวดทองแดงเหนี่ยวนำเกรดอุตสาหกรรม (แปรรูป T1)", unitCost: 5500, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", craftable: true, minResearch: 15, b2bSellPrice: 7200 },
      polymer_resin: { id: "polymer_resin", nameTh: "เม็ดพลาสติกวิศวกรรมและเรซินทนความร้อน (แปรรูป T1)", unitCost: 4000, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", craftable: true, minResearch: 10, b2bSellPrice: 5300 },
      pack_carton: { id: "pack_carton", nameTh: "กล่องบรรจุภัณฑ์มาตรฐานอาหารและส่งออก (แปรรูป T1)", unitCost: 2000, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", craftable: true, minResearch: 0, b2bSellPrice: 2700 },
      glass_bottle: { id: "glass_bottle", nameTh: "ขวดแก้วสุญญากาศและหลอดแก้วควอตซ์ (แปรรูป T1)", unitCost: 2500, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", craftable: true, minResearch: 10, b2bSellPrice: 3300 },
      metallurgical_silicon: { id: "metallurgical_silicon", nameTh: "แท่งซิลิคอนบริสุทธิ์เกรดโลหะวิทยา MG-Si (แปรรูป T1)", unitCost: 5200, leadMinutes: 1440, tier: 1, tierCode: "T1_REFINED", craftable: true, minResearch: 35, b2bSellPrice: 6900 },

      // === TIER 2: Second-Stage Advanced Intermediates (9 ชนิด — แปรรูปขั้นที่ 2 จาก T1 • ใช้ประกอบชิ้นส่วน T3/สินค้า T4 หรือขายส่ง B2B) ===
      bakery_dough_butter: { id: "bakery_dough_butter", nameTh: "โดว์ขนมปังหมักยีสต์และเนยเพสตรี้พร้อมอบ (กลางน้ำ T2)", unitCost: 5600, leadMinutes: 720, tier: 2, tierCode: "T2_INTERMEDIATE", craftable: true, minResearch: 25, b2bSellPrice: 7400 },
      probiotic_culture: { id: "probiotic_culture", nameTh: "หัวเชื้อจุลินทรีย์ชีวภาพและวิตามินสกัดเย็น (กลางน้ำ T2)", unitCost: 5000, leadMinutes: 720, tier: 2, tierCode: "T2_INTERMEDIATE", craftable: true, minResearch: 30, b2bSellPrice: 6600 },
      foil_pouch: { id: "foil_pouch", nameTh: "ซองฟอยล์สุญญากาศเกรดการแพทย์และอาหาร (กลางน้ำ T2)", unitCost: 2200, leadMinutes: 720, tier: 2, tierCode: "T2_INTERMEDIATE", craftable: true, minResearch: 25, b2bSellPrice: 3000 },
      casing: { id: "casing", nameTh: "ตัวถังและโครงสร้างคอมโพสิต (กลางน้ำ T2)", unitCost: 5000, leadMinutes: 720, tier: 2, tierCode: "T2_INTERMEDIATE", craftable: true, minResearch: 30, b2bSellPrice: 6500 },
      wire_harness: { id: "wire_harness", nameTh: "ชุดสายไฟแรงดันต่ำและขั้วต่อ (กลางน้ำ T2)", unitCost: 4500, leadMinutes: 720, tier: 2, tierCode: "T2_INTERMEDIATE", craftable: true, minResearch: 35, b2bSellPrice: 5900 },
      heat_sink: { id: "heat_sink", nameTh: "ครีบระบายความร้อนอะลูมิเนียม (กลางน้ำ T2)", unitCost: 4000, leadMinutes: 720, tier: 2, tierCode: "T2_INTERMEDIATE", craftable: true, minResearch: 40, b2bSellPrice: 5300 },
      optical_lens: { id: "optical_lens", nameTh: "เลนส์ออปติคัลและกระจกแซฟไฟร์ความละเอียดสูง (กลางน้ำ T2)", unitCost: 6500, leadMinutes: 1440, tier: 2, tierCode: "T2_INTERMEDIATE", craftable: true, minResearch: 75, b2bSellPrice: 8500 },
      cathode_electrolyte: { id: "cathode_electrolyte", nameTh: "สารแคโทดลิเธียมและอิเล็กโทรไลต์บริสุทธิ์ (กลางน้ำ T2)", unitCost: 6800, leadMinutes: 1440, tier: 2, tierCode: "T2_INTERMEDIATE", craftable: true, minResearch: 85, b2bSellPrice: 8900 },
      silicon_wafer: { id: "silicon_wafer", nameTh: "แผ่นซิลิคอนเวเฟอร์เกรดเซมิคอนดักเตอร์ (กลางน้ำ T2)", unitCost: 7800, leadMinutes: 1440, tier: 2, tierCode: "T2_INTERMEDIATE", craftable: true, minResearch: 65, b2bSellPrice: 10400 },

      // === TIER 3: Tech-Gated Sub-Assemblies & High-Tech Components (8 ชนิด — ต้นเกมต้องซื้อ เมื่อมีทุนและแต้มวิจัยถึงเกณฑ์จึงผลิตเองและขาย B2B ได้) ===
      driver: { id: "driver", nameTh: "ดอกลำโพงและแอคชูเอเตอร์เสียง (ชิ้นส่วน T3)", unitCost: 6000, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", craftable: true, minResearch: 95, b2bSellPrice: 7900 },
      pcb: { id: "pcb", nameTh: "แผงวงจรพิมพ์หลายชั้น PCB (ชิ้นส่วน T3)", unitCost: 9000, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", craftable: true, minResearch: 105, b2bSellPrice: 11800 },
      led: { id: "led", nameTh: "โมดูลแสง SMD LED (ชิ้นส่วน T3)", unitCost: 7500, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", craftable: true, minResearch: 135, b2bSellPrice: 9800 },
      sensor: { id: "sensor", nameTh: "เซ็นเซอร์อัจฉริยะ MEMS/LiDAR (ชิ้นส่วน T3)", unitCost: 6000, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", craftable: true, minResearch: 150, b2bSellPrice: 8000 },
      solar_cell: { id: "solar_cell", nameTh: "แผงโซลาร์เซลล์ประสิทธิภาพสูง (ชิ้นส่วน T3)", unitCost: 8500, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", craftable: true, minResearch: 180, b2bSellPrice: 11200 },
      battery: { id: "battery", nameTh: "โมดูลแบตเตอรี่ลิเธียมความปลอดภัยสูง (ชิ้นส่วน T3)", unitCost: 9500, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", craftable: true, minResearch: 210, b2bSellPrice: 12600 },
      microchip: { id: "microchip", nameTh: "ชิปไมโครโพรเซสเซอร์ระดับนาโน (ชิ้นส่วน T3)", unitCost: 8500, leadMinutes: 720, tier: 3, tierCode: "T3_COMPONENT", craftable: true, minResearch: 250, b2bSellPrice: 11600 },
      power_inverter_ic: { id: "power_inverter_ic", nameTh: "ชิปควบคุมกำลังไฟฟ้า IGBT แรงดันสูง (ชิ้นส่วน T3)", unitCost: 9500, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", craftable: true, minResearch: 290, b2bSellPrice: 12800 },
    },
    products: {
      speaker: {
        id: "speaker",
        nameTh: "ลำโพงบลูทูธ",
        bom: { pcb: 1, casing: 1, driver: 1 },
        assemblyMinutes: 40,
        qaMinutes: 12,
        packingMinutes: 6,
        priceMin: 75000,
        priceMax: 90000,
        researchRequired: 0,
        visualKey: "product.speaker",
        industry: "tech",
        industryNameTh: "เครื่องใช้ไฟฟ้าและเทคโนโลยี",
        productionMode: "smt_precision",
        preferredLine: "lineA"
      },
      lamp: {
        id: "lamp",
        nameTh: "โคมไฟปรับแสง",
        bom: { pcb: 1, casing: 1, led: 2, sensor: 1 },
        assemblyMinutes: 55,
        qaMinutes: 15,
        packingMinutes: 8,
        priceMin: 120000,
        priceMax: 145000,
        researchRequired: 300,
        visualKey: "product.lamp",
        industry: "tech",
        industryNameTh: "เครื่องใช้ไฟฟ้าและเทคโนโลยี",
        productionMode: "automated_modular",
        preferredLine: "lineA"
      },
      iotController: {
        id: "iotController",
        nameTh: "กล่องควบคุม IoT อุตสาหกรรม",
        bom: { pcb: 1, casing: 1, microchip: 1, sensor: 1 },
        assemblyMinutes: 45,
        qaMinutes: 15,
        packingMinutes: 8,
        priceMin: 110000,
        priceMax: 135000,
        researchRequired: 160,
        visualKey: "product.iotController",
        industry: "tech",
        industryNameTh: "เทคโนโลยีและระบบอัจฉริยะ",
        productionMode: "smt_precision",
        preferredLine: "lineB"
      },
      smartMeter: {
        id: "smartMeter",
        nameTh: "มิเตอร์ไฟฟ้าอัจฉริยะ Smart Grid",
        bom: { pcb: 1, microchip: 1, sensor: 1, casing: 1, wire_harness: 1 },
        assemblyMinutes: 50,
        qaMinutes: 18,
        packingMinutes: 8,
        priceMin: 130000,
        priceMax: 160000,
        researchRequired: 200,
        visualKey: "product.smartMeter",
        industry: "tech",
        industryNameTh: "เทคโนโลยีและระบบอัจฉริยะ",
        productionMode: "automated_modular",
        preferredLine: "lineB"
      },
      visionCamera: {
        id: "visionCamera",
        nameTh: "กล้อง AI ตรวจสอบคุณภาพอุตสาหกรรม (Machine Vision)",
        bom: { pcb: 1, microchip: 1, optical_lens: 2, polymer_resin: 1 },
        assemblyMinutes: 52,
        qaMinutes: 20,
        packingMinutes: 8,
        priceMin: 145000,
        priceMax: 180000,
        researchRequired: 280,
        visualKey: "product.visionCamera",
        industry: "tech",
        industryNameTh: "เทคโนโลยีและระบบอัจฉริยะ",
        productionMode: "smt_precision",
        preferredLine: "lineB"
      },
      autoSensor: {
        id: "autoSensor",
        nameTh: "โมดูลเซนเซอร์ตรวจจับยานยนต์",
        bom: { pcb: 1, metal_sheet: 1, wire_harness: 1, sensor: 1 },
        assemblyMinutes: 50,
        qaMinutes: 20,
        packingMinutes: 8,
        priceMin: 135000,
        priceMax: 165000,
        researchRequired: 140,
        visualKey: "product.autoSensor",
        industry: "automotive",
        industryNameTh: "ยานยนต์และชิ้นส่วนกลไก",
        productionMode: "cnc_mechanical",
        preferredLine: "lineA"
      },
      evController: {
        id: "evController",
        nameTh: "ชุดควบคุมมอเตอร์ไฟฟ้า EV",
        bom: { pcb: 1, metal_sheet: 2, wire_harness: 2, casing: 1 },
        assemblyMinutes: 65,
        qaMinutes: 25,
        packingMinutes: 10,
        priceMin: 180000,
        priceMax: 220000,
        researchRequired: 240,
        visualKey: "product.evController",
        industry: "automotive",
        industryNameTh: "ยานยนต์และชิ้นส่วนกลไก",
        productionMode: "cnc_mechanical",
        preferredLine: "lineC"
      },
      batteryPack: {
        id: "batteryPack",
        nameTh: "แพ็กแบตเตอรี่โมดูลยานยนต์ EV",
        bom: { battery: 2, metal_sheet: 1, wire_harness: 2, heat_sink: 1 },
        assemblyMinutes: 70,
        qaMinutes: 25,
        packingMinutes: 12,
        priceMin: 210000,
        priceMax: 260000,
        researchRequired: 360,
        visualKey: "product.batteryPack",
        industry: "automotive",
        industryNameTh: "ยานยนต์และชิ้นส่วนกลไก",
        productionMode: "high_voltage_cell",
        preferredLine: "lineD"
      },
      servoActuator: {
        id: "servoActuator",
        nameTh: "แขนกลเซอร์โวมอเตอร์ความแม่นยำสูง (Robotic Servo)",
        bom: { metal_sheet: 2, copper_coil: 2, microchip: 1, wire_harness: 1 },
        assemblyMinutes: 60,
        qaMinutes: 22,
        packingMinutes: 10,
        priceMin: 175000,
        priceMax: 215000,
        researchRequired: 320,
        visualKey: "product.servoActuator",
        industry: "automotive",
        industryNameTh: "ยานยนต์และชิ้นส่วนกลไก",
        productionMode: "cnc_mechanical",
        preferredLine: "lineC"
      },
      herbalDrink: {
        id: "herbalDrink",
        nameTh: "เครื่องดื่มสมุนไพรอัดขวดสุญญากาศ",
        bom: { raw_extract: 2, glass_bottle: 2, pack_carton: 1 },
        assemblyMinutes: 25,
        qaMinutes: 18,
        packingMinutes: 12,
        priceMin: 95000,
        priceMax: 115000,
        researchRequired: 80,
        visualKey: "product.herbalDrink",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเครื่องดื่มสุขภาพ",
        productionMode: "cleanroom_batch",
        preferredLine: "lineA"
      },
      energyProtein: {
        id: "energyProtein",
        nameTh: "โปรตีนอัดแท่งเสริมพลังงาน",
        bom: { raw_extract: 3, pack_carton: 2 },
        assemblyMinutes: 30,
        qaMinutes: 15,
        packingMinutes: 10,
        priceMin: 110000,
        priceMax: 130000,
        researchRequired: 180,
        visualKey: "product.energyProtein",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเครื่องดื่มสุขภาพ",
        productionMode: "cleanroom_batch",
        preferredLine: "lineB"
      },
      functionalShot: {
        id: "functionalShot",
        nameTh: "เครื่องดื่มสกัดเข้มข้นบูสต์ภูมิคุ้มกัน",
        bom: { raw_extract: 3, glass_bottle: 2, pack_carton: 1 },
        assemblyMinutes: 28,
        qaMinutes: 20,
        packingMinutes: 10,
        priceMin: 125000,
        priceMax: 150000,
        researchRequired: 260,
        visualKey: "product.functionalShot",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเครื่องดื่มสุขภาพ",
        productionMode: "cleanroom_batch",
        preferredLine: "lineD"
      },
      probioticElixir: {
        id: "probioticElixir",
        nameTh: "ซองเจลโพรไบโอติกส์และวิตามินสกัดเย็น (Bio-Gel Elixir)",
        bom: { probiotic_culture: 2, raw_extract: 1, foil_pouch: 2, pack_carton: 1 },
        assemblyMinutes: 32,
        qaMinutes: 20,
        packingMinutes: 10,
        priceMin: 135000,
        priceMax: 165000,
        researchRequired: 290,
        visualKey: "product.probioticElixir",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเครื่องดื่มสุขภาพ",
        productionMode: "cleanroom_batch",
        preferredLine: "lineD"
      },
      solarCharger: {
        id: "solarCharger",
        nameTh: "เครื่องชาร์จโซลาร์พกพา",
        bom: { solar_cell: 1, battery: 1, casing: 1, pcb: 1 },
        assemblyMinutes: 45,
        qaMinutes: 18,
        packingMinutes: 8,
        priceMin: 160000,
        priceMax: 195000,
        researchRequired: 220,
        visualKey: "product.solarCharger",
        industry: "energy",
        industryNameTh: "พลังงานสะอาดและรักษ์โลก",
        productionMode: "automated_modular",
        preferredLine: "lineB"
      },
      homeInverter: {
        id: "homeInverter",
        nameTh: "อินเวอร์เตอร์แปลงไฟโซลาร์รูฟท็อป",
        bom: { solar_cell: 1, pcb: 1, microchip: 1, heat_sink: 2, metal_sheet: 1 },
        assemblyMinutes: 60,
        qaMinutes: 22,
        packingMinutes: 10,
        priceMin: 195000,
        priceMax: 240000,
        researchRequired: 340,
        visualKey: "product.homeInverter",
        industry: "energy",
        industryNameTh: "พลังงานสะอาดและรักษ์โลก",
        productionMode: "high_voltage_cell",
        preferredLine: "lineC"
      },
      evFastCharger: {
        id: "evFastCharger",
        nameTh: "ตู้ชาร์จรถยนต์ไฟฟ้าความเร็วสูง (DC SuperCharger Cabinet)",
        bom: { power_inverter_ic: 2, copper_coil: 2, metal_sheet: 2, heat_sink: 2, wire_harness: 1 },
        assemblyMinutes: 75,
        qaMinutes: 26,
        packingMinutes: 12,
        priceMin: 240000,
        priceMax: 295000,
        researchRequired: 400,
        visualKey: "product.evFastCharger",
        industry: "energy",
        industryNameTh: "พลังงานสะอาดและรักษ์โลก",
        productionMode: "high_voltage_cell",
        preferredLine: "lineD"
      },
      artisan_bakery: {
        id: "artisan_bakery",
        nameTh: "ขนมปังโฮลเกรนและเบเกอรี่อบสดพรีเมียม (Artisan Whole-Grain Bakery)",
        bom: { artisan_flour: 2, refined_palm_oil: 1, refined_sugar_syrup: 1, pack_carton: 1 },
        assemblyMinutes: 30,
        qaMinutes: 12,
        packingMinutes: 8,
        priceMin: 98000,
        priceMax: 122000,
        researchRequired: 25,
        visualKey: "product.artisan_bakery",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเบเกอรี่ครบวงจร",
        productionMode: "continuous_food_bake",
        preferredLine: "lineA",
        chainId: "chain_grain_flour_bakery"
      },
      premium_cooking_oil: {
        id: "premium_cooking_oil",
        nameTh: "น้ำมันปาล์มโอเลอินบริสุทธิ์และไบโอเอสเทอร์ (Refined Olein & Bio-Ester)",
        bom: { refined_palm_oil: 2, glass_bottle: 2, pack_carton: 1 },
        assemblyMinutes: 28,
        qaMinutes: 14,
        packingMinutes: 8,
        priceMin: 92000,
        priceMax: 114000,
        researchRequired: 60,
        visualKey: "product.premium_cooking_oil",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเบเกอรี่ครบวงจร",
        productionMode: "milling_refining",
        preferredLine: "lineB",
        chainId: "chain_palm_oil_refinery"
      },
      ready_meal_box: {
        id: "ready_meal_box",
        nameTh: "ชุดอาหารพร้อมทานและพาสต้าธัญพืชพรีเมียม (Gourmet Ready Meal Box)",
        bom: { artisan_flour: 1, refined_palm_oil: 1, raw_extract: 1, foil_pouch: 2, pack_carton: 1 },
        assemblyMinutes: 35,
        qaMinutes: 15,
        packingMinutes: 10,
        priceMin: 118000,
        priceMax: 145000,
        researchRequired: 150,
        visualKey: "product.ready_meal_box",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเบเกอรี่ครบวงจร",
        productionMode: "continuous_food_bake",
        preferredLine: "lineB",
        chainId: "chain_grain_flour_bakery"
      },
      dairy_protein_shake: {
        id: "dairy_protein_shake",
        nameTh: "เครื่องดื่มเวย์โปรตีนและนมธัญพืชยูเอชที (Smart Dairy Protein Shake)",
        bom: { probiotic_culture: 1, refined_sugar_syrup: 1, glass_bottle: 2, pack_carton: 1 },
        assemblyMinutes: 28,
        qaMinutes: 16,
        packingMinutes: 8,
        priceMin: 105000,
        priceMax: 128000,
        researchRequired: 120,
        visualKey: "product.dairy_protein_shake",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเครื่องดื่มสุขภาพ",
        productionMode: "cleanroom_batch",
        preferredLine: "lineD",
        chainId: "chain_dairy_probiotic_bio"
      },
      ev_suspension_kit: {
        id: "ev_suspension_kit",
        nameTh: "ชุดยางแท่นเครื่องและโช้คอัพไฮดรอลิก EV (EV Elastomer & Suspension Kit)",
        bom: { polymer_resin: 2, metal_sheet: 2, copper_coil: 1, wire_harness: 1 },
        assemblyMinutes: 55,
        qaMinutes: 20,
        packingMinutes: 10,
        priceMin: 168000,
        priceMax: 205000,
        researchRequired: 210,
        visualKey: "product.ev_suspension_kit",
        industry: "automotive",
        industryNameTh: "ยานยนต์และชิ้นส่วนกลไก",
        productionMode: "cnc_mechanical",
        preferredLine: "lineC",
        chainId: "chain_latex_polymer_compound"
      },
      ai_edge_module: {
        id: "ai_edge_module",
        nameTh: "โมดูลประมวลผลชิป AI Edge อุตสาหกรรม (Industrial AI Edge Blade)",
        bom: { silicon_wafer: 2, pcb: 1, microchip: 1, copper_coil: 1, heat_sink: 1 },
        assemblyMinutes: 65,
        qaMinutes: 24,
        packingMinutes: 10,
        priceMin: 215000,
        priceMax: 265000,
        researchRequired: 350,
        visualKey: "product.ai_edge_module",
        industry: "tech",
        industryNameTh: "เทคโนโลยีและเซมิคอนดักเตอร์",
        productionMode: "semiconductor_fab",
        preferredLine: "lineD",
        chainId: "chain_silica_wafer_semicon"
      },
      pastry_croissant_box: {
        id: "pastry_croissant_box",
        nameTh: "ครัวซองต์เนยสดและเพสตรี้แช่แข็งเกรดส่งออก (Artisan Butter Croissant Box)",
        bom: { bakery_dough_butter: 2, refined_sugar_syrup: 1, foil_pouch: 1, pack_carton: 1 },
        assemblyMinutes: 32,
        qaMinutes: 14,
        packingMinutes: 8,
        priceMin: 112000,
        priceMax: 138000,
        researchRequired: 385,
        visualKey: "product.pastry_croissant_box",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเบเกอรี่ครบวงจร",
        productionMode: "continuous_food_bake",
        preferredLine: "lineA",
        chainId: "chain_flour_butter_dough"
      },
      plant_based_meat: {
        id: "plant_based_meat",
        nameTh: "เนื้อจากพืชและโปรตีนเกษตรพรีเมียม (Future Plant-Based Protein)",
        bom: { artisan_flour: 1, refined_palm_oil: 1, raw_extract: 2, foil_pouch: 1, pack_carton: 1 },
        assemblyMinutes: 36,
        qaMinutes: 16,
        packingMinutes: 9,
        priceMin: 128000,
        priceMax: 158000,
        researchRequired: 395,
        visualKey: "product.plant_based_meat",
        industry: "food",
        industryNameTh: "อาหารแห่งอนาคตและโปรตีนทางเลือก",
        productionMode: "continuous_food_bake",
        preferredLine: "lineB",
        chainId: "chain_grain_flour_bakery"
      },
      synbiotic_medical_drink: {
        id: "synbiotic_medical_drink",
        nameTh: "โภชนเภสัชซินไบโอติกส์และภูมิคุ้มกันทางการแพทย์ (Clinical Synbiotic Nutra)",
        bom: { probiotic_culture: 2, raw_extract: 2, glass_bottle: 2, foil_pouch: 1 },
        assemblyMinutes: 38,
        qaMinutes: 22,
        packingMinutes: 10,
        priceMin: 155000,
        priceMax: 192000,
        researchRequired: 410,
        visualKey: "product.synbiotic_medical_drink",
        industry: "biomed",
        industryNameTh: "ชีวการแพทย์และโภชนเภสัช (Bio-Med)",
        productionMode: "cleanroom_batch",
        preferredLine: "lineD",
        chainId: "chain_dairy_probiotic_bio"
      },
      vital_signs_monitor: {
        id: "vital_signs_monitor",
        nameTh: "เครื่องมอนิเตอร์สัญญาณชีพผู้ป่วยอัจฉริยะ (ICU Vital Signs Monitor)",
        bom: { microchip: 1, sensor: 2, optical_lens: 1, pcb: 1, casing: 1 },
        assemblyMinutes: 58,
        qaMinutes: 24,
        packingMinutes: 10,
        priceMin: 198000,
        priceMax: 245000,
        researchRequired: 430,
        visualKey: "product.vital_signs_monitor",
        industry: "biomed",
        industryNameTh: "เครื่องมือแพทย์และไบโอเซนเซอร์ (Bio-Med)",
        productionMode: "cleanroom_batch",
        preferredLine: "lineD",
        chainId: "chain_wafer_microchip_fab"
      },
      autonomous_cargo_drone: {
        id: "autonomous_cargo_drone",
        nameTh: "โดรนขนส่งสินค้าอุตสาหกรรมอัตโนมัติ (Autonomous Heavy Cargo UAV)",
        bom: { microchip: 2, battery: 2, copper_coil: 2, polymer_resin: 2, sensor: 2 },
        assemblyMinutes: 72,
        qaMinutes: 26,
        packingMinutes: 12,
        priceMin: 255000,
        priceMax: 315000,
        researchRequired: 450,
        visualKey: "product.autonomous_cargo_drone",
        industry: "aerospace_robotics",
        industryNameTh: "อากาศยานไร้คนขับและหุ่นยนต์อัตโนมัติ",
        productionMode: "cnc_mechanical",
        preferredLine: "lineC",
        chainId: "chain_wafer_microchip_fab"
      },
      solid_state_powerwall: {
        id: "solid_state_powerwall",
        nameTh: "ตู้กักเก็บพลังงานโซลิดสเตตระดับโรงงาน (Solid-State Grid Powerwall)",
        bom: { power_inverter_ic: 2, battery: 2, cathode_electrolyte: 2, metal_sheet: 2, heat_sink: 2 },
        assemblyMinutes: 78,
        qaMinutes: 28,
        packingMinutes: 12,
        priceMin: 275000,
        priceMax: 340000,
        researchRequired: 470,
        visualKey: "product.solid_state_powerwall",
        industry: "energy",
        industryNameTh: "พลังงานสะอาดและกักเก็บพลังงานขั้นสูง",
        productionMode: "high_voltage_cell",
        preferredLine: "lineD",
        chainId: "chain_silica_wafer_semicon"
      },
    },
    roles: {
      sales: { nameTh: "ฝ่ายขาย B2B", skill: "sales", division: "office" },
      admin: { nameTh: "จัดซื้อและบัญชี", skill: "admin", division: "office" },
      engineer: { nameTh: "วิศวกร R&D", skill: "engineering", division: "office" },
      assembler: { nameTh: "ช่างฝ่ายผลิต", skill: "assembly", division: "factory" },
      inspector: { nameTh: "ตรวจคุณภาพ QC", skill: "quality", division: "factory" },
      logistics: { nameTh: "คลังและจัดส่ง", skill: "logistics", division: "factory" },
      coordinator: { nameTh: "ผู้บริหาร/CEO", skill: "leadership", division: "executive" },
    },
    taskKinds: {},
    starters: [
      { name: "มิน", role: "sales", dailyWage: 38000 },
      { name: "ภัทร", role: "admin", dailyWage: 35000 },
      { name: "น้ำ", role: "engineer", dailyWage: 42000 },
      { name: "ต้น", role: "assembler", dailyWage: 40000 },
      { name: "อิง", role: "assembler", dailyWage: 40000 },
      { name: "กานต์", role: "inspector", dailyWage: 36000 },
      { name: "ป่าน", role: "logistics", dailyWage: 36000 },
      { name: "ธีร์", role: "coordinator", dailyWage: 35000 },
    ],
    rules: {
      initialCash: 12000000,
      initialDebt: 6000000,
      rentDaily: 80000,
      interestDaily: 0.0002,
      minimumWage: 28000,
      creditLimit: 20000000,
      paydayInterval: 7,
      maxActiveOrders: 12,
      maxUnits: 160,
      scenarioDays: 90,
      winCash: 6000000,
      winReputation: 60,
      hireFee: 300000,
      maxPeople: 500,
    },
    initialStock: {
      pcb: 30,
      casing: 30,
      driver: 30,
      led: 0,
      sensor: 0,
      metal_sheet: 0,
      wire_harness: 0,
      microchip: 0,
      raw_extract: 0,
      glass_bottle: 0,
      pack_carton: 0,
      solar_cell: 0,
      battery: 0,
      heat_sink: 0,
      copper_coil: 0,
      optical_lens: 0,
      polymer_resin: 0,
      probiotic_culture: 0,
      foil_pouch: 0,
      power_inverter_ic: 0,
      paddy_grain: 0,
      crude_palm: 0,
      raw_cane: 0,
      fresh_milk_soy: 0,
      natural_latex: 0,
      silica_bauxite_ore: 0,
      copper_iron_ore: 0,
      lithium_brine_ore: 0,
      crude_petro_feedstock: 0,
      timber_bamboo_log: 0,
      artisan_flour: 0,
      refined_palm_oil: 0,
      refined_sugar_syrup: 0,
      metallurgical_silicon: 0,
      bakery_dough_butter: 0,
      cathode_electrolyte: 0,
      silicon_wafer: 0,
    },
  };
  function registerSkill(c, spec) {
    if (!spec || !validId(spec.id) || c.skills[spec.id])
      throw new TypeError("invalid/duplicate skill id");
    H.createSkill(H.createProfile("validation", "person"), spec);
    if (typeof spec.nameTh !== "string" || !spec.nameTh)
      throw new TypeError("skill needs name");
    c.skills[spec.id] = clone(spec);
    return c;
  }
  function registerRole(c, spec) {
    if (
      !spec ||
      !validId(spec.id) ||
      c.roles[spec.id] ||
      typeof spec.nameTh !== "string" ||
      !spec.nameTh ||
      !Object.hasOwn(c.skills, spec.skill)
    )
      throw new TypeError("invalid role specification");
    c.roles[spec.id] = { nameTh: spec.nameTh, skill: spec.skill };
    return c;
  }
  function registerMaterial(c, spec) {
    if (
      !spec ||
      !validId(spec.id) ||
      c.materials[spec.id] ||
      typeof spec.nameTh !== "string" ||
      !spec.nameTh ||
      !Number.isSafeInteger(spec.unitCost) ||
      spec.unitCost < 1 ||
      spec.unitCost > 1e9 ||
      !Number.isSafeInteger(spec.leadMinutes) ||
      spec.leadMinutes < 5 ||
      spec.leadMinutes > 1440 * 30
    )
      throw new TypeError("invalid material specification");
    c.materials[spec.id] = clone(spec);
    if (!Object.hasOwn(c.initialStock, spec.id)) c.initialStock[spec.id] = 0;
    return c;
  }
  function registerProduct(c, spec) {
    if (
      !spec ||
      !validId(spec.id) ||
      c.products[spec.id] ||
      typeof spec.nameTh !== "string" ||
      !spec.nameTh ||
      !spec.bom ||
      typeof spec.bom !== "object" ||
      Array.isArray(spec.bom) ||
      !Object.keys(spec.bom).length
    )
      throw new TypeError("invalid product specification");
    for (const [m, n] of Object.entries(spec.bom))
      if (
        !Object.hasOwn(c.materials, m) ||
        !Number.isSafeInteger(n) ||
        n < 1 ||
        n > 1000
      )
        throw new TypeError("invalid BOM material: " + m);
    for (const k of [
      "assemblyMinutes",
      "qaMinutes",
      "packingMinutes",
      "priceMin",
      "priceMax",
    ])
      if (
        !Number.isSafeInteger(spec[k]) ||
        spec[k] < 1 ||
        spec[k] > (k.startsWith("price") ? 1e12 : 100000)
      )
        throw new TypeError("invalid product field: " + k);
    const bomCost = Object.entries(spec.bom).reduce(
      (sum, [id, n]) => sum + c.materials[id].unitCost * n,
      0,
    );
    if (!Number.isSafeInteger(bomCost) || Object.keys(spec.bom).length > 64)
      throw new TypeError("unsafe BOM cost");
    if (
      spec.priceMin > spec.priceMax ||
      !Number.isFinite(spec.researchRequired ?? 0) ||
      (spec.researchRequired ?? 0) < 0
    )
      throw new TypeError("invalid product price/research");
    c.products[spec.id] = {
      ...clone(spec),
      researchRequired: spec.researchRequired ?? 0,
      visualKey: spec.visualKey || "product." + spec.id,
      productionMode: spec.productionMode || "smt_precision",
      preferredLine: spec.preferredLine || "lineA",
    };
    return c;
  }
  function validateTaskKind(c, spec) {
    const allowedStations = new Set([
      "assembly",
      "quality",
      "packing",
      "shipping",
      "admin",
      "research",
      "sales",
      "manager",
    ]);
    if (
      !spec ||
      !validId(spec.id) ||
      typeof spec.nameTh !== "string" ||
      !spec.nameTh ||
      typeof spec.skill !== "string" ||
      !Object.hasOwn(c.skills, spec.skill) ||
      !allowedStations.has(spec.stationKind) ||
      !Number.isSafeInteger(spec.requiredMinutes) ||
      spec.requiredMinutes < 5 ||
      spec.requiredMinutes > 1440 ||
      spec.requiredMinutes % 5 !== 0
    )
      throw new TypeError("invalid task kind specification");
    if (spec.impacts !== undefined) {
      if (
        !spec.impacts ||
        typeof spec.impacts !== "object" ||
        Array.isArray(spec.impacts)
      )
        throw new TypeError("invalid task impacts");
      for (const [k, v] of Object.entries(spec.impacts))
        if (typeof v !== "number" || !Number.isFinite(v) || v < -2 || v > 2)
          throw new TypeError("invalid task impact " + k);
    }
    for (const [k, min, max] of [
      ["researchPoints", 0, 1000],
      ["reputationDelta", -10, 10],
      ["workload", 0, 2],
      ["hazard", 0, 1],
      ["complexity", 0, 1],
    ])
      if (
        spec[k] !== undefined &&
        (typeof spec[k] !== "number" ||
          !Number.isFinite(spec[k]) ||
          spec[k] < min ||
          spec[k] > max)
      )
        throw new TypeError("invalid task effect " + k);
    if (
      spec.revenue !== undefined &&
      (!Number.isSafeInteger(spec.revenue) ||
        spec.revenue < 0 ||
        spec.revenue > 1e9)
    )
      throw new TypeError("invalid task revenue");
    if (
      spec.domain !== undefined &&
      !["cognitive", "physical", "social", "creative", "balanced"].includes(
        spec.domain,
      )
    )
      throw new TypeError("invalid task domain");
  }
  function registerTaskKind(c, spec) {
    if (!c.taskKinds || typeof c.taskKinds !== "object") c.taskKinds = {};
    if (spec && Object.hasOwn(c.taskKinds, spec.id))
      throw new TypeError("duplicate task kind");
    validateTaskKind(c, spec);
    c.taskKinds[spec.id] = {
      ...clone(spec),
      researchPoints: spec.researchPoints ?? 0,
      reputationDelta: spec.reputationDelta ?? 0,
      revenue: spec.revenue ?? 0,
      domain: spec.domain || "balanced",
      workload: spec.workload ?? 1,
      hazard: spec.hazard ?? 0,
      complexity: spec.complexity ?? 0.5,
    };
    return c;
  }
  function validateCatalog(c) {
    const e = [];
    if (
      !c ||
      typeof c !== "object" ||
      !c.skills ||
      !c.materials ||
      !c.products ||
      !c.roles ||
      !c.rules ||
      !c.initialStock
    )
      return ["catalog missing top-level sections"];
    for (const [id, s] of Object.entries(c.skills)) {
      if (!validId(id) || id !== s?.id) e.push("invalid skill " + id);
      else
        try {
          H.createSkill(H.createProfile("validate", "p"), s);
        } catch (err) {
          e.push(err.message);
        }
    }
    for (const [id, m] of Object.entries(c.materials))
      if (
        !validId(id) ||
        id !== m?.id ||
        !Number.isSafeInteger(m.unitCost) ||
        m.unitCost < 1 ||
        m.unitCost > 1e9 ||
        !Number.isSafeInteger(m.leadMinutes) ||
        m.leadMinutes < 5
      )
        e.push("invalid material " + id);
    for (const [id, p] of Object.entries(c.products)) {
      if (
        !validId(id) ||
        id !== p?.id ||
        typeof p.bom !== "object" ||
        Array.isArray(p.bom) ||
        !p.bom ||
        !Object.keys(p.bom).length
      ) {
        e.push("invalid product " + id);
        continue;
      }
      for (const [mat, n] of Object.entries(p.bom))
        if (
          !Object.hasOwn(c.materials, mat) ||
          !Number.isSafeInteger(n) ||
          n < 1
        )
          e.push("invalid BOM " + id);
      for (const k of [
        "assemblyMinutes",
        "qaMinutes",
        "packingMinutes",
        "priceMin",
        "priceMax",
      ])
        if (
          !Number.isSafeInteger(p[k]) ||
          p[k] < 1 ||
          p[k] > (k.startsWith("price") ? 1e12 : 100000)
        )
          e.push("invalid " + id + "." + k);
      const bomCost = Object.entries(p.bom).reduce(
        (sum, [id, n]) => sum + (c.materials[id]?.unitCost || 0) * n,
        0,
      );
      if (!Number.isSafeInteger(bomCost) || Object.keys(p.bom).length > 64)
        e.push("unsafe BOM economics " + id);
      if (
        p.priceMin > p.priceMax ||
        !Number.isFinite(p.researchRequired) ||
        p.researchRequired < 0
      )
        e.push("invalid product economics " + id);
    }
    for (const [id, n] of Object.entries(c.initialStock))
      if (!Object.hasOwn(c.materials, id) || !Number.isSafeInteger(n) || n < 0)
        e.push("invalid stock " + id);
    for (const [id, r] of Object.entries(c.roles))
      if (
        !validId(id) ||
        ["constructor", "prototype"].includes(id) ||
        !r ||
        !Object.hasOwn(c.skills, r.skill)
      )
        e.push("invalid role " + id);
    if (c.taskKinds !== undefined) {
      if (
        !c.taskKinds ||
        typeof c.taskKinds !== "object" ||
        Array.isArray(c.taskKinds)
      )
        e.push("invalid taskKinds");
      else
        for (const [id, t] of Object.entries(c.taskKinds)) {
          try {
            if (id !== t.id) throw new TypeError("mismatched task id");
            validateTaskKind(c, t);
          } catch (_) {
            e.push("invalid taskKind " + id);
          }
        }
    }
    if (c.lifeGoals !== undefined) {
      try {
        H.deriveAspirations(
          H.createProfile("validate", "p"),
          H.STATE_DEFAULTS,
          { goalSpecs: c.lifeGoals },
        );
      } catch (_) {
        e.push("invalid life goals");
      }
    }
    for (const [k, v] of Object.entries(c.rules))
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0)
        e.push("invalid rule " + k);
    for (const skill of [
      "sales",
      "admin",
      "engineering",
      "assembly",
      "quality",
      "logistics",
      "leadership",
    ])
      if (!Object.hasOwn(c.skills, skill))
        e.push("required skill " + skill + " missing");
    if (
      !Array.isArray(c.starters) ||
      !c.starters.length ||
      c.starters.length > 600
    )
      e.push("invalid starters");
    else
      for (const s of c.starters)
        if (
          !s ||
          typeof s.name !== "string" ||
          !Object.hasOwn(c.roles, s.role) ||
          !Number.isSafeInteger(s.dailyWage) ||
          s.dailyWage < c.rules.minimumWage
        )
          e.push("invalid starter");
    for (const [k, min, max] of [
      ["initialCash", 0, 1e12],
      ["initialDebt", 0, 1e12],
      ["rentDaily", 0, 1e9],
      ["minimumWage", 1, 1e7],
      ["creditLimit", 0, 1e12],
      ["paydayInterval", 1, 30],
      ["maxActiveOrders", 1, 200],
      ["maxUnits", 1, 4000],
      ["scenarioDays", 1, 365],
      ["winCash", 0, 1e12],
      ["winReputation", 0, 100],
      ["hireFee", 0, 1e9],
      ["maxPeople", 1, 600],
    ])
      if (
        !Number.isSafeInteger(c.rules[k]) ||
        c.rules[k] < min ||
        c.rules[k] > max
      )
        e.push("invalid rule " + k);
    if (
      typeof c.rules.interestDaily !== "number" ||
      !Number.isFinite(c.rules.interestDaily) ||
      c.rules.interestDaily < 0 ||
      c.rules.interestDaily > 0.1
    )
      e.push("invalid interest rate");
    return e;
  }
  return Object.freeze({
    VERSION: "1.0.0",
    RELEASE_VERSION: "1.0.0",
    MATERIAL_TIERS,
    MATERIAL_RECIPES,
    NATIONALITIES,
    NAME_POOLS,
    STARTER_IDENTITIES,
    CORPORATE_DIVISIONS,
    ROLE_DEPARTMENTS,
    ORG_TREE,
    LEVEL_TIERS,
    CAREER_QUOTAS,
    CAREER_LADDERS,
    PRODUCTION_MODES,
    PRODUCTION_REGIMES,
    SUPPLY_CHAIN_STRATEGIES,
    EXTERNAL_ASSETS,
    PRODUCTION_CHAINS,
    EXPANSION_PLOTS,
    EXTERNAL_WORLD_DEFAULTS,
    LEAN_STARTERS,
    MOTIVE_FACTOR_LABELS,
    INDUSTRY_SKILL_TEMPLATES,
    getCareerStep,
    getNextCareerStep,
    resolveOrgAssignment,
    createIdentity,
    translateMotiveFactor,
    createCatalog: () => clone(defaults),
    validateCatalog,
    registerSkill,
    registerRole,
    registerMaterial,
    registerProduct,
    registerTaskKind,
  });
});
