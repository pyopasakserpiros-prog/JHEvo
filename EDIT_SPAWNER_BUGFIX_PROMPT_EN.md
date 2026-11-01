# PATCH v2.0.5 HOTFIX SPECIFICATION & IMPLEMENTATION PROMPT
## Fixing Edit Hub Character Spawner Item ID Resolution Mismatch & Missing Items

**Target Game:** JianghuSect (สำนักเมฆาหยก)  
**Applicable Branch / Version:** v2.0.4 -> v2.0.5  
**Priority:** Critical Bug Fix (Editor & Spawner Reliability)

---

### 1. Executive Summary & Objective

In JianghuSect v2.0.4, players using the **Character Editor / Item Spawner** (Edit Hub: tab "✨ เสกไอเทม") encounter errors where items fail to spawn, displaying the toast error:
> `เสกไม่สำเร็จ: ไม่พบโอสถ: ITEM190_PILL_...` or `ไม่พบแม่แบบอุปกรณ์: ...`

This prompt provides the complete root-cause analysis, exact code modifications, and regression test suites required for **Gemini** to apply this fix to the v2.0.5 codebase.

---

### 2. Root Cause Analysis

#### A. Crafted Pills Spawner Blind Prefixing & Lookup Failure
- **Location:** `GAME_SOURCE/js/sect.js` (`SECT.EDITOR.spawnItem`) & `GAME_SOURCE/js/economy.js` (`ECO.pillInfo`)
- **The Bug:**
  1. In `SECT.EDITOR.catalog`, crafted pills are registered with their canonical Item ID: `id: r.outItemId || ('P:' + r.id)`. For v1.9/v2.0/v2.0.4 recipes, `r.outItemId` is defined as `ITEM190_PILL_001` through `ITEM190_PILL_012`.
  2. In `SECT.EDITOR.spawnItem`, the code executed:
     ```javascript
     const pillId = String(id).startsWith('P:') ? id : ('P:' + id);
     const info = ECO.pillInfo(pillId);
     ```
     This unconditionally prepended `'P:'` to `ITEM190_PILL_001`, resulting in `'P:ITEM190_PILL_001'`.
  3. In `GAME_SOURCE/js/economy.js`, `ECO.pillInfo` stripped `'P:'` and looked up `recipeById[key.slice(2)]`.
     Because `'ITEM190_PILL_001'` is an **Item ID** (the corresponding recipe ID is `REC190_PILL_001`), `recipeById['ITEM190_PILL_001']` returned `undefined`.
  4. `ECO.pillInfo` therefore returned `null`, aborting the spawn with `ไม่พบโอสถ: ITEM190_PILL_...`.

#### B. Recipe ID vs Item ID Mismatch in Equipment Catalog
- **Location:** `GAME_SOURCE/js/sect.js` (`SECT.EDITOR.catalog`, section 4B)
- **The Bug:**
  1. In the catalog, equipment recipes were registered using `id: r.id` (recipe ID, e.g., `REC190_EQ_001`, `REC_EQ_SWORD_T1_RAW`).
  2. However, players, inventory views, and NPC bags identify equipment by canonical **Item IDs** (`r.outItemId`, e.g., `ITEM190_EQ_001`, `ITEM_EQ_SWORD_T1_RAW`).
  3. The catalog displayed recipe IDs in brackets (e.g., `(REC190_EQ_001)` instead of `(ITEM190_EQ_001)`).
  4. Furthermore, standalone equipment in `JD.ITEMS.items` without explicit separate recipe entries were missing from the catalog if only `recipes` were iterated.

#### C. Reverse Recipe Lookup in Economy
- **Location:** `GAME_SOURCE/js/economy.js`
- **The Bug:**
  1. `ECO` only mapped `recipeById[r.id]`. It lacked a reverse lookup map from `outItemId` to recipe (`recipeByOutItemId`).
  2. Functions like `ECO.name`, `ECO.base`, and `ECO.isPill` did not handle both formats interchangeably.

#### D. Technique Manuals & Direct Catalog Actions
- **Location:** `GAME_SOURCE/js/sect.js` (`SECT.EDITOR.directCatalogAction` & `spawnItem`)
- **The Bug:**
  1. When transferring/teaching techniques, passing an ID with `T:` prefix (e.g. `T:LEG_COMBAT_DUGU_NINE_SWORDS`) would fail `CULT.tech(opts.id)` because `CULT.tech` expects the raw ID without `T:`.

