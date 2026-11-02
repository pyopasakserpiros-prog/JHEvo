'use strict';
const assert=require('assert'),g=require('./load');
g.HC.nowDay=1;
const rng=new g.U.RNG(214),n=g.HC.generate(rng,{id:'choice',day:1});
const candidates=g.CULT.majorPathScores(n);
assert.equal(candidates.length,Object.keys(g.CULT.PATHS).length);
assert(candidates.every(x=>Number.isFinite(x.score)));
// Extra copies of a branch cannot add tickets to a major path lottery.
const original=g.CULT.pathScores;
try {
 g.CULT.pathScores=()=>[{path:'XIAN',sub:'A',score:60},{path:'GOD',sub:'B',score:60}];
 const state=new g.U.RNG(4).getState(),a=new g.U.RNG(1),b=new g.U.RNG(1);a.setState(state);b.setState(state);
 const seq=[];for(let i=0;i<100;i++)seq.push(g.CULT.choosePath(n,a).path);
 g.CULT.pathScores=()=>[{path:'XIAN',sub:'A',score:60},{path:'GOD',sub:'B',score:60},...Array.from({length:30},()=>({path:'XIAN',sub:'A2',score:60}))];
 for(let i=0;i<100;i++)assert.equal(g.CULT.choosePath(n,b).path,seq[i]);
} finally {g.CULT.pathScores=original;}
const counts=Object.fromEntries(Object.keys(g.CULT.PATHS).map(k=>[k,0]));
for(let i=0;i<3000;i++) {const x=g.HC.generate(rng,{id:'sample'+i,day:1});counts[g.CULT.choosePath(x,rng).path]++;}
for(const [path,count]of Object.entries(counts))assert(count>0,'No selected NPCs for '+path);
console.log('PASS v214 major path selection (seed 214, sample 3000):',JSON.stringify(counts));
// Legacy aliases must follow real innate aptitude rather than nonexistent HC fields.
{
 const x=g.HC.generate(new g.U.RNG(33),{id:'legacy-affinity',day:1});
 for(const [sub,key]of [['MIND_SWORD_TELEKINESIS','SCRIPTURE'],['CELESTIAL_BALLISTA','SWORD'],['SIX_PATHS_WHEEL','SPEAR']]) {
  const original=x.h.affinities[key];x.h.affinities[key]=0;g.HC.bump(x);
  const low=g.CULT.pathScores(x).find(y=>y.sub===sub).score;
  x.h.affinities[key]=100;g.HC.bump(x);
  const high=g.CULT.pathScores(x).find(y=>y.sub===sub).score;
  assert(high>low,sub+' must respond to real '+key+' aptitude');
  x.h.affinities[key]=original;g.HC.bump(x);
 }
}
