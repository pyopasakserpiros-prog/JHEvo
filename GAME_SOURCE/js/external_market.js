/* external_market.js — direct trade between the sect, its members, and visiting merchants.
 * Contribution points remain an internal sect currency. Every outside transaction settles in spirit stones. */
(function (g) {
  'use strict';
  const U = g.U, HC = g.HC, CULT = g.CULT, ECO = g.ECO, JD = g.JD, AI = g.AI, SECT = g.SECT;
  const clamp = U.clamp, E = (n, p) => HC.eff(n, p);
  const EXT = { VERSION: 1 };
  const BASIC_PILLS = new Set((JD.CP.BASIC || []).map(r => 'P:' + r.id));
  const TRADER_NAMES = {
    general: ['หลี่กวง', 'หานจื่อ', 'ซ่งเหอ', 'เฉินอวี้', 'หลัวชิง'],
    medicine: ['หมอพเนจรอู๋', 'เซียนโอสถหลิน', 'เถ้าแก่ยาเจียง', 'ผู้อาวุโสยาเร้นลับหวัง'],
    caravan: ['หัวหน้าคาราวานกัว', 'พ่อค้าหยาง', 'ผู้คุมเกวียนจ้าว', 'นายวาณิชเจ็ดสมบัติเฉียน'],
    rare: ['นายหน้าหอประมูลจิน', 'พ่อค้าสมบัติเร้นลับมู่', 'ยอดวาณิชแดนไกลไป๋']
  };
  const TRADER_TYPES = ['general', 'medicine', 'caravan', 'rare'];

  EXT.ensure = W => {
    if (!W.world) W.world = { sects: [], expeds: [], seq: 0, visitors: [] };
    if (!Array.isArray(W.world.visitors)) W.world.visitors = [];
    if (!Array.isArray(W.world.tradeHistory)) W.world.tradeHistory = [];
    if (!W.world.marketStats || typeof W.world.marketStats !== 'object') W.world.marketStats = {};
    const s = W.world.marketStats;
    ['visits', 'sectBought', 'sectSold', 'memberBought', 'memberSold', 'sectStonesIn', 'sectStonesOut', 'memberStonesIn', 'memberStonesOut', 'seq'].forEach(k => { if (!Number.isFinite(s[k]) || s[k] < 0) s[k] = 0; });
    return s;
  };

  EXT.isTradable = id => {
    if (!id || typeof id !== 'string') return false;
    if (id === 'grain' || id === 'meal') return true;
    if (ECO.isPill(id)) return !!ECO.pillInfo(id);
    if (ECO.matById[id]) return true;
    if (g.CONTENT && g.CONTENT.organById && g.CONTENT.organById[id]) return true;
    if (id.startsWith('ORGAN:')) {
      const oid = id.slice(6);
      return !!(g.CONTENT && g.CONTENT.organById && g.CONTENT.organById[oid]);
    }
    const cleanKey = id.startsWith('CRYSTAL:') ? id.slice(8) : id;
    if (g.MARTIAL && g.MARTIAL.knowledge && g.MARTIAL.knowledge(cleanKey)) return true;
    if (id.startsWith('TECH_MANUAL:') || id.startsWith('TM:')) {
      const tid = id.replace(/^(TECH_MANUAL:|TM:)/, '');
      return !!(CULT && CULT.tech(tid));
    }
    if (id.startsWith('SUB_MANUAL:') || id.startsWith('SM:')) {
      const sid = id.replace(/^(SUB_MANUAL:|SM:)/, '');
      return !!(CULT && (CULT.trackDef(sid) || (CULT.subList && CULT.subList.some(x => x.sub && x.sub.id === sid))));
    }
    if (id.startsWith('RECIPE_SCROLL:') || id.startsWith('FORMULA:') || id.startsWith('R:')) {
      const rid = id.replace(/^(RECIPE_SCROLL:|FORMULA:|R:)/, '');
      return !!(ECO.recipeById && ECO.recipeById[rid]);
    }
    if (id.startsWith('EQ:')) {
      const eqId = id.slice(3);
      return !!(ECO.itemById && ECO.itemById[eqId]);
    }
    if (ECO.itemById && ECO.itemById[id]) return true;
    return false;
  };
  EXT.activeVisitors = W => {
    const visitors = W && W.world && Array.isArray(W.world.visitors) ? W.world.visitors : [];
    return visitors.filter(v => v && v.kind === 'trader' && Number.isFinite(v.untilDay) && v.untilDay >= W.day && Number.isFinite(v.stones) && v.stones >= 0);
  };
  EXT.basePrice = (W, id) => {
    if (!id || typeof id !== 'string') return 0;
    if (id === 'grain') return ECO.GRAIN_PRICE || 3;
    if (id === 'meal') return 1.2;
    if (ECO.matById[id]) return ECO.matById[id].value || 5;
    if (ECO.isPill(id)) {
      const r = ECO.recipeById[id.slice(2)];
      return r ? 14 * Math.pow(2.05, (r.tier || 1) - 1) : 10;
    }
    const organId = id.startsWith('ORGAN:') ? id.slice(6) : id;
    if (g.CONTENT && g.CONTENT.organById && g.CONTENT.organById[organId]) {
      const o = g.CONTENT.organById[organId];
      return Math.round(20 * Math.pow(1.85, (o.tier || 1) - 1));
    }
    const cleanKey = id.startsWith('CRYSTAL:') ? id.slice(8) : id;
    if (g.MARTIAL && g.MARTIAL.knowledge) {
      const k = g.MARTIAL.knowledge(cleanKey);
      if (k) {
        if (k.kind === 'sub') return Math.round(45 + 30 * k.tier * k.tier);
        return Math.round(18 * Math.pow(k.tier, 2) * (k.legendary ? 2.5 : 1));
      }
    }
    if (id.startsWith('TECH_MANUAL:') || id.startsWith('TM:')) {
      const tid = id.replace(/^(TECH_MANUAL:|TM:)/, '');
      const t = CULT && CULT.tech(tid);
      if (t) return Math.round(40 * Math.pow(t.tier || 1, 2.2) * (t.legendary ? 3 : 1));
    }
    if (id.startsWith('SUB_MANUAL:') || id.startsWith('SM:')) {
      const sid = id.replace(/^(SUB_MANUAL:|SM:)/, '');
      const s = CULT && (CULT.trackDef(sid) || (CULT.subList && (CULT.subList.find(x => x.sub && x.sub.id === sid) || {}).sub));
      if (s) return Math.round(120 + 80 * (s.tier || 1) * (s.tier || 1));
    }
    if (id.startsWith('RECIPE_SCROLL:') || id.startsWith('FORMULA:') || id.startsWith('R:')) {
      const rid = id.replace(/^(RECIPE_SCROLL:|FORMULA:|R:)/, '');
      const r = ECO.recipeById && ECO.recipeById[rid];
      if (r) return Math.round(30 * Math.pow(2, (r.tier || 1) - 1));
    }
    if (id.startsWith('EQ:')) {
      const eqId = id.slice(3);
      const it = ECO.itemById && ECO.itemById[eqId];
      if (it) return it.value || Math.round(25 * Math.pow(1.9, (it.tier || 1) - 1));
    }
    if (ECO.itemById && ECO.itemById[id]) {
      const it = ECO.itemById[id];
      return it.value || Math.round(25 * Math.pow(1.9, (it.tier || 1) - 1));
    }
    return ECO.base(id) || 5;
  };
  EXT.quotePrice = (W, id, side, skill) => {
    if (!EXT.isTradable(id)) return 0;
    const base = (EXT.basePrice(W, id) || ECO.price(W, id)) * ((W.market && W.market.mult[id]) || 1);
    if (!Number.isFinite(base) || base <= 0) return 0;
    skill = clamp(Number.isFinite(skill) ? skill : 40, 0, 100);
    let mult = 1;
    if (side === 'sect-buy') mult = 1.15 - skill / 850;          // sect buys at a modest premium
    else if (side === 'sect-sell') mult = 0.78 + skill / 900;   // sect sells below retail
    else if (side === 'member-buy') mult = 1.18;
    else if (side === 'member-sell') mult = 0.76;
    return Math.max(1, Math.round(base * clamp(mult, 0.65, 1.2)));
  };

  function pickMaterial(W, excluded, maxTier) {
    const pool = Object.values(ECO.matById).filter(m => EXT.isTradable(m.id) && !excluded.has(m.id) && (maxTier == null || (m.tier || 1) <= maxTier));
    return pool.length ? W.rng.pick(pool).id : null;
  }
  function addStock(W, stock, id, min, max) {
    if (!id || !EXT.isTradable(id)) return;
    const q = W.rng.int(min, max);
    stock[id] = (stock[id] || 0) + q;
  }
  function buildStock(W, subtype) {
    const stock = {}, used = new Set();
    // First preference: items the treasury has explicitly requested.
    (W.sect.buyList || []).slice(0, 3).forEach(b => {
      if (!b || !EXT.isTradable(b.id) || used.has(b.id) || !W.rng.chance(0.78)) return;
      addStock(W, stock, b.id, 2, Math.max(3, Math.min(12, Math.ceil(b.n || 4)))); used.add(b.id);
    });
    if (!used.has('grain')) { addStock(W, stock, 'grain', 12, 34); used.add('grain'); }
    if (W.rng.chance(0.42) && !used.has('meal')) { addStock(W, stock, 'meal', 6, 18); used.add('meal'); }
    const maxT = subtype === 'rare' ? 6 : subtype === 'caravan' ? 4 : 3;
    while (used.size < 4) {
      const id = pickMaterial(W, used, maxT); if (!id) break;
      addStock(W, stock, id, 2, 7); used.add(id);
    }
    if (subtype === 'medicine' || subtype === 'rare' || W.rng.chance(0.35)) {
      const pills = Object.keys(ECO.recipeById || {})
        .map(rid => 'P:' + rid)
        .filter(k => EXT.isTradable(k) && (subtype !== 'general' || BASIC_PILLS.has(k)));
      if (pills.length) { const id = W.rng.pick(pills); addStock(W, stock, id, 1, subtype === 'medicine' ? 4 : 2); }
    }
    if ((subtype === 'rare' || subtype === 'caravan') && W.rng.chance(0.35)) {
      const pool = (g.JD && g.JD.TECH && Array.isArray(g.JD.TECH.techniques) ? g.JD.TECH.techniques : []).filter(t => t && !t.innateOnly && t.tier <= (subtype === 'rare' ? 5 : 3));
      if (pool.length) {
        const t = W.rng.pick(pool);
        addStock(W, stock, 'TECH_MANUAL:' + t.id, 1, 2);
      }
    }
    if (subtype === 'medicine' && g.CONTENT && g.CONTENT.rareOrgans && W.rng.chance(0.3)) {
      const org = W.rng.pick(g.CONTENT.rareOrgans);
      if (org) addStock(W, stock, org.id, 1, 2);
    }
    const stonePool = subtype === 'rare'
      ? ['ITEM_REPAIR_STONE_3', 'ITEM_REPAIR_STONE_4']
      : subtype === 'caravan'
        ? ['ITEM_REPAIR_STONE_2', 'ITEM_REPAIR_STONE_3']
        : ['ITEM_REPAIR_STONE_1', 'ITEM_REPAIR_STONE_2'];
    const stPick = W.rng.pick(stonePool);
    if (stPick && EXT.isTradable(stPick)) addStock(W, stock, stPick, 1, subtype === 'rare' ? 2 : 3);
    return stock;
  }
  function buildWants(W, stock, subtype) {
    const wants = {}, used = new Set(Object.keys(stock));
    // Traders seek materials and remedies that the sect has in surplus above reserve floor
    const surplus = Object.keys(W.sect.stock || {}).filter(id => {
      if (!EXT.isTradable(id) || BASIC_PILLS.has(id) || used.has(id)) return false;
      const count = ECO.count(W, id);
      const res = EXT.reserveForSect(W, id);
      if (count <= res + 1) return false;
      if (subtype === 'general') {
        const m = ECO.matById[id];
        if (m && (m.tier || 1) > 3) return false;
      }
      return true;
    });
    surplus.sort((a, b) => (ECO.count(W, b) - EXT.reserveForSect(W, b)) - (ECO.count(W, a) - EXT.reserveForSect(W, a)));
    surplus.slice(0, 3).forEach(id => {
      const m = ECO.matById[id];
      const tier = m ? m.tier || 1 : 2;
      const maxWant = tier >= 5 ? 2 : tier >= 3 ? 4 : 7;
      wants[id] = W.rng.int(1, maxWant);
      used.add(id);
    });
    if ((subtype === 'rare' || subtype === 'caravan') && W.sect.surplusTechManuals && W.sect.surplusTechManuals.length > 0) {
      const sm = W.sect.surplusTechManuals.find(m => !(W.sect.spawnedSurplusTech && W.sect.spawnedSurplusTech.includes(m)));
      if (sm) { wants['TECH_MANUAL:' + sm] = 1; used.add('TECH_MANUAL:' + sm); }
    }
    if ((subtype === 'rare' || subtype === 'caravan') && W.sect.surplusSubManuals && W.sect.surplusSubManuals.length > 0) {
      const ssm = W.sect.surplusSubManuals.find(m => !(W.sect.spawnedSurplusSub && W.sect.spawnedSurplusSub.includes(m)));
      if (ssm) { wants['SUB_MANUAL:' + ssm] = 1; used.add('SUB_MANUAL:' + ssm); }
    }
    if ((subtype === 'medicine' || subtype === 'rare') && g.CONTENT && W.sect.organs) {
      for (const oid of Object.keys(W.sect.organs)) {
        if (g.CONTENT.organCount(W, oid) > 2) { wants[oid] = 1; used.add(oid); break; }
      }
    }
    const targetWantsCount = subtype === 'rare' ? 4 : 5;
    while (Object.keys(wants).length < targetWantsCount) {
      let id = null;
      if (subtype === 'medicine' || subtype === 'rare' || W.rng.chance(0.25)) {
        const pills = Object.keys(ECO.recipeById || {})
          .map(rid => 'P:' + rid)
          .filter(k => EXT.isTradable(k) && !used.has(k) && (subtype !== 'general' || BASIC_PILLS.has(k)));
        if (pills.length) id = W.rng.pick(pills);
      }
      if (!id) {
        const maxTier = subtype === 'rare' ? 7 : subtype === 'caravan' ? 5 : 3;
        id = pickMaterial(W, used, maxTier);
      }
      if (!id) break;
      const m = ECO.matById[id];
      const tier = m ? m.tier || 1 : 2;
      const maxWant = tier >= 5 ? 2 : tier >= 3 ? 4 : 6;
      wants[id] = W.rng.int(1, maxWant);
      used.add(id);
    }
    return wants;
  }

  EXT.openVisit = (W, options) => {
    options = options || {};
    const stats = EXT.ensure(W), subtype = TRADER_TYPES.includes(options.subtype) ? options.subtype : W.rng.pick(TRADER_TYPES);
    const seq = ++stats.seq;
    const nameList = TRADER_NAMES[subtype] || TRADER_NAMES.general;
    const stock = options.stock && typeof options.stock === 'object' ? Object.assign({}, options.stock) : buildStock(W, subtype);
    const wants = options.wants && typeof options.wants === 'object' ? Object.assign({}, options.wants) : buildWants(W, stock, subtype);
    Object.keys(stock).forEach(id => { if (!EXT.isTradable(id) || !Number.isSafeInteger(stock[id]) || stock[id] <= 0) delete stock[id]; });
    Object.keys(wants).forEach(id => { if (!EXT.isTradable(id) || !Number.isSafeInteger(wants[id]) || wants[id] <= 0 || stock[id] > 0) delete wants[id]; });
    const defaultStones = subtype === 'rare' ? W.rng.int(1200, 3000) : subtype === 'caravan' ? W.rng.int(550, 1400) : W.rng.int(280, 850);
    const gearStock = Array.isArray(options.gearStock) ? options.gearStock.slice() : [];
    if (!options.stock && !options.gearStock && ECO && ECO.rollProceduralGear && (subtype === 'caravan' || subtype === 'rare' || W.rng.chance(0.55))) {
      const gCount = subtype === 'rare' ? 2 : 1;
      const maxGTier = subtype === 'rare' ? 4 : subtype === 'caravan' ? 3 : 2;
      for (let gi = 0; gi < gCount; gi++) {
        gearStock.push(ECO.rollProceduralGear(W, { maxTier: maxGTier, minTier: subtype === 'rare' ? 2 : 1, source: 'merchant:' + subtype }));
      }
    }
    const visitor = {
      id: options.id || ('trader_' + seq), kind: 'trader', subtype,
      nameTh: options.nameTh || W.rng.pick(nameList),
      arriveDay: W.day,
      untilDay: Number.isFinite(options.untilDay) ? options.untilDay : W.day + clamp(Math.round(options.stayDays || 2), 1, 4),
      stones: Number.isFinite(options.stones) ? Math.max(0, Math.round(options.stones)) : defaultStones,
      stock, gearStock, wants, sectTradeDay: null, sectBuyDone: false, tradeCount: 0
    };
    W.world.visitors.push(visitor);
    stats.visits++;
    W.log('event', visitor.nameTh + ' นำสินค้าเข้าแวะตลาดสำนัก (' + Object.values(stock).reduce((s, n) => s + n, 0) + ' หน่วย)', []);
    return visitor;
  };

  EXT.reserveForSect = (W, id) => {
    const floor = ECO.reserveFloor ? ECO.reserveFloor(W, id) : 2;
    const pop = Math.max(1, W.npcs ? W.npcs.filter(n => !n.dead && !n.exiled).length : 1);
    let base = floor;
    if (id === 'grain') base = Math.max(floor, pop * 14);
    else if (id === 'meal') base = Math.max(floor, pop * 2);
    else if (BASIC_PILLS.has(id)) base = Math.max(floor, Math.ceil(pop * 0.15));
    else if (ECO.isPill(id)) {
      base = Math.max(floor, 2);
    } else {
      const isRecipeInput = (W.sect.knownRecipes || []).some(rid => {
        const r = ECO.recipeById[rid];
        return r && r.inputs && r.inputs.some(inp => inp.matId === id);
      });
      const extraReserve = isRecipeInput ? 4 : 0;
      base = Math.max(floor + extraReserve, Math.floor((g.CPE ? g.CPE.target(W, id) : 8) * 0.6));
    }
    return base;
  };
  function treasurySkill(W) {
    const tr = SECT.holder(W, 'treasury') || W.byId[W.sect.masterId];
    return tr ? clamp((E(tr, 'intellect.numeracy') + E(tr, 'aptitudes.socialCommerce') + (tr.h.skills.trading || 0)) / 3, 0, 100) : 40;
  }
  function purchaseNeeds(W, v) {
    const out = [], seen = new Set();
    const add = (id, n, priority, reason) => {
      if (!id || seen.has(id) || !EXT.isTradable(id) || !(v.stock[id] > 0)) return;
      const q = Math.max(0, Math.floor(n)); if (!q) return;
      seen.add(id); out.push({ id, n: q, priority: priority || 0, reason: reason || 'ความต้องการตามแผนงานสำนัก' });
    };
    // 1. Direct shortages from shortageDirectives (provisions, emergency medicines, hall inputs, bottlenecks)
    (W.sect.shortageDirectives || []).slice(0, 8).forEach(sd => {
      if (!sd || !EXT.isTradable(sd.id)) return;
      const pri = sd.priority === 'critical' ? 20 : sd.priority === 'high' ? 14 : 8;
      add(sd.id, sd.deficit, pri, sd.reason);
    });
    // 2. Caravan buy list
    (W.sect.buyList || []).slice(0, 6).forEach(b => {
      if (!b || !EXT.isTradable(b.id)) return;
      add(b.id, b.n, 10 + (b.id === 'grain' ? 3 : 0), 'รายการสั่งซื้อของหอคลัง');
    });
    // 3. Member demand: inspect stock for items needed by alive sect members
    const npcs = (W.npcs || []).filter(n => !n.dead && !n.exiled && !n.away);
    Object.keys(v.stock).forEach(id => {
      if (seen.has(id) || !EXT.isTradable(id)) return;
      // Member needs for knowledge / crystals
      const cleanKey = id.startsWith('CRYSTAL:') ? id.slice(8) : id;
      if (g.MARTIAL && g.MARTIAL.knowledge && g.MARTIAL.knowledge(cleanKey)) {
        const k = g.MARTIAL.knowledge(cleanKey);
        const known = k.kind === 'sub' ? (W.sect.subLibrary || []).includes(k.id) : (W.sect.library || []).includes(k.id);
        const eligibleCount = npcs.filter(n => g.MARTIAL.eligible(n, cleanKey).ok).length;
        if (!known && eligibleCount > 0) {
          add(id, 1, 16 + eligibleCount, 'ศิษย์ในสำนัก ' + eligibleCount + ' คนตรงเกณฑ์ศึกษาและยังไม่มีในหอคัมภีร์');
        } else if (known && eligibleCount > 0 && ((W.sect.crystals && W.sect.crystals[cleanKey]) || 0) < 1) {
          add(id, 1, 9, 'ผลึกช่วยร่นเวลาศึกษาสำหรับศิษย์ที่ตรงสาย');
        }
      }
      if (id.startsWith('TECH_MANUAL:') || id.startsWith('TM:')) {
        const tid = id.replace(/^(TECH_MANUAL:|TM:)/, '');
        if (!(W.sect.library || []).includes(tid)) {
          const learners = npcs.filter(n => n.cult && CULT.learnable(n, [tid]).length > 0).length;
          if (learners > 0) add(id, 1, 16 + learners, 'คัมภีร์วิชาที่ศิษย์ ' + learners + ' คนกำลังต้องการ');
        }
      }
      if (id.startsWith('RECIPE_SCROLL:') || id.startsWith('FORMULA:') || id.startsWith('R:')) {
        const rid = id.replace(/^(RECIPE_SCROLL:|FORMULA:|R:)/, '');
        if (!(W.sect.knownRecipes || []).includes(rid)) {
          add(id, 1, 15, 'ม้วนตำรับหลอมศาสตรา/โอสถที่สำนักยังไม่มี');
        }
      }
      if (id.startsWith('EQ:')) {
        const eqId = id.slice(3);
        const it = ECO.itemById && ECO.itemById[eqId];
        if (it && g.MARTIAL && g.MARTIAL.classifyGearForNpc) {
          const upgraders = npcs.filter(n => n.cult && g.MARTIAL.classifyGearForNpc(W, n, it, 0).category === 'useful-now').length;
          if (upgraders > 0) add(id, Math.min(upgraders, v.stock[id] || 1), 15 + upgraders, 'ศาสตรา/อุปกรณ์ตรงสายสำหรับศิษย์ ' + upgraders + ' คน');
        }
      }
      // Member needs for emergency pills
      if (ECO.isPill(id)) {
        const needy = npcs.filter(n => pillNeed(n, id) > 0).length;
        if (needy > 0) {
          add(id, Math.min(needy, 4), 15 + needy, 'โอสถจำเป็นเร่งด่วนสำหรับศิษย์บาดเจ็บ/ปราณพร่อง (' + needy + ' คน)');
        }
      }
    });
    // 4. Fallback scan of trader inventory for critical shortages
    Object.keys(v.stock).forEach(id => {
      if (!EXT.isTradable(id) || seen.has(id)) return;
      const count = ECO.count(W, id);
      const res = EXT.reserveForSect(W, id);
      if (count < res * 0.4) {
        add(id, Math.min(4, Math.ceil(res - count)), 6 + (res - count) / Math.max(1, res), 'สต็อกต่ำกว่า 40% ของเกณฑ์สำรอง');
      }
    });
    return out.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }
  function record(W, visitor, side, id, qty, unitPrice, total, npc, reason) {
    const stats = EXT.ensure(W), history = W.world.tradeHistory;
    const row = { day: W.day, side, itemId: id, qty, unitPrice, total, traderId: visitor.id, traderName: visitor.nameTh, reason: reason || '' };
    if (npc) { row.npcId = npc.id; row.npcName = npc.h.name.given; }
    history.push(row); if (history.length > 80) history.splice(0, history.length - 80);
    visitor.tradeCount = (visitor.tradeCount || 0) + 1;
    if (side === 'sect-buy') { stats.sectBought += qty; stats.sectStonesOut += total; }
    else if (side === 'sect-sell') { stats.sectSold += qty; stats.sectStonesIn += total; }
    else if (side === 'member-buy') { stats.memberBought += qty; stats.memberStonesOut += total; }
    else if (side === 'member-sell') { stats.memberSold += qty; stats.memberStonesIn += total; }
  }

  EXT.tradeSect = (W, v) => {
    EXT.ensure(W);
    const empty = { bought: 0, sold: 0, buyCost: 0, sellRevenue: 0 };
    if (!v || v.kind !== 'trader' || v.untilDay < W.day || v.sectTradeDay === W.day) return empty;
    v.sectTradeDay = W.day;
    const S = W.sect, skill = treasurySkill(W), result = Object.assign({}, empty), boughtKeys = new Set();
    const pop = Math.max(1, W.npcs.filter(n => !n.dead && !n.exiled).length);
    const generosity = S.policy ? S.policy.generosity : 50;
    const cashReserve = Math.max(300, pop * 20) + Math.round(pop * 10 * (1 - generosity / 200));
    let budget = Math.max(0, S.stones - cashReserve);

    // 1. Intelligent External Purchasing
    const needs = (budget > 0 || (!v.sectPostponedLogged && !(S.shortageDirectives && S.shortageDirectives.length > 0))) ? purchaseNeeds(W, v) : [];
    const hasShortage = (S.shortageDirectives || []).length > 0 || needs.length > 0;
    if ((S.stones < cashReserve || budget <= 0) && hasShortage && !v.sectPostponedLogged) {
      v.sectPostponedLogged = true;
      W.log('finance', 'หอคลังชะลอการจัดซื้อสินค้าจาก' + v.nameTh + ' เนื่องจากศิลาสำรองคงเหลือ (' + Math.round(S.stones) + ') ต้องคงไว้เหนือเกณฑ์ปลอดภัย (' + cashReserve + ' ศิลา)', []);
    }

    if (!v.sectBuyDone) {
      for (const need of needs) {
        const unit = EXT.quotePrice(W, need.id, 'sect-buy', skill);
        if (!unit || budget < unit) continue;
        // Avoid purchasing overpriced items (> 1.4x base) unless critical
        const basePrice = (EXT.basePrice ? EXT.basePrice(W, need.id) : 0) || ECO.base(need.id);
        if (need.priority < 18 && basePrice > 0 && unit > basePrice * 1.4) continue;

        const maxQty = Math.min(need.n, v.stock[need.id] || 0, Math.floor(budget / unit));
        const qty = Math.max(0, Math.min(maxQty, 8)); // bounded batch to prevent single-item budget drain
        if (!Number.isSafeInteger(qty) || qty <= 0) continue;
        const total = qty * unit;
        if (v.stones > Number.MAX_SAFE_INTEGER - total || !ECO.pay(W, total, 'ซื้อจาก' + v.nameTh + ': ' + ECO.name(need.id))) continue;
        
        v.stones += total;
        v.stock[need.id] -= qty;
        if (!v.stock[need.id]) delete v.stock[need.id];
        if (need.id.startsWith('CRYSTAL:') || need.id.startsWith('T:') || need.id.startsWith('S:')) {
          const cKey = need.id.startsWith('CRYSTAL:') ? need.id.slice(8) : need.id;
          W.sect.crystals = W.sect.crystals || {};
          W.sect.crystals[cKey] = (W.sect.crystals[cKey] || 0) + qty;
        } else if (need.id.startsWith('TECH_MANUAL:') || need.id.startsWith('TM:')) {
          const tid = need.id.replace(/^(TECH_MANUAL:|TM:)/, '');
          W.sect.library = W.sect.library || [];
          if (!W.sect.library.includes(tid)) W.sect.library.push(tid);
          else {
            W.sect.surplusTechManuals = W.sect.surplusTechManuals || [];
            W.sect.surplusTechManuals.push(tid);
          }
        } else if (need.id.startsWith('SUB_MANUAL:') || need.id.startsWith('SM:')) {
          const sid = need.id.replace(/^(SUB_MANUAL:|SM:)/, '');
          W.sect.subLibrary = W.sect.subLibrary || [];
          if (!W.sect.subLibrary.includes(sid)) W.sect.subLibrary.push(sid);
          else {
            W.sect.surplusSubManuals = W.sect.surplusSubManuals || [];
            W.sect.surplusSubManuals.push(sid);
          }
        } else if (need.id.startsWith('RECIPE_SCROLL:') || need.id.startsWith('FORMULA:') || need.id.startsWith('R:')) {
          const rid = need.id.replace(/^(RECIPE_SCROLL:|FORMULA:|R:)/, '');
          W.sect.knownRecipes = W.sect.knownRecipes || [];
          if (!W.sect.knownRecipes.includes(rid)) W.sect.knownRecipes.push(rid);
          else {
            W.sect.surplusRecipes = W.sect.surplusRecipes || [];
            W.sect.surplusRecipes.push(rid);
          }
        } else if (need.id.startsWith('EQ:')) {
          const eqId = need.id.slice(3);
          const it = ECO.itemById && ECO.itemById[eqId];
          if (it) {
            W.sect.gear = W.sect.gear || [];
            for (let gi = 0; gi < qty; gi++) W.sect.gear.push(ECO.mintGear(it, 1.0));
          }
        } else if (g.CONTENT && g.CONTENT.organById && (g.CONTENT.organById[need.id] || (need.id.startsWith('ORGAN:') && g.CONTENT.organById[need.id.slice(6)]))) {
          const oid = need.id.startsWith('ORGAN:') ? need.id.slice(6) : need.id;
          g.CONTENT.addOrgan(W, oid, qty);
        } else {
          ECO.add(W, need.id, qty);
        }
        budget -= total;
        result.bought += qty;
        result.buyCost += total;
        boughtKeys.add(need.id);

        const buyReason = 'สั่งซื้อตามคำสั่งขาดแคลน: ' + need.reason;
        record(W, v, 'sect-buy', need.id, qty, unit, total, null, buyReason);
        W.log('finance', 'หอคลังสั่งซื้อ ' + ECO.name(need.id) + ' ×' + qty + ' จาก' + v.nameTh + ' รวม ' + total + ' ศิลา (' + need.reason + ')', [], { txKind: 'purchase', itemId: need.id, qty, reason: need.reason });
      }
      if (result.bought > 0) v.sectBuyDone = true;
    }

    // 2. Autonomous Surplus Selling
    // Use inventory intelligence to identify genuine surplus above all reserve thresholds.
    const intel = ECO.inventoryIntelligence ? ECO.inventoryIntelligence(W) : null;
    const surplusList = intel && Array.isArray(intel.surplus) ? intel.surplus : [];
    const pol = S.policy || {};
    const secrecyVeto = pol.secrecy > 65;
    const commerceFocus = pol.focus && pol.focus.commerce != null ? pol.focus.commerce : 0.5;

    // Collect candidate surplus keys (welfare emergency medicines are strictly protected from external liquidation)
    const candidateKeys = new Set();
    surplusList.forEach(s => {
      if (EXT.isTradable(s.id) && !BASIC_PILLS.has(s.id) && !boughtKeys.has(s.id)) candidateKeys.add(s.id);
    });
    Object.keys(v.wants || {}).forEach(id => {
      if (EXT.isTradable(id) && !BASIC_PILLS.has(id) && !boughtKeys.has(id)) {
        const excess = ECO.count(W, id) - EXT.reserveForSect(W, id);
        if (excess > 0) candidateKeys.add(id);
      }
    });

    const sellKeys = Array.from(candidateKeys).sort((a, b) => {
      const excessA = ECO.count(W, a) - EXT.reserveForSect(W, a);
      const excessB = ECO.count(W, b) - EXT.reserveForSect(W, b);
      return excessB - excessA;
    });

    const maxItemsToSell = commerceFocus > 0.6 ? 4 : 3;
    for (const id of sellKeys.slice(0, maxItemsToSell)) {
      if (BASIC_PILLS.has(id)) continue; // welfare emergency medicine is strictly protected from external liquidation
      const mat = ECO.matById[id];
      if (secrecyVeto && mat && (mat.tier || 1) >= 3) continue; // strategic secrecy veto on rare materials

      const resFloor = EXT.reserveForSect(W, id);
      const curCount = ECO.count(W, id);
      const surplus = Math.max(0, curCount - resFloor);
      const unit = EXT.quotePrice(W, id, 'sect-sell', skill);
      if (!surplus || !unit || v.stones < unit || !(v.wants && v.wants[id] > 0)) continue;

      const wantQty = v.wants[id] || 0;
      const qty = Math.min(surplus, wantQty, Math.floor(v.stones / unit));
      if (!Number.isSafeInteger(qty) || qty <= 0 || !ECO.take(W, id, qty)) continue;

      const total = qty * unit;
      v.stones -= total;
      v.wants[id] -= qty;
      if (!v.wants[id]) delete v.wants[id];
      ECO.earn(W, total, 'ขายส่วนเกินให้' + v.nameTh + ': ' + ECO.name(id));
      result.sold += qty;
      result.sellRevenue += total;

      const sellReason = 'ขายส่วนเกินตามการประเมินคลังสำนัก (คงเหลือ ' + ECO.count(W, id) + '/' + resFloor + ')';
      record(W, v, 'sect-sell', id, qty, unit, total, null, sellReason);
      W.log('finance', 'สำนักขายส่วนเกิน ' + ECO.name(id) + ' ×' + qty + ' ให้' + v.nameTh + ' ได้รับ ' + total + ' ศิลา (คงคลังคงเหลือ ' + ECO.count(W, id) + ' เกณฑ์สำรอง ' + resFloor + ')', [], { txKind: 'sale', itemId: id, qty, reason: sellReason });
    }

    // Surplus duplicate tech manuals
    if (W.sect.surplusTechManuals && W.sect.surplusTechManuals.length > 0 && (v.subtype === 'rare' || v.subtype === 'caravan' || (v.wants && Object.keys(v.wants).some(k => k.startsWith('TECH_MANUAL:'))))) {
      for (let i = W.sect.surplusTechManuals.length - 1; i >= 0; i--) {
        const tid = W.sect.surplusTechManuals[i];
        if (W.sect.spawnedSurplusTech && W.sect.spawnedSurplusTech.includes(tid)) continue; // Anti-minting
        const key = 'TECH_MANUAL:' + tid;
        const unit = EXT.quotePrice(W, key, 'sect-sell', skill);
        if (unit > 0 && v.stones >= unit) {
          W.sect.surplusTechManuals.splice(i, 1);
          v.stones -= unit;
          if (v.wants && v.wants[key]) {
            v.wants[key]--;
            if (v.wants[key] <= 0) delete v.wants[key];
          }
          const tObj = CULT && CULT.tech(tid);
          const tName = tObj ? tObj.nameTh : tid;
          ECO.earn(W, unit, 'ขายคัมภีร์วิชาส่วนเกินให้' + v.nameTh + ': ' + tName);
          result.sold += 1;
          result.sellRevenue += unit;
          record(W, v, 'sect-sell', key, 1, unit, unit, null, 'ขายคัมภีร์วิชาส่วนเกิน');
          W.log('finance', 'สำนักขายคัมภีร์วิชาส่วนเกิน「' + tName + '」ให้' + v.nameTh + ' ได้รับ ' + unit + ' ศิลา', [], { txKind: 'sale', itemId: key, qty: 1, reason: 'ขายคัมภีร์ส่วนเกิน' });
          break; // limit to 1 manual per visit day
        }
      }
    }

    // Surplus duplicate sub manuals
    if (W.sect.surplusSubManuals && W.sect.surplusSubManuals.length > 0 && (v.subtype === 'rare' || v.subtype === 'caravan' || (v.wants && Object.keys(v.wants).some(k => k.startsWith('SUB_MANUAL:'))))) {
      for (let i = W.sect.surplusSubManuals.length - 1; i >= 0; i--) {
        const sid = W.sect.surplusSubManuals[i];
        if (W.sect.spawnedSurplusSub && W.sect.spawnedSurplusSub.includes(sid)) continue; // Anti-minting
        const key = 'SUB_MANUAL:' + sid;
        const unit = EXT.quotePrice(W, key, 'sect-sell', skill);
        if (unit > 0 && v.stones >= unit) {
          W.sect.surplusSubManuals.splice(i, 1);
          v.stones -= unit;
          if (v.wants && v.wants[key]) {
            v.wants[key]--;
            if (v.wants[key] <= 0) delete v.wants[key];
          }
          const sObj = CULT && (CULT.trackDef(sid) || (CULT.subList && (CULT.subList.find(x => x.sub && x.sub.id === sid) || {}).sub));
          const sName = sObj ? sObj.nameTh : sid;
          ECO.earn(W, unit, 'ขายคัมภีร์สายย่อยส่วนเกินให้' + v.nameTh + ': ' + sName);
          result.sold += 1;
          result.sellRevenue += unit;
          record(W, v, 'sect-sell', key, 1, unit, unit, null, 'ขายคัมภีร์สายย่อยส่วนเกิน');
          W.log('finance', 'สำนักขายคัมภีร์สายย่อยส่วนเกิน「' + sName + '」ให้' + v.nameTh + ' ได้รับ ' + unit + ' ศิลา', [], { txKind: 'sale', itemId: key, qty: 1, reason: 'ขายคัมภีร์สายย่อยส่วนเกิน' });
          break;
        }
      }
    }

    // Surplus duplicate recipes
    if (W.sect.surplusRecipes && W.sect.surplusRecipes.length > 0 && (v.subtype === 'medicine' || v.subtype === 'caravan' || v.subtype === 'rare')) {
      for (let i = W.sect.surplusRecipes.length - 1; i >= 0; i--) {
        const rid = W.sect.surplusRecipes[i];
        if (W.sect.spawnedSurplusRecipes && W.sect.spawnedSurplusRecipes.includes(rid)) continue; // Anti-minting
        const key = 'RECIPE_SCROLL:' + rid;
        const unit = EXT.quotePrice(W, key, 'sect-sell', skill);
        if (unit > 0 && v.stones >= unit) {
          W.sect.surplusRecipes.splice(i, 1);
          v.stones -= unit;
          const rObj = ECO.recipeById && ECO.recipeById[rid];
          const rName = rObj ? rObj.nameTh : rid;
          ECO.earn(W, unit, 'ขายม้วนตำรับส่วนเกินให้' + v.nameTh + ': ' + rName);
          result.sold += 1;
          result.sellRevenue += unit;
          record(W, v, 'sect-sell', key, 1, unit, unit, null, 'ขายม้วนตำรับส่วนเกิน');
          W.log('finance', 'สำนักขายม้วนตำรับส่วนเกิน「' + rName + '」ให้' + v.nameTh + ' ได้รับ ' + unit + ' ศิลา', [], { txKind: 'sale', itemId: key, qty: 1, reason: 'ขายม้วนตำรับส่วนเกิน' });
          break;
        }
      }
    }

    // Surplus rare organs (keep at least 2 for research catalyst)
    if (g.CONTENT && W.sect.organs && (v.subtype === 'medicine' || v.subtype === 'rare')) {
      for (const oid of Object.keys(W.sect.organs)) {
        const count = g.CONTENT.organCount(W, oid);
        const spawnedOrg = (W.sect.spawnedOrgans && W.sect.spawnedOrgans[oid]) || 0;
        const naturalCount = Math.max(0, count - spawnedOrg);
        if (naturalCount > 2) {
          const unit = EXT.quotePrice(W, oid, 'sect-sell', skill);
          if (unit > 0 && v.stones >= unit && g.CONTENT.takeOrgan(W, oid, 1)) {
            v.stones -= unit;
            if (v.wants && v.wants[oid]) {
              v.wants[oid]--;
              if (v.wants[oid] <= 0) delete v.wants[oid];
            }
            const oObj = g.CONTENT.organById && g.CONTENT.organById[oid];
            const oName = oObj ? oObj.nameTh : oid;
            ECO.earn(W, unit, 'ขายอวัยวะอสูรส่วนเกินให้' + v.nameTh + ': ' + oName);
            result.sold += 1;
            result.sellRevenue += unit;
            record(W, v, 'sect-sell', oid, 1, unit, unit, null, 'ขายอวัยวะอสูรส่วนเกิน');
            W.log('finance', 'สำนักขายอวัยวะอสูรส่วนเกิน「' + oName + '」ให้' + v.nameTh + ' ได้รับ ' + unit + ' ศิลา (คงเหลือในคลัง ' + g.CONTENT.organCount(W, oid) + ')', [], { txKind: 'sale', itemId: oid, qty: 1, reason: 'ขายอวัยวะอสูรส่วนเกิน' });
            break;
          }
        }
      }
    }

    // 3. Sell stale unsold equipment from W.sect.gear (Step 3 & 4 of Sect Trading Cycle: permanently leaves world)
    const staleRes = EXT.sellStaleSectGear(W, v, { skill });
    result.sold += staleRes.sold;
    result.sellRevenue += staleRes.revenue;

    return result;
  };

  EXT.sellStaleSectGear = (W, v, opts) => {
    opts = opts || {};
    const out = { sold: 0, revenue: 0, soldUids: [], receipts: [] };
    if (!W || !W.sect || !Array.isArray(W.sect.gear) || !W.sect.gear.length || !v || v.stones <= 0) return out;
    const graceDays = opts.graceDays != null ? opts.graceDays : 6;
    const maxSell = opts.maxSell != null ? opts.maxSell : 3;
    const skill = opts.skill != null ? opts.skill : treasurySkill(W);
    W.sect.soldGearReceipts = Array.isArray(W.sect.soldGearReceipts) ? W.sect.soldGearReceipts : [];

    // Identify gear targeted by any active member's cognition goal
    const wantedUids = new Set();
    for (const n of (W.npcs || [])) {
      if (!n || n.dead || n.away || n.exiled) continue;
      if (n.cognition && n.cognition.goal && n.cognition.goal.id === 'gear_upgrade' && n.cognition.goal.targetId) {
        wantedUids.add(n.cognition.goal.targetId);
      }
    }

    for (let i = W.sect.gear.length - 1; i >= 0 && out.sold < maxSell; i--) {
      const eq = W.sect.gear[i];
      if (!eq || !eq.slot) continue;
      if (eq.playerSpawned) continue; // Anti-minting: player-spawned gear never generates Spirit Stones
      if (eq.legendary || (g.VC && g.VC.LEGENDARY_WEAPON_BY_ID && g.VC.LEGENDARY_WEAPON_BY_ID[eq.id])) continue;
      if (eq.uid && wantedUids.has(eq.uid)) continue;
      const listedAt = eq.listedAtDay != null ? eq.listedAtDay : 0;
      const ageDays = (W.day || 0) - listedAt;
      if (ageDays < graceDays) continue;

      const maxD = eq.maxDur == null ? 100 : eq.maxDur, curD = eq.dur == null ? maxD : eq.dur;
      const condK = clamp(curD / 100, 0.25, 1) * clamp(0.7 + 0.3 * (maxD / 100), 0.5, 1);
      const baseVal = eq.value || Math.round(25 * Math.pow(1.9, (eq.tier || 1) - 1));
      const unit = Math.max(4, Math.round(baseVal * (eq.q || 1) * condK * (0.74 + skill / 900)));
      if (v.stones < unit) continue;

      // Remove from W.sect.gear permanently (do NOT add to v.stock or v.gearStock)
      W.sect.gear.splice(i, 1);
      v.stones -= unit;
      ECO.earn(W, unit, 'ขายศาสตราค้างคลังให้' + v.nameTh + ': ' + eq.nameTh);
      out.sold += 1;
      out.revenue += unit;
      if (eq.uid) out.soldUids.push(eq.uid);

      const receipt = {
        uid: eq.uid || ('sold_' + W.day + '_' + out.sold),
        id: eq.id,
        nameTh: eq.nameTh,
        slot: eq.slot,
        tier: eq.tier || 1,
        price: unit,
        day: W.day,
        listedAtDay: listedAt,
        donatedBy: eq.donatedBy || null,
        traderId: v.id,
        traderName: v.nameTh
      };
      W.sect.soldGearReceipts.push(receipt);
      if (W.sect.soldGearReceipts.length > 60) W.sect.soldGearReceipts.splice(0, W.sect.soldGearReceipts.length - 60);
      out.receipts.push(receipt);

      record(W, v, 'sect-sell', 'EQ:' + eq.id, 1, unit, unit, null, 'ระบายศาสตราค้างร้านค้าสำนักเกิน ' + graceDays + ' วัน');
      W.log('finance', 'สำนักขายศาสตราค้างคลัง「' + eq.nameTh + '」ให้' + v.nameTh + ' ได้รับ ' + unit + ' ศิลา (ออกจากโลกจำลองถาวร)', [], { txKind: 'sale', itemId: eq.id, itemUid: eq.uid, qty: 1, reason: 'ขายศาสตราค้างคลังภายนอก' });
    }
    if (out.sold > 0 && SECT && SECT.notifyStockChanged) SECT.notifyStockChanged(W);
    return out;
  };

  function pillNeed(n, id) {
    const info = ECO.pillInfo(id); if (!info) return 0;
    const e = info.effect || {}, s = n.h.state, hm = Math.max(1, CULT.hpMax(n));
    if (e.healInjury && n.inj && n.inj.length) return 1.5 + Math.min(0.6, n.inj.length * 0.15);
    if (e.healHealth && s.hp < hm * 0.72) return 0.8 + (1 - s.hp / hm) * 1.5;
    if (e.qiRestore && n.cult && s.qi < CULT.qiMax(n) * 0.25) return 0.8 + (1 - s.qi / Math.max(1, CULT.qiMax(n)));
    if (e.clearToxic && n.cult && (n.cult.toxic || 0) > 25) return 0.8 + n.cult.toxic / 150;
    if (e.clearHeartDemon && s.heartDemon > 35) return 0.8 + s.heartDemon / 150;
    if (e.energyRestore && s.energy < 25) return 0.6;
    return 0;
  }
  EXT.memberQuote = (W, n, onlyVisitorId) => {
    EXT.ensure(W);
    if (!n || n.dead || n.away || n.exiled || !n.inv) return null;
    let best = null, bestPriority = -Infinity;
    const choose = q => { if (q && q.priority > bestPriority) { best = q; bestPriority = q.priority; } };
    for (const v of EXT.activeVisitors(W)) {
      if (onlyVisitorId && v.id !== onlyVisitorId) continue;
      for (const id of Object.keys(v.stock || {})) {
        if (!EXT.isTradable(id) || !ECO.isPill(id) || !(v.stock[id] > 0) || ((n.inv.pills || {})[id] || 0) > 0) continue;
        const price = EXT.quotePrice(W, id, 'member-buy');
        let need = pillNeed(n, id), reason = 'ต้องการโอสถรักษา/ฟื้นฟู';
        if (!need && n.rank >= 1 && n.cult && (n.inv.stones || 0) >= price * 3) {
          const medicine = E(n, 'interests.medicine'), trade = E(n, 'interests.trade');
          if (medicine > 55 || trade > 75) { need = 0.25 + Math.max(0, medicine - 50) / 220 + Math.max(0, trade - 65) / 260; reason = 'สำรองโอสถจากพ่อค้าภายนอก'; }
        }
        if (need > 0 && price > 0 && (n.inv.stones || 0) >= price && v.stones <= Number.MAX_SAFE_INTEGER - price) {
          choose({ side: 'buy', itemId: id, qty: 1, price, total: price, visitorId: v.id, visitorName: v.nameTh, priority: 1.0 + need, reason });
        }
      }
      for (const id of Object.keys(v.stock || {})) {
        if (!EXT.isTradable(id) || !(v.stock[id] > 0)) continue;
        if (id.startsWith('EQ:') && n.cult && g.MARTIAL && g.MARTIAL.classifyGearForNpc) {
          const eqId = id.slice(3);
          const it = ECO.itemById && ECO.itemById[eqId];
          const price = EXT.quotePrice(W, id, 'member-buy');
          if (it && price > 0 && (n.inv.stones || 0) >= price) {
            const cls = g.MARTIAL.classifyGearForNpc(W, n, it, 0);
            if (cls && cls.category === 'useful-now') {
              choose({ side: 'buy-gear', itemId: id, qty: 1, price, total: price, visitorId: v.id, visitorName: v.nameTh, priority: 1.35 + Math.min(1.2, (cls.deltaScore || 10) / 80), reason: 'ซื้อศาสตรา/อุปกรณ์ตรงสายบำเพ็ญ' });
            }
          }
        } else if ((id.startsWith('TECH_MANUAL:') || id.startsWith('TM:')) && n.cult) {
          const tid = id.replace(/^(TECH_MANUAL:|TM:)/, '');
          const tObj = CULT.tech(tid);
          const effSt = CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage;
          const price = EXT.quotePrice(W, id, 'member-buy');
          if (tObj && (tObj.reqTier || tObj.tier || 1) <= effSt + 1 && price > 0 && (n.inv.stones || 0) >= price && !n.cult.techs.includes(tid) && !(W.sect.library || []).includes(tid) && CULT.learnable(n, [tid]).length > 0) {
            const rawPref = g.COG && g.COG.techPreference ? g.COG.techPreference(n, tObj) : 6;
            const pref = (rawPref && typeof rawPref === 'object') ? Number(rawPref.score) : Number(rawPref);
            if (Number.isFinite(pref) && pref > 3.2) {
              choose({ side: 'buy-manual', itemId: id, qty: 1, price, total: price, visitorId: v.id, visitorName: v.nameTh, priority: 1.25 + Math.min(1.0, pref / 12), reason: 'ซื้อคัมภีร์วิชาตรงสายบำเพ็ญ' });
            }
          }
        } else if (ECO.REPAIR_STONES && ECO.REPAIR_STONES[id] && n.equip) {
          const needRepair = ['WEAPON', 'ARMOR', 'ACCESSORY'].some(sl => {
            const eq = n.equip[sl];
            return eq && eq.procedural && (eq.maxDur || 100) > 20 && (eq.dur == null ? 100 : eq.dur) <= (eq.maxDur || 100) * 0.6;
          });
          const haveStone = Object.keys(ECO.REPAIR_STONES).some(sid => ((n.inv.mats && n.inv.mats[sid]) || 0) > 0);
          const price = EXT.quotePrice(W, id, 'member-buy');
          if (needRepair && !haveStone && price > 0 && (n.inv.stones || 0) >= price) {
            choose({ side: 'buy-stone', itemId: id, qty: 1, price, total: price, visitorId: v.id, visitorName: v.nameTh, priority: 1.42, reason: 'ซื้อหินซ่อมศาสตราไว้ซ่อมบำรุงอุปกรณ์ประจำตัว' });
          }
        }
      }
      if (Array.isArray(v.gearStock) && v.gearStock.length > 0 && n.cult && g.MARTIAL && g.MARTIAL.classifyGearForNpc) {
        for (const gr of v.gearStock) {
          if (!gr || !gr.slot) continue;
          const price = Math.max(8, Math.round((gr.value || 35) * 1.15));
          if ((n.inv.stones || 0) < price) continue;
          const cls = g.MARTIAL.classifyGearForNpc(W, n, gr, 0);
          if (cls && cls.category === 'useful-now') {
            choose({ side: 'buy-proc-gear', itemId: 'EQ:' + gr.id, gearUid: gr.uid, itemNameTh: gr.nameTh, qty: 1, price, total: price, visitorId: v.id, visitorName: v.nameTh, priority: 1.38 + Math.min(1.2, (cls.deltaScore || 10) / 80), reason: 'ซื้อศาสตราสุ่มตรงสายจากพ่อค้า' });
          }
        }
      }
      for (const id of Object.keys(n.inv.mats || {})) {
        const qtyHeld = n.inv.mats[id];
        if (!EXT.isTradable(id) || !Number.isSafeInteger(qtyHeld) || qtyHeld <= 0 || !(v.wants && v.wants[id] > 0)) continue;
        const price = EXT.quotePrice(W, id, 'member-sell');
        if (!price || v.stones < price) continue;
        const priority = 0.45 + E(n, 'interests.trade') / 240 + E(n, 'values.wealthResource') / 380 + (n.h.skills.trading || 0) / 280 - E(n, 'values.sectDuty') / 1000;
        choose({ side: 'sell', itemId: id, qty: 1, price, total: price, visitorId: v.id, visitorName: v.nameTh, priority, reason: 'พ่อค้าต้องการวัตถุดิบส่วนตัว' });
      }
      for (const id of Object.keys(n.inv.pills || {})) {
        const held = n.inv.pills[id];
        if (!EXT.isTradable(id) || !ECO.isPill(id) || !Number.isSafeInteger(held) || held < 2 || !(v.wants && v.wants[id] > 0) || pillNeed(n, id) > 0) continue;
        const price = EXT.quotePrice(W, id, 'member-sell');
        if (!price || v.stones < price) continue;
        const priority = 0.35 + E(n, 'interests.trade') / 260 + E(n, 'values.wealthResource') / 420 + (n.h.skills.trading || 0) / 320;
        choose({ side: 'sell-pill', itemId: id, qty: 1, price, total: price, visitorId: v.id, visitorName: v.nameTh, priority, reason: 'ขายโอสถส่วนเกิน' });
      }
    }
    return best;
  };

  EXT.tradeMember = (W, n, quote) => {
    if (!quote || !n || !n.inv) return false;
    const v = EXT.activeVisitors(W).find(x => x.id === quote.visitorId);
    if (!v) return false;
    const fresh = EXT.memberQuote(W, n, v.id);
    if (!fresh || fresh.side !== quote.side || fresh.itemId !== quote.itemId || fresh.price !== quote.price || fresh.qty !== quote.qty) return false;
    const id = fresh.itemId, total = fresh.total;
    if (fresh.side === 'buy') {
      if (!(v.stock[id] > 0) || (n.inv.stones || 0) < total || !EXT.isTradable(id)) return false;
      v.stock[id]--; if (!v.stock[id]) delete v.stock[id];
      n.inv.stones -= total; v.stones += total;
      n.inv.pills = n.inv.pills || {}; n.inv.pills[id] = (n.inv.pills[id] || 0) + 1;
      record(W, v, 'member-buy', id, 1, fresh.price, total, n, fresh.reason);
    } else if (fresh.side === 'buy-gear') {
      if (!(v.stock[id] > 0) || (n.inv.stones || 0) < total || !EXT.isTradable(id)) return false;
      const eqId = id.slice(3);
      const it = ECO.itemById && ECO.itemById[eqId];
      if (!it) return false;
      v.stock[id]--; if (!v.stock[id]) delete v.stock[id];
      n.inv.stones -= total; v.stones += total;
      const minted = ECO.mintGear(it, 1.0);
      n.equip = n.equip || {};
      if (n.equip[minted.slot]) {
        n.inv.gear = n.inv.gear || [];
        n.inv.gear.push(n.equip[minted.slot]);
      }
      n.equip[minted.slot] = minted;
      n._lastGearSwapAt = W.t || 0;
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
      record(W, v, 'member-buy', id, 1, fresh.price, total, n, fresh.reason);
    } else if (fresh.side === 'buy-proc-gear') {
      if (!Array.isArray(v.gearStock) || (n.inv.stones || 0) < total) return false;
      const gIdx = v.gearStock.findIndex(x => x && x.uid === fresh.gearUid);
      if (gIdx < 0) return false;
      const bought = v.gearStock.splice(gIdx, 1)[0];
      n.inv.stones -= total; v.stones += total;
      n.equip = n.equip || {};
      if (n.equip[bought.slot]) {
        n.inv.gear = n.inv.gear || [];
        n.inv.gear.push(n.equip[bought.slot]);
      }
      n.equip[bought.slot] = bought;
      n._lastGearSwapAt = W.t || 0;
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
      record(W, v, 'member-buy', id, 1, fresh.price, total, n, fresh.reason);
    } else if (fresh.side === 'buy-stone') {
      if (!(v.stock[id] > 0) || (n.inv.stones || 0) < total) return false;
      v.stock[id]--; if (!v.stock[id]) delete v.stock[id];
      n.inv.stones -= total; v.stones += total;
      n.inv.mats = n.inv.mats || {}; n.inv.mats[id] = (n.inv.mats[id] || 0) + 1;
      record(W, v, 'member-buy', id, 1, fresh.price, total, n, fresh.reason);
    } else if (fresh.side === 'buy-manual') {
      if (!(v.stock[id] > 0) || (n.inv.stones || 0) < total || !EXT.isTradable(id)) return false;
      const tid = id.replace(/^(TECH_MANUAL:|TM:)/, '');
      v.stock[id]--; if (!v.stock[id]) delete v.stock[id];
      n.inv.stones -= total; v.stones += total;
      W.sect.library = W.sect.library || [];
      if (!W.sect.library.includes(tid)) W.sect.library.push(tid);
      n.inv.techs = n.inv.techs || [];
      if (!n.inv.techs.includes(tid)) n.inv.techs.push(tid);
      record(W, v, 'member-buy', id, 1, fresh.price, total, n, fresh.reason);
    } else if (fresh.side === 'sell') {
      if (!EXT.isTradable(id) || !(n.inv.mats && n.inv.mats[id] > 0) || !(v.wants && v.wants[id] > 0) || v.stones < total) return false;
      n.inv.mats[id]--; if (!n.inv.mats[id]) delete n.inv.mats[id];
      v.wants[id]--; if (!v.wants[id]) delete v.wants[id];
      v.stones -= total; n.inv.stones = (n.inv.stones || 0) + total;
      record(W, v, 'member-sell', id, 1, fresh.price, total, n);
    } else if (fresh.side === 'sell-pill') {
      if (!EXT.isTradable(id) || !ECO.isPill(id) || !(n.inv.pills && n.inv.pills[id] >= 2) || pillNeed(n, id) > 0 || !(v.wants && v.wants[id] > 0) || v.stones < total) return false;
      n.inv.pills[id]--; if (!n.inv.pills[id]) delete n.inv.pills[id];
      v.wants[id]--; if (!v.wants[id]) delete v.wants[id];
      v.stones -= total; n.inv.stones = (n.inv.stones || 0) + total;
      record(W, v, 'member-sell', id, 1, fresh.price, total, n);
    } else return false;
    const isBuy = String(fresh.side || '').startsWith('buy');
    const dispName = fresh.itemNameTh || ECO.name(id);
    if (total >= 10) W.log('finance', n.h.name.given + (isBuy ? ' ซื้อ' : ' ขาย') + dispName + (isBuy ? ' จาก' : ' ให้') + v.nameTh + ' ' + total + ' ศิลา', [n.id], { txKind: isBuy ? 'purchase' : 'sale', itemId: id, qty: 1, actorId: n.id });
    return true;
  };

  // Visiting merchants participate in the NPC utility system at the existing market station.
  AI.ACTS.outsideTrade = {
    nameTh: 'ซื้อขายกับพ่อค้าภายนอก', icon: '🪙', color: '#c9a15b',
    can: (n, W) => {
      const vList = W && W.world && W.world.visitors;
      if (!vList || !vList.length) return false;
      const stn = (n.inv && n.inv.stones) || 0, v0 = vList[0], vStn = v0 ? v0.stones : 0;
      if (W.t > 0 && n._otCache && W.t > n._otCache.t && W.t - n._otCache.t < 30 && n._otCache.stn === stn && n._otCache.vLen === vList.length && n._otCache.vStn === vStn) {
        n._otQuote = n._otCache.q;
        return !!n._otQuote;
      }
      const q = EXT.memberQuote(W, n);
      n._otQuote = q;
      if (W.t > 0) n._otCache = { t: W.t, stn, vLen: vList.length, vStn, q };
      return !!q;
    },
    score(n, W, S) {
      const q = n._otQuote !== undefined ? n._otQuote : EXT.memberQuote(W, n);
      n._otQuote = undefined;
      if (!q) return S.add('ไม่มีข้อเสนอที่เหมาะสม', -3);
      const isBuy = String(q.side || '').startsWith('buy');
      S.add((isBuy ? 'ต้องการ' : 'ขาย') + (q.itemNameTh || ECO.name(q.itemId)), 0.8 + q.priority * 0.65);
      S.add('ชอบค้าขาย', (E(n, 'interests.trade') - 45) / 220);
      S.add('ต่อรองเป็น', (n.h.skills.trading || 0) / 350);
    },
    where: (W, n) => { const st = AI.freeStation(W, n, 'browse', 'market'); return st ? { st } : null; },
    dur: () => 25,
    done(n, W) { const q = EXT.memberQuote(W, n); if (q) EXT.tradeMember(W, n, q); },
    cooldown: 240
  };

  EXT.daily = W => {
    const stats = EXT.ensure(W);
    W.world.visitors = W.world.visitors.filter(v => !v || v.kind !== 'trader' || v.untilDay >= W.day);
    let active = EXT.activeVisitors(W);
    if (W.threat && W.threat.roadBlocked <= 0 && active.length < 2) {
      const openness = W.sect.policy ? W.sect.policy.openness : 50;
      const chance = clamp(0.065 + (W.sect.fame || 0) / 1200 + openness / 1400, 0.04, 0.18);
      if (W.rng.chance(chance)) active.push(EXT.openVisit(W));
    }
    active = EXT.activeVisitors(W);
    active.forEach(v => EXT.tradeSect(W, v));
    return stats;
  };

  g.EXT = EXT;
  if (typeof module === 'object' && module.exports) module.exports = EXT;
})(typeof globalThis !== 'undefined' ? globalThis : this);