---

### 3. Required Implementation Changes

#### File 1: `GAME_SOURCE/js/economy.js`

1. **Add `recipeByOutItemId` Indexing and update `ECO.isPill`**:
```javascript
  const matById = {}, recipeById = {}, recipeByOutItemId = {}, itemById = {};
  JD.ITEMS.materials.forEach(m => matById[m.id] = m);
  JD.ITEMS.recipes.forEach(r => {
    recipeById[r.id] = r;
    if (r.outItemId) recipeByOutItemId[r.outItemId] = r;
  });
  JD.ITEMS.items.forEach(i => itemById[i.id] = i);
  ECO.matById = matById; ECO.recipeById = recipeById; ECO.recipeByOutItemId = recipeByOutItemId; ECO.itemById = itemById;
```

2. **Update `ECO.name` and `ECO.base`**:
```javascript
  ECO.name = id => {
    if (id === 'grain') return 'ข้าวสาร'; if (id === 'meal') return 'อาหารพร้อมกิน'; if (id === 'stones') return 'ศิลาวิญญาณ';
    if (matById[id]) return matById[id].nameTh;
    if (id.startsWith('P:')) {
      const raw = id.slice(2);
      const r = recipeById[raw] || recipeByOutItemId[raw];
      if (r) return r.outNameTh || r.nameTh;
      if (itemById[raw]) return itemById[raw].nameTh;
      return id;
    }
    if (id.startsWith('FORMULA:')) { const r = recipeById[id.slice(8)]; return r ? 'ม้วนตำรับ' + r.nameTh : id; }
    if (itemById[id]) return itemById[id].nameTh;
    if (recipeById[id]) return recipeById[id].outNameTh || recipeById[id].nameTh;
    if (recipeByOutItemId[id]) return recipeByOutItemId[id].outNameTh || recipeByOutItemId[id].nameTh;
    if (g.CONTENT && g.CONTENT.organById && g.CONTENT.organById[id]) return g.CONTENT.organById[id].nameTh;
    return id;
  };
  ECO.base = id => {
    if (id === 'grain') return ECO.GRAIN_PRICE; if (id === 'meal') return 1.2;
    if (matById[id]) return matById[id].value;
    if (id.startsWith('P:')) {
      const raw = id.slice(2);
      const r = recipeById[raw] || recipeByOutItemId[raw];
      if (r) return 14 * Math.pow(2.05, r.tier - 1);
      if (itemById[raw]) return itemById[raw].value || 10;
      return 10;
    }
    if (itemById[id]) return itemById[id].value;
    if (recipeById[id]) { const r = recipeById[id]; return 14 * Math.pow(2.05, r.tier - 1); }
    if (recipeByOutItemId[id]) { const r = recipeByOutItemId[id]; return 14 * Math.pow(2.05, r.tier - 1); }
    return 5;
  };
  ECO.price = (W, id) => ECO.base(id) * ((W.market && W.market.mult[id]) || 1);
  ECO.isPill = id => typeof id === 'string' && (id.startsWith('P:') || !!(itemById[id] && itemById[id].out === 'PILL') || !!(recipeById[id] && recipeById[id].outType === 'PILL') || !!(recipeByOutItemId[id] && recipeByOutItemId[id].outType === 'PILL'));
```

