/* stats.js — สเตตัสต่อสู้ (v1.4): ค่าสู้จริง 12 ค่า คำนวณจาก
 *   ขั้น/วิถี/สายย่อย + ร่างกาย/สติปัญญา/นิสัย + ฝีมือยุทธ์ + วิชาที่เรียน + คัมภีร์หลัก + อุปกรณ์ (ค่าจริงต่อชิ้น) + โอสถบัฟ + สถานะระหว่างศึก + สภาพร่างกาย
 * สูตร: ค่าสุดท้าย = ฐาน × (1 + Σเปอร์เซ็นต์) + Σค่าบวกตรง  (เก็บที่มาทุกบรรทัดไว้อธิบายในหน้าตัวละคร) */
(function (g) {
  'use strict';
  const U = g.U, HC = g.HC, CULT = g.CULT, ECO = g.ECO, SK = g.SK, JD = g.JD;
  const clamp = U.clamp, E = (n, p) => g.MARTIAL ? g.MARTIAL.eff(n, p) : HC.eff(n, p);
  const ST = { now: 0 };
  ST.KEYS = ['hp', 'atk', 'matk', 'def', 'mdef', 'crit', 'critDmg', 'eva', 'acc', 'pen', 'cast', 'move'];
  ST.INFO = {
    hp: { nameTh: 'พลังชีวิต', icon: '❤️', desc: 'ความทนทานรวม' },
    atk: { nameTh: 'พลังโจมตี', icon: '⚔️', desc: 'โจมตีกายภาพ (ฟัน/ต่อย/ทุบ) สู้กับค่าป้องกัน' },
    matk: { nameTh: 'โจมตีวิชา', icon: '🔮', desc: 'พลังปราณ/วิชา สู้กับค่าป้องกันวิชา' },
    def: { nameTh: 'ป้องกัน', icon: '🛡️', desc: 'ลดความเสียหายกายภาพ' },
    mdef: { nameTh: 'ป้องกันวิชา', icon: '🧿', desc: 'ลดความเสียหายจากวิชา/ปราณ' },
    crit: { nameTh: 'อัตราคริ', icon: '🎯', desc: 'โอกาสโจมตีติดคริติคอล (%)' },
    critDmg: { nameTh: 'ความแรงคริ', icon: '💢', desc: 'ตัวคูณความเสียหายเมื่อติดคริ (%)' },
    eva: { nameTh: 'หลบหลีก', icon: '💨', desc: 'ลดโอกาสโดนโจมตี (สู้กับค่าแม่นยำของศัตรู)' },
    acc: { nameTh: 'แม่นยำ', icon: '👁️', desc: 'เพิ่มโอกาสโจมตีโดนเป้า' },
    pen: { nameTh: 'เจาะเกราะ', icon: '🔱', desc: 'ละเลยค่าป้องกันของเป้าหมาย (%)' },
    cast: { nameTh: 'ความเร็วร่ายวิชา', icon: '⏱️', desc: 'ยิ่งสูงยิ่งลงมือถี่ ร่ายวิชาไว คูลดาวน์สั้น (100 = มาตรฐาน)' },
    move: { nameTh: 'ความเร็วเดินทาง', icon: '🏃', desc: 'ความเร็วเดิน/วิ่ง/รุกไล่/หนี (100 = มาตรฐาน)' }
  };
  const PATHW = {
    XIAN: { atk: .85, matk: 1.2, def: .8, mdef: 1.1 },
    BODY: { atk: 1.2, matk: .5, def: 1.35, mdef: .7 },
    GOD: { atk: 1.06, matk: 1.16, def: 1.14, mdef: 1.28 },
    DEMON: { atk: 1.15, matk: 1.15, def: .78, mdef: .92 },
    HEART_SOUL: { atk: .72, matk: 1.28, def: .88, mdef: 1.32 },
    MECH_PUPPET: { atk: 1.08, matk: 1.12, def: 1.24, mdef: 1.10 },
    KARMA_SAMSARA: { atk: 0.92, matk: 1.24, def: 1.08, mdef: 1.30 },
    BEAST_SOVEREIGN: { atk: 1.18, matk: 0.95, def: 1.16, mdef: 1.02 },
    SAGE_SUPPORT: { atk: 0.85, matk: 1.22, def: 1.15, mdef: 1.34 },
    CRAFT_CREATION: { atk: 1.12, matk: 1.18, def: 1.18, mdef: 1.18 },
    NONE: { atk: 1, matk: .15, def: .9, mdef: .35 }
  };
  for (const [id, path] of Object.entries(JD.CULT.paths)) { if (path.statWeights) PATHW[id] = path.statWeights; }
  const SUBFX = {
    SWORD_IMMORTAL: { p: { def: -.08 }, f: { pen: 18, crit: 6, critDmg: 15 } }, FIVE_ELEMENTS: { p: { matk: .08, mdef: .08 }, f: { cast: 5 } },
    ELIXIR_DAO: { p: { mdef: .12, hp: .08 }, f: { cast: -5 } }, ASTRAL_ARRAY: { p: { mdef: .15, acc: .1, atk: -.08 }, f: { cast: 8 } },
    BLOOD_DEMON: { p: { atk: .1, hp: -.06, def: -.05 }, f: { critDmg: 25, crit: 4 } }, PHANTOM_SOUL: { p: { eva: .18, matk: .06, def: -.08 }, f: { move: 8 } },
    TIME_VOID: { p: { mdef: .05 }, f: { cast: 25, move: 12 } }, SOUND_ZITHER: { p: { mdef: .1, acc: .08 }, f: { cast: 12 } },
    YIN_YANG_HARMONY: { p: { def: .06, mdef: .1, eva: .06 }, f: {} },
    TIGER_SOVEREIGN: { p: { atk: .1 }, f: { move: 15, cast: 12, crit: 4 } }, BLOOD_DRAGON: { p: { atk: .08, hp: .12 }, f: { critDmg: 10 } },
    VAJRA_BODHI: { p: { def: .2, mdef: .1, hp: .1, eva: -.08 }, f: {} }, DEVOURING_FIEND: { p: { atk: .08, hp: .08 }, f: { pen: 10 } },
    SOLAR_FORGE: { p: { atk: .1, def: .05 }, f: { pen: 8 } }, THUNDER_BODY: { p: {}, f: { crit: 8, critDmg: 20, cast: 10 } },
    JADE_IMMORTAL_BODY: { p: { hp: .18, mdef: .08, def: .06 }, f: {} }, TITAN_MOUNTAIN_BODY: { p: { def: .22, hp: .12, eva: -.1 }, f: { move: -8 } },
    WAR_DEITY: { p: { atk: .06, matk: .04, acc: .1, def: .08 }, f: {} }, MERCY_DEITY: { p: { mdef: .15, hp: .1, def: .04 }, f: {} },
    FATE_ORACLE: { p: { acc: .14, eva: .1 }, f: { crit: 6 } }, TOTEM_BEAST_GOD: { p: { atk: .08, hp: .08 }, f: { move: 10 } },
    UNDERWORLD_JUDGE: { p: { matk: .06, mdef: .08 }, f: { pen: 14 } }, OCEAN_SOVEREIGN: { p: { mdef: .1, hp: .1, matk: .04 }, f: { cast: 6 } },
    HARVEST_EARTH_GOD: { p: { hp: .14, def: .08, mdef: .08 }, f: {} },
    SHADOW_ASSASSIN: { p: { eva: .18, atk: .1, def: -.08 }, f: { crit: 10, critDmg: 28, move: 14 } },
    VENOM_GU_SOVEREIGN: { p: { matk: .12, mdef: .06, hp: -.04 }, f: { pen: 16, acc: 10 } },
    NETHER_GHOST_KING: { p: { matk: .14, mdef: .1, def: -.06 }, f: { cast: 10, eva: 8 } },
    HEAVEN_DEVOURING_DEMON: { p: { atk: .14, matk: .12, hp: .08, mdef: -.08 }, f: { pen: 14, critDmg: 18 } },
    ZEN_VOID_MIND: { p: { mdef: .2, def: .1, hp: .08 }, f: { eva: 10, cast: 8 } },
    CALLIGRAPHY_PAINTING_SAGE: { p: { matk: .14, acc: .12, mdef: .08 }, f: { cast: 16 } },
    DREAM_ILLUSION_WEAVER: { p: { eva: .16, mdef: .12, matk: .08 }, f: { cast: 14, move: 8 } },
    MIND_SWORD_TELEKINESIS: { p: { matk: .16, acc: .1, def: -.06 }, f: { pen: 20, crit: 8, critDmg: 18 } }
  };

  Object.assign(SUBFX, (JD.EXPANSION && JD.EXPANSION.subStats) || {}, (JD.MARTIAL && JD.MARTIAL.subStats) || {});
  ST.SUBFX = SUBFX;

  /* ---------- อุปกรณ์: ค่าสเตตัสต่อชิ้น (คำนวณเมื่อใช้ครั้งแรก เก็บไว้ในชิ้นนั้น) ---------- */
  const GT = [28, 62, 130, 270, 560, 1100, 2100];
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rn(h, k) { let x = (h ^ Math.imul(k + 1, 0x9e3779b1)) >>> 0; x = Math.imul(x ^ (x >>> 15), 2246822519) >>> 0; x = Math.imul(x ^ (x >>> 13), 3266489917) >>> 0; return ((x ^ (x >>> 16)) >>> 0) / 4294967296; }
  ST.gearStats = it => {
    if (it.st) return it.st;
    const tier = clamp(it.tier || 1, 1, 7), q = it.q || 1, base = GT[tier - 1] * q, h = hash((it.id || '') + (it.nameTh || '') + (it.uid || '')), f = 1 + 0.12 * tier, s = {};
    const pool = [['crit', () => (2.2 + 2 * rn(h, 5)) * f], ['critDmg', () => (8 + 8 * rn(h, 6)) * f], ['pen', () => (3 + 4 * rn(h, 7)) * f], ['acc', () => base * 0.12], ['cast', () => (3 + 4 * rn(h, 8)) * f], ['eva', () => base * 0.1], ['hp', () => base * 0.45], ['move', () => 3 + 3 * rn(h, 9)], ['mdef', () => base * 0.18], ['def', () => base * 0.18]];
    const pickAff = (n, ex) => { const used = {}; for (let i = 0; i < n; i++) { let k = Math.floor(rn(h, 20 + i) * pool.length), tries = 0; while ((used[pool[k][0]] || (ex && ex.includes(pool[k][0]))) && tries++ < 12) k = (k + 1) % pool.length; used[pool[k][0]] = 1; s[pool[k][0]] = (s[pool[k][0]] || 0) + pool[k][1](); } };
    if (it.slot === 'WEAPON') { const gType = it.gearType || JD.MARTIAL.classify(it.slot, it.nameTh); const isMag = ['FOCUS', 'ZITHER', 'BRUSH'].includes(gType); const isHyb = gType === 'WHIP'; s[isMag ? 'matk' : 'atk'] = base * (isHyb ? 0.44 : 0.55); s[isMag ? 'atk' : 'matk'] = base * (isHyb ? 0.34 : 0.1); pickAff(tier >= 4 ? 2 : 1, ['hp', 'mdef', 'def', 'eva']); }
    else if (it.slot === 'ARMOR') { s.def = base * 0.55; s.mdef = base * 0.28; s.hp = base * 0.5; pickAff(tier >= 4 ? 1 : 0, ['crit', 'critDmg', 'pen']); if (tier >= 4 && rn(h, 3) < 0.5) s.eva = (s.eva || 0) + base * 0.06; }
    else { pickAff(2); const r = rn(h, 4); if (r < 0.3) s.atk = (s.atk || 0) + base * 0.2; else if (r < 0.6) s.matk = (s.matk || 0) + base * 0.2; }
    (it.fx || it.effects || []).forEach(x => {
      const p = x.params || {};
      const eid = x.effectId || x.id || '';
      if (p.armorReductionRatio) s.pen = (s.pen || 0) + p.armorReductionRatio * 40;
      if (eid === 'EFX_BARRIER_SHIELD' || eid === 'EFX_TRIBULATION_SHIELD') { s.def = (s.def || 0) + (p.barrierCapacity || 200) * 0.08; s.mdef = (s.mdef || 0) + (p.barrierCapacity || 200) * 0.08; }
      else if (eid === 'EFX_STEALTH_CONCEALMENT' || eid === 'EFX_SIDESTEP_EVASION' || eid === 'EFX_ILLUSION_DECOY') { s.eva = (s.eva || 0) + (p.concealmentScore || 40) * 0.45; s.move = (s.move || 0) + 4; }
      else if (eid === 'EFX_DETECTION_REVEAL' || eid === 'EFX_TRACE_MARK' || eid === 'EFX_INTENT_SENSE' || eid === 'EFX_WEAKNESS_EXPOSURE') { s.acc = (s.acc || 0) + 14; s.crit = (s.crit || 0) + 3.5; }
      else if (eid === 'EFX_MIND_SHIELD' || eid === 'EFX_CONTROL_RESILIENCE' || eid === 'EFX_CALM_MIND' || eid === 'EFX_REALM_SUPPRESSION_GUARD') { s.mdef = (s.mdef || 0) + base * 0.14; s.hp = (s.hp || 0) + base * 0.15; }
      else if (eid === 'EFX_HASTE_STEP' || eid === 'EFX_SKY_LEVITATION_DRIVE') { s.move = (s.move || 0) + 6; s.cast = (s.cast || 0) + 5; }
      else if (eid === 'EFX_QI_RESERVOIR' || eid === 'EFX_FORMATION_HARMONIZATION') { s.matk = (s.matk || 0) + base * 0.10; s.cast = (s.cast || 0) + 4; }
      else if (eid.startsWith('EFX_V234_')) {
        if (p.bonusAtkPct) s.atk = (s.atk || 0) + base * p.bonusAtkPct;
        if (p.bonusMatkPct) s.matk = (s.matk || 0) + base * p.bonusMatkPct;
        if (p.bonusDefPct) s.def = (s.def || 0) + base * p.bonusDefPct;
        if (p.bonusMdefPct) s.mdef = (s.mdef || 0) + base * p.bonusMdefPct;
        if (p.bonusCrit) s.crit = (s.crit || 0) + p.bonusCrit;
        if (p.bonusPen) s.pen = (s.pen || 0) + p.bonusPen;
        if (p.bonusCast) s.cast = (s.cast || 0) + p.bonusCast;
      }
    });
    const type = it.gearType || JD.MARTIAL.classify(it.slot, it.nameTh);
    const typed = { SWORD: { crit: 3 }, BLADE: { atk: base * .12 }, BOW: { acc: base * .18, crit: 2 }, SPEAR: { pen: 5 }, STAFF: { def: base * .16 }, FIST: { cast: 5 }, FOCUS: { matk: base * .12 }, ZITHER: { matk: base * .14, cast: 4, mdef: base * .08 }, BRUSH: { matk: base * .12, acc: base * .15, cast: 3 }, WHIP: { atk: base * .08, acc: base * .14, pen: 4, crit: 2 }, HEAVY: { def: base * .18, move: -4 }, LIGHT: { eva: base * .15, move: 4 }, ROBE: { mdef: base * .2, cast: 4 }, RING: { crit: 2 }, NECKLACE: { hp: base * .3 }, BRACELET: { cast: 4 }, CHARM: { mdef: base * .12 } }[type] || {};
    for (const k in typed) s[k] = (s[k] || 0) + typed[k];
    for (const k in s) s[k] = Math.round(s[k] * 10) / 10;
    it.st = s; return s;
  };
  ST.gearScore = it => { const s = ST.gearStats(it); return (s.atk || 0) + (s.matk || 0) + (s.def || 0) + (s.mdef || 0) + (s.hp || 0) * 0.5 + (s.eva || 0) * 0.6 + (s.acc || 0) * 0.6 + (s.crit || 0) * 8 + (s.critDmg || 0) * 1.5 + (s.pen || 0) * 6 + (s.cast || 0) * 3 + (s.move || 0) * 2; };

  /* ---------- สถานะ/บัฟ และการควบคุมเวลาหมดอายุอย่างเข้มงวด (v2.0.8) ---------- */
  ST.BUFF_CATALOG = Object.freeze({
    vitalRegen: { id: 'vitalRegen', name: 'ปราณน้ำค้างฟื้นฟู', icon: '🌿', kind: 'regen', defaultDur: 60, p: { hp: 0.10, def: 0.06 }, f: {}, hotPct: 0.035, descTh: 'ฟื้นฟูพลังชีวิตต่อเนื่อง +3.5%/รอบ และเพิ่มพลังชีวิต +10%, ป้องกัน +6%' },
    fervorMight: { id: 'fervorMight', name: 'โลหิตศึกฮึกเหิม', icon: '🔥', kind: 'offense', defaultDur: 45, p: { atk: 0.16, matk: 0.16 }, f: { crit: 8, critDmg: 22, pen: 10 }, descTh: 'เพิ่มโจมตี/โจมตีวิชา +16%, คริ +8%, แรงคริ +22%, เจาะเกราะ +10%' },
    aegisWard: { id: 'aegisWard', name: 'ปราการฉีเหมินคุ้มกาย', icon: '🛡️', kind: 'defense', defaultDur: 60, p: { def: 0.22, mdef: 0.22, hp: 0.08 }, f: {}, shieldPct: 0.18, descTh: 'เพิ่มป้องกัน/ป้องกันวิชา +22%, พลังชีวิต +8% และสร้างม่านคุ้มกาย' },
    swiftWind: { id: 'swiftWind', name: 'วายุพิณทะยานฟ้า', icon: '🍃', kind: 'haste', defaultDur: 50, p: { eva: 0.18 }, f: { move: 18, cast: 14, acc: 10 }, descTh: 'เพิ่มหลบหลีก +18%, ความเร็วเดินทาง +18, ร่ายวิชา +14, แม่นยำ +10' },
    qiConduit: { id: 'qiConduit', name: 'ชีพจรปราณหมุนเวียน', icon: '💠', kind: 'qi', defaultDur: 60, p: { matk: 0.14, mdef: 0.12 }, f: { cast: 18 }, qiRegenBonus: 0.015, descTh: 'เพิ่มโจมตีวิชา +14%, ป้องกันวิชา +12%, ร่ายวิชา +18 และฟื้นปราณไวขึ้น' },
    clarityLotus: { id: 'clarityLotus', name: 'บัวทิพย์กระจ่างใจ', icon: '🪷', kind: 'clarity', defaultDur: 90, p: { mdef: 0.16, acc: 0.12 }, f: { crit: 6 }, ctrlResist: 0.28, cultRateBonus: 0.15, btBonus: 0.05, descTh: 'ป้องกันวิชา +16%, แม่นยำ +12%, ต้านทานสถานะสะกด +28% และเร่งบำเพ็ญ' },
    meridianUnblock: { id: 'meridianUnblock', name: 'เข็มทองเปิดชีพจรยุทธ์', icon: '🪡', kind: 'acupoint', defaultDur: 75, p: { atk: 0.12, matk: 0.12, def: 0.12, mdef: 0.12 }, f: { cast: 12, move: 10, pen: 8 }, cultRateBonus: 0.15, btBonus: 0.08, descTh: 'เปิดจุดชีพจรเพิ่มโจมตีและป้องกันทุกด้าน +12%, ร่ายไว +12 และหนุนการทะลวงขั้น' },
    nirvanaGrace: { id: 'nirvanaGrace', name: 'โคมวิญญาณคุ้มชีพ', icon: '🏮', kind: 'ward', defaultDur: 60, p: { def: 0.14, mdef: 0.14, hp: 0.12 }, f: {}, cheatDeath: true, cheatDeathPct: 0.36, descTh: 'เพิ่มป้องกัน +14%, เลือด +12% และคุ้มครองชีวิตทันที 1 ครั้งเมื่อบาดเจ็บปางตาย' },
    tacticalCommand: { id: 'tacticalCommand', name: 'โองการพยุหะ', icon: '🚩', kind: 'command', defaultDur: 55, p: { atk: 0.18, matk: 0.18, def: 0.18, mdef: 0.18 }, f: { acc: 14, pen: 12 }, descTh: 'โองการพิชัยสงครามเพิ่มโจมตี/ป้องกันทุกด้าน +18%, แม่นยำ +14, เจาะเกราะ +12%' },
    astralMirage: { id: 'astralMirage', name: 'เงาดาราซ้อนมิติ', icon: '🌌', kind: 'mirage', defaultDur: 45, p: { eva: 0.35 }, f: { move: 24, cast: 16, crit: 10 }, descTh: 'เพิ่มหลบหลีก +35%, เดินทาง +24, ร่ายวิชา +16 และหลบสวนกลับการโจมตีถัดไปอัตโนมัติ' },
    karmicAegis: { id: 'karmicAegis', name: 'วัฏจักรสะท้อนกรรม', icon: '☸️', kind: 'karma', defaultDur: 50, p: { def: 0.20, mdef: 0.20, matk: 0.12 }, f: { pen: 12 }, reflectPct: 0.22, descTh: 'เพิ่มป้องกัน +20%, โจมตีวิชา +12% และสะท้อนความเสียหายคืนสู่ผู้โจมตี 22%' },
    mentorGuidance: { id: 'mentorGuidance', name: 'คำชี้แนะอาจารย์สายตรง', icon: '📜', kind: 'lineage', defaultDur: 120, p: { atk: 0.10, matk: 0.10, def: 0.10, mdef: 0.10 }, f: { acc: 10, cast: 10 }, cultRateBonus: 0.18, btBonus: 0.08, descTh: 'คำชี้แนะจากอาจารย์สายตรง เพิ่มสเตตัสรบ +10%, เร่งบำเพ็ญ +18% และโอกาสทะลวงขั้น +8%' },
    bloodFrenzy: { id: 'bloodFrenzy', name: 'โลหิตคลั่งสังหาร', icon: '🩸', kind: 'offense', defaultDur: 45, p: { atk: 0.18, matk: 0.14, def: -0.06 }, f: { crit: 8, critDmg: 20, pen: 10 }, descTh: 'เร่งโลหิตสังหาร เพิ่มโจมตี +18%, โจมตีวิชา +14%, คริ +8%, แรงคริ +20% (ป้องกัน -6%)' },
    shadowVeil: { id: 'shadowVeil', name: 'ม่านเงาเร้นกาย', icon: '🌑', kind: 'stealth', defaultDur: 45, p: { eva: 0.26, atk: 0.10 }, f: { move: 16, crit: 8, pen: 8 }, descTh: 'พรางกายในเงามืด เพิ่มหลบหลีก +26%, โจมตี +10%, ความเร็ว +16, คริ +8%' },
    frostBarrier: { id: 'frostBarrier', name: 'ปราการน้ำแข็งอุดร', icon: '🧊', kind: 'defense', defaultDur: 55, p: { def: 0.24, mdef: 0.20, hp: 0.08 }, f: { cast: 6 }, shieldPct: 0.16, descTh: 'สร้างม่านน้ำแข็งคุ้มกาย เพิ่มป้องกัน +24%, ป้องกันวิชา +20% และดูดซับความเสียหาย' },
    thunderStep: { id: 'thunderStep', name: 'ย่างก้าวอัสนีพริบตา', icon: '⚡', kind: 'haste', defaultDur: 45, p: { eva: 0.20, atk: 0.12 }, f: { move: 22, cast: 16, crit: 6 }, descTh: 'เคลื่อนร่างไวดั่งสายฟ้า เพิ่มหลบหลีก +20%, เดินทาง +22, ร่ายวิชา +16, โจมตี +12%' },
    windStride: { id: 'windStride', name: 'เหินวายุไร้รอย', icon: '🌪️', kind: 'haste', defaultDur: 50, p: { eva: 0.22 }, f: { move: 20, cast: 14, acc: 10 }, descTh: 'เหินร่างตามสายลม เพิ่มหลบหลีก +22%, เดินทาง +20, ร่ายไว +14, แม่นยำ +10' },
    solarWard: { id: 'solarWard', name: 'ม่านเพลิงสุริยัน', icon: '☀️', kind: 'ward', defaultDur: 55, p: { def: 0.18, mdef: 0.18, atk: 0.12 }, f: { pen: 8 }, shieldPct: 0.15, descTh: 'ม่านเพลิงสุริยันคุ้มครองร่าง เพิ่มป้องกัน +18%, โจมตี +12%, เจาะเกราะ +8%' },
    starlightAegis: { id: 'starlightAegis', name: 'เกราะแสงดาราพิทักษ์', icon: '✨', kind: 'ward', defaultDur: 60, p: { mdef: 0.24, def: 0.16, matk: 0.10 }, f: { acc: 14, cast: 10 }, shieldPct: 0.16, descTh: 'ม่านดาราคุ้มภัย เพิ่มป้องกันวิชา +24%, ป้องกัน +16%, แม่นยำ +14, ร่ายไว +10' },
    puppetOverclock: { id: 'puppetOverclock', name: 'กลไกเร่งพิกัดสูงสุด', icon: '⚙️', kind: 'overdrive', defaultDur: 45, p: { atk: 0.18, matk: 0.18, def: 0.12 }, f: { cast: 16, pen: 12 }, descTh: 'เร่งแกนกลไกหุ่นเชิด เพิ่มโจมตีและโจมตีวิชา +18%, ป้องกัน +12%, ร่ายไว +16, เจาะเกราะ +12%' },
    beastPackFury: { id: 'beastPackFury', name: 'สัญชาตญาณฝูงอสูรคลั่ง', icon: '🐾', kind: 'offense', defaultDur: 50, p: { atk: 0.20, hp: 0.12 }, f: { move: 16, crit: 8, pen: 10 }, descTh: 'ปลุกสัญชาตญาณราชันย์อสูร เพิ่มโจมตี +20%, เลือด +12%, ความเร็ว +16, คริ +8%' },
    artisanFocus: { id: 'artisanFocus', name: 'สมาธิเตาหลอมเทวะ', icon: '🔨', kind: 'craft', defaultDur: 90, p: { atk: 0.14, matk: 0.16, def: 0.14, mdef: 0.14 }, f: { acc: 12, pen: 10 }, cultRateBonus: 0.14, descTh: 'สมาธิหลอมรวมศาสตราและโอสถ เพิ่มสเตตัสรบ +14-16%, แม่นยำ +12 และเร่งการบ่มเพาะ' },
    soulLinkGuard: { id: 'soulLinkGuard', name: 'สายใยร่วมเป็นร่วมตาย', icon: '🤝', kind: 'tether', defaultDur: 45, p: { def: 0.15, mdef: 0.15, hp: 0.10 }, f: {}, descTh: 'เชื่อมสายใยปราณคุ้มกันพวกพ้อง แบ่งรับความเสียหาย 30% และเพิ่มป้องกัน +15%' },
    comboReady: { id: 'comboReady', name: 'ตั้งท่าสืบเนื่อง', icon: '⚔️', kind: 'stance', defaultDur: 24, p: { atk: 0.14, matk: 0.14 }, f: { crit: 10, cast: 12 }, descTh: 'เตรียมพร้อมต่อกระบวนท่าถัดไป เพิ่มอานุภาพวิชาถัดไป +28% และลดปราณที่ใช้ลง 30%' },
    elementalOvercharge: { id: 'elementalOvercharge', name: 'ปราณธาตุปะทุ', icon: '🌈', kind: 'element', defaultDur: 40, p: { matk: 0.20, atk: 0.14 }, f: { pen: 15, crit: 6 }, descTh: 'ปราณธาตุปะทุจากปฏิกิริยาผสาน เพิ่มโจมตีวิชา +20%, โจมตี +14%, เจาะเกราะ +15%' },
    qiBarrierShell: { id: 'qiBarrierShell', name: 'เกราะปราณกลั่นตัว', icon: '🫧', kind: 'shield', defaultDur: 50, p: { def: 0.18, mdef: 0.22 }, f: {}, shieldPct: 0.20, descTh: 'กลั่นปราณสำรองเป็นม่านคุ้มกาย เพิ่มป้องกันวิชา +22%, ป้องกัน +18% และสร้างโล่ปราณ' },
    toxinOverdrive: { id: 'toxinOverdrive', name: 'พิษโอสถคลั่งพลัง', icon: '🧪', kind: 'overdrive', defaultDur: 40, p: { atk: 0.22, matk: 0.22, def: -0.08 }, f: { pen: 15, critDmg: 20 }, descTh: 'แปรเปลี่ยนพิษสะสมในกายเป็นพลังทำลายล้าง เพิ่มโจมตี/วิชา +22%, เจาะเกราะ +15%, แรงคริ +20%' },
    alchemicalHarmony: { id: 'alchemicalHarmony', name: 'ปราณโอสถประสานชีพจร', icon: '⚗️', kind: 'regen', defaultDur: 75, p: { hp: 0.14, mdef: 0.16 }, f: { cast: 12 }, hotPct: 0.04, cultRateBonus: 0.16, btBonus: 0.06, descTh: 'ฤทธิ์โอสถระยะที่สองฟื้นฟูเลือดต่อเนื่อง +4%/รอบ, ป้องกันวิชา +16% และเร่งการบ่มเพาะ +16%' },
    voidPhase: { id: 'voidPhase', name: 'เร้นมิติสุญตา', icon: '🌀', kind: 'mirage', defaultDur: 35, p: { eva: 0.30, matk: 0.14 }, f: { move: 18, pen: 14 }, descTh: 'แฝงเร้นในรอยแยกมิติ เพิ่มหลบหลีก +30%, โจมตีวิชา +14%, เจาะเกราะ +14%' },
    cryoMirror: { id: 'cryoMirror', name: 'กระจกน้ำแข็งสะท้อนวิญญาณ', icon: '🪞', kind: 'ward', defaultDur: 45, p: { mdef: 0.24, def: 0.16 }, f: { acc: 10 }, reflectPct: 0.25, shieldPct: 0.16, descTh: 'กระจกน้ำแข็งสะท้อนความเสียหายวิชา 25% และเพิ่มป้องกันวิชา +24%' },
    phoenixCovenant: { id: 'phoenixCovenant', name: 'พันธะเพลิงนิพพานหงส์อมตะ', icon: '🔥', kind: 'ward', defaultDur: 90, p: { atk: 0.12, matk: 0.12, hp: 0.12 }, f: { cast: 10 }, cheatDeath: true, cheatDeathPct: 0.35, descTh: 'เมื่อเลือดลดเหลือ 0 จะคืนชีพด้วยเลือด 35% พร้อมระเบิดเพลิงนิพพานรอบตัว 1 ครั้งต่อการต่อสู้' },
    asuraBloodFrenzy: { id: 'asuraBloodFrenzy', name: 'อสูรโลหิตคลั่งสังหาร', icon: '👹', kind: 'offense', defaultDur: 45, p: { atk: 0.24, matk: 0.18, def: -0.06 }, f: { crit: 12, critDmg: 28, pen: 14 }, descTh: 'เร่งโลหิตอสูรสูงสุด เพิ่มโจมตี +24%, คริ +12%, แรงคริ +28%, เจาะเกราะ +14%' },
    meridianOverdrive: { id: 'meridianOverdrive', name: 'ชีพจรแปดพิสดารปะทุ', icon: '⚡', kind: 'overdrive', defaultDur: 40, p: { atk: 0.30, matk: 0.30, def: 0.20, mdef: 0.20 }, f: { cast: 28, move: 22, pen: 18, crit: 10 }, descTh: 'ปลดขีดจำกัดเส้นลมปราณพิสดารทั้งแปด เพิ่มสเตตัสรบ +30% และความเร็วร่าย +28' },
    finalStandImmortal: { id: 'finalStandImmortal', name: 'ปราการยืนหยัดไร้พ่าย', icon: '🛡️', kind: 'defense', defaultDur: 40, p: { def: 0.32, mdef: 0.32, hp: 0.15 }, f: {}, shieldPct: 0.30, descTh: 'กางปราการไร้พ่ายเมื่อวิกฤต เพิ่มป้องกัน +32% และสร้างโล่คุ้มกาย 30%' },
    totemBlessing: { id: 'totemBlessing', name: 'พรเสาโทเท็มบรรพชน', icon: '🗿', kind: 'lineage', defaultDur: 120, p: { atk: 0.12, matk: 0.12, def: 0.12, mdef: 0.12, hp: 0.10 }, f: { crit: 5, pen: 8 }, cultRateBonus: 0.15, descTh: 'รับพรคุ้มครองจากเสาโทเท็มประจำสำนัก เพิ่มสเตตัสรบ +12% และเร่งบ่มเพาะ +15%' },
    beastSpiritPossessed: { id: 'beastSpiritPossessed', name: 'ประทับร่างอสูรบรรพกาล', icon: '🐉', kind: 'overdrive', defaultDur: 50, p: { atk: 0.25, matk: 0.20, def: 0.18, hp: 0.18 }, f: { move: 24, crit: 10, pen: 15 }, descTh: 'ผสานวิญญาณสัตว์อสูรคู่สัญญาเข้าสู่ร่างต้น เพิ่มพลังรบและความเร็วอย่างมหาศาล' }
  });

  ST.STANCE_CATALOG = (SK && SK.STANCE_CATALOG) || {
    STAR_SWORD_STANCE: { id: 'STAR_SWORD_STANCE', nameTh: 'กระบวนท่ากระบี่ดารา', p: { atk: 0.12, matk: 0.12 }, f: { crit: 10, pen: 15, acc: 8 }, descTh: 'เพิ่มอัตราคริ +10%, เจาะเกราะ +15%, โจมตี/วิชา +12%' },
    VAJRA_BASTION_STANCE: { id: 'VAJRA_BASTION_STANCE', nameTh: 'กระบวนท่าปราการวัชระ', p: { def: 0.25, mdef: 0.20, move: -0.10 }, f: {}, reflectPct: 0.15, descTh: 'เพิ่มป้องกัน +25%, ป้องกันวิชา +20%, สะท้อนดาเมจ 15%, ความเร็วเคลื่อนที่ -10%' },
    SHADOW_REAPER_STANCE: { id: 'SHADOW_REAPER_STANCE', nameTh: 'กระบวนท่าเคียวเงาสังหาร', p: { eva: 0.20, atk: 0.10 }, f: { critDmg: 30, move: 14, crit: 6 }, descTh: 'เพิ่มหลบหลีก +20%, ความแรงคริ +30%, ความเร็ว +14' },
    LOTUS_MERCY_STANCE: { id: 'LOTUS_MERCY_STANCE', nameTh: 'กระบวนท่าบัวทิพย์เมตตา', p: { mdef: 0.16, hp: 0.10 }, f: { cast: 12 }, healDoneMult: 0.25, qiRegenBonus: 0.15, descTh: 'เพิ่มผลรักษาขาออก +25%, ฟื้นปราณ +15%, ป้องกันวิชา +16%' },
    THUNDER_STEP_STANCE: { id: 'THUNDER_STEP_STANCE', nameTh: 'กระบวนท่าย่างก้าวอัสนี', p: { eva: 0.15, matk: 0.10 }, f: { move: 20, cast: 15, acc: 10 }, descTh: 'เพิ่มความเร็วเคลื่อนที่ +20%, ความเร็วร่าย +15%, หลบหลีก +15%' },
    BLOOD_ASURA_STANCE: { id: 'BLOOD_ASURA_STANCE', nameTh: 'กระบวนท่าอสูรโลหิต', p: { atk: 0.20, matk: 0.15, def: -0.10 }, f: { critDmg: 20, pen: 12 }, lifestealBonus: 0.12, descTh: 'เพิ่มโจมตี +20%, ดูดเลือด +12%, ป้องกัน -10%' },
    QIMEN_ARRAY_STANCE: { id: 'QIMEN_ARRAY_STANCE', nameTh: 'กระบวนท่าค่ายกลฉีเหมิน', p: { matk: 0.14, mdef: 0.18 }, f: { acc: 14, cast: 10 }, ctrlResist: 0.20, shieldBonus: 0.18, descTh: 'เพิ่มความแม่นยำ +14, ป้องกันวิชา +18%, ต้านทานสถานะสะกด +20%' }
  };

  ST.getActiveStanceSpec = u => {
    if (!u) return null;
    const rawId = u._activeStance || u._combatStance || null;
    if (!rawId) return null;
    const cat = (SK && SK.STANCE_CATALOG) || ST.STANCE_CATALOG;
    return cat[rawId] || null;
  };

  ST.hasStanceFlowAmplifier = u => {
    if (!u || u.foe || !u.equip) return false;
    for (const slot of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
      const it = u.equip[slot];
      if (!it) continue;
      const efx = it.effects || it.fx || [];
      if (Array.isArray(efx) && efx.some(e => e && e.effectId === 'EFX_V234_STANCE_FLOW')) return true;
    }
    return false;
  };

  ST.dirty = u => { if (u) { u._cs = null; u._csBase = null; u._csStatic = null; u._skillEffectsCache = null; u._nd = null; } };
  ST.dirtyStatus = u => { if (u) { u._cs = null; u._nd = null; } };

  ST.purgeExpired = (u, now) => {
    if (!u) return false;
    const bArr = u.buffs, sArr = u.sx;
    const bLen = Array.isArray(bArr) ? bArr.length : 0;
    const sLen = Array.isArray(sArr) ? sArr.length : 0;
    if (bLen === 0 && sLen === 0) return false;
    const tNow = (now != null && Number.isFinite(now)) ? now : ST.now;
    let changed = false;
    if (bLen > 0) {
      let needFilterB = false;
      for (let i = 0; i < bLen; i++) {
        const b = bArr[i];
        if (!b || !Number.isFinite(b.until) || b.until <= tNow || b.until > tNow + 43200) { needFilterB = true; break; }
      }
      if (needFilterB) {
        const nextB = [];
        for (let i = 0; i < bLen; i++) {
          const b = bArr[i];
          if (b && Number.isFinite(b.until) && b.until > tNow && b.until <= tNow + 43200) nextB.push(b);
        }
        u.buffs = nextB;
        changed = true;
      }
    }
    if (sLen > 0) {
      let needFilterS = false;
      for (let i = 0; i < sLen; i++) {
        const x = sArr[i];
        if (!x || !Number.isFinite(x.until) || x.until <= tNow || x.until > tNow + 43200) { needFilterS = true; break; }
      }
      if (needFilterS) {
        const nextS = [];
        for (let i = 0; i < sLen; i++) {
          const x = sArr[i];
          if (x && Number.isFinite(x.until) && x.until > tNow && x.until <= tNow + 43200) nextS.push(x);
        }
        u.sx = nextS;
        changed = true;
      }
    }
    if (changed) ST.dirtyStatus(u);
    return changed;
  };

  ST.addBuff = (n, b, now) => {
    if (!n || !b) return null;
    const tNow = (now != null && Number.isFinite(now)) ? now : ST.now;
    ST.purgeExpired(n, tNow);
    const dur = clamp(Math.round(Number(b.dur) || 15), 1, 2880);
    const until = tNow + dur;
    n.buffs = (n.buffs || []).filter(x => x.id !== b.id && x.until > tNow);
    const entry = {
      id: b.id || 'BUFF',
      name: b.name || b.nameTh || b.id || 'บัฟเสริมพลัง',
      icon: b.icon || '✨',
      kind: b.kind || 'buff',
      startedAt: tNow,
      dur,
      until,
      p: b.p || {},
      f: b.f || {},
      nameTh: b.nameTh || b.name || 'บัฟหนุนพลัง', cultRateBonus: b.cultRateBonus || 0, btBonus: b.btBonus || 0, cheatDeath: !!b.cheatDeath, casterId: b.casterId || null
    };
    n.buffs.push(entry);
    ST.dirty(n);
    return entry;
  };

  ST.addStatus = (u, k, dur, extra, now) => {
    if (!u || !k) return null;
    const tNow = (now != null && Number.isFinite(now)) ? now : ST.now;
    ST.purgeExpired(u, tNow);
    const cleanDur = clamp(Math.round(Number(dur) || 10), 1, 2880);
    const until = tNow + cleanDur;
    u.sx = u.sx || [];
    const ex = u.sx.find(x => x.k === k);
    if (ex) {
      ex.until = Math.min(tNow + 2880, Math.max(ex.until, until));
      ex.dur = cleanDur;
      if (extra) Object.assign(ex, extra);
    } else {
      u.sx.push(Object.assign({ k, startedAt: tNow, dur: cleanDur, until }, extra || {}));
    }
    ST.dirty(u);
    return u.sx.find(x => x.k === k);
  };

  ST.applyNamedBuff = (u, buffId, dur, now, extra) => {
    if (!u || !buffId) return null;
    if (dur && typeof dur === "object") {
      extra = Object.assign({}, dur, extra || {});
      now = dur.now != null ? dur.now : now;
      dur = dur.duration != null ? dur.duration : dur.dur;
    }
    const def = ST.BUFF_CATALOG[buffId];
    const tNow = (now != null && Number.isFinite(now)) ? now : ST.now;
    const cleanDur = clamp(Math.round(Number(dur) || (def ? def.defaultDur : 30)), 1, 2880);
    let buffEntry = null;
    if (def) {
      buffEntry = ST.addBuff(u, {
        id: def.id,
        name: def.name,
        nameTh: def.nameTh || def.name,
        icon: def.icon,
        kind: def.kind,
        dur: cleanDur,
        p: Object.assign({}, def.p),
        f: Object.assign({}, def.f),
        cultRateBonus: def.cultRateBonus || 0,
        btBonus: def.btBonus || 0,
        cheatDeath: !!def.cheatDeath,
        casterId: extra && extra.casterId
      }, tNow);
      if (SK.STATUS[buffId]) {
        // Mirror short combat status if in fight or if status duration <= 120, keeping status pmods/mods non-duplicated in compute
        ST.addStatus(u, buffId, cleanDur, Object.assign({ fromBuffCatalog: true, per: def.hotPct || 0 }, extra || {}), tNow);
      }
      if (def.shieldPct && !u.foe) {
        const hm = ST.hpMax(u);
        ST.addStatus(u, 'shield', Math.min(cleanDur, 24), { amt: Math.round(hm * def.shieldPct) }, tNow);
      }
    } else if (SK.STATUS[buffId]) {
      const S = SK.STATUS[buffId];
      buffEntry = ST.addBuff(u, {
        id: buffId,
        name: S.nameTh || buffId,
        icon: S.icon || '✨',
        dur: cleanDur,
        p: Object.assign({}, S.pmods || {}),
        f: Object.assign({}, S.mods || {})
      }, tNow);
      ST.addStatus(u, buffId, cleanDur, Object.assign({ fromBuffCatalog: true }, extra || {}), tNow);
    }
    return buffEntry;
  };

  ST.hasBuff = (u, id, now) => {
    if (!u) return false;
    const tNow = (now != null && Number.isFinite(now)) ? now : ST.now;
    ST.purgeExpired(u, tNow);
    return !!((u.buffs && u.buffs.some(b => b.id === id && b.until > tNow)) || (u.sx && u.sx.some(x => x.k === id && x.until > tNow)));
  };

  ST.getActiveBuffs = (u, now) => {
    if (!u) return [];
    const tNow = (now != null && Number.isFinite(now)) ? now : ST.now;
    ST.purgeExpired(u, tNow);
    return (u.buffs || []).filter(b => b.until > tNow).map(b => Object.assign({}, b, { remaining: Math.max(0, b.until - tNow) }));
  };

  ST.has = (u, k, now) => {
    if (!u || !u.sx) return false;
    const tNow = (now != null && Number.isFinite(now)) ? now : ST.now;
    ST.purgeExpired(u, tNow);
    return u.sx.some(x => x.k === k && x.until > tNow);
  };
  ST.statusOf = (u, k, now) => {
    if (!u || !u.sx) return undefined;
    const tNow = (now != null && Number.isFinite(now)) ? now : ST.now;
    ST.purgeExpired(u, tNow);
    return (u.sx || []).find(x => x.k === k && x.until > tNow);
  };
  ST.clearStatus = (u, filter) => { if (!u || !u.sx) return; u.sx = u.sx.filter(x => !(filter(x))); ST.dirty(u); };
  ST.clearBuff = (u, filterOrId) => {
    if (!u) return;
    const pred = typeof filterOrId === 'function' ? filterOrId : (b => b.id === filterOrId || b.k === filterOrId);
    if (Array.isArray(u.buffs)) u.buffs = u.buffs.filter(b => !pred(b));
    if (Array.isArray(u.sx)) u.sx = u.sx.filter(x => !pred(x));
    ST.dirtyStatus(u);
  };

  function passiveCacheKey(n) {
    if (!n || !n.cult) return 0;
    const hpfBand = (n._hpf == null || n._hpf > 0.8) ? 2 : (n._hpf <= 0.4 ? 0 : (n._hpf <= 0.45 ? 1 : (n._hpf <= 0.5 ? 3 : 4)));
    if ((!n.pets || !n.pets.length) && !n.mechState && !n.karmaState && !n._activeStance && !n._combatStance && (!n.meridians || !n.meridians.openedCount) && !n._beastFusedUntil && !n._beastSpiritPossessedUntil) {
      const ext0 = (n.mentorImprint ? 0x8000 : 0) | (n.ancientBloodline && n.ancientBloodline.awakened ? 0x40000 : 0);
      return (((n._passVer || 0) * 16) + hpfBand) ^ (ext0 << 4);
    }
    let ext = 0;
    if (n.pets && n.pets.length) {
      for (let i = 0; i < n.pets.length; i++) {
        const pt = n.pets[i];
        if (pt && pt.active && (pt.hp == null || pt.hp > 0)) {
          ext = (ext * 31 + (pt.tier || 1) * 7 + (pt.level || 1) * 3 + ((pt.bond || 0) >> 3) + (pt.sovereignAwakened ? 19 : 0)) | 0;
        }
      }
    }
    if (n._beastFusedUntil && n._beastFusedUntil > ST.now) ext = (ext ^ 0x4000) | 0;
    if (n.mechState) ext = (ext ^ (((n.mechState.integrity || 0) >> 4) << 8) ^ (n.mechState.mode === 'SIEGE' ? 256 : n.mechState.mode === 'SWARM' ? 512 : 128)) | 0;
    if (n.karmaState && n.karmaState.stance) ext = (ext ^ (n.karmaState.stance.charCodeAt(0) << 10)) | 0;
    if (n.mentorImprint) ext = (ext ^ 0x8000) | 0;
    const stc = n._activeStance || n._combatStance || '';
    if (stc) ext = (ext ^ (stc.charCodeAt(0) * 131 + stc.length * 17)) | 0;
    if (n.meridians && n.meridians.openedCount) ext = (ext ^ (n.meridians.openedCount << 11) ^ (n.meridians.overdriveUntil > ST.now ? 0x20000 : 0)) | 0;
    if (n.ancientBloodline && n.ancientBloodline.awakened) ext = (ext ^ 0x40000) | 0;
    if (n._beastSpiritPossessedUntil && n._beastSpiritPossessedUntil > ST.now) ext = (ext ^ 0x80000) | 0;
    return (((n._passVer || 0) * 16) + hpfBand) ^ (ext << 4);
  }

  /* ---------- คำนวณ ---------- */
  function compute(n, wp) {
    const A = {}; ST.KEYS.forEach(k => { A[k] = { b: 0, p: 0, f: 0, parts: wp ? [] : null }; });
    const add = (k, label, kind, v) => { if (!v) return; if (k === 'move' && kind === 'f') { kind = 'p'; v /= 100; } const a = A[k]; a[kind] += v; if (a.parts) a.parts.push([label, kind, v]); };
    const addAll = (label, o, kind) => { for (const k in o) if (A[k]) add(k, label, kind, o[k]); };
    if (n.foe) return computeFoe(n, A, add, wp);
    const c = n.cult, st = CULT.stageInfo(n), L = st.combatPower, sub = c ? CULT.subInfo(c.path, c.sub) : null;
    const Lo = L * (sub ? sub.combatBonus : 1), Ld = L * (sub ? sub.defenseBonus : 1), pw = PATHW[c && PATHW[c.path] ? c.path : 'NONE'], d = g.MARTIAL ? g.MARTIAL.derived(n) : HC.derived(n);
    const stLabel = c ? CULT.stageName(n) : 'ปุถุชน';
    A.atk.b = Lo * 0.6 * pw.atk; A.matk.b = Lo * 0.6 * pw.matk; A.def.b = Ld * 0.5 * pw.def; A.mdef.b = Ld * 0.45 * pw.mdef; A.acc.b = Lo * 0.55; A.eva.b = Lo * 0.55;
    A.hp.b = d.hpMax * CULT.hpMult(n); A.crit.b = 5; A.critDmg.b = 150; A.cast.b = 100; A.move.b = 100 * d.walkSpeed / 1.05;
    if (wp) { ['atk', 'matk', 'def', 'mdef', 'acc', 'eva', 'hp'].forEach(k => A[k].parts.push(['ฐานจาก' + stLabel + (c ? '/สาย' + (sub ? sub.nameTh : '') : ''), 'b', A[k].b])); A.move.parts.push(['ฐานจากสรีระ (ความเร็ว/ว่องไว)', 'b', A.move.b]); }
    // ร่างกาย/จิต
    const strF = 0.65 + 0.6 * (E(n, 'physiology.strength') * .4 + E(n, 'physiology.toughness') * .2 + E(n, 'physiology.explosiveness') * .2 + E(n, 'physiology.endurance') * .2) / 100;
    const sk = n.h.skills;
    const martial = g.MARTIAL ? g.MARTIAL.weaponSkill(n) : (sk.FIST_PALM || 0);
    add('atk', 'พละกำลัง/ความทนทาน', 'p', strF - 1); add('atk', 'ฝีมือยุทธ์ (ชำนาญ ' + Math.round(martial) + ')', 'p', 0.8 + 0.45 * martial / 100 - 1);
    const qiF = 0.65 + 0.6 * (E(n, 'physiology.spiritualFoundation') * .35 + E(n, 'physiology.meridianCapacity') * .25 + E(n, 'intellect.comprehension') * .2 + E(n, 'intellect.willpower') * .2) / 100;
    add('matk', 'รากฐานปราณ/เส้นลมปราณ/ความเข้าใจ', 'p', qiF - 1);
    add('def', 'ความทนทาน/พลังชีวิต', 'p', 0.65 + 0.6 * (E(n, 'physiology.toughness') * .5 + E(n, 'physiology.endurance') * .2 + E(n, 'physiology.vitality') * .3) / 100 - 1);
    add('mdef', 'จิตใจ/รากฐานปราณ', 'p', 0.65 + 0.6 * (E(n, 'intellect.willpower') * .4 + E(n, 'physiology.spiritualFoundation') * .3 + E(n, 'personality.composure') * .3) / 100 - 1);
    add('acc', 'สายตา/ปฏิกิริยา/พรสวรรค์การต่อสู้', 'p', 0.6 + 0.8 * (E(n, 'intellect.perceptiveness') * .3 + E(n, 'physiology.reflex') * .25 + E(n, 'aptitudes.combat') * .25 + E(n, 'intellect.focus') * .2) / 100 - 1);
    add('eva', 'ว่องไว/ปฏิกิริยา', 'p', 0.6 + 0.8 * (E(n, 'physiology.agility') * .4 + E(n, 'physiology.reflex') * .35 + E(n, 'physiology.speed') * .25) / 100 - 1);
    add('crit', 'สายตา/สัญชาตญาณ/พรสวรรค์รบ', 'f', (E(n, 'intellect.perceptiveness') + E(n, 'intellect.intuition') + E(n, 'aptitudes.combat')) / 3 * 0.08);
    add('critDmg', 'พรสวรรค์รบ/ความดุดัน', 'f', (E(n, 'aptitudes.combat') - 50) * 0.3 + (E(n, 'personality.aggression') - 50) * 0.2);
    add('pen', 'ฝีมือยุทธ์', 'f', martial * 0.05);
    add('cast', 'ปฏิกิริยา/สมาธิ/ความเข้าใจ', 'f', (E(n, 'physiology.reflex') - 50) * 0.4 + (E(n, 'intellect.focus') - 50) * 0.3 + (E(n, 'intellect.comprehension') - 50) * 0.2);
    if (c) {
      const ns = CULT.normalizedStage ? CULT.normalizedStage(n) : c.stage; add('cast', 'ขั้นบำเพ็ญ', 'f', 2 * (ns - 1)); add('move', 'ขั้นบำเพ็ญ', 'f', 4 * (ns - 1));
      const rawFx = SUBFX[c.sub] || (JD.EXPANSION.subStats || {})[c.sub], fx = rawFx && g.MARTIAL ? g.MARTIAL.subStats(n, rawFx) : rawFx; if (fx) { addAll('สาย' + (sub ? sub.nameTh : c.sub), fx.p || {}, 'p'); addAll('สาย' + (sub ? sub.nameTh : c.sub), fx.f || {}, 'f'); }
      const m = c.mantra ? CULT.tech(c.mantra) : null;
      if (m) {
        const lab = 'คัมภีร์หลัก「' + m.nameTh + '」';
        if (c.path === 'XIAN') { add('matk', lab, 'p', 0.04 * m.tier); add('mdef', lab, 'p', 0.02 * m.tier); }
        else if (c.path === 'BODY') { add('def', lab, 'p', 0.04 * m.tier); add('hp', lab, 'p', 0.03 * m.tier); add('atk', lab, 'p', 0.02 * m.tier); }
        else if (c.path === 'DEMON') { add('atk', lab, 'p', 0.03 * m.tier); add('matk', lab, 'p', 0.03 * m.tier); add('crit', lab, 'f', 0.8 * m.tier); }
        else if (c.path === 'HEART_SOUL') { add('matk', lab, 'p', 0.04 * m.tier); add('mdef', lab, 'p', 0.03 * m.tier); add('cast', lab, 'f', 1.2 * m.tier); }
        else if (c.path === 'MECH_PUPPET') { add('def', lab, 'p', 0.035 * m.tier); add('atk', lab, 'p', 0.025 * m.tier); add('matk', lab, 'p', 0.025 * m.tier); }
        else if (c.path === 'KARMA_SAMSARA') { add('mdef', lab, 'p', 0.04 * m.tier); add('matk', lab, 'p', 0.035 * m.tier); add('hp', lab, 'p', 0.02 * m.tier); }
        else if (c.path === 'BEAST_SOVEREIGN') { add('atk', lab, 'p', 0.035 * m.tier); add('hp', lab, 'p', 0.035 * m.tier); add('move', lab, 'f', 1.0 * m.tier); }
        else if (c.path === 'SAGE_SUPPORT') { add('mdef', lab, 'p', 0.04 * m.tier); add('hp', lab, 'p', 0.035 * m.tier); add('cast', lab, 'f', 1.2 * m.tier); }
        else if (c.path === 'CRAFT_CREATION') { add('atk', lab, 'p', 0.03 * m.tier); add('matk', lab, 'p', 0.035 * m.tier); add('def', lab, 'p', 0.03 * m.tier); add('mdef', lab, 'p', 0.03 * m.tier); }
        else if (c.path === 'ARRAY_TALISMAN') { add('matk', lab, 'p', 0.04 * m.tier); add('mdef', lab, 'p', 0.035 * m.tier); add('cast', lab, 'f', 1.2 * m.tier); }
        else if (c.path === 'STRATEGY_GOVERNANCE') { add('atk', lab, 'p', 0.03 * m.tier); add('matk', lab, 'p', 0.03 * m.tier); add('def', lab, 'p', 0.035 * m.tier); add('mdef', lab, 'p', 0.035 * m.tier); }
        else { add('mdef', lab, 'p', 0.04 * m.tier); add('hp', lab, 'p', 0.03 * m.tier); add('matk', lab, 'p', 0.02 * m.tier); }
        if (m.mantraBonus) {
          addAll(lab, m.mantraBonus.p || {}, 'p');
          addAll(lab, m.mantraBonus.f || {}, 'f');
          addAll(lab, m.mantraBonus.pp || {}, 'f');
        }
      }
      let techT = 0;
      (g.MARTIAL ? g.MARTIAL.activeTechs(n) : c.techs).forEach(id => { const t = CULT.tech(id); if (!t) return; techT += t.cat === 'COMBAT_TECHNIQUE' ? t.tier : 0;
        if (g.MARTIAL && !g.MARTIAL.conditionMatches(n, t)) return;
        if (t.cat === 'LIGHTNESS_ART' || t.cat === 'MOVEMENT_TECHNIQUE') { add('move', 'วิชาเบาตัว「' + t.nameTh + '」', 'f', 3 + 2 * t.tier); add('eva', 'วิชาเบาตัว「' + t.nameTh + '」', 'p', 0.02 * t.tier); }
        else if (t.cat === 'DEFENSIVE_TECHNIQUE') { add('def', 'วิชาตั้งรับ「' + t.nameTh + '」', 'p', 0.018 * t.tier); add('mdef', 'วิชาตั้งรับ「' + t.nameTh + '」', 'p', 0.015 * t.tier); }
        else if ((t.cat === 'AUXILIARY_ART' && t.role !== 'PROFESSION_LIFESTYLE') || t.cat === 'SUPPORT_TECHNIQUE') add('mdef', 'วิชาเสริม「' + t.nameTh + '」', 'p', 0.015 * t.tier); });
      const tf = Math.min(0.3, 0.03 * techT); add('atk', 'วิชาต่อสู้ที่เรียน (Σระดับ ' + techT + ')', 'p', tf); add('matk', 'วิชาต่อสู้ที่เรียน', 'p', tf);
      if (c.track) {
        const trRealm = CULT.trackRealm(n);
        if (trRealm) {
          const trLab = 'ขั้นสายเฉพาะ「' + trRealm.nameTh + '」';
          const rb = trRealm.realmBuffs || {};
          if (rb.combatOffensePct) {
            add('atk', trLab, 'p', rb.combatOffensePct / 100);
            add('matk', trLab, 'p', rb.combatOffensePct / 100);
          }
          if (rb.combatDefensePct) {
            add('def', trLab, 'p', rb.combatDefensePct / 100);
            add('mdef', trLab, 'p', rb.combatDefensePct / 100);
          }
          if (rb.armorPenetrationPct) {
            add('pen', trLab, 'f', rb.armorPenetrationPct);
          }
          if (rb.evasionPct) {
            add('eva', trLab, 'p', rb.evasionPct / 100);
          }
          const cap = trRealm.capacityMultipliers || {};
          if (cap.senseBonus) {
            add('acc', trLab, 'f', cap.senseBonus);
          }
        }
      }
    }
    if (g.MARTIAL) {
      const skills = g.MARTIAL.skillEffects(n);
      addAll('ทักษะที่ฝึก (อาวุธตรงประเภท)', skills.p, 'p');
      addAll('ทักษะที่ฝึก', skills.f, 'f');
      const growth = g.MARTIAL.progression(n), passive = g.MARTIAL.passiveStats(n), innate = g.MARTIAL.innateStats ? g.MARTIAL.innateStats(n) : null;
      addAll('พัฒนาวิถีตามขั้น (สรีระอยู่ในสูตรฐานแล้ว)', growth.p, 'p');
      addAll('วิชาติดตัวตามอุปกรณ์', passive.p, 'p');
      addAll('วิชาติดตัวตามอุปกรณ์', passive.f, 'f');
      addAll('วิชาติดตัวตามอุปกรณ์ (แต้ม %)', passive.pp, 'f');
      if (innate) {
        addAll('วิชาเฉพาะสายย่อยติดตัว', innate.p, 'p');
        addAll('วิชาเฉพาะสายย่อยติดตัว', innate.f, 'f');
        addAll('วิชาเฉพาะสายย่อยติดตัว (แต้ม %)', innate.pp, 'f');
      }
      const subEq = g.MARTIAL.evaluateSubEquipmentBonus ? g.MARTIAL.evaluateSubEquipmentBonus(n) : null;
      if (subEq && subEq.active) {
        const seLab = 'ประสานอุปกรณ์ประจำสายย่อย (' + (subEq.reasonsTh.join(' · ') || (c && c.sub) || '') + ')';
        addAll(seLab, subEq.p, 'p');
        addAll(seLab, subEq.f, 'f');
      }
      const resSet = g.MARTIAL.evaluateResonanceSet ? g.MARTIAL.evaluateResonanceSet(n) : null;
      if (resSet && resSet.active) {
        const resLab = 'สัจธรรมชุดอุปกรณ์「' + resSet.nameTh + '」(' + resSet.pieces + '/3 ชิ้น)';
        addAll(resLab, resSet.p, 'p');
        addAll(resLab, resSet.f, 'f');
      }
      const legRes = g.MARTIAL.evaluateLegendaryRelicResonance ? g.MARTIAL.evaluateLegendaryRelicResonance(n) : null;
      if (legRes && legRes.active) {
        const legLab = 'สัจธรรมศาสตราเทพ「' + legRes.nameTh + '」(' + legRes.pieces + '/3 ชิ้น)';
        addAll(legLab, legRes.p, 'p');
        addAll(legLab, legRes.f, 'f');
      }
    }
    if (CULT.petStatBonuses && n.pets && n.pets.length) {
      const pb = CULT.petStatBonuses(n);
      if (pb && pb.activeCount > 0) {
        const pLab = 'สัตว์เลี้ยงอสูรคู่สัญญา (' + pb.activeCount + ' ตัว' + (n._beastFusedUntil && n._beastFusedUntil > ST.now ? ' · ผสานวิญญาณ' : '') + ')';
        addAll(pLab, pb.p || {}, 'p');
        addAll(pLab, pb.f || {}, 'f');
      }
    }
    if (c && c.path === 'MECH_PUPPET' && CULT.ensureMechState) {
      const ms = CULT.ensureMechState(n);
      if (ms.integrity >= 40) {
        const mLab = 'โครงสร้างหุ่นกล (' + ms.mode + ' · ความสมบูรณ์ ' + Math.round(ms.integrity) + '%)';
        if (ms.mode === 'SIEGE' || ms.mode === 'OVERDRIVE') { add('atk', mLab, 'p', 0.08); add('matk', mLab, 'p', 0.08); add('pen', mLab, 'f', 8); }
        else if (ms.mode === 'SWARM') { add('cast', mLab, 'f', 10); add('acc', mLab, 'p', 0.08); add('crit', mLab, 'f', 4); }
        else { add('def', mLab, 'p', 0.10); add('mdef', mLab, 'p', 0.08); }
      } else if (ms.integrity < 25) {
        add('def', 'หุ่นกลชำรุดหนัก', 'p', -0.06);
      }
    }
    if (c && c.path === 'KARMA_SAMSARA' && CULT.ensureKarmaState) {
      const ks = CULT.ensureKarmaState(n), stc = ks.stance || 'HUMAN';
      const kLab = 'กงล้อหกภูมิ (' + stc + ')';
      if (stc === 'DEVA') { add('mdef', kLab, 'p', 0.08); add('cast', kLab, 'f', 8); }
      else if (stc === 'ASURA') { add('atk', kLab, 'p', 0.08); add('matk', kLab, 'p', 0.08); add('critDmg', kLab, 'f', 12); }
      else if (stc === 'PRETA') { add('eva', kLab, 'p', 0.08); add('pen', kLab, 'f', 8); }
      else if (stc === 'NARAKA') { add('crit', kLab, 'f', 5); add('pen', kLab, 'f', 10); }
      else if (stc === 'ANIMAL' || stc === 'BEAST') { add('hp', kLab, 'p', 0.08); add('move', kLab, 'f', 8); }
      else { add('def', kLab, 'p', 0.06); add('mdef', kLab, 'p', 0.06); add('acc', kLab, 'p', 0.06); }
    }
    // ใจสู้/พิเศษ
    const mind = 0.9 + E(n, 'personality.courage') / 100 * 0.12 + E(n, 'aptitudes.combat') / 100 * 0.18 - 1; add('atk', 'ใจสู้/พรสวรรค์', 'p', mind); add('matk', 'ใจสู้/พรสวรรค์', 'p', mind);
    const sp = HC.special(n, 'combat.powerMult') - 1; if (sp) { add('atk', 'คุณสมบัติพิเศษ', 'p', sp); add('matk', 'คุณสมบัติพิเศษ', 'p', sp); }
    if (n.mentorImprint) {
      const miLab = 'มรดกถ่ายทอดตบะ「' + (n.mentorImprint.mentorNameTh || 'อาจารย์') + '」';
      const boost = n.mentorImprint.statBonusPct || 0.08;
      ['hp', 'atk', 'matk', 'def', 'mdef'].forEach(k => add(k, miLab, 'p', boost));
      add('cast', miLab, 'f', 8);
      add('acc', miLab, 'f', 10);
    }
    const stanceSpec = ST.getActiveStanceSpec(n);
    if (stanceSpec) {
      const stMult = ST.hasStanceFlowAmplifier(n) ? 1.15 : 1.0;
      const stLab = 'ท่วงท่า「' + stanceSpec.nameTh + '」' + (stMult > 1 ? ' (ไหลลื่น +15%)' : '');
      for (const k in (stanceSpec.p || {})) add(k, stLab, 'p', stanceSpec.p[k] * stMult);
      for (const k in (stanceSpec.f || {})) add(k, stLab, 'f', stanceSpec.f[k] * stMult);
    }
    if (CULT.MERIDIANS && CULT.MERIDIANS.getStatBonuses && n.meridians) {
      const mb = CULT.MERIDIANS.getStatBonuses(n, ST.now);
      if (mb && mb.openedCount > 0) {
        const mLab = 'เส้นลมปราณพิสดารทั้งแปด (' + mb.openedCount + '/8 เส้น' + (mb.overdrive ? ' · ปะทุขีดสุด' : '') + ')';
        addAll(mLab, mb.p || {}, 'p');
        addAll(mLab, mb.f || {}, 'f');
      }
    }
    if (n.archetypeMasteryState && n.archetypeMasteryState.p) {
      const amLab = 'ความชำนาญสายย่อย「' + (n.archetypeMasteryState.nameTh || n.subpathArchetype) + '」ขั้นที่ ' + (n.archetypeMasteryState.tier || 1);
      addAll(amLab, n.archetypeMasteryState.p || {}, 'p');
      addAll(amLab, n.archetypeMasteryState.f || {}, 'f');
    }
    if (g.SECT && g.SECT.TOTEMS_BLOODLINES && g.SECT.TOTEMS_BLOODLINES.getUnitBonuses) {
      const tb = g.SECT.TOTEMS_BLOODLINES.getUnitBonuses(n);
      if (tb && tb.active) {
        const tbLab = tb.labelTh || 'สายเลือดบรรพกาลและเสาโทเท็ม';
        addAll(tbLab, tb.p || {}, 'p');
        addAll(tbLab, tb.f || {}, 'f');
      }
    }
    if (CULT.BEAST_SYMBIOSIS && CULT.BEAST_SYMBIOSIS.getStatBonuses) {
      const bsb = CULT.BEAST_SYMBIOSIS.getStatBonuses(n, ST.now);
      if (bsb && bsb.active) {
        const bsbLab = bsb.labelTh || 'สถิตร่างอสูรวิญญาณ';
        addAll(bsbLab, bsb.p || {}, 'p');
        addAll(bsbLab, bsb.f || {}, 'f');
      }
    }
    if (!n.foe && n.peakId && g.SECT && g.SECT.PEAKS && g.SECT.PEAKS.getUnitPeakBonuses) {
      const pkb = g.SECT.PEAKS.getUnitPeakBonuses(n);
      if (pkb && pkb.active) {
        const pkbLab = 'ค่ายกลยอดเขา「' + (pkb.nameTh || n.peakId) + '」';
        addAll(pkbLab, pkb.p || {}, 'p');
        addAll(pkbLab, pkb.f || {}, 'f');
      }
    }
    if (!n.foe) {
      const wRef = (g.SECT && g.SECT.PEAKS && g.SECT.PEAKS._activeWorld) || g.W || (g.G && g.G.W);
      const cPost = wRef && wRef.sect && wRef.sect.combatPosture;
      if (cPost === 'OFFENSIVE') add('atk', 'ท่วงท่าการรบสำนัก (รุกสังหาร)', 'p', 0.08);
      else if (cPost === 'DEFENSIVE') {
        add('def', 'ท่วงท่าการรบสำนัก (ตั้งรับพิทักษ์)', 'p', 0.10);
        add('mdef', 'ท่วงท่าการรบสำนัก (ตั้งรับพิทักษ์)', 'p', 0.10);
      }
      if (n.combatHistory && Array.isArray(n.combatHistory.unlockedTraits) && n.combatHistory.unlockedTraits.includes('TRAIT_VANGUARD_GUARD')) {
        add('def', 'รอยชำนาญ「ทวนพิทักษ์」', 'p', 0.12);
        add('mdef', 'รอยชำนาญ「ทวนพิทักษ์」', 'p', 0.12);
      }
    }
    if (!n.foe && g.ECO && g.ECO.evaluatePairedItems) {
      const pr = g.ECO.evaluatePairedItems(n);
      if (pr && pr.active) {
        const prLab = pr.pairNameTh || 'ศาสตราคู่ประสาน';
        const bm = (pr.bonusMult || 1.12) - 1;
        add('atk', prLab, 'p', bm);
        add('matk', prLab, 'p', bm);
        if (pr.critBonus) add('crit', prLab, 'f', pr.critBonus);
        if (pr.penBonus) add('pen', prLab, 'f', pr.penBonus);
      }
    }
    // อุปกรณ์
    const Eq = n.equip || {};
    for (const k in Eq) {
      const it = Eq[k];
      if (!it || (g.MARTIAL && !g.MARTIAL.gearUsable(n, it))) continue;
      const gs = ST.gearStats(it);
      let df = it.dur == null ? 1 : clamp(it.dur / 100, 0.3, 1);
      if (g.ECO && g.ECO.evaluateSoulBoundCondition) {
        const sb = g.ECO.evaluateSoulBoundCondition(n, it);
        if (sb && Number.isFinite(sb.powerMult)) df *= sb.powerMult;
      }
      const lab = '「' + it.nameTh + '」' + (df < 1 ? ' (สึก ' + Math.round(df * 100) + '%)' : '');
      for (const key in gs) if (A[key]) add(key, lab, 'f', gs[key] * df);
    }
    // บัฟโอสถ + สถานะ
    ST.purgeExpired(n, ST.now);
    (n.buffs || []).forEach(b => { if (b.until <= ST.now) return; addAll('บัฟ「' + b.name + '」', b.p, 'p'); addAll('บัฟ「' + b.name + '」', b.f, 'f'); });
    statusMods(n, add);
    (n.inj || []).forEach(i => { add('move', 'บาดแผล', 'p', -0.1 * (i.sev || 1)); add('eva', 'บาดแผล', 'p', -0.05 * (i.sev || 1)); });
    conditionMods(n, add);
    return finish(A, wp);
  }
  function getBaseFast(n) {
    const c = n.cult, Eq = n.equip || {};
    if (c && c.path === 'MECH_PUPPET' && !n.mechState && CULT.ensureMechState) CULT.ensureMechState(n);
    if (c && c.path === 'KARMA_SAMSARA' && !n.karmaState && CULT.ensureKarmaState) CULT.ensureKarmaState(n);
    const cPath = c ? c.path : '', cStage = c ? c.stage : 0, cSub = c ? c.sub : '', cMantra = c ? c.mantra : '', cTechLen = c && c.techs ? c.techs.length : 0;
    const cTechLast = cTechLen > 0 ? c.techs[cTechLen - 1] : '';
    const cTrack = c && c.track ? c.track.ordinal : 0;
    const passKey = passiveCacheKey(n);
    const wRefKey = (g.SECT && g.SECT.PEAKS && g.SECT.PEAKS._activeWorld) || g.W || (g.G && g.G.W);
    const postKey = (!n.foe && wRefKey && wRefKey.sect ? (wRefKey.sect.combatPosture || '') : '') + ':' + (n.peakId || '') + ':' + (Array.isArray(n.sectTotems) ? n.sectTotems.length : 0) + ':' + (n.subpathArchetype || '') + ':' + (n.subpathArchetypeTier || 0) + ':' + (n.combatHistory && Array.isArray(n.combatHistory.unlockedTraits) ? n.combatHistory.unlockedTraits.length : 0);
    const eqW = Eq.WEAPON || null, eqWdur = (eqW ? eqW.dur : 0) + (eqW && eqW.killTracker ? eqW.killTracker.evolutionStage * 1000 : 0) + ':' + postKey;
    const eqA = Eq.ARMOR || null, eqAdur = eqA ? eqA.dur : 0;
    const eqX = Eq.ACCESSORY || null, eqXdur = eqX ? eqX.dur : 0;
    const cb = n._csBase;
    if (cb && cb.day === HC.nowDay && cb.ver === n._ver &&
        cb.cPath === cPath && cb.cStage === cStage && cb.cSub === cSub && cb.cMantra === cMantra &&
        cb.cTechLen === cTechLen && cb.cTechLast === cTechLast && cb.cTrack === cTrack && cb.passKey === passKey &&
        cb.eqW === eqW && cb.eqWdur === eqWdur && cb.eqA === eqA && cb.eqAdur === eqAdur &&
        cb.eqX === eqX && cb.eqXdur === eqXdur) {
      return cb;
    }
    const skVer = n._cbSkillVer || 0;
    let stc = n._csStatic;
    if (!(stc && stc.cPath === cPath && stc.cStage === cStage && stc.cSub === cSub && stc.cMantra === cMantra &&
          stc.cTechLen === cTechLen && stc.cTechLast === cTechLast && stc.cTrack === cTrack && stc.passKey === passKey &&
          stc.skVer === skVer && stc.eqW === eqW && stc.eqWdur === eqWdur && stc.eqA === eqA && stc.eqAdur === eqAdur &&
          stc.eqX === eqX && stc.eqXdur === eqXdur)) {
      const sp = { hp: 0, atk: 0, matk: 0, def: 0, mdef: 0, crit: 0, critDmg: 0, eva: 0, acc: 0, pen: 0, cast: 0, move: 0 };
      const sf = { hp: 0, atk: 0, matk: 0, def: 0, mdef: 0, crit: 0, critDmg: 0, eva: 0, acc: 0, pen: 0, cast: 0, move: 0 };
      const addP = (k, v) => { if (v) sp[k] += v; };
      const addF = (k, v) => { if (!v) return; if (k === 'move') sp.move += v / 100; else sf[k] += v; };
      const addAll = (o, isF) => { for (const k in o) if (k in sp) { if (isF) addF(k, o[k]); else addP(k, o[k]); } };
      if (c) {
        const ns = CULT.normalizedStage ? CULT.normalizedStage(n) : c.stage; addF('cast', 2 * (ns - 1)); addF('move', 4 * (ns - 1));
        const rawFx = SUBFX[c.sub] || (JD.EXPANSION.subStats || {})[c.sub], fx = rawFx && g.MARTIAL ? g.MARTIAL.subStats(n, rawFx) : rawFx; if (fx) { if (fx.p) addAll(fx.p, false); if (fx.f) addAll(fx.f, true); }
        const m = c.mantra ? CULT.tech(c.mantra) : null;
        if (m) {
          if (c.path === 'XIAN') { addP('matk', 0.04 * m.tier); addP('mdef', 0.02 * m.tier); }
          else if (c.path === 'BODY') { addP('def', 0.04 * m.tier); addP('hp', 0.03 * m.tier); addP('atk', 0.02 * m.tier); }
          else if (c.path === 'DEMON') { addP('atk', 0.03 * m.tier); addP('matk', 0.03 * m.tier); addF('crit', 0.8 * m.tier); }
          else if (c.path === 'HEART_SOUL') { addP('matk', 0.04 * m.tier); addP('mdef', 0.03 * m.tier); addF('cast', 1.2 * m.tier); }
          else if (c.path === 'MECH_PUPPET') { addP('def', 0.035 * m.tier); addP('atk', 0.025 * m.tier); addP('matk', 0.025 * m.tier); }
          else if (c.path === 'KARMA_SAMSARA') { addP('mdef', 0.04 * m.tier); addP('matk', 0.035 * m.tier); addP('hp', 0.02 * m.tier); }
          else if (c.path === 'BEAST_SOVEREIGN') { addP('atk', 0.035 * m.tier); addP('hp', 0.035 * m.tier); addF('move', 1.0 * m.tier); }
          else if (c.path === 'SAGE_SUPPORT') { addP('mdef', 0.04 * m.tier); addP('hp', 0.035 * m.tier); addF('cast', 1.2 * m.tier); }
          else if (c.path === 'CRAFT_CREATION') { addP('atk', 0.03 * m.tier); addP('matk', 0.035 * m.tier); addP('def', 0.03 * m.tier); addP('mdef', 0.03 * m.tier); }
          else if (c.path === 'ARRAY_TALISMAN') { addP('matk', 0.04 * m.tier); addP('mdef', 0.035 * m.tier); addF('cast', 1.2 * m.tier); }
          else if (c.path === 'STRATEGY_GOVERNANCE') { addP('atk', 0.03 * m.tier); addP('matk', 0.03 * m.tier); addP('def', 0.035 * m.tier); addP('mdef', 0.035 * m.tier); }
          else { addP('mdef', 0.04 * m.tier); addP('hp', 0.03 * m.tier); addP('matk', 0.02 * m.tier); }
          if (m.mantraBonus) {
            if (m.mantraBonus.p) addAll(m.mantraBonus.p, false);
            if (m.mantraBonus.f) addAll(m.mantraBonus.f, true);
            if (m.mantraBonus.pp) addAll(m.mantraBonus.pp, true);
          }
        }
        let techT = 0;
        const techs = g.MARTIAL ? g.MARTIAL.activeTechs(n) : c.techs;
        for (let i = 0; i < techs.length; i++) {
          const t = CULT.tech(techs[i]); if (!t) continue;
          if (t.cat === 'COMBAT_TECHNIQUE') techT += t.tier;
          else if (g.MARTIAL && !g.MARTIAL.conditionMatches(n, t)) continue;
          else if (t.cat === 'LIGHTNESS_ART' || t.cat === 'MOVEMENT_TECHNIQUE') { addF('move', 3 + 2 * t.tier); addP('eva', 0.02 * t.tier); }
          else if (t.cat === 'DEFENSIVE_TECHNIQUE') { addP('def', 0.018 * t.tier); addP('mdef', 0.015 * t.tier); }
          else if ((t.cat === 'AUXILIARY_ART' && t.role !== 'PROFESSION_LIFESTYLE') || t.cat === 'SUPPORT_TECHNIQUE') addP('mdef', 0.015 * t.tier);
        }
        const tf = Math.min(0.3, 0.03 * techT); addP('atk', tf); addP('matk', tf);
        if (c.track) {
          const trRealm = CULT.trackRealm(n);
          if (trRealm) {
            const rb = trRealm.realmBuffs || {};
            if (rb.combatOffensePct) { const v = rb.combatOffensePct / 100; addP('atk', v); addP('matk', v); }
            if (rb.combatDefensePct) { const v = rb.combatDefensePct / 100; addP('def', v); addP('mdef', v); }
            if (rb.armorPenetrationPct) addF('pen', rb.armorPenetrationPct);
            if (rb.evasionPct) addP('eva', rb.evasionPct / 100);
            const cap = trRealm.capacityMultipliers || {};
            if (cap.senseBonus) addF('acc', cap.senseBonus);
          }
        }
      }
      if (g.MARTIAL) {
        const skills = g.MARTIAL.skillEffects(n);
        addAll(skills.p, false); addAll(skills.f, true);
        const growth = g.MARTIAL.progression(n), passive = g.MARTIAL.passiveStats(n), innate = g.MARTIAL.innateStats ? g.MARTIAL.innateStats(n) : null;
        addAll(growth.p, false); addAll(passive.p, false); addAll(passive.f, true);
        if (passive.pp) addAll(passive.pp, true);
        if (innate) { addAll(innate.p, false); addAll(innate.f, true); if (innate.pp) addAll(innate.pp, true); }
        const subEq = g.MARTIAL.evaluateSubEquipmentBonus ? g.MARTIAL.evaluateSubEquipmentBonus(n) : null;
        if (subEq && subEq.active) { addAll(subEq.p, false); addAll(subEq.f, true); }
        const resSet = g.MARTIAL.evaluateResonanceSet ? g.MARTIAL.evaluateResonanceSet(n) : null;
        if (resSet && resSet.active) { addAll(resSet.p, false); addAll(resSet.f, true); }
        if ((eqW && eqW.legendary) || (eqA && eqA.legendary) || (eqX && eqX.legendary)) {
          const legRes = g.MARTIAL.evaluateLegendaryRelicResonance ? g.MARTIAL.evaluateLegendaryRelicResonance(n) : null;
          if (legRes && legRes.active) { addAll(legRes.p, false); addAll(legRes.f, true); }
        }
      }
      if (CULT.petStatBonuses && n.pets && n.pets.length) {
        const pb = CULT.petStatBonuses(n);
        if (pb && pb.activeCount > 0) { if (pb.p) addAll(pb.p, false); if (pb.f) addAll(pb.f, true); }
      }
      if (n.cult && n.cult.path === 'MECH_PUPPET' && CULT.ensureMechState) {
        const ms = CULT.ensureMechState(n);
        const intFactor = clamp((ms.integrity || 100) / 100, 0.25, 1.0);
        if (intFactor < 1.0) { addP('atk', -(1 - intFactor) * 0.25); addP('def', -(1 - intFactor) * 0.25); }
        if (ms.mode === 'SIEGE') { addP('atk', 0.16); addP('matk', 0.16); addF('pen', 12); addP('eva', -0.08); }
        else if (ms.mode === 'SWARM') { addF('cast', 16); addF('acc', 12); addP('eva', 0.08); }
        else { addP('def', 0.18); addP('mdef', 0.14); }
      }
      if (n.cult && n.cult.path === 'KARMA_SAMSARA' && CULT.ensureKarmaState) {
        const ks = CULT.ensureKarmaState(n);
        if (ks.stance === 'ASURA') { addP('atk', 0.16); addP('matk', 0.14); addF('crit', 6); addP('def', -0.06); }
        else if (ks.stance === 'DEVA') { addP('mdef', 0.18); addP('def', 0.12); addF('cast', 10); }
        else if (ks.stance === 'NARAKA') { addF('pen', 16); addF('acc', 12); addP('matk', 0.10); }
        else if (ks.stance === 'PRETA') { addP('matk', 0.12); addF('eva', 8); }
        else if (ks.stance === 'HUMAN') { addP('def', 0.14); addP('mdef', 0.14); addF('acc', 8); }
        else if (ks.stance === 'ANIMAL') { addF('move', 12); addP('atk', 0.12); addP('eva', 0.10); }
      }
      if (n.mentorImprint && Number.isFinite(n.mentorImprint.combatStatBonus) && n.mentorImprint.combatStatBonus > 0) {
        const boost = clamp(n.mentorImprint.combatStatBonus, 0, 0.18);
        ['hp', 'atk', 'matk', 'def', 'mdef'].forEach(k => addP(k, boost));
        addF('cast', 8); addF('acc', 10);
      }
      const stanceSpec = ST.getActiveStanceSpec(n);
      if (stanceSpec) {
        const stMult = ST.hasStanceFlowAmplifier(n) ? 1.15 : 1.0;
        for (const k in (stanceSpec.p || {})) addP(k, stanceSpec.p[k] * stMult);
        for (const k in (stanceSpec.f || {})) addF(k, stanceSpec.f[k] * stMult);
      }
      if (CULT.MERIDIANS && CULT.MERIDIANS.getStatBonuses && n.meridians) {
        const mb = CULT.MERIDIANS.getStatBonuses(n, ST.now);
        if (mb && mb.openedCount > 0) { if (mb.p) addAll(mb.p, false); if (mb.f) addAll(mb.f, true); }
      }
      if (n.archetypeMasteryState && n.archetypeMasteryState.p) {
        addAll(n.archetypeMasteryState.p, false);
        if (n.archetypeMasteryState.f) addAll(n.archetypeMasteryState.f, true);
      }
      if (g.SECT && g.SECT.TOTEMS_BLOODLINES && g.SECT.TOTEMS_BLOODLINES.getUnitBonuses) {
        const tb = g.SECT.TOTEMS_BLOODLINES.getUnitBonuses(n);
        if (tb && tb.active) { if (tb.p) addAll(tb.p, false); if (tb.f) addAll(tb.f, true); }
      }
      if (CULT.BEAST_SYMBIOSIS && CULT.BEAST_SYMBIOSIS.getStatBonuses) {
        const bsb = CULT.BEAST_SYMBIOSIS.getStatBonuses(n, ST.now);
        if (bsb && bsb.active) { if (bsb.p) addAll(bsb.p, false); if (bsb.f) addAll(bsb.f, true); }
      }
      if (!n.foe && n.peakId && g.SECT && g.SECT.PEAKS && g.SECT.PEAKS.getUnitPeakBonuses) {
        const pkb = g.SECT.PEAKS.getUnitPeakBonuses(n);
        if (pkb && pkb.active) { if (pkb.p) addAll(pkb.p, false); if (pkb.f) addAll(pkb.f, true); }
      }
      if (!n.foe) {
        const wRef = (g.SECT && g.SECT.PEAKS && g.SECT.PEAKS._activeWorld) || g.W || (g.G && g.G.W);
        const cPost = wRef && wRef.sect && wRef.sect.combatPosture;
        if (cPost === 'OFFENSIVE') addP('atk', 0.08);
        else if (cPost === 'DEFENSIVE') { addP('def', 0.10); addP('mdef', 0.10); }
        if (n.combatHistory && Array.isArray(n.combatHistory.unlockedTraits) && n.combatHistory.unlockedTraits.includes('TRAIT_VANGUARD_GUARD')) {
          addP('def', 0.12); addP('mdef', 0.12);
        }
      }
      if (!n.foe && g.ECO && g.ECO.evaluatePairedItems) {
        const pr = g.ECO.evaluatePairedItems(n);
        if (pr && pr.active) {
          const bm = (pr.bonusMult || 1.12) - 1;
          addP('atk', bm); addP('matk', bm);
          if (pr.critBonus) addF('crit', pr.critBonus);
          if (pr.penBonus) addF('pen', pr.penBonus);
        }
      }
      for (const k in Eq) {
        const it = Eq[k];
        if (!it || (g.MARTIAL && !g.MARTIAL.gearUsable(n, it))) continue;
        const gs = ST.gearStats(it);
        let df = it.dur == null ? 1 : clamp(it.dur / 100, 0.3, 1);
        if (g.ECO && g.ECO.evaluateSoulBoundCondition) {
          const sb = g.ECO.evaluateSoulBoundCondition(n, it);
          if (sb && Number.isFinite(sb.powerMult)) df *= sb.powerMult;
        }
        for (const key in gs) if (key in sp) addF(key, gs[key] * df);
      }
      const st = CULT.stageInfo(n), L = st.combatPower, sub = c ? CULT.subInfo(c.path, c.sub) : null;
      const Lo = L * (sub ? sub.combatBonus : 1), Ld = L * (sub ? sub.defenseBonus : 1), pw = PATHW[c && PATHW[c.path] ? c.path : 'NONE'];
      const progBody = (g.MARTIAL && g.MARTIAL.progression) ? g.MARTIAL.progression(n).body : {};
      stc = n._csStatic = {
        cPath, cStage, cSub, cMantra, cTechLen, cTechLast, cTrack, passKey, skVer,
        eqW, eqWdur, eqA, eqAdur, eqX, eqXdur, sp, sf, Lo, Ld, pw, progBody, hpMult: CULT.hpMult(n)
      };
    }
    const progBody = stc.progBody, Lo = stc.Lo, Ld = stc.Ld, pw = stc.pw;
    const dFast = (n._d && n._d.day === HC.nowDay && n._d.ver === n._ver) ? n._d : null;
    const baseHpMax = dFast ? dFast.hpMax : Math.round(70 + HC.eff(n, 'physiology.vitality') * 1.1 + HC.eff(n, 'physiology.toughness') * 0.5 + HC.eff(n, 'physiology.strength') * 0.2);
    const baseWalk = dFast ? dFast.walkSpeed : (0.75 + (HC.eff(n, 'physiology.speed') * 0.7 + HC.eff(n, 'physiology.agility') * 0.3) / 100 * 0.9);
    const effHpMax = Math.round(baseHpMax + (progBody.vitality || 0) * 1.1 + (progBody.toughness || 0) * 0.5 + (progBody.strength || 0) * 0.2);
    const effWalk = baseWalk + ((progBody.speed || 0) * 0.7 + (progBody.agility || 0) * 0.3) / 100 * 0.9;
    const b = {
      hp: effHpMax * stc.hpMult,
      atk: Lo * 0.6 * pw.atk,
      matk: Lo * 0.6 * pw.matk,
      def: Ld * 0.5 * pw.def,
      mdef: Ld * 0.45 * pw.mdef,
      crit: 5, critDmg: 150,
      eva: Lo * 0.55, acc: Lo * 0.55,
      pen: 0, cast: 100,
      move: 100 * effWalk / 1.05
    };
    const strF = 0.65 + 0.6 * (E(n, 'physiology.strength') * .4 + E(n, 'physiology.toughness') * .2 + E(n, 'physiology.explosiveness') * .2 + E(n, 'physiology.endurance') * .2) / 100;
    const qiF = 0.65 + 0.6 * (E(n, 'physiology.spiritualFoundation') * .35 + E(n, 'physiology.meridianCapacity') * .25 + E(n, 'intellect.comprehension') * .2 + E(n, 'intellect.willpower') * .2) / 100;
    const mind = 0.9 + E(n, 'personality.courage') / 100 * 0.12 + E(n, 'aptitudes.combat') / 100 * 0.18 - 1;
    const spMult = HC.special(n, 'combat.powerMult') - 1;
    const p = {
      hp: stc.sp.hp,
      atk: stc.sp.atk + (strF - 1) + mind + spMult,
      matk: stc.sp.matk + (qiF - 1) + mind + spMult,
      def: stc.sp.def + (0.65 + 0.6 * (E(n, 'physiology.toughness') * .5 + E(n, 'physiology.endurance') * .2 + E(n, 'physiology.vitality') * .3) / 100 - 1),
      mdef: stc.sp.mdef + (0.65 + 0.6 * (E(n, 'intellect.willpower') * .4 + E(n, 'physiology.spiritualFoundation') * .3 + E(n, 'personality.composure') * .3) / 100 - 1),
      crit: stc.sp.crit, critDmg: stc.sp.critDmg,
      eva: stc.sp.eva + (0.6 + 0.8 * (E(n, 'physiology.agility') * .4 + E(n, 'physiology.reflex') * .35 + E(n, 'physiology.speed') * .25) / 100 - 1),
      acc: stc.sp.acc + (0.6 + 0.8 * (E(n, 'intellect.perceptiveness') * .3 + E(n, 'physiology.reflex') * .25 + E(n, 'aptitudes.combat') * .25 + E(n, 'intellect.focus') * .2) / 100 - 1),
      pen: stc.sp.pen, cast: stc.sp.cast, move: stc.sp.move
    };
    const f = {
      hp: stc.sf.hp, atk: stc.sf.atk, matk: stc.sf.matk, def: stc.sf.def, mdef: stc.sf.mdef,
      crit: stc.sf.crit + (E(n, 'intellect.perceptiveness') + E(n, 'intellect.intuition') + E(n, 'aptitudes.combat')) / 3 * 0.08,
      critDmg: stc.sf.critDmg + (E(n, 'aptitudes.combat') - 50) * 0.3 + (E(n, 'personality.aggression') - 50) * 0.2,
      eva: stc.sf.eva, acc: stc.sf.acc, pen: stc.sf.pen,
      cast: stc.sf.cast + (E(n, 'physiology.reflex') - 50) * 0.4 + (E(n, 'intellect.focus') - 50) * 0.3 + (E(n, 'intellect.comprehension') - 50) * 0.2,
      move: stc.sf.move
    };
    const hpVal = Math.round(Math.max(1, b.hp * (1 + p.hp) + f.hp));
    const vMove0 = Math.round(clamp(Math.max(30, b.move * (1 + p.move) + f.move), 30, 320));
    const moveMult0 = clamp(vMove0 / b.move, 0.6, 2.2);
    const next = {
      day: HC.nowDay, ver: n._ver, cPath, cStage, cSub, cMantra, cTechLen, cTechLast, cTrack, passKey,
      eqW, eqWdur, eqA, eqAdur, eqX, eqXdur, b, p, f, hpVal, moveMult0
    };
    n._csBase = next;
    return next;
  }
  function computeFast(n) {
    const base = getBaseFast(n), b = base.b, p0 = base.p, f0 = base.f;
    const sk = n.h.skills;
    const martial = g.MARTIAL ? g.MARTIAL.weaponSkill(n) : (sk.FIST_PALM || 0);
    const mAtkP = 0.8 + 0.45 * martial / 100 - 1, mPenF = martial * 0.05;
    const s = n.h.state;
    const cond = (0.8 + 0.2 * (n._hpf == null ? 1 : n._hpf)) * (0.8 + 0.2 * s.energy / 100) * (1 - 0.3 * s.heartDemon / 100);
    const cm1 = cond - 1;
    if ((n.buffs && n.buffs.length > 0) || (n.sx && n.sx.length > 0)) ST.purgeExpired(n, ST.now);
    const hasBuffs = n.buffs && n.buffs.length > 0;
    const hasSx = n.sx && n.sx.length > 0;
    let injSev = 0;
    if (n.inj && n.inj.length) { for (let i = 0; i < n.inj.length; i++) injSev += (n.inj[i].sev || 1); }
    if (!hasBuffs && !hasSx) {
      const pEva = p0.eva + (injSev ? -0.05 * injSev : 0) + cm1;
      const pMove = p0.move + (injSev ? -0.1 * injSev : 0);
      const vCrit = clamp(b.crit * (1 + p0.crit) + f0.crit, 0, 80);
      const vCritDmg = clamp(b.critDmg * (1 + p0.critDmg) + f0.critDmg, 110, 450);
      const vPen = clamp(b.pen * (1 + p0.pen) + f0.pen + mPenF, 0, 70);
      const vCast = clamp(Math.max(30, b.cast * (1 + p0.cast) + f0.cast + cm1 * 40), 30, 320);
      const vMove = clamp(Math.max(30, b.move * (1 + pMove) + f0.move), 30, 320);
      return {
        hp: base.hpVal,
        atk: Math.round(Math.max(0, b.atk * (1 + p0.atk + mAtkP + cm1) + f0.atk)),
        matk: Math.round(Math.max(0, b.matk * (1 + p0.matk + cm1) + f0.matk)),
        def: Math.round(Math.max(0, b.def * (1 + p0.def) + f0.def)),
        mdef: Math.round(Math.max(0, b.mdef * (1 + p0.mdef) + f0.mdef)),
        crit: Math.round(vCrit * 10) / 10,
        critDmg: Math.round(vCritDmg * 10) / 10,
        eva: Math.round(Math.max(0, b.eva * (1 + pEva) + f0.eva)),
        acc: Math.round(Math.max(0, b.acc * (1 + p0.acc + cm1) + f0.acc)),
        pen: Math.round(vPen * 10) / 10,
        cast: Math.round(vCast),
        move: Math.round(vMove)
      };
    }
    const p = { hp: p0.hp, atk: p0.atk, matk: p0.matk, def: p0.def, mdef: p0.mdef, crit: p0.crit, critDmg: p0.critDmg, eva: p0.eva, acc: p0.acc, pen: p0.pen, cast: p0.cast, move: p0.move };
    const f = { hp: f0.hp, atk: f0.atk, matk: f0.matk, def: f0.def, mdef: f0.mdef, crit: f0.crit, critDmg: f0.critDmg, eva: f0.eva, acc: f0.acc, pen: f0.pen, cast: f0.cast, move: f0.move };
    const addP = (k, v) => { if (v) p[k] += v; };
    const addF = (k, v) => { if (!v) return; if (k === 'move') p.move += v / 100; else f[k] += v; };
    const addAll = (o, isF) => { for (const k in o) if (k in b) { if (isF) addF(k, o[k]); else addP(k, o[k]); } };
    if (hasBuffs) for (let i = 0; i < n.buffs.length; i++) { const bf = n.buffs[i]; if (bf.until <= ST.now && ST.now > 0) continue; if (bf.p) addAll(bf.p, false); if (bf.f) addAll(bf.f, true); }
    if (hasSx) for (let i = 0; i < n.sx.length; i++) { const x = n.sx[i]; if (x.until <= ST.now || x.fromBuffCatalog) continue; const S = SK.STATUS[x.k]; if (!S) continue; if (S.mods) addAll(S.mods, true); if (S.pmods) addAll(S.pmods, false); }
    addP('atk', mAtkP); addF('pen', mPenF);
    if (injSev) { addP('move', -0.1 * injSev); addP('eva', -0.05 * injSev); }
    addP('atk', cm1); addP('matk', cm1); addP('acc', cm1); addP('eva', cm1); addF('cast', cm1 * 40);
    const v = {};
    for (let i = 0; i < ST.KEYS.length; i++) {
      const k = ST.KEYS[i];
      let x = b[k] * (1 + p[k]) + f[k];
      if (k === 'hp') x = Math.max(1, x); else x = Math.max(k === 'cast' || k === 'move' ? 30 : 0, x);
      if (k === 'crit') x = clamp(x, 0, 80); else if (k === 'pen') x = clamp(x, 0, 70); else if (k === 'critDmg') x = clamp(x, 110, 450); else if (k === 'cast' || k === 'move') x = clamp(x, 30, 320);
      v[k] = (k === 'crit' || k === 'critDmg' || k === 'pen') ? Math.round(x * 10) / 10 : Math.round(x);
    }
    return v;
  }
  function statusMods(u, add) {
    (u.sx || []).forEach(x => { if (x.until <= ST.now || x.fromBuffCatalog) return; const S = SK.STATUS[x.k]; if (!S) return; const lab = 'สถานะ' + S.nameTh; if (S.mods) for (const k in S.mods) add(k, lab, 'f', S.mods[k]); if (S.pmods) for (const k in S.pmods) add(k, lab, 'p', S.pmods[k]); });
  }
  function conditionMods(u, add) {
    const s = u.foe ? { hp: u.hp, energy: 100, heartDemon: 0 } : u.h.state;
    const hpf = u.foe ? clamp(u.hp / u.hpMax, 0, 1) : clamp(s.hp / (u._hpMaxHint || 1), 0, 1);
    const cond = (0.8 + 0.2 * (u.foe ? hpf : u._hpf == null ? 1 : u._hpf)) * (0.8 + 0.2 * s.energy / 100) * (1 - 0.3 * s.heartDemon / 100);
    ['atk', 'matk', 'acc', 'eva'].forEach(k => add(k, 'สภาพร่างกาย (เลือด/แรง/จิตมาร)', 'p', cond - 1)); add('cast', 'สภาพร่างกาย', 'f', (cond - 1) * 40);
  }
  function computeFoe(u, A, add, wp) {
    if (u.isSummon && u.summonStats) {
      ST.KEYS.forEach(k => {
        A[k].b = k === 'hp' ? u.hpMax : Number.isFinite(u.summonStats[k]) ? u.summonStats[k] : 0;
        if (wp) A[k].parts.push(['พลังร่างอัญเชิญจากผู้ร่าย', 'b', A[k].b]);
      });
      statusMods(u, add); conditionMods(u, add); return finish(A, wp);
    }
    const P = u.power || 20, beast = u.kind === 'beast', t = u.tier || 1;
    A.atk.b = P * (beast ? 0.62 : 0.55); A.matk.b = P * (beast ? 0.25 : 0.2); A.def.b = P * (beast ? 0.5 : 0.48) * (0.95 + 0.03 * t); A.mdef.b = P * (beast ? 0.32 : 0.3); A.acc.b = P * 0.55; A.eva.b = P * (beast ? 0.62 : 0.5);
    A.hp.b = u.hpMax; A.crit.b = 5 + t; A.critDmg.b = 150; A.cast.b = 100 + t * 3; A.move.b = 100; A.pen.b = t;
    if (wp) { ['atk', 'matk', 'def', 'mdef', 'acc', 'eva', 'hp', 'crit', 'critDmg', 'cast', 'move', 'pen'].forEach(k => A[k].parts.push(['ฐานของ' + (beast ? 'อสูร' : 'ศัตรู') + ' ระดับ ' + t, 'b', A[k].b])); }
    const stanceSpec = ST.getActiveStanceSpec(u);
    if (stanceSpec) {
      const stLab = 'ท่วงท่า「' + stanceSpec.nameTh + '」';
      for (const k in (stanceSpec.p || {})) add(k, stLab, 'p', stanceSpec.p[k]);
      for (const k in (stanceSpec.f || {})) add(k, stLab, 'f', stanceSpec.f[k]);
    }
    statusMods(u, add); conditionMods(u, add); return finish(A, wp);
  }
  function finish(A, wp) {
    const v = {}, parts = wp ? {} : null;
    ST.KEYS.forEach(k => { const a = A[k]; let x = a.b * (1 + a.p) + a.f; if (k === 'hp') x = Math.max(1, x); else x = Math.max(k === 'cast' || k === 'move' ? 30 : 0, x);
      if (k === 'crit') x = clamp(x, 0, 80); if (k === 'pen') x = clamp(x, 0, 70); if (k === 'critDmg') x = clamp(x, 110, 450); if (k === 'cast' || k === 'move') x = clamp(x, 30, 320);
      v[k] = (k === 'crit' || k === 'critDmg' || k === 'pen') ? Math.round(x * 10) / 10 : Math.round(x); if (wp) parts[k] = a.parts; });
    return { v, parts };
  }
  function earliestExpiry(u) {
    let minExp = 0;
    if (u.buffs && u.buffs.length) {
      for (let i = 0; i < u.buffs.length; i++) {
        const u0 = u.buffs[i].until;
        if (u0 && (!minExp || u0 < minExp)) minExp = u0;
      }
    }
    if (u.sx && u.sx.length) {
      for (let i = 0; i < u.sx.length; i++) {
        const u0 = u.sx[i].until;
        if (u0 && (!minExp || u0 < minExp)) minExp = u0;
      }
    }
    return minExp;
  }
  ST.get = n => {
    if ((n.buffs && n.buffs.length > 0) || (n.sx && n.sx.length > 0)) ST.purgeExpired(n, ST.now);
    const c = n._cs, ttl = (n.act && n.act.id === 'fight') ? 3 : 30;
    if (n.foe) {
      const sxL = n.sx ? n.sx.length : 0, sxLast = sxL ? n.sx[sxL - 1] : null;
      if (c && ST.now > 0 && ST.now >= c.t && ST.now - c.t < ttl && (!c.nextExp || ST.now < c.nextExp) && c.sxL === sxL && c.sxLast === sxLast) return c.v;
      const r = compute(n, false);
      n._cs = { t: ST.now, v: r.v, nextExp: earliestExpiry(n), sxL, sxLast };
      return r.v;
    }
    const eq = n.equip || {}, pk = passiveCacheKey(n), s0 = n.h && n.h.state, injL = n.inj ? n.inj.length : 0;
    if (c && ST.now > 0 && ST.now >= c.t && ST.now - c.t < ttl && (!c.nextExp || ST.now < c.nextExp) && c.eqW === eq.WEAPON && c.eqA === eq.ARMOR && c.eqX === eq.ACCESSORY && c.ver === n._ver && c.sub === (n.cult && n.cult.sub) && c.stage === (n.cult && n.cult.stage) && c.passKey === pk && (!s0 || (c.injL === injL && Math.abs(s0.hp - c.hp0) < 4 && Math.abs(s0.energy - c.en0) < 6))) return c.v;
    n._hpf = clamp(s0.hp / Math.max(1, hpMaxBase(n)), 0, 1);
    const v = computeFast(n); n._cs = { t: ST.now, v, nextExp: earliestExpiry(n), eqW: eq.WEAPON, eqA: eq.ARMOR, eqX: eq.ACCESSORY, ver: n._ver, sub: n.cult && n.cult.sub, stage: n.cult && n.cult.stage, passKey: pk, hp0: s0.hp, en0: s0.energy, injL }; return v;
  };
  function hpMaxBase(n) { return getBaseFast(n).b.hp; }
  ST.explain = n => { if (!n.foe) n._hpf = clamp(n.h.state.hp / Math.max(1, hpMaxBase(n)), 0, 1); return compute(n, true); };
  ST.hpMax = n => {
    if (n.foe) return n.hpMax;
    const base = getBaseFast(n);
    if (!n.buffs || !n.buffs.length) return base.hpVal;
    let pHp = base.p.hp, fHp = base.f.hp;
    for (let i = 0; i < n.buffs.length; i++) {
      const bf = n.buffs[i];
      if (!bf || (bf.until <= ST.now && ST.now > 0)) continue;
      if (bf.p && bf.p.hp) pHp += bf.p.hp;
      if (bf.f && bf.f.hp) fHp += bf.f.hp;
    }
    return Math.round(Math.max(1, base.b.hp * (1 + pHp) + fHp));
  };
  ST.moveMult = n => {
    if (!n.foe && (!n.buffs || !n.buffs.length) && (!n.sx || !n.sx.length)) {
      const base = getBaseFast(n);
      if (!n.inj || !n.inj.length) return base.moveMult0;
      let injSev = 0; for (let i = 0; i < n.inj.length; i++) injSev += (n.inj[i].sev || 1);
      const vMove = Math.round(clamp(Math.max(30, base.b.move * (1 + base.p.move - 0.1 * injSev) + base.f.move), 30, 320));
      return clamp(vMove / base.b.move, 0.6, 2.2);
    }
    const v = ST.get(n); const base = n.foe ? 100 : getBaseFast(n).b.move; return clamp(v.move / base, 0.6, 2.2);
  };
  /* พลังรบรวม (ใช้ในภารกิจ/จัดอันดับ) — ปรับเทียบให้ใกล้ของเดิม (ST.RK) */
  ST.RK = 1.15;
  ST.rating = (n, v) => {
    const computeV = v || ST.get(n);
    if (!v && n._cs && n._cs.v === computeV && n._cs.rating !== undefined) return n._cs.rating;
    const L = n.foe ? n.power : CULT.stageInfo(n).combatPower, off = Math.max(computeV.atk, computeV.matk), aref = L * 0.6;
    const offE = off * (1 + computeV.crit / 100 * (computeV.critDmg / 100 - 1)) * (0.6 + 0.4 * computeV.cast / 100) * (1 + computeV.pen / 150) * (0.85 + 0.15 * clamp(computeV.acc / (L * 0.55), 0.5, 2));
    const hpE = computeV.hp * (1 + 0.8 * ((computeV.def + computeV.mdef) / 2) / Math.max(1, aref)) * (1 + 0.25 * computeV.eva / Math.max(1, L * 0.55));
    const bloodMult = (!n.foe && n.bloodlineTrait && Number.isFinite(n.bloodlineTrait.combatPowerBonus)) ? (1 + n.bloodlineTrait.combatPowerBonus) : 1;
    const scarMult = (!n.foe && Array.isArray(n.daoScars) && n.daoScars.length) ? (1 + Math.min(0.24, n.daoScars.reduce((sum, sc) => sum + ((sc && sc.combatPowerBonus) || 0), 0))) : 1;
    const wsMult = (!n.foe && n.equip && n.equip.WEAPON && n.equip.WEAPON.weaponSpirit && Number.isFinite(n.equip.WEAPON.weaponSpirit.multBonus)) ? (1 + Math.min(0.32, n.equip.WEAPON.weaponSpirit.multBonus)) : 1;
    const asmMult = (!n.foe && Array.isArray(n.assemblyTitles) && n.assemblyTitles.length) ? (1 + Math.min(0.18, n.assemblyTitles.length * 0.06)) : 1;
    const rt = Math.max(3, ST.RK * Math.pow(offE, 0.55) * Math.pow(hpE, 0.45) * bloodMult * scarMult * wsMult * asmMult);
    if (!v && n._cs && n._cs.v === computeV) n._cs.rating = rt;
    return rt;
  };
  ST.recover = n => { if (n.foe || !n.cult) return; const s = n.h.state, q = CULT.qiMax(n); s.qi = Math.min(q, (s.qi == null ? q : s.qi) + q * 0.35); };

  /* ---------- ชุบไอเท็ม: โอสถบัฟการรบ + การเตรียมตัวก่อนศึกหนัก ---------- */
  const oApplyPill = ECO.applyPill;
  ECO.applyPill = (W, npc, key) => {
    const info = ECO.pillInfo(key);
    if (!info || !info.effect.cbBuff) return oApplyPill(W, npc, key);
    const b = info.effect.cbBuff; ST.addBuff(npc, b); if (npc.cult) npc.cult.toxic = Math.min(100, (npc.cult.toxic || 0) + (info.effect.toxicity || 0));
    HC.bump(npc); return { info, msgs: ['บัฟ「' + b.name + '」'] };
  };
  ST.preFight = (W, n, hard) => {
    if (n.foe || !n.cult || (n.buffs && n.buffs.some(b => b.until > ST.now))) return;
    const isCb = k => k.startsWith('P:CB_') || !!(ECO.pillInfo(k)?.effect?.cbBuff);
    const keys = []; if (n.inv && n.inv.pills) Object.keys(n.inv.pills).forEach(k => { if (isCb(k) && n.inv.pills[k] > 0) keys.push([k, 'own']); });
    if (!keys.length && n.rank >= 1) Object.keys(W.sect.stock).forEach(k => { if (isCb(k) && W.sect.stock[k] > 0) keys.push([k, 'sect']); });
    if (!keys.length) return;
    const c = n.cult, pref = (c.path === 'BODY' || c.path === 'BEAST_SOVEREIGN') ? ['STONE', 'FURY'] : (c.path === 'XIAN' || c.path === 'HEART_SOUL' || c.path === 'ARRAY_TALISMAN' || c.path === 'SAGE_SUPPORT') ? ['SPIRIT', 'EYE', 'WIND'] : c.path === 'DEMON' ? ['FURY', 'WIND', 'STONE'] : ['STONE', 'SPIRIT', 'FURY', 'EYE'];
    let best = null, bs = -1;
    keys.forEach(([k, src]) => {
      const id = k.startsWith('P:CB_') ? k.slice(5) : k.slice(2);
      const info = ECO.pillInfo(k); if (!info) return;
      if (id === 'BERSERK' && !(hard && (E(n, 'personality.aggression') > 55 || n.h.state.hp < CULT.hpMax(n) * 0.5))) return;
      if (info.tier > CULT.equivalentStage(n) + 1) return;
      const s = (pref.some(p => id.includes(p)) ? 2 : 1) + (src === 'own' ? 0.5 : 0) + (info.effect?.cbBuff ? 0.5 : 0) + W.rng.next();
      if (s > bs) { bs = s; best = [k, src]; }
    });
    if (!best) return;
    let r;
    if (best[1] === 'own') { n.inv.pills[best[0]]--; if (n.inv.pills[best[0]] <= 0) delete n.inv.pills[best[0]]; r = ECO.applyPill(W, n, best[0]); }
    else r = ECO.usePill(W, n, best[0]);
    if (r) AI_mem(W, n, 'กิน' + r.info.name + 'ก่อนออกศึก');
  };
  function AI_mem(W, n, t) { if (g.AI && g.AI.mem) g.AI.mem(W, n, t, 0.4); }

  /* ---------- ผูกเข้าระบบเดิม ---------- */
  CULT.powerLegacy = CULT.power; CULT.hpMaxLegacy = CULT.hpMax;
  CULT.power = (npc, opts) => ST.rating(npc);
  CULT.hpMax = npc => ST.hpMax(npc);
  CULT.speedMult = npc => ST.moveMult(npc);
  const oBump = HC.bump, oTouch = HC.touch;
  HC.bump = function (n) { if (n) { n._cs = null; n._csBase = null; } return oBump.apply(this, arguments); };
  if (oTouch) HC.touch = function (n) { if (n) { n._cs = null; n._csBase = null; } return oTouch.apply(this, arguments); };
  // ค่าเริ่มของไอเท็ม: เก็บ effects ไว้ให้คำนวณเจาะเกราะ
  const oMint = ECO.mintGear;
  ECO.mintGear = (a, b, c, d) => {
    const gear = oMint(a, b, c, d);
    const x = (a && a.sect && a.npcs) ? b : a;
    const it = x && x.outItemId ? ECO.itemById[x.outItemId] : (x && x.id && ECO.itemById[x.id] ? ECO.itemById[x.id] : (x && x.slot ? x : null));
    if (it) {
      if (it.effects && !gear.fx) gear.fx = it.effects;
      if (it.effects && !gear.effects) gear.effects = it.effects;
      if (it.grantedSkills && !gear.grantedSkills) gear.grantedSkills = it.grantedSkills.slice();
      if (it.skillModifiers && !gear.skillModifiers) gear.skillModifiers = JSON.parse(JSON.stringify(it.skillModifiers));
      if (it.composableEffects && !gear.composableEffects) gear.composableEffects = JSON.parse(JSON.stringify(it.composableEffects));
      if (it.charges != null && gear.charges == null) { gear.charges = it.charges; gear.maxCharges = it.maxCharges || it.charges; }
    }
    return gear;
  };
  ST.calcCombatStats = ST.get;
  g.STATS = ST;
  if (typeof module === 'object' && module.exports) module.exports = ST;
})(typeof globalThis !== 'undefined' ? globalThis : this);
