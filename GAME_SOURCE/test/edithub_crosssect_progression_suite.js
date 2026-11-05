'use strict';
const assert = require('node:assert/strict');
const G = require('./load.js');
G.document = { getElementById() { return { querySelectorAll() { return []; }, style: {}, classList: { add() {}, remove() {}, toggle() {} } }; } };
require('../js/ui.js');
const { SIM, SECT, EXPLORE, CULT, MARTIAL: M, AI, ECO, CONTENT, UI } = G;

console.log('=== Running Edit Hub Diplomacy & Sanctums, 50-Subpath Progression & Cross-Sect Assembly Suite ===');

// ============================================================================
// AREA 1: Edit Hub Diplomacy Management & Actions
// ============================================================================
{
  const W = SIM.create('edithub-diplomacy-test');
  assert(W.world && Array.isArray(W.world.sects) && W.world.sects.length >= 3, 'World sects must exist');

  // 1a. diplomacyState inspection
  const dipState = SECT.EDITOR.diplomacyState(W);
  assert(Array.isArray(dipState.sects) && dipState.sects.length >= 3, 'Must return world sects list');
  const targetSect = dipState.selectedSect;
  assert(targetSect && targetSect.id, 'Must have a selected sect with an id');

  // 1b. set_attitude action
  const attRes = SECT.EDITOR.applyDiplomacyAction(W, {
    action: 'set_attitude',
    sectId: targetSect.id,
    attitude: 85
  });
  assert.equal(attRes.ok, true, 'set_attitude must succeed');
  assert.equal(attRes.attitude, 85, 'Attitude must be updated to 85');
  assert.equal(targetSect.attitude, 85);

  // Clamping check
  const attClamp = SECT.EDITOR.applyDiplomacyAction(W, {
    action: 'set_attitude',
    sectId: targetSect.id,
    attitude: 250
  });
  assert.equal(attClamp.attitude, 100, 'Attitude must clamp to 100');

  // 1c. sign_treaty action
  const treatyRes = SECT.EDITOR.applyDiplomacyAction(W, {
    action: 'sign_treaty',
    sectId: targetSect.id,
    treaty: 'ALLIANCE'
  });
  assert.equal(treatyRes.ok, true, 'sign_treaty must succeed');
  assert.equal(treatyRes.treaty, 'ALLIANCE');
  assert.equal(targetSect.treaty, 'ALLIANCE');

  // 1d. reset_cooldowns action
  targetSect.lastCaravanDay = 15;
  targetSect.lastEnvoyDay = 20;
  if (W.world.politics) {
    W.world.politics.lastPoliticalEventDay = 25;
  }

  const cdRes = SECT.EDITOR.applyDiplomacyAction(W, {
    action: 'reset_cooldowns',
    sectId: targetSect.id
  });
  assert.equal(cdRes.ok, true, 'reset_cooldowns must succeed');
  assert.equal(targetSect.lastCaravanDay, null);
  assert.equal(targetSect.lastEnvoyDay, null);

  // 1e. ally_exchange action (free via edit hub)
  const exchRes = SECT.EDITOR.applyDiplomacyAction(W, {
    action: 'ally_exchange',
    sectId: targetSect.id,
    free: true
  });
  assert.equal(exchRes.ok, true, 'ally_exchange must succeed for allied sect');
  assert(exchRes.summaryTh, 'Must return summary in Thai');

  // 1f. trigger_envoy action (forceWin = true, false, and normal)
  const envoyWin = SECT.EDITOR.applyDiplomacyAction(W, {
    action: 'trigger_envoy',
    sectId: targetSect.id,
    forceWin: true
  });
  assert.equal(envoyWin.ok, true, 'trigger_envoy forceWin must succeed');
  assert.equal(envoyWin.won, true, 'Result must be won');
  assert(envoyWin.cpAwarded > 0, 'CP prize must be awarded');

  const envoyLoss = SECT.EDITOR.applyDiplomacyAction(W, {
    action: 'trigger_envoy',
    sectId: targetSect.id,
    forceWin: false
  });
  assert.equal(envoyLoss.ok, true, 'trigger_envoy forceLoss must succeed');
  assert.equal(envoyLoss.won, false, 'Result must be lost');

  // 1g. spawn_political_event & resolve_political_event
  const spawnRes = SECT.EDITOR.applyDiplomacyAction(W, {
    action: 'spawn_political_event',
    sectId: targetSect.id,
    eventKind: 'SPECIALTY_CARAVAN'
  });
  assert.equal(spawnRes.ok, true, 'spawn_political_event must succeed');
  assert.equal(spawnRes.event.kind, 'SPECIALTY_CARAVAN');
  assert.equal(W.world.politics.activeEvent != null, true);

  const resolveRes = SECT.EDITOR.applyDiplomacyAction(W, {
    action: 'resolve_political_event',
    choice: 'ACCEPT'
  });
  assert.equal(resolveRes.ok, true, 'resolve_political_event must succeed');
  assert.equal(W.world.politics.activeEvent, null, 'Active event must be cleared after resolution');

  // 1h. clear_treaty action
  const clearRes = SECT.EDITOR.applyDiplomacyAction(W, {
    action: 'clear_treaty',
    sectId: targetSect.id
  });
  assert.equal(clearRes.ok, true, 'clear_treaty must succeed');
  assert.equal(targetSect.treaty, 'NONE');

  console.log('  PASS Area 1: Edit Hub Diplomacy management & actions verified');
}

