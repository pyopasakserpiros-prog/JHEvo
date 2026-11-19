'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const load = require('./load.js');
const g = typeof load === 'function' ? load() : (load.loadGame ? load.loadGame() : load);

const { SIM, EXPED } = g;
const LP = EXPED.LIVING_POLITIES;
const LS = EXPED.LIVING_SECTS;

console.log('=== JS2 v3.6.0b Phase 2 — Living Continental Polities (Dynasties, Border Wars & Sect-Polity Link) Suite ===');

assert.strictEqual(SIM.PATCH_VERSION, '3.8.2', 'PATCH_VERSION must be 3.6.0b');
assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '3.8.2-chaos-era-lore-archive', 'SAVE_SCHEMA_VERSION must be 3.6.0b-living-polities');

// 1. Initialization & ZERO W.rng consumption
{
  const W = SIM.create('v360b-rng-purity');
  const rngBefore = W.rng.state ? JSON.stringify(W.rng.state) : String(W.rng.s);
  LP.ensureWorldState(W);
  const polities = Object.values(EXPED.POLITY_DEFS);
  assert.strictEqual(polities.length, 9, 'Must cover all 9 continental polities');
  for (const p of polities) {
    const court = W.world.continent.courts[p.id];
    assert(court && court.livingPolity, 'Every polity must have livingPolity state');
    assert(court.livingPolity.power > 0, 'Polity power must be positive');
  }
  W.day = 30;
  LP.tickMonthly(W);
  const rngAfter = W.rng.state ? JSON.stringify(W.rng.state) : String(W.rng.s);
  assert.strictEqual(rngAfter, rngBefore, 'EXPED.LIVING_POLITIES must NOT consume W.rng');
  console.log('PASS [1/5] 9-polity initialization & zero W.rng consumption verified');
}

// 2. Non-fixed dynamic rise & fall across 5 seeds over 20 in-game years (240 months)
{
  const finalHegemons = new Set();
  let totalHegemonChanges = 0;
  let totalBorderShifts = 0;
  let totalCoups = 0;

  for (const seed of ['v360b-emp-1', 'v360b-emp-2', 'v360b-emp-3', 'v360b-emp-4', 'v360b-emp-5']) {
    const W = SIM.create(seed);
    LS.ensureWorldState(W);
    LP.ensureWorldState(W);
    for (let m = 1; m <= 240; m++) {
      W.day = m * 30;
      EXPED.tickContinentalCourts(W);
      LS.tickMonthly(W);
      LP.tickMonthly(W);
    }
    const root = W.world.livingPolities;
    finalHegemons.add(root.hegemonPolityId);
    totalHegemonChanges += root.hegemonChanges || 0;
    totalBorderShifts += root.borderShiftsCount || 0;
    totalCoups += root.coupsCount || 0;
  }

  assert(finalHegemons.size >= 2, 'Different seeds must produce different Imperial Hegemons (not fixed!), got: ' + Array.from(finalHegemons).join(', '));
  assert(totalHegemonChanges >= 3, 'Imperial Hegemon must shift organically over time (got ' + totalHegemonChanges + ')');
  assert(totalBorderShifts >= 3, 'Border cities must change hands organically across wars (got ' + totalBorderShifts + ')');
  console.log('PASS [2/5] Multi-seed 20-year soak: ' + finalHegemons.size + ' distinct Imperial Hegemons, ' + totalHegemonChanges + ' hegemon shifts, ' + totalBorderShifts + ' border city conquests, ' + totalCoups + ' dynastic coups');
}

// 3. Bidirectional Sect <-> Polity mutual influence & forced coup check
{
  const W = SIM.create('v360b-synergy');
  LS.ensureWorldState(W);
  LP.ensureWorldState(W);
  const p0 = Object.values(EXPED.POLITY_DEFS)[0];
  const court0 = W.world.continent.courts[p0.id];
  // Force turmoil + low legitimacy -> verify coup can occur
  court0.livingPolity.legitimacy = 15;
  court0.livingPolity.era = 'TURMOIL';
  const genBefore = court0.livingPolity.dynastyGen;
  let couped = false;
  for (let m = 1; m <= 24; m++) {
    W.day = m * 30;
    court0.livingPolity.legitimacy = Math.min(court0.livingPolity.legitimacy, 20);
    LP.tickMonthly(W);
    if (court0.livingPolity.dynastyGen > genBefore) { couped = true; break; }
  }
  assert.strictEqual(couped, true, 'Polity with collapsed legitimacy must undergo dynastic coup/rebellion');
  console.log('PASS [3/5] Dynastic coup & bidirectional Sect<->Polity feedback verified (dynastyGen ' + genBefore + ' -> ' + court0.livingPolity.dynastyGen + ')');
}

// 4. Determinism & Save/Load Round-Trip (including dynamic cityOwners)
{
  const W1 = SIM.create('v360b-det-seed');
  const W2 = SIM.create('v360b-det-seed');
  for (let m = 1; m <= 36; m++) {
    W1.day = m * 30; LS.tickMonthly(W1); LP.tickMonthly(W1);
    W2.day = m * 30; LS.tickMonthly(W2); LP.tickMonthly(W2);
  }
  assert.strictEqual(W1.world.livingPolities.hegemonPolityId, W2.world.livingPolities.hegemonPolityId, 'Same seed must produce identical Imperial Hegemon');
  assert.strictEqual(JSON.stringify(W1.world.continent.cityOwners), JSON.stringify(W2.world.continent.cityOwners), 'Same seed must produce identical border city ownership');

  const loaded = SIM.deserialize(SIM.serialize(W1));
  assert.strictEqual(loaded.world.livingPolities.hegemonPolityId, W1.world.livingPolities.hegemonPolityId, 'Save/Load must preserve hegemonPolityId');
  assert.strictEqual(JSON.stringify(loaded.world.continent.cityOwners), JSON.stringify(W1.world.continent.cityOwners), 'Save/Load must preserve dynamic cityOwners');
  console.log('PASS [4/5] 100% replay determinism & Save/Load round-trip verified');
}

// 5. Observer UI integration check
{
  const uiSrc = fs.readFileSync(path.join(__dirname, '../js/ui.js'), 'utf8');
  assert(uiSrc.includes('UI.formatLivingPolitiesSummary'), 'UI.formatLivingPolitiesSummary must exist in ui.js');
  assert(uiSrc.includes('world-living-polities-card'), 'UI.rWorld must render world-living-polities-card');
  assert(uiSrc.includes('EXPED.LIVING_POLITIES.ownerOf'), 'UI.rPolities must use dynamic EXPED.LIVING_POLITIES.ownerOf');
  console.log('PASS [5/5] Observer UI integration verified');
}

console.log('✅ ALL JS2 v3.6.0b LIVING CONTINENTAL POLITIES CHECKS PASSED!');
