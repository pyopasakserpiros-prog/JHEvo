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
    voidPhase: { nameTh: 'เร้นมิติสุญตา', icon: '🌀', isBuff: true, pmods: { eva: .30, matk: .14 }, mods: { move: 18, pen: 14 } }
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
      composable: m.composable || t.composable || null,
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
    const A = SK.ARCH[arch], tier = t.tier, tierMult = 1 + 0.12 * (tier - 1) + 0.0006 * ((t.power || 40) - 40 * tier * 0.8 > 0 ? 0 : 0);
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
    prof.weaponTypes = t.weaponTypes; prof.armorTypes = t.armorTypes; prof.requiresWeapon = t.requiresWeapon;
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
    return A.icon + ' ' + A.nameTh + ' · ' + (p.type === 'p' ? 'กายภาพ' : 'วิชา') + ' · ธาตุ' + p.elemTh + ' — ' + bits.join(' · ');
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
    if (t.innateOnly) {
      if (!(g.MARTIAL && g.MARTIAL.isInnateActive && g.MARTIAL.isInnateActive(n, t))) return false;
    } else {
      const activeTechs = g.MARTIAL && g.MARTIAL.activeTechs ? g.MARTIAL.activeTechs(n) : n.cult.techs;
      const owned = activeTechs.includes(t.id) || n.cult.mantra === t.id;
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
    const c = n.cult, tl = c.techs ? c.techs.length : 0, t0 = tl ? c.techs[0] : '', tL = tl ? c.techs[tl - 1] : '';
    const eq = n.equip || {};
    const eqKey = ((eq.WEAPON && (eq.WEAPON.uid || eq.WEAPON.id) && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(n, eq.WEAPON))) ? (eq.WEAPON.uid || eq.WEAPON.id) : '') + '|' +
                  ((eq.ARMOR && (eq.ARMOR.uid || eq.ARMOR.id) && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(n, eq.ARMOR))) ? (eq.ARMOR.uid || eq.ARMOR.id) : '') + '|' +
                  ((eq.ACCESSORY && (eq.ACCESSORY.uid || eq.ACCESSORY.id) && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(n, eq.ACCESSORY))) ? (eq.ACCESSORY.uid || eq.ACCESSORY.id) : '');
    const slc = n._skListCache;
    if (slc && slc.path === c.path && slc.sub === c.sub && slc.st === c.stage && slc.mantra === c.mantra && slc.tl === tl && slc.t0 === t0 && slc.tL === tL && slc.eqKey === eqKey && slc.ver === (n._passVer || 0)) {
      return slc.out;
    }
    const activeIds = (g.MARTIAL ? g.MARTIAL.activeTechs(n) : n.cult.techs).slice();
    if (g.MARTIAL && g.MARTIAL.activeInnateTechs) {
      for (const innId of g.MARTIAL.activeInnateTechs(n)) {
        if (!activeIds.includes(innId)) activeIds.push(innId);
      }
    }
    if (n.cult.mantra) {
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
        const moves = isGranted ? SK.allMoves(t).slice(0, 2) : SK.unlockedMoves(n, t);
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
    n._skListCache = { path: c.path, sub: c.sub, st: c.stage, mantra: c.mantra, tl, t0, tL, eqKey, ver: n._passVer || 0, out };
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

  /* ศัตรู: สร้างชุดวิชาแบบเรียบง่ายตามชนิด/ระดับ */
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
      const A = SK.ARCH[arch], cd = A.cd, tm = 1 + 0.12 * (tier - 1);
      const p = Object.assign({
        id: 'F_' + arch + '_' + nameTh, nameTh, tier, arch, archTh: A.nameTh,
        icon: A.icon, type, cd, wind: A.wind, hits: A.hits,
        M: Math.round((A.hits ? A.e * (cd / 4) / A.hits * tm : 0) * 100) / 100,
        costPct: 0, pen: A.penAdd || 0, aoe: !!A.aoe, steal: A.steal || 0,
        dot: A.dot ? A.dot * (cd / 4) * tm : 0, recoil: 0, self: !!A.self, moves: []
      }, extra || {});
      // Beast species elements flow into the actual generated technique profile.
      if (resolvedProfile) p.elementProfile = resolvedProfile;
      p.summary = SK.summary(p);
      return p;
    };
    const t = u.tier || 1, L = [];
    if (u.kind === 'beast') {
      L.push(mk(t >= 2 ? 'flurry' : 'strike', 'ตะปบกัดฉีก', t, 'p'));
      if (t >= 2) L.push(mk('dot', 'เขี้ยวพิษ', t, 'p', { dotKind: 'poison' }));
      if (t >= 3) L.push(mk('control', 'คำรามสะท้านใจ', t, 'm', { ctrl: 'stun' }));
      if (t >= 4) L.push(mk('burst', 'พลังอสูรปะทุ', t, 'm'));
    } else {
      L.push(mk('strike', 'ฟันหนัก', t, 'p'));
      if (t >= 2) L.push(mk('pierce', 'แทงเจาะเกราะ', t, 'p'));
      if (t >= 3) L.push(mk('sweep', 'กวาดวงกว้าง', t, 'p'));
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

  SK.weaponTacticalProfile = u => {
    if (!u || u.foe) {
      return { weaponType: 'FIST', reachClass: 'SHORT_SWIFT', engageRange: 1.7, isHeavyFist: false, hasLightness: false, hasDefenseTech: false, spec: SK.WEAPON_TACTICS.FIST };
    }
    const wType = (g.MARTIAL && g.MARTIAL.equippedType) ? g.MARTIAL.equippedType(u) : 'FIST';
    const sub = u.cult ? u.cult.sub : 'NONE';
    const path = u.cult ? u.cult.path : 'NONE';
    const isHeavyFist = wType === 'FIST' && (path === 'BODY' || SK.HEAVY_FIST_SUBPATHS.includes(sub));
    const baseSpec = SK.WEAPON_TACTICS[wType] || SK.WEAPON_TACTICS.FIST;
    const reachClass = isHeavyFist ? 'HEAVY_BREAKER' : baseSpec.reachClass;
    const hasLightness = SK.hasLightnessOrGapCloser(u);
    const hasDefenseTech = SK.hasDefensiveTech(u);
    return {
      weaponType: wType,
      reachClass,
      engageRange: baseSpec.engageRange || 1.7,
      isHeavyFist,
      hasLightness,
      hasDefenseTech,
      nameTh: isHeavyFist ? 'หมัดวัชระทลายปราการ' : baseSpec.nameTh,
      stanceTh: isHeavyFist ? 'หมัดหนักทลายโล่และเกราะคุ้มกาย' : baseSpec.stanceTh,
      counteredByTh: baseSpec.counteredByTh,
      descTh: baseSpec.descTh,
      spec: baseSpec
    };
  };

  /* ---------- Composable Effect & Keyword Authority (v2.0.34) ---------- */
  SK.COMPOSABLE_KEYWORDS = Object.freeze({
    TRIGGERS: Object.freeze([
      'ON_CAST', 'ON_HIT', 'ON_CRIT', 'ON_STRUCK', 'ON_DODGE', 'ON_PARRY',
      'ON_KILL', 'ON_HEAL', 'ON_SHIELD_BREAK', 'ON_STATUS_APPLY',
      'ON_LOW_HP', 'ON_STANCE_SWITCH', 'COMBAT_TICK',
      'OUT_OF_COMBAT_CULTIVATE', 'OUT_OF_COMBAT_CRAFT', 'OUT_OF_COMBAT_EXPLORE',
      'onHit', 'onStruck', 'combatTick', 'onCrit', 'onDodge', 'onKill', 'onHeal', 'onShieldBreak', 'onLowHp'
    ]),
    TARGET_SELECTORS: Object.freeze([
      'SELF', 'SINGLE_ENEMY', 'LOWEST_HP_ENEMY', 'HIGHEST_ATK_ENEMY',
      'MARKED_ENEMIES', 'SPLASH_NEIGHBORS', 'RICOCHET_CHAIN', 'PIERCE_LINE',
      'ALL_ALLIES', 'LOWEST_HP_ALLY', 'SAME_PATH_ALLIES', 'SUMMON_OR_PUPPET'
    ]),
    CONDITIONS: Object.freeze([
      'ALWAYS', 'TARGET_HAS_MARK', 'TARGET_HAS_DEBUFF', 'TARGET_HAS_BUFF',
      'TARGET_HP_BELOW_PCT', 'TARGET_HP_ABOVE_PCT', 'SELF_HP_BELOW_PCT',
      'SELF_QI_ABOVE_PCT', 'SELF_HAS_STANCE', 'SELF_HAS_COMBO_READY',
      'SELF_HAS_TOXICITY', 'SAME_PEAK_ALLY_PRESENT', 'ELEMENT_RESONANCE_ACTIVE'
    ]),
    ACTIONS: Object.freeze([
      'APPLY_MARK', 'DETONATE_MARK', 'STACK_THRESHOLD_BURST',
      'STANCE_ENTER', 'COMBO_PRIMER', 'COMBO_FINISHER', 'DELAYED_ECHO',
      'EXTEND_DEBUFF', 'TRANSFER_DEBUFF', 'STEAL_BUFF', 'CONVERT_BUFF_TO_DEBUFF',
      'ABSORB_DOT_TO_SHIELD', 'ELEMENTAL_FUSION_REACTION',
      'HP_TO_QI_OVERDRIVE', 'QI_TO_SHIELD_BARRIER', 'OVERHEAT_COOLDOWN_TRADE',
      'TOXICITY_TO_VENOM_POWER', 'HEART_DEMON_EDGE_SCALING',
      'SOUL_LINK_SHARE_DMG', 'CHAIN_TETHER_ENEMY', 'PUPPET_SYMBIOSIS_PULSE',
      'GRANT_BUFF', 'RESTORE_QI_PCT', 'SHATTER_SHIELD', 'BONUS_TRUE_DMG'
    ]),
    MARK_KINDS: Object.freeze(['daoMark', 'starSeal', 'venomSeed', 'bloodBrand'])
  });

  SK.validateComposableSpec = spec => {
    if (!spec || typeof spec !== 'object') return { ok: true, errors: [] };
    const errs = [];
    const KW = SK.COMPOSABLE_KEYWORDS;
    const CE = (g.COMBAT && g.COMBAT.COMPOSABLE_ENGINE) || {};
    const validStances = CE.STANCE_CATALOG ? Object.keys(CE.STANCE_CATALOG) : [
      'STAR_SWORD_STANCE', 'VAJRA_BASTION_STANCE', 'SHADOW_REAPER_STANCE',
      'LOTUS_MERCY_STANCE', 'THUNDER_STEP_STANCE', 'BLOOD_ASURA_STANCE', 'QIMEN_ARRAY_STANCE'
    ];
    const validFusions = CE.FUSION_REACTIONS ? Object.keys(CE.FUSION_REACTIONS) : [
      'INFERNO_VORTEX', 'OVERLOAD_BLAST', 'SUPERCONDUCT_SHATTER', 'GLACIAL_SHATTER',
      'MIASMA_DETONATION', 'GU_FIRE_ERUPTION', 'BLOOD_BOIL_RUPTURE', 'STARFALL_COLLAPSE', 'KARMIC_PURIFICATION_SMITE'
    ];
    const checkMoveOrSpec = (obj, label) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.arch && !SK.ARCH[obj.arch]) errs.push(label + ': Unknown arch ' + obj.arch);
      if (obj.rider && !SK.STATUS[obj.rider]) errs.push(label + ': Unknown rider status ' + obj.rider);
      if (obj.sx && obj.sx.k && !SK.STATUS[obj.sx.k]) errs.push(label + ': Unknown sx.k status ' + obj.sx.k);
      if (obj.grantBuff && !SK.STATUS[obj.grantBuff] && !(g.STATS && g.STATS.BUFF_CATALOG && g.STATS.BUFF_CATALOG[obj.grantBuff])) {
        errs.push(label + ': Unknown grantBuff ' + obj.grantBuff);
      }
      if (obj.trigger && !KW.TRIGGERS.includes(obj.trigger)) errs.push(label + ': Unknown composable trigger ' + obj.trigger);
      if (obj.targetSelector && !KW.TARGET_SELECTORS.includes(obj.targetSelector)) errs.push(label + ': Unknown composable targetSelector ' + obj.targetSelector);
      if (obj.condition && typeof obj.condition === 'string' && !KW.CONDITIONS.includes(obj.condition)) errs.push(label + ': Unknown composable condition ' + obj.condition);
      if (obj.condition && typeof obj.condition === 'object' && obj.condition.kind && !KW.CONDITIONS.includes(obj.condition.kind)) errs.push(label + ': Unknown composable condition.kind ' + obj.condition.kind);
      if (obj.action && !KW.ACTIONS.includes(obj.action)) errs.push(label + ': Unknown composable action ' + obj.action);
      if (Array.isArray(obj.actions)) {
        for (const act of obj.actions) {
          const k = typeof act === 'string' ? act : (act && act.kind);
          if (k && !KW.ACTIONS.includes(k)) errs.push(label + ': Unknown composable action in actions[] ' + k);
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
    if (Array.isArray(spec.moveDefs)) {
      for (const mv of spec.moveDefs) checkMoveOrSpec(mv, rootLabel + '.' + (mv.id || 'move'));
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
  g.SK = SK;
  if (typeof module === 'object' && module.exports) module.exports = SK;
})(typeof globalThis !== 'undefined' ? globalThis : this);