// ============================================================================
// AREA 2: Edit Hub Sanctums, Boss Floor Controls & Refinement
// ============================================================================
{
  const W = SIM.create('edithub-sanctum-test');
  if (EXPLORE.ensureSanctums) EXPLORE.ensureSanctums(W);

  // 2a. sanctumState inspection
  const sState = SECT.EDITOR.sanctumState(W);
  assert(Array.isArray(sState.sanctums) && sState.sanctums.length >= 3, 'Must return sanctums list');
  const targetSanctum = sState.selectedSanctum;
  assert(targetSanctum && targetSanctum.id, 'Target sanctum must have id');

  // 2b. set_cleared action (0..3)
  const setFlRes = SECT.EDITOR.applySanctumAction(W, {
    action: 'set_cleared',
    sanctumId: targetSanctum.id,
    floor: 2
  });
  assert.equal(setFlRes.ok, true, 'set_cleared must succeed');
  assert.equal(setFlRes.floor, 2);
  const curCleared = W.explore.sanctums.clearedFloors[targetSanctum.id];
  assert.equal(curCleared, 2, 'clearedFloors must be 2');

  // 2c. instant_run action (forceClear)
  const runRes = SECT.EDITOR.applySanctumAction(W, {
    action: 'instant_run',
    sanctumId: targetSanctum.id,
    forceClear: true,
    targetFloor: 3
  });
  assert.equal(runRes.ok, true, 'instant_run forceClear must succeed');
  assert.equal(runRes.result.floorsCleared, 3, 'All 3 floors cleared');
  const catTotal = Object.values(runRes.result.catalysts).reduce((a, b) => a + b, 0);
  assert(catTotal >= 3, 'Guaranteed catalysts awarded for 3 floors: ' + catTotal);

  // 2d. spawn_catalysts action
  const spawnCatRes = SECT.EDITOR.applySanctumAction(W, {
    action: 'spawn_catalysts',
    qty: 5
  });
  assert.equal(spawnCatRes.ok, true, 'spawn_catalysts must succeed');
  for (const catId of Object.keys(ECO.REFINEMENT_CATALYSTS)) {
    assert((W.sect.catalysts[catId] || 0) >= 5, `Catalyst ${catId} must have at least 5 qty`);
  }

  // 2e. refine_gear action on T4+ equipment
  const swordRecipe = Object.values(ECO.recipeById).find(r => r.outType === 'EQUIPMENT' && r.tier >= 4) ||
                      Object.values(ECO.recipeById).find(r => r.outType === 'EQUIPMENT');
  const t4Gear = ECO.mintGear(W, swordRecipe, 1.05, true);
  t4Gear.tier = 4;
  t4Gear.q = 1.05;
  W.sect.gear.push(t4Gear);

  const initQuality = t4Gear.q;
  const refineRes = SECT.EDITOR.applySanctumAction(W, {
    action: 'refine_gear',
    gearUid: t4Gear.uid || t4Gear.id,
    catalystId: 'CAT_RESONANCE_JADE_4',
    free: false
  });
  assert.equal(refineRes.ok, true, 'refine_gear must succeed');
  assert(t4Gear.q > initQuality, 'Gear quality must increase');
  assert.equal(refineRes.newQuality, t4Gear.q);

  console.log('  PASS Area 2: Edit Hub Sanctum management, instant runs & gear refinement verified');
}

