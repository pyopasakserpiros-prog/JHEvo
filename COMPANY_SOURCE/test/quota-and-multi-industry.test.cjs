"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const H = require("../js/human-core.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

test("headcount quota rules prevent infinite promotions and require company/dept expansion", () => {
  const w = S.create("quota-test", { autonomous: true });

  // 1. In starter roster, assembler has 2 people (ต้น, อิง)
  const hrAssemblerLv2 = S.getDepartmentHeadroom(w, "assembler", 2);
  assert.equal(hrAssemblerLv2.allowed, true, "First Lv.2 senior slot should be open");
  assert.equal(hrAssemblerLv2.maxQuota, 1);

  // If one assembler becomes Lv.2, a 2nd Lv.2 must be blocked until department size >= 3
  const ton = w.people.find((p) => p.name === "ต้น");
  ton.career.level = 2;
  const hrAssemblerLv2After = S.getDepartmentHeadroom(w, "assembler", 2);
  assert.equal(hrAssemblerLv2After.allowed, false, "Second senior slot must be blocked when deptSize < 3");
  assert.ok(hrAssemblerLv2After.reason.includes("โควตาตำแหน่งอาวุโสเต็มแล้ว"));

  // 2. Lv.3 Supervisor: strictly 1 per department when facility is Lv.1 and deptSize < 4
  const hrAssemblerLv3 = S.getDepartmentHeadroom(w, "assembler", 3);
  assert.equal(hrAssemblerLv3.allowed, true, "First Lv.3 supervisor slot should be open");
  assert.equal(hrAssemblerLv3.maxQuota, 1);

  ton.career.level = 3;
  const hrAssemblerLv3Full = S.getDepartmentHeadroom(w, "assembler", 3);
  assert.equal(hrAssemblerLv3Full.allowed, false, "Second supervisor slot must be blocked at facility Lv.1");

  // Upgrade factory facility to Lv.2 -> opens 2nd foreman slot for expanded capacity!
  w.facilities.levels.factory = 2;
  const hrAssemblerLv3Expanded = S.getDepartmentHeadroom(w, "assembler", 3);
  assert.equal(hrAssemblerLv3Expanded.allowed, true, "Facility Lv.2 opens 2nd foreman slot");
  assert.equal(hrAssemblerLv3Expanded.maxQuota, 2);

  // 3. Lv.4 Executive: strictly 1 company-wide initially
  const hrExec = S.getDepartmentHeadroom(w, "coordinator", 4);
  assert.equal(hrExec.maxQuota, 1);
  assert.equal(hrExec.allowed, true);
  const ceo = w.people.find((p) => p.role === "coordinator");
  ceo.career.level = 4;
  const hrExecFull = S.getDepartmentHeadroom(w, "coordinator", 4);
  assert.equal(hrExecFull.allowed, false, "Second executive blocked until company expands to >=10 staff & >=15M cash");
});

