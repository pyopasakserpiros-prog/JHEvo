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
      eff: "เพิ่มโอกาสได้ราคาต่อหน่วยสูงขึ้น และประเมินความคุ้มค่าของดีลลูกค้าได้แม่นยำ",
      train: "เจรจาหาลูกค้าที่อาคารสำนักงานใหญ่ / ศึกษาด้วยตนเอง",
    },
    admin: {
      eff: "เร่งความเร็วการออกใบสั่งซื้อวัตถุดิบ (PO) และการวางบิลเรียกเก็บเงินลูกค้า (Invoice)",
      train: "งานเอกสารจัดซื้อและวางบิลที่อาคารสำนักงานใหญ่",
    },
    engineering: {
      eff: "เพิ่มแต้มวิจัย R&D ต่อรอบ เพื่อปลดล็อกแบบแปลนผลิตภัณฑ์ใหม่ที่มีกำไรสูง",
      train: "วิจัยและพัฒนาที่อาคารแล็บวิจัย (R&D Lab)",
    },
    assembly: {
      eff: "เพิ่มความเร็วในการประกอบชิ้นงานและเพิ่มโอกาสได้คุณภาพพื้นฐานสูง",
      train: "ประกอบลำโพง/โคมไฟ และงานซ่อม (Rework) ที่อาคารโรงงานผลิต",
    },
    quality: {
      eff: "เพิ่มความแม่นยำในการคัดกรองของเสีย (QC) ป้องกันสินค้าหลุดสเปก",
      train: "ตรวจสอบคุณภาพชิ้นงานที่แท่นตรวจ QC ในโรงงาน",
    },
    logistics: {
      eff: "เร่งความเร็วการแพ็กสินค้าลงกล่องและการขนส่งสินค้าขึ้นรถบรรทุก",
      train: "งานแพ็กเกจจิ้งและจัดส่งที่คลังสินค้าและท่าเทียบรถ",
    },
    leadership: {
      eff: "เพิ่มประสิทธิภาพเมื่อเดินไปช่วยเพื่อนร่วมงาน (Collaboration Multiplier) และประสานงานทีม",
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
    newsMode: "ALL", // 'ALL' | 'MAJOR_ONLY' | 'OPS_FINANCE' | 'TRACKED_ONLY' | 'QUIET_DIGEST'
    newsCategory: "ALL", // 'ALL' | 'SALES' | 'PROD' | 'SUPPLY' | 'HR_CULTURE' | 'FINANCE' | 'RND'
    digestPeriod: "d1", // 'd1' | 'd7' | 'd30'
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
          val: `${employedCount}/${v.catalog.rules?.maxPeople || 30}`,
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
        const nm = el("div", "", `${isTracked ? "⭐ " : ""}${p.emoji} ${p.name} (${p.roleName})`);
        nm.style.fontWeight = "700";
        const sub = el("div", "muted", p.activityLabelTh);
        info.append(nm, sub);

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

    const bld = (v.campus?.buildings || []).find((b) => b.id === p.buildingId);
    const isTracked = uiState.trackedIds.has(p.id);
    const pi = el("div", "pi");
    const nm = el("div", "nm");
    nm.append(
      el("span", "", `${isTracked ? "⭐ " : ""}${p.name}`),
      el("span", "chip g", p.roleName),
      el("span", "chip b", `${bld ? bld.icon + " " + bld.shortNameTh : p.zoneId}`),
    );
    const sub = el("div", "sub", `${p.emoji} ${p.activityLabelTh} • ค่าแรง ${money(p.pay.dailyWage)}/วัน`);

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
    byId("shTitle").textContent = `${isTracked ? "⭐ " : ""}${p.name} • ${p.roleName}`;

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

    // Header Card with Portrait, Pin Star & Quick Switcher
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
    const bld = (v.campus?.buildings || []).find((b) => b.id === p.buildingId);
    const titleLine = el("div", "", `${p.name} (${p.roleName})`);
    titleLine.style.fontWeight = "700";
    titleLine.style.fontSize = "15px";
    const locLine = el(
      "div",
      "muted",
      `${bld ? bld.icon + " " + bld.nameTh : ""} • ${p.isIndoors ? "ปฏิบัติงานในอาคาร" : "อยู่กลางแจ้ง"}`,
    );
    const actLine = el("div", "", `${p.emoji} ${p.activityLabelTh}`);
    actLine.style.color = "#eccf82";
    actLine.style.fontSize = "12.5px";
    actLine.style.marginTop = "2px";
    meta.append(titleLine, locLine, actLine);

    const pinBtn = el("button", "btn" + (isTracked ? " pri" : ""), isTracked ? "⭐ ติดตามอยู่" : "☆ ปักหมุดติดตาม");
    pinBtn.onclick = () => toggleTrackedPerson(p.id);

    topRow.append(pt, meta, pinBtn);

    const switchRow = el("div", "");
    switchRow.style.marginTop = "8px";
    switchRow.style.display = "flex";
    switchRow.style.gap = "4px";
    switchRow.style.flexWrap = "wrap";
    for (const emp of v.people.filter((x) => x.employed)) {
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
        el("h3", "", "ตำแหน่งและค่าจ้าง"),
        el("div", "muted", p.roleName + " • " + moneyFull(p.pay.dailyWage) + " / วัน"),
      );
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
      const others = v.people.filter((x) => x.id !== p.id);
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
      // JS2-Style Employee Comparison Tab (เทียบกับ...)
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
        for (const o of others) {
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

  /* ---------- 2. Building Inspect Drawer (When Clicking a Building on Map) ---------- */
  function renderBuildingSheet(v, body) {
    const buildings = v.campus?.buildings || [];
    const b = buildings.find((x) => x.id === uiState.selectedBuildingId) || buildings[0];
    if (!b) return;
    byId("shTitle").textContent = `${b.icon} ${b.nameTh}`;

    setSheetTabs([
      { id: "inside", label: "ภายในอาคาร & ผู้คน" },
      { id: "stations", label: "สถานีและเครื่องจักร" },
      { id: "manage", label: "สลับดูอาคารอื่น" },
    ]);

    const nodes = [];
    const headCard = el("div", "card");
    headCard.append(
      el("h3", "", `${b.icon} ${b.nameTh}${b.id === "gate" ? "" : ` • ระดับ ${b.level}`} (${b.subtitleTh})`),
      el(
        "div",
        "muted",
        `พนักงานประจำ/ในอาคารตอนนี้: ${b.totalAssignedCount} คน (อยู่ในตัวอาคาร ${b.indoorCount} คน) • งานที่กำลังเดินเครื่อง ${b.activeJobCount} งาน`,
      ),
    );
    const benefits = {
      hq: "ระดับที่สูงขึ้นช่วยให้งานขายและธุรการคืบหน้าเร็วขึ้น",
      factory: "ระดับที่สูงขึ้นช่วยให้งานประกอบ ซ่อม และตรวจคุณภาพคืบหน้าเร็วขึ้น",
      warehouse: "ระดับที่สูงขึ้นช่วยให้งานแพ็กและจัดส่งคืบหน้าเร็วขึ้น",
      rnd: "ระดับที่สูงขึ้นช่วยให้งานวิจัยคืบหน้าเร็วขึ้น",
      canteen: "โรงอาหารระดับสูงช่วยลดความหิวระหว่างมื้ออาหารมากขึ้น",
      courtyard: "สวนระดับสูงช่วยให้พนักงานคลายเครียดและฟื้นพลังได้มากขึ้น",
      training: "พนักงานที่ว่างสามารถเดินมาฝึกทักษะที่นี่; ระดับสูงช่วยเพิ่มผลการฝึก",
    };
    if (benefits[b.id]) headCard.append(el("div", "muted", benefits[b.id]));
    if (b.id === "training") headCard.append(el("div", "muted", `เวลาฝึกสะสม ${v.campus.trainingMinutes} นาที`));
    const decision = v.campus?.facilityDecision;
    if (decision && decision.facilityId === b.id) {
      const ceo = v.people.find((p) => p.id === decision.personId);
      headCard.append(el("div", "logrow", `${ceo?.name || "ผู้บริหาร"}: ${decision.decision === "upgrade" ? "ตัดสินใจลงทุน" : "รอการลงทุน"} • ${decision.reason} • งบ ${money(decision.cost)}`));
    }
    nodes.push(headCard);

    if (uiState.subTab === "inside") {
      const specCard = el("div", "card");
      if (b.id === "hq") {
        specCard.append(el("h3", "", "📊 สถานะฝ่ายบริหาร ฝ่ายขาย และบัญชี"));
        specCard.append(
          el(
            "div",
            "muted",
            `ข้อเสนอลูกค้าที่ฝ่ายขายกำลังประเมิน: ${v.offers.length} ดีล • ออเดอร์กำลังผลิต: ${v.orders.filter((o) => o.status === "accepted").length} รายการ • รายรับรอเก็บ (Invoices): ${moneyFull(v.company.receivable)}`,
          ),
        );
        for (const o of v.offers.slice(0, 5)) {
          const prod = v.catalog.products.find((p) => p.id === o.productId);
          specCard.append(
            el(
              "div",
              "logrow",
              `💼 ${o.customerName}: สั่ง ${prod?.nameTh || o.productId} ×${o.quantity} ชิ้น (${money(o.unitPrice)}/ชิ้น) • ฝ่ายขายประเมินอัตโนมัติ`,
            ),
          );
        }
      } else if (b.id === "factory") {
        specCard.append(el("h3", "", "⚙️ สถิติสายการผลิตและการตรวจสอบคุณภาพ (QC)"));
        const completed = Object.values(v.production.completed || {}).reduce((a, n) => a + n, 0);
        const shipped = Object.values(v.production.shipped || {}).reduce((a, n) => a + n, 0);
        const scrapped = Object.values(v.production.scrapped || {}).reduce((a, n) => a + n, 0);
        specCard.append(
          el(
            "div",
            "muted",
            `ประกอบและแพ็กสำเร็จสะสม: ${completed} ชิ้น • ส่งมอบแล้ว: ${shipped} ชิ้น • ตัดเป็นของเสีย (Scrap): ${scrapped} ชิ้น`,
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
      } else if (b.id === "warehouse") {
        specCard.append(el("h3", "", "📦 สต็อกวัตถุดิบ สินค้าสำเร็จรูป และรถขนส่ง"));
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
            el("div", "ic", prod.id === "lamp" ? "💡" : "🔊"),
            el("div", "nm", prod.nameTh),
            el("span", "inv-b-br", `×${fin}`),
          );
          grid.append(cell);
        }
        specCard.append(grid);
        const transits = v.purchases.filter((p) => p.status !== "received");
        for (const tr of transits) {
          const m = v.catalog.materials.find((x) => x.id === tr.materialId);
          specCard.append(
            el(
              "div",
              "logrow",
              `🚚 พัสดุ ${m?.nameTh || tr.materialId} ×${tr.quantity} ชิ้น • สถานะ: ${tr.status === "transit" ? "กำลังขนส่งมาที่คลัง" : "กำลังออกใบ PO"}`,
            ),
          );
        }
      } else if (b.id === "canteen") {
        specCard.append(el("h3", "", "🍱 บรรยากาศโรงอาหารและมุมกาแฟพนักงาน"));
        specCard.append(
          el(
            "div",
            "muted",
            `งบสวัสดิการอาหารกลางวันปัจจุบัน: ${money(v.policies.wellbeingDaily)}/คน/วัน • พนักงานจะเดินมากินมื้อเที่ยงเวลา 12:00–13:00 น. และแวะจิบกาแฟพูดคุยเมื่อเหนื่อยล้า`,
          ),
        );
      } else if (b.id === "rnd") {
        specCard.append(el("h3", "", "🔬 ความก้าวหน้าการวิจัยและพัฒนา (R&D Lab)"));
        specCard.append(
          makeBarRow("แต้มวิจัยสะสม (เป้าหมาย 300)", clamp((v.research.points / 300) * 100), 100, false),
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
        specCard.append(el("h3", "", "🌿 พื้นที่ส่วนกลางและการสัญจรของนิคม"));
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
        for (const p of occupants) occCard.append(makePersonRow(v, p));
      }
      nodes.push(occCard);
    } else if (uiState.subTab === "stations") {
      const stCard = el("div", "card");
      stCard.append(el("h3", "", "🏭 สถานีทำงานภายในอาคาร"));
      const stations = Object.values(v.scene.layout.stations).filter(
        (s) => b.stationIds.includes(s.id) || b.stationKinds.includes(s.kind),
      );
      for (const s of stations) {
        const workers = v.people.filter((p) => p.employed && p.stationId === s.id);
        const r = el("div", "logrow");
        r.append(
          el("strong", "", `สถานี ${s.id} (${s.kind})`),
          el(
            "div",
            "muted",
            `ความจุ ${workers.length}/${s.capacity} คน • ผู้ใช้งาน: ${workers.map((w) => w.name).join(", ") || "ว่าง"}`,
          ),
        );
        stCard.append(r);
      }
      nodes.push(stCard);
    } else if (uiState.subTab === "manage") {
      const navCard = el("div", "card");
      navCard.append(el("h3", "", "🏢 เลือกตรวจสอบอาคารอื่นในนิคม"));
      for (const other of buildings) {
        const row = el("div", "prow");
        row.append(
          el("div", "nm", `${other.icon} ${other.nameTh}`),
          el("span", "chip g", `👥 ${other.totalAssignedCount} คน`),
        );
        row.onclick = () => openBuildingSheet(other.id);
        navCard.append(row);
      }
      nodes.push(navCard);
    }

    body.replaceChildren(...nodes);
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
      byId("shTitle").textContent = "👥 ทำเนียบพนักงานและฝ่ายบุคคลอัตโนมัติ";
      setSheetTabs([
        { id: "roster", label: `พนักงานปัจจุบัน (${v.people.filter((p) => p.employed).length})` },
        { id: "hr", label: "ระบบสรรหาอัตโนมัติ (HR)" },
      ]);
      if (uiState.subTab === "hr") {
        const c = el("div", "card");
        c.append(
          el("h3", "", "🤝 ระบบฝ่ายบุคคลและผู้บริหารสรรหาคนอัตโนมัติ"),
          el(
            "div",
            "muted",
            "ตามกฎ Autonomous NPC: ผู้เล่นไม่ต้องกดรับสมัครเอง เมื่อปริมาณงานค้างสะสมล้นมือต่อเนื่องและกระแสเงินสดมี Runway > 30 วัน ฝ่ายบุคคลและ CEO จะคัดเลือกผู้สมัครด้านล่างเข้าทำงานโดยอัตโนมัติ",
          ),
        );
        for (const cand of v.candidates || []) {
          const item = el("div", "logrow");
          item.append(
            el("strong", "", `ผู้สมัคร: ${cand.name}`),
            el("div", "muted", `ค่าแรงที่คาดหวัง ${money(cand.dailyWage)}/วัน • พร้อมเข้าสัมภาษณ์เมื่อบริษัทขยายทีม`),
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
        filterRow.style.marginBottom = "8px";
        filterRow.append(el("h3", "", "แตะที่ชื่อพนักงานเพื่อเปิดดูแผ่นประวัติ หรือกด ⭐ เพื่อปักหมุดติดตาม"));
        const trkToggle = el(
          "button",
          "chip" + (uiState.peopleFilterTrackedOnly ? " g" : ""),
          `⭐ เฉพาะที่ติดตาม (${uiState.trackedIds.size})`,
        );
        trkToggle.onclick = () => {
          uiState.peopleFilterTrackedOnly = !uiState.peopleFilterTrackedOnly;
          renderActiveSheet(current);
        };
        filterRow.append(trkToggle);
        c.append(filterRow);

        const list = v.people.filter(
          (x) => x.employed && (!uiState.peopleFilterTrackedOnly || uiState.trackedIds.has(x.id)),
        );
        if (!list.length) {
          c.append(el("div", "muted", "ยังไม่มีพนักงานที่ปักหมุดติดตาม กดปุ่ม ☆ ติดตาม ท้ายชื่อพนักงานเพื่อปักหมุด"));
        } else {
          for (const p of list) {
            c.append(makePersonRow(v, p));
          }
        }
        body.replaceChildren(c);
      }
      return;
    }

    if (uiState.sheetMode === "campus") {
      byId("shTitle").textContent = "🏢 อาคารและผังนิคมอุตสาหกรรม";
      setSheetTabs([
        { id: "buildings", label: `อาคารทั้ง ${v.campus?.buildings?.length || 0} แห่ง` },
        { id: "expand", label: "การขยายนิคมและสถานี" },
      ]);
      if (uiState.subTab === "expand") {
        const c = el("div", "card");
        c.append(
          el("h3", "", "🏗️ การลงทุนขยายพื้นที่นิคมบริษัท"),
          el(
            "div",
            "muted",
            `ขนาดพื้นที่ปัจจุบัน: ${v.scene.layout.width} × ${v.scene.layout.height} ช่อง • สถานีทำงานรวม ${Object.keys(v.scene.layout.stations).length} จุด`,
          ),
        );
        c.append(el("div", "muted", "พื้นที่เริ่มต้นกว้างขึ้นแล้ว การลงทุนในอาคารเป็นการตัดสินใจของ CEO ตามเงินสำรองและความต้องการของบริษัท"));
        body.replaceChildren(c);
      } else {
        const c = el("div", "card");
        c.append(el("h3", "", "คลิกที่อาคารเพื่อส่องดูพนักงานและสายงานภายใน"));
        for (const b of v.campus?.buildings || []) {
          const row = el("div", "prow");
          const pi = el("div", "pi");
          pi.append(
            el("div", "nm", `${b.icon} ${b.nameTh}`),
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
        // JS2-Adapted Periodic Digest (1 / 7 / 30 Days across 4 accounts)
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

      // Default 'events' sub-tab: JS2 Living Corporate Chronicle with Epistemic Badges & 5-Mode News Filter
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
        ["FINANCE", "การเงิน"],
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
      byId("shTitle").textContent = "📦 ตลาดออเดอร์ คลังสินค้า และแบบแปลน R&D";
      setSheetTabs([
        { id: "orders", label: "ออเดอร์ & ดีลลูกค้า" },
        { id: "stock", label: "คลังวัตถุดิบ & รถขนส่ง" },
        { id: "rnd", label: "แบบแปลนวิจัย (R&D)" },
      ]);
      const c = el("div", "card");
      if (uiState.subTab === "stock") {
        c.append(el("h3", "", "📦 คลังวัตถุดิบและสินค้าสำเร็จรูป (ฝ่ายจัดซื้อดูแลอัตโนมัติ)"));
        const grid = el("div", "inv-grid");
        for (const m of v.catalog.materials) {
          const qty = v.inventory.materials[m.id] || 0;
          const res = v.inventory.reserved[m.id] || 0;
          const cell = el("div", "inv-cell");
          cell.append(
            el("span", "inv-b-tl", money(m.unitCost)),
            el("span", "inv-b-tr", `จอง ${res}`),
            el("div", "ic", "🔩"),
            el("div", "nm", m.nameTh),
            el("span", "inv-b-br", `×${qty}`),
          );
          grid.append(cell);
        }
        c.append(grid);
      } else if (uiState.subTab === "rnd") {
        c.append(
          el("h3", "", `🔬 คลังแบบแปลนผลิตภัณฑ์ (${v.research.points.toFixed(0)} แต้มวิจัย)`),
          makeBarRow("ความก้าวหน้าโคมไฟปรับแสง (300 แต้ม)", clamp((v.research.points / 300) * 100), 100, false),
        );
        for (const prod of v.catalog.products) {
          c.append(
            el(
              "div",
              "logrow",
              `${prod.unlocked ? "✅ พร้อมผลิตและขาย" : "🔒 ต้องวิจัย 300 แต้ม"}: ${prod.nameTh} • ราคาขาย ${money(prod.priceMin)}–${money(prod.priceMax)} (ต้นทุน BOM ${money(prod.bomCost)})`,
            ),
          );
        }
      } else {
        c.append(
          el("h3", "", "🤝 ออเดอร์ลูกค้า (ฝ่ายขายเจรจาและเซ็นรับอัตโนมัติ)"),
          el(
            "div",
            "muted",
            `ออเดอร์ที่ชำระเงินแล้วสะสม: ${v.company.metrics.ordersPaid} ออเดอร์ • ข้อเสนอรอฝ่ายขายพิจารณา: ${v.offers.length} รายการ`,
          ),
        );
        for (const o of [...(v.orders || [])].slice(-12).reverse()) {
          const prod = v.catalog.products.find((p) => p.id === o.productId);
          c.append(
            el(
              "div",
              "logrow",
              `📦 ${o.id}: ${prod?.nameTh || o.productId} ×${o.quantity} ชิ้น • ยอดรวม ${money(o.total)} • สถานะ: ${o.status}`,
            ),
          );
        }
      }
      body.replaceChildren(c);
      return;
    }

    if (uiState.sheetMode === "policy") {
      byId("shTitle").textContent = "⚖️ การตัดสินใจของผู้บริหาร";
      setSheetTabs([{ id: "directives", label: "สถานะบริษัทและ CEO" }]);
      const c = el("div", "card");
      const ceo = v.people.find((p) => p.employed && p.role === "coordinator");
      c.append(
        el("h3", "", ceo ? "ผู้บริหาร: " + ceo.name : "ยังไม่มีผู้บริหาร"),
        el("div", "muted", "บริษัทดำเนินงานเอง ผู้เล่นเฝ้าดูการตัดสินใจและเหตุการณ์ได้"),
        el("div", "logrow", "เงินสด " + moneyFull(v.company.cash) + " • หนี้ " + moneyFull(v.company.debt)),
        el("div", "logrow", "ลำดับความสำคัญ: " + v.policies.workPriority + " • เพดาน OT " + v.policies.overtimeHours + " ชั่วโมง"),
      );
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
        for (const p of v.people.filter((p) => p.employed)) {
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
        personCard.append(chooser, nameInput, rename, trait, traitValue, saveTrait, skill, restore, train);
        body.replaceChildren(inventory, personCard);
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
      row3.append(el("div", "muted", "เริ่มบริษัทใหม่ด้วย Seed ที่กำหนด:"));
      const seedInp = el("input");
      seedInp.value = v.seed || "company-demo";
      seedInp.style.marginTop = "4px";
      const bNew = el("button", "btn dan", "🔄 เริ่มบริษัทใหม่");
      bNew.style.marginTop = "6px";
      bNew.onclick = () => {
        if (byId("seed")) byId("seed").value = seedInp.value || "company-demo";
        byId("new-game").click();
      };
      row3.append(seedInp, bNew);

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
      app.newGame(byId("seed")?.value || "company-demo");
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
