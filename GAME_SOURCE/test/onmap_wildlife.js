'use strict';
const assert=require('assert'),G=require('./load');const {SIM,WILD,COMBAT,MAP}=G;
assert(WILD,'on-map wildlife module must load');
const W=SIM.create('wild-test');WILD.spawn(W,'meadow');WILD.spawn(W,'ridge');
assert.equal(W.wildlife.beasts.length,2);const [a,b]=W.wildlife.beasts;assert.equal(a.zone,'meadow');assert.equal(b.zone,'ridge');assert(a.y>W.map.wall.y1&&b.y>W.map.wall.y1);assert(!MAP.blocked(W.map,a.x,a.y));
assert(a.tier<=2&&b.tier>=3);assert.equal(a.aggressive,false,'low beasts do not attack first');
const h=W.npcs[0];h.x=a.x;h.y=a.y;assert(WILD.startFight(W,h,a));assert(W.foeById[a.id]);
a.dead=true;const f=W.fights.find(x=>x.kind==='wild');WILD.finish(W,f,'A');assert(Object.values(h.inv.mats).some(q=>q>0),'defeated beast supplies real personal inventory');const before=JSON.stringify(h.inv.mats);WILD.finish(W,f,'A');assert.equal(JSON.stringify(h.inv.mats),before,'no duplicate drops');
const legend=WILD.spawn(W,'legend');legend.expires=W.t;legend.fighting=123;W.fights.push({id:123,over:false});WILD.tick(W);assert(W.wildlife.beasts.includes(legend),'legend survives while fighting');W.fights.find(f=>f.id===123).over=true;legend.fighting=null;WILD.tick(W);assert(!W.wildlife.beasts.includes(legend),'legend expires when not fighting');
const save=SIM.serialize(W),loaded=SIM.deserialize(save);assert.deepEqual(loaded.wildlife,JSON.parse(save).wildlife);console.log('PASS on-map wildlife zones, neutral behavior, real drops, no replay, legendary expiry and save');
{
 const W1=SIM.create('wild-deterministic'), W2=SIM.create('wild-deterministic');
 for(const z of ['meadow','ridge','legend']){WILD.spawn(W1,z);WILD.spawn(W2,z);}
 assert.deepEqual(W1.wildlife,W2.wildlife,'same seed gives same actual spawns and legend duration');
 const low=W1.wildlife.beasts[0], n=W1.npcs[0];n.x=low.x;n.y=low.y;W1.t+=15-(W1.t%15);WILD.tick(W1);assert.notEqual(n.act.id,'fight','peaceful low-tier creature does not initiate combat');
 const z=WILD.zones.ridge,b=W1.wildlife.beasts.find(x=>x.zone==='ridge');b.fighting=77;W1.fights.push({id:77,over:false});b.x=z.x0-50;b.y=W1.map.wall.y0;WILD.clampCombat(W1);assert(b.x>=z.x0&&b.y>=z.y0,'fighting beast cannot cross into sect');
 const n2=W2.npcs[0],target=W2.wildlife.beasts[0];assert(AIpath());function AIpath(){return G.AI.ACTS.wildHunt.can(n2,W2)&&!!G.AI.goTo(W2,n2,target.x,target.y);}
}
console.log('PASS deterministic spawning, peaceful proximity, exterior boundary and autonomous hunter route');

