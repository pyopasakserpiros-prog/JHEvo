'use strict';
const assert = require('assert');
const G = require('./load.js');
const { SIM, ECO, EXT, MARTIAL, CULT, CONTENT } = G;

function createWorld(seed) {
  return SIM.create(seed || 'ext-expansion-test', { masterIdx: 0 });
}

console.log('--- TEST 1: isTradable & basePrice across all item families ---');
{
  assert(EXT.isTradable('grain'), 'grain is tradable');
  assert(EXT.isTradable('MAT_HERB_DEW_GRASS_1'), 'material is tradable');
  assert(EXT.isTradable('P:BASIC_HP'), 'pill is tradable');
  assert(EXT.isTradable('T:ART190_XIAN_001') || EXT.isTradable('CRYSTAL:T:ART190_XIAN_001'), 'tech crystal tradable');
  assert(EXT.isTradable('S:SWORD_IMMORTAL') || EXT.isTradable('CRYSTAL:S:SWORD_IMMORTAL'), 'sub crystal tradable');
  assert(EXT.isTradable('TECH_MANUAL:ART190_XIAN_001'), 'tech manual tradable');
  assert(EXT.isTradable('SUB_MANUAL:SWORD_IMMORTAL'), 'sub manual tradable');
  assert(EXT.isTradable('RECIPE_SCROLL:REC140_ALC_QI_DEW_1'), 'recipe scroll tradable');

  const pTechManual = EXT.basePrice(null, 'TECH_MANUAL:ART190_XIAN_001');
  assert(Number.isFinite(pTechManual) && pTechManual > 20, 'tech manual must have positive base price');
  const pSubManual = EXT.basePrice(null, 'SUB_MANUAL:SWORD_IMMORTAL');
  assert(Number.isFinite(pSubManual) && pSubManual > 50, 'sub manual must have positive base price');
  const pRecipe = EXT.basePrice(null, 'RECIPE_SCROLL:REC140_ALC_QI_DEW_1');
  assert(Number.isFinite(pRecipe) && pRecipe > 10, 'recipe scroll must have positive base price');
}

console.log('--- TEST 2: Sect surplus manual and recipe liquidation ---');
{
  const W = createWorld('surplus-liquidation-1');
  W.sect.stones = 500;
  W.sect.surplusTechManuals = ['ART190_XIAN_001'];
  W.sect.surplusSubManuals = ['SWORD_IMMORTAL'];
  W.sect.surplusRecipes = ['REC140_ALC_QI_DEW_1'];

  const v = EXT.openVisit(W, {
    subtype: 'rare',
    nameTh: 'นายหน้าสมบัติทดสอบ',
    stones: 2000,
    wants: { 'TECH_MANUAL:ART190_XIAN_001': 1, 'SUB_MANUAL:SWORD_IMMORTAL': 1 },
    stock: {},
    stayDays: 2
  });

  const beforeSectStones = W.sect.stones;
  const beforeTraderStones = v.stones;

  const res = EXT.tradeSect(W, v);
  assert(res.sold > 0, 'Sect should sell surplus manuals to rare merchant');
  assert(res.sellRevenue > 0, 'Revenue should be positive');
  assert.strictEqual(W.sect.stones, beforeSectStones + res.sellRevenue);
  assert.strictEqual(v.stones, beforeTraderStones - res.sellRevenue);
  assert(W.sect.surplusTechManuals.length === 0 || W.sect.surplusSubManuals.length === 0, 'Sold manual should be removed from surplus');
}

console.log('--- TEST 3: Anti-minting invariant for spawned surplus ---');
{
  const W = createWorld('anti-minting-market-1');
  W.sect.stones = 500;
  // Mark surplus items as spawned
  W.sect.surplusTechManuals = ['ART190_XIAN_001'];
  W.sect.spawnedSurplusTech = ['ART190_XIAN_001'];
  W.sect.surplusSubManuals = ['SWORD_IMMORTAL'];
  W.sect.spawnedSurplusSub = ['SWORD_IMMORTAL'];
  W.sect.surplusRecipes = ['REC140_ALC_QI_DEW_1'];
  W.sect.spawnedSurplusRecipes = ['REC140_ALC_QI_DEW_1'];

  const v = EXT.openVisit(W, {
    subtype: 'rare',
    nameTh: 'นายหน้าตรวจเช็ก',
    stones: 2000,
    wants: { 'TECH_MANUAL:ART190_XIAN_001': 1, 'SUB_MANUAL:SWORD_IMMORTAL': 1, 'RECIPE_SCROLL:REC140_ALC_QI_DEW_1': 1 },
    stock: {},
    stayDays: 2
  });

  const beforeSectStones = W.sect.stones;
  const res = EXT.tradeSect(W, v);
  assert.strictEqual(res.sold, 0, 'Spawned surplus items must NEVER be sold for stones');
  assert.strictEqual(W.sect.stones, beforeSectStones, 'Sect stones must remain unchanged');
  assert.strictEqual(W.sect.surplusTechManuals.length, 1, 'Spawned manual remains in warehouse but not sold');
}

console.log('--- TEST 4: Demand-driven purchasing of knowledge crystals ---');
{
  const W = createWorld('demand-buy-crystal-1');
  W.sect.stones = 5000;
  W.sect.library = []; // Library empty
  const techId = 'ART190_XIAN_001';
  // Alive members eligible
  const v = EXT.openVisit(W, {
    subtype: 'rare',
    nameTh: 'วาณิชแดนไกล',
    stones: 500,
    stock: { ['T:' + techId]: 2 },
    wants: {},
    stayDays: 2
  });

  const beforeSectStones = W.sect.stones;
  const res = EXT.tradeSect(W, v);
  assert(res.bought > 0, 'Sect should purchase technique crystal when members are eligible and library lacks it');
  assert(W.sect.stones < beforeSectStones, 'Sect stones spent');
  assert((W.sect.crystals && W.sect.crystals['T:' + techId] > 0), 'Crystal added to sect crystal inventory');
}

console.log('ALL EXTERNAL MARKET EXPANSION TESTS PASSED');
