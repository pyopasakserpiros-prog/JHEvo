"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  S = require("../js/sim.js"),
  D = require("../js/data.js"),
  Save = require("../js/save.js");
const cmd = (w, type, data = {}) => S.command(w, { type, ...data });
test("30 days of autonomous orders reconcile inventory, payroll and receipts at every day boundary", () => {
  const catalog = D.createCatalog();
  // Keep the scenario running for the whole 30-day audit even if the CEO repays debt early.
  catalog.rules.winCash = 1000000000;
  const w = S.create("steady", { catalog });
  cmd(w, "setPolicy", { key: "autoAccept", value: true });
  for (let i = 0; i < 30; i++) {
    S.advance(w, 1440);
    assert.equal(w.status, "running");
    assert.deepEqual(Save.validate(w), [], "day " + (i + 1));
  }
  assert(w.metrics.ordersPaid >= 10);
  assert(w.production.shipped.speaker > 0);
  assert(w.people.some((p) => p.experience.helpMinutes > 0));
  const loaded = Save.deserialize(Save.serialize(w));
  S.advance(w, 1440);
  S.advance(loaded, 1440);
  assert.equal(Save.serialize(w), Save.serialize(loaded));
});
test("policy-driven recovery can pay principal and achieve the scenario goal", () => {
  const w = S.create("recovery");
  cmd(w, "setPolicy", { key: "autoAccept", value: true });
  for (let i = 0; i < 90 && w.status === "running"; i++) {
    S.advance(w, 1440);
    if (w.finance.cash > w.finance.debt + 8000000 && w.reputation >= 60)
      cmd(w, "repayDebt", { amount: w.finance.debt });
  }
  assert.equal(w.status, "won");
  assert.equal(w.finance.debt, 0);
  assert.deepEqual(Save.validate(w), []);
  const before = Save.serialize(w);
  S.advance(w, 1440);
  assert.equal(Save.serialize(w), before);
});
test("not accepting work eventually ends in insolvency with reconciled liabilities", () => {
  const w = S.create("failure");
  S.advance(w, 90 * 1440);
  assert.equal(w.status, "lost");
  assert.equal(w.outcome.code, "insolvent");
  assert(w.finance.arrearsSince !== null);
  assert.deepEqual(Save.validate(w), []);
});
test("missing materials block production and never turn waiting time into free goods", () => {
  const c = D.createCatalog();
  for (const k of Object.keys(c.initialStock)) c.initialStock[k] = 0;
  const w = S.create("empty-stock", { catalog: c });
  cmd(w, "setPolicy", { key: "autoBuy", value: false });
  cmd(w, "acceptOffer", { offerId: Object.keys(w.offers)[0] });
  S.advance(w, 2 * 1440);
  assert.equal(w.production.completed.speaker, 0);
  assert.equal(w.inventory.consumed.pcb, 0);
  assert.deepEqual(Save.validate(w), []);
});
test("outside skill extensions preserve existing learned skills and survive save/load", () => {
  const w = S.create("extension"),
    before = JSON.stringify(w.people.map((p) => p.skills));
  S.addSkill(w, {
    id: "legal",
    nameTh: "กฎหมาย",
    aptitudes: { analytical: 0.5, memory: 0.5 },
  });
  assert(w.people.every((p) => p.skills.legal));
  const existing = w.people.map((p) => {
    const out = { ...p.skills };
    delete out.legal;
    return out;
  });
  assert.equal(JSON.stringify(existing), before);
  assert.deepEqual(Save.deserialize(Save.serialize(w)), w);
  const saved = Save.serialize(w);
  assert.throws(() =>
    S.addSkill(w, { id: "legal", nameTh: "ซ้ำ", aptitudes: { memory: 1 } }),
  );
  assert.equal(Save.serialize(w), saved);
});
test("live company can add new industry skills, roles, products and custom task kinds without core edits", () => {
  const w = S.create("industry-pivot");
  S.addSkill(w, D.INDUSTRY_SKILL_TEMPLATES.software);
  S.addRole(w, {
    id: "developer",
    nameTh: "นักพัฒนาซอฟต์แวร์",
    skill: "software",
  });
  S.addTaskKind(w, {
    id: "firmwareAudit",
    nameTh: "พัฒนาและตรวจซอฟต์แวร์ระบบ",
    skill: "software",
    stationKind: "research",
    requiredMinutes: 30,
    impacts: { learning: 0.9, achievement: 0.7, ambition: 0.6 },
    researchPoints: 40,
    reputationDelta: 1,
    revenue: 25000,
  });
  S.addProduct(
    w,
    {
      id: "smartHub",
      nameTh: "กล่องควบคุมอัจฉริยะ",
      bom: { pcb: 1, sensor: 1, chip: 1 },
      assemblyMinutes: 30,
      qaMinutes: 10,
      packingMinutes: 5,
      priceMin: 110000,
      priceMax: 130000,
      researchRequired: 0,
    },
    [{ id: "chip", nameTh: "ชิปประมวลผล", unitCost: 8000, leadMinutes: 720 }],
  );
  assert(cmd(w, "setRole", { personId: w.people[2].id, role: "developer" }).ok);
  const task = S.enqueueTask(w, "firmwareAudit");
  assert(task.id);
  // The expanded campus and bounded walking can carry the work past lunch.
  S.advance(w, 480);
  assert(w.history.tasks.some((t) => t.kind === "firmwareAudit"));
  assert.deepEqual(Save.validate(w), []);
  const reloaded = Save.deserialize(Save.serialize(w));
  assert.equal(reloaded.people[2].role, "developer");
});
test("prototype-like IDs are rejected without throwing or changing any state", () => {
  const w = S.create("ids");
  for (const value of ["__proto__", "constructor", "prototype"])
    for (const c of [
      { type: "buyMaterials", materialId: value, quantity: 1 },
      { type: "acceptOffer", offerId: value },
      { type: "cancelOrder", orderId: value },
      { type: "setRole", personId: w.people[0].id, role: value },
      { type: "hire", candidateId: S.candidates(w)[0].id, role: value },
    ]) {
      const before = Save.serialize(w);
      assert.equal(S.command(w, c).ok, false);
      assert.equal(Save.serialize(w), before);
    }
});
test("wage changes apply prospectively rather than repricing a day already worked", () => {
  const w = S.create("wage"),
    p = w.people[0],
    old = p.pay.dailyWage;
  S.advance(w, 480);
  cmd(w, "setWage", { personId: p.id, dailyWage: old + 10000 });
  S.advance(w, 1440 - 480);
  assert.equal(p.pay.totalEarned, old);
  S.advance(w, 1440);
  assert.equal(p.pay.totalEarned, old * 2 + 10000);
  assert.deepEqual(Save.validate(w), []);
});
test("a new product and materials recipe runs through the existing factory without changing the core", () => {
  const c = D.createCatalog();
  c.products = {
    alarm: {
      id: "alarm",
      nameTh: "อุปกรณ์แจ้งเตือน",
      bom: { pcb: 1, casing: 1, sensor: 2 },
      assemblyMinutes: 35,
      qaMinutes: 10,
      packingMinutes: 5,
      priceMin: 95000,
      priceMax: 105000,
      researchRequired: 0,
      visualKey: "product.alarm",
    },
  };
  c.initialStock.sensor = 30;
  const w = S.create("new-industry", { catalog: c });
  cmd(w, "acceptOffer", { offerId: Object.keys(w.offers)[0] });
  S.advance(w, 8 * 1440);
  assert(Object.values(w.orders).some((o) => o.status === "paid"));
  assert(w.production.shipped.alarm >= 8);
  assert(w.inventory.consumed.sensor >= 16);
  assert.deepEqual(Save.validate(w), []);
});
