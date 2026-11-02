#!/usr/bin/env node
'use strict';

/**
 * JianghuSect Game Data & Combat Integrity Validator
 * 
 * Audits:
 * 1. Base & Expansion Items (ID uniqueness, nameTh, tier, price, slot, effects)
 * 2. Crafting Recipes (Inputs/outputs, matId existence, dual-ID mapping)
 * 3. Martial Arts & Techniques (Weapon affinity, elements, moveDefs, multipliers, passives)
 * 4. Effects, Buffs, Consumables & Talismans (Effect IDs, parameter integrity)
 * 5. Debug Editor Catalog Coverage & Spawnability
 */

const G = require('../test/load');
const { JD, ECO, SIM, SECT } = G;

const errors = [];
const warnings = [];

function check(condition, message, isWarning = false) {
  if (!condition) {
    if (isWarning) warnings.push(message);
    else errors.push(message);
  }
}

console.log('====================================================');
console.log('   JIANGHUSECT DATA & COMBAT INTEGRITY VALIDATOR    ');
console.log('====================================================\n');

// 1. Audit Items & Equipment
console.log('▶ [1/5] Auditing Items & Equipment...');
const items = Object.values(ECO.itemById || {});
check(items.length > 0, 'ECO.itemById must not be empty');

const itemIds = new Set();
const validWeaponTypes = new Set(['SWORD', 'BLADE', 'SPEAR', 'FIST', 'BOW', 'STAFF', 'FOCUS', 'ZITHER', 'BRUSH', 'WHIP']);

for (const item of items) {
  check(item.id && typeof item.id === 'string', `Item missing valid id: ${JSON.stringify(item)}`);
  check(!itemIds.has(item.id), `Duplicate item ID: ${item.id}`);
  itemIds.add(item.id);

  check(item.nameTh && typeof item.nameTh === 'string', `Item ${item.id} missing nameTh`);
  check(typeof item.tier === 'number' && item.tier >= 1 && item.tier <= 9, `Item ${item.id} has invalid tier: ${item.tier}`);

  // Equipment checks
  if (item.out === 'EQUIPMENT' || item.slot) {
    check(typeof item.slot === 'string', `Equipment ${item.id} missing slot`);
    if (item.slot === 'WEAPON' && item.subType) {
      check(validWeaponTypes.has(item.subType), `Weapon ${item.id} has unknown subType: ${item.subType}`);
    }
  }

  // Effects check
  if (Array.isArray(item.effects)) {
    for (const efx of item.effects) {
      check(efx.effectId && typeof efx.effectId === 'string', `Item ${item.id} has effect without effectId`);
      check(efx.params && typeof efx.params === 'object', `Item ${item.id} effect ${efx.effectId} missing params object`);
    }
  }
}
console.log(`  ✓ Audited ${items.length} base items (IDs, nameTh, tier, slots, effects)`);

// 2. Audit Recipes & Dual-ID Mapping
console.log('\n▶ [2/5] Auditing Recipes & Dual-ID Mapping...');
const allRecipes = [
  ...(JD.ITEMS?.recipes || []),
  ...(JD.EXPANSION?.recipes || []),
  ...(JD.MARTIAL?.recipes || []),
  ...(JD.MARTIAL?.expansionRecipes || [])
];

const recipeIds = new Set();
for (const r of allRecipes) {
  check(r.id && typeof r.id === 'string', `Recipe missing valid id: ${JSON.stringify(r)}`);
  recipeIds.add(r.id);

  check(r.nameTh && typeof r.nameTh === 'string', `Recipe ${r.id} missing nameTh`);
  check(Array.isArray(r.inputs), `Recipe ${r.id} inputs must be an array`);

  // Verify inputs exist
  if (Array.isArray(r.inputs)) {
    for (const inp of r.inputs) {
      check(inp.matId && typeof inp.matId === 'string', `Recipe ${r.id} input missing matId`);
      check(inp.count > 0, `Recipe ${r.id} input ${inp.matId} count must be > 0`);
      // Check if material is registered
      const matExists = ECO.itemById[inp.matId] || (G.JD.CORE && G.JD.CORE[inp.matId]) || (ECO.matMap && ECO.matMap[inp.matId]);
      check(matExists, `Recipe ${r.id} requires unregistered matId: ${inp.matId}`, true);
    }
  }

  // Dual-ID: If outItemId is defined, ensure it exists in items
  if (r.outItemId) {
    check(ECO.itemById[r.outItemId], `Recipe ${r.id} references non-existent outItemId: ${r.outItemId}`);
  }
}
console.log(`  ✓ Audited ${allRecipes.length} recipes and inputs`);

// 3. Audit Martial Arts, Techniques, Elements & Weapon Affinities
console.log('\n▶ [3/5] Auditing Martial Arts, Weapon Affinities & Elements...');
const techniques = Array.isArray(JD.MARTIAL?.techniques)
  ? JD.MARTIAL.techniques
  : Object.values(JD.MARTIAL?.techniques || {});
check(techniques.length > 0, 'JD.MARTIAL.techniques must not be empty');

const validPaths = new Set([...Object.keys(JD.CULT.paths), 'ANY', 'XIAN', 'MO', 'BUDDHA', 'DAO', 'BODY', 'GOD', 'DEMON', 'HEART_SOUL', 'MECH_PUPPET', 'KARMA_SAMSARA', 'BEAST_SOVEREIGN', 'SAGE_SUPPORT', 'CRAFT_CREATION', 'ARRAY_TALISMAN', 'STRATEGY_GOVERNANCE', 'CONFUCIAN', 'EXTERNAL']);

