'use strict';
const assert = require('assert');
const G = require('./load.js');
const { SIM, ECO, SECT, EXPED, HC } = G;

console.log('=== JS2 Deep Round A — Real Economy, Bloodless War & Departed Network Suite ===');

// 1. Real Fire/Heat Herb Price Elasticity & Deep Yin Eclipse Grain Surge (Zero W.rng!)
{
  const W = SIM.create('deep_round_a_prices', { masterIdx: 0 });
  const li = EXPED.LIVING_INSTITUTIONS.ensure(W);
  const rngBefore = W.rng.s;

  const baseFireHerb = ECO.base('MAT_HERB_CINDER_LEAF_1');
  const priceFireHerbDay1 = ECO.price(W, 'MAT_HERB_CINDER_LEAF_1');
  assert(Math.abs(priceFireHerbDay1 - baseFireHerb * li.curseEconomy.heatHerbPriceMultiplier) < 1e-6,
    `Fire herb price should scale with Beiming curse multiplier (${priceFireHerbDay1} vs ${baseFireHerb * li.curseEconomy.heatHerbPriceMultiplier})`);

  const baseIron = ECO.base('MAT_ORE_BLACK_IRON_1');
  const priceIronDay1 = ECO.price(W, 'MAT_ORE_BLACK_IRON_1');
  assert.strictEqual(priceIronDay1, baseIron, 'Non-heat ore should remain unaffected by Beiming heat-herb curse');
  assert.strictEqual(W.rng.s, rngBefore, 'ECO.price & getMarketPriceModifier must consume ZERO W.rng');

  // Trigger Winter Solstice surge & Deep Yin Eclipse
  li.curseEconomy.heatHerbPriceMultiplier = 2.6;
  li.activeCycles.push({ id: 'DEEP_YIN_ECLIPSE', nameTh: 'เหมันต์สุริยคราสหยินลึก', kind: 'CALAMITY', startDay: 1400, endDay: 1580, yearInEpoch: 4 });
  li.departedNetwork.trust = 2;

  const priceFireHerbSurge = ECO.price(W, 'MAT_HERB_CINDER_LEAF_1');
  assert(priceFireHerbSurge > priceFireHerbDay1 * 1.5, 'Fire herb price must surge during Winter Solstice / Deep Yin Eclipse');

  const grainEclipseNoTrust = ECO.price(W, 'grain');
  assert(Math.abs(grainEclipseNoTrust - ECO.base('grain') * 1.45) < 1e-6, 'Grain must surge 1.45x during Deep Yin Eclipse');

  li.departedNetwork.trust = 4;
  const grainEclipseWithNetwork = ECO.price(W, 'grain');
  assert(Math.abs(grainEclipseWithNetwork - ECO.base('grain') * 1.30) < 1e-6, 'Departed Disciple Network trust >= 3 must soften eclipse grain price to 1.30x');

  const mIdx = SECT.CARAVAN_AUCTION.updateMarketIndex(W);
  assert(mIdx.HERB_SPIRIT.multiplier > 1.2, 'CARAVAN_AUCTION HERB_SPIRIT index must rise under Beiming heat-herb surge');
  assert(mIdx.SPIRIT_CUISINE.multiplier >= 1.35, 'CARAVAN_AUCTION SPIRIT_CUISINE index must rise during Deep Yin Eclipse');
  console.log('  [PASS] 1/5: Real Fire-Herb Price Elasticity, Deep Yin Eclipse Grain Surge & Caravan Market Index verified');
}

