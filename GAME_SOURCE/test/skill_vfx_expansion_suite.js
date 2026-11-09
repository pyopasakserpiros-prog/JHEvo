'use strict';
const assert = require('assert');
const { JD, SK, SIM, COMBAT, STATS } = require('./load');

// This ledger doubles as a no-duplicate gate: every source technique must have
// resolved to null in the v2.6.0 baseline before its new, named shape was added.
const additions = [
  ['ART190_XIAN_016', 'sig_bamboo_reed_sword', 'bamboo_reed_parry'],
  ['ART190_XIAN_028', 'sig_magnetic_arsenal_draw', 'magnetic_weapon_orbit'],
  ['ART190_BODY_008', 'sig_iron_rhino_ramming', 'iron_rhino_rampart'],
  ['ART190_BODY_025', 'sig_eightfold_earthquake', 'octagonal_ground_quake'],
  ['ART190_BODY_035', 'sig_twin_thunder_hammers', 'twin_hammer_anvil'],
  ['ART190_GOD_007', 'sig_divine_bell_mind_ripple', 'mind_bell_resonance'],
  ['ART190_GOD_024', 'sig_primordial_stone_tortoise', 'primordial_stone_tortoise'],
  ['ART190_GOD_035', 'sig_thousand_faith_link', 'linked_votive_network'],
  ['ART_V112_SOUL_MOUNTAIN_RIVER_SCROLL_T4', 'sig_mountain_river_scroll', 'landscape_scroll_expansion'],
  ['ART_V112_SOUL_SEVEN_EMOTION_MIRAGE_T4', 'sig_seven_emotion_mirage', 'seven_emotion_mask_orbit'],
  ['ART_V112_SOUL_MIND_BLADE_FLASH_T3', 'sig_mind_blade_flash', 'psychic_mind_blade'],
  ['ART_BEAST_SOV_003', 'sig_myriad_beast_pack', 'beast_pack_pounce'],
  ['ART_BEAST_SOV_006', 'sig_gu_insect_swarm', 'gu_insect_spiral'],
  ['TECH_V200_SPIRIT_HUSBANDRY_ACT_02', 'sig_iron_thorn_vine_bind', 'iron_thorn_vine_lattice'],
  ['TECH_V200_ARENA_GLORY_ACT_03', 'sig_arena_crowd_roar', 'arena_crowd_roar']
];

assert.equal(additions.length, 15, 'the patch adds at least fifteen authored skill effects');
assert.equal(new Set(additions.map(x => x[0])).size, additions.length, 'each technique is assigned once');
assert.equal(new Set(additions.map(x => x[1])).size, additions.length, 'each effect id is unique');
assert.equal(new Set(additions.map(x => x[2])).size, additions.length, 'each drawing shape is unique');

for (const [techId, fxId, shape] of additions) {
  const tech = JD.TECH.techniques.find(item => item.id === techId);
  assert(tech, techId + ' exists in the current technique catalog');
  assert(SK.SIGNATURE_VFX_CATALOG[fxId], fxId + ' is registered');
  assert.equal(SK.SIGNATURE_VFX_CATALOG[fxId].shape, shape, fxId + ' keeps its ledgered shape');
  assert.equal(SK.TECH_TO_SIGNATURE_VFX[techId], fxId, techId + ' has an explicit technique-to-effect assignment');

  // Remove only this new direct route temporarily, then verify both the parent
  // and every authored move stage still have no old name/path/fallback effect.
  const mapped = SK.TECH_TO_SIGNATURE_VFX[techId];
  delete SK.TECH_TO_SIGNATURE_VFX[techId];
  try {
    assert.equal(SK.resolveSignatureVfx(tech), null, techId + ' had no v2.6.0 fallback effect');
    for (const move of tech.moveDefs || []) {
      assert.equal(SK.resolveSignatureVfx({ ...move, tech: techId }, move), null, move.id + ' had no v2.6.0 move effect');
    }
  } finally {
    SK.TECH_TO_SIGNATURE_VFX[techId] = mapped;
  }
  assert.equal(SK.resolveSignatureVfx(tech), fxId, techId + ' resolves to its new effect');
  for (const move of tech.moveDefs || []) {
    assert.equal(SK.resolveSignatureVfx({ ...move, tech: techId }, move), fxId, move.id + ' inherits its parent effect');
  }

  // Exercise the actual combat-cast snapshot as well as the catalog resolver.
  const W = SIM.create('skill-vfx-' + techId);
  const a = { id: 'vfxCaster', name: 'caster', foe: true, tier: 3, power: 500, hp: 20, hpMax: 100, speed: 1, x: 120, y: 70, sx: [], act: { id: 'fight', ctx: {} } };
  const d = { ...a, id: 'vfxTarget', name: 'target', x: 122, hp: 100, act: { id: 'fight', ctx: {} } };
  a.skl = [{ id: 'vfxSkill', tech: techId, nameTh: 'skill', arch: 'strike', icon: '', tier: 3, type: 'm', cd: 30, wind: 2, M: 12, hits: 1, moves: [] }]; d.skl = [];
  W.foes = [a, d]; W.foeById = { [a.id]: a, [d.id]: d }; const fight = { id: 1, serious: true, A: [a.id], B: [d.id] };
  STATS.now = W.t; COMBAT.attack(W, fight, a, d);
  assert(a.castFx, techId + ' emits a real combat cast event');
  assert.equal(a.castFx.techId, techId, techId + ' remains attached to its cast');
  assert.equal(a.castFx.signatureVfx, fxId, techId + ' reaches the combat renderer with its selected form');
}

// The Faith Network is a friendly, multi-recipient technique. Its cast snapshot
// must retain the real allies, so the VFX can link the recipients rather than
// pretending that this is an enemy-only projectile.
{
  const W = SIM.create('skill-vfx-faith-network');
  const a = { id: 'faithCaster', name: 'caster', foe: true, tier: 3, power: 500, hp: 20, hpMax: 100, speed: 1, x: 120, y: 70, sx: [], act: { id: 'fight', ctx: {} } };
  const d = { ...a, id: 'faithEnemy', name: 'enemy', x: 124, hp: 100, act: { id: 'fight', ctx: {} } };
  const ally = { ...a, id: 'faithAlly', name: 'ally', x: 118, hp: 55, sx: [], skl: [], act: { id: 'fight', ctx: {} } };
  a.skl = [{ id: 'faithSkill', tech: 'ART190_GOD_035', nameTh: 'faith', arch: 'harmonize', icon: '', tier: 3, type: 'm', cd: 30, wind: 2, M: 0, hits: 1, team: true, grantBuff: 'morale', moves: [] }]; d.skl = [];
  W.foes = [a, d, ally]; W.foeById = { [a.id]: a, [d.id]: d, [ally.id]: ally };
  const fight = { id: 1, serious: true, A: [a.id, ally.id], B: [d.id] };
  STATS.now = W.t; COMBAT.attack(W, fight, a, d);
  assert.equal(a.castFx.signatureVfx, 'sig_thousand_faith_link');
  assert(a.castFx.targetPoints.some(point => point.team && point.x === ally.x && point.y === ally.y), 'faith-link cast records the actual allied recipient');
}

assert.equal(Object.keys(SK.SIGNATURE_VFX_CATALOG).length, 45, '30 existing plus 15 new signature effects');
assert.equal(Object.keys(SK.TECH_TO_SIGNATURE_VFX).length, 256, '15 new mappings extend the audited 241-entry baseline');
console.log('PASS skill VFX expansion: 15 unique technique assignments, baseline no-effect audit, and move-stage inheritance');
