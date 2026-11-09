'use strict';
const assert = require('assert'), g = require('./load');
require('../js/render');
const {SK, JD, SIM, COMBAT, STATS, Render, CULT} = g;
function recorder() {
  const ops=[];let depth=0;
  const ctx=new Proxy({globalAlpha:1},{get(o,k){if(k in o)return o[k];return (...a)=>{if(k==='save')depth++;if(k==='restore')depth--;for(const x of a)if(typeof x==='number')assert(Number.isFinite(x),k+' finite coordinates');ops.push([k,...a]);};},set(o,k,v){o[k]=v;ops.push([k,v]);return true;}});
  return {ctx,ops,depth:()=>depth};
}
const W=SIM.create('common-vfx'), r=Object.assign({W,t:.8,selected:null,opts:{quality:'high'},isReducedMotion:()=>false},Render.methods);
r.isReducedMotion=()=>false;
assert.equal(Object.keys(SK.COMMON_VFX_CATALOG).length,30);
assert.equal(Object.keys(SK.TECH_TO_COMMON_VFX).length,66);
assert.equal(Object.keys(SK.PASSIVE_TO_COMMON_VFX).length,12);
for(const [id,form] of Object.entries(SK.TECH_TO_COMMON_VFX)) {
  const t=CULT.tech(id);assert(t&&!t.legendary&&t.tier<=2,id+' is an existing low-tier technique');
  assert(!SK.TECH_TO_SIGNATURE_VFX[id]&&!t.signatureVfx,id+' preserves explicit old artwork');
  assert.equal(SK.resolveCommonVfx(t),form);
  for(const m of t.moveDefs||[]) assert(SK.resolveCommonVfx(t,m),m.id+' covered');
  // Use the real combat producer and renderer ingestion, not an invented visual field in a save.
  const a={id:'commonCaster',name:'caster',foe:true,tier:3,power:500,hp:20,hpMax:100,speed:1,x:120,y:70,sx:[],act:{id:'fight',ctx:{}},skl:[{id:'probe',nameTh:'probe',icon:'',tech:id,arch:'strike',tier:t.tier,type:'m',cd:30,wind:2,M:12,hits:1,moves:[]}]};
  const d={...a,id:'commonTarget',name:'target',x:122,hp:100,skl:[],sx:[]};W.foes=[a,d];W.foeById={[a.id]:a,[d.id]:d};STATS.now=W.t;COMBAT.attack(W,{id:1,serious:true,A:[a.id],B:[d.id]},a,d);assert(a.castFx,id+' cast');
  const view=Object.assign({},r,{castSeen:new Map(),castActive:new Map(),castClock:0,castLastTime:null,cam:{x:120*16,y:70*16,z:1},vw:1000,vh:700,npcPos:n=>n});
  const before=SIM.serialize(W),rng=JSON.stringify(W.rng.getState());view.updateCastEffects(100);
  const fx=view.castActive.get('foe:commonCaster');assert.equal(fx.commonVfx,form,id+' renderer resolves real cast');assert.equal(fx.life,540);assert.equal(fx.x,d.x*16);
  const c=recorder();view.drawCastEffects(c.ctx);assert.equal(c.depth(),0);assert.equal(SIM.serialize(W),before);assert.equal(JSON.stringify(W.rng.getState()),rng);
  if(id==='MP_BASE_XIAN') {
    a.castFx.signatureVfx='sig_meteor_sword_rain';a.castFx.seq++;
    view.updateCastEffects(110);const override=view.castActive.get('foe:commonCaster');
    assert.equal(override.commonVfx,null,'explicit event Signature wins over common route');
    assert.equal(override.signatureVfx,'sig_meteor_sword_rain');assert.equal(override.life,920);
  }
}
// Exercise authored healing/support/guard/control profiles with real team/enemy targets.
for(const [tid,index,selfAnchor] of [['MP_BASE_SAGE_SUPPORT',0,true],['MP_BASE_SAGE_SUPPORT',1,true],['MP_STAFF_WALL',0,true],['MP_FOCUS_SEAL',0,false]]) {
 const world=SIM.create('common-target-'+tid+index),t=CULT.tech(tid),p=SK.moveProfile(t,t.moveDefs[index]);
 const a={id:'caster',name:'caster',foe:true,tier:2,power:500,hp:15,hpMax:100,speed:1,x:120,y:70,sx:[],act:{id:'fight',ctx:{}},skl:[p]};
 const d={...a,id:'enemy',hp:100,x:122,sx:[],skl:[]},ally={...a,id:'ally',hp:2,x:118,sx:[],skl:[]};
 world.foes=[a,d,ally];world.foeById={caster:a,enemy:d,ally};STATS.now=world.t;
 COMBAT.attack(world,{id:7,serious:true,A:['caster','ally'],B:['enemy']},a,d);
 assert(a.castFx,tid+' real authored cast');assert.equal(a.castFx.x,p.arch==='heal'?ally.x:(selfAnchor?a.x:d.x),tid+' real target anchor');
 if(p.team)assert(a.castFx.targetPoints.some(pt=>pt.team&&pt.x===ally.x),'actual ally recipient recorded');
 if(p.arch==='control')assert(d.sx.some(s=>s.k===p.ctrl),'authored debuff is applied to enemy');
}
assert.equal(SK.resolveCommonVfx(CULT.tech('MP_BASE_SAGE_SUPPORT'),{id:'MP_BASE_SAGE_SUPPORT_M2'}),'qi_thread');
assert.equal(SK.resolveCommonVfx({id:'unknown',tier:1}),null);
const explicit=JD.TECH.techniques.find(t=>SK.TECH_TO_SIGNATURE_VFX[t.id]);assert.equal(SK.resolveCommonVfx(explicit),null);
for(const reduced of [false,true])for(const phase of [0,.4,1]){
  const hashes=new Set();for(const id of Object.keys(SK.COMMON_VFX_CATALOG)){const c=recorder();assert(r.drawCommonSkillVfx(c.ctx,id,phase,14,reduced));assert.equal(c.depth(),0);hashes.add(JSON.stringify(c.ops));}assert.equal(hashes.size,30);
}
for(const k of Object.keys(SK.STATUS_TO_COMMON_VFX)) {
  assert(SK.STATUS[k],k+' is a real status');const n={sx:[{k,until:W.t+4}]},c=recorder();assert.equal(r.drawCommonStatusAuras(c.ctx,n),1);assert.equal(c.depth(),0);
  n.sx[0].until=W.t;assert.equal(r.drawCommonStatusAuras(recorder().ctx,n),0);
}
const live={sx:[{k:'vitalRegen',until:W.t+9},{k:'guardUp',until:W.t+9},{k:'poison',until:W.t+9},{k:'burn',until:W.t+9},{k:'unknown',until:W.t+9}]};
assert.equal(r.drawCommonStatusAuras(recorder().ctx,live),2,'one buff and one debuff, bounded');
for(const flag of ['dead','away','gone','hidden'])assert.equal(r.drawCommonStatusAuras(recorder().ctx,{...live,[flag]:true}),0);
const n=W.npcs[0],id='PASS_IRON_SHIRT_T1';n.cult.techs=[id];n.passiveLoadout=[id];n.passiveUnequipped=[];r.selected=n.id;
assert.equal(r.drawCommonPassiveAura(recorder().ctx,n,'fight'),id);
const saved=SIM.serialize(W),rng=JSON.stringify(W.rng.getState());r.drawCommonPassiveAura(recorder().ctx,n,'fight');assert.equal(SIM.serialize(W),saved);assert.equal(JSON.stringify(W.rng.getState()),rng);
n.passiveUnequipped=[id];assert.equal(r.drawCommonPassiveAura(recorder().ctx,n,'fight'),false);
n.passiveUnequipped=[];n.cult.techs=[];assert.equal(r.drawCommonPassiveAura(recorder().ctx,n,'fight'),false);
console.log('PASS common VFX: 30 forms, 66 low-tier cast routes, 12 passive routes, 22 real statuses; expiry, eligibility, target and RNG/save purity');
