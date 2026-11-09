'use strict';
const assert = require('assert');
const g = require('./load');
require('../js/render');
const R = g.Render;
function recorder() {
  const ops = []; let depth = 0;
  const ctx = new Proxy({globalAlpha:1}, {
    get(o,k) {
      if(k in o) return o[k];
      if(k==='save') return ()=>{depth++;ops.push(['save']);};
      if(k==='restore') return ()=>{depth--;ops.push(['restore']);};
      return (...a)=>ops.push([k,...a]);
    },set(o,k,v){o[k]=v;ops.push([k,v]);return true;}
  });
  return {ctx,ops,balanced:()=>assert.equal(depth,0)};
}
function renderer(W) { return Object.assign({W,alpha:1,opts:{quality:'high'},t:1.2,cam:{x:0,y:0,z:1},vw:1200,vh:800,
  castSeen:new Map(),castActive:new Map(),castClock:0,castLastTime:null,apCache:new Map(),
  chunks:new Map(),buildingSprites:new Map(),rev:0,npcPos:n=>({x:n.x,y:n.y})},R.methods); }
const W=g.SIM.create('legendary-vfx-identity',{masterIdx:0});
const r=renderer(W);r.cam.x=W.npcs[0].x*16;r.cam.y=W.npcs[0].y*16;
const techs=g.JD.TECH.techniques.filter(t=>t.legendary);
assert.equal(techs.length,50);assert.equal(Object.keys(R.LEGENDARY_ART_VISUALS).length,50);
assert.equal(Object.keys(R.LEGENDARY_GEAR_VISUALS).length,27);
for(const quality of ['high','low']) for(const reduced of [false,true]) {
  r.opts.quality=quality;
  const arts=new Set(),relics=new Set();
  for(const t of techs.filter(t=>!t.passive&&t.cat!=='PASSIVE')) {
    const c=recorder();r.drawLegendaryArtVfx(c.ctx,{techId:t.id,motif:t.fxKind,signatureVfx:g.SK.resolveSignatureVfx(t),angle:.3},.5,reduced);c.balanced();
    arts.add(JSON.stringify(c.ops));
  }
  assert.equal(arts.size,47,`47 active legendary arts must remain distinct: ${quality}, reduced=${reduced}`);
  for(const item of g.VC.LEGENDARY_EQUIPMENT) {
    const spec=R.resolveLegendaryGearVisual(item);assert(spec,`Missing relic ${item.id}`);
    const c=recorder();r.drawLegendaryRelicGlyph(c.ctx,spec,20,.6,reduced);c.balanced();relics.add(JSON.stringify(c.ops));
  }
  assert.equal(relics.size,27,'Each relic has distinct geometry/theme');
}
r.opts.quality='high';
// Signature metadata cannot suppress the Dugu motif.
let legendaryCalls=0,signatureCalls=0;
const spy=Object.assign({},r,{drawLegendaryArtVfx(){legendaryCalls++;},drawSignatureSkillVfx(){signatureCalls++;}});
spy.castActive=new Map([['a',{techId:techs[0].id,legendary:true,signatureVfx:'sig_meteor_sword_rain',start:0,life:1500,x:0,y:0}]]);
spy.castClock=750;spy.drawCastEffects(recorder().ctx);assert.equal(legendaryCalls,1);assert.equal(signatureCalls,0);
spy.castActive.get('a').legendary=false;spy.drawCastEffects(recorder().ctx);assert.equal(signatureCalls,1);
// Rarity-only changes and usability transitions must invalidate a cached appearance.
const n=W.npcs[0];n.cult.path='XIAN';n.cult.stage=9;n.equip={};
const item={...g.VC.LEGENDARY_WEAPONS[0],minStage:1,compatiblePath:['ANY']};n.equip.WEAPON=item;
assert.equal(r.appearance(n).legendaryGear.length,1);
item.legendary=false;assert.equal(r.appearance(n).legendaryGear.length,0);
item.legendary=true;item.broken=true;assert.equal(r.appearance(n).legendaryGear.length,0);
item.broken=false;assert.equal(r.appearance(n).legendaryGear.length,1);
const c=recorder();r.drawProp(c.ctx,n,'fight',0,0,0,r.appearance(n));assert.equal(c.ops.length,0,'No generic held weapon overpaint');
for(const it of g.VC.LEGENDARY_WEAPONS) {
  const cv=recorder();r.drawLegendaryWeaponVisual(cv.ctx,n,{weaponVisualKey:it.visualKey,weaponUsable:true,weaponPresentation:it.presentationMode},0,0,0,'fight');
  cv.balanced();assert(cv.ops.some(o=>['lineTo','arc','quadraticCurveTo','strokeRect','fillRect'].includes(o[0])),it.id+' needs a held silhouette');
}
// Real skill data -> renderer metadata -> distinct longer lifetime; real item proc -> separate burst.
r.setWorld(W);W.speed=1;delete g.UI;const before=g.SIM.serialize(W),rng=JSON.stringify(W.rng.getState());
n.castFx={seq:1,t:W.t,techId:techs[0].id,legendary:true,signatureVfx:g.SK.resolveSignatureVfx(techs[0]),x:n.x+1,y:n.y};
n.lastWeaponProc={triggered:true,t:W.t,weaponId:item.id,effectId:item.effects[0].effectId};
r.updateCastEffects(100);assert.equal(r.castActive.size,2);
assert([...r.castActive.values()].some(f=>f.relicId===item.id));assert([...r.castActive.values()].some(f=>f.life===1500));
const frozen=r.castClock;W.speed=0;r.updateCastEffects(180);assert.equal(r.castClock,frozen);assert.equal(r.castActive.size,2);
W.speed=1;for(let i=200;i<2200;i+=100)r.updateCastEffects(i);assert.equal(r.castActive.size,0);
r.setWorld(W);r.updateCastEffects(2300);assert.equal(r.castActive.size,0,'Load baseline must suppress both old casts and old procs');
// On-draw state, gear and RNG remain byte-identical.
const saved=g.SIM.serialize(W),savedRng=JSON.stringify(W.rng.getState());
const cv=recorder();r.drawLegendaryEquipmentAura(cv.ctx,n,r.appearance(n),0);cv.balanced();
r.drawLegendaryArtVfx(cv.ctx,{techId:techs[0].id,angle:.4},.5,false);cv.balanced();
assert.equal(g.SIM.serialize(W),saved);assert.equal(JSON.stringify(W.rng.getState()),savedRng);
assert.equal(rng,JSON.stringify(W.rng.getState()));assert(before.length>0);
// Off-screen, dead, ordinary, unusable procs must not enter visual queue.
for(const mode of ['dead','offscreen','ordinary','broken']) {
  r.setWorld(W);n.lastWeaponProc={...n.lastWeaponProc,t:W.t+1};W.t++;
  if(mode==='dead')n.dead=true;if(mode==='offscreen')r.cam.x=-10000;
  if(mode==='ordinary')item.legendary=false;if(mode==='broken')item.broken=true;
  r.updateCastEffects(2400);assert.equal(r.castActive.size,0,mode);
  n.dead=false;r.cam.x=n.x*16;item.legendary=true;item.broken=false;
}
// Three passive identities remain distinct and enlarge only the active legendary aura layer.
const passiveImages=new Set();
for(const t of techs.filter(t=>t.passive||t.cat==='PASSIVE')) {
  const passiveR=Object.assign({},r,{readOnlyActivePassives:()=>[t]});
  const c=recorder();passiveR.drawLegendaryAura(c.ctx,n,'fight');c.balanced();passiveImages.add(JSON.stringify(c.ops));
}
assert.equal(passiveImages.size,3);
// Exercise a real legendary equipment proc producer (not just a fabricated presentation event).
delete n.lastWeaponProc;n._legProcCd={};n.h.state.qi=g.CULT.qiMax(n);
const defender=W.npcs[1];defender.shield=200;defender.h.state.hp=g.CULT.hpMax(defender);
r.setWorld(W);
const proc=g.VC.runWeaponProcs(W,{id:777,A:[n.id],B:[defender.id]},n,defender,120,false);
assert(proc&&proc.triggered,'Real Yitian shield-sever proc must trigger');
r.updateCastEffects(2500);
assert([...r.castActive.values()].some(f=>f.relicId===item.id),'Actual proc must manifest its own relic glyph');
// Mixed actor/event pool stays bounded; despawn removes deduplication entries.
W.foes=Array.from({length:40},(_,i)=>({id:'relic-fx-'+i,x:n.x,y:n.y,equip:{WEAPON:item},
  lastWeaponProc:{triggered:true,t:W.t,weaponId:item.id,effectId:'stress-'+i}}));
r.updateCastEffects(2516);assert.equal(r.castActive.size,24);
W.foes=[];r.updateCastEffects(2532);
assert(![...r.castSeen.keys()].some(k=>k.includes('relic-fx-')));
const unknown=recorder();assert.equal(r.drawLegendaryRelicGlyph(unknown.ctx,null,10,0,true),false);
r.drawLegendaryArtVfx(unknown.ctx,{legendary:true,angle:0},.5,true);unknown.balanced();
console.log('PASS legendary visual identity: 50 arts / 47 active unique, 27 unique relics; routing, silhouette coverage, rarity/usability cache, event lifetime/pause/load, purity and fallback');
