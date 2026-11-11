"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const L = require("../js/layout.js");
const S = require("../js/sim.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

test("v0.5.0 10-level career ladder (Lv.1-Lv.10 / G1-G10) and 4-tier organizational tree (Division -> Department -> Section -> Group)", () => {
  const roles = ["sales", "admin", "engineer", "assembler", "inspector", "logistics", "coordinator"];
  for (const r of roles) {
    const ladder = D.CAREER_LADDERS[r];
    assert.ok(Array.isArray(ladder), `Missing ladder for ${r}`);
    assert.equal(ladder.length, 10, `Role ${r} must have 10 career levels (Lv.1-Lv.10)`);
    for (let i = 0; i < 10; i++) {
      assert.equal(ladder[i].level, i + 1);
      assert.equal(ladder[i].gradeCode, "G" + (i + 1));
      assert.equal(ladder[i].badge, "Lv." + (i + 1));
      assert.ok(ladder[i].titleTh.length > 5);
    }
  }

  const w = S.create("v050-hierarchy-test", { autonomous: true, initialHeadcount: 45 });
  assert.equal(w.people.length, 45);
  for (const p of w.people) {
    assert.ok(p.career.orgUnit, "Every employee must have a 4-tier orgUnit");
    assert.ok(p.career.sectionTh.length > 0, "Every employee must belong to a Section (แผนก)");
    assert.ok(p.career.groupTh.length > 0, "Every employee must belong to a Group/Line (กลุ่มงาน)");
    assert.ok(p.career.orgPathTh.includes("›"), "orgPathTh must show multi-tier path");
  }

  for (let lv = 2; lv <= 10; lv++) {
    const hr = S.getDepartmentHeadroom(w, "assembler", lv);
    assert.equal(typeof hr.allowed, "boolean");
    assert.ok(hr.reason.length > 0);
  }

  const target = w.people[0];
  for (let step = 2; step <= 10; step++) {
    const res = S.command(w, { type: "directorEdit", action: "promotePerson", personId: target.id });
    assert.equal(res.ok, true);
    assert.equal(target.career.level, step);
    assert.equal(target.career.gradeCode, "G" + step);
  }
  assert.equal(target.career.level, 10);
  assert.deepEqual(Save.validate(w), []);

  const app = API.create("v050-api-org", { autonomous: true, initialHeadcount: 30 });
  const snap = app.snapshot();
  assert.equal(snap.orgSummary.maxCareerLevel, 10);
  assert.equal(snap.orgSummary.levelPyramid.length, 10);
  assert.ok(snap.orgSummary.departments.every((d) => Array.isArray(d.sections) && d.sections.length > 0));
});

test("v0.5.0+ 56x34 greenfield campus and all 14 constructible facilities (Lines A/B/C/D, QA Lab, Water Plant, Expo Hall, Refinery Mill, Bakery Plant)", () => {
  const w = S.create("v050-greenfield-campus", { autonomous: true });
  assert.equal(w.layout.width, 56);
  assert.equal(w.layout.height, 34);
  assert.deepEqual(L.validateLayout(w.layout), []);

  const plotIds = Object.keys(D.EXPANSION_PLOTS);
  assert.ok(plotIds.length >= 12, "Must have at least 12 constructible greenfield facilities");

  S.command(w, { type: "directorEdit", action: "grantCash", amount: 65000000 });
  for (const pid of plotIds) {
    const res = S.command(w, { type: "constructPlot", plotId: pid });
    assert.equal(res.ok, true, `Plot ${pid} failed to construct: ${res.message}`);
  }
  assert.equal(w.facilities.constructedPlots.length, plotIds.length);
  assert.equal(w.logistics.productionLines.lineA.active, true);
  assert.equal(w.logistics.productionLines.lineB.active, true);
  assert.equal(w.logistics.productionLines.lineC.active, true);
  assert.equal(w.logistics.productionLines.lineD.active, true);
  assert.deepEqual(L.validateLayout(w.layout), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v0.5.0+ production modes, production regimes, raw materials, and products operate with full accounting conservation", () => {
  const w = S.create("v050-prod-modes", { autonomous: true, initialHeadcount: 24 });
  assert.ok(Object.keys(w.catalog.materials).length >= 20, "Must have at least 20 raw materials");
  assert.ok(Object.keys(w.catalog.products).length >= 16, "Must have at least 16 products");
  assert.ok(Object.keys(D.PRODUCTION_MODES).length >= 5, "Must have at least 5 production modes");
  assert.equal(Object.keys(D.PRODUCTION_REGIMES).length, 3, "Must have 3 production regimes");

  for (const prod of Object.values(w.catalog.products)) {
    assert.ok(D.PRODUCTION_MODES[prod.productionMode], `Invalid productionMode on ${prod.id}`);
  }

  for (const regId of ["craft_precision", "mass_throughput", "lean_balanced"]) {
    const res = S.command(w, { type: "directorEdit", action: "setProductionRegime", regimeId: regId });
    assert.equal(res.ok, true);
    assert.equal(w.logistics.productionRegime, regId);
  }

  S.command(w, { type: "directorEdit", action: "grantCash", amount: 30000000 });
  S.command(w, { type: "directorEdit", action: "grantResearch", points: 500 });
  S.command(w, { type: "directorEdit", action: "addMaterials", quantity: 40 });
  S.command(w, { type: "constructPlot", plotId: "prodLineB" });
  S.command(w, { type: "constructPlot", plotId: "prodLineD" });
  S.command(w, { type: "constructPlot", plotId: "qaLab" });

  S.advance(w, 1440 * 5);
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});
