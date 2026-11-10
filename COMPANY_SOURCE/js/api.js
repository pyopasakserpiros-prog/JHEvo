(function (root, factory) {
  "use strict";
  const node = typeof module === "object" && module.exports;
  const value = factory(
    node ? require("./human-core.js") : root.CompanyCore,
    node ? require("./sim.js") : root.CompanySim,
    node ? require("./save.js") : root.CompanySave,
    node ? require("./layout.js") : root.CompanyLayout,
    node ? require("./data.js") : root.CompanyData,
  );
  if (node) module.exports = value;
  else root.CompanyAPI = value;
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function (H, S, Save, L, D) {
    "use strict";
    const clone = (o) => JSON.parse(JSON.stringify(o)),
      freeze = (o) => {
        if (o && typeof o === "object" && !Object.isFrozen(o)) {
          Object.values(o).forEach(freeze);
          Object.freeze(o);
        }
        return o;
      };
    const labels = {
      humility: "ความถ่อมตน",
      optimism: "แนวโน้มมองอนาคตในทางบวก",
      care: "ความเอื้ออาทร",
      stewardship: "ความรับผิดชอบต่อสิ่งมีชีวิตและส่วนรวม",
      influence: "อำนาจในการกำหนดทิศทาง",
      tradition: "ความผูกพันกับธรรมเนียม",
      variety: "ความหลากหลายของประสบการณ์",
      craftsmanship: "คุณค่าของฝีมือและความประณีต",
      numerical: "การเข้าใจตัวเลข",
      verbal: "การเข้าใจภาษา",
      attention: "การกำกับและแบ่งความสนใจ",
      problemSensitivity: "การสังเกตความผิดปกติ",
      perceptualSpeed: "การจำแนกแบบแผนอย่างรวดเร็ว",
      reactionSpeed: "การตอบสนองต่อสัญญาณ",
      controlPrecision: "การควบคุมเครื่องจักรอย่างแม่นยำ",
      coordination: "การประสานการเคลื่อนไหว",
      balance: "การทรงตัว",
      flexibility: "ความยืดหยุ่นทางกาย",
      visualAcuity: "การเห็นรายละเอียด",
      colorDiscrimination: "การแยกเฉดสี",
      hearing: "การจำแนกเสียง",
      speechClarity: "ความชัดเจนในการออกเสียง",
      tasteSmell: "การจำแนกรสและกลิ่น",
      uncertaintyReasoning: "การให้เหตุผลเมื่อข้อมูลไม่แน่นอน",
      sociability: "การเข้าสังคม",
      conscientiousness: "ความรับผิดชอบ",
      agreeableness: "การร่วมมือ",
      openness: "ความเปิดรับ",
      riskTaking: "ความกล้าเสี่ยง",
      stressReactivity: "ความไวต่อความเครียด",
      assertiveness: "ความกล้าแสดงออก",
      patience: "ความอดทนรอ",
      integrity: "ความซื่อตรง",
      adaptability: "ความยืดหยุ่นปรับตัว",
      ambition: "แรงผลักดันถีบตัว",
      prudence: "ความรอบคอบก่อนลงมือ",
      security: "ความมั่นคง",
      income: "รายได้",
      autonomy: "อิสระ",
      fairness: "ความเป็นธรรม",
      belonging: "ความเป็นส่วนหนึ่ง",
      learning: "การเรียนรู้",
      achievement: "ความสำเร็จ",
      meaning: "ความหมาย",
      workLifeBalance: "สมดุลชีวิต",
      recognition: "การยอมรับและเกียรติภูมิ",
      family: "ความรักและครอบครัว",
      comfort: "คุณภาพชีวิตและทรัพย์สิน",
      analytical: "การวิเคราะห์",
      creativity: "ความคิดสร้างสรรค์",
      communication: "การสื่อสาร",
      organization: "การจัดระบบ",
      precision: "ความละเอียดแม่นยำ",
      dexterity: "ความคล่องมือ",
      learningSpeed: "การเรียนรู้เร็ว",
      stamina: "ความอึดทน",
      memory: "ความจำ",
      emotionalInsight: "การเข้าใจอารมณ์",
      spatial: "มิติสัมพันธ์และโครงสร้าง",
      strength: "พละกำลังกาย",
      composure: "ความนิ่งในวิกฤต",
      sensory: "ประสาทสัมผัสและสุนทรียะ",
    };
    const CAMPUS_BUILDINGS = [
      {
        id: "hq",
        nameTh: "อาคารสำนักงานใหญ่",
        shortNameTh: "สำนักงานใหญ่ (HQ)",
        subtitleTh: "ฝ่ายบริหาร • ฝ่ายขาย • บัญชีและธุรการ",
        icon: "🏢",
        indoor: true,
        stationKinds: ["sales", "admin", "manager"],
        stationIds: ["sales", "admin", "manager"],
        doorCell: { x: 6, y: 7 },
        footprint: { x: 2, y: 2, width: 8, height: 6 },
      },
      {
        id: "rnd",
        nameTh: "อาคารวิจัยและนวัตกรรม",
        shortNameTh: "แล็บวิจัย (R&D)",
        subtitleTh: "วิจัยผลิตภัณฑ์ใหม่ • พัฒนาต้นแบบ",
        icon: "🔬",
        indoor: true,
        stationKinds: ["research"],
        stationIds: ["research"],
        doorCell: { x: 14, y: 7 },
        footprint: { x: 13, y: 2, width: 4, height: 5 },
      },
      {
        id: "factory",
        nameTh: "อาคารโรงงานผลิต",
        shortNameTh: "โรงงานผลิต (Factory)",
        subtitleTh: "สายพานประกอบ • ตรวจสอบคุณภาพ QC • ซ่อมบำรุง",
        icon: "🏭",
        indoor: true,
        stationKinds: ["assembly", "quality"],
        stationIds: [
          "assembly1",
          "assembly2",
          "assembly3",
          "quality1",
          "quality2",
        ],
        doorCell: { x: 25, y: 11 },
        footprint: { x: 21, y: 2, width: 12, height: 9 },
      },
      {
        id: "warehouse",
        nameTh: "คลังสินค้าและจุดขนส่ง",
        shortNameTh: "คลังสินค้า (Warehouse)",
        subtitleTh: "สต็อกวัตถุดิบ • แพ็กกล่อง • ท่าเทียบรถบรรทุก",
        icon: "📦",
        indoor: true,
        stationKinds: ["packing", "stock", "finished", "receiving", "shipping"],
        stationIds: ["packing", "stock", "finished", "receiving", "shipping"],
        doorCell: { x: 26, y: 20 },
        footprint: { x: 21, y: 15, width: 11, height: 6 },
      },
      {
        id: "canteen",
        nameTh: "โรงอาหารพนักงาน",
        shortNameTh: "โรงอาหาร (Canteen)",
        subtitleTh: "มื้อกลางวัน • มุมกาแฟ • พูดคุยสังสรรค์",
        icon: "🍴",
        indoor: true,
        stationKinds: ["meal", "pantry"],
        stationIds: ["meal", "pantry"],
        doorCell: { x: 14, y: 18 },
        footprint: { x: 12, y: 14, width: 5, height: 5 },
      },
      {
        id: "courtyard",
        nameTh: "สวนหย่อมและจุดพักผ่อน",
        shortNameTh: "สวนหย่อม (Courtyard)",
        subtitleTh: "สูดอากาศกลางแจ้ง • ลดความเครียด • จุดพักสูบบุหรี่",
        icon: "🌳",
        indoor: false,
        stationKinds: ["lounge"],
        stationIds: ["lounge"],
        doorCell: { x: 6, y: 14 },
        footprint: { x: 4, y: 11, width: 5, height: 5 },
      },
      {
        id: "training",
        nameTh: "ศูนย์ฝึกอบรมพนักงาน",
        shortNameTh: "ศูนย์ฝึกอบรม",
        subtitleTh: "พนักงานใช้เวลาว่างฝึกทักษะของตน",
        icon: "📚",
        indoor: true,
        stationKinds: ["training"],
        stationIds: ["training"],
        doorCell: { x: 35, y: 17 },
        footprint: { x: 34, y: 12, width: 5, height: 6 },
      },
      {
        id: "gate",
        nameTh: "ประตูรั้วใหญ่และป้อมยาม",
        shortNameTh: "ประตูใหญ่ (Main Gate)",
        subtitleTh: "ทางเข้า-ออกหลักของนิคม • จุดสแกนเข้างาน",
        icon: "🚧",
        indoor: false,
        stationKinds: [],
        stationIds: [],
        doorCell: { x: 2, y: 23 },
        footprint: { x: 1, y: 21, width: 4, height: 3 },
      },
    ];
    function resolveStationBuildingId(station) {
      if (!station) return null;
      for (const b of CAMPUS_BUILDINGS) {
        if (
          b.stationIds.includes(station.id) ||
          b.stationKinds.includes(station.kind)
        )
          return b.id;
      }
      return station.access && station.access.x >= 16 ? "factory" : "hq";
    }
    function resolvePersonBuildingId(w, p) {
      if (!p.employed || !p.atWork) return "gate";
      const station = p.stationId ? w.layout.stations[p.stationId] : null;
      if (station) {
        const bid = resolveStationBuildingId(station);
        if (bid) return bid;
      }
      if (p.activity === "eating") return "canteen";
      if (p.activity === "socialising") return "canteen";
      if (p.activity === "resting") return "courtyard";
      if (p.role === "engineer") return "rnd";
      if (["assembler", "inspector"].includes(p.role)) return "factory";
      if (p.role === "logistics") return "warehouse";
      return "hq";
    }
    function resolveActivityEmoji(p) {
      if (!p.employed) return "👋";
      if (!p.atWork) return p.activity === "sleeping" ? "💤" : "🏠";
      if (p.state.stress >= 78) return "💢";
      if (p.activity === "eating") return "🍚";
      if (p.activity === "socialising") return "💬";
      if (p.activity === "resting") return "☕";
      if (p.activity === "helping") return "🤝";
      if (p.activity === "walking") {
        if (p.intent?.code === "lunchBreak" || p.intent?.code === "hungry")
          return "🍚";
        if (p.intent?.code === "needsRecovery") return "☕";
        if (p.intent?.code === "needsConnection") return "💬";
        return "🚶";
      }
      const code = p.intent?.code || "";
      if (code.includes("sales")) return "💰";
      if (code.includes("purchase") || code.includes("invoice")) return "📋";
      if (code.includes("research") || code === "selfStudy") return "💻";
      if (code.includes("assembly") || code.includes("rework")) return "🔧";
      if (code.includes("qa")) return "🔍";
      if (code.includes("packing") || code.includes("shipping")) return "📦";
      if (p.activity === "blocked") return "⚠️";
      return "💼";
    }
    function resolveActivityLabelTh(p) {
      if (!p.employed) return "ลาออกจากบริษัทแล้ว";
      if (!p.atWork)
        return p.activity === "sleeping"
          ? "นอนพักผ่อนที่บ้าน"
          : "เลิกงาน / พักผ่อนนอกเวลา";
      const code = p.intent?.code || "";
      if (p.activity === "walking") {
        if (code === "lunchBreak" || code === "hungry")
          return "กำลังเดินไปโรงอาหารพนักงาน";
        if (code === "needsRecovery") return "กำลังเดินไปสวนหย่อมเพื่อพักสมอง";
        if (code === "needsConnection") return "กำลังเดินไปมุมกาแฟพูดคุยกับเพื่อน";
        return "กำลังเดินสัญจรระหว่างอาคาร";
      }
      if (p.activity === "eating") return "กำลังรับประทานอาหารที่โรงอาหาร";
      if (p.activity === "socialising") return "กำลังจิบกาแฟและพูดคุยแลกเปลี่ยน";
      if (p.activity === "resting") return "กำลังพักสูดอากาศลดความเครียดที่สวนหย่อม";
      if (p.activity === "helping") return "กำลังช่วยเพื่อนร่วมงานเร่งงานด่วน";
      if (code === "selfStudy") return "กำลังศึกษาพัฒนาทักษะในสายงานตัวเอง";
      if (code === "waitingForWorkOrMaterials")
        return "รอวัตถุดิบจากคลังเพื่อเริ่มผลิต";
      if (code === "noProductionOrder") return "รอออเดอร์ใหม่จากฝ่ายขาย";
      const jobMap = {
        sales: "กำลังเจรจาหาลูกค้าและประเมินข้อเสนอ",
        purchase: "กำลังออกใบสั่งซื้อวัตถุดิบ (PO)",
        invoice: "กำลังวางบิลและออกใบแจ้งหนี้ลูกค้า",
        research: "กำลังวิจัยพัฒนาแบบแปลนสินค้าใหม่",
        assembly: "กำลังประกอบแผงวงจรและชิ้นงาน",
        rework: "กำลังซ่อมแซมชิ้นงานที่ไม่ผ่าน QC",
        qa: "กำลังส่องตรวจคุณภาพชิ้นงาน (QC)",
        packing: "กำลังแพ็กสินค้าลงกล่องพร้อมส่ง",
        shipping: "กำลังขนสินค้าขึ้นรถส่งมอบลูกค้า",
      };
      return jobMap[code] || "กำลังปฏิบัติงานในอาคาร";
    }
    function buildThoughts(w, p, affect, aspirations) {
      const list = [];
      const actTh = resolveActivityLabelTh(p);
      list.push(`ตอนนี้: ${actTh}`);
      if (p.decision && Array.isArray(p.decision.motives) && p.decision.motives.length) {
        const top = [...p.decision.motives]
          .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
          .slice(0, 2)
          .map((m) => labels[m.factor] || m.factor)
          .join(", ");
        list.push(`แรงจูงใจในการตัดสินใจ: ให้ความสำคัญกับ ${top}`);
      }
      if (p.state.stress >= 75)
        list.push("รู้สึกกดดันและเครียดสะสม อยากออกมาสูดอากาศที่สวนหย่อมสักพัก");
      else if (p.state.hunger >= 60)
        list.push("เริ่มหิวแล้ว รอเวลาไปกินข้าวเติมพลังที่โรงอาหารพนักงาน");
      else if (p.state.energy <= 32)
        list.push("ร่างกายเริ่มอ่อนล้า อยากพักจิบกาแฟหรือกลับบ้านไปนอน");
      else if (p.state.morale >= 70)
        list.push("ขวัญกำลังใจดีเยี่ยม พร้อมลุยงานช่วยบริษัทให้รอดพ้นวิกฤต");
      if (p.ot && p.ot.day === Math.floor(w.clock.absoluteMinute / 1440) + 1 && p.ot.decision !== "none") {
        const otMap = {
          accept: "ยินดีอยู่ช่วยทำ OT เต็มเวลาเพื่อเร่งงานบริษัท",
          negotiate: "รับทำ OT บางส่วนเพราะต้องเผื่อเวลาพักผ่อน",
          decline: "วันนี้ขอปฏิเสธ OT เพราะร่างกายและภาระทางบ้านไม่เอื้ออำนวย",
        };
        if (otMap[p.ot.decision]) list.push(otMap[p.ot.decision]);
      }
      if (p.concern) {
        list.push(
          `ข้อกังวลในใจ: กังวลเรื่องภาระงาน/ค่าตอบแทน (${p.concern.reasons.join(", ")})`,
        );
      }
      if (aspirations && aspirations.primaryGoal) {
        const goalNames = {
          emergencyFund: "เก็บเงินสำรองฉุกเฉิน",
          familySupport: "ดูแลครอบครัวให้มั่นคง",
          buyVehicle: "เก็บเงินซื้อรถของตัวเอง",
          buyHome: "เก็บเงินดาวน์บ้านในฝัน",
          masterCraft: "ก้าวเป็นช่างและผู้เชี่ยวชาญแถวหน้า",
          careerLead: "ก้าวหน้าขึ้นเป็นหัวหน้าสายงาน",
        };
        list.push(
          `เป้าหมายชีวิต: ${goalNames[aspirations.primaryGoal] || aspirations.primaryGoal} (สะสมแล้ว ${Math.round((aspirations.progressRatio || 0) * 100)}%)`,
        );
      }
      return list;
    }

    // JS2-inspired Living Chronicle Presenter (pure read-only transformation)
    function presentChronicleEntry(w, e) {
      const d = Math.floor(e.at / 1440) + 1;
      const minuteOfDay = e.at % 1440;
      const code = e.code || "info";
      let epistemicStatus = "VERIFIED";
      let epistemicBadgeTh = "📜 บันทึกทางการ";
      let category = "FINANCE";
      let categoryLabelTh = "บริหาร/การเงิน";
      let isMajor = false;
      let meaningTh = "บันทึกการดำเนินงานตามระบบบัญชีและสายการผลิตของนิคม";

      if (["orderAccepted", "orderShipped", "paymentReceived"].includes(code)) {
        category = code === "paymentReceived" ? "FINANCE" : "SALES";
        categoryLabelTh = code === "paymentReceived" ? "การเงิน" : "ฝ่ายขาย/ลูกค้า";
        isMajor = true;
        meaningTh =
          code === "orderAccepted"
            ? "ฝ่ายขายรับเงินมัดจำ 30% เข้าบัญชีและสร้างใบงานผลิตเข้าโรงงานทันที"
            : code === "orderShipped"
              ? "ส่งมอบสินค้าครบตามจำนวน ฝ่ายบัญชีออกใบแจ้งหนี้ (Invoice) รอรับชำระส่วนที่เหลือ"
              : "เงินสดจากลูกค้าโอนเข้าบัญชีบริษัท ช่วยยืด Runway และสภาพคล่อง";
      } else if (["purchaseOrdered", "materialsReceived"].includes(code)) {
        category = "SUPPLY";
        categoryLabelTh = "คลัง/จัดซื้อ";
        meaningTh =
          code === "purchaseOrdered"
            ? "ตัดเงินสดซื้อวัตถุดิบและรอฝ่ายธุรการออกใบ PO ก่อนเริ่มนับเวลาขนส่ง (Lead Time)"
            : "รถบรรทุกส่งวัตถุดิบเข้าคลังเรียบร้อย ช่างประกอบสามารถเบิกไปผลิตต่อได้ทันที";
      } else if (["reworkNeeded", "unitScrapped"].includes(code)) {
        category = "PROD";
        categoryLabelTh = "โรงงาน/QC";
        epistemicStatus = "OBSERVED";
        epistemicBadgeTh = "👁️ รายงานหน้างาน";
        isMajor = code === "unitScrapped";
        meaningTh =
          code === "reworkNeeded"
            ? "ผู้ตรวจ QC พบจุดบกพร่องจากความล้า/ความเครียด ส่งกลับให้ช่างซ่อมแซม (ใช้เวลา 40%)"
            : "ชิ้นงานซ่อมไม่ผ่านเกินโควตา ต้องตัดเป็นของเสียและเสียต้นทุนวัตถุดิบไป";
      } else if (code === "productUnlocked") {
        category = "RND";
        categoryLabelTh = "วิจัย R&D";
        isMajor = true;
        meaningTh =
          "วิศวกรสะสมแต้มวิจัยครบเกณฑ์ ปลดล็อกสินค้าใหม่ที่มีอัตรากำไรต่อชิ้นสูงขึ้น";
      } else if (["employeeConcern", "employeeLeft", "overtimeResponse", "employeeHired"].includes(code)) {
        category = "HR_CULTURE";
        categoryLabelTh = "บุคลากร/ชีวิต";
        isMajor = code === "employeeLeft" || code === "employeeHired";
        if (code === "employeeConcern" || code === "overtimeResponse") {
          epistemicStatus = code === "employeeConcern" ? "RUMOR" : "OBSERVED";
          epistemicBadgeTh =
            code === "employeeConcern" ? "☕ เสียงสะท้อนพนักงาน" : "👁️ บันทึกกะทำงาน";
        }
        meaningTh =
          code === "employeeConcern"
            ? "พนักงานเริ่มสะสมความเครียดหรือกังวลเรื่องค่าตอบแทน หากปล่อยไว้นานอาจตัดสินใจลาออก"
            : code === "employeeLeft"
              ? "พนักงานลาออกจากบริษัท ทำให้กำลังการผลิตลดลง"
              : code === "employeeHired"
                ? "ฝ่ายบุคคลรับพนักงานใหม่เข้าสู่ทีมเพื่อรองรับปริมาณงาน"
                : "การตัดสินใจทำ OT มาจากพลังงาน ภาระทางบ้าน และค่านิยมของพนักงานแต่ละคน";
      }

      const actorObj =
        (e.details?.personId && w.people.find((p) => p.id === e.details.personId)) ||
        w.people.find((p) => e.message && e.message.includes(p.name)) ||
        null;
      const actorId = actorObj ? actorObj.id : null;
      const actorName = actorObj ? actorObj.name : null;
      const storyThreadId =
        e.details?.orderId || e.details?.purchaseId || actorId || null;

      return {
        ...e,
        day: d,
        minuteOfDay,
        epistemic: epistemicStatus,
        epistemicStatus,
        epistemicLabelTh: epistemicBadgeTh,
        epistemicBadgeTh,
        category,
        categoryLabelTh,
        major: isMajor,
        isMajor,
        actorId,
        actorName,
        storyThreadId,
        meaningTh,
      };
    }

    // JS2-inspired Periodic Company Digest (1 / 7 / 30 days separated into 4 clean accounts)
    function computePeriodDigest(w, periodDays, burn) {
      const cutoff = Math.max(0, w.clock.absoluteMinute - periodDays * 1440);
      const entries = w.finance.entries.filter((e) => e.at >= cutoff);
      const sumKind = (k) =>
        entries.filter((e) => e.kind === k).reduce((s, e) => s + e.delta, 0);

      const salesIn = sumKind("sales");
      const materialsOut = Math.abs(sumKind("materials"));
      const wagesOut = Math.abs(sumKind("wages") + sumKind("overtime") + sumKind("welfare"));
      const fixedOut = Math.abs(sumKind("rent") + sumKind("interest"));
      const netOperating = salesIn - materialsOut - wagesOut - fixedOut;

      const recentTasks = w.history.tasks.filter((t) => t.at >= cutoff);
      const recentEvents = w.events.filter((e) => e.at >= cutoff);
      const employed = w.people.filter((p) => p.employed);
      const avgEnergy = employed.length
        ? Math.round(employed.reduce((s, p) => s + p.state.energy, 0) / employed.length)
        : 0;
      const avgMorale = employed.length
        ? Math.round(employed.reduce((s, p) => s + p.state.morale, 0) / employed.length)
        : 0;
      const avgStress = employed.length
        ? Math.round(employed.reduce((s, p) => s + p.state.stress, 0) / employed.length)
        : 0;

      const totalRawUnits = Object.values(w.inventory.materials || {}).reduce((a, n) => a + n, 0);
      const totalFinishedUnits = Object.values(w.inventory.finished || {}).reduce((a, n) => a + n, 0);

      return {
        days: periodDays,
        periodDays,
        labelTh: `รอบ ${periodDays} วันล่าสุด`,
        cashflow: {
          revenue: salesIn,
          materials: materialsOut,
          payrollAndWelfare: wagesOut,
          overhead: fixedOut,
          netOperating,
          endingCash: w.finance.cash,
          endingDebt: w.finance.debt,
        },
        operations: {
          dealsAccepted: recentEvents.filter((e) => e.code === "orderAccepted").length,
          ordersDelivered: recentEvents.filter((e) => e.code === "orderShipped").length,
          qcPassed: recentTasks.filter((t) => t.kind === "qa").length,
          qcRework: recentEvents.filter((e) => e.code === "reworkNeeded").length,
          activeJobs: Object.keys(w.jobs).length,
        },
        inventory: {
          poIssued: recentEvents.filter((e) => e.code === "purchaseOrdered").length,
          deliveriesReceived: recentEvents.filter((e) => e.code === "materialsReceived").length,
          totalRawUnits,
          totalFinishedUnits,
        },
        people: {
          headcount: employed.length,
          hiresInPeriod: recentEvents.filter((e) => e.code === "employeeHired").length,
          avgStress,
          avgMorale,
          avgEnergy,
          researchPoints: Math.round(w.research.points),
        },
        account1_position: {
          cash: w.finance.cash,
          debt: w.finance.debt,
          runwayDays: burn ? Math.floor((w.finance.cash / burn) * 10) / 10 : null,
          reputation: w.reputation,
        },
        account2_cashflow: {
          salesIn,
          materialsOut,
          wagesOut,
          fixedOut,
          netOperating,
        },
        account3_production: {
          tasksCompleted: recentTasks.length,
          assemblyCount: recentTasks.filter((t) => t.kind === "assembly").length,
          qaCount: recentTasks.filter((t) => t.kind === "qa").length,
          shippedOrders: recentTasks.filter((t) => t.kind === "shipping").length,
          totalShippedUnits: Object.values(w.production.shipped || {}).reduce((a, n) => a + n, 0),
          totalScrappedUnits: Object.values(w.production.scrapped || {}).reduce((a, n) => a + n, 0),
        },
        account4_people: {
          employedCount: employed.length,
          avgEnergy,
          avgMorale,
          avgStress,
          concernCount: employed.filter((p) => p.concern).length,
        },
      };
    }

    function compareEmployees(personA, personB) {
      if (!personA || !personB) return null;
      const inter = H.evaluateInteraction(
        personA.profile,
        personA.state,
        personB.profile,
        personB.state,
        {
          mode: "help",
          existingTrust: personA.relationships?.[personB.id]?.trust || 0,
        },
      );
      const skillSpecs = D && D.SKILLS ? D.SKILLS : Object.values(D.createCatalog().skills);
      const skills = skillSpecs.map((s) => {
        const a = Math.round(personA.skills?.[s.id]?.level || 0);
        const b = Math.round(personB.skills?.[s.id]?.level || 0);
        return { id: s.id, nameTh: s.nameTh, a, b, delta: a - b };
      });
      const vitalDefs = [
        ["energy", "พลังงานกาย"],
        ["focus", "สมาธิจดจ่อ"],
        ["morale", "ขวัญกำลังใจ"],
        ["stress", "ความเครียด"],
        ["burnout", "ภาวะหมดไฟ"],
        ["fulfillment", "ความอิ่มเอมใจ"],
      ];
      const vitality = vitalDefs.map(([k, nameTh]) => {
        const a = Math.round(personA.state?.[k] || 0);
        const b = Math.round(personB.state?.[k] || 0);
        return { id: k, nameTh, a, b, delta: a - b };
      });
      const personality = H.PERSONALITY.map((k) => {
        const a = Math.round(personA.profile?.personality?.[k] || 0);
        const b = Math.round(personB.profile?.personality?.[k] || 0);
        return { id: k, nameTh: labels[k] || k, a, b, delta: a - b };
      });
      const values = H.VALUES.map((k) => {
        const a = Math.round(personA.profile?.values?.[k] || 0);
        const b = Math.round(personB.profile?.values?.[k] || 0);
        return { id: k, nameTh: labels[k] || k, a, b, delta: a - b };
      });
      const aptitudes = H.APTITUDES.map((k) => {
        const a = Math.round(personA.profile?.aptitudes?.[k] || 0);
        const b = Math.round(personB.profile?.aptitudes?.[k] || 0);
        return { id: k, nameTh: labels[k] || k, a, b, delta: a - b };
      });
      return {
        compatibility: inter.compatibility,
        collaborationMultiplier: inter.collaborationMultiplier,
        trustAB: personA.relationships?.[personB.id]?.trust || 0,
        familiarityAB: personA.relationships?.[personB.id]?.familiarity || 0,
        skills,
        vitality,
        personality,
        values,
        aptitudes,
      };
    }

    function view(w) {
      const day = Math.floor(w.clock.absoluteMinute / 1440) + 1,
        minute = w.clock.absoluteMinute % 1440,
        employed = w.people.filter((p) => p.employed),
        burn =
          w.catalog.rules.rentDaily +
          Math.round(w.finance.debt * w.catalog.rules.interestDaily) +
          employed.reduce((n, p) => n + p.pay.dailyWage, 0) +
          w.policies.wellbeingDaily * employed.length;
      const people = w.people.map((p) => {
        const unpaidDays =
            p.pay.overdueSince === null
              ? 0
              : Math.max(1, day - p.pay.overdueSince),
          affect = H.deriveAffect(p.profile, p.state, { unpaidDays }),
          aspirations = H.deriveAspirations(p.profile, p.state, {
            wallet: p.pay.wallet,
            goalSpecs: w.catalog.lifeGoals,
          }),
          buildingId = resolvePersonBuildingId(w, p),
          buildingSpec = CAMPUS_BUILDINGS.find((b) => b.id === buildingId),
          isIndoors = Boolean(
            p.employed &&
              p.atWork &&
              p.path.length === 0 &&
              buildingSpec &&
              buildingSpec.indoor,
          ),
          recentThoughts = buildThoughts(w, p, affect, aspirations);
        return {
          id: p.id,
          name: p.name,
          role: p.role,
          roleName: w.catalog.roles[p.role].nameTh,
          employed: p.employed,
          atWork: p.atWork,
          profile: p.profile,
          state: p.state,
          affect,
          aspirations,
          skills: p.skills,
          experience: p.experience,
          relationships: p.relationships,
          concern: p.concern,
          pay: p.pay,
          activity: p.activity,
          activityLabelTh: resolveActivityLabelTh(p),
          emoji: resolveActivityEmoji(p),
          thoughtTh: recentThoughts[0] || "",
          recentThoughts,
          intent: p.intent,
          decision: p.decision || null,
          ot: p.ot,
          taskId: p.taskId,
          stationId: p.stationId,
          buildingId,
          isIndoors,
          position: p.position,
          previousPosition: p.previousPosition,
          path: p.path,
          zoneId: L.zoneAt(w.layout, p.position),
          visible: p.employed && p.atWork,
          visual: p.visual,
        };
      });
      const jobs = Object.values(w.jobs).map((j) => {
        let blockedReason = null;
        if (!j.assignee) {
          const u = w.units[j.unitId];
          if (
            u &&
            !u.materialConsumed &&
            !u.reserved &&
            Object.entries(w.catalog.products[u.productId].bom).some(
              ([m, n]) =>
                w.inventory.materials[m] - w.inventory.reserved[m] < n,
            )
          )
            blockedReason = "materials";
          else if (
            !Object.values(w.layout.stations).some(
              (s) =>
                s.kind === j.stationKind &&
                w.people.filter(
                  (p) => p.employed && p.taskId && p.stationId === s.id,
                ).length < s.capacity,
            )
          )
            blockedReason = "stationCapacity";
        }
        return { ...j, fraction: j.progress / j.required, blockedReason };
      });
      const units = Object.values(w.units).map((u) => {
        const job = Object.values(w.jobs).find((j) => j.unitId === u.id),
          person = job && w.people.find((p) => p.id === job.assignee);
        return {
          ...u,
          stationId: person?.stationId || null,
          storageStationId:
            u.stage === "ready"
              ? "finished"
              : !u.materialConsumed
                ? "stock"
                : null,
        };
      });
      const buildings = CAMPUS_BUILDINGS.map((b) => {
        const occupants = people.filter(
          (p) => p.employed && p.atWork && p.buildingId === b.id,
        );
        const indoorWorkers = occupants.filter((p) => p.isIndoors);
        const activeJobs = jobs.filter(
          (j) =>
            b.stationKinds.includes(j.stationKind) ||
            occupants.some((p) => p.taskId === j.id),
        );
        return {
          ...b,
          level: w.facilities?.levels?.[b.id] || 1,
          occupantIds: occupants.map((p) => p.id),
          indoorCount: indoorWorkers.length,
          totalAssignedCount: occupants.length,
          activeJobCount: activeJobs.length,
          lightsOn:
            occupants.length > 0 &&
            (minute >= 1020 || minute < 390 || activeJobs.some((j) => j.assignee)),
        };
      });
      const rawEvents = [...w.events].slice(-45).reverse();
      const chronicle = rawEvents.map((e) => presentChronicleEntry(w, e));
      const digests = {
        d1: computePeriodDigest(w, 1, burn),
        d7: computePeriodDigest(w, 7, burn),
        d30: computePeriodDigest(w, 30, burn),
      };
      return freeze(
        clone({
          apiVersion: "1.0.0",
          gameVersion: S.VERSION,
          core: {
            version: H.VERSION,
            status: "locked",
            personalityDimensions: H.PERSONALITY.length,
            valueDimensions: H.VALUES.length,
            aptitudeDimensions: H.APTITUDES.length,
          },
          time: {
            absoluteMinute: w.clock.absoluteMinute,
            day,
            minute,
            tick: w.clock.tick,
            hour: Math.floor(minute / 60),
            minuteOfHour: minute % 60,
          },
          seed: w.seed,
          status: w.status,
          outcome: w.outcome,
          company: {
            cash: w.finance.cash,
            debt: w.finance.debt,
            reputation: w.reputation,
            dailyBurnEstimate: burn,
            runwayDays: burn
              ? Math.floor((w.finance.cash / burn) * 10) / 10
              : null,
            runwayNote: "ค่าใช้จ่ายเฉลี่ย ไม่ใช่วันล้มละลายแน่นอน",
            unpaidWages: w.people.reduce(
              (n, p) => n + p.pay.dueBase + p.pay.dueOT,
              0,
            ),
            overdueBills: w.finance.payables,
            receivable: Object.values(w.invoices)
              .filter((i) => i.status === "unpaid")
              .reduce((n, i) => n + i.amount, 0),
            totals: w.finance.totals,
            metrics: w.metrics,
          },
          policies: w.policies,
          people,
          offers: Object.values(w.offers).filter((o) => o.status === "open"),
          orders: Object.values(w.orders),
          jobs,
          purchases: Object.values(w.purchases),
          invoices: Object.values(w.invoices),
          inventory: w.inventory,
          research: {
            ...w.research,
            unlockedProducts: w.research.unlocked,
          },
          production: w.production,
          catalog: {
            rules: w.catalog.rules,
            materials: Object.values(w.catalog.materials),
            products: Object.values(w.catalog.products).map((p) => ({
              ...p,
              bomCost: Object.entries(p.bom).reduce(
                (n, [m, q]) => n + w.catalog.materials[m].unitCost * q,
                0,
              ),
              unlocked: w.research.unlocked.includes(p.id),
            })),
            skills: Object.values(w.catalog.skills),
            roles: Object.entries(w.catalog.roles).map(([id, r]) => ({
              id,
              ...r,
            })),
            taskKinds: Object.values(w.catalog.taskKinds || {}),
            dimensions: {
              personality: H.PERSONALITY.map((id) => ({
                id,
                nameTh: labels[id],
              })),
              values: H.VALUES.map((id) => ({ id, nameTh: labels[id] })),
              aptitudes: H.APTITUDES.map((id) => ({ id, nameTh: labels[id] })),
            },
          },
          candidates: S.candidates(w),
          campus: {
            buildings,
            facilityDecision: w.facilities?.lastDecision || null,
            trainingMinutes: w.facilities?.trainingMinutes || 0,
          },
          scene: {
            coordinateSystem: "tile-x-right-y-down",
            tileSize: 1,
            layout: w.layout,
            buildings,
            units,
            people: people.map((p) => ({
              id: p.id,
              name: p.name,
              role: p.role,
              roleName: p.roleName,
              position: p.position,
              previousPosition: p.previousPosition,
              path: p.path,
              activity: p.activity,
              activityLabelTh: p.activityLabelTh,
              emoji: p.emoji,
              stationId: p.stationId,
              buildingId: p.buildingId,
              isIndoors: p.isIndoors,
              visible: p.visible,
              visual: p.visual,
            })),
          },
          events: w.events.slice(-30),
          chronicle,
          digests,
          ledger: w.finance.entries.slice(-30),
          dailyHistory: w.history.days.slice(-30),
          taskHistory: w.history.tasks.slice(-30),
        }),
      );
    }
    function create(seed = "company", options = {}) {
      let world = S.create(seed, options),
        speed = 0,
        lastFrame = null,
        accumulator = 0,
        lastError = null;
      const listeners = new Set();
      const snapshot = () => view(world);
      const publish = () => {
        if (!listeners.size) return;
        const data = snapshot();
        for (const fn of listeners)
          try {
            fn(data);
          } catch (e) {
            lastError = e.message || String(e);
          }
      };
      const api = {
        snapshot,
        dispatch(command) {
          const result = S.command(world, command);
          if (result.ok) publish();
          return result;
        },
        advance(minutes) {
          const result = S.advance(world, minutes);
          publish();
          return result;
        },
        save() {
          return Save.serialize(world);
        },
        load(text) {
          let next;
          try {
            next = Save.deserialize(text);
          } catch (e) {
            return { ok: false, code: "invalidSave", message: e.message };
          }
          world = next;
          lastFrame = null;
          accumulator = 0;
          publish();
          return { ok: true };
        },
        newGame(nextSeed, nextOptions = options) {
          const next = S.create(nextSeed, nextOptions);
          world = next;
          speed = 0;
          lastFrame = null;
          accumulator = 0;
          publish();
          return snapshot();
        },
        subscribe(fn) {
          if (typeof fn !== "function")
            throw new TypeError("listener must be a function");
          listeners.add(fn);
          try {
            fn(snapshot());
          } catch (e) {
            lastError = e.message || String(e);
          }
          return () => listeners.delete(fn);
        },
        setSpeed(value) {
          if (![0, 1, 2, 5, 10, 20].includes(value))
            throw new TypeError("unsupported speed");
          speed = value;
          lastFrame = null;
          accumulator = 0;
        },
        getSpeed() {
          return speed;
        },
        resetClock() {
          lastFrame = null;
          accumulator = 0;
        },
        frame(timestamp) {
          if (typeof timestamp !== "number" || !Number.isFinite(timestamp))
            throw new TypeError("invalid frame time");
          const dt = lastFrame === null ? 0 : timestamp - lastFrame;
          lastFrame = timestamp;
          if (dt < 0 || dt > 1000 || speed === 0 || world.status !== "running")
            return 0;
          accumulator += (dt / 1000) * 10 * speed;
          const minutes = Math.floor(accumulator / S.TICK) * S.TICK;
          if (minutes) {
            accumulator -= minutes;
            const result = S.advance(world, minutes);
            publish();
            return result;
          }
          return 0;
        },
        lastPresentationError() {
          return lastError;
        },
        audit() {
          return Save.validate(world);
        },
      };
      return Object.freeze(api);
    }
    return Object.freeze({
      VERSION: "1.0.0",
      CAMPUS_BUILDINGS,
      compareEmployees,
      create,
    });
  },
);
