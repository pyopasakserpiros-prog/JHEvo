/* world_map.js — แผนที่สำนักและป่ารอบสำนัก 360×304 ช่อง: ภูมิประเทศ อาคาร จุดทำกิจกรรม (stations) ธารน้ำปราณทักษิณ กริดนำทาง และ A*
 * หน่วย: 1 ช่อง = 1 tile (วาด 16px). พิกัดเป็นทศนิยมของช่อง (ศูนย์กลางช่อง = i+0.5) */
(function (g) {
  'use strict';
  const U = g.U || require('./util.js');
  const MAP = {};
  const W = 360, H = 304, H_BASE = 248, OX = 84, OY = 56;
  MAP.W = W; MAP.H = H; MAP.H_BASE = H_BASE; MAP.OX = OX; MAP.OY = OY; MAP.TILE = 16;
  MAP.EXIT = { x: 180, y: 298 };
  MAP.LEGACY_EXIT = { x: 118, y: 188 };
  MAP.GATE_IN = { x: 180, y: 196 };

  // ชนิดภูมิประเทศ
  const T = { GRASS: 0, ROAD: 1, WATER: 2, CLIFF: 3, FOREST: 4, WALL: 5, FLOOR: 6, FARM: 7, DIRT: 8, PLAZA: 9, ARCH: 10, SAND: 11, MOSS: 12 };
  MAP.T = T;
  // ตัวคูณความเร็วเดินตามพื้น (WATER = 0 เดินลุยน้ำไม่ได้ ต้องข้ามสะพานหรือเดินตามตลิ่ง)
  const SPEED = [1.0, 1.8, 0, 0, 0.8, 0, 1.1, 0.85, 1.0, 1.8, 1.8, 0.9, 0.95];
  MAP.SPEED = SPEED;

  /* -------- ทะเบียนชนิดอาคาร -------- */
  const BTYPES = {
    gate: { nameTh: 'ประตูสำนัก', icon: '⛩️', roof: '#2f4858', wall: '#8b2e2e', desc: 'ประตูหลักทิศใต้ เชื่อมสู่แนวสมุนไพรปลอดภัย สะพานธารน้ำปราณทักษิณ และทางออกยุทธภพ' },
    gate_north: { nameTh: 'ป้อมประตูอุดร', icon: '⛩️', roof: '#2c4a5e', wall: '#7a3b3b', desc: 'ป้อมประตูทิศเหนือ เชื่อมสู่ยอดเขาเหมันต์อุดรและจุดพักฟื้นเวรยาม' },
    gate_west: { nameTh: 'ป้อมประตูประจิม', icon: '⛩️', roof: '#2d5248', wall: '#7a4b3a', desc: 'ป้อมประตูทิศตะวันตก เชื่อมสู่ป่าไผ่หมอกครามประจิมและจุดพักนักล่า' },
    gate_east: { nameTh: 'ป้อมประตูบูรพา', icon: '⛩️', roof: '#3d4858', wall: '#7a4b3a', desc: 'ป้อมประตูทิศตะวันออก เชื่อมสู่หน้าผาหินแกร่งบูรพาและจุดเฝ้าระวัง' },
    main_hall: { nameTh: 'ตำหนักใหญ่', icon: '🏯', roof: '#7a1f1f', wall: '#c79a3b', desc: 'ศูนย์กลางอาญาสิทธิ์แห่งขุนเขา ที่ซึ่งเจ้าสำนักและเหล่าผู้อาวุโสประชุมชี้ขาดชะตากรรมของศิษย์ทั้งสำนัก' },
    ancestral: { nameTh: 'หออนุสรณ์บรรพชน', icon: '🕯️', roof: '#3d3d4f', wall: '#a8a29e', desc: 'วิหารโคมวิญญาณอันขรึมขลัง เรียงรายด้วยป้ายนามของเหล่าศิษย์และบูรพาจารย์ผู้ล่วงลับ คอยปกปักรักษารุ่นหลังชั่วนิรันดร์' },
    meditation_hall: { nameTh: 'หอบำเพ็ญวิญญาณ', icon: '🧘', roof: '#1f5f6b', wall: '#d6c8a4', desc: 'โถงศิลาเงียบสงัดที่ตั้งอยู่เหนือตาน้ำชีพจรดิน อบอวลด้วยควันกำยานสงบจิตและกระแสปราณฟ้าดินหนาแน่น' },
    scripture: { nameTh: 'หอคัมภีร์', icon: '📜', roof: '#3a3a6a', wall: '#7b4b2a', desc: 'หอไม้โบราณเรียงรายด้วยม้วนไม้ไผ่และหยกจารึกเคล็ดวิชาที่บรรพชนสำนักรวบรวมแลกมาด้วยเลือดและหยาดเหงื่อ' },
    treasury: { nameTh: 'หอคลังทรัพย์', icon: '💰', roof: '#6b5a1f', wall: '#4a3a22', desc: 'เก็บศิลาวิญญาณและวัตถุดิบของสำนัก' },
    discipline: { nameTh: 'หอวินัย', icon: '⚖️', roof: '#222a35', wall: '#5b6470', desc: 'ห้องขังศิลาดำเย็นเยียบใต้ฐานผา สำหรับกักบริเวณผู้ละเมิดกฎสำนักและจองจำเชลยศึกจากต่างแดน' },
    dorm_core: { nameTh: 'เรือนศิษย์แกน', icon: '🛏️', roof: '#5a2d7a', wall: '#d2b48c', desc: 'ที่พักศิษย์แกนกลาง' },
    dorm_inner: { nameTh: 'เรือนศิษย์ใน', icon: '🛏️', roof: '#2d5a7a', wall: '#d2b48c', desc: 'ที่พักศิษย์ใน' },
    dorm_outer: { nameTh: 'เรือนศิษย์นอก', icon: '🛏️', roof: '#5a6a4a', wall: '#c4a77d', desc: 'ที่พักศิษย์นอกและผู้ฝึกหัด' },
    elder_quarters: { nameTh: 'เรือนผู้อาวุโส', icon: '🏡', roof: '#8a3a2a', wall: '#d9c7a0', desc: 'ที่พักเจ้าสำนัก รองเจ้าสำนัก และผู้อาวุโส' },
    canteen: { nameTh: 'โรงครัวและโรงอาหาร', icon: '🍲', roof: '#7a4a2a', wall: '#e0c9a6', desc: 'ปรุงและแจกอาหาร ทุกคนต้องกินที่นี่หรือจากเสบียงตน' },
    training_ground: { nameTh: 'ลานฝึกยุทธ์', icon: '⚔️', roof: '#6b2a2a', wall: '#a88b5a', desc: 'ฝึกวิชา ประลอง และหลอมกาย', open: true },
    market: { nameTh: 'ตลาดสำนัก', icon: '🛒', roof: '#8a5a1a', wall: '#caa46a', desc: 'แลกเปลี่ยนของ ขายผลิตผลให้พ่อค้า' },
    infirmary: { nameTh: 'หอหมอยา', icon: '⚕️', roof: '#2a6a4a', wall: '#e8efe0', desc: 'รักษาผู้บาดเจ็บและผู้ป่วย' },
    alchemy: { nameTh: 'หอปรุงโอสถ', icon: '⚗️', roof: '#3a6a3a', wall: '#a08a5a', desc: 'ปรุงโอสถ เตาและสมุนไพร' },
    forge: { nameTh: 'โรงหลอมศาสตรา', icon: '🔨', roof: '#4a3a3a', wall: '#6a5a5a', desc: 'หลอมอาวุธ เกราะ ยันต์ และค่ายกล' },
    herb_garden: { nameTh: 'สวนสมุนไพร', icon: '🌿', roof: '#3a7a3a', wall: '#6a8a4a', desc: 'ปลูกสมุนไพรวิญญาณสำหรับปรุงยา', open: true },
    farm: { nameTh: 'ไร่นาข้าว', icon: '🌾', roof: '#8a8a3a', wall: '#a8a05a', desc: 'ผลิตเสบียงเลี้ยงคนทั้งสำนัก', open: true },
    mission_hall: { nameTh: 'หอภารกิจ', icon: '📯', roof: '#2a4a7a', wall: '#8a6a4a', desc: 'รับ-ส่งภารกิจนอกสำนัก จัดคณะเดินทาง' },
    tea_garden: { nameTh: 'ศาลาชาและสวนสังสรรค์', icon: '🍵', roof: '#6a3a5a', wall: '#d8c8a8', desc: 'พบปะ พูดคุย ดื่มชา เล่นดนตรี' },
    shrine: { nameTh: 'ศาลเทพศรัทธา', icon: '🛕', roof: '#b08a1a', wall: '#e8d8a0', desc: 'สถานที่รวมศรัทธา สำหรับผู้บำเพ็ญวิถีเทพ' },
    mine: { nameTh: 'เหมืองแร่วิญญาณ', icon: '⛏️', roof: '#4a4a4a', wall: '#6a6a6a', desc: 'ขุดแร่และหินวิญญาณจากภูเขาหลังสำนัก' },
    spirit_pond: { nameTh: 'สระธารวิญญาณ', icon: '🐟', roof: '#2a6a8a', wall: '#2a6a8a', desc: 'สระน้ำพุวิญญาณภายในสำนัก ตกปลา พักผ่อน', open: true },
    river_dock: { nameTh: 'ท่าน้ำธารปราณทักษิณ', icon: '🎣', roof: '#5a4632', wall: '#8c6d46', desc: 'ท่าน้ำไม้และสะพานข้ามธารน้ำปราณทักษิณ จุดตกปลาและพักผ่อนริมน้ำทางใต้ของสำนัก', open: true, terr: 6 },
    river_west: { nameTh: 'คุ้งน้ำไผ่หยก', icon: '🐟', roof: '#2a6a5a', wall: '#3a7a6a', desc: 'คุ้งน้ำตื้นร่มไผ่ทางตะวันตกของธารปราณ ชุกชุมด้วยปลาลำธารและปลาสมุนไพร', open: true, terr: 11 },
    river_east: { nameTh: 'วังน้ำศิลาคราม', icon: '🌊', roof: '#1f4f6b', wall: '#2a5a7a', desc: 'วังน้ำลึกและโขดหินปราณทางตะวันออก แหล่งอาศัยของปลาดาราและปลามังกรหนวดหยกหายาก', open: true, terr: 11 },
    tower: { nameTh: 'หอสังเกตการณ์', icon: '🗼', roof: '#3a4a5a', wall: '#7a6a5a', desc: 'จุดเฝ้าระวังมุมกำแพง' },
    cave: { nameTh: 'ถ้ำหมื่นสายหมอก', icon: '🕳️', roof: '#444', wall: '#555', desc: 'ถ้ำใหญ่ใต้ภูเขา ลึก 10 ชั้น มีผู้พิทักษ์ที่ชั้น 5 และ 10', open: true, terr: 12 },
    realm_gate: { nameTh: 'ลานประตูมิติ', icon: '🌀', roof: '#444', wall: '#555', desc: 'แท่นโบราณที่ประตูมิติสู่แดนหมื่นพิภพเปิดเป็นครั้งคราว', open: true, terr: 9 },
    stele: { nameTh: 'แท่นศิลาจารึกโบราณ', icon: '🗿', roof: '#444', wall: '#555', desc: 'ถอดจารึกสะสมเศษ ครบแล้วได้คัมภีร์วิชา', open: true, terr: 9 },
    spring: { nameTh: 'น้ำพุปราณลับ', icon: '⛲', roof: '#444', wall: '#555', desc: 'ตาน้ำปราณ ฟื้นพลังและเพิ่มตบะ ใช้ได้จำกัดต่อวัน', open: true, terr: 12 },
    ruin: { nameTh: 'ซากเจดีย์ร้าง', icon: '🏚️', roof: '#444', wall: '#555', desc: 'ซากโบราณ มีของเก่า เงื่อนงำ และผีสาง', open: true, terr: 11 },
    grove: { nameTh: 'ป่าสมุนไพรเร้นลับ', icon: '🌳', roof: '#444', wall: '#555', desc: 'ป่าลึกหลังกำแพง สมุนไพรหายาก', open: true, terr: 12 },
    plaza: { nameTh: 'ลานกลางสำนัก', icon: '⛲', roof: '#999', wall: '#999', desc: 'ลานรวมพลและพบปะ', open: true },
    peak_sword: { nameTh: 'ตำหนักกระบี่เมฆาคราม', icon: '🗡️', roof: '#1e5f74', wall: '#d8e2e8', desc: 'ยอดเขาเอกแห่งวิถีเซียนปราณและกระบี่เหินเมฆา หลังคาทรงแหลมประดับกระบี่หินขนาดยักษ์', peakId: 'PEAK_AZURE_SWORD', aliasId: 'PEAK_SWORD' },
    peak_body: { nameTh: 'อารามกายาวัชระ', icon: '⛰️', roof: '#6b4423', wall: '#8c7a6b', desc: 'อารามหินแกรนิตหนาทึบและเสาทองสัมฤทธิ์สำหรับผู้ฝึกตนวิถีหลอมกายา', peakId: 'PEAK_VAJRA_BODY', aliasId: 'PEAK_BODY' },
    peak_chaos: { nameTh: 'หอเงาโลหิต', icon: '🩸', roof: '#4a1525', wall: '#6e3b47', desc: 'หอเร้นลับหลังคาสีม่วงคล้ำ-แดงเข้ม ประดับโคมวิญญาณแห่งวิถีมารโลหิต', peakId: 'PEAK_CRIMSON_SHADOW', aliasId: 'PEAK_CHAOS' },
    peak_alchemy: { nameTh: 'หอเตาหลอมสวรรค์', icon: '⚗️', roof: '#2d6a4f', wall: '#b89f72', desc: 'ยอดเขาแห่งไฟปฐพีและปล่องเตาหลอมยักษ์ มีควันสมุนไพรวิญญาณลอยพวยพุ่ง', peakId: 'PEAK_DIVINE_CAULDRON', aliasId: 'PEAK_ALCHEMY' },
    peak_magic: { nameTh: 'หอจิตสังสารวัฏ', icon: '🪷', roof: '#3c3b6e', wall: '#d8cfe8', desc: 'สถาปัตยกรรมทรงหกเหลี่ยมประดับวงแหวนกระจกเงาสะท้อนวิญญาณและวัฏสงสาร', peakId: 'PEAK_SOUL_SAMSARA', aliasId: 'PEAK_MAGIC' },
    peak_array: { nameTh: 'หอดารากลไก', icon: '⚙️', roof: '#2b4c65', wall: '#b0bec5', desc: 'หอคอยดาราศาสตร์ประดับล้อฟันเฟืองปราณและวงแหวนอักขระค่ายกล', peakId: 'PEAK_ASTRAL_MECHANISM', aliasId: 'PEAK_ARRAY' },
    peak_scholar: { nameTh: 'ศาลาปราชญ์พิชัย', icon: '📜', roof: '#3b6e5c', wall: '#efe5cc', desc: 'ศาลาปราชญ์เหนือน้ำ พร้อมลานกระดานหมากและลานคัดอักษรพิชัยยุทธ์', peakId: 'PEAK_SAGE_STRATEGIST', aliasId: 'PEAK_SCHOLAR' },
    peak_beast: { nameTh: 'วิหารราชันย์อสูร', icon: '🐉', roof: '#5c4028', wall: '#a68a64', desc: 'วิหารเสาโทเท็มอสูรบรรพกาลและโครงกระดูกพญามังกรแห่งวิถีเทพอสูร', peakId: 'PEAK_DIVINE_BEAST', aliasId: 'PEAK_BEAST' }
  };
  MAP.BTYPES = BTYPES;

  /* -------- แผนผัง (พิกัดท้องถิ่น + offset) -------- */
  // [type, id, x, y, w, h, yard, extra]
  const LAYOUT = [
    ['main_hall', 'main_hall', 82, 36, 28, 12, 4],
    ['ancestral', 'ancestral', 90, 16, 14, 9, 3],
    ['meditation_hall', 'meditation_hall', 52, 17, 22, 9, 5],
    ['elder_quarters', 'elder_quarters', 138, 17, 24, 9, 3],
    ['scripture', 'scripture', 124, 37, 18, 10, 4],
    ['treasury', 'treasury', 148, 37, 14, 9, 3],
    ['discipline', 'discipline', 60, 38, 14, 9, 3],
    ['dorm_core', 'dorm_core', 34, 36, 16, 10, 2],
    ['dorm_inner', 'dorm_inner', 30, 58, 18, 10, 2],
    ['dorm_outer', 'dorm_outer', 28, 86, 20, 12, 2],
    ['canteen', 'canteen', 58, 74, 16, 8, 4],
    ['market', 'market', 100, 80, 22, 8, 3],
    ['infirmary', 'infirmary', 150, 56, 14, 9, 2],
    ['alchemy', 'alchemy', 128, 56, 18, 10, 4],
    ['forge', 'forge', 128, 74, 20, 10, 4],
    ['mission_hall', 'mission_hall', 100, 98, 10, 6, 3],
    ['tea_garden', 'tea_garden', 114, 56, 12, 6, 3],
    ['shrine', 'shrine', 62, 56, 10, 6, 3],
    ['mine', 'mine', 26, 16, 16, 10, 3]
  ];
  const PEAK_LAYOUT_SPECS = [
    { type: 'peak_sword', id: 'peak_sword', peakId: 'PEAK_AZURE_SWORD', aliasId: 'PEAK_SWORD', dir: 'NW', dirTh: 'ทิศตะวันตกเฉียงเหนือ', lx: -8, ly: 12, w: 15, h: 8, yard: 2, leylineColor: '#48cae4', bannerColor: '#0288d1' },
    { type: 'peak_array', id: 'peak_array', peakId: 'PEAK_ASTRAL_MECHANISM', aliasId: 'PEAK_ARRAY', dir: 'W', dirTh: 'ทิศตะวันตก', lx: -8, ly: 42, w: 15, h: 8, yard: 2, leylineColor: '#64c3ce', bannerColor: '#0097a7' },
    { type: 'peak_body', id: 'peak_body', peakId: 'PEAK_VAJRA_BODY', aliasId: 'PEAK_BODY', dir: 'N', dirTh: 'ทิศเหนือ', lx: 54, ly: 4, w: 16, h: 7, yard: 2, leylineColor: '#f4a261', bannerColor: '#e65100' },
    { type: 'peak_alchemy', id: 'peak_alchemy', peakId: 'PEAK_DIVINE_CAULDRON', aliasId: 'PEAK_ALCHEMY', dir: 'NE', dirTh: 'ทิศตะวันออกเฉียงเหนือ', lx: 186, ly: 12, w: 16, h: 8, yard: 2, leylineColor: '#52b788', bannerColor: '#2e7d32' },
    { type: 'peak_beast', id: 'peak_beast', peakId: 'PEAK_DIVINE_BEAST', aliasId: 'PEAK_BEAST', dir: 'E', dirTh: 'ทิศตะวันออก', lx: 186, ly: 42, w: 16, h: 8, yard: 2, leylineColor: '#e09f3e', bannerColor: '#d97706' },
    { type: 'peak_scholar', id: 'peak_scholar', peakId: 'PEAK_SAGE_STRATEGIST', aliasId: 'PEAK_SCHOLAR', dir: 'S', dirTh: 'ทิศใต้ริมธารน้ำ', lx: 186, ly: 96, w: 16, h: 8, yard: 2, leylineColor: '#76c893', bannerColor: '#1b4332' },
    { type: 'peak_chaos', id: 'peak_chaos', peakId: 'PEAK_CRIMSON_SHADOW', aliasId: 'PEAK_CHAOS', dir: 'SW', dirTh: 'ทิศตะวันตกเฉียงใต้ (เหนือ)', lx: -8, ly: 84, w: 15, h: 8, yard: 2, leylineColor: '#ef476f', bannerColor: '#880e4f' },
    { type: 'peak_magic', id: 'peak_magic', peakId: 'PEAK_SOUL_SAMSARA', aliasId: 'PEAK_MAGIC', dir: 'SW_LOWER', dirTh: 'ทิศตะวันตกเฉียงใต้ (ใต้)', lx: -8, ly: 112, w: 15, h: 8, yard: 2, leylineColor: '#b5838d', bannerColor: '#6a1b9a' }
  ];
  MAP.PEAK_LAYOUTS = PEAK_LAYOUT_SPECS.map(p => Object.assign({}, p, { x: p.lx + OX, y: p.ly + OY }));
  MAP.PEAK_BUILDING_IDS = Object.freeze(PEAK_LAYOUT_SPECS.map(p => p.id));
  MAP.LAYOUT = LAYOUT.concat(PEAK_LAYOUT_SPECS.map(p => [p.type, p.id, p.lx, p.ly, p.w, p.h, p.yard, p.peakId]));
  const OPEN = [ // พื้นที่เปิด [type,id,x,y,w,h]
    ['training_ground', 'training_ground', 50, 90, 34, 18],
    ['herb_garden', 'herb_garden', 112, 92, 22, 14],
    ['farm', 'farm', 140, 92, 26, 16],
    ['spirit_pond', 'spirit_pond', 112, 16, 22, 14],
    ['plaza', 'plaza', 80, 58, 32, 18],
    ['cave', 'cave', 174, 30, 10, 8], ['stele', 'stele', 174, 44, 8, 6], ['spring', 'spring', 174, 55, 8, 7], ['ruin', 'ruin', 174, 68, 10, 8],
    ['grove', 'grove', 12, 30, 12, 10], ['realm_gate', 'gate_zone', 11, 50, 12, 12]
  ];
  const TOWERS = [[-10, 2], [198, 2], [-10, 140], [198, 140]];
  MAP.PLOTS = [ // ที่ดินว่างสำหรับขยายในอนาคต 8 แปลงในกำแพงสำนัก 216×148
    { id: 'plot_w', nameTh: 'ที่ดินว่างฝั่งตะวันตกตอนบน', x: 10, y: 26, w: 14, h: 30 },
    { id: 'plot_sw', nameTh: 'ที่ดินว่างฝั่งตะวันตกเฉียงใต้', x: 10, y: 74, w: 16, h: 52 },
    { id: 'plot_e', nameTh: 'ที่ดินว่างฝั่งตะวันออกตอนบน', x: 170, y: 16, w: 14, h: 12 },
    { id: 'plot_se', nameTh: 'ที่ดินว่างมุมตะวันออกเฉียงใต้', x: 140, y: 114, w: 44, h: 24 },
    { id: 'plot_n', nameTh: 'ที่ดินว่างฝั่งเหนือตอนใน', x: 112, y: 4, w: 70, h: 10 },
    { id: 'plot_nw', nameTh: 'ที่ดินว่างมุมตะวันตกเฉียงเหนือ', x: 10, y: 4, w: 40, h: 10 },
    { id: 'plot_sc', nameTh: 'ที่ดินว่างทิศใต้หน้าลานฝึก', x: 28, y: 114, w: 60, h: 24 },
    { id: 'plot_ne', nameTh: 'ที่ดินว่างระเบียงบูรพาตอนล่าง', x: 170, y: 80, w: 14, h: 32 }
  ].map(p => ({ id: p.id, nameTh: p.nameTh, x: p.x + OX, y: p.y + OY, w: p.w, h: p.h }));

  /* -------- สถานี (station) ต่อชนิดอาคาร -------- */
  // spec: [kind, count, where('yard'|'in'|'open'), spacing]
  const STN = {
    gate: [['guard', 3, 'yard'], ['relax', 2, 'yard']],
    gate_north: [['guard', 2, 'yard'], ['relax', 2, 'yard']],
    gate_west: [['guard', 2, 'yard'], ['relax', 2, 'yard']],
    gate_east: [['guard', 2, 'yard'], ['relax', 2, 'yard']],
    main_hall: [['work', 4, 'in'], ['council', 12, 'in'], ['audience', 3, 'yard']],
    ancestral: [['pray', 4, 'yard']],
    meditation_hall: [['meditate', 10, 'yard']],
    scripture: [['read', 8, 'yard'], ['research', 3, 'in'], ['work', 2, 'in']],
    treasury: [['work', 3, 'in']],
    discipline: [['work', 2, 'in'], ['cell', 3, 'in'], ['guard', 2, 'yard']],
    dorm_core: [['bed', 8, 'in']], dorm_inner: [['bed', 14, 'in']], dorm_outer: [['bed', 24, 'in']],
    elder_quarters: [['bed', 10, 'in']],
    canteen: [['eat', 16, 'yard'], ['cook', 3, 'in']],
    training_ground: [['dummy', 10, 'open'], ['spar', 6, 'open'], ['lift', 4, 'open']],
    market: [['stall', 4, 'yard'], ['browse', 6, 'yard']],
    infirmary: [['patient', 6, 'in'], ['treat', 2, 'yard']],
    alchemy: [['cauldron', 4, 'yard'], ['herbtable', 2, 'yard']],
    forge: [['anvil', 4, 'yard'], ['array', 2, 'yard']],
    herb_garden: [['farm', 8, 'open']],
    farm: [['farm', 10, 'open']],
    mission_hall: [['work', 2, 'in'], ['board', 3, 'yard']],
    tea_garden: [['chat', 10, 'yard'], ['music', 2, 'yard']],
    shrine: [['worship', 6, 'yard']],
    mine: [['mine', 6, 'yard']],
    spirit_pond: [['fish', 6, 'shore'], ['relax', 4, 'shore']],
    plaza: [['stroll', 12, 'open']],
    cave: [['delve', 4, 'open']], realm_gate: [['watch', 3, 'open']], stele: [['explore', 3, 'open']], spring: [['explore', 3, 'open']], ruin: [['explore', 3, 'open']], grove: [['explore', 4, 'open']],
    tower: [['guard', 1, 'yard']],
    peak_sword: [['bed', 6, 'in'], ['pantry', 2, 'yard'], ['practice', 6, 'yard'], ['meditate', 4, 'yard']],
    peak_body: [['bed', 6, 'in'], ['pantry', 2, 'yard'], ['practice', 6, 'yard'], ['meditate', 4, 'yard']],
    peak_chaos: [['bed', 6, 'in'], ['pantry', 2, 'yard'], ['practice', 6, 'yard'], ['meditate', 4, 'yard']],
    peak_alchemy: [['bed', 6, 'in'], ['pantry', 2, 'yard'], ['practice', 6, 'yard'], ['meditate', 4, 'yard']],
    peak_magic: [['bed', 6, 'in'], ['pantry', 2, 'yard'], ['practice', 6, 'yard'], ['meditate', 4, 'yard']],
    peak_array: [['bed', 6, 'in'], ['pantry', 2, 'yard'], ['practice', 6, 'yard'], ['meditate', 4, 'yard']],
    peak_scholar: [['bed', 6, 'in'], ['pantry', 2, 'yard'], ['practice', 6, 'yard'], ['meditate', 4, 'yard']],
    peak_beast: [['bed', 6, 'in'], ['pantry', 2, 'yard'], ['practice', 6, 'yard'], ['meditate', 4, 'yard']]
  };
  MAP.STN = STN;

  // คำนวณแนวร่องน้ำของ「ธารน้ำปราณทักษิณ」(Southern Spirit River, y ≈ 268 บนแผนที่ 360×304)
  function riverCenterY(x) {
    return Math.round(268 + 2.5 * Math.sin((x - 45) / 32) + 1.2 * Math.cos((x - 135) / 20));
  }
  function riverHalfWidth(x) {
    return (x >= 230 && x <= 290) ? 4 : 3;
  }
  MAP.riverCenterY = riverCenterY;
  MAP.riverHalfWidth = riverHalfWidth;

  /* -------- สร้างแผนที่ -------- */
  MAP.create = function (seed) {
    const rng = new U.RNG('map' + (seed || 1));
    const M = { W, H, seed, hasSouthernRiver: true, topologyRev: 1 };
    const n = W * H;
    M.terrain = new Uint8Array(n);       // ชนิดพื้น
    M.block = new Uint8Array(n);         // 0 โล่ง, 1 อาคาร/สิ่งก่อสร้าง, 2 ธรรมชาติกั้น, 3 ต้นไม้/หิน
    M.owner = new Int16Array(n).fill(-1); // อาคารที่ครอบครองช่อง
    M.buildings = []; M.stations = []; M.decor = []; M.roads = [];
    const idx = (x, y) => y * W + x;
    const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
    M.idx = idx; M.inb = inb;

    // 1) ภูเขาล้อมรอบ + พื้นหญ้าในกำแพงสำนักขยายใหม่ (WX0=72..WX1=288, WY0=56..WY1=204 = 216×148)
    M.terrain.fill(T.CLIFF); M.block.fill(2);
    const WX0 = 72, WY0 = 56, WX1 = 288, WY1 = 204; // กรอบกำแพงสำนัก (รวมความหนา 2 ช่อง)
    for (let y = WY0; y <= WY1; y++) for (let x = WX0; x <= WX1; x++) {
      const wall = (x <= WX0 + 1 || x >= WX1 - 1 || y <= WY0 + 1 || y >= WY1 - 1);
      M.terrain[idx(x, y)] = wall ? T.WALL : T.GRASS; M.block[idx(x, y)] = wall ? 2 : 0;
    }
    M.wall = { x0: WX0, y0: WY0, x1: WX1, y1: WY1 };
    // พื้นที่ล่าและป่ารอบสำนัก 4 ทิศ (ใต้ y=205..247, ตะวันตก x=3..71, ตะวันออก x=289..356, เหนือ y=3..55)
    for (let y = WY1 + 1; y < H_BASE; y++) for (let x = 3; x < W - 3; x++) { M.terrain[idx(x, y)] = T.GRASS; M.block[idx(x, y)] = 0; }
    for (let y = 3; y <= WY1; y++) for (let x = 3; x < WX0; x++) { M.terrain[idx(x, y)] = T.GRASS; M.block[idx(x, y)] = 0; }
    for (let y = 3; y <= WY1; y++) for (let x = WX1 + 1; x < W - 3; x++) { M.terrain[idx(x, y)] = T.GRASS; M.block[idx(x, y)] = 0; }
    for (let y = 3; y < WY0; y++) for (let x = 3; x < W - 3; x++) { M.terrain[idx(x, y)] = T.GRASS; M.block[idx(x, y)] = 0; }

    // ช่องประตูกำแพงทั้ง 4 ทิศ เชื่อมสู่พื้นที่ป่ารอบสำนัก
    // 1. ประตูทิศใต้ (ทางเข้าหลัก x = 177..182, y = 203..204)
    const GX0 = 93 + OX, GX1 = 98 + OX;
    for (let y = WY1 - 1; y <= WY1; y++) for (let x = GX0; x <= GX1; x++) { M.terrain[idx(x, y)] = T.ARCH; M.block[idx(x, y)] = 0; }
    for (let y = WY1 + 1; y < H_BASE; y++) for (let x = 178; x <= 182; x++) { M.terrain[idx(x, y)] = T.ROAD; M.block[idx(x, y)] = 0; }

    // 2. ประตูทิศประจิม (ตะวันตก x = 72..73, y = 121..125)
    for (let y = 121; y <= 125; y++) for (let x = WX0; x <= WX0 + 1; x++) { M.terrain[idx(x, y)] = T.ARCH; M.block[idx(x, y)] = 0; }
    for (let y = 122; y <= 124; y++) for (let x = 12; x < WX0; x++) { M.terrain[idx(x, y)] = T.ROAD; M.block[idx(x, y)] = 0; }

    // 3. ประตูทิศบูรพา (ตะวันออก x = 287..288, y = 121..125)
    for (let y = 121; y <= 125; y++) for (let x = WX1 - 1; x <= WX1; x++) { M.terrain[idx(x, y)] = T.ARCH; M.block[idx(x, y)] = 0; }
    for (let y = 122; y <= 124; y++) for (let x = WX1 + 1; x <= 348; x++) { M.terrain[idx(x, y)] = T.ROAD; M.block[idx(x, y)] = 0; }

    // 4. ประตูทิศอุดร (เหนือ x = 177..182, y = 56..57)
    for (let y = WY0; y <= WY0 + 1; y++) for (let x = 177; x <= 182; x++) { M.terrain[idx(x, y)] = T.ARCH; M.block[idx(x, y)] = 0; }
    for (let y = 8; y < WY0; y++) for (let x = 178; x <= 181; x++) { M.terrain[idx(x, y)] = T.ROAD; M.block[idx(x, y)] = 0; }
    for (let y = WY0 + 2; y <= 28 + OY; y++) for (let x = 178; x <= 181; x++) { if (M.block[idx(x, y)] === 0) M.terrain[idx(x, y)] = T.ROAD; }

    // 2) อาคารหลักในกำแพงสำนัก
    let bidn = 0;
    function addBuilding(type, id, lx, ly, w, h, yard, open, absCoord) {
      const x = absCoord ? lx : lx + OX, y = absCoord ? ly : ly + OY;
      const b = { n: bidn++, id, type, x, y, w, h, yard: yard || 0, open: !!open, level: 1, hp: 100, nameTh: BTYPES[type].nameTh, inside: [], stations: [] };
      if (!open) {
        for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) { M.block[idx(xx, yy)] = 1; M.owner[idx(xx, yy)] = b.n; M.terrain[idx(xx, yy)] = T.FLOOR; }
        for (let yy = y + h; yy < y + h + b.yard; yy++) for (let xx = x - 1; xx < x + w + 1; xx++) { if (!inb(xx, yy) || M.block[idx(xx, yy)] !== 0) continue; M.terrain[idx(xx, yy)] = T.FLOOR; M.owner[idx(xx, yy)] = b.n; }
        b.door = { x: x + (w >> 1), y: y + h };
        b.area = { x: x - 1, y, w: w + 2, h: h + b.yard };
      } else {
        const tt = BTYPES[type].terr !== undefined ? BTYPES[type].terr : type === 'farm' || type === 'herb_garden' ? T.FARM : type === 'training_ground' ? T.DIRT : type === 'plaza' ? T.PLAZA : T.WATER;
        for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
          M.terrain[idx(xx, yy)] = tt; M.owner[idx(xx, yy)] = b.n;
          if (type === 'spirit_pond') { const edge = (xx === x || yy === y || xx === x + w - 1 || yy === y + h - 1); M.block[idx(xx, yy)] = edge ? 0 : 2; M.terrain[idx(xx, yy)] = edge ? T.SAND : T.WATER; }
        }
        b.door = { x: x + (w >> 1), y: y + h };
        b.area = { x, y, w, h };
      }
      M.buildings.push(b); return b;
    }
    LAYOUT.forEach(a => addBuilding(a[0], a[1], a[2], a[3], a[4], a[5], a[6], false));
    OPEN.forEach(a => addBuilding(a[0], a[1], a[2], a[3], a[4], a[5], 0, true));
    TOWERS.forEach((t, i) => addBuilding('tower', 'tower' + i, t[0], t[1], 4, 4, 2, false));
    // ประตูหลักทิศใต้ และป้อมประตูอีก 3 ทิศ (เหนือ/ตะวันตก/ตะวันออก)
    {
      const b = addBuilding('gate', 'gate', 172, 199, 16, 5, 2, false, true);
      b.area = { x: b.x, y: b.y - 2, w: 16, h: 7 };
      for (let yy = WY1 - 1; yy <= WY1; yy++) for (let xx = GX0; xx <= GX1; xx++) { M.block[idx(xx, yy)] = 0; M.terrain[idx(xx, yy)] = T.ARCH; }
      for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = GX0; xx <= GX1; xx++) { M.block[idx(xx, yy)] = 0; M.terrain[idx(xx, yy)] = T.ARCH; M.owner[idx(xx, yy)] = -1; }
      b.door = { x: 180, y: b.y - 1 };

      const gn = addBuilding('gate_north', 'gate_north', 170, 59, 6, 4, 2, false, true);
      gn.door = { x: 173, y: 63 };
      const gw = addBuilding('gate_west', 'gate_west', 75, 114, 5, 5, 2, false, true);
      gw.door = { x: 77, y: 119 };
      const ge = addBuilding('gate_east', 'gate_east', 280, 114, 5, 5, 2, false, true);
      ge.door = { x: 282, y: 119 };
    }
    M.byId = {}; M.buildings.forEach(b => M.byId[b.id] = b);

    // 3) ถนนหลักเชื่อมทั้ง 4 ประตูและระเบียงรอบในสำนัก
    const paintRoad = (x, y, w, h) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) { if (!inb(xx, yy)) continue; const k = idx(xx, yy); if (M.block[k] === 0 && M.terrain[k] !== T.PLAZA && M.terrain[k] !== T.FLOOR && M.terrain[k] !== T.ARCH) M.terrain[k] = T.ROAD; } };
    paintRoad(93 + OX, 48 + OY, 6, 95);        // แกนเหนือ–ใต้หลักถึงประตูใต้
    paintRoad(-10 + OX, 66 + OY, 214, 3);      // แกนตะวันตก–ตะวันออกหลักถึงประตูทั้งสองฝั่ง
    paintRoad(93 + OX, 2 + OY, 6, 40);         // แกนเหนือสู่ประตูอุดร
    paintRoad(8 + OX, 12 + OY, 3, 126);        // ถนนวงแหวนฝั่งตะวันตกเชื่อมยอดเขาศักดิ์สิทธิ์
    paintRoad(183 + OX, 12 + OY, 3, 126);      // ถนนวงแหวนฝั่งตะวันออกเชื่อมยอดเขาศักดิ์สิทธิ์
    // 4) เชื่อมประตูอาคารเข้าถนนด้วย A*
    function isRoadish(x, y) { const t = M.terrain[idx(x, y)]; return t === T.ROAD || t === T.PLAZA || t === T.ARCH; }
    // สร้างกริดชั่วคราวเพื่อนำทางก่อนวางต้นไม้
    M.speed = SPEED;
    MAP._cur = M;
    M.buildings.forEach(b => {
      if (b.type === 'gate' || b.type === 'plaza') return;
      const sx = b.door.x, sy = b.door.y;
      if (!inb(sx, sy)) return;
      // BFS ถึงถนนที่ใกล้สุด
      const path = bfsToRoad(M, sx, sy, isRoadish);
      if (path) path.forEach(([x, y]) => { const k = idx(x, y); if (M.block[k] === 0 && !isRoadish(x, y) && M.terrain[k] !== T.FLOOR && M.terrain[k] !== T.FARM && M.terrain[k] !== T.DIRT) { M.terrain[k] = T.ROAD; } });
    });
    // 5) สถานีกิจกรรมเดิม
    let sid = 0;
    M.buildings.forEach(b => {
      const specs = STN[b.type] || [];
      specs.forEach(([kind, count, where]) => {
        const spots = stationSpots(M, b, kind, count, where, rng);
        spots.forEach((p, i) => {
          const s = { id: sid++, bid: b.n, bkey: b.id, kind, x: p.x, y: p.y, inside: where === 'in', occ: null, n: i };
          if (b.id === 'spirit_pond' && kind === 'fish') s.zoneId = 'spirit_pond';
          M.stations.push(s); b.stations.push(s.id);
        });
      });
    });
    M.stationById = M.stations; // index == id
    // 6) ของตกแต่งเดิม: ต้นไม้ หิน ดอกไม้ ไผ่ ตะเกียง (คงการทอย rng เดิมทุกประการสำหรับ y < H_BASE)
    placeDecor(M, rng);

    // 7) ขยายแผนที่ลงทางทิศใต้ (y = 160..191): ธารน้ำปราณทักษิณ สะพาน ท่าน้ำ และจุดตกปลา 3 เขต
    sid = buildSouthernRiverExtension(M, seed, sid);

    // 7B) ขยายผังพื้นที่ 8 ยอดเขาศักดิ์สิทธิ์ (8-Peak Physical Sanctuary Layout) และถนนปราณเชื่อมลานกลาง (v4.1.0)
    sid = buildPeakSanctuariesExtension(M, seed, sid);

    M.stations.forEach(st => { if (M.block[st.y * W + st.x] !== 0) { const f = MAP.nearestFree(M, st.x, st.y); if (f) { st.x = f.x; st.y = f.y; } } });
    // 8) กริดต้นทุนนำทาง
    M.cost = new Float32Array(n);
    for (let i = 0; i < n; i++) M.cost[i] = M.block[i] !== 0 ? 0 : 1 / Math.max(0.2, SPEED[M.terrain[i]] || 1);
    return M;
  };

  function buildSouthernRiverExtension(M, seed, sid) {
    const rrng = new U.RNG('south_river_' + (seed || 1));
    const idx = M.idx;
    const inb = M.inb;

    // 7.1 เปิดพื้นที่หุบเขาริมน้ำทางใต้ (y = H_BASE-2..H-3, x = 3..W-4)
    for (let y = H_BASE - 2; y < H - 2; y++) {
      for (let x = 3; x < W - 3; x++) {
        const k = idx(x, y);
        if (y >= H_BASE) {
          M.terrain[k] = T.GRASS;
          M.block[k] = 0;
        }
      }
    }

    // 7.2 ขุดร่องน้ำ「ธารน้ำปราณทักษิณ」(T.WATER, block = 2 เดินลุยน้ำไม่ได้) และตลิ่งทราย/มอส
    for (let x = 3; x < W - 3; x++) {
      const cy = riverCenterY(x);
      const hw = riverHalfWidth(x);
      const northShore = cy - hw - 1;
      const southShore = cy + hw + 1;
      if (inb(x, northShore)) {
        M.terrain[idx(x, northShore)] = (x >= 60 && x <= 125) || (x >= 230 && x <= 292) ? T.MOSS : T.SAND;
        M.block[idx(x, northShore)] = 0;
      }
      if (inb(x, southShore)) {
        M.terrain[idx(x, southShore)] = (x >= 60 && x <= 125) || (x >= 230 && x <= 292) ? T.MOSS : T.SAND;
        M.block[idx(x, southShore)] = 0;
      }
      for (let y = cy - hw; y <= cy + hw; y++) {
        if (!inb(x, y)) continue;
        M.terrain[idx(x, y)] = T.WATER;
        M.block[idx(x, y)] = 2;
      }
      // ทางเดินเลียบฝั่งเหนือและฝั่งใต้
      const nPathY = cy - hw - 2;
      if (x >= 56 && x <= 304 && inb(x, nPathY)) {
        M.terrain[idx(x, nPathY)] = T.ROAD;
        M.block[idx(x, nPathY)] = 0;
      }
      const sPathY = cy + hw + 2;
      if (x >= 80 && x <= 280 && inb(x, sPathY)) {
        M.terrain[idx(x, sPathY)] = T.ROAD;
        M.block[idx(x, sPathY)] = 0;
      }
    }

    // 7.3 ถนนใหญ่ทิศใต้และสะพานข้ามธารน้ำ 3 แห่ง (เดินข้ามได้จริง block = 0)
    // สะพานหลักกลาง (x = 178..182) เชื่อมประตูสำนักสู่ทางออกยุทธภพ MAP.EXIT (180, 298)
    for (let y = M.wall.y1 + 1; y <= H - 3; y++) {
      for (let x = 178; x <= 182; x++) {
        const cy = riverCenterY(x), hw = riverHalfWidth(x);
        const onBridge = y >= cy - hw - 1 && y <= cy + hw + 1;
        const k = idx(x, y);
        M.terrain[k] = onBridge ? ((x === 178 || x === 182) ? T.FLOOR : T.ROAD) : T.ROAD;
        M.block[k] = 0;
      }
    }
    // สะพานไม้ไผ่ฝั่งตะวันตก (x = 92..94)
    for (let x = 92; x <= 94; x++) {
      const cy = riverCenterY(x), hw = riverHalfWidth(x);
      for (let y = cy - hw - 2; y <= cy + hw + 2; y++) {
        if (!inb(x, y)) continue;
        M.terrain[idx(x, y)] = T.FLOOR;
        M.block[idx(x, y)] = 0;
      }
    }
    // สะพานศิลาฝั่งตะวันออก (x = 264..266)
    for (let x = 264; x <= 266; x++) {
      const cy = riverCenterY(x), hw = riverHalfWidth(x);
      for (let y = cy - hw - 2; y <= cy + hw + 2; y++) {
        if (!inb(x, y)) continue;
        M.terrain[idx(x, y)] = T.FLOOR;
        M.block[idx(x, y)] = 0;
      }
    }

    // 7.4 ท่าน้ำไม้ยื่นลงริมน้ำ (Piers — T.FLOOR, block = 0 อยู่ติดผืนน้ำ T.WATER)
    const piers = [
      { x0: 162, x1: 168, side: 'north' },
      { x0: 192, x1: 198, side: 'north' },
      { x0: 76,  x1: 82,  side: 'north' },
      { x0: 246, x1: 252, side: 'north' },
      { x0: 168, x1: 173, side: 'south' },
      { x0: 187, x1: 192, side: 'south' }
    ];
    piers.forEach(p => {
      for (let x = p.x0; x <= p.x1; x++) {
        const cy = riverCenterY(x), hw = riverHalfWidth(x);
        const py = p.side === 'north' ? (cy - hw) : (cy + hw);
        const sy = p.side === 'north' ? (cy - hw - 1) : (cy + hw + 1);
        if (inb(x, py)) { M.terrain[idx(x, py)] = T.FLOOR; M.block[idx(x, py)] = 0; }
        if (inb(x, sy)) { M.terrain[idx(x, sy)] = T.FLOOR; M.block[idx(x, sy)] = 0; }
      }
    });

    // 7.5 สร้างเขตพื้นที่ตกปลา 3 เขตของธารน้ำปราณทักษิณ (ไม่ทับร่องน้ำที่เป็น T.WATER)
    function addRiverZone(type, id, x, y, w, h, zoneId, fishCoords, relaxCoords) {
      const b = {
        n: M.buildings.length,
        id,
        type,
        zoneId,
        x,
        y,
        w,
        h,
        yard: 0,
        open: true,
        level: 1,
        hp: 100,
        nameTh: BTYPES[type].nameTh,
        inside: [],
        stations: [],
        door: { x: x + (w >> 1), y: y + 1 },
        area: { x, y, w, h }
      };
      for (let yy = y; yy < y + h; yy++) {
        for (let xx = x; xx < x + w; xx++) {
          if (inb(xx, yy)) M.owner[idx(xx, yy)] = b.n;
        }
      }
      fishCoords.forEach((pt, i) => {
        const py = pt.y != null ? pt.y : (riverCenterY(pt.x) - riverHalfWidth(pt.x) - 1);
        const fx = pt.x, fy = py;
        M.block[idx(fx, fy)] = 0;
        if (M.terrain[idx(fx, fy)] === T.WATER) M.terrain[idx(fx, fy)] = T.FLOOR;
        const s = { id: sid++, bid: b.n, bkey: b.id, kind: 'fish', zoneId, x: fx, y: fy, inside: false, occ: null, n: i };
        M.stations.push(s);
        b.stations.push(s.id);
      });
      relaxCoords.forEach((pt, i) => {
        const py = pt.y != null ? pt.y : (riverCenterY(pt.x) - riverHalfWidth(pt.x) - 2);
        const rx = pt.x, ry = py;
        M.block[idx(rx, ry)] = 0;
        const s = { id: sid++, bid: b.n, bkey: b.id, kind: 'relax', zoneId, x: rx, y: ry, inside: false, occ: null, n: i };
        M.stations.push(s);
        b.stations.push(s.id);
      });
      M.buildings.push(b);
      M.byId[b.id] = b;
      return b;
    }

    // เขต 1: ท่าน้ำธารปราณทักษิณ (กลาง — river_central)
    addRiverZone(
      'river_dock', 'river_dock', 154, 258, 52, 18, 'river_central',
      [
        { x: 163, y: riverCenterY(163) - riverHalfWidth(163) },
        { x: 167, y: riverCenterY(167) - riverHalfWidth(167) },
        { x: 173, y: riverCenterY(173) - riverHalfWidth(173) - 1 },
        { x: 187, y: riverCenterY(187) - riverHalfWidth(187) - 1 },
        { x: 193, y: riverCenterY(193) - riverHalfWidth(193) },
        { x: 197, y: riverCenterY(197) - riverHalfWidth(197) },
        { x: 170, y: riverCenterY(170) + riverHalfWidth(170) },
        { x: 190, y: riverCenterY(190) + riverHalfWidth(190) }
      ],
      [
        { x: 158, y: riverCenterY(158) - riverHalfWidth(158) - 2 },
        { x: 174, y: riverCenterY(174) - riverHalfWidth(174) - 2 },
        { x: 186, y: riverCenterY(186) - riverHalfWidth(186) - 2 },
        { x: 201, y: riverCenterY(201) - riverHalfWidth(201) - 2 }
      ]
    );

    // เขต 2: คุ้งน้ำไผ่หยก (ตะวันตก — river_west)
    addRiverZone(
      'river_west', 'river_west', 64, 258, 50, 18, 'river_west',
      [
        { x: 70, y: riverCenterY(70) - riverHalfWidth(70) - 1 },
        { x: 77, y: riverCenterY(77) - riverHalfWidth(77) },
        { x: 81, y: riverCenterY(81) - riverHalfWidth(81) },
        { x: 100, y: riverCenterY(100) - riverHalfWidth(100) - 1 },
        { x: 108, y: riverCenterY(108) - riverHalfWidth(108) - 1 },
        { x: 88, y: riverCenterY(88) + riverHalfWidth(88) + 1 }
      ],
      [
        { x: 72, y: riverCenterY(72) - riverHalfWidth(72) - 2 },
        { x: 104, y: riverCenterY(104) - riverHalfWidth(104) - 2 }
      ]
    );

    // เขต 3: วังน้ำศิลาคราม (ตะวันออก — river_east)
    addRiverZone(
      'river_east', 'river_east', 234, 257, 54, 20, 'river_east',
      [
        { x: 240, y: riverCenterY(240) - riverHalfWidth(240) - 1 },
        { x: 247, y: riverCenterY(247) - riverHalfWidth(247) },
        { x: 251, y: riverCenterY(251) - riverHalfWidth(251) },
        { x: 272, y: riverCenterY(272) - riverHalfWidth(272) - 1 },
        { x: 282, y: riverCenterY(282) - riverHalfWidth(282) - 1 },
        { x: 258, y: riverCenterY(258) + riverHalfWidth(258) + 1 }
      ],
      [
        { x: 242, y: riverCenterY(242) - riverHalfWidth(242) - 2 },
        { x: 276, y: riverCenterY(276) - riverHalfWidth(276) - 2 }
      ]
    );

    // 7.6 ตกแต่งทิวทัศน์ริมธารน้ำปราณทักษิณและป่ารอบสำนัก 4 ทิศ (ไม่ทับเส้นทางเดินหรือจุดตกปลา)
    const keep = new Set();
    M.stations.forEach(st => {
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) keep.add((st.y + dy) * W + st.x + dx);
    });
    if (Array.isArray(MAP.MICRO_LOCATIONS)) {
      MAP.MICRO_LOCATIONS.forEach(ml => {
        if (!ml || !Number.isFinite(ml.mapX) || !Number.isFinite(ml.mapY)) return;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) keep.add((ml.mapY + dy) * W + ml.mapX + dx);
      });
    }
    // โคมไฟหัวสะพานทั้ง 3 แห่ง
    [[177, 262], [183, 262], [177, 274], [183, 274], [91, 263], [95, 263], [263, 262], [267, 262]].forEach(([lx, ly]) => {
      if (inb(lx, ly) && M.block[idx(lx, ly)] === 0) {
        M.decor.push({ x: lx, y: ly, kind: 'lantern', s: 1, r: 0, walk: true });
      }
    });
    // ป่าไผ่ โขดหินริมน้ำ และดอกไม้ริมตลิ่งทางใต้
    for (let i = 0; i < 320; i++) {
      const x = rrng.int(8, W - 9), y = rrng.int(H_BASE, H - 4), k = idx(x, y);
      if (M.block[k] !== 0 || M.terrain[k] !== T.GRASS || keep.has(k)) continue;
      if (x >= 174 && x <= 186) continue; // เว้นทางหลวงทิศใต้
      if (x >= 89 && x <= 97) continue;   // เว้นสะพานตะวันตก
      if (x >= 261 && x <= 269) continue; // เว้นสะพานตะวันออก
      const cy = riverCenterY(x), hw = riverHalfWidth(x);
      if (Math.abs(y - cy) <= hw + 3) continue; // เว้นตลิ่งและทางเดินเลียบน้ำ
      const kind = x < 140 ? (rrng.chance(0.65) ? 'bamboo' : 'pine') : x > 220 ? (rrng.chance(0.55) ? 'rock' : 'pine') : (rrng.chance(0.4) ? 'blossom' : 'bamboo');
      M.block[k] = 3;
      M.decor.push({ x, y, kind, s: 0.82 + rrng.next() * 0.45, r: rrng.next() });
    }
    // ตกแต่งป่ารอบสำนักทิศตะวันตก ตะวันออก และเหนือ (เว้นถนนและแนวเก็บสมุนไพรปลอดภัย)
    for (let i = 0; i < 540; i++) {
      const x = rrng.int(6, W - 7), y = rrng.int(6, H_BASE - 2), k = idx(x, y);
      if (x >= M.wall.x0 - 2 && x <= M.wall.x1 + 2 && y >= M.wall.y0 - 2 && y <= M.wall.y1 + 2) continue;
      if (M.block[k] !== 0 || M.terrain[k] !== T.GRASS || keep.has(k)) continue;
      if (x >= 174 && x <= 186) continue; // เว้นถนนเหนือ-ใต้
      if (y >= 119 && y <= 127) continue; // เว้นถนนตะวันตก-ตะวันออก
      if (x >= 118 && x <= 242 && y >= 204 && y <= 232) continue; // เว้นแนวปลอดภัยหน้าประตูใต้ให้โล่งเดินสะดวก
      const kind = x < M.wall.x0 ? (rrng.chance(0.7) ? 'bamboo' : 'pine') : x > M.wall.x1 ? (rrng.chance(0.6) ? 'rock' : 'pine') : ( y < M.wall.y0 ? (rrng.chance(0.5) ? 'pine' : 'rock') : 'pine' );
      M.block[k] = 3;
      M.decor.push({ x, y, kind, s: 0.85 + rrng.next() * 0.45, r: rrng.next() });
    }
    for (let i = 0; i < 160; i++) {
      const x = rrng.int(10, W - 10), y = rrng.int(H_BASE, H - 4), k = idx(x, y);
      if (M.block[k] !== 0 || (M.terrain[k] !== T.GRASS && M.terrain[k] !== T.MOSS)) continue;
      M.decor.push({ x, y, kind: 'flower', s: 1, r: rrng.next(), walk: true });
    }

    return sid;
  }

  function buildPeakSanctuariesExtension(M, seed, sid) {
    const prng = new U.RNG('peak_sanctuary_' + (seed || 1));
    const idx = M.idx;
    const inb = M.inb;
    const isRoadish = (x, y) => {
      if (!inb(x, y)) return false;
      const t = M.terrain[idx(x, y)];
      return t === T.ROAD || t === T.PLAZA || t === T.ARCH;
    };

    M.peakBuildings = [];
    M.peakByPeakId = {};
    M.leylinePaths = [];

    const pl = M.byId.plaza || { x: 80 + OX, y: 58 + OY, w: 32, h: 18 };
    const plCx = Math.floor(pl.x + pl.w / 2);
    const plCy = Math.floor(pl.y + pl.h / 2);

    // Clear decor items that overlap any 8-peak footprint or yard
    for (const pSpec of PEAK_LAYOUT_SPECS) {
      const x = pSpec.lx + OX, y = pSpec.ly + OY, w = pSpec.w, h = pSpec.h, yard = pSpec.yard || 2;
      for (let yy = y - 1; yy <= y + h + yard + 1; yy++) {
        for (let xx = x - 1; xx <= x + w + 1; xx++) {
          if (!inb(xx, yy)) continue;
          const k = idx(xx, yy);
          if (M.block[k] === 3) M.block[k] = 0;
        }
      }
      M.decor = M.decor.filter(d => !(d.x >= x - 1 && d.x <= x + w + 1 && d.y >= y - 1 && d.y <= y + h + yard + 1));

      const b = {
        n: M.buildings.length,
        id: pSpec.id,
        type: pSpec.type,
        peakId: pSpec.peakId,
        aliasId: pSpec.aliasId,
        dir: pSpec.dir,
        dirTh: pSpec.dirTh,
        leylineColor: pSpec.leylineColor,
        bannerColor: pSpec.bannerColor,
        isPeakSanctuary: true,
        founded: false,
        active: false,
        mistAlpha: 1.0,
        mistFadeStartT: null,
        x,
        y,
        w,
        h,
        yard,
        open: false,
        level: 1,
        hp: 100,
        nameTh: BTYPES[pSpec.type].nameTh,
        inside: [],
        stations: [],
        peakStations: [],
        door: { x: x + (w >> 1), y: y + h },
        area: { x: x - 1, y, w: w + 2, h: h + yard }
      };

      for (let yy = y; yy < y + h; yy++) {
        for (let xx = x; xx < x + w; xx++) {
          if (!inb(xx, yy)) continue;
          const k = idx(xx, yy);
          M.block[k] = 1;
          M.owner[k] = b.n;
          M.terrain[k] = T.FLOOR;
        }
      }
      for (let yy = y + h; yy < y + h + yard; yy++) {
        for (let xx = x - 1; xx < x + w + 1; xx++) {
          if (!inb(xx, yy)) continue;
          const k = idx(xx, yy);
          if (M.block[k] === 3) M.block[k] = 0;
          if (M.block[k] !== 0) continue;
          M.terrain[k] = T.PLAZA;
          M.owner[k] = b.n;
        }
      }

      // Carve Spirit Road (T.ROAD) from peak door to main sect road network
      let curX = b.door.x, curY = b.door.y;
      const targetY = U.clamp(curY, 28 + OY, 80 + OY);
      const targetX = curX < plCx ? (12 + OX) : (180 + OX);
      const roadPts = [];
      // Connect door vertically/horizontally via BFS or direct L-corridor to existing road
      const bfsPath = bfsToRoad(M, curX, curY, isRoadish);
      if (bfsPath && bfsPath.length) {
        bfsPath.forEach(([rx, ry]) => {
          const rk = idx(rx, ry);
          if (M.block[rk] === 3) M.block[rk] = 0;
          if (M.block[rk] === 0 && M.terrain[rk] !== T.PLAZA && M.terrain[rk] !== T.FLOOR && M.terrain[rk] !== T.ARCH) {
            M.terrain[rk] = T.ROAD;
          }
          roadPts.push([rx, ry]);
        });
      } else {
        while (curY !== targetY) {
          curY += (targetY > curY ? 1 : -1);
          if (inb(curX, curY) && M.block[idx(curX, curY)] !== 1 && M.block[idx(curX, curY)] !== 2) {
            M.block[idx(curX, curY)] = 0;
            M.terrain[idx(curX, curY)] = T.ROAD;
            roadPts.push([curX, curY]);
          }
        }
        while (curX !== targetX && !isRoadish(curX, curY)) {
          curX += (targetX > curX ? 1 : -1);
          if (inb(curX, curY) && M.block[idx(curX, curY)] !== 1 && M.block[idx(curX, curY)] !== 2) {
            M.block[idx(curX, curY)] = 0;
            M.terrain[idx(curX, curY)] = T.ROAD;
            roadPts.push([curX, curY]);
          }
        }
      }

      // Build leyline path waypoints from Peak Sanctuary center to Central Bagua Plaza
      const peakCx = x + w / 2, peakCy = y + h / 2;
      const midX = b.door.x, midY = plCy;
      b.leylineWaypoints = [
        { x: peakCx, y: peakCy },
        { x: b.door.x, y: b.door.y + 1 },
        { x: midX, y: midY },
        { x: plCx, y: plCy }
      ];
      M.leylinePaths.push({
        peakId: b.peakId,
        aliasId: b.aliasId,
        buildingId: b.id,
        color: b.leylineColor,
        waypoints: b.leylineWaypoints
      });

      // Create the 18 sub-stations for this Peak Sanctuary: [['bed', 6, 'in'], ['pantry', 2, 'yard'], ['practice', 6, 'yard'], ['meditate', 4, 'yard']]
      const specs = STN[b.type] || [];
      specs.forEach(([kind, count, where]) => {
        const spots = stationSpots(M, b, kind, count, where, prng);
        spots.forEach((p, i) => {
          const s = {
            id: sid++,
            bid: b.n,
            bkey: b.id,
            peakId: b.peakId,
            aliasId: b.aliasId,
            kind,
            peakStationKind: kind,
            x: p.x,
            y: p.y,
            inside: where === 'in',
            occ: null,
            owner: null,
            active: false,
            n: i
          };
          M.stations.push(s);
          b.stations.push(s.id);
          b.peakStations.push(s.id);
        });
      });

      M.buildings.push(b);
      M.byId[b.id] = b;
      M.peakBuildings.push(b);
      M.peakByPeakId[b.peakId] = b;
      M.peakByPeakId[b.aliasId] = b;
      M.peakByPeakId[b.id] = b;
    }

    return sid;
  }

  function stationSpots(M, b, kind, count, where, rng) {
    const out = [];
    const free = (x, y) => M.inb(x, y) && M.block[y * W + x] === 0;
    if (where === 'in') {
      // สถานีภายในอาคาร: ใช้ตำแหน่งประตู (ผู้ใช้จะถูกซ่อนในอาคาร) — กระจายตำแหน่งเสมือนบนผืนหลังคา
      for (let i = 0; i < count; i++) out.push({ x: b.door.x, y: b.door.y, v: i });
      return out;
    }
    if (where === 'yard') {
      const cols = Math.max(2, Math.floor((b.w + 2) / 3));
      const maxYardY = b.y + b.h + Math.max(1, (b.yard || 2) - 1);
      for (let y = b.y + b.h; y <= maxYardY && out.length < count; y++) {
        for (let c = 0; c < cols && out.length < count; c++) {
          const x = b.x + 1 + Math.round(c * (b.w - 2) / Math.max(1, cols - 1));
          if (free(x, y) && !out.some(o => o.x === x && o.y === y)) out.push({ x, y });
        }
      }
      for (let y = b.y + b.h; y <= maxYardY && out.length < count; y++) {
        for (let x = b.x; out.length < count && x < b.x + b.w; x++) {
          if (free(x, y) && !out.some(o => o.x === x && o.y === y)) out.push({ x, y });
        }
      }
      return out;
    }
    if (where === 'shore') { // รอบสระ
      const r = [];
      for (let x = b.x; x < b.x + b.w; x++) { r.push({ x, y: b.y + b.h - 1 }); }
      for (let i = 0; i < count; i++) { const p = r[Math.floor((i + 0.5) * r.length / count)]; out.push({ x: p.x, y: p.y }); }
      return out;
    }
    // open: กระจายในพื้นที่ (เลี่ยงจุดสิ่งกีดขวาง เช่น น้ำพุกลางลาน 95..97+OX, 66..68+OY)
    const cols = Math.max(2, Math.ceil(Math.sqrt(count * b.w / b.h)));
    const rows = Math.ceil(count / cols);
    for (let i = 0; i < count; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      let x = Math.min(b.x + b.w - 2, b.x + 2 + Math.floor(c * (b.w - 4) / Math.max(1, cols - 1)));
      let y = Math.min(b.y + b.h - 2, b.y + 2 + Math.floor(r * (b.h - 4) / Math.max(1, rows - 1)));
      if (b.id === 'plaza' && x >= 95 + OX && x <= 97 + OX && y >= 66 + OY && y <= 68 + OY) {
        x = 94 + OX;
      }
      if (!free(x, y) && MAP.nearestFree) {
        const nf = MAP.nearestFree(M, x, y);
        if (nf) { x = nf.x; y = nf.y; }
      }
      out.push({ x, y });
    }
    return out;
  }

  function bfsToRoad(M, sx, sy, isRoadish) {
    const prev = new Int32Array(W * H).fill(-1);
    const q = [sy * W + sx]; prev[sy * W + sx] = sy * W + sx;
    let qi = 0;
    while (qi < q.length) {
      const k = q[qi++], x = k % W, y = (k / W) | 0;
      if (isRoadish(x, y) && !(x === sx && y === sy)) {
        const path = []; let c = k; while (c !== sy * W + sx) { path.push([c % W, (c / W) | 0]); c = prev[c]; } return path;
      }
      for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (!M.inb(nx, ny)) continue; const nk = ny * W + nx;
        if (prev[nk] !== -1 || M.block[nk] !== 0) continue;
        prev[nk] = k; q.push(nk);
      }
      if (qi > 12000) break;
    }
    return null;
  }

  function placeDecor(M, rng) {
    const idx = M.idx;
    const near = (x, y, r, f) => { for (let yy = y - r; yy <= y + r; yy++) for (let xx = x - r; xx <= x + r; xx++) { if (M.inb(xx, yy) && f(M.terrain[idx(xx, yy)], M.block[idx(xx, yy)], xx, yy)) return true; } return false; };
    const keep = new Set(); M.stations.forEach(st => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) keep.add((st.y + dy) * W + st.x + dx); });
    M.buildings.forEach(b => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) keep.add((b.door.y + dy) * W + b.door.x + dx); });
    // ต้นไม้ภายในกำแพง (ห่างถนน/อาคาร) + แนวไผ่
    for (let i = 0; i < 2600; i++) {
      const x = rng.int(M.wall.x0 + 2, M.wall.x1 - 2), y = rng.int(M.wall.y0 + 2, M.wall.y1 - 3), k = idx(x, y);
      if (M.block[k] !== 0 || M.terrain[k] !== T.GRASS || keep.has(k)) continue;
      if (near(x, y, 1, (t, b) => t === T.ROAD || t === T.FLOOR || t === T.PLAZA || t === T.ARCH || b === 1 || t === T.FARM || t === T.DIRT)) continue;
      // เว้นที่ดินว่างสำหรับขยายให้โล่งกว่า
      const inPlot = MAP.PLOTS.some(p => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
      if (inPlot && rng.chance(0.82)) continue;
      const kind = rng.chance(0.18) ? 'bamboo' : rng.chance(0.2) ? 'blossom' : rng.chance(0.15) ? 'rock' : 'pine';
      M.block[k] = 3; M.decor.push({ x, y, kind, s: 0.8 + rng.next() * 0.5, r: rng.next() });
    }
    // ดอกไม้เล็ก ๆ (ไม่กีดขวาง)
    for (let i = 0; i < 700; i++) {
      const x = rng.int(M.wall.x0 + 2, M.wall.x1 - 2), y = rng.int(M.wall.y0 + 2, M.wall.y1 - 3), k = idx(x, y);
      if (M.block[k] !== 0 || M.terrain[k] !== T.GRASS) continue;
      M.decor.push({ x, y, kind: 'flower', s: 1, r: rng.next(), walk: true });
    }
    // ต้นไม้นอกประตู (คงขอบเขต H_BASE - 2 เพื่อรักษา state ของ rng เดิม)
    for (let i = 0; i < 260; i++) {
      const x = rng.int(158, 202), y = rng.int(M.wall.y1 + 2, H_BASE - 2), k = idx(x, y);
      if (M.block[k] !== 0 || M.terrain[k] !== T.GRASS) continue;
      if (x >= 174 && x <= 186) continue;
      M.block[k] = 3; M.decor.push({ x, y, kind: rng.chance(0.3) ? 'rock' : 'pine', s: 0.8 + rng.next() * 0.5, r: rng.next() });
    }
    // ตะเกียงข้างถนนหลัก
    for (let y = 52 + OY; y < 112 + OY; y += 8) { M.decor.push({ x: 92 + OX, y, kind: 'lantern', s: 1, r: 0, walk: true }); M.decor.push({ x: 99 + OX, y, kind: 'lantern', s: 1, r: 0, walk: true }); }
    // น้ำพุกลางลาน
    M.decor.push({ x: 96 + OX, y: 67 + OY, kind: 'fountain', s: 1, r: 0 });
    for (let yy = 66 + OY; yy <= 68 + OY; yy++) for (let xx = 95 + OX; xx <= 97 + OX; xx++) M.block[idx(xx, yy)] = 1;
    // ธงตามหน้าตำหนักใหญ่
    const mh = M.byId.main_hall;
    M.decor.push({ x: mh.x + 2, y: mh.y + mh.h + 2, kind: 'banner', s: 1, r: 0, walk: true });
    M.decor.push({ x: mh.x + mh.w - 3, y: mh.y + mh.h + 2, kind: 'banner', s: 1, r: 0, walk: true });
  }

  /* -------- A* -------- */
  const DX8 = new Int8Array([1, -1, 0, 0, 1, 1, -1, -1]);
  const DY8 = new Int8Array([0, 0, 1, -1, 1, -1, 1, -1]);
  const DC8 = new Float32Array([1, 1, 1, 1, 1.4142, 1.4142, 1.4142, 1.4142]);
  MAP.nearestFree = function (M, x, y) {
    x = Math.floor(x); y = Math.floor(y);
    if (M.inb(x, y) && M.block[y * W + x] === 0) return { x, y };
    for (let r = 1; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const nx = x + dx, ny = y + dy; if (M.inb(nx, ny) && M.block[ny * W + nx] === 0) return { x: nx, y: ny };
    }
    return null;
  };
  let gScore = null, came = null, stamp = null, closed = null, curStamp = 0, sharedHeap = null;
  const _pcBySeed = new Map();
  MAP.invalidatePathCache = function (M) {
    if (M) {
      M.topologyRev = (M.topologyRev || 1) + 1;
      if (M._pc) M._pc.clear();
      M._gateReach = null;
    }
    _pcBySeed.clear();
  };
  const WALL_GATES = [
    { id: 'S', inX: 180, inY: 202, midX: 180, midY: 204, outX: 180, outY: 206 },
    { id: 'N', inX: 180, inY: 58,  midX: 180, midY: 56,  outX: 180, outY: 54 },
    { id: 'W', inX: 74,  inY: 123, midX: 72,  midY: 123, outX: 70,  outY: 123 },
    { id: 'E', inX: 286, inY: 123, midX: 288, midY: 123, outX: 290, outY: 123 }
  ];
  MAP.WALL_GATES = WALL_GATES;
  MAP.findPath = function (M, sx, sy, gx, gy) {
    sx = Math.floor(sx); sy = Math.floor(sy); gx = Math.floor(gx); gy = Math.floor(gy);
    if (!(sx >= 0 && sy >= 0 && sx < W && sy < H && M.block[sy * W + sx] === 0)) {
      const s = MAP.nearestFree(M, sx, sy);
      if (!s) return null;
      sx = s.x; sy = s.y;
    }
    if (!(gx >= 0 && gy >= 0 && gx < W && gy < H && M.block[gy * W + gx] === 0)) {
      const t = MAP.nearestFree(M, gx, gy);
      if (!t) return null;
      gx = t.x; gy = t.y;
    }
    if (sx === gx && sy === gy) return [[gx, gy]];
    const rev = M.topologyRev || 1;
    const key = rev + ':' + sx + ',' + sy + ':' + gx + ',' + gy;
    let pc = M._pc;
    if (!pc) {
      const skey = M.seed || 1;
      pc = _pcBySeed.get(skey);
      if (!pc) { pc = new Map(); _pcBySeed.set(skey, pc); }
      M._pc = pc;
    }
    if (pc.has(key)) return pc.get(key);
    const w0 = (M.wall && M.wall.x0) || 72, w1 = (M.wall && M.wall.x1) || 288, wy0 = (M.wall && M.wall.y0) || 56, wy1 = (M.wall && M.wall.y1) || 204;
    const sInWall = sx > w0 && sx < w1 && sy > wy0 && sy < wy1;
    const gInWall = gx > w0 && gx < w1 && gy > wy0 && gy < wy1;
    if (sInWall !== gInWall) {
      const orderedGates = WALL_GATES.slice().sort((a, b) => {
        const da = Math.abs(sx - a.midX) + Math.abs(sy - a.midY) + Math.abs(gx - a.midX) + Math.abs(gy - a.midY);
        const db = Math.abs(sx - b.midX) + Math.abs(sy - b.midY) + Math.abs(gx - b.midX) + Math.abs(gy - b.midY);
        return da - db;
      });
      let joined = null;
      for (let gi = 0; gi < orderedGates.length; gi++) {
        const gt = orderedGates[gi];
        if (M.block[gt.midY * W + gt.midX] !== 0 || M.block[gt.inY * W + gt.inX] !== 0 || M.block[gt.outY * W + gt.outX] !== 0) continue;
        const p1 = sInWall ? MAP.findPath(M, sx, sy, gt.inX, gt.inY) : MAP.findPath(M, sx, sy, gt.outX, gt.outY);
        if (!p1) continue;
        const p2 = sInWall ? MAP.findPath(M, gt.outX, gt.outY, gx, gy) : MAP.findPath(M, gt.inX, gt.inY, gx, gy);
        if (p2) {
          joined = p1.concat([[gt.midX, gt.midY]], p2);
          break;
        }
      }
      if (pc.size >= 16000) { let ev = 0; for (const k of pc.keys()) { pc.delete(k); if (++ev >= 3000) break; } }
      pc.set(key, joined);
      return joined;
    }
    const totalCells = M.W * M.H;
    if (!gScore || gScore.length !== totalCells) {
      gScore = new Float32Array(totalCells);
      came = new Int32Array(totalCells);
      stamp = new Uint32Array(totalCells);
      closed = new Uint32Array(totalCells);
      sharedHeap = new U.MinHeap();
      curStamp = 0;
    }
    curStamp++;
    const heap = sharedHeap; heap.clear();
    const cost = M.cost;
    const sk = sy * W + sx, gk = gy * W + gx;
    gScore[sk] = 0; stamp[sk] = curStamp; came[sk] = -1; heap.push(0, sk);
    let found = false, it = 0;
    while (heap.size) {
      const k = heap.pop(); if (k === gk) { found = true; break; }
      if (closed[k] === curStamp) continue; closed[k] = curStamp;
      if (++it > 95000) break;
      const x = k % W, y = (k / W) | 0, gk0 = gScore[k];
      for (let d = 0; d < 8; d++) {
        const dx = DX8[d], dy = DY8[d], nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const nk = ny * W + nx; if (closed[nk] === curStamp || cost[nk] === 0) continue;
        if (dx !== 0 && dy !== 0 && (cost[y * W + nx] === 0 || cost[ny * W + x] === 0)) continue; // กันตัดมุม
        const nInWall = nx > w0 && nx < w1 && ny > wy0 && ny < wy1;
        if (nInWall !== gInWall) continue;
        const ng = gk0 + DC8[d] * cost[nk];
        if (stamp[nk] !== curStamp || ng < gScore[nk]) {
          stamp[nk] = curStamp; gScore[nk] = ng; came[nk] = k;
          let hDist;
          let hx = Math.abs(nx - gx), hy = Math.abs(ny - gy);
          if (!gInWall && nx > w0 - 6 && nx < w1 + 6 && ((ny >= wy1 && gy <= wy0) || (ny <= wy0 && gy >= wy1))) {
            const detourWest = (nx - (w0 - 6)) + Math.abs(gx - (w0 - 6));
            const detourEast = ((w1 + 6) - nx) + Math.abs((w1 + 6) - gx);
            hx = detourWest < detourEast ? detourWest : detourEast;
          }
          hDist = (hx + hy) - 0.5858 * (hx < hy ? hx : hy);
          heap.push(ng + 1.35 * hDist, nk);
        }
      }
    }
    MAP._lastIt = it; if (!found) { if (pc.size >= 16000) { let ev = 0; for (const k of pc.keys()) { pc.delete(k); if (++ev >= 3000) break; } } pc.set(key, null); return null; }
    const path = []; let c = gk; while (c !== -1) { path.push([c % W, (c / W) | 0]); c = came[c]; }
    path.reverse();
    if (pc.size >= 16000) {
      let ev = 0;
      for (const k of pc.keys()) { pc.delete(k); if (++ev >= 3000) break; }
    }
    pc.set(key, path);
    return path;
  };
  MAP.speedAt = (M, x, y) => { x |= 0; y |= 0; return (x >= 0 && y >= 0 && x < W && y < H) ? (SPEED[M.terrain[y * W + x]] || 1) : 1; };
  MAP.blocked = (M, x, y) => { x = Math.floor(x); y = Math.floor(y); return !M.inb(x, y) || M.block[y * W + x] !== 0; };
  MAP.stationsOf = (M, b) => b.stations.map(i => M.stations[i]);
  MAP.isOutsideWall = (M, x, y) => {
    if (!M || !M.wall) return true;
    const w = M.wall;
    return x < w.x0 || x > w.x1 || y < w.y0 || y > w.y1;
  };
  // Include the South Gate threshold and safe herb meadow outside South Gate (x=120..240, y=204..230).
  MAP.SAFE_BELT = Object.freeze({ x0: 120, x1: 240, y0: 204, y1: 230 });
  MAP.RIVER_BELT = Object.freeze({ x0: 56, x1: 300, y0: 254, y1: 284 });
  MAP.isInSafeBelt = (x, y) => {
    const sb = MAP.SAFE_BELT;
    return x >= sb.x0 && x <= sb.x1 && y >= sb.y0 && y <= sb.y1;
  };
  MAP.isInRiverBelt = (x, y) => {
    const rb = MAP.RIVER_BELT;
    return x >= rb.x0 && x <= rb.x1 && y >= rb.y0 && y <= rb.y1;
  };
  MAP.hasAdjacentWater = (M, x, y) => {
    x = Math.floor(x); y = Math.floor(y);
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (M.inb(nx, ny) && M.terrain[ny * M.W + nx] === T.WATER) return true;
    }
    return false;
  };

  MAP.isReachableFromGate = function (M, x, y) {
    x = Math.floor(x); y = Math.floor(y);
    if (!M || !M.inb(x, y) || M.block[y * W + x] !== 0 || M.cost[y * W + x] === 0) return false;
    let reach = M._gateReach;
    if (!reach) {
      const total = W * H;
      reach = M._gateReach = new Uint8Array(total);
      const q = new Int32Array(total);
      let head = 0, tail = 0;
      const s0 = MAP.nearestFree(M, 180, 204);
      if (s0) {
        const sk = s0.y * W + s0.x;
        reach[sk] = 1;
        q[tail++] = sk;
      }
      const cost = M.cost;
      while (head < tail) {
        const k = q[head++], cx = k % W, cy = (k / W) | 0;
        for (let d = 0; d < 8; d++) {
          const dx = DX8[d], dy = DY8[d], nx = cx + dx, ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const nk = ny * W + nx;
          if (reach[nk] || cost[nk] === 0) continue;
          if (dx !== 0 && dy !== 0 && (cost[cy * W + nx] === 0 || cost[ny * W + cx] === 0)) continue;
          reach[nk] = 1;
          q[tail++] = nk;
        }
      }
    }
    return reach[y * W + x] === 1;
  };


  /* ---------- Patch v4.0.0 [Pillar 5]: 4 Living Micro-Locations on World Map ---------- */
  MAP.MICRO_LOCATIONS = Object.freeze({
    LOC_NAMELESS_SWORD_TOMB: {
      id: 'LOC_NAMELESS_SWORD_TOMB',
      nameTh: 'สุสานกระบี่นิรนาม',
      icon: '🗡️',
      macroRegion: 'NORTHERN_PEAKS',
      terrain: 'mountain',
      x: 62, y: 24,
      mapX: 222, mapY: 32,
      danger: 3,
      descTh: 'เนินดินฝังศาสตรานับพันของยอดกระบี่นิรนาม แฝงปราณกระบี่โบราณที่รอผู้มีวาสนาเข้าถึงเจตจำนง'
    },
    LOC_ANCIENT_MECH_RUINS: {
      id: 'LOC_ANCIENT_MECH_RUINS',
      nameTh: 'ซากนครกลไกบรรพกาล',
      icon: '⚙️',
      macroRegion: 'WESTERN_BADLANDS',
      terrain: 'ruins',
      x: 28, y: 58,
      mapX: 42, mapY: 162,
      danger: 4,
      descTh: 'ซากโรงหลอมหุ่นเชิดยุคโบราณที่ยังมีฟันเฟืองปราณหมุนเวียน ซ่อนแก่นกลไกและพิมพ์เขียวลับ'
    },
    LOC_MYRIAD_VENOM_FOREST: {
      id: 'LOC_MYRIAD_VENOM_FOREST',
      nameTh: 'ป่าหมื่นพิษเร้นลับ',
      icon: '🐍',
      macroRegion: 'SOUTHERN_WATERS',
      terrain: 'forest',
      x: 44, y: 82,
      mapX: 148, mapY: 238,
      danger: 3,
      descTh: 'ป่าดงดิบปกคลุมด้วยหมอกพิษเจ็ดสี อุดมด้วยสมุนไพรพิษหายากและแมลงกู่บรรพกาล'
    },
    LOC_MOON_MIRROR_VALLEY: {
      id: 'LOC_MOON_MIRROR_VALLEY',
      nameTh: 'หุบเขากระจกจันทรา',
      icon: '🌙',
      macroRegion: 'EASTERN_PLAINS',
      terrain: 'water',
      x: 82, y: 46,
      mapX: 318, mapY: 132,
      danger: 3,
      descTh: 'ทะเลสาบใสประดุจกระจกเงาสะท้อนแสงจันทร์พันปี ช่วยชำระมารในใจและควบแน่นน้ำค้างจันทรา'
    }
  });
  MAP.getMicroLocations = () => Object.values(MAP.MICRO_LOCATIONS);

  /* ---------- Patch v4.1.0 [Pillar 1, 2 & 5]: 8-Peak Sanctuary Lookup, Conditional Awakening & Leylines ---------- */
  MAP.getPeakBuilding = function (M, peakOrBldId) {
    if (!M || !peakOrBldId) return null;
    if (M.peakByPeakId && M.peakByPeakId[peakOrBldId]) return M.peakByPeakId[peakOrBldId];
    if (M.byId && M.byId[peakOrBldId] && M.byId[peakOrBldId].isPeakSanctuary) return M.byId[peakOrBldId];
    return (M.buildings || []).find(b => b && b.isPeakSanctuary && (b.id === peakOrBldId || b.peakId === peakOrBldId || b.aliasId === peakOrBldId)) || null;
  };

  MAP.isPeakBuildingActive = function (W, bOrId) {
    if (!W || !W.sect) return false;
    const M = W.map;
    const b = (typeof bOrId === 'object' && bOrId) ? bOrId : MAP.getPeakBuilding(M, bOrId);
    if (!b) return false;
    if (!b.isPeakSanctuary) return true;
    const pk = W.sect.peaks;
    if (!pk || typeof pk !== 'object') return !!b.founded;
    const rec = (pk.byId && (pk.byId[b.peakId] || pk.byId[b.aliasId] || pk.byId[b.id])) || pk[b.peakId] || pk[b.aliasId] || pk[b.id];
    if (rec && typeof rec === 'object' && typeof rec.founded === 'boolean') {
      return rec.founded === true;
    }
    return !!b.founded;
  };

  MAP.syncPeakSanctuaries = function (W) {
    if (!W || !W.map || !Array.isArray(W.map.peakBuildings)) return;
    const M = W.map;
    const pk = W.sect && W.sect.peaks;
    for (let i = 0; i < M.peakBuildings.length; i++) {
      const b = M.peakBuildings[i];
      if (!b) continue;
      // Ensure direct alias access on W.sect.peaks[peakId] as well as W.sect.peaks.byId[peakId]
      if (pk && pk.byId && pk.byId[b.peakId]) {
        if (!pk[b.peakId]) pk[b.peakId] = pk.byId[b.peakId];
        if (b.aliasId && !pk[b.aliasId]) pk[b.aliasId] = pk.byId[b.peakId];
        if (!pk[b.id]) pk[b.id] = pk.byId[b.peakId];
      }
      const isFounded = MAP.isPeakBuildingActive(W, b);
      const wasFounded = !!b.founded;
      b.founded = isFounded;
      b.active = isFounded;
      if (isFounded && !wasFounded) {
        b.mistFadeStartT = Number.isFinite(W.t) ? W.t : 0;
      } else if (!isFounded) {
        b.mistAlpha = 1.0;
        b.mistFadeStartT = null;
      }
      const stIds = b.peakStations || b.stations || [];
      for (let j = 0; j < stIds.length; j++) {
        const s = M.stations[stIds[j]];
        if (!s) continue;
        s.active = isFounded;
        if (isFounded && s.peakStationKind) {
          s.kind = s.peakStationKind;
        }
        if (!isFounded && s.occ != null) {
          s.occ = null;
        }
      }
    }
  };

  MAP.getLeylinePaths = function (W) {
    const M = W && W.map ? W.map : W;
    if (!M || !Array.isArray(M.leylinePaths)) return [];
    return M.leylinePaths.map(lp => {
      const active = (W && W.sect) ? MAP.isPeakBuildingActive(W, lp.peakId) : false;
      return Object.assign({}, lp, { active });
    });
  };

  g.MAP = MAP;
  if (typeof module === 'object' && module.exports) module.exports = MAP;
})(typeof globalThis !== 'undefined' ? globalThis : this);
