/* cultivation.js — วิถีบำเพ็ญ (5 วิถีหลัก: XIAN/BODY/GOD/DEMON/HEART_SOUL) + ระบบรากวิญญาณและธาตุกลาง (ELEM v2.0.1)
 * ใช้ค่ามนุษย์จาก HC เท่านั้น (ไม่แก้ js/human_core.js; ล็อก HC.FINGERPRINT === '155:2f9c9dd7')
 * npc.cult = null (ปุถุชน) หรือ {path, sub, stage, prog, mantra, techs[], learning, toxic, dev(จิตมาร)...}
 * ข้อมูลความชำนาญธาตุเก็บใน npc.ext.elementalSystem และโครงสร้างรากวิญญาณเก็บใน npc.h.root */
(function (g) {
  'use strict';
  const U = g.U || require('./util.js'), HC = g.HC, JD = g.JD;
  const clamp = U.clamp;

  /* =========================================================================
   * 0) ระบบธาตุและรากวิญญาณกลาง (ELEM / ELEMENTAL AUTHORITY v2.0)
   * ========================================================================= */
  const ELEM = {
    VERSION: '2.0.1',
    // Character generation throughput is measured from deterministic 90/180-day
    // world simulations (14 runs: 326–436 appearances/year; pooled mean 386.43).
    // The configured 390/year is a rounded calibration, not a biological birth rate.
    GENERATED_CHARACTERS_PER_WORLD_YEAR: 390,
    ROOT_COUNT_PROBABILITIES: Object.freeze({
      1: 0.9789997435897436,
      2: 0.02,
      3: 0.001,
      4: 0.0000002564102564102564
    }),
    // Conditional grade-cohort probabilities are calibrated independently for each
    // root count. Root-count frequency × conditional cohort frequency determines
    // the world-scale interval displayed to the player.
    ROOT_GRADE_PROBABILITIES: Object.freeze({
      1: Object.freeze({
        HEAVENLY: 0.0005238208857339738,
        TRUE: 0.003688879476999816,
        SPIRIT: 0.0124719258508089,
        MORTAL: 0.5,
        DEFECTIVE: 0.4833153737864573
      }),
      2: Object.freeze({
        HEAVENLY_PAIR: 0.001282051282051282,
        HEAVENLY_TRUE_OR_SPIRIT: 0.02564102564102564,
        TRUE_PAIR: 0.020512820512820513,
        HEAVENLY_WITH_MORTAL_OR_DEFECTIVE: 0.007690769538400011,
        COMMON: 0.9448733330257025
      }),
      3: Object.freeze({
        HEAVENLY_TRIPLE: 0.002564102564102564,
        TWO_HEAVENLY_ONE_TRUE_OR_SPIRIT: 0.005128205128205128,
        ONE_HEAVENLY_TWO_TRUE_OR_SPIRIT: 0.02564102564102564,
        TRUE_TRIPLE: 0.041025641025641026,
        OTHER_HEAVENLY: 0.1282051282051282,
        COMMON: 0.7974358974358975
      }),
      4: Object.freeze({ ALL_HEAVENLY: 0.005, OTHER: 0.995 })
    }),
    ORDINARY_ELEMENTS: Object.freeze([
      'FIRE', 'WATER_ICE', 'LIGHTNING', 'WIND',
      'EARTH_METAL', 'WOOD_LIFE', 'YIN_SHADOW', 'LIGHT_YANG'
    ]),
    SPECIAL_ELEMENTS: Object.freeze(['ASTRAL', 'BLOOD_DEMON']),
    ALL_ELEMENTS: Object.freeze([
      'FIRE', 'WATER_ICE', 'LIGHTNING', 'WIND',
      'EARTH_METAL', 'WOOD_LIFE', 'YIN_SHADOW', 'LIGHT_YANG',
      'ASTRAL', 'BLOOD_DEMON'
    ]),
    VALID_MODES: Object.freeze([
      'INTRINSIC_SINGLE',
      'INTRINSIC_WEIGHTED',
      'SPECIAL_ELEMENT',
      'EXPLICIT_NON_ELEMENTAL',
      'ELEMENT_LINK_ONLY',
      'ROOT_AGNOSTIC_UTILITY'
    ]),
    AFFINITY_GROUPS: Object.freeze({
      ELEMENTAL: Object.freeze([
        'FIRE', 'WATER_ICE', 'LIGHTNING', 'WIND',
        'EARTH_METAL', 'WOOD_LIFE', 'YIN_SHADOW', 'LIGHT_YANG'
      ]),
      NON_ELEMENTAL: Object.freeze([
        'SWORD', 'BLADE', 'SPEAR', 'FIST_PALM', 'MOVEMENT', 'BODY_REFINING', 'SOUL_DIVINE',
        'ALCHEMY', 'FORGING', 'ARRAY', 'TALISMAN', 'BEAST_TAMING', 'MEDICINE', 'POISON', 'SCRIPTURE'
      ])
    }),
    META: Object.freeze({
      FIRE: { id: 'FIRE', nameTh: 'ธาตุไฟ', shortTh: 'ไฟ', icon: '🔥', color: '#ff6b4a', kind: 'ORDINARY', descTh: 'เปลวเพลิง สุริยัน เตาหลอม และการเผาผลาญรุนแรง' },
      WATER_ICE: { id: 'WATER_ICE', nameTh: 'ธาตุน้ำ-น้ำแข็ง', shortTh: 'น้ำ/น้ำแข็ง', icon: '❄️', color: '#4fb2f2', kind: 'ORDINARY', descTh: 'สายน้ำ เหมันต์ หิมะ ความเยือกเย็น และการไหลเวียนฟื้นฟู' },
      LIGHTNING: { id: 'LIGHTNING', nameTh: 'ธาตุสายฟ้า', shortTh: 'สายฟ้า', icon: '⚡', color: '#ffd43b', kind: 'ORDINARY', descTh: 'อสนี ฟ้าทัณฑ์ ความเร็วฉับพลัน และการทำลายเกราะป้องกัน' },
      WIND: { id: 'WIND', nameTh: 'ธาตุลม', shortTh: 'ลม', icon: '🌪️', color: '#6ddfb5', kind: 'ORDINARY', descTh: 'สายลม พายุ เมฆา คลื่นเสียง และความพริ้วไหวไร้ร่องรอย' },
      EARTH_METAL: { id: 'EARTH_METAL', nameTh: 'ธาตุดิน-โลหะ', shortTh: 'ดิน/โลหะ', icon: '⛰️', color: '#d9a97c', kind: 'ORDINARY', descTh: 'ขุนเขา ศิลา เหล็กไหล ทองคำ คมศาสตรา และปราการตั้งรับ' },
      WOOD_LIFE: { id: 'WOOD_LIFE', nameTh: 'ธาตุไม้-ชีวิต', shortTh: 'ไม้/ชีวิต', icon: '🌿', color: '#51cf66', kind: 'ORDINARY', descTh: 'พฤกษา พลังชีวิต โอสถ สมุนไพร การเยียวยา และพิษชีวภาพ' },
      YIN_SHADOW: { id: 'YIN_SHADOW', nameTh: 'ธาตุหยิน-เงา', shortTh: 'หยิน/เงา', icon: '🌑', color: '#b197fc', kind: 'ORDINARY', descTh: 'เงามืด จันทรา มายา วิญญาณ ยมโลก และการลอบเร้น' },
      LIGHT_YANG: { id: 'LIGHT_YANG', nameTh: 'ธาตุแสง-หยาง', shortTh: 'แสง/หยาง', icon: '☀️', color: '#fcc419', kind: 'ORDINARY', descTh: 'แสงศักดิ์สิทธิ์ ปราณหยางบริสุทธิ์ เซน เมตตา และการชำระล้างมาร' },
      ASTRAL: { id: 'ASTRAL', nameTh: 'ดารา-มิติ (ธาตุพิเศษ)', shortTh: 'ดารา/มิติ', icon: '✨', color: '#74c0fc', kind: 'SPECIAL', descTh: 'พลังดวงดาว สุญญากาศ มิติ และชะตาฟ้าดิน (ธาตุพิเศษ ไม่เกิดเป็นรากวิญญาณสามัญ)' },
      BLOOD_DEMON: { id: 'BLOOD_DEMON', nameTh: 'โลหิต-มาร (ธาตุพิเศษ)', shortTh: 'โลหิต/มาร', icon: '🩸', color: '#ff4d6d', kind: 'SPECIAL', descTh: 'ปราณโลหิต อาคมมาร และการสูบกลืนตบะ (ธาตุพิเศษ ไม่เกิดเป็นรากวิญญาณสามัญ)' },
      NEUTRAL: { id: 'NEUTRAL', nameTh: 'ไร้ธาตุเฉพาะ', shortTh: 'ไร้ธาตุ', icon: '⚪', color: '#9fb0c2', kind: 'NEUTRAL', descTh: 'กระบวนท่าและอุปกรณ์พื้นฐานที่ไม่พึ่งพาปราณธาตุเฉพาะทาง' }
    }),
    ALIAS_MAP: Object.freeze({
      WATER: 'WATER_ICE',
      ICE: 'WATER_ICE',
      WOOD: 'WOOD_LIFE',
      METAL: 'EARTH_METAL',
      EARTH: 'EARTH_METAL',
      GOLD: 'EARTH_METAL',
      YIN: 'YIN_SHADOW',
      YANG: 'LIGHT_YANG',
      LIGHT: 'LIGHT_YANG',
      BLOOD: 'BLOOD_DEMON',
      SOUL: 'YIN_SHADOW',
      DARK_YIN: 'YIN_SHADOW',
      POISON_CORROSION: 'WOOD_LIFE',
      POISON: 'WOOD_LIFE',
      ไฟ: 'FIRE',
      น้ำ: 'WATER_ICE',
      น้ำแข็ง: 'WATER_ICE',
      สายฟ้า: 'LIGHTNING',
      ลม: 'WIND',
      ดิน: 'EARTH_METAL',
      ทอง: 'EARTH_METAL',
      โลหะ: 'EARTH_METAL',
      ไม้: 'WOOD_LIFE',
      หยิน: 'YIN_SHADOW',
      เงา: 'YIN_SHADOW',
      หยาง: 'LIGHT_YANG',
      แสง: 'LIGHT_YANG',
      ดารา: 'ASTRAL',
      โลหิต: 'BLOOD_DEMON'
    }),
    COMPOSITE_PROFILES: Object.freeze({
      FIVE_ELEMENTS: Object.freeze({
        mode: 'INTRINSIC_WEIGHTED',
        primary: 'WOOD_LIFE',
        compositeTag: 'FIVE_ELEMENTS',
        weights: Object.freeze({ WOOD_LIFE: 0.2, FIRE: 0.2, EARTH_METAL: 0.2, WATER_ICE: 0.2, WIND: 0.2 })
      }),
      CHAOS: Object.freeze({
        mode: 'INTRINSIC_WEIGHTED',
        primary: 'ASTRAL',
        compositeTag: 'CHAOS',
        weights: Object.freeze({ ASTRAL: 0.36, LIGHT_YANG: 0.16, YIN_SHADOW: 0.16, FIRE: 0.08, WATER_ICE: 0.08, LIGHTNING: 0.08, EARTH_METAL: 0.08 })
      }),
      YIN_YANG: Object.freeze({
        mode: 'INTRINSIC_WEIGHTED',
        primary: 'LIGHT_YANG',
        compositeTag: 'YIN_YANG',
        weights: Object.freeze({ LIGHT_YANG: 0.5, YIN_SHADOW: 0.5 })
      })
    }),
    GRADE_ORDER: Object.freeze(['DEFECTIVE', 'MORTAL', 'SPIRIT', 'TRUE', 'HEAVENLY']),
    GRADE_SCORE: Object.freeze({
      DEFECTIVE: 1.0,
      MORTAL: 2.0,
      SPIRIT: 3.0,
      TRUE: 4.0,
      HEAVENLY: 5.0
    }),
    GRADE_FACTORS: Object.freeze({
      DEFECTIVE: Object.freeze({ score: 1.0, combat: 0.72, cult: 0.65, study: 0.75, bt: -0.06, nameTh: 'รากวิญญาณบกพร่อง', shortTh: 'บกพร่อง', color: '#8a96a8' }),
      MORTAL:    Object.freeze({ score: 2.0, combat: 0.88, cult: 0.85, study: 0.90, bt:  0.00, nameTh: 'รากวิญญาณสามัญ', shortTh: 'สามัญ', color: '#9fb0c2' }),
      SPIRIT:    Object.freeze({ score: 3.0, combat: 1.00, cult: 1.05, study: 1.05, bt:  0.04, nameTh: 'รากวิญญาณชั้นจิต', shortTh: 'จิต', color: '#6ddfb5' }),
      TRUE:      Object.freeze({ score: 4.0, combat: 1.12, cult: 1.25, study: 1.18, bt:  0.08, nameTh: 'รากวิญญาณแท้จริง', shortTh: 'แท้จริง', color: '#4fb2f2' }),
      HEAVENLY:  Object.freeze({ score: 5.0, combat: 1.24, cult: 1.48, study: 1.32, bt:  0.14, nameTh: 'รากวิญญาณสวรรค์', shortTh: 'สวรรค์', color: '#f0cf4a' })
    }),
    ROOT_CAPACITY_TRAITS: Object.freeze({
      1: 'ROOT_CAPACITY_SINGLE',
      2: 'TR_ROOT_CAPACITY_DUAL',
      3: 'TR_ROOT_CAPACITY_TRIPLE',
      4: 'TR_ROOT_CAPACITY_FOURFOLD'
    }),
    TRAIT_TO_ROOT_COUNT: Object.freeze({
      ROOT_CAPACITY_SINGLE: 1,
      TR_ROOT_CAPACITY_DUAL: 2,
      TR_ROOT_CAPACITY_TRIPLE: 3,
      TR_ROOT_CAPACITY_FOURFOLD: 4
    }),
    // 1) Combat & Cultivation Efficacy Matrix (K[charEl][targetEl])
    EFFICACY_MATRIX: Object.freeze({
      FIRE:        Object.freeze({ FIRE: 1.00, WOOD_LIFE: 0.76, EARTH_METAL: 0.74, LIGHT_YANG: 0.78, WIND: 0.74, LIGHTNING: 0.68, YIN_SHADOW: 0.34, WATER_ICE: 0.22, ASTRAL: 0.36, BLOOD_DEMON: 0.44 }),
      WATER_ICE:   Object.freeze({ WATER_ICE: 1.00, WOOD_LIFE: 0.75, YIN_SHADOW: 0.76, WIND: 0.70, EARTH_METAL: 0.68, LIGHTNING: 0.64, LIGHT_YANG: 0.38, FIRE: 0.22, ASTRAL: 0.38, BLOOD_DEMON: 0.36 }),
      LIGHTNING:   Object.freeze({ LIGHTNING: 1.00, WIND: 0.78, LIGHT_YANG: 0.74, FIRE: 0.68, WATER_ICE: 0.64, EARTH_METAL: 0.64, WOOD_LIFE: 0.42, YIN_SHADOW: 0.35, ASTRAL: 0.42, BLOOD_DEMON: 0.32 }),
      WIND:        Object.freeze({ WIND: 1.00, LIGHTNING: 0.78, FIRE: 0.74, WATER_ICE: 0.70, YIN_SHADOW: 0.68, LIGHT_YANG: 0.66, WOOD_LIFE: 0.62, EARTH_METAL: 0.38, ASTRAL: 0.42, BLOOD_DEMON: 0.34 }),
      EARTH_METAL: Object.freeze({ EARTH_METAL: 1.00, FIRE: 0.74, WATER_ICE: 0.68, LIGHTNING: 0.64, LIGHT_YANG: 0.58, YIN_SHADOW: 0.52, WOOD_LIFE: 0.42, WIND: 0.38, ASTRAL: 0.38, BLOOD_DEMON: 0.35 }),
      WOOD_LIFE:   Object.freeze({ WOOD_LIFE: 1.00, FIRE: 0.76, WATER_ICE: 0.75, LIGHT_YANG: 0.72, WIND: 0.62, YIN_SHADOW: 0.54, EARTH_METAL: 0.42, LIGHTNING: 0.42, ASTRAL: 0.35, BLOOD_DEMON: 0.38 }),
      YIN_SHADOW:  Object.freeze({ YIN_SHADOW: 1.00, WATER_ICE: 0.76, WIND: 0.68, WOOD_LIFE: 0.54, EARTH_METAL: 0.52, FIRE: 0.34, LIGHTNING: 0.35, LIGHT_YANG: 0.24, ASTRAL: 0.38, BLOOD_DEMON: 0.46 }),
      LIGHT_YANG:  Object.freeze({ LIGHT_YANG: 1.00, FIRE: 0.78, LIGHTNING: 0.74, WOOD_LIFE: 0.72, WIND: 0.66, EARTH_METAL: 0.58, WATER_ICE: 0.38, YIN_SHADOW: 0.24, ASTRAL: 0.45, BLOOD_DEMON: 0.20 }),
      ASTRAL:      Object.freeze({ ASTRAL: 1.00, LIGHT_YANG: 0.68, WIND: 0.64, WATER_ICE: 0.58, YIN_SHADOW: 0.58, LIGHTNING: 0.58, EARTH_METAL: 0.52, FIRE: 0.50, WOOD_LIFE: 0.48, BLOOD_DEMON: 0.35 }),
      BLOOD_DEMON: Object.freeze({ BLOOD_DEMON: 1.00, YIN_SHADOW: 0.72, FIRE: 0.68, WOOD_LIFE: 0.58, EARTH_METAL: 0.55, WATER_ICE: 0.48, WIND: 0.45, LIGHTNING: 0.42, ASTRAL: 0.35, LIGHT_YANG: 0.20 })
    }),
    // 2) Directed Learning / Comprehension Transfer Graph (L[fromEl][toEl]) — never used directly as raw combat multiplier
    LEARNING_GRAPH: Object.freeze({
      FIRE:        Object.freeze({ FIRE: 1.00, LIGHT_YANG: 0.52, EARTH_METAL: 0.44, LIGHTNING: 0.40, WOOD_LIFE: 0.36, WIND: 0.34, BLOOD_DEMON: 0.32, ASTRAL: 0.22, YIN_SHADOW: 0.12, WATER_ICE: 0.08 }),
      WATER_ICE:   Object.freeze({ WATER_ICE: 1.00, YIN_SHADOW: 0.52, WOOD_LIFE: 0.48, WIND: 0.42, LIGHTNING: 0.32, EARTH_METAL: 0.30, ASTRAL: 0.28, LIGHT_YANG: 0.15, BLOOD_DEMON: 0.22, FIRE: 0.08 }),
      LIGHTNING:   Object.freeze({ LIGHTNING: 1.00, WIND: 0.50, LIGHT_YANG: 0.46, FIRE: 0.40, EARTH_METAL: 0.36, WATER_ICE: 0.30, ASTRAL: 0.34, WOOD_LIFE: 0.20, YIN_SHADOW: 0.16, BLOOD_DEMON: 0.18 }),
      WIND:        Object.freeze({ WIND: 1.00, LIGHTNING: 0.50, WATER_ICE: 0.42, YIN_SHADOW: 0.40, FIRE: 0.38, LIGHT_YANG: 0.36, WOOD_LIFE: 0.34, ASTRAL: 0.38, EARTH_METAL: 0.20, BLOOD_DEMON: 0.20 }),
      EARTH_METAL: Object.freeze({ EARTH_METAL: 1.00, FIRE: 0.44, WATER_ICE: 0.38, LIGHTNING: 0.36, LIGHT_YANG: 0.32, WOOD_LIFE: 0.26, YIN_SHADOW: 0.26, ASTRAL: 0.28, WIND: 0.18, BLOOD_DEMON: 0.22 }),
      WOOD_LIFE:   Object.freeze({ WOOD_LIFE: 1.00, FIRE: 0.48, WATER_ICE: 0.46, LIGHT_YANG: 0.42, WIND: 0.34, YIN_SHADOW: 0.30, BLOOD_DEMON: 0.30, EARTH_METAL: 0.24, LIGHTNING: 0.20, ASTRAL: 0.22 }),
      YIN_SHADOW:  Object.freeze({ YIN_SHADOW: 1.00, WATER_ICE: 0.50, WIND: 0.40, BLOOD_DEMON: 0.44, WOOD_LIFE: 0.30, ASTRAL: 0.30, EARTH_METAL: 0.24, LIGHTNING: 0.18, FIRE: 0.14, LIGHT_YANG: 0.10 }),
      LIGHT_YANG:  Object.freeze({ LIGHT_YANG: 1.00, FIRE: 0.50, LIGHTNING: 0.45, WOOD_LIFE: 0.42, ASTRAL: 0.42, WIND: 0.35, EARTH_METAL: 0.30, WATER_ICE: 0.18, YIN_SHADOW: 0.10, BLOOD_DEMON: 0.08 }),
      ASTRAL:      Object.freeze({ ASTRAL: 1.00, LIGHT_YANG: 0.45, WIND: 0.42, LIGHTNING: 0.36, WATER_ICE: 0.34, YIN_SHADOW: 0.34, EARTH_METAL: 0.30, FIRE: 0.26, WOOD_LIFE: 0.24, BLOOD_DEMON: 0.20 }),
      BLOOD_DEMON: Object.freeze({ BLOOD_DEMON: 1.00, YIN_SHADOW: 0.46, FIRE: 0.42, WOOD_LIFE: 0.34, EARTH_METAL: 0.28, WATER_ICE: 0.24, WIND: 0.20, LIGHTNING: 0.18, ASTRAL: 0.18, LIGHT_YANG: 0.06 })
    }),
    // 3) Combat Tactical Matchup Matrix (Attacker Element vs Defender Element: [0.90, 1.12])
    COUNTER_MATRIX: Object.freeze({
      WATER_ICE:   Object.freeze({ FIRE: 1.10, EARTH_METAL: 0.93, LIGHTNING: 0.95 }),
      FIRE:        Object.freeze({ WOOD_LIFE: 1.10, EARTH_METAL: 1.06, WATER_ICE: 0.90 }),
      WOOD_LIFE:   Object.freeze({ EARTH_METAL: 1.09, WATER_ICE: 1.05, FIRE: 0.91 }),
      EARTH_METAL: Object.freeze({ LIGHTNING: 1.09, WIND: 1.06, WOOD_LIFE: 0.92 }),
      LIGHTNING:   Object.freeze({ WATER_ICE: 1.09, WIND: 1.06, EARTH_METAL: 0.91 }),
      WIND:        Object.freeze({ WOOD_LIFE: 1.07, YIN_SHADOW: 1.05, EARTH_METAL: 0.93 }),
      LIGHT_YANG:  Object.freeze({ YIN_SHADOW: 1.12, BLOOD_DEMON: 1.12, WATER_ICE: 0.95 }),
      YIN_SHADOW:  Object.freeze({ LIGHT_YANG: 1.08, ASTRAL: 1.05, LIGHTNING: 0.93 }),
      ASTRAL:      Object.freeze({ EARTH_METAL: 1.08, WIND: 1.06, BLOOD_DEMON: 1.04 }),
      BLOOD_DEMON: Object.freeze({ WOOD_LIFE: 1.09, WATER_ICE: 1.05, LIGHT_YANG: 0.90 })
    })
  };

  // Strict tag normalizer — never maps unknown tags to NEUTRAL silently
  ELEM.normalizeTag = raw => {
    if (raw == null) return { ok: true, element: 'NEUTRAL', composite: null };
    const s = String(raw).trim();
    const canonical = s.toUpperCase();
    if (!canonical || canonical === 'NONE' || canonical === 'NEUTRAL' || canonical === 'ANY') {
      return { ok: true, element: 'NEUTRAL', composite: null };
    }
    if (ELEM.COMPOSITE_PROFILES[canonical]) {
      const cp = ELEM.COMPOSITE_PROFILES[canonical];
      return { ok: true, element: cp.primary, composite: canonical, profile: cp };
    }
    const mapped = ELEM.ALIAS_MAP[canonical] || ELEM.ALIAS_MAP[s] || canonical;
    if (ELEM.ORDINARY_ELEMENTS.includes(mapped) || ELEM.SPECIAL_ELEMENTS.includes(mapped)) {
      return { ok: true, element: mapped, composite: null };
    }
    if (mapped === 'NEUTRAL') {
      return { ok: true, element: 'NEUTRAL', composite: null };
    }
    return { ok: false, element: 'UNKNOWN', raw: s, error: 'Unregistered element tag: ' + s };
  };

  ELEM.isValidOrdinaryElement = el => ELEM.ORDINARY_ELEMENTS.includes(el);
  ELEM.isValidSpecialElement = el => ELEM.SPECIAL_ELEMENTS.includes(el);
  ELEM.isValidGrade = gId => ELEM.GRADE_ORDER.includes(gId);

  const NEUTRAL_PROFILE = Object.freeze({ valid: true, mode: "EXPLICIT_NON_ELEMENTAL", primary: "NEUTRAL", weights: Object.freeze({}) });
  function computeProfileUncached(def) {
    if (!def) return NEUTRAL_PROFILE;
    if (typeof def === "string") {
      const norm = ELEM.normalizeTag(def);
      if (!norm.ok) return { valid: false, mode: "UNKNOWN", primary: "UNKNOWN", weights: {}, error: norm.error };
      if (norm.profile) return Object.assign({ valid: true }, norm.profile);
      if (norm.element === "NEUTRAL") return NEUTRAL_PROFILE;
      return {
        valid: true,
        mode: ELEM.isValidSpecialElement(norm.element) ? "SPECIAL_ELEMENT" : "INTRINSIC_SINGLE",
        primary: norm.element,
        weights: { [norm.element]: 1.0 }
      };
    }
    if (def.elementalRole === 'EXPLICIT_NON_ELEMENTAL') return NEUTRAL_PROFILE;
    if (def.elementProfile && typeof def.elementProfile === "object") {
      let ep = def.elementProfile;
      if (!ep.mode && ep.primary) {
        const pNorm = ELEM.normalizeTag(ep.primary);
        const pEl = pNorm.ok ? pNorm.element : 'NEUTRAL';
        if (pEl === 'NEUTRAL') return NEUTRAL_PROFILE;
        if (ep.secondary) {
          const sNorm = ELEM.normalizeTag(ep.secondary);
          const sEl = sNorm.ok ? sNorm.element : pEl;
          const w1 = Number.isFinite(ep.affinityWeight) ? clamp(ep.affinityWeight, 0.1, 0.95) : 0.7;
          ep = { mode: 'INTRINSIC_WEIGHTED', primary: pEl, weights: sEl !== pEl ? { [pEl]: w1, [sEl]: +(1 - w1).toFixed(4) } : { [pEl]: 1.0 } };
        } else {
          ep = { mode: ELEM.isValidSpecialElement(pEl) ? 'SPECIAL_ELEMENT' : 'INTRINSIC_SINGLE', primary: pEl, weights: { [pEl]: 1.0 } };
        }
      }
      if (!ELEM.VALID_MODES.includes(ep.mode)) {
        return { valid: false, mode: "UNKNOWN", primary: "UNKNOWN", weights: {}, error: "Invalid profile mode: " + ep.mode };
      }
      if (ep.mode === "EXPLICIT_NON_ELEMENTAL" || ep.mode === "ROOT_AGNOSTIC_UTILITY") {
        return { valid: true, mode: ep.mode, primary: "NEUTRAL", weights: NEUTRAL_PROFILE.weights };
      }
      const weights = {};
      let sum = 0;
      for (const [k, v] of Object.entries(ep.weights || {})) {
        const nk = ELEM.normalizeTag(k);
        if (!nk.ok || nk.element === "NEUTRAL") {
          return { valid: false, mode: "UNKNOWN", primary: "UNKNOWN", weights: {}, error: "Invalid weight element: " + k };
        }
        const w = Number(v);
        if (Number.isFinite(w) && w > 0) {
          weights[nk.element] = (weights[nk.element] || 0) + w;
          sum += w;
        }
      }
      if (sum <= 0) {
        const pNorm = ELEM.normalizeTag(ep.primary || def.element);
        if (!pNorm.ok) return { valid: false, mode: "UNKNOWN", primary: "UNKNOWN", weights: {}, error: pNorm.error };
        if (pNorm.element === "NEUTRAL") return NEUTRAL_PROFILE;
        return { valid: true, mode: ep.mode, primary: pNorm.element, weights: { [pNorm.element]: 1.0 } };
      }
      const normWeights = {};
      let bestEl = ep.primary || "NEUTRAL", bestW = -1;
      for (const [k, w] of Object.entries(weights)) {
        const nw = +(w / sum).toFixed(4);
        normWeights[k] = nw;
        if (nw > bestW) { bestW = nw; bestEl = k; }
      }
      return {
        valid: true,
        mode: ep.mode,
        primary: bestEl,
        compositeTag: ep.compositeTag || def.compositeElement || null,
        weights: normWeights
      };
    }
    if (def.compositeElement && ELEM.COMPOSITE_PROFILES[def.compositeElement]) {
      return Object.assign({ valid: true }, ELEM.COMPOSITE_PROFILES[def.compositeElement]);
    }
    const norm = ELEM.normalizeTag(def.element);
    if (!norm.ok) {
      return { valid: false, mode: "UNKNOWN", primary: "UNKNOWN", weights: {}, error: norm.error };
    }
    if (norm.profile) return Object.assign({ valid: true }, norm.profile);
    if (norm.element === "NEUTRAL") return NEUTRAL_PROFILE;
    return {
      valid: true,
      mode: ELEM.isValidSpecialElement(norm.element) ? "SPECIAL_ELEMENT" : "INTRINSIC_SINGLE",
      primary: norm.element,
      weights: { [norm.element]: 1.0 }
    };
  }
  const PROFILE_CACHE = new WeakMap();
  const NPC_ELEM_CACHE = new WeakMap();
  function getNpcCache(npc) {
    let c = NPC_ELEM_CACHE.get(npc);
    if (!c) { c = { ready: false, compat: Object.create(null), cap: Object.create(null), effMast: Object.create(null) }; NPC_ELEM_CACHE.set(npc, c); }
    return c;
  }
  function resetNpcCache(npc) {
    const h = npc && npc.h;
    NPC_ELEM_CACHE.set(npc, { ready: true, rootRef: h ? h.root : null, sysRef: npc && npc.ext ? npc.ext.elementalSystem : null, traitsLen: h && Array.isArray(h.traits) ? h.traits.length : 0, compat: Object.create(null), cap: Object.create(null), effMast: Object.create(null), pathScores: null });
  }
  ELEM.getProfile = def => {
    if (!def) return NEUTRAL_PROFILE;
    if (typeof def === "object") {
      const hit = PROFILE_CACHE.get(def);
      if (hit) return hit;
      const res = computeProfileUncached(def);
      PROFILE_CACHE.set(def, res);
      return res;
    }
    return computeProfileUncached(def);
  };

  ELEM.getTargetProfile = ELEM.getProfile;

  /* ---------- Conservative Aggregate Scalar Grade Adapter & Rarity Classification ---------- */
  ELEM.computeAggregateGrade = (elements, grades) => {
    const k = Array.isArray(grades) && grades.length ? clamp(grades.length, 1, 4) : 1;
    const scores = (Array.isArray(grades) && grades.length ? grades.slice(0, k) : ['MORTAL'])
      .map(gId => ELEM.GRADE_SCORE[gId] || 2.0)
      .sort((a, b) => b - a);
    const maxS = scores[0] || 2.0;
    const meanS = scores.reduce((a, b) => a + b, 0) / scores.length;
    const breadthBonus = k === 4 ? 0.28 : k === 3 ? 0.20 : k === 2 ? 0.12 : 0.00;
    const aggScore = +(0.65 * maxS + 0.35 * meanS + breadthBonus).toFixed(4);
    let grade = 'DEFECTIVE';
    if (aggScore >= 4.75) grade = 'HEAVENLY';
    else if (aggScore >= 3.85) grade = 'TRUE';
    else if (aggScore >= 2.85) grade = 'SPIRIT';
    else if (aggScore >= 1.85) grade = 'MORTAL';
    return { grade, aggregateScore: aggScore, maxScore: maxS, meanScore: +meanS.toFixed(4), breadthBonus };
  };

  ELEM.classifyRarity = (elements, grades) => {
    const k = Array.isArray(grades) ? grades.length : 1;
    const counts = { HEAVENLY: 0, TRUE: 0, SPIRIT: 0, MORTAL: 0, DEFECTIVE: 0 };
    (grades || []).forEach(gId => { counts[gId] = (counts[gId] || 0) + 1; });
    const trueOrSpirit = counts.TRUE + counts.SPIRIT;
    const q = ELEM.ROOT_GRADE_PROBABILITIES;

    // The displayed rarity is derived from the same probabilities used by the
    // generator: P(root-count cohort) × P(grade cohort | root count).
    // expectedBirths is retained as a legacy field name; it means generated
    // character appearances, including visitors and recruitment candidates.
    const rarity = (band, rarityBand, rarityTitleTh, rootCount, conditionalProbability) => {
      const cohortProbability = ELEM.ROOT_COUNT_PROBABILITIES[rootCount] * conditionalProbability;
      const expectedCharacters = 1 / Math.max(Number.MIN_VALUE, cohortProbability);
      const expectedWorldYears = expectedCharacters / ELEM.GENERATED_CHARACTERS_PER_WORLD_YEAR;
      const roundedCharacters = +expectedCharacters.toFixed(2);
      const roundedYears = +expectedWorldYears.toFixed(4);
      return {
        band, rarityBand, rarityTitleTh,
        expectedCharacters: roundedCharacters,
        expectedBirths: roundedCharacters,
        expectedWorldYears: roundedYears
      };
    };

    if (k === 4) {
      if (counts.HEAVENLY === 4) {
        return rarity('TRANSCENDENT_HEAVENLY_FOURFOLD', 'TRANSCENDENT',
          'อัจฉริยะรากสวรรค์สี่ธาตุ (หายากยิ่งยวด · ไม่มีโควตาจำนวนคน)', 4, q[4].ALL_HEAVENLY);
      }
      return rarity('TRANSCENDENT_10000Y', 'TRANSCENDENT',
        'ผู้ถือครองกายาจตุรธาตุ (อัจฉริยะรอบหมื่นปี)', 4, q[4].OTHER);
    }

    if (k === 3) {
      if (counts.HEAVENLY === 3) {
        return rarity('MYTHIC_1000Y', 'TRANSCENDENT',
          'ตรีรากวิญญาณสวรรค์สมบูรณ์ (อัจฉริยะรอบหนึ่งพันปี)', 3, q[3].HEAVENLY_TRIPLE);
      }
      if (counts.HEAVENLY === 2 && trueOrSpirit === 1) {
        return rarity('MYTHIC_500Y', 'MYTHIC',
          'ตรีรากสองสวรรค์หนึ่งแท้/จิต (อัจฉริยะในช่วง 100–1,000 ปี)', 3, q[3].TWO_HEAVENLY_ONE_TRUE_OR_SPIRIT);
      }
      if (counts.HEAVENLY === 1 && trueOrSpirit === 2) {
        return rarity('MYTHIC_100Y', 'MYTHIC',
          'ตรีรากหนึ่งสวรรค์สองแท้/จิต (อัจฉริยะรอบหนึ่งร้อยปี)', 3, q[3].ONE_HEAVENLY_TWO_TRUE_OR_SPIRIT);
      }
      if (counts.TRUE === 3) {
        return rarity('EPIC_62Y', 'EPIC',
          'ตรีรากวิญญาณแท้จริงทั้งสาม (1 ใน 62.5 ปี)', 3, q[3].TRUE_TRIPLE);
      }
      if (counts.HEAVENLY >= 1) {
        return rarity('RARE_3ROOT_HEAVEN', 'RARE',
          'ตรีรากวิญญาณแฝงรากสวรรค์', 3, q[3].OTHER_HEAVENLY);
      }
      return rarity('UNCOMMON_3ROOT', 'UNCOMMON',
        'ผู้ถือครองตรีรากวิญญาณ', 3, q[3].COMMON);
    }

    if (k === 2) {
      if (counts.HEAVENLY === 2) {
        return rarity('MYTHIC_100Y', 'MYTHIC',
          'รากวิญญาณคู่สวรรค์สมบูรณ์ (อัจฉริยะรอบหนึ่งร้อยปี)', 2, q[2].HEAVENLY_PAIR);
      }
      if (counts.HEAVENLY === 1 && trueOrSpirit === 1) {
        return rarity('EPIC_5Y', 'EPIC',
          'รากวิญญาณคู่สวรรค์-แท้/จิต (อัจฉริยะทุกหลายปี)', 2, q[2].HEAVENLY_TRUE_OR_SPIRIT);
      }
      if (counts.TRUE === 2) {
        return rarity('RARE_6Y', 'RARE',
          'รากวิญญาณคู่แท้จริง (1 ใน 6.25 ปี)', 2, q[2].TRUE_PAIR);
      }
      if (counts.HEAVENLY === 1) {
        return rarity('RARE_DUAL_HEAVEN_LOW', 'RARE',
          'รากวิญญาณคู่แฝงรากสวรรค์', 2, q[2].HEAVENLY_WITH_MORTAL_OR_DEFECTIVE);
      }
      return rarity('COMMON_2ROOT', 'UNCOMMON',
        'รากวิญญาณคู่ประสาน', 2, q[2].COMMON);
    }

    if (counts.HEAVENLY === 1) {
      return rarity('RARE_SINGLE_HEAVEN', 'RARE',
        'เอกรากวิญญาณสวรรค์ (1 ใน 5 ปี)', 1, q[1].HEAVENLY);
    }
    if (counts.TRUE === 1) {
      return rarity('UNCOMMON_SINGLE_TRUE', 'UNCOMMON',
        'เอกรากวิญญาณแท้จริง', 1, q[1].TRUE);
    }
    if (counts.SPIRIT === 1) {
      return rarity('COMMON_SINGLE_SPIRIT', 'COMMON',
        'เอกรากวิญญาณระดับจิต', 1, q[1].SPIRIT);
    }
    if (counts.DEFECTIVE === 1) {
      return rarity('COMMON_SINGLE_DEFECTIVE', 'COMMON',
        'เอกรากวิญญาณบกพร่อง', 1, q[1].DEFECTIVE);
    }
    return rarity('COMMON_SINGLE_MORTAL', 'COMMON',
      'เอกรากวิญญาณสามัญ', 1, q[1].MORTAL);
  };

  ELEM.buildRootObject = (elements, grades) => {
    const cleanEls = [];
    const cleanGrades = [];
    const rawEls = Array.isArray(elements) ? elements : ['FIRE'];
    const rawGrades = Array.isArray(grades) ? grades : [];
    for (let i = 0; i < rawEls.length && cleanEls.length < 4; i++) {
      const norm = ELEM.normalizeTag(rawEls[i]);
      const el = (norm.ok && ELEM.isValidOrdinaryElement(norm.element)) ? norm.element : null;
      if (el && !cleanEls.includes(el)) {
        const gRaw = rawGrades[i] || rawGrades[0] || 'MORTAL';
        const gId = gRaw === 'HEAVEN' ? 'HEAVENLY' : (ELEM.isValidGrade(gRaw) ? gRaw : 'MORTAL');
        cleanEls.push(el);
        cleanGrades.push(gId);
      }
    }
    if (!cleanEls.length) {
      cleanEls.push('FIRE');
      const g0 = rawGrades[0] === 'HEAVEN' ? 'HEAVENLY' : (ELEM.isValidGrade(rawGrades[0]) ? rawGrades[0] : 'MORTAL');
      cleanGrades.push(g0);
    }
    const k = cleanEls.length;
    const agg = ELEM.computeAggregateGrade(cleanEls, cleanGrades);
    const rar = ELEM.classifyRarity(cleanEls, cleanGrades);
    const traitId = ELEM.ROOT_CAPACITY_TRAITS[k] || 'ROOT_CAPACITY_SINGLE';
    const roots = cleanEls.map((el, idx) => ({
      slot: idx,
      element: el,
      elementNameTh: ELEM.META[el] ? ELEM.META[el].nameTh : el,
      grade: cleanGrades[idx],
      gradeNameTh: ELEM.GRADE_FACTORS[cleanGrades[idx]] ? ELEM.GRADE_FACTORS[cleanGrades[idx]].nameTh : cleanGrades[idx],
      isPrimary: idx === 0
    }));
    return {
      schemaVersion: 2,
      rootCount: k,
      rootCapacityTrait: traitId,
      elements: cleanEls,
      grades: cleanGrades,
      roots,
      primaryElement: cleanEls[0],
      primaryGrade: cleanGrades[0],
      grade: agg.grade,
      aggregateScore: agg.aggregateScore,
      rarityBand: rar.rarityBand,
      rarityCode: rar.band,
      rarityTitleTh: rar.rarityTitleTh,
      expectedBirths: rar.expectedBirths,
      expectedWorldYears: rar.expectedWorldYears
    };
  };

  /* ---------- Hierarchical Deterministic Birth Root Generator ---------- */
  function pickOrdinaryElements(rng, k) {
    const pool = ELEM.ORDINARY_ELEMENTS.slice();
    const out = [];
    for (let i = 0; i < k && pool.length > 0; i++) {
      const idx = Math.floor(rng.next() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  }

  function rollGradesForCount(rng, k, explicitGrade) {
    const rollTrueOrSpirit = () => rng.next() < 0.5 ? 'TRUE' : 'SPIRIT';
    if (explicitGrade) {
      const gNorm = explicitGrade === 'HEAVEN' ? 'HEAVENLY' : (ELEM.isValidGrade(explicitGrade) ? explicitGrade : 'MORTAL');
      const out = [gNorm];
      const subPool = gNorm === 'HEAVENLY' ? ['TRUE', 'SPIRIT', 'MORTAL'] : gNorm === 'TRUE' ? ['TRUE', 'SPIRIT', 'MORTAL'] : ['SPIRIT', 'MORTAL', 'DEFECTIVE'];
      for (let i = 1; i < k; i++) out.push(subPool[Math.floor(rng.next() * subPool.length)]);
      return out;
    }

    const u = rng.next();
    const p = ELEM.ROOT_GRADE_PROBABILITIES;

    if (k === 1) {
      const q = p[1];
      if (u < q.HEAVENLY) return ['HEAVENLY'];
      if (u < q.HEAVENLY + q.TRUE) return ['TRUE'];
      if (u < q.HEAVENLY + q.TRUE + q.SPIRIT) return ['SPIRIT'];
      if (u < q.HEAVENLY + q.TRUE + q.SPIRIT + q.MORTAL) return ['MORTAL'];
      return ['DEFECTIVE'];
    }

    if (k === 2) {
      const q = p[2];
      if (u < q.HEAVENLY_PAIR) return ['HEAVENLY', 'HEAVENLY'];
      if (u < q.HEAVENLY_PAIR + q.HEAVENLY_TRUE_OR_SPIRIT) {
        return rng.next() < 0.5 ? ['HEAVENLY', rollTrueOrSpirit()] : [rollTrueOrSpirit(), 'HEAVENLY'];
      }
      if (u < q.HEAVENLY_PAIR + q.HEAVENLY_TRUE_OR_SPIRIT + q.TRUE_PAIR) return ['TRUE', 'TRUE'];
      if (u < q.HEAVENLY_PAIR + q.HEAVENLY_TRUE_OR_SPIRIT + q.TRUE_PAIR + q.HEAVENLY_WITH_MORTAL_OR_DEFECTIVE) {
        const other = rng.next() < 0.5 ? 'MORTAL' : 'DEFECTIVE';
        return rng.next() < 0.5 ? ['HEAVENLY', other] : [other, 'HEAVENLY'];
      }
      const rollOne = () => {
        const r = rng.next();
        if (r < 0.06) return 'TRUE';
        if (r < 0.28) return 'SPIRIT';
        if (r < 0.78) return 'MORTAL';
        return 'DEFECTIVE';
      };
      const out = [rollOne(), rollOne()];
      // Keep the explicitly calibrated TRUE+TRUE cohort exclusive.
      if (out[0] === 'TRUE' && out[1] === 'TRUE') out[1] = 'SPIRIT';
      return out;
    }

    if (k === 3) {
      const q = p[3];
      if (u < q.HEAVENLY_TRIPLE) return ['HEAVENLY', 'HEAVENLY', 'HEAVENLY'];
      if (u < q.HEAVENLY_TRIPLE + q.TWO_HEAVENLY_ONE_TRUE_OR_SPIRIT) {
        return ['HEAVENLY', 'HEAVENLY', rollTrueOrSpirit()];
      }
      if (u < q.HEAVENLY_TRIPLE + q.TWO_HEAVENLY_ONE_TRUE_OR_SPIRIT + q.ONE_HEAVENLY_TWO_TRUE_OR_SPIRIT) {
        return ['HEAVENLY', rollTrueOrSpirit(), rollTrueOrSpirit()];
      }
      if (u < q.HEAVENLY_TRIPLE + q.TWO_HEAVENLY_ONE_TRUE_OR_SPIRIT + q.ONE_HEAVENLY_TWO_TRUE_OR_SPIRIT + q.TRUE_TRIPLE) {
        return ['TRUE', 'TRUE', 'TRUE'];
      }
      if (u < q.HEAVENLY_TRIPLE + q.TWO_HEAVENLY_ONE_TRUE_OR_SPIRIT + q.ONE_HEAVENLY_TWO_TRUE_OR_SPIRIT + q.TRUE_TRIPLE + q.OTHER_HEAVENLY) {
        const compositions = [
          ['HEAVENLY', 'MORTAL', 'MORTAL'],
          ['HEAVENLY', 'MORTAL', 'DEFECTIVE'],
          ['HEAVENLY', 'DEFECTIVE', 'DEFECTIVE'],
          ['HEAVENLY', 'HEAVENLY', 'MORTAL'],
          ['HEAVENLY', 'HEAVENLY', 'DEFECTIVE']
        ];
        return compositions[Math.floor(rng.next() * compositions.length)].slice();
      }
      const rollOne = () => {
        const r = rng.next();
        if (r < 0.06) return 'TRUE';
        if (r < 0.28) return 'SPIRIT';
        if (r < 0.78) return 'MORTAL';
        return 'DEFECTIVE';
      };
      const out = [rollOne(), rollOne(), rollOne()];
      // Keep the explicitly calibrated TRUE×3 cohort exclusive.
      if (out.every(gId => gId === 'TRUE')) out[2] = 'SPIRIT';
      return out;
    }

    // Four-root characters are themselves a 10,000-year cohort. Four Heavenly
    // grades form a 0.5% conditional subtype (about one appearance per 2 million years).
    const q = p[4];
    if (u < q.ALL_HEAVENLY) return ['HEAVENLY', 'HEAVENLY', 'HEAVENLY', 'HEAVENLY'];
    if (u < q.ALL_HEAVENLY + 0.02) return ['HEAVENLY', 'HEAVENLY', 'HEAVENLY', rollTrueOrSpirit()];
    if (u < q.ALL_HEAVENLY + 0.10) return ['TRUE', 'TRUE', 'TRUE', 'TRUE'];
    const out4 = [];
    let hCnt4 = 0, tCnt4 = 0;
    for (let i = 0; i < 4; i++) {
      const r = rng.next();
      let gId = r < 0.005 ? 'HEAVENLY' : r < 0.050 ? 'TRUE' : r < 0.240 ? 'SPIRIT' : r < 0.720 ? 'MORTAL' : 'DEFECTIVE';
      if (gId === 'HEAVENLY' && hCnt4 >= 1) gId = 'SPIRIT';
      if (gId === 'HEAVENLY') hCnt4++;
      if (gId === 'TRUE') tCnt4++;
      out4.push(gId);
    }
    if (tCnt4 === 4) out4[3] = 'SPIRIT';
    return out4;
  }

  ELEM.rollBirthRoots = (rng, opts) => {
    opts = opts || {};
    const r = rng || new U.RNG('default-root-rng');
    if (opts.customRoots && Array.isArray(opts.customRoots.elements)) {
      return ELEM.buildRootObject(opts.customRoots.elements, opts.customRoots.grades);
    }
    let k = opts.forceRootCount ? clamp(Math.floor(opts.forceRootCount), 1, 4) : null;
    if (!k) {
      const uCount = r.next();
      let cumulative = 0;
      for (const count of [1, 2, 3, 4]) {
        cumulative += ELEM.ROOT_COUNT_PROBABILITIES[count];
        if (uCount < cumulative) { k = count; break; }
      }
      if (!k) k = 4; // Floating-point-safe final bucket.
    }
    const hasForcedElements = Array.isArray(opts.forceElements) && opts.forceElements.length > 0;
    let elements = hasForcedElements ? [] : pickOrdinaryElements(r, k);
    if (hasForcedElements) {
      for (let i = 0; i < opts.forceElements.length && elements.length < k; i++) {
        const norm = ELEM.normalizeTag(opts.forceElements[i]);
        if (!norm.ok || !ELEM.isValidOrdinaryElement(norm.element) || elements.includes(norm.element)) continue;
        elements.push(norm.element);
      }
    }
    while (elements.length < k) {
      const pool = ELEM.ORDINARY_ELEMENTS.filter(e => !elements.includes(e));
      if (!pool.length) break;
      const candidate = pool[Math.min(pool.length - 1, Math.floor(r.next() * pool.length))];
      elements.push(candidate);
    }
    // Grades are indexed by final root slot, not by the raw forceElements input.
    // This keeps partial/filtered forced element lists deterministic and predictable.
    const grades = Array.isArray(opts.forceGrades) && opts.forceGrades.length
      ? elements.map((_, i) => opts.forceGrades[i] || (hasForcedElements ? 'MORTAL' : opts.forceGrades[0] || 'MORTAL'))
      : rollGradesForCount(r, elements.length, opts.explicitRootGrade || null);
    return ELEM.buildRootObject(elements, grades);
  };

  /* ---------- Validate & Normalize Root/Trait/Mastery State on NPC ---------- */
  ELEM.validateRootSpec = spec => {
    const errors = [];
    if (!spec || typeof spec !== 'object') return { ok: false, errors: ['Missing root specification'] };
    const k = Number(spec.rootCount != null ? spec.rootCount : (Array.isArray(spec.elements) ? spec.elements.length : 0));
    if (!Number.isInteger(k) || k < 1 || k > 4) {
      errors.push('จำนวนรากวิญญาณต้องอยู่ระหว่าง 1 ถึง 4 รากเท่านั้น (ไม่รองรับ 5 ราก)');
    }
    if (spec.rootCapacityTrait && !Object.prototype.hasOwnProperty.call(ELEM.TRAIT_TO_ROOT_COUNT, spec.rootCapacityTrait)) {
      errors.push('ไม่รู้จักลักษณะความจุรากวิญญาณ: ' + spec.rootCapacityTrait);
    } else if (spec.rootCapacityTrait && ELEM.TRAIT_TO_ROOT_COUNT[spec.rootCapacityTrait] !== k) {
      errors.push('ลักษณะความจุรากวิญญาณ (' + spec.rootCapacityTrait + ') ไม่ตรงกับจำนวนราก (' + k + ')');
    }
    if (!Array.isArray(spec.elements) || spec.elements.length !== k) {
      errors.push('รายการธาตุรากวิญญาณต้องมีความยาวตรงกับจำนวนราก (' + k + ')');
    } else {
      const seen = new Set();
      for (const el of spec.elements) {
        if (ELEM.isValidSpecialElement(el)) {
          errors.push('ธาตุพิเศษ (' + el + ') ไม่สามารถตั้งเป็นรากวิญญาณกำเนิดสามัญได้');
        } else if (!ELEM.isValidOrdinaryElement(el)) {
          errors.push('ธาตุรากวิญญาณไม่ถูกต้อง: ' + el);
        } else if (seen.has(el)) {
          errors.push('ห้ามมีธาตุรากวิญญาณซ้ำกันในตัวละครเดียวกัน: ' + el);
        }
        seen.add(el);
      }
    }
    if (!Array.isArray(spec.grades) || spec.grades.length !== k) {
      errors.push('รายการระดับรากวิญญาณ (grades) ต้องมีความยาวตรงกับจำนวนราก (' + k + ')');
    } else {
      for (const gId of spec.grades) {
        if (!ELEM.isValidGrade(gId)) {
          errors.push('ระดับรากวิญญาณไม่ถูกต้อง: ' + gId);
        }
      }
    }
    return { ok: errors.length === 0, errors };
  };

  // Verify the complete version-2 root snapshot, including its UI mirrors and derived rarity fields.
  ELEM.isCanonicalRootObject = root => {
    if (!root || root.schemaVersion !== 2 || !Array.isArray(root.elements) || !Array.isArray(root.grades)) return false;
    const k = root.elements.length;
    if (k < 1 || k > 4 || root.rootCount !== k || root.grades.length !== k) return false;
    if (new Set(root.elements).size !== k || !root.elements.every(ELEM.isValidOrdinaryElement) || !root.grades.every(ELEM.isValidGrade)) return false;
    const traitId = ELEM.ROOT_CAPACITY_TRAITS[k] || 'ROOT_CAPACITY_SINGLE';
    if (root.rootCapacityTrait !== traitId) return false;
    if (!ELEM.validateRootSpec({ rootCount: k, rootCapacityTrait: traitId, elements: root.elements, grades: root.grades }).ok) return false;
    if (!Array.isArray(root.roots) || root.roots.length !== k) return false;
    for (let i = 0; i < k; i++) {
      const r = root.roots[i], el = root.elements[i], gr = root.grades[i];
      if (!r || r.slot !== i || r.element !== el || r.grade !== gr || r.isPrimary !== (i === 0)) return false;
      if (r.elementNameTh !== (ELEM.META[el] ? ELEM.META[el].nameTh : el)) return false;
      if (r.gradeNameTh !== (ELEM.GRADE_FACTORS[gr] ? ELEM.GRADE_FACTORS[gr].nameTh : gr)) return false;
    }
    const agg = ELEM.computeAggregateGrade(root.elements, root.grades);
    const rar = ELEM.classifyRarity(root.elements, root.grades);
    return root.primaryElement === root.elements[0] && root.primaryGrade === root.grades[0]
      && root.grade === agg.grade && Math.abs(Number(root.aggregateScore) - agg.aggregateScore) < 0.00011
      && root.rarityCode === rar.band && root.rarityBand === rar.rarityBand
      && root.rarityTitleTh === rar.rarityTitleTh && root.expectedBirths === rar.expectedBirths
      && root.expectedWorldYears === rar.expectedWorldYears;
  };

  // Repair malformed new-schema root snapshots deterministically; never reroll on every load.
  function repairRootObject(npc) {
    const root = npc && npc.h && npc.h.root && typeof npc.h.root === 'object' ? npc.h.root : {};
    const rawEls = Array.isArray(root.elements) ? root.elements : (Array.isArray(root.roots) ? root.roots.map(r => r && r.element) : []);
    const rawGrades = Array.isArray(root.grades) ? root.grades : (Array.isArray(root.roots) ? root.roots.map(r => r && r.grade) : []);
    const declaredCount = Number(root.rootCount);
    const traitCount = ELEM.TRAIT_TO_ROOT_COUNT[root.rootCapacityTrait] || 0;
    let targetCount = Number.isInteger(declaredCount) && declaredCount >= 1 && declaredCount <= 4 ? declaredCount : traitCount;
    const elements = [], grades = [];
    for (let i = 0; i < rawEls.length && elements.length < 4; i++) {
      const norm = ELEM.normalizeTag(rawEls[i]);
      const el = norm.ok && ELEM.isValidOrdinaryElement(norm.element) ? norm.element : null;
      if (!el || elements.includes(el)) continue;
      elements.push(el);
      grades.push(ELEM.isValidGrade(rawGrades[i]) ? rawGrades[i] : 'MORTAL');
    }
    if (!targetCount) targetCount = Math.max(1, Math.min(4, elements.length || 1));
    targetCount = clamp(targetCount, 1, 4);
    if (elements.length > targetCount) { elements.length = targetCount; grades.length = targetCount; }
    const seedStr = 'repair_root:' + (npc.h.genome || 1) + ':' + (npc.h.birthDay || 0) + ':' + (npc.id || '') + ':' + targetCount;
    const r = new U.RNG(seedStr);
    while (elements.length < targetCount) {
      const pool = ELEM.ORDINARY_ELEMENTS.filter(el => !elements.includes(el));
      if (!pool.length) break;
      const idx = Math.min(pool.length - 1, Math.floor(r.next() * pool.length));
      elements.push(pool[idx]);
      grades.push('MORTAL');
    }
    return ELEM.buildRootObject(elements.length ? elements : ['FIRE'], grades.length ? grades : ['MORTAL']);
  }

  function elementalSystemIsReady(sys) {
    if (!sys || typeof sys !== 'object' || sys.version !== 2) return false;
    if (!sys.mastery || typeof sys.mastery !== 'object' || Array.isArray(sys.mastery)) return false;
    if (!sys.specialMastery || typeof sys.specialMastery !== 'object' || Array.isArray(sys.specialMastery)) return false;
    if (!ELEM.ORDINARY_ELEMENTS.every(el => Number.isFinite(sys.mastery[el]) && sys.mastery[el] >= 0 && sys.mastery[el] <= 100)) return false;
    if (!ELEM.SPECIAL_ELEMENTS.every(el => Number.isFinite(sys.specialMastery[el]) && sys.specialMastery[el] >= 0 && sys.specialMastery[el] <= 100)) return false;
    const log = sys.dailyGainLog;
    if (!log || typeof log !== 'object' || !Number.isFinite(log.day)
      || !log.byElement || typeof log.byElement !== 'object' || Array.isArray(log.byElement)
      || !Array.isArray(log.seenKeys)) return false;
    const access = sys.specialAccess;
    return !!access && typeof access === 'object' && !Array.isArray(access)
      && ELEM.SPECIAL_ELEMENTS.every(el => access[el] && typeof access[el].unlocked === 'boolean'
        && Number.isFinite(access[el].affinity) && Array.isArray(access[el].sources));
  }

  const ASTRAL_MAJOR_PATHS = new Set(['ARRAY_TALISMAN', 'ASTRO_DIVINATION', 'VOID_SPACE', 'CHRONO_EPOCH', 'PRIMORDIAL_CHAOS', 'DIVINE_CHANNELER', 'LORE_ARCHIVIST', 'FORTUNE_GAMBLER', 'VOID_HERETIC_PACT']);
  const BLOOD_MAJOR_PATHS = new Set(['DEMON', 'DEVOURING_FLESH', 'VENOM_GU', 'PRIMORDIAL_SHIFTER']);
  let _specialSubCache = null;
  function getSpecialSubSets() {
    const subs = Array.isArray(CULT.subList) ? CULT.subList : [];
    if (_specialSubCache && _specialSubCache.len === subs.length && subs.length > 0) return _specialSubCache;
    const astral = new Set(['ASTRAL_ARRAY', 'TIME_VOID', 'FATE_ORACLE', 'MIND_SWORD_TELEKINESIS', 'STAR_ARCHER', 'VOID_SPEAR_MIND', 'ASTRAL_CLOCKWORK_PRIME', 'PAST_LIFE_MIRROR', 'SEAL_SCRIPT_EXORCIST', 'QIMEN_TALISMAN_PATRON', 'CELESTIAL_ZITHER_ENVOY', 'STAR_CHART_PROPHET', 'HEAVENLY_SECRET_SEER', 'ECLIPSE_DOOM_PROPHET', 'BIG_DIPPER_FORMATION', 'DESTINY_THREAD_ARBITER', 'METEOR_CALLER_SAGE', 'DIMENSIONAL_BLINK_STRIDER', 'SPATIAL_POCKET_ARCHITECT', 'VOID_RIFT_SLAYER', 'FOLDED_HORIZON_ARCHER', 'BANISHMENT_SEAL_WARDEN', 'ASTRAL_LABYRINTH_WEAVER', 'SINGULARITY_COLLAPSE', 'ORBITAL_TIDE_SAGE', 'RIVER_OF_TIME_WATCHER', 'DAWN_DUSK_REWINDER', 'ACCELERATED_AEON_MONK', 'FROZEN_MOMENT_EXECUTIONER', 'ANCESTRAL_ECHO_SUMMONER', 'ETERNAL_KALPA_SAGE', 'WUJI_ORIGIN_SEEKER', 'YIN_YANG_INVERSION_LORD', 'FIVE_ELEMENT_COLLAPSE', 'PRIMAL_MIST_WEAVER', 'ENTROPY_DEVOURER', 'CREATION_DESTRUCTION_SAGE']);
    const blood = new Set(['BLOOD_DEMON', 'BLOOD_DRAGON', 'DEVOURING_FIEND', 'HEAVEN_DEVOURING_DEMON', 'BLOOD_SPEAR_ASURA', 'PRIMORDIAL_BLOOD_MUTATOR', 'BLOOD_PARASITE_LORD', 'ANCIENT_TAOTIE_MAW', 'NINE_TAILED_MYSTIC_FOX', 'BLOODLINE_CHIMERA_SOVEREIGN', 'BLOOD_DEBT_COLLECTOR', 'NETHER_MARIONETTE_LORD']);
    for (let i = 0; i < subs.length; i++) {
      const sObj = subs[i] && subs[i].sub;
      if (!sObj || !sObj.id) continue;
      const prof = ELEM.getProfile(sObj);
      if (prof && prof.weights) {
        if (prof.weights.ASTRAL) astral.add(sObj.id);
        if (prof.weights.BLOOD_DEMON) blood.add(sObj.id);
      }
    }
    _specialSubCache = { len: subs.length, astral, blood };
    return _specialSubCache;
  }

  function detectSpecialFromCult(c) {
    if (!c) return { astral: false, blood: false, pathAstral: false, pathBlood: false, subAstral: false, subBlood: false, canonSub: null };
    const subSets = getSpecialSubSets();
    const pDef = CULT.PATHS && c.path ? CULT.PATHS[c.path] : null;
    const pProf = pDef ? ELEM.getProfile(pDef) : null;
    const canonSub = c.sub ? (CULT.resolveSubId ? CULT.resolveSubId(c.sub) : c.sub) : null;
    const subDef = (canonSub && canonSub !== 'NONE' && CULT.subInfo) ? CULT.subInfo(c.path, canonSub) : null;
    const sProf = subDef ? ELEM.getProfile(subDef) : null;
    const pathAstral = !!(ASTRAL_MAJOR_PATHS.has(c.path) || (pProf && pProf.weights && pProf.weights.ASTRAL));
    const pathBlood = !!(BLOOD_MAJOR_PATHS.has(c.path) || (pProf && pProf.weights && pProf.weights.BLOOD_DEMON));
    const subAstral = !!(canonSub && canonSub !== 'NONE' && (subSets.astral.has(canonSub) || (sProf && sProf.weights && sProf.weights.ASTRAL)));
    const subBlood = !!(canonSub && canonSub !== 'NONE' && (subSets.blood.has(canonSub) || (sProf && sProf.weights && sProf.weights.BLOOD_DEMON)));
    return { astral: pathAstral || subAstral, blood: pathBlood || subBlood, pathAstral, pathBlood, subAstral, subBlood, canonSub };
  }

  ELEM.syncSpecialAccess = npc => {
    if (!npc || !npc.h) return null;
    npc.ext = npc.ext || {};
    const sys = npc.ext.elementalSystem;
    if (!sys) return null;
    const c = npc.cult;
    const oldAccess = sys.specialAccess && typeof sys.specialAccess === 'object' ? sys.specialAccess : {};
    const sourceArray = el => oldAccess[el] && Array.isArray(oldAccess[el].sources) ? oldAccess[el].sources.filter(x => typeof x === 'string' && x.length > 0) : [];
    const astralSources = new Set(sourceArray('ASTRAL'));
    const bloodSources = new Set(sourceArray('BLOOD_DEMON'));

    if (c) {
      const spCult = detectSpecialFromCult(c);
      if (spCult.pathAstral) astralSources.add('PATH:' + c.path);
      if (spCult.pathBlood) bloodSources.add('PATH:' + c.path);
      if (spCult.subAstral) astralSources.add('SUBPATH:' + spCult.canonSub);
      if (spCult.subBlood) bloodSources.add('SUBPATH:' + spCult.canonSub);
      const learnedTechs = Array.isArray(c.techs) ? c.techs : [];
      const checkIds = Array.from(new Set(learnedTechs.concat(c.mantra ? [c.mantra] : [], Array.isArray(c.unlockedMantras) ? c.unlockedMantras : [])));
      for (const id of checkIds) {
        const t = CULT.tech ? CULT.tech(id) : null;
        if (!t) continue;
        const prof = ELEM.getProfile(t);
        if (prof.weights && prof.weights.ASTRAL) astralSources.add('TECH:' + id);
        if (prof.weights && prof.weights.BLOOD_DEMON) bloodSources.add('TECH:' + id);
      }
    }
    const con = npc.h.constitution;
    if (con === 'CONST_STAR_MIND' || con === 'CON_STAR_MARROW' || con === 'CON_VOID_SPIRIT') {
      astralSources.add('CONSTITUTION:' + con);
    }
    if (con === 'CONST_BEAST_BLOOD' || con === 'CONST_DRAGON_MARROW' || con === 'CON_BLOOD_FIEND' || con === 'CON_ASURA_WAR') {
      bloodSources.add('CONSTITUTION:' + con);
    }
    if (Array.isArray(npc.h.traits) && npc.h.traits.some(tr => tr && tr.id === 'TR_BL_BLOOD_CURSE')) {
      bloodSources.add('TRAIT:TR_BL_BLOOD_CURSE');
    }

    const aList = Array.from(astralSources);
    const bList = Array.from(bloodSources);
    const aBaseAff = Math.round(
      (HC.eff(npc, 'affinities.ARRAY') * 0.35 + HC.eff(npc, 'affinities.SOUL_DIVINE') * 0.35 + HC.eff(npc, 'affinities.LIGHT_YANG') * 0.15 + HC.eff(npc, 'affinities.WIND') * 0.15)
    );
    const bBaseAff = Math.round(
      (HC.eff(npc, 'affinities.YIN_SHADOW') * 0.40 + HC.eff(npc, 'affinities.POISON') * 0.30 + HC.eff(npc, 'affinities.BODY_REFINING') * 0.30)
    );

    sys.specialAccess = {
      ASTRAL: {
        unlocked: aList.length > 0 || (sys.specialMastery && sys.specialMastery.ASTRAL > 5),
        affinity: clamp(aBaseAff + aList.length * 10, 0, 100),
        sources: aList
      },
      BLOOD_DEMON: {
        unlocked: bList.length > 0 || (sys.specialMastery && sys.specialMastery.BLOOD_DEMON > 5),
        affinity: clamp(bBaseAff + bList.length * 10, 0, 100),
        sources: bList
      }
    };
    resetNpcCache(npc);
    return sys.specialAccess;
  };

  ELEM.ensureNpc = (npc, opts) => {
    if (!npc || !npc.h) return null;
    const _ec = NPC_ELEM_CACHE.get(npc);
    const h = npc.h;
    if (!opts && _ec && _ec.ready && _ec.rootRef === h.root && _ec.sysRef === (npc.ext && npc.ext.elementalSystem) && _ec.traitsLen === (Array.isArray(h.traits) ? h.traits.length : 0)) return npc.ext.elementalSystem;
    const rootReady = ELEM.isCanonicalRootObject(h.root);
    const sysReady = npc.ext && elementalSystemIsReady(npc.ext.elementalSystem);
    const activeCapTraitIds = ['TR_ROOT_CAPACITY_DUAL', 'TR_ROOT_CAPACITY_TRIPLE', 'TR_ROOT_CAPACITY_FOURFOLD'];
    const activeCapTraits = Array.isArray(h.traits) ? h.traits.filter(x => x && activeCapTraitIds.includes(x.id)).map(x => x.id) : [];
    const wantTraitNow = rootReady ? (ELEM.ROOT_CAPACITY_TRAITS[h.root.rootCount] || 'ROOT_CAPACITY_SINGLE') : null;
    const traitsReady = rootReady && (wantTraitNow === 'ROOT_CAPACITY_SINGLE' ? activeCapTraits.length === 0 : activeCapTraits.length === 1 && activeCapTraits[0] === wantTraitNow);
    if (!opts && _ec && _ec.ready && rootReady && sysReady && traitsReady) return npc.ext.elementalSystem;
    opts = opts || {};
    if (!rootReady) h.root = repairRootObject(npc);

    h.traits = Array.isArray(h.traits) ? h.traits : [];
    const capTraitIds = ['TR_ROOT_CAPACITY_DUAL', 'TR_ROOT_CAPACITY_TRIPLE', 'TR_ROOT_CAPACITY_FOURFOLD'];
    const wantTrait = ELEM.ROOT_CAPACITY_TRAITS[h.root.rootCount] || 'ROOT_CAPACITY_SINGLE';
    let keptWantedTrait = false;
    for (let i = h.traits.length - 1; i >= 0; i--) {
      const tid = h.traits[i] && h.traits[i].id;
      if (!capTraitIds.includes(tid)) continue;
      if (tid !== wantTrait || keptWantedTrait) h.traits.splice(i, 1);
      else keptWantedTrait = true;
    }
    if (wantTrait !== 'ROOT_CAPACITY_SINGLE' && !keptWantedTrait) {
      h.traits.push({ id: wantTrait, lv: 1 });
    }

    npc.ext = npc.ext || {};
    let sys = npc.ext.elementalSystem;
    if (!sys || typeof sys !== 'object' || sys.version !== 2) {
      const mastery = {};
      ELEM.ORDINARY_ELEMENTS.forEach(el => {
        const rootIdx = h.root.elements.indexOf(el);
        const gId = rootIdx >= 0 ? h.root.grades[rootIdx] : null;
        const gScore = gId ? (ELEM.GRADE_SCORE[gId] || 2) : 0;
        const aff = (h.affinities && Number.isFinite(h.affinities[el])) ? h.affinities[el] : 25;
        const stageBonus = npc.cult ? (npc.cult.stage || 1) * 3.5 : 0;
        const baseM = rootIdx >= 0
          ? clamp(Math.round((4 + gScore * 2.8 + aff * 0.14 + stageBonus * (rootIdx === 0 ? 1.0 : 0.7)) * 10) / 10, 2, 68)
          : clamp(Math.round((aff > 45 ? (aff - 45) * 0.15 : 0) * 10) / 10, 0, 25);
        mastery[el] = baseM;
      });
      const initSp = detectSpecialFromCult(npc.cult);
      const specialMastery = {
        ASTRAL: initSp.astral ? clamp(8 + (npc.cult.stage || 1) * 4, 5, 55) : 0,
        BLOOD_DEMON: initSp.blood ? clamp(8 + (npc.cult.stage || 1) * 4, 5, 55) : 0
      };
      sys = npc.ext.elementalSystem = {
        version: 2,
        mastery,
        specialMastery,
        specialAccess: {},
        dailyGainLog: { day: HC.nowDay || 0, byElement: {}, seenKeys: [] },
        lastCompatibilityCache: null
      };
    } else {
      if (!sys.mastery || typeof sys.mastery !== 'object' || Array.isArray(sys.mastery)) sys.mastery = {};
      ELEM.ORDINARY_ELEMENTS.forEach(el => {
        const value = Number(sys.mastery[el]);
        sys.mastery[el] = clamp(Number.isFinite(value) ? value : 0, 0, 100);
      });
      if (!sys.specialMastery || typeof sys.specialMastery !== 'object' || Array.isArray(sys.specialMastery)) sys.specialMastery = {};
      ELEM.SPECIAL_ELEMENTS.forEach(el => {
        const value = Number(sys.specialMastery[el]);
        sys.specialMastery[el] = clamp(Number.isFinite(value) ? value : 0, 0, 100);
      });
      if (!sys.dailyGainLog || typeof sys.dailyGainLog !== 'object' || Array.isArray(sys.dailyGainLog)) {
        sys.dailyGainLog = { day: HC.nowDay || 0, byElement: {}, seenKeys: [] };
      } else {
        if (!Number.isFinite(sys.dailyGainLog.day)) sys.dailyGainLog.day = HC.nowDay || 0;
        if (!sys.dailyGainLog.byElement || typeof sys.dailyGainLog.byElement !== 'object' || Array.isArray(sys.dailyGainLog.byElement)) sys.dailyGainLog.byElement = {};
        for (const el of Object.keys(sys.dailyGainLog.byElement)) {
          if (!ELEM.ALL_ELEMENTS.includes(el)) { delete sys.dailyGainLog.byElement[el]; continue; }
          const used = Number(sys.dailyGainLog.byElement[el]);
          if (!Number.isFinite(used)) delete sys.dailyGainLog.byElement[el];
          else sys.dailyGainLog.byElement[el] = clamp(used, 0, ELEM.MAX_DAILY_GAIN || 2.5);
        }
        if (!Array.isArray(sys.dailyGainLog.seenKeys)) sys.dailyGainLog.seenKeys = [];
        if (sys.dailyGainLog.seenKeys.length > 60) sys.dailyGainLog.seenKeys = sys.dailyGainLog.seenKeys.slice(-60);
      }
    }
    ELEM.syncSpecialAccess(npc);
    resetNpcCache(npc);
    return sys;
  };
  ELEM.ensureNpcElementalState = ELEM.ensureNpc;
  ELEM.invalidateNpcCache = npc => { NPC_ELEM_CACHE.delete(npc); };

  ELEM.setRootProfile = (npc, spec) => {
    if (!npc || !npc.h) return { ok: false, errors: ['ไม่พบตัวละครสำหรับแก้ไขรากวิญญาณ'], reason: 'ไม่พบตัวละครสำหรับแก้ไขรากวิญญาณ' };
    const val = ELEM.validateRootSpec(spec);
    if (!val.ok) return { ok: false, errors: val.errors, reason: val.errors.join(' · ') };
    npc.h.root = ELEM.buildRootObject(spec.elements, spec.grades);
    ELEM.ensureNpc(npc);
    if (spec.mastery && typeof spec.mastery === 'object') {
      const sys = npc.ext.elementalSystem;
      for (const el of ELEM.ORDINARY_ELEMENTS) {
        if (spec.mastery[el] != null && Number.isFinite(Number(spec.mastery[el]))) {
          sys.mastery[el] = clamp(Math.round(Number(spec.mastery[el]) * 100) / 100, 0, 100);
        }
      }
      for (const el of ELEM.SPECIAL_ELEMENTS) {
        if (spec.mastery[el] != null && Number.isFinite(Number(spec.mastery[el]))) {
          sys.specialMastery[el] = clamp(Math.round(Number(spec.mastery[el]) * 100) / 100, 0, 100);
        }
      }
    }
    NPC_ELEM_CACHE.delete(npc);
    ELEM.ensureNpc(npc);
    npc._cultRateBase = null;
    if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(npc);
    HC.bump(npc);
    return { ok: true, root: npc.h.root, elementalSystem: npc.ext.elementalSystem };
  };

  /* ---------- Action-Execution-Only Elemental Mastery Gain ---------- */
  ELEM.MAX_DAILY_GAIN = 2.5;
  const ACTION_BASE_GAIN = {
    skill_cast: 0.14,
    practice: 0.22,
    study: 0.28,
    cultivate_session: 0.24,
    craft_finish: 0.25,
    breakthrough_ok: 0.90,
    cult_gain: 0.08
  };
  // Supports both (npc, target, actionOrAmt, W, opts) and (W, npc, target, baseAmount, sourceTag)
  ELEM.gainMastery = (a1, a2, a3, a4, a5) => {
    let W, npc, targetOrElement, baseAmount, sourceTag;
    if (a1 && a1.h) {
      // Called as (npc, target, actionKindOrAmt, W, opts)
      npc = a1;
      targetOrElement = a2;
      W = a4;
      const opts = a5 || {};
      const scale = Number.isFinite(opts.scale) ? opts.scale : 1;
      if (typeof a3 === 'number') {
        baseAmount = a3 * scale;
        sourceTag = opts.sourceId || 'act';
      } else {
        baseAmount = (ACTION_BASE_GAIN[a3] || 0.18) * scale;
        sourceTag = (a3 || 'act') + ':' + (opts.sourceId || '');
      }
    } else {
      // Called as (W, npc, target, baseAmount, sourceTag)
      W = a1;
      npc = a2;
      targetOrElement = a3;
      baseAmount = typeof a4 === 'number' ? a4 : (ACTION_BASE_GAIN[a4] || 0.18);
      sourceTag = a5 || (typeof a4 === 'string' ? a4 : 'act');
    }

    if (!npc || npc.foe || npc.dead || !npc.h) return { gained: 0, details: {} };
    const sys = ELEM.ensureNpc(npc);
    if (!sys) return { gained: 0, details: {} };
    const prof = ELEM.getProfile(targetOrElement);
    if (!prof.valid || prof.mode === 'EXPLICIT_NON_ELEMENTAL' || prof.mode === 'ROOT_AGNOSTIC_UTILITY') {
      return { gained: 0, details: {} };
    }
    const day = W && W.day != null ? W.day : (HC.nowDay || 0);
    const tick = W && W.t != null ? W.t : 0;
    const log = sys.dailyGainLog;
    if (log.day !== day) {
      log.day = day;
      log.byElement = {};
      log.seenKeys = [];
    }
    const dedupKey = day + ':' + tick + ':' + (sourceTag || 'act') + ':' + prof.primary;
    if (sourceTag && log.seenKeys.includes(dedupKey)) {
      return { gained: 0, deduplicated: true, details: {} };
    }
    if (sourceTag) {
      log.seenKeys.push(dedupKey);
      if (log.seenKeys.length > 60) log.seenKeys.splice(0, log.seenKeys.length - 60);
    }

    const comp = (HC.eff(npc, 'intellect.comprehension') + HC.eff(npc, 'intellect.learningSpeed')) / 200;
    const details = {};
    let totalGained = 0, crossedBand = false;

    for (const [el, w] of Object.entries(prof.weights)) {
      const isSpec = ELEM.isValidSpecialElement(el);
      const map = isSpec ? sys.specialMastery : sys.mastery;
      const cur = map[el] || 0;
      if (cur >= 100) continue;
      const usedToday = log.byElement[el] || 0;
      if (usedToday >= ELEM.MAX_DAILY_GAIN) continue;

      let rootMult = 0.72;
      if (isSpec) {
        const acc = sys.specialAccess && sys.specialAccess[el];
        rootMult = (acc && acc.unlocked) ? (0.85 + (acc.affinity || 50) / 250) : 0.45;
      } else {
        const rIdx = npc.h.root.elements.indexOf(el);
        if (rIdx >= 0) {
          const gf = ELEM.GRADE_FACTORS[npc.h.root.grades[rIdx]] || ELEM.GRADE_FACTORS.MORTAL;
          rootMult = gf.study * (rIdx === 0 ? 1.08 : 0.96);
        } else {
          let bestL = 0.25;
          for (let i = 0; i < npc.h.root.elements.length; i++) {
            const rEl = npc.h.root.elements[i];
            const tr = (ELEM.LEARNING_GRAPH[rEl] && ELEM.LEARNING_GRAPH[rEl][el]) || 0.15;
            if (tr > bestL) bestL = tr;
          }
          rootMult = 0.55 + 0.45 * bestL;
        }
      }

      const diminishing = Math.pow(Math.max(0.06, 1 - cur / 104), 1.35);
      const rawGain = (baseAmount || 0.15) * w * rootMult * (0.75 + 0.5 * comp) * diminishing;
      const clampedGain = Math.min(ELEM.MAX_DAILY_GAIN - usedToday, Math.max(0, rawGain));
      if (clampedGain > 0.0001) {
        const nextVal = clamp(+(cur + clampedGain).toFixed(4), 0, 100);
        if (((nextVal * 4) | 0) !== ((cur * 4) | 0) || cur === 0) crossedBand = true;
        map[el] = nextVal;
        log.byElement[el] = +(usedToday + clampedGain).toFixed(4);
        details[el] = +clampedGain.toFixed(4);
        totalGained += clampedGain;
      }
    }
    if (totalGained > 0) {
      if (crossedBand || totalGained >= 0.25) {
        sys._mVer = (sys._mVer || 0) + 1;
        resetNpcCache(npc);
        npc._cultRateBase = null;
      }
    }
    return { gained: +totalGained.toFixed(4), details };
  };

  /* ---------- Central Compatibility Resolver ---------- */
  ELEM.effectiveMastery = (npc, targetEl) => {
    const sys = ELEM.ensureNpc(npc);
    if (!sys) return 0;
    const _ec = getNpcCache(npc);
    if (_ec.effMast[targetEl] !== undefined) return _ec.effMast[targetEl];
    if (ELEM.isValidSpecialElement(targetEl)) {
      const directSpec = sys.specialMastery[targetEl] || 0;
      let bestTransfer = 0;
      for (const oEl of ELEM.ORDINARY_ELEMENTS) {
        const m = sys.mastery[oEl] || 0;
        const l = (ELEM.LEARNING_GRAPH[oEl] && ELEM.LEARNING_GRAPH[oEl][targetEl]) || 0;
        if (m * l > bestTransfer) bestTransfer = m * l;
      }
      const v = clamp(0.75 * directSpec + 0.25 * bestTransfer, 0, 100); _ec.effMast[targetEl] = v; return v;
    }
    const direct = sys.mastery[targetEl] || 0;
    let maxTransfer = 0;
    for (const oEl of ELEM.ORDINARY_ELEMENTS) {
      if (oEl === targetEl) continue;
      const m = sys.mastery[oEl] || 0;
      const l = (ELEM.LEARNING_GRAPH[oEl] && ELEM.LEARNING_GRAPH[oEl][targetEl]) || 0;
      if (m * l > maxTransfer) maxTransfer = m * l;
    }
    const v = clamp(0.70 * direct + 0.30 * maxTransfer, 0, 100); _ec.effMast[targetEl] = v; return v;
  };

  ELEM.elementCapability = (npc, targetEl, mode) => {
    const sys = ELEM.ensureNpc(npc);
    const _ec = getNpcCache(npc);
    const capKey = targetEl + ":" + mode;
    if (_ec.cap[capKey]) return _ec.cap[capKey];
    const rootObj = npc.h.root;
    const gKey = mode === 'study' ? 'study' : mode === 'cult' ? 'cult' : 'combat';

    if (ELEM.isValidSpecialElement(targetEl)) {
      const acc = (sys.specialAccess && sys.specialAccess[targetEl]) || { unlocked: false, affinity: 25 };
      const mEff = ELEM.effectiveMastery(npc, targetEl);
      let bestSupport = 0.45;
      for (let i = 0; i < rootObj.elements.length; i++) {
        const rEl = rootObj.elements[i];
        const rG = ELEM.GRADE_FACTORS[rootObj.grades[i]] || ELEM.GRADE_FACTORS.MORTAL;
        const kVal = (ELEM.EFFICACY_MATRIX[rEl] && ELEM.EFFICACY_MATRIX[rEl][targetEl]) || 0.35;
        const sVal = kVal * rG[gKey] * (i === 0 ? 1.0 : 0.90);
        if (sVal > bestSupport) bestSupport = sVal;
      }
      const accessFactor = acc.unlocked ? (0.88 + (acc.affinity / 100) * 0.32) : 0.58;
      const score = 0.45 * accessFactor + 0.30 * bestSupport + 0.25 * (mEff / 100);
      const specRes = {
        element: targetEl,
        score: +score.toFixed(4),
        exactRootMatch: false,
        specialUnlocked: !!acc.unlocked,
        effectiveMastery: +mEff.toFixed(2),
        affinity: acc.affinity || 25
      };
      _ec.cap[capKey] = specRes;
      return specRes;
    }

    let bestRootFit = 0.25;
    let exactMatch = false;
    let matchedGrade = null;
    for (let i = 0; i < rootObj.elements.length; i++) {
      const rEl = rootObj.elements[i];
      const rGrade = rootObj.grades[i];
      const gf = ELEM.GRADE_FACTORS[rGrade] || ELEM.GRADE_FACTORS.MORTAL;
      const slotWeight = i === 0 ? 1.00 : i === 1 ? 0.92 : i === 2 ? 0.86 : 0.82;
      if (rEl === targetEl) {
        exactMatch = true;
        matchedGrade = rGrade;
        const fit = 1.00 * gf[gKey] * slotWeight;
        if (fit > bestRootFit) bestRootFit = fit;
      } else {
        const rel = mode === 'study'
          ? ((ELEM.LEARNING_GRAPH[rEl] && ELEM.LEARNING_GRAPH[rEl][targetEl]) || 0.20) * 0.85 + 0.25
          : ((ELEM.EFFICACY_MATRIX[rEl] && ELEM.EFFICACY_MATRIX[rEl][targetEl]) || 0.30);
        const fit = rel * gf[gKey] * slotWeight;
        if (fit > bestRootFit) bestRootFit = fit;
      }
    }

    const mEff = ELEM.effectiveMastery(npc, targetEl);
    const aff = HC.eff(npc, 'affinities.' + targetEl);
    const score = 0.55 * bestRootFit + 0.25 * (mEff / 100) + 0.20 * (aff / 100);
    const ordRes = {
      element: targetEl,
      score: +score.toFixed(4),
      exactRootMatch: exactMatch,
      matchedGrade,
      bestRootFit: +bestRootFit.toFixed(4),
      effectiveMastery: +mEff.toFixed(2),
      affinity: Math.round(aff)
    };
    _ec.cap[capKey] = ordRes;
    return ordRes;
  };

  function makeNeutralResult(context, mode) {
    return {
      valid: true,
      context,
      mode: mode || 'EXPLICIT_NON_ELEMENTAL',
      primaryElement: 'NEUTRAL',
      rawFit: 0.78,
      multiplier: 1.0,
      combatMultiplier: 1.0,
      damageMult: 1.0,
      qiCostMultiplier: 1.0,
      costMult: 1.0,
      cultivationMultiplier: 1.0,
      studySpeedMultiplier: 1.0,
      studySpeedMult: 1.0,
      masteryGainMultiplier: 1.0,
      breakthroughBonus: 0,
      backlashRiskDelta: 0,
      equipmentSynergyMultiplier: 1.0,
      equipmentSuitabilityMult: 1.0,
      craftingSuccessBonus: 0,
      craftSuccessBonus: 0,
      craftingQualityBonus: 0,
      craftQualityBonus: 0,
      accBonus: 0,
      controlChanceMult: 1.0,
      aiPreferenceScore: 0,
      score: 0,
      tier: 'NEUTRAL',
      reasonsTh: ['วิชา/อุปกรณ์ไร้ธาตุเฉพาะ (ใช้ได้เต็มประสิทธิภาพกับทุกรากวิญญาณ)'],
      perElement: {}
    };
  }

  const NEUTRAL_COMPAT_RESULT = Object.freeze({
    valid: true,
    context: "COMBAT_SKILL",
    mode: "EXPLICIT_NON_ELEMENTAL",
    element: "NEUTRAL",
    primaryElement: "NEUTRAL",
    rawFit: 0.78,
    score: 0,
    multiplier: 1.0,
    accBonus: 0,
    controlChanceMult: 1.0,
    combatMultiplier: 1.0,
    damageMult: 1.0,
    qiCostMultiplier: 1.0,
    costMult: 1.0,
    cultivationMultiplier: 1.0,
    cultivationMult: 1.0,
    studySpeedMultiplier: 1.0,
    studySpeedMult: 1.0,
    masteryGainMultiplier: 1.0,
    masteryGainMult: 1.0,
    breakthroughBonus: 0,
    breakthroughDelta: 0,
    backlashRiskDelta: 0,
    equipmentSynergyMultiplier: 1.0,
    equipmentSuitabilityMult: 1.0,
    craftingSuccessBonus: 0,
    craftSuccessBonus: 0,
    craftingQualityBonus: 0,
    craftQualityBonus: 0,
    aiPreferenceScore: 0,
    tier: "NEUTRAL",
    labelTh: "ไร้ข้อจำกัดธาตุ",
    tierTh: "ไร้ข้อจำกัดธาตุ",
    reasonsTh: Object.freeze(["วิชา/อุปกรณ์ไร้ธาตุเฉพาะ (ใช้ได้เต็มประสิทธิภาพกับทุกรากวิญญาณ)"]),
    perElement: Object.freeze({})
  });

  ELEM.resolveCompatibility = (npc, targetDef, context) => {
    context = context || "COMBAT_SKILL";
    if (!npc || npc.foe || !npc.h) return NEUTRAL_COMPAT_RESULT;
    ELEM.ensureNpc(npc);
    const _ec = getNpcCache(npc);
    const targetKey = (typeof targetDef === "string") ? targetDef : (targetDef && (targetDef.id || targetDef.sub || targetDef.outItemId || targetDef.key || targetDef.nameTh)) || null;
    const cacheKey = targetKey ? (targetKey + ":" + context) : null;
    if (cacheKey) {
      const hit = _ec.compat[cacheKey];
      if (hit) return hit;
    }
    const prof = ELEM.getProfile(targetDef);
    if (prof.valid && (prof.mode === "EXPLICIT_NON_ELEMENTAL" || prof.mode === "ROOT_AGNOSTIC_UTILITY" || prof.primary === "NEUTRAL")) {
      if (cacheKey) _ec.compat[cacheKey] = NEUTRAL_COMPAT_RESULT;
      return NEUTRAL_COMPAT_RESULT;
    }
    if (!prof.valid) {
      return {
        valid: false,
        error: prof.error || 'Invalid elemental profile',
        context,
        mode: 'UNKNOWN',
        primaryElement: 'UNKNOWN',
        rawFit: 0,
        multiplier: 0.65,
        combatMultiplier: 0.65,
        damageMult: 0.65,
        qiCostMultiplier: 1.30,
        costMult: 1.30,
        cultivationMultiplier: 0.60,
        studySpeedMultiplier: 0.55,
        studySpeedMult: 0.55,
        masteryGainMultiplier: 0.60,
        breakthroughBonus: -0.08,
        backlashRiskDelta: 0.18,
        equipmentSynergyMultiplier: 0.82,
        equipmentSuitabilityMult: 0.82,
        craftingSuccessBonus: -0.06,
        craftSuccessBonus: -0.06,
        craftingQualityBonus: -0.05,
        craftQualityBonus: -0.05,
        accBonus: -4,
        controlChanceMult: 0.85,
        aiPreferenceScore: -35,
        score: -35,
        tier: 'CLASH',
        reasonsTh: ['ข้อมูลธาตุไม่ถูกต้อง (' + (prof.error || 'UNKNOWN') + ')'],
        perElement: {}
      };
    }

    if (prof.mode === 'EXPLICIT_NON_ELEMENTAL' || prof.mode === 'ROOT_AGNOSTIC_UTILITY' || prof.primary === 'NEUTRAL') {
      return makeNeutralResult(context, prof.mode);
    }

    const weights = prof.weights || { [prof.primary]: 1.0 };
    const entries = Object.entries(weights);
    const perElement = {};
    let rCombat = 0, rCult = 0, rStudy = 0;
    let exactMatchedCount = 0;

    for (const [el, w] of entries) {
      const cComb = ELEM.elementCapability(npc, el, 'combat');
      const cCult = ELEM.elementCapability(npc, el, 'cult');
      const cStud = ELEM.elementCapability(npc, el, 'study');
      perElement[el] = {
        weight: w,
        combatCap: cComb.score,
        cultCap: cCult.score,
        studyCap: cStud.score,
        exactRootMatch: cComb.exactRootMatch,
        matchedGrade: cComb.matchedGrade,
        effectiveMastery: cComb.effectiveMastery,
        affinity: cComb.affinity
      };
      rCombat += w * cComb.score;
      rCult += w * cCult.score;
      rStudy += w * cStud.score;
      if (ELEM.isValidOrdinaryElement(el)) {
        if (cComb.exactRootMatch) exactMatchedCount++;
      } else if (ELEM.isValidSpecialElement(el) && cComb.specialUnlocked) {
        exactMatchedCount++;
      }
    }

    let covBonus = 0;
    if (entries.length >= 2) {
      const covRatio = exactMatchedCount / Math.max(1, entries.length);
      if (covRatio >= 0.99) covBonus = 0.08 + Math.min(0.04, (entries.length - 2) * 0.02);
      else if (covRatio >= 0.50) covBonus = 0.03;
      else if (exactMatchedCount === 0) covBonus = -0.05;
    } else if (entries.length === 1 && npc.h.root.rootCount === 1 && exactMatchedCount === 1) {
      covBonus = 0.05;
    }

    rCombat = clamp(rCombat + covBonus, 0.20, 1.45);
    rCult = clamp(rCult + covBonus, 0.20, 1.50);
    rStudy = clamp(rStudy + covBonus, 0.20, 1.50);

    const ctxNorm = String(context || '').toUpperCase();
    const isStudyCtx = ctxNorm === 'TECH_STUDY' || ctxNorm === 'LEARNING' || ctxNorm === 'EXPERIMENT' || ctxNorm === 'CRAFTING';
    const isCultCtx = ctxNorm === 'CULTIVATION' || ctxNorm === 'CULTIVATION_TICK' || ctxNorm === 'MANTRA_PRACTICE' || ctxNorm === 'BREAKTHROUGH' || ctxNorm === 'PATH_SELECT' || ctxNorm === 'SUBPATH_SELECT' || ctxNorm === 'PATHCHOICE';
    const isEquipmentCtx = ctxNorm === 'EQUIPMENT' || ctxNorm === 'GEAR';

    const activeFit = isStudyCtx ? rStudy : isCultCtx ? rCult : rCombat;

    const combatMultiplier = +clamp(0.65 + 0.65 * ((rCombat - 0.30) / 0.85), 0.65, 1.35).toFixed(4);
    const qiCostMultiplier = +clamp(1.22 - 0.36 * ((rCombat - 0.30) / 0.85), 0.78, 1.30).toFixed(4);
    const cultivationMultiplier = +clamp(0.60 + 0.75 * ((rCult - 0.30) / 0.85), 0.60, 1.45).toFixed(4);
    const studySpeedMultiplier = +clamp(0.55 + 0.85 * ((rStudy - 0.30) / 0.85), 0.55, 1.50).toFixed(4);
    const masteryGainMultiplier = +clamp(0.60 + 0.75 * ((rStudy - 0.30) / 0.85), 0.60, 1.45).toFixed(4);
    const breakthroughBonus = +clamp((rCult - 0.68) * 0.18, -0.08, 0.12).toFixed(4);
    const backlashRiskDelta = +clamp(rCult < 0.52 ? (0.52 - rCult) * 0.45 : 0, 0, 0.18).toFixed(4);
    const equipmentSynergyMultiplier = +clamp(0.82 + 0.36 * ((rCombat - 0.30) / 0.85), 0.82, 1.22).toFixed(4);
    const craftingSuccessBonus = +clamp((rStudy - 0.62) * 0.18, -0.06, 0.12).toFixed(4);
    const craftingQualityBonus = +clamp((rStudy - 0.62) * 0.20, -0.05, 0.15).toFixed(4);
    const accBonus = +clamp((rCombat - 0.65) * 12, -4, 8).toFixed(2);
    const controlChanceMult = +clamp(0.88 + (rCombat - 0.45) * 0.35, 0.85, 1.18).toFixed(4);
    const aiPreferenceScore = +clamp((activeFit - 0.68) * 68, -35, 45).toFixed(2);
    const multiplier = isStudyCtx ? studySpeedMultiplier : isCultCtx ? cultivationMultiplier : isEquipmentCtx ? equipmentSynergyMultiplier : combatMultiplier;

    let tier = 'NEUTRAL';
    if (activeFit >= 0.92) tier = 'EXCELLENT';
    else if (activeFit >= 0.76) tier = 'GOOD';
    else if (activeFit >= 0.58) tier = 'NEUTRAL';
    else if (activeFit >= 0.44) tier = 'POOR';
    else tier = 'CLASH';

    const reasonsTh = [];
    const pMeta = ELEM.META[prof.primary] || { nameTh: prof.primary };
    if (exactMatchedCount > 0) {
      if (entries.length > 1 && exactMatchedCount >= 2) {
        reasonsTh.push('รากวิญญาณรองรับหลายธาตุตรงสาย (' + exactMatchedCount + '/' + entries.length + ' ธาตุ)');
      } else {
        reasonsTh.push('รากวิญญาณตรงกับ' + pMeta.nameTh + 'โดยตรง');
      }
    } else if (activeFit >= 0.76) {
      reasonsTh.push('ธาตุเกื้อหนุนกับ' + pMeta.nameTh + 'ได้ดี');
    } else if (activeFit < 0.52) {
      reasonsTh.push('ธาตุขัดแย้งกับ' + pMeta.nameTh + ' (ลดประสิทธิภาพและสิ้นเปลืองปราณ)');
    } else {
      reasonsTh.push('ความเข้ากันได้กับ' + pMeta.nameTh + 'อยู่ในระดับปานกลาง');
    }

    const resultObj = {
      valid: true,
      context,
      mode: prof.mode,
      primaryElement: prof.primary,
      compositeTag: prof.compositeTag || null,
      rawFit: +activeFit.toFixed(4),
      multiplier,
      combatMultiplier,
      damageMult: combatMultiplier,
      qiCostMultiplier,
      costMult: qiCostMultiplier,
      cultivationMultiplier,
      studySpeedMultiplier,
      studySpeedMult: studySpeedMultiplier,
      masteryGainMultiplier,
      breakthroughBonus,
      backlashRiskDelta,
      equipmentSynergyMultiplier,
      equipmentSuitabilityMult: equipmentSynergyMultiplier,
      craftingSuccessBonus,
      craftSuccessBonus: craftingSuccessBonus,
      craftingQualityBonus,
      craftQualityBonus: craftingQualityBonus,
      accBonus,
      controlChanceMult,
      aiPreferenceScore,
      score: aiPreferenceScore,
      coverageBonus: +covBonus.toFixed(4),
      tier,
      reasonsTh,
      perElement
    };
    if (targetKey) {
      _ec.compat[targetKey + ":" + context] = resultObj;
    }
    return resultObj;
  };

  ELEM.explainCompatibility = (npc, targetDef, context) => {
    const res = ELEM.resolveCompatibility(npc, targetDef, context);
    const tierTh = {
      EXCELLENT: 'สอดคล้องเลิศล้ำ',
      GOOD: 'เกื้อหนุนดี',
      NEUTRAL: 'ปานกลาง',
      POOR: 'ฝืนชีพจร',
      CLASH: 'ธาตุขัดแย้งรุนแรง'
    }[res.tier] || 'ปานกลาง';
    const elMeta = ELEM.META[res.primaryElement] || ELEM.META.NEUTRAL;
    return Object.assign({}, res, {
      tierTh,
      elementNameTh: elMeta.nameTh,
      elementShortTh: elMeta.shortTh,
      elementIcon: elMeta.icon,
      summaryTh: elMeta.icon + ' ' + elMeta.shortTh + ' · ' + tierTh + ' (×' + (Number.isFinite(res.multiplier) ? res.multiplier : res.combatMultiplier).toFixed(2) + ')'
    });
  };

  ELEM.RELATIONS = Object.freeze({
    FIRE: Object.freeze({
      WATER_ICE: 'OPPOSE',
      WOOD_LIFE: 'SUPPORT',
      EARTH_METAL: 'SUPPORT',
      WIND: 'SUPPORT',
      LIGHT_YANG: 'SUPPORT'
    }),
    WATER_ICE: Object.freeze({
      FIRE: 'OPPOSE',
      WOOD_LIFE: 'SUPPORT',
      EARTH_METAL: 'SUPPORT',
      YIN_SHADOW: 'SUPPORT'
    }),
    WOOD_LIFE: Object.freeze({
      EARTH_METAL: 'OPPOSE',
      FIRE: 'SUPPORT',
      WATER_ICE: 'SUPPORT'
    }),
    EARTH_METAL: Object.freeze({
      WOOD_LIFE: 'OPPOSE',
      LIGHTNING: 'OPPOSE',
      WATER_ICE: 'SUPPORT',
      FIRE: 'SUPPORT'
    }),
    LIGHTNING: Object.freeze({
      EARTH_METAL: 'OPPOSE',
      WIND: 'SUPPORT'
    }),
    WIND: Object.freeze({
      FIRE: 'SUPPORT',
      LIGHTNING: 'SUPPORT'
    }),
    LIGHT_YANG: Object.freeze({
      YIN_SHADOW: 'OPPOSE',
      BLOOD_DEMON: 'OPPOSE',
      FIRE: 'SUPPORT',
      ASTRAL: 'SUPPORT'
    }),
    YIN_SHADOW: Object.freeze({
      LIGHT_YANG: 'OPPOSE',
      WATER_ICE: 'SUPPORT'
    }),
    ASTRAL: Object.freeze({
      BLOOD_DEMON: 'OPPOSE',
      LIGHT_YANG: 'SUPPORT'
    }),
    BLOOD_DEMON: Object.freeze({
      LIGHT_YANG: 'OPPOSE',
      ASTRAL: 'OPPOSE'
    })
  });

  ELEM.classifyRelation = (elA, elB) => {
    if (!elA || !elB || elA === 'NEUTRAL' || elB === 'NEUTRAL') return 'NEUTRAL';
    if (elA === elB) return 'MATCH';
    const rel = ELEM.RELATIONS[elA] && ELEM.RELATIONS[elA][elB];
    if (rel) return rel;
    const revRel = ELEM.RELATIONS[elB] && ELEM.RELATIONS[elB][elA];
    if (revRel) return revRel;
    return 'NEUTRAL';
  };

  ELEM.combatElementalMatchup = (attacker, defender, attackDef) => {
    const atkProf = ELEM.getProfile(attackDef);
    if (!atkProf.valid || atkProf.primary === 'NEUTRAL') return 1.0;
    let defEl = 'NEUTRAL';
    if (defender) {
      if (defender.foe) {
        if (defender._cachedDefEl) defEl = defender._cachedDefEl;
        else {
          const sp = JD.BEASTS && JD.BEASTS.species && JD.BEASTS.species.find(s => s.id === defender.speciesId || s.nameTh === defender.name);
          if (sp && sp.element) defEl = sp.element;
          else if (defender.element && defender.element !== 'NEUTRAL') defEl = defender.element;
          else if (defender.elementProfile && defender.elementProfile.primary) defEl = defender.elementProfile.primary;
          defender._cachedDefEl = defEl;
        }
      } else if (defender.cult) {
        const m = defender.cult.mantra && CULT.tech(defender.cult.mantra);
        const sub = CULT.subInfo(defender.cult.path, defender.cult.sub);
        defEl = (m && m.element && m.element !== 'NEUTRAL') ? m.element : (sub && sub.element) || (defender.h && defender.h.root && defender.h.root.primaryElement) || 'NEUTRAL';
      } else if (defender.h && defender.h.root) {
        defEl = defender.h.root.primaryElement || 'NEUTRAL';
      }
    }
    if (!defEl || defEl === 'NEUTRAL') return 1.0;
    // Multi-element techniques must use their declared profile weights in the
    // tactical matchup; using only `primary` silently discarded every secondary element.
    const weights = atkProf.weights || { [atkProf.primary]: 1.0 };
    let weighted = 0, totalWeight = 0;
    for (const [atkEl, rawWeight] of Object.entries(weights)) {
      const weight = Number(rawWeight);
      if (!Number.isFinite(weight) || weight <= 0) continue;
      const row = ELEM.COUNTER_MATRIX[atkEl];
      const value = row && Number.isFinite(row[defEl]) ? row[defEl] : 1.0;
      weighted += weight * value;
      totalWeight += weight;
    }
    return totalWeight > 0 ? weighted / totalWeight : 1.0;
  };

  ELEM.resolveCombatInteraction = (attacker, defender, skillOrTech) => {
    const tDef = (skillOrTech && skillOrTech.tech && CULT.tech(skillOrTech.tech)) || skillOrTech;
    const attackerCompat = ELEM.resolveCompatibility(attacker, tDef, 'COMBAT_SKILL');
    const targetCounterMult = ELEM.combatElementalMatchup(attacker, defender, tDef);

    // Weapon resonance is a weighted interaction between every declared weapon
    // element and every technique element. A primary-element-only comparison
    // silently discarded composite techniques and composite weapons.
    let weaponResonance = 1.0;
    const wpn = attacker && attacker.equip && attacker.equip.WEAPON;
    const weaponProfile = wpn ? ELEM.getProfile(wpn) : null;
    const skillProfile = tDef ? ELEM.getProfile(tDef) : null;
    const isResonant = p => !!p && p.valid && p.primary !== 'NEUTRAL' && p.mode !== 'ELEMENT_LINK_ONLY' && p.mode !== 'EXPLICIT_NON_ELEMENTAL' && p.mode !== 'ROOT_AGNOSTIC_UTILITY';
    if (isResonant(weaponProfile) && isResonant(skillProfile)) {
      const getNormWeights = profile => {
        if (profile._normWeights) return profile._normWeights;
        const raw = profile.weights || { [profile.primary]: 1 };
        const pairs = [];
        let total = 0;
        for (const element in raw) {
          const weight = Number(raw[element]);
          if ((ELEM.isValidOrdinaryElement(element) || ELEM.isValidSpecialElement(element)) && Number.isFinite(weight) && weight > 0) {
            pairs.push([element, weight]);
            total += weight;
          }
        }
        profile._normWeights = total > 0 ? pairs.map(([el, w]) => [el, w / total]) : [[profile.primary, 1]];
        return profile._normWeights;
      };
      const weaponWeights = getNormWeights(weaponProfile);
      const techniqueWeights = getNormWeights(skillProfile);
      const relationMultiplier = (weaponElement, skillElement) => {
        if (weaponElement === skillElement) return 1.06;
        const raw = ELEM.EFFICACY_MATRIX[weaponElement] && ELEM.EFFICACY_MATRIX[weaponElement][skillElement];
        const efficacy = Number.isFinite(raw) ? raw : 0.5;
        if (efficacy >= 0.72) return 1.03;
        if (efficacy <= 0.28) return 0.95;
        return 1.0;
      };
      let weightedResonance = 0, totalWeight = 0;
      for (const [weaponElement, weaponWeight] of weaponWeights) {
        for (const [skillElement, skillWeight] of techniqueWeights) {
          const pairWeight = weaponWeight * skillWeight;
          weightedResonance += relationMultiplier(weaponElement, skillElement) * pairWeight;
          totalWeight += pairWeight;
        }
      }
      if (totalWeight > 0) {
        weaponResonance = +clamp(weightedResonance / totalWeight, 0.95, 1.06).toFixed(4);
      }
    }

    const counterRelation = targetCounterMult >= 1.04 ? 'COUNTER_ADVANTAGE' : targetCounterMult <= 0.96 ? 'RESISTED' : 'NEUTRAL';
    // Elemental counters also influence control reliability, but at half strength
    // so a damage advantage does not become a guaranteed stun/silence.
    const targetControlFactor = clamp(1 + (targetCounterMult - 1) * 0.5, 0.90, 1.10);
    const controlChanceMult = +clamp((attackerCompat.controlChanceMult || 1) * targetControlFactor, 0.75, 1.25).toFixed(4);
    const totalDamageMult = +clamp(attackerCompat.combatMultiplier * weaponResonance * targetCounterMult, 0.58, 1.52).toFixed(4);
    const healSupportMult = +clamp(attackerCompat.combatMultiplier * weaponResonance, 0.70, 1.40).toFixed(4);
    return {
      attackerCompat,
      weaponResonance,
      targetCounterMult,
      targetControlFactor: +targetControlFactor.toFixed(4),
      counterRelation,
      totalDamageMult,
      damageMult: totalDamageMult,
      healSupportMult,
      costMult: attackerCompat.qiCostMultiplier,
      accBonus: attackerCompat.accBonus,
      controlChanceMult
    };
  };

  /* ---------- Wire Option A Root-Capacity Traits & Zero-RNG-Shift HC.generate Wrapper ---------- */
  if (HC) {
    const SEASON_NAMES = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'];
    const origTraitDef = HC.traitDef;
    HC.traitDef = id => {
      const d = origTraitDef ? origTraitDef(id) : null;
      if (d) return d;
      return (JD.CORE && JD.CORE.rootCapacityTraits && JD.CORE.rootCapacityTraits[id]) || null;
    };
    const origTraitMods = HC.traitMods;
    const findRawTraitMod = (rawMods, m, idx) => {
      if (!Array.isArray(rawMods)) return null;
      const cand = rawMods[idx];
      if (cand && (cand.stat === m.stat || (cand.stat === 'physiology.poisonResistance' && m.stat === 'physiology.immunity'))) return cand;
      return rawMods.find(rm => rm && (rm.stat === m.stat || (rm.stat === 'physiology.poisonResistance' && m.stat === 'physiology.immunity')) && (rm.op === m.op || (rm.op === 'MAX_CAP' && m.op === 'MULT'))) || null;
    };
    const isGrudgeTarget = (npc, target) => {
      if (!npc || !target || !target.id) return false;
      const rel = npc.rels && npc.rels[target.id];
      if (rel) {
        if ((rel.grudge || 0) >= 20 || (rel.hatred || 0) >= 20) return true;
        if (Array.isArray(rel.tags) && (rel.tags.includes('KILLER') || rel.tags.includes('GRUDGE') || rel.tags.includes('ENEMY') || rel.tags.includes('BETRAYED'))) return true;
      }
      const mRel = npc.h && npc.h.mind && npc.h.mind.relations && npc.h.mind.relations[target.id];
      if (mRel && ((mRel.a || 0) <= -35 || mRel.bond === 'ศัตรู' || mRel.killerOfMentor || mRel.killerOfLoved)) return true;
      const grudges = npc.h && npc.h.mind && npc.h.mind.grudges;
      if (Array.isArray(grudges) && grudges.some(gr => gr && (gr.targetId === target.id || gr.who === target.id || (target.sectId && gr.sectId === target.sectId)))) return true;
      if (Array.isArray(npc.destinyThreads) && npc.destinyThreads.some(th => th && th.type === 'BLACK_THREAD' && (th.aId === target.id || th.bId === target.id))) return true;
      return false;
    };
    let _inEvalCond = false;
    const evalTraitCondition = (npc, cond, ctx) => {
      if (!cond) return true;
      if (!npc || !npc.h) return false;
      if (cond.requiredSeason) {
        const sIdx = HC.nowSeason != null ? HC.nowSeason : ((g.W && g.W.season != null) ? g.W.season : 0);
        const sName = typeof sIdx === 'string' ? sIdx : (SEASON_NAMES[sIdx] || 'SPRING');
        if (sName !== cond.requiredSeason && sIdx !== cond.requiredSeason) return false;
      }
      if (cond.maxHealth != null) {
        if (_inEvalCond) return false;
        _inEvalCond = true;
        try {
          const hp = npc.h.state ? npc.h.state.hp : null;
          let hpMax = (npc._d && npc._d.hpMax) || (npc.h.state && npc.h.state.hpMax);
          if (!hpMax && HC.derived) {
            const d = HC.derived(npc);
            hpMax = d && d.hpMax;
          }
          if (hp == null || !hpMax || hpMax <= 0) return false;
          if ((hp / hpMax) * 100 > cond.maxHealth) return false;
        } finally {
          _inEvalCond = false;
        }
      }
      if (cond.inCombatAgainstGrudge) {
        if (ctx && ctx.inCombatAgainstGrudge != null) return !!ctx.inCombatAgainstGrudge;
        const tgt = (ctx && ctx.target) || npc._activeOpponent || npc._combatTarget || (npc.act && npc.act.targetId && g.W && g.W.byId ? g.W.byId[npc.act.targetId] : null);
        if (!isGrudgeTarget(npc, tgt)) return false;
      }
      return true;
    };
    HC.traitMods = (id, lv) => {
      if (JD.CORE && JD.CORE.rootCapacityTraits && JD.CORE.rootCapacityTraits[id]) {
        return [];
      }
      const mods = origTraitMods ? origTraitMods(id, lv) : [];
      if (!Array.isArray(mods) || !mods.length) return mods;
      const def = HC.traitDef(id);
      const rawMods = def && def.modifiers;
      if (!Array.isArray(rawMods) || !rawMods.length) return mods;
      const filtered = [];
      for (let i = 0; i < mods.length; i++) {
        const m = mods[i];
        const rawM = findRawTraitMod(rawMods, m, i);
        if (rawM && (rawM.op === 'MAX_CAP' || rawM.condition)) continue;
        if (m.stat === 'physiology.poisonResistance') {
          filtered.push(Object.assign({}, m, { stat: 'physiology.immunity' }));
        } else {
          filtered.push(m);
        }
      }
      return filtered;
    };
    const origEff = HC.eff;
    HC.eff = (npc, path, ctx) => {
      let val = origEff ? origEff(npc, path) : 50;
      const traits = npc && npc.h && npc.h.traits;
      if (!Array.isArray(traits) || !traits.length) return val;
      for (let ti = 0; ti < traits.length; ti++) {
        const tr = traits[ti];
        if (!tr || !tr.id) continue;
        const def = HC.traitDef(tr.id);
        const rawMods = def && def.modifiers;
        if (!Array.isArray(rawMods)) continue;
        let capVal = null;
        let condAdd = 0;
        let condMult = 1;
        let hasCond = false;
        const scaledMods = origTraitMods ? origTraitMods(tr.id, tr.lv || 1) : rawMods;
        for (let i = 0; i < rawMods.length; i++) {
          const rm = rawMods[i];
          if (!rm) continue;
          const mappedStat = rm.stat === 'physiology.poisonResistance' ? 'physiology.immunity' : rm.stat;
          if (mappedStat !== path) continue;
          if (rm.op === 'MAX_CAP') {
            if (evalTraitCondition(npc, rm.condition, ctx)) {
              capVal = capVal == null ? rm.value : Math.min(capVal, rm.value);
            }
          } else if (rm.condition && evalTraitCondition(npc, rm.condition, ctx)) {
            const sm = (Array.isArray(scaledMods) && scaledMods[i] && scaledMods[i].stat === rm.stat) ? scaledMods[i] : rm;
            if (rm.op === 'ADD') { condAdd += sm.value; hasCond = true; }
            else if (rm.op === 'MULT') { condMult *= sm.value; hasCond = true; }
          }
        }
        if (hasCond) val = clamp(Math.round((val * condMult + condAdd) * 100) / 100, 1, 99);
        if (capVal != null) val = Math.min(val, capVal);
      }
      return val;
    };
    const origSpecial = HC.special;
    HC.special = (npc, path, ctx) => {
      let val = origSpecial ? origSpecial(npc, path) : (path === 'combat.powerMult' ? 1 : 0);
      const traits = npc && npc.h && npc.h.traits;
      if (!Array.isArray(traits) || !traits.length) return val;
      for (let ti = 0; ti < traits.length; ti++) {
        const tr = traits[ti];
        if (!tr || !tr.id) continue;
        const def = HC.traitDef(tr.id);
        const rawMods = def && def.modifiers;
        if (!Array.isArray(rawMods)) continue;
        const scaledMods = origTraitMods ? origTraitMods(tr.id, tr.lv || 1) : rawMods;
        for (let i = 0; i < rawMods.length; i++) {
          const rm = rawMods[i];
          if (!rm || rm.stat !== path || !rm.condition) continue;
          if (!evalTraitCondition(npc, rm.condition, ctx)) continue;
          const sm = (Array.isArray(scaledMods) && scaledMods[i] && scaledMods[i].stat === rm.stat) ? scaledMods[i] : rm;
          if (rm.op === 'MULT') val *= sm.value;
          else if (rm.op === 'ADD') val += sm.value;
        }
      }
      return val;
    };
    HC.hasUnlockTag = (npc, tag) => {
      const traits = npc && npc.h && npc.h.traits;
      if (!Array.isArray(traits) || !tag) return false;
      for (let i = 0; i < traits.length; i++) {
        const tr = traits[i];
        const def = tr && tr.id ? HC.traitDef(tr.id) : null;
        const tags = def && def.behaviorMods && def.behaviorMods.unlockTags;
        if (Array.isArray(tags) && tags.includes(tag)) return true;
      }
      return false;
    };
    HC.decisionBias = (npc, key) => {
      const traits = npc && npc.h && npc.h.traits;
      if (key) {
        if (!Array.isArray(traits) || !traits.length) return 0;
        let sum = 0;
        for (let i = 0; i < traits.length; i++) {
          const tr = traits[i];
          const def = tr && tr.id ? HC.traitDef(tr.id) : null;
          const db = def && def.behaviorMods && def.behaviorMods.decisionBias;
          if (db && typeof db[key] === 'number') sum += db[key];
        }
        return sum;
      }
      const out = {};
      if (!Array.isArray(traits) || !traits.length) return out;
      for (let i = 0; i < traits.length; i++) {
        const tr = traits[i];
        const def = tr && tr.id ? HC.traitDef(tr.id) : null;
        const db = def && def.behaviorMods && def.behaviorMods.decisionBias;
        if (!db || typeof db !== 'object') continue;
        for (const k of Object.keys(db)) {
          if (typeof db[k] === 'number') out[k] = (out[k] || 0) + db[k];
        }
      }
      return out;
    };
    const INNATE_CURATED_POOL = Object.values((JD.CORE && JD.CORE.curatedTraits) || {}).concat((JD.CORE && JD.CORE.extraTraits) || [])
      .filter(t => t && (t.category === 'INNATE' || t.category === 'BLOODLINE' || t.category === 'UPBRINGING'));
    const sanitizeBirthTrait = (h, trObj, idx) => {
      if (!h || !trObj || !trObj.id || !INNATE_CURATED_POOL.length) return null;
      const def = HC.traitDef(trObj.id);
      if (!def || (def.category !== 'ACQUIRED' && def.category !== 'TRAINING')) return def;
      const gHash = Math.abs(((h.genome || 1) * 31 + (idx + 1) * 97) | 0);
      for (let step = 0; step < INNATE_CURATED_POOL.length; step++) {
        const cand = INNATE_CURATED_POOL[(gHash + step) % INNATE_CURATED_POOL.length];
        if (!cand || h.traits.some(x => x && x.id === cand.id)) continue;
        if ((cand.conflictsWith || []).some(cid => h.traits.some(x => x && x.id === cid))) continue;
        if (h.traits.some(x => { const d = HC.traitDef(x && x.id); return d && (d.conflictsWith || []).includes(cand.id); })) continue;
        trObj.id = cand.id;
        return cand;
      }
      return def;
    };
    const origAddTrait = HC.addTrait;
    HC.addTrait = (npc, rng, id) => {
      const res = origAddTrait(npc, rng, id);
      if (!id && npc && !npc._allowAcquiredRoll && npc.h && Array.isArray(npc.h.traits) && npc.h.traits.length > 0) {
        const lastIdx = npc.h.traits.length - 1;
        const swapped = sanitizeBirthTrait(npc.h, npc.h.traits[lastIdx], lastIdx);
        npc._ver = (npc._ver || 0) + 1; npc._c = null; npc._d = null;
        return swapped || res;
      }
      return res;
    };
    const origBioAge = HC.bioAge;
    HC.bioAge = npc => {
      if (!npc || !npc.h) return 22;
      const a = HC.ageYears(npc);
      const ls = Math.max(80, npc.lifespanMax || (npc.cult && g.CULT && g.CULT.lifespan ? g.CULT.lifespan(npc) : 80));
      if (npc.cult && ls > 80) {
        if (a <= 20) return a;
        return 20 + (a - 20) * 80 / ls;
      }
      return origBioAge ? origBioAge(npc) : (a * 80 / ls);
    };
    const origGenerate = HC.generate;
    HC.generate = (rng, opts) => {
      const npc = origGenerate(rng, opts);
      if (npc && npc.h && Array.isArray(npc.h.traits) && !(opts && opts.allowAcquiredTraits)) {
        for (let ti = 0; ti < npc.h.traits.length; ti++) {
          sanitizeBirthTrait(npc.h, npc.h.traits[ti], ti);
        }
      }
      const rootSeed = 'hc_birth_root:' + npc.h.genome + ':' + npc.h.birthDay + ':' + ((opts && opts.id) || '');
      const rootRng = new U.RNG(rootSeed);
      const explicitGrade = (opts && opts.explicitRootGrade) || (opts && opts.rootGrade && !opts._fromTierRoll && !opts.fromApplicant ? opts.rootGrade : null);
      npc.h.root = ELEM.rollBirthRoots(rootRng, {
        customRoots: opts && opts.customRoots,
        forceRootCount: opts && opts.forceRootCount,
        forceElements: opts && opts.forceElements,
        forceGrades: opts && opts.forceGrades,
        explicitRootGrade: explicitGrade
      });
      ELEM.ensureNpc(npc);
      npc._c = null;
      npc._d = null;
      npc.h.state.hp = HC.derived(npc).hpMax;
      return npc;
    };
  }

  /* =========================================================================
   * 1) ระบบวิถีบำเพ็ญ (CULTIVATION SYSTEM)
   * ========================================================================= */
  const CULT = {};
  CULT.ELEM = ELEM;
  g.ELEM = ELEM;
  g.ELEMENTAL = ELEM;

  CULT.PATHS = JD.CULT.paths;
  CULT.PATH_IDS = Object.keys(CULT.PATHS);
  CULT.THRESH = {
    XIAN: [260, 700, 1800, 4500, 11000, 27000, 65000, 150000],
    BODY: [1200, 6800, 28000, 96000],
    GOD: [2400, 22000, 105000],
    DEMON: [240, 650, 1680, 4200, 10400, 25500, 61500, 142000],
    HEART_SOUL: [250, 680, 1750, 4400, 10800, 26500, 63500, 146000],
    MECH_PUPPET: [245, 670, 1720, 4350, 10700, 26200, 63000],
    KARMA_SAMSARA: [250, 680, 1740, 4400, 10800, 26400, 63500],
    BEAST_SOVEREIGN: [245, 675, 1730, 4380, 10750, 26300, 63200],
    SAGE_SUPPORT: [245, 670, 1720, 4350, 10700, 26200, 63000],
    CRAFT_CREATION: [245, 670, 1720, 4350, 10700, 26200, 63000],
    ARRAY_TALISMAN: [250, 680, 1740, 4400, 10800, 26400, 63500],
    STRATEGY_GOVERNANCE: [250, 680, 1740, 4400, 10800, 26400, 63500],
    ASTRO_DIVINATION: [250, 680, 1740, 4400, 10800, 26400, 63500],
    BUDDHA_DHARMA: [250, 680, 1740, 4400, 10800, 26400, 63500],
    VOID_SPACE: [255, 690, 1760, 4450, 10900, 26600, 64000],
    SONIC_HARMONY: [245, 670, 1720, 4350, 10700, 26200, 63000],
    VENOM_GU: [245, 675, 1730, 4380, 10750, 26300, 63200],
    PRIMORDIAL_SHIFTER: [245, 675, 1730, 4380, 10750, 26300, 63200],
    CELESTIAL_WEATHER: [250, 680, 1740, 4400, 10800, 26400, 63500],
    WANDERING_DAO: [245, 670, 1720, 4350, 10700, 26200, 63000],
    MERCANTILE_DAO: [245, 670, 1720, 4350, 10700, 26200, 63000],
    DRAGON_VEIN_GEOMANCY: [250, 680, 1740, 4400, 10800, 26400, 63500],
    GRAVITY_DAO: [255, 690, 1760, 4450, 10900, 26600, 64000],
    CHRONO_EPOCH: [255, 690, 1760, 4450, 10900, 26600, 64000],
    INK_LITERATI: [245, 670, 1720, 4350, 10700, 26200, 63000],
    SOUL_PUPPETRY: [250, 680, 1740, 4400, 10800, 26400, 63500],
    PRIMORDIAL_CHAOS: [260, 700, 1800, 4500, 11000, 27000, 65000],
    SHADOW_SAMURAI: [240, 660, 1700, 4300, 10600, 26000, 62500],
    NINPO_SHADOW: [240, 665, 1710, 4320, 10650, 26100, 62800],
    NINPO_ELEMENTAL: [245, 670, 1720, 4350, 10700, 26200, 63000],
    DIVINE_SUMMONER: [255, 690, 1760, 4450, 10900, 26600, 64000],
    DIVINE_POSSESSION: [255, 690, 1760, 4450, 10900, 26600, 64000],
    DIVINE_CHANNELER: [250, 680, 1740, 4400, 10800, 26400, 63500],
    VOID_HERETIC_PACT: [255, 690, 1760, 4450, 10900, 26600, 64000],
    OCCULT_MAGE: [245, 675, 1730, 4380, 10750, 26300, 63200],
    DEVOURING_FLESH: [245, 675, 1730, 4380, 10750, 26300, 63200],
    NETHER_GRAVE: [250, 680, 1740, 4400, 10800, 26400, 63500],
    ANCESTRAL_RITUAL: [245, 670, 1720, 4350, 10700, 26200, 63000],
    TIDE_VOYAGER: [245, 670, 1720, 4350, 10700, 26200, 63000],
    LORE_ARCHIVIST: [245, 670, 1720, 4350, 10700, 26200, 63000],
    FORTUNE_GAMBLER: [240, 665, 1710, 4320, 10650, 26100, 62800],
    SPIRIT_HUSBANDRY: [245, 670, 1720, 4350, 10700, 26200, 63000],
    ARENA_GLORY: [245, 675, 1730, 4380, 10750, 26300, 63200],
    LEG_READ_FORM_BLADE: [265, 725, 1860, 4700, 11500, 28000, 67500],
    LEG_TRIAGE_MERIDIAN: [265, 725, 1860, 4700, 11500, 28000, 67500],
    LEG_STORM_CALLER_TEMPEST: [265, 725, 1860, 4700, 11500, 28000, 67500],
    LEG_JADE_CARAVAN_VOYAGER: [265, 725, 1860, 4700, 11500, 28000, 67500],
    LEG_OATH_JUDGE_WARDEN: [265, 725, 1860, 4700, 11500, 28000, 67500],
    LEG_ASHEN_KILN_ALCHEMY: [265, 725, 1860, 4700, 11500, 28000, 67500],
    TRANS_CONSTELLATION_RELAY: [290, 790, 2020, 5100, 12450, 30200, 72500],
    TRANS_FIELD_CLAUSE_SOVEREIGN: [290, 790, 2020, 5100, 12450, 30200, 72500],
    TRANS_TEMPO_SOVEREIGN: [290, 790, 2020, 5100, 12450, 30200, 72500],
    TRANS_SEALKEEPER_FORBIDDEN_KEY: [290, 790, 2020, 5100, 12450, 30200, 72500],
    TRANS_PRIMAL_VORTEX_MIRROR: [290, 790, 2020, 5100, 12450, 30200, 72500],
    TRANS_DYNASTIC_MANDATE_WEAVER: [290, 790, 2020, 5100, 12450, 30200, 72500],
    CORPSE_SOVEREIGN: [250, 680, 1740, 4400, 10800, 26400, 63500],
    WRAITH_GRIEVANCE: [250, 680, 1740, 4400, 10800, 26400, 63500],
    DEATHLESS_CADAVER: [250, 680, 1740, 4400, 10800, 26400, 63500]
  };
  const SUBPREF = {
    SWORD_IMMORTAL: { aff: { SWORD: 1, MOVEMENT: .5 }, p: { 'personality.courage': .4, 'values.martialPeak': .4 } },
    FIVE_ELEMENTS: { aff: { FIRE: .4, WATER_ICE: .4, WOOD_LIFE: .4, EARTH_METAL: .4, LIGHTNING: .3 }, p: { 'personality.rationality': .4 } },
    ELIXIR_DAO: { aff: { ALCHEMY: 1, MEDICINE: .6 }, p: { 'values.knowledgeCraft': .5, 'intellect.comprehension': .3 } },
    ASTRAL_ARRAY: { aff: { ARRAY: 1, TALISMAN: .6 }, p: { 'intellect.spatial': .5, 'intellect.planning': .3 } },
    BLOOD_DEMON: { aff: { POISON: .5, YIN_SHADOW: .4 }, p: { 'personality.aggression': .6, 'values.powerStatus': .4, 'personality.integrity': -.5, 'personality.empathy': -.4 } },
    PHANTOM_SOUL: { aff: { YIN_SHADOW: 1, SOUL_DIVINE: .5 }, p: { 'social.deception': .4, 'intellect.intuition': .3 } },
    TIME_VOID: { aff: { SCRIPTURE: .6, ARRAY: .4, MOVEMENT: .4 }, p: { 'intellect.comprehension': .6, 'intellect.reasoning': .4 } },
    SOUND_ZITHER: { aff: { SOUL_DIVINE: .4, WIND: .5 }, p: { 'interests.arts': .7, 'personality.empathy': .3 } },
    YIN_YANG_HARMONY: { aff: { YIN_SHADOW: .4, LIGHT_YANG: .4 }, p: { 'personality.composure': .6, 'intellect.wisdom': .4 } },
    TIGER_SOVEREIGN: { aff: { FIST_PALM: .7, BEAST_TAMING: .3 }, p: { 'physiology.strength': .6, 'personality.aggression': .4 } },
    BLOOD_DRAGON: { aff: { FIRE: .5, BODY_REFINING: .6 }, p: { 'physiology.vitality': .6, 'personality.courage': .4 } },
    VAJRA_BODHI: { aff: { BODY_REFINING: .6, SOUL_DIVINE: .5 }, p: { 'personality.discipline': .6, 'physiology.toughness': .4 } },
    DEVOURING_FIEND: { aff: { BODY_REFINING: .5, POISON: .3 }, p: { 'personality.aggression': .5, 'personality.integrity': -.4, 'physiology.immunity': .4 } },
    SOLAR_FORGE: { aff: { FORGING: .8, FIRE: .6, LIGHT_YANG: .4 }, p: { 'interests.forging': .5 } },
    THUNDER_BODY: { aff: { LIGHTNING: 1, BODY_REFINING: .5 }, p: { 'physiology.reflex': .4, 'temperament.sensationSeeking': .4 } },
    JADE_IMMORTAL_BODY: { aff: { WOOD_LIFE: .8, MEDICINE: .4 }, p: { 'physiology.recoveryRate': .6, 'physiology.flexibility': .3 } },
    TITAN_MOUNTAIN_BODY: { aff: { EARTH_METAL: .8, BODY_REFINING: .6 }, p: { 'physiology.toughness': .6, 'physiology.endurance': .4 } },
    WAR_DEITY: { aff: { SPEAR: .5, BLADE: .4 }, p: { 'social.leadership': .6, 'personality.courage': .5, 'aptitudes.command': .5 } },
    MERCY_DEITY: { aff: { MEDICINE: .7, SOUL_DIVINE: .5 }, p: { 'personality.empathy': .8, 'social.hospitality': .4 } },
    FATE_ORACLE: { aff: { SCRIPTURE: .6, SOUL_DIVINE: .5 }, p: { 'intellect.intuition': .6, 'destiny.luck': .4 } },
    TOTEM_BEAST_GOD: { aff: { BEAST_TAMING: 1 }, p: { 'interests.beasts': .6, 'personality.courage': .3 } },
    UNDERWORLD_JUDGE: { aff: { YIN_SHADOW: .6, SOUL_DIVINE: .4 }, p: { 'personality.integrity': .6, 'personality.discipline': .4, 'social.intimidation': .4 } },
    OCEAN_SOVEREIGN: { aff: { WATER_ICE: 1 }, p: { 'social.charisma': .4, 'temperament.optimism': .3 } },
    HARVEST_EARTH_GOD: { aff: { WOOD_LIFE: .6, EARTH_METAL: .4 }, p: { 'social.hospitality': .6, 'interests.herbs': .5 } },
    SHADOW_ASSASSIN: { aff: { YIN_SHADOW: 1, MOVEMENT: .7, BLADE: .5 }, p: { 'physiology.agility': .6, 'social.deception': .4, 'personality.caution': .3 } },
    VENOM_GU_SOVEREIGN: { aff: { POISON: 1, ALCHEMY: .7, WOOD_LIFE: .4 }, p: { 'intellect.inventiveness': .5, 'physiology.immunity': .5, 'personality.empathy': -.3 } },
    NETHER_GHOST_KING: { aff: { YIN_SHADOW: .9, SOUL_DIVINE: .7, WATER_ICE: .4 }, p: { 'personality.composure': .5, 'social.intimidation': .5, 'personality.ambition': .4 } },
    HEAVEN_DEVOURING_DEMON: { aff: { FIST_PALM: .7, FIRE: .5, YIN_SHADOW: .6 }, p: { 'personality.ambition': .7, 'personality.aggression': .6, 'values.powerStatus': .5, 'personality.integrity': -.4 } },
    ZEN_VOID_MIND: { aff: { SOUL_DIVINE: .8, SCRIPTURE: .7, LIGHT_YANG: .4 }, p: { 'personality.composure': .8, 'intellect.wisdom': .6, 'personality.empathy': .4, 'personality.aggression': -.4 } },
    CALLIGRAPHY_PAINTING_SAGE: { aff: { SCRIPTURE: .9, TALISMAN: .7, ARRAY: .6 }, p: { 'intellect.comprehension': .7, 'interests.arts': .7, 'personality.creativity': .5 } },
    DREAM_ILLUSION_WEAVER: { aff: { SOUL_DIVINE: .8, YIN_SHADOW: .5, WIND: .4 }, p: { 'intellect.intuition': .7, 'personality.creativity': .6, 'personality.curiosity': .5 } },
    MIND_SWORD_TELEKINESIS: { aff: { SWORD: .9, SOUL_DIVINE: .8, ASTRAL: .4 }, p: { 'intellect.focus': .8, 'intellect.willpower': .6, 'values.martialPeak': .5 } }
  };
  Object.assign(SUBPREF, (JD.EXPANSION && JD.EXPANSION.subPreferences) || {}, (JD.MARTIAL && JD.MARTIAL.subPreferences) || {});
  CULT.SUBPREF = SUBPREF;
  CULT.subList = [];
  Object.keys(CULT.PATHS).forEach(pid => CULT.PATHS[pid].subPaths.forEach(s => CULT.subList.push({ path: pid, sub: s })));

  function pval(npc, path) {
    if (path === 'destiny.luck') return npc.h.destiny.luck;
    return HC.eff(npc, path);
  }
  /** คะแนนความอยากเดินสายย่อย (ทำไมคนนี้เลือกวิถีนี้ — อธิบายได้ รวมรากวิญญาณและธาตุ) */
  CULT.pathScores = (npc, bias) => {
    if (!Number.isFinite(HC.nowDay)) HC.nowDay = 360;
    ELEM.ensureNpc(npc);
    const _ec = getNpcCache(npc);
    const cPath = npc.cult ? npc.cult.path : '', cSub = npc.cult ? npc.cult.sub : '', cSt = npc.cult ? npc.cult.stage : 0;
    if (!bias && _ec.pathScores && _ec.psVer === npc._ver && _ec.psSkillVer === (npc._pathSkillVersion || 0) && _ec.psPath === cPath && _ec.psSub === cSub && _ec.psSt === cSt) return _ec.pathScores;
    const out = [];
    const body = (HC.eff(npc, 'physiology.strength') + HC.eff(npc, 'physiology.toughness') + HC.eff(npc, 'physiology.endurance')) / 3;
    const qi = (HC.eff(npc, 'physiology.meridianCapacity') + HC.eff(npc, 'physiology.spiritualFoundation') + HC.eff(npc, 'intellect.comprehension')) / 3;
    const faith = (HC.eff(npc, 'social.charisma') + HC.eff(npc, 'intellect.willpower') + HC.eff(npc, 'interests.worship') + HC.eff(npc, 'affinities.SOUL_DIVINE')) / 4;
    const demon = (HC.eff(npc, 'personality.ambition') + HC.eff(npc, 'personality.aggression') + HC.eff(npc, 'values.powerStatus') + HC.eff(npc, 'affinities.YIN_SHADOW') + HC.eff(npc, 'affinities.POISON')) / 5;
    const soul = (HC.eff(npc, 'intellect.comprehension') + HC.eff(npc, 'intellect.intuition') + HC.eff(npc, 'personality.composure') + HC.eff(npc, 'affinities.SOUL_DIVINE') + HC.eff(npc, 'affinities.SCRIPTURE')) / 5;
    const base = {
      XIAN: qi * 0.7 + HC.eff(npc, 'aptitudes.cultivation') * 0.5,
      BODY: body * 0.8 + HC.eff(npc, 'interests.combat') * 0.4 + HC.eff(npc, 'physiology.vitality') * 0.2 - 10,
      GOD: faith * 0.8 + HC.eff(npc, 'personality.empathy') * 0.2 + 10,
      DEMON: demon * 0.85 + HC.eff(npc, 'aptitudes.combat') * 0.35 + (55 - HC.eff(npc, 'personality.integrity')) * 0.25 - 1.5,
      HEART_SOUL: soul * 0.85 + HC.eff(npc, 'aptitudes.comprehension') * 0.4 + HC.eff(npc, 'interests.meditation') * 0.2 - 12.5,
      MECH_PUPPET: ((HC.eff(npc, 'intellect.inventiveness') + HC.eff(npc, 'physiology.dexterity') + HC.eff(npc, 'affinities.FORGING') + HC.eff(npc, 'affinities.ARRAY')) / 4) * 0.85 + HC.eff(npc, 'aptitudes.crafting') * 0.38 - 1.5,
      KARMA_SAMSARA: ((HC.eff(npc, 'intellect.wisdom') + HC.eff(npc, 'personality.composure') + HC.eff(npc, 'affinities.SCRIPTURE') + HC.eff(npc, 'affinities.SOUL_DIVINE')) / 4) * 0.85 + HC.eff(npc, 'aptitudes.comprehension') * 0.36 - 0.5,
      BEAST_SOVEREIGN: ((HC.eff(npc, 'interests.beasts') + HC.eff(npc, 'affinities.BEAST_TAMING') + HC.eff(npc, 'social.leadership') + HC.eff(npc, 'personality.courage')) / 4) * 0.85 + HC.eff(npc, 'aptitudes.command') * 0.38 - 1.5,
      SAGE_SUPPORT: ((HC.eff(npc, 'affinities.MEDICINE') + HC.eff(npc, 'affinities.ALCHEMY') + HC.eff(npc, 'personality.empathy') + HC.eff(npc, 'interests.arts')) / 4) * 0.85 + HC.eff(npc, 'aptitudes.cultivation') * 0.36 - 0.5,
      CRAFT_CREATION: ((HC.eff(npc, 'affinities.ALCHEMY') + HC.eff(npc, 'affinities.FORGING') + HC.eff(npc, 'intellect.inventiveness') + HC.eff(npc, 'values.knowledgeCraft')) / 4) * 0.85 + HC.eff(npc, 'aptitudes.crafting') * 0.42 + Math.max(npc.h.skills.ALCHEMY || 0, npc.h.skills.FORGING || 0, npc.h.skills.ARRAY || 0, npc.h.skills.TALISMAN || 0) * 0.12 - 3.5,
      ARRAY_TALISMAN: (HC.eff(npc, 'affinities.ARRAY') + HC.eff(npc, 'affinities.TALISMAN') + HC.eff(npc, 'intellect.spatial') + HC.eff(npc, 'intellect.focus')) * 0.2 + HC.eff(npc, 'aptitudes.comprehension') * 0.4,
      STRATEGY_GOVERNANCE: (HC.eff(npc, 'intellect.planning') + HC.eff(npc, 'intellect.judgement') + HC.eff(npc, 'social.leadership') + HC.eff(npc, 'interests.leading')) * 0.2 + HC.eff(npc, 'aptitudes.command') * 0.4,
      ASTRO_DIVINATION: (HC.eff(npc, 'intellect.intuition') + HC.eff(npc, 'intellect.comprehension') + HC.eff(npc, 'affinities.SCRIPTURE') + HC.eff(npc, 'affinities.ARRAY')) * 0.2 + HC.eff(npc, 'aptitudes.comprehension') * 0.38 - 1.0,
      BUDDHA_DHARMA: (HC.eff(npc, 'personality.composure') + HC.eff(npc, 'personality.empathy') + HC.eff(npc, 'intellect.willpower') + HC.eff(npc, 'affinities.LIGHT_YANG')) * 0.2 + HC.eff(npc, 'aptitudes.cultivation') * 0.38 - 1.0,
      VOID_SPACE: (HC.eff(npc, 'intellect.spatial') + HC.eff(npc, 'physiology.agility') + HC.eff(npc, 'affinities.MOVEMENT') + HC.eff(npc, 'affinities.ARRAY')) * 0.2 + HC.eff(npc, 'aptitudes.comprehension') * 0.38 - 1.0,
      SONIC_HARMONY: (HC.eff(npc, 'interests.arts') + HC.eff(npc, 'affinities.SOUL_DIVINE') + HC.eff(npc, 'affinities.WIND') + HC.eff(npc, 'social.charisma')) * 0.2 + HC.eff(npc, 'aptitudes.comprehension') * 0.36 - 1.0,
      VENOM_GU: (HC.eff(npc, 'affinities.POISON') + HC.eff(npc, 'affinities.BEAST_TAMING') + HC.eff(npc, 'physiology.immunity') + HC.eff(npc, 'intellect.inventiveness')) * 0.2 + HC.eff(npc, 'aptitudes.crafting') * 0.36 - 1.5,
      PRIMORDIAL_SHIFTER: (HC.eff(npc, 'physiology.vitality') + HC.eff(npc, 'physiology.strength') + HC.eff(npc, 'affinities.BODY_REFINING') + HC.eff(npc, 'affinities.BEAST_TAMING')) * 0.2 + HC.eff(npc, 'aptitudes.combat') * 0.38 - 1.0,
      CELESTIAL_WEATHER: (HC.eff(npc, 'affinities.LIGHTNING') + HC.eff(npc, 'affinities.WIND') + HC.eff(npc, 'affinities.WATER_ICE') + HC.eff(npc, 'intellect.intuition')) * 0.2 + HC.eff(npc, 'aptitudes.cultivation') * 0.38 - 1.0,
      WANDERING_DAO: (HC.eff(npc, 'values.freedom') + HC.eff(npc, 'affinities.MOVEMENT') + HC.eff(npc, 'physiology.endurance') + HC.eff(npc, 'personality.curiosity')) * 0.2 + HC.eff(npc, 'aptitudes.cultivation') * 0.36 - 1.0,
      MERCANTILE_DAO: (HC.eff(npc, 'intellect.judgement') + HC.eff(npc, 'intellect.planning') + HC.eff(npc, 'social.persuasion') + HC.eff(npc, 'values.wealthResource')) * 0.2 + HC.eff(npc, 'aptitudes.command') * 0.36 - 1.5,
      DRAGON_VEIN_GEOMANCY: (HC.eff(npc, 'affinities.EARTH_METAL') + HC.eff(npc, 'affinities.ARRAY') + HC.eff(npc, 'intellect.spatial') + HC.eff(npc, 'physiology.toughness')) * 0.2 + HC.eff(npc, 'aptitudes.crafting') * 0.38 - 1.0,
      GRAVITY_DAO: (HC.eff(npc, 'affinities.EARTH_METAL') + HC.eff(npc, 'physiology.strength') + HC.eff(npc, 'intellect.willpower') + HC.eff(npc, 'physiology.toughness')) * 0.2 + HC.eff(npc, 'aptitudes.combat') * 0.38 - 1.0,
      CHRONO_EPOCH: (HC.eff(npc, 'intellect.comprehension') + HC.eff(npc, 'intellect.wisdom') + HC.eff(npc, 'affinities.SCRIPTURE') + HC.eff(npc, 'personality.composure')) * 0.2 + HC.eff(npc, 'aptitudes.comprehension') * 0.40 - 1.5,
      INK_LITERATI: (HC.eff(npc, 'affinities.SCRIPTURE') + HC.eff(npc, 'affinities.TALISMAN') + HC.eff(npc, 'interests.arts') + HC.eff(npc, 'intellect.comprehension')) * 0.2 + HC.eff(npc, 'aptitudes.comprehension') * 0.38 - 1.0,
      SOUL_PUPPETRY: (HC.eff(npc, 'affinities.SOUL_DIVINE') + HC.eff(npc, 'affinities.YIN_SHADOW') + HC.eff(npc, 'physiology.dexterity') + HC.eff(npc, 'intellect.focus')) * 0.2 + HC.eff(npc, 'aptitudes.crafting') * 0.38 - 1.5,
      PRIMORDIAL_CHAOS: (HC.eff(npc, 'physiology.meridianCapacity') + HC.eff(npc, 'intellect.comprehension') + HC.eff(npc, 'intellect.willpower') + HC.eff(npc, 'physiology.vitality')) * 0.2 + HC.eff(npc, 'aptitudes.cultivation') * 0.40 - 1.5,
      SHADOW_SAMURAI: (HC.eff(npc, 'affinities.SWORD') + HC.eff(npc, 'affinities.BLADE') + HC.eff(npc, 'physiology.agility') + HC.eff(npc, 'intellect.focus')) * 0.2 + HC.eff(npc, 'aptitudes.combat') * 0.36 - 1.0,
      NINPO_SHADOW: (HC.eff(npc, 'affinities.YIN_SHADOW') + HC.eff(npc, 'affinities.MOVEMENT') + HC.eff(npc, 'physiology.agility') + HC.eff(npc, 'physiology.dexterity')) * 0.2 + HC.eff(npc, 'aptitudes.combat') * 0.36 - 1.0,
      NINPO_ELEMENTAL: (HC.eff(npc, 'affinities.FIRE') + HC.eff(npc, 'affinities.LIGHTNING') + HC.eff(npc, 'affinities.TALISMAN') + HC.eff(npc, 'physiology.dexterity')) * 0.2 + HC.eff(npc, 'aptitudes.comprehension') * 0.36 - 1.0,
      DIVINE_SUMMONER: (HC.eff(npc, 'affinities.SOUL_DIVINE') + HC.eff(npc, 'affinities.SCRIPTURE') + HC.eff(npc, 'interests.worship') + HC.eff(npc, 'social.charisma')) * 0.2 + HC.eff(npc, 'aptitudes.cultivation') * 0.36 - 1.0,
      DIVINE_POSSESSION: (HC.eff(npc, 'affinities.SOUL_DIVINE') + HC.eff(npc, 'physiology.toughness') + HC.eff(npc, 'intellect.willpower') + HC.eff(npc, 'personality.courage')) * 0.2 + HC.eff(npc, 'aptitudes.combat') * 0.36 - 1.0,
      DIVINE_CHANNELER: (HC.eff(npc, 'affinities.LIGHT_YANG') + HC.eff(npc, 'affinities.SOUL_DIVINE') + HC.eff(npc, 'intellect.focus') + HC.eff(npc, 'intellect.comprehension')) * 0.2 + HC.eff(npc, 'aptitudes.comprehension') * 0.36 - 1.0,
      VOID_HERETIC_PACT: (HC.eff(npc, 'affinities.YIN_SHADOW') + HC.eff(npc, 'intellect.intuition') + HC.eff(npc, 'personality.ambition') + HC.eff(npc, 'personality.curiosity')) * 0.2 + HC.eff(npc, 'aptitudes.comprehension') * 0.36 - 1.0,
      OCCULT_MAGE: (HC.eff(npc, 'affinities.TALISMAN') + HC.eff(npc, 'affinities.POISON') + HC.eff(npc, 'intellect.willpower') + HC.eff(npc, 'physiology.toughness')) * 0.2 + HC.eff(npc, 'aptitudes.cultivation') * 0.36 - 1.0,
      DEVOURING_FLESH: (HC.eff(npc, 'affinities.BODY_REFINING') + HC.eff(npc, 'physiology.vitality') + HC.eff(npc, 'physiology.strength') + HC.eff(npc, 'personality.aggression')) * 0.2 + HC.eff(npc, 'aptitudes.combat') * 0.36 - 1.0,
      NETHER_GRAVE: (HC.eff(npc, 'affinities.YIN_SHADOW') + HC.eff(npc, 'affinities.SOUL_DIVINE') + HC.eff(npc, 'intellect.willpower') + HC.eff(npc, 'personality.composure')) * 0.2 + HC.eff(npc, 'aptitudes.cultivation') * 0.36 - 1.0,
      ANCESTRAL_RITUAL: (HC.eff(npc, 'affinities.SOUL_DIVINE') + HC.eff(npc, 'interests.worship') + HC.eff(npc, 'social.charisma') + ((HC.eff(npc, 'values.sectDuty') + HC.eff(npc, 'values.honorLegacy')) * 0.5)) * 0.2 + HC.eff(npc, 'aptitudes.command') * 0.36 - 1.0,
      TIDE_VOYAGER: (HC.eff(npc, 'affinities.WATER_ICE') + HC.eff(npc, 'affinities.WIND') + HC.eff(npc, 'physiology.endurance') + HC.eff(npc, 'values.freedom')) * 0.2 + HC.eff(npc, 'aptitudes.cultivation') * 0.36 - 1.0,
      LORE_ARCHIVIST: (HC.eff(npc, 'affinities.SCRIPTURE') + HC.eff(npc, 'intellect.wisdom') + HC.eff(npc, 'intellect.memory') + HC.eff(npc, 'values.knowledgeCraft')) * 0.2 + HC.eff(npc, 'aptitudes.comprehension') * 0.36 - 1.0,
      FORTUNE_GAMBLER: (HC.eff(npc, 'intellect.intuition') + HC.eff(npc, 'physiology.agility') + HC.eff(npc, 'personality.courage') + HC.eff(npc, 'values.wealthResource')) * 0.2 + HC.eff(npc, 'aptitudes.combat') * 0.36 - 1.0,
      SPIRIT_HUSBANDRY: (HC.eff(npc, 'affinities.BEAST_TAMING') + HC.eff(npc, 'affinities.MEDICINE') + HC.eff(npc, 'interests.beasts') + HC.eff(npc, 'personality.empathy')) * 0.2 + HC.eff(npc, 'aptitudes.crafting') * 0.36 - 1.0,
      ARENA_GLORY: (HC.eff(npc, 'interests.combat') + HC.eff(npc, 'physiology.strength') + HC.eff(npc, 'social.charisma') + HC.eff(npc, 'values.powerStatus')) * 0.2 + HC.eff(npc, 'aptitudes.combat') * 0.36 - 1.0,
      LEG_READ_FORM_BLADE: (npc && npc.daoDiscoveries && npc.daoDiscoveries['LEG_READ_FORM_BLADE']) ? (HC.eff(npc, 'interests.combat') * 0.40 + HC.eff(npc, 'personality.discipline') * 0.35 + HC.eff(npc, 'intellect.comprehension') * 0.30 + 14) : -999,
      LEG_TRIAGE_MERIDIAN: (npc && npc.daoDiscoveries && npc.daoDiscoveries['LEG_TRIAGE_MERIDIAN']) ? (HC.eff(npc, 'personality.empathy') * 0.45 + HC.eff(npc, 'intellect.comprehension') * 0.35 + HC.eff(npc, 'personality.discipline') * 0.25 + 16) : -999,
      LEG_STORM_CALLER_TEMPEST: (npc && npc.daoDiscoveries && npc.daoDiscoveries['LEG_STORM_CALLER_TEMPEST']) ? (HC.eff(npc, 'intellect.comprehension') * 0.40 + HC.eff(npc, 'personality.curiosity') * 0.35 + HC.eff(npc, 'interests.combat') * 0.25 + 14) : -999,
      LEG_JADE_CARAVAN_VOYAGER: (npc && npc.daoDiscoveries && npc.daoDiscoveries['LEG_JADE_CARAVAN_VOYAGER']) ? (HC.eff(npc, 'aptitudes.socialCommerce') * 0.45 + HC.eff(npc, 'personality.curiosity') * 0.30 + HC.eff(npc, 'personality.discipline') * 0.25 + 14) : -999,
      LEG_OATH_JUDGE_WARDEN: (npc && npc.daoDiscoveries && npc.daoDiscoveries['LEG_OATH_JUDGE_WARDEN']) ? (HC.eff(npc, 'personality.integrity') * 0.45 + HC.eff(npc, 'social.leadership') * 0.30 + HC.eff(npc, 'personality.discipline') * 0.25 + 14) : -999,
      LEG_ASHEN_KILN_ALCHEMY: (npc && npc.daoDiscoveries && npc.daoDiscoveries['LEG_ASHEN_KILN_ALCHEMY']) ? (HC.eff(npc, 'values.knowledgeCraft') * 0.45 + HC.eff(npc, 'personality.discipline') * 0.30 + HC.eff(npc, 'intellect.comprehension') * 0.25 + 14) : -999,
      TRANS_CONSTELLATION_RELAY: (npc && npc.daoDiscoveries && npc.daoDiscoveries['TRANS_CONSTELLATION_RELAY']) ? (HC.eff(npc, 'personality.empathy') * 0.42 + HC.eff(npc, 'social.leadership') * 0.30 + HC.eff(npc, 'intellect.comprehension') * 0.33 + 16) : -999,
      TRANS_FIELD_CLAUSE_SOVEREIGN: (npc && npc.daoDiscoveries && npc.daoDiscoveries['TRANS_FIELD_CLAUSE_SOVEREIGN']) ? (HC.eff(npc, 'social.leadership') * 0.42 + HC.eff(npc, 'personality.rationality') * 0.33 + HC.eff(npc, 'personality.discipline') * 0.30 + 14) : -999,
      TRANS_TEMPO_SOVEREIGN: (npc && npc.daoDiscoveries && npc.daoDiscoveries['TRANS_TEMPO_SOVEREIGN']) ? (HC.eff(npc, 'intellect.comprehension') * 0.42 + HC.eff(npc, 'personality.caution') * 0.30 + HC.eff(npc, 'interests.combat') * 0.30 + 14) : -999,
      TRANS_SEALKEEPER_FORBIDDEN_KEY: (npc && npc.daoDiscoveries && npc.daoDiscoveries['TRANS_SEALKEEPER_FORBIDDEN_KEY']) ? (HC.eff(npc, 'personality.caution') * 0.38 + HC.eff(npc, 'intellect.comprehension') * 0.38 + HC.eff(npc, 'personality.discipline') * 0.28 + 14) : -999,
      TRANS_PRIMAL_VORTEX_MIRROR: (npc && npc.daoDiscoveries && npc.daoDiscoveries['TRANS_PRIMAL_VORTEX_MIRROR']) ? (HC.eff(npc, 'intellect.comprehension') * 0.45 + HC.eff(npc, 'personality.curiosity') * 0.35 + HC.eff(npc, 'personality.rationality') * 0.25 + 14) : -999,
      TRANS_DYNASTIC_MANDATE_WEAVER: (npc && npc.daoDiscoveries && npc.daoDiscoveries['TRANS_DYNASTIC_MANDATE_WEAVER']) ? (HC.eff(npc, 'social.leadership') * 0.42 + HC.eff(npc, 'personality.integrity') * 0.33 + HC.eff(npc, 'intellect.comprehension') * 0.30 + 16) : -999,
      CORPSE_SOVEREIGN: ((npc && npc.daoDiscoveries && npc.daoDiscoveries['CORPSE_SOVEREIGN']) || (npc && npc.cult && npc.cult.path === 'CORPSE_SOVEREIGN')) ? (HC.eff(npc, 'affinities.YIN_SHADOW') + HC.eff(npc, 'affinities.SOUL_DIVINE') + HC.eff(npc, 'intellect.willpower') + HC.eff(npc, 'physiology.dexterity')) * 0.2 + HC.eff(npc, 'aptitudes.crafting') * 0.36 + 6 : -999,
      WRAITH_GRIEVANCE: ((npc && npc.daoDiscoveries && npc.daoDiscoveries['WRAITH_GRIEVANCE']) || (npc && npc.cult && npc.cult.path === 'WRAITH_GRIEVANCE')) ? (HC.eff(npc, 'affinities.SOUL_DIVINE') + HC.eff(npc, 'affinities.YIN_SHADOW') + HC.eff(npc, 'personality.empathy') + HC.eff(npc, 'intellect.intuition')) * 0.2 + HC.eff(npc, 'aptitudes.comprehension') * 0.36 + 6 : -999,
      DEATHLESS_CADAVER: ((npc && npc.daoDiscoveries && npc.daoDiscoveries['DEATHLESS_CADAVER']) || (npc && npc.cult && npc.cult.path === 'DEATHLESS_CADAVER')) ? (HC.eff(npc, 'affinities.BODY_REFINING') + HC.eff(npc, 'physiology.toughness') + HC.eff(npc, 'intellect.willpower') + HC.eff(npc, 'personality.ambition')) * 0.2 + HC.eff(npc, 'aptitudes.combat') * 0.36 + 6 : -999
    };
    const rootCount = (npc.h && npc.h.root && npc.h.root.rootCount) || 1;
    CULT.subList.forEach(({ path, sub }) => {
      const pref = SUBPREF[sub.id] || (JD.EXPANSION.subPreferences || {})[sub.id] || (JD.MARTIAL.subPreferences || {})[sub.id] || { aff: {}, p: {} };
      let s = base[path] || 0;
      Object.keys(pref.aff).forEach(k => {
        // Legacy content used weapon/astral labels that are not HC affinity keys.
        const affinity = ({ BOW: 'SWORD', STAFF: 'SPEAR', ASTRAL: 'SCRIPTURE', ROSARY: 'SOUL_DIVINE', CLAW: 'FIST_PALM', NEEDLE: 'MEDICINE', FAN: 'WIND', ASTROLABE: 'SCRIPTURE', ABACUS: 'SCRIPTURE', ZITHER: 'SOUL_DIVINE', FOCUS: 'SOUL_DIVINE', BRUSH: 'TALISMAN', WHIP: 'SPEAR', BLOOD_DEMON: 'YIN_SHADOW', POISON_CORROSION: 'POISON', HERB_LORE: 'MEDICINE', HERBALISM: 'MEDICINE', CRAFTING: 'FORGING', FISHING: 'MOVEMENT', COMMERCE: 'SCRIPTURE', COOKING: 'ALCHEMY', LEADERSHIP: 'SCRIPTURE' })[k] || k;
        s += (HC.eff(npc, 'affinities.' + affinity) - 30) * pref.aff[k] * 0.45;
      });
      Object.keys(pref.p).forEach(k => { const w = pref.p[k]; s += (w >= 0 ? pval(npc, k) - 50 : 50 - pval(npc, k)) * Math.abs(w) * 0.4; });
      const elemComp = ELEM.resolveCompatibility(npc, sub, 'SUBPATH_SELECT');
      let elemScore = elemComp.aiPreferenceScore * 0.28;
      if (sub.id === 'FIVE_ELEMENTS' && rootCount >= 3) elemScore += (rootCount - 2) * 5.5;
      else if (sub.id === 'YIN_YANG_HARMONY' && rootCount >= 2 && npc.h.root.elements.includes('LIGHT_YANG') && npc.h.root.elements.includes('YIN_SHADOW')) elemScore += 7.5;
      s += elemScore;
      if (HC.decisionBias) {
        const bodyBias = HC.decisionBias(npc, 'preferBodyPath');
        if (bodyBias && path === 'BODY') s += bodyBias * 0.25;
        const swordBias = HC.decisionBias(npc, 'studySword');
        if (swordBias && (sub.id === 'SWORD_IMMORTAL' || /SWORD/.test(sub.id))) s += swordBias * 0.15;
        const bodhiBias = HC.decisionBias(npc, 'forgiveAndMediate');
        if (bodhiBias && (path === 'KARMA_SAMSARA' || path === 'BUDDHA_DHARMA' || path === 'SAGE_SUPPORT')) s += bodhiBias * 0.12;
      }
      if (bias && bias[sub.id]) s += bias[sub.id];
      if (g.MARTIAL && g.MARTIAL.pathSkillAffinity) s += g.MARTIAL.pathSkillAffinity(npc, path, sub.id);
      out.push({ path, sub: sub.id, score: s, elemScore: +elemScore.toFixed(2), elemTier: elemComp.tier });
    });
    out.sort((a, b) => b.score - a.score);
    if (!bias) { _ec.pathScores = out; _ec.psVer = npc._ver; _ec.psSkillVer = npc._pathSkillVersion || 0; _ec.psPath = cPath; _ec.psSub = cSub; _ec.psSt = cSt; }
    return out;
  };
  // Every major path contributes one best-fit candidate; adding subpaths cannot
  // buy extra lottery tickets. Keep finite lower-ranked choices rather than a top-6 cutoff.
  CULT.majorPathScores = (npc, bias) => {
    const best = new Map();
    for (const x of CULT.pathScores(npc, bias)) {
      if (Number.isFinite(x.score) && (!best.has(x.path) || best.get(x.path).score < x.score)) best.set(x.path, x);
    }
    return Array.from(best.values()).sort((a, b) => b.score - a.score);
  };
  CULT.choosePath = (npc, rng, bias) => {
    const paths = CULT.majorPathScores(npc, bias);
    if (!paths.length) throw new Error('ไม่มีวิถีที่มีคะแนนถูกต้อง');
    const major = rng.weighted(paths, x => Math.exp(Math.max(-50, (x.score - paths[0].score) / 9)));
    const branches = CULT.pathScores(npc, bias).filter(x => x.path === major.path && Number.isFinite(x.score));
    return rng.weighted(branches, x => Math.exp(Math.max(-50, (x.score - major.score) / 7)));
  };
  CULT.BASE_SUB = Object.freeze({ id: 'NONE', nameTh: 'พื้นฐาน (ยังไม่เลือกสายย่อย)', combatBonus: 1, defenseBonus: 1, breakthroughMod: 1, cultivationBonus: 1 });
  CULT.SUB_ALIASES = Object.assign({
    CELESTIAL_PUPPET_MASTER: 'HEAVENLY_GOLEM', HEAVENLY_PUPPETEER: 'HEAVENLY_GOLEM',
    IRON_COLOSSUS: 'HEAVENLY_GOLEM', MECHANICAL_FORTRESS_MASTER: 'HEAVENLY_GOLEM', FORTRESS_BASTION_ARCHITECT: 'HEAVENLY_GOLEM',
    THOUSAND_PUPPET_LORD: 'THOUSAND_THREAD_ASSASSIN', THOUSAND_THREAD_PUPPETEER: 'THOUSAND_THREAD_ASSASSIN',
    SPIRIT_WEAPON_FORGER: 'FLYING_BLADE_ORBITER', CLOCKWORK_SWARM_WEAVER: 'FLYING_BLADE_ORBITER',
    SPIRIT_ARTILLERY_ENGINEER: 'CELESTIAL_BALLISTA',
    CELESTIAL_CLOCKWORK_ARCHITECT: 'ASTRAL_CLOCKWORK_PRIME',
    KARMIC_FLAME_ARHAT: 'REVERSED_RETRIBUTION', RED_LOTUS_KARMA_FLAME: 'REVERSED_RETRIBUTION', CAUSAL_JUSTICIAR: 'REVERSED_RETRIBUTION',
    SIX_REALMS_TRANSCENDENT: 'SIX_PATHS_WHEEL',
    RED_THREAD_ARBITER: 'FATE_SEVERING_THREAD', FATE_THREAD_WEAVER: 'FATE_SEVERING_THREAD',
    PAST_LIFE_CHRONICLER: 'PAST_LIFE_MIRROR',
    SAMSARA_NIRVANA_SHEPHERD: 'LOTUS_MERCY_PURIFIER',
    SAMSARA_BUDDHA_HEART: 'BODHI_VOW_GUARDIAN',
    MYRIAD_BEAST_EMPEROR: 'MYRIAD_BEAST_PACK', TEN_THOUSAND_BEAST_KING: 'MYRIAD_BEAST_PACK', PRIMORDIAL_MYRIAD_BEAST_EMPEROR: 'MYRIAD_BEAST_PACK',
    PRIMORDIAL_BLOOD_AWAKENER: 'PRIMORDIAL_BLOOD_MUTATOR', CHIMERA_BLOODLINE_FUSIONIST: 'PRIMORDIAL_BLOOD_MUTATOR',
    SYMBIOTIC_FANG_FUSION: 'SYMBIOTIC_BEAST_WARRIOR',
    SWARM_INSECT_EMPEROR: 'SWARM_GU_HIVE_MASTER',
    TOTEMIC_WAR_CHIEFTAIN: 'ABYSSAL_DRAGON_TOTEM',
    ANCIENT_SUN_GOD: 'SUN_BOW_DEITY', STAR_LORD_GOD: 'FATE_ORACLE', OCEAN_GOD: 'OCEAN_SOVEREIGN', THUNDER_LORD_GOD: 'WAR_DEITY',
    ACUPUNCTURE_SAINT: 'GOLDEN_NEEDLE_SAINT',
    SOUL_MUSICIAN: 'SEVEN_EMOTIONS_ZITHER',
    ILLUSION_MIND: 'DREAM_ILLUSION_WEAVER',
    CHANT_RESONANCE: 'CELESTIAL_ZITHER_ENVOY',
    GRAND_STRATEGIST: 'BATTLEFIELD_STRATEGIST',
    GRAND_FORMATION_ARCHITECT: 'EARTH_VEIN_WARDEN',
    UNDERWORLD_DECREE: 'SIX_PATHS_WHEEL',
    SPIRIT_THREAD_PUPPET: 'THOUSAND_THREAD_ASSASSIN',
    PACK_COMMAND_HUNT: 'MYRIAD_BEAST_PACK',
    REINCARNATION_WARDEN: 'SIX_PATHS_WHEEL',
    ASTRAL_LEVIATHAN_KRAKEN: 'ABYSSAL_DRAGON_TOTEM',
    BLOOD_FURNACE: 'DEVOURING_FIEND',
    BEAST_BLOOD_FUSION: 'SYMBIOTIC_BEAST_WARRIOR',
    TIDAL_WATER_MIRROR: 'FROST_MOON_IMMORTAL',
    LIGHTNING_TEMPERED_BODY: 'THUNDER_BODY',
    THUNDER_PUNISHMENT_ENVOY: 'STORM_THUNDER_EMPEROR',
    WIND_SHADOW_ROAMER: 'PHANTOM_SOUL',
    DIVINE_FORGE_FOUNDER: 'HEAVENLY_ANVIL_SMITH',
    BATTLE_ARRAY_TACTICIAN: 'BATTLEFIELD_STRATEGIST',
    BLOOD_SEA_FIEND: 'BLOOD_SPEAR_ASURA',
    PILL_FLAME_SOVEREIGN: 'PILL_FURNACE_IMMORTAL',
    IMPERIAL_PEACE_SOVEREIGN: 'SECT_STEWARD',
    ALCHEMIST_IMMORTAL: 'PILL_FURNACE_IMMORTAL',
    BLACKSMITH_SAINT: 'HEAVENLY_ANVIL_SMITH',
    SWORD_FORGER: 'SPIRIT_SWORD_ARTIFICER',
    MOUNT_CHARGER: 'CELESTIAL_ASTRAL_FAIRY_TAMER',
    ASTRAL_MOUNT: 'CELESTIAL_ASTRAL_FAIRY_TAMER',
    SIX_PATHS_REINCARNATION: 'SIX_PATHS_WHEEL',
    SIX_PATHS_REINCARCARNATION: 'SIX_PATHS_WHEEL',
    IRON_LEGION_MARSHAL: 'BATTLEFIELD_STRATEGIST',
    HEAVENLY_MANDATE_CHANCELLOR: 'IMPERIAL_SEAL_CHANCELLOR',
    DIPLOMATIC_HEGEMON: 'DIPLOMATIC_ENVOY',
    DIVINE_FORGE_ARTISAN: 'HEAVENLY_ANVIL_SMITH',
    IMPERIAL_DECREE_CALLIGRAPHER: 'IMPERIAL_EDICT_CALLIGRAPHER',
    GRAND_HISTORIAN_SCHOLAR: 'HISTORIANS_DESTINY_QUILL',
    TREASURY_SOVEREIGN: 'GOLDEN_ABACUS_ARBITER',
    BODHI_SALVATION_MONK: 'BODHI_VOW_GUARDIAN',
    SAMSARA_WHEEL_ARBITER: 'GOLDEN_WHEEL_ARBITER',
    BLOOD_MARROW_DEVOURER: 'BEAST_FLESH_CONSUMER',
    DIVINE_PHYSICIAN_HEALER: 'GOLDEN_NEEDLE_SAINT',
    MYRIAD_POISON_APOTHECARY: 'MYRIAD_VENOM_APOTHECARY',
    GALE_CLOUD_CONDUCTOR: 'TYPHOON_GALE_SOVEREIGN',
    THUNDER_MONSOON_SOVEREIGN: 'THUNDER_CLOUD_CALLER',
    STARLIGHT_ASTROLOGER: 'POLARIS_FATE_WEAVER',
    EPOCH_HOURGLASS_KEEPER: 'HOURGLASS_SAND_REAPER',
    SPIRIT_THREAD_PUPPETEER: 'PHANTOM_SILK_PUPPETEER',
    ELEMENTAL_GRIMOIRE_SAGE: 'SACRED_GOLEM_TAMER',
    STAR_CHART_ORACLE: 'STAR_CHART_PROPHET'
  }, (JD.MARTIAL && JD.MARTIAL.SUBPATH_ALIASES) || {});
  CULT.resolveSubId = sub => (sub && CULT.SUB_ALIASES && CULT.SUB_ALIASES[sub]) || (sub && JD.MARTIAL && JD.MARTIAL.SUBPATH_ALIASES && JD.MARTIAL.SUBPATH_ALIASES[sub]) || sub;
  const _SUB_INFO_MAP = Object.create(null);
  for (const _pk of Object.keys(CULT.PATHS)) {
    const _sps = CULT.PATHS[_pk].subPaths || [];
    for (let _i = 0; _i < _sps.length; _i++) {
      _SUB_INFO_MAP[_pk + ':' + _sps[_i].id] = _sps[_i];
    }
  }
  CULT.sub = npc => (npc && npc.cult && CULT.subInfo) ? CULT.subInfo(npc.cult.path, npc.cult.sub) : null;
  CULT.subInfo = (path, sub) => {
    if (!sub || sub === 'NONE') return CULT.BASE_SUB;
    const cSub = CULT.resolveSubId(sub);
    return _SUB_INFO_MAP[path + ':' + cSub] || (CULT.PATHS[path] && CULT.PATHS[path].subPaths.find(s => s.id === cSub)) || CULT.BASE_SUB;
  };
  CULT.stageInfo = (npc) => {
    const c = npc.cult; if (!c) return { nameTh: 'ปุถุชน (ยังไม่เปิดเส้นลมปราณ)', stage: 0, lifespanMax: 70, combatPower: 25, breakthroughBaseChance: 1 };
    const stArr = CULT.PATHS[c.path].stages;
    return stArr[Math.min(stArr.length - 1, Math.max(0, (c.stage || 1) - 1))];
  };
  CULT.stageName = npc => {
    if (!npc.cult) return 'ปุถุชน';
    const stArr = CULT.PATHS[npc.cult.path].stages;
    const stObj = stArr[Math.min(stArr.length - 1, Math.max(0, (npc.cult.stage || 1) - 1))];
    return CULT.PATHS[npc.cult.path].shortTh + ' · ' + stObj.nameTh.replace(/^ขั้นที่ \d+ • /, '') + ' (' + npc.cult.stage + ')';
  };
  CULT.maxStage = npc => npc.cult ? CULT.PATHS[npc.cult.path].maxStage : 0;
  // Track majorBandEquivalent values use the target path's native stage scale.
  // Interpolate fractional bands before comparing paths on the canonical 1..9 scale.
  CULT.majorStageEquivalent = (path, stage) => {
    const max = (CULT.PATHS[path] && CULT.PATHS[path].maxStage) || 9;
    const st = clamp(Number.isFinite(stage) ? stage : 1, 1, max);
    const map = path === 'BODY' ? [1, 2.5, 4.5, 6.8, 9] : path === 'GOD' ? [1, 3.2, 6.2, 9] : max === 8 ? [1, 2.1, 3.2, 4.4, 5.5, 6.7, 7.8, 9] : null;
    if (!map) return st;
    const index = Math.floor(st) - 1, frac = st - Math.floor(st);
    return map[index] + ((map[index + 1] || map[index]) - map[index]) * frac;
  };
  CULT.normalizedStage = npc => npc && npc.cult ? CULT.majorStageEquivalent(npc.cult.path, npc.cult.stage) : 0;
  CULT.trackEquivalentStage = (subPath, ordinal) => {
    const def = CULT.trackDef(subPath), r = def && def.realms && def.realms[ordinal - 1];
    if (!r || !Number.isFinite(r.majorBandEquivalent)) return clamp(ordinal || 1, 1, 9);
    return CULT.majorStageEquivalent(def.targetMajorPath || def.sourceMajorPath, r.majorBandEquivalent);
  };
  CULT.equivalentStage = entity => {
    if (!entity) return 0;
    const c = entity.cult || (entity.path && entity.stage ? entity : null);
    if (!c || !c.path) return 0;
    let ns = CULT.majorStageEquivalent(c.path, c.stage);
    if (c.track) ns = Math.max(ns, CULT.trackEquivalentStage(c.track.subPath, c.track.ordinal));
    return ns;
  };
  CULT.effectiveTechStage = npc => {
    if (!npc || !npc.cult) return 0;
    const c = npc.cult, st = Math.max(1, c.stage || 1);
    const trOrd = (c.track && c.track.ordinal) ? c.track.ordinal : 0;
    let mapped = st;
    if (c.path === "BODY") mapped = [1, 2, 4, 6, 7][Math.min(4, st - 1)] || st;
    else if (c.path === "GOD") mapped = [1, 3, 5, 7][Math.min(3, st - 1)] || st;
    else if ((CULT.PATHS[c.path] && CULT.PATHS[c.path].maxStage === 8)) mapped = [1, 2, 3, 4, 5, 6, 7, 7][Math.min(7, st - 1)] || st;
    return Math.max(st, mapped) + (trOrd >= mapped + 2 ? 1 : 0);
  };
  CULT.worldRankFromRaw = raw => {
    if (!Number.isFinite(raw) || raw <= 0) return 0;
    const floor = Math.floor(raw);
    const frac = raw - floor;
    const roundUp = (frac > 0.75) ? 1 : 0;
    return Math.max(1, Math.min(4, floor + roundUp));
  };
  CULT.worldRank = npc => {
    if (!npc || !npc.cult || !npc.cult.path || npc.cult.path === 'NONE') return 0;
    const pathDef = CULT.PATHS[npc.cult.path];
    if (!pathDef || !pathDef.stages || !pathDef.stages.length) return 0;
    const S = pathDef.stages.length;
    const s = Math.max(1, Math.min(S, Math.floor(npc.cult.stage || 1)));
    if (S <= 1) return 1;
    const num = (S - 1) + 3 * (s - 1);
    const den = S - 1;
    const quotient = Math.floor(num / den);
    const rem = num % den;
    const roundUp = (rem * 4 > den * 3) ? 1 : 0;
    return Math.max(1, Math.min(4, quotient + roundUp));
  };
  CULT.threshold = npc => { const c = npc.cult; if (!c) return 0; const t = (CULT.THRESH[c.path] || [])[c.stage - 1]; return t == null ? Infinity : t; };
  CULT.lifespan = npc => {
    const c = npc && npc.cult; if (!c) return Math.round(HC.mortalLifespan(npc));
    const _pDef = CULT.PATHS[c.path];
    const _pStages = (_pDef && Array.isArray(_pDef.stages)) ? _pDef.stages : [];
    const _sIdx = Math.max(0, Math.min(_pStages.length - 1, (c.stage || 1) - 1));
    let life = ((_pStages[_sIdx] && _pStages[_sIdx].lifespanMax) || Math.round(HC.mortalLifespan(npc))) + (c.lifeBonus || 0);
    if (c.track) {
      const trRealm = CULT.trackRealm(npc);
      if (trRealm && trRealm.lifespanMax > life) life = trRealm.lifespanMax + (c.lifeBonus || 0);
    }
    if (npc.mantraState && CULT.MANTRA_SYSTEM) {
      const mr = CULT.MANTRA_SYSTEM.resolveNpcMantra(null, npc);
      if (mr && mr.spec && Number.isFinite(mr.spec.lifeBonusMult)) {
        life = Math.round(life * mr.spec.lifeBonusMult);
      }
    }
    if (npc.ext) {
      if (Number.isFinite(npc.ext.burnedLifespanYears) && npc.ext.burnedLifespanYears > 0) {
        life = Math.max(18, life - Math.round(npc.ext.burnedLifespanYears));
      }
      if (Number.isFinite(npc.ext.elixirLifespanBonus) && npc.ext.elixirLifespanBonus > 0) {
        life += Math.round(npc.ext.elixirLifespanBonus);
      }
      const lg = npc.ext.longevity;
      if (lg) {
        if (lg.leylineAnchored && Number.isFinite(lg.leylineBonusYears)) life += Math.round(lg.leylineBonusYears);
        const _bondedPet = (CULT.LONGEVITY && CULT.LONGEVITY.getActiveBondedPet) ? CULT.LONGEVITY.getActiveBondedPet(npc, lg.beastPetId) : (npc.pet && !npc.pet.dead ? npc.pet : null);
        if (lg.beastSymbiosis && _bondedPet && Number.isFinite(lg.beastBonusYears)) life += Math.round(lg.beastBonusYears);
        if (Number.isFinite(lg.stasisDaysSaved) && lg.stasisDaysSaved > 0) life += Math.round((lg.stasisDaysSaved / 360) * 10) / 10;
      }
    }
    if (c.mantra && c.mantra.charCodeAt(0) === 84) {
      const mObj = TECH_BY_ID[c.mantra];
      if (mObj && mObj.mantraBonus && Number.isFinite(mObj.mantraBonus.lifespanBonusYears)) {
        life += Math.round(mObj.mantraBonus.lifespanBonusYears);
      }
    }
    return life;
  };
  CULT.lifeMax = CULT.lifespan;
  CULT.refreshLifespan = npc => { npc.lifespanMax = CULT.lifespan(npc); HC.touch(npc); };
  const _pd = (resourceModel, archetypeRole, stations, scaling, cult) => Object.freeze({
    resourceModel, archetypeRole, stations: Object.freeze(stations), scaling: Object.freeze(scaling), cult: Object.freeze(cult || {})
  });
  const _ST_MARTIAL = [{ kind: 'lift', bk: 'training_ground', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.44 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.35 }, { kind: 'anvil', bk: 'forge', mult: 1.30 }];
  const _ST_QI = [{ kind: 'meditate', bk: 'meditation_hall', mult: 1.55 }, { kind: 'relax', bk: 'spirit_pond', mult: 1.44 }, { kind: 'read', bk: 'scripture', mult: 1.36 }];
  const _ST_SCHOLAR = [{ kind: 'read', bk: 'scripture', mult: 1.54 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.46 }, { kind: 'relax', bk: 'spirit_pond', mult: 1.38 }];
  const _ST_DIVINE = [{ kind: 'worship', bk: 'shrine', mult: 1.52 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.45 }, { kind: 'relax', bk: 'spirit_pond', mult: 1.35 }];
  const _ST_OCCULT = [{ kind: 'explore', bk: 'ruin', mult: 1.52 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.46 }, { kind: 'array', bk: 'forge', mult: 1.40 }];
  const _ST_CRAFT_ALC = [{ kind: 'cauldron', bk: 'alchemy', mult: 1.54 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.42 }, { kind: 'relax', bk: 'spirit_pond', mult: 1.36 }];
  const _ST_ARRAY = [{ kind: 'array', bk: 'forge', mult: 1.54 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.48 }, { kind: 'read', bk: 'scripture', mult: 1.40 }];
  const _ST_TRADE = [{ kind: 'browse', bk: 'market', mult: 1.52 }, { kind: 'work', bk: 'main_hall', mult: 1.45 }, { kind: 'read', bk: 'scripture', mult: 1.38 }];

  CULT.PATH_DESCRIPTORS = Object.freeze({
    XIAN: _pd('QI_CORE', 'SWORD_CASTER', _ST_QI, { hpGrowthPerNormStage: 0, mantraPerTier: { p: { matk: 0.04, mdef: 0.02 }, f: {} }, combatOffenseBaseMult: 1.10, combatDefenseTakenMult: 0.92 }, { s1: 'SWORD', s2: 'MOVEMENT', mind: 'focus' }),
    BODY: _pd('BODY_STAMINA', 'JUGGERNAUT', _ST_MARTIAL, { hpGrowthPerNormStage: 0.09, mantraPerTier: { p: { def: 0.04, hp: 0.03, atk: 0.02 }, f: {} }, combatOffenseBaseMult: 1.12, combatDefenseTakenMult: 0.88 }, { s1: 'BODY_REFINING', s2: 'FIST_PALM', mind: 'willpower' }),
    GOD: _pd('FAITH_VOW', 'DIVINE_BASTION', _ST_DIVINE, { hpGrowthPerNormStage: 0.11, mantraPerTier: { p: { mdef: 0.04, hp: 0.03, matk: 0.03, def: 0.02 }, f: {} }, combatOffenseBaseMult: 1.10, combatDefenseTakenMult: 0.89 }, { s1: 'ritual', s2: 'SOUL_DIVINE', mind: 'willpower' }),
    DEMON: _pd('QI_CORE', 'BERSERKER', _ST_OCCULT, { hpGrowthPerNormStage: 0, mantraPerTier: { p: { atk: 0.03, matk: 0.03 }, f: { crit: 0.8 } }, combatOffenseBaseMult: 1.13, combatDefenseTakenMult: 0.93 }, { s1: 'BLADE', s2: 'SOUL_DIVINE', mind: 'willpower' }),
    HEART_SOUL: _pd('QI_CORE', 'PSIONIC_MYSTIC', _ST_QI, { hpGrowthPerNormStage: 0, mantraPerTier: { p: { matk: 0.04, mdef: 0.03 }, f: { cast: 1.2 } }, combatOffenseBaseMult: 1.11, combatDefenseTakenMult: 0.92 }, { s1: 'SOUL_DIVINE', s2: 'SCRIPTURE', mind: 'wisdom' }),
    MECH_PUPPET: _pd('MECH_CORE', 'CONSTRUCT_ENGINEER', [{ kind: 'anvil', bk: 'forge', mult: 1.54 }, { kind: 'array', bk: 'forge', mult: 1.48 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.40 }], { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { def: 0.035, atk: 0.025, matk: 0.025 }, f: {} }, combatOffenseBaseMult: 1.11, combatDefenseTakenMult: 0.90 }, { s1: 'FORGING', s2: 'ARRAY', mind: 'inventiveness' }),
    KARMA_SAMSARA: _pd('KARMA_CYCLE', 'KARMIC_SHIFT', _ST_QI, { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { mdef: 0.04, matk: 0.035, hp: 0.02 }, f: {} }, combatOffenseBaseMult: 1.10, combatDefenseTakenMult: 0.91 }, { s1: 'SOUL_DIVINE', s2: 'ritual', mind: 'wisdom' }),
    BEAST_SOVEREIGN: _pd('BEAST_BOND', 'BEAST_PACK', _ST_MARTIAL, { hpGrowthPerNormStage: 0.07, mantraPerTier: { p: { atk: 0.035, hp: 0.035 }, f: { move: 1.0 } }, combatOffenseBaseMult: 1.12, combatDefenseTakenMult: 0.90 }, { s1: 'BEAST_TAMING', s2: 'SPEAR', mind: 'willpower' }),
    SAGE_SUPPORT: _pd('QI_CORE', 'MEDIC_SUPPORT', _ST_QI, { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { mdef: 0.04, hp: 0.035 }, f: { cast: 1.2 } }, combatOffenseBaseMult: 1.09, combatDefenseTakenMult: 0.91 }, { s1: 'MEDICINE', s2: 'ALCHEMY', mind: 'comprehension' }),
    CRAFT_CREATION: _pd('QI_CORE', 'ARTISAN_HYBRID', [{ kind: 'cauldron', bk: 'alchemy', mult: 1.52 }, { kind: 'anvil', bk: 'forge', mult: 1.52 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.42 }], { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { atk: 0.03, matk: 0.035, def: 0.03, mdef: 0.03 }, f: {} }, combatOffenseBaseMult: 1.10, combatDefenseTakenMult: 0.90 }, { s1: 'ALCHEMY', s2: 'FORGING', mind: 'inventiveness' }),
    ARRAY_TALISMAN: _pd('QI_CORE', 'FORMATION_TACTICIAN', _ST_ARRAY, { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { matk: 0.04, mdef: 0.035 }, f: { cast: 1.2 } }, combatOffenseBaseMult: 1.09, combatDefenseTakenMult: 0.93, usesFormationMastery: true }, { s1: 'ARRAY', s2: 'TALISMAN', mind: 'planning' }),
    STRATEGY_GOVERNANCE: _pd('QI_CORE', 'FORMATION_TACTICIAN', [{ kind: 'work', bk: 'main_hall', mult: 1.54 }, { kind: 'read', bk: 'scripture', mult: 1.48 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.42 }], { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { atk: 0.03, matk: 0.03, def: 0.035, mdef: 0.035 }, f: {} }, combatOffenseBaseMult: 1.09, combatDefenseTakenMult: 0.93, usesFormationMastery: true }, { s1: 'administration', s2: 'SPEAR', mind: 'planning' }),
    ASTRO_DIVINATION: _pd('PATH_GAUGE', 'FORMATION_TACTICIAN', _ST_ARRAY, { hpGrowthPerNormStage: 0.03, mantraPerTier: { p: { matk: 0.04, mdef: 0.035 }, f: { cast: 1.2, crit: 0.5 } }, combatOffenseBaseMult: 1.09, combatDefenseTakenMult: 0.93, usesFormationMastery: true }, { s1: 'ARRAY', s2: 'SCRIPTURE', mind: 'intuition', gaugePerTick: 0.45 }),
    BUDDHA_DHARMA: _pd('PATH_GAUGE', 'DIVINE_BASTION', _ST_DIVINE, { hpGrowthPerNormStage: 0.07, mantraPerTier: { p: { mdef: 0.042, def: 0.035, hp: 0.03, matk: 0.02 }, f: {} }, combatOffenseBaseMult: 1.10, combatDefenseTakenMult: 0.90 }, { s1: 'BODY_REFINING', s2: 'SOUL_DIVINE', mind: 'willpower', gaugePerTick: 0.45 }),
    VOID_SPACE: _pd('PATH_GAUGE', 'ASSASSIN_VANGUARD', _ST_OCCULT, { hpGrowthPerNormStage: 0.03, mantraPerTier: { p: { matk: 0.04, mdef: 0.025 }, f: { cast: 1.1, move: 0.8 } }, combatOffenseBaseMult: 1.11, combatDefenseTakenMult: 0.92 }, { s1: 'MOVEMENT', s2: 'ARRAY', mind: 'spatial', gaugePerTick: 0.45 }),
    SONIC_HARMONY: _pd('PATH_GAUGE', 'MEDIC_SUPPORT', [{ kind: 'relax', bk: 'spirit_pond', mult: 1.54 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.48 }, { kind: 'read', bk: 'scripture', mult: 1.40 }], { hpGrowthPerNormStage: 0.04, mantraPerTier: { p: { matk: 0.036, mdef: 0.034 }, f: { cast: 1.3 } }, combatOffenseBaseMult: 1.10, combatDefenseTakenMult: 0.92 }, { s1: 'arts', s2: 'SOUL_DIVINE', mind: 'focus', gaugePerTick: 0.45 }),
    VENOM_GU: _pd('PATH_GAUGE', 'PACT_WARLOCK', _ST_CRAFT_ALC, { hpGrowthPerNormStage: 0.04, mantraPerTier: { p: { matk: 0.038, mdef: 0.028, def: 0.02 }, f: { cast: 0.9 } }, combatOffenseBaseMult: 1.11, combatDefenseTakenMult: 0.92 }, { s1: 'POISON', s2: 'ALCHEMY', mind: 'perceptiveness', gaugePerTick: 0.45 }),
    PRIMORDIAL_SHIFTER: _pd('PATH_GAUGE', 'JUGGERNAUT', _ST_MARTIAL, { hpGrowthPerNormStage: 0.07, mantraPerTier: { p: { atk: 0.036, def: 0.036, hp: 0.03 }, f: { move: 0.8 } }, combatOffenseBaseMult: 1.11, combatDefenseTakenMult: 0.90 }, { s1: 'BODY_REFINING', s2: 'FIST_PALM', mind: 'willpower', gaugePerTick: 0.50 }),
    CELESTIAL_WEATHER: _pd('PATH_GAUGE', 'PSIONIC_MYSTIC', [{ kind: 'relax', bk: 'spirit_pond', mult: 1.54 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.48 }, { kind: 'worship', bk: 'shrine', mult: 1.42 }], { hpGrowthPerNormStage: 0.04, mantraPerTier: { p: { matk: 0.04, mdef: 0.032, hp: 0.015 }, f: { cast: 1.0 } }, combatOffenseBaseMult: 1.10, combatDefenseTakenMult: 0.92 }, { s1: 'SOUL_DIVINE', s2: 'ARRAY', mind: 'intuition', gaugePerTick: 0.45 }),
    WANDERING_DAO: _pd('PATH_GAUGE', 'GATHERER_SCHOLAR', [{ kind: 'relax', bk: 'spirit_pond', mult: 1.52 }, { kind: 'dummy', bk: 'training_ground', mult: 1.46 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.44 }], { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { atk: 0.03, mdef: 0.03, def: 0.025 }, f: { move: 1.4, cast: 0.8 } }, combatOffenseBaseMult: 1.10, combatDefenseTakenMult: 0.91 }, { s1: 'MOVEMENT', s2: 'survival', mind: 'perceptiveness', gaugePerTick: 0.50 }),
    MERCANTILE_DAO: _pd('PATH_GAUGE', 'GATHERER_SCHOLAR', _ST_TRADE, { hpGrowthPerNormStage: 0.04, mantraPerTier: { p: { atk: 0.028, matk: 0.032, def: 0.03, mdef: 0.032 }, f: {} }, combatOffenseBaseMult: 1.09, combatDefenseTakenMult: 0.93, usesFormationMastery: true }, { s1: 'trading', s2: 'administration', mind: 'judgement', gaugePerTick: 0.45 }),
    DRAGON_VEIN_GEOMANCY: _pd('PATH_GAUGE', 'FORMATION_TACTICIAN', _ST_ARRAY, { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { def: 0.036, mdef: 0.036, matk: 0.03, hp: 0.02 }, f: {} }, combatOffenseBaseMult: 1.09, combatDefenseTakenMult: 0.92, usesFormationMastery: true }, { s1: 'ARRAY', s2: 'construction', mind: 'spatial', gaugePerTick: 0.45 }),
    GRAVITY_DAO: _pd('PATH_GAUGE', 'JUGGERNAUT', _ST_MARTIAL, { hpGrowthPerNormStage: 0.07, mantraPerTier: { p: { atk: 0.035, def: 0.04, hp: 0.03, mdef: 0.025 }, f: {} }, combatOffenseBaseMult: 1.11, combatDefenseTakenMult: 0.90 }, { s1: 'FIST_PALM', s2: 'BODY_REFINING', mind: 'willpower', gaugePerTick: 0.45 }),
    CHRONO_EPOCH: _pd('PATH_GAUGE', 'PSIONIC_MYSTIC', _ST_QI, { hpGrowthPerNormStage: 0.03, mantraPerTier: { p: { matk: 0.04, mdef: 0.032 }, f: { cast: 1.4, move: 0.6 } }, combatOffenseBaseMult: 1.10, combatDefenseTakenMult: 0.92 }, { s1: 'SOUL_DIVINE', s2: 'SCRIPTURE', mind: 'planning', gaugePerTick: 0.45 }),
    INK_LITERATI: _pd('PATH_GAUGE', 'GATHERER_SCHOLAR', _ST_SCHOLAR, { hpGrowthPerNormStage: 0.03, mantraPerTier: { p: { matk: 0.04, mdef: 0.034 }, f: { cast: 1.2 } }, combatOffenseBaseMult: 1.10, combatDefenseTakenMult: 0.92 }, { s1: 'SCRIPTURE', s2: 'arts', mind: 'comprehension', gaugePerTick: 0.45 }),
    SOUL_PUPPETRY: _pd('PATH_GAUGE', 'CONSTRUCT_ENGINEER', _ST_OCCULT, { hpGrowthPerNormStage: 0.04, mantraPerTier: { p: { matk: 0.036, mdef: 0.034, def: 0.024 }, f: { cast: 0.8 } }, combatOffenseBaseMult: 1.11, combatDefenseTakenMult: 0.91 }, { s1: 'SOUL_DIVINE', s2: 'TALISMAN', mind: 'focus', gaugePerTick: 0.45 }),
    PRIMORDIAL_CHAOS: _pd('PATH_GAUGE', 'PSIONIC_MYSTIC', _ST_OCCULT, { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { atk: 0.03, matk: 0.038, def: 0.026, mdef: 0.03 }, f: {} }, combatOffenseBaseMult: 1.12, combatDefenseTakenMult: 0.91 }, { s1: 'SOUL_DIVINE', s2: 'SWORD', mind: 'intuition', gaugePerTick: 0.50 }),
    SHADOW_SAMURAI: _pd('ZERO_QI_IAI', 'ASSASSIN_VANGUARD', [{ kind: 'dummy', bk: 'training_ground', mult: 1.56 }, { kind: 'lift', bk: 'training_ground', mult: 1.48 }, { kind: 'anvil', bk: 'forge', mult: 1.38 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.34 }], { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { atk: 0.044, def: 0.028, hp: 0.02 }, f: { crit: 1.1, pen: 1.4 } }, combatOffenseBaseMult: 1.14, combatDefenseTakenMult: 0.92 }, { s1: 'BLADE', s2: 'SWORD', mind: 'explosiveness', gaugePerTick: 0.90 }),
    NINPO_SHADOW: _pd('PATH_GAUGE', 'ASSASSIN_VANGUARD', [{ kind: 'dummy', bk: 'training_ground', mult: 1.52 }, { kind: 'explore', bk: 'ruin', mult: 1.48 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.40 }], { hpGrowthPerNormStage: 0.04, mantraPerTier: { p: { atk: 0.038, mdef: 0.024 }, f: { eva: 1.2, move: 1.2, crit: 0.8 } }, combatOffenseBaseMult: 1.12, combatDefenseTakenMult: 0.92 }, { s1: 'stealth', s2: 'MOVEMENT', mind: 'reflex', gaugePerTick: 0.55 }),
    NINPO_ELEMENTAL: _pd('PATH_GAUGE', 'ASSASSIN_VANGUARD', [{ kind: 'array', bk: 'forge', mult: 1.52 }, { kind: 'dummy', bk: 'training_ground', mult: 1.48 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.42 }], { hpGrowthPerNormStage: 0.04, mantraPerTier: { p: { matk: 0.036, atk: 0.026, mdef: 0.028 }, f: { cast: 1.1 } }, combatOffenseBaseMult: 1.12, combatDefenseTakenMult: 0.92 }, { s1: 'TALISMAN', s2: 'MOVEMENT', mind: 'focus', gaugePerTick: 0.50 }),
    DIVINE_SUMMONER: _pd('FAITH_VOW', 'SUMMONER_ORACLE', _ST_DIVINE, { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { matk: 0.038, mdef: 0.036, hp: 0.02 }, f: { cast: 1.0 } }, combatOffenseBaseMult: 1.12, combatDefenseTakenMult: 0.91 }, { s1: 'ritual', s2: 'SOUL_DIVINE', mind: 'focus', gaugePerTick: 0.50 }),
    DIVINE_POSSESSION: _pd('FAITH_VOW', 'DIVINE_BASTION', _ST_DIVINE, { hpGrowthPerNormStage: 0.07, mantraPerTier: { p: { atk: 0.036, def: 0.036, hp: 0.03, mdef: 0.026 }, f: {} }, combatOffenseBaseMult: 1.12, combatDefenseTakenMult: 0.90 }, { s1: 'ritual', s2: 'SPEAR', mind: 'willpower', gaugePerTick: 0.50 }),
    DIVINE_CHANNELER: _pd('FAITH_VOW', 'SUMMONER_ORACLE', _ST_DIVINE, { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { matk: 0.04, mdef: 0.036, def: 0.02 }, f: { cast: 1.0 } }, combatOffenseBaseMult: 1.12, combatDefenseTakenMult: 0.91 }, { s1: 'ritual', s2: 'SCRIPTURE', mind: 'wisdom', gaugePerTick: 0.50 }),
    VOID_HERETIC_PACT: _pd('PATH_GAUGE', 'PACT_WARLOCK', _ST_OCCULT, { hpGrowthPerNormStage: 0.04, mantraPerTier: { p: { matk: 0.042, atk: 0.026, mdef: 0.026 }, f: { crit: 0.8 } }, combatOffenseBaseMult: 1.12, combatDefenseTakenMult: 0.92 }, { s1: 'SOUL_DIVINE', s2: 'ritual', mind: 'willpower', gaugePerTick: 0.50 }),
    OCCULT_MAGE: _pd('PATH_GAUGE', 'PACT_WARLOCK', _ST_OCCULT, { hpGrowthPerNormStage: 0.04, mantraPerTier: { p: { matk: 0.042, mdef: 0.036, def: 0.02 }, f: { cast: 1.1 } }, combatOffenseBaseMult: 1.12, combatDefenseTakenMult: 0.91 }, { s1: 'TALISMAN', s2: 'ritual', mind: 'focus', gaugePerTick: 0.50 }),
    DEVOURING_FLESH: _pd('PATH_GAUGE', 'JUGGERNAUT', [{ kind: 'lift', bk: 'training_ground', mult: 1.52 }, { kind: 'explore', bk: 'ruin', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.44 }], { hpGrowthPerNormStage: 0.08, mantraPerTier: { p: { atk: 0.038, hp: 0.042, def: 0.032 }, f: {} }, combatOffenseBaseMult: 1.12, combatDefenseTakenMult: 0.90 }, { s1: 'BODY_REFINING', s2: 'FIST_PALM', mind: 'willpower', gaugePerTick: 0.50 }),
    NETHER_GRAVE: _pd('PATH_GAUGE', 'PACT_WARLOCK', _ST_OCCULT, { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { matk: 0.038, mdef: 0.034, hp: 0.024 }, f: { cast: 0.9 } }, combatOffenseBaseMult: 1.12, combatDefenseTakenMult: 0.91 }, { s1: 'SOUL_DIVINE', s2: 'POISON', mind: 'willpower', gaugePerTick: 0.50 }),
    ANCESTRAL_RITUAL: _pd('PATH_GAUGE', 'DIVINE_BASTION', _ST_DIVINE, { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { def: 0.036, mdef: 0.036, hp: 0.03, atk: 0.024 }, f: {} }, combatOffenseBaseMult: 1.10, combatDefenseTakenMult: 0.90, usesFormationMastery: true }, { s1: 'ritual', s2: 'BODY_REFINING', mind: 'willpower', gaugePerTick: 0.50 }),
    TIDE_VOYAGER: _pd('PATH_GAUGE', 'PSIONIC_MYSTIC', [{ kind: 'relax', bk: 'spirit_pond', mult: 1.55 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.46 }, { kind: 'dummy', bk: 'training_ground', mult: 1.40 }], { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { matk: 0.038, mdef: 0.034, hp: 0.02 }, f: { move: 0.9, cast: 0.9 } }, combatOffenseBaseMult: 1.11, combatDefenseTakenMult: 0.91 }, { s1: 'MOVEMENT', s2: 'SWORD', mind: 'focus', gaugePerTick: 0.50 }),
    LORE_ARCHIVIST: _pd('PATH_GAUGE', 'GATHERER_SCHOLAR', _ST_SCHOLAR, { hpGrowthPerNormStage: 0.03, mantraPerTier: { p: { matk: 0.038, mdef: 0.036, def: 0.02 }, f: { cast: 1.1 } }, combatOffenseBaseMult: 1.09, combatDefenseTakenMult: 0.93, usesFormationMastery: true }, { s1: 'SCRIPTURE', s2: 'ARRAY', mind: 'comprehension', gaugePerTick: 0.50 }),
    FORTUNE_GAMBLER: _pd('PATH_GAUGE', 'ASSASSIN_VANGUARD', _ST_TRADE, { hpGrowthPerNormStage: 0.04, mantraPerTier: { p: { atk: 0.032, matk: 0.032, eva: 0 }, f: { crit: 1.3, eva: 0.8 } }, combatOffenseBaseMult: 1.11, combatDefenseTakenMult: 0.92 }, { s1: 'trading', s2: 'MOVEMENT', mind: 'intuition', gaugePerTick: 0.50 }),
    SPIRIT_HUSBANDRY: _pd('PATH_GAUGE', 'MEDIC_SUPPORT', _ST_CRAFT_ALC, { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { mdef: 0.038, hp: 0.034, matk: 0.028 }, f: {} }, combatOffenseBaseMult: 1.10, combatDefenseTakenMult: 0.91 }, { s1: 'herbalism', s2: 'BEAST_TAMING', mind: 'wisdom', gaugePerTick: 0.50 }),
    ARENA_GLORY: _pd('PATH_GAUGE', 'JUGGERNAUT', [{ kind: 'dummy', bk: 'training_ground', mult: 1.56 }, { kind: 'lift', bk: 'training_ground', mult: 1.50 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.36 }], { hpGrowthPerNormStage: 0.07, mantraPerTier: { p: { atk: 0.04, def: 0.034, hp: 0.03 }, f: { crit: 0.8 } }, combatOffenseBaseMult: 1.13, combatDefenseTakenMult: 0.90 }, { s1: 'SPEAR', s2: 'FIST_PALM', mind: 'courage', gaugePerTick: 0.55 }),
    LEG_READ_FORM_BLADE: _pd('PATH_GAUGE', 'BLADE_DUELIST', [{ kind: 'meditate', bk: 'meditation_hall', mult: 1.56 }, { kind: 'read', bk: 'scripture', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.42 }], { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { atk: 0.038, matk: 0.038, def: 0.032, mdef: 0.032 }, f: { crit: 0.9 } }, combatOffenseBaseMult: 1.14, combatDefenseTakenMult: 0.9 }, { s1: 'SWORD', s2: 'MOVEMENT', mind: 'focus', gaugePerTick: 0.55 }),
    LEG_TRIAGE_MERIDIAN: _pd('PATH_GAUGE', 'FIELD_SUPPORT', [{ kind: 'meditate', bk: 'meditation_hall', mult: 1.56 }, { kind: 'read', bk: 'scripture', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.42 }], { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { atk: 0.038, matk: 0.038, def: 0.032, mdef: 0.032 }, f: { crit: 0.9 } }, combatOffenseBaseMult: 1.14, combatDefenseTakenMult: 0.9 }, { s1: 'MEDICINE', s2: 'ALCHEMY', mind: 'focus', gaugePerTick: 0.55 }),
    LEG_STORM_CALLER_TEMPEST: _pd('PATH_GAUGE', 'WEATHER_CASTER', [{ kind: 'meditate', bk: 'meditation_hall', mult: 1.56 }, { kind: 'read', bk: 'scripture', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.42 }], { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { atk: 0.038, matk: 0.038, def: 0.032, mdef: 0.032 }, f: { crit: 0.9 } }, combatOffenseBaseMult: 1.14, combatDefenseTakenMult: 0.9 }, { s1: 'FAN', s2: 'ARRAY', mind: 'focus', gaugePerTick: 0.55 }),
    LEG_JADE_CARAVAN_VOYAGER: _pd('PATH_GAUGE', 'LOGISTICS_VANGUARD', [{ kind: 'meditate', bk: 'meditation_hall', mult: 1.56 }, { kind: 'read', bk: 'scripture', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.42 }], { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { atk: 0.038, matk: 0.038, def: 0.032, mdef: 0.032 }, f: { crit: 0.9 } }, combatOffenseBaseMult: 1.14, combatDefenseTakenMult: 0.9 }, { s1: 'BLADE', s2: 'BODY_REFINING', mind: 'focus', gaugePerTick: 0.55 }),
    LEG_OATH_JUDGE_WARDEN: _pd('PATH_GAUGE', 'ARBITER_PALADIN', [{ kind: 'meditate', bk: 'meditation_hall', mult: 1.56 }, { kind: 'read', bk: 'scripture', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.42 }], { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { atk: 0.038, matk: 0.038, def: 0.032, mdef: 0.032 }, f: { crit: 0.9 } }, combatOffenseBaseMult: 1.14, combatDefenseTakenMult: 0.9 }, { s1: 'SCRIPTURE', s2: 'SWORD', mind: 'focus', gaugePerTick: 0.55 }),
    LEG_ASHEN_KILN_ALCHEMY: _pd('PATH_GAUGE', 'SALVAGE_WARDEN', [{ kind: 'meditate', bk: 'meditation_hall', mult: 1.56 }, { kind: 'read', bk: 'scripture', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.42 }], { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { atk: 0.038, matk: 0.038, def: 0.032, mdef: 0.032 }, f: { crit: 0.9 } }, combatOffenseBaseMult: 1.14, combatDefenseTakenMult: 0.9 }, { s1: 'ALCHEMY', s2: 'MEDICINE', mind: 'focus', gaugePerTick: 0.55 }),
    TRANS_CONSTELLATION_RELAY: _pd('PATH_GAUGE', 'RELAY_SUPPORT', [{ kind: 'meditate', bk: 'meditation_hall', mult: 1.56 }, { kind: 'read', bk: 'scripture', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.42 }], { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { atk: 0.038, matk: 0.038, def: 0.032, mdef: 0.032 }, f: { crit: 0.9 } }, combatOffenseBaseMult: 1.16, combatDefenseTakenMult: 0.88 }, { s1: 'ARRAY', s2: 'MEDICINE', mind: 'focus', gaugePerTick: 0.55 }),
    TRANS_FIELD_CLAUSE_SOVEREIGN: _pd('PATH_GAUGE', 'FIELD_LAWGIVER', [{ kind: 'meditate', bk: 'meditation_hall', mult: 1.56 }, { kind: 'read', bk: 'scripture', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.42 }], { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { atk: 0.038, matk: 0.038, def: 0.032, mdef: 0.032 }, f: { crit: 0.9 } }, combatOffenseBaseMult: 1.16, combatDefenseTakenMult: 0.88 }, { s1: 'SPEAR', s2: 'administration', mind: 'focus', gaugePerTick: 0.55 }),
    TRANS_TEMPO_SOVEREIGN: _pd('PATH_GAUGE', 'TEMPO_CONTROLLER', [{ kind: 'meditate', bk: 'meditation_hall', mult: 1.56 }, { kind: 'read', bk: 'scripture', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.42 }], { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { atk: 0.038, matk: 0.038, def: 0.032, mdef: 0.032 }, f: { crit: 0.9 } }, combatOffenseBaseMult: 1.16, combatDefenseTakenMult: 0.88 }, { s1: 'ARRAY', s2: 'MOVEMENT', mind: 'focus', gaugePerTick: 0.55 }),
    TRANS_SEALKEEPER_FORBIDDEN_KEY: _pd('PATH_GAUGE', 'SEAL_WARDEN', [{ kind: 'meditate', bk: 'meditation_hall', mult: 1.56 }, { kind: 'read', bk: 'scripture', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.42 }], { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { atk: 0.038, matk: 0.038, def: 0.032, mdef: 0.032 }, f: { crit: 0.9 } }, combatOffenseBaseMult: 1.16, combatDefenseTakenMult: 0.88 }, { s1: 'TALISMAN', s2: 'ARRAY', mind: 'focus', gaugePerTick: 0.55 }),
    TRANS_PRIMAL_VORTEX_MIRROR: _pd('PATH_GAUGE', 'ADAPTIVE_MIRROR', [{ kind: 'meditate', bk: 'meditation_hall', mult: 1.56 }, { kind: 'read', bk: 'scripture', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.42 }], { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { atk: 0.038, matk: 0.038, def: 0.032, mdef: 0.032 }, f: { crit: 0.9 } }, combatOffenseBaseMult: 1.16, combatDefenseTakenMult: 0.88 }, { s1: 'SCRIPTURE', s2: 'ARRAY', mind: 'focus', gaugePerTick: 0.55 }),
    TRANS_DYNASTIC_MANDATE_WEAVER: _pd('PATH_GAUGE', 'MANDATE_STRATEGIST', [{ kind: 'meditate', bk: 'meditation_hall', mult: 1.56 }, { kind: 'read', bk: 'scripture', mult: 1.48 }, { kind: 'dummy', bk: 'training_ground', mult: 1.42 }], { hpGrowthPerNormStage: 0.06, mantraPerTier: { p: { atk: 0.038, matk: 0.038, def: 0.032, mdef: 0.032 }, f: { crit: 0.9 } }, combatOffenseBaseMult: 1.16, combatDefenseTakenMult: 0.88 }, { s1: 'SCRIPTURE', s2: 'administration', mind: 'focus', gaugePerTick: 0.55 }),
    CORPSE_SOVEREIGN: _pd('PATH_GAUGE', 'CONSTRUCT_ENGINEER', _ST_OCCULT, { hpGrowthPerNormStage: 0.05, mantraPerTier: { p: { matk: 0.036, def: 0.03, mdef: 0.03 }, f: {} }, combatOffenseBaseMult: 1.10, combatDefenseTakenMult: 0.91 }, { s1: 'SOUL_DIVINE', s2: 'POISON', mind: 'willpower', gaugePerTick: 0.50 }),
    WRAITH_GRIEVANCE: _pd('PATH_GAUGE', 'PSIONIC_MYSTIC', _ST_OCCULT, { hpGrowthPerNormStage: 0.03, mantraPerTier: { p: { matk: 0.042, mdef: 0.035 }, f: { cast: 1.0 } }, combatOffenseBaseMult: 1.11, combatDefenseTakenMult: 0.92 }, { s1: 'SOUL_DIVINE', s2: 'POISON', mind: 'willpower', gaugePerTick: 0.50 }),
    DEATHLESS_CADAVER: _pd('PATH_GAUGE', 'JUGGERNAUT', _ST_MARTIAL, { hpGrowthPerNormStage: 0.08, mantraPerTier: { p: { atk: 0.04, def: 0.035, hp: 0.03 }, f: {} }, combatOffenseBaseMult: 1.12, combatDefenseTakenMult: 0.89 }, { s1: 'BODY_REFINING', s2: 'FIST_PALM', mind: 'willpower', gaugePerTick: 0.50 })
  });

  CULT.getPathDescriptor = pathId => CULT.PATH_DESCRIPTORS[pathId] || null;

  CULT.resolvePathStations = (W, n, purpose) => {
    if (!W || !n || !n.cult || !g.AI || !g.AI.freeStation) return null;
    const p = n.cult.path;
    const desc = CULT.getPathDescriptor(p) || CULT.PATH_DESCRIPTORS.XIAN;
    const AI = g.AI, MAP = g.MAP;
    // 1. Awakened Peak Sanctuary priority when disc belongs cleanly to a founded peak (excluding specialist cauldron/anvil artisan primary choices unless crafting unavailable)
    if (n.peakId && !n.isIndependentFromPeak && MAP && MAP.getPeakBuilding && MAP.isPeakBuildingActive) {
      const pb = MAP.getPeakBuilding(W.map, n.peakId);
      if (pb && MAP.isPeakBuildingActive(W, pb) && p !== 'CRAFT_CREATION' && p !== 'MECH_PUPPET') {
        const isPhysical = ['BODY', 'BEAST_SOVEREIGN', 'SHADOW_SAMURAI', 'NINPO_SHADOW', 'NINPO_ELEMENTAL', 'ARENA_GLORY', 'DEVOURING_FLESH', 'PRIMORDIAL_SHIFTER', 'GRAVITY_DAO'].includes(p);
        const peakKind = isPhysical ? 'practice' : 'meditate';
        const peakSt = AI.freeStation(W, n, peakKind, pb.id) || AI.freeStation(W, n, isPhysical ? 'meditate' : 'practice', pb.id);
        if (peakSt) {
          return { st: peakSt, mult: +(1.58 + 0.16 * Math.max(0, (pb.level || 1) - 1)).toFixed(2), fromPeak: pb.id };
        }
      }
    }
    // 2. Path Descriptor stations
    let stList = desc.stations || _ST_QI;
    if (p === 'CRAFT_CREATION') {
      const sk = (n.h && n.h.skills) || {};
      const preferAlc = (sk.ALCHEMY || 0) >= (sk.FORGING || 0) || n.cult.sub === 'PILL_FURNACE_IMMORTAL' || n.cult.sub === 'POISON_VENOM_CAULDRON';
      stList = preferAlc
        ? [{ kind: 'cauldron', bk: 'alchemy', mult: 1.54 }, { kind: 'anvil', bk: 'forge', mult: 1.48 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.40 }]
        : [{ kind: 'anvil', bk: 'forge', mult: 1.54 }, { kind: 'cauldron', bk: 'alchemy', mult: 1.48 }, { kind: 'meditate', bk: 'meditation_hall', mult: 1.40 }];
    }
    for (let i = 0; i < stList.length; i++) {
      const e = stList[i];
      const s = AI.freeStation(W, n, e.kind, e.bk);
      if (s) {
        const b = W.map && W.map.byId && W.map.byId[e.bk];
        const lvBoost = (b && b.level > 1 && i === 0) ? 0.14 * (b.level - 1) : 0;
        return { st: s, mult: +(e.mult + lvBoost).toFixed(2) };
      }
    }
    // 3. Universal sect fallback + bed
    const fall = AI.freeStation(W, n, 'meditate', 'meditation_hall') || AI.freeStation(W, n, 'relax', 'spirit_pond') || AI.freeStation(W, n, 'dummy', 'training_ground');
    if (fall) return { st: fall, mult: purpose === 'cultivate' ? 1.35 : 1.25 };
    if (n.bed != null && W.map && W.map.stations && W.map.stations[n.bed]) return { st: W.map.stations[n.bed], mult: 0.72, room: true };
    return null;
  };

  CULT.hpMult = npc => {
    if (!npc || !npc.cult) return 1;
    const ns = CULT.normalizedStage(npc);
    const desc = CULT.getPathDescriptor(npc.cult.path);
    const perStage = (desc && desc.scaling && Number.isFinite(desc.scaling.hpGrowthPerNormStage)) ? desc.scaling.hpGrowthPerNormStage : 0;
    const pathAdd = perStage * (ns - 1);
    return 1 + 0.42 * (ns - 1) + 0.25 + pathAdd;
  };
  CULT.hpMax = npc => {
    const c = npc.cult, cPath = c ? c.path : '', cSub = c ? c.sub : '', cSt = c ? c.stage : 0, cTr = c && c.track ? c.track.ordinal : 0, hc = npc._hpMaxCache;
    if (hc && hc.day === HC.nowDay && hc.ver === npc._ver && hc.pver === (npc._passVer || 0) && hc.path === cPath && hc.sub === cSub && hc.st === cSt && hc.tr === cTr) return hc.val;
    const val = Math.round((g.MARTIAL ? g.MARTIAL.derived(npc) : HC.derived(npc)).hpMax * CULT.hpMult(npc));
    npc._hpMaxCache = { day: HC.nowDay, ver: npc._ver, pver: npc._passVer || 0, path: cPath, sub: cSub, st: cSt, tr: cTr, val };
    return val;
  };

  const TECH_BY_ID = {}, MOVE_PARENT_BY_ID = {}, MANTRA_BY_ID = {};
  JD.TECH.techniques.forEach(t => { TECH_BY_ID[t.id] = t; if (Array.isArray(t.moveDefs)) t.moveDefs.forEach(m => { MOVE_PARENT_BY_ID[m.id] = t; }); });
  JD.TECH.mantras.forEach(t => { TECH_BY_ID[t.id] = t; MANTRA_BY_ID[t.id] = t; if (Array.isArray(t.moveDefs)) t.moveDefs.forEach(m => { MOVE_PARENT_BY_ID[m.id] = t; }); });
  (JD.TECH.extraMantras || []).forEach(t => {
    if (!t || !t.id) return;
    TECH_BY_ID[t.id] = t;
    MANTRA_BY_ID[t.id] = t;
    if (t.shortId) { TECH_BY_ID[t.shortId] = t; MANTRA_BY_ID[t.shortId] = t; }
  });
  (JD.TECH.expansionNonCombatArts || []).forEach(t => {
    if (!t || !t.id) return;
    TECH_BY_ID[t.id] = t;
    if (t.shortId) TECH_BY_ID[t.shortId] = t;
    if (Array.isArray(t.moveDefs)) t.moveDefs.forEach(m => { if (m && m.id) MOVE_PARENT_BY_ID[m.id] = t; });
  });
  CULT.techById = TECH_BY_ID;
  CULT.mantraById = MANTRA_BY_ID;
  CULT.tech = id => TECH_BY_ID[id] || MOVE_PARENT_BY_ID[id];
  CULT.registerDynamicTech = t => {
    if (!t || !t.id) return null;
    TECH_BY_ID[t.id] = t;
    if (Array.isArray(t.moveDefs)) {
      t.moveDefs.forEach(m => { if (m && m.id) MOVE_PARENT_BY_ID[m.id] = t; });
    }
    if (JD.TECH && Array.isArray(JD.TECH.techniques) && !JD.TECH.techniques.some(x => x.id === t.id)) {
      JD.TECH.techniques.push(t);
    }
    if (JD.MARTIAL && Array.isArray(JD.MARTIAL.techniques) && !JD.MARTIAL.techniques.some(x => x.id === t.id)) {
      JD.MARTIAL.techniques.push(t);
    }
    return t;
  };

  CULT.qiMax = npc => {
    if (!npc || !npc.cult) return 0;
    const c = npc.cult;
    if (c.path === 'SHADOW_SAMURAI') {
      if (npc.h && npc.h.state && npc.h.state.qi !== 0) npc.h.state.qi = 0;
      return 0;
    }
    const qc = npc._qiMaxCache;
    if (qc && qc.cult === c && qc.path === c.path && qc.sub === c.sub && qc.st === c.stage && qc.mantra === c.mantra && qc.ver === npc._ver && qc.pver === (npc._passVer || 0)) return qc.val;
    const ns = CULT.normalizedStage(npc);
    const base = (40 + (g.MARTIAL ? g.MARTIAL.eff(npc, 'physiology.meridianCapacity') : HC.eff(npc, 'physiology.meridianCapacity')) * 0.9) * (1 + 0.5 * (ns - 1));
    const pass = g.MARTIAL && g.MARTIAL.passiveStats ? g.MARTIAL.passiveStats(npc) : null;
    const inn = g.MARTIAL && g.MARTIAL.innateStats ? g.MARTIAL.innateStats(npc) : null;
    const m = c.mantra ? TECH_BY_ID[c.mantra] : null;
    const renBonus = (npc.meridians && npc.meridians.opened && npc.meridians.opened.REN_MAI) ? 0.15 : 0;
    const dantianBonus = (npc.ext && Number.isFinite(npc.ext.dantianBonusPct)) ? npc.ext.dantianBonusPct : (Number.isFinite(npc._dantianBonusPct) ? npc._dantianBonusPct : 0);
    const pct = (pass ? (pass.qiMaxPct || 0) : 0) + (inn ? (inn.qiMaxPct || 0) : 0) + (m && m.mantraBonus && m.mantraBonus.qiMaxPct ? m.mantraBonus.qiMaxPct : 0) + renBonus + dantianBonus;
    const flat = (pass ? (pass.qiMaxFlat || 0) : 0) + (inn ? (inn.qiMaxFlat || 0) : 0);
    const val = Math.max(1, Math.round(base * (1 + pct) + flat));
    npc._qiMaxCache = { cult: c, path: c.path, sub: c.sub, st: c.stage, mantra: c.mantra, ver: npc._ver, pver: npc._passVer || 0, val };
    return val;
  };
  CULT.speedMult = npc => {
    const base = npc && npc.cult ? 1 + 0.05 * (npc.cult.stage - 1) : 1;
    if (CULT.QINGGONG && npc && npc.cult) {
      const qg = CULT.QINGGONG.resolveNpcMode(null, npc);
      if (qg && qg.speedMult > 1) return +(base * (1 + (qg.speedMult - 1) * 0.35)).toFixed(3);
    }
    return base;
  };

  /* ===== PATCH v5.4.0: QINGGONG & AERIAL LOCOMOTION SYSTEM (ระบบวิชาตัวเบา ขี่กระบี่บิน และเหาะเหินเดินอากาศ) ===== */
  CULT.QINGGONG = {
    MODE_ORDER: [
      'CELESTIAL_LEVITATION',
      'SWORD_FLIGHT',
      'SHADOW_BLINK',
      'LEAP_BOUND',
      'WATER_LOTUS_DRIFT',
      'SWIFT_STRIDE',
      'MORTAL_WALK'
    ],
    MODES: {
      MORTAL_WALK: {
        id: 'MORTAL_WALK',
        rankOrder: 0,
        icon: '🚶',
        nameTh: 'เดินเท้าสามัญ',
        shortTh: 'เดินเท้า',
        minStage: 0,
        speedMult: 1.00,
        qiCostPerTick: 0,
        minQiPct: 0,
        recoverQiPct: 0,
        ignoreWeatherSlow: false,
        waterSpeedBonus: 1.00,
        leapTiles: 0,
        blinkStride: false,
        aerialDirectPath: false,
        altitudePx: 0,
        worldTimeMult: 1.00,
        waterRouteMult: 1.00,
        carryBonus: 0,
        hazardRed: 0,
        color: '#9aa5b1',
        prosTh: 'ไม่เสียพลังปราณในการเดินเท้า',
        consTh: 'ความเร็วปกติ ติดสิ่งกีดขวางและแพ้สภาพอากาศฝน/หิมะ'
      },
      SWIFT_STRIDE: {
        id: 'SWIFT_STRIDE',
        rankOrder: 1,
        icon: '💨',
        nameTh: 'ย่างก้าววายุกรด (วิ่งปราณทะยาน)',
        shortTh: 'วิ่งปราณวายุ',
        minStage: 1,
        speedMult: 1.48,
        qiCostPerTick: 0.15,
        minQiPct: 0.12,
        recoverQiPct: 0.22,
        ignoreWeatherSlow: true,
        waterSpeedBonus: 1.08,
        leapTiles: 0,
        blinkStride: false,
        aerialDirectPath: false,
        altitudePx: 1.5,
        worldTimeMult: 0.90,
        waterRouteMult: 0.92,
        carryBonus: 0.08,
        hazardRed: 0.05,
        color: '#72efdd',
        prosTh: 'วิ่งเร็วขึ้น +48%, ไม่ถูกลดความเร็วจากฝนหรือหิมะ, ใช้ปราณน้อยมาก (0.15/ทิค)',
        consTh: 'ยังต้องวิ่งตามเส้นทางพื้นดินปกติ ไม่สามารถเหินข้ามสิ่งกีดขวางใหญ่'
      },
      WATER_LOTUS_DRIFT: {
        id: 'WATER_LOTUS_DRIFT',
        rankOrder: 2,
        icon: '🪷',
        nameTh: 'ย่างก้าวบัวขาวเหยียบคลื่น (ล่องวารีไร้รอย)',
        shortTh: 'เหยียบคลื่นบัวหยก',
        minStage: 2,
        speedMult: 1.60,
        qiCostPerTick: 0.22,
        minQiPct: 0.14,
        recoverQiPct: 0.25,
        ignoreWeatherSlow: true,
        waterSpeedBonus: 1.45,
        leapTiles: 0,
        blinkStride: false,
        aerialDirectPath: false,
        altitudePx: 2.8,
        worldTimeMult: 0.85,
        waterRouteMult: 0.74,
        carryBonus: 0.12,
        hazardRed: 0.10,
        color: '#48cae4',
        prosTh: 'เร็วขึ้น +60% (และพุ่งทะยานบนผิวน้ำ/สะพาน/บึงบัว ×1.45), เดินทางนอกสำนักสายแม่น้ำเร็วขึ้น 26%',
        consTh: 'ความเร็วบนพื้นหินแห้งเป็นรองวิชาทะยานเมฆาและก้าวพริบตา'
      },
      LEAP_BOUND: {
        id: 'LEAP_BOUND',
        rankOrder: 3,
        icon: '🦅',
        nameTh: 'ทะยานเมฆาเหินเวหา (กระโดดไกลข้ามสิ่งกีดขวาง)',
        shortTh: 'กระโดดไกลทะยานเมฆ',
        minStage: 2,
        speedMult: 1.74,
        qiCostPerTick: 0.28,
        minQiPct: 0.15,
        recoverQiPct: 0.26,
        ignoreWeatherSlow: false,
        waterSpeedBonus: 1.15,
        leapTiles: 2,
        blinkStride: false,
        aerialDirectPath: false,
        altitudePx: 9.5,
        worldTimeMult: 0.84,
        waterRouteMult: 0.86,
        carryBonus: 0.14,
        hazardRed: 0.12,
        color: '#90e0ef',
        prosTh: 'เร็วขึ้น +74%, กระโดดไกลเป็นวิถีโค้งข้ามจุดแวะ 2–3 ช่องในพริบตา, ลดอันตรายเดินทางนอกสำนัก 12%',
        consTh: 'ใช้ปราณปานกลาง (0.28/ทิค) และต้องมีจังหวะส่งตัวขึ้นลง'
      },
      SHADOW_BLINK: {
        id: 'SHADOW_BLINK',
        rankOrder: 4,
        icon: '⚡',
        nameTh: 'ก้าวพริบตาเงาพราย (ย่นระยะดารา)',
        shortTh: 'ก้าวพริบตาเงาพราย',
        minStage: 3,
        speedMult: 1.98,
        qiCostPerTick: 0.42,
        minQiPct: 0.18,
        recoverQiPct: 0.30,
        ignoreWeatherSlow: true,
        waterSpeedBonus: 1.25,
        leapTiles: 2,
        blinkStride: true,
        aerialDirectPath: false,
        altitudePx: 4.0,
        worldTimeMult: 0.79,
        waterRouteMult: 0.80,
        carryBonus: 0.15,
        hazardRed: 0.18,
        color: '#c77dff',
        prosTh: 'ความเร็วสูง +98%, ทิ้งร่างเงาติดตา 3 ร่างและย่นระยะข้ามช่องทางเดิน, หลบหลีกภัยยุทธภพ +18%',
        consTh: 'ผลาญปราณค่อนข้างสูง (0.42/ทิค) หากปราณต่ำกว่า 18% จะต้องกลับมาเดินปกติ'
      },
      SWORD_FLIGHT: {
        id: 'SWORD_FLIGHT',
        rankOrder: 5,
        icon: '🗡️',
        nameTh: 'วิชาขี่กระบี่บินเหินเวหา (御剑飞行)',
        shortTh: 'ขี่กระบี่บิน',
        minStage: 3,
        speedMult: 2.38,
        noWeaponSpeedMult: 1.55,
        qiCostPerTick: 0.75,
        stormExtraQi: 0.25,
        energyDrainPerTick: 0.012,
        stormSpeedPenalty: 0.85,
        minQiPct: 0.20,
        recoverQiPct: 0.35,
        ignoreWeatherSlow: false,
        waterSpeedBonus: 1.35,
        leapTiles: 0,
        blinkStride: false,
        aerialDirectPath: true,
        requiresWeaponForFullSpeed: true,
        altitudePx: 13.0,
        worldTimeMult: 0.75,
        waterRouteMult: 0.74,
        carryBonus: 0.22,
        hazardRed: 0.20,
        color: '#00f5d4',
        prosTh: 'บินตัดตรงเหนือสิ่งกีดขวางในสำนัก (+138% ความเร็ว), ใช้ได้ตั้งแต่ขั้น 3 (ก่อตั้งรากฐาน/แกนทองคำ), ลดเวลาเดินทางนอกสำนัก 25%',
        consTh: 'มีข้อเสียมากกว่าเหาะเหินเดินอากาศเอง: ผลาญปราณสูง (0.75/ทิค, พายุฝน +0.25/ทิค), ต้องพึ่งพาศาสตราคู่กาย (หากไร้ศาสตราความเร็วลดเหลือ +55%), กินสมาธิ/แรงกาย (-0.012/ทิค), และร่วงลงเดินพื้นทันทีเมื่อปราณต่ำกว่า 20%'
      },
      CELESTIAL_LEVITATION: {
        id: 'CELESTIAL_LEVITATION',
        rankOrder: 6,
        icon: '☁️',
        nameTh: 'วิชาเหาะเหินเดินอากาศเซียนอมตะ (凭虚御风)',
        shortTh: 'เหาะเหินเดินอากาศ',
        minStage: 6,
        speedMult: 2.90,
        qiCostPerTick: 0.35,
        minQiPct: 0.10,
        recoverQiPct: 0.20,
        ignoreWeatherSlow: true,
        waterSpeedBonus: 1.50,
        leapTiles: 0,
        blinkStride: false,
        aerialDirectPath: true,
        requiresWeaponForFullSpeed: false,
        altitudePx: 16.5,
        worldTimeMult: 0.65,
        waterRouteMult: 0.65,
        carryBonus: 0.35,
        hazardRed: 0.30,
        color: '#ffd166',
        prosTh: 'สุดยอดวิชาตัวเบาระดับสูง (ขั้น 6+): เหาะเหินเดินอากาศด้วยกายเซียนโดยไม่ต้องพึ่งกระบี่ (+190% ความเร็ว), บินตัดตรงทุกพื้นที่, ประหยัดปราณกว่าขี่กระบี่บินครึ่งหนึ่ง (0.35/ทิค เพราะผสานปราณฟ้าดิน), ไร้ผลกระทบจากพายุฝน, เดินทางยุทธภพเร็วขึ้น 35%',
        consTh: 'จำกัดเฉพาะผู้บรรลุตบะระดับสูง (ขั้น 6 ก่อกำเนิดวิญญาณ/แปรเปลี่ยนเทวะขึ้นไป) หรือผู้สำเร็จคัมภีร์เหาะเหินเซียนอมตะ'
      }
    },

    SIGNATURE_MANUALS: [
      {
        id: 'QG_SWIFT_GALE_STRIDE_T1',
        nameTh: 'วิชาตัวเบาย่างก้าววายุกรด',
        path: 'BODY',
        sub: 'LIGHTNESS_SHADOW',
        cat: 'MOVEMENT_TECHNIQUE',
        subType: 'LIGHTNESS_ART',
        tier: 1,
        power: 18,
        qiCost: 6,
        cooldown: 2,
        element: 'WIND',
        qinggongMode: 'SWIFT_STRIDE',
        descTh: 'โคจรปราณวายุลงสู่ฝ่าเท้า วิ่งทะยานดุจสายลมกรดในสำนักและยุทธภพโดยไม่หวั่นเกรงฝนหิมะ'
      },
      {
        id: 'QG_CLOUD_DRAGON_LEAP_T2',
        nameTh: 'วิชาตัวเบาทะยานเมฆามังกรเหิน',
        path: 'BODY',
        sub: 'LIGHTNESS_SHADOW',
        cat: 'MOVEMENT_TECHNIQUE',
        subType: 'LIGHTNESS_ART',
        tier: 2,
        power: 32,
        qiCost: 10,
        cooldown: 3,
        element: 'WIND',
        qinggongMode: 'LEAP_BOUND',
        descTh: 'ดีดกายกระโดดไกลเป็นวิถีโค้งข้ามสิ่งกีดขวางและหลังคาเรือนสำนักในพริบตา'
      },
      {
        id: 'QG_JADE_LOTUS_WATER_DRIFT_T3',
        nameTh: 'วิชาตัวเบาย่างก้าวบัวขาวเหยียบคลื่น',
        path: 'XIAN',
        sub: 'CLOUD_WIND',
        cat: 'MOVEMENT_TECHNIQUE',
        subType: 'LIGHTNESS_ART',
        tier: 3,
        power: 46,
        qiCost: 12,
        cooldown: 3,
        element: 'WATER_ICE',
        qinggongMode: 'WATER_LOTUS_DRIFT',
        descTh: 'เหยียบผิวน้ำและใบบัวโดยไม่จม ก่อเกิดกลีบบัวหยกและระลอกคลื่นใต้ฝ่าเท้า เดินทางข้ามแม่น้ำรวดเร็วเป็นเลิศ'
      },
      {
        id: 'QG_PHANTOM_STAR_BLINK_T4',
        nameTh: 'วิชาตัวเบาก้าวพริบตาเงาดารา',
        path: 'DEMON',
        sub: 'BLOOD_SHADOW',
        cat: 'MOVEMENT_TECHNIQUE',
        subType: 'LIGHTNESS_ART',
        tier: 4,
        power: 68,
        qiCost: 16,
        cooldown: 3,
        element: 'YIN_SHADOW',
        qinggongMode: 'SHADOW_BLINK',
        descTh: 'ย่นระยะทางด้วยปราณเงาดารา ทิ้งร่างเงาพรายติดตา 3 ร่างไว้เบื้องหลังพร้อมพุ่งข้ามช่องทางเดิน'
      },
      {
        id: 'QG_IMPERIAL_SWORD_FLIGHT_T5',
        nameTh: 'เคล็ดวิชาขี่กระบี่บินเหินเวหา',
        path: 'XIAN',
        sub: 'SWORD_FLIGHT',
        cat: 'MOVEMENT_TECHNIQUE',
        subType: 'LIGHTNESS_ART',
        tier: 4,
        power: 88,
        qiCost: 22,
        cooldown: 4,
        element: 'EARTH_METAL',
        qinggongMode: 'SWORD_FLIGHT',
        legendary: true,
        descTh: 'ควบแน่นปราณบังคับศาสตรากระบี่ให้ลอยขึ้นรองรับใต้ฝ่าเท้า บินตัดตรงข้ามพื้นที่สำนักและยุทธภพด้วยความเร็วสูง แต่กินปราณและสมาธิในการควบคุม'
      },
      {
        id: 'QG_IMMORTAL_VOID_LEVITATION_T7',
        nameTh: 'มหาวิชาเหาะเหินเดินอากาศไร้พันธนาการ',
        path: 'XIAN',
        sub: 'ASTRAL_STAR',
        cat: 'MOVEMENT_TECHNIQUE',
        subType: 'LIGHTNESS_ART',
        tier: 6,
        power: 135,
        qiCost: 18,
        cooldown: 4,
        element: 'LIGHT_YANG',
        qinggongMode: 'CELESTIAL_LEVITATION',
        legendary: true,
        descTh: 'วิชาระดับเซียนขั้นสูงที่หลอมรวมกายเข้ากับปราณฟ้าดิน เหาะเหินเดินอากาศเหนือเมฆามงคลได้เองโดยไม่ต้องพึ่งพากระบี่บิน ประหยัดปราณและไร้ข้อจำกัดจากพายุฝน'
      }
    ],

    mapTechToQinggongMode(t) {
      if (!t) return null;
      if (t.qinggongMode && this.MODES[t.qinggongMode]) return t.qinggongMode;
      const id = String(t.id || '');
      const name = String(t.nameTh || '');
      const tier = Number(t.tier) || 1;
      if (id === 'QG_IMMORTAL_VOID_LEVITATION_T7' || id === 'LEG_LIGHT_KUNPENG_ASTRAL_WINGS' || id === 'ART190_GOD_049' || (tier >= 6 && /เหาะ|เดินอากาศ|คุนเผิง|ดารา|สุริยัน/.test(name))) {
        return 'CELESTIAL_LEVITATION';
      }
      if (id === 'QG_IMPERIAL_SWORD_FLIGHT_T5' || id === 'ART190_XIAN_045' || /เหินกระบี่|ขี่กระบี่|กระบี่บิน|SWORD_FLIGHT/.test(name + '|' + (t.sub || ''))) {
        return 'SWORD_FLIGHT';
      }
      if (id === 'QG_JADE_LOTUS_WATER_DRIFT_T3' || id === 'LEG_LIGHT_LINGBO_STEP' || id === 'ART_V112_SOUL_BUTTERFLY_DREAM_STEP_T2' || /เหยียบคลื่น|วารี|บัว|ผีเสื้อ/.test(name)) {
        return 'WATER_LOTUS_DRIFT';
      }
      if (id === 'QG_PHANTOM_STAR_BLINK_T4' || id === 'ART190_XIAN_041' || id === 'LEG_LIGHT_MOON_BAT_SHADOW' || id === 'MP_AGNOSTIC_SHADOWLESS_STEP_T4' || id === 'ART_MECH_PUPPET_007' || /พริบตา|เร้นเงา|ไร้ร่องรอย|สลับร่าง/.test(name)) {
        return 'SHADOW_BLINK';
      }
      if (id === 'QG_CLOUD_DRAGON_LEAP_T2' || id === 'MP_SPEAR_VAULT_STEP_T3' || id === 'MP_STAFF_POLE_VAULT_T2' || id === 'MP_BOW_PARTING_SHOT_T4' || /เหินข้าม|กระโดด|ทะยานเมฆ|ค้ำทวน|ค้ำพลอง/.test(name)) {
        return 'LEAP_BOUND';
      }
      const isMoveCat = t.cat === 'MOVEMENT_TECHNIQUE' || t.subType === 'LIGHTNESS_ART' || /_LIGHT$/.test(t.cat || '') || (t.cat === 'AUXILIARY_ART' && t.role === 'MOVEMENT_STEALTH_RECON' && /ก้าว|ทะยาน|เหยียบ|เหิน|พริบตา|ลอยตัว|วายุ|เมฆา|สายลม|ไร้เงา|ท่องคลื่น/.test(name));
      if (isMoveCat) {
        if (tier >= 6) return 'CELESTIAL_LEVITATION';
        if (tier >= 5 && (t.path === 'SWORD' || t.path === 'XIAN')) return 'SWORD_FLIGHT';
        if (tier >= 4) return 'SHADOW_BLINK';
        if (tier === 3) return 'LEAP_BOUND';
        if (tier === 2) return 'WATER_LOTUS_DRIFT';
        return 'SWIFT_STRIDE';
      }
      return null;
    },

    initCatalog() {
      // 1. Register the 6 signature manuals into JD.TECH.techniques & TECH_BY_ID (without altering JD.MARTIAL.techniques count)
      this.SIGNATURE_MANUALS.forEach(spec => {
        const fullTech = Object.assign({
          stages: [
            { stage: 1, nameTh: 'ขั้นต้น', mult: 1.0 },
            { stage: 2, nameTh: 'ขั้นเชี่ยวชาญ', mult: 1.18 },
            { stage: 3, nameTh: 'ขั้นบรรลุ', mult: 1.38 }
          ],
          qinggongSpec: this.MODES[spec.qinggongMode]
        }, spec);
        TECH_BY_ID[fullTech.id] = fullTech;
      });

      // 2. Enrich all existing movement / lightness techniques in JD.TECH and JD.MARTIAL
      const enrichList = list => {
        if (!Array.isArray(list)) return;
        list.forEach(t => {
          if (!t) return;
          const mId = this.mapTechToQinggongMode(t);
          if (mId && this.MODES[mId]) {
            t.qinggongMode = mId;
            t.qinggongSpec = this.MODES[mId];
          }
        });
      };
      if (JD.TECH) enrichList(JD.TECH.techniques);
      if (JD.MARTIAL) enrichList(JD.MARTIAL.techniques);
    },

    ensureState(n) {
      if (!n) return null;
      if (!n.qinggongState || typeof n.qinggongState !== 'object') {
        n.qinggongState = {
          preferredMode: 'AUTO',
          activeMode: 'MORTAL_WALK',
          exhaustedFallback: false,
          airborne: false,
          altitude: 0,
          leapPhase: 0,
          lastBlinkTick: -999,
          lastLeapTick: -999,
          totalTilesMoved: 0,
          totalTilesFlown: 0,
          totalQiSpent: 0,
          totalLeaps: 0,
          totalBlinks: 0
        };
      }
      return n.qinggongState;
    },

    unlockedModes(n) {
      const modes = new Set(['MORTAL_WALK']);
      if (!n || !n.cult) return Array.from(modes);
      const stg = CULT.equivalentStage ? CULT.equivalentStage(n) : (n.cult.stage || 1);
      const path = n.cult.path || '';
      const sub = n.cult.sub || '';
      const moveSkill = (n.h && n.h.skills && n.h.skills.MOVEMENT) || 0;

      // Natural realm progression unlocks
      if (stg >= 1 && (moveSkill >= 5 || stg >= 2)) modes.add('SWIFT_STRIDE');
      if (stg >= 2 && (moveSkill >= 12 || stg >= 3 || path === 'BODY' || path === 'XIAN')) modes.add('LEAP_BOUND');
      if (stg >= 2 && (['CLOUD_WIND', 'CLOUD_WIND_STEP', 'WIND_CHASER', 'GALE_STEP'].includes(sub) || ['XIAN', 'WANDERING_DAO', 'CELESTIAL_WEATHER'].includes(path) || moveSkill >= 18)) modes.add('WATER_LOTUS_DRIFT');
      if (stg >= 3 && (['LIGHTNESS_SHADOW', 'BLOOD_SHADOW', 'SHADOW_ASSASSIN', 'PHANTOM_SOUL'].includes(sub) || ['DEMON', 'NINPO_SHADOW'].includes(path) || moveSkill >= 26)) modes.add('SHADOW_BLINK');
      if (stg >= 3 && (['SWORD', 'LEG_READ_FORM_BLADE'].includes(path) || ['SWORD_FLIGHT', 'SWORD_IMMORTAL', 'MIND_SWORD_TELEKINESIS'].includes(sub) || (stg >= 4 && (path === 'XIAN' || !!(n.equip && n.equip.WEAPON))))) {
        modes.add('SWORD_FLIGHT');
      }
      if (stg >= 6) {
        if (path !== 'SHADOW_SAMURAI') {
          modes.add('CELESTIAL_LEVITATION');
          modes.add('SWORD_FLIGHT');
        }
        modes.add('SHADOW_BLINK');
        modes.add('LEAP_BOUND');
        modes.add('WATER_LOTUS_DRIFT');
        modes.add('SWIFT_STRIDE');
      }
      if (path === 'SHADOW_SAMURAI') {
        modes.delete('CELESTIAL_LEVITATION');
        modes.delete('SWORD_FLIGHT');
      }

      // Learned technique unlocks
      const techs = Array.isArray(n.cult.techs) ? n.cult.techs : [];
      for (let i = 0; i < techs.length; i++) {
        const t = TECH_BY_ID[techs[i]];
        if (!t) continue;
        const mId = t.qinggongMode || this.mapTechToQinggongMode(t);
        if (mId && this.MODES[mId]) {
          const reqStage = Math.max(1, (this.MODES[mId].minStage || 1) - 1);
          if (stg >= reqStage) modes.add(mId);
        }
      }
      return this.MODE_ORDER.filter(m => modes.has(m));
    },

    hasSwordFlightWeapon(n) {
      if (!n) return false;
      if (n.equip && n.equip.WEAPON) return true;
      if (n.cult && (n.cult.path === 'SWORD' || n.cult.sub === 'SWORD_FLIGHT')) return true;
      return false;
    },

    resolveNpcMode(W, n) {
      if (!n || !n.cult) {
        return {
          modeId: 'MORTAL_WALK',
          spec: this.MODES.MORTAL_WALK,
          speedMult: 1.0,
          qiCostPerTick: 0,
          airborne: false,
          altitudePx: 0,
          exhaustedFallback: false,
          weaponPenaltyActive: false,
          stormPenaltyActive: false,
          waterBonusActive: false
        };
      }
      const st = n.qinggongState || null;
      const stg = n.cult.stage || 1;
      const techLen = Array.isArray(n.cult.techs) ? n.cult.techs.length : 0;
      const wpnId = (n.equip && n.equip.WEAPON && n.equip.WEAPON.id) || '';
      const pref = (st && st.preferredMode) || 'AUTO';
      const wEff = W || (g.SECT && g.SECT.PEAKS && g.SECT.PEAKS._activeWorld) || null;
      const weather = (wEff && wEff.weather && (wEff.weather.kind || wEff.weather)) || 'clear';
      const stObj = (n.h && n.h.state) || n.state || null;
      const isZeroQi = n.cult && n.cult.path === 'SHADOW_SAMURAI';
      const qMax = isZeroQi ? 100 : Math.max(1, (n._nd && n._nd.qiMax) ? n._nd.qiMax : CULT.qiMax(n));
      const curQi = isZeroQi ? Math.max(0, (stObj && Number.isFinite(stObj.energy)) ? stObj.energy : 80) : Math.max(0, (stObj && Number.isFinite(stObj.qi)) ? stObj.qi : qMax);
      const wTick = (wEff && wEff.t) || -1;
      const stExh = !!(st && st.exhaustedFallback);
      const qiBucket = Math.floor((curQi / qMax) * 25);
      const msKey = (n.cult.mantra || "") + ":" + (n.mantraState ? (n.mantraState.stance || "1") : "0");
      const tc = n._qgTickCache;
      if (wTick >= 0 && tc && tc.t === wTick && tc.ver === n._ver && tc.stg === stg && tc.wpn === wpnId && tc.w === weather && tc.pref === pref && tc.exh === stExh && tc.qb === qiBucket && tc.ms === msKey) {
        return tc.val;
      }
      const qiRatio = curQi / qMax;

      // Fast unlocked-modes cache on NPC
      const moveSkKey = (n.h && n.h.skills && n.h.skills.MOVEMENT) || 0;
      let uc = n._qgUnlockCache;
      if (!uc || uc.ver !== n._ver || uc.stg !== stg || uc.techLen !== techLen || uc.wpnId !== wpnId || uc.mv !== moveSkKey) {
        uc = {
          ver: n._ver,
          stg,
          techLen,
          wpnId,
          mv: moveSkKey,
          unlocked: this.unlockedModes(n)
        };
        n._qgUnlockCache = uc;
      }
      const unlocked = uc.unlocked;

      // Choose candidate mode before Qi check
      let targetMode = 'MORTAL_WALK';
      if (pref !== 'AUTO' && unlocked.includes(pref)) {
        targetMode = pref;
      } else {
        targetMode = unlocked[0] || 'MORTAL_WALK';
        const PATH_PREF_QG = { SHADOW_SAMURAI: 'SWIFT_STRIDE', NINPO_SHADOW: 'SHADOW_BLINK', NINPO_ELEMENTAL: 'LEAP_BOUND', TIDE_VOYAGER: 'WATER_LOTUS_DRIFT', WANDERING_DAO: 'WATER_LOTUS_DRIFT', DEVOURING_FLESH: 'LEAP_BOUND', ARENA_GLORY: 'LEAP_BOUND', GRAVITY_DAO: 'LEAP_BOUND', VOID_SPACE: 'SHADOW_BLINK', NETHER_GRAVE: 'SHADOW_BLINK', VOID_HERETIC_PACT: 'SHADOW_BLINK', DIVINE_CHANNELER: 'SWORD_FLIGHT' };
        if (n.cult && PATH_PREF_QG[n.cult.path] && unlocked.includes(PATH_PREF_QG[n.cult.path])) {
          targetMode = PATH_PREF_QG[n.cult.path];
        }
        // Smart auto-choice: if SWORD_FLIGHT is top but NPC has no weapon and has SHADOW_BLINK, prefer SHADOW_BLINK unless sword path
        if (targetMode === 'SWORD_FLIGHT' && !this.hasSwordFlightWeapon(n) && unlocked.includes('SHADOW_BLINK')) {
          targetMode = 'SHADOW_BLINK';
        }
      }

      const targetSpec = this.MODES[targetMode] || this.MODES.MORTAL_WALK;

      // Hysteresis check for Qi exhaustion fallback
      let exhausted = !!(st && st.exhaustedFallback);
      if (targetSpec.qiCostPerTick > 0) {
        if (qiRatio < targetSpec.minQiPct) {
          exhausted = true;
        } else if (exhausted && qiRatio >= targetSpec.recoverQiPct) {
          exhausted = false;
        }
      } else {
        exhausted = false;
      }

      let activeMode = exhausted ? 'MORTAL_WALK' : targetMode;
      // If high mode is exhausted, check if SWIFT_STRIDE is still affordable
      if (exhausted && unlocked.includes('SWIFT_STRIDE') && qiRatio >= this.MODES.SWIFT_STRIDE.minQiPct && curQi >= 2) {
        activeMode = 'SWIFT_STRIDE';
      }

      const spec = this.MODES[activeMode] || this.MODES.MORTAL_WALK;

      // Compute effective speed multiplier and tradeoffs
      let speedMult = spec.speedMult;
      let qiCostPerTick = spec.qiCostPerTick;
      let weaponPenaltyActive = false;
      let stormPenaltyActive = false;
      let waterBonusActive = false;

      // Movement skill mastery bonus (+0% to +18%)
      const moveSkill = (n.h && n.h.skills && n.h.skills.MOVEMENT) || 0;
      if (activeMode !== 'MORTAL_WALK') {
        speedMult *= (1 + Math.min(0.18, moveSkill * 0.002));
      }

      // Sword Flight authentic tradeoffs vs Celestial Levitation
      if (activeMode === 'SWORD_FLIGHT') {
        if (!this.hasSwordFlightWeapon(n)) {
          speedMult = spec.noWeaponSpeedMult || 1.55;
          weaponPenaltyActive = true;
        }
        if (weather === 'rain' || weather === 'snow' || weather === 'storm') {
          speedMult *= (spec.stormSpeedPenalty || 0.85);
          qiCostPerTick += (spec.stormExtraQi || 0.25);
          stormPenaltyActive = true;
        }
      }

      // Patch v5.5.0: Mantra Resonance Synergy with Qinggong & Sword Flight (when mantraState is active)
      if (CULT.MANTRA_SYSTEM && n.mantraState) {
        const mr = CULT.MANTRA_SYSTEM.resolveNpcMantra(W, n);
        if (mr) {
          if (activeMode === 'SWORD_FLIGHT' && mr.archetypeId === 'SWORD_QI_MERIDIAN') {
            speedMult *= (1 + (mr.swordFlightSpeedBonus || 0.15));
            qiCostPerTick *= (mr.swordFlightQiCostMult || 0.70);
          } else if (activeMode !== 'MORTAL_WALK') {
            speedMult *= (1 + (mr.qinggongSpeedBonus || 0));
            qiCostPerTick *= (mr.qinggongQiCostMult || 1.0);
          }
        }
      }

      // Water Lotus Drift bonus on water/pond/bridge tiles
      if (W && W.map && g.MAP && g.MAP.tileAt) {
        const tile = g.MAP.tileAt(W.map, n.x, n.y);
        const T = g.MAP.T || {};
        if (tile === T.WATER || tile === T.BRIDGE) {
          if (activeMode === 'WATER_LOTUS_DRIFT') {
            speedMult *= (spec.waterSpeedBonus || 1.45);
            waterBonusActive = true;
          } else if (spec.aerialDirectPath) {
            waterBonusActive = true;
          }
        }
      }

      // Pure read-only: state is updated only in stepQinggongMove

      const resObj = {
        modeId: activeMode,
        targetModeId: targetMode,
        spec,
        unlockedModes: unlocked,
        speedMult: +speedMult.toFixed(3),
        qiCostPerTick: +qiCostPerTick.toFixed(3),
        airborne: !!spec.aerialDirectPath,
        altitudePx: spec.altitudePx || 0,
        exhaustedFallback: exhausted,
        weaponPenaltyActive,
        stormPenaltyActive,
        waterBonusActive,
        qiRatio: +qiRatio.toFixed(3)
      };
      if (wTick >= 0) {
        n._qgTickCache = { t: wTick, ver: n._ver, stg, wpn: wpnId, w: weather, pref, exh: stExh, qb: qiBucket, ms: msKey, val: resObj };
      }
      return resObj;
    },

    hasExplicitWorldQinggong(n) {
      if (!n || !n.cult) return false;
      const stg = CULT.equivalentStage ? CULT.equivalentStage(n) : (n.cult.stage || 1);
      if (stg >= 5) return true;
      if (n.qinggongState && n.qinggongState.preferredMode && n.qinggongState.preferredMode !== 'AUTO' && n.qinggongState.preferredMode !== 'MORTAL_WALK') return true;
      const techs = Array.isArray(n.cult.techs) ? n.cult.techs : [];
      for (let i = 0; i < techs.length; i++) {
        const t = TECH_BY_ID[techs[i]];
        if (t && (t.qinggongMode || this.mapTechToQinggongMode(t))) return true;
      }
      return false;
    },

    stepQinggongMove(W, n, distMoved, qgPre) {
      const stObj = (n && n.h && n.h.state) || (n && n.state) || null;
      if (!n || !n.cult || !stObj || !(distMoved > 0)) return null;
      const st = this.ensureState(n);
      const qg = qgPre || this.resolveNpcMode(W, n);
      const spec = qg.spec;
      st.exhaustedFallback = qg.exhaustedFallback;
      st.activeMode = qg.modeId;
      st.airborne = qg.airborne;
      st.altitude = qg.altitudePx;
      st.totalTilesMoved = +(st.totalTilesMoved + distMoved).toFixed(2);

      if (qg.modeId === 'MORTAL_WALK') {
        st.airborne = false;
        st.altitude = 0;
        return qg;
      }

      // Scale Qi cost smoothly with movement step
      const stepFactor = Math.min(1.35, Math.max(0.45, distMoved / 0.85));
      const qiSpent = +(qg.qiCostPerTick * stepFactor).toFixed(3);
      if (n.cult && n.cult.path === 'SHADOW_SAMURAI') {
        stObj.qi = 0;
        stObj.energy = Math.max(0, (Number.isFinite(stObj.energy) ? stObj.energy : 80) - qiSpent * 0.35);
      } else {
        if (!Number.isFinite(stObj.qi)) stObj.qi = CULT.qiMax(n);
        stObj.qi = Math.max(0, stObj.qi - qiSpent);
        if (n.state && n.state !== stObj && Number.isFinite(n.state.qi)) n.state.qi = stObj.qi;
        st.totalQiSpent = +(st.totalQiSpent + qiSpent).toFixed(2);
      }

      if (qg.airborne) {
        st.totalTilesFlown = +(st.totalTilesFlown + distMoved).toFixed(2);
      }

      // Sword Flight mental/energy focus drain tradeoff
      if (qg.modeId === 'SWORD_FLIGHT' && spec.energyDrainPerTick) {
        stObj.energy = Math.max(0, (Number.isFinite(stObj.energy) ? stObj.energy : 80) - spec.energyDrainPerTick);
        if (n.state && n.state !== stObj && Number.isFinite(n.state.energy)) n.state.energy = stObj.energy;
      }

      // Advance leap phase for parabolic jump animation
      if (qg.modeId === 'LEAP_BOUND') {
        st.leapPhase = (st.leapPhase + 0.28) % 1;
      }

      // Patch v5.5.0: Autonomous Walking Cultivation for Astral Void Breathing & active Mantra stances
      if (CULT.MANTRA_SYSTEM && n.mantraState) {
        CULT.MANTRA_SYSTEM.stepAutonomousBreathing(W, n, distMoved);
      }
      if (!qg.airborne && (qg.modeId === "LEAP_BOUND" || qg.modeId === "SHADOW_BLINK") && W && W.map && g.MAP && g.MAP.blocked && g.MAP.nearestFree) {
        const tx = Math.floor(n.x || 0), ty = Math.floor(n.y || 0);
        if (g.MAP.blocked(W.map, tx, ty)) {
          const nf = g.MAP.nearestFree(W.map, tx, ty);
          if (nf) { n.x = nf.x + 0.5; n.y = nf.y + 0.5; }
        }
      }
      if (W && ((W._isNewCalendarMinute !== false && W.t % 45 === 0)) && n.h && n.h.skills) {
        const pracFn = (g.MARTIAL && g.MARTIAL.skillPractice) ? g.MARTIAL.skillPractice : (HC && HC.practice);
        if (pracFn) pracFn(n, 'MOVEMENT', 0.04, 1.0);
        if (n.cult && Array.isArray(n.cult.techs)) {
          const moveTechId = n.cult.techs.find(tid => { const mt = TECH_BY_ID[tid]; return mt && (mt.qinggongMode || mt.cat === 'LIGHTNESS_ART' || mt.cat === 'MOVEMENT_TECHNIQUE'); });
          if (moveTechId && g.SK && g.SK.gainMastery) g.SK.gainMastery(W, n, moveTechId, 0.25);
        }
      }

      return qg;
    },

    compareSwordVsLevitation(W, n) {
      const sf = this.MODES.SWORD_FLIGHT;
      const cl = this.MODES.CELESTIAL_LEVITATION;
      const hasWpn = this.hasSwordFlightWeapon(n);
      return {
        swordFlight: {
          id: sf.id,
          nameTh: sf.nameTh,
          minStage: sf.minStage,
          effectiveSpeedMult: hasWpn ? sf.speedMult : sf.noWeaponSpeedMult,
          qiCostPerTick: sf.qiCostPerTick,
          stormExtraQi: sf.stormExtraQi,
          energyDrainPerTick: sf.energyDrainPerTick,
          requiresWeapon: true,
          hasWeaponNow: hasWpn,
          minQiPct: sf.minQiPct,
          worldTimeMult: sf.worldTimeMult,
          drawbacksTh: [
            'กินปราณสูงกว่าเหาะเหินเดินอากาศกว่า 2 เท่า (0.75 ปราณ/ทิค vs 0.35 ปราณ/ทิค)',
            'ต้องพึ่งพาศาสตราคู่กาย (หากไร้ศาสตรา ความเร็วตกจาก ×2.38 เหลือ ×1.55)',
            'แพ้สภาพอากาศพายุฝน/หิมะ (ความเร็วลดลง 15% และกินปราณเพิ่ม +0.25/ทิค)',
            'เสียสมาธิและแรงกายขณะควบคุมกระบี่บิน (-0.012 แรงกาย/ทิค)',
            'ร่วงลงพื้นเร็วกว่าเมื่อปราณต่ำกว่า 20% (ต้องรอฟื้นถึง 35% จึงบินต่อได้)'
          ]
        },
        celestialLevitation: {
          id: cl.id,
          nameTh: cl.nameTh,
          minStage: cl.minStage,
          effectiveSpeedMult: cl.speedMult,
          qiCostPerTick: cl.qiCostPerTick,
          stormExtraQi: 0,
          energyDrainPerTick: 0,
          requiresWeapon: false,
          minQiPct: cl.minQiPct,
          worldTimeMult: cl.worldTimeMult,
          advantagesTh: [
            'เร็วกว่าขี่กระบี่บินอย่างชัดเจน (×2.90 vs ×2.38)',
            'ประหยัดปราณกว่าครึ่งหนึ่ง (0.35 ปราณ/ทิค) เพราะหลอมรวมปราณฟ้าดินหนุนกาย',
            'เหาะเหินเดินอากาศด้วยกายเซียนโดยไม่ต้องพึ่งพากระบี่หรือศาสตราใดๆ',
            'ไม่ถูกลดความเร็วและไม่เสียปราณเพิ่มในพายุฝนหรือหิมะ',
            'ไม่เสียแรงกาย/สมาธิ และบินต่อเนื่องได้จนกว่าปราณจะต่ำกว่า 10%'
          ]
        }
      };
    },

    evaluatePartyExpeditionBonus(W, members, site) {
      const list = Array.isArray(members) ? members.filter(Boolean) : [];
      if (!list.length) {
        return {
          durationMultiplier: 1.0,
          hazardReduction: 0,
          capacityMultiplier: 1.0,
          dominantMode: 'MORTAL_WALK',
          dominantNameTh: this.MODES.MORTAL_WALK.nameTh,
          summaryTh: 'เดินเท้าปกติ'
        };
      }
      const isWaterRoute = !!(site && (/น้ำ|ทะเลสาบ|บึง|เกาะ|วารี|แม่น้ำ|คราม|หยก/.test(site.nameTh || '') || site.terrain === 'water' || site.element === 'WATER_ICE'));
      let sumTimeMult = 0;
      let sumHazardRed = 0;
      let sumCarryBonus = 0;
      let bestMode = this.MODES.MORTAL_WALK;

      list.forEach(m => {
        const qg = this.resolveNpcMode(W, m);
        const sp = qg.spec || this.MODES.MORTAL_WALK;
        const tm = isWaterRoute && sp.waterRouteMult ? Math.min(sp.worldTimeMult, sp.waterRouteMult) : (sp.worldTimeMult || 1.0);
        sumTimeMult += tm;
        sumHazardRed += (sp.hazardRed || 0);
        sumCarryBonus += (sp.carryBonus || 0);
        if ((sp.rankOrder || 0) > (bestMode.rankOrder || 0)) {
          bestMode = sp;
        }
      });

      const n = list.length;
      const avgTimeMult = Math.max(0.55, Math.min(1.0, sumTimeMult / n));
      const avgHazardRed = Math.min(0.35, sumHazardRed / n);
      const avgCarryMult = +(1 + Math.min(0.45, sumCarryBonus / n)).toFixed(2);

      return {
        durationMultiplier: +avgTimeMult.toFixed(3),
        hazardReduction: +avgHazardRed.toFixed(3),
        capacityMultiplier: avgCarryMult,
        dominantMode: bestMode.id,
        dominantNameTh: bestMode.nameTh,
        dominantIcon: bestMode.icon,
        isWaterRoute,
        summaryTh: bestMode.icon + ' ' + bestMode.shortTh + ' (ย่นเวลาเดินทาง ' + Math.round((1 - avgTimeMult) * 100) + '% · ลดอันตราย ' + Math.round(avgHazardRed * 100) + '%)'
      };
    }
  };
  CULT.QINGGONG.initCatalog();

  /* ===== PATCH v5.5.0: MANTRA & INNER KUNGFU RESONANCE OVERHAUL (ระบบเอกลักษณ์คัมภีร์ปราณบ่มเพาะและจังหวะการเดินลมปราณ) ===== */
  CULT.MANTRA_SYSTEM = {
    ARCHETYPE_ORDER: [
      'PRIMORDIAL_YANG_FURNACE',
      'ABYSSAL_FROST_MIRROR',
      'SWORD_QI_MERIDIAN',
      'EVERGREEN_LONGEVITY_SPRING',
      'ASTRAL_VOID_BREATHING',
      'DEVOURING_NETHER_VORTEX',
      'VAJRA_IMMORTAL_BODY_BELL'
    ],
    ARCHETYPES: {
      PRIMORDIAL_YANG_FURNACE: {
        id: 'PRIMORDIAL_YANG_FURNACE',
        icon: '🔥',
        nameTh: 'ปราณเตาหลอมสุริยันอัคนี (烈阳真火)',
        shortTh: 'เตาหลอมสุริยัน',
        color: '#ff6b35',
        secondaryColor: '#ffd166',
        cultRateMult: 1.22,
        qiMaxBonusPct: 0.12,
        lifeBonusMult: 1.05,
        favoredWeathers: ['clear', 'crimson_sun'],
        weatherBonusPct: 0.25,
        ignoreColdWeather: true,
        autonomousWalkRatio: 0.10,
        sectAuraRadius: 6.0,
        sectAuraRateBonus: 0.12,
        combatBurnBonusPct: 0.15,
        combatBacklashPct: 0.08,
        qinggongSpeedBonus: 0.06,
        qinggongQiCostMult: 0.95,
        prosTh: 'เร่งตบะเร็ว +22%, แผ่ไอร้อนสุริยันหนุนศิษย์รอบข้างในระยะ 6 ช่อง (+12% ความเร็วบ่มเพาะ), โจมตีติดปราณเพลิง +15% และลวกศัตรูที่โจมตีระยะประชิด 8%, ไม่แพ้ภัยหนาวหิมะ',
        consTh: 'ปราณหยางร้อนแรง หากเร่งเดินปราณสุดขั้ว (Overdrive) จะสะสมพิษปราณไฟเร็วกว่าปกติ'
      },
      ABYSSAL_FROST_MIRROR: {
        id: 'ABYSSAL_FROST_MIRROR',
        icon: '❄️',
        nameTh: 'ปราณสมุทรน้ำแข็งกระจกจันทรา (寒冰玄冥)',
        shortTh: 'กระจกน้ำแข็งจันทรา',
        color: '#48cae4',
        secondaryColor: '#caf0f8',
        cultRateMult: 1.15,
        qiMaxBonusPct: 0.16,
        lifeBonusMult: 1.12,
        favoredWeathers: ['rain', 'snow', 'spirit_aurora'],
        weatherBonusPct: 0.22,
        ignoreColdWeather: true,
        autonomousWalkRatio: 0.12,
        sectAuraRadius: 6.0,
        sectAuraCalmStress: 0.15,
        combatShieldPct: 0.18,
        combatDamageRedPct: 0.15,
        qinggongSpeedBonus: -0.04,
        qinggongQiCostMult: 0.90,
        prosTh: 'จิตสงบดุจกระจกน้ำแข็ง ลดการเกิดจิตมาร -40% และสลายความเครียดศิษย์รอบข้าง, บ่มเพาะเร็วขึ้น +22% ท่ามกลางฝน/หิมะ, สร้างเกราะหยกเหมันต์ลดดาเมจ 15% ในศึก',
        consTh: 'ปราณหยินหนักแน่นเยือกแข็ง ทำให้ความเร็วเดินเท้าพื้นฐานช้าลงเล็กน้อย (-4%) เมื่อไม่ได้ใช้วิชาตัวเปาวายุ'
      },
      SWORD_QI_MERIDIAN: {
        id: 'SWORD_QI_MERIDIAN',
        icon: '🗡️',
        nameTh: 'ปราณชีพจรกระบี่ผ่าสวรรค์ (太白剑气)',
        shortTh: 'ชีพจรกระบี่คมกริบ',
        color: '#00f5d4',
        secondaryColor: '#e0fbfc',
        cultRateMult: 1.18,
        qiMaxBonusPct: 0.14,
        lifeBonusMult: 1.08,
        favoredWeathers: ['clear', 'thunder_tempest'],
        weatherBonusPct: 0.24,
        ignoreColdWeather: false,
        autonomousWalkRatio: 0.14,
        sectAuraRadius: 6.0,
        sectAuraSwordIntent: 0.10,
        combatPenBonusPct: 0.18,
        combatCounterSlashPct: 0.12,
        swordFlightSpeedBonus: 0.15,
        swordFlightQiCostMult: 0.70,
        qinggongSpeedBonus: 0.08,
        qinggongQiCostMult: 0.88,
        prosTh: 'หล่อเลี้ยงปราณกระบี่ในเส้นชีพจร ประสานกับ「วิชาขี่กระบี่บิน」โดยตรง (ลดปราณขี่กระบี่บิน -30% และบินเร็วขึ้น +15%), เจาะเกราะ +18% และปล่อยปราณกระบี่สวนกลับอัตโนมัติ 12% เมื่อถูกโจมตี',
        consTh: 'ปราณคมกริบดุจใบมีด หากได้รับบาดเจ็บภายในหรือเส้นชีพจรเสียหาย อัตราบ่มเพาะจะลดลงชั่วคราวจนกว่าจะรักษาหาย'
      },
      EVERGREEN_LONGEVITY_SPRING: {
        id: 'EVERGREEN_LONGEVITY_SPRING',
        icon: '🌿',
        nameTh: 'ปราณน้ำพุพฤกษาอมตะนิรันดร์ (长生青木)',
        shortTh: 'น้ำพุพฤกษาอมตะ',
        color: '#52b788',
        secondaryColor: '#b7e4c7',
        cultRateMult: 1.14,
        qiMaxBonusPct: 0.18,
        lifeBonusMult: 1.28,
        favoredWeathers: ['rain', 'clear'],
        weatherBonusPct: 0.20,
        ignoreColdWeather: false,
        autonomousWalkRatio: 0.15,
        sectAuraRadius: 6.5,
        sectAuraHealPct: 0.03,
        combatRegenHpPct: 0.035,
        combatRegenQiPct: 0.04,
        qinggongSpeedBonus: 0.04,
        qinggongQiCostMult: 0.85,
        prosTh: 'ยืดอายุขัยจากตบะ +28%, ฟื้นฟูพลังชีวิตและสลายพิษปราณต่อเนื่อง, แผ่วงจรปราณพฤกษาเยียวยาศิษย์รอบข้างในระยะ 6.5 ช่อง และฟื้นฟูเลือด 3.5% ทุกจังหวะโจมตีในศึก',
        consTh: 'ปราณเมตตานุ่มนวล เน้นความอมตะและยืดเยื้อมากกว่าพลังทำลายล้างฉับพลัน'
      },
      ASTRAL_VOID_BREATHING: {
        id: 'ASTRAL_VOID_BREATHING',
        icon: '🌌',
        nameTh: 'ปราณลมหายใจดาราจักรวาลไร้ขอบเขต (周天星辰)',
        shortTh: 'ลมหายใจดาราจักรวาล',
        color: '#9d4edd',
        secondaryColor: '#e0aaff',
        cultRateMult: 1.20,
        qiMaxBonusPct: 0.22,
        lifeBonusMult: 1.16,
        favoredWeathers: ['spirit_aurora', 'clear'],
        weatherBonusPct: 0.30,
        ignoreColdWeather: true,
        autonomousWalkRatio: 0.32,
        autonomousQiRegenPerTick: 0.35,
        sectAuraRadius: 6.5,
        sectAuraQiRegen: 0.45,
        combatDodgeBonusPct: 0.12,
        qinggongSpeedBonus: 0.12,
        qinggongQiCostMult: 0.75,
        prosTh: 'เดินลมปราณอัตโนมัติตลอดเวลาแม้ขณะก้าวเดิน ทำงาน หรือออกลาดตระเวน (ได้แต้มบ่มเพาะ 32% และฟื้นปราณ +0.35/ทิค ขณะเคลื่อนที่), ลดปราณใช้วิชาตัวเบาและการเหาะเหิน -25%, บ่มเพาะพุ่งทะยาน +30% ใต้แสงเหนือดารา',
        consTh: 'ต้องอาศัยจิตที่ปลอดโปร่งเชื่อมโยงดารา หากความเครียดสูงเกิน 70 ประสิทธิภาพการเดินปราณอัตโนมัติจะลดลงครึ่งหนึ่ง'
      },
      DEVOURING_NETHER_VORTEX: {
        id: 'DEVOURING_NETHER_VORTEX',
        icon: '🩸',
        nameTh: 'ปราณวังวนมารกลืนดาราสูบโลหิต (吞天魔功)',
        shortTh: 'วังวนมารกลืนปราณ',
        color: '#ef233c',
        secondaryColor: '#7209b7',
        cultRateMult: 1.36,
        qiMaxBonusPct: 0.20,
        lifeBonusMult: 0.96,
        favoredWeathers: ['thunder_tempest', 'rain'],
        weatherBonusPct: 0.25,
        ignoreColdWeather: true,
        autonomousWalkRatio: 0.16,
        sectAuraRadius: 5.5,
        combatLifestealPct: 0.14,
        combatQistealPct: 0.18,
        qinggongSpeedBonus: 0.10,
        qinggongQiCostMult: 0.92,
        prosTh: 'เร่งความเร็วบ่มเพาะสูงสุด +36%, สูบพลังชีวิต 14% และสูบปราณ 18% จากศัตรูทุกครั้งที่โจมตีในศึก, กลืนกินปราณตกค้างหลังจบการต่อสู้มาเพิ่มตบะทันที',
        consTh: 'ปราณมารดุดันกระหายศึก เพิ่มแรงกดดันจิตมารสะสมง่ายกว่าคัมภีร์สายเซียน'
      },
      VAJRA_IMMORTAL_BODY_BELL: {
        id: 'VAJRA_IMMORTAL_BODY_BELL',
        icon: '🛡️',
        nameTh: 'ปราณระฆังทองวัชระคงกระพัน (金刚不坏)',
        shortTh: 'ระฆังทองวัชระ',
        color: '#ffd166',
        secondaryColor: '#f4a261',
        cultRateMult: 1.16,
        qiMaxBonusPct: 0.15,
        lifeBonusMult: 1.22,
        favoredWeathers: ['thunder_tempest', 'crimson_sun'],
        weatherBonusPct: 0.22,
        ignoreColdWeather: true,
        autonomousWalkRatio: 0.12,
        sectAuraRadius: 6.0,
        combatDamageRedPct: 0.22,
        combatReflectPct: 0.16,
        tribulationGuardPct: 0.25,
        qinggongSpeedBonus: 0.0,
        qinggongQiCostMult: 1.12,
        prosTh: 'หล่อหลอมปราณคุ้มกายเป็น「ระฆังทองวัชระ」ลดความเสียหายที่ได้รับในศึก -22% และสะท้อนดาเมจประชิดกลับไป 16%, ลดความเสียหายจากสายฟ้าทัณฑ์สวรรค์ -25%, ไม่ถูกลดความเร็วเดินเมื่อเหนื่อยล้า',
        consTh: 'ปราณทองคำหนักแน่นดุจขุนเขา ทำให้ใช้ปราณเพิ่มขึ้น +12% เมื่อต้องขี่กระบี่บินหรือเหาะเหินกลางอากาศ'
      }
    },

    STANCES: {
      SERENE_PURIFICATION: {
        id: 'SERENE_PURIFICATION',
        icon: '🪷',
        nameTh: 'เดินปราณสงบกลั่นบริสุทธิ์ (清心凝气)',
        shortTh: 'กลั่นบริสุทธิ์',
        cultMult: 0.92,
        qiRegenMult: 1.45,
        toxicDeltaPerTick: -0.025,
        heartDemonDeltaPerTick: -0.03,
        energyDrainPerTick: 0,
        combatPowerMult: 0.95,
        auraMult: 1.0,
        descTh: 'โคจรปราณอย่างประณีตเพื่อชะล้างพิษโอสถ (-1.5/ชม.) สยบจิตมาร (-1.8/ชม.) และฟื้นฟูปราณเร็วขึ้น +45% โดยไม่มีความเสี่ยงธาตุไฟเข้าแทรก'
      },
      HARMONIOUS_CIRCULATION: {
        id: 'HARMONIOUS_CIRCULATION',
        icon: '☯️',
        nameTh: 'โคจรปราณผสานฟ้าดิน (周天调和)',
        shortTh: 'ผสานฟ้าดิน (สมดุล)',
        cultMult: 1.15,
        qiRegenMult: 1.15,
        toxicDeltaPerTick: -0.005,
        heartDemonDeltaPerTick: -0.005,
        energyDrainPerTick: 0,
        combatPowerMult: 1.10,
        auraMult: 1.25,
        descTh: 'จังหวะโคจรปราณมาตรฐานที่ผสานปราณฟ้าดินอย่างสมดุล เร่งอัตราบ่มเพาะ ×1.15 แผ่วงจรปราณหนุนศิษย์รอบข้าง และสำแดงปราณคุ้มกายในศึกเต็มประสิทธิภาพ'
      },
      OVERDRIVE_COMBUSTION: {
        id: 'OVERDRIVE_COMBUSTION',
        icon: '🔥',
        nameTh: 'เผาผลาญปราณเร่งตบะสุดขั้ว (逆转催功)',
        shortTh: 'เร่งปราณสุดขั้ว',
        cultMult: 1.55,
        qiRegenMult: 0.85,
        toxicDeltaPerTick: 0.015,
        heartDemonDeltaPerTick: 0.02,
        energyDrainPerTick: 0.025,
        combatPowerMult: 1.28,
        auraMult: 1.50,
        descTh: 'ฝืนเร่งการไหลเวียนปราณในจุดตันเถียนและเส้นชีพจรเพื่อทะลวงขีดจำกัด เร่งความเร็วบ่มเพาะ ×1.55 และเพิ่มอานุภาพปราณคุ้มกาย +28% แต่กินแรงกายและเพิ่มแรงกดดันจิตมาร/พิษปราณ'
      }
    },

    classifyMantraArchetype(m) {
      if (!m) return 'ASTRAL_VOID_BREATHING';
      if (m.mantraArchetype && this.ARCHETYPES[m.mantraArchetype]) return m.mantraArchetype;
      const id = String(m.id || '');
      const name = String(m.nameTh || '');
      const path = String(m.path || '');
      const el = String(m.element || (m.elementProfile && m.elementProfile.primary) || '');

      if (path === 'DEMON' || /มาร|โลหิต|กลืน|อสูร|นรก|สาป|พิษ/.test(name)) {
        return 'DEVOURING_NETHER_VORTEX';
      }
      if (path === 'BODY' || path === 'GOD' || /ระฆังทอง|วัชระ|คงกระพัน|เกราะหยก|ศิลา|เหล็ก|พยัคฆ์|มังกรทอง/.test(name)) {
        return 'VAJRA_IMMORTAL_BODY_BELL';
      }
      if (/กระบี่|คม|อัสนี|ผ่า|ตัด|SWORD|THUNDER_BLADE/.test(name + '|' + id) || (path === 'XIAN' && (el === 'EARTH_METAL' || el === 'LIGHTNING'))) {
        return 'SWORD_QI_MERIDIAN';
      }
      if (el === 'FIRE' || path === 'CRAFT_CREATION' || /สุริยัน|เพลิง|อัคนี|เตาหลอม|หยาง|หงส์/.test(name)) {
        return 'PRIMORDIAL_YANG_FURNACE';
      }
      if (el === 'WATER_ICE' || el === 'YIN_SHADOW' || path === 'HEART_SOUL' || /น้ำแข็ง|เหมันต์|จันทรา|สมุทร|หยิน|เงา|กระจก/.test(name)) {
        return 'ABYSSAL_FROST_MIRROR';
      }
      if (el === 'WOOD_LIFE' || path === 'SAGE_SUPPORT' || path === 'BEAST_SOVEREIGN' || /น้ำพุ|หยกเขียว|พฤกษา|บัว|อมตะ|ชีวิต|เมตตา/.test(name)) {
        return 'EVERGREEN_LONGEVITY_SPRING';
      }
      return 'ASTRAL_VOID_BREATHING';
    },

    initCatalog() {
      const enrich = m => {
        if (!m) return;
        const archId = this.classifyMantraArchetype(m);
        const spec = this.ARCHETYPES[archId] || this.ARCHETYPES.ASTRAL_VOID_BREATHING;
        m.mantraArchetype = archId;
        m.mantraSpec = spec;
      };
      if (JD.TECH && Array.isArray(JD.TECH.mantras)) {
        JD.TECH.mantras.forEach(enrich);
      }
      if (JD.TECH && Array.isArray(JD.TECH.techniques)) {
        JD.TECH.techniques.forEach(t => {
          if (t && (/_MANTRA$/.test(t.cat || '') || t.cat === 'INNER_KUNGFU' || t.subType === 'MANTRA')) {
            enrich(t);
          }
        });
      }
      if (JD.MARTIAL && Array.isArray(JD.MARTIAL.techniques)) {
        JD.MARTIAL.techniques.forEach(t => {
          if (t && (/_MANTRA$/.test(t.cat || '') || t.cat === 'INNER_KUNGFU' || t.subType === 'MANTRA')) {
            enrich(t);
          }
        });
      }
    },

    ensureState(n) {
      if (!n) return null;
      if (!n.mantraState || typeof n.mantraState !== 'object') {
        n.mantraState = {
          stance: 'HARMONIOUS_CIRCULATION',
          resonanceStacks: 0,
          totalAutonomousGain: 0,
          totalAuraHeals: 0,
          totalCombatProcs: 0,
          lastResonanceTick: -999
        };
      }
      return n.mantraState;
    },

    resolveNpcMantra(W, n) {
      if (!n || !n.cult) return null;
      const c = n.cult;
      const st = n.mantraState || null;
      const stanceId = (st && st.stance && this.STANCES[st.stance]) ? st.stance : 'HARMONIOUS_CIRCULATION';
      const wKind = (W && W.weather && (W.weather.kind || W.weather)) || 'clear';
      const fwActive = !!(W && W.sect && W.sect.formationWarfare && W.sect.formationWarfare.activeStance === 'FIVE_ELEMENT_NURTURE');
      const mrc = n._mantraResCache;
      if (mrc && mrc.ver === n._ver && mrc.mantra === c.mantra && mrc.tl === (c.techs ? c.techs.length : 0) && mrc.hasSt === !!st && mrc.stance === stanceId && mrc.w === wKind && mrc.fw === fwActive) {
        return mrc.val;
      }
      let m = c.mantra ? TECH_BY_ID[c.mantra] : null;
      if (!m && Array.isArray(c.techs)) {
        for (let i = 0; i < c.techs.length; i++) {
          const cand = TECH_BY_ID[c.techs[i]];
          if (cand && cand.mantraArchetype) { m = cand; break; }
        }
      }
      const archId = (m && m.mantraArchetype) || this.classifyMantraArchetype(m || { path: c.path });
      const spec = this.ARCHETYPES[archId] || this.ARCHETYPES.ASTRAL_VOID_BREATHING;
      const stanceSpec = this.STANCES[stanceId];
      const weatherResonanceActive = Array.isArray(spec.favoredWeathers) && spec.favoredWeathers.includes(wKind);
      const weatherMult = weatherResonanceActive ? (1 + (spec.weatherBonusPct || 0.20)) : 1.0;

      // Grand Formation WarfareFIVE_ELEMENT_NURTURE bonus
      const fw = W && W.sect && W.sect.formationWarfare;
      const formationNurtureMult = (fw && fw.activeStance === 'FIVE_ELEMENT_NURTURE') ? 1.20 : 1.0;

      // Only apply stance deviation from 1.0 when n.mantraState is explicitly active, keeping legacy baseline tests exact
      const activeStanceMult = st ? stanceSpec.cultMult : 1.0;
      const effectiveCultMult = +(activeStanceMult * (st ? weatherMult : 1.0) * formationNurtureMult).toFixed(3);

      const resObjM = {
        mantraId: m ? m.id : null,
        mantraNameTh: m ? m.nameTh : ('คัมภีร์ปราณพื้นฐานสาย' + (CULT.PATHS[c.path]?.shortTh || c.path)),
        mantraTier: m ? (m.tier || 1) : 1,
        archetypeId: archId,
        spec,
        stanceId,
        stanceSpec,
        weatherKind: wKind,
        weatherResonanceActive,
        effectiveCultMult,
        autonomousWalkRatio: +(spec.autonomousWalkRatio * (stanceId === 'OVERDRIVE_COMBUSTION' ? 1.5 : 1.0)).toFixed(3),
        qinggongSpeedBonus: spec.qinggongSpeedBonus || 0,
        qinggongQiCostMult: spec.qinggongQiCostMult || 1.0,
        swordFlightSpeedBonus: spec.swordFlightSpeedBonus || 0,
        swordFlightQiCostMult: spec.swordFlightQiCostMult || 1.0
      };
      n._mantraResCache = { ver: n._ver, mantra: c.mantra, tl: c.techs ? c.techs.length : 0, hasSt: !!st, stance: stanceId, w: wKind, fw: fwActive, val: resObjM };
      return resObjM;
    },

    setMantraStance(W, n, stanceId) {
      if (!n || !n.cult || !this.STANCES[stanceId]) return null;
      const st = this.ensureState(n);
      st.stance = stanceId;
      n._cultRateBase = null;
      n._qgUnlockCache = null;
      n._wsBase = null;
      n._kwCache = null;
      return this.resolveNpcMantra(W, n);
    },

    stepMeditationResonance(W, n) {
      if (!n || !n.cult || !n.h || !n.h.state) return null;
      const st = n.mantraState || null;
      const mr = this.resolveNpcMantra(W, n);
      if (!mr) return null;
      const s = n.h.state, c = n.cult, spec = mr.spec, stance = mr.stanceSpec;

      // Apply stance meditation effects when mantraState is active
      if (st) {
        if (stance.toxicDeltaPerTick) {
          c.toxic = Math.max(0, Math.min(200, (c.toxic || 0) + stance.toxicDeltaPerTick));
        }
        if (stance.heartDemonDeltaPerTick) {
          const hdMod = spec.id === 'ABYSSAL_FROST_MIRROR' && stance.heartDemonDeltaPerTick > 0
            ? stance.heartDemonDeltaPerTick * 0.6
            : stance.heartDemonDeltaPerTick;
          s.heartDemon = clamp((s.heartDemon || 0) + hdMod, 0, 100);
        }
        if (stance.energyDrainPerTick > 0) {
          s.energy = Math.max(0, (s.energy || 50) - stance.energyDrainPerTick);
        }
        st.resonanceStacks = Math.min(100, (st.resonanceStacks || 0) + 1);
        st.lastResonanceTick = (W && W.t) || 0;
      }

      // Evergreen Longevity Spring self-healing during meditation
      if (spec.id === 'EVERGREEN_LONGEVITY_SPRING' && st) {
        const hm = CULT.hpMax(n);
        if (s.hp < hm) s.hp = Math.min(hm, s.hp + Math.max(0.5, hm * 0.008));
      }

      // Group Meditation Resonance Circle (6-tile radius sect-mate support when mantraState is active)
      if (st && W && Array.isArray(W.npcs) && ((W._isNewCalendarMinute !== false && W.t % 10 === 0))) {
        const rad = spec.sectAuraRadius || 6.0;
        for (let i = 0; i < W.npcs.length; i++) {
          const ally = W.npcs[i];
          if (!ally || ally.dead || ally.away || ally.id === n.id || !ally.h || !ally.h.state) continue;
          const dist = Math.hypot((ally.x || 0) - (n.x || 0), (ally.y || 0) - (n.y || 0));
          if (dist <= rad) {
            if (spec.id === 'EVERGREEN_LONGEVITY_SPRING') {
              const ahm = CULT.hpMax(ally);
              if (ally.h.state.hp < ahm) ally.h.state.hp = Math.min(ahm, ally.h.state.hp + Math.max(1, ahm * 0.02));
              st.totalAuraHeals = (st.totalAuraHeals || 0) + 1;
            } else if (spec.id === 'ABYSSAL_FROST_MIRROR') {
              ally.h.state.stress = Math.max(0, (ally.h.state.stress || 0) - 0.35);
              ally.h.state.heartDemon = Math.max(0, (ally.h.state.heartDemon || 0) - 0.25);
            } else if (spec.id === 'ASTRAL_VOID_BREATHING' && ally.cult) {
              const aqm = CULT.qiMax(ally);
              ally.h.state.qi = Math.min(aqm, (ally.h.state.qi || 0) + 1.2);
            } else if (spec.id === 'PRIMORDIAL_YANG_FURNACE' && ally.cult) {
              CULT.gain(ally, 0.04);
            }
          }
        }
      }
      return mr;
    },

    stepAutonomousBreathing(W, n, distMoved) {
      if (!n || !n.cult || !n.mantraState) return null;
      const mr = this.resolveNpcMantra(W, n);
      if (!mr) return null;
      const st = n.mantraState;
      const s = (n.h && n.h.state) || n.state;
      const stressPen = (s && s.stress > 70) ? 0.5 : 1.0;
      const wTick = (W && typeof W.t === 'number') ? W.t : -1;
      const awbLen = n.buffs ? n.buffs.length : 0, awPill = n.cult.pillT > 0 ? 1 : 0;
      let baseRate;
      if (wTick >= 0 && n._autoWalkRateC && wTick - n._autoWalkRateC.t < 15 && n._autoWalkRateC.ver === n._ver && n._autoWalkRateC.bLen === awbLen && n._autoWalkRateC.pill === awPill) {
        baseRate = n._autoWalkRateC.r;
      } else {
        baseRate = CULT.rate(n, 1);
        if (wTick >= 0) n._autoWalkRateC = { t: wTick, ver: n._ver, bLen: awbLen, pill: awPill, r: baseRate };
      }
      const autoGain = +((baseRate / 60) * mr.autonomousWalkRatio * stressPen * Math.min(1.2, Math.max(0.4, distMoved))).toFixed(4);
      if (autoGain > 0) {
        CULT.gain(n, autoGain, W, 'auto_walk');
        st.totalAutonomousGain = +((st.totalAutonomousGain || 0) + autoGain).toFixed(2);
      }
      if (mr.spec.autonomousQiRegenPerTick && s) {
        const qm = (n._nd && n._nd.qiMax) ? n._nd.qiMax : CULT.qiMax(n);
        s.qi = Math.min(qm, (s.qi || 0) + mr.spec.autonomousQiRegenPerTick * stressPen);
      }
      return mr;
    }
  };
  CULT.MANTRA_SYSTEM.initCatalog();

  /* ===== PATCH v5.6.0: DEFENSIVE KUNGFU & PROTECTIVE AEGIS OVERHAUL (ระบบวิชาคุ้มกายและปราณเกราะพิทักษ์ 6 เอกลักษณ์) ===== */
  CULT.DEFENSIVE_ARTS = {
    ARCHETYPE_ORDER: [
      'CELESTIAL_AEGIS_DOME',
      'MIRAGE_CICADA_SHELL',
      'TAIJI_SOFT_REDIRECTION',
      'SWORD_CURTAIN_WARD',
      'ELEMENTAL_THORN_ARMOR',
      'IRON_VAJRA_CARAPACE'
    ],
    ARCHETYPES: {
      IRON_VAJRA_CARAPACE: {
        id: 'IRON_VAJRA_CARAPACE',
        rankOrder: 1,
        icon: '🛡️',
        nameTh: 'กายาเหล็กไหลระฆังทอง (硬功铁布衫)',
        shortTh: 'กายาเหล็กไหล',
        color: '#ffd166',
        secondaryColor: '#f4a261',
        dmgRedPct: 0.26,
        counterPct: 0.08,
        redirectPct: 0,
        poiseBonusPct: 0.45,
        workInjuryRedPct: 0.65,
        qiPerHit: 0.15,
        minQiPct: 0.08,
        prosTh: 'ลดความเสียหายที่ได้รับลง -26%, เสริมเกราะทรงตัวขณะร่ายวิชา +45%, และป้องกันอุบัติเหตุบาดเจ็บจากการหลอม/ขุดแร่/ฝึกหนักในสำนักได้ถึง 65%',
        consTh: 'ท่าร่างหนักแน่นดุจภูผา ทำให้ความพริ้วไหวหลบหลีกพื้นฐานลดลงเล็กน้อย (-6%)'
      },
      ELEMENTAL_THORN_ARMOR: {
        id: 'ELEMENTAL_THORN_ARMOR',
        rankOrder: 2,
        icon: '🔥',
        nameTh: 'เกราะหนามเบญจธาตุผลาญศึก (五行荆棘罡气)',
        shortTh: 'เกราะหนามเบญจธาตุ',
        color: '#ff6b35',
        secondaryColor: '#7209b7',
        dmgRedPct: 0.20,
        counterPct: 0.15,
        redirectPct: 0,
        weatherImmunity: true,
        workInjuryRedPct: 0.35,
        qiPerHit: 0.25,
        minQiPct: 0.12,
        prosTh: 'ควบแน่นปราณธาตุเป็นเกราะหนามรอบกาย ลดดาเมจ -20%, สะท้อนปราณธาตุเผาผลาญผู้โจมตี 15%, และป้องกันผลกระทบจากพายุฝน/หิมะในพื้นที่สำนัก',
        consTh: 'ใช้ปราณหล่อเลี้ยงหนามธาตุต่อเนื่องเมื่อถูกโจมตี (0.25 ปราณ/ครั้ง)'
      },
      SWORD_CURTAIN_WARD: {
        id: 'SWORD_CURTAIN_WARD',
        rankOrder: 3,
        icon: '🗡️',
        nameTh: 'ม่านกระบี่ไร้ช่องโหว่ (剑幕护身)',
        shortTh: 'ม่านกระบี่คุ้มกาย',
        color: '#00f5d4',
        secondaryColor: '#90e0ef',
        dmgRedPct: 0.19,
        counterPct: 0.16,
        redirectPct: 0,
        patrolBonusPct: 0.25,
        workInjuryRedPct: 0.30,
        qiPerHit: 0.32,
        minQiPct: 0.14,
        prosTh: 'หมุนวนปราณศาสตราเป็นม่านคุ้มกันรอบตัว ลดความเสียหาย -19%, ฟันสวนกลับศัตรูในระยะประชิดอัตโนมัติ 16%, และเพิ่มประสิทธิภาพการเดินเวรยามรักษาความปลอดภัยสำนัก +25%',
        consTh: 'ผลาญปราณค่อนข้างสูงเมื่อต้องปัดป้องการโจมตีถี่ๆ (0.32 ปราณ/ครั้ง)'
      },
      TAIJI_SOFT_REDIRECTION: {
        id: 'TAIJI_SOFT_REDIRECTION',
        rankOrder: 4,
        icon: '☯️',
        nameTh: 'ปราณอ่อนสยบแข็งยืมแรงสะท้อน (斗转星移 / 太极卸力)',
        shortTh: 'ยืมแรงสะท้อนกลับ',
        color: '#48cae4',
        secondaryColor: '#e0fbfc',
        dmgRedPct: 0.18,
        counterPct: 0,
        redirectPct: 0.24,
        qiRestoreOnHit: 5,
        workInjuryRedPct: 0.40,
        qiPerHit: 0.18,
        minQiPct: 0.10,
        prosTh: 'ใช้ความอ่อนสยบความแข็ง สลายแรงปะทะ -18%, ยืมแรงศัตรูสะท้อนกลับไปหาผู้โจมตี 24% (借力打力) พร้อมแปรเปลี่ยนแรงกระแทกเป็นปราณฟื้นฟู +5 แต้มต่อครั้ง!',
        consTh: 'ต้องใช้สมาธิและความสงบเยือกเย็นสูง หากความเครียดเกิน 75 ประสิทธิภาพการยืมแรงสะท้อนจะลดลงครึ่งหนึ่ง'
      },
      MIRAGE_CICADA_SHELL: {
        id: 'MIRAGE_CICADA_SHELL',
        rankOrder: 5,
        icon: '🦋',
        nameTh: 'เกราะจักจั่นลอกคราบเร้นเงา (金蝉脱壳)',
        shortTh: 'จักจั่นลอกคราบ',
        color: '#c77dff',
        secondaryColor: '#e0aaff',
        dmgRedPct: 0.16,
        counterPct: 0.06,
        redirectPct: 0,
        dodgeBonusPct: 0.18,
        cicadaMoltHealPct: 0.22,
        workInjuryRedPct: 0.50,
        qiPerHit: 0.24,
        minQiPct: 0.12,
        prosTh: 'ม่านไหมเงามายาเพิ่มอัตราหลบหลีก +18%, ลดดาเมจ -16%, และมีเคล็ดลับ「จักจั่นลอกคราบ」ทำงานอัตโนมัติ 1 ครั้งต่อศึกเมื่อเลือดต่ำกว่า 25% (สลัดร่างเงารับคมดาบแทนและฟื้นฟูเลือด 22% ทันที!)',
        consTh: 'เกราะปราณบางกว่าสายกายาเหล็กไหล หากเคล็ดลอกคราบทำงานไปแล้วต้องอาศัยการหลบหลีกเป็นหลัก'
      },
      CELESTIAL_AEGIS_DOME: {
        id: 'CELESTIAL_AEGIS_DOME',
        rankOrder: 6,
        icon: '👑',
        nameTh: 'ปราณม่านสวรรค์พิทักษ์หมู่ (仙家天罡护体罩)',
        shortTh: 'ม่านสวรรค์พิทักษ์หมู่',
        color: '#72efdd',
        secondaryColor: '#ffd166',
        dmgRedPct: 0.24,
        counterPct: 0.12,
        redirectPct: 0.10,
        allyInterceptPct: 0.22,
        allyInterceptRadius: 5.5,
        workInjuryRedPct: 0.70,
        qiPerHit: 0.38,
        minQiPct: 0.20,
        prosTh: 'สุดยอดปราณคุ้มกายระดับสูง กางโดมม่านสวรรค์ลดดาเมจตัวเอง -24% และแผ่ม่านปราณ「รับเคราะห์แทนสหายร่วมรบ」ในระยะ 5.5 ช่อง (แบ่งรับดาเมจแทนเพื่อนที่บาดเจ็บ 22% และลดทอนลงครึ่งหนึ่ง!)',
        consTh: 'ต้องใช้ปราณสำรองอย่างน้อย 20% เพื่อคงสภาพม่านสวรรค์พิทักษ์หมู่'
      }
    },

    POSTURES: {
      PASSIVE_AURA_GUARD: {
        id: 'PASSIVE_AURA_GUARD',
        icon: '🛡️',
        nameTh: 'คุ้มกายอัตโนมัติประหยัดปราณ (护体常驻)',
        shortTh: 'คุ้มกายประหยัดปราณ',
        dmgRedMult: 1.00,
        counterMult: 0.85,
        qiCostMult: 0.50,
        speedMult: 1.00,
        forceAllyIntercept: false,
        descTh: 'คงชั้นปราณคุ้มกายบางเบาไว้ตลอดเวลา ใช้ปราณเพียงครึ่งเดียวเมื่อรับคมดาบ และป้องกันอุบัติเหตุบาดเจ็บขณะทำงานในสำนัก'
      },
      COUNTER_PARRY_STANCE: {
        id: 'COUNTER_PARRY_STANCE',
        icon: '☯️',
        nameTh: 'ตั้งรับสวนกลับไร้ช่องโหว่ (借力反击)',
        shortTh: 'ตั้งรับสวนกลับ',
        dmgRedMult: 1.15,
        counterMult: 1.35,
        qiCostMult: 1.00,
        speedMult: 1.00,
        forceAllyIntercept: false,
        descTh: 'เร่งปราณคุ้มกายเข้าสู่จังหวะพร้อมปัดป้องเต็มตัว เพิ่มการลดดาเมจ ×1.15 และเพิ่มอานุภาพการยืมแรงสะท้อน/ม่านกระบี่สวนกลับ ×1.35'
      },
      FORTRESS_BASTION_LOCK: {
        id: 'FORTRESS_BASTION_LOCK',
        icon: '🏯',
        nameTh: 'ปราการเพชรพิทักษ์สหาย (不动明王阵)',
        shortTh: 'ปราการเพชรคุ้มสหาย',
        dmgRedMult: 1.35,
        counterMult: 1.15,
        qiCostMult: 1.25,
        speedMult: 0.88,
        forceAllyIntercept: true,
        descTh: 'ตรึงรากฐานปราณคุ้มกายดุจขุนเขา เพิ่มการลดดาเมจสูงสุด ×1.35 และเปิดใช้งานการกางม่านปราณรับดาเมจแทนสหายในระยะ 5.5 ช่อง (แลกกับความเร็วเคลื่อนที่ลดลง 12%)'
      }
    },

    SIGNATURE_MANUALS: [
      {
        id: 'DEF_IRON_SHIRT_VAJRA_T1',
        nameTh: 'วิชาคุ้มกายเสื้อเหล็กไหลระฆังทอง',
        path: 'BODY',
        cat: 'DEFENSIVE_TECHNIQUE',
        tier: 1,
        power: 24,
        qiCost: 8,
        cooldown: 3,
        element: 'EARTH_METAL',
        defensiveArchetype: 'IRON_VAJRA_CARAPACE',
        descTh: 'ฝึกฝนผิวหนังและกล้ามเนื้อให้แกร่งดุจเหล็กไหล ป้องกันคมศาสตราและอุบัติเหตุจากการหลอมตีเหล็ก'
      },
      {
        id: 'DEF_MYRIAD_SWORD_CURTAIN_T3',
        nameTh: 'วิชาคุ้มกายม่านกระบี่หมื่นบุปผา',
        path: 'XIAN',
        cat: 'DEFENSIVE_TECHNIQUE',
        tier: 3,
        power: 52,
        qiCost: 14,
        cooldown: 4,
        element: 'EARTH_METAL',
        defensiveArchetype: 'SWORD_CURTAIN_WARD',
        descTh: 'หมุนวนปราณกระบี่รอบกายดุจม่านน้ำตก ปัดป้องลูกศรและฟันสวนศัตรูที่ก้าวเข้ามาในระยะประชิด'
      },
      {
        id: 'DEF_TAIJI_STAR_SHIFT_T3',
        nameTh: 'วิชาคุ้มกายเคลื่อนดาราผ่อนแรงสะท้อน',
        path: 'XIAN',
        cat: 'DEFENSIVE_TECHNIQUE',
        tier: 3,
        power: 58,
        qiCost: 14,
        cooldown: 4,
        element: 'WATER_ICE',
        defensiveArchetype: 'TAIJI_SOFT_REDIRECTION',
        descTh: 'เคล็ดวิชาปราณวงกลมหยินหยาง ยืมแรงโจมตีของศัตรูสะท้อนกลับคืนสู่เจ้าของพร้อมดูดซับแรงปะทะมาฟื้นฟูปราณ'
      },
      {
        id: 'DEF_FIVE_ELEMENT_THORN_T4',
        nameTh: 'วิชาคุ้มกายเกราะหนามเบญจธาตุ',
        path: 'BODY',
        cat: 'DEFENSIVE_TECHNIQUE',
        tier: 4,
        power: 76,
        qiCost: 18,
        cooldown: 4,
        element: 'FIRE',
        defensiveArchetype: 'ELEMENTAL_THORN_ARMOR',
        descTh: 'ควบแน่นปราณห้าธาตุเป็นหนามแหลมคมห่อหุ้มกาย แผดเผาและทิ่มแทงศัตรูทุกคนที่กล้าลงมือโจมตี'
      },
      {
        id: 'DEF_GOLDEN_CICADA_MOLT_T5',
        nameTh: 'วิชาคุ้มกายจักจั่นทองลอกคราบเร้นเงา',
        path: 'DEMON',
        cat: 'DEFENSIVE_TECHNIQUE',
        tier: 5,
        power: 98,
        qiCost: 20,
        cooldown: 5,
        element: 'YIN_SHADOW',
        defensiveArchetype: 'MIRAGE_CICADA_SHELL',
        descTh: 'เคล็ดวิชาเร้นกายขั้นสูง เมื่อเผชิญการโจมตีปางตายจะสลัดคราบร่างเงารับเคราะห์แทนและฟื้นฟูชีพจรทันที'
      },
      {
        id: 'DEF_IMMORTAL_HEAVEN_AEGIS_T6',
        nameTh: 'มหาวิชาคุ้มกายม่านสวรรค์เทียนกังพิทักษ์หมู่',
        path: 'XIAN',
        cat: 'DEFENSIVE_TECHNIQUE',
        tier: 6,
        power: 132,
        qiCost: 24,
        cooldown: 5,
        element: 'LIGHT_YANG',
        defensiveArchetype: 'CELESTIAL_AEGIS_DOME',
        descTh: 'กางโดมม่านปราณสวรรค์เทียนกังคุ้มครองทั้งตนเองและสหายร่วมรบในรัศมี 5.5 ช่อง แบ่งรับความเสียหายแทนศิษย์ที่บาดเจ็บ'
      }
    ],

    classifyDefensiveTech(t) {
      if (!t) return null;
      if (t.defensiveArchetype && this.ARCHETYPES[t.defensiveArchetype]) return t.defensiveArchetype;
      const id = String(t.id || '');
      const name = String(t.nameTh || '');
      const path = String(t.path || '');
      const tier = Number(t.tier) || 1;
      const el = String(t.element || '');

      if (id === 'DEF_IMMORTAL_HEAVEN_AEGIS_T6' || /ค่ายกลหนุนสหาย|คุ้มทัพ|คุ้มค่าย|พิทักษ์สำนัก|มหาปณิธานคุ้มภพ|ค้ำจุนหกภพ/.test(name) || (tier >= 5 && (path === 'SAGE_SUPPORT' || path === 'ARRAY_TALISMAN' || path === 'STRATEGY_GOVERNANCE'))) {
        return 'CELESTIAL_AEGIS_DOME';
      }
      if (id === 'DEF_GOLDEN_CICADA_MOLT_T5' || id === 'INNATE_SOUL_VESSEL_LINK' || /กายว่างรับเคราะห์|เร้นเงา|มายา|ซ่อนพิษ|ศรเงา|สุญตา/.test(name) || path === 'DEMON' || el === 'YIN_SHADOW') {
        return 'MIRAGE_CICADA_SHELL';
      }
      if (id === 'DEF_TAIJI_STAR_SHIFT_T3' || id === 'MP_SWORD_FLOWING_PARRY_T2' || id === 'INNATE_REVERSED_RETRIBUTION_MIRROR' || id === 'ART_KARMA_SAMSARA_006' || /ผ่อนแรง|กระจก|สะท้อน|คืนวิบาก|วัฏสงสาร|สมาธิเซน/.test(name) || path === 'KARMA_SAMSARA') {
        return 'TAIJI_SOFT_REDIRECTION';
      }
      if (id === 'DEF_MYRIAD_SWORD_CURTAIN_T3' || id === 'MP_BLADE_PARRY_STANCE_T3' || id === 'MP_SPEAR_PHALANX_WALL_T4' || id === 'MP_STAFF_IRON_REVOLVE_T2' || /กระบี่|ดาบ|ทวน|พลองหมุนวน|ปัดป้องคม/.test(name)) {
        return 'SWORD_CURTAIN_WARD';
      }
      if (id === 'DEF_FIVE_ELEMENT_THORN_T4' || el === 'FIRE' || el === 'LIGHTNING' || el === 'BLOOD_DEMON' || /เพลิง|สายฟ้า|อัสนี|หลอม|โลหิต/.test(name)) {
        return 'ELEMENTAL_THORN_ARMOR';
      }
      if (t.cat === 'DEFENSIVE_TECHNIQUE' || t.subType === 'GUARD_PARRY_COUNTER' || (t.role === 'COMBAT_DEFENSE' && /เกราะ|ระฆัง|โล่|ปราการ|คุ้มกาย|ตั้งรับ|สะท้อน|ปัดป้อง|วัชระ/.test(name))) {
        return 'IRON_VAJRA_CARAPACE';
      }
      return null;
    },

    initCatalog() {
      // 1. Register 6 signature manuals in TECH_BY_ID (preserving JD.MARTIAL.techniques & JD.TECH.techniques counts)
      this.SIGNATURE_MANUALS.forEach(spec => {
        const fullTech = Object.assign({
          stages: [
            { stage: 1, nameTh: 'ขั้นต้น', mult: 1.0 },
            { stage: 2, nameTh: 'ขั้นเชี่ยวชาญ', mult: 1.2 },
            { stage: 3, nameTh: 'ขั้นบรรลุ', mult: 1.4 }
          ],
          defensiveSpec: this.ARCHETYPES[spec.defensiveArchetype]
        }, spec);
        TECH_BY_ID[fullTech.id] = fullTech;
      });

      // 2. Enrich all existing DEFENSIVE_TECHNIQUE and COMBAT_DEFENSE shield/bell/armor entries in JD.TECH and JD.MARTIAL (preserving t.cat counts)
      const enrichList = list => {
        if (!Array.isArray(list)) return;
        list.forEach(t => {
          if (!t || (t.cat !== 'DEFENSIVE_TECHNIQUE' && !(t.role === 'COMBAT_DEFENSE' && /เกราะ|ระฆัง|โล่|ปราการ|คุ้มกาย|ตั้งรับ|สะท้อน|ปัดป้อง|วัชระ/.test(t.nameTh || '')))) return;
          const archId = this.classifyDefensiveTech(t);
          if (archId && this.ARCHETYPES[archId]) {
            t.defensiveArchetype = archId;
            t.defensiveSpec = this.ARCHETYPES[archId];
          }
        });
      };
      if (JD.TECH) enrichList(JD.TECH.techniques);
      if (JD.MARTIAL) enrichList(JD.MARTIAL.techniques);
    },

    ensureState(n) {
      if (!n) return null;
      if (!n.defensiveArtState || typeof n.defensiveArtState !== 'object') {
        n.defensiveArtState = {
          posture: 'COUNTER_PARRY_STANCE',
          preferredArchetype: 'AUTO',
          cicadaMoltUsedFightId: -1,
          totalDamageMitigated: 0,
          totalDamageRedirected: 0,
          totalAllyIntercepts: 0,
          totalWorkInjuriesPrevented: 0
        };
      }
      return n.defensiveArtState;
    },

    unlockedArchetypes(n) {
      const set = new Set(['IRON_VAJRA_CARAPACE']);
      if (!n || !n.cult) return Array.from(set);
      const stg = CULT.equivalentStage ? CULT.equivalentStage(n) : (n.cult.stage || 1);
      const path = n.cult.path || '';

      if (stg >= 2 && (path === 'XIAN' || path === 'KARMA_SAMSARA' || path === 'HEART_SOUL')) set.add('TAIJI_SOFT_REDIRECTION');
      if (stg >= 2 && (path === 'XIAN' || path === 'BODY')) set.add('SWORD_CURTAIN_WARD');
      if (stg >= 3 && (path === 'BODY' || path === 'GOD' || path === 'CRAFT_CREATION')) set.add('ELEMENTAL_THORN_ARMOR');
      if (stg >= 4 && (path === 'DEMON' || path === 'MECH_PUPPET' || path === 'HEART_SOUL')) set.add('MIRAGE_CICADA_SHELL');
      if (stg >= 5) {
        set.add('CELESTIAL_AEGIS_DOME');
        set.add('MIRAGE_CICADA_SHELL');
        set.add('TAIJI_SOFT_REDIRECTION');
        set.add('SWORD_CURTAIN_WARD');
        set.add('ELEMENTAL_THORN_ARMOR');
      }

      const techs = Array.isArray(n.cult.techs) ? n.cult.techs : [];
      for (let i = 0; i < techs.length; i++) {
        const t = TECH_BY_ID[techs[i]];
        if (!t) continue;
        const archId = t.defensiveArchetype || (t.cat === 'DEFENSIVE_TECHNIQUE' ? this.classifyDefensiveTech(t) : null);
        if (archId && this.ARCHETYPES[archId]) set.add(archId);
      }
      return this.ARCHETYPE_ORDER.filter(a => set.has(a));
    },

    resolveNpcDefense(W, n) {
      if (!n || !n.cult) return null;
      const st = n.defensiveArtState || null;
      const sObj0 = (n.h && n.h.state) || n.state || null;
      const isZeroQi0 = !!(n.cult && n.cult.path === 'SHADOW_SAMURAI');
      const qMax0 = isZeroQi0 ? 100 : Math.max(1, CULT.qiMax(n));
      const curQi0 = isZeroQi0 ? Math.max(0, (sObj0 && Number.isFinite(sObj0.energy)) ? sObj0.energy : 80) : Math.max(0, (sObj0 && Number.isFinite(sObj0.qi)) ? sObj0.qi : qMax0);
      const qiHigh = (curQi0 / qMax0) >= 0.15;
      const stressHigh = !!(sObj0 && sObj0.stress > 75);
      const prefArch0 = (st && st.preferredArchetype) || 'AUTO';
      const postureId0 = (st && st.posture && this.POSTURES[st.posture]) ? st.posture : 'COUNTER_PARRY_STANCE';
      const drc = n._defResCache;
      if (drc && drc.ver === n._ver && drc.tl === (n.cult.techs ? n.cult.techs.length : 0) && drc.pref === prefArch0 && drc.post === postureId0 && drc.qh === qiHigh && drc.sh === stressHigh) {
        return drc.val;
      }
      const unlocked = this.unlockedArchetypes(n);
      const prefArch = (st && st.preferredArchetype) || 'AUTO';
      const PATH_PREF_DEF = { SHADOW_SAMURAI: 'SWORD_CURTAIN_WARD', NINPO_SHADOW: 'MIRAGE_CICADA_SHELL', NINPO_ELEMENTAL: 'MIRAGE_CICADA_SHELL', VOID_SPACE: 'MIRAGE_CICADA_SHELL', CHRONO_EPOCH: 'MIRAGE_CICADA_SHELL', FORTUNE_GAMBLER: 'MIRAGE_CICADA_SHELL', BUDDHA_DHARMA: 'TAIJI_SOFT_REDIRECTION', TIDE_VOYAGER: 'TAIJI_SOFT_REDIRECTION', LORE_ARCHIVIST: 'TAIJI_SOFT_REDIRECTION', SPIRIT_HUSBANDRY: 'TAIJI_SOFT_REDIRECTION', WANDERING_DAO: 'TAIJI_SOFT_REDIRECTION', DIVINE_POSSESSION: 'IRON_VAJRA_CARAPACE', OCCULT_MAGE: 'IRON_VAJRA_CARAPACE', ARENA_GLORY: 'IRON_VAJRA_CARAPACE', GRAVITY_DAO: 'IRON_VAJRA_CARAPACE', DRAGON_VEIN_GEOMANCY: 'IRON_VAJRA_CARAPACE', DEVOURING_FLESH: 'ELEMENTAL_THORN_ARMOR', VENOM_GU: 'ELEMENTAL_THORN_ARMOR', PRIMORDIAL_SHIFTER: 'ELEMENTAL_THORN_ARMOR', VOID_HERETIC_PACT: 'ELEMENTAL_THORN_ARMOR', NETHER_GRAVE: 'ELEMENTAL_THORN_ARMOR', DIVINE_CHANNELER: 'SWORD_CURTAIN_WARD' };
      const autoDef = (n.cult && PATH_PREF_DEF[n.cult.path] && unlocked.includes(PATH_PREF_DEF[n.cult.path])) ? PATH_PREF_DEF[n.cult.path] : (unlocked[0] || 'IRON_VAJRA_CARAPACE');
      const archId = (prefArch !== 'AUTO' && unlocked.includes(prefArch)) ? prefArch : autoDef;
      const spec = this.ARCHETYPES[archId] || this.ARCHETYPES.IRON_VAJRA_CARAPACE;

      const postureId = (st && st.posture && this.POSTURES[st.posture]) ? st.posture : 'COUNTER_PARRY_STANCE';
      const postureSpec = this.POSTURES[postureId];

      // Find best learned defensive technique name if any
      let learnedTech = null;
      const techs = Array.isArray(n.cult.techs) ? n.cult.techs : [];
      for (let i = 0; i < techs.length; i++) {
        const t = TECH_BY_ID[techs[i]];
        if (t && (t.defensiveArchetype === archId || t.cat === 'DEFENSIVE_TECHNIQUE')) {
          if (!learnedTech || (t.tier || 1) > (learnedTech.tier || 1)) learnedTech = t;
        }
      }

      const sObj = (n.h && n.h.state) || n.state || null;
      const isZeroQi = !!(n.cult && n.cult.path === 'SHADOW_SAMURAI');
      const qMax = isZeroQi ? 100 : Math.max(1, CULT.qiMax(n));
      const curQi = isZeroQi ? Math.max(0, (sObj && Number.isFinite(sObj.energy)) ? sObj.energy : 80) : Math.max(0, (sObj && Number.isFinite(sObj.qi)) ? sObj.qi : qMax);
      const qiRatio = curQi / qMax;
      const qiSufficient = qiRatio >= (spec.minQiPct || 0.10);

      const effDmgRedPct = qiSufficient ? +(Math.min(0.55, spec.dmgRedPct * postureSpec.dmgRedMult)).toFixed(3) : +(spec.dmgRedPct * 0.4).toFixed(3);
      const stressPen = (sObj && sObj.stress > 75 && archId === 'TAIJI_SOFT_REDIRECTION') ? 0.5 : 1.0;
      const effRedirectPct = qiSufficient ? +(spec.redirectPct * postureSpec.counterMult * stressPen).toFixed(3) : 0;
      const effCounterPct = qiSufficient ? +(spec.counterPct * postureSpec.counterMult).toFixed(3) : 0;
      const allyInterceptActive = qiSufficient && (archId === 'CELESTIAL_AEGIS_DOME' || postureSpec.forceAllyIntercept);

      const resDef = {
        archetypeId: archId,
        spec,
        postureId,
        postureSpec,
        unlockedArchetypes: unlocked,
        techNameTh: learnedTech ? learnedTech.nameTh : spec.nameTh,
        qiSufficient,
        effDmgRedPct,
        effRedirectPct,
        effCounterPct,
        allyInterceptActive,
        allyInterceptPct: allyInterceptActive ? (spec.allyInterceptPct || 0.20) : 0,
        allyInterceptRadius: spec.allyInterceptRadius || 5.5,
        qiPerHit: +(spec.qiPerHit * postureSpec.qiCostMult).toFixed(3),
        workInjuryRedPct: spec.workInjuryRedPct || 0.35
      };
      n._defResCache = { ver: n._ver, tl: n.cult.techs ? n.cult.techs.length : 0, pref: prefArch0, post: postureId0, qh: qiHigh, sh: stressHigh, val: resDef };
      return resDef;
    },

    setDefensivePosture(W, n, postureId, preferredArchetype) {
      if (!n || !n.cult) return null;
      if (W) W._hasActiveDefSupportAura = true;
      const st = this.ensureState(n);
      if (postureId && this.POSTURES[postureId]) st.posture = postureId;
      if (preferredArchetype && (preferredArchetype === 'AUTO' || this.ARCHETYPES[preferredArchetype])) {
        st.preferredArchetype = preferredArchetype;
      }
      n._wsBase = null;
      return this.resolveNpcDefense(W, n);
    }
  };
  CULT.DEFENSIVE_ARTS.initCatalog();

  /* ===== PATCH v5.7.0: SUPPORT & AUXILIARY ARTS OVERHAUL (ระบบวิชาสายสนับสนุน 44 วิชา และสายเสริม 53 วิชา ครบวงจร 5 เสาหลัก) ===== */
  CULT.SUPPORT_ARTS = {
    ARCHETYPE_ORDER: [
      'BODHI_CHANT_SANCTUARY',
      'DIVINATION_STAR_GUIDANCE',
      'QIMEN_BATTLE_BANNER',
      'ACUPOINT_MERIDIAN_THERAPY',
      'ALCHEMICAL_INCENSE_MIST',
      'CELESTIAL_ZITHER_MELODY'
    ],
    ARCHETYPES: {
      CELESTIAL_ZITHER_MELODY: {
        id: 'CELESTIAL_ZITHER_MELODY',
        rankOrder: 1,
        icon: '🎶',
        nameTh: 'คีตเวทย์พิณขลุ่ยหยกกล่อมขวัญสลายมาร (琴箫音律)',
        shortTh: 'คีตเวทย์พิณขลุ่ย',
        color: '#48cae4',
        secondaryColor: '#90e0ef',
        facilityId: 'tea',
        facilityNameTh: 'สวนชาวิญญาณ / หอทำสมาธิ',
        heartDemonCleansePerTick: 0.45,
        stressCleansePerTick: 0.60,
        breakthroughStabilityBonus: 0.12,
        combatAllyAtkBonusPct: 0.16,
        combatAllyHealPct: 0.04,
        auraRadius: 6.5,
        prosTh: 'คลื่นเสียงพิณและขลุ่ยหยกชะล้างจิตมาร (-0.45) และความเครียด (-0.60) ของศิษย์รอบข้าง ลดโอกาสธาตุไฟเข้าแทรกและเพิ่มโอกาสทะลวงด่านสำเร็จ +12%, ในศึกช่วยปลุกขวัญเพิ่มพลังโจมตีสหาย +16%',
        consTh: 'เน้นการประโลมจิตใจและหนุนสหาย ไม่มีอานุภาพทำลายล้างโดยตรงหากอยู่ลำพัง'
      },
      ALCHEMICAL_INCENSE_MIST: {
        id: 'ALCHEMICAL_INCENSE_MIST',
        rankOrder: 2,
        icon: '⚗️',
        nameTh: 'หมอกควันโอสถทิพย์และสำรับหยกบำรุงปราณ (丹香灵雾)',
        shortTh: 'หมอกควันโอสถทิพย์',
        color: '#52b788',
        secondaryColor: '#ffd166',
        facilityId: 'alchemy',
        facilityNameTh: 'หอโอสถ / โรงครัวทิพย์',
        craftEfficiencyBonusPct: 0.22,
        energyRestorePerTick: 0.55,
        satietyRestorePerTick: 0.40,
        combatAllyHealPct: 0.06,
        combatAllyQiRestorePct: 0.06,
        auraRadius: 6.0,
        prosTh: 'กระจายหมอกควันสมุนไพรทิพย์เร่งประสิทธิภาพการหลอมโอสถ/ตีเหล็ก/ปรุงอาหาร +22%, ฟื้นฟูแรงกายและปราณให้ศิษย์ในสำนัก, และฟื้นฟูเลือด/ปราณสหาย 6% ในศึก',
        consTh: 'รัศมีหมอกควันโอสถจะหนาแน่นที่สุดเมื่ออยู่ใกล้หอโอสถหรือรวมกลุ่มกัน'
      },
      ACUPOINT_MERIDIAN_THERAPY: {
        id: 'ACUPOINT_MERIDIAN_THERAPY',
        rankOrder: 3,
        icon: '🪡',
        nameTh: 'ดัชนีเข็มทองร้อยด้ายปราณทะลวงจุด (金针渡穴)',
        shortTh: 'เข็มทองทะลวงจุด',
        color: '#ffd166',
        secondaryColor: '#00f5d4',
        facilityId: 'infirmary',
        facilityNameTh: 'หอพยาบาล / เรือนหมอเทวดา',
        injuryHealSpeedBonusPct: 0.50,
        toxicCleansePerTick: 0.40,
        breakthroughStabilityBonus: 0.08,
        combatAllyHealPct: 0.14,
        combatPurgeDebuff: true,
        auraRadius: 6.0,
        prosTh: 'เร่งการรักษาอาการบาดเจ็บในหอพยาบาลเร็วขึ้น +50%, ขับพิษโอสถสะสม (-0.40) เพื่อให้ศิษย์กินโอสถบ่มเพาะต่อได้โดยไม่เกิดพิษตกค้าง, และสมานแผลสหายในศึกฉับพลัน +14% HP',
        consTh: 'ต้องใช้ความแม่นยำและปราณละเอียดอ่อนในการเดินเข็มทองร้อยด้ายปราณ'
      },
      QIMEN_BATTLE_BANNER: {
        id: 'QIMEN_BATTLE_BANNER',
        rankOrder: 4,
        icon: '🚩',
        nameTh: 'ค่ายกลธงรบฉีเหมินบัญชาทัพ (奇门阵旗)',
        shortTh: 'ธงรบฉีเหมินนำทัพ',
        color: '#ff6b35',
        secondaryColor: '#ffd166',
        facilityId: 'training_ground',
        facilityNameTh: 'ลานฝึกยุทธ์ / กองลาดตระเวน',
        patrolSecurityBonusPct: 0.30,
        drillEfficiencyBonusPct: 0.20,
        combatAllyAtkBonusPct: 0.20,
        combatAllyDefBonusPct: 0.15,
        expeditionHazardRed: 0.18,
        auraRadius: 6.5,
        prosTh: 'ปักธงค่ายกลฉีเหมินบัญชาทัพ เพิ่มพลังโจมตีสหายร่วมรบ +20% และป้องกัน +15%, เสริมความมั่นคงเวรยามสำนัก +30%, และลดความสูญเสียเมื่อออกเดินทางยุทธภพ -18%',
        consTh: 'เน้นการบัญชาการรบเป็นหมู่คณะ จะแสดงอานุภาพสูงสุดเมื่อมีสหายร่วมรบเคียงข้าง'
      },
      DIVINATION_STAR_GUIDANCE: {
        id: 'DIVINATION_STAR_GUIDANCE',
        rankOrder: 5,
        icon: '🔮',
        nameTh: 'คันฉ่องพยากรณ์ชี้ชะตาดาราและเร้นเงา (星占天机)',
        shortTh: 'พยากรณ์ดาราชี้ชะตา',
        color: '#c77dff',
        secondaryColor: '#e0aaff',
        facilityId: 'scripture',
        facilityNameTh: 'หอคัมภีร์ / หอดูดาว',
        studySpeedBonusPct: 0.22,
        expeditionHazardRed: 0.25,
        breakthroughStabilityBonus: 0.10,
        combatAllyDodgeBonusPct: 0.16,
        combatAllyCritBonusPct: 0.15,
        auraRadius: 6.5,
        prosTh: 'อ่านชะตาดาราชี้ทางสว่าง เร่งความเร็วศึกษาคัมภีร์และวิจัยในหอคัมภีร์ +22%, ลดอันตรายและกับดักในการเดินทางนอกสำนัก -25%, และเพิ่มหลบหลีก/คริติคอลให้สหายในศึก',
        consTh: 'ใช้สมาธิและปัญญาคำนวณวิถีดาราสูง'
      },
      BODHI_CHANT_SANCTUARY: {
        id: 'BODHI_CHANT_SANCTUARY',
        rankOrder: 6,
        icon: '📿',
        nameTh: 'โคมบัวทิพย์และบทสวดโพธิสัตว์คุ้มวิญญาณ (梵音佛光)',
        shortTh: 'โคมบัวโพธิสัตว์',
        color: '#f4a261',
        secondaryColor: '#fff3b0',
        facilityId: 'meditation_hall',
        facilityNameTh: 'หอทำสมาธิ / ลานแปดทิศ',
        heartDemonCleansePerTick: 0.55,
        stressCleansePerTick: 0.70,
        tribulationProtectPct: 0.22,
        breakthroughStabilityBonus: 0.15,
        combatAllyDmgRedPct: 0.18,
        combatAllyHealPct: 0.08,
        auraRadius: 7.0,
        prosTh: 'สุดยอดวิชาหนุนเสริมระดับโพธิสัตว์ กางม่านแสงโคมบัวทิพย์ชำระจิตมาร (-0.55) และความหวาดกลัว, คุ้มครองวิญญาณผู้ฝ่าด่านทัณฑ์สวรรค์ (-22% ดาเมจสายฟ้าทัณฑ์ & +15% โอกาสทะลวงด่าน), และลดดาเมจให้สหายในศึก -18%',
        consTh: 'ต้องอาศัยตบะและจิตเมตตาธรรมอันแน่วแน่ในการคงสภาพม่านแสงโคมบัวทิพย์'
      }
    },

    POSTURES: {
      BENEVOLENT_HEALER_AURA: {
        id: 'BENEVOLENT_HEALER_AURA',
        icon: '🌿',
        nameTh: 'โอสถเมตตาพิทักษ์ชีพ (医道仁心)',
        shortTh: 'โอสถเมตตาพิทักษ์ชีพ',
        healMult: 1.45,
        detoxMult: 1.40,
        commandMult: 0.90,
        harmonyMult: 1.10,
        descTh: 'มุ่งเน้นการเดินเข็มทองและหมอกควันโอสถสมานแผล เร่งฟื้นฟูพลังชีวิตและอาการบาดเจ็บ ×1.45 พร้อมขับพิษโอสถสะสม ×1.40'
      },
      TACTICAL_ARRAY_COMMAND: {
        id: 'TACTICAL_ARRAY_COMMAND',
        icon: '🚩',
        nameTh: 'กุนซือค่ายกลนำทัพ (奇门统帅)',
        shortTh: 'กุนซือค่ายกลนำทัพ',
        healMult: 1.00,
        detoxMult: 1.00,
        commandMult: 1.40,
        harmonyMult: 1.05,
        descTh: 'ชูธงรบฉีเหมินและเข็มทิศดาราบัญชาการรบ เพิ่มโบนัสพลังโจมตี/ป้องกันให้สหายร่วมศึกและลดภัยอันตรายนอกสำนัก ×1.40'
      },
      SOUL_MELODY_HARMONY: {
        id: 'SOUL_MELODY_HARMONY',
        icon: '🎶',
        nameTh: 'คีตกล่อมจิตสลายมาร (清心梵音)',
        shortTh: 'คีตกล่อมจิตสลายมาร',
        healMult: 1.10,
        detoxMult: 1.25,
        commandMult: 1.05,
        harmonyMult: 1.50,
        descTh: 'บรรเลงพิณขลุ่ยหยกและบทสวดโพธิสัตว์กล่อมเกลาจิตใจ สลายจิตมารและความเครียด ×1.50 ส่งผลให้ศิษย์ในสำนักทะลวงด่านสำเร็จสูงขึ้นอย่างชัดเจน!'
      }
    },

    SIGNATURE_MANUALS: [
      {
        id: 'SUP_JADE_FLUTE_SERENITY_T1',
        nameTh: 'เคล็ดขลุ่ยหยกคีตวายุชำระใจ',
        path: 'SAGE_SUPPORT',
        cat: 'SUPPORT_TECHNIQUE',
        tier: 1,
        power: 22,
        qiCost: 8,
        cooldown: 3,
        element: 'WIND',
        supportArchetype: 'CELESTIAL_ZITHER_MELODY',
        descTh: 'เป่าขลุ่ยหยกกระจายคลื่นเสียงวายุพิสุทธิ์ ชะล้างความเหนื่อยล้าและจิตมารของศิษย์ในสวนชาและหอทำสมาธิ'
      },
      {
        id: 'SUP_ALCHEMICAL_SPIRIT_MIST_T2',
        nameTh: 'เคล็ดหมอกควันเตาโอสถเก้าสมุนไพร',
        path: 'CRAFT_CREATION',
        cat: 'AUXILIARY_ART',
        tier: 2,
        power: 38,
        qiCost: 11,
        cooldown: 3,
        element: 'WOOD_LIFE',
        supportArchetype: 'ALCHEMICAL_INCENSE_MIST',
        descTh: 'ควบแน่นไอน้ำสมุนไพรและกลิ่นหอมจากเตาหลอมโอสถทิพย์ บำรุงปราณและเร่งประสิทธิภาพการผลิตในหอโอสถและโรงหลอม'
      },
      {
        id: 'SUP_GOLDEN_NEEDLE_MERIDIAN_T3',
        nameTh: 'วิชาเข็มทองร้อยด้ายปราณสมานชีพจร',
        path: 'SAGE_SUPPORT',
        cat: 'SUPPORT_TECHNIQUE',
        tier: 3,
        power: 56,
        qiCost: 14,
        cooldown: 4,
        element: 'LIGHT_YANG',
        supportArchetype: 'ACUPOINT_MERIDIAN_THERAPY',
        descTh: 'ซัดเข็มทองร้อยด้ายปราณเปิดจุดชีพจรสำคัญ สมานแผลภายใน ขับพิษโอสถ และฟื้นฟูพลังชีวิตสหายในพริบตา'
      },
      {
        id: 'SUP_QIMEN_COMMAND_BANNER_T4',
        nameTh: 'วิชาธงรบฉีเหมินแปดประตูบัญชาทัพ',
        path: 'STRATEGY_GOVERNANCE',
        cat: 'SUPPORT_TECHNIQUE',
        tier: 4,
        power: 78,
        qiCost: 18,
        cooldown: 4,
        element: 'FIRE',
        supportArchetype: 'QIMEN_BATTLE_BANNER',
        descTh: 'ปักธงศึกฉีเหมินแปดประตูกลางสมรภูมิ ปลุกขวัญและประสานกระบวนทัพเพิ่มทั้งพลังโจมตีและปราการป้องกันแก่สหายทั้งหมด'
      },
      {
        id: 'SUP_ASTRAL_FATE_COMPASS_T5',
        nameTh: 'คัมภีร์เข็มทิศดาราพยากรณ์ชี้ชะตา',
        path: 'ARRAY_TALISMAN',
        cat: 'AUXILIARY_ART',
        tier: 5,
        power: 102,
        qiCost: 20,
        cooldown: 5,
        element: 'ASTRAL',
        supportArchetype: 'DIVINATION_STAR_GUIDANCE',
        descTh: 'หมุนจานเข็มทิศดาราอ่านวิถีฟ้าดิน ชี้จุดตายของศัตรูและนำทางคณะเดินทางหลบเลี่ยงภัยพิบัติในยุทธภพ'
      },
      {
        id: 'SUP_BODHI_SOVEREIGN_CHANT_T6',
        nameTh: 'มหาโศลกโคมบัวโพธิสัตว์คุ้มภพนิรันดร์',
        path: 'KARMA_SAMSARA',
        cat: 'SUPPORT_TECHNIQUE',
        tier: 6,
        power: 136,
        qiCost: 24,
        cooldown: 5,
        element: 'LIGHT_YANG',
        supportArchetype: 'BODHI_CHANT_SANCTUARY',
        descTh: 'จุดโคมบัวทิพย์เก้ากลีบพร้อมเปล่งมหาโศลกโพธิสัตว์ ชำระจิตมารทั่วสำนักและกางม่านบุญบารมีคุ้มครองศิษย์ที่กำลังฝ่าด่านทัณฑ์สวรรค์'
      }
    ],

    classifySupportTech(t) {
      if (!t) return null;
      if (t.supportArchetype && this.ARCHETYPES[t.supportArchetype]) return t.supportArchetype;
      const id = String(t.id || '');
      const name = String(t.nameTh || '');
      const path = String(t.path || '');
      const el = String(t.element || '');

      if (id === 'SUP_BODHI_SOVEREIGN_CHANT_T6' || /โคมบัว|โพธิสัตว์|สวด|ปทุม|เมตตาธรรม|ชำระบาป|อวยพรผู้ทะลวงด่าน|ศรัทธา|ร่มโพธิ์|หกภพ/.test(name) || path === 'KARMA_SAMSARA' || path === 'GOD') {
        return 'BODHI_CHANT_SANCTUARY';
      }
      if (id === 'SUP_JADE_FLUTE_SERENITY_T1' || /พิณ|ขลุ่ย|คีต|ลำนำ|ระฆังหยก|โศลก|สงบจิต|คืนสมาธิ|ปลอบขวัญ/.test(name) || path === 'HEART_SOUL') {
        return 'CELESTIAL_ZITHER_MELODY';
      }
      if (id === 'SUP_GOLDEN_NEEDLE_MERIDIAN_T3' || /เข็มทอง|เข็มเงิน|สกัดจุด|สมานแผล|ต่อชีวิต|ขับพิษ|นวดคลายเส้น|ชุบชีวา|ชุบชีวิต|ประคองผู้บาดเจ็บ|ปลุกชีพจร/.test(name)) {
        return 'ACUPOINT_MERIDIAN_THERAPY';
      }
      if (id === 'SUP_QIMEN_COMMAND_BANNER_T4' || /ธง|กลอง|คำราม|ปลุกขวัญ|เรียกทัพ|สั่งฝูงอสูร|ส่งสัญญาณ|เคี่ยวกรำ|พิชัยสงคราม|เดินทัพ/.test(name) || path === 'STRATEGY_GOVERNANCE') {
        return 'QIMEN_BATTLE_BANNER';
      }
      if (id === 'SUP_ALCHEMICAL_SPIRIT_MIST_T2' || /เตาหลอม|เตาโอสถ|สมุนไพร|น้ำค้างทิพย์|ซุปหยก|ข้าวทิพย์|ครัวทิพย์|ชาหยก|สำรับ|กู่ทองคำ|เก็บกัก/.test(name) || path === 'CRAFT_CREATION') {
        return 'ALCHEMICAL_INCENSE_MIST';
      }
      if (id === 'SUP_ASTRAL_FATE_COMPASS_T5' || /พยากรณ์|เข็มทิศ|พราง|เร้นเงา|ลบกลิ่นอาย|เงาลวง|คัมภีร์เบิกปัญญา|เคลื่อนย้ายจักรวาล/.test(name) || path === 'ARRAY_TALISMAN' || el === 'ASTRAL') {
        return 'DIVINATION_STAR_GUIDANCE';
      }
      if (t.cat === 'SUPPORT_TECHNIQUE' || t.cat === 'AUXILIARY_ART') {
        return path === 'SAGE_SUPPORT' ? 'ACUPOINT_MERIDIAN_THERAPY' : 'CELESTIAL_ZITHER_MELODY';
      }
      return null;
    },

    initCatalog() {
      // 1. Register 6 signature manuals in TECH_BY_ID (preserving JD.MARTIAL.techniques & JD.TECH.techniques counts)
      this.SIGNATURE_MANUALS.forEach(spec => {
        const fullTech = Object.assign({
          stages: [
            { stage: 1, nameTh: 'ขั้นต้น', mult: 1.0 },
            { stage: 2, nameTh: 'ขั้นเชี่ยวชาญ', mult: 1.22 },
            { stage: 3, nameTh: 'ขั้นบรรลุ', mult: 1.45 }
          ],
          supportSpec: this.ARCHETYPES[spec.supportArchetype]
        }, spec);
        TECH_BY_ID[fullTech.id] = fullTech;
      });

      // 2. Enrich all 97 SUPPORT_TECHNIQUE (44) & AUXILIARY_ART (53) entries in JD.TECH and JD.MARTIAL
      const enrichList = list => {
        if (!Array.isArray(list)) return;
        list.forEach(t => {
          if (!t || (t.cat !== 'SUPPORT_TECHNIQUE' && t.cat !== 'AUXILIARY_ART')) return;
          const archId = this.classifySupportTech(t);
          if (archId && this.ARCHETYPES[archId]) {
            t.supportArchetype = archId;
            t.supportSpec = this.ARCHETYPES[archId];
          }
        });
      };
      if (JD.TECH) enrichList(JD.TECH.techniques);
      if (JD.MARTIAL) enrichList(JD.MARTIAL.techniques);
    },

    ensureState(n) {
      if (!n) return null;
      if (!n.supportState || typeof n.supportState !== 'object') {
        n.supportState = {
          posture: 'SOUL_MELODY_HARMONY',
          preferredArchetype: 'AUTO',
          totalAlliesHealed: 0,
          totalHeartDemonCleansed: 0,
          totalCommandBuffs: 0,
          totalFacilitySynergies: 0,
          breakthroughBlessingsGranted: 0,
          lastPulseTick: -999
        };
      }
      return n.supportState;
    },

    unlockedArchetypes(n) {
      const set = new Set(['CELESTIAL_ZITHER_MELODY']);
      if (!n || !n.cult) return Array.from(set);
      const stg = CULT.equivalentStage ? CULT.equivalentStage(n) : (n.cult.stage || 1);
      const path = n.cult.path || '';

      if (stg >= 1 && (path === 'CRAFT_CREATION' || path === 'SAGE_SUPPORT')) set.add('ALCHEMICAL_INCENSE_MIST');
      if (stg >= 2 && (path === 'SAGE_SUPPORT' || path === 'XIAN' || path === 'BODY')) set.add('ACUPOINT_MERIDIAN_THERAPY');
      if (stg >= 2 && (path === 'STRATEGY_GOVERNANCE' || path === 'BODY' || path === 'BEAST_SOVEREIGN')) set.add('QIMEN_BATTLE_BANNER');
      if (stg >= 3 && (path === 'ARRAY_TALISMAN' || path === 'XIAN' || path === 'HEART_SOUL')) set.add('DIVINATION_STAR_GUIDANCE');
      if (stg >= 4 && (path === 'KARMA_SAMSARA' || path === 'GOD' || path === 'SAGE_SUPPORT')) set.add('BODHI_CHANT_SANCTUARY');
      if (stg >= 5) {
        this.ARCHETYPE_ORDER.forEach(a => set.add(a));
      }

      const techs = Array.isArray(n.cult.techs) ? n.cult.techs : [];
      for (let i = 0; i < techs.length; i++) {
        const t = TECH_BY_ID[techs[i]];
        if (!t) continue;
        const archId = t.supportArchetype || ((t.cat === 'SUPPORT_TECHNIQUE' || t.cat === 'AUXILIARY_ART') ? this.classifySupportTech(t) : null);
        if (archId && this.ARCHETYPES[archId]) set.add(archId);
      }
      return this.ARCHETYPE_ORDER.filter(a => set.has(a));
    },

    resolveNpcSupport(W, n) {
      if (!n || !n.cult) return null;
      const st = n.supportState || null;
      const unlocked = this.unlockedArchetypes(n);
      const prefArch = (st && st.preferredArchetype) || 'AUTO';
      const PATH_PREF_SUP = { SHADOW_SAMURAI: 'QIMEN_BATTLE_BANNER', ARENA_GLORY: 'QIMEN_BATTLE_BANNER', NINPO_ELEMENTAL: 'QIMEN_BATTLE_BANNER', MERCANTILE_DAO: 'QIMEN_BATTLE_BANNER', NINPO_SHADOW: 'ALCHEMICAL_INCENSE_MIST', VENOM_GU: 'ALCHEMICAL_INCENSE_MIST', VOID_HERETIC_PACT: 'ALCHEMICAL_INCENSE_MIST', NETHER_GRAVE: 'ALCHEMICAL_INCENSE_MIST', DEVOURING_FLESH: 'ACUPOINT_MERIDIAN_THERAPY', SPIRIT_HUSBANDRY: 'ACUPOINT_MERIDIAN_THERAPY', PRIMORDIAL_SHIFTER: 'ACUPOINT_MERIDIAN_THERAPY', SONIC_HARMONY: 'CELESTIAL_ZITHER_MELODY', TIDE_VOYAGER: 'CELESTIAL_ZITHER_MELODY', WANDERING_DAO: 'CELESTIAL_ZITHER_MELODY', INK_LITERATI: 'CELESTIAL_ZITHER_MELODY', ASTRO_DIVINATION: 'DIVINATION_STAR_GUIDANCE', DIVINE_SUMMONER: 'DIVINATION_STAR_GUIDANCE', DIVINE_CHANNELER: 'DIVINATION_STAR_GUIDANCE', LORE_ARCHIVIST: 'DIVINATION_STAR_GUIDANCE', FORTUNE_GAMBLER: 'DIVINATION_STAR_GUIDANCE', CHRONO_EPOCH: 'DIVINATION_STAR_GUIDANCE', DRAGON_VEIN_GEOMANCY: 'DIVINATION_STAR_GUIDANCE' };
      const autoSup = (n.cult && PATH_PREF_SUP[n.cult.path] && unlocked.includes(PATH_PREF_SUP[n.cult.path])) ? PATH_PREF_SUP[n.cult.path] : (unlocked[0] || 'CELESTIAL_ZITHER_MELODY');
      const archId = (prefArch !== 'AUTO' && unlocked.includes(prefArch)) ? prefArch : autoSup;
      const spec = this.ARCHETYPES[archId] || this.ARCHETYPES.CELESTIAL_ZITHER_MELODY;

      const postureId = (st && st.posture && this.POSTURES[st.posture]) ? st.posture : 'SOUL_MELODY_HARMONY';
      const postureSpec = this.POSTURES[postureId];

      let learnedTech = null;
      const techs = Array.isArray(n.cult.techs) ? n.cult.techs : [];
      for (let i = 0; i < techs.length; i++) {
        const t = TECH_BY_ID[techs[i]];
        if (t && (t.supportArchetype === archId || t.cat === 'SUPPORT_TECHNIQUE' || t.cat === 'AUXILIARY_ART')) {
          if (!learnedTech || (t.tier || 1) > (learnedTech.tier || 1)) learnedTech = t;
        }
      }

      const effHealPct = +((spec.combatAllyHealPct || 0.05) * postureSpec.healMult).toFixed(3);
      const effAtkBonusPct = +((spec.combatAllyAtkBonusPct || 0.08) * postureSpec.commandMult).toFixed(3);
      const effDefBonusPct = +((spec.combatAllyDefBonusPct || spec.combatAllyDmgRedPct || 0.08) * postureSpec.commandMult).toFixed(3);
      const effHeartDemonCleanse = +((spec.heartDemonCleansePerTick || 0.25) * postureSpec.harmonyMult).toFixed(3);
      const effToxicCleanse = +((spec.toxicCleansePerTick || 0.20) * postureSpec.detoxMult).toFixed(3);
      const effBreakthroughBonus = +((spec.breakthroughStabilityBonus || 0.08) * postureSpec.harmonyMult).toFixed(3);
      const effExpeditionHazardRed = +((spec.expeditionHazardRed || 0.10) * postureSpec.commandMult).toFixed(3);

      return {
        archetypeId: archId,
        spec,
        postureId,
        postureSpec,
        unlockedArchetypes: unlocked,
        techNameTh: learnedTech ? learnedTech.nameTh : spec.nameTh,
        effHealPct,
        effAtkBonusPct,
        effDefBonusPct,
        effHeartDemonCleanse,
        effToxicCleanse,
        effBreakthroughBonus,
        effExpeditionHazardRed,
        auraRadius: spec.auraRadius || 6.5
      };
    },

    setSupportPosture(W, n, postureId, preferredArchetype) {
      if (!n || !n.cult) return null;
      if (W) W._hasActiveDefSupportAura = true;
      const st = this.ensureState(n);
      if (postureId && this.POSTURES[postureId]) st.posture = postureId;
      if (preferredArchetype && (preferredArchetype === 'AUTO' || this.ARCHETYPES[preferredArchetype])) {
        st.preferredArchetype = preferredArchetype;
      }
      return this.resolveNpcSupport(W, n);
    },

    stepFacilityAndDailySynergy(W, n) {
      if (!W || !n || !n.cult || !n.supportState) return null;
      const sup = this.resolveNpcSupport(W, n);
      if (!sup) return null;
      const st = n.supportState;
      const rad = sup.auraRadius || 6.5;
      let affected = 0;

      // Apply chain-reaction support aura to nearby sect members (and self)
      const list = Array.isArray(W.npcs) ? W.npcs : [];
      for (let i = 0; i < list.length; i++) {
        const ally = list[i];
        if (!ally || ally.dead || ally.away || !ally.h || !ally.h.state) continue;
        const dist = ally.id === n.id ? 0 : Math.hypot((ally.x || 0) - (n.x || 0), (ally.y || 0) - (n.y || 0));
        if (dist > rad) continue;
        affected++;
        const as = ally.h.state;

        // 1. Cleanse Heart Demon & Stress -> directly lowers Qi deviation & boosts breakthrough readiness
        if (sup.effHeartDemonCleanse > 0 && (as.heartDemon || 0) > 0) {
          const hdBefore = as.heartDemon || 0;
          as.heartDemon = Math.max(0, +(hdBefore - sup.effHeartDemonCleanse).toFixed(3));
          st.totalHeartDemonCleansed = +((st.totalHeartDemonCleansed || 0) + (hdBefore - as.heartDemon)).toFixed(2);
        }
        if (sup.spec.stressCleansePerTick) {
          as.stress = Math.max(0, (as.stress || 0) - sup.spec.stressCleansePerTick);
        }

        // 2. Cleanse Pill Qi Toxicity & accelerate injury recovery (Infirmary / Acupoint Synergy)
        if (ally.cult && sup.effToxicCleanse > 0 && (ally.cult.toxic || 0) > 0) {
          ally.cult.toxic = Math.max(0, +(ally.cult.toxic - sup.effToxicCleanse).toFixed(3));
        }
        if (sup.archetypeId === 'ACUPOINT_MERIDIAN_THERAPY' && Array.isArray(ally.inj) && ally.inj.length > 0) {
          ally.inj.forEach(inj => { if (inj && inj.until > 0) inj.until = Math.max(0, inj.until - 180); });
          ally.inj = ally.inj.filter(inj => inj && inj.until > 0);
        }

        // 3. Heal HP & restore Stamina (Alchemical Mist / Benevolent Healer)
        const ahm = CULT.hpMax(ally);
        if (as.hp < ahm) {
          const healAmt = Math.max(1, Math.round(ahm * sup.effHealPct));
          as.hp = Math.min(ahm, as.hp + healAmt);
          st.totalAlliesHealed = (st.totalAlliesHealed || 0) + healAmt;
        }
        if (sup.spec.energyRestorePerTick) {
          as.energy = Math.min(100, (as.energy || 50) + sup.spec.energyRestorePerTick);
        }

        // 3B. Patch v5.8.0 Cross-System Synergy: Cleanse Forbidden Taboo Strain (คลายเส้นชีพจรที่ตึงเครียดจากวิชาต้องห้าม)
        if (ally.forbiddenArtState && ally.forbiddenArtState.tabooStrain > 0) {
          ally.forbiddenArtState.tabooStrain = Math.max(0, +(ally.forbiddenArtState.tabooStrain - 8).toFixed(2));
        }

        // 4. Grant Breakthrough Stability Blessing (_btBonusPct) so disciples break through with higher success!
        if (ally.cult && sup.effBreakthroughBonus > 0) {
          const prevBt = ally._btBonusPct || 0;
          if (sup.effBreakthroughBonus > prevBt) {
            ally._btBonusPct = sup.effBreakthroughBonus;
            st.breakthroughBlessingsGranted = (st.breakthroughBlessingsGranted || 0) + 1;
          }
        }
      }

      st.totalFacilitySynergies = (st.totalFacilitySynergies || 0) + 1;
      st.lastPulseTick = W.t || 0;
      return { ok: true, affected, supportProfile: sup };
    },

    triggerSectEmergencySupport(W, mode) {
      if (!W || !Array.isArray(W.npcs)) return { ok: false, reason: 'no-world' };
      const alive = W.npcs.filter(n => n && !n.dead && !n.away);
      let count = 0;
      alive.forEach(n => {
        const s = n.h && n.h.state;
        if (!s) return;
        count++;
        if (mode === 'ZITHER_PURGE_HEART_DEMON') {
          s.heartDemon = Math.max(0, (s.heartDemon || 0) - 18);
          s.stress = Math.max(0, (s.stress || 0) - 20);
          s.mood = Math.min(50, (s.mood || 0) + 12);
          if (n.cult) n._btBonusPct = Math.max(n._btBonusPct || 0, 0.12);
        } else if (mode === 'INFIRMARY_ACUPOINT_HEAL') {
          const hm = CULT.hpMax(n);
          s.hp = hm;
          if (n.cult) n.cult.toxic = Math.max(0, (n.cult.toxic || 0) - 25);
          if (Array.isArray(n.inj) && n.inj.length > 0) n.inj = [];
        } else if (mode === 'QIMEN_BANNER_RALLY') {
          s.energy = Math.min(100, (s.energy || 50) + 30);
          if (n.cult) s.qi = CULT.qiMax(n);
          n.supportCommandRallyUntil = (W.t || 0) + 1440;
        }
      });
      return { ok: true, mode, affectedCount: count };
    },

    evaluateAutonomousEmergencySupport(W) {
      if (!W || !W.sect || !Array.isArray(W.npcs)) return null;
      if ((W.t - (W.sect.lastSupportEmergencyTick || -999)) < 72) return null;
      const alive = W.npcs.filter(u => u && !u.dead && !u.away && !u.foe && u.h && u.h.state);
      if (!alive.length) return null;
      const responder = alive.find(u =>
        (u.cult && ['SAGE_SUPPORT', 'SONIC_HARMONY', 'STRATEGY_GOVERNANCE', 'ARRAY_TALISMAN'].includes(u.cult.path)) ||
        u.role === 'physician' || u.office === 'physician' || u.role === 'elder' || u.role === 'master' ||
        (u.h.skills && ((u.h.skills.MEDICINE || 0) >= 15 || (u.h.skills.arts || 0) >= 15))
      );
      if (!responder) return null;
      let injured = 0, sumHd = 0;
      for (let i = 0; i < alive.length; i++) {
        const u = alive[i];
        if ((u.inj && u.inj.length > 0) || u.h.state.hp < CULT.hpMax(u) * 0.55) injured++;
        sumHd += (u.h.state.heartDemon || 0);
      }
      const avgHd = sumHd / alive.length;
      const inRaid = !!(W.activeRaid || (g.COMBAT && g.COMBAT.fights && g.COMBAT.fights.some(f => f && !f.done && f.kind === 'raid')));
      let mode = null;
      if (injured >= Math.max(2, Math.ceil(alive.length * 0.3))) mode = 'INFIRMARY_ACUPOINT_HEAL';
      else if (avgHd >= 38) mode = 'ZITHER_PURGE_HEART_DEMON';
      else if (inRaid) mode = 'QIMEN_BANNER_RALLY';
      if (!mode) return null;
      W.sect.lastSupportEmergencyTick = W.t || 0;
      const res = this.triggerSectEmergencySupport(W, mode);
      if (res && res.ok) res.responderId = responder.id;
      return res;
    }
  };
  CULT.SUPPORT_ARTS.initCatalog();

  /* ===== PATCH v5.8.0 [PILLAR 1]: FORBIDDEN ARTS & BLOOD-SACRIFICE OVERHAUL (ยกระดับวิชาต้องห้าม 37 วิชา + 6 คัมภีร์ต้องห้ามใหม่ T1–T6) ===== */
  CULT.FORBIDDEN_ARTS = {
    ARCHETYPE_ORDER: [
      'VOID_TABOO_ANNIHILATION',
      'LIFESPAN_HEAVEN_DEFIANCE',
      'SOUL_DEVOURING_ABYSS',
      'CORPSE_PUPPET_NECROMANCY',
      'MERIDIAN_REVERSE_BURST',
      'BLOOD_ESSENCE_IGNITION'
    ],
    ARCHETYPES: {
      BLOOD_ESSENCE_IGNITION: {
        id: 'BLOOD_ESSENCE_IGNITION',
        rankOrder: 1,
        icon: '🩸',
        nameTh: 'เผาแก่นโลหิตระเบิดตบะ (燃血秘术)',
        shortTh: 'เผาแก่นโลหิต',
        color: '#ef233c',
        secondaryColor: '#ff758f',
        atkSurgePct: 0.45,
        cultSurgePct: 0.32,
        hpSacrificePctPerHit: 0.025,
        heartDemonGainPerTick: 0.14,
        breakthroughDefianceBonus: 0.14,
        desperationNovaMult: 0.30,
        prosTh: 'เผาผลาญโลหิตต้นกำเนิดเพื่อระเบิดพลังโจมตี +45% และเร่งความเร็วบ่มเพาะ +32%, เพิ่มโอกาสฝ่าด่านคอขวด +14%',
        consTh: 'สูญเสียพลังชีวิต 2.5% ทุกครั้งที่สำแดงวิชาในศึก และสะสมภาวะโลหิตพร่อง/แรงกดดันจิตมาร'
      },
      MERIDIAN_REVERSE_BURST: {
        id: 'MERIDIAN_REVERSE_BURST',
        rankOrder: 2,
        icon: '⚡',
        nameTh: 'ย้อนรอยเส้นชีพจรทะลวงขีดจำกัด (逆脉狂暴)',
        shortTh: 'ย้อนรอยชีพจรคลั่ง',
        color: '#ff006e',
        secondaryColor: '#ffbe0b',
        atkSurgePct: 0.42,
        cultSurgePct: 0.36,
        speedSurgePct: 0.30,
        hpSacrificePctPerHit: 0.02,
        heartDemonGainPerTick: 0.16,
        breakthroughDefianceBonus: 0.18,
        desperationNovaMult: 0.32,
        prosTh: 'ฝืนเดินปราณย้อนเส้นชีพจรพิสดารทั้งแปด เพิ่มพลังโจมตี +42%, ความเร็วเคลื่อนที่และวิชาตัวเบา +30%, และทะลวงคอขวดตบะ +18%',
        consTh: 'ก่อให้เกิดอาการชีพจรตึงเครียด (Taboo Strain) หลังจบศึก ต้องอาศัยเข็มทองหรือโอสถช่วยคลายเส้น'
      },
      CORPSE_PUPPET_NECROMANCY: {
        id: 'CORPSE_PUPPET_NECROMANCY',
        rankOrder: 3,
        icon: '🧟',
        nameTh: 'เพาะกู่โลหิตและเชิดหุ่นวิญญาณต้องห้าม (控尸血蛊)',
        shortTh: 'กู่โลหิตเชิดวิญญาณ',
        color: '#7209b7',
        secondaryColor: '#b5179e',
        atkSurgePct: 0.38,
        cultSurgePct: 0.28,
        venomCurseBonusPct: 0.35,
        hpSacrificePctPerHit: 0.015,
        heartDemonGainPerTick: 0.18,
        breakthroughDefianceBonus: 0.12,
        desperationNovaMult: 0.28,
        prosTh: 'ปล่อยแมลงกู่โลหิตและหุ่นเงาวิญญาณรุมกัดกร่อนศัตรู เพิ่มดาเมจพิษ/คำสาป +38% และดูดซับแรงกายศัตรูมาฟื้นฟูตนเอง',
        consTh: 'กลิ่นอายกู่โลหิตชวนขนลุก เพิ่มแรงกดดันจิตมารและเสี่ยงถูกหอวินัยเพ่งเล็งหากใช้อย่างเปิดเผย'
      },
      SOUL_DEVOURING_ABYSS: {
        id: 'SOUL_DEVOURING_ABYSS',
        rankOrder: 4,
        icon: '💀',
        nameTh: 'วังวนกลืนวิญญาณสูบตันเถียน (噬魂魔典)',
        shortTh: 'วังวนสูบตันเถียน',
        color: '#9d4edd',
        secondaryColor: '#ef233c',
        atkSurgePct: 0.48,
        cultSurgePct: 0.44,
        lifestealPct: 0.24,
        qistealPct: 0.28,
        hpSacrificePctPerHit: 0.01,
        heartDemonGainPerTick: 0.22,
        breakthroughDefianceBonus: 0.16,
        desperationNovaMult: 0.35,
        prosTh: 'สร้างวังวนทมิฬสูบพลังชีวิต 24% และสูบปราณตันเถียนศัตรู 28% ทุกครั้งที่โจมตี! เร่งความเร็วบ่มเพาะ +44% และกลืนกินตบะศัตรูที่พ่ายแพ้',
        consTh: 'วิญญาณอาฆาตที่สูบเข้ามาจะกระตุ้นจิตมารอย่างรุนแรง ต้องใช้คีตเวทย์พิณหรือโคมบัวโพธิสัตว์คอยชำระล้าง'
      },
      LIFESPAN_HEAVEN_DEFIANCE: {
        id: 'LIFESPAN_HEAVEN_DEFIANCE',
        rankOrder: 5,
        icon: '⏳',
        nameTh: 'สังเวยอายุขัยฝืนลิขิตฟ้า (燃寿逆天功)',
        shortTh: 'สังเวยอายุขัยฝืนฟ้า',
        color: '#ff4d6d',
        secondaryColor: '#ffd166',
        atkSurgePct: 0.58,
        cultSurgePct: 0.48,
        hpSacrificePctPerHit: 0.03,
        heartDemonGainPerTick: 0.20,
        breakthroughDefianceBonus: 0.25,
        desperationNovaMult: 0.42,
        prosTh: 'เผาผลาญพลังชีวิตและเศษเสี้ยวอายุขัยเพื่อฝืนชะตาสวรรค์! เพิ่มพลังโจมตี +58%, เพิ่มโอกาสทะลวงด่านใหญ่ +25%, และระเบิดพลังเฮือกสุดท้ายเมื่อเลือดต่ำกว่า 30%',
        consTh: 'ทุกครั้งที่ปลดผนึกเต็มพิกัดจะบั่นทอนปราณอายุขัยและเพิ่มความเหนื่อยล้าอย่างหนัก'
      },
      VOID_TABOO_ANNIHILATION: {
        id: 'VOID_TABOO_ANNIHILATION',
        rankOrder: 6,
        icon: '🌑',
        nameTh: 'มหาวิชาต้องห้ามทลายสามภพดับสูญ (禁忌灭世诀)',
        shortTh: 'ทลายสามภพดับสูญ',
        color: '#d90429',
        secondaryColor: '#3a0ca3',
        atkSurgePct: 0.72,
        cultSurgePct: 0.55,
        hpSacrificePctPerHit: 0.035,
        heartDemonGainPerTick: 0.28,
        breakthroughDefianceBonus: 0.28,
        desperationNovaMult: 0.50,
        prosTh: 'สุดยอดมหาวิชาต้องห้ามระดับทำลายล้าง เมื่อปลดผนึกเต็มพิกัดจะเพิ่มพลังโจมตี +72% และปล่อย「มหาคลื่นสุญตาดับสูญฟ้าดิน」กวาดล้างศัตรูเมื่อตกอยู่ในวิกฤตปางตาย!',
        consTh: 'กินพลังชีวิต 3.5% ต่อการโจมตีและสร้างแรงสะท้อนปราณต้องห้ามสูงสุด ต้องมีตบะและรากฐานที่แข็งแกร่งจึงจะควบคุมได้'
      }
    },

    SEAL_MODES: {
      SEALED_RESTRAINT: {
        id: 'SEALED_RESTRAINT',
        icon: '🔒',
        nameTh: 'ผนึกคัมภีร์ต้องห้าม (封印静心)',
        shortTh: 'ผนึกคัมภีร์ (ปลอดภัย)',
        powerMult: 0,
        cultMult: 1.00,
        strainRate: -0.15,
        descTh: 'ตีตราผนึกวิชาต้องห้ามไว้ในส่วนลึกของจิตวิญญาณ ไม่เสียเลือดและไม่เกิดจิตมาร พร้อมได้โบนัสความตั้งมั่นทางใจจากการชนะสิ่งยั่วยุ'
      },
      HALF_UNSEALED_FLOW: {
        id: 'HALF_UNSEALED_FLOW',
        icon: '☯️',
        nameTh: 'คลายผนึกครึ่งขั้น (半解禁制)',
        shortTh: 'คลายผนึกครึ่งขั้น',
        powerMult: 0.55,
        cultMult: 1.22,
        strainRate: 0.12,
        descTh: 'แง้มตราผนึกดึงปราณต้องห้ามออกมาใช้ครึ่งส่วน เพิ่มพลังโจมตีและอัตราบ่มเพาะอย่างมีนัยสำคัญโดยยังควบคุมผลข้างเคียงได้'
      },
      BLOOD_TABOO_UNLEASHED: {
        id: 'BLOOD_TABOO_UNLEASHED',
        icon: '🩸',
        nameTh: 'ปลดผนึกโลหิตต้องห้ามเต็มพิกัด (血祭全开)',
        shortTh: 'ปลดผนึกโลหิตเต็มพิกัด!',
        powerMult: 1.00,
        cultMult: 1.50,
        strainRate: 0.35,
        descTh: 'ฉีกตราผนึกทั้งหมดเพื่อสำแดงอานุภาพวิชาต้องห้าม 100%! เร่งพลังทำลายล้างและทะลวงคอขวดสูงสุด พร้อมเปิดใช้งาน「ระเบิดมหาวิชาต้องห้ามฝืนชะตา」เมื่อบาดเจ็บวิกฤต!'
      }
    },

    SIGNATURE_MANUALS: [
      {
        id: 'FORB_BLOOD_ESSENCE_IGNITE_T1',
        nameTh: 'เคล็ดต้องห้ามเผาโลหิตเร่งปราณ',
        path: 'DEMON',
        cat: 'FORBIDDEN_ART',
        tier: 1,
        power: 35,
        qiCost: 10,
        cooldown: 4,
        element: 'BLOOD_DEMON',
        forbiddenArchetype: 'BLOOD_ESSENCE_IGNITION',
        descTh: 'จุดระเบิดโลหิตในกายเพื่อเร่งปราณและพละกำลังโจมตีให้พุ่งทะยานเหนือขีดจำกัดของระดับขั้น'
      },
      {
        id: 'FORB_MERIDIAN_REVERSE_BURST_T2',
        nameTh: 'เคล็ดต้องห้ามย้อนชีพจรแปดพิสดาร',
        path: 'BODY',
        cat: 'FORBIDDEN_ART',
        tier: 2,
        power: 55,
        qiCost: 14,
        cooldown: 4,
        element: 'LIGHTNING',
        forbiddenArchetype: 'MERIDIAN_REVERSE_BURST',
        descTh: 'ฝืนหมุนเวียนลมปราณย้อนทวนเส้นชีพจรพิสดารทั้งแปด ระเบิดความเร็วและแรงปะทะดุจอสูรคลั่ง'
      },
      {
        id: 'FORB_CORPSE_GU_NECROMANCY_T3',
        nameTh: 'คัมภีร์ต้องห้ามกู่โลหิตเชิดวิญญาณ',
        path: 'DEMON',
        cat: 'FORBIDDEN_ART',
        tier: 3,
        power: 78,
        qiCost: 18,
        cooldown: 5,
        element: 'YIN_SHADOW',
        forbiddenArchetype: 'CORPSE_PUPPET_NECROMANCY',
        descTh: 'เลี้ยงกู่โลหิตและอัญเชิญเงาซากศพบรรพกาลออกมากัดกร่อนปราณคุ้มกายของศัตรู'
      },
      {
        id: 'FORB_SOUL_DEVOURING_ABYSS_T4',
        nameTh: 'มหาเวทต้องห้ามวังวนสูบตันเถียน',
        path: 'DEMON',
        cat: 'FORBIDDEN_ART',
        tier: 4,
        power: 105,
        qiCost: 22,
        cooldown: 5,
        element: 'BLOOD_DEMON',
        forbiddenArchetype: 'SOUL_DEVOURING_ABYSS',
        descTh: 'เปิดวังวนทมิฬดูดกลืนพลังชีวิตและปราณตันเถียนของคู่ต่อสู้มาหล่อเลี้ยงตบะของตนเองโดยตรง'
      },
      {
        id: 'FORB_LIFESPAN_HEAVEN_DEFIANCE_T5',
        nameTh: 'คัมภีร์ต้องห้ามสังเวยอายุขัยฝืนชะตาสวรรค์',
        path: 'XIAN',
        cat: 'FORBIDDEN_ART',
        tier: 5,
        power: 138,
        qiCost: 26,
        cooldown: 6,
        element: 'FIRE',
        forbiddenArchetype: 'LIFESPAN_HEAVEN_DEFIANCE',
        descTh: 'เผาผลาญปราณอายุขัยแลกกับพลังอำนาจท้าทายสวรรค์ ช่วยฝ่าด่านคอขวดและพลิกสถานการณ์จากความตาย'
      },
      {
        id: 'FORB_VOID_APOCALYPSE_TABOO_T6',
        nameTh: 'มหาคัมภีร์ต้องห้ามทลายสามภพดับสูญ',
        path: 'DEMON',
        cat: 'FORBIDDEN_ART',
        tier: 6,
        power: 175,
        qiCost: 32,
        cooldown: 6,
        element: 'ASTRAL',
        forbiddenArchetype: 'VOID_TABOO_ANNIHILATION',
        descTh: 'คัมภีร์ต้องห้ามสูงสุดที่ฉีกกระชากมิติและสายฟ้าทัณฑ์สวรรค์ลงมาถล่มสมรภูมิให้พินาศไปพร้อมกัน'
      }
    ],

    classifyForbiddenTech(t) {
      if (!t) return null;
      if (t.forbiddenArchetype && this.ARCHETYPES[t.forbiddenArchetype]) return t.forbiddenArchetype;
      const id = String(t.id || '');
      const name = String(t.nameTh || '');
      const el = String(t.element || '');

      if (id === 'FORB_VOID_APOCALYPSE_TABOO_T6' || /ทลายสามภพ|ล้างบางสมรภูมิ|ทัณฑ์สวรรค์|ระเบิดแกนค่ายกล|ระเบิดสะท้านสวรรค์|ฉีกมิติ|พลิกผันกงล้อกรรม/.test(name)) {
        return 'VOID_TABOO_ANNIHILATION';
      }
      if (id === 'FORB_LIFESPAN_HEAVEN_DEFIANCE_T5' || /อายุขัย|แลกชีวิต|พลีชีพ|ร่วมตาย|บงกชโลหิต/.test(name)) {
        return 'LIFESPAN_HEAVEN_DEFIANCE';
      }
      if (id === 'FORB_SOUL_DEVOURING_ABYSS_T4' || /สูบปราณ|สูบเลือด|กลืนกิน|ดูดดาว|กลืนสวรรค์|กลืนฟ้าร้าวชีพ|สูบพลังชีวิต/.test(name)) {
        return 'SOUL_DEVOURING_ABYSS';
      }
      if (id === 'FORB_CORPSE_GU_NECROMANCY_T3' || /กู่โลหิต|หมอกพิษ|คำสาป|บังคับวิญญาณ|บังคับอสูร|มายาจันทรา/.test(name)) {
        return 'CORPSE_PUPPET_NECROMANCY';
      }
      if (id === 'FORB_MERIDIAN_REVERSE_BURST_T2' || /ย้อนชีพจร|ฉีกกล้ามเนื้อ|ทุบชีพจร|สะบั้นสายพิณ|ผสานร่างอวตาร/.test(name) || el === 'LIGHTNING') {
        return 'MERIDIAN_REVERSE_BURST';
      }
      if (t.cat === 'FORBIDDEN_ART' || t.cat === 'FORBIDDEN_TECHNIQUE') {
        return 'BLOOD_ESSENCE_IGNITION';
      }
      return null;
    },

    initCatalog() {
      this.SIGNATURE_MANUALS.forEach(spec => {
        const fullTech = Object.assign({
          stages: [
            { stage: 1, nameTh: 'ขั้นแง้มผนึก', mult: 1.0 },
            { stage: 2, nameTh: 'ขั้นคลายผนึกโลหิต', mult: 1.25 },
            { stage: 3, nameTh: 'ขั้นปลดผนึกทลายฟ้า', mult: 1.55 }
          ],
          forbiddenSpec: this.ARCHETYPES[spec.forbiddenArchetype]
        }, spec);
        TECH_BY_ID[fullTech.id] = fullTech;
      });

      const enrichList = list => {
        if (!Array.isArray(list)) return;
        list.forEach(t => {
          if (!t || (t.cat !== 'FORBIDDEN_ART' && t.cat !== 'FORBIDDEN_TECHNIQUE')) return;
          const archId = this.classifyForbiddenTech(t);
          if (archId && this.ARCHETYPES[archId]) {
            t.forbiddenArchetype = archId;
            t.forbiddenSpec = this.ARCHETYPES[archId];
          }
        });
      };
      if (JD.TECH) enrichList(JD.TECH.techniques);
      if (JD.MARTIAL) enrichList(JD.MARTIAL.techniques);
    },

    canDiscipleStudyForbidden(W, n, t) {
      if (!n || !n.cult) return false;
      const policy = (W && W.sect && W.sect.forbiddenVault && W.sect.forbiddenVault.policy) || 'ELDER_LICENSED_ACCESS';
      if (policy === 'UNRESTRICTED_BLOOD_CULT') return true;
      const isDarkPath = ['DEMON', 'DEVOURING_FLESH', 'ABYSSAL_CORRUPTION', 'VENOM_GU', 'VOID_HERETIC_PACT'].includes(n.cult.path);
      const hd = (n.h && n.h.state && n.h.state.heartDemon) || 0;
      const integ = HC.eff(n, 'personality.integrity');
      if (policy === 'STRICT_ORTHODOX_BAN') {
        return isDarkPath || (hd >= 68 && integ < 38);
      }
      return (n.rank || 0) >= 3 || (W && W.sect && n.id === W.sect.masterId) || isDarkPath || (hd >= 55 && integ < 45);
    },

    checkTabooStrainBacklash(W, n) {
      if (!n || !n.forbiddenArtState) return { triggered: false };
      const st = n.forbiddenArtState;
      if ((st.tabooStrain || 0) < 95) return { triggered: false };
      st.sealMode = 'SEALED_RESTRAINT';
      st.tabooStrain = 45;
      st.totalBacklashes = (st.totalBacklashes || 0) + 1;
      if (n.h && n.h.state) {
        n.h.state.heartDemon = clamp((n.h.state.heartDemon || 0) + 18, 0, 100);
        const hm = CULT.hpMax(n);
        n.h.state.hp = Math.max(1, Math.round((n.h.state.hp || hm) - hm * 0.25));
      }
      if (W && g.AI && g.AI.injure) {
        g.AI.injure(W, n, 2, 'แรงตีกลับวิชาต้องห้าม (ธาตุไฟเข้าแทรก)');
      }
      n._cultRateBase = null;
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
      return { triggered: true, sealMode: st.sealMode, tabooStrain: st.tabooStrain };
    },

    ensureState(n) {
      if (!n) return null;
      if (!n.forbiddenArtState || typeof n.forbiddenArtState !== 'object') {
        n.forbiddenArtState = {
          sealMode: 'SEALED_RESTRAINT',
          preferredArchetype: 'AUTO',
          tabooStrain: 0,
          desperationNovaUsedFightId: -1,
          totalBloodSacrificed: 0,
          totalSoulsDevoured: 0,
          totalTabooStrikes: 0,
          totalDesperationNovas: 0
        };
      }
      return n.forbiddenArtState;
    },

    unlockedArchetypes(n) {
      const set = new Set(['BLOOD_ESSENCE_IGNITION']);
      if (!n || !n.cult) return Array.from(set);
      const stg = CULT.equivalentStage ? CULT.equivalentStage(n) : (n.cult.stage || 1);
      const path = n.cult.path || '';

      const PATH_PREF_FORB_MAP = { SHADOW_SAMURAI: 'MERIDIAN_REVERSE_BURST', DIVINE_POSSESSION: 'MERIDIAN_REVERSE_BURST', TIDE_VOYAGER: 'MERIDIAN_REVERSE_BURST', ARENA_GLORY: 'MERIDIAN_REVERSE_BURST', GRAVITY_DAO: 'MERIDIAN_REVERSE_BURST', NINPO_SHADOW: 'SOUL_DEVOURING_ABYSS', NETHER_GRAVE: 'SOUL_DEVOURING_ABYSS', SOUL_PUPPETRY: 'SOUL_DEVOURING_ABYSS', VENOM_GU: 'CORPSE_PUPPET_NECROMANCY', NINPO_ELEMENTAL: 'CORPSE_PUPPET_NECROMANCY', OCCULT_MAGE: 'CORPSE_PUPPET_NECROMANCY', FORTUNE_GAMBLER: 'CORPSE_PUPPET_NECROMANCY', DEVOURING_FLESH: 'BLOOD_ESSENCE_IGNITION', PRIMORDIAL_SHIFTER: 'BLOOD_ESSENCE_IGNITION', SPIRIT_HUSBANDRY: 'BLOOD_ESSENCE_IGNITION', DIVINE_SUMMONER: 'LIFESPAN_HEAVEN_DEFIANCE', DIVINE_CHANNELER: 'LIFESPAN_HEAVEN_DEFIANCE', ANCESTRAL_RITUAL: 'LIFESPAN_HEAVEN_DEFIANCE', LORE_ARCHIVIST: 'LIFESPAN_HEAVEN_DEFIANCE', ASTRO_DIVINATION: 'LIFESPAN_HEAVEN_DEFIANCE', CHRONO_EPOCH: 'LIFESPAN_HEAVEN_DEFIANCE' };
      if (stg >= 2 && PATH_PREF_FORB_MAP[path]) set.add(PATH_PREF_FORB_MAP[path]);
      if (stg >= 2 && (path === 'BODY' || path === 'XIAN' || path === 'DEMON' || path === 'SHADOW_SAMURAI')) set.add('MERIDIAN_REVERSE_BURST');
      if (stg >= 3 && (path === 'DEMON' || path === 'BEAST_SOVEREIGN' || path === 'MECH_PUPPET' || path === 'OCCULT_MAGE' || path === 'VENOM_GU')) set.add('CORPSE_PUPPET_NECROMANCY');
      if (stg >= 4 && (path === 'DEMON' || path === 'HEART_SOUL' || path === 'GOD' || path === 'NINPO_SHADOW' || path === 'NETHER_GRAVE')) set.add('SOUL_DEVOURING_ABYSS');
      if (stg >= 5) {
        set.add('LIFESPAN_HEAVEN_DEFIANCE');
        set.add('SOUL_DEVOURING_ABYSS');
        set.add('CORPSE_PUPPET_NECROMANCY');
        set.add('MERIDIAN_REVERSE_BURST');
      }
      if (stg >= 6) {
        this.ARCHETYPE_ORDER.forEach(a => set.add(a));
      }

      const techs = Array.isArray(n.cult.techs) ? n.cult.techs : [];
      for (let i = 0; i < techs.length; i++) {
        const t = TECH_BY_ID[techs[i]];
        if (!t) continue;
        const archId = t.forbiddenArchetype || ((t.cat === 'FORBIDDEN_ART' || t.cat === 'FORBIDDEN_TECHNIQUE') ? this.classifyForbiddenTech(t) : null);
        if (archId && this.ARCHETYPES[archId]) set.add(archId);
      }
      return this.ARCHETYPE_ORDER.filter(a => set.has(a));
    },

    resolveNpcForbidden(W, n) {
      if (!n || !n.cult) return null;
      const st = n.forbiddenArtState || null;
      const unlocked = this.unlockedArchetypes(n);
      const prefArch = (st && st.preferredArchetype) || 'AUTO';
      const PATH_PREF_FORB = { SHADOW_SAMURAI: 'MERIDIAN_REVERSE_BURST', DIVINE_POSSESSION: 'MERIDIAN_REVERSE_BURST', TIDE_VOYAGER: 'MERIDIAN_REVERSE_BURST', ARENA_GLORY: 'MERIDIAN_REVERSE_BURST', GRAVITY_DAO: 'MERIDIAN_REVERSE_BURST', NINPO_SHADOW: 'SOUL_DEVOURING_ABYSS', NETHER_GRAVE: 'SOUL_DEVOURING_ABYSS', SOUL_PUPPETRY: 'SOUL_DEVOURING_ABYSS', VENOM_GU: 'CORPSE_PUPPET_NECROMANCY', NINPO_ELEMENTAL: 'CORPSE_PUPPET_NECROMANCY', OCCULT_MAGE: 'CORPSE_PUPPET_NECROMANCY', FORTUNE_GAMBLER: 'CORPSE_PUPPET_NECROMANCY', DEVOURING_FLESH: 'BLOOD_ESSENCE_IGNITION', PRIMORDIAL_SHIFTER: 'BLOOD_ESSENCE_IGNITION', SPIRIT_HUSBANDRY: 'BLOOD_ESSENCE_IGNITION', DIVINE_SUMMONER: 'LIFESPAN_HEAVEN_DEFIANCE', DIVINE_CHANNELER: 'LIFESPAN_HEAVEN_DEFIANCE', ANCESTRAL_RITUAL: 'LIFESPAN_HEAVEN_DEFIANCE', LORE_ARCHIVIST: 'LIFESPAN_HEAVEN_DEFIANCE', ASTRO_DIVINATION: 'LIFESPAN_HEAVEN_DEFIANCE', CHRONO_EPOCH: 'LIFESPAN_HEAVEN_DEFIANCE' };
      const autoForb = (n.cult && PATH_PREF_FORB[n.cult.path] && unlocked.includes(PATH_PREF_FORB[n.cult.path])) ? PATH_PREF_FORB[n.cult.path] : (unlocked[0] || 'BLOOD_ESSENCE_IGNITION');
      const archId = (prefArch !== 'AUTO' && unlocked.includes(prefArch)) ? prefArch : autoForb;
      const spec = this.ARCHETYPES[archId] || this.ARCHETYPES.BLOOD_ESSENCE_IGNITION;

      const sealModeId = (st && st.sealMode && this.SEAL_MODES[st.sealMode]) ? st.sealMode : 'SEALED_RESTRAINT';
      const sealSpec = this.SEAL_MODES[sealModeId];

      let learnedTech = null;
      const techs = Array.isArray(n.cult.techs) ? n.cult.techs : [];
      for (let i = 0; i < techs.length; i++) {
        const t = TECH_BY_ID[techs[i]];
        if (t && (t.forbiddenArchetype === archId || t.cat === 'FORBIDDEN_ART' || t.cat === 'FORBIDDEN_TECHNIQUE')) {
          if (!learnedTech || (t.tier || 1) > (learnedTech.tier || 1)) learnedTech = t;
        }
      }

      const pMult = sealSpec.powerMult || 0;
      const effAtkBonusPct = +(spec.atkSurgePct * pMult).toFixed(3);
      const effCultMult = pMult > 0 ? +(1 + (spec.cultSurgePct || 0.30) * pMult).toFixed(3) : 1.0;
      const effHpCostPct = +(spec.hpSacrificePctPerHit * pMult).toFixed(4);
      const effBreakthroughBonus = +(spec.breakthroughDefianceBonus * pMult).toFixed(3);

      return {
        archetypeId: archId,
        spec,
        sealModeId,
        sealSpec,
        unlockedArchetypes: unlocked,
        techNameTh: learnedTech ? learnedTech.nameTh : spec.nameTh,
        isUnsealed: pMult > 0,
        isFullTaboo: sealModeId === 'BLOOD_TABOO_UNLEASHED',
        effAtkBonusPct,
        effCultMult,
        effHpCostPct,
        effBreakthroughBonus,
        tabooStrain: (st && st.tabooStrain) || 0
      };
    },

    setForbiddenSealMode(W, n, sealModeId, preferredArchetype) {
      if (!n || !n.cult) return null;
      const st = this.ensureState(n);
      if (sealModeId && this.SEAL_MODES[sealModeId]) st.sealMode = sealModeId;
      if (preferredArchetype && (preferredArchetype === 'AUTO' || this.ARCHETYPES[preferredArchetype])) {
        st.preferredArchetype = preferredArchetype;
      }
      const res = this.resolveNpcForbidden(W, n);
      if (res && res.isUnsealed && n.voluntaryVows && n.voluntaryVows.VOW_ASCETIC_PRECEPT && CULT.VOLUNTARY_VOWS && CULT.VOLUNTARY_VOWS.violateVow) {
        CULT.VOLUNTARY_VOWS.violateVow(W, n, 'VOW_ASCETIC_PRECEPT', 'ปลดผนึกวิชาต้องห้ามขณะถือศีลพรต');
      }
      if (res && res.effBreakthroughBonus > 0) {
        n._btBonusPct = Math.max(n._btBonusPct || 0, res.effBreakthroughBonus);
      }
      n._cultRateBase = null;
      return res;
    }
  };
  CULT.FORBIDDEN_ARTS.initCatalog();

  /* ===== PATCH v5.8.0 [PILLAR 2]: PASSIVE & INNATE SUBPATH RESONANCE CONSTELLATIONS (ยกระดับวิชาติดตัว 227 วิชา และวิชาสายย่อย 36 วิชา รวม 263 วิชา) ===== */
  CULT.PASSIVE_RESONANCE = {
    CONSTELLATION_ORDER: [
      'SWORD_BLADE_EDGE_CONSTELLATION',
      'IMMORTAL_MERIDIAN_OCEAN',
      'TITAN_MARROW_FORTRESS',
      'PHANTOM_WIND_SHADOW_WEB',
      'SAGE_ARTISAN_MIND_PALACE',
      'SOVEREIGN_KARMA_BLOOD_SEAL'
    ],
    CONSTELLATIONS: {
      SWORD_BLADE_EDGE_CONSTELLATION: {
        id: 'SWORD_BLADE_EDGE_CONSTELLATION',
        icon: '⚔️',
        nameTh: 'ดาราจักรคมศาสตราผ่าสวรรค์ (天剑锋芒星宿)',
        shortTh: 'ดาราจักรคมศาสตรา',
        color: '#00f5d4',
        starCount: 7,
        atkBonusPerTier: 0.08,
        critBonusPerTier: 4.5,
        penBonusPerTier: 5.0,
        descTh: 'เชื่อมโยงวิชาติดตัวสายศาสตราและเจตจำนงคมดาบ เพิ่มพลังโจมตี อัตราคริติคอล และเจาะเกราะตามระดับดาราจักร (ขั้น 1–3)'
      },
      IMMORTAL_MERIDIAN_OCEAN: {
        id: 'IMMORTAL_MERIDIAN_OCEAN',
        icon: '🌊',
        nameTh: 'ดาราจักรทะเลปราณไร้ก้นบึ้ง (沧海气海星宿)',
        shortTh: 'ดาราจักรทะเลปราณ',
        color: '#48cae4',
        starCount: 6,
        qiMaxBonusPerTier: 0.12,
        cultRateBonusPerTier: 0.09,
        qiCostRedPerTier: 0.06,
        descTh: 'เชื่อมโยงวิชาติดตัวสายชีพจรและตันเถียน ขยายความจุปราณสูงสุด เร่งความเร็วบ่มเพาะ และประหยัดปราณเมื่อใช้วิชา'
      },
      TITAN_MARROW_FORTRESS: {
        id: 'TITAN_MARROW_FORTRESS',
        icon: '🏔️',
        nameTh: 'ดาราจักรกระดูกทองคำค้ำปฐพี (玄武金骨星宿)',
        shortTh: 'ดาราจักรกระดูกทองคำ',
        color: '#ffd166',
        starCount: 8,
        hpMaxBonusPerTier: 0.12,
        dmgRedPerTier: 0.06,
        poiseBonusPerTier: 0.15,
        descTh: 'เชื่อมโยงวิชาติดตัวสายหลอมกายาและกระดูกทองคำ เพิ่มพลังชีวิตสูงสุด ลดความเสียหายที่ได้รับ และต้านทานการถูกขัดจังหวะ'
      },
      PHANTOM_WIND_SHADOW_WEB: {
        id: 'PHANTOM_WIND_SHADOW_WEB',
        icon: '🕸️',
        nameTh: 'ดาราจักรเงาวายุไร้ร่องรอย (幽影疾风星宿)',
        shortTh: 'ดาราจักรเงาวายุ',
        color: '#c77dff',
        starCount: 5,
        speedBonusPerTier: 0.08,
        dodgeBonusPerTier: 0.06,
        firstStrikeBonusPerTier: 0.10,
        descTh: 'เชื่อมโยงวิชาติดตัวสายความเร็วและลอบเร้น เพิ่มความเร็วเคลื่อนที่ อัตราหลบหลีก และโบนัสดาเมจเปิดฉากโจมตี'
      },
      SAGE_ARTISAN_MIND_PALACE: {
        id: 'SAGE_ARTISAN_MIND_PALACE',
        icon: '🏛️',
        nameTh: 'ดาราจักรตำหนักปัญญาปราชญ์สรรค์สร้าง (天工慧心星宿)',
        shortTh: 'ดาราจักรตำหนักปัญญา',
        color: '#52b788',
        starCount: 6,
        studySpeedBonusPerTier: 0.12,
        craftBonusPerTier: 0.10,
        heartDemonResPerTier: 0.15,
        descTh: 'เชื่อมโยงวิชาติดตัวสายปัญญา โอสถ ค่ายกล และการปกครอง เร่งความเร็วศึกษาคัมภีร์ เพิ่มผลผลิตงานช่าง และต้านทานจิตมาร'
      },
      SOVEREIGN_KARMA_BLOOD_SEAL: {
        id: 'SOVEREIGN_KARMA_BLOOD_SEAL',
        icon: '👑',
        nameTh: 'ดาราจักรตราประทับราชันย์และวัฏสงสาร (霸主轮回星宿)',
        shortTh: 'ดาราจักรตราประทับราชันย์',
        color: '#ff4d6d',
        starCount: 7,
        lifestealPerTier: 0.05,
        petPuppetBonusPerTier: 0.12,
        karmaRetributionPerTier: 0.08,
        descTh: 'เชื่อมโยงวิชาติดตัวสายราชันย์อสูร หุ่นเชิด จิตมาร และวัฏสงสาร เพิ่มการดูดเลือด บัญชาอสูร/หุ่นเชิด และสะท้อนวิบากกรรม'
      }
    },

    classifyPassiveTech(t) {
      if (!t) return null;
      if (t.passiveConstellation && this.CONSTELLATIONS[t.passiveConstellation]) return t.passiveConstellation;
      const id = String(t.id || '');
      const name = String(t.nameTh || '');
      const path = String(t.path || '');

      if (/SWORD|BLADE|SPEAR|BOW|กระบี่|ดาบ|ทวน|ศร|คม|สังหาร|ผ่า/.test(id + '|' + name)) {
        return 'SWORD_BLADE_EDGE_CONSTELLATION';
      }
      if (['SHADOW_SAMURAI', 'DIVINE_CHANNELER', 'ARENA_GLORY'].includes(path)) {
        return 'SWORD_BLADE_EDGE_CONSTELLATION';
      }
      if (path === 'BODY' || ['GRAVITY_DAO', 'PRIMORDIAL_SHIFTER', 'DEVOURING_FLESH', 'OCCULT_MAGE', 'DRAGON_VEIN_GEOMANCY'].includes(path) || /กระดูก|กายา|โลหิตมังกร|เหล็ก|ศิลา|ทนทาน|ระฆัง|เกราะ|ค้ำ/.test(name)) {
        return 'TITAN_MARROW_FORTRESS';
      }
      if (path === 'CRAFT_CREATION' || path === 'SAGE_SUPPORT' || path === 'ARRAY_TALISMAN' || path === 'STRATEGY_GOVERNANCE' || ['ASTRO_DIVINATION', 'BUDDHA_DHARMA', 'SONIC_HARMONY', 'MERCANTILE_DAO', 'INK_LITERATI', 'LORE_ARCHIVIST', 'ANCESTRAL_RITUAL', 'SPIRIT_HUSBANDRY'].includes(path) || /โอสถ|หลอม|ค่ายกล|ยันต์|พิณ|หมอ|ปัญญา|คัมภีร์|บริหาร/.test(name)) {
        return 'SAGE_ARTISAN_MIND_PALACE';
      }
      if (path === 'DEMON' || path === 'BEAST_SOVEREIGN' || path === 'MECH_PUPPET' || path === 'KARMA_SAMSARA' || ['VENOM_GU', 'SOUL_PUPPETRY', 'VOID_HERETIC_PACT', 'NETHER_GRAVE', 'DIVINE_SUMMONER', 'DIVINE_POSSESSION', 'FORTUNE_GAMBLER'].includes(path) || /มาร|อสูร|หุ่น|กรรม|วิญญาณ|โลหิต/.test(name)) {
        return 'SOVEREIGN_KARMA_BLOOD_SEAL';
      }
      if (['VOID_SPACE', 'CELESTIAL_WEATHER', 'CHRONO_EPOCH', 'NINPO_SHADOW', 'NINPO_ELEMENTAL', 'TIDE_VOYAGER', 'WANDERING_DAO'].includes(path)) {
        return 'PHANTOM_WIND_SHADOW_WEB';
      }
      if (/เงา|วายุ|พริบตา|ลอบ|เร็ว|คล่องตัว|หลบ/.test(name)) {
        return 'PHANTOM_WIND_SHADOW_WEB';
      }
      if (t.cat === 'PASSIVE' || t.cat === 'INNATE_SUBPATH' || t.cat === 'PASSIVE_GRAND_DAO' || t.cat === 'INNATE_GRAND_DAO' || t.innateOnly || /^INNATE_|^ART_C117_INNATE_/.test(id)) {
        return 'IMMORTAL_MERIDIAN_OCEAN';
      }
      return null;
    },

    initCatalog() {
      const enrichList = list => {
        if (!Array.isArray(list)) return;
        list.forEach(t => {
          const isInnate = !!(t && (t.innateOnly || /^INNATE_|^ART_C117_INNATE_/.test(t.id || '')));
          if (!t || (!isInnate && t.cat !== 'PASSIVE' && t.cat !== 'INNATE_SUBPATH' && t.cat !== 'PASSIVE_GRAND_DAO' && t.cat !== 'INNATE_GRAND_DAO')) return;
          const cId = this.classifyPassiveTech(t);
          if (cId && this.CONSTELLATIONS[cId]) {
            t.passiveConstellation = cId;
            t.constellationSpec = this.CONSTELLATIONS[cId];
          }
        });
      };
      if (JD.TECH) enrichList(JD.TECH.techniques);
      if (JD.MARTIAL) enrichList(JD.MARTIAL.techniques);
    },

    ensureState(n) {
      if (!n) return null;
      if (!n.passiveResonanceState || typeof n.passiveResonanceState !== 'object') {
        n.passiveResonanceState = {
          focusConstellation: 'AUTO',
          awakenedLevel: 1
        };
      }
      return n.passiveResonanceState;
    },

    resolveNpcConstellation(W, n) {
      if (!n || !n.cult) return null;
      const st = n.passiveResonanceState || null;
      const counts = {};
      this.CONSTELLATION_ORDER.forEach(k => { counts[k] = 0; });

      const baseTechs = Array.isArray(n.cult.techs) ? n.cult.techs : [];
      const innTechs = (g.MARTIAL && g.MARTIAL.activeInnateTechs) ? g.MARTIAL.activeInnateTechs(n) : [];
      const seenConstTechs = new Set();
      for (const tid of baseTechs.concat(innTechs)) {
        if (!tid || seenConstTechs.has(tid)) continue;
        seenConstTechs.add(tid);
        const t = TECH_BY_ID[tid];
        if (!t) continue;
        const cId = t.passiveConstellation || ((t.cat === 'PASSIVE' || t.cat === 'INNATE_SUBPATH' || t.cat === 'PASSIVE_GRAND_DAO' || t.cat === 'INNATE_GRAND_DAO' || t.innateOnly || /^INNATE_|^ART_C117_INNATE_/.test(tid)) ? this.classifyPassiveTech(t) : null);
        if (cId && counts[cId] != null) counts[cId] += (t.zeroSlotPassive && t.constellationStarBonus) ? t.constellationStarBonus : 1;
      }

      // Choose dominant or user-focused constellation
      let focusId = (st && st.focusConstellation && this.CONSTELLATIONS[st.focusConstellation]) ? st.focusConstellation : null;
      if (!focusId) {
        focusId = this.CONSTELLATION_ORDER[0];
        let bestCnt = -1;
        this.CONSTELLATION_ORDER.forEach(k => {
          if (counts[k] > bestCnt) { bestCnt = counts[k]; focusId = k; }
        });
      }

      const spec = this.CONSTELLATIONS[focusId] || this.CONSTELLATIONS.SWORD_BLADE_EDGE_CONSTELLATION;
      const matchedCount = counts[focusId] || 0;
      const stg = n.cult.stage || 1;
      const setTier = matchedCount >= 4 ? 3 : matchedCount >= 2 ? 2 : (matchedCount >= 1 || stg >= 3) ? 1 : 1;

      return {
        constellationId: focusId,
        spec,
        setTier,
        matchedPassivesCount: matchedCount,
        totalStars: matchedCount,
        countsByConstellation: counts,
        atkBonusPct: +((spec.atkBonusPerTier || 0.04) * setTier).toFixed(3),
        dmgRedPct: +((spec.dmgRedPerTier || 0.03) * setTier).toFixed(3),
        cultRateBonusPct: +((spec.cultRateBonusPerTier || 0.05) * setTier).toFixed(3)
      };
    },

    setFocusConstellation(W, n, constellationId) {
      if (!n || !n.cult) return null;
      const st = this.ensureState(n);
      st.focusConstellation = (constellationId && this.CONSTELLATIONS[constellationId]) ? constellationId : 'AUTO';
      n._cultRateBase = null;
      return this.resolveNpcConstellation(W, n);
    }
  };
  CULT.PASSIVE_RESONANCE.initCatalog();

  CULT.evaluateAutonomousPostures = (W, n, ctx) => {
    if (!n || !n.cult || n.dead || n.exiled || n.foe) return null;
    ctx = ctx || {};
    const trigger = ctx.trigger || 'hourly';
    const M = g.MARTIAL;
    const effFn = (u, k) => (M && M.eff) ? M.eff(u, k) : (HC && HC.eff ? HC.eff(u, k) : 50);
    const amb = effFn(n, 'personality.ambition');
    const cou = effFn(n, 'personality.courage');
    const caut = effFn(n, 'personality.caution');
    const disc = effFn(n, 'personality.discipline');
    const agg = effFn(n, 'personality.aggression');
    const integ = effFn(n, 'personality.integrity');
    const comp = effFn(n, 'personality.empathy');
    const s = (n.h && n.h.state) || {};
    const hm = Math.max(1, CULT.hpMax(n));
    const hpPct = (s.hp != null ? s.hp : hm) / hm;
    const isZeroQi = !!(CULT.isZeroQiSamurai && CULT.isZeroQiSamurai(n));
    const qm = isZeroQi ? 100 : Math.max(1, CULT.qiMax(n));
    const qiPct = isZeroQi ? 1 : ((s.qi != null ? s.qi : qm) / qm);
    const hd = s.heartDemon || 0;
    const stress = s.stress || 0;
    const tox = n.cult.toxic || 0;
    const th = CULT.threshold ? Math.max(1, CULT.threshold(n)) : 100;
    const progPct = (n.cult.prog || 0) / th;
    const p = n.cult.path;
    const f = ctx.fight || (g.COMBAT && g.COMBAT.fightOf ? g.COMBAT.fightOf(W, n) : null);
    const inCombat = !!(ctx.inCombat || trigger === 'combat' || (n.act && n.act.id === 'fight') || f);
    const isSerious = !!(inCombat && (!f || f.serious || f.kind === 'raid' || f.kind === 'leadership' || f.kind === 'duel'));

    // 1. Mantra Stance
    if (CULT.MANTRA_SYSTEM) {
      const mSt = CULT.MANTRA_SYSTEM.ensureState(n);
      let wantM = 'HARMONIOUS_CIRCULATION';
      let whyM = 'รักษาสมดุลโคจรลมปราณตามปกติ';
      if (hd >= 32 || stress >= 52 || tox >= 28 || hpPct < 0.45 || ['BUDDHA_DHARMA', 'HEART_SOUL', 'SAGE_SUPPORT', 'KARMA_SAMSARA', 'SONIC_HARMONY'].includes(p) || (disc >= 72 && caut >= 60)) {
        wantM = 'SERENE_PURIFICATION';
        whyM = hd >= 32 ? 'สลายจิตมารและความตึงเครียดสะสม' : 'คุมสมาธิและรักษาชีพจรอย่างมั่นคง';
      } else if (
        ((inCombat && hpPct >= 0.55 && qiPct >= 0.35 && hd < 38 && stress < 58 && (amb >= 65 || cou >= 68)) ||
        (!inCombat && progPct >= 0.90 && hpPct >= 0.70 && hd < 32 && amb >= 66 && caut < 58)) &&
        (!n.voluntaryVows || !n.voluntaryVows.VOW_ASCETIC_PRECEPT)
      ) {
        wantM = 'OVERDRIVE_COMBUSTION';
        whyM = inCombat ? 'เร่งปราณปะทุในศึกเพื่อชิงความได้เปรียบ' : 'เร่งโคจรปราณเตรียมทะลวงคอขวด';
      }
      if (mSt.stance !== wantM) CULT.MANTRA_SYSTEM.setMantraStance(W, n, wantM);
      mSt.whyTh = whyM;
    }

    // 2. Defensive Posture
    if (CULT.DEFENSIVE_ARTS) {
      const dSt = CULT.DEFENSIVE_ARTS.ensureState(n);
      let wantD = 'PASSIVE_AURA_GUARD';
      let whyD = 'แผ่ปราณคุ้มกายพื้นฐานประหยัดพลัง';
      if ((inCombat && (hpPct < 0.48 || (f && f.kind === 'raid'))) || ['BODY', 'GOD', 'BUDDHA_DHARMA', 'GRAVITY_DAO', 'STRATEGY_GOVERNANCE', 'DIVINE_POSSESSION'].includes(p) || (caut >= 68 && hpPct < 0.80)) {
        wantD = 'FORTRESS_BASTION_LOCK';
        whyD = hpPct < 0.48 ? 'พลังชีวิตต่ำ ตั้งค่ายปราการลดความเสียหายสูงสุด' : 'ยืนแนวหน้าคุ้มครองตนเองและสหายร่วมสำนัก';
      } else if (
        inCombat || agg >= 58 || cou >= 64 ||
        ['SHADOW_SAMURAI', 'NINPO_SHADOW', 'NINPO_ELEMENTAL', 'ARENA_GLORY', 'DEMON', 'XIAN', 'DEVOURING_FLESH'].includes(p)
      ) {
        if (qiPct >= 0.25) {
          wantD = 'COUNTER_PARRY_STANCE';
          whyD = 'ตั้งท่าสวนกลับและเบี่ยงวิถีโจมตีศัตรู';
        }
      }
      if (dSt.posture !== wantD) CULT.DEFENSIVE_ARTS.setDefensivePosture(W, n, wantD);
      dSt.whyTh = whyD;
    }

    // 3. Support Posture
    if (CULT.SUPPORT_ARTS) {
      const sSt = CULT.SUPPORT_ARTS.ensureState(n);
      let wantS = 'SOUL_MELODY_HARMONY';
      let whyS = 'ผสานปราณสงบจิตใจและฟื้นฟูความเข้าใจ';
      let injuredAllies = (hpPct < 0.72 || (n.inj && n.inj.length > 0)) ? 1 : 0;
      if (!inCombat && W && Array.isArray(W.npcs) && (trigger === 'hourly' || trigger === 'cultivate')) {
        for (let i = 0; i < W.npcs.length; i++) {
          const al = W.npcs[i];
          if (al && !al.dead && !al.away && ((al.inj && al.inj.length) || (al.h && al.h.state && al.h.state.hp < CULT.hpMax(al) * 0.72))) {
            injuredAllies++;
            break;
          }
        }
      }
      if (injuredAllies > 0 || ['SAGE_SUPPORT', 'SPIRIT_HUSBANDRY'].includes(p) || (comp >= 68 && ['BUDDHA_DHARMA', 'GOD'].includes(p))) {
        wantS = 'BENEVOLENT_HEALER_AURA';
        whyS = 'เน้นสมานแผลและเยียวยาอาการบาดเจ็บ';
      } else if (inCombat || ['STRATEGY_GOVERNANCE', 'ARRAY_TALISMAN', 'ASTRO_DIVINATION', 'DRAGON_VEIN_GEOMANCY', 'SHADOW_SAMURAI', 'ARENA_GLORY', 'DIVINE_SUMMONER', 'DIVINE_CHANNELER'].includes(p)) {
        wantS = 'TACTICAL_ARRAY_COMMAND';
        whyS = 'หนุนพลังรบและจังหวะเข้าตีของฝ่ายตน';
      }
      if (sSt.posture !== wantS) CULT.SUPPORT_ARTS.setSupportPosture(W, n, wantS);
      sSt.whyTh = whyS;
    }

    // 4. Forbidden Arts Seal Mode (respecting voluntary vows & Sect Forbidden Vault policy)
    if (CULT.FORBIDDEN_ARTS) {
      const fSt = CULT.FORBIDDEN_ARTS.ensureState(n);
      const hasAsceticVow = !!(n.voluntaryVows && n.voluntaryVows.VOW_ASCETIC_PRECEPT && n.voluntaryVows.VOW_ASCETIC_PRECEPT.active);
      const fvPolicy = (W && W.sect && W.sect.forbiddenVault && W.sect.forbiddenVault.policy) || 'ELDER_LICENSED_ACCESS';
      const strain = fSt.tabooStrain || 0;
      const darkPath = ['DEMON', 'VOID_HERETIC_PACT', 'DEVOURING_FLESH', 'NETHER_GRAVE', 'OCCULT_MAGE', 'VENOM_GU', 'SHADOW_SAMURAI', 'NINPO_SHADOW', 'CORPSE_SOVEREIGN', 'WRAITH_GRIEVANCE', 'DEATHLESS_CADAVER'].includes(p);
      const licensed = fvPolicy === 'UNRESTRICTED_BLOOD_CULT' || (fvPolicy === 'ELDER_LICENSED_ACCESS' && ((n.rank || 0) >= 2 || darkPath || integ < 42));
      let wantF = 'SEALED_RESTRAINT';
      let whyF = 'คงผนึกวิชาต้องห้ามเพื่อถนอมชีพจร';
      if (hasAsceticVow) {
        wantF = 'SEALED_RESTRAINT';
        whyF = 'ยึดมั่นคำสาบานถือศีลพรต ไม่คลายผนึกต้องห้าม';
      } else if (isSerious && strain < 65 && hpPct > 0.14 && (licensed || hpPct < 0.30)) {
        if (hpPct < 0.36 && (cou >= 58 || integ < 45 || darkPath)) {
          wantF = 'BLOOD_TABOO_UNLEASHED';
          whyF = 'เข้าตาจนกลางศึก ยอมแลกโลหิตปลดผนึกต้องห้ามขั้นสูงสุด';
        } else if (agg >= 55 || darkPath || fvPolicy === 'UNRESTRICTED_BLOOD_CULT') {
          wantF = 'HALF_UNSEALED_FLOW';
          whyF = 'คลายผนึกบางส่วนเพื่อเพิ่มอานุภาพในศึกตัดสิน';
        }
      }
      if (fSt.sealMode !== wantF) CULT.FORBIDDEN_ARTS.setForbiddenSealMode(W, n, wantF);
      fSt.whyTh = whyF;
    }

    // 5. Passive Constellation Auto-Focus
    if (CULT.PASSIVE_RESONANCE) {
      const pSt = CULT.PASSIVE_RESONANCE.ensureState(n);
      const pr = CULT.PASSIVE_RESONANCE.resolveNpcConstellation(W, n);
      if (pr && pr.countsByConstellation) {
        let bestC = null, bestCnt = 0;
        for (const k in pr.countsByConstellation) {
          if (pr.countsByConstellation[k] > bestCnt) { bestCnt = pr.countsByConstellation[k]; bestC = k; }
        }
        const targetFocus = bestCnt > 0 && bestC ? bestC : 'AUTO';
        if (pSt.focusConstellation !== targetFocus) CULT.PASSIVE_RESONANCE.setFocusConstellation(W, n, targetFocus);
        pSt.whyTh = bestCnt > 0 ? ('ผสานกับวิชาติดตัวที่เชี่ยวชาญที่สุด (' + bestCnt + ' วิชา)') : 'ปรับตามกลุ่มวิชาและสายวิถีโดยอัตโนมัติ';
      }
    }

    // 6. Auto-select strongest unlocked compatible Mantra outside rapid battle ticks (preserving longevity for aging elders)
    if (!inCombat && M && M.canActivateMantra && Array.isArray(n.cult.unlockedMantras) &&
        (n.cult.unlockedMantras.length > 1 || n.cult.unlockedMantras.some(id => TECH_BY_ID[id]?.transcendent))) {
      const curM = n.cult.mantra ? TECH_BY_ID[n.cult.mantra] : null;
      const ageNow = (HC && HC.ageYears) ? HC.ageYears(n) : 25;
      const lifeNow = CULT.lifespan ? CULT.lifespan(n) : 100;
      const nearOldAge = ageNow >= lifeNow * 0.80 || (lifeNow - ageNow) <= 12;
      const scoreM = mt => {
        if (!mt) return -999;
        let sc = (mt.tier || 1) * 25 + (mt.power || 0) * 0.4 + (mt.sub && mt.sub === n.cult.sub ? 18 : 0);
        if (nearOldAge && (mt.mantraArchetype === 'EVERGREEN_LONGEVITY_SPRING' || mt.mantraArchetype === 'VAJRA_IMMORTAL_BODY_BELL' || /อายุวัฒนะ|นิรันดร์|เต่าดำ|บัวสวรรค์/.test(mt.nameTh || ''))) {
          sc += 95;
        }
        return sc;
      };
      let bestId = n.cult.mantra, bestScore = scoreM(curM);
      for (let i = 0; i < n.cult.unlockedMantras.length; i++) {
        const cid = n.cult.unlockedMantras[i];
        if (cid === n.cult.mantra) continue;
        const can = M.canActivateMantra(n, cid);
        if (!(can === true || (can && can.ok))) continue;
        const cs = scoreM(TECH_BY_ID[cid]);
        if (cs > bestScore + 5) { bestScore = cs; bestId = cid; }
      }
      if (bestId && bestId !== n.cult.mantra) {
        n.cult.mantra = bestId;
        if (HC && HC.bump) HC.bump(n);
        if (M.reconcilePassives) M.reconcilePassives(n);
      }
    }

    // 7. Mech Puppet mid-combat mode switch
    if (p === 'MECH_PUPPET' && CULT.ensureMechState) {
      const ms = CULT.ensureMechState(n);
      if (inCombat) {
        const enemies = f ? (n.side === 'A' ? f.B.length : f.A.length) : 1;
        if (hpPct < 0.44 || (ms.integrity || 100) < 38) ms.mode = 'BASTION';
        else if ((ms.charge || 0) >= 60 && (ms.heat || 0) < 70) ms.mode = 'OVERDRIVE';
        else if (enemies >= 2) ms.mode = 'SWARM';
        else ms.mode = 'SIEGE';
      }
    }

    return true;
  };

  CULT.RECON_STEALTH = {
    getModifiers(n) {
      const out = { stealthBonus: 0, ambushEvadeBonus: 0, trapDetectBonus: 0, spyIntelBonus: 0, firstStrikeCritAdd: 0 };
      if (!n || !n.cult || !Array.isArray(n.cult.techs)) return out;
      for (let i = 0; i < n.cult.techs.length; i++) {
        const t = TECH_BY_ID[n.cult.techs[i]];
        if (!t || (t.role !== 'MOVEMENT_STEALTH_RECON' && t.cat !== 'LIGHTNESS_ART' && t.cat !== 'MOVEMENT_TECHNIQUE')) continue;
        const tier = t.tier || 1;
        const mas = (n.cult.tm && n.cult.tm[t.id]) || 0;
        const scale = (1 + Math.min(0.5, mas / 100)) * tier;
        out.stealthBonus += 4 * scale;
        out.ambushEvadeBonus += 0.03 * scale;
        out.trapDetectBonus += 0.04 * scale;
        out.spyIntelBonus += 3 * scale;
        out.firstStrikeCritAdd += 1.5 * tier;
      }
      return out;
    }
  };

  CULT.PROFESSION_ARTS = {
    getModifiers(n) {
      const out = { alchemyYieldBonus: 0, forgeQualityBonus: 0, herbYieldBonus: 0, mineYieldBonus: 0, studySpeedBonus: 0, beastTameBonus: 0, supplySavePct: 0, farmWardBonus: 0 };
      if (!n || !n.cult || !Array.isArray(n.cult.techs)) return out;
      for (let i = 0; i < n.cult.techs.length; i++) {
        const t = TECH_BY_ID[n.cult.techs[i]];
        if (!t || (t.role !== 'PROFESSION_LIFESTYLE' && t.cat !== 'AUXILIARY_ART' && !/^AUX_/.test(t.id || ''))) continue;
        const tier = t.tier || 1;
        const nm = t.nameTh || '';
        if (/โอสถ|หลอมยา|เพลิงโอสถ|PILL/.test(nm + '|' + t.id)) out.alchemyYieldBonus += 0.04 * tier;
        if (/ตีเหล็ก|หลอมศาสตรา|ทั่ง|WEAPON|FORGE|ค่ายกล|ARRAY/.test(nm + '|' + t.id)) out.forgeQualityBonus += 0.03 * tier;
        if (/สมุนไพร|พฤกษา|เกษตร|ปลูก|ฝนทิพย์/.test(nm)) { out.herbYieldBonus += 0.05 * tier; out.farmWardBonus += 0.05 * tier; }
        if (/เหมือง|ขุดแร่|ธรณี/.test(nm)) out.mineYieldBonus += 0.05 * tier;
        if (/คัมภีร์|อักษร|พู่กัน|ปัญญา/.test(nm)) out.studySpeedBonus += 0.04 * tier;
        if (/อสูร|สัตว์วิญญาณ|BEAST/.test(nm + '|' + t.id)) out.beastTameBonus += 0.05 * tier;
        if (/เสบียง|เดินทาง|ถนอม/.test(nm)) out.supplySavePct += 0.04 * tier;
      }
      return out;
    }
  };

  /* ----- ตั้งต้นการบำเพ็ญ: เปิดเส้นลมปราณ (awakening) ----- */
  CULT.awaken = (npc, rng, bias, day) => {
    ELEM.ensureNpc(npc);
    const ch = CULT.choosePath(npc, rng, bias);
    const mant = CULT.bestMantra(ch.path, 1, npc);
    npc.cult = { path: ch.path, sub: 'NONE', stage: 1, prog: 0, mantra: mant ? mant.id : null, techs: [], learning: null, toxic: 0, lifeBonus: 0, since: day, attempts: 0, secl: null, rate: 0, pillT: 0 };
    ELEM.syncSpecialAccess(npc);
    CULT.refreshLifespan(npc);
    HC.bump(npc);
    return ch;
  };
  CULT.mantraPool = path => JD.TECH.mantras.filter(m => m && m.path === path && (!m.cat || /MANTRA/.test(m.cat)))
    .concat(JD.TECH.techniques.filter(t => (/_MANTRA$|^QI_MANTRA$/.test(t.cat || '')) && t.path === path).map(t => ({ id: t.id, nameTh: t.nameTh, path: t.path, tier: t.tier, reqTier: t.reqTier || t.tier, power: t.power || 0, element: t.element, elementProfile: t.elementProfile, legendary: !!t.legendary, transcendent: !!t.transcendent })))
    .concat((JD.TECH.extraMantras || []).filter(t => t && t.path === path).map(t => ({ id: t.id, nameTh: t.nameTh, path: t.path, tier: t.tier || 1, reqTier: t.reqTier || t.tier || 1, power: t.power || 0, element: t.element, elementProfile: t.elementProfile, legendary: !!t.legendary, transcendent: !!t.transcendent, isExtraMantra: true })));
  CULT.bestMantra = (path, maxTier, npc) => {
    const unlocked = npc && npc.cult && Array.isArray(npc.cult.unlockedMantras) ? npc.cult.unlockedMantras : [];
    const effMax = (npc && npc.cult && npc.cult.path === path && CULT.effectiveTechStage) ? Math.max(maxTier || 1, CULT.effectiveTechStage(npc)) : (maxTier || 1);
    const allForPath = CULT.mantraPool(path);
    let pool = allForPath.filter(m => (m.reqTier || m.tier || 1) <= effMax && (!m.legendary || unlocked.includes(m.id)) && (!m.transcendent || unlocked.includes(m.id)) && (!m.isExtraMantra || unlocked.includes(m.id)));
    if (!pool.length) {
      const nonLeg = allForPath.filter(m => (!m.legendary || unlocked.includes(m.id)) && (!m.transcendent || unlocked.includes(m.id)) && (!m.isExtraMantra || unlocked.includes(m.id)));
      if (nonLeg.length) {
        const minTier = Math.min(...nonLeg.map(m => m.reqTier || m.tier || 1));
        pool = nonLeg.filter(m => (m.reqTier || m.tier || 1) <= Math.max(2, minTier));
      }
    }
    if (npc && npc.h) {
      pool.sort((a, b) => {
        const ca = ELEM.resolveCompatibility(npc, TECH_BY_ID[a.id] || a, 'MANTRA_PRACTICE').cultivationMultiplier;
        const cb = ELEM.resolveCompatibility(npc, TECH_BY_ID[b.id] || b, 'MANTRA_PRACTICE').cultivationMultiplier;
        const effA = ((a.tier || 1) * 100 + (a.power || 0)) * (0.75 + 0.25 * ca);
        const effB = ((b.tier || 1) * 100 + (b.power || 0)) * (0.75 + 0.25 * cb);
        return effB - effA;
      });
    } else {
      pool.sort((a, b) => (b.tier || 1) - (a.tier || 1) || (b.power || 0) - (a.power || 0));
    }
    return pool[0] || null;
  };

  /* ----- อัตราบำเพ็ญ (แต้มต่อชั่วโมงเกม) ----- */
  CULT.rate = (npc, env) => {
    const c = npc.cult; if (!c) return 0;
    let staticBase;
    let rc = npc._cultRateBase;
    const ritVal = npc.h.skills.ritual || 0, focVal = npc.h.intellect.focus || 0;
    const professionSig = c.path === 'CRAFT_CREATION' ? Math.max(npc.h.skills.ALCHEMY || 0, npc.h.skills.FORGING || 0, npc.h.skills.ARRAY || 0, npc.h.skills.TALISMAN || 0) : c.path === 'ARRAY_TALISMAN' ? ((npc.h.skills.ARRAY | 0) * 256 + (npc.h.skills.TALISMAN | 0)) : c.path === 'STRATEGY_GOVERNANCE' ? ((npc.h.skills.administration | 0) * 65536 + (npc.h.skills.diplomacy | 0) * 256 + (npc.h.skills.trading | 0)) : 0;
    const curSkVer = npc._pathSkillVersion || 0;
    if (rc && rc.professionSig === professionSig && rc.day === HC.nowDay && rc.ver === npc._ver && rc.pver === (npc._passVer || 0) && rc.path === c.path && rc.sub === c.sub && rc.st === c.stage && rc.mantra === c.mantra) {
      if (rc.skillVer === curSkVer && rc.rit === ritVal && rc.foc === focVal && rc.fullVal !== undefined) {
        staticBase = rc.fullVal;
      } else {
        const focus = 0.65 + 0.35 * HC.eff(npc, 'intellect.focus') / 100;
        const ritMult = g.MARTIAL ? g.MARTIAL.skillEffects(npc).cultivation : 1;
        rc.skillVer = curSkVer; rc.rit = ritVal; rc.foc = focVal;
        staticBase = rc.fullVal = rc.val * ritMult * focus;
      }
    } else {
      ELEM.ensureNpc(npc);
      const root = HC.ROOT_BY_ID[npc.h.root.grade] || HC.ROOT_BY_ID.MORTAL;
      const cultTalent = (npc._d && npc._d.day === HC.nowDay && npc._d.ver === npc._ver)
        ? npc._d.cultivationTalent
        : clamp((HC.eff(npc, "aptitudes.cultivation") * 0.45 + HC.eff(npc, "intellect.comprehension") * 0.15 + HC.eff(npc, "physiology.meridianCapacity") * 0.15 + HC.eff(npc, "physiology.spiritualFoundation") * 0.15 + HC.eff(npc, "physiology.meridianIntegrity") * 0.1) * (0.78 + root.tier * 0.1), 0, 130);
      const talent = clamp(cultTalent / 62, 0.35, 2.4);
      let base;
      if (c.path === 'XIAN') base = 1.0 * talent * root.cultivationMult;
      else if (c.path === 'BODY') base = 0.9 * clamp((HC.eff(npc, 'physiology.strength') + HC.eff(npc, 'physiology.toughness') + HC.eff(npc, 'physiology.endurance') + HC.eff(npc, 'aptitudes.cultivation')) / 4 / 55, 0.35, 2.2) * (0.8 + 0.4 * root.bodySynergy);
      else if (c.path === 'DEMON') {
        const demonApt = (cultTalent * 0.45 + HC.eff(npc, 'personality.ambition') * 0.25 + HC.eff(npc, 'personality.aggression') * 0.15 + Math.max(HC.eff(npc, 'affinities.YIN_SHADOW'), HC.eff(npc, 'affinities.POISON')) * 0.15) / 55;
        base = 1.05 * clamp(demonApt, 0.4, 2.45) * (0.85 + 0.2 * root.cultivationMult);
      } else if (c.path === 'HEART_SOUL') {
        const soulApt = (HC.eff(npc, 'intellect.comprehension') * 0.35 + HC.eff(npc, 'intellect.willpower') * 0.25 + HC.eff(npc, 'personality.composure') * 0.25 + HC.eff(npc, 'physiology.spiritualFoundation') * 0.15) / 54;
        base = 0.98 * clamp(soulApt, 0.4, 2.35) * (0.9 + 0.15 * root.cultivationMult);
      } else if (c.path === 'MECH_PUPPET') {
        const mechApt = (HC.eff(npc, 'intellect.inventiveness') * 0.35 + HC.eff(npc, 'physiology.dexterity') * 0.25 + HC.eff(npc, 'affinities.FORGING') * 0.25 + HC.eff(npc, 'aptitudes.crafting') * 0.15) / 54;
        base = 0.98 * clamp(mechApt, 0.4, 2.35) * (0.88 + 0.16 * root.cultivationMult);
      } else if (c.path === 'KARMA_SAMSARA') {
        const karmaApt = (HC.eff(npc, 'intellect.wisdom') * 0.35 + HC.eff(npc, 'personality.composure') * 0.30 + HC.eff(npc, 'affinities.SCRIPTURE') * 0.20 + HC.eff(npc, 'intellect.willpower') * 0.15) / 54;
        base = 0.99 * clamp(karmaApt, 0.4, 2.35) * (0.9 + 0.15 * root.cultivationMult);
      } else if (c.path === 'BEAST_SOVEREIGN') {
        const beastApt = (HC.eff(npc, 'affinities.BEAST_TAMING') * 0.40 + HC.eff(npc, 'interests.beasts') * 0.25 + HC.eff(npc, 'physiology.vitality') * 0.20 + HC.eff(npc, 'aptitudes.command') * 0.15) / 54;
        base = 0.98 * clamp(beastApt, 0.4, 2.35) * (0.88 + 0.16 * root.cultivationMult);
      } else if (c.path === 'SAGE_SUPPORT') {
        const sageApt = (HC.eff(npc, 'affinities.MEDICINE') * 0.35 + HC.eff(npc, 'affinities.ALCHEMY') * 0.25 + HC.eff(npc, 'personality.empathy') * 0.25 + HC.eff(npc, 'physiology.spiritualFoundation') * 0.15) / 54;
        base = 1.00 * clamp(sageApt, 0.4, 2.38) * (0.90 + 0.16 * root.cultivationMult);
      } else if (c.path === 'CRAFT_CREATION') {
        const prodSkill = Math.max(npc.h.skills.ALCHEMY || 0, npc.h.skills.FORGING || 0, npc.h.skills.ARRAY || 0, npc.h.skills.TALISMAN || 0);
        const craftApt = (Math.max(HC.eff(npc, 'affinities.ALCHEMY'), HC.eff(npc, 'affinities.FORGING')) * 0.30 + HC.eff(npc, 'aptitudes.crafting') * 0.25 + HC.eff(npc, 'intellect.inventiveness') * 0.20 + HC.eff(npc, 'physiology.dexterity') * 0.15 + prodSkill * 0.25) / 54;
        base = 1.02 * clamp(craftApt, 0.42, 2.45) * (0.90 + 0.16 * root.cultivationMult);
      } else if (c.path === 'ARRAY_TALISMAN') {
        const artSkill = Math.max(npc.h.skills.ARRAY || 0, npc.h.skills.TALISMAN || 0);
        const arrayApt = (Math.max(HC.eff(npc, 'affinities.ARRAY'), HC.eff(npc, 'affinities.TALISMAN')) * 0.30 + HC.eff(npc, 'intellect.planning') * 0.25 + HC.eff(npc, 'intellect.comprehension') * 0.20 + HC.eff(npc, 'aptitudes.crafting') * 0.15 + artSkill * 0.20) / 54;
        base = 1.00 * clamp(arrayApt, 0.40, 2.40) * (0.90 + 0.16 * root.cultivationMult);
      } else if (c.path === 'GOD') {
        const worshipBase = (HC.eff(npc, 'social.charisma') * 0.28 + HC.eff(npc, 'intellect.willpower') * 0.24 + HC.eff(npc, 'interests.worship') * 0.24 + HC.eff(npc, 'affinities.SOUL_DIVINE') * 0.16 + ((npc.h && npc.h.skills && npc.h.skills.ritual) || 0) * 0.16) / 52;
        base = 0.96 * clamp(worshipBase, 0.38, 2.40) * (0.88 + 0.18 * root.cultivationMult);
      } else if (c.path === 'STRATEGY_GOVERNANCE') {
        const civicSkill = Math.max(npc.h.skills.administration || 0, npc.h.skills.diplomacy || 0, npc.h.skills.trading || 0);
        const civicApt = (HC.eff(npc, 'intellect.planning') * 0.25 + HC.eff(npc, 'intellect.judgement') * 0.20 + HC.eff(npc, 'social.leadership') * 0.20 + HC.eff(npc, 'values.sectDuty') * 0.15 + civicSkill * 0.25) / 54;
        base = 0.99 * clamp(civicApt, 0.40, 2.38) * (0.90 + 0.16 * root.cultivationMult);
      } else {
        base = 0.96 * clamp((HC.eff(npc, 'aptitudes.cultivation') * 0.45 + HC.eff(npc, 'intellect.comprehension') * 0.30 + HC.eff(npc, 'intellect.willpower') * 0.25) / 54, 0.38, 2.35) * (0.88 + 0.18 * root.cultivationMult);
      }
      const m = c.mantra ? TECH_BY_ID[c.mantra] : null;
      const mantraK = m ? 1 + 0.11 * (m.tier - 1) : 0.9;
      let elemRateFactor;
      if (rc && rc.day === HC.nowDay && rc.path === c.path && rc.sub === c.sub && rc.mantra === c.mantra && rc.root === npc.h.root && rc.elemRateFactor !== undefined) {
        elemRateFactor = rc.elemRateFactor;
      } else {
        const mantraElemMult = m ? ELEM.resolveCompatibility(npc, m, 'MANTRA_PRACTICE').cultivationMultiplier : 1.0;
        const subObj = c.sub && c.sub !== 'NONE' ? CULT.subInfo(c.path, c.sub) : CULT.PATHS[c.path];
        const subElemMult = subObj ? ELEM.resolveCompatibility(npc, subObj, 'CULTIVATION_TICK').cultivationMultiplier : 1.0;
        elemRateFactor = clamp(0.60 * mantraElemMult + 0.40 * subElemMult, 0.72, 1.38);
      }

      const sp = 1 + HC.special(npc, 'cultivation.rateBonus');
      const passRate = (g.MARTIAL && g.MARTIAL.passiveStats ? g.MARTIAL.passiveStats(npc).cultRatePct : 0) || 0;
      const innRate = (g.MARTIAL && g.MARTIAL.innateStats ? g.MARTIAL.innateStats(npc).cultRatePct : 0) || 0;
      const manRate = (m && m.mantraBonus && m.mantraBonus.cultRatePct) || 0;
      const rawStatic = base * mantraK * elemRateFactor * sp * (1 + passRate + innRate + manRate);
      const focus = 0.65 + 0.35 * HC.eff(npc, 'intellect.focus') / 100;
      const ritMult = g.MARTIAL ? g.MARTIAL.skillEffects(npc).cultivation : 1;
      staticBase = rawStatic * ritMult * focus;
      npc._cultRateBase = { day: HC.nowDay, ver: npc._ver, pver: npc._passVer || 0, path: c.path, sub: c.sub, st: c.stage, mantra: c.mantra, root: npc.h.root, elemRateFactor, skillVer: npc._pathSkillVersion || 0, professionSig, val: rawStatic, rit: ritVal, foc: focVal, fullVal: staticBase };
    }
    const rest = npc.h.state.rest < 30 ? 0.6 : npc.h.state.rest < 55 ? 0.85 : 1;
    const hd = npc.h.state.heartDemon || 0;
    rc = npc._cultRateBase;
    const df = (c.path === 'GOD' && CULT.getDivineFaith) ? CULT.getDivineFaith(null, npc) : -1;
    const faithMult = c.path === 'GOD' ? (df < 20 ? 0.55 : clamp(0.65 + (df / 100) * 0.70, 0.65, 1.35)) : 1;
    const bodyTempFlag = c.path === 'BODY' ? ((c.bodyTemperT > 0 ? 1 : 0) + (c.pillT > 0 ? 2 : 0)) : -1;
    const bodyTempMult = (c.path === 'BODY' && c.bodyTemperT > 0) ? 1.15 : 1;
    const oathObj = npc.daoOath || (npc.ext && npc.ext.daoOath);
    const hasOath = !!(oathObj && oathObj.upheld && Number.isFinite(oathObj.cultSpeedBonus));
    const hasMeridianInj = !!(Array.isArray(npc.inj) && npc.inj.length > 0);
    if (rc && rc.hasFocusWin === undefined) {
      const kwNow = (g.COMBAT && g.COMBAT.keywordsOf) ? g.COMBAT.keywordsOf(npc) : null;
      rc.hasFocusWin = !!(kwNow && kwNow.focusWindow);
    }
    const hasFocusWin = rc ? !!rc.hasFocusWin : !!((g.COMBAT && g.COMBAT.keywordsOf && g.COMBAT.keywordsOf(npc) || {}).focusWindow);
    let toxic, dev;
    if (c.path === 'DEMON' || c.path === 'VENOM_GU') {
      toxic = 1 - clamp(c.toxic / ((c.path === 'VENOM_GU' || c.sub === 'VENOM_GU_SOVEREIGN') ? 360 : 240), 0, 0.28);
      dev = c.path === 'DEMON'
        ? (hd <= 60 ? (1 + (hd / 60) * 0.22) : Math.max(0.55, 1.22 - ((hd - 60) / 40) * 0.65))
        : (1 - clamp(hd / 200, 0, 0.4));
    } else if (c.path === 'HEART_SOUL') {
      toxic = 1 - clamp(c.toxic / 140, 0, 0.5);
      const stressPen = clamp(Math.max(0, (npc.h.state.stress || 0) - 45) / 150, 0, 0.25);
      dev = (hd <= 10 && (npc.h.state.stress || 0) <= 25) ? 1.15 : Math.max(0.35, 1 - clamp(hd / 140, 0, 0.55) - stressPen);
    } else {
      toxic = 1 - clamp(c.toxic / 140, 0, 0.5);
      dev = 1 - clamp(hd / 200, 0, 0.4);
    }
    const pill = c.pillT > 0 ? 1 + (c.pillBoost || 0) : 1;
    let buffMult = 1;
    if (npc.buffs && npc.buffs.length > 0) {
      const tNow = (g.STATS && g.STATS.now) || 0;
      for (let i = 0; i < npc.buffs.length; i++) {
        const b = npc.buffs[i];
        if (b && b.until > tNow && (b.id === 'meridianUnblock' || b.id === 'clarityLotus' || b.cultRateBonus > 0)) {
          const bonus = Number.isFinite(b.cultRateBonus) ? b.cultRateBonus : 0.15;
          buffMult = Math.max(buffMult, 1 + clamp(bonus, 0, 0.30));
        }
      }
    }
    const wRefGlobal = (g.SECT && g.SECT.PEAKS && g.SECT.PEAKS._activeWorld) || g.W || (g.G && g.G.W);
    const msSig = npc.mantraState ? ((npc.mantraState.stance || '') + ':' + (wRefGlobal && wRefGlobal.weather ? (wRefGlobal.weather.kind || '') : '')) : '';
    const fbSig = npc.forbiddenArtState ? (npc.forbiddenArtState.sealMode || '') : '';
    const fwSig = (wRefGlobal && wRefGlobal.sect && wRefGlobal.sect.formationWarfare) ? (wRefGlobal.sect.formationWarfare.activeStance || '') : '';
    const injLen = Array.isArray(npc.inj) ? npc.inj.length : 0;
    const compId = npc.companionId || (npc.h && npc.h.companionId) || '';
    const canCacheSemi = !hasOath && !npc.demonPact && !npc.demonicPact && !npc.apexDaoTitle && !(npc.experienceTraits && npc.experienceTraits.length) && !(npc.originArc && npc.originArc.awakenedDestinyTrait) && !npc.charterLoyaltyBonus;
    let semiStaticMult;
    if (rc && canCacheSemi && rc.semiStaticMult !== undefined && rc.sMs === msSig && rc.sFb === fbSig && rc.sFw === fwSig && rc.sInj === injLen && rc.sComp === compId && rc.sPk === (npc.peakId || '') && rc.sInd === !!npc.isIndependentFromPeak && rc.sFoc === hasFocusWin) {
      semiStaticMult = rc.semiStaticMult;
    } else {
      const imprintMult = (npc.mentorImprint && Number.isFinite(npc.mentorImprint.cultRateBonus)) ? (1 + npc.mentorImprint.cultRateBonus) : 1;
      const compMult = compId ? (1 + (Number.isFinite(npc.companionSynergyBonus) ? npc.companionSynergyBonus : 0.25)) : 1;
      const bloodMult = (npc.bloodlineTrait && Number.isFinite(npc.bloodlineTrait.cultRateBonus)) ? (1 + npc.bloodlineTrait.cultRateBonus) : 1;
      const oathMult = hasOath ? (1 + clamp(oathObj.cultSpeedBonus, 0.05, 0.35)) : 1;
      let meridianInjMult = 1;
      if (hasMeridianInj) {
        for (let ii = 0; ii < npc.inj.length; ii++) {
          const inj = npc.inj[ii];
          if (inj && (inj.id === 'MERIDIAN_OVERDRIVE_BACKLASH' || (inj.part && (inj.part.includes('ชีพจรปกครองร้าว') || inj.part.includes('เส้นลมปราณพิสดาร'))))) {
            meridianInjMult = 1 - clamp(inj.cultPenaltyPct || 0.30, 0.10, 0.50);
            break;
          }
        }
      }
      let peakMult = 1;
      if (npc.peakId && g.SECT && g.SECT.PEAKS && g.SECT.PEAKS.cultivationBonusFor) {
        const pb = g.SECT.PEAKS.cultivationBonusFor(wRefGlobal, npc);
        if (pb > 0) peakMult = 1 + pb;
      } else if (npc.isIndependentFromPeak && Number.isFinite(npc.independentPenaltyMult)) {
        peakMult = npc.independentPenaltyMult;
      }
      const originMult = (npc.originArc && npc.originArc.awakenedDestinyTrait && Number.isFinite(npc.originArc.awakenedDestinyTrait.cultRateBonus))
        ? (1 + npc.originArc.awakenedDestinyTrait.cultRateBonus) : 1;
      let charterMult = 1;
      if (npc.charterLoyaltyBonus && g.SECT && g.SECT.CHARTER_DOCTRINE) {
        const cp = wRefGlobal && wRefGlobal.sect && wRefGlobal.sect.charter && wRefGlobal.sect.charter.perks;
        if (cp && Number.isFinite(cp.cultRateBonus)) charterMult = 1 + cp.cultRateBonus;
      }
      let mantraStanceMult = 1;
      if (npc.mantraState && CULT.MANTRA_SYSTEM) {
        const mr = CULT.MANTRA_SYSTEM.resolveNpcMantra(wRefGlobal, npc);
        if (mr) mantraStanceMult = mr.effectiveCultMult || 1;
      } else if (fwSig === 'FIVE_ELEMENT_NURTURE') {
        mantraStanceMult = 1.20;
      }
      let forbiddenAndPassiveMult = 1;
      if (npc.forbiddenArtState && CULT.FORBIDDEN_ARTS) {
        const fb = CULT.FORBIDDEN_ARTS.resolveNpcForbidden(null, npc);
        if (fb && fb.effCultMult > 1) forbiddenAndPassiveMult *= fb.effCultMult;
      }
      if (npc.passiveResonanceState && CULT.PASSIVE_RESONANCE) {
        const pr = CULT.PASSIVE_RESONANCE.resolveNpcConstellation(null, npc);
        if (pr && pr.cultRateBonusPct > 0) forbiddenAndPassiveMult *= (1 + pr.cultRateBonusPct);
      }
      let focusWindowMult = 1;
      if (hasFocusWin) {
        const stg = c.stage || 1;
        focusWindowMult = stg <= 3 ? 1.15 : (stg >= 7 ? 0.90 : 1.05);
      }
      let vowAndTraitMult = 1;
      if (npc.voluntaryVows && CULT.VOLUNTARY_VOWS) {
        const vb = CULT.VOLUNTARY_VOWS.getCultivationMult(npc);
        if (vb && vb !== 1) vowAndTraitMult *= vb;
      }
      if (npc.experienceTraits && CULT.EXPERIENCE_TRAITS) {
        const et = CULT.EXPERIENCE_TRAITS.getCultivationMult(npc);
        if (et && et !== 1) vowAndTraitMult *= et;
      }
      if ((npc.demonPact || npc.demonicPact) && CULT.DEMONIC_PANTHEON && CULT.DEMONIC_PANTHEON.getUnitBlessingBonuses) {
        const dpb = CULT.DEMONIC_PANTHEON.getUnitBlessingBonuses(npc);
        if (dpb && dpb.active && dpb.cultRatePct) vowAndTraitMult *= (1 + dpb.cultRatePct);
      }
      if (npc.apexDaoTitle && npc.apexDaoTitle.bonuses && npc.apexDaoTitle.bonuses.cultRatePct) {
        vowAndTraitMult *= (1 + npc.apexDaoTitle.bonuses.cultRatePct);
      }
      if (wRefGlobal && g.SECT && g.SECT.INFERNAL_SHRINE && g.SECT.INFERNAL_SHRINE.getShrineBuffs) {
        const sb = g.SECT.INFERNAL_SHRINE.getShrineBuffs(wRefGlobal);
        if (sb && sb.active && sb.demonicRateBonus > 0 && (['DEMON', 'VOID_HERETIC_PACT', 'DEVOURING_FLESH', 'NETHER_GRAVE', 'SOUL_PUPPETRY', 'VENOM_GU'].includes(c.path) || npc.demonPact || npc.demonicPact)) {
          vowAndTraitMult *= (1 + sb.demonicRateBonus);
        }
      }
      semiStaticMult = imprintMult * compMult * bloodMult * oathMult * meridianInjMult * peakMult * originMult * charterMult * mantraStanceMult * forbiddenAndPassiveMult * focusWindowMult * vowAndTraitMult;
      if (rc && canCacheSemi) {
        rc.semiStaticMult = semiStaticMult; rc.sMs = msSig; rc.sFb = fbSig; rc.sFw = fwSig; rc.sInj = injLen; rc.sComp = compId; rc.sPk = npc.peakId || ''; rc.sInd = !!npc.isIndependentFromPeak; rc.sFoc = hasFocusWin;
      }
    }
    const _festRateMult = (g.EXPED && g.EXPED.ANNUAL_FESTIVALS && g.EXPED.ANNUAL_FESTIVALS.getActiveModifiers && wRefGlobal) ? g.EXPED.ANNUAL_FESTIVALS.getActiveModifiers(wRefGlobal).cultRateMult : 1;
    const dynMult = rest * toxic * dev * pill * buffMult * semiStaticMult * faithMult * bodyTempMult * _festRateMult;
    return staticBase * dynMult * (env || 1);
  };
  CULT.hasActiveCompanionInSect = (npc, W) => {
    if (!npc) return false;
    const compId = npc.companionId || (npc.h && npc.h.companionId);
    if (!compId) return false;
    if (!W || !W.byId) return true;
    const partner = W.byId[compId];
    return !!(partner && !partner.dead && !partner.exiled);
  };
  /* === JS2_DEEP_B_SECRET_SUBPATH_MODS_START === */
  CULT.secretSubPathMods = (npc) => {
    const out = { powerMult: 1, gainMult: 1, btBonus: 0, defBonus: 0, dmgMitigation: 0, heartDemonCalm: 0 };
    if (!npc) return out;
    const sp = npc.secretSubPathId;
    if (sp === 'BREATH_RELAY_DAO') {
      out.powerMult *= 1.10;
      out.gainMult *= 1.12;
      out.btBonus += 0.06;
      out.heartDemonCalm += 0.35;
    } else if (sp === 'SHADOW_RADIANCE_SUBPATH') {
      out.powerMult *= 1.16;
      out.gainMult *= 1.15;
      out.btBonus += 0.08;
      out.dmgMitigation += 0.18;
    } else if (sp === 'PENDING_REGISTRY_PATH') {
      const tier = clamp(npc.pendingCountdownTier == null ? 5 : Number(npc.pendingCountdownTier), 0, 5);
      const steps = 6 - tier; // 1 at Tier 5 -> 6 at Tier 0
      out.powerMult *= (1 + steps * 0.03);
      out.btBonus += steps * 0.015;
      out.dmgMitigation += steps * 0.03;
      out.heartDemonCalm += steps * 0.25;
    }
    const ft = npc.folkTraitId;
    if (ft === 'TR_FOLK_ROPE_BEARER') out.defBonus += 0.05;
    else if (ft === 'TR_FOLK_SCALE_WALKER') out.gainMult *= 1.05;
    else if (ft === 'TR_FOLK_LINGERING_BREATH') { out.gainMult *= 1.06; out.btBonus += 0.04; }
    return out;
  };
  /* === JS2_DEEP_B_SECRET_SUBPATH_MODS_END === */
  CULT.gain = (npc, pts, W, sourceTag) => {
    const c = npc.cult; if (!c) return;
    const ascendedCount = (W && W.sect && W.sect.ascendedLegacyCount > 0 && W.byId && W.byId[npc.id] === npc) ? W.sect.ascendedLegacyCount : 0;
    if (ascendedCount) pts *= 1 + Math.min(5, ascendedCount) * 0.01;
    if (CULT.hasActiveCompanionInSect(npc, W) && sourceTag !== 'dual_cult_raw' && sourceTag !== 'cultivate_rate') {
      const synBonus = Number.isFinite(npc.companionSynergyBonus) ? npc.companionSynergyBonus : 0.25;
      pts *= (1 + synBonus);
      if (npc.h && npc.h.state && (npc.h.state.heartDemon || 0) > 0) {
        npc.h.state.heartDemon = Math.max(0, npc.h.state.heartDemon - 1.5);
      }
    } else if (CULT.hasActiveCompanionInSect(npc, W) && sourceTag === 'cultivate_rate') {
      if (npc.h && npc.h.state && (npc.h.state.heartDemon || 0) > 0) {
        npc.h.state.heartDemon = Math.max(0, npc.h.state.heartDemon - 0.05);
      }
    }
    if (npc.bloodlineTrait && Number.isFinite(npc.bloodlineTrait.cultRateBonus) && sourceTag !== 'bloodline_raw' && sourceTag !== 'cultivate_rate') {
      pts *= (1 + npc.bloodlineTrait.cultRateBonus);
    }
    if (npc.secretSubPathId || npc.folkTraitId) {
      const spm = CULT.secretSubPathMods(npc);
      if (sourceTag !== 'cultivate_rate') pts *= spm.gainMult;
      if (spm.heartDemonCalm > 0 && npc.h && npc.h.state && (npc.h.state.heartDemon || 0) > 0) {
        npc.h.state.heartDemon = Math.max(0, npc.h.state.heartDemon - spm.heartDemonCalm);
      }
    }
    const th = CULT.threshold(npc);
    if (c.prog >= th) { c.found = Math.min(0.08, (c.found || 0) + pts * 0.0002); pts *= 0.15; }
    c.prog += pts;
    if (c.prog > th * 1.25) c.prog = th * 1.25;

    const tr = c.track;
    if (tr) {
      const trTh = tr.ordinal >= 9 ? Infinity : (TRACK_THRESH_CURVE[tr.ordinal - 1] || 150000);
      if (trTh !== Infinity) {
        let trPts = pts;
        if (tr.prog >= trTh) trPts *= 0.15;
        tr.prog += trPts;
        if (tr.prog > trTh * 1.25) tr.prog = trTh * 1.25;
      }
    }
  };
  CULT.ready = npc => !!npc.cult && npc.cult.stage < CULT.maxStage(npc) && npc.cult.prog >= CULT.threshold(npc);

  /* ----- กำลังรบ ----- */
  CULT.power = (npc, opts) => {
    const d = HC.derived(npc), s = npc.h.state, hpMax = CULT.hpMax(npc);
    const st = CULT.stageInfo(npc);
    let cp = st.combatPower;
    if (npc.cult) { const si = CULT.subInfo(npc.cult.path, npc.cult.sub); cp *= si.combatBonus; }
    if (npc.cult && npc.cult.path === 'GOD') {
      const df = CULT.getDivineFaith ? CULT.getDivineFaith(null, npc) : 55;
      if (df < 20 || npc.divineWaning) cp *= 0.75;
    }
    const f_body = 0.7 + d.physicalIndex / 100 * 0.6;
    const sk = npc.h.skills; const martial = Math.max(sk.SWORD || 0, sk.BLADE || 0, sk.SPEAR || 0, sk.FIST_PALM || 0, sk.BOW || 0, sk.STAFF || 0, sk.FOCUS || 0, sk.ZITHER || 0, sk.BRUSH || 0, sk.WHIP || 0, sk.ROSARY || 0, sk.CLAW || 0, sk.NEEDLE || 0, sk.FAN || 0, sk.ASTROLABE || 0, sk.ABACUS || 0, sk.BODY_REFINING || 0, sk.SOUL_DIVINE || 0, sk.POISON || 0, sk.BEAST_TAMING || 0, sk.FORGING || 0, sk.ALCHEMY || 0, sk.MEDICINE || 0, sk.ARRAY || 0, sk.TALISMAN || 0, sk.SCRIPTURE || 0, sk.administration || 0, sk.diplomacy || 0);
    const f_skill = 0.75 + martial / 100 * 0.5;
    let techSum = 0; (npc.cult ? npc.cult.techs : []).forEach(id => { const t = TECH_BY_ID[id]; if (t) techSum += t.tier; });
    const f_tech = 1 + Math.min(0.4, 0.04 * techSum);
    let eq = 0; const E = npc.equip || {}; for (const k in E) if (E[k] && E[k].combatMult) eq += E[k].combatMult * (E[k].dur == null ? 1 : clamp(E[k].dur / 100, 0.3, 1));
    const hdFactor = (npc.cult && npc.cult.path === 'DEMON')
      ? ((s.heartDemon || 0) <= 65 ? 1 + 0.12 * ((s.heartDemon || 0) / 65) : 1 - 0.25 * (((s.heartDemon || 0) - 65) / 35))
      : (1 - 0.3 * (s.heartDemon || 0) / 100);
    const f_state = (0.35 + 0.65 * clamp(s.hp / hpMax, 0, 1)) * (0.75 + 0.25 * s.energy / 100) * hdFactor;
    const f_mind = 0.9 + HC.eff(npc, 'personality.courage') / 100 * 0.12 + HC.eff(npc, 'aptitudes.combat') / 100 * 0.18;
    const petMult = (CULT.petCombatMultiplier && (!opts || !opts.noPets)) ? CULT.petCombatMultiplier(npc) : 1;
    const bloodPowerMult = (npc.bloodlineTrait && Number.isFinite(npc.bloodlineTrait.combatPowerBonus)) ? (1 + npc.bloodlineTrait.combatPowerBonus) : 1;
    const scarPowerMult = (Array.isArray(npc.daoScars) && npc.daoScars.length)
      ? (1 + Math.min(0.24, npc.daoScars.reduce((sum, sc) => sum + ((sc && sc.combatPowerBonus) || 0), 0)))
      : 1;
    const wSpiritMult = (npc.equip && npc.equip.WEAPON && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(npc, npc.equip.WEAPON)) && npc.equip.WEAPON.weaponSpirit && Number.isFinite(npc.equip.WEAPON.weaponSpirit.multBonus))
      ? (1 + Math.min(0.32, npc.equip.WEAPON.weaponSpirit.multBonus))
      : 1;
    const titleMult = (Array.isArray(npc.assemblyTitles) && npc.assemblyTitles.length)
      ? (1 + Math.min(0.18, npc.assemblyTitles.length * 0.06))
      : 1;
    const secretSubMult = (npc.secretSubPathId || npc.folkTraitId) ? CULT.secretSubPathMods(npc).powerMult : 1;
    cp = cp * f_body * f_skill * f_tech * (1 + eq) * HC.special(npc, 'combat.powerMult') * f_state * f_mind * petMult * bloodPowerMult * scarPowerMult * wSpiritMult * titleMult * secretSubMult;
    return Math.max(3, cp);
  };
  CULT.defenseMult = npc => { let d = 0; const E = npc.equip || {}; for (const k in E) if (E[k] && E[k].defMult) d += E[k].defMult; if (npc && (npc.secretSubPathId || npc.folkTraitId)) d += CULT.secretSubPathMods(npc).defBonus; return 1 + d; };

  /* ----- ทะลวงขั้น ----- */
  CULT.isAncestralBlessingActive = (npc, now) => {
    const ab = npc && npc.ancestralBlessing;
    if (!ab) return false;
    const tNow = Number.isFinite(now) ? now : (g.STATS && Number.isFinite(g.STATS.now) && g.STATS.now > 0 ? g.STATS.now : null);
    if (ab.until != null && tNow != null) return ab.until >= tNow;
    if (ab.untilDay != null && HC.nowDay != null && HC.nowDay > 0) return ab.untilDay >= HC.nowDay;
    return true;
  };
  CULT.breakthroughChance = (npc, prep) => {
    ELEM.ensureNpc(npc);
    const c = npc.cult; const st = CULT.PATHS[c.path].stages[c.stage - 1];
    const si = CULT.subInfo(c.path, c.sub);
    let p = st.breakthroughBaseChance * si.breakthroughMod;
    const root = HC.ROOT_BY_ID[npc.h.root.grade] || HC.ROOT_BY_ID.MORTAL;
    p *= 0.72 + clamp(HC.derived(npc).cultivationTalent, 20, 120) / 200;
    p += root.breakthroughBonus;
    const m = c.mantra ? TECH_BY_ID[c.mantra] : null;
    const btTarget = m || (c.sub && c.sub !== 'NONE' ? si : CULT.PATHS[c.path]);
    const elemBt = ELEM.resolveCompatibility(npc, btTarget, 'BREAKTHROUGH');
    p += elemBt.breakthroughBonus * 0.5;
    p += (HC.eff(npc, 'personality.composure') - 50) / 50 * 0.08 + (HC.eff(npc, 'intellect.willpower') - 50) / 50 * 0.08 + (HC.eff(npc, 'physiology.spiritualFoundation') - 50) / 50 * 0.06;
    p += HC.special(npc, 'cultivation.breakthroughBonus');
    if (npc.secretSubPathId || npc.folkTraitId) p += CULT.secretSubPathMods(npc).btBonus;
    let equipTribBonus = 0;
    if (npc.equip) {
      if (npc._eqTribC && npc._eqTribC.ver === npc._ver) {
        equipTribBonus = npc._eqTribC.val;
      } else {
        for (const sl of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
          const eqIt = npc.equip[sl];
          if (!eqIt) continue;
          const fxL = eqIt.fx || eqIt.effects || (ECO && ECO.itemById && ECO.itemById[eqIt.id] && ECO.itemById[eqIt.id].effects) || [];
          for (const fx of fxL) {
            if (fx && fx.effectId === 'EFX_TRIBULATION_SHIELD') {
              equipTribBonus += (fx.params && fx.params.tribulationMitigationRatio) ? fx.params.tribulationMitigationRatio * 0.35 : 0.06;
            }
          }
        }
        npc._eqTribC = { ver: npc._ver, val: equipTribBonus };
      }
    }
    const tribResBt = clamp((HC.special(npc, 'cultivation.tribulationResist') || 0) + equipTribBonus, 0, 0.6);
    if (tribResBt > 0 && (c.stage >= 3 || (prep && prep.tribulation) || (npc.tribulationState && npc.tribulationState.active))) {
      p += tribResBt * 0.35;
    } else if (equipTribBonus > 0) {
      p += Math.min(0.08, equipTribBonus * 0.5);
    }
    const hd = npc.h.state.heartDemon || 0;
    const tox = c.toxic || 0;
    if (c.path === 'DEMON') {
      p += (HC.eff(npc, 'personality.ambition') - 50) / 50 * 0.05;
      p -= (hd <= 55 ? hd / 100 * 0.10 : (0.055 + (hd - 55) / 100 * 0.38)) + tox / 100 * 0.08;
    } else if (c.path === 'HEART_SOUL') {
      p += (HC.eff(npc, 'intellect.comprehension') - 50) / 50 * 0.06 + (HC.eff(npc, 'personality.composure') - 50) / 50 * 0.04;
      p -= hd / 100 * 0.32 + tox / 100 * 0.15;
    } else {
      p -= hd / 100 * 0.25 + tox / 100 * 0.15;
    }
    if (g.BN) p += g.BN.chanceMod(npc);
    if (CULT.isAncestralBlessingActive(npc, prep && Number.isFinite(prep.now) ? prep.now : null)) p += (npc.ancestralBlessing.breakthroughBonus || 0);
    if (CULT.petBreakthroughBonus) p += CULT.petBreakthroughBonus(npc);
    if (g.STATS && g.STATS.hasBuff && (g.STATS.hasBuff(npc, "meridianUnblock") || g.STATS.hasBuff(npc, "clarityLotus"))) p += 0.06;
    if (npc.mentorImprint && Number.isFinite(npc.mentorImprint.btBonus)) p += npc.mentorImprint.btBonus;
    if (npc.companionId || (npc.h && npc.h.companionId)) p += 0.06;
    if (npc.bloodlineTrait && Number.isFinite(npc.bloodlineTrait.btBonus)) p += npc.bloodlineTrait.btBonus;
    if (Array.isArray(npc.daoScars) && npc.daoScars.length) {
      const scarBonus = npc.daoScars.reduce((sum, sc) => sum + (sc && sc.btBonus ? sc.btBonus : 0.05), 0);
      p += Math.min(0.18, scarBonus);
    }
    const sealBt = (npc.ext && Number.isFinite(npc.ext.btBonusPct)) ? npc.ext.btBonusPct : (Number.isFinite(npc.btBonusPct) ? npc.btBonusPct : (Number.isFinite(npc._btBonusPct) ? npc._btBonusPct : 0));
    if (sealBt > 0) p += Math.min(0.35, sealBt);
    if (Number.isFinite(c.btBonus) && c.btBonus !== 0) p += c.btBonus;
    if (m && m.mantraBonus && Number.isFinite(m.mantraBonus.btBonus)) p += m.mantraBonus.btBonus;
    else if (m && Number.isFinite(m.breakthroughBonus)) p += m.breakthroughBonus;
    if (npc.closedDoorSeclusion && Number.isFinite(npc.closedDoorSeclusion.insightBonusPct) && !(prep && prep._seclusionIncluded)) {
      p += Math.min(0.30, npc.closedDoorSeclusion.insightBonusPct);
    }
    if (npc.peakId && g.SECT && g.SECT.PEAKS && g.SECT.PEAKS.getUnitPeakBonuses) {
      const pkb = g.SECT.PEAKS.getUnitPeakBonuses(npc);
      if (pkb && pkb.active && pkb.btBonus) p += pkb.btBonus;
    }
    if (Array.isArray(npc.heartDemons) && npc.heartDemons.length && c.path !== 'DEMON') {
      const unresolvedPen = npc.heartDemons.filter(k => k && !k.resolved).reduce((sum, k) => sum + (k.btPenalty || 0.06), 0);
      p -= Math.min(0.18, unresolvedPen);
    }
    if (st && st.resourceReq) {
      const hasStageRes = !!(
        (prep && prep.stageResourceOk) ||
        (c && c.stageResourcePrepared === c.stage) ||
        (npc.inv && npc.inv.mats && Object.keys(npc.inv.mats).some(k => npc.inv.mats[k] > 0 && (k === st.resourceReq || k.includes('CRYSTAL') || k.includes('CORE') || k.includes('ESSENCE')))) ||
        (npc.inv && (npc.inv.stones || 0) >= 60 * c.stage)
      );
      if (hasStageRes) p += 0.04;
    }
    if (c && c.path === 'GOD') {
      const df = CULT.getDivineFaith ? CULT.getDivineFaith((prep && prep.W) || null, npc) : 55;
      if (df < 20) p -= 0.22;
      else if (df >= 70) p += 0.06;
      if (c.stage >= 2 && CULT.godStageGateStatus) {
        const gs = CULT.godStageGateStatus((prep && prep.W) || null, npc);
        if (!gs.faithOk || !gs.influenceOk) p -= 0.20;
      }
    } else if (c && c.path === 'BODY') {
      if (c.bodyTemperT > 0 || (npc.stats && (npc.stats.kills || 0) > 0)) p += 0.04;
    }
    if (prep) p += (prep.pill || 0) + (prep.env || 0) + (prep.guide || 0);
    const _btW = (prep && prep.W) || (g.SECT && g.SECT.PEAKS && g.SECT.PEAKS._activeWorld) || g.W || null;
    if (_btW && g.EXPED && g.EXPED.ANNUAL_FESTIVALS && g.EXPED.ANNUAL_FESTIVALS.getActiveModifiers) {
      p += g.EXPED.ANNUAL_FESTIVALS.getActiveModifiers(_btW).btBonus;
    }
    return clamp(p, 0.03, 0.97);
  };
  CULT.checkStageResourceReq = (W, npc) => {
    if (!npc || !npc.cult) return { ok: false, resourceReq: null, satisfied: false };
    const c = npc.cult;
    const pDef = CULT.PATHS && CULT.PATHS[c.path];
    const st = pDef && pDef.stages ? pDef.stages[c.stage - 1] : null;
    const req = (st && st.resourceReq) || null;
    const godGate = (c.path === 'GOD' && c.stage >= 2 && CULT.godStageGateStatus) ? CULT.godStageGateStatus(W, npc) : null;
    if (!req && !godGate) return { ok: true, resourceReq: null, satisfied: true };
    const hasPersonal = !req ? true : !!(npc.inv && npc.inv.mats && Object.keys(npc.inv.mats).some(k => npc.inv.mats[k] > 0 && (k === req || k.includes('CRYSTAL') || k.includes('CORE') || k.includes('ESSENCE'))));
    const hasSect = !req ? true : !!(W && W.sect && W.sect.stock && Object.keys(W.sect.stock).some(k => W.sect.stock[k] > 0 && (k === req || k.includes('CRYSTAL') || k.includes('CORE') || k.includes('ESSENCE'))));
    const hasStones = !req ? true : !!((npc.inv && (npc.inv.stones || 0) >= 60 * c.stage) || (W && W.sect && (W.sect.stones || 0) >= 120 * c.stage));
    const resOk = !req || hasPersonal || hasSect || hasStones;
    const gateOk = !godGate || (godGate.faithOk && godGate.influenceOk);
    return { ok: true, resourceReq: req, satisfied: resOk && gateOk, hasPersonal, hasSect, hasStones, godGate };
  };

  CULT.ensureFaithState = W => {
    if (!W || !W.sect) return null;
    const repOrFame = W.sect.rep != null ? W.sect.rep : W.sect.fame;
    const initPool = clamp(Math.round(48 + ((Number.isFinite(repOrFame) ? repOrFame : 12) - 12) * 0.35), 25, 85);
    if (!W.sect.faithState || typeof W.sect.faithState !== 'object') {
      W.sect.faithState = {
        pool: initPool,
        poolMax: 100,
        shrineHarmony: 50,
        lastDailyTickDay: -1,
        lowFaithDays: 0,
        zeroFaithDays: 0,
        deedsToday: 0,
        waning: false,
        history: []
      };
    }
    const st = W.sect.faithState;
    if (!Number.isFinite(st.pool)) st.pool = initPool;
    st.pool = clamp(st.pool, 0, st.poolMax || 100);
    if (!Number.isFinite(st.poolMax) || st.poolMax <= 0) st.poolMax = 100;
    if (!Number.isFinite(st.lowFaithDays) || st.lowFaithDays < 0) st.lowFaithDays = 0;
    if (!Number.isFinite(st.zeroFaithDays) || st.zeroFaithDays < 0) st.zeroFaithDays = 0;
    if (!Number.isFinite(st.deedsToday) || st.deedsToday < 0) st.deedsToday = 0;
    if (!Array.isArray(st.history)) st.history = [];
    st.waning = st.pool < 20;
    return st;
  };

  CULT.getDivineFaith = (W, npc) => {
    const st = (W && W.sect) ? CULT.ensureFaithState(W) : null;
    const ext = npc && npc.ext;
    if (ext && Number.isFinite(ext.divineFaith)) {
      if (st && ext._lastPool !== st.pool) {
        const sin = (npc.karmicLedger && npc.karmicLedger.sinKarma) || 0;
        const stg = (npc.cult && npc.cult.stage) || 1;
        const personalOffset = Number.isFinite(ext._syncedSectFaith) ? (ext.divineFaith - ext._syncedSectFaith) : 0;
        return +clamp(st.pool + Math.min(8, (stg - 1) * 2.5) - Math.min(35, sin * 0.35) + personalOffset, 0, 100).toFixed(2);
      }
      return clamp(ext.divineFaith, 0, 100);
    }
    if (st) {
      const sin = (npc && npc.karmicLedger && npc.karmicLedger.sinKarma) || 0;
      const stg = (npc && npc.cult && npc.cult.stage) || 1;
      return +clamp(st.pool + Math.min(8, (stg - 1) * 2.5) - Math.min(35, sin * 0.35), 0, 100).toFixed(2);
    }
    return 55;
  };

  CULT.syncDivineFaith = W => {
    if (!W || !W.sect) return null;
    const st = CULT.ensureFaithState(W);
    for (const n of (W.npcs || [])) {
      if (!n || n.dead || !n.cult || n.cult.path !== 'GOD') continue;
      n.ext = n.ext || {};
      const sin = (n.karmicLedger && n.karmicLedger.sinKarma) || 0;
      const stg = n.cult.stage || 1;
      const df = +clamp(st.pool + Math.min(8, (stg - 1) * 2.5) - Math.min(35, sin * 0.35), 0, 100).toFixed(2);
      const personalOffset = (Number.isFinite(n.ext.divineFaith) && Number.isFinite(n.ext._syncedSectFaith)) ? (n.ext.divineFaith - n.ext._syncedSectFaith) : 0;
      const finalDf = +clamp(df + personalOffset, 0, 100).toFixed(2);
      const prevWaning = !!n.divineWaning;
      n.ext.divineFaith = finalDf;
      n.ext._syncedSectFaith = df;
      n.ext._lastPool = st.pool;
      n.divineWaning = finalDf < 20;
      n._cultRateBase = null;
      if (prevWaning !== n.divineWaning && g.STATS && g.STATS.dirty) g.STATS.dirty(n);
    }
    return st;
  };

  CULT.updateDivineFaith = (W, delta, reason, opts) => {
    if (!W || !W.sect) return 55;
    const st = CULT.ensureFaithState(W);
    const d = Number.isFinite(delta) ? delta : 0;
    const prev = st.pool;
    st.pool = +clamp(st.pool + d, 0, st.poolMax || 100).toFixed(2);
    st.waning = st.pool < 20;
    if (reason && reason !== 'daily_ecology' && d > 0) st.deedsToday = (st.deedsToday || 0) + 1;
    if (Math.abs(d) >= 0.5 && reason && reason !== 'daily_ecology') {
      st.history.unshift({ day: W.day || 1, delta: +d.toFixed(2), pool: st.pool, reason });
      if (st.history.length > 16) st.history.length = 16;
    }
    if (opts && opts.npc && opts.npc.ext && Number.isFinite(opts.npc.ext.divineFaith) && opts.npc.ext._syncedSectFaith !== opts.npc.ext.divineFaith) {
      opts.npc.ext.divineFaith = +clamp(opts.npc.ext.divineFaith + d, 0, 100).toFixed(2);
    }
    CULT.syncDivineFaith(W);
    if (prev !== st.pool && g.STATS && g.STATS.dirty) {
      for (const n of (W.npcs || [])) {
        if (n && !n.dead && n.cult && n.cult.path === 'GOD') g.STATS.dirty(n);
      }
    }
    return st.pool;
  };

  CULT.godStageGateStatus = (W, npc) => {
    const c = npc && npc.cult;
    const stage = (c && c.stage) || 1;
    const df = CULT.getDivineFaith(W, npc);
    if (!c || c.path !== 'GOD' || stage < 2) {
      return { required: false, df, needFaith: 0, rep: 0, needRep: 0, outpostsCount: 0, needOutposts: 0, faithOk: true, influenceOk: true };
    }
    const needFaith = stage === 2 ? 40 : 55;
    const needRep = stage === 2 ? 45 : 90;
    const needOutposts = stage - 1;
    const rep = W && W.sect ? (W.sect.rep != null ? W.sect.rep : (W.sect.fame || 0)) : 50;
    const outpostsCount = W && W.sect && W.sect.outposts && W.sect.outposts.byNodeId
      ? Object.keys(W.sect.outposts.byNodeId).length
      : 0;
    const faithOk = df >= needFaith;
    const influenceOk = W && W.sect ? (rep >= needRep || outpostsCount >= needOutposts) : true;
    return { required: true, df, needFaith, rep, needRep, outpostsCount, needOutposts, faithOk, influenceOk };
  };

  if (typeof CULT.qiMax === 'function') {
    const baseQiMaxPreFaith = CULT.qiMax;
    CULT.qiMax = npc => {
      const q = baseQiMaxPreFaith(npc);
      if (!npc || !npc.cult || !CULT.trackRealm) return q;
      const tr = CULT.trackRealm(npc);
      const fm = tr && tr.capacityMultipliers && tr.capacityMultipliers.faithPoolMult;
      if (fm && fm > 1) return Math.round(q * (1 + (fm - 1) * 0.45));
      return q;
    };
  }
  CULT.breakthrough = (W, npc, prep) => {
    const c = npc && npc.cult, rng = W && W.rng;
    if (!c) return { ok: false, p: 0, injured: false, died: false, stageFrom: 0, reason: 'no-cult' };
    const pathDef = CULT.PATHS[c.path];
    const maxStage = (pathDef && Array.isArray(pathDef.stages) && pathDef.stages.length) || 9;
    if ((c.stage || 1) >= maxStage) {
      return { ok: false, p: 0, injured: false, died: false, stageFrom: c.stage, maxStageReached: true, reason: 'max-stage' };
    }
    const p = CULT.breakthroughChance(npc, Object.assign({}, prep || {}, { now: W.t, W }));
    c.attempts++;
    const ok = rng.next() < p;
    const res = { ok, p, injured: false, died: false, stageFrom: c.stage };
    if (ok) {
      const over = Math.max(0, c.prog - CULT.threshold(npc));
      c.stage++; c.prog = over * 0.3; c.attempts = 0; c.lifeBonus = c.lifeBonus || 0;
      if (npc.h && npc.h.state) npc.h.state.confidence = clamp((npc.h.state.confidence == null ? 50 : npc.h.state.confidence) + 8, 10, 98);
      CULT.refreshLifespan(npc);
      if (CULT.evaluateSubpathArchetypeMastery) CULT.evaluateSubpathArchetypeMastery(npc);
      if (CULT.EXPERIENCE_TRAITS && CULT.EXPERIENCE_TRAITS.hasTrait && CULT.EXPERIENCE_TRAITS.hasTrait(npc, 'EXP_TRAIT_DEFEAT_VETERAN')) {
        CULT.EXPERIENCE_TRAITS.resolveTraitRecovery(W, npc, 'EXP_TRAIT_DEFEAT_VETERAN');
      }
      const h = npc.h;
      h.physiology.meridianCapacity = Math.min(99, h.physiology.meridianCapacity + 1.2);
      h.physiology.spiritualFoundation = Math.min(99, h.physiology.spiritualFoundation + 0.8);
      h.physiology.vitality = Math.min(99, h.physiology.vitality + 0.5);
      const mBt = c.mantra ? TECH_BY_ID[c.mantra] : null;
      ELEM.gainMastery(W, npc, mBt || CULT.subInfo(c.path, c.sub) || CULT.PATHS[c.path], 0.9, 'breakthrough_ok');
      if (c.path === 'HEART_SOUL') {
        h.state.heartDemon = Math.max(0, (h.state.heartDemon || 0) - 15);
        h.intellect.comprehension = Math.min(99, h.intellect.comprehension + 0.8);
        HC.gainWisdom(npc, 1.4);
      } else if (c.path === 'DEMON') {
        h.physiology.vitality = Math.min(99, h.physiology.vitality + 0.7);
        h.state.heartDemon = Math.max(0, (h.state.heartDemon || 0) - 5);
        HC.gainWisdom(npc, 0.8);
      } else if (c.path === 'MECH_PUPPET') {
        h.intellect.inventiveness = Math.min(99, (h.intellect.inventiveness || 50) + 0.8);
        h.physiology.dexterity = Math.min(99, (h.physiology.dexterity || 50) + 0.6);
        const ms = CULT.ensureMechState ? CULT.ensureMechState(npc) : null;
        if (ms) {
          ms.puppetTier = c.stage;
          ms.integrity = 100;
          ms.constructReadiness = 100;
          ms.charge = 100;
          ms.heat = 0;
          ms.overclockReady = true;
          ms.decoyAvailable = true;
          ms.vesselDecoyReady = true;
        }
        HC.gainWisdom(npc, 0.9);
      } else if (c.path === 'KARMA_SAMSARA') {
        h.state.heartDemon = Math.max(0, (h.state.heartDemon || 0) - 12);
        const ks = CULT.ensureKarmaState ? CULT.ensureKarmaState(npc) : null;
        if (ks) {
          ks.meritStacks = clamp((ks.meritStacks || 1) + 1, 1, 99);
          ks.echoReady = true;
        }
        HC.gainWisdom(npc, 1.2);
      } else if (c.path === 'BEAST_SOVEREIGN') {
        h.physiology.vitality = Math.min(99, (h.physiology.vitality || 50) + 0.8);
        if (CULT.ensurePets) {
          const pets = CULT.ensurePets(npc);
          pets.forEach(pt => {
            if (!pt) return;
            pt.level = Math.min(9, (pt.level || 1) + 1);
            pt.bond = clamp((pt.bond || 65) + 6, 0, 100);
            pt.loyalty = pt.bond;
            pt.fatigue = 0;
            pt.injured = false;
            if (c.stage >= 6 && pt.tier < 6) pt.tier = Math.min(7, pt.tier + 1);
          });
          CULT.ensurePets(npc);
        }
        HC.gainWisdom(npc, 0.8);
      } else if (c.path === 'SAGE_SUPPORT') {
        h.intellect.comprehension = Math.min(99, (h.intellect.comprehension || 50) + 0.7);
        h.physiology.spiritualFoundation = Math.min(99, (h.physiology.spiritualFoundation || 50) + 0.7);
        h.state.heartDemon = Math.max(0, (h.state.heartDemon || 0) - 10);
        HC.gainWisdom(npc, 1.1);
      } else if (c.path === 'CRAFT_CREATION') {
        h.intellect.inventiveness = Math.min(99, (h.intellect.inventiveness || 50) + 0.8);
        h.physiology.dexterity = Math.min(99, (h.physiology.dexterity || 50) + 0.7);
        h.state.heartDemon = Math.max(0, (h.state.heartDemon || 0) - 8);
        HC.gainWisdom(npc, 1.0);
      } else {
        HC.gainWisdom(npc, 0.8);
      }
      h.state.hp = CULT.hpMax(npc); h.state.qi = CULT.qiMax(npc);
      HC.experience(npc, 'insight', 0.8);
      const effSt = CULT.effectiveTechStage(npc);
      const m = CULT.bestMantra(c.path, effSt, npc);
      if (m && (!c.mantra || !TECH_BY_ID[c.mantra] || TECH_BY_ID[c.mantra].tier < m.tier) && effSt >= m.tier - 1) c.mantra = m.id;
      ELEM.syncSpecialAccess(npc);
      c.pillT = 0; c.pillBoost = 0; if (g.BN) g.BN.onResult(W, npc, true);
      const eqStOrigin = CULT.equivalentStage ? Math.floor(CULT.equivalentStage(npc)) : c.stage;
      if (npc.originArc && !npc.originArc.completed && [3, 5, 7].includes(eqStOrigin) && g.SECT && g.SECT.ORIGIN_ARCS && g.SECT.ORIGIN_ARCS.advanceOriginChapter) {
        g.SECT.ORIGIN_ARCS.advanceOriginChapter(W, npc, 'PROTECT', { autoFromBreakthrough: true, quiet: true });
      }
    } else {
      c.prog = CULT.threshold(npc) * (0.5 + 0.2 * clamp(HC.eff(npc, 'intellect.willpower') / 100 * 0.6 + HC.eff(npc, 'personality.composure') / 100 * 0.4 + rng.gauss(0, 0.12), 0, 1));
      const tribRes = clamp(HC.special(npc, 'cultivation.tribulationResist') || 0, 0, 0.65);
      const sev = rng.next() < 0.35 * (1 - tribRes * 0.5) ? 2 : 1;
      res.injured = true; res.sev = sev;
      const rawKeepRatio = sev === 2 ? 0.35 : 0.6;
      const keepRatio = clamp(rawKeepRatio + (1 - rawKeepRatio) * tribRes, rawKeepRatio, 0.92);
      npc.h.state.hp = Math.max(1, npc.h.state.hp * keepRatio);
      HC.feel(npc, { mood: -18, stress: 18 });
      const hdGain = (npc.companionId || (npc.h && npc.h.companionId)) ? Math.max(2, Math.round(rng.int(5, 16) * 0.45)) : rng.int(5, 16);
      npc.h.state.heartDemon = clamp(npc.h.state.heartDemon + hdGain, 0, 100);
      if (c.path === 'DEMON') {
        res.supremeRisk = 'DEMONIC_BACKLASH_FRENZY';
        npc.h.state.heartDemon = clamp(npc.h.state.heartDemon + 8, 0, 100);
        npc.h.state.hp = Math.max(1, Math.round(npc.h.state.hp * 0.85));
        npc.demonicBacklashUntil = (W.t || 0) + 1440;
        if (g.STATS && g.STATS.addBuff) {
          g.STATS.addBuff(npc, { id: 'DEMONIC_BACKLASH_FRENZY', name: 'ปราณมารตีกลับคลุ้มคลั่ง', kind: 'debuff', dur: 1440, p: { atk: 0.14, def: -0.22, mdef: -0.22 }, f: { crit: 6 } }, W.t || 0);
        }
      } else if (c.path === 'HEART_SOUL') {
        res.supremeRisk = 'SOUL_SHATTER_ILLUSION_LOST';
        npc.h.state.qi = 0;
        npc.h.state.rest = Math.max(5, (npc.h.state.rest || 50) - 25);
        npc.h.state.stress = clamp((npc.h.state.stress || 0) + 12, 0, 100);
        npc.soulShatterUntil = (W.t || 0) + 2880;
        if (g.STATS && g.STATS.addBuff) {
          g.STATS.addBuff(npc, { id: 'SOUL_SHATTER_ILLUSION_LOST', name: 'จิตวิญญาณร้าวหลงมายา', kind: 'debuff', dur: 2880, p: { matk: -0.22, def: -0.15, mdef: -0.20 }, f: { cast: -15 } }, W.t || 0);
        }
      } else if (c.path === 'MECH_PUPPET') {
        res.supremeRisk = 'AUTOMATON_CORE_OVERHEAT_BACKLASH';
        if (npc.mechState) { npc.mechState.integrity = Math.max(15, (npc.mechState.integrity || 100) - 35); npc.mechState.heat = Math.min(100, (npc.mechState.heat || 0) + 40); }
        npc.h.state.stress = clamp((npc.h.state.stress || 0) + 10, 0, 100);
      } else if (c.path === 'KARMA_SAMSARA') {
        res.supremeRisk = 'KARMIC_TRIBULATION_CONFUSION';
        npc.h.state.heartDemon = clamp((npc.h.state.heartDemon || 0) + 10, 0, 100);
        npc.h.state.stress = clamp((npc.h.state.stress || 0) + 12, 0, 100);
      } else if (c.path === 'BEAST_SOVEREIGN') {
        res.supremeRisk = 'FERAL_BLOODLINE_BACKLASH';
        npc.h.state.heartDemon = clamp((npc.h.state.heartDemon || 0) + 9, 0, 100);
        if (Array.isArray(npc.pets)) npc.pets.forEach(pt => { if (pt && pt.active) pt.fatigue = clamp((pt.fatigue || 0) + 25, 0, 100); });
      } else if (c.path === 'SAGE_SUPPORT') {
        res.supremeRisk = 'MERIDIAN_OVERDRAIN_BACKLASH';
        npc.h.state.qi = Math.max(0, Math.round((npc.h.state.qi || 0) * 0.25));
        npc.h.state.energy = Math.max(10, (npc.h.state.energy || 50) - 20);
      } else if (c.path === 'CRAFT_CREATION') {
        res.supremeRisk = 'FURNACE_OVERHEAT_BACKLASH';
        npc.h.state.qi = Math.max(0, Math.round((npc.h.state.qi || 0) * 0.30));
        npc.h.state.energy = Math.max(10, (npc.h.state.energy || 50) - 22);
      } else if (c.path === 'ARRAY_TALISMAN') {
        res.supremeRisk = 'FORMATION_BACKLASH_DISARRAY';
        npc.h.state.qi = Math.max(0, Math.round((npc.h.state.qi || 0) * 0.25));
        npc.h.state.stress = clamp((npc.h.state.stress || 0) + 12, 0, 100);
      } else if (c.path === 'GOD') {
        res.supremeRisk = 'DIVINE_FAITH_BACKLASH';
        npc.h.state.qi = Math.max(0, Math.round((npc.h.state.qi || 0) * 0.35));
        npc.h.state.stress = clamp((npc.h.state.stress || 0) + 10, 0, 100);
      } else if (c.path === 'STRATEGY_GOVERNANCE') {
        res.supremeRisk = 'MANDATE_STRAIN_BACKLASH';
        npc.h.state.energy = Math.max(10, (npc.h.state.energy || 50) - 20);
        npc.h.state.stress = clamp((npc.h.state.stress || 0) + 14, 0, 100);
      }
      const eqSt = CULT.equivalentStage ? CULT.equivalentStage(npc) : c.stage;
      const tribResPd = clamp(HC.special(npc, 'cultivation.tribulationResist') || 0, 0, 0.65);
      const pd = eqSt >= 3 ? 0.012 * (eqSt - 2) * (1 - HC.eff(npc, 'intellect.willpower') / 160) * Math.max(0.15, 1 - tribResPd * 1.35) : 0;
      if (rng.next() < pd) res.died = true;
      if (CULT.isAncestralBlessingActive(npc, W ? W.t : null) && npc.ancestralBlessing.injuryShield && (!npc.ancestralBlessing.untilDay || !W || W.day == null || npc.ancestralBlessing.untilDay >= W.day)) {
        res.died = false;
        res.sev = 1;
        res.ancestralProtected = true;
        npc.ancestralBlessing.injuryShield = false;
        npc.h.state.hp = Math.max(npc.h.state.hp, Math.round(CULT.hpMax(npc) * 0.55));
      }
      HC.experience(npc, 'heart_demon', 0.5);
      if (W && g.SECT && g.SECT.HEART_DEMON && g.SECT.HEART_DEMON.spawnFromCause && (c.attempts >= 2 || hdGain >= 10)) {
        g.SECT.HEART_DEMON.spawnFromCause(W, npc, 'DEFEAT_HUMILIATION', {
          originEventTh: 'ล้มเหลวในการทะลวงด่านขั้นที่ ' + (c.stage + 1) + ' จนเกิดเงามารแห่งความท้อแท้ในจิตใจ'
        });
      }
      if (rng.chance(0.18)) { npc.h.physiology.meridianIntegrity = Math.max(8, npc.h.physiology.meridianIntegrity - rng.float(1, 4)); }
    }
    if (!res.ok && g.BN) g.BN.onResult(W, npc, false);
    HC.bump(npc);
    return res;
  };

  /* ----- เรียนวิชา (รวมถึงวิชาต้องห้ามภายใต้เงื่อนไขเข้มงวด) ----- */
  // Accepts either (tech, npcSub, strictPrimarySub) or (npcSub, tech, strictPrimarySub)
  const _hasRealSub = s => !!(s && s !== 'NONE' && s !== 'ANY');
  CULT.isExclusiveSubpathTech = t => {
    if (!t) return false;
    if (t.innateOnly || (g.MARTIAL && g.MARTIAL.isInnateTech && g.MARTIAL.isInnateTech(t))) return true;
    if (t.legendary || t.transcendent) return false;
    if (typeof t.id === 'string' && t.id.startsWith('MP_')) return true;
    if (/_MANTRA$|^QI_MANTRA$/.test(t.cat || '')) return false;
    if ((t.passive || t.cat === 'PASSIVE') && _hasRealSub(t.sub)) return true;
    if (/FORBIDDEN/.test(t.cat || '') && t.cat !== 'FORBIDDEN_GRAND_DAO') return true;
    if (_hasRealSub(t.sub) && ['VENOM_GU_SOVEREIGN', 'CORPSE_PUPPET_MASTER'].includes(t.sub) && /GU_|CORPSE_|PARASITE/.test(t.id || '')) return true;
    return false;
  };

  CULT.isSubCompatible = (a, b, strictPrimarySub) => {
    const tech = (a && typeof a === 'object') ? a : (b && typeof b === 'object' ? b : null);
    const npcSub = typeof a === 'string' ? a : (typeof b === 'string' ? b : null);
    if (!tech || !_hasRealSub(tech.sub)) return true;
    if (tech.legendary || tech.transcendent) return true;
    const tSub = CULT.resolveSubId ? CULT.resolveSubId(tech.sub) : tech.sub;
    const nSub = CULT.resolveSubId ? CULT.resolveSubId(npcSub) : npcSub;
    if (tech.sub === npcSub || tSub === nSub || tech.sub === nSub || tSub === npcSub) return true;
    if (strictPrimarySub) return false;
    if (Array.isArray(tech.compatibleSubs) && tech.compatibleSubs.some(cs => cs === npcSub || cs === nSub || (CULT.resolveSubId && CULT.resolveSubId(cs) === nSub))) return true;
    if (!CULT.isExclusiveSubpathTech(tech)) return true;
    return false;
  };

  CULT.canStudyForbidden = (npc, tOrId, opts) => {
    const t = typeof tOrId === 'string' ? TECH_BY_ID[tOrId] : tOrId;
    if (!t || !/FORBIDDEN/.test(t.cat || '')) return { ok: true };
    if (!npc || !npc.cult) return { ok: false, reason: 'ยังไม่เปิดวิถีบำเพ็ญ' };
    const c = npc.cult, req = t.reqTier || t.tier || 5;
    if (CULT.effectiveTechStage(npc) < req) return { ok: false, reason: 'ขั้นบำเพ็ญไม่ถึงเกณฑ์วิชาต้องห้าม (ขั้น ' + req + ')' };
    if (t.legendary) return { ok: true };
    if (t.path !== 'ANY' && t.path !== c.path) return { ok: false, reason: 'ต่างวิถีหลัก' };
    if (!CULT.isSubCompatible(t, c.sub, false)) return { ok: false, reason: 'ต้องมีสายย่อยตรงกัน' };
    const allowFlag = !!(opts && (opts.allowForbidden || opts.libraryStudy)) || !!npc.allowForbiddenStudy;
    const demonPath = ['DEMON', 'VOID_HERETIC_PACT', 'OCCULT_MAGE', 'DEVOURING_FLESH', 'NETHER_GRAVE', 'VENOM_GU'].includes(c.path);
    const darkDrive = HC.eff(npc, 'personality.ambition') >= 62 && HC.eff(npc, 'personality.integrity') <= 48;
    const heartDemonDrive = !!(npc.h && npc.h.state && (npc.h.state.heartDemon || 0) >= 25);
    if (!allowFlag && !demonPath && !darkDrive && !heartDemonDrive) {
      return { ok: false, reason: 'วิชาต้องห้ามต้องอาศัยวิถีมาร ความทะเยอทะยานสูง หรือการเปิดอนุญาตศึกษา' };
    }
    return { ok: true };
  };

  CULT.learnable = (npc, library, opts) => {
    const c = npc.cult; if (!c) return [];
    const effSt = CULT.effectiveTechStage(npc);
    const strictPrimary = !!(opts && opts.strictPrimarySub);
    const allowCrossPath = !!(opts && opts.allowCrossPath);
    return library.filter(id => {
      const t = TECH_BY_ID[id];
      if (!t || t.innateOnly || (t.reqTier || t.tier) > effSt || c.techs.includes(id)) return false;
      if (t.reqPath && t.reqPath !== 'ANY' && t.reqPath !== c.path) return false;
      if (t.reqSubpath && t.reqSubpath !== 'NONE' && t.reqSubpath !== 'ANY' && c.sub !== t.reqSubpath && (!CULT.resolveSubId || CULT.resolveSubId(c.sub) !== CULT.resolveSubId(t.reqSubpath))) return false;
      if (t.reqElement && npc.h && npc.h.root) {
        const rEls = Array.isArray(npc.h.root.elements) ? npc.h.root.elements : (npc.h.root.element ? [npc.h.root.element] : []);
        if (!rEls.includes(t.reqElement)) return false;
      }
      const compatPath = Array.isArray(t.compatiblePaths) && t.compatiblePaths.includes(c.path);
      const pathOk = t.legendary || t.transcendent || t.isSectHeritage || t.path === 'ANY' || t.path === c.path || compatPath || (!strictPrimary && (allowCrossPath || !CULT.isExclusiveSubpathTech(t)));
      if (!pathOk || !CULT.isSubCompatible(t, c.sub, strictPrimary)) return false;
      if (/_MANTRA$|^QI_MANTRA$/.test(t.cat)) {
        return !!t.transcendent && !(c.unlockedMantras || []).includes(id);
      }
      if (/FORBIDDEN/.test(t.cat) && !t.legendary) {
        if (!opts || !opts.includeForbidden) {
          if (!npc.allowForbiddenStudy && !(opts && opts.allowForbidden)) return false;
        }
        if (!CULT.canStudyForbidden(npc, t, opts).ok) return false;
      }
      return true;
    });
  };
  CULT.studyCost = (t, npc) => {
    const base = 90 * (t.tier + 0.5) * (1 + t.tier * 0.25);
    if (!npc || !npc.h) return Math.round(base);
    const tc = (g.MARTIAL && g.MARTIAL.resolveTechCompatibility) ? g.MARTIAL.resolveTechCompatibility(npc, t) : null;
    const pathSubStudyMult = (tc ? tc.studySpeedMult : 1) * (t && t.isSectHeritage ? 1.25 : 1);
    return Math.max(20, Math.round(base / Math.max(0.50, pathSubStudyMult)));
  };
  CULT.maxTechs = npc => 2 + (npc.cult ? Math.round(CULT.normalizedStage(npc)) : 0);
  CULT.techRetentionScore = (npc, tOrId) => {
    const t = typeof tOrId === 'string' ? TECH_BY_ID[tOrId] : tOrId;
    if (!t) return -1e9;
    if (t.legendary || t.isSectHeritage || t.innateOnly) return 1e9;
    const c = npc && npc.cult;
    const subMatch = c && (t.sub === c.sub || (Array.isArray(t.compatibleSubs) && t.compatibleSubs.includes(c.sub))) ? 90 : 0;
    const pathMatch = c && (t.path === c.path || t.path === 'ANY') ? 35 : 0;
    const mas = (c && c.tm && Number.isFinite(c.tm[t.id])) ? c.tm[t.id] : 0;
    return (t.tier || 1) * 120 + (t.power || 0) + subMatch + pathMatch + mas * 0.8;
  };
  CULT.pruneExcessActiveTechs = npc => {
    if (!npc || !npc.cult || !Array.isArray(npc.cult.techs)) return [];
    const c = npc.cult;
    const maxAct = CULT.maxTechs(npc);
    const activeIds = c.techs.filter(id => {
      const x = TECH_BY_ID[id];
      return x && !x.passive && x.cat !== 'PASSIVE' && !x.innateOnly;
    });
    if (activeIds.length <= maxAct) return [];
    // Only non-legendary, non-heritage techniques are eligible to be forgotten
    const replaceable = activeIds.filter(id => {
      const x = TECH_BY_ID[id];
      return x && !x.legendary && !x.isSectHeritage && !x.innateOnly;
    }).sort((a, b) => CULT.techRetentionScore(npc, a) - CULT.techRetentionScore(npc, b));
    const dropped = [];
    while (activeIds.length - dropped.length > maxAct && replaceable.length > 0) {
      const dropId = replaceable.shift();
      const idx = c.techs.indexOf(dropId);
      if (idx >= 0) {
        c.techs.splice(idx, 1);
        dropped.push(dropId);
      }
    }
    return dropped;
  };


  /* ----- สายบำเพ็ญเฉพาะทางอิสระ (Independent Specialization Tracks - v1.10.3 / v1.10.8) ----- */
  CULT.TRACKS = {};
  CULT.EXPANSION_TRACK_IDS = new Set();
  CULT.ADVANCED_TRACKS = {};

  const BASE_SUB_GATE_SKILLS = {
    SWORD_IMMORTAL: ["SWORD", "MOVEMENT"],
    FIVE_ELEMENTS: ["FOCUS", "SCRIPTURE"],
    ELIXIR_DAO: ["ALCHEMY", "MEDICINE"],
    ASTRAL_ARRAY: ["ARRAY", "TALISMAN"],
    BLOOD_DEMON: ["BLADE", "POISON"],
    PHANTOM_SOUL: ["MOVEMENT", "SOUL_DIVINE"],
    TIME_VOID: ["MOVEMENT", "ARRAY"],
    SOUND_ZITHER: ["FOCUS", "arts"],
    YIN_YANG_HARMONY: ["FOCUS", "MEDICINE"],
    STAR_ARCHER: ["BOW", "MOVEMENT"],
    TIGER_SOVEREIGN: ["FIST_PALM", "BODY_REFINING"],
    BLOOD_DRAGON: ["SPEAR", "BODY_REFINING"],
    VAJRA_BODHI: ["STAFF", "BODY_REFINING"],
    DEVOURING_FIEND: ["FIST_PALM", "POISON"],
    SOLAR_FORGE: ["FORGING", "BODY_REFINING"],
    THUNDER_BODY: ["SPEAR", "MOVEMENT"],
    JADE_IMMORTAL_BODY: ["BODY_REFINING", "MEDICINE"],
    TITAN_MOUNTAIN_BODY: ["STAFF", "BODY_REFINING"],
    STAFF_GUARD: ["STAFF", "BODY_REFINING"],
    WAR_DEITY: ["SPEAR", "ritual"],
    MERCY_DEITY: ["MEDICINE", "ritual"],
    FATE_ORACLE: ["SCRIPTURE", "TALISMAN"],
    TOTEM_BEAST_GOD: ["BEAST_TAMING", "SPEAR"],
    UNDERWORLD_JUDGE: ["SOUL_DIVINE", "SCRIPTURE"],
    OCEAN_SOVEREIGN: ["SPEAR", "WATER_ICE"],
    HARVEST_EARTH_GOD: ["herbalism", "WOOD_LIFE"],
    SHADOW_ARCHER: ["BOW", "stealth"]
  };

  const FAITH_PATHS = new Set(['GOD', 'BUDDHA_DHARMA', 'DIVINE_SUMMONER', 'DIVINE_POSSESSION', 'DIVINE_CHANNELER', 'ANCESTRAL_RITUAL']);
  const LIFESTEAL_PATHS = new Set(['DEMON', 'DEVOURING_FLESH', 'NETHER_GRAVE', 'VOID_HERETIC_PACT']);
  const REFLECT_PATHS = new Set(['HEART_SOUL', 'KARMA_SAMSARA', 'BUDDHA_DHARMA']);

  CULT.buildTrackRealmStats = (subId, path, sub, idx0, gate) => {
    const t = idx0 / 8; // 0..1 across realms 1..9
    const prof = (g.MARTIAL && g.MARTIAL.PROFILES && g.MARTIAL.PROFILES[subId])
      || (JD && JD.MARTIAL && JD.MARTIAL.subProfiles && JD.MARTIAL.subProfiles[subId])
      || null;
    const sw = (prof && prof[0]) || {};
    const skw = (prof && prof[1]) || {};
    const pace = (prof && prof[2]) || 'steady';
    const weaps = (prof && prof[3]) || [];
    const armors = (prof && prof[4]) || [];
    const pSk = (gate && gate.primarySkill) || (sub && sub.primarySkill) || 'MOVEMENT';
    const sSk = (gate && gate.secondarySkill) || ((sub && sub.secondarySkills && sub.secondarySkills[0]) || 'SCRIPTURE');

    // Compute normalized archetype role weights from martial profile & subpath bonuses
    const si = sub || {};
    const cbBonus = Math.max(0.7, Number(si.combatBonus) || 1);
    const dfBonus = Math.max(0.7, Number(si.defenseBonus) || 1);
    const qiBonus = Math.max(0.7, Number(si.qiBonus) || 1);

    const offRaw = (sw.strength || 0) * 0.85 + (sw.explosiveness || 0) * 1.1 + (sw.dexterity || 0) * 0.7
      + ((skw.SWORD || 0) + (skw.BLADE || 0) + (skw.SPEAR || 0) + (skw.BOW || 0) + (skw.CLAW || 0) + (skw.POISON || 0) + (skw.hunting || 0)) * 35
      + (cbBonus - 1) * 90 + (['SWORD', 'BLADE', 'SPEAR', 'BOW', 'FIST_PALM', 'CLAW'].includes(pSk) ? 14 : 0);
    const defRaw = (sw.toughness || 0) * 1.05 + (sw.endurance || 0) * 0.9 + (sw.vitality || 0) * 0.75 + (sw.immunity || 0) * 0.7
      + ((skw.BODY_REFINING || 0) + (skw.STAFF || 0) + (skw.MEDICINE || 0) + (skw.mining || 0)) * 30
      + (dfBonus - 1) * 95 + (armors.includes('HEAVY') ? 16 : 0) + (['BODY_REFINING', 'STAFF', 'MEDICINE'].includes(pSk) ? 12 : 0);
    const evaRaw = (sw.agility || 0) * 1.1 + (sw.reflex || 0) * 0.9 + Math.max(-10, sw.speed || 0) * 1.0 + (sw.flexibility || 0) * 0.8
      + ((skw.survival || 0) + (skw.stealth || 0) + (skw.MOVEMENT || 0) + (skw.WHIP || 0) + (skw.FAN || 0)) * 35
      + (armors.includes('LIGHT') ? 12 : armors.includes('HEAVY') ? -14 : 0)
      + (['MOVEMENT', 'stealth', 'WHIP', 'FAN'].includes(pSk) || sSk === 'MOVEMENT' || sSk === 'stealth' ? 14 : 0);
    const qiRaw = (sw.spiritualFoundation || 0) * 1.0 + (sw.meridianCapacity || 0) * 1.1 + (sw.recoveryRate || 0) * 0.6
      + ((skw.ARRAY || 0) + (skw.SCRIPTURE || 0) + (skw.TALISMAN || 0) + (skw.ALCHEMY || 0) + (skw.SOUL_DIVINE || 0) + (skw.ZITHER || 0) + (skw.BRUSH || 0)) * 32
      + (qiBonus - 1) * 90 + (armors.includes('ROBE') ? 12 : 0)
      + (['ARRAY', 'TALISMAN', 'SCRIPTURE', 'SOUL_DIVINE', 'ALCHEMY', 'FOCUS', 'ZITHER', 'BRUSH', 'ASTROLABE'].includes(pSk) ? 14 : 0);
    const vitRaw = (sw.vitality || 0) * 1.0 + (sw.recoveryRate || 0) * 0.95 + (sw.endurance || 0) * 0.75 + (sw.immunity || 0) * 0.6
      + ((skw.MEDICINE || 0) + (skw.herbalism || 0) + (skw.BODY_REFINING || 0)) * 30
      + (path === 'BODY' || path === 'DEVOURING_FLESH' ? 22 : 0);

    // Deterministic per-subId micro-signature (-0.49..+0.49) so even close siblings remain distinct
    let h = 2166136261;
    for (let k = 0; k < subId.length; k++) { h ^= subId.charCodeAt(k); h = Math.imul(h, 16777619) >>> 0; }
    const j1 = ((h & 255) / 255 - 0.5) * 0.9;
    const j2 = (((h >> 8) & 255) / 255 - 0.5) * 0.9;
    const j3 = (((h >> 16) & 255) / 255 - 0.5) * 0.9;
    const j4 = (((h >> 24) & 255) / 255 - 0.5) * 0.9;

    const paceMul = pace === 'early' ? (0.35 + 0.65 * Math.pow(t, 0.85)) : pace === 'late' ? Math.pow(t, 1.15) : t;
    const step = idx0 === 0 ? 0.14 : (0.14 + 0.86 * paceMul);
    const clampNum = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const nOff = clampNum(offRaw / 45, 0.45, 1.65);
    const nDef = clampNum(defRaw / 45, 0.45, 1.65);
    const nEva = clampNum(evaRaw / 42, 0.35, 1.75);
    const nQi = clampNum(qiRaw / 45, 0.45, 1.65);
    const nVit = clampNum(vitRaw / 45, 0.50, 1.65);

    const zeroQi = path === 'SHADOW_SAMURAI';
    const isFaith = FAITH_PATHS.has(path) || pSk === 'ritual' || sSk === 'ritual';
    const hasLifesteal = LIFESTEAL_PATHS.has(path) || /BLOOD|DEVOUR|VAMPIRE|GHOUL|CORPSE|FLESH|SOUL_EATER/.test(subId);
    const hasReflect = REFLECT_PATHS.has(path) || /MIRROR|RETRIBUTION|THORN|LOTUS|REFLECT/.test(subId);

    const offMult = zeroQi ? 1.14 : 1.0;
    const maxQiSpan = zeroQi ? 0 : (1.7 + nQi * 1.15 + j1 * 0.18);
    const vitSpan = 1.2 + nVit * 0.95 + (zeroQi ? 0.25 : 0) + j2 * 0.14;
    const faithSpan = isFaith ? (0.85 + nQi * 0.45 + (path === 'GOD' ? 0.25 : 0) + j3 * 0.10) : 0;
    const senseTop = Math.round(18 + (nOff * 4 + nQi * 6 + nEva * 3) + (weaps.includes('BOW') || pSk === 'BOW' || pSk === 'NEEDLE' ? 6 : 0) + j4 * 3);

    const offTop = (18.5 + nOff * 8.2) * offMult + j1 * 1.1;
    const defTop = 13.0 + nDef * 6.8 + j2 * 0.9;
    const penTop = (14.0 + (nOff * 4.5 + (weaps.includes('SWORD') || weaps.includes('SPEAR') || weaps.includes('BOW') ? 3.0 : 0))) * offMult + j3 * 0.8;
    const cntTop = (9.5 + (nDef * 2.5 + nEva * 2.5 + (zeroQi || weaps.includes('SWORD') || weaps.includes('BLADE') ? 3.5 : 0))) + j4 * 0.7;
    const evaTop = 6.8 + nEva * 5.2 + (zeroQi ? 2.5 : 0) + j1 * 0.7;
    const qRegTop = zeroQi ? 0 : (9.5 + nQi * 5.5 + (isFaith ? 1.5 : 0) + j2 * 0.8);
    const lsTop = hasLifesteal ? (8.5 + (path === 'DEMON' || path === 'DEVOURING_FLESH' ? 3.5 : 1.5) + nOff * 1.4 + j3 * 0.6) : 0;
    const refTop = hasReflect ? (8.5 + (path === 'HEART_SOUL' ? 3.2 : 1.5) + nDef * 1.4 + j4 * 0.6) : 0;

    return {
      capacityMultipliers: {
        maxQiMult: zeroQi ? 1 : +(1 + (idx0 === 0 ? 0 : t * maxQiSpan)).toFixed(2),
        vitalityMult: +(1 + (idx0 === 0 ? 0 : t * vitSpan)).toFixed(2),
        faithPoolMult: isFaith ? +(1 + (idx0 === 0 ? 0 : t * faithSpan)).toFixed(2) : 1,
        senseBonus: idx0 === 0 ? 0 : Math.max(1, Math.round(t * senseTop))
      },
      realmBuffs: {
        combatOffensePct: +Math.max(1.5, step * offTop).toFixed(1),
        combatDefensePct: +Math.max(1.2, step * defTop).toFixed(1),
        armorPenetrationPct: +Math.max(1.2, step * penTop).toFixed(1),
        counterStrikePct: +Math.max(0.8, step * cntTop).toFixed(1),
        lifestealPct: hasLifesteal ? +Math.max(1.2, step * lsTop).toFixed(1) : 0,
        reflectPct: hasReflect ? +Math.max(1.2, step * refTop).toFixed(1) : 0,
        evasionPct: +Math.max(0.6, step * evaTop).toFixed(1),
        qiRegenBonusPct: zeroQi ? 0 : +Math.max(1.2, step * qRegTop).toFixed(1)
      }
    };
  };

  CULT.registerTracks = () => {
    const subMetaById = {};
    if (Array.isArray(CULT.subList)) {
      CULT.subList.forEach(({ path, sub }) => { if (sub && sub.id) subMetaById[sub.id] = { path, sub }; });
    }
    if (JD && JD.EXPANSION && Array.isArray(JD.EXPANSION.progressionMapping)) {
      JD.EXPANSION.progressionMapping.forEach(pm => {
        if (pm.subPath && Array.isArray(pm.realms)) {
          const meta = subMetaById[pm.subPath] || {};
          const pathId = pm.targetMajorPath || pm.sourceMajorPath || meta.path || 'XIAN';
          pm.realms.forEach((r, idx) => {
            const st = CULT.buildTrackRealmStats(pm.subPath, pathId, meta.sub, idx, r.skillGate);
            r.capacityMultipliers = st.capacityMultipliers;
            r.realmBuffs = st.realmBuffs;
          });
          CULT.TRACKS[pm.subPath] = pm;
          CULT.EXPANSION_TRACK_IDS.add(pm.subPath);
        }
      });
      if (CULT.TRACKS.SHADOW_ASSASSIN && CULT.TRACKS.SHADOW_ASSASSIN.realms && CULT.TRACKS.SHADOW_ASSASSIN.realms[1] && CULT.TRACKS.SHADOW_ASSASSIN.realms[1].skillGate) {
        CULT.TRACKS.SHADOW_ASSASSIN.realms[1].skillGate.minPrimarySkill = 30;
      }
    }
    // Register Specialization Progression Bridge for base/missing subpaths with distinct archetype profiles
    if (Array.isArray(CULT.subList)) {
      const mMapByPath = {
        XIAN: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        DEMON: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        HEART_SOUL: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        BODY: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
        GOD: [1.0, 1.5, 2.0, 2.5, 3.0, 3.3, 3.7, 3.9, 4.0],
        MECH_PUPPET: [1.0, 1.9, 2.8, 3.8, 4.7, 5.6, 6.6, 7.5, 8.0],
        KARMA_SAMSARA: [1.0, 1.9, 2.8, 3.8, 4.7, 5.6, 6.6, 7.5, 8.0],
        BEAST_SOVEREIGN: [1.0, 1.9, 2.8, 3.8, 4.7, 5.6, 6.6, 7.5, 8.0],
        SAGE_SUPPORT: [1.0, 1.9, 2.8, 3.8, 4.7, 5.6, 6.6, 7.5, 8.0],
        CRAFT_CREATION: [1.0, 1.9, 2.8, 3.8, 4.7, 5.6, 6.6, 7.5, 8.0]
      };
      const fcpTable = [130, 310, 620, 1180, 2250, 4100, 7400, 13200, 23500];
      const stoneTable = [55, 78, 125, 210, 350, 580, 950, 1550, 2500];
      const pMinTable = [15, 30, 40, 50, 60, 70, 80, 88, 95];
      const sMinTable = [10, 16, 22, 28, 34, 40, 46, 52, 58];
      CULT.subList.forEach(({ path, sub }) => {
        if (!sub || !sub.id || CULT.EXPANSION_TRACK_IDS.has(sub.id)) return;
        const [pSk, sSk] = sub.primarySkill ? [sub.primarySkill, (sub.secondarySkills || [])[0] || "SCRIPTURE"] : (BASE_SUB_GATE_SKILLS[sub.id] || ["MOVEMENT", "SCRIPTURE"]);
        const mMap = mMapByPath[path] || ((CULT.PATHS[path] || {}).maxStage === 8 ? mMapByPath.MECH_PUPPET : mMapByPath.XIAN);
        const maxSt = (CULT.PATHS[path] && CULT.PATHS[path].maxStage) || 9;
        const existing = CULT.ADVANCED_TRACKS[sub.id];
        if (existing && Array.isArray(existing.realms) && existing.realms.length === 9) {
          existing.realms.forEach((r, idx) => {
            const st = CULT.buildTrackRealmStats(sub.id, path, sub, idx, r.skillGate);
            r.capacityMultipliers = st.capacityMultipliers;
            r.realmBuffs = st.realmBuffs;
          });
          return;
        }
        const realms = [];
        for (let i = 0; i < 9; i++) {
          const ord = i + 1;
          const skillGate = {
            primarySkill: pSk,
            minPrimarySkill: pMinTable[i],
            secondarySkill: sSk,
            minSecondarySkill: sMinTable[i]
          };
          const st = CULT.buildTrackRealmStats(sub.id, path, sub, i, skillGate);
          realms.push({
            ordinal: ord,
            id: "R_ADV_" + sub.id + "_0" + ord,
            nameTh: sub.nameTh + " ขั้นที่ " + ord,
            lifespanMax: 95 + i * 35,
            functionalCombatPower: fcpTable[i],
            majorBandEquivalent: mMap[i],
            skillGate,
            resourceCost: {
              stones: stoneTable[i],
              materialTier: Math.min(7, 1 + Math.floor(i / 2))
            },
            capacityMultipliers: st.capacityMultipliers,
            realmBuffs: st.realmBuffs,
            breakthroughBaseChance: +(0.76 - i * 0.045).toFixed(2)
          });
        }
        CULT.ADVANCED_TRACKS[sub.id] = {
          subPath: sub.id,
          trackId: "TRACK_ADV_" + path + "_" + sub.id,
          sourceMajorPath: path,
          sourceIndependentRealmCount: 9,
          targetMajorPath: path,
          targetMajorStages: maxSt,
          majorPowerMapping: mMap.slice(),
          mode: "INDEPENDENT_TRACK",
          sourceRealmOrdinalsImported: true,
          realms
        };
      });
    }
  };
  CULT.registerTracks();

  CULT.isExpansionTrack = subPath => CULT.EXPANSION_TRACK_IDS.has(subPath);

  CULT.trackDef = subPath => {
    if (!subPath) return null;
    const cSub = CULT.resolveSubId ? CULT.resolveSubId(subPath) : subPath;
    if (!CULT.TRACKS[cSub] && !CULT.ADVANCED_TRACKS[cSub]) CULT.registerTracks();
    return CULT.TRACKS[cSub] || CULT.ADVANCED_TRACKS[cSub] || null;
  };

  CULT.trackOf = npc => {
    if (!npc || !npc.cult) return null;
    return npc.cult.track || null;
  };

  CULT.initTrack = (subPath, ord, day) => {
    const def = CULT.trackDef(subPath);
    if (!def || !def.realms || !def.realms.length) return null;
    const ordinal = clamp(ord || 1, 1, def.realms.length);
    const r = def.realms[ordinal - 1];
    return {
      subPath,
      ordinal,
      realmId: r.id,
      realmNameTh: r.nameTh,
      prog: 0,
      attempts: 0,
      history: [{ ordinal, realmId: r.id, realmNameTh: r.nameTh, atDay: day || 0 }]
    };
  };

  CULT.awakenSpecializationTrack = (npc, day) => {
    if (!npc || !npc.cult || !npc.cult.sub || npc.cult.sub === 'NONE') return null;
    if (npc.cult.track) return npc.cult.track;
    const def = CULT.trackDef(npc.cult.sub);
    if (def) {
      npc.cult.track = CULT.initTrack(npc.cult.sub, 1, day || 0);
      CULT.refreshLifespan(npc);
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      HC.bump(npc);
    }
    return npc.cult.track || null;
  };

  CULT.ensureTrack = (npc, day) => {
    if (!npc || !npc.cult) return null;
    if (g.MARTIAL) g.MARTIAL.normalize(npc);
    if (!npc.cult.track && npc.cult.sub !== 'NONE') {
      const isExp = CULT.isExpansionTrack(npc.cult.sub);
      const effSt = CULT.effectiveTechStage ? CULT.effectiveTechStage(npc) : (npc.cult.stage || 1);
      if (isExp || effSt >= 4) {
        CULT.awakenSpecializationTrack(npc, day);
      }
    }
    return npc.cult.track || null;
  };

  CULT.trackRealm = (npcOrSub, ord) => {
    let subPath, ordinal;
    if (typeof npcOrSub === 'object' && npcOrSub !== null) {
      const tr = CULT.trackOf(npcOrSub);
      if (!tr) return null;
      subPath = tr.subPath;
      ordinal = ord != null ? ord : tr.ordinal;
    } else {
      subPath = npcOrSub;
      ordinal = ord;
    }
    const def = CULT.trackDef(subPath);
    if (!def || !def.realms) return null;
    return def.realms[(ordinal || 1) - 1] || null;
  };

  const TRACK_THRESH_CURVE = [200, 520, 1350, 3400, 8500, 21000, 50000, 120000];
  CULT.trackThreshold = (npcOrSub, ord) => {
    if (typeof npcOrSub === 'object' && npcOrSub !== null && ord == null) {
      const tr = npcOrSub.cult && npcOrSub.cult.track;
      if (!tr || tr.ordinal >= 9) return Infinity;
      return TRACK_THRESH_CURVE[tr.ordinal - 1] || 150000;
    }
    let subPath, ordinal;
    if (typeof npcOrSub === 'object' && npcOrSub !== null) {
      const tr = CULT.trackOf(npcOrSub);
      if (!tr) return Infinity;
      subPath = tr.subPath;
      ordinal = ord != null ? ord : tr.ordinal;
    } else {
      subPath = npcOrSub;
      ordinal = ord || 1;
    }
    const def = CULT.trackDef(subPath);
    if (!def || !def.realms) return Infinity;
    if (ordinal >= def.realms.length) return Infinity;
    return TRACK_THRESH_CURVE[ordinal - 1] || 150000;
  };

  CULT.trackReady = npc => {
    const tr = CULT.trackOf(npc);
    if (!tr) return false;
    const def = CULT.trackDef(tr.subPath);
    if (!def || tr.ordinal >= def.realms.length) return false;
    const th = CULT.trackThreshold(npc);
    return tr.prog >= th;
  };

  CULT.checkTrackGates = (W, npc, targetOrd) => {
    const tr = CULT.trackOf(npc);
    if (!tr) return { ok: false, reason: "ไม่มีสายบำเพ็ญเฉพาะทาง", reasons: ["ไม่มีสายบำเพ็ญเฉพาะทาง"], missingSkills: [], missingStones: { required: 0, currentPersonal: 0, currentSect: 0, deficit: 0, canUseSect: false } };
    const def = CULT.trackDef(tr.subPath);
    if (!def) return { ok: false, reason: "ไม่พบข้อมูลสายบำเพ็ญ", reasons: ["ไม่พบข้อมูลสายบำเพ็ญ"], missingSkills: [], missingStones: { required: 0, currentPersonal: 0, currentSect: 0, deficit: 0, canUseSect: false } };
    const nextOrd = targetOrd != null ? targetOrd : tr.ordinal + 1;
    if (nextOrd > def.realms.length) {
      return { ok: false, reason: "บรรลุขั้นสูงสุดของสายแล้ว (ขั้น 9)", reasons: ["บรรลุขั้นสูงสุดของสายแล้ว"], maxReached: true, missingSkills: [], missingStones: { required: 0, currentPersonal: 0, currentSect: 0, deficit: 0, canUseSect: false } };
    }
    if (g.MARTIAL && g.MARTIAL.ensureSkills) g.MARTIAL.ensureSkills(npc);
    const nextRealm = def.realms[nextOrd - 1];
    const gate = nextRealm.skillGate || {};
    const reasons = [];
    const missingSkills = [];
    const h = npc.h || {};
    const skills = h.skills || {};
    const readSk = id => (g.MARTIAL && g.MARTIAL.skillRead) ? g.MARTIAL.skillRead(npc, id) : (skills[id] || 0);
    const nameSk = id => {
      const cid = (g.MARTIAL && g.MARTIAL.resolveSkillId) ? g.MARTIAL.resolveSkillId(id) : id;
      const info = g.MARTIAL && ((g.MARTIAL.SKILL_INFO && g.MARTIAL.SKILL_INFO[cid]) || (g.MARTIAL.ELEM_GATE_SKILLS && g.MARTIAL.ELEM_GATE_SKILLS[cid]));
      if (info && info.nameTh) return info.nameTh;
      const hName = HC.nameOf && HC.nameOf("skills." + cid);
      return (hName && hName !== "skills." + cid) ? hName : cid;
    };
    let skillOk = true;
    if (gate.primarySkill) {
      const curPrimary = readSk(gate.primarySkill);
      const reqPrimary = gate.minPrimarySkill || 0;
      if (curPrimary < reqPrimary) {
        skillOk = false;
        reasons.push("ทักษะ " + gate.primarySkill + " ไม่ถึงเกณฑ์ (" + Math.round(curPrimary) + "/" + reqPrimary + ")");
        missingSkills.push({
          skill: gate.primarySkill,
          nameTh: nameSk(gate.primarySkill),
          current: curPrimary,
          required: reqPrimary,
          deficit: +(reqPrimary - curPrimary).toFixed(2),
          role: "primary"
        });
      }
    }
    if (gate.secondarySkill) {
      const curSec = readSk(gate.secondarySkill);
      const reqSec = gate.minSecondarySkill || 0;
      if (curSec < reqSec) {
        skillOk = false;
        reasons.push("ทักษะ " + gate.secondarySkill + " ไม่ถึงเกณฑ์ (" + Math.round(curSec) + "/" + reqSec + ")");
        missingSkills.push({
          skill: gate.secondarySkill,
          nameTh: nameSk(gate.secondarySkill),
          current: curSec,
          required: reqSec,
          deficit: +(reqSec - curSec).toFixed(2),
          role: "secondary"
        });
      }
    }
    if (missingSkills.length > 1) missingSkills.sort((a, b) => b.deficit - a.deficit);
    const cost = nextRealm.resourceCost || {};
    const reqStones = cost.stones || 0;
    const havePersonal = (npc.inv && npc.inv.stones != null) ? npc.inv.stones : 0;
    const haveSect = (W && W.sect && W.sect.stones != null) ? W.sect.stones : 0;
    const canUseSect = !!(npc.rank >= 2 || (W && W.sect && W.sect.policy && W.sect.policy.subsidizeSpecialization));
    let stonesSource = "none";
    let resourceOk = false;
    if (havePersonal >= reqStones) {
      stonesSource = "personal";
      resourceOk = true;
    } else if (haveSect >= reqStones && canUseSect) {
      stonesSource = "sect";
      resourceOk = true;
    } else {
      reasons.push("ศิลาวิญญาณไม่เพียงพอ (ต้องการ " + reqStones + " ก้อน มี " + Math.round(havePersonal) + ")");
    }
    const th = CULT.trackThreshold(npc);
    const prog = tr.prog || 0;
    return {
      ok: reasons.length === 0,
      reasons,
      reason: reasons.join(" · "),
      skillOk,
      resourceOk,
      stonesRequired: reqStones,
      stonesSource,
      missingSkills,
      missingStones: {
        required: reqStones,
        currentPersonal: havePersonal,
        currentSect: haveSect,
        deficit: resourceOk ? 0 : Math.max(0, reqStones - havePersonal),
        canUseSect
      },
      progress: prog,
      threshold: th,
      progressRatio: (Number.isFinite(th) && th > 0) ? clamp(prog / th, 0, 1) : 1,
      readyToAdvance: prog >= th,
      nearThreshold: prog >= th * 0.65,
      currentOrdinal: tr.ordinal,
      nextOrdinal: nextOrd,
      nextRealm
    };
  };

  CULT.skillResolutionCandidates = skillId => {
    const M = g.MARTIAL;
    const isWpn = M && M.SKILL_GROUPS && M.SKILL_GROUPS.weapon.includes(skillId);
    const isMartial = isWpn || ["MOVEMENT", "BODY_REFINING", "SOUL_DIVINE", "POISON", "WATER_ICE", "WOOD_LIFE", "stealth", "survival"].includes(skillId);
    const acts = ["skillDrill"];
    if (isMartial) acts.push("practice");
    if (skillId === "SCRIPTURE" || skillId === "ARRAY" || skillId === "TALISMAN") acts.push("study", "guidedStudy");
    else if (skillId === "ALCHEMY" || skillId === "POISON") acts.push("brewBasic", "personalBrew", "brew");
    else if (skillId === "FORGING") acts.push("forge");
    else if (skillId === "herbalism") acts.push("farm", "forage", "gatherWildResource");
    else if (skillId === "mining") acts.push("mine");
    else if (skillId === "cooking") acts.push("cook");
    else if (skillId === "ritual") acts.push("pray", "cultivate");
    else if (skillId === "arts") acts.push("leisure");
    else if (skillId === "survival" || skillId === "BEAST_TAMING") acts.push("wildHunt", "forage", "guard");
    acts.push("pair");
    return acts;
  };

  CULT.findQualifiedSkillTeacher = (W, student, skillId) => {
    if (!W || !Array.isArray(W.npcs) || !student || !skillId) return null;
    const readSk = (u, id) => (g.MARTIAL && g.MARTIAL.skillRead) ? g.MARTIAL.skillRead(u, id) : ((u.h && u.h.skills && u.h.skills[id]) || 0);
    const cur = readSk(student, skillId);
    let best = null, bestVal = cur + 2;
    for (let i = 0; i < W.npcs.length; i++) {
      const o = W.npcs[i];
      if (!o || o === student || o.dead || o.away || o.exiled || o.sealed || (o.jail && o.jail > W.t)) continue;
      if (o.rank < 2 || o.rank <= student.rank) continue;
      if (g.AI && g.AI.isProtectedAction && g.AI.isProtectedAction(W, o, "teach")) continue;
      const lv = readSk(o, skillId);
      if (lv > bestVal) { bestVal = lv; best = o; }
    }
    return best;
  };

  CULT.isResolutionActionFeasible = (W, npc, actId, targetSkill) => {
    if (!W || !npc || !g.AI || !g.AI.ACTS) return { ok: false, reasonTh: "ไม่พบระบบกิจกรรม" };
    if (actId === "pair") {
      if (npc.cool && npc.cool.pair > W.t) return { ok: false, reasonTh: "เพิ่งพบปะหรือชวนผู้อื่นไปเมื่อครู่" };
      const teacher = targetSkill ? CULT.findQualifiedSkillTeacher(W, npc, targetSkill) : null;
      if (!teacher) return { ok: false, reasonTh: "ไม่มีอาจารย์หรือศิษย์พี่ที่เชี่ยวชาญทักษะ " + (targetSkill || "") + " ว่างชี้แนะ" };
      const st = g.AI.freeStation(W, npc, "dummy", "training_ground");
      if (!st) return { ok: false, reasonTh: "ลานฝึกยุทธ์ไม่มีพื้นที่ว่างสำหรับรับการชี้แนะ" };
      return { ok: true, teacherId: teacher.id };
    }
    const act = g.AI.ACTS[actId];
    if (!act) return { ok: false, reasonTh: "ไม่มีกิจกรรม " + actId };
    if (npc.cool && npc.cool[actId] > W.t) return { ok: false, reasonTh: "อยู่ระหว่างพักรอบกิจกรรม " + (act.nameTh || actId) };
    if (act.can && !act.can(npc, W)) return { ok: false, reasonTh: "ยังไม่ผ่านเงื่อนไขของ " + (act.nameTh || actId) };
    if (actId === "skillDrill") {
      const M = g.MARTIAL;
      const sk = targetSkill || (M && M.pickSkillPractice ? M.pickSkillPractice(W, npc) : "MOVEMENT");
      const isPhysical = (M && M.SKILL_GROUPS && M.SKILL_GROUPS.weapon.includes(sk)) || ["MOVEMENT", "BODY_REFINING", "stealth", "survival", "BEAST_TAMING"].includes(sk);
      const st = g.AI.freeStation(W, npc, isPhysical ? "dummy" : "read", isPhysical ? "training_ground" : "scripture") ||
        (isPhysical ? (g.AI.freeStation(W, npc, "spar", "training_ground") || g.AI.freeStation(W, npc, "read", "scripture")) : g.AI.freeStation(W, npc, "dummy", "training_ground"));
      if (!st) return { ok: false, reasonTh: "ไม่มีแท่นฝึกว่างในลานฝึกยุทธ์หรือหอคัมภีร์" };
      return { ok: true };
    }
    if (actId === "practice") {
      const st = g.AI.freeStation(W, npc, "dummy", "training_ground");
      if (!st) return { ok: false, reasonTh: "หุ่นฝึกในลานฝึกยุทธ์ถูกใช้งานเต็มทั้งหมด" };
      return { ok: true };
    }
    if (actId === "study" || actId === "guidedStudy") {
      const st = g.AI.freeStation(W, npc, "read", "scripture");
      if (!st) return { ok: false, reasonTh: "โต๊ะอ่านคัมภีร์ในหอคัมภีร์เต็มทั้งหมด" };
      return { ok: true };
    }
    if (actId === "mine") {
      const st = g.AI.freeStation(W, npc, "mine", "mine");
      if (!st) return { ok: false, reasonTh: "เหมืองแร่ไม่มีจุดขุดว่าง" };
      return { ok: true };
    }
    if (actId === "farm") {
      const st = g.AI.freeStation(W, npc, "farm", "herb_garden") || g.AI.freeStation(W, npc, "farm", "farm");
      if (!st) return { ok: false, reasonTh: "แปลงสมุนไพรและไร่นาเต็มทั้งหมด" };
      return { ok: true };
    }
    if (actId === "shop") {
      const st = g.AI.freeStation(W, npc, "browse", "market");
      if (!st) return { ok: false, reasonTh: "ตลาดสำนักไม่มีจุดแลกเปลี่ยนว่าง" };
      return { ok: true };
    }
    if (act.where) {
      const w = act.where(W, npc);
      if (!w) return { ok: false, reasonTh: "ไม่มีสถานีหรือเป้าหมายว่างสำหรับ " + (act.nameTh || actId) };
    }
    return { ok: true };
  };

  CULT.inspectProgressionBottleneck = (W, npc) => {
    if (!npc || !npc.cult || npc.dead) {
      return { active: false, kind: null, track: null, major: null, feasibleActions: [], blockedReasons: [], explanationTh: "", explanationEn: "" };
    }
    const c = npc.cult, s = npc.h.state;
    const wt = W && W.t > 0 ? W.t : -1;
    const curActKey = (npc.act ? npc.act.id : "idle") + ":" + ((npc.act && npc.act.ctx && (npc.act.ctx.skill || npc.act.ctx.skillTgt)) || "");
    const tr0 = CULT.trackOf(npc), def0 = tr0 ? CULT.trackDef(tr0.subPath) : null, g0 = (def0 && def0.realms && def0.realms[tr0.ordinal]) ? (def0.realms[tr0.ordinal].skillGate || {}) : {};
    const readSk0 = id => (g.MARTIAL && g.MARTIAL.skillRead) ? g.MARTIAL.skillRead(npc, id) : ((npc.h && npc.h.skills && npc.h.skills[id]) || 0);
    const skKey = (g0.primarySkill ? Math.floor(readSk0(g0.primarySkill) * 10) : 0) + ":" + (g0.secondarySkill ? Math.floor(readSk0(g0.secondarySkill) * 10) : 0);
    const busySt = (W && W.map && Array.isArray(W.map.stations)) ? W.map.stations.reduce((acc, st) => acc + (st && st.occ ? 1 : 0), 0) : 0;
    const stKey = Math.floor((npc.inv && npc.inv.stones) || 0) + ":" + Math.floor(npc.cp || 0) + ":" + (c.stage || 0) + ":" + Math.floor(c.prog || 0) + ":" + (tr0 ? tr0.ordinal + ":" + Math.floor(tr0.prog || 0) : "0") + ":" + skKey + ":" + busySt + ":" + (npc.inj ? npc.inj.length : 0) + ":" + Math.floor((s && s.energy) || 0);
    if (wt > 0 && npc._bnInspectCache && npc._bnInspectCache.t === wt && npc._bnInspectCache.ver === npc._ver && npc._bnInspectCache.actKey === curActKey && npc._bnInspectCache.stKey === stKey) {
      return npc._bnInspectCache.out;
    }
    const driveMult = clamp(
      0.42 +
      (HC.eff(npc, "personality.ambition") - 45) / 105 +
      (HC.eff(npc, "values.martialPeak") - 45) / 125 +
      (HC.eff(npc, "personality.discipline") - 45) / 155 -
      (HC.eff(npc, "values.freedom") - 55) / 220,
      0.25,
      1.65
    );
    const hpMax = CULT.hpMax(npc);
    const gObj = npc.cognition && npc.cognition.goal ? npc.cognition.goal : null;
    const activeCrisis = !!(gObj && gObj.id === "crisis" && W && W.sect && (W.sect.shortageDirectives || []).some(d => d.id === gObj.targetId && d.deficit > 0));
    const activeHelpFriend = !!(gObj && gObj.id === "help_friend" && W && W.byId && W.byId[gObj.targetId] && !W.byId[gObj.targetId].dead && W.byId[gObj.targetId].h.state.hp < CULT.hpMax(W.byId[gObj.targetId]) * 0.72);
    const competingNeed =
      (s.hp < hpMax * 0.4 || (npc.inj && npc.inj.length)) ? "บาดเจ็บ/พลังชีวิตต่ำ ต้องรักษาตัวก่อน"
      : s.satiety < 24 ? "กำลังหิว ต้องกินอาหารก่อน"
      : s.rest < 14 ? "อ่อนล้ามาก ต้องพักผ่อนก่อน"
      : ((c.toxic || 0) >= 60) ? "พิษโอสถสะสมสูง ต้องขับพิษก่อน"
      : ((s.heartDemon || 0) >= 65 && c.path !== "DEMON") ? "จิตมารรบกวนหนัก ต้องสงบจิตใจก่อน"
      : (npc.act && npc.act.id === "duty") ? "กำลังปฏิบัติหน้าที่ตำแหน่งในสำนัก"
      : (npc.act && npc.act.id === "guard") ? "กำลังเข้าเวรเฝ้ายาม"
      : activeCrisis ? "กำลังช่วยสำนักแก้วิกฤตขาดแคลนเร่งด่วน"
      : activeHelpFriend ? "กำลังช่วยเหลือสหายที่บาดเจ็บ"
      : null;

    let trackInfo = null;
    const tr = CULT.trackOf(npc);
    if (tr && tr.ordinal < 9) {
      const gate = CULT.checkTrackGates(W, npc);
      if (!gate.ok && (gate.readyToAdvance || gate.nearThreshold)) {
        const feasibleActions = [];
        const blockedReasons = [];
        const primaryMissingSkill = gate.missingSkills.length ? gate.missingSkills[0] : null;
        if (!gate.skillOk && gate.missingSkills.length) {
          for (let i = 0; i < gate.missingSkills.length; i++) {
            const ms = gate.missingSkills[i];
            const cands = CULT.skillResolutionCandidates(ms.skill);
            for (let j = 0; j < cands.length; j++) {
              const actId = cands[j];
              if (feasibleActions.includes(actId)) continue;
              const chk = CULT.isResolutionActionFeasible(W, npc, actId, ms.skill);
              if (chk.ok) feasibleActions.push(actId);
              else if (chk.reasonTh && !blockedReasons.includes(chk.reasonTh)) blockedReasons.push(chk.reasonTh);
            }
          }
        }
        if (!gate.resourceOk && gate.missingStones.deficit > 0) {
          const stoneActs = ["shop", "outsideTrade", "mine", "forage", "gatherWildResource", "donate", "errand", "farm"];
          for (let j = 0; j < stoneActs.length; j++) {
            const actId = stoneActs[j];
            if (feasibleActions.includes(actId)) continue;
            const chk = CULT.isResolutionActionFeasible(W, npc, actId, null);
            if (chk.ok) feasibleActions.push(actId);
            else if (chk.reasonTh && !blockedReasons.includes(chk.reasonTh)) blockedReasons.push(chk.reasonTh);
          }
        }
        const curActId = npc.act ? npc.act.id : "idle";
        const curSkill = (npc.act && npc.act.ctx && (npc.act.ctx.skill || npc.act.ctx.skillTgt)) || null;
        const trainedSkillObj = gate.missingSkills.find(m => m.skill === curSkill) || ((curActId === "pair" && npc.act?.ctx?.pair?.type === "teach" && !curSkill) ? primaryMissingSkill : null);
        const isTrainingTargetSkill = !!(trainedSkillObj && (curActId === "skillDrill" || curActId === "practice" || (curActId === "pair" && npc.act?.ctx?.pair?.type === "teach")));
        const isGatheringStones = !!(!gate.resourceOk && ["mine", "forage", "gatherWildResource", "outsideTrade", "shop", "donate", "errand"].includes(curActId));
        const isActivelyResolving = isTrainingTargetSkill || isGatheringStones;
        const gatePartsEn = [];
        const gatePartsTh = [];
        for (let i = 0; i < gate.missingSkills.length; i++) {
          const ms = gate.missingSkills[i];
          gatePartsEn.push(ms.skill + " " + Math.floor(ms.current) + "/" + ms.required);
          gatePartsTh.push("ทักษะ" + ms.nameTh + " (" + ms.skill + " " + Math.floor(ms.current) + "/" + ms.required + ")");
        }
        if (!gate.resourceOk && gate.missingStones.deficit > 0) {
          gatePartsEn.push("STONES " + Math.floor(gate.missingStones.currentPersonal) + "/" + gate.missingStones.required);
          gatePartsTh.push("ศิลาวิญญาณ " + Math.floor(gate.missingStones.currentPersonal) + "/" + gate.missingStones.required);
        }
        const blockerTh = feasibleActions.length === 0 ? (blockedReasons[0] || "ไม่มีสถานี อาจารย์ หรือทรัพยากรที่เข้าถึงได้ในขณะนี้") : null;
        let statusTh, statusEn;
        if (isTrainingTargetSkill && trainedSkillObj) {
          statusTh = "ติดคอขวดสายเฉพาะทาง: ขาด" + gatePartsTh.join(" และ ") + " — กำลังฝึก " + trainedSkillObj.nameTh + " (" + trainedSkillObj.skill + ")";
          statusEn = "Specialization breakthrough blocked: " + gatePartsEn.join(", ") + " — currently training " + trainedSkillObj.skill + ".";
        } else if (isGatheringStones) {
          const actNameTh = (g.AI && g.AI.ACTS && g.AI.ACTS[curActId] ? g.AI.ACTS[curActId].nameTh : curActId);
          statusTh = "ติดคอขวดสายเฉพาะทาง: ขาด" + gatePartsTh.join(" และ ") + " — กำลังจัดหาทรัพยากร (" + actNameTh + ")";
          statusEn = "Specialization breakthrough blocked: " + gatePartsEn.join(", ") + " — currently acquiring resources (" + curActId + ").";
        } else if (competingNeed) {
          statusTh = "ติดคอขวดสายเฉพาะทาง: ขาด" + gatePartsTh.join(" และ ") + " — ชะลอชั่วคราวเพราะ" + competingNeed;
          statusEn = "Specialization breakthrough blocked: " + gatePartsEn.join(", ") + " — deferred due to competing priority (" + curActId + ").";
        } else if (blockerTh) {
          statusTh = "ติดคอขวดสายเฉพาะทาง: ขาด" + gatePartsTh.join(" และ ") + " — ยังดำเนินการไม่ได้: " + blockerTh;
          statusEn = "Specialization breakthrough blocked: " + gatePartsEn.join(", ") + " — blocked: " + blockerTh;
        } else {
          const nextAct = feasibleActions[0];
          const nextNameTh = (g.AI && g.AI.ACTS && g.AI.ACTS[nextAct] ? g.AI.ACTS[nextAct].nameTh : nextAct);
          const curNameTh = (g.AI && g.AI.ACTS && g.AI.ACTS[curActId] ? g.AI.ACTS[curActId].nameTh : curActId);
          statusTh = "ติดคอขวดสายเฉพาะทาง: ขาด" + gatePartsTh.join(" และ ") + " — ปัจจุบัน: " + curNameTh + " (เตรียม " + nextNameTh + ")";
          statusEn = "Specialization breakthrough blocked: " + gatePartsEn.join(", ") + " — next feasible action: " + nextAct + ".";
        }
        trackInfo = {
          active: true,
          ready: gate.readyToAdvance,
          near: gate.nearThreshold,
          gateOk: false,
          impossible: feasibleActions.length === 0,
          subPath: tr.subPath,
          ordinal: tr.ordinal,
          nextOrdinal: gate.nextOrdinal,
          nextRealmNameTh: gate.nextRealm ? gate.nextRealm.nameTh : "",
          missingSkills: gate.missingSkills,
          missingStones: gate.missingStones,
          primarySkillToTrain: primaryMissingSkill ? primaryMissingSkill.skill : null,
          feasibleActions,
          recommendedActions: feasibleActions,
          blockedReasons,
          blockerReasonTh: blockerTh,
          isActivelyResolving,
          statusTh,
          statusEn
        };
      }
    }

    let majorInfo = null;
    const maxSt = CULT.maxStage(npc);
    const thMajor = CULT.threshold(npc);
    const eqStage = CULT.equivalentStage(npc);
    const effTechSt = CULT.effectiveTechStage(npc);
    if (c.stage < maxSt && Number.isFinite(thMajor) && (c.bn || c.prog >= thMajor * 0.75)) {
      const ready = c.prog >= thMajor;
      const pillKey = g.BN ? g.BN.pillKey(c) : ("P:BT_" + c.path + "_" + c.stage);
      const hasPill = !!(g.BN && g.BN.heldPill(npc)) || (c.btBonus || 0) >= 0.1;
      const trObj = g.BN ? g.BN.treasureOf(c) : null;
      const needTreasure = !!(trObj && c.treasure !== trObj.id);
      const needFoundation = !!(c.bn && c.bn.plan === "wait" && (c.found || 0) < 0.08);
      const needTech = (c.techs ? c.techs.length : 0) < Math.min(2, effTechSt) && W && W.sect && Array.isArray(W.sect.library) && CULT.learnable(npc, W.sect.library).length > 0;
      const feasibleActions = [];
      const blockedReasons = [];
      const cands = [];
      if (ready && (!c.bn || c.bn.plan === "go")) cands.push("breakthrough");
      if (needFoundation) cands.push("consolidate", "pray");
      if (!hasPill) {
        if (W && W.sect && W.sect.stock && W.sect.stock[pillKey] > 0) cands.push("shop");
        cands.push("personalBrew", "brewBasic", "brew", "forage", "gatherWildResource");
      }
      if (needTreasure) cands.push("errand", "outsideTrade");
      if (needTech) cands.push("study", "guidedStudy");
      if (!ready) cands.push("cultivate", "paidTraining");
      for (let i = 0; i < cands.length; i++) {
        const actId = cands[i];
        if (feasibleActions.includes(actId)) continue;
        const chk = CULT.isResolutionActionFeasible(W, npc, actId, null);
        if (chk.ok) feasibleActions.push(actId);
        else if (chk.reasonTh && !blockedReasons.includes(chk.reasonTh)) blockedReasons.push(chk.reasonTh);
      }
      const curActId = npc.act ? npc.act.id : "idle";
      const isActivelyResolving = feasibleActions.includes(curActId) || curActId === "breakthrough" || curActId === "consolidate";
      const unmetListTh = [];
      if (needFoundation) unmetListTh.push("ฐานปราณตกผลึก (" + Math.round((c.found || 0) * 100) + "/8%)");
      if (!hasPill) unmetListTh.push("โอสถทะลวงขั้น (" + pillKey + ")");
      if (needTreasure) unmetListTh.push("สมบัติประจำด่าน " + trObj.nameTh);
      if (needTech) unmetListTh.push("คัมภีร์วิชาระดับเทียบเคียงขั้น " + effTechSt);
      if (!ready) unmetListTh.push("ตบะ " + Math.round(c.prog) + "/" + thMajor);
      const blockerTh = feasibleActions.length === 0 ? (blockedReasons[0] || "ไม่มีสถานีหรือทรัพยากรที่พร้อมใช้") : null;
      const curNameTh = (g.AI && g.AI.ACTS && g.AI.ACTS[curActId] ? g.AI.ACTS[curActId].nameTh : curActId);
      const statusTh = "คอขวดวิถีหลัก (" + CULT.stageName(npc) + " · เทียบเคียงขั้น " + eqStage.toFixed(1) + "): " +
        (unmetListTh.length ? "ต้องการ " + unmetListTh.join(" · ") : "พร้อมทะลวงขั้น") +
        (isActivelyResolving ? " — กำลังทำ " + curNameTh : blockerTh ? " — ติดขัด: " + blockerTh : " — ปัจจุบัน: " + curNameTh);
      const stDefMajor = (CULT.PATHS[c.path] && CULT.PATHS[c.path].stages) ? CULT.PATHS[c.path].stages[c.stage - 1] : null;
      const stageResCheck = CULT.checkStageResourceReq ? CULT.checkStageResourceReq(W, npc) : { resourceReq: stDefMajor && stDefMajor.resourceReq, satisfied: true };
      majorInfo = {
        active: true,
        ready,
        near: c.prog >= thMajor * 0.75,
        equivalentStage: eqStage,
        effectiveTechStage: effTechSt,
        plan: c.bn ? c.bn.plan : null,
        resourceReq: stageResCheck.resourceReq || null,
        resourceReqSatisfied: !!stageResCheck.satisfied,
        needFoundation,
        needPill: !hasPill,
        pillKey,
        needTreasure,
        treasure: trObj,
        needTech,
        feasibleActions,
        blockedReasons,
        blockerReasonTh: blockerTh,
        isActivelyResolving,
        statusTh
      };
    }

    const primary = trackInfo || majorInfo;
    const out = {
      active: !!(trackInfo || majorInfo),
      kind: trackInfo ? "track" : majorInfo ? "major" : null,
      driveMult,
      competingNeed,
      relevantToNpc: !!(trackInfo || majorInfo) && driveMult >= 0.35 && !competingNeed,
      track: trackInfo,
      major: majorInfo,
      impossible: primary ? (primary.feasibleActions.length === 0) : false,
      feasibleActions: primary ? primary.feasibleActions : [],
      recommendedActions: primary ? primary.feasibleActions : [],
      missingRequirements: trackInfo ? trackInfo.missingSkills.map(m => ({ key: m.skill, skill: m.skill, nameTh: m.nameTh, current: m.current, required: m.required, deficit: m.deficit })) : [],
      blockedReasons: primary ? primary.blockedReasons : [],
      blockerReasonTh: primary ? primary.blockerReasonTh : null,
      isActivelyResolving: primary ? primary.isActivelyResolving : false,
      explanationTh: trackInfo ? trackInfo.statusTh : majorInfo ? majorInfo.statusTh : "",
      explanationEn: trackInfo ? trackInfo.statusEn : ""
    };
    if (wt > 0) {
      npc._bnInspectCache = { t: wt, ver: npc._ver, actKey: curActKey, stKey, out };
    }
    return out;
  };

  CULT.trackBreakthroughChance = (npc, opts) => {
    const tr = CULT.trackOf(npc);
    if (!tr) return 0;
    const def = CULT.trackDef(tr.subPath);
    if (!def || tr.ordinal >= def.realms.length) return 0;
    const nextRealm = def.realms[tr.ordinal];
    let p = nextRealm ? nextRealm.breakthroughBaseChance : 0.5;
    const root = (HC.ROOT_BY_ID && npc.h && npc.h.root) ? (HC.ROOT_BY_ID[npc.h.root.grade] || HC.ROOT_BY_ID.MORTAL) : { breakthroughBonus: 0 };
    p *= 0.75 + clamp(HC.derived(npc).cultivationTalent, 20, 120) / 200;
    p += root.breakthroughBonus || 0;
    p += (HC.eff(npc, 'personality.composure') - 50) / 50 * 0.08 + (HC.eff(npc, 'intellect.willpower') - 50) / 50 * 0.08;
    p += HC.special(npc, 'cultivation.breakthroughBonus');
    const tribResBt = clamp(HC.special(npc, 'cultivation.tribulationResist') || 0, 0, 0.6);
    const trOrdBt = tr.ordinal || 0;
    if (tribResBt > 0 && (trOrdBt >= 3 || (opts && opts.tribulation) || (npc.tribulationState && npc.tribulationState.active))) {
      p += tribResBt * 0.35;
    }
    const s = npc.h ? npc.h.state : {};
    p -= (s.heartDemon || 0) / 100 * 0.2 + (npc.cult.toxic || 0) / 100 * 0.12;
    if (CULT.isAncestralBlessingActive(npc, opts && Number.isFinite(opts.now) ? opts.now : null)) {
      p += (npc.ancestralBlessing.breakthroughBonus || 0);
    }
    if (opts) {
      p += (opts.pill || 0) + (opts.env || 0) + (opts.guide || 0) + (opts.bonus || 0);
    }
    return clamp(p, (opts && opts.bonus != null && opts.bonus <= -0.99) ? 0 : 0.05, 0.95);
  };

  CULT.trackBreakthrough = (W, npc, opts) => {
    const tr = CULT.trackOf(npc);
    if (!tr) return { ok: false, reason: 'ไม่มีสายบำเพ็ญเฉพาะทาง' };
    const def = CULT.trackDef(tr.subPath);
    if (!def) return { ok: false, reason: 'ไม่พบข้อมูลสายบำเพ็ญ' };
    const gate = CULT.checkTrackGates(W, npc);
    if (!gate.ok && (!opts || !opts.ignoreGates)) {
      return { ok: false, blockedByGate: true, reason: gate.reason, gate };
    }
    const th = CULT.trackThreshold(npc);
    if (tr.prog < th && (!opts || !opts.force)) {
      return { ok: false, blockedByProgress: true, reason: 'ตบะสายเฉพาะทางยังไม่เต็มขั้น' };
    }
    const reqStones = gate.stonesRequired;
    if (reqStones > 0 && (!opts || !opts.free)) {
      if (gate.stonesSource === 'personal') {
        npc.inv.stones = Math.max(0, npc.inv.stones - reqStones);
      } else if (gate.stonesSource === 'sect' && W && W.sect) {
        W.sect.stones = Math.max(0, W.sect.stones - reqStones);
        if (W.sect.ledger) W.sect.ledger.push({ t: W.t, type: 'track_bt', id: npc.id, stones: -reqStones });
      }
    }
    const p = CULT.trackBreakthroughChance(npc, Object.assign({}, opts || {}, { now: (opts && Number.isFinite(opts.now)) ? opts.now : (W && Number.isFinite(W.t) ? W.t : undefined) }));
    tr.attempts = (tr.attempts || 0) + 1;
    const ok = (opts && opts.guarantee) ? true : (W && W.rng ? W.rng.next() < p : 0.45 < p);
    const fromOrd = tr.ordinal;
    if (ok) {
      tr.ordinal++;
      const newRealm = CULT.trackRealm(npc);
      tr.realmId = newRealm.id;
      tr.realmNameTh = newRealm.nameTh;
      tr.prog = 0;
      tr.attempts = 0;
      const day = W && (W.day != null ? W.day : (W.t ? Math.floor(W.t / 1440) : 0));
      tr.history = tr.history || [];
      tr.history.push({ ordinal: tr.ordinal, realmId: newRealm.id, realmNameTh: newRealm.nameTh, atDay: day || 0 });
      const h = npc.h;
      if (h) {
        const prim = gate.nextRealm && gate.nextRealm.skillGate && gate.nextRealm.skillGate.primarySkill;
        if (prim && h.skills && h.skills[prim] != null) h.skills[prim] = Math.min(100, h.skills[prim] + 1.5);
        HC.gainWisdom(npc, 0.5);
        HC.experience(npc, 'insight', 0.6);
      }
      CULT.refreshLifespan(npc);
      if (CULT.evaluateSubpathArchetypeMastery) CULT.evaluateSubpathArchetypeMastery(npc);
      if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(npc);
      if (W && W.log) {
        W.log('breakthrough', npc.h.name.given + ' ทะลวงสายเฉพาะทางสู่「' + newRealm.nameTh + '」(ลำดับ ' + tr.ordinal + '/9)!', [npc.id]);
      }
      HC.bump(npc);
      return { ok: true, p, fromOrdinal: fromOrd, toOrdinal: tr.ordinal, realm: newRealm };
    } else {
      const blessed = !!(CULT.isAncestralBlessingActive(npc, W ? W.t : null) && npc.ancestralBlessing.injuryShield && (!npc.ancestralBlessing.untilDay || !W || W.day == null || npc.ancestralBlessing.untilDay >= W.day));
      if (blessed) npc.ancestralBlessing.injuryShield = false;
      tr.prog = th * ((blessed ? 0.65 : 0.5) + 0.2 * clamp(HC.eff(npc, 'intellect.willpower') / 100 * 0.6 + HC.eff(npc, 'personality.composure') / 100 * 0.4, 0, 1));
      HC.feel(npc, { mood: blessed ? -6 : -12, stress: blessed ? 5 : 12 });
      npc.h.state.heartDemon = clamp(npc.h.state.heartDemon + (blessed ? 3 : 8), 0, 100);
      if (W && W.log) {
        W.log('breakthrough', npc.h.name.given + ' ทะลวงสายเฉพาะทาง ' + def.realms[fromOrd - 1].nameTh + ' ไม่สำเร็จ (โอกาส ' + Math.round(p * 100) + '%)', [npc.id]);
      }
      HC.bump(npc);
      return { ok: false, p, failed: true, fromOrdinal: fromOrd, toOrdinal: fromOrd };
    }
  };

  CULT.trackFunctionalPower = (subPath, ord) => {
    const r = CULT.trackRealm(subPath, ord);
    return r ? r.functionalCombatPower : 0;
  };

  CULT.getFunctionalMetrics = entity => {
    if (!entity) return { power: 25, band: 0, label: 'ปุถุชน' };
    if (entity.cult && entity.cult.track) {
      const tr = entity.cult.track;
      const r = CULT.trackRealm(tr.subPath, tr.ordinal);
      if (r) {
        return {
          power: r.functionalCombatPower,
          band: CULT.trackEquivalentStage(tr.subPath, tr.ordinal),
          ordinal: tr.ordinal,
          realmName: r.nameTh,
          subPath: tr.subPath,
          majorPath: entity.cult.path,
          majorStage: entity.cult.stage,
          label: r.nameTh + ' (ลำดับ ' + tr.ordinal + '/9 · เทียบขั้นหลัก ' + r.majorBandEquivalent.toFixed(1) + ')'
        };
      }
    }
    if (entity.cult) {
      const c = entity.cult;
      const st = CULT.PATHS[c.path] && CULT.PATHS[c.path].stages[c.stage - 1];
      const power = st ? st.combatPower : 25;
      return {
        power,
        band: CULT.majorStageEquivalent(c.path, c.stage),
        ordinal: null,
        realmName: st ? st.nameTh : '',
        subPath: c.sub,
        majorPath: c.path,
        majorStage: c.stage,
        label: (st ? st.nameTh : 'ขั้น ' + c.stage) + ' (ขั้นหลัก ' + c.stage + ')'
      };
    }
    if (entity.subPath && entity.ordinal) {
      const r = CULT.trackRealm(entity.subPath, entity.ordinal);
      if (r) {
        return {
          power: r.functionalCombatPower,
          band: CULT.trackEquivalentStage(entity.subPath, entity.ordinal),
          ordinal: entity.ordinal,
          realmName: r.nameTh,
          subPath: entity.subPath,
          label: r.nameTh + ' (ลำดับ ' + entity.ordinal + '/9 · เทียบขั้นหลัก ' + r.majorBandEquivalent.toFixed(1) + ')'
        };
      }
    }
    if (entity.path && entity.stage) {
      const st = CULT.PATHS[entity.path] && CULT.PATHS[entity.path].stages[entity.stage - 1];
      const power = st ? st.combatPower : 25;
      return {
        power,
        band: CULT.majorStageEquivalent(entity.path, entity.stage),
        ordinal: null,
        realmName: st ? st.nameTh : '',
        majorPath: entity.path,
        majorStage: entity.stage,
        label: (st ? st.nameTh : 'ขั้น ' + entity.stage)
      };
    }
    return { power: 25, band: 0, label: 'ไม่ทราบขั้น' };
  };

  CULT.compareFunctionalPower = (a, b) => {
    const mA = CULT.getFunctionalMetrics(a);
    const mB = CULT.getFunctionalMetrics(b);
    const ratio = mB.power > 0 ? +(mA.power / mB.power).toFixed(3) : 1;
    const bandDelta = +(mA.band - mB.band).toFixed(2);
    let assessmentTh = '';
    if (ratio >= 1.35) {
      assessmentTh = 'เหนือกว่าอย่างเห็นได้ชัด (' + Math.round((ratio - 1) * 100) + '% แกร่งกว่า)';
    } else if (ratio >= 1.05) {
      assessmentTh = 'ได้เปรียบเล็กน้อย (' + Math.round((ratio - 1) * 100) + '% เหนือกว่า)';
    } else if (ratio >= 0.95) {
      assessmentTh = 'สูสีทัดเทียม (พลังเทียบเคียงกัน)';
    } else if (ratio >= 0.70) {
      assessmentTh = 'เป็นรองเล็กน้อย (' + Math.round((1 - ratio) * 100) + '% ด้อยกว่า)';
    } else {
      assessmentTh = 'ด้อยกว่าอย่างเห็นได้ชัด (' + Math.round((1 - ratio) * 100) + '% เป็นรอง)';
    }
    return {
      a: mA,
      b: mB,
      powerA: mA.power,
      powerB: mB.power,
      bandA: mA.band,
      bandB: mB.band,
      ratio,
      bandDelta,
      assessmentTh
    };
  };


  /* =========================================================================
   * 3) ระบบสัตว์เลี้ยงอสูรคู่สัญญา (UNIVERSAL SPIRIT BEAST PET SYSTEM v2.0.8)
   *    + ระบบหุ่นเชิดกลจักร (MECH_PUPPET) + ระบบตาชั่งวิบากกรรม (KARMA_SAMSARA)
   * ========================================================================= */
  const PET_ROLES = Object.freeze({
    FEROCIOUS_ASSAULT: { id: 'FEROCIOUS_ASSAULT', nameTh: 'จู่โจมดุดัน', icon: '🐺', atkBonus: 0.09, defBonus: 0.02, moveBonus: 4, descTh: 'เน้นประสานเขี้ยวเล็บจู่โจมและเจาะเกราะศัตรู' },
    IRON_GUARDIAN: { id: 'IRON_GUARDIAN', nameTh: 'ปราการพิทักษ์', icon: '🐢', atkBonus: 0.02, defBonus: 0.11, hpBonus: 0.08, descTh: 'กางเกราะรับความเสียหายแทนนายและสะท้อนแรงปะทะ' },
    MYSTIC_SUPPORT: { id: 'MYSTIC_SUPPORT', nameTh: 'ภูตทิพย์หนุนปราณ', icon: '🦌', matkBonus: 0.06, mdefBonus: 0.08, healBonus: 0.10, descTh: 'ฟื้นฟูพลังชีวิต ชำระสถานะร้าย และหนุนการทะลวงด่าน' },
    VENOM_SWARM: { id: 'VENOM_SWARM', nameTh: 'ฝูงพิษกัดกร่อน', icon: '🦂', atkBonus: 0.05, matkBonus: 0.07, penBonus: 8, descTh: 'ปล่อยพิษกัดกร่อนเกราะและดูดซับปราณศัตรู' },
    MOUNT_CHARGER: { id: 'MOUNT_CHARGER', nameTh: 'พาหนะศึกทะลวงทัพ', icon: '🐎', atkBonus: 0.06, defBonus: 0.05, moveBonus: 12, descTh: 'เพิ่มความเร็วเดินทาง พุ่งชาร์จทะลวงแนวหน้า และช่วยสำรวจ' }
  });
  const PET_ROLE_ALIASES = Object.freeze({
    ASTRAL_MOUNT: 'MOUNT_CHARGER',
    MOUNT: 'MOUNT_CHARGER',
    ASSAULT: 'FEROCIOUS_ASSAULT',
    GUARDIAN: 'IRON_GUARDIAN',
    SUPPORT: 'MYSTIC_SUPPORT',
    SWARM: 'VENOM_SWARM'
  });

  const FOUR_SYMBOL_BLOODLINES = Object.freeze({
    AZURE_DRAGON: {
      id: 'AZURE_DRAGON',
      nameTh: 'มังกรครามชิงหลง',
      titleTh: 'มังกรครามชิงหลง (สัตว์เทพทิศบูรพา)',
      icon: '🐉',
      direction: 'EAST',
      element: 'WATER_ICE',
      secondaryElement: 'WOOD_LIFE',
      families: ['AQUATIC', 'SERPENT', 'DRAGON_MYTHIC'],
      catalysts: ['CAT_PRIMORDIAL_WATER', 'CAT_PRIMORDIAL_WOOD'],
      atkPct: 0.14, matkPct: 0.22, defPct: 0.14, mdefPct: 0.18, hpPct: 0.16, critAdd: 6, penAdd: 10, btBonus: 0.08,
      perks: { rainfallControl: true, fishingYieldBonus: 0.35, fishingRegenBonus: 0.25, navalSpeedMult: 0.65 },
      descTh: 'ควบคุมเมฆฝนและกระแสน้ำ เพิ่มผลผลิตตกปลาธารน้ำปราณทักษิณ +35% และเร่งความเร็วเดินทางทางน้ำ +35%'
    },
    WHITE_TIGER: {
      id: 'WHITE_TIGER',
      nameTh: 'พยัคฆ์ขาวไป๋หู่',
      titleTh: 'พยัคฆ์ขาวไป๋หู่ (สัตว์เทพทิศประจิม)',
      icon: '🐅',
      direction: 'WEST',
      element: 'EARTH_METAL',
      secondaryElement: 'WIND',
      families: ['FELINE', 'CANINE'],
      catalysts: ['CAT_PRIMORDIAL_METAL'],
      atkPct: 0.24, matkPct: 0.12, defPct: 0.15, mdefPct: 0.12, hpPct: 0.16, critAdd: 12, penAdd: 18, btBonus: 0.07,
      perks: { siegeVanguardBonus: 0.35, gateBreachMult: 1.45, physicalBurstMult: 1.22 },
      descTh: 'พลังโจมตีกายภาพสูงสุด เป็นทัพหน้าทลายประตูและค่ายกลในการตีสำนักคู่อริ (+45% พลังทลายด่าน)'
    },
    VERMILION_PHOENIX: {
      id: 'VERMILION_PHOENIX',
      nameTh: 'วิหคเพลิงจูเชวี่ย',
      titleTh: 'วิหคเพลิงจูเชวี่ย (สัตว์เทพทิศทักษิณ)',
      icon: '🦅',
      direction: 'SOUTH',
      element: 'FIRE',
      secondaryElement: 'LIGHT_YANG',
      families: ['AVIAN', 'AUSPICIOUS_FAIRY'],
      catalysts: ['CAT_PRIMORDIAL_FIRE'],
      atkPct: 0.16, matkPct: 0.24, defPct: 0.12, mdefPct: 0.20, hpPct: 0.15, critAdd: 10, penAdd: 12, btBonus: 0.08,
      perks: { airReconnaissance: true, dispelFogOfWar: true, earlyRaidWarningDays: 3, mountSpeedMult: 0.60 },
      descTh: 'ลาดตระเวนเวหา เปิดหมอกแผนที่ยุทธภพทั้งหมด แจ้งเตือนภัยบุกสำนักล่วงหน้า และเร่งความเร็วเดินทาง +40%'
    },
    BLACK_TORTOISE: {
      id: 'BLACK_TORTOISE',
      nameTh: 'เต่าดำเสวียนอู่',
      titleTh: 'เต่าดำเสวียนอู่ (สัตว์เทพทิศอุดร)',
      icon: '🐢',
      direction: 'NORTH',
      element: 'EARTH_METAL',
      secondaryElement: 'YIN_SHADOW',
      families: ['SHELL_GUARDIAN', 'SHELL', 'URSINE_BOAR', 'URSINE', 'BOAR', 'UNGULATE', 'ARTHROPOD_SWARM', 'CHIMERA'],
      catalysts: ['CAT_PRIMORDIAL_EARTH'],
      atkPct: 0.12, matkPct: 0.14, defPct: 0.28, mdefPct: 0.26, hpPct: 0.25, critAdd: 4, penAdd: 8, btBonus: 0.08,
      perks: { garrisonDefenseMult: 1.45, nodeYieldBonus: 0.25, damageMitigation: 0.20 },
      descTh: 'ปราการป้องกันไร้เทียมทาน เหมาะประจำการจุดยุทธศาสตร์นอกสำนัก (+45% พลังป้องกันจุดยุทธศาสตร์, +25% ผลผลิต)'
    }
  });

  const BLOODLINE_TRAITS = Object.freeze({
    ALPHA_FANG: { id: 'ALPHA_FANG', nameTh: 'เขี้ยวจ่าฝูงวายุ', atkPct: 0.06, critAdd: 4 },
    IRON_CARAPACE: { id: 'IRON_CARAPACE', nameTh: 'กระดองเหล็กไหล', defPct: 0.08, hpPct: 0.06 },
    VENOM_GLAND: { id: 'VENOM_GLAND', nameTh: 'ต่อมพิษเจ็ดราตรี', matkPct: 0.06, penAdd: 6 },
    AUSPICIOUS_SPIRIT: { id: 'AUSPICIOUS_SPIRIT', nameTh: 'จิตวิญญาณมงคล', mdefPct: 0.07, btBonus: 0.04 },
    SOVEREIGN_AWAKENED: { id: 'SOVEREIGN_AWAKENED', nameTh: 'สายเลือดเทพอสูรบรรพกาล', atkPct: 0.14, matkPct: 0.14, defPct: 0.12, hpPct: 0.12, critAdd: 6, penAdd: 10, btBonus: 0.06 },
    AZURE_DRAGON: FOUR_SYMBOL_BLOODLINES.AZURE_DRAGON,
    WHITE_TIGER: FOUR_SYMBOL_BLOODLINES.WHITE_TIGER,
    VERMILION_PHOENIX: FOUR_SYMBOL_BLOODLINES.VERMILION_PHOENIX,
    BLACK_TORTOISE: FOUR_SYMBOL_BLOODLINES.BLACK_TORTOISE
  });

  CULT.FOUR_SYMBOL_BLOODLINES = FOUR_SYMBOL_BLOODLINES;
  CULT.PET_ROLES = PET_ROLES;
  CULT.PET_ROLE_ALIASES = PET_ROLE_ALIASES;
  CULT.BLOODLINE_TRAITS = BLOODLINE_TRAITS;

  CULT.normalizePetRole = raw => {
    if (!raw) return 'FEROCIOUS_ASSAULT';
    const u = String(raw).trim().toUpperCase();
    const mapped = PET_ROLE_ALIASES[u] || u;
    return PET_ROLES[mapped] ? mapped : 'FEROCIOUS_ASSAULT';
  };

  const mythicSpecies = Object.fromEntries((JD.CORE.sovereignCompanions || []).map(spec => [spec.id, spec]));
  const lineageSpecies = Object.fromEntries((JD.CORE.lineageCompanions || []).map(spec => [spec.id, spec]));
  const growthTitles = ['ไข่', 'วัยเยาว์', 'วัยฝึกพลัง', 'เติบโตเต็มวัย', 'จุติเต็มสี่ทิศ'];
  const milestones = [
    { days:20, bond:65, realm:4, tier:4, level:4 },
    { days:65, bond:78, realm:5, tier:6, level:7 },
    { days:140, bond:90, realm:6, tier:7, level:9 }
  ];
  CULT.sovereignCompanionSpec = id => mythicSpecies[id] || null;
  CULT.sovereignCompanionStageTh = stage => growthTitles[stage] || growthTitles[1];
  CULT.isSovereignCompanion = pet => !!(pet && mythicSpecies[pet.speciesId]);
  CULT.lineageCompanionSpec = id => Object.hasOwn(lineageSpecies, id) ? lineageSpecies[id] : null;
  CULT.curatedCompanionSpec = id => CULT.sovereignCompanionSpec(id) || CULT.lineageCompanionSpec(id);
  const regionalSpecies = new Map((JD.CORE.regionalCompanions || []).map(sp => {
    const source = JD.BEASTS.species.find(beast => beast.id === sp.sourceId);
    return [sp.id, { ...sp, element:source?.element }];
  }));
  CULT.regionalCompanionSpec = id => regionalSpecies.get(id) || null;
  CULT.isCuratedCompanion = pet => !!(pet && CULT.curatedCompanionSpec(pet.speciesId));
  CULT.recoverLineageCompanion = (W, spec, party) =>
    CULT.lineageCompanionSpec(spec?.id) ? recoverCuratedCompanion(W, spec, party) : false;
  CULT.recoverSovereignCompanion = (W, spec, party) =>
    CULT.sovereignCompanionSpec(spec?.id) ? recoverCuratedCompanion(W, spec, party) : false;
  function recoverCuratedCompanion(W, spec, party) {
    if (!W?.sect) return false;
    const nursery = W.sect.sovereignNursery || (W.sect.sovereignNursery = {});
    if (nursery[spec.id]) return false;
    nursery[spec.id] = {
      speciesId:spec.id, status:spec.eggDays ? 'egg' : 'juvenile',
      caredDays:0, discoveredDay:W.day, lastProcessedDay:W.day,
      witnesses:party.filter(n => n && !n.dead).map(n => n.id)
    };
    return true;
  }

  const chooseKeeper = (W, record) => {
    const paths = new Set(['BEAST_SOVEREIGN', 'PRIMORDIAL_SHIFTER', 'SPIRIT_HUSBANDRY', 'WILDERNESS_RANGER']);
    let best = null, bestScore = -Infinity;
    for (const n of W.npcs) {
      if (!n || n.dead || n.exiled || n.away || !n.cult || CULT.equivalentStage(n) < 3) continue;
      const pets = n.pets || [];
      if (pets.filter(p => p && !p.dead).length >= CULT.maxActivePets(n) + CULT.maxReservePets(n)) continue;
      const affinity = (n.h?.skills?.BEAST_TAMING || 0) + HC.eff(n, 'personality.empathy') * .35;
      const score = affinity + (paths.has(n.cult.path) ? 22 : 0) + (record.witnesses.includes(n.id) ? 16 : 0)
        - pets.filter(CULT.isCuratedCompanion).length * 30 - pets.length * 8;
      if (score > bestScore) { bestScore = score; best = n; }
    }
    return best;
  };

  const chooseLineageLoadout = n => {
    if (n.act?.id === 'fight' || !(n.pets || []).some(p => p && CULT.lineageCompanionSpec(p.speciesId))) return;
    const pets = n.pets.filter(p => p && !p.injured && !p.dead && p.hunger >= 38 && p.fatigue < 75);
    const hp = n.h?.state?.hp / Math.max(1, CULT.hpMax(n));
    const temperament = HC.eff(n, 'personality.caution');
    const exploration = HC.eff(n, 'interests.exploring');
    const study = HC.eff(n, 'intellect.comprehension');
    const rank = p => {
      const spec = CULT.lineageCompanionSpec(p.speciesId);
      const wants = spec ? { KUNPENG:exploration, FOX:100-temperament, QILIN:hp < .70 ? 98 : temperament, BAIZE:study }[spec.familyId] : 48;
      return (p.tier || 1) * 15 + (p.growthStage || 1) * 5 + (p.bond || 50) * .22 + wants * .3 -
        (p.fatigue || 0) * .4 + (p.active ? 9 : 0);
    };
    const ready = pets.map(p => [p, rank(p)]).sort((a, b) => b[1] - a[1]);
    const next = new Set(ready.slice(0, CULT.maxActivePets(n)).map(entry => entry[0]));
    let changed = false;
    for (const p of n.pets) {
      if (!p || next.has(p) === !!p.active) continue;
      p.active = next.has(p);
      changed = true;
    }
    if (changed && g.STATS) g.STATS.dirty(n);
  };

  CULT.tickSovereignNursery = W => {
    const nursery = W?.sect?.sovereignNursery;
    if (!nursery) return;
    for (const record of Object.values(nursery)) {
      if (record.status === 'bonded' || record.lastProcessedDay >= W.day) continue;
      record.lastProcessedDay = W.day;
      const spec = CULT.curatedCompanionSpec(record.speciesId);
      if (!spec) continue;
      const keeper = chooseKeeper(W, record);
      if (record.status === 'egg' && record.caredDays < spec.eggDays) {
        if (!keeper || g.ECO.count(W, 'grain') <= W.npcs.filter(n => n && !n.dead).length ||
            !g.ECO.take(W, 'grain', 1)) continue;
        record.caredDays++;
        if (record.caredDays < spec.eggDays) continue;
        record.status = 'juvenile';
        W.log('craft', '🥚 「' + spec.eggTh + '」ฟักออกมาเป็นลูก' + spec.nameTh + 'แล้ว', [keeper.id]);
      }
      if (!keeper) continue;
      const result = CULT.bindPet(W, keeper, spec, {
        tier:3, level:1, bond:60, hunger:90, role:spec.role,
        bloodlineTrait:spec.symbol === 'BLACK_TORTOISE' ? 'IRON_CARAPACE' : 'AUSPICIOUS_SPIRIT',
        provenance:'sovereign_sanctum'
      });
      if (!result.ok) continue;
      const pet = result.pet;
      pet.sovereignCompanion = !!spec.symbol;
      if (spec.grade) pet.grade = spec.grade;
      pet.careDays = 0;
      pet.lastGrowthDay = W.day;
      pet.growthStage = 1;
      record.status = 'bonded';
      record.uid = pet.uid;
      W.log('craft', '✦ ' + HC.fullName(keeper) + ' รับดูแล「' + pet.nameTh + '」' + (spec.directionTh ? 'แห่งทิศ' + spec.directionTh : 'จากตระกูล' + spec.familyTh), [keeper.id]);
    }

    for (const n of W.npcs) {
      if (!n || n.dead || n.away || n.exiled || !n.cult || !Array.isArray(n.pets)) continue;
      for (const pet of n.pets) {
        const spec = pet && CULT.curatedCompanionSpec(pet.speciesId);
        if (!spec || pet.dead || pet.lastGrowthDay >= W.day || pet.growthStage >= 4) continue;
        pet.lastGrowthDay = W.day;
        if (pet.injured || pet.hunger < 55 || pet.fatigue > 75) continue;
        pet.careDays = (pet.careDays || 0) + 1;
        const next = milestones[(pet.growthStage || 1) - 1];
        const ageFactor = [1, .65, .82, 1][spec.gradeRank || 0];
        const realm = Math.max(3, next.realm - (spec.gradeRank === 1 ? 1 : 0));
        if (pet.careDays < Math.ceil(next.days * ageFactor) || pet.bond < next.bond || CULT.equivalentStage(n) < realm) continue;
        pet.growthStage++;
        pet.tier = next.tier;
        pet.level = next.level;
        if (pet.growthStage === 4 && spec.symbol) {
          pet.fourSymbol = spec.symbol;
          pet.sovereignAwakened = true;
        }
        CULT.ensurePets(n);
        pet.hp = pet.hpMax;
        HC.bump(n);
        if (g.STATS) g.STATS.dirty(n);
        W.log('cultivation', '✦ 「' + pet.nameTh + '」ของ ' + HC.fullName(n) + ' เข้าสู่ระยะ' +
          (spec.gradeRank && pet.growthStage === 4 ? 'ร่างสมบูรณ์' : CULT.sovereignCompanionStageTh(pet.growthStage)), [n.id]);
      }
      chooseLineageLoadout(n);
    }
  };

  CULT.allBeastSpecies = () => {
    if (!CULT._speciesCache) {
      const list = (JD.BEASTS && Array.isArray(JD.BEASTS.species) ? JD.BEASTS.species : []).concat((JD.BEASTS && Array.isArray(JD.BEASTS.kings)) ? JD.BEASTS.kings : []);
      const seen = new Set();
      CULT._speciesCache = list.filter(s => {
        if (!s || !s.id || seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
      CULT._speciesById = Object.fromEntries(CULT._speciesCache.map(s => [s.id, s]));
    }
    return CULT._speciesCache;
  };

  CULT.beastSpeciesById = id => {
    if (!CULT._speciesById) CULT.allBeastSpecies();
    return CULT.curatedCompanionSpec(id) || CULT.regionalCompanionSpec(id) || (CULT._speciesById && CULT._speciesById[id]) || null;
  };

  CULT.inferSpeciesFamily = sp => {
    if (!sp) return 'CANINE';
    if (sp.family && typeof sp.family === 'string') return sp.family;
    const id = String(sp.id || '').toUpperCase();
    const nm = String(sp.nameTh || '');
    if (/WOLF|CANINE|HOUND|FOX|หมาป่า|สุนัข|จิ้งจอก/.test(id + nm)) return 'CANINE';
    if (/TIGER|FELINE|LION|LEOPARD|พยัคฆ์|เสือ|แมว/.test(id + nm)) return 'FELINE';
    if (/BOAR|BEAR|URSINE|หมูป่า|หมี/.test(id + nm)) return 'URSINE_BOAR';
    if (/TORTOISE|TURTLE|SHELL|CRAB|เต่า|ปู|กระดอง/.test(id + nm)) return 'SHELL_GUARDIAN';
    if (/PYTHON|SERPENT|SNAKE|VIPER|งู|เหลือม|อสรพิษ/.test(id + nm)) return 'SERPENT';
    if (/SCORPION|ARTHROPOD|BEETLE|SPIDER|INSECT|CENTIPEDE|แมง|แมลง|ด้วง|ตะขาบ|กู่/.test(id + nm)) return 'ARTHROPOD_SWARM';
    if (/ROC|HAWK|AVIAN|CRANE|EAGLE|FALCON|เหยี่ยว|อินทรี|กระเรียน|วิหค|นก/.test(id + nm)) return 'AVIAN';
    if (/STAG|KIRIN|QILIN|UNGULATE|PLANT|TREANT|กวาง|กิเลน|พฤกษา|ภูต/.test(id + nm)) return 'AUSPICIOUS_FAIRY';
    if (/DRAGON|DRAKE|LEVIATHAN|TAOTIE|MYTHIC|มังกร|เทพอสูร/.test(id + nm)) return 'DRAGON_MYTHIC';
    return 'CANINE';
  };

  CULT.defaultRoleForSpecies = sp => {
    const fam = CULT.inferSpeciesFamily(sp);
    if (fam === 'SHELL_GUARDIAN' || fam === 'URSINE_BOAR') return 'IRON_GUARDIAN';
    if (fam === 'ARTHROPOD_SWARM' || fam === 'SERPENT') return 'VENOM_SWARM';
    if (fam === 'AUSPICIOUS_FAIRY') return 'MYSTIC_SUPPORT';
    if (fam === 'AVIAN') return 'MOUNT_CHARGER';
    return 'FEROCIOUS_ASSAULT';
  };

  CULT.defaultTraitForSpecies = sp => {
    const fam = CULT.inferSpeciesFamily(sp);
    if ((sp && sp.tier >= 6) || fam === 'DRAGON_MYTHIC') return 'SOVEREIGN_AWAKENED';
    if (fam === 'SHELL_GUARDIAN' || fam === 'URSINE_BOAR') return 'IRON_CARAPACE';
    if (fam === 'ARTHROPOD_SWARM' || fam === 'SERPENT') return 'VENOM_GLAND';
    if (fam === 'AUSPICIOUS_FAIRY') return 'AUSPICIOUS_SPIRIT';
    return 'ALPHA_FANG';
  };

  // Canonical Active Pet Capacity Rule (Section 4.3 & Section 22.4):
  // - Standard paths (and mortals with taming): 1 active pet
  // - BEAST_SOVEREIGN: Stage 1-2 -> 1; Stage 3-5 -> 2; Stage 6-8 -> 3
  // - MYRIAD_BEAST_PACK subpath: +1 extra pack slot (Stage 1-2 -> 2; Stage 3-5 -> 3; Stage 6-8 -> 4, hard-capped at 4)
  CULT.maxActivePets = npc => {
    if (!npc) return 1;
    const c = npc.cult;
    if (!c || c.path !== 'BEAST_SOVEREIGN') return 1;
    const effSt = Math.max(c.stage || 1, CULT.effectiveTechStage ? CULT.effectiveTechStage(npc) : 1);
    let cap = effSt >= 6 ? 3 : effSt >= 3 ? 2 : 1;
    if (c.sub === 'MYRIAD_BEAST_PACK') cap = Math.min(4, cap + 1);
    return cap;
  };

  CULT.maxReservePets = npc => {
    if (!npc) return 3;
    return (npc.cult && npc.cult.path === 'BEAST_SOVEREIGN') ? 6 : 3;
  };

  CULT.ensurePets = npc => {
    if (!npc || npc.foe) return [];
    if (!Array.isArray(npc.pets)) npc.pets = [];
    const maxAct = CULT.maxActivePets(npc);
    let actCount = 0;
    for (let i = 0; i < npc.pets.length; i++) {
      const p = npc.pets[i];
      if (!p) continue;
      p.role = CULT.normalizePetRole(p.role);
      p.tier = clamp(Math.floor(p.tier || 1), 1, 7);
      p.level = clamp(Math.floor(p.level || 1), 1, 9);
      p.bond = clamp(Number.isFinite(p.bond) ? p.bond : (Number.isFinite(p.loyalty) ? p.loyalty : 65), 0, 100);
      p.hunger = clamp(Number.isFinite(p.hunger) ? p.hunger : (Number.isFinite(p.satisfaction) ? p.satisfaction : 85), 0, 100);
      p.fatigue = clamp(Number.isFinite(p.fatigue) ? p.fatigue : 10, 0, 100);
      p.loyalty = p.bond;
      p.satisfaction = Number.isFinite(p.satisfaction) ? clamp(p.satisfaction, 0, 100) : p.hunger;
      p.bondXp = Number.isFinite(p.bondXp) ? p.bondXp : (p.exp || 0);
      p.exp = p.bondXp;
      p.hpMax = Math.max(60, Math.round(80 * Math.pow(1.45, (p.tier || 1) - 1) * (1 + ((p.level || 1) - 1) * 0.1)));
      if (!Number.isFinite(p.hp) || p.hp > p.hpMax) p.hp = p.hpMax;
      if (p.fourSymbol && FOUR_SYMBOL_BLOODLINES[p.fourSymbol]) {
        p.bloodlineTrait = p.fourSymbol;
        p.trait = p.fourSymbol;
        p.sovereignAwakened = true;
        p.growthStage = 4;
      } else if (p.bloodlineTrait && FOUR_SYMBOL_BLOODLINES[p.bloodlineTrait]) {
        p.fourSymbol = p.bloodlineTrait;
        p.trait = p.bloodlineTrait;
        p.sovereignAwakened = true;
        p.growthStage = 4;
      } else if (p.sovereignAwakened || p.bloodlineTrait === 'SOVEREIGN_AWAKENED') {
        p.bloodlineTrait = 'SOVEREIGN_AWAKENED';
        p.trait = 'SOVEREIGN_AWAKENED';
        p.sovereignAwakened = true;
        p.growthStage = 4;
      } else if (!CULT.isCuratedCompanion(p)) {
        p.growthStage = Math.min(3, Math.max(1, Math.ceil((p.level || 1) / 3)));
      }
      if (p.injured && p.active) p.active = false;
      if (p.active) {
        if (actCount < maxAct) actCount++;
        else p.active = false;
      }
    }
    return npc.pets;
  };
  CULT.reconcileActivePetCap = CULT.ensurePets;

  CULT.activePets = npc => {
    if (!npc || npc.foe || !Array.isArray(npc.pets) || !npc.pets.length) return [];
    const maxAct = CULT.maxActivePets(npc);
    const out = [];
    for (let i = 0; i < npc.pets.length && out.length < maxAct; i++) {
      const p = npc.pets[i];
      if (p && p.active && !p.dead && !p.injured && (p.fatigue || 0) < 95) out.push(p);
    }
    return out;
  };

  CULT.createPetRecord = (W, npc, speciesOrId, opts) => {
    opts = opts || {};
    const sp = typeof speciesOrId === 'string' ? CULT.beastSpeciesById(speciesOrId) : speciesOrId;
    const fallbackSp = sp || CULT.beastSpeciesById('BEAST_MIST_WOLF') || (CULT.allBeastSpecies()[0]);
    if (!fallbackSp) return null;
    if (W) {
      W.sect = W.sect || {};
      W.sect.petSeq = (W.sect.petSeq || 0) + 1;
    }
    const seq = (W && W.sect && W.sect.petSeq) ? W.sect.petSeq : ((W && W.rng && typeof W.rng.int === 'function') ? W.rng.int(1000, 9999) : 1001);
    const tier = clamp(opts.tier != null ? opts.tier : (fallbackSp.tier || 1), 1, 7);
    const isSovAwakened = !!(opts.sovereignAwakened || opts.bloodlineTrait === 'SOVEREIGN_AWAKENED');
    const growthSt = clamp(opts.growthStage != null ? opts.growthStage : (isSovAwakened ? 4 : 1), 1, 4);
    const level = clamp(opts.level != null ? opts.level : (isSovAwakened ? 9 : Math.max(1, (growthSt - 1) * 3 + 1)), 1, 9);
    const role = CULT.normalizePetRole(opts.role || fallbackSp.role || CULT.defaultRoleForSpecies(fallbackSp));
    const trait = isSovAwakened ? 'SOVEREIGN_AWAKENED' : (opts.bloodlineTrait || opts.trait || CULT.regionalCompanionSpec(fallbackSp.id)?.trait || CULT.defaultTraitForSpecies(fallbackSp));
    const el = opts.element || fallbackSp.element || 'WIND';
    const bondVal = clamp(opts.bond != null ? opts.bond : (opts.loyalty != null ? opts.loyalty : 70), 0, 100);
    const hungerVal = clamp(opts.hunger != null ? opts.hunger : (opts.satisfaction != null ? opts.satisfaction : 90), 0, 100);
    const xpVal = Math.max(0, Math.round(opts.bondXp != null ? opts.bondXp : (opts.exp || 0)));
    const hpMax = Math.max(60, Math.round(80 * Math.pow(1.45, tier - 1) * (1 + (level - 1) * 0.1)));
    return {
      uid: opts.uid || ('PET_' + (npc ? npc.id : 'SECT') + '_' + seq),
      ownerId: npc ? npc.id : null,
      speciesId: fallbackSp.id,
      nameTh: opts.nameTh || fallbackSp.nameTh,
      family: CULT.inferSpeciesFamily(fallbackSp),
      tier,
      level,
      growthStage: isSovAwakened ? 4 : Math.min(3, Math.max(1, Math.ceil(level / 3))),
      exp: xpVal,
      bondXp: xpVal,
      bond: bondVal,
      loyalty: bondVal,
      hunger: hungerVal,
      satisfaction: hungerVal,
      fatigue: clamp(opts.fatigue != null ? opts.fatigue : 5, 0, 100),
      hpMax,
      hp: hpMax,
      injured: !!opts.injured,
      role,
      element: el,
      bloodlineTrait: trait,
      trait,
      sovereignAwakened: isSovAwakened,
      task: opts.task || 'COMBAT',
      active: opts.active != null ? !!opts.active : true,
      provenance: opts.provenance || 'wild_tame',
      acquiredDay: (W && W.day) || 0
    };
  };

  // Multi-pet command budget allocation (Section 22.2):
  // Instead of naive linear stacking, active pets share a command allocation weight vector:
  // 1 pet: [1.0], 2 pets: [0.65, 0.55] (sum 1.20), 3 pets: [0.55, 0.45, 0.35] (sum 1.35), 4 pets: [0.50, 0.40, 0.32, 0.28] (sum 1.50)
  const COMMAND_WEIGHTS = Object.freeze({
    1: [1.0],
    2: [0.65, 0.55],
    3: [0.55, 0.45, 0.35],
    4: [0.50, 0.40, 0.32, 0.28]
  });

  CULT.petCommandAllocation = (npc, activePets) => {
    const list = Array.isArray(activePets) ? activePets : (CULT.activePets ? CULT.activePets(npc) : []);
    if (!list.length) return [];
    const n = Math.min(4, list.length);
    const weights = COMMAND_WEIGHTS[n] || COMMAND_WEIGHTS[4];
    return list.slice(0, 4).map((pet, idx) => ({ pet, share: weights[idx] != null ? weights[idx] : 0.25 }));
  };

  CULT.petPowerSingle = (npc, pet) => {
    if (!pet || pet.dead) return 0;
    const sp = CULT.beastSpeciesById(pet.speciesId);
    const baseCp = sp ? (sp.cp || 90) : (85 * Math.pow(1.85, (pet.tier || 1) - 1));
    const tierScale = Math.pow(1.38, Math.max(0, (pet.tier || 1) - (sp ? sp.tier : 1)));
    const lvScale = 1 + ((pet.level || 1) - 1) * 0.08;
    const bondScale = 0.70 + (clamp(pet.bond || 50, 0, 100) / 100) * 0.50;
    const readiness = ((pet.hunger || 80) < 20 ? 0.65 : 1.0) * ((pet.fatigue || 0) > 80 ? 0.65 : 1.0) * (pet.injured ? 0.35 : 1.0);
    let pathMult = 1.0;
    if (npc && npc.cult && npc.cult.path === 'BEAST_SOVEREIGN') {
      pathMult = 1.28;
      if (npc.cult.sub === 'PRIMORDIAL_BLOOD_MUTATOR') pathMult = 1.48;
      else if (npc.cult.sub === 'SYMBIOTIC_BEAST_WARRIOR') pathMult = 1.36;
    }
    if (pet.fourSymbol && FOUR_SYMBOL_BLOODLINES[pet.fourSymbol]) pathMult *= 1.32;
    else if (pet.bloodlineTrait === 'SOVEREIGN_AWAKENED') pathMult *= 1.18;
    if (pet.mechArmored) pathMult *= 1.12;
    return Math.round(baseCp * tierScale * lvScale * bondScale * readiness * pathMult);
  };

  CULT.petStatBonuses = npc => {
    if (!npc || npc.foe) return null;
    const active = CULT.activePets(npc);
    if (!active.length && (!npc.cult || npc.cult.path !== 'MECH_PUPPET')) return null;
    const p = {}, f = {};
    if (active.length) {
      const weights = COMMAND_WEIGHTS[Math.min(4, active.length)] || COMMAND_WEIGHTS[1];
      const isSov = !!(npc.cult && npc.cult.path === 'BEAST_SOVEREIGN');
      const sovScale = isSov ? (npc.cult.sub === 'PRIMORDIAL_BLOOD_MUTATOR' && active.length === 1 ? 1.55 : 1.30) : 1.0;
      const isFused = !!(npc._beastFusedUntil && g.STATS && g.STATS.now < npc._beastFusedUntil);
      const peakBeastMult = (npc.peakId && g.SECT && g.SECT.PEAKS && g.SECT.PEAKS.getUnitPeakBonuses && (g.SECT.PEAKS.getUnitPeakBonuses(npc).petStatBonus > 0)) ? (1 + g.SECT.PEAKS.getUnitPeakBonuses(npc).petStatBonus) : 1.0;
      const fuseMult = (isFused ? 1.35 : 1.0) * peakBeastMult;
      for (let i = 0; i < active.length; i++) {
        const pet = active[i];
        const w = (weights[i] || 0.25) * sovScale * fuseMult * (0.65 + (pet.bond || 60) / 200);
        const rDef = PET_ROLES[pet.role] || PET_ROLES.FEROCIOUS_ASSAULT;
        const tScale = 0.75 + (pet.tier || 1) * 0.12 + (pet.level || 1) * 0.02;
        if (rDef.atkBonus) p.atk = (p.atk || 0) + rDef.atkBonus * w * tScale;
        if (rDef.matkBonus) p.matk = (p.matk || 0) + rDef.matkBonus * w * tScale;
        if (rDef.defBonus) p.def = (p.def || 0) + rDef.defBonus * w * tScale;
        if (rDef.mdefBonus) p.mdef = (p.mdef || 0) + rDef.mdefBonus * w * tScale;
        if (rDef.hpBonus) p.hp = (p.hp || 0) + rDef.hpBonus * w * tScale;
        if (rDef.moveBonus) f.move = (f.move || 0) + rDef.moveBonus * w;
        if (rDef.penBonus) f.pen = (f.pen || 0) + rDef.penBonus * w;
        const tr = BLOODLINE_TRAITS[pet.bloodlineTrait];
        if (tr) {
          if (tr.atkPct) p.atk = (p.atk || 0) + tr.atkPct * w;
          if (tr.matkPct) p.matk = (p.matk || 0) + tr.matkPct * w;
          if (tr.defPct) p.def = (p.def || 0) + tr.defPct * w;
          if (tr.hpPct) p.hp = (p.hp || 0) + tr.hpPct * w;
          if (tr.mdefPct) p.mdef = (p.mdef || 0) + tr.mdefPct * w;
          if (tr.critAdd) f.crit = (f.crit || 0) + tr.critAdd * w;
          if (tr.penAdd) f.pen = (f.pen || 0) + tr.penAdd * w;
        }
        const lineage = CULT.lineageCompanionSpec(pet.speciesId);
        if (lineage) {
          const factor = w * lineage.impact * (.48 + (pet.growthStage || 1) * .13);
          for (const [stat, amount] of Object.entries(lineage.traits)) {
            const lane = ['move','cast','acc','eva'].includes(stat) ? f : p;
            lane[stat] = (lane[stat] || 0) + amount * factor;
          }
        }
        const regional = CULT.regionalCompanionSpec(pet.speciesId);
        if (regional) {
          const factor = w * (0.65 + .12 * Math.min(3, pet.growthStage || 1));
          for (const [stat, amount] of Object.entries(regional.stats.p || {})) p[stat] = (p[stat] || 0) + amount * factor;
          for (const [stat, amount] of Object.entries(regional.stats.f || {})) f[stat] = (f[stat] || 0) + amount * factor;
        }
        if (pet.mechArmored) {
          p.def = (p.def || 0) + 0.06 * w;
          f.pen = (f.pen || 0) + 4 * w;
        }
      }
    }
    // MECH_PUPPET Construct Loadout Readiness Bonus
    if (npc.cult && npc.cult.path === 'MECH_PUPPET') {
      const ms = CULT.ensureMechState(npc);
      if (ms.integrity > 20 && ms.charge > 10) {
        const eff = (ms.integrity / 100);
        p.def = (p.def || 0) + (ms.mode === 'BASTION' ? 0.14 : 0.07) * eff;
        p.atk = (p.atk || 0) + (ms.mode === 'OVERDRIVE' ? 0.12 : 0.06) * eff;
        p.matk = (p.matk || 0) + (ms.mode === 'OVERDRIVE' ? 0.12 : 0.06) * eff;
      }
    }
    return { p, f, activeCount: active.length };
  };

  CULT.petCombatMultiplier = npc => {
    if (!npc || npc.foe) return 1.0;
    const active = CULT.activePets(npc);
    let mult = 1.0;
    if (active.length) {
      const weights = COMMAND_WEIGHTS[Math.min(4, active.length)] || COMMAND_WEIGHTS[1];
      const isSov = !!(npc.cult && npc.cult.path === 'BEAST_SOVEREIGN');
      for (let i = 0; i < active.length; i++) {
        const pt = active[i];
        const w = weights[i] || 0.25;
        const contrib = (0.06 + (pt.tier || 1) * 0.022 + (pt.level || 1) * 0.004) * (0.7 + (pt.bond || 60) / 200) * w * (isSov ? 1.35 : 1.0);
        mult += contrib;
      }
    }
    if (npc.cult && npc.cult.path === 'MECH_PUPPET' && npc.mechState && npc.mechState.integrity > 25) {
      mult += 0.08 * (npc.mechState.integrity / 100);
    }
    return clamp(mult, 1.0, 1.85);
  };

  CULT.petBreakthroughBonus = npc => {
    if (!npc || !Array.isArray(npc.pets)) return 0;
    const active = CULT.activePets(npc);
    let b = 0;
    for (let i = 0; i < active.length; i++) {
      const pt = active[i];
      if (pt.role === 'MYSTIC_SUPPORT' || pt.bloodlineTrait === 'AUSPICIOUS_SPIRIT' || pt.bloodlineTrait === 'SOVEREIGN_AWAKENED' || (pt.fourSymbol && FOUR_SYMBOL_BLOODLINES[pt.fourSymbol])) {
        b += 0.03 + (pt.tier || 1) * 0.008;
      }
    }
    if (npc.cult && npc.cult.sub === 'CELESTIAL_ASTRAL_FAIRY_TAMER' && active.length) b += 0.06;
    return clamp(b, 0, 0.16);
  };

  // Tame / Bind a beast (from wild encounter or Edit Hub)
  CULT.bindPet = (W, npc, speciesOrBeast, opts) => {
    opts = opts || {};
    if (!npc || npc.dead) return { ok: false, reason: 'ไม่พบตัวละครเป้าหมาย' };
    const pets = CULT.ensurePets(npc);
    const maxAct = CULT.maxActivePets(npc);
    const maxRes = CULT.maxReservePets(npc);
    if (pets.length >= maxAct + maxRes && !opts.force) {
      return { ok: false, reason: 'จำนวนสัตว์อสูรคู่สัญญาเต็มขีดจำกัดแล้ว (' + (maxAct + maxRes) + ' ตน)' };
    }
    const spId = typeof speciesOrBeast === 'string' ? speciesOrBeast : (speciesOrBeast && (speciesOrBeast.speciesId || speciesOrBeast.id));
    const sp = CULT.beastSpeciesById(spId) || (typeof speciesOrBeast === 'object' ? speciesOrBeast : null) || (CULT.allBeastSpecies && CULT.allBeastSpecies()[0]);
    if (!sp) return { ok: false, reason: 'ไม่พบสายพันธุ์สัตว์อสูร: ' + spId };

    if (CULT.curatedCompanionSpec(sp.id) && (opts.provenance !== 'sovereign_sanctum' ||
        W?.sect?.sovereignNursery?.[sp.id]?.status !== 'juvenile' || W.sect.sovereignNursery[sp.id].uid)) {
      return { ok:false, reason:'สายพันธุ์นี้ผูกพันธสัญญาได้จากกรุวิหารเท่านั้น' };
    }

    if (g.WILD?.raidProfile(speciesOrBeast)) return { ok: false, reason: 'อสูรจ้าวหุบเขาผูกพันธสัญญาไม่ได้' };

    // Conservation check: if capturing a live wild beast instance, mark it captured/gone so it cannot also be killed or captured twice
    if (speciesOrBeast && typeof speciesOrBeast === 'object' && speciesOrBeast.wild) {
      if (speciesOrBeast.capturedBy || speciesOrBeast.dead || speciesOrBeast.gone) {
        return { ok: false, reason: 'สัตว์อสูรตนนี้ถูกจับหรือจากไปแล้ว' };
      }
      speciesOrBeast.capturedBy = npc.id;
      speciesOrBeast.gone = true;
      speciesOrBeast.dead = false;
    }

    let curActive = CULT.activePets(npc);
    const newTier = clamp(opts.tier != null ? opts.tier : (sp.tier || 1), 1, 7);
    if (curActive.length >= maxAct && opts.replaceWeakest) {
      const weakest = curActive.slice().sort((a, b) => (a.tier || 1) - (b.tier || 1))[0];
      if (weakest && newTier > (weakest.tier || 1)) {
        weakest.active = false;
        curActive = CULT.activePets(npc);
      }
    }
    const shouldActive = opts.active != null ? (!!opts.active && curActive.length < maxAct) : (curActive.length < maxAct);
    const petRec = CULT.createPetRecord(W, npc, sp, Object.assign({}, opts, { active: shouldActive }));
    pets.push(petRec);
    CULT.ensurePets(npc);
    HC.bump(npc);
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(npc);
    return { ok: true, pet: petRec, activePets: CULT.activePets(npc).length, maxActive: maxAct };
  };

  // Attempt taming a wild beast with real skill/tier gate and feed item support
  CULT.attemptTameBeast = (W, npc, beastOrSpecies, opts) => {
    opts = opts || {};
    if (!npc || npc.dead) return { ok: false, reason: 'ตัวละครไม่พร้อมฝึกอสูร' };
    if (g.WILD?.raidProfile(beastOrSpecies)) return { ok: false, reason: 'อสูรจ้าวหุบเขาผูกพันธสัญญาไม่ได้' };
    if (opts.forceSuccess) opts.force = true;
    const spId = typeof beastOrSpecies === 'string' ? beastOrSpecies : (beastOrSpecies && (beastOrSpecies.speciesId || beastOrSpecies.id));
    const sp = CULT.beastSpeciesById(spId) || (typeof beastOrSpecies === 'object' ? beastOrSpecies : null) || (CULT.allBeastSpecies && CULT.allBeastSpecies()[0]);
    if (!sp) return { ok: false, reason: 'ไม่พบข้อมูลสัตว์อสูร' };
    const isSov = !!(npc.cult && npc.cult.path === 'BEAST_SOVEREIGN');
    const effSt = npc.cult ? (CULT.effectiveTechStage ? CULT.effectiveTechStage(npc) : npc.cult.stage) : 1;
    const tamingSk = (g.MARTIAL && g.MARTIAL.skillRead) ? g.MARTIAL.skillRead(npc, 'BEAST_TAMING') : ((npc.h && npc.h.skills && npc.h.skills.BEAST_TAMING) || 0);
    const maxTamableTier = Math.min(7, effSt + (isSov ? 2 : (tamingSk >= 45 ? 1 : 0)));
    if ((sp.tier || 1) > maxTamableTier && !opts.force) {
      return { ok: false, reason: 'ตบะหรือทักษะฝึกอสูรยังไม่ถึงเกณฑ์สำหรับอสูรระดับ T' + sp.tier };
    }
    const peakTameBonus = (npc.peakId && g.SECT && g.SECT.PEAKS && g.SECT.PEAKS.getUnitPeakBonuses) ? (g.SECT.PEAKS.getUnitPeakBonuses(npc).tameBonus || 0) : 0;
    let chance = 0.38 + (tamingSk / 160) + (effSt - (sp.tier || 1)) * 0.12 + (isSov ? 0.25 : 0) + peakTameBonus;
    // Check for spirit feed item in personal or sect stock
    if (npc.inv && npc.inv.pills && npc.inv.pills['P:REC140_BST_SPIRIT_FEED_1'] > 0) {
      npc.inv.pills['P:REC140_BST_SPIRIT_FEED_1']--;
      if (npc.inv.pills['P:REC140_BST_SPIRIT_FEED_1'] <= 0) delete npc.inv.pills['P:REC140_BST_SPIRIT_FEED_1'];
      chance += 0.22;
    } else if (W && W.sect && W.sect.stock && W.sect.stock['MAT_BP_BEAST_MEAT_1'] > 0 && opts.useSectBait) {
      g.ECO.take(W, 'MAT_BP_BEAST_MEAT_1', 1);
      chance += 0.12;
    }
    chance = clamp(chance, 0.08, 0.96);
    const rollOk = opts.force || (W && W.rng ? W.rng.next() < chance : 0.45 < chance);
    if (g.MARTIAL && g.MARTIAL.skillPractice) g.MARTIAL.skillPractice(npc, 'BEAST_TAMING', 0.5, 1.2);
    if (!rollOk) {
      npc.h.state.energy = Math.max(5, (npc.h.state.energy || 50) - 8);
      return { ok: false, failedRoll: true, chance, reason: 'สัตว์อสูรดิ้นหลุดพันธสัญญา (โอกาส ' + Math.round(chance * 100) + '%)' };
    }
    const res = CULT.bindPet(W, npc, beastOrSpecies, { provenance: 'wild_tame', force: !!opts.force });
    if (!res || !res.ok) return res || { ok: false, reason: 'ผูกพันธสัญญาไม่สำเร็จ' };
    if (beastOrSpecies && typeof beastOrSpecies === 'object') {
      beastOrSpecies.captured = true;
      beastOrSpecies.capturedBy = npc.id;
      beastOrSpecies.gone = true;
      if (W && W.wildlife) {
        W.wildlife.captures = (W.wildlife.captures || 0) + 1;
        if (Array.isArray(W.wildlife.beasts)) {
          const bIdx = W.wildlife.beasts.indexOf(beastOrSpecies);
          if (bIdx >= 0) W.wildlife.beasts.splice(bIdx, 1);
        }
      }
    }
    if (W && W.log && !opts.quiet) {
      W.log('explore', '🐾 ' + npc.h.name.given + ' ทำพันธสัญญาสยบ「' + res.pet.nameTh + '」(T' + res.pet.tier + ') เป็นอสูรคู่สัญญาสำเร็จ!', [npc.id]);
    }
    return res;
  };

  // Feed / Care for a pet using real inventory/sect provisions
  CULT.feedPet = (W, npc, petUid, opts) => {
    opts = opts || {};
    if (!npc || !Array.isArray(npc.pets)) return { ok: false, reason: 'ไม่มีสัตว์อสูรคู่สัญญา' };
    const pet = petUid ? npc.pets.find(p => p && p.uid === petUid) : npc.pets[0];
    if (!pet) return { ok: false, reason: 'ไม่พบสัตว์อสูรเป้าหมาย' };
    let fedSource = 'free';
    if (!opts.free && W && W.sect) {
      if (npc.inv && npc.inv.mats && npc.inv.mats['MAT_BP_BEAST_MEAT_1'] > 0) {
        npc.inv.mats['MAT_BP_BEAST_MEAT_1']--;
        if (npc.inv.mats['MAT_BP_BEAST_MEAT_1'] <= 0) delete npc.inv.mats['MAT_BP_BEAST_MEAT_1'];
        fedSource = 'personal_meat';
      } else if (g.ECO && g.ECO.count(W, 'MAT_BP_BEAST_MEAT_1') > 0) {
        g.ECO.take(W, 'MAT_BP_BEAST_MEAT_1', 1);
        fedSource = 'sect_meat';
      } else if (g.ECO && g.ECO.count(W, 'meal') > 0) {
        g.ECO.take(W, 'meal', 1);
        fedSource = 'sect_meal';
      } else if (g.ECO && g.ECO.count(W, 'grain') > 0) {
        g.ECO.take(W, 'grain', 1);
        fedSource = 'sect_grain';
      } else {
        return { ok: false, reason: 'ขาดแคลนเนื้อปราณหรือเสบียงสำหรับเลี้ยงอสูร' };
      }
    }
    pet.hunger = clamp((pet.hunger || 50) + 45, 0, 100);
    pet.satisfaction = pet.hunger;
    pet.fatigue = Math.max(0, (pet.fatigue || 0) - 25);
    pet.bond = clamp((pet.bond || 50) + 4, 0, 100);
    pet.loyalty = pet.bond;
    pet.bondXp = (pet.bondXp || pet.exp || 0) + 15;
    pet.exp = pet.bondXp;
    if (pet.hpMax) pet.hp = pet.hpMax;
    if (pet.injured && (opts.healInjury || fedSource === 'personal_meat' || opts.free)) pet.injured = false;
    CULT.ensurePets(npc);
    HC.bump(npc);
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return { ok: true, pet, fedSource };
  };

  // Evolve / Awaken Pet Bloodline
  CULT.evolvePet = (W, npc, petUid, opts) => {
    opts = opts || {};
    if (!npc || !Array.isArray(npc.pets)) return { ok: false, reason: 'ไม่มีสัตว์อสูรคู่สัญญา' };
    const pet = petUid ? npc.pets.find(p => p && p.uid === petUid) : npc.pets[0];
    if (!pet) return { ok: false, reason: 'ไม่พบสัตว์อสูรเป้าหมาย' };
    if (CULT.isCuratedCompanion(pet)) return { ok:false, reason:'สัตว์คู่หูสายพิเศษเติบโตจากการดูแลและสายสัมพันธ์ตามวัย' };
    if (!opts.free) {
      const stoneCost = (pet.tier || 1) * 80;
      if ((npc.inv && npc.inv.stones || 0) >= stoneCost) {
        npc.inv.stones -= stoneCost;
      } else if (W && W.sect && (W.sect.stones || 0) >= stoneCost) {
        g.ECO.pay(W, stoneCost, 'วิวัฒน์สายเลือดอสูร ' + pet.nameTh);
      } else {
        return { ok: false, reason: 'ศิลาวิญญาณไม่เพียงพอสำหรับการวิวัฒน์สายเลือด (' + stoneCost + ' ก้อน)' };
      }
    }
    if (opts.awakenSovereign) {
      pet.tier = 7;
      pet.level = 9;
      pet.growthStage = 4;
      pet.bond = 100;
      pet.loyalty = 100;
      pet.hunger = 100;
      pet.satisfaction = 100;
      pet.fatigue = 0;
      pet.injured = false;
      pet.bloodlineTrait = 'SOVEREIGN_AWAKENED';
      pet.trait = 'SOVEREIGN_AWAKENED';
      pet.sovereignAwakened = true;
    } else {
      if (pet.level < 9) {
        pet.level = Math.min(9, (pet.level || 1) + (opts.levels || 2));
      } else if (pet.tier < 7) {
        pet.tier = Math.min(7, (pet.tier || 1) + 1);
        pet.level = 1;
      }
      if (pet.tier >= 6) {
        pet.bloodlineTrait = 'SOVEREIGN_AWAKENED';
        pet.trait = 'SOVEREIGN_AWAKENED';
        pet.sovereignAwakened = true;
      }
      pet.bond = clamp((pet.bond || 60) + 8, 0, 100);
      pet.loyalty = pet.bond;
    }
    CULT.ensurePets(npc);
    HC.bump(npc);
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(npc);
    return { ok: true, pet };
  };

  
  /* ---------- Spirit Beast Breeding & Bloodline Awakening (v2.0.9) ---------- */
  CULT.ensureMenagerie = W => {
    if (!W || !W.sect) return [];
    if (!Array.isArray(W.sect.beasts)) W.sect.beasts = [];
    if (!Array.isArray(W.sect.breedingRecords)) W.sect.breedingRecords = [];
    return W.sect.beasts;
  };

  CULT.breedBeasts = (W, parentA, parentB, opts) => {
    opts = opts || {};
    if (!W) return { ok: false, reason: "ไม่พบข้อมูลโลก" };
    if (!parentA || !parentB) return { ok: false, reason: "ต้องระบุสัตว์อสูรพ่อพันธุ์และแม่พันธุ์" };
    if (parentA.uid && parentB.uid && parentA.uid === parentB.uid) {
      return { ok: false, reason: "ไม่สามารถผสมพันธุ์กับตัวเองได้" };
    }
    CULT.ensureMenagerie(W);
    const facs = (g.SECT && g.SECT.ensureSpecialistFacilities) ? g.SECT.ensureSpecialistFacilities(W) : null;
    const menagerieLv = (facs && facs.beast_menagerie) ? facs.beast_menagerie.level : 1;

    const satA = parentA.satisfaction != null ? parentA.satisfaction : (parentA.hunger || 80);
    const satB = parentB.satisfaction != null ? parentB.satisfaction : (parentB.hunger || 80);
    if (satA < 35 || satB < 35) {
      return { ok: false, reason: "สัตว์อสูรหิวโหยหรือความพึงพอใจต่ำเกินไป (ต้องการอย่างน้อย 35)" };
    }
    const fatigueA = parentA.fatigue || 0;
    const fatigueB = parentB.fatigue || 0;
    if (fatigueA > 75 || fatigueB > 75) {
      return { ok: false, reason: "สัตว์อสูรเหนื่อยล้าเกินไป ควรให้พักผ่อนก่อน" };
    }

    if (CULT.isCuratedCompanion(parentA) || CULT.isCuratedCompanion(parentB)) return { ok:false, reason:'สัตว์คู่หูสายพิเศษไม่เกิดซ้ำจากการเพาะพันธุ์' };
    const breeder = opts.breederId && W.byId && W.byId[opts.breederId] ? W.byId[opts.breederId] : (parentA.ownerId && W.byId[parentA.ownerId] ? W.byId[parentA.ownerId] : null);
    const tamingSk = (breeder && g.MARTIAL && g.MARTIAL.skillRead) ? g.MARTIAL.skillRead(breeder, "BEAST_TAMING") : (breeder && breeder.h && breeder.h.skills ? (breeder.h.skills.BEAST_TAMING || 0) : 30);

    const rng = (W.rng && typeof W.rng.next === "function") ? W.rng : Math;
    const roll = () => (rng.next ? rng.next() : rng());

    const spA = CULT.beastSpeciesById(parentA.speciesId || parentA.id) || parentA;
    const spB = CULT.beastSpeciesById(parentB.speciesId || parentB.id) || parentB;
    const pickSpecies = roll() < 0.5 ? spA : spB;

    const baseTier = Math.max(parentA.tier || 1, parentB.tier || 1);
    let childTier = baseTier;
    const awakenChance = clamp(0.12 + (menagerieLv - 1) * 0.12 + (tamingSk / 220), 0.10, 0.70);
    const awakened = (opts.forceAwaken || (roll() < awakenChance)) && childTier < 7;
    if (awakened) childTier++;

    const traitA = parentA.bloodlineTrait || parentA.trait;
    const traitB = parentB.bloodlineTrait || parentB.trait;
    let childTrait = roll() < 0.5 ? traitA : traitB;
    if (awakened || roll() < 0.22) {
      const rareTraits = ["SOVEREIGN_AWAKENED", "PRIMORDIAL_BLOOD", "CHIMERA_MUTATION", "AUSPICIOUS_SPIRIT"];
      childTrait = rareTraits[Math.floor(roll() * rareTraits.length)];
    }

    const childRole = roll() < 0.5 ? (parentA.role || "FEROCIOUS_ASSAULT") : (parentB.role || "FEROCIOUS_ASSAULT");
    const childOpts = {
      tier: childTier,
      role: childRole,
      bloodlineTrait: childTrait,
      trait: childTrait,
      sovereignAwakened: childTrait === "SOVEREIGN_AWAKENED" || parentA.sovereignAwakened || parentB.sovereignAwakened,
      bond: 75,
      satisfaction: 90,
      hunger: 90,
      fatigue: 0,
      provenance: "sect_breeding",
      parentAId: parentA.uid || parentA.id,
      parentBId: parentB.uid || parentB.id
    };
    const child = CULT.createPetRecord(W, breeder, pickSpecies, childOpts);
    child.nameTh = (awakened ? "ลูกอสูรศักดิ์สิทธิ์" : "ลูกอสูร") + (pickSpecies.nameTh || "วิญญาณ");

    parentA.fatigue = clamp((parentA.fatigue || 0) + 20, 0, 100);
    parentB.fatigue = clamp((parentB.fatigue || 0) + 20, 0, 100);

    if (opts.bindToBreeder && breeder && CULT.activePets(breeder).length < CULT.maxActivePets(breeder)) {
      child.ownerId = breeder.id;
      child.active = true;
      breeder.pets = breeder.pets || [];
      breeder.pets.push(child);
      HC.bump(breeder);
    } else {
      child.ownerId = null;
      child.active = false;
      W.sect.beasts.push(child);
    }

    const record = {
      day: W.day || 0,
      parentANameTh: parentA.nameTh,
      parentBNameTh: parentB.nameTh,
      childUid: child.uid,
      childNameTh: child.nameTh,
      childTier,
      childTrait,
      awakened,
      breederNameTh: breeder ? breeder.h.name.given : "ศิษย์สำนัก"
    };
    W.sect.breedingRecords.unshift(record);
    if (W.sect.breedingRecords.length > 30) W.sect.breedingRecords.length = 30;

    if (W.log) {
      W.log("explore", "🐾 ผสมพันธุ์สัตว์อสูรสำเร็จ! ได้กำเนิด「" + child.nameTh + "」(T" + childTier + " · " + childTrait + ")" + (awakened ? " ★ ปลุกสายเลือดชั้นสูง!" : ""), breeder ? [breeder.id] : []);
    }
    return { ok: true, child, awakened, record };
  };

  CULT.awakenBloodline = (W, npc, petUid, opts) => {
    opts = opts || {};
    if (!npc || !Array.isArray(npc.pets)) return { ok: false, reason: "ไม่มีสัตว์อสูรคู่สัญญา" };
    const pet = petUid ? npc.pets.find(p => p && p.uid === petUid) : npc.pets[0];
    if (!pet) return { ok: false, reason: "ไม่พบสัตว์อสูรเป้าหมาย" };
    if (pet.tier >= 7 && pet.sovereignAwakened) {
      return { ok: false, reason: "สัตว์อสูรตนนี้ปลุกสายเลือดขั้นสูงสุดสมบูรณ์แล้ว" };
    }
    if (pet.tier < 7) pet.tier++;
    pet.growthStage = 4;
    pet.sovereignAwakened = true;
    pet.bloodlineTrait = "SOVEREIGN_AWAKENED";
    pet.trait = "SOVEREIGN_AWAKENED";
    pet.bond = clamp((pet.bond || 70) + 20, 0, 100);
    pet.bondXp = (pet.bondXp || 0) + 600;
    if (CULT.evolvePet) CULT.evolvePet(W, npc, pet.uid, { free: true, awakenSovereign: true });
    HC.bump(npc);
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    if (W && W.log) {
      W.log("breakthrough", "🌟 อสูรคู่สัญญา「" + pet.nameTh + "」ของ " + npc.h.name.given + " ปลุกสายเลือดเทพอสูรบรรพกาลสำเร็จ! (T" + pet.tier + ")", [npc.id]);
    }
    return { ok: true, pet };
  };

  /* ---------- Pillar 3 (v2.0.18): Mythological Beast Evolution & Four-Symbol Bloodline Awakening ---------- */
  CULT.resolveFourSymbolForBeast = (pet, catalystId) => {
    if (!pet) return null;
    if (pet.fourSymbol && FOUR_SYMBOL_BLOODLINES[pet.fourSymbol]) return FOUR_SYMBOL_BLOODLINES[pet.fourSymbol];
    if ((pet.speciesId || pet.id) === 'BEAST_ABYSSAL_LEVIATHAN_TURTLE') return FOUR_SYMBOL_BLOODLINES.BLACK_TORTOISE;
    const sp = CULT.beastSpeciesById(pet.speciesId || pet.id);
    const fam = String(pet.family || (sp && sp.family) || CULT.inferSpeciesFamily(sp || pet)).toUpperCase();
    const idNm = String((pet.speciesId || '') + ' ' + (pet.nameTh || '') + ' ' + (sp ? sp.nameTh : '')).toUpperCase();
    if (catalystId) {
      for (const sym of Object.values(FOUR_SYMBOL_BLOODLINES)) {
        if (sym.catalysts.includes(catalystId) && sym.families.includes(fam)) return sym;
      }
    }
    if (fam === 'AQUATIC' || fam === 'SERPENT' || fam === 'DRAGON_MYTHIC' || /มังกร|นาคา|วารี|บาดาล|เหลือม|อสรพิษ|มัจฉา|เต่ามังกร/.test(idNm)) {
      if (!/เต่า|กระดอง/.test(idNm) || /มังกร/.test(idNm)) return FOUR_SYMBOL_BLOODLINES.AZURE_DRAGON;
    }
    if (fam === 'FELINE' || fam === 'CANINE' || /พยัคฆ์|เสือ|หมาป่า|ราชสีห์|จิ้งจอก/.test(idNm)) {
      return FOUR_SYMBOL_BLOODLINES.WHITE_TIGER;
    }
    if (fam === 'AVIAN' || /วิหค|หงส์|อินทรี|เหยี่ยว|กระเรียน/.test(idNm) || (/นก/.test(idNm) && !/กิเลน/.test(idNm))) {
      return FOUR_SYMBOL_BLOODLINES.VERMILION_PHOENIX;
    }
    if (fam === 'SHELL_GUARDIAN' || fam === 'SHELL' || fam === 'URSINE_BOAR' || fam === 'URSINE' || fam === 'BOAR' || /เต่า|กระดอง|เสวียนอู่|หมี|หมูป่า|ปู/.test(idNm)) {
      return FOUR_SYMBOL_BLOODLINES.BLACK_TORTOISE;
    }
    if (catalystId) {
      for (const sym of Object.values(FOUR_SYMBOL_BLOODLINES)) {
        if (sym.catalysts.includes(catalystId)) return sym;
      }
    }
    if (fam === 'AUSPICIOUS_FAIRY') return FOUR_SYMBOL_BLOODLINES.VERMILION_PHOENIX;
    return FOUR_SYMBOL_BLOODLINES.BLACK_TORTOISE;
  };

  CULT.canAwakenFourSymbol = (W, npc, petOrUid, catalystId, opts) => {
    opts = opts || {};
    if (!W) return { ok: false, reason: 'no-world', reasonTh: 'ไม่พบข้อมูลโลก' };
    let pet = (petOrUid && typeof petOrUid === 'object') ? petOrUid : null;
    if (!pet && typeof petOrUid === 'string') {
      if (npc && Array.isArray(npc.pets)) pet = npc.pets.find(p => p && (p.uid === petOrUid || p.id === petOrUid));
      if (!pet && W.sect && Array.isArray(W.sect.beasts)) pet = W.sect.beasts.find(p => p && (p.uid === petOrUid || p.id === petOrUid));
      if (!pet && Array.isArray(W.npcs)) {
        for (const m of W.npcs) {
          if (m && Array.isArray(m.pets)) {
            const found = m.pets.find(p => p && (p.uid === petOrUid || p.id === petOrUid));
            if (found) { pet = found; npc = npc || m; break; }
          }
        }
      }
    }
    if (!pet && npc && Array.isArray(npc.pets) && npc.pets.length) pet = npc.pets[0];
    if (!pet) return { ok: false, reason: 'pet-not-found', reasonTh: 'ไม่พบสัตว์อสูรเป้าหมาย' };
    if (CULT.isCuratedCompanion(pet)) return { ok:false, reason:'requires-natural-growth', reasonTh:'สัตว์คู่หูสายพิเศษต้องเติบโตตามวัย' };
    if (pet.fourSymbol && FOUR_SYMBOL_BLOODLINES[pet.fourSymbol] && !opts.allowReawaken) {
      return { ok: false, reason: 'already-awakened-four-symbol', reasonTh: 'สัตว์อสูรตนนี้ปลุกสายเลือดสัตว์เทพจตุรทิศแล้ว (' + FOUR_SYMBOL_BLOODLINES[pet.fourSymbol].nameTh + ')' };
    }
    const sym = (opts.symbolId && FOUR_SYMBOL_BLOODLINES[opts.symbolId]) || CULT.resolveFourSymbolForBeast(pet, catalystId);
    if (!sym) return { ok: false, reason: 'no-matching-symbol', reasonTh: 'ไม่พบสายเลือดจตุรทิศที่สอดคล้อง' };

    const isMature = (pet.growthStage || 1) >= 3 || (pet.level || 1) >= 7 || (pet.tier || 1) >= 5 || pet.sovereignAwakened;
    if (!opts.force && !isMature) {
      return { ok: false, reason: 'not-peak-maturity', reasonTh: 'สัตว์อสูรต้องโตเต็มวัยขั้นสูง (ระดับ T5+ หรือ Lv.7+ หรือขั้นเติบโต 3+)' };
    }
    const affinity = Math.max(pet.bond || 0, pet.loyalty || 0);
    if (!opts.force && affinity < 75) {
      return { ok: false, reason: 'insufficient-affinity', reasonTh: 'ความผูกพัน/ความภักดีต้องไม่ต่ำกว่า 75% (ปัจจุบัน ' + Math.round(affinity) + '%)' };
    }
    let chosenCat = catalystId || null;
    if (!chosenCat) {
      chosenCat = sym.catalysts.find(cId => g.ECO && g.ECO.catalystCount && g.ECO.catalystCount(W, cId) > 0) || sym.catalysts[0];
    }
    if (!sym.catalysts.includes(chosenCat) && !opts.force) {
      return { ok: false, reason: 'incompatible-catalyst', reasonTh: 'แก่นธาตุปฐมภูมิไม่ตรงกับสายเลือด ' + sym.nameTh + ' (ต้องการ ' + sym.catalysts.join(' หรือ ') + ')' };
    }
    const haveCat = (g.ECO && g.ECO.catalystCount) ? g.ECO.catalystCount(W, chosenCat) : ((W.sect && W.sect.catalysts && W.sect.catalysts[chosenCat]) || 0);
    if (!opts.free && !opts.force && haveCat <= 0) {
      const catName = (g.ECO && g.ECO.REFINEMENT_CATALYSTS && g.ECO.REFINEMENT_CATALYSTS[chosenCat]) ? g.ECO.REFINEMENT_CATALYSTS[chosenCat].nameTh : chosenCat;
      return { ok: false, reason: 'missing-catalyst', catalystId: chosenCat, reasonTh: 'ขาดแคลน「' + catName + '」ในคลังสำนัก' };
    }
    return { ok: true, pet, npc, symbol: sym, catalystId: chosenCat };
  };

  CULT.awakenFourSymbolBloodline = (W, npc, petOrUid, catalystId, opts) => {
    opts = opts || {};
    const check = CULT.canAwakenFourSymbol(W, npc, petOrUid, catalystId, opts);
    if (!check.ok) return check;
    const { pet, symbol: sym, catalystId: usedCat } = check;
    const owner = check.npc || npc;

    if (!opts.free) {
      const cats = (g.ECO && g.ECO.ensureCatalysts) ? g.ECO.ensureCatalysts(W) : (W.sect.catalysts = W.sect.catalysts || {});
      if ((cats[usedCat] || 0) > 0) {
        cats[usedCat]--;
        if (cats[usedCat] <= 0) delete cats[usedCat];
      } else if (!opts.force) {
        return { ok: false, reason: 'missing-catalyst', reasonTh: 'แก่นธาตุปฐมภูมิไม่เพียงพอ' };
      }
    }

    const oldName = pet.nameTh || 'อสูรวิญญาณ';
    pet.fourSymbol = sym.id;
    pet.mythicSymbol = sym.id;
    pet.bloodlineTrait = sym.id;
    pet.trait = sym.id;
    pet.sovereignAwakened = true;
    pet.tier = 7;
    pet.level = 9;
    pet.growthStage = 4;
    pet.element = sym.element;
    pet.bond = 100;
    pet.loyalty = 100;
    pet.hunger = 100;
    pet.satisfaction = 100;
    pet.fatigue = 0;
    pet.injured = false;
    pet.bondXp = Math.max(pet.bondXp || 0, 1000);
    pet.exp = pet.bondXp;
    pet.CatalystUsed = usedCat;
    pet.awakenedDay = W.day || 0;
    if (!pet.nameTh || !pet.nameTh.includes(sym.nameTh)) {
      pet.origNameTh = pet.origNameTh || oldName;
      pet.nameTh = sym.nameTh + '·' + oldName.replace(/^(ลูกอสูรศักดิ์สิทธิ์|ลูกอสูร)/, '');
    }
    pet.hpMax = Math.max(220, Math.round(95 * Math.pow(1.48, 6) * 1.95));
    pet.hp = pet.hpMax;
    pet.perks = Object.assign({}, sym.perks);

    if (owner) {
      CULT.ensurePets(owner);
      HC.bump(owner);
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(owner);
      if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(owner);
    }
    if (W.sect) {
      W.sect.fourSymbolHistory = Array.isArray(W.sect.fourSymbolHistory) ? W.sect.fourSymbolHistory : [];
      W.sect.fourSymbolHistory.unshift({
        day: W.day || 0,
        petUid: pet.uid,
        petNameTh: pet.nameTh,
        symbolId: sym.id,
        symbolNameTh: sym.nameTh,
        catalystId: usedCat,
        ownerId: owner ? owner.id : null,
        ownerNameTh: owner ? HC.fullName(owner) : 'คอกสำนัก'
      });
      if (W.sect.fourSymbolHistory.length > 25) W.sect.fourSymbolHistory.length = 25;
    }
    // If Vermilion Phoenix awakens, automatically dispel fog of war across exterior regions
    if (sym.id === 'VERMILION_PHOENIX' && g.EXPED && g.EXPED.syncMythicBeastPerks) {
      g.EXPED.syncMythicBeastPerks(W);
    }
    if (W.log && !opts.quiet) {
      const catName = (g.ECO && g.ECO.REFINEMENT_CATALYSTS && g.ECO.REFINEMENT_CATALYSTS[usedCat]) ? g.ECO.REFINEMENT_CATALYSTS[usedCat].nameTh : usedCat;
      W.log('breakthrough', sym.icon + ' ปาฏิหาริย์บรรพกาล!「' + oldName + '」ดูดซับ「' + catName + '」วิวัฒนาการสายเลือดสู่สัตว์เทพจตุรทิศ「' + sym.titleTh + '」สำเร็จ!', owner ? [owner.id] : []);
    }
    return { ok: true, pet, symbol: sym, catalystId: usedCat };
  };
  CULT.evolveMythicBeast = CULT.awakenFourSymbolBloodline;

  CULT.sectFourSymbolSummary = W => {
    const counts = { AZURE_DRAGON: 0, WHITE_TIGER: 0, VERMILION_PHOENIX: 0, BLACK_TORTOISE: 0 };
    const activeBeasts = [];
    if (!W) return { counts, activeBeasts, hasAzureDragon: false, hasWhiteTiger: false, hasVermilionPhoenix: false, hasBlackTortoise: false };
    const scan = (b, ownerId) => {
      if (!b || b.dead) return;
      const symId = b.fourSymbol || (FOUR_SYMBOL_BLOODLINES[b.bloodlineTrait] ? b.bloodlineTrait : null);
      if (symId && counts[symId] !== undefined) {
        counts[symId]++;
        activeBeasts.push({ uid: b.uid || b.id, nameTh: b.nameTh, symbolId: symId, ownerId: ownerId || b.ownerId || null, garrisonNodeId: b.garrisonNodeId || null });
      }
    };
    if (W.sect && Array.isArray(W.sect.beasts)) W.sect.beasts.forEach(b => scan(b, null));
    if (W.sect && Array.isArray(W.sect.reservePets)) W.sect.reservePets.forEach(b => scan(b, null));
    if (Array.isArray(W.npcs)) {
      for (let i = 0; i < W.npcs.length; i++) {
        const n = W.npcs[i];
        if (!n || n.dead || !Array.isArray(n.pets)) continue;
        for (let j = 0; j < n.pets.length; j++) scan(n.pets[j], n.id);
      }
    }
    return {
      counts,
      activeBeasts,
      hasAzureDragon: counts.AZURE_DRAGON > 0,
      hasWhiteTiger: counts.WHITE_TIGER > 0,
      hasVermilionPhoenix: counts.VERMILION_PHOENIX > 0,
      hasBlackTortoise: counts.BLACK_TORTOISE > 0,
      cultivationAuraBonus: counts.AZURE_DRAGON > 0 ? 0.15 : 0,
      siegeBreachBonus: counts.WHITE_TIGER > 0 ? 0.45 : 0,
      expeditionSpeedMult: counts.VERMILION_PHOENIX > 0 ? 0.60 : 1.0,
      garrisonDefenseBonus: counts.BLACK_TORTOISE > 0 ? 0.45 : 0
    };
  };

  CULT.menagerieTick = W => {
    if (!W || !W.sect) return;
    const facs = W.sect.specialistFacilities;
    const menagerieLv = (facs && facs.beast_menagerie) ? facs.beast_menagerie.level : 1;
    const hasGrain = (g.ECO && g.ECO.count) ? g.ECO.count(W, "grain") > 20 : false;
    if (Array.isArray(W.sect.beasts)) {
      W.sect.beasts.forEach(b => {
        if (!b) return;
        b.fatigue = Math.max(0, (b.fatigue || 0) - (2 + menagerieLv));
        if (hasGrain) {
          b.hunger = Math.min(100, (b.hunger || 80) + 1);
          b.satisfaction = Math.min(100, (b.satisfaction || 80) + 1);
        }
      });
    }
  };

  /* ---------- MECH_PUPPET Construct State Authority ---------- */
  CULT.ensureMechState = npc => {
    if (!npc) return null;
    if (!npc.mechState) {
      npc.mechState = {
        chassis: (npc.cult && npc.cult.sub) || 'HEAVENLY_GOLEM',
        integrity: 100,
        constructReadiness: 100,
        charge: 100,
        overclockReady: true,
        heat: 0,
        mode: 'BALANCED',
        vesselDecoyReady: true,
        decoyAvailable: true,
        puppetTier: (npc.cult && npc.cult.stage) || 1,
        recoverDebt: 0
      };
    }
    const ms = npc.mechState;
    if (ms.integrity == null && ms.constructReadiness != null) ms.integrity = ms.constructReadiness;
    if (ms.constructReadiness == null) ms.constructReadiness = ms.integrity != null ? ms.integrity : 100;
    ms.integrity = clamp(Math.round(ms.integrity), 0, 100);
    ms.constructReadiness = ms.integrity;
    if (ms.decoyAvailable !== undefined) ms.vesselDecoyReady = !!ms.decoyAvailable;
    else ms.decoyAvailable = !!ms.vesselDecoyReady;
    if (ms.overclockReady === undefined) ms.overclockReady = (ms.charge || 0) >= 50;
    if (!ms.puppetTier) ms.puppetTier = (npc.cult && npc.cult.stage) || 1;
    return ms;
  };

  CULT.repairConstruct = (W, npc, opts) => {
    opts = opts || {};
    if (!npc || !npc.cult || npc.cult.path !== 'MECH_PUPPET') return { ok: false, reason: 'ไม่ใช่วิถีกลจักรเชิดหุ่น' };
    const ms = CULT.ensureMechState(npc);
    if (!opts.free && W && W.sect) {
      const oreId = 'MAT_ORE_BLACK_IRON_1';
      if (npc.inv && npc.inv.mats && npc.inv.mats[oreId] > 0) {
        npc.inv.mats[oreId]--;
      } else if (g.ECO && g.ECO.count(W, oreId) > 0) {
        g.ECO.take(W, oreId, 1);
      } else if ((npc.inv && npc.inv.stones || 0) >= 15) {
        npc.inv.stones -= 15;
      } else if ((W.sect.stones || 0) >= 15) {
        g.ECO.pay(W, 15, 'ซ่อมบำรุงหุ่นกลของ ' + npc.h.name.given);
      } else {
        return { ok: false, reason: 'ขาดแคลนแร่เหล็กหรือศิลาสำหรับซ่อมบำรุงหุ่นกล' };
      }
    }
    ms.integrity = 100;
    ms.constructReadiness = 100;
    ms.charge = 100;
    ms.overclockReady = true;
    ms.heat = 0;
    ms.recoverDebt = 0;
    ms.decoyAvailable = true;
    ms.vesselDecoyReady = true;
    HC.bump(npc);
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return { ok: true, mechState: ms };
  };

  /* ---------- KARMA_SAMSARA Causal Ledger & Six-Realm Wheel Authority ---------- */
  const SIX_REALM_STANCES = Object.freeze({
    DEVA: { id: 'DEVA', nameTh: 'ภพเทวา (กระจ่างคุ้มภัย)', mdefPct: 0.12, defPct: 0.08, atkPct: -0.04 },
    ASURA: { id: 'ASURA', nameTh: 'ภพอสูร (พิโรธสังหาร)', atkPct: 0.14, matkPct: 0.10, defPct: -0.06 },
    HUMAN: { id: 'HUMAN', nameTh: 'ภพมนุษย์ (สมดุลสายกลาง)', atkPct: 0.06, matkPct: 0.06, defPct: 0.06, mdefPct: 0.06 },
    ANIMAL: { id: 'ANIMAL', nameTh: 'ภพเดรัจฉาน (สัญชาตญาณว่องไว)', moveAdd: 14, evaPct: 0.10, accPct: -0.04 },
    PRETA: { id: 'PRETA', nameTh: 'ภพเปรต (สูบกลืนปราณ)', drainAdd: 0.15, matkPct: 0.08, defPct: -0.05 },
    NARAKA: { id: 'NARAKA', nameTh: 'ภพนรก (ทัณฑ์วิบาก)', penAdd: 16, critDmgAdd: 20, hpDrain: 0.02 }
  });
  CULT.SIX_REALM_STANCES = SIX_REALM_STANCES;

  CULT.ensureKarmaState = npc => {
    if (!npc) return null;
    if (!npc.karmaState) {
      npc.karmaState = {
        stance: 'HUMAN',
        activeRealmStance: 'HUMAN',
        debtPool: 0,
        karmicDebt: 0,
        meritStacks: 1,
        echoReady: true,
        maxDebt: Math.max(50, Math.round((CULT.hpMaxLegacy ? CULT.hpMaxLegacy(npc) : (HC.derived(npc).hpMax * CULT.hpMult(npc))) * 0.45)),
        lastHarmSourceId: null,
        lastHarmAt: 0,
        vowTargetId: null,
        echoMoveId: null
      };
    }
    const ks = npc.karmaState;
    ks.maxDebt = Math.max(50, Math.round((CULT.hpMaxLegacy ? CULT.hpMaxLegacy(npc) : (HC.derived(npc).hpMax * CULT.hpMult(npc))) * 0.45));
    if (ks.debtPool == null && ks.karmicDebt != null) ks.debtPool = ks.karmicDebt;
    ks.debtPool = clamp(Math.round(ks.debtPool || 0), 0, ks.maxDebt);
    ks.karmicDebt = ks.debtPool;
    if (!ks.stance && ks.activeRealmStance) ks.stance = ks.activeRealmStance;
    if (ks.stance === 'BEAST') ks.stance = 'ANIMAL';
    ks.activeRealmStance = ks.stance || 'HUMAN';
    if (ks.echoReady === undefined) ks.echoReady = true;
    return ks;
  };


  /* ---------- Universal Self & Ally Healing + Timed Buff Authority (v2.0.8) ---------- */
  CULT.castHealOrBuff = (W, caster, target, opts) => {
    opts = opts || {};
    if (!caster || caster.dead) return { ok: false, reason: 'ผู้ร่ายไม่อยู่ในสภาพพร้อมใช้ปราณ' };
    const tgt = target || caster;
    if (!tgt || tgt.dead) return { ok: false, reason: 'เป้าหมายไม่อยู่ในสภาพรับปราณ' };
    const tNow = (opts.now != null) ? opts.now : (W && Number.isFinite(W.t) ? W.t : (g.STATS && Number.isFinite(g.STATS.now) ? g.STATS.now : 0));
    if (g.STATS) g.STATS.now = tNow;

    // Pick best heal/support/buff skill from caster's unlocked moves or default SAGE_SUPPORT technique
    let chosenSkill = opts.skill ? (typeof opts.skill === 'string' ? CULT.tech(opts.skill) : opts.skill) : null;
    if (!chosenSkill && g.SK && g.SK.list) {
      const moves = g.SK.list(caster).filter(m => ['heal', 'support', 'buff', 'shield', 'guard'].includes(m.arch) || m.grantBuff || m.heal > 0);
      if (moves.length) {
        const hurtRatio = (tgt.h && tgt.h.state ? tgt.h.state.hp : 100) / Math.max(1, CULT.hpMax(tgt));
        moves.sort((a, b) => {
          const scoreA = (hurtRatio < 0.75 ? (a.heal || 0) * 5 : 0) + (a.grantBuff ? 2 : 0) + (a.shield || 0) * 2 + (a.tier || 1) * 0.2;
          const scoreB = (hurtRatio < 0.75 ? (b.heal || 0) * 5 : 0) + (b.grantBuff ? 2 : 0) + (b.shield || 0) * 2 + (b.tier || 1) * 0.2;
          return scoreB - scoreA;
        });
        chosenSkill = moves[0];
      }
    }

    const c = caster.cult;
    const effSt = c ? (CULT.effectiveTechStage ? CULT.effectiveTechStage(caster) : c.stage) : 1;
    const isSage = !!(c && c.path === 'SAGE_SUPPORT');
    const medSk = (g.MARTIAL && g.MARTIAL.skillRead) ? g.MARTIAL.skillRead(caster, 'MEDICINE') : ((caster.h && caster.h.skills && caster.h.skills.MEDICINE) || 0);
    const hpavLv = (W && W.sect && W.sect.specialistFacilities && W.sect.specialistFacilities.harmonic_pavilion) ? W.sect.specialistFacilities.harmonic_pavilion.level : 1;
    const facBonus = 1 + Math.max(0, hpavLv - 1) * 0.15;
    const scale = (1 + effSt * 0.08 + medSk * 0.004) * (isSage ? 1.25 : 1.0) * facBonus;

    // Qi cost check (unless free)
    const qiMaxCaster = CULT.qiMax(caster);
    const qiCost = (opts.free || opts.force) ? 0 : Math.min(Math.round(qiMaxCaster * 0.12), Math.max(4, Math.round(8 + effSt * 3)));
    if (!opts.free && caster.h && caster.h.state && caster.h.state.qi != null && caster.h.state.qi < qiCost) {
      return { ok: false, reason: 'ปราณไม่เพียงพอสำหรับเดินปราณรักษา/หนุนพลัง' };
    }
    if (caster.h && caster.h.state && caster.h.state.qi != null) {
      caster.h.state.qi = Math.max(0, caster.h.state.qi - qiCost);
    }

    const baseHealPct = opts.healPct != null ? opts.healPct : ((chosenSkill && chosenSkill.heal) ? chosenSkill.heal : (isSage ? 0.28 : 0.18));
    const hm = CULT.hpMax(tgt);
    const beforeHp = (tgt.h && tgt.h.state) ? tgt.h.state.hp : hm;
    if ((beforeHp / Math.max(1, hm)) < 0.25 && g.COMBAT && g.COMBAT.ACTION_MASTERY_TRAITS) {
      g.COMBAT.ACTION_MASTERY_TRAITS.recordAction(W, caster, 'clutchHealCount', 1);
    }
    const medicBonus = (g.COMBAT && g.COMBAT.ACTION_MASTERY_TRAITS && g.COMBAT.ACTION_MASTERY_TRAITS.hasTrait(caster, 'TRAIT_COMBAT_MEDIC')) ? 1.20 : 1.0;
    const healAmt = Math.max(1, Math.round(hm * baseHealPct * scale * medicBonus));
    if (tgt.h && tgt.h.state) {
      tgt.h.state.hp = Math.min(hm, beforeHp + healAmt);
      const qmTgt = CULT.qiMax(tgt);
      if (qmTgt > 0) {
        tgt.h.state.qi = Math.min(qmTgt, (tgt.h.state.qi == null ? qmTgt : tgt.h.state.qi) + Math.round(qmTgt * 0.18));
      }
      tgt.h.state.stress = Math.max(0, (tgt.h.state.stress || 0) - (isSage ? 10 : 5));
      if (isSage || medSk >= 25 || opts.cleanse) {
        tgt.h.state.heartDemon = Math.max(0, (tgt.h.state.heartDemon || 0) - 6);
        if (tgt.cult && tgt.cult.toxic > 0) tgt.cult.toxic = Math.max(0, tgt.cult.toxic - 10);
        if (g.STATS && g.STATS.clearStatus && Array.isArray(tgt.sx) && tgt.sx.length) {
          g.STATS.clearStatus(tgt, x => x && ['poison', 'bleed', 'burn', 'slow', 'weaken', 'blind', 'armorbreak', 'mdefbreak', 'silence', 'stun', 'exposed'].includes(x.k));
        }
      }
    }

    // Heal 1 injury severity if caster is SAGE_SUPPORT or has MEDICINE >= 35 or opts.cureInjury
    let curedInjury = false;
    if (Array.isArray(tgt.inj) && tgt.inj.length > 0 && (isSage || medSk >= 35 || opts.cureInjury)) {
      tgt.inj[0].sev = (tgt.inj[0].sev || 1) - 1;
      if (tgt.inj[0].sev <= 0) tgt.inj.shift();
      curedInjury = true;
    }

    // Determine which buff to grant
    let buffId = opts.buffId || opts.buffKey || (chosenSkill && chosenSkill.grantBuff) || null;
    if (!buffId) {
      const sub = c ? c.sub : '';
      if (sub === 'GOLDEN_NEEDLE_SAINT') buffId = 'meridianUnblock';
      else if (sub === 'CELESTIAL_ZITHER_ENVOY' || sub === 'SOUND_ZITHER') buffId = 'swiftWind';
      else if (sub === 'DIVINE_NECTAR_APOTHECARY' || sub === 'WOOD_SPIRIT_SYMBIONT' || sub === 'ELIXIR_DAO') buffId = 'vitalRegen';
      else if (sub === 'QIMEN_TALISMAN_PATRON') buffId = 'aegisWard';
      else if (sub === 'SOUL_LANTERN_SHEPHERD') buffId = 'nirvanaGrace';
      else if (sub === 'WAR_BANNER_CHORISTER' || sub === 'WAR_DEITY') buffId = 'fervorMight';
      else if (c && (c.path === 'HEART_SOUL' || sub === 'LOTUS_MERCY_PURIFIER')) buffId = 'clarityLotus';
      else buffId = 'vitalRegen';
    }

    const dur = clamp(Math.round((opts.dur != null ? opts.dur : (opts.duration != null ? opts.duration : (isSage ? 90 : 60))) * (opts.dur != null || opts.duration != null ? 1 : facBonus)), 1, 2880);
    let appliedBuff = null;
    if (g.STATS && g.STATS.applyNamedBuff) {
      appliedBuff = g.STATS.applyNamedBuff(tgt, buffId, dur, tNow, { casterId: caster.id, techId: chosenSkill ? chosenSkill.id : 'SAGE_BLESS' });
    }

    if (g.MARTIAL && g.MARTIAL.skillPractice) {
      g.MARTIAL.skillPractice(caster, 'MEDICINE', 0.25, 1.15);
    }
    if (chosenSkill && g.SK && g.SK.gainMastery) {
      g.SK.gainMastery(W, caster, chosenSkill.tech || chosenSkill.id, 1);
    }
    HC.bump(caster);
    if (tgt !== caster) HC.bump(tgt);
    if (g.STATS && g.STATS.dirty) { g.STATS.dirty(caster); g.STATS.dirty(tgt); }

    const skillNameTh = chosenSkill ? chosenSkill.nameTh : 'ปราณเยียวยาหนุนนำ';
    if (W && W.log && !opts.quiet) {
      const selfCast = caster.id === tgt.id;
      W.log('care', '🪷 ' + caster.h.name.given + ' ใช้วิชา「' + skillNameTh + '」' + (selfCast ? 'ฟื้นฟูตนเอง' : ('เยียวยาและหนุนพลังให้ ' + tgt.h.name.given)) + ' (+' + healAmt + ' HP' + (appliedBuff ? ' · บัฟ「' + appliedBuff.name + '」' + dur + ' นาที' : '') + ')', selfCast ? [caster.id] : [caster.id, tgt.id]);
    }
    return {
      ok: true,
      casterId: caster.id,
      targetId: tgt.id,
      selfCast: caster.id === tgt.id,
      skillId: chosenSkill ? chosenSkill.id : null,
      skillNameTh,
      healAmt,
      hpBefore: beforeHp,
      hpAfter: tgt.h && tgt.h.state ? tgt.h.state.hp : hm,
      curedInjury,
      buff: appliedBuff,
      dur,
      expiresAt: tNow + dur
    };
  };

  /* =========================================================================
   * v2.0.34 — Multi-Phase Pill Resolution & Out-of-Combat Auxiliary Art Engine
   * ========================================================================= */
  CULT.auxiliaryArtBonus = function (npc, domainKey) {
    if (!npc || !npc.cult || !Array.isArray(npc.cult.techs)) return 0;
    let total = 0;
    const sk = g.SK;
    for (const tid of npc.cult.techs) {
      const def = sk && sk.get ? sk.get(tid) : null;
      if (!def) continue;
      const pVal = (def.passive && def.passive.life && typeof def.passive.life[domainKey] === 'number') ? def.passive.life[domainKey] : 0;
      const aVal = (def.auxiliarySpec && def.auxiliarySpec.bonuses && typeof def.auxiliarySpec.bonuses[domainKey] === 'number') ? def.auxiliarySpec.bonuses[domainKey] : 0;
      total += Math.max(pVal, aVal);
    }
    // Also check equipped exploration/training/crafting tools
    const eq = npc.equip || ((npc.eq && typeof npc.eq === 'object') ? npc.eq : ((npc.h && npc.h.eq) || null));
    if (eq && g.ECO && g.ECO.getItem) {
      for (const slot of ['WEAPON', 'ARMOR', 'ACCESSORY', 'RELIC']) {
        const it = eq[slot];
        if (!it || (g.MARTIAL && g.MARTIAL.gearUsable && !g.MARTIAL.gearUsable(npc, it))) continue;
        const def = it ? (g.ECO.getItem(it.id || it.itemId) || it) : null;
        const effects = it.effects || it.fx || (def && def.effects);
        if (!Array.isArray(effects)) continue;
        for (const ef of effects) {
          const eid = ef && ef.effectId;
          const p = (ef && ef.params) || {};
          if (domainKey === 'cultRate' && (eid === 'EFX_V234_TRAINING_CATALYST' || eid === 'EFX_MEDITATION_ACCEL' || eid === 'EFX_MIND_ENLIGHTEN' || eid === 'EFX_CULTIVATION_ACCELERATOR' || eid === 'EFX_QI_PURITY_REFINEMENT' || eid === 'EFX_LEARNING_INSIGHT' || eid === 'EFX_HEART_DEMON_WARD')) {
            total += Number(p.cultSpeedPct || p.cultRatePct || p.bonusPct || 0.08);
          } else if (domainKey === 'ALCHEMY' && (eid === 'EFX_HERB_POLLINATION' || eid === 'EFX_SOIL_PURIFICATION' || eid === 'EFX_ECOLOGY_HERB_NURTURE' || eid === 'EFX_V234_CRAFT_HARMONIZER' || eid === 'EFX_QI_PURITY_REFINEMENT' || eid === 'EFX_MERIDIAN_TOXIN_PURGE')) {
            total += Number(p.alchemyBonusPct || p.yieldBonusPct || 0.10);
          } else if (domainKey === 'FORGING' && (eid === 'EFX_FORGING_STABILIZATION' || eid === 'EFX_V234_CRAFT_HARMONIZER' || eid === 'EFX_HEART_DEMON_WARD')) {
            total += Number(p.forgingBonusPct || p.stabilityPct || 0.10);
          } else if (domainKey === 'EXPLORE' && (eid === 'EFX_V234_REALM_COMPASS' || eid === 'EFX_SKY_LEVITATION_DRIVE' || eid === 'EFX_BEAST_INTIMIDATION' || eid === 'EFX_SUPPLY_EFFICIENCY' || eid === 'EFX_CARGO_PRESERVATION' || eid === 'EFX_SCENT_TRACE_BREAK' || eid === 'EFX_BEAST_BOND_CHANNEL')) {
            total += Number(p.exploreBonusPct || p.speedBonusPct || p.efficiencyPct || 0.10);
          }
        }
      }
    }
    return clamp(total, 0, 1.25);
  };

  CULT.tickMultiPhasePills = function (W, npc, nowTick) {
    if (!npc || !npc.ext || !Array.isArray(npc.ext.multiPhasePills) || !npc.ext.multiPhasePills.length) {
      return { triggered: 0, logs: [] };
    }
    const tNow = nowTick != null ? nowTick : ((W && typeof W.t === 'number') ? W.t : ((W && W.now) || 0));
    const dayNow = (W && typeof W.day === 'number') ? W.day : Math.floor(tNow / 1440);
    const minNow = (W && typeof W.min === 'number') ? W.min : (tNow % 1440);
    const remaining = [];
    const logs = [];
    let triggered = 0;

    for (const mp of npc.ext.multiPhasePills) {
      if (!mp || mp.resolved) continue;
      const dueDay = mp.triggerDay != null ? mp.triggerDay : (mp.startedDay || 0) + (mp.delayDays || 1);
      const dueMin = mp.triggerMin != null ? mp.triggerMin : 0;
      const isDueByTick = mp.triggerTick != null && tNow >= mp.triggerTick;
      const isDueByDay = (mp.triggerTick == null) && ((dayNow > dueDay) || (dayNow === dueDay && minNow >= dueMin));
      if (!isDueByTick && !isDueByDay) {
        remaining.push(mp);
        continue;
      }
      mp.resolved = true;
      triggered++;
      const p2 = mp.phase2 || {};
      const st = npc.h && npc.h.state;
      if (st) {
        if (p2.hpDeltaPct) {
          const hm = CULT.hpMax(npc);
          st.hp = clamp(Math.round((st.hp || hm) + hm * p2.hpDeltaPct), 1, hm);
        }
        if (p2.qiDeltaPct && npc.cult) {
          const qm = CULT.qiMax(npc);
          st.qi = clamp(Math.round((st.qi || 0) + qm * p2.qiDeltaPct), 0, qm);
        }
        if (p2.fatigueDelta) {
          st.fatigue = clamp((st.fatigue || 0) + p2.fatigueDelta, 0, 100);
          st.rest = clamp((st.rest == null ? 80 : st.rest) - p2.fatigueDelta, 0, 100);
          st.energy = clamp((st.energy == null ? 80 : st.energy) - p2.fatigueDelta, 0, 100);
        }
        if (p2.energyDelta) {
          st.rest = clamp((st.rest == null ? 80 : st.rest) + p2.energyDelta, 0, 100);
          st.energy = clamp((st.energy == null ? 80 : st.energy) + p2.energyDelta, 0, 100);
        }
        if (p2.stressDelta) {
          st.stress = clamp((st.stress || 0) + p2.stressDelta, 0, 100);
        }
      }
      if (npc.cult) {
        if (p2.cultExpAdd) {
          CULT.gain(npc, p2.cultExpAdd, W, 'multiphase_pill_p2');
        }
        if (p2.toxicDelta) {
          npc.cult.toxic = clamp((npc.cult.toxic || 0) + p2.toxicDelta, 0, 100);
        }
      }
      if (p2.breakthroughBonus && npc.cult) {
        npc.cult.btBonus = Math.max(npc.cult.btBonus || 0, p2.breakthroughBonus);
      }
      if (p2.grantBuff && g.STATS && g.STATS.applyNamedBuff) {
        g.STATS.applyNamedBuff(npc, p2.grantBuff, p2.buffDur || 60, tNow, { casterId: npc.id, source: mp.itemId || 'MULTI_PHASE_PILL' });
      }
      if (p2.aftermathStatus && g.STATS && g.STATS.addStatus) {
        g.STATS.addStatus(npc, p2.aftermathStatus, p2.aftermathDur || 4, { val: p2.aftermathVal || 0.12, src: mp.itemId || 'MULTI_PHASE_PILL' }, tNow);
      }
      logs.push({ itemId: mp.itemId, nameTh: mp.nameTh, phase2: p2, triggeredAtTick: tNow, triggeredAtDay: dayNow });
      if (W && W.log && npc.h && npc.h.name) {
        W.log('cult', '💊 ฤทธิ์ระยะที่ 2 ของโอสถ「' + (mp.nameTh || mp.itemId) + '」ทำงานในร่างของ ' + npc.h.name.given, [npc.id]);
      }
    }
    npc.ext.multiPhasePills = remaining;
    npc.lastMultiPhaseTriggered = logs.length ? logs[logs.length - 1] : npc.lastMultiPhaseTriggered;
    if (triggered > 0 && g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return { triggered, logs };
  };

  /* =========================================================================
   * Patch v2.0.35 — Section 10.3 Progression (Oaths, Dao Seals, Seasonal,
   * Tribulation Variants), Section 12.1 Eight Extraordinary Meridians &
   * Section 12.5 Spirit Beast Symbiosis (Possession & Core Ingestion)
   * ========================================================================= */
  const MERIDIANS = {};
  MERIDIANS.CATALOG = Object.freeze({
    DU_MAI: { id: 'DU_MAI', nameTh: 'เส้นตูม่าย (ชีพจรปกครอง)', p: { atk: 0.10, matk: 0.10, def: 0.08 }, f: { pen: 6 }, descTh: 'เปิดชีพจรปกครองแนวสันหลัง เพิ่มพลังโจมตี/วิชา +10% และป้องกัน +8%' },
    REN_MAI: { id: 'REN_MAI', nameTh: 'เส้นเหรินม่าย (ชีพจรกำเนิด)', p: { hp: 0.15 }, f: {}, qiMaxBonusPct: 0.15, descTh: 'เปิดชีพจรกำเนิดด้านหน้า เพิ่มพลังชีวิตสูงสุด +15% และความจุปราณ +15%' },
    CHONG_MAI: { id: 'CHONG_MAI', nameTh: 'เส้นชงม่าย (ชีพจรทะลวง)', p: { atk: 0.08 }, f: { cast: 12, move: 8, pen: 6 }, qiRegenBonusPct: 0.12, descTh: 'เปิดชีพจรทะลวงศูนย์กลาง เพิ่มพลังโจมตี +8%, ร่ายวิชา +12 และฟื้นฟูปราณ +12%' },
    DAI_MAI: { id: 'DAI_MAI', nameTh: 'เส้นไต้หม่าย (ชีพจรคาดเอว)', p: { def: 0.12, mdef: 0.12 }, f: {}, descTh: 'เปิดชีพจรคาดเอวคุ้มครองตันเถียน เพิ่มป้องกันและป้องกันวิชา +12%' },
    YIN_QIAO: { id: 'YIN_QIAO', nameTh: 'เส้นอินเชียว (ชีพจรส้นเท้าหยิน)', p: { eva: 0.10 }, f: { move: 10 }, descTh: 'เปิดชีพจรเท้าหยิน เพิ่มหลบหลีก +10% และความเร็วเดินทาง +10' },
    YANG_QIAO: { id: 'YANG_QIAO', nameTh: 'เส้นหยางเชียว (ชีพจรส้นเท้าหยาง)', p: { acc: 0.10 }, f: { crit: 6 }, descTh: 'เปิดชีพจรเท้าหยาง เพิ่มความแม่นยำ +10% และอัตราคริ +6%' },
    YIN_WEI: { id: 'YIN_WEI', nameTh: 'เส้นอินเหวย (ชีพจรเชื่อมหยิน)', p: { mdef: 0.12, hp: 0.06 }, f: {}, heartDemonResist: 0.15, descTh: 'เปิดชีพจรเชื่อมหยิน เพิ่มป้องกันวิชา +12% และต้านทานจิตมาร +15%' },
    YANG_WEI: { id: 'YANG_WEI', nameTh: 'เส้นหยางเหวย (ชีพจรเชื่อมหยาง)', p: { atk: 0.08 }, f: { pen: 10, critDmg: 15 }, descTh: 'เปิดชีพจรเชื่อมหยาง เพิ่มเจาะเกราะ +10% และความแรงคริ +15%' }
  });
  MERIDIANS.ORDER = Object.freeze(['DU_MAI', 'REN_MAI', 'CHONG_MAI', 'DAI_MAI', 'YIN_QIAO', 'YANG_QIAO', 'YIN_WEI', 'YANG_WEI']);

  MERIDIANS.ensure = npc => {
    if (!npc) return null;
    if (!npc.meridians || typeof npc.meridians !== 'object') {
      npc.meridians = { opened: {}, openedCount: 0, fourOpened: false, allEightOpened: false, overdriveUntil: 0, acupointImmunity: false };
    }
    if (!npc.meridians.opened || typeof npc.meridians.opened !== 'object') npc.meridians.opened = {};
    npc.meridians.openedCount = Object.keys(npc.meridians.opened).filter(k => npc.meridians.opened[k]).length;
    npc.meridians.fourOpened = npc.meridians.openedCount >= 4;
    npc.meridians.allEightOpened = npc.meridians.openedCount >= 8;
    npc.meridians.acupointImmunity = npc.meridians.allEightOpened;
    return npc.meridians;
  };

  MERIDIANS.openMeridian = (npc, meridianId, opts) => {
    if (npc && npc.sect && meridianId && typeof meridianId === 'object') {
      const tmpW = npc; npc = meridianId; meridianId = opts; opts = { W: tmpW };
    }
    opts = opts || {};
    if (!npc) return { ok: false, reason: 'no-npc' };
    const m = MERIDIANS.ensure(npc);
    const id = MERIDIANS.CATALOG[meridianId] ? meridianId : MERIDIANS.ORDER.find(k => !m.opened[k]) || 'DU_MAI';
    if (m.opened[id] && meridianId && MERIDIANS.CATALOG[meridianId] && !opts.allowReopen) {
      return { ok: true, alreadyOpened: true, meridianId: id, spec: MERIDIANS.CATALOG[id], openedCount: m.openedCount, fourOpened: m.fourOpened, allEightOpened: m.allEightOpened };
    }
    if (opts.consumeResource && npc.inv && npc.inv.pills) {
      const pillKey = Object.keys(npc.inv.pills).find(k => npc.inv.pills[k] > 0 && (k.includes('MERIDIAN') || k.includes('QI')));
      if (pillKey) {
        npc.inv.pills[pillKey] -= 1;
        if (npc.inv.pills[pillKey] <= 0) delete npc.inv.pills[pillKey];
      }
    }
    m.opened[id] = true;
    m.openedCount = Object.keys(m.opened).filter(k => m.opened[k]).length;
    m.fourOpened = m.openedCount >= 4;
    m.allEightOpened = m.openedCount >= 8;
    m.acupointImmunity = m.allEightOpened;
    npc._qiMaxCache = null;
    npc._cultRateBase = null;
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    const _worldRef = opts.W || g.W || (g.G && g.G.W);
    if (!opts.quiet && _worldRef && typeof _worldRef.log === 'function' && (m.openedCount === 4 || m.openedCount === 8)) {
      const mSpec = MERIDIANS.CATALOG[id];
      const nm = (npc.h && npc.h.name && npc.h.name.given) || npc.id;
      const tail = m.allEightOpened ? ' — ชีพจรพิสดารทั้งแปดเชื่อมประสานไร้รอยต่อ บรรลุภาวะต้านทานการสกัดจุดโดยสมบูรณ์!' : ' — เปิดครบ 4 เส้น ปลดล็อกเคล็ดป้องกันการสกัดจุด!';
      _worldRef.log('breakthrough', '🪡 ' + nm + ' ทะลวงเปิด「' + (mSpec ? mSpec.nameTh : id) + '」สำเร็จ (' + m.openedCount + '/8 เส้น)' + tail, [npc.id]);
    }
    return {
      ok: true,
      meridianId: id,
      spec: MERIDIANS.CATALOG[id],
      openedCount: m.openedCount,
      fourOpened: m.fourOpened,
      allEightOpened: m.allEightOpened,
      acupointPassiveUnlocked: m.fourOpened
    };
  };

  MERIDIANS.openNextMeridian = (npc, opts) => MERIDIANS.openMeridian(npc, null, opts);

  MERIDIANS.triggerOverdrive = (W, npc, dur) => {
    if (W && !npc && (W.h || W.cult || W.meridians)) {
      npc = W;
      W = g.W || (g.G && g.G.W) || null;
    } else if (W && typeof npc === 'number' && dur === undefined && (W.h || W.cult || W.meridians)) {
      dur = npc;
      npc = W;
      W = g.W || (g.G && g.G.W) || null;
    }
    if (!npc) return { ok: false, reason: 'no-npc' };
    const m = MERIDIANS.ensure(npc);
    const tNow = (W && W.t != null) ? W.t : ((g.STATS && g.STATS.now) || 0);
    const cleanDur = clamp(Number(dur) || 36, 6, 120);
    m.overdriveUntil = tNow + cleanDur;
    m.overdriveUsedInFight = true;
    if (g.STATS && g.STATS.applyNamedBuff && !npc.foe) {
      g.STATS.applyNamedBuff(npc, 'meridianOverdrive', cleanDur, tNow, { casterId: npc.id });
    }
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return { ok: true, overdriveUntil: m.overdriveUntil, overdriveUsedInFight: true, openedCount: m.openedCount };
  };

  MERIDIANS.getStatBonuses = (npc, now) => {
    if (!npc || !npc.meridians) return { openedCount: 0, fourOpened: false, allEightOpened: false, overdrive: false, p: {}, f: {} };
    const m = MERIDIANS.ensure(npc);
    const tNow = now != null ? now : ((g.STATS && g.STATS.now) || 0);
    const overdrive = m.overdriveUntil > tNow;
    const p = {}, f = {};
    for (const id of MERIDIANS.ORDER) {
      if (!m.opened[id]) continue;
      const spec = MERIDIANS.CATALOG[id];
      if (!spec) continue;
      for (const [k, v] of Object.entries(spec.p || {})) p[k] = (p[k] || 0) + v;
      for (const [k, v] of Object.entries(spec.f || {})) f[k] = (f[k] || 0) + v;
    }
    if (m.allEightOpened) {
      p.atk = (p.atk || 0) + 0.08;
      p.matk = (p.matk || 0) + 0.08;
      f.cast = (f.cast || 0) + 10;
    } else if (m.fourOpened) {
      p.atk = (p.atk || 0) + 0.04;
      p.matk = (p.matk || 0) + 0.04;
      f.cast = (f.cast || 0) + 5;
    }
    if (overdrive) {
      p.atk = (p.atk || 0) + 0.30;
      p.matk = (p.matk || 0) + 0.30;
      f.cast = (f.cast || 0) + 28;
    }
    return { openedCount: m.openedCount, fourOpened: m.fourOpened, allEightOpened: m.allEightOpened, overdrive, p, f };
  };
  CULT.MERIDIANS = MERIDIANS;

  /* ---------- Section 12.5: Spirit Beast Symbiosis (Possession & Core Ingestion) ---------- */
  const BEAST_SYMBIOSIS = {};
  BEAST_SYMBIOSIS.activatePossession = (W, npc, petUidOrIdx, dur) => {
    if (W && !npc && (W.h || W.cult || W.pets || W.ext)) {
      npc = W;
      W = g.W || (g.G && g.G.W) || null;
    }
    if (!npc) return { ok: false, reason: 'no-npc' };
    npc.ext = npc.ext || {};
    const extPets = Array.isArray(npc.ext.pets) ? npc.ext.pets : [];
    const basePets = Array.isArray(npc.pets) ? npc.pets : [];
    // Sync pets between npc.pets and npc.ext.pets
    if (basePets.length && !extPets.length) {
      npc.ext.pets = basePets.slice();
    } else if (extPets.length && !basePets.length) {
      npc.pets = extPets.slice();
    }
    const tNow = (W && W.t != null) ? W.t : ((g.STATS && g.STATS.now) || 0);
    if (npc._possessionCdUntil && tNow < npc._possessionCdUntil) {
      return { ok: false, reason: 'possession-on-cooldown', cdUntil: npc._possessionCdUntil };
    }
    const allPets = (Array.isArray(npc.pets) && npc.pets.length) ? npc.pets : (Array.isArray(npc.ext.pets) ? npc.ext.pets : []);
    const isLivePet = p => p && !p.dead && p.active !== false && (p.hp == null || p.hp > 0);
    let pet = null;
    if (typeof petUidOrIdx === 'number' && isLivePet(allPets[petUidOrIdx])) {
      pet = allPets[petUidOrIdx];
    } else if (petUidOrIdx != null) {
      pet = allPets.find(p => isLivePet(p) && (p.uid === petUidOrIdx || p.id === petUidOrIdx || p.speciesId === petUidOrIdx));
    } else {
      pet = allPets.find(p => isLivePet(p) && (p.bond != null ? p.bond : (p.loyalty || 0)) >= 80) || allPets.find(isLivePet) || null;
    }
    const petBond = pet ? (pet.bond != null ? pet.bond : (pet.loyalty != null ? pet.loyalty : 0)) : 0;
    if (!pet || petBond < 80) {
      return { ok: false, reason: !pet ? 'no-pet' : 'insufficient-bond', requiredBond: 80, currentBond: petBond };
    }
    const cleanDur = clamp(Number(dur) || 36, 8, 120);
    const until = tNow + cleanDur;
    npc._possessionCdUntil = until + 24;
    const snap = {
      petUid: pet.uid || pet.id || 'PET_BONDED',
      nameTh: pet.nameTh || 'อสูรคู่สัญญา',
      tier: pet.tier || 3,
      element: pet.element || 'BEAST',
      bond: petBond,
      statShareRatio: 0.25
    };
    npc.ext.beastSpiritPossessedUntil = until;
    npc.ext.possessedPetSnapshot = snap;
    npc.beastSpiritPossessedUntil = until;
    npc.possessedPetSnapshot = snap;
    npc._beastSpiritPossessedUntil = until;
    npc._possessedPetSnapshot = snap;
    if (g.STATS && g.STATS.applyNamedBuff && !npc.foe) {
      g.STATS.applyNamedBuff(npc, 'beastSpiritPossessed', cleanDur, tNow, { casterId: npc.id });
    }
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return { ok: true, petNameTh: snap.nameTh, until, statShareRatio: 0.25, snapshot: snap };
  };

  BEAST_SYMBIOSIS.ingestBeastCore = (W, npc, coreSpec) => {
    if (W && !npc && (W.h || W.cult)) {
      npc = W;
      W = g.W || (g.G && g.G.W) || null;
    }
    if (!npc) return { ok: false, reason: 'no-npc' };
    coreSpec = coreSpec || { id: 'CORE_THUNDER_ROC', nameTh: 'แก่นในพญาครุฑอสนี', tier: 5, element: 'LIGHTNING', passiveId: 'PASSIVE_THUNDER_WINGS', p: { atk: 0.10, matk: 0.10 }, f: { move: 14, crit: 6 } };
    npc.ingestedBeastCores = Array.isArray(npc.ingestedBeastCores) ? npc.ingestedBeastCores : [];
    if (npc.ingestedBeastCores.length >= 3) npc.ingestedBeastCores.shift();
    const entry = {
      id: coreSpec.id || 'CORE_BEAST',
      nameTh: coreSpec.nameTh || 'แก่นในอสูรบรรพกาล',
      tier: coreSpec.tier || 4,
      element: coreSpec.element || 'FIRE',
      passiveId: coreSpec.passiveId || 'PASSIVE_BEAST_CORE',
      p: coreSpec.p || { atk: 0.08, hp: 0.08 },
      f: coreSpec.f || { move: 10, pen: 8 }
    };
    npc.ingestedBeastCores.push(entry);
    npc.ext = npc.ext || {};
    npc.ext.ingestedBeastCores = npc.ingestedBeastCores;
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return { ok: true, count: npc.ingestedBeastCores.length, latestCore: entry };
  };

  BEAST_SYMBIOSIS.getStatBonuses = (npc, now) => {
    if (!npc) return { active: false };
    const tNow = now != null ? now : ((g.STATS && g.STATS.now) || 0);
    const until = (npc.ext && npc.ext.beastSpiritPossessedUntil) || npc.beastSpiritPossessedUntil || npc._beastSpiritPossessedUntil || 0;
    const possessed = until > tNow;
    const snap = (npc.ext && npc.ext.possessedPetSnapshot) || npc.possessedPetSnapshot || npc._possessedPetSnapshot;
    const cores = Array.isArray(npc.ingestedBeastCores) ? npc.ingestedBeastCores : ((npc.ext && Array.isArray(npc.ext.ingestedBeastCores)) ? npc.ext.ingestedBeastCores : []);
    if (!possessed && !cores.length) return { active: false };
    const p = {}, f = {};
    if (possessed) {
      const tier = (snap && snap.tier) || 3;
      p.atk = (p.atk || 0) + 0.18 + tier * 0.02;
      p.matk = (p.matk || 0) + 0.15 + tier * 0.02;
      p.def = (p.def || 0) + 0.15;
      p.hp = (p.hp || 0) + 0.15;
      f.move = (f.move || 0) + 18;
      f.crit = (f.crit || 0) + 8;
    }
    for (const c of cores) {
      for (const [k, v] of Object.entries(c.p || {})) p[k] = (p[k] || 0) + v;
      for (const [k, v] of Object.entries(c.f || {})) f[k] = (f[k] || 0) + v;
    }
    return {
      active: true,
      possessed: !!possessed,
      possessedUntil: until,
      coreCount: cores.length,
      labelTh: possessed ? 'ประทับร่างอสูรวิญญาณและแก่นเนยใน' : ('แก่นเนยในอสูรหลอมตันเถียน (' + cores.length + ' แก่น)'),
      p,
      f
    };
  };
  CULT.BEAST_SYMBIOSIS = BEAST_SYMBIOSIS;

  /* ---------- Section 10.3: Oaths/Vows, Dao Seals, Seasonal Cultivation & Tribulation Variants ---------- */
  CULT.OATH_CATALOG = Object.freeze({
    VOW_NO_KILL: { id: 'VOW_NO_KILL', nameTh: 'สัตย์สาบานเมตตาธรรมละเว้นการสังหาร', cultSpeedBonus: 0.25, backlashHeartDemon: 35, descTh: 'ละเว้นการสังหารศัตรู มอบโบนัสอัตราฝึกปราณ +25%' },
    VOW_CHALLENGE_STRONG: { id: 'VOW_CHALLENGE_STRONG', nameTh: 'สัตย์สาบานท้าทายผู้มีขั้นพลังสูงกว่า', cultSpeedBonus: 0.28, combatBonusVsHigher: 0.18, backlashHeartDemon: 35, descTh: 'ท้าทายเฉพาะผู้มีขั้นพลังสูงกว่า มอบโบนัสอัตราฝึกปราณ +28%' },
    VOW_PROTECT_JUNIOR: { id: 'VOW_PROTECT_JUNIOR', nameTh: 'สัตย์สาบานคุ้มครองศิษย์น้องแถวหลัง', cultSpeedBonus: 0.22, shieldBonusPct: 0.20, backlashHeartDemon: 35, descTh: 'คุ้มครองศิษย์น้องแถวหลัง มอบโบนัสอัตราฝึกปราณ +22%' },
    VOW_ABSTAIN_PILLS: { id: 'VOW_ABSTAIN_PILLS', nameTh: 'สัตย์สาบานงดพึ่งพาโอสถเพิ่มตบะ', cultSpeedBonus: 0.26, backlashHeartDemon: 35, descTh: 'งดพึ่งพาโอสถเพิ่มตบะ มอบโบนัสอัตราฝึกปราณ +26%' },
    VEGETARIAN_PACIFIST: { id: 'VEGETARIAN_PACIFIST', nameTh: 'สัตย์สาบานเมตตาธรรมถือศีล', cultSpeedBonus: 0.25, backlashHeartDemon: 35, descTh: 'ถือศีลละเว้นการสังหารและโอสถต้องห้าม มอบโบนัสอัตราฝึกปราณ +25%' },
    CHALLENGE_HIGHER_REALM: { id: 'CHALLENGE_HIGHER_REALM', nameTh: 'สัตย์สาบานท้าทายผู้เหนือขั้น', cultSpeedBonus: 0.28, combatBonusVsHigher: 0.18, backlashHeartDemon: 35, descTh: 'ท้าทายผู้เหนือขั้นพลัง มอบโบนัสอัตราฝึกปราณ +28%' },
    PROTECT_JUNIORS: { id: 'PROTECT_JUNIORS', nameTh: 'สัตย์สาบานคุ้มครองศิษย์น้อง', cultSpeedBonus: 0.22, shieldBonusPct: 0.20, backlashHeartDemon: 35, descTh: 'คุ้มครองศิษย์น้องในสำนัก มอบโบนัสอัตราฝึกปราณ +22%' }
  });

  CULT.isAbstainingFromPills = npc => {
    if (!npc) return false;
    const oath = npc.daoOath || (npc.ext && npc.ext.daoOath);
    if (oath && oath.upheld && (oath.id === 'VOW_ABSTAIN_PILLS' || oath.id === 'VOW_NO_MEDICINE' || oath.id === 'VEGETARIAN_PACIFIST')) return true;
    if (npc.voluntaryVows && npc.voluntaryVows.VOW_NO_MEDICINE && npc.voluntaryVows.VOW_NO_MEDICINE.active) return true;
    if (npc.voluntaryVow && npc.voluntaryVow.active && npc.voluntaryVow.id === 'VOW_NO_PILL') return true;
    return false;
  };
  CULT.isAbstainingMedicine = CULT.isAbstainingFromPills;
  CULT.isBoundNoKill = npc => {
    if (!npc) return false;
    const oath = npc.daoOath || (npc.ext && npc.ext.daoOath);
    if (oath && oath.upheld && (oath.id === 'VOW_NO_KILL' || oath.id === 'VEGETARIAN_PACIFIST')) return true;
    return false;
  };
  CULT.isBoundNoRetreat = npc => {
    if (!npc) return false;
    const oath = npc.daoOath || (npc.ext && npc.ext.daoOath);
    if (oath && oath.upheld && (oath.id === 'VOW_NO_RETREAT' || oath.id === 'VOW_CHALLENGE_STRONG')) return true;
    if (npc.voluntaryVows && npc.voluntaryVows.VOW_NO_RETREAT && npc.voluntaryVows.VOW_NO_RETREAT.active) return true;
    if (npc.voluntaryVow && npc.voluntaryVow.active && npc.voluntaryVow.id === 'VOW_NO_RETREAT') return true;
    return false;
  };
  CULT.grantAcquiredTrait = (npc, traitId) => {
    if (!npc || !npc.h || !traitId) return false;
    const def = HC.traitDef && HC.traitDef(traitId);
    if (!def) return false;
    npc.h.traits = Array.isArray(npc.h.traits) ? npc.h.traits : [];
    const existing = npc.h.traits.find(t => t && t.id === traitId);
    if (existing) {
      const maxLv = def.maxLevel || 3;
      if ((existing.lv || 1) < maxLv) {
        existing.lv = (existing.lv || 1) + 1;
        HC.bump(npc);
        if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
        return true;
      }
      return false;
    }
    if (Array.isArray(def.conflictsWith)) {
      npc.h.traits = npc.h.traits.filter(t => t && !def.conflictsWith.includes(t.id));
    }
    npc.h.traits.push({ id: traitId, lv: 1 });
    HC.bump(npc);
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return true;
  };

  CULT.bindOathVow = (W, npc, oathId) => {
    if (W && !npc && (W.h || W.cult)) {
      oathId = npc;
      npc = W;
      W = g.W || (g.G && g.G.W) || null;
    }
    if (!npc) return { ok: false, reason: 'no-npc' };
    const spec = CULT.OATH_CATALOG[oathId] || CULT.OATH_CATALOG.VOW_CHALLENGE_STRONG || CULT.OATH_CATALOG.CHALLENGE_HIGHER_REALM;
    npc.daoOath = {
      id: spec.id,
      nameTh: spec.nameTh,
      cultSpeedBonus: spec.cultSpeedBonus,
      upheld: true,
      boundDay: (W && W.day) || 0
    };
    npc.ext = npc.ext || {};
    npc.ext.daoOath = npc.daoOath;
    npc._cultRateBase = null;
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return { ok: true, oath: npc.daoOath };
  };

  CULT.breakOathVow = (W, npc, reasonTh) => {
    if (W && (!npc || typeof npc === 'string') && (W.h || W.cult)) {
      reasonTh = npc;
      npc = W;
      W = g.W || (g.G && g.G.W) || null;
    }
    const oath = npc && (npc.daoOath || (npc.ext && npc.ext.daoOath));
    if (!npc || !oath || !oath.upheld) return { ok: false, reason: 'no-active-oath' };
    const spec = CULT.OATH_CATALOG[oath.id] || { backlashHeartDemon: 35 };
    const hdAdd = spec.backlashHeartDemon || 35;
    oath.upheld = false;
    oath.brokenDay = (W && W.day) || 0;
    oath.brokenReasonTh = reasonTh || 'ละเมิดสัตย์สาบานแห่งมรรคา';
    npc.daoOath = oath;
    if (npc.ext) npc.ext.daoOath = oath;
    if (npc.h && npc.h.state) {
      npc.h.state.heartDemon = clamp((npc.h.state.heartDemon || 0) + hdAdd, 0, 100);
    }
    npc.inj = Array.isArray(npc.inj) ? npc.inj : [];
    if (!npc.inj.some(i => i && i.part === 'สัตย์สาบานพังทลาย')) {
      npc.inj.push({
        id: 'BROKEN_DAO_OATH',
        part: 'สัตย์สาบานพังทลาย',
        why: reasonTh || 'ผิดคำสัตย์สาบานแห่งมรรคา จิตวิญญาณสั่นคลอน',
        sev: 2,
        until: ((W && W.t) || 0) + 2880
      });
    }
    npc._cultRateBase = null;
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return { ok: true, brokenOath: oath, heartDemonAdded: hdAdd, injuryAdded: 'สัตย์สาบานพังทลาย' };
  };

  CULT.DAO_SEALS = Object.freeze({
    SEAL_UNDEFEATED_10: { id: 'SEAL_UNDEFEATED_10', nameTh: 'ตราประทับเต๋า·สิบศึกไร้พ่าย', btBonus: 0.08, p: { atk: 0.08, matk: 0.08 } },
    SEAL_ZERO_TOXICITY: { id: 'SEAL_ZERO_TOXICITY', nameTh: 'ตราประทับเต๋า·กายาหยกไร้พิษ', btBonus: 0.10, p: { hp: 0.10, mdef: 0.10 } },
    SEAL_SOLO_BOSS: { id: 'SEAL_SOLO_BOSS', nameTh: 'ตราประทับเต๋า·สยบอสูรบรรพกาล', btBonus: 0.12, p: { atk: 0.10, def: 0.10 } }
  });

  CULT.grantDaoSeal = (W, npc, sealId) => {
    if (W && (!npc || typeof npc === 'string') && (W.h || W.cult)) {
      sealId = npc;
      npc = W;
      W = g.W || (g.G && g.G.W) || null;
    }
    if (!npc) return { ok: false, reason: 'no-npc' };
    const spec = CULT.DAO_SEALS[sealId] || CULT.DAO_SEALS.SEAL_UNDEFEATED_10;
    npc.ext = npc.ext || {};
    npc.daoSeals = Array.isArray(npc.daoSeals) ? npc.daoSeals : (Array.isArray(npc.ext.daoSeals) ? npc.ext.daoSeals : []);
    if (!npc.daoSeals.some(s => s && s.id === spec.id)) {
      npc.daoSeals.push(Object.assign({ grantedDay: (W && W.day) || 0 }, spec));
    }
    npc.ext.daoSeals = npc.daoSeals;
    const totalBtBonus = Math.min(0.35, npc.daoSeals.reduce((sum, s) => sum + ((s && s.btBonus) || 0.08), 0));
    npc.ext.btBonusPct = +totalBtBonus.toFixed(4);
    npc.btBonusPct = npc.ext.btBonusPct;
    npc._btBonusPct = npc.ext.btBonusPct;
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return { ok: true, seal: spec, totalSeals: npc.daoSeals.length, btBonusPct: npc.ext.btBonusPct };
  };

  CULT.evaluateSeasonalCultivationMult = (W, npc) => {
    const season = (W && W.season != null) ? W.season : 0; // 0 Spring, 1 Summer, 2 Autumn, 3 Winter
    const el = (npc && npc.h && npc.h.root && npc.h.root.primaryElement) || (npc && npc.cult && npc.cult.path) || 'NEUTRAL';
    if (season === 0 && (el === 'WOOD_LIFE' || (npc && npc.cult && npc.cult.path === 'SAGE_SUPPORT'))) return 1.25;
    if (season === 1 && (el === 'FIRE' || el === 'LIGHT_YANG' || (npc && npc.cult && npc.cult.path === 'BODY'))) return 1.25;
    if (season === 2 && (el === 'EARTH_METAL' || (npc && npc.cult && npc.cult.path === 'XIAN'))) return 1.25;
    if (season === 3 && (el === 'WATER_ICE' || el === 'YIN_SHADOW' || el === 'DARK_YIN' || (npc && npc.cult && npc.cult.path === 'HEART_SOUL'))) return 1.25;
    return 1.05;
  };

  CULT.TRIBULATION_VARIANTS = Object.freeze({
    PURPLE_THUNDER_TRIBULATION: { id: 'PURPLE_THUNDER_TRIBULATION', nameTh: 'ทัณฑ์สวรรค์อสนีม่วงเก้าชั้น', element: 'LIGHTNING', rewardTrait: 'THUNDER_TEMPERED_MARROW', bonusPen: 12 },
    KARMA_FIRE_TRIBULATION: { id: 'KARMA_FIRE_TRIBULATION', nameTh: 'ทัณฑ์สวรรค์เพลิงกรรมดอกบัวแดง', element: 'FIRE', rewardTrait: 'KARMIC_LOTUS_BODY', bonusMdefPct: 0.14 },
    HEART_DEMON_MIRROR_TRIBULATION: { id: 'HEART_DEMON_MIRROR_TRIBULATION', nameTh: 'ทัณฑ์สวรรค์กระจกเงาจิตมาร', element: 'DARK_YIN', rewardTrait: 'MIND_MIRROR_SOVEREIGN', bonusCrit: 8 },
    NINE_ABYSS_WIND_TRIBULATION: { id: 'NINE_ABYSS_WIND_TRIBULATION', nameTh: 'ทัณฑ์สวรรค์วายุทมิฬเก้าเหว', element: 'WIND', rewardTrait: 'ASTRAL_WIND_BONE', bonusMove: 16 }
  });

  CULT.resolveTribulationVariant = (W, npc, variantId) => {
    if (!npc) return { ok: false };
    const spec = CULT.TRIBULATION_VARIANTS[variantId] || CULT.TRIBULATION_VARIANTS.PURPLE_THUNDER_TRIBULATION;
    npc.daoScars = Array.isArray(npc.daoScars) ? npc.daoScars : [];
    npc.daoScars.push({
      id: spec.rewardTrait,
      nameTh: spec.nameTh,
      element: spec.element,
      combatPowerBonus: 0.08
    });
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return { ok: true, variant: spec, daoScarsCount: npc.daoScars.length };
  };


  /* ---------- Patch v3.3.0 [PROP-04]: Closed-Door Bottleneck Seclusion & Breakthrough Protection ---------- */
  CULT.attemptBreakthrough = (W, npc, prep) => CULT.breakthrough(W, npc, prep);

  CULT.enterClosedDoorSeclusion = (W, npc, opts) => {
    opts = opts || {};
    if (!npc || npc.dead || !npc.cult) return { ok: false, reason: 'invalid-npc' };
    const thresh = CULT.threshold ? CULT.threshold(npc) : 100;
    const atBottleneck = (npc.cult.prog || 0) >= thresh * 0.95 || (npc.cult.attempts || 0) >= 1 || opts.force === true;
    if (!atBottleneck) return { ok: false, reason: 'not-at-bottleneck', prog: npc.cult.prog, threshold: thresh };
    const targetDays = clamp(Math.round(Number(opts.days) || 15), 1, 60);
    const protId = opts.protectorId || null;
    npc.closedDoorSeclusion = {
      active: true,
      startedDay: (W && W.day) || 360,
      targetDays,
      daysElapsed: 0,
      insightBonusPct: 0,
      protectorId: protId,
      disturbedCount: 0
    };
    npc.cult.secl = { started: (W && W.day) || 360, days: targetDays, protectorId: protId };
    if (W && W.log && !opts.quiet && npc.h && npc.h.name) {
      const prot = protId && W.byId && W.byId[protId];
      W.log('cult', '🧘 ' + HC.fullName(npc) + ' เข้าถ้ำปิดด่านกักตนสะสมญาณทะลวงคอขวด (' + targetDays + ' วัน)' + (prot ? (' โดยมี ' + HC.fullName(prot) + ' คุ้มภัยหน้าถ้ำ') : ''), [npc.id, protId].filter(Boolean));
    }
    return { ok: true, seclusion: npc.closedDoorSeclusion };
  };

  CULT.tickClosedDoorSeclusion = (W, opts) => {
    opts = opts || {};
    if (!W || !Array.isArray(W.npcs)) return { ok: false, ticked: 0, breakthroughs: [] };
    let ticked = 0;
    const breakthroughs = [];
    for (let i = 0; i < W.npcs.length; i++) {
      const n = W.npcs[i];
      if (!n || n.dead || n.exiled || !n.closedDoorSeclusion || !n.closedDoorSeclusion.active) continue;
      ticked++;
      const cs = n.closedDoorSeclusion;
      cs.daysElapsed = (cs.daysElapsed || 0) + 1;
      cs.insightBonusPct = +Math.min(0.30, cs.daysElapsed * 0.02).toFixed(4);
      const prot = cs.protectorId && W.byId && W.byId[cs.protectorId];
      const hasValidProtector = !!(prot && !prot.dead && !prot.exiled && ((prot.h && prot.h.state && prot.h.state.hp) || 100) >= CULT.hpMax(prot) * 0.35);
      const disturbChance = hasValidProtector ? 0.03 : 0.15;
      if (!opts.noDisturb && W.rng && W.rng.chance && W.rng.chance(disturbChance)) {
        cs.disturbedCount = (cs.disturbedCount || 0) + 1;
        if (n.h && n.h.state) n.h.state.heartDemon = clamp((n.h.state.heartDemon || 0) + 4, 0, 100);
      } else if (hasValidProtector && n.h && n.h.state) {
        n.h.state.heartDemon = Math.max(0, (n.h.state.heartDemon || 0) - 2);
      }
      if (cs.daysElapsed >= (cs.targetDays || 15) || opts.forceComplete) {
        const btRes = CULT.attemptBreakthrough(W, n, {
          env: cs.insightBonusPct,
          guide: hasValidProtector ? 0.06 : 0,
          _seclusionIncluded: true
        });
        cs.active = false;
        cs.completedDay = W.day || 360;
        cs.lastResult = btRes;
        if (n.cult) n.cult.secl = null;
        if (btRes && btRes.ok && hasValidProtector) {
          if (g.SECT && g.SECT.DESTINY_KARMA && g.SECT.DESTINY_KARMA.bindThread) {
            g.SECT.DESTINY_KARMA.bindThread(W, prot, n, 'GOLD_THREAD', HC.fullName(prot) + ' ยืนหยัดคุ้มภัยหน้าถ้ำจน ' + HC.fullName(n) + ' ทะลวงด่านสำเร็จ');
          }
          if (g.SECT && g.SECT.rel) {
            const rel = g.SECT.rel(n, prot.id);
            rel.r = clamp((rel.r || 0) + 15, -100, 100);
            rel.a = clamp((rel.a || 0) + 10, -100, 100);
          }
          prot.merit = (prot.merit || 0) + 15;
        }
        breakthroughs.push({ npcId: n.id, ok: !!(btRes && btRes.ok), stage: n.cult ? n.cult.stage : 1, insightBonusPct: cs.insightBonusPct, protectorId: hasValidProtector ? prot.id : null });
      }
    }
    return { ok: true, ticked, breakthroughs };
  };


  /* ---------- Patch v3.4.0 [PROP-03]: Path-Specific Secondary Combat Resource Gauges ---------- */
  CULT.PATH_GAUGES = Object.freeze({
    XIAN: { id: 'SWORD_INTENT', path: 'XIAN', nameTh: 'เจตจำนงกระบี่', max: 100, gainOnHit: 25, gainOnHurt: 12, finisherNameTh: 'กระบี่หมื่นดาราผ่าสวรรค์', finisherMult: 1.65 },
    BODY: { id: 'BLOOD_FURNACE', path: 'BODY', nameTh: 'เตาหลอมโลหิตปราณ', max: 100, gainOnHit: 18, gainOnHurt: 28, finisherNameTh: 'หมัดราชันบรรพกาลทลายขุนเขา', finisherMult: 1.65 },
    GOD: { id: 'DIVINE_FAITH', path: 'GOD', nameTh: 'ศรัทธาเทวะศักดิ์สิทธิ์', max: 100, gainOnHit: 22, gainOnHurt: 18, finisherNameTh: 'ทัณฑ์สวรรค์เทวะจุติ', finisherMult: 1.65 },
    DEMON: { id: 'DEMONIC_FRENZY', path: 'DEMON', nameTh: 'คลั่งโลหิตอสูร', max: 100, gainOnHit: 25, gainOnHurt: 20, finisherNameTh: 'อสูรกลืนสวรรค์ผลาญวิญญาณ', finisherMult: 1.70 },
    HEART_SOUL: { id: 'SOUL_RESONANCE', path: 'HEART_SOUL', nameTh: 'คลื่นสั่นพ้องจิตวิญญาณ', max: 100, gainOnHit: 22, gainOnHurt: 16, finisherNameTh: 'มายาฝันนิรันดร์ดับจิต', finisherMult: 1.60 },
    MECH_PUPPET: { id: 'PUPPET_HEAT', path: 'MECH_PUPPET', nameTh: 'พลังงานแกนกลไก', max: 100, gainOnHit: 25, gainOnHurt: 15, finisherNameTh: 'ปืนใหญ่กลไกถล่มดารา', finisherMult: 1.65 },
    KARMA_SAMSARA: { id: 'KARMIC_WHEEL', path: 'KARMA_SAMSARA', nameTh: 'กงล้อวัฏสงสาร (Karmic Wheel)', max: 100, gainOnHit: 20, gainOnHurt: 25, finisherNameTh: 'กงล้อพิพากษาหกภพภูมิ', finisherMult: 1.65 },
    BEAST_SOVEREIGN: { id: 'GU_SWARM', path: 'BEAST_SOVEREIGN', nameTh: 'ฝูงกู่และจิตอสูร (Gu Swarm & Beast Fury)', max: 100, gainOnHit: 25, gainOnHurt: 15, finisherNameTh: 'หมื่นอสูรคำรามกลืนฟ้า', finisherMult: 1.65 },
    SAGE_SUPPORT: { id: 'NECTAR_HARMONY', path: 'SAGE_SUPPORT', nameTh: 'น้ำทิพย์แห่งเต๋า (Nectar Harmony)', max: 100, gainOnHit: 22, gainOnHurt: 18, finisherNameTh: 'พิรุณทิพย์ชุบชีวิตหมื่นบุปผา', finisherMult: 1.50, healPct: 0.25 },
    CRAFT_CREATION: { id: 'FORGE_FLAME', path: 'CRAFT_CREATION', nameTh: 'เพลิงหลอมสวรรค์ (Heavenly Forge Flame)', max: 100, gainOnHit: 22, gainOnHurt: 16, finisherNameTh: 'ค้อนสวรรค์หลอมศาสตราพิฆาต', finisherMult: 1.60 },
    ARRAY_TALISMAN: { id: 'TRIGRAM_SIGIL', path: 'ARRAY_TALISMAN', nameTh: 'ยันต์แปดทิศสะสม (Eight-Trigram Sigils)', max: 100, gainOnHit: 22, gainOnHurt: 16, finisherNameTh: 'ค่ายกลมหาเวทย์แปดทิศสังหาร', finisherMult: 1.65 },
    STRATEGY_GOVERNANCE: { id: 'COMMAND_AUTHORITY', path: 'STRATEGY_GOVERNANCE', nameTh: 'ตราอาญาสิทธิ์จอมทัพ (Command Authority)', max: 100, gainOnHit: 22, gainOnHurt: 16, finisherNameTh: 'พิชัยยุทธ์หมื่นทัพพิชิตศึก', finisherMult: 1.60 },
    ASTRO_DIVINATION: { id: 'STAR_DESTINY', path: 'ASTRO_DIVINATION', nameTh: 'ชะตาดาราพยากรณ์ (Star Destiny)', max: 100, gainOnHit: 24, gainOnHurt: 18, finisherNameTh: 'เจ็ดดาราเหนือพลิกชะตาสวรรค์', finisherMult: 1.68 },
    BUDDHA_DHARMA: { id: 'BODHI_MERIT', path: 'BUDDHA_DHARMA', nameTh: 'บารมีโพธิญาณ (Bodhi Merit)', max: 100, gainOnHit: 20, gainOnHurt: 26, finisherNameTh: 'ฝ่ามือยูไลทองคำสยบมาร', finisherMult: 1.65, healPct: 0.20 },
    VOID_SPACE: { id: 'VOID_RIFT', path: 'VOID_SPACE', nameTh: 'รอยแยกสุญญากาศ (Void Rift)', max: 100, gainOnHit: 25, gainOnHurt: 18, finisherNameTh: 'มิติพับทลายสุญญากาศนิรันดร์', finisherMult: 1.70 },
    SONIC_HARMONY: { id: 'HARMONIC_CHORD', path: 'SONIC_HARMONY', nameTh: 'ทำนองสั่นพ้องเจ็ดสาย (Harmonic Chord)', max: 100, gainOnHit: 24, gainOnHurt: 16, finisherNameTh: 'มหาคีตาสวรรค์สะบั้นวิญญาณ', finisherMult: 1.65 },
    VENOM_GU: { id: 'SYMBIOTIC_GU', path: 'VENOM_GU', nameTh: 'รังไหมกู่ปรสิต (Symbiotic Gu)', max: 100, gainOnHit: 25, gainOnHurt: 20, finisherNameTh: 'ราชันย์หมื่นกู่กลืนกินสวรรค์', finisherMult: 1.68 },
    PRIMORDIAL_SHIFTER: { id: 'BLOODLINE_ATAVISM', path: 'PRIMORDIAL_SHIFTER', nameTh: 'เลือดบรรพกาลเดือด (Bloodline Atavism)', max: 100, gainOnHit: 24, gainOnHurt: 26, finisherNameTh: 'เทพอสูรบรรพกาลแปลงกายถล่มภพ', finisherMult: 1.70 },
    CELESTIAL_WEATHER: { id: 'SKY_QI', path: 'CELESTIAL_WEATHER', nameTh: 'ปราณฟ้าดินแปรผัน (Sky Qi)', max: 100, gainOnHit: 24, gainOnHurt: 18, finisherNameTh: 'มหาพายุอัสนีเก้าชั้นฟ้าพิโรธ', finisherMult: 1.68 },
    WANDERING_DAO: { id: 'ROUTE_INSIGHT', path: 'WANDERING_DAO', nameTh: 'ญาณทัศน์พเนจร (Route Insight)', max: 100, gainOnHit: 24, gainOnHurt: 18, finisherNameTh: 'ก้าวเดียวข้ามหมื่นลี้ไร้ร่องรอย', finisherMult: 1.64 },
    MERCANTILE_DAO: { id: 'CONTRACT_LEDGER', path: 'MERCANTILE_DAO', nameTh: 'ตราพันธสัญญาการค้า (Contract Ledger)', max: 100, gainOnHit: 22, gainOnHurt: 20, finisherNameTh: 'ลูกคิดทองคำพิพากษาหนี้กรรม', finisherMult: 1.65 },
    DRAGON_VEIN_GEOMANCY: { id: 'VEIN_RESONANCE', path: 'DRAGON_VEIN_GEOMANCY', nameTh: 'สั่นพ้องชีพจรมังกร (Vein Resonance)', max: 100, gainOnHit: 22, gainOnHurt: 24, finisherNameTh: 'ชีพจรมังกรปฐพีตื่นพิโรธ', finisherMult: 1.66 },
    GRAVITY_DAO: { id: 'GRAVITY_PRESSURE', path: 'GRAVITY_DAO', nameTh: 'แรงกดดันดาราถ่วง (Gravity Pressure)', max: 100, gainOnHit: 24, gainOnHurt: 24, finisherNameTh: 'หลุมดำดารายุบตัวบดขยี้สวรรค์', finisherMult: 1.70 },
    CHRONO_EPOCH: { id: 'TEMPORAL_SAND', path: 'CHRONO_EPOCH', nameTh: 'ทรายกาลเวลา (Temporal Sand)', max: 100, gainOnHit: 24, gainOnHurt: 20, finisherNameTh: 'วัฏจักรกาลเวลาย้อนทวนพันกัป', finisherMult: 1.70 },
    INK_LITERATI: { id: 'LITERATI_INK', path: 'INK_LITERATI', nameTh: 'น้ำหมึกปราชญ์ราชสำนัก (Literati Ink)', max: 100, gainOnHit: 24, gainOnHurt: 16, finisherNameTh: 'พู่กันราชโองการสวรรค์สะบั้นภพ', finisherMult: 1.66 },
    SOUL_PUPPETRY: { id: 'MARIONETTE_SILK', path: 'SOUL_PUPPETRY', nameTh: 'ไหมเชิดวิญญาณ (Marionette Silk)', max: 100, gainOnHit: 24, gainOnHurt: 18, finisherNameTh: 'โรงละครหมื่นหุ่นเชิดสังหาร', finisherMult: 1.66 },
    PRIMORDIAL_CHAOS: { id: 'CHAOS_ENTROPY', path: 'PRIMORDIAL_CHAOS', nameTh: 'ปราณโกลาหลบรรพกาล (Chaos Entropy)', max: 100, gainOnHit: 25, gainOnHurt: 22, finisherNameTh: 'หงเหมิงเบิกฟ้าทลายเบญจธาตุ', finisherMult: 1.72 },
    SHADOW_SAMURAI: { id: 'IAI_FOCUS', path: 'SHADOW_SAMURAI', nameTh: 'สมาธิอิไอไร้เงา (Iai Focus)', max: 100, startValue: 100, gainOnHit: 28, gainOnHurt: 24, finisherNameTh: 'เพลงดาบอิไอไร้เงาปลิดชีพพริบตา', finisherMult: 1.82 },
    NINPO_SHADOW: { id: 'STEALTH_CHAKRA', path: 'NINPO_SHADOW', nameTh: 'จักระเร้นเงามืด (Stealth Chakra)', max: 100, gainOnHit: 26, gainOnHurt: 20, finisherNameTh: 'พันร่างเงาสังหารไร้ลักษณ์', finisherMult: 1.70 },
    NINPO_ELEMENTAL: { id: 'HAND_SEAL_RHYTHM', path: 'NINPO_ELEMENTAL', nameTh: 'จังหวะประสานมุทรา (Hand Seal Rhythm)', max: 100, gainOnHit: 25, gainOnHurt: 18, finisherNameTh: 'มหาคาถามุทราเบญจธาตุระเบิดภพ', finisherMult: 1.70 },
    DIVINE_SUMMONER: { id: 'MANIFEST_FAITH', path: 'DIVINE_SUMMONER', nameTh: 'ศรัทธาอัญเชิญเทวะ (Manifest Faith)', max: 100, gainOnHit: 24, gainOnHurt: 22, finisherNameTh: 'เปิดประตูสวรรค์อัญเชิญทวยเทพจุติ', finisherMult: 1.75 },
    DIVINE_POSSESSION: { id: 'AVATAR_TRANCE', path: 'DIVINE_POSSESSION', nameTh: 'ภวังค์เทวะประทับร่าง (Avatar Trance)', max: 100, gainOnHit: 25, gainOnHurt: 25, finisherNameTh: 'ระบำอวตารมหาเทพทลายพิภพ', finisherMult: 1.76 },
    DIVINE_CHANNELER: { id: 'COSMIC_TETHER', path: 'DIVINE_CHANNELER', nameTh: 'สายใยยืมกฎเทวะ (Cosmic Tether)', max: 100, gainOnHit: 25, gainOnHurt: 20, finisherNameTh: 'ศาสตราโองการกฎฟ้าพิพากษา', finisherMult: 1.72 },
    VOID_HERETIC_PACT: { id: 'ELDRITCH_MADNESS', path: 'VOID_HERETIC_PACT', nameTh: 'คลื่นวิปลาสนอกมิติ (Eldritch Madness)', max: 100, gainOnHit: 26, gainOnHurt: 24, finisherNameTh: 'เนตรอวกาศมืดกลืนกินสติสัมปชัญญะ', finisherMult: 1.75 },
    OCCULT_MAGE: { id: 'SACRED_VOW_MERIT', path: 'OCCULT_MAGE', nameTh: 'แรงครูและสัจจะอาคม (Sacred Vow Merit)', max: 100, gainOnHit: 22, gainOnHurt: 26, finisherNameTh: 'มหาเวทย์บรมครูเก้ายอดสะท้านภพ', finisherMult: 1.68 },
    DEVOURING_FLESH: { id: 'SECRET_ORGAN_HUNGER', path: 'DEVOURING_FLESH', nameTh: 'ปราณอวัยวะเร้นลับกลืนสวรรค์ (Secret Organ Hunger)', max: 100, gainOnHit: 26, gainOnHurt: 26, finisherNameTh: 'กระเพาะหลุมดำกลืนกินฟ้าดิน', finisherMult: 1.72, healPct: 0.22 },
    NETHER_GRAVE: { id: 'GRAVE_SOUL_ECHO', path: 'NETHER_GRAVE', nameTh: 'ไอวิญญาณสุสานบรรพชน (Grave Soul Echo)', max: 100, gainOnHit: 24, gainOnHurt: 24, finisherNameTh: 'กองทัพกระดูกยมโลกพิพากษา', finisherMult: 1.68 },
    ANCESTRAL_RITUAL: { id: 'RITE_FERVOR', path: 'ANCESTRAL_RITUAL', nameTh: 'ศรัทธาพิธีบรรพชน (Rite Fervor)', max: 100, gainOnHit: 22, gainOnHurt: 22, finisherNameTh: 'อัญเชิญเจตจำนงวีรชนบรรพกาล', finisherMult: 1.66, healPct: 0.18 },
    TIDE_VOYAGER: { id: 'TIDE_FLOW', path: 'TIDE_VOYAGER', nameTh: 'กระแสคลื่นสมุทร (Tide Flow)', max: 100, gainOnHit: 24, gainOnHurt: 20, finisherNameTh: 'คลื่นยักษ์เก้าสมุทรกลืนพิภพ', finisherMult: 1.66 },
    LORE_ARCHIVIST: { id: 'LORE_INDEX', path: 'LORE_ARCHIVIST', nameTh: 'ดัชนีอรรถาธิบายคัมภีร์ (Lore Index)', max: 100, gainOnHit: 24, gainOnHurt: 18, finisherNameTh: 'มหาสารานุกรมสยบหมื่นวิชา', finisherMult: 1.66 },
    FORTUNE_GAMBLER: { id: 'STAKE', path: 'FORTUNE_GAMBLER', nameTh: 'แต้มเดิมพันชะตาสวรรค์ (Destiny Stake)', max: 100, gainOnHit: 28, gainOnHurt: 22, finisherNameTh: 'เดิมพันหมดหน้าตักพลิกชะตาสวรรค์', finisherMult: 1.74 },
    SPIRIT_HUSBANDRY: { id: 'GROWTH_CYCLE', path: 'SPIRIT_HUSBANDRY', nameTh: 'วัฏจักรพฤกษางอกงาม (Growth Cycle)', max: 100, gainOnHit: 22, gainOnHurt: 22, finisherNameTh: 'ต้นไม้โลกเสิ่นหนงชุบชีวิตหมื่นหล้า', finisherMult: 1.64, healPct: 0.25 },
    ARENA_GLORY: { id: 'RENOWN_FLAME', path: 'ARENA_GLORY', nameTh: 'เพลิงเกียรติยศลานประลอง (Renown Flame)', max: 100, gainOnHit: 26, gainOnHurt: 22, finisherNameTh: 'ศาสตราเจ้ายุทธจักรไร้พ่าย', finisherMult: 1.72 },
    LEG_READ_FORM_BLADE: { id: 'FORM_TRACE', path: 'LEG_READ_FORM_BLADE', nameTh: 'รอยกระบวนท่า', max: 100, gainOnHit: 24, gainOnHurt: 20, finisherNameTh: 'กระบี่ปิดบทอ่านช่องฟ้า', finisherMult: 1.7 },
    LEG_TRIAGE_MERIDIAN: { id: 'TRIAGE_PULSE', path: 'LEG_TRIAGE_MERIDIAN', nameTh: 'ชีพจรประคองชีวิต', max: 100, gainOnHit: 24, gainOnHurt: 22, finisherNameTh: 'ดัชนีเปิดชีพจรคืนสมดุล', finisherMult: 1.45, healPct: 0.25 },
    LEG_STORM_CALLER_TEMPEST: { id: 'STORM_FRONT', path: 'LEG_STORM_CALLER_TEMPEST', nameTh: 'แนวพายุสมรภูมิ', max: 100, gainOnHit: 24, gainOnHurt: 20, finisherNameTh: 'อัสนีพายุสวรรค์ฟาดปฐพี', finisherMult: 1.7 },
    LEG_JADE_CARAVAN_VOYAGER: { id: 'ROAD_MOMENTUM', path: 'LEG_JADE_CARAVAN_VOYAGER', nameTh: 'แรงเฉื่อยทางไกล', max: 100, gainOnHit: 24, gainOnHurt: 20, finisherNameTh: 'ขบวนคุ้มกันผ่าด่านหมื่นลี้', finisherMult: 1.7 },
    LEG_OATH_JUDGE_WARDEN: { id: 'OATH_SCALE', path: 'LEG_OATH_JUDGE_WARDEN', nameTh: 'ตราชั่งสัตย์ยุทธภพ', max: 100, gainOnHit: 24, gainOnHurt: 20, finisherNameTh: 'คำพิพากษาสยบผู้ตระบัดสัตย์', finisherMult: 1.7 },
    LEG_ASHEN_KILN_ALCHEMY: { id: 'ASHEN_GLAZE', path: 'LEG_ASHEN_KILN_ALCHEMY', nameTh: 'เคลือบเถ้าปราณ', max: 100, gainOnHit: 24, gainOnHurt: 20, finisherNameTh: 'เตาเถ้าแตกระเบิดคมกระเบื้อง', finisherMult: 1.7 },
    TRANS_CONSTELLATION_RELAY: { id: 'STAR_RELAY', path: 'TRANS_CONSTELLATION_RELAY', nameTh: 'ข่ายปราณหมู่ดาว', max: 100, gainOnHit: 24, gainOnHurt: 22, finisherNameTh: 'ข่ายดาราประสานชีพจรทั้งคณะ', finisherMult: 1.50, healPct: 0.28 },
    TRANS_FIELD_CLAUSE_SOVEREIGN: { id: 'FIELD_CHARTER', path: 'TRANS_FIELD_CLAUSE_SOVEREIGN', nameTh: 'ธรรมนูญสนามรบ', max: 100, gainOnHit: 24, gainOnHurt: 20, finisherNameTh: 'ประกาศธรรมนูญขีดเขตสมรภูมิ', finisherMult: 1.76 },
    TRANS_TEMPO_SOVEREIGN: { id: 'TEMPO_BANK', path: 'TRANS_TEMPO_SOVEREIGN', nameTh: 'คลังจังหวะสมรภูมิ', max: 100, gainOnHit: 24, gainOnHurt: 20, finisherNameTh: 'กลองศึกตัดจังหวะพลิกกระแส', finisherMult: 1.76 },
    TRANS_SEALKEEPER_FORBIDDEN_KEY: { id: 'SEAL_KEY', path: 'TRANS_SEALKEEPER_FORBIDDEN_KEY', nameTh: 'กุญแจปมผนึก', max: 100, gainOnHit: 24, gainOnHurt: 20, finisherNameTh: 'ปมผนึกคลังโบราณล็อกชีพจร', finisherMult: 1.76 },
    TRANS_PRIMAL_VORTEX_MIRROR: { id: 'MIRROR_ECHO', path: 'TRANS_PRIMAL_VORTEX_MIRROR', nameTh: 'เงาสะท้อนวิชา', max: 100, gainOnHit: 24, gainOnHurt: 20, finisherNameTh: 'กระจกนิ่งย้อนคืนหมื่นกระบวน', finisherMult: 1.76 },
    TRANS_DYNASTIC_MANDATE_WEAVER: { id: 'MANDATE_THREAD', path: 'TRANS_DYNASTIC_MANDATE_WEAVER', nameTh: 'เส้นใยชะตาแผ่นดิน', max: 100, gainOnHit: 24, gainOnHurt: 20, finisherNameTh: 'เส้นใยดุลยภาพประคองแผ่นดิน', finisherMult: 1.76 },
    CORPSE_SOVEREIGN: { id: 'BODY_MEMORY', path: 'CORPSE_SOVEREIGN', nameTh: 'ความจำกายของศพ', max: 100, gainOnHit: 22, gainOnHurt: 24, finisherNameTh: 'ขบวนศพหมื่นร่างบดขยี้แนวรบ', finisherMult: 1.68 },
    WRAITH_GRIEVANCE: { id: 'GRIEVANCE_WEIGHT', path: 'WRAITH_GRIEVANCE', nameTh: 'น้ำหนักความแค้น', max: 100, gainOnHit: 24, gainOnHurt: 20, finisherNameTh: 'บัญชีหนี้เลือดเปิดหน้าสุดท้าย', finisherMult: 1.70 },
    DEATHLESS_CADAVER: { id: 'NECROSIS', path: 'DEATHLESS_CADAVER', nameTh: 'ไอมรณะแทรกกาย', max: 100, gainOnHit: 22, gainOnHurt: 28, finisherNameTh: 'ร่างไร้ชีพกลืนบาดแผลคืนกำลัง', finisherMult: 1.70, healPct: 0.18 }
  });

  CULT.isZeroQiSamurai = npc => !!(npc && npc.cult && npc.cult.path === 'SHADOW_SAMURAI');

  CULT.ensurePathGauge = npc => {
    if (!npc || npc.foe || !npc.cult || !CULT.PATH_GAUGES[npc.cult.path]) return null;
    const pathKey = npc.cult.path;
    const spec = CULT.PATH_GAUGES[pathKey];
    const isSamurai = pathKey === 'SHADOW_SAMURAI';
    if (!npc.pathGauge || npc.pathGauge.id !== spec.id) {
      const initVal = isSamurai ? 100 : (spec.startValue || 0);
      npc.pathGauge = {
        id: spec.id,
        path: pathKey,
        nameTh: spec.nameTh,
        value: initVal,
        max: spec.max || 100,
        ready: initVal >= (spec.max || 100),
        triggeredCount: 0,
        finisherNameTh: spec.finisherNameTh,
        finisherMult: spec.finisherMult || 1.65
      };
    }
    if (isSamurai && npc.h && npc.h.state) {
      npc.h.state.qi = 0; // Shadow Samurai uses Zero Qi / No Mana Bushido
    }
    return npc.pathGauge;
  };

  CULT.gainPathGauge = (npc, delta) => {
    const pg = CULT.ensurePathGauge(npc);
    if (!pg) return null;
    pg.value = clamp((pg.value || 0) + (Number(delta) || 0), 0, pg.max || 100);
    pg.ready = pg.value >= (pg.max || 100);
    return pg;
  };

  CULT.triggerPathGaugeFinisher = (W, f, caster, target) => {
    const pg = CULT.ensurePathGauge(caster);
    if (!pg || pg.value < (pg.max || 100)) return { ok: false, reason: 'gauge-not-full' };
    const combat = g.COMBAT, stats = g.STATS;
    if (!W || !f || f.over || f.state !== 'fight' || !combat || !combat.alive(caster) || !combat.alive(target) || target.hidden || target.away || !combat.isHostile(f, caster.id, target.id)) {
      return { ok: false, reason: 'invalid-target' };
    }
    if ((caster.act && caster.act.ctx && caster.act.ctx.channeling) || (stats && ['stun', 'paralyze', 'cryoStasis'].some(k => stats.has(caster, k, W.t)))) {
      return { ok: false, reason: 'unable-to-act' };
    }
    const wProf = (g.SK && g.SK.weaponTacticalProfile) ? g.SK.weaponTacticalProfile(caster) : null;
    const baseRange = g.SK && g.SK.resolveMoveSpatialSpec ? g.SK.resolveMoveSpatialSpec(null, caster) : { max: 1.7, requiresLoS: false };
    const maxReach = Math.max(baseRange.max || 1.7, (wProf && wProf.prefMax) || 1.7, (caster.tac && caster.tac.cachedEngageRange) || 1.7);
    const range = { max: maxReach, requiresLoS: maxReach > 2.2 || !!baseRange.requiresLoS };
    if (!Number.isFinite(caster.x) || !Number.isFinite(caster.y) || !Number.isFinite(target.x) || !Number.isFinite(target.y) || combat.unitDist(caster, target) > range.max + 0.65) {
      return { ok: false, reason: 'out-of-range' };
    }
    if (combat.checkLineOfSight && !combat.checkLineOfSight(W, f, caster, target, range).clear) return { ok: false, reason: 'line-of-sight-blocked' };
    const spec = CULT.PATH_GAUGES[pg.path] || CULT.PATH_GAUGES.XIAN;
    pg.value = 0;
    pg.ready = false;
    pg.triggeredCount = (pg.triggeredCount || 0) + 1;
    let actualTarget = target;
    let interceptMult = 1.0;
    if (combat.resolveDefensiveInterception) {
      const icp = combat.resolveDefensiveInterception(W, f, caster, target, { arch: maxReach > 2.2 ? 'blast' : 'strike', moveSpec: range });
      if (icp && icp.interceptor && combat.alive(icp.interceptor)) {
        actualTarget = icp.interceptor;
        interceptMult = icp.dmgMult || 0.80;
      }
    }
    let dmgDealt = 0;
    if (actualTarget && g.COMBAT && g.COMBAT.alive(actualTarget)) {
      const baseHm = g.COMBAT.hpMax(actualTarget);
      const cStats = (g.STATS && g.STATS.get && caster && !caster.foe) ? g.STATS.get(caster) : null;
      const tStats = (g.STATS && g.STATS.get) ? g.STATS.get(actualTarget) : null;
      const cAtk = cStats ? Math.max(cStats.atk || 0, cStats.matk || 0) : (caster && caster.power ? caster.power * 0.6 : 45);
      const defVal = tStats ? Math.min(tStats.def || 0, tStats.mdef || 0) * (1 - clamp((cStats ? cStats.pen || 0 : 0) / 100, 0, 0.75)) : 0;
      const mit = 100 / (100 + Math.max(0, defVal * 0.55));
      const rawAtkDmg = (cAtk * 2.8 + Math.min(cAtk * 1.5, baseHm * 0.06)) * mit * interceptMult;
      dmgDealt = Math.max(15, Math.round(rawAtkDmg * (spec.finisherMult || 1.65)));
      g.COMBAT.applyDamage(W, f, caster, actualTarget, dmgDealt, spec.finisherNameTh);
    }
    if (spec.healPct && g.COMBAT) {
      const cHm = g.COMBAT.hpMax(caster);
      g.COMBAT.setHp(caster, Math.min(cHm, g.COMBAT.hp(caster) + Math.round(cHm * spec.healPct)));
    }
    caster.fx = { t: (W && W.t) || 0, text: '🔥 ' + spec.finisherNameTh + '!' };
    caster.lastPathGaugeFinisher = {
      t: (W && W.t) || 0,
      gaugeId: pg.id,
      path: pg.path,
      finisherNameTh: spec.finisherNameTh,
      dmgDealt,
      targetId: target ? target.id : null,
      targetX: (actualTarget && Number.isFinite(actualTarget.x)) ? actualTarget.x : (target && Number.isFinite(target.x) ? target.x : caster.x),
      targetY: (actualTarget && Number.isFinite(actualTarget.y)) ? actualTarget.y : (target && Number.isFinite(target.y) ? target.y : caster.y),
      originX: caster.x,
      originY: caster.y
    };
    return { ok: true, gaugeId: pg.id, finisherNameTh: spec.finisherNameTh, dmgDealt, triggeredCount: pg.triggeredCount };
  };

  /* ---------- Patch v3.4.0 [PROP-05]: 7 Archetype Subpaths 6-Tier Mastery ---------- */
  CULT.inferDefaultArchetypeForNpc = npc => {
    if (!npc || !npc.cult) return 'OATH_BOUND_DUELIST';
    const p = npc.cult.path, s = npc.cult.sub || '';
    if (['BODY', 'GRAVITY_DAO', 'DRAGON_VEIN_GEOMANCY', 'DEVOURING_FLESH', 'OCCULT_MAGE'].includes(p) || /GUARD|SHIELD|VAJRA|BASTION|TITAN/.test(s)) return 'WARDEN_TAUNTER';
    if (['ASTRO_DIVINATION', 'CHRONO_EPOCH', 'KARMA_SAMSARA', 'FORTUNE_GAMBLER', 'DIVINE_CHANNELER'].includes(p) || /FATE|STAR|ORACLE|TIME/.test(s)) return 'FATE_WEAVER';
    if (['ARRAY_TALISMAN', 'CELESTIAL_WEATHER', 'INK_LITERATI', 'LORE_ARCHIVIST', 'STRATEGY_GOVERNANCE'].includes(p) || /ARRAY|DOMAIN|SEAL|QIMEN/.test(s)) return 'DOMAIN_ARRAYIST';
    if (['VENOM_GU', 'SPIRIT_HUSBANDRY', 'NETHER_GRAVE', 'VOID_HERETIC_PACT'].includes(p) || /POISON|VENOM|MIASMA|GU|TOXIN|ALCHEMIST/.test(s)) return 'CONTAGION_ALCHEMIST';
    if (['SAGE_SUPPORT', 'SONIC_HARMONY', 'HEART_SOUL', 'BUDDHA_DHARMA', 'ANCESTRAL_RITUAL', 'DIVINE_SUMMONER'].includes(p) || /ZITHER|CHOIR|DUET|MERCY/.test(s)) return 'DUET_SAGE';
    if (['NINPO_SHADOW', 'NINPO_ELEMENTAL', 'WANDERING_DAO', 'VOID_SPACE', 'PRIMORDIAL_SHIFTER', 'TIDE_VOYAGER'].includes(p) || /STANCE|SHADOW|WIND|STEP|DANCE/.test(s)) return 'STANCE_DANCER';
    return 'OATH_BOUND_DUELIST';
  };

  CULT.evaluateSubpathArchetypeMastery = (npc, archetypeId, tierOverride, opts) => {
    opts = opts || {};
    if (!npc || !g.SK || !g.SK.SUBPATH_ARCHETYPES_V235) return { ok: false, reason: 'invalid-npc-or-catalog' };
    const cat = g.SK.SUBPATH_ARCHETYPES_V235;
    if (archetypeId && !cat[archetypeId]) return { ok: false, reason: 'unknown-archetype', archetypeId };
    const archId = (archetypeId && cat[archetypeId]) ? archetypeId : (npc.subpathArchetype && cat[npc.subpathArchetype] ? npc.subpathArchetype : CULT.inferDefaultArchetypeForNpc(npc));
    const spec = cat[archId];
    if (opts.strictPath && npc.cult && Array.isArray(spec.recommendedPaths) && !spec.recommendedPaths.includes(npc.cult.path) && archId !== CULT.inferDefaultArchetypeForNpc(npc)) {
      return { ok: false, reason: 'incompatible-path-for-archetype', path: npc.cult.path, archetypeId: archId };
    }
    const trOrd = (npc.cult && npc.cult.track && npc.cult.track.ordinal) ? npc.cult.track.ordinal : 0;
    const effStg = npc.cult ? (CULT.normalizedStage ? Math.floor(CULT.normalizedStage(npc)) : (npc.cult.stage || 1)) : 1;
    const derivedTier = clamp(Math.max(Math.ceil(trOrd * 6 / 9), Math.ceil(effStg * 6 / 9), 1), 1, 6);
    const tier = clamp(Math.round(tierOverride != null ? tierOverride : derivedTier), 1, 6);
    npc.subpathArchetype = archId;
    npc.subpathArchetypeTier = tier;
    const tierSpec = (g.SK.ARCHETYPE_MASTERY_TIERS && g.SK.ARCHETYPE_MASTERY_TIERS[tier - 1]) || { tier, statMult: 1 + tier * 0.04 };
    const sigSkills = g.SK.getArchetypeSignatureSkills ? g.SK.getArchetypeSignatureSkills(archId, tier) : [];
    npc.unlockedArchetypeSkills = sigSkills;
    const scaledP = {}, scaledF = {};
    const mult = tierSpec.statMult || (1 + tier * 0.04);
    for (const [k, v] of Object.entries((spec.bonusStats && spec.bonusStats.p) || {})) {
      scaledP[k] = +(v * (0.5 + tier / 6)).toFixed(4);
    }
    for (const [k, v] of Object.entries((spec.bonusStats && spec.bonusStats.f) || {})) {
      scaledF[k] = Math.round(v * (0.5 + tier / 6));
    }
    npc.archetypeMasteryState = {
      archetypeId: archId,
      nameTh: spec.nameTh,
      tier,
      tierNameTh: tierSpec.nameTh,
      statMult: mult,
      p: scaledP,
      f: scaledF,
      unlockedSkills: sigSkills
    };
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return {
      ok: true,
      archetypeId: archId,
      tier,
      statMult: mult,
      bonusStats: { p: scaledP, f: scaledF },
      unlockedSkills: sigSkills
    };
  };


  /* ---------- Patch v5.3.0 [Pillar 1 & 2]: Multi-Phase Heavenly Tribulation & Path-Specific Dao Resonance ---------- */
  CULT.TRIBULATION = {
    TOTAL_TICKS: 15,
    GATHERING_END_TICK: 4,
    STRIKING_END_TICK: 11,

    // Path-Specific Breakthrough Resonance (ทัณฑ์สวรรค์แยกเอกลักษณ์ตามวิถีเต๋า)
    PATH_STYLES: {
      SWORD_METAL: {
        id: 'SWORD_METAL',
        paths: ['XIAN', 'SWORD', 'METAL', 'SHADOW_SAMURAI', 'DIVINE_CHANNELER', 'GRAVITY_DAO', 'VOID_SPACE', 'CHRONO_EPOCH'],
        nameTh: 'อัสนีบาตคมกระบี่สีเงินทอง',
        descTh: 'เมฆทัณฑ์กระบี่เงินทองคำราม เศษเสี้ยวใบกระบี่ปราณหมุนวนรับสายฟ้าสวรรค์',
        cloudColor: 'rgba(36, 48, 72, 0.84)',
        cloudRim: '#ffd166',
        boltPrimary: '#fff8d6',
        boltSecondary: '#90e0ef',
        pillarColor: '#ffd740',
        pillarCore: '#ffffff',
        emblemKind: 'sword_shards',
        icon: '⚔️'
      },
      DAO_FIRE_THUNDER: {
        id: 'DAO_FIRE_THUNDER',
        paths: ['GOD', 'BODY', 'QI', 'FIRE', 'THUNDER', 'CELESTIAL_WEATHER', 'DIVINE_SUMMONER', 'DIVINE_POSSESSION', 'PRIMORDIAL_SHIFTER', 'ARENA_GLORY', 'NINPO_ELEMENTAL'],
        nameTh: 'สายฟ้าเพลิงกาฬ 9 มังกร',
        descTh: 'อสนีบาตม่วงครามและส้มเพลิงควบแน่นเป็นมังกรสายฟ้าฟาดถล่มจากเก้าชั้นฟ้า',
        cloudColor: 'rgba(42, 18, 68, 0.86)',
        cloudRim: '#ff9e00',
        boltPrimary: '#ff6d00',
        boltSecondary: '#c77dff',
        pillarColor: '#ff9e00',
        pillarCore: '#fff3b0',
        emblemKind: 'fire_dragon_orbs',
        icon: '🐉'
      },
      DEMON_NETHER_BLOOD: {
        id: 'DEMON_NETHER_BLOOD',
        paths: ['DEMON', 'HEART_SOUL', 'MO', 'POISON', 'VENOM_GU', 'SOUL_PUPPETRY', 'NINPO_SHADOW', 'VOID_HERETIC_PACT', 'OCCULT_MAGE', 'DEVOURING_FLESH', 'NETHER_GRAVE'],
        nameTh: 'ทัณฑ์มารฟ้าหมอกโลหิตและเพลิงนรกานต์',
        descTh: 'หมอกโลหิตทมิฬปกคลุมท้องฟ้า เปลวเพลิงนรกานต์สีดำม่วงทดสอบจิตมารและตบะ',
        cloudColor: 'rgba(48, 8, 28, 0.88)',
        cloudRim: '#ff0055',
        boltPrimary: '#ff2a85',
        boltSecondary: '#9d4edd',
        pillarColor: '#ff0055',
        pillarCore: '#e0aaff',
        emblemKind: 'nether_flames',
        icon: '🩸'
      },
      WOOD_EMERALD_LOTUS: {
        id: 'WOOD_EMERALD_LOTUS',
        paths: ['SAGE_SUPPORT', 'CRAFT_CREATION', 'CRAFT', 'WOOD', 'BUDDHA_DHARMA', 'SONIC_HARMONY', 'WANDERING_DAO', 'INK_LITERATI', 'ANCESTRAL_RITUAL', 'TIDE_VOYAGER', 'LORE_ARCHIVIST', 'SPIRIT_HUSBANDRY'],
        nameTh: 'เสาแสงบัวเขียวมรกตชำระล้างไขกระดูก',
        descTh: 'เมฆปราณมรกตโปรยปรายสายฟ้าหยก ชำระล้างชีพจรและผลิดอกบัวทิพย์เก้ากลีบ',
        cloudColor: 'rgba(14, 52, 44, 0.84)',
        cloudRim: '#80ed99',
        boltPrimary: '#72efdd',
        boltSecondary: '#ffd166',
        pillarColor: '#38b000',
        pillarCore: '#b7efc5',
        emblemKind: 'emerald_lotus',
        icon: '🪷'
      },
      ARRAY_CLOCKWORK_BAGUA: {
        id: 'ARRAY_CLOCKWORK_BAGUA',
        paths: ['ARRAY_TALISMAN', 'MECH_PUPPET', 'KARMA_SAMSARA', 'STRATEGY_GOVERNANCE', 'BEAST_SOVEREIGN', 'ARRAY', 'TALISMAN', 'STRATEGY', 'ASTRO_DIVINATION', 'MERCANTILE_DAO', 'DRAGON_VEIN_GEOMANCY', 'PRIMORDIAL_CHAOS', 'FORTUNE_GAMBLER'],
        nameTh: 'วงล้อจักรกลทองเหลืองและยันต์แปดทิศสกัดสายฟ้า',
        descTh: 'วงล้อจักรกลทองเหลืองและอักขระยันต์แปดทิศหมุนสกัดรับทัณฑ์สวรรค์อย่างเที่ยงตรง',
        cloudColor: 'rgba(38, 30, 16, 0.85)',
        cloudRim: '#ffb703',
        boltPrimary: '#ffd166',
        boltSecondary: '#00f5d4',
        pillarColor: '#ffb703',
        pillarCore: '#ffffff',
        emblemKind: 'clockwork_bagua',
        icon: '☸️'
      }
    },

    resolvePathStyle(pathId) {
      const p = String(pathId || 'QI').toUpperCase();
      for (const st of Object.values(this.PATH_STYLES)) {
        if (st.paths.includes(p)) return st;
      }
      return this.PATH_STYLES.DAO_FIRE_THUNDER;
    },

    strikeCountForStage(targetStage) {
      const stg = clamp(Math.floor(Number(targetStage) || 2), 1, 9);
      if (stg <= 2) return 1;      // ขั้น 1–2: 1 สาย
      if (stg <= 4) return 3;      // ขั้น 3–4 แกนทองคำ: 3 สายฟ้าทอง
      if (stg <= 6) return 6;      // ขั้น 5–6 ก่อกำเนิดวิญญาณ: 6 สาย
      return 9;                    // ขั้น 7–9 มหาเซียน: 9 สายฟ้าม่วงมหาราช
    },

    boltLabelForStage(targetStage) {
      const stg = clamp(Math.floor(Number(targetStage) || 2), 1, 9);
      if (stg <= 2) return '1 สายฟ้าหลอมปราณ';
      if (stg <= 4) return '3 สายฟ้าทองแกนทองคำ';
      if (stg <= 6) return '6 สายฟ้าก่อกำเนิดวิญญาณ';
      return '9 สายฟ้าม่วงมหาราชมหาเซียน';
    },

    ensureRegistry(W) {
      if (!W || !W.sect) return [];
      if (!Array.isArray(W.sect.activeTribulations)) W.sect.activeTribulations = [];
      return W.sect.activeTribulations;
    },

    start(W, n, opts) {
      if (!W || !n || !n.cult || n.dead) return { ok: false, reason: 'invalid-npc' };
      opts = opts || {};
      const curStage = n.cult.stage || 1;
      const maxStg = CULT.PATHS[n.cult.path] ? CULT.PATHS[n.cult.path].maxStage : 9;
      const targetStage = clamp(curStage + 1, 1, maxStg);
      const pStyle = this.resolvePathStyle(n.cult.path);
      const totalStrikes = this.strikeCountForStage(targetStage);
      const totalTicks = clamp(Number(opts.totalTicks) || this.TOTAL_TICKS, 10, 18);

      const st = {
        active: true,
        npcId: n.id,
        npcNameTh: HC.fullName(n),
        path: n.cult.path,
        pathStyleId: pStyle.id,
        pathStyleNameTh: pStyle.nameTh,
        stageFrom: curStage,
        targetStage,
        totalStrikes,
        boltLabelTh: this.boltLabelForStage(targetStage),
        strikesLanded: 0,
        startT: W.t || 0,
        elapsedTicks: 0,
        totalTicks,
        phase: 'GATHERING',
        phaseTh: 'จังหวะที่ 1: ลมปราณหมุนวน ก่อตัวเมฆทัณฑ์สวรรค์',
        prep: opts.prep != null ? opts.prep : 0.15,
        x: Number.isFinite(n.x) ? n.x : 118,
        y: Number.isFinite(n.y) ? n.y : 75,
        resolved: false,
        outcome: null
      };
      n.tribulationState = st;

      const reg = this.ensureRegistry(W);
      const idx = reg.findIndex(x => x && x.npcId === n.id);
      if (idx >= 0) reg[idx] = st;
      else reg.push(st);

      n.fx = { t: W.t || 0, text: '⛈️ ก่อเมฆทัณฑ์สวรรค์ (' + st.boltLabelTh + ')' };
      if (opts.announce !== false) {
        const msg = '⛈️ เมฆทัณฑ์สวรรค์ก่อตัวเหนือสำนัก! ' + HC.fullName(n) + ' เริ่มเข้าฌานฝ่าด่านสู่ขั้น ' + targetStage + ' (' + pStyle.nameTh + ' · ' + st.boltLabelTh + ')';
        if (typeof W.log === 'function') W.log('breakthrough', msg, [n.id]);
      }
      return { ok: true, state: st };
    },

    tick(W, n) {
      if (!W || !n || !n.tribulationState || !n.tribulationState.active) return null;
      const st = n.tribulationState;
      if (n.dead || n.exiled || !n.cult) {
        this.cleanup(W, n);
        return null;
      }
      st.elapsedTicks = (st.elapsedTicks || 0) + 1;
      st.x = Number.isFinite(n.x) ? n.x : st.x;
      st.y = Number.isFinite(n.y) ? n.y : st.y;

      const gatherEnd = Math.max(3, Math.floor(st.totalTicks * 0.27)); // ticks 1..4
      const strikeEnd = Math.max(gatherEnd + 4, Math.floor(st.totalTicks * 0.74)); // ticks 5..11

      if (st.elapsedTicks <= gatherEnd) {
        st.phase = 'GATHERING';
        st.phaseTh = 'จังหวะที่ 1: ลมปราณหมุนวน ก่อเมฆทัณฑ์สวรรค์';
        n.h.state.qi = n.cult.path === 'SHADOW_SAMURAI' ? 0 : Math.min(CULT.qiMax(n), n.h.state.qi + 12);
        if (st.elapsedTicks === 2) {
          n.fx = { t: W.t, text: '🌀 ลมปราณหมุนวนดึงดูดทัณฑ์สวรรค์' };
        }
      } else if (st.elapsedTicks <= strikeEnd) {
        st.phase = 'STRIKING';
        const strikeSpan = Math.max(1, strikeEnd - gatherEnd);
        const strikeProg = clamp((st.elapsedTicks - gatherEnd) / strikeSpan, 0, 1);
        const targetLanded = Math.max(1, Math.min(st.totalStrikes, Math.ceil(strikeProg * st.totalStrikes)));
        if (targetLanded > st.strikesLanded) {
          st.strikesLanded = targetLanded;
          st.lastStrikeT = W.t;
          n.fx = { t: W.t, text: '⚡ อัสนีทัณฑ์ฟาดสายที่ ' + st.strikesLanded + '/' + st.totalStrikes + '!' };
        }
        st.phaseTh = 'จังหวะที่ 2: สายฟ้าทัณฑ์สวรรค์ฟาดถล่ม (' + st.strikesLanded + '/' + st.totalStrikes + ' สาย)';
      } else {
        // Phase 3: Resolution (Ascension Light Pillar or Backfire Explosion)
        if (!st.resolved) {
          st.strikesLanded = st.totalStrikes;
          // Ensure threshold requirement is satisfied if triggered via ritual/ready state
          const need = CULT.threshold(n);
          if (Number.isFinite(need) && n.cult.prog < need) {
            n.cult.prog = need;
          }
          const prepArg = (st.prep && typeof st.prep === 'object') ? st.prep : { env: 0.05, pill: Number(st.prep) || 0 };
          const res = CULT.breakthrough(W, n, prepArg);
          const _tribLabel = st.pathStyleNameTh || st.styleTh || st.boltLabelTh;
          const tribTitle = _tribLabel ? ('「' + _tribLabel + '」') : '';
          if (res && res.ok) {
            const scarNote = (st.totalStrikes >= 6 && !n.dead) ? ' ทิ้งรอยจารึก「แผลเป็นทัณฑ์สวรรค์」ติดกายเป็นเกียรติยศ' : '';
            if (typeof W.log === 'function') W.log('breakthrough', '⚡ ' + n.h.name.given + ' ยืนหยัดรับทัณฑ์สวรรค์' + tribTitle + 'ครบ ' + st.totalStrikes + ' สาย ทะลวงสู่ ' + CULT.stageName(n) + ' สำเร็จ!' + scarNote, [n.id]);
            if (g.SIM && g.SIM.PROSE && g.SIM.PROSE.recordLifeChapter) g.SIM.PROSE.recordLifeChapter(W, n, 'ฝ่าทัณฑ์สวรรค์ ' + st.totalStrikes + ' สาย ทะลวงสู่ ' + CULT.stageName(n), 'tribulation');
          } else if (res) {
            const protNote = res.ancestralProtected ? ' ทว่า「พรพิทักษ์บรรพชน」ส่องประกายรับเคราะห์แทน รักษาชีวิตไว้ได้!' : '';
            const _RISK_TH = {
              DEMONIC_BACKLASH_FRENZY: 'ปราณมารย้อนคลั่ง',
              SOUL_SHATTER_ILLUSION_LOST: 'จิตวิญญาณแตกซ่านหลงมายา',
              QI_DEVIATION_SEVERE: 'ธาตุไฟเข้าแทรกขั้นรุนแรง',
              MERIDIAN_RUPTURE: 'ชีพจรฉีกขาด',
              HEART_DEMON_SEIZURE: 'มารใจเข้าครอบงำ',
              LIFESPAN_BURN: 'อายุขัยถูกเผาผลาญ',
              DAO_FOUNDATION_CRACK: 'รากฐานเต๋าแตกร้าว'
            };
            const riskTh = res.supremeRisk ? (_RISK_TH[res.supremeRisk] || String(res.supremeRisk).replace(/_/g, ' ')) : '';
            const riskNote = riskTh ? (' (' + riskTh + ')') : '';
            if (typeof W.log === 'function') W.log('breakthrough', '💥 ' + n.h.name.given + ' ฝ่าทัณฑ์สวรรค์' + tribTitle + 'ล้มเหลว (โอกาส ' + Math.round((res.p || 0) * 100) + '%) ตบะย้อนกลับ' + riskNote + protNote, [n.id]);
          }
          st.resolved = true;
          st.outcome = res;
          if (st.totalStrikes >= 6 && !n.dead && CULT.grantAcquiredTrait) {
            CULT.grantAcquiredTrait(n, 'TR_AC_TRIBULATION_SCAR');
          }
          if (res && res.ok) {
            st.phase = 'ASCENSION';
            st.phaseTh = 'จังหวะที่ 3: เสาแสงบรรลุมรรคาทะลวงขั้น สำเร็จขั้น ' + (n.cult ? n.cult.stage : st.targetStage) + '!';
            n.fx = { t: W.t, text: '🌟 เสาแสงบรรลุมรรคาทะลวงขั้น!' };
          } else {
            st.phase = 'BACKFIRE';
            st.phaseTh = 'จังหวะที่ 3: ทัณฑ์สวรรค์ย้อนกลับ ปราณแตกซ่าน!';
            n.fx = { t: W.t, text: '💥 ทัณฑ์สวรรค์ย้อนกลับ ควันดำระเบิด!' };
          }
        }
        if (st.elapsedTicks >= st.totalTicks) {
          const finalOut = st.outcome;
          this.cleanup(W, n);
          return finalOut;
        }
      }
      return st;
    },

    cleanup(W, n) {
      if (n && n.tribulationState) {
        n.tribulationState.active = false;
        n.lastTribulationOutcome = n.tribulationState.outcome || null;
        delete n.tribulationState;
      }
      if (W && W.sect && Array.isArray(W.sect.activeTribulations)) {
        W.sect.activeTribulations = W.sect.activeTribulations.filter(x => x && x.active && x.npcId !== (n && n.id));
      }
    },

    tickAll(W) {
      if (!W || !W.sect || !Array.isArray(W.sect.activeTribulations) || !W.sect.activeTribulations.length) return;
      const list = W.sect.activeTribulations.slice();
      for (let i = 0; i < list.length; i++) {
        const entry = list[i];
        const npc = entry && W.byId && W.byId[entry.npcId];
        if (!npc || npc.dead || npc.exiled || !npc.tribulationState || !npc.tribulationState.active) {
          this.cleanup(W, npc || { id: entry && entry.npcId });
          continue;
        }
        // If NPC is actively running AI.ACTS.breakthrough in stage 'do', AI.ACTS.breakthrough.tick will call tick()
        const inAiDo = npc.act && npc.act.id === 'breakthrough' && npc.act.stage === 'do' && !entry.standaloneRitual;
        const workStamp=Number.isSafeInteger(W.workSteps)?W.workSteps:W.t;
        if (!inAiDo && entry.lastTickAllWorkStep !== workStamp) {
          entry.lastTickAllWorkStep = workStamp;
          this.tick(W, npc);
        }
      }
    }
  };


  /* =========================================================================
   * PATCH v2.0.0: PILLAR 1 — MORTAL CULTIVATION INITIATION LIFECYCLE
   * (ระบบวัฏจักรคนธรรมดาเริ่มต้นบำเพ็ญเพียร & ทะลวงเส้นลมปราณเปิดตันเถียน)
   * ========================================================================= */
  CULT.MORTAL_INITIATION = {
    QI_FOUNDATION_MAX: 100,
    DAO_COMPREHENSION_MAX: 100,

    ensureMortalState(npc, W) {
      if (!npc || npc.foe) return null;
      if (npc.cult) return null; // Already awakened cultivator
      if (!npc.mortalCult || typeof npc.mortalCult !== 'object') {
        npc.mortalCult = {
          qiFoundation: 0,
          daoComprehension: 0,
          targetPath: null,
          targetSub: null,
          studySessions: 0,
          gatherSessions: 0,
          enlightenedByCrystal: null,
          startedDay: (W && W.day) || 1,
          lastProgressDay: (W && W.day) || 1
        };
      }
      if (!npc.mortalCult.targetPath && W) {
        this.chooseMortalStudyPath(W, npc);
      }
      return npc.mortalCult;
    },

    getUnlockedSectPaths(W) {
      if (g.SECT && g.SECT.PATH_LIBRARY && typeof g.SECT.PATH_LIBRARY.getUnlockedPaths === 'function') {
        return g.SECT.PATH_LIBRARY.getUnlockedPaths(W);
      }
      if (W && W.sect && W.sect.pathLibrary && Array.isArray(W.sect.pathLibrary.unlockedPaths) && W.sect.pathLibrary.unlockedPaths.length) {
        return W.sect.pathLibrary.unlockedPaths.slice();
      }
      const starterPath = (g.SECT && g.SECT.PATH_LIBRARY && typeof g.SECT.PATH_LIBRARY.resolveStarterPath === 'function')
        ? g.SECT.PATH_LIBRARY.resolveStarterPath(W)
        : 'XIAN';
      return [CULT.PATHS[starterPath] ? starterPath : 'XIAN'];
    },

    chooseMortalStudyPath(W, npc, opts) {
      opts = opts || {};
      if (!npc || !npc.h) return null;
      const mc = npc.mortalCult || { qiFoundation: 0, daoComprehension: 0 };
      if (mc.enlightenedByCrystal && CULT.PATHS[mc.enlightenedByCrystal] && !opts.forceRechoose) {
        const pId = mc.enlightenedByCrystal;
        const branches = CULT.pathScores(npc).filter(x => x.path === pId);
        const bestSub = (branches[0] && branches[0].sub) || (CULT.PATHS[pId].subPaths[0] && CULT.PATHS[pId].subPaths[0].id) || 'NONE';
        mc.targetPath = pId;
        mc.targetSub = bestSub;
        npc.mortalCult = mc;
        return { path: pId, sub: bestSub, crystal: true };
      }
      const unlocked = this.getUnlockedSectPaths(W);
      const allowedSet = new Set(unlocked.filter(p => CULT.PATHS[p]));
      if (!allowedSet.size) allowedSet.add('XIAN');
      const rootGrade = (npc.h && npc.h.root && npc.h.root.grade) || 'MORTAL';
      const rootScore = (npc.h && npc.h.root && Number.isFinite(npc.h.root.aggregateScore)) ? npc.h.root.aggregateScore : 2.0;
      const isWeakRoot = rootGrade === 'DEFECTIVE' || rootScore <= 1.15;
      if (isWeakRoot && CULT.PATHS.BODY && (mc.studySessions >= 3 || (HC.eff(npc, 'personality.discipline') || 50) >= 48)) {
        allowedSet.add('BODY');
      }

      const allMajor = CULT.majorPathScores(npc).filter(x => allowedSet.has(x.path)).map(x => {
        if (isWeakRoot && x.path === 'BODY') return Object.assign({}, x, { score: x.score + 16 });
        if (isWeakRoot && (x.path === 'XIAN' || x.path === 'CHRONO_EPOCH' || x.path === 'VOID_SPACE')) return Object.assign({}, x, { score: x.score - 8 });
        return x;
      }).sort((a, b) => b.score - a.score);
      const chosenMajor = allMajor.length ? allMajor[0].path : Array.from(allowedSet)[0];
      const branches = CULT.pathScores(npc).filter(x => x.path === chosenMajor);
      const chosenSub = (branches[0] && branches[0].sub) || (CULT.PATHS[chosenMajor] && CULT.PATHS[chosenMajor].subPaths[0] && CULT.PATHS[chosenMajor].subPaths[0].id) || 'NONE';

      mc.targetPath = chosenMajor;
      mc.targetSub = chosenSub;
      npc.mortalCult = mc;
      return { path: chosenMajor, sub: chosenSub };
    },

    computeStudyGain(W, npc, dtHours, envMult) {
      const h = (npc && npc.h) || {};
      const comp = (HC.eff(npc, 'intellect.comprehension') + HC.eff(npc, 'intellect.learningSpeed') + HC.eff(npc, 'aptitudes.comprehension')) / 3;
      const rootScore = (h.root && Number.isFinite(h.root.aggregateScore)) ? h.root.aggregateScore : 2.0;
      const rootFactor = 0.70 + rootScore * 0.16;
      const env = Math.max(0.8, Number(envMult) || 1.0);
      const rawHrs = Number(dtHours);
      const hrs = Math.max(1e-4, Number.isFinite(rawHrs) && rawHrs > 0 ? rawHrs : (1 / 60));
      const paceScale = hrs < 0.45 ? 0.22 : 1.0;
      return +(hrs * (2.6 + (comp / 100) * 3.8) * rootFactor * env * paceScale).toFixed(4);
    },

    computeQiGatherGain(W, npc, dtHours, envMult) {
      const h = (npc && npc.h) || {};
      const mc = this.ensureMortalState(npc, W);
      const isBodyRoute = mc && mc.targetPath === 'BODY';
      const cultApt = isBodyRoute
        ? (HC.eff(npc, 'physiology.strength') + HC.eff(npc, 'physiology.vitality') + HC.eff(npc, 'physiology.endurance')) / 3
        : (HC.eff(npc, 'aptitudes.cultivation') + HC.eff(npc, 'physiology.meridianCapacity') + HC.eff(npc, 'physiology.spiritualFoundation')) / 3;
      const rootScore = (h.root && Number.isFinite(h.root.aggregateScore)) ? h.root.aggregateScore : 2.0;
      const rootFactor = isBodyRoute ? Math.max(0.88, 0.78 + rootScore * 0.12) : (0.68 + rootScore * 0.18);
      const daoBonus = 1 + ((mc ? (mc.daoComprehension || 0) : 0) / 100) * 0.75;
      const env = Math.max(0.8, Number(envMult) || 1.0);
      const rawHrs = Number(dtHours);
      const hrs = Math.max(1e-4, Number.isFinite(rawHrs) && rawHrs > 0 ? rawHrs : (1 / 60));
      const paceScale = hrs < 0.45 ? 0.22 : 1.0;
      return +(hrs * (2.2 + (cultApt / 100) * 3.6) * rootFactor * daoBonus * env * paceScale).toFixed(4);
    },

    stepStudyDao(W, npc, dtHours, envMult) {
      if (!npc || npc.dead || npc.cult) return { ok: false, reason: 'not-mortal' };
      const mc = this.ensureMortalState(npc, W);
      const weakBodyHoldout = mc.targetPath === 'BODY' && (((npc.h && npc.h.root && npc.h.root.grade) || '') === 'DEFECTIVE' || ((npc.h && npc.h.root && npc.h.root.aggregateScore) || 2) <= 1.15);
      if (!mc.targetPath || (!mc.enlightenedByCrystal && !weakBodyHoldout && !this.getUnlockedSectPaths(W).includes(mc.targetPath))) {
        this.chooseMortalStudyPath(W, npc, { forceRechoose: true });
      }
      const rawHrs = Number(dtHours);
      const hrs = Math.max(1e-4, Number.isFinite(rawHrs) && rawHrs > 0 ? rawHrs : (1 / 60));
      const gain = this.computeStudyGain(W, npc, hrs, envMult || 1.0);
      mc.daoComprehension = clamp(+((mc.daoComprehension || 0) + gain).toFixed(3), 0, this.DAO_COMPREHENSION_MAX);
      mc.qiFoundation = clamp(+((mc.qiFoundation || 0) + gain * 0.35).toFixed(3), 0, this.QI_FOUNDATION_MAX);
      mc._studyHrsAcc = (mc._studyHrsAcc || 0) + hrs;
      if (hrs >= 0.25 || mc._studyHrsAcc >= 0.95) {
        mc.studySessions = (mc.studySessions || 0) + 1;
        mc._studyHrsAcc = 0;
      }
      mc.lastProgressDay = (W && W.day) || 1;
      if (npc.h && npc.h.skills) {
        npc.h.skills.SCRIPTURE = Math.min(100, +((npc.h.skills.SCRIPTURE || 0) + 0.18 * Math.min(1, hrs)).toFixed(3));
      }
      if (mc.qiFoundation >= this.QI_FOUNDATION_MAX) {
        return this.triggerMeridianBreakthrough(W, npc);
      }
      return { ok: true, daoComprehension: mc.daoComprehension, qiFoundation: mc.qiFoundation, targetPath: mc.targetPath, targetSub: mc.targetSub };
    },

    stepGatherQi(W, npc, dtHours, envMult) {
      if (!npc || npc.dead || npc.cult) return { ok: false, reason: 'not-mortal' };
      const mc = this.ensureMortalState(npc, W);
      const weakBodyHoldout = mc.targetPath === 'BODY' && (((npc.h && npc.h.root && npc.h.root.grade) || '') === 'DEFECTIVE' || ((npc.h && npc.h.root && npc.h.root.aggregateScore) || 2) <= 1.15);
      if (!mc.targetPath || (!mc.enlightenedByCrystal && !weakBodyHoldout && !this.getUnlockedSectPaths(W).includes(mc.targetPath))) {
        this.chooseMortalStudyPath(W, npc, { forceRechoose: true });
      }
      const rawHrs = Number(dtHours);
      const hrs = Math.max(1e-4, Number.isFinite(rawHrs) && rawHrs > 0 ? rawHrs : (1 / 60));
      const gain = this.computeQiGatherGain(W, npc, hrs, envMult || 1.15);
      mc.qiFoundation = clamp(+((mc.qiFoundation || 0) + gain).toFixed(3), 0, this.QI_FOUNDATION_MAX);
      mc.daoComprehension = clamp(+((mc.daoComprehension || 0) + gain * 0.20).toFixed(3), 0, this.DAO_COMPREHENSION_MAX);
      mc._gatherHrsAcc = (mc._gatherHrsAcc || 0) + hrs;
      if (hrs >= 0.25 || mc._gatherHrsAcc >= 0.95) {
        mc.gatherSessions = (mc.gatherSessions || 0) + 1;
        mc._gatherHrsAcc = 0;
      }
      mc.lastProgressDay = (W && W.day) || 1;
      if (mc.qiFoundation >= this.QI_FOUNDATION_MAX) {
        return this.triggerMeridianBreakthrough(W, npc);
      }
      return { ok: true, qiFoundation: mc.qiFoundation, daoComprehension: mc.daoComprehension, targetPath: mc.targetPath, targetSub: mc.targetSub };
    },

    triggerMeridianBreakthrough(W, npc, opts) {
      opts = opts || {};
      if (!npc || npc.dead) return { ok: false, reason: 'invalid-npc' };
      if (npc.cult && !opts.forceReawaken) return { ok: false, reason: 'already-cultivator', cult: npc.cult };
      ELEM.ensureNpc(npc);
      const mc = this.ensureMortalState(npc, W) || { qiFoundation: 100, daoComprehension: 100 };
      if (!opts.force && (mc.qiFoundation || 0) < this.QI_FOUNDATION_MAX) {
        return { ok: false, reason: 'insufficient-qi-foundation', qiFoundation: mc.qiFoundation || 0 };
      }

      let pathId = opts.path || mc.enlightenedByCrystal || mc.targetPath;
      const unlocked = this.getUnlockedSectPaths(W);
      const weakBodyBypass = pathId === 'BODY' && (((npc.h && npc.h.root && npc.h.root.grade) || '') === 'DEFECTIVE' || ((npc.h && npc.h.root && npc.h.root.aggregateScore) || 2) <= 1.15);
      if (!pathId || !CULT.PATHS[pathId] || (!mc.enlightenedByCrystal && !weakBodyBypass && !opts.ignoreLibraryLock && unlocked.length && !unlocked.includes(pathId))) {
        const chosen = this.chooseMortalStudyPath(W, npc, { forceRechoose: true });
        pathId = (chosen && chosen.path) || unlocked[0] || 'XIAN';
      }
      const pathDef = CULT.PATHS[pathId] || CULT.PATHS.XIAN;
      const branches = CULT.pathScores(npc).filter(x => x.path === pathId);
      const subId = (opts.sub && pathDef.subPaths.some(s => s.id === opts.sub))
        ? opts.sub
        : (mc.targetSub && pathDef.subPaths.some(s => s.id === mc.targetSub))
          ? mc.targetSub
          : (branches[0] && branches[0].sub) || (pathDef.subPaths[0] && pathDef.subPaths[0].id) || 'NONE';

      const day = (W && W.day) || 1;
      const mant = CULT.bestMantra(pathId, 1, npc);
      const starterTechs = [];
      if (JD.TECH && Array.isArray(JD.TECH.techniques)) {
        const isStarterCombatTech = t => t && (t.tier || 1) === 1 && !t.passive && !t.innateOnly && !/PASSIVE|INNATE|MANTRA/.test(t.cat || '');
        const tCand = JD.TECH.techniques.find(t => isStarterCombatTech(t) && t.path === pathId && t.sub === subId && (!ELEM.canUseTech || ELEM.canUseTech(npc, t))) ||
                      JD.TECH.techniques.find(t => isStarterCombatTech(t) && t.path === pathId && (!t.element || t.element === 'NEUTRAL' || (t.elementProfile && t.elementProfile.mode === 'EXPLICIT_NON_ELEMENTAL'))) ||
                      JD.TECH.techniques.find(t => isStarterCombatTech(t) && t.path === pathId);
        if (tCand) starterTechs.push(tCand.id);
      }

      npc.cult = {
        path: pathId,
        sub: subId,
        stage: 1,
        prog: 0,
        mantra: mant ? mant.id : null,
        techs: starterTechs,
        learning: null,
        toxic: 0,
        lifeBonus: 0,
        since: day,
        attempts: 0,
        secl: null,
        rate: 0,
        pillT: 0,
        awakenedFromMortal: true,
        awakenedDay: day
      };

      if (CULT.initTrack) {
        npc.cult.track = CULT.initTrack(subId, 1, day);
      }
      if (g.MARTIAL && g.MARTIAL.reconcileInnate) {
        g.MARTIAL.reconcileInnate(npc, W);
      }
      if (g.MARTIAL && g.MARTIAL.reconcilePassives) {
        g.MARTIAL.reconcilePassives(npc);
      }
      ELEM.syncSpecialAccess(npc);
      CULT.ensurePathGauge(npc);
      if (CULT.SECONDARY_RESOURCES && CULT.SECONDARY_RESOURCES.ensureState) {
        CULT.SECONDARY_RESOURCES.ensureState(npc);
      }
      if (CULT.evaluateSubpathArchetypeMastery) CULT.evaluateSubpathArchetypeMastery(npc);
      if (CULT.GRAND_DAO_MECHANICS && CULT.GRAND_DAO_MECHANICS.ensureNpcState) {
        CULT.GRAND_DAO_MECHANICS.ensureNpcState(W, npc);
      }
      if (CULT.evaluateAutonomousPostures) {
        CULT.evaluateAutonomousPostures(W, npc, { trigger: 'awaken' });
      }
      CULT.refreshLifespan(npc);
      if ((npc.rank || 0) === 0) npc.rank = 1;
      if (npc.h && npc.h.state) {
        npc.h.state.hp = CULT.hpMax(npc);
        npc.h.state.qi = CULT.qiMax(npc);
      }
      npc.mortalCult = Object.assign({}, mc, {
        qiFoundation: 100,
        daoComprehension: Math.max(50, mc.daoComprehension || 50),
        awakened: true,
        awakenedDay: day,
        awakenedPath: pathId,
        awakenedSub: subId
      });

      if (W && W.sect) {
        W.sect.mortalAwakeningsCount = (W.sect.mortalAwakeningsCount || 0) + 1;
        W.sect.mortalAwakeningHistory = Array.isArray(W.sect.mortalAwakeningHistory) ? W.sect.mortalAwakeningHistory : [];
        const subObj = CULT.subInfo(pathId, subId);
        const stg1Name = (pathDef.stages && pathDef.stages[0] && pathDef.stages[0].nameTh) || 'ขั้นที่ 1 กลั่นลมปราณ';
        const logMsg = '🌅 ' + HC.fullName(npc) + ' ทะลวงเส้นลมปราณเปิดตันเถียนสำเร็จ ก้าวเข้าสู่ขอบเขต' + stg1Name + ' แห่ง「' + pathDef.nameTh + ' · ' + (subObj ? subObj.nameTh : subId) + '」!';
        W.sect.mortalAwakeningHistory.unshift({
          day,
          npcId: npc.id,
          npcNameTh: HC.fullName(npc),
          path: pathId,
          pathNameTh: pathDef.nameTh,
          sub: subId,
          subNameTh: subObj ? subObj.nameTh : subId,
          stageNameTh: stg1Name,
          messageTh: logMsg
        });
        if (W.sect.mortalAwakeningHistory.length > 40) W.sect.mortalAwakeningHistory.length = 40;
        if (typeof W.log === 'function' && !opts.quiet) {
          W.log('breakthrough', logMsg, [npc.id]);
        }
      }
      npc.fx = { t: (W && W.t) || 0, text: '🌅 เปิดตันเถียนสำเร็จ! (' + pathDef.shortTh + ')' };
      HC.bump(npc);
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return {
        ok: true,
        awakened: true,
        npcId: npc.id,
        path: pathId,
        sub: subId,
        stage: 1,
        cult: npc.cult
      };
    },

    bestowPathCrystal(W, npc, pathId, opts) {
      opts = opts || {};
      if (!npc || npc.dead) return { ok: false, reason: 'invalid-npc' };
      const pKey = String(pathId || '').replace(/^CRYSTAL_PATH_/, '').trim().toUpperCase();
      if (!CULT.PATHS[pKey]) return { ok: false, reason: 'invalid-path', pathId: pKey };
      const itemId = 'CRYSTAL_PATH_' + pKey;

      if (!opts.free && W && W.sect && g.ECO) {
        if (g.ECO.count(W, itemId) > 0) {
          g.ECO.take(W, itemId, 1);
        } else if (npc.inv && npc.inv.mats && npc.inv.mats[itemId] > 0) {
          npc.inv.mats[itemId]--;
          if (npc.inv.mats[itemId] <= 0) delete npc.inv.mats[itemId];
        } else {
          return { ok: false, reason: 'missing-crystal', itemId };
        }
      }

      if (!npc.cult) {
        const mc = this.ensureMortalState(npc, W);
        mc.enlightenedByCrystal = pKey;
        mc.targetPath = pKey;
        mc.daoComprehension = 100;
        mc.qiFoundation = 100;
        return this.triggerMeridianBreakthrough(W, npc, { path: pKey, force: true, ignoreLibraryLock: true, quiet: opts.quiet });
      } else {
        if (opts.disallowCultivator) return { ok: false, reason: 'already-cultivator', pathId: npc.cult.path };
        const pathDef = CULT.PATHS[pKey];
        const branches = CULT.pathScores(npc).filter(x => x.path === pKey);
        const subId = (opts.sub && pathDef.subPaths.some(s => s.id === opts.sub))
          ? opts.sub
          : (branches[0] && branches[0].sub) || (pathDef.subPaths[0] && pathDef.subPaths[0].id) || 'NONE';
        npc.cult.path = pKey;
        npc.cult.sub = subId;
        npc.cult.stage = Math.min(npc.cult.stage || 1, pathDef.maxStage || 9);
        if (Array.isArray(npc.cult.unlockedMantras)) {
          npc.cult.unlockedMantras = npc.cult.unlockedMantras.filter(id => {
            const mObj = TECH_BY_ID[id];
            return !!(mObj && (mObj.path === 'ANY' || mObj.path === pKey));
          });
        }
        const mant = CULT.bestMantra(pKey, npc.cult.stage || 1, npc);
        npc.cult.mantra = mant ? mant.id : null;
        if (Array.isArray(npc.cult.techs)) {
          npc.cult.techs = npc.cult.techs.filter(id => {
            const tObj = TECH_BY_ID[id];
            if (!tObj) return false;
            if (tObj.legendary || tObj.isSectHeritage || tObj.path === 'ANY' || tObj.path === pKey) {
              return CULT.isSubCompatible ? CULT.isSubCompatible(tObj, subId, false) : (!tObj.sub || tObj.sub === subId);
            }
            return false;
          });
          if (!npc.cult.techs.length && JD.TECH && Array.isArray(JD.TECH.techniques)) {
            const isStarterCombatTech = t => t && (t.tier || 1) === 1 && !t.passive && !t.innateOnly && !/PASSIVE|INNATE|MANTRA/.test(t.cat || '');
            const tCand = JD.TECH.techniques.find(t => isStarterCombatTech(t) && t.path === pKey && t.sub === subId) ||
                          JD.TECH.techniques.find(t => isStarterCombatTech(t) && t.path === pKey);
            if (tCand) npc.cult.techs.push(tCand.id);
          }
        }
        npc.passiveLoadout = [];
        if (CULT.initTrack) npc.cult.track = CULT.initTrack(subId, Math.min(9, npc.cult.stage || 1), (W && W.day) || 1);
        if (g.MARTIAL && g.MARTIAL.reconcileInnate) g.MARTIAL.reconcileInnate(npc, W);
        if (g.MARTIAL && g.MARTIAL.reconcilePassives) g.MARTIAL.reconcilePassives(npc);
        if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(npc);
        npc.pathGauge = null;
        npc.secondaryResources = { FROST_QI: 0, KILLING_INTENT: 0, FORMATION_INK: 0, MECH_GEARS: 0 };
        CULT.ensurePathGauge(npc);
        if (CULT.evaluateSubpathArchetypeMastery) CULT.evaluateSubpathArchetypeMastery(npc);
        if (CULT.GRAND_DAO_MECHANICS && CULT.GRAND_DAO_MECHANICS.ensureNpcState) {
          CULT.GRAND_DAO_MECHANICS.ensureNpcState(W, npc);
        }
        ELEM.syncSpecialAccess(npc);
        CULT.refreshLifespan(npc);
        if (npc.h && npc.h.state) {
          npc.h.state.hp = Math.min(npc.h.state.hp, CULT.hpMax(npc));
          npc.h.state.qi = pKey === 'SHADOW_SAMURAI' ? 0 : Math.min(npc.h.state.qi || 0, CULT.qiMax(npc));
        }
        HC.bump(npc);
        if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
        if (W && typeof W.log === 'function' && !opts.quiet) {
          W.log('breakthrough', '💎 ' + HC.fullName(npc) + ' ดูดซับผลึกมรดกวิถี เปลี่ยนสู่มหาวิถี「' + pathDef.nameTh + '」สำเร็จ!', [npc.id]);
        }
        return { ok: true, converted: true, npcId: npc.id, path: pKey, sub: subId };
      }
    },

    monthlyTick(W) {
      if (!W || !Array.isArray(W.npcs)) return { checked: 0, awakened: 0 };
      let checked = 0, awakened = 0;
      for (let i = 0; i < W.npcs.length; i++) {
        const n = W.npcs[i];
        if (!n || n.dead || n.exiled || n.cult) continue;
        checked++;
        const mc = this.ensureMortalState(n, W);
        const drive = ((HC.eff(n, 'personality.ambition') || 50) * 0.35 + (HC.eff(n, 'personality.discipline') || 50) * 0.35 + (HC.eff(n, 'personality.curiosity') || 50) * 0.30) / 100;
        if (drive < 0.32 && (mc.studySessions || 0) === 0 && (mc.gatherSessions || 0) === 0 && !mc.enlightenedByCrystal) continue;
        const hrsScale = clamp(drive * 1.15, 0.35, 1.35);
        this.stepStudyDao(W, n, +(0.30 * hrsScale).toFixed(3), 1.0);
        if (!n.cult && mc.qiFoundation < 100) {
          this.stepGatherQi(W, n, +(0.35 * hrsScale).toFixed(3), 1.05);
        }
        if (n.cult) awakened++;
      }
      if (CULT.GRAND_DAO_MECHANICS && typeof CULT.GRAND_DAO_MECHANICS.monthlyAutonomousTick === 'function') {
        CULT.GRAND_DAO_MECHANICS.monthlyAutonomousTick(W);
      }
      return { checked, awakened };
    }
  };

  /* =========================================================================
   * PATCH v2.0.0: PILLAR 3 — GRAND DAO MECHANICS & WORLD-SYSTEM INTEGRATION
   * (ระบบกลไกเอกลักษณ์ 15 มหาวิถีใหม่ + คุณสมบัติขั้นวิถี/สายย่อย + ระบบโลก)
   * ========================================================================= */
  CULT.GRAND_DAO_MECHANICS = {
    ensureWorldState(W) {
      if (!W || !W.sect) return null;
      if (!W.sect.contractLedger || typeof W.sect.contractLedger !== 'object') {
        W.sect.contractLedger = {
          seq: 1,
          contracts: [],
          activeCount: 0,
          settledCount: 0,
          breachedCount: 0,
          escrowStones: 0
        };
      }
      if (!W.sect.geomancyState || typeof W.sect.geomancyState !== 'object') {
        W.sect.geomancyState = {
          anchoredNodes: {},
          totalInvestedStones: 0,
          leylineShieldBonusPct: 0,
          cultAuraBonusPct: 0
        };
      }
      if (!W.sect.activeWeatherMelody || typeof W.sect.activeWeatherMelody !== 'object') {
        W.sect.activeWeatherMelody = {
          active: false,
          weatherKind: null,
          casterId: null,
          untilDay: 0,
          bonusPct: 0
        };
      }
      return {
        contractLedger: W.sect.contractLedger,
        geomancyState: W.sect.geomancyState,
        activeWeatherMelody: W.sect.activeWeatherMelody
      };
    },

    ensureNpcState(W, npc) {
      if (!npc || npc.foe) return null;
      const pKey = (npc.cult && npc.cult.path) || 'XIAN';
      if (!npc.grandDaoState || typeof npc.grandDaoState !== 'object') {
        npc.grandDaoState = {
          path: pKey,
          starDestinyStacks: 0,
          bodhiMeritStacks: 0,
          voidPocketCharges: 1,
          harmonicChordNotes: [],
          symbioticGuTier: 1,
          atavismForm: null,
          skyQiSync: false,
          routeInsightPoints: 0,
          activeContractIds: [],
          anchoredVeinId: null,
          gravityFieldMode: 'BALANCED',
          temporalSnapshot: null,
          imperialEdictActive: null,
          marionetteLinks: 1,
          chaosEntropyStacks: 0
        };
      }
      npc.grandDaoState.path = pKey;
      return npc.grandDaoState;
    },

    // Evaluate active Path Realm Traits (Stages 2, 4, 6, 8) and Subpath Milestone Traits (Realms 3, 6, 9)
    getActiveTraits(npc) {
      if (!npc || !npc.cult) return { pathTraits: [], subpathTraits: [], allTraits: [] };
      const c = npc.cult;
      const pDef = CULT.PATHS[c.path];
      const stg = c.stage || 1;
      const normStg = CULT.normalizedStage ? Math.floor(CULT.normalizedStage(npc)) : stg;
      const effStg = Math.max(stg, normStg);
      const pathTraits = (pDef && Array.isArray(pDef.realmTraits))
        ? pDef.realmTraits.filter(rt => {
            if (!rt) return false;
            const req = rt.stageReq != null ? rt.stageReq : (rt.stage != null ? rt.stage : 2);
            return effStg >= req || stg >= req;
          })
        : [];
      const sDef = CULT.subInfo(c.path, c.sub);
      const trOrd = Math.max((c.track && c.track.ordinal) || 0, effStg);
      const subpathTraits = (sDef && Array.isArray(sDef.subpathTraits))
        ? sDef.subpathTraits.filter(st => {
            if (!st) return false;
            const req = st.realmReq != null ? st.realmReq : (st.realm != null ? st.realm : 3);
            return trOrd >= req;
          })
        : [];
      return {
        pathTraits,
        subpathTraits,
        allTraits: pathTraits.concat(subpathTraits)
      };
    },

    // 1. CELESTIAL_WEATHER: Harmonize Sky Qi with W.weather (Single Active Field Weather Melody Cap)
    harmonizeSkyWeather(W, npc, targetWeatherKind) {
      if (!W || !W.sect || !npc || !npc.cult || npc.cult.path !== 'CELESTIAL_WEATHER') {
        return { ok: false, reason: 'requires-celestial-weather-path' };
      }
      this.ensureWorldState(W);
      this.ensureNpcState(W, npc);
      const validWeathers = ['clear', 'rain', 'snow', 'storm', 'thunder_tempest', 'spirit_aurora', 'crimson_sun'];
      const wKind = validWeathers.includes(targetWeatherKind) ? targetWeatherKind : ((W.weather && W.weather.kind) || 'thunder_tempest');
      W.weather = { kind: wKind, timer: 720, changedBy: npc.id };
      // Single active field weather melody cap: overwrites any previous melody
      W.sect.activeWeatherMelody = {
        active: true,
        weatherKind: wKind,
        casterId: npc.id,
        casterNameTh: HC.fullName(npc),
        untilDay: (W.day || 1) + 3,
        bonusPct: +Math.min(0.28, 0.10 + (npc.cult.stage || 1) * 0.02).toFixed(3)
      };
      npc.grandDaoState.skyQiSync = true;
      CULT.gainPathGauge(npc, 35);
      return { ok: true, weatherKind: wKind, melody: W.sect.activeWeatherMelody };
    },

    // 2. WANDERING_DAO: Route Insight & Real Travel/Hazard Reduction in EXPLORE & EXPED
    gainRouteInsight(W, npc, amount) {
      if (!npc || !npc.cult) return 0;
      const st = this.ensureNpcState(W, npc);
      const add = Math.max(1, Number(amount) || 10);
      st.routeInsightPoints = clamp((st.routeInsightPoints || 0) + add, 0, 500);
      if (npc.cult.path === 'WANDERING_DAO') {
        CULT.gainPathGauge(npc, add);
      }
      return st.routeInsightPoints;
    },

    evaluateWanderingPartyBonus(W, members) {
      const list = Array.isArray(members) ? members.filter(Boolean) : [];
      let wanderers = 0;
      let bestStage = 0;
      for (let i = 0; i < list.length; i++) {
        const m = list[i];
        if (m && m.cult && m.cult.path === 'WANDERING_DAO') {
          wanderers++;
          if ((m.cult.stage || 1) > bestStage) bestStage = m.cult.stage || 1;
        }
      }
      if (!wanderers) return { active: false, travelTimeMult: 1.0, hazardReduction: 0, supplySavePct: 0 };
      const travelTimeMult = +Math.max(0.68, 1 - (0.10 + bestStage * 0.025 + Math.min(2, wanderers - 1) * 0.04)).toFixed(3);
      const hazardReduction = +Math.min(0.35, 0.12 + bestStage * 0.025).toFixed(3);
      const supplySavePct = +Math.min(0.30, 0.10 + bestStage * 0.02).toFixed(3);
      return { active: true, wanderers, bestStage, travelTimeMult, hazardReduction, supplySavePct };
    },

    // 3. MERCANTILE_DAO: Contract Ledger (OFFERED, ACTIVE, SETTLED, BREACHED) with Strict Zero-Free-Resource Conservation
    offerContract(W, npc, opts) {
      opts = opts || {};
      if (!W || !W.sect) return { ok: false, reason: 'no-world' };
      this.ensureWorldState(W);
      const ledger = W.sect.contractLedger;
      const principal = Math.max(10, Math.min(5000, Math.round(Number(opts.principalStones) || 100)));
      const cid = 'CTR_' + (W.day || 1) + '_' + (ledger.seq++);
      const contract = {
        id: cid,
        state: 'OFFERED',
        issuerId: npc ? npc.id : null,
        counterpartyId: opts.counterpartyId || 'EXT_MERCHANT_CARAVAN',
        principalStones: principal,
        escrowStones: 0,
        createdDay: W.day || 1,
        dueDay: (W.day || 1) + (Number(opts.durationDays) || 15),
        combatPenaltyMult: 1.24
      };
      ledger.contracts.push(contract);
      return { ok: true, contract };
    },

    acceptContract(W, contractId) {
      if (!W || !W.sect) return { ok: false, reason: 'no-world' };
      this.ensureWorldState(W);
      const ledger = W.sect.contractLedger;
      const c = ledger.contracts.find(x => x && x.id === contractId);
      if (!c || c.state !== 'OFFERED') return { ok: false, reason: 'invalid-contract-state' };
      const amount = c.principalStones;
      if ((W.sect.stones || 0) < amount) return { ok: false, reason: 'insufficient-sect-stones', required: amount };
      // Strict conservation: debit W.sect.stones, credit escrowStones
      W.sect.stones -= amount;
      c.escrowStones = amount;
      c.state = 'ACTIVE';
      ledger.escrowStones = (ledger.escrowStones || 0) + amount;
      ledger.activeCount = ledger.contracts.filter(x => x.state === 'ACTIVE').length;
      return { ok: true, contract: c, debit: amount, credit: amount };
    },

    settleContract(W, contractId) {
      if (!W || !W.sect) return { ok: false, reason: 'no-world' };
      this.ensureWorldState(W);
      const ledger = W.sect.contractLedger;
      const c = ledger.contracts.find(x => x && x.id === contractId);
      if (!c || c.state !== 'ACTIVE') return { ok: false, reason: 'contract-not-active' };
      if (Number.isFinite(c.dueDay) && (W.day || 0) < c.dueDay) return { ok: false, reason: 'contract-not-due', dueDay: c.dueDay };
      // Strict zero-free-resource conservation: return exact escrow + transfer any trade settlement strictly from world.resourcePool.stones if available
      const escrow = c.escrowStones || 0;
      let poolTransfer = 0;
      const bonusCap = Math.min(Math.round(escrow * 0.15), (W.world && W.world.resourcePool && W.world.resourcePool.stones) || 0);
      if (bonusCap > 0 && W.world && W.world.resourcePool) {
        W.world.resourcePool.stones -= bonusCap;
        poolTransfer = bonusCap;
      }
      const totalReturn = escrow + poolTransfer;
      c.escrowStones = 0;
      c.state = 'SETTLED';
      c.settledDay = W.day || 1;
      ledger.escrowStones = Math.max(0, (ledger.escrowStones || 0) - escrow);
      W.sect.stones = (W.sect.stones || 0) + totalReturn;
      ledger.activeCount = ledger.contracts.filter(x => x.state === 'ACTIVE').length;
      ledger.settledCount = (ledger.settledCount || 0) + 1;
      const issuer = c.issuerId && W.byId && W.byId[c.issuerId];
      if (issuer) CULT.gainPathGauge(issuer, 40);
      return { ok: true, contract: c, debit: escrow + poolTransfer, credit: totalReturn };
    },

    breachContract(W, contractId, targetUnit) {
      if (!W || !W.sect) return { ok: false, reason: 'no-world' };
      this.ensureWorldState(W);
      const ledger = W.sect.contractLedger;
      const c = ledger.contracts.find(x => x && x.id === contractId);
      if (!c || (c.state !== 'ACTIVE' && c.state !== 'OFFERED')) return { ok: false, reason: 'contract-cannot-breach' };
      const escrow = c.escrowStones || 0;
      if (escrow > 0) {
        // Strict conservation: return escrow to sect stones on counterparty breach
        c.escrowStones = 0;
        ledger.escrowStones = Math.max(0, (ledger.escrowStones || 0) - escrow);
        W.sect.stones = (W.sect.stones || 0) + escrow;
      }
      c.state = 'BREACHED';
      c.breachedDay = W.day || 1;
      ledger.activeCount = ledger.contracts.filter(x => x.state === 'ACTIVE').length;
      ledger.breachedCount = (ledger.breachedCount || 0) + 1;
      if (targetUnit && typeof targetUnit === 'object') {
        targetUnit.contractDefault = Math.max(targetUnit.contractDefault || 0, 5);
      }
      const issuer = c.issuerId && W.byId && W.byId[c.issuerId];
      if (issuer) CULT.gainPathGauge(issuer, 50);
      return { ok: true, contract: c, debit: escrow, credit: escrow };
    },

    // 4. DRAGON_VEIN_GEOMANCY: Anchor Dragon Vein Node with Real Stone Upkeep (Zero Free Resources)
    anchorDragonVeinNode(W, npc, nodeId, stoneCost) {
      if (!W || !W.sect) return { ok: false, reason: 'no-world' };
      this.ensureWorldState(W);
      const cost = Math.max(20, Math.round(Number(stoneCost) || 120));
      if ((W.sect.stones || 0) < cost) return { ok: false, reason: 'insufficient-stones', required: cost };
      // Strict conservation: debit W.sect.stones, credit W.world.resourcePool.stones
      W.sect.stones -= cost;
      if (W.world && W.world.resourcePool) {
        W.world.resourcePool.stones = (W.world.resourcePool.stones || 0) + cost;
      }
      const gs = W.sect.geomancyState;
      const key = String(nodeId || 'MAIN_PEAK');
      const stg = (npc && npc.cult && npc.cult.stage) || 1;
      gs.anchoredNodes[key] = {
        nodeId: key,
        anchoredBy: npc ? npc.id : null,
        anchoredDay: W.day || 1,
        investedStones: ((gs.anchoredNodes[key] && gs.anchoredNodes[key].investedStones) || 0) + cost,
        defenseBonusPct: +Math.min(0.30, 0.08 + stg * 0.025).toFixed(3),
        cultBonusPct: +Math.min(0.24, 0.06 + stg * 0.02).toFixed(3)
      };
      gs.totalInvestedStones = (gs.totalInvestedStones || 0) + cost;
      const nodes = Object.values(gs.anchoredNodes);
      gs.leylineShieldBonusPct = +Math.min(0.45, nodes.reduce((s, n) => s + (n.defenseBonusPct || 0), 0)).toFixed(3);
      gs.cultAuraBonusPct = +Math.min(0.35, nodes.reduce((s, n) => s + (n.cultBonusPct || 0), 0)).toFixed(3);
      if (npc) {
        this.ensureNpcState(W, npc).anchoredVeinId = key;
        CULT.gainPathGauge(npc, 35);
      }
      return { ok: true, node: gs.anchoredNodes[key], debit: cost, credit: cost, geomancyState: gs };
    },

    // 5. GRAVITY_DAO: Mass Control, Projectile Deflection & Anti-Mobility (with Boss Immunity & Cooldown Caps)
    applyGravityField(W, f, caster, target, opts) {
      opts = opts || {};
      if (!caster) return { ok: false, reason: 'no-caster' };
      const pg = CULT.ensurePathGauge(caster);
      const gaugeCost = opts.free ? 0 : Math.max(15, Number(opts.gaugeCost) || 25);
      if (!opts.free && pg && pg.value < gaugeCost) {
        return { ok: false, reason: 'insufficient-gravity-gauge', current: pg.value, required: gaugeCost };
      }
      const nowT = (W && W.t) || 0;
      if (!opts.ignoreCooldown && caster._gravityFieldCdUntil && caster._gravityFieldCdUntil > nowT) {
        return { ok: false, reason: 'gravity-field-on-cooldown', cdUntil: caster._gravityFieldCdUntil };
      }
      if (pg && !opts.free) {
        pg.value = Math.max(0, pg.value - gaugeCost);
        pg.ready = pg.value >= (pg.max || 100);
      }
      caster._gravityFieldCdUntil = nowT + 6;
      if (g.STATS) {
        if (g.STATS.applyNamedBuff && !caster.foe) {
          g.STATS.applyNamedBuff(caster, 'massGuard', 18, nowT, { casterId: caster.id });
        } else if (g.STATS.addBuff) {
          const def = g.STATS.BUFF_CATALOG && g.STATS.BUFF_CATALOG.massGuard;
          g.STATS.addBuff(caster, Object.assign({ id: 'massGuard', name: 'มวลเกราะดูดซับแรง', dur: 18 }, def || {}), nowT);
        }
      }
      let targetCrushed = false;
      let bossImmune = false;
      if (target) {
        const isBoss = !!(target.isBoss || target.boss || target.rank === 'BOSS' || (target.tier && target.tier >= 7 && target.foe));
        if (isBoss) {
          bossImmune = true;
          if (g.STATS && g.STATS.addStatus) g.STATS.addStatus(target, 'slow', 6, { src: caster.id }, nowT);
        } else {
          if (g.STATS && g.STATS.addStatus) {
            g.STATS.addStatus(target, 'gravityCrush', 10, { src: caster.id }, nowT);
            g.STATS.addStatus(target, 'slow', 10, { src: caster.id }, nowT);
          }
          target.gravityCrush = 4;
          targetCrushed = true;
        }
      }
      return { ok: true, gaugeSpent: gaugeCost, targetCrushed, bossImmune, cdUntil: caster._gravityFieldCdUntil };
    },

    // 6. CHRONO_EPOCH: Temporal Rewind (Rewinds skill cooldowns & restores recent HP snapshot)
    recordTemporalHpSnapshot(W, npc, hpOverride) {
      if (!npc || !npc.cult || npc.cult.path !== 'CHRONO_EPOCH') return null;
      const st = this.ensureNpcState(W, npc);
      const nowT = (W && W.t != null) ? W.t : 0;
      const rawHp = Number.isFinite(hpOverride) ? hpOverride : (npc.h && npc.h.state && Number.isFinite(npc.h.state.hp) ? npc.h.state.hp : CULT.hpMax(npc));
      const hm = Math.max(1, CULT.hpMax(npc));
      const snap = { t: nowT, day: (W && W.day) || 1, hp: Math.round(clamp(rawHp, 1, hm)) };
      st.hpSnapshots = Array.isArray(st.hpSnapshots) ? st.hpSnapshots : [];
      const last = st.hpSnapshots[st.hpSnapshots.length - 1];
      if (!last || last.t !== snap.t || snap.hp > last.hp) st.hpSnapshots.push(snap);
      if (st.hpSnapshots.length > 6) st.hpSnapshots.splice(0, st.hpSnapshots.length - 6);
      return snap;
    },

    triggerTemporalRewind(W, npc, opts) {
      opts = opts || {};
      if (!npc || !npc.cult) return { ok: false, reason: "no-cultivator" };
      if (opts.strictPath && npc.cult.path !== 'CHRONO_EPOCH') return { ok: false, reason: 'requires-chrono-epoch-path' };
      const nowT = (W && W.t != null) ? W.t : -1;
      if (!opts.ignoreCooldown && nowT >= 0 && npc._temporalRewindCdUntil != null && npc._temporalRewindCdUntil > nowT) {
        return { ok: false, reason: 'temporal-rewind-on-cooldown', cdUntil: npc._temporalRewindCdUntil };
      }
      if (nowT >= 0) {
        npc._temporalRewindCdUntil = nowT + 12;
        npc._temporalRewindLastTick = nowT;
      }
      const st = this.ensureNpcState(W, npc);
      let rewoundCooldowns = 1;
      if (npc.act && npc.act.ctx && npc.act.ctx.cds) {
        for (const k of Object.keys(npc.act.ctx.cds)) {
          npc.act.ctx.cds[k] = Math.max(0, (npc.act.ctx.cds[k] || 0) - 6);
          rewoundCooldowns++;
        }
      }
      let hpRestored = 0;
      if (npc.h && npc.h.state && Array.isArray(st.hpSnapshots) && st.hpSnapshots.length) {
        const hm = Math.max(1, CULT.hpMax(npc));
        const curHp = Number.isFinite(npc.h.state.hp) ? npc.h.state.hp : hm;
        let bestSnap = null;
        for (const s of st.hpSnapshots) {
          if (!s || !Number.isFinite(s.hp)) continue;
          if (nowT >= 0 && s.t != null && (nowT - s.t) > 16) continue;
          if (!bestSnap || s.hp > bestSnap.hp) bestSnap = s;
        }
        if (bestSnap && bestSnap.hp > curHp && (st._lastHpRewindAt == null || nowT < 0 || (nowT - st._lastHpRewindAt) >= 12)) {
          const maxRestore = Math.max(1, Math.round(hm * 0.20));
          const targetHp = Math.min(hm, bestSnap.hp, curHp + maxRestore);
          if (targetHp > curHp) {
            npc.h.state.hp = targetHp;
            hpRestored = Math.round(targetHp - curHp);
            st._lastHpRewindAt = nowT;
          }
        }
      }
      st.temporalSnapshot = { day: (W && W.day) || 1, t: Math.max(0, nowT), rewoundCooldowns, hpRestored };
      CULT.gainPathGauge(npc, 35);
      return { ok: true, rewoundCooldowns, hpRestored, snapshot: st.temporalSnapshot, cdUntil: npc._temporalRewindCdUntil };
    },

    // 7. INK_LITERATI: Issue Imperial Calligraphy Edict
    issueImperialEdict(W, npc, edictName) {
      if (!npc || !npc.cult) return { ok: false, reason: "no-cultivator" };
      const st = this.ensureNpcState(W, npc);
      const edict = edictName || "EDICT_SILENCE_CENSURE";
      st.imperialEdictActive = edict;
      CULT.gainPathGauge(npc, 30);
      return { ok: true, edict, active: true };
    },

    // 8. SOUL_PUPPETRY: Tether Marionette Spirit-Silk Link
    tetherMarionette(W, npc, puppetType) {
      if (!npc || !npc.cult) return { ok: false, reason: "no-cultivator" };
      const st = this.ensureNpcState(W, npc);
      st.marionetteLinks = Math.min(3, (st.marionetteLinks || 1) + 1);
      st.puppetType = puppetType || "IRON_CORPSE_GUARD";
      CULT.gainPathGauge(npc, 30);
      return { ok: true, puppetType: st.puppetType, links: st.marionetteLinks, damageSharePct: 0.30 };
    },

    // 9. PRIMORDIAL_CHAOS: Transmute Chaos Entropy Affinity
    transmuteChaosElement(W, npc, targetElement) {
      if (!npc || !npc.cult) return { ok: false, reason: "no-cultivator" };
      const st = this.ensureNpcState(W, npc);
      st.chaosEntropyStacks = Math.min(10, (st.chaosEntropyStacks || 0) + 2);
      st.chaosElement = targetElement || "CHAOS";
      CULT.gainPathGauge(npc, 35);
      return { ok: true, element: st.chaosElement, stacks: st.chaosEntropyStacks, ignoreResistPct: 0.25 };
    },

    // 10. LORE_ARCHIVIST: Compile Lore Index & Manual Study Speed/Retention
    compileLoreIndex(W, npc, manualId) {
      if (!npc || !npc.cult) return { ok: false, reason: 'no-cultivator' };
      const st = this.ensureNpcState(W, npc);
      st.loreIndexStacks = Math.min(100, (st.loreIndexStacks || 0) + 20);
      st.studySpeedBonusPct = +Math.min(0.45, 0.12 + (st.loreIndexStacks / 100) * 0.28).toFixed(3);
      st.techRetentionBonus = +Math.min(0.40, 0.10 + (st.loreIndexStacks / 100) * 0.25).toFixed(3);
      if (manualId && W && g.SECT && g.SECT.PATH_LIBRARY && typeof g.SECT.PATH_LIBRARY.canDiscipleStudyPath === 'function') {
        g.SECT.PATH_LIBRARY.canDiscipleStudyPath(W, npc, npc.cult.path);
      }
      CULT.gainPathGauge(npc, 25);
      return { ok: true, loreIndexStacks: st.loreIndexStacks, studySpeedBonusPct: st.studySpeedBonusPct, techRetentionBonus: st.techRetentionBonus };
    },

    // 11. FORTUNE_GAMBLER: Wager Destiny Stake (Zero-Free-Resource Conservation)
    wagerDestinyStake(W, npc, stakeStones, opts) {
      if (!W || !W.sect || !W.world || !npc || !npc.cult) return { ok: false, reason: 'invalid-state' };
      const wager = Math.max(0, Math.min(200, Math.round(Number(stakeStones) || 0)));
      if (!wager) return { ok: false, reason: 'invalid-wager' };
      const usePersonal = !!(opts && opts.usePersonal);
      if (usePersonal && !npc.inv) npc.inv = { stones: 0 };
      const curStones = usePersonal ? (npc.inv.stones || 0) : (W.sect.stones || 0);
      if (curStones < wager) return { ok: false, reason: 'insufficient-stones', required: wager };
      const pool = W.world.resourcePool || (W.world.resourcePool = { stones: 50000, herbs: 5000, ores: 5000 });
      if (!Number.isFinite(pool.stones) || pool.stones < 0) return { ok: false, reason: 'invalid-world-pool' };
      const st = this.ensureNpcState(W, npc);
      if (usePersonal) npc.inv.stones = curStones - wager;
      else W.sect.stones = curStones - wager;
      pool.stones += wager;
      const luck = (npc.h && npc.h.destiny && npc.h.destiny.luck) || 50;
      const win = (W.rng && W.rng.next ? W.rng.next() : 0.5) < clamp(0.48 + (luck - 50) * 0.004, 0.25, 0.78);
      let payout = 0;
      if (win) {
        // The pool already contains the stake: debit the entire payout once.
        payout = Math.min(wager * 2, Math.floor(Math.max(0, pool.stones)));
        pool.stones -= payout;
        if (usePersonal) npc.inv.stones = (npc.inv.stones || 0) + payout;
        else W.sect.stones = (W.sect.stones || 0) + payout;
      }
      st.destinyStake = clamp((st.destinyStake || 0) + (win ? 30 : 15), 0, 100);
      st.critVarianceBonus = win ? 0.22 : -0.05;
      CULT.gainPathGauge(npc, win ? 35 : 18);
      return { ok: true, win, wager, payout, usePersonal, destinyStake: st.destinyStake, critVarianceBonus: st.critVarianceBonus };
    },

    // 12. SPIRIT_HUSBANDRY: Advance Growth Cycle for Herb Garden & Spirit Beasts
    advanceGrowthCycle(W, npc) {
      if (!npc || !npc.cult) return { ok: false, reason: 'no-cultivator' };
      const st = this.ensureNpcState(W, npc);
      st.growthCycleStacks = clamp((st.growthCycleStacks || 0) + 25, 0, 100);
      st.herbYieldBonusPct = +Math.min(0.45, 0.14 + (npc.cult.stage || 1) * 0.03).toFixed(3);
      st.beastNurtureBonusPct = +Math.min(0.40, 0.12 + (npc.cult.stage || 1) * 0.025).toFixed(3);
      if (Array.isArray(npc.pets)) {
        for (const pt of npc.pets) {
          if (pt) {
            pt.fatigue = Math.max(0, (pt.fatigue || 0) - 15);
            pt.bond = clamp((pt.bond || 60) + 2, 0, 100);
            pt.loyalty = pt.bond;
          }
        }
      }
      CULT.gainPathGauge(npc, 25);
      return { ok: true, growthCycleStacks: st.growthCycleStacks, herbYieldBonusPct: st.herbYieldBonusPct, beastNurtureBonusPct: st.beastNurtureBonusPct };
    },

    // 13. ARENA_GLORY: Kindle Renown Flame from Sparring, Duels & Tournaments
    kindleRenownFlame(W, npc, amount) {
      if (!npc || !npc.cult) return { ok: false, reason: 'no-cultivator' };
      const st = this.ensureNpcState(W, npc);
      const add = Math.max(5, Number(amount) || 25);
      st.renownFlame = clamp((st.renownFlame || 0) + add, 0, 100);
      st.duelMomentumBonusPct = +Math.min(0.35, 0.08 + (st.renownFlame / 100) * 0.22).toFixed(3);
      CULT.gainPathGauge(npc, add);
      return { ok: true, renownFlame: st.renownFlame, duelMomentumBonusPct: st.duelMomentumBonusPct };
    },

    // 14. ANCESTRAL_RITUAL: Invoke Ancestral Rite Fervor & Marrow Pool Resonance
    invokeAncestralRite(W, npc) {
      if (!npc || !npc.cult) return { ok: false, reason: 'no-cultivator' };
      const st = this.ensureNpcState(W, npc);
      const fallenList = (W && W.sect && Array.isArray(W.sect.fallen)) ? W.sect.fallen : [];
      const graveList = (W && Array.isArray(W.graveyard)) ? W.graveyard : [];
      const ancList = (W && W.sect && Array.isArray(W.sect.ancestors)) ? W.sect.ancestors : (fallenList.length ? fallenList : graveList);
      const ancCount = ancList.length;
      const latestAnc = ancList[ancList.length - 1];
      const elderNameTh = (latestAnc && (latestAnc.nameTh || latestAnc.name || (latestAnc.h && latestAnc.h.name && latestAnc.h.name.full))) || 'บูรพาจารย์ผู้ล่วงลับ';
      const ancFervorBonus = Math.min(18, ancCount * 3);
      st.riteFervor = clamp((st.riteFervor || 0) + 28 + ancFervorBonus, 0, 100);
      const tNow = (W && W.t) || ((g.STATS && g.STATS.now) || 0);
      const dayNow = (W && W.day) || 1;
      const studySpeedMult = +Math.min(1.30, 1.08 + Math.min(0.15, ancCount * 0.02)).toFixed(2);
      npc.ancestralBlessing = {
        active: true,
        ancestorCount: ancCount,
        elderNameTh,
        studySpeedMult,
        breakthroughBonus: +Math.min(0.22, 0.06 + (npc.cult.stage || 1) * 0.012 + Math.min(0.06, ancCount * 0.01)).toFixed(3),
        injuryShield: true,
        until: tNow + 2880,
        untilDay: dayNow + 5
      };
      if (g.STATS && g.STATS.applyNamedBuff && !npc.foe) {
        g.STATS.applyNamedBuff(npc, 'totemBlessing', 60, tNow, { casterId: npc.id });
      }
      CULT.gainPathGauge(npc, 28 + Math.min(12, ancCount * 2));
      return { ok: true, riteFervor: st.riteFervor, ancestorCount: ancCount, blessing: npc.ancestralBlessing };
    },

    // 15. Autonomous Monthly Grand Dao World-System Routine (All 16+ Newer Grand Dao Paths)
    monthlyAutonomousTick(W) {
      if (!W || !W.sect || !Array.isArray(W.npcs)) return { actions: 0, pathsProcessed: [] };
      this.ensureWorldState(W);
      let actions = 0;
      const pathsProcessed = [];
      const aliveCults = W.npcs.filter(n => n && !n.dead && !n.exiled && !n.away && !n.sealed && !n.sealedBt && !(n.jail > W.t) && n.cult);
      const hasTreasuryAuth = u => !!(u && W.sect && (
        u.id === W.sect.masterId || u.id === W.sect.deputyId ||
        u.post === 'treasury' || u.post === 'mission' || u.post === 'envoy' ||
        (g.COG && g.COG.hasAuthority && g.COG.hasAuthority(W, u, 'treasury'))
      ));

      // Settle or breach any active contracts whose dueDay has arrived
      const ledger = W.sect.contractLedger;
      if (ledger && Array.isArray(ledger.contracts)) {
        for (const c of ledger.contracts) {
          if (c && c.state === 'ACTIVE' && (W.day || 1) >= (c.dueDay || 1)) {
            const shouldBreach = !!(c.forceBreach || (W.sect.stones || 0) < (c.principalStones || 50) || (W.rng && W.rng.chance && W.rng.chance(0.25)));
            if (shouldBreach) this.breachContract(W, c.id);
            else this.settleContract(W, c.id);
            actions++;
          }
        }
      }

      for (const n of aliveCults) {
        const p = n.cult.path;
        const st = this.ensureNpcState(W, n);
        const canSpendSectStones = hasTreasuryAuth(n);
        if (g.SECT && g.SECT.PATH_LIBRARY && typeof g.SECT.PATH_LIBRARY.canDiscipleStudyPath === 'function') {
          g.SECT.PATH_LIBRARY.canDiscipleStudyPath(W, n, p);
        }
        if (p === 'CELESTIAL_WEATHER' && (!W.sect.activeWeatherMelody || !W.sect.activeWeatherMelody.active || (W.day || 1) >= (W.sect.activeWeatherMelody.untilDay || 0))) {
          this.harmonizeSkyWeather(W, n, (W.weather && W.weather.kind) || 'spirit_aurora');
          actions++; pathsProcessed.push(p);
        } else if (p === 'MERCANTILE_DAO' && ledger && (ledger.activeCount || 0) < 2 && (W.sect.stones || 0) >= 600) {
          const treasuryApprover = canSpendSectStones ? n : aliveCults.find(u => hasTreasuryAuth(u));
          const pendingOffered = (ledger.contracts || []).filter(c => c && c.state === 'OFFERED').length;
          if (treasuryApprover) {
            const off = this.offerContract(W, n, { principalStones: 80, durationDays: 15 });
            if (off && off.ok) {
              this.acceptContract(W, off.contract.id);
              actions++; pathsProcessed.push(p);
            }
          } else if (pendingOffered < 2) {
            const off = this.offerContract(W, n, { principalStones: 80, durationDays: 15 });
            if (off && off.ok) {
              actions++; pathsProcessed.push(p);
            }
          } else {
            CULT.gainPathGauge(n, 20);
            actions++; pathsProcessed.push(p);
          }
        } else if (p === 'MERCANTILE_DAO') {
          CULT.gainPathGauge(n, 20);
          actions++; pathsProcessed.push(p);
        } else if (p === 'DRAGON_VEIN_GEOMANCY' && canSpendSectStones && (W.sect.stones || 0) >= 900 && !(W.sect.geomancyState.anchoredNodes && W.sect.geomancyState.anchoredNodes[n.peakId || 'MAIN_PEAK']) && Object.keys(W.sect.geomancyState.anchoredNodes || {}).length < 2) {
          this.anchorDragonVeinNode(W, n, n.peakId || 'MAIN_PEAK', 60);
          actions++; pathsProcessed.push(p);
        } else if (p === 'DRAGON_VEIN_GEOMANCY') {
          CULT.gainPathGauge(n, 20);
          actions++; pathsProcessed.push(p);
        } else if (p === 'WANDERING_DAO') {
          this.gainRouteInsight(W, n, 12);
          actions++; pathsProcessed.push(p);
        } else if (p === 'CHRONO_EPOCH') {
          this.triggerTemporalRewind(W, n);
          actions++; pathsProcessed.push(p);
        } else if (p === 'INK_LITERATI') {
          this.issueImperialEdict(W, n, 'EDICT_SCHOLAR_HARMONY');
          actions++; pathsProcessed.push(p);
        } else if (p === 'SOUL_PUPPETRY') {
          this.tetherMarionette(W, n, 'SPIRIT_SILK_SENTINEL');
          actions++; pathsProcessed.push(p);
        } else if (p === 'PRIMORDIAL_CHAOS') {
          this.transmuteChaosElement(W, n, 'CHAOS');
          actions++; pathsProcessed.push(p);
        } else if (p === 'DEVOURING_FLESH') {
          const devRes = this.devourResourceForBody(W, n, null, { free: false });
          if (devRes && devRes.ok) { actions++; pathsProcessed.push(p); }
          else { CULT.gainPathGauge(n, 15); actions++; pathsProcessed.push(p); }
        } else if (p === 'NETHER_GRAVE') {
          this.channelGraveyardEcho(W, n);
          actions++; pathsProcessed.push(p);
        } else if (p === 'LORE_ARCHIVIST') {
          this.compileLoreIndex(W, n);
          actions++; pathsProcessed.push(p);
        } else if (p === 'FORTUNE_GAMBLER') {
          if (canSpendSectStones && (W.sect.stones || 0) >= 500) {
            const wRes = this.wagerDestinyStake(W, n, 20);
            if (wRes && wRes.ok) { actions++; pathsProcessed.push(p); }
          } else if (n.inv && (n.inv.stones || 0) >= 20) {
            const wRes = this.wagerDestinyStake(W, n, 20, { usePersonal: true });
            if (wRes && wRes.ok) { actions++; pathsProcessed.push(p); }
          } else {
            CULT.gainPathGauge(n, 18);
            actions++; pathsProcessed.push(p);
          }
        } else if (p === 'SPIRIT_HUSBANDRY') {
          this.advanceGrowthCycle(W, n);
          actions++; pathsProcessed.push(p);
        } else if (p === 'ARENA_GLORY') {
          this.kindleRenownFlame(W, n, 22);
          actions++; pathsProcessed.push(p);
        } else if (p === 'ANCESTRAL_RITUAL') {
          this.invokeAncestralRite(W, n);
          actions++; pathsProcessed.push(p);
        } else if (p === 'DIVINE_SUMMONER' || p === 'DIVINE_POSSESSION' || p === 'DIVINE_CHANNELER') {
          if (canSpendSectStones && g.SECT && g.SECT.COSMIC_SHRINE && typeof g.SECT.COSMIC_SHRINE.consecrateOffering === 'function' && (W.sect.stones || 0) >= 800) {
            g.SECT.COSMIC_SHRINE.consecrateOffering(W, n, 'HEAVENLY_COURT_DAO', null, { stoneFallback: 40 });
          } else {
            CULT.gainPathGauge(n, 20);
          }
          actions++; pathsProcessed.push(p);
        } else if (p === 'VOID_HERETIC_PACT' || p === 'OCCULT_MAGE' || p === 'SHADOW_SAMURAI' || p === 'NINPO_SHADOW' || p === 'NINPO_ELEMENTAL' || p === 'TIDE_VOYAGER') {
          st.monthlyPracticeCount = (st.monthlyPracticeCount || 0) + 1;
          CULT.gainPathGauge(n, 20);
          actions++; pathsProcessed.push(p);
        }
        // V240-06: Monthly secondary resource accumulation for compatible paths
        if (CULT.SECONDARY_RESOURCES && CULT.SECONDARY_RESOURCES.canUseResource) {
          for (const resKey of ['FROST_QI', 'KILLING_INTENT', 'FORMATION_INK', 'MECH_GEARS']) {
            if (CULT.SECONDARY_RESOURCES.canUseResource(n, resKey)) {
              CULT.SECONDARY_RESOURCES.gain(n, resKey, 18);
            }
          }
        }
        // V240-15: Autonomous NPC Voluntary Vow swearing & Blood Covenant signing based on personality
        const disc = HC.eff(n, 'personality.discipline') || 50;
        const cou = HC.eff(n, 'personality.courage') || 50;
        const amb = HC.eff(n, 'personality.ambition') || 50;
        if (CULT.VOLUNTARY_VOWS && (!n.voluntaryVows || Object.keys(n.voluntaryVows).length === 0)) {
          if (['BUDDHA_DHARMA', 'HEART_SOUL', 'GOD', 'SAGE_SUPPORT'].includes(p) && disc >= 62) {
            CULT.VOLUNTARY_VOWS.swearVow(W, n, 'VOW_ASCETIC_PRECEPT');
            actions++;
          } else if (['BODY', 'SHADOW_SAMURAI', 'ARENA_GLORY'].includes(p) && cou >= 65 && disc >= 55) {
            CULT.VOLUNTARY_VOWS.swearVow(W, n, 'VOW_NO_RETREAT');
            actions++;
          } else if (disc >= 72 && amb >= 62 && p !== 'CRAFT_CREATION') {
            CULT.VOLUNTARY_VOWS.swearVow(W, n, 'VOW_NO_MEDICINE');
            actions++;
          }
        } else if (CULT.VOLUNTARY_VOWS && n.voluntaryVows) {
          for (const vKey of Object.keys(n.voluntaryVows)) {
            const vEntry = n.voluntaryVows[vKey];
            if (vEntry && vEntry.violated && ((W.day || 1) - (vEntry.violatedDay || 0) >= 7) && (n.merit || 0) >= 25) {
              const rRes = CULT.VOLUNTARY_VOWS.redeemVow(W, n, vKey);
              if (rRes && rRes.ok) actions++;
            }
          }
        }
        if (!n.demonPact && g.SECT && g.SECT.INFERNAL_SHRINE && g.SECT.INFERNAL_SHRINE.isNpcWillingForDemonPact && g.SECT.INFERNAL_SHRINE.isNpcWillingForDemonPact(n) && canSpendSectStones && (W.sect.stones || 0) >= 850) {
          const lordPick = p === 'VOID_HERETIC_PACT' ? 'LUCIFER_MORNINGSTAR' : p === 'SHADOW_SAMURAI' ? 'DAIROKUTEN_MAOH' : 'CHIYOU_WARLORD';
          g.SECT.INFERNAL_SHRINE.signBloodCovenant(W, n, lordPick, {});
          actions++;
        }
      }
      if (g.SECT && g.SECT.INFERNAL_SHRINE && (W.sect.stones || 0) >= 950) {
        const master = W.byId && W.byId[W.sect.masterId];
        const demonicLeader = (master && hasTreasuryAuth(master) && g.SECT.INFERNAL_SHRINE.isNpcWillingForDemonPact && g.SECT.INFERNAL_SHRINE.isNpcWillingForDemonPact(master))
          ? master
          : aliveCults.find(u => hasTreasuryAuth(u) && u.rank >= 4 && g.SECT.INFERNAL_SHRINE.isNpcWillingForDemonPact && g.SECT.INFERNAL_SHRINE.isNpcWillingForDemonPact(u));
        if (demonicLeader) {
          const planePick = demonicLeader.cult.path === 'VOID_HERETIC_PACT' ? 'INFERNAL_PANDEMONIUM'
            : demonicLeader.cult.path === 'DEVOURING_FLESH' ? 'ASURA_BLOOD_SEA' : 'NINE_SERENITIES_HELL';
          g.SECT.INFERNAL_SHRINE.offerInfernalTribute(W, planePick, {});
          actions++;
        }
      }
      return { actions, pathsProcessed };
    }
  };

  /* =========================================================================
   * PATCH v2.2.0: HIGHER REALMS COSMOLOGY & THE FIVE PANTHEONS (20 TRUE DEITIES)
   * (ระบบมหาพิภพชั้นสูง 5 อารยธรรม · สเกลพลัง 1 ในล้านล้าน ถึง 5% · พันธสัญญาเทวะ)
   * ========================================================================= */
  CULT.HIGHER_REALMS_PANTHEON = {
    REALMS: Object.freeze({
      HEAVENLY_COURT_DAO: {
        id: 'HEAVENLY_COURT_DAO',
        nameTh: 'แดนสวรรค์เก้าชั้นและสุริยันบรรพกาล',
        civilizationTh: 'เต๋าและจีนโบราณ',
        offeringCat: 'ORE_OR_TALISMAN',
        deities: ['PANGU', 'NUWA', 'DONGHUANG_TAIYI', 'ERLANG_WUKONG']
      },
      VEDIC_VAJRA_REALM: {
        id: 'VEDIC_VAJRA_REALM',
        nameTh: 'แดนมหาเทวะไศวะ-ไวกูณฐ์',
        civilizationTh: 'พราหมณ์-ฮินดูและวัชรญาณ',
        offeringCat: 'HERB_OR_PILL',
        deities: ['SHIVA_NATARAJA', 'VISHNU_PRESERVER', 'KALI_WRATH', 'GARUDA_NAGA']
      },
      DUAT_NETHER_SANDS: {
        id: 'DUAT_NETHER_SANDS',
        nameTh: 'มหาพิภพสุริยันทรายทองดูอัต',
        civilizationTh: 'พิภพทรายทองคำสุริยันโพ้นม่านฟ้า',
        offeringCat: 'RELIC_OR_GOLD',
        deities: ['ANUBIS_JUDGE', 'RA_SOLAR_BARK', 'OSIRIS_RESURRECTION', 'SETH_SANDSTORM']
      },
      OLYMPUS_TARTARUS: {
        id: 'OLYMPUS_TARTARUS',
        nameTh: 'เทวสภาอัสนีโพ้นม่านดารา',
        civilizationTh: 'เทวสภาดาราจักรสายฟ้าโพ้นม่านภพ',
        offeringCat: 'WEAPON_OR_TROPHY',
        deities: ['ZEUS_THUNDERBOLT', 'HADES_UNDERWORLD', 'ATHENA_AEGIS', 'ARES_WARFIRE']
      },
      HIMAVANTA_SIAM_DEVA: {
        id: 'HIMAVANTA_SIAM_DEVA',
        nameTh: 'แดนทิพย์หิมพานต์และสยามเทวา',
        civilizationTh: 'พระเวท-แรงครูสยาม',
        offeringCat: 'GARLAND_OR_TALISMAN',
        deities: ['VESSAVANA_YAKSHA', 'PHRA_PHIRAP_MASTER', 'LORD_SACRED_WILDS', 'MAE_THORANI_EARTH']
      }
    }),
    ABYSSAL_REALMS: Object.freeze({
      PRIMORDIAL_ASURA_ABYSS: {
        id: 'PRIMORDIAL_ASURA_ABYSS',
        nameTh: 'แดนอสูรบรรพกาลและพญามารสวรรค์ชั้นที่หก',
        civilizationTh: 'อสูรพระเวทและพญามารพุทธกาล',
        offeringCat: 'BLOOD_OR_WEAPON',
        isDemonicAbyss: true,
        deities: ['MARA_VASAVATTI', 'MAHISHASURA', 'RAVANA_TEN_HEADS', 'RAHU_ECLIPSE']
      },
      SEVEN_SINS_INFERNO: {
        id: 'SEVEN_SINS_INFERNO',
        nameTh: 'ขุมอเวจีทูตสวรรค์ตกสวรรค์นอกม่านภพ',
        civilizationTh: 'จอมอสูรตกสวรรค์นอกม่านภพ',
        offeringCat: 'SOUL_OR_RELIC',
        isDemonicAbyss: true,
        deities: ['LUCIFER_MORNINGSTAR', 'SATAN_WRATH', 'BEELZEBUB_SWARM', 'LEVIATHAN_ABYSS']
      },
      HEAVENLY_MARA_DOMAIN: {
        id: 'HEAVENLY_MARA_DOMAIN',
        nameTh: 'แดนพญามารฟ้าและสี่มหาอสูรบรรพกาลจีน',
        civilizationTh: 'จอมมารบรรพกาลจีน',
        offeringCat: 'BEAST_CORE_OR_ORE',
        isDemonicAbyss: true,
        deities: ['CHIYOU_WARLORD', 'TAOTIE_GLUTTON', 'BOSHUN_DEMON_KING', 'HUNDUN_CHAOS']
      },
      HUNDRED_YOKAI_REALM: {
        id: 'HUNDRED_YOKAI_REALM',
        nameTh: 'แดนขบวนร้อยอสูรรัตติกาลหมู่เกาะบูรพา',
        civilizationTh: 'จอมอสูรหมู่เกาะบูรพาผาเมฆานอกม่านหมอก',
        offeringCat: 'SAKE_OR_TALISMAN',
        isDemonicAbyss: true,
        deities: ['SHUTEN_DOJI', 'TAMAMO_NO_MAE', 'SUTOKU_EMPEROR']
      }
    }),

    DEITIES: Object.freeze({
      PANGU: { id: 'PANGU', realm: 'HEAVENLY_COURT_DAO', nameTh: 'มหาเทพผานกู่ผู้ผ่าฟ้าแยกปฐพี', boonTh: 'พละกำลังผ่าฟ้า ทลายค่ายกลและเกราะปราณ', element: 'EARTH_METAL', atkMult: 0.24, penBonus: 25, backlashStrain: 18 },
      NUWA: { id: 'NUWA', realm: 'HEAVENLY_COURT_DAO', nameTh: 'เจ้าแม่หนี่วาผู้หลอมศิลาห้าสี', boonTh: 'ศิลาเบญจธาตุซ่อมฟ้า ฟื้นฟูชีพจรและพลังชีวิต', element: 'WOOD_LIFE', healPct: 0.28, defMult: 0.20, backlashStrain: 10 },
      DONGHUANG_TAIYI: { id: 'DONGHUANG_TAIYI', realm: 'HEAVENLY_COURT_DAO', nameTh: 'มหาเทพไท่อี้สุริยันบรรพกาล (องค์ไท่อี้)', boonTh: 'ระฆังสุริยันบรรพกาล สะกดเวลาและจิตวิญญาณศัตรู', element: 'FIRE', matkMult: 0.25, ccBonus: 1, backlashStrain: 16 },
      ERLANG_WUKONG: { id: 'ERLANG_WUKONG', realm: 'HEAVENLY_COURT_DAO', nameTh: 'เอ้อหลางเสินและมหาปราชญ์เทียมฟ้า', boonTh: 'เนตรสวรรค์จับเท็จและกายาทองคำเจ็ดสิบสองแปลง', element: 'LIGHT_YANG', atkMult: 0.20, evaBonus: 18, backlashStrain: 14 },

      SHIVA_NATARAJA: { id: 'SHIVA_NATARAJA', realm: 'VEDIC_VAJRA_REALM', nameTh: 'พระศิวะมหาเทพนาฏราช', boonTh: 'เนตรที่สามสลายภพและระบำนาฏราชทำลายค่ายกล', element: 'FIRE', matkMult: 0.28, penBonus: 28, backlashStrain: 20 },
      VISHNU_PRESERVER: { id: 'VISHNU_PRESERVER', realm: 'VEDIC_VAJRA_REALM', nameTh: 'พระนารายณ์ผู้พิทักษ์จักรวาล', boonTh: 'ธรรมจักรและสังข์สวรรค์คุ้มครองทั้งสมรภูมิ', element: 'LIGHT_YANG', defMult: 0.24, shieldPct: 0.25, backlashStrain: 12 },
      KALI_WRATH: { id: 'KALI_WRATH', realm: 'VEDIC_VAJRA_REALM', nameTh: 'พระแม่กาลีผู้สังหารมาร', boonTh: 'โทสะสังหารมาร ยิ่งสู้ยิ่งคลั่งดูดกลืนความกลัว', element: 'BLOOD_DEMON', atkMult: 0.28, critBonus: 20, backlashStrain: 22 },
      GARUDA_NAGA: { id: 'GARUDA_NAGA', realm: 'VEDIC_VAJRA_REALM', nameTh: 'พญาครุฑสุริยะและพญานาคราช', boonTh: 'ปีกเพลิงสุริยะและเกล็ดแก้วนาคราชต้านพิษ/สายฟ้า', element: 'WIND', atkMult: 0.18, mdefMult: 0.22, backlashStrain: 12 },

      ANUBIS_JUDGE: { id: 'ANUBIS_JUDGE', realm: 'DUAT_NETHER_SANDS', nameTh: 'อนูบิสผู้พิพากษาดวงวิญญาณ', boonTh: 'ตาชั่งขนนกพิพากษา สังหารศัตรูที่บาดเจ็บหรือมีบาป', element: 'YIN_SHADOW', matkMult: 0.24, executePct: 0.22, backlashStrain: 16 },
      RA_SOLAR_BARK: { id: 'RA_SOLAR_BARK', realm: 'DUAT_NETHER_SANDS', nameTh: 'สุริยเทพราผู้ครองนาวาสวรรค์', boonTh: 'แสงสุริยันชำระล้างมารและแผดเผาวิญญาณร้าย', element: 'FIRE', matkMult: 0.25, accBonus: 18, backlashStrain: 15 },
      OSIRIS_RESURRECTION: { id: 'OSIRIS_RESURRECTION', realm: 'DUAT_NETHER_SANDS', nameTh: 'โอซิริสจ้าวแห่งการคืนชีพ', boonTh: 'พรคืนชีพจากสุสานและเกราะทองคำโบราณ', element: 'EARTH_METAL', healPct: 0.30, defMult: 0.22, backlashStrain: 14 },
      SETH_SANDSTORM: { id: 'SETH_SANDSTORM', realm: 'DUAT_NETHER_SANDS', nameTh: 'เซธเทพแห่งพายุทรายและโกลาหล', boonTh: 'พายุทรายกลืนพิภพ กัดกร่อนปราณและอาวุธศัตรู', element: 'WIND', atkMult: 0.22, matkMult: 0.22, backlashStrain: 18 },

      ZEUS_THUNDERBOLT: { id: 'ZEUS_THUNDERBOLT', realm: 'OLYMPUS_TARTARUS', nameTh: 'มหาเทพซูสจ้าวแห่งอสุนีบาต', boonTh: 'อสุนีบาตพิพากษาผ่าทะลวงเส้นชีพจรไม่พลาดเป้า', element: 'LIGHTNING', matkMult: 0.27, penBonus: 24, backlashStrain: 18 },
      HADES_UNDERWORLD: { id: 'HADES_UNDERWORLD', realm: 'OLYMPUS_TARTARUS', nameTh: 'ฮาเดสจ้าวแห่งยมโลกทาร์ทารัส', boonTh: 'หมวกเร้นเงาและโซ่ยมโลกตรึงวิญญาณ', element: 'YIN_SHADOW', atkMult: 0.22, evaBonus: 20, backlashStrain: 16 },
      ATHENA_AEGIS: { id: 'ATHENA_AEGIS', realm: 'OLYMPUS_TARTARUS', nameTh: 'เทพีอาธีน่าแห่งปัญญาและโล่เอกิส', boonTh: 'โล่เอกิสสะท้อนดาเมจและเพิ่มความแม่นยำกลยุทธ์', element: 'LIGHT_YANG', defMult: 0.25, reflectPct: 0.20, backlashStrain: 12 },
      ARES_WARFIRE: { id: 'ARES_WARFIRE', realm: 'OLYMPUS_TARTARUS', nameTh: 'อาเรสเทพแห่งเพลิงสงครามคลั่ง', boonTh: 'ลบความเจ็บปวด เพิ่มพลังรบตามเลือดที่เสียไป', element: 'FIRE', atkMult: 0.28, critBonus: 18, backlashStrain: 20 },

      VESSAVANA_YAKSHA: { id: 'VESSAVANA_YAKSHA', realm: 'HIMAVANTA_SIAM_DEVA', nameTh: 'ท้าวเวสสุวรรณจ้าวแห่งยักษ์และขุมทรัพย์', boonTh: 'กระบองเพชรปราบมาร สลายคุณไสยและเรียกโชคลาภ', element: 'EARTH_METAL', atkMult: 0.22, defMult: 0.22, backlashStrain: 12 },
      PHRA_PHIRAP_MASTER: { id: 'PHRA_PHIRAP_MASTER', realm: 'HIMAVANTA_SIAM_DEVA', nameTh: 'พระพิราพบรมครูนาฏยยุทธ์', boonTh: 'แรงครูสูงสุด ปัดเป่าอาถรรพ์และเพิ่มพลังรำศาสตรา', element: 'FIRE', atkMult: 0.25, matkMult: 0.22, backlashStrain: 16 },
      LORD_SACRED_WILDS: { id: 'LORD_SACRED_WILDS', realm: 'HIMAVANTA_SIAM_DEVA', nameTh: 'เจ้าป่าเจ้าเขาและพญาเสือสมิง', boonTh: 'สัญชาตญาณพงไพร กลายร่างสมิงและรับรู้อันตรายล่วงหน้า', element: 'WOOD_LIFE', atkMult: 0.24, evaBonus: 18, backlashStrain: 14 },
      MAE_THORANI_EARTH: { id: 'MAE_THORANI_EARTH', realm: 'HIMAVANTA_SIAM_DEVA', nameTh: 'พระแม่ธรณีบีบมวยผมสยบมาร', boonTh: 'อุทกธาราทิพย์ชะล้างทัพมารและฟื้นฟูแผ่นดิน', element: 'WATER_ICE', healPct: 0.26, mdefMult: 0.24, backlashStrain: 10 }
    }),
    DEMON_LORDS: Object.freeze({
      // Plane 6: PRIMORDIAL_ASURA_ABYSS (4 Asura & Mara Lords)
      MARA_VASAVATTI: { id: 'MARA_VASAVATTI', realm: 'PRIMORDIAL_ASURA_ABYSS', isDemonLord: true, gaugeType: 'INFERNAL_SIN', nameTh: 'พญามารปรมิตวสวัตตีจ้าวสวรรค์ชั้นหก', boonTh: 'บ่วงมารสะกดจิตวิญญาณและเร่งตบะจิตมารสูงสุด', element: 'YIN_SHADOW', matkMult: 0.30, critBonus: 20, backlashStrain: 22, heartDemonBacklash: 18 },
      MAHISHASURA: { id: 'MAHISHASURA', realm: 'PRIMORDIAL_ASURA_ABYSS', isDemonLord: true, gaugeType: 'ASURA_WRATH', nameTh: 'มหิษาสูรจอมอสูรพันร่างคงกระพัน', boonTh: 'กายาอสูรเหล็กไหลสะท้อนคมศาสตราและบดขยี้ปราการ', element: 'EARTH_METAL', atkMult: 0.26, defMult: 0.26, backlashStrain: 20, heartDemonBacklash: 15 },
      RAVANA_TEN_HEADS: { id: 'RAVANA_TEN_HEADS', realm: 'PRIMORDIAL_ASURA_ABYSS', isDemonLord: true, gaugeType: 'ASURA_WRATH', nameTh: 'ทศกัณฐ์พญายักษ์สิบเศียรยี่สิบกร', boonTh: 'ยี่สิบกรระดมศาสตราและหัวใจฝากกล่องอมตะ', element: 'FIRE', atkMult: 0.30, penBonus: 26, backlashStrain: 22, heartDemonBacklash: 16 },
      RAHU_ECLIPSE: { id: 'RAHU_ECLIPSE', realm: 'PRIMORDIAL_ASURA_ABYSS', isDemonLord: true, gaugeType: 'INFERNAL_SIN', nameTh: 'พระราหูอสูรกลืนสุริยันจันทรา', boonTh: 'คราสทมิฬกลืนกินแสงสว่างและดูดซับบัฟศัตรู', element: 'YIN_SHADOW', matkMult: 0.28, evaBonus: 22, backlashStrain: 18, heartDemonBacklash: 14 },

      // Plane 7: SEVEN_SINS_INFERNO (4 Infernal Sin Lords)
      LUCIFER_MORNINGSTAR: { id: 'LUCIFER_MORNINGSTAR', realm: 'SEVEN_SINS_INFERNO', isDemonLord: true, gaugeType: 'INFERNAL_SIN', nameTh: 'ลูซิเฟอร์จอมปีศาจดาวประกายพรึกแห่งอัตตา', boonTh: 'แสงตกสวรรค์เจาะทะลวงทุกกฎเกณฑ์และเพิ่มคริติคอลสูงสุด', element: 'LIGHT_YANG', atkMult: 0.28, matkMult: 0.28, penBonus: 30, backlashStrain: 24, heartDemonBacklash: 20 },
      SATAN_WRATH: { id: 'SATAN_WRATH', realm: 'SEVEN_SINS_INFERNO', isDemonLord: true, gaugeType: 'ASURA_WRATH', nameTh: 'ซาตานจ้าวขุมนรกโทสะเพลิงบรรลัยกัลป์', boonTh: 'เพลิงโทสะนรกานต์เผาผลาญเกราะและเพิ่มพลังตามเลือดที่ลด', element: 'FIRE', atkMult: 0.32, critBonus: 24, backlashStrain: 25, heartDemonBacklash: 20 },
      BEELZEBUB_SWARM: { id: 'BEELZEBUB_SWARM', realm: 'SEVEN_SINS_INFERNO', isDemonLord: true, gaugeType: 'INFERNAL_SIN', nameTh: 'เบลเซบับจ้าวแห่งฝูงแมลงอเวจีและตะกละ', boonTh: 'ฝูงแมลงอเวจีสูบพลังชีวิตและแพร่เชื้อโรคระบาด', element: 'WOOD_LIFE', matkMult: 0.26, healPct: 0.24, backlashStrain: 20, heartDemonBacklash: 16 },
      LEVIATHAN_ABYSS: { id: 'LEVIATHAN_ABYSS', realm: 'SEVEN_SINS_INFERNO', isDemonLord: true, gaugeType: 'INFERNAL_SIN', nameTh: 'เลวีอาธานพญางูสมุทรอเวจีแห่งความริษยา', boonTh: 'คลื่นน้ำวนอเวจีฉุดกระชากและบดขยี้ด้วยแรงดันน้ำลึก', element: 'WATER_ICE', matkMult: 0.27, mdefMult: 0.25, backlashStrain: 18, heartDemonBacklash: 15 },

      // Plane 8: HEAVENLY_MARA_DOMAIN (4 Chinese Primordial Fiends)
      CHIYOU_WARLORD: { id: 'CHIYOU_WARLORD', realm: 'HEAVENLY_MARA_DOMAIN', isDemonLord: true, gaugeType: 'ASURA_WRATH', nameTh: 'ชือโหยวจอมมารสงครามแปดสิบเอ็ดพี่น้อง', boonTh: 'ศาสตราโลหิตมารทลายเกราะสวรรค์และปลุกขวัญทัพอสูร', element: 'BLOOD_DEMON', atkMult: 0.32, penBonus: 28, backlashStrain: 22, heartDemonBacklash: 18 },
      TAOTIE_GLUTTON: { id: 'TAOTIE_GLUTTON', realm: 'HEAVENLY_MARA_DOMAIN', isDemonLord: true, gaugeType: 'INFERNAL_SIN', nameTh: 'เทาเที่ยอสูรบรรพกาลกลืนกินหมื่นสรรพสิ่ง', boonTh: 'ปากหลุมดำกลืนกินปราณและเปลี่ยนดาเมจเป็นพลังชีวิต', element: 'BLOOD_DEMON', atkMult: 0.26, healPct: 0.28, backlashStrain: 20, heartDemonBacklash: 16 },
      BOSHUN_DEMON_KING: { id: 'BOSHUN_DEMON_KING', realm: 'HEAVENLY_MARA_DOMAIN', isDemonLord: true, gaugeType: 'INFERNAL_SIN', nameTh: 'พญามารปัวซุนจ้าวแห่งจิตมารหมื่นกัป', boonTh: 'กระจกจิตมารสะท้อนวิชาและปั่นป่วนทะเลสำนึกศัตรู', element: 'YIN_SHADOW', matkMult: 0.30, evaBonus: 20, backlashStrain: 22, heartDemonBacklash: 18 },
      HUNDUN_CHAOS: { id: 'HUNDUN_CHAOS', realm: 'HEAVENLY_MARA_DOMAIN', isDemonLord: true, gaugeType: 'ASURA_WRATH', nameTh: 'หุ่นตุ้นอสูรโกลาหลไร้ทวารทั้งเจ็ด', boonTh: 'หมอกโกลาหลบรรพกาลลบล้างความได้เปรียบธาตุของศัตรู', element: 'ASTRAL', atkMult: 0.25, matkMult: 0.25, defMult: 0.22, backlashStrain: 20, heartDemonBacklash: 15 },

      // Plane 9: HUNDRED_YOKAI_REALM (3 Three Great Yokai of Japan)
      SHUTEN_DOJI: { id: 'SHUTEN_DOJI', realm: 'HUNDRED_YOKAI_REALM', isDemonLord: true, gaugeType: 'ASURA_WRATH', nameTh: 'ชูเท็นโดจิจอมอสูรยักษ์โอนิแห่งเขาโอเอะ', boonTh: 'สุราอสูรโลหิตคลั่ง เพิ่มพละกำลังและพ่นเพลิงพิษสังหาร', element: 'FIRE', atkMult: 0.30, critBonus: 22, backlashStrain: 20, heartDemonBacklash: 16 },
      TAMAMO_NO_MAE: { id: 'TAMAMO_NO_MAE', realm: 'HUNDRED_YOKAI_REALM', isDemonLord: true, gaugeType: 'INFERNAL_SIN', nameTh: 'ทามาโมะโนะมาเอะจิ้งจอกเก้าหางหน้าหยก', boonTh: 'ศิลาสังหารเซ็ทสึโชเซกิและมายาเก้าหางสูบวิญญาณ', element: 'YIN_SHADOW', matkMult: 0.30, accBonus: 22, backlashStrain: 20, heartDemonBacklash: 16 },
      SUTOKU_EMPEROR: { id: 'SUTOKU_EMPEROR', realm: 'HUNDRED_YOKAI_REALM', isDemonLord: true, gaugeType: 'ASURA_WRATH', nameTh: 'จักรพรรดิซุโทคุมหาเท็งงุวิญญาณอาฆาต', boonTh: 'พายุสายฟ้าเท็งงุและคำสาปราชันย์อาฆาตสะท้อนความตาย', element: 'LIGHTNING', matkMult: 0.28, penBonus: 26, backlashStrain: 22, heartDemonBacklash: 18 }
    }),

    // Cosmic Power Scaling Rule: 1 in 1,000,000,000,000 (10^-12) at Stage 1..2 up to 5% (0.05) at Stage 8..9
    getManifestationScale(stage) {
      const stg = Math.max(1, Math.min(9, Number(stage) || 1));
      if (stg <= 2) {
        return {
          stage: stg,
          cosmicFraction: 1e-12,
          fractionLabelTh: '1 ใน 1,000,000,000,000 ของร่างเงาสะท้อนที่ถูกม่านกั้นภพกดทับ (เงาดวงจิต)',
          veilSuppressionNoteTh: 'ร่างเงาสะท้อนที่ถูกม่านกั้นภพกดทับไว้ไม่ให้เกินขีดจำกัดโลกเบื้องล่าง (<100%)',
          combatPowerMult: 1.12 + (stg - 1) * 0.04,
          mitigationBonus: 0.06
        };
      }
      if (stg <= 4) {
        return {
          stage: stg,
          cosmicFraction: 1e-6,
          fractionLabelTh: '1 ใน 1,000,000 ของร่างเงาสะท้อนที่ถูกม่านกั้นภพกดทับ (เงาร่างครึ่งองค์)',
          veilSuppressionNoteTh: 'ร่างเงาสะท้อนที่ถูกม่านกั้นภพกดทับไว้ไม่ให้เกินขีดจำกัดโลกเบื้องล่าง (<100%)',
          combatPowerMult: 1.24 + (stg - 3) * 0.06,
          mitigationBonus: 0.12
        };
      }
      if (stg <= 6) {
        return {
          stage: stg,
          cosmicFraction: 1e-3,
          fractionLabelTh: '1 ใน 1,000 ของร่างเงาสะท้อนที่ถูกม่านกั้นภพกดทับ (ร่างอวตารสะท้อนภพ)',
          veilSuppressionNoteTh: 'ร่างเงาสะท้อนที่ถูกม่านกั้นภพกดทับไว้ไม่ให้เกินขีดจำกัดโลกเบื้องล่าง (<100%)',
          combatPowerMult: 1.42 + (stg - 5) * 0.08,
          mitigationBonus: 0.18
        };
      }
      const topFrac = stg >= 8 ? 0.05 : 0.01;
      return {
        stage: stg,
        cosmicFraction: topFrac,
        fractionLabelTh: (topFrac * 100).toFixed(0) + '% ของร่างเงาสะท้อนที่ถูกม่านกั้นภพกดทับไว้ไม่ให้เกินขีดจำกัดโลกเบื้องล่าง',
        veilSuppressionNoteTh: 'ร่างเงาสะท้อนที่ถูกม่านกั้นภพกดทับไว้ไม่ให้เกินขีดจำกัดโลกเบื้องล่าง (<100%)',
        combatPowerMult: stg >= 8 ? 1.85 : 1.65,
        mitigationBonus: stg >= 8 ? 0.28 : 0.22
      };
    },

    formDeityPact(W, npc, deityId, opts) {
      opts = opts || {};
      if (!npc || npc.dead) return { ok: false, reason: 'invalid-npc' };
      const dKey = String(deityId || 'PANGU').toUpperCase();
      const deity = this.DEITIES[dKey] || (this.DEMON_LORDS && this.DEMON_LORDS[dKey]);
      if (!deity) return { ok: false, reason: 'unknown-deity', deityId: dKey };

      // Strict Debit = Credit: requires real offering stone cost unless opts.free
      const offeringCost = opts.free ? 0 : 80;
      if (offeringCost > 0 && W && W.sect) {
        if ((W.sect.stones || 0) < offeringCost) return { ok: false, reason: 'insufficient-offering-stones', required: offeringCost };
        if (g.ECO && g.ECO.pay) g.ECO.pay(W, offeringCost, 'ถวายเครื่องสักการะผูกพันธสัญญาเทวะ「' + deity.nameTh + '」');
        else W.sect.stones -= offeringCost;
        if (W.world && W.world.resourcePool) W.world.resourcePool.stones = (W.world.resourcePool.stones || 0) + offeringCost;
      }

      const stg = (npc.cult && npc.cult.stage) || 1;
      const scale = this.getManifestationScale(stg);
      npc.deityPact = {
        deityId: dKey,
        deityNameTh: deity.nameTh,
        realmId: deity.realm,
        boonTh: deity.boonTh,
        element: deity.element,
        cosmicFraction: scale.cosmicFraction,
        fractionLabelTh: scale.fractionLabelTh,
        combatPowerMult: scale.combatPowerMult,
        atkPct: this._toBonusPct(deity.atkMult),
        matkPct: this._toBonusPct(deity.matkMult),
        defPct: this._toBonusPct(deity.defMult),
        mdefPct: this._toBonusPct(deity.mdefMult),
        penBonus: deity.penBonus || 0,
        critBonus: deity.critBonus || 0,
        evaBonus: deity.evaBonus || 0,
        accBonus: deity.accBonus || 0,
        reflectPct: deity.reflectPct || 0,
        formedDay: (W && W.day) || 1
      };
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return { ok: true, pact: npc.deityPact, scale };
    },
    _toBonusPct(val) {
      if (val == null) return 0;
      const num = Number(val) || 0;
      return +(num > 1 ? num - 1 : num).toFixed(3);
    },
    healPact(npc) {
      if (!npc) return npc;
      const fixPact = pact => {
        if (!pact || typeof pact !== 'object') return;
        const id = pact.deityId || pact.lordId || pact.patronId;
        const def = id && (this.DEITIES[id] || (this.DEMON_LORDS && this.DEMON_LORDS[id]));
        const pairs = [['atkPct', 'atkMult'], ['matkPct', 'matkMult'], ['defPct', 'defMult'], ['mdefPct', 'mdefMult']];
        for (let i = 0; i < pairs.length; i++) {
          const pctK = pairs[i][0], multK = pairs[i][1];
          if (pact[pctK] != null && pact[pctK] < 0) {
            pact[pctK] = (def && def[multK] != null) ? this._toBonusPct(def[multK]) : Math.max(0, +(pact[pctK] + 1).toFixed(3));
          } else if (def && def[multK] != null && (pact[pctK] == null || pact[pctK] === 0) && def[multK] > 0) {
            pact[pctK] = this._toBonusPct(def[multK]);
          }
        }
      };
      fixPact(npc.deityPact);
      fixPact(npc.demonPact);
      return npc;
    },
    getUnitBlessingBonuses(npc) {
      if (!npc || !npc.deityPact) return { active: false, p: {}, f: {}, reflectPct: 0 };
      const dp = npc.deityPact;
      const dDef = this.DEITIES[dp.deityId] || (this.DEMON_LORDS && this.DEMON_LORDS[dp.deityId]) || {};
      const resolvePct = (pctVal, defVal) => {
        if (pctVal != null) {
          if (pctVal < 0) return defVal != null ? this._toBonusPct(defVal) : Math.max(0, +(pctVal + 1).toFixed(3));
          return +Number(pctVal).toFixed(3);
        }
        return this._toBonusPct(defVal);
      };
      return {
        active: true,
        p: {
          atk: resolvePct(dp.atkPct, dDef.atkMult),
          matk: resolvePct(dp.matkPct, dDef.matkMult),
          def: resolvePct(dp.defPct, dDef.defMult),
          mdef: resolvePct(dp.mdefPct, dDef.mdefMult),
          eva: (dp.evaBonus || dDef.evaBonus || 0) / 100
        },
        f: {
          pen: dp.penBonus || dDef.penBonus || 0,
          crit: dp.critBonus || dDef.critBonus || 0,
          acc: dp.accBonus || dDef.accBonus || 0
        },
        reflectPct: dp.reflectPct || dDef.reflectPct || 0
      };
    },

    invokeDivineManifestation(W, f, npc, target, mode) {
      if (!npc || npc.dead) return { ok: false, reason: 'invalid-npc' };
      const pact = npc.deityPact || this.formDeityPact(W, npc, 'PANGU', { free: true }).pact;
      const deity = this.DEITIES[pact.deityId] || (this.DEMON_LORDS && this.DEMON_LORDS[pact.deityId]) || this.DEITIES.PANGU;
      const stg = (npc.cult && npc.cult.stage) || 1;
      const scale = this.getManifestationScale(stg);
      const tNow = (W && W.t) || 0;

      if (g.STATS && g.STATS.applyNamedBuff && !npc.foe) {
        g.STATS.applyNamedBuff(npc, 'divineResonance', 24, tNow, { casterId: npc.id });
      }
      // Demonic / Asura gauge & backlash tracking
      if (deity.isDemonLord) {
        const gType = deity.gaugeType || 'INFERNAL_SIN';
        npc.demonicRealmsGauge = npc.demonicRealmsGauge || { INFERNAL_SIN: 0, ASURA_WRATH: 0 };
        npc.demonicRealmsGauge[gType] = clamp((npc.demonicRealmsGauge[gType] || 0) + 25, 0, 100);
      }
      // Trade-off / Backlash tracking: invoking higher-realm power accumulates strain; if strain >= 100, applies vowBacklash & Demonic Backlash
      npc._divineStrain = (npc._divineStrain || 0) + (deity.backlashStrain || 15);
      let backlashTriggered = false;
      if (npc._divineStrain >= 100) {
        npc._divineStrain = 0;
        backlashTriggered = true;
        if (g.STATS && g.STATS.addStatus) {
          g.STATS.addStatus(npc, 'vowBacklash', 12, null, tNow);
        }
        if (deity.isDemonLord && npc.h && npc.h.state) {
          npc.h.state.heartDemon = clamp((npc.h.state.heartDemon || 0) + (deity.heartDemonBacklash || 16), 0, 100);
        }
      }
      return {
        ok: true,
        mode: mode || 'SUMMON',
        deityId: deity.id,
        deityNameTh: deity.nameTh,
        isDemonLord: !!deity.isDemonLord,
        gaugeType: deity.gaugeType || 'DIVINE_FAITH',
        demonicGaugeValue: deity.isDemonLord && npc.demonicRealmsGauge ? npc.demonicRealmsGauge[deity.gaugeType || 'INFERNAL_SIN'] : 0,
        cosmicFraction: scale.cosmicFraction,
        fractionLabelTh: scale.fractionLabelTh,
        combatPowerMult: scale.combatPowerMult,
        backlashTriggered
      };
    }
  };

  // Add DEVOURING_FLESH & NETHER_GRAVE world-system methods to CULT.GRAND_DAO_MECHANICS
  CULT.GRAND_DAO_MECHANICS.devourResourceForBody = function (W, npc, itemId, opts) {
    opts = opts || {};
    if (!W || !W.sect || !npc || !npc.cult) return { ok: false, reason: 'invalid-state' };
    const isBlocked = k => !k || k === 'grain' || k === 'meal' || /^(P:|REC:|ITEM_REPAIR_STONE_|MANUAL_|CRYSTAL_|SUB_|TECH_)/.test(k);
    const isOrganicDevourable = k => !isBlocked(k) && (
      /^MAT_BP_|^MAT_(BONE|HIDE|BLOOD|MEAT|ORGAN|HEART|CORE|FANG|CLAW|SCALE|VENOM|PELT|HAIR|FLESH|MARROW)_/.test(k) ||
      /^MAT_.*_(BONE|HIDE|BLOOD|MEAT|ORGAN|HEART|CORE|FANG|CLAW|SCALE|VENOM|PELT|FLESH)/.test(k) ||
      !!(g.ECO && g.ECO.isBeastDrop && g.ECO.isBeastDrop(k))
    );
    // Strict Debit = Credit: prefer personal organic/beast drops first, then sect organic drops
    let consumed = null;
    const pm = npc.inv && npc.inv.mats;
    if (itemId) {
      if (!isOrganicDevourable(itemId)) return { ok: false, reason: 'ineligible-devour-resource' };
      if (pm && (pm[itemId] || 0) > 0) {
        pm[itemId] -= 1;
        if (pm[itemId] <= 0) delete pm[itemId];
        consumed = itemId;
      } else if (g.ECO && g.ECO.count(W, itemId) > 0 && g.ECO.take(W, itemId, 1)) {
        consumed = itemId;
      }
    } else {
      if (pm) {
        const pKey = Object.keys(pm).find(k => (pm[k] || 0) > 0 && isOrganicDevourable(k));
        if (pKey) {
          pm[pKey] -= 1;
          if (pm[pKey] <= 0) delete pm[pKey];
          consumed = pKey;
        }
      }
      if (!consumed && g.ECO && W.sect.stock) {
        const candKey = Object.keys(W.sect.stock).find(k => (W.sect.stock[k] || 0) > 0 && isOrganicDevourable(k));
        if (candKey && g.ECO.take(W, candKey, 1)) consumed = candKey;
      }
    }
    if (!consumed && !opts.free) return { ok: false, reason: 'no-resource-to-devour' };
    const st = this.ensureNpcState(W, npc);
    st.devouredOrgansCount = (st.devouredOrgansCount || 0) + 1;
    CULT.gainPathGauge(npc, 35);
    return { ok: true, consumedItemId: consumed || 'ESSENCE_ORB', devouredOrgansCount: st.devouredOrgansCount };
  };

  CULT.GRAND_DAO_MECHANICS.channelGraveyardEcho = function (W, npc) {
    if (!W || !npc || !npc.cult) return { ok: false, reason: 'invalid-state' };
    const graveCount = Array.isArray(W.graveyard) ? W.graveyard.length : 0;
    const bonusShieldPct = +Math.min(0.40, 0.25 + graveCount * 0.015).toFixed(3);
    const st = this.ensureNpcState(W, npc);
    st.graveEchoStacks = Math.min(20, graveCount + 1);
    CULT.gainPathGauge(npc, 30);
    return { ok: true, graveCount, bonusShieldPct, graveEchoStacks: st.graveEchoStacks };
  };

  /* =========================================================================
   * PATCH v2.1.0: PILLAR B — APEX SUBPATH ASCENSION TRIALS (27 GRAND DAO TITLES)
   * ========================================================================= */
  CULT.APEX_DAO_TRIALS = {
    getTrialDef(pathId) {
      const pKey = String(pathId || 'XIAN').toUpperCase();
      const pDef = CULT.PATHS[pKey];
      if (!pDef) return null;
      return {
        id: 'APEX_TRIAL_' + pKey,
        path: pKey,
        nameTh: 'บททดสอบจอมราชันมหาวิถี · ' + pDef.nameTh,
        daoTitleTh: 'มหาเซียนต้นกำเนิดแห่ง' + (pDef.shortTh || pDef.nameTh),
        minStage: Math.min(7, (pDef.maxStage || 9) - 1),
        bonuses: {
          atkPct: 0.08,
          matkPct: 0.08,
          defPct: 0.06,
          cultRatePct: 0.12
        }
      };
    },

    attemptApexTrial(W, npc, opts) {
      opts = opts || {};
      if (!npc || npc.dead || !npc.cult) return { ok: false, reason: 'not-cultivator' };
      const pKey = opts.path || npc.cult.path;
      const tDef = this.getTrialDef(pKey);
      if (!tDef) return { ok: false, reason: 'invalid-path' };
      if (!opts.force && (npc.cult.stage || 1) < tDef.minStage) {
        return { ok: false, reason: 'insufficient-stage', requiredStage: tDef.minStage, currentStage: npc.cult.stage || 1 };
      }

      const st = CULT.GRAND_DAO_MECHANICS.ensureNpcState(W, npc);
      const powerScore = (CULT.power ? CULT.power(npc) : 500) + ((npc.cult.stage || 1) * 180);
      const passThreshold = opts.force ? 0 : 950;
      const passed = opts.force || powerScore >= passThreshold;
      if (!passed) {
        return { ok: false, reason: 'trial-failed', powerScore, passThreshold };
      }

      npc.apexDaoTitle = {
        id: tDef.id,
        path: pKey,
        titleTh: tDef.daoTitleTh,
        grantedDay: (W && W.day) || 1,
        bonuses: Object.assign({}, tDef.bonuses)
      };
      if (st) st.apexDaoTitle = npc.apexDaoTitle;
      if (!Array.isArray(npc.assemblyTitles)) npc.assemblyTitles = [];
      if (!npc.assemblyTitles.includes(tDef.daoTitleTh)) npc.assemblyTitles.push(tDef.daoTitleTh);

      let grantedRewardId = null;
      if (W && W.sect && g.ECO) {
        W.sect.apexTrialsCleared = W.sect.apexTrialsCleared || {};
        if (!W.sect.apexTrialsCleared[pKey]) {
          W.sect.apexTrialsCleared[pKey] = {
            day: W.day || 1,
            championId: npc.id,
            championNameTh: HC.fullName(npc),
            titleTh: tDef.daoTitleTh
          };
          grantedRewardId = 'CRYSTAL_PATH_' + pKey;
          g.ECO.add(W, grantedRewardId, 1);
        }
      }
      if (W && typeof W.log === 'function' && !opts.quiet) {
        W.log('breakthrough', '👑 ' + HC.fullName(npc) + ' ผ่าน「' + tDef.nameTh + '」สำเร็จ ได้รับฉายาเซียนสูงสุด「' + tDef.daoTitleTh + '」!', [npc.id]);
      }
      HC.bump(npc);
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return {
        ok: true,
        passed: true,
        path: pKey,
        titleTh: tDef.daoTitleTh,
        bonuses: tDef.bonuses,
        grantedRewardId
      };
    }
  };


  /* =========================================================================
   * PATCH v2.4.0: SECONDARY RESOURCES (S04), VOLUNTARY VOWS (S07),
   * TOXIN SYNERGY MATRIX (S03), MULTI-GAUGE CLASH (BUG-P2-09),
   * AND EXPERIENCE-DERIVED NPC IDENTITY TRAITS (SECTION 2.7)
   * ========================================================================= */
  CULT.SECONDARY_RESOURCES = {
    SPECS: Object.freeze({
      FROST_QI: { id: 'FROST_QI', nameTh: 'ปราณเหมันต์สะสม (Frost Qi)', max: 100, paths: ['XIAN', 'CELESTIAL_WEATHER', 'TIDE_VOYAGER'], bonusMdefPct: 0.14, chillChanceBonus: 0.20 },
      KILLING_INTENT: { id: 'KILLING_INTENT', nameTh: 'จิตสังหารสะสม (Killing Intent)', max: 100, paths: ['DEMON', 'SHADOW_SAMURAI', 'NINPO_SHADOW', 'ARENA_GLORY'], bonusCrit: 10, bonusPen: 12 },
      FORMATION_INK: { id: 'FORMATION_INK', nameTh: 'หมึกค่ายกลอาคม (Formation Ink)', max: 100, paths: ['ARRAY_TALISMAN', 'INK_LITERATI', 'LORE_ARCHIVIST', 'OCCULT_MAGE'], bonusCast: 14, shieldBonusPct: 0.15 },
      MECH_GEARS: { id: 'MECH_GEARS', nameTh: 'เฟืองกลไกสะสม (Mech Gears)', max: 100, paths: ['MECH_PUPPET', 'CRAFT_CREATION', 'SOUL_PUPPETRY'], bonusDefPct: 0.14, bonusAtkPct: 0.10 }
    }),
    ensureState(npc) {
      if (!npc) return null;
      if (!npc.secondaryResources || typeof npc.secondaryResources !== 'object') {
        npc.secondaryResources = { FROST_QI: 0, KILLING_INTENT: 0, FORMATION_INK: 0, MECH_GEARS: 0 };
      }
      return npc.secondaryResources;
    },
    canUseResource(npc, resId) {
      const spec = this.SPECS[resId];
      if (!npc || npc.foe || !npc.cult || !spec) return false;
      return Array.isArray(spec.paths) && spec.paths.includes(npc.cult.path);
    },
    gain(npc, resId, amount, opts) {
      if (!npc || !this.SPECS[resId]) return 0;
      if (opts && opts.strictPath && !this.canUseResource(npc, resId)) return 0;
      const st = this.ensureState(npc);
      st[resId] = clamp((st[resId] || 0) + (Number(amount) || 0), 0, this.SPECS[resId].max || 100);
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return st[resId];
    },
    consume(npc, resId, amount, opts) {
      if (!npc || !this.SPECS[resId]) return { ok: false, current: 0 };
      if (opts && opts.strictPath && !this.canUseResource(npc, resId)) return { ok: false, reason: 'incompatible-path', current: 0 };
      const st = this.ensureState(npc);
      const req = Math.max(0, Number(amount) || 0);
      if ((st[resId] || 0) < req) return { ok: false, current: st[resId] || 0, required: req };
      st[resId] = Math.max(0, (st[resId] || 0) - req);
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return { ok: true, spent: req, remaining: st[resId] };
    }
  };

  // Multi-Gauge Clash Resolution (BUG-P2-09): Primary path gauge is active for finisher; secondary gauges convert to passive stat buffs
  CULT.resolveMultiGaugeState = npc => {
    if (!npc || !npc.cult) return { primaryGauge: null, secondaryBuffs: { p: {}, f: {}, chillChanceBonus: 0, shieldBonusPct: 0 } };
    const pg = CULT.ensurePathGauge(npc);
    const sec = CULT.SECONDARY_RESOURCES.ensureState(npc);
    const p = {}, f = {};
    let chillChanceBonus = 0, shieldBonusPct = 0;
    if (sec) {
      if ((sec.FROST_QI || 0) >= 25) {
        p.mdef = +((p.mdef || 0) + (sec.FROST_QI / 100) * 0.14).toFixed(3);
        chillChanceBonus = +((sec.FROST_QI / 100) * (CULT.SECONDARY_RESOURCES.SPECS.FROST_QI.chillChanceBonus || 0.20)).toFixed(3);
      }
      if ((sec.KILLING_INTENT || 0) >= 25) {
        f.crit = +((f.crit || 0) + (sec.KILLING_INTENT / 100) * 10).toFixed(1);
        f.pen = +((f.pen || 0) + (sec.KILLING_INTENT / 100) * 12).toFixed(1);
      }
      if ((sec.FORMATION_INK || 0) >= 25) {
        f.cast = Math.round((f.cast || 0) + (sec.FORMATION_INK / 100) * 14);
        shieldBonusPct = +((sec.FORMATION_INK / 100) * (CULT.SECONDARY_RESOURCES.SPECS.FORMATION_INK.shieldBonusPct || 0.15)).toFixed(3);
      }
      if ((sec.MECH_GEARS || 0) >= 25) {
        p.def = +((p.def || 0) + (sec.MECH_GEARS / 100) * 0.14).toFixed(3);
        p.atk = +((p.atk || 0) + (sec.MECH_GEARS / 100) * 0.10).toFixed(3);
      }
    }
    if (npc.demonicRealmsGauge) {
      const sin = npc.demonicRealmsGauge.INFERNAL_SIN || 0;
      const wrath = npc.demonicRealmsGauge.ASURA_WRATH || 0;
      if (sin >= 20) p.matk = +((p.matk || 0) + (sin / 100) * 0.12).toFixed(3);
      if (wrath >= 20) p.atk = +((p.atk || 0) + (wrath / 100) * 0.12).toFixed(3);
    }
    return { primaryGauge: pg, secondaryBuffs: { p, f, chillChanceBonus, shieldBonusPct } };
  };

  // S07: Voluntary Vows / Binding Precepts (สัจจะสาบานแลกพลัง)
  CULT.VOLUNTARY_VOWS = {
    MAX_ACTIVE_VOWS: 2,
    CATALOG: Object.freeze({
      VOW_NO_MEDICINE: {
        id: 'VOW_NO_MEDICINE',
        nameTh: 'สัจจะงดพึ่งโอสถ (Vow of No Medicine)',
        cultRateMult: 1.24,
        atkBonusPct: 0.16,
        backlashStatus: 'vowBacklash',
        backlashHeartDemon: 28,
        descTh: 'งดใช้โอสถฟื้นฟูหรือเร่งตบะ แลกกับความเร็วบ่มเพาะ +24% และพลังโจมตี +16% หากละเมิดจะเกิดของเข้าตัว (VOW_BACKLASH)'
      },
      VOW_NO_RETREAT: {
        id: 'VOW_NO_RETREAT',
        nameTh: 'สัจจะก้าวหน้าไม่ถอยหนี (Vow of No Retreat)',
        cultRateMult: 1.18,
        atkBonusPct: 0.22,
        penBonus: 15,
        backlashStatus: 'vowBacklash',
        backlashHeartDemon: 32,
        descTh: 'สาบานไม่ถอยหนีจากการต่อสู้ แลกกับพลังโจมตี +22% และเจาะเกราะ +15% หากถอยหนีจะเกิดของเข้าตัว (VOW_BACKLASH)'
      },
      VOW_ASCETIC_PRECEPT: {
        id: 'VOW_ASCETIC_PRECEPT',
        nameTh: 'สัจจะพรตสมถะบริสุทธิ์ (Ascetic Precept Vow)',
        cultRateMult: 1.28,
        mdefBonusPct: 0.20,
        backlashStatus: 'vowBacklash',
        backlashHeartDemon: 30,
        descTh: 'ถือศีลสมถะละเว้นวิชาต้องห้าม แลกกับความเร็วบ่มเพาะ +28% และป้องกันวิชา +20% หากใช้วิชาต้องห้ามจะเกิดของเข้าตัวทันที'
      }
    }),
    swearVow(W, npc, vowId, opts) {
      opts = opts || {};
      if (!npc || !this.CATALOG[vowId]) return { ok: false, reason: 'invalid-vow' };
      npc.voluntaryVows = npc.voluntaryVows || {};
      const existing = npc.voluntaryVows[vowId];
      if (existing && existing.violated) return { ok: false, reason: 'vow-violated', vow: existing };
      if (existing && existing.active) return { ok: true, unchanged: true, vow: existing, spec: this.CATALOG[vowId] };
      const activeCount = Object.values(npc.voluntaryVows).filter(v => v && v.active && !v.violated).length;
      if (!opts.allowExceedCap && activeCount >= this.MAX_ACTIVE_VOWS) {
        return { ok: false, reason: 'max-active-vows-reached', max: this.MAX_ACTIVE_VOWS };
      }
      const spec = this.CATALOG[vowId];
      npc.voluntaryVows[vowId] = {
        id: vowId,
        nameTh: spec.nameTh,
        active: true,
        violated: false,
        swornDay: (W && W.day) || 1
      };
      if (vowId === 'VOW_ASCETIC_PRECEPT' && npc.forbiddenArtState) {
        npc.forbiddenArtState.sealMode = 'SEALED_RESTRAINT';
      }
      npc._cultRateBase = null;
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return { ok: true, vow: npc.voluntaryVows[vowId], spec };
    },
    redeemVow(W, npc, vowId, opts) {
      opts = opts || {};
      if (!npc || !npc.voluntaryVows || !npc.voluntaryVows[vowId] || !npc.voluntaryVows[vowId].violated) {
        return { ok: false, reason: 'vow-not-violated' };
      }
      const v = npc.voluntaryVows[vowId];
      const curDay = (W && W.day) || 1;
      if (!opts.force && curDay - (v.violatedDay || 0) < 7) {
        return { ok: false, reason: 'penance-cooldown', daysRemaining: 7 - (curDay - (v.violatedDay || 0)) };
      }
      const meritCost = opts.free ? 0 : 25;
      if (meritCost > 0 && (npc.merit || 0) < meritCost) {
        return { ok: false, reason: 'insufficient-merit', required: meritCost };
      }
      if (meritCost > 0) npc.merit -= meritCost;
      delete npc.voluntaryVows[vowId];
      if (npc.h && npc.h.state) {
        npc.h.state.heartDemon = Math.max(0, (npc.h.state.heartDemon || 0) - 12);
      }
      npc._cultRateBase = null;
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return { ok: true, redeemed: true, vowId };
    },
    violateVow(W, npc, vowId, reasonTh) {
      if (!npc || !npc.voluntaryVows || !npc.voluntaryVows[vowId] || !npc.voluntaryVows[vowId].active) {
        return { ok: false, reason: 'vow-not-active' };
      }
      const v = npc.voluntaryVows[vowId];
      const spec = this.CATALOG[vowId] || this.CATALOG.VOW_NO_MEDICINE;
      v.active = false;
      v.violated = true;
      v.violatedDay = (W && W.day) || 1;
      v.violationReasonTh = reasonTh || 'ละเมิดสัจจะสาบาน';
      const tNow = (W && W.t) || ((g.STATS && g.STATS.now) || 0);
      if (g.STATS && g.STATS.addStatus) {
        g.STATS.addStatus(npc, 'vowBacklash', 30, { vowId, reasonTh: v.violationReasonTh }, tNow);
      }
      if (npc.h && npc.h.state) {
        npc.h.state.heartDemon = clamp((npc.h.state.heartDemon || 0) + (spec.backlashHeartDemon || 28), 0, 100);
      }
      npc._cultRateBase = null;
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return { ok: true, violated: true, vowId, statusApplied: 'vowBacklash', heartDemonAdded: spec.backlashHeartDemon || 28 };
    },
    getCultivationMult(npc) {
      if (!npc || !npc.voluntaryVows) return 1.0;
      let mult = 1.0;
      for (const [k, v] of Object.entries(npc.voluntaryVows)) {
        if (!v) continue;
        const spec = this.CATALOG[k];
        if (v.active && !v.violated && spec) mult *= (spec.cultRateMult || 1.0);
        else if (v.violated) mult *= 0.82;
      }
      return +Math.min(1.60, mult).toFixed(3);
    },
    getStatBonuses(npc) {
      if (!npc || !npc.voluntaryVows) return { active: false, p: {}, f: {} };
      const p = {}, f = {};
      let active = false;
      for (const [k, v] of Object.entries(npc.voluntaryVows)) {
        if (!v || !v.active || v.violated) continue;
        const spec = this.CATALOG[k];
        if (!spec) continue;
        active = true;
        if (spec.atkBonusPct) p.atk = +((p.atk || 0) + spec.atkBonusPct).toFixed(3);
        if (spec.mdefBonusPct) p.mdef = +((p.mdef || 0) + spec.mdefBonusPct).toFixed(3);
        if (spec.penBonus) f.pen = (f.pen || 0) + spec.penBonus;
      }
      return { active, p, f };
    }
  };

  // S03: Toxin Synergy Matrix (การผสมพิษและโอสถหลายชั้น)
  CULT.TOXIN_SYNERGY_MATRIX = {
    REACTIONS: Object.freeze({
      CORROSIVE_MIASMA: {
        id: 'CORROSIVE_MIASMA',
        nameTh: 'หมอกพิษกัดกร่อนเกราะปราณ (Corrosive Miasma)',
        reqStatuses: ['poison', 'burn'],
        bonusDmgPct: 0.26,
        armorShredPct: 0.20,
        applyStatus: 'armorbreak'
      },
      HEMORRHAGIC_VENOM: {
        id: 'HEMORRHAGIC_VENOM',
        nameTh: 'พิษโลหิตสลายชีพจร (Hemorrhagic Venom)',
        reqStatuses: ['poison', 'bleed'],
        bonusDmgPct: 0.28,
        healBlockDur: 16,
        applyStatus: 'healBlock'
      },
      PARALYTIC_FROST_GU: {
        id: 'PARALYTIC_FROST_GU',
        nameTh: 'พิษกู่เหมันต์สะกดวิญญาณ (Paralytic Frost Gu)',
        reqStatuses: ['poison', 'chill'],
        bonusDmgPct: 0.24,
        castSlowAdd: 25,
        applyStatus: 'slow'
      },
      SPORE_HEART_CONTAGION: {
        id: 'SPORE_HEART_CONTAGION',
        nameTh: 'สปอร์พิษกู่กัดกินตันเถียน (Spore Heart Contagion)',
        reqStatuses: ['venomSeed', 'poison'],
        bonusDmgPct: 0.32,
        qiDrainPct: 0.15,
        applyStatus: 'sporeBloom'
      }
    }),
    evaluateTargetSynergy(W, f, attacker, target) {
      if (!target || !Array.isArray(target.sx)) return { triggered: false, reactions: [], bonusDmgMult: 1.0 };
      const tNow = (W && W.t) || ((g.STATS && g.STATS.now) || 0);
      const activeKeys = new Set(target.sx.filter(x => x && x.until > tNow).map(x => x.k));
      const triggeredList = [];
      let bonusMult = 1.0;
      for (const rx of Object.values(this.REACTIONS)) {
        if (rx.reqStatuses.every(k => activeKeys.has(k))) {
          triggeredList.push(rx);
          bonusMult += rx.bonusDmgPct || 0.20;
          if (rx.applyStatus && g.STATS && g.STATS.addStatus && !activeKeys.has(rx.applyStatus)) {
            const dur = rx.healBlockDur || 14;
            g.STATS.addStatus(target, rx.applyStatus, dur, { fromToxinSynergy: rx.id, armorShredPct: rx.armorShredPct || 0, castSlowAdd: rx.castSlowAdd || 0 }, tNow);
          }
          if (rx.qiDrainPct && !target.foe && target.cult && target.h && target.h.state) {
            const qm = CULT.qiMax(target);
            const drained = Math.round(qm * rx.qiDrainPct);
            target.h.state.qi = Math.max(0, (target.h.state.qi || 0) - drained);
            if (attacker && !attacker.foe && attacker.cult && attacker.h && attacker.h.state) {
              const aQm = CULT.qiMax(attacker);
              attacker.h.state.qi = Math.min(aQm, (attacker.h.state.qi || 0) + Math.round(drained * 0.6));
            }
          }
        }
      }
      return {
        triggered: triggeredList.length > 0,
        reactions: triggeredList,
        bonusDmgMult: +Math.min(1.65, bonusMult).toFixed(3)
      };
    }
  };

  // Section 2.7: Experience-Derived NPC Identity Traits (อัตลักษณ์ตัวละครที่งอกจากประสบการณ์จริง)
  CULT.EXPERIENCE_TRAITS = {
    CATALOG: Object.freeze({
      EXP_TRAIT_COMPANION_GUARDIAN: {
        id: 'EXP_TRAIT_COMPANION_GUARDIAN',
        nameTh: 'ผู้คุ้มภัยคู่บำเพ็ญ (Companion Guardian)',
        triggerEvent: 'PROTECTED_SECLUSION_OR_ALLY',
        threshold: 2,
        prosTh: 'ป้องกัน +14%, โล่คุ้มกันพวกพ้อง +18%, โอกาสรับดาเมจแทนแถวหลังสูงขึ้น',
        consTh: 'ยอมรับความเสี่ยงแทนผู้อื่น ทำให้เสียแรงกายและบาดเจ็บแทนสหายง่ายขึ้น (+10% ความเสียหายที่รับแทน)',
        recoveryPathTh: 'เข้าฌานปรับสมดุลจิตใจร่วมกับคู่บำเพ็ญหรือพักฟื้นในเรือนโอสถ 7 วัน',
        p: { def: 0.14, mdef: 0.10 },
        f: {},
        cultRateMult: 1.06,
        bodyblockBonusChance: 0.15
      },
      EXP_TRAIT_TRIBULATION_SURVIVOR: {
        id: 'EXP_TRAIT_TRIBULATION_SURVIVOR',
        nameTh: 'ผู้รอดชีวิตจากทัณฑ์สวรรค์ (Tribulation-Scarred Survivor)',
        triggerEvent: 'TRIBULATION_SURVIVED_OR_SCARRED',
        threshold: 1,
        prosTh: 'ต้านทานสายฟ้าและทัณฑ์สวรรค์ +25%, ป้องกันวิชา +15%, เจาะเกราะ +10%',
        consTh: 'รอยแผลเป็นสายฟ้าในเส้นชีพจรทำให้ใช้ปราณวิชาตัวเบาเพิ่มขึ้น +8%',
        recoveryPathTh: 'แช่สระไขกระดูกบรรพชนหรือรับการฝังเข็มทองเปิดชีพจรขั้นสูง',
        p: { mdef: 0.15, hp: 0.08 },
        f: { pen: 10 },
        cultRateMult: 1.08
      },
      EXP_TRAIT_SKEPTICAL_ARCHIVIST: {
        id: 'EXP_TRAIT_SKEPTICAL_ARCHIVIST',
        nameTh: 'นักคัดลอกคัมภีร์ผู้กังขา (Skeptical Archivist)',
        triggerEvent: 'MANUAL_STUDY_AND_ARCHIVE',
        threshold: 3,
        prosTh: 'ความเร็วศึกษาคัมภีร์ +24%, ความแม่นยำ +14, อ่านเกราะศัตรูทะลุปรุโปร่ง',
        consTh: 'คิดวิเคราะห์ซับซ้อนเกินไป ทำให้ความเร็วเคลื่อนที่ลดลงเล็กน้อย (-5)',
        recoveryPathTh: 'ออกเดินทางพเนจรยุทธภพเพื่อสัมผัสประสบการณ์จริงนอกหอคัมภีร์',
        p: { matk: 0.10, mdef: 0.10 },
        f: { acc: 14, move: -5 },
        cultRateMult: 1.12
      },
      EXP_TRAIT_BEAST_COVENANT_CARETAKER: {
        id: 'EXP_TRAIT_BEAST_COVENANT_CARETAKER',
        nameTh: 'ผู้ผูกพันธะอสูรคู่ชีพ (Beast-Covenant Caretaker)',
        triggerEvent: 'BEAST_NURTURE_AND_BOND',
        threshold: 2,
        prosTh: 'สายสัมพันธ์สัตว์อสูร +20%, สัตว์อสูรเหนื่อยล้าน้อยลง -25%, พลังชีวิต +12%',
        consTh: 'แบ่งปราณหล่อเลี้ยงสัตว์อสูรตลอดเวลา ทำให้ฟื้นฟูปราณส่วนตัวช้าลงเล็กน้อย (-6%)',
        recoveryPathTh: 'ส่งสัตว์อสูรพักผ่อนในอุทยานอสูรวิญญาณเพื่อคลายภาระสายใย',
        p: { hp: 0.12, atk: 0.08 },
        f: {},
        cultRateMult: 1.05
      },
      EXP_TRAIT_OATH_KEEPER: {
        id: 'EXP_TRAIT_OATH_KEEPER',
        nameTh: 'ผู้รักษาสัตย์สาบาน (Unyielding Oath-Keeper)',
        triggerEvent: 'UPHELD_VOW_OR_CONTRACT',
        threshold: 1,
        prosTh: 'อัตราบ่มเพาะ +15%, ต้านทานจิตมารและสถานะสะกดจิต +22%, คริติคอล +6%',
        consTh: 'ยึดมั่นในหลักการอย่างเคร่งครัด ปฏิเสธการใช้วิชาต้องห้ามหรือการลอบสังหารสกปรก',
        recoveryPathTh: 'บรรลุธรรมขั้นสูงหรือปลดเปลื้องพันธะสัญญาเมื่อครบกำหนด',
        p: { atk: 0.10, mdef: 0.12 },
        f: { crit: 6 },
        cultRateMult: 1.15
      },
      EXP_TRAIT_DEFEAT_VETERAN: {
        id: 'EXP_TRAIT_DEFEAT_VETERAN',
        nameTh: 'ทหารผ่านศึกผู้ลุกขึ้นจากความพ่ายแพ้ (Battle-Hardened Veteran)',
        triggerEvent: 'SURVIVED_HEAVY_DEFEAT',
        threshold: 1,
        prosTh: 'เมื่อเลือดต่ำกว่า 35% รับโบนัสป้องกัน +22% และดูดเลือด +12% (ปราการเฮือกสุดท้าย)',
        consTh: 'ความทรงจำจากบาดแผลเก่าทำให้ระมัดระวังตัวสูง ความเร็วร่ายวิชาเปิดศึกช้าลง -4',
        recoveryPathTh: 'คว้าชัยชนะในการประลองยุทธภพหรือทะลวงขั้นใหญ่สำเร็จเพื่อกู้คืนความมั่นใจเต็มเปี่ยม',
        p: { def: 0.12, hp: 0.10 },
        f: { cast: -4, pen: 8 },
        cultRateMult: 1.05
      }
    }),

    ensureState(npc) {
      if (!npc) return null;
      if (!Array.isArray(npc.experienceTraits)) npc.experienceTraits = [];
      if (!npc.experienceEventLog || typeof npc.experienceEventLog !== 'object') {
        npc.experienceEventLog = { counts: {}, processedKeys: {} };
      }
      return { traits: npc.experienceTraits, log: npc.experienceEventLog };
    },

    MAX_PROCESSED_KEYS: 64,
    hasTrait(npc, traitId) {
      return !!(npc && Array.isArray(npc.experienceTraits) && npc.experienceTraits.some(t => t && t.active && t.id === traitId));
    },
    recordExperienceEvent(W, npc, eventKind, eventUniqueKey) {
      if (!npc || npc.foe) return { ok: false, reason: 'invalid-npc' };
      const st = this.ensureState(npc);
      const uKey = eventUniqueKey == null ? null : String(eventKind) + ':' + String(eventUniqueKey);
      // Idempotent guard: never double-count the same unique event key
      if (uKey && st.log.processedKeys[uKey]) {
        return { ok: true, deduplicated: true, traits: st.traits };
      }
      if (uKey) {
        if (pKeys.length >= this.MAX_PROCESSED_KEYS) delete st.log.processedKeys[pKeys[0]];
        st.log.processedKeys[uKey] = (W && W.day) || 1;
      }
      st.log.counts[eventKind] = (st.log.counts[eventKind] || 0) + 1;

      const unlockedNow = [];
      for (const spec of Object.values(this.CATALOG)) {
        if (spec.triggerEvent === eventKind && st.log.counts[eventKind] >= spec.threshold) {
          if (!st.traits.some(t => t && t.id === spec.id)) {
            const entry = {
              id: spec.id,
              nameTh: spec.nameTh,
              prosTh: spec.prosTh,
              consTh: spec.consTh,
              recoveryPathTh: spec.recoveryPathTh,
              grantedDay: (W && W.day) || 1,
              sourceEvent: eventKind,
              active: true
            };
            st.traits.push(entry);
            unlockedNow.push(entry);
          }
        }
      }
      if (unlockedNow.length) {
        npc._cultRateBase = null;
        if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      }
      return { ok: true, count: st.log.counts[eventKind], unlockedNow, traits: st.traits };
    },

    resolveTraitRecovery(W, npc, traitId) {
      if (!npc || !Array.isArray(npc.experienceTraits)) return { ok: false, reason: 'no-traits' };
      const idx = npc.experienceTraits.findIndex(t => t && t.id === traitId);
      if (idx < 0) return { ok: false, reason: 'trait-not-found' };
      const removed = npc.experienceTraits.splice(idx, 1)[0];
      if (npc.h && npc.h.state) {
        npc.h.state.heartDemon = Math.max(0, (npc.h.state.heartDemon || 0) - 10);
      }
      npc._cultRateBase = null;
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return { ok: true, recoveredTrait: removed, remainingTraits: npc.experienceTraits.length };
    },

    getCultivationMult(npc) {
      if (!npc || !Array.isArray(npc.experienceTraits) || !npc.experienceTraits.length) return 1.0;
      let mult = 1.0;
      for (const tr of npc.experienceTraits) {
        if (!tr || !tr.active) continue;
        const spec = this.CATALOG[tr.id];
        if (spec && spec.cultRateMult) mult *= spec.cultRateMult;
      }
      return +Math.min(1.40, mult).toFixed(3);
    },

    getStatBonuses(npc) {
      if (!npc || !Array.isArray(npc.experienceTraits) || !npc.experienceTraits.length) return { active: false, p: {}, f: {} };
      const p = {}, f = {};
      const hpf = (npc._hpf != null) ? npc._hpf : ((npc.h && npc.h.state && npc.h.state.hp != null && g.CULT && g.CULT.hpMax) ? (npc.h.state.hp / Math.max(1, g.CULT.hpMax(npc))) : 1);
      for (const tr of npc.experienceTraits) {
        if (!tr || !tr.active) continue;
        const spec = this.CATALOG[tr.id];
        if (!spec) continue;
        for (const [k, v] of Object.entries(spec.p || {})) p[k] = +((p[k] || 0) + v).toFixed(3);
        for (const [k, v] of Object.entries(spec.f || {})) f[k] = (f[k] || 0) + v;
        if (tr.id === 'EXP_TRAIT_DEFEAT_VETERAN' && hpf < 0.35) {
          p.def = +((p.def || 0) + 0.10).toFixed(3);
        }
      }
      return { active: true, p, f };
    }
  };


  /* =========================================================================
   * PATCH v2.4.0 [SECTION 2.6]: ABYSSAL & DEMONIC HIGHER REALMS PANTHEON
   * (4 พิภพมารอเวจีเบื้องล่าง & 15 จอมมาร/อสูร/ซาตาน/โยไค)
   * ========================================================================= */
  CULT.DEMONIC_PANTHEON = {
    COVENANT_COST_STONES: 160,
    PLANES: Object.freeze({
      NINE_SERENITIES_HELL: {
        id: 'NINE_SERENITIES_HELL',
        nameTh: 'นรกภูมิเก้าบาดาลและมารสวรรค์ (Nine Serenities Hell & Mara Heaven)',
        civilizationTh: 'จีน-พุทธมหายาน (นรกภูมิ/มารปาปิรัน)',
        gaugeId: 'INFERNAL_SIN',
        lords: ['MARA_PAPIYAN', 'CHIYOU_WARLORD', 'XINGTIAN_HEADLESS', 'KING_YAMA_JUDGE']
      },
      ASURA_BLOOD_SEA: {
        id: 'ASURA_BLOOD_SEA',
        nameTh: 'ทะเลโลหิตอสูรและรากษส (Asura Blood Sea & Rakshasa Realm)',
        civilizationTh: 'พระเวท-ฮินดูและพุทธวัชรญาณ (อสูร/รากษส)',
        gaugeId: 'ASURA_WRATH',
        lords: ['RAVANA_TEN_HEADS', 'MAHISASURA_DEMON', 'KALI_BLOOD_MOTHER', 'VRTRA_DROUGHT_SERPENT']
      },
      INFERNAL_PANDEMONIUM: {
        id: 'INFERNAL_PANDEMONIUM',
        nameTh: 'ขุมนรกอเวจีแพนเดโมเนียม (Infernal Pandemonium & Nine Hells)',
        civilizationTh: 'ตะวันตก-โกเอเทียและอับราฮัม (ซาตาน/อาร์ชเดวิล)',
        gaugeId: 'INFERNAL_SIN',
        lords: ['LUCIFER_MORNINGSTAR', 'BEELZEBUB_GLUTTONY', 'ASMODEUS_LUST_WRATH', 'MEPHISTOPHELES_PACT']
      },
      HYAKKI_YOKAI_REALM: {
        id: 'HYAKKI_YOKAI_REALM',
        nameTh: 'แดนร้อยอสูรรัตติกาลและพญามารที่หก (Hyakki Yagyo & Dairokuten Maoh)',
        civilizationTh: 'ญี่ปุ่น-องเมียวจิและโยไค (จอมมารฟ้าที่หก/โอนิ)',
        gaugeId: 'ASURA_WRATH',
        lords: ['DAIROKUTEN_MAOH', 'SHUTEN_DOJI_ONI', 'TAMAMO_NO_MAE_NINE_TAILS']
      }
    }),
    LORDS: Object.freeze({
      MARA_PAPIYAN: { id: 'MARA_PAPIYAN', plane: 'NINE_SERENITIES_HELL', nameTh: 'พญามารปาปิรัน (Mara Papiyan)', bonusAtkPct: 0.16, bonusMatkPct: 0.22, backlashRisk: 0.08, avatarSkillNameTh: 'มารสวรรค์แปรผันหกภพ' },
      CHIYOU_WARLORD: { id: 'CHIYOU_WARLORD', plane: 'NINE_SERENITIES_HELL', nameTh: 'จอมมารสงครามชือโหยว (Chiyou the Demon Emperor)', bonusAtkPct: 0.24, bonusPen: 16, backlashRisk: 0.09, avatarSkillNameTh: 'ศาสตรามารชือโหยวสังหารเทพ' },
      XINGTIAN_HEADLESS: { id: 'XINGTIAN_HEADLESS', plane: 'NINE_SERENITIES_HELL', nameTh: 'อสูรไร้เศียรสิงเทียน (Xingtian the Undying)', bonusAtkPct: 0.20, bonusHpPct: 0.20, backlashRisk: 0.07, avatarSkillNameTh: 'ขวานโล่สิงเทียนท้าทายสวรรค์' },
      KING_YAMA_JUDGE: { id: 'KING_YAMA_JUDGE', plane: 'NINE_SERENITIES_HELL', nameTh: 'พญายมราชตัดสินวิญญาณ (King Yama of the Ten Courts)', bonusMatkPct: 0.20, bonusMdefPct: 0.16, backlashRisk: 0.05, avatarSkillNameTh: 'สมุดบัญชีเป็นตายสะบั้นวิญญาณ' },
      RAVANA_TEN_HEADS: { id: 'RAVANA_TEN_HEADS', plane: 'ASURA_BLOOD_SEA', nameTh: 'พญารากษสทศกัณฐ์ (Ravana of the Ten Crowns)', bonusAtkPct: 0.22, bonusDefPct: 0.16, backlashRisk: 0.08, avatarSkillNameTh: 'ทศเศียรยี่สิบกรถล่มไตรภูมิ' },
      MAHISASURA_DEMON: { id: 'MAHISASURA_DEMON', plane: 'ASURA_BLOOD_SEA', nameTh: 'มหิงสาสูรผู้บดขยี้สวรรค์ (Mahishasura)', bonusAtkPct: 0.18, bonusHpPct: 0.22, backlashRisk: 0.07, avatarSkillNameTh: 'กายาอสูรมหิงสาอมตะ' },
      KALI_BLOOD_MOTHER: { id: 'KALI_BLOOD_MOTHER', plane: 'ASURA_BLOOD_SEA', nameTh: 'พระแม่กาลีปางโลหิตพิโรธ (Wrathful Blood Kali)', bonusAtkPct: 0.25, bonusCrit: 12, backlashRisk: 0.10, avatarSkillNameTh: 'ระบำโลหิตกาลีกลืนโลกา' },
      VRTRA_DROUGHT_SERPENT: { id: 'VRTRA_DROUGHT_SERPENT', plane: 'ASURA_BLOOD_SEA', nameTh: 'พญานาคราชอสูรวฤตรา (Vrtra the Sky-Swallower)', bonusMatkPct: 0.22, bonusDefPct: 0.15, backlashRisk: 0.07, avatarSkillNameTh: 'เกล็ดอสูรวฤตรากลืนเมฆา' },
      LUCIFER_MORNINGSTAR: { id: 'LUCIFER_MORNINGSTAR', plane: 'INFERNAL_PANDEMONIUM', nameTh: 'จอมมารลูซิเฟอร์ดาราประกายพรึก (Lucifer Morningstar)', bonusAtkPct: 0.20, bonusMatkPct: 0.24, backlashRisk: 0.09, avatarSkillNameTh: 'แสงดาราตกสวรรค์พิพากษา' },
      BEELZEBUB_GLUTTONY: { id: 'BEELZEBUB_GLUTTONY', plane: 'INFERNAL_PANDEMONIUM', nameTh: 'เบลเซบับจ้าวแห่งความตะกละ (Beelzebub Lord of Flies)', bonusHpPct: 0.24, lifestealBonus: 0.14, backlashRisk: 0.08, avatarSkillNameTh: 'ฝูงแมลงอเวจีกลืนกินปราณ' },
      ASMODEUS_LUST_WRATH: { id: 'ASMODEUS_LUST_WRATH', plane: 'INFERNAL_PANDEMONIUM', nameTh: 'อัสโมเดอุสราชาตัณหาและโทสะ (Asmodeus)', bonusAtkPct: 0.22, bonusCrit: 14, backlashRisk: 0.09, avatarSkillNameTh: 'เพลิงตัณหาอเวจีเผาผลาญจิต' },
      MEPHISTOPHELES_PACT: { id: 'MEPHISTOPHELES_PACT', plane: 'INFERNAL_PANDEMONIUM', nameTh: 'เมฟิสโตเฟลิสผู้ถือสัญญาวิญญาณ (Mephistopheles)', bonusMatkPct: 0.25, bonusCast: 14, backlashRisk: 0.08, avatarSkillNameTh: 'พันธสัญญาแลกวิญญาณนิรันดร์' },
      DAIROKUTEN_MAOH: { id: 'DAIROKUTEN_MAOH', plane: 'HYAKKI_YOKAI_REALM', nameTh: 'ไดโรกุเท็นมาโอ พญามารฟ้าที่หก (Dairokuten Maoh)', bonusAtkPct: 0.24, bonusPen: 15, backlashRisk: 0.09, avatarSkillNameTh: 'เพลิงมารฟ้าที่หกผลาญสวรรค์' },
      SHUTEN_DOJI_ONI: { id: 'SHUTEN_DOJI_ONI', plane: 'HYAKKI_YOKAI_REALM', nameTh: 'ชูเท็นโดจิ ราชันย์ยักษ์โอนิ (Shuten-Doji)', bonusAtkPct: 0.22, bonusHpPct: 0.18, backlashRisk: 0.08, avatarSkillNameTh: 'สุราโลหิตอสูรขุนเขาต้าเจียง' },
      TAMAMO_NO_MAE_NINE_TAILS: { id: 'TAMAMO_NO_MAE_NINE_TAILS', plane: 'HYAKKI_YOKAI_REALM', nameTh: 'ทามาโมะโนะมาเอะ จิ้งจอกเก้าหางทองคำ (Tamamo-no-Mae)', bonusMatkPct: 0.24, bonusCast: 12, backlashRisk: 0.07, avatarSkillNameTh: 'ศิลาสังหารเซ็ตโชเซกิเก้าหาง' }
    }),
    formDemonPact(W, npcOrId, lordId, opts) {
      opts = opts || {};
      const npc = typeof npcOrId === 'string' ? (W && W.byId && W.byId[npcOrId]) : npcOrId;
      if (!npc || npc.dead) return { ok: false, reason: 'invalid-npc' };
      const lKey = String(lordId || 'MARA_PAPIYAN').toUpperCase();
      const lDef = this.LORDS[lKey];
      if (!lDef) return { ok: false, reason: 'invalid-demon-lord', lordId: lKey };
      if (npc.demonPact && npc.demonPact.lordId === lKey) {
        return { ok: true, unchanged: true, lordId: lKey, pact: npc.demonPact };
      }
      const cost = opts.free ? 0 : this.COVENANT_COST_STONES;
      if (cost) {
        if (!W || !W.sect || !W.world) return { ok: false, reason: 'invalid-world' };
        if ((W.sect.stones || 0) < cost) return { ok: false, reason: 'insufficient-stones', required: cost };
        const pool = W.world.resourcePool || (W.world.resourcePool = { stones: 50000, herbs: 5000, ores: 5000 });
        if (!Number.isFinite(pool.stones) || pool.stones < 0) return { ok: false, reason: 'invalid-world-pool' };
        if (g.ECO && g.ECO.pay) {
          if (!g.ECO.pay(W, cost, 'ทำพันธสัญญาโลหิตกับ「' + lDef.nameTh + '」')) return { ok: false, reason: 'insufficient-stones', required: cost };
        } else W.sect.stones -= cost;
        pool.stones += cost;
      }
      const pDef = this.PLANES[lDef.plane];
      npc.demonicRealmsGauge = npc.demonicRealmsGauge || { INFERNAL_SIN: 0, ASURA_WRATH: 0 };
      if (pDef && pDef.gaugeId) {
        npc.demonicRealmsGauge[pDef.gaugeId] = clamp((npc.demonicRealmsGauge[pDef.gaugeId] || 0) + 35, 0, 100);
      }
      npc.demonPact = {
        lordId: lKey,
        lordNameTh: lDef.nameTh,
        planeId: lDef.plane,
        planeNameTh: pDef ? pDef.nameTh : lDef.plane,
        bonusAtkPct: lDef.bonusAtkPct || 0,
        bonusMatkPct: lDef.bonusMatkPct || 0,
        bonusHpPct: lDef.bonusHpPct || 0,
        bonusDefPct: lDef.bonusDefPct || 0,
        bonusMdefPct: lDef.bonusMdefPct || 0,
        bonusCrit: lDef.bonusCrit || 0,
        bonusPen: lDef.bonusPen || 0,
        bonusCast: lDef.bonusCast || 0,
        lifestealBonus: lDef.lifestealBonus || 0,
        cultRatePct: lDef.cultRatePct || 0.14,
        backlashRisk: lDef.backlashRisk || 0.08,
        avatarSkillNameTh: lDef.avatarSkillNameTh,
        signedDay: (W && W.day) || 1
      };
      npc.demonicPact = npc.demonPact;
      npc.bloodCovenant = npc.demonPact;
      npc._cultRateBase = null;
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return { ok: true, lordId: lKey, pact: npc.demonPact };
    },
    getUnitBlessingBonuses(npc) {
      const dp = npc && (npc.demonPact || npc.demonicPact);
      if (!dp) return { active: false, p: {}, f: {}, cultRatePct: 0, lifestealBonus: 0, backlashRisk: 0 };
      return {
        active: true,
        p: {
          atk: dp.bonusAtkPct || 0,
          matk: dp.bonusMatkPct || 0,
          hp: dp.bonusHpPct || 0,
          def: dp.bonusDefPct || 0,
          mdef: dp.bonusMdefPct || 0
        },
        f: {
          crit: dp.bonusCrit || 0,
          pen: dp.bonusPen || 0,
          cast: dp.bonusCast || 0
        },
        cultRatePct: dp.cultRatePct || 0.14,
        lifestealBonus: dp.lifestealBonus || 0,
        backlashRisk: dp.backlashRisk || 0.08
      };
    }
  };

  /* === JS2_V3120_EMERGENT_LONGEVITY_START === */
  CULT.LONGEVITY = {
    ELIXIR_DIMINISH: [1.0, 0.5, 0.25, 0.1, 0],
    ANCIENT_POOL: [
      { id: "ANC_FROZEN_SWORD", nameTh: "จอมกระบี่หยกเหมันต์ (ผู้ตื่นจากโลงหยกยุคเก่า)", methodTh: "จำศีลโลงหยกเหมันต์", eraTh: "ปลายยุคที่ 74", remainingYears: 18, reasonTh: "ผนึกโลงหยกแตกร้าวจากแรงสั่นสะเทือนของแดนลับ จึงตื่นขึ้นมาสืบหาศิษย์สายกระบี่ที่ยังหลงเหลือ" },
      { id: "ANC_LEYLINE_SAGE", nameTh: "เฒ่าชีพจรศิลา (ผู้เฝ้าตาน้ำวิญญาณยุคก่อน)", methodTh: "ผูกชีพจรตาน้ำปฐพี", eraTh: "ยุคที่ 82", remainingYears: 24, reasonTh: "ชีพจรปฐพีแปรปรวนจนพันธะคลายตัว จำต้องออกท่องยุทธภพก่อนสิ้นอายุขัยที่เหลือ" },
      { id: "ANC_WINE_HERMIT", nameTh: "นักพรตสุราดับชีพจร (ผู้หลับใหลในไหพิษ)", methodTh: "จำศีลสุราพิษหยุดชีพจร", eraTh: "ยุคที่ 89", remainingYears: 15, reasonTh: "กลิ่นปราณศึกในยุคที่ 101 ปลุกให้ตื่นจากนิทรายาวนาน เพื่อดูว่าโลกยุทธภพเปลี่ยนแปลงไปเพียงใด" }
    ],
    ensure(n) {
      if (!n) return null;
      n.ext = n.ext || {};
      if (!n.ext.longevity) {
        n.ext.longevity = {
          stasis: false,
          stasisStartDay: 0,
          stasisDaysSaved: 0,
          leylineAnchored: false,
          leylineBonusYears: 0,
          beastSymbiosis: false,
          beastBonusYears: 0,
          beastNameTh: "",
          wakeReasonTh: ""
        };
      }
      return n.ext.longevity;
    },
    isPeacefulAccepter(n) {
      if (!n || !n.h) return true;
      const p = n.h.personality || {};
      const v = n.h.values || {};
      const hasGrudge = Array.isArray(n.h.mind && n.h.mind.grudges) && n.h.mind.grudges.length > 0;
      if (hasGrudge) return false;
      if ((p.ambition || 50) >= 62 || (p.caution || 50) >= 68 || (v.sectDuty || 50) >= 70) return false;
      return (p.composure || 50) >= 52 || (p.integrity || 50) >= 52;
    },
    wakeFromStasis(W, n, reasonTh) {
      if (!n || !n.ext || !n.ext.longevity || !n.ext.longevity.stasis) return false;
      const lg = n.ext.longevity;
      const sleptDays = Math.max(1, ((W && W.day) || 0) - (lg.stasisStartDay || 0));
      lg.stasis = false;
      lg.wakeReasonTh = reasonTh || "ครบกำหนดจำศีล";
      CULT.refreshLifespan(n);
      const nm = (g.HC && g.HC.fullName) ? g.HC.fullName(n) : (n.name || n.id);
      const txt = nm + " ตื่นจากการจำศีลผนึกเวลา (หลับใหลไป " + sleptDays + " วัน) — " + lg.wakeReasonTh;
      if (W && W.log) W.log("breakthrough", txt, [n.id], { severity: "MAJOR", promoteChronicle: true });
      if (g.SIM && g.SIM.PROSE && g.SIM.PROSE.recordLifeChapter) {
        g.SIM.PROSE.recordLifeChapter(W, n, txt, "milestone");
      }
      return true;
    },
    applyLeylineAnchor(W, n) {
      if (!W || !n || n.dead) return false;
      const lg = this.ensure(n);
      if (lg.leylineAnchored) return false;
      const stage = (n.cult && n.cult.stage) || 1;
      if (stage < 6) return false;
      const bonus = 35 + Math.min(25, (stage - 5) * 8);
      lg.leylineAnchored = true;
      lg.leylineBonusYears = bonus;
      CULT.refreshLifespan(n);
      const nm = (g.HC && g.HC.fullName) ? g.HC.fullName(n) : (n.name || n.id);
      const txt = nm + " ผูกชีพจรเข้ากับแกนวิญญาณของ" + ((W.sect && W.sect.name) || "สำนัก") + " ยืดอายุขัย +" + bonus + " ปี (แลกกับการไม่อาจก้าวพ้นเขตสำนักได้อีก)";
      if (W.log) W.log("breakthrough", txt, [n.id], { severity: "MAJOR", promoteChronicle: true });
      if (g.SIM && g.SIM.PROSE && g.SIM.PROSE.recordLifeChapter) g.SIM.PROSE.recordLifeChapter(W, n, txt, "lineage");
      return true;
    },
    isInStasis(n) {
      return !!(n && n.ext && n.ext.longevity && n.ext.longevity.stasis);
    },
    isHomeBound(n) {
      const lg = n && n.ext && n.ext.longevity;
      return !!(lg && (lg.stasis || lg.leylineAnchored));
    },
    getActiveBondedPet(n, preferPetId) {
      if (!n) return null;
      const list = Array.isArray(n.pets) && n.pets.length ? n.pets : (n.ext && Array.isArray(n.ext.pets) && n.ext.pets.length ? n.ext.pets : []);
      if (list.length) {
        const alive = list.filter(p => p && !p.dead && (p.hp == null || p.hp > 0));
        if (!alive.length) return null;
        if (preferPetId) {
          const exact = alive.find(p => p.id === preferPetId);
          if (exact) return exact;
        }
        return alive.slice().sort((a, b) => ((b.bondXp || b.bond || 0) + (b.tier || 1) * 40) - ((a.bondXp || a.bond || 0) + (a.tier || 1) * 40))[0];
      }
      if (n.pet && !n.pet.dead) return n.pet;
      return null;
    },
    applyBeastSymbiosis(W, n) {
      const pet = this.getActiveBondedPet(n);
      if (!W || !n || n.dead || !pet) return false;
      const lg = this.ensure(n);
      if (lg.beastSymbiosis) return false;
      const tier = pet.tier || 1;
      const bonus = 20 + Math.min(20, tier * 4);
      lg.beastSymbiosis = true;
      lg.beastBonusYears = bonus;
      lg.beastPetId = pet.id || null;
      lg.beastNameTh = pet.nameTh || pet.name || "อสูรคู่หู";
      CULT.refreshLifespan(n);
      const nm = (g.HC && g.HC.fullName) ? g.HC.fullName(n) : (n.name || n.id);
      const txt = nm + " ทำพันธะแบ่งปันลมปราณอายุขัยกับอสูรคู่หู「" + lg.beastNameTh + "」ยืดอายุขัย +" + bonus + " ปี (หากอสูรคู่หูสิ้นชีพจะเกิดแรงสะท้อนถึงกัน)";
      if (W.log) W.log("breakthrough", txt, [n.id], { severity: "MAJOR", promoteChronicle: true });
      if (g.SIM && g.SIM.PROSE && g.SIM.PROSE.recordLifeChapter) g.SIM.PROSE.recordLifeChapter(W, n, txt, "milestone");
      return true;
    },
    enterStasis(W, n, reasonTh) {
      if (!W || !n || n.dead) return false;
      const lg = this.ensure(n);
      if (lg.stasis) return false;
      lg.stasis = true;
      lg.stasisStartDay = W.day || 0;
      if (g.AI && g.AI.interruptFor) { try { g.AI.interruptFor(W, n); } catch (_) {} }
      n.act = { id: 'idle', stage: 'do', left: 60, total: 60, ctx: {}, why: [['จำศีลผนึกเวลา', 9]] };
      const nm = (g.HC && g.HC.fullName) ? g.HC.fullName(n) : (n.name || n.id);
      const txt = nm + " เข้าจำศีลผนึกเวลาเพื่อชะลอการเสื่อมถอยของอายุขัย (" + (reasonTh || "รอคอยวาสนาทะลวงขอบเขต") + ")";
      if (W.log) W.log("breakthrough", txt, [n.id], { severity: "NOTABLE", promoteChronicle: true });
      if (g.SIM && g.SIM.PROSE && g.SIM.PROSE.recordLifeChapter) g.SIM.PROSE.recordLifeChapter(W, n, txt, "milestone");
      return true;
    },
    maybeAwakenDormantAncient(W, triggerSourceTh, opts) {
      if (!W || !W.world) return null;
      W.world.awakenedAncients = Array.isArray(W.world.awakenedAncients) ? W.world.awakenedAncients : [];
      if (W.world.awakenedAncients.length >= 2) return null;
      const rng = W.rng;
      const chance = (opts && Number.isFinite(opts.chance)) ? opts.chance : 0.04;
      if (!opts || !opts.force) {
        if (!rng || !rng.chance(chance)) return null;
      }
      const remaining = this.ANCIENT_POOL.filter(a => !W.world.awakenedAncients.some(x => x.id === a.id));
      if (!remaining.length) return null;
      const pick = remaining[rng ? Math.floor(rng.next() * remaining.length) : 0];
      const rec = {
        id: pick.id,
        nameTh: pick.nameTh,
        methodTh: pick.methodTh,
        eraTh: pick.eraTh,
        awakenedDay: W.day || 1,
        remainingYears: pick.remainingYears,
        triggerSourceTh: triggerSourceTh || "แรงสั่นสะเทือนของชีพจรฟ้าดิน",
        reasonTh: pick.reasonTh
      };
      W.world.awakenedAncients.push(rec);
      const story = "แรงกระเพื่อมจาก" + rec.triggerSourceTh + " ทำให้ผนึกโบราณคลายตัว — " + rec.nameTh + " จาก" + rec.eraTh + " (" + rec.methodTh + ") ตื่นขึ้นสู่ยุคที่ 101 ด้วยพลังที่ถดถอยและอายุขัยที่เหลืออีกราว " + rec.remainingYears + " ปี (" + rec.reasonTh + ")";
      if (g.EXPED && g.EXPED.recordChronicle) {
        g.EXPED.recordChronicle(W, {
          category: "WITNESS_EPOCH",
          titleTh: "ผู้จำศีลข้ามยุคตื่นขึ้น: " + rec.nameTh,
          storyTh: story,
          consequenceTh: "ยอดคนยุคเก่าปรากฏตัวพร้อมอายุขัยจำกัด ไม่ทำลายเพดานพลังโลกเบื้องล่าง",
          quiet: false
        });
      }
      return rec;
    },
    evaluateDaily(W) {
      if (!W || !Array.isArray(W.npcs) || !W.rng) return;
      const rng = W.rng;
      const hasActiveRaid = Array.isArray(W.fights) && W.fights.some(f => f && !f.done && f.kind === "raid");

      for (let i = 0; i < W.npcs.length; i++) {
        const n = W.npcs[i];
        if (!n || n.dead) continue;
        const lg = n.ext && n.ext.longevity;

        // 1. Check active beast symbiosis backlash if pet died/lost
        if (lg && lg.beastSymbiosis && !this.getActiveBondedPet(n, lg.beastPetId)) {
          lg.beastSymbiosis = false;
          lg.beastBonusYears = 0;
          lg.beastPetId = null;
          CULT.refreshLifespan(n);
          if (n.h && n.h.state) n.h.state.hp = Math.max(1, Math.round(n.h.state.hp * 0.65));
          const nm = (g.HC && g.HC.fullName) ? g.HC.fullName(n) : n.id;
          if (W.log) W.log("crisis", nm + " ได้รับแรงสะท้อนจากพันธะอายุขัยอสูรคู่หูที่ขาดสะบั้น กายาบอบช้ำและอายุขัยหดสั้นลง", [n.id]);
        }

        // 2. Check active stasis hibernation
        if (lg && lg.stasis) {
          lg.stasisDaysSaved = +( (lg.stasisDaysSaved || 0) + 0.9 ).toFixed(2);
          const slept = (W.day || 0) - (lg.stasisStartDay || 0);
          if (hasActiveRaid) {
            this.wakeFromStasis(W, n, "รับรู้ภัยคุกคามต่อสำนัก จึงฝืนคลายผนึกออกมาช่วยต้านศึก");
          } else if (slept >= 180 && rng.chance(0.03)) {
            this.wakeFromStasis(W, n, "ปราณฟ้าดินแปรเปลี่ยนจนครบวาระตื่นจากการจำศีล");
          }
          continue;
        }

        if (n.away || n.travel || n.expId) continue;
        const age = (g.HC && g.HC.ageYears) ? g.HC.ageYears(n) : (n.age || 18);
        const life = Math.max(1, n.lifespanMax || CULT.lifespan(n));
        const lifeRatio = age / life;
        if (lifeRatio < 0.84) continue;

        // 3. Autonomous longevity pill handling (if carrying one in personal inventory n.inv.pills)
        const hasNoMedVow = !!(CULT.isAbstainingFromPills ? CULT.isAbstainingFromPills(n) : (n.voluntaryVows && n.voluntaryVows.VOW_NO_MEDICINE && n.voluntaryVows.VOW_NO_MEDICINE.active));
        if (!hasNoMedVow && n.inv && g.ECO && g.ECO.pillInfo) {
          const pillBag = (n.inv.pills && typeof n.inv.pills === 'object') ? n.inv.pills : n.inv;
          const pillKey = Object.keys(pillBag).find(k => {
            if (typeof pillBag[k] !== 'number' || !(pillBag[k] > 0)) return false;
            const info = g.ECO.pillInfo(k);
            return info && info.effect && (info.effect.lifeBonus || info.effect.lifespanBonus || info.effect.lifespanAdd);
          });
          if (pillKey) {
            const p = (n.h && n.h.personality) || {};
            const mentor = (n.mentorId || n.mentor) && W.byId && W.byId[n.mentorId || n.mentor];
            const mentorDying = mentor && !mentor.dead && ((g.HC.ageYears(mentor) / Math.max(1, mentor.lifespanMax || CULT.lifespan(mentor))) >= 0.88);
            if (mentorDying && (p.empathy || 50) >= 65 && ((mentor.ext && mentor.ext.longevityPillsTaken) || 0) < 4) {
              pillBag[pillKey]--;
              if (pillBag[pillKey] <= 0) delete pillBag[pillKey];
              mentor.inv = mentor.inv || {};
              mentor.inv.pills = mentor.inv.pills || {};
              mentor.inv.pills[pillKey] = (mentor.inv.pills[pillKey] || 0) + 1;
              const nm = g.HC.fullName(n), mm = g.HC.fullName(mentor);
              const txt = nm + " กตัญญูต่ออาจารย์ มอบโอสถอายุวัฒนะที่ถือครองอยู่ให้ " + mm + " เพื่อต่อชะตา";
              if (W.log) W.log("gift", txt, [n.id, mentor.id]);
              if (g.SIM && g.SIM.PROSE && g.SIM.PROSE.recordLifeChapter) g.SIM.PROSE.recordLifeChapter(W, n, txt, "lineage");
              continue;
            } else if (((n.ext && n.ext.longevityPillsTaken) || 0) < 4 && !this.isPeacefulAccepter(n)) {
              pillBag[pillKey]--;
              if (pillBag[pillKey] <= 0) delete pillBag[pillKey];
              if (g.ECO.applyPill) g.ECO.applyPill(W, n, pillKey);
              else if (g.ECO.usePill) g.ECO.usePill(W, n, pillKey);
              continue;
            }
          }
        }

        // 4. Peaceful/content elders accept natural mortality organically (NEVER forced)
        if (this.isPeacefulAccepter(n)) continue;

        const stage = (n.cult && n.cult.stage) || 1;
        const p = (n.h && n.h.personality) || {};
        const v = (n.h && n.h.values) || {};

        // 5. Emergent Leyline Anchor (Stage 6+, high sectDuty)
        if (stage >= 6 && (v.sectDuty || 50) >= 68 && !(lg && lg.leylineAnchored) && rng.chance(0.05)) {
          this.applyLeylineAnchor(W, n);
          continue;
        }
        // 6. Emergent Spirit Beast Symbiosis (strong bonded pet)
        const _candPet = this.getActiveBondedPet(n);
        if (_candPet && ((_candPet.bondXp || _candPet.bond || 0) >= 220 || _candPet.sovereignAwakened || (_candPet.tier || 1) >= 4) && !(lg && lg.beastSymbiosis) && rng.chance(0.06)) {
          this.applyBeastSymbiosis(W, n);
          continue;
        }
        // 7. Emergent Stasis Hibernation (Stage 5+, near end of life, driven)
        if (stage >= 5 && lifeRatio >= 0.86 && ((p.ambition || 50) >= 62 || (p.caution || 50) >= 68) && !(lg && lg.stasis) && rng.chance(0.05)) {
          this.enterStasis(W, n, "อายุขัยจวนเจียนดับสูญแต่ปณิธานยังไม่สิ้นสุด");
        }
      }

      // 7b. Tick down awakened ancients' remaining years
      if (W.world && Array.isArray(W.world.awakenedAncients) && W.world.awakenedAncients.length) {
        for (let ai = W.world.awakenedAncients.length - 1; ai >= 0; ai--) {
          const anc = W.world.awakenedAncients[ai];
          if (!anc || !Number.isFinite(anc.remainingYears)) continue;
          anc.remainingYears = +(anc.remainingYears - (1 / 360)).toFixed(4);
          if (anc.remainingYears <= 0) {
            W.world.awakenedAncients.splice(ai, 1);
            if (g.EXPED && g.EXPED.recordChronicle) {
              g.EXPED.recordChronicle(W, {
                category: "WITNESS_EPOCH",
                icon: "🕯️",
                titleTh: "บรรพชนตื่นผนึก「" + (anc.nameTh || anc.id) + "」ดับสูญคืนสู่ธุลี",
                storyTh: "หลังฝืนตื่นจากผนึกโบราณจนสิ้นอายุขัยเฮือกสุดท้าย บรรพชนโบราณ「" + (anc.nameTh || anc.id) + "」ได้จากไปอย่างสงบ ทิ้งไว้เพียงตำนานเล่าขานในยุทธภพ"
              });
            }
          }
        }
      }

      // 8. Rare organic awakening of a Dormant Ancient if Bloodless War localPressure is extreme (0-10 scale)
      const bwPressure = (W.world && W.world.livingInstitutions && W.world.livingInstitutions.bloodlessWar && (W.world.livingInstitutions.bloodlessWar.localPressure ?? W.world.livingInstitutions.bloodlessWar.pressure)) || 0;
      if (bwPressure >= 7) {
        this.maybeAwakenDormantAncient(W, "แรงกดดันศึกลูกคลื่นไร้โลหิตที่ปะทุถึงขีดสุด", { chance: 0.012 });
      }
    },
    // World-Symmetric Longevity for ALL external sects (identical rules, zero player-sect bias, never forced)
    evaluateExternalMember(W, m, sectObj, rollFn) {
      if (!W || !m || !sectObj) return null;
      const roll = typeof rollFn === "function" ? rollFn : () => 0.99;
      m.longevity = m.longevity || { stasis: false, stasisTicks: 0, leylineAnchored: false, beastSymbiosis: false, pillsTaken: 0 };
      const lg = m.longevity;
      const sName = sectObj.nameTh || sectObj.name || "สำนักต่างถิ่น";
      const mName = m.nameTh || m.name || "ผู้อาวุโส";

      // If currently in stasis: slow aging & check natural wake on crisis or elapsed cycle
      if (lg.stasis) {
        lg.stasisTicks = (lg.stasisTicks || 0) + 1;
        if (sectObj.inCrisis || (lg.stasisTicks >= 4 && roll("wake") < 0.28)) {
          lg.stasis = false;
          const why = sectObj.inCrisis ? "สำนักเผชิญวิกฤตจึงฝืนคลายผนึกออกมาค้ำจุน" : "ครบวาระจำศีลผนึกเวลา";
          if (g.EXPED && g.EXPED.recordChronicle) {
            g.EXPED.recordChronicle(W, {
              category: "WITNESS_EPOCH",
              titleTh: mName + " แห่ง" + sName + " ตื่นจากการจำศีล",
              storyTh: mName + " แห่ง" + sName + " คลายผนึกจำศีลกลับคืนสู่ยุทธภพ (" + why + ")",
              involvedSects: [sName],
              quiet: true
            });
          }
        }
        return "STASIS";
      }

      const maxLife = Math.max(40, m.lifespanMax || (65 + (m.stage || 1) * 24));
      const ratio = (m.ageYears || 20) / maxLife;
      if (ratio < 0.84) return null;

      // Peaceful/content external elders accept natural mortality organically (NOT forced)
      const amb = m.ambition != null ? m.ambition : 50;
      const integ = m.integrity != null ? m.integrity : 50;
      if (amb < 62 && integ >= 52 && !sectObj.inCrisis) return null;

      const stage = m.stage || 1;

      // 1. Diminishing-Returns Longevity Alchemy (requires wealthy external sect treasury)
      if ((sectObj.treasury || 0) >= 65 && lg.pillsTaken < 4 && roll("pill") < 0.14) {
        const mult = this.ELIXIR_DIMINISH[Math.min(lg.pillsTaken, this.ELIXIR_DIMINISH.length - 1)];
        const addY = mult > 0 ? Math.max(1, Math.round(20 * mult)) : 0;
        lg.pillsTaken += 1;
        if (addY > 0) {
          sectObj.treasury = Math.max(10, (sectObj.treasury || 65) - 10);
          m.lifespanMax = maxLife + addY;
          if (g.EXPED && g.EXPED.recordChronicle) {
            g.EXPED.recordChronicle(W, {
              category: "WITNESS_EPOCH",
              titleTh: sName + " กลั่นโอสถอายุวัฒนะต่อชะตาให้ " + mName,
              storyTh: mName + " แห่ง" + sName + " กลืนกินโอสถอายุวัฒนะ ยืดอายุขัย +" + addY + " ปี (ดื้อยาครั้งที่ " + lg.pillsTaken + "/4)",
              involvedSects: [sName],
              quiet: true
            });
          }
          return "ALCHEMY";
        }
      }

      // 2. Leyline Anchor (Stage 6+, high integrity/devotion)
      if (stage >= 6 && integ >= 62 && !lg.leylineAnchored && roll("leyline") < 0.10) {
        const bonus = 35 + Math.min(20, (stage - 5) * 7);
        lg.leylineAnchored = true;
        m.lifespanMax = maxLife + bonus;
        if (g.EXPED && g.EXPED.recordChronicle) {
          g.EXPED.recordChronicle(W, {
            category: "WITNESS_EPOCH",
            titleTh: mName + " แห่ง" + sName + " ผูกชีพจรแกนวิญญาณสำนัก",
            storyTh: mName + " แห่ง" + sName + " ฝากชีพจรไว้กับตาน้ำวิญญาณของสำนัก ยืดอายุขัย +" + bonus + " ปี แลกกับการไม่อาจก้าวพ้นเขตสำนักได้อีก",
            involvedSects: [sName],
            quiet: true
          });
        }
        return "LEYLINE";
      }

      // 3. Spirit Beast Symbiosis (Stage 5+)
      if (stage >= 5 && !lg.beastSymbiosis && roll("beast") < 0.08) {
        const bonus = 22 + Math.min(14, stage * 2);
        lg.beastSymbiosis = true;
        m.lifespanMax = maxLife + bonus;
        if (g.EXPED && g.EXPED.recordChronicle) {
          g.EXPED.recordChronicle(W, {
            category: "WITNESS_EPOCH",
            titleTh: mName + " แห่ง" + sName + " ทำพันธะอายุขัยกับอสูรพิทักษ์",
            storyTh: mName + " แห่ง" + sName + " แบ่งปันลมปราณอายุขัยกับอสูรคู่หู ยืดอายุขัย +" + bonus + " ปี",
            involvedSects: [sName],
            quiet: true
          });
        }
        return "BEAST";
      }

      // 4. Stasis Hibernation (Stage 5+, driven)
      if (stage >= 5 && ratio >= 0.86 && amb >= 62 && !lg.stasis && roll("stasis") < 0.12) {
        lg.stasis = true;
        lg.stasisTicks = 0;
        if (g.EXPED && g.EXPED.recordChronicle) {
          g.EXPED.recordChronicle(W, {
            category: "WITNESS_EPOCH",
            titleTh: mName + " แห่ง" + sName + " เข้าจำศีลผนึกเวลา",
            storyTh: mName + " แห่ง" + sName + " ปิดผนึกชีพจรจำศีลเพื่อชะลอความชราภาพ รอวาระแห่งยุทธภพในภายภาคหน้า",
            involvedSects: [sName],
            quiet: true
          });
        }
        return "STASIS";
      }
      return null;
    },
    // World-Symmetric Longevity for external political/clan cultivators (pl.persons)
    evaluateExternalPerson(W, p, rollFn) {
      if (!W || !p || !p.alive) return null;
      const roll = typeof rollFn === "function" ? rollFn : () => 0.99;
      p.longevity = p.longevity || { stasis: false, bonusYears: 0, pillsTaken: 0 };
      const lg = p.longevity;
      if (lg.stasis) {
        if (roll("wake") < 0.08) lg.stasis = false;
        return "STASIS";
      }
      const baseMax = 88 + Math.round((p.cultStage || 2) * 18) + (lg.bonusYears || 0);
      if ((p.ageYears || 20) < baseMax * 0.86) return null;
      if ((p.cultStage || 2) < 5) return null;
      if (lg.pillsTaken < 4 && roll("pill") < 0.06) {
        const mult = this.ELIXIR_DIMINISH[Math.min(lg.pillsTaken, this.ELIXIR_DIMINISH.length - 1)];
        const addY = mult > 0 ? Math.max(1, Math.round(18 * mult)) : 0;
        lg.pillsTaken += 1;
        if (addY > 0) {
          lg.bonusYears = (lg.bonusYears || 0) + addY;
          return "ALCHEMY";
        }
      }
      if (!lg.stasis && roll("stasis") < 0.04) {
        lg.stasis = true;
        return "STASIS";
      }
      return null;
    }
  };
  /* === JS2_V3120_EMERGENT_LONGEVITY_END === */

  g.CULT = CULT;
  if (typeof module === 'object' && module.exports) module.exports = CULT;

  /* ---------- Patch JS2-v2.6.0 Category 13: Cosmology, Diegetic Stage Naming, Upper-World Descent Law & Martial Sobriquets ---------- */
  CULT.LOWER_WORLD_CEILING_LORE_TH = 'ผู้ฝึกตนและสำนักในโลกเบื้องล่างเป็นผู้ขนานนามระดับขั้นสูงสุดว่า「เซียนสวรรค์」「อมตะ」หรือ「นิรันดร์」ขึ้นเองด้วยความมุ่งมั่นและศรัทธาที่อยากเป็นดั่งตำนานโลกเบื้องบน ทั้งที่ในความเป็นจริงของจักรวาล ขั้นสูงสุดปัจจุบันยังคงอยู่ภายใต้เพดานโลกเบื้องล่าง (อายุขัย 1,500–2,000 ปี · ยังไม่ใช่การทะลวงม่านฟ้าขึ้นสู่แดนบน)';
  CULT.UPPER_WORLD_DESCENT_LAW = Object.freeze({
    canDescend: true,
    constraints: Object.freeze([
      { id: 'SPECIAL_DESCENT_METHOD', titleTh: 'ต้องใช้วิธีพิเศษในการลงมา', descTh: 'ผู้มาจากโลกเบื้องบนไม่อาจเดินลงมาตามปกติ ต้องอาศัยค่ายกลรอยแยกมิติ พิธีสังเวยนำทาง ร่างสถิต หรือการผนึกตบะตนเองอย่างหนัก' },
      { id: 'VEIL_SUPPRESSED_POWER', titleTh: 'ถูกม่านกั้นภพกดทับต่ำกว่า 100%', descTh: 'กฎเกณฑ์และม่านกั้นภพของโลกเบื้องล่างกดทับผู้ลงมาอย่างรุนแรง ไม่มีผู้ใดลงมาต่อสู้ด้วยพลังเต็ม 100% ของร่างจริงได้' },
      { id: 'PLANAR_REPULSION_TIMER', titleTh: 'ไม่อาจพำนักอยู่ได้ถาวร', descTh: 'ในภาวะปกติ แรงผลักของม่านภพจะกัดกร่อนและบีบให้ผู้มาจากโลกเบื้องบนต้องถอนตัวกลับก่อนหมดเวลา' }
    ]),
    permanentStrandingException: Object.freeze({
      id: 'CRIPPLED_CULTIVATION_STRANDED',
      titleTh: 'ข้อยกเว้นการติดค้างถาวรเมื่อบาดเจ็บจนตบะร่วงหล่นหรือสูญสลาย',
      descTh: 'หากผู้ลงมาจากโลกเบื้องบนได้รับบาดเจ็บสาหัสจนระดับพลังร่วงหล่นต่ำกว่าเกณฑ์ม่านกั้นภพหรือสูญเสียตบะทั้งหมด ม่านฟ้าจะไม่ดีดพวกเขากลับอีกต่อไป ทำให้ติดค้างอยู่ในโลกเบื้องล่างอย่างถาวรจนสิ้นอายุขัย กลายเป็นที่มาของซากโบราณ สุสานเซียน และมรดกจากโลกเบื้องบน เช่น ทูตสวรรค์ตกสวรรค์ ขงหมิง (#21)'
    })
  });
  CULT.DOCTRINAL_CONTRAST_LORE = Object.freeze({
    GOD: 'วิถีเทพ (GOD) บ่มเพาะประกายเทวะกำเนิดเองจากแรงศรัทธา ธูปเทียน และศาลเจ้าในโลกเบื้องล่าง (มุ่งสร้างความเป็นเทพจากเบื้องล่างขึ้นไป)',
    DIVINE_CONDUITS: 'วิถีอัญเชิญ/ร่างทรง/สื่อเทวะ (DIVINE_SUMMONER / DIVINE_POSSESSION / DIVINE_CHANNELER) ทำหน้าที่เป็นสื่อกลางหยิบยืมอำนาจของร่างเงาสะท้อนที่ถูกม่านกั้นภพกดทับ (<100%) จากมหาเทพดั้งเดิมแห่งโลกเบื้องบน'
  });
  CULT.resolveMartialSobriquet = npc => {
    if (!npc || !npc.cult) return null;
    const eqSt = CULT.equivalentStage ? CULT.equivalentStage(npc) : (npc.cult.stage || 1);
    if (eqSt < 3) return null;
    const pDef = CULT.PATHS[npc.cult.path] || {};
    const subDef = CULT.subInfo ? CULT.subInfo(npc.cult.path, npc.cult.sub) : null;
    const rankPrefix = eqSt >= 8 ? 'ปรมาจารย์เซียนเดินดิน' : eqSt >= 6 ? 'เจ้ายุทธจักร' : eqSt >= 5 ? 'จอมยุทธ์ไร้พ่าย' : 'ยอดฝีมือ';
    const subTitle = (subDef && subDef.nameTh ? String(subDef.nameTh).replace(/^สาย/, '') : (pDef.shortTh || pDef.nameTh || 'ยุทธภพ'));
    return rankPrefix + 'ฉายา' + subTitle;
  };
  CULT.ensureDaoTitle = npc => {
    if (!npc || !npc.cult) return null;
    const eqSt = CULT.equivalentStage ? CULT.equivalentStage(npc) : (npc.cult.stage || 1);
    if (eqSt < 3) return null;
    npc.ext = npc.ext || {};
    if (!npc.ext.daoTitle) {
      npc.ext.daoTitle = CULT.resolveMartialSobriquet(npc);
    }
    return npc.ext.daoTitle;
  };

})(typeof globalThis !== 'undefined' ? globalThis : this);


;(function syncCultPathsNamingV260() {
  const gObj = typeof globalThis !== "undefined" ? globalThis : window;
  const C = gObj.CULT;
  if (!C || !C.PATHS) return;
  const pMap = {"XIAN":"วิถีเซียน","BODY":"วิถีกายา","GOD":"วิถีเทพศรัทธา","DEMON":"วิถีมาร","HEART_SOUL":"วิถีจิตเซน","MECH_PUPPET":"วิถีหุ่นกลไก","KARMA_SAMSARA":"วิถีสังสารวัฏ","BEAST_SOVEREIGN":"วิถีราชันอสูร","SAGE_SUPPORT":"วิถีปราชญ์โอสถ","CRAFT_CREATION":"วิถีหลอมสร้าง","ARRAY_TALISMAN":"วิถีค่ายกลยันต์","STRATEGY_GOVERNANCE":"วิถีพิชัยยุทธ์","ASTRO_DIVINATION":"วิถีโหราดารา","BUDDHA_DHARMA":"วิถีพุทธธรรม","VOID_SPACE":"วิถีมิติเร้น","SONIC_HARMONY":"วิถีคีตยุทธ์","VENOM_GU":"วิถีพิษกู่","PRIMORDIAL_SHIFTER":"วิถีจำแลงอสูร","CELESTIAL_WEATHER":"วิถีบัญชาฟ้าฝน","WANDERING_DAO":"วิถีคนจร","MERCANTILE_DAO":"วิถีวาณิชย์","DRAGON_VEIN_GEOMANCY":"วิถีชีพจรมังกร","GRAVITY_DAO":"วิถีถ่วงดารา","CHRONO_EPOCH":"วิถีกาลเวลา","INK_LITERATI":"วิถีอักษรปราชญ์","SOUL_PUPPETRY":"วิถีเชิดเงา","PRIMORDIAL_CHAOS":"วิถีโกลาหล","SHADOW_SAMURAI":"วิถีดาบไร้ปราณ","NINPO_SHADOW":"วิถีเร้นเงา","NINPO_ELEMENTAL":"วิถีมุทราธาตุ","DIVINE_SUMMONER":"วิถีอัญเชิญเทวะ","DIVINE_POSSESSION":"วิถีร่างทรงเทวะ","DIVINE_CHANNELER":"วิถีสื่อเทวบัญญัติ","VOID_HERETIC_PACT":"วิถีพันธะสุญตา","OCCULT_MAGE":"วิถีไสยเวทย์","DEVOURING_FLESH":"วิถีกลืนสรีระ","NETHER_GRAVE":"วิถีสุสานยมโลก","ANCESTRAL_RITUAL":"วิถีบรรพชน","TIDE_VOYAGER":"วิถีจ้าวสมุทร","LORE_ARCHIVIST":"วิถีอาลักษณ์","FORTUNE_GAMBLER":"วิถีเดิมพันชะตา","SPIRIT_HUSBANDRY":"วิถีพฤกษาปราณ","ARENA_GLORY":"วิถีสังเวียนยุทธ์","LEG_READ_FORM_BLADE":"วิถีกระบี่อ่านช่องฟ้า","LEG_TRIAGE_MERIDIAN":"วิถีชีพจรประคองสหาย","LEG_STORM_CALLER_TEMPEST":"วิถีจอมพายุบัญชาฟ้า","LEG_JADE_CARAVAN_VOYAGER":"วิถีจอมคาราวานหยก","LEG_OATH_JUDGE_WARDEN":"วิถีผู้คุมสัตย์สาบาน","LEG_ASHEN_KILN_ALCHEMY":"วิถีเตาเถ้าคืนชีวิต","TRANS_CONSTELLATION_RELAY":"วิถีประสานปราณหมู่ดาว","TRANS_FIELD_CLAUSE_SOVEREIGN":"วิถีธรรมนูญฟ้าขีดเขต","TRANS_TEMPO_SOVEREIGN":"วิถีปรมาจารย์จังหวะกาล","TRANS_SEALKEEPER_FORBIDDEN_KEY":"วิถีผู้ถือกุญแจผนึก","TRANS_PRIMAL_VORTEX_MIRROR":"วิถีกระจกสะท้อนหมื่นวิชา","TRANS_DYNASTIC_MANDATE_WEAVER":"วิถีทอชะตาแผ่นดิน","CORPSE_SOVEREIGN":"วิถีจอมคุมศพ","WRAITH_GRIEVANCE":"วิถีวิญญาณแค้น","DEATHLESS_CADAVER":"วิถีกายไร้ชีพ"};
  const sMap = {"SWORD_IMMORTAL":"กระบี่สวรรค์","FIVE_ELEMENTS":"เบญจธาตุสมดุล","ELIXIR_DAO":"โอสถอมฤต","ASTRAL_ARRAY":"ค่ายกลดารา","BLOOD_DEMON":"ปราณโลหิตแดง","PHANTOM_SOUL":"วิญญาณมายา","TIME_VOID":"กาลมิติเร้น","SOUND_ZITHER":"พิณสะกดจิต","YIN_YANG_HARMONY":"หยินหยางไร้ลักษณ์","FROST_MOON_IMMORTAL":"จันทราเหมันต์","STAR_ARCHER":"เซียนศรดารา","CLOUD_DRAGON_SPEAR":"ทวนมังกรเมฆา","PURE_SWORD_SAINT":"กระบี่ไร้ลักษณ์","CELESTIAL_STAR_SWORD":"กระบี่ผ่าดารา","KUNLUN_JADE_CAULDRON":"หม้อหยกกลั่นปราณ","NINE_HEAVENS_THUNDER_SEAL":"ตราอสนีเก้าฟ้า","TIGER_SOVEREIGN":"พยัคฆ์คลั่ง","BLOOD_DRAGON":"มังกรโลหิต","VAJRA_BODHI":"กายาวัชระ","DEVOURING_FIEND":"อสูรกลืนปราณ","SOLAR_FORGE":"เพลิงสุริยัน","THUNDER_BODY":"กายาอสนีบาต","JADE_IMMORTAL_BODY":"กายาหยกพิสุทธิ์","TITAN_MOUNTAIN_BODY":"ยักษ์แบกขุนเขา","WOOD_SPRING_BODY":"กายาพฤกษา","STAFF_GUARD":"พลองเหล็กพิทักษ์","WAR_SPEAR_SOVEREIGN":"ทวนศึกทลายทัพ","IRON_BOW_SENTINEL":"เกาทัณฑ์ศิลาเหล็ก","OVERLORD_HEAVY_BLADE":"จอมดาบผ่าผา","METEOR_IRON_FIST":"หมัดเหล็กดาวตก","NINE_SUNS_FURNACE_BODY":"เตาหลอมเก้าตะวัน","ABYSSAL_LEVIATHAN_BONE":"กระดูกมังกรบาดาล","WAR_DEITY":"เทพสงคราม","MERCY_DEITY":"เทพเมตตา","FATE_ORACLE":"เทพพยากรณ์","TOTEM_BEAST_GOD":"เทพอสูรบรรพกาล","UNDERWORLD_JUDGE":"ตุลาการยมโลก","OCEAN_SOVEREIGN":"เทพเจ้าสมุทร","HARVEST_EARTH_GOD":"เทพบิดรพืชพรรณ","MEDICINE_BODHI_GOD":"เทพโอสถเมตตา","SUN_BOW_DEITY":"เทพศรสุริยัน","GOLDEN_ARHAT_STAFF":"พลองทองพิทักษ์","SOLAR_CHARIOT_SOVEREIGN":"ราชรถสุริยัน","STYX_FERRYMAN_JUDGE":"คนแจวเรือข้ามแม่น้ำลืมเลือน","STORM_THUNDER_EMPEROR":"เทพพายุสายฟ้า","SHADOW_ASSASSIN":"นักฆ่าไร้เงา","VENOM_GU_SOVEREIGN":"จอมราชันย์หมื่นพิษกู่","NETHER_GHOST_KING":"ราชันภูตผี","HEAVEN_DEVOURING_DEMON":"จอมมารกลืนสวรรค์","SHADOW_ARCHER":"ศรเงาปลิดชีพ","BLOOD_SPEAR_ASURA":"ทวนโลหิตอสูร","ASHURA_SLAUGHTER_BLADE":"ดาบมารไร้ปรานี","CRIMSON_MOON_EXECUTIONER":"เพชฌฆาตจันทร์เลือด","MYRIAD_MIASMA_ALCHEMIST":"หมอกพิษมรณะ","ABYSSAL_SOUL_EATER":"มารกลืนวิญญาณ","ZEN_VOID_MIND":"จิตเซนสุญตา","CALLIGRAPHY_PAINTING_SAGE":"พู่กันภาพมายา","DREAM_ILLUSION_WEAVER":"ทอมายาสุบิน","MIND_SWORD_TELEKINESIS":"กระบี่จิตไร้รูป","ZITHER_HEART_BOW":"ศรพิณสะกดจิต","HEART_BLADE_MEDITATION":"มีดบินประสานใจ","VOID_SPEAR_MIND":"ทวนจิตสุญตา","CELESTIAL_CHESS_SCHOLAR":"หมากล้อมบัญชาจิต","SEVEN_EMOTIONS_ZITHER":"พิณมารเจ็ดอารมณ์สะกดจิต","VOID_LOTUS_CONTEMPLATOR":"ปทุมแก้วส่องจิต","HEAVENLY_GOLEM":"หุ่นศิลาเทวะ","THOUSAND_THREAD_ASSASSIN":"ใยไหมสังหาร","BEAST_CHIMERA_MECH":"พยัคฆ์กลเหล็ก","CELESTIAL_BALLISTA":"หน้าไม้กลดารา","SOUL_VESSEL_AVATAR":"หุ่นกายทิพย์","FLYING_BLADE_ORBITER":"กงล้อพันกระบี่","ASTRAL_CLOCKWORK_PRIME":"เฟืองดาราคำนวณ","THUNDER_CORE_ARTILLERY":"ท่ออสนีถล่มค่าย","JADE_SPIDER_WEAVER":"หุ่นแมงมุมหยก","SOLAR_BRONZE_COLOSSUS":"หุ่นยักษ์สำริด","REVERSED_RETRIBUTION":"วิบากย้อนกรรม","SIX_PATHS_WHEEL":"กงล้อหกภพ","FATE_SEVERING_THREAD":"ด้ายตัดวาสนา","LOTUS_MERCY_PURIFIER":"ปทุมชำระบาป","ASURA_JUDGMENT_BLADE":"ดาบทัณฑ์อสูร","PAST_LIFE_MIRROR":"กระจกชาติภพ","BODHI_VOW_GUARDIAN":"ปณิธานคุ้มภพ","CAUSE_EFFECT_LEDGER":"สมุดบัญชีกรรม","NETHER_RIVER_REAPER":"โซ่ยมทูตลืมเลือน","GOLDEN_WHEEL_ARBITER":"กงล้อทองตัดสิน","MYRIAD_BEAST_PACK":"จ้าวฝูงหมื่นอสูร","PRIMORDIAL_BLOOD_MUTATOR":"ปลุกเลือดบรรพกาล","SYMBIOTIC_BEAST_WARRIOR":"นักรบผสานอสูร","COLOSSUS_SHIELD_TAMER":"อสูรยักษ์คุ้มด่าน","SWARM_GU_HIVE_MASTER":"จ้าวฝูงแมลงพิษ","CELESTIAL_ASTRAL_FAIRY_TAMER":"พันธะภูตพฤกษา","ABYSSAL_DRAGON_TOTEM":"มังกรสมุทรอัสนี","KUNPENG_WIND_RIDER":"ขี่พญาคุนเผิง","QILIN_THUNDER_HERALD":"กิเลนอสนี","NINE_NETHER_SERPENT_LORD":"อสรพิษเก้ายมโลก","GOLDEN_NEEDLE_SAINT":"ปราชญ์เข็มทอง","CELESTIAL_ZITHER_ENVOY":"พิณทิพย์ชูใจ","DIVINE_NECTAR_APOTHECARY":"หมอนํ้าค้างทิพย์","QIMEN_TALISMAN_PATRON":"ยันต์ฉีเหมินคุ้มทัพ","SOUL_LANTERN_SHEPHERD":"โคมวิญญาณคุ้มชีพ","WAR_BANNER_CHORISTER":"ธงศึกปลุกขวัญ","WOOD_SPIRIT_SYMBIONT":"ปราณพฤกษาชุบชีพ","IMMORTAL_PEACH_APOTHECARY":"โอสถท้อต่อชะตา","EIGHT_TRIGRAMS_BANNER_SAGE":"ธงแปดทิศหนุนทัพ","CELESTIAL_INK_CHRONICLER":"หมึกทองจารึกคุณ","PILL_FURNACE_IMMORTAL":"เตาโอสถเก้าทวาร","POISON_VENOM_CAULDRON":"หม้อหลอมร้อยพิษ","HEAVENLY_ANVIL_SMITH":"ทั่งเหล็กร้อยหลอม","SPIRIT_SWORD_ARTIFICER":"ช่างกระบี่วิญญาณ","RUNE_ARRAY_ENGRAVER":"สลักอักขระศาสตรา","DIVINE_FLAME_SMELTER":"อัคคีหลอมแร่","SPIRIT_FEAST_HEALER":"ครัวทิพย์ฟื้นชีวา","JADE_MEAL_PREPARER":"สำรับหยกบำเพ็ญ","CELESTIAL_ARMOR_ARTISAN":"ช่างเกราะไหมเหล็ก","STAR_METEOR_WEAPONSMITH":"ช่างเหล็กดาวตก","NINE_REVOLUTIONS_ALCHEMIST":"โอสถเก้าวัฏจักร","PUPPET_RELIC_ARTIFICER":"ช่างหลอมของวิเศษ","EARTH_VEIN_WARDEN":"ค่ายกลชีพจรดิน","SEAL_SCRIPT_EXORCIST":"ยันต์ผนึกปราบมาร","THUNDER_TALISMAN_ADEPT":"ยันต์อสนีทลายทัพ","MIRAGE_ARRAY_WEAVER":"ค่ายกลพรางเงา","ASTRAL_STARFALL_ARRAY":"ค่ายกลดาวตก","VERMILION_SEAL_TALISMAN":"ยันต์ชาดสุริยัน","LABYRINTH_MIST_FORMATION":"ค่ายกลหมอกวงกต","BATTLEFIELD_STRATEGIST":"กุนซือธงศึก","SECT_STEWARD":"พ่อบ้านดูแลสำนัก","DIPLOMATIC_ENVOY":"ทูตประสานไมตรี","CARAVAN_QUARTERMASTER":"พลาธิการคาราวาน","CIVIL_TEACHING_MENTOR":"อาจารย์อบรมศิษย์","IMPERIAL_SEAL_CHANCELLOR":"เสนาบดีตราหยก","SHADOW_INTELLIGENCE_MARSHAL":"ข่าวกรองเงาจันทร์","GRAND_LOGISTICS_COMMANDER":"ส่งบำรุงหมื่นลี้","STAR_CHART_PROPHET":"พยากรณ์ผังดาว","POLARIS_FATE_WEAVER":"ทอชะตาดาวเหนือ","ECLIPSE_DOOM_SEER":"เนตรสุริยคราส","METEOR_OMEN_CALLER":"เพรียกดาวตก","QIMEN_EIGHT_GATES_DIVINER":"ฉีเหมินแปดประตู","BIG_DIPPER_LONGEVITY_SAGE":"กระบวยดาราต่อชะตาฟ้า","VAJRA_WRATH_GUARDIAN":"ธรรมบาลวัชระพิโรธปราบมาร","GOLDEN_LOTUS_CHAN":"ฌานบัวทอง","SUTRA_CHANT_ARHAT":"อรหันต์สวดมนต์","THOUSAND_PALM_BODHISATTVA":"มหาเมตตาโพธิสัตว์พันกร","RELIC_PAGODA_KEEPER":"พิทักษ์เจดีย์ธาตุ","KARMA_FIRE_ASCETIC":"เพลิงกัลป์เผาวิบาก","DIMENSIONAL_BLADE_REAPER":"คมดาบตัดมิติ","VOID_BLINK_STRIDER":"ก้าวพริบตาข้ามว่าง","POCKET_REALM_ARCHITECT":"เนรมิตมิติย่อย","SINGULARITY_COLLAPSE_MAGE":"หลุมดำกลืนมิติ","PHASE_MIRAGE_ASSASSIN":"เร้นเงาเหลื่อมภพ","SPATIAL_BARRIER_WARDEN":"ม่านกระจกมิติ","SEVEN_STRINGS_ANNIHILATION":"พิณเจ็ดสายสังหาร","JADE_FLUTE_SOUL_CHARMER":"ขลุ่ยหยกสะกดจิต","WAR_DRUM_TEMPEST_HERALD":"กลองศึกสะท้านภพ","RESONANT_BELL_EXORCIST":"กระดิ่งสลายมาร","SILENT_WAVE_ASSASSIN":"คลื่นเสียงไร้รูป","CELESTIAL_CHOIR_CONDUCTOR":"จ้าวทำนองประสาน","GOLDEN_SILKWORM_GU_LORD":"ราชันกู่ไหมทอง","MYRIAD_VENOM_APOTHECARY":"หมอพิษหมื่นบุปผา","BLOOD_PARASITE_HEXER":"กู่โลหิตสูบชีพ","CORROSIVE_MIASMA_WEAVER":"หมอกพิษกัดเกราะ","SCORPION_CLAW_EXECUTIONER":"กรงเล็บแมงป่องพิษ","IMMORTAL_NECTAR_TOXIN_SAGE":"หัตถ์พิษแปรเปลี่ยนเป็นน้ำอมฤต","AZURE_DRAGON_SCALE_SHIFTER":"เกล็ดมังกรคราม","WHITE_TIGER_FANG_RAVAGER":"เขี้ยวพยัคฆ์ขาว","VERMILION_PHOENIX_WING_ASCENDANT":"ปีกหงส์เพลิงคืนชีพ","BLACK_TORTOISE_SHELL_COLOSSUS":"กระดองเต่าดำ","FIEND_APE_TITAN_MORPH":"พญาวานรทลายผา","NINE_TAIL_MIRAGE_SHIFTER":"จิ้งจอกเก้าหาง","THUNDER_CLOUD_CALLER":"เมฆาอสนีบาต","MONSOON_RAIN_WEAVER":"พิรุณสลายเพลิง","BLIZZARD_FROST_HERALD":"พายุหิมะเยือกแข็ง","TYPHOON_GALE_SOVEREIGN":"พายุคลั่งกวาดทัพ","MIRAGE_FOG_SHROUDER":"หมอกทึบพรางสัมผัส","SOLAR_ZENITH_INVOKER":"แสงสุริยันแผดเผา","HORIZON_WIND_WALKER":"คนจรสุดขอบฟ้า","RUIN_PATHFINDER_SAGE":"บุกเบิกซากโบราณ","CARAVAN_ESCORT_VANGUARD":"คุ้มภัยคาราวาน","WILDERNESS_BEAST_TRACKER":"พรานแกะรอยอสูร","CLOUD_STEP_HERMIT":"ฤๅษีเหยียบเมฆา","REALM_MAPPER_CHRONICLER":"วาดแผนที่หมื่นลี้","GOLDEN_ABACUS_ARBITER":"ลูกคิดทองคำ","BLOOD_CONTRACT_NOTARY":"พันธสัญญาโลหิต","CARAVAN_SYNDICATE_MAGNATE":"เจ้าสัวคาราวาน","TREASURE_APPRAISER_SAGE":"ปราชญ์ดูของวิเศษ","DEBT_FORECLOSURE_ENFORCER":"ผู้คุมกฎทวงหนี้","EQUITY_SHIELD_CHANCELLOR":"ตราชั่งคลังสมดุล","LUOPAN_GEOMANCER_SAGE":"หลัวผานชี้มงคล","MOUNTAIN_SPINE_ANCHOR":"ตรึงสันหลังขุนเขา","LEYLINE_WARD_ARCHITECT":"ผังค่ายชีพจรดิน","EARTH_DRAGON_AWAKENER":"ปลุกชีพมังกรดิน","JADE_FAULT_CRUSHER":"รอยเลื่อนทลายด่าน","SANCTUARY_PEAK_CUSTODIAN":"พิทักษ์ยอดเขาเซียน","HEAVY_STAR_CRUSHER":"ดาราหนักหมื่นชั่ง","ZERO_GRAVITY_DRIFTER":"กายาเบาเหินหาว","ORBITAL_REPULSION_WARDEN":"ม่านผลักศาสตรา","SINGULARITY_WELL_CONTROLLER":"เขตแดนถ่วงทัพ","METEOR_WEIGHT_STRIKER":"หมัดศิลาถ่วงหนัก","TIDAL_LOCK_ARBITER":"แรงดึงตรึงคู่ศึก","SUNDIAL_EPOCH_CHRONICLER":"เงาตะวันจารึกยุค","HOURGLASS_SAND_REAPER":"ทรายเวลาพรากชีพ","REWIND_SPRING_HEALER":"ย้อนวสันต์คืนชีพ","ACCELERATED_BLADE_FLASH":"ดาบเร่งพริบตา","STASIS_SEAL_WARDEN":"ผนึกหยุดเวลา","PAST_FUTURE_MIRROR_SAGE":"กระจกอดีตอนาคต","IMPERIAL_EDICT_CALLIGRAPHER":"พู่กันราชโองการสวรรค์","LANDSCAPE_SCROLL_PAINTER":"ภาพวาดขุนเขานํ้า","SWORD_POEM_IMMORTAL":"กวีกระบี่ร่ายมนตร์","CLASSICS_LAW_ARBITER":"บัญญัติมณเฑียรบาล","VERMILION_CRITIQUE_CENSOR":"หมึกชาดสลายวิชา","HISTORIANS_DESTINY_QUILL":"พู่กันพงศาวดาร","PHANTOM_SILK_PUPPETEER":"เชิดเงาไหมล่องหน","SOUL_STITCH_NEEDLE_MASTER":"เข็มเย็บวิญญาณ","PAPER_EFFIGY_CONJURER":"หุ่นกระดาษรับเคราะห์","CORPSE_FLAME_MARIONETTE":"หุ่นเชิดเพลิงผี","MIRROR_SHADOW_TWIN":"เงาแฝดกระจก","FATE_STRING_CONDUCTOR":"ชักใยด้ายชะตา","HUN_DUN_ORIGIN_DEVOURER":"กลืนกินปฐมโกลาหลหุ่นตุ้น","YIN_YANG_MILLSTONE_SAGE":"โม่หินหยินหยาง","FIVE_PHASE_INVERSION_ADEPT":"ย้อนทวนเบญจธาตุ","ENTROPY_FLAME_SOVEREIGN":"เพลิงโกลาหล","GENESIS_LOTUS_CREATOR":"บัวกำเนิดปราณ","ABYSSAL_CHAOS_HALBERD":"ทวนผ่าโกลาหล","IAI_FLASH_SLICER":"เพลงดาบชักฝักสะบั้นพริบตา","MURAMASA_BLOOD_EDGE":"ดาบปีศาจกระหายโลหิตสังหาร","UNBROKEN_IRON_STANCE":"ปราการดาบเหล็กจิตไม่สั่นคลอน","KENJUTSU_SWORD_SAINT":"คมดาบตัดวิญญาณ","CLONE_MIRAGE_WEAVER":"แยกร่างเงามายา","SMOKE_MIST_ASSASSIN":"หมอกควันปลิดชีพ","CONCEALED_WEAPON_STRIKER":"ซัดดาวอาวุธลับ","SHADOW_BIND_STRATEGIST":"ตรึงเงาสะกดร่าง","EXPLOSIVE_TAG_TRAPPER":"กับดักยันต์ระเบิด","FIVE_SEAL_ELEMENTALIST":"มุทราเบญจธาตุ","SUBSTITUTION_ESCAPE":"สลับร่างท่อนไม้","CHAKRA_SCROLL_SEALER":"ม้วนผนึกอาคม","CELESTIAL_BEAST_HERALD":"อัญเชิญสัตว์เทวะ","WAR_DEITY_CONVOKER":"อัญเชิญขุนพลฟ้า","NETHER_GATE_CALLER":"เพรียกประตูนรก","PANTHEON_CHOIR_CONDUCTOR":"โองการชุมนุมเทพ","SOLAR_AVATAR_VESSEL":"ร่างทรงสุริยเทพ","STORM_WRATH_MEDIUM":"ร่างทรงเทพอสนี","VAJRA_EARTH_ANCHOR":"ร่างทรงเทพปฐพี","MAHADEVA_DESTROYER":"ร่างทรงเทพผลาญภพ","JUDGMENT_SCALE_BORROWER":"ตราชั่งชั่งวิญญาณ","THUNDERBOLT_WIELDER":"ศาสตราอสนีเทพ","THIRD_EYE_INSIGHT":"เนตรทิพย์สามภพ","SERPENT_GRACE_BORROWER":"บารมีนาคราช","MADNESS_WHISPERER":"สาวกเสียงกระซิบโพ้นม่านฟ้า","FLESH_MUTATION_ADEPT":"ผลัดเนื้ออสูรว่าง","VOID_WARPING_HERETIC":"ฉีกบิดห้วงสุญตา","SANITY_SACRIFICE_WARLOCK":"สังเวยจิตแลกฤทธิ์","YANTRA_IRON_SKIN":"ยันต์คงกระพัน","BLACK_ARTS_HEXER":"คุณไสยมนต์ดำ","PHRAY_SPIRIT_WHISPER":"พรายกระซิบเตือน","SACRED_GOLEM_TAMER":"พยนต์อาคม","IRON_BONE_DEVOURER":"กลืนแร่กระดูกเหล็ก","BEAST_FLESH_CONSUMER":"กลืนเลือดอสูร","INTERNAL_ORGAN_REFINER":"หลอมอวัยวะมาร","PRIMORDIAL_STOMACH_TITAN":"เตาหลอมเลือดเนื้อกลืนหมื่นอสูร","ANCESTRAL_GRAVE_KEEPER":"เฝ้าสุสานโบราณ","BONE_PUPPET_REFINER":"หุ่นกระดูกวัชระ","SOUL_SIPHON_REAPER":"สูบวิญญาณชิงชีพ","CORPSE_EXPLOSION_ACOLYTE":"ระเบิดซากศพ","MARROW_HERITAGE_SHAMAN":"ปลุกเลือดบรรพชน","ANCESTRAL_TABLET_CHANTER":"สวดป้ายบูรพาจารย์","HEROIC_SPIRIT_SPEARMAN":"ทวนวิญญาณวีรชน","CHRONICLE_TOTEM_GUARDIAN":"เสาหลักวงศ์ตระกูล","ABYSSAL_TIDE_SPEAR":"ทวนคลื่นบาดาล","FROST_MAELSTROM_CALLER":"นํ้าวนเหมันต์","DRAGON_SHIP_NAVIGATOR":"นายท้ายสำเภามังกร","DEEP_PEARL_APOTHECARY":"ไข่มุกสมุทร","ANCIENT_RUBBING_DECODER":"ถอดศิลาจารึก","SUTRA_COMPILER_SAGE":"สังคายนาคัมภีร์","TECHNIQUE_MIRROR_SCHOLAR":"เนตรกระจกสะท้อนหมื่นวิชา","FORBIDDEN_SCROLL_CUSTODIAN":"เฝ้าหอต้องห้าม","JADE_DICE_HIGH_ROLLER":"เต๋าหยกท้าชะตา","FATE_COIN_FLIPPER":"เหรียญพลิกเป็นตาย","KARMA_ROULETTE_DEALER":"กงล้อเสี่ยงทาย","ALL_IN_DESPERADO_BLADE":"เดิมพันชะตาฟ้าแลกชีวิต","IMMORTAL_HERB_PLANTER":"ปลูกสมุนไพรเซียน","IRON_THORN_VINE_WEAVER":"เถาวัลย์หนามเหล็ก","SPIRIT_GRAIN_SOVEREIGN":"รวงข้าววิญญาณ","PARASITIC_SPORE_CULTIVATOR":"เกสรกลืนปราณ","GRAND_TOURNEY_CHAMPION":"เจ้ายุทธเจ็ดศาสตรา","DUELIST_HONOR_BLADE":"ดาบดวลเกียรติยศ","CROWD_ROAR_BRAWLER":"หมัดก้องสังเวียน","BANNER_GLORY_MARSHAL":"ธงชัยเกียรติยุทธ์","CORPSE_BELL_HERDER":"สายกระดิ่งต้อนศพ","BEAST_CARCASS_RIDER":"สายขี่ซากอสูร","JADE_COFFIN_WARDEN":"สายผู้เฝ้าโลงหยก","ARMORY_OF_THE_DEAD":"สายคลังศาสตราผู้ล่วงลับ","GRIEVANCE_LEDGER_KEEPER":"สายสมุดบัญชีแค้น","HUNGRY_GHOST_STEWARD":"สายผู้เลี้ยงผีหิว","LAST_WISH_MEDIUM":"สายร่างทรงคำสั่งเสีย","WAILING_CHORUS":"สายคณะวิญญาณร่ำไห้","UNDYING_FRAME":"สายกายไม่ล้ม","ROT_BLOOM_HOST":"สายร่างเพาะบุปผาเน่า","MARROW_STILLNESS_SAGE":"สายไขกระดูกนิ่งงัน","COLD_PULSE_REVENANT":"สายผีดิบชีพจรเย็น"};
  for (const [pid, p] of Object.entries(C.PATHS)) {
    if (pMap[pid]) { p.nameTh = pMap[pid]; p.shortTh = pMap[pid]; }
    if (Array.isArray(p.subPaths)) {
      for (const sp of p.subPaths) {
        if (sMap[sp.id]) sp.nameTh = sMap[sp.id];
      }
    }
  }
})();

/* === LIVING_JIANGHU_EPITHETS_ENGINE_V260 === */

  /* =========================================================================
   * LIVING JIANGHU EPITHETS, SOBRIQUETS, DAOIST STYLES, GROUP TITLES,
   * MOVEABLE CROWNS & POSTHUMOUS HONORIFICS ENGINE (สมญานามมีชีวิตแห่งยุทธภพ)
   * Zero-RNG deterministic hash, evidence ledger, witness/epistemic rules,
   * multi-perspective NPC perception, autonomous shame redemption,
   * 12 One-in-the-World Moveable Crowns, Collective Brotherhoods,
   * Daoist/Dharma names, Dynamic Lineage Seniority & Posthumous Tablets.
   * ========================================================================= */
  ;(function installLivingEpithetsV260(g) {
  const CULT = g.CULT, HC = g.HC, JD = g.JD;
  const EP = {
    VERSION: '2.6.0-living-epithets',

    detHash(str) {
      const s = String(str || '');
      let h = 2166136261 >>> 0;
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }
      return h >>> 0;
    },

    getCatalog() {
      return (typeof JD !== 'undefined' && JD.EPITHETS) ? JD.EPITHETS : { BY_ID: {}, LIST: [], CROWNS_SPEC: {}, DAO_STYLES_SPEC: {} };
    },

    getDef(id) {
      if (!id) return null;
      const cat = EP.getCatalog();
      return (cat.BY_ID && cat.BY_ID[id]) || null;
    },

    ensureNpcEpithets(npc) {
      if (!npc || typeof npc !== 'object') return null;
      if (!npc.epithets || typeof npc.epithets !== 'object') {
        npc.epithets = {
          primaryId: null,
          primaryTextTh: null,
          campusId: null,
          campusTextTh: null,
          daoNameTh: null,
          daoStyleFamilyId: null,
          lineageTitleTh: null,
          lineageTitleId: null,
          groupTitleTh: null,
          groupId: null,
          crownIds: [],
          posthumousTitleTh: null,
          posthumousId: null,
          owned: [],
          history: [],
          rumorLedger: {},
          redemptionDrive: null
        };
      } else {
        if (!Array.isArray(npc.epithets.crownIds)) npc.epithets.crownIds = [];
        if (!Array.isArray(npc.epithets.owned)) npc.epithets.owned = [];
        if (!Array.isArray(npc.epithets.history)) npc.epithets.history = [];
        if (!npc.epithets.rumorLedger || typeof npc.epithets.rumorLedger !== 'object') npc.epithets.rumorLedger = {};
      }
      return npc.epithets;
    },

    ensureDeedStats(npc) {
      if (!npc || typeof npc !== 'object') return null;
      if (!npc.deedStats || typeof npc.deedStats !== 'object') {
        npc.deedStats = {
          counters: {},
          evidenceLog: [],
          unwitnessedDeeds: [],
          receipts: {}
        };
      } else {
        if (!npc.deedStats.counters || typeof npc.deedStats.counters !== 'object') npc.deedStats.counters = {};
        if (!Array.isArray(npc.deedStats.evidenceLog)) npc.deedStats.evidenceLog = [];
        if (!Array.isArray(npc.deedStats.unwitnessedDeeds)) npc.deedStats.unwitnessedDeeds = [];
        if (!npc.deedStats.receipts || typeof npc.deedStats.receipts !== 'object') npc.deedStats.receipts = {};
      }
      return npc.deedStats;
    },

    ensureWorldCrowns(W) {
      if (!W || !W.world) return null;
      const specs = EP.getCatalog().CROWNS_SPEC || {};
      if (!W.world.uniqueCrowns || typeof W.world.uniqueCrowns !== 'object') {
        W.world.uniqueCrowns = {};
      }
      for (const cid of Object.keys(specs)) {
        const sp = specs[cid];
        if (!W.world.uniqueCrowns[cid]) {
          W.world.uniqueCrowns[cid] = {
            id: cid,
            proposalNo: sp.proposalNo,
            titleTh: sp.titleTh,
            domain: sp.domain,
            holderId: null,
            holderNameTh: null,
            holderSectId: null,
            holderIsExternal: false,
            holderScore: 0,
            claimedDay: 0,
            publicKnownHolderId: null,
            publicKnownHolderNameTh: null,
            rumorPropagatedDay: 0,
            previousHolderId: null,
            previousHolderNameTh: null,
            history: []
          };
        } else {
          if (!Array.isArray(W.world.uniqueCrowns[cid].history)) W.world.uniqueCrowns[cid].history = [];
        }
      }
      return W.world.uniqueCrowns;
    },

    ensureCollectiveGroups(W) {
      if (!W || !W.sect) return null;
      if (!W.sect.collectiveEpithets || typeof W.sect.collectiveEpithets !== 'object') {
        W.sect.collectiveEpithets = {
          byId: {},
          list: [],
          history: []
        };
      } else {
        if (!W.sect.collectiveEpithets.byId || typeof W.sect.collectiveEpithets.byId !== 'object') W.sect.collectiveEpithets.byId = {};
        if (!Array.isArray(W.sect.collectiveEpithets.list)) W.sect.collectiveEpithets.list = [];
        if (!Array.isArray(W.sect.collectiveEpithets.history)) W.sect.collectiveEpithets.history = [];
      }
      return W.sect.collectiveEpithets;
    },

    /* Pure read-only view of an NPC's epithets without mutating unregistered NPCs during UI render */
    peekNpcEpithets(npc) {
      if (!npc || !npc.epithets) {
        return {
          primaryId: null, primaryTextTh: null,
          campusId: null, campusTextTh: null,
          daoNameTh: null, daoStyleFamilyId: null,
          lineageTitleTh: null, lineageTitleId: null,
          groupTitleTh: null, groupId: null,
          crownIds: [], posthumousTitleTh: null, posthumousId: null,
          owned: [], history: [], rumorLedger: {}, redemptionDrive: null
        };
      }
      return npc.epithets;
    },

    formatDisplayTitle(npc, opts) {
      opts = opts || {};
      const ep = EP.peekNpcEpithets(npc);
      const parts = [];
      if (ep.crownIds && ep.crownIds.length > 0) {
        const cDef = EP.getDef(ep.crownIds[0]);
        if (cDef) parts.push('👑「' + cDef.titleTh + '」');
      }
      if (ep.primaryTextTh) {
        parts.push('「' + ep.primaryTextTh + '」');
      } else if (ep.campusTextTh && opts.includeCampus !== false) {
        parts.push('(' + ep.campusTextTh + ')');
      }
      if (ep.daoNameTh && opts.includeDaoName) {
        parts.push('[' + ep.daoNameTh + ']');
      }
      if (ep.posthumousTitleTh && (npc.dead || opts.includePosthumous)) {
        parts.push('🕯️「' + ep.posthumousTitleTh + '」');
      }
      return parts.join(' ');
    },

    /* Anti-Farming & Evidence-Backed Deed Recording */
    recordDeed(W, npc, deedKey, amount, meta) {
      if (!W || !npc || npc.foe || !deedKey) return { ok: false, reason: 'invalid-args' };
      meta = meta || {};
      const amt = Number.isFinite(amount) ? amount : 1;
      if (amt <= 0) return { ok: false, reason: 'non-positive-amount' };

      const combatDeeds = new Set([
        'combat_kill', 'boss_kill', 'solo_boss_kill', 'outnumbered_win',
        'low_hp_win', 'combat_win', 'defend_sect_win', 'duel_win',
        'weapon_kill:SWORD', 'weapon_kill:SABER', 'weapon_kill:SPEAR',
        'weapon_kill:FIST_PALM', 'weapon_kill:BOW', 'weapon_kill:ZITHER',
        'iron_marrow_breaker'
      ]);

      // Anti-farming Guard 1: Non-serious sparring cannot farm combat/kill epithets
      if ((meta.fightKind === 'spar' || meta.serious === false) && combatDeeds.has(deedKey) && deedKey !== 'spar_win') {
        return { ok: false, reason: 'non-serious-spar-ignored' };
      }

      // Anti-farming Guard 2: Trivial prey (>2 stages below) cannot farm combat/kill epithets
      if (meta.targetStage != null && combatDeeds.has(deedKey)) {
        const myStage = (npc.cult && npc.cult.stage) || 1;
        if (myStage - Number(meta.targetStage) > 2) {
          return { ok: false, reason: 'trivial-prey-ignored' };
        }
      }

      // Anti-farming Guard 3: Overhealing healthy targets (>= 90% HP) cannot farm healer epithets
      if (deedKey === 'heal_patient' && meta.patientHpRatioBefore != null && Number(meta.patientHpRatioBefore) >= 0.90) {
        return { ok: false, reason: 'overheal-ignored' };
      }

      // Anti-farming Guard 4: Zero-contribution AFK tag-along cannot farm party/raid deeds
      if (meta.contributionScore != null && Number(meta.contributionScore) <= 0) {
        return { ok: false, reason: 'zero-contribution-ignored' };
      }

      const ds = EP.ensureDeedStats(npc);
      const ep = EP.ensureNpcEpithets(npc);
      const day = (W && W.day) || 1;
      const tick = (W && W.t) || 0;
      const receiptId = meta.receiptId || ('rcpt_' + npc.id + '_' + deedKey + '_' + day + '_' + tick + '_' + (ds.evidenceLog.length + ds.unwitnessedDeeds.length));

      // Anti-farming Guard 6: Strict receipt idempotency
      if (ds.receipts[receiptId]) {
        return { ok: false, reason: 'duplicate-receipt', receiptId };
      }
      ds.receipts[receiptId] = true;

      // Determine witnesses
      let witnessIds = Array.isArray(meta.witnessIds) ? meta.witnessIds.filter(id => id && id !== npc.id) : [];
      if (!meta.unwitnessed && !meta.soloWilderness && witnessIds.length === 0 && !npc.away && W && Array.isArray(W.npcs)) {
        for (let i = 0; i < W.npcs.length; i++) {
          const o = W.npcs[i];
          if (!o || o.dead || o.exiled || o.away || o.id === npc.id) continue;
          const dx = (o.x || 0) - (npc.x || 0), dy = (o.y || 0) - (npc.y || 0);
          if (dx * dx + dy * dy <= 400) witnessIds.push(o.id);
          if (witnessIds.length >= 4) break;
        }
      }

      const isUnwitnessedSolo = Boolean(
        meta.unwitnessed === true ||
        (meta.soloWilderness === true && witnessIds.length === 0 && !meta.hasPhysicalProof)
      );
      const originEventId = meta.originEventId || ('orig_' + npc.id + '_' + deedKey + '_' + day + '_' + tick);
      const descTh = meta.descTh || ('บันทึกวีรกรรม ' + deedKey + ' (+' + amt + ')');

      if (isUnwitnessedSolo) {
        ds.unwitnessedDeeds.push({
          deedKey,
          amount: amt,
          day,
          t: tick,
          descTh,
          zoneId: meta.zoneId || null,
          proofItemId: meta.proofItemId || null,
          receiptId,
          originEventId,
          verifiedDay: null
        });
        if (ds.unwitnessedDeeds.length > 32) ds.unwitnessedDeeds.shift();
        return { ok: true, unwitnessed: true, pendingProof: true, receiptId, originEventId };
      }

      ds.counters[deedKey] = (ds.counters[deedKey] || 0) + amt;
      ds.evidenceLog.push({
        deedKey,
        amount: amt,
        day,
        t: tick,
        descTh,
        witnessed: true,
        witnessIds: witnessIds.slice(0, 6),
        zoneId: meta.zoneId || null,
        receiptId,
        originEventId
      });
      if (ds.evidenceLog.length > 48) ds.evidenceLog.shift();

      // Check autonomous shame redemption progress if active
      if (ep.redemptionDrive && ep.redemptionDrive.active) {
        const redeemingDeeds = new Set([
          'combat_win', 'combat_kill', 'boss_kill', 'solo_boss_kill',
          'defend_sect_win', 'rescue_comrade', 'heal_patient',
          'caravan_escort_flawless', 'leyline_anchor_guard', 'court_memorial_accepted'
        ]);
        if (redeemingDeeds.has(deedKey)) {
          ep.redemptionDrive.progress = (ep.redemptionDrive.progress || 0) + 1;
          if (npc.cognition && npc.cognition.goal && npc.cognition.goal.id === 'wash_shame_epithet') {
            npc.cognition.goal.progress = Math.min(100, Math.round((ep.redemptionDrive.progress / Math.max(1, ep.redemptionDrive.required || 2)) * 100));
          }
          if (ep.redemptionDrive.progress >= (ep.redemptionDrive.required || 2)) {
            EP.redeemShameEpithet(W, npc, ep.redemptionDrive.shameEpithetId, descTh);
          }
        }
      }

      const granted = EP.evaluateDeedThresholds(W, npc, deedKey, ds.counters[deedKey], {
        descTh,
        receiptId,
        originEventId,
        witnessIds,
        epistemicStatus: witnessIds.length > 0 ? 'VERIFIED' : 'OBSERVED'
      });

      return { ok: true, unwitnessed: false, counter: ds.counters[deedKey], receiptId, originEventId, granted };
    },

    verifySecretDeedWithProof(W, npc, deedKey, proofDescTh) {
      if (!W || !npc) return { ok: false, reason: 'invalid-args' };
      const ds = EP.ensureDeedStats(npc);
      const pending = ds.unwitnessedDeeds.filter(d => d && (!deedKey || d.deedKey === deedKey) && !d.verifiedDay);
      if (!pending.length) return { ok: false, reason: 'no-unwitnessed-deed' };
      const day = (W && W.day) || 1;
      const grantedAll = [];
      for (const item of pending) {
        item.verifiedDay = day;
        item.proofDescTh = proofDescTh || 'ยืนยันด้วยหลักฐานของจริงที่นำกลับสำนัก';
        ds.counters[item.deedKey] = (ds.counters[item.deedKey] || 0) + item.amount;
        ds.evidenceLog.push({
          deedKey: item.deedKey,
          amount: item.amount,
          day,
          t: (W && W.t) || 0,
          descTh: item.descTh + ' (' + item.proofDescTh + ')',
          witnessed: true,
          witnessIds: ['PROOF_VERIFIED'],
          zoneId: item.zoneId,
          receiptId: item.receiptId,
          originEventId: item.originEventId
        });
        const gList = EP.evaluateDeedThresholds(W, npc, item.deedKey, ds.counters[item.deedKey], {
          descTh: item.descTh + ' — ' + item.proofDescTh,
          receiptId: item.receiptId,
          originEventId: item.originEventId,
          witnessIds: ['PROOF_VERIFIED'],
          epistemicStatus: 'VERIFIED'
        });
        if (Array.isArray(gList)) grantedAll.push(...gList);
      }
      ds.unwitnessedDeeds = ds.unwitnessedDeeds.filter(d => !d.verifiedDay);
      return { ok: true, verifiedCount: pending.length, granted: grantedAll };
    },

    evaluateDeedThresholds(W, npc, deedKey, count, meta) {
      const granted = [];
      const tryGrant = (id, customMeta) => {
        const res = EP.grantEpithet(W, npc, id, Object.assign({}, meta, customMeta || {}));
        if (res && res.ok && res.newlyGranted) granted.push(id);
      };

      // Anti-farming Guard 5: Cauldron explosion grants campus eccentricity at 3x, and only grants master alchemist after subsequent real success
      if (deedKey === 'cauldron_explode') {
        if (count >= 3) tryGrant('EPI_CMP_033');
        return granted;
      }
      if (deedKey === 'alchemy_success') {
        const ds = EP.ensureDeedStats(npc);
        if (count >= 5) tryGrant('EPI_ART_057');
        if ((ds.counters.cauldron_explode || 0) >= 3 && count >= 3) tryGrant('EPI_ART_057', { descTh: 'หลอมโอสถสำเร็จหลังผ่านบทเรียนเตาระเบิดสามหน' });
      }
      if (deedKey === 'multiphase_pill_brew' && count >= 1) tryGrant('EPI_NEW_269');
      if (deedKey === 'forge_success' && count >= 4) tryGrant('EPI_ART_058');
      if (deedKey === 'catalyst_3star_refine' && count >= 1) tryGrant('EPI_NEW_270');
      if (deedKey === 'heal_patient' && count >= 4) tryGrant('EPI_NEW_276');
      if (deedKey === 'heal_critical' && count >= 2) tryGrant('EPI_ART_059');
      if (deedKey === 'combat_kill' && count >= 5) tryGrant('EPI_CMB_001');
      if (deedKey === 'outnumbered_win' && count >= 1) tryGrant('EPI_CMB_002');
      if (deedKey === 'low_hp_win' && count >= 1) tryGrant('EPI_CMB_003');
      if (deedKey === 'flawless_win' && count >= 2) tryGrant('EPI_CMB_004');
      if (deedKey === 'solo_boss_kill' && count >= 1) tryGrant('EPI_EXP_139');
      if (deedKey === 'iron_marrow_breaker' && count >= 1) tryGrant('EPI_NEW_262');
      if (deedKey === 'herb_beast_tame' && count >= 1) tryGrant('EPI_NEW_261');
      if (deedKey === 'weapon_kill:SWORD' && count >= 3) tryGrant('EPI_CMB_001');
      if (deedKey === 'weapon_kill:SABER' && count >= 3) tryGrant('EPI_CMB_002');
      if (deedKey === 'weapon_kill:SPEAR' && count >= 3) tryGrant('EPI_CMB_032');
      if (deedKey === 'weapon_kill:FIST_PALM' && count >= 3) tryGrant('EPI_CMB_031');
      if (deedKey === 'tourney_win_streak' && count >= 3) tryGrant('EPI_CMB_025');
      if (deedKey === 'qinggong_flight_mastery' && count >= 1) tryGrant('EPI_NEW_263');
      if (deedKey === 'mantra_weather_sync' && count >= 1) tryGrant('EPI_NEW_264');
      if (deedKey === 'defensive_redirect_mastery' && count >= 1) tryGrant('EPI_NEW_265');
      if (deedKey === 'support_blessing_mastery' && count >= 1) tryGrant('EPI_NEW_266');
      if (deedKey === 'forbidden_blood_taboo_survived' && count >= 1) tryGrant('EPI_NEW_267');
      if (deedKey === 'passive_constellation_tier3' && count >= 1) tryGrant('EPI_NEW_268');
      if (deedKey === 'leyline_anchor_guard' && count >= 1) tryGrant('EPI_NEW_271');
      if (deedKey === 'court_memorial_accepted' && count >= 1) tryGrant('EPI_NEW_272');
      if (deedKey === 'micro_locations_all4' && count >= 1) tryGrant('EPI_NEW_273');
      if (deedKey === 'ancient_dao_legacy_awakened' && count >= 1) tryGrant('EPI_NEW_274');
      if (deedKey === 'spirit_fish_banquet' && count >= 1) tryGrant('EPI_NEW_275');
      if (deedKey === 'flee_battle' && count >= 2) {
        EP.triggerShameStigma(W, npc, 'EPI_INF_113', meta);
        granted.push('EPI_INF_113');
      }
      if (deedKey === 'abandon_comrade' && count >= 1) {
        EP.triggerShameStigma(W, npc, 'EPI_INF_114', meta);
        granted.push('EPI_INF_114');
      }
      if (deedKey === 'embezzle_exposed' && count >= 1) {
        EP.triggerShameStigma(W, npc, 'EPI_INF_115', meta);
        granted.push('EPI_INF_115');
      }
      return granted;
    },

    grantEpithet(W, npc, epithetId, meta) {
      if (!npc || !epithetId) return { ok: false, reason: 'invalid-args' };
      const def = EP.getDef(epithetId);
      if (!def) return { ok: false, reason: 'unknown-epithet-id' };
      meta = meta || {};
      const ep = EP.ensureNpcEpithets(npc);
      const day = (W && W.day) || 1;
      const tick = (W && W.t) || 0;

      const existing = ep.owned.find(x => x && x.id === epithetId);
      if (existing) {
        if (meta.epistemicStatus === 'VERIFIED' && existing.epistemicStatus !== 'VERIFIED') {
          existing.epistemicStatus = 'VERIFIED';
          existing.publicKnown = true;
        }
        return { ok: true, newlyGranted: false, record: existing };
      }

      const isShame = def.polarity === 'SHAME';
      // Low-profile / stealth disciples may suppress heroic public boasting, but can NEVER suppress SHAME!
      const stealthSkill = (npc.h && npc.h.skills && npc.h.skills.STEALTH) || 0;
      const humility = (npc.h && npc.h.values && npc.h.values.humility) || 50;
      const wantsLowProfile = !isShame && (stealthSkill >= 75 && humility >= 75 && meta.forcePublic !== true);

      const originEventId = meta.originEventId || ('epi_origin_' + npc.id + '_' + epithetId + '_' + day);
      const witnessIds = Array.isArray(meta.witnessIds) ? meta.witnessIds.slice(0, 8) : [];
      const record = {
        id: def.id,
        titleTh: def.titleTh,
        category: def.category,
        polarity: def.polarity,
        effectType: def.effectType,
        tier: def.tier || 2,
        scope: def.scope || 'JIANGHU',
        grantedDay: day,
        grantedTick: tick,
        evidenceTh: meta.descTh || def.effectSummaryTh || 'ประจักษ์ผลงานในยุทธภพ',
        receiptId: meta.receiptId || null,
        originEventId,
        epistemicStatus: meta.epistemicStatus || 'VERIFIED',
        witnessCount: Math.max(1, witnessIds.length),
        witnessIds,
        publicKnown: !wantsLowProfile && (def.scope !== 'CAMPUS'),
        suppressedByStealth: wantsLowProfile,
        shameActive: isShame,
        redeemedDay: null,
        redemptionEvidenceTh: null,
        residualSkepticUntilDay: null
      };

      ep.owned.push(record);
      ep.rumorLedger[originEventId] = {
        id: def.id,
        targetId: npc.id,
        epistemicStatus: record.epistemicStatus,
        learnedDay: day,
        speakerId: npc.id
      };

      // Assign slot: CAMPUS scope -> campusId; UNIQUE_CROWN -> crownIds; POSTHUMOUS -> posthumousTitleTh; otherwise primaryId
      if (def.category === 'POSTHUMOUS') {
        ep.posthumousId = def.id;
        ep.posthumousTitleTh = def.titleTh;
      } else if (def.category === 'UNIQUE_CROWN') {
        if (!ep.crownIds.includes(def.id)) ep.crownIds.push(def.id);
      } else if (def.scope === 'CAMPUS' || def.category === 'CAMPUS') {
        ep.campusId = def.id;
        ep.campusTextTh = def.titleTh;
        if (!ep.primaryId && !wantsLowProfile) {
          ep.primaryId = def.id;
          ep.primaryTextTh = def.titleTh;
        }
      } else if (isShame) {
        // Shame stigma overrides primary public epithet until redeemed!
        ep.primaryId = def.id;
        ep.primaryTextTh = def.titleTh;
      } else if (!wantsLowProfile) {
        const curDef = ep.primaryId ? EP.getDef(ep.primaryId) : null;
        const curIsActiveShame = curDef && curDef.polarity === 'SHAME' && ep.owned.some(x => x.id === curDef.id && x.shameActive);
        if (!curIsActiveShame && (!curDef || (def.tier || 2) >= (curDef.tier || 2))) {
          ep.primaryId = def.id;
          ep.primaryTextTh = def.titleTh;
        }
      }

      ep.history.push({
        day,
        t: tick,
        kind: isShame ? 'SHAME_BRANDED' : 'EPITHET_GRANTED',
        epithetId: def.id,
        titleTh: def.titleTh,
        evidenceTh: record.evidenceTh,
        epistemicStatus: record.epistemicStatus
      });
      if (ep.history.length > 40) ep.history.shift();

      if (typeof HC !== 'undefined' && HC.bump) HC.bump(npc);
      return { ok: true, newlyGranted: true, record };
    },

    /* Shame Stigma & Autonomous Redemption Drive */
    triggerShameStigma(W, npc, epithetId, meta) {
      if (!npc) return { ok: false, reason: 'no-npc' };
      const res = EP.grantEpithet(W, npc, epithetId || 'EPI_INF_113', Object.assign({}, meta || {}, { forcePublic: true }));
      const ep = EP.ensureNpcEpithets(npc);
      const def = EP.getDef(epithetId || 'EPI_INF_113');
      const day = (W && W.day) || 1;
      const pride = (npc.h && npc.h.ego && npc.h.ego.pride) || 50;
      const integrity = (npc.h && npc.h.values && npc.h.values.integrity) || 50;
      const courage = (npc.h && npc.h.personality && npc.h.personality.courage) || 50;

      // Activate autonomous redemption drive (wash_shame_epithet)
      if (pride >= 35 || integrity >= 35 || courage >= 35) {
        ep.redemptionDrive = {
          active: true,
          shameEpithetId: def ? def.id : epithetId,
          shameTitleTh: def ? def.titleTh : 'ฉายาอัปยศ',
          startedDay: day,
          targetDeedKey: 'redemption_deed',
          progress: 0,
          required: 2,
          whyTh: 'มุ่งมั่นสร้างผลงานกู้ศักดิ์ศรีเพื่อล้างตราบาป「' + (def ? def.titleTh : epithetId) + '」'
        };
        npc.cognition = npc.cognition || {};
        {
          npc.cognition.goal = {
            id: 'wash_shame_epithet',
            title: 'ล้างตราบาปสมญานาม「' + (def ? def.titleTh : epithetId) + '」',
            progress: 0,
            target: 100
          };
        }
        npc.why = Array.isArray(npc.why) ? npc.why : [];
        npc.why.unshift([ep.redemptionDrive.whyTh, 95]);
        if (npc.why.length > 6) npc.why.length = 6;
      }
      return res;
    },

    redeemShameEpithet(W, npc, shameEpithetId, redemptionEvidenceTh) {
      if (!npc) return { ok: false, reason: 'no-npc' };
      const ep = EP.ensureNpcEpithets(npc);
      const day = (W && W.day) || 1;
      const tick = (W && W.t) || 0;
      const targetRec = ep.owned.find(r => r && r.polarity === 'SHAME' && r.shameActive && (!shameEpithetId || r.id === shameEpithetId));
      if (!targetRec) return { ok: false, reason: 'no-active-shame' };

      targetRec.shameActive = false;
      targetRec.redeemedDay = day;
      targetRec.redemptionEvidenceTh = redemptionEvidenceTh || 'พิสูจน์ความกล้าหาญในศึกจริงจนกู้ศักดิ์ศรีสำเร็จ';
      targetRec.residualSkepticUntilDay = day + 30;

      if (ep.redemptionDrive) {
        ep.redemptionDrive.active = false;
        ep.redemptionDrive.completedDay = day;
      }
      if (npc.cognition && npc.cognition.goal && npc.cognition.goal.id === 'wash_shame_epithet') {
        npc.cognition.goal.progress = 100;
      }

      // Grant redemption honorific (e.g., EPI_FAT_228 or EPI_CHV_093)
      const redeemId = 'EPI_FAT_228';
      EP.grantEpithet(W, npc, redeemId, {
        descTh: 'กู้ศักดิ์ศรีล้างตราบาป「' + targetRec.titleTh + '」: ' + targetRec.redemptionEvidenceTh,
        epistemicStatus: 'VERIFIED',
        forcePublic: true
      });
      const redDef = EP.getDef(redeemId);
      if (redDef) {
        ep.primaryId = redDef.id;
        ep.primaryTextTh = redDef.titleTh;
      }

      ep.history.push({
        day,
        t: tick,
        kind: 'SHAME_REDEEMED',
        epithetId: targetRec.id,
        titleTh: targetRec.titleTh,
        redeemedById: redeemId,
        evidenceTh: targetRec.redemptionEvidenceTh
      });
      if (typeof HC !== 'undefined' && HC.bump) HC.bump(npc);
      return { ok: true, redeemedId: targetRec.id, newPrimaryId: ep.primaryId, residualSkepticUntilDay: targetRec.residualSkepticUntilDay };
    },

    /* Rumor Propagation, False Accusation & Tribunal Clearing */
    propagateRumor(W, speaker, listener, originEventIdOpt) {
      if (!W || !speaker || !listener || speaker.id === listener.id) return { ok: false, reason: 'invalid-actors' };
      const epS = EP.ensureNpcEpithets(speaker);
      const epL = EP.ensureNpcEpithets(listener);
      const day = (W && W.day) || 1;

      const candidateOrigins = originEventIdOpt
        ? [originEventIdOpt]
        : Object.keys(epS.rumorLedger || {});
      let sharedCount = 0;

      for (const origId of candidateOrigins) {
        const entry = epS.rumorLedger[origId];
        if (!entry) continue;
        // Anti-echo-chamber: if listener already learned this exact originEventId, do NOT increment witnessCount!
        if (epL.rumorLedger[origId]) continue;

        epL.rumorLedger[origId] = {
          id: entry.id,
          targetId: entry.targetId,
          epistemicStatus: entry.epistemicStatus,
          learnedDay: day,
          speakerId: speaker.id
        };
        const targetNpc = W.byId && W.byId[entry.targetId];
        if (targetNpc && targetNpc.epithets && Array.isArray(targetNpc.epithets.owned)) {
          const rec = targetNpc.epithets.owned.find(x => x && x.originEventId === origId);
          if (rec) {
            rec.witnessIds = Array.isArray(rec.witnessIds) ? rec.witnessIds : [];
            if (!rec.witnessIds.includes(listener.id)) {
              rec.witnessIds.push(listener.id);
              rec.witnessCount = rec.witnessIds.length;
            }
          }
        }
        sharedCount++;
        if (sharedCount >= 2) break;
      }
      return { ok: sharedCount > 0, sharedCount };
    },

    seedAccusationRumor(W, targetNpc, epithetId, accuserInfo) {
      if (!W || !targetNpc) return { ok: false, reason: 'invalid-target' };
      accuserInfo = accuserInfo || {};
      const eid = epithetId || 'EPI_INF_124';
      const day = (W && W.day) || 1;
      const originEventId = accuserInfo.originEventId || ('rumor_accuse_' + targetNpc.id + '_' + eid + '_' + day);
      const res = EP.grantEpithet(W, targetNpc, eid, {
        descTh: accuserInfo.reasonTh || 'ข่าวลือกล่าวหาที่ยังไม่ได้รับการพิสูจน์ในหอวินัย',
        epistemicStatus: 'RUMOR',
        originEventId,
        witnessIds: accuserInfo.accuserId ? [accuserInfo.accuserId] : ['RUMOR_MILL']
      });
      if (res && res.record) {
        res.record.epistemicStatus = 'RUMOR';
        res.record.verified = false;
      }
      if (accuserInfo.accuserNpc) {
        const epA = EP.ensureNpcEpithets(accuserInfo.accuserNpc);
        epA.rumorLedger[originEventId] = {
          id: eid,
          targetId: targetNpc.id,
          epistemicStatus: 'RUMOR',
          learnedDay: day,
          speakerId: accuserInfo.accuserNpc.id
        };
      }
      return { ok: true, originEventId, record: res && res.record };
    },

    clearFalseAccusation(W, targetNpc, epithetId, verifierNpc) {
      if (!W || !targetNpc || !targetNpc.epithets) return { ok: false, reason: 'no-target' };
      const ep = targetNpc.epithets;
      const day = (W && W.day) || 1;
      const idx = ep.owned.findIndex(r => r && (!epithetId || r.id === epithetId) && r.epistemicStatus === 'RUMOR');
      if (idx === -1) return { ok: false, reason: 'rumor-not-found' };
      const removed = ep.owned.splice(idx, 1)[0];
      if (ep.primaryId === removed.id) {
        const fallback = ep.owned.find(r => r && r.polarity !== 'SHAME' && !r.suppressedByStealth);
        ep.primaryId = fallback ? fallback.id : null;
        ep.primaryTextTh = fallback ? fallback.titleTh : null;
      }
      if (ep.redemptionDrive && ep.redemptionDrive.shameEpithetId === removed.id) {
        ep.redemptionDrive.active = false;
      }
      ep.history.push({
        day,
        t: (W && W.t) || 0,
        kind: 'FALSE_RUMOR_CLEARED',
        epithetId: removed.id,
        titleTh: removed.titleTh,
        verifierId: verifierNpc ? verifierNpc.id : 'SECT_TRIBUNAL',
        evidenceTh: 'หอวินัยสอบสวนพิสูจน์ความบริสุทธิ์ ล้างข่าวลือเท็จ「' + removed.titleTh + '」'
      });
      if (typeof HC !== 'undefined' && HC.bump) HC.bump(targetNpc);
      return { ok: true, clearedId: removed.id };
    },

    /* Multi-Perspective NPC Perception (Pure, Zero-RNG, Zero-Mutation) */
    evaluatePerception(W, observer, target) {
      if (!observer || !target) {
        return { attitudeDelta: 0, trustDelta: 0, fearDelta: 0, respectDelta: 0, knownEpithetTh: null, perceptionLabelTh: 'เฉยเมย', reasonTh: 'ไม่มีข้อมูลสมญานาม' };
      }
      const epT = EP.peekNpcEpithets(target);
      const epO = EP.peekNpcEpithets(observer);
      const day = (W && W.day) || 1;
      const sameSect = Boolean(!observer.sectId && !target.sectId) || (observer.sectId && observer.sectId === target.sectId);

      // Determine which epithet observer actually knows about target
      let activeRec = null;
      if (epT.primaryId) {
        const cand = (epT.owned || []).find(r => r && r.id === epT.primaryId);
        if (cand) {
          const knowsRumor = Boolean(cand.originEventId && epO.rumorLedger && epO.rumorLedger[cand.originEventId]);
          if (sameSect || cand.publicKnown || knowsRumor) activeRec = cand;
        }
      }
      if (!activeRec && sameSect && epT.campusId) {
        activeRec = (epT.owned || []).find(r => r && r.id === epT.campusId) || {
          id: epT.campusId, titleTh: epT.campusTextTh, polarity: 'ECCENTRIC', epistemicStatus: 'VERIFIED'
        };
      }

      const right = (observer.h && observer.h.values && observer.h.values.righteousness) != null ? observer.h.values.righteousness : 50;
      const comp = (observer.h && observer.h.values && observer.h.values.compassion) != null ? observer.h.values.compassion : 50;
      const integ = (observer.h && observer.h.values && observer.h.values.integrity) != null ? observer.h.values.integrity : 50;
      const perc = (observer.h && observer.h.intellect && observer.h.intellect.perceptiveness) != null ? observer.h.intellect.perceptiveness : 50;
      const aggr = (observer.h && observer.h.personality && observer.h.personality.aggression) != null ? observer.h.personality.aggression : 50;

      let attitudeDelta = 0, trustDelta = 0, fearDelta = 0, respectDelta = 0;
      let perceptionLabelTh = 'รับรู้ตามปกติ';
      let reasonTh = 'ยังไม่มีสมญานามที่ส่งผลต่อมุมมองพิเศษ';

      // Check redeemed shame residual skepticism
      const redeemedShame = (epT.owned || []).find(r => r && r.polarity === 'SHAME' && !r.shameActive && r.redeemedDay != null);
      if (redeemedShame && redeemedShame.residualSkepticUntilDay && day < redeemedShame.residualSkepticUntilDay) {
        if (comp < 45 || aggr > 65) {
          trustDelta -= 6;
          respectDelta -= 4;
          perceptionLabelTh = 'ยังเคลือบแคลงในอดีต';
          reasonTh = 'แม้จะล้างตราบาป「' + redeemedShame.titleTh + '」แล้ว แต่ยังระแวงอดีตที่เคยด่างพร้อย';
        } else {
          attitudeDelta += 10;
          respectDelta += 12;
          perceptionLabelTh = 'ชื่นชมการกู้ศักดิ์ศรี';
          reasonTh = 'นับถือที่สามารถล้างมลทิน「' + redeemedShame.titleTh + '」ด้วยวีรกรรมจริง';
        }
      }

      if (activeRec) {
        if (activeRec.epistemicStatus === 'RUMOR' && perc >= 72 && integ >= 65) {
          return {
            attitudeDelta: 0,
            trustDelta: -2,
            fearDelta: 0,
            respectDelta: 0,
            knownEpithetTh: activeRec.titleTh,
            epistemicStatus: 'RUMOR',
            perceptionLabelTh: 'รอพิสูจน์ข้อเท็จจริง',
            reasonTh: 'ผู้สังเกตมีปัญญาเฉียบแหลม จึงยังไม่ปักใจเชื่อข่าวลือ「' + activeRec.titleTh + '」โดยไร้หลักฐาน'
          };
        }

        if (activeRec.polarity === 'DREAD') {
          fearDelta += 22;
          if (right >= 60 || comp >= 60) {
            attitudeDelta -= 18;
            trustDelta -= 15;
            perceptionLabelTh = 'รังเกียจและระแวดระวัง';
            reasonTh = 'ยึดมั่นคุณธรรม จึงต่อต้านสมญานามสายอำมหิต「' + activeRec.titleTh + '」';
          } else if (aggr >= 60 || right <= 40) {
            attitudeDelta += 12;
            respectDelta += 16;
            perceptionLabelTh = 'ยำเกรงในอำนาจสังหาร';
            reasonTh = 'ชื่นชมความเด็ดขาดของสมญานาม「' + activeRec.titleTh + '」';
          }
        } else if (activeRec.polarity === 'SHAME' && activeRec.shameActive !== false) {
          respectDelta -= 20;
          trustDelta -= 16;
          attitudeDelta -= (integ >= 55 ? 14 : 6);
          perceptionLabelTh = 'ดูแคลนตราบาป';
          reasonTh = 'เสื่อมศรัทธาจากฉายาอัปยศ「' + activeRec.titleTh + '」';
        } else if (activeRec.polarity === 'HEROIC') {
          if (right >= 45 && !(redeemedShame && comp < 45)) {
            attitudeDelta += 14;
            trustDelta += 12;
            respectDelta += 15;
            perceptionLabelTh = 'เลื่อมใสศรัทธา';
            reasonTh = 'ยกย่องเกียรติคุณของสมญานาม「' + activeRec.titleTh + '」';
          } else {
            attitudeDelta -= 8;
            fearDelta += 8;
            respectDelta += 6;
            perceptionLabelTh = 'เขม่นระแวงศัตรูผู้ทรงธรรม';
            reasonTh = 'มองผู้ถือสมญานาม「' + activeRec.titleTh + '」เป็นอุปสรรคขวางทาง';
          }
        } else if (activeRec.polarity === 'ECCENTRIC') {
          attitudeDelta += 4;
          perceptionLabelTh = 'เอ็นดูปนขบขัน';
          reasonTh = 'คุ้นเคยกับฉายาประจำสำนัก「' + activeRec.titleTh + '」';
        }
      }

      if (epT.crownIds && epT.crownIds.length > 0) {
        const crDef = EP.getDef(epT.crownIds[0]);
        respectDelta += 20;
        fearDelta += 12;
        if (crDef) {
          perceptionLabelTh = 'ยำเกรงผู้ครองมงกุฎอันดับหนึ่ง';
          reasonTh = 'เคารพรัศมีมงกุฎหนึ่งเดียวในใต้หล้า「' + crDef.titleTh + '」';
        }
      }

      return {
        attitudeDelta,
        trustDelta,
        fearDelta,
        respectDelta,
        knownEpithetTh: activeRec ? activeRec.titleTh : (epT.primaryTextTh || epT.campusTextTh || null),
        epistemicStatus: activeRec ? activeRec.epistemicStatus : 'VERIFIED',
        perceptionLabelTh,
        reasonTh
      };
    },

    /* -----------------------------------------------------------------------
     * ONE-IN-THE-WORLD MOVEABLE CROWNS (#235-#246)
     * ----------------------------------------------------------------------- */
    scoreCandidateForCrown(W, cand, crownId) {
      if (!cand || cand.dead) return -1;
      const spec = (EP.getCatalog().CROWNS_SPEC || {})[crownId];
      if (!spec) return -1;
      const age = (cand && cand.h && cand.h.birthDay != null && typeof HC !== 'undefined' && HC.ageYears) ? HC.ageYears(cand) : (cand && cand.ageYears || 25);
      if (spec.maxAge != null && age > spec.maxAge) return -1;

      const stage = (cand.cult && cand.cult.stage) || cand.stage || 1;
      const stInfo = (typeof CULT !== 'undefined' && CULT.STAGES && CULT.STAGES[stage - 1]) || { combatPower: stage * 120 };
      const power = (typeof CULT !== 'undefined' && CULT.power && cand.h && cand.h.state)
        ? CULT.power(cand)
        : (cand.combatPower || (stInfo.combatPower * 1.25 + (cand.quality || 0) * 25));
      const sk = (cand.h && cand.h.skills) || {};
      const vals = (cand.h && cand.h.values) || {};

      if (spec.demonicOnly) {
        const isDem = (cand.cult && (cand.cult.path === 'DEMON' || cand.cult.path === 'BLOOD_ARTS' || cand.cult.path === 'CORPSE_PUPPET')) ||
                      (vals.righteousness != null && vals.righteousness <= 32) ||
                      (cand.alignment === 'DEMONIC');
        if (!isDem) return -1;
      }
      if (spec.righteousOnly) {
        const isRight = (vals.righteousness != null && vals.righteousness >= 68) || (cand.alignment === 'RIGHTEOUS');
        if (!isRight) return -1;
      }
      const cPath = (cand.cult && cand.cult.path) || '';
      if (spec.weaponType) {
        const wEq = cand.equip && cand.equip.WEAPON;
        const wType = String((wEq && (wEq.weaponType || wEq.type)) || cand.weaponType || '').toUpperCase();
        const wSk = sk[spec.weaponType] || sk[String(spec.weaponType).toLowerCase()] || (spec.weaponType === 'SABER' ? (sk.BLADE || sk.blade || 0) : 0) || 0;
        const matchWpn = wType === spec.weaponType || (spec.weaponType === 'SABER' && (wType === 'BLADE' || ['SHADOW_SAMURAI', 'BODY'].includes(cPath)));
        if (!matchWpn && wSk < 55) return -1;
        return power * 0.65 + wSk * 4.5 + stage * 45 + (matchWpn ? 120 : 0);
      }
      if (spec.skillKey) {
        const sVal = sk[spec.skillKey] || sk[String(spec.skillKey).toLowerCase()] || 0;
        const pathMatch =
          (spec.skillKey === 'FORMATION' && ['ARRAY_TALISMAN', 'DRAGON_VEIN_GEOMANCY', 'ASTRO_DIVINATION'].includes(cPath)) ||
          (spec.skillKey === 'COMMERCE' && (['MERCANTILE_DAO', 'STRATEGY_GOVERNANCE', 'FORTUNE_GAMBLER'].includes(cPath) || cand.canonicalSectId === 'FAC_LONGMEN')) ||
          (spec.skillKey === 'ALCHEMY' && ['SAGE_SUPPORT', 'CRAFT_CREATION'].includes(cPath)) ||
          (spec.skillKey === 'FORGING' && ['CRAFT_CREATION', 'MECH_PUPPET'].includes(cPath)) ||
          (spec.skillKey === 'MEDICINE' && ['SAGE_SUPPORT', 'SPIRIT_HUSBANDRY'].includes(cPath)) ||
          (spec.skillKey === 'STEALTH' && ['NINPO_SHADOW', 'VOID_SPACE', 'WANDERING_DAO'].includes(cPath));
        if (sVal < 45 && !pathMatch) return -1;
        return (sVal || (stage * 14)) * 6.0 + stage * 40 + power * 0.25 + (pathMatch ? 150 : 0);
      }
      if (spec.domain === 'YOUNG_PRODIGY_SUPREME') {
        return power + (28 - age) * 18 + stage * 40;
      }
      if (spec.domain === 'RIGHTEOUS_SUPREME') {
        return power * 0.6 + (vals.righteousness || 50) * 4 + (vals.compassion || 50) * 2 + (cand.merit || 0) * 0.5;
      }
      if (spec.domain === 'DEMON_SUPREME') {
        return power * 0.75 + (100 - (vals.righteousness || 50)) * 3.5 + stage * 30;
      }
      return power + stage * 35;
    },

    findWorldActorById(W, actorId) {
      if (!W || !actorId) return null;
      if (W.byId && W.byId[actorId]) return { actor: W.byId[actorId], isExternal: false, sectId: 'PLAYER_SECT' };
      const npcs = W.npcs || [];
      for (let i = 0; i < npcs.length; i++) {
        if (npcs[i] && npcs[i].id === actorId) return { actor: npcs[i], isExternal: false, sectId: 'PLAYER_SECT' };
      }
      if (W.world) {
        if (W.world.figuresById && W.world.figuresById[actorId]) {
          const fg = W.world.figuresById[actorId];
          return { actor: fg, isExternal: true, sectId: fg.sectId || 'FOREIGN_SECT' };
        }
        const wFigs = W.world.wanderingFigures || [];
        for (let i = 0; i < wFigs.length; i++) {
          if (wFigs[i] && wFigs[i].id === actorId) return { actor: wFigs[i], isExternal: true, sectId: wFigs[i].sectId || 'WANDERING' };
        }
        const rivals = W.world.rivals || W.world.allSects || [];
        for (let i = 0; i < rivals.length; i++) {
          const rv = rivals[i];
          if (!rv || !rv.figures) continue;
          const figs = Array.isArray(rv.figures) ? rv.figures : Object.values(rv.figures);
          for (let j = 0; j < figs.length; j++) {
            const fg = figs[j];
            if (fg && fg.id === actorId) return { actor: fg, isExternal: true, sectId: rv.id || 'FOREIGN_SECT' };
          }
        }
      }
      return null;
    },

    getActorNameTh(actor) {
      if (!actor) return 'ผู้ฝึกตนนิรนาม';
      if (actor.fullNameTh) return actor.fullNameTh;
      if (actor.h && actor.h.name) {
        if (actor.h.name.full) return actor.h.name.full;
        const fam = actor.h.name.family || actor.h.name.surname || actor.h.name.sur || '';
        const giv = actor.h.name.given || '';
        if (fam || giv) return fam + giv;
      }
      return actor.nameTh || actor.name || actor.id || 'ผู้ฝึกตน';
    },

    assignCrownHolder(W, crownId, newHolder, meta) {
      if (!W || !W.world || !crownId || !newHolder) return { ok: false, reason: 'invalid-args' };
      meta = meta || {};
      const crowns = EP.ensureWorldCrowns(W);
      const cr = crowns[crownId];
      if (!cr) return { ok: false, reason: 'unknown-crown' };
      const day = (W && W.day) || 1;

      // Remove from previous holder if different
      if (cr.holderId && cr.holderId !== newHolder.id) {
        const prevFound = EP.findWorldActorById(W, cr.holderId);
        if (prevFound && prevFound.actor) {
          const epPrev = EP.ensureNpcEpithets(prevFound.actor);
          epPrev.crownIds = (epPrev.crownIds || []).filter(id => id !== crownId);
          epPrev.history.push({
            day,
            t: (W && W.t) || 0,
            kind: 'CROWN_LOST',
            epithetId: crownId,
            titleTh: cr.titleTh,
            toHolderId: newHolder.id,
            evidenceTh: meta.reasonTh || ('สูญเสียมงกุฎ「' + cr.titleTh + '」ให้แก่ ' + EP.getActorNameTh(newHolder))
          });
          if (typeof HC !== 'undefined' && HC.bump && !prevFound.isExternal) HC.bump(prevFound.actor);
        }
        cr.previousHolderId = cr.holderId;
        cr.previousHolderNameTh = cr.holderNameTh;
      }

      const foundNew = EP.findWorldActorById(W, newHolder.id) || { actor: newHolder, isExternal: Boolean(newHolder.isExternal), sectId: newHolder.sectId || 'PLAYER_SECT' };
      const holderNameTh = EP.getActorNameTh(newHolder);
      cr.holderId = newHolder.id;
      cr.holderNameTh = holderNameTh;
      cr.holderSectId = foundNew.sectId;
      cr.holderIsExternal = foundNew.isExternal;
      cr.holderScore = Number.isFinite(meta.score) ? Math.round(meta.score) : Math.round(EP.scoreCandidateForCrown(W, newHolder, crownId));
      cr.claimedDay = day;

      // Rumor lag: unless immediatePublic is set, public knowledge updates after 2 days
      if (meta.immediatePublic || !cr.publicKnownHolderId) {
        cr.publicKnownHolderId = newHolder.id;
        cr.publicKnownHolderNameTh = holderNameTh;
        cr.rumorPropagatedDay = day;
      } else {
        cr.rumorPropagatedDay = day + 2;
      }

      cr.history.push({
        holderId: newHolder.id,
        holderNameTh,
        claimedDay: day,
        vacatedDay: null,
        reasonTh: meta.reasonTh || 'ขึ้นครองมงกุฎอันดับหนึ่งแห่งยุทธภพ'
      });
      if (cr.history.length > 24) cr.history.shift();

      const epNew = EP.ensureNpcEpithets(newHolder);
      if (!epNew.crownIds.includes(crownId)) epNew.crownIds.push(crownId);
      EP.grantEpithet(W, newHolder, crownId, {
        descTh: meta.reasonTh || ('ครองมงกุฎหนึ่งเดียวในใต้หล้า「' + cr.titleTh + '」'),
        epistemicStatus: 'VERIFIED',
        forcePublic: true
      });
      if (typeof HC !== 'undefined' && HC.bump && !foundNew.isExternal) HC.bump(newHolder);
      return { ok: true, crown: cr };
    },

    vacateCrown(W, crownId, reasonTh) {
      if (!W || !W.world || !crownId) return { ok: false };
      const crowns = EP.ensureWorldCrowns(W);
      const cr = crowns[crownId];
      if (!cr || !cr.holderId) return { ok: false, reason: 'already-vacant' };
      const day = (W && W.day) || 1;
      const prevFound = EP.findWorldActorById(W, cr.holderId);
      if (prevFound && prevFound.actor && prevFound.actor.epithets) {
        prevFound.actor.epithets.crownIds = (prevFound.actor.epithets.crownIds || []).filter(id => id !== crownId);
        prevFound.actor.epithets.history.push({
          day,
          t: (W && W.t) || 0,
          kind: 'CROWN_VACATED',
          epithetId: crownId,
          titleTh: cr.titleTh,
          evidenceTh: reasonTh || 'สละมงกุฎหนึ่งเดียวในใต้หล้า'
        });
        if (typeof HC !== 'undefined' && HC.bump && !prevFound.isExternal) HC.bump(prevFound.actor);
      }
      cr.previousHolderId = cr.holderId;
      cr.previousHolderNameTh = cr.holderNameTh;
      if (cr.history.length > 0 && cr.history[cr.history.length - 1].vacatedDay == null) {
        cr.history[cr.history.length - 1].vacatedDay = day;
        cr.history[cr.history.length - 1].vacateReasonTh = reasonTh || 'ว่างลง';
      }
      cr.holderId = null;
      cr.holderNameTh = null;
      cr.holderSectId = null;
      cr.holderIsExternal = false;
      cr.holderScore = 0;
      cr.publicKnownHolderId = null;
      cr.publicKnownHolderNameTh = null;
      return { ok: true, crownId, vacatedFrom: cr.previousHolderId };
    },

    vacateCrownOnDeath(W, npc) {
      if (!W || !W.world || !npc) return [];
      const crowns = EP.ensureWorldCrowns(W);
      const vacated = [];
      for (const cid of Object.keys(crowns)) {
        const cr = crowns[cid];
        if (cr && cr.holderId === npc.id) {
          EP.vacateCrown(W, cid, 'ผู้ถือครองถึงแก่กรรม มงกุฎจึงว่างลงทันที');
          vacated.push(cid);
        }
      }
      if (npc.epithets && Array.isArray(npc.epithets.crownIds)) {
        npc.epithets.crownIds = [];
      }
      if (typeof HC !== 'undefined' && HC.bump) HC.bump(npc);
      return vacated;
    },

    syncPublicCrownKnowledge(W) {
      if (!W || !W.world || !W.world.uniqueCrowns) return;
      const day = (W && W.day) || 1;
      for (const cid of Object.keys(W.world.uniqueCrowns)) {
        const cr = W.world.uniqueCrowns[cid];
        if (cr && cr.holderId && day >= (cr.rumorPropagatedDay || 0)) {
          cr.publicKnownHolderId = cr.holderId;
          cr.publicKnownHolderNameTh = cr.holderNameTh;
        }
      }
    },

    checkCrownDuelTransfer(W, fight, winner, loser) {
      if (!W || !W.world || !winner || !loser || winner.dead) return [];
      if (fight && (fight.kind === 'spar' || fight.serious === false)) return [];
      const crowns = EP.ensureWorldCrowns(W);
      const specs = EP.getCatalog().CROWNS_SPEC || {};
      const transferred = [];

      for (const cid of Object.keys(crowns)) {
        const cr = crowns[cid];
        if (!cr || cr.holderId !== loser.id) continue;
        const sp = specs[cid];
        if (!sp) continue;

        // Check domain eligibility for direct duel transfer
        let eligible = false;
        if (sp.domain === 'COMBAT_SUPREME') eligible = true;
        else if (sp.domain === 'YOUNG_PRODIGY_SUPREME') {
          const age = (winner && winner.h && winner.h.birthDay != null && typeof HC !== 'undefined' && HC.ageYears) ? HC.ageYears(winner) : (winner && winner.ageYears || 20);
          if (age <= (sp.maxAge || 27)) eligible = true;
        } else if (sp.weaponType) {
          const wEq = winner.equip && winner.equip.WEAPON;
          const wType = (wEq && (wEq.weaponType || wEq.type)) || winner.weaponType || null;
          const wSk = (winner.h && winner.h.skills && winner.h.skills[sp.weaponType]) || 0;
          if (wType === sp.weaponType || wSk >= 55) eligible = true;
        } else if (sp.domain === 'DEMON_SUPREME' || sp.domain === 'RIGHTEOUS_SUPREME') {
          if (EP.scoreCandidateForCrown(W, winner, cid) > 0) eligible = true;
        }

        if (eligible) {
          EP.assignCrownHolder(W, cid, winner, {
            reasonTh: 'โค่นผู้ถือครองเดิม (' + EP.getActorNameTh(loser) + ') ในศึกดวลจริง จึงชิงมงกุฎ「' + cr.titleTh + '」มาครอง',
            immediatePublic: Boolean(fight && (fight.kind === 'leadership' || fight.kind === 'tourney' || fight.gather))
          });
          transferred.push(cid);
        }
      }
      return transferred;
    },

    reconcileUniqueCrowns(W, opts) {
      if (!W || !W.world) return { ok: false };
      opts = opts || {};
      const crowns = EP.ensureWorldCrowns(W);
      const specs = EP.getCatalog().CROWNS_SPEC || {};
      const day = (W && W.day) || 1;

      // Gather all living candidates: sect NPCs + wandering figures + rival notables
      const candidates = [];
      for (const n of (W.npcs || [])) {
        if (n && !n.dead && !n.exiled) candidates.push(n);
      }
      const seenCandIds = new Set(candidates.map(x => x.id));
      for (const fg of Object.values(W.world.figuresById || {})) {
        if (fg && !fg.dead && !seenCandIds.has(fg.id)) {
          seenCandIds.add(fg.id);
          candidates.push(fg);
        }
      }
      for (const wf of (W.world.wanderingFigures || [])) {
        if (wf && !wf.dead && !seenCandIds.has(wf.id)) {
          seenCandIds.add(wf.id);
          candidates.push(wf);
        }
      }

      const changes = [];
      for (const cid of Object.keys(specs)) {
        const cr = crowns[cid];
        const sp = specs[cid];

        // Validate incumbent first (check death or age-out on #245)
        let incumbent = null;
        let incumbentScore = -1;
        if (cr.holderId) {
          const found = EP.findWorldActorById(W, cr.holderId);
          if (!found || !found.actor || found.actor.dead) {
            EP.vacateCrown(W, cid, 'ผู้ถือครองเดิมเสียชีวิตหรือสาบสูญ');
          } else {
            const age = (found.actor && found.actor.h && found.actor.h.birthDay != null && typeof HC !== 'undefined' && HC.ageYears) ? HC.ageYears(found.actor) : (found.actor && found.actor.ageYears || 25);
            if (sp.maxAge != null && age > sp.maxAge) {
              EP.vacateCrown(W, cid, 'ก้าวพ้นวัยเยาว์ (อายุครบ ' + Math.floor(age) + ' ปี) สละมงกุฎดาวรุ่งสู่คนรุ่นหลัง');
            } else {
              incumbent = found.actor;
              incumbentScore = EP.scoreCandidateForCrown(W, incumbent, cid);
              cr.holderScore = Math.round(incumbentScore);
            }
          }
        }

        // Find best challenger
        let bestCand = null;
        let bestScore = -1;
        for (let i = 0; i < candidates.length; i++) {
          const c = candidates[i];
          const sc = EP.scoreCandidateForCrown(W, c, cid);
          // Strict tie rule: incumbent wins ties; among non-incumbents, deterministic id tie-breaker
          if (sc > bestScore) {
            bestScore = sc;
            bestCand = c;
          }
        }

        if (!bestCand || bestScore <= 0) continue;

        if (!incumbent) {
          EP.assignCrownHolder(W, cid, bestCand, {
            score: bestScore,
            reasonTh: 'หอเทียนจีประกาศทำเนียบผู้ครองมงกุฎ「' + sp.titleTh + '」',
            immediatePublic: Boolean(opts.immediatePublic)
          });
          changes.push({ crownId: cid, holderId: bestCand.id });
        } else if (bestCand.id !== incumbent.id) {
          // Tie-keeps-incumbent & >8% margin required for non-duel ranking overtake
          if (bestScore > incumbentScore * 1.08) {
            EP.assignCrownHolder(W, cid, bestCand, {
              score: bestScore,
              reasonTh: 'ผลงานและตบะก้าวข้ามผู้ถือครองเดิมในการจัดทำเนียบหอเทียนจี',
              immediatePublic: Boolean(opts.immediatePublic)
            });
            changes.push({ crownId: cid, holderId: bestCand.id, previousHolderId: incumbent.id });
          }
        }
      }

      EP.syncPublicCrownKnowledge(W);
      return { ok: true, changes };
    },

    /* -----------------------------------------------------------------------
     * COLLECTIVE GROUP EPITHETS (#173-#188)
     * ----------------------------------------------------------------------- */
    formCollectiveGroup(W, groupId, memberNpcIds, meta) {
      if (!W || !W.sect || !groupId || !Array.isArray(memberNpcIds) || memberNpcIds.length < 2) {
        return { ok: false, reason: 'invalid-group-args' };
      }
      meta = meta || {};
      const cg = EP.ensureCollectiveGroups(W);
      const def = EP.getDef(groupId) || { id: groupId, titleTh: meta.titleTh || 'กลุ่มร่วมสาบานยุทธภพ', effectType: 'MICRO' };
      const day = (W && W.day) || 1;
      const members = memberNpcIds.map(id => W.byId && W.byId[id]).filter(n => n && !n.dead && !n.exiled);
      if (members.length < 2) return { ok: false, reason: 'insufficient-living-members' };

      const grp = {
        id: groupId,
        titleTh: meta.titleTh || def.titleTh,
        memberIds: members.map(m => m.id),
        livingMemberIds: members.map(m => m.id),
        fallenMemberIds: [],
        formedDay: day,
        status: 'ACTIVE', // ACTIVE | BEREAVED | SOLE_SURVIVOR | FRACTURED
        groupBonusActive: true,
        sharedDeedsCount: meta.sharedDeedsCount || 2,
        history: [{
          day,
          kind: 'GROUP_FORMED',
          textTh: 'ก่อตั้งนามกลุ่มร่วมสาบาน「' + (meta.titleTh || def.titleTh) + '」(' + members.map(m => EP.getActorNameTh(m)).join(', ') + ')'
        }]
      };
      cg.byId[groupId] = grp;
      cg.list = Object.values(cg.byId);

      for (const m of members) {
        const ep = EP.ensureNpcEpithets(m);
        ep.groupId = groupId;
        ep.groupTitleTh = grp.titleTh;
        EP.grantEpithet(W, m, groupId, {
          descTh: 'ร่วมก่อตั้งนามกลุ่ม「' + grp.titleTh + '」',
          epistemicStatus: 'VERIFIED',
          witnessIds: grp.memberIds.filter(id => id !== m.id)
        });
      }
      return { ok: true, group: grp };
    },

    onGroupMemberDeath(W, deceasedNpc, killer) {
      if (!W || !W.sect || !deceasedNpc) return { ok: false };
      const cg = EP.ensureCollectiveGroups(W);
      const epD = deceasedNpc.epithets;
      const gid = epD && epD.groupId;
      if (!gid || !cg.byId[gid]) return { ok: false, reason: 'not-in-group' };

      const grp = cg.byId[gid];
      const day = (W && W.day) || 1;
      grp.livingMemberIds = (grp.livingMemberIds || []).filter(id => id !== deceasedNpc.id);
      if (!grp.fallenMemberIds.includes(deceasedNpc.id)) grp.fallenMemberIds.push(deceasedNpc.id);

      const survivors = grp.livingMemberIds.map(id => W.byId && W.byId[id]).filter(n => n && !n.dead);
      if (survivors.length === 1) {
        grp.status = 'SOLE_SURVIVOR';
        const last = survivors[0];
        EP.grantEpithet(W, last, 'EPI_CHV_096', {
          descTh: 'ผู้รอดชีวิตคนสุดท้ายของกลุ่ม「' + grp.titleTh + '」หลังการจากไปของ ' + EP.getActorNameTh(deceasedNpc),
          epistemicStatus: 'VERIFIED',
          forcePublic: true
        });
      } else if (survivors.length > 1) {
        grp.status = 'BEREAVED';
        for (const s of survivors) {
          EP.grantEpithet(W, s, 'EPI_CHV_101', {
            descTh: 'ร่วมแบกรับปณิธานล้างแค้นให้สหายร่วมสาบาน「' + grp.titleTh + '」',
            epistemicStatus: 'VERIFIED'
          });
        }
      } else {
        grp.status = 'EXTINCT';
        grp.groupBonusActive = false;
      }

      grp.history.push({
        day,
        kind: 'MEMBER_FALLEN',
        deceasedId: deceasedNpc.id,
        killerId: killer ? killer.id : null,
        textTh: EP.getActorNameTh(deceasedNpc) + ' สิ้นชีพ ทำให้นามกลุ่ม「' + grp.titleTh + '」เข้าสู่สถานะโศกนาฏกรรม (' + grp.status + ')'
      });
      return { ok: true, status: grp.status, group: grp };
    },

    onGroupMemberFracture(W, npcA, npcB, reasonTh) {
      if (!W || !W.sect || !npcA) return { ok: false };
      const cg = EP.ensureCollectiveGroups(W);
      const gid = (npcA.epithets && npcA.epithets.groupId) || (npcB && npcB.epithets && npcB.epithets.groupId);
      if (!gid || !cg.byId[gid]) return { ok: false, reason: 'no-shared-group' };
      const grp = cg.byId[gid];
      const day = (W && W.day) || 1;
      grp.status = 'FRACTURED';
      grp.groupBonusActive = false;
      grp.history.push({
        day,
        kind: 'GROUP_FRACTURED',
        textTh: 'นามกลุ่ม「' + grp.titleTh + '」แตกหักลง (' + (reasonTh || 'ความขัดแย้งรุนแรงหรือการทรยศ') + ')'
      });
      for (const mid of grp.memberIds) {
        const m = W.byId && W.byId[mid];
        if (m && m.epithets) {
          m.epithets.groupTitleTh = grp.titleTh + ' (แตกหัก)';
          m.epithets.history.push({
            day,
            t: (W && W.t) || 0,
            kind: 'GROUP_FRACTURED',
            epithetId: gid,
            titleTh: grp.titleTh,
            evidenceTh: reasonTh || 'พันธะกลุ่มร่วมสาบานแตกหัก'
          });
          if (typeof HC !== 'undefined' && HC.bump) HC.bump(m);
        }
      }
      return { ok: true, status: grp.status, group: grp };
    },

    evaluateCollectiveGroups(W) {
      if (!W || !W.sect || !Array.isArray(W.npcs)) return;
      const cg = EP.ensureCollectiveGroups(W);
      // Check existing groups for exile/feud fractures
      for (const gid of Object.keys(cg.byId)) {
        const grp = cg.byId[gid];
        if (!grp || grp.status === 'FRACTURED' || grp.status === 'EXTINCT') continue;
        for (let i = 0; i < grp.livingMemberIds.length; i++) {
          const m1 = W.byId && W.byId[grp.livingMemberIds[i]];
          if (!m1) continue;
          if (m1.exiled) {
            EP.onGroupMemberFracture(W, m1, null, EP.getActorNameTh(m1) + ' ถูกขับไล่ออกจากสำนัก');
            break;
          }
          for (let j = i + 1; j < grp.livingMemberIds.length; j++) {
            const m2 = W.byId && W.byId[grp.livingMemberIds[j]];
            if (!m2) continue;
            const rel = m1.h && m1.h.mind && m1.h.mind.relations && m1.h.mind.relations[m2.id];
            if (rel && (rel.a <= -45 || rel.bond === 'ศัตรู')) {
              EP.onGroupMemberFracture(W, m1, m2, 'สายสัมพันธ์ระหว่าง ' + EP.getActorNameTh(m1) + ' และ ' + EP.getActorNameTh(m2) + ' แปรเปลี่ยนเป็นศัตรู');
              break;
            }
          }
        }
      }

      // Auto-form sword duo (EPI_GRP_173) or sworn trio (EPI_GRP_176) when eligible
      if (!cg.byId.EPI_GRP_173) {
        const ungrouped = W.npcs.filter(n => n && !n.dead && !n.exiled && n.cult && n.cult.stage >= 2 && (!n.epithets || !n.epithets.groupId));
        for (let i = 0; i < ungrouped.length; i++) {
          const a = ungrouped[i];
          for (let j = i + 1; j < ungrouped.length; j++) {
            const b = ungrouped[j];
            const rel = a.h && a.h.mind && a.h.mind.relations && a.h.mind.relations[b.id];
            if (rel && (rel.a >= 65 || a.companionId === b.id)) {
              EP.formCollectiveGroup(W, 'EPI_GRP_173', [a.id, b.id], {
                titleTh: 'คู่กระบี่หงส์มังกรไร้พ่าย',
                sharedDeedsCount: 3
              });
              break;
            }
          }
          if (cg.byId.EPI_GRP_173) break;
        }
      }
    },

    /* -----------------------------------------------------------------------
     * DAOIST/DHARMA NAMES (#077-#084), LINEAGE TITLES (#085-#092),
     * AND POSTHUMOUS HONORIFICS (#247-#260)
     * ----------------------------------------------------------------------- */
    bestowDaoName(W, npc, opts) {
      if (!npc || !npc.h || !npc.h.name) return { ok: false, reason: 'invalid-npc' };
      opts = opts || {};
      const ep = EP.ensureNpcEpithets(npc);
      if (ep.daoNameTh && !opts.force) return { ok: true, daoNameTh: ep.daoNameTh, familyId: ep.daoStyleFamilyId, alreadyBestowed: true };

      const cPath = (npc.cult && npc.cult.path) || 'XIAN';
      let famId = 'EPI_DAO_077';
      if (cPath === 'HEART_SOUL' || cPath === 'KARMA_SAMSARA') famId = 'EPI_DAO_078';
      else if (cPath === 'ARRAY_TALISMAN' || cPath === 'SAGE_SUPPORT' || cPath === 'CELESTIAL_DIVINER') famId = 'EPI_DAO_079';
      else if (cPath === 'DEMON' || cPath === 'BLOOD_ARTS' || cPath === 'CORPSE_PUPPET' || cPath === 'VENOM_GU') famId = 'EPI_DAO_080';
      else if (cPath === 'SHADOW_ASSASSIN' || cPath === 'BLADE_SOVEREIGN') famId = 'EPI_DAO_081';
      else if (cPath === 'BODY' || cPath === 'MARTIAL_GOD') famId = 'EPI_DAO_082';
      else if (cPath === 'BEAST_SOVEREIGN' || cPath === 'PRIMORDIAL_SHIFTER' || cPath === 'TOTEM_SHAMAN') famId = 'EPI_DAO_083';
      else if ((npc.h.skills && (npc.h.skills.COMMERCE || 0) >= 65)) famId = 'EPI_DAO_084';

      const spec = (EP.getCatalog().DAO_STYLES_SPEC || {})[famId] || {
        id: 'EPI_DAO_077', prefixes: ['นักพรต', 'เจิ้นเหริน'], stems: ['เมฆาคราม', 'ชิงอวิ๋น', 'เสวียนหยวน']
      };
      const hVal = EP.detHash(npc.id + ':' + (npc.h.name.given || '') + ':' + cPath);
      const prefix = spec.prefixes[hVal % spec.prefixes.length];
      const stem = spec.stems[(hVal >>> 4) % spec.stems.length];
      const daoNameTh = opts.customDaoNameTh || (prefix + stem);

      // Strictly preserve birth name in npc.h.name.given / family
      ep.daoNameTh = daoNameTh;
      ep.daoStyleFamilyId = famId;
      EP.grantEpithet(W, npc, famId, {
        descTh: 'รับฉายาเต๋า/นามธรรมะ「' + daoNameTh + '」เมื่อก้าวเข้าสู่ขอบเขตบำเพ็ญขั้นสูง',
        epistemicStatus: 'VERIFIED'
      });
      return { ok: true, daoNameTh, familyId: famId };
    },

    refreshLineageTitles(W) {
      if (!W || !W.sect || !Array.isArray(W.npcs)) return;
      const living = W.npcs.filter(n => n && !n.dead && !n.exiled);
      if (!living.length) return;

      // Eldest/earliest-joined core disciple -> EPI_DAO_085 (ศิษย์พี่ใหญ่ผู้บุกเบิกสำนัก)
      const disciples = living.filter(n => n.rank >= 1 && n.rank <= 3);
      if (disciples.length > 0) {
        disciples.sort((a, b) => (a.joinDay || 0) - (b.joinDay || 0) || (b.cult ? b.cult.stage : 0) - (a.cult ? a.cult.stage : 0));
        const senior = disciples[0];
        const epS = EP.ensureNpcEpithets(senior);
        epS.lineageTitleId = 'EPI_DAO_085';
        epS.lineageTitleTh = 'ศิษย์พี่ใหญ่ผู้บุกเบิกสำนัก';
      }

      // Direct heir of Sect Master -> EPI_DAO_092 (ผู้สืบทอดเจตจำนงบูรพาจารย์)
      const masterId = W.sect.masterId;
      for (const n of living) {
        const ep = EP.ensureNpcEpithets(n);
        if (masterId && (n.mentorId === masterId || n.mentor === masterId)) {
          ep.lineageTitleId = 'EPI_DAO_092';
          ep.lineageTitleTh = 'ผู้สืบทอดเจตจำนงบูรพาจารย์';
        } else if (n.rank >= 5) {
          ep.lineageTitleId = 'EPI_DAO_089';
          ep.lineageTitleTh = 'เสาหลักค้ำจุนสามรัชสมัย';
        }
        if (n.cult && n.cult.stage >= 3 && !ep.daoNameTh) {
          EP.bestowDaoName(W, n);
        }
      }
    },

    bestowPosthumousTitle(W, npc, why, opts) {
      if (!npc) return { ok: false, reason: 'no-npc' };
      opts = opts || {};
      const ep = EP.ensureNpcEpithets(npc);
      const wStr = String(why || npc.deathWhy || '');
      let pid = opts.posthumousId || 'EPI_PST_250';

      if (npc.rank === 6 || (W && W.sect && W.sect.masterId === npc.id)) pid = 'EPI_PST_247';
      else if (wStr.includes('ทัณฑ์สวรรค์') || wStr.includes('ทะลวง')) pid = 'EPI_PST_249';
      else if (wStr.includes('ศึก') || wStr.includes('ปกป้อง') || wStr.includes('ด่าน') || wStr.includes('ประลอง')) pid = 'EPI_PST_248';
      else if (wStr.includes('ชราภาพ') || wStr.includes('อายุขัย')) pid = 'EPI_PST_250';
      else if (npc.away || wStr.includes('แดนลับ') || wStr.includes('สำรวจ')) pid = 'EPI_PST_256';
      else if ((npc.h && npc.h.skills && (npc.h.skills.MEDICINE || 0) >= 65)) pid = 'EPI_PST_253';
      else if (ep.owned.some(x => x && x.polarity === 'SHAME' && x.shameActive)) pid = 'EPI_PST_259';

      const def = EP.getDef(pid) || { id: 'EPI_PST_250', titleTh: 'บรรพชนผู้ละสังขารอย่างสงบครบอายุขัย' };
      ep.posthumousId = def.id;
      ep.posthumousTitleTh = def.titleTh;
      EP.grantEpithet(W, npc, def.id, {
        descTh: 'จารึกสมญานามปัจฉิมมรณะบนป้ายวิญญาณบรรพชน (' + (wStr || 'ละสังขาร') + ')',
        epistemicStatus: 'VERIFIED',
        forcePublic: true
      });

      if (W && W.sect && W.sect.historicalPeople && W.sect.historicalPeople[npc.id]) {
        W.sect.historicalPeople[npc.id].posthumousTitleTh = def.titleTh;
        W.sect.historicalPeople[npc.id].posthumousId = def.id;
      }
      return { ok: true, posthumousId: def.id, posthumousTitleTh: def.titleTh };
    },

    /* -----------------------------------------------------------------------
     * STAT / COMBAT BONUSES (SOVEREIGN CAP = 1, MICRO CAP = 2, NO STACK BLOAT)
     * ----------------------------------------------------------------------- */
    getNpcStatBonuses(npc) {
      if (!npc || npc.foe || npc.dead || !npc.epithets) return null;
      const ep = npc.epithets;
      const p = {};
      const f = {};
      const labels = [];

      // 1. At most ONE Sovereign Crown aura (#235-#246)
      if (Array.isArray(ep.crownIds) && ep.crownIds.length > 0) {
        const cid = ep.crownIds[0];
        const cSpec = (EP.getCatalog().CROWNS_SPEC || {})[cid];
        if (cSpec) {
          for (const k in (cSpec.p || {})) p[k] = (p[k] || 0) + cSpec.p[k];
          for (const k in (cSpec.f || {})) f[k] = (f[k] || 0) + cSpec.f[k];
          labels.push('มงกุฎ「' + cSpec.titleTh + '」');
        }
      }

      // 2. At most TWO Micro-perk epithets (capped at +3% total per stat)
      let microCount = 0;
      const owned = ep.owned || [];
      for (let i = 0; i < owned.length; i++) {
        const rec = owned[i];
        if (!rec || rec.effectType !== 'MICRO' || rec.shameActive || rec.suppressedByStealth) continue;
        if (!['BATTLEFIELD', 'GROUP', 'CHIVALRY', 'FATE_SCARS', 'ELEMENT_DAO'].includes(rec.category)) continue;
        if (rec.category === 'GROUP' && ep.groupId !== rec.id) continue;
        p.atk = Math.min(0.11, (p.atk || 0) + 0.015);
        p.def = Math.min(0.10, (p.def || 0) + 0.015);
        labels.push('สมญา「' + rec.titleTh + '」');
        microCount++;
        if (microCount >= 2) break;
      }

      if (!labels.length) return null;
      return { p, f, labelTh: labels.join(' · ') };
    },

    getCacheHash(npc) {
      if (!npc || !npc.epithets) return 0;
      const ep = npc.epithets;
      let h = 0;
      if (ep.crownIds && ep.crownIds.length) {
        h ^= EP.detHash(ep.crownIds[0]) & 0xffff;
      }
      if (ep.primaryId) {
        h ^= (EP.detHash(ep.primaryId) & 0x7fff) << 8;
      }
      if (ep.groupId) {
        h ^= (EP.detHash(ep.groupId) & 0xff) << 16;
      }
      return h | 0;
    },

    /* -----------------------------------------------------------------------
     * LIFECYCLE & EVENT HOOKS (COMBAT, CRAFT, HEAL, DAILY, MONTHLY, HYDRATE)
     * ----------------------------------------------------------------------- */
    onCombatConclude(W, fight) {
      if (!W || !fight) return;
      const isSerious = fight.kind !== 'spar' && fight.serious !== false;
      const ws = fight.winner;
      const winners = ws ? (ws === 'A' ? fight.A : fight.B).map(id => W.byId && W.byId[id]).filter(Boolean) : [];
      const losers = ws ? (ws === 'A' ? fight.B : fight.A).map(id => (W.byId && W.byId[id]) || (W.foeById && W.foeById[id])).filter(Boolean) : [];

      if (!isSerious) {
        // Sparring only updates spar_win counter
        for (const u of winners) {
          if (!u.foe && !u.dead) {
            EP.recordDeed(W, u, 'spar_win', 1, { fightKind: 'spar', serious: false, receiptId: 'spar_' + (fight.id || W.t) + '_' + u.id });
          }
        }
        return;
      }

      const maxFoeStage = losers.reduce((m, x) => Math.max(m, (x.cult && x.cult.stage) || x.tier || 1), 1);
      const hasBossFoe = losers.some(x => x && (x.boss || x.isBoss || x.kind === 'boss'));
      const hasIronMarrowFoe = losers.some(x => x && Array.isArray(x.abilities) && (x.abilities.includes('ABIL_IRON_MARROW_GUARD') || x.abilities.includes('ABIL_SOLAR_STAR_AEGIS')));
      const witnessIds = winners.filter(u => !u.foe && !u.dead).map(u => u.id);
      const soloWilderness = (fight.kind === 'wild' || fight.kind === 'explore') && witnessIds.length <= 1;

      for (const u of winners) {
        if (!u || u.foe || u.dead) continue;
        const fKey = 'fight_' + (fight.id || W.t) + '_' + u.id;
        EP.recordDeed(W, u, 'combat_win', 1, {
          fightKind: fight.kind,
          serious: true,
          targetStage: maxFoeStage,
          witnessIds,
          soloWilderness,
          hasPhysicalProof: true,
          receiptId: fKey + '_win',
          descTh: 'คว้าชัยชนะในศึกจริง (' + (fight.kind || 'combat') + ')'
        });

        if (losers.length > winners.length) {
          EP.recordDeed(W, u, 'outnumbered_win', 1, {
            fightKind: fight.kind, serious: true, targetStage: maxFoeStage, witnessIds,
            receiptId: fKey + '_outnum', descTh: 'ยืนหยัดคว้าชัยชนะแม้น้อยสู้มาก'
          });
        }

        const hpNow = (u.h && u.h.state && u.h.state.hp) || 100;
        const hpMax = (typeof CULT !== 'undefined' && CULT.hpMax) ? CULT.hpMax(u) : 100;
        if (hpNow / Math.max(1, hpMax) <= 0.25) {
          EP.recordDeed(W, u, 'low_hp_win', 1, {
            fightKind: fight.kind, serious: true, targetStage: maxFoeStage, witnessIds,
            receiptId: fKey + '_lowhp', descTh: 'รอดชีวิตคว้าชัยทั้งที่บาดเจ็บเจียนตาย'
          });
        } else if (hpNow / Math.max(1, hpMax) >= 0.98) {
          EP.recordDeed(W, u, 'flawless_win', 1, {
            fightKind: fight.kind, serious: true, targetStage: maxFoeStage, witnessIds,
            receiptId: fKey + '_flawless', descTh: 'คว้าชัยชนะโดยอาภรณ์ไร้รอยโลหิต'
          });
        }

        if (hasBossFoe && winners.length === 1) {
          EP.recordDeed(W, u, 'solo_boss_kill', 1, {
            fightKind: fight.kind, serious: true, targetStage: maxFoeStage, witnessIds,
            hasPhysicalProof: true, receiptId: fKey + '_soloboss', descTh: 'พิชิตบอสอสูรหรือยอดฝีมือเพียงลำพัง'
          });
        }
        if (hasIronMarrowFoe) {
          EP.recordDeed(W, u, 'iron_marrow_breaker', 1, {
            fightKind: fight.kind, serious: true, targetStage: maxFoeStage, witnessIds,
            hasPhysicalProof: true, receiptId: fKey + '_ironmarrow', descTh: 'ผ่าเกราะไขกระดูกเหล็กอสูรบรรพกาลสำเร็จ'
          });
        }

        const wEq = u.equip && u.equip.WEAPON;
        const wType = (wEq && (wEq.weaponType || wEq.type)) || null;
        if (wType) {
          EP.recordDeed(W, u, 'weapon_kill:' + wType, 1, {
            fightKind: fight.kind, serious: true, targetStage: maxFoeStage, witnessIds,
            hasPhysicalProof: true, receiptId: fKey + '_wpn_' + wType, descTh: 'เผด็จศึกด้วยศาสตราคู่กาย (' + wType + ')'
          });
        }
      }

      // Direct Moveable Crown transfer on 1v1 or serious duel
      if (winners.length >= 1 && losers.length >= 1 && !losers[0].foe) {
        EP.checkCrownDuelTransfer(W, fight, winners[0], losers[0]);
      }
    },

    onCraftFinish(W, npc, recipe, out, ctx) {
      if (!W || !npc || !recipe) return;
      const rId = recipe.id || 'craft';
      const isPill = String(recipe.outItemId || '').startsWith('P:') || recipe.kind === 'alchemy' || recipe.station === 'alchemy';
      const isForge = recipe.kind === 'forge' || recipe.station === 'forge' || (out && out.slot);
      const rcpt = 'craft_' + npc.id + '_' + rId + '_' + ((W && W.day) || 1) + '_' + ((W && W.t) || 0);
      if (isPill) {
        EP.recordDeed(W, npc, 'alchemy_success', 1, {
          receiptId: rcpt,
          descTh: 'หลอมโอสถ「' + (recipe.nameTh || recipe.id) + '」สำเร็จ'
        });
      } else if (isForge) {
        EP.recordDeed(W, npc, 'forge_success', 1, {
          receiptId: rcpt,
          descTh: 'ตีหลอมศาสตรา「' + (recipe.nameTh || recipe.id) + '」สำเร็จ'
        });
      }
    },

    onDailyTick(W) {
      if (!W || !W.sect || !Array.isArray(W.npcs)) return;
      EP.ensureWorldCrowns(W);
      EP.ensureCollectiveGroups(W);
      EP.syncPublicCrownKnowledge(W);

      // Inspect 6-Pillar & Sect states for autonomous epithet unlocks
      const ml = W.sect.microLocations;
      const mlVisitedCount = (ml && ml.visitedById) ? Object.keys(ml.visitedById).length : 0;

      for (let i = 0; i < W.npcs.length; i++) {
        const n = W.npcs[i];
        if (!n || n.dead || n.exiled) continue;
        EP.ensureNpcEpithets(n);
        EP.ensureDeedStats(n);

        // Check 6-Pillar martial states
        if (n.qinggongState && (n.qinggongState.flightTier >= 3 || n.qinggongState.evadeCount >= 10)) {
          EP.recordDeed(W, n, 'qinggong_flight_mastery', 1, { receiptId: 'qg_mastery_' + n.id, descTh: 'บรรลุวิชาตัวเบาเหินเวหาเหนือแปดยอดเขา' });
        }
        if (n.mantraState && (n.mantraState.weatherResonanceCount >= 3 || n.mantraState.harmonyLevel >= 80)) {
          EP.recordDeed(W, n, 'mantra_weather_sync', 1, { receiptId: 'mantra_sync_' + n.id, descTh: 'โคจรคัมภีร์ปราณประสานฟ้าดินตามฤดูกาล' });
        }
        if (n.defensiveArtState && ((n.defensiveArtState.totalDamageRedirected || 0) >= 250 || (n.defensiveArtState.totalAllyIntercepts || 0) >= 3)) {
          EP.recordDeed(W, n, 'defensive_redirect_mastery', 1, { receiptId: 'def_redir_' + n.id, descTh: 'สะท้อนคลื่นศาสตราและคุ้มกันสหายด้วยวิชาคุ้มกาย' });
        }
        if (n.supportState && ((n.supportState.breakthroughBlessingsGranted || 0) >= 2 || (n.supportState.totalHeartDemonCleansed || 0) >= 40)) {
          EP.recordDeed(W, n, 'support_blessing_mastery', 1, { receiptId: 'sup_bless_' + n.id, descTh: 'บรรเลงทำนองทิพย์ชะล้างจิตมารและอวยพรทะลวงด่าน' });
        }
        if (n.forbiddenArtState && n.forbiddenArtState.sealMode === 'BLOOD_TABOO_UNLEASHED' && (n.h && n.h.state && (n.h.state.heartDemon || 0) < 75)) {
          EP.recordDeed(W, n, 'forbidden_blood_taboo_survived', 1, { receiptId: 'forb_blood_' + n.id, descTh: 'คลายผนึกโลหิตต้องห้ามขั้นสูงสุดแล้วยังครองสติไว้ได้' });
        }
        if (n.passiveResonanceState && (n.passiveResonanceState.setTier >= 3 || n.passiveResonanceState.unlockedCount >= 3)) {
          EP.recordDeed(W, n, 'passive_constellation_tier3', 1, { receiptId: 'pass_const3_' + n.id, descTh: 'เรียงดาราจักรวิชาติดตัวครบสามขั้นสมบูรณ์' });
        }
        if (mlVisitedCount >= 4 && n.rank >= 2) {
          EP.recordDeed(W, n, 'micro_locations_all4', 1, { receiptId: 'ml_all4_' + n.id, descTh: 'สำรวจครบสี่แดนเร้นลับบรรพกาลรอบสำนัก' });
        }
      }

      // Check Leyline anchors
      if (W.sect.leylineGrid && Array.isArray(W.sect.leylineGrid.anchors)) {
        for (const a of W.sect.leylineGrid.anchors) {
          if (a && a.guardNpcId && W.byId && W.byId[a.guardNpcId]) {
            EP.recordDeed(W, W.byId[a.guardNpcId], 'leyline_anchor_guard', 1, {
              receiptId: 'leyline_guard_' + a.guardNpcId,
              descTh: 'พิทักษ์เสาชีพจรปฐพีประจำยอดเขา'
            });
          }
        }
      }

      // Refresh lineage titles & reconcile crowns every 10 days (or on day 361)
      if ((W.day || 0) % 10 === 1) {
        EP.refreshLineageTitles(W);
        EP.reconcileUniqueCrowns(W);
        EP.evaluateCollectiveGroups(W);
      }
    },

    onMonthlyAudit(W) {
      if (!W || !W.sect) return;
      EP.refreshLineageTitles(W);
      EP.reconcileUniqueCrowns(W);
      EP.evaluateCollectiveGroups(W);
    },

    onHydrateExternalFigure(W, fullNpc, srcFig) {
      if (!fullNpc || !srcFig) return;
      const ep = EP.ensureNpcEpithets(fullNpc);
      EP.ensureDeedStats(fullNpc);
      if (srcFig.epithets && typeof srcFig.epithets === 'object') {
        ep.primaryId = srcFig.epithets.primaryId || ep.primaryId;
        ep.primaryTextTh = srcFig.epithets.primaryTextTh || ep.primaryTextTh;
        ep.daoNameTh = srcFig.epithets.daoNameTh || ep.daoNameTh;
        ep.daoStyleFamilyId = srcFig.epithets.daoStyleFamilyId || ep.daoStyleFamilyId;
        if (Array.isArray(srcFig.epithets.crownIds)) {
          for (const cid of srcFig.epithets.crownIds) {
            if (!ep.crownIds.includes(cid)) ep.crownIds.push(cid);
          }
        }
        if (Array.isArray(srcFig.epithets.owned)) {
          for (const rec of srcFig.epithets.owned) {
            if (rec && !ep.owned.some(x => x.id === rec.id)) ep.owned.push(Object.assign({}, rec));
          }
        }
      }
      if (srcFig.titleTh && !ep.primaryTextTh) {
        ep.primaryTextTh = srcFig.titleTh;
      }
      // Update world crowns holder reference if srcFig held any crown
      if (W && W.world && W.world.uniqueCrowns) {
        for (const cid of Object.keys(W.world.uniqueCrowns)) {
          const cr = W.world.uniqueCrowns[cid];
          if (cr && (cr.holderId === srcFig.id || cr.holderId === fullNpc.id)) {
            cr.holderId = fullNpc.id;
            cr.holderIsExternal = false;
            cr.holderSectId = 'PLAYER_SECT';
            if (!ep.crownIds.includes(cid)) ep.crownIds.push(cid);
          }
        }
      }
    }
  };

  CULT.EPITHETS = EP;
  if (typeof g !== 'undefined') {
    g.EPITHETS = EP;
    if (g.SECT) g.SECT.EPITHETS = EP;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);


/* === LIFE_TRAITS_ENGINE_V260 === */

;(function installLifeTraitsEngineV260(g) {
  const CULT = g.CULT, HC = g.HC, JD = g.JD;
  if (!CULT || !CULT.EXPERIENCE_TRAITS) return;
  const ET = CULT.EXPERIENCE_TRAITS;

  // 1. Expand CULT.EXPERIENCE_TRAITS.CATALOG from 6 to 36 (6 Existing + 24 Group F + 6 Codex Life Traits)
  const mutableCatalog = Object.assign({}, ET.CATALOG);
  const reg = (JD && JD.LIFE_TRAITS_REGISTRY) || { GROUP_F: [], CODEX_EXP: [] };
  const allNewExp = [].concat(reg.GROUP_F || [], reg.CODEX_EXP || []);
  for (let i = 0; i < allNewExp.length; i++) {
    const sp = allNewExp[i];
    mutableCatalog[sp.id] = {
      id: sp.id,
      proposalNo: sp.proposalNo || sp.proposalId || null,
      nameTh: sp.nameTh,
      triggerEvent: sp.triggerEvent,
      threshold: sp.threshold || 2,
      prosTh: sp.prosTh,
      consTh: sp.consTh,
      recoveryPathTh: sp.recoveryPathTh,
      p: sp.p || {},
      f: sp.f || {},
      consF: sp.consF || {},
      cultRateMult: sp.cultRateMult || 1.04
    };
  }
  // Ensure existing 6 also have explicit consF for burden relief
  if (mutableCatalog.EXP_TRAIT_COMPANION_GUARDIAN) mutableCatalog.EXP_TRAIT_COMPANION_GUARDIAN.consF = { eva: -3 };
  if (mutableCatalog.EXP_TRAIT_TRIBULATION_SURVIVOR) mutableCatalog.EXP_TRAIT_TRIBULATION_SURVIVOR.consF = { move: -3 };
  if (mutableCatalog.EXP_TRAIT_SKEPTICAL_ARCHIVIST) {
    mutableCatalog.EXP_TRAIT_SKEPTICAL_ARCHIVIST.f = { acc: 14 };
    mutableCatalog.EXP_TRAIT_SKEPTICAL_ARCHIVIST.consF = { move: -5 };
  }
  if (mutableCatalog.EXP_TRAIT_BEAST_COVENANT_CARETAKER) mutableCatalog.EXP_TRAIT_BEAST_COVENANT_CARETAKER.consF = { cast: -3 };
  if (mutableCatalog.EXP_TRAIT_DEFEAT_VETERAN) {
    mutableCatalog.EXP_TRAIT_DEFEAT_VETERAN.f = { pen: 8 };
    mutableCatalog.EXP_TRAIT_DEFEAT_VETERAN.consF = { cast: -4 };
  }
  const statNames={atk:'โจมตี',matk:'โจมตีวิชา',def:'ป้องกัน',mdef:'ป้องกันวิชา',hp:'พลังชีวิต',acc:'แม่นยำ',eva:'หลบหลีก',pen:'เจาะเกราะ',crit:'คริติคอล',move:'ความเร็วเคลื่อนที่',cast:'ความเร็วร่าย'};
  const statText=(p,f)=>Object.entries(p||{}).map(([k,v])=>(statNames[k]||k)+' '+(v>=0?'+':'')+Math.round(v*100)+'%').concat(Object.entries(f||{}).map(([k,v])=>(statNames[k]||k)+' '+(v>=0?'+':'')+v)).join(', ');
  for(const spec of Object.values(mutableCatalog)) {
    spec.prosTh=statText(spec.p,spec.f)+(spec.cultRateMult&&spec.cultRateMult!==1?', อัตราบ่มเพาะ +'+Math.round((spec.cultRateMult-1)*100)+'%':'');
    if(spec.bodyblockBonusChance)spec.prosTh+=', โอกาสรับการโจมตีแทนสหาย +'+Math.round(spec.bodyblockBonusChance*100)+'%';
    spec.consTh=Object.keys(spec.consF||{}).length?statText({},spec.consF):'ไม่มีโทษค่าสถานะเพิ่มเติม';
    if(spec.bodyblockBonusChance)spec.consTh+=', รับความเสียหายแทนเพิ่ม 10% ระหว่างมีภาระ';
    if(spec.consF&&Object.keys(spec.consF).length&&!spec.recoveryPathTh.includes('เจ็ดวัน'))spec.recoveryPathTh+=' หรือพักฟื้นอย่างปลอดภัยติดต่อกันเจ็ดวัน';
  }
  ET.CATALOG = Object.freeze(mutableCatalog);
  ET.MAX_PROCESSED_KEYS = 512;

  ET.ensureState = function(npc) {
    if (!npc || typeof npc !== 'object') return null;
    if (!Array.isArray(npc.experienceTraits)) npc.experienceTraits = [];
    if (!npc.experienceEventLog || typeof npc.experienceEventLog !== 'object') {
      npc.experienceEventLog = { counts: {}, processedKeys: {}, episodeWatermarks: {} };
    } else {
      if (!npc.experienceEventLog.counts || typeof npc.experienceEventLog.counts !== 'object') npc.experienceEventLog.counts = {};
      if (!npc.experienceEventLog.processedKeys || typeof npc.experienceEventLog.processedKeys !== 'object') npc.experienceEventLog.processedKeys = {};
      if (!npc.experienceEventLog.episodeWatermarks || typeof npc.experienceEventLog.episodeWatermarks !== 'object') npc.experienceEventLog.episodeWatermarks = {};
    }
    return { traits: npc.experienceTraits, log: npc.experienceEventLog };
  };

  ET.hasTrait = function(npc, traitId) {
    return !!(npc && Array.isArray(npc.experienceTraits) && npc.experienceTraits.some(t => t && t.active && t.id === traitId));
  };

  ET.hasBurden = function(npc, traitId) {
    return !!(npc && Array.isArray(npc.experienceTraits) && npc.experienceTraits.some(t => t && t.active && t.id === traitId && t.burdenActive !== false && !t.recovered));
  };

  ET.recordExperienceEvent = function(W, npc, eventKind, eventUniqueKey, opts) {
    if (!npc || npc.foe || npc.dead || !eventKind) return { ok: false, reason: 'invalid-npc' };
    opts = opts || {};
    const rawAmount = Number(opts.amount != null ? opts.amount : 1);
    if (!Number.isFinite(rawAmount) || rawAmount <= 0) return { ok: false, reason: 'invalid-amount' };
    const inc = Math.round(rawAmount);
    if (!inc) return { ok: false, reason: 'invalid-amount' };

    const st = ET.ensureState(npc);
    if (opts.channel && Number.isSafeInteger(opts.sequence)) {
      const watermarks = st.log.sequenceWatermarks || (st.log.sequenceWatermarks = {});
      if (watermarks[opts.channel] != null && opts.sequence <= watermarks[opts.channel]) return { ok: true, deduplicated: true, unlockedNow: [], traits: st.traits };
      watermarks[opts.channel] = opts.sequence;
    }
    const day = (W && W.day) || 1;
    const tick = (W && W.t) || 0;
    const uKey = eventUniqueKey == null ? null : String(eventKind) + ':' + String(eventUniqueKey);

    if (uKey && st.log.processedKeys[uKey]) {
      return { ok: true, deduplicated: true, count: st.log.counts[eventKind] || 0, unlockedNow: [], traits: st.traits };
    }
    if (uKey) {
        // Explicit external receipts are exact and persistent. Engine producers use
      // channel sequence watermarks instead, so normal gameplay storage stays bounded.
      st.log.processedKeys[uKey] = day;
    }

    st.log.counts[eventKind] = (st.log.counts[eventKind] || 0) + inc;
    const totalCount = st.log.counts[eventKind];
    const watermark = st.log.episodeWatermarks[eventKind] || 0;
    const effectiveEpisodeCount = totalCount - watermark;

    const unlockedNow = [];
    for (const spec of Object.values(ET.CATALOG)) {
      if (spec.triggerEvent !== eventKind) continue;
      const existing = st.traits.find(t => t && t.id === spec.id);
      if (!existing && effectiveEpisodeCount >= spec.threshold) {
        const hasDrawback = Boolean((spec.consF && Object.keys(spec.consF).length > 0) || (spec.consTh && !spec.consTh.includes('ไร้ปม')));
        const entry = {
          id: spec.id,
          nameTh: spec.nameTh,
          prosTh: spec.prosTh,
          consTh: spec.consTh,
          recoveryPathTh: spec.recoveryPathTh,
          grantedDay: day,
          acquiredAt: tick,
          sourceEvent: eventKind,
          evidenceKey: uKey || (eventKind + ':' + day),
          evidenceCount: totalCount,
          stage: 1,
          active: true,
          burdenActive: hasDrawback,
          recovered: !hasDrawback,
          recoveredDay: hasDrawback ? null : day,
          partnerId: opts.partnerId || npc.companionId || null
        };
        st.traits.push(entry);
        unlockedNow.push(entry);
      } else if (existing) {
        existing.evidenceCount = totalCount;
      }
    }

    if (unlockedNow.length) {
      npc._cultRateBase = null;
      if (typeof HC !== 'undefined' && HC.bump) HC.bump(npc);
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    }
    return { ok: true, count: totalCount, unlockedNow, traits: st.traits };
  };

  /* Resolve / heal psychological or physical burden while retaining learned wisdom! */
  ET.resolveTraitRecovery = function(W, npc, traitId, recoveryReasonTh) {
    if (!npc || !Array.isArray(npc.experienceTraits)) return { ok: false, reason: 'no-traits' };
    const st = ET.ensureState(npc);
    const entry = npc.experienceTraits.find(t => t && t.id === traitId);
    if (!entry) return { ok: false, reason: 'trait-not-found' };

    if (entry.recovered || entry.burdenActive === false) return { ok: true, alreadyRecovered: true, recoveredTrait: entry };
    const spec = ET.CATALOG[traitId];
    if (spec && spec.triggerEvent) {
      // Advance episode watermark so the old event count never re-triggers burden immediately
      st.log.episodeWatermarks[spec.triggerEvent] = st.log.counts[spec.triggerEvent] || 0;
    }

    entry.burdenActive = false;
    entry.recovered = true;
    entry.recoveredDay = (W && W.day) || 1;
    entry.stage = 2;
    entry.recoveryReasonTh = recoveryReasonTh || (spec && spec.recoveryPathTh) || 'คลายปมและตกผลึกเป็นภูมิปัญญาชีวิต';

    if (npc.h && npc.h.state) {
      npc.h.state.heartDemon = Math.max(0, (npc.h.state.heartDemon || 0) - 10);
      npc.h.state.stress = Math.max(0, (npc.h.state.stress || 0) - 8);
    }
    // Also grant/progress EXP_TRAIT_RESILIENT_COMEBACK when overcoming a past burden
    if (traitId !== 'EXP_TRAIT_RESILIENT_COMEBACK') {
      ET.emit(W, npc, 'OVERCOME_PAST_FAILURE');
    }
    npc._cultRateBase = null;
    if (typeof HC !== 'undefined' && HC.bump) HC.bump(npc);
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return {
      ok: true,
      recoveredTrait: entry,
      burdenCleared: true,
      wisdomRetained: true,
      remainingTraits: npc.experienceTraits.length
    };
  };

  ET.getCultivationMult = function(npc) {
    if (!npc || !Array.isArray(npc.experienceTraits) || !npc.experienceTraits.length) return 1.0;
    let mult = 1.0;
    for (let i = 0; i < npc.experienceTraits.length; i++) {
      const tr = npc.experienceTraits[i];
      if (!tr || !tr.active) continue;
      const spec = ET.CATALOG[tr.id];
      if (spec && spec.cultRateMult) mult *= spec.cultRateMult;
    }
    return +Math.min(1.35, mult).toFixed(3);
  };

  ET.getStatBonuses = function(npc, W) {
    if (!npc || !Array.isArray(npc.experienceTraits) || !npc.experienceTraits.length) return { active: false, p: {}, f: {} };
    const wRef = W || (g.SECT && g.SECT.PEAKS && g.SECT.PEAKS._activeWorld) || g.W || (g.G && g.G.W) || null;
    const p = {}, f = {};
    const hpf = (npc._hpf != null) ? npc._hpf : ((npc.h && npc.h.state && npc.h.state.hp != null && g.CULT && g.CULT.hpMax) ? (npc.h.state.hp / Math.max(1, g.CULT.hpMax(npc))) : 1);
    const cal = (wRef && g.SIM && g.SIM.calendar) ? g.SIM.calendar(wRef.t || 0) : null;
    const hour = cal ? cal.hour : 12;
    const isNight = hour < 6 || hour >= 19;
    const isNoon = hour >= 11 && hour <= 14;

    for (let i = 0; i < npc.experienceTraits.length; i++) {
      const tr = npc.experienceTraits[i];
      if (!tr || !tr.active) continue;
      const spec = ET.CATALOG[tr.id];
      if (!spec) continue;

      // Context check for DUET_SOUL_SYNC: if partner died or exiled, do not apply duet bonus
      if (tr.id === 'EXP_TRAIT_DUET_SOUL_SYNC') {
        const pid = tr.partnerId || npc.companionId;
        const part = pid && wRef && wRef.byId && wRef.byId[pid];
        if (!part || part.dead || part.exiled) continue;
      }

      for (const [k, v] of Object.entries(spec.p || {})) p[k] = (p[k] || 0) + v;
      for (const [k, v] of Object.entries(spec.f || {})) f[k] = (f[k] || 0) + v;

      // Situational bonus adjustments
      if (tr.id === 'EXP_TRAIT_DEFEAT_VETERAN' && hpf < 0.35) {
        p.def = (p.def || 0) + 0.10;
      }
      if (tr.id === 'EXP_TRAIT_NIGHT_WATCH_SENTINEL') {
        if (!isNight) f.acc = (f.acc || 0) - 6; // full +10 at night, +4 by day
      }

      // Apply drawback ONLY while burdenActive is true and not yet recovered!
      if (tr.burdenActive !== false && !tr.recovered && spec.consF) {
        for (const [ck, cv] of Object.entries(spec.consF)) {
          if (tr.id === 'EXP_TRAIT_NIGHT_WATCH_SENTINEL' && ck === 'acc' && !isNoon) continue;
          f[ck] = (f[ck] || 0) + cv;
        }
      }
    }

    // Enforce global Experience Trait stat caps so stacking never overflows
    const capsP = { atk: 0.22, matk: 0.22, def: 0.24, mdef: 0.24, hp: 0.20, eva: 0.18, acc: 0.18 };
    for (const k of Object.keys(p)) {
      if (capsP[k] != null) p[k] = +Math.min(capsP[k], Math.max(-0.15, p[k])).toFixed(3);
      else p[k] = +p[k].toFixed(3);
    }
    const capsF = { acc: 20, eva: 18, crit: 12, pen: 16, cast: 14, move: 10 };
    for (const k of Object.keys(f)) {
      if (capsF[k] != null) f[k] = Math.min(capsF[k], Math.max(-12, Math.round(f[k])));
    }

    return { active: Object.keys(p).length > 0 || Object.keys(f).length > 0, p, f };
  };

  /* Strict Birth-Pool Guard: newly generated NPCs never start with ACQUIRED / birthEligible:false traits */
  ET.stripBirthIneligibleTraits = function(npc) {
    if (!npc) return;
    const curatedById = {};
    if (JD && JD.CORE && JD.CORE.curatedTraits) {
      if (Array.isArray(JD.CORE.curatedTraits)) {
        for (const ct of JD.CORE.curatedTraits) {
          if (ct && ct.id) curatedById[ct.id] = ct;
        }
      } else if (typeof JD.CORE.curatedTraits === 'object') {
        Object.assign(curatedById, JD.CORE.curatedTraits);
      }
    }
    const filterList = (arr) => arr.filter(tid => {
      const id = typeof tid === 'string' ? tid : (tid && tid.id);
      if (!id) return false;
      if (String(id).startsWith('TR_AC_') || String(id).startsWith('EXP_TRAIT_')) return false;
      const def = curatedById[id];
      if (def && (def.birthEligible === false || def.category === 'ACQUIRED')) return false;
      return true;
    });
    if (npc.h && Array.isArray(npc.h.traits)) npc.h.traits = filterList(npc.h.traits);
    if (g.STATS) g.STATS.dirty(npc);
    if (Array.isArray(npc.curatedTraits)) npc.curatedTraits = filterList(npc.curatedTraits);
    if (npc.cult && Array.isArray(npc.cult.traits)) npc.cult.traits = filterList(npc.cult.traits);
    if (Array.isArray(npc.experienceTraits)) npc.experienceTraits.length = 0;
  };

  /* Autonomous Activity & Recovery Hooks for Experience Traits */
  ET.onActivityComplete = function(W, npc, actId, ctx) {
    if (!W || !npc || npc.dead || npc.foe) return;
    const day = W.day || 1;
    const tick = W.t || 0;
    const st = ET.ensureState(npc);

    if (actId === 'mine') {
      ET.recordExperienceEvent(W, npc, 'MINE_SHIFT_COMPLETED', 'mine_' + npc.id + '_' + tick);
    } else if (actId === 'fish') {
      ET.recordExperienceEvent(W, npc, 'RIVER_FISHING_MEDITATION', 'fish_' + npc.id + '_' + tick);
      if (ET.hasBurden(npc, 'EXP_TRAIT_HEARTBROKEN_ASCETIC')) {
        ET.resolveTraitRecovery(W, npc, 'EXP_TRAIT_HEARTBROKEN_ASCETIC', 'จิตสงบนิ่งจากการตกปลาริมธารน้ำปราณ');
      }
    } else if (actId === 'patrol' || actId === 'guard' || (actId === 'work' && ctx && ctx.kind === 'guard')) {
      const cal = g.SIM && g.SIM.calendar ? g.SIM.calendar(W.t) : { hour: 12 };
      if (cal.hour < 6 || cal.hour >= 19) {
        ET.emit(W, npc, 'NIGHT_GUARD_SHIFT_DONE');
      } else if (ET.hasBurden(npc, 'EXP_TRAIT_NIGHT_WATCH_SENTINEL')) {
        ET.resolveTraitRecovery(W, npc, 'EXP_TRAIT_NIGHT_WATCH_SENTINEL', 'ผลัดเวรพักผ่อนและลาดตระเวนรับแสงตะวันยามเช้า');
      }
    } else if (actId === 'explore') {
      const bkey = (ctx && ctx.st && ctx.st.bkey) || (ctx && ctx.bkey) || '';
      if (bkey === 'stele' || bkey === 'ruin') {
        ET.recordExperienceEvent(W, npc, 'ANCIENT_STELE_DECIPHERED', 'stele_' + npc.id + '_' + tick);
      } else if (bkey === 'spring') {
        if (ET.hasBurden(npc, 'EXP_TRAIT_POISON_TEST_SUBJECT')) {
          ET.resolveTraitRecovery(W, npc, 'EXP_TRAIT_POISON_TEST_SUBJECT', 'แช่น้ำพุปราณลับชะล้างพิษตกค้างในเส้นลมปราณ');
        }
        if (ET.hasBurden(npc, 'EXP_TRAIT_TRIBULATION_SURVIVOR')) {
          ET.resolveTraitRecovery(W, npc, 'EXP_TRAIT_TRIBULATION_SURVIVOR', 'แช่น้ำพุปราณลับสมานรอยแผลสายฟ้า');
        }
        if (ET.hasBurden(npc, 'EXP_TRAIT_FORGE_BURN_CALLUS')) {
          ET.resolveTraitRecovery(W, npc, 'EXP_TRAIT_FORGE_BURN_CALLUS', 'แช่น้ำพุปราณลับฟื้นฟูความยืดหยุ่นของฝ่ามือ');
        }
      }
    } else if (actId === 'leisure' || actId === 'pair') {
      if (ET.hasBurden(npc, 'EXP_TRAIT_GATE_WALL_VETERAN')) {
        ET.resolveTraitRecovery(W, npc, 'EXP_TRAIT_GATE_WALL_VETERAN', 'ผ่อนคลายความตึงเครียดด้วยการจิบชาสนทนากับสหาย');
      }
      if (ET.hasBurden(npc, 'EXP_TRAIT_SIEGE_ENGINEER_BREAKER')) {
        ET.resolveTraitRecovery(W, npc, 'EXP_TRAIT_SIEGE_ENGINEER_BREAKER', 'ร่วมวงสนทนาในศาลาชาจนคลายความระแวงศึก');
      }
      if (ET.hasBurden(npc, 'EXP_TRAIT_ANCIENT_CIPHER_OBSESSED')) {
        ET.resolveTraitRecovery(W, npc, 'EXP_TRAIT_ANCIENT_CIPHER_OBSESSED', 'พักสายตาจากอักขระโบราณมาสังสรรค์กับสหาย');
      }
    } else if (actId === 'eat') {
      if (ET.hasBurden(npc, 'EXP_TRAIT_STARVATION_MEMORY') && W.sect && (W.sect.stock.meal || 0) >= 25) {
        ET.resolveTraitRecovery(W, npc, 'EXP_TRAIT_STARVATION_MEMORY', 'อิ่มท้องในโรงอาหารที่มีเสบียงอุดมสมบูรณ์');
      }
    } else if (actId === 'wildHunt') {
      if (npc.h && npc.h.state && npc.h.state.satiety >= 50 && npc.h.state.energy >= 45) {
        ET.recordExperienceEvent(W, npc, 'PREPARED_WILD_HUNT_SUCCESS', 'prephunt_' + npc.id + '_' + day);
      }
      ET.recordExperienceEvent(W, npc, 'SAFE_RETURN_FROM_DEEP_WILD', 'retwild_' + npc.id + '_' + day);
    }


  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

/* Life-experience integration: authoritative outcomes, not notification text. */
;(function(g) {
  'use strict';
  const ET = g.CULT.EXPERIENCE_TRAITS, HC = g.HC;
  const life = n => { const l=n.lifeExperience||(n.lifeExperience={});l.activityDays=l.activityDays||{};l.recovery=l.recovery||{};l.counters=l.counters||{};return l; };
  const bump = n => { HC.bump(n); n._cultRateBase = null; if (g.STATS) g.STATS.dirty(n); };
  ET.contextKey = (n, W) => {
    const traits = n.experienceTraits || [], ids = n.combatHistory && n.combatHistory.activeMasteryIds;
    if (!traits.length && !(ids && ids.length)) return '';
    const h = W ? Math.floor((W.t % 1440) / 60) : 12;
    const duet=traits.find(t=>t.id==='EXP_TRAIT_DUET_SOUL_SYNC');
    const partnerId=duet&&duet.partnerId||n.companionId;
    const partner = partnerId && W && W.byId[partnerId];
    return (ids || []).join(',') + ':' + (h < 6 || h >= 19 ? 'night' : h >= 11 && h <= 14 ? 'noon' : 'day') + ':' + (n._hpf < 0.35 ? 'low' : 'normal') + ':' + (!!partner && !partner.dead && !partner.exiled);
  };
  // At most one evidence unit of a given kind per actor/work-step. A large AoE
  // therefore cannot replace a career of actual practice. Watermarks survive saves.
  ET.emit = (W, n, kind, opts) => {
    if (!W || !n || n.dead || n.foe || !kind) return { ok: false };
    const seq = W.t * 3 + (W.timePhase || 0);
    return ET.recordExperienceEvent(W, n, kind, null, Object.assign({}, opts, { channel: kind, sequence: seq }));
  };
  ET.grantAcquired = (W, n, id, evidence) => {
    if (!n || !W || n.dead || !HC.traitDef(id)) return false;
    if ((n.h.traits || []).some(t => t.id === id)) return false;
    const def = HC.traitDef(id);
    if ((def.conflictsWith || []).some(id2 => (n.h.traits || []).some(t => t.id === id2))) return false;
    const got = HC.addTrait(n, W.rng, id);
    if (!got) return false;
    life(n).acquired = life(n).acquired || {};
    life(n).acquired[id] = { t: W.t, day: W.day, evidence };
    bump(n);
    if (W.log) W.log('cultivation', HC.fullName(n) + ' สั่งสมประสบการณ์จนเกิดคุณลักษณะ「' + def.nameTh + '」', [n.id]);
    return true;
  };
  ET.recover = (W, n, id, reason) => ET.hasBurden(n, id) ? ET.resolveTraitRecovery(W,n,id,reason) : null;
  ET.onBreakthrough = (W,n,res) => {
    if (!res) return;
    const l=life(n);
    if (!res.ok && !res.died) { ET.emit(W,n,'BOTTLENECK_FAILURE_ENDURED'); l.failedStage=res.stageFrom; }
    if (res.ok) {
      ET.recover(W,n,'EXP_TRAIT_BOTTLENECK_WALL_GRIT','เตรียมตัวจนทะลวงคอขวดเดิมได้จริง');
      if (l.failedStage === res.stageFrom) ET.emit(W,n,'OVERCOME_PAST_FAILURE');
      if (g.CULT.equivalentStage(n)>=7) ET.grantAcquired(W,n,'TR_AC_VEIL_TRUTH_AWAKENED','breakthrough:'+res.stageFrom);
      if ((n.h.traits||[]).some(t=>t.id==='TR_AC_FROSTBITTEN_MERIDIAN_SCAR')) {n.h.traits=n.h.traits.filter(t=>t.id!=='TR_AC_FROSTBITTEN_MERIDIAN_SCAR');ET.grantAcquired(W,n,'TR_AC_REFINED_ICE_JADE_VESSEL','ice-scar-breakthrough');bump(n);}
    }
  };
  ET.onCraftOutcome = (W,n,r,res,ctx) => {
    if(typeof r==='string')r=g.ECO.recipeById[r];
    if (!n || !r || !res) return;
    const l=life(n), forge=r.craft==='FORGING' || r.outType==='EQUIPMENT' || r.station==='forge';
    if (!res.ok) {
      // Failed recipes are not explosions. The adapted trait describes cautious
      // craftsmanship; actual injury is recorded only by the injury system.
      if (res.reason==='failed' || res.failed || res.success===false) {
        l.craftFailures=(l.craftFailures||0)+1; l.safeCraftStreak=0;
        if (!forge) ET.emit(W,n,'CAULDRON_ACCIDENT_SURVIVED');
      }
      return;
    }
    l.safeCraftStreak=(l.safeCraftStreak||0)+1;
    if (forge) ET.emit(W,n,'FORGE_CRAFT_COMPLETED');
    if (l.safeCraftStreak>=3) ET.recover(W,n,'EXP_TRAIT_CAULDRON_BLAST_SCAR','สำเร็จงานปรุงยาหลายครั้งอย่างปลอดภัย');
    if (l.craftFailures>=3 && (n.h.skills[r.craft]||0)>=65) ET.grantAcquired(W,n,'TR_AC_CAULDRON_ASH_VETERAN','craft-failures-and-recovery');
    const inputIds=JSON.stringify(r.inputs||r.mats||r.in||r.materials||{});
    if(forge && /STAR|METEOR/.test(inputIds)) ET.grantAcquired(W,n,'TR_AC_STAR_METEOR_MARROW','paid-meteor-recipe:'+r.id);
    if(!forge && (n.h.affinities.FIRE||0)>=70 && g.CULT.equivalentStage(n)>=3 && l.safeCraftStreak>=12) ET.grantAcquired(W,n,'TR_AC_EARTH_FLAME_SWALLOWER','experienced-fire-craft');
  };
  ET.onDeath = (W,v,opts) => {
    if(!W||!v)return;
    const l=v.lifeExperience;
    const healer=l&&l.lastHealerId&&W.byId[l.lastHealerId];
    if(healer && !healer.dead && W.t-(l.lastHealedAt||0)<360) ET.emit(W,healer,'HEALER_WITNESSED_LOSS');
    for(const n of W.npcs) {
      if(n.dead||n.id===v.id)continue;
      if(n.companionId===v.id)ET.emit(W,n,'RELATIONSHIP_HEARTBREAK');
      if(v.mentorId===n.id || v.mentor===n.id || (n.apprenticeIds||[]).includes(v.id)) ET.emit(W,n,'APPRENTICE_FALLEN');
    }
  };
  ET.onHealed = (W, healer, patient, actual, beforeRatio) => {
    if(!healer||healer.foe||!patient||actual<=0)return;
    life(patient).lastHealerId=healer.id; life(patient).lastHealedAt=W.t;
    if(beforeRatio<0.25 && healer.id!==patient.id) {
      ET.emit(W,healer,'ALLY_SAVED_IN_CRISIS');
      if(g.COMBAT)g.COMBAT.ACTION_MASTERY_TRAITS.recordAction(W,healer,'clutchHealCount',1);
    }
    if(beforeRatio<0.9 && healer.id!==patient.id) {
      const l=life(healer), seen=l.recovery.patients||(l.recovery.patients={});
      if(seen[patient.id]===W.day)return;seen[patient.id]=W.day;
      l.patientsHelped=(l.patientsHelped||0)+1;
      if(l.patientsHelped>=20 && HC.eff(healer,'personality.empathy')>=65)ET.grantAcquired(W,healer,'TR_AC_MERCIFUL_SAINT_AURA','actual-healing');
      if(l.patientsHelped>=10)ET.recover(W,healer,'EXP_TRAIT_MERCIFUL_DOCTOR_BURDEN','รักษาผู้ป่วยที่บาดเจ็บได้จริงอย่างต่อเนื่อง');
    }
  };
  ET.onExpeditionReturn = (W,ex,party) => {
    if(!ex || ex.lifeSettled)return; ex.lifeSettled=true;
    const lost=(ex.party||ex.members||[]).some(id=>W.byId[id]&&W.byId[id].dead);
    for(const n of party||[]) {
      if(!n||n.dead)continue;
      if(lost)ET.emit(W,n,'PARTY_CASUALTY_SURVIVED');
      else {
        ET.recover(W,n,'EXP_TRAIT_SOLE_PARTY_SURVIVOR','เดินทางร่วมกับสหายแล้วกลับมาอย่างปลอดภัย');
        ET.emit(W,n,'SAFE_RETURN_FROM_DEEP_WILD');
      }
      if(ex.kind==='trade')ET.emit(W,n,'MARKET_DEAL_COMPLETED');
      if(ex.kind==='diplomacy' && ((ex.danger||0)>=2 || (ex.lifeHostileRelation!=null&&ex.lifeHostileRelation<=-40)))ET.emit(W,n,'HAZARDOUS_ENVOY_RETURNED');
    }
  };
  // daily observation is bounded per actor; events use actual episode transitions
  // or completed work, never an assumed narrative from a threshold alone.
  ET.evaluateDaily = (W,n) => {
    if(!n||n.dead||!n.h)return;
    const l=life(n), st=n.h.state;
    if(l.pendingHunt && !n.travel && !n.away && !g.MAP.isOutsideWall(W.map,n.x,n.y)){
      ET.emit(W,n,'SAFE_RETURN_FROM_DEEP_WILD');if(l.pendingHunt.prepared)ET.emit(W,n,'PREPARED_WILD_HUNT_SUCCESS');delete l.pendingHunt;
    }
    if(l.lastObservedDay===W.day)return;l.lastObservedDay=W.day;
    if(st.satiety<10) { l.hungryDays=(l.hungryDays||0)+1; if(l.hungryDays>=2)l.famineEpisode=true; }
    else if(st.satiety>=45 && l.famineEpisode) { ET.emit(W,n,'FAMINE_SURVIVED');
      if(l.activityDays[W.day-1]&&l.activityDays[W.day-1].eat)ET.grantAcquired(W,n,'TR_AC_FAMINE_SAVIOR_GRACE','recovered-through-sect-food');
      l.famineEpisode=false;l.hungryDays=0; }
    else if(st.satiety>=45)l.hungryDays=0;
    const poisoned=(n.sx||[]).some(x=>/poison|venom|plague/i.test(x.k)) || (n.cult&&n.cult.toxic>=60);
    if(poisoned) {l.poisonEpisode=true;if(n.cult&&n.cult.toxic>=80)l.severePoison=true;}
    if(!poisoned && l.poisonEpisode) { ET.emit(W,n,'POISON_SURVIVED_AND_CURED');l.poisonEpisode=false;if(l.severePoison){ET.grantAcquired(W,n,'TR_AC_HUNDRED_VENOM_SURVIVOR','severe-poison-cured');l.severePoison=false;} }
    if(st.heartDemon>=75)l.severeHeartDemon=true;
    if(l.severeHeartDemon && st.heartDemon<=25){ET.grantAcquired(W,n,'TR_AC_SOUL_SEIZURE_OVERCOME','heart-demon-recovery');l.severeHeartDemon=false;}
    if((n.inj||[]).some(x=>x.id==='MERIDIAN_OVERDRIVE_BACKLASH'))l.meridianBacklash=true;
    if(l.meridianBacklash && !(n.inj||[]).some(x=>x.id==='MERIDIAN_OVERDRIVE_BACKLASH') && st.hp>=g.CULT.hpMax(n)*0.95){ET.grantAcquired(W,n,'TR_AC_BROKEN_DANTIAN_REFORGED','overdrive-recovered');l.meridianBacklash=false;}
    const days=l.activityDays[W.day-1];
    if(days && days.eat && days.sleep && (days.cultivate||days.practice||days.mine||days.craft) && (days.pair||days.leisure) && st.satiety>=45 && st.rest>=45) ET.emit(W,n,'BALANCED_DAILY_RHYTHM');
    for(const day of Object.keys(l.activityDays))if(Number(day)<W.day-2)delete l.activityDays[day];
    if(n._origFigureId && n._recruitedFromSectTh && (n.merit||0)>=300 && HC.eff(n,'personality.loyalty')>=75)ET.emit(W,n,'REFORMED_LOYAL_SERVICE');
    const injured=(n.inj||[]).some(i=>i.sev>=2);
    if(!injured && !poisoned && (!n.cult || n.cult.toxic<15) && st.rest>=60 && st.stress<30) {
      l.stableDays=(l.stableDays||0)+1;
      if(l.stableDays>=7) {
        for(const tr of (n.experienceTraits||[]))if(tr.burdenActive && !tr.recovered)ET.recover(W,n,tr.id,'พักฟื้นและใช้ชีวิตอย่างมั่นคงติดต่อกันเจ็ดวัน');
        const before=n.h.traits.length;n.h.traits=n.h.traits.filter(t=>t.id!=='TR_AC_TOMB_CURSE_BRANDED');if(before!==n.h.traits.length)bump(n);
      }
    } else l.stableDays=0;
  };
  ET.activityBias = (W,n,id,S) => {
    if(!n.experienceTraits||!n.experienceTraits.length)return;
    // Small preferences remain subordinate to food, health, obligations and danger.
    let v=0;
    if(id==='leisure'||id==='pair'||id==='heal')v+=(n.experienceTraits.some(t=>t.burdenActive&&!t.recovered)?0.16:0);
    if(ET.hasBurden(n,'EXP_TRAIT_STARVATION_MEMORY') && (id==='farm'||id==='cook'))v+=0.12;
    if(ET.hasBurden(n,'EXP_TRAIT_HEARTBROKEN_ASCETIC') && id==='cultivate')v+=0.12;
    if(ET.hasBurden(n,'EXP_TRAIT_GATE_WALL_VETERAN') && id==='wildHunt')v-=0.15;
    if(v)S.add('บทเรียนและภาระจากประสบการณ์ชีวิต',v);
  };
  const complete=ET.onActivityComplete;
  ET.onActivityComplete = (W,n,id,ctx) => {
    if(!n||n.dead)return;
    const l=life(n),day=W.day;
    (l.activityDays[day]||(l.activityDays[day]={}))[id]=true;
    // These require a paid/successful outcome, handled at its authoritative source.
    if(!['mine','fish','explore','wildHunt'].includes(id))complete(W,n,id,ctx);
    if(id==='guard'||id==='patrol') {
      const hour=g.SIM.calendar(W.t).hour;
      if(hour<6||hour>=19)ET.emit(W,n,'NIGHT_GUARD_SHIFT_DONE');
    }
    if((id==='cultivate'||id==='pray') && l.silenceExperienced){ET.grantAcquired(W,n,'TR_AC_SHATTERED_VOICE_SILENT_CHANT','practice-after-silence');l.silenceExperienced=false;}
    if(id==='heal' && n.h.state.hp>=g.CULT.hpMax(n)*0.95) {
      if(l.nearDeathPending){ l.nearDeathRecoveries=(l.nearDeathRecoveries||0)+1;l.nearDeathPending=false;if(l.nearDeathRecoveries>=2)ET.grantAcquired(W,n,'TR_AC_GHOST_GATE_RETURNEE','near-death-treated'); }
    }
    if(id==='pair' && ctx && (ctx.mode==='romance'||ctx.type==='romance') && (ctx.rejected||ctx.success===false)) ET.emit(W,n,'RELATIONSHIP_HEARTBREAK');
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
;(function(g) {
  'use strict';
  const ET=g.CULT.EXPERIENCE_TRAITS, HC=g.HC;
  ET.installSystemHooks = () => {
    if(ET.systemHooksInstalled)return;ET.systemHooksInstalled=true;
    const wrap=(obj,key,after,before)=>{
      if(!obj||typeof obj[key]!=='function')return;
      const fn=obj[key];obj[key]=function(...args){const prior=before?before(...args):null;const result=fn.apply(this,args);after(result,args,prior);return result;};
    };
    wrap(g.CULT,'breakthrough',(r,[W,n])=>ET.onBreakthrough(W,n,r));
    wrap(g.ECO,'finishCraft',(r,[W,n,recipe,ctx],prior)=>{if(!prior)ET.onCraftOutcome(W,n,recipe,r,ctx);},(W,n,r,ctx)=>!!(ctx&&ctx.lifeCraftSettled));
    // finishCraft already has a settled reservation guard. Do not award a repeat
    // invocation of a finished reservation, even when the old API returns its receipt.
    const originalCraft=g.ECO.finishCraft;
    g.ECO.finishCraft=(W,n,r,ctx)=>{if(ctx&&ctx.lifeCraftSettled)return originalCraft(W,n,r,ctx);const result=originalCraft(W,n,r,ctx);if(ctx&&!result?.rejected)ctx.lifeCraftSettled=true;return result;};
    wrap(g.ECO,'personalCraft',(r,[W,n,recipe])=>ET.onCraftOutcome(W,n,recipe,r));
    wrap(g.ECO,'mineYield',(r,[W,n])=>{if(r&&r.out&&r.out.length)ET.emit(W,n,'MINE_SHIFT_COMPLETED');});
    wrap(g.AI,'kill',(r,[W,n,why,opts],wasDead)=>{if(!wasDead&&n.dead)ET.onDeath(W,n,opts);},(W,n)=>!!n.dead);
    wrap(g.AI,'pairEnd',(r,[W,a,b,d])=>{
      if(d && d.type==='date' && d.rejected) {ET.emit(W,a,'RELATIONSHIP_HEARTBREAK');ET.emit(W,b,'RELATIONSHIP_HEARTBREAK');}
      if(a&&b&&g.SECT.rel(a,b.id).a>=60){ET.recover(W,a,'EXP_TRAIT_HEARTBROKEN_ASCETIC','ฟื้นความเชื่อใจจากสายสัมพันธ์จริง');ET.recover(W,b,'EXP_TRAIT_HEARTBROKEN_ASCETIC','ฟื้นความเชื่อใจจากสายสัมพันธ์จริง');}
    });
    wrap(g.EXPLORE,'visit',(r,[W,n,spot],before)=>{
      const dex=W.sect.explore; // visit is authoritative even when it returns no value
      if(spot==='stele'||spot==='ruin') {
        ET.emit(W,n,'ANCIENT_STELE_DECIPHERED');
        const count=(n.experienceEventLog&&n.experienceEventLog.counts&&n.experienceEventLog.counts.ANCIENT_STELE_DECIPHERED)||0;
        if(count>=8)ET.grantAcquired(W,n,'TR_AC_REFLECTION_WALL_INHERITOR','studied-ancient-stele');
        if(count>=12 && (n.h.skills.SCRIPTURE||0)>=65)ET.grantAcquired(W,n,'TR_AC_ANCIENT_RING_MENTORED','advanced-ancient-stele-study');
        if(spot==='ruin' && (n.sx||[]).some(x=>x.k==='curse'))ET.grantAcquired(W,n,'TR_AC_TOMB_CURSE_BRANDED','actual-ruin-curse');
      }
      if(spot==='spring')for(const id of ['EXP_TRAIT_POISON_TEST_SUBJECT','EXP_TRAIT_TRIBULATION_SURVIVOR','EXP_TRAIT_FORGE_BURN_CALLUS'])ET.recover(W,n,id,'พักฟื้นในน้ำพุปราณ');
    });
    wrap(g.FISHING,'resolveSuccessfulCatch',(r,[W,n,z,opts])=>{if(r&&r.ok&&r.outcome==='FISH'&&!(opts&&opts.ignoreStock))ET.emit(W,n,'RIVER_FISHING_MEDITATION');});
    wrap(g.FISHING,'eatFishDish',(r,[W,n,id])=>{if(r&&r.ok){const dish=g.FISHING.DISH_BY_ID[id];if(dish&&(dish.tier||0)>=5)ET.grantAcquired(W,n,'TR_AC_DRAGON_CARP_ESSENCE','consumed-high-tier-fish-dish:'+id);}});
    wrap(g.EXPED,'resolve',(r,[W,ex,members],prior)=>{if(!prior && ex.done)ET.onExpeditionReturn(W,ex,members.filter(n=>!n.dead));},(W,ex)=>!!(ex.done||ex.settlement));
    wrap(g.EXPED,'tradeResult',(r,[W,ex,alive,out])=>{for(const n of alive)if(out.stones>0)ET.emit(W,n,'MARKET_DEAL_COMPLETED');});
    wrap(g.EXPED,'diplomacyResult',(r,[W,ex,alive],prior)=>{
      if(ex.lifeHostileRelation<=-40)for(const n of alive)ET.emit(W,n,'HAZARDOUS_ENVOY_RETURNED');
    },(W,ex)=>{const s=(W.world.sects||[]).find(s=>s.id===ex.targetSect);return s?s.rel:0;});
    wrap(g.SECT.GRAND_DAO_DEBATE,'holdDebate',(r,[W,opts])=>{
      if(!r||!r.ok||!r.victory||opts&&(opts.free||opts.forceWin))return;
      const n=W.byId[r.record.speakerId];if(!n)return;
      const l=n.lifeExperience||(n.lifeExperience={activityDays:{},recovery:{},counters:{}});l.discourseWins=(l.discourseWins||0)+1;
      if(l.discourseWins>=2 && (n.h.skills.SCRIPTURE||0)>=60)ET.grantAcquired(W,n,'TR_AC_MASTER_CHESS_ILLUMINATED','two-paid-dao-debate-wins');
    });
    wrap(g.SECT.BOUNTY_BOARD,'claimBountyHunt',(r,[W])=>{if(r&&r.ok&&r.hunterId){const n=W.byId[r.hunterId];ET.emit(W,n,'BOUNTY_OR_GRUDGE_RESOLVED');ET.recover(W,n,'EXP_TRAIT_BLOOD_DEBT_TRACKER','ปิดภารกิจค่าหัวด้วยผลงานจริง');}});
    wrap(g.SECT.PEAKS,'foundPeak',(r,[W],prior)=>{
      if(r&&r.ok&&!r.alreadyFounded&&r.peak)for(const id of new Set([r.peak.masterId,r.peak.deputyId,...(r.peak.memberIds||[])])){const n=W.byId[id];if(n)ET.emit(W,n,'PEAK_SANCTUARY_PIONEER');}
    });
    wrap(g.SECT.GRAND_ASSEMBLY_BANQUET,'hostSpiritCuisineBanquet',(r,[W])=>{
      if(r&&r.ok)for(const id of (r.banquet&&r.banquet.attendeeIds)||[])if(W.byId[id])ET.grantAcquired(W,W.byId[id],'TR_AC_PEACH_IMMORTAL_SIP','paid-spirit-banquet');
    });
    wrap(g.SECT.TRIBUNAL,'adjudicateCase',(r,[W])=>{if(r&&r.ok&&r.caseItem){const n=W.byId[r.caseItem.offenderId];if(n&&/PARDON|ACQUIT|INNOCENT/.test(r.verdict))ET.recover(W,n,'EXP_TRAIT_UNJUSTLY_PUNISHED','ได้รับการชำระข้อกล่าวหาจากหอวินัย');}});
    wrap(g.CULT.EPITHETS,'seedAccusationRumor',(r,[W,n])=>{if(r&&r.ok)ET.emit(W,n,'UNFAIR_DISCIPLINE_OR_RUMOR');});
    wrap(g.CULT.EPITHETS,'clearFalseAccusation',(r,[W,n])=>{if(r&&r.ok)ET.recover(W,n,'EXP_TRAIT_UNJUSTLY_PUNISHED','พิสูจน์ข้อกล่าวหาแล้ว');});
    wrap(g.CULT.EPITHETS,'recordDeed',(r,[W,n,key,amount,meta])=>{
      if(!r||!r.ok)return;
      if(key==='embezzle_exposed')ET.grantAcquired(W,n,'TR_AC_CORRUPT_GREED_TAINT','verified-embezzlement');
      if(key==='ancient_dao_legacy_awakened')ET.grantAcquired(W,n,'TR_AC_ANCIENT_RING_MENTORED','awakened-existing-legacy');
      if(key==='rescue_comrade')ET.emit(W,n,'ALLY_SAVED_IN_CRISIS');
      if(key==='heal_patient')ET.recover(W,n,'EXP_TRAIT_MERCIFUL_DOCTOR_BURDEN','ช่วยรักษาผู้อื่นด้วยผลงานจริง');
      if(key==='cauldron_explode')ET.emit(W,n,'CAULDRON_ACCIDENT_SURVIVED');
      if(n.epithets && n.epithets.redemptionDrive && !n.epithets.redemptionDrive.active && n.epithets.redemptionDrive.completedDay===W.day){
        ET.emit(W,n,'ATONED_MISTAKE_WITH_DEED');const before=n.h.traits.length;n.h.traits=n.h.traits.filter(t=>t.id!=='TR_AC_CORRUPT_GREED_TAINT');if(before!==n.h.traits.length){HC.bump(n);g.STATS.dirty(n);}
      }
    });
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
;(function(g) {
  const ET=g.CULT.EXPERIENCE_TRAITS;
  const install=ET.installSystemHooks;
  ET.installSystemHooks=()=>{
    if(ET.statusHookInstalled)return;
    install(); ET.statusHookInstalled=true;
    const ST=g.STATS, add=ST.addStatus;
    ST.addStatus=function(u,k,dur,extra,now){
      const prior=ST.statusOf(u,k), oldStacks=prior&&(prior.stacks||1), oldUntil=prior&&prior.until;
      const result=add.apply(this,arguments), after=ST.statusOf(u,k);
      const scope=g.COMBAT.lifeStatusContext;
      const W=scope&&scope.W;
      if(!after || (prior && after.until===oldUntil && (after.stacks||1)<=oldStacks))return result;
      if(W && u && !u.foe) {
        const l=u.lifeExperience||(u.lifeExperience={activityDays:{},recovery:{},counters:{}});
        if(/poison|venom|plague/i.test(k))l.poisonEpisode=true;
        if(k==='silence')l.silenceExperienced=true;
        if(k==='chill' && dur>=10)ET.grantAcquired(W,u,'TR_AC_FROSTBITTEN_MERIDIAN_SCAR','actual-chill');
      }
      if(scope && scope.f && scope.actor && u && u.id!==scope.actor.id) {
        const actor=extra&&extra.src&&W.byId[extra.src]||scope.actor;
        if(['poison','bleed','curse','armorbreak','mdefbreak','stun','root','silence','paralyze','disarm'].includes(k))g.COMBAT.noteMastery(W,scope.f,actor,'debuffsLanded',1,u);
        if(['stun','root','paralyze','disarm','tether'].includes(k))g.COMBAT.noteMastery(W,scope.f,actor,'hardCcLanded',1,u);
      }
      return result;
    };
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
;(function(g) {
  const ET=g.CULT.EXPERIENCE_TRAITS, HC=g.HC;
  const install=ET.installSystemHooks;
  ET.installSystemHooks=()=>{
    if(ET.finalHooksInstalled)return;install();ET.finalHooksInstalled=true;
    // Filter only the random birth pool, preserving core definitions and RNG API.
    const gen=HC.generate;
    HC.generate=function(...args){
      const original=g.JD.CORE.curatedTraits;
      const eligible=t=>t && t.birthEligible!==false && t.category!=='ACQUIRED';
      g.JD.CORE.curatedTraits=Array.isArray(original)?original.filter(eligible):Object.fromEntries(Object.entries(original).filter(([,v])=>eligible(v)));
      try{return gen.apply(this,args);}finally{g.JD.CORE.curatedTraits=original;}
    };
    const insight=g.AI.insight;
    g.AI.insight=(W,n)=>{
      const before=n.cult&&n.cult.prog, result=insight(W,n);
      const nearWater=(n.x>=g.MAP.RIVER_BELT.x0 && n.x<=g.MAP.RIVER_BELT.x1 && Math.abs(n.y-g.MAP.riverCenterY(n.x))<=g.MAP.riverHalfWidth(n.x)+4) || (W.map.buildings||[]).some(b=>['spring','spirit_pond'].includes(b.key||b.type||b.id) && Math.hypot(n.x-(b.x+b.w/2),n.y-(b.y+b.h/2))<=Math.max(b.w,b.h)/2+3);
      if(n.cult&&n.cult.prog>before && nearWater && W.weather && ['rain','storm'].includes(W.weather.kind) && HC.eff(n,'affinities.SWORD')>=60) ET.grantAcquired(W,n,'TR_AC_WATERFALL_SWORD_EPIPHANY','rain-river-insight');
      return result;
    };
    const injure=g.AI.injure;
    g.AI.injure=(W,n,sev,why)=>{
      const before=(n.inj||[]).length, result=injure(W,n,sev,why);
      const wound=(n.inj||[]).at(-1);
      if(wound && (n.inj||[]).length>before && sev>=3 && ['แขน','ไหล่'].includes(wound.part) && HC.eff(n,'affinities.BLADE')>=50) ET.grantAcquired(W,n,'TR_AC_ONE_ARMED_BLADE_SOUL','actual-severe-arm-injury');
      return result;
    };
    const step=g.CULT.TRIBULATION.tick;
    g.CULT.TRIBULATION.tick=function(W,n){
      const st=n&&n.tribulationState;
      const before=st&&st.strikesLanded||0;
      const r=step.apply(this,arguments);
      const after=n&&n.tribulationState&&n.tribulationState.strikesLanded||0;
      if(after>before && !n.dead)g.COMBAT.ACTION_MASTERY_TRAITS.recordAction(W,n,'tribulationBoltsSurvived',after-before);
      return r;
    };
    const micro=g.EXPLORE.dispatchExploration;
    g.EXPLORE.dispatchExploration=function(W,...args){
      const r=micro.call(this,W,...args);
      if(r&&r.ok)for(const id of r.partyIds||[]) {
        const n=W.byId[id];if(!n||n.dead)continue;
        const l=n.lifeExperience||(n.lifeExperience={activityDays:{},recovery:{},counters:{}});
        const ids=l.microExploredIds||(l.microExploredIds={});ids[r.locationId]=true;
        if(Object.keys(ids).length>=3)ET.grantAcquired(W,n,'TR_AC_RIFT_GRAVITY_ADAPTED','three-real-micro-locations');
      }
      return r;
    };
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

/* === CARBON_COMPENDIA_CULTIVATION_RUNTIME_V260 === */
(function initCarbonCultivationHooks(g) {
  const CULT = g.CULT, JD = g.JD, HC = g.HC, U = g.U;
  if (!CULT || !JD) return;

  // 1. Ensure all extraMantras & expansionNonCombatArts are indexed and enriched across the 5 Non-Combat Pillars
  const extraM = JD.TECH.extraMantras || [];
  const extraNC = JD.TECH.expansionNonCombatArts || [];
  CULT.allMantras = () => (JD.TECH.mantras || []).concat(extraM);
  CULT.allTechniques = () => (JD.TECH.techniques || []).concat(extraNC);

  // Enrich Qinggong, Defensive, Support, Forbidden, Mantra, and Passive Constellation metadata on expansionNonCombatArts & extraMantras
  const qgMod = CULT.QINGGONG_SYSTEM || CULT.QINGGONG;
  if (qgMod && typeof qgMod.mapTechToQinggongMode === 'function') {
    extraNC.forEach(t => {
      if (!t || (t.cat !== 'LIGHTNESS_ART' && t.cat !== 'MOVEMENT_TECHNIQUE')) return;
      const mId = t.qinggongMode || qgMod.mapTechToQinggongMode(t);
      if (mId && qgMod.MODES && qgMod.MODES[mId]) {
        t.qinggongMode = mId;
        t.qinggongSpec = qgMod.MODES[mId];
      }
    });
  }
  const defMod = CULT.DEFENSIVE_SYSTEM || CULT.DEFENSIVE_ARTS;
  if (defMod && typeof defMod.classifyDefensiveTech === 'function') {
    extraNC.forEach(t => {
      if (!t || t.cat !== 'DEFENSIVE_TECHNIQUE') return;
      const aId = t.defensiveArchetype || defMod.classifyDefensiveTech(t);
      if (aId && defMod.ARCHETYPES && defMod.ARCHETYPES[aId]) {
        t.defensiveArchetype = aId;
        t.defensiveSpec = defMod.ARCHETYPES[aId];
      }
    });
  }
  const supMod = CULT.SUPPORT_SYSTEM || CULT.SUPPORT_ARTS;
  if (supMod && typeof supMod.classifySupportTech === 'function') {
    extraNC.forEach(t => {
      if (!t || (t.cat !== 'SUPPORT_TECHNIQUE' && t.cat !== 'AUXILIARY_ART')) return;
      const aId = t.supportArchetype || supMod.classifySupportTech(t);
      if (aId && supMod.ARCHETYPES && supMod.ARCHETYPES[aId]) {
        t.supportArchetype = aId;
        t.supportSpec = supMod.ARCHETYPES[aId];
      }
    });
  }
  const frbMod = CULT.FORBIDDEN_SYSTEM || CULT.FORBIDDEN_ARTS;
  if (frbMod && typeof frbMod.classifyForbiddenTech === 'function') {
    extraNC.forEach(t => {
      if (!t || (t.cat !== 'FORBIDDEN_ART' && t.cat !== 'FORBIDDEN_TECHNIQUE')) return;
      const aId = t.forbiddenArchetype || frbMod.classifyForbiddenTech(t);
      if (aId && frbMod.ARCHETYPES && frbMod.ARCHETYPES[aId]) {
        t.forbiddenArchetype = aId;
        t.forbiddenSpec = frbMod.ARCHETYPES[aId];
      }
    });
  }
  if (CULT.MANTRA_SYSTEM && typeof CULT.MANTRA_SYSTEM.classifyMantra === 'function') {
    extraM.forEach(m => {
      if (!m) return;
      const aId = m.mantraArchetype || CULT.MANTRA_SYSTEM.classifyMantra(m);
      if (aId && CULT.MANTRA_SYSTEM.ARCHETYPES && CULT.MANTRA_SYSTEM.ARCHETYPES[aId]) {
        m.mantraArchetype = aId;
        m.mantraSpec = CULT.MANTRA_SYSTEM.ARCHETYPES[aId];
      }
    });
  }
  if (CULT.PASSIVE_RESONANCE) {
    CULT.PASSIVE_CONSTELLATION_SYSTEM = CULT.PASSIVE_RESONANCE;
    extraNC.forEach(t => {
      if (!t || t.cat !== 'PASSIVE') return;
      const cId = CULT.PASSIVE_RESONANCE.classifyPassiveTech(t);
      if (cId && CULT.PASSIVE_RESONANCE.CONSTELLATIONS[cId]) {
        t.passiveConstellation = cId;
        t.constellationSpec = CULT.PASSIVE_RESONANCE.CONSTELLATIONS[cId];
      }
    });

  }

  // 2. Expose CULT.mantraPoolWithExtras(path) while keeping default CULT.mantraPool(path) deterministic for legacy seed trajectories
  CULT.mantraPoolWithExtras = path => {
    const base = CULT.mantraPool(path).slice();
    const seen = new Set(base.map(m => m.id));
    for (const m of extraM) {
      if (!m || seen.has(m.id)) continue;
      if (m.path === path || m.path === 'ANY') {
        seen.add(m.id);
        base.push({
          id: m.id,
          nameTh: m.nameTh,
          path: m.path,
          tier: m.tier || 1,
          power: m.power || 20,
          element: m.element || 'NEUTRAL',
          elementProfile: m.elementProfile,
          legendary: !!(m.legendary || m.transcendent),
          transcendent: !!m.transcendent
        });
      }
    }
    return base;
  };

  // 3. Protect Transcendent arts & zero-slot passives from active-slot pruning
  const _origRetention = CULT.techRetentionScore;
  CULT.techRetentionScore = (npc, tOrId) => {
    const t = typeof tOrId === 'string' ? CULT.tech(tOrId) : tOrId;
    if (t && (t.transcendent || t.transcendentArt || t.zeroSlotPassive)) return 1e9;
    return _origRetention(npc, tOrId);
  };

  // 4. 5-Channel High-Frequency Low-Tier Non-Combat Distribution Engine (NONCMB_LOW_01A-01D)
  CULT.LOW_TIER_DISTRIBUTION = {
    CHANNELS: Object.freeze([
      'STARTER_SECT_LIBRARY',
      'RECRUIT_MUNDANE_BACKGROUND',
      'PEDDLER_CHEAP_STALL',
      'DAILY_CHORE_EPIPHANY',
      'SENIOR_JUNIOR_HAND_ME_DOWN'
    ]),
    seedStarterSectLibrary(W, count = 7) {
      if (!W || !W.sect) return [];
      // Deterministic isolated RNG (0 calls to W.rng!)
      const rng = new U.RNG(String(W.seed || 'seed') + ':low_lib');
      const pool = (JD.TECH.lowTierArts || []).filter(t => t && (t.tier || 1) <= 2);
      if (!pool.length) return [];
      const picked = [];
      const used = new Set();
      const target = Math.max(6, Math.min(8, Number(count) || 7));
      for (let i = 0; i < pool.length * 2 && picked.length < target; i++) {
        const cand = pool[Math.floor(rng.next() * pool.length)];
        if (cand && !used.has(cand.id)) {
          used.add(cand.id);
          picked.push(cand.id);
        }
      }
      W.sect.lowTierLibrary = picked.slice();
      return picked;
    },
    grantRecruitMundaneArt(W, npc) {
      if (!npc || !npc.cult) return null;
      const rng = new U.RNG(String((W && W.seed) || 'seed') + ':recruit_low:' + String(npc.id));
      const pool = (JD.TECH.lowTierArts || []).filter(t => t && (t.tier || 1) === 1);
      if (!pool.length) return null;
      const pick = pool[Math.floor(rng.next() * pool.length)];
      if (!pick) return null;
      if (pick.cat === 'QI_MANTRA') {
        npc.cult.unlockedMantras = npc.cult.unlockedMantras || [];
        if (!npc.cult.unlockedMantras.includes(pick.id)) npc.cult.unlockedMantras.push(pick.id);
      } else {
        npc.cult.techs = npc.cult.techs || [];
        if (!npc.cult.techs.includes(pick.id)) npc.cult.techs.push(pick.id);
      }
      npc.mundaneOriginArtId = pick.id;
      return pick;
    },
    generatePeddlerLowStock(W, day) {
      const rng = new U.RNG(String((W && W.seed) || 'seed') + ':peddler_low:' + String(day || (W && W.day) || 1));
      const pool = JD.TECH.lowTierArts || [];
      const stock = [];
      for (let i = 0; i < 4 && pool.length > 0; i++) {
        const it = pool[Math.floor(rng.next() * pool.length)];
        if (it && !stock.some(x => x.id === it.id)) {
          stock.push({ id: it.id, nameTh: it.nameTh, tier: it.tier || 1, priceStones: (it.tier || 1) * 18 });
        }
      }
      return stock;
    },
    tryChoreEpiphany(W, npc, choreKind) {
      if (!npc || !npc.cult) return null;
      const pool = (JD.TECH.lowTierNonCombatArts || []).filter(t => t && (t.cat === 'AUXILIARY_ART' || t.cat === 'PASSIVE' || t.cat === 'LIGHTNESS_ART') && !npc.cult.techs.includes(t.id));
      if (!pool.length) return null;
      const idx = Math.abs(U.hashStr(String(npc.id) + ':' + String(choreKind || 'chore') + ':' + String((W && W.day) || 1))) % pool.length;
      const art = pool[idx];
      if (art && !npc.cult.techs.includes(art.id)) {
        npc.cult.techs.push(art.id);
        return art;
      }
      return null;
    },
    transmitSeniorToJunior(W, senior, junior) {
      if (!senior || !junior || !senior.cult || !junior.cult) return null;
      const shared = (senior.cult.techs || []).find(id => {
        const t = CULT.tech(id);
        return t && t.isLowTierFolkArt && !junior.cult.techs.includes(id);
      });
      const targetId = shared || ((JD.TECH.lowTierNonCombatArts && JD.TECH.lowTierNonCombatArts[0]) ? JD.TECH.lowTierNonCombatArts[0].id : null);
      if (!targetId) return null;
      if (!junior.cult.techs.includes(targetId)) junior.cult.techs.push(targetId);
      junior.cult.tm = junior.cult.tm || {};
      junior.cult.tm[targetId] = Math.max(junior.cult.tm[targetId] || 0, 25);
      return CULT.tech(targetId);
    }
  };

  // 5. Three Non-Scroll Sovereign Awakening Gates (TRANSCENDENT_TECH_01A-02D)
  CULT.SOVEREIGN_AWAKENING_GATES = {
    GATES: Object.freeze({
      GATE_TRIBULATION_SURVIVAL: 'บรรลุผ่านการรอดชีวิตจากทัณฑ์สวรรค์หรือศึกเฉียดตาย (HP < 15%)',
      GATE_ANCESTRAL_SHRINE_RESONANCE: 'บรรลุผ่านการสั่นพ้องป้ายวิญญาณบูรพาจารย์รุ่นที่ 1–6 ณ ศาลบรรพชน',
      GATE_APEX_NEMESIS_DUEL: 'บรรลุผ่านการโค่นศัตรูคู่อาฆาตระดับสูงหรือฝึกฝนวิชาถึงขั้นสมบูรณ์ (Mastery 100)'
    }),
    checkSovereignCombatAwakening(W, npc, gateId, opts) {
      opts = opts || {};
      if (!npc || !npc.cult) return { ok: false, reason: 'no-cult' };
      if (!Object.hasOwn(this.GATES, gateId)) return { ok:false, reason:'unknown-gate' };
      const allSov = (JD.TECH.sovereignCombatArts || []).filter(t => t.awakeningGate === gateId &&
        (t.reqTier || 1) <= CULT.effectiveTechStage(npc) && !(npc.cult.techs || []).includes(t.id));
      const preferred = opts.techId && CULT.tech(opts.techId);
      const target = preferred ? allSov.find(t => t.id === preferred.id) : allSov[0];
      if (!target) return { ok: false, reason: 'no-eligible-target' };
      if (target.cat === 'QI_MANTRA') {
        npc.cult.unlockedMantras = npc.cult.unlockedMantras || [];
        if (!npc.cult.unlockedMantras.includes(target.id)) npc.cult.unlockedMantras.push(target.id);
        npc.cult.mantra = target.id;
      } else {
        npc.cult.techs = npc.cult.techs || [];
        if (!npc.cult.techs.includes(target.id)) npc.cult.techs.push(target.id);
        npc.cult.tm = npc.cult.tm || {};
        npc.cult.tm[target.id] = Math.max(npc.cult.tm[target.id] || 0, opts.initialMastery || 60);
      }
      npc.awakenedSovereignArts = npc.awakenedSovereignArts || [];
      if (!npc.awakenedSovereignArts.includes(target.id)) npc.awakenedSovereignArts.push(target.id);
      if (W && typeof W.log === 'function' && !opts.quiet) {
        W.log('cultivation', '✦ ' + (HC ? HC.fullName(npc) : npc.id) + ' ตื่นรู้คัมภีร์เหนือตำนาน「' + target.nameTh + '」ผ่าน' + (this.GATES[gateId] || gateId), [npc.id]);
      }
      return { ok: true, tech: target, techId: target.id, gateId };
    }
  };
  CULT.checkSovereignCombatAwakening = (W, npc, gateId, opts) => CULT.SOVEREIGN_AWAKENING_GATES.checkSovereignCombatAwakening(W, npc, gateId, opts);

  // 6. Wire CULT.lifespan, CULT.rate, CULT.breakthroughChance & MARTIAL.canActivateMantra


  const _origRateCarbon = CULT.rate;
  CULT.rate = (npc, env, W) => {
    let r = _origRateCarbon(npc, env);
    if (W && W.sect && W.sect.pillCloudBlessingUntil > 0 && (W.t || 0) < W.sect.pillCloudBlessingUntil) {
      r *= (W.sect.pillCloudCultMult || 1.28);
    }
    return r;
  };

  const _origBtChanceCarbon = CULT.breakthroughChance;
  CULT.breakthroughChance = (npc, prep) => {
    let p = _origBtChanceCarbon(npc, prep);
    if (npc && npc.equip && g.SECT && g.SECT.evaluateTranscendentPantheonResonance) {
      const eq = npc.equip;
      const hasTrans = (eq.WEAPON && eq.WEAPON.transcendent) || (eq.ARMOR && eq.ARMOR.transcendent) || (eq.ACCESSORY && eq.ACCESSORY.transcendent);
      if (hasTrans) {
        const w = (prep && prep.W) || (g.SECT.PEAKS && g.SECT.PEAKS._activeWorld) || null;
        const pan = g.SECT.evaluateTranscendentPantheonResonance(w, npc);
        if (pan && pan.breakthroughBonus > 0) {
          p = Math.min(0.96, p + pan.breakthroughBonus);
        }
      }
    }
    return p;
  };


  /* ============================================================================
   * JS2 v3.3.0: Voluntary Martial Vows (S07) & Six-Path Deep Mastery Engine
   * ============================================================================ */
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function detHash330(str) {
    let h = 2166136261 >>> 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  CULT.MARTIAL_VOWS = {
    CATALOG: Object.freeze({
      VOW_NO_PILL: {
        id: 'VOW_NO_PILL',
        nameTh: 'สัจจะงดโอสถในศึก',
        descTh: 'ไม่พึ่งพาโอสถระหว่างศึก แลกกับพลังโจมตี +12% และอัตราบ่มเพาะ +8%',
        breachKind: 'PILL_IN_COMBAT',
        p: { atk: 0.12, matk: 0.12 },
        f: { crit: 4 },
        cultRatePct: 0.08
      },
      VOW_NO_RETREAT: {
        id: 'VOW_NO_RETREAT',
        nameTh: 'สัจจะยืนหยัดไม่ถอยหนี',
        descTh: 'ไม่หลบหนีจากสมรภูมิ แลกกับพลังป้องกัน +14% และพลังชีวิต +10%',
        breachKind: 'RETREAT',
        p: { def: 0.14, mdef: 0.12, hp: 0.10 },
        f: {},
        cultRatePct: 0.05
      },
      VOW_SOLO_DUEL: {
        id: 'VOW_SOLO_DUEL',
        nameTh: 'สัจจะดวลเดี่ยวทระนง',
        descTh: 'ยืนหยัดประลองด้วยศักดิ์ศรี แลกกับคริติคอล +8% และเจาะเกราะ +10%',
        breachKind: 'UNFAIR_ASSIST',
        p: { atk: 0.10 },
        f: { crit: 8, pen: 10 },
        cultRatePct: 0.06
      },
      VOW_IRON_SILENCE: {
        id: 'VOW_IRON_SILENCE',
        nameTh: 'สัจจะบำเพ็ญสงบวาจา',
        descTh: 'สำรวมจิตบำเพ็ญเงียบสงัด เร่งความเร็วบ่มเพาะ +14% และป้องกันวิชา +10%',
        breachKind: 'DISTURBANCE',
        p: { mdef: 0.10 },
        f: { cast: 6 },
        cultRatePct: 0.14
      }
    }),

    evaluateAutonomousAdoption(W, npc) {
      if (!W || !npc || npc.dead || npc.foe || !npc.cult || !g.HC || !g.HC.eff) return null;
      if (npc.voluntaryVow && npc.voluntaryVow.active) return npc.voluntaryVow;
      if (npc.voluntaryVow && npc.voluntaryVow.backlashUntilDay && (W.day || 0) < npc.voluntaryVow.backlashUntilDay) return null;
      if ((npc.cult.stage || 1) < 2) return null;
      const E = g.HC.eff;
      const pride = E(npc, 'personality.pride');
      const courage = E(npc, 'personality.courage');
      const discipline = E(npc, 'personality.discipline');
      const caution = E(npc, 'personality.caution');
      const honor = E(npc, 'values.honorLegacy');
      if (caution >= 78 && honor < 60) return null;
      let picked = null;
      if (pride >= 68 && courage >= 62) picked = 'VOW_SOLO_DUEL';
      else if (courage >= 68 && honor >= 62) picked = 'VOW_NO_RETREAT';
      else if (discipline >= 68 && (npc.cult.path === 'LORE_ARCHIVIST' || npc.cult.path === 'BUDDHA_DHARMA' || npc.cult.path === 'XIAN')) picked = 'VOW_IRON_SILENCE';
      else if (discipline >= 65 && pride >= 60) picked = 'VOW_NO_PILL';
      if (!picked) return null;
      const spec = CULT.MARTIAL_VOWS.CATALOG[picked];
      npc.voluntaryVow = {
        id: spec.id,
        nameTh: spec.nameTh,
        active: true,
        swornDay: W.day || 0,
        breaches: (npc.voluntaryVow && npc.voluntaryVow.breaches) || 0,
        backlashUntilDay: 0
      };
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return npc.voluntaryVow;
    },

    recordBreach(W, npc, breachKind) {
      if (!npc || !npc.voluntaryVow || !npc.voluntaryVow.active) return { ok: false, reason: 'no-active-vow' };
      const spec = CULT.MARTIAL_VOWS.CATALOG[npc.voluntaryVow.id];
      if (!spec || (breachKind && spec.breachKind !== breachKind)) return { ok: false, reason: 'mismatch' };
      npc.voluntaryVow.active = false;
      npc.voluntaryVow.breaches = (npc.voluntaryVow.breaches || 0) + 1;
      npc.voluntaryVow.backlashUntilDay = (W ? (W.day || 0) : 0) + 15;
      if (npc.h && npc.h.state) {
        npc.h.state.heartDemon = Math.min(100, (npc.h.state.heartDemon || 0) + 12);
      }
      if (g.STATS) {
        g.STATS.addStatus(npc, 'vowBacklash', 24, null, W ? (W.t || 0) : 0);
        if (g.STATS.dirty) g.STATS.dirty(npc);
      }
      if (W && W.log) {
        W.log('cult', '⚠️ ' + ((npc.h && npc.h.name && npc.h.name.given) || 'ศิษย์') + ' ผิด「' + spec.nameTh + '」เกิดแรงสะท้อนสัจจะ (VOW_BACKLASH)!', [npc.id]);
      }
      return { ok: true, vowId: spec.id, breaches: npc.voluntaryVow.breaches };
    },

    getBonuses(npc) {
      if (!npc || !npc.voluntaryVow || !npc.voluntaryVow.active) return null;
      return CULT.MARTIAL_VOWS.CATALOG[npc.voluntaryVow.id] || null;
    }
  };

  CULT.SIX_PATH_MASTERY = {
    PATHS: Object.freeze(['ANCESTRAL_RITUAL', 'TIDE_VOYAGER', 'LORE_ARCHIVIST', 'FORTUNE_GAMBLER', 'SPIRIT_HUSBANDRY', 'ARENA_GLORY']),

    ensure(W, npc) {
      if (!npc || npc.foe || !npc.cult || !CULT.SIX_PATH_MASTERY.PATHS.includes(npc.cult.path)) return null;
      const p = npc.cult.path;
      if (!npc.sixPathMastery || npc.sixPathMastery.path !== p) {
        npc.sixPathMastery = {
          path: p,
          marrowEchoes: [],
          currentMark: 0,
          loreIndexRank: 1,
          stakeTier: 'CONSERVATIVE',
          stakeWins: 0,
          stakeLosses: 0,
          stakeDebtUntilDay: 0,
          stakeJackpotUntilDay: 0,
          bloomStacks: 1,
          arenaStreak: 0,
          crowdRoar: 0,
          lastSyncDay: -1
        };
      }
      return npc.sixPathMastery;
    },

    syncDaily(W, npc) {
      const m = CULT.SIX_PATH_MASTERY.ensure(W, npc);
      if (!W || !m) return null;
      const day = W.day || 0;
      m.lastSyncDay = day;
      const p = m.path;

      if (p === 'ANCESTRAL_RITUAL') {
        const fallen = (W.sect && Array.isArray(W.sect.fallen) && W.sect.fallen.length) ? W.sect.fallen.slice(-3) : [];
        const rawGraves = fallen.length ? fallen : (Array.isArray(W.graveyard) ? W.graveyard.slice(-3) : []);
        if (rawGraves.length > 0) {
          m.marrowEchoes = rawGraves.map((entry, idx) => {
            const gObj = typeof entry === 'string' ? ((W.byId && W.byId[entry]) || (W.sect && Array.isArray(W.sect.fallen) && W.sect.fallen.find(x => x && x.id === entry)) || null) : entry;
            const nm = (gObj && (gObj.nameTh || gObj.name)) || (gObj && gObj.h && gObj.h.name && ((gObj.h.name.family || gObj.h.name.surname || '') + (gObj.h.name.given || ''))) || ('บรรพชนรุ่น ' + (idx + 1));
            const stg = (gObj && gObj.stage) || (gObj && gObj.cult && gObj.cult.stage) || 2;
            return { nameTh: nm, stage: stg };
          });
        } else if (m.marrowEchoes.length === 0) {
          m.marrowEchoes = [{ nameTh: 'ปฐมบูรพาจารย์ผู้ก่อตั้งสำนัก', stage: Math.max(2, (npc.cult.stage || 1)) }];
        }
      } else if (p === 'TIDE_VOYAGER') {
        const isRain = !!(W.weather && (W.weather.kind === 'rain' || W.weather.kind === 'storm'));
        const nearRiver = Number.isFinite(npc.y) && npc.y >= 245;
        const survSk = (npc.h && npc.h.skills && Math.max(npc.h.skills.survival || 0, npc.h.skills.fishing || 0)) || 0;
        const fishingBonus = survSk >= 25 ? 1 : 0;
        m.currentMark = clamp((isRain ? 2 : 1) + (nearRiver ? 1 : 0) + fishingBonus, 1, 3);
      } else if (p === 'LORE_ARCHIVIST') {
        const ll = W.world && W.world.livingLore;
        let factCount = 0;
        if (ll && ll.facts && typeof ll.facts === 'object') {
          for (const fk in ll.facts) { if (ll.facts[fk] && ll.facts[fk].discovered) factCount++; }
        } else if (ll && ll.discoveredFacts && typeof ll.discoveredFacts === 'object') {
          factCount = Object.keys(ll.discoveredFacts).length;
        }
        const libCount = (W.sect && Array.isArray(W.sect.library) ? W.sect.library.length : (W.sect && Array.isArray(W.sect.manuals) ? W.sect.manuals.length : 0));
        m.loreIndexRank = clamp(1 + Math.floor((factCount + libCount * 0.5) / 4), 1, 5);
      } else if (p === 'FORTUNE_GAMBLER') {
        const E = g.HC && g.HC.eff;
        const sens = E ? E(npc, 'personality.sensationSeeking') : 50;
        const courage = E ? E(npc, 'personality.courage') : 50;
        const caution = E ? E(npc, 'personality.caution') : 50;
        if (sens >= 68 && courage >= 62 && caution < 55) m.stakeTier = 'ALL_IN';
        else if (sens >= 52 || courage >= 58) m.stakeTier = 'BOLD';
        else m.stakeTier = 'CONSERVATIVE';
      } else if (p === 'SPIRIT_HUSBANDRY') {
        const season = (W.season != null ? W.season : (W.weather && W.weather.season != null ? W.weather.season : 0));
        const isWarmSeason = season === 0 || season === 1 || season === 'spring' || season === 'summer';
        const seasonBase = isWarmSeason ? 3 : 2;
        const herbSkill = (npc.h && npc.h.skills && npc.h.skills.herbalism) || 0;
        m.bloomStacks = clamp(seasonBase + Math.floor(herbSkill / 35), 1, 5);
      } else if (p === 'ARENA_GLORY') {
        const nearbyAllies = Array.isArray(W.npcs) ? W.npcs.filter(o => o && o.id !== npc.id && !o.dead && !o.away && Number.isFinite(o.x) && Number.isFinite(npc.x) && Math.hypot(o.x - npc.x, o.y - npc.y) <= 18).length : 0;
        m.crowdRoar = clamp(Math.floor(nearbyAllies / 2) + Math.min(3, m.arenaStreak || 0), 0, 5);
      }

      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return m;
    },

    resolveStakeWager(W, npc, context) {
      const m = CULT.SIX_PATH_MASTERY.ensure(W, npc);
      if (!W || !m || m.path !== 'FORTUNE_GAMBLER') return { ok: false, reason: 'not-gambler' };
      const day = W.day || 0;
      const tier = m.stakeTier || 'CONSERVATIVE';
      const roll = (detHash330((W.seed || 'seed') + ':' + npc.id + ':' + day + ':' + (context || 'combat') + ':' + (m.stakeWins + m.stakeLosses)) % 100) / 100;
      const winThreshold = tier === 'ALL_IN' ? 0.45 : (tier === 'BOLD' ? 0.55 : 0.68);
      const won = roll < winThreshold;
      if (won) {
        m.stakeWins = (m.stakeWins || 0) + 1;
        m.stakeJackpotUntilDay = day + 3;
        m.stakeDebtUntilDay = 0;
        CULT.gainPathGauge(npc, tier === 'ALL_IN' ? 35 : (tier === 'BOLD' ? 22 : 12));
      } else {
        m.stakeLosses = (m.stakeLosses || 0) + 1;
        m.stakeDebtUntilDay = day + 2;
        if (npc.h && npc.h.state) npc.h.state.heartDemon = Math.min(100, (npc.h.state.heartDemon || 0) + (tier === 'ALL_IN' ? 8 : 4));
      }
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return { ok: true, won, tier, wins: m.stakeWins, losses: m.stakeLosses };
    },

    recordArenaVictory(W, npc) {
      const m = CULT.SIX_PATH_MASTERY.ensure(W, npc);
      if (!m || m.path !== 'ARENA_GLORY') return null;
      m.arenaStreak = Math.min(10, (m.arenaStreak || 0) + 1);
      m.crowdRoar = clamp(Math.max(m.crowdRoar || 0, Math.min(5, m.arenaStreak)), 0, 5);
      CULT.gainPathGauge(npc, 20);
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      return m;
    },

    getStatBonuses(W, npc) {
      const m = npc && npc.sixPathMastery;
      if (!m || !npc.cult || m.path !== npc.cult.path) return null;
      const day = W ? (W.day || 0) : 0;
      const p = {}, f = {};
      let cultRatePct = 0, yieldBonusPct = 0, summaryTh = '';
      if (m.path === 'ANCESTRAL_RITUAL') {
        const cnt = Array.isArray(m.marrowEchoes) ? Math.min(3, m.marrowEchoes.length) : 0;
        if (cnt > 0) {
          p.def = cnt * 0.04;
          p.mdef = cnt * 0.04;
          p.atk = cnt * 0.03;
          p.matk = cnt * 0.03;
          summaryTh = 'เสียงบรรพชน ' + cnt + '/3 ร่าง';
        }
      } else if (m.path === 'TIDE_VOYAGER') {
        const cm = clamp(m.currentMark || 0, 0, 3);
        if (cm > 0) {
          f.move = cm * 3;
          p.eva = cm * 0.05;
          p.matk = cm * 0.04;
          yieldBonusPct = cm * 0.08;
          summaryTh = 'กระแสสมุทร ' + cm + '/3 ขั้น';
        }
      } else if (m.path === 'LORE_ARCHIVIST') {
        const rk = clamp(m.loreIndexRank || 1, 1, 5);
        p.matk = rk * 0.03;
        f.acc = rk * 4;
        cultRatePct = rk * 0.04;
        summaryTh = 'ดัชนีหอคัมภีร์ ขั้น ' + rk + '/5';
      } else if (m.path === 'FORTUNE_GAMBLER') {
        if (m.stakeJackpotUntilDay && day <= m.stakeJackpotUntilDay) {
          const mul = m.stakeTier === 'ALL_IN' ? 1.5 : (m.stakeTier === 'BOLD' ? 1.2 : 1.0);
          p.atk = 0.10 * mul;
          p.matk = 0.10 * mul;
          f.crit = Math.round(8 * mul);
          summaryTh = 'เดิมพันชนะ (' + m.stakeTier + ')';
        } else if (m.stakeDebtUntilDay && day <= m.stakeDebtUntilDay) {
          p.def = -0.08;
          summaryTh = 'หนี้ชะตาเดิมพัน (-8% ป้องกัน)';
        } else {
          summaryTh = 'ระดับเดิมพัน: ' + (m.stakeTier || 'CONSERVATIVE');
        }
      } else if (m.path === 'SPIRIT_HUSBANDRY') {
        const bs = clamp(m.bloomStacks || 1, 1, 5);
        p.hp = bs * 0.03;
        p.mdef = bs * 0.03;
        yieldBonusPct = bs * 0.06;
        summaryTh = 'พฤกษาเบ่งบาน ' + bs + '/5 ชั้น';
      } else if (m.path === 'ARENA_GLORY') {
        const cr = clamp(m.crowdRoar || 0, 0, 5);
        if (cr > 0) {
          p.atk = cr * 0.035;
          f.crit = cr * 2;
          summaryTh = 'เสียงก้องสังเวียน ' + cr + '/5 (สถิติ ' + (m.arenaStreak || 0) + ')';
        }
      }
      return { p, f, cultRatePct, yieldBonusPct, summaryTh };
    }
  };

  const _origRateV330 = CULT.rate;
  CULT.rate = (npc, env, W) => {
    let r = _origRateV330(npc, env, W);
    if (npc && !npc.foe) {
      const vb = CULT.MARTIAL_VOWS.getBonuses(npc);
      if (vb && vb.cultRatePct) {
        const hasOtherVow = !!((npc.daoOath && npc.daoOath.upheld) || (npc.voluntaryVows && Object.values(npc.voluntaryVows).some(v => v && v.active)));
        const effVowPct = hasOtherVow ? Math.min(0.06, vb.cultRatePct * 0.4) : vb.cultRatePct;
        r *= (1 + effVowPct);
      }
      const wRef = W || (g.SECT && g.SECT.PEAKS && g.SECT.PEAKS._activeWorld) || null;
      const sm = CULT.SIX_PATH_MASTERY.getStatBonuses(wRef, npc);
      if (sm && sm.cultRatePct) r *= (1 + sm.cultRatePct);
    }
    return r;
  };


  /* ============================================================================
   * JS2 v3.7.0 — Legendary & Transcendent Dao Engine (CULT.LEGENDARY_DAO)
   * 12 Standalone High-Grade Paths (6 Legendary + 6 Transcendent, 60 Subpaths)
   * Strictly Lower-World Scale (Stage 1.0 -> 9.0, Veil intact). Zero W.rng consumption.
   * ============================================================================ */
  const LD_PROVENANCE = Object.freeze({"LEG_READ_FORM_BLADE": {"id": "LEG_READ_FORM_BLADE", "nameTh": "วิถีกระบี่อ่านช่องฟ้า", "grade": "LEGENDARY", "originType": "LOCAL_LOWER_HISTORY", "kw": "KW_DAO_READ_FORM", "minEqStage": 4, "lore": {"eraTh": "ยุคที่ 39–44 (ศ.ท. 38,019–43,888) · รากเหง้าการประลองร้อยก้าวไร้เสียงและด่านซานเจียง", "regionId": "NORTHERN_PEAKS", "inventorTh": "ครูฝึกด่านซานเจียงผู้รอดชีวิตจากทัพม้าเหล็ก", "adapterTh": "ศิษย์เฝ้าด่านรุ่นหลังที่บันทึกแผ่นท่าลงกระดานไม้", "competingAccountsTh": "ด่านซานเจียงถือว่าเป็นวิชารักษาด่านท้องถิ่น ขณะที่หอคัมภีร์บางแห่งเข้าใจผิดว่าเป็นเศษคัมภีร์สำนักกระบี่โบราณ", "discoverySources": ["แผ่นจารึกท่าด่านชายแดน", "ครูฝึกเฝ้าด่าน", "บันทึกการประลอง"]}, "subpaths": [{"id": "LEG_SUB_CLOSING_BLADE", "nameTh": "กระบี่ปิดบท", "descTh": "จำท่าโจมตีหลักของศัตรูแล้วตัดกระบวนด้วยคมกระบี่เดียวเมื่อเห็นสัญญาณซ้ำ"}, {"id": "LEG_SUB_STANCE_BREAKER", "nameTh": "กระบี่ตัดกระบวน", "descTh": "เน้นฟันทำลายหลักการยืนและเกราะปราณของศัตรูที่ตั้งท่าต่อเนื่อง"}, {"id": "LEG_SUB_ECHO_PARRY", "nameTh": "กระบี่สะท้อนจังหวะ", "descTh": "รับแรงปะทะแล้วเบี่ยงจังหวะศัตรูให้เสียหลักเปิดทางให้สหายซ้ำ"}, {"id": "LEG_SUB_BORDER_SENTINEL", "nameTh": "กระบี่เฝ้าด่าน", "descTh": "ยึดมั่นแนวป้องกันด่านชายแดน ปิดทางบุกของศัตรูที่โถมเข้าใส่"}, {"id": "LEG_SUB_SINGLE_DRAW_VERDICT", "nameTh": "กระบี่ชักเดี่ยวตัดสิน", "descTh": "สะสมสมาธิรอจังหวะเดียวที่ศัตรูเผยช่องว่างแล้วชักกระบี่ปลิดศึก"}]}, "LEG_TRIAGE_MERIDIAN": {"id": "LEG_TRIAGE_MERIDIAN", "nameTh": "วิถีชีพจรประคองสหาย", "grade": "LEGENDARY", "originType": "LOWLY_UPPER_WORLD", "kw": "KW_DAO_TRIAGE_PULSE", "minEqStage": 4, "lore": {"eraTh": "ยุคที่ 11–14 (ศ.ท. 10,088–13,315) · วิบัติหมอกพิษมรกตและการสืบทอดสู่หมอสนามยุคหลัง", "regionId": "CENTRAL_HEARTLAND", "inventorTh": "แผ่นฝึกหายใจชั้นผู้น้อยที่ถูกคัดทิ้งจากหอพักโลกเบื้องบน", "adapterTh": "หมอสนามกองคุ้มกันที่ตัดทอนขั้นตอนเกินกำลังและเพิ่มท่ารับชีพจร", "competingAccountsTh": "สำนักแพทย์บางแห่งยกย่องว่าเป็นตำราเซียนโอสถ แต่บันทึกหอรักษาเก่าชี้ชัดว่าเริ่มต้นจากแผ่นฝึกหายใจคนรับใช้ที่ถูกดัดแปลงจนใช้งานได้จริงในโลกเบื้องล่าง", "discoverySources": ["สมุดเวรหอรักษา", "แผ่นฝึกหายใจคัดทิ้ง", "หมอสนามกองคุ้มกัน"]}, "subpaths": [{"id": "LEG_SUB_WARD_PHYSICIAN", "nameTh": "หมอสนามประคองชีพ", "descTh": "มุ่งเน้นฟื้นฟูสหายที่บาดเจ็บหนักที่สุดอย่างตรงจุดและประหยัดปราณ"}, {"id": "LEG_SUB_MERIDIAN_UNBLOCK", "nameTh": "ดัชนีเปิดชีพจร", "descTh": "สกัดจุดเปิดเส้นปราณให้สหายลงมือคล่องตัว พร้อมสะกดจุดชีพจรศัตรู"}, {"id": "LEG_SUB_POISON_SIPHON", "nameTh": "ถ่ายพิษคืนสมดุล", "descTh": "ดึงไอพิษออกจากร่างสหายแล้วสะท้อนกลับเป็นพิษอ่อนกำลังใส่ศัตรู"}, {"id": "LEG_SUB_ESCORT_VIGIL", "nameTh": "ชีพจรคุ้มขบวน", "descTh": "ตั้งแนวประคองขวัญและเกราะปราณให้คณะเดินทางฝ่าการซุ่มโจมตี"}, {"id": "LEG_SUB_FEVER_CALM", "nameTh": "ระงับธาตุไฟแทรก", "descTh": "คลายความเครียดและระงับอาการปราณตีกลับของสหายกลางสมรภูมิ"}]}, "LEG_STORM_CALLER_TEMPEST": {"id": "LEG_STORM_CALLER_TEMPEST", "nameTh": "วิถีจอมพายุบัญชาฟ้า", "grade": "LEGENDARY", "originType": "LOCAL_LOWER_HISTORY", "kw": "KW_DAO_FRONT_SHIFT", "minEqStage": 4, "lore": {"eraTh": "ยุคที่ 18–22 (ศ.ท. 17,402–21,109) · ยุคเจ็ดกองเรือฝ่าทะเลหมอกและมรสุมเจ็ดปีแดนใต้", "regionId": "SOUTHERN_WATERS", "inventorTh": "กัปตันเรือเดินสมุทรและพรานยอดเขาที่ร่วมกันจดทิศลม", "adapterTh": "ศิษย์หอดูดาวชายฝั่งที่แปรวิชาอ่านเมฆเป็นเพลงพัดอสนี", "competingAccountsTh": "ชาวประมงถือว่าเป็นวิชาพยากรณ์คลื่นลม ขณะที่นักค่ายกลมองว่าเป็นการชักนำประจุฟ้าในวงแคบ", "discoverySources": ["บันทึกมรสุมเจ็ดปี", "หอเตือนพายุชายฝั่ง", "พรานยอดเขา"]}, "subpaths": [{"id": "LEG_SUB_MONSOON_HERALD", "nameTh": "ผู้เรียกลมมรสุม", "descTh": "สร้างแนวฝนลมลดความคล่องตัวของศัตรูและเสริมพลังธาตุวารี"}, {"id": "LEG_SUB_THUNDER_SQUALL", "nameTh": "พายุอสนีลูกโซ่", "descTh": "ฟาดสายฟ้าชิ่งใส่ศัตรูที่ยืนเกาะกลุ่มอย่างรวดเร็ว"}, {"id": "LEG_SUB_FROST_FRONT", "nameTh": "แนวลมเหมันต์", "descTh": "แผ่ลมหนาวแช่แข็งจังหวะการร่ายและการเคลื่อนไหวของศัตรู"}, {"id": "LEG_SUB_DROUGHT_MIST", "nameTh": "หมอกระอุกลางศึก", "descTh": "สร้างไอร้อนและหมอกควันบดบังสายตาพร้อมเผาผลาญปราณศัตรู"}, {"id": "LEG_SUB_CLEAR_SKY_EYE", "nameTh": "เนตรตาพายุ", "descTh": "รักษาความสงบกลางความโกลาหล ลบล้างหมอกพรางตาและเสริมความแม่นยำให้ทีม"}]}, "LEG_JADE_CARAVAN_VOYAGER": {"id": "LEG_JADE_CARAVAN_VOYAGER", "nameTh": "วิถีจอมคาราวานหยก", "grade": "LEGENDARY", "originType": "LOCAL_LOWER_HISTORY", "kw": "KW_DAO_PROVISION_SHARE", "minEqStage": 4, "lore": {"eraTh": "ยุคที่ 54–59 (ศ.ท. 53,300–58,650) · ยุคสหพันธ์คาราวานหยกทองและน้ำหลากใหญ่ลุ่มน้ำหยุนเหอ", "regionId": "EASTERN_PLAINS", "inventorTh": "นายท่าเรือข้ามฟากและกองคาราวานจากตำนานเรือข้าวสามหนี้", "adapterTh": "หัวหน้ากองคุ้มกันเส้นทางเกลือที่พัฒนาท่ารับส่งเสบียงกลางศึก", "competingAccountsTh": "พงศาวดารเมืองหลวงอ้างว่าขุนนางผู้ตรวจการเป็นผู้คิดค้น แต่สมุดบัญชีด่านเก็บภาษีเก่าชี้ว่าเป็นผลงานของนายท่าสามัญชนสามคน", "discoverySources": ["สมุดบัญชีด่านภาษีเก่า", "กองคาราวานเส้นทางเกลือ", "ท่าข้ามฟากโบราณ"]}, "subpaths": [{"id": "LEG_SUB_SALT_ROAD_GUARD", "nameTh": "ผู้คุ้มเส้นทางเกลือ", "descTh": "ชำนาญการตั้งขบวนคุ้มกันเกวียนและต้านทานการดักปล้นในหุบเขา"}, {"id": "LEG_SUB_FIELD_TINKER", "nameTh": "เตาหลอมซ่อมกลางทาง", "descTh": "ปรับแต่งและซ่อมแซมศาสตรากลางภารกิจ ลดความเสียหายเมื่อแผนผิดพลาด"}, {"id": "LEG_SUB_LEDGER_BROKER", "nameTh": "สมุดบัญชีหยก", "descTh": "คำนวณต้นทุนและช่องโหว่ของศัตรูด้วยความแม่นยำดุจลูกคิดทองคำ"}, {"id": "LEG_SUB_RELAY_COURIER", "nameTh": "ม้าเร็วส่งสาร", "descTh": "เร่งความเร็วเดินทางและฉาบฉวยตัดกำลังแนวหลังของศัตรู"}, {"id": "LEG_SUB_FERRY_PACT", "nameTh": "พันธะท่าข้ามฟาก", "descTh": "สืบทอดเจตนารมณ์ช่วยเหลือข้ามลำน้ำ ยามคับขันช่วยพาคณะถอนตัวได้อย่างปลอดภัย"}]}, "LEG_OATH_JUDGE_WARDEN": {"id": "LEG_OATH_JUDGE_WARDEN", "nameTh": "วิถีผู้คุมสัตย์สาบาน", "grade": "LEGENDARY", "originType": "LOCAL_LOWER_HISTORY", "kw": "KW_DAO_VERDICT_MARK", "minEqStage": 4, "lore": {"eraTh": "ยุคที่ 29–34 (ศ.ท. 28,515–33,772) · ยุคศาลธรรมนูญสัตย์สาบานหลังโศกนาฏกรรมอวี้จิง", "regionId": "CENTRAL_HEARTLAND", "inventorTh": "กลุ่มผู้เฒ่าและตุลาการพเนจรที่แยกตัวจากความขัดแย้งนองเลือด", "adapterTh": "หอจดหมายเหตุสำนักศึกษาไป๋ลู่ที่รวบรวมวิธีสืบพยานสองแหล่ง", "competingAccountsTh": "ฝ่ายธรรมะมองว่าเป็นศาลยุทธภพเที่ยงธรรม ขณะที่สำนักอิสระบางแห่งเกรงว่าถูกใช้เป็นเครื่องมือการเมือง", "discoverySources": ["หอจดหมายเหตุไป๋ลู่", "ศาลไกล่เกลี่ยยุทธภพ", "ศิลาจารึกคำสัตย์"]}, "subpaths": [{"id": "LEG_SUB_VOW_WITNESS", "nameTh": "พยานสัตย์สาบาน", "descTh": "ยืนหยัดเป็นพยานคำสัตย์ เสริมพลังแก่ผู้รักษาสัจจะและลงทัณฑ์ผู้ตระบัดสัตย์"}, {"id": "LEG_SUB_TRUTH_LANTERN", "nameTh": "โคมส่องรอยจริง", "descTh": "สืบสาวหลักฐานจริงเพื่อทำลายกลลวงพรางกายและเตือนภัยล่วงหน้า"}, {"id": "LEG_SUB_BLOOD_DEBT_BAILIFF", "nameTh": "ตุลาการทวงหนี้เลือด", "descTh": "ไล่ล่าผู้ก่อเหตุร้ายและทลายเกราะปราณของศัตรูที่มีค่าความแค้นสูง"}, {"id": "LEG_SUB_TRUCE_MEDIATOR", "nameTh": "ผู้ไกล่เกลี่ยสงบศึก", "descTh": "ลดความรุนแรงของความขัดแย้ง เกลี้ยกล่อมศัตรูสามัญที่อ่อนล้าให้ถอนตัว"}, {"id": "LEG_SUB_ARCHIVE_INQUISITOR", "nameTh": "ผู้ตรวจหอจดหมายเหตุ", "descTh": "ตรวจสอบประวัติคัมภีร์และปิดผนึกกระบวนท่าที่ขัดต่อธรรมเนียม"}]}, "LEG_ASHEN_KILN_ALCHEMY": {"id": "LEG_ASHEN_KILN_ALCHEMY", "nameTh": "วิถีเตาเถ้าคืนชีวิต", "grade": "LEGENDARY", "originType": "LOCAL_LOWER_HISTORY", "kw": "KW_DAO_ASHEN_GLAZE", "minEqStage": 4, "lore": {"eraTh": "ยุคที่ 11–14 (ศ.ท. 10,088–13,315) · ยุคหุบเขาโอสถเตาเถ้าและศึกปิดล้อมเมืองเตาเผาสามฤดู", "regionId": "WESTERN_BADLANDS", "inventorTh": "ช่างปั้นเครื่องเคลือบและศิษย์หลอมโอสถที่ถูกขับออกจากสำนักใหญ่", "adapterTh": "ช่างบูรณะซากศึกประจำด่านชายแดนที่นำเถ้าถ่านมาหลอมเกราะฉุกเฉิน", "competingAccountsTh": "สำนักหลอมโอสถชั้นสูงดูแคลนว่าเป็นวิชาเก็บกากของเหลือ แต่เมืองชายแดนที่รอดพ้นการปิดล้อมต่างยกย่องว่าเป็นวิถีแห่งการเอาชีวิตรอด", "discoverySources": ["เตาเผาร้างหลังศึกปิดล้อม", "ตำรากลั่นกากโอสถ", "ช่างบูรณะซากกำแพงเมือง"]}, "subpaths": [{"id": "LEG_SUB_DREG_REFINER", "nameTh": "กลั่นกากโอสถคืนฤทธิ์", "descTh": "นำกากโอสถที่หลอมพลาดมากลั่นซ้ำเป็นยาพอกและไอเพลิงรักษาสหาย"}, {"id": "LEG_SUB_CRACKED_GLAZE_WARD", "nameTh": "เกราะเคลือบเถ้าแตกสะท้อน", "descTh": "สร้างเกราะกระเบื้องเคลือบหนา เมื่อแตกจากการโจมตีหนักจะระเบิดสะเก็ดสวนกลับ"}, {"id": "LEG_SUB_RUIN_MASON", "nameTh": "ช่างบูรณะซากศึก", "descTh": "ซ่อมแซมแนวรับและค่ายกลที่ชำรุด ลดความสูญเสียของสำนักในยามกลียุค"}, {"id": "LEG_SUB_CHARCOAL_BREATH", "nameTh": "ลมหายใจถ่านมอด", "descTh": "เก็บงำความร้อนใต้เถ้าถ่านไว้รอจังหวะปะทุรุนแรงเมื่อศึกยืดเยื้อ"}, {"id": "LEG_SUB_SCAR_KILN_FORGE", "nameTh": "เตาหลอมแผลศาสตรา", "descTh": "หลอมรอยบิ่นและเศษโลหะแตกหักให้กลายเป็นคมดาบเถ้าเพลิงที่เจาะเกราะได้"}]}, "TRANS_CONSTELLATION_RELAY": {"id": "TRANS_CONSTELLATION_RELAY", "nameTh": "วิถีประสานปราณหมู่ดาว", "grade": "TRANSCENDENT", "originType": "ASCENDED_LOWER_MASTER", "kw": "KW_DAO_STAR_RELAY", "minEqStage": 6, "lore": {"eraTh": "ยุคที่ 78–84 (ศ.ท. 77,140–83,520) · ยุคหอประสานปราณหมู่ดาวและช่องเขาทัณฑ์ฟ้าแดนเหนือ", "regionId": "NORTHERN_PEAKS", "inventorTh": "ปรมาจารย์หมอทัพผู้บรรลุจุดสูงสุดโลกเบื้องล่างและข้ามม่านฟ้าไปแล้ว", "adapterTh": "ศิษย์เอกที่เฝ้าช่องเขาคุ้มกันอาจารย์ระหว่างฟ้าทัณฑ์ครั้งสุดท้าย", "competingAccountsTh": "บันทึกสองสำนักขัดแย้งกันว่าแผนภาพไตรดาราหรือสายพิณประสานใจกันแน่ที่ช่วยศิษย์รอดจากฟ้าทัณฑ์ในวันนั้น", "discoverySources": ["แผนภาพด่านปฐมพยาบาลเก่า", "รอยจารึกช่องเขาทัณฑ์ฟ้า", "ครูฝึกกู้ภัยอาวุโส"]}, "subpaths": [{"id": "TRANS_SUB_TRIAD_ANCHOR", "nameTh": "หลักปราณไตรดารา", "descTh": "ปักหลักสามตำแหน่งแบ่งเบาความเสียหายหนักและส่งต่อเกราะปราณ"}, {"id": "TRANS_SUB_HEARTSTRING_CHORD", "nameTh": "สายพิณประสานใจ", "descTh": "แปรอารมณ์และความมุ่งมั่นจริงของสหายเป็นทำนองฟื้นฟูขวัญและลดความเครียด"}, {"id": "TRANS_SUB_TRIBULATION_CANOPY", "nameTh": "ม่านดาราต้านทัณฑ์", "descTh": "กางม่านดาราคุ้มกันการโจมตีรุนแรงตามตำนานช่องเขาทัณฑ์ฟ้า"}, {"id": "TRANS_SUB_ECHO_MENDING", "nameTh": "ฟื้นฟูสะท้อนตำแหน่ง", "descTh": "ส่งต่อผลของการรักษาจากหนึ่งเป้าหมายไปยังสหายที่เชื่อมข่ายอยู่ตามสัดส่วน"}, {"id": "TRANS_SUB_STAR_VIGIL_CHAIN", "nameTh": "โซ่ดาราเฝ้าระวัง", "descTh": "เชื่อมสายตาและจังหวะระวังภัยของทั้งทีม ป้องกันการลอบโจมตีจากมุมอับ"}]}, "TRANS_FIELD_CLAUSE_SOVEREIGN": {"id": "TRANS_FIELD_CLAUSE_SOVEREIGN", "nameTh": "วิถีธรรมนูญฟ้าขีดเขต", "grade": "TRANSCENDENT", "originType": "ASCENDED_LOWER_MASTER", "kw": "KW_DAO_FIELD_CLAUSE", "minEqStage": 6, "lore": {"eraTh": "ปลายสมัยมหาจักรวรรดิเทียนกู่ (ก่อน ศ.ท.) และฟื้นฟูในยุคศาลธรรมนูญสัตย์สาบาน (ยุคที่ 29–34)", "regionId": "EASTERN_PLAINS", "inventorTh": "แม่ทัพนักกฎหมายยุคเทียนกู่ผู้ฝึกตนจนข้ามม่านฟ้าก่อนอาณาจักรแตก", "adapterTh": "ขุนศึกชายแดนที่นำกติกาสงบศึกเฉพาะจุดมาปรับใช้คุ้มกันขบวนถอนทัพ", "competingAccountsTh": "ราชสำนักตงหวงอ้างสิทธิ์สืบทอดสายตรง แต่นักค่ายกลอิสระพบหลักฐานเดียวกันสลักไว้บนศิลาด่านสองแห่งที่ไม่อยู่ในอำนาจราชสำนัก", "discoverySources": ["ศิลาธรรมนูญด่านโบราณ", "ตำราพิชัยสงครามเทียนกู่", "บันทึกการถอนทัพชายแดน"]}, "subpaths": [{"id": "TRANS_SUB_WEIGHT_OF_ARMS", "nameTh": "ธรรมนูญน้ำหนักศาสตรา", "descTh": "เพิ่มน้ำหนักการปะทะซึ่งหน้า บีบให้ศัตรูสายหลบหลีกต้องรับแรงกดดัน"}, {"id": "TRANS_SUB_SILENT_RING", "nameTh": "เขตห้ามร่ายซ้อน", "descTh": "จำกัดการร่ายท่าซ้ำต่อเนื่องในเขตแดน ตัดจังหวะสายปราณที่พึ่งพาท่าเดิม"}, {"id": "TRANS_SUB_EQUAL_GROUND", "nameTh": "ผืนดินเสมอภาค", "descTh": "ลดช่องว่างความได้เปรียบจากภูมิประเทศและบัฟพุ่งพรวด ชนะกันด้วยรากฐานจริง"}, {"id": "TRANS_SUB_BANNER_CHARTER", "nameTh": "กฎธงทัพ", "descTh": "ปักธงบัญชาการเสริมระเบียบทัพและการประสานจังหวะโจมตีของสหาย"}, {"id": "TRANS_SUB_TRUCE_BOUNDARY", "nameTh": "เส้นเขตพักรบ", "descTh": "ขีดแนวกันชนชั่วคราวเปิดโอกาสให้สหายบาดเจ็บถอนตัวและจัดขบวนใหม่"}]}, "TRANS_TEMPO_SOVEREIGN": {"id": "TRANS_TEMPO_SOVEREIGN", "nameTh": "วิถีปรมาจารย์จังหวะกาล", "grade": "TRANSCENDENT", "originType": "LOCAL_LOWER_HISTORY", "kw": "KW_DAO_TEMPO_BANK", "minEqStage": 6, "lore": {"eraTh": "ยุคที่ 39–44 (ศ.ท. 38,019–43,888) · ยุคหอกลองริมแม่น้ำและการประลองร้อยก้าวไร้เสียง", "regionId": "SOUTHERN_WATERS", "inventorTh": "นายกลองเรือรบและช่างนาฬิกาน้ำริมแม่น้ำใหญ่", "adapterTh": "ยอดฝีมือที่นำหลักการหน่วงกระแสน้ำมาประยุกต์เป็นจังหวะกระบวนท่า", "competingAccountsTh": "บางคนนึกว่าเป็นวิถีกาลเวลาจากแดนลับ แต่จารึกหอกลองเก่าพิสูจน์ว่าเกิดจากการจับจังหวะฝีพายและสายน้ำจริงในโลกเบื้องล่าง", "discoverySources": ["จารึกหอกลองริมแม่น้ำ", "บันทึกแผนสำรองกองเรือ", "ครูฝึกจังหวะกลองศึก"]}, "subpaths": [{"id": "TRANS_SUB_DEFERRED_CURRENT", "nameTh": "สายน้ำรอผล", "descTh": "เก็บปราณไว้ปลายกระแสแล้วปล่อยผลเมื่อเงื่อนไขในสนามเกิดขึ้นจริง"}, {"id": "TRANS_SUB_DRUM_CADENCE", "nameTh": "จังหวะกลองศึก", "descTh": "กำหนดจังหวะรุกพร้อมเพรียงให้สหายเข้าโจมตีอย่างต่อเนื่อง"}, {"id": "TRANS_SUB_STILL_INTERVAL", "nameTh": "ช่องว่างระหว่างลมหายใจ", "descTh": "แทรกตัวเข้าโจมตีในเสี้ยววินาทีที่ศัตรูเปลี่ยนท่าหายใจ"}, {"id": "TRANS_SUB_COUNTER_BEAT", "nameTh": "ตีตัดจังหวะ", "descTh": "ทำลายจังหวะร่ายท่าใหญ่ของศัตรูและยืดคูลดาวน์กระบวนท่า"}, {"id": "TRANS_SUB_SEASON_TIDE", "nameTh": "กระแสน้ำเปลี่ยนฤดู", "descTh": "ปรับจังหวะการฟื้นฟูของคณะให้สอดคล้องกับกระแสศึกยาวนาน"}]}, "TRANS_SEALKEEPER_FORBIDDEN_KEY": {"id": "TRANS_SEALKEEPER_FORBIDDEN_KEY", "nameTh": "วิถีผู้ถือกุญแจผนึก", "grade": "TRANSCENDENT", "originType": "LOWLY_UPPER_WORLD", "kw": "KW_DAO_SEAL_KNOT", "minEqStage": 6, "lore": {"eraTh": "ยุคที่ 29–34 (ศ.ท. 28,515–33,772) · ยุคหอผู้ถือกุญแจผนึกทั้งเก้าและซากคลังโบราณ", "regionId": "WESTERN_BADLANDS", "inventorTh": "ปมเชือกผูกหีบสินค้าแตกหักง่ายของพนักงานคลังชั้นผู้น้อยในโลกเบื้องบน", "adapterTh": "นักยันต์โลกเบื้องล่างที่ตัดขั้นตอนใช้ปราณสูงออกแล้วดัดแปลงเป็นผนึกกักเก็บที่ควบคุมได้", "competingAccountsTh": "สองสำนักยันต์ถกเถียงกันไม่จบว่าควรถ่ายระบายไออันตรายในปมผนึกทิ้งกลางทางหรือถือไปส่งผู้เชี่ยวชาญ", "discoverySources": ["เศษป้ายคลังสินค้าโบราณ", "สำนักยันต์ผนึกชายแดน", "หอเก็บวัตถุต้องห้าม"]}, "subpaths": [{"id": "TRANS_SUB_CARGO_KNOT", "nameTh": "ปมผนึกคลังโบราณ", "descTh": "ใช้ปมเชือกคลังโบราณดัดแปลงกักเก็บและสะกดกระบวนท่าศัตรูอย่างมั่นคง"}, {"id": "TRANS_SUB_VENTING_WARD", "nameTh": "ผนึกระบายไอพิษ", "descTh": "เลือกปล่อยระบายแรงดันและไอพิษออกจากผนึกอย่างปลอดภัยเพื่อปกป้องสหาย"}, {"id": "TRANS_SUB_KEYBEARER_LOCK", "nameTh": "กุญแจล็อกกระบวน", "descTh": "สะกดจุดเชื่อมต่อท่าไม้ตายของคู่ต่อสู้ให้ใช้การไม่ได้ชั่วคราว"}, {"id": "TRANS_SUB_TABOO_DAMPER", "nameTh": "เกราะคุมวิชาต้องห้าม", "descTh": "ลดทอนแรงตีกลับจากวิชาต้องห้ามและเปลี่ยนเป็นเกราะปราณคุ้มกาย"}, {"id": "TRANS_SUB_RELIC_CAGE", "nameTh": "กรงผนึกศาสตรา", "descTh": "ตรึงอานุภาพศาสตราวิเศษของศัตรูให้แสดงฤทธิ์ได้ลดลงชั่วคราว"}]}, "TRANS_PRIMAL_VORTEX_MIRROR": {"id": "TRANS_PRIMAL_VORTEX_MIRROR", "nameTh": "วิถีกระจกสะท้อนหมื่นวิชา", "grade": "TRANSCENDENT", "originType": "ASCENDED_LOWER_MASTER", "kw": "KW_DAO_MIRROR_ECHO", "minEqStage": 6, "lore": {"eraTh": "ยุคที่ 63 (ศ.ท. 62,412) · ยุคชุมนุมหอคัมภีร์ห้าสำนักและคืนแตกสลายงานประมูลเจ็ดตะเกียง", "regionId": "EASTERN_PLAINS", "inventorTh": "อาลักษณ์พเนจรที่รวบรวมบันทึกวิชาต่างสำนักข้ามสามชั่วคนก่อนบรรลุและข้ามม่านฟ้า", "adapterTh": "ศิษย์หอคัมภีร์ที่นำเศษบันทึกไม่ครบชุดมาต่อเติมเป็นเคล็ดกระจกนิ่ง", "competingAccountsTh": "หอคัมภีร์หลายแห่งต่างถือเศษสำเนาคนละบทและโต้เถียงกันว่าบทใดคือต้นฉบับก่อนอาจารย์ขึ้นสู่เบื้องบน", "discoverySources": ["บันทึกข้ามรุ่นหอคัมภีร์", "กระจกทองแดงจารึกอักขระ", "ศิษย์อาลักษณ์พเนจร"]}, "subpaths": [{"id": "TRANS_SUB_STILL_MIRROR", "nameTh": "กระจกนิ่งสะท้อนปราณ", "descTh": "รักษาจิตใจให้นิ่งดั่งผิวน้ำเพื่อสะท้อนส่วนหนึ่งของแรงโจมตีกลับคืน"}, {"id": "TRANS_SUB_VORTEX_SIPHON", "nameTh": "วังวนเบี่ยงกระแส", "descTh": "หมุนวนปราณเบี่ยงทิศทางแรงปะทะและฟื้นฟูปราณส่วนหนึ่งให้ตนเอง"}, {"id": "TRANS_SUB_LINEAGE_NOTE", "nameTh": "บันทึกวิถีข้ามรุ่น", "descTh": "ต่อยอดบทเรียนจากผู้ฝึกต่างรุ่นให้ประสานงานกันได้เกินกว่ากำลังคนเดียว"}, {"id": "TRANS_SUB_ELEMENT_MIMIC", "nameTh": "จำลองธาตุศัตรู", "descTh": "ปรับธาตุปราณตามการโจมตีล่าสุดที่พบเพื่อตอบโต้จุดอ่อนของศัตรู"}, {"id": "TRANS_SUB_SHATTER_GLASS", "nameTh": "กระจกแตกคืนรูป", "descTh": "จงใจสลายเกราะกระจกที่สะสมไว้ให้แตกเป็นคมแสงเจาะเกราะศัตรู"}]}, "TRANS_DYNASTIC_MANDATE_WEAVER": {"id": "TRANS_DYNASTIC_MANDATE_WEAVER", "nameTh": "วิถีทอชะตาแผ่นดิน", "grade": "TRANSCENDENT", "originType": "LOCAL_LOWER_HISTORY", "kw": "KW_DAO_MANDATE_THREAD", "minEqStage": 6, "lore": {"eraTh": "ยุคที่ 29–34 และยุควัฏจักรผลัดแผ่นดินหลังมหาจักรวรรดิเทียนกู่", "regionId": "CENTRAL_HEARTLAND", "inventorTh": "บัณฑิตสันโดษผู้รอดชีวิตจากการล่มสลายของสามอาณาจักรยุคหลังเทียนกู่", "adapterTh": "อาลักษณ์ราชสำนักและผู้ประคองราษฎร์ที่แปรบทเรียนประวัติศาสตร์เป็นวิถีบำเพ็ญ", "competingAccountsTh": "ราชสำนักบางแห่งเกรงว่าผู้ฝึกวิถีนี้จะแทรกแซงการเมือง แต่บันทึกเดิมย้ำชัดว่าวิถีนี้เป็นเพียงการอ่านกระแสโลกและประคองผู้คนมิใช่การยึดครองบัลลังก์", "discoverySources": ["พงศาวดารสามราชวงศ์", "ศาลากลางเมืองยามกลียุค", "บันทึกอาลักษณ์สันโดษ"]}, "subpaths": [{"id": "TRANS_SUB_COURT_CHRONICLER", "nameTh": "อาลักษณ์ชะตาราชสำนัก", "descTh": "บันทึกและวิเคราะห์ความเปลี่ยนแปลงของราชสำนัก เสริมความแม่นยำและการทูต"}, {"id": "TRANS_SUB_HEGEMON_BALANCE", "nameTh": "ตราชั่งคานมหาอำนาจ", "descTh": "ต้านทานศัตรูที่มีพลังเหนือกว่า ลดแรงกดดันจากฝ่ายที่บุกรุกเกินกำลัง"}, {"id": "TRANS_SUB_TURMOIL_SHEPHERD", "nameTh": "ผู้ประคองราษฎร์ยามกลียุค", "descTh": "ยิ่งแผ่นดินตกอยู่ในกลียุค ยิ่งเสริมความอึดและการคุ้มครองสหายได้แข็งแกร่ง"}, {"id": "TRANS_SUB_SECT_CORNERSTONE", "nameTh": "ศิลาฤกษ์สืบสำนัก", "descTh": "เป็นหลักยึดมั่นคงให้สำนัก ช่วยประคองขวัญและลดความแตกแยกภายใน"}, {"id": "TRANS_SUB_VEIL_WITNESS", "nameTh": "พยานขอบม่านฟ้า", "descTh": "เฝ้าสังเกตกฎเกณฑ์ขอบม่านฟ้าอย่างถ่อมตน เสริมสติปัญญาและเตรียมความพร้อมสู่ด่านทัณฑ์ฟ้า"}]}});
  const LD_IDS = Object.freeze(Object.keys(LD_PROVENANCE));
  const LD_LEG_IDS = Object.freeze(LD_IDS.filter(k => LD_PROVENANCE[k].grade === 'LEGENDARY'));
  const LD_TRANS_IDS = Object.freeze(LD_IDS.filter(k => LD_PROVENANCE[k].grade === 'TRANSCENDENT'));

  function detHash370(str) {
    let h = 2166136261 >>> 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }
  function detUnit370(str) { return (detHash370(str) % 10000) / 10000; }

  CULT.LEGENDARY_DAO = {
    VERSION: '3.7.0-legendary-dao',
    PROVENANCE: LD_PROVENANCE,
    PATH_IDS: LD_IDS,
    LEGENDARY_IDS: LD_LEG_IDS,
    TRANSCENDENT_IDS: LD_TRANS_IDS,

    gradeOf(pathId) {
      const p = LD_PROVENANCE[pathId];
      return p ? p.grade : 'ORDINARY';
    },

    gradeLabelTh(pathId) {
      const gr = CULT.LEGENDARY_DAO.gradeOf(pathId);
      return gr === 'TRANSCENDENT' ? 'เหนือตำนาน' : gr === 'LEGENDARY' ? 'ตำนาน' : 'สามัญ';
    },

    ensureWorldState(W) {
      if (!W || !W.world) return null;
      if (!W.world.legendaryDao || typeof W.world.legendaryDao !== 'object') {
        W.world.legendaryDao = {
          lastMonthTick: -1,
          discoveriesCount: 0,
          adoptionsCount: 0,
          declinesCount: 0,
          rippleEventsCount: 0,
          events: []
        };
      }
      if (!Array.isArray(W.world.legendaryDao.events)) W.world.legendaryDao.events = [];
      return W.world.legendaryDao;
    },

    recordEvent(W, textTh, kind, pathId) {
      const root = CULT.LEGENDARY_DAO.ensureWorldState(W);
      if (!root || !textTh) return;
      root.events.push({ day: (W && W.day) || 0, kind: kind || 'dao', pathId: pathId || null, textTh });
      if (root.events.length > 50) root.events.shift();
      if (W && W.log) W.log('cult', textTh, []);
    },

    // Step 1: Credible Discovery (opens an option; NEVER forces adoption!)
    recordDiscovery(W, npc, pathId, sourceKind, evidenceTh) {
      if (!W || !npc || !LD_PROVENANCE[pathId]) return false;
      if (!npc.daoDiscoveries || typeof npc.daoDiscoveries !== 'object') npc.daoDiscoveries = {};
      if (npc.daoDiscoveries[pathId]) return false;
      const prov = LD_PROVENANCE[pathId];
      npc.daoDiscoveries[pathId] = {
        pathId,
        grade: prov.grade,
        discoveredDay: W.day || 0,
        sourceKind: sourceKind || 'archive',
        evidenceTh: evidenceTh || (prov.lore.discoverySources && prov.lore.discoverySources[0]) || 'บันทึกโบราณ',
        decision: 'PENDING'
      };
      const root = CULT.LEGENDARY_DAO.ensureWorldState(W);
      if (root) root.discoveriesCount = (root.discoveriesCount || 0) + 1;
      CULT.LEGENDARY_DAO.recordEvent(
        W,
        '📜 ' + ((npc.h && npc.h.name && (npc.h.name.given || npc.h.name.full)) || npc.name || 'ศิษย์') + ' ค้นพบร่องรอย「' + prov.nameTh + '」(' + CULT.LEGENDARY_DAO.gradeLabelTh(pathId) + ') จาก' + npc.daoDiscoveries[pathId].evidenceTh,
        'discovery',
        pathId
      );
      return true;
    },

    // Step 2: 100% Autonomous Human-Core Evaluation (ADOPT / STUDY / DECLINE)
    evaluateNpcAdoption(W, npc, pathId) {
      if (!W || !npc || !LD_PROVENANCE[pathId]) return { decision: 'DECLINE', reasonTh: 'ข้อมูลไม่ครบถ้วน' };
      const prov = LD_PROVENANCE[pathId];
      const disc = npc.daoDiscoveries && npc.daoDiscoveries[pathId];
      if (!disc) return { decision: 'DECLINE', reasonTh: 'ยังไม่เคยพบหลักฐานหรือผู้ถ่ายทอดของวิถีนี้' };
      if (npc.cult && npc.cult.path === pathId) return { decision: 'ADOPT', reasonTh: 'กำลังบำเพ็ญวิถีนี้อยู่แล้ว' };

      const eqStage = (npc.cult && typeof CULT.equivalentStage === 'function') ? CULT.equivalentStage(npc.cult) : ((npc.cult && npc.cult.stage) || 1);
      const curGrade = npc.cult ? CULT.LEGENDARY_DAO.gradeOf(npc.cult.path) : 'ORDINARY';
      const hc = (typeof globalThis !== 'undefined' && globalThis.HC) || null;
      const eff = (k, fb) => (hc && typeof hc.eff === 'function' ? hc.eff(npc, k) : fb);

      const curiosity = eff('personality.curiosity', 50);
      const ambition = eff('personality.ambition', 50);
      const discipline = eff('personality.discipline', 50);
      const caution = eff('personality.caution', 50);
      const comp = eff('intellect.comprehension', 50);

      // Gate: Transcendent requires mature cultivation (eqStage >= 6); Legendary >= 4 (or rare prodigy >= 3 with manual)
      const earlyOpening = prov.grade === 'LEGENDARY' && disc.sourceKind === 'manual' && comp >= 68;
      const reqStage = earlyOpening ? 3 : prov.minEqStage;
      if (eqStage < reqStage) {
        disc.decision = 'STUDY';
        return { decision: 'STUDY', reasonTh: 'ตบะยังไม่ถึงระดับที่รองรับหลักการของ「' + prov.nameTh + '」(ต้องเทียบเท่าขั้น ' + reqStage + ') จึงเก็บไว้ศึกษาต่อ' };
      }

      // Opportunity cost: switching away from a high-stage ordinary/legendary path is costly for cautious NPCs
      const switchCost = (curGrade === 'TRANSCENDENT' ? 35 : curGrade === 'LEGENDARY' ? 22 : 0) + Math.max(0, eqStage - reqStage) * 4 + caution * 0.25;
      const drive = curiosity * 0.35 + ambition * 0.30 + discipline * 0.25 + comp * 0.30 + (prov.grade === 'TRANSCENDENT' ? 10 : 6);
      const root = CULT.LEGENDARY_DAO.ensureWorldState(W);

      if (drive < switchCost + 18) {
        disc.decision = 'DECLINE';
        if (root) root.declinesCount = (root.declinesCount || 0) + 1;
        const reasonTh = ((npc.h && npc.h.name && (npc.h.name.given || npc.h.name.full)) || npc.name || 'ศิษย์') + ' พิจารณาแล้วเลือกปฏิเสธ「' + prov.nameTh + '」เพื่อรักษารากฐานวิถีเดิมที่ลงทุนฝึกฝนมา';
        CULT.LEGENDARY_DAO.recordEvent(W, '⚖️ ' + reasonTh, 'decline', pathId);
        return { decision: 'DECLINE', reasonTh };
      }

      // Autonomous Adoption: clean path transition matching retraining.js invariants
      const subList = (CULT.PATHS[pathId] && CULT.PATHS[pathId].subPaths) || [];
      const pickSub = subList.length ? subList[detHash370(String(W.seed || 's') + ':' + npc.id + ':' + pathId) % subList.length] : null;
      const nextStage = Math.max(1, Math.min(8, Math.round(eqStage * 0.85)));
      if (!npc.cult) npc.cult = { path: pathId, sub: pickSub ? pickSub.id : 'NONE', stage: nextStage, prog: 0, techs: [], toxic: 0, attempts: 0 };
      else {
        npc.cult.prevPath = npc.cult.path;
        npc.cult.path = pathId;
        npc.cult.sub = pickSub ? pickSub.id : 'NONE';
        npc.cult.stage = nextStage;
        npc.cult.prog = 0;
        delete npc.cult.track;
        delete npc.cult.mantra;
      }
      // Clean up legacy path-specific runtime states
      delete npc.mechState;
      delete npc.karmaState;
      delete npc.pathGauge;
      delete npc.demonicRealmsGauge;
      delete npc.grandDaoState;
      if (typeof CULT.bestMantra === 'function') {
        const bm = CULT.bestMantra(pathId, nextStage, npc);
        if (bm) npc.cult.mantra = bm.id || bm;
      }
      if (typeof CULT.ensurePathGauge === 'function') CULT.ensurePathGauge(npc);
      const M = (g && g.MARTIAL) || null;
      if (M) {
        if (npc.equip && typeof M.gearUsable === 'function') {
          for (const sl of Object.keys(npc.equip)) {
            if (npc.equip[sl] && !M.gearUsable(npc, npc.equip[sl])) npc.equip[sl] = null;
          }
        }
        if (typeof M.reconcileInnate === 'function') M.reconcileInnate(npc, W);
        if (typeof M.reconcilePassives === 'function') M.reconcilePassives(npc);
        if (typeof M.invalidateMartialCaches === 'function') M.invalidateMartialCaches(npc);
      }
      if (typeof CULT.refreshLifespan === 'function') CULT.refreshLifespan(npc);
      if (g && g.STATS && typeof g.STATS.dirty === 'function') g.STATS.dirty(npc);
      disc.decision = 'ADOPT';
      disc.adoptedDay = W.day || 0;
      if (root) root.adoptionsCount = (root.adoptionsCount || 0) + 1;
      const npcDispName = (npc.h && npc.h.name && (npc.h.name.given || npc.h.name.full)) || npc.name || 'ศิษย์';
      const reasonTh = npcDispName + ' ตัดสินใจหันมาบำเพ็ญ「' + prov.nameTh + '」(' + (pickSub ? pickSub.nameTh : '') + ') หลังประเมินความสอดคล้องและหลักฐานจริง';
      CULT.LEGENDARY_DAO.recordEvent(W, '🌟 ' + reasonTh, 'adopt', pathId);
      return { decision: 'ADOPT', reasonTh, subId: pickSub ? pickSub.id : null };
    },

    // Step 3: Monthly Pure-Deterministic Discovery & Multi-Layer World Ripples (Zero W.rng!)
    tickMonthlyDiscoveryAndRipples(W, opts) {
      opts = opts || {};
      const day = (W && W.day) || 0;
      if (!opts.force && day < 30) return (W && W.world && W.world.legendaryDao) || null;
      const root = CULT.LEGENDARY_DAO.ensureWorldState(W);
      if (!root) return null;
      const monthIdx = Math.floor(day / 30);
      if (!opts.force && monthIdx <= root.lastMonthTick) return root;
      root.lastMonthTick = monthIdx;
      const seed = String(W.seed || 'seed');
      const living = (W.npcs || []).filter(n => n && !n.dead && !n.exiled);

      // A. Activity-gated credible discovery scan (requires real expedition, lore study, or mature mastery!)
      const existingHighGrade = living.filter(n => n.cult && LD_PROVENANCE[n.cult.path]).length;
      if (existingHighGrade < Math.max(2, Math.floor(living.length * 0.22)) && detUnit370(seed + ':ld_disc:m' + monthIdx) < 0.24) {
        const candidates = living.filter(n => {
          if (!n.cult || CULT.equivalentStage(n.cult) < 4) return false;
          const hasExp = (n.expCount || 0) > 0 || (n.lastTrip && n.lastTrip > 0);
          const hasLore = (n.loreKnowledge && Object.keys(n.loreKnowledge).length > 0) || (n.readCount || 0) > 0;
          return hasExp || hasLore || CULT.equivalentStage(n.cult) >= 6;
        });
        if (candidates.length > 0) {
          const npc = candidates[detHash370(seed + ':ld_npc:m' + monthIdx) % candidates.length];
          const eq = CULT.equivalentStage(npc.cult);
          const pool = eq >= 6 ? LD_IDS : LD_LEG_IDS;
          const pid = pool[detHash370(seed + ':ld_pid:m' + monthIdx + ':' + npc.id) % pool.length];
          const srcKind = ((npc.expCount || 0) > 0 || (npc.lastTrip && npc.lastTrip > 0)) ? 'expedition_lore' : 'archive';
          if (CULT.LEGENDARY_DAO.recordDiscovery(W, npc, pid, srcKind)) {
            CULT.LEGENDARY_DAO.evaluateNpcAdoption(W, npc, pid);
          }
        }
      }

      // B. Multi-Layer World Ripples from Active High-Grade Practitioners (Dynamic home polity!)
      const homePolityId = (W.sect && W.sect.homePolityId) || 'POL_YUNHE';
      const homeCourt = W.world && W.world.continent && W.world.continent.courts && W.world.continent.courts[homePolityId];
      let ashenSalvagers = 0, mandateWeavers = 0, oathJudges = 0, caravanVoyagers = 0;
      for (const n of living) {
        if (!n.cult) continue;
        const p = n.cult.path;
        const eq = CULT.equivalentStage(n.cult);
        if (p === 'LEG_ASHEN_KILN_ALCHEMY') ashenSalvagers++;
        if (p === 'TRANS_DYNASTIC_MANDATE_WEAVER' && eq >= 6) mandateWeavers++;
        if (p === 'LEG_OATH_JUDGE_WARDEN') oathJudges++;
        if (p === 'LEG_JADE_CARAVAN_VOYAGER') caravanVoyagers++;
      }

      // Ripple 1 (Custom Dao #1): Ashen Kiln Alchemists salvage turmoil shortages (closed-loop from resourcePool + ledger)
      if (ashenSalvagers > 0 && W.sect && homeCourt) {
        const inTurmoil = homeCourt.livingPolity && (homeCourt.livingPolity.era === 'TURMOIL' || homeCourt.livingPolity.era === 'DECLINING');
        if (inTurmoil && Number.isFinite(W.sect.stones)) {
          const saved = Math.min(18, ashenSalvagers * 6);
          if (W.world.resourcePool && W.world.resourcePool.stones >= saved) {
            W.world.resourcePool.stones -= saved;
            W.sect.stones += saved;
            if (Array.isArray(W.sect.ledger)) W.sect.ledger.push({ day, kind: 'income', amt: saved, note: 'กู้คืนศิลาจากเตาเถ้าคืนชีวิต' });
            root.rippleEventsCount = (root.rippleEventsCount || 0) + 1;
          }
        }
      }

      // Ripple 2 (Custom Dao #2): Dynastic Mandate Weavers stabilize local polity legitimacy & home sect morale
      if (mandateWeavers > 0) {
        if (homeCourt && homeCourt.livingPolity) {
          homeCourt.livingPolity.legitimacy = Math.min(100, Math.round((homeCourt.livingPolity.legitimacy + Math.min(0.8, mandateWeavers * 0.4)) * 10) / 10);
        }
        if (W.sect && Number.isFinite(W.sect.morale)) {
          W.sect.morale = Math.min(100, Math.round((W.sect.morale + Math.min(1.5, mandateWeavers * 0.7)) * 10) / 10);
        }
        root.rippleEventsCount = (root.rippleEventsCount || 0) + 1;
      }

      // Ripple 3: Oath Judge Wardens calm internal sect stress & grudge friction
      if (oathJudges > 0) {
        let calmed = 0;
        for (const n of living) {
          if (n.h && n.h.state && Number.isFinite(n.h.state.stress) && n.h.state.stress > 40) {
            n.h.state.stress = Math.max(0, n.h.state.stress - Math.min(2.5, oathJudges * 1.2));
            calmed++;
          }
        }
        if (calmed > 0) root.rippleEventsCount = (root.rippleEventsCount || 0) + 1;
      }

      // Ripple 4: Jade Caravan Voyagers improve sect caravan & expedition supply endurance
      if (caravanVoyagers > 0 && W.sect) {
        W.sect.caravanSupplyEfficiency = Math.min(0.25, caravanVoyagers * 0.06);
        root.rippleEventsCount = (root.rippleEventsCount || 0) + 1;
      }
      return root;
    },

    peekSummary(W) {
      const root = W && W.world && W.world.legendaryDao;
      const living = (W && W.npcs || []).filter(n => n && !n.dead && !n.exiled);
      const legCount = living.filter(n => n.cult && CULT.LEGENDARY_DAO.gradeOf(n.cult.path) === 'LEGENDARY').length;
      const transCount = living.filter(n => n.cult && CULT.LEGENDARY_DAO.gradeOf(n.cult.path) === 'TRANSCENDENT').length;
      const last = root && root.events && root.events.length ? root.events[root.events.length - 1] : null;
      return {
        legCount,
        transCount,
        discoveriesCount: (root && root.discoveriesCount) || 0,
        adoptionsCount: (root && root.adoptionsCount) || 0,
        declinesCount: (root && root.declinesCount) || 0,
        rippleEventsCount: (root && root.rippleEventsCount) || 0,
        recentTh: last ? last.textTh : ''
      };
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : this);