3. **Update `ECO.pillInfo`**:
```javascript
  const _pillInfoCache = new Map();
  ECO.pillInfo = key => {
    if (typeof key !== 'string') return null;
    if (_pillInfoCache.has(key)) return _pillInfoCache.get(key);
    if (key.startsWith('P:')) {
      const raw = key.slice(2);
      const r = recipeById[raw] || recipeByOutItemId[raw];
      if (r) {
        const res = { tier: r.tier, effect: r.effect || {}, name: r.outNameTh || r.nameTh };
        _pillInfoCache.set(key, res);
        return res;
      }
      if (itemById[raw] && itemById[raw].out === 'PILL') {
        const res = ECO.pillInfo(raw);
        _pillInfoCache.set(key, res);
        return res;
      }
      _pillInfoCache.set(key, null);
      return null;
    }
    const it = itemById[key];
    if (it && it.out === 'PILL') {
      const e = {}; (it.effects || []).forEach(x => {
        const p = x.params || {};
        if (x.effectId === 'EFX_CULTIVATION_ACCELERATOR') { e.cultivationProgress = 18 * it.tier; e.rateBoost = p.cultivationBoostRatio; }
        else if (x.effectId === 'EFX_MASS_VITAL_HEAL') { e.healHealth = (p.healAmount || 30); if (p.curesMeridianWound) e.healInjury = 40; }
        else if (x.effectId === 'EFX_CALM_MIND') e.clearHeartDemon = p.heartDemonReduction || 20;
        else if (x.effectId === 'EFX_LEARNING_INSIGHT') e.insight = p.masteryGainMultiplier || 1.3;
        else if (x.effectId === 'EFX_MERIDIAN_TOXIN_PURGE') e.clearToxic = p.purgePotency || 30;
        else if (x.effectId === 'EFX_PURIFY_HOSTILE_STATUS') e.clearHeartDemon = 12;
      });
      const res = { tier: it.tier, effect: e, name: it.nameTh };
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
```

---

#### File 2: `GAME_SOURCE/js/sect.js`

1. **Update `SECT.EDITOR.catalog` (Section 4B)**:
Use canonical Item IDs (`r.outItemId || r.id`) and iterate standalone items:
```javascript
    // 4B. Equipment Recipes & Standalone Equipment
    const seenEqIds = new Set((g.VC && Array.isArray(g.VC.LEGENDARY_WEAPONS)) ? g.VC.LEGENDARY_WEAPONS.map(w => w.id) : []);
    (JD.ITEMS.recipes || []).filter(r => r.outType === "EQUIPMENT").forEach(r => {
      const canonicalId = r.outItemId || r.id;
      if (!r || !r.id || seenEqIds.has(canonicalId) || seenEqIds.has(r.id)) return;
      seenEqIds.add(canonicalId);
      seenEqIds.add(r.id);
      const minted = ECO.mintGear ? ECO.mintGear(r, 1) : null;
      const slot = (minted && minted.slot) || (r.effect && r.effect.slot) || "WEAPON";
      const gearType = (minted && (minted.weaponType || minted.armorType || minted.gearType)) || (r.effect && (r.effect.weaponType || r.effect.armorType)) || "";
      const fxIds = (minted && Array.isArray(minted.fx)) ? minted.fx.map(x => x.id).filter(Boolean) : [];
      out.push(enrichCatalogEntry({
        key: "EQUIPMENT:" + canonicalId, kind: "EQUIPMENT", id: canonicalId, recipeId: r.id, outItemId: r.outItemId || null, nameTh: r.outNameTh || r.nameTh,
        tier: r.tier || 1, grade: r.grade || (r.tier >= 6 ? "Rare" : r.tier >= 4 ? "Uncommon" : "Common"),
        slot, gearType, compatiblePath: r.compatiblePath || "ANY", minStage: r.minStage || 0,
        element: (minted && minted.element) || r.element || "NEUTRAL",
        elementProfile: (minted && minted.elementProfile) || r.elementProfile || null,
        effectIds: fxIds, sourceRegistry: "JD.ITEMS.recipes(EQUIPMENT)",
        stackable: false, hasQuality: true, canSect: true, canNpc: true,
        descTh: "ยุทโธปกรณ์ช่อง " + slot + (gearType ? " (" + gearType + ")" : "") + " ระดับ " + (r.tier || 1)
      }));
    });
    (JD.ITEMS.items || []).filter(it => (it.out === "EQUIPMENT" || it.slot) && !seenEqIds.has(it.id)).forEach(it => {
      seenEqIds.add(it.id);
      const minted = ECO.mintGear ? ECO.mintGear(it, 1) : null;
      const slot = (minted && minted.slot) || it.slot || "WEAPON";
      const gearType = (minted && (minted.weaponType || minted.armorType || minted.gearType)) || it.gearType || "";
      const fxIds = (minted && Array.isArray(minted.fx)) ? minted.fx.map(x => x.id).filter(Boolean) : [];
      out.push(enrichCatalogEntry({
        key: "EQUIPMENT:" + it.id, kind: "EQUIPMENT", id: it.id, recipeId: it.recipeId || null, outItemId: it.id, nameTh: it.nameTh,
        tier: it.tier || 1, grade: it.grade || (it.tier >= 6 ? "Rare" : it.tier >= 4 ? "Uncommon" : "Common"),
        slot, gearType, compatiblePath: it.compatiblePath || "ANY", minStage: it.minStage || 0,
        element: (minted && minted.element) || it.element || "NEUTRAL",
        elementProfile: (minted && minted.elementProfile) || it.elementProfile || null,
        effectIds: fxIds, sourceRegistry: "JD.ITEMS.items(EQUIPMENT)",
        stackable: false, hasQuality: true, canSect: true, canNpc: true,
        descTh: "ยุทโธปกรณ์ช่อง " + slot + (gearType ? " (" + gearType + ")" : "") + " ระดับ " + (it.tier || 1)
      }));
    });
```

