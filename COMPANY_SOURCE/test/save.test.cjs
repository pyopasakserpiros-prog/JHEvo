"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  S = require("../js/sim.js");
let Save;
try {
  Save = require("../js/save.js");
} catch (e) {
  if (e.code !== "MODULE_NOT_FOUND") throw e;
}
test("save module exposes versioned, validated serialisation", () =>
  assert.ok(Save, "save implementation missing"));
test("oversized XP is rejected on import before it can crash later training", () => {
  const API = require("../js/api.js"),
    app = API.create("xp-boundary"),
    before = app.save(),
    bad = JSON.parse(before);
  for (const p of bad.people)
    for (const sk of Object.values(p.skills)) sk.totalXp = 1e308;
  assert(Save.validate(bad).length > 0);
  assert.equal(app.load(JSON.stringify(bad)).ok, false);
  assert.equal(app.save(), before);
});
const check = (n, f) => test(n, { skip: !Save }, f);
check(
  "saving/loading mid-job continues identical production, money, RNG and employees",
  () => {
    const w = S.create("continuation");
    S.command(w, { type: "acceptOffer", offerId: Object.keys(w.offers)[0] });
    S.advance(w, 180);
    assert(Object.values(w.units).some((u) => u.materialConsumed));
    const text = Save.serialize(w),
      loaded = Save.deserialize(text);
    assert.deepEqual(loaded, w);
    assert(Object.isFrozen(loaded.people[0].profile));
    S.advance(w, 9 * 1440);
    S.advance(loaded, 9 * 1440);
    assert.equal(Save.serialize(w), Save.serialize(loaded));
    assert.equal(S.audit(loaded).length, 0);
  },
);
check(
  "legacy version headers migrate deterministically to the current core on load",
  () => {
    const w = JSON.parse(Save.serialize(S.create("migration-test")));
    w.coreVersion = "0.1.0-review.1";
    for (const p of w.people) {
      p.profile.version = "0.1.0-review.1";
      delete p.profile.personality.adaptability;
      delete p.profile.personality.ambition;
      delete p.profile.personality.prudence;
      delete p.profile.values.recognition;
      delete p.profile.values.family;
      delete p.profile.values.comfort;
      delete p.profile.aptitudes.spatial;
      delete p.profile.aptitudes.strength;
      delete p.profile.aptitudes.composure;
      delete p.profile.aptitudes.sensory;
      delete p.profile.potential.spatial;
      delete p.profile.potential.strength;
      delete p.profile.potential.composure;
      delete p.profile.potential.sensory;
    }
    const migrated = Save.deserialize(JSON.stringify(w));
    assert.equal(migrated.coreVersion, require("../js/human-core.js").VERSION);
    assert.equal(Save.validate(migrated).length, 0);
    assert(Object.isFrozen(migrated.people[0].profile));
  },
);
check(
  "future versions, bad JSON, forbidden keys, nonfinite numbers, and oversized input are rejected",
  () => {
    const w = S.create("invalid");
    assert.throws(() => Save.deserialize("{"));
    for (const edit of [
      (v) => (v.schema = "future"),
      (v) => (v.coreVersion = "future"),
      (v) => (v.rng.state = 0),
      (v) => (v.catalog.products.speaker.bom.unknown = 1),
      (v) => (v.people[0].state.energy = NaN),
      (v) => (v.people[0].profile.values.income = 101),
    ]) {
      const copy = JSON.parse(JSON.stringify(w));
      edit(copy);
      assert.throws(() => Save.deserialize(JSON.stringify(copy)));
    }
    assert.throws(() => Save.deserialize('{"__proto__":{"polluted":true}}'));
    assert.equal({}.polluted, undefined);
    assert.throws(() => Save.deserialize(" ".repeat(Save.MAX_BYTES + 1)));
  },
);
check(
  "financial/resource tampering, orphan jobs and unreachable workers are rejected",
  () => {
    const base = S.create("tamper");
    S.command(base, {
      type: "acceptOffer",
      offerId: Object.keys(base.offers)[0],
    });
    for (const edit of [
      (w) => w.finance.cash++,
      (w) => w.inventory.materials.pcb++,
      (w) => (Object.values(w.jobs)[0].orderId = "missing"),
      (w) => (w.people[0].position = { x: -1, y: 0 }),
      (w) => w.people.push(w.people[0]),
      (w) => (w.clock.absoluteMinute += 1),
      (w) => (w.policies.autoBuy = "yes"),
    ]) {
      const w = JSON.parse(JSON.stringify(base));
      edit(w);
      assert.throws(() => Save.deserialize(JSON.stringify(w)));
    }
  },
);
test("semantically broken assignments and duplicate billing cannot be loaded", () => {
  const base = S.create("semantic-save");
  S.command(base, {
    type: "acceptOffer",
    offerId: Object.keys(base.offers)[0],
  });
  S.advance(base, 10);
  for (const edit of [
    (w) => {
      delete w.jobs[Object.keys(w.jobs).find((id) => w.jobs[id].unitId)];
    },
    (w) => {
      delete w.people[0].dayStats.otMinutes;
    },
    (w) => {
      const j = Object.values(w.jobs).find((j) => j.unitId);
      j.kind = "packing";
    },
    (w) => {
      const p = w.people.find((p) => p.taskId);
      p.stationId = null;
    },
  ]) {
    const w = JSON.parse(JSON.stringify(base));
    edit(w);
    assert.throws(() => Save.deserialize(JSON.stringify(w)));
  }
});
test("one order cannot acquire a second unpaid invoice through a damaged save", () => {
  const w = S.create("invoice-duplicates");
  S.command(w, { type: "acceptOffer", offerId: Object.keys(w.offers)[0] });
  for (let i = 0; i < 2000 && !Object.keys(w.invoices).length; i++)
    S.advance(w, 5);
  const invoice = Object.values(w.invoices)[0];
  assert(invoice);
  const extra = { ...invoice, id: "invoice-" + ++w.sequence };
  w.invoices[extra.id] = extra;
  assert.throws(() => Save.deserialize(JSON.stringify(w)));
});
