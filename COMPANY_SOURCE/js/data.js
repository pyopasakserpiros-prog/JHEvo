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
  const defaults = {
    version: "1.1.0",
    skills: {
      sales: {
        id: "sales",
        nameTh: "การขายและเจรจา",
        aptitudes: {
          communication: 0.55,
          emotionalInsight: 0.25,
          organization: 0.1,
          composure: 0.1,
        },
      },
      admin: {
        id: "admin",
        nameTh: "บัญชีและธุรการ",
        aptitudes: { organization: 0.5, precision: 0.3, memory: 0.2 },
      },
      engineering: {
        id: "engineering",
        nameTh: "วิศวกรรมและวิจัย",
        aptitudes: {
          analytical: 0.4,
          creativity: 0.3,
          learningSpeed: 0.2,
          spatial: 0.1,
        },
      },
      assembly: {
        id: "assembly",
        nameTh: "ประกอบชิ้นงาน",
        aptitudes: {
          dexterity: 0.45,
          precision: 0.25,
          stamina: 0.2,
          spatial: 0.1,
        },
      },
      quality: {
        id: "quality",
        nameTh: "ตรวจคุณภาพ",
        aptitudes: { precision: 0.5, analytical: 0.3, sensory: 0.2 },
      },
      logistics: {
        id: "logistics",
        nameTh: "คลังสินค้าและจัดส่ง",
        aptitudes: {
          organization: 0.45,
          stamina: 0.25,
          strength: 0.15,
          spatial: 0.15,
        },
      },
      leadership: {
        id: "leadership",
        nameTh: "ประสานงานและช่วยทีม",
        aptitudes: {
          communication: 0.35,
          emotionalInsight: 0.35,
          organization: 0.15,
          composure: 0.15,
        },
      },
    },
    materials: {
      pcb: { id: "pcb", nameTh: "แผงวงจร", unitCost: 9000, leadMinutes: 1440 },
      casing: {
        id: "casing",
        nameTh: "ตัวถัง",
        unitCost: 5000,
        leadMinutes: 720,
      },
      driver: {
        id: "driver",
        nameTh: "ดอกลำโพง",
        unitCost: 6000,
        leadMinutes: 1440,
      },
      led: { id: "led", nameTh: "โมดูลแสง", unitCost: 7500, leadMinutes: 1440 },
      sensor: {
        id: "sensor",
        nameTh: "เซ็นเซอร์",
        unitCost: 6000,
        leadMinutes: 1440,
      },
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
      },
    },
    roles: {
      sales: { nameTh: "ฝ่ายขาย", skill: "sales" },
      admin: { nameTh: "ธุรการ", skill: "admin" },
      engineer: { nameTh: "วิศวกร", skill: "engineering" },
      assembler: { nameTh: "ช่างประกอบ", skill: "assembly" },
      inspector: { nameTh: "ตรวจคุณภาพ", skill: "quality" },
      logistics: { nameTh: "คลังและจัดส่ง", skill: "logistics" },
      coordinator: { nameTh: "ผู้บริหาร/CEO", skill: "leadership" },
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
      maxPeople: 30,
    },
    initialStock: { pcb: 30, casing: 30, driver: 30, led: 0, sensor: 0 },
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
      throw new TypeError("invalid/duplicate role spec");
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
      spec.unitCost > 1e12 ||
      !Number.isSafeInteger(spec.leadMinutes) ||
      spec.leadMinutes < 5 ||
      spec.leadMinutes > 525600
    )
      throw new TypeError("invalid/duplicate material spec");
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
      !Object.keys(spec.bom).length ||
      Object.entries(spec.bom).some(
        ([m, n]) =>
          !Object.hasOwn(c.materials, m) ||
          !Number.isSafeInteger(n) ||
          n < 1 ||
          n > 10000,
      )
    )
      throw new TypeError("invalid/duplicate product spec");
    const next = {
      researchRequired: 0,
      visualKey: "product." + spec.id,
      ...clone(spec),
    };
    const copy = clone(c);
    copy.products[spec.id] = next;
    const errors = validateCatalog(copy);
    if (errors.length) throw new TypeError(errors.join("; "));
    c.products[spec.id] = next;
    return c;
  }
  const BUILTIN_TASK_KINDS = [
    "assembly",
    "rework",
    "qa",
    "packing",
    "shipping",
    "purchase",
    "invoice",
    "research",
    "sales",
  ];
  function validateTaskKind(c, spec) {
    if (
      !spec ||
      !validId(spec.id) ||
      BUILTIN_TASK_KINDS.includes(spec.id) ||
      ["constructor", "prototype"].includes(spec.id) ||
      typeof spec.nameTh !== "string" ||
      !spec.nameTh ||
      !Object.hasOwn(c.skills, spec.skill) ||
      !validId(spec.stationKind) ||
      !Number.isSafeInteger(spec.requiredMinutes) ||
      spec.requiredMinutes < 5 ||
      spec.requiredMinutes > 1440
    )
      throw new TypeError("invalid task kind spec");
    for (const [key, max] of [
      ["researchPoints", 1e9],
      ["revenue", 1e12],
    ])
      if (
        spec[key] !== undefined &&
        (!Number.isSafeInteger(spec[key]) || spec[key] < 0 || spec[key] > max)
      )
        throw new TypeError("invalid task effect " + key);
    if (
      spec.reputationDelta !== undefined &&
      (typeof spec.reputationDelta !== "number" ||
        !Number.isFinite(spec.reputationDelta) ||
        Math.abs(spec.reputationDelta) > 10)
    )
      throw new TypeError("invalid reputation effect");
    if (
      spec.domain !== undefined &&
      !["balanced", "physical", "cognitive", "social"].includes(spec.domain)
    )
      throw new TypeError("invalid task domain");
    for (const [key, min, max] of [
      ["workload", 0.2, 2],
      ["hazard", 0, 1],
      ["complexity", 0, 1],
    ])
      if (
        spec[key] !== undefined &&
        (typeof spec[key] !== "number" ||
          !Number.isFinite(spec[key]) ||
          spec[key] < min ||
          spec[key] > max)
      )
        throw new TypeError("invalid task demand " + key);
    H.scoreOptions(H.createProfile("validate", "p"), H.STATE_DEFAULTS, [
      {
        id: spec.id,
        impacts: spec.impacts || { achievement: 0.5 },
        effort: 0.35,
      },
    ]);
  }
  function registerTaskKind(c, spec) {
    validateTaskKind(c, spec);
    if (c.taskKinds && c.taskKinds[spec.id])
      throw new TypeError("duplicate task kind");
    const next = {
      id: spec.id,
      nameTh: spec.nameTh,
      skill: spec.skill,
      stationKind: spec.stationKind,
      requiredMinutes: spec.requiredMinutes,
      domain: spec.domain || "balanced",
      workload: spec.workload === undefined ? 1 : spec.workload,
      hazard: spec.hazard || 0,
      complexity: spec.complexity || 0,
      impacts: clone(
        spec.impacts || { achievement: 0.5, learning: 0.4, duty: 0.4 },
      ),
      researchPoints: spec.researchPoints || 0,
      reputationDelta: spec.reputationDelta || 0,
      revenue: spec.revenue || 0,
    };
    if (!c.taskKinds) c.taskKinds = {};
    c.taskKinds[spec.id] = next;
    return c;
  }
  function validateCatalog(c) {
    const e = [];
    if (!c || typeof c !== "object") return ["catalog missing"];
    for (const k of [
      "skills",
      "materials",
      "products",
      "roles",
      "rules",
      "initialStock",
    ])
      if (!c[k] || typeof c[k] !== "object") e.push(k + " missing");
    if (e.length) return e;
    if (
      !Object.keys(c.skills).length ||
      !Object.keys(c.materials).length ||
      !Object.keys(c.products).length
    )
      e.push("empty catalog");
    for (const [id, s] of Object.entries(c.skills)) {
      try {
        if (
          !validId(id) ||
          ["constructor", "prototype"].includes(id) ||
          id !== s.id
        )
          throw Error();
        H.createSkill(H.createProfile("validate", "p"), s);
      } catch (_) {
        e.push("invalid skill " + id);
      }
    }
    for (const [id, m] of Object.entries(c.materials)) {
      if (
        !m ||
        !validId(id) ||
        ["constructor", "prototype"].includes(id) ||
        id !== m.id ||
        !Number.isSafeInteger(m.unitCost) ||
        m.unitCost < 1 ||
        m.unitCost > 1e12 ||
        !Number.isSafeInteger(m.leadMinutes) ||
        m.leadMinutes < 5 ||
        m.leadMinutes > 525600
      )
        e.push("invalid material " + id);
    }
    for (const [id, p] of Object.entries(c.products)) {
      if (
        !p ||
        !validId(id) ||
        ["constructor", "prototype"].includes(id) ||
        id !== p.id ||
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
      c.starters.length > 30
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
      ["maxActiveOrders", 1, 20],
      ["maxUnits", 1, 400],
      ["scenarioDays", 1, 365],
      ["winCash", 0, 1e12],
      ["winReputation", 0, 100],
      ["hireFee", 0, 1e9],
      ["maxPeople", 1, 30],
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
    VERSION: "1.1.0",
    INDUSTRY_SKILL_TEMPLATES,
    createCatalog: () => clone(defaults),
    validateCatalog,
    registerSkill,
    registerRole,
    registerMaterial,
    registerProduct,
    registerTaskKind,
  });
});
