"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

test("v1.0.0 5-Tier Material & Product Value Chain DAG (T0 Uncraftable -> T1 Refined -> T2 Intermediate -> T3 Tech-Gated Component -> T4 Product)", () => {
  const cat = D.createCatalog();
  const mats = Object.values(cat.materials);
  const prods = Object.values(cat.products);

  // 1. Verify 37 materials across Tiers 0, 1, 2, 3 and 28 products across 6 sectors
  assert.equal(mats.length, 37, "Catalog must contain 37 materials across Tiers 0-3");
  assert.equal(prods.length, 28, "Catalog must contain 28 finished products (Tier 4)");
  assert.equal(Object.keys(D.MATERIAL_RECIPES).length, 27, "All 27 Tier 1-3 materials must have multi-stage recipes");
  assert.equal(D.RELEASE_VERSION, "1.0.0");

  const tier0 = mats.filter((m) => m.tier === 0);
  const tier1 = mats.filter((m) => m.tier === 1);
  const tier2 = mats.filter((m) => m.tier === 2);
  const tier3 = mats.filter((m) => m.tier === 3);
  assert.equal(tier0.length, 10, "10 Tier 0 uncraftable primary raw resources");
  assert.equal(tier1.length, 10, "10 Tier 1 first-stage refined materials");
  assert.equal(tier2.length, 9, "9 Tier 2 second-stage advanced intermediates");
  assert.equal(tier3.length, 8, "8 Tier 3 tech-gated high-tech components");

  // 2. Verify Tier 0 raw resources CANNOT be crafted from nothing
  const w = S.create("v100-dag-test", { autonomous: true, initialHeadcount: 12 });
  for (const rawMat of tier0) {
    assert.equal(rawMat.craftable, false, `${rawMat.id} must be uncraftable`);
    const attempt = S.command(w, { type: "craftMaterial", materialId: rawMat.id, batches: 1 });
    assert.equal(attempt.ok, false, `Crafting Tier 0 raw material ${rawMat.id} must be rejected`);
    assert.equal(attempt.code, "uncraftableMaterial");
  }

  // 3. Verify Early-Game Tech Gate on Tier 3 Components (e.g., microchip requires R&D >= 250)
  // At t=0, w.research.points === 0 -> company MUST buy microchip externally, cannot fabricate it yet!
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "silicon_wafer", quantity: 10 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "pcb", quantity: 10 });
  const earlyChipAttempt = S.command(w, { type: "craftMaterial", materialId: "microchip", batches: 1 });
  assert.equal(earlyChipAttempt.ok, false, "Early-game company without R&D knowledge cannot fabricate microchip in-house");
  assert.equal(earlyChipAttempt.code, "insufficientResearch");

  // 4. Multi-Step Semiconductor Value Chain: Quartz Sand (T0) -> Metallurgical Silicon MG-Si (T1) -> Silicon Wafer (T2) -> Microchip (T3)
  S.command(w, { type: "directorEdit", action: "grantResearch", points: 300 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "silica_bauxite_ore", quantity: 10 });

  // Step 1 (T0 -> T1): Smelt silica_bauxite_ore into metallurgical_silicon
  const step1 = S.command(w, { type: "craftMaterial", materialId: "metallurgical_silicon", batches: 3 });
  assert.equal(step1.ok, true, "Step 1 (T0 -> T1): Smelt quartz sand into metallurgical silicon");
  assert.equal(w.inventory.materials.metallurgical_silicon, 6);

  // Step 2 (T1 -> T2): Pull crystal from metallurgical_silicon into silicon_wafer
  const step2 = S.command(w, { type: "craftMaterial", materialId: "silicon_wafer", batches: 2 });
  assert.equal(step2.ok, true, "Step 2 (T1 -> T2): Convert metallurgical silicon into silicon wafer");
  assert.equal(w.inventory.materials.metallurgical_silicon, 2);
  assert.equal(w.inventory.materials.silicon_wafer, 14); // 10 granted + 4 crafted

  // Step 3 (T2 -> T3): Fabricate microchip from silicon_wafer + pcb now that R&D >= 250!
  const step3 = S.command(w, { type: "craftMaterial", materialId: "microchip", batches: 3 });
  assert.equal(step3.ok, true, "Step 3 (T2 -> T3): Fabricate microchip in-house once R&D threshold is met");
  assert.equal(w.inventory.materials.microchip, 6);

  // Verify accounting and material conservation invariants remain 100% clean
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v1.0.0 B2B Intermediate Material Selling & Living Off-Site Corporate Ecosystem (16 Multi-Role Corporations)", () => {
  const w = S.create("v100-ecosystem-b2b", { autonomous: true, initialHeadcount: 14 });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 30000000 });
  S.command(w, { type: "directorEdit", action: "grantResearch", points: 320 });

  // 1. Verify 16 dynamic external corporations with multi-role capabilities (client, supplier, partner, competitor)
  const corps = Object.values(w.externalWorld.corporations || {});
  assert.equal(corps.length, 18, "External world must feature 18 living corporations");
  assert.ok(corps.some((c) => c.roles.includes("client") && c.roles.includes("supplier")), "Corporations can be both clients and suppliers");
  assert.ok(corps.some((c) => c.roles.includes("competitor") && c.roles.includes("client")), "Competitors can also buy materials/products");

  // 2. Acquire Rice Farm + Palm Plantation -> produce artisan_flour (T1), refined_palm_oil (T1), and craft bakery_dough_butter (T2)
  S.command(w, { type: "acquireExternalAsset", assetId: "jasmine_rice_farm" });
  S.command(w, { type: "acquireExternalAsset", assetId: "palm_oil_plantation" });
  assert.ok(w.inventory.materials.artisan_flour >= 4);
  assert.ok(w.inventory.materials.refined_palm_oil >= 4);

  const doughRes = S.command(w, { type: "craftMaterial", materialId: "bakery_dough_butter", batches: 2 });
  assert.equal(doughRes.ok, true, "Craft Tier 2 bakery_dough_butter from Tier 1 flour + palm oil");
  assert.equal(w.inventory.materials.bakery_dough_butter, 4);

  // 3. Sell crafted intermediate materials (bakery_dough_butter T2 & artisan_flour T1) directly to external B2B corporations!
  const cashBefore = w.finance.cash;
  const sellRes = S.command(w, {
    type: "sellMaterialB2B",
    materialId: "bakery_dough_butter",
    quantity: 3,
    buyerCorpId: "cp_health",
  });
  assert.equal(sellRes.ok, true, "Should sell crafted intermediate material to B2B buyer");
  assert.ok(sellRes.revenueSatang > 0);
  assert.equal(w.finance.cash, cashBefore + sellRes.revenueSatang, "Cash must increase by exact B2B material sale revenue");
  assert.equal(w.inventory.materials.bakery_dough_butter, 1, "Sold material must be deducted from inventory");
  assert.equal(w.externalWorld.totalB2BMaterialSalesUnits, 3);

  // 4. Test Corporate Diplomacy (forming Strategic Partnership with an external corporation)
  const relRes = S.command(w, { type: "setCorporationRelation", corpId: "shenzhen_semi", mode: "partner" });
  assert.equal(relRes.ok, true);
  assert.equal(w.externalWorld.corporations.shenzhen_semi.relationshipMode, "partner");

  // 5. Advance 5 days and verify daily off-site inter-company events (price wars, inter-corp supply deals, B2B demand refresh)
  S.advance(w, 1440 * 5);
  assert.ok(w.externalWorld.ecosystemFeed.length >= 8, "Off-site ecosystem must generate daily inter-company events");
  assert.equal(w.externalWorld.b2bMaterialDemands.length, 6, "B2B material demand board must maintain 6 active offers");

  // Verify API snapshot exposes v1.0.0 fields
  const app = API.create("v100-api-snap", { autonomous: true });
  const snap = app.snapshot();
  assert.equal(snap.releaseVersion, "1.0.0");
  assert.equal(snap.catalog.materialTiers.length, 5);
  assert.equal(snap.catalog.materialRecipes.length, 27);
  assert.equal(snap.catalog.materials.length, 37);
  assert.equal(snap.catalog.products.length, 28);

  // Full audit and save/load roundtrip validation
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
  const saved = Save.serialize(w);
  const loaded = Save.deserialize(saved);
  assert.deepEqual(S.audit(loaded), []);
});
