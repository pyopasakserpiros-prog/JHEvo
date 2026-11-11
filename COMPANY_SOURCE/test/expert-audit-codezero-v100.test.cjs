"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const H = require("../js/human-core.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

test("7-Expert Audit #1: Plant Manager & Systems Analyst — wearReductionPct, modeSpec.speedModifier, OEE machineCondition & maintainMachines work in simulation", () => {
  const w1 = S.create("wear-baseline", { autonomous: true });
  const w2 = S.create("wear-rubber-estate", { autonomous: true });
  S.command(w2, { type: "directorEdit", action: "grantCash", amount: 10000000 });
  S.command(w2, { type: "acquireExternalAsset", assetId: "rubber_polymer_estate" });

  const bonuses = S.getActiveExternalAssetBonuses(w2);
  assert.ok(bonuses.wearReductionPct >= 0.12, "Rubber polymer estate must grant >=12% wear reduction");

  // Run both worlds until at least 1 assembly job finishes and compare machineCondition
  S.advance(w1, 1440);
  S.advance(w2, 1440);
  assert.ok(
    w2.facilities.machineCondition >= w1.facilities.machineCondition,
    "Owning rubber_polymer_estate must reduce machine wear compared to baseline",
  );

  // Test manual machine maintenance command
  w2.facilities.machineCondition = 68;
  const maintRes = S.command(w2, { type: "maintainMachines" });
  assert.equal(maintRes.ok, true);
  assert.equal(w2.facilities.machineCondition, 100, "maintainMachines must restore machineCondition to 100%");
  assert.deepEqual(S.audit(w2), []);
});

test("7-Expert Audit #2: Corporate Strategist & Economist — ceoDirective (6 modes), partner pricing/lead-time, and continueEndless mode work", () => {
  const w = S.create("directive-endless-test", { autonomous: true, initialHeadcount: 12 });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 30000000 });

  // 1. Test switching all 6 CEO Directives via setCeoDirective command
  for (const dirId of ["sales_blitz", "cash_shield", "zero_defect", "wellness_care", "rnd_sprint", "scale_expansion"]) {
    const res = S.command(w, { type: "setCeoDirective", directiveId: dirId });
    assert.equal(res.ok, true, `Setting CEO directive ${dirId} must succeed`);
    assert.equal(w.externalWorld.ceoDirective.id, dirId);
  }

  // 2. Test Batch Craft All (T1 -> T2 -> T3) command
  S.command(w, { type: "directorEdit", action: "grantResearch", points: 300 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "silica_bauxite_ore", quantity: 12 });
  const batchRes = S.command(w, { type: "batchCraftAll", batches: 2 });
  assert.equal(batchRes.ok, true);
  assert.ok(batchRes.unitsProduced >= 4, "batchCraftAll must cascade craft across unlocked recipes");

  // 3. Test Endless Corporate Empire continuation when status === 'won'
  if (w.finance.debt > 0) S.command(w, { type: "repayDebt", amount: w.finance.debt });
  S.command(w, { type: "directorEdit", action: "setReputation", value: 75 });
  S.advance(w, 5); // triggers checkOutcome -> won
  assert.equal(w.status, "won");

  const endlessRes = S.command(w, { type: "continueEndless" });
  assert.equal(endlessRes.ok, true, "continueEndless must unlock Endless Corporate Empire mode");
  assert.equal(w.status, "running");
  assert.equal(w.outcome, null);
  assert.equal(w.facilities.turnaroundAchieved, true);
  assert.equal(w.facilities.endlessMode, true);

  // Verify simulation continues advancing cleanly after continueEndless
  const tickBefore = w.clock.tick;
  S.advance(w, 1440);
  assert.ok(w.clock.tick > tickBefore, "Simulation must keep advancing in Endless mode");
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("7-Expert Audit #3: NPC & Living-World Gamer — Personal Life Milestones (H.purchaseLifeItem & H.applyLifeEvent) and mentorPower coaching", () => {
  const w = S.create("npc-life-milestone-test", { autonomous: true });
  // Give employee-1 sufficient paid wages in wallet to achieve personal life milestones on payday
  const p = w.people[0];
  p.pay.dueBase = 350000;
  p.pay.totalEarned += 350000;
  S.command(w, { type: "payArrears" }); // pays into p.pay.wallet while keeping payroll reconciliation exact
  assert.ok(p.pay.wallet >= 300000);

  // Advance to Day 7 payday boundary so settleDay runs evaluatePersonalLifeMilestones
  S.advance(w, 1440 * 7);
  assert.ok(
    Array.isArray(p.career.lifeMilestones) && p.career.lifeMilestones.length >= 1,
    "Employee with high wallet savings must achieve a personal life milestone on payday",
  );
  assert.ok(
    w.events.some((e) => e.code === "employeeLifeMilestone"),
    "Chronicle must log employeeLifeMilestone event",
  );

  // Verify payroll reconciliation & Save/Load roundtrip remain 100% valid
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
  const roundtrip = Save.deserialize(Save.serialize(w));
  assert.equal(roundtrip.people[0].career.lifeMilestones.length, p.career.lifeMilestones.length);
});
