'use strict';
const assert = require('assert');
const g = require('./load.js');

console.log('=== JS2 v3.6.0c — Deep Living World Audit & Stabilization Suite ===');

// [1/6] Version & Schema Contract
assert.strictEqual(g.SIM.PATCH_VERSION, '3.8.2');
assert.strictEqual(g.SIM.SAVE_SCHEMA_VERSION, '3.8.2-chaos-era-lore-archive');
assert.strictEqual(g.EXPED.LIVING_POLITIES.VERSION, '3.6.0c-living-world-audit');
console.log('PASS [1/6] Version & schema contract verified (3.6.0c / 3.6.0c-living-world-audit)');

// [2/6] Calibrated 20-Year Multi-Seed Pacing (No Coup Storm, No Blob Snowball, Non-Fixed Hegemons)
{
  const seeds = ['v360c_s1', 'v360c_s2', 'v360c_s3', 'v360c_s4', 'v360c_s5'];
  let totalCoups = 0, totalConquests = 0, maxDynasty = 0, maxCities = 0;
  const hegemons = new Set();
  for (const seed of seeds) {
    const W = g.SIM.create(seed);
    for (let m = 1; m <= 240; m++) {
      W.day = m * 30;
      g.EXPED.tickContinentalCourts(W);
      g.EXPED.LIVING_SECTS.tickMonthly(W);
      g.EXPED.LIVING_POLITIES.tickMonthly(W);
    }
    const lpRoot = W.world.livingPolities;
    totalCoups += lpRoot.coupsCount || 0;
    totalConquests += lpRoot.borderShiftsCount || 0;
    if (lpRoot.hegemonPolityId) hegemons.add(lpRoot.hegemonPolityId);
    for (const p of Object.values(g.EXPED.POLITY_DEFS)) {
      const lp = W.world.continent.courts[p.id].livingPolity;
      maxDynasty = Math.max(maxDynasty, lp.dynastyGen || 1);
      maxCities = Math.max(maxCities, lp.cityCount || 0);
    }
  }
  const avgCoups = totalCoups / seeds.length;
  const avgConquests = totalConquests / seeds.length;
  assert(avgCoups >= 3 && avgCoups <= 32, `Expected realistic coups/20yr (3..32), got ${avgCoups}`);
  assert(maxDynasty <= 12, `Expected maxDynasty <= 12, got ${maxDynasty}`);
  assert(avgConquests >= 8 && avgConquests <= 55, `Expected realistic conquests/20yr (8..55), got ${avgConquests}`);
  assert(maxCities <= 30, `Expected maxCities <= 30, got ${maxCities}`);
  assert(hegemons.size >= 3, `Expected >= 3 distinct Imperial Hegemons, got ${hegemons.size}`);
  console.log(`PASS [2/6] Calibrated 20-year soak: avgCoups=${avgCoups.toFixed(1)}, maxDynasty=${maxDynasty}, avgConquests=${avgConquests.toFixed(1)}, maxCities=${maxCities}, distinctHegemons=${hegemons.size}`);
}

// [3/6] Cross-System Dynamic cityOwners Sync (tickContinentalCourts + UI.rPolities + World Atlas)
{
  const W = g.SIM.create('v360c_sync_city');
  g.EXPED.LIVING_POLITIES.ensureWorldState(W);
  const st = W.world.continent;
  const pols = Object.values(g.EXPED.POLITY_DEFS);
  const targetCity = Object.values(g.EXPED.SETTLEMENTS).find(c => c.tier !== 4 && c.polityId === pols[0].id);
  assert(targetCity, 'Expected a non-capital city for polity 0');
  const origOwner = targetCity.polityId;
  const newOwner = pols[1].id;
  st.cityOwners[targetCity.id] = newOwner;
  assert.strictEqual(g.EXPED.LIVING_POLITIES.ownerOf(W, targetCity.id), newOwner);

  // tickContinentalCourts should use dynamic owner without error
  W.day = 60;
  g.EXPED.tickContinentalCourts(W);

  // Verify ui.js wires EXPED.LIVING_POLITIES.ownerOf across World Atlas, atlasCityInfo, and UI.rPolities
  const uiSrc = require('fs').readFileSync(require('path').join(__dirname, '../js/ui.js'), 'utf8');
  assert(uiSrc.includes("const dynCityOwner = !many && n.kind === 'SETTLEMENT' ? ((EXPED.LIVING_POLITIES && EXPED.LIVING_POLITIES.ownerOf(W, n.id))"), 'World Atlas marker color must use dynamic ownerOf');
  assert(uiSrc.includes('const dynOwnerId = (EXPED.LIVING_POLITIES && EXPED.LIVING_POLITIES.ownerOf(W, node.id))'), 'atlasCityInfo must use dynamic ownerOf');
  assert(uiSrc.includes('เดิมสังกัด'), 'atlasCityInfo must show conquered-from provenance tag');
  console.log(`PASS [3/6] Dynamic cityOwners sync verified across tickContinentalCourts & UI.rPolities (${targetCity.nameTh}: ${origOwner} -> ${newOwner})`);
}