// 2. Real Yunhe 2% Two-Bank Scale Toll, 8% Double-Toll, 1% Ferry Bypass & 15% Name-Threat Penalty
{
  const W = SIM.create('deep_round_a_tolls', { masterIdx: 0 });
  const li = EXPED.LIVING_INSTITUTIONS.ensure(W);

  // Case A: Standard 2% Yunhe Two-Bank Scale Toll
  li.bloodlessWar.localPressure = 2;
  li.departedNetwork.trust = 2;
  li.sectNameRegistry.nameThreatLevel = 1;
  const rA = SECT.CARAVAN_AUCTION.dispatchTradeCaravan(W, 'HERB_SPIRIT', null, { force: true, allowRepeatSameDay: true, quiet: true });
  assert(rA.ok && rA.caravan, 'Caravan A must succeed');
  assert.strictEqual(rA.caravan.yunheTollRate, 0.02, 'Standard Yunhe toll must be 2%');
  assert(rA.caravan.yunheToll > 0, 'Yunhe toll must deduct real stones');
  assert.strictEqual(rA.caravan.revenue, rA.caravan.grossRevenue - rA.caravan.yunheToll, 'Net revenue must equal gross minus Yunhe toll');
  assert.strictEqual(li.sectNameRegistry.totalTollPaid, rA.caravan.yunheToll, 'totalTollPaid must track real toll stones');

  // Case B: Bloodless War 8% Double-Toll when localPressure >= 5 and low departed network trust
  li.bloodlessWar.localPressure = 6;
  li.departedNetwork.trust = 1;
  const rB = SECT.CARAVAN_AUCTION.dispatchTradeCaravan(W, 'ORE_METAL', null, { force: true, allowRepeatSameDay: true, quiet: true });
  assert(rB.ok && rB.caravan, 'Caravan B must succeed');
  assert.strictEqual(rB.caravan.yunheTollRate, 0.08, 'Bloodless War double-toll must be 8%');
  assert.strictEqual(rB.caravan.ferryBypassUsed, false, 'Ferry bypass must not trigger at low trust');

  // Case C: Departed Disciple Network Ferry Bypass (Tan Xiaoman) cuts double-toll down to 1%
  li.departedNetwork.trust = 4;
  const rC = SECT.CARAVAN_AUCTION.dispatchTradeCaravan(W, 'ALCH_PILL', null, { force: true, allowRepeatSameDay: true, quiet: true });
  assert(rC.ok && rC.caravan, 'Caravan C must succeed');
  assert.strictEqual(rC.caravan.yunheTollRate, 0.01, 'Departed Network ferry bypass must reduce toll to 1%');
  assert.strictEqual(rC.caravan.ferryBypassUsed, true, 'ferryBypassUsed flag must be true');

  // Case D: Name-Threat Level 4 penalty (-15% gross revenue)
  li.sectNameRegistry.nameThreatLevel = 4;
  const rD = SECT.CARAVAN_AUCTION.dispatchTradeCaravan(W, 'WEAPON_GEAR', null, { force: true, allowRepeatSameDay: true, quiet: true });
  assert(rD.ok && rD.caravan, 'Caravan D must succeed');
  assert(rD.caravan.nameThreatPenalty > 0, 'Name-Threat level 4 must penalize caravan revenue');
  assert.strictEqual(rD.caravan.revenue, rD.caravan.grossRevenue - rD.caravan.nameThreatPenalty - rD.caravan.yunheToll);
  console.log('  [PASS] 2/5: Yunhe 2% Toll, 8% Double-Toll, 1% Ferry Bypass & 15% Name-Threat Penalty verified');
}

// 3. Real Departed Disciple Network Grain Stock (ECO.add) & Autonomous Mortal Applicant Referral (SIM.addNpc)
{
  const W = SIM.create('deep_round_a_network', { masterIdx: 0 });
  const li = EXPED.LIVING_INSTITUTIONS.ensure(W);
  li.departedNetwork.teaPouchReturned = true;
  li.departedNetwork.trust = 4;
  // Ensure mountain has sufficient grain for Luo Chunhe's check (>= 80)
  const grainBefore = ECO.count(W, 'grain');
  if (grainBefore < 120) ECO.add(W, 'grain', 120 - grainBefore);
  const npcCountBefore = W.npcs.length;

  // Tick across Month 4 Day 15 of Years 1..4 (guaranteed at least 1 grain delivery and 1 applicant referral)
  for (let y = 1; y <= 4; y++) {
    const startOff = (SIM.CALENDAR && SIM.CALENDAR.START_DAY_OFFSET) || 360;
    const absDay = startOff + (y - 1) * 360 + (4 - 1) * 30 + (15 - 1);
    W.t = absDay * 1440;
    W.day = absDay;
    // Force Deep Yin Eclipse on Year 4 Month 4 test? No, just test standard + verify real grain add
    const gStart = ECO.count(W, 'grain');
    EXPED.LIVING_INSTITUTIONS.tickDaily(W);
    const gEnd = ECO.count(W, 'grain');
    if (gEnd > gStart) {
      assert.strictEqual(gEnd - gStart, 12, 'Seasonal aid must add exact +12 real grain to W.sect.stock.grain');
    }
  }
  assert(li.departedNetwork.totalGrainDelivered >= 12, 'Departed Network must deliver real grain to ECO stock');
  assert(li.departedNetwork.referredApplicantsCount >= 1, 'Luo Chunhe must autonomously refer at least 1 mortal applicant');
  assert(W.npcs.length > npcCountBefore, 'W.npcs must actually grow from Departed Network referral');
  assert(W.npcs.some(n => n && n.referredByDepartedNetwork), 'Referred disciple must carry referredByDepartedNetwork flag');
  console.log(`  [PASS] 3/5: Real Grain Stock (+${li.departedNetwork.totalGrainDelivered}) & Autonomous Applicant Referral (+${li.departedNetwork.referredApplicantsCount} NPC) verified`);
}

