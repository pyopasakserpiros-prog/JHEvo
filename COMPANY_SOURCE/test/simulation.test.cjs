"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict");
let S;
try {
  S = require("../js/sim.js");
} catch (e) {
  if (e.code !== "MODULE_NOT_FOUND") throw e;
}
test("simulation and command boundary are available", () =>
  assert.ok(S, "simulation implementation missing"));
const check = (n, f) => test(n, { skip: !S }, f),
  send = (w, type, payload = {}) => S.command(w, { type, ...payload }),
  run = (w, days) => S.advance(w, days * 1440);
check(
  "creation is deterministic, different seeds differ, all initial resources have a source",
  () => {
    const a = S.create("company"),
      b = S.create("company");
    assert.deepEqual(a, b);
    assert.notDeepEqual(a, S.create("other"));
    assert.equal(S.audit(a).length, 0);
    assert.equal(a.people.length, 8);
    assert.equal(a.clock.absoluteMinute, 540);
    assert.equal(a.finance.cash, 12000000);
  },
);
check("invalid commands are atomic including IDs, RNG and ledger", () => {
  const w = S.create("atomic");
  for (const c of [
    { type: "buyMaterials", materialId: "pcb", quantity: -1 },
    { type: "buyMaterials", materialId: "pcb", quantity: NaN },
    { type: "buyMaterials", materialId: "unknown", quantity: 1 },
    { type: "setPolicy", key: "autoBuy", value: "true" },
    { type: "repayDebt", amount: Infinity },
    { type: "acceptOffer", offerId: "unknown" },
    { type: "setRole", personId: w.people[0].id, role: "unknown" },
    { type: "unknown" },
  ]) {
    const before = JSON.stringify(w);
    assert.equal(S.command(w, c).ok, false);
    assert.equal(JSON.stringify(w), before, c.type);
  }
});
check(
  "purchase charges cash once and material arrives only after admin work and delivery",
  () => {
    const w = S.create("purchase");
    const before = w.inventory.materials.pcb,
      cash = w.finance.cash,
      r = send(w, "buyMaterials", { materialId: "pcb", quantity: 5 });
    assert(r.ok);
    assert.equal(w.finance.cash, cash - 5 * w.catalog.materials.pcb.unitCost);
    assert.equal(w.inventory.materials.pcb, before);
    run(w, 3);
    assert.equal(w.inventory.materials.pcb, before + 5);
    assert.equal(S.audit(w).length, 0);
  },
);
check(
  "accepted work turns actual materials into goods and invoiced cash autonomously in both zones",
  () => {
    const w = S.create("pipeline"),
      offer = Object.values(w.offers)[0];
    assert(send(w, "acceptOffer", { offerId: offer.id }).ok);
    run(w, 9);
    const order = Object.values(w.orders)[0];
    assert.equal(order.status, "paid");
    assert.equal(order.shipped, offer.quantity);
    assert(w.production.shipped.speaker >= offer.quantity);
    assert(w.inventory.consumed.pcb >= offer.quantity);
    assert(w.finance.totals.sales > 0);
    assert(w.people.some((p) => p.experience.workMinutes > 0));
    assert(w.history.tasks.some((t) => t.kind === "assembly"));
    assert(w.history.tasks.some((t) => t.kind === "invoice"));
    assert.equal(S.audit(w).length, 0);
  },
);
check(
  "repeat shipping/payment processing does not create additional receipts for an order",
  () => {
    const w = S.create("payment");
    send(w, "acceptOffer", { offerId: Object.keys(w.offers)[0] });
    run(w, 10);
    const paid = w.finance.totals.sales;
    run(w, 2);
    assert.equal(w.finance.totals.sales, paid);
    assert.equal(S.audit(w).length, 0);
  },
);
check(
  "cancel before material consumption refunds deposit and frees all reservations",
  () => {
    const w = S.create("cancel"),
      cash = w.finance.cash;
    send(w, "acceptOffer", { offerId: Object.keys(w.offers)[0] });
    const order = Object.values(w.orders)[0];
    assert(w.finance.cash > cash);
    assert(send(w, "cancelOrder", { orderId: order.id }).ok);
    assert.equal(w.finance.cash, cash);
    assert.equal(Object.keys(w.units).length, 0);
    assert(Object.values(w.inventory.reserved).every((n) => n === 0));
    assert.equal(S.audit(w).length, 0);
  },
);
check(
  "orders that already consumed materials cannot be cancelled even if units are scrapped and replaced",
  () => {
    const w = S.create("scrap-cancel");
    send(w, "acceptOffer", { offerId: Object.keys(w.offers)[0] });
    S.advance(w, 60);
    const order = Object.values(w.orders)[0];
    assert.equal(order.materialConsumed, true);
    for (const u of Object.values(w.units)) u.materialConsumed = false;
    assert.equal(send(w, "cancelOrder", { orderId: order.id }).ok, false);
  },
);
check(
  "payArrears clears arrearsSince when liabilities are settled and does not drain morale when cash is zero",
  () => {
    const w = S.create("arrears-fix");
    w.finance.payables.rent = 80000;
    w.finance.arrearsSince = 1;
    assert(send(w, "payArrears").ok);
    assert.equal(w.finance.payables.rent, 0);
    assert.equal(w.finance.arrearsSince, null);
    w.people[0].pay.dueBase = 10000;
    w.people[0].pay.totalEarned += 10000;
    const cashBackup = w.finance.cash;
    w.finance.cash = 0;
    const moraleBefore = w.people[0].state.morale;
    send(w, "payArrears");
    send(w, "payArrears");
    assert.equal(w.people[0].state.morale, moraleBefore);
    w.finance.cash = cashBackup;
  },
);
check(
  "staff choose rest rather than being forced to work when exhausted",
  () => {
    const w = S.create("rest"),
      p = w.people.find((p) => p.role === "assembler");
    p.state.energy = 5;
    p.state.stress = 90;
    send(w, "acceptOffer", { offerId: Object.keys(w.offers)[0] });
    S.advance(w, 30);
    assert(["walking", "resting"].includes(p.activity));
    assert(p.state.energy > 5);
    assert.equal(p.taskId, null);
  },
);
check(
  "work increases learned experience while innate profiles remain unchanged",
  () => {
    const w = S.create("learn"),
      before = JSON.stringify(w.people.map((p) => p.profile));
    send(w, "setPolicy", { key: "autoAccept", value: true });
    run(w, 6);
    assert(
      w.people.some((p) => Object.values(p.skills).some((s) => s.totalXp > 0)),
    );
    assert.equal(JSON.stringify(w.people.map((p) => p.profile)), before);
    assert.equal(S.audit(w).length, 0);
  },
);
check(
  "weekly payroll credits actual employee wallets and does not charge accrued wages twice",
  () => {
    const w = S.create("payroll");
    run(w, 7);
    const due = w.people.reduce((n, p) => n + p.pay.totalPaid, 0);
    assert(due > 0);
    assert.equal(-w.finance.totals.wages - w.finance.totals.overtime, due);
    assert.equal(S.audit(w).length, 0);
  },
);
check(
  "research unlocks additional production without editing the human core",
  () => {
    const w = S.create("research");
    send(w, "setPolicy", { key: "workPriority", value: "research" });
    run(w, 10);
    assert(w.research.points >= 300);
    assert(w.research.unlocked.includes("lamp"));
    assert.equal(S.audit(w).length, 0);
  },
);
check(
  "loans and repayments reconcile debt and cash and enforce credit limits",
  () => {
    const w = S.create("loan"),
      debt = w.finance.debt,
      cash = w.finance.cash;
    assert(send(w, "borrow", { amount: 100000 }).ok);
    assert.equal(w.finance.debt, debt + 100000);
    assert.equal(w.finance.cash, cash + 100000);
    assert(send(w, "repayDebt", { amount: 100000 }).ok);
    assert.equal(w.finance.debt, debt);
    assert.equal(w.finance.cash, cash);
    const before = JSON.stringify(w);
    assert.equal(send(w, "borrow", { amount: 999999999 }).ok, false);
    assert.equal(JSON.stringify(w), before);
    assert.equal(S.audit(w).length, 0);
  },
);
check(
  "site expansion and installation are transactional, charge cash and preserve reachability",
  () => {
    const w = S.create("expand"),
      width = w.layout.width,
      cash = w.finance.cash;
    assert(send(w, "expandSite", { width: 4, height: 0 }).ok);
    assert.equal(w.layout.width, width + 4);
    assert(w.finance.cash < cash);
    assert(
      send(w, "installStation", {
        kind: "assembly",
        x: 32,
        y: 4,
        accessX: 32,
        accessY: 5,
      }).ok,
    );
    assert.equal(S.audit(w).length, 0);
    const before = JSON.stringify(w);
    assert.equal(
      send(w, "installStation", {
        kind: "assembly",
        x: 16,
        y: 2,
        accessX: 16,
        accessY: 3,
      }).ok,
      false,
    );
    assert.equal(JSON.stringify(w), before);
  },
);
check(
  "hiring adds a genuinely different person and charges a recruitment fee",
  () => {
    const w = S.create("hire"),
      candidate = S.candidates(w)[0],
      before = JSON.stringify(w),
      cash = w.finance.cash;
    assert.equal(JSON.stringify(S.candidates(w)[0]), JSON.stringify(candidate));
    assert.equal(JSON.stringify(w), before);
    assert(
      send(w, "hire", { candidateId: candidate.id, role: "assembler" }).ok,
    );
    assert.equal(w.people.length, 9);
    assert.equal(w.finance.cash, cash - w.catalog.rules.hireFee);
    assert.equal(S.audit(w).length, 0);
  },
);
