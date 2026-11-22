'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const g = require('./load');
const { SIM, CULT, COMBAT, STATS, SECT, EXPLORE, ECO, MARTIAL, HC, JD, NECRO, Render } = g;

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function makeWorld(seed = 39701) {
  const W = SIM.create(String(seed));
  return W;
}

function addCultNpc(W, name, pathId, subId, stage, techs) {
  const n = SIM.addNpc(W, { name });
  n.cult = { path: pathId, sub: subId, stage: stage || 1, prog: 0, techs: techs || [], tm: {} };
  return n;
}

function run() {
  const NECRO_PATHS = ['CORPSE_SOVEREIGN', 'WRAITH_GRIEVANCE', 'DEATHLESS_CADAVER'];

  // ==================== 1. REGISTRY & NAMING & GATING ====================
  for (const pid of NECRO_PATHS) {
    const p = CULT.PATHS[pid];
    assert(p, `Missing CULT.PATHS[${pid}]`);
    assert.strictEqual(p.maxStage, 8, `${pid} maxStage must be 8`);
    assert(Array.isArray(p.subPaths) && p.subPaths.length >= 4, `${pid} must have >= 4 subPaths`);
    assert(!/[A-Za-z]/.test(p.nameTh), `${pid} nameTh must not contain ASCII letters: ${p.nameTh}`);

    assert(CULT.PATH_DESCRIPTORS[pid], `Missing PATH_DESCRIPTORS[${pid}]`);
    assert(CULT.PATH_GAUGES[pid], `Missing PATH_GAUGES[${pid}]`);
    assert(Array.isArray(CULT.THRESH[pid]) && CULT.THRESH[pid].length === 7, `Missing THRESH[${pid}]`);

    for (const sp of p.subPaths) {
      assert(!/[A-Za-z]/.test(sp.nameTh), `Subpath ${sp.id} nameTh must not contain ASCII letters: ${sp.nameTh}`);
      const tr = CULT.trackDef && CULT.trackDef(sp.id);
      assert(tr, `Missing trackDef for subpath ${sp.id}`);
    }

    assert(SECT.ARCHETYPES && Object.values(SECT.ARCHETYPES).some(a => a && a.path === pid), `Missing SECT.ARCHETYPES for ${pid}`);
    assert(EXPLORE.NINE_DAO_PAGODA && EXPLORE.NINE_DAO_PAGODA.floors.some(fl => fl && fl.path === pid), `Missing Pagoda floor for ${pid}`);

    const resId = 'RES_NINE_DAO_' + pid;
    const resSets = (MARTIAL && MARTIAL.RESONANCE_SETS) || (JD.MARTIAL && JD.MARTIAL.RESONANCE_SETS) || [];
    assert(resSets.some(r => r && r.id === resId), `Missing resonance set ${resId}`);

    const legTech = (JD.TECH.techniques || []).find(t => t && t.path === pid && t.tier === 7 && (t.legendary || t.apexPathArt));
    assert(legTech, `Missing Tier-7 legendary technique for ${pid}`);

    const testNpc = addCultNpc(makeWorld(39702), 'ผู้ทดสอบ', pid, p.subPaths[0].id, 2);
    const bm = CULT.bestMantra(pid, 2, testNpc);
    assert(bm && Number.isFinite(bm.power), `Invalid bestMantra for ${pid}`);
  }

  for (const uniId of ['TECH_NECRO_UNI_01', 'TECH_NECRO_UNI_02', 'TECH_NECRO_UNI_03']) {
    const t = CULT.tech(uniId);
    assert(t && t.path === 'ANY', `${uniId} must exist with path === 'ANY'`);
  }

  // Gating check: fresh NPC gets -999 until discovered
  {
    const W = makeWorld(39703);
    const fresh = W.npcs[0];
    delete fresh.daoDiscoveries;
    if (fresh.cult && NECRO_PATHS.includes(fresh.cult.path)) fresh.cult.path = 'XIAN';
    const beforeScores = CULT.pathScores(fresh);
    for (const pid of NECRO_PATHS) {
      const rows = beforeScores.filter(r => r.path === pid);
      assert(rows.length >= 4 && rows.every(r => r.score <= -900), `${pid} must be gated (-999) before discovery`);
      NECRO.recordDiscovery(W, fresh, pid, 'TEST', 'ร่องรอยทดสอบ');
    }
    const afterScores = CULT.pathScores(fresh);
    for (const pid of NECRO_PATHS) {
      const rows = afterScores.filter(r => r.path === pid);
      assert(rows.some(r => r.score > -900), `${pid} must unlock in pathScores after recordDiscovery`);
    }
  }

  // ==================== 2. CORPSE SOVEREIGN ====================
  {
    const W = makeWorld(39704);
    const owner = addCultNpc(W, 'ผู้คุมศพ', 'CORPSE_SOVEREIGN', 'ARMORY_OF_THE_DEAD', 4, []);
    const victim = addCultNpc(W, 'ศิษย์ผู้ล่วงลับ', 'XIAN', 'SWORD_IMMORTAL', 3, ['TECH_NECRO_UNI_01']);
    const enemy = addCultNpc(W, 'ศัตรู', 'DEMON', 'BLOOD_DEMON', 4, []);
    victim.h.personality.ambition = 80;
    owner.h.personality.ambition = 90;
    owner.h.personality.empathy = 20;

    // 2a. Claim NPC corpse and verify techIds inheritance
    const f1 = COMBAT.startFight(W, [owner.id, victim.id], [enemy.id], 'custom', { serious: true });
    COMBAT.setHp(victim, 0);
    COMBAT.slay(W, f1, enemy, victim);
    assert(Array.isArray(f1._necroFallen) && f1._necroFallen.length >= 1, 'Fallen snapshot must be recorded');
    const npcSnap = f1._necroFallen[0];
    const thNpc = NECRO.claimCorpse(W, owner, npcSnap);
    assert(thNpc && thNpc.kind === 'NPC', 'NPC corpse thrall must be claimed');
    assert(thNpc.techIds.every(tid => (victim.cult.techs || []).includes(tid)), 'thrall techIds must be subset of victim techs');
    COMBAT.conclude(W, f1);

    // 2b. Equip real WEAPON instance from owner.inv.gear and verify stats increase
    const baseAtkBefore = NECRO.thrallStats(owner, thNpc).atk;
    const wpnProto = (JD.ITEMS.items || []).find(it => it && it.slot === 'WEAPON' && (it.tier || 1) <= thNpc.tier + 1);
    assert(wpnProto, 'Must find a valid WEAPON item in JD.ITEMS');
    const wpnInst = Object.assign({}, wpnProto, { uid: 'WPN_TEST_UNIQUE_1', dur: 100 });
    owner.inv = owner.inv || {};
    owner.inv.gear = [wpnInst];
    const eqOk = NECRO.equipThrall(W, owner, thNpc);
    assert(eqOk, 'equipThrall should equip weapon onto NPC thrall');
    assert.strictEqual(owner.inv.gear.length, 0, 'Weapon must be moved (not cloned) from owner.inv.gear');
    assert(thNpc.equip.WEAPON === wpnInst, 'Equipped weapon must be exact instance');
    const atkAfter = NECRO.thrallStats(owner, thNpc).atk;
    assert(atkAfter > baseAtkBefore, `Equipped weapon must increase thrall atk (${baseAtkBefore} -> ${atkAfter})`);

    // 2c. Beast corpse via wild fight + cannot equip WEAPON
    const beastFoe = {
      id: 'BEAST_TEST_1',
      name: 'พยัคฆ์เหมันต์',
      nameTh: 'พยัคฆ์เหมันต์',
      kind: 'beast',
      wild: true,
      foe: true,
      tier: 3,
      hp: 200,
      hpMax: 200,
      skl: [{ id: 'B_CLAW', nameTh: 'ตะปบเหมันต์', tier: 3, arch: 'strike', type: 'p', M: 1.1, cd: 8, wind: 3, hits: 1 }]
    };
    W.foes = W.foes || [];
    W.foes.push(beastFoe);
    W.foeById = W.foeById || {};
    W.foeById[beastFoe.id] = beastFoe;

    const fWild = COMBAT.startFight(W, [owner.id], [beastFoe.id], 'wild', { serious: true });
    beastFoe.hp = 0;
    COMBAT.slay(W, fWild, owner, beastFoe);
    COMBAT.conclude(W, fWild);
    const beastThrall = owner.necro.thralls.find(t => t && t.kind === 'BEAST');
    assert(beastThrall, 'End-to-end wild fight + slay + conclude must yield BEAST thrall');

    const extraWpn = Object.assign({}, wpnProto, { uid: 'WPN_BEAST_REJECT', dur: 100 });
    owner.inv.gear.push(extraWpn);
    NECRO.equipThrall(W, owner, beastThrall);
    assert(!beastThrall.equip.WEAPON, 'BEAST thrall must NOT equip WEAPON');

    // 2d. Raid deployment & STATS.get parity
    const enemy2 = addCultNpc(W, 'ศัตรู2', 'BODY', 'VAJRA_BODHI', 3);
    const fRaid = COMBAT.startFight(W, [owner.id], [enemy2.id], 'raid', { serious: true, ctx: { foes: [] } });
    const thrUnitId = fRaid.A.find(id => {
      const u = COMBAT.unit(W, id);
      return u && u.isNecroThrall;
    });
    assert(thrUnitId, 'Raid fight must deploy isNecroThrall unit into f.A');
    const thrUnit = COMBAT.unit(W, thrUnitId);
    assert(Math.abs(STATS.get(thrUnit).atk - thrUnit.summonStats.atk) <= 2, 'STATS.get(thrUnit).atk must match summonStats.atk');
    fRaid.foes = [];
    COMBAT.conclude(W, fRaid);

    // 2e. Destroy thrall -> item returns once with zero duplication
    NECRO.destroyThrall(W, owner, thNpc, 'ทดสอบทำลาย');
    const invCount = owner.inv.gear.filter(x => x && x.uid === 'WPN_TEST_UNIQUE_1').length;
    const thrallCount = owner.necro.thralls.reduce((s, t) => s + (t.equip && t.equip.WEAPON && t.equip.WEAPON.uid === 'WPN_TEST_UNIQUE_1' ? 1 : 0), 0);
    assert.strictEqual(invCount, 1, 'Returned weapon must appear once in inv.gear');
    assert.strictEqual(thrallCount, 0, 'Destroyed thrall must not still hold weapon');
  }

  // ==================== 3. WRAITH GRIEVANCE ====================
  {
    const W = makeWorld(39705);
    const wraith = addCultNpc(W, 'ผู้ถือบัญชีแค้น', 'WRAITH_GRIEVANCE', 'GRIEVANCE_LEDGER_KEEPER', 3);
    wraith.h.personality.empathy = 85;
    wraith.h.personality.integrity = 80;
    wraith.h.personality.ambition = 20;
    wraith.h.personality.aggression = 15;
    HC.bump(wraith);

    const ally = addCultNpc(W, 'สหายร่วมศึก', 'XIAN', 'SWORD_IMMORTAL', 2);
    const killer = { id: 'FOE_KILLER_1', name: 'มารสังหาร', foe: true, tier: 3, sectId: 'SECT_EVIL', hp: 300, hpMax: 300 };
    const otherFoe = { id: 'FOE_OTHER_2', name: 'มารทั่วไป', foe: true, tier: 3, sectId: 'SECT_OTHER', hp: 300, hpMax: 300 };
    W.foes = [killer, otherFoe];
    W.foeById = { [killer.id]: killer, [otherFoe.id]: otherFoe };

    const fW = COMBAT.startFight(W, [wraith.id, ally.id], [killer.id, otherFoe.id], 'custom', { serious: true });
    // Ensure NO incorporeal spirit unit is spawned
    const spawnedInFight = [].concat(fW.A, fW.B).map(id => COMBAT.unit(W, id)).filter(u => u && u.isSummon);
    assert.strictEqual(spawnedInFight.length, 0, 'WRAITH_GRIEVANCE must not spawn physical/summon units');

    COMBAT.setHp(ally, 0);
    COMBAT.slay(W, fW, killer, ally);
    assert(wraith.necro && wraith.necro.souls.length === 1, 'Wraith must capture slain ally soul');
    const soul = wraith.necro.souls[0];
    assert.strictEqual(soul.killerId, killer.id, 'Soul must record killerId');
    assert.strictEqual(soul.equip, undefined, 'Incorporeal soul must not have equip');
    assert(NECRO.grievanceMult(soul, killer, wraith) > NECRO.grievanceMult(soul, otherFoe, wraith), 'grievanceMult must be higher against killer');
    COMBAT.conclude(W, fW);

    // Daily release vs devour
    soul.resolve = 10;
    wraith.h.state.heartDemon = 30;
    NECRO.daily(W);
    assert.strictEqual(wraith.necro.released, 1, 'High-empathy Wraith must autonomously release fading soul');
    assert(wraith.h.state.heartDemon < 30, 'Releasing soul must reduce heartDemon');

    const devourer = addCultNpc(W, 'ผู้เลี้ยงผีหิว', 'WRAITH_GRIEVANCE', 'HUNGRY_GHOST_STEWARD', 3);
    devourer.h.personality.empathy = 15;
    devourer.h.personality.integrity = 15;
    devourer.h.personality.ambition = 90;
    devourer.h.personality.aggression = 85;
    HC.bump(devourer);
    NECRO.ensure(devourer).souls.push({ uid: 1, nameTh: 'วิญญาณแค้น', tier: 3, element: 'YIN_SHADOW', kind: 'NPC', killerId: 'X', resolve: 10, bornDay: W.day });
    NECRO.daily(W);
    assert.strictEqual(devourer.necro.devoured, 1, 'HUNGRY_GHOST_STEWARD with low integrity must devour fading soul');
  }

  // ==================== 4. DEATHLESS CADAVER ====================
  {
    const W = makeWorld(39706);
    const cad = addCultNpc(W, 'กายไร้ชีพ', 'DEATHLESS_CADAVER', 'UNDYING_FRAME', 4);
    const invNpc = addCultNpc(W, 'ชีพจรเย็น', 'DEATHLESS_CADAVER', 'COLD_PULSE_REVENANT', 4);
    const stillNpc = addCultNpc(W, 'ไขกระดูกนิ่ง', 'DEATHLESS_CADAVER', 'MARROW_STILLNESS_SAGE', 4);
    const foe = { id: 'FOE_CAD', name: 'ศัตรู', foe: true, tier: 4, hp: 500, hpMax: 500 };
    W.foes = [foe]; W.foeById = { [foe.id]: foe };

    const fC = COMBAT.startFight(W, [cad.id, invNpc.id], [foe.id], 'custom', { serious: true });
    const burnedBefore = (cad.ext && cad.ext.burnedLifespanYears) || 0;
    COMBAT.applyDamage(W, fC, foe, cad, 999999, 'โจมตีถึงตาย');
    assert.strictEqual(COMBAT.hp(cad), 1, 'Deathless Cadaver must survive lethal hit at 1 HP');
    assert(!cad.dead, 'Deathless Cadaver must not die on first lethal save');
    assert(STATS.has(cad, 'deathlessFrame', W.t), 'Deathless Cadaver must gain deathlessFrame buff');
    assert.strictEqual((cad.ext && cad.ext.burnedLifespanYears) || 0, burnedBefore + 1, 'Lethal save must burn 1 year lifespan');

    // INVERT poison heal
    COMBAT.setHp(invNpc, Math.max(10, Math.round(COMBAT.hpMax(invNpc) * 0.5)));
    const hpBeforePoison = COMBAT.hp(invNpc);
    STATS.addStatus(invNpc, 'poison', 10, { per: 0.05, src: foe.id }, W.t);
    COMBAT.statusTick(W, fC, invNpc);
    assert(COMBAT.hp(invNpc) >= hpBeforePoison, `COLD_PULSE_REVENANT must not lose HP to poison statusTick (${hpBeforePoison} -> ${COMBAT.hp(invNpc)})`);
    COMBAT.conclude(W, fC);

    // STILL lifeBonus grant & clean removal on path leave
    const baseLifeBonus = stillNpc.cult.lifeBonus || 0;
    NECRO.daily(W);
    assert((stillNpc.cult.lifeBonus || 0) > baseLifeBonus, 'MARROW_STILLNESS_SAGE daily must grant stillLifeBonus');
    stillNpc.cult.path = 'BODY';
    NECRO.daily(W);
    assert.strictEqual(stillNpc.cult.lifeBonus || 0, baseLifeBonus, 'Leaving DEATHLESS_CADAVER must revoke stillLifeGranted');
  }

  // ==================== 5. AUTONOMY / UI / SAVE-LOAD / LOCKS ====================
  {
    const W = makeWorld(39707);
    const seeker = addCultNpc(W, 'ผู้แสวงหาวิถี', 'XIAN', 'SWORD_IMMORTAL', 2);
    seeker.h.personality.curiosity = 95;
    seeker.h.personality.ambition = 90;
    seeker.h.personality.discipline = 85;
    seeker.h.personality.caution = 10;
    seeker.h.intellect.comprehension = 95;
    NECRO.recordDiscovery(W, seeker, 'WRAITH_GRIEVANCE', 'TEST', 'ค้นพบด้วยตนเอง');
    const dec = NECRO.evaluateAdoption(W, seeker, 'WRAITH_GRIEVANCE');
    assert.strictEqual(dec, 'ADOPT', 'High-drive NPC should autonomously adopt discovered necro path');
    assert.strictEqual(seeker.cult.path, 'WRAITH_GRIEVANCE', 'NPC path must change to WRAITH_GRIEVANCE');

    // Save/Load roundtrip
    const cOwner = addCultNpc(W, 'ผู้เซฟ', 'CORPSE_SOVEREIGN', 'CORPSE_BELL_HERDER', 3);
    const wpnProto = (JD.ITEMS.items || []).find(it => it && it.slot === 'WEAPON' && (it.tier || 1) <= 3);
    const wpnInst = Object.assign({}, wpnProto, { uid: 'SAVE_WPN_1', dur: 90 });
    cOwner.inv = cOwner.inv || {}; cOwner.inv.gear = [wpnInst];
    const thSave = NECRO.claimCorpse(W, cOwner, { kind: 'NPC', nameTh: 'ศพเซฟ', tier: 2, element: 'YIN_SHADOW', baseStats: { hp: 120, atk: 25 }, moves: [] });
    assert(thSave && thSave.equip.WEAPON && thSave.equip.WEAPON.id === wpnProto.id, 'Thrall must have weapon before serialize');
    NECRO.ensure(seeker).souls.push({ uid: 9, nameTh: 'วิญญาณเซฟ', tier: 2, element: 'YIN_SHADOW', kind: 'NPC', killerId: 'K1', resolve: 95, bornDay: W.day });

    const raw = SIM.serialize(W);
    const W2 = SIM.deserialize(raw);
    const cOwner2 = W2.byId[cOwner.id];
    const seeker2 = W2.byId[seeker.id];
    assert(cOwner2 && cOwner2.necro && cOwner2.necro.thralls[0] && cOwner2.necro.thralls[0].equip.WEAPON.id === wpnProto.id, 'Save/load must preserve thrall equipped weapon');
    assert(seeker2 && seeker2.necro && seeker2.necro.souls.length === 1 && seeker2.necro.souls[0].killerId === 'K1', 'Save/load must preserve bound souls');

    // UI observer purity check
    const uiSrc = fs.readFileSync(path.resolve(__dirname, '../js/ui.js'), 'utf8');
    const badBtn = /data-do=["'][^"']*(necro|thrall|soul)[^"']*["']/i;
    assert(!badBtn.test(uiSrc), 'ui.js must not contain any player control buttons for necro/thrall/soul');

    // Constitutional SHA-256 locks
    assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain intact');
    assert.strictEqual(sha256(path.resolve(__dirname, '../js/human_core.js')), 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542', 'human_core.js SHA-256 lock violated');
    assert.strictEqual(sha256(path.resolve(__dirname, '../../AGENTS.md')), 'f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4', 'AGENTS.md SHA-256 lock violated');
  }

  console.log('✅ necro_paths_v397_suite: ALL CHECKS PASSED!');
}

run();
