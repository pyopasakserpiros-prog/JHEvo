/* skills.js — ระบบวิชาต่อสู้และลำดับขั้นความเชี่ยวชาญ (v1.10 Overhaul):
 * วิชาแต่ละท่ามี "รูปแบบ" ต่างกันจริง พร้อมรองรับวิชาหลายกระบวนท่า (1, 2, 3, 4, 6 กระบวนท่า)
 * ที่ปลดล็อกตามความเชี่ยวชาญจริง (n.cult.tm[techId]) และขั้นบำเพ็ญ */
(function (g) {
  'use strict';
  const U = g.U, HC = g.HC, CULT = g.CULT, JD = g.JD;
  const clamp = U.clamp;
  const SK = {};

  /* e = ประสิทธิภาพเทียบการโจมตีธรรมดา (1.0 = เท่ากัน) · cd/wind หน่วย "นาทีเกม" · cost = ตัวคูณปราณ */
  SK.ARCH = {
    strike: { nameTh: 'ท่าสังหารเดี่ยว', icon: '🗡️', e: 1.2, cd: 10, wind: 5, hits: 1, cost: 1.0, off: true, desc: 'โจมตีเป้าหมายเดียวหนักมือ' },
    flurry: { nameTh: 'ท่ากระหน่ำ', icon: '⚡', e: 1.2, cd: 9, wind: 4, hits: 3, cost: 1.1, off: true, desc: 'ฟาด 3 ครั้งรัว (คริ/โดนได้ทีละครั้ง) ดีต่อเกราะบาง' },
    sweep: { nameTh: 'ท่ากวาดวงกว้าง', icon: '🌀', e: 0.9, cd: 12, wind: 5, hits: 1, cost: 1.25, off: true, aoe: true, desc: 'โจมตีศัตรูทุกตัวในระยะ (ต่อตัวเบากว่า)' },
    pierce: { nameTh: 'ท่าทะลวงเกราะ', icon: '🔱', e: 1.1, cd: 11, wind: 5, hits: 1, cost: 1.0, off: true, penAdd: 30, desc: 'เจาะเกราะ +30% และทำให้ป้องกันลด 15%' },
    burst: { nameTh: 'ท่าสุดยอด', icon: '💥', e: 1.3, cd: 26, wind: 9, hits: 1, cost: 2.3, off: true, desc: 'ท่าไม้ตาย ร่ายนาน คูลดาวน์ยาว ใช้ปราณมหาศาล' },
    dot: { nameTh: 'ท่าบั่นทอน', icon: '☠️', e: 1.25, cd: 14, wind: 5, hits: 1, cost: 1.1, off: true, dot: 0.8, desc: 'ฟาดเบา ๆ แล้วทิ้งแผลต่อเนื่อง (ไม่ผ่านเกราะ 50%)' },
    control: { nameTh: 'ท่าตรึงศัตรู', icon: '⛓️', e: 0.7, cd: 18, wind: 5, hits: 1, cost: 1.3, off: true, ctrl: true, desc: 'ตรึง/ชะลอ/ผนึกวิชาตามธาตุ (ศัตรูขั้นสูงกว่าต้านได้)' },
    drain: { nameTh: 'ท่าดูดพลัง', icon: '🩸', e: 1.05, cd: 14, wind: 5, hits: 1, cost: 1.1, off: true, steal: 0.45, desc: 'โจมตีพร้อมดูดพลังชีวิตกลับ 45% ของความเสียหาย' },
    counter: { nameTh: 'ท่าสวนกลับ', icon: '↩️', e: 1.0, cd: 16, wind: 3, hits: 1, cost: 0.9, self: true, desc: 'ตั้งท่า 10 นาที โดนตีแล้วปัดทิ้งและสวนกลับหนัก' },
    guard: { nameTh: 'ท่าตั้งรับ', icon: '🛡️', e: 0, cd: 20, wind: 3, hits: 0, cost: 1.0, self: true, desc: 'เกราะพลังดูดซับความเสียหาย + ป้องกันเพิ่ม 12 นาที' },
    heal: { nameTh: 'ท่าบำบัด', icon: '💚', e: 0, cd: 28, wind: 6, hits: 0, cost: 1.4, team: true, desc: 'ฟื้นพลังชีวิตและล้างสถานะร้าย (ช่วยพวกพ้องที่เจ็บหนักที่สุด)' },
    evade: { nameTh: 'ท่าเงาพลิ้ว', icon: '💨', e: 0, cd: 22, wind: 2, hits: 0, cost: 0.8, self: true, desc: 'หลบหลีก +50% เดินทางไว 14 นาที ใช้หนีได้ดี' },
    forbid: { nameTh: 'วิชาต้องห้าม', icon: '🔥', e: 1.8, cd: 40, wind: 10, hits: 1, cost: 1.8, off: true, recoil: 0.12, desc: 'พลังสังหารสูงสุด แต่เสียเลือดตนเองและเปิดเกราะ 12 นาที' },
    support: { nameTh: 'ท่าหนุนทัพ', icon: '✨', e: 0, cd: 22, wind: 4, hits: 0, cost: 1.2, team: true, desc: 'ปลุกขวัญและเสริมแกร่งฝ่ายตนเอง (เพิ่มโจมตี/ป้องกัน/เร่งสปีดแก่พวกพ้อง)' },
    summon: { nameTh: 'วิชาอัญเชิญ', icon: '👥', e: 0, cd: 34, wind: 5, hits: 0, cost: 1.7, team: true, desc: 'อัญเชิญร่างจำลองหรือเทพอสูรเข้าร่วมรบชั่วคราว มีพลังชีวิตและช่วยต่อสู้' },
    channel: { nameTh: 'วิชาร่ายต่อเนื่อง', icon: '🌀', e: 1.5, cd: 20, wind: 2, hits: 1, cost: 1.4, off: true, channel: true, desc: 'เพ่งจิตร่ายวิชาต่อเนื่องทีละรอบ ปลดปล่อยความเสียหายสะสม แต่ถูกขัดจังหวะได้' },
    snipe: { nameTh: 'ท่าเล็งสังหาร', icon: '🏹', e: 1.28, cd: 12, wind: 5, hits: 1, cost: 1.1, off: true, penAdd: 18, desc: 'ยิงแม่นยำระยะไกล เจาะเกราะและคริติคอลสูง' },
    barrage: { nameTh: 'ท่าระดมยิง', icon: '🌧️', e: 1.15, cd: 13, wind: 5, hits: 3, cost: 1.25, off: true, aoe: true, desc: 'ระดมโจมตีต่อเนื่องครอบคลุมพื้นที่' },
    charge: { nameTh: 'ท่าพุ่งทะลวง', icon: '🐎', e: 1.22, cd: 11, wind: 4, hits: 1, cost: 1.05, off: true, penAdd: 15, desc: 'พุ่งเข้าปะทะอย่างรวดเร็ว ทะลวงแนวป้องกัน' },
    execute: { nameTh: 'ท่าปลิดชีพ', icon: '⚔️', e: 1.38, cd: 16, wind: 6, hits: 1, cost: 1.35, off: true, penAdd: 20, desc: 'สังหารเป้าหมายที่บาดเจ็บอย่างเด็ดขาด' },
    blast: { nameTh: 'ท่าระเบิดปราณ', icon: '🔮', e: 1.25, cd: 14, wind: 5, hits: 1, cost: 1.3, off: true, aoe: true, desc: 'ปลดปล่อยคลื่นปราณระเบิดทำลายล้าง' },
    shield: { nameTh: 'ท่าเกราะคุ้มกาย', icon: '🔰', e: 0, cd: 20, wind: 3, hits: 0, cost: 1.0, self: true, desc: 'สร้างม่านปราณดูดซับความเสียหายและเพิ่มป้องกัน' },
    buff: { nameTh: 'ท่าเร่งปราณหนุนศึก', icon: '✨', e: 0, cd: 22, wind: 4, hits: 0, cost: 1.15, team: true, desc: 'เสริมพลังรบและความเร็วแก่ตนเองและพวกพ้อง' },
    command: { nameTh: 'ท่าบัญชาพยุหะ', icon: '🚩', e: 1.28, cd: 18, wind: 4, hits: 1, cost: 1.25, off: true, team: true, penAdd: 18, desc: 'ออกโองการค่ายกลหนุนโล่และบัฟแก่พวกพ้อง พร้อมสั่งประสานโจมตีศัตรู' },
    harmonize: { nameTh: 'ท่าประสานชีพจรชุบชีวา', icon: '🪷', e: 1.22, cd: 16, wind: 4, hits: 1, cost: 1.25, off: true, team: true, desc: 'ส่งคลื่นปราณโอสถ/คีตเวทย์โจมตีจุดชีพจรศัตรู พร้อมฟื้นฟูเลือด ล้างพิษ และมอบบัฟแก่พวกพ้อง' },
    blink: { nameTh: 'ท่าก้าวพริบตาข้ามมิติ', icon: '🌌', e: 1.32, cd: 18, wind: 2, hits: 2, cost: 1.15, off: true, self: true, penAdd: 25, desc: 'พับย่นระยะทางเข้าประชิดหรือฉากหลบในพริบตา โจมตีไร้ทางหลบและสร้างเงาดาราหลบสวนกลับ' },
    karmaReversal: { nameTh: 'ท่าพลิกผันกงล้อกรรม', icon: '☸️', e: 1.65, cd: 24, wind: 5, hits: 1, cost: 1.5, off: true, recoil: 0.08, penAdd: 28, desc: 'แปรเปลี่ยนสถานะผิดปกติบนร่างให้เป็นบัฟคุ้มกาย และสะท้อนหนี้กรรมสังหารศัตรู' },
    wave: { nameTh: 'ท่าคลื่นปราณกวาดซัด', icon: '🌊', e: 1.18, cd: 12, wind: 4, hits: 2, cost: 1.2, off: true, aoe: true, desc: 'แผ่คลื่นเสียงหรือปราณซัดกระหน่ำศัตรูเป็นวงกว้างหลายระลอก' },
    soul: { nameTh: 'ท่าสั่นคลอนดวงจิต', icon: '👁️', e: 1.32, cd: 13, wind: 4, hits: 1, cost: 1.25, off: true, penAdd: 25, desc: 'โจมตีเข้าสู่ทะเลสำนึกและดวงจิตโดยตรง ทะลวงเกราะกายภาพและบั่นทอนสมาธิ' },
    slash: { nameTh: 'ท่าฟันสะบั้นคม', icon: '⚔️', e: 1.26, cd: 10, wind: 4, hits: 2, cost: 1.05, off: true, penAdd: 15, desc: 'ตวัดคมศาสตราฟาดฟันฉับไวสองจังหวะ เปิดบาดแผลฉีกขาดรุนแรง' },
    markPrimer: { nameTh: 'ท่าประทับตราตั้งต้น', icon: '🎯', e: 1.16, cd: 9, wind: 3, hits: 1, cost: 0.95, off: true, desc: 'ฝังตราประทับมรรคา/เมล็ดพิษ/อักขระดาราลงบนเป้าหมายสะสมสูงสุด 5 ชั้น เพื่อรอการจุดระเบิด' },
    markDetonate: { nameTh: 'ท่าระเบิดตราประทับ', icon: '💥', e: 1.44, cd: 15, wind: 4, hits: 1, cost: 1.35, off: true, penAdd: 20, desc: 'จุดระเบิดตราประทับและแผลต่อเนื่องบนเป้าหมาย สร้างความเสียหายทวีคูณตามจำนวนชั้นและคืนปราณ' },
    chainRicochet: { nameTh: 'ท่าชิ่งสะท้อนหลายเป้า', icon: '⚡', e: 1.22, cd: 12, wind: 4, hits: 3, cost: 1.2, off: true, aoe: true, desc: 'ส่งปราณหรืออาวุธชิ่งสะท้อนระหว่างศัตรูหลายเป้าหมายต่อเนื่อง ยิ่งเป้าหมายติดสถานะยิ่งแรงขึ้น' },
    stanceShift: { nameTh: 'ท่าเปลี่ยนท่าร่างสลับขั้ว', icon: '☯️', e: 1.14, cd: 11, wind: 2, hits: 1, cost: 0.85, off: true, self: true, desc: 'สลับท่าร่างยุทธ์เข้าสู่สภาวะสืบเนื่อง เสริมพลังกระบวนท่าถัดไปและลดการใช้ปราณ' },
    tetherLink: { nameTh: 'ท่าผูกสายใยเชื่อมชะตา', icon: '🔗', e: 1.18, cd: 16, wind: 4, hits: 1, cost: 1.25, off: true, team: true, desc: 'ผูกสายใยปราณคุ้มกันพวกพ้องเพื่อแบ่งรับความเสียหาย หรือล่ามโซ่ชะตาพ่วงความเสียหายระหว่างศัตรู' },
    elementalFusion: { nameTh: 'ท่าประสานปฏิกิริยาธาตุ', icon: '🌈', e: 1.38, cd: 15, wind: 5, hits: 1, cost: 1.35, off: true, aoe: true, penAdd: 18, desc: 'กระตุ้นปฏิกิริยาธาตุซ้อนทับกับสถานะบนตัวเป้าหมาย ก่อเกิดระเบิดธาตุผสานรุนแรง' },
    statusTransmute: { nameTh: 'ท่าแปรสภาพสถานะ', icon: '🔄', e: 1.24, cd: 16, wind: 4, hits: 1, cost: 1.25, off: true, desc: 'ช่วงชิงบัฟศัตรู ยืดเวลาสถานะผิดปกติ หรือดูดซับพิษและบาดแผลแปรเปลี่ยนเป็นโล่ปราณ' },
    sacrificeOverdrive: { nameTh: 'ท่าเผาผลาญแลกพลัง', icon: '🩸', e: 1.68, cd: 22, wind: 5, hits: 1, cost: 1.4, off: true, recoil: 0.06, penAdd: 30, desc: 'แลกเปลี่ยนพลังชีวิต ปราณสำรอง หรือพิษโอสถในกายเพื่อปลดปล่อยอานุภาพทะลวงขีดจำกัด' }
  };
  /* ธาตุ → ผลแทรก (rider) ถ้าท่านั้นเป็นท่าโจมตี โอกาส 38% และผลหลักของท่าควบคุม */
  SK.ELEM = {
    FIRE: { nameTh: 'เพลิง', st: 'burn', ctrl: 'burn' },
    WATER_ICE: { nameTh: 'น้ำแข็ง', st: 'slow', ctrl: 'slow' },
    LIGHTNING: { nameTh: 'อสนี', st: 'critUp', ctrl: 'stun' },
    EARTH_METAL: { nameTh: 'ดินโลหะ', st: 'armorbreak', ctrl: 'stun' },
    WOOD_LIFE: { nameTh: 'พฤกษา', st: 'leech', ctrl: 'slow' },
    WIND: { nameTh: 'วายุ', st: 'haste', ctrl: 'slow' },
    ASTRAL: { nameTh: 'ดารา', st: 'mdefbreak', ctrl: 'silence' },
    YIN_SHADOW: { nameTh: 'หยินเงา', st: 'weaken', ctrl: 'weaken' },
    LIGHT_YANG: { nameTh: 'หยางแสง', st: 'blind', ctrl: 'blind' },
    BLOOD_DEMON: { nameTh: 'โลหิตมาร', st: 'bleed', ctrl: 'bleed' },
    NEUTRAL: { nameTh: 'ไร้ธาตุ', st: null, ctrl: 'stun' }
  };
  SK.STATUS = {
    burn: { nameTh: 'เผาไหม้', icon: '🔥', dot: true }, bleed: { nameTh: 'เลือดไหล', icon: '🩸', dot: true }, poison: { nameTh: 'พิษ', icon: '☠️', dot: true },
    slow: { nameTh: 'ชะงัก', icon: '🐌', mods: { cast: -30, move: -30 }, pmods: { eva: -.1 } }, stun: { nameTh: 'มึนงง', icon: '💫' }, silence: { nameTh: 'ผนึกวิชา', icon: '🤐' },
    weaken: { nameTh: 'อ่อนแรง', icon: '⬇️', pmods: { atk: -.2, matk: -.2 } }, blind: { nameTh: 'ตาพร่า', icon: '🌫️', pmods: { acc: -.3 } },
    armorbreak: { nameTh: 'เกราะแตก', icon: '🧩', pmods: { def: -.15, mdef: -.05 } }, mdefbreak: { nameTh: 'ม่านวิชาแตก', icon: '🔮', pmods: { mdef: -.2 } },
    critUp: { nameTh: 'อสนีสะสม', icon: '⚡', mods: { crit: 10 } }, haste: { nameTh: 'ลมหนุน', icon: '🍃', mods: { cast: 15, move: 10 } }, leech: { nameTh: 'พฤกษาเกาะ', icon: '🌿' },
    guardUp: { nameTh: 'ตั้งรับ', icon: '🛡️', pmods: { def: .4, mdef: .25 } }, evadeUp: { nameTh: 'เงาพลิ้ว', icon: '💨', pmods: { eva: .5 }, mods: { move: 20 } },
    counter: { nameTh: 'ตั้งท่าสวนกลับ', icon: '↩️' }, shield: { nameTh: 'โล่พลัง', icon: '🔰' }, exposed: { nameTh: 'เปิดเกราะ', icon: '💢', pmods: { def: -.25, mdef: -.25 } }, morale: { nameTh: 'ขวัญกำลังใจ', icon: '🚩', pmods: { atk: .15, matk: .15 } }, holyAura: { nameTh: 'รัศมีคุ้มกาย', icon: '✨', pmods: { def: .2, mdef: .2 } }, channeling: { nameTh: 'กำลังร่ายต่อเนื่อง', icon: '🌀' },
    vitalRegen: { nameTh: 'ปราณน้ำค้างฟื้นฟู', icon: '🌿', hot: true, isBuff: true, pmods: { hp: .10, def: .06 } },
    fervorMight: { nameTh: 'โลหิตศึกฮึกเหิม', icon: '🔥', isBuff: true, pmods: { atk: .16, matk: .16 }, mods: { crit: 8, critDmg: 22, pen: 10 } },
    aegisWard: { nameTh: 'ปราการฉีเหมินคุ้มกาย', icon: '🛡️', isBuff: true, pmods: { def: .22, mdef: .22, hp: .08 } },
    swiftWind: { nameTh: 'วายุพิณทะยานฟ้า', icon: '🍃', isBuff: true, pmods: { eva: .18 }, mods: { move: 18, cast: 14, acc: 10 } },
    qiConduit: { nameTh: 'ชีพจรปราณหมุนเวียน', icon: '💠', isBuff: true, pmods: { matk: .14, mdef: .12 }, mods: { cast: 18 } },
    clarityLotus: { nameTh: 'บัวทิพย์กระจ่างใจ', icon: '🪷', isBuff: true, pmods: { mdef: .16, acc: .12 }, mods: { crit: 6 } },
    meridianUnblock: { nameTh: 'เข็มทองเปิดชีพจรยุทธ์', icon: '🪡', isBuff: true, pmods: { atk: .12, matk: .12, def: .12, mdef: .12 }, mods: { cast: 12, move: 10, pen: 8 } },
    nirvanaGrace: { nameTh: 'โคมวิญญาณคุ้มชีพ', icon: '🏮', isBuff: true, pmods: { def: .14, mdef: .14, hp: .12 } },
    tacticalCommand: { nameTh: 'โองการพยุหะ', icon: '🚩', isBuff: true, pmods: { atk: .18, matk: .18, def: .18, mdef: .18 }, mods: { acc: 14, pen: 12 } },
    astralMirage: { nameTh: 'เงาดาราซ้อนมิติ', icon: '🌌', isBuff: true, pmods: { eva: .35 }, mods: { move: 24, cast: 16, crit: 10 } },
    karmicAegis: { nameTh: 'วัฏจักรสะท้อนกรรม', icon: '☸️', isBuff: true, pmods: { def: .20, mdef: .20, matk: .12 }, mods: { pen: 12 } },
    mentorGuidance: { nameTh: 'คำชี้แนะอาจารย์สายตรง', icon: '📜', isBuff: true, pmods: { atk: .10, matk: .10, def: .10, mdef: .10 }, mods: { acc: 10, cast: 10 } },
    chill: { nameTh: 'หนาวเหน็บเยือกแข็ง', icon: '❄️', mods: { cast: -20, move: -25 }, pmods: { eva: -.12 } },
    fear: { nameTh: 'ขวัญผวาเสียสติ', icon: '😱', pmods: { atk: -.18, matk: -.18, def: -.12 }, mods: { acc: -15 } },
    paralyze: { nameTh: 'อัมพาตสายฟ้า', icon: '⚡', mods: { cast: -45, move: -40 }, pmods: { eva: -.25 } },
    root: { nameTh: 'ตรึงรากพันธนาการ', icon: '🌿', mods: { move: -80 }, pmods: { eva: -.35 } },
    curse: { nameTh: 'คำสาปสังสารวัฏ', icon: '💀', dot: true, pmods: { def: -.15, mdef: -.18 } },
    daoMark: { nameTh: 'ตราประทับมรรคา', icon: '🎯', isMark: true, maxStacks: 5, pmods: { def: -.06, mdef: -.06 } },
    starSeal: { nameTh: 'ตราผนึกดารา', icon: '🌟', isMark: true, maxStacks: 5, mods: { acc: -8, cast: -8 } },
    venomSeed: { nameTh: 'เมล็ดพิษกู่ฝังใน', icon: '🪲', dot: true, isMark: true, maxStacks: 5, pmods: { def: -.08 } },
    bloodBrand: { nameTh: 'ตราโลหิตสังเวย', icon: '🩸', isMark: true, maxStacks: 5, pmods: { def: -.08, mdef: -.08 } },
    tetheredEnemy: { nameTh: 'โซ่ชะตาพ่วงศัตรู', icon: '🔗', isTether: true, pmods: { eva: -.10 } },
    soulLinkGuard: { nameTh: 'สายใยร่วมเป็นร่วมตาย', icon: '🤝', isBuff: true, isTether: true, pmods: { def: .15, mdef: .15 } },
    comboReady: { nameTh: 'ตั้งท่าสืบเนื่อง', icon: '⚔️', isBuff: true, pmods: { atk: .14, matk: .14 }, mods: { crit: 10, cast: 12 } },
    elementalOvercharge: { nameTh: 'ปราณธาตุปะทุ', icon: '🌈', isBuff: true, pmods: { matk: .20, atk: .14 }, mods: { pen: 15, crit: 6 } },
    qiBarrierShell: { nameTh: 'เกราะปราณกลั่นตัว', icon: '🫧', isBuff: true, pmods: { def: .18, mdef: .22 } },
    toxinOverdrive: { nameTh: 'พิษโอสถคลั่งพลัง', icon: '🧪', isBuff: true, pmods: { atk: .22, matk: .22, def: -.08 }, mods: { pen: 15, critDmg: 20 } },
    bloodFrenzy: { nameTh: 'โลหิตคลั่งสังหาร', icon: '🩸', isBuff: true, pmods: { atk: .18, matk: .14, def: -.06 }, mods: { crit: 8, critDmg: 20 } },
    shadowVeil: { nameTh: 'ม่านเงาเร้นกาย', icon: '🌑', isBuff: true, pmods: { eva: .26, atk: .10 }, mods: { move: 16, crit: 8 } },
    frostBarrier: { nameTh: 'ปราการน้ำแข็งอุดร', icon: '🧊', isBuff: true, pmods: { def: .24, mdef: .20 }, mods: { cast: 6 } },
    thunderStep: { nameTh: 'ย่างก้าวอัสนีพริบตา', icon: '⚡', isBuff: true, pmods: { eva: .20, atk: .12 }, mods: { move: 22, cast: 16, crit: 6 } },
    windStride: { nameTh: 'เหินวายุไร้รอย', icon: '🌪️', isBuff: true, pmods: { eva: .22 }, mods: { move: 20, cast: 14, acc: 10 } },
    solarWard: { nameTh: 'ม่านเพลิงสุริยัน', icon: '☀️', isBuff: true, pmods: { def: .18, mdef: .18, atk: .12 }, mods: { pen: 8 } },
    starlightAegis: { nameTh: 'เกราะแสงดาราพิทักษ์', icon: '✨', isBuff: true, pmods: { mdef: .24, def: .16 }, mods: { acc: 14, cast: 10 } },
    puppetOverclock: { nameTh: 'กลไกเร่งพิกัดสูงสุด', icon: '⚙️', isBuff: true, pmods: { atk: .18, matk: .18, def: .12 }, mods: { cast: 16, pen: 12 } },
    beastPackFury: { nameTh: 'สัญชาตญาณฝูงอสูรคลั่ง', icon: '🐾', isBuff: true, pmods: { atk: .20, hp: .12 }, mods: { move: 16, crit: 8, pen: 10 } },
    artisanFocus: { nameTh: 'สมาธิเตาหลอมเทวะ', icon: '🔨', isBuff: true, pmods: { atk: .14, matk: .16, def: .14, mdef: .14 }, mods: { acc: 12, pen: 10 } },
    alchemicalHarmony: { nameTh: 'ปราณโอสถประสานชีพจร', icon: '⚗️', hot: true, isBuff: true, pmods: { hp: .14, mdef: .16 }, mods: { cast: 12 } },
    voidPhase: { nameTh: 'เร้นมิติสุญตา', icon: '🌀', isBuff: true, pmods: { eva: .30, matk: .14 }, mods: { move: 18, pen: 14 } },
    taunt: { nameTh: 'ยั่วยุดึงความสนใจ', icon: '🤬', tags: ['#CONTROL'] },
    grounded: { nameTh: 'ตรึงปฐพีห้ามเหิน', icon: '🪨', mods: { move: -60 }, pmods: { eva: -.30 }, tags: ['#CONTROL', '#EARTH'] },
    hemorrhage: { nameTh: 'แผลฉีกขาดเลือดทะลัก', icon: '🩸', dot: true, pmods: { def: -.12 }, tags: ['#BLOOD', '#PHYSICAL'] },
    sporeBloom: { nameTh: 'ดอกสปอร์พิษกลืนชีพ', icon: '🍄', dot: true, pmods: { mdef: -.10 }, tags: ['#WOOD', '#POISON'] },
    bloodfrostShard: { nameTh: 'ผลึกโลหิตเยือกแข็ง', icon: '🧊', dot: true, mods: { cast: -20, move: -20 }, tags: ['#ICE', '#BLOOD'] },
    healBlock: { nameTh: 'เพลิงพิษผนึกการรักษา', icon: '🚫', pmods: { mdef: -.15 }, tags: ['#FIRE', '#POISON', '#SEAL'] },
    poiseBroken: { nameTh: 'ท่าร่างพังทลาย', icon: '💥', pmods: { def: -.30, mdef: -.30, eva: -.40 }, tags: ['#CONTROL', '#PHYSICAL'] },
    soulFractured: { nameTh: 'วิญญาณสะเทือนไร้สมาธิ', icon: '⚡', mods: { cast: -35, acc: -25 }, pmods: { mdef: -.20 }, tags: ['#LIGHTNING', '#SEAL'] },
    cryoStasis: { nameTh: 'เวลาหยุดนิ่งเยือกแข็งสัมบูรณ์', icon: '❄️', mods: { move: -100, cast: -100 }, pmods: { eva: -1.0 }, tags: ['#ICE', '#CONTROL'] },
    manaBurnBacklash: { nameTh: 'คำสาปสะท้อนปราณอเวจี', icon: '🔥', dot: true, pmods: { mdef: -.15 }, tags: ['#YIN', '#DEMON'] },
    acupointSealed: { nameTh: 'สกัดจุดผนึกปราณ', icon: '🪡', mods: { cast: -45 }, tags: ['#ACUPOINT', '#SEAL'] },
    QI_BLOCK: { nameTh: 'สกัดจุดปิดกั้นปราณ', icon: '🪡', mods: { cast: -50 }, tags: ['#ACUPOINT', '#SEAL'] },
    BLOOD_HALT: { nameTh: 'สกัดจุดชะลอโลหิต', icon: '🩸', mods: { move: -35, cast: -20 }, pmods: { eva: -.20 }, tags: ['#ACUPOINT', '#BLOOD'] },
    acupointQiBlock: { nameTh: 'สกัดจุดลมปราณ', icon: '🪡', mods: { cast: -40 }, tags: ['#ACUPOINT', '#SEAL'] },
    acupointWeaken: { nameTh: 'สกัดจุดสลายพละกำลัง', icon: '🪡', pmods: { atk: -.40, matk: -.40 }, tags: ['#ACUPOINT'] },
    acupointBleed: { nameTh: 'สกัดจุดหยุดชีพจร', icon: '🪡', dot: true, pmods: { def: -.15 }, tags: ['#ACUPOINT', '#BLOOD'] },
    meridianRupture: { nameTh: 'ชีพจรฉีกขาดหลังระเบิดปราณ', icon: '💔', pmods: { atk: -.20, matk: -.20, def: -.15 }, mods: { cast: -20, move: -20 }, tags: ['#ACUPOINT'] },
    cryoMirror: { nameTh: 'กระจกหิมะสะท้อนหมื่นลี้', icon: '🪞', isBuff: true, pmods: { mdef: .25, def: .20 }, tags: ['#ICE', '#METAL', '#SHIELD'] },
    phoenixCovenant: { nameTh: 'พันธะสุริยันอมตะคืนชีพ', icon: '🐦‍🔥', isBuff: true, pmods: { atk: .15, matk: .15, hp: .12 }, tags: ['#FIRE', '#YANG', '#SAMSARA'] },
    asuraBloodFrenzy: { nameTh: 'โลหิตมารคลั่งชีพ', icon: '👹', isBuff: true, pmods: { atk: .50, matk: .50, def: -.10 }, mods: { crit: 12, critDmg: 25 }, tags: ['#BLOOD', '#DEMON'] },
    meridianOverdrive: { nameTh: 'ระเบิดชีพจรทะลวงขีดจำกัด', icon: '⚡', isBuff: true, pmods: { atk: 1.0, matk: 1.0 }, mods: { move: 100, cast: 100, crit: 20 }, tags: ['#ACUPOINT'] },
    finalStandImmortal: { nameTh: 'ปราการอมตะเฮือกสุดท้าย', icon: '🛡️', isBuff: true, pmods: { def: .80, mdef: .80 }, tags: ['#SHIELD'] },
    totemBlessing: { nameTh: 'พรเสาโทเทมบรรพชน', icon: '🗿', isBuff: true, pmods: { atk: .12, matk: .12, def: .12, mdef: .12 }, mods: { acc: 10, cast: 10 }, tags: ['#ASTRAL'] },
    beastSpiritPossessed: { nameTh: 'สถิตร่างรวมวิญญาณอสูร', icon: '🐉', isBuff: true, pmods: { atk: .24, matk: .20, def: .22, mdef: .20 }, mods: { move: 28, crit: 10, pen: 12 }, tags: ['#SUMMON'] },
    massGuard: { nameTh: 'มวลเกราะดูดซับแรง', icon: '🪐', isBuff: true, pmods: { def: .24, mdef: .18, hp: .10 }, tags: ['#EARTH', '#SHIELD'] },
    sonicHarmonyAura: { nameTh: 'รัศมีคีตาประสาน', icon: '🎵', isBuff: true, pmods: { matk: .16, eva: .12 }, mods: { cast: 18, move: 14, acc: 10 }, tags: ['#SOUND', '#WIND'] },
    bodhiGrace: { nameTh: 'รัศมีโพธิญาณคุ้มกาย', icon: '🪷', isBuff: true, pmods: { def: .22, mdef: .24, hp: .12 }, mods: { cast: 10 }, tags: ['#YANG', '#SHIELD'] },
    starDestinyWard: { nameTh: 'ม่านลิขิตดาราพิทักษ์', icon: '🔭', isBuff: true, pmods: { matk: .18, mdef: .20, eva: .16 }, mods: { crit: 10, acc: 14 }, tags: ['#ASTRAL', '#SHIELD'] },
    weatherConduct: { nameTh: 'ปราณเทวอากาศหนุนนำ', icon: '⛈️', isBuff: true, pmods: { matk: .20, atk: .12, eva: .14 }, mods: { cast: 16, pen: 12 }, tags: ['#LIGHTNING', '#WIND'] },
    leylineBastion: { nameTh: 'ปราการชีพจรมังกรธรณี', icon: '⛰️', isBuff: true, pmods: { def: .28, mdef: .22, hp: .14 }, tags: ['#EARTH', '#SHIELD'] },
    atavismFrenzy: { nameTh: 'สายเลือดบรรพกาลคลั่ง', icon: '🐉', isBuff: true, pmods: { atk: .26, def: .14, hp: .12 }, mods: { crit: 12, critDmg: 22, pen: 14 }, tags: ['#BLOOD', '#PHYSICAL'] },
    temporalHaste: { nameTh: 'กระแสเวลาเร่งพิกัด', icon: '⏳', isBuff: true, pmods: { matk: .16, eva: .18 }, mods: { cast: 24, move: 22, crit: 8 }, tags: ['#ASTRAL'] },
    literatiDecree: { nameTh: 'โองการอักษรสวรรค์', icon: '🖌️', isBuff: true, pmods: { matk: .20, mdef: .18, acc: .15 }, mods: { pen: 14, cast: 14 }, tags: ['#YANG', '#SEAL'] },
    marionetteLink: { nameTh: 'เส้นไหมเชิดเงาเชื่อมจิต', icon: '🧵', isBuff: true, isTether: true, pmods: { atk: .16, matk: .16, eva: .20 }, mods: { acc: 14, crit: 10 }, tags: ['#YIN', '#CONTROL'] },
    chaosEntropyShield: { nameTh: 'ม่านหุ่นตุ้นกลืนสรรพธาตุ', icon: '🌌', isBuff: true, pmods: { atk: .18, matk: .18, def: .18, mdef: .18 }, mods: { pen: 16 }, tags: ['#ASTRAL', '#SHIELD'] },
    meridianSeal: { nameTh: 'เข็มพิษผนึกจุดชีพจร', icon: '🪡', mods: { cast: -35, move: -20 }, pmods: { atk: -.15, matk: -.15 }, tags: ['#ACUPOINT', '#SEAL'] },
    tempoBreak: { nameTh: 'คลื่นเสียงสลายจังหวะ', icon: '🎵', mods: { cast: -30, acc: -14 }, pmods: { eva: -.16 }, tags: ['#SOUND', '#CONTROL'] },
    guLeech: { nameTh: 'คำสาปหนอนกู่สูบวิญญาณ', icon: '🦂', dot: true, pmods: { def: -.14, mdef: -.14 }, tags: ['#POISON', '#WOOD'] },
    gravityCrush: { nameTh: 'แรงกดทับหมื่นชั่ง', icon: '🪐', mods: { move: -45, cast: -20 }, pmods: { eva: -.25, def: -.12 }, tags: ['#EARTH', '#CONTROL'] },
    contractDefault: { nameTh: 'ผิดนัดพันธสัญญาสวรรค์', icon: '⚖️', pmods: { def: -.20, mdef: -.20, atk: -.12 }, tags: ['#SEAL'] },
    voidRiftTear: { nameTh: 'แผลฉีกรอยแยกมิติ', icon: '🌀', dot: true, pmods: { def: -.22, mdef: -.22 }, tags: ['#ASTRAL'] },
    entropyDecay: { nameTh: 'ปราณโกลาหลกัดกร่อนธาตุ', icon: '🌌', dot: true, pmods: { def: -.18, mdef: -.24 }, tags: ['#ASTRAL'] },
    divineResonance: { nameTh: 'การสั่นพ้องเทวะ', icon: '🏛️', isBuff: true, pmods: { atk: .18, matk: .18, def: .12, mdef: .15 }, fmods: { pen: 30 }, tags: ['#BUFF'] },
    shadowClone: { nameTh: 'ร่างแยกเงามายา', icon: '👥', isBuff: true, pmods: { eva: .22 }, fmods: { crit: 12 }, tags: ['#BUFF'] },
    substitutionReady: { nameTh: 'สลับร่างท่อนไม้', icon: '🪵', isBuff: true, pmods: { eva: .16, def: .12 }, tags: ['#BUFF'] },
    vowBacklash: { nameTh: 'ของเข้าตัว·ผิดสัจจะ', icon: '💔', pmods: { def: -.35, mdef: -.30 }, tags: ['#SEAL'] },
    boneArmor: { nameTh: 'เกราะกระดูกวิญญาณ', icon: '🦴', isBuff: true, shield: true, pmods: { def: .25, mdef: .14 }, tags: ['#SHIELD', '#BUFF'] },
    parryCounter: { nameTh: 'ปัดป้องสะท้อนคม', icon: '⚔️', isBuff: true, pmods: { atk: .16, def: .18 }, fmods: { crit: 18, pen: 16 }, tags: ['#BUFF'] },
    sanityStrain: { nameTh: 'จิตใจปั่นป่วนนอกมิติ', icon: '👁️‍🗨️', isBuff: true, pmods: { matk: .36, def: -.12 }, fmods: { pen: 24, crit: 14 }, tags: ['#BUFF'] },
    taunted: { nameTh: 'ถูกยั่วยุ', icon: '💢', tags: ['#CONTROL'] },
    ashenToxin: { nameTh: 'พิษเถ้าถ่านผลาญชีพ', icon: '⚱️', dot: true, pmods: { mdef: -.12 }, tags: ['#FIRE', '#POISON'] },
    radiationBurn: { nameTh: 'เพลิงสุริยะแผดเผา', icon: '☀️', dot: true, pmods: { hp: -.10, mdef: -.15 }, tags: ['#FIRE', '#ASTRAL'] },
    crimsonGuSwarm: { nameTh: 'ฝูงกู่โลหิตกลืนกิน', icon: '🪲', dot: true, pmods: { def: -.12, mdef: -.12 }, tags: ['#BLOOD', '#POISON'] },
    sovereignPlague: { nameTh: 'โรคระบาดราชันย์หมื่นพิษ', icon: '☣️', dot: true, pmods: { def: -.18, mdef: -.18, atk: -.12 }, tags: ['#POISON', '#YIN'] },
    stygianFreeze: { nameTh: 'ไอเย็นยมโลกสะกดวิญญาณ', icon: '🧊', mods: { cast: -35, move: -35 }, pmods: { eva: -.25 }, tags: ['#ICE', '#YIN', '#SEAL'] },
    weaponMelt: { nameTh: 'ศาสตราหลอมละลาย', icon: '🫠', pmods: { atk: -.25, def: -.25 }, tags: ['#FIRE', '#METAL'] },
    disarmed: { nameTh: 'ปลดศาสตรา', icon: '⚔️', pmods: { atk: -.25 }, mods: { acc: -15 }, tags: ['#CONTROL', '#METAL'] },
    sporeSeed: { nameTh: 'เมล็ดกาฝากดูดปราณ', icon: '🍄', dot: true, isMark: true, maxStacks: 5, pmods: { mdef: -.10 }, tags: ['#WOOD', '#POISON'] },
    delayedEcho: { nameTh: 'คลื่นสะท้อนเงาอดีต', icon: '⏳', tags: ['#ASTRAL'] }
  };
  const SUBW = {
    SWORD_IMMORTAL: { strike: 3, pierce: 3, flurry: 2, burst: 1.5, dot: .5 },
    FIVE_ELEMENTS: { sweep: 3, dot: 2, strike: 2, control: 1.2, burst: 1 },
    ELIXIR_DAO: { heal: 2.5, support: 2, drain: 2.5, dot: 2.5, guard: 1.2, strike: 1 },
    ASTRAL_ARRAY: { channel: 3, control: 2.5, sweep: 2, guard: 2, support: 1.5, pierce: 1 },
    BLOOD_DEMON: { dot: 3, drain: 3, burst: 2, flurry: 1.2, strike: 1 },
    PHANTOM_SOUL: { summon: 2.5, counter: 2.5, flurry: 2, control: 2, drain: 1.5, strike: 1 },
    TIME_VOID: { channel: 3, control: 2.5, evade: 2, burst: 1.5, strike: 1 },
    SOUND_ZITHER: { channel: 3, support: 2.5, control: 2, sweep: 2, strike: 1 },
    YIN_YANG_HARMONY: { counter: 2.5, guard: 2, heal: 2, strike: 1.5, control: 1 },
    TIGER_SOVEREIGN: { flurry: 3, strike: 2, burst: 2, sweep: 1 },
    BLOOD_DRAGON: { strike: 2, sweep: 2, dot: 2, burst: 1.5, drain: 1 },
    VAJRA_BODHI: { guard: 3, counter: 3, strike: 1.2, control: .8 },
    DEVOURING_FIEND: { drain: 3, strike: 2, burst: 2, dot: 1 },
    SOLAR_FORGE: { pierce: 3, strike: 2, burst: 2, sweep: 1 },
    THUNDER_BODY: { burst: 2.5, pierce: 2.5, flurry: 2, strike: 2 },
    JADE_IMMORTAL_BODY: { guard: 3, heal: 2, strike: 1.5, control: 1 },
    TITAN_MOUNTAIN_BODY: { guard: 3.5, strike: 2, sweep: 2, control: 1 },
    WAR_DEITY: { support: 3.5, sweep: 2.5, strike: 2, guard: 1.5, control: 1 },
    MERCY_DEITY: { heal: 3.5, support: 2.5, guard: 2, control: 1, strike: 1 },
    FATE_ORACLE: { counter: 3, control: 2, pierce: 2, channel: 2, strike: 1 },
    TOTEM_BEAST_GOD: { summon: 3.5, flurry: 2.5, sweep: 2, strike: 2, burst: 1 },
    UNDERWORLD_JUDGE: { pierce: 2.5, control: 2.5, strike: 2, channel: 2 },
    OCEAN_SOVEREIGN: { sweep: 3, channel: 2.5, guard: 2, strike: 1.5 },
    HARVEST_EARTH_GOD: { support: 3, heal: 2.5, guard: 2, strike: 1 },
    FROST_MOON_IMMORTAL: { counter: 3.5, control: 2.5, strike: 1.5, guard: 1.5, pierce: 1 },
    WOOD_SPRING_BODY: { guard: 3, heal: 2.5, dot: 1.5, strike: 1.5, drain: 1 },
    MEDICINE_BODHI_GOD: { heal: 3.5, support: 3, guard: 2, control: 1, strike: 0.8 },
    SHADOW_ASSASSIN: { strike: 3.5, pierce: 2.5, flurry: 2.5, evade: 2, burst: 1.5 },
    VENOM_GU_SOVEREIGN: { dot: 3.5, control: 2.5, drain: 2, sweep: 1.5, strike: 1 },
    NETHER_GHOST_KING: { summon: 3, control: 2.5, drain: 2.5, channel: 2, strike: 1 },
    HEAVEN_DEVOURING_DEMON: { drain: 3.5, burst: 2.5, sweep: 2, pierce: 1.5, strike: 1.5 },
    ZEN_VOID_MIND: { counter: 3.5, guard: 3, heal: 2, support: 2, control: 1.5 },
    CALLIGRAPHY_PAINTING_SAGE: { channel: 3, control: 2.5, support: 2.5, sweep: 2, strike: 1 },
    DREAM_ILLUSION_WEAVER: { control: 3.5, summon: 2.5, channel: 2.5, evade: 2, strike: 1 },
    MIND_SWORD_TELEKINESIS: { pierce: 3.5, flurry: 3, strike: 2.5, channel: 2, burst: 1.5 },
    STAR_ARCHER: { snipe: 3.5, barrage: 3, pierce: 2.5, strike: 2 },
    SHADOW_ARCHER: { snipe: 3.5, dot: 3, evade: 2.5, pierce: 2 },
    STAFF_GUARD: { guard: 3.5, sweep: 3, counter: 2.5, control: 2 },
    CLOUD_DRAGON_SPEAR: {"pierce":3.5,"sweep":2.5,"flurry":2,"charge":2,"strike":1.5},
    PURE_SWORD_SAINT: {"pierce":3,"flurry":3,"strike":2.5,"counter":2,"execute":1.5},
    WAR_SPEAR_SOVEREIGN: {"pierce":3.5,"sweep":2.5,"charge":2.5,"strike":2,"guard":1.5},
    IRON_BOW_SENTINEL: {"snipe":3.5,"pierce":3,"barrage":2.5,"strike":2,"guard":1},
    OVERLORD_HEAVY_BLADE: {"strike":3.5,"sweep":3,"execute":2.5,"burst":2,"pierce":1.5},
    SUN_BOW_DEITY: {"snipe":3.5,"pierce":3,"barrage":2.5,"support":2,"burst":1.5},
    GOLDEN_ARHAT_STAFF: {"sweep":3,"guard":3,"counter":2.5,"support":2,"strike":2},
    BLOOD_SPEAR_ASURA: {"pierce":3.5,"drain":3,"charge":2.5,"sweep":2,"burst":2},
    ASHURA_SLAUGHTER_BLADE: {"execute":3.5,"flurry":3,"strike":2.5,"pierce":2,"evade":1.5},
    ZITHER_HEART_BOW: {"snipe":3,"control":3,"channel":2.5,"barrage":2,"support":1.5},
    HEART_BLADE_MEDITATION: {"execute":3.5,"snipe":3,"pierce":2.5,"strike":2,"counter":1.5},
    VOID_SPEAR_MIND: {"pierce":3.5,"channel":2.5,"control":2.5,"sweep":2,"counter":1.5},
    IRON_COLOSSUS: {"guard":3.5,"strike":3,"sweep":2.5,"counter":2,"pierce":1.5},
    THOUSAND_THREAD_PUPPETEER: {"control":3.5,"flurry":3,"summon":2.5,"channel":2,"pierce":1.5},
    SPIRIT_ARTILLERY_ENGINEER: {"snipe":3.5,"barrage":3.5,"blast":2.5,"pierce":2},
    CLOCKWORK_SWARM_WEAVER: {"barrage":3.5,"flurry":3,"dot":2.5,"summon":2,"sweep":1.5},
    SOUL_VESSEL_AVATAR: {"summon":3.5,"guard":3,"counter":2.5,"strike":2,"channel":1.5},
    FORTRESS_BASTION_ARCHITECT: {"shield":3.5,"guard":3,"support":2.5,"blast":2,"control":1.5},
    ASTRAL_CLOCKWORK_PRIME: {"channel":3.5,"blast":3,"control":2.5,"support":2,"snipe":1.5},
    RED_THREAD_ARBITER: {"control":3.5,"counter":3,"pierce":2.5,"channel":2,"strike":1.5},
    SIX_PATHS_WHEEL: {"channel":3.5,"blast":3,"control":2.5,"counter":2,"sweep":1.5},
    ASURA_JUDGMENT_BLADE: {"execute":3.5,"strike":3,"burst":2.5,"pierce":2,"counter":1.5},
    LOTUS_MERCY_PURIFIER: {"heal":3.5,"shield":3,"support":2.5,"guard":2,"blast":1},
    PAST_LIFE_CHRONICLER: {"summon":3.5,"channel":3,"support":2.5,"control":2,"strike":1.5},
    REVERSED_RETRIBUTION: {"counter":3.5,"guard":3,"drain":2.5,"execute":2,"strike":1.5},
    BODHI_VOW_GUARDIAN: {"guard":3.5,"shield":3.5,"heal":2.5,"counter":2,"support":2},
    MYRIAD_BEAST_PACK: {"summon":3.5,"flurry":3,"sweep":2.5,"support":2,"charge":1.5},
    SYMBIOTIC_FANG_FUSION: {"flurry":3.5,"strike":3,"drain":2.5,"execute":2,"charge":2},
    COLOSSUS_SHIELD_TAMER: {"guard":3.5,"shield":3,"counter":2.5,"sweep":2,"strike":1.5},
    MOUNT_CHARGER: {"charge":3.5,"pierce":3,"sweep":2.5,"strike":2,"evade":1.5},
    PRIMORDIAL_BLOOD_AWAKENER: {"burst":3.5,"support":3,"summon":2.5,"drain":2,"strike":2},
    SWARM_INSECT_EMPEROR: {"dot":3.5,"barrage":3,"drain":2.5,"control":2,"sweep":1.5},
    ABYSSAL_DRAGON_TOTEM: {"burst":3.5,"sweep":3,"pierce":2.5,"summon":2.5,"charge":2},
    HEAVENLY_GOLEM: {"guard":3.5,"strike":3,"sweep":2.5,"counter":2,"pierce":1.5},
    THOUSAND_THREAD_ASSASSIN: {"control":3.5,"flurry":3,"summon":2.5,"channel":2,"pierce":1.5},
    BEAST_CHIMERA_MECH: {"strike":3.5,"sweep":3,"guard":2.5,"burst":2,"charge":1.5},
    CELESTIAL_BALLISTA: {"snipe":3.5,"barrage":3.5,"blast":2.5,"pierce":2},
    FLYING_BLADE_ORBITER: {"barrage":3.5,"flurry":3,"dot":2.5,"summon":2,"sweep":1.5},
    FATE_SEVERING_THREAD: {"control":3.5,"counter":3,"pierce":2.5,"channel":2,"strike":1.5},
    PAST_LIFE_MIRROR: {"summon":3.5,"channel":3,"support":2.5,"control":2,"strike":1.5},
    PRIMORDIAL_BLOOD_MUTATOR: {"burst":3.5,"support":3,"summon":2.5,"drain":2,"strike":2},
    SYMBIOTIC_BEAST_WARRIOR: {"flurry":3.5,"strike":3,"drain":2.5,"execute":2,"charge":2},
    SWARM_GU_HIVE_MASTER: {"dot":3.5,"barrage":3,"drain":2.5,"control":2,"sweep":1.5},
    CELESTIAL_ASTRAL_FAIRY_TAMER: {"heal":3.5,"support":3,"summon":2.5,"shield":2,"channel":1.5},
    GOLDEN_NEEDLE_SAINT: {"heal":3.5,"buff":3,"support":2.5,"control":2,"pierce":1.5},
    CELESTIAL_ZITHER_ENVOY: {"support":3.5,"buff":3.5,"heal":2.5,"channel":2,"blast":1.5},
    DIVINE_NECTAR_APOTHECARY: {"heal":4,"support":3,"shield":2.5,"guard":2},
    QIMEN_TALISMAN_PATRON: {"shield":3.5,"guard":3.5,"support":2.5,"counter":2},
    SOUL_LANTERN_SHEPHERD: {"support":3.5,"heal":3.5,"shield":2.5,"guard":2},
    WAR_BANNER_CHORISTER: {"buff":3.5,"support":3,"charge":2.5,"sweep":2,"strike":1.5},
    WOOD_SPIRIT_SYMBIONT: {"heal":3.5,"drain":3,"support":2.5,"shield":2,"dot":1.5},
    PILL_FURNACE_IMMORTAL: {"blast":3.5,"heal":3,"support":2.5,"shield":2,"strike":1.5},
    POISON_VENOM_CAULDRON: {"dot":3.5,"blast":3,"drain":2.5,"control":2,"strike":1.5},
    HEAVENLY_ANVIL_SMITH: {"strike":3.5,"pierce":3,"sweep":2.5,"guard":2.5,"burst":2},
    SPIRIT_SWORD_ARTIFICER: {"pierce":3.5,"flurry":3,"strike":2.5,"execute":2,"burst":1.5},
    RUNE_ARRAY_ENGRAVER: {"shield":3.5,"control":3,"blast":2.5,"snipe":2.5,"support":2},
    DIVINE_FLAME_SMELTER: {"blast":3.5,"burst":3,"sweep":2.5,"pierce":2,"shield":2},
    GRAND_STRATEGIST: {"command":4,"support":3,"control":2.5,"shield":2,"blast":1.5},
    IMPERIAL_PEACE_SOVEREIGN: {"command":3.5,"support":3.5,"heal":2.5,"shield":2.5},
    IRON_LEGION_MARSHAL: {"command":3.5,"charge":3,"pierce":2.5,"guard":2},
    HEAVENLY_MANDATE_CHANCELLOR: {"command":3.5,"support":3,"control":2.5,"channel":2},
    BATTLE_ARRAY_TACTICIAN: {"command":3.5,"control":3,"shield":2.5,"sweep":2},
    GRAND_FORMATION_ARCHITECT: {"control":3.5,"shield":3,"command":2.5,"blast":2.5},
    THUNDER_TALISMAN_ADEPT: {"blast":3.5,"burst":3,"snipe":2.5,"control":2},
    SEAL_SCRIPT_EXORCIST: {"control":3.5,"shield":3,"counter":2.5,"pierce":2},
    ASTRAL_LEVIATHAN_KRAKEN: {"blink":3.5,"evade":3,"burst":2.5,"sweep":2}
  };
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
  function rnd(h, k) { let x = (h ^ Math.imul(k + 1, 0x9e3779b1)) >>> 0; x = Math.imul(x ^ (x >>> 15), 2246822519) >>> 0; x = Math.imul(x ^ (x >>> 13), 3266489917) >>> 0; return ((x ^ (x >>> 16)) >>> 0) / 4294967296; }
  const cache = {}, moveCache = {};

  SK.moveProfile = (t, m) => {
    if (!t || !m) return null;
    const key = t.id + '::' + m.id;
    if (moveCache[key]) return moveCache[key];
    const arch = m.arch && SK.ARCH[m.arch] ? m.arch : 'strike';
    const A = SK.ARCH[arch], tier = t.tier || 1;
    const el = SK.ELEM[t.element] || SK.ELEM.NEUTRAL;
    const isPrimary = Array.isArray(t.moveDefs) && t.moveDefs[0] === m;
    const prof = {
      id: isPrimary ? t.id : m.id,
      moveId: m.id,
      tech: t.id,
      parentNameTh: t.nameTh,
      nameTh: m.nameTh,
      stageReq: m.stageReq || 1,
      reqMastery: m.reqMastery || m.minMastery || 0,
      reqCultStage: m.reqCultStage || t.reqTier || tier,
      tier,
      grade: t.grade || 'Common',
      legendary: !!t.legendary,
      arch,
      archTh: A.nameTh,
      icon: A.icon,
      type: m.type || (t.path === 'BODY' ? 'p' : 'm'),
      element: t.element || 'NEUTRAL',
      elementProfile: t.elementProfile || (g.ELEM && g.ELEM.getTargetProfile(t)) || null,
      elemTh: el.nameTh,
      cd: m.cd || A.cd,
      wind: m.wind || A.wind,
      hits: m.hits != null ? m.hits : A.hits,
      M: m.M != null ? m.M : (m.mult != null ? m.mult : 1.2),
      costPct: m.costPct != null ? m.costPct : (m.qiCost != null ? Math.round(m.qiCost * 0.45 * 10) / 10 : Math.round(4 * A.cost * (1 + 0.45 * (tier - 1)) * 10) / 10),
      pen: m.pen != null ? m.pen : (m.penAdd != null ? m.penAdd : (A.penAdd || 0)),
      critAdd: m.critAdd || 0,
      aoe: m.aoe != null ? !!m.aoe : !!A.aoe,
      steal: m.steal != null ? m.steal : (A.steal || 0),
      dot: m.dot || 0,
      dotKind: m.dotKind || 'bleed',
      recoil: m.recoil != null ? m.recoil : (A.recoil || 0),
      self: !!(m.self || A.self),
      team: !!(m.team || A.team),
      channel: m.channel || null,
      shield: m.shield || ((arch === 'guard' || arch === 'shield') ? Math.round((0.14 + 0.035 * (tier - 1)) * 100) / 100 : 0),
      heal: m.heal || (arch === 'heal' ? Math.round((0.16 + 0.04 * (tier - 1)) * 100) / 100 : 0),
      grantBuff: m.grantBuff || t.grantBuff || null,
      support: m.support || ((arch === 'support' || arch === 'buff') ? { kind: m.grantBuff || t.grantBuff || (m.sx && m.sx.k) || 'morale', dur: (m.sx && m.sx.dur) || (12 + tier * 2) } : null),
      summon: m.summon || null,
      rider: m.rider !== undefined ? m.rider : (m.status && !A.ctrl ? m.status : ((m.sx && m.sx.k && !A.self && !A.team) ? m.sx.k : (!A.self && !A.team && A.off && !A.ctrl ? el.st : null))),
      ctrl: m.ctrl !== undefined ? m.ctrl : (A.ctrl ? (m.status || (m.sx && m.sx.k) || el.ctrl) : null),
      shatterShield: !!m.shatterShield,
      qiRestorePct: m.qiRestorePct || 0,
      cleanseDebuffs: !!m.cleanseDebuffs,
      cleanseHeartDemon: m.cleanseHeartDemon || 0,
      cureInjury: m.cureInjury || 0,
      secondaryBuff: m.secondaryBuff || null,
      invertDebuffs: !!m.invertDebuffs,
      drawback: m.drawback || null,
      aiRole: m.aiRole || null,
      fxKind: m.fxKind || t.fxKind || null,
      signatureVfx: m.signatureVfx || t.signatureVfx || SK.resolveSignatureVfx(t, m) || null,
      composable: m.composable || t.composable || null,
      targetSelector: m.targetSelector || (m.composable && m.composable.targetSelector) || t.targetSelector || (t.composable && t.composable.targetSelector) || null,
      condition: m.condition || (m.composable && m.composable.condition) || t.condition || (t.composable && t.composable.condition) || null,
      action: m.action || (m.composable && m.composable.action) || t.action || (t.composable && t.composable.action) || null,
      actions: m.actions || (m.composable && m.composable.actions) || t.actions || (t.composable && t.composable.actions) || null,
      stanceShift: m.stanceShift || (m.composable && m.composable.stanceId) || t.stanceShift || null,
      comboPrimer: !!(m.comboPrimer || m.action === 'COMBO_PRIMER' || (m.composable && (m.composable.comboPrimer || m.composable.action === 'COMBO_PRIMER'))),
      comboFinisher: !!(m.comboFinisher || m.action === 'COMBO_FINISHER' || (m.composable && (m.composable.comboFinisher || m.composable.action === 'COMBO_FINISHER'))),
      chargeRelease: !!(m.chargeRelease || (m.chargeStage || 0) > 0 || m.action === 'CHARGE_RELEASE' || (m.composable && (m.composable.chargeRelease || m.composable.action === 'CHARGE_RELEASE'))),
      markPrimer: m.markPrimer || (m.composable && m.composable.markPrimer) || null,
      markDetonate: m.markDetonate || (m.composable && m.composable.markDetonate) || null,
      elementalFusion: m.elementalFusion || (m.composable && m.composable.elementalFusion) || t.elementalFusion || null,
      statusTransmute: m.statusTransmute || (m.composable && m.composable.statusTransmute) || null,
      sacrificeOverdrive: m.sacrificeOverdrive || (m.composable && m.composable.sacrificeOverdrive) || null,
      tetherLink: m.tetherLink || (m.composable && m.composable.tetherLink) || null,
      domain: m.domain || (m.composable && m.composable.domain) || t.domain || null,
      acupointStrike: m.acupointStrike || (m.composable && m.composable.acupointStrike) || t.acupointStrike || null,
      delayedEcho: m.delayedEcho || (m.composable && m.composable.delayedEcho) || null,
      taunt: m.taunt || (m.composable && m.composable.taunt) || false,
      knockback: m.knockback || (m.composable && m.composable.knockback) || null,
      poiseDamage: m.poiseDamage || (m.composable && m.composable.poiseDamage) || 0,
      chargeStage: m.chargeStage || (m.composable && m.composable.chargeStage) || 0,
      coCast: m.coCast || (m.composable && m.composable.coCast) || t.coCast || null,
      cleanseToPower: m.cleanseToPower || (m.composable && m.composable.cleanseToPower) || false,
      contagion: m.contagion || (m.composable && m.composable.contagion) || false,
      phoenixClause: m.phoenixClause || (m.composable && m.composable.phoenixClause) || false,
      tags: m.tags || t.tags || null,
      reqPath: t.reqPath || (t.path !== 'ANY' ? t.path : null),
      bonusPath: t.bonusPath || t.compatiblePaths || null,
      reqSubpath: t.reqSubpath || null,
      bonusSubpath: t.bonusSubpath || t.preferredSubs || (t.sub ? [t.sub] : null),
      reqWeapon: t.requiresWeapon ? t.weaponTypes : null,
      bonusWeapon: t.weaponTypes || null,
      reqElement: t.reqElement || null,
      bonusElement: t.bonusElement || (t.element !== 'NEUTRAL' ? t.element : null),
      weaponTypes: t.weaponTypes,
      armorTypes: t.armorTypes,
      requiresWeapon: t.requiresWeapon,
      moves: [m.nameTh]
    };
    prof.range = m.range || t.range || SK.resolveMoveSpatialSpec(prof, null);
    prof.summary = SK.summary(prof) + ((t.weaponTypes || t.armorTypes) ? ' · ' + g.JD.MARTIAL.types[(t.weaponTypes || t.armorTypes)[0]] + ' ' + (t.requiresWeapon ? 'จำเป็นต้องใช้อาวุธนี้' : 'ถนัด ×1.15 / อื่น ×0.65') + '' : '');
    return (moveCache[key] = prof);
  };

  SK.profile = t => {
    if (!t || t.passive || t.cat === 'PASSIVE') return null; if (cache[t.id]) return cache[t.id];
    const h = hash(t.id); let arch;
    if (t.combatArch && SK.ARCH[t.combatArch]) arch = t.combatArch;
    else if (t.cat === 'FORBIDDEN_ART' || t.cat === 'FORBIDDEN_TECHNIQUE') arch = 'forbid';
    else if (t.cat === 'DEFENSIVE_TECHNIQUE') arch = (t.moveDefs && t.moveDefs[0] && SK.ARCH[t.moveDefs[0].arch]) ? t.moveDefs[0].arch : 'guard';
    else if (t.cat === 'SUPPORT_TECHNIQUE') arch = (t.moveDefs && t.moveDefs[0] && SK.ARCH[t.moveDefs[0].arch]) ? t.moveDefs[0].arch : 'support';
    else if (t.cat === 'MOVEMENT_TECHNIQUE' || t.cat === 'LIGHTNESS_ART' || (t.cat === 'AUXILIARY_ART' && t.role === 'MOVEMENT_STEALTH_RECON')) arch = 'evade';
    else if (t.cat === 'AUXILIARY_ART' && t.role === 'HEAL_SUPPORT_TRAINING') {
      const isBuff = /ปลุกขวัญ|อวยพร|หนุน|ประสาน|คุ้มกัน|กำลังใจ|ศรัทธา|เชื่อมใจ/.test(t.nameTh || '');
      arch = isBuff ? 'support' : 'heal';
    }
    else if (t.cat === 'COMBAT_TECHNIQUE') {
      const w = Object.assign({}, SUBW[t.sub] || { strike: 3, flurry: 1, sweep: 1 });
      if (t.tier < 3) { delete w.burst; delete w.summon; }
      if (t.tier < 2) { delete w.control; delete w.counter; delete w.channel; }
      const ks = Object.keys(w), tot = ks.reduce((s, k) => s + w[k], 0); let r = rnd(h, 1) * tot; arch = ks[ks.length - 1];
      for (const k of ks) { r -= w[k]; if (r <= 0) { arch = k; break; } }
    } else if (Array.isArray(t.moveDefs) && t.moveDefs.length) {
      const m0 = SK.moveProfile(t, t.moveDefs[0]);
      const prof = Object.assign({}, m0, { id: t.id, tech: t.id, moveId: t.moveDefs[0].id, nameTh: t.nameTh, moves: t.moves || t.moveDefs.map(x => x.nameTh) });
      return (cache[t.id] = prof);
    } else return (cache[t.id] = null); // วิชาอาชีพ/ไม่ใช่การรบ
    const A = SK.ARCH[arch], tier = t.tier, tierMult = 1 + 0.12 * (tier - 1) + Math.min(0.18, 0.0006 * Math.max(0, (t.power || 40) - 40 * tier * 0.8));
    const cd = Math.round(A.cd * (0.85 + 0.3 * rnd(h, 2)));
    const wind0 = Math.max(2, Math.round(A.wind * (0.9 + 0.2 * rnd(h, 4)))), hits = A.hits;
    const fill = (cd - wind0) / 4, tot = A.e * (cd / 4) * tierMult - fill;
    let M = hits ? Math.max(0.9, tot / hits) : 0, dotTot = 0;
    if (arch === 'dot') { M = 0.9; dotTot = Math.max(0.5, tot - 0.9); }
    if (arch === 'counter') M = Math.max(1.5, A.e * (cd / 4) * tierMult * 0.8);
    const el = SK.ELEM[t.element] || SK.ELEM.NEUTRAL;
    let type = 'm'; const P = t.path;
    if (P === 'BODY') type = 'p';
    else if (P === 'BEAST_SOVEREIGN') type = (t.sub === 'SWARM_GU_HIVE_MASTER' || t.sub === 'SWARM_INSECT_EMPEROR' || t.sub === 'PRIMORDIAL_BLOOD_MUTATOR' || t.sub === 'PRIMORDIAL_BLOOD_AWAKENER' || t.sub === 'CELESTIAL_ASTRAL_FAIRY_TAMER') ? (rnd(h, 3) < 0.45 ? 'p' : 'm') : 'p';
    else if (P === 'MECH_PUPPET') type = (t.sub === 'HEAVENLY_GOLEM' || t.sub === 'IRON_COLOSSUS' || t.sub === 'CELESTIAL_BALLISTA' || t.sub === 'SPIRIT_ARTILLERY_ENGINEER' || t.sub === 'FLYING_BLADE_ORBITER' || t.sub === 'CLOCKWORK_SWARM_WEAVER') ? 'p' : (rnd(h, 3) < 0.5 ? 'p' : 'm');
    else if (P === 'KARMA_SAMSARA') type = (t.sub === 'ASURA_JUDGMENT_BLADE' || t.sub === 'REVERSED_RETRIBUTION') ? 'p' : 'm';
    else if (P === 'SAGE_SUPPORT') type = (t.sub === 'WAR_BANNER_CHORISTER') ? 'p' : 'm';
    else if (P === 'CRAFT_CREATION') type = (t.sub === 'HEAVENLY_ANVIL_SMITH' || t.sub === 'SPIRIT_SWORD_ARTIFICER') ? 'p' : 'm';
    else if (P === 'GOD') type = (t.sub === 'WAR_DEITY' || t.sub === 'TOTEM_BEAST_GOD') ? 'p' : 'm';
    else if (P === 'DEMON') type = (t.sub === 'SHADOW_ASSASSIN' ? (rnd(h, 3) < 0.85 ? 'p' : 'm') : t.sub === 'HEAVEN_DEVOURING_DEMON' ? (rnd(h, 3) < 0.5 ? 'p' : 'm') : 'm');
    else if (P === 'HEART_SOUL') type = (t.sub === 'MIND_SWORD_TELEKINESIS' && rnd(h, 3) < 0.35) ? 'p' : 'm';
    else type = (t.sub === 'SWORD_IMMORTAL' ? rnd(h, 3) < 0.7 : t.sub === 'BLOOD_DEMON' ? rnd(h, 3) < 0.4 : rnd(h, 3) < 0.12) ? 'p' : 'm';
    const prof = { id: t.id, tech: t.id, nameTh: t.nameTh, tier, grade: t.grade || 'Common', legendary: !!t.legendary, fxKind: t.fxKind || null, arch, archTh: A.nameTh, icon: A.icon, type, element: t.element, elementProfile: t.elementProfile || (g.ELEM && g.ELEM.getTargetProfile(t)) || null, elemTh: el.nameTh, cd,
      hits, wind: wind0, M: Math.round(M * 100) / 100, costPct: Math.round(4 * A.cost * (1 + 0.45 * (tier - 1)) * 10) / 10, pen: A.penAdd || 0, aoe: !!A.aoe, steal: A.steal || 0, dot: Math.round(dotTot * 100) / 100,
      recoil: A.recoil || 0, self: !!A.self, team: !!A.team, channel: !!A.channel, rider: !A.self && !A.team && A.off && !A.ctrl ? el.st : null, ctrl: A.ctrl ? el.ctrl : null, moves: t.moves || [] };
    if (arch === 'dot') prof.dotKind = ({ FIRE: 'burn', BLOOD_DEMON: 'bleed', WOOD_LIFE: 'poison' })[t.element] || (rnd(h, 5) < 0.5 ? 'poison' : 'bleed');
    if (arch === 'guard') prof.shield = Math.round((0.14 + 0.035 * (tier - 1)) * 100) / 100;
    if (arch === 'heal') prof.heal = Math.round((0.16 + 0.04 * (tier - 1)) * 100) / 100;
    prof.grantBuff = t.grantBuff || null;
    if (arch === 'support' || arch === 'buff') {
      prof.support = {
        kind: t.grantBuff || ((t.sub === 'WAR_DEITY' || t.element === 'LIGHTNING') ? 'morale' : (t.element === 'WIND' ? 'haste' : 'holyAura')),
        dur: 12 + tier * 2
      };
    }
    if (arch === 'summon') {
      prof.summon = {
        dur: 14 + tier * 2,
        hpPct: Math.round((0.35 + 0.05 * (tier - 1)) * 100) / 100,
        statPct: Math.round((0.50 + 0.05 * (tier - 1)) * 100) / 100,
        nameSuffix: (t.path === 'MECH_PUPPET' ? 'หุ่นกลศึก' : t.path === 'BEAST_SOVEREIGN' ? 'อสูรคู่สัญญา' : t.path === 'KARMA_SAMSARA' ? 'เงาอดีตชาติ' : t.sub === 'TOTEM_BEAST_GOD' ? 'เทพอสูร' : t.sub === 'PHANTOM_SOUL' ? 'ร่างเงามายา' : t.sub === 'NETHER_GHOST_KING' ? 'ภูตยมโลก' : t.sub === 'DREAM_ILLUSION_WEAVER' ? 'ร่างมายาฝัน' : 'ร่างอวตาร')
      };
    }
    if (arch === 'channel') {
      const ticks = 3;
      prof.channel = {
        ticks,
        tickM: Math.round(Math.max(0.4, tot / ticks * 0.45) * 100) / 100,
        finishM: Math.round(Math.max(0.7, tot / ticks * 0.85) * 100) / 100,
        interruptForce: 15
      };
      prof.ticks = ticks;
    }
    const m0 = (Array.isArray(t.moveDefs) && t.moveDefs[0]) || {};
    prof.composable = t.composable || m0.composable || null;
    prof.targetSelector = t.targetSelector || m0.targetSelector || (prof.composable && prof.composable.targetSelector) || null;
    prof.condition = t.condition || m0.condition || (prof.composable && prof.composable.condition) || null;
    prof.action = t.action || m0.action || (prof.composable && prof.composable.action) || null;
    prof.actions = t.actions || m0.actions || (prof.composable && prof.composable.actions) || null;
    prof.stanceShift = t.stanceShift || m0.stanceShift || null;
    prof.comboPrimer = !!(t.comboPrimer || m0.comboPrimer);
    prof.comboFinisher = !!(t.comboFinisher || m0.comboFinisher);
    prof.markPrimer = t.markPrimer || m0.markPrimer || null;
    prof.markDetonate = t.markDetonate || m0.markDetonate || null;
    prof.elementalFusion = t.elementalFusion || m0.elementalFusion || null;
    prof.statusTransmute = t.statusTransmute || m0.statusTransmute || null;
    prof.sacrificeOverdrive = t.sacrificeOverdrive || m0.sacrificeOverdrive || null;
    prof.tetherLink = t.tetherLink || m0.tetherLink || null;
    prof.domain = t.domain || m0.domain || null;
    prof.acupointStrike = t.acupointStrike || m0.acupointStrike || null;
    prof.delayedEcho = t.delayedEcho || m0.delayedEcho || null;
    prof.coCast = t.coCast || m0.coCast || null;
    prof.tags = t.tags || m0.tags || null;
    prof.weaponTypes = t.weaponTypes; prof.armorTypes = t.armorTypes; prof.requiresWeapon = t.requiresWeapon;
    prof.range = t.range || m0.range || SK.resolveMoveSpatialSpec(prof, null);
    prof.summary = SK.summary(prof) + ((t.weaponTypes || t.armorTypes) ? ' · ' + g.JD.MARTIAL.types[(t.weaponTypes || t.armorTypes)[0]] + ' ' + (t.requiresWeapon ? 'จำเป็นต้องใช้อาวุธนี้' : 'ถนัด ×1.15 / อื่น ×0.65') + '' : ''); return (cache[t.id] = prof);
  };

  SK.summary = p => {
    const A = SK.ARCH[p.arch] || SK.ARCH.strike, bits = [];
    if (p.M && p.arch !== 'channel') bits.push('ดาเมจ ×' + p.M + (p.hits > 1 ? ' ×' + p.hits + ' ครั้ง' : p.aoe ? ' ต่อตัว' : ''));
    if (p.dot) bits.push('แผลต่อเนื่อง ×' + p.dot);
    if (p.shield) bits.push('โล่ ' + Math.round(p.shield * 100) + '% HP');
    if (p.heal) bits.push('ฟื้น ' + Math.round(p.heal * 100) + '% HP');
    if (p.qiRestorePct) bits.push('ฟื้นปราณ ' + Math.round(p.qiRestorePct * 100) + '%');
    if (p.shatterShield) bits.push('ทลายโล่ศัตรูทันที');
    if (p.support) bits.push('หนุนฝ่ายตน (' + (SK.STATUS[p.support.kind] ? SK.STATUS[p.support.kind].nameTh : p.support.kind) + ') ' + p.support.dur + ' นาที');
    if (p.summon) bits.push('อัญเชิญ' + p.summon.nameSuffix + ' (เลือด ' + Math.round(p.summon.hpPct * 100) + '%, ' + p.summon.dur + ' นาที)');
    if (p.channel) bits.push('ร่ายต่อเนื่อง ' + p.channel.ticks + ' รอบ (สะสม ×' + p.channel.tickM + ' / ทะลวงจบ ×' + p.channel.finishM + ')');
    if (p.pen) bits.push('เจาะเกราะ +' + p.pen + '%');
    if (p.steal) bits.push('ดูดชีวิต ' + Math.round(p.steal * 100) + '%');
    if (p.recoil) bits.push('เสียเลือดตน ' + Math.round(p.recoil * 100) + '%');
    if (p.drawback) {
      if (p.drawback.staminaCost) bits.push('ใช้แรงกาย ' + p.drawback.staminaCost);
      if (p.drawback.exposeTicks) bits.push('เปิดช่องโหว่ ' + p.drawback.exposeTicks + ' นาที');
      if (p.drawback.heartDemonAdd) bits.push('จิตมาร +' + p.drawback.heartDemonAdd);
    }
    const st = p.ctrl || p.rider; if (st && SK.STATUS[st]) bits.push((p.ctrl ? 'ผล: ' : 'โอกาสแทรก: ') + SK.STATUS[st].nameTh);
    bits.push('คูลดาวน์ ' + p.cd + ' · ร่าย ' + p.wind + ' · ปราณ ' + p.costPct + '%');
    return A.icon + ' ' + A.nameTh + ' · ' + (p.type === 'p' ? 'กายภาพ' : 'วิชา') + ' · ธาตุ' + (p.elemTh || (SK.ELEM[p.elem || p.element] && SK.ELEM[p.elem || p.element].nameTh) || 'ไร้ธาตุ') + ' — ' + bits.join(' · ');
  };

  /* ---------- Multi-Stage & Multi-Move Progression Authority ---------- */
  SK.masteryPoints = (n, techId) => (n && n.cult && n.cult.tm && Number.isFinite(n.cult.tm[techId])) ? n.cult.tm[techId] : 0;

  SK.unlockedStage = (n, tOrId) => {
    const t = typeof tOrId === 'string' ? CULT.tech(tOrId) : tOrId;
    if (!t) return 0;
    if (!Array.isArray(t.stages) || !t.stages.length) return 1;
    const pts = SK.masteryPoints(n, t.id);
    const cStage = n && n.cult ? (CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage) : (n && n.tier ? n.tier : 1);
    let best = 1;
    for (const st of t.stages) {
      const reqMas = st.reqMastery || st.minMastery || 0;
      const reqCult = st.reqCultStage || t.reqTier || t.tier || 1;
      if (pts >= reqMas && cStage >= reqCult) {
        best = Math.max(best, st.stage || 1);
      }
    }
    return best;
  };

  SK.allMoves = tOrId => {
    const t = typeof tOrId === 'string' ? CULT.tech(tOrId) : tOrId;
    if (!t || t.passive || t.cat === 'PASSIVE') return [];
    if (Array.isArray(t.moveDefs) && t.moveDefs.length) {
      return t.moveDefs.map((m, idx) => Object.assign({ moveIndex: idx }, SK.moveProfile(t, m))).filter(Boolean);
    }
    const p = SK.profile(t);
    return p ? [Object.assign({ moveIndex: 0 }, p)] : [];
  };

  SK.unlockedMoves = (n, tOrId) => {
    const t = typeof tOrId === 'string' ? CULT.tech(tOrId) : tOrId;
    if (!t || t.passive || t.cat === 'PASSIVE') return [];
    if (Array.isArray(t.moveDefs) && t.moveDefs.length) {
      const uStage = SK.unlockedStage(n, t);
      const pts = SK.masteryPoints(n, t.id);
      const cStage = n && n.cult ? (CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage) : (n && n.tier ? n.tier : 1);
      return t.moveDefs
        .map((m, idx) => ({ m, idx }))
        .filter(({ m }) => (m.stageReq || 1) <= uStage && (m.reqMastery || m.minMastery || 0) <= pts && (!m.reqCultStage || cStage >= m.reqCultStage))
        .map(({ m, idx }) => Object.assign({ moveIndex: idx }, SK.moveProfile(t, m)))
        .filter(Boolean);
    }
    const p = SK.profile(t);
    return p ? [Object.assign({ moveIndex: 0 }, p)] : [];
  };

  SK.canSelectMove = (n, techOrId, moveIdOrIdx) => {
    if (!n || !n.cult) return false;
    const t = typeof techOrId === 'string' ? CULT.tech(techOrId) : techOrId;
    if (!t || t.passive || t.cat === 'PASSIVE') return false;
    if (g.MARTIAL && g.MARTIAL.skillEfficiency && g.MARTIAL.skillEfficiency(n, t) <= 0) return false;
    if (t.innateOnly) {
      if (!(g.MARTIAL && g.MARTIAL.isInnateActive && g.MARTIAL.isInnateActive(n, t))) return false;
    } else {
      const activeTechs = g.MARTIAL && g.MARTIAL.activeTechs ? g.MARTIAL.activeTechs(n) : n.cult.techs;
      const mantraOk = n.cult.mantra === t.id && (!g.MARTIAL || !g.MARTIAL.canActivateMantra || g.MARTIAL.canActivateMantra(n, t));
      const owned = activeTechs.includes(t.id) || mantraOk;
      if (!owned) return false;
    }
    return SK.unlockedMoves(n, t).some(m => m.id === moveIdOrIdx || m.moveId === moveIdOrIdx || m.moveIndex === moveIdOrIdx);
  };

  SK.gainMastery = (W, n, techId, amt) => {
    if (!n || !n.cult || !techId) return { gained: 0, unlockedNewStage: false };
    const t = CULT.tech(techId);
    const prevStage = t ? SK.unlockedStage(n, t) : 1;
    n.cult.tm = n.cult.tm || {};
    const add = Number.isFinite(amt) && amt > 0 ? amt : 1;
    n.cult.tm[techId] = (n.cult.tm[techId] || 0) + add;
    if (t && g.ELEM && g.ELEM.gainMastery && (!W || !W._inSkillCast)) {
      g.ELEM.gainMastery(n, t, 'practice', W, { sourceId: techId, scale: Math.min(1.5, add) });
    }
    const newStage = t ? SK.unlockedStage(n, t) : 1;
    if (newStage > prevStage) {
      if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(n); else if (g.STATS) g.STATS.dirty(n);
      if (W && W.log && t && Array.isArray(t.stages)) {
        const stObj = t.stages.find(s => s.stage === newStage);
        W.log('insight', n.h.name.given + ' บรรลุความเข้าใจวิชา「' + t.nameTh + '」สู่' + (stObj ? stObj.nameTh : ('ขั้นที่ ' + newStage)) + '!', [n.id]);
      }
      return { gained: add, unlockedNewStage: true, fromStage: prevStage, toStage: newStage };
    }
    return { gained: add, unlockedNewStage: false, fromStage: prevStage, toStage: newStage };
  };

  /* วิชาที่ตัวละครใช้ได้ในการรบ (รวมถึงกระบวนท่าที่ปลดล็อกแล้วจากวิชาหลายขั้นและคัมภีร์หลักระดับตำนาน) */
  SK.list = n => {
    if (n.foe) return n.skl || [];
    if (!n.cult) return [];
    const c = n.cult, tl = c.techs ? c.techs.length : 0, tSig = c.techs ? c.techs.join(',') : '';
    const eq = n.equip || {};
    const slotSig = it => {
      if (!it || (g.MARTIAL && g.MARTIAL.gearUsable && !g.MARTIAL.gearUsable(n, it))) return '';
      const mSig = Array.isArray(it.skillModifiers) ? it.skillModifiers.map(m => m ? ((m.targetTechId || m.targetArch || '') + ':' + (m.multAdd || 0) + ':' + (m.hitsAdd || 0) + ':' + (m.cdDelta || 0) + ':' + (m.penAdd || 0) + ':' + (m.critAdd || 0) + ':' + (m.costMult || 1) + ':' + (m.addRider || '') + ':' + (m.grantBuff || '') + ':' + (m.addElementalFusion || '') + ':' + (m.composablePatch && m.composablePatch.action || '')) : '').join(';') : '';
      const rSig = it.runeInscriptions ? Object.entries(it.runeInscriptions).map(([rk, rv]) => rk + ':' + (rv && (rv.reactionId || rv.mult || rv) || '')).join(';') : '';
      const gSig = Array.isArray(it.grantedSkills) ? it.grantedSkills.join(',') : '';
      return (it.uid || it.id || '') + ':' + (it._modVer || 0) + ':' + mSig + ':' + rSig + ':' + gSig;
    };
    const eqKey = slotSig(eq.WEAPON) + '|' + slotSig(eq.ARMOR) + '|' + slotSig(eq.ACCESSORY);
    const slc = n._skListCache;
    if (slc && slc.path === c.path && slc.sub === c.sub && slc.st === c.stage && slc.mantra === c.mantra && slc.tl === tl && slc.tSig === tSig && slc.eqKey === eqKey && slc.ver === (n._passVer || 0)) {
      return slc.out;
    }
    const activeIds = (g.MARTIAL ? g.MARTIAL.activeTechs(n) : n.cult.techs).slice();
    if (g.MARTIAL && g.MARTIAL.activeInnateTechs) {
      for (const innId of g.MARTIAL.activeInnateTechs(n)) {
        if (!activeIds.includes(innId)) activeIds.push(innId);
      }
    }
    if (n.cult.mantra && (!g.MARTIAL || !g.MARTIAL.canActivateMantra || g.MARTIAL.canActivateMantra(n, n.cult.mantra))) {
      const mTech = CULT.tech(n.cult.mantra);
      if (mTech && Array.isArray(mTech.moveDefs) && mTech.moveDefs.length && !activeIds.includes(mTech.id)) {
        activeIds.push(mTech.id);
      }
    }
    const grantedIds = (g.MARTIAL && g.MARTIAL.grantedEquipmentTechs) ? g.MARTIAL.grantedEquipmentTechs(n) : [];
    for (const gid of grantedIds) {
      if (!activeIds.includes(gid)) activeIds.push(gid);
    }
    const hasSkillMods = g.MARTIAL && g.MARTIAL.hasEquipmentSkillModifiers && g.MARTIAL.hasEquipmentSkillModifiers(n);
    const out = [];
    for (const id of activeIds) {
      const t = CULT.tech(id);
      if (!t || t.passive || t.cat === 'PASSIVE') continue;
      const isGranted = grantedIds.includes(id) && !(c.techs && c.techs.includes(id));
      if (Array.isArray(t.moveDefs) && t.moveDefs.length) {
        const moves = SK.unlockedMoves(n, t);
        for (const mv of moves) {
          const finalMv = hasSkillMods ? g.MARTIAL.applyEquipmentSkillModifiers(n, mv) : (isGranted ? Object.assign({}, mv, { fromEquipmentGrant: true }) : mv);
          if (isGranted) finalMv.fromEquipmentGrant = true;
          out.push(finalMv);
        }
      } else {
        const p = SK.profile(t);
        if (p) {
          const finalP = hasSkillMods ? g.MARTIAL.applyEquipmentSkillModifiers(n, p) : (isGranted ? Object.assign({}, p, { fromEquipmentGrant: true }) : p);
          if (isGranted) finalP.fromEquipmentGrant = true;
          out.push(finalP);
        }
      }
    }
    n._skListCache = { path: c.path, sub: c.sub, st: c.stage, mantra: c.mantra, tl, tSig, eqKey, ver: n._passVer || 0, out };
    return out;
  };

  SK.qiCost = (n, p) => {
    const passMult = (g.MARTIAL && g.MARTIAL.passiveStats ? g.MARTIAL.passiveStats(n).qiCostMult : 1) || 1;
    const innMult = (g.MARTIAL && g.MARTIAL.innateStats ? g.MARTIAL.innateStats(n).qiCostMult : 1) || 1;
    const synMult = (g.MARTIAL && g.MARTIAL.skillSynergy ? g.MARTIAL.skillSynergy(n, p).qiCostMult : 1) || 1;
    let fitMult = 1;
    if (n && n.cult && g.MARTIAL) {
      const t = CULT.tech(p.tech || p.id) || p;
      const wpnMult = g.MARTIAL.weaponCompatibility ? g.MARTIAL.weaponCompatibility(n, t).qiCostMult : 1;
      const pathExact = t.path === 'ANY' || t.path === n.cult.path || (Array.isArray(t.compatiblePaths) && t.compatiblePaths.includes(n.cult.path));
      fitMult = +(wpnMult * (t.legendary ? 1 : (pathExact ? 1 : 1.12))).toFixed(3);
    }
    const eq = n && n.equip;
    const legResMult = (eq && ((eq.WEAPON && eq.WEAPON.legendary) || (eq.ARMOR && eq.ARMOR.legendary) || (eq.ACCESSORY && eq.ACCESSORY.legendary)) && g.MARTIAL && g.MARTIAL.evaluateLegendaryRelicResonance)
      ? g.MARTIAL.evaluateLegendaryRelicResonance(n).qiCostMult : 1;
    return Math.max(0, Math.round(g.CULT.qiMax(n) * (p.costPct || 0) / 100 * clamp(passMult * innMult * synMult * fitMult * legResMult, 0.30, 1.5)));
  };
  SK.masteryBase = (n, p) => {
    const c = n && n.cult, techId = p.tech || p.id;
    const pts = c && c.tm ? (c.tm[techId] || c.tm[p.id] || 0) : 0;
    return 1 + Math.min(0.18, pts * 0.002);
  };
  SK.mastery = (n, p) => {
    const base = SK.masteryBase(n, p);
    const eff = g.MARTIAL ? g.MARTIAL.skillEfficiency(n, p) : 1;
    const syn = (g.MARTIAL && g.MARTIAL.skillSynergy) ? g.MARTIAL.skillSynergy(n, p).dmgMult : 1;
    return base * eff * syn;
  };

  /* ---------- Patch v3.0.0: 5 Tactical Range Bands & Move Spatial Resolution Engine ---------- */
  SK.RANGE_BANDS = Object.freeze({
    POINT_BLANK:   { id: 'POINT_BLANK',   bandIndex: 0, min: 0.0, max: 1.25, nameTh: 'ระยะเผาขนคลุกวงใน', shortTh: 'เผาขน (0–1.2)' },
    MELEE_REACH:   { id: 'MELEE_REACH',   bandIndex: 1, min: 0.0, max: 2.05, nameTh: 'ระยะคมศาสตราประชิด', shortTh: 'ประชิด (1.1–2.0)' },
    EXTENDED_REACH:{ id: 'EXTENDED_REACH',bandIndex: 2, min: 0.0, max: 3.05, nameTh: 'ระยะแส้และสายปราณ', shortTh: 'ระยะยืด (2.1–3.0)' },
    MID_TACTICAL:  { id: 'MID_TACTICAL',  bandIndex: 3, min: 0.8, max: 4.50, nameTh: 'ระยะกลางพิณยันต์และปราณ', shortTh: 'ระยะกลาง (3.1–4.5)' },
    LONG_BALLISTIC:{ id: 'LONG_BALLISTIC',bandIndex: 4, min: 1.4, max: 6.20, nameTh: 'ระยะไกลกระบี่บินและเกาทัณฑ์', shortTh: 'ระยะไกล (4.6–6.2)' }
  });

  SK.ARCH_RANGE_DEFAULTS = Object.freeze({
    strike:            { band: 'MELEE_REACH',    min: 0.0, max: 1.80, shape: 'SINGLE',        radius: 0,   requiresLoS: false },
    slash:             { band: 'MELEE_REACH',    min: 0.0, max: 1.85, shape: 'SINGLE',        radius: 0,   requiresLoS: false },
    flurry:            { band: 'MELEE_REACH',    min: 0.0, max: 1.75, shape: 'SINGLE',        radius: 0,   requiresLoS: false },
    pierce:            { band: 'EXTENDED_REACH', min: 0.0, max: 2.40, shape: 'LINE',          radius: 0.7, requiresLoS: true  },
    execute:           { band: 'MELEE_REACH',    min: 0.0, max: 1.95, shape: 'SINGLE',        radius: 0,   requiresLoS: false },
    sweep:             { band: 'MELEE_REACH',    min: 0.0, max: 2.15, shape: 'CIRCLE_SELF',   radius: 2.3, requiresLoS: false },
    charge:            { band: 'MID_TACTICAL',   min: 0.8, max: 3.80, shape: 'LINE',          radius: 0.8, requiresLoS: true,  isGapCloser: true },
    blink:             { band: 'MID_TACTICAL',   min: 0.0, max: 4.40, shape: 'SINGLE',        radius: 0,   requiresLoS: false, isGapCloser: true, ignoresObstacles: true },
    evade:             { band: 'POINT_BLANK',    min: 0.0, max: 3.20, shape: 'SELF',          radius: 0,   requiresLoS: false, isRetreat: true },
    guard:             { band: 'POINT_BLANK',    min: 0.0, max: 1.50, shape: 'SELF',          radius: 0,   requiresLoS: false },
    shield:            { band: 'POINT_BLANK',    min: 0.0, max: 1.50, shape: 'SELF',          radius: 0,   requiresLoS: false },
    counter:           { band: 'POINT_BLANK',    min: 0.0, max: 1.80, shape: 'SELF',          radius: 0,   requiresLoS: false },
    stanceShift:       { band: 'POINT_BLANK',    min: 0.0, max: 2.20, shape: 'SELF',          radius: 0,   requiresLoS: false },
    snipe:             { band: 'LONG_BALLISTIC', min: 1.3, max: 5.60, shape: 'SINGLE',        radius: 0,   requiresLoS: true,  minRangePenalty: 0.35 },
    barrage:           { band: 'MID_TACTICAL',   min: 1.0, max: 4.60, shape: 'CIRCLE_TARGET', radius: 2.5, requiresLoS: true  },
    blast:             { band: 'MID_TACTICAL',   min: 0.0, max: 3.90, shape: 'CIRCLE_TARGET', radius: 2.6, requiresLoS: true  },
    wave:              { band: 'MID_TACTICAL',   min: 0.0, max: 3.60, shape: 'CONE',          radius: 2.8, requiresLoS: false },
    chainRicochet:     { band: 'MID_TACTICAL',   min: 0.0, max: 4.10, shape: 'CHAIN',         radius: 3.0, requiresLoS: true  },
    dot:               { band: 'EXTENDED_REACH', min: 0.0, max: 2.80, shape: 'SINGLE',        radius: 0,   requiresLoS: true  },
    control:           { band: 'MID_TACTICAL',   min: 0.0, max: 3.60, shape: 'SINGLE',        radius: 0,   requiresLoS: true  },
    drain:             { band: 'EXTENDED_REACH', min: 0.0, max: 2.60, shape: 'SINGLE',        radius: 0,   requiresLoS: false },
    burst:             { band: 'EXTENDED_REACH', min: 0.0, max: 3.10, shape: 'CIRCLE_TARGET', radius: 2.4, requiresLoS: false },
    forbid:            { band: 'MID_TACTICAL',   min: 0.0, max: 3.80, shape: 'CIRCLE_TARGET', radius: 2.8, requiresLoS: false },
    sacrificeOverdrive:{ band: 'EXTENDED_REACH', min: 0.0, max: 3.00, shape: 'SINGLE',        radius: 0,   requiresLoS: false },
    channel:           { band: 'MID_TACTICAL',   min: 0.6, max: 4.20, shape: 'SINGLE',        radius: 2.4, requiresLoS: true,  isChannel: true },
    soul:              { band: 'MID_TACTICAL',   min: 0.0, max: 4.20, shape: 'SINGLE',        radius: 0,   requiresLoS: false, ignoresObstacles: true },
    karmaReversal:     { band: 'MID_TACTICAL',   min: 0.0, max: 3.50, shape: 'SINGLE',        radius: 0,   requiresLoS: false },
    markPrimer:        { band: 'MID_TACTICAL',   min: 0.0, max: 3.60, shape: 'SINGLE',        radius: 0,   requiresLoS: true  },
    markDetonate:      { band: 'MID_TACTICAL',   min: 0.0, max: 3.80, shape: 'CIRCLE_TARGET', radius: 2.2, requiresLoS: false },
    elementalFusion:   { band: 'MID_TACTICAL',   min: 0.0, max: 4.00, shape: 'CIRCLE_TARGET', radius: 2.6, requiresLoS: false },
    statusTransmute:   { band: 'MID_TACTICAL',   min: 0.0, max: 3.50, shape: 'SINGLE',        radius: 0,   requiresLoS: false },
    tetherLink:        { band: 'MID_TACTICAL',   min: 0.0, max: 4.00, shape: 'SINGLE',        radius: 0,   requiresLoS: false },
    heal:              { band: 'MID_TACTICAL',   min: 0.0, max: 4.50, shape: 'ALLY',          radius: 3.5, requiresLoS: false },
    support:           { band: 'MID_TACTICAL',   min: 0.0, max: 4.50, shape: 'ALLY_TEAM',     radius: 4.5, requiresLoS: false },
    buff:              { band: 'MID_TACTICAL',   min: 0.0, max: 4.50, shape: 'ALLY_TEAM',     radius: 4.5, requiresLoS: false },
    command:           { band: 'MID_TACTICAL',   min: 0.0, max: 4.20, shape: 'ALLY_TEAM',     radius: 4.5, requiresLoS: false },
    harmonize:         { band: 'MID_TACTICAL',   min: 0.0, max: 4.20, shape: 'ALLY_TEAM',     radius: 4.2, requiresLoS: false },
    summon:            { band: 'POINT_BLANK',    min: 0.0, max: 3.50, shape: 'SELF',          radius: 0,   requiresLoS: false }
  });

  SK.classifyRangeBand = maxRange => {
    const r = Number(maxRange) || 1.7;
    if (r <= 1.25) return SK.RANGE_BANDS.POINT_BLANK;
    if (r <= 2.05) return SK.RANGE_BANDS.MELEE_REACH;
    if (r <= 3.05) return SK.RANGE_BANDS.EXTENDED_REACH;
    if (r <= 4.50) return SK.RANGE_BANDS.MID_TACTICAL;
    return SK.RANGE_BANDS.LONG_BALLISTIC;
  };

  /* คำนวณสเปกระยะและเรขาคณิตของกระบวนท่า (Technique Override > Semantic/Path/Arch > Weapon Base) */
  SK.resolveMoveSpatialSpec = (p, u) => {
    if (!p) {
      const wp = u ? SK.weaponTacticalProfile(u) : null;
      const maxR = (wp && wp.engageRange) || 1.7;
      const b = SK.classifyRangeBand(maxR);
      return {
        min: 0.0, max: maxR, optimal: Math.max(0.8, maxR * 0.85),
        band: b.id, bandIndex: b.bandIndex, bandNameTh: b.nameTh,
        shape: 'SINGLE', radius: 0, requiresLoS: maxR >= 2.6,
        ignoresObstacles: false, isGapCloser: false, isRetreat: false,
        minRangePenalty: (wp && wp.weaponType === 'BOW') ? 0.35 : 0,
        lockType: 'UNIT', source: 'BASIC_ATTACK'
      };
    }
    const arch = p.arch || 'strike';
    const def = SK.ARCH_RANGE_DEFAULTS[arch] || SK.ARCH_RANGE_DEFAULTS.strike;
    const explicit = p.range && typeof p.range === 'object' ? p.range : null;
    const nameStr = ((p.nameTh || '') + ' ' + (p.parentNameTh || '')).trim();
    const wTypes = Array.isArray(p.weaponTypes) ? p.weaponTypes : (p.reqWeapon || []);
    const primaryWpn = wTypes[0] || (u && SK.weaponTacticalProfile ? SK.weaponTacticalProfile(u).weaponType : 'FIST');

    let minR = explicit && Number.isFinite(explicit.min) ? explicit.min : def.min;
    let maxR = explicit && Number.isFinite(explicit.max) ? explicit.max : def.max;
    let shape = (explicit && explicit.shape) || def.shape;
    let radius = explicit && Number.isFinite(explicit.radius) ? explicit.radius : (p.aoe && !def.radius ? 2.6 : def.radius);
    let requiresLoS = explicit && explicit.requiresLoS != null ? !!explicit.requiresLoS : !!def.requiresLoS;
    let ignoresObstacles = !!(explicit && explicit.ignoresObstacles) || !!def.ignoresObstacles;
    let isGapCloser = !!(explicit && explicit.isGapCloser) || !!def.isGapCloser || !!p.isGapCloser;
    let isRetreat = !!(explicit && explicit.isRetreat) || !!def.isRetreat;
    let minRangePenalty = explicit && Number.isFinite(explicit.minRangePenalty) ? explicit.minRangePenalty : (def.minRangePenalty || 0);
    let source = explicit ? 'EXPLICIT_RANGE' : 'ARCH_DEFAULT';

    // 1. Semantic Technique-Driven Range Override (ปรัชญา "วิชาเหนือกว่าอาวุธ")
    if (!explicit) {
      if (/กระบี่บิน|เหินเวหา|หมื่นกระบี่|เกาทัณฑ์|ศรดาวตก|ยิงไกล|ทะลวงพันลี้|ปืนใหญ่|อุกกาบาต|ดาราร่วง|สายฟ้าฟาด/.test(nameStr)) {
        maxR = Math.max(maxR, 5.20);
        if (arch === 'snipe' || /เกาทัณฑ์|ศร/.test(nameStr)) { minR = Math.max(minR, 1.35); minRangePenalty = Math.max(minRangePenalty, 0.35); }
        requiresLoS = !/อุกกาบาต|ดาราร่วง|สายฟ้าฟาด/.test(nameStr);
        source = 'TECHNIQUE_OVERRIDE_LONG';
      } else if (/คลื่นเสียง|พิณ|ยันต์|ค่ายกล|อาคม|ลำแสง|คลื่นมังกร|คลื่นปราณ|พายุ|ซัดคลื่น|หอกโลหิต/.test(nameStr)) {
        maxR = Math.max(maxR, 3.60);
        if (/คลื่นเสียง|พิณ/.test(nameStr) && p.aoe) { shape = 'CONE'; radius = Math.max(radius, 2.8); requiresLoS = false; }
        source = 'TECHNIQUE_OVERRIDE_MID';
      } else if (/สกัดจุด|ดรรชนี|คลุกวงใน|ประชิด|ทุ่ม|กระแทกไหล่|หมัดแปดทิศ|ผลักสะท้าน|ระเบิดรอบตัว/.test(nameStr)) {
        minR = 0.0;
        maxR = Math.min(1.25, maxR);
        requiresLoS = false;
        if (/ผลัก|ระเบิดรอบตัว|สะท้านทรวง/.test(nameStr)) { shape = 'CIRCLE_SELF'; radius = Math.max(radius, 1.8); isRetreat = true; }
        source = 'TECHNIQUE_OVERRIDE_CLOSE';
      } else if (['strike', 'slash', 'flurry', 'execute', 'pierce', 'sweep'].includes(arch)) {
        // Basic martial strikes adapt to the technique's intended weapon or wielder's weapon reach
        const wSpec = SK.WEAPON_TACTICS[primaryWpn];
        if (wSpec) {
          if (wSpec.reachClass === 'RANGED_KITE' && ['strike', 'flurry'].includes(arch)) {
            maxR = Math.max(maxR, wSpec.engageRange + 0.65);
            requiresLoS = true;
            source = 'WEAPON_ADAPTED_RANGED';
          } else if (wSpec.reachClass === 'LONG_POLEARM') {
            maxR = Math.max(maxR, wSpec.engageRange + 0.15);
            source = 'WEAPON_ADAPTED_POLEARM';
          } else if (primaryWpn === 'FIST' && arch !== 'pierce') {
            maxR = Math.min(maxR, 1.25);
            source = 'WEAPON_ADAPTED_FIST';
          }
        }
      }
      if (p.acupointStrike && maxR > 2.2 && !/เข็มบิน|ดรรชนีปราณ/.test(nameStr)) {
        maxR = 1.25;
        minR = 0.0;
        source = 'ACUPOINT_CLOSE';
      }
    }

    // Target selector adjustments
    const sel = p.targetSelector || (p.composable && p.composable.targetSelector) || null;
    if (sel === 'PIERCE_LINE') { shape = 'LINE'; radius = Math.max(radius, 0.85); maxR = Math.max(maxR, 3.2); }
    else if (sel === 'RICOCHET_CHAIN') { shape = 'CHAIN'; radius = Math.max(radius, 3.0); maxR = Math.max(maxR, 3.8); }
    else if (sel === 'SPLASH_NEIGHBORS') { shape = 'CIRCLE_TARGET'; radius = Math.max(radius, 2.4); }
    else if (sel === 'SELF' || p.self) { shape = p.aoe ? 'CIRCLE_SELF' : 'SELF'; minR = 0; }
    else if (sel === 'ALL_ALLIES' || p.team) { shape = 'ALLY_TEAM'; minR = 0; maxR = Math.max(maxR, 4.5); }

    // Active Stance range modifiers (Section 2.3)
    if (u) {
      const stId = u._activeStance || u._combatStance || (u.tac && u.tac.stance);
      if (stId === 'THUNDER_STEP_STANCE' || stId === 'PUPPET_OVERDRIVE_MODE') {
        maxR += 0.55;
      } else if (stId === 'VAJRA_BASTION_STANCE' || stId === 'IRON_VAJRA_GUARD') {
        if (maxR > 2.0) maxR = Math.max(1.8, maxR - 0.25);
      }
    }

    minR = Math.max(0, +(minR).toFixed(2));
    maxR = Math.max(minR + 0.5, +(maxR).toFixed(2));
    const bandObj = SK.classifyRangeBand(maxR);
    const lockType = (shape === 'CIRCLE_TARGET' || shape === 'CONE' || shape === 'LINE') && (p.aoe || arch === 'channel') ? 'POINT' : 'UNIT';
    return {
      min: minR,
      max: maxR,
      optimal: +(minR > 0 ? Math.max(minR + 0.3, maxR * 0.78) : Math.max(0.8, maxR * 0.82)).toFixed(2),
      band: bandObj.id,
      bandIndex: bandObj.bandIndex,
      bandNameTh: bandObj.nameTh,
      shape,
      radius: +(radius || 0).toFixed(2),
      requiresLoS,
      ignoresObstacles,
      isGapCloser,
      isRetreat,
      minRangePenalty,
      lockType,
      source
    };
  };

  /* ศัตรู/ผู้ช่วยรบ: สร้างชุดวิชาที่มีระยะและบทบาทหลากหลายตามชนิด/อาวุธ/ระดับ */
  SK.foeSkills = u => {
    const species = u && JD.BEASTS && JD.BEASTS.species
      ? JD.BEASTS.species.find(s => s.id === u.speciesId || s.id === u.sp || s.nameTh === u.name)
      : null;
    const sourceProfile = (u && u.elementProfile) || (species && species.elementProfile) || null;
    const rawElement = (u && u.element) || (species && species.element) || null;
    const resolvedProfile = sourceProfile || (rawElement && rawElement !== 'NEUTRAL'
      ? { mode: 'INTRINSIC_SINGLE', primary: rawElement, weights: { [rawElement]: 1 } }
      : null);
    const mk = (arch, nameTh, tier, type, extra) => {
      const A = SK.ARCH[arch] || SK.ARCH.strike, cd = A.cd, tm = 1 + 0.12 * (tier - 1);
      const elKey = rawElement || 'NEUTRAL';
      const elDef = SK.ELEM[elKey] || SK.ELEM.NEUTRAL;
      const p = Object.assign({
        id: 'F_' + arch + '_' + nameTh, nameTh, tier, arch, archTh: A.nameTh,
        icon: A.icon, type, cd, wind: A.wind, hits: A.hits,
        elem: elKey, elemTh: elDef.nameTh,
        M: Math.round((A.hits ? A.e * (cd / 4) / A.hits * tm : 0) * 100) / 100,
        costPct: 0, pen: A.penAdd || 0, aoe: !!A.aoe, steal: A.steal || 0,
        dot: A.dot ? A.dot * (cd / 4) * tm : 0, recoil: 0, self: !!A.self, moves: []
      }, extra || {});
      if (resolvedProfile) p.elementProfile = resolvedProfile;
      if (rawElement) p.element = rawElement;
      p.range = SK.resolveMoveSpatialSpec(p, u);
      p.summary = SK.summary(p);
      return p;
    };
    const t = u ? (u.tier || 1) : 1, L = [];
    const wProf = SK.weaponTacticalProfile ? SK.weaponTacticalProfile(u) : { weaponType: 'FIST', reachClass: 'SHORT_SWIFT' };
    if (u && u.wild) {
      L.push(mk('strike', 'ตะปบกัดฉีก', t, 'p', { range: { min: 0, max: 1.45, shape: 'SINGLE' } }));
      if (t >= 3) L.push(mk('control', 'คำรามสะท้านใจ', t, 'm', { ctrl: 'stun', aoe: true, range: { min: 0, max: 2.6, shape: 'CIRCLE_SELF', radius: 2.4 } }));
      if (t >= 4) L.push(mk('burst', 'พลังอสูรบรรพกาลปะทุ', t, 'm', { aoe: true, range: { min: 0, max: 3.2, shape: 'CIRCLE_TARGET', radius: 2.4 } }));
    } else if (u && u.kind === 'beast') {
      const fam = String(u.family || (species && species.family) || '').toUpperCase();
      const nm = String(u.name || '');
      const isRangedBeast = fam === 'AVIAN' || fam === 'PLANT_SPIRIT' || /อินทรี|ครุฑ|หงส์|พ่น|บัวเพลิง|แมงมุม/.test(nm);
      L.push(mk(t >= 2 ? 'flurry' : 'strike', 'ตะปบกัดฉีก', t, 'p', { range: { min: 0, max: 1.45, shape: 'SINGLE' } }));
      if (isRangedBeast) {
        L.push(mk('snipe', 'ซัดขนศรปราณอสูร', t, 'm', { range: { min: 1.0, max: 4.5, shape: 'SINGLE', requiresLoS: true } }));
      }
      if (t >= 2) L.push(mk('dot', 'เขี้ยวพิษสังหาร', t, 'p', { dotKind: 'poison', range: { min: 0, max: 1.85, shape: 'SINGLE' } }));
      if (t >= 3) L.push(mk('control', 'คำรามสะท้านใจ', t, 'm', { ctrl: 'stun', aoe: true, range: { min: 0, max: 3.0, shape: 'CIRCLE_SELF', radius: 2.6 } }));
      if (t >= 4) L.push(mk('burst', 'พลังอสูรบรรพกาลปะทุ', t, 'm', { aoe: true, range: { min: 0, max: 3.6, shape: 'CIRCLE_TARGET', radius: 2.5 } }));
    } else {
      const wType = wProf.weaponType || 'SWORD';
      if (wType === 'BOW' || wType === 'FOCUS' || wType === 'ZITHER' || wType === 'BRUSH') {
        L.push(mk('snipe', wType === 'BOW' ? 'ศรทะลวงใจ' : 'คลื่นปราณจู่โจมไกล', t, wType === 'BOW' ? 'p' : 'm', { range: { min: 1.2, max: wType === 'BOW' ? 5.2 : 4.2, shape: 'SINGLE', requiresLoS: true } }));
        L.push(mk('strike', 'ซัดปราณป้องกันตัวระยะประชิด', Math.max(1, t - 1), 'p', { knockback: { dist: 1.4 }, range: { min: 0, max: 1.4, shape: 'SINGLE' } }));
        if (t >= 2) L.push(mk('barrage', 'ระดมซัดศรปราณ', t, wType === 'BOW' ? 'p' : 'm', { aoe: true, range: { min: 1.0, max: 4.5, shape: 'CIRCLE_TARGET', radius: 2.4, requiresLoS: true } }));
      } else if (wType === 'SPEAR' || wType === 'STAFF' || wType === 'WHIP') {
        L.push(mk('pierce', 'แทงทะลวงระยะยาว', t, 'p', { range: { min: 0, max: 2.4, shape: 'LINE', radius: 0.7 } }));
        if (t >= 2) L.push(mk('sweep', 'กวาดศาสตราสกัดทัพ', t, 'p', { aoe: true, range: { min: 0, max: 2.3, shape: 'CIRCLE_SELF', radius: 2.3 } }));
        if (t >= 3) L.push(mk('charge', 'พุ่งหอกทะลวงค่าย', t, 'p', { range: { min: 0.8, max: 3.8, shape: 'LINE', isGapCloser: true } }));
      } else {
        L.push(mk('strike', 'ฟันสะบั้นคม', t, 'p', { range: { min: 0, max: 1.75, shape: 'SINGLE' } }));
        if (t >= 2) L.push(mk('pierce', 'ปราณกระบี่ทะลวงเกราะ', t, 'p', { range: { min: 0, max: 2.6, shape: 'SINGLE' } }));
        if (t >= 3) L.push(mk('sweep', 'คลื่นดาบกวาดสมรภูมิ', t, 'p', { aoe: true, range: { min: 0, max: 2.4, shape: 'CIRCLE_SELF', radius: 2.4 } }));
        if (t >= 3 && (u && (u.boss || u.isSwornAlly || t >= 4))) {
          L.push(mk('snipe', 'ปราณกระบี่เหินเวหา', t, 'm', { range: { min: 1.0, max: 4.8, shape: 'SINGLE', requiresLoS: true } }));
        }
      }
      if (u && u.role === 'healer') {
        L.push(mk('heal', 'โอสถปราณฟื้นฟูสหาย', t, 'm', { heal: 0.20, range: { min: 0, max: 4.2, shape: 'ALLY' } }));
      }
    }
    return L;
  };

  /* ---------- Weapon Reach & Tactical Counter-Stance Authority (v2.0.5 Pillar B) ---------- */
  SK.HEAVY_FIST_SUBPATHS = ['VAJRA_BODHI', 'TITAN_MOUNTAIN_BODY', 'TIGER_SOVEREIGN', 'BLOOD_DRAGON', 'DEVOURING_FIEND', 'SOLAR_FORGE', 'THUNDER_BODY', 'HEAVEN_DEVOURING_DEMON', 'GOLDEN_ARHAT_STAFF', 'HEAVENLY_GOLEM', 'BEAST_CHIMERA_MECH', 'IRON_COLOSSUS', 'SYMBIOTIC_BEAST_WARRIOR', 'SYMBIOTIC_FANG_FUSION', 'COLOSSUS_SHIELD_TAMER', 'PRIMORDIAL_BLOOD_MUTATOR', 'PRIMORDIAL_BLOOD_AWAKENER'];
  SK.WEAPON_TACTICS = {
    SPEAR: {
      weaponType: 'SPEAR',
      reachClass: 'LONG_POLEARM',
      engageRange: 2.35,
      nameTh: 'ทวนยาวชิงจังหวะเปิดศึก',
      stanceTh: 'ตั้งทวนสกัดระยะประชิด',
      firstStrikeMult: 1.12,
      firstStrikeAcc: 10,
      counteredByTh: 'วิชาตัวเบา (LIGHTNESS_ART / MOVEMENT_TECHNIQUE) หรือท่าพุ่งทะลวงประชิด',
      descTh: 'ได้เปรียบชิงลงมือก่อน (+12% ดาเมจ, +10 แม่นยำ) เมื่อปะทะอาวุธสั้น เว้นแต่ศัตรูใช้วิชาตัวเบาหรือท่าพุ่งประชิดแก้ทาง'
    },
    STAFF: {
      weaponType: 'STAFF',
      reachClass: 'LONG_POLEARM',
      engageRange: 2.25,
      nameTh: 'พลองยาวกวาดสกัดระยะ',
      stanceTh: 'ควงพลองคุมวงรอบทิศ',
      firstStrikeMult: 1.10,
      firstStrikeAcc: 8,
      counteredByTh: 'วิชาตัวเบา (LIGHTNESS_ART / MOVEMENT_TECHNIQUE) หรือท่าพุ่งทะลวงประชิด',
      descTh: 'ได้เปรียบชิงลงมือก่อน (+10% ดาเมจ, +8 แม่นยำ) ต่ออาวุธสั้น เว้นแต่ถูกวิชาตัวเบาพุ่งทะลวงเข้าวงใน'
    },
    BOW: {
      weaponType: 'BOW',
      reachClass: 'RANGED_KITE',
      engageRange: 2.85,
      nameTh: 'เกาทัณฑ์ยิงสกัดทิ้งระยะ',
      stanceTh: 'ล่าถอยยิงสกัดระยะไกล (Kiting)',
      kiteDmgMult: 1.14,
      kiteCritAdd: 6,
      kiteAccAdd: 10,
      counteredByTh: 'ท่าพุ่งทะลวง (charge/evade) หรือวิชาตัวเบาประชิดตัว',
      descTh: 'รักษาความได้เปรียบระยะไกล (+14% ดาเมจ, +6% คริ) จนกว่าจะถูกท่าพุ่งประชิดหรือวิชาตัวเบาเข้าถึงตัว'
    },
    FOCUS: {
      weaponType: 'FOCUS',
      reachClass: 'RANGED_KITE',
      engageRange: 2.65,
      nameTh: 'สื่อปราณคุมระยะค่ายกล',
      stanceTh: 'โคจรปราณทิ้งระยะร่ายวิชา (Kiting)',
      kiteDmgMult: 1.12,
      kiteCritAdd: 5,
      kiteAccAdd: 8,
      counteredByTh: 'ท่าพุ่งทะลวง (charge/evade) หรือวิชาตัวเบาประชิดตัว',
      descTh: 'ได้เปรียบเมื่อรักษาระยะห่างร่ายวิชา (+12% ดาเมจ, +5% คริ) จนกว่าศัตรูจะพุ่งเข้าประชิดตัว'
    },
    BLADE: {
      weaponType: 'BLADE',
      reachClass: 'HEAVY_BREAKER',
      engageRange: 1.75,
      nameTh: 'ดาบหนักผ่าเกราะทลายโล่',
      stanceTh: 'ฟาดฟันหนักหน่วงทลายปราการ',
      shieldBreakMult: 1.45,
      guardShatterDmgMult: 1.15,
      guardShatterPenAdd: 14,
      counteredByTh: 'ศาสตรายาวคุมระยะ (SPEAR/STAFF) หรือการยิงสกัดระยะไกล',
      descTh: 'ได้เปรียบทลายโล่และวิชาตั้งรับ (DEFENSIVE_TECHNIQUE) รุนแรงขึ้น (+15% ดาเมจ, +14% เจาะเกราะ, ทำลายโล่ ×1.45)'
    },
    FIST: {
      weaponType: 'FIST',
      reachClass: 'SHORT_SWIFT',
      engageRange: 1.7,
      nameTh: 'หมัดฝ่ามือประชิด/วัชระทลายเกราะ',
      stanceTh: 'คลุกวงใน/หมัดหนักทลายโล่',
      shieldBreakMult: 1.40,
      guardShatterDmgMult: 1.14,
      guardShatterPenAdd: 12,
      gapCloserMult: 1.10,
      counteredByTh: 'ศาสตรายาวหากไร้เคล็ดวิชาตัวเบาช่วยพุ่งเข้าวงใน',
      descTh: 'สายกายา/วัชระได้รับโบนัสทลายโล่และวิชาตั้งรับ; สายว่องไวคลุกวงในแก้ทางอาวุธยาวและระยะไกล'
    },
    SWORD: {
      weaponType: 'SWORD',
      reachClass: 'SHORT_SWIFT',
      engageRange: 1.8,
      nameTh: 'กระบี่พลิ้วไหวทะลวงช่องว่าง',
      stanceTh: 'กระบี่เร็วฝ่าวงล้อมประชิดตัว',
      gapCloserMult: 1.10,
      gapCloserAcc: 8,
      counteredByTh: 'ศาสตรายาวชิงจังหวะแรกหากไม่มีวิชาตัวเบาหนุน',
      descTh: 'คล่องตัวสูง ประสานวิชาตัวเบาพุ่งฝ่าระยะหอกและธนูเพื่อชิงความได้เปรียบระยะประชิด (+10% ดาเมจเมื่อแก้ทาง)'
    },
    ZITHER: {
      weaponType: 'ZITHER',
      reachClass: 'RANGED_KITE',
      engageRange: 2.75,
      nameTh: 'พิณคีตเวทย์ส่งคลื่นเสียงสะกดระยะไกล',
      stanceTh: 'บรรเลงคีตเวทย์รักษาระยะห่าง (Kiting)',
      kiteDmgMult: 1.13,
      kiteCritAdd: 5,
      kiteAccAdd: 9,
      counteredByTh: 'ท่าพุ่งทะลวง (charge/evade) หรือวิชาตัวเบาประชิดตัว',
      descTh: 'แผ่คลื่นเสียงคีตเวทย์โจมตีจากระยะไกล (+13% ดาเมจ, +5% คริ, +9 แม่นยำ) จนกว่าศัตรูจะพุ่งเข้าประชิดตัว'
    },
    BRUSH: {
      weaponType: 'BRUSH',
      reachClass: 'RANGED_KITE',
      engageRange: 2.65,
      nameTh: 'พู่กันอาคมวาดอักขระสกัดระยะ',
      stanceTh: 'ตวัดพู่กันจารึกยันต์คุมระยะ (Kiting)',
      kiteDmgMult: 1.12,
      kiteCritAdd: 5,
      kiteAccAdd: 10,
      counteredByTh: 'ท่าพุ่งทะลวง (charge/evade) หรือวิชาตัวเบาประชิดตัว',
      descTh: 'วาดอักขระและซัดยันต์สกัดจากระยะกลาง-ไกล (+12% ดาเมจ, +5% คริ, +10 แม่นยำ) จนกว่าจะถูกประชิดตัว'
    },
    WHIP: {
      weaponType: 'WHIP',
      reachClass: 'LONG_POLEARM',
      engageRange: 2.40,
      nameTh: 'แส้และด้ายปราณกวาดพันธนาการระยะยาว',
      stanceTh: 'สะบัดแส้และขึงด้ายปราณสกัดการบุก',
      firstStrikeMult: 1.13,
      firstStrikeAcc: 10,
      counteredByTh: 'วิชาตัวเบา (LIGHTNESS_ART / MOVEMENT_TECHNIQUE) หรือท่าพุ่งทะลวงประชิด',
      descTh: 'ใช้ระยะแส้และเส้นไหมปราณชิงลงมือก่อนอาวุธสั้น (+13% ดาเมจ, +10 แม่นยำ) เว้นแต่ศัตรูใช้วิชาตัวเบาฝ่าวงล้อม'
    },
    ROSARY: {
      weaponType: 'ROSARY',
      reachClass: 'RANGED_KITE',
      engageRange: 2.45,
      nameTh: 'ลูกประคำบารมีธรรมสะกดมาร',
      stanceTh: 'โคจรประคำทองคำคุ้มกายและซัดคลื่นธรรม',
      kiteDmgMult: 1.12,
      kiteCritAdd: 5,
      kiteAccAdd: 10,
      counteredByTh: 'ท่าพุ่งทะลวง (charge/evade) หรือการคลุกวงในประชิด',
      descTh: 'หมุนลูกประคำบารมีธรรมสร้างรัศมีป้องกันและซัดปราณระยะกลาง-ไกล (+12% ดาเมจ, +5% คริ, +10 แม่นยำ)'
    },
    CLAW: {
      weaponType: 'CLAW',
      reachClass: 'SHORT_SWIFT',
      engageRange: 1.65,
      nameTh: 'กรงเล็บอสูรฉีกกระชากระยะประชิด',
      stanceTh: 'พุ่งขย้ำจุดตายและฉีกเกราะป้องกัน',
      gapCloserMult: 1.14,
      gapCloserAcc: 10,
      shieldBreakMult: 1.35,
      counteredByTh: 'ศาสตรายาวคุมระยะหากไม่มีท่าร่างพุ่งเข้าวงใน',
      descTh: 'จู่โจมระยะประชิดด้วยความเร็วสูงและฉีกกระชากเกราะ (+14% ดาเมจเมื่อพุ่งเข้าวงใน, ทำลายโล่ ×1.35)'
    },
    NEEDLE: {
      weaponType: 'NEEDLE',
      reachClass: 'RANGED_KITE',
      engageRange: 2.60,
      nameTh: 'เข็มวิญญาณและเข็มพิษสกัดจุด',
      stanceTh: 'ซัดเข็มปราณล่องหนสะกดจุดชีพจรระยะไกล',
      kiteDmgMult: 1.13,
      kiteCritAdd: 7,
      kiteAccAdd: 12,
      counteredByTh: 'ม่านคุ้มกันปราณหนาแน่นหรือการพุ่งเข้าประชิดตัว',
      descTh: 'ซัดเข็มพิษและเข็มวิญญาณเจาะจุดชีพจรอย่างแม่นยำ (+13% ดาเมจ, +7% คริ, +12 แม่นยำ)'
    },
    FAN: {
      weaponType: 'FAN',
      reachClass: 'RANGED_KITE',
      engageRange: 2.55,
      nameTh: 'พัดยุทธและพัดเทวพายุโบกสะบัด',
      stanceTh: 'โบกพัดเรียกคลื่นวายุและเบี่ยงวิถีศาสตรา',
      kiteDmgMult: 1.13,
      kiteCritAdd: 6,
      kiteAccAdd: 9,
      counteredByTh: 'อาวุธหนักทะลวงคลื่นลมหรือท่าพุ่งประชิด',
      descTh: 'โบกพัดส่งคลื่นวายุและปราณธาตุโจมตีระยะไกล (+13% ดาเมจ, +6% คริ, +9 แม่นยำ)'
    },
    ASTROLABE: {
      weaponType: 'ASTROLABE',
      reachClass: 'RANGED_KITE',
      engageRange: 2.75,
      nameTh: 'จานดวงดาวและหลัวผานธรณีคุมสมรภูมิ',
      stanceTh: 'หมุนจานดวงดาวคำนวณค่ายกลและแรงโน้มถ่วงระยะไกล',
      kiteDmgMult: 1.14,
      kiteCritAdd: 6,
      kiteAccAdd: 11,
      counteredByTh: 'ท่าพุ่งทะลวงเข้าประชิดตัว',
      descTh: 'ใช้จานดวงดาวและหลัวผานธรณีควบคุมสนามรบจากระยะไกล (+14% ดาเมจ, +6% คริ, +11 แม่นยำ)'
    },
    ABACUS: {
      weaponType: 'ABACUS',
      reachClass: 'HEAVY_BREAKER',
      engageRange: 2.15,
      nameTh: 'ลูกคิดทองคำดีดเม็ดปราณทลายเกราะ',
      stanceTh: 'ดีดลูกคิดคำนวณจุดอ่อนและกระแทกทลายโล่',
      shieldBreakMult: 1.42,
      guardShatterDmgMult: 1.14,
      guardShatterPenAdd: 14,
      counteredByTh: 'ศาสตรายาวหรือการยิงสกัดจากระยะไกลสุด',
      descTh: 'คำนวณช่องโหว่และดีดเม็ดลูกคิดทองคำทลายโล่ป้องกัน (+14% ดาเมจ, +14% เจาะเกราะ, ทำลายโล่ ×1.42)'
    }
  };

  SK.hasLightnessOrGapCloser = u => {
    if (!u || u.foe) return false;
    if (g.STATS && g.STATS.has(u, 'evadeUp')) return true;
    const c = u.cult;
    if (!c || !Array.isArray(c.techs)) return false;
    for (let i = 0; i < c.techs.length; i++) {
      const t = CULT.tech(c.techs[i]);
      if (!t) continue;
      if (t.cat === 'MOVEMENT_TECHNIQUE' || t.cat === 'LIGHTNESS_ART' || (t.cat === 'AUXILIARY_ART' && t.role === 'MOVEMENT_STEALTH_RECON')) return true;
    }
    return false;
  };

  SK.hasDefensiveTech = u => {
    if (!u || u.foe) return false;
    if (g.STATS && (g.STATS.has(u, 'guardUp') || g.STATS.has(u, 'shield'))) return true;
    const c = u.cult;
    if (!c || !Array.isArray(c.techs)) return false;
    for (let i = 0; i < c.techs.length; i++) {
      const t = CULT.tech(c.techs[i]);
      if (t && t.cat === 'DEFENSIVE_TECHNIQUE') return true;
    }
    return false;
  };

  SK.inferFoeWeaponType = u => {
    if (!u || u.wild) return 'FIST';
    if (u.weaponType && SK.WEAPON_TACTICS[u.weaponType]) return u.weaponType;
    if (u.equip && u.equip.WEAPON) {
      const gt = u.equip.WEAPON.gearType || (g.MARTIAL && g.MARTIAL.gearType ? g.MARTIAL.gearType(u.equip.WEAPON) : null);
      if (gt && SK.WEAPON_TACTICS[gt]) return gt;
    }
    if (u.kind === 'beast' || u.isGateBeast || u.wild) {
      const fam = String(u.family || '').toUpperCase();
      const nm = String(u.name || u.nameTh || '');
      if (fam === 'AVIAN' || /อินทรี|ครุฑ|หงส์|วิหค/.test(nm)) return 'BOW';
      if (fam === 'SERPENT' || /งู|เหลือม|อสรพิษ|เถาวัลย์/.test(nm)) return 'WHIP';
      if (fam === 'SHELL' || fam === 'URSINE' || /เต่า|หมี|กระทิง|คชสาร|ศิลา/.test(nm) || u.fourSymbol === 'BLACK_TORTOISE') return 'BLADE';
      return 'FIST';
    }
    const nm = String(u.name || u.nameTh || '');
    if (/ธนู|เกาทัณฑ์|ซุ่มยิง/.test(nm)) return 'BOW';
    if (/พิณ|สังคีต|คีต/.test(nm)) return 'ZITHER';
    if (/พู่กัน|อักขระ|ยันต์|ค่ายกล/.test(nm)) return 'BRUSH';
    if (/แส้|ด้าย|หุ่นเชิด/.test(nm)) return 'WHIP';
    if (/ทวน|หอก|ง้าว/.test(nm)) return 'SPEAR';
    if (/พลอง|กระบอง|อรหันต์/.test(nm)) return 'STAFF';
    if (/ดาบ|ผ่า/.test(nm)) return 'BLADE';
    if (/กระบี่/.test(nm)) return 'SWORD';
    if (/เวท|ดารา|ปราณ|โอสถ/.test(nm)) return 'FOCUS';
    // Deterministic weapon assignment for human raiders/bandits without explicit weaponType
    if (u.id && typeof u.id === 'string') {
      const h = hash(u.id + ':' + nm);
      const pool = u.boss ? ['SWORD', 'BLADE', 'SPEAR', 'FOCUS', 'BOW'] : ['BLADE', 'SWORD', 'SPEAR', 'FIST', 'BOW', 'STAFF'];
      return pool[h % pool.length];
    }
    return 'FIST';
  };

  SK.weaponTacticalProfile = u => {
    if (!u) {
      return { weaponType: 'FIST', reachClass: 'SHORT_SWIFT', engageRange: 1.7, isHeavyFist: false, hasLightness: false, hasDefenseTech: false, spec: SK.WEAPON_TACTICS.FIST };
    }
    const eqW = u.equip ? u.equip.WEAPON : (u.weaponType || null);
    const stc = u._activeStance || u._combatStance || '';
    const cSub = (u.cult && u.cult.sub) || u.subPath || 'NONE';
    const cPath = (u.cult && u.cult.path) || u.path || 'NONE';
    const tl = (u.cult && u.cult.techs) ? u.cult.techs.length : (u.skl ? u.skl.length : 0);
    const wtc = u._wpTacCache;
    if (wtc && wtc.eqW === eqW && wtc.stc === stc && wtc.cSub === cSub && wtc.cPath === cPath && wtc.tl === tl && wtc.pver === (u._passVer || 0)) return wtc.out;
    const wType = u.foe
      ? SK.inferFoeWeaponType(u)
      : ((g.MARTIAL && g.MARTIAL.equippedType) ? g.MARTIAL.equippedType(u) : (u.weaponType || 'FIST'));
    const sub = (u.cult && u.cult.sub) || u.subPath || 'NONE';
    const path = (u.cult && u.cult.path) || u.path || 'NONE';
    const isHeavyFist = wType === 'FIST' && (path === 'BODY' || SK.HEAVY_FIST_SUBPATHS.includes(sub) || (u.foe && (u.fourSymbol === 'BLACK_TORTOISE' || u.bloodlineTrait === 'IRON_CARAPACE')));
    const baseSpec = SK.WEAPON_TACTICS[wType] || SK.WEAPON_TACTICS.FIST;
    const reachClass = isHeavyFist ? 'HEAVY_BREAKER' : baseSpec.reachClass;
    const hasLightness = u.foe ? !!(u.hasLightness || (u.skl && u.skl.some(s => s.arch === 'charge' || s.arch === 'blink' || s.arch === 'evade'))) : SK.hasLightnessOrGapCloser(u);
    const hasDefenseTech = u.foe ? !!(u.hasDefenseTech || u.fourSymbol === 'BLACK_TORTOISE' || (u.skl && u.skl.some(s => s.arch === 'guard' || s.arch === 'shield'))) : SK.hasDefensiveTech(u);
    const stanceSpec = (!u.foe && g.STATS && g.STATS.getActiveStanceSpec) ? g.STATS.getActiveStanceSpec(u) : null;
    const stanceRangeDelta = (u._activeStance === 'THUNDER_STEP_STANCE' || u._activeStance === 'PUPPET_OVERDRIVE_MODE') ? 0.55 : 0;
    const engageRange = +((baseSpec.engageRange || 1.7) + stanceRangeDelta).toFixed(2);
    const bandObj = SK.classifyRangeBand(engageRange);
    const resObj = {
      weaponType: wType,
      reachClass,
      engageRange,
      rangeBand: bandObj.id,
      rangeBandNameTh: bandObj.nameTh,
      isHeavyFist,
      hasLightness,
      hasDefenseTech,
      activeStance: stanceSpec ? stanceSpec.id : null,
      nameTh: isHeavyFist ? 'หมัดวัชระทลายปราการ' : baseSpec.nameTh,
      stanceTh: isHeavyFist ? 'หมัดหนักทลายโล่และเกราะคุ้มกาย' : baseSpec.stanceTh,
      counteredByTh: baseSpec.counteredByTh,
      descTh: baseSpec.descTh,
      spec: baseSpec
    };
    u._wpTacCache = { eqW, stc, cSub, cPath, tl, pver: u._passVer || 0, out: resObj };
    return resObj;
  };

  /* ---------- Composable Effect, Stance, Fusion & Keyword Authority (v2.0.35) ---------- */
  SK.STANCE_CATALOG = Object.freeze({
    STAR_SWORD_STANCE: {
      id: 'STAR_SWORD_STANCE',
      nameTh: 'ท่ากระบี่ดารา',
      icon: '🌠',
      p: { matk: 0.18, acc: 0.10 },
      f: { crit: 12 },
      descTh: 'โจมตีวิชา +18%, คริติคอล +12%, แม่นยำ +10%'
    },
    VAJRA_BASTION_STANCE: {
      id: 'VAJRA_BASTION_STANCE',
      nameTh: 'ท่าปราการวัชระ',
      icon: '🛡️',
      p: { def: 0.25, mdef: 0.20, move: -0.10 },
      f: {},
      descTh: 'พลังป้องกันกายภาพ +25%, ป้องกันวิชา +20%, สปีดเคลื่อนที่ -10%'
    },
    SHADOW_REAPER_STANCE: {
      id: 'SHADOW_REAPER_STANCE',
      nameTh: 'ท่าเงาสังหาร',
      icon: '🌑',
      p: { eva: 0.22 },
      f: { pen: 15, crit: 8, critDmg: 18 },
      descTh: 'หลบหลีก +22%, เจาะเกราะ +15%, เพิ่มโอกาสโจมตีจุดตาย'
    },
    LOTUS_MERCY_STANCE: {
      id: 'LOTUS_MERCY_STANCE',
      nameTh: 'ท่าบัวการุญ',
      icon: '🪷',
      p: { atk: -0.08, matk: -0.08, mdef: 0.15 },
      f: {},
      qiRegenBonus: 0.20,
      healOutBonus: 0.25,
      descTh: 'อัตราฟื้นฟูปราณ +20%, พลังรักษาเพื่อน +25%, พลังโจมตี -8%'
    },
    THUNDER_STEP_STANCE: {
      id: 'THUNDER_STEP_STANCE',
      nameTh: 'ท่าย่างก้าวอัสนี',
      icon: '⚡',
      p: { cast: 0.20, eva: 0.18, move: 0.25 },
      f: { cast: 20, move: 25 },
      descTh: 'ความเร็วร่าย +20%, หลบหลีก +18%, ความเร็วเคลื่อนที่ +25%'
    },
    BLOOD_ASURA_STANCE: {
      id: 'BLOOD_ASURA_STANCE',
      nameTh: 'ท่าอสูรโลหิต',
      icon: '🩸',
      p: { atk: 0.22, matk: 0.22, def: -0.12, mdef: -0.12 },
      f: {},
      lifestealBonus: 0.15,
      descTh: 'ดูดเลือด +15%, พลังโจมตี +22%, พลังป้องกัน -12%'
    },
    QIMEN_ARRAY_STANCE: {
      id: 'QIMEN_ARRAY_STANCE',
      nameTh: 'ท่าค่ายกลฉีเหมิน',
      icon: '☯️',
      p: { def: 0.15, mdef: 0.18 },
      f: {},
      shieldBonus: 0.20,
      ctrlResistBonus: 0.30,
      descTh: 'เพิ่มความแข็งแกร่งของโล่ +20%, ต้านทานสถานะผิดปกติ +30%'
    },
    // Aliases for cross-compatibility
    SWORD_INTENT_FLOW: { id: 'SWORD_INTENT_FLOW', aliasOf: 'STAR_SWORD_STANCE', nameTh: 'ท่าเจตจำนงกระบี่ไหลเวียน', icon: '🗡️', p: { matk: 0.18, acc: 0.10 }, f: { crit: 12 } },
    IRON_VAJRA_GUARD: { id: 'IRON_VAJRA_GUARD', aliasOf: 'VAJRA_BASTION_STANCE', nameTh: 'ท่าปราการเหล็กวัชระ', icon: '🛡️', p: { def: 0.25, mdef: 0.20, move: -0.10 }, f: {} },
    BLOOD_FRENZY_POSTURE: { id: 'BLOOD_FRENZY_POSTURE', aliasOf: 'BLOOD_ASURA_STANCE', nameTh: 'ท่าโลหิตคลั่งสังหาร', icon: '🩸', p: { atk: 0.22, matk: 0.22, def: -0.12, mdef: -0.12 }, f: {}, lifestealBonus: 0.15 },
    ASTRAL_DIVINATION_STANCE: { id: 'ASTRAL_DIVINATION_STANCE', aliasOf: 'QIMEN_ARRAY_STANCE', nameTh: 'ท่าพยากรณ์ดาราฉีเหมิน', icon: '🌌', p: { def: 0.15, mdef: 0.18 }, f: {}, shieldBonus: 0.20, ctrlResistBonus: 0.30 },
    PUPPET_OVERDRIVE_MODE: { id: 'PUPPET_OVERDRIVE_MODE', aliasOf: 'THUNDER_STEP_STANCE', nameTh: 'ท่าหุ่นเชิดเร่งพิกัด', icon: '⚙️', p: { cast: 0.20, eva: 0.18, move: 0.25 }, f: { cast: 20, move: 25 } },
    KARMA_MIRROR_STANCE: { id: 'KARMA_MIRROR_STANCE', aliasOf: 'LOTUS_MERCY_STANCE', nameTh: 'ท่ากระจกสะท้อนกรรม', icon: '☸️', p: { atk: -0.08, matk: -0.08, mdef: 0.15 }, f: {}, qiRegenBonus: 0.20, healOutBonus: 0.25 }
  });

  SK.normalizeTrigger = triggerKind => {
    if (!triggerKind) return '';
    const raw = String(triggerKind).trim();
    const lower = raw.toLowerCase().replace(/_/g, '');
    const map = {
      onhit: 'onHit',
      onstruck: 'onStruck',
      onbeinghit: 'onStruck',
      oncrit: 'onCrit',
      ondodge: 'onDodge',
      onparry: 'onParry',
      onkill: 'onKill',
      onheal: 'onHeal',
      oncast: 'onCast',
      onshieldbreak: 'onShieldBreak',
      onstatusapply: 'onStatusApply',
      onlowhp: 'onLowHp',
      onallylowhp: 'onLowHp',
      onstanceswitch: 'onStanceSwitch',
      combattick: 'combatTick',
      oncombattick: 'combatTick',
      onturnstart: 'onRoundStart',
      onroundstart: 'onRoundStart',
      onturnend: 'onRoundEnd',
      onroundend: 'onRoundEnd',
      onallyfall: 'onAllyFall',
      onenemyfall: 'onEnemyFall',
      ondebuffresisted: 'onDebuffResisted',
      onskillcooldownready: 'onSkillCooldownReady',
      oncombochainn: 'onComboChainN',
      onfirststrike: 'onFirstStrike',
      onenterrealm: 'onEnterRealm',
      onleaverealm: 'onLeaveRealm',
      onbreakthroughsuccess: 'onBreakthroughSuccess',
      onbreakthroughfail: 'onBreakthroughFail',
      onpillconsumed: 'onPillConsumed',
      onitemcrafted: 'onItemCrafted',
      ondawn: 'onDawn',
      ondusk: 'onDusk',
      ontrielementtrigger: 'onTriElementTrigger',
      ontetraelementtrigger: 'onTetraElementTrigger',
      onconsumableuse: 'onPillConsumed',
      onbreakthroughattempt: 'onBreakthroughSuccess',
      outofcombatcultivate: 'outOfCombatCultivate',
      outofcombatcraft: 'outOfCombatCraft',
      outofcombatexplore: 'outOfCombatExplore',
      onweathersync: 'onWeatherSync',
      onaurapulse: 'onAuraPulse',
      oncontractbreach: 'onContractBreach',
      ongravityshift: 'onGravityShift',
      onbeastshift: 'onBeastShift',
      onstaralign: 'onStarAlign',
      onmeritlotus: 'onMeritLotus',
      onvoidblink: 'onVoidBlink',
      onguincubate: 'onGuIncubate',
      ontemporalrewind: 'onTemporalRewind',
      onliteratiedict: 'onLiteratiEdict',
      onmarionettetether: 'onMarionetteTether',
      onchaostransmute: 'onChaosTransmute',
      onleylinepulse: 'onLeylinePulse',
      onwayfarerstep: 'onWayfarerStep',
      oniaidraw: 'onIaiDraw',
      onshadowclonehit: 'onShadowCloneHit',
      onmudracomplete: 'onMudraComplete',
      ondeitysummon: 'onDeitySummon',
      onavatardescent: 'onAvatarDescent',
      oncosmicborrow: 'onCosmicBorrow',
      onsanitysacrifice: 'onSanitySacrifice',
      onvowinvoke: 'onVowInvoke',
      onorgandevour: 'onOrganDevour',
      ongraveresonance: 'onGraveResonance'
    };
    return map[lower] || raw.toLowerCase().replace(/^on_?/, 'on');
  };

  SK.COMPOSABLE_KEYWORDS = Object.freeze({
    TRIGGERS: Object.freeze([
      'ON_CAST', 'ON_HIT', 'ON_CRIT', 'ON_STRUCK', 'ON_BEING_HIT', 'ON_DODGE', 'ON_PARRY',
      'ON_KILL', 'ON_HEAL', 'ON_SHIELD_BREAK', 'ON_STATUS_APPLY',
      'ON_LOW_HP', 'ON_ALLY_LOW_HP', 'ON_STANCE_SWITCH', 'COMBAT_TICK',
      'ON_TURN_START', 'ON_TURN_END', 'ON_ROUND_START', 'ON_ROUND_END',
      'ON_ALLY_FALL', 'ON_ENEMY_FALL', 'ON_DEBUFF_RESISTED', 'ON_SKILL_COOLDOWN_READY',
      'ON_COMBO_CHAIN_N', 'ON_FIRST_STRIKE', 'ON_ENTER_REALM', 'ON_LEAVE_REALM',
      'ON_BREAKTHROUGH_SUCCESS', 'ON_BREAKTHROUGH_FAIL', 'ON_PILL_CONSUMED', 'ON_ITEM_CRAFTED',
      'ON_DAWN', 'ON_DUSK', 'ON_TRI_ELEMENT_TRIGGER', 'ON_TETRA_ELEMENT_TRIGGER',
      'ON_CONSUMABLE_USE', 'ON_BREAKTHROUGH_ATTEMPT',
      'OUT_OF_COMBAT_CULTIVATE', 'OUT_OF_COMBAT_CRAFT', 'OUT_OF_COMBAT_EXPLORE',
      'onHit', 'onStruck', 'combatTick', 'onCrit', 'onDodge', 'onParry', 'onCast',
      'onKill', 'onHeal', 'onShieldBreak', 'onLowHp', 'onStanceSwitch', 'onStatusApply',
      'onRoundStart', 'onRoundEnd', 'onAllyFall', 'onEnemyFall', 'onDebuffResisted',
      'onSkillCooldownReady', 'onComboChainN', 'onFirstStrike',
      'ON_WEATHER_SYNC', 'ON_AURA_PULSE', 'ON_CONTRACT_BREACH', 'ON_GRAVITY_SHIFT', 'ON_BEAST_SHIFT',
      'ON_STAR_ALIGN', 'ON_MERIT_LOTUS', 'ON_VOID_BLINK', 'ON_GU_INCUBATE', 'ON_TEMPORAL_REWIND',
      'ON_LITERATI_EDICT', 'ON_MARIONETTE_TETHER', 'ON_CHAOS_TRANSMUTE', 'ON_LEYLINE_PULSE', 'ON_WAYFARER_STEP',
      'onWeatherSync', 'onAuraPulse', 'onContractBreach', 'onGravityShift', 'onBeastShift',
      'onStarAlign', 'onMeritLotus', 'onVoidBlink', 'onGuIncubate', 'onTemporalRewind',
      'onLiteratiEdict', 'onMarionetteTether', 'onChaosTransmute', 'onLeylinePulse', 'onWayfarerStep',
      'ON_IAI_DRAW', 'ON_SHADOW_CLONE_HIT', 'ON_MUDRA_COMPLETE', 'ON_DEITY_SUMMON', 'ON_AVATAR_DESCENT',
      'ON_COSMIC_BORROW', 'ON_SANITY_SACRIFICE', 'ON_VOW_INVOKE', 'ON_ORGAN_DEVOUR', 'ON_GRAVE_RESONANCE',
      'onIaiDraw', 'onShadowCloneHit', 'onMudraComplete', 'onDeitySummon', 'onAvatarDescent',
      'onCosmicBorrow', 'onSanitySacrifice', 'onVowInvoke', 'onOrganDevour', 'onGraveResonance'
    ]),
    TARGET_SELECTORS: Object.freeze([
      'SELF', 'SINGLE_ENEMY', 'SINGLE_PRIMARY', 'ALL_ENEMIES', 'ROW_FRONT', 'ROW_BACK',
      'LOWEST_HP_ENEMY', 'HIGHEST_ATK_ENEMY', 'MOST_DEBUFFED_ENEMY',
      'MARKED_ENEMIES', 'SPLASH_NEIGHBORS', 'RICOCHET_CHAIN', 'PIERCE_LINE', 'RANDOM_BOUNCE_3',
      'ALL_ALLIES', 'LOWEST_HP_ALLY', 'SAME_PATH_ALLIES', 'SUMMON_OR_PUPPET', 'SUMMON_UNITS'
    ]),
    CONDITIONS: Object.freeze([
      'ALWAYS', 'TARGET_HAS_MARK', 'TARGET_HAS_DEBUFF', 'TARGET_HAS_BUFF',
      'TARGET_HP_BELOW_PCT', 'TARGET_HP_ABOVE_PCT', 'SELF_HP_BELOW_PCT',
      'SELF_QI_ABOVE_PCT', 'SELF_HAS_STANCE', 'SELF_HAS_COMBO_READY',
      'SELF_HAS_TOXICITY', 'SAME_PEAK_ALLY_PRESENT', 'ELEMENT_RESONANCE_ACTIVE',
      // Section 10.2 New Conditions
      'TARGET_IS_ELEMENT', 'TARGET_HAS_STATUS_COUNT_GTE', 'SELF_HAS_BUFF',
      'ALLY_COUNT_ALIVE_GTE', 'ENEMY_COUNT_ALIVE_GTE', 'ROUND_NUMBER_GTE',
      'WEATHER_IS', 'TIME_OF_DAY_IS', 'LOCATION_TAG_IS',
      'SELF_HEART_DEMON_ABOVE_PCT', 'SELF_TOXICITY_ABOVE_PCT',
      'WIELDING_WEAPON_TYPE', 'FIRST_STRIKE_IN_FIGHT', 'TARGET_IS_BOSS_OR_ELITE',
      'COMPANION_PRESENT', 'MENTOR_OR_DISCIPLE_PRESENT'
    ]),
    ACTIONS: Object.freeze([
      'APPLY_MARK', 'DETONATE_MARK', 'STACK_THRESHOLD_BURST',
      'STANCE_ENTER', 'SET_STANCE', 'COMBO_PRIMER', 'COMBO_FINISHER', 'DELAYED_ECHO',
      'EXTEND_DEBUFF', 'TRANSFER_DEBUFF', 'TRANSFER_DEBUFF_TO_ENEMY', 'STEAL_BUFF', 'CONVERT_BUFF_TO_DEBUFF',
      'ABSORB_DOT_TO_SHIELD', 'ELEMENTAL_FUSION_REACTION',
      'HP_TO_QI_OVERDRIVE', 'QI_TO_SHIELD_BARRIER', 'OVERHEAT_COOLDOWN_TRADE',
      'TOXICITY_TO_VENOM_POWER', 'HEART_DEMON_EDGE_SCALING',
      'SOUL_LINK_SHARE_DMG', 'CHAIN_TETHER_ENEMY', 'PUPPET_SYMBIOSIS_PULSE',
      'GRANT_BUFF', 'GRANT_BARRIER', 'RESTORE_QI_PCT', 'SHATTER_SHIELD', 'BONUS_TRUE_DMG',
      // Section 10, 11, 12 New Actions
      'DEPLOY_DOMAIN', 'DEPLOY_FIELD_DOMAIN', 'TAUNT_ENEMY', 'KNOCKBACK_TARGET', 'PULL_VACUUM',
      'POISE_INTERRUPT', 'CLEANSE_TO_POWER', 'CONTAGION_SPREAD', 'PHOENIX_CLAUSE',
      'ACUPOINT_STRIKE', 'MERIDIAN_OVERDRIVE', 'CO_CAST_DUET', 'CHARGE_RELEASE',
      'TRIGGER_DUAL_FUSION', 'TRIGGER_TRI_FUSION', 'TRIGGER_TETRA_FUSION',
      'DEAL_SCALED_DMG', 'TRUE_PIERCE_DMG', 'CONSUME_STATUS_BURST', 'SPREAD_DEBUFF',
      'CHAIN_FOLLOWUP', 'SUMMON_ENTITY', 'RESOURCE_CONVERT', 'COOLDOWN_SHIFT', 'EXECUTE_BELOW_THRESHOLD',
      'MASS_ABSORPTION', 'SONIC_TEMPO_BREAK', 'MERIDIAN_SEAL', 'VOID_POCKET_DEFENSE', 'GU_SOUL_LEECH',
      'STAR_FATE_REVERSAL', 'BODHI_KARMA_AEGIS', 'WEATHER_THUNDER_CALL', 'CONTRACT_FORECLOSURE',
      'LEYLINE_EARTH_SPIKE', 'ATAVISM_FRENZY_BITE', 'TEMPORAL_SAND_REWIND', 'IMPERIAL_INK_DECREE',
      'MARIONETTE_SOUL_SWAP', 'CHAOS_ELEMENT_SHATTER',
      'IAI_ZERO_QI_SLASH', 'SPAWN_SHADOW_CLONE', 'MUDRA_EXPLOSIVE_SEAL', 'SUMMON_DEITY_PROJECTION',
      'ENTER_AVATAR_TRANCE', 'BORROW_COSMIC_LAW', 'ELDRITCH_SANITY_BLAST', 'KHMER_YANTRA_WARD',
      'DEVOUR_ESSENCE_BITE', 'GRAVE_CORPSE_DETONATE'
    ]),
    MARK_KINDS: Object.freeze(['daoMark', 'starSeal', 'venomSeed', 'bloodBrand']),
    TAGS: Object.freeze([
      '#FIRE', '#WATER', '#WOOD', '#METAL', '#EARTH', '#LIGHTNING', '#ICE', '#WIND',
      '#YIN', '#YANG', '#BLOOD', '#DEMON', '#ASTRAL', '#SAMSARA', '#POISON',
      '#SOUND', '#SEAL', '#TRUE_DMG', '#SUMMON', '#PHYSICAL', '#MAGIC',
      '#SHIELD', '#HEAL', '#CONTROL', '#ACUPOINT', '#DOMAIN'
    ])
  });

  // Unified Single-Source Keyword Registry with implemented=true verification (Section 10.8)
  const _kwRegistry = {};
  for (const t of SK.COMPOSABLE_KEYWORDS.TRIGGERS) _kwRegistry['TRIGGER:' + t] = { id: t, category: 'TRIGGER', normalized: SK.normalizeTrigger(t), implemented: true };
  for (const s of SK.COMPOSABLE_KEYWORDS.TARGET_SELECTORS) _kwRegistry['SELECTOR:' + s] = { id: s, category: 'TARGET_SELECTOR', implemented: true };
  for (const c of SK.COMPOSABLE_KEYWORDS.CONDITIONS) _kwRegistry['CONDITION:' + c] = { id: c, category: 'CONDITION', implemented: true };
  for (const a of SK.COMPOSABLE_KEYWORDS.ACTIONS) _kwRegistry['ACTION:' + a] = { id: a, category: 'ACTION', implemented: true };
  for (const m of SK.COMPOSABLE_KEYWORDS.MARK_KINDS) _kwRegistry['MARK:' + m] = { id: m, category: 'MARK_KIND', implemented: true };
  for (const tg of SK.COMPOSABLE_KEYWORDS.TAGS) _kwRegistry['TAG:' + tg] = { id: tg, category: 'TAG', implemented: true };
  SK.KEYWORD_REGISTRY = Object.freeze(_kwRegistry);

  // Section 10.6: 7 Unlocked Subpath Archetypes
  SK.SUBPATH_ARCHETYPES_V235 = Object.freeze({
    WARDEN_TAUNTER: {
      id: 'WARDEN_TAUNTER',
      nameTh: 'จอมยั่วยุผู้พิทักษ์ (Warden Taunter)',
      coreMechanics: ['C01_TAUNT', 'C03_BODYBLOCK', 'S01_DIMINISHING_RESIST'],
      recommendedPaths: ['BODY', 'GOD', 'BEAST_SOVEREIGN'],
      stance: 'VAJRA_BASTION_STANCE',
      bonusStats: { p: { def: 0.25, mdef: 0.20, hp: 0.18 }, f: { poise: 45 } },
      descTh: 'แนวหน้าปราการเหล็ก ยั่วยุดึงความสนใจศัตรูและใช้ร่างกายบังแถวหลัง พร้อมภูมิต้านทานสถานะสะสม'
    },
    FATE_WEAVER: {
      id: 'FATE_WEAVER',
      nameTh: 'ผู้ชี้ชะตา (Fate Weaver)',
      coreMechanics: ['C04_DELAYED_ECHO', 'S08_KARMA_LEDGER', '2E_15_ASTRAL_CHRONO_REVERSAL'],
      recommendedPaths: ['KARMA_SAMSARA', 'HEART_SOUL', 'ARRAY_TALISMAN'],
      stance: 'QIMEN_ARRAY_STANCE',
      bonusStats: { p: { matk: 0.20, mdef: 0.16 }, f: { cast: 16, acc: 14 } },
      descTh: 'ถักทอชะตาหน่วงเวลา สะสมดาเมจระเบิดย้อนหลังและพลิกผันผลกรรมในสมรภูมิ'
    },
    DOMAIN_ARRAYIST: {
      id: 'DOMAIN_ARRAYIST',
      nameTh: 'ปรมาจารย์ค่ายกลสนามรบ (Domain Arrayist)',
      coreMechanics: ['C12_BATTLEFIELD_DOMAIN', 'S04_ARRAY_RUNES', '4E_01_FOUR_SYMBOLS_DOMAIN'],
      recommendedPaths: ['ARRAY_TALISMAN', 'STRATEGY_GOVERNANCE', 'XIAN'],
      stance: 'QIMEN_ARRAY_STANCE',
      bonusStats: { p: { matk: 0.22, def: 0.14, mdef: 0.18 }, f: { cast: 18 } },
      descTh: 'กางเขตแดนสนามรบเปลี่ยนกติกาสมรภูมิ เสริมพลังพรรคพวกและกดขี่ต้านทานธาตุของศัตรู'
    },
    OATH_BOUND_DUELIST: {
      id: 'OATH_BOUND_DUELIST',
      nameTh: 'นักสู้สาบาน (Oath-Bound Duelist)',
      coreMechanics: ['S07_OATH_VOW', 'C06_POISE_GAUGE', '12_1_MERIDIAN_OVERDRIVE'],
      recommendedPaths: ['XIAN', 'BODY', 'DEMON', 'GOD'],
      stance: 'STAR_SWORD_STANCE',
      bonusStats: { p: { atk: 0.24, matk: 0.20 }, f: { crit: 12, pen: 18 } },
      descTh: 'ตั้งสัตย์สาบานจำกัดตนเองเพื่อแลกกับอานุภาพกระบวนท่าและเกจท่าร่างที่ไม่มีวันสั่นคลอน'
    },
    CONTAGION_ALCHEMIST: {
      id: 'CONTAGION_ALCHEMIST',
      nameTh: 'หมอพิษกู่ (Contagion Alchemist)',
      coreMechanics: ['C10_CONTAGION', 'S03_TOXIN_SYNERGY', '3E_06_NOXIOUS_PYRE'],
      recommendedPaths: ['DEMON', 'SAGE_SUPPORT', 'CRAFT_CREATION'],
      stance: 'SHADOW_REAPER_STANCE',
      bonusStats: { p: { matk: 0.22, mdef: 0.14 }, f: { pen: 15, acc: 12 } },
      descTh: 'ผสมผสานพิษคู่และโอสถหลายเฟส แพร่กระจายพิษสังหารข้ามเป้าหมายเมื่อศัตรูสิ้นชีพ'
    },
    DUET_SAGE: {
      id: 'DUET_SAGE',
      nameTh: 'ผู้เชื่อมวิญญาณคู่ (Duet Sage)',
      coreMechanics: ['C08_CO_CAST', '12_6_RED_GOLD_THREADS', 'SOUL_LINK_SHARE_DMG'],
      recommendedPaths: ['HEART_SOUL', 'SAGE_SUPPORT', 'XIAN', 'KARMA_SAMSARA'],
      stance: 'LOTUS_MERCY_STANCE',
      bonusStats: { p: { matk: 0.18, mdef: 0.18, hp: 0.14 }, f: { cast: 15 } },
      descTh: 'ประสานจิตวิญญาณกับคู่บำเพ็ญหรืออาจารย์-ศิษย์ ร่ายวิชาคู่ประสานฟ้าดินโดยอัตโนมัติ'
    },
    STANCE_DANCER: {
      id: 'STANCE_DANCER',
      nameTh: 'นักรบเปลี่ยนท่า (Stance Dancer)',
      coreMechanics: ['PILLAR_3_ACTIVE_STANCES', 'ON_STANCE_SWITCH', 'S05_WEAPON_AFFINITY_RAMP'],
      recommendedPaths: ['XIAN', 'BODY', 'MECH_PUPPET', 'CRAFT_CREATION'],
      stance: 'THUNDER_STEP_STANCE',
      bonusStats: { p: { atk: 0.18, matk: 0.18, eva: 0.16 }, f: { cast: 18, move: 18, crit: 10 } },
      descTh: 'สลับท่าร่างทั้ง 7 ท่าอย่างลื่นไหลระหว่างศึก รับบัฟต่อเนื่องทุกครั้งที่เปลี่ยนท่าร่าง'
    }
  });


  // Patch v3.4.0 [PROP-05]: 6-Tier Subpath Archetype Mastery & Signature Finishers
  SK.ARCHETYPE_MASTERY_TIERS = Object.freeze([
    { tier: 1, nameTh: 'ขั้นที่ 1: แรกเริ่มหยั่งรู้', statMult: 1.04 },
    { tier: 2, nameTh: 'ขั้นที่ 2: หลอมรวมท่วงท่า', statMult: 1.08 },
    { tier: 3, nameTh: 'ขั้นที่ 3: ชำนาญศึกสมรภูมิ', statMult: 1.12 },
    { tier: 4, nameTh: 'ขั้นที่ 4: บรรลุเคล็ดวิชาเฉพาะสาย (ปลดล็อกกระบวนท่าขั้น 4)', statMult: 1.16, unlocksSkill: 'T4' },
    { tier: 5, nameTh: 'ขั้นที่ 5: ปรมาจารย์ไร้พ่าย', statMult: 1.20 },
    { tier: 6, nameTh: 'ขั้นที่ 6: ตำนานสะท้านยุทธภพ (ปลดล็อกท่าไม้ตายสูงสุดขั้น 6)', statMult: 1.25, unlocksSkill: 'T6' }
  ]);

  SK.getArchetypeSignatureSkills = (archId, tier) => {
    const spec = SK.SUBPATH_ARCHETYPES_V235[archId];
    if (!spec) return [];
    const out = [];
    if ((tier || 1) >= 4) {
      out.push({
        id: 'ARCH_' + spec.id + '_T4',
        nameTh: 'เคล็ด' + spec.nameTh.split(' (')[0] + '·ขั้นที่ 4',
        arch: 'burst',
        type: (spec.bonusStats && spec.bonusStats.p && spec.bonusStats.p.atk) ? 'p' : 'm',
        M: 1.48,
        cd: 12,
        wind: 3,
        tier: 4,
        isArchetypeSignature: true,
        archetypeId: spec.id
      });
    }
    if ((tier || 1) >= 6) {
      out.push({
        id: 'ARCH_' + spec.id + '_T6_FINISHER',
        nameTh: 'ท่าไม้ตายสูงสุด·' + spec.nameTh.split(' (')[0],
        arch: 'execute',
        type: (spec.bonusStats && spec.bonusStats.p && spec.bonusStats.p.atk) ? 'p' : 'm',
        M: 1.92,
        cd: 18,
        wind: 4,
        tier: 6,
        isArchetypeSignature: true,
        isArchetypeFinisher: true,
        archetypeId: spec.id
      });
    }
    return out;
  };

  SK.validateComposableSpec = spec => {
    if (!spec || typeof spec !== 'object') return { ok: true, errors: [] };
    const errs = [];
    const KW = SK.COMPOSABLE_KEYWORDS;
    const CE = (g.COMBAT && g.COMBAT.COMPOSABLE_ENGINE) || {};
    const validStances = Object.keys(SK.STANCE_CATALOG || {});
    const validFusions = CE.ALL_REACTION_IDS ? Array.from(CE.ALL_REACTION_IDS) : [
      'INFERNO_VORTEX', 'OVERLOAD_BLAST', 'SUPERCONDUCT_SHATTER', 'GLACIAL_SHATTER',
      'MIASMA_DETONATION', 'GU_FIRE_ERUPTION', 'BLOOD_BOIL_RUPTURE', 'STARFALL_COLLAPSE', 'KARMIC_PURIFICATION_SMITE',
      'THERMAL_VAPORIZE', 'WILDFIRE_CONFLAGRATION', 'MOLTEN_ARMOR_MELT', 'MAGMA_ERUPTION',
      'VERDANT_PROLIFERATION', 'ELECTRIFIED_CONDUIT', 'ABSOLUTE_GLACIATION', 'QUICKSILVER_QUAGMIRE',
      'SUPERCONDUCTING_MAGNETIC_CAGE', 'GALE_RAZOR_SHARDS', 'NOXIOUS_SPORE_BLOOM', 'FIRESTORM_INFERNO',
      'TAIJI_ANNIHILATION', 'ASURA_BLOOD_FRENZY', 'ASTRAL_CHRONO_REVERSAL', 'BLOODFROST_SHARD',
      'PRIMORDIAL_STORM_CATACLYSM', 'MOLTEN_CRUCIBLE_CORE', 'BLOODROOT_PARASITE_OVERGROWTH', 'GLACIAL_PERMAFROST_CATACLYSM',
      'CELESTIAL_SINGULARITY_COLLAPSE', 'NOXIOUS_PYRE_SPORE_BLAST', 'ASURA_BLOOD_THUNDER_TRIBULATION', 'CRYO_MIRROR_REFLECTION',
      'YGGDRASIL_ASTRAL_CONDUIT', 'PLASMA_TEMPEST_OVERCHARGE', 'SOLAR_PHOENIX_REBIRTH', 'NINE_ABYSS_FROZEN_PURGATORY',
      'FOUR_HEAVENLY_SYMBOLS_DOMAIN', 'PRIMORDIAL_SAMSARA_VOID_GENESIS', 'HEAVENLY_DAO_NINE_TRIBULATION_JUDGMENT',
      'NINE_HELLS_ABYSSAL_CATACLYSM', 'ABSOLUTE_ZERO_GLACIAL_EPOCH', 'COSMIC_FIVE_PHASE_AUTOMATON'
    ];
    const isValidConditionKey = k => {
      if (!k || typeof k !== 'string') return false;
      const base = k.split(':')[0];
      return KW.CONDITIONS.includes(k) || KW.CONDITIONS.includes(base) && !!SK.KEYWORD_REGISTRY['CONDITION:' + base]?.implemented;
    };
    const isValidActionKey = k => {
      if (!k || typeof k !== 'string') return false;
      const base = k.split(':')[0];
      return (KW.ACTIONS.includes(k) || KW.ACTIONS.includes(base)) && !!SK.KEYWORD_REGISTRY['ACTION:' + base]?.implemented;
    };
    const checkMoveOrSpec = (obj, label) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.arch && !SK.ARCH[obj.arch]) errs.push(label + ': Unknown arch ' + obj.arch);
      if (obj.rider && !SK.STATUS[obj.rider]) errs.push(label + ': Unknown rider status ' + obj.rider);
      if (obj.sx && obj.sx.k && !SK.STATUS[obj.sx.k]) errs.push(label + ': Unknown sx.k status ' + obj.sx.k);
      if (obj.grantBuff && !SK.STATUS[obj.grantBuff] && !(g.STATS && g.STATS.BUFF_CATALOG && g.STATS.BUFF_CATALOG[obj.grantBuff])) {
        errs.push(label + ': Unknown grantBuff ' + obj.grantBuff);
      }
      if (obj.trigger && !KW.TRIGGERS.includes(obj.trigger) && !SK.normalizeTrigger(obj.trigger)) errs.push(label + ': Unknown composable trigger ' + obj.trigger);
      if (obj.targetSelector && !KW.TARGET_SELECTORS.includes(obj.targetSelector)) errs.push(label + ': Unknown composable targetSelector ' + obj.targetSelector);
      if (obj.condition && typeof obj.condition === 'string' && !isValidConditionKey(obj.condition)) errs.push(label + ': Unknown composable condition ' + obj.condition);
      if (obj.condition && typeof obj.condition === 'object' && !Array.isArray(obj.condition) && obj.condition.kind && !isValidConditionKey(obj.condition.kind)) errs.push(label + ': Unknown composable condition.kind ' + obj.condition.kind);
      if (obj.action && !isValidActionKey(obj.action)) errs.push(label + ': Unknown composable action ' + obj.action);
      if (Array.isArray(obj.actions)) {
        for (const act of obj.actions) {
          const k = typeof act === 'string' ? act : (act && (act.kind || act.action));
          if (k && !isValidActionKey(k)) errs.push(label + ': Unknown composable action in actions[] ' + k);
        }
      }
      if (obj.markKind && !KW.MARK_KINDS.includes(obj.markKind)) errs.push(label + ': Unknown composable markKind ' + obj.markKind);
      if (obj.markPrimer && obj.markPrimer.k && !KW.MARK_KINDS.includes(obj.markPrimer.k)) errs.push(label + ': Unknown markPrimer.k ' + obj.markPrimer.k);
      if (obj.markDetonate && obj.markDetonate.k && !KW.MARK_KINDS.includes(obj.markDetonate.k)) errs.push(label + ': Unknown markDetonate.k ' + obj.markDetonate.k);
      if (obj.stanceShift && !validStances.includes(obj.stanceShift)) errs.push(label + ': Unknown stanceShift ' + obj.stanceShift);
      if (obj.elementalFusion && !validFusions.includes(obj.elementalFusion)) errs.push(label + ': Unknown elementalFusion ' + obj.elementalFusion);
    };
    const rootLabel = spec.id || 'spec';
    checkMoveOrSpec(spec, rootLabel);
    if (spec.composable) checkMoveOrSpec(spec.composable, rootLabel + '.composable');
    if (Array.isArray(spec.moveDefs)) {
      for (const mv of spec.moveDefs) {
        checkMoveOrSpec(mv, rootLabel + '.' + (mv.id || 'move'));
        if (mv && mv.composable) checkMoveOrSpec(mv.composable, rootLabel + '.' + (mv.id || 'move') + '.composable');
      }
    }
    if (spec.passive && spec.passive.proc) {
      const pr = spec.passive.proc;
      if (pr.kind && !KW.TRIGGERS.includes(pr.kind)) errs.push(rootLabel + '.passive.proc: Unknown trigger kind ' + pr.kind);
      if (pr.addStatus && !SK.STATUS[pr.addStatus] && !(g.STATS && g.STATS.BUFF_CATALOG && g.STATS.BUFF_CATALOG[pr.addStatus])) {
        errs.push(rootLabel + '.passive.proc: Unknown addStatus ' + pr.addStatus);
      }
    }
    return { ok: errs.length === 0, errors: errs };
  };

  SK.get = id => (g.CULT && g.CULT.tech) ? g.CULT.tech(id) : null;

  /* ---------- Patch v5.3.0 & JS2-v2.5.0: Signature Martial Arts & 43-Path Unique Skill VFX Catalog ---------- */
  SK.SIGNATURE_VFX_CATALOG = {
    sig_meteor_sword_rain: {
      id: 'sig_meteor_sword_rain',
      nameTh: 'เพลงกระบี่ดาวตกถล่มสวรรค์',
      icon: '☄️',
      shape: 'meteor_sword_rain',
      role: 'OFFENSE',
      primary: '#00f5d4',
      secondary: '#ffd166',
      accent: '#ffffff',
      descTh: 'ฝนกระบี่แสงดาวตกพุ่งถล่มจากฟากฟ้าปักลงสู่พื้นพร้อมวงคลื่นปราณระเบิด'
    },
    sig_eight_directions_palm: {
      id: 'sig_eight_directions_palm',
      nameTh: 'ฝ่ามือสยบมารแปดทิศ',
      icon: '✋',
      shape: 'colossal_golden_palm',
      role: 'OFFENSE',
      primary: '#ffd740',
      secondary: '#ff9e00',
      accent: '#fff8d6',
      descTh: 'ฝ่ามือทองคำยักษ์ประทับลงสู่พื้นพร้อมค่ายกลแปดทิศสั่นสะเทือนปฐพี'
    },
    sig_nine_suns_eye: {
      id: 'sig_nine_suns_eye',
      nameTh: 'เนตรสุริยันเก้าเพลิง',
      icon: '☀️',
      shape: 'nine_suns_solar_eye',
      role: 'OFFENSE',
      primary: '#ff6d00',
      secondary: '#ffd740',
      accent: '#ffffff',
      descTh: 'ดวงตาเทพสุริยันเบิกฟ้าพร้อมดวงอาทิตย์จำลอง 9 ดวงแผ่รังสีเผาผลาญ'
    },
    sig_soul_scorching_flame: {
      id: 'sig_soul_scorching_flame',
      nameTh: 'เพลิงผลาญวิญญาณ',
      icon: '🔥',
      shape: 'nether_soul_fire_vortex',
      role: 'FORBIDDEN',
      primary: '#9d4edd',
      secondary: '#00f5d4',
      accent: '#e0aaff',
      descTh: 'พายุเพลิงวิญญาณสีม่วงมรกตและดวงไฟอเวจีหมุนวนเผาผลาญทะเลสำนึก'
    },
    sig_blazing_dragon_wave: {
      id: 'sig_blazing_dragon_wave',
      nameTh: 'คลื่นมังกรเพลิงพุ่งทะยาน',
      icon: '🐉',
      shape: 'coiling_fire_dragon',
      role: 'OFFENSE',
      primary: '#ff4d6d',
      secondary: '#ffd166',
      accent: '#fff3b0',
      descTh: 'คลื่นมังกรเพลิงสีชาดทองพุ่งทะยานแหวกอากาศพร้อมเกล็ดอัคคีเรืองรอง'
    },
    sig_blood_beast_claw: {
      id: 'sig_blood_beast_claw',
      nameTh: 'กรงเล็บอสูรโลหิตฉีกนภา',
      icon: '🐾',
      shape: 'crimson_beast_claws',
      role: 'OFFENSE',
      primary: '#d90429',
      secondary: '#ff758f',
      accent: '#2b2d42',
      descTh: 'รอยกรงเล็บอสูรโลหิต 4 รอยฉีกกระชากห้วงอากาศพร้อมไอสังหารสีเลือด'
    },
    sig_frost_lotus_domain: {
      id: 'sig_frost_lotus_domain',
      nameTh: 'เขตแดนบัวหิมะหมื่นปี',
      icon: '❄️',
      shape: 'crystalline_frost_lotus',
      role: 'DOMAIN',
      primary: '#90e0ef',
      secondary: '#00b4d8',
      accent: '#ffffff',
      descTh: 'ดอกบัวผลึกน้ำแข็ง 12 กลีบผลิบานแช่แข็งพื้นที่พร้อมเกล็ดหิมะหกเหลี่ยม'
    },
    sig_thunder_god_halberd: {
      id: 'sig_thunder_god_halberd',
      nameTh: 'ทวนอัสนีเทพพิโรธ',
      icon: '⚡',
      shape: 'thunder_god_halberd_strike',
      role: 'OFFENSE',
      primary: '#c77dff',
      secondary: '#ffd740',
      accent: '#ffffff',
      descTh: 'คมทวนสายฟ้าม่วงทองฟาดผ่าลงมาจากฟากฟ้าพร้อมสายฟ้าแตกแขนงรอบทิศ'
    },
    sig_myriad_puppet_barrage: {
      id: 'sig_myriad_puppet_barrage',
      nameTh: 'ค่ายกลหุ่นเชิดหมื่นด้ายสังหาร',
      icon: '⚙️',
      shape: 'clockwork_puppet_threads',
      role: 'CONSTRUCT',
      primary: '#ffb703',
      secondary: '#00f5d4',
      accent: '#fde4cf',
      descTh: 'เส้นไหมปราณสังหารและฟันเฟืองจักรกลทองเหลืองหมุนตัดพันธนาการศัตรู'
    },
    sig_heavens_sound_requiem: {
      id: 'sig_heavens_sound_requiem',
      nameTh: 'พิณสวรรค์สะท้านวิญญาณ',
      icon: '🎶',
      shape: 'celestial_zither_requiem',
      role: 'SUPPORT',
      primary: '#72efdd',
      secondary: '#ff9ebb',
      accent: '#ffd166',
      descTh: 'สายพิณโบราณเรืองแสงพร้อมคลื่นเสียงหยกสวรรค์สั่นสะเทือนดวงจิต'
    },
    sig_golden_buddha_bell: {
      id: 'sig_golden_buddha_bell',
      nameTh: 'ระฆังทองคำอรหันต์คุ้มกายา',
      icon: '🔔',
      shape: 'golden_arhat_bell_dome',
      role: 'DEFENSE',
      primary: '#ffd740',
      secondary: '#ff9e00',
      accent: '#fff8d6',
      descTh: 'ระฆังปราณทองคำขนาดยักษ์ครอบคลุมร่างพร้อมอักขระธรรมหมุนวนคุ้มกัน'
    },
    sig_void_spatial_slash: {
      id: 'sig_void_spatial_slash',
      nameTh: 'คมดาบผ่ามิติว่างเปล่า',
      icon: '🌌',
      shape: 'dimensional_void_rift',
      role: 'OFFENSE',
      primary: '#7209b7',
      secondary: '#4cc9f0',
      accent: '#ffffff',
      descTh: 'รอยแยกมิติสีนิลม่วงฉีกผ่าห้วงอากาศพร้อมประกายดาราในความว่างเปล่า'
    },
    sig_myriad_venom_miasma: {
      id: 'sig_myriad_venom_miasma',
      nameTh: 'หมอกพิษกู่หมื่นอสรพิษ',
      icon: '🐍',
      shape: 'venom_gu_serpent_miasma',
      role: 'DEBUFF',
      primary: '#52b788',
      secondary: '#9d4edd',
      accent: '#d8f3dc',
      descTh: 'หมอกพิษเบญจรงค์และเงาอสรพิษกู่มรกตเลื้อยพันกัดกร่อนเกราะปราณ'
    },
    sig_taiji_yin_yang_crush: {
      id: 'sig_taiji_yin_yang_crush',
      nameTh: 'มหาค่ายกลหยินหยางบดขยี้',
      icon: '☯️',
      shape: 'taiji_millstone_crush',
      role: 'ARRAY',
      primary: '#f8f9fa',
      secondary: '#212529',
      accent: '#00f5d4',
      descTh: 'จานหมุนหยินหยางขาวดำและยันต์แปดทิศหมุนสวนทางบดขยี้สมรภูมิ'
    },
    sig_immortal_crane_feather_storm: {
      id: 'sig_immortal_crane_feather_storm',
      nameTh: 'พายุขนนกกระเรียนเซียน',
      icon: '🦢',
      shape: 'immortal_crane_feather_tempest',
      role: 'OFFENSE',
      primary: '#e0fbfc',
      secondary: '#ffd166',
      accent: '#ff4d6d',
      descTh: 'พายุขนนกกระเรียนหยกขาวและแสงทองพัดกระหน่ำดุจคมกระบี่เซียน'
    },
    sig_iai_crimson_moon_slash: {
      id: 'sig_iai_crimson_moon_slash',
      nameTh: 'เพลงดาบอิไอผ่าจันทราโลหิตไร้ปราณ',
      icon: '⚔️',
      shape: 'iai_crimson_moon_slash',
      role: 'OFFENSE',
      primary: '#e63946',
      secondary: '#f1faee',
      accent: '#ffd166',
      descTh: 'ประกายดาบอิไอไร้ปราณชักฟันเสี้ยววินาทีเกิดเป็นวงพระจันทร์เสี้ยวสีชาดตัดผ่ามิติ'
    },
    sig_shinobi_phantom_clone_ambush: {
      id: 'sig_shinobi_phantom_clone_ambush',
      nameTh: 'ค่ายกลเงาแยกสังหารแปดทิศ',
      icon: '🥷',
      shape: 'shinobi_phantom_clone_ambush',
      role: 'OFFENSE',
      primary: '#4a4e69',
      secondary: '#c77dff',
      accent: '#e0fbfc',
      descTh: 'ร่างแยกเงามายาพุ่งจู่โจมพร้อมดาวกระจายจักระจากทุกทิศทางในม่านควันรัตติกาล'
    },
    sig_shinobi_mudra_firestorm: {
      id: 'sig_shinobi_mudra_firestorm',
      nameTh: 'มหาเวทย์ประสานอินเพลิงอัสนีถล่มภพ',
      icon: '🔥',
      shape: 'shinobi_mudra_firestorm',
      role: 'OFFENSE',
      primary: '#f77f00',
      secondary: '#fcbf49',
      accent: '#00f5d4',
      descTh: 'วงอักขระมุทราประสานอิน 9 ตาประทับระเบิดพายุเพลิงและสายฟ้าคำราม'
    },
    sig_pantheon_deity_descent: {
      id: 'sig_pantheon_deity_descent',
      nameTh: 'มหาเทวาลัยเบื้องบนจุติข้ามพิภพ',
      icon: '👑',
      shape: 'pantheon_deity_descent',
      role: 'SUMMON',
      primary: '#ffd166',
      secondary: '#4cc9f0',
      accent: '#ffffff',
      descTh: 'ประตูสวรรค์เบื้องบนเปิดออกพร้อมรัศมีทวยเทพ 5 มหาพิภพจุติลงมาพิพากษา'
    },
    sig_eldritch_void_rift: {
      id: 'sig_eldritch_void_rift',
      nameTh: 'รอยแยกเนตรอเวจีนอกมิติกลืนสติ',
      icon: '👁️',
      shape: 'eldritch_void_rift',
      role: 'FORBIDDEN',
      primary: '#7209b7',
      secondary: '#f72585',
      accent: '#4cc9f0',
      descTh: 'รอยแยกอวกาศนอกมิติฉีกออกพร้อมเนตรทมิฬและระยางค์สุญตาสูบกลืนสติสัมปชัญญะ'
    },
    sig_khmer_sacred_yantra_seal: {
      id: 'sig_khmer_sacred_yantra_seal',
      nameTh: 'มหายันต์เก้ายอดอาคมขอมคงกระพัน',
      icon: '📿',
      shape: 'khmer_sacred_yantra_seal',
      role: 'DEFENSE',
      primary: '#d97706',
      secondary: '#fef08a',
      accent: '#ef4444',
      descTh: 'อักขระยันต์เก้ายอดสีทองชาดลอยเด่นสะท้อนศาสตราและปลุกแรงครูคุ้มกาย'
    },
    sig_nether_grave_soul_eruption: {
      id: 'sig_nether_grave_soul_eruption',
      nameTh: 'สุสานยมโลกปะทุวิญญาณบรรพชน',
      icon: '🪦',
      shape: 'nether_grave_soul_eruption',
      role: 'FORBIDDEN',
      primary: '#6c757d',
      secondary: '#80ffdb',
      accent: '#c77dff',
      descTh: 'ศิลาจารึกสุสานผุดขึ้นพร้อมเพลิงวิญญาณสีเขียวครามของเหล่าบรรพชนผู้ล่วงลับ'
    },
    sig_shennong_emerald_lotus: {
      id: 'sig_shennong_emerald_lotus',
      nameTh: 'บัวหยกเสินหนงโปรยน้ำค้างชุบชีวา',
      icon: '🪷',
      shape: 'shennong_emerald_lotus_bloom',
      role: 'HEAL_SUPPORT',
      primary: '#52b788',
      secondary: '#b9f6ca',
      accent: '#ffd166',
      descTh: 'ดอกบัวหยกอมฤตผลิบานใต้ฝ่าเท้าพร้อมละอองน้ำค้างทิพย์สมานชีพจรและชุบวิญญาณ'
    },
    sig_imperial_eight_gates_banner: {
      id: 'sig_imperial_eight_gates_banner',
      nameTh: 'ธงรบฉีเหมินแปดพยุหะบัญชาทัพ',
      icon: '🚩',
      shape: 'imperial_eight_gates_command',
      role: 'COMMAND_SUPPORT',
      primary: '#d4bb78',
      secondary: '#e63946',
      accent: '#fff3b0',
      descTh: 'ธงศึกทองคำแปดพยุหะปักล้อมสมรภูมิพร้อมคลื่นกลองศึกและตราหยกเจ้าสำนัก'
    },
    sig_primordial_beast_totem: {
      id: 'sig_primordial_beast_totem',
      nameTh: 'เสาโทเท็มอัญเชิญจตุรเทพราชันอสูร',
      icon: '🐺',
      shape: 'primordial_beast_totem_gate',
      role: 'SUMMON',
      primary: '#e09f3e',
      secondary: '#51cf66',
      accent: '#ff4d6d',
      descTh: 'เสาโทเท็มบรรพกาลผุดขึ้นพร้อมเงาปีกคุนเผิงและเขี้ยวอสูรเทาเที่ยคำรามสะท้านภพ'
    },
    sig_heaven_brush_astrolabe: {
      id: 'sig_heaven_brush_astrolabe',
      nameTh: 'พู่กันเทวะจารึกจานดาราเหอถูลั่วซู',
      icon: '🖌️',
      shape: 'heaven_brush_astrolabe_script',
      role: 'ARRAY_CHRONO',
      primary: '#74c0fc',
      secondary: '#ffd166',
      accent: '#e599f7',
      descTh: 'จานดาราเหอถูลั่วซูหมุนซ้อนพร้อมพู่กันทองคำตวัดอักขระสวรรค์สะกดกาลเวลาและดวงดาว'
    },
    sig_golden_abacus_wheel: {
      id: 'sig_golden_abacus_wheel',
      nameTh: 'กงล้อโชคชะตาและลูกคิดทองไฉ่ซิง',
      icon: '🪙',
      shape: 'golden_abacus_fortune_wheel',
      role: 'MERCANTILE_FORTUNE',
      primary: '#ffd43b',
      secondary: '#ef476f',
      accent: '#fff3b0',
      descTh: 'กงล้อเดิมพันชะตาและลูกคิดทองคำดีดคำนวณบุญบาปโปรยเหรียญสวรรค์พิพากษาศึก'
    },
    sig_blood_lotus_apocalypse: {
      id: 'sig_blood_lotus_apocalypse',
      nameTh: 'บัวโลหิตอเวจีสูบดาวทลายสามภพ',
      icon: '🩸',
      shape: 'blood_lotus_abyss_vortex',
      role: 'FORBIDDEN_ULTIMATE',
      primary: '#9b2226',
      secondary: '#ff0055',
      accent: '#7209b7',
      descTh: 'วังวนบัวโลหิตต้องห้ามและโซ่ตรวนมารฉีกกระชากชีพจรสูบกลืนพลังชีวิตและดวงดาว'
    },
    sig_divine_crucible_forge: {
      id: 'sig_divine_crucible_forge',
      nameTh: 'เตาหลอมสวรรค์เก้ามังกรรังสรรค์ศาสตรา',
      icon: '🏺',
      shape: 'divine_crucible_nine_dragons',
      role: 'CRAFT_FORGE',
      primary: '#f4a261',
      secondary: '#ffd166',
      accent: '#ff4d00',
      descTh: 'เตาหลอมสามขาสวรรค์ลอยเด่นกลางหาวพร้อมเพลิงสาม昧และค้อนเทวะตีหลอมศาสตรา'
    },
    sig_tidal_maelstrom_anchors: {
      id: 'sig_tidal_maelstrom_anchors',
      nameTh: 'วังวนคลื่นยักษ์เก้าสมุทรและมังกรปฐพี',
      icon: '🌊',
      shape: 'tidal_geomancy_maelstrom',
      role: 'DOMAIN_CONTROL',
      primary: '#0077b6',
      secondary: '#90e0ef',
      accent: '#52b788',
      descTh: 'วังวนน้ำวนเหมันต์เก้าสมุทรผสานเสามังกรธรณีพุ่งทะลวงขึ้นสะกดสมรภูมิ'
    },
    sig_bamboo_reed_sword: {
      id: 'sig_bamboo_reed_sword', nameTh: 'กระบี่ไผ่เขียวลู่ลม', icon: '🎋', shape: 'bamboo_reed_parry', role: 'DEFENSE',
      primary: '#4dab77', secondary: '#d9f99d', accent: '#f7ffe7', descTh: 'ลำไผ่หยกโค้งรับแรงแล้วดีดคืนเป็นคมใบไผ่ ปิดท้ายด้วยแนวไผ่สะบัดวายุ'
    },
    sig_magnetic_arsenal_draw: {
      id: 'sig_magnetic_arsenal_draw', nameTh: 'วงแหวนดูดศาสตราแม่เหล็ก', icon: '🧲', shape: 'magnetic_weapon_orbit', role: 'CONTROL',
      primary: '#67e8f9', secondary: '#f59e0b', accent: '#e0f7ff', descTh: 'ศาสตราเงาสี่ชิ้นถูกแรงแม่เหล็กเหนี่ยวนำหมุนเข้าหาแกนหยกกลางวง'
    },
    sig_iron_rhino_ramming: {
      id: 'sig_iron_rhino_ramming', nameTh: 'อสนีคชสารพุ่งชน', icon: '🦏', shape: 'iron_rhino_rampart', role: 'OFFENSE',
      primary: '#c0a07a', secondary: '#495057', accent: '#ffd166', descTh: 'เงาแรดเหล็กก้มเขาพุ่งทะลวงแนวหน้า ทิ้งรอยฝุ่นและแรงกระแทกเป็นชั้น'
    },
    sig_eightfold_earthquake: {
      id: 'sig_eightfold_earthquake', nameTh: 'แผ่นดินแปดทิศสะเทือน', icon: '⛰️', shape: 'octagonal_ground_quake', role: 'DOMAIN_CONTROL',
      primary: '#e9c46a', secondary: '#bc6c25', accent: '#f4f1de', descTh: 'วงแผ่นดินแตกร้าวแปดทิศแผ่ออกจากจุดกระทืบ พร้อมรอยแยกชี้ตำแหน่งใต้ดิน'
    },
    sig_twin_thunder_hammers: {
      id: 'sig_twin_thunder_hammers', nameTh: 'ค้อนคู่ฟาดทั่งอัสนี', icon: '🔨', shape: 'twin_hammer_anvil', role: 'OFFENSE',
      primary: '#ffe45e', secondary: '#6c63ff', accent: '#e0fbfc', descTh: 'ค้อนสายฟ้าสองข้างฟาดประสานบนทั่งปราณ เกิดเส้นอัสนีแตกเป็นแรงสะเทือนวงกว้าง'
    },
    sig_divine_bell_mind_ripple: {
      id: 'sig_divine_bell_mind_ripple', nameTh: 'ระฆังเทวัญกังวานสะเทือนจิต', icon: '🔔', shape: 'mind_bell_resonance', role: 'CONTROL',
      primary: '#fff1a8', secondary: '#55d6be', accent: '#c77dff', descTh: 'ระฆังเทวัญใบเล็กลอยเหนือศีรษะ ปล่อยคลื่นเสียงเป็นวงตัดจังหวะเวทและปลุกสติ'
    },
    sig_primordial_stone_tortoise: {
      id: 'sig_primordial_stone_tortoise', nameTh: 'เต่าศิลาบรรพกาลค้ำฟ้า', icon: '🐢', shape: 'primordial_stone_tortoise', role: 'DEFENSE',
      primary: '#7f8c70', secondary: '#a3cef1', accent: '#e9ecef', descTh: 'เกราะกระดองศิลาลายหกเหลี่ยมก่อตัวเหนือพื้น พร้อมเสาหินสี่ขาค้ำรับแรงหนัก'
    },
    sig_thousand_faith_link: {
      id: 'sig_thousand_faith_link', nameTh: 'ข่ายศรัทธาสาวกหมื่นจิต', icon: '✨', shape: 'linked_votive_network', role: 'TEAM_SUPPORT',
      primary: '#f4d35e', secondary: '#71e0cf', accent: '#fffdf4', descTh: 'จุดศรัทธาผูกถึงผู้ร่วมรบที่ได้รับผลจริงด้วยเส้นแสงและตราคุ้มครองรายคน'
    },
    sig_mountain_river_scroll: {
      id: 'sig_mountain_river_scroll', nameTh: 'ภาพม้วนขุนเขาแม่น้ำพันลี้', icon: '🏞️', shape: 'landscape_scroll_expansion', role: 'DOMAIN_CONTROL',
      primary: '#d4a373', secondary: '#4d908e', accent: '#fefae0', descTh: 'ม้วนภาพหยกคลี่ออก เผยชั้นภูผาและธารหมึกที่กักขังพื้นที่รอบเป้าหมาย'
    },
    sig_seven_emotion_mirage: {
      id: 'sig_seven_emotion_mirage', nameTh: 'มายาฝันเจ็ดอารมณ์', icon: '🎭', shape: 'seven_emotion_mask_orbit', role: 'DEBUFF',
      primary: '#bc6c8e', secondary: '#7868e6', accent: '#f7ede2', descTh: 'หน้ากากมายาเจ็ดอารมณ์โคจรรอบจิตเป้าหมาย ก่อนยุบรวมเป็นตราฝัน'
    },
    sig_mind_blade_flash: {
      id: 'sig_mind_blade_flash', nameTh: 'ประกายกระบี่จิตทะลวงเนตร', icon: '🗡️', shape: 'psychic_mind_blade', role: 'OFFENSE',
      primary: '#e9ecef', secondary: '#74c0fc', accent: '#c77dff', descTh: 'แนวสายตากระจ่างวาบก่อนกระบี่จิตเล่มเดียวพุ่งตรงทะลวงจุดหมาย'
    },
    sig_myriad_beast_pack: {
      id: 'sig_myriad_beast_pack', nameTh: 'ฝูงอสูรขย้ำสังหารหมู่', icon: '🐾', shape: 'beast_pack_pounce', role: 'OFFENSE',
      primary: '#c77d3e', secondary: '#9ccf70', accent: '#fff0c2', descTh: 'เงาฝูงอสูรหลายทิศล้อมเป้าหมาย ก่อนรอยเขี้ยวและฝ่าเท้าจะพุ่งเข้าพร้อมกัน'
    },
    sig_gu_insect_swarm: {
      id: 'sig_gu_insect_swarm', nameTh: 'วังวนฝูงแมลงกู่กลืนปราณ', icon: '🪲', shape: 'gu_insect_spiral', role: 'DEBUFF',
      primary: '#6abf69', secondary: '#f72585', accent: '#e2ffbf', descTh: 'ฝูงแมลงกู่เป็นจุดปีกเล็กหมุนเป็นเกลียวปกคลุมชีพจรและกัดกร่อนปราณ'
    },
    sig_iron_thorn_vine_bind: {
      id: 'sig_iron_thorn_vine_bind', nameTh: 'เถาวัลย์หนามเหล็กพันธนาการ', icon: '🌿', shape: 'iron_thorn_vine_lattice', role: 'CONTROL',
      primary: '#738b43', secondary: '#c1121f', accent: '#e9edc9', descTh: 'เถาวัลย์เหล็กไขว้รัดจากพื้นพร้อมหนามล็อกข้อต่อ ไม่ซ้ำกับภาพบัวหรือหมอกพิษ'
    },
    sig_arena_crowd_roar: {
      id: 'sig_arena_crowd_roar', nameTh: 'สังเวียนกึกก้องเสียงเชียร์', icon: '🏟️', shape: 'arena_crowd_roar', role: 'COMBAT_SUPPORT',
      primary: '#f77f00', secondary: '#e9c46a', accent: '#fff3b0', descTh: 'แนวอัฒจันทร์โค้งล้อมวงประลอง ปล่อยคลื่นเสียงเชียร์เป็นจังหวะหนุนหมัดเด็ด'
    }
  };
  SK.SIGNATURE_VFX_CATALOG.sig_divine_crucible_forge = {
    id: 'sig_divine_crucible_forge',
    nameTh: 'เตาหลอมสวรรค์เก้ามังกรรังสรรค์ศาสตรา',
    icon: '🏺',
    shape: 'divine_crucible_nine_dragons',
    role: 'CRAFT_FORGE',
    primary: '#f4a261',
    secondary: '#ffd166',
    accent: '#ff4d00',
    descTh: 'เตาหลอมสามขาสวรรค์ลอยเด่นกลางหาวพร้อมเพลิงสาม昧และค้อนเทวะตีหลอมศาสตรา'
  };

  // Primary Signature VFX per Cultivation Path (43/43 Grand Dao Paths)
  SK.PATH_PRIMARY_SIGNATURE_VFX = Object.freeze({
    XIAN: 'sig_meteor_sword_rain',
    BODY: 'sig_eight_directions_palm',
    GOD: 'sig_nine_suns_eye',
    DEMON: 'sig_blood_lotus_apocalypse',
    HEART_SOUL: 'sig_immortal_crane_feather_storm',
    MECH_PUPPET: 'sig_myriad_puppet_barrage',
    KARMA_SAMSARA: 'sig_golden_buddha_bell',
    BEAST_SOVEREIGN: 'sig_primordial_beast_totem',
    SAGE_SUPPORT: 'sig_shennong_emerald_lotus',
    CRAFT_CREATION: 'sig_divine_crucible_forge',
    ARRAY_TALISMAN: 'sig_heaven_brush_astrolabe',
    STRATEGY_GOVERNANCE: 'sig_imperial_eight_gates_banner',
    ASTRO_DIVINATION: 'sig_heaven_brush_astrolabe',
    BUDDHA_DHARMA: 'sig_golden_buddha_bell',
    VOID_SPACE: 'sig_void_spatial_slash',
    SONIC_HARMONY: 'sig_heavens_sound_requiem',
    VENOM_GU: 'sig_myriad_venom_miasma',
    PRIMORDIAL_SHIFTER: 'sig_blood_beast_claw',
    CELESTIAL_WEATHER: 'sig_thunder_god_halberd',
    WANDERING_DAO: 'sig_immortal_crane_feather_storm',
    MERCANTILE_DAO: 'sig_golden_abacus_wheel',
    DRAGON_VEIN_GEOMANCY: 'sig_taiji_yin_yang_crush',
    GRAVITY_DAO: 'sig_taiji_yin_yang_crush',
    CHRONO_EPOCH: 'sig_heaven_brush_astrolabe',
    INK_LITERATI: 'sig_heaven_brush_astrolabe',
    SOUL_PUPPETRY: 'sig_myriad_puppet_barrage',
    PRIMORDIAL_CHAOS: 'sig_nine_suns_eye',
    SHADOW_SAMURAI: 'sig_iai_crimson_moon_slash',
    NINPO_SHADOW: 'sig_shinobi_phantom_clone_ambush',
    NINPO_ELEMENTAL: 'sig_shinobi_mudra_firestorm',
    DIVINE_SUMMONER: 'sig_pantheon_deity_descent',
    DIVINE_POSSESSION: 'sig_pantheon_deity_descent',
    DIVINE_CHANNELER: 'sig_thunder_god_halberd',
    VOID_HERETIC_PACT: 'sig_eldritch_void_rift',
    OCCULT_MAGE: 'sig_khmer_sacred_yantra_seal',
    DEVOURING_FLESH: 'sig_blood_lotus_apocalypse',
    NETHER_GRAVE: 'sig_nether_grave_soul_eruption',
    ANCESTRAL_RITUAL: 'sig_nether_grave_soul_eruption',
    TIDE_VOYAGER: 'sig_tidal_maelstrom_anchors',
    LORE_ARCHIVIST: 'sig_heaven_brush_astrolabe',
    FORTUNE_GAMBLER: 'sig_golden_abacus_wheel',
    SPIRIT_HUSBANDRY: 'sig_shennong_emerald_lotus',
    ARENA_GLORY: 'sig_imperial_eight_gates_banner'
  });

  SK.TECH_TO_SIGNATURE_VFX = {
    // Original 40 entries (preserved for backward compatibility)
    MP_BOW_METEOR_STORM: 'sig_meteor_sword_rain',
    MP_SWORD_MYRIAD_RETURN_ONE_T7: 'sig_meteor_sword_rain',
    ART_QI_009: 'sig_meteor_sword_rain',
    ART_KARMA_SAMSARA_009: 'sig_eight_directions_palm',
    MP_FIST_MORTAL_GOD_SHATTER_T7: 'sig_eight_directions_palm',
    LEG_PALM_18_DRAGON: 'sig_eight_directions_palm',
    MP_BOW_NINE_SUNS_FALL_T7: 'sig_nine_suns_eye',
    MP_BOW_SUN_GOD_VERDICT_T7: 'sig_nine_suns_eye',
    ART_V212_GOD_SUN_T5: 'sig_nine_suns_eye',
    MP_BLADE_BLOOD_FRENZY_T5: 'sig_soul_scorching_flame',
    ART_V212_DEMON_GHOST_T6: 'sig_soul_scorching_flame',
    ART_HEART_SOUL_010: 'sig_soul_scorching_flame',
    MP_SPEAR_DRAGON_SPINE_IMPALE_T5: 'sig_blazing_dragon_wave',
    ART_CRAFT_007: 'sig_blazing_dragon_wave',
    MP_BLADE_EIGHT_DESOLATIONS_T7: 'sig_blazing_dragon_wave',
    ART_BEAST_SOV_005: 'sig_blood_beast_claw',
    MP_BLADE_ASHURA_EXTINCTION_T7: 'sig_blood_beast_claw',
    ART_BEAST_SOV_010: 'sig_primordial_beast_totem',
    MP_SWORD_FROST_MOON_SLASH_T5: 'sig_frost_lotus_domain',
    ART_V212_XIAN_FROST_T6: 'sig_frost_lotus_domain',
    MP_SPEAR_CELESTIAL_TEMPEST_T6: 'sig_thunder_god_halberd',
    MP_BLADE_THUNDER_GOD_SLASH_T6: 'sig_thunder_god_halberd',
    ART_MECH_PUPPET_006: 'sig_myriad_puppet_barrage',
    ART_MECH_PUPPET_010: 'sig_myriad_puppet_barrage',
    MP_WHIP_THOUSAND_PUPPET_T6: 'sig_myriad_puppet_barrage',
    ART_V212_XIAN_ZITHER_T6: 'sig_heavens_sound_requiem',
    LEG_ZITHER_GUANGLING: 'sig_heavens_sound_requiem',
    MP_ZITHER_HEAVEN_SOUND_T7: 'sig_heavens_sound_requiem',
    MP_STAFF_ARHAT_SANCTUARY_T6: 'sig_golden_buddha_bell',
    MP_STAFF_VAJRA_BELL_SHIELD: 'sig_golden_buddha_bell',
    MP_STAFF_HEAVEN_PILLAR_T7: 'sig_golden_buddha_bell',
    MP_SPEAR_PRIMORDIAL_VOID_T7: 'sig_void_spatial_slash',
    MP_SPEAR_VOID_ANNIHILATION_T7: 'sig_void_spatial_slash',
    ART_CRAFT_010: 'sig_myriad_venom_miasma',
    ART_V212_MO_VENOM_T6: 'sig_myriad_venom_miasma',
    MP_FOCUS_ASTRAL_BANNER_T5: 'sig_taiji_yin_yang_crush',
    LEG_FIST_QIANKUN_SHIFT: 'sig_taiji_yin_yang_crush',
    ART_ARRAY_010: 'sig_taiji_yin_yang_crush',
    MP_SWORD_SAINT_TRACELESS_T6: 'sig_immortal_crane_feather_storm',
    LEG_SWORD_FEIXIAN: 'sig_immortal_crane_feather_storm',

    // JS2-v2.5.0: Verified Real Technique IDs across all 43 Cultivation Paths (Offense, Defense, Support/Heal, Summon, Array, Forbidden)
    // 1. XIAN
    LEG_COMBAT_DUGU_NINE_SWORDS: 'sig_meteor_sword_rain',
    LEG_COMBAT_NINE_HEAVENS_GUANG_LING: 'sig_heavens_sound_requiem',
    LEG_AUX_QIANKUN_SHIFT: 'sig_taiji_yin_yang_crush',
    LEG_LIGHT_LINGBO_STEP: 'sig_immortal_crane_feather_storm',
    DEF_IMMORTAL_HEAVEN_AEGIS_T6: 'sig_golden_buddha_bell',
    TECH_V234_XIAN_SUP_03: 'sig_shennong_emerald_lotus',
    ART190_XIAN_040: 'sig_meteor_sword_rain',
    ART190_XIAN_075: 'sig_blood_lotus_apocalypse',
    QG_IMMORTAL_VOID_LEVITATION_T7: 'sig_immortal_crane_feather_storm',
    QG_IMPERIAL_SWORD_FLIGHT_T5: 'sig_meteor_sword_rain',

    // 2. BODY
    LEG_COMBAT_DRAGON_SUBDUING_PALMS: 'sig_eight_directions_palm',
    ART190_BODY_040: 'sig_eight_directions_palm',
    ART190_BODY_075: 'sig_blood_lotus_apocalypse',
    ART190_BODY_078: 'sig_blood_beast_claw',
    MP_STAFF_MOUNTAIN_ANCHOR_T5: 'sig_golden_buddha_bell',
    TECH_V234_BODY_SUP_03: 'sig_imperial_eight_gates_banner',

    // 3. GOD
    LEG_V240_GOD: 'sig_pantheon_deity_descent',
    ART190_GOD_040: 'sig_pantheon_deity_descent',
    ART190_GOD_075: 'sig_soul_scorching_flame',
    MP_STAFF_EARTH_GOD_BLESSING_T7: 'sig_shennong_emerald_lotus',
    TECH_V234_GOD_ACT_06: 'sig_nine_suns_eye',
    TECH_V234_GOD_SUP_03: 'sig_pantheon_deity_descent',

    // 4. DEMON
    LEG_FORB_STAR_ABSORBING_VORTEX: 'sig_blood_lotus_apocalypse',
    LEG_FORB_BLOOD_LOTUS_SACRIFICE: 'sig_blood_lotus_apocalypse',
    LEG_LIGHT_MOON_BAT_SHADOW: 'sig_shinobi_phantom_clone_ambush',
    ART_V112_DEMON_HEAVEN_DEVOURING_CANON_T7: 'sig_blood_lotus_apocalypse',
    MP_BLADE_FORBIDDEN_DEMON_EDGE_T7: 'sig_blood_beast_claw',
    TECH_V234_DEMON_ACT_06: 'sig_nether_grave_soul_eruption',
    TECH_V234_DEMON_ACT_12: 'sig_blood_lotus_apocalypse',
    DEF_GOLDEN_CICADA_MOLT_T5: 'sig_shinobi_phantom_clone_ambush',

    // 5. HEART_SOUL
    LEG_COMBAT_FEIXIAN_ONE_SWORD: 'sig_immortal_crane_feather_storm',
    LEG_AUX_LINGXI_ONE_FINGER: 'sig_heaven_brush_astrolabe',
    ART_V112_SOUL_FORMLESS_MIND_SWORD_T7: 'sig_void_spatial_slash',
    MP_BLADE_HEART_SOUL_SEVER_T7: 'sig_void_spatial_slash',
    MP_FOCUS_PRIMORDIAL_BRUSH_T7: 'sig_heaven_brush_astrolabe',
    ART_V210_FORB_VOID_SOUL_SEVER: 'sig_soul_scorching_flame',
    MP_FOCUS_SOUL_BELL_T3: 'sig_golden_buddha_bell',
    TECH_V234_HEART_SOUL_SUP_03: 'sig_shennong_emerald_lotus',

    // 6. MECH_PUPPET
    LEG_COMBAT_SAMSARA_PUPPET_THREADS: 'sig_myriad_puppet_barrage',
    TECH_V234_MECH_PUPPET_ACT_06: 'sig_myriad_puppet_barrage',
    TECH_V234_MECH_PUPPET_ACT_12: 'sig_myriad_puppet_barrage',
    TECH_V215_WHIP_ACT_07: 'sig_myriad_puppet_barrage',
    TECH_V234_MECH_PUPPET_SUP_03: 'sig_golden_buddha_bell',
    ART_MECH_PUPPET_008: 'sig_myriad_puppet_barrage',

    // 7. KARMA_SAMSARA
    LEG_FORB_SAMSARA_KARMA_REVERSAL: 'sig_taiji_yin_yang_crush',
    SUP_BODHI_SOVEREIGN_CHANT_T6: 'sig_golden_buddha_bell',
    TECH_V215_WHIP_ACT_08: 'sig_taiji_yin_yang_crush',
    TECH_V234_KARMA_SAMSARA_ACT_06: 'sig_shennong_emerald_lotus',
    TECH_V234_KARMA_SAMSARA_ACT_12: 'sig_golden_buddha_bell',
    ART_V212_KARMA_MIRROR_T6: 'sig_frost_lotus_domain',
    TECH_V215_BRUSH_ACT_07: 'sig_heaven_brush_astrolabe',

    // 8. BEAST_SOVEREIGN
    LEG_LIGHT_KUNPENG_ASTRAL_WINGS: 'sig_primordial_beast_totem',
    TECH_V234_BEAST_SOVEREIGN_ACT_06: 'sig_myriad_venom_miasma',
    TECH_V234_BEAST_SOVEREIGN_ACT_12: 'sig_primordial_beast_totem',
    TECH_V234_BEAST_SOVEREIGN_ACT_05: 'sig_primordial_beast_totem',
    TECH_V234_BEAST_SOVEREIGN_SUP_03: 'sig_primordial_beast_totem',
    TECH_UNI_V230_018: 'sig_blood_beast_claw',
    TECH_V240_CLAW_02: 'sig_blood_beast_claw',

    // 9. SAGE_SUPPORT
    LEG_COMBAT_JADE_NIRVANA_HARMONY: 'sig_shennong_emerald_lotus',
    ART_V212_SAGE_APEX_T7: 'sig_shennong_emerald_lotus',
    TECH_V215_ZITHER_ACT_08: 'sig_heavens_sound_requiem',
    TECH_V234_SAGE_SUPPORT_ACT_06: 'sig_shennong_emerald_lotus',
    TECH_V234_SAGE_SUPPORT_ACT_12: 'sig_heaven_brush_astrolabe',
    ART_SAGE_SUP_005: 'sig_shennong_emerald_lotus',
    ART_SAGE_SUP_006: 'sig_imperial_eight_gates_banner',
    ART_SAGE_SUP_007: 'sig_shennong_emerald_lotus',
    ART_SAGE_SUP_004: 'sig_golden_buddha_bell',

    // 10. CRAFT_CREATION
    ART_CRAFT_012: 'sig_divine_crucible_forge',
    LEG_V240_CRAFT_CREATION: 'sig_divine_crucible_forge',
    TECH_V234_CRAFT_CREATION_ACT_06: 'sig_divine_crucible_forge',
    TECH_V234_CRAFT_CREATION_ACT_12: 'sig_shennong_emerald_lotus',
    TECH_V234_CRAFT_CREATION_SUP_03: 'sig_divine_crucible_forge',
    ART_V214_CELESTIAL_ARMOR_ARTISAN_T4: 'sig_golden_buddha_bell',

    // 11. ARRAY_TALISMAN
    LEG_AUX_HEAVEN_INSCRIPTION_SEAL: 'sig_heaven_brush_astrolabe',
    SUP_ASTRAL_FATE_COMPASS_T5: 'sig_heaven_brush_astrolabe',
    TECH_V234_ARRAY_TALISMAN_ACT_06: 'sig_thunder_god_halberd',
    TECH_V234_ARRAY_TALISMAN_ACT_12: 'sig_taiji_yin_yang_crush',
    TECH_V234_ARRAY_TALISMAN_SUP_03: 'sig_taiji_yin_yang_crush',
    ART_V214_EARTH_VEIN_WARDEN_T4: 'sig_taiji_yin_yang_crush',

    // 12. STRATEGY_GOVERNANCE
    LEG_AUX_IMPERIAL_EIGHT_GATES: 'sig_imperial_eight_gates_banner',
    SUP_QIMEN_COMMAND_BANNER_T4: 'sig_imperial_eight_gates_banner',
    TECH_V234_STRATEGY_GOVERNANCE_ACT_06: 'sig_imperial_eight_gates_banner',
    TECH_V234_STRATEGY_GOVERNANCE_ACT_12: 'sig_imperial_eight_gates_banner',
    TECH_V234_STRATEGY_GOVERNANCE_ACT_05: 'sig_imperial_eight_gates_banner',
    TECH_V234_STRATEGY_GOVERNANCE_SUP_03: 'sig_imperial_eight_gates_banner',
    ART_V214_BATTLEFIELD_STRATEGIST_T4: 'sig_imperial_eight_gates_banner',

    // 13-27. Grand Dao Paths (Batch 1) — High-Tier Active & Weapon Arts
    TECH_V200_ASTRO_DIVINATION_ACT_06: 'sig_heaven_brush_astrolabe',
    TECH_V200_ASTRO_DIVINATION_ACT_05: 'sig_nine_suns_eye',
    TECH_V240_ASTROLABE_01: 'sig_heaven_brush_astrolabe',
    TECH_V200_BUDDHA_DHARMA_ACT_06: 'sig_golden_buddha_bell',
    TECH_V200_BUDDHA_DHARMA_ACT_05: 'sig_eight_directions_palm',
    TECH_V200_VOID_SPACE_ACT_06: 'sig_void_spatial_slash',
    TECH_V200_VOID_SPACE_ACT_05: 'sig_void_spatial_slash',
    TECH_V200_SONIC_HARMONY_ACT_06: 'sig_heavens_sound_requiem',
    TECH_V200_SONIC_HARMONY_ACT_05: 'sig_heavens_sound_requiem',
    TECH_V200_VENOM_GU_ACT_06: 'sig_myriad_venom_miasma',
    TECH_V200_VENOM_GU_ACT_05: 'sig_blood_beast_claw',
    TECH_V240_NEEDLE_02: 'sig_myriad_venom_miasma',
    TECH_V200_PRIMORDIAL_SHIFTER_ACT_06: 'sig_primordial_beast_totem',
    TECH_V200_PRIMORDIAL_SHIFTER_ACT_05: 'sig_blood_beast_claw',
    TECH_V200_CELESTIAL_WEATHER_ACT_06: 'sig_nine_suns_eye',
    TECH_V200_CELESTIAL_WEATHER_ACT_05: 'sig_frost_lotus_domain',
    TECH_V240_FAN_02: 'sig_thunder_god_halberd',
    TECH_V200_WANDERING_DAO_ACT_06: 'sig_immortal_crane_feather_storm',
    TECH_V200_WANDERING_DAO_ACT_05: 'sig_immortal_crane_feather_storm',
    TECH_V200_MERCANTILE_DAO_ACT_06: 'sig_golden_abacus_wheel',
    TECH_V200_MERCANTILE_DAO_ACT_05: 'sig_golden_abacus_wheel',
    TECH_V240_ABACUS_03: 'sig_golden_abacus_wheel',
    TECH_V200_DRAGON_VEIN_GEOMANCY_ACT_06: 'sig_tidal_maelstrom_anchors',
    TECH_V200_DRAGON_VEIN_GEOMANCY_ACT_05: 'sig_taiji_yin_yang_crush',
    TECH_V200_GRAVITY_DAO_ACT_06: 'sig_taiji_yin_yang_crush',
    TECH_V200_GRAVITY_DAO_ACT_05: 'sig_eight_directions_palm',
    TECH_UNI_V230_026: 'sig_taiji_yin_yang_crush',
    TECH_V200_CHRONO_EPOCH_ACT_06: 'sig_heaven_brush_astrolabe',
    TECH_V200_CHRONO_EPOCH_ACT_05: 'sig_void_spatial_slash',
    TECH_V240_ASTROLABE_02: 'sig_heaven_brush_astrolabe',
    TECH_UNI_V230_027: 'sig_heaven_brush_astrolabe',
    TECH_V200_INK_LITERATI_ACT_06: 'sig_heaven_brush_astrolabe',
    TECH_V200_INK_LITERATI_ACT_05: 'sig_heaven_brush_astrolabe',
    TECH_V240_BRUSH_03: 'sig_heaven_brush_astrolabe',
    TECH_V200_SOUL_PUPPETRY_ACT_06: 'sig_myriad_puppet_barrage',
    TECH_V200_SOUL_PUPPETRY_ACT_05: 'sig_myriad_puppet_barrage',
    TECH_UNI_V230_021: 'sig_myriad_puppet_barrage',
    TECH_V200_PRIMORDIAL_CHAOS_ACT_06: 'sig_taiji_yin_yang_crush',
    TECH_V200_PRIMORDIAL_CHAOS_ACT_05: 'sig_nine_suns_eye',

    // 28-43. Grand Dao Paths (Batch 2) — Combat, Forbidden, Support & Defense Arts
    TECH_V230_SHADOW_SAMURAI_FORBIDDEN: 'sig_iai_crimson_moon_slash',
    TECH_V200_SHADOW_SAMURAI_ACT_04: 'sig_iai_crimson_moon_slash',
    TECH_V230_SHADOW_SAMURAI_SUPPORT: 'sig_imperial_eight_gates_banner',
    TECH_V230_SHADOW_SAMURAI_DEFENSE: 'sig_iai_crimson_moon_slash',
    TECH_V230_NINPO_SHADOW_FORBIDDEN: 'sig_shinobi_phantom_clone_ambush',
    TECH_V200_NINPO_SHADOW_ACT_04: 'sig_shinobi_phantom_clone_ambush',
    TECH_V230_NINPO_SHADOW_SUPPORT: 'sig_shinobi_phantom_clone_ambush',
    TECH_V230_NINPO_SHADOW_DEFENSE: 'sig_shinobi_phantom_clone_ambush',
    TECH_V230_NINPO_ELEMENTAL_FORBIDDEN: 'sig_shinobi_mudra_firestorm',
    TECH_V200_NINPO_ELEMENTAL_ACT_04: 'sig_shinobi_mudra_firestorm',
    TECH_V230_NINPO_ELEMENTAL_SUPPORT: 'sig_shinobi_mudra_firestorm',
    TECH_V230_NINPO_ELEMENTAL_DEFENSE: 'sig_shinobi_mudra_firestorm',
    TECH_V230_DIVINE_SUMMONER_FORBIDDEN: 'sig_pantheon_deity_descent',
    TECH_V200_DIVINE_SUMMONER_ACT_04: 'sig_pantheon_deity_descent',
    TECH_V230_DIVINE_SUMMONER_SUPPORT: 'sig_pantheon_deity_descent',
    TECH_V230_DIVINE_SUMMONER_DEFENSE: 'sig_golden_buddha_bell',
    TECH_UNI_V230_015: 'sig_pantheon_deity_descent',
    TECH_V230_DIVINE_POSSESSION_FORBIDDEN: 'sig_pantheon_deity_descent',
    TECH_V200_DIVINE_POSSESSION_ACT_04: 'sig_pantheon_deity_descent',
    TECH_V230_DIVINE_POSSESSION_SUPPORT: 'sig_pantheon_deity_descent',
    TECH_V230_DIVINE_POSSESSION_DEFENSE: 'sig_golden_buddha_bell',
    TECH_V230_DIVINE_CHANNELER_FORBIDDEN: 'sig_thunder_god_halberd',
    TECH_V200_DIVINE_CHANNELER_ACT_04: 'sig_thunder_god_halberd',
    TECH_V230_DIVINE_CHANNELER_SUPPORT: 'sig_pantheon_deity_descent',
    TECH_V230_DIVINE_CHANNELER_DEFENSE: 'sig_thunder_god_halberd',
    TECH_V230_VOID_HERETIC_PACT_FORBIDDEN: 'sig_eldritch_void_rift',
    TECH_V200_VOID_HERETIC_PACT_ACT_04: 'sig_eldritch_void_rift',
    TECH_V230_VOID_HERETIC_PACT_SUPPORT: 'sig_eldritch_void_rift',
    TECH_V230_VOID_HERETIC_PACT_DEFENSE: 'sig_eldritch_void_rift',
    TECH_V230_OCCULT_MAGE_FORBIDDEN: 'sig_khmer_sacred_yantra_seal',
    TECH_V200_OCCULT_MAGE_ACT_04: 'sig_khmer_sacred_yantra_seal',
    TECH_V230_OCCULT_MAGE_SUPPORT: 'sig_khmer_sacred_yantra_seal',
    TECH_V230_OCCULT_MAGE_DEFENSE: 'sig_khmer_sacred_yantra_seal',
    TECH_V240_FOCUS_02: 'sig_khmer_sacred_yantra_seal',
    TECH_V230_DEVOURING_FLESH_FORBIDDEN: 'sig_blood_lotus_apocalypse',
    TECH_V200_DEVOURING_FLESH_ACT_04: 'sig_blood_lotus_apocalypse',
    TECH_V230_DEVOURING_FLESH_SUPPORT: 'sig_blood_beast_claw',
    TECH_V230_DEVOURING_FLESH_DEFENSE: 'sig_blood_beast_claw',
    TECH_V230_NETHER_GRAVE_FORBIDDEN: 'sig_nether_grave_soul_eruption',
    TECH_V200_NETHER_GRAVE_ACT_04: 'sig_nether_grave_soul_eruption',
    TECH_V230_NETHER_GRAVE_SUPPORT: 'sig_nether_grave_soul_eruption',
    TECH_V230_NETHER_GRAVE_DEFENSE: 'sig_nether_grave_soul_eruption',
    TECH_V230_ANCESTRAL_RITUAL_FORBIDDEN: 'sig_nether_grave_soul_eruption',
    TECH_V200_ANCESTRAL_RITUAL_ACT_04: 'sig_nether_grave_soul_eruption',
    TECH_V230_ANCESTRAL_RITUAL_SUPPORT: 'sig_golden_buddha_bell',
    TECH_V230_ANCESTRAL_RITUAL_DEFENSE: 'sig_golden_buddha_bell',
    TECH_V230_TIDE_VOYAGER_FORBIDDEN: 'sig_tidal_maelstrom_anchors',
    TECH_V200_TIDE_VOYAGER_ACT_04: 'sig_tidal_maelstrom_anchors',
    TECH_V230_TIDE_VOYAGER_SUPPORT: 'sig_shennong_emerald_lotus',
    TECH_V230_TIDE_VOYAGER_DEFENSE: 'sig_frost_lotus_domain',
    TECH_UNI_V230_024: 'sig_tidal_maelstrom_anchors',
    TECH_V230_LORE_ARCHIVIST_FORBIDDEN: 'sig_heaven_brush_astrolabe',
    TECH_V200_LORE_ARCHIVIST_ACT_04: 'sig_heaven_brush_astrolabe',
    TECH_V230_LORE_ARCHIVIST_SUPPORT: 'sig_heaven_brush_astrolabe',
    TECH_V230_LORE_ARCHIVIST_DEFENSE: 'sig_heaven_brush_astrolabe',
    TECH_UNI_V230_030: 'sig_golden_abacus_wheel',
    TECH_V230_FORTUNE_GAMBLER_FORBIDDEN: 'sig_golden_abacus_wheel',
    TECH_V200_FORTUNE_GAMBLER_ACT_04: 'sig_golden_abacus_wheel',
    TECH_V230_FORTUNE_GAMBLER_SUPPORT: 'sig_golden_abacus_wheel',
    TECH_V230_FORTUNE_GAMBLER_DEFENSE: 'sig_golden_abacus_wheel',
    TECH_V230_SPIRIT_HUSBANDRY_FORBIDDEN: 'sig_myriad_venom_miasma',
    TECH_V200_SPIRIT_HUSBANDRY_ACT_04: 'sig_shennong_emerald_lotus',
    TECH_V230_SPIRIT_HUSBANDRY_SUPPORT: 'sig_shennong_emerald_lotus',
    TECH_V230_SPIRIT_HUSBANDRY_DEFENSE: 'sig_shennong_emerald_lotus',
    TECH_V230_ARENA_GLORY_FORBIDDEN: 'sig_blazing_dragon_wave',
    TECH_V200_ARENA_GLORY_ACT_04: 'sig_imperial_eight_gates_banner',
    TECH_V230_ARENA_GLORY_SUPPORT: 'sig_imperial_eight_gates_banner',
    TECH_V230_ARENA_GLORY_DEFENSE: 'sig_golden_buddha_bell',

    // Additional Era-5 Signature Manuals (Defense / Support / Forbidden / Qinggong)
    FORB_VOID_APOCALYPSE_TABOO_T6: 'sig_eldritch_void_rift',
    FORB_LIFESPAN_HEAVEN_DEFIANCE_T5: 'sig_blood_lotus_apocalypse',
    FORB_SOUL_DEVOURING_ABYSS_T4: 'sig_soul_scorching_flame',
    FORB_CORPSE_GU_NECROMANCY_T3: 'sig_nether_grave_soul_eruption',
    DEF_MYRIAD_SWORD_CURTAIN_T3: 'sig_meteor_sword_rain',
    DEF_TAIJI_STAR_SHIFT_T3: 'sig_taiji_yin_yang_crush',
    DEF_FIVE_ELEMENT_THORN_T4: 'sig_blazing_dragon_wave',
    SUP_GOLDEN_NEEDLE_MERIDIAN_T3: 'sig_shennong_emerald_lotus',

    // JS2-v2.6.0 additions: selected techniques had no explicit or fallback
    // Signature VFX in the baseline catalog; see docs/audits/SKILL_VFX_ASSIGNMENT_REGISTRY.md.
    ART190_XIAN_016: 'sig_bamboo_reed_sword',
    ART190_XIAN_028: 'sig_magnetic_arsenal_draw',
    ART190_BODY_008: 'sig_iron_rhino_ramming',
    ART190_BODY_025: 'sig_eightfold_earthquake',
    ART190_BODY_035: 'sig_twin_thunder_hammers',
    ART190_GOD_007: 'sig_divine_bell_mind_ripple',
    ART190_GOD_024: 'sig_primordial_stone_tortoise',
    ART190_GOD_035: 'sig_thousand_faith_link',
    ART_V112_SOUL_MOUNTAIN_RIVER_SCROLL_T4: 'sig_mountain_river_scroll',
    ART_V112_SOUL_SEVEN_EMOTION_MIRAGE_T4: 'sig_seven_emotion_mirage',
    ART_V112_SOUL_MIND_BLADE_FLASH_T3: 'sig_mind_blade_flash',
    ART_BEAST_SOV_003: 'sig_myriad_beast_pack',
    ART_BEAST_SOV_006: 'sig_gu_insect_swarm',
    TECH_V200_SPIRIT_HUSBANDRY_ACT_02: 'sig_iron_thorn_vine_bind',
    TECH_V200_ARENA_GLORY_ACT_03: 'sig_arena_crowd_roar'
  };

  // Common T1/T2 presentation is separate from rare Signature/Legendary art.
  // These tables are visual metadata only; combat events and saved state stay unchanged.
  SK.COMMON_VFX_CATALOG = {
  "qi_palm": {
    "nameTh": "ฝ่ามือปราณอ่อน",
    "primary": "#91cbb5"
  },
  "stone_fist": {
    "nameTh": "หมัดหิน",
    "primary": "#c1a88a"
  },
  "heart_ward": {
    "nameTh": "ศรัทธาคุ้มใจ",
    "primary": "#dfca86"
  },
  "blood_drop": {
    "nameTh": "หยดโลหิต",
    "primary": "#c97482"
  },
  "mind_ripple": {
    "nameTh": "ระลอกจิต",
    "primary": "#b69ac9"
  },
  "paw_signal": {
    "nameTh": "รอยเท้าอสูร",
    "primary": "#bbbd88"
  },
  "heal_sprout": {
    "nameTh": "ต้นอ่อนสมานแผล",
    "primary": "#8ac89c"
  },
  "qi_thread": {
    "nameTh": "เส้นปราณประสาน",
    "primary": "#87bfc9"
  },
  "forge_spark": {
    "nameTh": "สะเก็ดเตาหลอม",
    "primary": "#dba574"
  },
  "gear_tick": {
    "nameTh": "ฟันจักรเล็ก",
    "primary": "#a8b7b6"
  },
  "sword_drizzle": {
    "nameTh": "พิรุณกระบี่เบา",
    "primary": "#a1c6d5"
  },
  "thorn_whip": {
    "nameTh": "แส้เถาวัลย์",
    "primary": "#9fbd87"
  },
  "silver_pin": {
    "nameTh": "เข็มเงิน",
    "primary": "#c0cdd5"
  },
  "twin_balance": {
    "nameTh": "คมคู่สมดุล",
    "primary": "#c6b9ce"
  },
  "star_guard": {
    "nameTh": "เกราะดาวเล็ก",
    "primary": "#b3c9d4"
  },
  "bronze_skin": {
    "nameTh": "แผ่นเกราะสำริด",
    "primary": "#c3ab7b"
  },
  "frost_knuckle": {
    "nameTh": "ผลึกหมัดเย็น",
    "primary": "#94c4d6"
  },
  "thunder_tap": {
    "nameTh": "ประกายอัสนี",
    "primary": "#c8ba77"
  },
  "incense_wisp": {
    "nameTh": "ควันธูปบาง",
    "primary": "#b5a5c2"
  },
  "ink_bind": {
    "nameTh": "หมึกสะกดจุด",
    "primary": "#91acb6"
  },
  "dream_haze": {
    "nameTh": "หมอกฝัน",
    "primary": "#b6a6cf"
  },
  "poison_barb": {
    "nameTh": "หยดพิษเงี่ยงเข็ม",
    "primary": "#a5be7b"
  },
  "soul_needle": {
    "nameTh": "เข็มจิต",
    "primary": "#baa2d1"
  },
  "straight_jab": {
    "nameTh": "หมัดตรง",
    "primary": "#d1b097"
  },
  "draw_cut": {
    "nameTh": "คมชักดาบ",
    "primary": "#c3cbd2"
  },
  "arrow_fletch": {
    "nameTh": "ศรขนนก",
    "primary": "#b6c9a4"
  },
  "staff_broom": {
    "nameTh": "พลองกวาดฝุ่น",
    "primary": "#bdab8e"
  },
  "spear_point": {
    "nameTh": "ปลายทวน",
    "primary": "#c4b9ac"
  },
  "seal_knot": {
    "nameTh": "ปมตราผนึก",
    "primary": "#c3a58c"
  },
  "root_stance": {
    "nameTh": "รากยืนมั่น",
    "primary": "#a6b08b"
  }
};
  SK.TECH_TO_COMMON_VFX = {
  "MP_BASE_XIAN": "qi_palm",
  "ART190_XIAN_003": "qi_palm",
  "MP_BASE_BODY": "stone_fist",
  "ART190_BODY_001": "stone_fist",
  "MP_BASE_GOD": "heart_ward",
  "ART190_GOD_001": "heart_ward",
  "MP_BASE_DEMON": "blood_drop",
  "ART_DEMON_BLOOD_SIPHON_CLAW_T1": "blood_drop",
  "MP_SPEAR_BLOOD_IMPALE_T2": "blood_drop",
  "MP_BASE_HEART_SOUL": "mind_ripple",
  "ART_SOUL_ZEN_BELL_T1": "mind_ripple",
  "MP_BASE_BEAST_SOVEREIGN": "paw_signal",
  "MP_BASE_SAGE_SUPPORT": "heal_sprout",
  "ART190_GOD_031": "heal_sprout",
  "INNATE_ELIXIR_DAO_CAULDRON": "heal_sprout",
  "INNATE_MERCY_DEITY_LOTUS_GRACE": "heal_sprout",
  "ART190_XIAN_061": "qi_thread",
  "ART190_XIAN_062": "qi_thread",
  "MP_BASE_CRAFT_CREATION": "forge_spark",
  "MP_BLADE_FLAME_SABER_T2": "forge_spark",
  "MP_BASE_MECH_PUPPET": "gear_tick",
  "ART190_XIAN_001": "sword_drizzle",
  "SRC110_NW_ART_002": "sword_drizzle",
  "ART190_XIAN_011": "thorn_whip",
  "MP_STAFF_VINE_SWEEP_T1": "thorn_whip",
  "ART190_XIAN_021": "silver_pin",
  "MP_FOCUS_ACUPOINT_NEEDLE_T2": "silver_pin",
  "ART190_XIAN_053": "silver_pin",
  "ART190_XIAN_013": "twin_balance",
  "INNATE_YIN_YANG_TAIJI_WHEEL": "twin_balance",
  "ART190_XIAN_023": "star_guard",
  "MP_STAFF_WALL": "star_guard",
  "MP_AGNOSTIC_BREATH_SHIELD_T2": "star_guard",
  "ART190_BODY_012": "bronze_skin",
  "ART190_BODY_031": "bronze_skin",
  "ART190_BODY_021": "frost_knuckle",
  "ART_DEMON_NETHER_PALM_T1": "frost_knuckle",
  "ART190_BODY_013": "thunder_tap",
  "ART190_GOD_011": "thunder_tap",
  "MP_SPEAR_THUNDER_COIL_T2": "thunder_tap",
  "ART190_GOD_033": "incense_wisp",
  "ART_SOUL_INK_DOT_T1": "ink_bind",
  "ART_V112_SOUL_SPIRIT_INK_STROKE_T2": "ink_bind",
  "ART_SOUL_MIST_DREAM_T1": "dream_haze",
  "ART_DEMON_VENOM_NEEDLE_T1": "poison_barb",
  "ART_V112_DEMON_FIVE_VENOM_PALM_T2": "poison_barb",
  "MP_BOW_VENOM_BARB_T1": "poison_barb",
  "ART_SOUL_MIND_NEEDLE_T1": "soul_needle",
  "ART_SOUL_TELEKINESIS_BLADE_T2": "soul_needle",
  "MP_FIST_IRON_JAB_T1": "straight_jab",
  "MP_BLADE_SWIFT_DRAW_T1": "draw_cut",
  "MP_BLADE_IRON_CLEAVER_T2": "draw_cut",
  "MP_BLADE_SHADOW": "draw_cut",
  "ART_DEMON_SHADOW_STRIKE_T1": "draw_cut",
  "MP_BOW_BASIC": "arrow_fletch",
  "MP_BOW_IRON_DRAW_T1": "arrow_fletch",
  "MP_BOW_RAIN": "arrow_fletch",
  "MP_BOW_RAPID_VOLLEY_T2": "arrow_fletch",
  "MP_STAFF_SWEEP_BASIC_T1": "staff_broom",
  "MP_STAFF_IRON_REVOLVE_T2": "staff_broom",
  "MP_SPEAR_MILITARY_DRILL_T1": "spear_point",
  "MP_SPEAR_LINE": "spear_point",
  "MP_SPEAR_WIND_THRUST_T1": "spear_point",
  "MP_FOCUS_SEAL": "seal_knot",
  "ART190_GOD_012": "seal_knot",
  "MP_FIST_JOINT_LOCK_CLAW_T2": "root_stance"
};
  SK.PASSIVE_TO_COMMON_VFX = {
  "PASS_IRON_SHIRT_T1": "bronze_skin",
  "PASS_ROOTED_STANCE_T2": "root_stance",
  "MP_STAFF_ROOT": "root_stance",
  "PASS_QUIET_HEART_T1": "mind_ripple",
  "PASS_DEEP_RESERVOIR_T1": "qi_thread",
  "MP_FIST_BREATH": "qi_palm",
  "PASS_LASTING_BREATH_T2": "heal_sprout",
  "MP_BOW_FOCUS": "arrow_fletch",
  "PASS_BOW_STILLNESS_T1": "arrow_fletch",
  "MP_ROBE_WARD": "star_guard",
  "PASS_SWORD_FAMILIAR_T1": "draw_cut",
  "PASS_MEASURED_FOOTWORK_T1": "staff_broom"
};
  SK.STATUS_TO_COMMON_VFX = {
  "burn": "forge_spark",
  "bleed": "blood_drop",
  "poison": "poison_barb",
  "slow": "root_stance",
  "stun": "star_guard",
  "silence": "seal_knot",
  "weaken": "mind_ripple",
  "blind": "dream_haze",
  "armorbreak": "bronze_skin",
  "mdefbreak": "ink_bind",
  "exposed": "bronze_skin",
  "leech": "thorn_whip",
  "guardUp": "bronze_skin",
  "shield": "star_guard",
  "counter": "twin_balance",
  "haste": "qi_thread",
  "evadeUp": "incense_wisp",
  "morale": "heart_ward",
  "holyAura": "star_guard",
  "critUp": "thunder_tap",
  "vitalRegen": "heal_sprout",
  "qiConduit": "qi_thread"
};
  SK.resolveCommonVfx = (techOrMove, moveOpt) => {
    if (!techOrMove) return null;
    const id = techOrMove.tech || techOrMove.id;
    const tech = g.CULT && g.CULT.tech ? g.CULT.tech(id) : techOrMove;
    if (!tech || tech.legendary || tech.tier > 2 || tech.signatureVfx || tech.fxKind ||
        SK.TECH_TO_SIGNATURE_VFX[id] || techOrMove.signatureVfx ||
        (moveOpt && moveOpt.signatureVfx)) return null;
    const moveId = moveOpt && moveOpt.id;
    const move = (tech.moveDefs || []).find(m => m.id === moveId);
    if (move && (move.signatureVfx || move.fxKind || move.legendary)) return null;
    // The starter healer has a healing move and a qi-support move, not one image for both.
    if (id === 'MP_BASE_SAGE_SUPPORT' && moveId === 'MP_BASE_SAGE_SUPPORT_M2') return 'qi_thread';
    return SK.TECH_TO_COMMON_VFX[id] || null;
  };


  // Ordinary-tier progression contract. T4–T7 are reserved design budgets, not enabled routes.
  SK.NONLEGENDARY_VFX_BUDGET = {
    "1": {
      "life": 540,
      "rMin": 11,
      "rMax": 15,
      "marks": 3,
      "planned": false
    },
    "2": {
      "life": 540,
      "rMin": 11,
      "rMax": 15,
      "marks": 3,
      "planned": false
    },
    "3": {
      "life": 680,
      "rMin": 16,
      "rMax": 20,
      "marks": 5,
      "planned": false
    },
    "4": {
      "life": 850,
      "rMin": 24,
      "rMax": 29,
      "marks": 6,
      "planned": true
    },
    "5": {
      "life": 1050,
      "rMin": 32,
      "rMax": 39,
      "marks": 8,
      "planned": true
    },
    "6": {
      "life": 1250,
      "rMin": 42,
      "rMax": 47,
      "marks": 10,
      "planned": true
    },
    "7": {
      "life": 1450,
      "rMin": 50,
      "rMax": 56,
      "marks": 12,
      "planned": false
    }
  };

  SK.T3_VFX_CATALOG = {
    "violet_point": {
      "nameTh": "ดัชนีอัสนีม่วง",
      "primary": "#b6a2d6",
      "accent": "#d6c7ec"
    },
    "moon_pool": {
      "nameTh": "กระบี่จันทร์สะท้อนสระ",
      "primary": "#9bbfd3",
      "accent": "#d4e1e8"
    },
    "layered_mist": {
      "nameTh": "ฝ่ามือม่านหมอก",
      "primary": "#b8adc9",
      "accent": "#ddd5e5"
    },
    "autumn_blades": {
      "nameTh": "คมใบไม้สารท",
      "primary": "#c7ab79",
      "accent": "#e6d3a7"
    },
    "solar_knuckle": {
      "nameTh": "หมัดเพลิงหลอมเหล็ก",
      "primary": "#d5a173",
      "accent": "#efd2a0"
    },
    "frost_rake": {
      "nameTh": "กรงเล็บหมีเหมันต์",
      "primary": "#95bdcf",
      "accent": "#cde3eb"
    },
    "thorn_guard": {
      "nameTh": "กายาหนามสะท้อนแผล",
      "primary": "#a4b2a2",
      "accent": "#d0d6ba"
    },
    "faith_lamella": {
      "nameTh": "เกราะศรัทธาซ้อนแผ่น",
      "primary": "#d0bc83",
      "accent": "#eee0b1"
    },
    "curse_eye": {
      "nameTh": "เนตรสะท้อนคำสาป",
      "primary": "#b5b2cc",
      "accent": "#e1d9ed"
    },
    "thread_shear": {
      "nameTh": "ตัดสายใยมาร",
      "primary": "#b0c7bb",
      "accent": "#e0e7ca"
    },
    "shadow_stiletto": {
      "nameTh": "มีดสั้นเงาจาง",
      "primary": "#a29aae",
      "accent": "#d1bfd0"
    },
    "bone_ribs": {
      "nameTh": "เกราะกระดูกค้ำกาย",
      "primary": "#c8c4ae",
      "accent": "#e6ddc7"
    },
    "blood_furnace": {
      "nameTh": "เตาหลอมโลหิต",
      "primary": "#c2838c",
      "accent": "#e2b69a"
    },
    "cloud_bodkin": {
      "nameTh": "ศรทะลวงเมฆ",
      "primary": "#9ebcca",
      "accent": "#d9e1dc"
    },
    "iron_breach": {
      "nameTh": "ทวนทลายค่าย",
      "primary": "#b7b7aa",
      "accent": "#e1d6b9"
    },
    "gravity_staff": {
      "nameTh": "พลองทุบศิลา",
      "primary": "#b8a78c",
      "accent": "#ddcdb1"
    },
    "cross_execution": {
      "nameTh": "ดาบสะบั้นไขว้",
      "primary": "#c1a0a1",
      "accent": "#e1c7b8"
    },
    "abacus_grid": {
      "nameTh": "ลูกคิดคำนวณศึก",
      "primary": "#b9bb8f",
      "accent": "#e0dbb3"
    },
    "baji_impact": {
      "nameTh": "ไหล่กระแทกแปดขั้ว",
      "primary": "#bfa88d",
      "accent": "#e4d2b7"
    },
    "blade_disc": {
      "nameTh": "กงล้อใบมีด",
      "primary": "#a9b8c1",
      "accent": "#dae0de"
    },
    "karma_links": {
      "nameTh": "ห่วงโซ่ชะตา",
      "primary": "#b8a6c4",
      "accent": "#ded2db"
    },
    "healing_chime": {
      "nameTh": "ระฆังหยกประโลม",
      "primary": "#9fc8b3",
      "accent": "#d5e7c7"
    },
    "zither_breeze": {
      "nameTh": "สายพิณประสานวายุ",
      "primary": "#93bdbe",
      "accent": "#c9dfd1"
    },
    "frost_harmony": {
      "nameTh": "พิณเหมันต์ชโลมปราณ",
      "primary": "#a0c3d0",
      "accent": "#d8e5ed"
    }
  };
  SK.TECH_TO_T3_VFX = {
    "ART190_XIAN_004": "violet_point",
    "ART190_XIAN_005": "moon_pool",
    "ART190_XIAN_015": "layered_mist",
    "ART190_XIAN_035": "autumn_blades",
    "ART190_BODY_004": "solar_knuckle",
    "ART190_BODY_005": "frost_rake",
    "ART190_BODY_036": "thorn_guard",
    "ART190_GOD_015": "faith_lamella",
    "ART190_GOD_016": "curse_eye",
    "ART190_GOD_025": "thread_shear",
    "ART_V112_DEMON_SILENT_DAGGER_T3": "shadow_stiletto",
    "ART_V112_DEMON_BONE_ARMOR_SHIELD_T3": "bone_ribs",
    "ART_DEMON_CRIMSON_FURNACE_T3": "blood_furnace",
    "MP_BOW_PIERCE_CLOUD": "cloud_bodkin",
    "MP_BOW_ARMOR_BODKIN_T3": "cloud_bodkin",
    "MP_SPEAR_IRON_BREAKER_T3": "iron_breach",
    "MP_STAFF_CRUSHING_BLOW_T3": "gravity_staff",
    "MP_BLADE_CROSS_EXECUTION_T3": "cross_execution",
    "MP_FOCUS_ABACUS_TACTIC_T3": "abacus_grid",
    "MP_FIST_BAJI_SHOULDER_T3": "baji_impact",
    "ART_MECH_PUPPET_005": "blade_disc",
    "ART_KARMA_SAMSARA_007": "karma_links",
    "ART_V210_AUX_SOUL_CHIME": "healing_chime",
    "ART_SAGE_SUP_002": "zither_breeze",
    "ART_V212_XIAN_ZITHER_T3": "zither_breeze",
    "TECH_V222_09": "frost_harmony"
  };
  SK.PASSIVE_TO_T3_VFX = {
    "PASS_BOW_HAWK_EYE_T3": "cloud_bodkin",
    "PASS_IRON_SHIRT_T3": "faith_lamella",
    "PASS_BROKEN_RHYTHM_T3": "thread_shear",
    "PASS_MIRROR_HEART_T3": "curse_eye",
    "PASS_FOCUS_MERIDIAN_T3": "violet_point",
    "PASS_SWORD_INTENT_T3": "autumn_blades",
    "PASS_GHOST_SHADOW_STEP_T3": "shadow_stiletto",
    "PASS_POISON_BLOOD_AFFINITY_T3": "blood_furnace"
  };
  SK.STATUS_TO_T3_VFX = {
    "swiftWind": "zither_breeze",
    "clarityLotus": "healing_chime",
    "qiBarrierShell": "faith_lamella",
    "frostBarrier": "frost_harmony",
    "boneArmor": "bone_ribs",
    "parryCounter": "cross_execution"
  };
  SK.resolveT3Vfx = (techOrMove, moveOpt) => {
    if (!techOrMove) return null;
    const id = techOrMove.tech || techOrMove.id;
    const tech = g.CULT && g.CULT.tech ? g.CULT.tech(id) : techOrMove;
    if (!tech || tech.tier !== 3 || tech.legendary || tech.fxKind || tech.signatureVfx ||
        techOrMove.signatureVfx || SK.TECH_TO_SIGNATURE_VFX[id] ||
        (moveOpt && (moveOpt.signatureVfx || moveOpt.fxKind || moveOpt.legendary))) return null;
    const moveId = moveOpt && (moveOpt.moveId || moveOpt.id);
    const move = (tech.moveDefs || []).find(m => m.id === moveId);
    if (move && (move.signatureVfx || move.fxKind || move.legendary || move.arch === 'forbid')) return null;
    return SK.TECH_TO_T3_VFX[id] || null;
  };

  // Reviewed T7 IDs, not an automatic route for future/unreviewed content.
  SK.T7_VFX_CATALOG = {
    "ART190_XIAN_040": {
      "family": "myriad_blades",
      "variant": 1,
      "oldSignature": "sig_meteor_sword_rain",
      "nameTh": "เพลงกระบี่เพลิงเมฆาผลาญศึก"
    },
    "ART190_XIAN_075": {
      "family": "myriad_blades",
      "variant": 2,
      "oldSignature": "sig_blood_lotus_apocalypse",
      "nameTh": "วิชาต้องห้าม • สังเวยอายุขัยเปิดเนตรดารามรณะ"
    },
    "ART190_XIAN_078": {
      "family": "myriad_blades",
      "variant": 3,
      "oldSignature": "sig_meteor_sword_rain",
      "nameTh": "วิชาต้องห้าม • ย้อนชีพจรฝืนทะลวงพันธนาการ"
    },
    "ART190_BODY_040": {
      "family": "body_breaker",
      "variant": 4,
      "oldSignature": "sig_eight_directions_palm",
      "nameTh": "หมัดบรรพกาลแยกแผ่นดิน"
    },
    "ART190_BODY_075": {
      "family": "beast_totem",
      "variant": 5,
      "oldSignature": "sig_blood_lotus_apocalypse",
      "nameTh": "วิชาต้องห้าม • กลืนกินแก่นอสูรสดกลางศึก"
    },
    "ART190_BODY_078": {
      "family": "blood_furnace",
      "variant": 6,
      "oldSignature": "sig_blood_beast_claw",
      "nameTh": "วิชาต้องห้าม • สูบเลือดศัตรูหล่อเลี้ยงกายา"
    },
    "ART190_GOD_040": {
      "family": "celestial_edict",
      "variant": 7,
      "oldSignature": "sig_pantheon_deity_descent",
      "nameTh": "มหาเวทอาณาจักรเทพจุติกลางศึก"
    },
    "ART190_GOD_075": {
      "family": "beast_totem",
      "variant": 8,
      "oldSignature": "sig_soul_scorching_flame",
      "nameTh": "วิชาต้องห้าม • บังคับวิญญาณอสูรสังเวยศึก"
    },
    "ART190_GOD_078": {
      "family": "celestial_edict",
      "variant": 9,
      "oldSignature": "sig_nine_suns_eye",
      "nameTh": "วิชาต้องห้าม • ลวงจิตสาวกมารสูบพลังชีวิต"
    },
    "ART_V112_DEMON_HEAVEN_DEVOURING_CANON_T7": {
      "family": "blood_furnace",
      "variant": 10,
      "oldSignature": "sig_blood_lotus_apocalypse",
      "nameTh": "มหาเทวคัมภีร์มารกลืนสวรรค์ทลายสามภพ"
    },
    "ART_V112_SOUL_FORMLESS_MIND_SWORD_T7": {
      "family": "void_blade",
      "variant": 11,
      "oldSignature": "sig_void_spatial_slash",
      "nameTh": "มหาเทวคัมภีร์กระบี่จิตไร้รูปสะบั้นวิญญาณ"
    },
    "MP_SPEAR_SOVEREIGN_SKY_SPLIT_T7": {
      "family": "sky_spear",
      "variant": 12,
      "oldSignature": null,
      "nameTh": "มหาคัมภีร์ทวนราชันย์แหวกสวรรค์"
    },
    "MP_SPEAR_PRIMORDIAL_VOID_T7": {
      "family": "sky_spear",
      "variant": 13,
      "oldSignature": "sig_void_spatial_slash",
      "nameTh": "มหาคัมภีร์ทวนจิตสุญตาบรรพกาล"
    },
    "MP_STAFF_WORLD_BREAKER_T7": {
      "family": "earth_staff",
      "variant": 14,
      "oldSignature": null,
      "nameTh": "มหาคัมภีร์พลองบรรพกาลทลายพิภพ"
    },
    "MP_STAFF_EARTH_GOD_BLESSING_T7": {
      "family": "earth_staff",
      "variant": 15,
      "oldSignature": "sig_shennong_emerald_lotus",
      "nameTh": "มหาเวทคฑาเทพปฐพีชุบชีวิตหมื่นพฤกษา"
    },
    "MP_BOW_NINE_SUNS_FALL_T7": {
      "family": "sun_arrow",
      "variant": 16,
      "oldSignature": "sig_nine_suns_eye",
      "nameTh": "มหาคัมภีร์ศรราชันย์ยิงดับเก้าตะวัน"
    },
    "MP_BOW_SUN_GOD_VERDICT_T7": {
      "family": "sun_arrow",
      "variant": 17,
      "oldSignature": "sig_nine_suns_eye",
      "nameTh": "มหาเทวคัมภีร์ศรสุริยเทพพิพากษาสามภพ"
    },
    "MP_BOW_ASTRAL_GALAXY_T7": {
      "family": "galaxy_arrow",
      "variant": 18,
      "oldSignature": "sig_meteor_sword_rain",
      "nameTh": "มหาคัมภีร์ศรทางช้างเผือกทะลวงจักรวาล"
    },
    "MP_BLADE_SOVEREIGN_HEAVEN_REND_T7": {
      "family": "myriad_blades",
      "variant": 19,
      "oldSignature": null,
      "nameTh": "มหาคัมภีร์จอมดาบผ่าสวรรค์ไร้พ่าย"
    },
    "MP_BLADE_HEART_SOUL_SEVER_T7": {
      "family": "void_blade",
      "variant": 20,
      "oldSignature": "sig_void_spatial_slash",
      "nameTh": "มหาคัมภีร์ดาบจิตตัดขาดวัฏสงสาร"
    },
    "MP_BLADE_FORBIDDEN_DEMON_EDGE_T7": {
      "family": "beast_totem",
      "variant": 21,
      "oldSignature": "sig_blood_beast_claw",
      "nameTh": "วิชาต้องห้าม • ดาบโลหิตอสูรกลืนอายุขัย"
    },
    "MP_FOCUS_PRIMORDIAL_BRUSH_T7": {
      "family": "rune_brush",
      "variant": 22,
      "oldSignature": "sig_heaven_brush_astrolabe",
      "nameTh": "มหาคัมภีร์พู่กันไร้ลักษณ์จารึกกฎเกณฑ์"
    },
    "MP_FOCUS_DREAM_TAPESTRY_T7": {
      "family": "rune_brush",
      "variant": 23,
      "oldSignature": "sig_heaven_brush_astrolabe",
      "nameTh": "มหาคัมภีร์พู่กันทอฝันสร้างโลกมายา"
    },
    "MP_SWORD_MYRIAD_RETURN_ONE_T7": {
      "family": "myriad_blades",
      "variant": 24,
      "oldSignature": "sig_meteor_sword_rain",
      "nameTh": "มหาคัมภีร์หมื่นกระบี่คืนสู่ความเรียบง่าย"
    },
    "MP_FIST_MORTAL_GOD_SHATTER_T7": {
      "family": "body_breaker",
      "variant": 25,
      "oldSignature": "sig_eight_directions_palm",
      "nameTh": "มหาคัมภีร์หมัดกายาเนื้อหนังทลายสวรรค์"
    },
    "ART_V212_SAGE_APEX_T7": {
      "family": "vital_garden",
      "variant": 26,
      "oldSignature": "sig_shennong_emerald_lotus",
      "nameTh": "มหาคัมภีร์อมตะเสินหนงชุบชีวาเก้าสวรรค์"
    },
    "ART_CRAFT_012": {
      "family": "forge_lattice",
      "variant": 27,
      "oldSignature": "sig_divine_crucible_forge",
      "nameTh": "มหาคัมภีร์รังสรรค์โอสถและศาสตราเทวะบรรพกาล"
    },
    "TECH_V215_ZITHER_ACT_08": {
      "family": "zither_chords",
      "variant": 28,
      "oldSignature": "sig_heavens_sound_requiem",
      "nameTh": "ทิพยสังคีตสวรรค์เก้าดารา"
    },
    "TECH_V215_BRUSH_ACT_08": {
      "family": "rune_brush",
      "variant": 29,
      "oldSignature": "sig_heaven_brush_astrolabe",
      "nameTh": "มหาพู่กันเทวะรังสรรค์หมื่นยันต์"
    },
    "TECH_V215_WHIP_ACT_08": {
      "family": "fate_whip",
      "variant": 30,
      "oldSignature": "sig_taiji_yin_yang_crush",
      "nameTh": "แส้เทวะสะบัดคว่ำแปดพิภพ"
    },
    "TECH_V234_XIAN_ACT_06": {
      "family": "zither_chords",
      "variant": 31,
      "oldSignature": "sig_heavens_sound_requiem",
      "nameTh": "เคล็ดวิชาพิณสวรรค์สุญตา (เซียนอมตะ)"
    },
    "TECH_V234_XIAN_ACT_12": {
      "family": "cloud_thunder",
      "variant": 32,
      "oldSignature": "sig_imperial_eight_gates_banner",
      "nameTh": "เคล็ดวิชาอัสนีม่วงไท่เสวียน (เซียนอมตะ)"
    },
    "TECH_V234_BODY_ACT_06": {
      "family": "sky_spear",
      "variant": 33,
      "oldSignature": "sig_eight_directions_palm",
      "nameTh": "เคล็ดวิชาทวนโลหิตผ่าปฐพี (หลอมกายา)"
    },
    "TECH_V234_BODY_ACT_12": {
      "family": "forge_lattice",
      "variant": 34,
      "oldSignature": "sig_imperial_eight_gates_banner",
      "nameTh": "เคล็ดวิชาชีพจรมังกรเหล็กไหล (หลอมกายา)"
    },
    "TECH_V234_GOD_ACT_06": {
      "family": "celestial_edict",
      "variant": 35,
      "oldSignature": "sig_nine_suns_eye",
      "nameTh": "เคล็ดวิชาโองการชะตาสวรรค์ (เทวานุภาพ)"
    },
    "TECH_V234_GOD_ACT_12": {
      "family": "celestial_edict",
      "variant": 36,
      "oldSignature": "sig_imperial_eight_gates_banner",
      "nameTh": "เคล็ดวิชาวิหารเทวานุภาพ (เทวานุภาพ)"
    },
    "TECH_V234_DEMON_ACT_06": {
      "family": "fate_whip",
      "variant": 37,
      "oldSignature": "sig_nether_grave_soul_eruption",
      "nameTh": "เคล็ดวิชาโซ่กระดูกยมโลก (วิถีมาร)"
    },
    "TECH_V234_DEMON_ACT_12": {
      "family": "beast_totem",
      "variant": 38,
      "oldSignature": "sig_blood_lotus_apocalypse",
      "nameTh": "เคล็ดวิชาค่ายกลหมื่นอสูรคลั่ง (วิถีมาร)"
    },
    "TECH_V234_HEART_SOUL_ACT_06": {
      "family": "dream_loom",
      "variant": 39,
      "oldSignature": "sig_immortal_crane_feather_storm",
      "nameTh": "เคล็ดวิชาม่านมายาความฝัน (จิตวิญญาณ)"
    },
    "TECH_V234_HEART_SOUL_ACT_12": {
      "family": "rune_brush",
      "variant": 40,
      "oldSignature": "sig_imperial_eight_gates_banner",
      "nameTh": "เคล็ดวิชาอักษรสวรรค์สะกดมาร (จิตวิญญาณ)"
    },
    "TECH_V234_MECH_PUPPET_ACT_06": {
      "family": "puppet_lines",
      "variant": 41,
      "oldSignature": "sig_myriad_puppet_barrage",
      "nameTh": "เคล็ดวิชากงล้อฟันเฟืองดารา (กลไกหุ่นเชิด)"
    },
    "TECH_V234_MECH_PUPPET_ACT_12": {
      "family": "puppet_lines",
      "variant": 42,
      "oldSignature": "sig_myriad_puppet_barrage",
      "nameTh": "เคล็ดวิชาค่ายกลจักรกลสังหาร (กลไกหุ่นเชิด)"
    },
    "TECH_V234_KARMA_SAMSARA_ACT_06": {
      "family": "fate_whip",
      "variant": 43,
      "oldSignature": "sig_shennong_emerald_lotus",
      "nameTh": "เคล็ดวิชาบัวขาวชำระวิบาก (วิบากวัฏสงสาร)"
    },
    "TECH_V234_KARMA_SAMSARA_ACT_12": {
      "family": "celestial_edict",
      "variant": 44,
      "oldSignature": "sig_golden_buddha_bell",
      "nameTh": "เคล็ดวิชาประกาศิตย้อนวิบาก (วิบากวัฏสงสาร)"
    },
    "TECH_V234_BEAST_SOVEREIGN_ACT_06": {
      "family": "venom_hive",
      "variant": 45,
      "oldSignature": "sig_myriad_venom_miasma",
      "nameTh": "เคล็ดวิชารังแมลงกู่หมื่นพิษ (ราชันอสูร)"
    },
    "TECH_V234_BEAST_SOVEREIGN_ACT_12": {
      "family": "beast_totem",
      "variant": 46,
      "oldSignature": "sig_primordial_beast_totem",
      "nameTh": "เคล็ดวิชาจิ้งจอกเก้าหางดารา (ราชันอสูร)"
    },
    "TECH_V234_SAGE_SUPPORT_ACT_06": {
      "family": "vital_garden",
      "variant": 47,
      "oldSignature": "sig_shennong_emerald_lotus",
      "nameTh": "เคล็ดวิชาน้ำอมฤตชุบวิญญาณ (ปราชญ์เมตตาหนุนนำ)"
    },
    "TECH_V234_SAGE_SUPPORT_ACT_12": {
      "family": "rune_brush",
      "variant": 48,
      "oldSignature": "sig_heaven_brush_astrolabe",
      "nameTh": "เคล็ดวิชาพู่กันประทานพร (ปราชญ์เมตตาหนุนนำ)"
    },
    "TECH_V234_CRAFT_CREATION_ACT_06": {
      "family": "rune_brush",
      "variant": 49,
      "oldSignature": "sig_divine_crucible_forge",
      "nameTh": "เคล็ดวิชาอักขระสลักคมกระบี่ (วิถีสรรค์สร้าง)"
    },
    "TECH_V234_CRAFT_CREATION_ACT_12": {
      "family": "vital_garden",
      "variant": 50,
      "oldSignature": "sig_shennong_emerald_lotus",
      "nameTh": "เคล็ดวิชาเข็มกลั่นแก่นสมุนไพร (วิถีสรรค์สร้าง)"
    },
    "TECH_V234_ARRAY_TALISMAN_ACT_06": {
      "family": "cloud_thunder",
      "variant": 51,
      "oldSignature": "sig_thunder_god_halberd",
      "nameTh": "เคล็ดวิชาอสนีฟ้าทัณฑ์เรียกสายฟ้า (ค่ายกลและยันต์อาคม)"
    },
    "TECH_V234_ARRAY_TALISMAN_ACT_12": {
      "family": "rune_brush",
      "variant": 52,
      "oldSignature": "sig_taiji_yin_yang_crush",
      "nameTh": "เคล็ดวิชาประตูกลฉีเหมินตุ้นเจี่ย (ค่ายกลและยันต์อาคม)"
    },
    "TECH_V234_STRATEGY_GOVERNANCE_ACT_06": {
      "family": "celestial_edict",
      "variant": 53,
      "oldSignature": "sig_imperial_eight_gates_banner",
      "nameTh": "เคล็ดวิชาสาส์นพันธมิตรเจ็ดแคว้น (พิชัยสงครามและรัฐกิจ)"
    },
    "TECH_V234_STRATEGY_GOVERNANCE_ACT_12": {
      "family": "celestial_edict",
      "variant": 54,
      "oldSignature": "sig_imperial_eight_gates_banner",
      "nameTh": "เคล็ดวิชาประกาศิตเจ้าสำนัก (พิชัยสงครามและรัฐกิจ)"
    },
    "TECH_V200_ASTRO_DIVINATION_ACT_06": {
      "family": "astral_ladle",
      "variant": 55,
      "oldSignature": "sig_heaven_brush_astrolabe",
      "nameTh": "เคล็ดวิชาสายกระบวยดาราต่อชะตา (โหราดวงดาว)"
    },
    "TECH_V200_BUDDHA_DHARMA_ACT_06": {
      "family": "vital_garden",
      "variant": 56,
      "oldSignature": "sig_golden_buddha_bell",
      "nameTh": "เคล็ดวิชาสายธุดงค์เพลิงกัลป์เผาวิบาก (พุทธธรรม)"
    },
    "TECH_V200_VOID_SPACE_ACT_06": {
      "family": "void_blade",
      "variant": 57,
      "oldSignature": "sig_void_spatial_slash",
      "nameTh": "เคล็ดวิชาสายกำแพงกระจกมิติสะท้อน (สุญญตามิติ)"
    },
    "TECH_V200_SONIC_HARMONY_ACT_06": {
      "family": "zither_chords",
      "variant": 58,
      "oldSignature": "sig_heavens_sound_requiem",
      "nameTh": "เคล็ดวิชาสายวาทยกรสวรรค์ประสานคีตา (คีตายุทธ)"
    },
    "TECH_V200_VENOM_GU_ACT_06": {
      "family": "venom_hive",
      "variant": 59,
      "oldSignature": "sig_myriad_venom_miasma",
      "nameTh": "เคล็ดวิชาสายพิษสลับอมฤตช่วยชีวิต (พิษหนอนกู่)"
    },
    "TECH_V200_PRIMORDIAL_SHIFTER_ACT_06": {
      "family": "beast_totem",
      "variant": 60,
      "oldSignature": "sig_primordial_beast_totem",
      "nameTh": "เคล็ดวิชาสายจำแลงจิ้งจอกเก้าหางพันหน้า (แปลงกายบรรพกาล)"
    },
    "TECH_V200_CELESTIAL_WEATHER_ACT_06": {
      "family": "cloud_thunder",
      "variant": 61,
      "oldSignature": "sig_nine_suns_eye",
      "nameTh": "เคล็ดวิชาสายอัญเชิญแสงสุริยันกลางหาว (เทวอากาศ)"
    },
    "TECH_V200_WANDERING_DAO_ACT_06": {
      "family": "galaxy_arrow",
      "variant": 62,
      "oldSignature": "sig_immortal_crane_feather_storm",
      "nameTh": "เคล็ดวิชาสายนักเขียนแผนที่หมื่นพิภพ (จาริกพิภพ)"
    },
    "TECH_V200_MERCANTILE_DAO_ACT_06": {
      "family": "gold_balance",
      "variant": 63,
      "oldSignature": "sig_golden_abacus_wheel",
      "nameTh": "เคล็ดวิชาสายเสนาบดีคลังสมดุลทองคำ (พาณิชย์มรรคา)"
    },
    "TECH_V200_DRAGON_VEIN_GEOMANCY_ACT_06": {
      "family": "earth_veins",
      "variant": 64,
      "oldSignature": "sig_tidal_maelstrom_anchors",
      "nameTh": "เคล็ดวิชาสายผู้พิทักษ์ยอดเขาศักดิ์สิทธิ์ (มังกรธรณี)"
    },
    "TECH_V200_GRAVITY_DAO_ACT_06": {
      "family": "gravity_bands",
      "variant": 65,
      "oldSignature": "sig_taiji_yin_yang_crush",
      "nameTh": "เคล็ดวิชาสายแรงดึงดูดพันธนาการคู่ศึก (แรงโน้มถ่วง)"
    },
    "TECH_V200_CHRONO_EPOCH_ACT_06": {
      "family": "epoch_glass",
      "variant": 66,
      "oldSignature": "sig_heaven_brush_astrolabe",
      "nameTh": "เคล็ดวิชาสายกระจกส่องอดีตและอนาคต (กาลเวลา)"
    },
    "TECH_V200_INK_LITERATI_ACT_06": {
      "family": "rune_brush",
      "variant": 67,
      "oldSignature": "sig_heaven_brush_astrolabe",
      "nameTh": "เคล็ดวิชาสายอาลักษณ์จารึกพงศาวดารฟ้า (อักษรปราชญ์)"
    },
    "TECH_V200_SOUL_PUPPETRY_ACT_06": {
      "family": "puppet_lines",
      "variant": 68,
      "oldSignature": "sig_myriad_puppet_barrage",
      "nameTh": "เคล็ดวิชาสายบรรเลงด้ายชะตาควบคุมองคาพยพ (เชิดเงาวิญญาณ)"
    },
    "TECH_V200_PRIMORDIAL_CHAOS_ACT_06": {
      "family": "sky_spear",
      "variant": 69,
      "oldSignature": "sig_taiji_yin_yang_crush",
      "nameTh": "เคล็ดวิชาสายทวนโกลาหลผ่าแยกฟ้าดิน (โกลาหลต้นกำเนิด)"
    },
    "LEG_V240_GOD": {
      "family": "celestial_edict",
      "variant": 70,
      "oldSignature": "sig_pantheon_deity_descent",
      "nameTh": "มหาเทวโองการสวรรค์เก้าชั้นฟ้าพิพากษาภพ"
    },
    "LEG_V240_CRAFT_CREATION": {
      "family": "forge_lattice",
      "variant": 71,
      "oldSignature": "sig_divine_crucible_forge",
      "nameTh": "มหาคัมภีร์เตาหลอมสวรรค์รังสรรค์หมื่นศาสตรา"
    }
  };
  SK.resolveT7Vfx = (techOrMove, moveOpt) => {
    if (!techOrMove) return null;
    const id = techOrMove.tech || techOrMove.id;
    const tech = g.CULT && g.CULT.tech ? g.CULT.tech(id) : techOrMove;
    if (!tech || tech.tier !== 7 || tech.legendary || techOrMove.legendary || tech.fxKind || (moveOpt && (moveOpt.fxKind || moveOpt.legendary))) return null;
    return SK.T7_VFX_CATALOG[id] || null;
  };

  SK.resolveSignatureVfx = (techOrMove, moveOpt) => {
    if (!techOrMove) return null;
    const tid = techOrMove.tech || techOrMove.id || '';
    if (SK.TECH_TO_SIGNATURE_VFX[tid] && SK.SIGNATURE_VFX_CATALOG[SK.TECH_TO_SIGNATURE_VFX[tid]]) {
      return SK.TECH_TO_SIGNATURE_VFX[tid];
    }
    if (moveOpt && moveOpt.signatureVfx && SK.SIGNATURE_VFX_CATALOG[moveOpt.signatureVfx]) {
      return moveOpt.signatureVfx;
    }
    if (techOrMove.signatureVfx && SK.SIGNATURE_VFX_CATALOG[techOrMove.signatureVfx]) {
      return techOrMove.signatureVfx;
    }

    // Match high-tier/legendary/forbidden/specialist techniques by Thai name, role, and path
    const tier = techOrMove.tier || (moveOpt && moveOpt.tier) || 1;
    const cat = String(techOrMove.cat || '');
    const arch = String((moveOpt && moveOpt.arch) || techOrMove.combatArch || techOrMove.arch || '');
    const isForbid = arch === 'forbid' || /FORBIDDEN/.test(cat);
    const isSupportOrDef = /SUPPORT|DEFENSIVE|AUXILIARY/.test(cat) || ['heal', 'support', 'harmonize', 'command', 'shield', 'guard'].includes(arch);
    const isHigh = !!(techOrMove.legendary || tier >= 5 || arch === 'burst' || isForbid || (isSupportOrDef && tier >= 4));
    if (!isHigh) return null;

    const nm = String((moveOpt && moveOpt.nameTh) || techOrMove.nameTh || '');
    if (/ดาวตก|พิรุณกระบี่|หมื่นกระบี่|เก้ากระบี่/.test(nm)) return 'sig_meteor_sword_rain';
    if (/อิไอ|ซามูไร|ไร้เงา/.test(nm)) return 'sig_iai_crimson_moon_slash';
    if (/นินจาเร้น|เงาแยก|ดาวกระจาย/.test(nm)) return 'sig_shinobi_phantom_clone_ambush';
    if (/มุทรา|คาถาธาตุ|ยันต์ระเบิด/.test(nm)) return 'sig_shinobi_mudra_firestorm';
    if (/ทวยเทพ|เทวะสถิต|มหาเทวาลัย|ร่างทรง/.test(nm)) return 'sig_pantheon_deity_descent';
    if (/นอกรีต|นอกมิติ|เนตรอเวจี|ดูดกลืนมิติ/.test(nm)) return 'sig_eldritch_void_rift';
    if (/ขมังเวท|ไสยศาสตร์|ยันต์เก้ายอด|กุมารทอง|ควายธนู/.test(nm)) return 'sig_khmer_sacred_yantra_seal';
    if (/สุสาน|ยมโลก|ปลุกศพ|ป้ายวิญญาณ|บรรพชน/.test(nm)) return 'sig_nether_grave_soul_eruption';
    if (/เสินหนง|ชุบชีวา|น้ำอมฤต|บัวหยก|สมานวิญญาณ|พฤกษาโอสถ/.test(nm)) return 'sig_shennong_emerald_lotus';
    if (/แปดพยุหะ|บัญชาทัพ|กลองศึก|ธงรบ|ประกาศิตเจ้าสำนัก|สาส์นพันธมิตร|พิชัยสงคราม/.test(nm)) return 'sig_imperial_eight_gates_banner';
    if (/โทเท็ม|คุนเผิง|จิ้งจอกเก้าหาง|ราชันอสูร|เทพอสูร/.test(nm)) return 'sig_primordial_beast_totem';
    if (/เหอถูลั่วซู|จานดารา|พู่กัน|จารึก|อาลักษณ์|ชุนชิว|ย้อนรอยกัป|บิดเบือนกาล/.test(nm)) return 'sig_heaven_brush_astrolabe';
    if (/ลูกคิด|ไฉ่ซิง|เดิมพัน|รูเล็ตต์|เสนาบดีคลัง|ทวงหนี้/.test(nm)) return 'sig_golden_abacus_wheel';
    if (/เตาหลอม|เบ้าหลอม|รังสรรค์โอสถและศาสตรา/.test(nm)) return 'sig_divine_crucible_forge';
    if (/นาวิกสมุทร|พลิกคลื่น|ไข่มุกสมุทร|วังวน/.test(nm)) return 'sig_tidal_maelstrom_anchors';
    if (/บัวโลหิต|ดูดดาว|กลืนหลอมสรีระ|กระเพาะหลุมดำ|สูบเลือด/.test(nm)) return 'sig_blood_lotus_apocalypse';
    if (/ฝ่ามือ|แปดทิศ|ตถาคต|สยบมาร/.test(nm)) return 'sig_eight_directions_palm';
    if (/สุริยัน|เก้าตะวัน|เก้าเพลิง/.test(nm)) return 'sig_nine_suns_eye';
    if (/ผลาญวิญญาณ|เพลิงอเวจี|เพลิงมาร/.test(nm)) return 'sig_soul_scorching_flame';
    if (/มังกรเพลิง|มังกรอัคคี|คลื่นมังกร/.test(nm)) return 'sig_blazing_dragon_wave';
    if (/กรงเล็บ|อสูรโลหิต|พยัคฆ์โลหิต/.test(nm)) return 'sig_blood_beast_claw';
    if (/บัวหิมะ|เยือกแข็ง|จันทราเหมันต์/.test(nm)) return 'sig_frost_lotus_domain';
    if (/ทวนอัสนี|เทพสายฟ้า|อสนีบาต/.test(nm)) return 'sig_thunder_god_halberd';
    if (/หุ่นเชิด|หมื่นด้าย|กลไก/.test(nm)) return 'sig_myriad_puppet_barrage';
    if (/พิณ|คีต|สะท้านวิญญาณ/.test(nm)) return 'sig_heavens_sound_requiem';
    if (/ระฆังทอง|อรหันต์|วัชระ/.test(nm)) return 'sig_golden_buddha_bell';
    if (/ผ่ามิติ|ว่างเปล่า|สุญตา/.test(nm)) return 'sig_void_spatial_slash';
    if (/หมอกพิษ|กู่|หมื่นพิษ/.test(nm)) return 'sig_myriad_venom_miasma';
    if (/หยินหยาง|ไท่เก๊ก|แปดทิศบดขยี้/.test(nm)) return 'sig_taiji_yin_yang_crush';
    if (/กระเรียน|เหินเซียน|ขนนก/.test(nm)) return 'sig_immortal_crane_feather_storm';

    // Role & Path-based deterministic resolution for remaining high-tier (T5+) techniques
    if (tier >= 5 || techOrMove.legendary || isForbid) {
      if (arch === 'heal' || arch === 'harmonize') return 'sig_shennong_emerald_lotus';
      if (arch === 'command') return 'sig_imperial_eight_gates_banner';
      if (arch === 'shield' || arch === 'guard') return 'sig_golden_buddha_bell';
      if (arch === 'summon') return 'sig_primordial_beast_totem';
      const pKey = techOrMove.path || (moveOpt && moveOpt.path) || '';
      if (pKey && SK.PATH_PRIMARY_SIGNATURE_VFX[pKey]) {
        return SK.PATH_PRIMARY_SIGNATURE_VFX[pKey];
      }
    }
    return null;
  };

  g.SK = SK;
  if (typeof module === 'object' && module.exports) module.exports = SK;
})(typeof globalThis !== 'undefined' ? globalThis : this);