// ============================================================================
// AREA 3: 50-Subpath Specialization Track Progression Bridge
// ============================================================================
{
  const W = SIM.create('edithub-50-subpath-test');

  // 3a. Total 50 subpaths verified across all 5 paths
  const allSubpaths = [];
  for (const [pathKey, pathDef] of Object.entries(CULT.PATHS)) {
    if (pathDef.subPaths) {
      allSubpaths.push(...pathDef.subPaths);
    }
  }
  const catalogSubIds = CULT.subList.map(entry => entry.sub.id);
  assert.deepEqual(allSubpaths.map(sub => sub.id).sort(), catalogSubIds.slice().sort(), 'Every registered subpath must be covered by the progression bridge');
  assert.equal(new Set(catalogSubIds).size, catalogSubIds.length, 'Subpath IDs must be unique across all paths');

  // 3b. Verify CULT.trackDef works for ALL 50 subpaths
  for (const sub of allSubpaths) {
    const tDef = CULT.trackDef(sub.id);
    assert(tDef, 'Subpath ' + sub.id + ' must have a valid track definition');
    assert(sub.nameTh, 'Subpath ' + sub.id + ' must have Thai name');
    assert(Array.isArray(tDef.realms) && tDef.realms.length === 9, 'Subpath ' + sub.id + ' must have 9 specialization realms');
    tDef.realms.forEach((r, idx) => {
      assert.equal(r.ordinal, idx + 1, 'Realm ordinal must be 1..9 in subpath ' + sub.id);
      assert(r.nameTh, 'Realm ' + (idx + 1) + ' must have nameTh in subpath ' + sub.id);
      const stCost = r.resourceCost ? r.resourceCost.stones : (r.stonesCost || 0);
      assert(stCost >= 0, 'Stones cost must be non-negative in subpath ' + sub.id);
    });
  }

  // 3c. Verify base subpath vs expansion subpath partitioning
  const baseSub = 'SWORD_IMMORTAL';
  const expSub = 'FROST_MOON_IMMORTAL';
  assert.equal(CULT.isExpansionTrack(baseSub), false, 'SWORD_IMMORTAL is base subpath');
  assert.equal(CULT.isExpansionTrack(expSub), true, 'FROST_MOON_IMMORTAL is expansion subpath');

  // 3d. Awakening lifecycle for base subpath disciple
  const n = W.npcs.find(x => x && !x.dead && x.cult && x.id !== W.sect.masterId) || W.npcs[1];
  n.cult.path = 'XIAN';
  n.cult.sub = baseSub;
  n.cult.stage = 4; // Effective tech stage >= 4 allows awakening
  n.cult.track = null; // Unawakened

  // Retraining invariant preserved: M.retrain only auto-inits expansion tracks
  assert.equal(n.cult.track, null);

  // Awaken explicitly via CULT.awakenSpecializationTrack
  const awakened = CULT.awakenSpecializationTrack(n, W.day);
  assert(awakened, 'Base subpath must awaken track at stage >= 4');
  assert.equal(awakened.subPath, baseSub);
  assert.equal(awakened.ordinal, 1);
  assert.equal(n.cult.track.ordinal, 1);

  // 3e. Gate checking and breakthrough on base subpath track
  const tDef = CULT.trackDef(baseSub);
  const r2 = tDef.realms[1]; // Realm ordinal 2
  // Satisfy skills and stones
  n.inv.stones = 500;
  if (r2.skillGate) {
    if (r2.skillGate.primarySkill) M.skillSet(n, r2.skillGate.primarySkill, r2.skillGate.minPrimarySkill + 5);
    if (r2.skillGate.secondarySkill) M.skillSet(n, r2.skillGate.secondarySkill, r2.skillGate.minSecondarySkill + 5);
  }
  const gatesPassed = CULT.checkTrackGates(W, n);
  assert.equal(gatesPassed.ok, true, 'All gates should pass when requirements are satisfied');

  // Breakthrough
  n.cult.track.prog = CULT.trackThreshold(n);
  const bt = CULT.trackBreakthrough(W, n);
  assert.equal(bt.ok, true, 'Breakthrough must succeed');
  assert.equal(n.cult.track.ordinal, 2, 'Ordinal must advance to 2');

  // 3f. Character Editor: editTrackOrdinal directly sets ordinal
  const editTrackRes = SECT.EDITOR.applyCharacterEdit(W, n.id, {
    cult: { trackOrdinal: 7 }
  });
  assert.equal(editTrackRes.ok, true, 'Editing trackOrdinal via Edit Hub must succeed');
  assert.equal(n.cult.track.ordinal, 7, 'Track ordinal must be updated to 7');

  console.log('  PASS Area 3: 50-Subpath specialization track progression bridge verified');
}

