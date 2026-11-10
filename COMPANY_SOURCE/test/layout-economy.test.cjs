"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict");
let D, L, E;
try {
  D = require("../js/data.js");
  L = require("../js/layout.js");
  E = require("../js/economy.js");
} catch (e) {
  if (e.code !== "MODULE_NOT_FOUND") throw e;
}
test("company catalog, layout and accounting modules are available", () =>
  assert.ok(D && L && E, "foundation modules missing"));
const check = (n, f) => test(n, { skip: !D || !L || !E }, f);
check(
  "catalog has a complete material/product/skill chain and independent external skill registration",
  () => {
    const c = D.createCatalog();
    assert.equal(D.validateCatalog(c).length, 0);
    const before = JSON.stringify(c.skills);
    D.registerSkill(c, {
      id: "legal",
      nameTh: "กฎหมายธุรกิจ",
      aptitudes: { analytical: 1, memory: 1 },
    });
    assert.equal(JSON.stringify({ ...c.skills, legal: undefined }), before);
    assert(c.skills.legal);
    assert.throws(() =>
      D.registerSkill(c, { id: "legal", aptitudes: { analytical: 1 } }),
    );
    const broken = D.createCatalog();
    broken.products.speaker.bom.unknown = 1;
    assert(D.validateCatalog(broken).length);
  },
);
check(
  "office and factory stations are reachable with stable four-direction routes",
  () => {
    const map = L.createLayout();
    assert.equal(L.validateLayout(map).length, 0);
    for (const station of Object.values(map.stations)) {
      const route = L.findPath(map, map.entrance, station.access);
      assert(route, station.id);
      assert.deepEqual(route.at(-1) || map.entrance, station.access);
      let prev = map.entrance;
      for (const point of route) {
        assert.equal(
          Math.abs(point.x - prev.x) + Math.abs(point.y - prev.y),
          1,
        );
        prev = point;
      }
    }
    assert.equal(L.zoneAt(map, map.stations.assembly1.access), "factory");
    assert.equal(L.zoneAt(map, map.stations.sales.access), "office");
  },
);
check(
  "layout expansion updates topology and rejects a blocked station without mutating input",
  () => {
    const map = L.createLayout(),
      before = JSON.stringify(map),
      grown = L.expand(map, 4, 2);
    assert.equal(map.width + 4, grown.width);
    assert.equal(grown.revision, map.revision + 1);
    assert.equal(JSON.stringify(map), before);
    assert.equal(L.validateLayout(grown).length, 0);
    const blocked = JSON.parse(before),
      p = blocked.stations.assembly1.access;
    blocked.blocked.push({ ...p });
    assert(L.validateLayout(blocked).length);
    assert.equal(L.findPath(blocked, map.entrance, p), null);
  },
);
check(
  "money entries are integer cents, idempotent and all balances reconcile",
  () => {
    const b = E.createFinance(10000, 50000);
    assert.equal(b.cash, 10000);
    E.post(b, { id: "buy-1", kind: "materials", delta: -3000, at: 5 });
    assert.equal(b.cash, 7000);
    assert.equal(
      E.post(b, { id: "buy-1", kind: "materials", delta: -3000, at: 5 }),
      false,
    );
    assert.equal(b.cash, 7000);
    assert.throws(() =>
      E.post(b, { id: "bad", kind: "materials", delta: -7001, at: 5 }),
    );
    assert.throws(() =>
      E.post(b, { id: "bad", kind: "materials", delta: 1.5, at: 5 }),
    );
    assert.equal(E.auditFinance(b).length, 0);
    assert.equal(
      b.cash,
      b.openingCash + Object.values(b.totals).reduce((a, n) => a + n, 0),
    );
  },
);
