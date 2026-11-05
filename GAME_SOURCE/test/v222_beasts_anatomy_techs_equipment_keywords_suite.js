'use strict';
/**
 * Reconstructed Regression Suite (v3.0.0 Audit):
 * v222_beasts_anatomy_techs_equipment_keywords_suite.js
 * Verifies v222 beast anatomy materials, v222 equipment recipes, v222 techniques,
 * and composable keyword validation.
 */
const assert = require('assert');
const { SIM, ECO, CULT, SK, JD } = require('./load');

const W = SIM.create('v222-restored-regression');

// 1. Verify v222 beast anatomy materials exist in ECO.matById / JD.ITEMS
const mats = (JD.ITEMS && JD.ITEMS.materials) || [];
const v222Mats = mats.filter(m => m && String(m.id || '').startsWith('MAT_V222_'));
assert(v222Mats.length >= 10, 'v222 beast anatomy materials exist');

// 2. Verify v222 equipment recipes exist in JD.ITEMS.recipes
const recipes = (JD.ITEMS && JD.ITEMS.recipes) || [];
const v222Recs = recipes.filter(r => r && String(r.id || '').startsWith('REC_V222_'));
assert(v222Recs.length >= 10, 'v222 equipment recipes exist');

// 3. Verify v222 techniques exist in JD.TECH.techniques and pass composable validation
const techs = (JD.TECH && JD.TECH.techniques) || [];
const v222Techs = techs.filter(t => t && String(t.id || '').startsWith('TECH_V222_'));
assert(v222Techs.length >= 10, 'v222 techniques exist');
for (const t of v222Techs) {
  const val = SK.validateComposableSpec(t);
  assert(val && val.ok, `v222 technique ${t.id} passes composable spec validation`);
}

console.log('PASS v222_beasts_anatomy_techs_equipment_keywords_suite');
