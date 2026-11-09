'use strict';
const G=require('./GAME_SOURCE/test/load.js');
const {SIM,ECO,STATS,JD,MARTIAL,CULT}=G;
const W=SIM.create('equipDeepQA_v240_2026_11_08');
const n=W.npcs[0],other=W.npcs[1];
const items=JD.ITEMS.items.filter(x=>x && ['WEAPON','ARMOR','ACCESSORY'].includes(x.slot));
const recipes=JD.ITEMS.recipes.filter(x=>x&&x.outType==='EQUIPMENT');
const tally=(array,key)=>Object.entries(array.reduce((a,x)=>{const k=key(x);a[k]=(a[k]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]);
console.log('catalog',JSON.stringify({items:JD.ITEMS.items.length,equipmentItems:items.length,bySlot:tally(items,x=>x.slot),itemsWithEffects:items.filter(x=>(x.effects||x.fx||[]).length).length,withSkillModifiers:items.filter(x=>Array.isArray(x.skillModifiers)&&x.skillModifiers.length).length,withGrantedSkills:items.filter(x=>Array.isArray(x.grantedSkills)&&x.grantedSkills.length).length,withComposable:items.filter(x=>x.composableEffects).length,legendary:items.filter(x=>x.legendary).length,recipes:recipes.length,proceduralRecipes:JD.ITEMS.recipes.filter(x=>x.proceduralOut).length,byTier:tally(items,x=>x.tier)}));
console.log('effectTypes',JSON.stringify(tally(items.flatMap(x=>x.effects||x.fx||[]),x=>x.effectId||x.id).slice(0,16)));
const src=items.find(x=>x.slot==='WEAPON'&&x.tier>=3&&!x.st)||items.find(x=>x.slot==='WEAPON'&&x.tier>=3);
const gear=ECO.mintGear(W,src,1.0); console.log('samplegear',JSON.stringify({source:src.id,tier:gear.tier,stAlready:!!gear.st,fx:gear.fx?.length,skills:gear.grantedSkills?.length}));
function record(label, val){console.log(label,JSON.stringify(val));}
// Test unrestricted growing-weapon path, with a procedural item that already has affix stats
const e=ECO.rollProceduralGear(W,{slot:'WEAPON',gearType:'SWORD',tier:4,baseQ:1.02});const initial={tier:e.tier,q:e.q,st:{...e.st},affixes:e.affixes.map(x=>({...x}))};
[1,2,3,10,25].forEach(count=>{while((e.killTracker?.kills||0)<count)ECO.recordWeaponKill(W,n,e,{tier:1});});
record('EVOLUTION',{initial,after:{tier:e.tier,q:e.q,st:e.st,affixes:e.affixes,tracker:e.killTracker},statsRegenerated:!!e.st,affixIdsRemain:e.affixes.map(x=>x.id)});
// tests: two same base stat datasets, with / without priming cache
const gg=ECO.mintGear(W,src,1);const gPrime=JSON.parse(JSON.stringify(gg)),gCold=JSON.parse(JSON.stringify(gg));gPrime.uid='uid_case_prime_18001';gCold.uid='uid_case_cold_18002';
STATS.gearStats(gPrime);
W.sect.gear.push(gPrime,gCold); const cids=Object.values(ECO.REFINEMENT_CATALYSTS);const cat=cids.find(x=>x.minGearTier<=(src.tier||1)&&((x.maxGearTier||7)>=(src.tier||1)))||cids[0];ECO.addCatalyst(W,cat.id,3);
const preStat=JSON.parse(JSON.stringify(gPrime.st));const rp=ECO.refineGearWithCatalyst(W,gPrime,cat.id,null,{allowAnyTier:true});const rc=ECO.refineGearWithCatalyst(W,gCold,cat.id,null,{allowAnyTier:true});record('REFINE_COLD_VS_PRIMED',{src:src.id,cat:cat.id,preStat,coldQ:gCold.q,primeQ:gPrime.q,ready:rp.ok,cold:rc.ok,primeAtk:gPrime.st&&gPrime.st.atk,coldAtk:gCold.st&&gCold.st.atk,primeStats:gPrime.st,coldStats:gCold.st});
// Invalid socket grants reaction and modifiers rather than rejecting invalid elements.
const rune=ECO.rollProceduralGear(W,{slot:'WEAPON',gearType:'SWORD',tier:3});const mat=Object.keys(W.sect.stock).find(id=>ECO.count(W,id)>0&&!ECO.isPill(id)&&!['grain','meal'].includes(id));if(!mat) ECO.add(W,'MAT_ORE_BLACK_IRON_1',2); W.sect.stones=1000;
const sock=ECO.socketElementalRunes(W,n,rune,['ELEMENT_UNKNOWN_A','ELEMENT_UNKNOWN_B']);record('RUNE_UNKNOWN',{ok:sock.ok,reason:sock.reason,embeddedReaction:rune.embeddedReaction,runes:rune.elementalSockets,mod:rune.skillModifiers,gearOwned:W.sect.gear.includes(rune)||Object.values(n.equip||{}).includes(rune)});
const sock2=ECO.socketElementalRunes(W,n,rune,['FIRE','FIRE']);record('RUNE_DUPLICATED_ELEMENT',{ok:sock2.ok,reason:sock2.reason,embeddedReaction:rune.embeddedReaction,runes:rune.elementalSockets});
// Retire detached object repeatedly should be rejected or salvage exactly once
const detached=ECO.rollProceduralGear(W,{slot:'WEAPON',gearType:'SWORD',tier:4});const before=ECO.count(W,'MAT_ORE_COLD_STEEL_2');const t1=ECO.retireGear(W,n,detached,{quiet:true}),t2=ECO.retireGear(W,n,detached,{quiet:true});record('REPEAT_SALVAGE_DETACHED',{before,after:ECO.count(W,'MAT_ORE_COLD_STEEL_2'),first:t1.ok,second:t2.ok,inOwned:false});
// Repeat salvage with normal owned object should fail after first
const owned=ECO.rollProceduralGear(W,{slot:'WEAPON',gearType:'SWORD',tier:4});n.inv.gear=n.inv.gear||[];n.inv.gear.push(owned);const ot1=ECO.retireGear(W,n,owned,{quiet:true}),ot2=ECO.retireGear(W,n,owned,{quiet:true});record('REPEAT_SALVAGE_OWNED',{first:ot1.ok,second:ot2.ok,remainingBag:n.inv.gear.some(g=>g===owned)});
// curse: bonus and no live drain call except return value
const curse=ECO.mintGear(W,src,1.2);curse.cursed=true;curse.cursePurified=false;n.equip.WEAPON=curse; n.cult.stage=Math.max(n.cult.stage,6); const hp0=n.h.state.hp;STATS.dirty(n);const stat0=STATS.get(n);const condition=ECO.evaluateSoulBoundCondition(n,curse);record('CURSE_STAT_AND_HP',{condition, hpBefore:hp0,hpAfter:n.h.state.hp,statAtk:stat0.atk,statMatk:stat0.matk,gearUsable:MARTIAL.gearUsable(n,curse)});
// stats cache after modifying weapon stat object in-place without touching owner (e.g. socket done by different smith)
const owner=W.npcs[2];owner.cult.stage=6;const own=ECO.rollProceduralGear(W,{slot:'WEAPON',gearType:'SWORD',tier:3});owner.equip.WEAPON=own;STATS.dirty(owner);const beforeStat=STATS.get(owner);const beforeGs={...STATS.gearStats(own)};const sockets=ECO.socketElementalRunes(W,n,own,['FIRE','WATER_ICE']);const afterStat=STATS.get(owner);record('RUNE_EQUIPPED_OTHER_OWNER',{socketOk:sockets.ok,sameStatRef:beforeStat===afterStat, beforeAtk:beforeStat.atk,afterAtk:afterStat.atk, beforeGear:beforeGs,afterGear:own.st,mods:own.skillModifiers});
// complete coverage metric
record('EFFECT_COVERAGE',ECO.verifyItemEffectRuntimeCoverage());