2. **Update `SECT.EDITOR.spawnItem`**:
```javascript
    } else if (kind === 'PILL' || kind === 'CRAFTED_PILL') {
      let pillId = id;
      let info = ECO.pillInfo(pillId);
      if (!info && !String(id).startsWith('P:')) {
        pillId = 'P:' + id;
        info = ECO.pillInfo(pillId);
      }
      if (!info && String(id).startsWith('P:')) {
        pillId = String(id).slice(2);
        info = ECO.pillInfo(pillId);
      }
      if (!info && ECO.recipeById && ECO.recipeById[id]) {
        const r = ECO.recipeById[id];
        pillId = r.outItemId || ('P:' + r.id);
        info = ECO.pillInfo(pillId) || ECO.pillInfo('P:' + r.id);
      }
      if (!info && ECO.recipeByOutItemId && ECO.recipeByOutItemId[id]) {
        const r = ECO.recipeByOutItemId[id];
        pillId = r.outItemId || ('P:' + r.id);
        info = ECO.pillInfo(pillId) || ECO.pillInfo('P:' + r.id);
      }
      if (!info && ECO.itemById && ECO.itemById[id]) {
        const it = ECO.itemById[id];
        pillId = it.id;
        info = ECO.pillInfo(pillId);
      }
      if (!info) return { ok: false, reason: 'ไม่พบโอสถ: ' + id };
      if (String(pillId).startsWith('P:') && ECO.recipeById && ECO.recipeById[pillId.slice(2)] && ECO.recipeById[pillId.slice(2)].outItemId) {
        pillId = ECO.recipeById[pillId.slice(2)].outItemId;
      }
      itemNameTh = info.nameTh || info.name || ECO.name(pillId);
      if (dest === 'sect') {
        ECO.add(W, pillId, qty, quality);
        W.sect.spawnedPills = W.sect.spawnedPills || {};
        W.sect.spawnedPills[pillId] = (W.sect.spawnedPills[pillId] || 0) + qty;
      } else {
        ECO.addPersonalPill(npc, pillId, quality, qty);
        npc.inv.spawnedPills = npc.inv.spawnedPills || {};
        npc.inv.spawnedPills[pillId] = (npc.inv.spawnedPills[pillId] || 0) + qty;
      }
    } else if (kind === "EQUIPMENT") {
      const legDef = g.VC && g.VC.LEGENDARY_WEAPON_BY_ID && g.VC.LEGENDARY_WEAPON_BY_ID[id];
      const itDef = !legDef && ECO.itemById && ECO.itemById[id];
      const r = ECO.recipeById[id] || (itDef && itDef.recipeId && ECO.recipeById[itDef.recipeId]) || (ECO.recipeByOutItemId && ECO.recipeByOutItemId[id]) || itDef;
      if (!legDef && (!r || (r.outType && r.outType !== "EQUIPMENT" && r.out !== "EQUIPMENT"))) return { ok: false, reason: "ไม่พบแม่แบบอุปกรณ์: " + id };
      const cap = legDef ? 1 : Math.min(qty, 25);
      itemNameTh = legDef ? legDef.nameTh : (r.outNameTh || r.nameTh);
      for (let i = 0; i < cap; i++) {
        const gear = legDef ? g.VC.mintLegendaryWeapon(W, id, "spawn") : ECO.mintGear(r, quality);
        gear.playerSpawned = true; W.sect.spawnSeq = (W.sect.spawnSeq || 0) + 1; gear.uid = "eq_sp_" + W.sect.spawnSeq;
        mintedUids.push(gear.uid);
        if (dest === 'sect') {
          W.sect.gear = W.sect.gear || [];
          W.sect.gear.push(gear);
        } else {
          if (opts.autoEquip && (!npc.equip || !npc.equip[gear.slot]) && SECT.canAccessItem(W, npc, gear)) {
            npc.equip = npc.equip || { WEAPON: null, ARMOR: null, ACCESSORY: null };
            npc.equip[gear.slot] = gear;
            HC.bump(npc);
          } else {
            npc.inv.gear = npc.inv.gear || [];
            npc.inv.gear.push(gear);
          }
        }
      }
    } else if (kind === 'TECH_MANUAL') {
      const rawTechId = String(id).startsWith('T:') ? id.slice(2) : id;
      if (g.MARTIAL && g.MARTIAL.isInnateTech && g.MARTIAL.isInnateTech(rawTechId)) return { ok: false, reason: 'วิชาเฉพาะสายย่อยติดตัวไม่สามารถเสกเป็นคัมภีร์ได้ (จะตื่นรู้เองเมื่อเดินสายย่อยนั้น)' };
      const t = CULT.tech(rawTechId);
      if (!t || t.innateOnly) return { ok: false, reason: 'ไม่พบคัมภีร์วิชา: ' + id };
      itemNameTh = 'คัมภีร์「' + t.nameTh + '」';
      if (dest === 'sect') {
        W.sect.library = W.sect.library || [];
        if (!W.sect.library.includes(t.id)) W.sect.library.push(t.id);
      } else {
        npc.inv.techs = npc.inv.techs || [];
        if (!npc.inv.techs.includes(t.id)) npc.inv.techs.push(t.id);
        npc.inv.spawnedTechs = npc.inv.spawnedTechs || [];
        if (!npc.inv.spawnedTechs.includes(t.id)) npc.inv.spawnedTechs.push(t.id);
      }
    } else if (kind === 'RECIPE_SCROLL') {
      const r = ECO.recipeById[id] || (ECO.itemById && ECO.itemById[id] && ECO.recipeById[ECO.itemById[id].recipeId]) || (ECO.recipeByOutItemId && ECO.recipeByOutItemId[id]);
      if (!r) return { ok: false, reason: 'ไม่พบม้วนตำรับ: ' + id };
      itemNameTh = 'ม้วนตำรับ「' + r.nameTh + '」';
      if (dest === 'sect') {
        W.sect.knownRecipes = W.sect.knownRecipes || [];
        if (!W.sect.knownRecipes.includes(r.id)) W.sect.knownRecipes.push(r.id);
      } else {
        npc.inv.recipes = npc.inv.recipes || [];
        if (!npc.inv.recipes.includes(r.id)) npc.inv.recipes.push(r.id);
        npc.inv.spawnedRecipes = npc.inv.spawnedRecipes || [];
        if (!npc.inv.spawnedRecipes.includes(r.id)) npc.inv.spawnedRecipes.push(r.id);
      }
    }
```