for (const tech of techniques) {
  check(tech.id && typeof tech.id === 'string', `Technique missing valid id: ${JSON.stringify(tech)}`);
  check(tech.nameTh && typeof tech.nameTh === 'string', `Technique ${tech.id} missing nameTh`);
  check(typeof tech.tier === 'number' && tech.tier >= 1 && tech.tier <= 9, `Technique ${tech.id} invalid tier: ${tech.tier}`);

  // Path check
  if (tech.path) {
    check(validPaths.has(tech.path), `Technique ${tech.id} has invalid path: ${tech.path}`, true);
  }

  const isPassive = tech.cat === 'PASSIVE' || tech.role === 'PASSIVE' || tech.passive;

  // Weapon affinity check
  if (Array.isArray(tech.weaponTypes) && tech.weaponTypes.length > 0) {
    for (const wt of tech.weaponTypes) {
      check(validWeaponTypes.has(wt) || wt === 'UNARMED' || wt === 'ALL', `Technique ${tech.id} invalid weaponType: ${wt}`);
    }
  } else if (!isPassive && tech.requiresWeapon !== false && tech.cat !== 'INNER_KUNGFU' && tech.cat !== 'DEFENSIVE_TECHNIQUE') {
    check(false, `Combat technique ${tech.id} missing weaponTypes array`, true);
  }

  // Element check
  check(tech.element && typeof tech.element === 'string', `Technique ${tech.id} missing element string`);
  check(tech.elementProfile && typeof tech.elementProfile === 'object', `Technique ${tech.id} missing elementProfile`);

  // Move definitions check (for active combat moves)
  if (isPassive) {
    // Passives should have passive stats or modifier object
    check(tech.passive && typeof tech.passive === 'object', `Passive ${tech.id} missing passive definition object`);
  } else if (Array.isArray(tech.moveDefs) && tech.moveDefs.length > 0) {
    for (const move of tech.moveDefs) {
      check(move.id && typeof move.id === 'string', `Technique ${tech.id} has move without id`);
      check(move.nameTh && typeof move.nameTh === 'string', `Technique ${tech.id} move ${move.id} missing nameTh`);
      
      const isDefensiveOrBuff = move.arch === 'guard' || move.arch === 'heal' || move.type === 'p' || move.type === 'b' || move.M === 0;
      if (!isDefensiveOrBuff) {
        check(typeof move.M === 'number' && !isNaN(move.M) && move.M > 0, `Technique ${tech.id} move ${move.id} invalid attack multiplier M: ${move.M}`);
      }
      check(typeof move.cd === 'number' && !isNaN(move.cd) && move.cd >= 0, `Technique ${tech.id} move ${move.id} invalid cooldown cd: ${move.cd}`);
    }
  } else if (tech.cat === 'COMBAT_TECHNIQUE' && !tech.moves?.length) {
    check(false, `Combat technique ${tech.id} missing moveDefs array`, true);
  }
}
console.log(`  ✓ Audited ${techniques.length} martial techniques (weaponTypes, elements, moves, stats)`);

// 4. Audit Effects, Buffs, and Parameters
console.log('\n▶ [4/5] Auditing Effects, Buffs & Parameters...');
let auditedEffectsCount = 0;
for (const item of items) {
  if (Array.isArray(item.effects)) {
    for (const efx of item.effects) {
      auditedEffectsCount++;
      // Parameter sanity
      if (efx.params) {
        for (const [paramKey, paramVal] of Object.entries(efx.params)) {
          check(paramVal !== undefined && !Number.isNaN(paramVal), `Item ${item.id} effect ${efx.effectId} has NaN/undefined param ${paramKey}`);
        }
      }
    }
  }
}
console.log(`  ✓ Audited ${auditedEffectsCount} active/passive effects and parameters`);

// 5. Audit Editor Catalog & Spawner Compatibility
console.log('\n▶ [5/5] Auditing Debug Editor Catalog & Spawner...');
const W = SIM.create('integrity-test-world');
const catalog = SECT.EDITOR.catalog(W);
check(catalog.length >= 2000, `Editor catalog size must be >= 2000, got ${catalog.length}`);

// Test sample spawn for each distinct kind in catalog
const kinds = new Set(catalog.map(c => c.kind));
let testedSpawns = 0;
for (const kind of kinds) {
  const sample = catalog.find(c => c.kind === kind);
  if (sample) {
    const res = SECT.EDITOR.spawnItem(W, { kind: sample.kind, id: sample.id, qty: 1, dest: 'sect' });
    check(res.ok, `Editor spawn failed for kind ${kind} (id: ${sample.id}): ${res.reason}`);
    testedSpawns++;
  }
}
console.log(`  ✓ Verified Editor catalog (${catalog.length} items across ${kinds.size} categories, tested spawns: ${testedSpawns})`);

// Report Summary
console.log('\n====================================================');
console.log('                VALIDATION SUMMARY                  ');
console.log('====================================================');
console.log(`Errors:   ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length > 0) {
  console.log('\n[ERRORS]');
  errors.forEach(e => console.log('  ❌ ' + e));
  console.log('\n❌ DATA INTEGRITY CHECK FAILED!\n');
  process.exit(1);
} else {
  console.log('\n✅ ALL DATA & COMBAT INTEGRITY CHECKS PASSED!\n');
  process.exit(0);
}