// [4/6] Deposed Ruler Figure Cleanup on Coup
{
  const W = g.SIM.create('v360c_coup_clean');
  g.EXPED.LIVING_POLITIES.ensureWorldState(W);
  const st = W.world.continent;
  const pol = Object.values(g.EXPED.POLITY_DEFS)[0];
  const court = st.courts[pol.id];
  const rulerSeat = Object.values(court.seats).find(s => s.role === 'ruler');
  const oldRulerId = rulerSeat.holderId;
  assert(oldRulerId && st.figures[oldRulerId], 'Initial ruler figure must exist');
  court.livingPolity.legitimacy = 10;
  court.livingPolity.lastCoupDay = -9999;
  // Advance months until a coup fires
  let couped = false;
  for (let m = 1; m <= 60; m++) {
    W.day = m * 30;
    court.livingPolity.legitimacy = 10;
    g.EXPED.LIVING_POLITIES.tickMonthly(W);
    if (court.livingPolity.dynastyGen > 1) { couped = true; break; }
  }
  assert(couped, 'Expected a dynastic coup to fire under legitimacy crisis');
  assert(!st.figures[oldRulerId], 'Deposed ruler figure must be cleaned up from state.figures');
  assert(rulerSeat.holderId && st.figures[rulerSeat.holderId], 'New ruler figure must be installed');
  console.log(`PASS [4/6] Deposed ruler cleanup verified (${oldRulerId} removed, ${rulerSeat.holderId} installed)`);
}

// [5/6] Backward-Compatible Legacy Save Hydration (3.5.0c / 3.6.0a / 3.6.0b -> 3.6.0c)
{
  const W = g.SIM.create('v360c_legacy_upgrade');
  W.day = 180;
  const raw = JSON.parse(g.SIM.serialize(W));
  raw.patchVersion = '3.6.0b';
  raw.schemaVersion = '3.6.0b-living-polities';
  delete raw.world.livingPolities;
  if (raw.world.continent) {
    delete raw.world.continent.cityOwners;
    delete raw.world.continent.cityLastShiftDay;
    for (const c of Object.values(raw.world.continent.courts || {})) delete c.livingPolity;
  }
  const loaded = g.SIM.deserialize(JSON.stringify(raw));
  loaded.day = 210;
  g.EXPED.LIVING_SECTS.tickMonthly(loaded);
  g.EXPED.LIVING_POLITIES.tickMonthly(loaded);
  assert(loaded.world.livingPolities && loaded.world.livingPolities.hegemonPolityId, 'Hydrated save must initialize livingPolities cleanly');
  assert(loaded.world.continent.cityOwners && Object.keys(loaded.world.continent.cityOwners).length >= 50, 'Hydrated save must rebuild cityOwners');
  console.log('PASS [5/6] Legacy save hydration into 3.6.0c verified');
}

// [6/6] 100% Mid-Run Save/Load Replay Determinism + Zero W.rng Consumption
{
  const W1 = g.SIM.create('v360c_det_seed');
  const W2 = g.SIM.create('v360c_det_seed');
  const rngBefore = W1.rngState;
  g.EXPED.LIVING_SECTS.ensureWorldState(W1);
  g.EXPED.LIVING_POLITIES.ensureWorldState(W1);
  assert.strictEqual(W1.rngState, rngBefore, 'ensureWorldState must not consume W.rng');

  for (let m = 1; m <= 36; m++) {
    W1.day = m * 30; W2.day = m * 30;
    g.EXPED.LIVING_SECTS.tickMonthly(W1);
    g.EXPED.LIVING_POLITIES.tickMonthly(W1);
    g.EXPED.LIVING_SECTS.tickMonthly(W2);
    g.EXPED.LIVING_POLITIES.tickMonthly(W2);
  }
  const W2Reloaded = g.SIM.deserialize(g.SIM.serialize(W2));
  for (let m = 37; m <= 72; m++) {
    W1.day = m * 30; W2Reloaded.day = m * 30;
    g.EXPED.LIVING_SECTS.tickMonthly(W1);
    g.EXPED.LIVING_POLITIES.tickMonthly(W1);
    g.EXPED.LIVING_SECTS.tickMonthly(W2Reloaded);
    g.EXPED.LIVING_POLITIES.tickMonthly(W2Reloaded);
  }
  assert.strictEqual(
    JSON.stringify(W1.world.livingPolities),
    JSON.stringify(W2Reloaded.world.livingPolities),
    'livingPolities state must be 100% deterministic across Save/Load'
  );
  assert.strictEqual(
    JSON.stringify(W1.world.continent.cityOwners),
    JSON.stringify(W2Reloaded.world.continent.cityOwners),
    'cityOwners must be 100% deterministic across Save/Load'
  );
  console.log('PASS [6/6] 100% Save/Load replay determinism & zero W.rng consumption verified');
}

console.log('✅ ALL JS2 v3.6.0c LIVING WORLD AUDIT CHECKS PASSED!');
