'use strict';
const assert=require('assert'),path=require('path');
const {chromium}=(()=>{try{return require('playwright');}catch(_){return require('../tools/cdp_playwright');}})();
(async()=>{
 const browser=await chromium.launch();try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(await require('../tools/browser_test_url').url(path.resolve(__dirname,'../index.html')));await page.click('[data-pick="0"]');
 const policy=require('../../docs/audits/OBSERVER_ACTION_POLICY.json');
 const result=await page.evaluate(policy=>{
  G.speed=0;const W=G.W,n=W.npcs[0];let inspected=0;
  const checks=[['sect',['over','policy','posts','stock','stockItems','shop','bld','council','peaks','lineage','dao','visuals']],['world',['exp','disc','content','sects','hist','map','polities']],['npc',['ov','meridian','pets','lineage','bag','tech','sub','elem','self','body','mind','skill','rel','life']],['menu',['main','tracked','set','tools','about']]];
  for(const [sheet,tabs]of checks)for(const tab of tabs){
   UI.close();if(sheet==='npc')UI.openNpc(n.id,tab);else UI.open(sheet,tab);
   for(const el of document.querySelectorAll('#shBody [data-do]')){
    if(!UI.isPlayerActionAllowed(el.dataset.do,el.dataset.arg,sheet))throw Error('Forbidden rendered command '+el.dataset.do+' in '+sheet+'/'+tab);
    inspected++;
   }
  }
  UI.close();UI.open('sect','over');const before=SIM.serialize(W),rng=JSON.stringify(W.rng.getState());
  for(const command of policy.removed)if(UI.doAction(command,n.id)!==false)throw Error('Forbidden dispatch accepted: '+command);
  for(const command of policy.edit)if(UI.doAction(command,n.id)!==false)throw Error('Editor dispatch accepted outside Edit Hub: '+command);
  for(const arg of ['raid','beast','recruit','banquet','tourney','challenge']){if(UI.doAction('tool',arg)!==false||UI.tool(arg)!==false)throw Error('Legacy observer tool runs a command '+arg);}
  if(SIM.serialize(W)!==before||JSON.stringify(W.rng.getState())!==rng)throw Error('Blocked commands mutated the world or RNG');
  const filtered=UI.filterPlayerControls('<button data-do="future-unknown-command">X</button><button data-do="npc">View</button>','sect');
  if(filtered.includes('future-unknown')||!filtered.includes('data-do="npc"'))throw Error('Unknown future commands are not rejected');
  UI.openEditNpc(n.id,'char');
  if(!document.querySelector('[data-do="apply-char-edit"]'))throw Error('State editor unavailable');
  UI.open('menu','tools');const stones=W.sect.stones;UI.doAction('tool','stones');
  if(W.sect.stones!==stones+1000)throw Error('Allowed state spawning is unavailable');
  return {inspected,blocked:policy.removed.length,editor:policy.edit.length};
 },policy);
 assert.deepStrictEqual(errors,[]);console.log('PASS observer control boundary, all drawer sweeps, blocked dispatch/RNG purity and permitted editor/spawner: '+JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
