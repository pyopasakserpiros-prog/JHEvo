"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path");
const H = require("../js/human-core.js"),
  D = require("../js/data.js"),
  S = require("../js/sim.js"),
  Save = require("../js/save.js");
const profile = (group, key, value) => {
  const p = JSON.parse(JSON.stringify(H.createProfile("counterfactual", "p")));
  p[group][key] = value;
  if (group === "aptitudes") p.potential[key] = 100;
  return H.freezeProfile(p);
};
const spec = { id: "precise", aptitudes: { precision: 1 } };

test("human contract distinguishes general capacities needed outside the original factory", () => {
  for (const key of [
    "numerical",
    "verbal",
    "attention",
    "problemSensitivity",
    "perceptualSpeed",
    "reactionSpeed",
    "controlPrecision",
    "coordination",
    "balance",
    "flexibility",
    "visualAcuity",
    "colorDiscrimination",
    "hearing",
    "speechClarity",
    "tasteSmell",
    "uncertaintyReasoning",
  ]) {
    assert(H.APTITUDES.includes(key), key);
    const s = { id: "newSkill", aptitudes: { [key]: 1 } },
      low = profile("aptitudes", key, 0),
      high = profile("aptitudes", key, 100);
    assert(H.createSkill(high, s).level > H.createSkill(low, s).level, key);
    assert(
      H.evaluateAbility(high, H.STATE_DEFAULTS, { level: 50 }, s)
        .speedMultiplier >
        H.evaluateAbility(low, H.STATE_DEFAULTS, { level: 50 }, s)
          .speedMultiplier,
      key,
    );
  }
  assert(H.PERSONALITY.includes("humility"));
  assert(H.PERSONALITY.includes("optimism"));
  for (const key of [
    "care",
    "stewardship",
    "influence",
    "tradition",
    "variety",
    "craftsmanship",
  ]) {
    assert(H.VALUES.includes(key), key);
    const o = [{ id: "action", impacts: { [key]: 1 } }];
    assert(
      H.scoreOptions(profile("values", key, 100), {}, o)[0].score >
        H.scoreOptions(profile("values", key, 0), {}, o)[0].score,
    );
  }
});
test("valid zero traits have continuous effects rather than becoming fifty", () => {
  const o = [{ id: "x", impacts: { comfort: 1, ambition: 1, change: 1 } }];
  for (const [group, key] of [
    ["values", "comfort"],
    ["personality", "ambition"],
    ["personality", "adaptability"],
  ]) {
    const at0 = H.scoreOptions(profile(group, key, 0), {}, o)[0].score,
      near = H.scoreOptions(profile(group, key, 0.001), {}, o)[0].score,
      mid = H.scoreOptions(profile(group, key, 50), {}, o)[0].score;
    assert(Math.abs(near - at0) < 0.01, key);
    assert(mid > at0, key);
  }
  const a = profile("values", "family", 0),
    b = profile("values", "family", 50);
  assert(
    H.evaluateInteraction(a, {}, b, {}).compatibility <
      H.evaluateInteraction(b, {}, b, {}).compatibility,
  );
});
test("extreme finite weights are scale invariant and learning rejects overflow", () => {
  const p = H.createProfile("bounds", "p"),
    a = { id: "s", aptitudes: { precision: 1, memory: 1 } },
    b = { id: "s", aptitudes: { precision: 1e308, memory: 1e308 } };
  assert.deepEqual(H.createSkill(p, a), H.createSkill(p, b));
  const sk = H.createSkill(p, spec);
  for (const n of [Number.MAX_VALUE, Infinity, -1]) {
    assert.throws(() => H.learn(p, sk, spec, n));
    assert.throws(() => H.tickState(p, {}, { minutes: n }));
  }
  assert.throws(() =>
    H.learn(p, { ...sk, totalXp: Number.MAX_SAFE_INTEGER }, spec, 60),
  );
});
test("invalid skill levels reject promptly before any level accumulation loop", () => {
  const { spawnSync } = require("node:child_process");
  const program = `const H=require(process.argv[1]),p=H.createProfile('invalid','p'),spec={id:'s',aptitudes:{precision:1}};for(const level of [Infinity,1e308,-1]) {let rejected=false;try{H.learn(p,{id:'s',level,xp:0,totalXp:0},spec,5)}catch(e){rejected=true}if(!rejected)process.exit(2)}`;
  const r = spawnSync(
    process.execPath,
    ["-e", program, path.resolve(__dirname, "../js/human-core.js")],
    { timeout: 2000, encoding: "utf8" },
  );
  assert.equal(r.status, 0, r.error?.message || r.stderr);
});
test("skill decay validates records instead of persisting nonfinite skills", () => {
  const p = H.createProfile("decay-input", "p");
  for (const skill of [
    { id: "precise", level: Infinity, xp: 0, totalXp: 0 },
    { id: "wrong", level: 50, xp: 0, totalXp: 0 },
    { id: "precise", level: 50, xp: -1, totalXp: 0 },
  ])
    assert.throws(() => H.decaySkill(p, skill, spec, 90));
});
test("future goals and prices are data rather than a frozen list of businesses or assets", () => {
  const p = H.createProfile("goals", "p"),
    goals = [
      {
        id: "orbitalResearch",
        targetSavings: 100000,
        baseScore: 1,
        weights: {
          values: { learning: 1 },
          personality: { openness: 0.5 },
          state: { drive: 0.2 },
        },
      },
    ];
  const before = JSON.stringify([p, goals]);
  const a = H.deriveAspirations(p, {}, { wallet: 25000, goalSpecs: goals });
  assert.equal(a.primaryGoal, "orbitalResearch");
  assert.equal(a.progressRatio, 0.25);
  assert.equal(JSON.stringify([p, goals]), before);
  const b = H.deriveAspirations(
    p,
    {},
    { wallet: 25000, goalSpecs: [{ ...goals[0], targetSavings: 50000 }] },
  );
  assert.equal(b.progressRatio, 0.5);
  assert.throws(() =>
    H.deriveAspirations(
      p,
      {},
      { goalSpecs: [{ ...goals[0], weights: { values: { unknown: 1 } } }] },
    ),
  );
  assert.throws(() => H.deriveAspirations(p, {}, { goalSpecs: [] }));
});
test("life events report actual bounded changes and zero intensity does nothing", () => {
  const p = H.createProfile("events", "p"),
    s = H.normaliseState({ morale: 99, stress: 1, drive: 99, fulfillment: 99 });
  const no = H.evaluateLifeEvent(p, s, { type: "promoted", intensity: 0 });
  assert.deepEqual(no.state, s);
  assert(Object.values(no.deltas).every((v) => v === 0));
  for (const event of [
    { type: "promoted" },
    {
      type: "newIndustryEvent",
      moraleDelta: 25,
      stressDelta: -50,
      driveDelta: 10,
    },
  ]) {
    const r = H.evaluateLifeEvent(p, s, event);
    for (const [key, delta] of Object.entries(r.deltas))
      assert.equal(delta, r.state[key] - s[key], key);
  }
});
test("life purchases require bounded integer cents and do not transact money", () => {
  const p = H.createProfile("buy", "p");
  for (const [cost, wallet] of [
    [0.5, 100],
    [100, Infinity],
    [100, -1],
    [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  ])
    assert.throws(() =>
      H.evaluateLifePurchase(p, {}, { id: "x", cost }, wallet),
    );
  assert.equal(
    H.evaluateLifePurchase(p, {}, { id: "free", cost: 0 }, 0).affordableNow,
    true,
  );
});
test("temporary accommodations alter performance without rewriting innate aptitude or cap", () => {
  const p = H.createProfile("accommodation", "p"),
    before = JSON.stringify(p),
    sk = H.createSkill(p, spec),
    state = H.createState(p);
  const basic = H.evaluateAbility(p, state, sk, spec),
    supported = H.evaluateAbility(p, state, sk, spec, {
      aptitudeMultipliers: { precision: 1.5 },
    });
  assert(supported.aptitudeFit > basic.aptitudeFit);
  assert.equal(JSON.stringify(p), before);
  assert.equal(H.skillCap(p, spec), H.skillCap(p, spec));
  for (const modifiers of [
    { unknown: 1 },
    { precision: Infinity },
    { precision: -1 },
    { precision: 3 },
  ])
    assert.throws(() =>
      H.evaluateAbility(p, state, sk, spec, { aptitudeMultipliers: modifiers }),
    );
});
test("romance eligibility is supplied by the life system, not inferred from compatibility", () => {
  const p = H.createProfile("romance", "p"),
    q = H.createProfile("romance", "q"),
    r = H.evaluateInteraction(
      p,
      {},
      q,
      {},
      { mode: "romance", romanceEligible: false },
    );
  assert.equal(r.romanticSpark, 0);
  assert.equal(r.affectionDelta, 0);
});
for (const version of ["review1", "review2"])
  test(
    "genuine " +
      version +
      " save migrates, preserves history and continues deterministically",
    () => {
      const text = fs.readFileSync(
          path.join(__dirname, "fixtures", version + "-midproduction.json"),
          "utf8",
        ),
        old = JSON.parse(text),
        w = Save.deserialize(text),
        v = Save.deserialize(text);
      assert.equal(w.coreVersion, H.VERSION);
      assert.deepEqual(w.finance, old.finance);
      assert.deepEqual(w.rng, old.rng);
      assert.deepEqual(w.people[0].skills, old.people[0].skills);
      for (const g of ["personality", "values", "aptitudes", "potential"])
        for (const [k, val] of Object.entries(old.people[0].profile[g]))
          assert.equal(w.people[0].profile[g][k], val, g + "." + k);
      assert.equal(w.people[0].state.energy, old.people[0].state.energy);
      assert.equal(Save.validate(w).length, 0);
      const consumed = Object.values(w.orders).find((o) =>
        Object.values(w.units).some(
          (u) => u.orderId === o.id && u.materialConsumed,
        ),
      );
      assert(consumed);
      assert.equal(consumed.materialConsumed, true);
      const before = Save.serialize(w);
      assert.equal(
        S.command(w, { type: "cancelOrder", orderId: consumed.id }).ok,
        false,
      );
      assert.equal(Save.serialize(w), before);
      S.advance(w, 4 * 1440);
      S.advance(v, 4 * 1440);
      assert.equal(Save.serialize(w), Save.serialize(v));
    },
  );
test("migration rejects corrupted legacy traits, state and mixed profile headers", () => {
  const text = fs.readFileSync(
    path.join(__dirname, "fixtures/review1-midproduction.json"),
    "utf8",
  );
  for (const mutate of [
    (w) => delete w.people[0].profile.personality.integrity,
    (w) => (w.people[0].profile.aptitudes.precision = "bad"),
    (w) => (w.people[0].state.energy = null),
    (w) => (w.people[0].profile.version = H.VERSION),
  ]) {
    const w = JSON.parse(text);
    mutate(w);
    assert.throws(() => Save.deserialize(JSON.stringify(w)));
  }
  const p = JSON.parse(JSON.stringify(H.createProfile("current", "p")));
  delete p.values.income;
  assert.throws(() => H.migrateProfile(p));
});
test("legacy migration rejects nonfinite JSON before copying can turn it into null", () => {
  const text = fs.readFileSync(
    path.join(__dirname, "fixtures/review1-midproduction.json"),
    "utf8",
  );
  assert.throws(() =>
    Save.deserialize(
      text.replace('"overdueSince":null', '"overdueSince":1e999'),
    ),
  );
  const w = JSON.parse(text);
  w.people[0].pay.overdueSince = Infinity;
  assert.throws(() => Save.migrate(w));
});
test("extension registration rejects inherited references and invalid effects atomically", () => {
  for (const spec of [
    { id: "badRole", nameTh: "bad", skill: "constructor" },
    { id: "badRole", nameTh: "bad", skill: "toString" },
  ]) {
    const w = S.create("role"),
      before = Save.serialize(w);
    assert.throws(() => S.addRole(w, spec));
    assert.equal(Save.serialize(w), before);
  }
  for (const changes of [
    { skill: "constructor" },
    { revenue: 0.5 },
    { revenue: -1 },
    { reputationDelta: 11 },
    { researchPoints: Infinity },
    { requiredMinutes: 1445 },
  ]) {
    const w = S.create("kind"),
      before = Save.serialize(w);
    assert.throws(() =>
      S.addTaskKind(w, {
        id: "externalWork",
        nameTh: "work",
        skill: "engineering",
        stationKind: "research",
        requiredMinutes: 10,
        ...changes,
      }),
    );
    assert.equal(Save.serialize(w), before);
  }
});
test("content identifiers must be actual strings, not coerced missing or null IDs", () => {
  for (const id of [undefined, null, {}, 1]) {
    const w = S.create("bad-content-id"),
      before = Save.serialize(w);
    assert.throws(() =>
      S.addRole(w, { id, nameTh: "role", skill: "engineering" }),
    );
    assert.equal(Save.serialize(w), before);
    assert.throws(() =>
      S.addTaskKind(w, {
        id,
        nameTh: "task",
        skill: "engineering",
        stationKind: "research",
        requiredMinutes: 10,
      }),
    );
    assert.equal(Save.serialize(w), before);
  }
});
test("overflowing economic content is rejected before it can generate or accept orders", () => {
  for (const change of [
    (c) =>
      (c.products.speaker.priceMin = c.products.speaker.priceMax =
        Number.MAX_SAFE_INTEGER),
    (c) => (c.materials.pcb.unitCost = Number.MAX_SAFE_INTEGER),
    (c) => (c.products.speaker.bom.pcb = Number.MAX_SAFE_INTEGER),
    (c) => (c.products.speaker.assemblyMinutes = Number.MAX_SAFE_INTEGER),
  ]) {
    const c = D.createCatalog();
    change(c);
    assert(D.validateCatalog(c).length > 0);
    assert.throws(() => S.create("overflow-content", { catalog: c }));
  }
});
test("unsafe derived order totals reject before touching offers, money or IDs", () => {
  const w = S.create("order-numeric-boundary"),
    offer = Object.values(w.offers)[0];
  offer.unitPrice = Number.MAX_SAFE_INTEGER;
  const before = JSON.stringify(w);
  assert.equal(
    S.command(w, { type: "acceptOffer", offerId: offer.id }).ok,
    false,
  );
  assert.equal(JSON.stringify(w), before);
});
test("enqueue boundaries protect lifecycle fields and reject before consuming IDs", () => {
  const w = S.create("enqueue");
  S.addTaskKind(w, {
    id: "externalWork",
    nameTh: "work",
    skill: "engineering",
    stationKind: "research",
    requiredMinutes: 10,
  });
  for (const [kind, fields] of [
    ["assembly", {}],
    ["externalWork", { kind: "assembly" }],
    ["externalWork", { id: "override" }],
    ["externalWork", { progress: 100 }],
    ["externalWork", { required: 0 }],
    ["externalWork", { skill: "sales" }],
  ]) {
    const before = Save.serialize(w);
    assert.throws(() => S.enqueueTask(w, kind, fields));
    assert.equal(Save.serialize(w), before);
  }
  const j = S.enqueueTask(w, "externalWork");
  assert.equal(j.kind, "externalWork");
  assert.equal(Save.validate(w).length, 0);
});
test("industry skill references are immutable and span future business scenarios", () => {
  for (const id of [
    "aerospaceEngineering",
    "missionControl",
    "automotiveEngineering",
    "financialAnalysis",
    "riskManagement",
    "animalHusbandry",
    "veterinaryCare",
    "foodPreparation",
    "foodSafety",
  ])
    assert(D.INDUSTRY_SKILL_TEMPLATES[id], id);
  assert(Object.isFrozen(D.INDUSTRY_SKILL_TEMPLATES.software.aptitudes));
});
test("freezing a shallow-frozen profile still protects every nested intrinsic dimension", () => {
  const p = JSON.parse(JSON.stringify(H.createProfile("freeze", "p")));
  Object.freeze(p);
  H.freezeProfile(p);
  assert(Object.isFrozen(p.values));
  assert(Object.isFrozen(p.aptitudes));
});
test("nonfinite context memories cannot poison otherwise valid decision scores", () => {
  const p = H.createProfile("memory", "p");
  const scores = H.scoreOptions(
    p,
    {},
    [{ id: "x", impacts: { income: 0.2 } }],
    { memoryBiases: { x: NaN } },
  );
  assert(Number.isFinite(scores[0].score));
});
test("catalog goal content reaches presentation without edits to the human engine", () => {
  const c = D.createCatalog();
  c.lifeGoals = [
    {
      id: "foundAnimalRescue",
      targetSavings: 100000,
      weights: { values: { care: 1, stewardship: 0.5 } },
    },
  ];
  const w = S.create("goal-content", { catalog: c });
  const API = require("../js/api.js"),
    app = API.create("goal-content");
  app.load(Save.serialize(w));
  assert.equal(
    app.snapshot().people[0].aspirations.primaryGoal,
    "foundAnimalRescue",
  );
  assert.equal(
    Save.deserialize(Save.serialize(w)).catalog.lifeGoals[0].id,
    "foundAnimalRescue",
  );
});
test("external job demand reaches actual work, not only pure helper previews", () => {
  const make = (domain) => {
    const w = S.create("demand");
    S.addTaskKind(w, {
      id: "demandTest",
      nameTh: "demand",
      skill: "engineering",
      stationKind: "research",
      requiredMinutes: 1440,
      domain,
      workload: 1.4,
      hazard: 0.4,
      complexity: 0.6,
    });
    const j = S.enqueueTask(w, "demandTest"),
      p = w.people[2],
      station = Object.values(w.layout.stations).find(
        (x) => x.kind === "research",
      );
    p.taskId = j.id;
    p.stationId = station.id;
    p.path = [];
    p.position = { ...station.access };
    p.previousPosition = { ...station.access };
    p.atWork = true;
    j.assignee = p.id;
    assert.equal(w.catalog.taskKinds.demandTest.domain, domain);
    assert.equal(Save.validate(w).length, 0);
    return w;
  };
  const physical = make("physical"),
    cognitive = make("cognitive");
  S.step(physical);
  S.step(cognitive);
  assert(physical.people[2].state.energy < cognitive.people[2].state.energy);
  assert(physical.people[2].state.focus > cognitive.people[2].state.focus);
  assert.equal(Save.validate(physical).length, 0);
});
test("all industry templates can register, train, perform work and survive save/load without core edits", () => {
  const w = S.create("business-matrix"),
    before = JSON.stringify(w.people.map((p) => p.profile)),
    pending = new Set();
  for (const spec of Object.values(D.INDUSTRY_SKILL_TEMPLATES)) {
    S.addSkill(w, spec);
    S.addTaskKind(w, {
      id: spec.id + "Task",
      nameTh: spec.nameTh,
      skill: spec.id,
      stationKind: "research",
      requiredMinutes: 5,
      impacts: { learning: 1, achievement: 1, ambition: 1, duty: 1 },
      revenue: 100,
    });
    pending.add(S.enqueueTask(w, spec.id + "Task").id);
  }
  let v = Save.deserialize(Save.serialize(w));
  for (let i = 0; i < 60 && pending.size; i++) {
    S.advance(w, 120);
    S.advance(v, 120);
    for (const t of w.history.tasks) pending.delete(t.id);
  }
  assert.equal(pending.size, 0, "each future skill must complete real work");
  assert.equal(Save.serialize(w), Save.serialize(v));
  assert.equal(JSON.stringify(w.people.map((p) => p.profile)), before);
  assert.equal(Save.validate(w).length, 0);
  assert(
    w.people.some((p) =>
      Object.keys(D.INDUSTRY_SKILL_TEMPLATES).some(
        (id) => p.skills[id].totalXp > 0,
      ),
    ),
  );
});
