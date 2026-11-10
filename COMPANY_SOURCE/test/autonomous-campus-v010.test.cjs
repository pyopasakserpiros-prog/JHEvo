"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../js/economy.js");
const S = require("../js/sim.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");
const CampusRender = require("../js/campus-render.js");

test("v0.1.0 autonomous NPC loop accepts offers, reorders materials, produces, and preserves accounting", () => {
  const w = S.create("v010-autonomous-loop", { autonomous: true });
  assert.equal(w.policies.autoAccept, true);
  assert.equal(w.policies.autoBuy, true);

  // Advance 12 days of autonomous operation
  S.advance(w, 1440 * 12);

  assert.ok(Object.keys(w.orders).length > 0, "Sales should autonomously accept customer offers");
  assert.ok(
    w.events.some((e) => e.code === "orderAccepted"),
    "Chronicle should record autonomous sales offer acceptance",
  );
  assert.deepEqual(E.auditFinance(w.finance), [], "Closed-loop accounting must remain exact");
  assert.deepEqual(S.audit(w), [], "Simulation audit must remain clean");
  assert.deepEqual(Save.validate(w), [], "Full world validation must remain clean");
});

test("v0.1.0 autonomous HR/CEO hiring recruits candidate when backlog is overloaded and runway > 30 days", () => {
  const w = S.create("v010-hr-hire", { autonomous: true });
  // Ensure runway > 30 days via a closed-loop director capital grant
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 8000000 });
  // Accept all open offers to create a heavy production backlog
  for (const offer of Object.values(w.offers)) {
    S.command(w, { type: "acceptOffer", offerId: offer.id });
  }
  const beforeCount = w.people.filter((p) => p.employed).length;
  const hired = S.evaluateAutonomousHiring(w);
  const afterCount = w.people.filter((p) => p.employed).length;

  assert.equal(hired, true, "HR/CEO should autonomously recruit when overloaded with safe runway");
  assert.equal(afterCount, beforeCount + 1);
  assert.deepEqual(Save.validate(w), []);
});

test("v0.1.0 Sandbox Edit Hub (directorEdit) preserves closed-loop accounting and save invariants", () => {
  const app = API.create("v010-edit-hub");
  const pId = app.snapshot().people[0].id;

  assert.equal(
    app.dispatch({ type: "directorEdit", action: "grantCash", amount: 2500000 }).ok,
    true,
  );
  assert.equal(
    app.dispatch({ type: "directorEdit", action: "addMaterials", quantity: 10 }).ok,
    true,
  );
  assert.equal(
    app.dispatch({ type: "directorEdit", action: "addResearch", points: 320 }).ok,
    true,
  );
  assert.equal(
    app.dispatch({ type: "directorEdit", action: "setReputation", value: 85 }).ok,
    true,
  );
  assert.equal(
    app.dispatch({ type: "directorEdit", action: "refreshPerson", personId: pId }).ok,
    true,
  );
  assert.equal(
    app.dispatch({
      type: "directorEdit",
      action: "trainSkill",
      personId: pId,
      skillId: "sales",
      delta: 15,
    }).ok,
    true,
  );

  const snap = app.snapshot();
  assert.equal(snap.company.reputation, 85);
  assert.ok(snap.research.unlockedProducts.includes("lamp"), "300+ research points unlocks lamp");
  assert.deepEqual(app.audit(), [], "All Edit Hub actions must pass full audit");
});

test("CompanyAPI snapshot provides campus buildings, chronicle badges, 1/7/30d digests, and compareEmployees", () => {
  const app = API.create("v010-api-snapshot");
  app.dispatch({ type: "setPolicy", key: "autoAccept", value: true });
  app.advance(1440 * 3);

  const snap = app.snapshot();
  assert.equal(snap.campus.buildings.length, 8);
  const buildingIds = snap.campus.buildings.map((b) => b.id);
  for (const id of ["hq", "rnd", "factory", "warehouse", "canteen", "courtyard", "training", "gate"]) {
    assert.ok(buildingIds.includes(id), `Missing campus building ${id}`);
  }

  for (const p of snap.people) {
    assert.ok(typeof p.buildingId === "string");
    assert.ok(typeof p.isIndoors === "boolean");
    assert.ok(typeof p.activityLabelTh === "string" && p.activityLabelTh.length > 0);
    assert.ok(Array.isArray(p.recentThoughts) && p.recentThoughts.length > 0);
  }

  assert.ok(Array.isArray(snap.chronicle) && snap.chronicle.length > 0);
  for (const rec of snap.chronicle) {
    assert.ok(["VERIFIED", "OBSERVED", "RUMOR"].includes(rec.epistemic));
    assert.ok(typeof rec.meaningTh === "string" && rec.meaningTh.length > 0);
  }

  assert.ok(snap.digests && snap.digests.d1 && snap.digests.d7 && snap.digests.d30);
  assert.equal(snap.digests.d7.days, 7);

  const cmp = API.compareEmployees(snap.people[0], snap.people[1]);
  assert.ok(cmp);
  assert.equal(cmp.skills.length, snap.catalog.skills.length);
  assert.equal(cmp.personality.length, 14);
  assert.equal(cmp.values.length, 18);
  assert.equal(cmp.aptitudes.length, 30);

  assert.ok(CampusRender && CampusRender.ROLE_STYLE && CampusRender.BUILDING_ART);
});
