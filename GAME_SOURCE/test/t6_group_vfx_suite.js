'use strict';
const assert=require('assert'),g=require('./load');require('../js/render');
const {SK,JD,SIM,COMBAT,STATS,Render:R,CULT}=g;
function rec(){let depth=0;const ops=[];const ctx=new Proxy({globalAlpha:1},{get(o,k){if(k in o)return o[k];return(...args)=>{if(k==='save')depth++;if(k==='restore')depth--;assert(depth>=0,'Canvas restore underflow');for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),k);ops.push([k,...args]);};},set(o,k,v){o[k]=v;ops.push([k,v]);return true;}});return{ctx,ops,balance:()=>assert.equal(depth,0)};}
function view(W){return Object.assign({W,opts:{quality:'high'},t:.5,cam:{x:1920,y:1120,z:1},vw:1000,vh:700,castClock:0,castLastTime:null,castActive:new Map(),castSeen:new Map(),npcPos:n=>n},R.methods);}
function actors(W,p){const a={id:'caster',name:'caster',foe:true,tier:6,power:500,hp:20,hpMax:100,speed:1,x:120,y:70,sx:[],act:{id:'fight',ctx:{}},skl:[p]},d={...a,id:'enemy',hp:100,x:121,sx:[],skl:[]},ally={...a,id:'ally',hp:2,x:118,sx:[],skl:[]};W.foes=[a,d,ally];W.foeById={caster:a,enemy:d,ally};return{a,d,ally,f:{id:6,serious:true,A:[a.id,ally.id],B:[d.id]}};}
const ids=Object.keys(SK.TECH_TO_T6_VFX),families=Object.keys(SK.T6_VFX_FAMILIES),passives=Object.keys(SK.PASSIVE_TO_T6_VFX);
assert.equal(families.length,50);assert.equal(ids.length,114);assert.equal(passives.length,8);assert.deepEqual(new Set(Object.values(SK.TECH_TO_T6_VFX)),new Set(families));
assert.equal(SK.NONLEGENDARY_VFX_BUDGET[6].planned,false);assert(SK.NONLEGENDARY_VFX_BUDGET[6].rMax<SK.NONLEGENDARY_VFX_BUDGET[7].rMin);assert(SK.NONLEGENDARY_VFX_BUDGET[6].life<SK.NONLEGENDARY_VFX_BUDGET[7].life);
assert.equal(Object.keys(SK.SIGNATURE_VFX_CATALOG).length,45);assert.equal(Object.keys(SK.TECH_TO_SIGNATURE_VFX).length,256);
let stages=0;
for(const id of ids){
 const t=CULT.tech(id);assert.equal(t.tier,6);assert(!t.legendary);assert(SK.profile(t),id+' is a real active skill, not a named mantra');assert.equal(SK.resolveT6Vfx(t),SK.TECH_TO_T6_VFX[id]);
 const W=SIM.create('t6-'+id),r=view(W),p=t.moveDefs?.length?SK.moveProfile(t,t.moveDefs[0]):SK.profile(t),{a,d,f}=actors(W,p);STATS.now=W.t;
 // Exercise the real producer with its authored first move, not a fabricated generic profile.
 COMBAT.useSkill(W,f,a,d,p);assert(a.castFx,id+' produced cast');r.updateCastEffects(100);const fx=r.castActive.get('foe:caster');assert.equal(fx.t6Vfx,SK.TECH_TO_T6_VFX[id],id);assert.equal(fx.life,1250);assert.equal(fx.x,a.castFx.x*16);assert.equal(fx.y,a.castFx.y*16);assert.deepEqual(fx.targetPoints,a.castFx.targetPoints.map(p=>({...p,x:p.x*16,y:p.y*16})));
 const before=SIM.serialize(W),rng=JSON.stringify(W.rng.getState()),c=rec();r.drawCastEffects(c.ctx);c.balance();assert.equal(SIM.serialize(W),before);assert.equal(JSON.stringify(W.rng.getState()),rng);
 for(const m of t.moveDefs||[]){stages++;r.castActive.clear();const mp=SK.moveProfile(t,m);a.castFx={...a.castFx,seq:a.castFx.seq+1,signatureVfx:mp.signatureVfx,fxKind:mp.fxKind,moveId:mp.moveId,arch:mp.arch,kind:mp.arch==='forbid'?'forbidden':'normal'};r.updateCastEffects(105);assert.equal(r.castActive.get('foe:caster').t6Vfx,SK.TECH_TO_T6_VFX[id],m.id+' authored child metadata');}
 assert.equal(SK.resolveT6Vfx(t,{fxKind:'custom'}),null);assert.equal(SK.resolveT6Vfx(t,{signatureVfx:'sig_meteor_sword_rain'}),null);
 a.castFx={...a.castFx,seq:a.castFx.seq+1,signatureVfx:'sig_luoshen_water_goddess'};r.updateCastEffects(110);assert.equal(r.castActive.get('foe:caster').t6Vfx,null,'explicit event artwork wins');
 a.castFx={...a.castFx,seq:a.castFx.seq+1,legendary:true};r.updateCastEffects(115);assert.equal(r.castActive.get('foe:caster').t6Vfx,null,'authoritative Legendary wins');
}
assert.equal(stages,207);
for(const t of JD.TECH.techniques.filter(t=>t.tier!==6||t.legendary||!SK.TECH_TO_T6_VFX[t.id]))assert.equal(SK.resolveT6Vfx(t),null,'unselected art stays unchanged');
assert.equal(SK.resolveT6Vfx({id:'unknown',tier:6}),null);
// The actual combat selector still supplies self/friendly/hostile anchors and recipients.
for(const id of ['ART190_XIAN_060','MP_FOCUS_GRANDMASTER_FAN_T6','TECH_V222_14','ART_V212_SOUL_DREAM_T6','MP_FOCUS_CAULDRON_FIRE_T6','MP_FIST_GRANDMASTER_PINNACLE_T6','ART_V112_DEMON_MYRIAD_VENOM_DOMAIN_T6']){
 const t=CULT.tech(id),p=t.moveDefs?.length?SK.moveProfile(t,t.moveDefs[0]):SK.profile(t),W=SIM.create('t6-target-'+id),r=view(W),{a,d,ally,f}=actors(W,p);STATS.now=W.t;COMBAT.attack(W,f,a,d);assert(a.castFx,id+' authored attack cast');r.updateCastEffects(100);const fx=r.castActive.get('foe:caster');assert.equal(fx.t6Vfx,SK.TECH_TO_T6_VFX[id]);assert.equal(fx.x,a.castFx.x*16);assert.deepEqual(fx.targetPoints,a.castFx.targetPoints.map(p=>({...p,x:p.x*16,y:p.y*16})));if(p.arch==='heal')assert.equal(fx.x,ally.x*16);if(p.arch==='support'||p.arch==='harmonize')assert(fx.targetPoints.some(pt=>pt.team&&pt.x===ally.x*16));
}
const W=SIM.create('t6-draw'),r=view(W);
// 50 real silhouettes in all modes. Same group + same role reuses exactly the same art.
for(const quality of ['high','low'])for(const reduced of [false,true]){
 r.opts.quality=quality;const shapes=new Set();
 for(const family of families){const members=ids.filter(id=>SK.TECH_TO_T6_VFX[id]===family),fx={techId:members[0],t6Vfx:family,arch:'strike',angle:.2,signatureVfx:'old-core-a'},c=rec();assert(r.drawT6SkillVfx(c.ctx,fx,.5,reduced));c.balance();shapes.add(JSON.stringify(c.ops));
  for(const id of members.slice(1)){const d=rec();r.drawT6SkillVfx(d.ctx,{...fx,techId:id,signatureVfx:'old-core-b'},.5,reduced);d.balance();assert.deepEqual(c.ops,d.ops,'group identity is shared, not seeded by tech ID');}
  if(reduced){const d=rec();r.drawT6SkillVfx(d.ctx,fx,.9,true);assert.deepEqual(c.ops,d.ops,'Reduced Motion freezes shape/release');}
 }
 assert.equal(shapes.size,50,quality+' '+reduced);
}
// Full forms: 3 normal, 1 Low or alongside higher tiers; at most one full art per owner.
for(const quality of ['high','low']){
 r.opts.quality=quality;r.castClock=500;r.castActive=new Map(ids.slice(0,24).map((id,i)=>[i,{techId:id,t6Vfx:SK.TECH_TO_T6_VFX[id],ownerId:i+1,start:0,life:1250,x:100,y:100}]));let full=0;
 const spy=Object.assign({},r,{drawT6SkillVfx(c,f,p,red,detail){if(detail)full++;},drawT7SkillVfx(){},drawLegendaryArtVfx(){}});spy.drawCastEffects(rec().ctx);assert.equal(full,quality==='low'?1:3);
 r.castActive.set('t7',{t7Vfx:'ART190_BODY_040',techId:'ART190_BODY_040',ownerId:1,start:0,life:1450,x:100,y:100});full=0;spy.drawCastEffects(rec().ctx);assert.equal(full,1);
 r.castActive.clear();for(let i=0;i<4;i++)r.castActive.set(i,{techId:ids[i],t6Vfx:SK.TECH_TO_T6_VFX[ids[i]],ownerId:'same-owner',start:0,life:1250,x:100,y:100});full=0;spy.drawCastEffects(rec().ctx);assert.equal(full,1);
 r.castActive.set('legend',{legendary:true,techId:'LEG_COMBAT_DUGU_NINE_SWORDS',ownerId:'same-owner',start:0,life:2100,x:100,y:100});full=0;spy.drawCastEffects(rec().ctx);assert.equal(full,0,'owner with a Legendary scene gets no second full T6 form');
}
const n=W.npcs[0];n.cult.stage=9;r.selected=n.id;
for(const id of passives){const t=CULT.tech(id);n.cult.path=t.path==='ANY'?'XIAN':t.path;n.cult.sub=t.sub||n.cult.sub;n.equip={WEAPON:{...JD.ITEMS.items.find(it=>it.out==='EQUIPMENT'&&(it.gearType||it.subType)===(t.weaponTypes?.[0]||'SWORD')),minStage:1,compatiblePath:['ANY'],compatiblePaths:['ANY']},ARMOR:{...JD.ITEMS.items.find(it=>it.out==='EQUIPMENT'&&(it.gearType||it.subType)===(t.armorTypes?.[0]||'ROBE')),minStage:1,compatiblePath:['ANY'],compatiblePaths:['ANY']}};n.cult.techs=[id];n.passiveLoadout=[id];n.passiveUnequipped=[];const c=rec();assert.equal(r.drawCommonPassiveAura(c.ctx,n,'fight'),id);c.balance();n.passiveUnequipped=[id];assert.equal(r.drawCommonPassiveAura(rec().ctx,n,'fight'),false);}
const gear=JD.ITEMS.items.filter(it=>it.tier===6&&it.out==='EQUIPMENT'&&!it.legendary);assert.equal(gear.length,117);const raw=new Set(gear.map(it=>it.gearType||it.subType)),normalize=t=>({LIGHT_ARMOR:'LIGHT',HEAVY_ARMOR:'HEAVY'})[t]||t;assert.equal(raw.size,27);assert.equal(new Set([...raw].map(normalize)).size,25);
n.cult.path='XIAN';for(const item of gear){n.equip={test:{...item,minStage:1,compatiblePath:['ANY'],compatiblePaths:['ANY']}};const c=rec();assert(r.drawT6EquipmentAura(c.ctx,n,{},0),item.id+' usable T6 gear');c.balance();}
n.equip={test:{...gear[0],tier:7,minStage:1}};assert.equal(r.drawT6EquipmentAura(rec().ctx,n,{},0),false);
n.equip={test:{...gear[0],legendary:true,minStage:1}};assert.equal(r.drawT6EquipmentAura(rec().ctx,n,{},0),false);
n.equip={test:{...gear[0],procedural:true,dur:0,minStage:1}};assert.equal(r.drawT6EquipmentAura(rec().ctx,n,{},0),false);assert.equal(r.drawEquipmentTierAura(rec().ctx,n,{highestGearTier:6},0),false,'broken T6 does not gain the old generic glow');
// A lower ordinary piece must not replace the existing higher named-Legendary halo.
n.equip={WEAPON:{tier:7,legendary:true},ARMOR:{tier:6,slot:'ARMOR',type:'ARMOR'}};assert.equal(r.drawEquipmentTierAura(rec().ctx,n,{highestGearTier:7},0),true,'higher named-Legendary halo survives mixed legacy-tagged T6 equipment');
for(const [rawType,type] of [['LIGHT_ARMOR','LIGHT'],['HEAVY_ARMOR','HEAVY']]){const a=rec(),b=rec();r.drawT7EquipmentGlyph(a.ctx,rawType,5);r.drawT7EquipmentGlyph(b.ctx,type,5);assert.deepEqual(a.ops,b.ops,'legacy tags normalize to existing type glyphs');}
n.equip={test:{...gear[0],minStage:1,compatiblePath:['ANY'],compatiblePaths:['ANY']}};r.isReducedMotion=()=>true;const before=SIM.serialize(W),rng=JSON.stringify(W.rng.getState()),c1=rec(),c2=rec();r.t=.1;r.drawT6EquipmentAura(c1.ctx,n,{totalGearStars:3},0);r.t=.9;r.drawT6EquipmentAura(c2.ctx,n,{totalGearStars:3},0);assert.deepEqual(c1.ops,c2.ops);assert(c1.ops.some(op=>op[0]==='fillRect'));assert.equal(SIM.serialize(W),before);assert.equal(JSON.stringify(W.rng.getState()),rng);
// Fast recasts reach release while preserving the original real target snapshot.
{
 const world=SIM.create('t6-repeat'),rr=view(world);world.speed=1;const a={id:'rapid',foe:true,x:120,y:70,castFx:{seq:1,t:world.t,techId:ids[0],moveId:'rapid',arch:'burst',tier:6,x:121,y:70}};world.foes=[a];rr.updateCastEffects(100);
 for(let time=200;time<=700;time+=100){a.castFx={...a.castFx,seq:a.castFx.seq+1,x:122};rr.updateCastEffects(time);}const f=rr.castActive.get('foe:rapid');assert(rr.castClock-f.start>=550);assert.equal(f.x,121*16);
 a.castFx={...a.castFx,seq:a.castFx.seq+1,techId:ids[1]};rr.updateCastEffects(720);assert.equal(rr.castActive.get('foe:rapid').techId,ids[1],'different art bypasses repeat hold even within the same group');
 a.castFx={...a.castFx,seq:a.castFx.seq+1,signatureVfx:'sig_luoshen_water_goddess'};rr.updateCastEffects(730);assert.equal(rr.castActive.get('foe:rapid').t6Vfx,null);
}
console.log('PASS T6: 50 shared shapes, 114 real skill producers / 207 authored move routes, 8 eligible passives, targets/purity/modes/caps, 117 gear templates / 25 semantic types (27 raw tags)');
