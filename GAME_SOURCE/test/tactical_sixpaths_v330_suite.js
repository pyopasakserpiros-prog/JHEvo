'use strict';
const assert = require('assert');
const G = require('./load.js');
const { SIM, ECO, HC, CULT, SECT, SK, STATS, COMBAT, MARTIAL, UI } = G;

console.log('=== Running JS2 v3.3.0 Tactical Combat & Six-Path Mastery Suite ===');

// 1. Version & Schema Invariants
assert.strictEqual(SIM.PATCH_VERSION, '3.8.2', 'PATCH_VERSION must be 3.3.0');
assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '3.8.2-chaos-era-lore-archive', 'SAVE_SCHEMA_VERSION must be 3.3.0-tactical-sixpaths');
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'human_core.js fingerprint must remain locked');
assert.strictEqual(Object.keys(COMBAT.DUET_CATALOG).length, 12, 'DUET_CATALOG must have 12 duet skills (8 baseline + 4 v3.3.0)');
assert.strictEqual(Object.keys(COMBAT.SECONDARY_RESOURCES).length, 4, 'SECONDARY_RESOURCES must have 4 dedicated resources');
assert.strictEqual(COMBAT.TOXIN_SYNERGY_MATRIX.length, 3, 'TOXIN_SYNERGY_MATRIX must have 3 reactions');
assert.strictEqual(Object.keys(CULT.MARTIAL_VOWS.CATALOG).length, 4, 'MARTIAL_VOWS must have 4 vows');
assert.strictEqual(CULT.SIX_PATH_MASTERY.PATHS.length, 6, 'SIX_PATH_MASTERY must cover all 6 pathways');

const W = SIM.create('v330-tactical-sixpaths-seed', { masterIdx: 0 });
const a = W.npcs[0];
const b = W.npcs[1];
const foe = W.npcs[2];
a.cult = { path: 'ANCESTRAL_RITUAL', stage: 5, sub: 'ANCESTRAL_TABLET_KEEPER', techs: [] };
b.cult = { path: 'LORE_ARCHIVIST', stage: 5, sub: 'SCRIPTURE_DECODER', techs: [] };
foe.cult = { path: 'BODY', stage: 5, sub: 'BODY_IRON_MONK', techs: [] };
a.x = 100; a.y = 100;
b.x = 101; b.y = 100;
foe.x = 102; foe.y = 100;

// 2. Category 1: Row Aura, Dynamic Row Swap, Duet Co-Cast (Paired Relic + Six-Path)
const f = { id: 901, kind: 'raid', serious: true, state: 'fight', A: [a.id, b.id], B: [foe.id], rows: { A: { [a.id]: 'FRONT_ROW', [b.id]: 'BACK_ROW' }, B: { [foe.id]: 'FRONT_ROW' } } };
const frontBonus = COMBAT.evaluateRowTacticalBonus(W, f, a);
const backBonus = COMBAT.evaluateRowTacticalBonus(W, f, b);
assert.strictEqual(frontBonus.posture, 'PHALANX_GUARD', 'Front row with living back row must gain PHALANX_GUARD');
assert.strictEqual(frontBonus.dmgTakenMult, 0.90);
assert.strictEqual(backBonus.posture, 'UNOBSTRUCTED_FOCUS', 'Back row protected by front row must gain UNOBSTRUCTED_FOCUS');
assert.strictEqual(backBonus.dmgOutMult, 1.09);

// Test autonomous row swap when front row drops below 28% HP
a.h.state.hp = Math.round(COMBAT.hpMax(a) * 0.20);
b.h.state.hp = COMBAT.hpMax(b);
b.h.personality.courage = 80;
HC.bump(b);
const swapRes = COMBAT.tryAutonomousRowSwap(W, f, a);
assert.strictEqual(swapRes.ok, true, 'Low-HP front-row ally must autonomously swap with healthy back-row ally');
assert.strictEqual(f.rows.A[a.id], 'BACK_ROW');
assert.strictEqual(f.rows.A[b.id], 'FRONT_ROW');

// Test Paired Relic Duet Co-Cast (v3.2.0 pairedSetId integration)
a.equip.ACCESSORY = ECO.mintGear(W, ECO.itemById['EQ_V320_SET_TWIN_RING'], 1.0);
b.equip.ACCESSORY = ECO.mintGear(W, ECO.itemById['EQ_V320_SET_TWIN_RING'], 1.0);
a.h.state.hp = COMBAT.hpMax(a);
const duetRes = COMBAT.tryExecuteDuetSkill(W, f, a, b, foe, { ignoreCooldown: true });
assert.strictEqual(duetRes.ok, true, 'Paired relic / Six-Path duet must execute cleanly');
assert.strictEqual(duetRes.duet.id, 'DUET_ANCESTRAL_ARCHIVE_OATH', 'Ancestral + Lore Archivist must select DUET_ANCESTRAL_ARCHIVE_OATH');

// 3. Category 1: Secondary Resources (S04), Weapon Affinity Ramp (S05), Toxin Synergy Matrix (S03)
const gambler = W.npcs[0];
gambler.cult = { path: 'DEMON', stage: 5, sub: 'DEMON_BLOOD_BLADE', techs: [] };
gambler.equip.WEAPON = ECO.mintGear(W, ECO.itemById['EQ_V320_CURSED_BLADE_T3'], 1.0);
foe.dead = false; foe.fled = false; foe.yield = false; COMBAT.setHp(foe, COMBAT.hpMax(foe));
let discharged = false;
for (let i = 0; i < 5; i++) {
  const r = COMBAT.gainSecondaryResource(W, f, gambler, foe, 1, 60);
  if (r && r.discharged) discharged = true;
}
assert.strictEqual(discharged, true, 'KILLING_INTENT must discharge at 5 stacks');