3. **Update `SECT.EDITOR.directCatalogAction`**:
```javascript
    if ((action === "teach" || action === "set_mantra") && opts.kind === "TECH_MANUAL") {
      const rawTechId = String(opts.id).startsWith("T:") ? opts.id.slice(2) : opts.id;
      const t = CULT.tech(rawTechId);
      if (!t || t.innateOnly) return { ok: false, reason: "ไม่พบคัมภีร์วิชา: " + opts.id };
```

---

### 4. Build & Verification Commands

1. **Rebuild Standalone HTML**:
   ```bash
   node tools/build_single.js
   ```
2. **Execute Full Test Suite**:
   ```bash
   node test/core_lock.js
   node test/standalone.js
   node test/npc_offices.js
   node test/weapon_subpath_gear_expansion_suite.js
   node test/phase2_edit_hub_inventory.js
   node test/phase3_stock_distribution_log.js
   node test/codex_combined_review.js
   ```
3. **Run ID Resolution Verification**:
   ```bash
   node test/edit_spawner_id_resolution_test.js
   ```
   (Must output 0 failures across all 2041+ catalog items and 100% success on crafted pills and equipment).

---

### 5. Invariant Constraints & Rules
- **NEVER** edit `GAME_SOURCE/js/human_core.js`. The 155-dimensional Human Core fingerprint (`155:2f9c9dd7`) must remain 100% byte-locked.
- **Standalone Build Integrity**: `JianghuSect_single.html` must cleanly inline exactly 40 script files without runtime errors.
