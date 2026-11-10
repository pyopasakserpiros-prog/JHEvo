"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict");
let API;
try {
  API = require("../js/api.js");
} catch (e) {
  if (e.code !== "MODULE_NOT_FOUND") throw e;
}
test("a presentation facade exists independently of any graphics implementation", () =>
  assert.ok(API, "presentation API missing"));
test("every intrinsic dimension has a readable presentation name", () => {
  const snapshot = API.create("dimension-labels").snapshot();
  for (const group of Object.values(snapshot.catalog.dimensions))
    for (const d of group) assert.equal(typeof d.nameTh, "string", d.id);
});
const check = (n, f) => test(n, { skip: !API }, f);
check(
  "snapshots are immutable and repeated reading never changes save state or RNG",
  () => {
    const app = API.create("view"),
      before = app.save(),
      a = app.snapshot(),
      b = app.snapshot();
    assert.deepEqual(a, b);
    assert.equal(app.save(), before);
    assert(Object.isFrozen(a));
    assert(Object.isFrozen(a.people[0].profile));
    assert.throws(() => {
      a.people[0].state.energy = 0;
    });
    assert.equal(app.save(), before);
    assert(a.scene.layout.zones.some((z) => z.id === "office"));
    assert(a.scene.layout.zones.some((z) => z.id === "factory"));
    assert(a.catalog.products.length >= 2);
  },
);
check(
  "presentation commands modify simulation through one boundary and emit updated views",
  () => {
    const app = API.create("dispatch");
    let calls = 0;
    const off = app.subscribe(() => calls++),
      offer = app.snapshot().offers[0];
    assert(app.dispatch({ type: "acceptOffer", offerId: offer.id }).ok);
    assert(calls >= 2);
    app.advance(1440 * 7);
    assert(app.snapshot().orders.some((o) => o.status === "paid"));
    off();
    const old = calls;
    app.advance(5);
    assert.equal(calls, old);
  },
);
check(
  "failed save import leaves the active company untouched and external callback errors do not break simulation",
  () => {
    const app = API.create("load"),
      before = app.save();
    assert.equal(app.load("{").ok, false);
    assert.equal(app.save(), before);
    app.subscribe(() => {
      throw Error("UI callback");
    });
    assert(
      app.dispatch({ type: "setPolicy", key: "autoAccept", value: true }).ok,
    );
    app.advance(60);
    assert(app.snapshot().time.absoluteMinute > 540);
    assert(app.lastPresentationError());
    const copy = app.save();
    app.newGame("other");
    assert(app.load(copy).ok);
    assert.equal(app.save(), copy);
  },
);
check(
  "wall-clock driver advances fixed ticks, pauses, and ignores background gaps",
  () => {
    const app = API.create("clock");
    app.setSpeed(1);
    app.frame(0);
    assert.equal(app.frame(1000), 10);
    const t = app.snapshot().time.absoluteMinute;
    app.setSpeed(0);
    app.frame(2000);
    assert.equal(app.snapshot().time.absoluteMinute, t);
    app.setSpeed(1);
    app.frame(3000);
    app.frame(90000);
    assert.equal(app.snapshot().time.absoluteMinute, t);
    assert.throws(() => app.setSpeed(NaN));
  },
);