for (let i = 0; i < 6; i++) COMBAT.recordWeaponAffinityStrike(gambler);
const aff = COMBAT.getWeaponAffinityBonus(gambler);
assert.strictEqual(aff.strikes, 6, 'Weapon affinity must track 6 consecutive strikes');
assert(aff.bonusAcc > 0 && aff.bonusCrit > 0, 'Weapon affinity must grant acc and crit bonuses');

// Toxin Synergy Matrix: poison + chill -> TOXIN_MARROW_DISSOLVE
foe.h.state.hp = COMBAT.hpMax(foe);
STATS.addStatus(foe, 'poison', 15, { per: 0.01 }, W.t);
STATS.addStatus(foe, 'chill', 15, null, W.t);
const toxRes = COMBAT.checkToxinSynergy(W, f, gambler, foe);
assert(toxRes && toxRes.ok && toxRes.id === 'TOXIN_MARROW_DISSOLVE', 'poison + chill must trigger TOXIN_MARROW_DISSOLVE');
console.log('  PASS: Category 1 (Row Aura/Swap, 12 Duets, Secondary Resources, Weapon Affinity, Toxin Matrix) verified');

// 4. Category 1: Voluntary Martial Vows (S07) & VOW_BACKLASH
const vowNpc = W.npcs[1];
vowNpc.cult = { path: 'ARENA_GLORY', stage: 4, sub: 'ARENA_DUELIST', techs: [] };
vowNpc.h.personality.pride = 82;
vowNpc.h.personality.courage = 78;
vowNpc.h.personality.caution = 30;
HC.bump(vowNpc);
const sworn = CULT.MARTIAL_VOWS.evaluateAutonomousAdoption(W, vowNpc);
assert(sworn && sworn.active && sworn.id === 'VOW_SOLO_DUEL', 'High-pride/courage NPC must autonomously swear VOW_SOLO_DUEL');
const breach = CULT.MARTIAL_VOWS.recordBreach(W, vowNpc, 'UNFAIR_ASSIST');
assert(breach.ok && !vowNpc.voluntaryVow.active, 'Breaching vow must deactivate it and apply VOW_BACKLASH');
assert(vowNpc.sx && vowNpc.sx.some(x => x.k === 'vowBacklash'), 'Vow breach must apply vowBacklash status');
console.log('  PASS: Voluntary Martial Vows autonomous adoption and VOW_BACKLASH verified');

// 5. Category 2: All Six Pathways Deep Mastery & World-Loop Integration
const sixPaths = CULT.SIX_PATH_MASTERY.PATHS;
W.graveyard.push({ id: 'anc_1', nameTh: 'ปู่ทวดกระบี่หยก', stage: 6 });
W.world.livingLore = W.world.livingLore || {}; W.world.livingLore.discoveredFacts = W.world.livingLore.discoveredFacts || {};
for (let i = 0; i < 8; i++) W.world.livingLore.discoveredFacts['F_' + i] = { day: 1 };
for (const pk of sixPaths) {
  const u = W.npcs[2];
  u.cult = { path: pk, stage: 4, sub: 'DEFAULT', techs: [] };
  u.y = 260; // near river for TIDE_VOYAGER
  const m = CULT.SIX_PATH_MASTERY.syncDaily(W, u);
  assert(m && m.path === pk, `syncDaily must initialize sixPathMastery for ${pk}`);
  if (pk === 'FORTUNE_GAMBLER') {
    const wRes = CULT.SIX_PATH_MASTERY.resolveStakeWager(W, u, 'combat');
    assert(wRes.ok, 'Fortune Gambler stake wager must resolve');
  }
  if (pk === 'ARENA_GLORY') {
    CULT.SIX_PATH_MASTERY.recordArenaVictory(W, u);
    assert(u.sixPathMastery.arenaStreak >= 1, 'Arena Glory must track win streak');
  }
  const bns = CULT.SIX_PATH_MASTERY.getStatBonuses(W, u);
  assert(bns && bns.summaryTh.length > 0, `getStatBonuses must return Thai summary for ${pk}`);
  if (UI && UI.formatTacticalSixPathSummary) { const uiStr = UI.formatTacticalSixPathSummary(W, u); assert(typeof uiStr === 'string' && uiStr.length > 0); }
}
console.log('  PASS: All 6 Pathways Deep Mastery (ANCESTRAL, TIDE, LORE, FORTUNE, HUSBANDRY, ARENA) verified');

// 6. Save/Load Round-Trip & Backward Compatibility with v3.2.0
const snap = SIM.serialize(W);
const loadedW = SIM.deserialize(snap);
assert.strictEqual(loadedW.npcs[0].weaponAffinity.strikes, 6, 'Save/load must preserve weaponAffinity');
assert(loadedW.npcs[2].sixPathMastery && loadedW.npcs[2].sixPathMastery.path === 'ARENA_GLORY', 'Save/load must preserve sixPathMastery');

const v320Save = JSON.parse(snap);
v320Save.schemaVersion = '3.2.0-equipment-expansion';
v320Save.patchVersion = '3.2.0';
const loadedV320 = SIM.deserialize(JSON.stringify(v320Save));
assert(loadedV320 && loadedV320.npcs.length > 0, 'Must cleanly load v3.2.0 saves');

console.log('=== ALL JS2 v3.3.0 TACTICAL COMBAT & SIX-PATH MASTERY TESTS PASSED! ===');
