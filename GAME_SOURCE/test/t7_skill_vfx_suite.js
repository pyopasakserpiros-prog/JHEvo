'use strict';
const assert=require('assert'),g=require('./load');require('../js/render');
const {SK,JD,SIM,COMBAT,STATS,Render:R,CULT}=g;
function rec(){let depth=0;const ops=[];const ctx=new Proxy({globalAlpha:1},{get(o,k){if(k in o)return o[k];return(...args)=>{if(k==='save')depth++;if(k==='restore')depth--;for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),k);ops.push([k,...args]);};},set(o,k,v){o[k]=v;ops.push([k,v]);return true;}});return{ctx,ops,balance:()=>assert.equal(depth,0)};}
function view(W){return Object.assign({W,opts:{quality:'high'},t:.5,cam:{x:1920,y:1120,z:1},vw:1000,vh:700,castClock:0,castLastTime:null,castActive:new Map(),castSeen:new Map(),npcPos:n=>n},R.methods);}
const techs=JD.TECH.techniques.filter(t=>t.tier===7&&!t.legendary),catalog=SK.T7_VFX_CATALOG;
assert.equal(techs.length,71);assert.equal(Object.keys(catalog).length,71);assert.equal(SK.NONLEGENDARY_VFX_BUDGET[7].planned,false);assert(SK.NONLEGENDARY_VFX_BUDGET[7].rMax<R.LEGENDARY_APEX_BUDGET.radiusMin);assert(SK.NONLEGENDARY_VFX_BUDGET[7].life<Math.min(...Object.values(R.LEGENDARY_SCENES).map(s=>s.life)));
for(const t of techs){
 assert(catalog[t.id]);assert.equal(SK.resolveSignatureVfx(t),catalog[t.id].oldSignature,'prior Signature mapping/resolver remains unchanged');assert.equal(SK.resolveT7Vfx(t),catalog[t.id]);
 const W=SIM.create('t7-'+t.id),r=view(W),a={id:'t7Caster',name:'caster',foe:true,tier:7,power:500,hp:20,hpMax:100,speed:1,x:120,y:70,sx:[],act:{id:'fight',ctx:{}},skl:[t.moveDefs?.length?SK.moveProfile(t,t.moveDefs[0]):SK.profile(t)]},d={...a,id:'t7Enemy',hp:100,x:122,sx:[],skl:[]};W.foes=[a,d];W.foeById={[a.id]:a,[d.id]:d};STATS.now=W.t;COMBAT.useSkill(W,{id:1,serious:true,A:[a.id],B:[d.id]},a,d,a.skl[0]);assert(a.castFx,t.id);r.updateCastEffects(100);const fx=r.castActive.get('foe:'+a.id);assert.equal(fx.t7Vfx,t.id);assert.equal(fx.life,1450);assert.equal(fx.x,a.castFx.x*16);
 const before=SIM.serialize(W),rng=JSON.stringify(W.rng.getState()),c=rec();r.drawCastEffects(c.ctx);c.balance();assert.equal(SIM.serialize(W),before);assert.equal(JSON.stringify(W.rng.getState()),rng);
 for(const m of t.moveDefs||[]){r.castActive.clear();const p=SK.moveProfile(t,m);a.castFx={...a.castFx,seq:a.castFx.seq+1,legendary:false,signatureVfx:p.signatureVfx,fxKind:p.fxKind,moveId:p.moveId,arch:p.arch,kind:p.arch==='forbid'?'forbidden':'normal'};r.updateCastEffects(105);assert.equal(r.castActive.get('foe:'+a.id).t7Vfx,t.id,m.id+' actual authored stage metadata routes to T7');}
 a.castFx.seq++;a.castFx.legendary=true;r.updateCastEffects(110);assert.equal(r.castActive.get('foe:'+a.id).t7Vfx,null,'authoritative Legendary event retains priority');
}
for(const t of JD.TECH.techniques.filter(t=>t.tier!==7||t.legendary))assert.equal(SK.resolveT7Vfx(t),null);
// Prefix/grade labels do not replace the game's authoritative named-Legendary flag.
for(const id of ['LEG_V240_GOD','LEG_V240_CRAFT_CREATION']){assert.equal(CULT.tech(id).legendary,false);assert(SK.resolveT7Vfx(CULT.tech(id)));}
for(const id of ['MP_STAFF_EARTH_GOD_BLESSING_T7','ART_V212_SAGE_APEX_T7','TECH_V234_STRATEGY_GOVERNANCE_ACT_12','ART190_BODY_078']){
 const t=CULT.tech(id),p=t.moveDefs?.length?SK.moveProfile(t,t.moveDefs[0]):SK.profile(t),W=SIM.create('t7-target-'+id),r=view(W);
 const a={id:'caster',name:'caster',foe:true,tier:7,power:500,hp:20,hpMax:100,speed:1,x:120,y:70,sx:[],act:{id:'fight',ctx:{}},skl:[p]},d={...a,id:'enemy',hp:100,x:121,sx:[],skl:[]},ally={...a,id:'ally',hp:2,x:118,sx:[],skl:[]};W.foes=[a,d,ally];W.foeById={caster:a,enemy:d,ally};STATS.now=W.t;COMBAT.attack(W,{id:7,serious:true,A:['caster','ally'],B:['enemy']},a,d);assert(a.castFx,t.id);r.updateCastEffects(100);const fx=r.castActive.get('foe:caster');assert.equal(fx.t7Vfx,id);assert.equal(fx.x,a.castFx.x*16);assert.deepEqual(fx.targetPoints,a.castFx.targetPoints.map(p=>({...p,x:p.x*16,y:p.y*16})));
}
const W=SIM.create('t7-shapes'),r=view(W);
for(const quality of ['high','low'])for(const reduced of [false,true]){r.opts.quality=quality;const keys=new Set();for(const t of techs){const fx={techId:t.id,signatureVfx:SK.resolveSignatureVfx(t),weaponType:t.weaponTypes?.[0]||'FIST',arch:SK.profile(t)?.arch,angle:.2},c=rec();assert(r.drawT7SkillVfx(c.ctx,fx,.5,reduced));c.balance();keys.add(JSON.stringify(c.ops));if(reduced){const d=rec();r.drawT7SkillVfx(d.ctx,fx,.9,true);assert.deepEqual(c.ops,d.ops);}}assert.equal(keys.size,71);}
// Full T7 forms are bounded; a visible Legendary scene reduces the T7 budget.
for(const quality of ['high','low']){r.opts.quality=quality;r.castClock=700;r.castActive=new Map(techs.slice(0,24).map((t,i)=>[i,{t7Vfx:t.id,techId:t.id,ownerId:i+1,start:0,life:1450,x:100,y:100}]));let full=0;const spy=Object.assign({},r,{drawT7SkillVfx(c,f,p,red,detail){if(detail)full++;},drawLegendaryArtVfx(){}});spy.drawCastEffects(rec().ctx);assert.equal(full,quality==='low'?1:3);r.castActive.set('legend',{legendary:true,techId:'LEG_COMBAT_DUGU_NINE_SWORDS',ownerId:'legend',start:0,life:2100,x:120,y:100});full=0;spy.drawCastEffects(rec().ctx);assert.equal(full,1);}
const gear=JD.ITEMS.items.filter(it=>it.tier===7&&it.out==='EQUIPMENT'&&!it.legendary);assert.equal(gear.length,85);assert.equal(new Set(gear.map(it=>it.gearType||it.subType)).size,25);
const n=W.npcs[0];n.cult.stage=9;n.cult.path='XIAN';
for(const item of gear){const it={...item,minStage:1,compatiblePath:['ANY'],compatiblePaths:['ANY']};n.equip={test:it};const c=rec();assert(r.drawT7EquipmentAura(c.ctx,n,{},0),it.id+' T7 type aura');c.balance();}
n.equip={WEAPON:{...gear[0],tier:6,minStage:1}};assert.equal(r.drawT7EquipmentAura(rec().ctx,n,{},0),false);
n.equip={WEAPON:{...gear[0],legendary:true,minStage:1}};assert.equal(r.drawT7EquipmentAura(rec().ctx,n,{},0),false);
n.equip={WEAPON:{...gear[0],procedural:true,dur:0,minStage:1}};assert.equal(r.drawT7EquipmentAura(rec().ctx,n,{},0),false);assert.equal(r.drawEquipmentTierAura(rec().ctx,n,{highestGearTier:7},0),false,'broken T7 does not fall back to a glowing generic ring');
// Rapid repeated casts of the same T7 must reach release at high simulation speeds.
{
 const world=SIM.create('t7-rapid-repeat'),rr=view(world);world.speed=1;
 const a={id:'rapid',foe:true,x:120,y:70,castFx:{seq:1,t:world.t,techId:'MP_SPEAR_SOVEREIGN_SKY_SPLIT_T7',moveId:'rapid',arch:'pierce',tier:7,x:121,y:70}};world.foes=[a];rr.updateCastEffects(100);
 for(let time=200;time<=800;time+=100){a.castFx={...a.castFx,seq:a.castFx.seq+1,x:122};rr.updateCastEffects(time);}
 const f=rr.castActive.get('foe:rapid');assert(rr.castClock-f.start>=650,'rapid recasts do not indefinitely restart T7 before release');assert.equal(f.x,121*16,'a held effect keeps its original actual snapshot');
 a.castFx={...a.castFx,seq:a.castFx.seq+1,techId:'ART190_BODY_040'};rr.updateCastEffects(820);assert.equal(rr.castActive.get('foe:rapid').techId,'ART190_BODY_040','a different technique is never held back');
}
// Preserve attunement motes and verify the entire owner accent stays read-only/static in Reduced Motion.
n.equip={WEAPON:{...gear[0],minStage:1,compatiblePath:['ANY'],compatiblePaths:['ANY']}};r.isReducedMotion=()=>true;
const saved=SIM.serialize(W),rngState=JSON.stringify(W.rng.getState()),c1=rec(),c2=rec();r.t=.1;r.drawT7EquipmentAura(c1.ctx,n,{totalGearStars:3},0);r.t=.9;r.drawT7EquipmentAura(c2.ctx,n,{totalGearStars:3},0);assert.deepEqual(c1.ops,c2.ops);assert(c1.ops.some(op=>op[0]==='fillRect'),'star-attunement motes retained');c1.balance();c2.balance();assert.equal(SIM.serialize(W),saved);assert.equal(JSON.stringify(W.rng.getState()),rngState);
console.log('PASS T7 VFX: 71 ordinary T7 skills, old Signature identity preservation, targets/purity/rarity/crowd limits, 85 equipment templates / 25 current types');
