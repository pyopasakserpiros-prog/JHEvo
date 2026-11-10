"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../js/sim.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");
const D = require("../js/data.js");

test("walking follows its route in bounded steps instead of skipping across the campus", () => {
  const world = S.create("walking-check", { autonomous: true });
  let moved = 0;
  for (let i = 0; i < 80; i++) {
    S.advance(world, 5);
    for (const p of world.people.filter((person) => person.activity === "walking")) {
      const distance = Math.abs(p.position.x - p.previousPosition.x) +
        Math.abs(p.position.y - p.previousPosition.y);
      assert.ok(distance <= 4, p.name + " skipped " + distance + " cells in one tick");
      if (distance) moved++;
    }
  }
  assert.ok(moved > 0, "scenario must exercise walking");
});

test("sales rejects a loss-making offer and chooses a viable offer rather than the first one", () => {
  const world = S.create("sales-choice", { autonomous: true });
  const offers = Object.values(world.offers);
  offers[0].unitPrice = 1;
  S.advance(world, 15);
  assert.equal(offers[0].status, "open");
  assert.equal(offers[1].status, "accepted");
  const event = world.events.find((entry) => entry.code === "orderAccepted");
  assert.ok(event.details.personId, "decision should identify its salesperson");
});

test("no sale is accepted automatically without a sales employee or CEO", () => {
  const world = S.create("no-sales", { autonomous: true });
  world.people.filter((p) => ["sales", "coordinator"].includes(p.role)).forEach((p) => { p.employed = false; });
  S.advance(world, 30);
  assert.equal(Object.values(world.orders).length, 0);
});

test("automatic purchasing requires an available purchasing employee or CEO", () => {
  const catalog = D.createCatalog();
  for (const key of Object.keys(catalog.initialStock)) catalog.initialStock[key] = 0;
  const world = S.create("no-buyer", { catalog, autonomous: true });
  world.people.filter((p) => ["admin", "logistics", "coordinator"].includes(p.role)).forEach((p) => { p.employed = false; });
  S.command(world, { type: "acceptOffer", offerId: Object.keys(world.offers)[0] });
  S.advance(world, 60);
  assert.equal(Object.keys(world.purchases).length, 0);
});

test("automatic recruitment needs a CEO and records who chose the candidate", () => {
  const withoutCEO = S.create("hr-without-ceo", { autonomous: true });
  withoutCEO.people.find((p) => p.role === "coordinator").employed = false;
  assert.equal(S.evaluateAutonomousHiring(withoutCEO, { force: true }), false);
  const world = S.create("hr-with-ceo", { autonomous: true });
  assert.equal(S.evaluateAutonomousHiring(world, { force: true }), true);
  const decision = world.events.find((e) => e.code === "recruitmentDecision");
  assert.ok(decision);
  assert.ok(world.people.some((p) => p.id === decision.details.personId && p.role === "coordinator"));
  assert.ok(world.people.some((p) => p.id === decision.details.candidateId && p.employed));
  assert.deepEqual(S.audit(world), []);
});

test("CEO repays company debt only from cash above a safety reserve", () => {
  const world = S.create("ceo-debt", { autonomous: true });
  S.command(world, { type: "directorEdit", action: "grantCash", amount: 50000000 });
  const initialDebt = world.finance.debt;
  S.advance(world, 35);
  const event = world.events.find((e) => e.code === "ceoDebtRepayment");
  assert.ok(event, "an employed CEO should act when surplus cash exists");
  assert.ok(world.finance.debt < initialDebt);
  assert.ok(world.finance.cash >= event.details.reserve);
  assert.ok(world.finance.entries.some((e) => e.kind === "debtRepayment" && e.delta === -event.details.amount));
  assert.deepEqual(S.audit(world), []);
});

test("CEO invests in a useful building from company money and the decision survives save/load", () => {
  const world = S.create("facility-investment", { autonomous: true });
  assert.equal(S.command(world, { type: "directorEdit", action: "grantCash", amount: 50000000 }).ok, true);
  S.advance(world, 1505); // Process the 10:00 tick on day two.
  const event = world.events.find((e) => e.code === "facilityUpgraded");
  assert.ok(event, "an adequately funded company should make an investment decision");
  const facility = world.facilities.levels[event.details.facilityId];
  assert.equal(facility, 2);
  assert.ok(world.people.some((p) => p.id === event.details.personId && p.role === "coordinator"));
  assert.ok(world.finance.entries.some((e) => e.kind === "equipment" && e.delta === -event.details.cost));
  assert.deepEqual(S.audit(world), []);
  const loaded = Save.deserialize(Save.serialize(world));
  assert.deepEqual(loaded.facilities, world.facilities);
});

