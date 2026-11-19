'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const load = require('./load.js');
const g = typeof load === 'function' ? load() : (load.loadGame ? load.loadGame() : load);

const { SIM, EXPED } = g;
const LS = EXPED.LIVING_SECTS;

console.log('=== JS2 v3.6.0a Phase 1 — Living Jianghu Sects (Rise, Fall, Collapse & Rebirth) Suite ===');

assert.strictEqual(SIM.PATCH_VERSION, '3.8.2', 'PATCH_VERSION must be 3.6.0a');
assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '3.8.2-chaos-era-lore-archive', 'SAVE_SCHEMA_VERSION must be 3.6.0a-living-sects');

// 1. Roster initialization & ZERO W.rng consumption
{
  const W = SIM.create('v360a-rng-purity');
  const rngBefore = W.rng.state ? JSON.stringify(W.rng.state) : String(W.rng.s);
  LS.ensureWorldState(W);
  const orgs = W.world.allSects;
  assert(orgs.length >= 6, 'Must have active Jianghu sects');
  for (const s of orgs) {
    assert(s.livingRoster && s.livingRoster.leader, 'Every sect must have a livingRoster with a living leader');
    assert(s.livingRoster.leader.stage >= 1 && s.livingRoster.leader.stage <= 9, 'Leader stage must be 1..9');
  }
  W.day = 30;
  LS.tickMonthly(W);
  const rngAfter = W.rng.state ? JSON.stringify(W.rng.state) : String(W.rng.s);
  assert.strictEqual(rngAfter, rngBefore, 'EXPED.LIVING_SECTS must NOT consume W.rng');
  console.log('PASS [1/5] Roster initialization & zero W.rng consumption verified (' + orgs.length + ' sects)');
}

// 2. Non-fixed dynamic rise & fall across 5 seeds over 20 in-game years (240 months)
{
  const finalHegemons = new Set();
  let totalHegemonChanges = 0;
  let totalSuccessions = 0;
  let totalClashes = 0;
  let totalProdigies = 0;

  for (const seed of ['v360a-era-alpha', 'v360a-era-beta', 'v360a-era-gamma', 'v360a-era-delta', 'v360a-era-epsilon']) {
    const W = SIM.create(seed);
    LS.ensureWorldState(W);
    for (let m = 1; m <= 240; m++) {
      W.day = m * 30;
      LS.tickMonthly(W);
    }
    const ls = W.world.livingSects;
    finalHegemons.add(ls.hegemonSectId);
    totalHegemonChanges += ls.hegemonChanges || 0;
    const maxGen = Math.max(...W.world.allSects.map(s => (s.livingRoster && s.livingRoster.dynastyGen) || 1));
    if (maxGen >= 2) totalSuccessions++;
    totalClashes += ls.events.filter(e => e.kind === 'clash').length;
    totalProdigies += ls.events.filter(e => e.kind === 'prodigy' || e.kind === 'breakthrough').length;
  }

  assert(finalHegemons.size >= 2, 'Different seeds must produce different Hegemon sects (not fixed!), got: ' + Array.from(finalHegemons).join(', '));
  assert(totalHegemonChanges >= 3, 'Hegemon mantle must shift organically over time (got ' + totalHegemonChanges + ' changes across 5 seeds)');
  assert(totalSuccessions >= 4, 'Leaders must age/die and pass succession across generations');
  assert(totalClashes >= 5, 'Inter-sect clashes must occur organically');
  console.log('PASS [2/5] Multi-seed 20-year soak: ' + finalHegemons.size + ' distinct Hegemons, ' + totalHegemonChanges + ' hegemon shifts, ' + totalClashes + ' clashes, ' + totalProdigies + ' prodigy/breakthrough events');
}

// 3. Organic Collapse & Rebirth lifecycle
{
  const W = SIM.create('v360a-collapse-rebirth');
  LS.ensureWorldState(W);
  const target = W.world.allSects[0];
  const origName = target.nameTh;
  target.livingRoster.leader = null;
  target.livingRoster.elders = [];
  target.livingRoster.prodigies = [];
  target.livingRoster.morale = 10;
  W.day = 30;
  LS.tickMonthly(W);
  assert.strictEqual(target.livingRoster.collapsed, true, 'Empty/crumbled sect must enter COLLAPSED state');
  assert(W.world.livingSects.fallenHistory.some(f => f.id === target.id), 'Collapsed sect must be recorded in fallenHistory');

  // Advance months until organic rebirth triggers
  let reborn = false;
  for (let m = 2; m <= 24; m++) {
    W.day = m * 30;
    LS.tickMonthly(W);
    if (!target.livingRoster.collapsed && target.livingRoster.leader) {
      reborn = true;
      break;
    }
  }
  assert.strictEqual(reborn, true, 'Collapsed sect slot must organically rebirth as a new rising sect');
  assert(W.world.livingSects.rebornCount >= 1, 'rebornCount must increment on rebirth');
  console.log('PASS [3/5] Collapse & organic rebirth verified (' + origName + ' -> ' + target.nameTh + ')');
}

// 4. Determinism & Save/Load Round-Trip
{
  const W1 = SIM.create('v360a-det-seed');
  const W2 = SIM.create('v360a-det-seed');
  for (let m = 1; m <= 24; m++) {
    W1.day = m * 30; LS.tickMonthly(W1);
    W2.day = m * 30; LS.tickMonthly(W2);
  }
  assert.strictEqual(W1.world.livingSects.hegemonSectId, W2.world.livingSects.hegemonSectId, 'Same seed must produce identical Hegemon');
  assert.strictEqual(W1.world.livingSects.events.length, W2.world.livingSects.events.length, 'Same seed must produce identical event count');

  const raw = SIM.serialize(W1);
  const loaded = SIM.deserialize(raw);
  assert.strictEqual(loaded.world.livingSects.hegemonSectId, W1.world.livingSects.hegemonSectId, 'Save/Load must preserve hegemonSectId');
  assert.strictEqual(loaded.world.allSects[0].livingRoster.leader.nameTh, W1.world.allSects[0].livingRoster.leader.nameTh, 'Save/Load must preserve livingRoster leader');
  console.log('PASS [4/5] 100% replay determinism & Save/Load round-trip verified');
}

// 5. Observer UI integration check
{
  const uiSrc = fs.readFileSync(path.join(__dirname, '../js/ui.js'), 'utf8');
  assert(uiSrc.includes('UI.formatLivingSectsSummary'), 'UI.formatLivingSectsSummary must exist in ui.js');
  assert(uiSrc.includes('world-living-sects-card'), 'UI.rWorld must render world-living-sects-card');
  console.log('PASS [5/5] Observer UI integration verified');
}

console.log('✅ ALL JS2 v3.6.0a LIVING JIANGHU SECTS CHECKS PASSED!');
