"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

test("multi-nationality name pool and starter roster provide rich demographic identity", () => {
  const w = S.create("company-demo", { autonomous: true });
  assert.equal(w.people.length, 8);

  const nationalitiesSeen = new Set();
  for (const p of w.people) {
    assert.ok(p.identity, `missing identity for ${p.id}`);
    assert.ok(p.identity.fullName && p.identity.fullName.length > 3);
    assert.ok(p.identity.firstName && p.identity.lastName);
    assert.ok(["M", "F"].includes(p.identity.gender));
    assert.ok(["ชาย", "หญิง"].includes(p.identity.genderTh));
    assert.ok(["♂", "♀"].includes(p.identity.genderSymbol));
    assert.ok(p.identity.age >= 20 && p.identity.age <= 60);
    assert.ok(D.NATIONALITIES[p.identity.nationality]);
    assert.ok(p.identity.flag && p.identity.nationalityTh);
    assert.ok(p.identity.educationTh && p.identity.hometownTh);
    nationalitiesSeen.add(p.identity.nationality);
  }
  assert.ok(nationalitiesSeen.size >= 4, "starter roster should represent multiple nationalities");

  const dynNats = new Set();
  const dynGenders = new Set();
  const roles = ["sales", "admin", "engineer", "assembler", "inspector", "logistics", "coordinator"];
  for (let i = 9; i <= 48; i++) {
    const rId = roles[i % roles.length];
    const id = D.createIdentity("company-demo", `employee-${i}`, null, rId);
    dynNats.add(id.nationality);
    dynGenders.add(id.gender);
    assert.ok(id.displayName.includes(id.firstName));
  }
  assert.ok(dynNats.size >= 4);
  assert.equal(dynGenders.size, 2);
});

test("recentThoughts and decision.motives translate 100% of decision factors into Thai without raw English keys", () => {
  const app = API.create("motive-translation-check", { autonomous: true });
  app.advance(1440 * 3);
  const snap = app.snapshot();

  const forbiddenPatterns = [
    /value:/i,
    /personality:/i,
    /state:/i,
    /\beffort\b/i,
    /\bskillFit\b/i,
    /\bdelay\b/i,
    /\bnovelty\b/i,
    /\broutine\b/i,
  ];
  for (const p of snap.people) {
    assert.ok(Array.isArray(p.recentThoughts) && p.recentThoughts.length >= 1);
    for (const line of p.recentThoughts) {
      for (const pat of forbiddenPatterns) {
        assert.equal(pat.test(line), false, `Found raw English motive key in thought: "${line}"`);
      }
    }
    if (p.decision && Array.isArray(p.decision.motives)) {
      for (const m of p.decision.motives) {
        assert.equal(typeof m.labelTh, "string");
        for (const pat of forbiddenPatterns) {
          assert.equal(pat.test(m.labelTh), false, `Found raw English motive key in labelTh: "${m.labelTh}"`);
        }
      }
    }
  }
});

test("career ladder promotions, payday performance bonuses, mentorship, and machine maintenance preserve closed-loop accounting", () => {
  const w = S.create("career-bonus-realism", { autonomous: true });
  w.facilities.machineCondition = 78;

  S.advance(w, 1440 * 14);

  assert.ok(w.facilities.maintenanceCount >= 1, "expected autonomous machine maintenance");
  assert.ok(w.events.some((e) => e.code === "machineMaintained"));

  assert.ok(w.facilities.totalPromotions >= 1, "expected autonomous merit promotion");
  assert.ok(w.events.some((e) => e.code === "employeePromoted"));
  assert.ok(w.people.some((p) => p.career && p.career.level >= 2));

  assert.ok(w.facilities.totalBonusesPaid > 0, "expected payday performance bonus");
  assert.ok(w.events.some((e) => e.code === "bonusAwarded"));
  assert.ok(w.facilities.employeeOfTheWeekId);

  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});
