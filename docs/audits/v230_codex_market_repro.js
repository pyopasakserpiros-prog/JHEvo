'use strict';
// Audit reproducer: a PASS means the reported defect is present on the audited
// baseline. This is NOT a regression gate: invert the assertions after fixes.
const assert = require('assert');
const { SIM, SECT, ECO, EXT, MARTIAL } = require('../../GAME_SOURCE/test/load.js');
const world = seed => SIM.create(seed, { masterIdx: 0 });
const visit = (w, options) => EXT.openVisit(w, { stones: 1000, stayDays: 2, stock: {}, wants: {}, ...options });

// A known manual offered by a merchant is treated as a stock shortage. The
// merchant has two copies, but settlement adds only one to surplus.
{
  const w = world('ordinary-known'), tid = 'ART190_XIAN_001', key = 'TECH_MANUAL:' + tid;
  w.sect.stones = 10000;
  if (!w.sect.library.includes(tid)) w.sect.library.push(tid);
  w.sect.surplusTechManuals = [];
  w.sect.buyList = []; w.sect.shortageDirectives = [];
  const v = visit(w, { stock: { [key]: 2 }, wants: {} });
  const before = w.sect.stones;
  const result = EXT.tradeSect(w, v);
  assert.strictEqual(result.bought, 2);
  assert.strictEqual(result.buyCost, before - w.sect.stones);
  assert.strictEqual(v.stock[key] || 0, 0);
  assert.strictEqual(w.sect.surplusTechManuals.filter(x => x === tid).length, 1);
  console.log('CONFIRMED MARKET-01: bought 2 known manuals, stored 1 surplus; cost', result.buyCost);
}

// Editor-created material is marked spawned, but NPC and sect external sales
// take the full payment while leaving spawned counters larger than stock.
{
  const w = world('spawn-sell-npc'), n = w.npcs[1], id = 'MAT_HERB_CINDER_LEAF_1';
  n.inv.mats = {}; n.inv.stones = 0;
  assert(SECT.EDITOR.spawnItem(w, { kind: 'MATERIAL', id, dest: 'npc', npcId: n.id, qty: 2 }).ok);
  const v = visit(w, { wants: { [id]: 1 }, stones: 500 });
  const q = EXT.memberQuote(w, n, v.id);
  assert(q && q.side === 'sell' && q.itemId === id);
  assert(EXT.tradeMember(w, n, q));
  assert.strictEqual(n.inv.mats[id], 1);
  assert.strictEqual(n.inv.spawnedMats[id], 2);
  assert.strictEqual(n.inv.stones, q.price);
  const loaded = SIM.deserialize(SIM.serialize(w));
  assert.strictEqual(loaded.byId[n.id].inv.mats[id], 1);
  assert.strictEqual(loaded.byId[n.id].inv.spawnedMats[id], 2);
  const reloadedNpc = loaded.byId[n.id];
  reloadedNpc.inv.mats[id] += 1; // Simulate acquiring one legitimate item.
  const donation = SECT.donateMat(loaded, reloadedNpc, id, 2);
  assert(donation.ok);
  assert.strictEqual(donation.reward, 0); // The stale count consumes both, even though one was legitimate.
  console.log('CONFIRMED MARKET-02a: NPC sold spawned item for', q.price, 'and a later 1 spawned + 1 legitimate donation earned 0 CP');
}
{
  const w = world('spawn-sell-sect'), id = 'MAT_ORE_BLACK_IRON_1';
  w.sect.stock[id] = 0; w.sect.stones = 0;
  assert(SECT.EDITOR.spawnItem(w, { kind: 'MATERIAL', id, dest: 'sect', qty: 100 }).ok);
  const v = visit(w, { wants: { [id]: 5 }, stones: 500 });
  const result = EXT.tradeSect(w, v);
  assert.strictEqual(result.sold, 5);
  assert.strictEqual(ECO.count(w, id), 95);
  assert.strictEqual(w.sect.spawnedMats[id], 100);
  assert(result.sellRevenue > 0);
  console.log('CONFIRMED MARKET-02b: sect sold 5 spawned items for', result.sellRevenue, 'and spawned count 100 > stock 95');
}

// Two different rolled items with the same template and price: a previously
// quoted UID disappears, but tradeMember accepts the old quote and buys another.
{
  const w = world('quote-probe'), n = w.npcs.find(x => x.cult);
  n.equip = {}; n.inv.stones = 100000; n.inv.mats = {}; n.inv.pills = {};
  const items = [];
  for (let i = 0; i < 100; i++) {
    const item = ECO.rollProceduralGear(w, { maxTier: 2, minTier: 1, source: 'merchant:rare' });
    if (MARTIAL.classifyGearForNpc(w, n, item, 0).category === 'useful-now') items.push(item);
  }
  let first, second;
  outer: for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    if (items[i].id === items[j].id && items[i].value === items[j].value && items[i].uid !== items[j].uid) {
      first = items[i]; second = items[j]; break outer;
    }
  }
  assert(first && second, 'seed must produce two matching template/price items');
  const v = visit(w, { gearStock: [first, second] });
  const quote = EXT.memberQuote(w, n, v.id);
  assert(quote && quote.side === 'buy-proc-gear');
  v.gearStock = v.gearStock.filter(x => x.uid !== quote.gearUid);
  const fresh = EXT.memberQuote(w, n, v.id);
  assert(fresh && fresh.gearUid !== quote.gearUid && fresh.itemId === quote.itemId && fresh.price === quote.price);
  assert.strictEqual(EXT.tradeMember(w, n, quote), true);
  assert.strictEqual(n.equip[first.slot].uid, fresh.gearUid);
  console.log('CONFIRMED MARKET-03: stale UID', quote.gearUid, 'bought different UID', fresh.gearUid);
}

// Mutating inventory within the same day must invalidate the intelligence
// snapshot, but neither ECO.add nor ECO.take marks it dirty.
{
  const w = world('inventory-stale'), id = 'MAT_ORE_BLACK_IRON_1';
  w.sect.stock[id] = 1;
  const first = ECO.inventoryIntelligence(w, true).items[id];
  assert.strictEqual(first.state, 'shortage');
  assert(ECO.add(w, id, 100));
  const cachedAdd = ECO.inventoryIntelligence(w).items[id];
  const freshAdd = ECO.inventoryIntelligence(w, true).items[id];
  assert.strictEqual(cachedAdd.current, 1);
  assert.strictEqual(cachedAdd.state, 'shortage');
  assert.strictEqual(freshAdd.current, 101);
  assert.strictEqual(freshAdd.state, 'surplus');
  assert(ECO.take(w, id, 100));
  const cachedTake = ECO.inventoryIntelligence(w).items[id];
  const freshTake = ECO.inventoryIntelligence(w, true).items[id];
  assert.strictEqual(cachedTake.current, 101);
  assert.strictEqual(cachedTake.state, 'surplus');
  assert.strictEqual(freshTake.current, 1);
  assert.strictEqual(freshTake.state, 'shortage');
  console.log('CONFIRMED MARKET-04: cached shortage/surplus and quantity stay stale after add/take');
}