{
  const { AI, CULT, HC, ECO } = G;
  const W = SIM.create('valley-team-flow');
  const b = WILD.spawn(W, 'north_peak', 'north_kirin_pool', { speciesId: 'BEAST_FROST_MIST_KIRIN' });
  const [lead, healer, front] = W.npcs;
  const busy = SIM.addNpc(W, { rank: 1 });
  const party = [[lead, 'XIAN', 7], [healer, 'SAGE_SUPPORT', 8], [front, 'BODY', 4], [busy, 'XIAN', 9]];
  const spots = [];
  for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) {
    if (!MAP.blocked(W.map, b.x + x, b.y + y)) spots.push({ x: b.x + x, y: b.y + y });
  }
  for (let i = 0; i < party.length; i++) {
    const [n, path, stage] = party[i];
    Object.assign(n, spots[i]);
    n.cult.path = path;
    n.cult.stage = stage;
    delete n.cult.track;
    n.rank = Math.max(1, n.rank);
    HC.bump(n);
    Object.assign(n.h.state, { hp: CULT.hpMax(n), qi: CULT.qiMax(n), energy: 92, satiety: 90 });
    n.act = { id: 'idle', stage: 'do', left: 0, ctx: {}, why: [] };
  }
  busy.act.id = 'breakthrough';
  assert(WILD.startFight(W, lead, b));
  const fight = W.fights.at(-1);
  assert.equal(busy.act.id, 'breakthrough');
  for (let minute = 0; minute < 12; minute++) {
    W.t++;
    for (const helper of [healer, front]) {
      if (helper.act.id === 'wildHunt' && helper.path && AI.stepMove(W, helper)) AI.arrive(W, helper);
    }
  }
  const helper = [healer, front].find(n => fight.A.includes(n.id));
  assert(helper && fight.A.length === 2, 'A helper walks in and joins the same T5 fight');
  assert.equal(helper.act.ctx.fid, fight.id);

  ECO.addPersonalPill(lead, 'P:BASIC_HP', 1, 1);
  ECO.addPersonalPill(lead, 'P:BASIC_QI', 1, 1);
  lead.h.state.hp = CULT.hpMax(lead) * .425;
  lead.h.state.qi = CULT.qiMax(lead) * .22;
  const hpBefore = lead.h.state.hp;
  COMBAT.fightStep(W, lead);
  assert(lead.h.state.hp > hpBefore && !lead.inv.pills['P:BASIC_HP']);
  W.t += 7;
  lead.act.ctx.cd = 0;
  lead.h.state.qi = CULT.qiMax(lead) * .19;
  const qiBefore = lead.h.state.qi;
  COMBAT.fightStep(W, lead);
  assert(lead.h.state.qi > qiBefore && !lead.inv.pills['P:BASIC_QI']);
  console.log('PASS elite support walks to the hunt and consumes real recovery medicine');
}

{
  const W = SIM.create('valley-probe');
  const b = WILD.spawn(W, 'legend', null, { speciesId: 'BEAST_ABYSSAL_DRAGON' });
  const hunter = W.npcs[0];
  Object.assign(hunter, { x: b.x + 1, y: b.y });
  assert(!WILD.startFight(W, hunter, b), 'A solo hunter cannot aggro the T7 raid');
  assert(!b.aggressive);
  W.foes.push(b);
  W.foeById[b.id] = b;
  const fight = COMBAT.startFight(W, [hunter.id], [b.id], 'wild', { serious: true, ctx: { beastId: b.id } });
  b.fighting = fight.id;
  W.rng.chance = () => false;
  W.rng.next = () => .5;
  const hit = { M: 100, type: 'p', forced: true, noProc: true, noCounter: true, noReflect: true };
  for (let i = 0; i < 100; i++) COMBAT.strike(W, fight, hunter, b, { ...hit });
  assert(b.hp > 0 && !b.dead, '100 capped bursts cannot one-cycle the full HP body');
  assert(b.hp < b.hpMax * .1, 'Sustained attacks make decisive progress');
  const copy = { id: 'outside-check', foe: true, name: b.name, tier: b.tier,
    power: b.power, hp: b.hpMax, hpMax: b.hpMax, x: b.x, y: b.y, sx: [] };
  const unprotectedHit = b.hpMax * .4;
  COMBAT.applyDamage(W, fight, null, copy, unprotectedHit);
  assert(Math.abs(copy.hp - (copy.hpMax - unprotectedHit)) <= 1, 'A foe without the valley effect is not protected');
  const beforeBeastStrike = copy.hp;
  COMBAT.applyDamage(W, fight, b, copy, 100);
  assert(Math.abs(beforeBeastStrike - copy.hp - 48) <= 1, 'A T7 valley beast deals 48% of its unmodified damage');
  console.log('PASS 100 simulated heavy hits on a T7 body and region-only damage limits');
}
