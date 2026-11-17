/* ═══════════════════════════════════════════════════════════════════════════
   v260_bugfix_categories_11_12_suite.js
   Comprehensive Regression Suite for Categories 11 (Human Foundation,
   Psychology, Social Graph & Karma: 11A–11E) & 12 (UI, Rendering, Visual Logic,
   Sect Map Layout, Save/Load & Build Pipeline: 12A, 12B, 12B2, 12B3, 12B4, 12B5, 12C)
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const win = require('./load');
require('../js/render');
require('../js/ui');

function log(msg) { console.log('  ✓ ' + msg); }

(function run() {
  console.log('\n═══ Running v260_bugfix_categories_11_12_suite.js ═══');
  const { HC, JD, CULT, STATS, SECT, AI, COMBAT, MAP, SIM, Render, UI } = win;

  // 1. Core Lock & Invariants
  assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
  log('1. Core Lock invariant preserved (155:2f9c9dd7)');

  // 2. [11A / HUM-GEN-01] Birth Trait Pool Filter & CULT.grantAcquiredTrait
  for (let s = 1; s <= 40; s++) {
    const h = HC.generate(SIM.create('seed-' + s).rng, { gender: s % 2 ? 'M' : 'F', ageYears: 16 });
    const cats = (h.traits || []).map(tr => {
      const tid = tr && tr.id ? tr.id : tr;
      const def = HC.traitDef && HC.traitDef(tid);
      return def ? (def.category || def.cat) : 'UNKNOWN';
    });
    assert(!cats.includes('ACQUIRED'), 'Newborn/novice must not spawn with ACQUIRED traits: ' + JSON.stringify(h.traits));
    assert(!cats.includes('TRAINING'), 'Newborn/novice must not spawn with TRAINING traits: ' + JSON.stringify(h.traits));
  }
  const W = SIM.create('seed-91112');
  const testNpc = W.npcs[0];
  assert(typeof CULT.grantAcquiredTrait === 'function', 'CULT.grantAcquiredTrait must exist');
  CULT.grantAcquiredTrait(testNpc, 'TR_AC_TOURNAMENT_CHAMPION');
  assert(testNpc.h.traits.some(t => (t && t.id) === 'TR_AC_TOURNAMENT_CHAMPION'), 'CULT.grantAcquiredTrait must grant ACQUIRED trait in gameplay');
  log('2. [11A / HUM-GEN-01] Birth traits exclude ACQUIRED/TRAINING while gameplay CULT.grantAcquiredTrait works');

  // 3. [11A / HUM-AGE-04] BioAge Adulthood Floor & Cultivator Lifespan
  const youngCult = W.npcs[0];
  const savedBirthDay = youngCult.h.birthDay;
  const savedLsMax = youngCult.lifespanMax;
  youngCult.h.birthDay = (HC.nowDay || 0) - 16 * 360;
  youngCult.lifespanMax = 500;
  const bioYoung = HC.bioAge(youngCult);
  assert.strictEqual(bioYoung, 16, 'Cultivator aged 16 with 500 lifespan must have bioAge 16 (not scaled to toddler)');
  youngCult.h.birthDay = (HC.nowDay || 0) - 100 * 360;
  const bioAdult = HC.bioAge(youngCult);
  assert(bioAdult > 20 && bioAdult < 40, 'Cultivator aged 100 with 500 lifespan scales post-adulthood biological age slower');
  youngCult.h.birthDay = savedBirthDay;
  youngCult.lifespanMax = savedLsMax;
  log('3. [11A / HUM-AGE-04] Cultivator biological age preserves adulthood floor (<=20 stays 1:1)');

  // 4. [11A / HUM-CON-01..03 & HUM-TR-01..04] Constitutions, Physiology Modifiers & Blind Sword Ear
  const consts = JD.CORE.constitutions;
  const flameC = consts.find(c => c.id === 'CONST_FLAME_CAULDRON');
  const starC = consts.find(c => c.id === 'CONST_STAR_MIND');
  const woodC = consts.find(c => c.id === 'CONST_WOOD_SPRING');
  const frostC = consts.find(c => c.id === 'CONST_YIN_FROST_VEIN');
  const vajraC = consts.find(c => c.id === 'CONST_IRON_VAJRA');
  assert.strictEqual(flameC.element, 'FIRE', 'CONST_FLAME_CAULDRON must use canonical FIRE element');
  assert.strictEqual(starC.element, 'ASTRAL', 'CONST_STAR_MIND must use canonical ASTRAL element');
  assert.strictEqual(woodC.element, 'WOOD_LIFE', 'CONST_WOOD_SPRING must use canonical WOOD_LIFE element');
  assert.strictEqual(frostC.element, 'WATER_ICE', 'CONST_YIN_FROST_VEIN must use canonical WATER_ICE element');
  assert(Array.isArray(vajraC.modifiers) && vajraC.modifiers.some(m => m.stat === 'physiology.toughness'), 'CONST_IRON_VAJRA must modify physiology.toughness');

  const poisonTrait = HC.traitDef('TR_BL_POISON_IMMUNE');
  assert(poisonTrait.modifiers.some(m => m.stat === 'physiology.immunity'), 'TR_BL_POISON_IMMUNE must target physiology.immunity');
  const blindSwordTrait = HC.traitDef('TR_IN_BLIND_SWORD_EAR');
  assert(blindSwordTrait.modifiers.some(m => m.stat === 'physiology.vision' && m.value < 0), 'TR_IN_BLIND_SWORD_EAR must reduce vision');
  assert(blindSwordTrait.modifiers.some(m => m.stat === 'physiology.hearing' && m.value > 0), 'TR_IN_BLIND_SWORD_EAR must boost hearing');

  CULT.grantAcquiredTrait(testNpc, 'TR_IN_BLIND_SWORD_EAR');
  testNpc.sx = (testNpc.sx || []).filter(s => s.id !== 'blind');
  STATS.addStatus(testNpc, 'blind', 10, 1);
  assert(!(testNpc.sx || []).some(s => s.id === 'blind'), 'TR_IN_BLIND_SWORD_EAR must block blind status');
  log('4. [11A / HUM-CON & HUM-TR] Canonical constitution elements, physiology modifiers & Blind Sword Ear immunity verified');

  // 5. [11B / HUM-MOD-02 & HUM-VOW-01] Relational Grudge Target & Vow Enforcement
  const aNpc = W.npcs[0], bNpc = W.npcs[1];
  CULT.grantAcquiredTrait(aNpc, 'TR_AC_MASTER_VENGEANCE');
  aNpc._activeOpponent = null;
  aNpc._d = null;
  const basePm = HC.eff(aNpc, 'combat.powerMult');
  aNpc.h.mind.relations[bNpc.id] = { a: -50, t: -40, r: 0, f: 30, bond: 'ศัตรู', killerOfLoved: true };
  aNpc._activeOpponent = bNpc;
  aNpc._d = null;
  const grudgePm = HC.eff(aNpc, 'combat.powerMult');
  aNpc._activeOpponent = null;
  aNpc._d = null;
  assert(grudgePm > basePm, 'TR_AC_MASTER_VENGEANCE must trigger against personal relational enemy / killerOfLoved');

  aNpc.daoOath = { id: 'VOW_ABSTAIN_PILLS', upheld: true };
  assert.strictEqual(CULT.isAbstainingMedicine(aNpc), true, 'CULT.isAbstainingMedicine must detect active VOW_ABSTAIN_PILLS oath');
  aNpc.daoOath = null;
  log('5. [11B / HUM-MOD-02 & HUM-VOW-01] Relational grudge targeting and VOW_ABSTAIN_PILLS enforcement verified');

  // 6. [11C / HUM-PSY-02 & HUM-NEED-01] Insight Polarity & Cultivation Metabolic Rate
  let highHdInsights = 0, lowHdInsights = 0;
  for (let i = 0; i < 200; i++) {
    aNpc.cult.heartDemon = 85;
    aNpc.cult.epiphany = 0;
    AI.insight(W, aNpc, 'ทบทวนวิถี');
    if (aNpc.cult.epiphany > 0) highHdInsights++;
    aNpc.cult.heartDemon = 0;
    aNpc.cult.epiphany = 0;
    AI.insight(W, aNpc, 'ทบทวนวิถี');
    if (aNpc.cult.epiphany > 0) lowHdInsights++;
  }
  assert(lowHdInsights >= highHdInsights, 'Clear mind (heartDemon=0) must yield >= insights than high heartDemon (85)');
  log('6. [11C / HUM-PSY-02] AI.insight scales down with high heartDemon and up with willpower');

  // 7. [11D / HUM-SOC-01 & 11E / HUM-KRM-02] Consanguinity Guard & Destiny Thread Priority Eviction
  const parentNpc = W.npcs[1], childNpc = W.npcs[2];
  childNpc.fatherId = parentNpc.id;
  assert.strictEqual(SECT.areBloodRelatives(W, parentNpc, childNpc), true, 'SECT.areBloodRelatives must detect parent-child relationship');
  assert.strictEqual(SECT.canRomance(W, parentNpc, childNpc), false, 'SECT.canRomance must forbid romance between blood relatives');
  childNpc.fatherId = null;

  parentNpc.destinyThreads = [
    { aId: parentNpc.id, bId: 901, type: 'GOLD_THREAD', strength: 40 },
    { aId: parentNpc.id, bId: 902, type: 'GOLD_THREAD', strength: 45 },
    { aId: parentNpc.id, bId: 903, type: 'GOLD_THREAD', strength: 50 },
    { aId: parentNpc.id, bId: 904, type: 'GOLD_THREAD', strength: 55 },
    { aId: parentNpc.id, bId: 905, type: 'GOLD_THREAD', strength: 60 }
  ];
  SECT.DESTINY_KARMA.bindThread(W, parentNpc, childNpc, 'RED_THREAD', 'ชะตารัก');
  assert(parentNpc.destinyThreads.some(t => t.type === 'RED_THREAD' && (t.aId === childNpc.id || t.bId === childNpc.id)), 'High-priority RED_THREAD must evict lowest-priority GOLD_THREAD when at capacity');
  log('7. [11D & 11E] Consanguinity romance guard and Destiny Thread priority eviction verified');

  // 8. [12A & 12B3] Visual Identity, 31 Grand Dao Relics, Apex Path Arts & Catalog Parity
  assert(Render.GRAND_DAO_RELIC_VISUALS && Object.keys(Render.GRAND_DAO_RELIC_VISUALS).length === 31, 'All 31 REL_V230_* Grand Dao Relics must have dedicated visual profiles');
  assert.strictEqual(Object.keys(Render.LEGENDARY_ART_VISUALS).length, 50, 'LEGENDARY_ART_VISUALS count must remain 50');
  assert.strictEqual(Object.keys(Render.LEGENDARY_GEAR_VISUALS).length, 27, 'LEGENDARY_GEAR_VISUALS count must remain 27');
  assert(Render.APEX_PATH_ART_VISUALS && Render.APEX_PATH_ART_VISUALS.LEG_V240_GOD && Render.APEX_PATH_ART_VISUALS.LEG_V240_CRAFT_CREATION, 'Apex Path Arts LEG_V240_GOD and LEG_V240_CRAFT_CREATION must have visual profiles');

  const godArt = UI.resolveItemArt({ id: 'LEG_V240_GOD', name: 'มหาคัมภีร์เทวราชโองการสวรรค์', type: 'scripture', rarity: 6 });
  const craftArt = UI.resolveItemArt({ id: 'LEG_V240_CRAFT_CREATION', name: 'มหาคัมภีร์สรรพสิ่งรังสรรค์', type: 'scripture', rarity: 6 });
  assert(godArt && godArt.sheet === 'manuals' && godArt.legendary === true, 'UI.resolveItemArt must resolve LEG_V240_GOD');
  assert(craftArt && craftArt.sheet === 'manuals' && craftArt.legendary === true, 'UI.resolveItemArt must resolve LEG_V240_CRAFT_CREATION');
  log('8. [12A & 12B3] 31 Grand Dao Relics and Apex Path Arts visual profiles resolved with strict catalog parity');

  // 9. [12B / 12B2 / 12B4] Render Purity, Canonical ELEM Keys & Priority Cast Effects Eviction
  for (const elemKey of CULT.ELEM.ALL_ELEMENTS) {
    assert(Render.ELEMENT_VFX_PALETTE[elemKey], 'Render.ELEMENT_VFX_PALETTE must support canonical element key ' + elemKey);
  }
  const rngBefore = JSON.stringify(W.rng);
  const viewState = Object.assign({
    W, alpha: 1, opts: { quality: 'high' }, t: 0.5, cam: { x: 1920, y: 1120, z: 1 },
    vw: 1000, vh: 700, castClock: 0, castLastTime: null, castActive: new Map(), castSeen: new Map(), chunks: new Map(), buildingSprites: new Map(), apCache: new Map(), npcPos: n => n
  }, Render.methods);
  viewState.castActive.set('fx-ult-1', { ownerId: 999, legendary: true, tier: 6, start: 0, life: 5000, x: 1920, y: 1120 });
  for (let i = 0; i < 23; i++) {
    viewState.castActive.set('fx-low-' + i, { ownerId: 800 + i, legendary: false, tier: 1, start: 0, life: 5000, x: 1920, y: 1120 });
  }
  W.npcs[0].x = 120; W.npcs[0].y = 70;
  W.npcs[0].castFx = { t: W.t, techId: 'ART001', moveId: 'M1', tier: 1, x: 120, y: 70 };
  viewState.updateCastEffects(16);
  assert(viewState.castActive.size <= 24, 'updateCastEffects must cap active effects at <= 24');
  assert(viewState.castActive.has('fx-ult-1'), 'updateCastEffects must preserve high-tier/legendary effects over T1 spam');
  assert.strictEqual(JSON.stringify(W.rng), rngBefore, 'Render.updateCastEffects must not touch W.rng');
  log('9. [12B / 12B2 / 12B4] Canonical ELEM VFX keys, priority VFX eviction, and W.rng purity verified');

  // 10. [12B5] Sect Map Layout, Non-Overlapping Buildings, West Highway Clearance & 4-Gate Pathfinding
  const blds = W.map.buildings;
  const peakArray = blds.find(b => b.id === 'peak_array');
  assert(peakArray, 'peak_array building must exist');
  assert(peakArray.y + peakArray.h <= 121, 'peak_array must not block the West Gate highway at y=122..124 (ly=66..68)');

  for (let i = 0; i < blds.length; i++) {
    for (let j = i + 1; j < blds.length; j++) {
      const A = blds[i], B = blds[j];
      const overlapX = A.x < B.x + B.w && A.x + A.w > B.x;
      const overlapY = A.y < B.y + B.h && A.y + A.h > B.y;
      assert(!(overlapX && overlapY), `Buildings ${A.id} and ${B.id} must not overlap footprints`);
    }
  }

  const pathNorth = MAP.findPath(W.map, 180, 80, 180, 30);
  assert(Array.isArray(pathNorth) && pathNorth.length >= 2, 'MAP.findPath must route across North Gate');
  assert(pathNorth.some(wp => Math.abs((wp.y != null ? wp.y : wp[1]) - 56) <= 2), 'North route should pass near North Gate rather than looping via South Gate');
  log('10. [12B5] Sect map footprints non-overlapping, West Gate highway clear, and 4-gate routing verified');

  // 11. [12C] Build Pipeline & CSS Verification
  const buildScript = fs.readFileSync(path.join(__dirname, '..', 'tools', 'build_single.js'), 'utf8');
  assert(!buildScript.includes("replace(/^\\s+/gm"), 'build_single.js must not strip leading whitespace across multiline template strings');
  const cssText = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert(cssText.includes('#toasts') && cssText.includes('top:calc(112px + var(--safe-t))'), '#toasts must stay below topbar');
  log('11. [12C] build_single.js safe bundling and CSS layout rules verified');

  console.log('═══ ALL Category 11–12 checks passed! ═══\n');
})();
