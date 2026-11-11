(function () {
  "use strict";

  const app = CompanyAPI.create("company-demo", { autonomous: true });
  const byId = (id) => document.getElementById(id);
  const money = (cents) =>
    "฿" +
    (Number(cents || 0) / 100).toLocaleString("th-TH", {
      maximumFractionDigits: 0,
    });
  const moneyFull = (cents) =>
    (Number(cents || 0) / 100).toLocaleString("th-TH", {
      maximumFractionDigits: 2,
    }) + " บาท";
  const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));

  const SKILL_DESCRIPTIONS = {
    sales: {
      eff: "เจรจาดีลธุรกิจกับบริษัทคู่ค้า B2B เพิ่มโอกาสได้ราคาต่อหน่วยสูงขึ้นและเงื่อนไขการค้าที่ดี",
      train: "เจรจาหาลูกค้าที่อาคารสำนักงานใหญ่ / ศูนย์การค้า B2B",
    },
    admin: {
      eff: "บริหารซัพพลายเชน ออกใบสั่งซื้อวัตถุดิบ (PO) และวางบิลเรียกเก็บเงินลูกค้า (Invoice)",
      train: "งานจัดซื้อและบัญชีที่อาคารสำนักงานใหญ่ / คลังวัตถุดิบ",
    },
    engineering: {
      eff: "เพิ่มแต้มวิจัย R&D เพื่อปลดล็อกแบบแปลนผลิตภัณฑ์ใหม่และบำรุงรักษาเครื่องจักรโรงงาน",
      train: "วิจัยและพัฒนาที่อาคารแล็บวิจัย (R&D Lab) & โรงซ่อมบำรุง",
    },
    assembly: {
      eff: "เพิ่มความเร็วในการเดินเครื่องจักรประกอบชิ้นงานตามไลน์ผลิต A/B/C และลดโอกาสของเสีย",
      train: "ประกอบชิ้นงานและงานซ่อม (Rework) ที่อาคารโรงงานผลิต",
    },
    quality: {
      eff: "เพิ่มความแม่นยำในการคัดกรองคุณภาพสินค้า (QC/QA) และตรวจรับวัตถุดิบหน้าคลัง",
      train: "ตรวจสอบคุณภาพชิ้นงานที่แท่นตรวจ QC ในโรงงาน",
    },
    logistics: {
      eff: "เร่งความเร็วการแพ็กสินค้าลงกล่องมาตรฐานส่งออกและการปล่อยรถบรรทุกจัดส่งลูกค้า B2B",
      train: "งานแพ็กเกจจิ้งและจัดส่งที่คลังสินค้าและศูนย์ส่งออก",
    },
    leadership: {
      eff: "เพิ่มประสิทธิภาพเมื่อเดินไปช่วยเพื่อนร่วมงาน (Collaboration Multiplier) และบริหารองค์กร",
      train: "ช่วยเหลือเพื่อนร่วมงานในโซนเดียวกันและประสานงานองค์กร",
    },
  };

  const APTITUDE_GROUPS = [
    {
      title: "ปัญญาและการคิดวิเคราะห์ (Cognitive & Reasoning)",
      keys: [
        "analytical",
        "numerical",
        "verbal",
        "creativity",
        "learningSpeed",
        "memory",
        "attention",
        "problemSensitivity",
        "perceptualSpeed",
        "uncertaintyReasoning",
      ],
    },
    {
      title: "การสื่อสาร อารมณ์ และการจัดการ (Social & Executive)",
      keys: ["communication", "emotionalInsight", "organization", "composure", "speechClarity"],
    },
    {
      title: "ความแม่นยำและควบคุมกลไก (Psychomotor & Technical)",
      keys: [
        "precision",
        "dexterity",
        "controlPrecision",
        "coordination",
        "reactionSpeed",
        "spatial",
      ],
    },
    {
      title: "ประสาทสัมผัสและพละกำลังกาย (Sensory & Physical)",
      keys: [
        "stamina",
        "strength",
        "balance",
        "flexibility",
        "sensory",
        "visualAcuity",
        "colorDiscrimination",
        "hearing",
        "tasteSmell",
      ],
    },
  ];

  const STATE_LABELS = [
    ["energy", "พลังงานกาย (Energy)", false],
    ["focus", "สมาธิจดจ่อ (Focus)", false],
    ["morale", "ขวัญกำลังใจ (Morale)", false],
    ["health", "สุขภาพกาย (Health)", false],
    ["fulfillment", "ความอิ่มเอมใจ (Fulfillment)", false],
    ["drive", "แรงขับเคลื่อน (Drive)", false],
    ["stress", "ความเครียด (Stress)", true],
    ["burnout", "ภาวะหมดไฟสะสม (Burnout)", true],
    ["hunger", "ความหิว (Hunger)", true],
    ["sleepDebt", "หนี้การนอนหลับ (Sleep Debt)", true],
    ["socialNeed", "ความต้องการพบปะ (Social Need)", true],
    ["lifeBurden", "ภาระชีวิตทางบ้าน (Life Burden)", true],
  ];

  const GOAL_NAMES_TH = {
    emergencyFund: "สร้างเงินออมสำรองฉุกเฉิน",
    familySupport: "ส่งเสียและดูแลครอบครัว",
    buyVehicle: "เก็บเงินซื้อยานพาหนะส่วนตัว",
    buyHome: "เก็บเงินดาวน์บ้านของตัวเอง",
    masterCraft: "ฝึกฝนฝีมือสู่ช่างระดับปรมาจารย์",
    careerLead: "ก้าวหน้าขึ้นเป็นผู้นำสายงาน",
    skillMastery: "พัฒนาความเชี่ยวชาญเฉพาะทาง",
    homeOwnership: "มีบ้านเป็นของตัวเอง",
    careerAdvancement: "เติบโตในสายอาชีพ",
    personalVehicle: "ซื้อรถยนต์ส่วนตัว",
    wealthAndFreedom: "อิสรภาพทางการเงิน",
    romanceAndFamily: "สร้างครอบครัวที่อบอุ่น",
  };

  const MOOD_NAMES_TH = {
    content: "พึงพอใจและสงบ",
    happy: "แจ่มใสมีความสุข",
    motivated: "เปี่ยมไฟทำงาน",
    neutral: "ปกติ",
    tense: "ตึงเครียด",
    distressed: "กังวลใจ",
    exhausted: "อ่อนล้ามาก",
  };

  let current = app.snapshot();
  let pending = current;
  let lastPaint = 0;
  let lastEventId = current.events.at(-1)?.id || null;
  let autoStarted = false;

  // Sheet, Filter & Tracked NPC State (JS2-adapted)
  const uiState = {
    sheetOpen: false,
    sheetMode: null, // 'people' | 'campus' | 'log' | 'market' | 'policy' | 'menu' | 'person' | 'building'
    subTab: "",
    selectedPersonId: null,
    compareTargetId: current.people[1]?.id || null,
    selectedBuildingId: null,
    trackedIds: new Set(),
    peopleFilterTrackedOnly: false,
    peopleDivisionFilter: "ALL", // 'ALL' | 'executive' | 'office' | 'factory'
    rosterLimit: 60,
    newsMode: "ALL",
    newsCategory: "ALL",
    digestPeriod: "d1",
  };

  function toggleTrackedPerson(personId) {
    if (uiState.trackedIds.has(personId)) {
      uiState.trackedIds.delete(personId);
      showToast("ยกเลิกการปักหมุดติดตามพนักงานแล้ว");
    } else {
      uiState.trackedIds.add(personId);
      showToast("⭐ ปักหมุดติดตามพนักงานบนแผนที่และรายงานแล้ว");
    }
    paint(current);
  }

  const mapCanvas = byId("map");
  const minimapCanvas = byId("minimap");
  const renderer =
    typeof CampusRender !== "undefined"
      ? CampusRender.createRenderer(mapCanvas, minimapCanvas)
      : null;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function showToast(text, isError = false) {
    if (byId("notice")) byId("notice").textContent = text;
    const box = byId("toasts");
    if (!box) return;
    const t = el("div", "toast" + (isError ? " err" : ""), text);
    box.append(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => {
      if (t.parentNode) t.remove();
    }, 3400);
  }

  function dispatch(command, successNote) {
    const result = app.dispatch(command);
    if (!result.ok) {
      showToast(result.message || "คำสั่งไม่สำเร็จ", true);
      return result;
    }
    if (successNote) showToast(successNote, false);
    paint(app.snapshot());
    return result;
  }

  function barColor(val, invert = false) {
    const v = invert ? 100 - val : val;
    if (v >= 70) return "#58d68d";
    if (v >= 45) return "#58b8f6";
    if (v >= 28) return "#f5b041";
    return "#e66052";
  }

  function makeBarRow(label, value, marker = null, invert = false) {
    const row = el("div", "bar");
    const lb = el("div", "lb", label);
    lb.title = label;
    const tr = el("div", "tr");
    const fl = el("div", "fl");
    fl.style.width = clamp(value, 0, 100) + "%";
    fl.style.background = barColor(value, invert);
    tr.append(fl);
    if (marker !== null && Number.isFinite(marker)) {
      const mk = el("div", "mk");
      mk.style.left = clamp(marker, 0, 100) + "%";
      tr.append(mk);
    }
    const vl = el("div", "vl", String(Math.round(value)));
    row.append(lb, tr, vl);
    return row;
  }

  function formatTime(minuteOfDay) {
    const h = Math.floor((minuteOfDay % 1440) / 60);
    const m = minuteOfDay % 60;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + " น.";
  }

  function renderTopHud(v) {
    const t = v.time;
    const period =
      t.minute >= 720 && t.minute < 780
        ? "🍱 พักเที่ยง"
        : t.minute >= 1020 && t.minute < 1200
          ? "🌙 ล่วงเวลา (OT)"
          : t.minute >= 540 && t.minute < 1020
            ? "☀️ เวลาทำงาน"
            : "🏠 นอกเวลาทำงาน";
    const icon =
      t.minute >= 1080 || t.minute < 360
        ? "🌙"
        : t.minute >= 990
          ? "🌇"
          : "☀️";

    if (byId("dateTxt")) {
      byId("dateTxt").textContent = `${icon} วันที่ ${t.day} • ${formatTime(t.minute)} • ${period}`;
    }

    const curSpd = app.getSpeed();
    document.querySelectorAll("#speedBar button").forEach((btn) => {
      btn.classList.toggle("on", Number(btn.dataset.speed) === curSpd);
    });
    if (byId("speed")) byId("speed").value = String(curSpd);

    const resRow = byId("resRow");
    if (resRow) {
      const employedCount = v.people.filter((p) => p.employed).length;
      const runway = v.company.runwayDays === null ? "∞" : v.company.runwayDays.toFixed(1);
      const pills = [
        {
          ic: "💰",
          label: "เงินสด",
          val: money(v.company.cash),
          cls: v.company.cash < 2500000 ? "warn" : "ok",
        },
        {
          ic: "🏦",
          label: "หนี้",
          val: money(v.company.debt),
          cls: v.company.debt === 0 ? "ok" : "",
        },
        {
          ic: "🔥",
          label: "รายจ่าย/วัน",
          val: money(v.company.dailyBurnEstimate),
          cls: "",
        },
        {
          ic: "⏳",
          label: "Runway",
          val: `${runway} วัน`,
          cls: v.company.runwayDays !== null && v.company.runwayDays < 10 ? "warn" : "",
        },
        {
          ic: "👥",
          label: "ทีมงาน",
          val: `${employedCount}/${v.catalog.rules?.maxPeople || 500}`,
          cls: "",
        },
        {
          ic: "⭐",
          label: "ชื่อเสียง",
          val: v.company.reputation.toFixed(0),
          cls: v.company.reputation >= 60 ? "ok" : "",
        },
      ];
      resRow.replaceChildren(
        ...pills.map((p) => {
          const pill = el("span", "pill" + (p.cls ? " " + p.cls : ""));
          pill.append(el("span", "", `${p.ic} ${p.label}`), el("b", "", p.val));
          return pill;
        }),
      );
    }

    const latestEvt = v.events.at(-1);
    if (latestEvt && latestEvt.id !== lastEventId) {
      lastEventId = latestEvt.id;
      const d = Math.floor(latestEvt.at / 1440) + 1;
      const tm = formatTime(latestEvt.at % 1440);
      if (byId("notice")) {
        byId("notice").textContent = `วันที่ ${d} (${tm}): ${latestEvt.message}`;
      }
    }
  }

  function renderSelectionBanner(v) {
    const banner = byId("selInfo");
    if (!banner) return;
    if (uiState.selectedPersonId) {
      const p = v.people.find((x) => x.id === uiState.selectedPersonId && x.employed);
      if (p) {
        banner.classList.add("show");
        const pt = el("canvas", "pt");
        pt.width = 44;
        pt.height = 44;
        if (typeof CampusRender !== "undefined") CampusRender.drawPortrait(pt, p);

        const info = el("div", "");
        info.style.flex = "1";
        info.style.minWidth = "0";
        const isTracked = uiState.trackedIds.has(p.id);
        const id = p.identity || {};
        const car = p.career || { badge: "Lv.1", titleTh: p.roleName, satisfaction: 76 };
        const nm = el(
          "div",
          "",
          `${isTracked ? "⭐ " : ""}${p.emoji} ${id.flag || "🇹🇭"} ${id.displayName || p.name} • ${car.badge} ${car.titleTh}`,
        );
        nm.style.fontWeight = "700";
        const demoLine = el(
          "div",
          "muted",
          `${id.genderSymbol || "♂"} เพศ${id.genderTh || "ชาย"} • อายุ ${id.age || 26} ปี • สัญชาติ${id.nationalityTh || "ไทย"} • ${car.departmentTh || p.roleName} • 😊 พึงพอใจ ${Math.round(car.satisfaction ?? 76)}%`,
        );
        const sub = el("div", "muted", p.activityLabelTh);
        info.append(nm, demoLine, sub);

        const pinBtn = el("button", "btn", isTracked ? "⭐ ติดตามอยู่" : "☆ ติดตาม");
        pinBtn.onclick = () => toggleTrackedPerson(p.id);

        const openBtn = el("button", "btn pri", "ดูแผ่นประวัติ");
        openBtn.onclick = () => openPersonSheet(p.id);
        const closeBtn = el("button", "sel-close", "✕");
        closeBtn.type = "button";
        closeBtn.setAttribute("aria-label", "ปิดข้อมูลตัวละคร");
        closeBtn.onclick = () => {
          uiState.selectedPersonId = null;
          banner.classList.remove("show");
          banner.replaceChildren();
        };
        const actions = el("div", "sel-actions");
        actions.append(pinBtn, openBtn);
        banner.replaceChildren(pt, info, closeBtn, actions);
        return;
      }
    }
    banner.classList.remove("show");
  }

  function openSheet(mode, defaultTab = "") {
    uiState.sheetOpen = true;
    uiState.sheetMode = mode;
    if (defaultTab) uiState.subTab = defaultTab;
    const sheet = byId("sheet");
    if (sheet) sheet.classList.add("show");
    document.querySelectorAll("#hudBottom button").forEach((b) => {
      b.classList.toggle("on", b.dataset.nav === mode);
    });
    renderActiveSheet(current);
  }

  function closeSheet() {
    uiState.sheetOpen = false;
    const sheet = byId("sheet");
    if (sheet) sheet.classList.remove("show");
    document.querySelectorAll("#hudBottom button").forEach((b) => b.classList.remove("on"));
  }

  function openPersonSheet(personId) {
    uiState.selectedPersonId = personId;
    uiState.selectedBuildingId = null;
    renderSelectionBanner(current);
    if (
      ![
        "vital",
        "identity",
        "aptitudes",
        "skills",
        "relations",
        "wallet",
        "chronicle",
        "compare",
      ].includes(uiState.subTab)
    ) {
      uiState.subTab = "vital";
    }
    openSheet("person", uiState.subTab);
  }

  function openBuildingSheet(buildingId) {
    uiState.selectedBuildingId = buildingId;
    if (renderer) renderer.focusBuilding(buildingId);
    if (!["inside", "stations", "manage"].includes(uiState.subTab)) {
      uiState.subTab = "inside";
    }
    openSheet("building", uiState.subTab);
  }

  function setSheetTabs(tabs) {
    const bar = byId("shTabs");
    if (!bar) return;
    if (!tabs.some((t) => t.id === uiState.subTab)) {
      uiState.subTab = tabs[0]?.id || "";
    }
    bar.replaceChildren(
      ...tabs.map((t) => {
        const b = el("button", t.id === uiState.subTab ? "on" : "", t.label);
        b.type = "button";
        b.onclick = () => {
          uiState.subTab = t.id;
          renderActiveSheet(current);
        };
        return b;
      }),
    );
  }

  function makePersonRow(v, p) {
    const row = el("div", "prow");
    const pt = el("canvas", "pt");
    pt.width = 48;
    pt.height = 48;
    if (typeof CampusRender !== "undefined") CampusRender.drawPortrait(pt, p);

    const allBuildings = [
      ...(v.campus?.buildings || []),
      ...(v.campus?.expansionPlots || []),
    ];
    const bld = allBuildings.find((b) => b.id === p.buildingId);
    const isTracked = uiState.trackedIds.has(p.id);
    const pi = el("div", "pi");
    const id = p.identity || {};
    const car = p.career || { badge: "Lv.1", titleTh: p.roleName, satisfaction: 76, bonusTotal: 0 };
    const divLabel =
      car.division === "executive"
        ? "👑 บริหาร"
        : car.division === "office"
          ? "🏢 ออฟฟิศ"
          : "🏭 โรงงาน";
    const nm = el("div", "nm");
    nm.append(
      el("span", "", `${isTracked ? "⭐ " : ""}${id.flag || "🇹🇭"} ${id.displayName || p.name}`),
      el("span", "chip g", `${car.badge} ${car.titleTh}`),
      el("span", "chip", divLabel),
      el("span", "chip b", `${id.genderSymbol || "♂"}${id.genderTh || "ชาย"} ${id.age || 26}ปี`),
      el("span", "chip ok", `😊 ${Math.round(car.satisfaction ?? 76)}%`),
    );
    const sub = el(
      "div",
      "sub",
      `${bld ? bld.icon + " " + bld.shortNameTh : p.zoneId} • ${p.emoji} ${p.activityLabelTh} • ค่าจ้าง ${money(p.pay.dailyWage)}/วัน${car.bonusTotal ? " • โบนัสสะสม " + money(car.bonusTotal) : ""}`,
    );

    const bars = el("div", "mini-bars");
    for (const [val, inv] of [
      [p.state.energy, false],
      [p.state.morale, false],
      [p.state.stress, true],
    ]) {
      const m = el("div", "mini");
      const fill = el("i");
      fill.style.width = clamp(val) + "%";
      fill.style.background = barColor(val, inv);
      m.append(fill);
      bars.append(m);
    }

    const starBtn = el("button", "chip" + (isTracked ? " g" : ""), isTracked ? "⭐ ติดตาม" : "☆ ติดตาม");
    starBtn.title = "ปักหมุดติดตามพนักงานคนนี้";
    starBtn.onclick = (ev) => {
      ev.stopPropagation();
      toggleTrackedPerson(p.id);
    };

    pi.append(nm, sub, bars);
    row.append(pt, pi, starBtn);
    row.onclick = () => openPersonSheet(p.id);
    return row;
  }

  /* ---------- 1. Character Sheet Drawer (8 Tabs — JS2 Style + Compare Tab) ---------- */
  function renderCharacterSheet(v, body) {
    const p = v.people.find((x) => x.id === uiState.selectedPersonId) || v.people[0];
    if (!p) return;
    const isTracked = uiState.trackedIds.has(p.id);
    const id = p.identity || {};
    const car = p.career || { level: 1, badge: "Lv.1", titleTh: p.roleName, satisfaction: 76, kpiScore: 58, tasksCompleted: 0, bonusTotal: 0, promotions: 0, menteesHelped: 0 };
    byId("shTitle").textContent = `${isTracked ? "⭐ " : ""}${id.flag || "🇹🇭"} ${id.displayName || p.name} • ${car.badge} ${car.titleTh}`;

    setSheetTabs([
      { id: "vital", label: "สถานะชีพ" },
      { id: "identity", label: "ตัวตน/ค่านิยม" },
      { id: "aptitudes", label: "ความถนัด 30 ด้าน" },
      { id: "skills", label: "ทักษะ/สายงาน" },
      { id: "relations", label: "ความสัมพันธ์" },
      { id: "wallet", label: "กระเป๋า/เป้าหมาย" },
      { id: "chronicle", label: "บันทึกชีวิต" },
      { id: "compare", label: "เทียบกับ..." },
    ]);

    const nodes = [];

    const headCard = el("div", "card");
    const topRow = el("div", "");
    topRow.style.display = "flex";
    topRow.style.gap = "12px";
    topRow.style.alignItems = "center";

    const pt = el("canvas", "pt");
    pt.width = 64;
    pt.height = 64;
    if (typeof CampusRender !== "undefined") CampusRender.drawPortrait(pt, p);

    const meta = el("div", "");
    meta.style.flex = "1";
    const allBuildings = [
      ...(v.campus?.buildings || []),
      ...(v.campus?.expansionPlots || []),
    ];
    const bld = allBuildings.find((b) => b.id === p.buildingId);
    const titleLine = el(
      "div",
      "",
      `${id.flag || "🇹🇭"} ${id.fullName || p.name} (ชื่อเล่น: ${p.name})`,
    );
    titleLine.style.fontWeight = "700";
    titleLine.style.fontSize = "15px";

    const badgeRow = el("div", "");
    badgeRow.style.display = "flex";
    badgeRow.style.flexWrap = "wrap";
    badgeRow.style.gap = "4px";
    badgeRow.style.marginTop = "4px";
    badgeRow.append(
      el("span", "chip b", `${id.genderSymbol || "♂"} เพศ${id.genderTh || "ชาย"}`),
      el("span", "chip b", `🎂 อายุ ${id.age || 26} ปี`),
      el("span", "chip g", `${id.flag || "🇹🇭"} สัญชาติ${id.nationalityTh || "ไทย"} (${id.nationality || "TH"})`),
      el("span", "chip g", `🎖️ ${car.badge} ${car.titleTh}`),
      el("span", "chip", `🏛️ ${car.departmentTh || p.roleName}`),
      el("span", "chip ok", `😊 ความพึงพอใจ ${Math.round(car.satisfaction ?? 76)}%`),
      el("span", "chip", `📊 KPI ${Math.round(car.kpiScore ?? 58)}/100`),
    );

    const bgLine = el(
      "div",
      "muted",
      `🎓 ${id.educationTh || "เทคนิคอุตสาหกรรม"} • 📍 ภูมิลำเนา: ${id.hometownTh || "ไทย"} • หน้าที่หลัก: ${car.dutyTh || "ปฏิบัติงานตามสายวิชาชีพ"}`,
    );
    bgLine.style.marginTop = "4px";

    const locLine = el(
      "div",
      "muted",
      `${bld ? bld.icon + " " + bld.nameTh : ""} • ${p.isIndoors ? "ปฏิบัติงานในอาคาร" : "อยู่กลางแจ้ง"} • ค่าจ้าง ${money(p.pay.dailyWage)}/วัน${car.bonusTotal ? " • โบนัสสะสม " + money(car.bonusTotal) : ""}`,
    );
    const actLine = el(
      "div",
      "",
      `${p.emoji} ${p.activityLabelTh}${car.mentorName ? " • 🤝 รุ่นพี่พี่เลี้ยง: " + car.mentorName : ""}`,
    );
    actLine.style.color = "#eccf82";
    actLine.style.fontSize = "12.5px";
    actLine.style.marginTop = "2px";
    meta.append(titleLine, badgeRow, bgLine, locLine, actLine);

    const pinBtn = el("button", "btn" + (isTracked ? " pri" : ""), isTracked ? "⭐ ติดตามอยู่" : "☆ ปักหมุดติดตาม");
    pinBtn.onclick = () => toggleTrackedPerson(p.id);

    topRow.append(pt, meta, pinBtn);

    const switchRow = el("div", "");
    switchRow.style.marginTop = "8px";
    switchRow.style.display = "flex";
    switchRow.style.gap = "4px";
    switchRow.style.flexWrap = "wrap";
    for (const emp of v.people.filter((x) => x.employed).slice(0, 24)) {
      const trk = uiState.trackedIds.has(emp.id) ? "⭐" : emp.emoji;
      const chip = el("button", "chip" + (emp.id === p.id ? " g" : ""), `${trk} ${emp.name}`);
      chip.onclick = () => {
        uiState.selectedPersonId = emp.id;
        renderActiveSheet(current);
      };
      switchRow.append(chip);
    }
    headCard.append(topRow, switchRow);
    nodes.push(headCard);

    if (uiState.subTab === "vital") {
      const thoughtCard = el("div", "card");
      thoughtCard.append(el("h3", "", "💭 ความคิดและเหตุผลการตัดสินใจล่าสุด"));
      for (const th of p.recentThoughts || []) {
        const item = el("div", "logrow", `• ${th}`);
        thoughtCard.append(item);
      }
      if (p.decision && p.decision.motives?.length) {
        const mWrap = el("div", "");
        mWrap.style.marginTop = "6px";
        for (const m of p.decision.motives.slice(0, 5)) {
          const dimName =
            m.labelTh ||
            (typeof CompanyData !== "undefined" && CompanyData.translateMotiveFactor
              ? CompanyData.translateMotiveFactor(m.factor)
              : null) ||
            v.catalog.dimensions.values.find((d) => d.id === m.factor)?.nameTh ||
            v.catalog.dimensions.personality.find((d) => d.id === m.factor)?.nameTh ||
            m.factor;
          mWrap.append(
            el(
              "span",
              "chip " + (m.amount >= 0 ? "ok" : "r"),
              `${dimName} ${m.amount >= 0 ? "+" : ""}${m.amount.toFixed(1)}`,
            ),
          );
        }
        thoughtCard.append(mWrap);
      }
      nodes.push(thoughtCard);

      const stateCard = el("div", "card");
      stateCard.append(
        el("h3", "", `❤️ สภาพร่างกายและจิตใจ 12 มิติ (อารมณ์: ${MOOD_NAMES_TH[p.affect?.mood] || p.affect?.mood || "ปกติ"})`),
      );
      for (const [key, label, inv] of STATE_LABELS) {
        stateCard.append(makeBarRow(label, p.state[key] ?? 0, null, inv));
      }
      nodes.push(stateCard);

      const roleCard = el("div", "card");
      roleCard.append(
        el("h3", "", `🎖️ เส้นทางสายอาชีพ โควตาแผนก ผลงาน KPI และโบนัส (${car.badge})`),
        makeBarRow("ความพึงพอใจในการทำงาน (Job Satisfaction)", car.satisfaction ?? 76, null, false),
        makeBarRow("ดัชนีผลงานรวม (KPI Score)", car.kpiScore ?? 58, null, false),
        el(
          "div",
          "logrow",
          `ระดับชั้น: [${car.gradeCode || "G1"} / ${car.badge}] ${car.titleTh} (${car.tierNameTh || "ระดับปฏิบัติการ"})`,
        ),
        el(
          "div",
          "logrow",
          `ผังสายบังคับบัญชา 4 ชั้น: ${car.orgPathTh || (car.divisionNameTh + " › " + car.departmentTh)} • แผนก: ${car.sectionTh || car.departmentTh} • กลุ่มงาน: ${car.groupTh || "กลุ่มหลัก"}`,
        ),
        el(
          "div",
          "logrow",
          `ค่าจ้าง ${moneyFull(p.pay.dailyWage)}/วัน • โบนัสสะสม ${moneyFull(car.bonusTotal || 0)} • งานสำเร็จ ${car.tasksCompleted || 0} งาน${car.dealsNegotiated ? " • ปิดดีล B2B " + car.dealsNegotiated + " สัญญา" : ""}${car.poIssued ? " • ออกใบ PO " + car.poIssued + " รายการ" : ""} • เลื่อนขั้นแล้ว ${car.promotions || 0} ครั้ง`,
        ),
      );
      if (car.headroom) {
        roleCard.append(
          el(
            "div",
            "logrow",
            `🏢 โควตาตำแหน่งในแผนก: ${car.headroom.reason} (ครองตำแหน่งอยู่ ${car.headroom.currentCount}/${car.headroom.maxQuota} อัตรา)`,
          ),
        );
      }
      if (car.nextLevel) {
        roleCard.append(
          el(
            "div",
            "muted",
            `🎯 เกณฑ์เลื่อนตำแหน่งถัดไป (${car.nextLevel.badge} ${car.nextLevel.titleTh}): ประเมินโดยหัวหน้างาน/CEO • งานสำเร็จ ${car.tasksCompleted || 0}/${car.nextLevel.minTasks} งาน • ทักษะสายงาน ≥ ${car.nextLevel.minSkill} • อายุงาน ≥ ${car.nextLevel.minTenureDays} วัน (+฿${((car.nextLevel.wageBonus || 0) / 100).toLocaleString("th-TH")}/วัน)`,
          ),
        );
      } else {
        roleCard.append(el("div", "muted", "🌟 ดำรงตำแหน่งระดับสูงสุดของสายงานแล้ว"));
      }
      if (car.history && car.history.length > 0) {
        const hTitle = el("h4", "", "📜 ประวัติการประเมินเลื่อนตำแหน่งโดยหัวหน้างาน");
        hTitle.style.margin = "8px 0 4px";
        hTitle.style.color = "#fef3c7";
        roleCard.append(hTitle);
        for (const h of car.history.slice(0, 3)) {
          roleCard.append(
            el(
              "div",
              "logrow",
              `วันที่ ${h.day}: เลื่อนเป็น ${h.titleTh} (ค่าจ้าง ${money(h.newWage)}/วัน) • ผู้ประเมิน: ${h.evaluatorName || "หัวหน้างาน"} • เหตุผล: ${h.rationale || "ผลงานตามเกณฑ์"}`,
            ),
          );
        }
      }
      nodes.push(roleCard);
    } else if (uiState.subTab === "identity") {
      const valCard = el("div", "card");
      valCard.append(el("h3", "", "🌟 คุณค่าชีวิต 18 มิติ (และขีดความอิ่มเอมปัจจุบัน)"));
      const satMarker = clamp((p.state.fulfillment * 0.6 + p.state.morale * 0.4), 10, 95);
      for (const d of v.catalog.dimensions.values) {
        valCard.append(makeBarRow(d.nameTh, p.profile.values[d.id], satMarker, false));
      }
      valCard.append(
        el("div", "muted", "ขีดขาว = ระดับความอิ่มเอมในคุณค่าปัจจุบัน (ยิ่งค่านิยมสูง พนักงานยิ่งเลือกงานที่ตอบโจทย์ด้านนั้น)"),
      );
      nodes.push(valCard);

      const perCard = el("div", "card");
      perCard.append(el("h3", "", "🧭 บุคลิกภาพ 14 มิติ (HEXACO Core 1.0.0)"));
      for (const d of v.catalog.dimensions.personality) {
        perCard.append(makeBarRow(d.nameTh, p.profile.personality[d.id], null, d.id === "stressReactivity"));
      }
      nodes.push(perCard);
    } else if (uiState.subTab === "aptitudes") {
      const nameMap = Object.fromEntries(v.catalog.dimensions.aptitudes.map((d) => [d.id, d.nameTh]));
      for (const grp of APTITUDE_GROUPS) {
        const c = el("div", "card");
        c.append(el("h3", "", grp.title));
        for (const k of grp.keys) {
          if (p.profile.aptitudes[k] === undefined) continue;
          c.append(
            makeBarRow(
              nameMap[k] || k,
              p.profile.aptitudes[k],
              p.profile.potential?.[k] ?? null,
              false,
            ),
          );
        }
        c.append(el("div", "muted", "แถบสี = ความถนัดตั้งต้น | ขีดขาว = เพดานศักยภาพสูงสุด (Potential)"));
        nodes.push(c);
      }
    } else if (uiState.subTab === "skills") {
      const skCard = el("div", "card");
      skCard.append(el("h3", "", "🛠️ ทักษะวิชาชีพที่ฝึกฝนได้ (Learned Skills)"));
      for (const s of v.catalog.skills) {
        const rec = p.skills[s.id] || { level: 0, totalXp: 0 };
        const cap =
          typeof CompanyCore !== "undefined"
            ? CompanyCore.skillCap(p.profile, s)
            : 100;
        const item = el("div", "skill-item");
        item.append(makeBarRow(s.nameTh, rec.level, cap, false));
        const desc = SKILL_DESCRIPTIONS[s.id] || {
          eff: "เพิ่มความเร็วและคุณภาพในงานเฉพาะทาง",
          train: "ปฏิบัติงานจริงในสถานีที่เกี่ยวข้อง",
        };
        item.append(
          el(
            "div",
            "skill-sub",
            `${desc.eff} • XP สะสม ${rec.totalXp.toFixed(0)} (เพดานศักยภาพ ${cap.toFixed(0)})`,
          ),
          el("div", "skill-sub", `ฝึกได้จาก: ${desc.train}`),
        );
        skCard.append(item);
      }
      nodes.push(skCard);
    } else if (uiState.subTab === "relations") {
      const relCard = el("div", "card");
      relCard.append(el("h3", "", "🤝 ความสัมพันธ์และความไว้วางใจกับเพื่อนร่วมทีม"));
      const others = v.people.filter((x) => x.id !== p.id).slice(0, 30);
      for (const o of others) {
        const rel = p.relationships[o.id] || { trust: 0, familiarity: 0 };
        const item = el("div", "skill-item");
        const top = el("div", "");
        top.style.display = "flex";
        top.style.justifyContent = "space-between";
        top.append(
          el("strong", "", `${o.emoji || "👤"} ${o.name} (${o.roleName})`),
          el(
            "span",
            "chip " + (rel.trust >= 15 ? "ok" : rel.trust < 0 ? "r" : "b"),
            `ความเชื่อใจ ${rel.trust >= 0 ? "+" : ""}${rel.trust.toFixed(1)}`,
          ),
        );
        item.append(
          top,
          makeBarRow("ความคุ้นเคย (Familiarity)", rel.familiarity, null, false),
          makeBarRow("ความไว้วางใจ (Trust)", clamp(rel.trust + 50, 0, 100), 50, false),
        );
        relCard.append(item);
      }
      nodes.push(relCard);
    } else if (uiState.subTab === "wallet") {
      const finCard = el("div", "card");
      finCard.append(el("h3", "", "💰 กระเป๋าเงินส่วนตัวและเป้าหมายชีวิต"));
      const goalId = p.aspirations?.primaryGoal || "emergencyFund";
      const goalLabel = GOAL_NAMES_TH[goalId] || goalId;
      const ratio = clamp((p.aspirations?.progressRatio || 0) * 100, 0, 100);
      finCard.append(
        makeBarRow(`เป้าหมาย: ${goalLabel}`, ratio, 100, false),
        el(
          "div",
          "muted",
          `เงินเก็บในกระเป๋า: ${moneyFull(p.pay.wallet)} / เป้าหมาย ${moneyFull(p.aspirations?.targetSavings || 0)} • แรงถีบตัว (Hustle) ${Math.round(p.aspirations?.hustleDrive || 50)}`,
        ),
      );
      const g2 = el("div", "grid2");
      g2.style.marginTop = "8px";
      g2.append(
        el("div", "pill", `ค่าจ้าง/วัน: ${money(p.pay.dailyWage)}`),
        el("div", "pill", `รอรับวันเงินเดือนออก: ${money(p.pay.dueBase + p.pay.dueOT)}`),
        el("div", "pill", `รายรับสะสม: ${money(p.pay.totalPaid)}`),
        el("div", "pill", `ค่าครองชีพใช้จ่ายสะสม: ${money(p.pay.outsideSpending)}`),
      );
      finCard.append(g2);
      nodes.push(finCard);

      const gearCard = el("div", "card");
      gearCard.append(el("h3", "", "🎒 อุปกรณ์ประจำตำแหน่งและทรัพย์สินส่วนตัว"));
      const grid = el("div", "inv-grid");
      const items = [
        { tag: "ประจำตัว", status: "สวม", ic: "🪪", nm: "บัตรพนักงาน", qty: "×1" },
        {
          tag: "เครื่องมือ",
          status: "สวม",
          ic:
            p.role === "assembler"
              ? "🔧"
              : p.role === "inspector"
                ? "🔍"
                : p.role === "engineer"
                  ? "💻"
                  : p.role === "sales"
                    ? "📱"
                    : "📋",
          nm: `ชุดอุปกรณ์${p.roleName}`,
          qty: "×1",
        },
        {
          tag: "การเงิน",
          status: "พกพา",
          ic: "👛",
          nm: "กระเป๋าเงิน",
          qty: money(p.pay.wallet),
        },
        {
          tag: "สวัสดิการ",
          status: v.policies.wellbeingDaily > 0 ? "ได้รับ" : "พื้นฐาน",
          ic: "🍱",
          nm: "คูปองโรงอาหาร",
          qty: money(v.policies.wellbeingDaily),
        },
      ];
      for (const it of items) {
        const cell = el("div", "inv-cell sel");
        cell.append(
          el("span", "inv-b-tl", it.tag),
          el("span", "inv-b-tr", it.status),
          el("div", "ic", it.ic),
          el("div", "nm", it.nm),
          el("span", "inv-b-br", it.qty),
        );
        grid.append(cell);
      }
      gearCard.append(grid);
      nodes.push(gearCard);
    } else if (uiState.subTab === "chronicle") {
      const logCard = el("div", "card");
      logCard.append(el("h3", "", `📜 บันทึกการปฏิบัติงานและชีวิตของ ${p.name}`));
      const myTasks = [...(v.taskHistory || [])]
        .filter((t) => t.personId === p.id)
        .reverse();
      const myEvents = [...(v.events || [])]
        .filter((e) => e.details?.personId === p.id || (e.message && e.message.includes(p.name)))
        .reverse();

      for (const th of p.recentThoughts || []) {
        const r = el("div", "logrow");
        r.append(el("span", "tm", `วันที่ ${v.time.day}`), el("span", "actor", p.name + " "), el("span", "", th));
        logCard.append(r);
      }
      for (const e of myEvents.slice(0, 12)) {
        const r = el("div", "logrow");
        const d = Math.floor(e.at / 1440) + 1;
        r.append(
          el("span", "tm", `วันที่ ${d} ${formatTime(e.at % 1440)}`),
          el("span", "", e.message),
        );
        logCard.append(r);
      }
      for (const t of myTasks.slice(0, 15)) {
        const r = el("div", "logrow");
        const d = Math.floor(t.at / 1440) + 1;
        r.append(
          el("span", "tm", `วันที่ ${d} ${formatTime(t.at % 1440)}`),
          el("span", "actor", p.name + " "),
          el("span", "", `ดำเนินงาน ${t.kind} สำเร็จลุล่วง${t.orderId ? " (" + t.orderId + ")" : ""}`),
        );
        logCard.append(r);
      }
      nodes.push(logCard);
    } else if (uiState.subTab === "compare") {
      const others = v.people.filter((x) => x.employed && x.id !== p.id);
      const other = others.find((x) => x.id === uiState.compareTargetId) || others[0];
      const cmpCard = el("div", "card");
      cmpCard.append(el("h3", "", `⚖️ เปรียบเทียบข้อมูลเชิงลึกของ ${p.name} กับเพื่อนร่วมงาน`));

      if (!other) {
        cmpCard.append(el("div", "muted", "ยังไม่มีพนักงานคนอื่นสำหรับเปรียบเทียบ"));
        nodes.push(cmpCard);
      } else {
        uiState.compareTargetId = other.id;
        const selWrap = el("div", "sw");
        selWrap.append(el("span", "", "เลือกพนักงานที่จะเปรียบเทียบ:"));
        const sel = el("select");
        sel.style.width = "200px";
        for (const o of others.slice(0, 60)) {
          const opt = el("option", "", `${o.name} (${o.roleName})`);
          opt.value = o.id;
          sel.append(opt);
        }
        sel.value = other.id;
        sel.onchange = () => {
          uiState.compareTargetId = sel.value;
          renderActiveSheet(current);
        };
        selWrap.append(sel);
        cmpCard.append(selWrap);

        const cmp =
          typeof CompanyAPI !== "undefined" && CompanyAPI.compareEmployees
            ? CompanyAPI.compareEmployees(p, other)
            : null;

        if (cmp) {
          for (const section of [
            { title: "🛠️ ทักษะวิชาชีพ (Learned Skills)", rows: cmp.skills },
            { title: "❤️ สถานะร่างกายและจิตใจหลัก", rows: cmp.vitality },
            { title: "🧭 บุคลิกภาพ 14 มิติ", rows: cmp.personality },
            { title: "🌟 คุณค่าชีวิต 18 มิติ", rows: cmp.values },
            { title: "🧠 ความถนัด 30 ด้าน", rows: cmp.aptitudes },
          ]) {
            const secCard = el("div", "card");
            secCard.append(
              el("h3", "", `${section.title} (${p.name} เทียบกับ ${other.name})`),
            );
            for (const row of section.rows) {
              const r = el("div", "logrow");
              r.style.display = "flex";
              r.style.justifyContent = "space-between";
              r.style.alignItems = "center";
              const dSign = row.delta > 0 ? `+${row.delta}` : String(row.delta);
              const chipCls = row.delta > 3 ? "ok" : row.delta < -3 ? "r" : "b";
              r.append(
                el("span", "", row.nameTh),
                el(
                  "span",
                  "",
                  `${p.name}: ${row.a} | ${other.name}: ${row.b} `,
                ),
                el("span", `chip ${chipCls}`, dSign),
              );
              secCard.append(r);
            }
            nodes.push(secCard);
          }
        }
        nodes.unshift(cmpCard);
      }
    }

    body.replaceChildren(...nodes);
  }

  /* ---------- 2. Building Inspect Drawer (When Clicking a Building or Expansion Plot on Map) ---------- */
  function renderBuildingSheet(v, body) {
    const allBuildings = [
      ...(v.campus?.buildings || []),
      ...(v.campus?.expansionPlots || []),
    ];
    const b = allBuildings.find((x) => x.id === uiState.selectedBuildingId) || allBuildings[0];
    if (!b) return;
    byId("shTitle").textContent = `${b.icon} ${b.nameTh}`;

    setSheetTabs([
      { id: "inside", label: "ภายในอาคาร & ผู้คน" },
      { id: "stations", label: "สถานีและเครื่องจักร" },
      { id: "manage", label: "สลับดูอาคารอื่น" },
    ]);

    const nodes = [];
    const headCard = el("div", "card");
    const isPlot = Boolean(b.cost !== undefined && b.constructed !== undefined);
    headCard.append(
      el(
        "h3",
        "",
        `${b.icon} ${b.nameTh}${b.id === "gate" || isPlot ? "" : ` • ระดับ ${b.level}`} (${b.subtitleTh})`,
      ),
      el(
        "div",
        "muted",
        isPlot && !b.constructed
          ? `สถานะ: แปลงที่ดินรอการก่อสร้าง (งบลงทุน ${money(b.cost)}) • ผลประโยชน์: ${b.benefitTh}`
          : `พนักงานประจำ/ในอาคารตอนนี้: ${b.totalAssignedCount} คน (อยู่ในตัวอาคาร ${b.indoorCount} คน) • งานที่กำลังเดินเครื่อง ${b.activeJobCount} งาน`,
      ),
    );
    const benefits = {
      hq: "ระดับที่สูงขึ้นช่วยให้งานขาย B2B และจัดซื้อ/บัญชีคืบหน้าเร็วขึ้น",
      factory: "ระดับที่สูงขึ้นช่วยให้งานประกอบ ซ่อม และตรวจคุณภาพคืบหน้าเร็วขึ้น",
      warehouse: "ระดับที่สูงขึ้นช่วยให้งานแพ็กและจัดส่งคืบหน้าเร็วขึ้น",
      rnd: "ระดับที่สูงขึ้นช่วยให้งานวิจัยคืบหน้าเร็วขึ้น",
      canteen: "โรงอาหารระดับสูงช่วยลดความหิวระหว่างมื้ออาหารมากขึ้น",
      courtyard: "สวนระดับสูงช่วยให้พนักงานคลายเครียดและฟื้นพลังได้มากขึ้น",
      training: "พนักงานที่ว่างสามารถเดินมาฝึกทักษะที่นี่; ระดับสูงช่วยเพิ่มผลการฝึก",
    };
    if (benefits[b.id]) headCard.append(el("div", "muted", benefits[b.id]));
    if (b.benefitTh && b.constructed) headCard.append(el("div", "muted", `✅ เปิดใช้งานแล้ว: ${b.benefitTh}`));
    if (b.id === "training") headCard.append(el("div", "muted", `เวลาฝึกสะสม ${v.campus.trainingMinutes} นาที`));
    const decision = v.campus?.facilityDecision;
    if (decision && decision.facilityId === b.id) {
      const ceo = v.people.find((p) => p.id === decision.personId);
      headCard.append(el("div", "logrow", `${ceo?.name || "ผู้บริหาร"}: ${decision.decision === "upgrade" ? "ตัดสินใจลงทุน" : "รอการลงทุน"} • ${decision.reason} • งบ ${money(decision.cost)}`));
    }
    nodes.push(headCard);

    if (uiState.subTab === "inside") {
      const specCard = el("div", "card");
      if (b.id === "hq" || b.id === "execAnnex" || b.id === "expoHall") {
        specCard.append(el("h3", "", "📊 สถานะฝ่ายบริหาร ฝ่ายขาย B2B และฝ่ายจัดซื้อ/บัญชี"));
        specCard.append(
          el(
            "div",
            "muted",
            `ข้อเสนอคู่ค้าที่ฝ่ายขายกำลังประเมิน: ${v.offers.length} ดีล • ออเดอร์กำลังผลิต: ${v.orders.filter((o) => o.status === "accepted").length} รายการ • รายรับรอเก็บ (Invoices): ${moneyFull(v.company.receivable)}`,
          ),
        );
        for (const o of v.offers.slice(0, 6)) {
          const prod = v.catalog.products.find((p) => p.id === o.productId);
          specCard.append(
            el(
              "div",
              "logrow",
              `💼 ${o.customerName}: สั่ง ${prod?.nameTh || o.productId} ×${o.quantity} ชิ้น (${money(o.unitPrice)}/ชิ้น) • ${o.negotiatedBy ? "เจรจาโดย " + o.negotiatedBy + " (คะแนนดีล " + o.salesPitchScore + ")" : "ฝ่ายขายประเมินอัตโนมัติ"}`,
            ),
          );
        }
      } else if (["factory", "prodLineB", "prodLineC", "prodLineD", "maintWorkshop", "qaLab"].includes(b.id)) {
        specCard.append(el("h3", "", "⚙️ สถิติสายการผลิต เครื่องจักร และการตรวจสอบคุณภาพ (QC)"));
        const completed = Object.values(v.production.completed || {}).reduce((a, n) => a + n, 0);
        const shipped = Object.values(v.production.shipped || {}).reduce((a, n) => a + n, 0);
        const scrapped = Object.values(v.production.scrapped || {}).reduce((a, n) => a + n, 0);
        specCard.append(
          el(
            "div",
            "muted",
            `สภาพเครื่องจักร: ${v.campus.machineCondition}% • ประกอบสำเร็จสะสม: ${completed} ชิ้น • ส่งมอบแล้ว: ${shipped} ชิ้น • ตัดเป็นของเสีย (Scrap): ${scrapped} ชิ้น`,
          ),
        );
        for (const j of v.jobs.filter((x) => ["assembly", "rework", "qa"].includes(x.kind)).slice(0, 8)) {
          const worker = v.people.find((p) => p.id === j.assignee);
          specCard.append(
            makeBarRow(
              `${j.kind.toUpperCase()} (${worker ? worker.name : "รอช่าง"})`,
              j.fraction * 100,
              null,
              false,
            ),
          );
        }
      } else if (["warehouse", "rawDepot", "dispatchHub"].includes(b.id)) {
        specCard.append(el("h3", "", "📦 สต็อกวัตถุดิบ สินค้าสำเร็จรูป และขบวนรถขนส่งโลจิสติกส์"));
        const grid = el("div", "inv-grid");
        for (const m of v.catalog.materials) {
          const qty = v.inventory.materials[m.id] || 0;
          const res = v.inventory.reserved[m.id] || 0;
          const cell = el("div", "inv-cell");
          cell.append(
            el("span", "inv-b-tl", "วัตถุดิบ"),
            el("span", "inv-b-tr", `จอง ${res}`),
            el("div", "ic", "🔩"),
            el("div", "nm", m.nameTh),
            el("span", "inv-b-br", `×${qty}`),
          );
          grid.append(cell);
        }
        for (const prod of v.catalog.products) {
          const fin = v.inventory.finished[prod.id] || 0;
          const cell = el("div", "inv-cell sel");
          cell.append(
            el("span", "inv-b-tl", "พร้อมส่ง"),
            el("span", "inv-b-tr", "QC ผ่าน"),
            el("div", "ic", "📦"),
            el("div", "nm", prod.nameTh),
            el("span", "inv-b-br", `×${fin}`),
          );
          grid.append(cell);
        }
        specCard.append(grid);
        const transits = (v.logistics?.inboundShipments || []).filter((p) => p.status !== "received");
        for (const tr of transits.slice(0, 6)) {
          specCard.append(
            el(
              "div",
              "logrow",
              `🚚 [${tr.truckPlate}] ${tr.supplierNameTh}: ส่ง ${tr.materialNameTh} ×${tr.quantity} ชิ้น • สถานะ: ${tr.status === "transit" ? "กำลังวิ่งมาที่คลัง" : "กำลังออกใบ PO"}`,
            ),
          );
        }
      } else if (b.id === "canteen" || b.id === "dormitory") {
        specCard.append(el("h3", "", "🍱 บรรยากาศโรงอาหาร หอพัก และสวัสดิการพนักงาน"));
        specCard.append(
          el(
            "div",
            "muted",
            `งบสวัสดิการอาหารกลางวันปัจจุบัน: ${money(v.policies.wellbeingDaily)}/คน/วัน • พนักงานจะเดินมากินมื้อเที่ยงเวลา 12:00–13:00 น. และพักผ่อนฟื้นฟูกำลังใจ`,
          ),
        );
      } else if (b.id === "rnd") {
        specCard.append(el("h3", "", "🔬 ความก้าวหน้าการวิจัยและพัฒนา (R&D Lab)"));
        specCard.append(
          makeBarRow("แต้มวิจัยสะสม (เป้าหมาย 360)", clamp((v.research.points / 360) * 100), 100, false),
        );
        for (const prod of v.catalog.products) {
          specCard.append(
            el(
              "div",
              "logrow",
              `${prod.unlocked ? "✅ ปลดล็อกแล้ว" : "🔒 กำลังวิจัย"}: ${prod.nameTh} (ราคาขาย ${money(prod.priceMin)}–${money(prod.priceMax)} | ต้นทุน BOM ${money(prod.bomCost)})`,
            ),
          );
        }
      } else {
        specCard.append(el("h3", "", "🌿 พื้นที่ส่วนกลางและโครงสร้างพื้นฐานนิคม"));
        specCard.append(
          el(
            "div",
            "muted",
            `พนักงานที่อยู่ในเวลางาน: ${v.people.filter((p) => p.employed && p.atWork).length} / ${v.people.filter((p) => p.employed).length} คน`,
          ),
        );
      }
      nodes.push(specCard);

      const occCard = el("div", "card");
      const occupants = v.people.filter((p) => p.employed && p.buildingId === b.id);
      occCard.append(el("h3", "", `👥 พนักงานใน${b.shortNameTh} (${occupants.length} คน)`));
      if (!occupants.length) {
        occCard.append(el("div", "muted", "ขณะนี้ไม่มีพนักงานอยู่ในอาคารนี้"));
      } else {
        for (const p of occupants.slice(0, 40)) occCard.append(makePersonRow(v, p));
      }
      nodes.push(occCard);
    } else if (uiState.subTab === "stations") {
      const stCard = el("div", "card");
      stCard.append(el("h3", "", "🏭 สถานีทำงานภายในอาคาร"));
      const stations = Object.values(v.scene.layout.stations).filter(
        (s) => (b.stationIds || []).includes(s.id) || (b.stationKinds || []).includes(s.kind),
      );
      for (const s of stations) {
        const workers = v.people.filter((p) => p.employed && p.stationId === s.id);
        const r = el("div", "logrow");
        r.append(
          el("strong", "", `สถานี ${s.id} (${s.kind})`),
          el(
            "div",
            "muted",
            `ความจุ ${workers.length}/${s.capacity} คน • ผู้ใช้งาน: ${workers.slice(0, 10).map((w) => w.name).join(", ") || "ว่าง"}${workers.length > 10 ? ` (+อีก ${workers.length - 10} คน)` : ""}`,
          ),
        );
        stCard.append(r);
      }
      nodes.push(stCard);
    } else if (uiState.subTab === "manage") {
      const navCard = el("div", "card");
      navCard.append(el("h3", "", "🏢 เลือกตรวจสอบอาคารอื่นในนิคม"));
      for (const other of allBuildings) {
        const row = el("div", "prow");
        row.append(
          el("div", "nm", `${other.icon} ${other.nameTh}`),
          el("span", "chip g", `👥 ${other.totalAssignedCount || 0} คน`),
        );
        row.onclick = () => openBuildingSheet(other.id);
        navCard.append(row);
      }
      nodes.push(navCard);
    }

    body.replaceChildren(...nodes);
  }

  /* ---------- 2.5 External Assets & Multi-Stage Production Chains View ---------- */
  function renderExternalAssetsAndChainsView(v) {
    const ap = v.externalWorld?.assetPortfolio || {
      supplyChainStrategy: "balanced_hybrid",
      ownedAssets: {},
      harvestHistory: [],
      chainHistory: [],
      totalHarvestedUnits: 0,
      totalRefinedUnits: 0,
      totalChainSavingsSatang: 0,
      totalAssetDividendsSatang: 0,
    };
    const assets = v.catalog?.externalAssets || [];
    const chains = v.catalog?.productionChains || [];
    const strategies = v.catalog?.supplyChainStrategies || [];
    const bonuses = v.catalog?.activeAssetBonuses || {};
    const ownedCount = assets.filter((a) => a.owned).length;

    // Card 1: Executive Make-or-Buy Strategy & Portfolio Summary
    const stratCard = el("div", "card");
    stratCard.append(
      el("h3", "", `🌾 หมวดสินทรัพย์ภายนอกนิคม & ห่วงโซ่การผลิตลูกโซ่ (ถือครองแล้ว ${ownedCount}/${assets.length} แห่ง)`),
      el(
        "div",
        "muted",
        "บริษัทสามารถเลือกกลยุทธ์ได้อย่างอิสระ: จะผลิตสินค้าปลายน้ำ (เช่น ขนมปังโฮลเกรน เบเกอรี่ ชิป AI) โดยสั่งซื้อวัตถุดิบกลางน้ำจากตลาดทั้งหมดก็ได้ หรือจะลงทุนซื้อสินทรัพย์ต้นน้ำ (ไร่ข้าว สวนปาล์ม ไร่อ้อย เหมืองแร่) เพื่อส่งผลผลิตเข้าโรงโม่/โรงกลั่นแปรรูปกลางน้ำของบริษัทเองก็ได้ตามวิสัยทัศน์และเงินทุน",
      ),
      el(
        "div",
        "logrow",
        `📦 ผลผลิตต้นน้ำเก็บเกี่ยวเข้าคลังสะสม: ${ap.totalHarvestedUnits || 0} ชิ้น • ⚙️ แปรรูปวัตถุดิบกลางน้ำสะสม: ${ap.totalRefinedUnits || 0} ชิ้น • 💰 ประหยัดต้นทุนเทียบซื้อตลาด: ${moneyFull(ap.totalChainSavingsSatang || 0)} • 💵 ปันผลสุทธิจากสินทรัพย์: ${moneyFull(ap.totalAssetDividendsSatang || 0)}`,
      ),
      el(
        "div",
        "logrow",
        `⚡ ผลกระทบเชิงปฏิบัติการรวม: ลดค่าเช่า/ค่าไฟนิคม -${Math.round((bonuses.rentReductionPct || 0) * 100)}% • เร่งความเร็วผลิต +${Math.round((bonuses.productionSpeedBonus || 0) * 100)}% • เร่งแพ็กกิ้ง +${Math.round((bonuses.packingSpeedBonus || 0) * 100)}% • ลดเวลารอวัตถุดิบนำเข้า -${Math.round((bonuses.leadTimeReductionPct || 0) * 100)}% • โบนัสราคาขาย B2B +${Math.round((bonuses.pricePremiumBonus || 0) * 100)}%`,
      ),
    );

    const stratRow = el("div", "");
    stratRow.style.display = "flex";
    stratRow.style.flexWrap = "wrap";
    stratRow.style.gap = "6px";
    stratRow.style.marginTop = "8px";
    for (const st of strategies) {
      const isCur = (ap.supplyChainStrategy || "balanced_hybrid") === st.id;
      const btn = el("button", "chip" + (isCur ? " g" : ""), `${st.icon} ${st.nameTh}`);
      btn.onclick = () =>
        dispatch(
          { type: "setSupplyChainStrategy", strategyId: st.id },
          `ปรับวิสัยทัศน์ห่วงโซ่อุปทานเป็น "${st.shortNameTh}" แล้ว`,
        );
      stratRow.append(btn);
    }
    stratCard.append(stratRow);

    // Card 2: Multi-Stage Production Chains (Upstream -> Midstream -> Downstream)
    const chainCard = el("div", "card");
    const refineNowBtn = el("button", "btn pri", "⚙️ เดินเครื่องแปรรูปวัตถุดิบกลางน้ำ (T0➔T1)");
    refineNowBtn.style.marginBottom = "8px";
    refineNowBtn.style.marginRight = "6px";
    refineNowBtn.onclick = () =>
      dispatch(
        { type: "runMidstreamRefining" },
        "สั่งเดินเครื่องแปรรูปวัตถุดิบต้นน้ำเป็นวัตถุดิบกลางน้ำแล้ว",
      );
    const batchCraftBtn = el("button", "btn pri", "⚡ แปรรูปรวดเดียวครบทุกขั้น (Batch Craft T1➔T3)");
    batchCraftBtn.style.marginBottom = "8px";
    batchCraftBtn.onclick = () =>
      dispatch(
        { type: "batchCraftAll", batches: 2 },
        "สั่งเดินเครื่องแปรรูปวัตถุดิบแบบ Batch ครบทุกขั้น (T1➔T3) แล้ว",
      );
    chainCard.append(
      el("h3", "", "🔗 ห่วงโซ่การผลิตแบบลูกโซ่ 8 สาย (ต้นน้ำ ➔ แปรรูปกลางน้ำ ➔ สินค้าปลายน้ำ)"),
      el("div", "muted", "เปิด/ปิดการแปรรูปกลางน้ำแต่ละสายได้อิสระ หากปิดหรือไม่มีวัตถุดิบต้นน้ำ ฝ่ายจัดซื้อจะสั่งซื้อวัตถุดิบกลางน้ำจากซัพพลายเออร์ภายนอกแทนโดยอัตโนมัติ"),
      refineNowBtn,
      batchCraftBtn,
    );

    for (const ch of chains) {
      const box = el("div", "logrow");
      const top = el("div", "");
      top.style.display = "flex";
      top.style.justifyContent = "space-between";
      top.style.alignItems = "center";
      top.style.flexWrap = "wrap";
      top.style.gap = "6px";
      top.append(
        el("strong", "", `${ch.icon} ${ch.nameTh}`),
        el(
          "span",
          "chip " + (ch.upstreamOwned ? "ok" : "b"),
          ch.upstreamOwned ? `✅ มี${ch.upstreamAssetNameTh}แล้ว` : `🛒 ยังไม่มีสินทรัพย์ต้นน้ำ (ซื้อตลาดได้)`,
        ),
      );
      const toggleBtn = el(
        "button",
        "chip " + (ch.enabled ? "g" : "r"),
        ch.enabled ? "🟢 โหมดผลิตเอง (Make + Buy เสริม)" : "⚪ โหมดซื้อสำเร็จรูปล้วน (Buy Only)",
      );
      toggleBtn.onclick = () =>
        dispatch(
          { type: "toggleProductionChain", chainId: ch.id, enabled: !ch.enabled },
          `สลับโหมดห่วงโซ่ "${ch.shortNameTh}" แล้ว`,
        );
      top.append(toggleBtn);

      box.append(
        top,
        el("div", "", `• ขั้นต้นน้ำ ➔ กลางน้ำ: ใช้ [${ch.inputsTh}] แปรรูปเป็น [${ch.outputsTh}] (สำเร็จแล้ว ${ch.batchesCompleted} ล็อต • ประหยัดต้นทุน ${moneyFull(ch.costSavedSatang)})`),
        el("div", "muted", `• ป้อนสินค้าปลายน้ำ: ${ch.downstreamNamesTh} — ${ch.makeOrBuyNoteTh}`),
      );
      chainCard.append(box);
    }

    // Card 3: 12 External Assets Catalog & Acquisition Controls
    const assetCard = el("div", "card");
    assetCard.append(
      el("h3", "", "🏞️ ทะเบียนสินทรัพย์ภายนอกนิคมและสัมปทานทั้ง 12 แห่ง (External Assets Portfolio)"),
      el("div", "muted", "สินทรัพย์แต่ละแห่งส่งผลจริงต่อระบบนิเวศบริษัท ทั้งการส่งผลผลิตต้นน้ำเข้าคลังฟรีทุกวัน ลดค่าไฟ ลดเวลานำเข้า เพิ่มราคาขาย และสวัสดิการพนักงาน"),
    );

    for (const a of assets) {
      const row = el("div", "logrow");
      const header = el("div", "");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "center";
      header.style.flexWrap = "wrap";
      header.style.gap = "6px";

      header.append(
        el(
          "strong",
          "",
          `${a.icon} ${a.nameTh} (${a.locationTh}) [${a.categoryNameTh}]`,
        ),
      );

      const actionWrap = el("div", "");
      actionWrap.style.display = "flex";
      actionWrap.style.gap = "6px";
      actionWrap.style.alignItems = "center";
      if (!a.owned) {
        const buyBtn = el("button", "btn pri", `💼 เข้าซื้อกิจการ (${money(a.cost)})`);
        buyBtn.onclick = () =>
          dispatch(
            { type: "acquireExternalAsset", assetId: a.id },
            `เข้าซื้อกิจการ "${a.nameTh}" สำเร็จ! รับผลผลิตล็อตแรกเข้าคลังแล้ว`,
          );
        actionWrap.append(buyBtn);
      } else {
        actionWrap.append(el("span", "chip ok", `✅ ถือครอง Lv.${a.level}/3 (เก็บเกี่ยวสะสม ${a.totalHarvested} ชิ้น)`));
        if (a.upgradeCost) {
          const upBtn = el("button", "btn", `⬆️ ขยายเป็น Lv.${a.level + 1} (${money(a.upgradeCost)})`);
          upBtn.onclick = () =>
            dispatch(
              { type: "acquireExternalAsset", assetId: a.id, upgrade: true },
              `ขยายกำลังการผลิต "${a.shortNameTh}" เป็นระดับ ${a.level + 1} แล้ว`,
            );
          actionWrap.append(upBtn);
        }
      }
      header.append(actionWrap);
      row.append(header);

      for (const eff of a.operationalEffectsTh || []) {
        row.append(el("div", "", `  ↳ ${eff}`));
      }
      row.append(
        el(
          "div",
          "muted",
          `ปันผลผลผลิตส่วนเกิน: +${money(a.dailyDividend)}/วัน • ค่าดูแลรักษา: -${money(a.dailyUpkeep)}/วัน (กำไรสุทธิ +${money(a.dailyDividend - a.dailyUpkeep)}/วัน)`,
        ),
      );
      assetCard.append(row);
    }

        // Card 1B: 5-Tier Material & Component Value Chain DAG (T0 -> T1 -> T2 -> T3 -> T4) & B2B Material Trading
    const dagCard = el("div", "card");
    const extWorld = v.externalWorld || {};
    const b2bDemands = extWorld.b2bMaterialDemands || [];
    const recipes = v.catalog?.materialRecipes || [];
    const tiers = v.catalog?.materialTiers || [];

    dagCard.append(
      el("h3", "", "⚗️ ห่วงโซ่วัตถุดิบหลายขั้นตอน 5 ระดับ (T0 ➔ T1 ➔ T2 ➔ T3 ➔ T4) & การค้าส่งวัตถุดิบ B2B"),
      el(
        "div",
        "muted",
        "บริษัทไม่จำเป็นต้องขายเฉพาะสินค้าขั้นสุดท้าย (T4) เท่านั้น! สิ่งที่เราแปรรูปได้ในขั้น T1, T2 และ T3 สามารถใช้เป็นวัตถุดิบตั้งต้นสำหรับขั้นต่อไป หรือขายส่งเป็นสินค้า B2B ให้บริษัทภายนอกได้ทันที • ชิ้นส่วนไฮเทค (T3) ในช่วงต้นเกมที่ยังไม่มีแต้มวิจัย R&D ต้องสั่งซื้อจากซัพพลายเออร์ก่อน เมื่อมีทุนและองค์ความรู้ถึงเกณฑ์จึงปลดล็อกผลิตเองได้",
      ),
      el(
        "div",
        "logrow",
        `📦 ยอดขายส่งวัตถุดิบ/ชิ้นส่วน B2B สะสม: ${extWorld.totalB2BMaterialSalesUnits || 0} ชิ้น • 💵 รายได้จากการขายวัตถุดิบ B2B: ${moneyFull(extWorld.totalB2BMaterialRevenueSatang || 0)} • 🔬 แต้มวิจัย R&D ปัจจุบัน: ${Math.round(v.research?.points || 0)} แต้ม`,
      ),
    );

    if (tiers.length) {
      const tierInfo = el("div", "logrow");
      tierInfo.textContent = tiers.map((t) => `[${t.badgeTh}] ${t.shortNameTh}`).join("  ➔  ");
      dagCard.append(tierInfo);
    }

    if (b2bDemands.length) {
      dagCard.append(el("h4", "", "📢 กระดานรับซื้อวัตถุดิบและชิ้นส่วนกลางน้ำจากบริษัทภายนอกวันนี้ (Live B2B Material Demands)"));
      for (const dem of b2bDemands) {
        const stockNow = v.inventory?.materials?.[dem.materialId] || 0;
        const resNow = v.inventory?.reserved?.[dem.materialId] || 0;
        const freeNow = Math.max(0, stockNow - resNow);
        const dRow = el("div", "logrow");
        dRow.style.display = "flex";
        dRow.style.justifyContent = "space-between";
        dRow.style.alignItems = "center";
        dRow.style.flexWrap = "wrap";
        dRow.style.gap = "6px";
        dRow.append(
          el(
            "div",
            "",
            `🏢 ${dem.buyerNameTh} รับซื้อ [${dem.materialNameTh}] (Tier ${dem.tier}) ในราคาพิเศษ ${money(dem.unitPriceSatang)}/ชิ้น • คงคลังพร้อมขาย: ${freeNow} ชิ้น — ${dem.reasonTh}`,
          ),
        );
        const sellBtn = el(
          "button",
          "btn" + (freeNow >= dem.recommendedQty ? " pri" : ""),
          `💰 ขายส่ง ${dem.recommendedQty} ชิ้น (+${money(dem.unitPriceSatang * dem.recommendedQty)})`,
        );
        sellBtn.onclick = () =>
          dispatch(
            {
              type: "sellMaterialB2B",
              materialId: dem.materialId,
              quantity: dem.recommendedQty,
              buyerCorpId: dem.buyerCorpId,
            },
            `ขายส่ง ${dem.materialNameTh} ×${dem.recommendedQty} ชิ้น ให้แก่ ${dem.buyerNameTh} สำเร็จ!`,
          );
        dRow.append(sellBtn);
        dagCard.append(dRow);
      }
    }

    dagCard.append(el("h4", "", "🔬 สูตรการแปรรูปวัตถุดิบและสังเคราะห์ชิ้นส่วนภายในโรงงาน 27 รายการ (Tier 1 ➔ Tier 2 ➔ Tier 3)"));
    for (const rec of recipes) {
      const rRow = el("div", "logrow");
      const rTop = el("div", "");
      rTop.style.display = "flex";
      rTop.style.justifyContent = "space-between";
      rTop.style.alignItems = "center";
      rTop.style.flexWrap = "wrap";
      rTop.style.gap = "6px";

      const badgeCls = rec.unlocked ? "ok" : "r";
      const gateTxt = rec.unlocked
        ? `✅ มีองค์ความรู้พร้อมผลิตเอง (T${rec.tier})`
        : `🔒 ต้นเกมต้องซื้อตลาด (ต้องการวิจัย R&D ${rec.minResearch} แต้ม)`;
      rTop.append(
        el("strong", "", `[Tier ${rec.tier}] ${rec.nameTh}`),
        el("span", "chip " + badgeCls, gateTxt),
      );

      const btnGroup = el("div", "");
      btnGroup.style.display = "flex";
      btnGroup.style.gap = "6px";
      btnGroup.style.flexWrap = "wrap";

      const craftBtn = el("button", "chip " + (rec.unlocked ? "g" : ""), "⚗️ แปรรูปผลิตเอง 1 ล็อต");
      craftBtn.onclick = () =>
        dispatch(
          { type: "craftMaterial", materialId: rec.id, batches: 1 },
          `สั่งเดินเครื่องแปรรูป "${rec.nameTh}" แล้ว`,
        );
      const sellMatBtn = el("button", "chip b", `📦 ขายส่ง B2B (2 ชิ้น • ${money(rec.b2bSellPrice * 2)})`);
      sellMatBtn.onclick = () =>
        dispatch(
          { type: "sellMaterialB2B", materialId: rec.id, quantity: 2 },
          `ขายส่งวัตถุดิบ ${rec.id} ×2 ชิ้น เข้าตลาด B2B แล้ว`,
        );
      btnGroup.append(craftBtn, sellMatBtn);
      rTop.append(btnGroup);

      rRow.append(
        rTop,
        el("div", "", `• สูตรตั้งต้น: ใช้ [${rec.inputsTh}] ➔ ได้ [${rec.outputsTh}] (ราคาขายส่ง B2B มาตรฐาน ${money(rec.b2bSellPrice)}/ชิ้น • ผลิตสะสม ${rec.unitsProduced || 0} ชิ้น)`),
        el("div", "muted", `• เส้นทางห่วงโซ่ลูกโซ่: ${rec.chainPathTh}`),
      );
      dagCard.append(rRow);
    }

    return [stratCard, dagCard, chainCard, assetCard];
  }

  /* ---------- 3. Bottom Nav Sheets (People, Campus, Log, Market, Policy, Menu/Edit Hub) ---------- */
  function renderActiveSheet(v) {
    if (!uiState.sheetOpen) return;
    const body = byId("shBody");
    if (!body) return;

    if (uiState.sheetMode === "person") {
      renderCharacterSheet(v, body);
      return;
    }
    if (uiState.sheetMode === "building") {
      renderBuildingSheet(v, body);
      return;
    }

    if (uiState.sheetMode === "people") {
      const employedList = v.people.filter((p) => p.employed);
      byId("shTitle").textContent = "👥 ทำเนียบพนักงาน โครงสร้างองค์กร และฝ่ายบุคคล";
      setSheetTabs([
        { id: "roster", label: `พนักงานปัจจุบัน (${employedList.length})` },
        { id: "org", label: "🏛️ โครงสร้างองค์กร (ออฟฟิศ & โรงงาน)" },
        { id: "hr", label: "ระบบสรรหาอัตโนมัติ (HR)" },
      ]);
      if (uiState.subTab === "org") {
        const org = v.orgSummary || { totalEmployed: employedList.length, executiveCount: 1, officeCount: 3, factoryCount: 4, levelPyramid: [], departments: [] };
        const summaryCard = el("div", "card");
        summaryCard.append(
          el("h3", "", "🏛️ พีระมิดลำดับขั้นการบังคับบัญชา 10 ระดับ (Lv.1–Lv.10 / G1–G10) & ผังองค์กร 4 ชั้น"),
          el(
            "div",
            "logrow",
            `👥 พนักงานรวมทั้งสิ้น: ${org.totalEmployed} คน (เพดานรองรับสูงสุด ${v.catalog.rules?.maxPeople || 500} คน) • 👑 สายงานบริหาร/CEO: ${org.executiveCount} คน • 🏢 สายงานออฟฟิศ: ${org.officeCount} คน • 🏭 สายงานโรงงาน: ${org.factoryCount} คน`,
          ),
          el(
            "div",
            "muted",
            "ลำดับชั้นบังคับบัญชาจริง 10 ขั้น: ปฏิบัติการ (Lv.1) › ชำนาญการ (Lv.2) › หัวหน้ากลุ่มในไลน์ผลิต (Lv.3) › หัวหน้าหมวด/กะ (Lv.4) › รองหัวหน้าแผนก (Lv.5) › หัวหน้าแผนก (Lv.6) › รองผู้อำนวยการฝ่าย (Lv.7) › ผู้อำนวยการฝ่าย/ผู้จัดการโรงงาน (Lv.8) › รองกรรมการผู้จัดการใหญ่ C-Suite (Lv.9) › ประธานเจ้าหน้าที่บริหาร CEO (Lv.10)",
          ),
        );
        if (Array.isArray(org.levelPyramid) && org.levelPyramid.length) {
          for (const tier of [...org.levelPyramid].reverse()) {
            summaryCard.append(
              el(
                "div",
                "logrow",
                `[${tier.gradeCode} / Lv.${tier.level}] ${tier.tierNameTh} — ปัจจุบัน ${tier.count} คน (${tier.chainRoleTh})${tier.sampleNames?.length ? " • อาทิ: " + tier.sampleNames.join(", ") : ""}`,
              ),
            );
          }
        }

        const deptCards = (org.departments || []).map((dept) => {
          const dc = el("div", "card");
          dc.append(
            el("h3", "", `${dept.divisionId === "executive" ? "👑" : dept.divisionId === "office" ? "🏢" : "🏭"} ${dept.departmentTh} (${dept.roleNameTh})`),
            el("div", "muted", `สายงาน: ${dept.divisionNameTh} • สถานที่ปฏิบัติงาน: ${dept.zoneTh}`),
            el("div", "logrow", `ภารกิจหลัก: ${dept.coreDutiesTh}`),
            el(
              "div",
              "logrow",
              `ผู้บังคับบัญชาสายตรง: ${dept.supervisorName} (${dept.supervisorBadge || "Lv.1"}) • กำลังพลในฝ่าย: ${dept.headcount} คน (ผอ.ฝ่าย Lv.7+: ${dept.directorCount || 0} | ผจก.แผนก Lv.5-6: ${dept.deptManagerCount || 0} | หัวหน้ากะ Lv.4: ${dept.foremanCount || 0} | หัวหน้ากลุ่ม Lv.3: ${dept.groupLeaderCount || 0} | อาวุโส Lv.2: ${dept.seniorCount || 0})`,
            ),
          );
          if (Array.isArray(dept.sections) && dept.sections.length) {
            for (const sec of dept.sections) {
              const grpTxt = (sec.groups || [])
                .map((g) => `${g.nameTh} (${g.headcount} คน, หน.กลุ่ม: ${g.leaderName})`)
                .join("  |  ");
              dc.append(
                el(
                  "div",
                  "logrow",
                  `📂 ${sec.nameTh} (กำลังพล ${sec.headcount} คน • หน.แผนก: ${sec.sectionHeadName}) › กลุ่มย่อย: ${grpTxt}`,
                ),
              );
            }
          }
          if (dept.quotaLv2 && dept.quotaLv3) {
            dc.append(
              el(
                "div",
                "muted",
                `โควตาเลื่อนขั้นตาม Span of Control — อาวุโส Lv.2: ${dept.quotaLv2.currentCount}/${dept.quotaLv2.maxQuota} | หัวหน้ากลุ่ม Lv.3: ${dept.quotaLv3.currentCount}/${dept.quotaLv3.maxQuota} | หัวหน้ากะ Lv.4: ${dept.quotaLv4 ? dept.quotaLv4.currentCount + "/" + dept.quotaLv4.maxQuota : "-"} | ผจก.แผนก Lv.6: ${dept.quotaLv6 ? dept.quotaLv6.currentCount + "/" + dept.quotaLv6.maxQuota : "-"}`,
              ),
            );
          }
          return dc;
        });
        body.replaceChildren(summaryCard, ...deptCards);
        return;
      }

      if (uiState.subTab === "hr") {
        const c = el("div", "card");
        c.append(
          el("h3", "", "🤝 ระบบฝ่ายบุคคลและผู้บริหารสรรหาคนอัตโนมัติ"),
          el(
            "div",
            "muted",
            "เมื่อปริมาณงานค้างสะสมล้นมือต่อเนื่องและกระแสเงินสดมี Runway > 30 วัน ฝ่ายบุคคลและ CEO จะคัดเลือกผู้สมัครด้านล่างเข้าทำงานตามแผนกที่ขาดแคลนโดยอัตโนมัติ (รองรับการขยายตัวสูงสุด 500 คน)",
          ),
        );
        for (const cand of v.candidates || []) {
          const cid = cand.identity || {};
          const item = el("div", "logrow");
          item.append(
            el(
              "strong",
              "",
              `ผู้สมัคร: ${cid.flag || "🇹🇭"} ${cid.displayName || cand.name} (${cid.genderSymbol || "♂"} เพศ${cid.genderTh || "ชาย"} • อายุ ${cid.age || 25} ปี • สัญชาติ${cid.nationalityTh || "ไทย"})`,
            ),
            el(
              "div",
              "muted",
              `🎓 ${cid.educationTh || "เทคนิคอุตสาหกรรม"} • ค่าแรงที่คาดหวัง ${money(cand.dailyWage)}/วัน • พร้อมเข้าสัมภาษณ์เมื่อบริษัทขยายทีม`,
            ),
          );
          c.append(item);
        }
        body.replaceChildren(c);
      } else {
        const c = el("div", "card");
        const filterRow = el("div", "");
        filterRow.style.display = "flex";
        filterRow.style.justifyContent = "space-between";
        filterRow.style.alignItems = "center";
        filterRow.style.flexWrap = "wrap";
        filterRow.style.gap = "6px";
        filterRow.style.marginBottom = "8px";
        filterRow.append(el("h3", "", "แตะที่ชื่อพนักงานเพื่อเปิดดูแผ่นประวัติ หรือกด ⭐ เพื่อปักหมุดติดตาม"));

        const divChips = el("div", "");
        divChips.style.display = "flex";
        divChips.style.gap = "4px";
        divChips.style.flexWrap = "wrap";
        for (const [dKey, dLabel] of [
          ["ALL", "ทุกสายงาน"],
          ["executive", "👑 บริหาร/CEO"],
          ["office", "🏢 ฝ่ายออฟฟิศ"],
          ["factory", "🏭 ฝ่ายโรงงาน"],
        ]) {
          const btn = el("button", "chip" + (uiState.peopleDivisionFilter === dKey ? " b" : ""), dLabel);
          btn.onclick = () => {
            uiState.peopleDivisionFilter = dKey;
            renderActiveSheet(current);
          };
          divChips.append(btn);
        }
        const trkToggle = el(
          "button",
          "chip" + (uiState.peopleFilterTrackedOnly ? " g" : ""),
          `⭐ เฉพาะที่ติดตาม (${uiState.trackedIds.size})`,
        );
        trkToggle.onclick = () => {
          uiState.peopleFilterTrackedOnly = !uiState.peopleFilterTrackedOnly;
          renderActiveSheet(current);
        };
        divChips.append(trkToggle);
        filterRow.append(divChips);
        c.append(filterRow);

        const list = employedList.filter(
          (x) =>
            (!uiState.peopleFilterTrackedOnly || uiState.trackedIds.has(x.id)) &&
            (uiState.peopleDivisionFilter === "ALL" || x.career?.division === uiState.peopleDivisionFilter),
        );
        if (!list.length) {
          c.append(el("div", "muted", "ไม่พบพนักงานในหมวดที่เลือก"));
        } else {
          for (const p of list.slice(0, uiState.rosterLimit)) {
            c.append(makePersonRow(v, p));
          }
          if (list.length > uiState.rosterLimit) {
            const moreBtn = el(
              "button",
              "btn",
              `แสดงเพิ่มอีก (${uiState.rosterLimit}/${list.length} คน)`,
            );
            moreBtn.style.marginTop = "8px";
            moreBtn.onclick = () => {
              uiState.rosterLimit += 80;
              renderActiveSheet(current);
            };
            c.append(moreBtn);
          }
        }
        body.replaceChildren(c);
      }
      return;
    }

    if (uiState.sheetMode === "campus") {
      byId("shTitle").textContent = "🏢 อาคารและผังนิคมอุตสาหกรรม";
      setSheetTabs([
        { id: "buildings", label: `อาคารหลักทั้ง ${v.campus?.buildings?.length || 0} แห่ง` },
        { id: "expand", label: "การขยายนิคมและสถานี" },
      ]);
      if (uiState.subTab === "expand") {
        const c = el("div", "card");
        c.append(
          el("h3", "", "🏗️ การลงทุนขยายพื้นที่นิคมและก่อสร้างอาคารใหม่"),
          el(
            "div",
            "muted",
            `ขนาดพื้นที่ปัจจุบัน: ${v.scene.layout.width} × ${v.scene.layout.height} ช่อง • สถานีทำงานรวม ${Object.keys(v.scene.layout.stations).length} จุด • ก่อสร้างอาคารส่วนต่อขยายแล้ว ${(v.campus?.constructedPlots || []).length}/${(v.campus?.expansionPlots || []).length} แห่ง`,
          ),
          el(
            "div",
            "muted",
            "การอัปเกรดอาคารและการก่อสร้างคลังวัตถุดิบ/ไลน์การผลิตใหม่เป็นการตัดสินใจของ CEO ตามเงินสำรองและการเติบโตของบริษัท",
          ),
        );
        for (const pl of v.campus?.expansionPlots || []) {
          const item = el("div", "logrow");
          item.append(
            el(
              "strong",
              "",
              `${pl.constructed ? "✅ ก่อสร้างแล้ว" : "📐 แปลงที่ดินรองรับการขยายตัว"}: ${pl.icon} ${pl.nameTh} (งบลงทุน ${money(pl.cost)})`,
            ),
            el("div", "muted", `${pl.subtitleTh} • ผลประโยชน์: ${pl.benefitTh}`),
          );
          c.append(item);
        }
        body.replaceChildren(c);
      } else {
        const c = el("div", "card");
        c.append(el("h3", "", "คลิกที่อาคารเพื่อส่องดูพนักงานและสายงานภายใน"));
        const allList = [
          ...(v.campus?.buildings || []),
          ...(v.campus?.expansionPlots || []).filter((pl) => pl.constructed),
        ];
        for (const b of allList) {
          const row = el("div", "prow");
          const pi = el("div", "pi");
          pi.append(
            el("div", "nm", `${b.icon} ${b.nameTh}${b.id === "gate" || b.constructed ? "" : ` (Lv.${b.level})`}`),
            el("div", "sub", b.subtitleTh),
          );
          row.append(
            pi,
            el("span", "chip g", `👥 ${b.totalAssignedCount} คน`),
            el("span", "chip ok", `⚙️ ${b.activeJobCount} งาน`),
          );
          row.onclick = () => openBuildingSheet(b.id);
          c.append(row);
        }
        body.replaceChildren(c);
      }
      return;
    }

    if (uiState.sheetMode === "log") {
      byId("shTitle").textContent = "📋 พงศาวดารนิคม รายงานประจำรอบ และสมุดบัญชี";
      setSheetTabs([
        { id: "events", label: "พงศาวดาร & รายงาน (Chronicle)" },
        { id: "digest", label: "สรุปผลประจำรอบ (1/7/30 วัน)" },
        { id: "ledger", label: "สมุดบัญชีแยกประเภท" },
      ]);

      if (uiState.subTab === "digest") {
        const c = el("div", "card");
        c.append(el("h3", "", "📊 รายงานสรุปผลการดำเนินงาน 4 บัญชีหลัก (Periodic Digest)"));
        const pBar = el("div", "");
        pBar.style.display = "flex";
        pBar.style.gap = "6px";
        pBar.style.marginBottom = "10px";
        for (const [k, lb] of [
          ["d1", "รอบ 1 วันล่าสุด"],
          ["d7", "รอบ 7 วันล่าสุด"],
          ["d30", "รอบ 30 วันล่าสุด"],
        ]) {
          const btn = el("button", "chip" + (uiState.digestPeriod === k ? " g" : ""), lb);
          btn.onclick = () => {
            uiState.digestPeriod = k;
            renderActiveSheet(current);
          };
          pBar.append(btn);
        }
        c.append(pBar);

        const dg = v.digests?.[uiState.digestPeriod] || v.digests?.d1;
        if (dg) {
          const acc1 = el("div", "card");
          acc1.append(
            el("h3", "", `💰 1. บัญชีการเงินและกระแสเงินสด (${dg.labelTh})`),
            el(
              "div",
              "logrow",
              `รายรับจากการขาย: +${moneyFull(dg.cashflow.revenue)} | ค่าวัตถุดิบ: -${moneyFull(dg.cashflow.materials)} | ค่าจ้างและสวัสดิการ: -${moneyFull(dg.cashflow.payrollAndWelfare)} | ค่าเช่าและโสหุ้ย: -${moneyFull(dg.cashflow.overhead)}`,
            ),
            el(
              "div",
              "logrow",
              `กระแสเงินสดสุทธิจากการดำเนินงาน: ${dg.cashflow.netOperating >= 0 ? "+" : ""}${moneyFull(dg.cashflow.netOperating)} (เงินสดคงเหลือ ${moneyFull(dg.cashflow.endingCash)} • หนี้ธนาคาร ${moneyFull(dg.cashflow.endingDebt)})`,
            ),
          );

          const acc2 = el("div", "card");
          acc2.append(
            el("h3", "", `⚙️ 2. บัญชีสายการผลิตและคุณภาพ (${dg.labelTh})`),
            el(
              "div",
              "logrow",
              `เซ็นรับดีลใหม่: ${dg.operations.dealsAccepted} ดีล • ส่งมอบสำเร็จ: ${dg.operations.ordersDelivered} ออเดอร์ • ผ่านการตรวจ QC: ${dg.operations.qcPassed} ครั้ง • ตีกลับซ่อม (Rework): ${dg.operations.qcRework} ครั้ง • งานค้างในระบบ: ${dg.operations.activeJobs} งาน`,
            ),
          );

          const acc3 = el("div", "card");
          acc3.append(
            el("h3", "", `📦 3. บัญชีคลังพัสดุและซัพพลายเชน (${dg.labelTh})`),
            el(
              "div",
              "logrow",
              `ใบสั่งซื้ออัตโนมัติ (PO): ${dg.inventory.poIssued} รายการ • พัสดุรับเข้าคลัง: ${dg.inventory.deliveriesReceived} รอบ • วัตถุดิบคงคลังรวม: ${dg.inventory.totalRawUnits} ชิ้น • สินค้าสำเร็จรูปพร้อมส่ง: ${dg.inventory.totalFinishedUnits} ชิ้น`,
            ),
          );

          const acc4 = el("div", "card");
          acc4.append(
            el("h3", "", `👥 4. บัญชีบุคลากรและวัฒนธรรมองค์กร (${dg.labelTh})`),
            el(
              "div",
              "logrow",
              `พนักงานปัจจุบัน: ${dg.people.headcount} คน (รับเพิ่มในรอบนี้ ${dg.people.hiresInPeriod} คน) • ความเครียดเฉลี่ย: ${dg.people.avgStress} • ขวัญกำลังใจเฉลี่ย: ${dg.people.avgMorale} • พลังงานเฉลี่ย: ${dg.people.avgEnergy} • แต้มวิจัย R&D สะสม: ${dg.people.researchPoints}`,
            ),
          );
          body.replaceChildren(c, acc1, acc2, acc3, acc4);
        } else {
          body.replaceChildren(c);
        }
        return;
      }

      if (uiState.subTab === "ledger") {
        const c = el("div", "card");
        c.append(el("h3", "", "💳 รายการเดินบัญชีแบบ Double-Entry ล่าสุด (Closed-Loop Accounting)"));
        for (const entry of [...(v.ledger || [])].reverse()) {
          const d = Math.floor(entry.at / 1440) + 1;
          const r = el("div", "logrow");
          r.append(
            el("span", "tm", `วันที่ ${d}`),
            el("span", "actor", `[${entry.kind}] `),
            el(
              "strong",
              "",
              `${entry.delta >= 0 ? "+" : ""}${moneyFull(entry.delta)}`,
            ),
            el("span", "muted", entry.reference ? ` (${entry.reference})` : ""),
          );
          c.append(r);
        }
        body.replaceChildren(c);
        return;
      }

      const c = el("div", "card");
      c.append(el("h3", "", "📜 พงศาวดารนิคมและตัวกรองข่าวสาร (Living Corporate Chronicle)"));

      const modeRow = el("div", "");
      modeRow.style.display = "flex";
      modeRow.style.gap = "4px";
      modeRow.style.flexWrap = "wrap";
      modeRow.style.marginBottom = "6px";
      for (const [mId, mLb] of [
        ["ALL", "ทั้งหมด"],
        ["MAJOR_ONLY", "เฉพาะเรื่องสำคัญ"],
        ["OPS_FINANCE", "ปฏิบัติการ/การเงิน"],
        ["TRACKED_ONLY", `⭐ เฉพาะคนที่ติดตาม (${uiState.trackedIds.size})`],
        ["QUIET_DIGEST", "โหมดเงียบ (เฉพาะวิกฤต/ดีลใหญ่)"],
      ]) {
        const b = el("button", "chip" + (uiState.newsMode === mId ? " g" : ""), mLb);
        b.onclick = () => {
          uiState.newsMode = mId;
          renderActiveSheet(current);
        };
        modeRow.append(b);
      }

      const catRow = el("div", "");
      catRow.style.display = "flex";
      catRow.style.gap = "4px";
      catRow.style.flexWrap = "wrap";
      catRow.style.marginBottom = "8px";
      for (const [cId, cLb] of [
        ["ALL", "ทุกหมวด"],
        ["SALES", "ฝ่ายขาย/ลูกค้า"],
        ["PROD", "โรงงาน/QC"],
        ["SUPPLY", "คลัง/จัดซื้อ"],
        ["HR_CULTURE", "บุคลากร/ชีวิต"],
        ["FINANCE", "การเงิน/ลงทุน"],
        ["RND", "วิจัย R&D"],
      ]) {
        const b = el("button", "chip" + (uiState.newsCategory === cId ? " b" : ""), cLb);
        b.onclick = () => {
          uiState.newsCategory = cId;
          renderActiveSheet(current);
        };
        catRow.append(b);
      }
      c.append(modeRow, catRow);

      const records = [...(v.chronicle || [])].filter((item) => {
        if (uiState.newsCategory !== "ALL" && item.category !== uiState.newsCategory) return false;
        if (uiState.newsMode === "MAJOR_ONLY" && !item.major) return false;
        if (
          uiState.newsMode === "OPS_FINANCE" &&
          !["SALES", "PROD", "SUPPLY", "FINANCE", "RND"].includes(item.category)
        ) {
          return false;
        }
        if (uiState.newsMode === "TRACKED_ONLY") {
          if (!item.actorId || !uiState.trackedIds.has(item.actorId)) return false;
        }
        if (uiState.newsMode === "QUIET_DIGEST") {
          if (!item.major && item.epistemic !== "VERIFIED") return false;
        }
        return true;
      });

      if (!records.length) {
        c.append(el("div", "muted", "ไม่มีรายการบันทึกที่ตรงกับตัวกรองปัจจุบัน"));
      } else {
        for (const rec of records.slice(0, 45)) {
          const r = el("div", "logrow");
          const top = el("div", "");
          top.style.display = "flex";
          top.style.flexWrap = "wrap";
          top.style.gap = "5px";
          top.style.alignItems = "center";

          const epCls =
            rec.epistemic === "VERIFIED"
              ? "ok"
              : rec.epistemic === "OBSERVED"
                ? "b"
                : "g";
          top.append(
            el("span", "tm", `วันที่ ${rec.day} ${formatTime(rec.minuteOfDay)}`),
            el("span", `chip ${epCls}`, rec.epistemicLabelTh),
            el("span", "chip", rec.categoryLabelTh),
          );
          if (rec.actorName) {
            const actorBtn = el("button", "chip g", `👤 ${rec.actorName}`);
            actorBtn.onclick = () => openPersonSheet(rec.actorId);
            top.append(actorBtn);
          }
          const msg = el("div", "", rec.message);
          msg.style.marginTop = "3px";
          const mean = el("div", "muted", `↳ ความหมายเชิงระบบ: ${rec.meaningTh}`);
          mean.style.fontSize = "11px";
          r.append(top, msg, mean);
          c.append(r);
        }
      }
      body.replaceChildren(c);
      return;
    }

    if (uiState.sheetMode === "market") {
      byId("shTitle").textContent = "📦 ตลาด B2B โลจิสติกส์ซัพพลายเชน และแบบแปลน R&D";
      setSheetTabs([
        { id: "orders", label: "🤝 ดีลฝ่ายขาย & ออเดอร์ B2B" },
        { id: "chains", label: "🌾 สินทรัพย์ภายนอก & ห่วงโซ่ลูกโซ่" },
        { id: "logistics", label: "🚛 โลจิสติกส์ & ไลน์ผลิต" },
        { id: "stock", label: "คลังวัตถุดิบ 37 ชนิด (T0–T3)" },
        { id: "rnd", label: "แบบแปลนวิจัย 28 ชนิด (6 หมวด)" },
      ]);
      if (uiState.subTab === "chains") {
        body.replaceChildren(...renderExternalAssetsAndChainsView(v));
        return;
      }
      const c = el("div", "card");
      if (uiState.subTab === "logistics") {
        const log = v.logistics || { b2bDeals: [], inboundShipments: [], outboundShipments: [], productionRegime: "lean_balanced", productionLines: {}, modeOutputCounts: {}, fleetCount: 2 };
        const lineCard = el("div", "card");
        lineCard.append(
          el("h3", "", "🏭 การแตกไลน์การผลิต 4 อาคาร (Lines A/B/C/D) & โหมดควบคุมจังหวะสายพาน"),
          el("div", "muted", `สภาพเครื่องจักรโรงงานปัจจุบัน: ${v.campus?.machineCondition ?? 100}% (ซ่อมบำรุงแล้ว ${v.campus?.maintenanceCount || 0} ครั้ง) • ขบวนรถบรรทุกขนส่ง: ${log.fleetCount || 2} คัน • รับวัตถุดิบสะสม ${log.totalInboundReceived || 0} เที่ยว • ส่งออกสะสม ${log.totalOutboundDispatched || 0} เที่ยว`),
        );
        const maintBtn = el("button", "btn pri", `🛠️ สั่งซ่อมบำรุงและสอบเทียบเครื่องจักรทันที (สภาพปัจจุบัน ${v.campus?.machineCondition ?? 100}% ➔ 100%)`);
        maintBtn.style.margin = "6px 0";
        maintBtn.onclick = () =>
          dispatch(
            { type: "maintainMachines" },
            "ซ่อมบำรุงและสอบเทียบเครื่องจักรโรงงานเต็ม 100% เรียบร้อยแล้ว",
          );
        lineCard.append(maintBtn);
        const regRow = el("div", "");
        regRow.style.display = "flex";
        regRow.style.flexWrap = "wrap";
        regRow.style.gap = "6px";
        regRow.style.margin = "6px 0 8px";
        for (const reg of v.catalog?.productionRegimes || []) {
          const isCur = (log.productionRegime || "lean_balanced") === reg.id;
          const btn = el("button", "chip" + (isCur ? " g" : ""), `⚙️ ${reg.nameTh}`);
          btn.onclick = () =>
            dispatch(
              { type: "directorEdit", action: "setProductionRegime", regimeId: reg.id },
              `เปลี่ยนโหมดเดินเครื่องเป็น "${reg.nameTh}" แล้ว`,
            );
          regRow.append(btn);
        }
        lineCard.append(regRow);
        for (const line of Object.values(log.productionLines || {})) {
          lineCard.append(
            el(
              "div",
              "logrow",
              `${line.active ? "🟢 เดินเครื่อง" : "⚪ รอก่อสร้างอาคารบนที่ดินขยาย"}: ${line.nameTh} [${line.modeNameTh || "สายพานมาตรฐาน"}] • โบนัสความเร็ว +${line.speedBonusPct}% • ประกอบสำเร็จแล้ว ${line.unitsCompleted || 0} ชิ้น`,
            ),
          );
        }
        if (Array.isArray(v.catalog?.productionModes) && v.catalog.productionModes.length) {
          lineCard.append(el("h4", "", "🔬 รูปแบบเทคโนโลยีการผลิตเฉพาะทาง 5 ระบบ (5 Production Modes)"));
          for (const pm of v.catalog.productionModes) {
            const cnt = log.modeOutputCounts?.[pm.id] || 0;
            lineCard.append(
              el(
                "div",
                "logrow",
                `${pm.icon} ${pm.nameTh}: ${pm.descriptionTh} (ผลิตสำเร็จ ${cnt} ชิ้น • โบนัส QC +${Math.round((pm.qualityBonus || 0) * 100)}%)`,
              ),
            );
          }
        }

        const inbCard = el("div", "card");
        inbCard.append(el("h3", "", "🚚 โลจิสติกส์ขาเข้า: การสั่งวัตถุดิบและรถบรรทุกซัพพลายเออร์ (Inbound Logistics)"));
        if (!(log.inboundShipments || []).length) {
          inbCard.append(el("div", "muted", "ยังไม่มีรายการสั่งซื้อวัตถุดิบขาเข้า"));
        } else {
          for (const s of (log.inboundShipments || []).slice(0, 10)) {
            const stBadge = s.status === "received" ? "✅ รับเข้าคลังแล้ว" : s.status === "transit" ? "🚚 กำลังขนส่งมาโรงงาน" : "📋 กำลังออกใบ PO";
            inbCard.append(
              el(
                "div",
                "logrow",
                `${stBadge} [${s.truckPlate}] จาก ${s.supplierNameTh} (${s.originTh}): ${s.materialNameTh} ×${s.quantity} ชิ้น (มูลค่า ${money(s.cost)} • สั่งโดย ${s.buyerName})`,
              ),
            );
          }
        }

        const outCard = el("div", "card");
        outCard.append(el("h3", "", "🚛 โลจิสติกส์ขาออก: การจัดส่งสินค้าให้บริษัทลูกค้า B2B (Outbound Dispatch)"));
        if (!(log.outboundShipments || []).length) {
          outCard.append(el("div", "muted", "ยังไม่มีรายการปล่อยรถขนส่งสินค้าขาออก"));
        } else {
          for (const s of (log.outboundShipments || []).slice(0, 10)) {
            const stBadge = s.status === "paid" ? "💰 ลูกค้าชำระเงินแล้ว" : "🧾 ส่งถึงมือลูกค้า/รอเก็บเงิน Invoice";
            outCard.append(
              el(
                "div",
                "logrow",
                `${stBadge} [${s.truckPlate}] ส่งมอบให้ ${s.clientNameTh}: ${s.productNameTh} ×${s.quantity} ชิ้น (ยอดสุทธิ ${money(s.totalAmount)} • ปล่อยรถโดย ${s.dispatcherName} • ${s.onTime ? "ตรงเวลา" : "ล่าช้า"})`,
              ),
            );
          }
        }
        body.replaceChildren(lineCard, inbCard, outCard);
        return;
      } else if (uiState.subTab === "stock") {
        c.append(
          el("h3", "", "📦 คลังวัตถุดิบ 37 ชนิด (T0 ต้นน้ำ ➔ T1 แปรรูป ➔ T2 กลางน้ำ ➔ T3 ชิ้นส่วนไฮเทค) & สินค้าสำเร็จรูป 28 ชนิด"),
          el("div", "muted", "วัตถุดิบ T0 (10 ชนิด) ผลิตเองไม่ได้ต้องเก็บเกี่ยวหรือซื้อ • วัตถุดิบ T1–T2 (19 ชนิด) แปรรูปเองหรือซื้อตลาดได้ • ชิ้นส่วนไฮเทค T3 (8 ชนิด) ต้นเกมต้องซื้อ เมื่อมีแต้มวิจัย R&D ถึงเกณฑ์จึงผลิตเองได้ และทุกชนิดสามารถขายส่ง B2B ได้!"),
        );
        const grid = el("div", "inv-grid");
        for (const m of v.catalog.materials) {
          const qty = v.inventory.materials[m.id] || 0;
          const res = v.inventory.reserved[m.id] || 0;
          const cell = el("div", "inv-cell");
          const tierIcon = m.tier === 0 ? "🌾" : m.tier === 1 ? "⚗️" : m.tier === 2 ? "⚙️" : "🧠";
          cell.append(
            el("span", "inv-b-tl", `${m.tierBadgeTh || ("T" + (m.tier ?? 0))} · ${money(m.unitCost)}`),
            el("span", "inv-b-tr", m.craftable ? (m.canCraftInHouse ? "✅ ผลิตเองได้" : `🔒 R&D ${m.minResearch}`) : "⛏️ ต้นน้ำแท้"),
            el("div", "ic", tierIcon),
            el("div", "nm", m.nameTh),
            el("span", "inv-b-br", `×${qty} (จอง ${res})`),
          );
          grid.append(cell);
        }
        c.append(grid);
      } else if (uiState.subTab === "rnd") {
        c.append(
          el("h3", "", `🔬 คลังแบบแปลนผลิตภัณฑ์ 4 อุตสาหกรรม (${v.research.points.toFixed(0)} แต้มวิจัย)`),
          makeBarRow("ความก้าวหน้าการวิจัยขั้นสูง (360 แต้ม)", clamp((v.research.points / 360) * 100), 100, false),
        );
        for (const prod of v.catalog.products) {
          const req = prod.researchRequired || 0;
          const statusTxt = prod.unlocked ? "✅ พร้อมผลิตและขาย" : `🔒 ต้องวิจัย ${req} แต้ม`;
          c.append(
            el(
              "div",
              "logrow",
              `${statusTxt}: ${prod.nameTh} [${prod.industryNameTh || "อุตสาหกรรมทั่วไป"}] • ราคาขาย ${money(prod.priceMin)}–${money(prod.priceMax)} (ต้นทุน BOM ${money(prod.bomCost)} | ประกอบ ${prod.assemblyMinutes}m • QC ${prod.qaMinutes}m • แพ็ก ${prod.packingMinutes}m)`,
            ),
          );
        }
      } else {
        c.append(
          el("h3", "", "🤝 การเจรจาดีลธุรกิจ B2B โดยฝ่ายขายและสถานะคำสั่งซื้อ"),
          el(
            "div",
            "muted",
            `ออเดอร์ที่ชำระเงินแล้วสะสม: ${v.company.metrics.ordersPaid} ออเดอร์ • ข้อเสนอจากบริษัทคู่ค้ารอฝ่ายขายพิจารณา: ${v.offers.length} รายการ`,
          ),
        );
        for (const o of [...(v.orders || [])].slice(-12).reverse()) {
          const prod = v.catalog.products.find((p) => p.id === o.productId);
          const negTxt = o.negotiationReport
            ? ` • เจรจาโดย ${o.salesPersonName || "ฝ่ายขาย"} (${o.negotiationReport.styleTh}, คะแนนดีล ${o.negotiationReport.pitchScore}/100)`
            : "";
          c.append(
            el(
              "div",
              "logrow",
              `📦 ${o.id} [${o.customerName || "ลูกค้า B2B"}]: ${prod?.nameTh || o.productId} ×${o.quantity} ชิ้น • ยอดรวม ${money(o.total)} • สถานะ: ${o.status}${negTxt}`,
            ),
          );
        }
      }
      body.replaceChildren(c);
      return;
    }

    if (uiState.sheetMode === "policy") {
      byId("shTitle").textContent = "⚖️ กลยุทธ์ผู้บริหาร โลกภายนอก ตลาดหุ้น และนโยบายรัฐ";
      setSheetTabs([
        { id: "directives", label: "สถานะบริษัทและ CEO" },
        { id: "assets", label: "🌾 สินทรัพย์ภายนอก & ห่วงโซ่ลูกโซ่" },
        { id: "external", label: "🌐 คู่ค้า & คู่แข่ง" },
        { id: "macro", label: "📈 ตลาดหุ้น & รัฐบาล" },
      ]);
      if (uiState.subTab === "assets") {
        body.replaceChildren(...renderExternalAssetsAndChainsView(v));
        return;
      }

      if (uiState.subTab === "external" && v.externalWorld) {
        const ext = v.externalWorld;
        const feedCard = el("div", "card");
        feedCard.append(
          el("h3", "", "🌐 ความเคลื่อนไหวนอกพื้นที่บริษัท (Living Off-Site Corporate Ecosystem & Inter-Company Feed)"),
          el(
            "div",
            "muted",
            "บริษัทภายนอกทั้ง 16 แห่งไม่ได้หยุดนิ่งรอซื้อของจากเราเท่านั้น แต่มีการค้าขายวัตถุดิบระหว่างกัน เปิดศึกหั่นราคาแย่งส่วนแบ่งตลาด จับมือเป็นพันธมิตรร่วมทุน และประกาศรับซื้อวัตถุดิบแปรรูป (Tier 1–3) ทุกวัน",
          ),
        );
        for (const item of (ext.ecosystemFeed || []).slice(0, 12)) {
          feedCard.append(
            el(
              "div",
              "logrow",
              `[วันที่ ${item.day}] ${item.badgeTh}: ${item.headlineTh} — 💡 ${item.impactTh}`,
            ),
          );
        }

        const corpCard = el("div", "card");
        corpCard.append(
          el(
            "h3",
            "",
            `🏢 ทำเนียบ 18 บริษัทภายนอกหลายบทบาท (เป็นทั้งคู่ค้า ซัพพลายเออร์ พันธมิตร และคู่แข่ง • ส่วนแบ่งตลาดของเรา ${ext.ourMarketSharePct || 2.0}%)`,
          ),
          el(
            "div",
            "muted",
            "บริษัทเดียวกันสามารถเป็นซัพพลายเออร์ขายแร่/ชิ้นส่วนให้เรา เป็นลูกค้าซื้อวัตถุดิบกลางน้ำหรือสินค้าสำเร็จรูปจากเรา เป็นพันธมิตรร่วมค้า (+8% ราคาขาย B2B) หรือเป็นคู่แข่งแย่งส่วนแบ่งตลาดในเวลาเดียวกัน",
          ),
        );
        const roleLabelMap = {
          client: "🛒 ลูกค้าซื้อสินค้า",
          supplier: "🚚 ซัพพลายเออร์ขายวัตถุดิบ",
          partner: "🤝 พันธมิตรร่วมทุน",
          competitor: "⚔️ คู่แข่งในตลาด",
        };
        for (const corp of Object.values(ext.corporations || {})) {
          const row = el("div", "logrow");
          const top = el("div", "");
          top.style.display = "flex";
          top.style.justifyContent = "space-between";
          top.style.alignItems = "center";
          top.style.flexWrap = "wrap";
          top.style.gap = "6px";

          const rolesTxt = (corp.roles || []).map((r) => roleLabelMap[r] || r).join(" · ");
          const relCls =
            corp.relationshipMode === "partner"
              ? "ok"
              : corp.relationshipMode === "rival"
                ? "r"
                : "b";
          top.append(
            el("strong", "", `[${corp.symbol}] ${corp.nameTh} (${corp.originTh}) — ${corp.sectorTh}`),
            el("span", "chip " + relCls, `สถานะ: ${corp.relationshipMode} • ความเชื่อใจ ${corp.trustScore}/100`),
          );

          const dipRow = el("div", "");
          dipRow.style.display = "flex";
          dipRow.style.gap = "4px";
          dipRow.style.flexWrap = "wrap";
          for (const [mKey, mLb] of [
            ["partner", "🤝 ร่วมเป็นพันธมิตร (+8% B2B)"],
            ["cordial", "💼 คู่ค้ามิตรภาพ"],
            ["rival", "⚔️ คู่แข่งโดยตรง"],
          ]) {
            const b = el("button", "chip" + (corp.relationshipMode === mKey ? " g" : ""), mLb);
            b.onclick = () =>
              dispatch(
                { type: "setCorporationRelation", corpId: corp.id, mode: mKey },
                `ปรับความสัมพันธ์กับ ${corp.nameTh} เป็น ${mLb} แล้ว`,
              );
            dipRow.append(b);
          }
          top.append(dipRow);

          const buyMatsTh = (corp.buysMaterials || [])
            .slice(0, 5)
            .map((mid) => v.catalog.materials.find((m) => m.id === mid)?.nameTh || mid)
            .join(", ");
          const sellMatsTh = (corp.sellsMaterials || [])
            .slice(0, 5)
            .map((mid) => v.catalog.materials.find((m) => m.id === mid)?.nameTh || mid)
            .join(", ");

          row.append(
            top,
            el("div", "", `• บทบาท: [${rolesTxt}] • ส่วนแบ่งตลาด ${corp.marketSharePct}% • ความแข็งแกร่ง ${corp.strength}/100 • เงินทุนหมุนเวียน ฿${corp.cashMillionBaht}M`),
            el("div", "", `• รับซื้อวัตถุดิบแปรรูปจากเรา (B2B): ${buyMatsTh || "-"} | จำหน่ายวัตถุดิบให้ตลาด: ${sellMatsTh || "-"}`),
            el("div", "muted", `• ความเคลื่อนไหวล่าสุด (วันที่ ${corp.lastActionDay || 1}): ${corp.lastActionTh || corp.strategyTh}`),
          );
          corpCard.append(row);
        }

        body.replaceChildren(feedCard, corpCard);
        return;
      }

      if (uiState.subTab === "macro" && v.externalWorld) {
        const ext = v.externalWorld;
        const gov = ext.government || {};
        const sm = ext.stockMarket || {};
        const govCard = el("div", "card");
        govCard.append(
          el("h3", "", "🏛️ นโยบายเศรษฐกิจและอุตสาหกรรมของรัฐบาล (Government Policy)"),
          el("div", "logrow", `📜 นโยบายที่มีผลบังคับใช้: "${gov.nameTh || "ส่งเสริมอุตสาหกรรม"}"`),
          el("div", "muted", `ผลกระทบต่อบริษัท: ${gov.summaryTh || "-"} • อัตราภาษีนิติบุคคลอ้างอิง ${gov.corporateTaxPct || 15}% • ตัวคูณอุปสงค์ตลาด ×${gov.demandMultiplier || 1.0}`),
        );

        const stockCard = el("div", "card");
        stockCard.append(
          el("h3", "", "📈 ตลาดหลักทรัพย์ ดัชนีกลุ่มอุตสาหกรรม และการประเมินมูลค่าบริษัท"),
          el(
            "div",
            "logrow",
            `💎 มูลค่ากิจการประเมิน (Enterprise Valuation): ${moneyFull(sm.companyValuation || 18000000)} • ราคาหุ้นประเมิน ฿${(sm.sharePriceBaht || 18).toFixed(2)}/หุ้น • อันดับเครดิตองค์กร: ${sm.creditRating || "BBB+"} • ความพร้อมเข้าตลาดหลักทรัพย์ (IPO Readiness): ${sm.ipoReadinessPct || 22}%`,
          ),
        );
        for (const idx of Object.values(sm.indices || {})) {
          const sign = idx.changePct >= 0 ? "+" : "";
          stockCard.append(
            el(
              "div",
              "logrow",
              `📊 [${idx.symbol}] ${idx.nameTh}: ${idx.value.toFixed(1)} จุด (${sign}${idx.changePct.toFixed(1)}%)`,
            ),
          );
        }
        body.replaceChildren(govCard, stockCard);
        return;
      }

      const c = el("div", "card");
      const ceo = v.people.find((p) => p.employed && p.role === "coordinator");
      const dir = v.externalWorld?.ceoDirective;
      c.append(
        el("h3", "", ceo ? "ผู้บริหารสูงสุด (CEO): " + (ceo.identity?.displayName || ceo.name) : "ยังไม่มีผู้บริหาร"),
        el("div", "muted", "บริษัทดำเนินงานอัตโนมัติตามนิสัยและค่านิยมของ CEO และหัวหน้าแผนก ผู้เล่นสามารถเฝ้าดูการตัดสินใจและโลกธุรกิจได้"),
        el("div", "logrow", "เงินสด " + moneyFull(v.company.cash) + " • หนี้ " + moneyFull(v.company.debt)),
        el("div", "logrow", "ลำดับความสำคัญ: " + v.policies.workPriority + " • เพดาน OT " + v.policies.overtimeHours + " ชั่วโมง"),
      );
      if (dir) {
        c.append(
          el("div", "logrow", `🧭 เข็มทิศกลยุทธ์องค์กรปัจจุบัน: "${dir.nameTh}" — ${dir.descTh}`),
        );
      }
      if (Array.isArray(v.catalog?.ceoDirectives) && v.catalog.ceoDirectives.length) {
        const dirWrap = el("div", "");
        dirWrap.style.display = "flex";
        dirWrap.style.flexWrap = "wrap";
        dirWrap.style.gap = "6px";
        dirWrap.style.margin = "8px 0";
        for (const dSpec of v.catalog.ceoDirectives) {
          const isCur = dir && dir.id === dSpec.id;
          const b = el("button", "chip" + (isCur ? " g" : ""), `🧭 ${dSpec.nameTh}`);
          b.onclick = () =>
            dispatch(
              { type: "setCeoDirective", directiveId: dSpec.id },
              `เปลี่ยนเข็มทิศกลยุทธ์ CEO เป็น "${dSpec.nameTh}" แล้ว`,
            );
          dirWrap.append(b);
        }
        c.append(dirWrap);
      }
      const d = v.campus && v.campus.facilityDecision;
      if (d) {
        const b = v.campus.buildings.find((item) => item.id === d.facilityId);
        c.append(el("div", "logrow", (d.decision === "upgrade" ? "ลงทุน " : "รอการลงทุน ") + (b ? b.nameTh : d.facilityId) + " • " + d.reason + " • งบ " + money(d.cost)));
      } else c.append(el("div", "muted", "ผู้บริหารยังไม่มีการประเมินอาคารในรอบนี้"));
      body.replaceChildren(c);
      return;
    }

    if (uiState.sheetMode === "menu") {
      byId("shTitle").textContent = "⚙️ เมนูระบบ เซฟ/โหลด และศูนย์แก้ไข (Edit Hub)";
      setSheetTabs([
        { id: "sys", label: "จัดการเซฟและจำลองเวลา" },
        { id: "edit", label: "✏️ ศูนย์แก้ไข (Edit Hub)" },
      ]);

      if (uiState.subTab === "edit") {
        const inventory = el("div", "card edit-section");
        inventory.append(el("h3", "", "📦 เสกวัตถุดิบ"),
          el("div", "muted", "เลือกชนิดและจำนวนเพื่อเพิ่มเข้าในคลัง"));
        const mat = el("select");
        mat.setAttribute("aria-label", "เลือกวัตถุดิบ");
        for (const m of v.catalog.materials) {
          const option = el("option", "", m.nameTh + " • คงคลัง " + (v.inventory.materials[m.id] || 0));
          option.value = m.id;
          mat.append(option);
        }
        const qty = el("input");
        qty.type = "number"; qty.min = "1"; qty.max = "500"; qty.step = "1"; qty.value = "10";
        qty.setAttribute("aria-label", "จำนวนวัตถุดิบ");
        const add = el("button", "btn pri", "เสกวัตถุดิบ");
        add.type = "button";
        add.onclick = () => {
          const n = Number(qty.value);
          if (!Number.isInteger(n) || n < 1 || n > 500) return showToast("กรอกจำนวน 1–500 ชิ้น", true);
          dispatch({ type: "directorEdit", action: "grantMaterial", materialId: mat.value, quantity: n }, "เพิ่มวัตถุดิบเข้าคลังแล้ว");
        };
        inventory.append(mat, qty, add);

        const personCard = el("div", "card edit-section");
        personCard.append(el("h3", "", "👤 แก้ไขตัวละคร"));
        const chooser = el("select");
        chooser.setAttribute("aria-label", "เลือกตัวละคร");
        for (const p of v.people.filter((p) => p.employed).slice(0, 100)) {
          const option = el("option", "", p.name + " • " + p.roleName);
          option.value = p.id; chooser.append(option);
        }
        const target = v.people.find((p) => p.id === uiState.selectedPersonId && p.employed) || v.people.find((p) => p.employed);
        if (target) chooser.value = target.id;
        const nameInput = el("input");
        nameInput.type = "text"; nameInput.maxLength = 32;
        nameInput.setAttribute("aria-label", "ชื่อตัวละคร");
        const rename = el("button", "btn", "เปลี่ยนชื่อตัวละคร");
        rename.type = "button";
        rename.onclick = () => dispatch({ type: "directorEdit", action: "renamePerson", personId: chooser.value, name: nameInput.value }, "เปลี่ยนชื่อตัวละครแล้ว");
        const trait = el("select");
        trait.setAttribute("aria-label", "เลือกนิสัยหรือค่านิยม");
        for (const [group, dimensions] of [["personality", v.catalog.dimensions.personality], ["values", v.catalog.dimensions.values]]) {
          for (const d of dimensions) {
            const option = el("option", "", (group === "personality" ? "นิสัย: " : "ค่านิยม: ") + d.nameTh);
            option.value = group + ":" + d.id; trait.append(option);
          }
        }
        const traitValue = el("input");
        traitValue.type = "number"; traitValue.min = "0"; traitValue.max = "100"; traitValue.step = "1";
        traitValue.setAttribute("aria-label", "ค่านิสัยหรือค่านิยม");
        const syncPerson = () => {
          const selected = current.people.find((p) => p.id === chooser.value);
          const [group, key] = trait.value.split(":");
          nameInput.value = selected?.name || "";
          traitValue.value = String(selected?.profile?.[group]?.[key] ?? 50);
        };
        chooser.onchange = syncPerson;
        trait.onchange = syncPerson;
        syncPerson();
        const saveTrait = el("button", "btn", "บันทึกนิสัยหรือค่านิยม");
        saveTrait.type = "button";
        saveTrait.onclick = () => {
          const [group, key] = trait.value.split(":");
          const value = Number(traitValue.value);
          if (!Number.isFinite(value) || value < 0 || value > 100) return showToast("กรอกค่า 0–100", true);
          dispatch({ type: "directorEdit", action: "setTrait", personId: chooser.value, group, key, value }, "ปรับข้อมูลตัวละครแล้ว");
        };
        const skill = el("select");
        skill.setAttribute("aria-label", "เลือกทักษะ");
        for (const item of v.catalog.skills) {
          const option = el("option", "", item.nameTh);
          option.value = item.id; skill.append(option);
        }
        const restore = el("button", "btn", "ฟื้นฟูตัวละครที่เลือก");
        restore.type = "button";
        restore.onclick = () => dispatch({ type: "directorEdit", action: "refreshPerson", personId: chooser.value }, "ฟื้นฟูตัวละครที่เลือกแล้ว");
        const train = el("button", "btn pri", "เพิ่มประสบการณ์ทักษะ");
        train.type = "button";
        train.onclick = () => dispatch({ type: "directorEdit", action: "trainSkill", personId: chooser.value, skillId: skill.value, delta: 15 }, "เพิ่มประสบการณ์ทักษะแล้ว");
        const promoBtn = el("button", "btn", "⬆️ เลื่อนตำแหน่ง +1 ขั้น (Lv.1–Lv.10)");
        promoBtn.type = "button";
        promoBtn.onclick = () => dispatch({ type: "directorEdit", action: "promotePerson", personId: chooser.value }, "เลื่อนตำแหน่งตัวละครที่เลือกแล้ว");
        personCard.append(chooser, nameInput, rename, trait, traitValue, saveTrait, skill, restore, train, promoBtn);

        const scaleCard = el("div", "card edit-section");
        scaleCard.append(
          el("h3", "", "🚀 ขยายสเกลพนักงาน & ก่อสร้างอาคารนิคม (รองรับสูงสุด 500 NPC)"),
          el("div", "muted", "ทดสอบการขยายขนาดองค์กรสู่ระดับ 50–500 คน หรือสั่งก่อสร้างคลังและไลน์การผลิตใหม่ทันที"),
        );
        const scaleBtnRow = el("div", "");
        scaleBtnRow.style.display = "flex";
        scaleBtnRow.style.flexWrap = "wrap";
        scaleBtnRow.style.gap = "6px";
        scaleBtnRow.style.marginTop = "6px";
        for (const cnt of [25, 100, 300, 500]) {
          const sb = el("button", "btn", `👥 ขยายเป็น ${cnt} คน`);
          sb.type = "button";
          sb.onclick = () =>
            dispatch(
              { type: "directorEdit", action: "scaleHeadcount", targetCount: cnt },
              `ขยายขนาดองค์กรเป็น ${cnt} คนเรียบร้อยแล้ว`,
            );
          scaleBtnRow.append(sb);
        }
        scaleCard.append(scaleBtnRow);

        const plotBtnRow = el("div", "");
        plotBtnRow.style.display = "flex";
        plotBtnRow.style.flexWrap = "wrap";
        plotBtnRow.style.gap = "6px";
        plotBtnRow.style.marginTop = "8px";
        for (const pl of v.campus?.expansionPlots || []) {
          if (pl.constructed) continue;
          const pb = el("button", "btn", `🏗️ สร้าง${pl.shortNameTh}`);
          pb.type = "button";
          pb.onclick = () =>
            dispatch(
              { type: "directorEdit", action: "constructPlot", plotId: pl.id },
              `ก่อสร้าง ${pl.nameTh} สำเร็จแล้ว`,
            );
          plotBtnRow.append(pb);
        }
        scaleCard.append(plotBtnRow);

        const extAssetEditCard = el("div", "card edit-section");
        extAssetEditCard.append(
          el("h3", "", "🌾 เสก/เข้าถือครองสินทรัพย์ภายนอกทันที (Sandbox External Assets)"),
          el("div", "muted", "คลิกเพื่อเข้าถือครองไร่ข้าว สวนปาล์ม ไร่อ้อย ฟาร์มโคนม เหมืองแร่ โซลาร์ฟาร์ม หรือท่าเรือทันทีโดยไม่ต้องรอเก็บเงิน"),
        );
        const assetBtnRow = el("div", "");
        assetBtnRow.style.display = "flex";
        assetBtnRow.style.flexWrap = "wrap";
        assetBtnRow.style.gap = "6px";
        assetBtnRow.style.marginTop = "6px";
        for (const a of v.catalog?.externalAssets || []) {
          const ab = el("button", "btn" + (a.owned ? " pri" : ""), `${a.icon} ${a.owned ? "อัปเกรด " : "เข้าถือครอง "}${a.shortNameTh}`);
          ab.type = "button";
          ab.onclick = () =>
            dispatch(
              { type: "directorEdit", action: "acquireExternalAsset", assetId: a.id, upgrade: a.owned, freeGrant: true },
              `${a.owned ? "อัปเกรด" : "เข้าถือครอง"} ${a.nameTh} สำเร็จแล้ว`,
            );
          assetBtnRow.append(ab);
        }
        extAssetEditCard.append(assetBtnRow);

        body.replaceChildren(inventory, personCard, scaleCard, extAssetEditCard);
        return;
      }

      const c = el("div", "card");
      c.append(el("h3", "", "⏱️ ข้ามเวลาและบริหารจัดการไฟล์บันทึก (100% Offline)"));
      const row1 = el("div", "");
      const bHour = el("button", "btn", "⏩ จำลองทันที +1 ชั่วโมง");
      bHour.onclick = () => byId("advance-hour").click();
      const bDay = el("button", "btn pri", "⏭️ จำลองทันที +1 วัน");
      bDay.onclick = () => byId("advance-day").click();
      row1.append(bHour, bDay);

      const row2 = el("div", "");
      row2.style.marginTop = "8px";
      const bSave = el("button", "btn pri", "💾 บันทึกในเครื่อง");
      bSave.onclick = () => byId("save-local").click();
      const bLoad = el("button", "btn", "📂 โหลดเซฟในเครื่อง");
      bLoad.onclick = () => byId("load-local").click();
      const bExp = el("button", "btn", "⬇️ ส่งออกไฟล์ JSON");
      bExp.onclick = () => byId("export-save").click();
      const bAudit = el("button", "btn", "✅ ตรวจบัญชีและแกนระบบ");
      bAudit.onclick = () => byId("audit").click();
      row2.append(bSave, bLoad, bExp, bAudit);

      const row3 = el("div", "");
      row3.style.marginTop = "10px";
      row3.append(el("div", "muted", "เริ่มบริษัทใหม่ด้วย Seed และขนาดทีมเริ่มต้นที่ต้องการ:"));
      const seedInp = el("input");
      seedInp.value = v.seed || "company-demo";
      seedInp.style.marginTop = "4px";
      const bLean = el("button", "btn pri", "🌱 เริ่มบริษัทใหม่ (โหมดก่อตั้ง 5 คน)");
      bLean.style.marginTop = "6px";
      bLean.onclick = () => {
        app.newGame(seedInp.value || "company-demo", { autonomous: true, startupMode: "lean", starterCount: 5 });
        app.dispatch({ type: "setPolicy", key: "autoAccept", value: true });
        app.setSpeed(1);
        paint(app.snapshot());
        showToast("🌱 เริ่มบริษัทใหม่ในโหมดก่อตั้ง 5 คน (CEO + ออฟฟิศ + โรงงาน) แล้ว");
      };
      const bNew = el("button", "btn dan", "🔄 เริ่มบริษัทใหม่ (โหมดมาตรฐาน 8 คน)");
      bNew.style.marginTop = "6px";
      bNew.onclick = () => {
        if (byId("seed")) byId("seed").value = seedInp.value || "company-demo";
        byId("new-game").click();
      };
      row3.append(seedInp, bLean, bNew);

      c.append(row1, row2, row3);
      body.replaceChildren(c);
    }
  }

  function syncCompatControls(v) {
    const offersBox = byId("offers");
    if (offersBox) {
      offersBox.replaceChildren(
        ...v.offers.map((o) => {
          const b = el("button", "", "accept");
          b.type = "button";
          b.onclick = () => dispatch({ type: "acceptOffer", offerId: o.id });
          return b;
        }),
      );
    }
  }

  function paint(v) {
    if (v && v.status === "won") {
      app.dispatch({ type: "continueEndless" });
      v = app.snapshot();
      showToast("🏆 ยินดีด้วย! บริษัทปลดหนี้และพ้นวิกฤตสำเร็จ — เปิดโหมดขยายอาณาจักรไร้ขีดจำกัด (Endless Empire) ต่อเนื่องทันที!");
    }
    current = v;
    lastPaint = performance.now();
    renderTopHud(v);
    renderSelectionBanner(v);
    syncCompatControls(v);
    if (uiState.sheetOpen && !(uiState.sheetMode === "menu" && uiState.subTab === "edit")) renderActiveSheet(v);
  }

  document.querySelectorAll("#speedBar button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const spd = Number(btn.dataset.speed);
      if (spd > 0 && !current.policies.autoAccept) {
        app.dispatch({ type: "setPolicy", key: "autoAccept", value: true });
      }
      app.setSpeed(spd);
      paint(app.snapshot());
    });
  });

  document.querySelectorAll("#hudBottom button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nav = btn.dataset.nav;
      if (uiState.sheetOpen && uiState.sheetMode === nav) {
        closeSheet();
      } else {
        openSheet(nav);
      }
    });
  });

  if (byId("tickerBtn")) {
    byId("tickerBtn").onclick = () => openSheet("log", "events");
  }
  if (byId("shClose")) byId("shClose").onclick = closeSheet;
  if (byId("shTall")) {
    byId("shTall").onclick = () => byId("sheet")?.classList.toggle("tall");
  }

  if (byId("fZoomIn")) byId("fZoomIn").onclick = () => renderer?.zoomBy(1.18);
  if (byId("fZoomOut")) byId("fZoomOut").onclick = () => renderer?.zoomBy(0.85);
  if (byId("fHome")) byId("fHome").onclick = () => renderer?.centerCamera();
  if (byId("fFollow")) {
    byId("fFollow").onclick = () => {
      if (!renderer) return;
      const targetId = uiState.selectedPersonId || current.people[0]?.id;
      const activeFollow = renderer.setFollow(targetId);
      byId("fFollow").classList.toggle("on", Boolean(activeFollow));
      showToast(activeFollow ? "กำลังติดตามพนักงานบนแผนที่" : "ยกเลิกการล็อกกล้องติดตาม");
    };
  }

  if (renderer) {
    renderer.bindInteractions({
      onSelectPerson: (personId) => {
        uiState.selectedPersonId = personId;
        paint(current);
        openPersonSheet(personId);
      },
      onSelectBuilding: (buildingId) => {
        uiState.selectedBuildingId = buildingId;
        openBuildingSheet(buildingId);
      },
    });
  }

  if (byId("new-game")) {
    byId("new-game").onclick = () => {
      app.newGame(byId("seed")?.value || "company-demo", { autonomous: true });
      app.dispatch({ type: "setPolicy", key: "autoAccept", value: true });
      app.setSpeed(1);
      paint(app.snapshot());
      showToast("เริ่มบริษัทใหม่ในโหมด NPC บริหารอัตโนมัติแล้ว");
    };
  }
  if (byId("speed")) {
    byId("speed").onchange = () => {
      app.setSpeed(Number(byId("speed").value));
      paint(app.snapshot());
    };
  }
  if (byId("advance-hour")) {
    byId("advance-hour").onclick = () => {
      app.advance(60);
      paint(app.snapshot());
    };
  }
  if (byId("advance-day")) {
    byId("advance-day").onclick = () => {
      app.advance(1440);
      paint(app.snapshot());
    };
  }
  if (byId("save-local")) {
    byId("save-local").onclick = () => {
      try {
        localStorage.setItem("company-foundation-review", app.save());
        showToast("บันทึกสถานะบริษัทลงในเครื่องแล้ว");
      } catch (e) {
        showToast("บันทึกในเครื่องไม่ได้: " + e.message, true);
      }
    };
  }
  if (byId("load-local")) {
    byId("load-local").onclick = () => {
      try {
        const text = localStorage.getItem("company-foundation-review");
        if (!text) {
          showToast("ยังไม่มีเซฟในเครื่อง", true);
          return;
        }
        const result = app.load(text);
        showToast(result.ok ? "โหลดเซฟสำเร็จแล้ว" : result.message, !result.ok);
        if (result.ok) paint(app.snapshot());
      } catch (e) {
        showToast(e.message, true);
      }
    };
  }
  if (byId("export-save")) {
    byId("export-save").onclick = () => {
      const blob = new Blob([app.save()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = el("a");
      link.href = url;
      link.download = "company-campus-save.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }
  if (byId("import-save")) {
    byId("import-save").onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > CompanySave.MAX_BYTES) {
        showToast("ไฟล์เซฟใหญ่เกินขีดจำกัด", true);
        return;
      }
      const result = app.load(await file.text());
      showToast(result.ok ? "นำเข้าเซฟแล้ว" : result.message, !result.ok);
      if (result.ok) paint(app.snapshot());
      event.target.value = "";
    };
  }
  if (byId("audit")) {
    byId("audit").onclick = () => {
      const errors = app.audit();
      showToast(
        errors.length
          ? errors.join("; ")
          : "ตรวจข้อมูล บัญชี วัตถุดิบ และแกนมนุษย์: ผ่าน 100%",
        errors.length > 0,
      );
    };
  }

  document.addEventListener("visibilitychange", () => app.resetClock());
  app.subscribe((v) => {
    pending = v;
  });
  paint(current);

  const bootTime = performance.now();
  function frame(t) {
    if (!autoStarted && t - bootTime > 1400) {
      autoStarted = true;
      if (!current.policies.autoAccept && current.orders.length === 0) {
        app.dispatch({ type: "setPolicy", key: "autoAccept", value: true });
        pending = app.snapshot();
      }
      if (app.getSpeed() === 0) {
        app.setSpeed(1);
        paint(app.snapshot());
      }
    }
    if (!document.hidden && autoStarted) app.frame(t);
    if (pending !== current && t - lastPaint >= 180) paint(pending);
    if (renderer) {
      renderer.render(current, t, {
        personId: uiState.selectedPersonId,
        buildingId: uiState.selectedBuildingId,
        trackedIds: uiState.trackedIds,
        speed: app.getSpeed(),
      });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.CompanyDebug = Object.freeze({
    app,
    refresh: () => paint(app.snapshot()),
    openPersonSheet,
    openBuildingSheet,
    toggleTrackedPerson,
  });
  window.CompanyGame = window.CompanyDebug;
})();
