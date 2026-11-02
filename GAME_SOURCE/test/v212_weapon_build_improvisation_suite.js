'use strict';
const assert=require('assert'),g=require('./load');
const arts=g.JD.TECH.techniques.filter(x=>x.sourcePack==='V212_BUILD_DEPTH');assert(arts.length>0);
for(const art of arts){assert.strictEqual(g.CULT.tech(art.id),art);assert(art.nameTh);if(art.moveDefs)for(const m of art.moveDefs)assert(Number.isFinite(m.M||0));}
const passive=g.CULT.tech('PASS_V212_ADAPTIVE_ARSENAL_T2');assert(passive&&passive.passive);
console.log('PASS restored v212 authored build-depth techniques and adaptive passive registration');
