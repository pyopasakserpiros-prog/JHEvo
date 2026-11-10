(function () {
  "use strict";
  const app = CompanyAPI.create("company-demo"),
    byId = (id) => document.getElementById(id),
    money = (n) =>
      (n / 100).toLocaleString("th-TH", { maximumFractionDigits: 2 }) + " บาท";
  let current = app.snapshot(),
    pending = current,
    lastPaint = 0;
  const el = (tag, text) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = String(text);
    return node;
  };
  const note = (text) => {
    byId("notice").textContent = text;
  };
  function dispatch(command) {
    const result = app.dispatch(command);
    note(result.ok ? "ดำเนินการแล้ว" : result.message);
    if (result.ok) paint(app.snapshot());
    return result;
  }
  function button(label, fn) {
    const b = el("button", label);
    b.type = "button";
    b.addEventListener("click", fn);
    return b;
  }
  function table(target, headers, rows) {
    const box = byId(target),
      t = el("table"),
      head = el("tr");
    for (const h of headers) head.append(el("th", h));
    const thead = el("thead");
    thead.append(head);
    t.append(thead);
    const body = el("tbody");
    for (const row of rows) {
      const tr = el("tr");
      for (const value of row) {
        const td = el("td");
        if (value instanceof Node) td.append(value);
        else td.textContent = String(value ?? "—");
        tr.append(td);
      }
      body.append(tr);
    }
    t.append(body);
    box.replaceChildren(t);
  }
  function showPerson() {
    const person = current.people.find(
        (p) => p.id === byId("person-select").value,
      ),
      box = byId("person-details");
    if (!person) {
      box.replaceChildren();
      return;
    }
    const sections = [
      el(
        "p",
        person.name +
          " • " +
          person.roleName +
          " • " +
          person.activity +
          " • " +
          person.intent.code,
      ),
    ];
    if (person.affect && person.aspirations) {
      sections.push(
        el(
          "p",
          "อารมณ์และแรงผลักดัน: อารมณ์ " +
            person.affect.mood +
            " (ความต้องการหลัก: " +
            person.affect.dominantNeed +
            ") • เป้าหมายชีวิต: " +
            person.aspirations.primaryGoal +
            " (เป้าออม " +
            money(person.aspirations.targetSavings) +
            ", แรงถีบตัว " +
            person.aspirations.hustleDrive +
            ")",
        ),
      );
    }
    for (const [group, title] of [
      ["personality", "บุคลิก"],
      ["values", "ค่านิยม"],
      ["aptitudes", "ความถนัด"],
    ])
      sections.push(
        el(
          "p",
          title +
            ": " +
            current.catalog.dimensions[group]
              .map((d) => d.nameTh + " " + person.profile[group][d.id])
              .join(" | "),
        ),
      );
    sections.push(
      el(
        "p",
        "ศักยภาพ: " +
          Object.entries(person.profile.potential)
            .map(([k, v]) => k + " " + v)
            .join(" | "),
      ),
    );
    sections.push(
      el(
        "p",
        "ทักษะ: " +
          current.catalog.skills
            .map(
              (s) =>
                s.nameTh +
                " " +
                person.skills[s.id].level.toFixed(1) +
                " (XP " +
                person.skills[s.id].totalXp.toFixed(1) +
                ")",
            )
            .join(" | "),
      ),
    );
    sections.push(
      el(
        "p",
        "สภาพ: " +
          Object.entries(person.state)
            .map(([k, v]) => k + " " + v.toFixed(1))
            .join(" | "),
      ),
    );
    if (person.decision)
      sections.push(
        el(
          "p",
          "เหตุผลการเลือกงานล่าสุด: " +
            person.decision.motives
              .map((m) => m.factor + " " + m.amount.toFixed(2))
              .join(" | "),
        ),
      );
    const role = el("select");
    for (const r of current.catalog.roles) {
      const o = el("option", r.nameTh);
      o.value = r.id;
      role.append(o);
    }
    role.value = person.role;
    role.addEventListener("change", () =>
      dispatch({ type: "setRole", personId: person.id, role: role.value }),
    );
    sections.push(role);
    box.replaceChildren(...sections);
  }
  function paint(v) {
    current = v;
    lastPaint = performance.now();
    const summary = [
      [
        "วัน/เวลา",
        v.time.day +
          " / " +
          String(v.time.hour).padStart(2, "0") +
          ":" +
          String(v.time.minuteOfHour).padStart(2, "0"),
      ],
      ["สถานการณ์", v.status],
      ["เงินสด", money(v.company.cash)],
      ["หนี้", money(v.company.debt)],
      ["รายรับรอเก็บ", money(v.company.receivable)],
      ["ค่าจ้างสะสมยังไม่จ่าย", money(v.company.unpaidWages)],
      ["Runway โดยประมาณ", v.company.runwayDays + " วัน"],
      ["ชื่อเสียง", v.company.reputation.toFixed(1)],
      ["วิจัย", v.research.points + " แต้ม"],
    ];
    byId("overview").replaceChildren(
      ...summary.map(([label, value]) => {
        const d = el("div");
        d.className = "metric";
        d.append(el("span", label), el("strong", value));
        return d;
      }),
    );
    byId("auto-buy").checked = v.policies.autoBuy;
    byId("auto-accept").checked = v.policies.autoAccept;
    byId("priority").value = v.policies.workPriority;
    table(
      "offers",
      ["สินค้า", "จำนวน", "ราคาต่อชิ้น", "ส่งภายในวัน", "คำสั่ง"],
      v.offers.map((o) => [
        v.catalog.products.find((p) => p.id === o.productId)?.nameTh,
        o.quantity,
        money(o.unitPrice),
        Math.floor(o.deadline / 1440) + 1,
        button("รับงาน", () =>
          dispatch({ type: "acceptOffer", offerId: o.id }),
        ),
      ]),
    );
    table(
      "orders",
      ["งาน", "สินค้า", "จำนวน", "สถานะ", "คำสั่ง"],
      v.orders
        .slice(-15)
        .map((o) => [
          o.id,
          o.productId,
          o.quantity,
          o.status,
          o.status === "accepted"
            ? button("ยกเลิกก่อนผลิต", () =>
                dispatch({ type: "cancelOrder", orderId: o.id }),
              )
            : null,
        ]),
    );
    table(
      "jobs",
      ["ขั้นงาน", "จำนวนงาน", "ติดวัตถุดิบ"],
      [...new Set(v.jobs.map((j) => j.kind))].map((kind) => [
        kind,
        v.jobs.filter((j) => j.kind === kind).length,
        v.jobs.filter((j) => j.kind === kind && j.blockedReason === "materials")
          .length,
      ]),
    );
    table(
      "materials",
      ["วัตถุดิบ", "มีอยู่", "จองแล้ว", "ใช้สะสม", "คำสั่ง"],
      v.catalog.materials.map((m) => [
        m.nameTh,
        v.inventory.materials[m.id],
        v.inventory.reserved[m.id],
        v.inventory.consumed[m.id],
        button("ซื้อ 10 ชิ้น", () =>
          dispatch({ type: "buyMaterials", materialId: m.id, quantity: 10 }),
        ),
      ]),
    );
    table(
      "people",
      ["ชื่อ/ตำแหน่ง", "กิจกรรม", "พิกัด/โซน", "พลังงาน", "เครียด", "หมดไฟ"],
      v.people.map((p) => [
        p.name + " / " + p.roleName,
        p.employed ? p.activity : "ออกจากบริษัทแล้ว",
        p.position.x + "," + p.position.y + " / " + p.zoneId,
        p.state.energy.toFixed(0),
        p.state.stress.toFixed(0),
        p.state.burnout.toFixed(0),
      ]),
    );
    const selected = byId("person-select").value;
    byId("person-select").replaceChildren(
      ...v.people.map((p) => {
        const o = el("option", p.name);
        o.value = p.id;
        return o;
      }),
    );
    if (v.people.some((p) => p.id === selected))
      byId("person-select").value = selected;
    showPerson();
    table(
      "stations",
      ["สถานี", "ชนิด", "โซน", "ช่องใช้งาน"],
      Object.values(v.scene.layout.stations).map((s) => [
        s.id,
        s.kind,
        s.access.x < 16 ? "office" : "factory",
        s.access.x + "," + s.access.y,
      ]),
    );
    byId("events").replaceChildren(
      ...v.events
        .slice(-12)
        .reverse()
        .map((e) =>
          el(
            "p",
            "วัน " +
              (Math.floor(e.at / 1440) + 1) +
              " • " +
              e.message +
              " • " +
              JSON.stringify(e.details),
          ),
        ),
    );
    byId("speed").value = String(app.getSpeed());
  }
  byId("new-game").onclick = () => {
    app.newGame(byId("seed").value || "company-demo");
    paint(app.snapshot());
    note("เริ่มบริษัทใหม่แล้ว");
  };
  byId("speed").onchange = () => app.setSpeed(Number(byId("speed").value));
  byId("advance-hour").onclick = () => {
    app.advance(60);
    paint(app.snapshot());
  };
  byId("advance-day").onclick = () => {
    app.advance(1440);
    paint(app.snapshot());
  };
  byId("auto-buy").onchange = () =>
    dispatch({
      type: "setPolicy",
      key: "autoBuy",
      value: byId("auto-buy").checked,
    });
  byId("auto-accept").onchange = () =>
    dispatch({
      type: "setPolicy",
      key: "autoAccept",
      value: byId("auto-accept").checked,
    });
  byId("priority").onchange = () =>
    dispatch({
      type: "setPolicy",
      key: "workPriority",
      value: byId("priority").value,
    });
  byId("apply-ot").onclick = () =>
    dispatch({
      type: "setPolicy",
      key: "overtimeHours",
      value: Number(byId("ot-hours").value),
    });
  byId("borrow").onclick = () =>
    dispatch({
      type: "borrow",
      amount: Math.round(Number(byId("money").value) * 100),
    });
  byId("repay").onclick = () =>
    dispatch({
      type: "repayDebt",
      amount: Math.round(Number(byId("money").value) * 100),
    });
  byId("pay-arrears").onclick = () => dispatch({ type: "payArrears" });
  byId("person-select").onchange = showPerson;
  byId("expand").onclick = () =>
    dispatch({ type: "expandSite", width: 4, height: 0 });
  byId("audit").onclick = () => {
    const errors = app.audit();
    note(
      errors.length
        ? errors.join("; ")
        : "ตรวจข้อมูล บัญชี วัตถุดิบ และอ้างอิง: ผ่าน",
    );
  };
  byId("save-local").onclick = () => {
    try {
      localStorage.setItem("company-foundation-review", app.save());
      note("บันทึกแล้ว");
    } catch (e) {
      note("บันทึกในเครื่องไม่ได้: " + e.message + " ใช้ส่งออกเซฟแทน");
    }
  };
  byId("load-local").onclick = () => {
    try {
      const text = localStorage.getItem("company-foundation-review");
      if (!text) {
        note("ยังไม่มีเซฟในเครื่อง");
        return;
      }
      const result = app.load(text);
      note(result.ok ? "โหลดแล้ว" : result.message);
      if (result.ok) paint(app.snapshot());
    } catch (e) {
      note(e.message);
    }
  };
  byId("export-save").onclick = () => {
    const blob = new Blob([app.save()], { type: "application/json" }),
      url = URL.createObjectURL(blob),
      link = el("a");
    link.href = url;
    link.download = "company-foundation-save.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  byId("import-save").onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > CompanySave.MAX_BYTES) {
      note("ไฟล์เซฟใหญ่เกินขีดจำกัด");
      return;
    }
    const result = app.load(await file.text());
    note(result.ok ? "นำเข้าแล้ว" : result.message);
    if (result.ok) paint(app.snapshot());
    event.target.value = "";
  };
  document.addEventListener("visibilitychange", () => app.resetClock());
  app.subscribe((v) => {
    pending = v;
  });
  paint(current);
  note(
    "พร้อมตรวจระบบ: รับงานหนึ่งรายการ หรือเปิดรับข้อเสนออัตโนมัติแล้วจำลองเวลา",
  );
  function frame(t) {
    if (!document.hidden) app.frame(t);
    if (pending !== current && t - lastPaint >= 200) paint(pending);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.CompanyDebug = Object.freeze({
    app,
    refresh: () => paint(app.snapshot()),
  });
})();
