'use strict';
// Reproducible catalog/eligibility snapshot. Output is a diagnostic upper bound,
// not a claim that every item or manual can be obtained during normal play.
const { SIM, CULT, MARTIAL, JD } = require('../../GAME_SOURCE/test/load.js');
const weapons = JD.ITEMS.items.filter(i => i.slot === 'WEAPON' && i.gearType);
const techniques = JD.TECH.techniques;
const allIds = techniques.map(t => t.id);
const world = SIM.create('coverage-audit-v211');
const npc = world.npcs[0];
const csv = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
const fields = ['path','subpath','name_th','stage','max_stage','equivalent_stage','effective_tech_stage','preferred_weapons','profile_elements','matching_gear_count','matching_gear_tiers','matching_gear_examples','learnable_preferred_weapon_tech_count','learnable_preferred_weapon_element_tech_count','learnable_element_tech_examples','direct_subpath_tech_count','direct_subpath_reqtiers'];
console.log(fields.join(','));
for (const [path, def] of Object.entries(CULT.PATHS)) {
  for (const sub of def.subPaths || []) {
    const types = MARTIAL.PROFILES[sub.id]?.[3] || [];
    const elements = Object.keys(sub.elementProfile?.weights || {});
    if (!elements.length && sub.element) elements.push(sub.element);
    npc.cult.path = path; npc.cult.sub = sub.id; npc.cult.track = null; npc.cult.techs = [];
    const max = CULT.maxStage(npc);
    const explicit = techniques.filter(t => t.sub === sub.id || t.compatibleSubs?.includes(sub.id));
    for (let stage = 1; stage <= max; stage++) {
      npc.cult.stage = stage;
      const eff = CULT.effectiveTechStage(npc);
      const gear = weapons.filter(i => types.includes(i.gearType) && elements.includes(i.elementProfile?.primary || i.element) && (i.minStage || 1) <= eff + 1 && (!i.compatiblePath || (Array.isArray(i.compatiblePath) ? i.compatiblePath : [i.compatiblePath]).some(p => p === 'ANY' || p === path)));
      const usable = CULT.learnable(npc, allIds).map(id => CULT.tech(id)).filter(t => t.weaponTypes?.some(w => types.includes(w)));
      const elemental = usable.filter(t => elements.includes(t.elementProfile?.primary || t.element));
      const values = [path,sub.id,sub.nameTh,stage,max,CULT.equivalentStage(npc),eff,types.join('|'),elements.join('|'),gear.length,[...new Set(gear.map(i=>i.tier))].sort((a,b)=>a-b).join('|'),gear.slice(0,5).map(i=>i.id).join('|'),usable.length,elemental.length,elemental.slice(0,5).map(t=>t.id).join('|'),explicit.length,[...new Set(explicit.map(t=>t.reqTier||t.tier))].sort((a,b)=>a-b).join('|')];
      console.log(values.map(csv).join(','));
    }
  }
}
