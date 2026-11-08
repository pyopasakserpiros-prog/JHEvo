/* economy.js — คลังสำนัก วัตถุดิบ ตำรับ การผลิต โอสถ อุปกรณ์ ตลาด
 * ทุกของมีที่มา-ที่ไป: สวน/เหมือง/การเดินทางนอกสำนัก/การค้า → คลัง → การผลิต → ใช้/ขาย */
(function (g) {
  'use strict';
  const U = g.U || require('./util.js'), HC = g.HC, JD = g.JD, CULT = g.CULT;
  const clamp = U.clamp;
  const ECO = {};
  const matById = {}, recipeById = {}, recipeByOutItemId = {}, itemById = {};
  JD.ITEMS.materials.forEach(m => {
    if (!Number.isFinite(m.value)) m.value = Number.isFinite(m.price) ? m.price : (Number.isFinite(m.baseValue) ? m.baseValue : Math.round(8 * Math.pow(1.85, (m.tier || 1) - 1)));
    matById[m.id] = m;
  });
  JD.ITEMS.items.forEach(i => {
    if (!Number.isFinite(i.value)) i.value = Number.isFinite(i.price) ? i.price : (Number.isFinite(i.baseValue) ? i.baseValue : Math.round(20 * Math.pow(1.9, (i.tier || 1) - 1)));
    itemById[i.id] = i;
    if ((i.out === 'MATERIAL' || i.type === 'mat') && !matById[i.id]) {
      if (!i.category) i.category = i.cat || i.sub || 'SPECIAL';
      matById[i.id] = i;
      if (Array.isArray(JD.ITEMS.materials)) JD.ITEMS.materials.push(i);
    }
  });
  [
    { id: 'MAT_BOSS_HORN_CROWN', nameTh: 'เขาราชันอสูรบรรพกาล', tier: 5, category: 'ORGAN', value: 420 },
    { id: 'MAT_BOSS_VENOM_SAC', nameTh: 'ถุงพิษอสูรพันปี', tier: 5, category: 'ORGAN', value: 380 },
    { id: 'MAT_BOSS_WING', nameTh: 'ปีกวายุราชันอสูร', tier: 5, category: 'ORGAN', value: 390 },
    { id: 'MAT_BOSS_CORE_SHELL', nameTh: 'เกล็ดเกราะอกราชันอสูร', tier: 5, category: 'ORGAN', value: 450 }
  ].forEach(bm => {
    if (!matById[bm.id]) { matById[bm.id] = bm; if (Array.isArray(JD.ITEMS.materials)) JD.ITEMS.materials.push(bm); }
    if (!itemById[bm.id]) itemById[bm.id] = bm;
  });
  JD.ITEMS.recipes.forEach(r => {
    if (!r.craft && r.station) r.craft = r.station === 'FORGE' ? 'FORGING' : r.station;
    if (!r.craft) r.craft = 'FORGING';
    const outIt = r.outItemId && itemById[r.outItemId];
    if (!r.outType) {
      if (r.out === 'EQUIPMENT' || (outIt && (outIt.out === 'EQUIPMENT' || outIt.slot))) r.outType = 'EQUIPMENT';
      else if (r.out === 'PILL' || r.craft === 'ALCHEMY' || (outIt && (outIt.out === 'PILL' || outIt.cat === 'PILL' || outIt.kind === 'PILL'))) r.outType = 'PILL';
      else if (outIt && (outIt.cat === 'TALISMAN' || outIt.kind === 'TALISMAN' || outIt.out === 'CONSUMABLE')) r.outType = 'CONSUMABLE';
      else r.outType = r.out || 'MATERIAL';
    }
    if (!Number.isFinite(r.minMastery)) r.minMastery = Math.max(0, ((r.tier || 1) - 1) * 14);
    if (!r.outNameTh) r.outNameTh = (outIt && outIt.nameTh) || (r.nameTh ? r.nameTh.replace(/^ตำรา(หลอม|ปรุง|สร้าง|ตัดเย็บ|สลัก)\s*·?\s*/, '') : r.id);
    recipeById[r.id] = r;
    if (r.outItemId) recipeByOutItemId[r.outItemId] = r;
  });
  const STATIC_ITEM_IDS = new Set(Object.keys(itemById));
  ECO.STATIC_ITEM_IDS = STATIC_ITEM_IDS;
  ECO.matById = matById; ECO.matMap = matById; ECO.recipeById = recipeById; ECO.recipeByOutItemId = recipeByOutItemId; ECO.itemById = itemById;

  ECO.GRAIN_PRICE = 3; ECO.MEAL_PER_GRAIN = 3;

  /* ---------- ชื่อ/มูลค่า ---------- */
  ECO.name = id => {
    if (typeof id !== 'string') return String(id || '');
    if (id === 'grain') return 'ข้าวสาร'; if (id === 'meal') return 'อาหารพร้อมกิน'; if (id === 'stones') return 'ศิลาวิญญาณ';
    if (matById[id]) return matById[id].nameTh;
    if (id.startsWith('P:')) {
      const raw = id.slice(2);
      const r = recipeById[raw] || recipeByOutItemId[raw];
      if (r) return r.outNameTh || r.nameTh;
      if (itemById[raw]) return itemById[raw].nameTh;
      return id;
    }
    if (id.startsWith('EQ:')) {
      const raw = id.slice(3);
      if (itemById[raw]) return itemById[raw].nameTh;
      return raw;
    }
    if (id.startsWith('TECH_MANUAL:')) {
      const raw = id.slice(12);
      const t = g.CULT && g.CULT.tech ? g.CULT.tech(raw) : null;
      return t ? 'คัมภีร์' + t.nameTh : raw;
    }
    if (id.startsWith('SUB_MANUAL:')) {
      const raw = id.slice(11);
      const s = g.CULT && g.CULT.subById ? g.CULT.subById[raw] : null;
      return s ? 'เคล็ดสายย่อย' + s.nameTh : raw;
    }
    if (id.startsWith('RECIPE_SCROLL:') || id.startsWith('FORMULA:')) {
      const raw = id.startsWith('RECIPE_SCROLL:') ? id.slice(14) : id.slice(8);
      const r = recipeById[raw];
      return r ? 'ม้วนตำรับ' + r.nameTh : raw;
    }
    if (id.startsWith('CRYSTAL:')) {
      const raw = id.slice(8);
      const tid = raw.startsWith('T:') ? raw.slice(2) : raw;
      const t = g.CULT && g.CULT.tech ? g.CULT.tech(tid) : null;
      return t ? 'ผลึกมรดก' + t.nameTh : raw;
    }
    if (itemById[id]) return itemById[id].nameTh;
    if (recipeById[id]) return recipeById[id].outNameTh || recipeById[id].nameTh;
    if (recipeByOutItemId[id]) return recipeByOutItemId[id].outNameTh || recipeByOutItemId[id].nameTh;
    if (g.CONTENT && g.CONTENT.organById && g.CONTENT.organById[id]) return g.CONTENT.organById[id].nameTh;
    return id;
  };
  ECO.base = id => {
    if (typeof id !== 'string') return 5;
    if (id === 'grain') return ECO.GRAIN_PRICE; if (id === 'meal') return 1.2;
    if (matById[id]) return matById[id].value || matById[id].price || 10;
    if (id.startsWith('P:')) {
      const raw = id.slice(2);
      const r = recipeById[raw] || recipeByOutItemId[raw];
      if (r) return 14 * Math.pow(2.05, r.tier - 1);
      if (itemById[raw]) return itemById[raw].value || 10;
      return 10;
    }
    if (id.startsWith('EQ:')) {
      const raw = id.slice(3);
      if (itemById[raw]) return itemById[raw].value || 25;
      return 35;
    }
    if (id.startsWith('TECH_MANUAL:')) {
      const t = g.CULT && g.CULT.tech ? g.CULT.tech(id.slice(12)) : null;
      return t ? Math.round(35 * Math.pow(1.9, (t.tier || 1) - 1)) : 45;
    }
    if (id.startsWith('RECIPE_SCROLL:') || id.startsWith('FORMULA:')) {
      const raw = id.startsWith('RECIPE_SCROLL:') ? id.slice(14) : id.slice(8);
      const r = recipeById[raw];
      return r ? Math.round(28 * Math.pow(1.9, (r.tier || 1) - 1)) : 35;
    }
    if (itemById[id]) return itemById[id].value || itemById[id].price || 15;
    if (recipeById[id]) { const r = recipeById[id]; return 14 * Math.pow(2.05, r.tier - 1); }
    if (recipeByOutItemId[id]) { const r = recipeByOutItemId[id]; return 14 * Math.pow(2.05, r.tier - 1); }
    return 5;
  };
  ECO.price = (W, id) => ECO.base(id) * ((W.market && W.market.mult[id]) || 1);
  ECO.isPill = id => {
    if (typeof id !== 'string') return false;
    if (id.startsWith('P:')) {
      const raw = id.slice(2);
      const r = recipeById[raw] || recipeByOutItemId[raw];
      if (r) return r.outType === 'PILL';
      const it = itemById[raw] || (ECO.v235ItemById && ECO.v235ItemById[raw]);
      return !!(it && (it.out === 'PILL' || it.cat === 'PILL' || it.kind === 'PILL' || Array.isArray(it.phases)));
    }
    const it = itemById[id] || (ECO.v235ItemById && ECO.v235ItemById[id]);
    if (it && (it.out === 'PILL' || it.cat === 'PILL' || it.kind === 'PILL' || Array.isArray(it.phases))) return true;
    if (recipeById[id] && recipeById[id].outType === 'PILL') return true;
    if (recipeByOutItemId[id] && recipeByOutItemId[id].outType === 'PILL') return true;
    return false;
  };
  ECO.category = id => matById[id] ? matById[id].category : (ECO.isPill(id) ? 'PILL' : 'OTHER');

  function invalidateStockIntel(W) {
    if (W && W.sect) {
      W.sect._stockDirty = true;
      if (W.sect.inventoryIntelligence) W.sect.inventoryIntelligence.evaluatedAt = -1;
    }
  }
  ECO.invalidateStockIntel = invalidateStockIntel;

  /* ---------- คลัง ---------- */
  ECO.count = (W, id) => { const n = W && W.sect && W.sect.stock ? W.sect.stock[id] : 0; return Number.isFinite(n) && n > 0 ? n : 0; };
  ECO.add = (W, id, n, quality) => {
    if (!W || !W.sect || typeof id !== 'string' || !id || !Number.isFinite(n) || n <= 0) return false;
    const before = ECO.count(W, id), total = before + n; if (!Number.isFinite(total)) return false;
    if (ECO.isPill(id)) { const map = W.sect.pillQuality || (W.sect.pillQuality = {}), old = Number.isFinite(map[id]) ? map[id] : 1, q = Number.isFinite(quality) ? clamp(quality, 0.7, 1.5) : 1; map[id] = (before * old + n * q) / total; W._pillSeq = (W._pillSeq || 0) + 1; }
    if (id === '__proto__' || id === 'constructor' || id === 'prototype') Object.defineProperty(W.sect.stock, id, { value: total, writable: true, enumerable: true, configurable: true });
    else W.sect.stock[id] = total;
    W._stockSeq = (W._stockSeq || 0) + 1;
    invalidateStockIntel(W);
    return true;
  };
  ECO.take = (W, id, n) => {
    if (!W || !W.sect || typeof id !== 'string' || !id || !Number.isFinite(n) || n < 0) return false;
    if (n === 0) return true;
    const have = ECO.count(W, id); if (have < n) return false;
    if (id === 'meal' && n > 0) consumeMealSpecialties(W, n);
    const rem = have > n ? have - n : 0;
    if (rem > 0) W.sect.stock[id] = rem; else { delete W.sect.stock[id]; if (W.sect.pillQuality) delete W.sect.pillQuality[id]; }
    if (W.sect.spawnedMats && W.sect.spawnedMats[id] != null) {
      if (W.sect.spawnedMats[id] > rem) W.sect.spawnedMats[id] = rem;
      if (W.sect.spawnedMats[id] <= 0) delete W.sect.spawnedMats[id];
    }
    if (W.sect.spawnedPills && W.sect.spawnedPills[id] != null) {
      if (W.sect.spawnedPills[id] > rem) W.sect.spawnedPills[id] = rem;
      if (W.sect.spawnedPills[id] <= 0) delete W.sect.spawnedPills[id];
    }
    if (W.sect && W.sect.stockTracker && n > 0) W.sect.stockTracker.recordUsage(id, n, W.day);
    if (ECO.isPill(id)) W._pillSeq = (W._pillSeq || 0) + 1;
    W._stockSeq = (W._stockSeq || 0) + 1;
    invalidateStockIntel(W);
    return true;
  };
  ECO.spend = (W, amt, why) => ECO.pay(W, amt, why);
  ECO.pay = (W, amt, why) => {
    if (!W || !W.sect || !Number.isFinite(amt) || amt <= 0 || !Number.isFinite(W.sect.stones) || W.sect.stones < amt) return false;
    W.sect.stones -= amt;
    W.sect.ledger.push({ t: W.t, amt: -amt, why });
    trimLedger(W);
    return true;
  };
  ECO.earn = (W, amt, why) => {
    if (!W || !W.sect || !Number.isFinite(amt) || amt <= 0) return false;
    if (!Number.isFinite(W.sect.stones)) W.sect.stones = 0;
    W.sect.stones += amt;
    W.sect.ledger.push({ t: W.t, amt: +amt, why });
    trimLedger(W);
    return true;
  };
  function trimLedger(W) { if (W.sect.ledger.length > 400) W.sect.ledger.splice(0, 200); }

  /* ---------- ตลาดภายนอก (ราคาแกว่งตามเดือน) ---------- */
  ECO.newMarket = rng => ({ mult: {}, month: -1 });
  ECO.monthlyMarket = (W) => {
    const m = W.market;
    JD.ITEMS.materials.map(x => x.id).concat(['grain']).forEach(id => {
      const cur = m.mult[id] || 1;
      const nx = clamp(cur + W.rng.gauss(0, 0.07) + (1 - cur) * 0.2, 0.65, 1.7);
      m.mult[id] = Math.round(nx * 100) / 100;
    });
    if (W.threat && W.threat.roadBlocked > 0) { ['grain', 'MAT_ORE_BLACK_IRON_1'].forEach(id => m.mult[id] = Math.min(1.9, (m.mult[id] || 1) * 1.15)); }
  };

  /* ---------- ตำรับ ---------- */
  ECO.recipeKnown = (W, r) => !!r && (r.tier <= W.sect.recipeTier || (!!r.experimentId && (W.sect.knownRecipes || []).includes(r.id))) && (!r.discoverable || (W.sect.knownRecipes || []).includes(r.id));
  ECO.recipeKnownFor = (W, npc, r) => !!r && (r.tier <= W.sect.recipeTier || (!!r.experimentId && ((W.sect.knownRecipes || []).includes(r.id) || !!(npc && npc.inv && Array.isArray(npc.inv.recipes) && npc.inv.recipes.includes(r.id)) || !!(npc && Array.isArray(npc.recipes) && npc.recipes.includes(r.id))))) && (!r.discoverable || (W.sect.knownRecipes || []).includes(r.id) || !!(npc && npc.inv && Array.isArray(npc.inv.recipes) && npc.inv.recipes.includes(r.id)) || !!(npc && Array.isArray(npc.recipes) && npc.recipes.includes(r.id)));
  ECO.craftEligible = (W, npc, r, hall) => {
    if (!ECO.recipeKnownFor(W, npc, r)) return false;
    const paths = Array.isArray(r.compatiblePath) ? r.compatiblePath : [r.compatiblePath || 'ANY'];
    if (!paths.includes('ANY') && (!npc.cult || !paths.includes(npc.cult.path))) return false;
    if (r.minStage && (!npc.cult || (CULT.effectiveTechStage ? CULT.effectiveTechStage(npc) : npc.cult.stage) < r.minStage)) return false;
    const building = W.map.byId[hall || (r.craft === 'ALCHEMY' ? 'alchemy' : 'forge')];
    return !r.facilityLevel || !!building && building.level >= r.facilityLevel;
  };
  ECO.recipesFor = (W, crafts) => JD.ITEMS.recipes.filter(r => crafts.includes(r.craft) && ECO.recipeKnown(W, r) && !r.basic && r.outType !== 'BEAST_ITEM' && (!r.fishAlchemyRecipe || (W && W.sect && W.sect.stock && (W.sect.stock[r.inputs[0].matId] || 0) > 0)));
  function recipeInputs(r, mult) {
    if (!r || typeof r.id !== 'string' || !Array.isArray(r.inputs) || !r.inputs.length || !Number.isFinite(mult) || mult <= 0) return null;
    if (mult === 1 && r._normInputs1 && r._normInputsSrc === r.inputs) return r._normInputs1;
    const totals = new Map();
    for (const i of r.inputs) {
      if (!i || typeof i.matId !== 'string' || !i.matId || !Number.isFinite(i.count) || i.count <= 0) return null;
      const count = (totals.get(i.matId) || 0) + i.count * mult; if (!Number.isFinite(count)) return null;
      totals.set(i.matId, count);
    }
    const out = Array.from(totals, ([matId, count]) => ({ matId, count }));
    if (mult === 1) { r._normInputs1 = out; r._normInputsSrc = r.inputs; }
    return out;
  }
  ECO.resolveCraftMaterials = (W, r, opts, npc) => {
    opts = opts || {};
    if (!r || !W || !W.sect) return null;
    if (!r.proceduralOut || !Array.isArray(r.slotOptions) || !r.slotOptions.length) {
      const inputs = recipeInputs(r, 1);
      if (!inputs || !inputs.every(i => ECO.count(W, i.matId) >= i.count)) return null;
      return { inputs, chosenOptions: [], materialMods: null };
    }
    const stock = W.sect.stock || {};
    const chosenMats = Array.isArray(opts.chosenMats) ? opts.chosenMats : (opts.chosenBySlot || null);
    const chosenOptions = [];
    const totals = new Map();
    const maxStage = npc && npc.cult ? clamp((CULT.effectiveTechStage ? CULT.effectiveTechStage(npc) : npc.cult.stage) + 1, 1, 4) : 4;
    const preferEl = (opts.preferElement) || (npc && npc.cult && g.CULT && g.CULT.sub && g.CULT.sub(npc) && g.CULT.sub(npc).element) || null;

    for (let sIdx = 0; sIdx < r.slotOptions.length; sIdx++) {
      const slotDef = r.slotOptions[sIdx];
      const options = Array.isArray(slotDef && slotDef.options) ? slotDef.options : [];
      if (!options.length) return null;
      let picked = null;
      const requestedId = chosenMats && chosenMats[sIdx];
      if (requestedId) {
        const reqOpt = options.find(o => o.matId === requestedId);
        if (reqOpt) {
          const already = totals.get(reqOpt.matId) || 0;
          if ((stock[reqOpt.matId] || 0) >= already + reqOpt.count) picked = reqOpt;
          else if (opts.strictChosen) return null;
        } else if (opts.strictChosen) {
          return null;
        }
      }
      if (!picked) {
        let bestScore = -Infinity;
        for (let j = 0; j < options.length; j++) {
          const o = options[j];
          const already = totals.get(o.matId) || 0;
          const have = stock[o.matId] || 0;
          if (have < already + o.count) continue;
          const mat = matById[o.matId] || { tier: 1 };
          const mTier = mat.tier || 1;
          const tierFit = mTier <= maxStage ? mTier * 10 : (maxStage * 10 - (mTier - maxStage) * 14);
          const elBonus = (preferEl && o.elementBias === preferEl) ? 8 : 0;
          const abundance = Math.min(12, have - (already + o.count));
          const sc = tierFit + elBonus + abundance * 0.5;
          if (sc > bestScore) {
            bestScore = sc;
            picked = o;
          }
        }
      }
      if (!picked) return null;
      chosenOptions.push(picked);
      totals.set(picked.matId, (totals.get(picked.matId) || 0) + picked.count);
    }
    const inputs = Array.from(totals, ([matId, count]) => ({ matId, count }));
    let tierCap = 2, tierShift = 0, qShift = 0, affixShift = 0;
    const elementBiases = [], statBiases = [], matIds = [];
    for (const co of chosenOptions) {
      if (co.tierCap) tierCap = Math.max(tierCap, co.tierCap);
      if (co.tierShift) tierShift += co.tierShift;
      if (co.qShift) qShift += co.qShift;
      if (co.affixShift) affixShift += co.affixShift;
      if (co.elementBias && co.elementBias !== 'NEUTRAL') elementBiases.push(co.elementBias);
      if (co.statBias) statBiases.push(co.statBias);
      matIds.push(co.matId);
    }
    return {
      inputs,
      chosenOptions,
      materialMods: {
        tierCap: clamp(tierCap, 1, 4),
        tierShift,
        qShift,
        affixShift,
        elementBiases,
        statBiases,
        matIds
      }
    };
  };

  ECO.inputsOk = (W, r, mult, opts) => {
    const m = mult == null ? 1 : mult;
    if (!r || typeof r.id !== "string" || !Array.isArray(r.inputs) || !r.inputs.length || !Number.isFinite(m) || m <= 0) return false;
    if (r.proceduralOut && Array.isArray(r.slotOptions) && m === 1) {
      return !!ECO.resolveCraftMaterials(W, r, opts);
    }
    const inp = r.inputs, n = inp.length, stock = W.sect.stock;
    if (n === 1) {
      const i0 = inp[0];
      if (!i0 || typeof i0.matId !== "string" || !i0.matId || !Number.isFinite(i0.count) || i0.count <= 0) return false;
      const need = i0.count * m;
      return Number.isFinite(need) && (stock[i0.matId] || 0) >= need;
    }
    if (n === 2 && inp[0] && inp[1] && inp[0].matId !== inp[1].matId) {
      const i0 = inp[0], i1 = inp[1];
      if (typeof i0.matId !== "string" || !i0.matId || !Number.isFinite(i0.count) || i0.count <= 0) return false;
      if (typeof i1.matId !== "string" || !i1.matId || !Number.isFinite(i1.count) || i1.count <= 0) return false;
      const n0 = i0.count * m, n1 = i1.count * m;
      return Number.isFinite(n0) && Number.isFinite(n1) && (stock[i0.matId] || 0) >= n0 && (stock[i1.matId] || 0) >= n1;
    }
    const inputs = recipeInputs(r, m);
    return !!inputs && inputs.every(i => ECO.count(W, i.matId) >= i.count);
  };
  ECO.inputCost = (W, r) => r.inputs.reduce((s, i) => s + ECO.price(W, i.matId) * i.count, 0);
  ECO.outputValue = (W, r) => {
    if (!r && W && W.id) { r = W; W = null; }
    if (!r) return 0;
    if (r.outItemId && itemById[r.outItemId]) {
      const it = itemById[r.outItemId];
      const v = Number.isFinite(it.value) ? it.value : (Number.isFinite(it.price) ? it.price : (Number.isFinite(it.baseValue) ? it.baseValue : 20 * Math.pow(1.9, (r.tier || 1) - 1)));
      return v * 0.8;
    }
    if (r.outType === 'PILL') return ECO.base('P:' + r.id) * 0.9;
    return 20 * Math.pow(1.9, (r.tier || 1) - 1);
  };
  ECO.craftHours = (r, skill) => (3.5 + 2.3 * r.tier) * (1 - clamp(skill, 0, 100) / 100 * 0.32);
  function craftTransactions(W) {
    if (!W.sect.craftTransactions) W.sect.craftTransactions = { seq: 0, open: {} };
    return W.sect.craftTransactions;
  }
  function matchingReceipt(W, npc, r, ctx) {
    const receipt = ctx && ctx.craftReceipt, ledger = W.sect.craftTransactions;
    if (!receipt || receipt.state !== 'reserved' || !ledger || !r || !npc) return null;
    const paid = ledger.open[receipt.id];
    return paid && paid.rid === r.id && paid.npcId === npc.id && receipt.rid === paid.rid && receipt.npcId === paid.npcId ? paid : null;
  }
  function registerCraft(W, npc, r, ctx, inputs, materialMods) {
    const ledger = craftTransactions(W), npcId = npc ? npc.id : null;
    if (!Number.isSafeInteger(ledger.seq) || ledger.seq < 0 || ledger.seq >= Number.MAX_SAFE_INTEGER) return false;
    if (npcId != null) Object.keys(ledger.open).forEach(id => { if (ledger.open[id].npcId === npcId) delete ledger.open[id]; });
    const id = String(++ledger.seq), paid = { id, rid: r.id, npcId, inputs, materialMods: materialMods || null };
    ledger.open[id] = paid;
    if (ctx) ctx.craftReceipt = { id, rid: r.id, npcId, state: 'reserved', materialMods: materialMods || null };
    return true;
  }
  ECO.reserveInputs = (W, r, ctx, npc) => {
    if (ctx && (typeof ctx !== 'object' || Array.isArray(ctx) || !npc || npc.id == null)) return false;
    if (ctx && ctx.craftReceipt) return !!matchingReceipt(W, npc, r, ctx);
    let inputs = null, materialMods = null;
    if (r && r.proceduralOut && Array.isArray(r.slotOptions)) {
      const resolved = ECO.resolveCraftMaterials(W, r, ctx && ctx.craftOpts, npc);
      if (!resolved) return false;
      inputs = resolved.inputs;
      materialMods = resolved.materialMods;
    } else {
      inputs = recipeInputs(r, 1);
      if (!inputs || !inputs.every(i => ECO.count(W, i.matId) >= i.count)) return false;
    }
    const ledger = craftTransactions(W);
    if (!Number.isSafeInteger(ledger.seq) || ledger.seq < 0 || ledger.seq >= Number.MAX_SAFE_INTEGER) return false;
    const taken = [];
    for (let idx = 0; idx < inputs.length; idx++) {
      const inp = inputs[idx];
      if (!ECO.take(W, inp.matId, inp.count)) {
        for (let rIdx = 0; rIdx < taken.length; rIdx++) ECO.add(W, taken[rIdx].matId, taken[rIdx].count);
        return false;
      }
      taken.push(inp);
    }
    return registerCraft(W, npc, r, ctx, inputs, materialMods);
  };
  ECO.adoptLegacyCraft = (W, npc, r, ctx) => {
    if (!npc || npc.id == null || !ctx || typeof ctx !== 'object' || ctx.rid !== (r && r.id)) return false;
    if (ctx.craftReceipt) return !!matchingReceipt(W, npc, r, ctx);
    const inputs = recipeInputs(r, 1); return !!inputs && registerCraft(W, npc, r, ctx, inputs);
  };
  ECO.cancelCraft = (W, npc, reason, opts) => {
    if (!W || !W.sect || !W.sect.craftTransactions || !W.sect.craftTransactions.open) return false;
    const ledger = W.sect.craftTransactions;
    const npcId = typeof npc === 'object' && npc ? npc.id : npc;
    if (npcId == null) return false;
    let closedCount = 0;
    const refund = !(opts && opts.noRefund);
    for (const id of Object.keys(ledger.open)) {
      const paid = ledger.open[id];
      if (paid && paid.npcId === npcId) {
        if (refund && Array.isArray(paid.inputs)) {
          paid.inputs.forEach(inp => { if (inp && inp.matId && inp.count > 0) ECO.add(W, inp.matId, inp.count); });
        }
        delete ledger.open[id];
        closedCount++;
      }
    }
    if (typeof npc === 'object' && npc && npc.act && npc.act.ctx && npc.act.ctx.craftReceipt) {
      npc.act.ctx.craftReceipt.state = 'cancelled';
      npc.act.ctx.craftReceipt.cancelReason = reason || 'interrupted';
    }
    return closedCount > 0;
  };
  ECO.pruneCraftTransactions = W => {
    const ledger = W && W.sect && W.sect.craftTransactions; if (!ledger) return;
    Object.keys(ledger.open).forEach(id => {
      const paid = ledger.open[id]; if (paid.npcId == null) return;
      const n = W.byId[paid.npcId], ac = n && n.act, receipt = ac && ac.ctx && ac.ctx.craftReceipt;
      if (!n || n.dead || !ac || !['brew', 'forge', 'brewBasic', 'cook'].includes(ac.id) || !receipt || receipt.id !== id || receipt.state !== 'reserved') delete ledger.open[id];
    });
  };
  function settleCraft(W, npc, r, ctx) {
    const ledger = W.sect.craftTransactions; if (!ledger || !r || !npc) return null;
    const paid = ctx ? matchingReceipt(W, npc, r, ctx) : Object.values(ledger.open).find(p => p.npcId == null && p.rid === r.id);
    if (!paid) return null;
    delete ledger.open[paid.id];
    if (ctx) ctx.craftReceipt.state = 'settled';
    return paid;
  }
  // Metadata is read at runtime: loading this module precedes martial/proficiency modules.
  ECO.profession = npc => {
    const c = npc && npc.cult, defs = JD.MARTIAL && JD.MARTIAL.professionSpecializations;
    return c && c.path === 'CRAFT_CREATION' && defs ? defs[c.sub] || null : null;
  };
  ECO.applyArmorArtisan = (npc, gear) => {
    const spec = ECO.profession(npc);
    if (!spec || spec.role !== 'ARMOR' || !gear || gear.slot !== 'ARMOR' || gear.artisan) return false;
    const skill = clamp(npc.h.skills.FORGING || 0, 0, 100), bonus = skill / 100 * 0.08;
    if (bonus <= 0) return false;
    const stats = g.STATS && g.STATS.gearStats(gear);
    if (stats) for (const key of ['def', 'mdef']) if (Number.isFinite(stats[key])) stats[key] = Math.round(stats[key] * (1 + bonus) * 10) / 10;
    gear.defMult = (gear.defMult || 0) * (1 + bonus);
    const extraDur = Math.round(skill * 0.12);
    gear.maxDur = (gear.maxDur || 100) + extraDur;
    gear.dur = Math.min(gear.maxDur, (gear.dur || 100) + extraDur);
    gear.artisan = { sub: npc.cult.sub, skill, defenseBonus: bonus, durabilityBonus: extraDur };
    return true;
  };
  ECO.successChance = (npc, r) => {
    const skill = npc.h.skills[r.craft] != null ? npc.h.skills[r.craft] : 0;
    const elemBonus = (g.ELEM && r && r.element && r.element !== 'NEUTRAL') ? g.ELEM.resolveCompatibility(npc, r, 'crafting').craftSuccessBonus * 0.35 : 0;
    const peakAlchBonus = (npc && npc.peakId && g.SECT && g.SECT.PEAKS && g.SECT.PEAKS.getUnitPeakBonuses) ? (g.SECT.PEAKS.getUnitPeakBonuses(npc).alchemySuccess || 0) : 0;
    return clamp(0.55 + (skill - r.minMastery) / 110 + HC.eff(npc, 'physiology.dexterity') / 500 + HC.eff(npc, 'intellect.focus') / 600 + HC.special(npc, 'craft.successBonus') + (g.MARTIAL ? (g.MARTIAL.lifeMult(npc, r.craft) - 1) * .35 : 0) + elemBonus + peakAlchBonus, 0.15, 0.98);
  };
  let gearSeq = 0;
  ECO.nextGearUid = (W, prefix) => {
    const pfx = typeof prefix === 'string' && prefix ? prefix : 'eq';
    if (W && W.sect) {
      W.sect.gearUidSeq = (Number.isSafeInteger(W.sect.gearUidSeq) && W.sect.gearUidSeq >= 0 ? W.sect.gearUidSeq : gearSeq) + 1;
      gearSeq = Math.max(gearSeq, W.sect.gearUidSeq);
      return 'uid_' + pfx + '_' + W.sect.gearUidSeq;
    }
    return 'uid_' + pfx + '_' + (++gearSeq);
  };
  ECO.mintGear = (a, b, c, d) => {
    let W = null, itemOrRecipe = a, q = b, playerSpawned = !!c;
    if (a && a.sect && a.npcs) {
      W = a;
      itemOrRecipe = b;
      q = c;
      playerSpawned = !!d;
    }
    q = clamp(Number.isFinite(q) ? q : 1, 0.7, 1.5);
    if (itemOrRecipe.outItemId || itemOrRecipe.slot) {
      const it = itemOrRecipe.slot ? itemOrRecipe : itemById[itemOrRecipe.outItemId];
      const wp = it.slot === 'WEAPON', ar = it.slot === 'ARMOR';
      const cm = (wp ? 0.05 : ar ? 0.015 : 0.014) * it.tier * q, dm = (ar ? 0.05 : wp ? 0.012 : 0.012) * it.tier * q;
      const gOut = { uid: ECO.nextGearUid(W, it.id), id: it.id, nameTh: it.nameTh, slot: it.slot, gearType: it.gearType || it.weaponType || it.armorType || it.subType || undefined, subType: it.subType || it.weaponType || it.armorType || it.gearType || undefined, weaponType: it.weaponType || undefined, armorType: it.armorType || undefined, tier: it.tier, element: it.element || 'NEUTRAL', elementProfile: it.elementProfile || null, q: Math.round(q * 100) / 100, combatMult: cm, defMult: dm, dur: 100, maxDur: 100, repairCount: 0, minStage: it.minStage || 1, value: it.value };
      if (playerSpawned) gOut.playerSpawned = true;
      return gOut;
    }
    const r = itemOrRecipe, e = r.effect || {};
    const slot = /กระบี่|ศาสตรา|ทวน|ดาบ|หอก|ค้อน|ง้าว/.test(r.outNameTh) || (e.combatMult || 0) > (e.defenseMult || 0) * 1.8 ? 'WEAPON' : (e.defenseMult || 0) > (e.combatMult || 0) * 1.8 ? 'ARMOR' : 'ACCESSORY';
    const gOut = { uid: ECO.nextGearUid(W, r.id), id: r.id, nameTh: r.outNameTh, slot, tier: r.tier, element: r.element || 'NEUTRAL', elementProfile: r.elementProfile || null, q: Math.round(q * 100) / 100, combatMult: (e.combatMult || 0) * q, defMult: (e.defenseMult || 0) * q, dur: 100, maxDur: 100, repairCount: 0, minStage: e.minStageReq || 1, value: 20 * Math.pow(1.9, r.tier - 1) };
    if (playerSpawned) gOut.playerSpawned = true;
    return gOut;
  };
  /** ผลผลิตที่ได้จากการผลิตสำเร็จ: เข้าคลังสำนัก */
  /** มอบแต้มตบะบำเพ็ญจากการหลอมโอสถ/สร้างอุปกรณ์สำเร็จ (โดยเฉพาะวิถีรังสรรค์ CRAFT_CREATION และผู้มีวิชา PASS_CROSS_CRAFT_004) */
  ECO.grantCraftCultivation = (W, npc, r, opts) => {
    if (!npc || !npc.cult || !g.CULT || !g.CULT.gain) return 0;
    opts = opts || {};
    const c = npc.cult;
    const isCraftPath = c.path === 'CRAFT_CREATION';
    const hasCrossPass = Array.isArray(c.techs) && c.techs.includes('PASS_CROSS_CRAFT_004');
    const tier = (r && r.tier) || opts.tier || 1;
    const q = Number.isFinite(opts.q) ? opts.q : 1.0;
    const craftId = (r && r.craft) || opts.craft || 'FORGING';
    const skill = (npc.h && npc.h.skills && npc.h.skills[craftId]) || 0;
    const rate = g.CULT.rate ? g.CULT.rate(npc, 1.35) : 1.0;
    const mult = isCraftPath ? 1.0 : (hasCrossPass ? 0.55 : 0.25);
    const pts = Math.round(((8 + tier * 7.5 + skill * 0.16) * q * (0.7 + 0.3 * Math.min(2.2, rate))) * mult * 10) / 10;
    if (pts > 0) {
      g.CULT.gain(npc, pts, W, 'craft_cultivation');
      if (isCraftPath) {
        npc.h.state.heartDemon = Math.max(0, (npc.h.state.heartDemon || 0) - 1.5);
      }
      npc.lastCraftCultivation = { t: W ? W.t : 0, day: W ? W.day : 0, pts, recipeId: r ? r.id : (opts.recipeId || 'CRAFT'), craft: craftId };
    }
    return pts;
  };

  ECO.finishCraft = (W, npc, r, ctx) => {
    const paid = settleCraft(W, npc, r, ctx);
    if (!paid) return { ok: false, rejected: true, text: 'ไม่มีวัตถุดิบที่จองไว้สำหรับงานนี้' };
    const ok = W.rng.next() < ECO.successChance(npc, r);
    const skill = npc.h.skills[r.craft] || 0;
    (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(npc, r.craft, ECO.craftHours(r, skill), 1.1);
    if (!ok) {
      paid.inputs.forEach(i => { if (W.rng.chance(0.4)) ECO.add(W, i.matId, Math.min(i.count, Math.max(1, Math.floor(i.count / 2)))); });
      return { ok: false, text: 'ล้มเหลว สูญวัตถุดิบ' };
    }
    if (g.ELEM && g.ELEM.gainMastery) g.ELEM.gainMastery(npc, r, 'craft_finish', W, { sourceId: r.id });
    const peakQBonus = (npc && npc.peakId && g.SECT && g.SECT.PEAKS && g.SECT.PEAKS.getUnitPeakBonuses) ? (g.SECT.PEAKS.getUnitPeakBonuses(npc).craftQuality || 0) : 0;
    const kwBon = (npc && g.COMBAT && typeof g.COMBAT.keywordsOf === 'function') ? g.COMBAT.keywordsOf(npc) : null;
    const kwPrecBonus = (kwBon && kwBon.craftPrecisionAdd > 0) ? kwBon.craftPrecisionAdd : 0;
    const q = clamp(0.85 + (skill - r.minMastery) / 160 + peakQBonus + kwPrecBonus + W.rng.gauss(0, 0.06), 0.7, 1.65 + kwPrecBonus);
    const out = { ok: true, q };
    if (r.outType === 'PILL') {
      const n = (r.yield || 1) + (W.rng.chance(clamp((skill - r.minMastery) / 120, 0, 0.5)) ? 1 : 0) + (r.starter ? 1 : 0);
      const key = r.outItemId ? r.outItemId : 'P:' + r.id;
      ECO.add(W, key, n, q); out.text = ECO.name(key) + ' ×' + n; out.key = key; out.n = n;
    } else if ((r.outType === 'MATERIAL' || r.outType === 'CONSUMABLE') && r.outItemId) {
      const n = (r.yield || 1) + (W.rng.chance(clamp((skill - r.minMastery) / 160, 0, 0.35)) ? 1 : 0);
      ECO.add(W, r.outItemId, n);
      out.text = ECO.name(r.outItemId) + ' ×' + n; out.key = r.outItemId; out.n = n;
    } else if (r.outType === 'EQUIPMENT') {
      let gear = null;
      if (r.proceduralOut && ECO.rollProceduralGear) {
        gear = ECO.rollProceduralGear(W, {
          slot: r.proceduralSlot || r.slot,
          gearType: r.proceduralGearType || r.gearType,
          recipeId: r.id,
          npc,
          skill,
          baseQ: q,
          materialMods: paid.materialMods,
          chosenInputs: paid.inputs,
          source: 'forge'
        });
      } else {
        gear = ECO.mintGear(W, r, q);
        gear.q = Math.round(q * 100) / 100;
      }
      ECO.applyArmorArtisan(npc, gear);
      gear.listedAtDay = W.day;
      gear.listedTick = W.t;
      W.sect.gear.push(gear); invalidateStockIntel(W); out.text = gear.nameTh + ' (T' + gear.tier + ' · คุณภาพ ' + gear.q + ')'; out.gear = gear;
    } else { out.text = r.outNameTh; }
    npc.stats = npc.stats || {}; npc.stats.crafted = (npc.stats.crafted || 0) + 1;
    out.cultivationGained = ECO.grantCraftCultivation(W, npc, r, { q });
    return out;
  };
  // Personal production uses owned inputs first, purchasing only the missing units.
  ECO.personalCraftQuote = (W, npc, r) => {
    const CPE = g.CPE, inputs = recipeInputs(r, 1);
    if (!CPE || !npc || !npc.inv || !inputs || r.outType !== 'PILL') return null;
    if (!ECO.craftEligible(W, npc, r, 'alchemy') || (npc.h.skills[r.craft] || 0) + 20 < r.minMastery) return null;
    const mats = npc.inv.mats || {}, spawned = npc.inv.spawnedMats || {}, missing = [], owned = []; let cost = 0, ownValue = 0;
    for (const input of inputs) {
      const have = Math.min(input.count, Math.max(0, Number.isFinite(mats[input.matId]) ? mats[input.matId] : 0));
      const need = input.count - have;
      if (have) {
        const sp = Math.min(have, Math.max(0, spawned[input.matId] || 0));
        const earnedHave = Math.max(0, have - sp);
        owned.push({ id: input.matId, n: have, spawnedUsed: sp });
        ownValue += CPE.reward(W, input.matId, earnedHave);
      }
      if (need) { if (ECO.count(W, input.matId) < need) return null; const price = CPE.priceOf(W, input.matId) * need; missing.push({ id: input.matId, n: need, price }); cost += price; }
    }
    if (!Number.isFinite(cost) || (npc.cp || 0) < cost) return null;
    return { owned, missing, cost, ownValue };
  };
  ECO.personalCraft = (W, npc, r, intent) => {
    const quote = ECO.personalCraftQuote(W, npc, r), CPE = g.CPE;
    if (!quote) return { ok: false, reason: 'inputs' };
    if (!CPE.spend(W, npc, quote.cost, 'ซื้อวัตถุดิบผลิตส่วนตัว')) return { ok: false, reason: 'points' };
    quote.missing.forEach(i => ECO.take(W, i.id, i.n));
    quote.owned.forEach(i => {
      npc.inv.mats[i.id] -= i.n;
      if (npc.inv.mats[i.id] <= 0) delete npc.inv.mats[i.id];
      if (i.spawnedUsed > 0 && npc.inv.spawnedMats && npc.inv.spawnedMats[i.id]) {
        npc.inv.spawnedMats[i.id] -= i.spawnedUsed;
        if (npc.inv.spawnedMats[i.id] <= 0) delete npc.inv.spawnedMats[i.id];
      }
    });
    const skill = npc.h.skills[r.craft] || 0, ok = W.rng.next() < ECO.successChance(npc, r);
    (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(npc, r.craft, ECO.craftHours(r, skill), 1.1);
    if (!ok) return { ok: false, reason: 'failed', cost: quote.cost };
    const q = clamp(0.85 + (skill - r.minMastery) / 160 + W.rng.gauss(0, 0.06), 0.7, 1.5);
    const qty = (r.yield || 1) + (W.rng.chance(clamp((skill - r.minMastery) / 120, 0, 0.5)) ? 1 : 0) + (r.starter ? 1 : 0);
    const key = r.outItemId || 'P:' + r.id;
    npc.inv.craftedPills = npc.inv.craftedPills || [];
    npc.inv.personalCraftSeq = (npc.inv.personalCraftSeq || 0) + 1;
    const product = { id: String(npc.inv.personalCraftSeq), key, qty, q, purchasedCost: quote.cost, ownValue: quote.ownValue, intent: intent === 'donate' ? 'donate' : 'keep' };
    npc.inv.craftedPills.push(product);
    const cultPts = ECO.grantCraftCultivation(W, npc, r, { q });
    return { ok: true, product, cultivationGained: cultPts };
  };
  ECO.donatePersonalProduct = (W, npc, id, qty) => {
    if (id && typeof id === "object" && id.kind === "PILL") {
      qty = id.qty;
      id = id.pillKey || id.id;
    }
    if (npc && npc.inv && npc.inv.pills && typeof id === "string" && (npc.inv.pills[id] || 0) > 0) {
      qty = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1;
      const count = Math.min(qty, npc.inv.pills[id]);
      const spawnedHeld = (npc.inv.spawnedPills && npc.inv.spawnedPills[id]) || 0;
      const spawnedUsed = Math.min(count, spawnedHeld);
      const rewardableCount = Math.max(0, count - spawnedUsed);
      const CPE = g.CPE;
      const q = (npc.inv.pillQuality && npc.inv.pillQuality[id]) || 1;
      const reward = rewardableCount > 0 && CPE ? Math.floor(CPE.reward(W, id, rewardableCount) * q * 0.88 * 10) / 10 : 0;
      npc.inv.pills[id] -= count;
      if (npc.inv.pills[id] <= 0) delete npc.inv.pills[id];
      if (spawnedUsed > 0 && npc.inv.spawnedPills) {
        npc.inv.spawnedPills[id] -= spawnedUsed;
        if (npc.inv.spawnedPills[id] <= 0) delete npc.inv.spawnedPills[id];
        if (!Object.keys(npc.inv.spawnedPills).length) delete npc.inv.spawnedPills;
      }
      ECO.add(W, id, count, q);
      if (g.SECT && g.SECT.notifyStockChanged) g.SECT.notifyStockChanged(W, id);
      if (CPE && reward > 0) {
        CPE.mint(W, npc, reward, "บริจาคโอสถส่วนตัว", true);
        CPE.S(W).donated += reward;
      } else if (spawnedUsed > 0 && CPE && CPE.S) {
        CPE.S(W).arbitrageBlocked = (CPE.S(W).arbitrageBlocked || 0) + 1;
      }
      W.log("economy", (npc.h && npc.h.name && npc.h.name.given || "สมาชิก") + " บริจาค「" + ECO.name(id) + "」×" + count + " เข้าคลังสำนัก" + (reward > 0 ? " ได้รับ " + Math.round(reward) + " แต้มคุณูปการ" : " (ของเสกโดยผู้เล่น ไม่สร้างแต้มคุณูปการ)"), [npc.id]);
      return { ok: true, reward, qty: count, playerSpawned: spawnedUsed > 0 };
    }
    if (npc && npc.inv && npc.inv.mats && (npc.inv.mats[id] || 0) > 0) {
      qty = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1;
      const count = Math.min(qty, npc.inv.mats[id]);
      const spawnedHeld = (npc.inv.spawnedMats && npc.inv.spawnedMats[id]) || 0;
      const spawnedUsed = Math.min(count, spawnedHeld);
      const rewardableCount = Math.max(0, count - spawnedUsed);
      const CPE = g.CPE;
      const reward = rewardableCount > 0 ? (CPE ? CPE.reward(W, id, rewardableCount) : 5 * rewardableCount) : 0;
      npc.inv.mats[id] -= count;
      if (npc.inv.mats[id] <= 0) delete npc.inv.mats[id];
      if (spawnedUsed > 0 && npc.inv.spawnedMats) {
        npc.inv.spawnedMats[id] -= spawnedUsed;
        if (npc.inv.spawnedMats[id] <= 0) delete npc.inv.spawnedMats[id];
      }
      ECO.add(W, id, count);
      if (g.SECT && g.SECT.notifyStockChanged) g.SECT.notifyStockChanged(W, id);
      if (CPE && reward > 0) {
        CPE.mint(W, npc, reward, 'บริจาควัตถุดิบเข้าคลังสำนัก', true);
        CPE.S(W).donated += reward;
      } else if (spawnedUsed > 0 && CPE && CPE.S) {
        CPE.S(W).arbitrageBlocked = (CPE.S(W).arbitrageBlocked || 0) + 1;
      }
      W.log('economy', (npc.h && npc.h.name && npc.h.name.given || 'สมาชิก') + ' บริจาค「' + ECO.name(id) + '」×' + count + ' เข้าคลังสำนัก' + (reward > 0 ? ' ได้รับ ' + Math.round(reward) + ' แต้มคุณูปการ' : ' (ของเสกโดยผู้เล่น ไม่สร้างแต้มคุณูปการ)'), [npc.id]);
      return { ok: true, reward, qty: count };
    }
    const products = npc.inv && npc.inv.craftedPills, index = products && products.findIndex(p => p.id === id);
    if (index == null || index < 0) return { ok: false };
    const p = products[index], CPE = g.CPE;
    if (!CPE || !ECO.pillInfo(p.key) || !Number.isFinite(p.qty) || p.qty <= 0 || !Number.isFinite(p.q)) return { ok: false };
    if (p.playerSpawned) {
      if (!ECO.add(W, p.key, p.qty, p.q)) return { ok: false };
      if (g.SECT && g.SECT.notifyStockChanged) g.SECT.notifyStockChanged(W, p.key);
      products.splice(index, 1);
      if (CPE.S) CPE.S(W).arbitrageBlocked = (CPE.S(W).arbitrageBlocked || 0) + 1;
      W.log('economy', npc.h.name.given + ' นำ「' + ECO.name(p.key) + '」×' + p.qty + ' เข้าคลังสำนัก (ของเสกโดยผู้เล่น ไม่สร้างแต้มคุณูปการ)', [npc.id]);
      return { ok: true, reward: 0 };
    }
    const purchasedCost = Number.isFinite(p.purchasedCost) ? p.purchasedCost : (Number.isFinite(p.storeBoughtCost) ? p.storeBoughtCost : 0);
    const ownValue = Number.isFinite(p.ownValue) ? p.ownValue : 0;
    const maxReward = ownValue > 0
      ? purchasedCost * 0.9 + ownValue * 1.15 * p.q
      : purchasedCost * 0.88;
    const baseReward = CPE.reward(W, p.key, p.qty) * p.q;
    if ((purchasedCost > 0 || baseReward > maxReward) && CPE.S) {
      const c = CPE.S(W); c.arbitrageBlocked = (c.arbitrageBlocked || 0) + 1;
    }
    const reward = Math.floor(Math.max(0, Math.min(baseReward, maxReward)) * 10) / 10;
    if (!ECO.add(W, p.key, p.qty, p.q)) return { ok: false };
    if (g.SECT && g.SECT.notifyStockChanged) g.SECT.notifyStockChanged(W, p.key);
    products.splice(index, 1); if (reward) CPE.mint(W, npc, reward, 'บริจาคโอสถส่วนตัว', true);
    CPE.S(W).donated += reward;
    W.log('economy', npc.h.name.given + ' บริจาค「' + ECO.name(p.key) + '」เข้าคลังสำนัก ได้รับ ' + Math.round(reward) + ' แต้มคุณูปการ', [npc.id]);
    return { ok: true, reward };
  };

  /** ผลของโอสถ (อ่านจากข้อมูลเกมเก่า) */
  const _pillInfoCache = new Map();
  ECO.pillInfo = key => {
    if (typeof key !== 'string') return null;
    if (_pillInfoCache.has(key)) return _pillInfoCache.get(key);
    if (key.startsWith('P:')) {
      const raw = key.slice(2);
      const r = recipeById[raw] || recipeByOutItemId[raw];
      if (r) {
        if (r.outType !== 'PILL') {
          _pillInfoCache.set(key, null);
          return null;
        }
        if (r.outItemId && itemById[r.outItemId]) {
          const itemInfo = ECO.pillInfo(r.outItemId);
          if (itemInfo) {
            const res = { tier: r.tier || itemInfo.tier, effect: Object.assign({}, itemInfo.effect, r.effect || {}), name: r.outNameTh || itemInfo.name || r.nameTh };
            _pillInfoCache.set(key, res);
            return res;
          }
        }
        const res = { tier: r.tier, effect: r.effect || {}, name: r.outNameTh || r.nameTh };
        _pillInfoCache.set(key, res);
        return res;
      }
      const itRaw = ECO.getItem ? ECO.getItem(raw) : itemById[raw];
      if (itRaw && (itRaw.out === 'PILL' || itRaw.cat === 'PILL' || itRaw.kind === 'PILL' || Array.isArray(itRaw.phases))) {
        const res = ECO.pillInfo(raw);
        _pillInfoCache.set(key, res);
        return res;
      }
      _pillInfoCache.set(key, null);
      return null;
    }
    const it = ECO.getItem ? ECO.getItem(key) : itemById[key];
    if (it && (it.out === 'PILL' || it.cat === 'PILL' || it.kind === 'PILL' || Array.isArray(it.phases))) {
      const e = Object.assign({}, it.effect || {});
      if (it.healPct && !e.healHealth) e.healHealth = Math.round(it.healPct * 100);
      if (it.qiPct && !e.qiRestore) e.qiRestore = Math.round(it.qiPct * 100);
      if (it.cultExp && !e.cultivationProgress) e.cultivationProgress = it.cultExp;
      if (it.grantBuff && !e.grantBuff) { e.grantBuff = it.grantBuff; e.buffDur = it.buffDur || 60; }
      (it.effects || []).forEach(x => {
        const p = x.params || {};
        if (x.effectId === 'EFX_CULTIVATION_ACCELERATOR') { e.cultivationProgress = (e.cultivationProgress || 0) + 18 * it.tier; e.rateBoost = Math.max(e.rateBoost || 0, p.cultivationBoostRatio || 0.25); }
        else if (x.effectId === 'EFX_MASS_VITAL_HEAL') { e.healHealth = (e.healHealth || 0) + (p.healAmount || 30); if (p.curesMeridianWound) e.healInjury = 40; }
        else if (x.effectId === 'EFX_CALM_MIND') e.clearHeartDemon = (e.clearHeartDemon || 0) + (p.heartDemonReduction || 20);
        else if (x.effectId === 'EFX_LEARNING_INSIGHT') e.insight = Math.max(e.insight || 0, p.masteryGainMultiplier || 1.3);
        else if (x.effectId === 'EFX_MERIDIAN_TOXIN_PURGE') e.clearToxic = (e.clearToxic || 0) + (p.purgePotency || 30);
        else if (x.effectId === 'EFX_PURIFY_HOSTILE_STATUS') { e.clearHeartDemon = (e.clearHeartDemon || 0) + 12; e.clearPoison = 25; }
        else if (x.effectId === 'EFX_CONTROL_RESILIENCE') { e.grantBuff = e.grantBuff || 'clarityLotus'; e.buffDur = 75; }
        else if (x.effectId === 'EFX_SCENT_TRACE_BREAK') { e.grantBuff = e.grantBuff || 'shadowVeil'; e.buffDur = 60; }
        else if (x.effectId === 'EFX_BEAST_BOND_CHANNEL') { e.grantBuff = e.grantBuff || 'beastPackFury'; e.buffDur = 75; e.restoreBeastFatigue = p.restoresBeastFatigue || 35; }
        else if (x.effectId === 'EFX_BLOOD_SACRIFICE_OVERDRIVE') { e.cultivationProgress = (e.cultivationProgress || 0) + 28 * it.tier; e.grantBuff = 'bloodFrenzy'; e.buffDur = 60; e.toxicity = (e.toxicity || 0) + 8; }
        else if (x.effectId === 'EFX_V234_MULTI_PHASE_ELIXIR') {
          e.cultivationProgress = (e.cultivationProgress || 0) + (p.phase1Cultivation || 16 * it.tier);
          e.healHealth = (e.healHealth || 0) + (p.phase1Heal || 20);
          e.grantBuff = p.phase1Buff || 'qiConduit';
          e.buffDur = p.phase1Dur || 60;
          e.phases = p.phases || [
            { phase: 1, grantBuff: p.phase1Buff || 'qiConduit', cultGain: p.phase1Cultivation || 16 * it.tier },
            { phase: 2, delayDays: 1, grantBuff: p.phase2Buff || 'alchemicalHarmony', cultGain: p.phase2Cultivation || 12 * it.tier, clearToxic: p.phase2ClearToxic || 10, breakthroughBonus: p.phase2BtBonus || 0.06 }
          ];
        } else if (x.effectId === 'EFX_V234_TOXIN_TRANSCENDENCE') {
          e.grantBuff = 'toxinOverdrive'; e.buffDur = 65; e.cultivationProgress = (e.cultivationProgress || 0) + 20 * it.tier;
        } else if (x.effectId === 'EFX_V234_MERIDIAN_SURGE') {
          e.grantBuff = 'meridianUnblock'; e.buffDur = 80; e.breakthroughBonus = Math.max(e.breakthroughBonus || 0, p.btBonus || 0.12);
        }
      });
      if (it.phases && !e.phases) e.phases = it.phases;
      const res = { tier: it.tier, effect: e, name: it.nameTh, item: it };
      _pillInfoCache.set(key, res);
      return res;
    }
    const r = recipeById[key] || recipeByOutItemId[key];
    if (r && r.outType === 'PILL') {
      const res = { tier: r.tier, effect: r.effect || {}, name: r.outNameTh || r.nameTh };
      _pillInfoCache.set(key, res);
      return res;
    }
    _pillInfoCache.set(key, null);
    return null;
  };
  ECO.applyPill = (W, npc, key) => {
    const info = ECO.pillInfo(key); if (!info) return null;
    if (npc && npc.daoOath && npc.daoOath.upheld && (npc.daoOath.id === 'VOW_ABSTAIN_PILLS' || npc.daoOath.id === 'VEGETARIAN_PACIFIST') && g.CULT && g.CULT.breakOathVow) {
      g.CULT.breakOathVow(W, npc, 'กลืนกินโอสถละเมิดสัตย์สาบานงดพึ่งพาโอสถ');
    }
    const e = info.effect, c = npc.cult, s = npc.h.state; const msgs = [];
    if (e.cultivationProgress && c) { CULT.gain(npc, e.cultivationProgress); msgs.push('ปราณ +' + e.cultivationProgress); }
    if (e.rateBoost && c) { c.pillT = 360; c.pillBoost = e.rateBoost; }
    if (e.healHealth) { s.hp = Math.min(CULT.hpMax(npc), s.hp + CULT.hpMax(npc) * e.healHealth / 100 * 1.2); msgs.push('ฟื้นพลัง'); }
    if (e.healInjury && npc.inj && npc.inj.length) { npc.inj.forEach(i => { i.until -= e.healInjury * 360; }); msgs.push('สมานบาดแผล'); }
    if (e.breakthroughBonus && c) { c.btBonus = Math.max(c.btBonus || 0, e.breakthroughBonus); msgs.push('เตรียมทะลวง'); }
    if (e.toxicity && c) c.toxic = Math.min(100, c.toxic + e.toxicity);
    if (e.clearHeartDemon) s.heartDemon = Math.max(0, s.heartDemon - e.clearHeartDemon);
    if (e.clearToxic && c) c.toxic = Math.max(0, c.toxic - e.clearToxic);
    if (e.clearPoison && npc.sx && npc.sx.length) {
      const ST = g.STATS || (typeof require === 'function' ? require('./stats.js') : null);
      if (ST && ST.clearStatus) ST.clearStatus(npc, x => x.k === 'poison');
      else npc.sx = npc.sx.filter(x => x.k !== 'poison');
      msgs.push('ถอนพิษ');
    }
    if (e.lifeBonus && c) { c.lifeBonus += e.lifeBonus; CULT.refreshLifespan(npc); }
    if (e.lifespanBonus && c) { c.lifeBonus += e.lifespanBonus; CULT.refreshLifespan(npc); msgs.push('อายุขัย +' + e.lifespanBonus); }
    if (e.insight) npc.insightT = 360;
    if (e.grantBuff && g.STATS && g.STATS.applyNamedBuff) {
      g.STATS.applyNamedBuff(npc, e.grantBuff, e.buffDur || 60, g.STATS.now || 0, { casterId: npc.id });
      msgs.push('บัฟ「' + e.grantBuff + '」');
    }
    if (e.restoreBeastFatigue && Array.isArray(npc.pets)) {
      npc.pets.forEach(pt => { if (pt) pt.fatigue = Math.max(0, (pt.fatigue || 0) - e.restoreBeastFatigue); });
      msgs.push('ฟื้นกำลังอสูร');
    }
    if (Array.isArray(e.phases) && e.phases.length > 1) {
      npc.ext = npc.ext || {};
      npc.ext.pendingPillPhases = Array.isArray(npc.ext.pendingPillPhases) ? npc.ext.pendingPillPhases : [];
      const p2 = e.phases[1];
      npc.ext.pendingPillPhases.push({
        pillKey: key,
        pillNameTh: info.name,
        triggerDay: ((W && W.day) || 0) + (p2.delayDays || 1),
        grantBuff: p2.grantBuff || 'alchemicalHarmony',
        cultGain: p2.cultGain || 15,
        clearToxic: p2.clearToxic || 8,
        breakthroughBonus: p2.breakthroughBonus || 0.05
      });
      msgs.push('รอฤทธิ์ระยะที่ 2');
    }
    HC.bump(npc);
    return { info, msgs };
  };
  ECO.pillQuality = (W, key) => clamp((W.sect.pillQuality && W.sect.pillQuality[key]) || 1, 0.7, 1.5);
  ECO.addPersonalPill = (npc, key, quality, qty) => {
    const addN = Number.isInteger(qty) && qty > 0 ? qty : 1;
    const bag = npc.inv.pills || (npc.inv.pills = {}), map = npc.inv.pillQuality || (npc.inv.pillQuality = {}), count = bag[key] || 0;
    const q = clamp(Number.isFinite(quality) ? quality : 1, 0.7, 1.5);
    map[key] = ((map[key] || 1) * count + q * addN) / (count + addN);
    bag[key] = count + addN;
  };
  ECO.applyQualityPill = (W, npc, key, quality) => {
    const s = npc.h.state, before = { hp:s.hp, qi:s.qi, energy:s.energy, rest:s.rest, heartDemon:s.heartDemon }, result = ECO.applyPill(W, npc, key);
    if (!result) return result;
    const q = clamp(Number.isFinite(quality) ? quality : 1, 0.7, 1.5);
    for (const k of Object.keys(before)) if (Number.isFinite(before[k]) && Number.isFinite(s[k])) s[k] = before[k] + (s[k] - before[k]) * q;
    s.hp = clamp(s.hp, 0, CULT.hpMax(npc)); if (npc.cult && Number.isFinite(s.qi)) s.qi = clamp(s.qi, 0, CULT.qiMax(npc));
    for (const k of ['energy','rest','heartDemon']) if (Number.isFinite(s[k])) s[k] = clamp(s[k], 0, 100);
    return result;
  };
  ECO.usePill = (W, npc, key) => {
    const quality = ECO.pillQuality(W, key); if (!ECO.pillInfo(key) || !ECO.take(W, key, 1)) return null;
    if (npc && npc.voluntaryVows && npc.voluntaryVows.VOW_NO_MEDICINE && g.CULT && g.CULT.VOLUNTARY_VOWS && g.CULT.VOLUNTARY_VOWS.violateVow) {
      g.CULT.VOLUNTARY_VOWS.violateVow(W, npc, 'VOW_NO_MEDICINE', 'ใช้โอสถ ' + key + ' ระหว่างถือสัตย์งดพึ่งโอสถ');
    }
    return ECO.applyQualityPill(W, npc, key, quality);
  };

  /* ---------- แหล่งผลิตในสำนัก ---------- */
  const HERBS = { 1: ['MAT_HERB_DEW_GRASS_1', 'MAT_HERB_CINDER_LEAF_1', 'MAT_ZITHER_PARASOL_WOOD_1', 'MAT_WHIP_IRON_SILKWORM_THREAD_1', 'MAT_V230_002'], 2: ['MAT_HERB_JADE_LOTUS_2', 'MAT_HERB_MIST_ORCHID_2', 'MAT_V230_006'], 3: ['MAT_HERB_BLOOD_GINSENG_3', 'MAT_HERB_VENOM_VINE_3', 'MAT_HERB_ANCIENT_MIST_FERN_3', 'MAT_HERB_MERIDIAN_FLOWER_3', 'MAT_ZITHER_ICE_SILK_STRING_3', 'MAT_WHIP_SHADOW_PYTHON_TENDON_3', 'MAT_V230_010', 'MAT_V230_014'] };
  const ORES = { 1: ['MAT_ORE_BLACK_IRON_1', 'MAT_ORE_CINNABAR_1', 'MAT_BRUSH_SPIRIT_WEASEL_HAIR_1', 'MAT_V230_001', 'MAT_V230_004'], 2: ['MAT_ORE_COLD_STEEL_2', 'MAT_ORE_JADE_SLATE_2', 'MAT_V230_005', 'MAT_V230_008'], 3: ['MAT_ORE_STAR_COPPER_3', 'MAT_ORE_MAGNET_LODESTONE_3', 'MAT_ORE_THUNDER_SCORCH_COPPER_3', 'MAT_BRUSH_STARLIGHT_CINNABAR_3', 'MAT_V230_009', 'MAT_V230_012', 'MAT_V230_013'] };
  ECO.harvestHerb = (W, npc, hours) => {
    hours *= g.MARTIAL ? g.MARTIAL.lifeMult(npc, 'herbalism') : 1;
    const b = W.map.byId.herb_garden, sk = npc.h.skills.herbalism || 0;
    const out = [];
    const n = Math.max(0, Math.round(hours * (0.9 + sk / 60) * (0.7 + b.level * 0.3) * (0.8 + W.rng.next() * 0.4) * (W.season === 3 ? 0.55 : W.season === 0 ? 1.2 : 1)));
    for (let i = 0; i < n; i++) {
      let tier = 1; const r = W.rng.next();
      if (b.level >= 2 && r < 0.28 + sk / 400) tier = 2;
      if (b.level >= 3 && r < 0.07 + sk / 800) tier = 3;
      const id = W.rng.pick(HERBS[tier]); ECO.add(W, id, 1); out.push(id);
    }
    return out;
  };
  ECO.harvestGrain = (W, npc, hours) => {
    hours *= g.MARTIAL ? g.MARTIAL.lifeMult(npc, 'herbalism') : 1;
    const b = W.map.byId.farm;
    const n = Math.round(hours * (1.1 + (npc.h.skills.herbalism || 0) / 70 + HC.eff(npc, 'physiology.strength') / 250) * (0.8 + b.level * 0.25) * (W.season === 3 ? 0.4 : W.season === 1 ? 1.2 : 1) * (0.85 + W.rng.next() * 0.3));
    ECO.add(W, 'grain', n); return n;
  };
  ECO.mineYield = (W, npc, hours) => {
    hours *= g.MARTIAL ? g.MARTIAL.lifeMult(npc, 'mining') : 1;
    const b = W.map.byId.mine, sk = npc.h.skills.mining || 0, out = [];
    const n = Math.max(0, Math.round(hours * (0.55 + sk / 120) * (0.7 + b.level * 0.3) * (0.7 + W.rng.next() * 0.6)));
    for (let i = 0; i < n; i++) {
      let tier = 1; const r = W.rng.next();
      if (r < 0.25 + sk / 500) tier = 2; if (b.level >= 2 && r < 0.06 + sk / 900) tier = 3;
      const id = W.rng.pick(ORES[tier]); ECO.add(W, id, 1); out.push(id);
    }
    const st = Math.round(hours * W.rng.float(0.2, 1.2) * (0.6 + b.level * 0.4));
    if (st > 0) ECO.earn(W, st, 'แร่หินวิญญาณจากเหมือง');
    return { out, stones: st };
  };
  ECO.cookMeals = (W, hours, skill) => {
    const grain = Math.min(ECO.count(W, 'grain'), Math.ceil(hours * (1.5 + skill / 60)));
    if (grain <= 0) return 0;
    ECO.take(W, 'grain', grain); const meals = Math.round(grain * ECO.MEAL_PER_GRAIN * (0.95 + skill / 400)); ECO.add(W, 'meal', meals); return meals;
  };

  const COOK_RECIPE = { id: 'COOK_MEAL_BATCH', craft: 'cooking', tier: 1, inputs: [{ matId: 'grain', count: 1 }] };
  ECO.reserveCooking = (W, npc, ctx) => {
    if (!ctx || !npc) return false;
    if (ctx.craftReceipt) return !!matchingReceipt(W, npc, COOK_RECIPE, ctx);
    const skill = clamp(npc.h.skills.cooking || 0, 0, 100);
    // Preserve five former half-hour yields, now as one paid completed batch.
    const per = Math.ceil(0.5 * (1.5 + skill / 60));
    const grain = Math.min(ECO.count(W, 'grain'), per * 5);
    if (grain < 1) return false;
    const ledger = craftTransactions(W);
    if (!Number.isSafeInteger(ledger.seq) || ledger.seq < 0 || ledger.seq >= Number.MAX_SAFE_INTEGER) return false;
    ECO.take(W, 'grain', grain);
    ctx.cookingSkill = skill;
    ctx.cookingProfession = npc.cult && npc.cult.sub;
    return registerCraft(W, npc, COOK_RECIPE, ctx, [{ matId: 'grain', count: grain }]);
  };
  function mealSpecialties(W) {
    const batches = W.sect.mealSpecialties;
    if (!Array.isArray(batches)) return [];
    let remaining = ECO.count(W, 'meal');
    W.sect.mealSpecialties = batches.filter(b => b && ['RECOVERY_FOOD', 'CULTIVATION_FOOD'].includes(b.role) && Number.isFinite(b.servings) && b.servings > 0 && Number.isFinite(b.potency) && b.potency >= 0 && b.potency <= 1 && Number.isFinite(b.until) && b.until > W.t && b.until <= W.t + 1440).slice(-24).filter(b => {
      b.servings = Math.min(b.servings, remaining); remaining -= b.servings; return b.servings > 0;
    });
    return W.sect.mealSpecialties;
  }
  function consumeMealSpecialties(W, count) {
    const batches = mealSpecialties(W);
    for (const batch of batches) { const used = Math.min(count, batch.servings); batch.servings -= used; count -= used; if (count <= 0) break; }
    if (W.sect.mealSpecialties) W.sect.mealSpecialties = batches.filter(b => b.servings > 0);
  }
  ECO.finishCooking = (W, npc, ctx) => {
    const paid = settleCraft(W, npc, COOK_RECIPE, ctx);
    if (!paid) return { ok: false, rejected: true };
    const skill = clamp(ctx.cookingSkill || 0, 0, 100), per = Math.ceil(0.5 * (1.5 + skill / 60));
    const grain = paid.inputs[0].count;
    const full = Math.floor(grain / per), partial = grain % per;
    const meals = full * Math.round(per * ECO.MEAL_PER_GRAIN * (0.95 + skill / 400)) + Math.round(partial * ECO.MEAL_PER_GRAIN * (0.95 + skill / 400));
    const batches = mealSpecialties(W);
    ECO.add(W, 'meal', meals);
    const spec = ECO.profession(npc);
    if (spec && ctx.cookingProfession === npc.cult.sub && ['RECOVERY_FOOD', 'CULTIVATION_FOOD'].includes(spec.role)) {
      batches.push({ role: spec.role, servings: meals, potency: skill / 100, until: W.t + 1440 });
      W.sect.mealSpecialties = batches.slice(-24);
    }
    const cultivationGained = ECO.grantCraftCultivation(W, npc, COOK_RECIPE, { q: 1 });
    return { ok: true, meals, cultivationGained };
  };
  ECO.reserveMeal = (W, ctx) => {
    if (!ctx || ctx.mealConsumed) return false;
    const batches = mealSpecialties(W), batch = batches[0];
    const specialty = batch && { role: batch.role, potency: batch.potency, until: batch.until };
    if (!ECO.take(W, 'meal', 1)) return false;
    ctx.mealConsumed = true; ctx.mealSpecialty = specialty || null;
    return true;
  };
  ECO.finishMeal = (W, npc, ctx) => {
    if (!ctx || !ctx.mealConsumed || ctx.mealFinished) return false;
    ctx.mealFinished = true;
    const meal = ctx.mealSpecialty;
    if (!meal || meal.until <= W.t || (npc.specialMealCooldownUntil || 0) > W.t || !g.STATS) return false;
    const potency = clamp(meal.potency, 0, 1), state = npc.h.state;
    let buff;
    if (meal.role === 'RECOVERY_FOOD') {
      state.hp = Math.min(CULT.hpMax(npc), state.hp + CULT.hpMax(npc) * (0.015 + potency * 0.02));
      state.rest = Math.min(100, state.rest + 3 + potency * 3);
      buff = { nameTh: 'สำรับทิพย์ฟื้นกาย', p: { def: 0.02 + potency * 0.03 } };
    } else if (meal.role === 'CULTIVATION_FOOD') {
      state.qi = Math.min(CULT.qiMax(npc), state.qi + CULT.qiMax(npc) * (0.02 + potency * 0.03));
      buff = { nameTh: 'สำรับหยกเตรียมปราณ', p: { mdef: 0.02 + potency * 0.03 }, cultRateBonus: 0.03 + potency * 0.03 };
    } else return false;
    g.STATS.addBuff(npc, Object.assign({ id: 'professionMeal', kind: 'food', icon: '🍲', dur: 180 }, buff), W.t);
    npc.specialMealCooldownUntil = W.t + 360;
    return true;
  };

  /* ---------- คำสั่งผลิตของหัวหน้าหอ ---------- */
  ECO.needSummary = W => {
    let cultiv = 0, btSoon = 0, injured = 0, noWeapon = 0, noArmor = 0, noAccessory = 0, pop = 0;
    W.npcs.forEach(n => {
      if (n.dead || n.away) return; pop++;
      if (n.cult) { cultiv++; if (n.cult.prog >= CULT.threshold(n) * 0.8) btSoon++; }
      if (n.inj && n.inj.length) injured++;
      if (!n.equip || !n.equip.WEAPON) noWeapon++; if (!n.equip || !n.equip.ARMOR) noArmor++; if (!n.equip || !n.equip.ACCESSORY) noAccessory++;
    });
    const gear = W.sect.gear;
    return { btNeed: W.sect.btDemand || {}, pop, cultiv, btSoon, injured, noWeapon, noArmor, noAccessory, gearWeapon: gear.filter(x => x.slot === 'WEAPON').length, gearArmor: gear.filter(x => x.slot === 'ARMOR').length, gearAccessory: gear.filter(x => x.slot === 'ACCESSORY').length };
  };
  ECO.pickOrder = (W, hall, head) => {
    const crafts = hall === 'alchemy' ? ['ALCHEMY'] : ['FORGING', 'ARRAY', 'TALISMAN'];
    const need = ECO.needSummary(W);
    const pol = W.sect.policy;
    const best = [];
    const gearCounts = {};
    for (let i = 0; i < W.sect.gear.length; i++) { const gid = W.sect.gear[i].id; if (gid) gearCounts[gid] = (gearCounts[gid] || 0) + 1; }
    const headInterestBonus = head ? (HC.eff(head, 'interests.' + (hall === 'alchemy' ? 'alchemy' : 'forging')) - 50) / 400 : 0;
    ECO.recipesFor(W, crafts).forEach(r => {
      const skillOk = head ? ((head.h.skills[r.craft] || 0) + 25 >= r.minMastery || W.npcs.some(n => !n.dead && !n.away && (n.h.skills[r.craft] || 0) + 20 >= r.minMastery && ECO.craftEligible(W, n, r, hall))) : true;
      if (!skillOk) return;
      let s = 0, why = '';
      const inOk = ECO.inputsOk(W, r);
      const have = ECO.count(W, r.outItemId || 'P:' + r.id);
      if (r.outType === 'PILL') {
        const e = ECO.pillInfo(r.outItemId || 'P:' + r.id).effect;
        if (e.cultivationProgress) { s += 0.5 + 0.1 * Math.min(need.cultiv, 8) - have * 0.05; why = 'ช่วยการบำเพ็ญ'; }
        if (e.btFor) { const d = (need.btNeed || {})[e.btFor.path + ':' + e.btFor.stage] || 0; s += d * 1.6 - have * 1.0 - (d ? 0 : 1.4); why = 'ผู้ติดคอขวดต้องการ'; }
        else if (e.breakthroughBonus) { s += need.btSoon * 0.5 - have * 0.4; why = 'ผู้ใกล้ทะลวงต้องการ'; }
        if (e.cbBuff) { s += 0.18 + Math.min(0.4, need.cultiv * 0.03) + (W.sect.recentRaid ? 0.5 : 0) - have * 0.12; why = 'สำรองไว้ก่อนศึก'; if (e.cbBuff.id === 'BERSERK') s -= 0.4; }
        if (e.healHealth || e.healInjury) { s += need.injured * 0.35 + 0.1 - have * 0.1; why = 'สำรองยารักษา'; }
        if (e.clearToxic) { s += 0.24 - have * 0.08; if (!why) why = 'สำรองยาถอนพิษ'; }
        if (e.qiRestore) { s += 0.18 - have * 0.06; if (!why) why = 'สำรองยาฟื้นปราณ'; }
        if (e.clearHeartDemon) { s += 0.12 - have * 0.1; }
        if (r.discoverable && have < 2 && inOk) s += 0.55;
        if (have > 12) s -= 1;
      } else if (r.outType === 'EQUIPMENT') {
        const gcount = gearCounts[r.outItemId || r.id] || 0;
        const gapW = Math.max(0, need.noWeapon - need.gearWeapon), gapA = Math.max(0, need.noArmor - need.gearArmor), gapAcc = Math.max(0, (need.noAccessory || 0) - (need.gearAccessory || 0));
        const slot = r._slot || (r._slot = (r.outItemId && ECO.itemById[r.outItemId] && ECO.itemById[r.outItemId].slot) || (/กระบี่|ศาสตรา|ทวน|ดาบ|หอก|ค้อน|ง้าว/.test(r.outNameTh) || ((r.effect && r.effect.combatMult) || 0) > ((r.effect && r.effect.defenseMult) || 0) * 1.8 ? 'WEAPON' : ((r.effect && r.effect.defenseMult) || 0) > ((r.effect && r.effect.combatMult) || 0) * 1.8 ? 'ARMOR' : 'ACCESSORY'));
        s += (slot === 'WEAPON' ? gapW * 0.25 : slot === 'ARMOR' ? gapA * 0.25 : Math.min(1.3, 0.2 + gapAcc * 0.16)) - gcount * 0.15;
        if (r.discoverable && gcount < 2 && inOk) s += 0.6;
        why = 'อุปกรณ์ขาดแคลน';
      }
      s += Math.max(0, (ECO.outputValue(W, r) - ECO.inputCost(W, r))) / 220 * (0.4 + pol.focus.commerce) ;
      s -= r.tier > 3 ? (r.tier - 3) * 0.12 : 0;
      if (!inOk) { s -= 0.25; }
      if (head) s += headInterestBonus;
      if(head&&g.COG)s+=g.COG.orderBias(W,head,r);
      s += W.rng.next() * 0.12;
      best.push({ r, s, why, inOk });
    });
    best.sort((a, b) => b.s - a.s);
    const pickable = best.filter(x => x.inOk);
    const top = pickable[0] || null;
    const want = {};
    best.slice(0, 3).forEach(x => { x.r.inputs.forEach(i => { const lack = i.count * 2 - ECO.count(W, i.matId); if (lack > 0) want[i.matId] = Math.max(want[i.matId] || 0, lack); }); });
    return { recipe: top ? top.r : null, why: top ? top.why : '', want };
  };

  /* ---------- ความฉลาดและการจำแนกสถานะคลัง (Inventory Intelligence) ---------- */
  ECO.ensureStockTracker = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.stockTracker) {
      W.sect.stockTracker = {
        history: {},
        usage: {}
      };
    }
    const st = W.sect.stockTracker;
    if (!st.history) st.history = {};
    if (!st.usage) st.usage = {};
    if (typeof st.recordUsage !== 'function') {
      st.recordUsage = function(id, qty, day) {
        if (!id || !Number.isFinite(qty) || qty <= 0) return;
        const list = this.history[id] = this.history[id] || [];
        const curDay = Number.isFinite(day) ? day : 0;
        const existing = list.find(entry => entry.day === curDay);
        if (existing) existing.qty += qty;
        else list.push({ day: curDay, qty });
        if (list.length > 30) list.splice(0, list.length - 30);
        this.usage[id] = (this.usage[id] || 0) + qty;
      };
    }
    if (typeof st.getRollingUsage !== 'function') {
      st.getRollingUsage = function(id, days, currentDay) {
        const list = this.history[id];
        if (!list || !list.length) return 0;
        const dCount = Number.isFinite(days) && days > 0 ? days : 14;
        const cDay = Number.isFinite(currentDay) ? currentDay : 0;
        const minDay = cDay - dCount;
        let sum = 0;
        for (let i = 0; i < list.length; i++) {
          if (list[i].day >= minDay) sum += list[i].qty;
        }
        return sum / dCount;
      };
    }
    return st;
  };

  ECO.reserveFloor = (W, id) => {
    let pop = 1;
    if (W && W.npcs) {
      if (W._alivePopTick === W.t && W._alivePopLen === W.npcs.length && W._alivePopCount > 0) {
        pop = W._alivePopCount;
      } else {
        let c = 0;
        for (let i = 0; i < W.npcs.length; i++) { const x = W.npcs[i]; if (x && !x.dead && !x.exiled) c++; }
        pop = Math.max(1, c);
        W._alivePopTick = W.t;
        W._alivePopLen = W.npcs.length;
        W._alivePopCount = pop;
      }
    }
    const rd = W && W.sect && W.sect.reserveDirectives ? W.sect.reserveDirectives : {};
    if (id === 'grain') return pop * (rd.minGrainDays || 14);
    if (id === 'meal') return rd.minMealReserve || 20;
    if (rd.medicine && rd.medicine[id] != null) return rd.medicine[id];
    if (typeof id === 'string' && id.startsWith('P:BASIC_')) return Math.max(2, Math.ceil(pop * 0.1));
    const m = matById[id];
    if (m) {
      const baseTgt = m.tier <= 1 ? 16 : m.tier === 2 ? 9 : m.tier === 3 ? 5 : 3;
      return Math.max(2, Math.floor(baseTgt * 0.5));
    }
    return Math.max(2, Math.floor((g.CPE ? g.CPE.target(W, id) : 8) * 0.5));
  };

  ECO.inventoryIntelligence = (W, forceRefresh) => {
    if (!W || !W.sect) {
      return {
        evaluatedAt: 0,
        items: {},
        shortages: [],
        shortage: [],
        reserves: [],
        reserveRequired: [],
        balanced: [],
        surplus: []
      };
    }
    if (!forceRefresh && !W.sect._stockDirty && W.sect.inventoryIntelligence && W.sect.inventoryIntelligence.evaluatedAt === W.day) {
      return W.sect.inventoryIntelligence;
    }
    W.sect._stockDirty = false;
    ECO.ensureStockTracker(W);
    const tracker = W.sect.stockTracker;
    const pop = Math.max(1, W.npcs.filter(n => !n.dead && !n.exiled).length);
    const trackedKeys = new Set(Object.keys(W.sect.stock || {}));
    ['grain', 'meal', 'P:BASIC_HP', 'P:BASIC_WOUND', 'P:BASIC_DETOX', 'P:BASIC_CALM'].forEach(k => trackedKeys.add(k));
    (W.sect.buyList || []).forEach(b => { if (b && b.id) trackedKeys.add(b.id); });
    (W.sect.shortageDirectives || []).forEach(sd => { if (sd && sd.id) trackedKeys.add(sd.id); });

    const items = {}, shortages = [], reserves = [], balanced = [], surplus = [];
    trackedKeys.forEach(id => {
      const cur = ECO.count(W, id);
      const resFloor = ECO.reserveFloor(W, id);
      const tgt = g.CPE ? g.CPE.target(W, id) : 8;
      const dailyUsage = tracker ? tracker.getRollingUsage(id, 14, W.day) : 0;
      const turnover = Math.round((dailyUsage * 30 / Math.max(1, cur)) * 100) / 100;

      let state = 'balanced', reason = '';
      if (cur < resFloor) {
        state = 'shortage';
        const deficit = resFloor - cur;
        reason = 'ต่ำกว่าเกณฑ์สำรองความปลอดภัย (' + cur + '/' + resFloor + ')';
        shortages.push({
          id,
          nameTh: ECO.name(id),
          current: cur,
          stock: cur,
          reserve: resFloor,
          floor: resFloor,
          target: tgt,
          deficit,
          turnover,
          reason
        });
      } else if (cur < tgt) {
        state = 'reserve-required';
        reason = 'อยู่ในขอบเขตสำรอง ห้ามจำหน่ายภายนอก (' + cur + '/' + tgt + ')';
        reserves.push({
          id,
          nameTh: ECO.name(id),
          current: cur,
          stock: cur,
          reserve: resFloor,
          floor: resFloor,
          target: tgt,
          turnover,
          reason
        });
      } else if (cur > Math.round(tgt * 1.6) + 2) {
        state = 'surplus';
        const excess = cur - Math.round(tgt * 1.5);
        reason = 'มีส่วนเกินพร้อมจำหน่ายภายนอก (ส่วนเกิน ~' + excess + ' หน่วย)';
        surplus.push({
          id,
          nameTh: ECO.name(id),
          current: cur,
          stock: cur,
          reserve: resFloor,
          floor: resFloor,
          target: tgt,
          excess,
          surplusQty: excess,
          turnover,
          reason
        });
      } else {
        state = 'balanced';
        reason = 'ปริมาณสมดุลตามเกณฑ์ปกติ';
        balanced.push({
          id,
          nameTh: ECO.name(id),
          current: cur,
          stock: cur,
          reserve: resFloor,
          floor: resFloor,
          target: tgt,
          turnover,
          reason
        });
      }
      items[id] = {
        id,
        nameTh: ECO.name(id),
        state,
        current: cur,
        stock: cur,
        reserve: resFloor,
        floor: resFloor,
        target: tgt,
        turnover,
        dailyUsage,
        reason
      };
    });

    const report = {
      evaluatedAt: W.day,
      items,
      shortages,
      shortage: shortages,
      reserves,
      reserveRequired: reserves,
      balanced,
      surplus,
      pop
    };
    W.sect.inventoryIntelligence = report;
    return report;
  };

  /* ---------- Sanctum Refinement Catalysts & Resonance Gear Upgrading (v2.0.6 Pillar B) ---------- */
  ECO.REFINEMENT_CATALYSTS = {
    CAT_RESONANCE_JADE_4: { id: 'CAT_RESONANCE_JADE_4', nameTh: 'หยกสัจธรรมประสานปราณ', tier: 4, minGearTier: 4, maxGearTier: 7, qualityBoost: 0.14, maxQuality: 1.65, value: 180, descTh: 'ผลึกหยกโบราณจากวิหารศักดิ์สิทธิ์ ใช้ขัดเกลาศาสตราชุดสัจธรรมระดับ T4–T6 ให้มีคุณภาพสูงขึ้น' },
    CAT_ASTRAL_ESSENCE_5: { id: 'CAT_ASTRAL_ESSENCE_5', nameTh: 'แก่นดาราบรรพกาล', tier: 5, minGearTier: 4, maxGearTier: 7, qualityBoost: 0.20, maxQuality: 1.75, value: 320, descTh: 'แก่นปราณดาราจากผู้พิทักษ์ชั้นลึก ใช้หลอมยกระดับคุณภาพศาสตรา T4–T6' },
    CAT_PRIMORDIAL_FLAME_6: { id: 'CAT_PRIMORDIAL_FLAME_6', nameTh: 'เพลิงต้นกำเนิดสวรรค์', tier: 6, minGearTier: 4, maxGearTier: 7, qualityBoost: 0.28, maxQuality: 1.85, value: 520, descTh: 'เพลิงศักดิ์สิทธิ์ขั้นสูงสุดจากแท่นบูชาโบราณ ใช้ขัดเกลาศาสตรา T4–T6 สู่ขีดสุด' },
    CAT_PRIMORDIAL_METAL: { id: 'CAT_PRIMORDIAL_METAL', nameTh: 'แก่นโลหะบรรพกาล', element: 'EARTH_METAL', resonantElements: ['EARTH_METAL', 'LIGHTNING'], tier: 4, minGearTier: 3, maxGearTier: 7, qualityBoost: 0.16, maxQuality: 1.70, value: 210, descTh: 'แก่นโลหะและอัสนีจากแดนเบญจธาตุ ใช้ขัดเกลาคุณภาพและจูนธาตุศาสตรา' },
    CAT_PRIMORDIAL_WOOD: { id: 'CAT_PRIMORDIAL_WOOD', nameTh: 'แก่นไม้กำเนิดชีพ', element: 'WOOD_LIFE', resonantElements: ['WOOD_LIFE', 'WIND'], tier: 4, minGearTier: 3, maxGearTier: 7, qualityBoost: 0.16, maxQuality: 1.70, value: 210, descTh: 'แก่นไม้และวายุจากแดนเบญจธาตุ ใช้ขัดเกลาคุณภาพและจูนธาตุศาสตรา' },
    CAT_PRIMORDIAL_WATER: { id: 'CAT_PRIMORDIAL_WATER', nameTh: 'แก่นวารีเยือกแข็ง', element: 'WATER_ICE', resonantElements: ['WATER_ICE', 'YIN_SHADOW'], tier: 4, minGearTier: 3, maxGearTier: 7, qualityBoost: 0.16, maxQuality: 1.70, value: 210, descTh: 'แก่นวารีและเงาหยินจากแดนเบญจธาตุ ใช้ขัดเกลาคุณภาพและจูนธาตุศาสตรา' },
    CAT_PRIMORDIAL_FIRE: { id: 'CAT_PRIMORDIAL_FIRE', nameTh: 'แก่นเพลิงชาดบรรพกาล', element: 'FIRE', resonantElements: ['FIRE', 'LIGHT_YANG'], tier: 4, minGearTier: 3, maxGearTier: 7, qualityBoost: 0.16, maxQuality: 1.70, value: 210, descTh: 'แก่นเพลิงและแสงหยางจากแดนเบญจธาตุ ใช้ขัดเกลาคุณภาพและจูนธาตุศาสตรา' },
    CAT_PRIMORDIAL_EARTH: { id: 'CAT_PRIMORDIAL_EARTH', nameTh: 'แก่นปฐพีหยกเร้น', element: 'EARTH_METAL', resonantElements: ['EARTH_METAL', 'ASTRAL', 'BLOOD_DEMON'], tier: 4, minGearTier: 3, maxGearTier: 7, qualityBoost: 0.16, maxQuality: 1.70, value: 210, descTh: 'แก่นปฐพีและดาราจากแดนเบญจธาตุ ใช้ขัดเกลาคุณภาพและจูนธาตุศาสตรา' }
  };

  ECO.ensureCatalysts = W => {
    if (!W || !W.sect) return {};
    if (!W.sect.catalysts || typeof W.sect.catalysts !== 'object') W.sect.catalysts = {};
    return W.sect.catalysts;
  };

  ECO.catalystCount = (W, catId) => {
    const cats = ECO.ensureCatalysts(W);
    return Math.max(0, Math.floor(cats[catId] || 0));
  };

  ECO.addCatalyst = (W, catId, qty) => {
    if (!W || !W.sect || !ECO.REFINEMENT_CATALYSTS[catId] || !Number.isFinite(qty) || qty <= 0) return 0;
    const cats = ECO.ensureCatalysts(W);
    cats[catId] = Math.floor((cats[catId] || 0) + qty);
    W.sect._hasCatalysts = true;
    return cats[catId];
  };

  ECO.refineGearWithCatalyst = (W, gearOrUid, catId, npc, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'no-world' };
    const cat = ECO.REFINEMENT_CATALYSTS[catId || 'CAT_RESONANCE_JADE_4'] || Object.values(ECO.REFINEMENT_CATALYSTS).find(c => ECO.catalystCount(W, c.id) > 0);
    if (!cat) return { ok: false, reason: 'invalid-catalyst' };
    if (!opts.free && ECO.catalystCount(W, cat.id) <= 0) return { ok: false, reason: 'insufficient-catalyst' };

    let gear = null;
    if (gearOrUid && typeof gearOrUid === 'object') {
      if (opts.allowDetached) {
        gear = gearOrUid;
      } else {
        const isOwnedBy = n => n && ((n.equip && (n.equip.WEAPON === gearOrUid || n.equip.ARMOR === gearOrUid || n.equip.ACCESSORY === gearOrUid)) || (n.inv && Array.isArray(n.inv.gear) && n.inv.gear.includes(gearOrUid)));
        const inSect = Array.isArray(W.sect.gear) && W.sect.gear.includes(gearOrUid);
        const inNpcs = isOwnedBy(npc) || (Array.isArray(W.npcs) && W.npcs.some(isOwnedBy));
        if (inSect || inNpcs) gear = gearOrUid;
      }
    } else if (typeof gearOrUid === 'string') {
      if (npc && npc.equip) {
        for (const k of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
          if (npc.equip[k] && (npc.equip[k].uid === gearOrUid || npc.equip[k].id === gearOrUid)) { gear = npc.equip[k]; break; }
        }
      }
      if (!gear && npc && npc.inv && Array.isArray(npc.inv.gear)) {
        gear = npc.inv.gear.find(g2 => g2 && (g2.uid === gearOrUid || g2.id === gearOrUid));
      }
      if (!gear && Array.isArray(W.sect.gear)) {
        gear = W.sect.gear.find(g2 => g2 && (g2.uid === gearOrUid || g2.id === gearOrUid));
      }
      if (!gear && Array.isArray(W.npcs)) {
        for (const n of W.npcs) {
          if (!n || n.dead) continue;
          if (n.equip) {
            for (const k of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
              if (n.equip[k] && (n.equip[k].uid === gearOrUid || n.equip[k].id === gearOrUid)) { gear = n.equip[k]; npc = npc || n; break; }
            }
          }
          if (gear) break;
          if (n.inv && Array.isArray(n.inv.gear)) {
            const hit = n.inv.gear.find(g2 => g2 && (g2.uid === gearOrUid || g2.id === gearOrUid));
            if (hit) { gear = hit; npc = npc || n; break; }
          }
        }
      }
    }
    if (!gear || !gear.slot) return { ok: false, reason: 'gear-not-found' };
    const gTier = gear.tier || 1;
    if (!opts.allowAnyTier && (gTier < cat.minGearTier || gTier > (cat.maxGearTier || 7))) {
      return { ok: false, reason: 'invalid-gear-tier', tier: gTier, requiredMin: cat.minGearTier };
    }
    const oldQ = Number.isFinite(gear.q) ? gear.q : 1.0;
    const capQ = Math.min(1.85, cat.maxQuality || 1.75);
    if (oldQ >= capQ - 1e-6) return { ok: false, reason: 'max-quality-reached', quality: oldQ };

    if (!opts.free) {
      W.sect.catalysts[cat.id] = Math.max(0, (W.sect.catalysts[cat.id] || 1) - 1);
      if (W.sect.catalysts[cat.id] <= 0) delete W.sect.catalysts[cat.id];
      W.sect._hasCatalysts = Object.values(W.sect.catalysts).some(v => v > 0);
    }
    const catElems = Array.isArray(cat.resonantElements) ? cat.resonantElements : (cat.element ? [cat.element] : []);
    const gEl = gear.element || (gear.elementProfile && gear.elementProfile.primary) || 'NEUTRAL';
    const gWeights = (gear.elementProfile && gear.elementProfile.weights) || {};
    const elementResonant = catElems.length > 0 && (catElems.includes(gEl) || catElems.some(e => gWeights[e] > 0));
    let attunedElement = gear.attunedElement || null;
    if (catElems.length > 0 && (gEl === 'NEUTRAL' || gear.elementalRole === 'EXPLICIT_NON_ELEMENTAL')) {
      const subDef = npc && npc.cult && g.CULT && g.CULT.sub ? g.CULT.sub(npc) : null;
      const subEl = subDef && subDef.element;
      attunedElement = (subEl && catElems.includes(subEl)) ? subEl : cat.element;
      gear.attunedElement = attunedElement;
    }
    const effectiveBoost = cat.qualityBoost + (elementResonant ? 0.04 : 0);
    const targetQ = Math.min(capQ, +(oldQ + effectiveBoost).toFixed(2));
    gear.q = targetQ;
    if (gear.quality !== undefined || gear.legendary) gear.quality = targetQ;
    const newQ = Number.isFinite(gear.q) ? gear.q : targetQ;
    const ratio = newQ / Math.max(0.5, oldQ);
    if (gear.legendary || gTier >= 6) {
      const prevStars = gear.attunedStars || 0;
      const nextStars = newQ >= 1.75 ? 3 : newQ >= 1.62 ? 2 : newQ >= 1.48 ? 1 : prevStars;
      if (nextStars > prevStars) gear.attunedStars = nextStars;
    }
    if (gear.combatMult) gear.combatMult = +(gear.combatMult * ratio).toFixed(4);
    if (gear.defMult) gear.defMult = +(gear.defMult * ratio).toFixed(4);
    gear.refinedCount = (gear.refinedCount || 0) + 1;
    if (elementResonant) gear.elementalResonanceCount = (gear.elementalResonanceCount || 0) + 1;
    gear.lastCatalystId = cat.id;
    if (!gear.st && g.STATS && g.STATS.gearStats) g.STATS.gearStats(gear);
    if (gear.st && typeof gear.st === 'object') {
      for (const sk of Object.keys(gear.st)) {
        if (!['crit', 'critDmg', 'pen', 'move', 'cast'].includes(sk)) {
          gear.st[sk] = Math.round(gear.st[sk] * ratio * 10) / 10;
        }
      }
    }
    if (npc) {
      if (ECO.grantCraftCultivation) ECO.grantCraftCultivation(W, npc, null, { tier: gTier, q: newQ, craft: 'FORGING', recipeId: cat.id });
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      HC.bump(npc);
    }
    if (!opts.quiet && W.log) {
      W.log('craft', '✨ ขัดเกลาศาสตรา「' + gear.nameTh + '」ด้วย「' + cat.nameTh + '」คุณภาพเพิ่มเป็น ' + oldQ.toFixed(2) + ' → ' + newQ.toFixed(2), npc ? [npc.id] : []);
    }
    return { ok: true, gear, catalystId: cat.id, oldQuality: oldQ, newQuality: newQ, elementResonant, attunedElement: gear.attunedElement || null };
  };

  ECO.findCatalystRefinementCandidate = (W, npc) => {
    if (!W || !W.sect || !npc || npc.dead || !npc.cult) return null;
    const cats = W.sect.catalysts;
    if (!cats || typeof cats !== 'object') return null;
    let hasAnyCat = false; for (const _ck in cats) { if (cats[_ck] > 0) { hasAnyCat = true; break; } }
    if (!hasAnyCat) { W.sect._hasCatalysts = false; return null; }
    const availCats = Object.values(ECO.REFINEMENT_CATALYSTS).filter(c => (cats[c.id] || 0) > 0);
    W.sect._hasCatalysts = availCats.length > 0;
    if (!availCats.length) return null;
    const isForgeOfficer = npc.post === 'forge' || npc.assist === 'forge';
    const isEligible = (npc.rank || 0) >= 2 || isForgeOfficer || npc.id === W.sect.masterId;
    if (!isEligible) return null;
    const subDef = npc.cult && g.CULT && g.CULT.sub ? g.CULT.sub(npc) : null;
    const prefEl = (npc.equip && npc.equip.WEAPON && npc.equip.WEAPON.element && npc.equip.WEAPON.element !== 'NEUTRAL')
      ? npc.equip.WEAPON.element
      : (subDef && subDef.element) || null;
    availCats.sort((a, b) => {
      const aMatch = prefEl && ((a.element === prefEl) || (Array.isArray(a.resonantElements) && a.resonantElements.includes(prefEl))) ? 1 : 0;
      const bMatch = prefEl && ((b.element === prefEl) || (Array.isArray(b.resonantElements) && b.resonantElements.includes(prefEl))) ? 1 : 0;
      if (bMatch !== aMatch) return bMatch - aMatch;
      return b.tier - a.tier;
    });
    const cat = availCats[0];
    // 1. Check NPC's own equipped T4-T6 gear first
    if (npc.equip) {
      for (const slot of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
        const eq = npc.equip[slot];
        if (!eq) continue;
        const gt = eq.tier || 1;
        const q = Number.isFinite(eq.q) ? eq.q : 1.0;
        if (gt >= cat.minGearTier && gt <= (cat.maxGearTier || 7) && q + 0.02 < cat.maxQuality) {
          return { gear: eq, gearUid: eq.uid || eq.id, catalystId: cat.id, cat, ownerNpcId: npc.id, source: 'equipped' };
        }
      }
    }
    // 1b. Check NPC's personal bag T4-T6 gear
    if (npc.inv && Array.isArray(npc.inv.gear)) {
      for (let i = 0; i < npc.inv.gear.length; i++) {
        const eq = npc.inv.gear[i];
        if (!eq || !eq.slot) continue;
        const gt = eq.tier || 1;
        const q = Number.isFinite(eq.q) ? eq.q : 1.0;
        if (gt >= cat.minGearTier && gt <= (cat.maxGearTier || 7) && q + 0.02 < cat.maxQuality) {
          return { gear: eq, gearUid: eq.uid || eq.id, catalystId: cat.id, cat, ownerNpcId: npc.id, source: 'personal_bag' };
        }
      }
    }
    // 2. If Forge officer, can also refine T4-T6 gear in sect armory
    if (isForgeOfficer && Array.isArray(W.sect.gear)) {
      for (let i = 0; i < W.sect.gear.length; i++) {
        const eq = W.sect.gear[i];
        if (!eq || !eq.slot) continue;
        const gt = eq.tier || 1;
        const q = Number.isFinite(eq.q) ? eq.q : 1.0;
        if (gt >= cat.minGearTier && gt <= (cat.maxGearTier || 7) && q + 0.02 < cat.maxQuality) {
          return { gear: eq, gearUid: eq.uid || eq.id, catalystId: cat.id, cat, ownerNpcId: null, source: 'sect_armory' };
        }
      }
    }
    return null;
  };


  /* ---------- Patch v2.0.13: Procedural Equipment Engine, Repair Stones & Durability Lifecycle ---------- */
  ECO.REPAIR_STONES = {
    ITEM_REPAIR_STONE_1: { id: 'ITEM_REPAIR_STONE_1', nameTh: 'หินลับศาสตราหยาบ', tier: 1, quality: 1, maxDurReduction: 25, minMaxDur: 20, value: 18 },
    ITEM_REPAIR_STONE_2: { id: 'ITEM_REPAIR_STONE_2', nameTh: 'หินซ่อมศาสตราเหล็กดำ', tier: 2, quality: 2, maxDurReduction: 20, minMaxDur: 20, value: 44 },
    ITEM_REPAIR_STONE_3: { id: 'ITEM_REPAIR_STONE_3', nameTh: 'หินหลอมซ่อมปราณหยก', tier: 3, quality: 3, maxDurReduction: 15, minMaxDur: 20, value: 98 },
    ITEM_REPAIR_STONE_4: { id: 'ITEM_REPAIR_STONE_4', nameTh: 'หินทิพย์ประสานศาสตรา', tier: 4, quality: 4, maxDurReduction: 10, minMaxDur: 20, value: 215 }
  };

  ECO.PROCEDURAL_POOLS = {
    baseForms: {
      SWORD: ['กระบี่เหล็กกล้า', 'กระบี่คมวายุ', 'กระบี่หยกขาว', 'กระบี่จันทร์เสี้ยว', 'กระบี่เจ็ดดาว'],
      BLADE: ['ดาบสันหนา', 'ดาบโค้งวงเดือน', 'ดาบผ่าขุนเขา', 'กริชคู่เร้นเงา', 'ดาบพยัคฆ์คำราม'],
      SPEAR: ['ทวนยาวศึก', 'หอกปลายเงิน', 'ทวนเกล็ดมังกร', 'ง้าวศึกทะลวงทัพ', 'หอกซัดอสนี'],
      FIST: ['สนับมือเหล็กดำ', 'กรงเล็บพยัคฆ์', 'ปลอกแขนวัชระ', 'สนับมือหยกม่วง', 'กรงเล็บเหยี่ยวศึก'],
      BOW: ['คันศรไม้ไผ่ม่วง', 'ธนูเขาสัตว์อสูร', 'คันศรเอ็นมังกร', 'ธนูศึกทะลวงเมฆ', 'คันศรจันทรา'],
      STAFF: ['พลองไม้แก่นเหล็ก', 'กระบองคิ้วขาว', 'พลองศิลาดำ', 'ค้อนศึกสะท้านผา', 'พลองพิทักษ์ด่าน'],
      FOCUS: ['พัดหยกสื่อปราณ', 'กระจกสำริดส่องปราณ', 'ลูกแก้วดารา', 'ป้ายหยกบัญชาปราณ', 'ตราประทับวิญญาณ'],
      ZITHER: ['พิณไม้อู๋ถงเจ็ดสาย', 'ขลุ่ยหยกเมฆา', 'พิณสายไหมเงิน', 'ระฆังสำริดสะกดจิต', 'สังข์ปราณวายุ'],
      BRUSH: ['พู่กันขนพังพอนชาด', 'พู่กันหยกจารึกยันต์', 'สิ่วสลักค่ายกล', 'พู่กันปราชญ์วาดเมฆา', 'พู่กันดาราลิขิต'],
      WHIP: ['แส้หนังอสูรถักเหล็ก', 'ด้ายไหมปราณเชิดหุ่น', 'แส้เถาวัลย์หนามพิษ', 'โซ่ตรวนล่ามเงา', 'ด้ายแดงสะบั้นจุด'],
      ROSARY: ['ลูกประคำไม้จันทน์หอม', 'ลูกประคำหยกขาวเมตตา', 'ลูกประคำสำริดวัชระ', 'ลูกประคำทองคำอรหันต์', 'ลูกประคำบัวแก้วโพธิญาณ'],
      CLAW: ['กรงเล็บเหล็กพยัคฆ์', 'กรงเล็บเขี้ยวหมาป่า', 'กรงเล็บแมงป่องพิษ', 'กรงเล็บมังกรคราม', 'กรงเล็บอสูรบรรพกาล'],
      NEEDLE: ['เข็มเงินสกัดจุด', 'เข็มพิษแมงมุมดำ', 'เข็มทองเปิดชีพจร', 'เข็มไหมวิญญาณ', 'เข็มสุญตาทะลวงมิติ'],
      FAN: ['พัดโครงเหล็กซ่อนคม', 'พัดขนนกกระเรียนขาว', 'พัดหยกเรียกสายลม', 'พัดปราชญ์จารึกอักษร', 'พัดเทวพายุเจ็ดดารา'],
      ASTROLABE: ['จานหลัวผานสำริด', 'จานคำนวณดาราแปดทิศ', 'จานหยกชีพจรมังกร', 'จานวงโคจรแรงโน้มถ่วง', 'จานดาราจักรฉีเหมิน'],
      ABACUS: ['ลูกคิดไม้ดำเก้าราง', 'ลูกคิดสำริดตราชั่ง', 'ลูกคิดเงินกองคาราวาน', 'ลูกคิดหยกเสนาบดี', 'ลูกคิดทองคำพันธสัญญา'],
      HEAVY: ['เกราะเกล็ดเหล็กดำ', 'เกราะศึกพิทักษ์ด่าน', 'เกราะแผ่นศิลา', 'เกราะอกพยัคฆ์', 'เกราะเหล็กหลอมปราณ'],
      LIGHT: ['เกราะหนังอสูร', 'เสื้อเกราะไหมเหนียว', 'ชุดรัดกุมเร้นเงา', 'เกราะเบาขนเหยี่ยว', 'ชุดหนังเกล็ดงู'],
      ROBE: ['อาภรณ์ไหมเมฆา', 'ชุดคลุมนักพรตหยก', 'จีวรปราณบริสุทธิ์', 'อาภรณ์ดาราพยากรณ์', 'ชุดคลุมไหมจันทร์'],
      RING: ['แหวนหยกผนึกปราณ', 'แหวนสำริดโบราณ', 'แหวนเงินสลักอักขระ', 'แหวนเหล็กไหล'],
      NECKLACE: ['สร้อยลูกประคำหยก', 'จี้ห้อยคอศิลาปราณ', 'สร้อยเขี้ยวอสูร', 'จี้หยกคุ้มชีพ'],
      BRACELET: ['กำไลหยกประสานชีพจร', 'กำไลเงินร้อยอักขระ', 'กำไลเหล็กเย็น', 'สายรัดข้อมือปราณ'],
      CHARM: ['ป้ายหยกพกเอว', 'ถุงหอมสมุนไพรปราณ', 'ตราพกสำนักโบราณ', 'แผ่นยันต์หยกคุ้มกาย']
    },
    gradesByTier: {
      1: { grade: 'Common', gradeTh: 'สามัญ', prefixes: ['สามัญ', 'ฝึกหัด', 'เหล็กดิบ', 'พื้นฐาน'] },
      2: { grade: 'Refined', gradeTh: 'หลอมปราณีต', prefixes: ['หลอมปราณีต', 'ขัดเงา', 'ซ้อนคม', 'ร้อยหลอม'] },
      3: { grade: 'Rare', gradeTh: 'ล้ำค่า', prefixes: ['ปราณควบแน่น', 'ล้ำค่า', 'จารึกอักขระ', 'วิญญาณแฝง'] },
      4: { grade: 'Exceptional', gradeTh: 'ยอดฝีมือ', prefixes: ['เอกอุ', 'ชั้นยอด', 'หลอมแก่นแท้', 'ปรมาจารย์'] }
    },
    elements: {
      NEUTRAL: { id: 'NEUTRAL', nameTh: 'ไร้ธาตุ', tagTh: 'ปราณบริสุทธิ์' },
      FIRE: { id: 'FIRE', nameTh: 'อัคคี', tagTh: 'เพลิงชาด' },
      WATER_ICE: { id: 'WATER_ICE', nameTh: 'วารี-น้ำแข็ง', tagTh: 'เหมันต์เยือก' },
      WIND: { id: 'WIND', nameTh: 'วายุ', tagTh: 'สายลมกรด' },
      EARTH_METAL: { id: 'EARTH_METAL', nameTh: 'ปฐพี-โลหะ', tagTh: 'ศิลาเหล็ก' },
      WOOD_LIFE: { id: 'WOOD_LIFE', nameTh: 'พฤกษา-ชีวิต', tagTh: 'มรกตชีวา' },
      LIGHTNING: { id: 'LIGHTNING', nameTh: 'อัสนี', tagTh: 'อสนีคราม' },
      LIGHT_YANG: { id: 'LIGHT_YANG', nameTh: 'แสง-หยาง', tagTh: 'สุริยันทอง' },
      YIN_SHADOW: { id: 'YIN_SHADOW', nameTh: 'หยิน-เงา', tagTh: 'เงารัตติกาล' },
      BLOOD_DEMON: { id: 'BLOOD_DEMON', nameTh: 'โลหิต-มาร', tagTh: 'โลหิตอสูร' },
      ASTRAL: { id: 'ASTRAL', nameTh: 'ดารา-มิติ', tagTh: 'ดาราพร่าง' }
    },
    affixes: [
      { id: 'ferocious_atk', suffixTh: 'ขย้ำพยัคฆ์', stat: 'atk', scale: 0.22, slots: ['WEAPON', 'ACCESSORY'] },
      { id: 'profound_matk', suffixTh: 'สะท้อนปราณ', stat: 'matk', scale: 0.22, slots: ['WEAPON', 'ACCESSORY'] },
      { id: 'bastion_def', suffixTh: 'พิทักษ์ผา', stat: 'def', scale: 0.24, slots: ['ARMOR', 'ACCESSORY', 'WEAPON'] },
      { id: 'ward_mdef', suffixTh: 'กันอาคม', stat: 'mdef', scale: 0.24, slots: ['ARMOR', 'ACCESSORY'] },
      { id: 'vital_hp', suffixTh: 'อายุวัฒนะ', stat: 'hp', scale: 0.36, slots: ['ARMOR', 'ACCESSORY'] },
      { id: 'lethal_crit', suffixTh: 'ผ่าจุดตาย', stat: 'crit', flatByTier: [2.0, 3.4, 5.0, 6.8], slots: ['WEAPON', 'ACCESSORY'] },
      { id: 'savage_critdmg', suffixTh: 'สังหารเด็ดขาด', stat: 'critDmg', flatByTier: [7, 12, 18, 25], slots: ['WEAPON', 'ACCESSORY'] },
      { id: 'piercing_pen', suffixTh: 'ทะลวงเกราะ', stat: 'pen', flatByTier: [3.0, 5.0, 7.5, 10.5], slots: ['WEAPON', 'ACCESSORY'] },
      { id: 'swift_cast', suffixTh: 'ร่ายสายฟ้า', stat: 'cast', flatByTier: [3.0, 5.0, 7.5, 10.5], slots: ['WEAPON', 'ARMOR', 'ACCESSORY'] },
      { id: 'gale_eva', suffixTh: 'เร้นเมฆา', stat: 'eva', scale: 0.16, slots: ['ARMOR', 'ACCESSORY'] },
      { id: 'hawk_acc', suffixTh: 'เนตรเหยี่ยว', stat: 'acc', scale: 0.18, slots: ['WEAPON', 'ACCESSORY'] },
      { id: 'stride_move', suffixTh: 'ก้าวท่องลม', stat: 'move', flatByTier: [2.5, 4.0, 5.5, 7.5], slots: ['ARMOR', 'ACCESSORY'] }
    ]
  };

  const PROC_BASE_SCALE = [28, 62, 130, 270];
  const ALL_GEAR_TYPES = {
    WEAPON: ['SWORD', 'BLADE', 'SPEAR', 'FIST', 'BOW', 'STAFF', 'FOCUS', 'ZITHER', 'BRUSH', 'WHIP', 'ROSARY', 'CLAW', 'NEEDLE', 'FAN', 'ASTROLABE', 'ABACUS'],
    ARMOR: ['HEAVY', 'LIGHT', 'ROBE'],
    ACCESSORY: ['RING', 'NECKLACE', 'BRACELET', 'CHARM']
  };
  const ALL_ELEMENTS = ['NEUTRAL', 'FIRE', 'WATER_ICE', 'WIND', 'EARTH_METAL', 'WOOD_LIFE', 'LIGHTNING', 'LIGHT_YANG', 'YIN_SHADOW', 'BLOOD_DEMON', 'ASTRAL'];

  ECO.rollProceduralGear = (W, spec) => {
    spec = spec || {};
    const rng = (spec.rng && typeof spec.rng.next === 'function') ? spec.rng : (W && W.rng ? W.rng : new U.RNG(String(spec.seed || 'proc_gear')));
    const slot = ['WEAPON', 'ARMOR', 'ACCESSORY'].includes(spec.slot)
      ? spec.slot
      : rng.pick(['WEAPON', 'ARMOR', 'ACCESSORY']);
    const validTypes = ALL_GEAR_TYPES[slot];
    const reqGearType = spec.gearType || spec.subType || spec.weaponType || spec.wtype;
    const gearType = (reqGearType && validTypes.includes(reqGearType))
      ? reqGearType
      : rng.pick(validTypes);

    const mods = spec.materialMods || {};
    const tierCap = clamp(spec.maxTier || mods.tierCap || 4, 1, 4);
    const minTier = clamp(spec.minTier || 1, 1, tierCap);
    let tier = spec.tier;
    if (!Number.isFinite(tier)) {
      const skillBonus = Number.isFinite(spec.skill) ? spec.skill / 90 : 0;
      const rawTier = 1 + (mods.tierShift || 0) + skillBonus * 0.65 + (rng.next() - 0.35) * 1.15;
      tier = clamp(Math.round(rawTier), minTier, tierCap);
    } else {
      tier = clamp(Math.round(tier), 1, 4);
    }

    const baseQ = Number.isFinite(spec.baseQ) ? spec.baseQ : (0.88 + rng.next() * 0.28 + (tier - 1) * 0.04);
    const q = Math.round(clamp(baseQ + (mods.qShift || 0), 0.72, 1.55) * 100) / 100;

    // Roll Element (Single, Dual, or Neutral)
    let primaryEl = spec.element || null;
    if (!primaryEl || !ECO.PROCEDURAL_POOLS.elements[primaryEl]) {
      const biases = Array.isArray(mods.elementBiases) ? mods.elementBiases.filter(e => ECO.PROCEDURAL_POOLS.elements[e]) : [];
      if (biases.length > 0 && rng.chance(0.76)) {
        primaryEl = biases[Math.floor(rng.next() * biases.length)];
      } else {
        primaryEl = ALL_ELEMENTS[Math.floor(rng.next() * ALL_ELEMENTS.length)];
      }
    }
    let secondaryEl = null;
    const biases2 = Array.isArray(mods.elementBiases) ? mods.elementBiases.filter(e => e !== primaryEl && e !== 'NEUTRAL' && ECO.PROCEDURAL_POOLS.elements[e]) : [];
    if (primaryEl !== 'NEUTRAL' && (biases2.length > 0 ? rng.chance(0.45) : (tier >= 3 && rng.chance(0.22)))) {
      secondaryEl = biases2.length > 0 ? biases2[0] : ALL_ELEMENTS.filter(e => e !== 'NEUTRAL' && e !== primaryEl)[Math.floor(rng.next() * (ALL_ELEMENTS.length - 2))];
    }

    const elementRole = primaryEl === 'NEUTRAL' ? 'EXPLICIT_NON_ELEMENTAL' : 'ELEMENTAL';
    const elementProfile = primaryEl === 'NEUTRAL'
      ? { mode: 'EXPLICIT_NON_ELEMENTAL', primary: 'NEUTRAL', weights: {} }
      : secondaryEl
        ? { mode: 'DUAL', primary: primaryEl, secondary: secondaryEl, weights: { [primaryEl]: 0.7, [secondaryEl]: 0.3 } }
        : { mode: 'SINGLE', primary: primaryEl, weights: { [primaryEl]: 1.0 } };

    // Roll Affixes (1 to 3 depending on tier and secondary material affixShift)
    const affixCount = clamp(1 + (tier >= 3 ? 1 : 0) + (rng.next() < (0.18 + (mods.affixShift || 0) * 0.65 + (tier === 4 ? 0.35 : 0)) ? 1 : 0), 1, 3);
    const candidateAffixes = ECO.PROCEDURAL_POOLS.affixes.filter(a => a.slots.includes(slot));
    const statBiases = Array.isArray(mods.statBiases) ? mods.statBiases : [];
    const pickedAffixes = [];
    const usedIds = new Set();
    for (let ai = 0; ai < affixCount && candidateAffixes.length > pickedAffixes.length; ai++) {
      const avail = candidateAffixes.filter(a => !usedIds.has(a.id));
      const picked = rng.weighted(avail, a => 1 + (statBiases.includes(a.stat) || statBiases.includes('all') ? 2.6 : 0));
      if (picked) {
        usedIds.add(picked.id);
        pickedAffixes.push(picked);
      }
    }

    // Compute concrete stats (st) and combatMult / defMult
    const baseScale = PROC_BASE_SCALE[tier - 1] * q;
    const st = {};
    if (slot === 'WEAPON') {
      const isFocus = ['FOCUS', 'ZITHER', 'BRUSH', 'ROSARY', 'FAN', 'ASTROLABE'].includes(gearType);
      st[isFocus ? 'matk' : 'atk'] = baseScale * (0.54 + rng.next() * 0.08);
      st[isFocus ? 'atk' : 'matk'] = baseScale * (0.12 + rng.next() * 0.05);
    } else if (slot === 'ARMOR') {
      st.def = baseScale * (gearType === 'HEAVY' ? 0.62 : gearType === 'LIGHT' ? 0.46 : 0.38);
      st.mdef = baseScale * (gearType === 'ROBE' ? 0.44 : 0.28);
      st.hp = baseScale * (0.48 + rng.next() * 0.08);
    } else {
      st.hp = baseScale * 0.28;
      st.atk = baseScale * 0.14;
      st.matk = baseScale * 0.14;
    }

    const typedBase = {
      SWORD: { crit: 2.5 + tier * 0.5, acc: baseScale * 0.08 },
      BLADE: { atk: baseScale * 0.14, critDmg: 4 + tier * 1.5 },
      BOW: { acc: baseScale * 0.18, crit: 2 + tier * 0.5 },
      SPEAR: { pen: 4 + tier * 1.2, atk: baseScale * 0.08 },
      STAFF: { def: baseScale * 0.16, hp: baseScale * 0.14 },
      FIST: { cast: 4 + tier, crit: 1.5 + tier * 0.4 },
      FOCUS: { matk: baseScale * 0.16, cast: 3 + tier },
      ZITHER: { matk: baseScale * 0.16, cast: 4 + tier },
      BRUSH: { matk: baseScale * 0.15, acc: baseScale * 0.14 },
      WHIP: { atk: baseScale * 0.10, acc: baseScale * 0.14, pen: 3 + tier },
      ROSARY: { matk: baseScale * 0.14, mdef: baseScale * 0.14, hp: baseScale * 0.16 },
      CLAW: { atk: baseScale * 0.16, crit: 3 + tier * 0.6, pen: 4 + tier },
      NEEDLE: { atk: baseScale * 0.10, matk: baseScale * 0.10, acc: baseScale * 0.16, pen: 4 + tier },
      FAN: { matk: baseScale * 0.15, cast: 4 + tier, eva: baseScale * 0.08 },
      ASTROLABE: { matk: baseScale * 0.16, acc: baseScale * 0.16, crit: 2.5 + tier * 0.5 },
      ABACUS: { atk: baseScale * 0.12, matk: baseScale * 0.12, pen: 4 + tier, def: baseScale * 0.08 },
      HEAVY: { def: baseScale * 0.18, move: -3 },
      LIGHT: { eva: baseScale * 0.16, move: 4 },
      ROBE: { mdef: baseScale * 0.20, cast: 4 },
      RING: { crit: 2 + tier * 0.5, pen: 2 + tier * 0.5 },
      NECKLACE: { hp: baseScale * 0.30, def: baseScale * 0.10 },
      BRACELET: { cast: 3.5 + tier, acc: baseScale * 0.12 },
      CHARM: { mdef: baseScale * 0.16, eva: baseScale * 0.10 }
    }[gearType] || {};
    for (const k in typedBase) st[k] = (st[k] || 0) + typedBase[k];

    const rolledAffixes = [];
    for (const af of pickedAffixes) {
      const rollFactor = 0.88 + rng.next() * 0.28;
      const val = af.flatByTier
        ? +(af.flatByTier[tier - 1] * rollFactor * (0.9 + q * 0.1)).toFixed(1)
        : +(baseScale * (af.scale || 0.18) * rollFactor).toFixed(1);
      st[af.stat] = (st[af.stat] || 0) + val;
      rolledAffixes.push({ id: af.id, suffixTh: af.suffixTh, stat: af.stat, val });
    }
    for (const k in st) st[k] = Math.round(st[k] * 10) / 10;

    const wp = slot === 'WEAPON', ar = slot === 'ARMOR';
    const combatMult = +(((wp ? 0.052 : ar ? 0.016 : 0.018) * tier * q) * (1 + pickedAffixes.length * 0.03)).toFixed(4);
    const defMult = +(((ar ? 0.052 : wp ? 0.014 : 0.016) * tier * q) * (1 + pickedAffixes.length * 0.03)).toFixed(4);

    // Construct Coherent Thai Name
    const forms = ECO.PROCEDURAL_POOLS.baseForms[gearType] || ['ศาสตราหลอม'];
    const baseForm = forms[Math.floor(rng.next() * forms.length)];
    const gradeInfo = ECO.PROCEDURAL_POOLS.gradesByTier[tier] || ECO.PROCEDURAL_POOLS.gradesByTier[1];
    const prefix = gradeInfo.prefixes[Math.floor(rng.next() * gradeInfo.prefixes.length)];
    const elInfo = ECO.PROCEDURAL_POOLS.elements[primaryEl] || ECO.PROCEDURAL_POOLS.elements.NEUTRAL;
    const secElInfo = secondaryEl ? ECO.PROCEDURAL_POOLS.elements[secondaryEl] : null;
    const elTag = secElInfo ? (elInfo.tagTh + 'ผสาน' + secElInfo.nameTh) : elInfo.tagTh;
    const primaryAffix = rolledAffixes[0];
    const nameTh = baseForm + prefix + 'แห่ง' + elTag + (primaryAffix ? ('·' + primaryAffix.suffixTh) : '');

    const templateId = 'ITEM_PROC_' + gearType;
    const uid = ECO.nextGearUid(W, templateId);
    const baseVal = Math.round((26 * Math.pow(1.92, tier - 1)) * q * (1 + rolledAffixes.length * 0.08));

    const gear = {
      uid,
      id: templateId,
      nameTh,
      slot,
      gearType,
      subType: slot === 'WEAPON' ? gearType : undefined,
      tier,
      minStage: tier,
      grade: gradeInfo.grade,
      gradeTh: gradeInfo.gradeTh,
      procedural: true,
      element: primaryEl,
      secondaryElement: secondaryEl || null,
      elementalRole: elementRole,
      elementProfile,
      q,
      combatMult,
      defMult,
      st,
      affixes: rolledAffixes,
      dur: 100,
      maxDur: 100,
      repairCount: 0,
      broken: false,
      retired: false,
      value: baseVal,
      origin: {
        source: spec.source || 'procedural',
        day: W ? W.day : 0,
        recipeId: spec.recipeId || null,
        crafterId: spec.npc ? spec.npc.id : null,
        materials: Array.isArray(spec.chosenInputs) ? spec.chosenInputs.map(x => x.matId) : (mods.matIds || [])
      }
    };
    if (spec.playerSpawned) gear.playerSpawned = true;
    // Tag with resonanceSetIds if tier >= 3
    if (tier >= 3 && JD.MARTIAL && Array.isArray(JD.MARTIAL.RESONANCE_SETS)) {
      const matched = [];
      for (const rs of JD.MARTIAL.RESONANCE_SETS) {
        const slotTypes = rs.slots && rs.slots[slot];
        if (!slotTypes || !slotTypes.includes(gearType)) continue;
        if (rs.elementFamily.includes(primaryEl) || (primaryEl === 'NEUTRAL' && rs.elementFamily.includes('EXPLICIT_NON_ELEMENTAL'))) {
          matched.push(rs.id);
        }
      }
      if (matched.length) {
        gear.resonanceSetIds = matched;
        gear.resonanceSetId = matched[0];
      }
    }
    return gear;
  };

  ECO.previewProceduralCraft = (W, recipeOrId, opts, npc) => {
    const r = typeof recipeOrId === 'string' ? recipeById[recipeOrId] : recipeOrId;
    if (!r || !r.proceduralOut) return null;
    const resolved = ECO.resolveCraftMaterials(W, r, opts, npc);
    if (!resolved) {
      return {
        ok: false,
        recipeId: r.id,
        nameTh: r.nameTh,
        reasonTh: 'วัตถุดิบในคลังสำนักไม่เพียงพอสำหรับแม่พิมพ์นี้'
      };
    }
    const mods = resolved.materialMods || {};
    const skill = npc && npc.h && npc.h.skills ? (npc.h.skills.FORGING || 0) : 25;
    const minTier = 1;
    const maxTier = clamp(mods.tierCap || 2, 1, 4);
    const estTier = clamp(Math.round(1 + (mods.tierShift || 0) + (skill / 90) * 0.65), minTier, maxTier);
    const minQ = +(clamp(0.85 + (mods.qShift || 0) - 0.08, 0.72, 1.55)).toFixed(2);
    const maxQ = +(clamp(0.95 + (skill - r.minMastery) / 160 + (mods.qShift || 0) + 0.12, minQ, 1.55)).toFixed(2);
    const elBiases = (mods.elementBiases && mods.elementBiases.length) ? mods.elementBiases : ['สุ่มทุกธาตุ'];
    const statBiases = (mods.statBiases && mods.statBiases.length) ? mods.statBiases : ['สมดุล'];
    return {
      ok: true,
      recipeId: r.id,
      nameTh: r.nameTh,
      slot: r.proceduralSlot || r.slot,
      gearType: r.proceduralGearType || r.gearType,
      inputs: resolved.inputs,
      chosenOptions: resolved.chosenOptions,
      tierRange: [minTier, maxTier],
      expectedTier: estTier,
      qualityRange: [minQ, maxQ],
      elementBiases: elBiases,
      statBiases,
      summaryTh: 'คาดการณ์ระดับ T' + minTier + '–T' + maxTier + ' (เด่น T' + estTier + ') · คุณภาพ ' + minQ + '–' + maxQ + ' · โน้มเอียงธาตุ: ' + elBiases.join('/')
    };
  };

  ECO.craftProceduralNow = (W, npc, recipeOrId, opts) => {
    const r = typeof recipeOrId === 'string' ? recipeById[recipeOrId] : recipeOrId;
    if (!W || !W.sect || !r || !r.proceduralOut) return { ok: false, reason: 'invalid-recipe' };
    const crafter = npc || W.byId[W.sect.posts && W.sect.posts.forge] || W.byId[W.sect.masterId] || W.npcs.find(n => !n.dead);
    if (!crafter) return { ok: false, reason: 'no-crafter' };
    const resolved = ECO.resolveCraftMaterials(W, r, opts, crafter);
    if (!resolved) return { ok: false, reason: 'insufficient-inputs' };
    const taken = [];
    for (let idx = 0; idx < resolved.inputs.length; idx++) {
      const inp = resolved.inputs[idx];
      if (!ECO.take(W, inp.matId, inp.count)) {
        for (let rIdx = 0; rIdx < taken.length; rIdx++) ECO.add(W, taken[rIdx].matId, taken[rIdx].count);
        return { ok: false, reason: 'insufficient-inputs' };
      }
      taken.push(inp);
    }
    const skill = (crafter.h && crafter.h.skills && crafter.h.skills.FORGING) || 25;
    const baseQ = clamp(0.88 + (skill - r.minMastery) / 160 + W.rng.gauss(0, 0.05), 0.72, 1.50);
    const gear = ECO.rollProceduralGear(W, {
      slot: r.proceduralSlot || r.slot,
      gearType: r.proceduralGearType || r.gearType,
      recipeId: r.id,
      npc: crafter,
      skill,
      baseQ,
      materialMods: resolved.materialMods,
      chosenInputs: resolved.inputs,
      source: 'forge'
    });
    ECO.applyArmorArtisan(crafter, gear);
    (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(crafter, 'FORGING', ECO.craftHours(r, skill), 1.1);
    gear.listedAtDay = W.day;
    gear.listedTick = W.t;
    if (opts && opts.toNpcBag && crafter.inv) {
      crafter.inv.gear = crafter.inv.gear || [];
      crafter.inv.gear.push(gear);
    } else {
      W.sect.gear.push(gear);
      invalidateStockIntel(W);
    }
    const cultPts = ECO.grantCraftCultivation ? ECO.grantCraftCultivation(W, crafter, r, { q: gear.q, tier: gear.tier, craft: r.craft || 'FORGING' }) : 0;
    if (W.log && !(opts && opts.quiet)) {
      W.log('craft', (crafter.h && crafter.h.name ? crafter.h.name.given : 'ช่างหลอม') + ' หลอมศาสตราสุ่มสำเร็จ:「' + gear.nameTh + '」(T' + gear.tier + ' · คุณภาพ ' + gear.q + ' · ทนทาน ' + gear.dur + '/' + gear.maxDur + ')', [crafter.id]);
    }
    return { ok: true, gear, inputs: resolved.inputs, materialMods: resolved.materialMods, cultivationGained: cultPts };
  };

  ECO.wearGear = (it, amount, W, ownerNpc) => {
    if (!it || typeof it !== 'object') return false;
    const wear = Number.isFinite(amount) && amount > 0 ? amount : 0;
    if (wear <= 0) return false;
    if (it.maxDur == null) it.maxDur = 100;
    if (it.dur == null) it.dur = it.maxDur;
    const prevDur = it.dur;
    it.dur = Math.max(0, Math.round((it.dur - wear) * 100) / 100);
    if (it.dur <= 0 && (it.breakTransformInto || it.awakenedCoreOnBreak)) {
      it.dur = 100;
      it.maxDur = 100;
      it.broken = false;
      it.transformedFromBreak = true;
      it.tier = Math.min(7, (it.tier || 1) + 1);
      it.nameTh = (it.breakTransformNameTh || ('แก่นศาสตราตื่นรู้·' + (it.nameTh || 'ศาสตราโบราณ')));
      if (it.st) {
        for (const k of Object.keys(it.st)) it.st[k] = Math.round(it.st[k] * 1.25 * 10) / 10;
      }
      if (ownerNpc) ownerNpc.lastBreakTransform = { t: (W && W.t) || 0, itemId: it.id, nameTh: it.nameTh };
    } else if (it.procedural) {
      if (it.dur <= 0) {
        it.dur = 0;
        it.broken = true;
        if (it.maxDur <= 20) it.retired = true;
      }
    } else {
      it.dur = Math.max(1, it.dur);
    }
    if (ownerNpc && ((prevDur > 0 && it.dur <= 0) || Math.floor(prevDur / 10) !== Math.floor(it.dur / 10))) {
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(ownerNpc);
      if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(ownerNpc);
    }
    return it.dur <= 0;
  };

  ECO.repairGear = (W, gearOrUid, stoneId, npc, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'no-world' };
    let gear = (gearOrUid && typeof gearOrUid === 'object') ? gearOrUid : null;
    if (!gear && typeof gearOrUid === 'string') {
      if (npc && npc.equip) {
        for (const sl of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
          if (npc.equip[sl] && (npc.equip[sl].uid === gearOrUid || npc.equip[sl].id === gearOrUid)) { gear = npc.equip[sl]; break; }
        }
      }
      if (!gear && npc && npc.inv && Array.isArray(npc.inv.gear)) {
        gear = npc.inv.gear.find(g2 => g2 && (g2.uid === gearOrUid || g2.id === gearOrUid));
      }
      if (!gear && Array.isArray(W.sect.gear)) {
        gear = W.sect.gear.find(g2 => g2 && (g2.uid === gearOrUid || g2.id === gearOrUid));
      }
      if (!gear && Array.isArray(W.npcs)) {
        for (const n of W.npcs) {
          if (!n || n.dead) continue;
          for (const sl of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
            if (n.equip && n.equip[sl] && (n.equip[sl].uid === gearOrUid || n.equip[sl].id === gearOrUid)) { gear = n.equip[sl]; npc = npc || n; break; }
          }
          if (gear) break;
          if (n.inv && Array.isArray(n.inv.gear)) {
            const hit = n.inv.gear.find(g2 => g2 && (g2.uid === gearOrUid || g2.id === gearOrUid));
            if (hit) { gear = hit; npc = npc || n; break; }
          }
        }
      }
    }
    if (!gear || !gear.slot) return { ok: false, reason: 'gear-not-found' };

    let stone = stoneId ? ECO.REPAIR_STONES[stoneId] : null;
    if (!stone) {
      const order = ['ITEM_REPAIR_STONE_4', 'ITEM_REPAIR_STONE_3', 'ITEM_REPAIR_STONE_2', 'ITEM_REPAIR_STONE_1'];
      for (const sid of order) {
        const havePersonal = npc && npc.inv && npc.inv.mats && (npc.inv.mats[sid] || 0) > 0;
        const haveSect = ECO.count(W, sid) > 0;
        if (opts.free || havePersonal || haveSect) {
          stone = ECO.REPAIR_STONES[sid];
          break;
        }
      }
    }
    if (!stone) return { ok: false, reason: 'no-repair-stone' };

    const curMax = Number.isFinite(gear.maxDur) ? gear.maxDur : 100;
    const curDur = Number.isFinite(gear.dur) ? gear.dur : curMax;
    const minMax = stone.minMaxDur || 20;

    if (gear.retired || curMax <= minMax) {
      if (curDur <= 0 && curMax <= minMax) gear.retired = true;
      return { ok: false, reason: 'max-dur-exhausted', dur: curDur, maxDur: curMax, minMaxDur: minMax };
    }
    if (curDur >= curMax) {
      return { ok: false, reason: 'already-full', dur: curDur, maxDur: curMax };
    }
    const newMaxDur = Math.max(minMax, curMax - stone.maxDurReduction);
    if (curDur >= newMaxDur && !opts.forceInefficient) {
      return { ok: false, reason: 'dur-above-new-max', dur: curDur, maxDur: curMax, newMaxDur };
    }

    if (!opts.free) {
      const havePersonal = npc && npc.inv && npc.inv.mats && (npc.inv.mats[stone.id] || 0) > 0;
      if (havePersonal) {
        npc.inv.mats[stone.id] -= 1;
        if (npc.inv.mats[stone.id] <= 0) delete npc.inv.mats[stone.id];
      } else if (!ECO.take(W, stone.id, 1)) {
        return { ok: false, reason: 'no-repair-stone', stoneId: stone.id };
      }
    }

    gear.maxDur = newMaxDur;
    gear.dur = newMaxDur;
    gear.broken = false;
    gear.retired = false;
    gear.repairCount = (gear.repairCount || 0) + 1;
    gear.lastRepairedDay = W.day;
    gear.lastRepairStoneId = stone.id;

    if (npc) {
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
      if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(npc);
      if (HC.bump) HC.bump(npc);
    }
    if (!opts.quiet && W.log) {
      W.log('craft', '🔧 ซ่อมบำรุง「' + gear.nameTh + '」ด้วย「' + stone.nameTh + '」ความทนทาน ' + Math.round(curDur) + '/' + curMax + ' → ' + newMaxDur + '/' + newMaxDur + ' (ลดเพดานทนทาน -' + (curMax - newMaxDur) + ')', npc ? [npc.id] : []);
    }
    return {
      ok: true,
      gear,
      stoneId: stone.id,
      stoneNameTh: stone.nameTh,
      oldDur: curDur,
      oldMaxDur: curMax,
      newDur: gear.dur,
      newMaxDur: gear.maxDur,
      maxDurReduction: curMax - newMaxDur,
      repairCount: gear.repairCount
    };
  };

  ECO.retireGear = (W, npc, gearOrUid, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'no-world' };
    let gear = (gearOrUid && typeof gearOrUid === 'object') ? gearOrUid : null;
    let holder = npc || null, loc = null, slotKey = null;
    const match = g2 => g2 && (g2 === gear || (typeof gearOrUid === 'string' && (g2.uid === gearOrUid || g2.id === gearOrUid)));

    if (holder && holder.equip) {
      for (const sl of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
        if (match(holder.equip[sl])) { gear = holder.equip[sl]; loc = 'equip'; slotKey = sl; break; }
      }
    }
    if (!loc && holder && holder.inv && Array.isArray(holder.inv.gear)) {
      const idx = holder.inv.gear.findIndex(match);
      if (idx >= 0) { gear = holder.inv.gear[idx]; loc = 'bag'; slotKey = idx; }
    }
    if (!loc && Array.isArray(W.sect.gear)) {
      const idx = W.sect.gear.findIndex(match);
      if (idx >= 0) { gear = W.sect.gear[idx]; loc = 'sect'; slotKey = idx; }
    }
    if (!gear) return { ok: false, reason: 'gear-not-found' };

    gear.dur = 0;
    gear.broken = true;
    gear.retired = true;
    if (loc === 'equip' && holder) {
      delete holder.equip[slotKey];
    } else if (loc === 'bag' && holder && holder.inv && Array.isArray(holder.inv.gear)) {
      holder.inv.gear.splice(slotKey, 1);
    } else if (loc === 'sect' && Array.isArray(W.sect.gear)) {
      W.sect.gear.splice(slotKey, 1);
    }
    const salvageMat = (gear.tier || 1) >= 3 ? 'MAT_ORE_COLD_STEEL_2' : 'MAT_ORE_BLACK_IRON_1';
    ECO.add(W, salvageMat, 1);
    if (holder) {
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(holder);
      if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(holder);
    }
    if (!opts.quiet && W.log) {
      W.log('economy', '♻️ ปลดระวางศาสตราชำรุดถาวร「' + gear.nameTh + '」แยกชิ้นส่วนคืนเป็น「' + ECO.name(salvageMat) + '」×1 เข้าคลังสำนัก', holder ? [holder.id] : []);
    }
    return { ok: true, gear, salvageMat };
  };

  ECO.ensureUniqueGearUids = W => {
    if (!W || !W.sect) return;
    if (!Number.isSafeInteger(W.sect.gearUidSeq) || W.sect.gearUidSeq < 0) W.sect.gearUidSeq = gearSeq;
    if (!Array.isArray(W.sect.soldGearReceipts)) W.sect.soldGearReceipts = [];
    const soldUids = new Set(W.sect.soldGearReceipts.map(r => r && r.uid).filter(Boolean));
    const seenUids = new Set();
    const seenRefs = new WeakSet();

    const extractSeq = uid => {
      if (typeof uid !== 'string') return 0;
      const m = uid.match(/_(\d+)$/);
      return m ? parseInt(m[1], 10) || 0 : 0;
    };

    const normalizeItem = it => {
      if (!it || typeof it !== 'object') return null;
      let target = it;
      if (seenRefs.has(it)) {
        target = Object.assign({}, it);
        if (it.st) target.st = Object.assign({}, it.st);
        if (Array.isArray(it.affixes)) target.affixes = it.affixes.map(a => Object.assign({}, a));
        delete target.uid;
      }
      seenRefs.add(target);
      if (target.uid && soldUids.has(target.uid)) return null;
      const seqNum = extractSeq(target.uid);
      if (seqNum > W.sect.gearUidSeq) W.sect.gearUidSeq = seqNum;
      if (!target.uid || seenUids.has(target.uid)) {
        target.uid = ECO.nextGearUid(W, target.id || 'eq');
      }
      seenUids.add(target.uid);
      if (target.maxDur == null) target.maxDur = 100;
      if (target.dur == null) target.dur = target.maxDur;
      if (target.repairCount == null) target.repairCount = 0;
      if (target.procedural) {
        target.broken = target.dur <= 0;
        if (target.dur <= 0 && target.maxDur <= 20) target.retired = true;
      }
      return target;
    };

    const allNpcs = (W.npcs || []).concat((W.sect && Array.isArray(W.sect.queue)) ? W.sect.queue : []);
    for (const n of allNpcs) {
      if (!n) continue;
      if (n.equip && typeof n.equip === 'object') {
        for (const sl of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
          if (n.equip[sl]) {
            const norm = normalizeItem(n.equip[sl]);
            if (norm) n.equip[sl] = norm;
            else delete n.equip[sl];
          }
        }
      }
      if (n.inv && Array.isArray(n.inv.gear)) {
        const nextBag = [];
        for (let i = 0; i < n.inv.gear.length; i++) {
          const norm = normalizeItem(n.inv.gear[i]);
          if (norm) nextBag.push(norm);
        }
        n.inv.gear = nextBag;
      }
    }
    if (Array.isArray(W.sect.gear)) {
      const nextSectGear = [];
      for (let i = 0; i < W.sect.gear.length; i++) {
        const norm = normalizeItem(W.sect.gear[i]);
        if (norm) {
          if (norm.listedAtDay == null) norm.listedAtDay = W.day || 0;
          nextSectGear.push(norm);
        }
      }
      W.sect.gear = nextSectGear;
    }
    if (W.world && Array.isArray(W.world.visitors)) {
      for (const v of W.world.visitors) {
        if (v && Array.isArray(v.gearStock)) {
          const nextVGear = [];
          for (let i = 0; i < v.gearStock.length; i++) {
            const norm = normalizeItem(v.gearStock[i]);
            if (norm) nextVGear.push(norm);
          }
          v.gearStock = nextVGear;
        }
      }
    }
    gearSeq = Math.max(gearSeq, W.sect.gearUidSeq);
  };

  // v2.0.34 + v2.0.35: Unified item lookup, 129/129 Item Effect Runtime Executor, E01-E06 Gear Mechanics & Elemental Alchemy/Smithing
  ECO.v235ItemById = ECO.v235ItemById || {};
  ECO._boundWorld = null;
  ECO.resetDynamicItems = W => {
    const isDynamicKey = (k, obj) => k.startsWith('P_ELEM_') || k.startsWith('CUSTOM_PILL_') || !!(obj && (obj.isCustomElementalPill || obj.isDynamicCustomPill));
    for (const k of Object.keys(ECO.itemById)) {
      if (!STATIC_ITEM_IDS.has(k) && isDynamicKey(k, ECO.itemById[k])) delete ECO.itemById[k];
      else STATIC_ITEM_IDS.add(k);
    }
    for (const k of Object.keys(ECO.v235ItemById)) {
      if (!STATIC_ITEM_IDS.has(k) && isDynamicKey(k, ECO.v235ItemById[k])) delete ECO.v235ItemById[k];
      else STATIC_ITEM_IDS.add(k);
    }
    _pillInfoCache.clear();
    ECO._boundWorld = W || null;
    if (W && W.sect && W.sect.customPills && typeof W.sect.customPills === 'object') {
      for (const [pid, pdef] of Object.entries(W.sect.customPills)) {
        if (pid && pdef && typeof pdef === 'object' && !STATIC_ITEM_IDS.has(pid)) {
          ECO.v235ItemById[pid] = pdef;
          ECO.itemById[pid] = pdef;
        }
      }
    }
  };
  ECO.getItem = (id, W) => {
    if (!id || typeof id !== 'string') return null;
    if (STATIC_ITEM_IDS.has(id)) return ECO.itemById[id] || null;
    const w = W || ECO._boundWorld;
    if (w && w.sect && w.sect.customPills && w.sect.customPills[id]) return w.sect.customPills[id];
    return (ECO.v235ItemById && ECO.v235ItemById[id]) || (ECO.itemById && ECO.itemById[id]) || null;
  };
  ECO.addItem = (W, id, qty) => ECO.add(W, id, qty || 1);

  // Complete registry of all 129 item effectIds across the entire item catalog
  ECO.ALL_RUNTIME_EFFECT_IDS = Object.freeze([
    "EFX_ARMOR_FRACTURE",
    "EFX_UNLOCK_SECT_PATH_MANUAL",
    "EFX_BESTOW_PATH_CRYSTAL",
    "EFX_V200_BODHI_MERIT_PULSE",
    "EFX_V200_ATAVISM_CLAW_REND",
    "EFX_V200_MERIDIAN_VENOM_NEEDLE",
    "EFX_V200_TEMPEST_FAN_GALE",
    "EFX_V200_ASTROLABE_STAR_LOCK",
    "EFX_V200_ABACUS_LEDGER_SETTLE",
    "EFX_LEG_BODHI_NIRVANA_ROSARY",
    "EFX_LEG_TAOTIE_DEVOURING_CLAW",
    "EFX_LEG_BAIHUA_SOUL_NEEDLE",
    "EFX_LEG_BAJIAO_TEMPEST_FAN",
    "EFX_LEG_HETU_LUOSHU_ASTROLABE",
    "EFX_LEG_CAISHEN_GOLDEN_ABACUS",
    "EFX_ARMOR_SHATTER",
    "EFX_BARRIER_SHIELD",
    "EFX_BEAST_BOND_CHANNEL",
    "EFX_BEAST_INTIMIDATION",
    "EFX_BERSERK_OVERDRIVE",
    "EFX_BLEEDING",
    "EFX_BLOODLINE_AWAKEN",
    "EFX_BLOOD_SACRIFICE_OVERDRIVE",
    "EFX_BONE_MARROW_TEMPER",
    "EFX_BREAKTHROUGH_BOOST",
    "EFX_BURNING",
    "EFX_BURNING_DOT",
    "EFX_BURST_QI_SURGE",
    "EFX_CALM_MIND",
    "EFX_CARGO_PRESERVATION",
    "EFX_CHILL_FREEZE",
    "EFX_CLEAR_DEBUFFS",
    "EFX_CONTROL_RESILIENCE",
    "EFX_CULTIVATION_ACCELERATOR",
    "EFX_CULTIVATION_BURST",
    "EFX_DAMAGE_REFLECT",
    "EFX_DANTIAN_EXPANSION",
    "EFX_DETECTION_REVEAL",
    "EFX_ECOLOGY_HERB_NURTURE",
    "EFX_ELEMENTAL_ANNIHILATION",
    "EFX_EMERGENCY_BEACON",
    "EFX_ESCAPE_TELEPORT",
    "EFX_FINAL_STAND_SHIELD",
    "EFX_FORGING_STABILIZATION",
    "EFX_FORMATION_DISRUPTION",
    "EFX_FORMATION_HARMONIZATION",
    "EFX_GRAVITY_QI_SEAL",
    "EFX_GUARDED_DAMAGE_SHARE",
    "EFX_HASTE_STEP",
    "EFX_HEART_DEMON_WARD",
    "EFX_HEAVENLY_THUNDER_SMITE",
    "EFX_HERB_POLLINATION",
    "EFX_ILLUSION_DECOY",
    "EFX_ILLUSION_MIST_MAZE",
    "EFX_INJURY_MEND",
    "EFX_INSTANT_VITAL_RECOVERY",
    "EFX_INTENT_SENSE",
    "EFX_INTERRUPT_CHANNEL",
    "EFX_LEARNING_INSIGHT",
    "EFX_LEG_BODHI_HEART_LOTUS",
    "EFX_LEG_CHUNQIU_VERDICT_SEAL",
    "EFX_LEG_CRANE_CLOUD_AEGIS",
    "EFX_LEG_DAGOU_REDIRECTION",
    "EFX_LEG_DRAGON_LANCE_WARD",
    "EFX_LEG_DRAGON_PHOENIX_HARMONY",
    "EFX_LEG_JIUXIAO_SONIC_TEMPEST",
    "EFX_LEG_KIRIN_PHANTOM_COUNTER",
    "EFX_LEG_MOON_ARC",
    "EFX_LEG_OVERLORD_COURAGE",
    "EFX_LEG_PEACOCK_RADIANCE",
    "EFX_LEG_SAMSARA_RING_REVERSAL",
    "EFX_LEG_TAICHI_COMMAND_DECREE",
    "EFX_LEG_TIANCAN_PUPPET_SNARE",
    "EFX_LEG_TIGER_FIST_RESOLVE",
    "EFX_LEG_TULONG_DECREE",
    "EFX_LEG_TWIN_CONDOR_SHOT",
    "EFX_LEG_XIAOLI_TRUE_STRIKE",
    "EFX_LEG_XUANTIE_CRUSH",
    "EFX_LEG_XUANWU_UNYIELDING_BASTION",
    "EFX_LEG_YITIAN_SEVER",
    "EFX_LIFESPAN_EXTEND",
    "EFX_MASS_VITAL_HEAL",
    "EFX_MEDITATION_ACCEL",
    "EFX_MERIDIAN_STABILIZE",
    "EFX_MERIDIAN_TOXIN_PURGE",
    "EFX_MIASMA_BARRIER",
    "EFX_MIND_CORROSION",
    "EFX_MIND_ENLIGHTEN",
    "EFX_MIND_SHIELD",
    "EFX_PARALYSIS_ARC",
    "EFX_POISON_COAT",
    "EFX_POISON_IMMUNITY",
    "EFX_PURIFY_HOSTILE_STATUS",
    "EFX_PURIFY_TOXIN",
    "EFX_QI_PURITY_REFINEMENT",
    "EFX_QI_RESERVOIR",
    "EFX_QI_SIPHON",
    "EFX_RAPID_COAGULATION",
    "EFX_REALM_SUPPRESSION_GUARD",
    "EFX_RECON_SIGNAL_JAM",
    "EFX_REGEN_AURA",
    "EFX_SCENT_TRACE_BREAK",
    "EFX_SHOCK_CONDUCTION",
    "EFX_SIDESTEP_EVASION",
    "EFX_SILENCE_CAST",
    "EFX_SKY_LEVITATION_DRIVE",
    "EFX_SOIL_PURIFICATION",
    "EFX_SOUL_MENTAL_ATTACK",
    "EFX_SOUL_NOURISH",
    "EFX_SOUL_SHOCK",
    "EFX_SPATIAL_LOCK",
    "EFX_STEALTH_CONCEALMENT",
    "EFX_STRUCTURAL_IMMUNITY_FLOOR",
    "EFX_SUPPLY_EFFICIENCY",
    "EFX_SUPPRESS_POSITIVE_BUFF",
    "EFX_SUSTAINED_REGEN",
    "EFX_SWORD_STORM_STRIKE",
    "EFX_TENACITY_UNYIELDING",
    "EFX_TERRAIN_BIND_TRAP",
    "EFX_TIMED_PARRY",
    "EFX_TOXIN_INFECTION",
    "EFX_TRACE_MARK",
    "EFX_TRIBULATION_SHIELD",
    "EFX_V234_BUFF_STEALER",
    "EFX_V234_COMBO_MOMENTUM",
    "EFX_V234_CRAFT_HARMONIZER",
    "EFX_V234_DEBUFF_EXTENDER",
    "EFX_V234_DOT_TRANSMUTER",
    "EFX_V234_ELEMENTAL_REACTOR",
    "EFX_V234_EMERGENCY_AEGIS",
    "EFX_V234_EXECUTE_REAPER",
    "EFX_V234_MARK_AMPLIFIER",
    "EFX_V234_MULTI_PHASE_PILL",
    "EFX_V234_OVERDRIVE_SURGE",
    "EFX_V234_REALM_COMPASS",
    "EFX_V234_RICOCHET_CONDUCTOR",
    "EFX_V234_STANCE_FLOW",
    "EFX_V234_TETHER_GUARD",
    "EFX_V234_TRAINING_CATALYST",
    "EFX_VEIN_ANCHORED",
    "EFX_VITALITY_STEAL",
    "EFX_WEAKNESS_EXPOSURE",
    "EFX_WEAPON_MAGNET_DISARM"
]);

  ECO.executeItemEffectById = (W, npc, effectId, params, ctx) => {
    if (!npc || !effectId) return { ok: false };
    params = params || {};
    ctx = ctx || {};
    const ST = g.STATS;
    const tNow = (ctx.now != null) ? ctx.now : ((W && W.t != null) ? W.t : ((ST && ST.now) || 0));
    const st = npc.h && npc.h.state;
    const hm = (CULT && CULT.hpMax) ? CULT.hpMax(npc) : 100;
    const qm = (npc.cult && CULT && CULT.qiMax) ? CULT.qiMax(npc) : 100;
    let applied = effectId;

    switch (effectId) {
      case 'EFX_V234_MULTI_PHASE_PILL':
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'alchemicalHarmony', params.dur || 75, tNow, { casterId: npc.id });
        break;
      case 'EFX_BURST_QI_SURGE':
        if (st) {
          st.hp = clamp(Math.round((st.hp || hm) + hm * (params.healPct || 0.25)), 1, hm);
          if (npc.cult) st.qi = clamp(Math.round((st.qi || 0) + qm * (params.qiPct || 0.25)), 0, qm);
        }
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'qiConduit', params.dur || 60, tNow, { casterId: npc.id });
        break;
      case 'EFX_POISON_IMMUNITY':
      case 'EFX_PURIFY_TOXIN':
        if (npc.cult) npc.cult.toxic = Math.max(0, (npc.cult.toxic || 0) - (params.toxicClear || 20));
        if (ST) {
          ST.clearStatus(npc, x => ['poison', 'venomSeed', 'sovereignPlague', 'crimsonGuSwarm', 'ashenToxin'].includes(x.k));
          ST.addStatus(npc, 'shield', 18, { amt: Math.round(hm * (params.shieldPct || 0.18)) }, tNow);
          if (ST.applyNamedBuff) ST.applyNamedBuff(npc, 'clarityLotus', 60, tNow, { casterId: npc.id });
        }
        break;
      case 'EFX_RAPID_COAGULATION':
        if (ST) ST.clearStatus(npc, x => x.k === 'bleed');
        if (st) st.hp = clamp(Math.round((st.hp || hm) + hm * (params.healPct || 0.22)), 1, hm);
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'vitalRegen', 45, tNow, { casterId: npc.id });
        break;
      case 'EFX_MIASMA_BARRIER':
        if (ST) {
          ST.addStatus(npc, 'shield', 24, { amt: Math.round(hm * (params.shieldPct || 0.22)) }, tNow);
          if (ST.applyNamedBuff) ST.applyNamedBuff(npc, 'aegisWard', 60, tNow, { casterId: npc.id });
        }
        break;
      case 'EFX_INSTANT_VITAL_RECOVERY':
        if (st) st.hp = clamp(Math.round((st.hp || hm) + hm * (params.healPct || 0.35)), 1, hm);
        if (Array.isArray(npc.inj) && npc.inj.length > 0) npc.inj.shift();
        break;
      case 'EFX_BERSERK_OVERDRIVE':
      case 'EFX_V234_OVERDRIVE_SURGE':
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'asuraBloodFrenzy', params.dur || 45, tNow, { casterId: npc.id });
        if (st && npc.cult) st.qi = clamp(Math.round((st.qi || 0) + qm * 0.20), 0, qm);
        break;
      case 'EFX_SUSTAINED_REGEN':
      case 'EFX_REGEN_AURA':
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'vitalRegen', params.dur || 75, tNow, { casterId: npc.id });
        break;
      case 'EFX_FINAL_STAND_SHIELD':
      case 'EFX_V234_EMERGENCY_AEGIS':
        if (ST) {
          ST.addStatus(npc, 'shield', 20, { amt: Math.round(hm * (params.shieldPct || 0.30)) }, tNow);
          if (ST.applyNamedBuff) {
            ST.applyNamedBuff(npc, 'finalStandImmortal', 45, tNow, { casterId: npc.id });
            ST.applyNamedBuff(npc, 'phoenixCovenant', 60, tNow, { casterId: npc.id });
          }
        }
        npc._phoenixClauseReady = true;
        break;
      case 'EFX_MERIDIAN_STABILIZE':
        if (st) st.heartDemon = Math.max(0, (st.heartDemon || 0) - 10);
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'meridianUnblock', 75, tNow, { casterId: npc.id });
        if (CULT && CULT.MERIDIANS && CULT.MERIDIANS.openNextMeridian) CULT.MERIDIANS.openNextMeridian(npc);
        break;
      case 'EFX_TENACITY_UNYIELDING':
        npc._ccImmuneUntil = tNow + 24;
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'aegisWard', 60, tNow, { casterId: npc.id });
        break;
      case 'EFX_QI_PURITY_REFINEMENT':
        if (npc.cult) {
          npc.cult.toxic = Math.max(0, (npc.cult.toxic || 0) - 15);
          CULT.gain(npc, params.expAdd || 65);
        }
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'qiConduit', 60, tNow, { casterId: npc.id });
        break;
      case 'EFX_CULTIVATION_BURST':
        if (npc.cult) CULT.gain(npc, params.expAdd || 110);
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'mentorGuidance', 90, tNow, { casterId: npc.id });
        break;
      case 'EFX_DANTIAN_EXPANSION':
        npc._dantianBonusPct = Math.min(0.40, (npc._dantianBonusPct || 0) + (params.expandPct || 0.06));
        if (st && npc.cult) st.qi = clamp(Math.round((st.qi || 0) + qm * 0.30), 0, qm);
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'qiConduit', 75, tNow, { casterId: npc.id });
        break;
      case 'EFX_BONE_MARROW_TEMPER':
        if (HC && HC.trainBody) {
          HC.trainBody(npc, 'toughness', 2.5);
          HC.trainBody(npc, 'vitality', 2.5);
          HC.trainBody(npc, 'strength', 1.8);
        }
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'meridianUnblock', 75, tNow, { casterId: npc.id });
        break;
      case 'EFX_BREAKTHROUGH_BOOST':
        npc._btBonusPct = Math.min(0.30, (npc._btBonusPct || 0) + (params.btBonus || 0.08));
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'clarityLotus', 90, tNow, { casterId: npc.id });
        break;
      case 'EFX_BLOODLINE_AWAKEN':
        if (g.SECT && g.SECT.TOTEMS_BLOODLINES && g.SECT.TOTEMS_BLOODLINES.awakenBloodline) {
          g.SECT.TOTEMS_BLOODLINES.awakenBloodline(W, npc, params.bloodlineId);
        } else {
          npc.ancientBloodline = { id: params.bloodlineId || 'IMMORTAL_SOLAR_BLOODLINE', awakened: true, purity: 0.88 };
        }
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'totemBlessing', 120, tNow, { casterId: npc.id });
        break;
      case 'EFX_HEART_DEMON_WARD':
      case 'EFX_HEART_DEMON_PURGE':
        if (st) {
          st.heartDemon = Math.max(0, (st.heartDemon || 0) - (params.cleanseAmt || 25));
          st.stress = Math.max(0, (st.stress || 0) - 15);
        }
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'clarityLotus', 90, tNow, { casterId: npc.id });
        break;
      case 'EFX_LIFESPAN_EXTEND':
      case 'EFX_LONGEVITY_NOURISH':
        npc.lifespanBonusYears = (npc.lifespanBonusYears || 0) + (params.years || 12);
        if (npc.h && npc.h.life && typeof npc.h.life.lifespan === 'number') {
          npc.h.life.lifespan += (params.years || 12);
        }
        if (st) st.hp = hm;
        break;
      case 'EFX_SOUL_NOURISH':
        if (st) {
          st.heartDemon = Math.max(0, (st.heartDemon || 0) - 12);
          st.energy = Math.min(100, (st.energy || 50) + 30);
        }
        if (HC && HC.gainWisdom) HC.gainWisdom(npc, 0.8);
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'starlightAegis', 75, tNow, { casterId: npc.id });
        break;
      case 'EFX_CLEAR_DEBUFFS':
        if (ST) {
          ST.clearStatus(npc, x => ['burn', 'bleed', 'poison', 'slow', 'stun', 'silence', 'weaken', 'blind', 'armorbreak', 'mdefbreak', 'exposed', 'chill', 'fear', 'paralyze', 'root', 'curse', 'ashenToxin', 'radiationBurn', 'stygianFreeze'].includes(x.k));
          if (ST.applyNamedBuff) ST.applyNamedBuff(npc, 'clarityLotus', 60, tNow, { casterId: npc.id });
        }
        break;
      case 'EFX_INJURY_MEND':
        if (Array.isArray(npc.inj) && npc.inj.length > 0) {
          npc.inj = [];
        }
        if (st) st.hp = clamp(Math.round((st.hp || hm) + hm * (params.healPct || 0.25)), 1, hm);
        break;
      case 'EFX_ESCAPE_TELEPORT':
        if (g.EXPLORE && g.EXPLORE.emergencyTeleportToSect) {
          g.EXPLORE.emergencyTeleportToSect(W, npc);
        } else {
          npc.fled = true;
          npc.away = false;
        }
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'voidPhase', 45, tNow, { casterId: npc.id });
        npc.lastEscapeTeleport = { t: tNow, day: (W && W.day) || 0 };
        break;
      case 'EFX_RECON_SIGNAL_JAM':
        npc._signalJamActiveUntil = tNow + 60;
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'shadowVeil', 60, tNow, { casterId: npc.id });
        break;
      case 'EFX_EMERGENCY_BEACON':
        npc._emergencyBeaconActiveUntil = tNow + 60;
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'tacticalCommand', 60, tNow, { casterId: npc.id });
        break;
      case 'EFX_VEIN_ANCHORED':
        npc._veinAnchoredUntil = tNow + 90;
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'aegisWard', 75, tNow, { casterId: npc.id });
        break;
      case 'EFX_UNLOCK_SECT_PATH_MANUAL': {
        const itemDef = (ctx && ctx.itemId && ECO.itemById) ? ECO.itemById[ctx.itemId] : null;
        const rawFromId = (ctx && ctx.itemId && String(ctx.itemId).startsWith('MANUAL_PATH_')) ? String(ctx.itemId).replace(/^MANUAL_PATH_/, '') : null;
        const tPath = (params && params.targetPath) || (itemDef && (itemDef.targetPath || itemDef.path)) || rawFromId || 'XIAN';
        if (W && g.SECT && g.SECT.PATH_LIBRARY && g.SECT.PATH_LIBRARY.unlockPath) {
          g.SECT.PATH_LIBRARY.unlockPath(W, tPath, { byId: npc ? npc.id : null, byNpc: npc, source: 'MANUAL' });
        }
        if (npc && npc.mortalCult) {
          npc.mortalCult.daoComprehension = Math.min(100, (npc.mortalCult.daoComprehension || 0) + ((params && params.comprehensionBonus) || 25));
        }
        break;
      }
      case 'EFX_BESTOW_PATH_CRYSTAL': {
        const itemDef = (ctx && ctx.itemId && ECO.itemById) ? ECO.itemById[ctx.itemId] : null;
        const rawFromId = (ctx && ctx.itemId && String(ctx.itemId).startsWith('CRYSTAL_PATH_')) ? String(ctx.itemId).replace(/^CRYSTAL_PATH_/, '') : null;
        const tPath = (params && params.targetPath) || (itemDef && (itemDef.targetPath || itemDef.path)) || rawFromId || (npc && npc.mortalCult && npc.mortalCult.targetPath) || 'XIAN';
        if (W && g.CULT && g.CULT.MORTAL_INITIATION && g.CULT.MORTAL_INITIATION.bestowPathCrystal) {
          g.CULT.MORTAL_INITIATION.bestowPathCrystal(W, npc, tPath, { free: true, fromConsumable: true });
        }
        break;
      }
      case 'EFX_V200_BODHI_MERIT_PULSE':
      case 'EFX_LEG_BODHI_NIRVANA_ROSARY':
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'bodhiGrace', params.dur || 60, tNow, { casterId: npc.id });
        break;
      case 'EFX_V200_ATAVISM_CLAW_REND':
      case 'EFX_LEG_TAOTIE_DEVOURING_CLAW':
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'atavismFrenzy', params.dur || 50, tNow, { casterId: npc.id });
        break;
      case 'EFX_V200_MERIDIAN_VENOM_NEEDLE':
      case 'EFX_LEG_BAIHUA_SOUL_NEEDLE':
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'marionetteLink', params.dur || 50, tNow, { casterId: npc.id });
        break;
      case 'EFX_V200_TEMPEST_FAN_GALE':
      case 'EFX_LEG_BAJIAO_TEMPEST_FAN':
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'weatherConduct', params.dur || 55, tNow, { casterId: npc.id });
        break;
      case 'EFX_V200_ASTROLABE_STAR_LOCK':
      case 'EFX_LEG_HETU_LUOSHU_ASTROLABE':
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'starDestinyWard', params.dur || 55, tNow, { casterId: npc.id });
        break;
      case 'EFX_V200_ABACUS_LEDGER_SETTLE':
      case 'EFX_LEG_CAISHEN_GOLDEN_ABACUS':
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'tacticalCommand', params.dur || 55, tNow, { casterId: npc.id });
        break;
      case 'EFX_CARGO_PRESERVATION':
      case 'EFX_SUPPLY_EFFICIENCY':
        npc.ext = npc.ext || {};
        npc.ext.cargoPreservationPct = Math.max(npc.ext.cargoPreservationPct || 0, params.preservePct || 0.25);
        npc.ext.supplyEfficiencyPct = Math.max(npc.ext.supplyEfficiencyPct || 0, params.supplyBonusPct || 0.20);
        if (W && W.sect) W.sect.logisticsPreserveBonus = Math.max(W.sect.logisticsPreserveBonus || 0, 0.20);
        break;
      case 'EFX_ECOLOGY_HERB_NURTURE':
      case 'EFX_HERB_POLLINATION':
      case 'EFX_SOIL_PURIFICATION':
        if (W && W.sect) W.sect.herbYieldBonus = Math.min(0.50, (W.sect.herbYieldBonus || 0) + (params.yieldBonus || 0.15));
        if (g.MARTIAL && g.MARTIAL.skillPractice) g.MARTIAL.skillPractice(npc, 'herbalism', 0.5, 1.2);
        break;
      case 'EFX_FORGING_STABILIZATION':
      case 'EFX_V234_CRAFT_HARMONIZER':
        npc.ext = npc.ext || {};
        npc.ext.craftBonusPct = Math.max(npc.ext.craftBonusPct || 0, params.craftBonus || 0.15);
        if (g.MARTIAL && g.MARTIAL.skillPractice) g.MARTIAL.skillPractice(npc, 'FORGING', 0.5, 1.2);
        break;
      case 'EFX_V234_REALM_COMPASS':
      case 'EFX_DETECTION_REVEAL':
      case 'EFX_INTENT_SENSE':
      case 'EFX_TRACE_MARK':
      case 'EFX_STEALTH_CONCEALMENT':
      case 'EFX_SCENT_TRACE_BREAK':
      case 'EFX_SKY_LEVITATION_DRIVE':
      case 'EFX_HASTE_STEP':
      case 'EFX_SIDESTEP_EVASION':
        npc.ext = npc.ext || {};
        npc.ext.explorationCompassBonus = Math.max(npc.ext.explorationCompassBonus || 0, 0.20);
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'shadowVeil', params.dur || 60, tNow, { casterId: npc.id });
        break;
      case 'EFX_CULTIVATION_ACCELERATOR':
      case 'EFX_MEDITATION_ACCEL':
      case 'EFX_MIND_ENLIGHTEN':
      case 'EFX_LEARNING_INSIGHT':
      case 'EFX_CALM_MIND':
      case 'EFX_V234_TRAINING_CATALYST':
      case 'EFX_QI_RESERVOIR':
      case 'EFX_TRIBULATION_SHIELD':
        if (npc.cult) CULT.gain(npc, params.expAdd || 45);
        if (st) st.heartDemon = Math.max(0, (st.heartDemon || 0) - 12);
        npc.insightT = Math.max(npc.insightT || 0, 240);
        if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'clarityLotus', params.dur || 60, tNow, { casterId: npc.id });
        break;
      default: {
        if (!ECO.ALL_RUNTIME_EFFECT_IDS.includes(effectId)) {
          return { ok: false, reason: 'unknown-effect-id', effectId };
        }
        if (/SHIELD|BARRIER|WARD|GUARD|BASTION|AEGIS|IMMUNITY/.test(effectId)) {
          if (ST) {
            ST.addStatus(npc, 'shield', 18, { amt: Math.round(hm * 0.20) }, tNow);
            if (ST.applyNamedBuff) ST.applyNamedBuff(npc, 'aegisWard', params.dur || 50, tNow, { casterId: npc.id });
          }
        } else if (/HEAL|NOURISH|PURGE|PURIFY|LOTUS|HARMONY|RESILIENCE/.test(effectId)) {
          if (st) st.hp = clamp(Math.round((st.hp || hm) + hm * (params.healPct || 0.20)), 1, hm);
          if (ST && ST.applyNamedBuff) ST.applyNamedBuff(npc, 'vitalRegen', params.dur || 50, tNow, { casterId: npc.id });
        } else {
          npc.ext = npc.ext || {};
          npc.ext.activeItemEffects = npc.ext.activeItemEffects || {};
          npc.ext.activeItemEffects[effectId] = { t: tNow, until: tNow + (params.dur || 45), params };
          if (params.grantBuff && ST && ST.applyNamedBuff) {
            ST.applyNamedBuff(npc, params.grantBuff, params.dur || 45, tNow, { casterId: npc.id });
          }
        }
        break;
      }
    }
    if (ST && ST.dirty) ST.dirty(npc);
    npc.lastExecutedItemEffect = { t: tNow, effectId: applied };
    return { ok: true, effectId: applied };
  };

  ECO.verifyItemEffectRuntimeCoverage = () => {
    const supported = new Set(ECO.ALL_RUNTIME_EFFECT_IDS);
    const items = Object.values(ECO.itemById || {});
    const allFound = new Set();
    const missing = [];
    for (const it of items) {
      for (const e of (it.effects || it.fx || [])) {
        const eid = e && (e.effectId || e.id);
        if (!eid) continue;
        allFound.add(eid);
        if (!supported.has(eid)) missing.push({ itemId: it.id, effectId: eid });
      }
    }
    const handled = allFound.size - missing.length;
    return {
      ok: missing.length === 0,
      totalUniqueEffects: allFound.size,
      totalEffectIds: allFound.size,
      supportedCount: handled,
      handledCount: handled,
      unhandledCount: missing.length,
      coveragePct: allFound.size > 0 ? Math.round((handled / allFound.size) * 100) : 100,
      missing
    };
  };

  /* ---------- Section 10.4: Item & Equipment Mechanics (E01-E06) ---------- */
  // E01: Living / Evolving Weapons
  ECO.recordWeaponKill = (W, npc, weapon, victim) => {
    const wpn = weapon || (npc && npc.equip && npc.equip.WEAPON);
    if (!wpn) return null;
    wpn.killTracker = wpn.killTracker || { kills: 0, bossKills: 0, evolutionStage: 0 };
    wpn.killTracker.kills += 1;
    if (victim && (victim.isBoss || (victim.tier || 1) >= 5)) wpn.killTracker.bossKills += 1;
    const nextStage = wpn.killTracker.kills >= 25 ? 3 : (wpn.killTracker.kills >= 10 ? 2 : (wpn.killTracker.kills >= 3 ? 1 : 0));
    if (nextStage > wpn.killTracker.evolutionStage) {
      wpn.killTracker.evolutionStage = nextStage;
      wpn.tier = Math.min(7, (wpn.tier || 1) + 1);
      wpn.q = Math.round(((wpn.q || 1) + 0.08) * 100) / 100;
      delete wpn.st;
      if (g.STATS && g.STATS.gearStats) g.STATS.gearStats(wpn);
      if (npc && g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    }
    return wpn.killTracker;
  };

  // E02: Adaptive / Reactive Armor
  ECO.adaptArmorToElement = (npc, armor, incomingElement) => {
    const arm = armor || (npc && npc.equip && npc.equip.ARMOR);
    if (!arm || !incomingElement) return null;
    const el = String(incomingElement).toUpperCase();
    arm.adaptiveState = arm.adaptiveState || { lastElement: null, stacks: 0, resistBonusPct: 0 };
    if (arm.adaptiveState.lastElement === el) {
      arm.adaptiveState.stacks = Math.min(3, arm.adaptiveState.stacks + 1);
    } else {
      arm.adaptiveState.lastElement = el;
      arm.adaptiveState.stacks = 1;
    }
    arm.adaptiveState.resistBonusPct = +(arm.adaptiveState.stacks * 0.10).toFixed(2);
    return arm.adaptiveState;
  };

  // E03: Paired / Twin Items
  ECO.evaluatePairedItems = npc => {
    if (!npc || !npc.equip) return { active: false, bonusMult: 1.0 };
    const usable = it => !!(it && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(npc, it)));
    const w = usable(npc.equip.WEAPON) ? npc.equip.WEAPON : null;
    const a = usable(npc.equip.ARMOR) ? npc.equip.ARMOR : null;
    const x = usable(npc.equip.ACCESSORY) ? npc.equip.ACCESSORY : null;
    const validEl = el => !!(el && el !== 'NEUTRAL' && el !== 'NONE');
    if (w && x && ((w.pairId && w.pairId === x.pairId) || (w.subpath && w.subpath === x.subpath) || (validEl(w.element) && validEl(x.element) && ((w.element === 'LIGHT_YANG' && (x.element === 'DARK_YIN' || x.element === 'YIN_SHADOW')) || (w.element === 'FIRE' && x.element === 'WATER_ICE') || w.element === x.element)))) {
      return { active: true, pairNameTh: 'ศาสตราคู่ประสานหยินหยาง', bonusMult: 1.16, critBonus: 8, penBonus: 10 };
    }
    if (w && a && w.subpath && w.subpath === a.subpath) {
      return { active: true, pairNameTh: 'ศาสตราเกราะร่วมสายมรรคา', bonusMult: 1.12, critBonus: 5, penBonus: 6 };
    }
    return { active: false, bonusMult: 1.0 };
  };

  // E04: Cursed / Soul-Bound Condition Items
  ECO.evaluateSoulBoundCondition = (npc, item) => {
    if (!npc || !item) return { active: true, powerMult: 1.0, drawbackHpDrainPct: 0 };
    if (item.soulBoundOwnerId && item.soulBoundOwnerId !== npc.id) {
      return { active: false, reason: 'soul-bound-mismatch', powerMult: 0.5, drawbackHpDrainPct: 0.05 };
    }
    if (item.cursed && !item.cursePurified) {
      return { active: true, cursed: true, powerMult: 1.28, drawbackHpDrainPct: 0.03 };
    }
    return { active: true, powerMult: 1.0, drawbackHpDrainPct: 0 };
  };

  // E06: Armed Consumables / Pre-Battle Traps
  ECO.armConsumableTrap = (npc, itemId, triggerOn) => {
    if (!npc || !itemId) return null;
    npc.armedConsumables = Array.isArray(npc.armedConsumables) ? npc.armedConsumables : [];
    const entry = { itemId, triggerOn: triggerOn || 'COMBAT_START', armedAt: (g.STATS && g.STATS.now) || 0, triggered: false };
    npc.armedConsumables.push(entry);
    return entry;
  };

  ECO.triggerArmedConsumables = (W, f, npc, triggerOn) => {
    if (!npc || !Array.isArray(npc.armedConsumables) || !npc.armedConsumables.length) return [];
    const fired = [];
    for (const ac of npc.armedConsumables) {
      if (!ac || ac.triggered) continue;
      if (!triggerOn || ac.triggerOn === triggerOn) {
        const res = ECO.useConsumableItem(W, npc, ac.itemId);
        if (res && res.ok) {
          ac.triggered = true;
          fired.push({ itemId: ac.itemId, res });
        }
      }
    }
    npc.armedConsumables = npc.armedConsumables.filter(ac => ac && !ac.triggered);
    return fired;
  };

  function getHerbStockKeys(W) {
    if (!W || !W.sect || !W.sect.stock) return [];
    return Object.keys(W.sect.stock).filter(k => {
      if (!(W.sect.stock[k] > 0)) return false;
      if (k === 'herb' || k.startsWith('MAT_HERB_') || k.startsWith('MAT_V234_')) return true;
      const m = matById[k];
      return !!(m && (m.category === 'HERB' || m.cat === 'HERB' || m.sub === 'HERB'));
    });
  }
  function countAvailableHerbs(W) {
    return getHerbStockKeys(W).reduce((s, k) => s + (ECO.count(W, k) || 0), 0);
  }
  function consumeSectHerbs(W, needed) {
    if (needed <= 0) return true;
    if (countAvailableHerbs(W) < needed) return false;
    let rem = needed;
    for (const k of getHerbStockKeys(W)) {
      if (rem <= 0) break;
      const have = ECO.count(W, k);
      const takeAmt = Math.min(have, rem);
      if (takeAmt > 0 && ECO.take(W, k, takeAmt)) rem -= takeAmt;
    }
    return rem <= 0;
  }

  /* ---------- Section 11.5: Cross-System Elemental Fusion (Alchemy & Smithing) ---------- */
  ECO.brewMultiphaseElementalPill = (W, alchemist, herbElements, fireElement, opts) => {
    opts = opts || {};
    const els = (Array.isArray(herbElements) ? herbElements : ['FIRE', 'WATER_ICE']).map(e => String(e).toUpperCase());
    const flame = String(fireElement || 'FIRE').toUpperCase();
    const combined = Array.from(new Set(els.concat([flame])));
    if (W && W.sect && !opts.free) {
      const herbNeed = Math.max(2, els.length);
      const stoneNeed = 20;
      if ((W.sect.stones || 0) < stoneNeed) return { ok: false, reason: 'insufficient-stones', required: stoneNeed };
      if (countAvailableHerbs(W) < herbNeed) return { ok: false, reason: 'insufficient-herbs', requiredHerbs: herbNeed };
      if (!consumeSectHerbs(W, herbNeed)) return { ok: false, reason: 'insufficient-herbs' };
      if (!ECO.pay(W, stoneNeed, 'หลอมโอสถปฏิกิริยาธาตุ')) return { ok: false, reason: 'insufficient-stones' };
    }
    const CE = g.COMBAT && g.COMBAT.COMPOSABLE_ENGINE;
    const reactSpec = CE && CE.resolveElementalReactionSpec ? CE.resolveElementalReactionSpec(els, flame) : null;
    const isZeroTox = (els.includes('FIRE') && els.includes('WATER_ICE')) || (els.includes('LIGHT_YANG') && els.includes('DARK_YIN')) || combined.length >= 3;
    const pill = {
      id: 'PILL_V235_FUSION_' + combined.join('_'),
      nameTh: reactSpec ? ('โอสถปฏิกิริยาธาตุ·' + reactSpec.nameTh) : 'โอสถผสานเบญจธาตุบริสุทธิ์',
      tier: Math.min(7, 2 + combined.length),
      out: 'PILL',
      cat: 'PILL',
      kind: 'PILL',
      value: 180 + combined.length * 45,
      elements: combined,
      alchemicalReaction: reactSpec ? reactSpec.id : 'ELEMENTAL_EQUILIBRIUM',
      reactionCode: reactSpec ? reactSpec.code : '2E-01',
      toxicity: isZeroTox ? 0 : 4,
      zeroToxicity: isZeroTox,
      potencyMult: +(1.25 + combined.length * 0.15).toFixed(2),
      healPct: 0.42,
      qiPct: 0.45,
      cultExp: 140 + combined.length * 35,
      grantBuff: combined.includes('LIGHTNING') ? 'meridianOverdrive' : 'alchemicalHarmony',
      phases: [
        { phase: 1, nameTh: 'ระยะที่ 1 · ปราณธาตุประสานฉับพลัน', hpHealPct: 0.40, qiRestorePct: 0.42, cultExpAdd: 95, grantBuff: 'elementalOvercharge', buffDur: 60 },
        { phase: 2, nameTh: 'ระยะที่ 2 · ตกผลึกไร้พิษตกค้าง', delayDays: 1, hpDeltaPct: 0.25, qiDeltaPct: 0.30, cultExpAdd: 165, toxicDelta: -15, grantBuff: 'clarityLotus', buffDur: 90 }
      ]
    };
    ECO.v235ItemById[pill.id] = pill;
    if (ECO.itemById) ECO.itemById[pill.id] = pill;
    if (W && W.sect) {
      ECO._boundWorld = W;
      W.sect.customPills = W.sect.customPills || {};
      W.sect.customPills[pill.id] = pill;
      ECO.add(W, pill.id, 1);
    }
    if (alchemist && g.MARTIAL && g.MARTIAL.skillPractice) {
      g.MARTIAL.skillPractice(alchemist, 'ALCHEMY', 0.25, 1.25);
    }
    return { ok: true, pill, itemId: pill.id, reaction: reactSpec, zeroToxicity: isZeroTox };
  };

  ECO.brewMultiPhaseSpecialtyPill = (W, alchemistOrId, pillIdOrElements, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'invalid-world' };
    const alchemist = (typeof alchemistOrId === 'object' && alchemistOrId)
      ? alchemistOrId
      : (alchemistOrId && W.byId && W.byId[alchemistOrId])
      || (g.SECT && g.SECT.holder && g.SECT.holder(W, 'alchemy'))
      || (W.npcs && W.npcs[0]);

    if (Array.isArray(pillIdOrElements)) {
      return ECO.brewMultiphaseElementalPill(W, alchemist, pillIdOrElements, opts.fireElement || 'FIRE', opts);
    }

    const allMultiPhasePills = Object.values(ECO.itemById || {}).filter(it => it && STATIC_ITEM_IDS.has(it.id) && Array.isArray(it.phases) && it.phases.length >= 2);
    let targetDef = (pillIdOrElements && ECO.getItem(pillIdOrElements, W)) || null;
    if (!targetDef || !Array.isArray(targetDef.phases) || targetDef.phases.length < 2) {
      targetDef = allMultiPhasePills[0] || null;
    }
    if (!targetDef) {
      return ECO.brewMultiphaseElementalPill(W, alchemist, ['FIRE', 'WATER_ICE'], 'FIRE', opts);
    }

    const rawQty = opts.qty != null ? Number(opts.qty) : 1;
    if (!Number.isInteger(rawQty) || rawQty <= 0 || rawQty > 50) return { ok: false, reason: 'invalid-qty' };
    const qty = rawQty;
    const unitHerbCost = opts.free ? 0 : Math.max(2, Number.isFinite(opts.herbCost) && opts.herbCost >= 0 ? Math.ceil(opts.herbCost) : 2);
    const unitStoneCost = opts.free ? 0 : Math.max(25, Number.isFinite(opts.stoneCost) && opts.stoneCost >= 0 ? Math.ceil(opts.stoneCost) : 25);
    const herbCost = unitHerbCost * qty;
    const stoneCost = unitStoneCost * qty;
    if (!opts.free) {
      if ((W.sect.stones || 0) < stoneCost) return { ok: false, reason: 'insufficient-stones', required: stoneCost };
      if (herbCost > 0 && countAvailableHerbs(W) < herbCost) return { ok: false, reason: 'insufficient-herbs', requiredHerbs: herbCost };
      if (herbCost > 0 && !consumeSectHerbs(W, herbCost)) return { ok: false, reason: 'insufficient-herbs', requiredHerbs: herbCost };
      if (stoneCost > 0) {
        if (!ECO.pay(W, stoneCost, 'เดินเตาหลอมโอสถสองระยะ「' + targetDef.nameTh + '」')) {
          return { ok: false, reason: 'insufficient-stones', required: stoneCost };
        }
        W.world = W.world || {};
        W.world.resourcePool = W.world.resourcePool || { stones: 50000, herbs: 5000, ores: 5000 };
        W.world.resourcePool.stones += stoneCost;
      }
    }

    ECO.add(W, targetDef.id, qty);
    W.sect.customPills = W.sect.customPills || {};
    W.sect.customPills[targetDef.id] = targetDef;

    if (alchemist && g.MARTIAL && g.MARTIAL.skillPractice) {
      g.MARTIAL.skillPractice(alchemist, 'ALCHEMY', 0.30, 1.30);
    }

    let useResult = null;
    if (opts.consumeForNpc) {
      const consumer = typeof opts.consumeForNpc === 'object' ? opts.consumeForNpc : (W.byId && W.byId[opts.consumeForNpc]);
      if (consumer) {
        useResult = ECO.useConsumableItem(W, consumer, targetDef.id, { now: W.t, day: W.day });
      }
    }

    return {
      ok: true,
      pillId: targetDef.id,
      pill: targetDef,
      qtyBrewed: qty,
      stockCount: ECO.count(W, targetDef.id),
      alchemistId: alchemist ? alchemist.id : null,
      totalCatalogMultiPhasePills: allMultiPhasePills.length,
      useResult
    };
  };

  ECO.socketElementalRunes = (W, smith, gear, runeElements, opts) => {
    opts = opts || {};
    if (!gear || !Array.isArray(runeElements) || !runeElements.length) return { ok: false, reason: 'invalid-gear-or-runes' };
    const els = runeElements.map(e => String(e).toUpperCase()).slice(0, 4);
    if (Array.isArray(gear.elementalSockets) && gear.elementalSockets.join(',') === els.join(',')) {
      return { ok: false, reason: 'duplicate-runes', gear, embeddedReaction: gear.embeddedReaction };
    }
    if (W && W.sect && !opts.free) {
      const stoneCost = 15 * els.length;
      const matKeys = Object.keys(W.sect.stock || {}).filter(k => k !== 'grain' && k !== 'meal' && !ECO.isPill(k) && (W.sect.stock[k] || 0) > 0);
      if ((W.sect.stones || 0) < stoneCost || !matKeys.length) {
        return { ok: false, reason: 'insufficient-resources', requiredStones: stoneCost };
      }
      if (!ECO.take(W, matKeys[0], 1)) return { ok: false, reason: 'insufficient-resources' };
      if (!ECO.pay(W, stoneCost, 'สลักอักขระรูนธาตุลงศาสตรา')) {
        ECO.add(W, matKeys[0], 1);
        return { ok: false, reason: 'insufficient-resources' };
      }
    }
    const CE = g.COMBAT && g.COMBAT.COMPOSABLE_ENGINE;
    const catalyst = els[els.length - 1];
    const primers = els.slice(0, -1);
    const reactSpec = (CE && CE.resolveElementalReactionSpec && primers.length)
      ? CE.resolveElementalReactionSpec(primers, catalyst)
      : null;
    gear.elementalSockets = els;
    gear.embeddedReaction = reactSpec ? {
      code: reactSpec.code,
      id: reactSpec.id,
      nameTh: reactSpec.nameTh,
      mult: reactSpec.mult,
      elements: reactSpec.elements
    } : {
      code: '2E-01',
      id: 'THERMAL_VAPORIZE',
      nameTh: 'ไอน้ำระเบิดปราณ',
      mult: 1.75,
      elements: els
    };
    gear.skillModifiers = (Array.isArray(gear.skillModifiers) ? gear.skillModifiers : []).filter(m => !(m && (m._fromRuneSocket || m.addElementalFusion)));
    gear.skillModifiers.push({
      _fromRuneSocket: true,
      element: catalyst,
      matchElement: catalyst,
      multPct: 0.18,
      penAdd: 10,
      critAdd: 6,
      addElementalFusion: gear.embeddedReaction.id
    });
    gear._modVer = (gear._modVer || 0) + 1;
    gear.effects = (Array.isArray(gear.effects) ? gear.effects : []).filter(e => !(e && e.effectId === 'EFX_V234_ELEMENTAL_REACTOR'));
    gear.effects.push({ effectId: 'EFX_V234_ELEMENTAL_REACTOR', params: { reaction: gear.embeddedReaction.id, bonusMult: 0.24 } });
    delete gear.st;
    if (g.STATS && g.STATS.gearStats) g.STATS.gearStats(gear);
    if (smith) {
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(smith);
      if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(smith);
    }
    return { ok: true, gear, embeddedReaction: gear.embeddedReaction };
  };

  ECO.useConsumableItem = (W, npc, itemId, opts) => {
    opts = opts || {};
    const def = ECO.getItem(itemId, W) || (String(itemId || '').startsWith('P:') && ECO.pillInfo(itemId) ? { id: itemId, nameTh: ECO.name(itemId), kind: 'PILL', cultExp: (ECO.pillInfo(itemId).effect && ECO.pillInfo(itemId).effect.cultivationProgress) || 25 } : null);
    if (!def || !npc) return { ok: false, reason: 'item-or-npc-missing' };
    const st = npc.h && npc.h.state;
    const dayNow = opts.day != null ? opts.day : ((W && W.day) || 0);
    const tNow = opts.now != null ? opts.now : ((W && W.t != null) ? W.t : ((W && W.now) || 0));

    npc.ext = npc.ext || {};
    npc.ext.talismanCharges = npc.ext.talismanCharges || {};
    let remainingCharges = null;
    let consumedItem = true;
    const takeFromOwnerOrSect = () => {
      if (opts.free) return true;
      if (npc.inv && npc.inv.pills && npc.inv.pills[itemId] > 0) {
        npc.inv.pills[itemId] -= 1;
        const remP = npc.inv.pills[itemId] || 0;
        if (remP <= 0) delete npc.inv.pills[itemId];
        if (npc.inv.spawnedPills && npc.inv.spawnedPills[itemId] > remP) {
          npc.inv.spawnedPills[itemId] = remP;
          if (npc.inv.spawnedPills[itemId] <= 0) delete npc.inv.spawnedPills[itemId];
        }
        return true;
      }
      if (npc.inv && npc.inv.mats && npc.inv.mats[itemId] > 0) {
        npc.inv.mats[itemId] -= 1;
        const remM = npc.inv.mats[itemId] || 0;
        if (remM <= 0) delete npc.inv.mats[itemId];
        if (npc.inv.spawnedMats && npc.inv.spawnedMats[itemId] > remM) {
          npc.inv.spawnedMats[itemId] = remM;
          if (npc.inv.spawnedMats[itemId] <= 0) delete npc.inv.spawnedMats[itemId];
        }
        return true;
      }
      if (W && W.sect && ECO.count(W, itemId) > 0 && ECO.take(W, itemId, 1)) return true;
      return false;
    };
    if (typeof def.maxCharges === 'number' && def.maxCharges > 1) {
      if (npc.ext.talismanCharges[itemId] == null) {
        if (!takeFromOwnerOrSect()) return { ok: false, reason: 'out-of-stock' };
        npc.ext.talismanCharges[itemId] = def.maxCharges;
      }
      npc.ext.talismanCharges[itemId] -= 1;
      remainingCharges = npc.ext.talismanCharges[itemId];
      if (remainingCharges > 0) {
        consumedItem = false;
      } else {
        delete npc.ext.talismanCharges[itemId];
        consumedItem = true;
      }
    } else {
      if (!takeFromOwnerOrSect()) return { ok: false, reason: 'out-of-stock' };
    }
    if (npc.daoOath && npc.daoOath.upheld && (npc.daoOath.id === 'VOW_ABSTAIN_PILLS' || npc.daoOath.id === 'VEGETARIAN_PACIFIST') && g.CULT && g.CULT.breakOathVow) {
      const isPillItem = String(itemId || '').startsWith('P:') || String(itemId || '').includes('PILL') || def.kind === 'PILL' || def.out === 'PILL' || (def.cultExp > 0);
      if (isPillItem) g.CULT.breakOathVow(W, npc, 'ใช้โอสถเพิ่มตบะละเมิดสัตย์สาบานแห่งมรรคา');
    }

    if (st) {
      if (def.healPct) {
        const hm = CULT.hpMax(npc);
        st.hp = clamp(Math.round((st.hp || hm) + hm * def.healPct), 1, hm);
      }
      if (def.qiPct && npc.cult) {
        const qm = CULT.qiMax(npc);
        st.qi = clamp(Math.round((st.qi || 0) + qm * def.qiPct), 0, qm);
      }
    }
    if (def.cultExp && npc.cult) {
      CULT.gain(npc, def.cultExp);
    }
    if (def.grantBuff && g.STATS && g.STATS.applyNamedBuff) {
      g.STATS.applyNamedBuff(npc, def.grantBuff, def.buffDur || 60, tNow, { casterId: npc.id, source: itemId });
    }

    // Execute all attached item effectIds!
    const executedEffects = [];
    for (const efx of (def.effects || def.fx || [])) {
      if (efx && efx.effectId) {
        ECO.executeItemEffectById(W, npc, efx.effectId, efx.params || {}, { now: tNow, day: dayNow, itemId: def.id });
        executedEffects.push(efx.effectId);
      }
    }

    let multiPhaseQueued = false;
    if (Array.isArray(def.phases) && def.phases.length >= 2) {
      const p1 = def.phases[0] || {};
      const p2 = def.phases[1] || {};
      if (st && p1.hpHealPct) {
        const hm = CULT.hpMax(npc);
        st.hp = clamp(Math.round((st.hp || hm) + hm * p1.hpHealPct), 1, hm);
      }
      if (st && p1.qiRestorePct && npc.cult) {
        const qm = CULT.qiMax(npc);
        st.qi = clamp(Math.round((st.qi || 0) + qm * p1.qiRestorePct), 0, qm);
      }
      if (p1.cultExpAdd && npc.cult) CULT.gain(npc, p1.cultExpAdd);
      if (p1.grantBuff && g.STATS && g.STATS.applyNamedBuff) {
        g.STATS.applyNamedBuff(npc, p1.grantBuff, p1.buffDur || 60, tNow, { casterId: npc.id, source: itemId });
      }
      npc.ext.multiPhasePills = Array.isArray(npc.ext.multiPhasePills) ? npc.ext.multiPhasePills : [];
      const delayDays = p2.delayDays != null ? p2.delayDays : 1;
      const delayTicks = p2.delayTicks != null ? p2.delayTicks : (delayDays * 1440);
      npc.ext.multiPhasePills.push({
        itemId: def.id,
        nameTh: def.nameTh,
        startedDay: dayNow,
        startedTick: tNow,
        delayDays,
        triggerDay: dayNow + delayDays,
        triggerMin: 0,
        triggerTick: tNow + delayTicks,
        phase2: p2,
        resolved: false
      });
      multiPhaseQueued = true;
    }

    HC.bump(npc);
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return { ok: true, itemId: def.id, consumedItem, remainingCharges, multiPhaseQueued, executedEffects };
  };

  Object.keys(ECO.itemById).forEach(k => STATIC_ITEM_IDS.add(k));
  Object.keys(ECO.v235ItemById || {}).forEach(k => STATIC_ITEM_IDS.add(k));
  g.ECO = ECO;
  if (typeof module === 'object' && module.exports) module.exports = ECO;
})(typeof globalThis !== 'undefined' ? globalThis : this);
