'use strict';
const assert=require('assert'),g=require('./load');require('../js/render');
const {Render:R,SK,SIM,COMBAT,STATS,CULT}=g;
function recorder(){let depth=0;const ops=[];const ctx=new Proxy({globalAlpha:1},{get(o,k){if(k in o)return o[k];return(...args)=>{if(k==='save')depth++;if(k==='restore')depth--;for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),k+' must be finite');ops.push([k,...args]);};},set(o,k,v){o[k]=v;ops.push([k,v]);return true;}});return{ctx,ops,balanced:()=>assert.equal(depth,0)};}
function view(W){return Object.assign({W,t:.4,opts:{quality:'high'},cam:{x:120*16,y:70*16,z:1},vw:1000,vh:700,castClock:0,castLastTime:null,castSeen:new Map(),castActive:new Map(),npcPos:n=>n},R.methods);}
assert.equal(Object.keys(R.LEGENDARY_SCENES).length,47);assert.equal(Object.keys(R.LEGENDARY_RELIC_SCENES).length,27);
assert.equal(Object.keys(SK.COMMON_VFX_CATALOG).length,30);assert.equal(Object.keys(SK.T3_VFX_CATALOG).length,24);assert.equal(Object.keys(SK.SIGNATURE_VFX_CATALOG).length,45);
assert.equal(SK.NONLEGENDARY_VFX_BUDGET[7].planned,false);assert(SK.NONLEGENDARY_VFX_BUDGET[7].rMax<R.LEGENDARY_APEX_BUDGET.radiusMin);
const W=SIM.create('legendary-apex'),r=view(W),phases=[.08,.34,.56,.9];
for(const quality of ['high','low'])for(const reduced of [false,true]){
 r.opts.quality=quality;
 for(const [id,s]of Object.entries(R.LEGENDARY_SCENES)){
  assert(s.life>=2100&&s.life<=2500);assert(s.family);const frames=[];
  for(const p of phases){const c=recorder();r.drawLegendaryArtVfx(c.ctx,{techId:id,angle:.3},p,reduced);c.balanced();frames.push(JSON.stringify(c.ops));}
  assert.equal(new Set(frames).size,reduced?1:4,id+' visible phases or static Reduced Motion');
 }
 for(const id of Object.keys(R.LEGENDARY_RELIC_SCENES)){
  const frames=[];for(const p of phases){const c=recorder();assert(r.drawLegendaryRelicScene(c.ctx,{relicId:id},p,reduced));c.balanced();frames.push(JSON.stringify(c.ops));}
  assert.equal(new Set(frames).size,reduced?1:4,id+' relic presentation has phases');
 }
}
// Bound full spectacles across BOTH skill casts and relic procs; keep remaining identities visible.
for(const quality of ['high','low']){
 r.opts.quality=quality;r.castClock=900;r.castActive=new Map();
 const arts=Object.keys(R.LEGENDARY_SCENES),relics=Object.keys(R.LEGENDARY_RELIC_SCENES);
 for(let i=0;i<24;i++)r.castActive.set(i,{...(i%2?{relicId:relics[i]}:{legendary:true,techId:arts[i]}),x:120*16+i,y:70*16,start:0,life:2300});
 let full=0,compact=0;const spy=Object.assign({},r,{drawLegendaryArtVfx(c,f,p,reduced,detail){detail?full++:compact++;},drawLegendaryRelicScene(c,f,p,reduced,detail){detail?full++:compact++;}});
 spy.drawCastEffects(recorder().ctx);assert.equal(full,quality==='low'?1:2);assert.equal(full+compact,24);
 for(const fx of spy.castActive.values())fx.ownerId='same-owner';
 full=0;compact=0;spy.drawCastEffects(recorder().ctx);assert.equal(full,1,'one owner cannot stack a cast and relic as two full scenes');
 const before=SIM.serialize(W),rng=JSON.stringify(W.rng.getState()),c=recorder();r.drawCastEffects(c.ctx);c.balanced();assert.equal(SIM.serialize(W),before);assert.equal(JSON.stringify(W.rng.getState()),rng);
}
r.opts.quality='high';
// Real authored offense, counter, evade, command, heal and forbidden skill snapshots.
for(const id of ['LEG_COMBAT_DUGU_NINE_SWORDS','LEG_COMBAT_DRAGON_SUBDUING_PALMS','LEG_AUX_QIANKUN_SHIFT','LEG_LIGHT_LINGBO_STEP','LEG_AUX_IMPERIAL_EIGHT_GATES','LEG_COMBAT_JADE_NIRVANA_HARMONY','LEG_FORB_BLOOD_LOTUS_SACRIFICE']){
 const world=SIM.create('apex-cast-'+id),p=SK.profile(CULT.tech(id));
 const a={id:'apexCaster',name:'caster',foe:true,tier:6,power:500,hp:20,hpMax:100,speed:1,x:120,y:70,sx:[],act:{id:'fight',ctx:{}},skl:[p]},d={...a,id:'apexEnemy',x:122,hp:100,sx:[],skl:[]},ally={...a,id:'apexAlly',x:118,hp:5,sx:[],skl:[]};
 world.foes=[a,d,ally];world.foeById={[a.id]:a,[d.id]:d,[ally.id]:ally};STATS.now=world.t;COMBAT.attack(world,{id:1,serious:true,A:[a.id,ally.id],B:[d.id]},a,d);assert(a.castFx,id+' real cast');const rr=view(world);rr.updateCastEffects(100);const fx=rr.castActive.get('foe:'+a.id);assert(fx.legendary);assert.equal(fx.life,R.LEGENDARY_SCENES[id].life);assert.equal(fx.x,a.castFx.x*16);assert.deepEqual(fx.targetPoints,a.castFx.targetPoints.map(pt=>({...pt,x:pt.x*16,y:pt.y*16})));
}
// Larger scene admission padding must cover edge-visible legendary casts and relics,
// while ordinary casts keep their earlier culling distance.
{
 const world=SIM.create('apex-edge'),rr=view(world),item={...g.VC.LEGENDARY_WEAPONS[0],minStage:1,compatiblePath:['ANY']};
 const a={id:'edgeActor',x:160,y:70,foe:true,equip:{WEAPON:item},castFx:{seq:1,t:world.t,x:160,y:70,techId:'LEG_COMBAT_DUGU_NINE_SWORDS',legendary:true},lastWeaponProc:{triggered:true,t:world.t,weaponId:item.id,effectId:'edge'}};
 world.foes=[a];rr.updateCastEffects(100);assert.equal(rr.castActive.size,2,'edge-visible skill and relic scenes are admitted');
 rr.castActive.clear();a.castFx={seq:2,t:world.t,x:160,y:70,techId:'MP_BASE_XIAN'};delete a.lastWeaponProc;rr.updateCastEffects(110);assert.equal(rr.castActive.size,0,'ordinary culling range is unchanged');
}
// Conductor geometry must include actual ally recipients, not fabricated decorative units.
const c=recorder();r.drawLegendaryConduits(c.ctx,{x:100,y:100,originX:60,originY:100,targetPoints:[{x:140,y:130,team:true},{x:160,y:110,team:false}]},{phase:.55,release:.5},{primary:'#fff'},false,false);c.balanced();assert(c.ops.some(o=>o[0]==='ellipse'&&o[1]===40&&o[2]===37));assert(c.ops.some(o=>o[0]==='ellipse'&&o[1]===60&&o[2]===17));
assert.equal(r.drawLegendaryRelicScene(recorder().ctx,{relicId:'unknown'},.5,false),false);
for(const t of Object.values(R.LEGENDARY_ART_VISUALS).filter(t=>t.passive)){
 const c1=recorder(),c2=recorder();r.drawLegendaryPassiveCrown(c1.ctx,t,.1,true,false);r.drawLegendaryPassiveCrown(c2.ctx,t,.9,true,false);assert.deepEqual(c1.ops,c2.ops);c1.balanced();c2.balanced();
}
console.log('PASS Legendary Apex: 47 skill scenes + 27 relic scenes, four phases, 3 passive crowns, real target snapshots, full-scene caps, Reduced Motion and save/RNG purity');
