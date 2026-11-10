(function (root, factory) {
  "use strict";
  const value = factory();
  if (typeof module === "object" && module.exports) module.exports = value;
  else root.CompanyCore = value;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const VERSION = "1.0.0";
  const COMPATIBLE_VERSIONS = ["0.1.0-review.1", "0.1.0-review.2", VERSION];
  const PERSONALITY = [
    "sociability",
    "conscientiousness",
    "agreeableness",
    "openness",
    "riskTaking",
    "stressReactivity",
    "assertiveness",
    "patience",
    "integrity",
    "adaptability",
    "ambition",
    "prudence",
    "humility",
    "optimism",
  ];
  const VALUES = [
    "security",
    "income",
    "autonomy",
    "fairness",
    "belonging",
    "learning",
    "achievement",
    "meaning",
    "workLifeBalance",
    "recognition",
    "family",
    "comfort",
    "care",
    "stewardship",
    "influence",
    "tradition",
    "variety",
    "craftsmanship",
  ];
  const APTITUDES = [
    "analytical",
    "creativity",
    "communication",
    "organization",
    "precision",
    "dexterity",
    "learningSpeed",
    "stamina",
    "memory",
    "emotionalInsight",
    "spatial",
    "strength",
    "composure",
    "sensory",
    "numerical",
    "verbal",
    "attention",
    "problemSensitivity",
    "perceptualSpeed",
    "reactionSpeed",
    "controlPrecision",
    "coordination",
    "balance",
    "flexibility",
    "visualAcuity",
    "colorDiscrimination",
    "hearing",
    "speechClarity",
    "tasteSmell",
    "uncertaintyReasoning",
  ];
  const STATE_DEFAULTS = {
    energy: 90,
    focus: 85,
    hunger: 20,
    stress: 15,
    morale: 72,
    health: 100,
    burnout: 0,
    socialNeed: 35,
    sleepDebt: 0,
    lifeBurden: 20,
    fulfillment: 62,
    drive: 65,
  };
  const ACTION_MOTIVES = [
    ...VALUES,
    "energy",
    "focus",
    "stress",
    "hunger",
    "social",
    "health",
    "burnout",
    "sleep",
    "fulfillment",
    "drive",
    "duty",
    "help",
    "novelty",
    "risk",
    "voice",
    "integrity",
    "change",
    "craft",
    "routine",
    "ambition",
    "physical",
    "humility",
    "optimism",
  ];
  const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));
  const finite = (n, fallback = 0) =>
    typeof n === "number" && Number.isFinite(n) ? n : fallback;
  const freeze = (o, seen = new WeakSet()) => {
    if (o && typeof o === "object" && !seen.has(o)) {
      seen.add(o);
      Object.values(o).forEach((v) => freeze(v, seen));
      Object.freeze(o);
    }
    return o;
  };
  function uniform(seed, id, domain) {
    let h = 2166136261;
    const key = JSON.stringify([seed, id, domain]);
    for (let i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= h >>> 16;
    h = Math.imul(h, 0x7feb352d);
    h ^= h >>> 15;
    h = Math.imul(h, 0x846ca68b);
    h ^= h >>> 16;
    return ((h >>> 0) + 0.5) / 4294967296;
  }
  function normal(seed, id, domain) {
    return Math.round(
      clamp(
        50 +
          16 *
            Math.sqrt(-2 * Math.log(uniform(seed, id, domain + ":a"))) *
            Math.cos(2 * Math.PI * uniform(seed, id, domain + ":b")),
        5,
        95,
      ),
    );
  }
  function createProfile(seed, id) {
    if (
      !(
        typeof seed === "string" ||
        (typeof seed === "number" && Number.isFinite(seed))
      ) ||
      typeof id !== "string" ||
      !id.length
    )
      throw new TypeError(
        "seed must be a string/finite number and id must be a nonempty string",
      );
    const p = {
      version: VERSION,
      seed: String(seed),
      id,
      personality: {},
      values: {},
      aptitudes: {},
      potential: {},
    };
    for (const [group, keys] of [
      ["personality", PERSONALITY],
      ["values", VALUES],
      ["aptitudes", APTITUDES],
    ])
      for (const k of keys) p[group][k] = normal(p.seed, id, group + ":" + k);
    for (const k of APTITUDES) {
      const base = Math.max(p.aptitudes[k] + 12, 42);
      p.potential[k] = Math.round(
        clamp(
          base + uniform(p.seed, id, "potential:" + k) * Math.max(0, 96 - base),
          p.aptitudes[k],
          100,
        ),
      );
    }
    return freeze(p);
  }
  function migrateProfile(p) {
    if (!p || typeof p !== "object")
      throw new TypeError("profile missing for migration");
    if (!COMPATIBLE_VERSIONS.includes(p.version))
      throw new TypeError("unsupported core version");
    if (typeof p.id !== "string" || !p.id.length || typeof p.seed !== "string")
      throw new TypeError("invalid profile identity");
    const counts =
      p.version === "0.1.0-review.1"
        ? [9, 9, 10]
        : p.version === "0.1.0-review.2"
          ? [12, 12, 14]
          : [PERSONALITY.length, VALUES.length, APTITUDES.length];
    const groups = [
      ["personality", PERSONALITY, counts[0]],
      ["values", VALUES, counts[1]],
      ["aptitudes", APTITUDES, counts[2]],
      ["potential", APTITUDES, counts[2]],
    ];
    for (const [group, keys, count] of groups) {
      if (!p[group] || typeof p[group] !== "object" || Array.isArray(p[group]))
        throw new TypeError("missing legacy " + group);
      for (const key of keys.slice(0, count)) {
        const value = p[group][key];
        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value < 0 ||
          value > 100
        )
          throw new TypeError("invalid legacy " + group + "." + key);
      }
    }
    for (const key of APTITUDES.slice(0, counts[2]))
      if (p.potential[key] < p.aptitudes[key])
        throw new TypeError("legacy potential below aptitude");
    const next = {
      version: VERSION,
      seed: p.seed,
      id: p.id,
      personality: {},
      values: {},
      aptitudes: {},
      potential: {},
    };
    const generated = createProfile(p.seed, p.id);
    for (const [group, keys, count] of groups)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        next[group][key] = i < count ? p[group][key] : generated[group][key];
      }
    return freezeProfile(next);
  }
  function validateProfile(p) {
    const errors = [];
    if (!p || typeof p !== "object") return ["profile missing"];
    if (p.version !== VERSION) errors.push("unsupported core version");
    if (typeof p.id !== "string" || !p.id.length || typeof p.seed !== "string")
      errors.push("invalid profile identity");
    for (const [group, keys] of [
      ["personality", PERSONALITY],
      ["values", VALUES],
      ["aptitudes", APTITUDES],
      ["potential", APTITUDES],
    ]) {
      if (!p[group] || typeof p[group] !== "object") {
        errors.push(group + " missing");
        continue;
      }
      for (const k of keys) {
        const v = p[group][k];
        if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 100)
          errors.push(group + "." + k + " invalid");
      }
    }
    if (p.aptitudes && p.potential)
      for (const k of APTITUDES)
        if (p.potential[k] < p.aptitudes[k])
          errors.push(k + " potential below aptitude");
    return errors;
  }
  function freezeProfile(p) {
    const errors = validateProfile(p);
    if (errors.length) throw new TypeError(errors.join("; "));
    return freeze(p);
  }
  function normaliseState(input = {}) {
    const state = {};
    for (const [k, def] of Object.entries(STATE_DEFAULTS))
      state[k] = clamp(finite(input && input[k], def));
    return state;
  }
  function createState(profile) {
    const p = profile && profile.personality ? profile.personality : {},
      v = profile && profile.values ? profile.values : {},
      burden = Math.round(
        10 + uniform(profile.seed, profile.id, "lifeBurden") * 45,
      );
    return normaliseState({
      socialNeed: Math.round(
        clamp(18 + finite(p.sociability, 50) * 0.35, 10, 65),
      ),
      lifeBurden: burden,
      fulfillment: Math.round(clamp(68 - (burden - 25) * 0.2, 45, 80)),
      drive: Math.round(
        clamp(
          40 +
            finite(p.ambition, 50) * 0.35 +
            finite(v.achievement, 50) * 0.15 +
            burden * 0.15,
          30,
          92,
        ),
      ),
    });
  }
  function weights(spec) {
    if (
      !spec ||
      typeof spec.id !== "string" ||
      !spec.id.length ||
      !spec.aptitudes ||
      typeof spec.aptitudes !== "object"
    )
      throw new TypeError("skill spec requires id and aptitude weights");
    const list = Object.entries(spec.aptitudes);
    if (
      !list.length ||
      list.some(
        ([k, v]) =>
          !APTITUDES.includes(k) ||
          typeof v !== "number" ||
          !Number.isFinite(v) ||
          v <= 0,
      )
    )
      throw new TypeError("unknown aptitude or invalid weight");
    return list;
  }
  function fit(profile, spec, group = "aptitudes") {
    const list = weights(spec),
      scale = Math.max(...list.map(([, v]) => v)),
      normalized = list.map(([k, v]) => [k, v / scale]),
      sum = normalized.reduce((n, [, v]) => n + v, 0);
    return normalized.reduce((n, [k, v]) => n + profile[group][k] * v, 0) / sum;
  }
  const skillCap = (profile, spec) =>
    clamp(fit(profile, spec, "potential"), 1, 100);
  function cumulativeXpForLevel(baseLevel, currentLevel) {
    let sum = 0;
    for (let lvl = Math.floor(baseLevel); lvl < Math.floor(currentLevel); lvl++)
      sum += 12 + lvl * 1.5;
    return sum;
  }
  function createSkill(profile, spec) {
    return {
      id: spec.id,
      level: Math.min(
        skillCap(profile, spec),
        Math.round(
          clamp(
            fit(profile, spec) * 0.65 +
              (uniform(profile.seed, profile.id, "skill:" + spec.id) - 0.5) *
                20,
            5,
            80,
          ),
        ),
      ),
      xp: 0,
      totalXp: 0,
    };
  }
  function validateSkillRecord(skill, spec, cap) {
    if (
      !skill ||
      skill.id !== spec.id ||
      !Number.isFinite(skill.level) ||
      skill.level < 0 ||
      skill.level > cap ||
      !Number.isFinite(skill.xp) ||
      skill.xp < 0 ||
      skill.xp > Number.MAX_SAFE_INTEGER ||
      !Number.isFinite(skill.totalXp) ||
      skill.totalXp < 0 ||
      skill.totalXp > Number.MAX_SAFE_INTEGER
    )
      throw new TypeError("invalid skill record");
  }
  function learn(profile, skill, spec, minutes, context = {}) {
    if (
      typeof minutes !== "number" ||
      !Number.isFinite(minutes) ||
      minutes < 0 ||
      minutes > Number.MAX_SAFE_INTEGER
    )
      throw new TypeError("invalid practice minutes");
    weights(spec);
    const cap = skillCap(profile, spec),
      aptFit = fit(profile, spec),
      p = profile.personality,
      next = { ...skill };
    validateSkillRecord(skill, spec, cap);
    const ambitionBoost = (finite(p.ambition, 50) - 50) / 500;
    const baseRate =
      0.55 +
      (profile.aptitudes.learningSpeed / 100) * 0.5 +
      (aptFit / 100) * 0.3 +
      (profile.aptitudes.memory / 100) * 0.2 +
      ambitionBoost;
    const headroom =
      next.level < aptFit
        ? 1.15
        : cap > aptFit
          ? clamp(1 - ((next.level - aptFit) / (cap - aptFit)) * 0.55, 0.4, 1.1)
          : 0.45;
    const initial = createSkill(profile, spec).level,
      expectedTotal = cumulativeXpForLevel(initial, next.level);
    const rustBonus =
      next.totalXp > expectedTotal + 10
        ? 1 + (0.35 + (profile.aptitudes.memory / 100) * 0.45)
        : 1;
    const extMult = clamp(
      1 +
        finite(context && context.mentorBonus, 0) +
        finite(context && context.toolBonus, 0),
      0.5,
      2.5,
    );
    const gained = minutes * 0.18 * baseRate * headroom * rustBonus * extMult;
    if (
      !Number.isFinite(gained) ||
      next.xp + gained > Number.MAX_SAFE_INTEGER ||
      next.totalXp + gained > Number.MAX_SAFE_INTEGER
    )
      throw new TypeError("invalid skill record or XP overflow");
    next.xp += gained;
    next.totalXp += gained;
    while (next.level < cap && next.xp >= 12 + next.level * 1.5) {
      next.xp -= 12 + next.level * 1.5;
      next.level = Math.min(cap, next.level + 1);
    }
    if (next.level >= cap) next.xp = 0;
    return next;
  }
  function decaySkill(profile, skill, spec, daysIdle) {
    if (
      typeof daysIdle !== "number" ||
      !Number.isFinite(daysIdle) ||
      daysIdle < 0 ||
      daysIdle > Number.MAX_SAFE_INTEGER
    )
      throw new TypeError("invalid idle days");
    weights(spec);
    validateSkillRecord(skill, spec, skillCap(profile, spec));
    const next = { ...skill };
    if (daysIdle <= 3) return next;
    const floor = Math.min(
        next.level,
        Math.max(5, Math.round(fit(profile, spec) * 0.5)),
      ),
      retention = 0.35 + (profile.aptitudes.memory / 100) * 0.55,
      loss = Math.floor(((daysIdle - 3) * (1 - retention)) / 7);
    if (loss > 0 && next.level > floor) {
      next.level = Math.max(floor, next.level - loss);
      next.xp = 0;
    }
    return next;
  }
  function evaluateAbility(profile, input, skill, spec, context = {}) {
    const modifiers = context.aptitudeMultipliers || {};
    if (
      typeof modifiers !== "object" ||
      Array.isArray(modifiers) ||
      Object.entries(modifiers).some(
        ([k, v]) =>
          !APTITUDES.includes(k) ||
          typeof v !== "number" ||
          !Number.isFinite(v) ||
          v < 0 ||
          v > 2,
      )
    )
      throw new TypeError("invalid aptitude performance multipliers");
    const effective = Object.fromEntries(
      APTITUDES.map((k) => [
        k,
        clamp(
          profile.aptitudes[k] *
            (modifiers[k] === undefined ? 1 : modifiers[k]),
        ),
      ]),
    );
    const s = normaliseState(input),
      level = clamp(finite(skill && skill.level)),
      aptFit = fit({ aptitudes: effective }, spec),
      p = profile.personality,
      a = effective,
      hazard = clamp(finite(context && context.hazard, 0), 0, 1),
      complexity = clamp(finite(context && context.complexity, 0), 0, 1);
    const composureShield = finite(a.composure, 50) * 0.0025;
    const stressMult =
      s.stress <= 25
        ? 0.97 + (s.stress / 25) * 0.03
        : s.stress <= 55
          ? 1 + ((55 - Math.abs(s.stress - 40)) / 55) * 0.04
          : Math.max(
              0.2,
              1 - ((s.stress - 55) / 100) * (0.95 - composureShield),
            );
    const hazardFactor =
      hazard > 0
        ? clamp(
            1 -
              hazard *
                (0.22 -
                  (finite(a.composure, 50) + finite(a.spatial, 50)) * 0.0009),
            0.7,
            1.05,
          )
        : 1;
    const complexityBonus =
      complexity > 0
        ? ((a.analytical + a.memory + a.learningSpeed - 150) / 300) *
          complexity *
          0.08
        : 0;
    const moraleMult = 0.88 + (s.morale / 100) * 0.16 + (s.drive / 100) * 0.06;
    const hungerMult = s.hunger <= 70 ? 1 : 1 - ((s.hunger - 70) / 30) * 0.18;
    const extMult = clamp(
      finite(context && context.toolMultiplier, 1) *
        (1 + finite(context && context.teamSynergy, 0)),
      0.5,
      2.0,
    );
    const stateMult =
      (0.4 + s.energy * 0.006) *
      (0.55 + s.focus * 0.0045) *
      (0.4 + s.health * 0.006) *
      stressMult *
      moraleMult *
      hungerMult *
      hazardFactor *
      (1 - s.burnout * 0.005) *
      (1 - s.sleepDebt * 0.003);
    return {
      aptitudeFit: aptFit,
      stateMultiplier: stateMult,
      speedMultiplier: clamp(
        (0.5 + level * 0.012) * (0.65 + aptFit * 0.007) * stateMult * extMult,
        0.12,
        1.8,
      ),
      qualityChance: clamp(
        0.43 +
          level * 0.0033 +
          aptFit * 0.0008 +
          a.precision * 0.001 +
          finite(a.sensory, 50) * 0.0003 +
          finite(a.composure, 50) * 0.0003 +
          p.conscientiousness * 0.0005 +
          p.integrity * 0.0003 +
          complexityBonus -
          (100 - s.focus) * 0.0015 -
          Math.max(0, s.stress - 50) * 0.003 -
          s.burnout * 0.0022 -
          s.sleepDebt * 0.0012 -
          Math.max(0, 70 - s.health) * 0.0015 -
          Math.max(0, s.hunger - 75) * 0.0015,
        0.1,
        0.98,
      ),
    };
  }
  function tickState(profile, input, context) {
    if (
      !context ||
      typeof context.minutes !== "number" ||
      !Number.isFinite(context.minutes) ||
      context.minutes < 0 ||
      context.minutes > Number.MAX_SAFE_INTEGER
    )
      throw new TypeError("invalid duration");
    const s = normaliseState(input),
      h = context.minutes / 60,
      p = profile.personality,
      v = profile.values,
      a = profile.aptitudes,
      workload = clamp(finite(context.workload, 1), 0.2, 2),
      domain = context.domain || "balanced",
      hazard = clamp(finite(context.hazard, 0), 0, 1);
    const activity = context.activity || "idle";
    const socialRate = 0.35 + (p.sociability / 100) * 1.65;
    if (activity !== "sleep")
      s.sleepDebt += h * (activity === "offDuty" ? 0.45 : 0.6);
    if (activity === "work" || activity === "learn" || activity === "help") {
      const physicalScale =
        domain === "physical" ? 1.25 : domain === "cognitive" ? 0.85 : 1;
      const cognitiveScale =
        domain === "cognitive" ? 1.25 : domain === "physical" ? 0.85 : 1;
      const physicalRelief = a.stamina * 0.02 + finite(a.strength, 50) * 0.006;
      s.energy -=
        h * Math.max(2.0, 6 - physicalRelief) * workload * physicalScale;
      s.focus -=
        h *
        Math.max(2.2, 5.2 - a.memory * 0.012 - p.conscientiousness * 0.008) *
        workload *
        cognitiveScale;
      const adaptRelief =
        finite(p.adaptability, 50) * 0.004 + finite(a.composure, 50) * 0.003;
      const hazardStrain =
        hazard * Math.max(0.1, 1.2 - finite(a.composure, 50) * 0.008);
      s.stress +=
        h *
        (Math.max(0.25, 0.6 + p.stressReactivity * 0.025 - adaptRelief) *
          workload +
          hazardStrain);
      s.hunger += h * (domain === "physical" ? 5.8 : 5);
      if (domain === "social")
        s.socialNeed -= h * (4 + (p.sociability / 100) * 6);
      else
        s.socialNeed +=
          h * (activity === "help" ? socialRate * 0.3 : socialRate);
      if (activity === "help") {
        s.socialNeed -= h * (8 + (p.agreeableness / 100) * 6);
        if (v.belonging > 55 || p.agreeableness > 55) s.fulfillment += h * 0.35;
      }
      if (activity === "learn") {
        if (p.openness > 60 || v.learning > 65) s.morale += h * 0.4;
        s.fulfillment += h * (0.3 + (finite(p.ambition, 50) / 100) * 0.35);
      }
      if (s.stress > 65 || s.energy < 20 || s.sleepDebt > 65)
        s.burnout +=
          h *
          (1 + (100 - s.energy) * 0.015 + Math.max(0, s.stress - 65) * 0.015);
      if (s.stress > 78 || s.burnout > 60 || s.energy < 15) {
        s.morale -=
          h *
          (0.45 +
            Math.max(0, s.stress - 75) * 0.025 +
            Math.max(0, s.burnout - 55) * 0.03);
        s.drive -= h * 0.4;
      } else if (
        s.energy > 55 &&
        s.focus > 55 &&
        s.stress < 50 &&
        (p.conscientiousness > 60 ||
          v.achievement > 60 ||
          finite(p.ambition, 50) > 65)
      ) {
        s.morale += h * 0.2;
        s.fulfillment += h * 0.15;
      }
    } else if (activity === "sleep") {
      const quality = clamp(
        finite(context.sleepQuality, 1) * finite(context.homeComfort, 1),
        0.2,
        1.4,
      );
      s.energy += h * 14 * quality;
      s.focus += h * 12 * quality;
      s.stress -= h * 4.5 * quality;
      s.burnout -= h * 1.8 * quality;
      s.sleepDebt -= h * 1.35 * quality;
      s.health += h * 0.35 * quality;
      const targetDrive =
        40 +
        finite(p.ambition, 50) * 0.35 +
        v.achievement * 0.15 +
        s.lifeBurden * 0.12 -
        s.burnout * 0.25;
      s.drive += (targetDrive - s.drive) * Math.min(1, h * 0.12);
    } else if (activity === "meal") {
      const wasHungry = s.hunger > 45;
      s.hunger -= h * 120;
      s.energy += h * 9;
      s.focus += h * 8;
      s.stress -= h * 5;
      if (wasHungry) s.morale += h * 1.8;
    } else if (activity === "rest" || activity === "social") {
      const extrovert = (p.sociability - 50) / 50;
      s.energy +=
        h * (activity === "rest" ? 8.5 : 7.5 + Math.max(0, extrovert) * 2);
      s.focus += h * 16;
      const stressDrop =
        activity === "social"
          ? 6.5 + extrovert * 2.5
          : 8.5 - Math.min(0, extrovert) * 2;
      s.stress -= h * stressDrop;
      s.burnout -= h * 0.8;
      s.hunger += h * 3;
      if (activity === "social") {
        s.socialNeed -= h * 45;
        s.morale += h * (0.8 + Math.max(0, extrovert) * 0.8);
      } else {
        s.socialNeed -= h * Math.max(4, (100 - p.sociability) * 0.18);
        s.morale += h * 0.4;
      }
    } else if (activity === "offDuty") {
      const homeComfort = clamp(finite(context.homeComfort, 1), 0.6, 1.5);
      const burdenFactor =
        clamp(1 - (s.lifeBurden / 100) * 0.65, 0.25, 1) * homeComfort;
      s.energy += h * 2.2 * burdenFactor;
      s.focus += h * 2.5 * burdenFactor;
      s.stress -= h * 2.2 * burdenFactor;
      s.burnout -= h * 0.35 * burdenFactor;
      if (s.hunger > 22) s.hunger = Math.max(20, s.hunger - h * 14);
      else s.hunger += h * 1.5;
      s.socialNeed -= h * 5;
      if (finite(v.family, 50) > 60 || v.workLifeBalance > 60)
        s.fulfillment += h * 0.25 * burdenFactor;
    } else if (activity === "commute") {
      const vehicleRelief = clamp(finite(context.vehicleComfort, 0), 0, 0.7);
      s.energy -= h * 2.2 * (1 - vehicleRelief);
      s.stress +=
        h *
        (1.2 +
          (p.stressReactivity / 100) * 1.2 -
          finite(a.composure, 50) * 0.005) *
        (1 - vehicleRelief);
      s.hunger += h * 2.5;
    } else {
      s.energy -= h * 0.8;
      s.focus += h * 2;
      s.hunger += h * 3;
      s.socialNeed += h * (0.4 + (p.sociability / 100) * 0.8);
    }
    if (s.hunger > 80) {
      s.focus -= h * 3;
      s.stress += h * 2;
      s.morale -= h * 0.5;
    }
    if (s.energy < 10) s.health -= h * 0.8;
    if (context.moraleDelta) s.morale += finite(context.moraleDelta);
    if (context.lifeBurdenDelta)
      s.lifeBurden += finite(context.lifeBurdenDelta);
    if (context.fulfillmentDelta)
      s.fulfillment += finite(context.fulfillmentDelta);
    if (context.driveDelta) s.drive += finite(context.driveDelta);
    return normaliseState(s);
  }
  function deriveAspirations(profile, input, context = {}) {
    const s = normaliseState(input),
      p = profile.personality,
      v = profile.values,
      wallet = Math.max(0, finite(context.wallet, 0)),
      owned = new Set(
        Array.isArray(context.ownedAssets) ? context.ownedAssets : [],
      );
    let candidates = [
      {
        id: "emergencyFund",
        targetSavings: 1500000,
        score:
          v.security * 0.55 +
          finite(p.prudence, 50) * 0.4 +
          s.lifeBurden * 0.45 -
          Math.min(40, (wallet / 1500000) * 35),
      },
      {
        id: "familySupport",
        targetSavings: 3000000,
        score:
          finite(v.family, 50) * 0.65 +
          v.belonging * 0.25 +
          s.lifeBurden * 0.5 +
          p.agreeableness * 0.2,
      },
      {
        id: "romanceAndFamily",
        targetSavings: 5000000,
        score: context.hasPartner
          ? 12
          : finite(v.family, 50) * 0.6 +
            v.belonging * 0.35 +
            p.sociability * 0.2 +
            s.socialNeed * 0.25,
      },
      {
        id: "personalVehicle",
        targetSavings: 12000000,
        score: owned.has("vehicle")
          ? 5
          : finite(v.comfort, 50) * 0.5 +
            v.autonomy * 0.35 +
            v.recognition * 0.3 +
            finite(p.ambition, 50) * 0.3,
      },
      {
        id: "homeOwnership",
        targetSavings: 45000000,
        score: owned.has("home")
          ? 8
          : v.security * 0.45 +
            finite(v.family, 50) * 0.45 +
            finite(v.comfort, 50) * 0.4 +
            finite(p.ambition, 50) * 0.3 +
            finite(p.prudence, 50) * 0.2,
      },
      {
        id: "skillMastery",
        targetSavings: 2500000,
        score:
          v.learning * 0.65 +
          p.openness * 0.4 +
          v.achievement * 0.35 +
          finite(p.ambition, 50) * 0.3,
      },
      {
        id: "careerAdvancement",
        targetSavings: 6000000,
        score:
          finite(p.ambition, 50) * 0.65 +
          v.recognition * 0.55 +
          v.achievement * 0.4 +
          p.assertiveness * 0.25,
      },
      {
        id: "wealthAndFreedom",
        targetSavings: 25000000,
        score:
          v.income * 0.55 +
          v.autonomy * 0.45 +
          finite(p.ambition, 50) * 0.35 +
          finite(p.prudence, 50) * 0.25,
      },
    ].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    if (context.goalSpecs !== undefined) {
      if (
        !Array.isArray(context.goalSpecs) ||
        !context.goalSpecs.length ||
        context.goalSpecs.length > 100
      )
        throw new TypeError("goalSpecs must contain 1..100 goals");
      const ids = new Set();
      candidates = context.goalSpecs
        .map((g) => {
          if (
            !g ||
            typeof g.id !== "string" ||
            !g.id.length ||
            ids.has(g.id) ||
            !Number.isSafeInteger(g.targetSavings) ||
            g.targetSavings < 0 ||
            (g.baseScore !== undefined &&
              (typeof g.baseScore !== "number" ||
                !Number.isFinite(g.baseScore) ||
                Math.abs(g.baseScore) > 1000))
          )
            throw new TypeError("invalid goal spec");
          ids.add(g.id);
          let score = g.baseScore || 0;
          const groups = {
            personality: PERSONALITY,
            values: VALUES,
            aptitudes: APTITUDES,
            state: Object.keys(STATE_DEFAULTS),
          };
          const weights = g.weights || {};
          if (typeof weights !== "object" || Array.isArray(weights))
            throw new TypeError("invalid goal weights");
          for (const [group, terms] of Object.entries(weights)) {
            if (
              !Object.hasOwn(groups, group) ||
              !terms ||
              typeof terms !== "object" ||
              Array.isArray(terms)
            )
              throw new TypeError("invalid goal group");
            for (const [k, weight] of Object.entries(terms)) {
              if (
                !groups[group].includes(k) ||
                typeof weight !== "number" ||
                !Number.isFinite(weight) ||
                Math.abs(weight) > 5
              )
                throw new TypeError("invalid goal weight");
              score += (group === "state" ? s[k] : profile[group][k]) * weight;
            }
          }
          return { id: g.id, targetSavings: g.targetSavings, score };
        })
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    }
    const top = candidates[0];
    const savingPropensity = +clamp(
      0.15 +
        (finite(p.prudence, 50) / 100) * 0.45 +
        (p.patience / 100) * 0.15 +
        (v.security / 100) * 0.15 -
        (finite(v.comfort, 50) / 100) * 0.12,
      0.08,
      0.85,
    ).toFixed(3);
    const hustleDrive = Math.round(
      clamp(
        finite(p.ambition, 50) * 0.4 +
          s.drive * 0.35 +
          v.income * 0.15 +
          s.lifeBurden * 0.2 -
          s.burnout * 0.25,
        10,
        100,
      ),
    );
    return {
      primaryGoal: top.id,
      targetSavings: top.targetSavings,
      progressRatio: +clamp(
        wallet / Math.max(1, top.targetSavings),
        0,
        1,
      ).toFixed(3),
      savingPropensity,
      hustleDrive,
      goals: candidates.map((c) => ({
        id: c.id,
        targetSavings: c.targetSavings,
        score: +c.score.toFixed(2),
      })),
    };
  }
  function evaluateLifePurchase(profile, input, itemSpec, wallet = 0) {
    if (
      !itemSpec ||
      typeof itemSpec.id !== "string" ||
      !itemSpec.id ||
      typeof itemSpec.cost !== "number" ||
      !Number.isSafeInteger(itemSpec.cost) ||
      itemSpec.cost < 0 ||
      !Number.isSafeInteger(wallet) ||
      wallet < 0
    )
      throw new TypeError("invalid life purchase itemSpec");
    const s = normaliseState(input),
      p = profile.personality,
      impacts = itemSpec.impacts || { comfort: 0.6, recognition: 0.3 },
      scored = scoreOptions(profile, s, [
        { id: itemSpec.id, impacts, effort: 0 },
      ])[0];
    const safetyMultiplier =
      1.05 +
      (finite(p.prudence, 50) / 100) * 0.45 +
      (profile.values.security / 100) * 0.25 -
      (p.riskTaking / 100) * 0.2;
    const reserveRequired = Math.round(
      itemSpec.cost * Math.max(1, safetyMultiplier),
    );
    if (!Number.isSafeInteger(reserveRequired))
      throw new TypeError("purchase reserve overflow");
    const affordableNow = wallet >= reserveRequired;
    const desired = scored.score >= 6;
    return {
      id: itemSpec.id,
      desired,
      affordableNow,
      priorityScore: +scored.score.toFixed(2),
      reserveRequired,
      fulfillmentGain: Math.round(clamp(scored.score * 0.8, 2, 25)),
      moraleGain: Math.round(clamp(scored.score * 0.5, 1, 18)),
      reasons: scored.contributions.map((c) => c.factor),
    };
  }
  function evaluateLifeEvent(profile, input, eventSpec) {
    if (
      !eventSpec ||
      typeof eventSpec.type !== "string" ||
      !eventSpec.type.length
    )
      throw new TypeError("invalid life event spec");
    const s = normaliseState(input),
      p = profile.personality,
      v = profile.values,
      intensity = clamp(finite(eventSpec.intensity, 1), 0, 2.5),
      reasons = [];
    let moraleDelta = 0,
      fulfillmentDelta = 0,
      stressDelta = 0,
      driveDelta = 0,
      lifeBurdenDelta = 0;
    switch (eventSpec.type) {
      case "assetPurchased": {
        const cat = eventSpec.category || "comfort";
        const valWeight =
          cat === "home"
            ? (v.security + finite(v.family, 50) + finite(v.comfort, 50)) / 300
            : cat === "vehicle"
              ? (finite(v.comfort, 50) + v.autonomy + v.recognition) / 300
              : (finite(v.comfort, 50) + v.recognition) / 200;
        fulfillmentDelta = Math.round((8 + valWeight * 14) * intensity);
        moraleDelta = Math.round((5 + valWeight * 9) * intensity);
        stressDelta = -Math.round((3 + valWeight * 5) * intensity);
        driveDelta = Math.round(
          (2 + (finite(p.ambition, 50) / 100) * 6) * intensity,
        );
        if (cat === "home") lifeBurdenDelta = -Math.round(4 * intensity);
        reasons.push("achievedAssetMilestone:" + cat);
        break;
      }
      case "romanceStarted":
      case "married": {
        const fam = (finite(v.family, 50) + v.belonging) / 200;
        fulfillmentDelta = Math.round((10 + fam * 15) * intensity);
        moraleDelta = Math.round((6 + fam * 10) * intensity);
        stressDelta = -Math.round((4 + fam * 6) * intensity);
        driveDelta = Math.round((3 + fam * 7) * intensity);
        if (eventSpec.type === "married")
          lifeBurdenDelta = Math.round(4 * intensity);
        reasons.push(eventSpec.type);
        break;
      }
      case "childBorn": {
        const fam = finite(v.family, 50) / 100;
        fulfillmentDelta = Math.round((12 + fam * 16) * intensity);
        moraleDelta = Math.round((4 + fam * 8) * intensity);
        driveDelta = Math.round((6 + fam * 10) * intensity);
        lifeBurdenDelta = Math.round(12 * intensity);
        stressDelta = Math.round(4 * intensity);
        reasons.push("newFamilyMember");
        break;
      }
      case "familySupportSent": {
        const fam = (finite(v.family, 50) + p.agreeableness) / 200;
        fulfillmentDelta = Math.round((5 + fam * 8) * intensity);
        moraleDelta = Math.round((3 + fam * 5) * intensity);
        lifeBurdenDelta = -Math.round(5 * intensity);
        stressDelta = -Math.round(3 * intensity);
        reasons.push("supportedFamily");
        break;
      }
      case "familyCrisis":
      case "breakup": {
        const sens = (p.stressReactivity + finite(v.family, 50)) / 200;
        fulfillmentDelta = -Math.round((8 + sens * 12) * intensity);
        moraleDelta = -Math.round((6 + sens * 10) * intensity);
        stressDelta = Math.round((10 + sens * 14) * intensity);
        if (eventSpec.type === "familyCrisis")
          lifeBurdenDelta = Math.round(10 * intensity);
        reasons.push(eventSpec.type);
        break;
      }
      case "promoted":
      case "recognized":
      case "bonusReceived": {
        const amb =
          (finite(p.ambition, 50) + v.recognition + v.achievement) / 300;
        fulfillmentDelta = Math.round((7 + amb * 12) * intensity);
        moraleDelta = Math.round((8 + amb * 12) * intensity);
        driveDelta = Math.round((5 + amb * 9) * intensity);
        stressDelta = -Math.round(3 * intensity);
        reasons.push(eventSpec.type);
        break;
      }
      case "passedOver":
      case "payCut": {
        const amb = (finite(p.ambition, 50) + v.fairness + v.recognition) / 300;
        fulfillmentDelta = -Math.round((6 + amb * 10) * intensity);
        moraleDelta = -Math.round((9 + amb * 12) * intensity);
        stressDelta = Math.round((6 + amb * 8) * intensity);
        driveDelta = -Math.round((4 + amb * 6) * intensity);
        reasons.push(eventSpec.type);
        break;
      }
      default: {
        fulfillmentDelta = Math.round(
          clamp(finite(eventSpec.fulfillmentDelta, 0), -100, 100) * intensity,
        );
        moraleDelta = Math.round(
          clamp(finite(eventSpec.moraleDelta, 0), -100, 100) * intensity,
        );
        stressDelta = Math.round(
          clamp(finite(eventSpec.stressDelta, 0), -100, 100) * intensity,
        );
        driveDelta = Math.round(
          clamp(finite(eventSpec.driveDelta, 0), -100, 100) * intensity,
        );
        lifeBurdenDelta = Math.round(
          clamp(finite(eventSpec.lifeBurdenDelta, 0), -100, 100) * intensity,
        );
        reasons.push(eventSpec.type);
      }
    }
    const nextState = normaliseState({
      ...s,
      morale: s.morale + moraleDelta,
      fulfillment: s.fulfillment + fulfillmentDelta,
      stress: s.stress + stressDelta,
      drive: s.drive + driveDelta,
      lifeBurden: s.lifeBurden + lifeBurdenDelta,
    });
    return {
      state: nextState,
      deltas: {
        morale: nextState.morale - s.morale,
        fulfillment: nextState.fulfillment - s.fulfillment,
        stress: nextState.stress - s.stress,
        drive: nextState.drive - s.drive,
        lifeBurden: nextState.lifeBurden - s.lifeBurden,
      },
      reasons,
    };
  }
  function evaluateIndustryFit(profile, skillSpecs = {}) {
    if (!profile || !skillSpecs || typeof skillSpecs !== "object")
      throw new TypeError("invalid profile or skillSpecs");
    return Object.values(skillSpecs)
      .map((spec) => {
        const currentFit = fit(profile, spec, "aptitudes"),
          potentialCap = skillCap(profile, spec),
          adaptScore =
            currentFit * 0.6 +
            potentialCap * 0.25 +
            finite(profile.personality.adaptability, 50) * 0.15;
        return {
          skillId: spec.id,
          aptitudeFit: +currentFit.toFixed(2),
          potentialCap: +potentialCap.toFixed(2),
          transitionScore: +adaptScore.toFixed(2),
        };
      })
      .sort(
        (a, b) =>
          b.transitionScore - a.transitionScore ||
          a.skillId.localeCompare(b.skillId),
      );
  }
  function deriveAffect(profile, input, context = {}) {
    const s = normaliseState(input),
      p = profile.personality,
      v = profile.values,
      unpaid = finite(context.unpaidDays);
    const valence = clamp(
      (s.morale - 50) * 0.75 +
        (s.fulfillment - 50) * 0.35 +
        (s.energy - 50) * 0.3 -
        Math.max(0, s.stress - 40) * 0.65 -
        s.burnout * 0.6 -
        unpaid * 6 +
        (p.optimism - 50) * 0.08,
      -100,
      100,
    );
    const arousal = clamp(
      s.stress * 0.5 +
        s.drive * 0.25 +
        s.focus * 0.15 +
        (100 - s.sleepDebt) * 0.1,
      0,
      100,
    );
    let mood = "content";
    if (s.burnout > 70 || (s.morale < 25 && s.stress > 70)) mood = "burnedOut";
    else if (unpaid >= 3 || (s.morale < 35 && p.assertiveness >= 50))
      mood = "frustrated";
    else if (s.stress > 72) mood = "anxious";
    else if (s.energy < 28 || s.sleepDebt > 65) mood = "tired";
    else if (s.morale > 78 && s.energy > 65 && s.focus > 70) mood = "inspired";
    else if (s.drive > 75 && s.focus > 65 && s.energy > 55) mood = "driven";
    else if (s.focus > 68 && s.stress >= 25 && s.stress <= 58) mood = "focused";
    const needs = [
      ["recovery", Math.max(100 - s.energy, s.burnout, 100 - s.health)],
      ["sleep", s.sleepDebt],
      ["nutrition", s.hunger],
      ["calm", s.stress],
      ["connection", s.socialNeed * (0.4 + p.sociability / 100)],
      [
        "income",
        (s.lifeBurden * 0.5 + v.income * 0.3 + finite(v.family, 50) * 0.2) *
          (unpaid > 0 ? 1.4 : 0.75),
      ],
      [
        "ambition",
        (finite(p.ambition, 50) * 0.55 + v.recognition * 0.45) * 0.8,
      ],
      ["growth", (v.learning + p.openness) * 0.45],
      ["purpose", (v.meaning + v.achievement) * 0.45],
    ].sort((a, b) => b[1] - a[1]);
    const retentionRisk = clamp(
      (Math.max(0, 45 - s.morale) * 1.2 +
        Math.max(0, s.burnout - 50) * 1.1 +
        Math.max(0, 40 - s.fulfillment) * 0.5 +
        unpaid * 8) /
        100,
      0,
      1,
    );
    return {
      mood,
      valence: Math.round(valence),
      arousal: Math.round(arousal),
      dominantNeed: needs[0][0],
      retentionRisk: +retentionRisk.toFixed(3),
    };
  }
  function evaluateInteraction(
    profileA,
    inputA,
    profileB,
    inputB,
    context = {},
  ) {
    const sA = normaliseState(inputA),
      sB = normaliseState(inputB),
      pA = profileA.personality,
      pB = profileB.personality,
      vA = profileA.values,
      vB = profileB.values,
      aA = profileA.aptitudes,
      aB = profileB.aptitudes;
    let valueDiff = 0;
    for (const k of VALUES)
      valueDiff += Math.abs(finite(vA[k], 50) - finite(vB[k], 50));
    const valueAlignment = 1 - valueDiff / (VALUES.length * 100);
    const empathy =
      (pA.agreeableness +
        pB.agreeableness +
        aA.emotionalInsight +
        aB.emotionalInsight +
        aA.communication +
        aB.communication) /
      600;
    const dominanceClash =
      pA.assertiveness > 70 &&
      pB.assertiveness > 70 &&
      pA.agreeableness < 45 &&
      pB.agreeableness < 45
        ? 0.22
        : 0;
    const stressStrain = Math.max(0, (sA.stress + sB.stress - 130) / 200);
    const compatibility = clamp(
      (valueAlignment * 0.45 + empathy * 0.55 - dominanceClash - stressStrain) *
        100,
      5,
      98,
    );
    const familyHarmony =
      1 -
      (Math.abs(finite(vA.family, 50) - finite(vB.family, 50)) +
        Math.abs(pA.integrity - pB.integrity) +
        Math.abs(vA.workLifeBalance - vB.workLifeBalance)) /
        300;
    const romanticSpark =
      context.romanceEligible === false
        ? 0
        : Math.round(
            clamp(
              compatibility * 0.55 +
                familyHarmony * 30 +
                ((aA.emotionalInsight + aB.emotionalInsight) / 200) * 15,
              5,
              99,
            ),
          );
    const norm = (compatibility - 38) / 60;
    const trustDelta = +clamp(0.05 + norm * 0.35, -0.25, 0.45).toFixed(3);
    const familiarityDelta = +(
      context.mode === "help" || context.mode === "romance" ? 1.2 : 1.0
    ).toFixed(2);
    const affectionDelta =
      context.romanceEligible !== false &&
      (context.mode === "romance" || context.mode === "family")
        ? +clamp(((romanticSpark - 45) / 55) * 0.6, -0.2, 0.65).toFixed(3)
        : 0;
    const conflictRisk = +clamp(
      dominanceClash + stressStrain * 0.6 + Math.max(0, -norm * 0.35),
      0,
      1,
    ).toFixed(3);
    const moraleDelta = +clamp(0.05 + norm * 0.22, -0.1, 0.3).toFixed(3);
    const collaborationMultiplier = +(
      1.04 +
      clamp(
        ((aA.communication + aA.emotionalInsight + pA.agreeableness) / 300) *
          0.08 +
          Math.max(0, norm) * 0.04 +
          clamp(finite(context.existingTrust, 0) / 100, -0.2, 0.5) * 0.04,
        0,
        0.14,
      )
    ).toFixed(3);
    return {
      compatibility: Math.round(compatibility),
      romanticSpark,
      trustDelta,
      familiarityDelta,
      affectionDelta,
      conflictRisk,
      moraleDelta,
      collaborationMultiplier,
    };
  }
  function respondToRequest(profile, input, request = {}) {
    const s = normaliseState(input),
      v = profile.values,
      p = profile.personality,
      kind = request.kind || "overtime",
      hours = clamp(finite(request.hours, 1), 0, 4),
      pay = clamp(finite(request.payMultiplier, 1.5), 0, 4),
      urgency = clamp(finite(request.urgency), 0, 1),
      unpaidDays = clamp(finite(request.unpaidDays, 0), 0, 60),
      reasons = [];
    if (s.health < 35 || s.energy < 15 || s.burnout > 80 || s.sleepDebt > 85)
      return { decision: "decline", maxMinutes: 0, reasons: ["needsRecovery"] };
    if (unpaidDays >= 7 && p.agreeableness < 75)
      return { decision: "decline", maxMinutes: 0, reasons: ["unpaidWages"] };
    if (kind === "roleChange" || kind === "relocation") {
      const changeScore =
        finite(p.adaptability, 50) * 0.35 +
        p.openness * 0.25 +
        p.agreeableness * 0.2 +
        finite(p.ambition, 50) * 0.2 +
        urgency * 12 -
        s.stress * 0.2 -
        s.burnout * 0.25;
      if (changeScore >= 52)
        return {
          decision: "accept",
          maxMinutes: Math.round(hours * 60),
          reasons: ["adaptableToChange", "growthOpportunity"],
        };
      if (changeScore >= 32)
        return {
          decision: "negotiate",
          maxMinutes: Math.round(hours * 30),
          reasons: ["needsTransitionSupport"],
        };
      return {
        decision: "decline",
        maxMinutes: 0,
        reasons: ["prefersStability"],
      };
    }
    const financialDrive =
      (finite(p.ambition, 50) * 0.05 +
        finite(v.comfort, 50) * 0.04 +
        finite(v.family, 50) * 0.04) *
      Math.max(0.5, pay - 0.5);
    const score =
      pay * 11.2 +
      s.energy * 0.28 +
      (s.morale - 50) * 0.08 +
      (s.drive - 50) * 0.06 +
      v.income * 0.14 +
      financialDrive +
      v.security * urgency * 0.08 +
      v.achievement * urgency * 0.06 +
      p.agreeableness * 0.08 +
      p.conscientiousness * 0.06 +
      finite(p.adaptability, 50) * 0.04 +
      urgency * 7.5 -
      s.lifeBurden * 0.24 -
      s.stress * 0.15 -
      s.burnout * 0.35 -
      s.sleepDebt * 0.12 -
      v.workLifeBalance * 0.18 -
      v.autonomy * 0.07 -
      unpaidDays * 2.5 -
      hours * 5;
    if (score >= 25) {
      if (pay >= 1.5) reasons.push("fairCompensation");
      if (finite(p.ambition, 50) > 65 || v.income > 65)
        reasons.push("savingForGoals");
      if (urgency >= 0.5) reasons.push("urgentDeadline");
      reasons.push("availableCapacity");
      return {
        decision: "accept",
        maxMinutes: Math.round(hours * 60),
        reasons,
      };
    }
    if (score >= 5) {
      const half = Math.max(
        30,
        Math.min(60, Math.round((hours * 30) / 5) * 5 || 30),
      );
      if (
        s.lifeBurden > 55 ||
        v.workLifeBalance > 65 ||
        finite(v.family, 50) > 65
      )
        reasons.push("personalPriorities");
      reasons.push("limitedCapacity");
      return {
        decision: "negotiate",
        maxMinutes: Math.min(Math.round(hours * 60), half),
        reasons,
      };
    }
    if (s.stress > 65 || s.burnout > 50) reasons.push("highFatigueOrStress");
    reasons.push("personalPriorities");
    return {
      decision: "decline",
      maxMinutes: 0,
      reasons,
    };
  }
  // Extensible actions provide motives, not code or changes to intrinsic traits.
  function scoreOptions(profile, input, options, context = {}) {
    const state = normaliseState(input);
    if (!Array.isArray(options) || options.length > 1000)
      throw new TypeError("invalid action options");
    return options
      .map((option) => {
        if (
          !option ||
          typeof option.id !== "string" ||
          !option.id ||
          !option.impacts ||
          typeof option.impacts !== "object" ||
          Object.entries(option.impacts).some(
            ([k, v]) =>
              !ACTION_MOTIVES.includes(k) ||
              typeof v !== "number" ||
              !Number.isFinite(v) ||
              v < -1 ||
              v > 1,
          )
        )
          throw new TypeError("invalid action motives");
        const c = [],
          imp = (key) => option.impacts[key] || 0,
          p = profile.personality,
          a = profile.aptitudes;
        const add = (factor, amount) => {
          if (amount) c.push({ factor, amount });
        };
        for (const value of VALUES) {
          let weight = (finite(profile.values[value], 50) / 100) * 12;
          if (value === "income")
            weight +=
              (state.lifeBurden / 100) * 4 +
              (finite(p.ambition, 50) / 100) * 2.5;
          if (value === "workLifeBalance")
            weight += (state.burnout / 100) * 5 + (state.sleepDebt / 100) * 3;
          if (value === "belonging") weight += (state.socialNeed / 100) * 3;
          if (value === "family") weight += (state.lifeBurden / 100) * 3;
          if (value === "recognition")
            weight += (finite(p.ambition, 50) / 100) * 3;
          add("value:" + value, weight * imp(value));
        }
        add(
          "need:energy",
          (((100 - state.energy) / 100) * 30 + (state.burnout / 100) * 8) *
            imp("energy"),
        );
        add("need:focus", ((100 - state.focus) / 100) * imp("focus") * 18);
        add(
          "need:stress",
          ((state.stress / 100) * 24 + (state.burnout / 100) * 8) *
            imp("stress"),
        );
        add("need:hunger", (state.hunger / 100) * imp("hunger") * 26);
        add("need:health", ((100 - state.health) / 100) * imp("health") * 24);
        add("need:burnout", (state.burnout / 100) * imp("burnout") * 22);
        add("need:sleep", (state.sleepDebt / 100) * imp("sleep") * 24);
        add(
          "need:fulfillment",
          ((100 - state.fulfillment) / 100) * imp("fulfillment") * 16,
        );
        add("drive", (state.drive / 100) * imp("drive") * 14);
        add(
          "sociability",
          ((p.sociability / 100) * 10 + (state.socialNeed / 100) * 10) *
            imp("social"),
        );
        add(
          "conscientiousness",
          (p.conscientiousness / 100) * imp("duty") * 12,
        );
        add("agreeableness", (p.agreeableness / 100) * imp("help") * 12);
        add(
          "openness",
          ((p.openness / 100) * 9 + (a.creativity / 100) * 4) * imp("novelty"),
        );
        add("humility", (p.humility / 100) * imp("humility") * 10);
        add("optimism", ((p.optimism - 50) / 50) * imp("optimism") * 8);
        add("riskTaking", ((p.riskTaking - 50) / 50) * imp("risk") * 10);
        add(
          "stressReactivity",
          (-p.stressReactivity / 100) * Math.max(0, imp("risk")) * 5,
        );
        add("assertiveness", (p.assertiveness / 100) * imp("voice") * 12);
        add("integrity", (p.integrity / 100) * imp("integrity") * 16);
        add(
          "adaptability",
          ((finite(p.adaptability, 50) - 45) / 55) * imp("change") * 9,
        );
        add(
          "ambition",
          ((finite(p.ambition, 50) / 100) * 11 + (state.drive / 100) * 5) *
            imp("ambition"),
        );
        add(
          "craft",
          ((a.precision +
            a.dexterity +
            finite(a.sensory, 50) +
            p.conscientiousness) /
            400) *
            imp("craft") *
            10,
        );
        add(
          "physical",
          ((finite(a.strength, 50) + a.stamina + finite(a.spatial, 50)) / 300) *
            imp("physical") *
            10,
        );
        add(
          "routine",
          ((100 - p.openness + p.patience + finite(p.prudence, 50)) / 300) *
            imp("routine") *
            8,
        );
        if (
          typeof option.skillFit === "number" &&
          Number.isFinite(option.skillFit)
        )
          add(
            "skillFit",
            clamp(option.skillFit, -1, 1) *
              (6 + (profile.values.achievement / 100) * 5),
          );
        if (
          typeof option.memoryBias === "number" &&
          Number.isFinite(option.memoryBias)
        )
          add("memory", clamp(option.memoryBias, -1, 1) * 8);
        if (
          context &&
          context.memoryBiases &&
          typeof context.memoryBiases[option.id] === "number" &&
          Number.isFinite(context.memoryBiases[option.id])
        )
          add(
            "contextMemory",
            clamp(context.memoryBiases[option.id], -1, 1) * 8,
          );
        const effort = clamp(finite(option.effort), 0, 1),
          delay = clamp(finite(option.delay), 0, 1);
        add(
          "effort",
          -effort *
            (1 + (100 - state.energy) / 100 + (state.burnout / 100) * 0.5) *
            10,
        );
        add("patience", -(1 - p.patience / 100) * delay * 8);
        return {
          id: option.id,
          score: c.reduce((n, v) => n + v.amount, 0),
          contributions: c,
        };
      })
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  }
  function workplaceVoice(profile, input, context = {}) {
    const s = normaliseState(input),
      p = profile.personality,
      v = profile.values,
      unpaid = finite(context.unpaidDays),
      unresolved = finite(context.unresolvedDays),
      wageFairness = finite(context.wageFairness, 1),
      reasons = [];
    if (unpaid > 0) reasons.push("unpaidWages");
    if (s.burnout > 60) reasons.push("overload");
    if (s.morale < 35) reasons.push("lowMorale");
    if (s.health < 35) reasons.push("healthRisk");
    if (
      wageFairness < 0.82 &&
      (v.fairness > 55 || v.income > 60 || finite(p.ambition, 50) > 65)
    )
      reasons.push("unfairCompensation");
    if (s.fulfillment < 28 && finite(p.ambition, 50) > 70)
      reasons.push("stagnantGrowth");
    if (!reasons.length) return { action: "none", reasons: [] };
    if (
      p.assertiveness < 35 &&
      unpaid === 0 &&
      s.morale >= 25 &&
      s.burnout < 80 &&
      s.health >= 35
    )
      return { action: "none", reasons };
    const patienceBuffer = p.patience > 75 && unpaid < 7 ? 1 : 0;
    if (
      (unpaid >= 7 ||
        s.morale < 15 ||
        s.burnout >= 85 ||
        (s.burnout > 70 && s.morale < 28) ||
        s.health < 22) &&
      unresolved >= 4 + patienceBuffer
    )
      return { action: "considerLeaving", reasons };
    return { action: "raiseConcern", reasons };
  }
  return freeze({
    VERSION,
    COMPATIBLE_VERSIONS,
    PERSONALITY,
    VALUES,
    APTITUDES,
    STATE_DEFAULTS,
    ACTION_MOTIVES,
    createProfile,
    migrateProfile,
    validateProfile,
    freezeProfile,
    createState,
    normaliseState,
    createSkill,
    skillCap,
    learn,
    decaySkill,
    evaluateAbility,
    tickState,
    deriveAffect,
    deriveAspirations,
    evaluateLifePurchase,
    evaluateLifeEvent,
    evaluateIndustryFit,
    evaluateInteraction,
    respondToRequest,
    scoreOptions,
    workplaceVoice,
  });
});