test("without an employed CEO no building upgrade can occur", () => {
  const world = S.create("no-ceo", { autonomous: true });
  assert.equal(S.command(world, { type: "directorEdit", action: "grantCash", amount: 50000000 }).ok, true);
  world.people.find((p) => p.role === "coordinator").employed = false;
  S.advance(world, 1505);
  assert.equal(world.events.some((e) => e.code === "facilityUpgraded"), false);
});

test("CEO preserves cash reserves when the company cannot afford an upgrade", () => {
  const catalog = D.createCatalog();
  catalog.rules.initialCash = 100000;
  const world = S.create("tight-reserve", { autonomous: true, catalog });
  S.advance(world, 1505);
  assert.equal(world.events.some((e) => e.code === "facilityUpgraded"), false);
  assert.ok(world.finance.cash >= 0);
});

test("factory upgrade actually improves production progress", () => {
  const world = S.create("facility-productivity");
  S.command(world, { type: "acceptOffer", offerId: Object.keys(world.offers)[0] });
  let job;
  for (let i = 0; i < 200; i++) {
    S.advance(world, 5);
    job = Object.values(world.jobs).find((j) => j.kind === "assembly" && j.assignee && j.progress > 0 && j.required - j.progress > 15);
    if (job) break;
  }
  assert.ok(job, "scenario must reach real assembly work");
  const upgraded = JSON.parse(JSON.stringify(world));
  upgraded.facilities.levels.factory = 3;
  S.advance(world, 5);
  S.advance(upgraded, 5);
  assert.ok(upgraded.jobs[job.id].progress > world.jobs[job.id].progress);
});

test("invalid facility levels or investment ledger cannot be loaded", () => {
  const world = S.create("invalid-facility");
  world.facilities.levels.factory = 3;
  assert.ok(Save.validate(world).some((error) => error.includes("facility investment ledger mismatch")));
  assert.throws(() => Save.deserialize(JSON.stringify(world)));
});

test("a malformed finance entry is reported instead of crashing save validation", () => {
  const world = S.create("bad-ledger-entry");
  world.finance.entries.push(null);
  assert.ok(Save.validate(world).length > 0);
});

test("editing one person's personality is validated, isolated and remains a valid profile", () => {
  const world = S.create("edit-person");
  const person = world.people[0];
  const other = JSON.stringify(world.people[1].profile);
  const before = JSON.stringify(world);
  assert.equal(S.command(world, { type: "directorEdit", action: "setTrait", personId: person.id, group: "personality", key: "sociability", value: 101 }).ok, false);
  assert.equal(JSON.stringify(world), before);
  assert.equal(S.command(world, { type: "directorEdit", action: "setTrait", personId: person.id, group: "personality", key: "sociability", value: 72 }).ok, true);
  assert.equal(person.profile.personality.sociability, 72);
  assert.equal(JSON.stringify(world.people[1].profile), other);
  assert.deepEqual(Save.validate(world), []);
});

test("granting an unknown material or an invalid quantity is rejected atomically", () => {
  const world = S.create("edit-material");
  for (const edit of [
    { materialId: "missing", quantity: 5 },
    { materialId: "pcb", quantity: 0 },
    { materialId: "pcb", quantity: 501 },
  ]) {
    const before = JSON.stringify(world);
    assert.equal(S.command(world, { type: "directorEdit", action: "grantMaterial", ...edit }).ok, false);
    assert.equal(JSON.stringify(world), before);
  }
});

test("larger campus includes a reachable training facility which employees actually use", () => {
  const world = S.create("training-center");
  assert.ok(world.layout.width > 32 && world.layout.height > 20);
  assert.ok(world.layout.stations.training, "training center needs an actual simulation station");
  S.advance(world, 1440);
  assert.ok(world.facilities.trainingMinutes > 0, "staff should spend real time learning there");
  assert.deepEqual(S.audit(world), []);
  const view = API.create("training-center").snapshot();
  const hq = view.campus.buildings.find((b) => b.id === "hq");
  const rnd = view.campus.buildings.find((b) => b.id === "rnd");
  assert.ok(rnd.footprint.x - (hq.footprint.x + hq.footprint.width) >= 2);
  assert.ok(view.campus.buildings.some((b) => b.id === "training"));
});
