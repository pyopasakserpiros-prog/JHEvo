'use strict';
const assert=require('assert'),g=require('./load');require('../js/render');
const {SK,CULT,SIM,COMBAT,STATS,Render,JD}=g;
const ids=Object.keys(SK.TECH_TO_T3_VFX),forms=Object.keys(SK.T3_VFX_CATALOG);
assert.equal(forms.length,24);assert.equal(ids.length,26);assert.equal(Object.keys(SK.PASSIVE_TO_T3_VFX).length,8);
const tiers=Object.values(SK.NONLEGENDARY_VFX_BUDGET);
assert.equal(Math.max(...JD.TECH.techniques.filter(t=>!t.legendary).map(t=>t.tier)),7);
for(let i=2;i<tiers.length;i++){assert(tiers[i].rMin>tiers[i-1].rMax);assert(tiers[i].life>tiers[i-1].life);assert.equal(tiers[i].planned,i>2&&i<6);}
assert(tiers[6].rMax<Render.LEGENDARY_APEX_BUDGET.radiusMin,'reserved ordinary T7 remains below the expanded Legendary apex');
assert(tiers[6].life<Math.min(...Object.values(Render.LEGENDARY_SCENES).map(s=>s.life)),'ordinary T7 retains a shorter cast than Legendary');
assert.equal(Object.keys(SK.SIGNATURE_VFX_CATALOG).length,45);assert.equal(Object.keys(SK.TECH_TO_SIGNATURE_VFX).length,256);
function recorder(){let depth=0;const ops=[];const ctx=new Proxy({globalAlpha:1},{get(o,k){if(k in o)return o[k];return(...args)=>{if(k==='save')depth++;if(k==='restore')depth--;for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),k);ops.push([k,...args]);};},set(o,k,v){o[k]=v;ops.push([k,v]);return true;}});return{ctx,ops,depth:()=>depth};}
function view(W){return Object.assign({W,t:.6,opts:{quality:'high'},cam:{x:120*16,y:70*16,z:1},vw:1000,vh:700,castClock:0,castLastTime:null,castSeen:new Map(),castActive:new Map(),npcPos:n=>n},Render.methods);}
function actors(W,p){const a={id:'t3Caster',name:'caster',foe:true,tier:3,power:500,hp:20,hpMax:100,speed:1,x:120,y:70,sx:[],act:{id:'fight',ctx:{}},skl:[p]};const d={...a,id:'t3Enemy',hp:100,x:122,sx:[],skl:[]},ally={...a,id:'t3Ally',hp:2,x:118,sx:[],skl:[]};W.foes=[a,d,ally];W.foeById={[a.id]:a,[d.id]:d,[ally.id]:ally};return{a,d,ally,f:{id:11,serious:true,A:[a.id,ally.id],B:[d.id]}};}
for(const id of ids){
 const t=CULT.tech(id);assert(t&&t.tier===3&&!t.legendary);assert(!t.signatureVfx&&!t.fxKind&&!SK.TECH_TO_SIGNATURE_VFX[id]);assert.equal(SK.resolveSignatureVfx(t),null,'parent had no existing Signature assignment');assert.equal(SK.resolveT3Vfx(t),SK.TECH_TO_T3_VFX[id]);
 for(const m of t.moveDefs||[]){assert.equal(SK.resolveSignatureVfx(t,m),null,m.id+' had no earlier selected Signature');assert(SK.resolveT3Vfx(t,m),m.id+' explicit stage coverage');}
 const W=SIM.create('t3-'+id),r=view(W),{a,d,f}=actors(W,{id:'probe',nameTh:'probe',icon:'',tech:id,arch:'strike',tier:3,type:'m',cd:30,wind:2,M:12,hits:1,moves:[]});
 STATS.now=W.t;COMBAT.attack(W,f,a,d);assert(a.castFx,id+' emits combat cast');const before=SIM.serialize(W),rng=JSON.stringify(W.rng.getState());r.updateCastEffects(100);const fx=r.castActive.get('foe:'+a.id);assert.equal(fx.t3Vfx,SK.TECH_TO_T3_VFX[id]);assert.equal(fx.life,680);assert.equal(fx.x,d.x*16);const c=recorder();r.drawCastEffects(c.ctx);assert.equal(c.depth(),0);assert.equal(SIM.serialize(W),before);assert.equal(JSON.stringify(W.rng.getState()),rng);
 a.castFx.seq++;a.castFx.signatureVfx='sig_meteor_sword_rain';r.updateCastEffects(110);assert.equal(r.castActive.get('foe:'+a.id).t3Vfx,null,'explicit event Signature retains priority');
}
for(const [id,idx] of [['ART_V210_AUX_SOUL_CHIME',-1],['ART_SAGE_SUP_002',0],['TECH_V222_09',0],['MP_FOCUS_ABACUS_TACTIC_T3',0],['ART_KARMA_SAMSARA_007',-1],['ART_V112_DEMON_BONE_ARMOR_SHIELD_T3',-1],['ART190_XIAN_004',-1],['ART190_GOD_015',-1]]){
 const t=CULT.tech(id),p=idx<0?SK.profile(t):SK.moveProfile(t,t.moveDefs[idx]);const W=SIM.create('t3-target-'+id),r=view(W),{a,d,ally,f}=actors(W,p);STATS.now=W.t;COMBAT.attack(W,f,a,d);assert(a.castFx,id+' authored profile cast');r.updateCastEffects(100);const fx=r.castActive.get('foe:'+a.id);assert.equal(fx.t3Vfx,SK.TECH_TO_T3_VFX[id]);assert.equal(fx.x,(p.arch==='heal'?ally.x:(p.self||p.team||['support','harmonize','guard','shield','counter'].includes(p.arch)?a.x:d.x))*16,'actual heal/support/defense/hostile anchor');if(p.arch==='support'||p.arch==='harmonize')assert(fx.targetPoints.some(pt=>pt.team&&pt.x===ally.x*16),'actual allied recipient');
}
for(const t of JD.TECH.techniques.filter(t=>t.legendary||t.tier!==3||SK.TECH_TO_SIGNATURE_VFX[t.id]))assert.equal(SK.resolveT3Vfx(t),null,'other tiers/Legendary/explicit Signature untouched');
assert.equal(SK.resolveT3Vfx({id:'unknown',tier:3}),null);
for(const low of [true,false])for(const reduced of [true,false]){const W=SIM.create('t3-shapes'),r=view(W);r.opts.quality=low?'low':'high';const frames=new Set();for(const id of forms){const c=recorder();assert(r.drawT3SkillVfx(c.ctx,id,.4,20,reduced,.2));assert.equal(c.depth(),0);frames.add(JSON.stringify(c.ops));if(reduced){const cc=recorder();r.drawT3SkillVfx(cc.ctx,id,.9,20,true,.2);assert.deepEqual(c.ops,cc.ops,'Reduced Motion freezes decoration');}}assert.equal(frames.size,24);}
const W=SIM.create('t3-persistent'),r=view(W);r.isReducedMotion=()=>true;
for(const k of Object.keys(SK.STATUS_TO_T3_VFX)){assert(SK.STATUS[k]);const n={sx:[{k,until:W.t+5}]};assert.equal(r.drawCommonStatusAuras(recorder().ctx,n),1);n.sx[0].until=W.t;assert.equal(r.drawCommonStatusAuras(recorder().ctx,n),0);}
const n=W.npcs[0],id='PASS_MIRROR_HEART_T3';n.cult.techs=[id];n.passiveLoadout=[id];n.passiveUnequipped=[];r.selected=n.id;assert.equal(r.drawCommonPassiveAura(recorder().ctx,n,'fight'),id);n.passiveUnequipped=[id];assert.equal(r.drawCommonPassiveAura(recorder().ctx,n,'fight'),false);
console.log('PASS T3 VFX: 24 forms / 26 active routes / 8 passive routes / 6 statuses, real target casts, old artwork precedence and T1–T7 headroom');
