"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict");
let H;
try {
  H = require("../js/human-core.js");
} catch (e) {
  if (e.code !== "MODULE_NOT_FOUND") throw e;
}
test("human core exposes the standalone model", () =>
  assert.ok(H, "human core implementation is missing"));
const core = (name, fn) => test(name, { skip: !H }, fn);
const spec = {
  id: "assembly",
  aptitudes: { dexterity: 0.5, precision: 0.3, organization: 0.2 },
};
core("profile generation is deterministic and domain keyed", () => {
  const a = H.createProfile("seed", "employee-1"),
    b = H.createProfile("seed", "employee-1");
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, H.createProfile("seed", "employee-2"));
  assert.equal(H.PERSONALITY.length, 14);
  assert.equal(H.VALUES.length, 18);
  assert.equal(H.APTITUDES.length, 30);
  for (let i = 0; i < 200; i++) {
    const p = H.createProfile("population", String(i));
    for (const group of ["personality", "values", "aptitudes", "potential"])
      for (const value of Object.values(p[group]))
        assert(value >= 0 && value <= 100);
    for (const k of Object.keys(p.aptitudes))
      assert(p.potential[k] >= p.aptitudes[k]);
  }
  assert(Object.isFrozen(a));
  assert(Object.isFrozen(a.personality));
  assert.throws(() => {
    a.personality.integrity = 1;
  });
});
core(
  "new registered skills do not shift existing skill values or innate profiles",
  () => {
    const p = H.createProfile("seed", "person"),
      before = JSON.stringify(p),
      a = H.createSkill(p, spec);
    H.createSkill(p, { id: "new-law-skill", aptitudes: { analytical: 1 } });
    assert.deepEqual(a, H.createSkill(p, spec));
    assert.equal(JSON.stringify(p), before);
    assert.throws(() => H.createProfile({}, "x"));
    assert.throws(() =>
      H.createSkill(p, { id: "bad", aptitudes: { doesNotExist: 1 } }),
    );
    assert.throws(() =>
      H.createSkill(p, { id: "bad", aptitudes: { precision: -1 } }),
    );
  },
);
core(
  "skill learning improves practice without mutating innate ability or its input",
  () => {
    const p = H.createProfile("learner", "p"),
      s = H.createSkill(p, spec),
      before = JSON.stringify(s),
      trained = H.learn(p, s, spec, 600);
    assert(trained.totalXp > s.totalXp);
    assert(trained.level >= s.level);
    assert.equal(JSON.stringify(s), before);
    assert(trained.level <= H.skillCap(p, spec));
    assert.throws(() => H.learn(p, s, spec, -5));
  },
);
core(
  "skill decay and memory-assisted rust recovery preserve historical totalXp",
  () => {
    const p = H.createProfile("rust-test", "p"),
      s = H.createSkill(p, spec),
      trained = H.learn(p, s, spec, 2400),
      decayed = H.decaySkill(p, trained, spec, 90);
    assert(decayed.level <= trained.level);
    assert.equal(decayed.totalXp, trained.totalXp);
    const freshGain = H.learn(
        p,
        { ...s, level: decayed.level, xp: 0, totalXp: 0 },
        spec,
        60,
      ).totalXp,
      rustRecoveryGain =
        H.learn(p, decayed, spec, 60).totalXp - decayed.totalXp;
    assert(rustRecoveryGain > freshGain);
  },
);
core(
  "health, fatigue and burnout change work ability independently of skill",
  () => {
    const p = H.createProfile("worker", "p"),
      s = H.createSkill(p, spec),
      state = H.createState(p),
      normal = H.evaluateAbility(p, state, s, spec),
      tired = H.evaluateAbility(
        p,
        { ...state, energy: 8, focus: 7, health: 40, stress: 95, burnout: 90 },
        s,
        spec,
      );
    assert(normal.speedMultiplier > tired.speedMultiplier);
    assert(normal.qualityChance > tired.qualityChance);
    assert(Number.isFinite(tired.speedMultiplier));
    assert(tired.qualityChance >= 0 && tired.qualityChance <= 1);
  },
);
core(
  "sleep, food and rest recover different needs; coffee is not full recovery",
  () => {
    const p = H.createProfile("needs", "p"),
      s = {
        ...H.createState(p),
        energy: 25,
        focus: 20,
        hunger: 80,
        stress: 80,
        burnout: 40,
      };
    const sleep = H.tickState(p, s, { activity: "sleep", minutes: 120 }),
      meal = H.tickState(p, s, { activity: "meal", minutes: 30 }),
      rest = H.tickState(p, s, { activity: "rest", minutes: 60 }),
      work = H.tickState(p, s, { activity: "work", minutes: 60, workload: 1 });
    assert(sleep.energy > s.energy);
    assert(meal.hunger < s.hunger);
    assert(rest.stress < s.stress);
    assert(work.energy < s.energy);
    assert(work.burnout >= s.burnout);
    assert.equal(s.energy, 25);
    for (const st of [sleep, meal, rest, work])
      for (const v of Object.values(st))
        assert(Number.isFinite(v) && v >= 0 && v <= 100);
  },
);
core(
  "offDuty home life regulates hunger and introverts do not lock socialNeed at 100",
  () => {
    const base = JSON.parse(JSON.stringify(H.createProfile("introvert", "p")));
    base.personality.sociability = 12;
    const introvert = H.freezeProfile(base);
    const hungry = { ...H.createState(introvert), hunger: 68, socialNeed: 85 };
    const afterEvening = H.tickState(introvert, hungry, {
      activity: "offDuty",
      minutes: 240,
    });
    assert(afterEvening.hunger < hungry.hunger);
    assert(afterEvening.socialNeed < hungry.socialNeed);
    const afterQuietRest = H.tickState(introvert, hungry, {
      activity: "rest",
      minutes: 60,
    });
    assert(afterQuietRest.socialNeed < hungry.socialNeed);
  },
);
core(
  "employees can decline overtime and voice concerns before resignation",
  () => {
    const p = H.createProfile("agency", "p"),
      s = { ...H.createState(p), energy: 5, burnout: 90, lifeBurden: 90 };
    const r = H.respondToRequest(p, s, {
      hours: 3,
      payMultiplier: 3,
      urgency: 1,
    });
    assert.equal(r.decision, "decline");
    assert(r.reasons.length);
    assert.equal(r.maxMinutes, 0);
    const v = H.workplaceVoice(
      p,
      { ...s, morale: 10 },
      { unpaidDays: 4, unresolvedDays: 8 },
    );
    assert(v.reasons.length);
    assert(["raiseConcern", "considerLeaving"].includes(v.action));
    const burnoutQuit = H.workplaceVoice(
      p,
      { ...s, morale: 45, burnout: 90 },
      { unpaidDays: 0, unresolvedDays: 6 },
    );
    assert.equal(burnoutQuit.action, "considerLeaving");
  },
);
core(
  "normalisation and serialised profile validation reject damaged data",
  () => {
    const p = H.createProfile("save", "p");
    assert.equal(H.validateProfile(JSON.parse(JSON.stringify(p))).length, 0);
    const broken = JSON.parse(JSON.stringify(p));
    broken.personality.integrity = NaN;
    assert(H.validateProfile(broken).length > 0);
    const st = H.normaliseState({ energy: 200, focus: -3, stress: NaN });
    assert.equal(st.energy, 100);
    assert.equal(st.focus, 0);
    assert(Number.isFinite(st.stress));
  },
);
core(
  "a generic choice interface explains motives and supports new outside activities",
  () => {
    const p = H.createProfile("choice", "p"),
      s = H.createState(p),
      options = [
        {
          id: "study",
          impacts: { learning: 1, achievement: 0.3, novelty: 1 },
          effort: 0.2,
        },
        {
          id: "rest",
          impacts: { energy: 1, stress: 1, workLifeBalance: 0.5 },
          effort: 0,
        },
      ];
    const before = JSON.stringify({ p, s, options });
    const choice = H.scoreOptions(p, s, options);
    assert.equal(choice.length, 2);
    assert(
      choice.every((c) => Number.isFinite(c.score) && c.contributions.length),
    );
    assert.deepEqual(choice, H.scoreOptions(p, s, options));
    assert.equal(JSON.stringify({ p, s, options }), before);
    const exhausted = H.scoreOptions(
      p,
      { ...s, energy: 0, stress: 99 },
      options,
    );
    assert.equal(exhausted[0].id, "rest");
    assert.throws(() =>
      H.scoreOptions(p, s, [{ id: "bad", impacts: { notAMotive: 1 } }]),
    );
  },
);
core(
  "sleep debt accumulates while awake, recovers in sleep, and affects work ability",
  () => {
    const p = H.createProfile("sleep", "p"),
      s = { ...H.createState(p), sleepDebt: 0 },
      awake = H.tickState(p, s, { activity: "work", minutes: 120 });
    assert(awake.sleepDebt > 0);
    const slept = H.tickState(p, awake, { activity: "sleep", minutes: 120 });
    assert(slept.sleepDebt < awake.sleepDebt);
    const skill = H.createSkill(p, spec);
    assert(
      H.evaluateAbility(p, { ...s, sleepDebt: 90 }, skill, spec)
        .speedMultiplier < H.evaluateAbility(p, s, skill, spec).speedMultiplier,
    );
  },
);
core(
  "aspirations, life purchases (car/house), life events, romance/interactions, and multi-industry fit work purely",
  () => {
    const pA = H.createProfile("future", "emp-a"),
      pB = H.createProfile("future", "emp-b"),
      sA = H.createState(pA),
      sB = H.createState(pB);
    const asp = H.deriveAspirations(pA, sA, { wallet: 500000 });
    assert(typeof asp.primaryGoal === "string" && asp.targetSavings > 0);
    assert(asp.hustleDrive >= 10 && asp.hustleDrive <= 100);
    assert(asp.savingPropensity > 0 && asp.savingPropensity < 1);
    const car = {
      id: "compact-car",
      cost: 12000000,
      impacts: { comfort: 0.85, autonomy: 0.6, recognition: 0.5 },
    };
    assert.equal(
      H.evaluateLifePurchase(pA, sA, car, 100000).affordableNow,
      false,
    );
    assert.equal(
      H.evaluateLifePurchase(pA, sA, car, 30000000).affordableNow,
      true,
    );
    const bought = H.evaluateLifeEvent(pA, sA, {
      type: "assetPurchased",
      category: "home",
    });
    assert(bought.state.fulfillment >= sA.fulfillment);
    assert(bought.state.morale >= sA.morale);
    const inter = H.evaluateInteraction(pA, sA, pB, sB, { mode: "romance" });
    assert(inter.compatibility >= 5 && inter.compatibility <= 98);
    assert(inter.romanticSpark >= 5 && inter.romanticSpark <= 99);
    const fitList = H.evaluateIndustryFit(pA, {
      software: {
        id: "software",
        aptitudes: { analytical: 0.5, memory: 0.3, learningSpeed: 0.2 },
      },
      construction: {
        id: "construction",
        aptitudes: { strength: 0.4, stamina: 0.3, spatial: 0.3 },
      },
    });
    assert.equal(fitList.length, 2);
    assert(fitList[0].transitionScore >= fitList[1].transitionScore);
  },
);