test("boss promotion evaluation engine evaluates merit vs favoritism using Human Core and triggers social ripple effects", () => {
  const w = S.create("boss-eval-test", { autonomous: true });
  w.metrics.ordersPaid = 5;
  w.finance.cash = 10000000;

  // Set up 2 assemblers: ต้น (High Merit, Low Trust with Boss) vs อิง (Lower Merit, High Trust with Boss)
  const ton = w.people.find((p) => p.name === "ต้น");
  const ing = w.people.find((p) => p.name === "อิง");
  const ceo = w.people.find((p) => p.role === "coordinator");

  ton.skills.assembly.level = 68;
  ton.career.tasksCompleted = 25;
  ton.career.kpiScore = 85;
  ton.career.level = 1;
  ton.career.lastPromotionDay = 0;

  ing.skills.assembly.level = 52;
  ing.career.tasksCompleted = 10;
  ing.career.kpiScore = 60;
  ing.career.level = 1;
  ing.career.lastPromotionDay = 0;

  // Scenario 1: Boss with High Integrity & Fairness (Merit Wins)
  const p1 = clone(ceo.profile);
  p1.values.integrity = 90;
  p1.values.fairness = 88;
  ceo.profile = H.freezeProfile(p1);
  ceo.relationships[ton.id] = { trust: 0, familiarity: 10 };
  ceo.relationships[ing.id] = { trust: 30, familiarity: 50 }; // Ing is closer, but boss is fair!

  S.evaluatePromotions(w, 4);

  // High integrity boss promotes Ton due to superior merit
  assert.equal(ton.career.level, 2, "Ton should win promotion under fair/high-integrity boss");
  assert.equal(ing.career.level, 1, "Ing should not be promoted");
  assert.ok(w.events.some((e) => e.code === "employeePromoted" && e.details.personId === ton.id));
  assert.ok(ton.career.history[0].rationale.includes("ผลงานดีเด่น"));
  // Ing accepts fair decision with healthy rivalry drive
  assert.ok(ing.state.drive > 50);

  // Reset for Scenario 2: Boss with Low Integrity & High Favoritism/Influence (Favoritism Wins)
  ton.career.level = 1;
  ton.career.lastPromotionDay = 0;
  ton.skills.assembly.level = 75;
  ton.career.kpiScore = 90;
  ing.career.level = 1;
  ing.career.lastPromotionDay = 0;
  ing.skills.assembly.level = 50;
  ing.career.kpiScore = 58;

  const p2 = clone(ceo.profile);
  p2.values.integrity = 20;
  p2.values.fairness = 25;
  p2.values.influence = 85;
  p2.personality.sociability = 85;
  ceo.profile = H.freezeProfile(p2);
  ceo.relationships[ton.id] = { trust: -10, familiarity: 10 };
  ceo.relationships[ing.id] = { trust: 65, familiarity: 85 }; // Ing is boss's favorite!

  const initialTonMorale = ton.state.morale;
  S.evaluatePromotions(w, 8);

  // Favoritism boss promotes Ing over superior Ton!
  assert.equal(ing.career.level, 2, "Ing should win promotion due to boss favoritism");
  assert.equal(ton.career.level, 1, "Ton was passed over despite superior merit");
  assert.ok(ing.career.history[0].rationale.includes("ได้รับความไว้วางใจ"));

  // Ton suffers fairness grievance: morale drops, stress rises, and grievance event is logged!
  assert.ok(ton.state.morale < initialTonMorale, "Ton morale must drop due to nepotism injustice");
  assert.ok(w.events.some((e) => e.code === "promotionGrievance" && e.details.personId === ton.id));
});

test("multi-industry catalog contains diverse products across 4 sectors with verified BOM and accounting", () => {
  const cat = D.createCatalog();
  const prods = cat.products;

  // Check presence of products across all 4 sectors
  assert.ok(prods.speaker, "Tech sector: speaker");
  assert.ok(prods.lamp, "Tech sector: lamp");
  assert.ok(prods.iotController, "Tech sector: iotController");
  assert.ok(prods.autoSensor, "Automotive sector: autoSensor");
  assert.ok(prods.evController, "Automotive sector: evController");
  assert.ok(prods.herbalDrink, "Food sector: herbalDrink");
  assert.ok(prods.energyProtein, "Food sector: energyProtein");
  assert.ok(prods.solarCharger, "Green energy sector: solarCharger");

  // Check that every material in every BOM exists in catalog.materials
  for (const [pId, p] of Object.entries(prods)) {
    assert.ok(p.nameTh && p.nameTh.length > 2);
    assert.ok(p.assemblyMinutes >= 15 && p.assemblyMinutes <= 120);
    assert.ok(p.qaMinutes >= 5 && p.qaMinutes <= 60);
    assert.ok(p.packingMinutes >= 5 && p.packingMinutes <= 30);
    assert.ok(p.priceMin > 0 && p.priceMax >= p.priceMin);
    for (const [matId, qty] of Object.entries(p.bom)) {
      assert.ok(cat.materials[matId], `Material ${matId} in ${pId} BOM must exist in catalog`);
      assert.ok(qty >= 1);
    }
  }

  // Verify that multi-industry simulation runs cleanly and reconciles accounting
  const w = S.create("multi-industry-sim", { autonomous: true });
  S.advance(w, 1440 * 5);
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});