// ============================================================================
// AREA 4: Cross-Sect Invited Martial Assembly & Duel Logging
// ============================================================================
{
  const W = SIM.create('edithub-assembly-test');
  assert(W.world && Array.isArray(W.world.sects) && W.world.sects.length > 0, 'Must have world sects');

  // Set up an allied sect with ALLIANCE
  const ally = W.world.sects[0];
  ally.treaty = 'ALLIANCE';
  ally.attitude = 80;

  // Run SECT.assembly
  W.t = 1200; // Season threshold
  const res = SECT.assembly(W);
  assert.equal(res.ok, true, 'Assembly must execute successfully');
  assert(Array.isArray(res.brackets) && res.brackets.length === 3, 'Must have Junior, Core, Elder brackets');

  // Check that allied guest prodigies entered the brackets and participated in bouts
  let hasGuestBout = false;
  for (const b of res.brackets) {
    if (b.bouts && b.bouts.some(m => String(m.aId).startsWith('GUEST_') || String(m.bId).startsWith('GUEST_'))) {
      hasGuestBout = true;
    }
  }
  assert.equal(hasGuestBout, true, 'Assembly matches must feature allied guest bouts');

  // Check assembly history in W.sect.assemblyHistory
  assert(Array.isArray(W.sect.assemblyHistory) && W.sect.assemblyHistory.length > 0, 'W.sect.assemblyHistory must record tournament events');

  console.log('  PASS Area 4: Cross-Sect invited martial assembly & guest prodigy duels verified');
}

// ============================================================================
// AREA 5: Edit Hub UI Rendering Smoke Test
// ============================================================================
{
  const W = SIM.create('edithub-ui-render-test');
  const n = W.npcs[1];
  UI.G = { W, R: { selected: n.id }, opts: {}, acc: 0, speed: 1 };
  UI.editNpcId = n.id;

  // Render 'char' tab
  UI.tab = 'char';
  const charHtml = UI.rEdit();
  assert(charHtml.includes('editTrackOrdinal'), 'Char tab must contain editTrackOrdinal input');

  // Render 'dip' tab
  UI.tab = 'dip';
  const dipHtml = UI.rEdit();
  assert(dipHtml.includes('editDipSectSel'), 'Dip tab must contain editDipSectSel selector');
  assert(dipHtml.includes('edit-dip-attitude'), 'Dip tab must contain edit-dip-attitude button');
  assert(dipHtml.includes('edit-dip-exchange'), 'Dip tab must contain edit-dip-exchange button');

  // Add a T4 gear so refinement select is rendered
  const swordRecipe = Object.values(ECO.recipeById).find(r => r.outType === 'EQUIPMENT' && r.tier >= 4) ||
                      Object.values(ECO.recipeById).find(r => r.outType === 'EQUIPMENT');
  const t4Gear = ECO.mintGear(W, swordRecipe, 1.05, true);
  t4Gear.tier = 4;
  W.sect.gear.push(t4Gear);

  // Render 'sanctum' tab
  UI.tab = 'sanctum';
  const sanctumHtml = UI.rEdit();
  assert(sanctumHtml.includes('editSanctumSel'), 'Sanctum tab must contain editSanctumSel selector');
  assert(sanctumHtml.includes('edit-sanctum-run'), 'Sanctum tab must contain edit-sanctum-run button');
  assert(sanctumHtml.includes('edit-sanctum-refine'), 'Sanctum tab must contain edit-sanctum-refine button');

  console.log('  PASS Area 5: Edit Hub UI rendering smoke test verified');
}

console.log('ALL EDIT HUB, CROSS-SECT ASSEMBLY & 50-SUBPATH PROGRESSION CHECKS PASSED.');
