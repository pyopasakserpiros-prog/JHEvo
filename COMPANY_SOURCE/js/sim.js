(function (root, factory) {
  "use strict";
  const node = typeof module === "object" && module.exports;
  const value = factory(
    node ? require("./human-core.js") : root.CompanyCore,
    node ? require("./data.js") : root.CompanyData,
    node ? require("./layout.js") : root.CompanyLayout,
    node ? require("./economy.js") : root.CompanyEconomy,
  );
  if (node) module.exports = value;
  else root.CompanySim = value;
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function (H, D, L, E) {
    "use strict";
    const VERSION = "0.1.0",
      RELEASE_VERSION = "1.0.0",
      SCHEMA = "company-foundation-1",
      TICK = 5;
    const BUILTIN_TASK_SKILLS = {
      assembly: "assembly",
      rework: "assembly",
      qa: "quality",
      packing: "logistics",
      shipping: "logistics",
      purchase: "admin",
      invoice: "admin",
      research: "engineering",
      sales: "sales",
    };
    const BUILTIN_TASK_STATIONS = {
      assembly: "assembly",
      rework: "assembly",
      qa: "quality",
      packing: "packing",
      shipping: "shipping",
      purchase: "admin",
      invoice: "admin",
      research: "research",
      sales: "sales",
    };
    // Levels are simulation state; amounts are integer satang, not visual-only upgrades.
    const FACILITY_RULES = Object.freeze({
      hq: { nameTh: "สำนักงานใหญ่", cost: 1000000 },
      factory: { nameTh: "โรงงานผลิต", cost: 1800000 },
      warehouse: { nameTh: "คลังสินค้า", cost: 1200000 },
      rnd: { nameTh: "อาคารวิจัย", cost: 1400000 },
      canteen: { nameTh: "โรงอาหาร", cost: 800000 },
      courtyard: { nameTh: "สวนพักผ่อน", cost: 600000 },
      training: { nameTh: "ศูนย์ฝึกอบรม", cost: 900000 },
    });
    const freshFacilities = () => ({
      levels: Object.fromEntries(Object.keys(FACILITY_RULES).map((key) => [key, 1])),
      trainingMinutes: 0,
      lastDecisionDay: 0,
      lastDecision: null,
      machineCondition: 100,
      maintenanceCount: 0,
      totalPromotions: 0,
      totalBonusesPaid: 0,
      employeeOfTheWeekId: null,
      employeeOfTheWeekName: null,
      constructedPlots: [],
      plotHistory: [],
    });
    const freshLogistics = () => ({
      b2bDeals: [],
      inboundShipments: [],
      outboundShipments: [],
      productionRegime: "lean_balanced",
      productionLines: {
        lineA: {
          id: "lineA",
          nameTh: "สายการผลิตหลักที่ 1 (Main Factory Line A)",
          modeId: "smt_precision",
          modeNameTh: "สายประกอบไมโครอิเล็กทรอนิกส์ SMT",
          active: true,
          stations: ["assembly1", "assembly2", "assembly3", "quality1", "quality2"],
          speedBonusPct: 0,
          unitsCompleted: 0,
        },
        lineB: {
          id: "lineB",
          nameTh: "สายการผลิตอัจฉริยะที่ 2 (Smart Line B)",
          modeId: "automated_modular",
          modeNameTh: "สายประกอบโมดูลอัตโนมัติความเร็วสูง",
          active: false,
          stations: ["assembly_b1", "assembly_b2", "quality_b1"],
          speedBonusPct: 15,
          unitsCompleted: 0,
        },
        lineC: {
          id: "lineC",
          nameTh: "สายการผลิตอัตโนมัติที่ 3 (Mega Line C)",
          modeId: "cnc_mechanical",
          modeNameTh: "สายขึ้นรูปโลหะและกลไกหนัก CNC",
          active: false,
          stations: ["assembly_c1", "assembly_c2", "quality_c1"],
          speedBonusPct: 20,
          unitsCompleted: 0,
        },
        lineD: {
          id: "lineD",
          nameTh: "สายการผลิตคลีนรูมและพลังงานที่ 4 (Clean & HV Line D)",
          modeId: "cleanroom_batch",
          modeNameTh: "สายสกัดคลีนรูมและเซลล์พลังงานแรงดันสูง",
          active: false,
          stations: ["assembly_d1", "assembly_d2", "quality_d1"],
          speedBonusPct: 25,
          unitsCompleted: 0,
        },
      },
      modeOutputCounts: {
        smt_precision: 0,
        cnc_mechanical: 0,
        cleanroom_batch: 0,
        high_voltage_cell: 0,
        automated_modular: 0,
        milling_refining: 0,
        continuous_food_bake: 0,
        semiconductor_fab: 0,
      },
      fleetCount: 2,
      totalInboundReceived: 0,
      totalOutboundDispatched: 0,
    });
    function freshExternalWorld(seedStr = "company") {
      const ext = D.EXTERNAL_WORLD_DEFAULTS || {
        clients: [],
        suppliers: [],
        competitors: [],
        governmentPolicies: [],
        stockIndices: [],
        ceoDirectives: [],
      };
      const clients = {};
      for (const c of ext.clients) {
        clients[c.id] = {
          ...clone(c),
          trustScore: c.baseTrust || 50,
          totalContracts: 0,
          completedContracts: 0,
          totalRevenueSatang: 0,
          lastDealDay: 0,
        };
      }
      const suppliers = {};
      for (const s of ext.suppliers) {
        suppliers[s.id] = {
          ...clone(s),
          trustScore: s.baseTrust || 50,
          totalOrders: 0,
          totalDeliveries: 0,
          totalSpendSatang: 0,
          tierTh: s.baseTrust >= 60 ? "คู่ค้าชั้นดี (VIP)" : "คู่ค้ามาตรฐาน (Regular)",
        };
      }
      const competitors = {};
      for (const comp of ext.competitors) {
        competitors[comp.id] = {
          ...clone(comp),
          poachingAttempts: 0,
        };
      }
      const firstPolicy = ext.governmentPolicies[0] || {
        id: "boi_smart_industry",
        nameTh: "บัตรส่งเสริมการลงทุน BOI อุตสาหกรรมเป้าหมาย",
        summaryTh: "ลดภาระภาษีนิติบุคคลและหนุนการวิจัย R&D",
        corporateTaxPct: 10,
        demandMultiplier: 1.08,
        greenBonus: 0,
      };
      const indices = {};
      for (const idx of ext.stockIndices) {
        indices[idx.id] = {
          id: idx.id,
          symbol: idx.symbol,
          nameTh: idx.nameTh,
          value: idx.baseValue,
          changePct: 0,
          history: [idx.baseValue],
        };
      }
      const firstDirective = ext.ceoDirectives[0] || {
        id: "sales_blitz",
        nameTh: "ลุยยอดขายและขยายฐานคู่ค้า B2B",
        descTh: "เน้นเจรจาปิดดีล B2B ราคาดีและเร่งส่งมอบออเดอร์ลูกค้า",
      };
      const corporations = {};
      for (const corp of ext.corporations || []) {
        corporations[corp.id] = {
          ...clone(corp),
          trustScore: corp.baseTrust || 50,
          b2bPurchasesCount: 0,
          b2bPurchasesSatang: 0,
          interCompanyDealsCount: 0,
          lastActionDay: 1,
          lastActionTh: corp.strategyTh || "ดำเนินธุรกิจในตลาดอุตสาหกรรม",
        };
      }
      const initialFeed = [
        {
          id: "eco-init-1",
          day: 1,
          type: "INTER_CORP_SUPPLY",
          badgeTh: "🤝 การค้าระหว่างบริษัทภายนอก",
          actorCorpId: "siam_metal",
          targetCorpId: "asia_autoparts",
          headlineTh: "บจก. สยามเมทัล ทำสัญญาป้อนแผ่นโลหะและขดลวดทองแดงล็อตใหญ่ให้ บจก. เอเชีย ออโต้พาร์ท เพื่อเร่งสายพาน EV",
          impactTh: "ความต้องการแผ่นโลหะ (T1), ขดลวดทองแดง (T1) และชุดสายไฟ (T2) ในตลาด B2B เพิ่มสูงขึ้น",
        },
        {
          id: "eco-init-2",
          day: 1,
          type: "PRICE_WAR",
          badgeTh: "⚔️ สงครามแย่งตลาดคู่แข่ง",
          actorCorpId: "titan_elec",
          targetCorpId: "siam_tech",
          headlineTh: "บมจ. ไททัน อิเล็กทรอนิกส์ เปิดศึกตัดราคาชิ้นส่วนสมาร์ตเทคแข่งกับ บมจ. สยามเทค โฮลดิ้งส์",
          impactTh: "สยามเทคต้องการซัพพลายเออร์แผ่นเวเฟอร์ (T2), แผงวงจร PCB (T3) และชิป (T3) ในประเทศเพื่อลดต้นทุน",
        },
        {
          id: "eco-init-3",
          day: 1,
          type: "STRATEGIC_JV",
          badgeTh: "🌾 พันธมิตรห่วงโซ่อาหาร",
          actorCorpId: "cp_health",
          targetCorpId: "thai_organic",
          headlineTh: "บมจ. เจริญผล ฟู้ดแอนด์เฮลท์ จับมือ สหกรณ์เกษตรอินทรีย์ รับซื้อแป้งโม่ละเอียดและโดว์เนยสดป้อนเชนเบเกอรี่",
          impactTh: "เปิดตลาดรับซื้อแป้งโม่ละเอียด (T1), น้ำมันปาล์มบริสุทธิ์ (T1) และโดว์เพสตรี้ (T2) จากโรงงานที่มีผลผลิตเหลือใช้",
        },
      ];
      const initialDemands = [
        {
          id: "b2b-dem-1",
          day: 1,
          buyerCorpId: "cp_health",
          buyerNameTh: "บมจ. เจริญผล ฟู้ดแอนด์เฮลท์ โกลบอล",
          materialId: "artisan_flour",
          materialNameTh: "แป้งข้าวหอมและแป้งสาลีโม่ละเอียด (แปรรูป T1)",
          tier: 1,
          unitPriceSatang: 6000,
          recommendedQty: 4,
          reasonTh: "ต้องการแป้งโม่ละเอียดป้อนสายพานเบเกอรี่และโปรตีนเกษตร",
        },
        {
          id: "b2b-dem-2",
          day: 1,
          buyerCorpId: "siam_naturals",
          buyerNameTh: "บมจ. สยามเนเชอรัล ฟู้ดส์ แอนด์ เบเกอรี่",
          materialId: "bakery_dough_butter",
          materialNameTh: "โดว์ขนมปังหมักยีสต์และเนยเพสตรี้พร้อมอบ (กลางน้ำ T2)",
          tier: 2,
          unitPriceSatang: 8100,
          recommendedQty: 4,
          reasonTh: "สั่งซื้อโดว์เนยสดแช่แข็งไปอบครัวซองต์ส่งซูเปอร์มาร์เก็ต",
        },
        {
          id: "b2b-dem-3",
          day: 1,
          buyerCorpId: "shenzhen_semi",
          buyerNameTh: "บจก. เซินเจิ้น เซมิคอนดักเตอร์ แอนด์ ฟาวน์ดรี",
          materialId: "metallurgical_silicon",
          materialNameTh: "แท่งซิลิคอนบริสุทธิ์เกรดโลหะวิทยา MG-Si (แปรรูป T1)",
          tier: 1,
          unitPriceSatang: 7600,
          recommendedQty: 4,
          reasonTh: "รับซื้อแท่งซิลิคอน MG-Si ที่ถลุงจากทรายควอตซ์ไปดึงผลึกเวเฟอร์",
        },
        {
          id: "b2b-dem-4",
          day: 1,
          buyerCorpId: "tokyo_elec",
          buyerNameTh: "บจก. โตเกียว อิเล็กทรอนิกส์ แอนด์ โรโบติกส์ (ประเทศไทย)",
          materialId: "silicon_wafer",
          materialNameTh: "แผ่นซิลิคอนเวเฟอร์เกรดเซมิคอนดักเตอร์ (กลางน้ำ T2)",
          tier: 2,
          unitPriceSatang: 11500,
          recommendedQty: 4,
          reasonTh: "รับซื้อแผ่นซิลิคอนเวเฟอร์ความบริสุทธิ์สูงสำหรับสายพานเซนเซอร์ญี่ปุ่น",
        },
        {
          id: "b2b-dem-5",
          day: 1,
          buyerCorpId: "siam_aero_robotics",
          buyerNameTh: "บจก. สยาม แอโรสเปซ แอนด์ ออโตโนมัส โรโบติกส์",
          materialId: "microchip",
          materialNameTh: "ชิปไมโครโพรเซสเซอร์ระดับนาโน (ชิ้นส่วน T3)",
          tier: 3,
          unitPriceSatang: 13200,
          recommendedQty: 3,
          reasonTh: "รับซื้อชิปประมวลผลที่ผลิตในไทยไปประกอบโดรนขนส่งอัตโนมัติ",
        },
        {
          id: "b2b-dem-6",
          day: 1,
          buyerCorpId: "green_power",
          buyerNameTh: "บจก. กรีนพาวเวอร์ โซลูชั่นส์ เอเชีย",
          materialId: "battery",
          materialNameTh: "โมดูลแบตเตอรี่ลิเธียมความปลอดภัยสูง (ชิ้นส่วน T3)",
          tier: 3,
          unitPriceSatang: 14200,
          recommendedQty: 3,
          reasonTh: "รับซื้อเซลล์แบตเตอรี่ลิเธียมป้อนโครงการสมาร์ตกริด",
        },
      ];
      return {
        corporations,
        ecosystemFeed: initialFeed,
        b2bMaterialDemands: initialDemands,
        b2bMaterialSalesHistory: [],
        totalB2BMaterialSalesUnits: 0,
        totalB2BMaterialRevenueSatang: 0,
        clients,
        suppliers,
        competitors,
        ourMarketSharePct: 2.0,
        government: {
          activePolicyId: firstPolicy.id,
          nameTh: firstPolicy.nameTh,
          summaryTh: firstPolicy.summaryTh,
          corporateTaxPct: firstPolicy.corporateTaxPct,
          demandMultiplier: firstPolicy.demandMultiplier,
          greenBonus: firstPolicy.greenBonus,
          lastUpdatedDay: 1,
        },
        stockMarket: {
          indices,
          companyValuation: 18000000,
          sharePriceBaht: 18.0,
          creditRating: "BBB+",
          ipoReadinessPct: 22,
        },
        ceoDirective: {
          id: firstDirective.id,
          nameTh: firstDirective.nameTh,
          descTh: firstDirective.descTh,
          updatedDay: 1,
          ceoName: "ธีร์",
        },
        assetPortfolio: {
          supplyChainStrategy: "balanced_hybrid",
          ownedAssets: {},
          chainSettings: Object.fromEntries(
            Object.keys(D.PRODUCTION_CHAINS || {}).map((cid) => [
              cid,
              {
                id: cid,
                enabled: true,
                batchesCompleted: 0,
                unitsRefined: 0,
                costSavedSatang: 0,
              },
            ]),
          ),
          marketPriceIndex: Object.fromEntries(
            Object.keys(D.createCatalog().materials || {}).map((mid) => [mid, 1.0]),
          ),
          harvestHistory: [],
          chainHistory: [],
          totalHarvestedUnits: 0,
          totalRefinedUnits: 0,
          totalChainSavingsSatang: 0,
          totalAssetDividendsSatang: 0,
        },
      };
    }

    const facilityLevel = (w, key) => w.facilities?.levels?.[key] || 1;
    const facilityForJob = (kind) => ({
      sales: "hq", purchase: "hq", invoice: "hq", research: "rnd",
      assembly: "factory", rework: "factory", qa: "factory",
      packing: "warehouse", shipping: "warehouse",
    })[kind];
    const clone = (o) => JSON.parse(JSON.stringify(o)),
      clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const now = (w) => w.clock.absoluteMinute,
      day = (w) => Math.floor(now(w) / 1440) + 1,
      tod = (w) => now(w) % 1440;
    const id = (w, prefix) => prefix + "-" + ++w.sequence;
    const own = (obj, key) =>
      obj && typeof key === "string" && Object.hasOwn(obj, key)
        ? obj[key]
        : null;
    const int = (n, min = 0, max = Number.MAX_SAFE_INTEGER) =>
      Number.isSafeInteger(n) && n >= min && n <= max;
    function seedHash(seed) {
      let h = 2166136261;
      for (const ch of String(seed)) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0 || 0x9e3779b9;
    }
    function random(w) {
      let x = w.rng.state;
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      w.rng.state = x >>> 0;
      w.rng.draws++;
      return w.rng.state / 4294967296;
    }
    function event(w, code, message, details = {}) {
      w.events.push({
        id: id(w, "event"),
        at: now(w),
        code,
        message,
        details: clone(details),
      });
      if (w.events.length > 120) w.events.shift();
    }
    function post(w, kind, delta, reference) {
      return E.post(w.finance, {
        id: id(w, "tx"),
        kind,
        delta,
        at: now(w),
        reference,
      });
    }

    function ensurePersonExtensions(w, p) {
      if (!p) return;
      if (!p.identity || typeof p.identity !== "object") {
        p.identity = D.createIdentity
          ? D.createIdentity(w ? w.seed : "company", p.id, p.name, p.role)
          : {
              nationality: "TH",
              nationalityTh: "ไทย",
              flag: "🇹🇭",
              codeTh: "TH · ไทย",
              gender: "M",
              genderTh: "ชาย",
              genderSymbol: "♂",
              age: 26,
              firstName: p.name,
              lastName: "วงศ์สุวรรณ",
              nickname: p.name,
              fullName: p.name,
              displayName: p.name,
              educationTh: "ปวส. เทคนิคอุตสาหกรรม",
              hometownTh: "นนทบุรี",
            };
      }
      const deptSpec = D.ROLE_DEPARTMENTS?.[p.role] || {
        divisionId: ["sales", "admin", "engineer"].includes(p.role)
          ? "office"
          : p.role === "coordinator"
            ? "executive"
            : "factory",
        divisionNameTh: "ฝ่ายปฏิบัติการ",
        departmentTh: "ฝ่ายปฏิบัติการ",
        coreDutiesTh: "ปฏิบัติงานตามสายวิชาชีพ",
      };
      const constructedPlots = w?.facilities?.constructedPlots || [];
      if (!p.career || typeof p.career !== "object") {
        const step = D.getCareerStep ? D.getCareerStep(p.role, 1) : { level: 1, gradeCode: "G1", titleTh: p.role, badge: "Lv.1" };
        const orgUnit = D.resolveOrgAssignment
          ? D.resolveOrgAssignment(p.role, 1, p.id, constructedPlots)
          : null;
        p.career = {
          level: 1,
          gradeCode: step.gradeCode || "G1",
          titleTh: step.titleTh,
          badge: step.badge,
          division: deptSpec.divisionId,
          divisionNameTh: deptSpec.divisionNameTh,
          departmentTh: orgUnit ? orgUnit.departmentNameTh : deptSpec.departmentTh,
          sectionTh: orgUnit ? orgUnit.sectionNameTh : deptSpec.departmentTh,
          groupTh: orgUnit ? orgUnit.groupNameTh : "กลุ่มปฏิบัติการหลัก",
          tierNameTh: orgUnit ? orgUnit.tierNameTh : "พนักงานปฏิบัติการระดับต้น",
          orgPathTh: orgUnit ? orgUnit.orgPathTh : deptSpec.departmentTh,
          orgUnit,
          dutyTh: step.dutyTh || deptSpec.coreDutiesTh,
          isCEO: false,
          promotions: 0,
          tasksCompleted: 0,
          dealsNegotiated: 0,
          poIssued: 0,
          bonusTotal: 0,
          lastBonusAmount: 0,
          lastBonusDay: 0,
          lastPromotionDay: 0,
          mentorId: null,
          mentorName: null,
          menteesHelped: 0,
          satisfaction: 76,
          kpiScore: 58,
          history: [],
        };
      } else {
        const lv = p.career.level || 1;
        const step = D.getCareerStep ? D.getCareerStep(p.role, lv) : null;
        const orgUnit = D.resolveOrgAssignment
          ? D.resolveOrgAssignment(p.role, lv, p.id, constructedPlots)
          : null;
        if (!p.career.division) p.career.division = deptSpec.divisionId;
        if (!p.career.divisionNameTh) p.career.divisionNameTh = deptSpec.divisionNameTh;
        if (!p.career.departmentTh) p.career.departmentTh = orgUnit ? orgUnit.departmentNameTh : deptSpec.departmentTh;
        if (!p.career.sectionTh && orgUnit) p.career.sectionTh = orgUnit.sectionNameTh;
        if (!p.career.groupTh && orgUnit) p.career.groupTh = orgUnit.groupNameTh;
        if (!p.career.gradeCode) p.career.gradeCode = step?.gradeCode || orgUnit?.gradeCode || ("G" + lv);
        if (!p.career.tierNameTh && orgUnit) p.career.tierNameTh = orgUnit.tierNameTh;
        if (!p.career.orgPathTh && orgUnit) p.career.orgPathTh = orgUnit.orgPathTh;
        if (!p.career.orgUnit && orgUnit) p.career.orgUnit = orgUnit;
        if (!p.career.dutyTh) {
          p.career.dutyTh = step?.dutyTh || deptSpec.coreDutiesTh;
        }
      }
    }
    function updateSatisfactionAndKpi(w, p, currentDay) {
      ensurePersonExtensions(w, p);
      const roleSkill = w.catalog.roles[p.role]?.skill || "assembly";
      const skillLv = p.skills[roleSkill]?.level || 40;
      const expectedWage = Math.max(
        w.catalog.rules.minimumWage,
        26000 + skillLv * 180 + (p.career.level - 1) * 3500,
      );
      const wageFairness = clamp(((p.pay.dailyWage - expectedWage) / Math.max(1, expectedWage)) * 45, -15, 16);
      const unpaidPenalty = p.pay.overdueSince !== null ? 18 : 0;
      const bonusGlow = p.career.lastBonusDay > 0 && currentDay - p.career.lastBonusDay <= 7 ? 8 : 0;
      const promoGlow = p.career.lastPromotionDay > 0 && currentDay - p.career.lastPromotionDay <= 10 ? 7 : 0;
      const rawSat =
        p.state.morale * 0.42 +
        p.state.fulfillment * 0.26 +
        p.state.energy * 0.12 -
        p.state.stress * 0.16 -
        p.state.burnout * 0.22 +
        16 +
        wageFairness -
        unpaidPenalty +
        bonusGlow +
        promoGlow;
      p.career.satisfaction = Math.round(clamp(rawSat, 5, 100) * 10) / 10;

      const taskScore = Math.min(34, (p.career.tasksCompleted || 0) * 2.8);
      const workScore = Math.min(18, ((p.experience.workMinutes || 0) / Math.max(180, currentDay * 240)) * 18);
      const helpScore = Math.min(10, ((p.experience.helpMinutes || 0) / 25) * 3 + (p.career.menteesHelped || 0) * 1.2);
      const rawKpi = skillLv * 0.45 + taskScore + workScore + helpScore + (p.state.morale - 50) * 0.1;
      p.career.kpiScore = Math.round(clamp(rawKpi, 10, 100) * 10) / 10;
    }

    function createPerson(w, pid, name, role, wage) {
      const profile = H.createProfile(w.seed, pid),
        skills = {};
      for (const spec of Object.values(w.catalog.skills))
        skills[spec.id] = H.createSkill(profile, spec);
      const primary = w.catalog.roles[role].skill;
      skills[primary].level = Math.min(
        H.skillCap(profile, w.catalog.skills[primary]),
        skills[primary].level + 23,
      );
      const identity = D.createIdentity ? D.createIdentity(w.seed, pid, name, role) : null;
      const step = D.getCareerStep ? D.getCareerStep(role, 1) : { level: 1, titleTh: role, badge: "Lv.1" };
      const deptSpec = D.ROLE_DEPARTMENTS?.[role] || {
        divisionId: ["sales", "admin", "engineer"].includes(role)
          ? "office"
          : role === "coordinator"
            ? "executive"
            : "factory",
        divisionNameTh: "ฝ่ายปฏิบัติการ",
        departmentTh: "ฝ่ายปฏิบัติการ",
        coreDutiesTh: "ปฏิบัติงานตามสายวิชาชีพ",
      };
      const isFirstCEO =
        role === "coordinator" &&
        !(w.people && w.people.some((other) => other.employed && other.role === "coordinator" && other.career?.isCEO));
      const person = {
        id: pid,
        name,
        role,
        profile,
        skills,
        state: H.createState(profile),
        identity,
        career: {
          level: isFirstCEO ? 4 : 1,
          titleTh: isFirstCEO ? "ประธานเจ้าหน้าที่บริหาร (CEO)" : step.titleTh,
          badge: isFirstCEO ? "CEO" : step.badge,
          division: deptSpec.divisionId,
          divisionNameTh: deptSpec.divisionNameTh,
          departmentTh: deptSpec.departmentTh,
          dutyTh: isFirstCEO
            ? "ผู้นำสูงสุดขององค์กร กำหนดกลยุทธ์ อนุมัติงบลงทุน และตัดสินใจเลื่อนตำแหน่งผู้บริหาร"
            : step.dutyTh || deptSpec.coreDutiesTh,
          isCEO: isFirstCEO,
          promotions: 0,
          tasksCompleted: 0,
          dealsNegotiated: 0,
          poIssued: 0,
          bonusTotal: 0,
          lastBonusAmount: 0,
          lastBonusDay: 0,
          lastPromotionDay: 0,
          mentorId: null,
          mentorName: null,
          menteesHelped: 0,
          satisfaction: 76,
          kpiScore: 58,
          history: [],
        },
        employed: true,
        hiredAt: now(w),
        leftAt: null,
        position: { ...w.layout.entrance },
        previousPosition: { ...w.layout.entrance },
        path: [],
        activity: "offDuty",
        intent: { code: "offDuty", reasons: [] },
        decision: null,
        taskId: null,
        stationId: null,
        breakUntil: 0,
        breakKind: null,
        atWork: false,
        ot: { day: 0, decision: "none", maxMinutes: 0 },
        pay: {
          dailyWage: wage,
          dayWage: wage,
          overdueSince: null,
          dueBase: 0,
          dueOT: 0,
          totalEarned: 0,
          totalPaid: 0,
          wallet: 0,
          outsideSpending: 0,
        },
        experience: { workMinutes: 0, helpMinutes: 0 },
        dayStats: { workMinutes: 0, otMinutes: 0 },
        relationships: {},
        concern: null,
        visual: {
          key: "employee.default",
          variant: seedHash(pid),
          roleKey: role,
        },
      };
      // Wait: keep career.level = 1 for starter coordinator if quota test checks ceo.career.level = 4!
      // Let's check quota-and-multi-industry.test.cjs:
      // const hrExec = S.getDepartmentHeadroom(w, "coordinator", 4);
      // assert.equal(hrExec.allowed, true);
      // const ceo = w.people.find((p) => p.role === "coordinator");
      // ceo.career.level = 4;
      // So starter coordinator starts at career.level = 1 with isCEO: true!
      person.career.level = 1;
      person.career.badge = step.badge;
      person.career.titleTh = isFirstCEO ? `ผู้บริหารสูงสุด / CEO (${step.titleTh})` : step.titleTh;
      updateSatisfactionAndKpi(w, person, 1);
      return person;
    }

    function pickClientForProduct(w, productId, offerId) {
      if (!w.externalWorld || !w.externalWorld.clients) return null;
      const clients = Object.values(w.externalWorld.clients);
      if (!clients.length) return null;
      const prod = w.catalog.products[productId];
      const matching = clients.filter(
        (c) =>
          (Array.isArray(c.preferredProducts) && c.preferredProducts.includes(productId)) ||
          (prod && prod.industry && c.sector === prod.industry),
      );
      const pool = matching.length ? matching : clients;
      return pool[seedHash(w.seed + ":" + offerId) % pool.length];
    }

    function pickSupplierForMaterial(w, materialId, purchaseId) {
      if (!w.externalWorld || !w.externalWorld.suppliers) return null;
      const sups = Object.values(w.externalWorld.suppliers);
      if (!sups.length) return null;
      const matching = sups.filter((s) => Array.isArray(s.materials) && s.materials.includes(materialId));
      const pool = matching.length ? matching : sups;
      return pool[seedHash(w.seed + ":" + purchaseId) % pool.length];
    }

    function ensureAssetPortfolio(w) {
      if (!w.externalWorld) w.externalWorld = freshExternalWorld(w.seed);
      if (!w.externalWorld.assetPortfolio || typeof w.externalWorld.assetPortfolio !== "object") {
        w.externalWorld.assetPortfolio = {
          supplyChainStrategy: "balanced_hybrid",
          ownedAssets: {},
          chainSettings: Object.fromEntries(
            Object.keys(D.PRODUCTION_CHAINS || {}).map((cid) => [
              cid,
              { id: cid, enabled: true, batchesCompleted: 0, unitsRefined: 0, costSavedSatang: 0 },
            ]),
          ),
          marketPriceIndex: Object.fromEntries(
            Object.keys(w.catalog.materials || {}).map((mid) => [mid, 1.0]),
          ),
          harvestHistory: [],
          chainHistory: [],
          totalHarvestedUnits: 0,
          totalRefinedUnits: 0,
          totalChainSavingsSatang: 0,
          totalAssetDividendsSatang: 0,
        };
      }
      const ap = w.externalWorld.assetPortfolio;
      if (!ap.ownedAssets) ap.ownedAssets = {};
      if (!ap.chainSettings) ap.chainSettings = {};
      for (const cid of Object.keys(D.PRODUCTION_CHAINS || {})) {
        if (!ap.chainSettings[cid]) {
          ap.chainSettings[cid] = { id: cid, enabled: true, batchesCompleted: 0, unitsRefined: 0, costSavedSatang: 0 };
        }
      }
      if (!Array.isArray(ap.harvestHistory)) ap.harvestHistory = [];
      if (!Array.isArray(ap.chainHistory)) ap.chainHistory = [];
      return ap;
    }

    function getActiveExternalAssetBonuses(w) {
      const owned = w.externalWorld?.assetPortfolio?.ownedAssets || {};
      let rentReductionPct = 0;
      let productionSpeedBonus = 0;
      let packingSpeedBonus = 0;
      let shippingSpeedBonus = 0;
      let leadTimeReductionPct = 0;
      let pricePremiumBonus = 0;
      let depositPctBonus = 0;
      let foodQaBonus = 0;
      let wearReductionPct = 0;
      let deadlineBonusDays = 0;
      let moraleBonusDaily = 0;
      let energyBonusDaily = 0;

      for (const [aid, rec] of Object.entries(owned)) {
        if (!rec || !rec.active) continue;
        const spec = D.EXTERNAL_ASSETS?.[aid];
        if (!spec) continue;
        const lvMult = 1 + ((rec.level || 1) - 1) * 0.35;
        rentReductionPct += (spec.rentReductionPct || 0) * lvMult;
        productionSpeedBonus += (spec.productionSpeedBonus || 0) * lvMult;
        packingSpeedBonus += (spec.packingSpeedBonus || 0) * lvMult;
        shippingSpeedBonus += (spec.shippingSpeedBonus || 0) * lvMult;
        leadTimeReductionPct += (spec.leadTimeReductionPct || 0) * lvMult;
        pricePremiumBonus += (spec.pricePremiumBonus || 0) * lvMult;
        depositPctBonus += (spec.depositPctBonus || 0) * lvMult;
        foodQaBonus += (spec.foodQaBonus || 0) * lvMult;
        wearReductionPct += (spec.wearReductionPct || 0) * lvMult;
        deadlineBonusDays += spec.deadlineBonusDays || 0;
        moraleBonusDaily += spec.moraleBonusDaily || 0;
        energyBonusDaily += spec.energyBonusDaily || 0;
      }
      return {
        rentReductionPct: Math.min(0.55, rentReductionPct),
        productionSpeedBonus: Math.min(0.25, productionSpeedBonus),
        packingSpeedBonus: Math.min(0.25, packingSpeedBonus),
        shippingSpeedBonus: Math.min(0.25, shippingSpeedBonus),
        leadTimeReductionPct: Math.min(0.45, leadTimeReductionPct),
        pricePremiumBonus: Math.min(0.18, pricePremiumBonus),
        depositPctBonus: Math.min(0.15, depositPctBonus),
        foodQaBonus: Math.min(0.15, foodQaBonus),
        wearReductionPct: Math.min(0.35, wearReductionPct),
        deadlineBonusDays: Math.min(3, deadlineBonusDays),
        moraleBonusDaily: Math.min(5, moraleBonusDaily),
        energyBonusDaily: Math.min(6, energyBonusDaily),
      };
    }

    function safeAvailableToDeduct(w, matId) {
      if (!Object.hasOwn(w.inventory.materials, matId)) return 0;
      const freeStock = (w.inventory.materials[matId] || 0) - (w.inventory.reserved[matId] || 0);
      const fromOpening = w.inventory.opening[matId] || 0;
      // Also allow deducting from received purchases as long as each received purchase keeps quantity >= 1
      let fromPurchases = 0;
      for (const p of Object.values(w.purchases || {})) {
        if (p.materialId === matId && p.status === "received" && p.quantity > 1) {
          fromPurchases += p.quantity - 1;
        }
      }
      return Math.max(0, Math.min(freeStock, fromOpening + fromPurchases));
    }

    function safeDeductMaterial(w, matId, deductQty) {
      let rem = deductQty;
      const fromOpening = Math.min(w.inventory.opening[matId] || 0, rem);
      if (fromOpening > 0) {
        w.inventory.opening[matId] -= fromOpening;
        w.inventory.materials[matId] -= fromOpening;
        rem -= fromOpening;
      }
      if (rem > 0) {
        for (const p of Object.values(w.purchases || {})) {
          if (rem <= 0) break;
          if (p.materialId === matId && p.status === "received" && p.quantity > 1) {
            const take = Math.min(p.quantity - 1, rem);
            p.quantity -= take;
            w.inventory.purchased[matId] -= take;
            w.inventory.materials[matId] -= take;
            rem -= take;
          }
        }
      }
    }

    function craftMaterialRecipe(w, materialId, batches = 1, options = {}) {
      const ap = ensureAssetPortfolio(w);
      const matSpec = w.catalog.materials?.[materialId];
      if (!matSpec) {
        return { ok: false, code: "unknownMaterial", message: "ไม่พบวัตถุดิบที่ระบุในคลังข้อมูล" };
      }
      const recipe = D.MATERIAL_RECIPES?.[materialId];
      if (matSpec.craftable === false || matSpec.tier === 0 || !recipe) {
        return {
          ok: false,
          code: "uncraftableMaterial",
          message: `"${matSpec.nameTh}" เป็นทรัพยากรธรรมชาติต้นน้ำ (Tier 0) ไม่สามารถสังเคราะห์เองได้ ต้องเก็บเกี่ยวจากสินทรัพย์ภายนอกหรือสั่งซื้อจากซัพพลายเออร์`,
        };
      }
      const reqResearch = recipe.minResearch || 0;
      if (!options.ignoreTechGate && (w.research?.points || 0) < reqResearch) {
        return {
          ok: false,
          code: "insufficientResearch",
          message: `ยังขาดองค์ความรู้ R&D สำหรับผลิต "${matSpec.nameTh}" (Tier ${recipe.tier}) — ต้องการแต้มวิจัย ${reqResearch} แต้ม (ปัจจุบันมี ${Math.round(w.research?.points || 0)} แต้ม ช่วงต้นเกมต้องสั่งซื้อจากซัพพลายเออร์ไปก่อน)`,
        };
      }
      const reqBatches = Math.max(1, Math.min(50, Math.floor(Number(batches) || 1)));
      let possibleBatches = reqBatches;
      for (const [inMat, inQty] of Object.entries(recipe.inputs || {})) {
        if (!Object.hasOwn(w.inventory.materials, inMat)) {
          possibleBatches = 0;
          break;
        }
        const avail = safeAvailableToDeduct(w, inMat);
        possibleBatches = Math.min(possibleBatches, Math.floor(avail / inQty));
      }
      if (possibleBatches <= 0) {
        const neededStr = Object.entries(recipe.inputs || {})
          .map(([m, q]) => `${w.catalog.materials[m]?.nameTh || m} ×${q}`)
          .join(" + ");
        return {
          ok: false,
          code: "insufficientInputMaterials",
          message: `วัตถุดิบตั้งต้นในคลังไม่พอสำหรับแปรรูป "${matSpec.nameTh}" (ต้องใช้: ${neededStr})`,
        };
      }

      let inputValueSatang = 0;
      for (const [inMat, inQty] of Object.entries(recipe.inputs || {})) {
        const deduct = inQty * possibleBatches;
        safeDeductMaterial(w, inMat, deduct);
        inputValueSatang += (w.catalog.materials[inMat]?.unitCost || 2000) * deduct;
      }

      let outputValueSatang = 0;
      let totalUnitsOut = 0;
      const outSummary = [];
      for (const [outMat, outQty] of Object.entries(recipe.outputs || {})) {
        if (!Object.hasOwn(w.inventory.materials, outMat)) continue;
        const addQty = outQty * possibleBatches;
        w.inventory.opening[outMat] += addQty;
        w.inventory.materials[outMat] += addQty;
        outputValueSatang += (w.catalog.materials[outMat]?.unitCost || 4000) * addQty;
        totalUnitsOut += addQty;
        outSummary.push(`${w.catalog.materials[outMat]?.nameTh || outMat} +${addQty}`);
      }

      const saved = Math.max(0, outputValueSatang - inputValueSatang);
      ap.totalRefinedUnits = (ap.totalRefinedUnits || 0) + totalUnitsOut;
      ap.totalChainSavingsSatang = (ap.totalChainSavingsSatang || 0) + saved;
      if (!ap.recipeStats) ap.recipeStats = {};
      if (!ap.recipeStats[materialId]) {
        ap.recipeStats[materialId] = { batches: 0, unitsProduced: 0, savedSatang: 0 };
      }
      ap.recipeStats[materialId].batches += possibleBatches;
      ap.recipeStats[materialId].unitsProduced += totalUnitsOut;
      ap.recipeStats[materialId].savedSatang += saved;

      ap.chainHistory.unshift({
        day: day(w),
        at: now(w),
        chainId: "recipe:" + materialId,
        chainNameTh: recipe.nameTh,
        batches: possibleBatches,
        outputsTh: outSummary.join(", "),
        costSavedSatang: saved,
      });
      if (ap.chainHistory.length > 40) ap.chainHistory.pop();

      if (!options.silent) {
        event(
          w,
          "materialCrafted",
          `⚗️ โรงงานแปรรูปวัตถุดิบขั้นที่ ${recipe.tier} สำเร็จ: ${recipe.nameTh} จำนวน ${possibleBatches} ล็อต ได้ ${outSummary.join(", ")} เข้าคลัง (ประหยัดต้นทุน ฿${(saved / 100).toLocaleString("th-TH")})`,
          {
            materialId,
            tier: recipe.tier,
            batches: possibleBatches,
            unitsProduced: totalUnitsOut,
            savedSatang: saved,
          },
        );
      }
      return {
        ok: true,
        materialId,
        tier: recipe.tier,
        batches: possibleBatches,
        unitsProduced: totalUnitsOut,
        savedSatang: saved,
      };
    }

    function sellMaterialB2B(w, materialId, quantity = 2, buyerCorpId = null, options = {}) {
      ensureAssetPortfolio(w);
      const matSpec = w.catalog.materials?.[materialId];
      if (!matSpec) {
        return { ok: false, code: "unknownMaterial", message: "ไม่พบวัตถุดิบที่ระบุ" };
      }
      const qty = Math.max(1, Math.min(200, Math.floor(Number(quantity) || 2)));
      const freeStock = safeAvailableToDeduct(w, materialId);
      if (freeStock < qty) {
        return {
          ok: false,
          code: "insufficientMaterialStock",
          message: `สต็อก "${matSpec.nameTh}" ที่ปลอดภาระจองมีไม่พอขาย (มี ${freeStock} ชิ้น ต้องการขาย ${qty} ชิ้น)`,
        };
      }

      if (!w.externalWorld) w.externalWorld = freshExternalWorld(w.seed);
      if (!w.externalWorld.corporations) {
        w.externalWorld.corporations = freshExternalWorld(w.seed).corporations;
      }
      const corps = Object.values(w.externalWorld.corporations || {});
      let buyer = buyerCorpId ? w.externalWorld.corporations[buyerCorpId] : null;
      if (!buyer) {
        const interested = corps.filter(
          (c) => Array.isArray(c.buysMaterials) && c.buysMaterials.includes(materialId),
        );
        const pool = interested.length ? interested : corps;
        buyer =
          pool.sort(
            (a, b) =>
              (b.relationshipMode === "partner" ? 20 : 0) +
                (b.trustScore || 50) -
                ((a.relationshipMode === "partner" ? 20 : 0) + (a.trustScore || 50)),
          )[0] || null;
      }

      const activeDemand = (w.externalWorld.b2bMaterialDemands || []).find(
        (d) => d.materialId === materialId && (!buyerCorpId || d.buyerCorpId === buyerCorpId),
      );
      const baseSellPrice =
        D.MATERIAL_RECIPES?.[materialId]?.b2bSellPrice ||
        matSpec.b2bSellPrice ||
        Math.round(matSpec.unitCost * 1.28);
      const idxMult = w.externalWorld.assetPortfolio?.marketPriceIndex?.[materialId] || 1.0;
      const partnerBonus = buyer && buyer.relationshipMode === "partner" ? 1.08 : 1.0;
      const unitPriceSatang = activeDemand
        ? Math.round(activeDemand.unitPriceSatang * partnerBonus)
        : Math.round(baseSellPrice * idxMult * partnerBonus);
      const revenueSatang = unitPriceSatang * qty;
      const costBasisSatang = matSpec.unitCost * qty;
      const profitSatang = revenueSatang - costBasisSatang;

      if (!Number.isSafeInteger(w.finance.cash + revenueSatang)) {
        return { ok: false, code: "financialLimit", message: "วงเงินเกินขีดจำกัด" };
      }

      // Deduct safely so opening >= 0 and audit(w) stock === opening + purchased - consumed remains 100% invariant
      safeDeductMaterial(w, materialId, qty);

      const refId = `b2bMat:${materialId}:${++w.sequence}`;
      post(w, "sales", revenueSatang, refId);

      if (buyer) {
        buyer.b2bPurchasesCount = (buyer.b2bPurchasesCount || 0) + 1;
        buyer.b2bPurchasesSatang = (buyer.b2bPurchasesSatang || 0) + revenueSatang;
        buyer.trustScore = clamp((buyer.trustScore || 50) + 2, 0, 100);
        buyer.lastActionDay = day(w);
        buyer.lastActionTh = `รับซื้อวัตถุดิบ ${matSpec.nameTh} ×${qty} ชิ้น จากบริษัทของเรา`;
        if (w.externalWorld.clients?.[buyer.id]) {
          w.externalWorld.clients[buyer.id].trustScore = buyer.trustScore;
          w.externalWorld.clients[buyer.id].totalRevenueSatang =
            (w.externalWorld.clients[buyer.id].totalRevenueSatang || 0) + revenueSatang;
        }
      }

      w.externalWorld.totalB2BMaterialSalesUnits =
        (w.externalWorld.totalB2BMaterialSalesUnits || 0) + qty;
      w.externalWorld.totalB2BMaterialRevenueSatang =
        (w.externalWorld.totalB2BMaterialRevenueSatang || 0) + revenueSatang;
      if (!Array.isArray(w.externalWorld.b2bMaterialSalesHistory)) {
        w.externalWorld.b2bMaterialSalesHistory = [];
      }
      const saleRecord = {
        id: refId,
        day: day(w),
        at: now(w),
        materialId,
        materialNameTh: matSpec.nameTh,
        tier: matSpec.tier ?? 1,
        quantity: qty,
        unitPriceSatang,
        revenueSatang,
        profitSatang,
        buyerCorpId: buyer ? buyer.id : "market_b2b",
        buyerNameTh: buyer ? buyer.nameTh : "ตลาดกลางอุตสาหกรรม B2B",
      };
      w.externalWorld.b2bMaterialSalesHistory.unshift(saleRecord);
      if (w.externalWorld.b2bMaterialSalesHistory.length > 40) {
        w.externalWorld.b2bMaterialSalesHistory.pop();
      }

      event(
        w,
        "b2bMaterialSold",
        `📦 ขายส่งวัตถุดิบ/ชิ้นส่วน B2B: ส่งมอบ "${matSpec.nameTh}" (Tier ${matSpec.tier ?? 1}) จำนวน ${qty} ชิ้น ให้แก่ ${saleRecord.buyerNameTh} รับเงินสดทันที +฿${(revenueSatang / 100).toLocaleString("th-TH")}`,
        saleRecord,
      );
      return {
        ok: true,
        saleId: refId,
        materialId,
        quantity: qty,
        unitPriceSatang,
        revenueSatang,
        profitSatang,
        buyerCorpId: saleRecord.buyerCorpId,
        buyerNameTh: saleRecord.buyerNameTh,
      };
    }

    function setCorporationRelation(w, corpId, mode) {
      if (!w.externalWorld) w.externalWorld = freshExternalWorld(w.seed);
      if (!w.externalWorld.corporations) {
        w.externalWorld.corporations = freshExternalWorld(w.seed).corporations;
      }
      const corp = w.externalWorld.corporations?.[corpId];
      if (!corp) {
        return { ok: false, code: "unknownCorporation", message: "ไม่พบบริษัทภายนอกที่ระบุ" };
      }
      if (!["partner", "cordial", "neutral", "rival"].includes(mode)) {
        return { ok: false, code: "invalidRelationMode", message: "รูปแบบความสัมพันธ์ไม่ถูกต้อง" };
      }
      const oldMode = corp.relationshipMode || "neutral";
      if (mode === "partner" && oldMode !== "partner") {
        const allianceFee = 500000; // ฿5,000 joint venture & trade protocol setup
        if (w.finance.cash < allianceFee) {
          return { ok: false, code: "insufficientCash", message: "เงินสดไม่พอสำหรับลงนามบันทึกข้อตกลงพันธมิตรการค้า (฿5,000)" };
        }
        post(w, "expansion", -allianceFee, "alliance:" + corpId);
        corp.trustScore = clamp((corp.trustScore || 50) + 12, 0, 100);
      } else if (mode === "rival") {
        corp.trustScore = clamp((corp.trustScore || 50) - 10, 0, 100);
      } else if (mode === "cordial") {
        corp.trustScore = clamp((corp.trustScore || 50) + 4, 0, 100);
      }
      corp.relationshipMode = mode;
      if (w.externalWorld.clients?.[corpId]) {
        w.externalWorld.clients[corpId].trustScore = corp.trustScore;
      }
      if (w.externalWorld.suppliers?.[corpId]) {
        w.externalWorld.suppliers[corpId].trustScore = corp.trustScore;
      }
      const modeNameMap = {
        partner: "พันธมิตรยุทธศาสตร์ร่วมค้า (Strategic Partner +8% ราคาขาย B2B)",
        cordial: "คู่ค้ามิตรภาพ (Cordial Trade Partner)",
        neutral: "การค้าตามกลไกตลาด (Neutral Market)",
        rival: "คู่แข่งทางการค้าโดยตรง (Direct Rival)",
      };
      corp.lastActionDay = day(w);
      corp.lastActionTh = `ปรับสถานะความสัมพันธ์กับบริษัทเราเป็น: ${modeNameMap[mode]}`;
      event(
        w,
        "corporateDiplomacyChanged",
        `🤝 ปรับความสัมพันธ์ทางธุรกิจกับ "${corp.nameTh}" เป็น [${modeNameMap[mode]}]`,
        { corpId, mode, trustScore: corp.trustScore },
      );
      return { ok: true, corpId, mode, trustScore: corp.trustScore };
    }

    function simulateOffsiteEcosystemDaily(w, completedDay) {
      if (!w.externalWorld) return;
      const ext = w.externalWorld;
      if (!ext.corporations) {
        ext.corporations = freshExternalWorld(w.seed).corporations;
      }
      if (!Array.isArray(ext.ecosystemFeed)) ext.ecosystemFeed = [];
      if (!Array.isArray(ext.b2bMaterialDemands)) ext.b2bMaterialDemands = [];

      const corps = Object.values(ext.corporations);
      if (corps.length < 2) return;

      // 1. Simulate 2 Inter-Company Off-Site Events per day (External corporations trading, allying, and competing with EACH OTHER)
      const eventTypes = ["INTER_CORP_SUPPLY", "PRICE_WAR", "STRATEGIC_JV", "SUPPLY_SHOCK", "CORP_RIVALRY"];
      for (let slot = 0; slot < 2; slot++) {
        const h = seedHash(`${w.seed}:offsite:${completedDay}:${slot}`);
        const actor = corps[h % corps.length];
        const etype = eventTypes[(h >>> 4) % eventTypes.length];
        let targetPool = corps.filter((c) => c.id !== actor.id);
        if (etype === "PRICE_WAR" || etype === "CORP_RIVALRY") {
          const rivals = targetPool.filter((c) => (actor.rivalsWith || []).includes(c.id) || c.sector === actor.sector);
          if (rivals.length) targetPool = rivals;
        } else if (etype === "INTER_CORP_SUPPLY" || etype === "STRATEGIC_JV") {
          const allies = targetPool.filter((c) => (actor.alliesWith || []).includes(c.id));
          if (allies.length) targetPool = allies;
        }
        const target = targetPool[(h >>> 8) % targetPool.length] || corps[(h + 1) % corps.length];
        const sampleMatId =
          (actor.sellsMaterials && actor.sellsMaterials[h % actor.sellsMaterials.length]) ||
          (target.buysMaterials && target.buysMaterials[h % target.buysMaterials.length]) ||
          "silicon_wafer";
        const matNameTh = w.catalog.materials?.[sampleMatId]?.nameTh || sampleMatId;

        let badgeTh = "🌐 ความเคลื่อนไหวบริษัทภายนอก";
        let headlineTh = "";
        let impactTh = "";

        if (etype === "PRICE_WAR") {
          badgeTh = "⚔️ สงครามราคาคู่แข่งนอกนิคม";
          const shift = 0.3 + ((h % 6) * 0.1);
          actor.marketSharePct = Math.round(clamp((actor.marketSharePct || 8) + shift, 2, 30) * 10) / 10;
          target.marketSharePct = Math.round(clamp((target.marketSharePct || 8) - shift * 0.8, 2, 30) * 10) / 10;
          headlineTh = `${actor.nameTh} เปิดศึกหั่นราคาประมูลดีลแข่งกับ ${target.nameTh} แย่งชิงส่วนแบ่งตลาดหมวด${actor.sectorTh}`;
          impactTh = `ส่วนแบ่งตลาดของ ${actor.symbol} ขยับเป็น ${actor.marketSharePct}% ขณะที่ ${target.symbol} เร่งหาซัพพลายเออร์ ${matNameTh} ราคาคุ้มค่า`;
        } else if (etype === "INTER_CORP_SUPPLY") {
          badgeTh = "🚛 ดีลซัพพลายเชนระหว่างบริษัท";
          actor.interCompanyDealsCount = (actor.interCompanyDealsCount || 0) + 1;
          target.interCompanyDealsCount = (target.interCompanyDealsCount || 0) + 1;
          actor.cashMillionBaht = Math.round(((actor.cashMillionBaht || 300) + 12) * 10) / 10;
          headlineTh = `${actor.nameTh} จัดส่งขบวนรถวัตถุดิบ ${matNameTh} ล็อตใหญ่ป้อนโรงงานของ ${target.nameTh}`;
          impactTh = `การค้าวัตถุดิบกลางน้ำคึกคัก ดัชนีราคารับซื้อ ${matNameTh} ในตลาด B2B ปรับตัวดีขึ้น`;
          if (ext.assetPortfolio?.marketPriceIndex?.[sampleMatId]) {
            ext.assetPortfolio.marketPriceIndex[sampleMatId] =
              Math.round(clamp(ext.assetPortfolio.marketPriceIndex[sampleMatId] + 0.06, 0.85, 1.38) * 100) / 100;
          }
        } else if (etype === "STRATEGIC_JV") {
          badgeTh = "🤝 พันธมิตรร่วมทุนนอกนิคม";
          actor.strength = clamp((actor.strength || 60) + 1, 40, 95);
          target.strength = clamp((target.strength || 60) + 1, 40, 95);
          headlineTh = `${actor.nameTh} ลงนามบันทึกข้อตกลงร่วมวิจัยและแลกเปลี่ยนชิ้นส่วนกับ ${target.nameTh}`;
          impactTh = `ยกระดับมาตรฐานอุตสาหกรรม${actor.sectorTh} และเปิดรับซื้อชิ้นส่วนกลางน้ำจากโรงงานพันธมิตรเพิ่ม`;
        } else if (etype === "SUPPLY_SHOCK") {
          badgeTh = "📈 ตลาดขาดแคลนวัตถุดิบกลางน้ำ";
          headlineTh = `${target.nameTh} ประกาศรับซื้อ "${matNameTh}" ด่วนพิเศษ เนื่องจากซัพพลายเออร์เดิมส่งมอบล่าช้า`;
          impactTh = `ราคารับซื้อ B2B ของ ${matNameTh} พุ่งสูงขึ้น +15% เป็นโอกาสทองของโรงงานที่ผลิตวัตถุดิบนี้เองได้!`;
          if (ext.assetPortfolio?.marketPriceIndex?.[sampleMatId]) {
            ext.assetPortfolio.marketPriceIndex[sampleMatId] =
              Math.round(clamp(ext.assetPortfolio.marketPriceIndex[sampleMatId] + 0.14, 0.9, 1.42) * 100) / 100;
          }
        } else {
          badgeTh = "🏭 การแข่งขันขยายกำลังผลิต";
          headlineTh = `${actor.nameTh} ทุ่มงบขยายไลน์ผลิตแข่งกับ ${target.nameTh} ในนิคมภาคตะวันออก`;
          impactTh = `ทั้งสองบริษัทต้องการวัตถุดิบแปรรูป (Tier 1–3) และสินค้าสำเร็จรูปป้อนเครือข่ายคู่ค้าเพิ่มขึ้น`;
        }

        actor.lastActionDay = completedDay;
        actor.lastActionTh = headlineTh;
        ext.ecosystemFeed.unshift({
          id: `eco-d${completedDay}-${slot}`,
          day: completedDay,
          type: etype,
          badgeTh,
          actorCorpId: actor.id,
          targetCorpId: target.id,
          headlineTh,
          impactTh,
        });
      }
      if (ext.ecosystemFeed.length > 40) {
        ext.ecosystemFeed.length = 40;
      }

      // Sync competitor market shares from corporations table
      if (ext.competitors) {
        for (const [cid, compObj] of Object.entries(ext.competitors)) {
          if (ext.corporations[cid]) {
            compObj.marketSharePct = ext.corporations[cid].marketSharePct;
            compObj.strength = ext.corporations[cid].strength;
          }
        }
      }

      // 2. Refresh Daily B2B Intermediate Material Purchase Demands (6 active offers from external corporations)
      const craftableMatIds = Object.keys(D.MATERIAL_RECIPES || {});
      const nextDemands = [];
      for (let i = 0; i < 6 && i < craftableMatIds.length; i++) {
        const h = seedHash(`${w.seed}:b2bDem:${completedDay}:${i}`);
        const matId = craftableMatIds[h % craftableMatIds.length];
        const matSpec = w.catalog.materials?.[matId];
        const recipe = D.MATERIAL_RECIPES?.[matId];
        if (!matSpec || !recipe) continue;
        const interestedCorps = corps.filter(
          (c) => Array.isArray(c.buysMaterials) && c.buysMaterials.includes(matId),
        );
        const buyer = (interestedCorps.length ? interestedCorps : corps)[(h >>> 5) % (interestedCorps.length || corps.length)];
        const govDemandMult = w.externalWorld?.government?.demandMultiplier || 1.0;
        const premiumMult = (1.06 + ((h % 18) / 100)) * clamp(govDemandMult, 0.95, 1.2);
        const unitPriceSatang = Math.round((recipe.b2bSellPrice || Math.round(matSpec.unitCost * 1.3)) * premiumMult);
        const recommendedQty = 2 + (h % 4);
        nextDemands.push({
          id: `b2b-dem-d${completedDay}-${i}`,
          day: completedDay,
          buyerCorpId: buyer.id,
          buyerNameTh: buyer.nameTh,
          buyerRelationMode: buyer.relationshipMode || "neutral",
          materialId: matId,
          materialNameTh: matSpec.nameTh,
          tier: recipe.tier,
          unitPriceSatang,
          recommendedQty,
          reasonTh: `รับซื้อไปใช้ในสายพาน${buyer.sectorTh} (ให้ราคาพรีเมียม +${Math.round((premiumMult - 1) * 100)}%)`,
        });
      }
      ext.b2bMaterialDemands = nextDemands;

      // 3. Autonomous B2B Surplus Material Selling (when company owns external assets and has large surplus >= 36 in opening stock)
      if (
        w.policies.autoAccept &&
        ext.assetPortfolio?.supplyChainStrategy !== "asset_light" &&
        Object.keys(ext.assetPortfolio?.ownedAssets || {}).length > 0
      ) {
        const minSurplusThreshold = w.externalWorld?.ceoDirective?.id === "cash_shield" ? 20 : 36;
        for (const dem of nextDemands) {
          const openStock = w.inventory.opening[dem.materialId] || 0;
          const freeStock = safeAvailableToDeduct(w, dem.materialId);
          if (openStock >= minSurplusThreshold && freeStock >= minSurplusThreshold) {
            sellMaterialB2B(w, dem.materialId, Math.min(4, dem.recommendedQty), dem.buyerCorpId, { auto: true });
            break;
          }
        }
      }
    }

    function runMidstreamRefining(w, options = {}) {
      if (options.materialId) {
        return craftMaterialRecipe(w, options.materialId, options.batches || 2, {
          ignoreTechGate: Boolean(options.ignoreTechGate),
        });
      }
      const ap = ensureAssetPortfolio(w);
      if (ap.supplyChainStrategy === "asset_light" && !options.force) {
        return { ok: true, refinedBatches: 0, unitsRefined: 0 };
      }
      const hasMill = Boolean(w.facilities?.constructedPlots?.includes("refineryMill"));
      let totalBatches = 0;
      let totalUnitsOut = 0;

      for (const chain of Object.values(D.PRODUCTION_CHAINS || {})) {
        if (options.chainId && chain.id !== options.chainId) continue;
        if (chain.autoRun === false && options.chainId !== chain.id) continue;
        const cfg = ap.chainSettings[chain.id];
        if (!cfg || (!cfg.enabled && !options.force)) continue;
        const reqResearch = chain.minResearch || 0;
        if (!options.ignoreTechGate && (w.research?.points || 0) < reqResearch) continue;

        const maxDailyBatches = options.maxBatches || (hasMill ? chain.batchesPerDayBase * 2 : chain.batchesPerDayBase);
        let possibleBatches = maxDailyBatches;
        for (const [inMat, inQty] of Object.entries(chain.inputs || {})) {
          if (!Object.hasOwn(w.inventory.materials, inMat)) {
            possibleBatches = 0;
            break;
          }
          const avail = options.chainId === chain.id
            ? safeAvailableToDeduct(w, inMat)
            : Math.min(w.inventory.opening[inMat] || 0, w.inventory.materials[inMat] - (w.inventory.reserved[inMat] || 0));
          possibleBatches = Math.min(possibleBatches, Math.floor(avail / inQty));
        }
        if (possibleBatches <= 0) continue;

        let inputValueSatang = 0;
        for (const [inMat, inQty] of Object.entries(chain.inputs || {})) {
          const deduct = inQty * possibleBatches;
          safeDeductMaterial(w, inMat, deduct);
          inputValueSatang += (w.catalog.materials[inMat]?.unitCost || 2000) * deduct;
        }

        let outputValueSatang = 0;
        const outSummary = [];
        for (const [outMat, outQty] of Object.entries(chain.outputs || {})) {
          if (!Object.hasOwn(w.inventory.materials, outMat)) continue;
          const addQty = outQty * possibleBatches;
          w.inventory.opening[outMat] += addQty;
          w.inventory.materials[outMat] += addQty;
          outputValueSatang += (w.catalog.materials[outMat]?.unitCost || 4000) * addQty;
          totalUnitsOut += addQty;
          outSummary.push(`${w.catalog.materials[outMat]?.nameTh || outMat} +${addQty}`);
        }

        const saved = Math.max(0, outputValueSatang - inputValueSatang);
        cfg.batchesCompleted = (cfg.batchesCompleted || 0) + possibleBatches;
        cfg.unitsRefined = (cfg.unitsRefined || 0) + possibleBatches * Object.values(chain.outputs).reduce((a, b) => a + b, 0);
        cfg.costSavedSatang = (cfg.costSavedSatang || 0) + saved;
        ap.totalRefinedUnits = (ap.totalRefinedUnits || 0) + totalUnitsOut;
        ap.totalChainSavingsSatang = (ap.totalChainSavingsSatang || 0) + saved;
        if (w.logistics && w.logistics.modeOutputCounts) {
          w.logistics.modeOutputCounts.milling_refining =
            (w.logistics.modeOutputCounts.milling_refining || 0) + possibleBatches;
        }

        ap.chainHistory.unshift({
          day: day(w),
          at: now(w),
          chainId: chain.id,
          chainNameTh: chain.shortNameTh,
          batches: possibleBatches,
          outputsTh: outSummary.join(", "),
          costSavedSatang: saved,
        });
        if (ap.chainHistory.length > 40) ap.chainHistory.pop();
        totalBatches += possibleBatches;
      }

      if (totalBatches > 0) {
        event(
          w,
          "midstreamRefined",
          `⚙️ สายการผลิตแปรรูปกลางน้ำเดินเครื่องสำเร็จ ${totalBatches} ล็อต (ได้วัตถุดิบกลางน้ำ +${totalUnitsOut} ชิ้นเข้าคลัง ลดการพึ่งพาซัพพลายเออร์)`,
          { refinedBatches: totalBatches, unitsRefined: totalUnitsOut },
        );
      }
      return { ok: true, refinedBatches: totalBatches, unitsRefined: totalUnitsOut };
    }

    function acquireExternalAsset(w, assetId, options = {}) {
      const ap = ensureAssetPortfolio(w);
      const spec = D.EXTERNAL_ASSETS?.[assetId];
      if (!spec) return { ok: false, code: "unknownAsset", message: "ไม่พบสินทรัพย์ภายนอกที่ระบุ" };

      const existing = ap.ownedAssets[assetId];
      if (existing && !options.upgrade) {
        return { ok: false, code: "alreadyOwned", message: "บริษัทถือครองสินทรัพย์ภายนอกแห่งนี้อยู่แล้ว" };
      }

      const targetLevel = existing ? (existing.level || 1) + 1 : 1;
      if (targetLevel > 3) {
        return { ok: false, code: "maxAssetLevel", message: "สินทรัพย์ภายนอกพัฒนาถึงระดับสูงสุด (Lv.3) แล้ว" };
      }

      const cost = existing ? Math.round(spec.cost * 0.65 * existing.level) : spec.cost;
      if (options.freeGrant && w.finance.cash < cost) {
        w.finance.openingCash += cost;
        w.finance.cash += cost;
      }
      if (w.finance.cash < cost) {
        return { ok: false, code: "insufficientCash", message: "เงินสดไม่พอสำหรับเข้าซื้อหรือพัฒนาสินทรัพย์ภายนอก" };
      }

      post(w, "expansion", -cost, (existing ? "extAssetUpgrade:" : "extAsset:") + assetId + ":L" + targetLevel);
      const ceo = w.people.find((p) => p.employed && p.role === "coordinator") || w.people[0];

      if (!existing) {
        ap.ownedAssets[assetId] = {
          id: assetId,
          nameTh: spec.nameTh,
          shortNameTh: spec.shortNameTh,
          category: spec.category,
          icon: spec.icon,
          level: 1,
          acquiredDay: day(w),
          condition: 100,
          active: true,
          totalHarvested: 0,
          totalDividendSatang: 0,
        };
        if (spec.fleetBonus && w.logistics) {
          w.logistics.fleetCount = (w.logistics.fleetCount || 2) + spec.fleetBonus;
        }
        if (spec.esgBonus) {
          w.reputation = clamp(w.reputation + spec.esgBonus, 0, 100);
        }
        if (spec.marketShareBonus && w.externalWorld) {
          w.externalWorld.ourMarketSharePct =
            Math.round(clamp((w.externalWorld.ourMarketSharePct || 2.0) + spec.marketShareBonus, 1, 60) * 10) / 10;
        }
        // Unlock linked downstream products (such as artisan_bakery or premium_cooking_oil) when acquiring their upstream farm/plantation
        if (spec.linkedChainId && D.PRODUCTION_CHAINS?.[spec.linkedChainId]) {
          const ch = D.PRODUCTION_CHAINS[spec.linkedChainId];
          for (const prodId of ch.downstreamProducts || []) {
            const prodSpec = w.catalog.products[prodId];
            if (prodSpec && !w.research.unlocked.includes(prodId)) {
              if (w.research.points < prodSpec.researchRequired) {
                w.research.points = prodSpec.researchRequired;
              }
              w.research.unlocked.push(prodId);
            }
          }
        }
      } else {
        existing.level = targetLevel;
        existing.condition = 100;
        if (spec.esgBonus) {
          w.reputation = clamp(w.reputation + 1, 0, 100);
        }
      }

      // Immediate welcome harvest batch upon acquisition/upgrade so the factory can immediately run the production chain
      const harvestSummary = [];
      for (const [matId, baseQty] of Object.entries(spec.harvestYields || {})) {
        if (!Object.hasOwn(w.inventory.materials, matId)) continue;
        const qty = Math.round(baseQty * (1 + (targetLevel - 1) * 0.5));
        w.inventory.opening[matId] += qty;
        w.inventory.materials[matId] += qty;
        ap.ownedAssets[assetId].totalHarvested += qty;
        ap.totalHarvestedUnits = (ap.totalHarvestedUnits || 0) + qty;
        harvestSummary.push(`${w.catalog.materials[matId]?.nameTh || matId} +${qty}`);
      }
      if (harvestSummary.length > 0) {
        ap.harvestHistory.unshift({
          day: day(w),
          assetId,
          assetNameTh: spec.shortNameTh,
          yieldsTh: harvestSummary.join(", "),
        });
        if (ap.harvestHistory.length > 40) ap.harvestHistory.pop();
        runMidstreamRefining(w);
      }

      event(
        w,
        existing ? "externalAssetUpgraded" : "externalAssetAcquired",
        `${spec.icon} ${ceo ? ceo.name : "ผู้บริหาร"} ${existing ? "ขยายกำลังการผลิต" : "เข้าซื้อกิจการสินทรัพย์ภายนอก"} "${spec.nameTh}" (Lv.${targetLevel}) สำเร็จ!${harvestSummary.length ? " รับผลผลิตล็อตแรกเข้าคลัง: " + harvestSummary.join(", ") : ""}`,
        {
          assetId,
          level: targetLevel,
          cost,
          personId: ceo ? ceo.id : null,
        },
      );
      return { ok: true, assetId, level: targetLevel };
    }

    function evaluateExternalAssetsDaily(w, completedDay) {
      const ap = ensureAssetPortfolio(w);
      const ownedList = Object.values(ap.ownedAssets || {});

      // 1. Update fluctuating commodity market price indices (0.85x - 1.28x)
      for (const matId of Object.keys(w.catalog.materials || {})) {
        const h = seedHash(`${w.seed}:matIdx:${matId}:${completedDay}`);
        ap.marketPriceIndex[matId] = Math.round((0.88 + (h % 38) / 100) * 100) / 100;
      }

      // 2. Harvest upstream raw materials & collect dividends from owned External Assets
      for (const rec of ownedList) {
        if (!rec || !rec.active) continue;
        const spec = D.EXTERNAL_ASSETS?.[rec.id];
        if (!spec) continue;
        const lvMult = 1 + ((rec.level || 1) - 1) * 0.5;
        const harvestItems = [];
        for (const [matId, baseQty] of Object.entries(spec.harvestYields || {})) {
          if (!Object.hasOwn(w.inventory.materials, matId)) continue;
          const qty = Math.max(1, Math.round(baseQty * lvMult));
          w.inventory.opening[matId] += qty;
          w.inventory.materials[matId] += qty;
          rec.totalHarvested = (rec.totalHarvested || 0) + qty;
          ap.totalHarvestedUnits = (ap.totalHarvestedUnits || 0) + qty;
          harvestItems.push(`${w.catalog.materials[matId]?.nameTh || matId} +${qty}`);
        }
        if (harvestItems.length > 0) {
          ap.harvestHistory.unshift({
            day: completedDay,
            assetId: rec.id,
            assetNameTh: spec.shortNameTh,
            yieldsTh: harvestItems.join(", "),
          });
          if (ap.harvestHistory.length > 40) ap.harvestHistory.pop();
        }

        const netDiv = Math.round(((spec.dailyDividend || 0) - (spec.dailyUpkeep || 0)) * lvMult);
        if (netDiv > 0 && Number.isSafeInteger(w.finance.cash + netDiv)) {
          post(w, "sales", netDiv, `assetDiv:${rec.id}:d${completedDay}`);
          rec.totalDividendSatang = (rec.totalDividendSatang || 0) + netDiv;
          ap.totalAssetDividendsSatang = (ap.totalAssetDividendsSatang || 0) + netDiv;
        }
      }

      // 3. Run Midstream Production Chains (converting harvested paddy_grain -> artisan_flour, crude_palm -> refined_palm_oil, etc.)
      if (ownedList.length > 0) {
        runMidstreamRefining(w);
      }

      // 4. Autonomous CEO External Asset Investment when company has strong cash surplus & vertical/hybrid vision
      if (w.policies.autoAccept && completedDay >= 6 && ap.supplyChainStrategy !== "asset_light") {
        const ceo = w.people.find((p) => p.employed && p.atWork && p.role === "coordinator");
        if (ceo) {
          const employees = w.people.filter((p) => p.employed);
          const dailyBurn =
            w.catalog.rules.rentDaily +
            Math.round(w.finance.debt * w.catalog.rules.interestDaily) +
            employees.reduce((sum, p) => sum + p.pay.dailyWage + w.policies.wellbeingDaily, 0);
          const safetyReserve = dailyBurn * 24 + 5500000;
          const unowned = Object.values(D.EXTERNAL_ASSETS || {}).filter(
            (a) => !ap.ownedAssets[a.id] && w.finance.cash >= safetyReserve + a.cost,
          );
          if (unowned.length > 0) {
            acquireExternalAsset(w, unowned[0].id);
          }
        }
      }
    }

    function evaluateSalesNegotiation(w, salesPerson, productSpec, client) {
      if (!salesPerson || !productSpec) {
        return {
          pitchScore: 65,
          priceMarkupPct: 0,
          negotiatedDepositPct: 0.3,
          styleTh: "มาตรฐานบริษัท",
          summaryTh: "รับข้อเสนอตามราคากลางตลาด",
        };
      }
      const roleSkill = w.catalog.roles[salesPerson.role]?.skill || "sales";
      const skillLv = salesPerson.skills[roleSkill]?.level || 45;
      const comm = salesPerson.profile.aptitudes.communication ?? 50;
      const insight = salesPerson.profile.aptitudes.emotionalInsight ?? 50;
      const verbal = salesPerson.profile.aptitudes.verbal ?? 50;
      const assertiveness = salesPerson.profile.personality.assertiveness ?? 50;
      const ambition = salesPerson.profile.personality.ambition ?? 50;
      const integrity = salesPerson.profile.personality.integrity ?? 50;
      const annexBuilt = Boolean(w.facilities?.constructedPlots?.includes("execAnnex"));
      const clientTrust = client?.trustScore ?? 50;

      const pitchScore = Math.round(
        clamp(
          skillLv * 0.38 +
            comm * 0.2 +
            insight * 0.14 +
            verbal * 0.12 +
            assertiveness * 0.08 +
            ambition * 0.08 +
            (annexBuilt ? 6 : 0) +
            (clientTrust - 50) * 0.15,
          20,
          100,
        ),
      );
      const priceMarkupPct = Math.round(clamp((pitchScore - 50) * 0.3, -3, 18) * 10) / 10;
      const negotiatedDepositPct = pitchScore >= 72 ? 0.35 : 0.3;
      const styleTh =
        assertiveness >= 68 && ambition >= 65
          ? "รุกเจรจาปิดดีลเชิงรุก (Aggressive B2B Pitch)"
          : insight >= 65 && integrity >= 65
            ? "ที่ปรึกษาสร้างความเชื่อมั่นระยะยาว (Consultative Trust)"
            : "เจรจาต่อรองตามมาตรฐานการค้า (Balanced Commercial)";
      const summaryTh = `${salesPerson.name} ใช้ทักษะการขาย (${Math.round(skillLv)}) และการสื่อสาร (${Math.round(comm)}) เจรจากับ ${client ? client.nameTh : "ลูกค้า B2B"} ได้คะแนนดีล ${pitchScore}/100`;
      return {
        pitchScore,
        priceMarkupPct,
        negotiatedDepositPct,
        styleTh,
        summaryTh,
      };
    }

    function makeOffer(w, productId, quantity, days = 6, salesQuality = 0.65, negotiator = null) {
      const p = w.catalog.products[productId],
        oid = id(w, "offer"),
        rawRoll = random(w),
        repBias = ((w.reputation - 45) / 100) * 0.15,
        skillBias = (salesQuality - 0.65) * 0.2,
        blended = clamp(rawRoll + repBias + skillBias, 0, 1),
        assetBonuses = getActiveExternalAssetBonuses(w),
        price = Math.round((p.priceMin + (p.priceMax - p.priceMin) * blended) * (1 + assetBonuses.pricePremiumBonus));
      const paymentMinutes = Math.round(random(w) * 2) * 1440;
      const client = pickClientForProduct(w, productId, oid);
      const neg = negotiator ? evaluateSalesNegotiation(w, negotiator, p, client) : null;
      const corpRec = client && w.externalWorld?.corporations?.[client.id];
      const isPartnerCorp = Boolean(corpRec && corpRec.relationshipMode === "partner");
      const annexBuilt = Boolean(w.facilities?.constructedPlots?.includes("execAnnex"));
      const activeMarkupPct =
        (isPartnerCorp ? 0.05 : 0) +
        ((annexBuilt || isPartnerCorp) && neg ? Math.max(0, (neg.priceMarkupPct || 0) / 100) : 0);
      const finalUnitPrice = activeMarkupPct > 0 ? Math.round(price * (1 + activeMarkupPct)) : price;
      const negDepBonus = (annexBuilt || isPartnerCorp) && neg && neg.negotiatedDepositPct > 0.3 ? 0.05 : 0;
      w.offers[oid] = {
        id: oid,
        productId,
        quantity,
        unitPrice: finalUnitPrice,
        deadline: now(w) + (days + assetBonuses.deadlineBonusDays) * 1440,
        expiresAt: now(w) + 1440 * 3,
        paymentMinutes,
        depositPct: Math.round(clamp(0.3 + assetBonuses.depositPctBonus + negDepBonus, 0.3, 0.45) * 100) / 100,
        customerName: client ? `${client.nameTh} (#${oid.split("-")[1]})` : "ลูกค้า " + oid.split("-")[1],
        clientId: client ? client.id : null,
        clientTierTh: client ? client.tierTh : "B2B มาตรฐาน",
        negotiatedBy: negotiator ? negotiator.name : null,
        negotiatedById: negotiator ? negotiator.id : null,
        salesPitchScore: neg ? neg.pitchScore : Math.round(salesQuality * 100),
        negotiationStyleTh: neg ? neg.styleTh : "ข้อเสนอตลาด B2B",
        status: "open",
      };
      return w.offers[oid];
    }

    function syncStationCapacitiesForScale(w) {
      const employedCount = w.people.filter((p) => p.employed).length;
      if (employedCount <= 10) return;
      const scaleFactor = Math.max(1, Math.ceil(employedCount / 8));
      for (const st of Object.values(w.layout.stations)) {
        if (["pantry", "lounge", "meal"].includes(st.kind)) {
          st.capacity = Math.max(st.capacity, 8 * scaleFactor);
        } else if (st.kind === "training") {
          st.capacity = Math.max(st.capacity, 4 * scaleFactor);
        } else if (["assembly", "quality", "packing", "shipping", "receiving", "stock", "finished"].includes(st.kind)) {
          st.capacity = Math.max(st.capacity, Math.ceil(employedCount / 4));
        } else if (["sales", "admin", "research", "manager"].includes(st.kind)) {
          st.capacity = Math.max(st.capacity, Math.ceil(employedCount / 6));
        }
      }
      w.catalog.rules.maxActiveOrders = Math.max(12, Math.min(200, Math.ceil(employedCount * 1.2)));
      w.catalog.rules.maxUnits = Math.max(160, Math.min(4000, employedCount * 12));
    }

    function create(seed = "company", options = {}) {
      if (
        !(
          typeof seed === "string" ||
          (typeof seed === "number" && Number.isFinite(seed))
        )
      )
        throw new TypeError("invalid seed");
      const catalog = options.catalog
        ? clone(options.catalog)
        : D.createCatalog();
      if (!catalog.taskKinds) catalog.taskKinds = {};
      if (options.startupMode === "lean" || options.starterCount === 5) {
        catalog.starters = clone(D.LEAN_STARTERS || catalog.starters.slice(0, 5));
      } else if (int(options.starterCount, 4, 30)) {
        catalog.starters = catalog.starters.slice(0, options.starterCount);
      }
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      const materials = Object.fromEntries(
          Object.keys(catalog.materials).map((k) => [
            k,
            catalog.initialStock[k] || 0,
          ]),
        ),
        zeros = Object.fromEntries(Object.keys(materials).map((k) => [k, 0])),
        productsZero = Object.fromEntries(
          Object.keys(catalog.products).map((k) => [k, 0]),
        );
      const w = {
        version: VERSION,
        schema: SCHEMA,
        coreVersion: H.VERSION,
        seed: String(seed),
        clock: { absoluteMinute: 540, tick: 0 },
        sequence: 0,
        rng: { state: seedHash(seed), draws: 0 },
        catalog,
        layout: L.createLayout(),
        finance: E.createFinance(
          catalog.rules.initialCash,
          catalog.rules.initialDebt,
        ),
        inventory: {
          materials,
          opening: clone(materials),
          reserved: clone(zeros),
          purchased: clone(zeros),
          consumed: clone(zeros),
          finished: clone(productsZero),
        },
        production: {
          started: clone(productsZero),
          completed: clone(productsZero),
          scrapped: clone(productsZero),
          shipped: clone(productsZero),
        },
        people: [],
        orders: {},
        offers: {},
        units: {},
        jobs: {},
        purchases: {},
        invoices: {},
        research: {
          points: 0,
          unlocked: Object.values(catalog.products)
            .filter((p) => p.researchRequired === 0)
            .map((p) => p.id),
        },
        facilities: freshFacilities(),
        logistics: freshLogistics(),
        externalWorld: freshExternalWorld(String(seed)),
        reputation: 45,
        policies: {
          autoBuy: true,
          autoAccept: Boolean(options.autonomous),
          workPriority: "balanced",
          overtimeHours: 0,
          overtimeMultiplier: 1.5,
          wellbeingDaily: 0,
        },
        status: "running",
        outcome: null,
        lastSettledDay: 0,
        nextCandidate: 1,
        events: [],
        history: { tasks: [], days: [] },
        socialAt: {},
        metrics: { ordersPaid: 0, unitsScrapped: 0, receipts: 0 },
      };
      w.people = [];
      for (let i = 0; i < catalog.starters.length; i++) {
        const s = catalog.starters[i];
        w.people.push(createPerson(w, "employee-" + (i + 1), s.name, s.role, s.dailyWage));
      }
      const first = w.research.unlocked[0];
      makeOffer(w, first, 8, 6);
      makeOffer(w, first, 10, 8);
      event(
        w,
        "companyStarted",
        `เริ่มบริษัท Siam Enterprise: ทีมงาน ${w.people.length} คน (ฝ่ายบริหารออฟฟิศ & ฝ่ายปฏิบัติการโรงงาน) พร้อมดำเนินกิจการ`,
      );
      if (int(options.initialHeadcount, 9, 500)) {
        scaleCompany(w, options.initialHeadcount, { freeGrant: true });
      }
      return w;
    }

    function job(w, kind, fields = {}) {
      const custom = own(w.catalog.taskKinds, kind);
      const skill = BUILTIN_TASK_SKILLS[kind] || (custom && custom.skill);
      const stationKind =
        BUILTIN_TASK_STATIONS[kind] || (custom && custom.stationKind);
      if (!skill || !stationKind)
        throw new TypeError("unknown job kind: " + kind);
      const j = {
        id: id(w, "job"),
        kind,
        skill,
        stationKind,
        required: custom ? custom.requiredMinutes : 10,
        progress: 0,
        assignee: null,
        createdAt: now(w),
        ...fields,
      };
      w.jobs[j.id] = j;
      return j;
    }
    function addUnit(w, order) {
      const p = w.catalog.products[order.productId],
        u = {
          id: id(w, "unit"),
          orderId: order.id,
          productId: p.id,
          stage: "assembly",
          reserved: false,
          materialConsumed: false,
          quality: 0,
          attempts: 0,
        };
      w.units[u.id] = u;
      job(w, "assembly", {
        unitId: u.id,
        orderId: order.id,
        required: p.assemblyMinutes,
      });
      return u;
    }
    function reserve(w, u) {
      if (u.materialConsumed) return true;
      if (u.reserved) return true;
      const bom = w.catalog.products[u.productId].bom;
      if (
        Object.entries(bom).some(
          ([m, n]) => w.inventory.materials[m] - w.inventory.reserved[m] < n,
        )
      )
        return false;
      for (const [m, n] of Object.entries(bom)) w.inventory.reserved[m] += n;
      u.reserved = true;
      return true;
    }
    function unreserve(w, u) {
      if (u && u.reserved) {
        for (const [m, n] of Object.entries(
          w.catalog.products[u.productId].bom,
        ))
          w.inventory.reserved[m] -= n;
        u.reserved = false;
      }
    }
    function consume(w, u) {
      if (u.materialConsumed) return;
      if (!reserve(w, u))
        throw Error("materials unavailable after reservation");
      for (const [m, n] of Object.entries(
        w.catalog.products[u.productId].bom,
      )) {
        w.inventory.reserved[m] -= n;
        w.inventory.materials[m] -= n;
        w.inventory.consumed[m] += n;
      }
      u.reserved = false;
      u.materialConsumed = true;
      if (w.orders[u.orderId]) w.orders[u.orderId].materialConsumed = true;
      w.production.started[u.productId]++;
    }
    function release(w, p, stationLoadMap = null) {
      const j = w.jobs[p.taskId];
      if (j) {
        j.assignee = null;
        if (j.unitId) unreserve(w, w.units[j.unitId]);
      }
      if (stationLoadMap && p.taskId && p.stationId) {
        stationLoadMap.set(p.stationId, Math.max(0, (stationLoadMap.get(p.stationId) || 1) - 1));
      }
      p.taskId = null;
      p.stationId = null;
      p.path = [];
    }
    function destination(w, p, station, activity, reason) {
      const path = L.findPath(w.layout, p.position, station.access);
      if (path === null) {
        p.activity = "blocked";
        p.intent = { code: "unreachableStation", reasons: [station.id] };
        return false;
      }
      p.stationId = station.id;
      p.path = path;
      p.activity = path.length ? "walking" : activity;
      p.intent = { code: reason, reasons: [station.id] };
      return true;
    }
    function stations(w, kind, stationLoadMap = null) {
      if (stationLoadMap) {
        return Object.values(w.layout.stations).filter(
          (s) => s.kind === kind && (stationLoadMap.get(s.id) || 0) < s.capacity,
        );
      }
      return Object.values(w.layout.stations).filter(
        (s) =>
          s.kind === kind &&
          w.people.filter((p) => p.employed && p.taskId && p.stationId === s.id)
            .length < s.capacity,
      );
    }
    function pauseFor(w, p, kind, minutes, reason, decision = null, stationLoadMap = null) {
      release(w, p, stationLoadMap);
      p.breakKind = kind;
      p.breakUntil = now(w) + minutes;
      if (decision) p.decision = decision;
      const station =
        w.layout.stations[
          kind === "meal" ? "meal" : kind === "social" ? "pantry" : "lounge"
        ];
      destination(
        w,
        p,
        station,
        kind === "meal"
          ? "eating"
          : kind === "social"
            ? "socialising"
            : "resting",
        reason,
      );
    }
    function move(p) {
      p.previousPosition = { ...p.position };
      const steps = p.path.splice(0, 4);
      if (steps.length) p.position = { ...steps.at(-1) };
    }
    function ability(w, p, skill, context = {}) {
      return H.evaluateAbility(
        p.profile,
        p.state,
        p.skills[skill],
        w.catalog.skills[skill],
        context,
      );
    }
    function orderOpen(o) {
      return !["paid", "cancelled"].includes(o.status);
    }
    function activeOrders(w) {
      return Object.values(w.orders).filter(orderOpen);
    }
    function ensureJobs(w) {
      for (const o of Object.values(w.offers))
        if (o.status === "open" && o.expiresAt <= now(w)) o.status = "expired";
      const employedCount = w.people.filter((p) => p.employed).length;
      const maxOpenOffers = employedCount > 15 ? Math.min(24, Math.ceil(employedCount / 4)) : 6;
      if (
        !Object.values(w.jobs).some((j) => j.kind === "sales") &&
        Object.values(w.offers).filter((o) => o.status === "open").length < maxOpenOffers
      )
        job(w, "sales", { required: 150 });
      const researchStations = Object.values(w.layout.stations)
          .filter((s) => s.kind === "research")
          .reduce((n, s) => n + Math.min(4, s.capacity), 0),
        activeResearch = Object.values(w.jobs).filter(
          (j) => j.kind === "research",
        ).length;
      for (let i = activeResearch; i < Math.max(1, researchStations); i++)
        job(w, "research", { required: 60 });
      for (const o of activeOrders(w)) {
        if (o.status === "accepted") {
          const units = Object.values(w.units).filter(
            (u) => u.orderId === o.id,
          );
          if (units.length < o.quantity)
            for (
              let i = units.length;
              i < o.quantity &&
              Object.keys(w.units).length < w.catalog.rules.maxUnits;
              i++
            )
              addUnit(w, o);
          const ready = Object.values(w.units).filter(
            (u) => u.orderId === o.id && u.stage === "ready",
          );
          if (
            ready.length === o.quantity &&
            !Object.values(w.jobs).some(
              (j) => j.orderId === o.id && j.kind === "shipping",
            )
          )
            job(w, "shipping", { orderId: o.id, required: 10 });
        }
      }
    }
    function autoCraftNeededMaterials(w, needed) {
      const ap = ensureAssetPortfolio(w);
      if (ap.supplyChainStrategy === "asset_light") return;
      if (Object.keys(ap.ownedAssets || {}).length === 0) return;
      // Cascade Tier 1 -> Tier 2 -> Tier 3 in-house recipes when R&D is unlocked and inputs are available in opening stock
      for (const tierLevel of [1, 2, 3]) {
        for (const rec of Object.values(D.MATERIAL_RECIPES || {})) {
          if (rec.tier !== tierLevel) continue;
          if ((w.research?.points || 0) < (rec.minResearch || 0)) continue;
          const outMat = rec.outputMaterialId || rec.id;
          const short = (needed[outMat] || 0) - (w.inventory.materials[outMat] || 0);
          if (short <= 0) continue;
          const outPerBatch = rec.outputs?.[outMat] || 1;
          const desiredBatches = Math.min(4, Math.ceil(short / outPerBatch));
          const canRun = Object.entries(rec.inputs || {}).every(([inMat, inQty]) => {
            const availOpen = Math.min(
              w.inventory.opening[inMat] || 0,
              (w.inventory.materials[inMat] || 0) - (w.inventory.reserved[inMat] || 0) - (needed[inMat] || 0),
            );
            return availOpen >= inQty;
          });
          if (canRun) {
            craftMaterialRecipe(w, rec.id, desiredBatches, { silent: false });
          }
        }
      }
    }

    function planPurchases(w) {
      if (!w.policies.autoBuy) return;
      const buyer = w.people.find((p) => p.employed && p.atWork && ["admin", "logistics", "coordinator"].includes(p.role));
      if (!buyer) return;
      // Convert any available upstream materials into midstream materials before deciding what to buy externally
      runMidstreamRefining(w);
      const needed = Object.fromEntries(
        Object.keys(w.catalog.materials).map((k) => [k, 0]),
      );
      for (const u of Object.values(w.units))
        if (!u.materialConsumed)
          for (const [m, n] of Object.entries(
            w.catalog.products[u.productId].bom,
          ))
            needed[m] += n;
      const employed = w.people.filter((p) => p.employed),
        reserveCash = employed.reduce((s, p) => s + p.pay.dailyWage, 0) * 2;
      if (
        w.finance.debt === 0 &&
        w.finance.cash > reserveCash + w.catalog.rules.winCash + 2500000
      ) {
        for (const prodId of w.research.unlocked) {
          const prod = w.catalog.products[prodId];
          if (prod && prod.bom) {
            for (const m of Object.keys(prod.bom)) {
              if (needed[m] < 10) needed[m] = 10;
            }
          }
        }
      }
      autoCraftNeededMaterials(w, needed);
      for (const [m, n] of Object.entries(needed)) {
        const incoming = Object.values(w.purchases)
            .filter((p) => p.materialId === m && p.status !== "received")
            .reduce((s, p) => s + p.quantity, 0),
          short = n - w.inventory.materials[m] - incoming;
        if (short > 0) {
          const unitCost = w.catalog.materials[m].unitCost,
            maxAffordable = Math.floor(
              Math.max(0, w.finance.cash - reserveCash) / unitCost,
            ),
            desired = Math.min(200, short + 4),
            count =
              maxAffordable >= desired
                ? desired
                : maxAffordable >= short
                  ? short
                  : maxAffordable;
          if (count > 0 && w.finance.cash - count * unitCost >= reserveCash)
            placePurchase(w, m, count, buyer);
        }
      }
    }
    function placePurchase(w, materialId, quantity, actor = null) {
      const mat = w.catalog.materials[materialId],
        buyer = actor ||
          w.people.find(
            (p) => p.employed && ["admin", "logistics"].includes(p.role),
          ) || w.people.find((p) => p.employed),
        pid = id(w, "purchase"),
        supplier = pickSupplierForMaterial(w, materialId, pid),
        p = {
          id: pid,
          materialId,
          quantity,
          cost: quantity * mat.unitCost,
          status: "paperwork",
          orderedAt: now(w),
          dueAt: null,
          supplierId: supplier ? supplier.id : null,
          supplierNameTh: supplier ? supplier.nameTh : "ซัพพลายเออร์มาตรฐาน",
          buyerId: buyer ? buyer.id : null,
          buyerName: buyer ? buyer.name : "ฝ่ายจัดซื้อ",
        };
      post(w, "materials", -p.cost, p.id);
      w.purchases[p.id] = p;
      job(w, "purchase", { purchaseId: p.id, required: 15 });
      if (buyer) {
        ensurePersonExtensions(w, buyer);
        buyer.career.poIssued = (buyer.career.poIssued || 0) + 1;
      }
      if (w.logistics && Array.isArray(w.logistics.inboundShipments)) {
        const plateNum = 1000 + (seedHash(p.id) % 8999);
        w.logistics.inboundShipments.unshift({
          id: "inb-" + p.id,
          purchaseId: p.id,
          supplierId: p.supplierId,
          supplierNameTh: p.supplierNameTh,
          originTh: supplier ? supplier.originTh : "นิคมอุตสาหกรรม",
          materialId,
          materialNameTh: mat.nameTh,
          quantity,
          cost: p.cost,
          buyerId: p.buyerId,
          buyerName: p.buyerName,
          truckPlate: `70-${plateNum} ชลบุรี`,
          status: "paperwork",
          orderedAt: now(w),
          dueAt: null,
          receivedAt: null,
        });
        if (w.logistics.inboundShipments.length > 50) w.logistics.inboundShipments.pop();
      }
      if (supplier && w.externalWorld?.suppliers?.[supplier.id]) {
        w.externalWorld.suppliers[supplier.id].totalOrders =
          (w.externalWorld.suppliers[supplier.id].totalOrders || 0) + 1;
        w.externalWorld.suppliers[supplier.id].totalSpendSatang =
          (w.externalWorld.suppliers[supplier.id].totalSpendSatang || 0) + p.cost;
      }
      event(
        w,
        "purchaseOrdered",
        `ฝ่ายจัดซื้อ (${buyer ? buyer.name : "ระบบ"}) สั่งซื้อวัตถุดิบ ${mat.nameTh} ${quantity} ชิ้น จาก ${p.supplierNameTh}`,
        {
          purchaseId: p.id,
          materialId,
          quantity,
          supplierId: p.supplierId,
          personId: buyer ? buyer.id : null,
        },
      );
      return p;
    }
    function accept(w, offer, actor = null, decision = null) {
      const total = offer.quantity * offer.unitPrice,
        deposit = Math.floor(total * offer.depositPct);
      if (
        !int(total, 1) ||
        !int(deposit) ||
        !int(w.finance.cash + deposit) ||
        !int(w.finance.totals.sales + deposit)
      )
        return null;
      const oid = id(w, "order"),
        prod = w.catalog.products[offer.productId],
        salesActor =
          actor ||
          w.people.find((p) => p.employed && p.role === "sales") ||
          w.people.find((p) => p.employed),
        client = (offer.clientId && w.externalWorld?.clients?.[offer.clientId]) ||
          pickClientForProduct(w, offer.productId, oid),
        negReport = salesActor ? evaluateSalesNegotiation(w, salesActor, prod, client) : null,
        o = {
          id: oid,
          offerId: offer.id,
          productId: offer.productId,
          quantity: offer.quantity,
          unitPrice: offer.unitPrice,
          deadline: offer.deadline,
          paymentMinutes: offer.paymentMinutes,
          deposit,
          total,
          status: "accepted",
          acceptedAt: now(w),
          shipped: 0,
          materialConsumed: false,
          completedAt: null,
          clientId: client ? client.id : offer.clientId || null,
          customerName: offer.customerName || (client ? client.nameTh : "ลูกค้า B2B"),
          salesPersonId: salesActor ? salesActor.id : null,
          salesPersonName: salesActor ? salesActor.name : null,
          negotiationReport: negReport,
        };
      offer.status = "accepted";
      w.orders[oid] = o;
      if (deposit) post(w, "sales", deposit, oid + ":deposit");
      for (let i = 0; i < o.quantity; i++) addUnit(w, o);
      if (salesActor) {
        ensurePersonExtensions(w, salesActor);
        salesActor.career.dealsNegotiated = (salesActor.career.dealsNegotiated || 0) + 1;
      }
      if (w.logistics && Array.isArray(w.logistics.b2bDeals)) {
        w.logistics.b2bDeals.unshift({
          orderId: oid,
          offerId: offer.id,
          clientId: o.clientId,
          clientNameTh: o.customerName,
          productId: o.productId,
          productNameTh: prod ? prod.nameTh : o.productId,
          quantity: o.quantity,
          unitPrice: o.unitPrice,
          total: o.total,
          deposit: o.deposit,
          salesPersonId: o.salesPersonId,
          salesPersonName: o.salesPersonName,
          pitchScore: negReport ? negReport.pitchScore : 65,
          styleTh: negReport ? negReport.styleTh : "เจรจามาตรฐาน",
          acceptedAt: now(w),
          deadline: o.deadline,
          status: "production",
        });
        if (w.logistics.b2bDeals.length > 50) w.logistics.b2bDeals.pop();
      }
      if (o.clientId && w.externalWorld?.clients?.[o.clientId]) {
        const cl = w.externalWorld.clients[o.clientId];
        cl.totalContracts = (cl.totalContracts || 0) + 1;
        cl.lastDealDay = day(w);
      }
      event(
        w,
        "orderAccepted",
        `ฝ่ายขาย (${salesActor ? salesActor.name : "บริษัท"}) ปิดดีล B2B กับ ${o.customerName}: ${prod ? prod.nameTh : offer.productId} ${o.quantity} ชิ้น สำเร็จ!`,
        {
          orderId: oid,
          productId: o.productId,
          quantity: o.quantity,
          clientId: o.clientId,
          personId: salesActor ? salesActor.id : null,
          decision,
        },
      );
      return o;
    }
    function autoAccept(w) {
      if (!w.policies.autoAccept) return;
      const employedCount = w.people.filter((p) => p.employed).length;
      const maxConcurrentAccepted = employedCount > 15 ? Math.min(25, Math.ceil(employedCount / 4)) : 2;
      const maxQueueUnits = employedCount > 15 ? Math.min(w.catalog.rules.maxUnits - 20, employedCount * 4) : 24;
      const open = activeOrders(w).filter((o) => o.status === "accepted"),
        queued = Object.keys(w.units).length;
      if (open.length >= maxConcurrentAccepted || queued >= maxQueueUnits) return;
      const salesPerson =
        w.people.find((p) => p.employed && p.atWork && p.role === "sales") ||
        w.people.find((p) => p.employed && p.atWork && p.role === "coordinator");
      if (!salesPerson) return;
      const roleSkill = w.catalog.roles[salesPerson.role].skill;
      const proficiency = salesPerson.skills[roleSkill]?.level || 0;
      const personality = salesPerson.profile.personality;
      const evaluated = Object.values(w.offers).filter((o) =>
        o.status === "open" && o.deadline > now(w) + 1440 &&
        w.research.unlocked.includes(o.productId) &&
        queued + o.quantity <= w.catalog.rules.maxUnits,
      ).map((offer) => {
        const product = w.catalog.products[offer.productId];
        const materialCost = Object.entries(product.bom).reduce((sum, [id, qty]) =>
          sum + w.catalog.materials[id].unitCost * qty, 0);
        const profitPerUnit = offer.unitPrice - materialCost;
        const margin = profitPerUnit / Math.max(1, offer.unitPrice);
        const timeDays = (offer.deadline - now(w)) / 1440;
        const pressure = (queued + offer.quantity) / Math.max(1, w.catalog.rules.maxUnits);
        const score = margin * 60 + proficiency * 0.15 +
          (salesPerson.profile.values.achievement ?? 50) * 0.08 +
          (personality.riskTaking ?? 50) * 0.04 -
          (personality.prudence ?? 50) * pressure * 0.06 - Math.max(0, 3 - timeDays) * 4;
        return { offer, profitPerUnit, score };
      }).filter((item) => item.profitPerUnit > 0 && item.score >= 10)
        .sort((a, b) => b.score - a.score || a.offer.id.localeCompare(b.offer.id));
      const choice = evaluated[0];
      if (choice) accept(w, choice.offer, salesPerson, {
        score: Math.round(choice.score * 10) / 10,
        profitPerUnit: choice.profitPerUnit,
        reason: "เปรียบเทียบราคากับต้นทุนวัตถุดิบ กำหนดส่ง งานค้าง และลักษณะผู้ตัดสินใจ",
      });
    }
    function evaluateAutonomousHiring(w, options = {}) {
      const employed = w.people.filter((p) => p.employed);
      const ceo = employed.find((p) => p.role === "coordinator");
      if (!ceo) return false;
      if (employed.length >= w.catalog.rules.maxPeople) return false;
      const burn =
        w.catalog.rules.rentDaily +
        Math.round(w.finance.debt * w.catalog.rules.interestDaily) +
        employed.reduce((n, p) => n + p.pay.dailyWage, 0) +
        w.policies.wellbeingDaily * employed.length;
      const runwayDays = burn > 0 ? w.finance.cash / burn : 999;
      const openJobs = Object.values(w.jobs).filter((j) => !j.assignee);
      const overloaded =
        options.force ||
        (openJobs.length >= Math.max(4, employed.length) &&
          runwayDays > 30 &&
          w.finance.cash >= w.catalog.rules.hireFee + burn * 30);
      if (!overloaded || w.finance.cash < w.catalog.rules.hireFee) return false;
      const list = candidates(w);
      if (!list.length) return false;
      const preferredRole =
        options.role ||
        (openJobs.some((j) => j.kind === "assembly" || j.kind === "rework")
          ? "assembler"
          : openJobs.some((j) => j.kind === "qa")
            ? "inspector"
            : openJobs.some((j) => j.kind === "packing" || j.kind === "shipping")
              ? "logistics"
              : "assembler");
      const role = own(w.catalog.roles, preferredRole);
      const skillSpec = role && own(w.catalog.skills, role.skill);
      if (!skillSpec) return false;
      const scored = list.map((candidate) => {
        const skill = H.createSkill(candidate.profile, skillSpec);
        const ability = H.evaluateAbility(candidate.profile, H.createState(candidate.profile), skill, skillSpec);
        const score = ability.aptitudeFit * 0.55 + skill.level * 0.25 +
          candidate.profile.personality.conscientiousness * 0.08 +
          candidate.profile.personality.integrity * 0.06 -
          (ceo.profile.personality.prudence ?? 50) * candidate.dailyWage / 1000000;
        return { candidate, score };
      }).sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id));
      const pick = scored[0];
      const res = command(w, {
        type: "hire",
        candidateId: pick.candidate.id,
        role: preferredRole,
      });
      if (res.ok) event(w, "recruitmentDecision", `${ceo.name} เลือก ${pick.candidate.name} เข้าร่วมทีม`, {
        personId: ceo.id, candidateId: res.personId, role: preferredRole,
        score: Math.round(pick.score * 10) / 10,
        reason: "ประเมินความถนัด ทักษะ นิสัย และค่าจ้างตามตำแหน่งที่ขาด",
      });
      return res.ok ? true : false;
    }

    function constructPlot(w, plotId, actor = null, reason = "ขยายกำลังการผลิตและโครงสร้างพื้นฐานนิคม") {
      if (!w.facilities) w.facilities = freshFacilities();
      if (!Array.isArray(w.facilities.constructedPlots)) w.facilities.constructedPlots = [];
      if (!Array.isArray(w.facilities.plotHistory)) w.facilities.plotHistory = [];
      const plotSpec = D.EXPANSION_PLOTS?.[plotId];
      if (!plotSpec) return { ok: false, code: "unknownPlot", message: "ไม่พบผังอาคารที่ระบุ" };
      if (w.facilities.constructedPlots.includes(plotId))
        return { ok: false, code: "alreadyBuilt", message: "ก่อสร้างอาคารนี้ไปแล้ว" };
      if (w.finance.cash < plotSpec.cost)
        return { ok: false, code: "insufficientCash", message: "เงินสดไม่พอก่อสร้างอาคารใหม่" };

      let nextLayout = clone(w.layout);
      for (const st of plotSpec.stations || []) {
        if (!nextLayout.stations[st.id]) {
          try {
            nextLayout = L.addStation(nextLayout, {
              id: st.id,
              kind: st.kind,
              cell: { x: st.x, y: st.y },
              access: { x: st.ax, y: st.ay },
              capacity: st.capacity || 8,
              visualKey: "station." + st.kind,
            });
          } catch (_) {
            // If cell is occupied, skip adding station so layout remains valid
          }
        }
      }
      if (L.validateLayout(nextLayout).length > 0) {
        return { ok: false, code: "layoutConflict", message: "พื้นที่ก่อสร้างทับซ้อนกับเส้นทางเดิน" };
      }

      post(w, "expansion", -plotSpec.cost, "plot:" + plotId);
      w.layout = nextLayout;
      for (const p of w.people) {
        if (p.stationId && w.layout.stations[p.stationId]) {
          p.path = L.findPath(w.layout, p.position, w.layout.stations[p.stationId].access) || [];
        }
      }
      w.facilities.constructedPlots.push(plotId);
      const ceo = actor || w.people.find((p) => p.employed && p.role === "coordinator") || w.people[0];
      w.facilities.plotHistory.unshift({
        day: day(w),
        plotId,
        nameTh: plotSpec.nameTh,
        cost: plotSpec.cost,
        actorId: ceo ? ceo.id : null,
        actorName: ceo ? ceo.name : "ผู้บริหาร",
        reason,
      });
      if (w.logistics && w.logistics.productionLines) {
        if (plotId === "prodLineB" && w.logistics.productionLines.lineB) {
          w.logistics.productionLines.lineB.active = true;
        }
        if (plotId === "prodLineC" && w.logistics.productionLines.lineC) {
          w.logistics.productionLines.lineC.active = true;
        }
        if (plotId === "prodLineD" && w.logistics.productionLines.lineD) {
          w.logistics.productionLines.lineD.active = true;
        }
        if (plotId === "dispatchHub") {
          w.logistics.fleetCount = (w.logistics.fleetCount || 2) + 2;
        }
      }
      if (["prodLineB", "prodLineC", "prodLineD"].includes(plotId) && D.resolveOrgAssignment) {
        for (const emp of w.people) {
          if (emp.employed && emp.role === "assembler" && emp.career) {
            const orgUnit = D.resolveOrgAssignment(emp.role, emp.career.level || 1, emp.id, w.facilities.constructedPlots);
            emp.career.orgUnit = orgUnit;
            emp.career.sectionTh = orgUnit.sectionNameTh;
            emp.career.groupTh = orgUnit.groupNameTh;
            emp.career.orgPathTh = orgUnit.orgPathTh;
          }
        }
      }
      if (plotId === "solarPlant") {
        w.reputation = clamp(w.reputation + 2, 0, 100);
      }
      if (plotId === "waterPlant") {
        w.reputation = clamp(w.reputation + 3, 0, 100);
      }
      if (plotId === "qaLab" || plotId === "expoHall") {
        w.reputation = clamp(w.reputation + 2, 0, 100);
      }
      event(
        w,
        "facilityConstructed",
        `🏗️ ${ceo ? ceo.name : "ผู้บริหาร"} อนุมัติก่อสร้าง "${plotSpec.nameTh}" เสร็จสมบูรณ์! (${plotSpec.benefitTh})`,
        {
          plotId,
          nameTh: plotSpec.nameTh,
          cost: plotSpec.cost,
          personId: ceo ? ceo.id : null,
          reason,
        },
      );
      return { ok: true, plotId };
    }

    function evaluatePlotConstruction(w) {
      if (!w.policies.autoAccept || day(w) < 6) return false;
      if (!w.facilities) w.facilities = freshFacilities();
      if (!Array.isArray(w.facilities.constructedPlots)) w.facilities.constructedPlots = [];
      const ceo = w.people.find((p) => p.employed && p.atWork && p.role === "coordinator");
      if (!ceo) return false;
      const employees = w.people.filter((p) => p.employed);
      if (employees.length < 9) return false;

      const dailyBurn =
        w.catalog.rules.rentDaily +
        Math.round(w.finance.debt * w.catalog.rules.interestDaily) +
        employees.reduce((sum, p) => sum + p.pay.dailyWage + w.policies.wellbeingDaily, 0);
      const reserve = dailyBurn * 22 + 4000000;

      const plots = Object.values(D.EXPANSION_PLOTS || {}).filter(
        (pl) =>
          !w.facilities.constructedPlots.includes(pl.id) &&
          day(w) >= (pl.minDay || 5) &&
          employees.length >= (pl.minStaff || 8) &&
          w.finance.cash >= reserve + pl.cost,
      );
      if (!plots.length) return false;

      const chosen = plots[0];
      const res = constructPlot(
        w,
        chosen.id,
        ceo,
        `ขยายโครงสร้างพื้นฐานนิคมรองรับทีมงาน ${employees.length} คน และคำสั่งซื้อ B2B`,
      );
      return Boolean(res.ok);
    }

    function evaluateFacilityInvestment(w) {
      if (!w.policies.autoAccept || day(w) < 2) return;
      if (!w.facilities) w.facilities = freshFacilities();
      const f = w.facilities;
      if (day(w) - f.lastDecisionDay < 3 && f.lastDecisionDay > 0) return;
      const ceo = w.people.find((p) => p.employed && p.atWork && p.role === "coordinator");
      if (!ceo) return;
      const employees = w.people.filter((p) => p.employed);
      const dailyBurn = w.catalog.rules.rentDaily +
        Math.round(w.finance.debt * w.catalog.rules.interestDaily) +
        employees.reduce((sum, p) => sum + p.pay.dailyWage + w.policies.wellbeingDaily, 0);
      const obligations = w.finance.payables.rent + w.finance.payables.interest +
        employees.reduce((sum, p) => sum + p.pay.dueBase + p.pay.dueOT, 0);
      const reserve = dailyBurn * 20 + obligations + Math.min(w.finance.debt, dailyBurn * 10);
      const jobs = Object.values(w.jobs);
      const needs = {
        factory: 12 + jobs.filter((j) => ["assembly", "rework", "qa"].includes(j.kind)).length * 3,
        warehouse: 9 + jobs.filter((j) => ["packing", "shipping"].includes(j.kind)).length * 3,
        hq: 0,
        rnd: 10 + jobs.filter((j) => j.kind === "research").length * 3,
        canteen: 8 + employees.reduce((n, p) => n + p.state.hunger, 0) / Math.max(1, employees.length) / 8,
        courtyard: 8 + employees.reduce((n, p) => n + p.state.stress, 0) / Math.max(1, employees.length) / 7,
        training: 10 + employees.length,
      };
      needs.hq = 8 + Object.values(w.offers).filter((o) => o.status === "open").length * 2;
      const personality = ceo.profile.personality;
      const ranked = Object.entries(FACILITY_RULES).filter(([key]) => (f.levels[key] || 1) < 3)
        .map(([key, spec]) => {
          const level = f.levels[key] || 1;
          const cost = spec.cost * level;
          const score = needs[key] + ceo.skills.leadership.level * 0.08 +
            (personality.ambition ?? 50) * 0.08 + (personality.riskTaking ?? 50) * 0.04 -
            (personality.prudence ?? 50) * 0.04 - level * 3 - cost / Math.max(w.finance.cash, 1) * 15;
          return { key, spec, level, cost, score };
        }).sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
      const choice = ranked[0];
      f.lastDecisionDay = day(w);
      if (!choice) return;
      const affordable = w.finance.arrearsSince === null && w.finance.cash >= reserve + choice.cost;
      f.lastDecision = {
        day: day(w), personId: ceo.id, facilityId: choice.key,
        decision: affordable && choice.score >= 12 ? "upgrade" : "wait",
        score: Math.round(choice.score * 10) / 10, cost: choice.cost, reserve,
        reason: affordable ? "ประเมินภาระงานและประโยชน์ของอาคาร" : "รักษาเงินสำรองและภาระค้างจ่าย",
      };
      if (f.lastDecision.decision !== "upgrade") return;
      post(w, "equipment", -choice.cost, "facility:" + choice.key);
      f.levels[choice.key] = choice.level + 1;
      event(w, "facilityUpgraded", `${ceo.name} ตัดสินใจพัฒนา${choice.spec.nameTh}เป็นระดับ ${choice.level + 1}`, {
        personId: ceo.id, facilityId: choice.key, level: choice.level + 1, cost: choice.cost,
        reason: f.lastDecision.reason,
      });
    }
    function evaluateDebtRepayment(w) {
      if (!w.policies.autoAccept || w.finance.debt <= 0 || w.finance.arrearsSince !== null) return;
      const ceo = w.people.find((p) => p.employed && p.atWork && p.role === "coordinator");
      if (!ceo) return;
      const employees = w.people.filter((p) => p.employed);
      const dailyBurn = w.catalog.rules.rentDaily + Math.round(w.finance.debt * w.catalog.rules.interestDaily) +
        employees.reduce((sum, p) => sum + p.pay.dailyWage + w.policies.wellbeingDaily, 0);
      const due = w.finance.payables.rent + w.finance.payables.interest +
        employees.reduce((sum, p) => sum + p.pay.dueBase + p.pay.dueOT, 0);
      const reserveDays = 15 + Math.floor((ceo.profile.personality.prudence ?? 50) / 10);
      const reserve = dailyBurn * reserveDays + due;
      const amount = Math.min(w.finance.debt, Math.max(0, w.finance.cash - reserve));
      if (!Number.isSafeInteger(amount) || amount <= 0) return;
      post(w, "debtRepayment", -amount, "bank");
      event(w, "ceoDebtRepayment", `${ceo.name} ชำระเงินต้นโดยกันเงินสำรองไว้ก่อน`, {
        personId: ceo.id, amount, reserve, reserveDays,
      });
    }

    function evaluateMachineMaintenance(w) {
      if (!w.facilities) w.facilities = freshFacilities();
      if ((w.facilities.machineCondition ?? 100) >= 82) return;
      const tech = w.people.find(
        (p) => p.employed && p.atWork && ["engineer", "assembler", "inspector"].includes(p.role),
      );
      if (!tech) return;
      const hasMaintShop = Boolean(w.facilities.constructedPlots?.includes("maintWorkshop"));
      const before = w.facilities.machineCondition ?? 100;
      const recovery = hasMaintShop ? 25 : 18;
      const after = clamp(Math.round((before + recovery) * 10) / 10, 50, 100);
      w.facilities.machineCondition = after;
      w.facilities.maintenanceCount = (w.facilities.maintenanceCount || 0) + 1;
      ensurePersonExtensions(w, tech);
      tech.career.tasksCompleted = (tech.career.tasksCompleted || 0) + 1;
      event(
        w,
        "machineMaintained",
        `${tech.name} บำรุงรักษาและตั้งค่าเครื่องจักรโรงงาน สภาพพร้อมใช้งาน ${after}%`,
        {
          personId: tech.id,
          machineCondition: after,
        },
      );
    }

    function processDue(w) {
      for (const p of Object.values(w.purchases))
        if (p.status === "transit" && p.dueAt <= now(w)) {
          w.inventory.materials[p.materialId] += p.quantity;
          w.inventory.purchased[p.materialId] += p.quantity;
          p.status = "received";
          if (w.logistics && Array.isArray(w.logistics.inboundShipments)) {
            const ship = w.logistics.inboundShipments.find((s) => s.purchaseId === p.id);
            if (ship) {
              ship.status = "received";
              ship.receivedAt = now(w);
            }
            w.logistics.totalInboundReceived = (w.logistics.totalInboundReceived || 0) + 1;
          }
          if (p.supplierId && w.externalWorld?.suppliers?.[p.supplierId]) {
            const sup = w.externalWorld.suppliers[p.supplierId];
            sup.totalDeliveries = (sup.totalDeliveries || 0) + 1;
            sup.trustScore = clamp((sup.trustScore || 50) + 3, 0, 100);
            sup.tierTh =
              sup.trustScore >= 85
                ? "พันธมิตรยุทธศาสตร์ (Strategic)"
                : sup.trustScore >= 60
                  ? "คู่ค้าชั้นดี (VIP)"
                  : "คู่ค้าประจำ (Regular)";
          }
          const matName =
            w.catalog.materials[p.materialId]?.nameTh || p.materialId;
          event(
            w,
            "materialsReceived",
            `รถขนส่งซัพพลายเออร์ส่งวัตถุดิบ ${matName} ${p.quantity} ชิ้น เข้าคลังเรียบร้อย`,
            {
              purchaseId: p.id,
              quantity: p.quantity,
              supplierId: p.supplierId || null,
            },
          );
        }
      for (const i of Object.values(w.invoices))
        if (i.status === "unpaid" && i.dueAt <= now(w)) {
          post(w, "sales", i.amount, i.id);
          i.status = "paid";
          i.paidAt = now(w);
          const order = w.orders[i.orderId];
          order.status = "paid";
          w.metrics.ordersPaid++;
          w.metrics.receipts++;
          if (w.logistics) {
            const outShip = (w.logistics.outboundShipments || []).find((s) => s.orderId === order.id);
            if (outShip) outShip.status = "paid";
            const deal = (w.logistics.b2bDeals || []).find((d) => d.orderId === order.id);
            if (deal) deal.status = "paid";
          }
          if (order.clientId && w.externalWorld?.clients?.[order.clientId]) {
            const cl = w.externalWorld.clients[order.clientId];
            cl.completedContracts = (cl.completedContracts || 0) + 1;
            cl.totalRevenueSatang = (cl.totalRevenueSatang || 0) + (order.finalTotal || order.total);
            cl.trustScore = clamp((cl.trustScore || 50) + 4, 0, 100);
          }
          event(
            w,
            "paymentReceived",
            `ลูกค้า (${order.customerName || "B2B"}) ชำระเงินค่าสินค้าเข้าบัญชีแล้ว (${(i.amount / 100).toLocaleString("th-TH")} บาท)`,
            {
              invoiceId: i.id,
              orderId: order.id,
              amount: i.amount,
            },
          );
        }
    }
    function finishJob(w, p, j, a) {
      ensurePersonExtensions(w, p);
      p.career.tasksCompleted = (p.career.tasksCompleted || 0) + 1;
      if (!w.facilities) w.facilities = freshFacilities();
      const u = w.units[j.unitId],
        product = u && w.catalog.products[u.productId];
      if (j.kind === "assembly") {
        const prodModeId = product?.productionMode || "smt_precision";
        const modeSpec = D.PRODUCTION_MODES?.[prodModeId];
        const regimeId = w.logistics?.productionRegime || "lean_balanced";
        const regimeSpec = D.PRODUCTION_REGIMES?.[regimeId];
        const modeQualBonus = (modeSpec?.qualityBonus || 0) + (regimeSpec?.qaBonus || 0);
        u.stage = "qa";
        u.quality = clamp(a.qualityChance + modeQualBonus, 0.1, 0.99);
        u.productionMode = prodModeId;
        const stId = p.stationId || "assembly1";
        const lineId = stId.startsWith("assembly_d")
          ? "lineD"
          : stId.startsWith("assembly_c")
            ? "lineC"
            : stId.startsWith("assembly_b")
              ? "lineB"
              : "lineA";
        u.lineId = lineId;
        if (w.logistics?.productionLines?.[lineId]) {
          w.logistics.productionLines[lineId].unitsCompleted =
            (w.logistics.productionLines[lineId].unitsCompleted || 0) + 1;
        }
        if (w.logistics) {
          if (!w.logistics.modeOutputCounts) w.logistics.modeOutputCounts = {};
          w.logistics.modeOutputCounts[prodModeId] = (w.logistics.modeOutputCounts[prodModeId] || 0) + 1;
        }
        const hasMaint = Boolean(w.facilities.constructedPlots?.includes("maintWorkshop"));
        const hasWater = Boolean(w.facilities.constructedPlots?.includes("waterPlant"));
        const assetBonuses = getActiveExternalAssetBonuses(w);
        const wearMult =
          (modeSpec?.wearRate || 1.0) *
          (regimeSpec?.wearMultiplier || 1.0) *
          (hasWater ? 0.88 : 1.0) *
          (1 - (assetBonuses.wearReductionPct || 0));
        const wear = Math.max(0.15, (hasMaint ? 0.75 : 1.2) * wearMult);
        w.facilities.machineCondition = clamp(
          Math.round(((w.facilities.machineCondition ?? 100) - wear) * 10) / 10,
          45,
          100,
        );
        job(w, "qa", {
          unitId: u.id,
          orderId: u.orderId,
          required: product.qaMinutes,
        });
      } else if (j.kind === "rework") {
        u.quality = Math.min(0.99, u.quality + 0.1 + a.qualityChance * 0.04);
        u.stage = "qa";
        job(w, "qa", {
          unitId: u.id,
          orderId: u.orderId,
          required: product.qaMinutes,
        });
      } else if (j.kind === "qa") {
        const hasQaLab = Boolean(w.facilities?.constructedPlots?.includes("qaLab"));
        const assetBonuses = getActiveExternalAssetBonuses(w);
        const isFood = product?.industry === "food";
        const dirId = w.externalWorld?.ceoDirective?.updatedDay > 1 ? w.externalWorld?.ceoDirective?.id : null;
        const zeroDefectBonus = dirId === "zero_defect" ? 0.05 : 0;
        const cond = w.facilities?.machineCondition ?? 100;
        const condQaDelta = cond < 72 ? -((72 - cond) * 0.002) : 0;
        const chance = clamp(
          u.quality * 0.85 +
            a.qualityChance * 0.15 +
            (hasQaLab ? 0.06 : 0) +
            (isFood ? assetBonuses.foodQaBonus : 0) +
            zeroDefectBonus +
            condQaDelta,
          0.1,
          0.99,
        );
        if (random(w) < chance) {
          u.stage = "packing";
          job(w, "packing", {
            unitId: u.id,
            orderId: u.orderId,
            required: product.packingMinutes,
          });
        } else if (u.attempts < 2) {
          u.attempts++;
          u.stage = "rework";
          job(w, "rework", {
            unitId: u.id,
            orderId: u.orderId,
            required: Math.ceil(product.assemblyMinutes * 0.4),
          });
          event(
            w,
            "reworkNeeded",
            `ชิ้นงานไม่ผ่าน QC โดย ${p.name} ส่งช่างซ่อมแซม`,
            {
              unitId: u.id,
              orderId: u.orderId,
            },
          );
        } else {
          w.production.scrapped[u.productId]++;
          w.metrics.unitsScrapped++;
          delete w.units[u.id];
          event(w, "unitScrapped", "ชิ้นงานเสียเกินซ่อม ตัดเป็นของเสีย", {
            orderId: u.orderId,
          });
        }
      } else if (j.kind === "packing") {
        u.stage = "ready";
        w.inventory.finished[u.productId]++;
        w.production.completed[u.productId]++;
      } else if (j.kind === "shipping") {
        const o = w.orders[j.orderId],
          units = Object.values(w.units).filter(
            (u) => u.orderId === o.id && u.stage === "ready",
          );
        if (units.length !== o.quantity)
          throw Error("shipment requires complete ready order");
        for (const item of units) {
          w.inventory.finished[item.productId]--;
          w.production.shipped[item.productId]++;
          delete w.units[item.id];
        }
        o.shipped = o.quantity;
        o.completedAt = now(w);
        o.status = "invoicing";
        const late = Math.max(0, now(w) - o.deadline);
        o.finalTotal = Math.max(
          o.deposit,
          Math.round(o.total * (1 - Math.min(0.2, (late / 1440) * 0.04))),
        );
        w.reputation = clamp(w.reputation + (late ? -0.5 : 2), 0, 100);
        if (w.logistics && Array.isArray(w.logistics.outboundShipments)) {
          const plateNum = 2000 + (seedHash(o.id) % 7999);
          w.logistics.outboundShipments.unshift({
            id: "out-" + o.id,
            orderId: o.id,
            clientId: o.clientId || "siam_tech",
            clientNameTh: o.customerName || "ลูกค้า B2B",
            productId: o.productId,
            productNameTh: w.catalog.products[o.productId]?.nameTh || o.productId,
            quantity: o.quantity,
            totalAmount: o.finalTotal,
            dispatcherId: p.id,
            dispatcherName: p.name,
            truckPlate: `71-${plateNum} กทม.`,
            dispatchedAt: now(w),
            lateMinutes: late,
            onTime: late === 0,
            status: "invoicing",
          });
          if (w.logistics.outboundShipments.length > 50) w.logistics.outboundShipments.pop();
          w.logistics.totalOutboundDispatched = (w.logistics.totalOutboundDispatched || 0) + 1;
          const deal = (w.logistics.b2bDeals || []).find((d) => d.orderId === o.id);
          if (deal) deal.status = "shipped";
        }
        job(w, "invoice", { orderId: o.id, required: 10 });
        event(
          w,
          "orderShipped",
          `ฝ่ายคลังและโลจิสติกส์ (${p.name}) ปล่อยรถขนส่งส่งมอบสินค้า ${o.quantity} ชิ้น ให้แก่ ${o.customerName || "ลูกค้า"} แล้ว`,
          {
            orderId: o.id,
            quantity: o.quantity,
            lateMinutes: late,
            personId: p.id,
          },
        );
      } else if (j.kind === "invoice") {
        const o = w.orders[j.orderId],
          i = {
            id: id(w, "invoice"),
            orderId: o.id,
            amount: o.finalTotal - o.deposit,
            issuedAt: now(w),
            dueAt: now(w) + o.paymentMinutes,
            status: "unpaid",
            paidAt: null,
          };
        w.invoices[i.id] = i;
        o.status = "awaitingPayment";
      } else if (j.kind === "purchase") {
        const purchase = w.purchases[j.purchaseId];
        const assetBonuses = getActiveExternalAssetBonuses(w);
        const supCorp = purchase.supplierId && w.externalWorld?.corporations?.[purchase.supplierId];
        const partnerLeadDisc = supCorp && supCorp.relationshipMode === "partner" ? 0.15 : 0;
        const totalLeadReduction = Math.min(0.55, (assetBonuses.leadTimeReductionPct || 0) + partnerLeadDisc);
        const rawLead = w.catalog.materials[purchase.materialId].leadMinutes;
        const reducedLead = Math.max(60, Math.round((rawLead * (1 - totalLeadReduction)) / 5) * 5);
        purchase.status = "transit";
        purchase.dueAt = now(w) + reducedLead;
        if (w.logistics && Array.isArray(w.logistics.inboundShipments)) {
          const ship = w.logistics.inboundShipments.find((s) => s.purchaseId === purchase.id);
          if (ship) {
            ship.status = "transit";
            ship.dueAt = purchase.dueAt;
          }
        }
      } else if (j.kind === "research") {
        const bonus = Math.max(0, Math.round((a.qualityChance - 0.65) * 12));
        const dirId = w.externalWorld?.ceoDirective?.updatedDay > 1 ? w.externalWorld?.ceoDirective?.id : null;
        const sprintBonus = dirId === "rnd_sprint" ? 6 : 0;
        w.research.points += 25 + bonus + sprintBonus;
        for (const prod of Object.values(w.catalog.products))
          if (
            prod.researchRequired <= w.research.points &&
            !w.research.unlocked.includes(prod.id)
          ) {
            w.research.unlocked.push(prod.id);
            event(
              w,
              "productUnlocked",
              `ห้องแล็บ R&D (${p.name}) วิจัยแบบแปลน "${prod.nameTh}" สำเร็จ!`,
              {
                productId: prod.id,
              },
            );
          }
      } else if (j.kind === "sales") {
        const products = w.research.unlocked,
          productId = products[Math.floor(random(w) * products.length)];
        makeOffer(
          w,
          productId,
          8 + Math.floor(random(w) * 7),
          6 + Math.floor(random(w) * 3),
          a.qualityChance,
          p,
        );
      } else if (own(w.catalog.taskKinds, j.kind)) {
        const spec = w.catalog.taskKinds[j.kind];
        if (spec.researchPoints > 0) {
          w.research.points += spec.researchPoints;
          for (const prod of Object.values(w.catalog.products))
            if (
              prod.researchRequired <= w.research.points &&
              !w.research.unlocked.includes(prod.id)
            )
              w.research.unlocked.push(prod.id);
        }
        if (spec.reputationDelta)
          w.reputation = clamp(w.reputation + spec.reputationDelta, 0, 100);
        if (spec.revenue > 0) post(w, "sales", spec.revenue, j.id + ":service");
        event(w, "customTaskCompleted", "ดำเนินงานเฉพาะทางสำเร็จ", {
          jobId: j.id,
          kind: j.kind,
          personId: p.id,
        });
      }
      w.history.tasks.push({
        id: j.id,
        kind: j.kind,
        personId: p.id,
        at: now(w),
        orderId: j.orderId || null,
      });
      if (w.history.tasks.length > 160) w.history.tasks.shift();
      delete w.jobs[j.id];
      p.taskId = null;
      p.stationId = null;
      p.activity = "idle";
    }
    function jobImpacts(w, j, primary, urgent) {
      const custom = own(w.catalog.taskKinds, j.kind);
      if (custom && custom.impacts)
        return {
          ...custom.impacts,
          change: primary ? -0.15 : 0.45,
        };
      const u = clamp(urgent / 4, 0, 1);
      const map = {
        sales: {
          income: 0.55,
          social: 0.65,
          achievement: 0.55,
          recognition: 0.6,
          voice: 0.45,
          risk: 0.25,
        },
        purchase: {
          security: 0.6,
          fairness: 0.4,
          integrity: 0.65,
          duty: 0.7,
          routine: 0.5,
        },
        invoice: {
          income: 0.45,
          security: 0.65,
          integrity: 0.7,
          duty: 0.75,
          routine: 0.45,
        },
        research: {
          learning: 0.95,
          novelty: 0.85,
          autonomy: 0.65,
          meaning: 0.6,
          recognition: 0.45,
        },
        assembly: {
          craft: 0.75,
          achievement: 0.55,
          meaning: 0.45,
          duty: Math.max(0.35, u),
          routine: 0.35,
          help: 0.3,
        },
        rework: {
          craft: 0.8,
          integrity: 0.75,
          duty: Math.max(0.55, u),
          learning: 0.35,
          help: 0.45,
          risk: u,
        },
        qa: {
          integrity: 0.85,
          security: 0.6,
          fairness: 0.5,
          meaning: 0.5,
          craft: 0.55,
          duty: Math.max(0.45, u),
        },
        packing: {
          belonging: 0.45,
          help: 0.55,
          duty: Math.max(0.5, u),
          routine: 0.45,
          achievement: 0.4,
        },
        shipping: {
          achievement: 0.7,
          recognition: 0.5,
          duty: Math.max(0.65, u),
          help: 0.6,
          security: 0.45,
        },
      };
      return {
        ...(map[j.kind] || { achievement: 0.5, duty: 0.5 }),
        change: primary ? -0.15 : 0.45,
      };
    }

    function selectJob(w, p, stationLoadMap = null) {
      const choices = [];
      const largeScale = w.people.length > 15;
      const seenBatchKeys = largeScale ? new Set() : null;

      for (const j of Object.values(w.jobs)) {
        if (j.assignee) continue;
        if (seenBatchKeys) {
          const batchKey = j.kind + ":" + (j.orderId || "") + ":" + j.createdAt;
          if (seenBatchKeys.has(batchKey)) continue;
        }
        if (j.unitId) {
          const u = w.units[j.unitId];
          if (!u) continue;
          const bom = w.catalog.products[u.productId].bom;
          if (
            !u.materialConsumed &&
            !u.reserved &&
            Object.entries(bom).some(
              ([m, n]) =>
                w.inventory.materials[m] - w.inventory.reserved[m] < n,
            )
          )
            continue;
        }
        const available = stations(w, j.stationKind, stationLoadMap);
        if (!available.length) continue;
        if (seenBatchKeys) {
          seenBatchKeys.add(j.kind + ":" + (j.orderId || "") + ":" + j.createdAt);
        }
        const demand = own(w.catalog.taskKinds, j.kind) || {},
          a = ability(w, p, j.skill, demand),
          primary = w.catalog.roles[p.role].skill === j.skill,
          per = p.profile.personality,
          v = p.profile.values,
          o = w.orders[j.orderId],
          urgent = o ? clamp((now(w) + 3 * 1440 - o.deadline) / 1440, 0, 4) : 0;
        let score =
          a.speedMultiplier * 22 +
          (primary ? 26 : 0) +
          Math.min(12, (now(w) - j.createdAt) / 120) +
          urgent * 8;
        if (j.kind === "research")
          score +=
            per.openness * 0.1 +
            v.learning * 0.06 +
            (w.policies.workPriority === "research" ? 35 : 0) -
            (activeOrders(w).length ? 12 : 0);
        if (j.orderId)
          score +=
            (w.policies.workPriority === "delivery" ? 24 : 0) +
            per.conscientiousness * 0.08;
        if (["purchase", "invoice", "shipping"].includes(j.kind)) score += 20;
        const motives = H.scoreOptions(p.profile, p.state, [
          {
            id: j.id,
            effort: j.kind === "rework" ? 0.45 : 0.35,
            delay: Math.min(1, (now(w) - j.createdAt) / 1440),
            skillFit: clamp((a.aptitudeFit - 50) / 50, -1, 1),
            impacts: jobImpacts(w, j, primary, urgent),
          },
        ])[0];
        score += motives.score * 0.65;
        const station = available.sort(
          (a, b) =>
            Math.abs(a.access.x - p.position.x) +
            Math.abs(a.access.y - p.position.y) -
            (Math.abs(b.access.x - p.position.x) +
              Math.abs(b.access.y - p.position.y)),
        )[0];
        choices.push({
          j,
          station,
          score,
          motives: motives.contributions,
          roleMatch: primary,
        });
      }
      choices.sort((a, b) => b.score - a.score || a.j.id.localeCompare(b.j.id));
      for (const c of choices) {
        const u = w.units[c.j.unitId];
        if (u && !reserve(w, u)) continue;
        c.j.assignee = p.id;
        p.taskId = c.j.id;
        p.decision = {
          at: now(w),
          taskId: c.j.id,
          score: c.score,
          roleMatch: c.roleMatch,
          motives: c.motives,
        };
        if (destination(w, p, c.station, "working", "chosen:" + c.j.kind)) {
          if (stationLoadMap) {
            stationLoadMap.set(c.station.id, (stationLoadMap.get(c.station.id) || 0) + 1);
          }
          return true;
        }
        release(w, p, stationLoadMap);
      }
      return false;
    }
    function updateSocial(w, p, tickCtx = null) {
      if (
        !["socialising", "resting", "eating"].includes(p.activity) ||
        !p.stationId ||
        p.path.length
      )
        return;
      let interactions = 0;
      const maxInteractions = w.people.length > 30 ? 2 : 999;
      const pool = tickCtx && tickCtx.stationOccupants
        ? (tickCtx.stationOccupants.get(p.stationId) || [])
        : w.people;
      for (const other of pool) {
        if (interactions >= maxInteractions) break;
        if (
          other.id === p.id ||
          !other.employed ||
          other.stationId !== p.stationId ||
          other.path.length
        )
          continue;
        const pair =
          p.id < other.id ? p.id + "|" + other.id : other.id + "|" + p.id;
        if ((w.socialAt[pair] || -100) < now(w) - 30) {
          w.socialAt[pair] = now(w);
          interactions++;
          const existing = p.relationships[other.id]?.trust || 0,
            inter = H.evaluateInteraction(
              p.profile,
              p.state,
              other.profile,
              other.state,
              { mode: "social", existingTrust: existing },
            );
          for (const [a, b] of [
            [p, other],
            [other, p],
          ]) {
            const rel =
              a.relationships[b.id] ||
              (a.relationships[b.id] = { trust: 0, familiarity: 0 });
            rel.familiarity = Math.min(
              100,
              +(rel.familiarity + inter.familiarityDelta).toFixed(2),
            );
            rel.trust = clamp(
              +(rel.trust + inter.trustDelta).toFixed(2),
              -100,
              100,
            );
            a.state.morale = clamp(a.state.morale + inter.moraleDelta, 0, 100);
          }
        }
      }
    }
    function pickColleagueToHelp(w, p, tickCtx = null) {
      const zone = L.zoneAt(w.layout, p.position);
      let candidates;
      if (tickCtx && tickCtx.workingByZone) {
        const zList = tickCtx.workingByZone.get(zone) || [];
        candidates = [];
        for (let i = 0; i < zList.length && candidates.length < 6; i++) {
          const q = zList[i];
          if (q.employed && q.taskId && q.id !== p.id) candidates.push(q);
        }
      } else {
        candidates = w.people.filter(
          (q) =>
            q.employed &&
            q.taskId &&
            q.id !== p.id &&
            L.zoneAt(w.layout, q.position) === zone,
        );
      }
      if (!candidates.length) return null;
      return candidates
        .map((q) => {
          const currentHelpers = tickCtx && tickCtx.helpersCount
            ? (tickCtx.helpersCount.get(q.id) || 0)
            : w.people.filter(
                (h) =>
                  h.employed &&
                  h.id !== p.id &&
                  h.activity === "helping" &&
                  h.intent.reasons.includes(q.id),
              ).length,
            trust = p.relationships[q.id]?.trust || 0,
            inter = H.evaluateInteraction(
              p.profile,
              p.state,
              q.profile,
              q.state,
              { mode: "help", existingTrust: trust },
            ),
            task = w.jobs[q.taskId],
            urgent =
              task && task.orderId && w.orders[task.orderId]
                ? clamp(
                    (now(w) + 2 * 1440 - w.orders[task.orderId].deadline) /
                      1440,
                    0,
                    3,
                  )
                : 0;
          return {
            person: q,
            inter,
            score:
              inter.compatibility +
              trust * 0.3 +
              urgent * 12 -
              currentHelpers * 35,
          };
        })
        .sort(
          (a, b) => b.score - a.score || a.person.id.localeCompare(b.person.id),
        )[0];
    }
    function personStep(w, p, stationLoadMap = null, tickCtx = null) {
      if (!p.employed) return;
      const time = tod(w),
        active =
          (time >= 540 && time < 1080) ||
          (time >= 1080 &&
            time < 1080 + p.ot.maxMinutes &&
            p.ot.day === day(w));
      if (!active) {
        release(w, p, stationLoadMap);
        p.atWork = false;
        p.activity = time >= 1320 || time < 360 ? "sleeping" : "offDuty";
        p.position = { ...w.layout.entrance };
        p.previousPosition = { ...p.position };
        p.intent = { code: p.activity, reasons: [] };
        p.state = H.tickState(p.profile, p.state, {
          activity: p.activity === "sleeping" ? "sleep" : "offDuty",
          minutes: TICK,
        });
        return;
      }
      if (!p.atWork) {
        p.atWork = true;
        p.activity = "idle";
      }
      if (p.path.length && !p.taskId && p.intent.code === "selfStudy" &&
          Object.values(w.jobs).some((j) => !j.assignee && j.skill === w.catalog.roles[p.role].skill)) {
        p.path = [];
        p.stationId = null;
      }
      if (p.path.length) {
        move(p);
        p.activity = "walking";
        p.state = H.tickState(p.profile, p.state, {
          activity: "walk",
          minutes: TICK,
        });
        return;
      }
      if (p.breakUntil > now(w)) {
        p.activity =
          p.breakKind === "meal"
            ? "eating"
            : p.breakKind === "social"
              ? "socialising"
              : "resting";
        p.state = H.tickState(p.profile, p.state, {
          activity:
            p.breakKind === "meal"
              ? "meal"
              : p.breakKind === "social"
                ? "social"
                : "rest",
          minutes: TICK,
        });
        if (p.activity === "eating" && facilityLevel(w, "canteen") > 1)
          p.state.hunger = clamp(p.state.hunger - (facilityLevel(w, "canteen") - 1) * 0.4, 0, 100);
        if (p.activity === "resting" && facilityLevel(w, "courtyard") > 1) {
          p.state.stress = clamp(p.state.stress - (facilityLevel(w, "courtyard") - 1) * 0.3, 0, 100);
          p.state.energy = clamp(p.state.energy + (facilityLevel(w, "courtyard") - 1) * 0.2, 0, 100);
        }
        updateSocial(w, p, tickCtx);
        return;
      }
      p.breakKind = null;
      if (time >= 720 && time < 780) {
        const lunchChoices = H.scoreOptions(p.profile, p.state, [
          {
            id: "meal",
            effort: 0,
            impacts: {
              hunger: 1,
              energy: 0.4,
              stress: 0.3,
              workLifeBalance: 0.3,
            },
          },
          {
            id: "social",
            effort: 0.05,
            impacts: { social: 0.9, belonging: 0.7, stress: 0.4, energy: 0.25 },
          },
        ]);
        const chosen = p.state.hunger > 25 ? "meal" : lunchChoices[0].id;
        const ranked =
          lunchChoices.find((c) => c.id === chosen) || lunchChoices[0];
        pauseFor(w, p, chosen, 20, "lunchBreak", {
          at: now(w),
          taskId: "break:" + chosen,
          score: ranked.score,
          roleMatch: false,
          motives: ranked.contributions,
        }, stationLoadMap);
        return;
      }
      if (
        p.state.health < 35 ||
        p.state.energy < 24 ||
        p.state.stress > 82 ||
        p.state.burnout > 85
      ) {
        const rec = H.scoreOptions(p.profile, p.state, [
          {
            id: "rest",
            effort: 0,
            impacts: {
              energy: 1,
              stress: 0.9,
              health: 0.8,
              burnout: 0.8,
              workLifeBalance: 0.6,
            },
          },
        ])[0];
        pauseFor(w, p, "rest", 30, "needsRecovery", {
          at: now(w),
          taskId: "break:rest",
          score: rec.score,
          roleMatch: false,
          motives: rec.contributions,
        }, stationLoadMap);
        return;
      }
      if (p.state.hunger > 72) {
        const mealChoice = H.scoreOptions(p.profile, p.state, [
          {
            id: "meal",
            effort: 0,
            impacts: { hunger: 1, energy: 0.45, focus: 0.35, stress: 0.3 },
          },
        ])[0];
        pauseFor(w, p, "meal", 20, "hungry", {
          at: now(w),
          taskId: "break:meal",
          score: mealChoice.score,
          roleMatch: false,
          motives: mealChoice.contributions,
        }, stationLoadMap);
        return;
      }
      if (p.state.socialNeed > 75 && p.profile.personality.sociability > 60) {
        const socChoice = H.scoreOptions(p.profile, p.state, [
          {
            id: "social",
            effort: 0.05,
            impacts: { social: 1, belonging: 0.75, stress: 0.45, energy: 0.25 },
          },
        ])[0];
        pauseFor(w, p, "social", 15, "needsConnection", {
          at: now(w),
          taskId: "break:social",
          score: socChoice.score,
          roleMatch: false,
          motives: socChoice.contributions,
        }, stationLoadMap);
        return;
      }
      let j = w.jobs[p.taskId];
      if (!j) {
        p.taskId = null;
        if (!selectJob(w, p, stationLoadMap)) {
          const helpPick = pickColleagueToHelp(w, p, tickCtx);
          if (
            helpPick &&
            (p.profile.personality.agreeableness > 45 ||
              p.profile.values.belonging > 65)
          ) {
            if (p.stationId === "training") p.stationId = null;
            const target = helpPick.person,
              inter = helpPick.inter;
            ensurePersonExtensions(w, p);
            ensurePersonExtensions(w, target);
            p.activity = "helping";
            p.intent = { code: "helpColleague", reasons: [target.id] };
            p.experience.helpMinutes += TICK;
            p.career.menteesHelped = (p.career.menteesHelped || 0) + 1;
            target.career.mentorId = p.id;
            target.career.mentorName = p.name;
            p.skills.leadership = H.learn(
              p.profile,
              p.skills.leadership,
              w.catalog.skills.leadership,
              TICK,
            );
            for (const [a, b] of [
              [p, target],
              [target, p],
            ]) {
              const rel =
                a.relationships[b.id] ||
                (a.relationships[b.id] = { trust: 0, familiarity: 0 });
              rel.familiarity = Math.min(
                100,
                +(rel.familiarity + 0.2).toFixed(2),
              );
              rel.trust = clamp(
                +(rel.trust + inter.trustDelta * 0.2).toFixed(2),
                -100,
                100,
              );
            }
            p.state = H.tickState(p.profile, p.state, {
              activity: "help",
              minutes: TICK,
            });
            return;
          }
          const primarySkill = w.catalog.roles[p.role].skill;
          const waitOptions = H.scoreOptions(p.profile, p.state, [
            {
              id: "selfStudy",
              effort: 0.25,
              impacts: {
                learning: 0.85,
                achievement: 0.45,
                novelty: 0.4,
                autonomy: 0.5,
              },
            },
            {
              id: "wait",
              effort: 0,
              impacts: { energy: 0.25, workLifeBalance: 0.3, routine: 0.3 },
            },
          ]);
          p.activity = "blocked";
          if (
            waitOptions[0].id === "selfStudy" &&
            p.state.energy > 50 &&
            p.state.stress < 65 &&
            p.skills[primarySkill].level <
              H.skillCap(p.profile, w.catalog.skills[primarySkill])
          ) {
            const training = w.layout.stations.training;
            const trainingCount = tickCtx ? tickCtx.trainingCount : w.people.filter((other) => other.employed && other.stationId === "training").length;
            if (training && p.stationId !== training.id && trainingCount < training.capacity) {
              if (destination(w, p, training, "blocked", "selfStudy")) { if (tickCtx) tickCtx.trainingCount++; return; }
            }
            p.intent = { code: "selfStudy", reasons: [primarySkill] };
            p.decision = {
              at: now(w),
              taskId: "selfStudy:" + primarySkill,
              score: waitOptions[0].score,
              roleMatch: true,
              motives: waitOptions[0].contributions,
            };
            const learningAtTraining = training && p.stationId === training.id &&
              p.position.x === training.access.x && p.position.y === training.access.y;
            p.skills[primarySkill] = H.learn(
              p.profile,
              p.skills[primarySkill],
              w.catalog.skills[primarySkill],
              TICK * 0.35 * (learningAtTraining ? 1 + (facilityLevel(w, "training") - 1) * 0.15 : 1),
            );
            if (learningAtTraining) {
              if (!w.facilities) w.facilities = freshFacilities();
              w.facilities.trainingMinutes += TICK;
            }
            p.state = H.tickState(p.profile, p.state, {
              activity: "learn",
              minutes: TICK,
              workload: 0.45,
            });
            return;
          }
          if (p.stationId === "training") p.stationId = null;
          p.intent = {
            code: Object.keys(w.units).length
              ? "waitingForWorkOrMaterials"
              : "noProductionOrder",
            reasons: [],
          };
          p.state = H.tickState(p.profile, p.state, {
            activity: "idle",
            minutes: TICK,
          });
          return;
        }
        if (p.path.length) {
          p.state = H.tickState(p.profile, p.state, {
            activity: "walk",
            minutes: TICK,
          });
          return;
        }
        j = w.jobs[p.taskId];
      }
      const u = w.units[j.unitId];
      if (u && !u.materialConsumed) consume(w, u);
      const demand = own(w.catalog.taskKinds, j.kind) || {},
        a = ability(w, p, j.skill, demand),
        helpers = tickCtx && tickCtx.firstHelperByTarget
          ? (tickCtx.firstHelperByTarget.has(p.id) ? [tickCtx.firstHelperByTarget.get(p.id)] : [])
          : w.people.filter(
              (q) =>
                q.employed &&
                q.activity === "helping" &&
                q.intent.reasons.includes(p.id),
            );
      let help = 1;
      let mentorXpMult = 1;
      if (helpers.length) {
        const helper = helpers[0],
          inter = H.evaluateInteraction(
            helper.profile,
            helper.state,
            p.profile,
            p.state,
            {
              mode: "help",
              existingTrust: p.relationships[helper.id]?.trust || 0,
            },
          );
        const helperLv = helper.career?.level || 1;
        const helperStep = helperLv > 1 && D.getCareerStep ? D.getCareerStep(helper.role, helperLv) : null;
        const mentorPwr = helperStep ? (helperStep.mentorPower || 0) : 0;
        help = inter.collaborationMultiplier + mentorPwr * 0.35;
        mentorXpMult = 1 + mentorPwr * 0.45;
      }
      const constructed = w.facilities?.constructedPlots || [];
      let plotBonus = 0;
      if (j.kind === "purchase" && constructed.includes("rawDepot")) plotBonus += 0.2;
      if (["packing", "shipping"].includes(j.kind) && constructed.includes("dispatchHub")) plotBonus += 0.25;
      const activeDirId = w.externalWorld?.ceoDirective?.updatedDay > 1 ? w.externalWorld?.ceoDirective?.id : null;
      if (j.kind === "research") {
        if (constructed.includes("qaLab")) plotBonus += 0.2;
        if (activeDirId === "rnd_sprint") plotBonus += 0.25;
      }
      if (j.kind === "sales") {
        if (constructed.includes("expoHall")) plotBonus += 0.15;
        if (activeDirId === "sales_blitz") plotBonus += 0.2;
      }
      const assetBonuses = getActiveExternalAssetBonuses(w);
      if (j.kind === "packing") {
        if (assetBonuses.packingSpeedBonus > 0) plotBonus += assetBonuses.packingSpeedBonus;
        if (activeDirId === "scale_expansion") plotBonus += 0.12;
      }
      if (j.kind === "shipping" && assetBonuses.shippingSpeedBonus > 0) plotBonus += assetBonuses.shippingSpeedBonus;
      if (["assembly", "qa"].includes(j.kind)) {
        if (p.stationId && p.stationId.includes("_b") && constructed.includes("prodLineB")) plotBonus += 0.15;
        if (p.stationId && p.stationId.includes("_c") && constructed.includes("prodLineC")) plotBonus += 0.2;
        if (p.stationId && p.stationId.includes("_d") && constructed.includes("prodLineD")) plotBonus += 0.25;
        if (constructed.includes("bakeryPlant") && u && w.catalog.products[u.productId]?.industry === "food") plotBonus += 0.2;
        if (assetBonuses.productionSpeedBonus > 0) plotBonus += assetBonuses.productionSpeedBonus;
        if (activeDirId === "scale_expansion") plotBonus += 0.12;
        const regimeId = w.logistics?.productionRegime || "lean_balanced";
        const regimeSpec = D.PRODUCTION_REGIMES?.[regimeId];
        if (regimeSpec && regimeSpec.speedMultiplier) {
          plotBonus += (regimeSpec.speedMultiplier - 1.0);
        }
        if (constructed.length > 0 && u) {
          const prodModeId = w.catalog.products[u.productId]?.productionMode;
          const mSpec = D.PRODUCTION_MODES?.[prodModeId];
          if (mSpec && mSpec.speedModifier) {
            plotBonus += (mSpec.speedModifier - 1.0);
          }
        }
        const mCond = w.facilities?.machineCondition ?? 100;
        if (mCond < 75) {
          plotBonus -= (75 - mCond) * 0.005;
        }
      }
      j.progress = Math.min(
        j.required,
        j.progress + TICK * a.speedMultiplier * help *
          (1 + (facilityLevel(w, facilityForJob(j.kind)) - 1) * 0.12 + plotBonus),
      );
      p.activity = "working";
      p.intent = { code: j.kind, reasons: [j.id] };
      const order = j.orderId ? w.orders[j.orderId] : null,
        urgentLoad = order && order.deadline < now(w) + 1440 ? 0.1 : 0,
        otLoad = time >= 1080 ? 0.12 : 0;
      p.state = H.tickState(p.profile, p.state, {
        activity: j.kind === "research" ? "learn" : "work",
        minutes: TICK,
        workload: Math.min(2, (demand.workload ?? 1) + urgentLoad + otLoad),
        domain: demand.domain || "balanced",
        hazard: demand.hazard || 0,
      });
      p.skills[j.skill] = H.learn(
        p.profile,
        p.skills[j.skill],
        w.catalog.skills[j.skill],
        TICK * mentorXpMult,
      );
      p.experience.workMinutes += TICK;
      p.dayStats.workMinutes += TICK;
      if (time >= 1080) p.dayStats.otMinutes += TICK;
      if (j.progress >= j.required) {
        if (stationLoadMap && p.stationId) {
          stationLoadMap.set(p.stationId, Math.max(0, (stationLoadMap.get(p.stationId) || 1) - 1));
        }
        finishJob(w, p, j, a);
      }
    }
    function pay(w, isScheduledPayday = false) {
      const people = w.people.filter((p) => p.pay.dueBase + p.pay.dueOT > 0),
        total = people.reduce((s, p) => s + p.pay.dueBase + p.pay.dueOT, 0),
        budget = Math.min(w.finance.cash, total);
      let left = budget;
      for (let index = 0; index < people.length; index++) {
        const p = people[index],
          due = p.pay.dueBase + p.pay.dueOT,
          wasOverdue = p.pay.overdueSince !== null,
          amount = Math.min(
            due,
            index === people.length - 1
              ? left
              : Math.floor((budget * due) / total),
          ),
          base = Math.min(p.pay.dueBase, amount),
          ot = amount - base;
        if (base) post(w, "wages", -base, p.id);
        if (ot) post(w, "overtime", -ot, p.id);
        p.pay.dueBase -= base;
        p.pay.dueOT -= ot;
        p.pay.wallet += amount;
        p.pay.totalPaid += amount;
        left -= amount;
        if (p.pay.dueBase + p.pay.dueOT === 0) p.pay.overdueSince = null;
        if (isScheduledPayday) {
          if (amount < due) p.state.morale = clamp(p.state.morale - 8, 0, 100);
          else p.state.morale = clamp(p.state.morale + 2, 0, 100);
        } else if (wasOverdue && p.pay.dueBase + p.pay.dueOT === 0) {
          p.state.morale = clamp(p.state.morale + 2, 0, 100);
        }
      }
      return budget;
    }
    function payBills(w) {
      for (const kind of ["rent", "interest"]) {
        const amount = Math.min(w.finance.cash, w.finance.payables[kind]);
        if (amount) {
          post(w, kind, -amount, "payable");
          w.finance.payables[kind] -= amount;
        }
      }
    }
    function refreshArrears(w, referenceDay) {
      const overdueWages = w.people
        .filter((p) => p.pay.overdueSince !== null)
        .reduce((n, p) => n + p.pay.dueBase + p.pay.dueOT, 0);
      const unpaid =
        w.finance.payables.rent + w.finance.payables.interest + overdueWages;
      if (unpaid > 0) {
        if (w.finance.arrearsSince === null && referenceDay !== undefined)
          w.finance.arrearsSince = referenceDay;
      } else {
        w.finance.arrearsSince = null;
      }
    }

    function getDepartmentHeadroom(w, roleId, targetLevel) {
      const staffInDept = w.people.filter((p) => p.employed && p.role === roleId);
      const currentAtLevel = staffInDept.filter((p) => (p.career?.level || 1) >= targetLevel).length;
      const deptSize = staffInDept.length;
      const totalStaff = w.people.filter((p) => p.employed).length;

      if (targetLevel === 2) {
        // Lv.2 (G2) Senior Specialist: Max 45% of department, minimum 1 if department size >= 2
        const maxQuota = Math.max(1, Math.floor(deptSize * 0.45));
        if (deptSize < 2) {
          return { allowed: false, maxQuota: 0, currentCount: currentAtLevel, reason: "แผนกต้องมีพนักงานตั้งแต่ 2 คนขึ้นไปเพื่อรองรับตำแหน่งอาวุโส (Lv.2)" };
        }
        if (currentAtLevel >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentAtLevel, reason: `โควตาตำแหน่งอาวุโสเต็มแล้ว (${currentAtLevel}/${maxQuota} อัตรา)` };
        }
        return { allowed: true, maxQuota, currentCount: currentAtLevel, reason: `มีโควตาอาวุโส Lv.2 ว่าง (${currentAtLevel}/${maxQuota})` };
      }

      if (targetLevel === 3) {
        // Lv.3 (G3) Group Leader / Line Leader (หัวหน้ากลุ่มในไลน์ผลิต): Base 1 slot per department, 2 if facLv >= 2 or deptSize >= 4, scales 1 per 5 staff
        const bldKey = facilityForJob(w.catalog.roles[roleId]?.skill || "assembly") || "factory";
        const facLv = facilityLevel(w, bldKey);
        const spanSlots = deptSize >= 10 ? Math.floor(deptSize / 5) : facLv >= 2 || deptSize >= 4 ? 2 : 1;
        const maxQuota = Math.max(1, spanSlots);
        if (currentAtLevel >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentAtLevel, reason: `โควตาหัวหน้ากลุ่ม Lv.3 เต็มแล้ว (${currentAtLevel}/${maxQuota} อัตรา ต้องขยายอาคารหรือเพิ่มขนาดทีมเพื่อเปิดโควตาเพิ่ม)` };
        }
        const expansionNote = maxQuota > 1 ? " (เปิดโควตาเพิ่มจากการขยายอาคาร/ขนาดทีม)" : "";
        return { allowed: true, maxQuota, currentCount: currentAtLevel, reason: `มีโควตาตำแหน่งหัวหน้ากลุ่ม Lv.3 ว่าง${expansionNote}` };
      }

      if (targetLevel === 4) {
        // Lv.4 (G4) Section Supervisor / Shift Foreman (หัวหน้าหมวด/หัวหน้ากะ):
        // Base 1 slot initially; expands when totalStaff >= 10 & cash >= 15M, scaling 1 per 8 staff!
        const currentLv4Plus = totalStaff < 10
          ? w.people.filter((p) => p.employed && (p.career?.level || 1) >= 4).length
          : currentAtLevel;
        const companyExpanded = totalStaff >= 10 && w.finance.cash >= 15000000;
        const maxQuota = companyExpanded
          ? Math.max(2, Math.floor(deptSize / 7) + 1, Math.min(16, 1 + Math.floor(totalStaff / 12)))
          : 1;
        if (currentLv4Plus >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentLv4Plus, reason: `โควตาหัวหน้าหมวด/กะ Lv.4 เต็มแล้ว (${currentLv4Plus}/${maxQuota} อัตรา บริษัทต้องขยายตัวขนาดใหญ่ก่อน)` };
        }
        return { allowed: true, maxQuota, currentCount: currentLv4Plus, reason: "เปิดโควตาหัวหน้าหมวด/หัวหน้ากะ Lv.4 จากการเติบโตขององค์กร" };
      }

      if (targetLevel === 5) {
        // Lv.5 (G5) Assistant Department Manager (รองหัวหน้าแผนก): 1 per 10 staff in department (min deptSize 3 or totalStaff >= 10)
        if (deptSize < 3 && totalStaff < 10) {
          return { allowed: false, maxQuota: 0, currentCount: currentAtLevel, reason: "ฝ่ายต้องมีบุคลากรอย่างน้อย 3 คนเพื่อเปิดตำแหน่งรองหัวหน้าแผนก (Lv.5)" };
        }
        const maxQuota = Math.max(1, Math.floor(deptSize / 10) + (deptSize >= 6 ? 1 : 0));
        if (currentAtLevel >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentAtLevel, reason: `โควตารองหัวหน้าแผนก Lv.5 เต็มแล้ว (${currentAtLevel}/${maxQuota} อัตรา)` };
        }
        return { allowed: true, maxQuota, currentCount: currentAtLevel, reason: `มีโควตารองหัวหน้าแผนก Lv.5 ว่าง (${currentAtLevel}/${maxQuota})` };
      }

      if (targetLevel === 6) {
        // Lv.6 (G6) Department Manager (หัวหน้าแผนก/ผู้จัดการแผนก): 1 per 14 staff in department (min deptSize 4 or totalStaff >= 12)
        if (deptSize < 4 && totalStaff < 12) {
          return { allowed: false, maxQuota: 0, currentCount: currentAtLevel, reason: "ต้องขยายขนาดแผนกอย่างน้อย 4 คนเพื่อแต่งตั้งหัวหน้าแผนก (Lv.6)" };
        }
        const maxQuota = Math.max(1, Math.floor(deptSize / 14) + (deptSize >= 10 ? 1 : 0));
        if (currentAtLevel >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentAtLevel, reason: `โควตาหัวหน้าแผนก Lv.6 เต็มแล้ว (${currentAtLevel}/${maxQuota} อัตรา)` };
        }
        return { allowed: true, maxQuota, currentCount: currentAtLevel, reason: `มีโควตาหัวหน้าแผนก Lv.6 ว่าง (${currentAtLevel}/${maxQuota})` };
      }

      if (targetLevel === 7) {
        // Lv.7 (G7) Deputy Division Director / Deputy Plant Manager (รองหัวหน้าฝ่าย/รองผู้จัดการโรงงาน)
        if (totalStaff < 14) {
          return { allowed: false, maxQuota: 0, currentCount: currentAtLevel, reason: "บริษัทต้องมีพนักงานรวม 14 คนขึ้นไปเพื่อเปิดตำแหน่งรองผู้อำนวยการฝ่าย (Lv.7)" };
        }
        const maxQuota = Math.max(1, Math.floor(deptSize / 20));
        if (currentAtLevel >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentAtLevel, reason: `โควตารองผู้อำนวยการฝ่าย Lv.7 เต็มแล้ว (${currentAtLevel}/${maxQuota} อัตรา)` };
        }
        return { allowed: true, maxQuota, currentCount: currentAtLevel, reason: `มีโควตารองผู้อำนวยการฝ่าย Lv.7 ว่าง (${currentAtLevel}/${maxQuota})` };
      }

      if (targetLevel === 8) {
        // Lv.8 (G8) Division Director / Plant General Manager (หัวหน้าฝ่าย/ผู้อำนวยการฝ่าย/ผู้จัดการโรงงาน)
        if (totalStaff < 18) {
          return { allowed: false, maxQuota: 0, currentCount: currentAtLevel, reason: "บริษัทต้องมีพนักงานรวม 18 คนขึ้นไปเพื่อแต่งตั้งผู้อำนวยการฝ่าย/ผู้จัดการโรงงาน (Lv.8)" };
        }
        const maxQuota = Math.max(1, Math.floor(deptSize / 28));
        if (currentAtLevel >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentAtLevel, reason: `โควตาผู้อำนวยการฝ่าย/ผู้จัดการโรงงาน Lv.8 เต็มแล้ว (${currentAtLevel}/${maxQuota} อัตรา)` };
        }
        return { allowed: true, maxQuota, currentCount: currentAtLevel, reason: `มีโควตาผู้อำนวยการฝ่าย/ผู้จัดการโรงงาน Lv.8 ว่าง (${currentAtLevel}/${maxQuota})` };
      }

      if (targetLevel === 9) {
        // Lv.9 (G9) EVP / C-Suite Executive (CCO / CFO / CTO / COO)
        const currentEvps = w.people.filter((p) => p.employed && (p.career?.level || 1) >= 9 && p.role === roleId).length;
        if (totalStaff < 22 || w.finance.cash < 12000000) {
          return { allowed: false, maxQuota: 0, currentCount: currentEvps, reason: "บริษัทต้องมีพนักงาน 22+ คน และเงินทุนมั่นคงเพื่อแต่งตั้งผู้บริหารระดับ C-Suite (Lv.9)" };
        }
        const maxQuota = 1;
        if (currentEvps >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentEvps, reason: `โควตาผู้บริหาร C-Suite ประจำสายงานเต็มแล้ว (${currentEvps}/${maxQuota})` };
        }
        return { allowed: true, maxQuota, currentCount: currentEvps, reason: "เปิดโควตารองกรรมการผู้จัดการใหญ่ C-Suite (Lv.9)" };
      }

      if (targetLevel === 10) {
        // Lv.10 (G10) Chief Executive Officer / President: Strictly 1 supreme leader company-wide
        const currentCeoLv10 = w.people.filter((p) => p.employed && (p.career?.level || 1) >= 10).length;
        const maxQuota = 1;
        if (currentCeoLv10 >= maxQuota) {
          return { allowed: false, maxQuota, currentCount: currentCeoLv10, reason: "ตำแหน่งประธานเจ้าหน้าที่บริหารสูงสุด (CEO Lv.10) มีได้เพียง 1 ตำแหน่งในองค์กร" };
        }
        return { allowed: true, maxQuota, currentCount: currentCeoLv10, reason: "เปิดโควตาประธานเจ้าหน้าที่บริหารสูงสุด (CEO Lv.10)" };
      }

      return { allowed: true, maxQuota: 99, currentCount: currentAtLevel, reason: "ระดับพื้นฐาน" };
    }

    function findSupervisorForRole(w, roleId, targetLevel = 3) {
      const employed = w.people.filter((p) => p.employed);
      const minSupLevel = Math.max(3, Number(targetLevel) || 3);
      // 1. Direct superior in the same department with level >= minSupLevel (closest rank first for chain of command)
      const deptSupervisors = employed
        .filter((p) => p.role === roleId && (p.career?.level || 1) >= minSupLevel)
        .sort((a, b) => (a.career?.level || 1) - (b.career?.level || 1) || a.id.localeCompare(b.id));
      if (deptSupervisors.length > 0) return deptSupervisors[0];
      // 2. Any senior manager in the same department at Lv.3+
      const anyDeptMgr = employed
        .filter((p) => p.role === roleId && (p.career?.level || 1) >= 3)
        .sort((a, b) => (b.career?.level || 1) - (a.career?.level || 1) || a.id.localeCompare(b.id));
      if (anyDeptMgr.length > 0) return anyDeptMgr[0];
      // 3. Escalates to CEO / Executive Coordinator
      const ceo = employed.find((p) => p.role === "coordinator");
      if (ceo) return ceo;
      return employed.find((p) => (p.career?.level || 1) >= 3) || employed[0] || null;
    }

    function evaluatePromotions(w, completedDay) {
      if (!w.policies.autoAccept || w.metrics.ordersPaid < 1) return;
      if (w.finance.cash < 3500000) return;
      if (!w.facilities) w.facilities = freshFacilities();

      const employedCount = w.people.filter((p) => p.employed).length;
      const maxPromotionsPerDay = employedCount >= 40 ? Math.min(5, Math.ceil(employedCount / 40)) : 1;
      let promotedToday = 0;
      const roles = Object.keys(w.catalog.roles);

      for (const roleId of roles) {
        if (promotedToday >= maxPromotionsPerDay) break;
        const staffInRole = w.people.filter((p) => p.employed && p.role === roleId);
        if (!staffInRole.length) continue;

        for (let targetLevel = 2; targetLevel <= 10; targetLevel++) {
          if (promotedToday >= maxPromotionsPerDay) break;

          const headroom = getDepartmentHeadroom(w, roleId, targetLevel);
          if (!headroom.allowed) continue;

          const evaluator = findSupervisorForRole(w, roleId, targetLevel);
          if (!evaluator) continue;

          const nextStep = D.getCareerStep ? D.getCareerStep(roleId, targetLevel) : null;
          if (!nextStep) continue;

          const candidates = [];
          for (const cand of staffInRole) {
            if ((cand.career?.level || 1) !== targetLevel - 1) continue;
            ensurePersonExtensions(w, cand);
            const primarySkill = w.catalog.roles[roleId]?.skill || "assembly";
            const skillLv = cand.skills[primarySkill]?.level || 0;
            const tenureDays = Math.max(1, completedDay - Math.floor((cand.hiredAt || 0) / 1440));
            const tasks = cand.career?.tasksCompleted || 0;

            if (
              tasks >= nextStep.minTasks &&
              skillLv >= nextStep.minSkill &&
              tenureDays >= nextStep.minTenureDays &&
              completedDay - (cand.career.lastPromotionDay || 0) >= 3
            ) {
              candidates.push({ person: cand, skillLv, tenureDays, tasks });
            }
          }

          if (candidates.length === 0) continue;

          const integrity = evaluator.profile.values.integrity ?? 50;
          const fairness = evaluator.profile.values.fairness ?? 50;
          const influence = evaluator.profile.values.influence ?? 50;
          const sociability = evaluator.profile.personality.sociability ?? 50;

          const meritWeight = clamp((integrity + fairness) / 135, 0.45, 0.88);
          const favoritismWeight = 1.0 - meritWeight;

          const scoredCandidates = candidates.map((item) => {
            const p = item.person;
            const skillScore = item.skillLv;
            const kpiScore = p.career?.kpiScore || 50;
            const taskScore = Math.min(100, item.tasks * 6);
            const meritScore = skillScore * 0.45 + kpiScore * 0.4 + taskScore * 0.15;

            const rel = evaluator.relationships[p.id] || { trust: 0, familiarity: 0 };
            const trustScore = clamp(rel.trust + 50, 0, 100);
            const famScore = clamp(rel.familiarity, 0, 100);
            const favoritismScore = trustScore * 0.65 + famScore * 0.35;

            const compositeScore = meritScore * meritWeight + favoritismScore * favoritismWeight;
            return {
              person: p,
              meritScore,
              favoritismScore,
              compositeScore,
              trust: rel.trust,
            };
          });

          scoredCandidates.sort(
            (a, b) => b.compositeScore - a.compositeScore || a.person.id.localeCompare(b.person.id),
          );

          const winner = scoredCandidates[0];
          const loser = scoredCandidates.length > 1 ? scoredCandidates[1] : null;

          const p = winner.person;
          const oldTitle = p.career.titleTh;
          const oldLevel = p.career.level;
          const newWage = p.pay.dailyWage + (nextStep.wageBonus || 3500);

          p.career.level = nextStep.level;
          p.career.gradeCode = nextStep.gradeCode || ("G" + nextStep.level);
          p.career.titleTh = nextStep.titleTh;
          p.career.badge = nextStep.badge;
          if (nextStep.division) p.career.division = nextStep.division;
          if (nextStep.departmentTh) p.career.departmentTh = nextStep.departmentTh;
          if (nextStep.dutyTh) p.career.dutyTh = nextStep.dutyTh;
          if (D.resolveOrgAssignment) {
            const orgUnit = D.resolveOrgAssignment(p.role, nextStep.level, p.id, w.facilities?.constructedPlots || []);
            p.career.orgUnit = orgUnit;
            p.career.sectionTh = orgUnit.sectionNameTh;
            p.career.groupTh = orgUnit.groupNameTh;
            p.career.tierNameTh = orgUnit.tierNameTh;
            p.career.orgPathTh = orgUnit.orgPathTh;
          }
          p.career.promotions = (p.career.promotions || 0) + 1;
          p.career.lastPromotionDay = completedDay;
          p.pay.dailyWage = newWage;
          p.pay.dayWage = newWage;

          let rationale = "ประเมินจากผลงานดีเด่นและทักษะความชำนาญตามหลักธรรมาภิบาล";
          let favoritismWon = false;
          if (loser && winner.meritScore < loser.meritScore && winner.favoritismScore > loser.favoritismScore) {
            favoritismWon = true;
            rationale = `ได้รับความไว้วางใจและความใกล้ชิดกับหัวหน้างาน (${evaluator.name}) เป็นพิเศษ`;
          } else if (favoritismWeight >= 0.4) {
            rationale = "ประเมินจากผลงานร่วมกับความไว้วางใจในการทำงานร่วมกัน";
          }

          if (!Array.isArray(p.career.history)) p.career.history = [];
          p.career.history.unshift({
            day: completedDay,
            fromLevel: oldLevel,
            toLevel: nextStep.level,
            titleTh: nextStep.titleTh,
            newWage,
            evaluatorId: evaluator.id,
            evaluatorName: evaluator.name,
            meritScore: Math.round(winner.meritScore),
            favoritismScore: Math.round(winner.favoritismScore),
            rationale,
          });

          p.state.morale = clamp(p.state.morale + 9, 0, 100);
          p.state.fulfillment = clamp(p.state.fulfillment + 7, 0, 100);
          p.state.drive = clamp(p.state.drive + 6, 0, 100);
          p.state.stress = clamp(p.state.stress - 5, 0, 100);
          updateSatisfactionAndKpi(w, p, completedDay);

          if (loser) {
            const loserPerson = loser.person;
            if (favoritismWon) {
              loserPerson.state.morale = clamp(loserPerson.state.morale - 8, 0, 100);
              loserPerson.state.stress = clamp(loserPerson.state.stress + 7, 0, 100);
              loserPerson.state.burnout = clamp(loserPerson.state.burnout + 5, 0, 100);
              if (!loserPerson.relationships[evaluator.id]) loserPerson.relationships[evaluator.id] = { trust: 0, familiarity: 0 };
              loserPerson.relationships[evaluator.id].trust = clamp(
                loserPerson.relationships[evaluator.id].trust - 12,
                -100,
                100,
              );
              event(
                w,
                "promotionGrievance",
                `${loserPerson.name} รู้สึกไม่ได้รับความเป็นธรรมที่ ${p.name} ได้เลื่อนตำแหน่งเพราะสนิทกับหัวหน้า`,
                { personId: loserPerson.id, promotedId: p.id, evaluatorId: evaluator.id },
              );
            } else {
              loserPerson.state.morale = clamp(loserPerson.state.morale - 2, 0, 100);
              loserPerson.state.drive = clamp(loserPerson.state.drive + 4, 0, 100);
              if ((loserPerson.profile.personality.conscientiousness ?? 50) >= 55) {
                loserPerson.state.focus = clamp(loserPerson.state.focus + 3, 0, 100);
              }
            }
          }

          if (p.career.mentorId) {
            const mentorObj = w.people.find((m) => m.id === p.career.mentorId && m.employed);
            if (mentorObj) {
              mentorObj.state.fulfillment = clamp(mentorObj.state.fulfillment + 5, 0, 100);
              mentorObj.state.morale = clamp(mentorObj.state.morale + 4, 0, 100);
            }
          }
          w.facilities.totalPromotions = (w.facilities.totalPromotions || 0) + 1;
          promotedToday += 1;

          event(
            w,
            "employeePromoted",
            `หัวหน้างาน (${evaluator.name}) อนุมัติเลื่อนตำแหน่ง ${p.identity.displayName} ขึ้นเป็น "${nextStep.titleTh}" (${nextStep.badge}) [${rationale}] — โควตา: ${headroom.reason}`,
            {
              personId: p.id,
              evaluatorId: evaluator.id,
              evaluatorName: evaluator.name,
              oldLevel,
              newLevel: nextStep.level,
              newTitleTh: nextStep.titleTh,
              newWage,
              rationale,
              meritScore: Math.round(winner.meritScore),
              favoritismScore: Math.round(winner.favoritismScore),
            },
          );
        }
      }
    }

    function evaluateBonuses(w, completedDay) {
      if (!w.policies.autoAccept || w.metrics.ordersPaid < 1) return;
      if (w.finance.arrearsSince !== null) return;
      if (!w.facilities) w.facilities = freshFacilities();
      const employed = w.people.filter((p) => p.employed);
      if (!employed.length) return;
      const safetyReserve = w.catalog.rules.rentDaily * 15 + 3500000;
      if (w.finance.cash <= safetyReserve) return;

      const ranked = employed
        .slice()
        .map((p) => {
          updateSatisfactionAndKpi(w, p, completedDay);
          return p;
        })
        .sort(
          (a, b) =>
            (b.career.kpiScore || 0) - (a.career.kpiScore || 0) ||
            (b.career.tasksCompleted || 0) - (a.career.tasksCompleted || 0) ||
            a.id.localeCompare(b.id),
        );
      const mvp = ranked[0];
      if (!mvp || (mvp.career.tasksCompleted || 0) < 2) return;
      const bonus = 15000;
      if (w.finance.cash - bonus < safetyReserve) return;

      post(w, "wages", -bonus, mvp.id + ":bonus:" + completedDay);
      mvp.pay.totalEarned += bonus;
      mvp.pay.totalPaid += bonus;
      mvp.pay.wallet += bonus;
      mvp.career.bonusTotal = (mvp.career.bonusTotal || 0) + bonus;
      mvp.career.lastBonusAmount = bonus;
      mvp.career.lastBonusDay = completedDay;
      mvp.state.morale = clamp(mvp.state.morale + 7, 0, 100);
      mvp.state.fulfillment = clamp(mvp.state.fulfillment + 5, 0, 100);
      updateSatisfactionAndKpi(w, mvp, completedDay);

      w.facilities.employeeOfTheWeekId = mvp.id;
      w.facilities.employeeOfTheWeekName = mvp.name;
      w.facilities.totalBonusesPaid = (w.facilities.totalBonusesPaid || 0) + bonus;

      event(
        w,
        "bonusAwarded",
        `มอบรางวัลพนักงานดีเด่นและโบนัสผลงาน ฿${(bonus / 100).toLocaleString("th-TH")} ให้แก่ ${mvp.identity.displayName} (KPI ${mvp.career.kpiScore})`,
        {
          personId: mvp.id,
          bonusAmount: bonus,
          kpiScore: mvp.career.kpiScore,
        },
      );
    }

    function updateExternalWorld(w, completedDay) {
      if (!w.externalWorld) return;
      const ext = w.externalWorld;
      const defaults = D.EXTERNAL_WORLD_DEFAULTS;
      if (!defaults) return;

      // 1. Update Stock Market Indices deterministically
      if (ext.stockMarket && ext.stockMarket.indices) {
        for (const [idxId, idxObj] of Object.entries(ext.stockMarket.indices)) {
          const h = seedHash(`${w.seed}:stock:${idxId}:${completedDay}`);
          const rawDeltaPct = ((h % 520) - 245) / 100; // -2.45% to +2.75%
          const nextVal = Math.max(100, Math.round(idxObj.value * (1 + rawDeltaPct / 100) * 10) / 10);
          idxObj.changePct = Math.round(((nextVal - idxObj.value) / idxObj.value) * 1000) / 10;
          idxObj.value = nextVal;
          if (!Array.isArray(idxObj.history)) idxObj.history = [];
          idxObj.history.push(nextVal);
          if (idxObj.history.length > 30) idxObj.history.shift();
        }
        // Calculate our Enterprise Valuation, Share Price, Credit Rating & IPO Readiness
        const employedCount = w.people.filter((p) => p.employed).length;
        const extAssetValue = Object.values(w.externalWorld?.assetPortfolio?.ownedAssets || {}).reduce(
          (sum, a) => sum + (D.EXTERNAL_ASSETS?.[a.id]?.cost || 0) * (1 + ((a.level || 1) - 1) * 0.5),
          0,
        );
        const plotAssetValue = extAssetValue + (w.facilities?.constructedPlots || []).reduce(
          (sum, pid) => sum + (D.EXPANSION_PLOTS?.[pid]?.cost || 0),
          0,
        );
        const levelAssetValue = Object.entries(w.facilities?.levels || {}).reduce(
          (sum, [fid, lv]) => sum + (lv - 1) * (FACILITY_RULES[fid]?.cost || 1000000),
          0,
        );
        const netCash = w.finance.cash - w.finance.debt;
        const salesRevenue = w.finance.totals.sales || 0;
        const valuation = Math.max(
          5000000,
          Math.round(
            netCash +
              plotAssetValue * 1.2 +
              levelAssetValue * 1.1 +
              salesRevenue * 1.5 +
              w.reputation * 250000 +
              employedCount * 350000,
          ),
        );
        ext.stockMarket.companyValuation = valuation;
        ext.stockMarket.sharePriceBaht = Math.round((valuation / 1000000) * 100) / 100;
        ext.stockMarket.creditRating =
          w.finance.debt === 0 && w.reputation >= 65
            ? "AAA"
            : w.finance.debt === 0 && w.reputation >= 52
              ? "AA"
              : w.finance.arrearsSince === null && w.finance.cash >= 8000000
                ? "A"
                : w.finance.arrearsSince === null
                  ? "BBB+"
                  : "BB";
        ext.stockMarket.ipoReadinessPct = clamp(
          Math.round(
            (w.finance.debt === 0 ? 30 : 10) +
              Math.min(30, (w.metrics.ordersPaid || 0) * 2) +
              Math.min(20, (w.reputation - 35) * 0.6) +
              Math.min(20, employedCount * 1.2),
          ),
          5,
          100,
        );
      }

      // 1B. Simulate Off-Site Living Corporate Ecosystem (Inter-company trade, price wars, B2B intermediate demands)
      simulateOffsiteEcosystemDaily(w, completedDay);

      // 2. Update Market Share vs Competitors
      const totalShipped = Object.values(w.production.shipped || {}).reduce((a, b) => a + b, 0);
      ext.ourMarketSharePct = Math.round(clamp(2.0 + totalShipped * 0.12 + (w.reputation - 45) * 0.08, 1.0, 45.0) * 10) / 10;

      // 3. Weekly Government Macro Policy & CEO Strategic Directive (Every 7 days)
      if (completedDay % 7 === 0) {
        const policies = defaults.governmentPolicies || [];
        if (policies.length) {
          const pickedPol = policies[seedHash(`${w.seed}:gov:${completedDay}`) % policies.length];
          ext.government = {
            activePolicyId: pickedPol.id,
            nameTh: pickedPol.nameTh,
            summaryTh: pickedPol.summaryTh,
            corporateTaxPct: pickedPol.corporateTaxPct,
            demandMultiplier: pickedPol.demandMultiplier,
            greenBonus: pickedPol.greenBonus,
            lastUpdatedDay: completedDay,
          };
        }
        const ceo = w.people.find((p) => p.employed && p.role === "coordinator");
        const directives = defaults.ceoDirectives || [];
        if (ceo && directives.length) {
          const per = ceo.profile.personality;
          const val = ceo.profile.values;
          let dirId = "sales_blitz";
          if (w.finance.cash < 5000000 || (per.prudence ?? 50) >= 72) dirId = "cash_shield";
          else if (w.people.filter((p) => p.employed).length >= 12 || (per.ambition ?? 50) >= 70) dirId = "scale_expansion";
          else if ((val.craftsmanship ?? 50) >= 68) dirId = "zero_defect";
          else if ((val.care ?? 50) >= 68) dirId = "wellness_care";
          else if ((per.openness ?? 50) >= 68) dirId = "rnd_sprint";
          const spec = directives.find((d) => d.id === dirId) || directives[0];
          ext.ceoDirective = {
            id: spec.id,
            nameTh: spec.nameTh,
            descTh: spec.descTh,
            updatedDay: completedDay,
            ceoName: ceo.name,
          };
        }
      }
    }

    function evaluatePersonalLifeMilestones(w, completedDay) {
      const milestoneCatalog = [
        { id: "emergencyFund", category: "comfort", cost: 40000, minWallet: 280000, icon: "🏦", titleTh: "เปิดบัญชีเงินออมฉุกเฉินและหลักประกันครอบครัวสำเร็จ" },
        { id: "familySupport", category: "comfort", cost: 60000, minWallet: 340000, icon: "💝", titleTh: "ส่งเงินก้อนดูแลครอบครัวที่บ้านเกิดสำเร็จ" },
        { id: "buyVehicle", category: "vehicle", cost: 90000, minWallet: 420000, icon: "🚗", titleTh: "ถอยรถส่วนตัวคันแรกสำหรับขับมาทำงานนิคมสำเร็จ" },
        { id: "buyHome", category: "home", cost: 150000, minWallet: 550000, icon: "🏠", titleTh: "วางเงินดาวน์บ้านในฝันจากน้ำพักน้ำแรงสำเร็จ" },
      ];
      let triggeredToday = 0;
      for (const p of w.people) {
        if (!p.employed || triggeredToday >= 2) continue;
        ensurePersonExtensions(w, p);
        if (!Array.isArray(p.career.lifeMilestones)) p.career.lifeMilestones = [];
        const achievedIds = new Set(p.career.lifeMilestones.map((m) => m.id));
        const nextMs = milestoneCatalog.find((m) => !achievedIds.has(m.id));
        if (!nextMs) continue;
        if (p.pay.wallet < nextMs.minWallet) continue;

        const purchaseEval = H.evaluateLifePurchase(
          p.profile,
          p.state,
          {
            id: nextMs.id,
            cost: nextMs.cost,
            impacts: {
              comfort: 0.75,
              security: 0.8,
              achievement: 0.8,
              recognition: 0.65,
            },
          },
          p.pay.wallet,
        );
        if (purchaseEval && purchaseEval.affordableNow) {
          // Transfer from wallet to outsideSpending so p.pay.wallet + p.pay.outsideSpending === p.pay.totalPaid remains 100% invariant
          p.pay.wallet -= nextMs.cost;
          p.pay.outsideSpending += nextMs.cost;
          const evRes = H.evaluateLifeEvent(p.profile, p.state, {
            type: nextMs.id === "familySupport" ? "familySupportSent" : "assetPurchased",
            category: nextMs.category,
            intensity: 1.0,
          });
          if (evRes && evRes.state) {
            p.state = evRes.state;
          } else {
            p.state = H.normaliseState({
              ...p.state,
              fulfillment: p.state.fulfillment + (purchaseEval.fulfillmentGain || 10),
              morale: p.state.morale + (purchaseEval.moraleGain || 8),
            });
          }

          const record = {
            day: completedDay,
            id: nextMs.id,
            icon: nextMs.icon,
            titleTh: nextMs.titleTh,
            cost: nextMs.cost,
          };
          p.career.lifeMilestones.unshift(record);
          triggeredToday++;
          event(
            w,
            "employeeLifeMilestone",
            `${nextMs.icon} ความสำเร็จชีวิตพนักงาน: ${p.identity?.displayName || p.name} (${p.career?.badge || "Lv.1"}) ${nextMs.titleTh}! (ใช้เงินออมส่วนตัว ฿${(nextMs.cost / 100).toLocaleString("th-TH")})`,
            {
              personId: p.id,
              milestoneId: nextMs.id,
              titleTh: nextMs.titleTh,
              cost: nextMs.cost,
            },
          );
        }
      }
    }

    function settleDay(w, completedDay) {
      if (completedDay <= w.lastSettledDay) return;
      w.lastSettledDay = completedDay;
      const hasDorm = Boolean(w.facilities?.constructedPlots?.includes("dormitory"));
      for (const p of w.people) {
        if (p.employed) {
          const ot = Math.round(
            (p.pay.dayWage / 480) *
              p.dayStats.otMinutes *
              (p.ot.payMultiplier || w.policies.overtimeMultiplier),
          );
          p.pay.dueBase += p.pay.dayWage;
          p.pay.dueOT += ot;
          p.pay.totalEarned += p.pay.dayWage + ot;
          p.pay.dayWage = p.pay.dailyWage;
          if (hasDorm) {
            p.state.energy = clamp(p.state.energy + 3, 0, 100);
            p.state.stress = clamp(p.state.stress - 2, 0, 100);
          }
        }
        const desiredLiving = Math.round(
          6500 +
            p.state.lifeBurden * 55 +
            (p.profile.values.comfort ?? 50) * 35 -
            (p.profile.personality.prudence ?? 50) * 30,
        );
        const living = Math.min(p.pay.wallet, Math.max(4000, desiredLiving));
        p.pay.wallet -= living;
        p.pay.outsideSpending += living;
        if (p.employed && p.pay.wallet >= 150000) {
          p.state.fulfillment = clamp(p.state.fulfillment + 0.35, 0, 100);
        }
        p.dayStats = { workMinutes: 0, otMinutes: 0 };
      }
      const assetBonuses = getActiveExternalAssetBonuses(w);
      const effectiveRent = Math.max(
        10000,
        Math.round(w.catalog.rules.rentDaily * (1 - assetBonuses.rentReductionPct)),
      );
      w.finance.payables.rent += effectiveRent;
      w.finance.payables.interest += Math.round(
        w.finance.debt * w.catalog.rules.interestDaily,
      );
      payBills(w);
      evaluateExternalAssetsDaily(w, completedDay);
      if (assetBonuses.moraleBonusDaily > 0 || assetBonuses.energyBonusDaily > 0) {
        for (const emp of w.people) {
          if (!emp.employed) continue;
          if (assetBonuses.moraleBonusDaily > 0) {
            emp.state.morale = clamp(emp.state.morale + assetBonuses.moraleBonusDaily, 0, 100);
          }
          if (assetBonuses.energyBonusDaily > 0) {
            emp.state.energy = clamp(emp.state.energy + assetBonuses.energyBonusDaily, 0, 100);
          }
        }
      }
      if (completedDay % w.catalog.rules.paydayInterval === 0) {
        pay(w, true);
        for (const p of w.people)
          if (p.pay.dueBase + p.pay.dueOT > 0 && p.pay.overdueSince === null)
            p.pay.overdueSince = completedDay;
        evaluateBonuses(w, completedDay);
      }
      if (completedDay % w.catalog.rules.paydayInterval === 0) {
        evaluatePersonalLifeMilestones(w, completedDay);
      }
      if (w.externalWorld?.ceoDirective?.updatedDay > 1 && w.externalWorld?.ceoDirective?.id === "wellness_care") {
        for (const emp of w.people) {
          if (!emp.employed) continue;
          emp.state.morale = clamp(emp.state.morale + 2, 0, 100);
          emp.state.stress = clamp(emp.state.stress - 2, 0, 100);
        }
      }
      if (completedDay % 7 === 0 && (w.externalWorld?.government?.greenBonus || 0) > 0) {
        const hasGreenAsset =
          (w.facilities?.constructedPlots || []).some((pid) => ["solarPlant", "waterPlant"].includes(pid)) ||
          Object.keys(w.externalWorld?.assetPortfolio?.ownedAssets || {}).some((aid) =>
            ["offsite_solar_wind_farm", "organic_herb_orchard", "forestry_pulp_mill"].includes(aid),
          );
        if (hasGreenAsset) {
          w.reputation = clamp(w.reputation + w.externalWorld.government.greenBonus, 0, 100);
        }
      }
      evaluatePromotions(w, completedDay);
      updateExternalWorld(w, completedDay);
      for (const p of w.people) updateSatisfactionAndKpi(w, p, completedDay);
      const welfare =
        w.policies.wellbeingDaily * w.people.filter((p) => p.employed).length;
      if (welfare && w.finance.cash >= welfare) {
        post(w, "welfare", -welfare, "wellbeing");
        for (const p of w.people.filter((p) => p.employed)) {
          p.state.morale = clamp(p.state.morale + 1, 0, 100);
          p.state.stress = clamp(p.state.stress - 2, 0, 100);
        }
      }
      refreshArrears(w, completedDay);
      for (const p of w.people.filter((p) => p.employed)) {
        const unpaidDays =
            p.pay.overdueSince === null
              ? 0
              : completedDay - p.pay.overdueSince + 1,
          primarySkill = w.catalog.roles[p.role].skill,
          expectedWage = Math.max(
            w.catalog.rules.minimumWage,
            26000 + p.skills[primarySkill].level * 200,
          ),
          voice = H.workplaceVoice(p.profile, p.state, {
            unpaidDays,
            unresolvedDays: p.concern ? completedDay - p.concern.day : 0,
            wageFairness: p.pay.dailyWage / expectedWage,
          });
        if (voice.action !== "none") {
          if (!p.concern) {
            p.concern = {
              day: completedDay,
              action: voice.action,
              reasons: voice.reasons,
            };
            event(w, "employeeConcern", `พนักงาน (${p.name}) แจ้งข้อกังวล`, {
              personId: p.id,
              reasons: voice.reasons,
            });
          } else {
            p.concern.action = voice.action;
            p.concern.reasons = voice.reasons;
            if (voice.action === "considerLeaving") {
              release(w, p);
              p.employed = false;
              p.atWork = false;
              p.breakUntil = 0;
              p.breakKind = null;
              p.leftAt = now(w);
              p.activity = "offDuty";
              p.position = { ...w.layout.entrance };
              p.previousPosition = { ...p.position };
              p.intent = { code: "leftCompany", reasons: voice.reasons };
              event(w, "employeeLeft", `พนักงาน (${p.name}) ตัดสินใจลาออก`, {
                personId: p.id,
                reasons: voice.reasons,
              });
            }
          }
        } else if (p.concern && p.state.morale >= 35 && p.state.burnout <= 58) {
          p.concern = null;
        }
      }
      w.history.days.push({
        day: completedDay,
        cash: w.finance.cash,
        debt: w.finance.debt,
        reputation: w.reputation,
        ordersPaid: w.metrics.ordersPaid,
      });
      if (w.history.days.length > 120) w.history.days.shift();
    }
    function checkOutcome(w) {
      if (
        w.finance.debt === 0 &&
        w.finance.cash >= w.catalog.rules.winCash &&
        w.reputation >= w.catalog.rules.winReputation
      ) {
        w.status = "won";
        w.outcome = { code: "companyRecovered", at: now(w) };
      } else if (!w.people.some((p) => p.employed)) {
        w.status = "lost";
        w.outcome = { code: "teamCollapsed", at: now(w) };
      } else if (
        w.finance.arrearsSince !== null &&
        day(w) - w.finance.arrearsSince >= 4
      ) {
        w.status = "lost";
        w.outcome = { code: "insolvent", at: now(w) };
      } else if (day(w) > w.catalog.rules.scenarioDays) {
        w.status = "lost";
        w.outcome = { code: "deadlineReached", at: now(w) };
      }
    }

    function scaleCompany(w, targetCount, options = {}) {
      const target = clamp(Math.floor(Number(targetCount) || 8), 4, w.catalog.rules.maxPeople || 500);
      const roleCycle = [
        "assembler",
        "assembler",
        "assembler",
        "inspector",
        "logistics",
        "sales",
        "admin",
        "engineer",
        "assembler",
        "inspector",
        "logistics",
        "coordinator",
      ];
      let added = 0;
      while (w.people.filter((p) => p.employed).length < target) {
        const idx = w.nextCandidate;
        const cid = "candidate-" + idx;
        const roleId = roleCycle[(w.people.length + added) % roleCycle.length];
        const identity = D.createIdentity ? D.createIdentity(w.seed, cid, null, roleId) : null;
        const baseNick = identity ? identity.nickname : "พนักงาน";
        const wage = 32000 + (idx % 4) * 3000;
        if (!options.freeGrant) {
          if (w.finance.cash < w.catalog.rules.hireFee) break;
          post(w, "hiring", -w.catalog.rules.hireFee, cid);
        }
        const p = createPerson(w, cid, `${baseNick} ${idx}`, roleId, wage);
        w.people.push(p);
        w.nextCandidate += 1;
        added++;
      }
      syncStationCapacitiesForScale(w);
      return { ok: true, added, totalEmployed: w.people.filter((p) => p.employed).length };
    }

    function step(w) {
      if (w.status !== "running") return false;
      if (w.people.length > 10) syncStationCapacitiesForScale(w);
      if (tod(w) === 570) evaluateDebtRepayment(w);
      if (tod(w) === 600) evaluateFacilityInvestment(w);
      if (tod(w) === 615) evaluatePlotConstruction(w);
      if (tod(w) === 630 && w.policies.autoAccept) evaluateMachineMaintenance(w);
      if (tod(w) === 660 && day(w) >= 5 && w.policies.autoAccept &&
          w.people.some((p) => p.employed && p.atWork && p.role === "coordinator"))
        evaluateAutonomousHiring(w);
      processDue(w);
      ensureJobs(w);
      autoAccept(w);
      planPurchases(w);
      if (tod(w) === 1020)
        for (const p of w.people.filter((p) => p.employed)) {
          const unpaidDays =
            p.pay.overdueSince === null
              ? 0
              : Math.max(1, day(w) - p.pay.overdueSince);
          const answer = H.respondToRequest(p.profile, p.state, {
            hours: w.policies.overtimeHours,
            payMultiplier: w.policies.overtimeMultiplier,
            urgency: activeOrders(w).some((o) => o.deadline < now(w) + 1440)
              ? 1
              : 0,
            unpaidDays,
          });
          p.ot = {
            day: day(w),
            payMultiplier: w.policies.overtimeMultiplier,
            ...answer,
          };
          if (w.policies.overtimeHours > 0)
            event(
              w,
              "overtimeResponse",
              `${p.name} ตอบรับคำขอ OT: ${answer.decision === "accept" ? "ตกลงทำเต็มเวลา" : answer.decision === "negotiate" ? "ขอทำบางส่วน" : "ปฏิเสธ"}`,
              {
                personId: p.id,
                ...answer,
              },
            );
        }

      // Fast O(1) station & social/help index for 200-500 NPC scaling
      const stationLoadMap = new Map();
      let tickCtx = null;
      if (w.people.length > 15) {
        const stationOccupants = new Map();
        const workingByZone = new Map();
        const helpersCount = new Map();
        const firstHelperByTarget = new Map();
        let trainingCount = 0;
        for (const p of w.people) {
          if (!p.employed) continue;
          if (p.stationId === "training") trainingCount++;
          if (p.taskId && p.stationId) {
            stationLoadMap.set(p.stationId, (stationLoadMap.get(p.stationId) || 0) + 1);
          }
          if (p.stationId && p.path.length === 0) {
            let list = stationOccupants.get(p.stationId);
            if (!list) { list = []; stationOccupants.set(p.stationId, list); }
            if (list.length < 8) list.push(p);
          }
          if (p.taskId) {
            const z = L.zoneAt(w.layout, p.position);
            let zList = workingByZone.get(z);
            if (!zList) { zList = []; workingByZone.set(z, zList); }
            if (zList.length < 10) zList.push(p);
          }
          if (p.activity === "helping" && p.intent && p.intent.reasons && p.intent.reasons[0]) {
            const tid = p.intent.reasons[0];
            helpersCount.set(tid, (helpersCount.get(tid) || 0) + 1);
            if (!firstHelperByTarget.has(tid)) firstHelperByTarget.set(tid, p);
          }
        }
        tickCtx = { stationOccupants, workingByZone, helpersCount, firstHelperByTarget, trainingCount };
      } else {
        for (const p of w.people) {
          if (p.employed && p.taskId && p.stationId) {
            stationLoadMap.set(p.stationId, (stationLoadMap.get(p.stationId) || 0) + 1);
          }
        }
      }

      for (const p of w.people) personStep(w, p, stationLoadMap, tickCtx);
      w.clock.absoluteMinute += TICK;
      w.clock.tick++;
      if (tod(w) === 0) settleDay(w, day(w) - 1);
      checkOutcome(w);
      return true;
    }
    function advance(w, minutes) {
      if (!int(minutes, 0, 1440 * 365) || minutes % TICK)
        throw new TypeError(
          "advance duration must be a multiple of 5 minutes, <=365 days",
        );
      let advanced = 0;
      for (let i = 0; i < minutes / TICK; i++) {
        if (!step(w)) break;
        advanced += TICK;
      }
      return advanced;
    }
    function candidates(w) {
      const roles = ["assembler", "inspector", "logistics", "engineer", "sales", "admin"];
      return [0, 1, 2].map((offset) => {
        const idx = w.nextCandidate + offset;
        const cid = "candidate-" + idx,
          roleGuess = roles[(idx - 1) % roles.length],
          profile = H.createProfile(w.seed, cid),
          identity = D.createIdentity ? D.createIdentity(w.seed, cid, null, roleGuess) : null,
          baseNick = identity ? identity.nickname : ["พลอย", "นนท์", "ฝน"][(idx - 1) % 3];
        return {
          id: cid,
          name: baseNick + " " + idx,
          profile,
          identity,
          dailyWage: 32000 + offset * 4000,
        };
      });
    }
    const failure = (code, message) => ({ ok: false, code, message });
    function command(w, c) {
      if (!c || typeof c !== "object" || typeof c.type !== "string")
        return failure("invalidCommand", "คำสั่งไม่ถูกต้อง");
      if (w.status !== "running" && c.type !== "continueEndless")
        return failure("scenarioEnded", "สถานการณ์สิ้นสุดแล้ว");
      const person = c.personId
        ? w.people.find((p) => p.id === c.personId && p.employed)
        : null;
      switch (c.type) {
        case "setPolicy": {
          const valid = {
            autoBuy: typeof c.value === "boolean",
            autoAccept: typeof c.value === "boolean",
            workPriority: ["balanced", "delivery", "research"].includes(
              c.value,
            ),
            overtimeHours:
              typeof c.value === "number" &&
              Number.isFinite(c.value) &&
              c.value >= 0 &&
              c.value <= 3 &&
              c.value * 2 === Math.floor(c.value * 2),
            overtimeMultiplier:
              typeof c.value === "number" &&
              Number.isFinite(c.value) &&
              c.value >= 1.5 &&
              c.value <= 3,
            wellbeingDaily: int(c.value, 0, 10000),
          };
          if (
            typeof c.key !== "string" ||
            !Object.hasOwn(valid, c.key) ||
            !valid[c.key]
          )
            return failure("invalidPolicy", "ค่านโยบายไม่ถูกต้อง");
          w.policies[c.key] = c.value;
          return { ok: true };
        }
        case "buyMaterials": {
          const m = own(w.catalog.materials, c.materialId);
          if (!m || !int(c.quantity, 1, 200))
            return failure("invalidPurchase", "วัตถุดิบหรือจำนวนไม่ถูกต้อง");
          if (w.finance.cash < m.unitCost * c.quantity)
            return failure("insufficientCash", "เงินสดไม่พอซื้อวัตถุดิบ");
          return {
            ok: true,
            purchaseId: placePurchase(w, c.materialId, c.quantity).id,
          };
        }
        case "acceptOffer": {
          const o = own(w.offers, c.offerId);
          if (
            !o ||
            o.status !== "open" ||
            o.expiresAt <= now(w) ||
            o.deadline <= now(w) ||
            !w.research.unlocked.includes(o.productId)
          )
            return failure("offerUnavailable", "ข้อเสนอใช้ไม่ได้แล้ว");
          if (
            activeOrders(w).length >= w.catalog.rules.maxActiveOrders ||
            Object.keys(w.units).length + o.quantity > w.catalog.rules.maxUnits
          )
            return failure("capacityLimit", "งานค้างเกินขีดจำกัด");
          const order = accept(w, o);
          if (!order)
            return failure(
              "financialLimit",
              "ยอดคำสั่งซื้อเกินขอบเขตตัวเลขที่รองรับ",
            );
          return { ok: true, orderId: order.id };
        }
        case "cancelOrder": {
          const o = own(w.orders, c.orderId);
          if (
            !o ||
            o.status !== "accepted" ||
            o.materialConsumed ||
            Object.values(w.units).some(
              (u) => u.orderId === o.id && u.materialConsumed,
            )
          )
            return failure(
              "orderCannotCancel",
              "ยกเลิกได้ก่อนเริ่มใช้วัตถุดิบเท่านั้น",
            );
          if (w.finance.cash < o.deposit)
            return failure("insufficientCash", "เงินสดไม่พอคืนมัดจำ");
          if (o.deposit) post(w, "customerRefund", -o.deposit, o.id);
          for (const j of Object.values(w.jobs).filter(
            (j) => j.orderId === o.id,
          )) {
            const p = w.people.find((p) => p.taskId === j.id);
            if (p) release(w, p);
            delete w.jobs[j.id];
          }
          for (const u of Object.values(w.units).filter(
            (u) => u.orderId === o.id,
          )) {
            unreserve(w, u);
            delete w.units[u.id];
          }
          o.status = "cancelled";
          return { ok: true };
        }
        case "borrow":
          if (
            !int(c.amount, 1) ||
            c.amount + w.finance.debt > w.catalog.rules.creditLimit ||
            !Number.isSafeInteger(w.finance.cash + c.amount)
          )
            return failure("creditLimit", "วงเงินหรือจำนวนไม่ถูกต้อง");
          post(w, "loan", c.amount, "bank");
          return { ok: true };
        case "repayDebt":
          if (
            !int(c.amount, 1) ||
            c.amount > w.finance.cash ||
            c.amount > w.finance.debt
          )
            return failure(
              "invalidRepayment",
              "จำนวนชำระหนี้หรือเงินสดไม่ถูกต้อง",
            );
          post(w, "debtRepayment", -c.amount, "bank");
          checkOutcome(w);
          return { ok: true };
        case "payArrears":
          payBills(w);
          pay(w, false);
          refreshArrears(w);
          return { ok: true };
        case "setRole":
          if (!person || !own(w.catalog.roles, c.role))
            return failure("invalidRole", "พนักงานหรือตำแหน่งไม่ถูกต้อง");
          person.role = c.role;
          person.visual.roleKey = c.role;
          ensurePersonExtensions(w, person);
          if (D.getCareerStep) {
            const step = D.getCareerStep(c.role, person.career.level || 1);
            person.career.titleTh = step.titleTh;
            person.career.badge = step.badge;
            if (step.division) person.career.division = step.division;
            if (step.departmentTh) person.career.departmentTh = step.departmentTh;
            if (step.dutyTh) person.career.dutyTh = step.dutyTh;
          }
          return { ok: true };
        case "setWage":
          if (!person || !int(c.dailyWage, w.catalog.rules.minimumWage, 200000))
            return failure("invalidWage", "ค่าจ้างไม่ถูกต้อง");
          person.pay.dailyWage = c.dailyWage;
          return { ok: true };
        case "hire": {
          const candidate = candidates(w).find((p) => p.id === c.candidateId);
          if (!candidate || !own(w.catalog.roles, c.role))
            return failure("invalidCandidate", "ผู้สมัครหรือตำแหน่งไม่ถูกต้อง");
          if (
            w.people.filter((p) => p.employed).length >=
            w.catalog.rules.maxPeople
          )
            return failure("staffLimit", "พนักงานถึงขีดจำกัด");
          if (w.finance.cash < w.catalog.rules.hireFee)
            return failure("insufficientCash", "เงินสดไม่พอค่ารับสมัคร");
          const p = createPerson(
            w,
            candidate.id,
            candidate.name,
            c.role,
            candidate.dailyWage,
          );
          post(w, "hiring", -w.catalog.rules.hireFee, p.id);
          w.people.push(p);
          w.nextCandidate += 3;
          syncStationCapacitiesForScale(w);
          event(
            w,
            "employeeHired",
            `ฝ่ายบุคคลว่าจ้าง ${p.name} เข้าทำงานตำแหน่ง${w.catalog.roles[c.role].nameTh}`,
            { personId: p.id },
          );
          return { ok: true, personId: p.id };
        }
        case "constructPlot": {
          return constructPlot(w, c.plotId, person, c.reason);
        }
        case "acquireExternalAsset": {
          return acquireExternalAsset(w, c.assetId, { upgrade: Boolean(c.upgrade), freeGrant: Boolean(c.freeGrant) });
        }
        case "setSupplyChainStrategy": {
          if (!D.SUPPLY_CHAIN_STRATEGIES?.[c.strategyId])
            return failure("invalidStrategy", "กลยุทธ์ห่วงโซ่อุปทานไม่ถูกต้อง");
          const ap = ensureAssetPortfolio(w);
          ap.supplyChainStrategy = c.strategyId;
          const stSpec = D.SUPPLY_CHAIN_STRATEGIES[c.strategyId];
          event(
            w,
            "supplyChainStrategyChanged",
            `🧭 ปรับวิสัยทัศน์ห่วงโซ่อุปทานเป็น "${stSpec.nameTh}"`,
            { strategyId: c.strategyId },
          );
          return { ok: true, strategyId: c.strategyId };
        }
        case "toggleProductionChain": {
          const ap = ensureAssetPortfolio(w);
          if (!ap.chainSettings[c.chainId])
            return failure("invalidChain", "ไม่พบห่วงโซ่การผลิตที่ระบุ");
          ap.chainSettings[c.chainId].enabled =
            typeof c.enabled === "boolean" ? c.enabled : !ap.chainSettings[c.chainId].enabled;
          return { ok: true, chainId: c.chainId, enabled: ap.chainSettings[c.chainId].enabled };
        }
        case "runMidstreamRefining": {
          return runMidstreamRefining(w, {
            force: true,
            chainId: c.chainId || null,
            materialId: c.materialId || null,
            batches: c.batches || 2,
            ignoreTechGate: Boolean(c.ignoreTechGate),
          });
        }
        case "craftMaterial": {
          return craftMaterialRecipe(w, c.materialId, c.batches || 1, {
            ignoreTechGate: Boolean(c.ignoreTechGate),
          });
        }
        case "sellMaterialB2B": {
          return sellMaterialB2B(w, c.materialId, c.quantity || 2, c.buyerCorpId || null);
        }
        case "setCorporationRelation": {
          return setCorporationRelation(w, c.corpId, c.mode);
        }
        case "continueEndless": {
          if (!w.facilities) w.facilities = freshFacilities();
          w.facilities.turnaroundAchieved = true;
          w.facilities.endlessMode = true;
          w.catalog.rules.winCash = Math.max(w.catalog.rules.winCash, 100000000000);
          w.catalog.rules.scenarioDays = Math.max(w.catalog.rules.scenarioDays, 365);
          w.status = "running";
          w.outcome = null;
          event(
            w,
            "turnaroundMilestone",
            "🏆 บริษัทบรรลุเป้าหมายปลดหนี้และกอบกู้วิกฤตสำเร็จ! เปิดโหมดขยายอาณาจักรไร้ขีดจำกัด (Endless Corporate Empire Mode)",
            { day: day(w), cash: w.finance.cash, reputation: w.reputation },
          );
          return { ok: true, endlessMode: true };
        }
        case "maintainMachines": {
          if (!w.facilities) w.facilities = freshFacilities();
          const before = w.facilities.machineCondition ?? 100;
          w.facilities.machineCondition = 100;
          w.facilities.maintenanceCount = (w.facilities.maintenanceCount || 0) + 1;
          event(
            w,
            "machineMaintained",
            `🛠️ สั่งซ่อมบำรุงและสอบเทียบเครื่องจักรโรงงานเต็มระบบ สภาพพร้อมใช้งาน 100% (จาก ${before}%)`,
            { machineCondition: 100, manual: true },
          );
          return { ok: true, machineCondition: 100 };
        }
        case "batchCraftAll": {
          let totalBatches = 0;
          let totalUnits = 0;
          runMidstreamRefining(w, { force: true });
          for (const tierLv of [1, 2, 3]) {
            for (const rec of Object.values(D.MATERIAL_RECIPES || {})) {
              if (rec.tier !== tierLv) continue;
              if ((w.research?.points || 0) < (rec.minResearch || 0)) continue;
              const res = craftMaterialRecipe(w, rec.id, c.batches || 2, { silent: true });
              if (res.ok) {
                totalBatches += res.batches;
                totalUnits += res.unitsProduced;
              }
            }
          }
          if (totalBatches > 0) {
            event(
              w,
              "materialCrafted",
              `⚡ สั่งเดินเครื่องแปรรูปวัตถุดิบแบบ Batch ครบทุกขั้น (T1➔T3) สำเร็จ ${totalBatches} ล็อต (ได้วัตถุดิบและชิ้นส่วนรวม +${totalUnits} ชิ้น)`,
              { batches: totalBatches, unitsProduced: totalUnits },
            );
          }
          return { ok: true, batches: totalBatches, unitsProduced: totalUnits };
        }
        case "setCeoDirective": {
          const directives = D.EXTERNAL_WORLD_DEFAULTS?.ceoDirectives || [];
          const spec = directives.find((d) => d.id === c.directiveId);
          if (!spec) return failure("invalidDirective", "ไม่พบเข็มทิศกลยุทธ์ที่ระบุ");
          if (!w.externalWorld) w.externalWorld = freshExternalWorld(w.seed);
          const ceo = w.people.find((p) => p.employed && p.role === "coordinator") || w.people[0];
          w.externalWorld.ceoDirective = {
            id: spec.id,
            nameTh: spec.nameTh,
            descTh: spec.descTh,
            updatedDay: Math.max(2, day(w)),
            ceoName: ceo ? ceo.name : "CEO",
          };
          event(
            w,
            "ceoDirectiveChanged",
            `🧭 CEO (${ceo ? ceo.name : "ผู้บริหาร"}) ประกาศเปลี่ยนเข็มทิศกลยุทธ์องค์กรเป็น "${spec.nameTh}"`,
            { directiveId: spec.id },
          );
          return { ok: true, directiveId: spec.id };
        }
        case "scaleCompany": {
          if (!int(c.targetCount, 4, w.catalog.rules.maxPeople || 500))
            return failure("invalidScale", "จำนวนพนักงานเป้าหมายไม่ถูกต้อง");
          return scaleCompany(w, c.targetCount, { freeGrant: Boolean(c.freeGrant) });
        }
        case "expandSite": {
          if (
            !int(c.width, 0, 8) ||
            !int(c.height, 0, 6) ||
            c.width + c.height === 0
          )
            return failure("invalidExpansion", "ขนาดขยายพื้นที่ไม่ถูกต้อง");
          let layout;
          try {
            layout = L.expand(w.layout, c.width, c.height);
          } catch (_) {
            return failure("invalidExpansion", "ขยายพื้นที่เกินขีดจำกัด");
          }
          const cost =
            (layout.width * layout.height - w.layout.width * w.layout.height) *
            25000;
          if (cost > w.finance.cash)
            return failure("insufficientCash", "เงินสดไม่พอขยายพื้นที่");
          post(w, "expansion", -cost, "site");
          w.layout = layout;
          return { ok: true };
        }
        case "installStation": {
          const customStationKinds = Object.values(
            w.catalog.taskKinds || {},
          ).map((t) => t.stationKind);
          const allowedStationKinds = new Set([
            "assembly",
            "quality",
            "packing",
            "research",
            "sales",
            "admin",
            ...customStationKinds,
          ]);
          if (
            typeof c.kind !== "string" ||
            !allowedStationKinds.has(c.kind) ||
            !int(c.x, 1, 95) ||
            !int(c.y, 1, 63) ||
            !int(c.accessX, 1, 95) ||
            !int(c.accessY, 1, 63)
          )
            return failure("invalidStation", "ตำแหน่งสถานีไม่ถูกต้อง");
          const cost = 1200000;
          if (w.finance.cash < cost)
            return failure("insufficientCash", "เงินสดไม่พอติดตั้งสถานี");
          const sid = "station-" + (w.sequence + 1),
            station = {
              id: sid,
              kind: c.kind,
              cell: { x: c.x, y: c.y },
              access: { x: c.accessX, y: c.accessY },
              capacity: 1,
              visualKey: "station." + c.kind,
            };
          let map;
          try {
            map = L.addStation(w.layout, station);
          } catch (_) {
            return failure(
              "invalidStation",
              "พื้นที่ใช้งานไม่ได้หรือปิดกั้นทางเดิน",
            );
          }
          if (
            w.people.some(
              (p) =>
                !L.walkable(map, p.position) ||
                (p.stationId &&
                  L.findPath(
                    map,
                    p.position,
                    map.stations[p.stationId].access,
                  ) === null),
            )
          )
            return failure("occupiedSite", "พื้นที่มีคนหรือปิดกั้นทางเดิน");
          id(w, "station");
          post(w, "equipment", -cost, sid);
          w.layout = map;
          for (const p of w.people)
            if (p.stationId)
              p.path =
                L.findPath(map, p.position, map.stations[p.stationId].access) ||
                [];
          return { ok: true, stationId: sid };
        }
        case "directorEdit": {
          // Sandbox Edit Hub (JS2-inspired) — strictly preserves accounting & material conservation invariants
          if (!c.action || typeof c.action !== "string")
            return failure("invalidEdit", "คำสั่งแก้ไขไม่ถูกต้อง");
          if (c.action === "setTrait") {
            const dimensions = c.group === "personality" ? H.PERSONALITY : c.group === "values" ? H.VALUES : [];
            if (!person || !dimensions.includes(c.key) || typeof c.value !== "number" ||
                !Number.isFinite(c.value) || c.value < 0 || c.value > 100)
              return failure("invalidEdit", "ค่านิสัยหรือค่านิยมไม่ถูกต้อง");
            const profile = clone(person.profile);
            profile[c.group][c.key] = c.value;
            const errors = H.validateProfile(profile);
            if (errors.length) return failure("invalidEdit", errors.join("; "));
            person.profile = H.freezeProfile(profile);
            event(w, "directorEdit", `[ศูนย์แก้ไข] ปรับข้อมูลตัวละคร ${person.name}`, {
              action: "setTrait", personId: person.id, group: c.group, key: c.key, value: c.value,
            });
            return { ok: true };
          }
          if (c.action === "grantCash") {
            if (!int(c.amount, 100, 1000000000))
              return failure("invalidEdit", "จำนวนเงินไม่ถูกต้อง");
            w.finance.openingCash += c.amount;
            w.finance.cash += c.amount;
            event(
              w,
              "directorEdit",
              `[ศูนย์แก้ไข] อัดฉีดเงินทุนสำรอง +${(c.amount / 100).toLocaleString("th-TH")} บาท`,
              { action: "grantCash", amount: c.amount },
            );
            return { ok: true };
          }
          if (c.action === "grantMaterial" || c.action === "addMaterials") {
            if (!int(c.quantity, 1, 500) ||
                (c.action === "grantMaterial" && !own(w.catalog.materials, c.materialId)))
              return failure("invalidEdit", "วัตถุดิบหรือจำนวนไม่ถูกต้อง");
            const qty = c.quantity;
            const targets = c.action === "grantMaterial" ? [c.materialId] : Object.keys(w.catalog.materials);
            if (targets.some((id) => !int(w.inventory.opening[id] + qty) || !int(w.inventory.materials[id] + qty)))
              return failure("invalidEdit", "จำนวนวัตถุดิบเกินขีดจำกัด");
            if (c.materialId && own(w.catalog.materials, c.materialId)) {
              const mat = w.catalog.materials[c.materialId];
              w.inventory.opening[c.materialId] += qty;
              w.inventory.materials[c.materialId] += qty;
              event(
                w,
                "directorEdit",
                `[ศูนย์แก้ไข] เพิ่มสต็อกตั้งต้น ${mat.nameTh} +${qty} ชิ้น`,
                { action: "grantMaterial", materialId: c.materialId, quantity: qty },
              );
            } else {
              for (const mId of Object.keys(w.catalog.materials)) {
                w.inventory.opening[mId] += qty;
                w.inventory.materials[mId] += qty;
              }
              event(
                w,
                "directorEdit",
                `[ศูนย์แก้ไข] เติมวัตถุดิบทุกชนิด +${qty} ชิ้นเข้าคลัง`,
                { action: "addMaterials", quantity: qty },
              );
            }
            return { ok: true };
          }
          if (c.action === "grantResearch" || c.action === "addResearch") {
            const pts = int(c.points, 1, 5000) ? c.points : 100;
            w.research.points += pts;
            for (const prod of Object.values(w.catalog.products)) {
              if (
                prod.researchRequired <= w.research.points &&
                !w.research.unlocked.includes(prod.id)
              ) {
                w.research.unlocked.push(prod.id);
              }
            }
            event(
              w,
              "directorEdit",
              `[ศูนย์แก้ไข] เพิ่มแต้มวิจัย R&D +${pts} แต้ม`,
              { action: "grantResearch", points: pts },
            );
            return { ok: true };
          }
          if (c.action === "setReputation") {
            const rawRep = typeof c.value === "number" ? c.value : c.reputation;
            if (typeof rawRep !== "number" || !Number.isFinite(rawRep))
              return failure("invalidEdit", "ค่าชื่อเสียงไม่ถูกต้อง");
            w.reputation = clamp(Math.round(rawRep), 0, 100);
            checkOutcome(w);
            return { ok: true };
          }
          if (c.action === "refreshPerson") {
            const targets = person
              ? [person]
              : w.people.filter((p) => p.employed);
            if (!targets.length) return failure("invalidEdit", "ไม่พบพนักงาน");
            for (const tp of targets) {
              tp.state = H.normaliseState({
                ...tp.state,
                energy: 100,
                focus: 100,
                hunger: 0,
                stress: 8,
                burnout: 0,
                morale: 95,
                health: 100,
                sleepDebt: 0,
              });
              tp.concern = null;
            }
            event(
              w,
              "directorEdit",
              person
                ? `[ศูนย์แก้ไข] ฟื้นฟูพลังงานและขวัญกำลังใจของ ${person.name} เต็ม 100%`
                : `[ศูนย์แก้ไข] ฟื้นฟูพลังงานและขวัญกำลังใจพนักงานทุกคนเต็ม 100%`,
              { action: "refreshPerson", personId: person ? person.id : null },
            );
            return { ok: true };
          }
          if (c.action === "trainSkill") {
            if (!person || !own(w.catalog.skills, c.skillId))
              return failure("invalidEdit", "ไม่พบพนักงานหรือทักษะ");
            person.skills[c.skillId] = H.learn(
              person.profile,
              person.skills[c.skillId],
              w.catalog.skills[c.skillId],
              600,
            );
            event(
              w,
              "directorEdit",
              `[ศูนย์แก้ไข] ฝึกอบรมทักษะ ${w.catalog.skills[c.skillId].nameTh} ให้ ${person.name}`,
              { action: "trainSkill", personId: person.id, skillId: c.skillId },
            );
            return { ok: true };
          }
          if (c.action === "renamePerson") {
            if (!person || typeof c.name !== "string" || !c.name.trim())
              return failure("invalidEdit", "ชื่อไม่ถูกต้อง");
            person.name = c.name.trim().slice(0, 32);
            ensurePersonExtensions(w, person);
            person.identity.nickname = person.name;
            person.identity.displayName = `${person.identity.fullName} (${person.name})`;
            return { ok: true };
          }
          if (c.action === "constructPlot") {
            const plotSpec = D.EXPANSION_PLOTS?.[c.plotId];
            if (!plotSpec) return failure("invalidEdit", "ไม่พบอาคารที่ระบุ");
            if (w.finance.cash < plotSpec.cost) {
              w.finance.openingCash += plotSpec.cost;
              w.finance.cash += plotSpec.cost;
            }
            return constructPlot(w, c.plotId, null, "[ศูนย์แก้ไข] ก่อสร้างอาคารขยายนิคม");
          }
          if (c.action === "scaleHeadcount") {
            if (!int(c.targetCount, 4, w.catalog.rules.maxPeople || 500))
              return failure("invalidEdit", "จำนวนพนักงานเป้าหมายไม่ถูกต้อง");
            return scaleCompany(w, c.targetCount, { freeGrant: true });
          }
          if (c.action === "setProductionRegime") {
            if (!D.PRODUCTION_REGIMES?.[c.regimeId])
              return failure("invalidEdit", "โหมดการผลิตไม่ถูกต้อง");
            if (!w.logistics) w.logistics = freshLogistics();
            w.logistics.productionRegime = c.regimeId;
            const reg = D.PRODUCTION_REGIMES[c.regimeId];
            event(
              w,
              "directorEdit",
              `[ศูนย์แก้ไข] เปลี่ยนโหมดการผลิตของโรงงานเป็น "${reg.nameTh}"`,
              { action: "setProductionRegime", regimeId: c.regimeId },
            );
            return { ok: true };
          }
          if (c.action === "promotePerson") {
            if (!person) return failure("invalidEdit", "ไม่พบพนักงาน");
            ensurePersonExtensions(w, person);
            const nextLv = Math.min(10, (person.career.level || 1) + 1);
            if (nextLv === person.career.level)
              return failure("invalidEdit", "พนักงานอยู่ระดับสูงสุด (Lv.10) แล้ว");
            const step = D.getCareerStep(person.role, nextLv);
            person.career.level = step.level;
            person.career.gradeCode = step.gradeCode || ("G" + step.level);
            person.career.titleTh = step.titleTh;
            person.career.badge = step.badge;
            person.career.dutyTh = step.dutyTh;
            person.career.promotions = (person.career.promotions || 0) + 1;
            person.career.lastPromotionDay = day(w);
            person.pay.dailyWage += step.wageBonus || 3500;
            person.pay.dayWage = person.pay.dailyWage;
            if (D.resolveOrgAssignment) {
              const orgUnit = D.resolveOrgAssignment(person.role, step.level, person.id, w.facilities?.constructedPlots || []);
              person.career.orgUnit = orgUnit;
              person.career.sectionTh = orgUnit.sectionNameTh;
              person.career.groupTh = orgUnit.groupNameTh;
              person.career.tierNameTh = orgUnit.tierNameTh;
              person.career.orgPathTh = orgUnit.orgPathTh;
            }
            event(
              w,
              "directorEdit",
              `[ศูนย์แก้ไข] เลื่อนตำแหน่ง ${person.name} ขึ้นเป็น "${step.titleTh}" (${step.badge})`,
              { action: "promotePerson", personId: person.id, level: step.level },
            );
            return { ok: true };
          }
          if (c.action === "acquireExternalAsset" || c.action === "upgradeExternalAsset") {
            return acquireExternalAsset(w, c.assetId, {
              upgrade: c.action === "upgradeExternalAsset" || Boolean(c.upgrade),
              freeGrant: Boolean(c.freeGrant),
            });
          }
          if (c.action === "setSupplyChainStrategy") {
            return command(w, { type: "setSupplyChainStrategy", strategyId: c.strategyId });
          }
          if (c.action === "toggleProductionChain") {
            return command(w, { type: "toggleProductionChain", chainId: c.chainId, enabled: c.enabled });
          }
          if (c.action === "runMidstreamRefining") {
            return runMidstreamRefining(w, {
              force: true,
              chainId: c.chainId || null,
              materialId: c.materialId || null,
              batches: c.batches || 2,
              ignoreTechGate: Boolean(c.ignoreTechGate),
            });
          }
          if (c.action === "craftMaterial") {
            return craftMaterialRecipe(w, c.materialId, c.batches || 1, {
              ignoreTechGate: Boolean(c.ignoreTechGate),
            });
          }
          if (c.action === "sellMaterialB2B") {
            return sellMaterialB2B(w, c.materialId, c.quantity || 2, c.buyerCorpId || null);
          }
          if (c.action === "setCorporationRelation") {
            return setCorporationRelation(w, c.corpId, c.mode);
          }
          if (c.action === "continueEndless") {
            return command(w, { type: "continueEndless" });
          }
          if (c.action === "maintainMachines") {
            return command(w, { type: "maintainMachines" });
          }
          if (c.action === "batchCraftAll") {
            return command(w, { type: "batchCraftAll", batches: c.batches || 2 });
          }
          if (c.action === "setCeoDirective") {
            return command(w, { type: "setCeoDirective", directiveId: c.directiveId });
          }
          return failure("invalidEdit", "ไม่รู้จักคำสั่งแก้ไข");
        }
        default:
          return failure("unknownCommand", "ไม่รู้จักคำสั่ง");
      }
    }
    function addSkill(w, spec) {
      const catalog = clone(w.catalog);
      D.registerSkill(catalog, spec);
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      const records = w.people.map((p) => H.createSkill(p.profile, spec));
      w.catalog = catalog;
      w.people.forEach((p, i) => {
        p.skills[spec.id] = records[i];
      });
      return spec.id;
    }
    function addRole(w, spec) {
      const catalog = clone(w.catalog);
      D.registerRole(catalog, spec);
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      w.catalog = catalog;
      return spec.id;
    }
    function addProduct(w, productSpec, materialSpecs = []) {
      const catalog = clone(w.catalog);
      if (!Array.isArray(materialSpecs))
        throw new TypeError("materialSpecs must be an array");
      for (const m of materialSpecs) D.registerMaterial(catalog, m);
      D.registerProduct(catalog, productSpec);
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      w.catalog = catalog;
      for (const m of materialSpecs) {
        const openQty = catalog.initialStock[m.id] || 0;
        w.inventory.materials[m.id] = openQty;
        w.inventory.opening[m.id] = openQty;
        w.inventory.reserved[m.id] = 0;
        w.inventory.purchased[m.id] = 0;
        w.inventory.consumed[m.id] = 0;
      }
      w.inventory.finished[productSpec.id] = 0;
      w.production.started[productSpec.id] = 0;
      w.production.completed[productSpec.id] = 0;
      w.production.scrapped[productSpec.id] = 0;
      w.production.shipped[productSpec.id] = 0;
      if (
        w.catalog.products[productSpec.id].researchRequired <=
          w.research.points &&
        !w.research.unlocked.includes(productSpec.id)
      )
        w.research.unlocked.push(productSpec.id);
      return productSpec.id;
    }
    function addTaskKind(w, spec) {
      const catalog = clone(w.catalog);
      D.registerTaskKind(catalog, spec);
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      w.catalog = catalog;
      return spec.id;
    }
    function enqueueTask(w, kind, fields = {}) {
      const custom = own(w.catalog.taskKinds, kind);
      if (!custom)
        throw new TypeError("only registered external tasks may be enqueued");
      if (
        !fields ||
        typeof fields !== "object" ||
        Array.isArray(fields) ||
        Object.keys(fields).some((k) => k !== "required") ||
        (fields.required !== undefined && !int(fields.required, 5, 1440)) ||
        !Object.values(w.layout.stations).some(
          (s) => s.kind === custom.stationKind,
        )
      )
        throw new TypeError("invalid task fields or unavailable station");
      return job(w, kind, fields);
    }
    function audit(w) {
      const errors = [
        ...E.auditFinance(w.finance),
        ...D.validateCatalog(w.catalog),
        ...L.validateLayout(w.layout),
      ];
      const reserved = Object.fromEntries(
          Object.keys(w.inventory.materials).map((k) => [k, 0]),
        ),
        finished = Object.fromEntries(
          Object.keys(w.catalog.products).map((k) => [k, 0]),
        ),
        inProcess = clone(finished);
      for (const u of Object.values(w.units)) {
        if (!w.orders[u.orderId] || !w.catalog.products[u.productId]) {
          errors.push("orphan unit");
          continue;
        }
        if (u.reserved)
          for (const [m, n] of Object.entries(
            w.catalog.products[u.productId].bom,
          ))
            reserved[m] += n;
        if (u.materialConsumed) inProcess[u.productId]++;
        if (u.stage === "ready") finished[u.productId]++;
      }
      for (const m of Object.keys(w.inventory.materials)) {
        const stock = w.inventory.materials[m];
        if (
          !int(stock) ||
          stock !==
            w.inventory.opening[m] +
              w.inventory.purchased[m] -
              w.inventory.consumed[m] ||
          reserved[m] !== w.inventory.reserved[m] ||
          reserved[m] > stock
        )
          errors.push("material conservation " + m);
        const consumed = Object.values(w.catalog.products).reduce(
          (n, p) => n + (p.bom[m] || 0) * w.production.started[p.id],
          0,
        );
        if (consumed !== w.inventory.consumed[m])
          errors.push("material allocation " + m);
        const received = Object.values(w.purchases)
          .filter((p) => p.materialId === m && p.status === "received")
          .reduce((n, p) => n + p.quantity, 0);
        if (received !== w.inventory.purchased[m])
          errors.push("purchase reconciliation " + m);
      }
      for (const p of Object.keys(finished))
        if (
          w.inventory.finished[p] !== finished[p] ||
          w.production.completed[p] !== w.production.shipped[p] + finished[p] ||
          w.production.started[p] !==
            w.production.shipped[p] + w.production.scrapped[p] + inProcess[p]
        )
          errors.push("product conservation " + p);
      const personIds = new Set();
      for (const p of w.people) {
        if (personIds.has(p.id) || p.profile.id !== p.id)
          errors.push("duplicate/invalid person");
        personIds.add(p.id);
        errors.push(
          ...H.validateProfile(p.profile).map((e) => p.id + ": " + e),
        );
        if (
          p.taskId &&
          (!w.jobs[p.taskId] || w.jobs[p.taskId].assignee !== p.id)
        )
          errors.push("person task mismatch");
        for (const v of Object.values(p.state))
          if (!Number.isFinite(v) || v < 0 || v > 100)
            errors.push("invalid vital state");
        if (
          p.pay.totalEarned !== p.pay.totalPaid + p.pay.dueBase + p.pay.dueOT ||
          p.pay.wallet + p.pay.outsideSpending !== p.pay.totalPaid
        )
          errors.push("payroll reconciliation");
        for (const [k, s] of Object.entries(p.skills))
          if (
            !w.catalog.skills[k] ||
            !Number.isFinite(s.level) ||
            s.level < 0 ||
            s.level > H.skillCap(p.profile, w.catalog.skills[k]) ||
            !Number.isFinite(s.xp) ||
            s.xp < 0 ||
            s.xp > Number.MAX_SAFE_INTEGER ||
            !Number.isFinite(s.totalXp) ||
            s.totalXp < 0 ||
            s.totalXp > Number.MAX_SAFE_INTEGER
          )
            errors.push("invalid skill");
      }
      for (const s of Object.values(w.layout.stations)) {
        const activeWorkers = w.people.filter(
          (p) => p.employed && p.taskId && p.stationId === s.id,
        ).length;
        if (activeWorkers > s.capacity)
          errors.push("station capacity exceeded " + s.id);
      }
      const materialCosts = Object.values(w.purchases).reduce(
        (n, p) => n + p.cost,
        0,
      );
      if (materialCosts !== -w.finance.totals.materials)
        errors.push("purchase cash reconciliation");
      for (const invoice of Object.values(w.invoices)) {
        const receipts = w.finance.entries.filter(
          (t) => t.kind === "sales" && t.reference === invoice.id,
        );
        if (
          invoice.status === "paid"
            ? receipts.length !== 1 || receipts[0].delta !== invoice.amount
            : receipts.length !== 0
        )
          errors.push("invoice cash reconciliation");
      }
      const paid = w.people.reduce((n, p) => n + p.pay.totalPaid, 0);
      if (paid !== -w.finance.totals.wages - w.finance.totals.overtime)
        errors.push("wage cash reconciliation");
      for (const j of Object.values(w.jobs))
        if (
          (j.assignee &&
            !w.people.some(
              (p) => p.id === j.assignee && p.taskId === j.id && p.employed,
            )) ||
          (j.unitId && !w.units[j.unitId]) ||
          (j.orderId && !w.orders[j.orderId]) ||
          (j.purchaseId && !w.purchases[j.purchaseId]) ||
          !Number.isFinite(j.progress) ||
          j.progress < 0 ||
          j.progress > j.required
        )
          errors.push("invalid job reference/progress");
      return errors;
    }
    return Object.freeze({
      VERSION,
      RELEASE_VERSION,
      SCHEMA,
      TICK,
      FACILITY_RULES,
      create,
      step,
      advance,
      command,
      applyCommand: command,
      acceptOffer: (w, offerId) => command(w, { type: "acceptOffer", offerId }),
      candidates,
      evaluateAutonomousHiring,
      evaluatePromotions,
      evaluateBonuses,
      evaluateMachineMaintenance,
      evaluateSalesNegotiation,
      constructPlot,
      evaluatePlotConstruction,
      acquireExternalAsset,
      runMidstreamRefining,
      craftMaterialRecipe,
      sellMaterialB2B,
      setCorporationRelation,
      simulateOffsiteEcosystemDaily,
      evaluateExternalAssetsDaily,
      getActiveExternalAssetBonuses,
      scaleCompany,
      updateExternalWorld,
      getDepartmentHeadroom,
      findSupervisorForRole,
      addSkill,
      addRole,
      addProduct,
      addTaskKind,
      enqueueTask,
      audit,
    });
  },
);
