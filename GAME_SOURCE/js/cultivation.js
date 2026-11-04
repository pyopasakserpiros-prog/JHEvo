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
      const ep = def.elementProfile;
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

  const ASTRAL_SUBS = new Set(['ASTRAL_ARRAY', 'TIME_VOID', 'FATE_ORACLE', 'MIND_SWORD_TELEKINESIS', 'STAR_ARCHER', 'VOID_SPEAR_MIND', 'ASTRAL_CLOCKWORK_PRIME', 'PAST_LIFE_MIRROR', 'SEAL_SCRIPT_EXORCIST', 'QIMEN_TALISMAN_PATRON', 'CELESTIAL_ZITHER_ENVOY']);
  const BLOOD_SUBS = new Set(['BLOOD_DEMON', 'BLOOD_DRAGON', 'DEVOURING_FIEND', 'HEAVEN_DEVOURING_DEMON', 'BLOOD_SPEAR_ASURA', 'PRIMORDIAL_BLOOD_MUTATOR']);

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
      if (c.path === 'ARRAY_TALISMAN') astralSources.add('PATH:ARRAY_TALISMAN');
      if (ASTRAL_SUBS.has(c.sub)) astralSources.add('SUBPATH:' + c.sub);
      if (c.path === 'DEMON') bloodSources.add('PATH:DEMON');
      if (BLOOD_SUBS.has(c.sub)) bloodSources.add('SUBPATH:' + c.sub);
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
    if (npc.h.constitution === 'CON_STAR_MARROW' || npc.h.constitution === 'CON_VOID_SPIRIT') {
      astralSources.add('CONSTITUTION:' + npc.h.constitution);
    }
    if (npc.h.constitution === 'CON_BLOOD_FIEND' || npc.h.constitution === 'CON_ASURA_WAR') {
      bloodSources.add('CONSTITUTION:' + npc.h.constitution);
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
      const specialMastery = {
        ASTRAL: (npc.cult && ASTRAL_SUBS.has(npc.cult.sub)) ? clamp(8 + (npc.cult.stage || 1) * 4, 5, 55) : 0,
        BLOOD_DEMON: (npc.cult && (npc.cult.path === 'DEMON' || BLOOD_SUBS.has(npc.cult.sub))) ? clamp(8 + (npc.cult.stage || 1) * 4, 5, 55) : 0
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
      resetNpcCache(npc);
      npc._cultRateBase = null;
      sys._mVer = (sys._mVer || 0) + 1;
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
    context = context || 'COMBAT_SKILL';
    if (!npc || npc.foe || !npc.h) return NEUTRAL_COMPAT_RESULT;

    const prof = ELEM.getProfile(targetDef);
    if (prof.valid && (prof.mode === "EXPLICIT_NON_ELEMENTAL" || prof.mode === "ROOT_AGNOSTIC_UTILITY" || prof.primary === "NEUTRAL")) return NEUTRAL_COMPAT_RESULT;
    ELEM.ensureNpc(npc);
    const _ec = getNpcCache(npc);
    const targetKey = (typeof targetDef === "string") ? targetDef : (targetDef && (targetDef.id || targetDef.sub || targetDef.outItemId || targetDef.key || targetDef.nameTh)) || null;
    if (targetKey) {
      const hit = _ec.compat[targetKey + ":" + context];
      if (hit) return hit;
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
    const origTraitDef = HC.traitDef;
    HC.traitDef = id => {
      const d = origTraitDef ? origTraitDef(id) : null;
      if (d) return d;
      return (JD.CORE && JD.CORE.rootCapacityTraits && JD.CORE.rootCapacityTraits[id]) || null;
    };
    const origTraitMods = HC.traitMods;
    HC.traitMods = (id, lv) => {
      if (JD.CORE && JD.CORE.rootCapacityTraits && JD.CORE.rootCapacityTraits[id]) {
        return [];
      }
      return origTraitMods ? origTraitMods(id, lv) : [];
    };
    const origGenerate = HC.generate;
    HC.generate = (rng, opts) => {
      const npc = origGenerate(rng, opts);
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
  CULT.THRESH = {
    XIAN: [260, 700, 1800, 4500, 11000, 27000, 65000, 150000],
    BODY: [230, 800, 3200, 12000],
    GOD: [300, 1200, 5200],
    DEMON: [240, 650, 1680, 4200, 10400, 25500, 61500, 142000],
    HEART_SOUL: [250, 680, 1750, 4400, 10800, 26500, 63500, 146000],
    MECH_PUPPET: [245, 670, 1720, 4350, 10700, 26200, 63000],
    KARMA_SAMSARA: [250, 680, 1740, 4400, 10800, 26400, 63500],
    BEAST_SOVEREIGN: [245, 675, 1730, 4380, 10750, 26300, 63200],
    SAGE_SUPPORT: [245, 670, 1720, 4350, 10700, 26200, 63000],
    CRAFT_CREATION: [245, 670, 1720, 4350, 10700, 26200, 63000],
    ARRAY_TALISMAN: [250, 680, 1740, 4400, 10800, 26400, 63500],
    STRATEGY_GOVERNANCE: [250, 680, 1740, 4400, 10800, 26400, 63500]
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
      STRATEGY_GOVERNANCE: (HC.eff(npc, 'intellect.planning') + HC.eff(npc, 'intellect.judgement') + HC.eff(npc, 'social.leadership') + HC.eff(npc, 'interests.leading')) * 0.2 + HC.eff(npc, 'aptitudes.command') * 0.4
    };
    const rootCount = (npc.h && npc.h.root && npc.h.root.rootCount) || 1;
    CULT.subList.forEach(({ path, sub }) => {
      const pref = SUBPREF[sub.id] || (JD.EXPANSION.subPreferences || {})[sub.id] || (JD.MARTIAL.subPreferences || {})[sub.id] || { aff: {}, p: {} };
      let s = base[path] || 0;
      Object.keys(pref.aff).forEach(k => {
        // Legacy content used weapon/astral labels that are not HC affinity keys.
        const affinity = ({ BOW: 'SWORD', STAFF: 'SPEAR', ASTRAL: 'SCRIPTURE' })[k] || k;
        s += (HC.eff(npc, 'affinities.' + affinity) - 30) * pref.aff[k] * 0.45;
      });
      Object.keys(pref.p).forEach(k => { const w = pref.p[k]; s += (w >= 0 ? pval(npc, k) - 50 : 50 - pval(npc, k)) * Math.abs(w) * 0.4; });
      const elemComp = ELEM.resolveCompatibility(npc, sub, 'SUBPATH_SELECT');
      let elemScore = elemComp.aiPreferenceScore * 0.28;
      if (sub.id === 'FIVE_ELEMENTS' && rootCount >= 3) elemScore += (rootCount - 2) * 5.5;
      else if (sub.id === 'YIN_YANG_HARMONY' && rootCount >= 2 && npc.h.root.elements.includes('LIGHT_YANG') && npc.h.root.elements.includes('YIN_SHADOW')) elemScore += 7.5;
      s += elemScore;
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
    SOUL_MUSICIAN: 'SOUND_ZITHER',
    ILLUSION_MIND: 'DREAM_ILLUSION_WEAVER',
    CHANT_RESONANCE: 'ZEN_VOID_MIND',
    GRAND_STRATEGIST: 'BATTLEFIELD_STRATEGIST',
    GRAND_FORMATION_ARCHITECT: 'EARTH_VEIN_WARDEN',
    UNDERWORLD_DECREE: 'UNDERWORLD_JUDGE',
    SPIRIT_THREAD_PUPPET: 'THOUSAND_THREAD_ASSASSIN',
    PACK_COMMAND_HUNT: 'MYRIAD_BEAST_PACK',
    REINCARNATION_WARDEN: 'SIX_PATHS_WHEEL',
    ASTRAL_LEVIATHAN_KRAKEN: 'ABYSSAL_DRAGON_TOTEM',
    BLOOD_FURNACE: 'DEVOURING_FIEND',
    BEAST_BLOOD_FUSION: 'SYMBIOTIC_BEAST_WARRIOR',
    TIDAL_WATER_MIRROR: 'FROST_MOON_IMMORTAL',
    LIGHTNING_TEMPERED_BODY: 'THUNDER_BODY',
    THUNDER_PUNISHMENT_ENVOY: 'THUNDER_TALISMAN_ADEPT',
    WIND_SHADOW_ROAMER: 'SHADOW_ASSASSIN',
    DIVINE_FORGE_FOUNDER: 'HEAVENLY_ANVIL_SMITH',
    BATTLE_ARRAY_TACTICIAN: 'BATTLEFIELD_STRATEGIST',
    BLOOD_SEA_FIEND: 'BLOOD_DEMON',
    PILL_FLAME_SOVEREIGN: 'PILL_FURNACE_IMMORTAL',
    IMPERIAL_PEACE_SOVEREIGN: 'SECT_STEWARD'
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
    return Math.max(st, mapped, trOrd);
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
    const c = npc.cult; if (!c) return Math.round(HC.mortalLifespan(npc));
    let life = CULT.PATHS[c.path].stages[c.stage - 1].lifespanMax + (c.lifeBonus || 0);
    if (c.track) {
      const trRealm = CULT.trackRealm(npc);
      if (trRealm && trRealm.lifespanMax > life) life = trRealm.lifespanMax + (c.lifeBonus || 0);
    }
    return life;
  };
  CULT.refreshLifespan = npc => { npc.lifespanMax = CULT.lifespan(npc); HC.touch(npc); };
  CULT.hpMult = npc => {
    if (!npc || !npc.cult) return 1;
    const ns = CULT.normalizedStage(npc);
    const pathAdd = npc.cult.path === "BODY" ? 0.09 * (ns - 1) : npc.cult.path === "GOD" ? 0.11 * (ns - 1) : npc.cult.path === "BEAST_SOVEREIGN" ? 0.07 * (ns - 1) : (npc.cult.path === "MECH_PUPPET" || npc.cult.path === "KARMA_SAMSARA" || npc.cult.path === "SAGE_SUPPORT" || npc.cult.path === "CRAFT_CREATION" || npc.cult.path === "ARRAY_TALISMAN" || npc.cult.path === "STRATEGY_GOVERNANCE") ? 0.05 * (ns - 1) : 0;
    return 1 + 0.42 * (ns - 1) + 0.25 + pathAdd;
  };
  CULT.hpMax = npc => {
    const c = npc.cult, cPath = c ? c.path : '', cSub = c ? c.sub : '', cSt = c ? c.stage : 0, cTr = c && c.track ? c.track.ordinal : 0, hc = npc._hpMaxCache;
    if (hc && hc.day === HC.nowDay && hc.ver === npc._ver && hc.pver === (npc._passVer || 0) && hc.path === cPath && hc.sub === cSub && hc.st === cSt && hc.tr === cTr) return hc.val;
    const val = Math.round((g.MARTIAL ? g.MARTIAL.derived(npc) : HC.derived(npc)).hpMax * CULT.hpMult(npc));
    npc._hpMaxCache = { day: HC.nowDay, ver: npc._ver, pver: npc._passVer || 0, path: cPath, sub: cSub, st: cSt, tr: cTr, val };
    return val;
  };

  const TECH_BY_ID = {}, MOVE_PARENT_BY_ID = {};
  JD.TECH.techniques.forEach(t => { TECH_BY_ID[t.id] = t; if (Array.isArray(t.moveDefs)) t.moveDefs.forEach(m => { MOVE_PARENT_BY_ID[m.id] = t; }); });
  JD.TECH.mantras.forEach(t => { TECH_BY_ID[t.id] = t; if (Array.isArray(t.moveDefs)) t.moveDefs.forEach(m => { MOVE_PARENT_BY_ID[m.id] = t; }); });
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
    const c = npc.cult, qc = npc._qiMaxCache;
    if (qc && qc.cult === c && qc.path === c.path && qc.sub === c.sub && qc.st === c.stage && qc.mantra === c.mantra && qc.ver === npc._ver && qc.pver === (npc._passVer || 0)) return qc.val;
    const ns = CULT.normalizedStage(npc);
    const base = (40 + (g.MARTIAL ? g.MARTIAL.eff(npc, 'physiology.meridianCapacity') : HC.eff(npc, 'physiology.meridianCapacity')) * 0.9) * (1 + 0.5 * (ns - 1));
    const pass = g.MARTIAL && g.MARTIAL.passiveStats ? g.MARTIAL.passiveStats(npc) : null;
    const inn = g.MARTIAL && g.MARTIAL.innateStats ? g.MARTIAL.innateStats(npc) : null;
    const m = c.mantra ? TECH_BY_ID[c.mantra] : null;
    const pct = (pass ? (pass.qiMaxPct || 0) : 0) + (inn ? (inn.qiMaxPct || 0) : 0) + (m && m.mantraBonus && m.mantraBonus.qiMaxPct ? m.mantraBonus.qiMaxPct : 0);
    const flat = (pass ? (pass.qiMaxFlat || 0) : 0) + (inn ? (inn.qiMaxFlat || 0) : 0);
    const val = Math.max(1, Math.round(base * (1 + pct) + flat));
    npc._qiMaxCache = { cult: c, path: c.path, sub: c.sub, st: c.stage, mantra: c.mantra, ver: npc._ver, pver: npc._passVer || 0, val };
    return val;
  };
  CULT.speedMult = npc => npc.cult ? 1 + 0.05 * (npc.cult.stage - 1) : 1;

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
  CULT.mantraPool = path => JD.TECH.mantras.filter(m => m.path === path).concat(JD.TECH.techniques.filter(t => /_MANTRA$/.test(t.cat) && t.path === path).map(t => ({ id: t.id, nameTh: t.nameTh, path: t.path, tier: t.tier, power: t.power, element: t.element, elementProfile: t.elementProfile, legendary: !!t.legendary })));
  CULT.bestMantra = (path, maxTier, npc) => {
    const unlocked = npc && npc.cult && Array.isArray(npc.cult.unlockedMantras) ? npc.cult.unlockedMantras : [];
    const effMax = (npc && npc.cult && npc.cult.path === path && CULT.effectiveTechStage) ? Math.max(maxTier || 1, CULT.effectiveTechStage(npc)) : (maxTier || 1);
    let pool = CULT.mantraPool(path).filter(m => m.tier <= effMax && (!m.legendary || unlocked.includes(m.id)));
    if (!pool.length && path === 'GOD') {
      pool = CULT.mantraPool(path).filter(m => m.tier <= 2 && (!m.legendary || unlocked.includes(m.id)));
    }
    if (npc && npc.h) {
      pool.sort((a, b) => {
        const ca = ELEM.resolveCompatibility(npc, TECH_BY_ID[a.id] || a, 'MANTRA_PRACTICE').cultivationMultiplier;
        const cb = ELEM.resolveCompatibility(npc, TECH_BY_ID[b.id] || b, 'MANTRA_PRACTICE').cultivationMultiplier;
        const effA = (a.tier * 100 + a.power) * (0.75 + 0.25 * ca);
        const effB = (b.tier * 100 + b.power) * (0.75 + 0.25 * cb);
        return effB - effA;
      });
    } else {
      pool.sort((a, b) => b.tier - a.tier || b.power - a.power);
    }
    return pool[0] || null;
  };

  /* ----- อัตราบำเพ็ญ (แต้มต่อชั่วโมงเกม) ----- */
  CULT.rate = (npc, env) => {
    const c = npc.cult; if (!c) return 0;
    let staticBase;
    let rc = npc._cultRateBase;
    const ritVal = npc.h.skills.ritual || 0, focVal = npc.h.intellect.focus || 0;
    const professionSig = c.path === 'ARRAY_TALISMAN' ? ((npc.h.skills.ARRAY | 0) * 256 + (npc.h.skills.TALISMAN | 0)) : c.path === 'STRATEGY_GOVERNANCE' ? ((npc.h.skills.administration | 0) * 65536 + (npc.h.skills.diplomacy | 0) * 256 + (npc.h.skills.trading | 0)) : 0;
    if (rc && rc.skillVer === (npc._pathSkillVersion || 0) && rc.professionSig === professionSig && rc.day === HC.nowDay && rc.ver === npc._ver && rc.pver === (npc._passVer || 0) && rc.path === c.path && rc.sub === c.sub && rc.st === c.stage && rc.mantra === c.mantra) {
      if (rc.rit === ritVal && rc.foc === focVal && rc.fullVal !== undefined) {
        staticBase = rc.fullVal;
      } else {
        const focus = 0.65 + 0.35 * HC.eff(npc, 'intellect.focus') / 100;
        const ritMult = g.MARTIAL ? g.MARTIAL.skillEffects(npc).cultivation : 1;
        rc.rit = ritVal; rc.foc = focVal;
        staticBase = rc.fullVal = rc.val * ritMult * focus;
      }
    } else {
      ELEM.ensureNpc(npc);
      const d = HC.derived(npc);
      const talent = clamp(d.cultivationTalent / 62, 0.35, 2.4);
      const root = HC.ROOT_BY_ID[npc.h.root.grade] || HC.ROOT_BY_ID.MORTAL;
      let base;
      if (c.path === 'XIAN') base = 1.0 * talent * root.cultivationMult;
      else if (c.path === 'BODY') base = 0.9 * clamp((HC.eff(npc, 'physiology.strength') + HC.eff(npc, 'physiology.toughness') + HC.eff(npc, 'physiology.endurance') + HC.eff(npc, 'aptitudes.cultivation')) / 4 / 55, 0.35, 2.2) * (0.8 + 0.4 * root.bodySynergy);
      else if (c.path === 'DEMON') {
        const demonApt = (d.cultivationTalent * 0.45 + HC.eff(npc, 'personality.ambition') * 0.25 + HC.eff(npc, 'personality.aggression') * 0.15 + Math.max(HC.eff(npc, 'affinities.YIN_SHADOW'), HC.eff(npc, 'affinities.POISON')) * 0.15) / 55;
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
      } else if (c.path === 'STRATEGY_GOVERNANCE') {
        const civicSkill = Math.max(npc.h.skills.administration || 0, npc.h.skills.diplomacy || 0, npc.h.skills.trading || 0);
        const civicApt = (HC.eff(npc, 'intellect.planning') * 0.25 + HC.eff(npc, 'intellect.judgement') * 0.20 + HC.eff(npc, 'social.leadership') * 0.20 + HC.eff(npc, 'values.sectDuty') * 0.15 + civicSkill * 0.25) / 54;
        base = 0.99 * clamp(civicApt, 0.40, 2.38) * (0.90 + 0.16 * root.cultivationMult);
      } else {
        base = 0.94 * clamp((HC.eff(npc, 'social.charisma') * 0.35 + HC.eff(npc, 'intellect.willpower') * 0.35 + HC.eff(npc, 'aptitudes.cultivation') * 0.30) / 54, 0.38, 2.35) * (0.88 + 0.18 * root.cultivationMult);
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
    let toxic, dev;
    const hd = npc.h.state.heartDemon || 0;
    if (c.path === 'DEMON') {
      toxic = 1 - clamp(c.toxic / (c.sub === 'VENOM_GU_SOVEREIGN' ? 360 : 240), 0, 0.28);
      dev = hd <= 60 ? (1 + (hd / 60) * 0.22) : Math.max(0.55, 1.22 - ((hd - 60) / 40) * 0.65);
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
    const imprintMult = (npc.mentorImprint && Number.isFinite(npc.mentorImprint.cultRateBonus)) ? (1 + npc.mentorImprint.cultRateBonus) : 1;
    const compId = npc.companionId || (npc.h && npc.h.companionId);
    const compMult = compId ? (1 + (Number.isFinite(npc.companionSynergyBonus) ? npc.companionSynergyBonus : 0.25)) : 1;
    const bloodMult = (npc.bloodlineTrait && Number.isFinite(npc.bloodlineTrait.cultRateBonus)) ? (1 + npc.bloodlineTrait.cultRateBonus) : 1;
    return staticBase * rest * toxic * dev * pill * buffMult * imprintMult * compMult * bloodMult * (env || 1);
  };
  CULT.hasActiveCompanionInSect = (npc, W) => {
    if (!npc) return false;
    const compId = npc.companionId || (npc.h && npc.h.companionId);
    if (!compId) return false;
    if (!W || !W.byId) return true;
    const partner = W.byId[compId];
    return !!(partner && !partner.dead && !partner.exiled);
  };
  CULT.gain = (npc, pts, W, sourceTag) => {
    const c = npc.cult; if (!c) return;
    const ascendedCount = (W && W.sect && W.sect.ascendedLegacyCount > 0 && W.byId && W.byId[npc.id] === npc) ? W.sect.ascendedLegacyCount : 0;
    if (ascendedCount) pts *= 1 + Math.min(5, ascendedCount) * 0.01;
    if (CULT.hasActiveCompanionInSect(npc, W) && sourceTag !== 'dual_cult_raw') {
      const synBonus = Number.isFinite(npc.companionSynergyBonus) ? npc.companionSynergyBonus : 0.25;
      pts *= (1 + synBonus);
      if (npc.h && npc.h.state && (npc.h.state.heartDemon || 0) > 0) {
        npc.h.state.heartDemon = Math.max(0, npc.h.state.heartDemon - 1.5);
      }
    }
    if (npc.bloodlineTrait && Number.isFinite(npc.bloodlineTrait.cultRateBonus) && sourceTag !== 'bloodline_raw') {
      pts *= (1 + npc.bloodlineTrait.cultRateBonus);
    }
    const th = CULT.threshold(npc);
    if (c.prog >= th) { c.found = Math.min(0.08, (c.found || 0) + pts * 0.0002); pts *= 0.15; }
    c.prog += pts;
    if (c.prog > th * 1.25) c.prog = th * 1.25;

    const tr = c.track;
    if (tr) {
      const trTh = CULT.trackThreshold(npc);
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
    const f_body = 0.7 + d.physicalIndex / 100 * 0.6;
    const sk = npc.h.skills; const martial = Math.max(sk.SWORD || 0, sk.BLADE || 0, sk.SPEAR || 0, sk.FIST_PALM || 0, sk.BOW || 0, sk.STAFF || 0, sk.FOCUS || 0, sk.ZITHER || 0, sk.BRUSH || 0, sk.WHIP || 0, sk.BODY_REFINING || 0, sk.SOUL_DIVINE || 0, sk.POISON || 0, sk.BEAST_TAMING || 0, sk.FORGING || 0, sk.ALCHEMY || 0, sk.MEDICINE || 0, sk.ARRAY || 0, sk.TALISMAN || 0, sk.SCRIPTURE || 0, sk.administration || 0, sk.diplomacy || 0);
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
    const wSpiritMult = (npc.equip && npc.equip.WEAPON && npc.equip.WEAPON.weaponSpirit && Number.isFinite(npc.equip.WEAPON.weaponSpirit.multBonus))
      ? (1 + Math.min(0.32, npc.equip.WEAPON.weaponSpirit.multBonus))
      : 1;
    const titleMult = (Array.isArray(npc.assemblyTitles) && npc.assemblyTitles.length)
      ? (1 + Math.min(0.18, npc.assemblyTitles.length * 0.06))
      : 1;
    cp = cp * f_body * f_skill * f_tech * (1 + eq) * HC.special(npc, 'combat.powerMult') * f_state * f_mind * petMult * bloodPowerMult * scarPowerMult * wSpiritMult * titleMult;
    return Math.max(3, cp);
  };
  CULT.defenseMult = npc => { let d = 0; const E = npc.equip || {}; for (const k in E) if (E[k] && E[k].defMult) d += E[k].defMult; return 1 + d; };

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
    const hd = npc.h.state.heartDemon || 0;
    if (c.path === 'DEMON') {
      p += (HC.eff(npc, 'personality.ambition') - 50) / 50 * 0.05;
      p -= (hd <= 55 ? hd / 100 * 0.10 : (0.055 + (hd - 55) / 100 * 0.38)) + c.toxic / 100 * 0.08;
    } else if (c.path === 'HEART_SOUL') {
      p += (HC.eff(npc, 'intellect.comprehension') - 50) / 50 * 0.06 + (HC.eff(npc, 'personality.composure') - 50) / 50 * 0.04;
      p -= hd / 100 * 0.32 + c.toxic / 100 * 0.15;
    } else {
      p -= hd / 100 * 0.25 + c.toxic / 100 * 0.15;
    }
    if (g.BN) p += g.BN.chanceMod(npc);
    if (CULT.isAncestralBlessingActive(npc, prep && Number.isFinite(prep.now) ? prep.now : null)) p += (npc.ancestralBlessing.breakthroughBonus || 0);
    if (CULT.petBreakthroughBonus) p += CULT.petBreakthroughBonus(npc);
    if (g.STATS && g.STATS.hasBuff && (g.STATS.hasBuff(npc, "meridianUnblock", prep && prep.now) || g.STATS.hasBuff(npc, "clarityLotus", prep && prep.now) || g.STATS.hasBuff(npc, "mentorGuidance", prep && prep.now))) p += 0.06;
    if (npc.mentorImprint && Number.isFinite(npc.mentorImprint.btBonus)) p += npc.mentorImprint.btBonus;
    if (npc.companionId || (npc.h && npc.h.companionId)) p += 0.06;
    if (npc.bloodlineTrait && Number.isFinite(npc.bloodlineTrait.btBonus)) p += npc.bloodlineTrait.btBonus;
    if (Array.isArray(npc.daoScars) && npc.daoScars.length) {
      const scarBonus = npc.daoScars.reduce((sum, sc) => sum + (sc && sc.btBonus ? sc.btBonus : 0.05), 0);
      p += Math.min(0.18, scarBonus);
    }
    if (Array.isArray(npc.heartDemons) && npc.heartDemons.length && c.path !== 'DEMON') {
      const unresolvedPen = npc.heartDemons.filter(k => k && !k.resolved).reduce((sum, k) => sum + (k.btPenalty || 0.06), 0);
      p -= Math.min(0.18, unresolvedPen);
    }
    if (prep) p += (prep.pill || 0) + (prep.env || 0) + (prep.guide || 0);
    return clamp(p, 0.03, 0.97);
  };
  CULT.breakthrough = (W, npc, prep) => {
    const c = npc.cult, rng = W.rng;
    const p = CULT.breakthroughChance(npc, Object.assign({}, prep || {}, { now: W.t }));
    c.attempts++;
    const ok = rng.next() < p;
    const res = { ok, p, injured: false, died: false, stageFrom: c.stage };
    if (ok) {
      const over = Math.max(0, c.prog - CULT.threshold(npc));
      c.stage++; c.prog = over * 0.3; c.attempts = 0; c.lifeBonus = c.lifeBonus || 0;
      CULT.refreshLifespan(npc);
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
    } else {
      c.prog = CULT.threshold(npc) * (0.5 + 0.2 * clamp(HC.eff(npc, 'intellect.willpower') / 100 * 0.6 + HC.eff(npc, 'personality.composure') / 100 * 0.4 + rng.gauss(0, 0.12), 0, 1));
      const sev = rng.next() < 0.35 ? 2 : 1;
      res.injured = true; res.sev = sev;
      npc.h.state.hp = Math.max(1, npc.h.state.hp * (sev === 2 ? 0.35 : 0.6));
      HC.feel(npc, { mood: -18, stress: 18 });
      const hdGain = (npc.companionId || (npc.h && npc.h.companionId)) ? Math.max(2, Math.round(rng.int(5, 16) * 0.45)) : rng.int(5, 16);
      npc.h.state.heartDemon = clamp(npc.h.state.heartDemon + hdGain, 0, 100);
      if (c.path === 'DEMON') {
        res.supremeRisk = 'DEMONIC_BACKLASH_FRENZY';
        npc.h.state.heartDemon = clamp(npc.h.state.heartDemon + 8, 0, 100);
        npc.h.state.hp = Math.max(1, Math.round(npc.h.state.hp * 0.85));
      } else if (c.path === 'HEART_SOUL') {
        res.supremeRisk = 'SOUL_SHATTER_ILLUSION_LOST';
        npc.h.state.qi = 0;
        npc.h.state.rest = Math.max(5, (npc.h.state.rest || 50) - 25);
        npc.h.state.stress = clamp((npc.h.state.stress || 0) + 12, 0, 100);
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
      } else if (c.path === 'STRATEGY_GOVERNANCE') {
        res.supremeRisk = 'MANDATE_STRAIN_BACKLASH';
        npc.h.state.energy = Math.max(10, (npc.h.state.energy || 50) - 20);
        npc.h.state.stress = clamp((npc.h.state.stress || 0) + 14, 0, 100);
      }
      const eqSt = CULT.equivalentStage ? CULT.equivalentStage(npc) : c.stage;
      const pd = eqSt >= 3 ? 0.012 * (eqSt - 2) * (1 - HC.eff(npc, 'intellect.willpower') / 160) : 0;
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
  CULT.isExclusiveSubpathTech = t => {
    if (!t) return false;
    if (t.innateOnly || (g.MARTIAL && g.MARTIAL.isInnateTech && g.MARTIAL.isInnateTech(t))) return true;
    if (t.legendary) return false;
    if (typeof t.id === 'string' && t.id.startsWith('MP_')) return true;
    if ((t.passive || t.cat === 'PASSIVE') && t.sub) return true;
    if (/FORBIDDEN/.test(t.cat || '')) return true;
    if (t.sub && ['VENOM_GU_SOVEREIGN', 'CORPSE_PUPPET_MASTER'].includes(t.sub) && /GU_|CORPSE_|PARASITE/.test(t.id || '')) return true;
    return false;
  };

  CULT.isSubCompatible = (a, b, strictPrimarySub) => {
    const tech = (a && typeof a === 'object') ? a : (b && typeof b === 'object' ? b : null);
    const npcSub = typeof a === 'string' ? a : (typeof b === 'string' ? b : null);
    if (!tech || !tech.sub) return true;
    if (tech.legendary) return true;
    if (tech.sub === npcSub) return true;
    if (strictPrimarySub) return false;
    if (Array.isArray(tech.compatibleSubs) && tech.compatibleSubs.includes(npcSub)) return true;
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
    const demonPath = c.path === 'DEMON';
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
      const pathOk = t.legendary || t.isSectHeritage || t.path === 'ANY' || t.path === c.path || (!strictPrimary && (allowCrossPath || !CULT.isExclusiveSubpathTech(t)));
      if (!pathOk || !CULT.isSubCompatible(t, c.sub, strictPrimary)) return false;
      if (/_MANTRA$|^QI_MANTRA$/.test(t.cat)) return false;
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

  CULT.registerTracks = () => {
    if (JD && JD.EXPANSION && Array.isArray(JD.EXPANSION.progressionMapping)) {
      JD.EXPANSION.progressionMapping.forEach(pm => {
        if (pm.subPath && Array.isArray(pm.realms)) {
          CULT.TRACKS[pm.subPath] = pm;
          CULT.EXPANSION_TRACK_IDS.add(pm.subPath);
        }
      });
      if (CULT.TRACKS.SHADOW_ASSASSIN && CULT.TRACKS.SHADOW_ASSASSIN.realms && CULT.TRACKS.SHADOW_ASSASSIN.realms[1] && CULT.TRACKS.SHADOW_ASSASSIN.realms[1].skillGate) {
        CULT.TRACKS.SHADOW_ASSASSIN.realms[1].skillGate.minPrimarySkill = 30;
      }
    }
    // Register 50-Subpath Specialization Progression Bridge for base subpaths
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
        const realms = [];
        for (let i = 0; i < 9; i++) {
          const ord = i + 1;
          realms.push({
            ordinal: ord,
            id: "R_ADV_" + sub.id + "_0" + ord,
            nameTh: sub.nameTh + " ขั้นที่ " + ord,
            lifespanMax: 95 + i * 35,
            functionalCombatPower: fcpTable[i],
            majorBandEquivalent: mMap[i],
            skillGate: {
              primarySkill: pSk,
              minPrimarySkill: pMinTable[i],
              secondarySkill: sSk,
              minSecondarySkill: sMinTable[i]
            },
            resourceCost: {
              stones: stoneTable[i],
              materialTier: Math.min(7, 1 + Math.floor(i / 2))
            },
            capacityMultipliers: {
              maxQiMult: +(1 + i * 0.06).toFixed(2),
              vitalityMult: +(1 + i * 0.05).toFixed(2),
              faithPoolMult: +(1 + i * 0.05).toFixed(2),
              senseBonus: i * 2
            },
            realmBuffs: {
              combatOffensePct: +(3.0 + i * 2.2).toFixed(1),
              combatDefensePct: +(2.4 + i * 1.8).toFixed(1),
              armorPenetrationPct: +(2.0 + i * 1.4).toFixed(1),
              counterStrikePct: +(1.5 + i * 1.0).toFixed(1),
              lifestealPct: path === "DEMON" ? +(1.5 + i * 1.1).toFixed(1) : 0,
              reflectPct: path === "HEART_SOUL" ? +(1.5 + i * 1.2).toFixed(1) : 0,
              evasionPct: pSk === "MOVEMENT" ? +(2.0 + i * 1.5).toFixed(1) : +(1.0 + i * 0.8).toFixed(1),
              qiRegenBonusPct: +(2.0 + i * 1.5).toFixed(1)
            },
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

  CULT.trackThreshold = (npcOrSub, ord) => {
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
    const threshCurve = [200, 520, 1350, 3400, 8500, 21000, 50000, 120000];
    return threshCurve[ordinal - 1] || 150000;
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
    const nameSk = id => (g.MARTIAL && g.MARTIAL.SKILL_INFO && g.MARTIAL.SKILL_INFO[id] ? g.MARTIAL.SKILL_INFO[id].nameTh : (HC.nameOf && HC.nameOf("skills." + id)) || id);
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
      majorInfo = {
        active: true,
        ready,
        near: c.prog >= thMajor * 0.75,
        equivalentStage: eqStage,
        effectiveTechStage: effTechSt,
        plan: c.bn ? c.bn.plan : null,
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
    const ok = (opts && opts.guarantee) ? true : (W && W.rng ? W.rng.next() < p : Math.random() < p);
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
    return (CULT._speciesById && CULT._speciesById[id]) || null;
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
      p.satisfaction = p.hunger;
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
      } else {
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
    const seq = (W && W.sect && W.sect.petSeq) ? W.sect.petSeq : Math.floor(Math.random() * 9000 + 1000);
    const tier = clamp(opts.tier != null ? opts.tier : (fallbackSp.tier || 1), 1, 7);
    const isSovAwakened = !!(opts.sovereignAwakened || opts.bloodlineTrait === 'SOVEREIGN_AWAKENED');
    const growthSt = clamp(opts.growthStage != null ? opts.growthStage : (isSovAwakened ? 4 : 1), 1, 4);
    const level = clamp(opts.level != null ? opts.level : (isSovAwakened ? 9 : Math.max(1, (growthSt - 1) * 3 + 1)), 1, 9);
    const role = CULT.normalizePetRole(opts.role || fallbackSp.role || CULT.defaultRoleForSpecies(fallbackSp));
    const trait = isSovAwakened ? 'SOVEREIGN_AWAKENED' : (opts.bloodlineTrait || opts.trait || CULT.defaultTraitForSpecies(fallbackSp));
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
      const fuseMult = isFused ? 1.35 : 1.0;
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
    let chance = 0.38 + (tamingSk / 160) + (effSt - (sp.tier || 1)) * 0.12 + (isSov ? 0.25 : 0);
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
    const rollOk = opts.force || (W && W.rng ? W.rng.next() < chance : Math.random() < chance);
    if (g.MARTIAL && g.MARTIAL.skillPractice) g.MARTIAL.skillPractice(npc, 'BEAST_TAMING', 0.5, 1.2);
    if (!rollOk) {
      npc.h.state.energy = Math.max(5, (npc.h.state.energy || 50) - 8);
      return { ok: false, failedRoll: true, chance, reason: 'สัตว์อสูรดิ้นหลุดพันธสัญญา (โอกาส ' + Math.round(chance * 100) + '%)' };
    }
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
    const res = CULT.bindPet(W, npc, beastOrSpecies, { provenance: 'wild_tame', force: !!opts.force });
    if (res.ok && W && W.log && !opts.quiet) {
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
    if (fam === 'AVIAN' || /วิหค|หงส์|อินทรี|เหยี่ยว|กระเรียน|นก/.test(idNm)) {
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
    const healAmt = Math.max(1, Math.round(hm * baseHealPct * scale));
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

  g.CULT = CULT;
  if (typeof module === 'object' && module.exports) module.exports = CULT;
})(typeof globalThis !== 'undefined' ? globalThis : this);
