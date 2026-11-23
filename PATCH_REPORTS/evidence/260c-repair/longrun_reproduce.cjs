const fs=require('fs');const G=require('../../../GAME_SOURCE/test/load');
const results=[];
for(const [seed,days] of [[process.argv[2]||'repair-final-80',Number(process.argv[3]||6)]]){
 const W=G.SIM.create(seed);while(W.npcs.length<80)W.makeNpc({ageYears:20,rank:1,stage:2});
 const startDay=W.day,start=Date.now(),budget={},events={};let ticks=0;
 try{
  while(W.day<startDay+days){
   for(const n of W.npcs){if(n.dead||n.exiled)continue;const k=n.travel?'travel':n.away?'away':n.act&&n.act.stage==='move'?'walk':n.act&&n.act.id||'idle';budget[k]=(budget[k]||0)+1;}
   G.SIM.tick(W);ticks++;
   if(ticks>days*2160+2160)throw Error('calendar stalled');
  }
  const traits={};for(const n of W.npcs)for(const t of n.experienceTraits||[])traits[t.id]=(traits[t.id]||0)+1;
  const masteries={};for(const n of W.npcs)for(const t of n.combatHistory&&n.combatHistory.unlockedTraits||[])masteries[t]=(masteries[t]||0)+1;
  const save=G.SIM.serialize(W), back=G.SIM.deserialize(save);if(back.t!==W.t||back.workSteps!==W.workSteps||back.timePhase!==W.timePhase)throw Error('clock roundtrip mismatch');
  const r={seed,days,ticks,elapsedMs:Date.now()-start,alive:W.npcs.filter(n=>!n.dead&&!n.exiled).length,deaths:W.deaths,food:W.sect.stock.meal,stones:W.sect.stones,beasts:(W.wildlife&&W.wildlife.beasts||[]).filter(b=>!b.dead&&!b.gone).length,budget,traits,masteries,currentSaveBytes:save.length};results.push(r);console.log(JSON.stringify(r));
 }catch(e){console.error('FAIL',seed,'tick',ticks,e.stack);process.exitCode=1;break;}
}
if(process.argv[4])fs.writeFileSync(process.argv[4],JSON.stringify(results,null,2));
