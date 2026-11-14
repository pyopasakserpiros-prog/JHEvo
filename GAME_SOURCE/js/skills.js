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
    delayedEcho: { nameTh: 'คลื่นสะท้อนเงาอดีต', icon: '⏳', tags: ['#ASTRAL'] },
    ironSkin: { nameTh: 'กายาเหล็กไหล', icon: '🛡️', tags: ['#DEF', '#BODY'] }
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
    SOUL_VESSEL_AVATAR: {"summon":3.5,"guard":3,"counter":2.5,"strike":2,"channel":1.5},
    ASTRAL_CLOCKWORK_PRIME: {"channel":3.5,"blast":3,"control":2.5,"support":2,"snipe":1.5},
    SIX_PATHS_WHEEL: {"channel":3.5,"blast":3,"control":2.5,"counter":2,"sweep":1.5},
    ASURA_JUDGMENT_BLADE: {"execute":3.5,"strike":3,"burst":2.5,"pierce":2,"counter":1.5},
    LOTUS_MERCY_PURIFIER: {"heal":3.5,"shield":3,"support":2.5,"guard":2,"blast":1},
    REVERSED_RETRIBUTION: {"counter":3.5,"guard":3,"drain":2.5,"execute":2,"strike":1.5},
    BODHI_VOW_GUARDIAN: {"guard":3.5,"shield":3.5,"heal":2.5,"counter":2,"support":2},
    MYRIAD_BEAST_PACK: {"summon":3.5,"flurry":3,"sweep":2.5,"support":2,"charge":1.5},
    COLOSSUS_SHIELD_TAMER: {"guard":3.5,"shield":3,"counter":2.5,"sweep":2,"strike":1.5},
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
    BATTLEFIELD_STRATEGIST: {"command":4,"support":3,"control":2.5,"shield":2,"blast":1.5},
    SECT_STEWARD: {"command":3.5,"support":3.5,"heal":2.5,"shield":2.5},
    IMPERIAL_SEAL_CHANCELLOR: {"command":3.5,"support":3,"control":2.5,"channel":2},
    EARTH_VEIN_WARDEN: {"control":3.5,"shield":3,"command":2.5,"blast":2.5},
    THUNDER_TALISMAN_ADEPT: {"blast":3.5,"burst":3,"snipe":2.5,"control":2},
    SEAL_SCRIPT_EXORCIST: {"control":3.5,"shield":3,"counter":2.5,"pierce":2}
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
    const subId = (g.CULT && g.CULT.resolveSubId && t.sub) ? g.CULT.resolveSubId(t.sub) : t.sub;
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
      const w = Object.assign({}, SUBW[subId] || { strike: 3, flurry: 1, sweep: 1 });
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
    else if (P === 'BEAST_SOVEREIGN') type = (subId === 'SWARM_GU_HIVE_MASTER' || subId === 'PRIMORDIAL_BLOOD_MUTATOR' || subId === 'CELESTIAL_ASTRAL_FAIRY_TAMER') ? (rnd(h, 3) < 0.45 ? 'p' : 'm') : 'p';
    else if (P === 'MECH_PUPPET') type = (subId === 'HEAVENLY_GOLEM' || subId === 'CELESTIAL_BALLISTA' || subId === 'FLYING_BLADE_ORBITER') ? 'p' : (rnd(h, 3) < 0.5 ? 'p' : 'm');
    else if (P === 'KARMA_SAMSARA') type = (subId === 'ASURA_JUDGMENT_BLADE' || subId === 'REVERSED_RETRIBUTION') ? 'p' : 'm';
    else if (P === 'SAGE_SUPPORT') type = (subId === 'WAR_BANNER_CHORISTER') ? 'p' : 'm';
    else if (P === 'CRAFT_CREATION') type = (subId === 'HEAVENLY_ANVIL_SMITH' || subId === 'SPIRIT_SWORD_ARTIFICER') ? 'p' : 'm';
    else if (P === 'GOD') type = (subId === 'WAR_DEITY' || subId === 'TOTEM_BEAST_GOD') ? 'p' : 'm';
    else if (P === 'DEMON') type = (subId === 'SHADOW_ASSASSIN' ? (rnd(h, 3) < 0.85 ? 'p' : 'm') : subId === 'HEAVEN_DEVOURING_DEMON' ? (rnd(h, 3) < 0.5 ? 'p' : 'm') : 'm');
    else if (P === 'HEART_SOUL') type = (subId === 'MIND_SWORD_TELEKINESIS' && rnd(h, 3) < 0.35) ? 'p' : 'm';
    else type = (subId === 'SWORD_IMMORTAL' ? rnd(h, 3) < 0.7 : subId === 'BLOOD_DEMON' ? rnd(h, 3) < 0.4 : rnd(h, 3) < 0.12) ? 'p' : 'm';
    const prof = { id: t.id, tech: t.id, nameTh: t.nameTh, tier, grade: t.grade || 'Common', legendary: !!t.legendary, fxKind: t.fxKind || null, arch, archTh: A.nameTh, icon: A.icon, type, element: t.element, elementProfile: t.elementProfile || (g.ELEM && g.ELEM.getTargetProfile(t)) || null, elemTh: el.nameTh, cd,
      hits, wind: wind0, M: Math.round(M * 100) / 100, costPct: Math.round(4 * A.cost * (1 + 0.45 * (tier - 1)) * 10) / 10, pen: A.penAdd || 0, aoe: !!A.aoe, steal: A.steal || 0, dot: Math.round(dotTot * 100) / 100,
      recoil: A.recoil || 0, self: !!A.self, team: !!A.team, channel: !!A.channel, rider: !A.self && !A.team && A.off && !A.ctrl ? el.st : null, ctrl: A.ctrl ? el.ctrl : null, moves: t.moves || [] };
    if (arch === 'dot') prof.dotKind = ({ FIRE: 'burn', BLOOD_DEMON: 'bleed', WOOD_LIFE: 'poison' })[t.element] || (rnd(h, 5) < 0.5 ? 'poison' : 'bleed');
    if (arch === 'guard') prof.shield = Math.round((0.14 + 0.035 * (tier - 1)) * 100) / 100;
    if (arch === 'heal') prof.heal = Math.round((0.16 + 0.04 * (tier - 1)) * 100) / 100;
    prof.grantBuff = t.grantBuff || null;
    if (arch === 'support' || arch === 'buff') {
      prof.support = {
        kind: t.grantBuff || ((subId === 'WAR_DEITY' || t.element === 'LIGHTNING') ? 'morale' : (t.element === 'WIND' ? 'haste' : 'holyAura')),
        dur: 12 + tier * 2
      };
    }
    if (arch === 'summon') {
      prof.summon = {
        dur: 14 + tier * 2,
        hpPct: Math.round((0.35 + 0.05 * (tier - 1)) * 100) / 100,
        statPct: Math.round((0.50 + 0.05 * (tier - 1)) * 100) / 100,
        nameSuffix: (t.path === 'MECH_PUPPET' ? 'หุ่นกลศึก' : t.path === 'BEAST_SOVEREIGN' ? 'อสูรคู่สัญญา' : t.path === 'KARMA_SAMSARA' ? 'เงาอดีตชาติ' : subId === 'TOTEM_BEAST_GOD' ? 'เทพอสูร' : subId === 'PHANTOM_SOUL' ? 'ร่างเงามายา' : subId === 'NETHER_GHOST_KING' ? 'ภูตยมโลก' : subId === 'DREAM_ILLUSION_WEAVER' ? 'ร่างมายาฝัน' : 'ร่างอวตาร')
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
      "planned": false
    },
    "5": {
      "life": 1050,
      "rMin": 32,
      "rMax": 39,
      "marks": 8,
      "planned": false
    },
    "6": {
      "life": 1250,
      "rMin": 42,
      "rMax": 47,
      "marks": 10,
      "planned": false
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


  // T6 deliberately shares group art; no per-technique shape or decoration seed.
  SK.T6_VFX_FAMILIES = {
    "storm": {
      "nameTh": "อัสนีพันศาสตรา",
      "primary": "#a8c5ed",
      "accent": "#e0e7f3",
      "motion": "pulse"
    },
    "blood": {
      "nameTh": "คมโลหิตอสูร",
      "primary": "#c88796",
      "accent": "#e6bcb3",
      "motion": "sweep"
    },
    "void": {
      "nameTh": "คมสุญตาเร้นเงา",
      "primary": "#b9a5d6",
      "accent": "#d9d4e6",
      "motion": "weave"
    },
    "bulwark": {
      "nameTh": "ปราการกายายุทธ์",
      "primary": "#c7b28b",
      "accent": "#e0d4b5",
      "motion": "gather"
    },
    "projectile": {
      "nameTh": "เจตคมพุ่งเจาะ",
      "primary": "#a8cbd5",
      "accent": "#d6e8df",
      "motion": "sweep"
    },
    "mirror": {
      "nameTh": "ม่านกระจกจิต",
      "primary": "#b6bdce",
      "accent": "#e2d8ec",
      "motion": "weave"
    },
    "forge": {
      "nameTh": "เปลวเตาหลอม",
      "primary": "#cfaa80",
      "accent": "#ecd3ae",
      "motion": "rise"
    },
    "grove": {
      "nameTh": "พฤกษาเมตตา",
      "primary": "#9cc6aa",
      "accent": "#d9e6bd",
      "motion": "rise"
    },
    "sound": {
      "nameTh": "คีตาคลื่นประสาน",
      "primary": "#96c7c7",
      "accent": "#d7e3d0",
      "motion": "pulse"
    },
    "puppet": {
      "nameTh": "สายใยหุ่นวิญญาณ",
      "primary": "#bc9fbe",
      "accent": "#dec6d4",
      "motion": "weave"
    },
    "seal": {
      "nameTh": "อักขระผนึกจิต",
      "primary": "#acbda8",
      "accent": "#dce0c3",
      "motion": "gather"
    },
    "banner": {
      "nameTh": "พยุหะหนุนทัพ",
      "primary": "#c9ba84",
      "accent": "#e5dbb3",
      "motion": "rise"
    },
    "venom": {
      "nameTh": "พิษกู่กัดกร่อน",
      "primary": "#b1c58b",
      "accent": "#d7e2b1",
      "motion": "weave"
    },
    "beast": {
      "nameTh": "เขี้ยวราชันอสูร",
      "primary": "#c6a78c",
      "accent": "#e6d5b8",
      "motion": "pulse"
    },
    "jade_guard": {
      "nameTh": "เกราะหยกซ้อนชั้น",
      "primary": "#c7b28b",
      "accent": "#e0d4b5",
      "motion": "gather"
    },
    "dawn_sword": {
      "nameTh": "กระบี่รุ่งอรุณ",
      "primary": "#a8cbd5",
      "accent": "#d6e8df",
      "motion": "rise"
    },
    "mist_palm": {
      "nameTh": "บุปผาหมอกพิษ",
      "primary": "#b1c58b",
      "accent": "#d7e2b1",
      "motion": "weave"
    },
    "mist_veil": {
      "nameTh": "ม่านหมอกลวงตา",
      "primary": "#b9a5d6",
      "accent": "#d9d4e6",
      "motion": "weave"
    },
    "cleanse": {
      "nameTh": "ธารชำระคำสาป",
      "primary": "#9cc6aa",
      "accent": "#d9e6bd",
      "motion": "rise"
    },
    "qi_siphon": {
      "nameTh": "เกลียวสูบปราณ",
      "primary": "#c88796",
      "accent": "#e6bcb3",
      "motion": "gather"
    },
    "array_ruin": {
      "nameTh": "แกนค่ายกลแตกสลาย",
      "primary": "#acbda8",
      "accent": "#dce0c3",
      "motion": "pulse"
    },
    "flesh_gate": {
      "nameTh": "ประตูโลหิตเปิดกายา",
      "primary": "#c88796",
      "accent": "#e6bcb3",
      "motion": "pulse"
    },
    "blood_pins": {
      "nameTh": "หมุดโลหิตตรึงร่าง",
      "primary": "#c88796",
      "accent": "#e6bcb3",
      "motion": "gather"
    },
    "beast_pact": {
      "nameTh": "พันธสัญญาอสูร",
      "primary": "#c6a78c",
      "accent": "#e6d5b8",
      "motion": "pulse"
    },
    "sacred_flame": {
      "nameTh": "เปลวสักการะ",
      "primary": "#cfaa80",
      "accent": "#ecd3ae",
      "motion": "rise"
    },
    "moon_bow": {
      "nameTh": "ศรจันทราพยากรณ์",
      "primary": "#a8cbd5",
      "accent": "#d6e8df",
      "motion": "sweep"
    },
    "fate_cut": {
      "nameTh": "ด้ายชะตาขาดสะบั้น",
      "primary": "#b6bdce",
      "accent": "#e2d8ec",
      "motion": "weave"
    },
    "faith_link": {
      "nameTh": "สายศรัทธาหนุนปราณ",
      "primary": "#c9ba84",
      "accent": "#e5dbb3",
      "motion": "gather"
    },
    "altar_burst": {
      "nameTh": "กระถางสักการะร้าว",
      "primary": "#cfaa80",
      "accent": "#ecd3ae",
      "motion": "pulse"
    },
    "sky_tribunal": {
      "nameTh": "ตราทัณฑ์สายฟ้า",
      "primary": "#a8c5ed",
      "accent": "#e0e7f3",
      "motion": "pulse"
    },
    "traceless_sword": {
      "nameTh": "กระบี่ไร้ร่องรอย",
      "primary": "#b9a5d6",
      "accent": "#d9d4e6",
      "motion": "sweep"
    },
    "sun_bow": {
      "nameTh": "ศรสุริยัน",
      "primary": "#a8cbd5",
      "accent": "#d6e8df",
      "motion": "gather"
    },
    "ocean_trident": {
      "nameTh": "ตรีศูลเกลียวสมุทร",
      "primary": "#a8cbd5",
      "accent": "#d6e8df",
      "motion": "sweep"
    },
    "frost_tide": {
      "nameTh": "ฝ่ามือวาฬเหมันต์",
      "primary": "#b6bdce",
      "accent": "#e2d8ec",
      "motion": "pulse"
    },
    "cloud_brush": {
      "nameTh": "พู่กันเมฆาคล้อย",
      "primary": "#acbda8",
      "accent": "#dce0c3",
      "motion": "weave"
    },
    "vajra": {
      "nameTh": "วัชระทองคำ",
      "primary": "#c7b28b",
      "accent": "#e0d4b5",
      "motion": "gather"
    },
    "earth_step": {
      "nameTh": "ก้าวสะท้านปฐพี",
      "primary": "#c7b28b",
      "accent": "#e0d4b5",
      "motion": "pulse"
    },
    "gu_swarm": {
      "nameTh": "ฝูงกู่กลืนปราณ",
      "primary": "#b1c58b",
      "accent": "#d7e2b1",
      "motion": "weave"
    },
    "dream_silk": {
      "nameTh": "แพรฝันจิตวิญญาณ",
      "primary": "#b6bdce",
      "accent": "#e2d8ec",
      "motion": "weave"
    },
    "spirit_thread": {
      "nameTh": "สายใยคุ้มชีพ",
      "primary": "#9cc6aa",
      "accent": "#d9e6bd",
      "motion": "gather"
    },
    "array_gates": {
      "nameTh": "ประตูยันต์แปดทิศ",
      "primary": "#acbda8",
      "accent": "#dce0c3",
      "motion": "gather"
    },
    "stone_seal": {
      "nameTh": "ผนึกขุนเขา",
      "primary": "#c7b28b",
      "accent": "#e0d4b5",
      "motion": "gather"
    },
    "hidden_bastion": {
      "nameTh": "ปราการกลศึก",
      "primary": "#c9ba84",
      "accent": "#e5dbb3",
      "motion": "pulse"
    },
    "star_gate": {
      "nameTh": "ประตูพยากรณ์ดารา",
      "primary": "#c9ba84",
      "accent": "#e5dbb3",
      "motion": "weave"
    },
    "dharma": {
      "nameTh": "เจดีย์ธรรมสยบมาร",
      "primary": "#c7b28b",
      "accent": "#e0d4b5",
      "motion": "rise"
    },
    "cloud_step": {
      "nameTh": "ย่างก้าวเหยียบเมฆา",
      "primary": "#b9a5d6",
      "accent": "#d9d4e6",
      "motion": "rise"
    },
    "debt_balance": {
      "nameTh": "ตราชั่งวิบาก",
      "primary": "#c9ba84",
      "accent": "#e5dbb3",
      "motion": "weave"
    },
    "dragon_fault": {
      "nameTh": "รอยเลื่อนมังกรหยก",
      "primary": "#c7b28b",
      "accent": "#e0d4b5",
      "motion": "sweep"
    },
    "gravity_fist": {
      "nameTh": "หมัดเพิ่มมวลศิลา",
      "primary": "#c7b28b",
      "accent": "#e0d4b5",
      "motion": "gather"
    },
    "epoch_seal": {
      "nameTh": "กลไกผนึกกาล",
      "primary": "#b6bdce",
      "accent": "#e2d8ec",
      "motion": "weave"
    }
  };
  SK.TECH_TO_T6_VFX = {
    "MP_SPEAR_CELESTIAL_TEMPEST_T6": "storm",
    "MP_BLADE_THUNDER_GOD_SLASH_T6": "storm",
    "ART_V212_BODY_THUNDER_T6": "storm",
    "MP_SPEAR_FORBIDDEN_BLOOD_LANCE_T6": "blood",
    "MP_BLADE_ASHURA_THOUSAND_CUTS_T6": "blood",
    "MP_BLADE_SHADOW_REAPER_T6": "blood",
    "ART_V212_DEMON_BLOOD_SPEAR_T6": "blood",
    "ART_V112_DEMON_VOID_SHADOW_KILL_T6": "void",
    "MP_HYB_SPEAR_STAFF_VOID_T6": "void",
    "ART_V212_SOUL_VOID_SPEAR_T6": "void",
    "TECH_V200_VOID_SPACE_ACT_05": "void",
    "MP_STAFF_HEAVEN_PILLAR_T6": "bulwark",
    "MP_STAFF_ARHAT_SANCTUARY_T6": "bulwark",
    "MP_FIST_GRANDMASTER_PINNACLE_T6": "bulwark",
    "MP_STAFF_FORBIDDEN_EARTHQUAKE_T6": "bulwark",
    "MP_BOW_HEARTSEEKER_SNIPE_T6": "projectile",
    "MP_BOW_ABYSSAL_ECLIPSE_T6": "projectile",
    "ART_V212_XIAN_PHANTOM_T6": "projectile",
    "MP_SPEAR_DIVINE_JUDGMENT_T6": "projectile",
    "MP_FOCUS_FATE_MIRROR_T6": "mirror",
    "ART_V212_SOUL_DREAM_T6": "mirror",
    "ART_V212_KARMA_MIRROR_T6": "mirror",
    "TECH_V200_CHRONO_EPOCH_ACT_05": "epoch_seal",
    "MP_FOCUS_CAULDRON_FIRE_T6": "forge",
    "TECH_V234_CRAFT_CREATION_ACT_05": "forge",
    "TECH_V234_CRAFT_CREATION_ACT_11": "forge",
    "ART_SAGE_SUP_007": "grove",
    "ART_CROSS_V208_012": "grove",
    "ART_V112_SOUL_BUDDHA_PALM_VOID_T6": "dharma",
    "ART_V212_XIAN_ZITHER_T6": "sound",
    "TECH_V215_ZITHER_ACT_07": "sound",
    "TECH_V222_14": "sound",
    "TECH_V200_SONIC_HARMONY_ACT_05": "sound",
    "MP_STAFF_NETHER_SCEPTER_T6": "puppet",
    "ART_V212_DEMON_GHOST_T6": "puppet",
    "TECH_V215_WHIP_ACT_07": "puppet",
    "TECH_V200_SOUL_PUPPETRY_ACT_05": "puppet",
    "ART_V112_SOUL_HEAVEN_BRUSH_DECREE_T6": "seal",
    "TECH_V215_BRUSH_ACT_07": "seal",
    "TECH_V200_INK_LITERATI_ACT_05": "seal",
    "TECH_V240_BRUSH_03": "seal",
    "MP_FOCUS_GRANDMASTER_FAN_T6": "banner",
    "MP_SPEAR_WARLORD_OVERLORD_T6": "banner",
    "TECH_V200_ASTRO_DIVINATION_ACT_05": "star_gate",
    "TECH_V240_ABACUS_03": "debt_balance",
    "ART_V112_DEMON_MYRIAD_VENOM_DOMAIN_T6": "mist_palm",
    "TECH_V200_VENOM_GU_ACT_05": "venom",
    "TECH_V240_NEEDLE_02": "venom",
    "TECH_V200_PRIMORDIAL_SHIFTER_ACT_05": "beast",
    "TECH_UNI_V230_018": "beast",
    "TECH_V240_CLAW_02": "beast",
    "TECH_V234_XIAN_ACT_11": "jade_guard",
    "ART190_XIAN_020": "dawn_sword",
    "ART190_XIAN_050": "mist_veil",
    "TECH_V200_CELESTIAL_WEATHER_ACT_05": "mist_veil",
    "ART190_XIAN_060": "cleanse",
    "ART190_XIAN_074": "qi_siphon",
    "ART_C117_INNATE_HEAVEN_DEVOURING_DEMON": "qi_siphon",
    "ART190_XIAN_077": "array_ruin",
    "ART190_BODY_074": "flesh_gate",
    "TECH_UNI_V230_011": "flesh_gate",
    "ART190_BODY_077": "blood_pins",
    "ART190_BODY_080": "beast_pact",
    "TECH_V234_GOD_ACT_05": "sacred_flame",
    "ART190_GOD_020": "moon_bow",
    "TECH_V234_HEART_SOUL_ACT_11": "fate_cut",
    "ART190_GOD_060": "faith_link",
    "ART190_GOD_077": "altar_burst",
    "ART190_GOD_080": "sky_tribunal",
    "ART190_XIAN_080": "sky_tribunal",
    "TECH_V234_GOD_ACT_11": "sky_tribunal",
    "MP_SWORD_SAINT_TRACELESS_T6": "traceless_sword",
    "ART_V212_GOD_SUN_BOW_T6": "sun_bow",
    "ART_V212_GOD_OCEAN_T6": "ocean_trident",
    "TECH_UNI_V230_024": "ocean_trident",
    "TECH_V222_10": "frost_tide",
    "TECH_V234_XIAN_ACT_05": "cloud_brush",
    "TECH_V234_BODY_ACT_05": "vajra",
    "TECH_V240_ROSARY_02": "vajra",
    "TECH_UNI_V230_015": "vajra",
    "TECH_V234_BODY_ACT_11": "earth_step",
    "ART190_BODY_050": "earth_step",
    "TECH_V234_DEMON_ACT_05": "gu_swarm",
    "TECH_V234_HEART_SOUL_ACT_05": "dream_silk",
    "TECH_V234_SAGE_SUPPORT_ACT_11": "spirit_thread",
    "ART190_BODY_060": "spirit_thread",
    "TECH_V234_ARRAY_TALISMAN_ACT_05": "array_gates",
    "TECH_V234_ARRAY_TALISMAN_ACT_11": "stone_seal",
    "TECH_V234_STRATEGY_GOVERNANCE_ACT_05": "hidden_bastion",
    "TECH_V234_STRATEGY_GOVERNANCE_ACT_11": "hidden_bastion",
    "TECH_UNI_V230_027": "star_gate",
    "TECH_V240_ASTROLABE_02": "star_gate",
    "TECH_V200_BUDDHA_DHARMA_ACT_05": "dharma",
    "TECH_V200_WANDERING_DAO_ACT_05": "cloud_step",
    "TECH_V200_MERCANTILE_DAO_ACT_05": "debt_balance",
    "TECH_UNI_V230_030": "debt_balance",
    "TECH_V200_DRAGON_VEIN_GEOMANCY_ACT_05": "dragon_fault",
    "TECH_V200_GRAVITY_DAO_ACT_05": "gravity_fist",
    "ART190_BODY_020": "beast",
    "TECH_V234_BEAST_SOVEREIGN_ACT_05": "beast",
    "TECH_V234_BEAST_SOVEREIGN_ACT_11": "beast",
    "TECH_V240_WHIP_02": "beast",
    "ART190_GOD_050": "seal",
    "ART190_GOD_074": "mirror",
    "TECH_V234_DEMON_ACT_11": "venom",
    "TECH_V234_SAGE_SUPPORT_ACT_05": "sound",
    "TECH_V240_ZITHER_02": "sound",
    "TECH_UNI_V230_021": "puppet",
    "TECH_V240_FAN_02": "mist_veil",
    "TECH_V234_MECH_PUPPET_ACT_05": "projectile",
    "TECH_V234_MECH_PUPPET_ACT_11": "hidden_bastion",
    "TECH_V234_KARMA_SAMSARA_ACT_05": "mirror",
    "TECH_V234_KARMA_SAMSARA_ACT_11": "mirror",
    "TECH_V200_PRIMORDIAL_CHAOS_ACT_05": "grove"
  };
  SK.PASSIVE_TO_T6_VFX = {
    "PASS_NON_ELEM_GRANDMASTER_T6": "bulwark",
    "TECH_V215_ZITHER_PAS_04": "sound",
    "TECH_V215_BRUSH_PAS_04": "seal",
    "TECH_V215_WHIP_PAS_04": "puppet",
    "TECH_V234_BODY_PAS_04": "bulwark",
    "TECH_V234_HEART_SOUL_PAS_04": "mirror",
    "TECH_V234_SAGE_SUPPORT_PAS_04": "grove",
    "TECH_V234_BEAST_SOVEREIGN_PAS_04": "beast"
  };
  SK.resolveT6Vfx = (techOrMove,moveOpt) => {
    if(!techOrMove)return null;
    const id=techOrMove.tech||techOrMove.id,tech=g.CULT&&g.CULT.tech?g.CULT.tech(id):techOrMove;
    if(!tech||tech.tier!==6||tech.legendary||techOrMove.legendary||tech.fxKind||techOrMove.fxKind||(moveOpt&&(moveOpt.fxKind||moveOpt.legendary||moveOpt.signatureVfx)))return null;
    const move=moveOpt&&(tech.moveDefs||[]).find(m=>m.id===moveOpt.id);
    if(move&&(move.fxKind||move.legendary||move.signatureVfx))return null;
    return SK.TECH_TO_T6_VFX[id]||null;
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


  /* ---------- Patch v2.6.0: Tier-Scaled VFX Families (T5, T4, T3 Ext, T2, T1 Ext, T6 Ext), Sub-Path Motifs & Equipment/Combat Action VFX ---------- */
  SK.T5_VFX_FAMILIES = {
  "t5_celestial_sword_arc": {
    "nameTh": "จันทร์เสี้ยวกระบี่เซียน",
    "primary": "#9fd2e3",
    "accent": "#e0f4f8",
    "motion": "sweep",
    "shapeId": 0
  },
  "t5_thunder_cloud_lance": {
    "nameTh": "อัสนีทวนเมฆา",
    "primary": "#a3bded",
    "accent": "#e1ecfc",
    "motion": "gather",
    "shapeId": 1
  },
  "t5_blazing_lotus_palm": {
    "nameTh": "ฝ่ามือบัวเพลิงสวรรค์",
    "primary": "#e09f7d",
    "accent": "#f7dcc4",
    "motion": "pulse",
    "shapeId": 2
  },
  "t5_frost_mirror_slash": {
    "nameTh": "คมดาบกระจกเหมันต์",
    "primary": "#a6c8e0",
    "accent": "#e3eff8",
    "motion": "sweep",
    "shapeId": 3
  },
  "t5_jade_crane_plume": {
    "nameTh": "ปีกกระเรียนหยกเหิน",
    "primary": "#a8d5c2",
    "accent": "#e2f4ec",
    "motion": "rise",
    "shapeId": 4
  },
  "t5_taiji_yin_yang_spiral": {
    "nameTh": "เกลียวหยินหยางไท่เก๊ก",
    "primary": "#b5c2d9",
    "accent": "#e8edf5",
    "motion": "weave",
    "shapeId": 5
  },
  "t5_star_array_compass": {
    "nameTh": "จานค่ายกลดาราพยากรณ์",
    "primary": "#c4b7e0",
    "accent": "#ebe5f7",
    "motion": "gather",
    "shapeId": 6
  },
  "t5_golden_vajra_fist": {
    "nameTh": "หมัดวัชระทองคำ",
    "primary": "#d6b87c",
    "accent": "#f5e8c8",
    "motion": "pulse",
    "shapeId": 7
  },
  "t5_titan_quake_stomp": {
    "nameTh": "บาทาถล่มขุนเขา",
    "primary": "#c7a987",
    "accent": "#ede0d1",
    "motion": "pulse",
    "shapeId": 8
  },
  "t5_dragon_blood_spear": {
    "nameTh": "ทวนโลหิตมังกรคลั่ง",
    "primary": "#d98a8a",
    "accent": "#f5d3d3",
    "motion": "sweep",
    "shapeId": 9
  },
  "t5_iron_bastion_dome": {
    "nameTh": "ปราการเหล็กคุ้มภัย",
    "primary": "#b8b2a6",
    "accent": "#e6e3dd",
    "motion": "gather",
    "shapeId": 10
  },
  "t5_phoenix_rebirth_flare": {
    "nameTh": "เปลวเพลิงหงส์คืนชีพ",
    "primary": "#e39878",
    "accent": "#f7d9cb",
    "motion": "rise",
    "shapeId": 11
  },
  "t5_frost_marrow_claw": {
    "nameTh": "กรงเล็บน้ำแข็งกัดกระดูก",
    "primary": "#9bbcd9",
    "accent": "#dfeef7",
    "motion": "sweep",
    "shapeId": 12
  },
  "t5_thunder_tiger_pounce": {
    "nameTh": "พยัคฆ์สายฟ้าคำรน",
    "primary": "#aebee8",
    "accent": "#e3e9fa",
    "motion": "pulse",
    "shapeId": 13
  },
  "t5_solar_edict_halberd": {
    "nameTh": "ง้าวโองการสุริยัน",
    "primary": "#dec078",
    "accent": "#f7ebd0",
    "motion": "sweep",
    "shapeId": 14
  },
  "t5_moon_oracle_arrow": {
    "nameTh": "ศรจันทราพยากรณ์",
    "primary": "#9ec9db",
    "accent": "#dff0f7",
    "motion": "gather",
    "shapeId": 15
  },
  "t5_war_deity_banner": {
    "nameTh": "ธงรบเทพสงคราม",
    "primary": "#d4a373",
    "accent": "#f2dec9",
    "motion": "rise",
    "shapeId": 16
  },
  "t5_mercy_lotus_canopy": {
    "nameTh": "ฉัตรบัวทองเมตตา",
    "primary": "#a3cfa8",
    "accent": "#e1f2e3",
    "motion": "rise",
    "shapeId": 17
  },
  "t5_totem_beast_crest": {
    "nameTh": "ตราประทับเทพอสูร",
    "primary": "#c9a685",
    "accent": "#eddcd0",
    "motion": "pulse",
    "shapeId": 18
  },
  "t5_ocean_tide_trident": {
    "nameTh": "ตรีศูลคลื่นสมุทร",
    "primary": "#8abfd9",
    "accent": "#d8eef7",
    "motion": "sweep",
    "shapeId": 19
  },
  "t5_blood_demon_scythe": {
    "nameTh": "เคียวโลหิตสูบวิญญาณ",
    "primary": "#d17b88",
    "accent": "#f2ccd2",
    "motion": "sweep",
    "shapeId": 20
  },
  "t5_shadow_eclipse_dagger": {
    "nameTh": "มีดสั้นสุริยคราสเร้นเงา",
    "primary": "#9e8fb8",
    "accent": "#ded7eb",
    "motion": "weave",
    "shapeId": 21
  },
  "t5_myriad_venom_cauldron": {
    "nameTh": "หม้อพิษหมื่นกู่",
    "primary": "#9ec284",
    "accent": "#dfeed3",
    "motion": "weave",
    "shapeId": 22
  },
  "t5_nether_ghost_lantern": {
    "nameTh": "โคมวิญญาณยมโลก",
    "primary": "#8fb8b5",
    "accent": "#d9ebe9",
    "motion": "rise",
    "shapeId": 23
  },
  "t5_heaven_devour_vortex": {
    "nameTh": "วังวนมารกลืนสวรรค์",
    "primary": "#b87d95",
    "accent": "#ebd0db",
    "motion": "gather",
    "shapeId": 24
  },
  "t5_corpse_puppet_chains": {
    "nameTh": "โซ่ตรวนเชิดศพ",
    "primary": "#a69ab5",
    "accent": "#e0dbe8",
    "motion": "weave",
    "shapeId": 25
  },
  "t5_mind_sword_lotus": {
    "nameTh": "กระบี่จิตบัววิญญาณ",
    "primary": "#a5c4d4",
    "accent": "#e0eef5",
    "motion": "sweep",
    "shapeId": 26
  },
  "t5_celestial_zither_wave": {
    "nameTh": "คลื่นพิณสวรรค์สะท้านจิต",
    "primary": "#8ec7c2",
    "accent": "#d9f0ee",
    "motion": "pulse",
    "shapeId": 27
  },
  "t5_dream_mirage_ribbon": {
    "nameTh": "แพรฝันมายาเจ็ดภพ",
    "primary": "#baa3d4",
    "accent": "#e6dcf2",
    "motion": "weave",
    "shapeId": 28
  },
  "t5_zen_void_bell": {
    "nameTh": "ระฆังเซนสุญตา",
    "primary": "#cfc096",
    "accent": "#f2ecda",
    "motion": "gather",
    "shapeId": 29
  },
  "t5_heaven_brush_decree": {
    "nameTh": "พู่กันสวรรค์จารึกชะตา",
    "primary": "#9eb5a8",
    "accent": "#dce8e1",
    "motion": "weave",
    "shapeId": 30
  },
  "t5_emotion_mask_wheel": {
    "nameTh": "วงล้อหน้ากากเจ็ดอารมณ์",
    "primary": "#c79cb8",
    "accent": "#eddbe7",
    "motion": "pulse",
    "shapeId": 31
  },
  "t5_beast_king_fang": {
    "nameTh": "เขี้ยวราชันหมื่นอสูร",
    "primary": "#c99e7a",
    "accent": "#f0decb",
    "motion": "sweep",
    "shapeId": 32
  },
  "t5_gu_swarm_tempest": {
    "nameTh": "พายุแมลงกู่กลืนปราณ",
    "primary": "#a4c27e",
    "accent": "#e1f0ce",
    "motion": "weave",
    "shapeId": 33
  },
  "t5_symbiotic_claw_slash": {
    "nameTh": "กรงเล็บผสานร่างอสูร",
    "primary": "#cf937e",
    "accent": "#f2d7ce",
    "motion": "sweep",
    "shapeId": 34
  },
  "t5_astral_fairy_plume": {
    "nameTh": "ขนนกเซียนดาราคุ้มภัย",
    "primary": "#9ec8db",
    "accent": "#dfeff7",
    "motion": "rise",
    "shapeId": 35
  },
  "t5_shennong_herb_gourd": {
    "nameTh": "น้ำเต้าโอสถเสินหนง",
    "primary": "#8fc79a",
    "accent": "#d9f0de",
    "motion": "rise",
    "shapeId": 36
  },
  "t5_acupoint_golden_needle": {
    "nameTh": "เข็มทองสกัดจุดชีพจร",
    "primary": "#d4bf7a",
    "accent": "#f2e9cc",
    "motion": "gather",
    "shapeId": 37
  },
  "t5_alchemical_elixir_mist": {
    "nameTh": "หมอกโอสถทิพย์เก้าหลอม",
    "primary": "#98c9b0",
    "accent": "#dcf2e6",
    "motion": "weave",
    "shapeId": 38
  },
  "t5_divine_anvil_hammer": {
    "nameTh": "ค้อนทั่งสวรรค์ตีศาสตรา",
    "primary": "#d69e72",
    "accent": "#f5dcc7",
    "motion": "pulse",
    "shapeId": 39
  },
  "t5_samadhi_furnace_fire": {
    "nameTh": "เพลิงสามเณรเตาหลอม",
    "primary": "#e08e6d",
    "accent": "#f7d5c6",
    "motion": "rise",
    "shapeId": 40
  },
  "t5_flying_sword_wheel": {
    "nameTh": "กงล้อกระบี่บินกลไก",
    "primary": "#9db8c9",
    "accent": "#dde8f0",
    "motion": "sweep",
    "shapeId": 41
  },
  "t5_heavenly_golem_fist": {
    "nameTh": "หมัดหุ่นยักษ์สวรรค์",
    "primary": "#b8a896",
    "accent": "#e8e0d8",
    "motion": "pulse",
    "shapeId": 42
  },
  "t5_celestial_ballista_bolt": {
    "nameTh": "ศรหน้าไม้กลไกทะลวงฟ้า",
    "primary": "#a8b8c9",
    "accent": "#dfe6ed",
    "motion": "gather",
    "shapeId": 43
  },
  "t5_spirit_thread_loom": {
    "nameTh": "กี่ทอสายใยเชิดหุ่น",
    "primary": "#b89ec4",
    "accent": "#e6d9eb",
    "motion": "weave",
    "shapeId": 44
  },
  "t5_bagua_eight_gates": {
    "nameTh": "ค่ายกลแปดประตูทิศ",
    "primary": "#a3bfa8",
    "accent": "#dce8de",
    "motion": "gather",
    "shapeId": 45
  },
  "t5_heaven_thunder_talisman": {
    "nameTh": "ยันต์สายฟ้าสวรรค์พิโรธ",
    "primary": "#9eb4e0",
    "accent": "#dce5f7",
    "motion": "pulse",
    "shapeId": 46
  },
  "t5_mountain_seal_pillar": {
    "nameTh": "เสาศิลาผนึกขุนเขา",
    "primary": "#bfa98a",
    "accent": "#e8dfd1",
    "motion": "gather",
    "shapeId": 47
  },
  "t5_imperial_command_seal": {
    "nameTh": "ตราหยกบัญชาทัพสวรรค์",
    "primary": "#d4bc7d",
    "accent": "#f2e8cc",
    "motion": "rise",
    "shapeId": 48
  },
  "t5_qimen_war_chariot": {
    "nameTh": "พยุหะศึกฉีเหมิน",
    "primary": "#c9a87c",
    "accent": "#ede0ce",
    "motion": "sweep",
    "shapeId": 49
  },
  "t5_golden_abacus_ledger": {
    "nameTh": "ลูกคิดทองคำชั่งชะตา",
    "primary": "#d6bf78",
    "accent": "#f5ebcc",
    "motion": "weave",
    "shapeId": 50
  },
  "t5_samsara_six_wheel": {
    "nameTh": "กงล้อสังสารวัฏหกภพ",
    "primary": "#c4a3cf",
    "accent": "#eadcf0",
    "motion": "weave",
    "shapeId": 51
  },
  "t5_asura_judgment_blade": {
    "nameTh": "ดาบอสุราพิพากษาวิบาก",
    "primary": "#d4858d",
    "accent": "#f2d0d4",
    "motion": "sweep",
    "shapeId": 52
  },
  "t5_bodhi_mercy_vow": {
    "nameTh": "ปณิธานโพธิสัตว์คุ้มชีพ",
    "primary": "#d4c285",
    "accent": "#f2ead0",
    "motion": "rise",
    "shapeId": 53
  },
  "t5_big_dipper_astrolabe": {
    "nameTh": "จานดาราเจ็ดดาวเหนือ",
    "primary": "#9ab3db",
    "accent": "#dbe6f7",
    "motion": "gather",
    "shapeId": 54
  },
  "t5_void_rift_prism": {
    "nameTh": "ปริซึมผ่ามิติว่างเปล่า",
    "primary": "#a594c9",
    "accent": "#e0d8f0",
    "motion": "sweep",
    "shapeId": 55
  },
  "t5_dragon_vein_luopan": {
    "nameTh": "หลัวผานชีพจรมังกร",
    "primary": "#b5b88a",
    "accent": "#e6e8d3",
    "motion": "pulse",
    "shapeId": 56
  },
  "t5_gravity_singularity_orb": {
    "nameTh": "ลูกแก้วแรงโน้มถ่วงถล่มภพ",
    "primary": "#968ab8",
    "accent": "#dad5eb",
    "motion": "gather",
    "shapeId": 57
  },
  "t5_chrono_sundial_wheel": {
    "nameTh": "นาฬิกาแดดย้อนกาลเวลา",
    "primary": "#b0bdd4",
    "accent": "#e1e7f2",
    "motion": "weave",
    "shapeId": 58
  },
  "t5_hundun_chaos_mill": {
    "nameTh": "โม่หินบรรพกาลหุ่นตุ้น",
    "primary": "#b3a4b8",
    "accent": "#e4dde6",
    "motion": "pulse",
    "shapeId": 59
  },
  "t5_iai_crimson_crescent": {
    "nameTh": "จันทร์เสี้ยวอิไอสะบั้นเงา",
    "primary": "#d47f88",
    "accent": "#f2cdd1",
    "motion": "sweep",
    "shapeId": 60
  },
  "t5_shinobi_shuriken_storm": {
    "nameTh": "พายุคมดาวกระจายเร้นเงา",
    "primary": "#8fa8b8",
    "accent": "#d7e2e8",
    "motion": "sweep",
    "shapeId": 61
  },
  "t5_mudra_five_chakra": {
    "nameTh": "มุทราห้าธาตุผสานคาถา",
    "primary": "#c99a82",
    "accent": "#edd8ce",
    "motion": "pulse",
    "shapeId": 62
  },
  "t5_pantheon_avatar_spear": {
    "nameTh": "หอกเทวสภาอวตาร",
    "primary": "#d6bf82",
    "accent": "#f5ebcf",
    "motion": "rise",
    "shapeId": 63
  },
  "t5_eldritch_abyss_gaze": {
    "nameTh": "เนตรอเวจีพันธะนอกมิติ",
    "primary": "#9e82b5",
    "accent": "#ded0e8",
    "motion": "gather",
    "shapeId": 64
  },
  "t5_khmer_yantra_mandala": {
    "nameTh": "มหายันต์เก้ายอดคงกระพัน",
    "primary": "#c9b07a",
    "accent": "#ede2ca",
    "motion": "gather",
    "shapeId": 65
  },
  "t5_support_grand_dao_halo": {
    "nameTh": "วงแหวนมรรคาสายหนุนสวรรค์",
    "primary": "#8fc9b8",
    "accent": "#d9f2eb",
    "motion": "rise",
    "shapeId": 66
  },
  "t5_forbidden_blood_sigil": {
    "nameTh": "ตราต้องห้ามสังเวยโลหิต",
    "primary": "#cf7486",
    "accent": "#f2c9d1",
    "motion": "pulse",
    "shapeId": 67
  }
};
  SK.TECH_TO_T5_VFX = {
  "ART190_XIAN_009": "t5_celestial_sword_arc",
  "ART190_XIAN_019": "t5_thunder_cloud_lance",
  "ART190_XIAN_029": "t5_blazing_lotus_palm",
  "ART190_XIAN_039": "t5_frost_mirror_slash",
  "ART190_XIAN_049": "t5_jade_crane_plume",
  "ART190_XIAN_073": "t5_taiji_yin_yang_spiral",
  "ART190_XIAN_076": "t5_star_array_compass",
  "ART190_XIAN_079": "t5_golden_vajra_fist",
  "ART190_BODY_009": "t5_titan_quake_stomp",
  "ART190_BODY_019": "t5_dragon_blood_spear",
  "ART190_BODY_029": "t5_iron_bastion_dome",
  "ART190_BODY_039": "t5_phoenix_rebirth_flare",
  "ART190_BODY_049": "t5_frost_marrow_claw",
  "ART190_BODY_073": "t5_thunder_tiger_pounce",
  "ART190_BODY_076": "t5_solar_edict_halberd",
  "ART190_BODY_079": "t5_moon_oracle_arrow",
  "ART190_GOD_009": "t5_war_deity_banner",
  "ART190_GOD_019": "t5_mercy_lotus_canopy",
  "ART190_GOD_029": "t5_totem_beast_crest",
  "ART190_GOD_039": "t5_ocean_tide_trident",
  "ART190_GOD_049": "t5_blood_demon_scythe",
  "ART190_GOD_073": "t5_shadow_eclipse_dagger",
  "ART190_GOD_076": "t5_myriad_venom_cauldron",
  "ART190_GOD_079": "t5_nether_ghost_lantern",
  "ART_V112_DEMON_NETHER_SOUL_CLAW_T5": "t5_heaven_devour_vortex",
  "ART_V112_DEMON_DEVOURING_ABYSS_PALM_T5": "t5_corpse_puppet_chains",
  "ART_C117_AWAKENED_CALLIGRAPHY_PAINTING_SAGE": "t5_mind_sword_lotus",
  "ART_V210_FORB_VOID_SOUL_SEVER": "t5_celestial_zither_wave",
  "ART_V112_SOUL_TELEKINESIS_SWORD_WHEEL_T5": "t5_dream_mirage_ribbon",
  "MP_BOW_METEOR_STORM": "t5_zen_void_bell",
  "MP_SPEAR_DRAGON_SPINE_IMPALE_T5": "t5_heaven_brush_decree",
  "MP_SPEAR_COSMIC_MIND_T5": "t5_emotion_mask_wheel",
  "MP_STAFF_MOUNTAIN_ANCHOR_T5": "t5_beast_king_fang",
  "MP_STAFF_ZEN_LOTUS_T5": "t5_gu_swarm_tempest",
  "MP_BOW_SIEGE_BALLISTA_T5": "t5_symbiotic_claw_slash",
  "MP_BOW_SOUL_HARMONY_T5": "t5_astral_fairy_plume",
  "MP_BOW_FORBIDDEN_BLOOD_ARROW_T5": "t5_shennong_herb_gourd",
  "MP_BLADE_MOUNTAIN_SPLITTER_T5": "t5_acupoint_golden_needle",
  "MP_BLADE_BLOOD_FRENZY_T5": "t5_alchemical_elixir_mist",
  "MP_FOCUS_SONIC_ZITHER_T5": "t5_divine_anvil_hammer",
  "MP_FOCUS_ASTRAL_BANNER_T5": "t5_samadhi_furnace_fire",
  "MP_FOCUS_CELESTIAL_ZITHER_T5": "t5_flying_sword_wheel",
  "MP_SWORD_GEOMETRY_ARRAY_T5": "t5_heavenly_golem_fist",
  "MP_SWORD_FROST_MOON_SLASH_T5": "t5_celestial_ballista_bolt",
  "MP_FIST_SHOCKWAVE_PALM_T5": "t5_spirit_thread_loom",
  "MP_HYB_BLADE_FOCUS_FLYING_T5": "t5_bagua_eight_gates",
  "MP_AGNOSTIC_ACUPOINT_HEAL_T5": "t5_heaven_thunder_talisman",
  "ART_MECH_PUPPET_006": "t5_mountain_seal_pillar",
  "ART_MECH_PUPPET_010": "t5_imperial_command_seal",
  "ART_KARMA_SAMSARA_009": "t5_qimen_war_chariot",
  "ART_BEAST_SOV_005": "t5_golden_abacus_ledger",
  "ART_BEAST_SOV_010": "t5_samsara_six_wheel",
  "ART_SAGE_SUP_005": "t5_asura_judgment_blade",
  "ART_SAGE_SUP_006": "t5_bodhi_mercy_vow",
  "ART_V212_GOD_JUDGE_T5": "t5_big_dipper_astrolabe",
  "ART_V212_MECH_ORBITER_T5": "t5_void_rift_prism",
  "ART_V212_BEAST_SWARM_T5": "t5_dragon_vein_luopan",
  "ART_CRAFT_007": "t5_gravity_singularity_orb",
  "ART_CRAFT_008": "t5_chrono_sundial_wheel",
  "ART_CRAFT_009": "t5_hundun_chaos_mill",
  "ART_CRAFT_010": "t5_iai_crimson_crescent",
  "ART_CRAFT_011": "t5_shinobi_shuriken_storm",
  "TECH_V215_ZITHER_ACT_06": "t5_mudra_five_chakra",
  "TECH_V215_BRUSH_ACT_06": "t5_pantheon_avatar_spear",
  "TECH_V215_WHIP_ACT_06": "t5_eldritch_abyss_gaze",
  "TECH_V222_03": "t5_khmer_yantra_mandala",
  "TECH_V222_05": "t5_support_grand_dao_halo",
  "TECH_V222_08": "t5_forbidden_blood_sigil",
  "TECH_V222_13": "t5_celestial_sword_arc",
  "TECH_V222_16": "t5_thunder_cloud_lance",
  "TECH_V222_18": "t5_blazing_lotus_palm",
  "TECH_V234_XIAN_ACT_04": "t5_frost_mirror_slash",
  "TECH_V234_XIAN_ACT_10": "t5_jade_crane_plume",
  "TECH_V234_XIAN_SUP_03": "t5_taiji_yin_yang_spiral",
  "TECH_V234_BODY_ACT_04": "t5_star_array_compass",
  "TECH_V234_BODY_ACT_10": "t5_golden_vajra_fist",
  "TECH_V234_BODY_SUP_03": "t5_titan_quake_stomp",
  "TECH_V234_GOD_ACT_04": "t5_dragon_blood_spear",
  "TECH_V234_GOD_ACT_10": "t5_iron_bastion_dome",
  "TECH_V234_GOD_SUP_03": "t5_phoenix_rebirth_flare",
  "TECH_V234_DEMON_ACT_04": "t5_frost_marrow_claw",
  "TECH_V234_DEMON_ACT_10": "t5_thunder_tiger_pounce",
  "TECH_V234_DEMON_SUP_03": "t5_solar_edict_halberd",
  "TECH_V234_HEART_SOUL_ACT_04": "t5_moon_oracle_arrow",
  "TECH_V234_HEART_SOUL_ACT_10": "t5_war_deity_banner",
  "TECH_V234_HEART_SOUL_SUP_03": "t5_mercy_lotus_canopy",
  "TECH_V234_MECH_PUPPET_ACT_04": "t5_totem_beast_crest",
  "TECH_V234_MECH_PUPPET_ACT_10": "t5_ocean_tide_trident",
  "TECH_V234_MECH_PUPPET_SUP_03": "t5_blood_demon_scythe",
  "TECH_V234_KARMA_SAMSARA_ACT_04": "t5_shadow_eclipse_dagger",
  "TECH_V234_KARMA_SAMSARA_ACT_10": "t5_myriad_venom_cauldron",
  "TECH_V234_KARMA_SAMSARA_SUP_03": "t5_nether_ghost_lantern",
  "TECH_V234_BEAST_SOVEREIGN_ACT_04": "t5_heaven_devour_vortex",
  "TECH_V234_BEAST_SOVEREIGN_ACT_10": "t5_corpse_puppet_chains",
  "TECH_V234_BEAST_SOVEREIGN_SUP_03": "t5_mind_sword_lotus",
  "TECH_V234_SAGE_SUPPORT_ACT_04": "t5_celestial_zither_wave",
  "TECH_V234_SAGE_SUPPORT_ACT_10": "t5_dream_mirage_ribbon",
  "TECH_V234_SAGE_SUPPORT_SUP_03": "t5_zen_void_bell",
  "TECH_V234_CRAFT_CREATION_ACT_04": "t5_heaven_brush_decree",
  "TECH_V234_CRAFT_CREATION_ACT_10": "t5_emotion_mask_wheel",
  "TECH_V234_CRAFT_CREATION_SUP_03": "t5_beast_king_fang",
  "TECH_V234_ARRAY_TALISMAN_ACT_04": "t5_gu_swarm_tempest",
  "TECH_V234_ARRAY_TALISMAN_ACT_10": "t5_symbiotic_claw_slash",
  "TECH_V234_ARRAY_TALISMAN_SUP_03": "t5_astral_fairy_plume",
  "TECH_V234_STRATEGY_GOVERNANCE_ACT_04": "t5_shennong_herb_gourd",
  "TECH_V234_STRATEGY_GOVERNANCE_ACT_10": "t5_acupoint_golden_needle",
  "TECH_V234_STRATEGY_GOVERNANCE_SUP_03": "t5_alchemical_elixir_mist",
  "TECH_V200_ASTRO_DIVINATION_ACT_04": "t5_divine_anvil_hammer",
  "TECH_V200_BUDDHA_DHARMA_ACT_04": "t5_samadhi_furnace_fire",
  "TECH_V200_VOID_SPACE_ACT_04": "t5_flying_sword_wheel",
  "TECH_V200_SONIC_HARMONY_ACT_04": "t5_heavenly_golem_fist",
  "TECH_V200_VENOM_GU_ACT_04": "t5_celestial_ballista_bolt",
  "TECH_V200_PRIMORDIAL_SHIFTER_ACT_04": "t5_spirit_thread_loom",
  "TECH_V200_CELESTIAL_WEATHER_ACT_04": "t5_bagua_eight_gates",
  "TECH_V200_WANDERING_DAO_ACT_04": "t5_heaven_thunder_talisman",
  "TECH_V200_MERCANTILE_DAO_ACT_04": "t5_mountain_seal_pillar",
  "TECH_V200_DRAGON_VEIN_GEOMANCY_ACT_04": "t5_imperial_command_seal",
  "TECH_V200_GRAVITY_DAO_ACT_04": "t5_qimen_war_chariot",
  "TECH_V200_CHRONO_EPOCH_ACT_04": "t5_golden_abacus_ledger",
  "TECH_V200_INK_LITERATI_ACT_04": "t5_samsara_six_wheel",
  "TECH_V200_SOUL_PUPPETRY_ACT_04": "t5_asura_judgment_blade",
  "TECH_V200_PRIMORDIAL_CHAOS_ACT_04": "t5_bodhi_mercy_vow",
  "TECH_V200_SHADOW_SAMURAI_ACT_04": "t5_big_dipper_astrolabe",
  "TECH_V200_NINPO_SHADOW_ACT_04": "t5_void_rift_prism",
  "TECH_V200_NINPO_ELEMENTAL_ACT_04": "t5_dragon_vein_luopan",
  "TECH_V200_DIVINE_SUMMONER_ACT_04": "t5_gravity_singularity_orb",
  "TECH_V200_DIVINE_POSSESSION_ACT_04": "t5_chrono_sundial_wheel",
  "TECH_V200_DIVINE_CHANNELER_ACT_04": "t5_hundun_chaos_mill",
  "TECH_V200_VOID_HERETIC_PACT_ACT_04": "t5_iai_crimson_crescent",
  "TECH_V200_OCCULT_MAGE_ACT_04": "t5_shinobi_shuriken_storm",
  "TECH_V200_DEVOURING_FLESH_ACT_04": "t5_mudra_five_chakra",
  "TECH_V200_NETHER_GRAVE_ACT_04": "t5_pantheon_avatar_spear",
  "TECH_V200_ANCESTRAL_RITUAL_ACT_04": "t5_eldritch_abyss_gaze",
  "TECH_V200_TIDE_VOYAGER_ACT_04": "t5_khmer_yantra_mandala",
  "TECH_V200_LORE_ARCHIVIST_ACT_04": "t5_support_grand_dao_halo",
  "TECH_V200_FORTUNE_GAMBLER_ACT_04": "t5_forbidden_blood_sigil",
  "TECH_V200_SPIRIT_HUSBANDRY_ACT_04": "t5_celestial_sword_arc",
  "TECH_V200_ARENA_GLORY_ACT_04": "t5_thunder_cloud_lance",
  "TECH_V230_SHADOW_SAMURAI_SUPPORT": "t5_blazing_lotus_palm",
  "TECH_V230_NINPO_SHADOW_SUPPORT": "t5_frost_mirror_slash",
  "TECH_V230_NINPO_ELEMENTAL_SUPPORT": "t5_jade_crane_plume",
  "TECH_V230_DIVINE_SUMMONER_SUPPORT": "t5_taiji_yin_yang_spiral",
  "TECH_V230_DIVINE_POSSESSION_SUPPORT": "t5_star_array_compass",
  "TECH_V230_DIVINE_CHANNELER_SUPPORT": "t5_golden_vajra_fist",
  "TECH_V230_VOID_HERETIC_PACT_SUPPORT": "t5_titan_quake_stomp",
  "TECH_V230_OCCULT_MAGE_SUPPORT": "t5_dragon_blood_spear",
  "TECH_V230_DEVOURING_FLESH_SUPPORT": "t5_iron_bastion_dome",
  "TECH_V230_NETHER_GRAVE_SUPPORT": "t5_phoenix_rebirth_flare",
  "TECH_V230_ANCESTRAL_RITUAL_SUPPORT": "t5_frost_marrow_claw",
  "TECH_V230_TIDE_VOYAGER_SUPPORT": "t5_thunder_tiger_pounce",
  "TECH_V230_LORE_ARCHIVIST_SUPPORT": "t5_solar_edict_halberd",
  "TECH_V230_FORTUNE_GAMBLER_SUPPORT": "t5_moon_oracle_arrow",
  "TECH_V230_SPIRIT_HUSBANDRY_SUPPORT": "t5_war_deity_banner",
  "TECH_V230_ARENA_GLORY_SUPPORT": "t5_mercy_lotus_canopy",
  "TECH_UNI_V230_009": "t5_totem_beast_crest",
  "TECH_UNI_V230_010": "t5_ocean_tide_trident",
  "TECH_V240_BRUSH_02": "t5_blood_demon_scythe",
  "TECH_V240_ABACUS_02": "t5_shadow_eclipse_dagger"
};
  SK.PASSIVE_TO_T5_VFX = {
  "ART190_XIAN_059": "t5_celestial_sword_arc",
  "ART190_XIAN_069": "t5_thunder_cloud_lance",
  "ART190_BODY_059": "t5_blazing_lotus_palm",
  "ART190_BODY_069": "t5_frost_mirror_slash",
  "ART190_GOD_059": "t5_jade_crane_plume",
  "ART190_GOD_069": "t5_taiji_yin_yang_spiral",
  "PASS_SWORD_HEART_CLARITY_T5": "t5_star_array_compass",
  "PASS_BLADE_BLOOD_EDGE_T5": "t5_golden_vajra_fist",
  "PASS_SPEAR_PIERCING_AURA_T5": "t5_titan_quake_stomp",
  "PASS_ROOTED_MOUNTAIN_T5": "t5_dragon_blood_spear",
  "PASS_VAST_OCEAN_DANTIAN_T5": "t5_iron_bastion_dome",
  "PASS_PRIMORDIAL_ROOT_NURTURE_T5": "t5_phoenix_rebirth_flare",
  "PASS_FIST_UNARMED_PINNACLE_T5": "t5_frost_marrow_claw",
  "ART_SAGE_SUP_010": "t5_thunder_tiger_pounce",
  "TECH_V215_ZITHER_PAS_03": "t5_solar_edict_halberd",
  "TECH_V215_BRUSH_PAS_03": "t5_moon_oracle_arrow",
  "TECH_V215_WHIP_PAS_03": "t5_war_deity_banner",
  "TECH_V222_20": "t5_mercy_lotus_canopy",
  "TECH_V222_22": "t5_totem_beast_crest",
  "TECH_V222_24": "t5_ocean_tide_trident",
  "TECH_V234_XIAN_PAS_03": "t5_blood_demon_scythe",
  "TECH_V234_BODY_PAS_03": "t5_shadow_eclipse_dagger",
  "TECH_V234_GOD_PAS_03": "t5_myriad_venom_cauldron",
  "TECH_V234_DEMON_PAS_03": "t5_nether_ghost_lantern",
  "TECH_V234_HEART_SOUL_PAS_03": "t5_heaven_devour_vortex",
  "TECH_V234_MECH_PUPPET_PAS_03": "t5_corpse_puppet_chains",
  "TECH_V234_KARMA_SAMSARA_PAS_03": "t5_mind_sword_lotus",
  "TECH_V234_BEAST_SOVEREIGN_PAS_03": "t5_celestial_zither_wave",
  "TECH_V234_SAGE_SUPPORT_PAS_03": "t5_dream_mirage_ribbon",
  "TECH_V234_CRAFT_CREATION_PAS_03": "t5_zen_void_bell",
  "TECH_V234_ARRAY_TALISMAN_PAS_03": "t5_heaven_brush_decree",
  "TECH_V234_STRATEGY_GOVERNANCE_PAS_03": "t5_emotion_mask_wheel",
  "TECH_V200_ASTRO_DIVINATION_PAS_02": "t5_beast_king_fang",
  "MANTRA_V200_ASTRO_DIVINATION_02": "t5_gu_swarm_tempest",
  "TECH_V200_BUDDHA_DHARMA_PAS_02": "t5_symbiotic_claw_slash",
  "MANTRA_V200_BUDDHA_DHARMA_02": "t5_astral_fairy_plume",
  "TECH_V200_VOID_SPACE_PAS_02": "t5_shennong_herb_gourd",
  "MANTRA_V200_VOID_SPACE_02": "t5_acupoint_golden_needle",
  "TECH_V200_SONIC_HARMONY_PAS_02": "t5_alchemical_elixir_mist",
  "MANTRA_V200_SONIC_HARMONY_02": "t5_divine_anvil_hammer",
  "TECH_V200_VENOM_GU_PAS_02": "t5_samadhi_furnace_fire",
  "MANTRA_V200_VENOM_GU_02": "t5_flying_sword_wheel",
  "TECH_V200_PRIMORDIAL_SHIFTER_PAS_02": "t5_heavenly_golem_fist",
  "MANTRA_V200_PRIMORDIAL_SHIFTER_02": "t5_celestial_ballista_bolt",
  "TECH_V200_CELESTIAL_WEATHER_PAS_02": "t5_spirit_thread_loom",
  "MANTRA_V200_CELESTIAL_WEATHER_02": "t5_bagua_eight_gates",
  "TECH_V200_WANDERING_DAO_PAS_02": "t5_heaven_thunder_talisman",
  "MANTRA_V200_WANDERING_DAO_02": "t5_mountain_seal_pillar",
  "TECH_V200_MERCANTILE_DAO_PAS_02": "t5_imperial_command_seal",
  "MANTRA_V200_MERCANTILE_DAO_02": "t5_qimen_war_chariot",
  "TECH_V200_DRAGON_VEIN_GEOMANCY_PAS_02": "t5_golden_abacus_ledger",
  "MANTRA_V200_DRAGON_VEIN_GEOMANCY_02": "t5_samsara_six_wheel",
  "TECH_V200_GRAVITY_DAO_PAS_02": "t5_asura_judgment_blade",
  "MANTRA_V200_GRAVITY_DAO_02": "t5_bodhi_mercy_vow",
  "TECH_V200_CHRONO_EPOCH_PAS_02": "t5_big_dipper_astrolabe",
  "MANTRA_V200_CHRONO_EPOCH_02": "t5_void_rift_prism",
  "TECH_V200_INK_LITERATI_PAS_02": "t5_dragon_vein_luopan",
  "MANTRA_V200_INK_LITERATI_02": "t5_gravity_singularity_orb",
  "TECH_V200_SOUL_PUPPETRY_PAS_02": "t5_chrono_sundial_wheel",
  "MANTRA_V200_SOUL_PUPPETRY_02": "t5_hundun_chaos_mill",
  "TECH_V200_PRIMORDIAL_CHAOS_PAS_02": "t5_iai_crimson_crescent",
  "MANTRA_V200_PRIMORDIAL_CHAOS_02": "t5_shinobi_shuriken_storm",
  "TECH_V200_SHADOW_SAMURAI_PAS_02": "t5_mudra_five_chakra",
  "MANTRA_V200_SHADOW_SAMURAI_02": "t5_pantheon_avatar_spear",
  "TECH_V200_NINPO_SHADOW_PAS_02": "t5_eldritch_abyss_gaze",
  "MANTRA_V200_NINPO_SHADOW_02": "t5_khmer_yantra_mandala",
  "TECH_V200_NINPO_ELEMENTAL_PAS_02": "t5_support_grand_dao_halo",
  "MANTRA_V200_NINPO_ELEMENTAL_02": "t5_forbidden_blood_sigil",
  "TECH_V200_DIVINE_SUMMONER_PAS_02": "t5_celestial_sword_arc",
  "MANTRA_V200_DIVINE_SUMMONER_02": "t5_thunder_cloud_lance",
  "TECH_V200_DIVINE_POSSESSION_PAS_02": "t5_blazing_lotus_palm",
  "MANTRA_V200_DIVINE_POSSESSION_02": "t5_frost_mirror_slash",
  "TECH_V200_DIVINE_CHANNELER_PAS_02": "t5_jade_crane_plume",
  "MANTRA_V200_DIVINE_CHANNELER_02": "t5_taiji_yin_yang_spiral",
  "TECH_V200_VOID_HERETIC_PACT_PAS_02": "t5_star_array_compass",
  "MANTRA_V200_VOID_HERETIC_PACT_02": "t5_golden_vajra_fist",
  "TECH_V200_OCCULT_MAGE_PAS_02": "t5_titan_quake_stomp",
  "MANTRA_V200_OCCULT_MAGE_02": "t5_dragon_blood_spear",
  "TECH_V200_DEVOURING_FLESH_PAS_02": "t5_iron_bastion_dome",
  "MANTRA_V200_DEVOURING_FLESH_02": "t5_phoenix_rebirth_flare",
  "TECH_V200_NETHER_GRAVE_PAS_02": "t5_frost_marrow_claw",
  "MANTRA_V200_NETHER_GRAVE_02": "t5_thunder_tiger_pounce",
  "TECH_V200_ANCESTRAL_RITUAL_PAS_02": "t5_solar_edict_halberd",
  "MANTRA_V200_ANCESTRAL_RITUAL_02": "t5_moon_oracle_arrow",
  "TECH_V200_TIDE_VOYAGER_PAS_02": "t5_war_deity_banner",
  "MANTRA_V200_TIDE_VOYAGER_02": "t5_mercy_lotus_canopy",
  "TECH_V200_LORE_ARCHIVIST_PAS_02": "t5_totem_beast_crest",
  "MANTRA_V200_LORE_ARCHIVIST_02": "t5_ocean_tide_trident",
  "TECH_V200_FORTUNE_GAMBLER_PAS_02": "t5_blood_demon_scythe",
  "MANTRA_V200_FORTUNE_GAMBLER_02": "t5_shadow_eclipse_dagger",
  "TECH_V200_SPIRIT_HUSBANDRY_PAS_02": "t5_myriad_venom_cauldron",
  "MANTRA_V200_SPIRIT_HUSBANDRY_02": "t5_nether_ghost_lantern",
  "TECH_V200_ARENA_GLORY_PAS_02": "t5_heaven_devour_vortex",
  "MANTRA_V200_ARENA_GLORY_02": "t5_corpse_puppet_chains"
};
  SK.resolveT5Vfx = (techOrMove, moveOpt) => {
    if (!techOrMove) return null;
    const id = techOrMove.tech || techOrMove.id, tech = g.CULT && g.CULT.tech ? g.CULT.tech(id) : techOrMove;
    if (!tech || tech.tier !== 5 || tech.legendary || techOrMove.legendary || tech.fxKind || techOrMove.fxKind || (moveOpt && (moveOpt.fxKind || moveOpt.legendary || moveOpt.signatureVfx))) return null;
    const move = moveOpt && (tech.moveDefs || []).find(m => m.id === moveOpt.id);
    if (move && (move.fxKind || move.legendary || move.signatureVfx)) return null;
    return SK.TECH_TO_T5_VFX[id] || null;
  };

  SK.T4_VFX_FAMILIES = {
  "t4_azure_sword_ray": {
    "nameTh": "ปราณกระบี่ครามตัดเมฆ",
    "primary": "#9ac7d9",
    "accent": "#dceef5",
    "motion": "sweep",
    "shapeId": 0
  },
  "t4_violet_thunder_blade": {
    "nameTh": "คมดาบสายฟ้าม่วง",
    "primary": "#a6b3de",
    "accent": "#dfe5f7",
    "motion": "sweep",
    "shapeId": 1
  },
  "t4_crimson_flame_spear": {
    "nameTh": "ทวนอัคคีทะลวงทัพ",
    "primary": "#d99679",
    "accent": "#f5d8cb",
    "motion": "gather",
    "shapeId": 2
  },
  "t4_jade_breeze_fan": {
    "nameTh": "พัดหยกสายลมหิมะ",
    "primary": "#9bc9bf",
    "accent": "#dbf0ec",
    "motion": "sweep",
    "shapeId": 3
  },
  "t4_mist_illusion_palm": {
    "nameTh": "ฝ่ามือหมอกมายา",
    "primary": "#b2a6c9",
    "accent": "#e4dfed",
    "motion": "weave",
    "shapeId": 4
  },
  "t4_starlight_needle_rain": {
    "nameTh": "พิรุณเข็มเงินดารา",
    "primary": "#a8bed6",
    "accent": "#dee7f2",
    "motion": "gather",
    "shapeId": 5
  },
  "t4_taiji_guard_circle": {
    "nameTh": "วงกลมไท่เก๊กปัดป้อง",
    "primary": "#b0bcc9",
    "accent": "#e1e6ed",
    "motion": "gather",
    "shapeId": 6
  },
  "t4_crane_step_cloud": {
    "nameTh": "ก้าวกระเรียนเหยียบเมฆ",
    "primary": "#a8cfd4",
    "accent": "#dff0f2",
    "motion": "rise",
    "shapeId": 7
  },
  "t4_bronze_bell_fist": {
    "nameTh": "หมัดระฆังทองแดง",
    "primary": "#c9af7d",
    "accent": "#ede2cc",
    "motion": "pulse",
    "shapeId": 8
  },
  "t4_mountain_cleave_axe": {
    "nameTh": "ขวานผ่าศิลาขุนเขา",
    "primary": "#bf9e82",
    "accent": "#ebd9cc",
    "motion": "sweep",
    "shapeId": 9
  },
  "t4_blood_boil_knuckle": {
    "nameTh": "หมัดโลหิตเดือดทะลวง",
    "primary": "#cf8484",
    "accent": "#f0cfcf",
    "motion": "pulse",
    "shapeId": 10
  },
  "t4_iron_carapace_shield": {
    "nameTh": "เกราะปราณเหล็กไหล",
    "primary": "#ada9a1",
    "accent": "#e3e1de",
    "motion": "gather",
    "shapeId": 11
  },
  "t4_flame_marrow_kick": {
    "nameTh": "ลูกเตะเพลิงหลอมกระดูก",
    "primary": "#d99372",
    "accent": "#f5d7c9",
    "motion": "sweep",
    "shapeId": 12
  },
  "t4_frost_vein_grasp": {
    "nameTh": "กรงเล็บชีพจรน้ำแข็ง",
    "primary": "#9ab8d4",
    "accent": "#dbe7f2",
    "motion": "gather",
    "shapeId": 13
  },
  "t4_thunder_tempo_strike": {
    "nameTh": "หมัดจังหวะสายฟ้าแลบ",
    "primary": "#a6b5de",
    "accent": "#dfe5f5",
    "motion": "pulse",
    "shapeId": 14
  },
  "t4_earth_root_stance": {
    "nameTh": "ท่ายืนรากปฐพีมั่นคง",
    "primary": "#bda886",
    "accent": "#e8dfd0",
    "motion": "gather",
    "shapeId": 15
  },
  "t4_golden_sun_lance": {
    "nameTh": "หอกแสงตะวันศักดิ์สิทธิ์",
    "primary": "#d4b875",
    "accent": "#f2e6c9",
    "motion": "sweep",
    "shapeId": 16
  },
  "t4_crescent_moon_bow": {
    "nameTh": "คันศรจันทร์เสี้ยวเงิน",
    "primary": "#9cc2d6",
    "accent": "#dcebf2",
    "motion": "gather",
    "shapeId": 17
  },
  "t4_war_drum_shockwave": {
    "nameTh": "คลื่นกลองศึกเทพสงคราม",
    "primary": "#cf9c74",
    "accent": "#f0dac9",
    "motion": "pulse",
    "shapeId": 18
  },
  "t4_bodhi_lotus_ward": {
    "nameTh": "ม่านบัวโพธิ์คุ้มครอง",
    "primary": "#9ec7a4",
    "accent": "#dceede",
    "motion": "rise",
    "shapeId": 19
  },
  "t4_totem_wolf_claw": {
    "nameTh": "กรงเล็บหมาป่าโทเท็ม",
    "primary": "#c29f80",
    "accent": "#ebd9cb",
    "motion": "sweep",
    "shapeId": 20
  },
  "t4_sea_dragon_wave": {
    "nameTh": "คลื่นมังกรสมุทรซัดสาด",
    "primary": "#88b8d4",
    "accent": "#d6eaf5",
    "motion": "sweep",
    "shapeId": 21
  },
  "t4_faith_incense_halo": {
    "nameTh": "รัศมีธูปศรัทธาเทวะ",
    "primary": "#cfc086",
    "accent": "#f2eccf",
    "motion": "rise",
    "shapeId": 22
  },
  "t4_sky_edict_talisman": {
    "nameTh": "ยันต์ประกาศิตฟ้าคำรน",
    "primary": "#a3b3db",
    "accent": "#dde4f5",
    "motion": "gather",
    "shapeId": 23
  },
  "t4_blood_claw_rend": {
    "nameTh": "กรงเล็บมารฉีกโลหิต",
    "primary": "#c97b84",
    "accent": "#edd0d4",
    "motion": "sweep",
    "shapeId": 24
  },
  "t4_shadow_step_stab": {
    "nameTh": "ก้าวเงาสังหารพริบตา",
    "primary": "#988ab0",
    "accent": "#dcd6e6",
    "motion": "sweep",
    "shapeId": 25
  },
  "t4_venom_mist_palm": {
    "nameTh": "ฝ่ามือหมอกพิษแมงป่อง",
    "primary": "#9cc282",
    "accent": "#dceed0",
    "motion": "weave",
    "shapeId": 26
  },
  "t4_bone_spike_shield": {
    "nameTh": "โล่หนามกระดูกขาว",
    "primary": "#b5aeb8",
    "accent": "#e4e1e6",
    "motion": "gather",
    "shapeId": 27
  },
  "t4_soul_drain_whip": {
    "nameTh": "แส้สูบวิญญาณอาฆาต",
    "primary": "#b38298",
    "accent": "#e6d0da",
    "motion": "weave",
    "shapeId": 28
  },
  "t4_ghost_wail_bell": {
    "nameTh": "กระดิ่งภูตพรายคร่ำครวญ",
    "primary": "#8fb3b0",
    "accent": "#d8e8e6",
    "motion": "pulse",
    "shapeId": 29
  },
  "t4_zither_sonic_blade": {
    "nameTh": "คมพิณคลื่นเสียงสังหาร",
    "primary": "#8fc2bd",
    "accent": "#d9edea",
    "motion": "sweep",
    "shapeId": 30
  },
  "t4_illusion_mirror_lotus": {
    "nameTh": "กระจกมายาบัวเจ็ดสี",
    "primary": "#b39ec9",
    "accent": "#e3d9ed",
    "motion": "weave",
    "shapeId": 31
  },
  "t4_zen_heart_seal": {
    "nameTh": "มุทราจิตเซนสงบนิ่ง",
    "primary": "#c7b88c",
    "accent": "#ede7d3",
    "motion": "gather",
    "shapeId": 32
  },
  "t4_scholar_ink_slash": {
    "nameTh": "คมพู่กันน้ำหมึกปราชญ์",
    "primary": "#98b0a3",
    "accent": "#d8e3dd",
    "motion": "sweep",
    "shapeId": 33
  },
  "t4_mind_telekinesis_pins": {
    "nameTh": "เข็มบินพลังจิตไร้รูป",
    "primary": "#9eb8cf",
    "accent": "#dde8f0",
    "motion": "gather",
    "shapeId": 34
  },
  "t4_dream_butterfly_swarm": {
    "nameTh": "ฝูงผีเสื้อมายาฝัน",
    "primary": "#baa1cf",
    "accent": "#e6dcf0",
    "motion": "weave",
    "shapeId": 35
  },
  "t4_beast_pack_charge": {
    "nameTh": "ฝูงอสูรคำรามประจัญบาน",
    "primary": "#c49b78",
    "accent": "#ebd9ca",
    "motion": "pulse",
    "shapeId": 36
  },
  "t4_gu_beetle_carapace": {
    "nameTh": "เกราะแมลงกู่ทองคำ",
    "primary": "#9eb87a",
    "accent": "#dde8cc",
    "motion": "gather",
    "shapeId": 37
  },
  "t4_feral_fang_lunge": {
    "nameTh": "เขี้ยวอสูรบรรพกาลขย้ำ",
    "primary": "#c98e79",
    "accent": "#edd4cb",
    "motion": "sweep",
    "shapeId": 38
  },
  "t4_spirit_feather_gust": {
    "nameTh": "พายุขนนกวิญญาณอสูร",
    "primary": "#98bfd4",
    "accent": "#d8e9f2",
    "motion": "rise",
    "shapeId": 39
  },
  "t4_jade_herb_leaf": {
    "nameTh": "ใบไม้หยกสมานแผล",
    "primary": "#8ec298",
    "accent": "#d9ede0",
    "motion": "rise",
    "shapeId": 40
  },
  "t4_meridian_pulse_needle": {
    "nameTh": "เข็มเงินเปิดจุดชีพจร",
    "primary": "#cfc082",
    "accent": "#f2eccf",
    "motion": "gather",
    "shapeId": 41
  },
  "t4_vital_spring_dew": {
    "nameTh": "หยดน้ำค้างทิพย์ชุบชีวา",
    "primary": "#92c7b4",
    "accent": "#daf0e8",
    "motion": "rise",
    "shapeId": 42
  },
  "t4_forge_hammer_spark": {
    "nameTh": "ประกายค้อนเหล็กหลอม",
    "primary": "#cf986e",
    "accent": "#f0d8c6",
    "motion": "pulse",
    "shapeId": 43
  },
  "t4_pill_cauldron_flare": {
    "nameTh": "เปลวไฟเตาปรุงโอสถ",
    "primary": "#d98c6c",
    "accent": "#f5d4c6",
    "motion": "rise",
    "shapeId": 44
  },
  "t4_sword_mould_array": {
    "nameTh": "แม่พิมพ์กระบี่ค่ายกล",
    "primary": "#9ab2c4",
    "accent": "#dbe5ed",
    "motion": "gather",
    "shapeId": 45
  },
  "t4_iron_puppet_cleave": {
    "nameTh": "คมดาบหุ่นเชิดเหล็ก",
    "primary": "#ada195",
    "accent": "#e3ded8",
    "motion": "sweep",
    "shapeId": 46
  },
  "t4_clockwork_gear_burst": {
    "nameTh": "ฟันเฟืองกลไกระเบิด",
    "primary": "#b8a88c",
    "accent": "#e6dfd3",
    "motion": "pulse",
    "shapeId": 47
  },
  "t4_puppet_wire_snare": {
    "nameTh": "ตาข่ายด้ายเชิดวิญญาณ",
    "primary": "#b098bd",
    "accent": "#e1d7e6",
    "motion": "weave",
    "shapeId": 48
  },
  "t4_bagua_trigram_ring": {
    "nameTh": "วงแหวนยันต์แปดทิศ",
    "primary": "#9cb8a2",
    "accent": "#dbe6dd",
    "motion": "gather",
    "shapeId": 49
  },
  "t4_five_element_flags": {
    "nameTh": "ธงค่ายกลห้าธาตุ",
    "primary": "#b5b88c",
    "accent": "#e4e6d3",
    "motion": "rise",
    "shapeId": 50
  },
  "t4_thunder_seal_paper": {
    "nameTh": "แผ่นยันต์สายฟ้าฟาด",
    "primary": "#9cb0d9",
    "accent": "#dbe3f5",
    "motion": "pulse",
    "shapeId": 51
  },
  "t4_command_banner_thrust": {
    "nameTh": "ทวนธงบัญชาทัพหน้า",
    "primary": "#c9ab78",
    "accent": "#ede0ca",
    "motion": "sweep",
    "shapeId": 52
  },
  "t4_tactical_shield_wall": {
    "nameTh": "กำแพงโล่พยุหะศึก",
    "primary": "#b8a88a",
    "accent": "#e6dfd1",
    "motion": "gather",
    "shapeId": 53
  },
  "t4_abacus_coin_volley": {
    "nameTh": "ห่าเหรียญลูกคิดทอง",
    "primary": "#cfb876",
    "accent": "#f0e6c9",
    "motion": "sweep",
    "shapeId": 54
  },
  "t4_karma_chain_lash": {
    "nameTh": "โซ่ตรวนวิบากกรรม",
    "primary": "#ba9cc4",
    "accent": "#e6d9eb",
    "motion": "weave",
    "shapeId": 55
  },
  "t4_past_life_mirror": {
    "nameTh": "กระจกสะท้อนอดีตชาติ",
    "primary": "#a6b5c9",
    "accent": "#dfe5ed",
    "motion": "gather",
    "shapeId": 56
  },
  "t4_mercy_lotus_step": {
    "nameTh": "ก้าวบัวขาวชำระบาป",
    "primary": "#c9bd8c",
    "accent": "#ede8d3",
    "motion": "rise",
    "shapeId": 57
  },
  "t4_star_compass_beam": {
    "nameTh": "ลำแสงเข็มทิศดารา",
    "primary": "#9ab0d4",
    "accent": "#dbe4f2",
    "motion": "gather",
    "shapeId": 58
  },
  "t4_void_step_slash": {
    "nameTh": "คมมีดก้าวพริบตาผ่ามิติ",
    "primary": "#9e8ec2",
    "accent": "#ded7eb",
    "motion": "sweep",
    "shapeId": 59
  },
  "t4_geomancy_stone_spike": {
    "nameTh": "หนามศิลาชีพจรดิน",
    "primary": "#b8a686",
    "accent": "#e6ded0",
    "motion": "rise",
    "shapeId": 60
  },
  "t4_gravity_press_palm": {
    "nameTh": "ฝ่ามือแรงดึงดูดกดทับ",
    "primary": "#9288b3",
    "accent": "#dad5e8",
    "motion": "gather",
    "shapeId": 61
  },
  "t4_chrono_pendulum_cut": {
    "nameTh": "คมลูกตุ้มกาลเวลา",
    "primary": "#a6b3c9",
    "accent": "#dfe4ed",
    "motion": "sweep",
    "shapeId": 62
  },
  "t4_iai_quickdraw_arc": {
    "nameTh": "คมดาบชักเร็วไร้เงา",
    "primary": "#cf7e86",
    "accent": "#f0cdd1",
    "motion": "sweep",
    "shapeId": 63
  },
  "t4_ninpo_smoke_kunai": {
    "nameTh": "มีดบินคุไนควันเร้นเงา",
    "primary": "#8ea3b3",
    "accent": "#d7e0e6",
    "motion": "sweep",
    "shapeId": 64
  },
  "t4_deity_channel_bolt": {
    "nameTh": "สายฟ้าเทวะประทับร่าง",
    "primary": "#d1ba7e",
    "accent": "#f0e6cc",
    "motion": "pulse",
    "shapeId": 65
  },
  "t4_occult_takrut_ward": {
    "nameTh": "ตะกรุดอาคมขมังเวท",
    "primary": "#c4aa78",
    "accent": "#ebdfc9",
    "motion": "gather",
    "shapeId": 66
  },
  "t4_grave_soul_hand": {
    "nameTh": "หัตถ์วิญญาณสุสานโบราณ",
    "primary": "#8eab9e",
    "accent": "#d7e3dd",
    "motion": "rise",
    "shapeId": 67
  },
  "t4_innate_subpath_crest": {
    "nameTh": "ตราประจำสายย่อยตื่นรู้",
    "primary": "#9ec4d6",
    "accent": "#ddecf2",
    "motion": "pulse",
    "shapeId": 68
  },
  "t4_innate_grand_dao_seal": {
    "nameTh": "ตราประทับวิถีแห่งมรรคา",
    "primary": "#c9b882",
    "accent": "#ede6cf",
    "motion": "gather",
    "shapeId": 69
  },
  "t4_lightness_grand_dao_wing": {
    "nameTh": "ปีกวายุวิชาตัวเบามรรคา",
    "primary": "#98cfe0",
    "accent": "#daf0f7",
    "motion": "rise",
    "shapeId": 70
  },
  "t4_defensive_grand_dao_dome": {
    "nameTh": "ระฆังคุ้มกายมรรคาไร้พ่าย",
    "primary": "#cfbe86",
    "accent": "#f0e9d1",
    "motion": "gather",
    "shapeId": 71
  }
};
  SK.TECH_TO_T4_VFX = {
  "ART190_XIAN_007": "t4_azure_sword_ray",
  "ART190_XIAN_008": "t4_violet_thunder_blade",
  "ART190_XIAN_017": "t4_crimson_flame_spear",
  "ART190_XIAN_027": "t4_jade_breeze_fan",
  "ART190_XIAN_028": "t4_mist_illusion_palm",
  "ART190_XIAN_037": "t4_starlight_needle_rain",
  "ART190_XIAN_047": "t4_taiji_guard_circle",
  "ART190_XIAN_048": "t4_crane_step_cloud",
  "ART190_XIAN_057": "t4_bronze_bell_fist",
  "ART190_XIAN_058": "t4_mountain_cleave_axe",
  "ART190_BODY_007": "t4_blood_boil_knuckle",
  "ART190_BODY_008": "t4_iron_carapace_shield",
  "ART190_BODY_017": "t4_flame_marrow_kick",
  "ART190_BODY_027": "t4_frost_vein_grasp",
  "ART190_BODY_028": "t4_thunder_tempo_strike",
  "ART190_BODY_037": "t4_earth_root_stance",
  "ART190_BODY_047": "t4_golden_sun_lance",
  "ART190_BODY_048": "t4_crescent_moon_bow",
  "ART190_BODY_057": "t4_war_drum_shockwave",
  "ART190_BODY_058": "t4_bodhi_lotus_ward",
  "ART190_GOD_007": "t4_totem_wolf_claw",
  "ART190_GOD_008": "t4_sea_dragon_wave",
  "ART190_GOD_017": "t4_faith_incense_halo",
  "ART190_GOD_027": "t4_sky_edict_talisman",
  "ART190_GOD_028": "t4_blood_claw_rend",
  "ART190_GOD_037": "t4_shadow_step_stab",
  "ART190_GOD_047": "t4_venom_mist_palm",
  "ART190_GOD_048": "t4_bone_spike_shield",
  "ART190_GOD_057": "t4_soul_drain_whip",
  "ART190_GOD_058": "t4_ghost_wail_bell",
  "ART_C117_INNATE_SHADOW_ASSASSIN": "t4_zither_sonic_blade",
  "ART_V112_DEMON_GOLDEN_GU_PARASITE_T4": "t4_illusion_mirror_lotus",
  "ART_C117_INNATE_NETHER_GHOST_KING": "t4_zen_heart_seal",
  "ART_V112_SOUL_VOID_LOTUS_REFLECT_T4": "t4_scholar_ink_slash",
  "ART_V112_SOUL_MOUNTAIN_RIVER_SCROLL_T4": "t4_mind_telekinesis_pins",
  "ART_V112_SOUL_SEVEN_EMOTION_MIRAGE_T4": "t4_dream_butterfly_swarm",
  "ART_C117_INNATE_MIND_SWORD_TELEKINESIS": "t4_beast_pack_charge",
  "MP_BOW_SHADOW_SNIPE": "t4_gu_beetle_carapace",
  "MP_SPEAR_PHALANX_WALL_T4": "t4_feral_fang_lunge",
  "MP_SPEAR_STORM_DRAGON_T4": "t4_spirit_feather_gust",
  "MP_SPEAR_ASURA_RAMPAGE_T4": "t4_jade_herb_leaf",
  "MP_SPEAR_TIDAL_TRIDENT_T4": "t4_meridian_pulse_needle",
  "MP_STAFF_ARHAT_EIGHTEEN_T4": "t4_vital_spring_dew",
  "MP_STAFF_UNDERWORLD_GAVEL_T4": "t4_forge_hammer_spark",
  "MP_BOW_PARTING_SHOT_T4": "t4_pill_cauldron_flare",
  "MP_BOW_SOLAR_FLARE_T4": "t4_sword_mould_array",
  "MP_BLADE_MIND_THROW_T4": "t4_iron_puppet_cleave",
  "MP_BLADE_FROST_CRESCENT_T4": "t4_clockwork_gear_burst",
  "MP_SWORD_TENDON_SEVER_T4": "t4_puppet_wire_snare",
  "MP_FIST_TEMPEST_KICK_T4": "t4_bagua_trigram_ring",
  "MP_HYB_STAFF_FIST_ARHAT_T4": "t4_five_element_flags",
  "MP_HYB_BOW_FOCUS_ZITHER_T4": "t4_thunder_seal_paper",
  "MP_AGNOSTIC_SHADOWLESS_STEP_T4": "t4_command_banner_thrust",
  "ART_MECH_PUPPET_008": "t4_tactical_shield_wall",
  "ART_MECH_PUPPET_009": "t4_abacus_coin_volley",
  "ART_KARMA_SAMSARA_005": "t4_karma_chain_lash",
  "ART_KARMA_SAMSARA_008": "t4_past_life_mirror",
  "ART_KARMA_SAMSARA_010": "t4_mercy_lotus_step",
  "ART_BEAST_SOV_007": "t4_star_compass_beam",
  "ART_BEAST_SOV_009": "t4_void_step_slash",
  "ART_SAGE_SUP_003": "t4_geomancy_stone_spike",
  "ART_SAGE_SUP_004": "t4_gravity_press_palm",
  "ART_CROSS_V208_002": "t4_chrono_pendulum_cut",
  "ART_CROSS_V208_004": "t4_iai_quickdraw_arc",
  "ART_CROSS_V208_005": "t4_ninpo_smoke_kunai",
  "ART_CROSS_V208_007": "t4_deity_channel_bolt",
  "ART_CROSS_CRAFT_003": "t4_occult_takrut_ward",
  "ART_V214_EARTH_VEIN_WARDEN_T4": "t4_grave_soul_hand",
  "ART_V214_SEAL_SCRIPT_EXORCIST_T4": "t4_innate_subpath_crest",
  "ART_V214_THUNDER_TALISMAN_ADEPT_T4": "t4_innate_grand_dao_seal",
  "ART_V214_MIRAGE_ARRAY_WEAVER_T4": "t4_lightness_grand_dao_wing",
  "ART_V214_BATTLEFIELD_STRATEGIST_T4": "t4_defensive_grand_dao_dome",
  "ART_V214_SECT_STEWARD_T4": "t4_azure_sword_ray",
  "ART_V214_DIPLOMATIC_ENVOY_T4": "t4_violet_thunder_blade",
  "ART_V214_CARAVAN_QUARTERMASTER_T4": "t4_crimson_flame_spear",
  "ART_V214_CIVIL_TEACHING_MENTOR_T4": "t4_jade_breeze_fan",
  "ART_V214_SPIRIT_FEAST_HEALER_T4": "t4_mist_illusion_palm",
  "ART_V214_JADE_MEAL_PREPARER_T4": "t4_starlight_needle_rain",
  "ART_V214_CELESTIAL_ARMOR_ARTISAN_T4": "t4_taiji_guard_circle",
  "TECH_V215_ZITHER_ACT_04": "t4_crane_step_cloud",
  "TECH_V215_ZITHER_ACT_05": "t4_bronze_bell_fist",
  "TECH_V215_BRUSH_ACT_04": "t4_mountain_cleave_axe",
  "TECH_V215_BRUSH_ACT_05": "t4_blood_boil_knuckle",
  "TECH_V215_WHIP_ACT_04": "t4_iron_carapace_shield",
  "TECH_V215_WHIP_ACT_05": "t4_flame_marrow_kick",
  "TECH_V222_02": "t4_frost_vein_grasp",
  "TECH_V222_04": "t4_thunder_tempo_strike",
  "TECH_V222_07": "t4_earth_root_stance",
  "TECH_V222_12": "t4_golden_sun_lance",
  "TECH_V222_17": "t4_crescent_moon_bow",
  "INNATE_V234_CELESTIAL_STAR_SWORD": "t4_war_drum_shockwave",
  "INNATE_V234_KUNLUN_JADE_CAULDRON": "t4_bodhi_lotus_ward",
  "INNATE_V234_NINE_HEAVENS_THUNDER_SEAL": "t4_totem_wolf_claw",
  "INNATE_V234_METEOR_IRON_FIST": "t4_sea_dragon_wave",
  "INNATE_V234_NINE_SUNS_FURNACE_BODY": "t4_faith_incense_halo",
  "INNATE_V234_ABYSSAL_LEVIATHAN_BONE": "t4_sky_edict_talisman",
  "INNATE_V234_SOLAR_CHARIOT_SOVEREIGN": "t4_blood_claw_rend",
  "INNATE_V234_STYX_FERRYMAN_JUDGE": "t4_shadow_step_stab",
  "INNATE_V234_STORM_THUNDER_EMPEROR": "t4_venom_mist_palm",
  "INNATE_V234_CRIMSON_MOON_EXECUTIONER": "t4_bone_spike_shield",
  "INNATE_V234_MYRIAD_MIASMA_ALCHEMIST": "t4_soul_drain_whip",
  "INNATE_V234_ABYSSAL_SOUL_EATER": "t4_ghost_wail_bell",
  "INNATE_V234_CELESTIAL_CHESS_SCHOLAR": "t4_zither_sonic_blade",
  "INNATE_V234_SEVEN_EMOTIONS_ZITHER": "t4_illusion_mirror_lotus",
  "INNATE_V234_VOID_LOTUS_CONTEMPLATOR": "t4_zen_heart_seal",
  "INNATE_V234_THUNDER_CORE_ARTILLERY": "t4_scholar_ink_slash",
  "INNATE_V234_JADE_SPIDER_WEAVER": "t4_mind_telekinesis_pins",
  "INNATE_V234_SOLAR_BRONZE_COLOSSUS": "t4_dream_butterfly_swarm",
  "INNATE_V234_CAUSE_EFFECT_LEDGER": "t4_beast_pack_charge",
  "INNATE_V234_NETHER_RIVER_REAPER": "t4_gu_beetle_carapace",
  "INNATE_V234_GOLDEN_WHEEL_ARBITER": "t4_feral_fang_lunge",
  "INNATE_V234_KUNPENG_WIND_RIDER": "t4_spirit_feather_gust",
  "INNATE_V234_QILIN_THUNDER_HERALD": "t4_jade_herb_leaf",
  "INNATE_V234_NINE_NETHER_SERPENT_LORD": "t4_meridian_pulse_needle",
  "INNATE_V234_IMMORTAL_PEACH_APOTHECARY": "t4_vital_spring_dew",
  "INNATE_V234_EIGHT_TRIGRAMS_BANNER_SAGE": "t4_forge_hammer_spark",
  "INNATE_V234_CELESTIAL_INK_CHRONICLER": "t4_pill_cauldron_flare",
  "INNATE_V234_STAR_METEOR_WEAPONSMITH": "t4_sword_mould_array",
  "INNATE_V234_NINE_REVOLUTIONS_ALCHEMIST": "t4_iron_puppet_cleave",
  "INNATE_V234_PUPPET_RELIC_ARTIFICER": "t4_clockwork_gear_burst",
  "INNATE_V234_ASTRAL_STARFALL_ARRAY": "t4_puppet_wire_snare",
  "INNATE_V234_VERMILION_SEAL_TALISMAN": "t4_bagua_trigram_ring",
  "INNATE_V234_LABYRINTH_MIST_FORMATION": "t4_five_element_flags",
  "INNATE_V234_IMPERIAL_SEAL_CHANCELLOR": "t4_thunder_seal_paper",
  "INNATE_V234_SHADOW_INTELLIGENCE_MARSHAL": "t4_command_banner_thrust",
  "INNATE_V234_GRAND_LOGISTICS_COMMANDER": "t4_tactical_shield_wall",
  "TECH_V234_XIAN_ACT_03": "t4_abacus_coin_volley",
  "TECH_V234_XIAN_ACT_09": "t4_karma_chain_lash",
  "TECH_V234_XIAN_SUP_02": "t4_past_life_mirror",
  "TECH_V234_BODY_ACT_03": "t4_mercy_lotus_step",
  "TECH_V234_BODY_ACT_09": "t4_star_compass_beam",
  "TECH_V234_BODY_SUP_02": "t4_void_step_slash",
  "TECH_V234_GOD_ACT_03": "t4_geomancy_stone_spike",
  "TECH_V234_GOD_ACT_09": "t4_gravity_press_palm",
  "TECH_V234_GOD_SUP_02": "t4_chrono_pendulum_cut",
  "TECH_V234_DEMON_ACT_03": "t4_iai_quickdraw_arc",
  "TECH_V234_DEMON_ACT_09": "t4_ninpo_smoke_kunai",
  "TECH_V234_DEMON_SUP_02": "t4_deity_channel_bolt",
  "TECH_V234_HEART_SOUL_ACT_03": "t4_occult_takrut_ward",
  "TECH_V234_HEART_SOUL_ACT_09": "t4_grave_soul_hand",
  "TECH_V234_HEART_SOUL_SUP_02": "t4_innate_subpath_crest",
  "TECH_V234_MECH_PUPPET_ACT_03": "t4_innate_grand_dao_seal",
  "TECH_V234_MECH_PUPPET_ACT_09": "t4_lightness_grand_dao_wing",
  "TECH_V234_MECH_PUPPET_SUP_02": "t4_defensive_grand_dao_dome",
  "TECH_V234_KARMA_SAMSARA_ACT_03": "t4_azure_sword_ray",
  "TECH_V234_KARMA_SAMSARA_ACT_09": "t4_violet_thunder_blade",
  "TECH_V234_KARMA_SAMSARA_SUP_02": "t4_crimson_flame_spear",
  "TECH_V234_BEAST_SOVEREIGN_ACT_03": "t4_jade_breeze_fan",
  "TECH_V234_BEAST_SOVEREIGN_ACT_09": "t4_mist_illusion_palm",
  "TECH_V234_BEAST_SOVEREIGN_SUP_02": "t4_starlight_needle_rain",
  "TECH_V234_SAGE_SUPPORT_ACT_03": "t4_taiji_guard_circle",
  "TECH_V234_SAGE_SUPPORT_ACT_09": "t4_crane_step_cloud",
  "TECH_V234_SAGE_SUPPORT_SUP_02": "t4_bronze_bell_fist",
  "TECH_V234_CRAFT_CREATION_ACT_03": "t4_mountain_cleave_axe",
  "TECH_V234_CRAFT_CREATION_ACT_09": "t4_blood_boil_knuckle",
  "TECH_V234_CRAFT_CREATION_SUP_02": "t4_iron_carapace_shield",
  "TECH_V234_ARRAY_TALISMAN_ACT_03": "t4_flame_marrow_kick",
  "TECH_V234_ARRAY_TALISMAN_ACT_09": "t4_frost_vein_grasp",
  "TECH_V234_ARRAY_TALISMAN_SUP_02": "t4_thunder_tempo_strike",
  "TECH_V234_STRATEGY_GOVERNANCE_ACT_03": "t4_earth_root_stance",
  "TECH_V234_STRATEGY_GOVERNANCE_ACT_09": "t4_golden_sun_lance",
  "TECH_V234_STRATEGY_GOVERNANCE_SUP_02": "t4_crescent_moon_bow",
  "INNATE_V200_STAR_CHART_PROPHET": "t4_war_drum_shockwave",
  "INNATE_V200_POLARIS_FATE_WEAVER": "t4_bodhi_lotus_ward",
  "INNATE_V200_ECLIPSE_DOOM_SEER": "t4_totem_wolf_claw",
  "TECH_V200_ASTRO_DIVINATION_ACT_03": "t4_sea_dragon_wave",
  "INNATE_V200_METEOR_OMEN_CALLER": "t4_faith_incense_halo",
  "INNATE_V200_QIMEN_EIGHT_GATES_DIVINER": "t4_sky_edict_talisman",
  "INNATE_V200_BIG_DIPPER_LONGEVITY_SAGE": "t4_blood_claw_rend",
  "INNATE_V200_VAJRA_WRATH_GUARDIAN": "t4_shadow_step_stab",
  "INNATE_V200_GOLDEN_LOTUS_CHAN": "t4_venom_mist_palm",
  "INNATE_V200_SUTRA_CHANT_ARHAT": "t4_bone_spike_shield",
  "TECH_V200_BUDDHA_DHARMA_ACT_03": "t4_soul_drain_whip",
  "INNATE_V200_THOUSAND_PALM_BODHISATTVA": "t4_ghost_wail_bell",
  "INNATE_V200_RELIC_PAGODA_KEEPER": "t4_zither_sonic_blade",
  "INNATE_V200_KARMA_FIRE_ASCETIC": "t4_illusion_mirror_lotus",
  "INNATE_V200_DIMENSIONAL_BLADE_REAPER": "t4_zen_heart_seal",
  "INNATE_V200_VOID_BLINK_STRIDER": "t4_scholar_ink_slash",
  "INNATE_V200_POCKET_REALM_ARCHITECT": "t4_mind_telekinesis_pins",
  "TECH_V200_VOID_SPACE_ACT_03": "t4_dream_butterfly_swarm",
  "INNATE_V200_SINGULARITY_COLLAPSE_MAGE": "t4_beast_pack_charge",
  "INNATE_V200_PHASE_MIRAGE_ASSASSIN": "t4_gu_beetle_carapace",
  "INNATE_V200_SPATIAL_BARRIER_WARDEN": "t4_feral_fang_lunge",
  "INNATE_V200_SEVEN_STRINGS_ANNIHILATION": "t4_spirit_feather_gust",
  "INNATE_V200_JADE_FLUTE_SOUL_CHARMER": "t4_jade_herb_leaf",
  "INNATE_V200_WAR_DRUM_TEMPEST_HERALD": "t4_meridian_pulse_needle",
  "TECH_V200_SONIC_HARMONY_ACT_03": "t4_vital_spring_dew",
  "INNATE_V200_RESONANT_BELL_EXORCIST": "t4_forge_hammer_spark",
  "INNATE_V200_SILENT_WAVE_ASSASSIN": "t4_pill_cauldron_flare",
  "INNATE_V200_CELESTIAL_CHOIR_CONDUCTOR": "t4_sword_mould_array",
  "INNATE_V200_GOLDEN_SILKWORM_GU_LORD": "t4_iron_puppet_cleave",
  "INNATE_V200_MYRIAD_VENOM_APOTHECARY": "t4_clockwork_gear_burst",
  "INNATE_V200_BLOOD_PARASITE_HEXER": "t4_puppet_wire_snare",
  "TECH_V200_VENOM_GU_ACT_03": "t4_bagua_trigram_ring",
  "INNATE_V200_CORROSIVE_MIASMA_WEAVER": "t4_five_element_flags",
  "INNATE_V200_SCORPION_CLAW_EXECUTIONER": "t4_thunder_seal_paper",
  "INNATE_V200_IMMORTAL_NECTAR_TOXIN_SAGE": "t4_command_banner_thrust",
  "INNATE_V200_AZURE_DRAGON_SCALE_SHIFTER": "t4_tactical_shield_wall",
  "INNATE_V200_WHITE_TIGER_FANG_RAVAGER": "t4_abacus_coin_volley",
  "INNATE_V200_VERMILION_PHOENIX_WING_ASCENDANT": "t4_karma_chain_lash",
  "TECH_V200_PRIMORDIAL_SHIFTER_ACT_03": "t4_past_life_mirror",
  "INNATE_V200_BLACK_TORTOISE_SHELL_COLOSSUS": "t4_mercy_lotus_step",
  "INNATE_V200_FIEND_APE_TITAN_MORPH": "t4_star_compass_beam",
  "INNATE_V200_NINE_TAIL_MIRAGE_SHIFTER": "t4_void_step_slash",
  "INNATE_V200_THUNDER_CLOUD_CALLER": "t4_geomancy_stone_spike",
  "INNATE_V200_MONSOON_RAIN_WEAVER": "t4_gravity_press_palm",
  "INNATE_V200_BLIZZARD_FROST_HERALD": "t4_chrono_pendulum_cut",
  "TECH_V200_CELESTIAL_WEATHER_ACT_03": "t4_iai_quickdraw_arc",
  "INNATE_V200_TYPHOON_GALE_SOVEREIGN": "t4_ninpo_smoke_kunai",
  "INNATE_V200_MIRAGE_FOG_SHROUDER": "t4_deity_channel_bolt",
  "INNATE_V200_SOLAR_ZENITH_INVOKER": "t4_occult_takrut_ward",
  "INNATE_V200_HORIZON_WIND_WALKER": "t4_grave_soul_hand",
  "INNATE_V200_RUIN_PATHFINDER_SAGE": "t4_innate_subpath_crest",
  "INNATE_V200_CARAVAN_ESCORT_VANGUARD": "t4_innate_grand_dao_seal",
  "TECH_V200_WANDERING_DAO_ACT_03": "t4_lightness_grand_dao_wing",
  "INNATE_V200_WILDERNESS_BEAST_TRACKER": "t4_defensive_grand_dao_dome",
  "INNATE_V200_CLOUD_STEP_HERMIT": "t4_azure_sword_ray",
  "INNATE_V200_REALM_MAPPER_CHRONICLER": "t4_violet_thunder_blade",
  "INNATE_V200_GOLDEN_ABACUS_ARBITER": "t4_crimson_flame_spear",
  "INNATE_V200_BLOOD_CONTRACT_NOTARY": "t4_jade_breeze_fan",
  "INNATE_V200_CARAVAN_SYNDICATE_MAGNATE": "t4_mist_illusion_palm",
  "TECH_V200_MERCANTILE_DAO_ACT_03": "t4_starlight_needle_rain",
  "INNATE_V200_TREASURE_APPRAISER_SAGE": "t4_taiji_guard_circle",
  "INNATE_V200_DEBT_FORECLOSURE_ENFORCER": "t4_crane_step_cloud",
  "INNATE_V200_EQUITY_SHIELD_CHANCELLOR": "t4_bronze_bell_fist",
  "INNATE_V200_LUOPAN_GEOMANCER_SAGE": "t4_mountain_cleave_axe",
  "INNATE_V200_MOUNTAIN_SPINE_ANCHOR": "t4_blood_boil_knuckle",
  "INNATE_V200_LEYLINE_WARD_ARCHITECT": "t4_iron_carapace_shield",
  "TECH_V200_DRAGON_VEIN_GEOMANCY_ACT_03": "t4_flame_marrow_kick",
  "INNATE_V200_EARTH_DRAGON_AWAKENER": "t4_frost_vein_grasp",
  "INNATE_V200_JADE_FAULT_CRUSHER": "t4_thunder_tempo_strike",
  "INNATE_V200_SANCTUARY_PEAK_CUSTODIAN": "t4_earth_root_stance",
  "INNATE_V200_HEAVY_STAR_CRUSHER": "t4_golden_sun_lance",
  "INNATE_V200_ZERO_GRAVITY_DRIFTER": "t4_crescent_moon_bow",
  "INNATE_V200_ORBITAL_REPULSION_WARDEN": "t4_war_drum_shockwave",
  "TECH_V200_GRAVITY_DAO_ACT_03": "t4_bodhi_lotus_ward",
  "INNATE_V200_SINGULARITY_WELL_CONTROLLER": "t4_totem_wolf_claw",
  "INNATE_V200_METEOR_WEIGHT_STRIKER": "t4_sea_dragon_wave",
  "INNATE_V200_TIDAL_LOCK_ARBITER": "t4_faith_incense_halo",
  "INNATE_V200_SUNDIAL_EPOCH_CHRONICLER": "t4_sky_edict_talisman",
  "INNATE_V200_HOURGLASS_SAND_REAPER": "t4_blood_claw_rend",
  "INNATE_V200_REWIND_SPRING_HEALER": "t4_shadow_step_stab",
  "TECH_V200_CHRONO_EPOCH_ACT_03": "t4_venom_mist_palm",
  "INNATE_V200_ACCELERATED_BLADE_FLASH": "t4_bone_spike_shield",
  "INNATE_V200_STASIS_SEAL_WARDEN": "t4_soul_drain_whip",
  "INNATE_V200_PAST_FUTURE_MIRROR_SAGE": "t4_ghost_wail_bell",
  "INNATE_V200_IMPERIAL_EDICT_CALLIGRAPHER": "t4_zither_sonic_blade",
  "INNATE_V200_LANDSCAPE_SCROLL_PAINTER": "t4_illusion_mirror_lotus",
  "INNATE_V200_SWORD_POEM_IMMORTAL": "t4_zen_heart_seal",
  "TECH_V200_INK_LITERATI_ACT_03": "t4_scholar_ink_slash",
  "INNATE_V200_CLASSICS_LAW_ARBITER": "t4_mind_telekinesis_pins",
  "INNATE_V200_VERMILION_CRITIQUE_CENSOR": "t4_dream_butterfly_swarm",
  "INNATE_V200_HISTORIANS_DESTINY_QUILL": "t4_beast_pack_charge",
  "INNATE_V200_PHANTOM_SILK_PUPPETEER": "t4_gu_beetle_carapace",
  "INNATE_V200_SOUL_STITCH_NEEDLE_MASTER": "t4_feral_fang_lunge",
  "INNATE_V200_PAPER_EFFIGY_CONJURER": "t4_spirit_feather_gust",
  "TECH_V200_SOUL_PUPPETRY_ACT_03": "t4_jade_herb_leaf",
  "INNATE_V200_CORPSE_FLAME_MARIONETTE": "t4_meridian_pulse_needle",
  "INNATE_V200_MIRROR_SHADOW_TWIN": "t4_vital_spring_dew",
  "INNATE_V200_FATE_STRING_CONDUCTOR": "t4_forge_hammer_spark",
  "INNATE_V200_HUN_DUN_ORIGIN_DEVOURER": "t4_pill_cauldron_flare",
  "INNATE_V200_YIN_YANG_MILLSTONE_SAGE": "t4_sword_mould_array",
  "INNATE_V200_FIVE_PHASE_INVERSION_ADEPT": "t4_iron_puppet_cleave",
  "TECH_V200_PRIMORDIAL_CHAOS_ACT_03": "t4_clockwork_gear_burst",
  "INNATE_V200_ENTROPY_FLAME_SOVEREIGN": "t4_puppet_wire_snare",
  "INNATE_V200_GENESIS_LOTUS_CREATOR": "t4_bagua_trigram_ring",
  "INNATE_V200_ABYSSAL_CHAOS_HALBERD": "t4_five_element_flags",
  "INNATE_V200_IAI_FLASH_SLICER": "t4_thunder_seal_paper",
  "INNATE_V200_MURAMASA_BLOOD_EDGE": "t4_command_banner_thrust",
  "INNATE_V200_UNBROKEN_IRON_STANCE": "t4_tactical_shield_wall",
  "TECH_V200_SHADOW_SAMURAI_ACT_03": "t4_abacus_coin_volley",
  "INNATE_V200_KENJUTSU_SWORD_SAINT": "t4_karma_chain_lash",
  "INNATE_V200_CLONE_MIRAGE_WEAVER": "t4_past_life_mirror",
  "INNATE_V200_SMOKE_MIST_ASSASSIN": "t4_mercy_lotus_step",
  "INNATE_V200_CONCEALED_WEAPON_STRIKER": "t4_star_compass_beam",
  "TECH_V200_NINPO_SHADOW_ACT_03": "t4_void_step_slash",
  "INNATE_V200_SHADOW_BIND_STRATEGIST": "t4_geomancy_stone_spike",
  "INNATE_V200_EXPLOSIVE_TAG_TRAPPER": "t4_gravity_press_palm",
  "INNATE_V200_FIVE_SEAL_ELEMENTALIST": "t4_chrono_pendulum_cut",
  "INNATE_V200_SUBSTITUTION_ESCAPE": "t4_iai_quickdraw_arc",
  "TECH_V200_NINPO_ELEMENTAL_ACT_03": "t4_ninpo_smoke_kunai",
  "INNATE_V200_CHAKRA_SCROLL_SEALER": "t4_deity_channel_bolt",
  "INNATE_V200_CELESTIAL_BEAST_HERALD": "t4_occult_takrut_ward",
  "INNATE_V200_WAR_DEITY_CONVOKER": "t4_grave_soul_hand",
  "INNATE_V200_NETHER_GATE_CALLER": "t4_innate_subpath_crest",
  "TECH_V200_DIVINE_SUMMONER_ACT_03": "t4_innate_grand_dao_seal",
  "INNATE_V200_PANTHEON_CHOIR_CONDUCTOR": "t4_lightness_grand_dao_wing",
  "INNATE_V200_SOLAR_AVATAR_VESSEL": "t4_defensive_grand_dao_dome",
  "INNATE_V200_STORM_WRATH_MEDIUM": "t4_azure_sword_ray",
  "INNATE_V200_VAJRA_EARTH_ANCHOR": "t4_violet_thunder_blade",
  "TECH_V200_DIVINE_POSSESSION_ACT_03": "t4_crimson_flame_spear",
  "INNATE_V200_MAHADEVA_DESTROYER": "t4_jade_breeze_fan",
  "INNATE_V200_JUDGMENT_SCALE_BORROWER": "t4_mist_illusion_palm",
  "INNATE_V200_THUNDERBOLT_WIELDER": "t4_starlight_needle_rain",
  "INNATE_V200_THIRD_EYE_INSIGHT": "t4_taiji_guard_circle",
  "TECH_V200_DIVINE_CHANNELER_ACT_03": "t4_crane_step_cloud",
  "INNATE_V200_SERPENT_GRACE_BORROWER": "t4_bronze_bell_fist",
  "INNATE_V200_MADNESS_WHISPERER": "t4_mountain_cleave_axe",
  "INNATE_V200_FLESH_MUTATION_ADEPT": "t4_blood_boil_knuckle",
  "INNATE_V200_VOID_WARPING_HERETIC": "t4_iron_carapace_shield",
  "TECH_V200_VOID_HERETIC_PACT_ACT_03": "t4_flame_marrow_kick",
  "INNATE_V200_SANITY_SACRIFICE_WARLOCK": "t4_frost_vein_grasp",
  "INNATE_V200_YANTRA_IRON_SKIN": "t4_thunder_tempo_strike",
  "INNATE_V200_BLACK_ARTS_HEXER": "t4_earth_root_stance",
  "INNATE_V200_PHRAY_SPIRIT_WHISPER": "t4_golden_sun_lance",
  "TECH_V200_OCCULT_MAGE_ACT_03": "t4_crescent_moon_bow",
  "INNATE_V200_SACRED_GOLEM_TAMER": "t4_war_drum_shockwave",
  "INNATE_V200_IRON_BONE_DEVOURER": "t4_bodhi_lotus_ward",
  "INNATE_V200_BEAST_FLESH_CONSUMER": "t4_totem_wolf_claw",
  "INNATE_V200_INTERNAL_ORGAN_REFINER": "t4_sea_dragon_wave",
  "TECH_V200_DEVOURING_FLESH_ACT_03": "t4_faith_incense_halo",
  "INNATE_V200_PRIMORDIAL_STOMACH_TITAN": "t4_sky_edict_talisman",
  "INNATE_V200_ANCESTRAL_GRAVE_KEEPER": "t4_blood_claw_rend",
  "INNATE_V200_BONE_PUPPET_REFINER": "t4_shadow_step_stab",
  "INNATE_V200_SOUL_SIPHON_REAPER": "t4_venom_mist_palm",
  "TECH_V200_NETHER_GRAVE_ACT_03": "t4_bone_spike_shield",
  "INNATE_V200_CORPSE_EXPLOSION_ACOLYTE": "t4_soul_drain_whip",
  "INNATE_V200_MARROW_HERITAGE_SHAMAN": "t4_ghost_wail_bell",
  "INNATE_V200_ANCESTRAL_TABLET_CHANTER": "t4_zither_sonic_blade",
  "INNATE_V200_HEROIC_SPIRIT_SPEARMAN": "t4_illusion_mirror_lotus",
  "TECH_V200_ANCESTRAL_RITUAL_ACT_03": "t4_zen_heart_seal",
  "INNATE_V200_CHRONICLE_TOTEM_GUARDIAN": "t4_scholar_ink_slash",
  "INNATE_V200_ABYSSAL_TIDE_SPEAR": "t4_mind_telekinesis_pins",
  "INNATE_V200_FROST_MAELSTROM_CALLER": "t4_dream_butterfly_swarm",
  "INNATE_V200_DRAGON_SHIP_NAVIGATOR": "t4_beast_pack_charge",
  "TECH_V200_TIDE_VOYAGER_ACT_03": "t4_gu_beetle_carapace",
  "INNATE_V200_DEEP_PEARL_APOTHECARY": "t4_feral_fang_lunge",
  "INNATE_V200_ANCIENT_RUBBING_DECODER": "t4_spirit_feather_gust",
  "INNATE_V200_SUTRA_COMPILER_SAGE": "t4_jade_herb_leaf",
  "INNATE_V200_TECHNIQUE_MIRROR_SCHOLAR": "t4_meridian_pulse_needle",
  "TECH_V200_LORE_ARCHIVIST_ACT_03": "t4_vital_spring_dew",
  "INNATE_V200_FORBIDDEN_SCROLL_CUSTODIAN": "t4_forge_hammer_spark",
  "INNATE_V200_JADE_DICE_HIGH_ROLLER": "t4_pill_cauldron_flare",
  "INNATE_V200_FATE_COIN_FLIPPER": "t4_sword_mould_array",
  "INNATE_V200_KARMA_ROULETTE_DEALER": "t4_iron_puppet_cleave",
  "TECH_V200_FORTUNE_GAMBLER_ACT_03": "t4_clockwork_gear_burst",
  "INNATE_V200_ALL_IN_DESPERADO_BLADE": "t4_puppet_wire_snare",
  "INNATE_V200_IMMORTAL_HERB_PLANTER": "t4_bagua_trigram_ring",
  "INNATE_V200_IRON_THORN_VINE_WEAVER": "t4_five_element_flags",
  "INNATE_V200_SPIRIT_GRAIN_SOVEREIGN": "t4_thunder_seal_paper",
  "TECH_V200_SPIRIT_HUSBANDRY_ACT_03": "t4_command_banner_thrust",
  "INNATE_V200_PARASITIC_SPORE_CULTIVATOR": "t4_tactical_shield_wall",
  "INNATE_V200_GRAND_TOURNEY_CHAMPION": "t4_abacus_coin_volley",
  "INNATE_V200_DUELIST_HONOR_BLADE": "t4_karma_chain_lash",
  "INNATE_V200_CROWD_ROAR_BRAWLER": "t4_past_life_mirror",
  "TECH_V200_ARENA_GLORY_ACT_03": "t4_mercy_lotus_step",
  "INNATE_V200_BANNER_GLORY_MARSHAL": "t4_star_compass_beam",
  "TECH_V230_SHADOW_SAMURAI_QINGGONG": "t4_void_step_slash",
  "TECH_V230_SHADOW_SAMURAI_DEFENSE": "t4_geomancy_stone_spike",
  "TECH_V230_NINPO_SHADOW_QINGGONG": "t4_gravity_press_palm",
  "TECH_V230_NINPO_SHADOW_DEFENSE": "t4_chrono_pendulum_cut",
  "TECH_V230_NINPO_ELEMENTAL_QINGGONG": "t4_iai_quickdraw_arc",
  "TECH_V230_NINPO_ELEMENTAL_DEFENSE": "t4_ninpo_smoke_kunai",
  "TECH_V230_DIVINE_SUMMONER_QINGGONG": "t4_deity_channel_bolt",
  "TECH_V230_DIVINE_SUMMONER_DEFENSE": "t4_occult_takrut_ward",
  "TECH_V230_DIVINE_POSSESSION_QINGGONG": "t4_grave_soul_hand",
  "TECH_V230_DIVINE_POSSESSION_DEFENSE": "t4_innate_subpath_crest",
  "TECH_V230_DIVINE_CHANNELER_QINGGONG": "t4_innate_grand_dao_seal",
  "TECH_V230_DIVINE_CHANNELER_DEFENSE": "t4_lightness_grand_dao_wing",
  "TECH_V230_VOID_HERETIC_PACT_QINGGONG": "t4_defensive_grand_dao_dome",
  "TECH_V230_VOID_HERETIC_PACT_DEFENSE": "t4_azure_sword_ray",
  "TECH_V230_OCCULT_MAGE_QINGGONG": "t4_violet_thunder_blade",
  "TECH_V230_OCCULT_MAGE_DEFENSE": "t4_crimson_flame_spear",
  "TECH_V230_DEVOURING_FLESH_QINGGONG": "t4_jade_breeze_fan",
  "TECH_V230_DEVOURING_FLESH_DEFENSE": "t4_mist_illusion_palm",
  "TECH_V230_NETHER_GRAVE_QINGGONG": "t4_starlight_needle_rain",
  "TECH_V230_NETHER_GRAVE_DEFENSE": "t4_taiji_guard_circle",
  "TECH_V230_ANCESTRAL_RITUAL_QINGGONG": "t4_crane_step_cloud",
  "TECH_V230_ANCESTRAL_RITUAL_DEFENSE": "t4_bronze_bell_fist",
  "TECH_V230_TIDE_VOYAGER_QINGGONG": "t4_mountain_cleave_axe",
  "TECH_V230_TIDE_VOYAGER_DEFENSE": "t4_blood_boil_knuckle",
  "TECH_V230_LORE_ARCHIVIST_QINGGONG": "t4_iron_carapace_shield",
  "TECH_V230_LORE_ARCHIVIST_DEFENSE": "t4_flame_marrow_kick",
  "TECH_V230_FORTUNE_GAMBLER_QINGGONG": "t4_frost_vein_grasp",
  "TECH_V230_FORTUNE_GAMBLER_DEFENSE": "t4_thunder_tempo_strike",
  "TECH_V230_SPIRIT_HUSBANDRY_QINGGONG": "t4_earth_root_stance",
  "TECH_V230_SPIRIT_HUSBANDRY_DEFENSE": "t4_golden_sun_lance",
  "TECH_V230_ARENA_GLORY_QINGGONG": "t4_crescent_moon_bow",
  "TECH_V230_ARENA_GLORY_DEFENSE": "t4_war_drum_shockwave",
  "TECH_UNI_V230_007": "t4_bodhi_lotus_ward",
  "TECH_UNI_V230_008": "t4_totem_wolf_claw",
  "TECH_UNI_V230_014": "t4_sea_dragon_wave",
  "TECH_UNI_V230_017": "t4_faith_incense_halo",
  "TECH_UNI_V230_020": "t4_sky_edict_talisman",
  "TECH_UNI_V230_023": "t4_blood_claw_rend",
  "TECH_UNI_V230_026": "t4_shadow_step_stab",
  "TECH_UNI_V230_029": "t4_venom_mist_palm",
  "TECH_V240_ROSARY_01": "t4_bone_spike_shield",
  "TECH_V240_CLAW_01": "t4_soul_drain_whip",
  "TECH_V240_NEEDLE_01": "t4_ghost_wail_bell",
  "TECH_V240_FAN_01": "t4_zither_sonic_blade",
  "TECH_V240_ASTROLABE_01": "t4_illusion_mirror_lotus",
  "TECH_V240_WHIP_01": "t4_zen_heart_seal",
  "TECH_V240_ZITHER_01": "t4_scholar_ink_slash",
  "TECH_V240_FOCUS_01": "t4_mind_telekinesis_pins"
};
  SK.PASSIVE_TO_T4_VFX = {
  "ART190_XIAN_018": "t4_azure_sword_ray",
  "ART190_XIAN_038": "t4_violet_thunder_blade",
  "ART190_XIAN_067": "t4_crimson_flame_spear",
  "ART190_XIAN_068": "t4_jade_breeze_fan",
  "ART190_BODY_018": "t4_mist_illusion_palm",
  "ART190_BODY_038": "t4_starlight_needle_rain",
  "ART190_BODY_067": "t4_taiji_guard_circle",
  "ART190_BODY_068": "t4_crane_step_cloud",
  "ART190_GOD_018": "t4_bronze_bell_fist",
  "ART190_GOD_038": "t4_mountain_cleave_axe",
  "ART190_GOD_067": "t4_blood_boil_knuckle",
  "ART190_GOD_068": "t4_iron_carapace_shield",
  "PASS_STAFF_PILLAR_STANCE_T4": "t4_flame_marrow_kick",
  "PASS_FIST_IRON_KNUCKLE_T4": "t4_frost_vein_grasp",
  "PASS_ROBE_SPIRIT_WEAVE_T4": "t4_thunder_tempo_strike",
  "PASS_PERFECT_CIRCULATION_T4": "t4_earth_root_stance",
  "PASS_NINE_BREATH_CYCLE_T4": "t4_golden_sun_lance",
  "PASS_GOLDEN_CORE_PULSE_T4": "t4_crescent_moon_bow",
  "PASS_FLAW_SEEKER_T4": "t4_war_drum_shockwave",
  "PASS_WIND_CHANT_TEMPO_T4": "t4_bodhi_lotus_ward",
  "PASS_EXECUTIONER_INSTINCT_T4": "t4_totem_wolf_claw",
  "PASS_SPEAR_KINETIC_MASTERY_T4": "t4_sea_dragon_wave",
  "PASS_BOW_HEAVY_DRAW_T4": "t4_faith_incense_halo",
  "PASS_BLADE_RUTHLESS_EDGE_T4": "t4_sky_edict_talisman",
  "PASS_FOCUS_SCHOLAR_POISE_T4": "t4_blood_claw_rend",
  "PASS_SWORD_PURE_GEOMETRY_T4": "t4_shadow_step_stab",
  "PASS_CRAFT_002": "t4_venom_mist_palm",
  "TECH_V222_19": "t4_bone_spike_shield",
  "TECH_V222_21": "t4_soul_drain_whip",
  "TECH_V222_23": "t4_ghost_wail_bell",
  "TECH_V234_XIAN_PAS_02": "t4_zither_sonic_blade",
  "TECH_V234_XIAN_AUX_02": "t4_illusion_mirror_lotus",
  "TECH_V234_BODY_PAS_02": "t4_zen_heart_seal",
  "TECH_V234_BODY_AUX_02": "t4_scholar_ink_slash",
  "TECH_V234_GOD_PAS_02": "t4_mind_telekinesis_pins",
  "TECH_V234_GOD_AUX_02": "t4_dream_butterfly_swarm",
  "TECH_V234_DEMON_PAS_02": "t4_beast_pack_charge",
  "TECH_V234_DEMON_AUX_02": "t4_gu_beetle_carapace",
  "TECH_V234_HEART_SOUL_PAS_02": "t4_feral_fang_lunge",
  "TECH_V234_HEART_SOUL_AUX_02": "t4_spirit_feather_gust",
  "TECH_V234_MECH_PUPPET_PAS_02": "t4_jade_herb_leaf",
  "TECH_V234_MECH_PUPPET_AUX_02": "t4_meridian_pulse_needle",
  "TECH_V234_KARMA_SAMSARA_PAS_02": "t4_vital_spring_dew",
  "TECH_V234_KARMA_SAMSARA_AUX_02": "t4_forge_hammer_spark",
  "TECH_V234_BEAST_SOVEREIGN_PAS_02": "t4_pill_cauldron_flare",
  "TECH_V234_BEAST_SOVEREIGN_AUX_02": "t4_sword_mould_array",
  "TECH_V234_SAGE_SUPPORT_PAS_02": "t4_iron_puppet_cleave",
  "TECH_V234_SAGE_SUPPORT_AUX_02": "t4_clockwork_gear_burst",
  "TECH_V234_CRAFT_CREATION_PAS_02": "t4_puppet_wire_snare",
  "TECH_V234_CRAFT_CREATION_AUX_02": "t4_bagua_trigram_ring",
  "TECH_V234_ARRAY_TALISMAN_PAS_02": "t4_five_element_flags",
  "TECH_V234_ARRAY_TALISMAN_AUX_02": "t4_thunder_seal_paper",
  "TECH_V234_STRATEGY_GOVERNANCE_PAS_02": "t4_command_banner_thrust",
  "TECH_V234_STRATEGY_GOVERNANCE_AUX_02": "t4_tactical_shield_wall"
};
  SK.resolveT4Vfx = (techOrMove, moveOpt) => {
    if (!techOrMove) return null;
    const id = techOrMove.tech || techOrMove.id, tech = g.CULT && g.CULT.tech ? g.CULT.tech(id) : techOrMove;
    if (!tech || tech.tier !== 4 || tech.legendary || techOrMove.legendary || tech.fxKind || techOrMove.fxKind || (moveOpt && (moveOpt.fxKind || moveOpt.legendary || moveOpt.signatureVfx))) return null;
    const move = moveOpt && (tech.moveDefs || []).find(m => m.id === moveOpt.id);
    if (move && (move.fxKind || move.legendary || move.signatureVfx)) return null;
    return SK.TECH_TO_T4_VFX[id] || null;
  };

  SK.T3_EXT_VFX_CATALOG = {
  "t3_pine_wind_sword": {
    "nameTh": "กระบี่สายลมสนเขา",
    "primary": "#9abcc9",
    "accent": "#d9e7ed",
    "shapeId": 0
  },
  "t3_thunder_spark_spear": {
    "nameTh": "ทวนประกายอัสนี",
    "primary": "#a1b2d6",
    "accent": "#dce3f2",
    "shapeId": 1
  },
  "t3_flame_wave_saber": {
    "nameTh": "ดาบคลื่นเปลวอัคคี",
    "primary": "#cf9678",
    "accent": "#f0d8cb",
    "shapeId": 2
  },
  "t3_jade_lotus_guard": {
    "nameTh": "ม่านบัวหยกคุ้มกาย",
    "primary": "#96bfa3",
    "accent": "#d8e8dd",
    "shapeId": 3
  },
  "t3_crane_feather_step": {
    "nameTh": "ก้าวขนนกกระเรียนขาว",
    "primary": "#a6c4cf",
    "accent": "#dde9ed",
    "shapeId": 4
  },
  "t3_star_dot_finger": {
    "nameTh": "ดัชนีสกัดจุดดารา",
    "primary": "#a8b0cf",
    "accent": "#dee1ed",
    "shapeId": 5
  },
  "t3_iron_ox_shoulder": {
    "nameTh": "เพลงมวยโคเหล็กกระแทกไหล่",
    "primary": "#b89e84",
    "accent": "#e6dbd0",
    "shapeId": 6
  },
  "t3_bronze_fist_shock": {
    "nameTh": "หมัดทองสัมฤทธิ์สะท้าน",
    "primary": "#c4aa7c",
    "accent": "#ebdfc9",
    "shapeId": 7
  },
  "t3_blood_vein_burst": {
    "nameTh": "ปราณโลหิตสูบฉีด",
    "primary": "#c78085",
    "accent": "#edd0d2",
    "shapeId": 8
  },
  "t3_stone_wall_stance": {
    "nameTh": "ท่าตั้งรับกำแพงศิลา",
    "primary": "#a8a299",
    "accent": "#e0deda",
    "shapeId": 9
  },
  "t3_tiger_claw_tear": {
    "nameTh": "กรงเล็บพยัคฆ์ฉีกกระชาก",
    "primary": "#c29878",
    "accent": "#ebd9cb",
    "shapeId": 10
  },
  "t3_whirlwind_kick": {
    "nameTh": "ลูกเตะพายุหมุน",
    "primary": "#98bdc4",
    "accent": "#d8e7ea",
    "shapeId": 11
  },
  "t3_sun_ray_halberd": {
    "nameTh": "ง้าวรัศมีตะวัน",
    "primary": "#cfb478",
    "accent": "#f0e4ca",
    "shapeId": 12
  },
  "t3_moonlight_arrow": {
    "nameTh": "ลูกศรแสงจันทร์ฉาย",
    "primary": "#9bbbd1",
    "accent": "#dbe7f0",
    "shapeId": 13
  },
  "t3_war_chant_banner": {
    "nameTh": "ธงศึกปลุกขวัญทหาร",
    "primary": "#c79a76",
    "accent": "#eddaca",
    "shapeId": 14
  },
  "t3_mercy_dew_drop": {
    "nameTh": "หยดน้ำทิพย์เมตตา",
    "primary": "#94bfa0",
    "accent": "#d8e8dc",
    "shapeId": 15
  },
  "t3_totem_horn_blast": {
    "nameTh": "เขาสัตว์โทเท็มคำราม",
    "primary": "#ba987c",
    "accent": "#e6d8cc",
    "shapeId": 16
  },
  "t3_sea_foam_slash": {
    "nameTh": "คมดาบฟองคลื่นสมุทร",
    "primary": "#8ab2cc",
    "accent": "#d6e6f0",
    "shapeId": 17
  },
  "t3_shadow_fang_dagger": {
    "nameTh": "มีดสั้นเขี้ยวเงามืด",
    "primary": "#9486ad",
    "accent": "#dad4e3",
    "shapeId": 18
  },
  "t3_scorpion_tail_whip": {
    "nameTh": "แส้หางแมงป่องพิษ",
    "primary": "#98b87c",
    "accent": "#d8e6cc",
    "shapeId": 19
  },
  "t3_blood_mist_shroud": {
    "nameTh": "ม่านหมอกโลหิตพรางตา",
    "primary": "#c27e88",
    "accent": "#ebd0d4",
    "shapeId": 20
  },
  "t3_ghost_fire_wisp": {
    "nameTh": "ลูกไฟวิญญาณเร่ร่อน",
    "primary": "#8aadab",
    "accent": "#d6e3e2",
    "shapeId": 21
  },
  "t3_corpse_iron_nail": {
    "nameTh": "ตะปูเหล็กตรึงซากศพ",
    "primary": "#9e94ab",
    "accent": "#ded9e3",
    "shapeId": 22
  },
  "t3_mind_ripple_chime": {
    "nameTh": "กระดิ่งคลื่นจิตสะท้อน",
    "primary": "#96bab8",
    "accent": "#d8e6e5",
    "shapeId": 23
  },
  "t3_scholar_brush_hook": {
    "nameTh": "ตวัดพู่กันบัณฑิต",
    "primary": "#96aba0",
    "accent": "#d8e0dc",
    "shapeId": 24
  },
  "t3_dream_moth_dust": {
    "nameTh": "ผงธุลีผีเสื้อหลับใหล",
    "primary": "#b098c4",
    "accent": "#e1d7eb",
    "shapeId": 25
  },
  "t3_zen_wood_fish": {
    "nameTh": "เกราะไม้ปลาเซนคุ้มจิต",
    "primary": "#c2b288",
    "accent": "#ebe4d2",
    "shapeId": 26
  },
  "t3_pack_wolf_howl": {
    "nameTh": "เสียงหอนฝูงหมาป่า",
    "primary": "#bd9678",
    "accent": "#e8d8cb",
    "shapeId": 27
  },
  "t3_venom_centipede_bite": {
    "nameTh": "เขี้ยวตะขาบพิษร้อยขา",
    "primary": "#9ab578",
    "accent": "#dbe6cc",
    "shapeId": 28
  },
  "t3_falcon_dive_talon": {
    "nameTh": "กรงเล็บเหยี่ยวถลาลม",
    "primary": "#96b8cc",
    "accent": "#d8e6f0",
    "shapeId": 29
  },
  "t3_herb_mortar_mist": {
    "nameTh": "ไอสมุนไพรครกหยก",
    "primary": "#8cb896",
    "accent": "#d6e6da",
    "shapeId": 30
  },
  "t3_silver_acupoint_pin": {
    "nameTh": "เข็มเงินเดินลมปราณ",
    "primary": "#c7b884",
    "accent": "#ede7d0",
    "shapeId": 31
  },
  "t3_bellows_flame_jet": {
    "nameTh": "เปลวไฟสูบลมเตาหลอม",
    "primary": "#cf8e6e",
    "accent": "#f0d5c8",
    "shapeId": 32
  },
  "t3_wood_puppet_joint": {
    "nameTh": "กลไกข้อต่อหุ่นไม้",
    "primary": "#b09e8c",
    "accent": "#e1d9d2",
    "shapeId": 33
  },
  "t3_crossbow_bolt_snap": {
    "nameTh": "ศรกลไกดีดสังหาร",
    "primary": "#98a8b8",
    "accent": "#d8dee6",
    "shapeId": 34
  },
  "t3_paper_talisman_seal": {
    "nameTh": "ยันต์กระดาษเหลืองผนึกมาร",
    "primary": "#c7b57c",
    "accent": "#ede5cc",
    "shapeId": 35
  },
  "t3_array_compass_ring": {
    "nameTh": "วงแหวนจานค่ายกล",
    "primary": "#98b09e",
    "accent": "#d8e3db",
    "shapeId": 36
  },
  "t3_shield_phalanx_lock": {
    "nameTh": "ค่ายกลโล่ประสาน",
    "primary": "#aba08e",
    "accent": "#e0dbd4",
    "shapeId": 37
  },
  "t3_karma_bead_toss": {
    "nameTh": "ลูกประคำวิบากกรรม",
    "primary": "#b396bd",
    "accent": "#e3d7e6",
    "shapeId": 38
  },
  "t3_star_chart_line": {
    "nameTh": "เส้นดาราพยากรณ์ทิศ",
    "primary": "#96a8cc",
    "accent": "#d8dff0",
    "shapeId": 39
  },
  "t3_void_blink_trace": {
    "nameTh": "รอยพริบตาเร้นว่างเปล่า",
    "primary": "#9a8cb8",
    "accent": "#dbd5e6",
    "shapeId": 40
  },
  "t3_iai_sheath_glint": {
    "nameTh": "ประกายฝักดาบอิไอ",
    "primary": "#c77e86",
    "accent": "#edd0d3",
    "shapeId": 41
  },
  "t3_ninpo_caltrop_scatter": {
    "nameTh": "ขวากเหล็กนินจาเร้นเงา",
    "primary": "#8a9ca8",
    "accent": "#d6dde2",
    "shapeId": 42
  },
  "t3_passive_grand_dao_glyph": {
    "nameTh": "ตราวิถีติดตัวมรรคา",
    "primary": "#b8ad86",
    "accent": "#e6e1d0",
    "shapeId": 43
  }
};
  SK.T3_GROUP_FAMILIES = Object.assign({}, SK.T3_VFX_CATALOG, SK.T3_EXT_VFX_CATALOG);
  SK.TECH_TO_T3_GROUP_VFX = {
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
  "TECH_V222_09": "frost_harmony",
  "ART190_XIAN_016": "t3_pine_wind_sword",
  "ART190_XIAN_024": "t3_thunder_spark_spear",
  "ART190_XIAN_025": "t3_flame_wave_saber",
  "ART190_XIAN_036": "t3_jade_lotus_guard",
  "ART190_XIAN_044": "t3_crane_feather_step",
  "ART190_XIAN_045": "t3_star_dot_finger",
  "ART190_XIAN_046": "t3_iron_ox_shoulder",
  "ART190_XIAN_054": "t3_bronze_fist_shock",
  "ART190_XIAN_055": "t3_blood_vein_burst",
  "ART190_XIAN_064": "t3_stone_wall_stance",
  "ART190_BODY_015": "t3_tiger_claw_tear",
  "ART190_BODY_016": "t3_whirlwind_kick",
  "ART190_BODY_024": "t3_sun_ray_halberd",
  "ART190_BODY_025": "t3_moonlight_arrow",
  "ART190_BODY_035": "t3_war_chant_banner",
  "ART190_BODY_044": "t3_mercy_dew_drop",
  "ART190_BODY_045": "t3_totem_horn_blast",
  "ART190_BODY_046": "t3_sea_foam_slash",
  "ART190_BODY_054": "t3_shadow_fang_dagger",
  "ART190_BODY_055": "t3_scorpion_tail_whip",
  "ART190_BODY_064": "t3_blood_mist_shroud",
  "ART190_GOD_004": "t3_ghost_fire_wisp",
  "ART190_GOD_005": "t3_corpse_iron_nail",
  "ART190_GOD_024": "t3_mind_ripple_chime",
  "ART190_GOD_035": "t3_scholar_brush_hook",
  "ART190_GOD_036": "t3_dream_moth_dust",
  "ART190_GOD_044": "t3_zen_wood_fish",
  "ART190_GOD_045": "t3_pack_wolf_howl",
  "ART190_GOD_046": "t3_venom_centipede_bite",
  "ART190_GOD_054": "t3_falcon_dive_talon",
  "ART190_GOD_055": "t3_herb_mortar_mist",
  "ART190_GOD_064": "t3_silver_acupoint_pin",
  "ART_C117_INNATE_VENOM_GU_SOVEREIGN": "t3_bellows_flame_jet",
  "ART_C117_INNATE_CALLIGRAPHY_PAINTING_SAGE": "t3_wood_puppet_joint",
  "ART_C117_INNATE_DREAM_ILLUSION_WEAVER": "t3_crossbow_bolt_snap",
  "ART_V112_SOUL_MIND_BLADE_FLASH_T3": "t3_paper_talisman_seal",
  "MP_SPEAR_VAULT_STEP_T3": "t3_array_compass_ring",
  "MP_SPEAR_VOID_LANCE_T3": "t3_shield_phalanx_lock",
  "MP_STAFF_SOLAR_ANVIL_T3": "t3_karma_bead_toss",
  "MP_BOW_ZITHER_CHORD_T3": "t3_star_chart_line",
  "MP_BLADE_PARRY_STANCE_T3": "t3_void_blink_trace",
  "MP_FOCUS_SOUL_BELL_T3": "t3_iai_sheath_glint",
  "MP_SWORD_SHADOWLESS_SWIFT_T3": "t3_ninpo_caltrop_scatter",
  "MP_HYB_SWORD_BLADE_DUAL_T3": "t3_passive_grand_dao_glyph",
  "MP_AGNOSTIC_BATTLE_CRY_T3": "t3_blood_mist_shroud",
  "ART_MECH_PUPPET_004": "t3_ghost_fire_wisp",
  "ART_MECH_PUPPET_007": "t3_corpse_iron_nail",
  "ART_KARMA_SAMSARA_004": "t3_mind_ripple_chime",
  "ART_KARMA_SAMSARA_006": "t3_scholar_brush_hook",
  "ART_BEAST_SOV_003": "t3_dream_moth_dust",
  "ART_BEAST_SOV_004": "t3_zen_wood_fish",
  "ART_BEAST_SOV_006": "t3_pack_wolf_howl",
  "ART_BEAST_SOV_008": "t3_venom_centipede_bite",
  "ART_SAGE_SUP_008": "t3_falcon_dive_talon",
  "ART_CROSS_V208_001": "t3_herb_mortar_mist",
  "ART_CROSS_V208_003": "t3_silver_acupoint_pin",
  "ART_CROSS_V208_006": "t3_bellows_flame_jet",
  "ART_CROSS_V208_008": "t3_wood_puppet_joint",
  "ART_CROSS_V208_010": "t3_crossbow_bolt_snap",
  "ART_V212_BODY_THUNDER_T3": "t3_paper_talisman_seal",
  "ART_V212_GOD_JUDGE_T3": "t3_array_compass_ring",
  "ART_V212_GOD_SUN_BOW_T3": "t3_shield_phalanx_lock",
  "ART_CRAFT_006": "t3_karma_bead_toss",
  "ART_CROSS_CRAFT_002": "t3_star_chart_line",
  "TECH_V215_ZITHER_ACT_03": "t3_void_blink_trace",
  "TECH_V215_BRUSH_ACT_03": "t3_iai_sheath_glint",
  "TECH_V215_WHIP_ACT_03": "t3_ninpo_caltrop_scatter",
  "TECH_V222_01": "t3_passive_grand_dao_glyph",
  "TECH_V222_06": "violet_point",
  "TECH_V222_11": "moon_pool",
  "TECH_V222_15": "layered_mist",
  "TECH_V234_XIAN_ACT_02": "autumn_blades",
  "TECH_V234_XIAN_ACT_08": "solar_knuckle",
  "TECH_V234_XIAN_SUP_01": "frost_rake",
  "TECH_V234_BODY_ACT_02": "thorn_guard",
  "TECH_V234_BODY_ACT_08": "faith_lamella",
  "TECH_V234_BODY_SUP_01": "curse_eye",
  "TECH_V234_GOD_ACT_02": "thread_shear",
  "TECH_V234_GOD_ACT_08": "shadow_stiletto",
  "TECH_V234_GOD_SUP_01": "bone_ribs",
  "TECH_V234_DEMON_ACT_02": "blood_furnace",
  "TECH_V234_DEMON_ACT_08": "cloud_bodkin",
  "TECH_V234_DEMON_SUP_01": "iron_breach",
  "TECH_V234_HEART_SOUL_ACT_02": "gravity_staff",
  "TECH_V234_HEART_SOUL_ACT_08": "cross_execution",
  "TECH_V234_HEART_SOUL_SUP_01": "abacus_grid",
  "TECH_V234_MECH_PUPPET_ACT_02": "baji_impact",
  "TECH_V234_MECH_PUPPET_ACT_08": "blade_disc",
  "TECH_V234_MECH_PUPPET_SUP_01": "karma_links",
  "TECH_V234_KARMA_SAMSARA_ACT_02": "healing_chime",
  "TECH_V234_KARMA_SAMSARA_ACT_08": "zither_breeze",
  "TECH_V234_KARMA_SAMSARA_SUP_01": "frost_harmony",
  "TECH_V234_BEAST_SOVEREIGN_ACT_02": "t3_pine_wind_sword",
  "TECH_V234_BEAST_SOVEREIGN_ACT_08": "t3_thunder_spark_spear",
  "TECH_V234_BEAST_SOVEREIGN_SUP_01": "t3_flame_wave_saber",
  "TECH_V234_SAGE_SUPPORT_ACT_02": "t3_jade_lotus_guard",
  "TECH_V234_SAGE_SUPPORT_ACT_08": "t3_crane_feather_step",
  "TECH_V234_SAGE_SUPPORT_SUP_01": "t3_star_dot_finger",
  "TECH_V234_CRAFT_CREATION_ACT_02": "t3_iron_ox_shoulder",
  "TECH_V234_CRAFT_CREATION_ACT_08": "t3_bronze_fist_shock",
  "TECH_V234_CRAFT_CREATION_SUP_01": "t3_blood_vein_burst",
  "TECH_V234_ARRAY_TALISMAN_ACT_02": "t3_stone_wall_stance",
  "TECH_V234_ARRAY_TALISMAN_ACT_08": "t3_tiger_claw_tear",
  "TECH_V234_ARRAY_TALISMAN_SUP_01": "t3_whirlwind_kick",
  "TECH_V234_STRATEGY_GOVERNANCE_ACT_02": "t3_sun_ray_halberd",
  "TECH_V234_STRATEGY_GOVERNANCE_ACT_08": "t3_moonlight_arrow",
  "TECH_V234_STRATEGY_GOVERNANCE_SUP_01": "t3_war_chant_banner",
  "TECH_V200_ASTRO_DIVINATION_ACT_02": "t3_mercy_dew_drop",
  "TECH_V200_BUDDHA_DHARMA_ACT_02": "t3_totem_horn_blast",
  "TECH_V200_VOID_SPACE_ACT_02": "t3_sea_foam_slash",
  "TECH_V200_SONIC_HARMONY_ACT_02": "t3_shadow_fang_dagger",
  "TECH_V200_VENOM_GU_ACT_02": "t3_scorpion_tail_whip",
  "TECH_V200_PRIMORDIAL_SHIFTER_ACT_02": "t3_blood_mist_shroud",
  "TECH_V200_CELESTIAL_WEATHER_ACT_02": "t3_ghost_fire_wisp",
  "TECH_V200_WANDERING_DAO_ACT_02": "t3_corpse_iron_nail",
  "TECH_V200_MERCANTILE_DAO_ACT_02": "t3_mind_ripple_chime",
  "TECH_V200_DRAGON_VEIN_GEOMANCY_ACT_02": "t3_scholar_brush_hook",
  "TECH_V200_GRAVITY_DAO_ACT_02": "t3_dream_moth_dust",
  "TECH_V200_CHRONO_EPOCH_ACT_02": "t3_zen_wood_fish",
  "TECH_V200_INK_LITERATI_ACT_02": "t3_pack_wolf_howl",
  "TECH_V200_SOUL_PUPPETRY_ACT_02": "t3_venom_centipede_bite",
  "TECH_V200_PRIMORDIAL_CHAOS_ACT_02": "t3_falcon_dive_talon",
  "TECH_V200_SHADOW_SAMURAI_ACT_02": "t3_herb_mortar_mist",
  "TECH_V200_NINPO_SHADOW_ACT_02": "t3_silver_acupoint_pin",
  "TECH_V200_NINPO_ELEMENTAL_ACT_02": "t3_bellows_flame_jet",
  "TECH_V200_DIVINE_SUMMONER_ACT_02": "t3_wood_puppet_joint",
  "TECH_V200_DIVINE_POSSESSION_ACT_02": "t3_crossbow_bolt_snap",
  "TECH_V200_DIVINE_CHANNELER_ACT_02": "t3_paper_talisman_seal",
  "TECH_V200_VOID_HERETIC_PACT_ACT_02": "t3_array_compass_ring",
  "TECH_V200_OCCULT_MAGE_ACT_02": "t3_shield_phalanx_lock",
  "TECH_V200_DEVOURING_FLESH_ACT_02": "t3_karma_bead_toss",
  "TECH_V200_NETHER_GRAVE_ACT_02": "t3_star_chart_line",
  "TECH_V200_ANCESTRAL_RITUAL_ACT_02": "t3_void_blink_trace",
  "TECH_V200_TIDE_VOYAGER_ACT_02": "t3_iai_sheath_glint",
  "TECH_V200_LORE_ARCHIVIST_ACT_02": "t3_ninpo_caltrop_scatter",
  "TECH_V200_FORTUNE_GAMBLER_ACT_02": "t3_passive_grand_dao_glyph",
  "TECH_V200_SPIRIT_HUSBANDRY_ACT_02": "violet_point",
  "TECH_V200_ARENA_GLORY_ACT_02": "moon_pool",
  "TECH_UNI_V230_004": "layered_mist",
  "TECH_UNI_V230_005": "autumn_blades",
  "TECH_UNI_V230_006": "solar_knuckle",
  "TECH_V240_BRUSH_01": "frost_rake",
  "TECH_V240_ABACUS_01": "thorn_guard"
};
  SK.PASSIVE_TO_T3_GROUP_VFX = {
  "PASS_BOW_HAWK_EYE_T3": "cloud_bodkin",
  "PASS_IRON_SHIRT_T3": "faith_lamella",
  "PASS_BROKEN_RHYTHM_T3": "thread_shear",
  "PASS_MIRROR_HEART_T3": "curse_eye",
  "PASS_FOCUS_MERIDIAN_T3": "violet_point",
  "PASS_SWORD_INTENT_T3": "autumn_blades",
  "PASS_GHOST_SHADOW_STEP_T3": "shadow_stiletto",
  "PASS_POISON_BLOOD_AFFINITY_T3": "blood_furnace",
  "ART190_XIAN_006": "moon_pool",
  "ART190_XIAN_014": "layered_mist",
  "ART190_XIAN_026": "solar_knuckle",
  "ART190_XIAN_034": "frost_rake",
  "ART190_XIAN_056": "thorn_guard",
  "ART190_XIAN_065": "bone_ribs",
  "ART190_XIAN_066": "iron_breach",
  "ART190_BODY_006": "gravity_staff",
  "ART190_BODY_014": "cross_execution",
  "ART190_BODY_026": "abacus_grid",
  "ART190_BODY_034": "baji_impact",
  "ART190_BODY_056": "blade_disc",
  "ART190_BODY_065": "karma_links",
  "ART190_BODY_066": "healing_chime",
  "ART190_GOD_006": "zither_breeze",
  "ART190_GOD_014": "frost_harmony",
  "ART190_GOD_026": "t3_pine_wind_sword",
  "ART190_GOD_034": "t3_thunder_spark_spear",
  "ART190_GOD_056": "t3_flame_wave_saber",
  "ART190_GOD_065": "t3_jade_lotus_guard",
  "ART190_GOD_066": "t3_crane_feather_step",
  "PASS_SWORD_EDGE_T3": "t3_star_dot_finger",
  "PASS_BLADE_HEAVY_CLEAVE_T3": "t3_iron_ox_shoulder",
  "PASS_SPEAR_DRAGON_SPINE_T3": "t3_bronze_fist_shock",
  "PASS_HEAVY_ARMOR_MASTERY_T3": "t3_blood_vein_burst",
  "PASS_LIGHT_ARMOR_SHADOW_T3": "t3_stone_wall_stance",
  "PASS_DEEP_RESERVOIR_T3": "t3_tiger_claw_tear",
  "PASS_HAWK_EYE_T3": "t3_whirlwind_kick",
  "PASS_DESPERATE_FURY_T3": "t3_sun_ray_halberd",
  "PASS_SOUL_RESONANCE_WARD_T3": "t3_moonlight_arrow",
  "PASS_PILL_FIRE_HARMONY_T3": "t3_war_chant_banner",
  "PASS_ANVIL_SOUL_T3": "t3_mercy_dew_drop",
  "PASS_SPIRIT_BOTANY_T3": "t3_totem_horn_blast",
  "PASS_WILD_HUNTER_SENSE_T3": "t3_sea_foam_slash",
  "PASS_SAGE_CALLIGRAPHY_MIND_T3": "t3_shadow_fang_dagger",
  "PASS_STAFF_KINETIC_LEVER_T3": "t3_scorpion_tail_whip",
  "PASS_NON_ELEM_MARTIAL_HEART_T3": "t3_blood_mist_shroud",
  "ART_SAGE_SUP_009": "t3_ghost_fire_wisp",
  "ART_CROSS_V208_011": "t3_corpse_iron_nail",
  "PASS_CROSS_CRAFT_004": "t3_mind_ripple_chime",
  "TECH_V215_ZITHER_PAS_02": "t3_scholar_brush_hook",
  "TECH_V215_BRUSH_PAS_02": "t3_dream_moth_dust",
  "TECH_V215_WHIP_PAS_02": "t3_zen_wood_fish",
  "TECH_V234_XIAN_PAS_01": "t3_pack_wolf_howl",
  "TECH_V234_BODY_PAS_01": "t3_venom_centipede_bite",
  "TECH_V234_GOD_PAS_01": "t3_falcon_dive_talon",
  "TECH_V234_DEMON_PAS_01": "t3_herb_mortar_mist",
  "TECH_V234_HEART_SOUL_PAS_01": "t3_silver_acupoint_pin",
  "TECH_V234_MECH_PUPPET_PAS_01": "t3_bellows_flame_jet",
  "TECH_V234_KARMA_SAMSARA_PAS_01": "t3_wood_puppet_joint",
  "TECH_V234_BEAST_SOVEREIGN_PAS_01": "t3_crossbow_bolt_snap",
  "TECH_V234_SAGE_SUPPORT_PAS_01": "t3_paper_talisman_seal",
  "TECH_V234_CRAFT_CREATION_PAS_01": "t3_array_compass_ring",
  "TECH_V234_ARRAY_TALISMAN_PAS_01": "t3_shield_phalanx_lock",
  "TECH_V234_STRATEGY_GOVERNANCE_PAS_01": "t3_karma_bead_toss",
  "TECH_V200_ASTRO_DIVINATION_PAS_01": "t3_star_chart_line",
  "TECH_V200_BUDDHA_DHARMA_PAS_01": "t3_void_blink_trace",
  "TECH_V200_VOID_SPACE_PAS_01": "t3_iai_sheath_glint",
  "TECH_V200_SONIC_HARMONY_PAS_01": "t3_ninpo_caltrop_scatter",
  "TECH_V200_VENOM_GU_PAS_01": "t3_passive_grand_dao_glyph",
  "TECH_V200_PRIMORDIAL_SHIFTER_PAS_01": "t3_array_compass_ring",
  "TECH_V200_CELESTIAL_WEATHER_PAS_01": "t3_shield_phalanx_lock",
  "TECH_V200_WANDERING_DAO_PAS_01": "t3_karma_bead_toss",
  "TECH_V200_MERCANTILE_DAO_PAS_01": "t3_star_chart_line",
  "TECH_V200_DRAGON_VEIN_GEOMANCY_PAS_01": "t3_void_blink_trace",
  "TECH_V200_GRAVITY_DAO_PAS_01": "t3_iai_sheath_glint",
  "TECH_V200_CHRONO_EPOCH_PAS_01": "t3_ninpo_caltrop_scatter",
  "TECH_V200_INK_LITERATI_PAS_01": "t3_passive_grand_dao_glyph",
  "TECH_V200_SOUL_PUPPETRY_PAS_01": "violet_point",
  "TECH_V200_PRIMORDIAL_CHAOS_PAS_01": "moon_pool",
  "TECH_V200_SHADOW_SAMURAI_PAS_01": "layered_mist",
  "TECH_V200_NINPO_SHADOW_PAS_01": "autumn_blades",
  "TECH_V200_NINPO_ELEMENTAL_PAS_01": "solar_knuckle",
  "TECH_V200_DIVINE_SUMMONER_PAS_01": "frost_rake",
  "TECH_V200_DIVINE_POSSESSION_PAS_01": "thorn_guard",
  "TECH_V200_DIVINE_CHANNELER_PAS_01": "faith_lamella",
  "TECH_V200_VOID_HERETIC_PACT_PAS_01": "curse_eye",
  "TECH_V200_OCCULT_MAGE_PAS_01": "thread_shear",
  "TECH_V200_DEVOURING_FLESH_PAS_01": "shadow_stiletto",
  "TECH_V200_NETHER_GRAVE_PAS_01": "bone_ribs",
  "TECH_V200_ANCESTRAL_RITUAL_PAS_01": "blood_furnace",
  "TECH_V200_TIDE_VOYAGER_PAS_01": "cloud_bodkin",
  "TECH_V200_LORE_ARCHIVIST_PAS_01": "iron_breach",
  "TECH_V200_FORTUNE_GAMBLER_PAS_01": "gravity_staff",
  "TECH_V200_SPIRIT_HUSBANDRY_PAS_01": "cross_execution",
  "TECH_V200_ARENA_GLORY_PAS_01": "abacus_grid"
};
  SK.resolveT3GroupVfx = (techOrMove, moveOpt) => {
    if (!techOrMove) return null;
    const id = techOrMove.tech || techOrMove.id, tech = g.CULT && g.CULT.tech ? g.CULT.tech(id) : techOrMove;
    if (!tech || tech.tier !== 3 || tech.legendary || techOrMove.legendary || tech.fxKind || techOrMove.fxKind || (moveOpt && (moveOpt.fxKind || moveOpt.legendary || moveOpt.signatureVfx))) return null;
    const move = moveOpt && (tech.moveDefs || []).find(m => m.id === moveOpt.id);
    if (move && (move.fxKind || move.legendary || move.signatureVfx)) return null;
    return SK.TECH_TO_T3_GROUP_VFX[id] || null;
  };

  SK.T2_VFX_FAMILIES = {
  "t2_swift_sword_flick": {
    "nameTh": "สะบัดปลายกระบี่เร็ว",
    "primary": "#9cb8c4",
    "accent": "#dce6eb",
    "shapeId": 0
  },
  "t2_cloud_cut_saber": {
    "nameTh": "ดาบผ่าเมฆาบาง",
    "primary": "#a6b8c7",
    "accent": "#dfe6ed",
    "shapeId": 1
  },
  "t2_iron_spear_thrust": {
    "nameTh": "แทงทวนเหล็กกล้า",
    "primary": "#b0a89e",
    "accent": "#e1deda",
    "shapeId": 2
  },
  "t2_breeze_palm_push": {
    "nameTh": "ฝ่ามือผลักสายลม",
    "primary": "#9ac2ba",
    "accent": "#dcebe8",
    "shapeId": 3
  },
  "t2_willow_leaf_dart": {
    "nameTh": "ซัดใบหลิวเงิน",
    "primary": "#9ab89e",
    "accent": "#dbe6dd",
    "shapeId": 4
  },
  "t2_plum_blossom_step": {
    "nameTh": "ก้าวดอกเหมยร่วง",
    "primary": "#b8a3bd",
    "accent": "#e6dde8",
    "shapeId": 5
  },
  "t2_qi_barrier_ring": {
    "nameTh": "วงปราณคุ้มกายชั้นต้น",
    "primary": "#9ab8b5",
    "accent": "#dbe6e5",
    "shapeId": 6
  },
  "t2_lightning_finger_poke": {
    "nameTh": "ดัชนีประกายสายฟ้า",
    "primary": "#9eaad1",
    "accent": "#dedff0",
    "shapeId": 7
  },
  "t2_rock_breaker_punch": {
    "nameTh": "หมัดทลายศิลา",
    "primary": "#b89e86",
    "accent": "#e6dbd1",
    "shapeId": 8
  },
  "t2_iron_elbow_strike": {
    "nameTh": "ศอกเหล็กกระแทกใกล้",
    "primary": "#aba196",
    "accent": "#e0dcd7",
    "shapeId": 9
  },
  "t2_sweeping_leg_kick": {
    "nameTh": "เตะกวาดล่างสะท้านดิน",
    "primary": "#b39a82",
    "accent": "#e3d9cf",
    "shapeId": 10
  },
  "t2_copper_skin_brace": {
    "nameTh": "เกร็งผิวทองแดงรับคม",
    "primary": "#c2a67e",
    "accent": "#ebd9cc",
    "shapeId": 11
  },
  "t2_boiling_blood_jab": {
    "nameTh": "หมัดแย็บโลหิตอุ่น",
    "primary": "#c48286",
    "accent": "#ebd0d2",
    "shapeId": 12
  },
  "t2_tiger_stance_pounce": {
    "nameTh": "ท่าเสือตะปบเหยื่อ",
    "primary": "#bd967a",
    "accent": "#e8d8cc",
    "shapeId": 13
  },
  "t2_frost_breath_palm": {
    "nameTh": "ฝ่ามือไอเย็นต้นหนาว",
    "primary": "#98b4c9",
    "accent": "#d8e3ed",
    "shapeId": 14
  },
  "t2_heavy_shoulder_ram": {
    "nameTh": "ไหล่กระแทกทะลวงด่าน",
    "primary": "#b09a86",
    "accent": "#e1d8cf",
    "shapeId": 15
  },
  "t2_sunlight_spear_tip": {
    "nameTh": "ปลายหอกรับแสงตะวัน",
    "primary": "#c9b07a",
    "accent": "#ede2cc",
    "shapeId": 16
  },
  "t2_feather_arrow_shot": {
    "nameTh": "ยิงศรขนนกขาว",
    "primary": "#9eb8c9",
    "accent": "#dde7ed",
    "shapeId": 17
  },
  "t2_shrine_bell_ring": {
    "nameTh": "สั่นกระดิ่งศาลเจ้า",
    "primary": "#c7b484",
    "accent": "#ede5d0",
    "shapeId": 18
  },
  "t2_incense_prayer_wisp": {
    "nameTh": "ควันธูปอธิษฐาน",
    "primary": "#b8b096",
    "accent": "#e6e2d8",
    "shapeId": 19
  },
  "t2_golden_shield_glint": {
    "nameTh": "ประกายโล่ทองคุ้มภัย",
    "primary": "#c9b57c",
    "accent": "#ede5cc",
    "shapeId": 20
  },
  "t2_tidal_splash_strike": {
    "nameTh": "ฟาดเกลียวคลื่นน้ำ",
    "primary": "#8ab0c7",
    "accent": "#d6e5ed",
    "shapeId": 21
  },
  "t2_totem_claw_mark": {
    "nameTh": "รอยเล็บอสูรโทเท็ม",
    "primary": "#b8967c",
    "accent": "#e6d8cc",
    "shapeId": 22
  },
  "t2_thunder_drum_beat": {
    "nameTh": "ตีกลองสายฟ้าคำราม",
    "primary": "#9ea8cf",
    "accent": "#dedff0",
    "shapeId": 23
  },
  "t2_blood_thorn_stab": {
    "nameTh": "แทงหนามโลหิต",
    "primary": "#bf7c84",
    "accent": "#ebcfd2",
    "shapeId": 24
  },
  "t2_shadow_cloak_slip": {
    "nameTh": "เร้นกายใต้ผ้าคลุมเงา",
    "primary": "#9286a8",
    "accent": "#d9d4e2",
    "shapeId": 25
  },
  "t2_green_venom_needle": {
    "nameTh": "เข็มอาบพิษงูเขียว",
    "primary": "#98b57c",
    "accent": "#d8e3cc",
    "shapeId": 26
  },
  "t2_bone_claw_scratch": {
    "nameTh": "กานเล็บกระดูกขาว",
    "primary": "#aba3b0",
    "accent": "#e0dce3",
    "shapeId": 27
  },
  "t2_soul_leech_wisp": {
    "nameTh": "ไฟผีสูบขวัญ",
    "primary": "#8aa8a6",
    "accent": "#d6e2e1",
    "shapeId": 28
  },
  "t2_corpse_gas_puff": {
    "nameTh": "ไอพิษซากศพกระจาย",
    "primary": "#9c96a8",
    "accent": "#dedbe2",
    "shapeId": 29
  },
  "t2_zither_string_pluck": {
    "nameTh": "ดีดสายพิณสะท้านใจ",
    "primary": "#8eb5b2",
    "accent": "#d7e6e5",
    "shapeId": 30
  },
  "t2_ink_drop_flick": {
    "nameTh": "ดีดหยดหมึกดำ",
    "primary": "#92a39a",
    "accent": "#d9e0dc",
    "shapeId": 31
  },
  "t2_mirror_heart_reflect": {
    "nameTh": "กระจกใจสะท้อนเงา",
    "primary": "#a3adc2",
    "accent": "#dde1eb",
    "shapeId": 32
  },
  "t2_dream_fog_veil": {
    "nameTh": "ม่านหมอกฝันจาง",
    "primary": "#ad98bf",
    "accent": "#e1d8e8",
    "shapeId": 33
  },
  "t2_zen_chant_ripple": {
    "nameTh": "คลื่นเสียงสวดมนต์เซน",
    "primary": "#bfb288",
    "accent": "#ebe5d4",
    "shapeId": 34
  },
  "t2_flying_needle_thread": {
    "nameTh": "เข็มบินร้อยด้ายปราณ",
    "primary": "#9aaec2",
    "accent": "#dbe3eb",
    "shapeId": 35
  },
  "t2_wolf_fang_bite": {
    "nameTh": "เขี้ยวหมาป่าขบกัด",
    "primary": "#b89278",
    "accent": "#e6d7cc",
    "shapeId": 36
  },
  "t2_insect_wing_buzz": {
    "nameTh": "ปีกแมลงพิษกระพือ",
    "primary": "#98b278",
    "accent": "#d8e2cc",
    "shapeId": 37
  },
  "t2_bear_paw_slap": {
    "nameTh": "อุ้งตีนหมีตะปบ",
    "primary": "#b08e76",
    "accent": "#e1d3c9",
    "shapeId": 38
  },
  "t2_hawk_eye_lock": {
    "nameTh": "เนตรเหยี่ยวเล็งเป้า",
    "primary": "#96b0c4",
    "accent": "#d8e2eb",
    "shapeId": 39
  },
  "t2_green_herb_poultice": {
    "nameTh": "พอกสมุนไพรใบเขียว",
    "primary": "#8ab392",
    "accent": "#d6e6d9",
    "shapeId": 40
  },
  "t2_warm_meridian_press": {
    "nameTh": "กดจุดอุ่นเส้นชีพจร",
    "primary": "#c2b080",
    "accent": "#ebe3cf",
    "shapeId": 41
  },
  "t2_calm_spirit_tea": {
    "nameTh": "ไอชาสงบวิญญาณ",
    "primary": "#90b8a6",
    "accent": "#d7e6df",
    "shapeId": 42
  },
  "t2_hammer_anvil_tap": {
    "nameTh": "เคาะค้อนตีเหล็ก",
    "primary": "#c29270",
    "accent": "#ebd7c9",
    "shapeId": 43
  },
  "t2_charcoal_ember_blow": {
    "nameTh": "เป่าถ่านไฟแดง",
    "primary": "#c9886c",
    "accent": "#edd3c8",
    "shapeId": 44
  },
  "t2_copper_wire_pull": {
    "nameTh": "ดึงสายลวดทองแดง",
    "primary": "#a89688",
    "accent": "#e0d8d2",
    "shapeId": 45
  },
  "t2_wooden_gear_turn": {
    "nameTh": "หมุนเฟืองไม้กลไก",
    "primary": "#aba08c",
    "accent": "#e0dbd2",
    "shapeId": 46
  },
  "t2_bamboo_trap_spring": {
    "nameTh": "ดีดกับดักไม้ไผ่",
    "primary": "#9ab088",
    "accent": "#dbe3d4",
    "shapeId": 47
  },
  "t2_yellow_talisman_toss": {
    "nameTh": "ซัดยันต์เหลืองขั้นต้น",
    "primary": "#c2b07a",
    "accent": "#ebe3cc",
    "shapeId": 48
  },
  "t2_stone_marker_drop": {
    "nameTh": "ปักหลักหินค่ายกล",
    "primary": "#a69e92",
    "accent": "#dfdbd6",
    "shapeId": 49
  },
  "t2_squad_whistle_signal": {
    "nameTh": "สัญญาณนกหวีดจัดแถว",
    "primary": "#b8a67e",
    "accent": "#e6dece",
    "shapeId": 50
  },
  "t2_spear_line_brace": {
    "nameTh": "ตั้งแถวทวนรับศึก",
    "primary": "#aba296",
    "accent": "#e0dcd7",
    "shapeId": 51
  },
  "t2_abacus_bead_flick": {
    "nameTh": "ดีดเม็ดลูกคิดคำนวณ",
    "primary": "#c2ae78",
    "accent": "#ebe2cc",
    "shapeId": 52
  },
  "t2_karma_coin_flip": {
    "nameTh": "ดีดเหรียญเสี่ยงทายกรรม",
    "primary": "#b098ba",
    "accent": "#e1d7e6",
    "shapeId": 53
  },
  "t2_incense_ash_mark": {
    "nameTh": "รอยเถ้าธูปบอกลาง",
    "primary": "#a6a098",
    "accent": "#dfdcd8",
    "shapeId": 54
  },
  "t2_star_pointer_needle": {
    "nameTh": "เข็มชี้ดาวเหนือ",
    "primary": "#94a6c2",
    "accent": "#d8dfeb",
    "shapeId": 55
  },
  "t2_short_blink_step": {
    "nameTh": "ก้าวพริบตาระยะสั้น",
    "primary": "#988cb0",
    "accent": "#d8d3e3",
    "shapeId": 56
  },
  "t2_earth_pulse_tap": {
    "nameTh": "เคาะฟังชีพจรดิน",
    "primary": "#b0a084",
    "accent": "#e1dad0",
    "shapeId": 57
  },
  "t2_heavy_stone_palm": {
    "nameTh": "ฝ่ามือหินถ่วงน้ำหนัก",
    "primary": "#948ca8",
    "accent": "#d8d4e0",
    "shapeId": 58
  },
  "t2_quick_katana_draw": {
    "nameTh": "ชักดาบเร็วฟันฉับ",
    "primary": "#bf7c84",
    "accent": "#ebcfd2",
    "shapeId": 59
  },
  "t2_smoke_pellet_drop": {
    "nameTh": "ปาลูกควันพรางตัว",
    "primary": "#8a98a3",
    "accent": "#d6dce0",
    "shapeId": 60
  },
  "t2_hand_seal_spark": {
    "nameTh": "ประสานอินจุดประกายธาตุ",
    "primary": "#ba927e",
    "accent": "#e6d6ce",
    "shapeId": 61
  },
  "t2_spirit_medium_chime": {
    "nameTh": "สั่นกระดิ่งร่างทรง",
    "primary": "#c2ae82",
    "accent": "#ebe2d0",
    "shapeId": 62
  },
  "t2_qi_mantra_breath_ring": {
    "nameTh": "วงลมหายใจเดินปราณ",
    "primary": "#9ab5b0",
    "accent": "#dbe6e4",
    "shapeId": 63
  }
};
  SK.TECH_TO_T2_VFX = {
  "ART190_XIAN_003": "t2_swift_sword_flick",
  "ART190_XIAN_012": "t2_cloud_cut_saber",
  "ART190_XIAN_013": "t2_iron_spear_thrust",
  "ART190_XIAN_023": "t2_breeze_palm_push",
  "ART190_XIAN_032": "t2_willow_leaf_dart",
  "ART190_XIAN_033": "t2_plum_blossom_step",
  "ART190_XIAN_042": "t2_qi_barrier_ring",
  "ART190_XIAN_043": "t2_lightning_finger_poke",
  "ART190_XIAN_052": "t2_rock_breaker_punch",
  "ART190_XIAN_063": "t2_iron_elbow_strike",
  "ART190_BODY_003": "t2_sweeping_leg_kick",
  "ART190_BODY_012": "t2_copper_skin_brace",
  "ART190_BODY_013": "t2_boiling_blood_jab",
  "ART190_BODY_023": "t2_tiger_stance_pounce",
  "ART190_BODY_032": "t2_frost_breath_palm",
  "ART190_BODY_033": "t2_heavy_shoulder_ram",
  "ART190_BODY_042": "t2_sunlight_spear_tip",
  "ART190_BODY_043": "t2_feather_arrow_shot",
  "ART190_BODY_052": "t2_shrine_bell_ring",
  "ART190_BODY_063": "t2_incense_prayer_wisp",
  "ART190_GOD_003": "t2_golden_shield_glint",
  "ART190_GOD_012": "t2_tidal_splash_strike",
  "ART190_GOD_013": "t2_totem_claw_mark",
  "ART190_GOD_023": "t2_thunder_drum_beat",
  "ART190_GOD_032": "t2_blood_thorn_stab",
  "ART190_GOD_033": "t2_shadow_cloak_slip",
  "ART190_GOD_042": "t2_green_venom_needle",
  "ART190_GOD_043": "t2_bone_claw_scratch",
  "ART190_GOD_052": "t2_soul_leech_wisp",
  "ART190_GOD_063": "t2_corpse_gas_puff",
  "ART_V210_CHAIN_SHADOW_DAGGER": "t2_zither_string_pluck",
  "ART_V112_DEMON_FIVE_VENOM_PALM_T2": "t2_ink_drop_flick",
  "ART_DEMON_GHOST_STEP_T2": "t2_mirror_heart_reflect",
  "ART_DEMON_VORTEX_FIST_T2": "t2_dream_fog_veil",
  "ART_SOUL_MIRROR_COUNTER_T2": "t2_zen_chant_ripple",
  "ART_V112_SOUL_SPIRIT_INK_STROKE_T2": "t2_flying_needle_thread",
  "ART_V112_SOUL_BUTTERFLY_DREAM_STEP_T2": "t2_wolf_fang_bite",
  "ART_V210_CHAIN_VOID_LUTE": "t2_insect_wing_buzz",
  "ART_SOUL_TELEKINESIS_BLADE_T2": "t2_bear_paw_slap",
  "SRC110_NW_ART_047": "t2_hawk_eye_lock",
  "SRC110_NW_ART_126": "t2_green_herb_poultice",
  "SRC110_NW_ART_146": "t2_warm_meridian_press",
  "SRC110_ART_V112_XIAN_MOON_MIRROR_T3": "t2_calm_spirit_tea",
  "SRC110_ART_V112_BODY_IRONWOOD_BARK_T3": "t2_hammer_anvil_tap",
  "SRC110_ART_V112_GOD_LOTUS_SANCTUARY_T3": "t2_charcoal_ember_blow",
  "MP_BOW_RAIN": "t2_copper_wire_pull",
  "MP_STAFF_WALL": "t2_wooden_gear_turn",
  "MP_SPEAR_LINE": "t2_bamboo_trap_spring",
  "MP_BLADE_SHADOW": "t2_yellow_talisman_toss",
  "MP_FOCUS_SEAL": "t2_stone_marker_drop",
  "MP_SPEAR_HALBERD_SWEEP_T2": "t2_squad_whistle_signal",
  "MP_SPEAR_THUNDER_COIL_T2": "t2_spear_line_brace",
  "MP_SPEAR_BLOOD_IMPALE_T2": "t2_abacus_bead_flick",
  "MP_STAFF_IRON_REVOLVE_T2": "t2_karma_coin_flip",
  "MP_STAFF_POLE_VAULT_T2": "t2_incense_ash_mark",
  "MP_STAFF_GOLDEN_LIGHT_T2": "t2_star_pointer_needle",
  "MP_BOW_RAPID_VOLLEY_T2": "t2_short_blink_step",
  "MP_BOW_SUN_RAY_T2": "t2_earth_pulse_tap",
  "MP_BLADE_IRON_CLEAVER_T2": "t2_heavy_stone_palm",
  "MP_BLADE_FLAME_SABER_T2": "t2_quick_katana_draw",
  "MP_FOCUS_ACUPOINT_NEEDLE_T2": "t2_smoke_pellet_drop",
  "MP_SWORD_FLOWING_PARRY_T2": "t2_hand_seal_spark",
  "MP_FIST_JOINT_LOCK_CLAW_T2": "t2_spirit_medium_chime",
  "MP_HYB_SPEAR_BLADE_WAR_T2": "t2_qi_mantra_breath_ring",
  "MP_AGNOSTIC_BREATH_SHIELD_T2": "t2_swift_sword_flick",
  "ART_MECH_PUPPET_002": "t2_cloud_cut_saber",
  "ART_MECH_PUPPET_003": "t2_iron_spear_thrust",
  "ART_KARMA_SAMSARA_002": "t2_breeze_palm_push",
  "ART_KARMA_SAMSARA_003": "t2_willow_leaf_dart",
  "ART_BEAST_SOV_002": "t2_plum_blossom_step",
  "INNATE_GOLDEN_NEEDLE_PULSE": "t2_qi_barrier_ring",
  "INNATE_CELESTIAL_ZITHER_CHORD": "t2_lightning_finger_poke",
  "INNATE_DIVINE_NECTAR_DEW": "t2_rock_breaker_punch",
  "INNATE_QIMEN_TALISMAN_WARD": "t2_iron_elbow_strike",
  "INNATE_SOUL_LANTERN_GRACE": "t2_sweeping_leg_kick",
  "INNATE_WAR_BANNER_HYMN": "t2_copper_skin_brace",
  "INNATE_WOOD_SPIRIT_CANOPY": "t2_boiling_blood_jab",
  "ART_SAGE_SUP_001": "t2_tiger_stance_pounce",
  "ART_CROSS_V208_009": "t2_frost_breath_palm",
  "ART_V212_GOD_OCEAN_T2": "t2_heavy_shoulder_ram",
  "ART_V212_SAGE_SANCTUARY_T2": "t2_sunlight_spear_tip",
  "ART_CROSS_CRAFT_001": "t2_feather_arrow_shot",
  "TECH_V215_ZITHER_ACT_02": "t2_shrine_bell_ring",
  "TECH_V215_BRUSH_ACT_02": "t2_incense_prayer_wisp",
  "TECH_V215_WHIP_ACT_02": "t2_golden_shield_glint",
  "TECH_V234_XIAN_ACT_01": "t2_tidal_splash_strike",
  "TECH_V234_XIAN_ACT_07": "t2_totem_claw_mark",
  "TECH_V234_BODY_ACT_01": "t2_thunder_drum_beat",
  "TECH_V234_BODY_ACT_07": "t2_blood_thorn_stab",
  "TECH_V234_GOD_ACT_01": "t2_shadow_cloak_slip",
  "TECH_V234_GOD_ACT_07": "t2_green_venom_needle",
  "TECH_V234_DEMON_ACT_01": "t2_bone_claw_scratch",
  "TECH_V234_DEMON_ACT_07": "t2_soul_leech_wisp",
  "TECH_V234_HEART_SOUL_ACT_01": "t2_corpse_gas_puff",
  "TECH_V234_HEART_SOUL_ACT_07": "t2_zither_string_pluck",
  "TECH_V234_MECH_PUPPET_ACT_01": "t2_ink_drop_flick",
  "TECH_V234_MECH_PUPPET_ACT_07": "t2_mirror_heart_reflect",
  "TECH_V234_KARMA_SAMSARA_ACT_01": "t2_dream_fog_veil",
  "TECH_V234_KARMA_SAMSARA_ACT_07": "t2_zen_chant_ripple",
  "TECH_V234_BEAST_SOVEREIGN_ACT_01": "t2_flying_needle_thread",
  "TECH_V234_BEAST_SOVEREIGN_ACT_07": "t2_wolf_fang_bite",
  "TECH_V234_SAGE_SUPPORT_ACT_01": "t2_insect_wing_buzz",
  "TECH_V234_SAGE_SUPPORT_ACT_07": "t2_bear_paw_slap",
  "TECH_V234_CRAFT_CREATION_ACT_01": "t2_hawk_eye_lock",
  "TECH_V234_CRAFT_CREATION_ACT_07": "t2_green_herb_poultice",
  "TECH_V234_ARRAY_TALISMAN_ACT_01": "t2_warm_meridian_press",
  "TECH_V234_ARRAY_TALISMAN_ACT_07": "t2_calm_spirit_tea",
  "TECH_V234_STRATEGY_GOVERNANCE_ACT_01": "t2_hammer_anvil_tap",
  "TECH_V234_STRATEGY_GOVERNANCE_ACT_07": "t2_charcoal_ember_blow",
  "TECH_V200_ASTRO_DIVINATION_ACT_01": "t2_copper_wire_pull",
  "TECH_V200_BUDDHA_DHARMA_ACT_01": "t2_wooden_gear_turn",
  "TECH_V200_VOID_SPACE_ACT_01": "t2_bamboo_trap_spring",
  "TECH_V200_SONIC_HARMONY_ACT_01": "t2_yellow_talisman_toss",
  "TECH_V200_VENOM_GU_ACT_01": "t2_stone_marker_drop",
  "TECH_V200_PRIMORDIAL_SHIFTER_ACT_01": "t2_squad_whistle_signal",
  "TECH_V200_CELESTIAL_WEATHER_ACT_01": "t2_spear_line_brace",
  "TECH_V200_WANDERING_DAO_ACT_01": "t2_abacus_bead_flick",
  "TECH_V200_MERCANTILE_DAO_ACT_01": "t2_karma_coin_flip",
  "TECH_V200_DRAGON_VEIN_GEOMANCY_ACT_01": "t2_incense_ash_mark",
  "TECH_V200_GRAVITY_DAO_ACT_01": "t2_star_pointer_needle",
  "TECH_V200_CHRONO_EPOCH_ACT_01": "t2_short_blink_step",
  "TECH_V200_INK_LITERATI_ACT_01": "t2_earth_pulse_tap",
  "TECH_V200_SOUL_PUPPETRY_ACT_01": "t2_heavy_stone_palm",
  "TECH_V200_PRIMORDIAL_CHAOS_ACT_01": "t2_quick_katana_draw",
  "TECH_V200_SHADOW_SAMURAI_ACT_01": "t2_smoke_pellet_drop",
  "TECH_V200_NINPO_SHADOW_ACT_01": "t2_hand_seal_spark",
  "TECH_V200_NINPO_ELEMENTAL_ACT_01": "t2_spirit_medium_chime",
  "TECH_V200_DIVINE_SUMMONER_ACT_01": "t2_qi_mantra_breath_ring",
  "TECH_V200_DIVINE_POSSESSION_ACT_01": "t2_swift_sword_flick",
  "TECH_V200_DIVINE_CHANNELER_ACT_01": "t2_cloud_cut_saber",
  "TECH_V200_VOID_HERETIC_PACT_ACT_01": "t2_iron_spear_thrust",
  "TECH_V200_OCCULT_MAGE_ACT_01": "t2_breeze_palm_push",
  "TECH_V200_DEVOURING_FLESH_ACT_01": "t2_willow_leaf_dart",
  "TECH_V200_NETHER_GRAVE_ACT_01": "t2_plum_blossom_step",
  "TECH_V200_ANCESTRAL_RITUAL_ACT_01": "t2_qi_barrier_ring",
  "TECH_V200_TIDE_VOYAGER_ACT_01": "t2_lightning_finger_poke",
  "TECH_V200_LORE_ARCHIVIST_ACT_01": "t2_rock_breaker_punch",
  "TECH_V200_FORTUNE_GAMBLER_ACT_01": "t2_iron_elbow_strike",
  "TECH_V200_SPIRIT_HUSBANDRY_ACT_01": "t2_sweeping_leg_kick",
  "TECH_V200_ARENA_GLORY_ACT_01": "t2_copper_skin_brace",
  "TECH_UNI_V230_002": "t2_boiling_blood_jab",
  "TECH_UNI_V230_003": "t2_tiger_stance_pounce",
  "TECH_UNI_V230_013": "t2_frost_breath_palm",
  "TECH_UNI_V230_016": "t2_heavy_shoulder_ram",
  "TECH_UNI_V230_019": "t2_sunlight_spear_tip",
  "TECH_UNI_V230_022": "t2_feather_arrow_shot",
  "TECH_UNI_V230_025": "t2_shrine_bell_ring",
  "TECH_UNI_V230_028": "t2_incense_prayer_wisp"
};
  SK.PASSIVE_TO_T2_VFX = {
  "ART190_XIAN_002": "t2_swift_sword_flick",
  "ART190_XIAN_022": "t2_cloud_cut_saber",
  "ART190_XIAN_053": "t2_iron_spear_thrust",
  "ART190_XIAN_062": "t2_breeze_palm_push",
  "ART190_XIAN_072": "t2_willow_leaf_dart",
  "ART190_BODY_002": "t2_plum_blossom_step",
  "ART190_BODY_022": "t2_qi_barrier_ring",
  "ART190_BODY_053": "t2_lightning_finger_poke",
  "ART190_BODY_062": "t2_rock_breaker_punch",
  "ART190_BODY_072": "t2_iron_elbow_strike",
  "ART190_GOD_002": "t2_sweeping_leg_kick",
  "ART190_GOD_022": "t2_copper_skin_brace",
  "ART190_GOD_053": "t2_boiling_blood_jab",
  "ART190_GOD_062": "t2_tiger_stance_pounce",
  "ART190_GOD_072": "t2_frost_breath_palm",
  "MP_BOW_FOCUS": "t2_heavy_shoulder_ram",
  "MP_STAFF_ROOT": "t2_sunlight_spear_tip",
  "MP_SWORD_POISE": "t2_feather_arrow_shot",
  "MP_FIST_BREATH": "t2_shrine_bell_ring",
  "MP_ROBE_WARD": "t2_incense_prayer_wisp",
  "PASS_ROOTED_STANCE_T2": "t2_golden_shield_glint",
  "PASS_SOFT_FORCE_T2": "t2_tidal_splash_strike",
  "PASS_LASTING_BREATH_T2": "t2_totem_claw_mark",
  "PASS_CAREFUL_CIRCULATION_T2": "t2_thunder_drum_beat",
  "PASS_RETURNING_BREATH_T2": "t2_blood_thorn_stab",
  "PASS_MERIDIAN_DISCIPLINE_T2": "t2_shadow_cloak_slip",
  "PASS_READING_OPENINGS_T2": "t2_green_venom_needle",
  "PASS_SWIFT_RECOVERY_T2": "t2_bone_claw_scratch",
  "PASS_CALM_UNDER_PRESSURE_T2": "t2_soul_leech_wisp",
  "PASS_FIRST_STRIKE_MOMENTUM_T2": "t2_corpse_gas_puff",
  "PASS_ARRAY_GEOMANCY_T2": "t2_zither_string_pluck",
  "PASS_MERCHANT_LEDGER_MIND_T2": "t2_ink_drop_flick",
  "PASS_V212_ADAPTIVE_ARSENAL_T2": "t2_mirror_heart_reflect",
  "PASS_CRAFT_001": "t2_dream_fog_veil",
  "PASS_V214_EARTH_VEIN_WARDEN": "t2_zen_chant_ripple",
  "PASS_V214_SEAL_SCRIPT_EXORCIST": "t2_flying_needle_thread",
  "PASS_V214_THUNDER_TALISMAN_ADEPT": "t2_wolf_fang_bite",
  "PASS_V214_MIRAGE_ARRAY_WEAVER": "t2_insect_wing_buzz",
  "PASS_V214_BATTLEFIELD_STRATEGIST": "t2_bear_paw_slap",
  "PASS_V214_SECT_STEWARD": "t2_hawk_eye_lock",
  "PASS_V214_DIPLOMATIC_ENVOY": "t2_green_herb_poultice",
  "PASS_V214_CARAVAN_QUARTERMASTER": "t2_warm_meridian_press",
  "PASS_V214_CIVIL_TEACHING_MENTOR": "t2_calm_spirit_tea",
  "PASS_V214_SPIRIT_FEAST_HEALER": "t2_hammer_anvil_tap",
  "PASS_V214_JADE_MEAL_PREPARER": "t2_charcoal_ember_blow",
  "PASS_V214_CELESTIAL_ARMOR_ARTISAN": "t2_copper_wire_pull",
  "TECH_V234_XIAN_AUX_01": "t2_wooden_gear_turn",
  "TECH_V234_BODY_AUX_01": "t2_bamboo_trap_spring",
  "TECH_V234_GOD_AUX_01": "t2_yellow_talisman_toss",
  "TECH_V234_DEMON_AUX_01": "t2_stone_marker_drop",
  "TECH_V234_HEART_SOUL_AUX_01": "t2_squad_whistle_signal",
  "TECH_V234_MECH_PUPPET_AUX_01": "t2_spear_line_brace",
  "TECH_V234_KARMA_SAMSARA_AUX_01": "t2_abacus_bead_flick",
  "TECH_V234_BEAST_SOVEREIGN_AUX_01": "t2_karma_coin_flip",
  "TECH_V234_SAGE_SUPPORT_AUX_01": "t2_incense_ash_mark",
  "TECH_V234_CRAFT_CREATION_AUX_01": "t2_star_pointer_needle",
  "TECH_V234_ARRAY_TALISMAN_AUX_01": "t2_short_blink_step",
  "TECH_V234_STRATEGY_GOVERNANCE_AUX_01": "t2_earth_pulse_tap",
  "MANTRA_V200_ASTRO_DIVINATION_01": "t2_heavy_stone_palm",
  "MANTRA_V200_BUDDHA_DHARMA_01": "t2_quick_katana_draw",
  "MANTRA_V200_VOID_SPACE_01": "t2_smoke_pellet_drop",
  "MANTRA_V200_SONIC_HARMONY_01": "t2_hand_seal_spark",
  "MANTRA_V200_VENOM_GU_01": "t2_spirit_medium_chime",
  "MANTRA_V200_PRIMORDIAL_SHIFTER_01": "t2_qi_mantra_breath_ring",
  "MANTRA_V200_CELESTIAL_WEATHER_01": "t2_swift_sword_flick",
  "MANTRA_V200_WANDERING_DAO_01": "t2_cloud_cut_saber",
  "MANTRA_V200_MERCANTILE_DAO_01": "t2_iron_spear_thrust",
  "MANTRA_V200_DRAGON_VEIN_GEOMANCY_01": "t2_breeze_palm_push",
  "MANTRA_V200_GRAVITY_DAO_01": "t2_willow_leaf_dart",
  "MANTRA_V200_CHRONO_EPOCH_01": "t2_plum_blossom_step",
  "MANTRA_V200_INK_LITERATI_01": "t2_qi_barrier_ring",
  "MANTRA_V200_SOUL_PUPPETRY_01": "t2_lightning_finger_poke",
  "MANTRA_V200_PRIMORDIAL_CHAOS_01": "t2_rock_breaker_punch",
  "MANTRA_V200_SHADOW_SAMURAI_01": "t2_iron_elbow_strike",
  "MANTRA_V200_NINPO_SHADOW_01": "t2_sweeping_leg_kick",
  "MANTRA_V200_NINPO_ELEMENTAL_01": "t2_copper_skin_brace",
  "MANTRA_V200_DIVINE_SUMMONER_01": "t2_boiling_blood_jab",
  "MANTRA_V200_DIVINE_POSSESSION_01": "t2_tiger_stance_pounce",
  "MANTRA_V200_DIVINE_CHANNELER_01": "t2_frost_breath_palm",
  "MANTRA_V200_VOID_HERETIC_PACT_01": "t2_heavy_shoulder_ram",
  "MANTRA_V200_OCCULT_MAGE_01": "t2_sunlight_spear_tip",
  "MANTRA_V200_DEVOURING_FLESH_01": "t2_feather_arrow_shot",
  "MANTRA_V200_NETHER_GRAVE_01": "t2_shrine_bell_ring",
  "MANTRA_V200_ANCESTRAL_RITUAL_01": "t2_incense_prayer_wisp",
  "MANTRA_V200_TIDE_VOYAGER_01": "t2_golden_shield_glint",
  "MANTRA_V200_LORE_ARCHIVIST_01": "t2_tidal_splash_strike",
  "MANTRA_V200_FORTUNE_GAMBLER_01": "t2_totem_claw_mark",
  "MANTRA_V200_SPIRIT_HUSBANDRY_01": "t2_thunder_drum_beat",
  "MANTRA_V200_ARENA_GLORY_01": "t2_blood_thorn_stab"
};
  SK.resolveT2Vfx = (techOrMove, moveOpt) => {
    if (!techOrMove) return null;
    const id = techOrMove.tech || techOrMove.id, tech = g.CULT && g.CULT.tech ? g.CULT.tech(id) : techOrMove;
    if (!tech || tech.tier !== 2 || tech.legendary || techOrMove.legendary || tech.fxKind || techOrMove.fxKind || (moveOpt && (moveOpt.fxKind || moveOpt.legendary || moveOpt.signatureVfx))) return null;
    const move = moveOpt && (tech.moveDefs || []).find(m => m.id === moveOpt.id);
    if (move && (move.fxKind || move.legendary || move.signatureVfx)) return null;
    return SK.TECH_TO_T2_VFX[id] || null;
  };

  SK.T1_EXT_VFX_CATALOG = {
  "t1_wooden_sword_slash": {
    "nameTh": "ฟันกระบี่ไม้ฝึกหัด",
    "primary": "#9cb2bd",
    "shapeId": 0
  },
  "t1_basic_saber_chop": {
    "nameTh": "ฟันดาบพื้นฐาน",
    "primary": "#a6aeb8",
    "shapeId": 1
  },
  "t1_bamboo_spear_poke": {
    "nameTh": "แทงทวนไม้ไผ่",
    "primary": "#a8a898",
    "shapeId": 2
  },
  "t1_open_palm_thrust": {
    "nameTh": "ผลักฝ่ามือพื้นฐาน",
    "primary": "#98b5ae",
    "shapeId": 3
  },
  "t1_pebble_flick": {
    "nameTh": "ดีดก้อนกรวดสกัด",
    "primary": "#a6a298",
    "shapeId": 4
  },
  "t1_light_foot_hop": {
    "nameTh": "ก้าวเท้าเบาว่องไว",
    "primary": "#9ab5bd",
    "shapeId": 5
  },
  "t1_basic_qi_guard": {
    "nameTh": "เดินปราณคุ้มกายพื้นฐาน",
    "primary": "#9ab2a8",
    "shapeId": 6
  },
  "t1_two_finger_jab": {
    "nameTh": "ดัชนีคู่จี้จุด",
    "primary": "#9ea6bd",
    "shapeId": 7
  },
  "t1_iron_knuckle_punch": {
    "nameTh": "หมัดตรงเหล็กสกัด",
    "primary": "#b09a86",
    "shapeId": 8
  },
  "t1_low_sweep_kick": {
    "nameTh": "เตะกวาดข้อเท้า",
    "primary": "#aba08e",
    "shapeId": 9
  },
  "t1_horse_stance_brace": {
    "nameTh": "ตั้งท่าม้ามั่นคง",
    "primary": "#b3a288",
    "shapeId": 10
  },
  "t1_forearm_block": {
    "nameTh": "ยกแขนปัดป้อง",
    "primary": "#a89e92",
    "shapeId": 11
  },
  "t1_warm_blood_breath": {
    "nameTh": "สูดลมหายใจกระตุ้นเลือด",
    "primary": "#ba8286",
    "shapeId": 12
  },
  "t1_wild_claw_swipe": {
    "nameTh": "ตวัดกรงเล็บสัตว์ป่า",
    "primary": "#b5927a",
    "shapeId": 13
  },
  "t1_shrine_candle_spark": {
    "nameTh": "ประกายเทียนบูชา",
    "primary": "#c2ae7e",
    "shapeId": 14
  },
  "t1_bamboo_bow_shot": {
    "nameTh": "ยิงธนูไม้ไผ่",
    "primary": "#9ab0bd",
    "shapeId": 15
  },
  "t1_prayer_bead_tap": {
    "nameTh": "คลึงลูกประคำไม้",
    "primary": "#b8a882",
    "shapeId": 16
  },
  "t1_water_splash_palm": {
    "nameTh": "ฝ่ามือวักน้ำ",
    "primary": "#8aa8bd",
    "shapeId": 17
  },
  "t1_shadow_sneak_step": {
    "nameTh": "ย่องเบาในเงามืด",
    "primary": "#9086a3",
    "shapeId": 18
  },
  "t1_poison_thorn_prick": {
    "nameTh": "หนามพิษตำผิว",
    "primary": "#96ad7a",
    "shapeId": 19
  },
  "t1_ghost_whisper_puff": {
    "nameTh": "ลมหายใจภูตผี",
    "primary": "#8aa3a1",
    "shapeId": 20
  },
  "t1_flute_note_puff": {
    "nameTh": "เป่าขลุ่ยไม้ไผ่",
    "primary": "#8eb0ad",
    "shapeId": 21
  },
  "t1_charcoal_brush_stroke": {
    "nameTh": "ขีดเส้นถ่านดำ",
    "primary": "#929e98",
    "shapeId": 22
  },
  "t1_calm_mind_sit": {
    "nameTh": "ตั้งสติสงบใจ",
    "primary": "#b5aa88",
    "shapeId": 23
  },
  "t1_hound_whistle_call": {
    "nameTh": "ผิวปากเรียกสุนัขล่าเนื้อ",
    "primary": "#b09278",
    "shapeId": 24
  },
  "t1_bug_jar_shake": {
    "nameTh": "เขย่าโหลแมลงพิษ",
    "primary": "#96ab78",
    "shapeId": 25
  },
  "t1_herb_leaf_crush": {
    "nameTh": "ขยี้ใบสมุนไพรสด",
    "primary": "#8aad90",
    "shapeId": 26
  },
  "t1_iron_tongs_grip": {
    "nameTh": "คีบเหล็กออกจากเตา",
    "primary": "#b88e70",
    "shapeId": 27
  },
  "t1_wood_cog_click": {
    "nameTh": "ขยับสลักไม้กลไก",
    "primary": "#a69888",
    "shapeId": 28
  },
  "t1_paper_charm_stick": {
    "nameTh": "แปะยันต์กระดาษ",
    "primary": "#baa878",
    "shapeId": 29
  },
  "t1_flag_wave_signal": {
    "nameTh": "โบกธงสัญญาณหมู่",
    "primary": "#b59e7a",
    "shapeId": 30
  },
  "t1_coin_string_jingle": {
    "nameTh": "สั่นพวงเหรียญทองแดง",
    "primary": "#bda876",
    "shapeId": 31
  },
  "t1_compass_needle_spin": {
    "nameTh": "เข็มทิศหมุนหาทิศ",
    "primary": "#92a2b8",
    "shapeId": 32
  },
  "t1_innate_seed_spark": {
    "nameTh": "ประกายเมล็ดพันธุ์สายย่อย",
    "primary": "#9eb8c7",
    "shapeId": 33
  }
};
  SK.T1_VFX_FAMILIES = Object.assign({}, SK.COMMON_VFX_CATALOG, SK.T1_EXT_VFX_CATALOG);
  SK.TECH_TO_T1_VFX = {
  "MP_BASE_XIAN": "qi_palm",
  "MP_BASE_BODY": "stone_fist",
  "ART190_BODY_001": "stone_fist",
  "MP_BASE_GOD": "heart_ward",
  "ART190_GOD_001": "heart_ward",
  "MP_BASE_DEMON": "blood_drop",
  "ART_DEMON_BLOOD_SIPHON_CLAW_T1": "blood_drop",
  "MP_BASE_HEART_SOUL": "mind_ripple",
  "ART_SOUL_ZEN_BELL_T1": "mind_ripple",
  "MP_BASE_BEAST_SOVEREIGN": "paw_signal",
  "MP_BASE_SAGE_SUPPORT": "heal_sprout",
  "ART190_GOD_031": "heal_sprout",
  "INNATE_ELIXIR_DAO_CAULDRON": "heal_sprout",
  "INNATE_MERCY_DEITY_LOTUS_GRACE": "heal_sprout",
  "ART190_XIAN_061": "qi_thread",
  "MP_BASE_CRAFT_CREATION": "forge_spark",
  "MP_BASE_MECH_PUPPET": "gear_tick",
  "ART190_XIAN_001": "sword_drizzle",
  "SRC110_NW_ART_002": "sword_drizzle",
  "ART190_XIAN_011": "thorn_whip",
  "MP_STAFF_VINE_SWEEP_T1": "thorn_whip",
  "ART190_XIAN_021": "silver_pin",
  "INNATE_YIN_YANG_TAIJI_WHEEL": "twin_balance",
  "ART190_BODY_031": "bronze_skin",
  "ART190_BODY_021": "frost_knuckle",
  "ART_DEMON_NETHER_PALM_T1": "frost_knuckle",
  "ART190_GOD_011": "thunder_tap",
  "ART_SOUL_INK_DOT_T1": "ink_bind",
  "ART_SOUL_MIST_DREAM_T1": "dream_haze",
  "ART_DEMON_VENOM_NEEDLE_T1": "poison_barb",
  "MP_BOW_VENOM_BARB_T1": "poison_barb",
  "ART_SOUL_MIND_NEEDLE_T1": "soul_needle",
  "MP_FIST_IRON_JAB_T1": "straight_jab",
  "MP_BLADE_SWIFT_DRAW_T1": "draw_cut",
  "ART_DEMON_SHADOW_STRIKE_T1": "draw_cut",
  "MP_BOW_BASIC": "arrow_fletch",
  "MP_BOW_IRON_DRAW_T1": "arrow_fletch",
  "MP_STAFF_SWEEP_BASIC_T1": "staff_broom",
  "MP_SPEAR_MILITARY_DRILL_T1": "spear_point",
  "MP_SPEAR_WIND_THRUST_T1": "spear_point",
  "ART190_XIAN_031": "star_guard",
  "ART190_XIAN_041": "incense_wisp",
  "ART190_XIAN_051": "seal_knot",
  "ART190_BODY_011": "root_stance",
  "ART190_BODY_041": "t1_wooden_sword_slash",
  "ART190_BODY_051": "t1_basic_saber_chop",
  "ART190_BODY_061": "t1_bamboo_spear_poke",
  "ART190_GOD_021": "t1_open_palm_thrust",
  "ART190_GOD_041": "t1_pebble_flick",
  "ART190_GOD_051": "t1_light_foot_hop",
  "ART190_GOD_061": "t1_basic_qi_guard",
  "ART_V112_DEMON_NIGHT_CLOAK_T1": "t1_two_finger_jab",
  "SRC110_NW_ART_075": "t1_iron_knuckle_punch",
  "SRC110_NW_ART_083": "t1_low_sweep_kick",
  "MP_BASE_KARMA_SAMSARA": "t1_horse_stance_brace",
  "MP_FOCUS_IRON_FAN_T1": "t1_forearm_block",
  "INNATE_SWORD_IMMORTAL_HEART": "t1_warm_blood_breath",
  "INNATE_STAR_ARCHER_ASTRAL_LOCK": "t1_wild_claw_swipe",
  "INNATE_TIGER_SOVEREIGN_FEROCITY": "t1_shrine_candle_spark",
  "INNATE_VAJRA_BODHI_GOLDEN_BELL": "t1_bamboo_bow_shot",
  "INNATE_STAFF_GUARD_BASTION": "t1_prayer_bead_tap",
  "INNATE_WAR_DEITY_BANNER_SPEAR": "t1_water_splash_palm",
  "INNATE_SHADOW_ASSASSIN_NIGHT_VEIL": "t1_shadow_sneak_step",
  "INNATE_VENOM_GU_HEART_PARASITE": "t1_poison_thorn_prick",
  "INNATE_ZEN_VOID_HEART_MIRROR": "t1_ghost_whisper_puff",
  "INNATE_FIVE_ELEMENTS_CORE": "t1_flute_note_puff",
  "INNATE_ASTRAL_ARRAY_CORE": "t1_charcoal_brush_stroke",
  "INNATE_BLOOD_DEMON_CORE": "t1_calm_mind_sit",
  "INNATE_PHANTOM_SOUL_CORE": "t1_hound_whistle_call",
  "INNATE_TIME_VOID_CORE": "t1_bug_jar_shake",
  "INNATE_SOUND_ZITHER_CORE": "t1_herb_leaf_crush",
  "INNATE_FROST_MOON_IMMORTAL_CORE": "t1_iron_tongs_grip",
  "INNATE_BLOOD_DRAGON_CORE": "t1_wood_cog_click",
  "INNATE_DEVOURING_FIEND_CORE": "t1_paper_charm_stick",
  "INNATE_SOLAR_FORGE_CORE": "t1_flag_wave_signal",
  "INNATE_THUNDER_BODY_CORE": "t1_coin_string_jingle",
  "INNATE_JADE_IMMORTAL_BODY_CORE": "t1_compass_needle_spin",
  "INNATE_TITAN_MOUNTAIN_BODY_CORE": "t1_innate_seed_spark",
  "INNATE_WOOD_SPRING_BODY_CORE": "t1_iron_knuckle_punch",
  "INNATE_FATE_ORACLE_CORE": "t1_low_sweep_kick",
  "INNATE_TOTEM_BEAST_GOD_CORE": "t1_horse_stance_brace",
  "INNATE_UNDERWORLD_JUDGE_CORE": "t1_forearm_block",
  "INNATE_OCEAN_SOVEREIGN_CORE": "t1_warm_blood_breath",
  "INNATE_HARVEST_EARTH_GOD_CORE": "t1_wild_claw_swipe",
  "INNATE_MEDICINE_BODHI_GOD_CORE": "t1_shrine_candle_spark",
  "INNATE_NETHER_GHOST_KING_CORE": "t1_bamboo_bow_shot",
  "INNATE_HEAVEN_DEVOURING_DEMON_CORE": "t1_prayer_bead_tap",
  "INNATE_SHADOW_ARCHER_CORE": "t1_water_splash_palm",
  "INNATE_CALLIGRAPHY_PAINTING_SAGE_CORE": "t1_shadow_sneak_step",
  "INNATE_DREAM_ILLUSION_WEAVER_CORE": "t1_poison_thorn_prick",
  "INNATE_MIND_SWORD_TELEKINESIS_CORE": "t1_ghost_whisper_puff",
  "INNATE_CLOUD_DRAGON_SPEAR_CORE": "t1_flute_note_puff",
  "INNATE_PURE_SWORD_SAINT_CORE": "t1_charcoal_brush_stroke",
  "INNATE_WAR_SPEAR_SOVEREIGN_CORE": "t1_calm_mind_sit",
  "INNATE_IRON_BOW_SENTINEL_CORE": "t1_hound_whistle_call",
  "INNATE_OVERLORD_HEAVY_BLADE_CORE": "t1_bug_jar_shake",
  "INNATE_SUN_BOW_DEITY_CORE": "t1_herb_leaf_crush",
  "INNATE_GOLDEN_ARHAT_STAFF_CORE": "t1_iron_tongs_grip",
  "INNATE_BLOOD_SPEAR_ASURA_CORE": "t1_wood_cog_click",
  "INNATE_ASHURA_SLAUGHTER_BLADE_CORE": "t1_paper_charm_stick",
  "INNATE_ZITHER_HEART_BOW_CORE": "t1_flag_wave_signal",
  "INNATE_HEART_BLADE_MEDITATION_CORE": "t1_coin_string_jingle",
  "INNATE_VOID_SPEAR_MIND_CORE": "t1_compass_needle_spin",
  "MP_SWORD_PURE_THRUST_T1": "t1_innate_seed_spark",
  "INNATE_HEAVENLY_GOLEM_CORE": "qi_palm",
  "INNATE_THOUSAND_THREAD_SOUL": "stone_fist",
  "INNATE_BEAST_CHIMERA_CORE": "heart_ward",
  "INNATE_CELESTIAL_BALLISTA_EYE": "blood_drop",
  "INNATE_SOUL_VESSEL_LINK": "mind_ripple",
  "INNATE_FLYING_BLADE_WHEEL": "paw_signal",
  "INNATE_ASTRAL_CLOCKWORK_MATRIX": "heal_sprout",
  "INNATE_REVERSED_RETRIBUTION_MIRROR": "qi_thread",
  "INNATE_SIX_PATHS_WHEEL": "forge_spark",
  "INNATE_FATE_SEVERING_SCISSORS": "gear_tick",
  "INNATE_LOTUS_MERCY_HEART": "sword_drizzle",
  "INNATE_ASURA_JUDGMENT_GAZE": "thorn_whip",
  "INNATE_PAST_LIFE_ECHO": "silver_pin",
  "INNATE_BODHI_VOW_AEGIS": "twin_balance",
  "INNATE_MYRIAD_PACK_COMMAND": "star_guard",
  "INNATE_PRIMORDIAL_BLOOD_AWAKEN": "bronze_skin",
  "INNATE_SYMBIOTIC_CLAW_FUSION": "frost_knuckle",
  "INNATE_COLOSSUS_MOUNTAIN_SHELL": "thunder_tap",
  "INNATE_SWARM_GU_PARASITE": "incense_wisp",
  "INNATE_ASTRAL_FAIRY_BLESSING": "ink_bind",
  "INNATE_ABYSSAL_DRAGON_ROAR": "dream_haze",
  "ART_MECH_PUPPET_001": "poison_barb",
  "ART_KARMA_SAMSARA_001": "soul_needle",
  "ART_BEAST_SOV_001": "straight_jab",
  "ART_V212_XIAN_ZITHER_T1": "draw_cut",
  "ART_V212_BODY_THUNDER_T1": "arrow_fletch",
  "ART_V212_GOD_JUDGE_T1": "staff_broom",
  "ART_V212_GOD_SUN_BOW_T1": "spear_point",
  "ART_V212_DEMON_GHOST_T1": "seal_knot",
  "ART_V212_DEMON_BLOOD_SPEAR_T1": "root_stance",
  "ART_V212_SOUL_VOID_SPEAR_T1": "t1_wooden_sword_slash",
  "ART_V212_SOUL_DREAM_T1": "t1_basic_saber_chop",
  "ART_V212_MECH_BALLISTA_T1": "t1_bamboo_spear_poke",
  "ART_V212_KARMA_ASURA_T1": "t1_open_palm_thrust",
  "ART_V212_KARMA_MIRROR_T1": "t1_pebble_flick",
  "ART_V212_BEAST_SWARM_T1": "t1_light_foot_hop",
  "ART_V212_SAGE_HARMONY_T1": "t1_basic_qi_guard",
  "INNATE_PILL_FURNACE_FIRE": "t1_two_finger_jab",
  "INNATE_POISON_VENOM_MIST": "t1_iron_knuckle_punch",
  "INNATE_HEAVENLY_ANVIL_STRIKE": "t1_low_sweep_kick",
  "INNATE_SPIRIT_SWORD_RESONANCE": "t1_horse_stance_brace",
  "INNATE_RUNE_ARRAY_AEGIS": "t1_forearm_block",
  "INNATE_DIVINE_FLAME_CRUCIBLE": "t1_warm_blood_breath",
  "ART_CRAFT_001": "t1_wild_claw_swipe",
  "ART_CRAFT_002": "t1_shrine_candle_spark",
  "ART_CRAFT_003": "t1_bamboo_bow_shot",
  "ART_CRAFT_004": "t1_prayer_bead_tap",
  "ART_CRAFT_005": "t1_water_splash_palm",
  "ART_V214_EARTH_VEIN_WARDEN_T1": "t1_shadow_sneak_step",
  "INNATE_V214_EARTH_VEIN_WARDEN": "t1_poison_thorn_prick",
  "ART_V214_SEAL_SCRIPT_EXORCIST_T1": "t1_ghost_whisper_puff",
  "INNATE_V214_SEAL_SCRIPT_EXORCIST": "t1_flute_note_puff",
  "ART_V214_THUNDER_TALISMAN_ADEPT_T1": "t1_charcoal_brush_stroke",
  "INNATE_V214_THUNDER_TALISMAN_ADEPT": "t1_calm_mind_sit",
  "ART_V214_MIRAGE_ARRAY_WEAVER_T1": "t1_hound_whistle_call",
  "INNATE_V214_MIRAGE_ARRAY_WEAVER": "t1_bug_jar_shake",
  "ART_V214_BATTLEFIELD_STRATEGIST_T1": "t1_herb_leaf_crush",
  "INNATE_V214_BATTLEFIELD_STRATEGIST": "t1_iron_tongs_grip",
  "ART_V214_SECT_STEWARD_T1": "t1_wood_cog_click",
  "INNATE_V214_SECT_STEWARD": "t1_paper_charm_stick",
  "ART_V214_DIPLOMATIC_ENVOY_T1": "t1_flag_wave_signal",
  "INNATE_V214_DIPLOMATIC_ENVOY": "t1_coin_string_jingle",
  "ART_V214_CARAVAN_QUARTERMASTER_T1": "t1_compass_needle_spin",
  "INNATE_V214_CARAVAN_QUARTERMASTER": "t1_innate_seed_spark",
  "ART_V214_CIVIL_TEACHING_MENTOR_T1": "qi_palm",
  "INNATE_V214_CIVIL_TEACHING_MENTOR": "stone_fist",
  "ART_V214_SPIRIT_FEAST_HEALER_T1": "heart_ward",
  "INNATE_V214_SPIRIT_FEAST_HEALER": "blood_drop",
  "ART_V214_JADE_MEAL_PREPARER_T1": "mind_ripple",
  "INNATE_V214_JADE_MEAL_PREPARER": "paw_signal",
  "ART_V214_CELESTIAL_ARMOR_ARTISAN_T1": "heal_sprout",
  "INNATE_V214_CELESTIAL_ARMOR_ARTISAN": "qi_thread",
  "MP_BASE_ARRAY_TALISMAN": "forge_spark",
  "MP_BASE_STRATEGY_GOVERNANCE": "gear_tick",
  "TECH_V215_ZITHER_ACT_01": "sword_drizzle",
  "TECH_V215_BRUSH_ACT_01": "thorn_whip",
  "TECH_V215_WHIP_ACT_01": "silver_pin",
  "MP_BASE_ASTRO_DIVINATION": "twin_balance",
  "MP_BASE_BUDDHA_DHARMA": "star_guard",
  "MP_BASE_VOID_SPACE": "bronze_skin",
  "MP_BASE_SONIC_HARMONY": "frost_knuckle",
  "MP_BASE_VENOM_GU": "thunder_tap",
  "MP_BASE_PRIMORDIAL_SHIFTER": "incense_wisp",
  "MP_BASE_CELESTIAL_WEATHER": "ink_bind",
  "MP_BASE_WANDERING_DAO": "dream_haze",
  "MP_BASE_MERCANTILE_DAO": "poison_barb",
  "MP_BASE_DRAGON_VEIN_GEOMANCY": "soul_needle",
  "MP_BASE_GRAVITY_DAO": "straight_jab",
  "MP_BASE_CHRONO_EPOCH": "draw_cut",
  "MP_BASE_INK_LITERATI": "arrow_fletch",
  "MP_BASE_SOUL_PUPPETRY": "staff_broom",
  "MP_BASE_PRIMORDIAL_CHAOS": "spear_point",
  "MP_BASE_SHADOW_SAMURAI": "seal_knot",
  "MP_BASE_NINPO_SHADOW": "root_stance",
  "MP_BASE_NINPO_ELEMENTAL": "t1_wooden_sword_slash",
  "MP_BASE_DIVINE_SUMMONER": "t1_basic_saber_chop",
  "MP_BASE_DIVINE_POSSESSION": "t1_bamboo_spear_poke",
  "MP_BASE_DIVINE_CHANNELER": "t1_open_palm_thrust",
  "MP_BASE_VOID_HERETIC_PACT": "t1_pebble_flick",
  "MP_BASE_OCCULT_MAGE": "t1_light_foot_hop",
  "MP_BASE_DEVOURING_FLESH": "t1_basic_qi_guard",
  "MP_BASE_NETHER_GRAVE": "t1_two_finger_jab",
  "MP_BASE_ANCESTRAL_RITUAL": "t1_iron_knuckle_punch",
  "MP_BASE_TIDE_VOYAGER": "t1_low_sweep_kick",
  "MP_BASE_LORE_ARCHIVIST": "t1_horse_stance_brace",
  "MP_BASE_FORTUNE_GAMBLER": "t1_forearm_block",
  "MP_BASE_SPIRIT_HUSBANDRY": "t1_warm_blood_breath",
  "MP_BASE_ARENA_GLORY": "t1_wild_claw_swipe",
  "TECH_UNI_V230_001": "t1_shrine_candle_spark"
};
  SK.PASSIVE_TO_T1_VFX = {
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
  "PASS_MEASURED_FOOTWORK_T1": "staff_broom",
  "ART190_XIAN_071": "stone_fist",
  "ART190_BODY_071": "heart_ward",
  "ART190_GOD_071": "blood_drop",
  "PASS_BLADE_FOUNDATION_T1": "paw_signal",
  "PASS_SPEAR_REACH_T1": "forge_spark",
  "PASS_STAFF_GUARD_T1": "gear_tick",
  "PASS_FIST_FOUNDATION_T1": "sword_drizzle",
  "PASS_CLEAR_SIGHT_T1": "thorn_whip",
  "PASS_STEADY_ALCHEMY_HAND_T1": "silver_pin",
  "PASS_SMITH_EYE_T1": "twin_balance",
  "PASS_HERBAL_DISCERNMENT_T1": "frost_knuckle",
  "PASS_TRAIL_READER_T1": "thunder_tap",
  "PASS_SCRIPTURE_INTERPRETATION_T1": "incense_wisp",
  "TECH_V215_ZITHER_PAS_01": "ink_bind",
  "TECH_V215_BRUSH_PAS_01": "dream_haze",
  "TECH_V215_WHIP_PAS_01": "poison_barb"
};
  SK.resolveT1Vfx = (techOrMove, moveOpt) => {
    if (!techOrMove) return null;
    const id = techOrMove.tech || techOrMove.id, tech = g.CULT && g.CULT.tech ? g.CULT.tech(id) : techOrMove;
    if (!tech || tech.tier !== 1 || tech.legendary || techOrMove.legendary || tech.fxKind || techOrMove.fxKind || (moveOpt && (moveOpt.fxKind || moveOpt.legendary || moveOpt.signatureVfx))) return null;
    const move = moveOpt && (tech.moveDefs || []).find(m => m.id === moveOpt.id);
    if (move && (move.fxKind || move.legendary || move.signatureVfx)) return null;
    return SK.TECH_TO_T1_VFX[id] || null;
  };

  SK.T6_EXT_VFX_FAMILIES = {
  "forbidden_xian_eclipse": {
    "nameTh": "สุริยคราสต้องห้ามเซียนกระบี่",
    "primary": "#c97a96",
    "accent": "#f2ccd9",
    "motion": "sweep",
    "shapeId": 0
  },
  "forbidden_body_furnace": {
    "nameTh": "เตาหลอมโลหิตต้องห้ามกายา",
    "primary": "#d4727a",
    "accent": "#f5c6ca",
    "motion": "pulse",
    "shapeId": 1
  },
  "forbidden_god_twilight": {
    "nameTh": "สนธยาเทวะต้องห้าม",
    "primary": "#cf8a72",
    "accent": "#f2d3c6",
    "motion": "gather",
    "shapeId": 2
  },
  "forbidden_demon_abyss": {
    "nameTh": "ห้วงเหวมารต้องห้ามกลืนภพ",
    "primary": "#b56e9c",
    "accent": "#ebd8e3",
    "motion": "gather",
    "shapeId": 3
  },
  "forbidden_soul_requiem": {
    "nameTh": "เพลงสวดวิญญาณต้องห้าม",
    "primary": "#9e82bd",
    "accent": "#e0d3ed",
    "motion": "weave",
    "shapeId": 4
  },
  "forbidden_beast_chimera": {
    "nameTh": "อสูรบรรพกาลคลั่งต้องห้าม",
    "primary": "#c98272",
    "accent": "#edd0c9",
    "motion": "pulse",
    "shapeId": 5
  },
  "forbidden_sage_blight": {
    "nameTh": "โอสถพิษย้อนรอยต้องห้าม",
    "primary": "#8eb584",
    "accent": "#d8ebd3",
    "motion": "weave",
    "shapeId": 6
  },
  "forbidden_craft_meltdown": {
    "nameTh": "ระเบิดเตาหลอมสวรรค์ต้องห้าม",
    "primary": "#d97e68",
    "accent": "#f5cec4",
    "motion": "pulse",
    "shapeId": 7
  },
  "forbidden_puppet_sacrifice": {
    "nameTh": "หุ่นเชิดสังเวยวิญญาณต้องห้าม",
    "primary": "#a87eb3",
    "accent": "#e2d0e6",
    "motion": "weave",
    "shapeId": 8
  },
  "forbidden_array_cataclysm": {
    "nameTh": "ค่ายกลวิบัติฟ้าดินต้องห้าม",
    "primary": "#8ea8b8",
    "accent": "#d7e2e8",
    "motion": "gather",
    "shapeId": 9
  },
  "forbidden_strategy_scorch": {
    "nameTh": "พิชัยสงครามผลาญแผ่นดินต้องห้าม",
    "primary": "#c9966e",
    "accent": "#edd8c6",
    "motion": "sweep",
    "shapeId": 10
  },
  "forbidden_karma_reversal": {
    "nameTh": "ฝืนกงล้อสังสารวัฏต้องห้าม",
    "primary": "#b87ea8",
    "accent": "#e8d0e1",
    "motion": "weave",
    "shapeId": 11
  },
  "forbidden_void_collapse": {
    "nameTh": "มิติเวลาพังทลายต้องห้าม",
    "primary": "#887eb8",
    "accent": "#d4d0e8",
    "motion": "gather",
    "shapeId": 12
  },
  "forbidden_pantheon_wrath": {
    "nameTh": "ทัณฑ์เทวสภาต้องห้าม",
    "primary": "#cf9e72",
    "accent": "#f2dec9",
    "motion": "rise",
    "shapeId": 13
  }
};
  SK.T6_ALL_VFX_FAMILIES = Object.assign({}, SK.T6_VFX_FAMILIES, SK.T6_EXT_VFX_FAMILIES);
  SK.TECH_TO_T6_EXT_VFX = {
  "TECH_V230_SHADOW_SAMURAI_FORBIDDEN": "forbidden_xian_eclipse",
  "TECH_V230_NINPO_SHADOW_FORBIDDEN": "forbidden_body_furnace",
  "TECH_V230_NINPO_ELEMENTAL_FORBIDDEN": "forbidden_god_twilight",
  "TECH_V230_DIVINE_SUMMONER_FORBIDDEN": "forbidden_demon_abyss",
  "TECH_V230_DIVINE_POSSESSION_FORBIDDEN": "forbidden_soul_requiem",
  "TECH_V230_DIVINE_CHANNELER_FORBIDDEN": "forbidden_beast_chimera",
  "TECH_V230_VOID_HERETIC_PACT_FORBIDDEN": "forbidden_sage_blight",
  "TECH_V230_OCCULT_MAGE_FORBIDDEN": "forbidden_craft_meltdown",
  "TECH_V230_DEVOURING_FLESH_FORBIDDEN": "forbidden_puppet_sacrifice",
  "TECH_V230_NETHER_GRAVE_FORBIDDEN": "forbidden_array_cataclysm",
  "TECH_V230_ANCESTRAL_RITUAL_FORBIDDEN": "forbidden_strategy_scorch",
  "TECH_V230_TIDE_VOYAGER_FORBIDDEN": "forbidden_karma_reversal",
  "TECH_V230_LORE_ARCHIVIST_FORBIDDEN": "forbidden_void_collapse",
  "TECH_V230_FORTUNE_GAMBLER_FORBIDDEN": "forbidden_pantheon_wrath",
  "TECH_V230_SPIRIT_HUSBANDRY_FORBIDDEN": "forbidden_xian_eclipse",
  "TECH_V230_ARENA_GLORY_FORBIDDEN": "forbidden_body_furnace",
  "TECH_UNI_V230_012": "forbidden_god_twilight",
  "TECH_V240_FOCUS_02": "forbidden_demon_abyss"
};
  SK.PASSIVE_TO_T6_EXT_VFX = {
  "ART190_XIAN_010": "forbidden_xian_eclipse",
  "ART190_XIAN_030": "forbidden_body_furnace",
  "ART190_XIAN_070": "forbidden_god_twilight",
  "ART190_BODY_010": "forbidden_demon_abyss",
  "ART190_BODY_030": "forbidden_soul_requiem",
  "ART190_BODY_070": "forbidden_beast_chimera",
  "ART190_GOD_010": "forbidden_sage_blight",
  "ART190_GOD_030": "forbidden_craft_meltdown",
  "ART190_GOD_070": "forbidden_puppet_sacrifice",
  "TECH_V234_XIAN_PAS_04": "forbidden_array_cataclysm",
  "TECH_V234_XIAN_AUX_03": "forbidden_strategy_scorch",
  "TECH_V234_BODY_AUX_03": "forbidden_karma_reversal",
  "TECH_V234_GOD_PAS_04": "forbidden_void_collapse",
  "TECH_V234_GOD_AUX_03": "forbidden_pantheon_wrath",
  "TECH_V234_DEMON_PAS_04": "forbidden_xian_eclipse",
  "TECH_V234_DEMON_AUX_03": "forbidden_body_furnace",
  "TECH_V234_HEART_SOUL_AUX_03": "forbidden_god_twilight",
  "TECH_V234_MECH_PUPPET_PAS_04": "forbidden_demon_abyss",
  "TECH_V234_MECH_PUPPET_AUX_03": "forbidden_soul_requiem",
  "TECH_V234_KARMA_SAMSARA_PAS_04": "forbidden_beast_chimera",
  "TECH_V234_KARMA_SAMSARA_AUX_03": "forbidden_sage_blight",
  "TECH_V234_BEAST_SOVEREIGN_AUX_03": "forbidden_craft_meltdown",
  "TECH_V234_SAGE_SUPPORT_AUX_03": "forbidden_puppet_sacrifice",
  "TECH_V234_CRAFT_CREATION_PAS_04": "forbidden_array_cataclysm",
  "TECH_V234_CRAFT_CREATION_AUX_03": "forbidden_strategy_scorch",
  "TECH_V234_ARRAY_TALISMAN_PAS_04": "forbidden_karma_reversal",
  "TECH_V234_ARRAY_TALISMAN_AUX_03": "forbidden_void_collapse",
  "TECH_V234_STRATEGY_GOVERNANCE_PAS_04": "forbidden_pantheon_wrath",
  "TECH_V234_STRATEGY_GOVERNANCE_AUX_03": "forbidden_xian_eclipse"
};
  SK.resolveT6ExtVfx = (techOrMove, moveOpt) => {
    if (!techOrMove) return null;
    const id = techOrMove.tech || techOrMove.id, tech = g.CULT && g.CULT.tech ? g.CULT.tech(id) : techOrMove;
    if (!tech || tech.tier !== 6 || tech.legendary || techOrMove.legendary || tech.fxKind || techOrMove.fxKind || (moveOpt && (moveOpt.fxKind || moveOpt.legendary || moveOpt.signatureVfx))) return null;
    const move = moveOpt && (tech.moveDefs || []).find(m => m.id === moveOpt.id);
    if (move && (move.fxKind || move.legendary || move.signatureVfx)) return null;
    return SK.TECH_TO_T6_EXT_VFX[id] || SK.TECH_TO_T6_VFX[id] || null;
  };

  SK.SUBPATH_VFX_MOTIFS = {
  "motif_xian_sword_immortal": {
    "id": "motif_xian_sword_immortal",
    "nameTh": "วิถีเซียนกระบี่เหินเวหา",
    "group": "XIAN",
    "primary": "#9fd2e3",
    "accent": "#e0f4f8",
    "emblem": "sword_lotus",
    "shapeId": 0
  },
  "motif_xian_thunder_cloud": {
    "id": "motif_xian_thunder_cloud",
    "nameTh": "วิถีเซียนอัสนีเมฆา",
    "group": "XIAN",
    "primary": "#a3bded",
    "accent": "#e1ecfc",
    "emblem": "thunder_sigil",
    "shapeId": 1
  },
  "motif_xian_frost_moon": {
    "id": "motif_xian_frost_moon",
    "nameTh": "วิถีเซียนจันทราเหมันต์",
    "group": "XIAN",
    "primary": "#a6c8e0",
    "accent": "#e3eff8",
    "emblem": "crescent_frost",
    "shapeId": 2
  },
  "motif_xian_taiji_harmony": {
    "id": "motif_xian_taiji_harmony",
    "nameTh": "วิถีเซียนไท่เก๊กหยินหยาง",
    "group": "XIAN",
    "primary": "#b5c2d9",
    "accent": "#e8edf5",
    "emblem": "taiji_wheel",
    "shapeId": 3
  },
  "motif_body_vajra_titan": {
    "id": "motif_body_vajra_titan",
    "nameTh": "วิถีกายาวัชระขุนเขา",
    "group": "BODY",
    "primary": "#d6b87c",
    "accent": "#f5e8c8",
    "emblem": "vajra_crown",
    "shapeId": 4
  },
  "motif_body_dragon_blood": {
    "id": "motif_body_dragon_blood",
    "nameTh": "วิถีกายาโลหิตมังกร",
    "group": "BODY",
    "primary": "#d98a8a",
    "accent": "#f5d3d3",
    "emblem": "dragon_scale",
    "shapeId": 5
  },
  "motif_body_phoenix_flame": {
    "id": "motif_body_phoenix_flame",
    "nameTh": "วิถีกายาเพลิงหงส์อมตะ",
    "group": "BODY",
    "primary": "#e39878",
    "accent": "#f7d9cb",
    "emblem": "phoenix_crest",
    "shapeId": 6
  },
  "motif_body_thunder_tiger": {
    "id": "motif_body_thunder_tiger",
    "nameTh": "วิถีกายาพยัคฆ์สายฟ้า",
    "group": "BODY",
    "primary": "#aebee8",
    "accent": "#e3e9fa",
    "emblem": "tiger_fang",
    "shapeId": 7
  },
  "motif_god_solar_edict": {
    "id": "motif_god_solar_edict",
    "nameTh": "วิถีเทวะโองการสุริยัน",
    "group": "GOD",
    "primary": "#dec078",
    "accent": "#f7ebd0",
    "emblem": "sun_halo",
    "shapeId": 8
  },
  "motif_god_lunar_oracle": {
    "id": "motif_god_lunar_oracle",
    "nameTh": "วิถีเทวะพยากรณ์จันทรา",
    "group": "GOD",
    "primary": "#9ec9db",
    "accent": "#dff0f7",
    "emblem": "moon_mirror",
    "shapeId": 9
  },
  "motif_god_war_deity": {
    "id": "motif_god_war_deity",
    "nameTh": "วิถีเทวะสงครามพิชิตศึก",
    "group": "GOD",
    "primary": "#d4a373",
    "accent": "#f2dec9",
    "emblem": "war_halberd",
    "shapeId": 10
  },
  "motif_god_mercy_bodhi": {
    "id": "motif_god_mercy_bodhi",
    "nameTh": "วิถีเทวะโพธิสัตว์เมตตา",
    "group": "GOD",
    "primary": "#a3cfa8",
    "accent": "#e1f2e3",
    "emblem": "lotus_canopy",
    "shapeId": 11
  },
  "motif_demon_blood_scythe": {
    "id": "motif_demon_blood_scythe",
    "nameTh": "วิถีมารโลหิตสูบวิญญาณ",
    "group": "DEMON",
    "primary": "#d17b88",
    "accent": "#f2ccd2",
    "emblem": "blood_crescent",
    "shapeId": 12
  },
  "motif_demon_shadow_eclipse": {
    "id": "motif_demon_shadow_eclipse",
    "nameTh": "วิถีมารเร้นเงาสังหาร",
    "group": "DEMON",
    "primary": "#9e8fb8",
    "accent": "#ded7eb",
    "emblem": "shadow_dagger",
    "shapeId": 13
  },
  "motif_demon_myriad_venom": {
    "id": "motif_demon_myriad_venom",
    "nameTh": "วิถีมารหมื่นพิษกู่",
    "group": "DEMON",
    "primary": "#9ec284",
    "accent": "#dfeed3",
    "emblem": "venom_hex",
    "shapeId": 14
  },
  "motif_demon_nether_ghost": {
    "id": "motif_demon_nether_ghost",
    "nameTh": "วิถีมารราชันย์ยมโลก",
    "group": "DEMON",
    "primary": "#8fb8b5",
    "accent": "#d9ebe9",
    "emblem": "soul_lantern",
    "shapeId": 15
  },
  "motif_soul_celestial_zither": {
    "id": "motif_soul_celestial_zither",
    "nameTh": "วิถีจิตพิณสวรรค์สะท้านภพ",
    "group": "HEART_SOUL",
    "primary": "#8ec7c2",
    "accent": "#d9f0ee",
    "emblem": "zither_chord",
    "shapeId": 16
  },
  "motif_soul_dream_mirage": {
    "id": "motif_soul_dream_mirage",
    "nameTh": "วิถีจิตมายาฝันเจ็ดอารมณ์",
    "group": "HEART_SOUL",
    "primary": "#baa3d4",
    "accent": "#e6dcf2",
    "emblem": "dream_butterfly",
    "shapeId": 17
  },
  "motif_soul_zen_void": {
    "id": "motif_soul_zen_void",
    "nameTh": "วิถีจิตเซนสุญตากระจกใจ",
    "group": "HEART_SOUL",
    "primary": "#cfc096",
    "accent": "#f2ecda",
    "emblem": "zen_bell",
    "shapeId": 18
  },
  "motif_soul_heaven_brush": {
    "id": "motif_soul_heaven_brush",
    "nameTh": "วิถีจิตพู่กันสวรรค์จารึก",
    "group": "HEART_SOUL",
    "primary": "#9eb5a8",
    "accent": "#dce8e1",
    "emblem": "brush_scroll",
    "shapeId": 19
  },
  "motif_beast_pack_sovereign": {
    "id": "motif_beast_pack_sovereign",
    "nameTh": "วิถีอสูรราชันย์ฝูงสัตว์",
    "group": "BEAST_SOVEREIGN",
    "primary": "#c99e7a",
    "accent": "#f0decb",
    "emblem": "beast_horn",
    "shapeId": 20
  },
  "motif_beast_gu_emperor": {
    "id": "motif_beast_gu_emperor",
    "nameTh": "วิถีอสูรจักรพรรดิแมลงกู่",
    "group": "BEAST_SOVEREIGN",
    "primary": "#a4c27e",
    "accent": "#e1f0ce",
    "emblem": "gu_wings",
    "shapeId": 21
  },
  "motif_beast_symbiotic_claw": {
    "id": "motif_beast_symbiotic_claw",
    "nameTh": "วิถีอสูรผสานสายเลือด",
    "group": "BEAST_SOVEREIGN",
    "primary": "#cf937e",
    "accent": "#f2d7ce",
    "emblem": "primal_claw",
    "shapeId": 22
  },
  "motif_beast_astral_tamer": {
    "id": "motif_beast_astral_tamer",
    "nameTh": "วิถีอสูรเซียนดาราคู่สัญญา",
    "group": "BEAST_SOVEREIGN",
    "primary": "#9ec8db",
    "accent": "#dfeff7",
    "emblem": "star_plume",
    "shapeId": 23
  },
  "motif_sage_shennong_herb": {
    "id": "motif_sage_shennong_herb",
    "nameTh": "วิถีปราชญ์โอสถเสินหนง",
    "group": "SAGE_SUPPORT",
    "primary": "#8fc79a",
    "accent": "#d9f0de",
    "emblem": "jade_gourd",
    "shapeId": 24
  },
  "motif_sage_acupoint_needle": {
    "id": "motif_sage_acupoint_needle",
    "nameTh": "วิถีปราชญ์เข็มทองเดินปราณ",
    "group": "SAGE_SUPPORT",
    "primary": "#d4bf7a",
    "accent": "#f2e9cc",
    "emblem": "meridian_pin",
    "shapeId": 25
  },
  "motif_craft_divine_anvil": {
    "id": "motif_craft_divine_anvil",
    "nameTh": "วิถีช่างทั่งสวรรค์หลอมศาสตรา",
    "group": "CRAFT_CREATION",
    "primary": "#d69e72",
    "accent": "#f5dcc7",
    "emblem": "anvil_flame",
    "shapeId": 26
  },
  "motif_craft_pill_cauldron": {
    "id": "motif_craft_pill_cauldron",
    "nameTh": "วิถีช่างเตาหลอมโอสถทิพย์",
    "group": "CRAFT_CREATION",
    "primary": "#e08e6d",
    "accent": "#f7d5c6",
    "emblem": "tripod_cauldron",
    "shapeId": 27
  },
  "motif_puppet_heavenly_golem": {
    "id": "motif_puppet_heavenly_golem",
    "nameTh": "วิถีหุ่นกลยักษ์สวรรค์",
    "group": "MECH_PUPPET",
    "primary": "#b8a896",
    "accent": "#e8e0d8",
    "emblem": "gear_colossus",
    "shapeId": 28
  },
  "motif_puppet_spirit_threads": {
    "id": "motif_puppet_spirit_threads",
    "nameTh": "วิถีหุ่นเชิดด้ายวิญญาณ",
    "group": "MECH_PUPPET",
    "primary": "#b89ec4",
    "accent": "#e6d9eb",
    "emblem": "puppet_cross",
    "shapeId": 29
  },
  "motif_array_bagua_gates": {
    "id": "motif_array_bagua_gates",
    "nameTh": "วิถีค่ายกลแปดทิศปากั้ว",
    "group": "ARRAY_TALISMAN",
    "primary": "#a3bfa8",
    "accent": "#dce8de",
    "emblem": "bagua_octagon",
    "shapeId": 30
  },
  "motif_array_heaven_talisman": {
    "id": "motif_array_heaven_talisman",
    "nameTh": "วิถียันต์สวรรค์สะกดมาร",
    "group": "ARRAY_TALISMAN",
    "primary": "#9eb4e0",
    "accent": "#dce5f7",
    "emblem": "talisman_seal",
    "shapeId": 31
  },
  "motif_strategy_imperial_banner": {
    "id": "motif_strategy_imperial_banner",
    "nameTh": "วิถีพิชัยสงครามธงบัญชาทัพ",
    "group": "STRATEGY_GOVERNANCE",
    "primary": "#d4bc7d",
    "accent": "#f2e8cc",
    "emblem": "command_pennant",
    "shapeId": 32
  },
  "motif_strategy_golden_abacus": {
    "id": "motif_strategy_golden_abacus",
    "nameTh": "วิถีพิชัยสงครามลูกคิดทอง",
    "group": "STRATEGY_GOVERNANCE",
    "primary": "#d6bf78",
    "accent": "#f5ebcc",
    "emblem": "abacus_frame",
    "shapeId": 33
  },
  "motif_karma_six_realms": {
    "id": "motif_karma_six_realms",
    "nameTh": "วิถีสังสารวัฏกงล้อหกภพ",
    "group": "KARMA_SAMSARA",
    "primary": "#c4a3cf",
    "accent": "#eadcf0",
    "emblem": "samsara_wheel",
    "shapeId": 34
  },
  "motif_karma_asura_blade": {
    "id": "motif_karma_asura_blade",
    "nameTh": "วิถีสังสารวัฏดาบอสุรา",
    "group": "KARMA_SAMSARA",
    "primary": "#d4858d",
    "accent": "#f2d0d4",
    "emblem": "karma_scales",
    "shapeId": 35
  },
  "motif_specialist_astro_star": {
    "id": "motif_specialist_astro_star",
    "nameTh": "วิถีพยากรณ์ดาราจักร",
    "group": "ASTRO_DIVINATION",
    "primary": "#9ab3db",
    "accent": "#dbe6f7",
    "emblem": "armillary_ring",
    "shapeId": 36
  },
  "motif_specialist_buddha_dharma": {
    "id": "motif_specialist_buddha_dharma",
    "nameTh": "วิถีพุทธะประภามณฑล",
    "group": "BUDDHA_DHARMA",
    "primary": "#d4c285",
    "accent": "#f2ead0",
    "emblem": "dharma_wheel",
    "shapeId": 37
  },
  "motif_specialist_void_space": {
    "id": "motif_specialist_void_space",
    "nameTh": "วิถีว่างเปล่าผ่ามิติ",
    "group": "VOID_SPACE",
    "primary": "#a594c9",
    "accent": "#e0d8f0",
    "emblem": "void_rhombus",
    "shapeId": 38
  },
  "motif_specialist_sonic_harmony": {
    "id": "motif_specialist_sonic_harmony",
    "nameTh": "วิถีคีตาสังคีตสวรรค์",
    "group": "SONIC_HARMONY",
    "primary": "#8ec7c2",
    "accent": "#d9f0ee",
    "emblem": "sonic_wave",
    "shapeId": 39
  },
  "motif_specialist_venom_gu": {
    "id": "motif_specialist_venom_gu",
    "nameTh": "วิถีพิษกู่บรรพกาล",
    "group": "VENOM_GU",
    "primary": "#a4c27e",
    "accent": "#e1f0ce",
    "emblem": "venom_fang",
    "shapeId": 40
  },
  "motif_specialist_primordial_shifter": {
    "id": "motif_specialist_primordial_shifter",
    "nameTh": "วิถีกลายร่างเทพอสูร",
    "group": "PRIMORDIAL_SHIFTER",
    "primary": "#c99e7a",
    "accent": "#f0decb",
    "emblem": "chimera_wings",
    "shapeId": 41
  },
  "motif_specialist_celestial_weather": {
    "id": "motif_specialist_celestial_weather",
    "nameTh": "วิถีบัญชาฟ้าฝนอัสนี",
    "group": "CELESTIAL_WEATHER",
    "primary": "#9eb4e0",
    "accent": "#dce5f7",
    "emblem": "storm_cloud",
    "shapeId": 42
  },
  "motif_specialist_wandering_dao": {
    "id": "motif_specialist_wandering_dao",
    "nameTh": "วิถีคนจรหมื่นขุนเขา",
    "group": "WANDERING_DAO",
    "primary": "#a8cfd4",
    "accent": "#dff0f2",
    "emblem": "compass_star",
    "shapeId": 43
  },
  "motif_specialist_mercantile_dao": {
    "id": "motif_specialist_mercantile_dao",
    "nameTh": "วิถีวาณิชย์ตราชั่งทอง",
    "group": "MERCANTILE_DAO",
    "primary": "#d6bf78",
    "accent": "#f5ebcc",
    "emblem": "coin_scale",
    "shapeId": 44
  },
  "motif_specialist_dragon_geomancy": {
    "id": "motif_specialist_dragon_geomancy",
    "nameTh": "วิถีฮวงจุ้ยชีพจรมังกร",
    "group": "DRAGON_VEIN_GEOMANCY",
    "primary": "#b5b88a",
    "accent": "#e6e8d3",
    "emblem": "luopan_peaks",
    "shapeId": 45
  },
  "motif_specialist_gravity_dao": {
    "id": "motif_specialist_gravity_dao",
    "nameTh": "วิถีแรงโน้มถ่วงดารา",
    "group": "GRAVITY_DAO",
    "primary": "#968ab8",
    "accent": "#dad5eb",
    "emblem": "gravity_rings",
    "shapeId": 46
  },
  "motif_specialist_chrono_epoch": {
    "id": "motif_specialist_chrono_epoch",
    "nameTh": "วิถีกาลเวลานาฬิกาสวรรค์",
    "group": "CHRONO_EPOCH",
    "primary": "#b0bdd4",
    "accent": "#e1e7f2",
    "emblem": "sundial_hands",
    "shapeId": 47
  },
  "motif_specialist_ink_literati": {
    "id": "motif_specialist_ink_literati",
    "nameTh": "วิถีปราชญ์อักษรพู่กันหยก",
    "group": "INK_LITERATI",
    "primary": "#9eb5a8",
    "accent": "#dce8e1",
    "emblem": "jade_scroll",
    "shapeId": 48
  },
  "motif_specialist_soul_puppetry": {
    "id": "motif_specialist_soul_puppetry",
    "nameTh": "วิถีเชิดหุ่นวิญญาณ",
    "group": "SOUL_PUPPETRY",
    "primary": "#b89ec4",
    "accent": "#e6d9eb",
    "emblem": "marionette_bar",
    "shapeId": 49
  },
  "motif_specialist_primordial_chaos": {
    "id": "motif_specialist_primordial_chaos",
    "nameTh": "วิถีบรรพกาลหุ่นตุ้น",
    "group": "PRIMORDIAL_CHAOS",
    "primary": "#b3a4b8",
    "accent": "#e4dde6",
    "emblem": "chaos_mill",
    "shapeId": 50
  },
  "motif_specialist_shadow_samurai": {
    "id": "motif_specialist_shadow_samurai",
    "nameTh": "วิถีซามูไรไร้เงาอิไอ",
    "group": "SHADOW_SAMURAI",
    "primary": "#d47f88",
    "accent": "#f2cdd1",
    "emblem": "crimson_moon_slash",
    "shapeId": 51
  },
  "motif_specialist_ninpo_shadow": {
    "id": "motif_specialist_ninpo_shadow",
    "nameTh": "วิถีนินจาเร้นเงาดาวกระจาย",
    "group": "NINPO_SHADOW",
    "primary": "#8fa8b8",
    "accent": "#d7e2e8",
    "emblem": "shuriken_star",
    "shapeId": 52
  },
  "motif_specialist_ninpo_elemental": {
    "id": "motif_specialist_ninpo_elemental",
    "nameTh": "วิถีนินจาคาถาห้าธาตุ",
    "group": "NINPO_ELEMENTAL",
    "primary": "#c99a82",
    "accent": "#edd8ce",
    "emblem": "chakra_drums",
    "shapeId": 53
  },
  "motif_specialist_divine_summoner": {
    "id": "motif_specialist_divine_summoner",
    "nameTh": "วิถีอัญเชิญมหาเทวสภา",
    "group": "DIVINE_SUMMONER",
    "primary": "#d6bf82",
    "accent": "#f5ebcf",
    "emblem": "pantheon_gate",
    "shapeId": 54
  },
  "motif_specialist_void_heretic": {
    "id": "motif_specialist_void_heretic",
    "nameTh": "วิถีนอกรีตพันธะอเวจี",
    "group": "VOID_HERETIC_PACT",
    "primary": "#9e82b5",
    "accent": "#ded0e8",
    "emblem": "abyss_eye",
    "shapeId": 55
  },
  "motif_specialist_occult_mage": {
    "id": "motif_specialist_occult_mage",
    "nameTh": "วิถีขมังเวทมหายันต์",
    "group": "OCCULT_MAGE",
    "primary": "#c9b07a",
    "accent": "#ede2ca",
    "emblem": "yantra_spires",
    "shapeId": 56
  },
  "motif_cat_innate_subpath": {
    "id": "motif_cat_innate_subpath",
    "nameTh": "ตราวิชาประจำสายย่อย (Innate Sub-Path)",
    "group": "INNATE_SUBPATH",
    "primary": "#9ec4d6",
    "accent": "#ddecf2",
    "emblem": "subpath_crest",
    "shapeId": 57
  },
  "motif_cat_innate_grand_dao": {
    "id": "motif_cat_innate_grand_dao",
    "nameTh": "ตราวิชามรรคาใหญ่ (Innate Grand Dao)",
    "group": "INNATE_GRAND_DAO",
    "primary": "#c9b882",
    "accent": "#ede6cf",
    "emblem": "grand_dao_seal",
    "shapeId": 58
  },
  "motif_cat_lightness_grand_dao": {
    "id": "motif_cat_lightness_grand_dao",
    "nameTh": "ตราวิชาตัวเบามรรคา (Lightness Grand Dao)",
    "group": "LIGHTNESS_GRAND_DAO",
    "primary": "#98cfe0",
    "accent": "#daf0f7",
    "emblem": "wind_wings",
    "shapeId": 59
  },
  "motif_cat_defensive_grand_dao": {
    "id": "motif_cat_defensive_grand_dao",
    "nameTh": "ตราวิชาคุ้มกายมรรคา (Defensive Grand Dao)",
    "group": "DEFENSIVE_GRAND_DAO",
    "primary": "#cfbe86",
    "accent": "#f0e9d1",
    "emblem": "aegis_bell",
    "shapeId": 60
  },
  "motif_cat_support_grand_dao": {
    "id": "motif_cat_support_grand_dao",
    "nameTh": "ตราวิชาหนุนมรรคา (Support Grand Dao)",
    "group": "SUPPORT_GRAND_DAO",
    "primary": "#8fc9b8",
    "accent": "#d9f2eb",
    "emblem": "lotus_banner",
    "shapeId": 61
  },
  "motif_cat_forbidden_grand_dao": {
    "id": "motif_cat_forbidden_grand_dao",
    "nameTh": "ตราวิชาต้องห้ามมรรคา (Forbidden Grand Dao)",
    "group": "FORBIDDEN_GRAND_DAO",
    "primary": "#cf7486",
    "accent": "#f2c9d1",
    "emblem": "taboo_chains",
    "shapeId": 62
  },
  "motif_cat_mantra_circulation": {
    "id": "motif_cat_mantra_circulation",
    "nameTh": "ตราคัมภีร์โคจรลมปราณ (Mantra Circulation)",
    "group": "MANTRA",
    "primary": "#a8c9b8",
    "accent": "#e0f0e8",
    "emblem": "meridian_orbit",
    "shapeId": 63
  }
};
  SK.MANTRA_TO_VFX_MOTIF = {
  "MANTRA_BASIC_BREATH": "motif_xian_sword_immortal",
  "MANTRA_JADE_SPRING": "motif_xian_thunder_cloud",
  "MANTRA_AZURE_CLOUD": "motif_xian_frost_moon",
  "MANTRA_WHITE_TIGER_QI": "motif_xian_taiji_harmony",
  "MANTRA_THUNDER_BLADE_QI": "motif_body_vajra_titan",
  "MANTRA_MOONLIGHT_ILLUSION_QI": "motif_body_dragon_blood",
  "MANTRA_ABYSSAL_TIDE_QI": "motif_body_phoenix_flame",
  "MANTRA_MYRIAD_VENOM_QI": "motif_body_thunder_tiger",
  "MANTRA_FIVE_ELEMENT_PROSPERITY": "motif_god_solar_edict",
  "MANTRA_HEAVENLY_SWORD_QI": "motif_god_lunar_oracle",
  "MANTRA_ASTRAL_SOVEREIGN_QI": "motif_god_war_deity",
  "MANTRA_PRIMORDIAL_CHAOS_QI": "motif_god_mercy_bodhi",
  "MANTRA_IRON_SKIN": "motif_demon_blood_scythe",
  "MANTRA_BRONZE_BONE": "motif_demon_shadow_eclipse",
  "MANTRA_GOLDEN_BELL_VAJRA": "motif_demon_myriad_venom",
  "MANTRA_SOLAR_FORGE_BODY": "motif_demon_nether_ghost",
  "MANTRA_SEA_LEVIATHAN_BODY": "motif_soul_celestial_zither",
  "MANTRA_FROST_TIGER_BODY": "motif_soul_dream_mirage",
  "MANTRA_PRIMORDIAL_DRAGON_BODY": "motif_soul_zen_void",
  "MANTRA_INCENSE_PRAYER": "motif_soul_heaven_brush",
  "MANTRA_MIRAGE_ORACLE_FAITH": "motif_beast_pack_sovereign",
  "MANTRA_TOTEM_BEAST_FAITH": "motif_beast_gu_emperor",
  "MANTRA_PANTHEON_GLORY_FAITH": "motif_beast_symbiotic_claw",
  "MANTRA_ETERNAL_FLAME_FAITH": "motif_beast_astral_tamer",
  "MANTRA_SOLAR_DEITY_FAITH": "motif_sage_shennong_herb",
  "TECH_GALE_SWORD": "motif_sage_acupoint_needle",
  "TECH_CLOUD_SPLITTING_SWORD": "motif_craft_divine_anvil",
  "TECH_FLASH_LIGHTNING_SLASH": "motif_craft_pill_cauldron",
  "TECH_FALLING_PETAL_SWORD": "motif_puppet_heavenly_golem",
  "TECH_HEAVEN_HAMMER_STRIKE": "motif_puppet_spirit_threads",
  "TECH_NINE_SKIES_SWORD_ARRAY": "motif_array_bagua_gates",
  "TECH_STARFALL_ANNIHILATION": "motif_array_heaven_talisman",
  "TECH_ANCESTRAL_DRAGON_CLAW": "motif_strategy_imperial_banner",
  "TECH_GLACIAL_SHATTER_FIST": "motif_strategy_golden_abacus",
  "TECH_GOLDEN_LOTUS_PALM": "motif_karma_six_realms",
  "TECH_SWORD_OF_TIME_PRIMORDIAL": "motif_karma_asura_blade",
  "LIGHT_SWALLOW_STEP": "motif_specialist_astro_star",
  "LIGHT_CLOUD_STEP": "motif_specialist_buddha_dharma",
  "LIGHT_THUNDER_SHRINK_EARTH": "motif_specialist_void_space",
  "AUX_PILL_NINE_REVOLUTIONS": "motif_specialist_sonic_harmony",
  "AUX_WEAPON_HEAVEN_FORGE": "motif_specialist_venom_gu",
  "AUX_ARRAY_STARS": "motif_specialist_primordial_shifter",
  "AUX_BEAST_BLOOD_PACT": "motif_specialist_celestial_weather",
  "FORB_BLOOD_SOUL_DEVOUR": "motif_specialist_wandering_dao",
  "FORB_LIFESPAN_BURN_STRIKE": "motif_specialist_mercantile_dao",
  "FORB_CORPSE_PUPPET_ARMY": "motif_specialist_dragon_geomancy",
  "FORB_FAKE_FAITH_HARVEST": "motif_specialist_gravity_dao",
  "MANTRA_DEMON_SHADOW_BREATH": "motif_specialist_chrono_epoch",
  "ART_V112_DEMON_GHOST_WAIL_MANTRA_T2": "motif_specialist_ink_literati",
  "ART_V112_DEMON_BLOOD_SIPHON_MANTRA_T3": "motif_specialist_soul_puppetry",
  "MANTRA_DEMON_VENOM_CAULDRON": "motif_specialist_primordial_chaos",
  "MANTRA_DEMON_ABYSSAL_CORE": "motif_specialist_shadow_samurai",
  "MANTRA_DEMON_NETHER_SOVEREIGN": "motif_specialist_ninpo_shadow",
  "MANTRA_DEMON_PRIMORDIAL_EMPEROR": "motif_specialist_ninpo_elemental",
  "ART_V112_SOUL_CLEAR_MIRROR_ZEN_T1": "motif_specialist_divine_summoner",
  "MANTRA_SOUL_SPIRIT_TEA_BREATH": "motif_specialist_void_heretic",
  "ART_C117_INNATE_ZEN_VOID_MIND": "motif_specialist_occult_mage",
  "ART_V210_MANTRA_VOID_HARMONY": "motif_cat_innate_subpath",
  "ART_V112_SOUL_ETERNAL_DREAM_REALM_T5": "motif_cat_innate_grand_dao",
  "MANTRA_SOUL_BODHI_WISDOM": "motif_cat_lightness_grand_dao",
  "MANTRA_SOUL_COSMIC_VOID_SAGE": "motif_cat_defensive_grand_dao",
  "LEG_MANTRA_TAIXUAN_SCRIPTURE": "motif_cat_support_grand_dao",
  "LEG_MANTRA_SIX_MERIDIAN_QI": "motif_cat_forbidden_grand_dao",
  "LEG_MANTRA_DRAGON_ELEPHANT_PRAJNA": "motif_cat_mantra_circulation",
  "LEG_MANTRA_DIAMOND_INDESTRUCTIBLE": "motif_xian_sword_immortal",
  "LEG_MANTRA_EIGHT_DESOLATIONS_GOD": "motif_xian_thunder_cloud",
  "LEG_MANTRA_CELESTIAL_MANDATE_CANON": "motif_xian_frost_moon",
  "LEG_MANTRA_ASHURA_BLOOD_SEA": "motif_xian_taiji_harmony",
  "LEG_MANTRA_TEN_THOUSAND_GU_MONARCH": "motif_body_vajra_titan",
  "LEG_MANTRA_NINE_YIN_SOUL_MIRROR": "motif_body_dragon_blood",
  "LEG_MANTRA_LITTLE_LI_HEART_BLADE": "motif_body_phoenix_flame",
  "MANTRA_XIAN_PURE_ORIGIN_T5": "motif_body_thunder_tiger",
  "MANTRA_BODY_UNYIELDING_MARROW_T5": "motif_god_solar_edict",
  "MANTRA_GOD_SOVEREIGN_VOW_T5": "motif_god_lunar_oracle",
  "MANTRA_DEMON_ASHURA_HEART_T5": "motif_god_war_deity",
  "MANTRA_SOUL_TRANSCENDENT_MIND_T5": "motif_god_mercy_bodhi",
  "MANTRA_MECH_PUPPET_1": "motif_demon_blood_scythe",
  "MANTRA_MECH_PUPPET_4": "motif_demon_shadow_eclipse",
  "MANTRA_KARMA_SAMSARA_1": "motif_demon_myriad_venom",
  "MANTRA_KARMA_SAMSARA_4": "motif_demon_nether_ghost",
  "MANTRA_BEAST_SOVEREIGN_1": "motif_soul_celestial_zither",
  "MANTRA_BEAST_SOVEREIGN_4": "motif_soul_dream_mirage",
  "MANTRA_SAGE_SUP_001": "motif_soul_zen_void",
  "MANTRA_SAGE_SUP_002": "motif_soul_heaven_brush",
  "MANTRA_CRAFT_001": "motif_beast_pack_sovereign",
  "MANTRA_CRAFT_002": "motif_beast_gu_emperor",
  "MANTRA_CRAFT_003": "motif_beast_symbiotic_claw",
  "MANTRA_V214_ARRAY_TALISMAN_T1": "motif_beast_astral_tamer",
  "MANTRA_V214_ARRAY_TALISMAN_T3": "motif_sage_shennong_herb",
  "MANTRA_V214_ARRAY_TALISMAN_T6": "motif_sage_acupoint_needle",
  "MANTRA_V214_STRATEGY_GOVERNANCE_T1": "motif_craft_divine_anvil",
  "MANTRA_V214_STRATEGY_GOVERNANCE_T3": "motif_craft_pill_cauldron",
  "MANTRA_V214_STRATEGY_GOVERNANCE_T6": "motif_puppet_heavenly_golem",
  "MANTRA_V214_SPIRIT_FEAST_HEALER": "motif_puppet_spirit_threads",
  "MANTRA_V214_JADE_MEAL_PREPARER": "motif_array_bagua_gates",
  "MANTRA_V214_CELESTIAL_ARMOR_ARTISAN": "motif_array_heaven_talisman",
  "LEG_MANTRA_SHENNONG_MYRIAD_CRUCIBLE": "motif_strategy_imperial_banner",
  "LEG_MANTRA_SOVEREIGN_HEAVEN_EDICT": "motif_strategy_golden_abacus",
  "MANTRA_V234_XIAN_01": "motif_karma_six_realms",
  "MANTRA_V234_XIAN_02": "motif_karma_asura_blade",
  "MANTRA_V234_BODY_01": "motif_specialist_astro_star",
  "MANTRA_V234_BODY_02": "motif_specialist_buddha_dharma",
  "MANTRA_V234_GOD_01": "motif_specialist_void_space",
  "MANTRA_V234_GOD_02": "motif_specialist_sonic_harmony",
  "MANTRA_V234_DEMON_01": "motif_specialist_venom_gu",
  "MANTRA_V234_DEMON_02": "motif_specialist_primordial_shifter",
  "MANTRA_V234_HEART_SOUL_01": "motif_specialist_celestial_weather",
  "MANTRA_V234_HEART_SOUL_02": "motif_specialist_wandering_dao",
  "MANTRA_V234_MECH_PUPPET_01": "motif_specialist_mercantile_dao",
  "MANTRA_V234_MECH_PUPPET_02": "motif_specialist_dragon_geomancy",
  "MANTRA_V234_KARMA_SAMSARA_01": "motif_specialist_gravity_dao",
  "MANTRA_V234_KARMA_SAMSARA_02": "motif_specialist_chrono_epoch",
  "MANTRA_V234_BEAST_SOVEREIGN_01": "motif_specialist_ink_literati",
  "MANTRA_V234_BEAST_SOVEREIGN_02": "motif_specialist_soul_puppetry",
  "MANTRA_V234_SAGE_SUPPORT_01": "motif_specialist_primordial_chaos",
  "MANTRA_V234_SAGE_SUPPORT_02": "motif_specialist_shadow_samurai",
  "MANTRA_V234_CRAFT_CREATION_01": "motif_specialist_ninpo_shadow",
  "MANTRA_V234_CRAFT_CREATION_02": "motif_specialist_ninpo_elemental",
  "MANTRA_V234_ARRAY_TALISMAN_01": "motif_specialist_divine_summoner",
  "MANTRA_V234_ARRAY_TALISMAN_02": "motif_specialist_void_heretic",
  "MANTRA_V234_STRATEGY_GOVERNANCE_01": "motif_specialist_occult_mage",
  "MANTRA_V234_STRATEGY_GOVERNANCE_02": "motif_cat_innate_subpath"
};
  SK.TIER_MOTIF_SCALE_CEILING = { 1: 0.42, 2: 0.50, 3: 0.60, 4: 0.72, 5: 0.85, 6: 0.96, 7: 1.08 };
  SK.resolveSubpathVfxMotif = (techOrMove, moveOpt) => {
    if (!techOrMove) return null;
    const id = techOrMove.tech || techOrMove.id || '';
    const tech = (g.CULT && g.CULT.tech && id) ? (g.CULT.tech(id) || techOrMove) : techOrMove;
    const tier = Math.max(1, Math.min(7, tech.tier || techOrMove.tier || (moveOpt && moveOpt.tier) || 1));
    const tierScale = SK.TIER_MOTIF_SCALE_CEILING[tier] || 0.60;
    if (SK.MANTRA_TO_VFX_MOTIF[id] && SK.SUBPATH_VFX_MOTIFS[SK.MANTRA_TO_VFX_MOTIF[id]]) {
      return Object.assign({ tier, tierScale }, SK.SUBPATH_VFX_MOTIFS[SK.MANTRA_TO_VFX_MOTIF[id]]);
    }
    const cat = String(tech.cat || techOrMove.cat || '');
    if (cat === 'INNATE_SUBPATH') return Object.assign({ tier, tierScale }, SK.SUBPATH_VFX_MOTIFS.motif_cat_innate_subpath);
    if (cat === 'INNATE_GRAND_DAO') return Object.assign({ tier, tierScale }, SK.SUBPATH_VFX_MOTIFS.motif_cat_innate_grand_dao);
    if (cat === 'LIGHTNESS_GRAND_DAO') return Object.assign({ tier, tierScale }, SK.SUBPATH_VFX_MOTIFS.motif_cat_lightness_grand_dao);
    if (cat === 'DEFENSIVE_GRAND_DAO') return Object.assign({ tier, tierScale }, SK.SUBPATH_VFX_MOTIFS.motif_cat_defensive_grand_dao);
    if (cat === 'SUPPORT_GRAND_DAO') return Object.assign({ tier, tierScale }, SK.SUBPATH_VFX_MOTIFS.motif_cat_support_grand_dao);
    if (cat === 'FORBIDDEN_GRAND_DAO') return Object.assign({ tier, tierScale }, SK.SUBPATH_VFX_MOTIFS.motif_cat_forbidden_grand_dao);
    if (cat === 'MANTRA' || cat === 'QI_MANTRA') return Object.assign({ tier, tierScale }, SK.SUBPATH_VFX_MOTIFS.motif_cat_mantra_circulation);
    const pKey = String(tech.path || techOrMove.path || '');
    const subKey = String(tech.sub || techOrMove.sub || '');
    const allMotifs = Object.values(SK.SUBPATH_VFX_MOTIFS);
    const byGroup = allMotifs.filter(m => m.group === pKey);
    if (byGroup.length) {
      let h = 0;
      const seedStr = subKey || id || pKey;
      for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
      return Object.assign({ tier, tierScale }, byGroup[h % byGroup.length]);
    }
    let h = 0;
    const seedStr = subKey || id || cat || 'XIAN';
    for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
    return Object.assign({ tier, tierScale }, allMotifs[h % allMotifs.length]);
  };

  SK.EQUIP_EFFECT_VFX_CATALOG = {
  "EFX_ARMOR_FRACTURE": {
    "id": "EFX_ARMOR_FRACTURE",
    "nameTh": "คมศาสตราทลายเกราะ",
    "primary": "#d49a78",
    "accent": "#f2d9c9",
    "anchor": "target",
    "shape": "shatter_plate",
    "shapeId": 0
  },
  "EFX_ARMOR_SHATTER": {
    "id": "EFX_ARMOR_SHATTER",
    "nameTh": "ศาสตราบดขยี้ปราการ",
    "primary": "#d98a6c",
    "accent": "#f5d2c4",
    "anchor": "target",
    "shape": "shatter_plate",
    "shapeId": 1
  },
  "EFX_BLEEDING": {
    "id": "EFX_BLEEDING",
    "nameTh": "คมมีดกรีดโลหิต",
    "primary": "#cf7882",
    "accent": "#f0c9ce",
    "anchor": "target",
    "shape": "blood_slash",
    "shapeId": 2
  },
  "EFX_BURNING": {
    "id": "EFX_BURNING",
    "nameTh": "เพลิงศาสตราเผาผลาญ",
    "primary": "#e08e68",
    "accent": "#f7d4c4",
    "anchor": "target",
    "shape": "flame_burst",
    "shapeId": 3
  },
  "EFX_BURNING_DOT": {
    "id": "EFX_BURNING_DOT",
    "nameTh": "ไฟพิษศาสตราลามทุ่ง",
    "primary": "#d97e5e",
    "accent": "#f5cec0",
    "anchor": "target",
    "shape": "flame_burst",
    "shapeId": 4
  },
  "EFX_CHILL_FREEZE": {
    "id": "EFX_CHILL_FREEZE",
    "nameTh": "ไอเย็นศาสตราแช่แข็ง",
    "primary": "#92bad6",
    "accent": "#d8eaf5",
    "anchor": "target",
    "shape": "frost_crystal",
    "shapeId": 5
  },
  "EFX_GRAVITY_QI_SEAL": {
    "id": "EFX_GRAVITY_QI_SEAL",
    "nameTh": "ศาสตราถ่วงมวลสะกดปราณ",
    "primary": "#968ab8",
    "accent": "#dad5eb",
    "anchor": "target",
    "shape": "gravity_seal",
    "shapeId": 6
  },
  "EFX_SHOCK_CONDUCTION": {
    "id": "EFX_SHOCK_CONDUCTION",
    "nameTh": "กระแสอัสนีศาสตราช็อต",
    "primary": "#9cb2e0",
    "accent": "#dce5f7",
    "anchor": "target",
    "shape": "lightning_arc",
    "shapeId": 7
  },
  "EFX_PARALYSIS_ARC": {
    "id": "EFX_PARALYSIS_ARC",
    "nameTh": "สายฟ้าศาสตราตรึงร่าง",
    "primary": "#8fa8de",
    "accent": "#d7e2f7",
    "anchor": "target",
    "shape": "lightning_arc",
    "shapeId": 8
  },
  "EFX_HEAVENLY_THUNDER_SMITE": {
    "id": "EFX_HEAVENLY_THUNDER_SMITE",
    "nameTh": "ทัณฑ์สายฟ้าศาสตราฟาด",
    "primary": "#a8beed",
    "accent": "#e1eafc",
    "anchor": "target",
    "shape": "thunder_pillar",
    "shapeId": 9
  },
  "EFX_TOXIN_INFECTION": {
    "id": "EFX_TOXIN_INFECTION",
    "nameTh": "เขี้ยวพิษศาสตรากัดกร่อน",
    "primary": "#9cc282",
    "accent": "#dceed0",
    "anchor": "target",
    "shape": "venom_drop",
    "shapeId": 10
  },
  "EFX_POISON_COAT": {
    "id": "EFX_POISON_COAT",
    "nameTh": "เคลือบพิษศาสตราเร้นลับ",
    "primary": "#8eb878",
    "accent": "#d6e8cc",
    "anchor": "target",
    "shape": "venom_drop",
    "shapeId": 11
  },
  "EFX_VITALITY_STEAL": {
    "id": "EFX_VITALITY_STEAL",
    "nameTh": "ศาสตราสูบพลังชีวิต",
    "primary": "#c97b88",
    "accent": "#edd0d5",
    "anchor": "conduit",
    "shape": "siphon_spiral",
    "shapeId": 12
  },
  "EFX_QI_SIPHON": {
    "id": "EFX_QI_SIPHON",
    "nameTh": "ศาสตราดูดกลืนปราณ",
    "primary": "#8eb8c2",
    "accent": "#d7eaee",
    "anchor": "conduit",
    "shape": "siphon_spiral",
    "shapeId": 13
  },
  "EFX_SOUL_MENTAL_ATTACK": {
    "id": "EFX_SOUL_MENTAL_ATTACK",
    "nameTh": "ศาสตราสะท้านดวงจิต",
    "primary": "#b098c9",
    "accent": "#e1d7ed",
    "anchor": "target",
    "shape": "mind_shock",
    "shapeId": 14
  },
  "EFX_SOUL_SHOCK": {
    "id": "EFX_SOUL_SHOCK",
    "nameTh": "คลื่นศาสตรากระแทกวิญญาณ",
    "primary": "#a68ec4",
    "accent": "#ded5eb",
    "anchor": "target",
    "shape": "mind_shock",
    "shapeId": 15
  },
  "EFX_MIND_CORROSION": {
    "id": "EFX_MIND_CORROSION",
    "nameTh": "ไอมารศาสตรากัดกินใจ",
    "primary": "#9e84b8",
    "accent": "#dcd0e8",
    "anchor": "target",
    "shape": "mind_shock",
    "shapeId": 16
  },
  "EFX_SILENCE_CAST": {
    "id": "EFX_SILENCE_CAST",
    "nameTh": "ศาสตราสกัดจุดใบ้คาถา",
    "primary": "#9eb5a8",
    "accent": "#dce8e1",
    "anchor": "target",
    "shape": "silence_talisman",
    "shapeId": 17
  },
  "EFX_INTERRUPT_CHANNEL": {
    "id": "EFX_INTERRUPT_CHANNEL",
    "nameTh": "ศาสตราตัดจังหวะร่าย",
    "primary": "#c4a878",
    "accent": "#ebdfc9",
    "anchor": "target",
    "shape": "silence_talisman",
    "shapeId": 18
  },
  "EFX_SUPPRESS_POSITIVE_BUFF": {
    "id": "EFX_SUPPRESS_POSITIVE_BUFF",
    "nameTh": "ศาสตราสลายพรคุ้มครอง",
    "primary": "#b896a8",
    "accent": "#e6d8df",
    "anchor": "target",
    "shape": "dispel_ring",
    "shapeId": 19
  },
  "EFX_SPATIAL_LOCK": {
    "id": "EFX_SPATIAL_LOCK",
    "nameTh": "ศาสตราตรึงมิติพันธนาการ",
    "primary": "#9a8cc2",
    "accent": "#dbd5eb",
    "anchor": "target",
    "shape": "spatial_cage",
    "shapeId": 20
  },
  "EFX_TERRAIN_BIND_TRAP": {
    "id": "EFX_TERRAIN_BIND_TRAP",
    "nameTh": "โซ่ปฐพีศาสตราตรึงเท้า",
    "primary": "#b8a286",
    "accent": "#e6dcd0",
    "anchor": "target",
    "shape": "earth_shackle",
    "shapeId": 21
  },
  "EFX_WEAPON_MAGNET_DISARM": {
    "id": "EFX_WEAPON_MAGNET_DISARM",
    "nameTh": "แม่เหล็กศาสตราดูดอาวุธ",
    "primary": "#98aec4",
    "accent": "#d8e2eb",
    "anchor": "target",
    "shape": "magnet_vortex",
    "shapeId": 22
  },
  "EFX_FORMATION_DISRUPTION": {
    "id": "EFX_FORMATION_DISRUPTION",
    "nameTh": "ศาสตราพังแกนค่ายกล",
    "primary": "#a3b59e",
    "accent": "#dde6db",
    "anchor": "target",
    "shape": "array_crack",
    "shapeId": 23
  },
  "EFX_SWORD_STORM_STRIKE": {
    "id": "EFX_SWORD_STORM_STRIKE",
    "nameTh": "พายุคมกระบี่ศาสตรา",
    "primary": "#9ac7d9",
    "accent": "#dceef5",
    "anchor": "target",
    "shape": "blade_tempest",
    "shapeId": 24
  },
  "EFX_ELEMENTAL_ANNIHILATION": {
    "id": "EFX_ELEMENTAL_ANNIHILATION",
    "nameTh": "ศาสตราธาตุถล่มทลาย",
    "primary": "#cf9678",
    "accent": "#f0d8cb",
    "anchor": "target",
    "shape": "elemental_nova",
    "shapeId": 25
  },
  "EFX_V234_MARK_IMPRINT": {
    "id": "EFX_V234_MARK_IMPRINT",
    "nameTh": "ศาสตราประทับตราวิถี",
    "primary": "#c9b47a",
    "accent": "#ede4cb",
    "anchor": "target",
    "shape": "dao_mark_brand",
    "shapeId": 26
  },
  "EFX_V234_MARK_AMPLIFIER": {
    "id": "EFX_V234_MARK_AMPLIFIER",
    "nameTh": "ศาสตราขยายตราประทับ",
    "primary": "#d4bc7c",
    "accent": "#f2e8cc",
    "anchor": "target",
    "shape": "dao_mark_brand",
    "shapeId": 27
  },
  "EFX_V234_MARK_EXECUTIONER": {
    "id": "EFX_V234_MARK_EXECUTIONER",
    "nameTh": "ศาสตราระเบิดตราประหาร",
    "primary": "#d47e84",
    "accent": "#f2cdd0",
    "anchor": "target",
    "shape": "mark_detonate",
    "shapeId": 28
  },
  "EFX_V234_ELEMENTAL_CATALYST": {
    "id": "EFX_V234_ELEMENTAL_CATALYST",
    "nameTh": "ศาสตราเร่งปฏิกิริยาธาตุ",
    "primary": "#c99c7a",
    "accent": "#eddaca",
    "anchor": "target",
    "shape": "elemental_nova",
    "shapeId": 29
  },
  "EFX_V234_ELEMENTAL_REACTOR": {
    "id": "EFX_V234_ELEMENTAL_REACTOR",
    "nameTh": "เตาปฏิกรณ์ธาตุศาสตรา",
    "primary": "#d49472",
    "accent": "#f2d7c9",
    "anchor": "target",
    "shape": "elemental_nova",
    "shapeId": 30
  },
  "EFX_V234_COMBO_MOMENTUM": {
    "id": "EFX_V234_COMBO_MOMENTUM",
    "nameTh": "ศาสตราเร่งจังหวะต่อเนื่อง",
    "primary": "#9ec7b8",
    "accent": "#dcefe8",
    "anchor": "self",
    "shape": "combo_feather",
    "shapeId": 31
  },
  "EFX_V234_STANCE_FLOW": {
    "id": "EFX_V234_STANCE_FLOW",
    "nameTh": "ศาสตราไหลลื่นเปลี่ยนกระบวนท่า",
    "primary": "#9ab8cf",
    "accent": "#dbe6f0",
    "anchor": "self",
    "shape": "stance_swirl",
    "shapeId": 32
  },
  "EFX_V200_BODHI_MERIT_PULSE": {
    "id": "EFX_V200_BODHI_MERIT_PULSE",
    "nameTh": "ประคำโพธิ์แผ่บุญบารมี",
    "primary": "#d4c285",
    "accent": "#f2ead0",
    "anchor": "self",
    "shape": "bodhi_halo",
    "shapeId": 33
  },
  "EFX_V200_ATAVISM_CLAW_REND": {
    "id": "EFX_V200_ATAVISM_CLAW_REND",
    "nameTh": "กรงเล็บสายเลือดบรรพกาลฉีก",
    "primary": "#cf8678",
    "accent": "#f0d1cb",
    "anchor": "target",
    "shape": "blood_slash",
    "shapeId": 34
  },
  "EFX_V200_MERIDIAN_VENOM_NEEDLE": {
    "id": "EFX_V200_MERIDIAN_VENOM_NEEDLE",
    "nameTh": "เข็มพิษสกัดจุดชีพจร",
    "primary": "#98bd82",
    "accent": "#d8e8ce",
    "anchor": "target",
    "shape": "venom_drop",
    "shapeId": 35
  },
  "EFX_V200_TEMPEST_FAN_GALE": {
    "id": "EFX_V200_TEMPEST_FAN_GALE",
    "nameTh": "พัดพายุโหมกระหน่ำ",
    "primary": "#98c7c2",
    "accent": "#d8efec",
    "anchor": "target",
    "shape": "wind_gale",
    "shapeId": 36
  },
  "EFX_V200_ASTROLABE_STAR_LOCK": {
    "id": "EFX_V200_ASTROLABE_STAR_LOCK",
    "nameTh": "จานดาราล็อกชะตา",
    "primary": "#9ab0d9",
    "accent": "#dbe3f5",
    "anchor": "target",
    "shape": "star_lock",
    "shapeId": 37
  },
  "EFX_V200_ABACUS_LEDGER_SETTLE": {
    "id": "EFX_V200_ABACUS_LEDGER_SETTLE",
    "nameTh": "ลูกคิดทองชำระหนี้ศึก",
    "primary": "#d6bf78",
    "accent": "#f5ebcc",
    "anchor": "target",
    "shape": "coin_burst",
    "shapeId": 38
  },
  "EFX_BLOOD_SACRIFICE_OVERDRIVE": {
    "id": "EFX_BLOOD_SACRIFICE_OVERDRIVE",
    "nameTh": "เครื่องรางสังเวยเลือดคลั่ง",
    "primary": "#d17480",
    "accent": "#f0c9ce",
    "anchor": "self",
    "shape": "blood_flame",
    "shapeId": 39
  },
  "EFX_V234_RICOCHET_CONDUCTOR": {
    "id": "EFX_V234_RICOCHET_CONDUCTOR",
    "nameTh": "ศาสตราชิ่งสะท้อนข้ามเป้า",
    "primary": "#9cb4de",
    "accent": "#dce5f7",
    "anchor": "target",
    "shape": "lightning_arc",
    "shapeId": 40
  },
  "EFX_V234_CHAIN_LIGHTNING_ARC": {
    "id": "EFX_V234_CHAIN_LIGHTNING_ARC",
    "nameTh": "โซ่อัสนีศาสตราฟาดชิ่ง",
    "primary": "#9eb8e6",
    "accent": "#dde7fa",
    "anchor": "target",
    "shape": "lightning_arc",
    "shapeId": 41
  },
  "EFX_V234_SONIC_RESONANCE_WAVE": {
    "id": "EFX_V234_SONIC_RESONANCE_WAVE",
    "nameTh": "คลื่นเสียงศาสตราก้องกังวาน",
    "primary": "#8ec7c2",
    "accent": "#d9f0ee",
    "anchor": "target",
    "shape": "sonic_ring",
    "shapeId": 42
  },
  "EFX_V234_EXECUTE_REAPER": {
    "id": "EFX_V234_EXECUTE_REAPER",
    "nameTh": "เคียวศาสตราปลิดวิญญาณ",
    "primary": "#c97482",
    "accent": "#edc9cf",
    "anchor": "target",
    "shape": "reaper_crescent",
    "shapeId": 43
  },
  "EFX_V234_BUFF_STEALER": {
    "id": "EFX_V234_BUFF_STEALER",
    "nameTh": "ศาสตราช่วงชิงพรศัตรู",
    "primary": "#b594c4",
    "accent": "#e4d7eb",
    "anchor": "conduit",
    "shape": "siphon_spiral",
    "shapeId": 44
  },
  "EFX_V234_DEBUFF_EXTENDER": {
    "id": "EFX_V234_DEBUFF_EXTENDER",
    "nameTh": "ศาสตราตรึงคำสาปยืดเยื้อ",
    "primary": "#9e88b5",
    "accent": "#dcd3e6",
    "anchor": "target",
    "shape": "curse_chain",
    "shapeId": 45
  },
  "EFX_V234_DOT_TRANSMUTER": {
    "id": "EFX_V234_DOT_TRANSMUTER",
    "nameTh": "เกราะแปรพิษเป็นโล่ปราณ",
    "primary": "#8fc29a",
    "accent": "#d9ede0",
    "anchor": "self",
    "shape": "jade_aegis",
    "shapeId": 46
  },
  "EFX_V234_OVERDRIVE_SURGE": {
    "id": "EFX_V234_OVERDRIVE_SURGE",
    "nameTh": "เครื่องรางปะทุพลังรบ",
    "primary": "#d99872",
    "accent": "#f5d9c9",
    "anchor": "self",
    "shape": "surge_pillar",
    "shapeId": 47
  },
  "EFX_V234_KARMIC_THREAD_BIND": {
    "id": "EFX_V234_KARMIC_THREAD_BIND",
    "nameTh": "ด้ายวิบากกรรมศาสตรารัดตรึง",
    "primary": "#ba96c4",
    "accent": "#e6d8eb",
    "anchor": "target",
    "shape": "curse_chain",
    "shapeId": 48
  },
  "EFX_RECON_SIGNAL_JAM": {
    "id": "EFX_RECON_SIGNAL_JAM",
    "nameTh": "เครื่องรางรบกวนสัมผัส",
    "primary": "#94a3b3",
    "accent": "#d8dee6",
    "anchor": "target",
    "shape": "mist_shroud",
    "shapeId": 49
  },
  "EFX_VEIN_ANCHORED": {
    "id": "EFX_VEIN_ANCHORED",
    "nameTh": "หยกเชื่อมชีพจรดินฟื้นฟู",
    "primary": "#92c4a0",
    "accent": "#daf0e0",
    "anchor": "self",
    "shape": "lotus_heal",
    "shapeId": 50
  },
  "EFX_REGEN_AURA": {
    "id": "EFX_REGEN_AURA",
    "nameTh": "รัศมีหยกฟื้นฟูลมปราณ",
    "primary": "#8ec7a8",
    "accent": "#d9f0e3",
    "anchor": "self",
    "shape": "lotus_heal",
    "shapeId": 51
  },
  "EFX_BARRIER_SHIELD": {
    "id": "EFX_BARRIER_SHIELD",
    "nameTh": "เกราะปราณคุ้มกายทำงาน",
    "primary": "#96c7cf",
    "accent": "#d8ecf0",
    "anchor": "self",
    "shape": "jade_aegis",
    "shapeId": 52
  },
  "EFX_TIMED_PARRY": {
    "id": "EFX_TIMED_PARRY",
    "nameTh": "เกราะปัดป้องคมศาสตรา",
    "primary": "#c9b882",
    "accent": "#ede6cf",
    "anchor": "self",
    "shape": "jade_aegis",
    "shapeId": 53
  },
  "EFX_STRUCTURAL_IMMUNITY_FLOOR": {
    "id": "EFX_STRUCTURAL_IMMUNITY_FLOOR",
    "nameTh": "เกราะรากฐานคงกระพัน",
    "primary": "#bdab88",
    "accent": "#e8e0d2",
    "anchor": "self",
    "shape": "jade_aegis",
    "shapeId": 54
  },
  "EFX_REALM_SUPPRESSION_GUARD": {
    "id": "EFX_REALM_SUPPRESSION_GUARD",
    "nameTh": "เครื่องรางต้านแรงกดดันขั้น",
    "primary": "#b0b8cf",
    "accent": "#e1e5f0",
    "anchor": "self",
    "shape": "jade_aegis",
    "shapeId": 55
  },
  "EFX_V234_AEGIS_COUNTER_PULSE": {
    "id": "EFX_V234_AEGIS_COUNTER_PULSE",
    "nameTh": "เกราะสะท้อนคลื่นกระแทก",
    "primary": "#9ab8d4",
    "accent": "#dbe7f2",
    "anchor": "self",
    "shape": "reflect_mirror",
    "shapeId": 56
  },
  "EFX_V234_EMERGENCY_AEGIS": {
    "id": "EFX_V234_EMERGENCY_AEGIS",
    "nameTh": "ปราการฉุกเฉินสะท้อนศึก",
    "primary": "#92bfd4",
    "accent": "#daebf2",
    "anchor": "self",
    "shape": "reflect_mirror",
    "shapeId": 57
  },
  "EFX_FINAL_STAND_SHIELD": {
    "id": "EFX_FINAL_STAND_SHIELD",
    "nameTh": "โล่ปราณยืนหยัดเฮือกสุดท้าย",
    "primary": "#d4b878",
    "accent": "#f2e6cb",
    "anchor": "self",
    "shape": "jade_aegis",
    "shapeId": 58
  },
  "EFX_DAMAGE_REFLECT": {
    "id": "EFX_DAMAGE_REFLECT",
    "nameTh": "หนามเกราะสะท้อนความเสียหาย",
    "primary": "#c98e7e",
    "accent": "#edd4ce",
    "anchor": "target",
    "shape": "reflect_mirror",
    "shapeId": 59
  },
  "EFX_ILLUSION_DECOY": {
    "id": "EFX_ILLUSION_DECOY",
    "nameTh": "เครื่องรางสร้างร่างมายาลวง",
    "primary": "#ad98c4",
    "accent": "#e1d8eb",
    "anchor": "self",
    "shape": "mist_shroud",
    "shapeId": 60
  },
  "EFX_V234_VOID_BLINK_ESCAPE": {
    "id": "EFX_V234_VOID_BLINK_ESCAPE",
    "nameTh": "หยกเร้นมิติหลบหลีกฉับพลัน",
    "primary": "#9e8ec4",
    "accent": "#ded7eb",
    "anchor": "self",
    "shape": "spatial_cage",
    "shapeId": 61
  },
  "EFX_TRINITY_RELIC_SURGE": {
    "id": "EFX_TRINITY_RELIC_SURGE",
    "nameTh": "ปราณไตรรัตนะเทวศาสตราบรรพกาล",
    "primary": "#ffd166",
    "accent": "#fff3c4",
    "anchor": "target",
    "shape": "trinity_surge",
    "shapeId": 62
  },
  "EFX_EQUIP_GRANTED_SKILL": {
    "id": "EFX_EQUIP_GRANTED_SKILL",
    "nameTh": "สำแดงวิชาประจำศาสตราคู่กาย",
    "primary": "#9fd2e3",
    "accent": "#e0f4f8",
    "anchor": "target",
    "shape": "blade_tempest",
    "shapeId": 63
  }
};
  SK.EQUIP_EFFECT_VFX_ALIASES = {
  "EFX_STEALTH_CONCEALMENT": "EFX_ILLUSION_DECOY",
  "EFX_SIDESTEP_EVASION": "EFX_V234_VOID_BLINK_ESCAPE",
  "EFX_ILLUSION_MIST_MAZE": "EFX_ILLUSION_DECOY",
  "EFX_GUARDED_DAMAGE_SHARE": "EFX_BARRIER_SHIELD",
  "EFX_V234_SOUL_TETHER_WARD": "EFX_BARRIER_SHIELD",
  "EFX_V234_TETHER_GUARD": "EFX_BARRIER_SHIELD",
  "EFX_V234_STATUS_ABSORB_ARMOR": "EFX_V234_DOT_TRANSMUTER",
  "EFX_EMERGENCY_BEACON": "EFX_FINAL_STAND_SHIELD",
  "EFX_PURIFY_HOSTILE_STATUS": "EFX_VEIN_ANCHORED",
  "EFX_MERIDIAN_TOXIN_PURGE": "EFX_VEIN_ANCHORED",
  "EFX_MASS_VITAL_HEAL": "EFX_REGEN_AURA",
  "EFX_SCENT_TRACE_BREAK": "EFX_ILLUSION_DECOY",
  "EFX_BEAST_BOND_CHANNEL": "EFX_V234_OVERDRIVE_SURGE",
  "EFX_CULTIVATION_ACCELERATOR": "EFX_REGEN_AURA",
  "EFX_QI_PURITY_REFINEMENT": "EFX_REGEN_AURA",
  "EFX_HEART_DEMON_WARD": "EFX_V200_BODHI_MERIT_PULSE",
  "EFX_LEARNING_INSIGHT": "EFX_V200_BODHI_MERIT_PULSE"
};
  SK.resolveEquipEffectVfx = (effectOrSetId, triggerKind) => {
    if (!effectOrSetId) return null;
    const key = SK.EQUIP_EFFECT_VFX_CATALOG[effectOrSetId] ? effectOrSetId : SK.EQUIP_EFFECT_VFX_ALIASES[effectOrSetId];
    if (key && SK.EQUIP_EFFECT_VFX_CATALOG[key]) return SK.EQUIP_EFFECT_VFX_CATALOG[key];
    if (String(effectOrSetId).startsWith('RES_')) {
      const keys = Object.keys(SK.EQUIP_EFFECT_VFX_CATALOG);
      let h = 0;
      for (let i = 0; i < effectOrSetId.length; i++) h = (h * 33 + effectOrSetId.charCodeAt(i)) >>> 0;
      const base = SK.EQUIP_EFFECT_VFX_CATALOG[keys[h % keys.length]];
      return Object.assign({}, base, { id: effectOrSetId, anchor: triggerKind === 'self' ? 'self' : base.anchor });
    }
    return null;
  };

  SK.COMBAT_ACTION_VFX_CATALOG = {
  "FINISHER_XIAN": {
    "id": "FINISHER_XIAN",
    "nameTh": "ท่าไม้ตายเกจวิถีเซียน: กระบี่สวรรค์พิพากษา",
    "primary": "#9fd2e3",
    "accent": "#e0f4f8",
    "anchor": "target",
    "shape": "finisher_sword_pillar",
    "shapeId": 0
  },
  "FINISHER_BODY": {
    "id": "FINISHER_BODY",
    "nameTh": "ท่าไม้ตายเกจวิถีกายา: หมัดวัชระถล่มพิภพ",
    "primary": "#d6b87c",
    "accent": "#f5e8c8",
    "anchor": "target",
    "shape": "finisher_fist_meteor",
    "shapeId": 1
  },
  "FINISHER_GOD": {
    "id": "FINISHER_GOD",
    "nameTh": "ท่าไม้ตายเกจวิถีเทวะ: ทัณฑ์เทวราชสุริยัน",
    "primary": "#dec078",
    "accent": "#f7ebd0",
    "anchor": "target",
    "shape": "finisher_sun_spear",
    "shapeId": 2
  },
  "FINISHER_DEMON": {
    "id": "FINISHER_DEMON",
    "nameTh": "ท่าไม้ตายเกจวิถีมาร: อเวจีโลหิตกลืนสวรรค์",
    "primary": "#d17b88",
    "accent": "#f2ccd2",
    "anchor": "target",
    "shape": "finisher_blood_maw",
    "shapeId": 3
  },
  "FINISHER_HEART_SOUL": {
    "id": "FINISHER_HEART_SOUL",
    "nameTh": "ท่าไม้ตายเกจวิถีจิต: มหาคีตาสุญตาสะท้านภพ",
    "primary": "#baa3d4",
    "accent": "#e6dcf2",
    "anchor": "target",
    "shape": "finisher_soul_lotus",
    "shapeId": 4
  },
  "FINISHER_BEAST_SOVEREIGN": {
    "id": "FINISHER_BEAST_SOVEREIGN",
    "nameTh": "ท่าไม้ตายเกจวิถีอสูร: จตุรเทพราชันย์ขย้ำฟ้า",
    "primary": "#c99e7a",
    "accent": "#f0decb",
    "anchor": "target",
    "shape": "finisher_beast_fang",
    "shapeId": 5
  },
  "FINISHER_SAGE_SUPPORT": {
    "id": "FINISHER_SAGE_SUPPORT",
    "nameTh": "ท่าไม้ตายเกจวิถีปราชญ์: น้ำอมฤตชุบชีวาหมื่นบุปผา",
    "primary": "#8fc79a",
    "accent": "#d9f0de",
    "anchor": "target",
    "shape": "finisher_sage_gourd",
    "shapeId": 6
  },
  "FINISHER_CRAFT_CREATION": {
    "id": "FINISHER_CRAFT_CREATION",
    "nameTh": "ท่าไม้ตายเกจวิถีช่าง: เตาหลอมสวรรค์เก้าสุริยัน",
    "primary": "#e08e6d",
    "accent": "#f7d5c6",
    "anchor": "target",
    "shape": "finisher_forge_cauldron",
    "shapeId": 7
  },
  "FINISHER_MECH_PUPPET": {
    "id": "FINISHER_MECH_PUPPET",
    "nameTh": "ท่าไม้ตายเกจวิถีหุ่นกล: ปืนใหญ่กลไกถล่มดารา",
    "primary": "#b8a896",
    "accent": "#e8e0d8",
    "anchor": "target",
    "shape": "finisher_mech_barrage",
    "shapeId": 8
  },
  "FINISHER_ARRAY_TALISMAN": {
    "id": "FINISHER_ARRAY_TALISMAN",
    "nameTh": "ท่าไม้ตายเกจวิถีค่ายกล: มหาค่ายกลแปดทิศพิฆาต",
    "primary": "#a3bfa8",
    "accent": "#dce8de",
    "anchor": "target",
    "shape": "finisher_bagua_array",
    "shapeId": 9
  },
  "FINISHER_STRATEGY_GOVERNANCE": {
    "id": "FINISHER_STRATEGY_GOVERNANCE",
    "nameTh": "ท่าไม้ตายเกจวิถีพิชัยสงคราม: โองการจักรพรรดิเคลื่อนทัพ",
    "primary": "#d4bc7d",
    "accent": "#f2e8cc",
    "anchor": "target",
    "shape": "finisher_imperial_decree",
    "shapeId": 10
  },
  "FINISHER_KARMA_SAMSARA": {
    "id": "FINISHER_KARMA_SAMSARA",
    "nameTh": "ท่าไม้ตายเกจวิถีสังสารวัฏ: กงล้อหกภพพิพากษาวิบาก",
    "primary": "#c4a3cf",
    "accent": "#eadcf0",
    "anchor": "target",
    "shape": "finisher_samsara_wheel",
    "shapeId": 11
  },
  "FINISHER_SPECIALIST": {
    "id": "FINISHER_SPECIALIST",
    "nameTh": "ท่าไม้ตายเกจวิถีพิเศษ: มรรคาบรรพกาลสำแดงเดช",
    "primary": "#a594c9",
    "accent": "#e0d8f0",
    "anchor": "target",
    "shape": "finisher_dao_singularity",
    "shapeId": 12
  },
  "DUET_RESONANCE_STRIKE": {
    "id": "DUET_RESONANCE_STRIKE",
    "nameTh": "วิชาประสานคู่บุญ (Duet Resonance)",
    "primary": "#f2a6c2",
    "accent": "#fce4ec",
    "anchor": "conduit",
    "shape": "duet_twin_phoenix",
    "shapeId": 13
  },
  "CHARGED_SKILL_RELEASE": {
    "id": "CHARGED_SKILL_RELEASE",
    "nameTh": "ปลดปล่อยพลังชาร์จขั้นสุด (Charged Release)",
    "primary": "#e3a868",
    "accent": "#faebd7",
    "anchor": "target",
    "shape": "charged_nova_wave",
    "shapeId": 14
  },
  "ELEMENTAL_REACTION_BURST": {
    "id": "ELEMENTAL_REACTION_BURST",
    "nameTh": "ปฏิกิริยาธาตุปะทุ (Elemental Reaction)",
    "primary": "#d98a6c",
    "accent": "#f7dcd0",
    "anchor": "target",
    "shape": "reaction_elemental_cross",
    "shapeId": 15
  },
  "MARK_DETONATION_BURST": {
    "id": "MARK_DETONATION_BURST",
    "nameTh": "ระเบิดตราประทับสังหาร (Mark Detonation)",
    "primary": "#cf7882",
    "accent": "#f5ccd0",
    "anchor": "target",
    "shape": "mark_seal_shatter",
    "shapeId": 16
  },
  "ACUPOINT_SEAL_STRIKE": {
    "id": "ACUPOINT_SEAL_STRIKE",
    "nameTh": "ดัชนีสกัดจุดตาย (Acupoint Strike)",
    "primary": "#d4bf7a",
    "accent": "#f5eccd",
    "anchor": "target",
    "shape": "acupoint_star_pin",
    "shapeId": 17
  },
  "MANTRA_SOLAR_FURNACE_BURN": {
    "id": "MANTRA_SOLAR_FURNACE_BURN",
    "nameTh": "ปราณเตาหลอมสุริยันแผดเผา",
    "primary": "#e08e68",
    "accent": "#f7d5c4",
    "anchor": "target",
    "shape": "mantra_solar_flare",
    "shapeId": 18
  },
  "MANTRA_NETHER_VORTEX_SIPHON": {
    "id": "MANTRA_NETHER_VORTEX_SIPHON",
    "nameTh": "วังวนมารสูบปราณและโลหิต",
    "primary": "#b87890",
    "accent": "#ebd0da",
    "anchor": "conduit",
    "shape": "mantra_nether_spiral",
    "shapeId": 19
  },
  "MANTRA_EVERGREEN_SPRING_HEAL": {
    "id": "MANTRA_EVERGREEN_SPRING_HEAL",
    "nameTh": "น้ำพุพฤกษาฟื้นฟูชีพจร",
    "primary": "#8ec79a",
    "accent": "#d9f0de",
    "anchor": "self",
    "shape": "mantra_spring_lotus",
    "shapeId": 20
  },
  "MANTRA_VAJRA_BELL_REFLECT": {
    "id": "MANTRA_VAJRA_BELL_REFLECT",
    "nameTh": "ระฆังทองวัชระสะท้อนศึก",
    "primary": "#d6b87c",
    "accent": "#f5e8c8",
    "anchor": "self",
    "shape": "mantra_vajra_bell",
    "shapeId": 21
  },
  "MANTRA_FROST_MIRROR_SHIELD": {
    "id": "MANTRA_FROST_MIRROR_SHIELD",
    "nameTh": "เกราะกระจกเหมันต์คุ้มกาย",
    "primary": "#98c2d9",
    "accent": "#daebf5",
    "anchor": "self",
    "shape": "mantra_frost_mirror",
    "shapeId": 22
  },
  "MANTRA_SWORD_QI_COUNTER": {
    "id": "MANTRA_SWORD_QI_COUNTER",
    "nameTh": "ปราณกระบี่คุ้มกายสวนกลับ",
    "primary": "#9fd2e3",
    "accent": "#e0f4f8",
    "anchor": "target",
    "shape": "mantra_sword_counter",
    "shapeId": 23
  },
  "DEF_ALLY_AEGIS_INTERCEPT": {
    "id": "DEF_ALLY_AEGIS_INTERCEPT",
    "nameTh": "ม่านสวรรค์รับเคราะห์แทนสหาย",
    "primary": "#d4c285",
    "accent": "#f2ead0",
    "anchor": "conduit",
    "shape": "def_ally_aegis",
    "shapeId": 24
  },
  "DEF_TAIJI_REDIRECT": {
    "id": "DEF_TAIJI_REDIRECT",
    "nameTh": "ปราณอ่อนไท่เก๊กยืมแรงสะท้อนกลับ",
    "primary": "#b5c2d9",
    "accent": "#e8edf5",
    "anchor": "target",
    "shape": "def_taiji_redirect",
    "shapeId": 25
  },
  "DEF_COUNTER_SLASH": {
    "id": "DEF_COUNTER_SLASH",
    "nameTh": "วิชาคุ้มกายปัดป้องสวนกลับ",
    "primary": "#c9b07a",
    "accent": "#ede2ca",
    "anchor": "target",
    "shape": "def_counter_arc",
    "shapeId": 26
  },
  "DEF_CICADA_MOLT_SAVE": {
    "id": "DEF_CICADA_MOLT_SAVE",
    "nameTh": "จักจั่นทองลอกคราบเร้นเงา",
    "primary": "#a8d5c2",
    "accent": "#e2f4ec",
    "anchor": "self",
    "shape": "def_cicada_molt",
    "shapeId": 27
  },
  "SUP_COMMAND_BUFF": {
    "id": "SUP_COMMAND_BUFF",
    "nameTh": "ค่ายกลวิชาหนุนปลุกขวัญศึก",
    "primary": "#d4bc7d",
    "accent": "#f2e8cc",
    "anchor": "self",
    "shape": "sup_banner_aura",
    "shapeId": 28
  },
  "SUP_SANCTUARY_HEAL": {
    "id": "SUP_SANCTUARY_HEAL",
    "nameTh": "วิชาหนุนสมานชีพจรพันธมิตร",
    "primary": "#8fc79a",
    "accent": "#d9f0de",
    "anchor": "self",
    "shape": "sup_lotus_wave",
    "shapeId": 29
  },
  "FORB_TABOO_STRIKE": {
    "id": "FORB_TABOO_STRIKE",
    "nameTh": "สำแดงวิชาต้องห้ามสังเวยโลหิต",
    "primary": "#cf7486",
    "accent": "#f2c9d1",
    "anchor": "target",
    "shape": "forb_blood_lance",
    "shapeId": 30
  },
  "FORB_DESPERATION_NOVA": {
    "id": "FORB_DESPERATION_NOVA",
    "nameTh": "ระเบิดมหาวิชาต้องห้ามฝืนชะตาสวรรค์",
    "primary": "#b86882",
    "accent": "#ebd0d9",
    "anchor": "self",
    "shape": "forb_desperation_nova",
    "shapeId": 31
  },
  "PET_GUARDIAN_INTERCEPT": {
    "id": "PET_GUARDIAN_INTERCEPT",
    "nameTh": "อสูรคู่สัญญาออกรับคมดาบแทนนาย",
    "primary": "#72efdd",
    "accent": "#d8f8f3",
    "anchor": "self",
    "shape": "pet_tortoise_shield",
    "shapeId": 32
  },
  "SAMURAI_PARRY_COUNTER": {
    "id": "SAMURAI_PARRY_COUNTER",
    "nameTh": "อิไอปัดป้องสะท้อนคมดาบพริบตา",
    "primary": "#d47f88",
    "accent": "#f2cdd1",
    "anchor": "target",
    "shape": "samurai_parry_flash",
    "shapeId": 33
  },
  "SHADOW_CLONE_INTERCEPT": {
    "id": "SHADOW_CLONE_INTERCEPT",
    "nameTh": "ร่างแยกเงามายารับเคราะห์แทน",
    "primary": "#9e8fb8",
    "accent": "#ded7eb",
    "anchor": "self",
    "shape": "shadow_clone_puff",
    "shapeId": 34
  },
  "WOOD_SUBSTITUTION_SAVE": {
    "id": "WOOD_SUBSTITUTION_SAVE",
    "nameTh": "สลับร่างท่อนไม้หนีตายพริบตา",
    "primary": "#9ab888",
    "accent": "#dbe6d4",
    "anchor": "self",
    "shape": "wood_log_swap",
    "shapeId": 35
  }
};
  SK.resolveCombatActionVfx = (actionKind, meta) => {
    if (!actionKind) return null;
    if (SK.COMBAT_ACTION_VFX_CATALOG[actionKind]) return SK.COMBAT_ACTION_VFX_CATALOG[actionKind];
    if (actionKind === 'PATH_GAUGE_FINISHER') {
      const pKey = (meta && meta.path) || 'XIAN';
      return SK.COMBAT_ACTION_VFX_CATALOG['FINISHER_' + pKey] || SK.COMBAT_ACTION_VFX_CATALOG.FINISHER_SPECIALIST;
    }
    return null;
  };

  g.SK = SK;
  if (typeof module === 'object' && module.exports) module.exports = SK;
})(typeof globalThis !== 'undefined' ? globalThis : this);