// 4. Real Human Core (npc.h) Personality-Divergent Autonomous Decisions & Back-Tax Recovery
{
  function run75Days(seed, traitOverrides) {
    const W = SIM.create(seed, { masterIdx: 0 });
    W.sect.stones = 900;
    const master = W.npcs[0];
    Object.assign(master.h.personality, traitOverrides.personality);
    Object.assign(master.h.values, traitOverrides.values);
    const startOff = (SIM.CALENDAR && SIM.CALENDAR.START_DAY_OFFSET) || 360;
    for (let d = 0; d < 76; d++) {
      W.t = (startOff + d) * 1440;
      W.day = startOff + d;
      EXPED.LIVING_INSTITUTIONS.tickDaily(W);
    }
    return W;
  }

  // World A: Upright, prudent Sect Master
  const W_upright = run75Days('deep_round_a_upright', {
    personality: { integrity: 90, caution: 85, discipline: 80, rationality: 80, ambition: 25, empathy: 80 },
    values: { honorLegacy: 88, wealthResource: 20, sectDuty: 85 }
  });
  const liA = W_upright.world.livingInstitutions;
  assert.strictEqual(liA.ticketMarket.endorsedVerified, true, 'Upright Master must refuse unverified tickets');
  assert.strictEqual(liA.bloodlessWar.nameLeaseDecision, 'REJECTED', 'Upright Master must reject Tong Yu name-lease');
  assert.strictEqual(liA.bloodlessWar.fiveGuildIndependence, 'CLEAN', 'Upright Master keeps Five-Guild independence CLEAN');
  assert.strictEqual(liA.bloodlessWar.blackLedgerWitnessEligible, true, 'Upright Master remains Black Ledger witness eligible');
  assert(W_upright.sect.ledger.some(e => e.why && e.why.includes('สุสานสวนสวรรค์')), 'Verified ticket settlement must be recorded in W.sect.ledger');

  // World B: Greedy, low-integrity Sect Master
  const W_greedy = run75Days('deep_round_a_greedy', {
    personality: { integrity: 12, caution: 18, discipline: 25, rationality: 30, ambition: 92, empathy: 20 },
    values: { honorLegacy: 15, wealthResource: 95, sectDuty: 20 }
  });
  const liB = W_greedy.world.livingInstitutions;
  assert.strictEqual(liB.ticketMarket.endorsedVerified, false, 'Greedy Master must autonomously endorse risky tickets');
  assert.strictEqual(liB.bloodlessWar.nameLeaseDecision, 'LEASED', 'Greedy Master must autonomously accept Tong Yu name-lease');
  assert.strictEqual(liB.bloodlessWar.fiveGuildIndependence, 'COMPROMISED', 'Greedy Master compromises Five-Guild independence');
  assert.strictEqual(liB.bloodlessWar.blackLedgerWitnessEligible, false, 'Greedy Master loses Black Ledger witness eligibility');
  assert(W_greedy.sect.ledger.some(e => e.why && e.why.includes('เถ้าแก่ถงอวี้')), 'Tong Yu lease payment must be recorded in W.sect.ledger');
  assert(W_greedy.sect.ledger.some(e => e.why && e.why.includes('ฉีซานเหนียง')), 'Risky ticket debt penalty must be recorded in W.sect.ledger');

  // Back-tax recovery test on Upright Master
  const startOff = (SIM.CALENDAR && SIM.CALENDAR.START_DAY_OFFSET) || 360;
  W_upright.sect.stones = 5; // Unable to pay Year 2 Month 1 Day 1 tax
  W_upright.t = (startOff + 360) * 1440;
  W_upright.day = startOff + 360;
  EXPED.LIVING_INSTITUTIONS.tickDaily(W_upright);
  assert.strictEqual(liA.sectNameRegistry.missedTaxYears, 1, 'Should record 1 missed tax year when treasury < 20');
  assert(liA.sectNameRegistry.nameThreatLevel >= 2, 'Name threat level must rise on missed tax');

  // Treasury recovers -> Upright Master autonomously pays back-tax on Month 2 Day 1
  W_upright.sect.stones = 500;
  W_upright.t = (startOff + 390) * 1440;
  W_upright.day = startOff + 390;
  EXPED.LIVING_INSTITUTIONS.tickDaily(W_upright);
  assert.strictEqual(liA.sectNameRegistry.missedTaxYears, 0, 'Upright Master must autonomously pay overdue back-tax');
  assert(W_upright.sect.ledger.some(e => e.why && e.why.includes('ภาษีย้อนหลัง')), 'Back-tax payment must be recorded in W.sect.ledger');
  console.log('  [PASS] 4/5: Personality-Divergent Human-Core Decisions (Upright vs Greedy) & Back-Tax Recovery verified');
}

// 5. Save/Load Round-Trip Integrity
{
  const W = SIM.create('deep_round_a_saveload', { masterIdx: 0 });
  const li = EXPED.LIVING_INSTITUTIONS.ensure(W);
  li.sectNameRegistry.totalTollPaid = 77;
  li.departedNetwork.totalGrainDelivered = 36;
  li.departedNetwork.referredApplicantsCount = 2;
  const raw = SIM.serialize(W);
  const W2 = SIM.deserialize(raw);
  const li2 = W2.world.livingInstitutions;
  assert.strictEqual(li2.sectNameRegistry.totalTollPaid, 77);
  assert.strictEqual(li2.departedNetwork.totalGrainDelivered, 36);
  assert.strictEqual(li2.departedNetwork.referredApplicantsCount, 2);
  console.log('  [PASS] 5/5: Save/Load Round-Trip Integrity verified');
}

console.log('=== ALL 5/5 DEEP ROUND A TESTS PASSED ===');
