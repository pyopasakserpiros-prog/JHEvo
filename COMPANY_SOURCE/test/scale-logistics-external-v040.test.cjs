"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const E = require("../js/economy.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

test("v0.4.0 lean startup mode (5 employees) and real-world corporate divisions (Executive, Office, Factory) operate autonomously", () => {
  const w = S.create("lean-startup-test", { autonomous: true, startupMode: "lean" });
  assert.equal(w.people.length, 5, "Lean startup should start with 5 core founding employees");

  const divisions = new Set(w.people.map((p) => p.career.division));
  assert.ok(divisions.has("executive"), "Must include Executive/CEO division");
  assert.ok(divisions.has("office"), "Must include White-Collar Office division");
  assert.ok(divisions.has("factory"), "Must include Blue-Collar Factory division");

  // Advance 8 days of autonomous operation with 5 employees
  S.advance(w, 1440 * 8);
  assert.ok(Object.keys(w.orders).length >= 1, "5-person startup should accept and process B2B orders");
  assert.deepEqual(E.auditFinance(w.finance), []);
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v0.4.0 constructible expansion facilities add walkable stations, activate production lines B & C, and preserve accounting", () => {
  const w = S.create("expansion-plots-test", { autonomous: true });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 50000000 });

  const initialStations = Object.keys(w.layout.stations).length;
  for (const plotId of ["rawDepot", "prodLineB", "dispatchHub", "execAnnex", "maintWorkshop", "prodLineC", "solarPlant", "dormitory"]) {
    const res = S.command(w, { type: "constructPlot", plotId });
    assert.equal(res.ok, true, `Failed to construct plot ${plotId}: ${res.message}`);
    assert.ok(w.facilities.constructedPlots.includes(plotId));
  }

  assert.ok(Object.keys(w.layout.stations).length > initialStations + 10, "Constructed plots must add new walkable stations");
  assert.equal(w.logistics.productionLines.lineB.active, true, "Line B should be active");
  assert.equal(w.logistics.productionLines.lineC.active, true, "Line C should be active");
  assert.equal(w.logistics.fleetCount, 4, "Dispatch Hub should expand fleet count");

  S.advance(w, 1440 * 3);
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v0.4.0 end-to-end B2B sales negotiation, inbound supplier shipments, and outbound fleet dispatch work with externalWorld", () => {
  const app = API.create("b2b-logistics-e2e", { autonomous: true });
  app.dispatch({ type: "directorEdit", action: "grantCash", amount: 20000000 });
  app.advance(1440 * 10);

  const snap = app.snapshot();
  assert.ok(snap.logistics.b2bDeals.length > 0, "Sales should negotiate and log B2B deals with client corporations");
  const deal = snap.logistics.b2bDeals[0];
  assert.ok(deal.clientId && deal.clientNameTh, "Deal must be linked to a named B2B client company");
  assert.ok(deal.pitchScore >= 20 && deal.pitchScore <= 100, "Deal must record salesperson pitch score");

  assert.ok(snap.logistics.inboundShipments.length > 0, "Procurement should create inbound supplier truck shipments");
  const inb = snap.logistics.inboundShipments[0];
  assert.ok(inb.supplierNameTh && inb.truckPlate, "Inbound shipment must have supplier name and truck plate");

  assert.ok(snap.logistics.outboundShipments.length > 0, "Logistics should dispatch outbound delivery trucks");
  const out = snap.logistics.outboundShipments[0];
  assert.ok(out.clientNameTh && out.truckPlate && out.dispatcherName, "Outbound shipment must record client, truck plate, and dispatcher");

  // Verify External World & Stock Market updates
  assert.ok(snap.externalWorld, "External world must be exposed in snapshot");
  assert.ok(snap.externalWorld.stockMarket.companyValuation > 0);
  assert.ok(snap.externalWorld.stockMarket.indices.SET_IND.history.length >= 5);
  assert.ok(snap.externalWorld.government.activePolicyId);
  assert.ok(snap.externalWorld.ceoDirective.id);
  assert.deepEqual(app.audit(), []);
});

test("v0.4.0 high-performance scaling supports 300 and 500 concurrent NPCs with full accounting & save validation", () => {
  const w = S.create("mega-scale-500", { autonomous: true });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 200000000 });
  S.command(w, { type: "constructPlot", plotId: "prodLineB" });
  S.command(w, { type: "constructPlot", plotId: "prodLineC" });
  S.command(w, { type: "constructPlot", plotId: "dispatchHub" });
  S.command(w, { type: "constructPlot", plotId: "dormitory" });

  const scaleRes = S.command(w, { type: "scaleCompany", targetCount: 500, freeGrant: true });
  assert.equal(scaleRes.ok, true);
  assert.equal(w.people.filter((p) => p.employed).length, 500, "Company should scale to 500 active NPCs");

  // Run 72 ticks (6 hours of active factory & office operations with 500 NPCs)
  const startMs = performance.now();
  S.advance(w, 360);
  const elapsedMs = performance.now() - startMs;
  const avgTickMs = elapsedMs / (360 / S.TICK);

  assert.ok(avgTickMs < 25, `500-NPC simulation should be fast (got ${avgTickMs.toFixed(2)} ms/tick)`);
  assert.deepEqual(E.auditFinance(w.finance), []);
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);

  // Verify save/load round-trip with 500 NPCs
  const saved = Save.serialize(w);
  const loaded = Save.deserialize(saved);
  assert.equal(loaded.people.length, 500);
  assert.deepEqual(Save.validate(loaded), []);
});
