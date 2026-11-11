"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

test("v0.6.0 External Assets catalog (12 assets) delivers real upstream harvests, operational bonuses, and upgrades", () => {
  const assets = Object.values(D.EXTERNAL_ASSETS);
  assert.equal(assets.length, 12, "Must have 12 External Assets across 4 categories");

  const w = S.create("v060-ext-assets", { autonomous: true });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 50000000 });

  // Acquire Rice Farm, Palm Plantation, Sugarcane Estate, Solar/Wind Farm, Deepsea Port, Retail Network
  for (const aid of [
    "jasmine_rice_farm",
    "palm_oil_plantation",
    "sugarcane_estate",
    "offsite_solar_wind_farm",
    "deepsea_port_terminal",
    "retail_flagship_network",
  ]) {
    const res = S.command(w, { type: "acquireExternalAsset", assetId: aid });
    assert.equal(res.ok, true, `Failed to acquire ${aid}`);
  }

  // Welcome harvest + auto midstream refining should already have produced artisan_flour, refined_palm_oil, refined_sugar_syrup!
  assert.ok(w.inventory.materials.artisan_flour >= 6, "Rice farm + milling chain must produce artisan_flour in stock");
  assert.ok(w.inventory.materials.refined_palm_oil >= 6, "Palm plantation + refinery chain must produce refined_palm_oil in stock");
  assert.ok(w.inventory.materials.refined_sugar_syrup >= 6, "Sugarcane estate + ferment chain must produce refined_sugar_syrup in stock");
  assert.ok(w.research.unlocked.includes("artisan_bakery"), "Acquiring grain/palm farm unlocks artisan_bakery");

  // Upgrade jasmine_rice_farm to Lv.2
  const upRes = S.command(w, { type: "acquireExternalAsset", assetId: "jasmine_rice_farm", upgrade: true });
  assert.equal(upRes.ok, true);
  assert.equal(upRes.level, 2);

  const bonuses = S.getActiveExternalAssetBonuses(w);
  assert.ok(bonuses.rentReductionPct >= 0.3, "Solar/Wind + Sugarcane must reduce daily rent/utility cost");
  assert.ok(bonuses.leadTimeReductionPct >= 0.25, "Deepsea Port must reduce supplier lead times");
  assert.ok(bonuses.pricePremiumBonus >= 0.1, "Retail Network + Port must boost B2B unit prices");
  assert.ok(bonuses.depositPctBonus >= 0.08, "Retail Network must increase customer deposit ratio");

  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v0.6.0 Multi-Stage Production Chain (Rice Farm -> Flour Mill -> Artisan Bakery) vs Asset-Light Make-or-Buy Strategy", () => {
  // Scenario A: Vertically Integrated Bakery (Owns Farms + Mills Flour/Oil/Sugar in-house -> Bakes Bread without buying flour)
  const wIntegrated = S.create("v060-vertical-bakery", { autonomous: true, initialHeadcount: 14 });
  S.command(wIntegrated, { type: "directorEdit", action: "grantCash", amount: 40000000 });
  S.command(wIntegrated, { type: "setSupplyChainStrategy", strategyId: "vertical_integration" });
  S.command(wIntegrated, { type: "constructPlot", plotId: "refineryMill" });
  S.command(wIntegrated, { type: "constructPlot", plotId: "bakeryPlant" });
  S.command(wIntegrated, { type: "acquireExternalAsset", assetId: "jasmine_rice_farm" });
  S.command(wIntegrated, { type: "acquireExternalAsset", assetId: "palm_oil_plantation" });
  S.command(wIntegrated, { type: "acquireExternalAsset", assetId: "sugarcane_estate" });
  S.command(wIntegrated, { type: "acquireExternalAsset", assetId: "forestry_pulp_mill" });

  // Advance 4 days: daily harvests + midstream refining keep supplying flour, palm oil, sugar, and cartons
  S.advance(wIntegrated, 1440 * 4);
  const ap = wIntegrated.externalWorld.assetPortfolio;
  assert.ok(ap.totalHarvestedUnits >= 40, "External assets must harvest upstream raw materials daily");
  assert.ok(ap.totalRefinedUnits >= 20, "Midstream chains must refine raw materials into flour/oil/sugar");
  assert.ok(ap.totalChainSavingsSatang > 0, "In-house refining must record positive cost savings vs market price");
  assert.deepEqual(S.audit(wIntegrated), []);
  assert.deepEqual(Save.validate(wIntegrated), []);

  // Scenario B: Asset-Light Bakery (Owns 0 farms, disables midstream refining, buys all flour/oil/sugar from market)
  const wLight = S.create("v060-asset-light-bakery", { autonomous: true, initialHeadcount: 12 });
  S.command(wLight, { type: "directorEdit", action: "grantCash", amount: 20000000 });
  S.command(wLight, { type: "directorEdit", action: "grantResearch", points: 100 });
  S.command(wLight, { type: "setSupplyChainStrategy", strategyId: "asset_light" });
  assert.equal(Object.keys(wLight.externalWorld.assetPortfolio.ownedAssets).length, 0);

  // Grant upstream paddy_grain but verify asset_light strategy does NOT refine it automatically
  S.command(wLight, { type: "directorEdit", action: "grantMaterial", materialId: "paddy_grain", quantity: 10 });
  const refRes = S.evaluateExternalAssetsDaily(wLight, 1);
  assert.equal(wLight.externalWorld.assetPortfolio.totalRefinedUnits, 0, "Asset-light mode skips automatic midstream refining");
  assert.deepEqual(S.audit(wLight), []);
  assert.deepEqual(Save.validate(wLight), []);

  // Verify API snapshot exposes externalAssets, productionChains, and supplyChainStrategies
  const app = API.create("v060-api-check", { autonomous: true });
  const snap = app.snapshot();
  assert.ok(snap.catalog.materials.length >= 30);
  assert.ok(snap.catalog.products.length >= 22);
  assert.equal(snap.catalog.productionModes.length, 8);
  assert.equal(snap.catalog.externalAssets.length, 12);
  assert.ok(snap.catalog.productionChains.length >= 8);
  assert.equal(snap.catalog.supplyChainStrategies.length, 3);
});
