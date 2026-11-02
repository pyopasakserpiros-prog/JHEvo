/* All skill reads/practice share one authority; extra weapon skills stay outside locked HC. */
(function(g){
'use strict';
const {MARTIAL:M,HC,STATS:ST,AI,CULT,U}=g,clamp=U.clamp;
const extra={BOW:'ฝีมือธนู',STAFF:'ฝีมือพลอง',FOCUS:'ฝีมือสื่อปราณ',ZITHER:'ฝีมือพิณคีตเวทย์',BRUSH:'ฝีมือพู่กันอาคม',WHIP:'ฝีมือแส้และด้ายปราณ'};
const elemGateSkills={WATER_ICE:{id:'WATER_ICE',nameTh:'ปราณเหมันต์วารี',aff:'WATER_ICE',interest:'meditation',baseSkill:'SOUL_DIVINE'},WOOD_LIFE:{id:'WOOD_LIFE',nameTh:'ปราณพฤกษาชีวิต',aff:'WOOD_LIFE',interest:'herbs',baseSkill:'herbalism'}};
const groups={weapon:['SWORD','BLADE','SPEAR','FIST_PALM','BOW','STAFF','FOCUS','ZITHER','BRUSH','WHIP'],cultivation:['MOVEMENT','BODY_REFINING','SOUL_DIVINE','POISON','SCRIPTURE','ritual'],production:['ALCHEMY','FORGING','ARRAY','TALISMAN','MEDICINE','herbalism','mining','cooking','construction'],exploration:['BEAST_TAMING','stealth','survival'],social:['trading','administration','diplomacy','arts']};
M.SKILL_GROUPS=groups;M.SKILL_GROUP_NAMES={weapon:'อาวุธ',cultivation:'บำเพ็ญและเคล็ดภายใน',production:'การผลิตและการแพทย์',exploration:'สำรวจและอสูร',social:'สังคมและการจัดการ'};
M.SKILL_IDS=HC.SKILL_IDS.concat(Object.keys(extra));
const effects={
 SWORD:'เพิ่มพลัง/ความแม่นยำและเจาะเกราะเมื่อใช้กระบี่',BLADE:'เพิ่มพลัง/ความแม่นยำและเจาะเกราะเมื่อใช้ดาบ',SPEAR:'เพิ่มพลัง/ความแม่นยำและเจาะเกราะเมื่อใช้หอก',FIST_PALM:'เพิ่มพลัง/ความแม่นยำและเจาะเกราะเมื่อใช้สนับหรือมือเปล่า',BOW:'เพิ่มพลัง/ความแม่นยำและเจาะเกราะเมื่อใช้ธนู',STAFF:'เพิ่มพลัง/ความแม่นยำและเจาะเกราะเมื่อใช้พลอง',FOCUS:'เพิ่มพลังวิชา/ความแม่นยำและเจาะเกราะเมื่อใช้สื่อปราณ',ZITHER:'เพิ่มพลังวิชา/ความแม่นยำและเจาะเกราะเมื่อใช้พิณคีตเวทย์',BRUSH:'เพิ่มพลังวิชา/ความแม่นยำและเจาะเกราะเมื่อใช้พู่กันอาคม',WHIP:'เพิ่มพลัง/ความแม่นยำและเจาะเกราะเมื่อใช้แส้และด้ายปราณ',
 ALCHEMY:'เพิ่มโอกาสสำเร็จ คุณภาพและความเร็วหลอมโอสถ',FORGING:'เพิ่มโอกาสสำเร็จ คุณภาพและความเร็วหลอมอุปกรณ์',ARRAY:'เพิ่มโอกาสสร้างค่ายกลและป้องกันวิชาในการรบ',TALISMAN:'เพิ่มโอกาสสร้างยันต์และเกราะในการรบ',BEAST_TAMING:'ลดความเสียหายจากอสูรจริง',POISON:'เพิ่มความแรงแผลพิษ/โลหิตจากวิชา',MEDICINE:'เพิ่มการฟื้นตัวของผู้ป่วยเมื่อเป็นหมอและโอกาสชำแหละอวัยวะ',SCRIPTURE:'เพิ่มความเร็วศึกษาวิชาและโอกาสถอดจารึก',MOVEMENT:'เพิ่มความเร็วเคลื่อนที่และหลบหลีก',BODY_REFINING:'เพิ่มพลังชีวิตและป้องกัน',SOUL_DIVINE:'เพิ่มโจมตีวิชาและป้องกันวิชา',herbalism:'เพิ่มจำนวน/ระดับสมุนไพรและข้าวที่เก็บได้',mining:'เพิ่มจำนวน/ระดับแร่ที่ขุดได้',cooking:'เพิ่มอาหารจากข้าวหนึ่งหน่วยและความแรงสำรับฟื้นกาย/เตรียมปราณของผู้เชี่ยวชาญ',trading:'เพิ่มรายได้จากการค้าเดินทาง',administration:'ลดค่าใช้จ่ายดูแลสำนักและช่วยความเร็วขยายอาคาร',diplomacy:'เพิ่มผลเจรจาความสัมพันธ์/สนธิสัญญา',stealth:'เพิ่มหลบหลีกและคริติคอล',survival:'เพิ่มโอกาสผ่านอันตราย/หนีและลดอุบัติเหตุ',arts:'เพิ่มการคลายเครียดและขวัญใจจากดนตรี',construction:'ลดเวลาขยายอาคารจริง',ritual:'เพิ่มอัตราบำเพ็ญ โดยเฉพาะวิถีเทพ',WATER_ICE:'ความชำนาญปราณเหมันต์และวารีสำหรับสายเฉพาะทาง',WOOD_LIFE:'ความชำนาญปราณพฤกษาและพลังชีวิตสำหรับสายเฉพาะทาง'};
const interests={ALCHEMY:'alchemy',FORGING:'forging',ARRAY:'arrays',TALISMAN:'arrays',BEAST_TAMING:'beasts',MEDICINE:'medicine',SCRIPTURE:'scholarship',MOVEMENT:'exploring',BODY_REFINING:'combat',SOUL_DIVINE:'worship',POISON:'alchemy',herbalism:'herbs',mining:'labor',cooking:'cuisine',trading:'trade',administration:'leading',diplomacy:'socializing',stealth:'intrigue',survival:'exploring',arts:'arts',construction:'building',ritual:'worship',WATER_ICE:'meditation',WOOD_LIFE:'herbs'};
M.SKILL_INFO=Object.fromEntries(M.SKILL_IDS.map(id=>[id,{id,nameTh:extra[id]||HC.nameOf('skills.'+id),group:Object.keys(groups).find(k=>groups[k].includes(id)),effect:effects[id],route:groups.weapon.includes(id)?'ฝึกหอยุทธ์/ใช้อาวุธจริง/รับการสอน':'งานที่เกี่ยวข้อง/ฝึกทักษะเฉพาะ/รับการสอน',interest:interests[id]||'combat'}]));

M.ensureSkills=(n,rng)=>{
 if(!n||!n.h)return;
 n.h.skills=n.h.skills||{};
 const exp=(n.h.birthDay!=null&&HC.nowDay!=null)?clamp(((HC.nowDay-n.h.birthDay)/360-12)/30,0.05,1):0.4;
 for(const id of ['BOW','STAFF','FOCUS','ZITHER','BRUSH','WHIP','WATER_ICE','WOOD_LIFE']){
  if(n.h.skills[id]==null){
   if(n.martialSkills&&n.martialSkills[id]!=null){
    n.h.skills[id]=clamp(n.martialSkills[id],0,100);
   }else{
    const affKey={BOW:'SWORD',STAFF:'SPEAR',FOCUS:'SOUL_DIVINE',ZITHER:'SOUL_DIVINE',BRUSH:'TALISMAN',WHIP:'SPEAR',WATER_ICE:'WATER_ICE',WOOD_LIFE:'WOOD_LIFE'}[id];
    const aff=(n.h.affinities&&n.h.affinities[affKey])||30;
    const intr=(n.h.interests&&n.h.interests.combat)||40;
    const v=(aff*0.5+intr*0.5-25)*0.55*exp+2;
    n.h.skills[id]=clamp(Math.round(v*10)/10,0,85);
   }
  }
 }
};

M.skillRead=(n,id)=>{
 if(!n||!n.h||!n.h.skills||(!M.SKILL_INFO[id]&&!elemGateSkills[id]))return 0;
 if(elemGateSkills[id]&&n.h.skills[id]==null){n.h.skills[id]=clamp(n.h.skills[elemGateSkills[id].baseSkill]||15,0,100);}
 if(n.h.skills[id]==null&&n.martialSkills&&n.martialSkills[id]!=null){
  n.h.skills[id]=clamp(n.martialSkills[id],0,100);
 }
 return clamp(Number.isFinite(n.h.skills[id])?n.h.skills[id]:0,0,100);
};

M.skillSet=(n,id,val)=>{
 if(!n||!n.h||(!M.SKILL_INFO[id]&&!elemGateSkills[id]))return 0;
 n.h.skills=n.h.skills||{};
 const clamped=clamp(Number.isFinite(val)?val:0,0,100);
 if(n.h.skills[id]!==clamped)n._pathSkillVersion=(n._pathSkillVersion||0)+1;
 n.h.skills[id]=clamped;
 if(n.martialSkills&&n.martialSkills[id]!=null)delete n.martialSkills[id];
 if(ST&&ST.dirty)ST.dirty(n);
 return clamped;
};

M.skillAdd=(n,id,amt)=>{
 if(!n||!n.h||(!M.SKILL_INFO[id]&&!elemGateSkills[id])||!Number.isFinite(amt))return M.skillRead(n,id);
 return M.skillSet(n,id,M.skillRead(n,id)+amt);
};

const _dirtySkillSet=new Set([...groups.weapon,'SOUL_DIVINE','MOVEMENT','stealth','BODY_REFINING','TALISMAN','ARRAY','ALCHEMY','FORGING']);
const _HC_INTR_MAP={ALCHEMY:'alchemy',FORGING:'forging',ARRAY:'arrays',TALISMAN:'arrays',BEAST_TAMING:'beasts',MEDICINE:'medicine',SCRIPTURE:'scholarship',SWORD:'combat',BLADE:'combat',SPEAR:'combat',FIST_PALM:'combat',MOVEMENT:'exploring',BODY_REFINING:'combat',SOUL_DIVINE:'worship',POISON:'alchemy',herbalism:'herbs',mining:'labor',cooking:'cuisine',trading:'trade',administration:'leading',diplomacy:'socializing',stealth:'intrigue',survival:'exploring',arts:'arts',construction:'building',ritual:'worship'};
const _EXTRA_AFF_MAP={BOW:'SWORD',STAFF:'SPEAR',FOCUS:'SOUL_DIVINE',ZITHER:'SOUL_DIVINE',BRUSH:'TALISMAN',WHIP:'SPEAR',WATER_ICE:'WATER_ICE',WOOD_LIFE:'WOOD_LIFE'};
M.skillPractice=(n,id,hours,quality)=>{
 if((!M.SKILL_INFO[id]&&!elemGateSkills[id])||!Number.isFinite(hours)||hours<=0||!Number.isFinite(quality==null?1:quality)||(quality!=null&&quality<=0))return 0;
 const q=clamp(quality==null?1:quality,.1,3)*(M.lifeMult?M.lifeMult(n,id):1);let gain;
 const h=n.h,oldLv=Number.isFinite(n.h.skills[id])?n.h.skills[id]:0;
 if(!extra[id]&&!elemGateSkills[id]){
  if(h.skills[id]==null)return 0;
  const lv=h.skills[id];
  let rc=n._skRateCache;
  if(!rc||rc.ver!==n._ver||rc.day!==HC.nowDay){rc=n._skRateCache={ver:n._ver,day:HC.nowDay,m:Object.create(null)};}
  let baseR=rc.m[id];
  if(baseR===undefined){
   const aff=HC.eff(n,'affinities.'+id)||30;
   const learn=HC.eff(n,'intellect.learningSpeed');
   const intrId=_HC_INTR_MAP[id];
   const joy=intrId?h.interests[intrId]:50;
   baseR=rc.m[id]=(0.35+aff/100*0.9)*(0.6+learn/100*0.8)*(0.8+joy/250);
  }
  const rate=baseR*(q||1);
  gain=hours*0.075*rate*Math.pow(Math.max(0.08,1-lv/105),1.6);
  h.skills[id]=Math.min(100,lv+gain);
 }else{
  M.ensureSkills(n);
  const level=M.skillRead(n,id),aff=_EXTRA_AFF_MAP[id],rate=(.35+(HC.eff(n,'affinities.'+aff)||30)/100*.9)*(.6+HC.eff(n,'intellect.learningSpeed')/100*.8)*(.8+HC.eff(n,'interests.combat')/250)*q;
  gain=hours*.075*rate*Math.pow(Math.max(.08,1-level/105),1.6);
  n.h.skills[id]=Math.min(100,level+gain);
  if(n.martialSkills&&n.martialSkills[id]!=null)delete n.martialSkills[id];
 }
 const newLv=n.h.skills[id];if(gain&&Math.floor(newLv*4)!==Math.floor(oldLv*4))n._pathSkillVersion=(n._pathSkillVersion||0)+1;
 if(gain&&(hours>=0.1||(_dirtySkillSet.has(id)&&((newLv*4)|0)!==(((newLv-gain)*4)|0))))ST.dirty(n);return gain||0;
};
M.isBeast=u=>!!u&&!!u.foe&&(u.kind==='beast'||!!u.wild&&!!u.speciesId);
M.gearUsable=(n,it)=>!!it&&!it.retired&&!it.broken&&!(it.procedural&&it.dur!=null&&it.dur<=0)&&(!n||!n.cult||(it.minStage||1)<=(CULT.effectiveTechStage?CULT.effectiveTechStage(n):n.cult.stage)+1);
M.equippedType=n=>M.gearUsable(n,n.equip&&n.equip.WEAPON)?M.gearType(n.equip.WEAPON):'FIST';
M.pathSkillAffinity=(n,path,sub)=>{
 const def=CULT.subInfo&&CULT.subInfo(path,sub),weights=def&&def.skillWeights;
 if(weights&&typeof weights==='object'){
  let sum=0,total=0,maxWeight=0;
  const ids=Object.keys(weights);
  for(const id of ids)if((M.SKILL_INFO[id]||elemGateSkills[id])&&Number.isFinite(weights[id])&&weights[id]>0)maxWeight=Math.max(maxWeight,weights[id]);
  if(maxWeight>0)for(const id of ids){
   const weight=weights[id];
   if((M.SKILL_INFO[id]||elemGateSkills[id])&&Number.isFinite(weight)&&weight>0){const normalized=weight/maxWeight;sum+=M.skillRead(n,id)*normalized;total+=normalized;}
  }
  if(total>0)return clamp(sum/total,0,100)*.18;
 }
 const profile=M.PROFILES[sub],preferred=profile?profile[3]:M.PATHS[path].weapons;
 return Math.max(...preferred.map(type=>M.weaponSkill(n,type)))*.18;
};
M.weaponSkill=(n,type)=>M.skillRead(n,({FIST:'FIST_PALM'}[type||M.equippedType(n)]||type||M.equippedType(n)));
M.skillEffects=n=>{
 const eqW=n.equip&&n.equip.WEAPON,cPath=n.cult&&n.cult.path,cSub=n.cult&&n.cult.sub,sk=n.h.skills,sec=n._skillEffectsCache;
 const skSig=((sk.ritual||0)*4|0)+((sk.SCRIPTURE||0)*4|0)*2+((sk.SOUL_DIVINE||0)*4|0)*3+((sk.MOVEMENT||0)*4|0)*5+((sk.BODY_REFINING||0)*4|0)*7+((sk.POISON||0)*4|0)*11+((sk.MEDICINE||0)*4|0)*13+((sk.BEAST_TAMING||0)*4|0)*17+((sk.SWORD||0)*4|0)*19+((sk.BLADE||0)*4|0)*23+((sk.SPEAR||0)*4|0)*29+((sk.FIST_PALM||0)*4|0)*31+((sk.BOW||0)*4|0)*37+((sk.STAFF||0)*4|0)*41+((sk.FOCUS||0)*4|0)*43+((sk.ALCHEMY||0)*4|0)*47+((sk.FORGING||0)*4|0)*53+((sk.ARRAY||0)*4|0)*59+((sk.TALISMAN||0)*4|0)*61+((sk.cooking||0)*4|0)*67+((sk.ZITHER||0)*4|0)*71+((sk.BRUSH||0)*4|0)*73+((sk.WHIP||0)*4|0)*79;
 if(sec&&sec.eqW===eqW&&sec.cPath===cPath&&sec.cSub===cSub&&sec.ver===n._ver&&sec.skSig===skSig)return sec.out;
 const v=id=>M.skillRead(n,id),weapon=M.weaponSkill(n),isCraft=cPath==='CRAFT_CREATION',alc=v('ALCHEMY'),frg=v('FORGING'),arr=v('ARRAY'),tal=v('TALISMAN');
 const p={atk:isCraft?(frg*.0014+alc*.0005):0,matk:(.8+.45*weapon/100-1)+v('SOUL_DIVINE')*.0015+(isCraft?(alc*.0014+frg*.0005):0),acc:weapon*.0015,move:v('MOVEMENT')*.0018,eva:v('MOVEMENT')*.001+v('stealth')*.0013,hp:v('BODY_REFINING')*.0015+(isCraft?(alc*.0008+frg*.0008):0),def:v('BODY_REFINING')*.0014+tal*.0007+(isCraft?frg*.0010:0),mdef:v('SOUL_DIVINE')*.0013+arr*.0009+tal*.0005+(isCraft?alc*.0010:0)},f={crit:v('stealth')*.025,pen:isCraft?Math.round((frg+alc)*.045):0};
 const profession=g.ECO&&g.ECO.profession(n),cook=profession&&profession.skill==='cooking'?v('cooking'):0;
 const craftCultBonus=isCraft?Math.max(alc,frg,arr,tal,cook)*.0032:(Math.max(alc,frg)*.0004);
 const out={p,f,beastDamage:1/(1+v('BEAST_TAMING')*.004),poisonPower:1+v('POISON')*.004,cultivation:1+v('ritual')*(cPath==='GOD'?.0035:.001)+craftCultBonus,medicine:1+v('MEDICINE')*.004,study:1+v('SCRIPTURE')*.003,music:1+v('arts')*.005};
 n._skillEffectsCache={eqW,cPath,cSub,ver:n._ver,skSig,out};
 return out;
};
M.activeTechs=n=>{
 if(!n||!n.cult)return [];
 const c=n.cult,tl=c.techs.length,t0=tl?c.techs[0]:'',tL=tl?c.techs[tl-1]:'',effSt=CULT.effectiveTechStage?CULT.effectiveTechStage(n):c.stage,ac=n._actTechsCache;
 if(ac&&ac.path===c.path&&ac.sub===c.sub&&ac.st===effSt&&ac.tl===tl&&ac.t0===t0&&ac.tL===tL&&ac.ver===(n._passVer||0))return ac.out;
 if(M.reconcileInnate)M.reconcileInnate(n);
 const out=c.techs.filter(id=>{
  const t=CULT.tech(id);
  if(!t||M.isInnateTech(t)||(t.reqTier||t.tier)>effSt)return false;
  if(t.legendary)return true;
  const isExcl=CULT.isExclusiveSubpathTech?CULT.isExclusiveSubpathTech(t):(t.id.startsWith('MP_')||((t.passive||t.cat==='PASSIVE')&&!!t.sub));
  const pathOk=t.path==='ANY'||t.path===c.path||(!isExcl&&(t.legendary||!t.id.startsWith('MP_')));
  const subOk=CULT.isSubCompatible?CULT.isSubCompatible(t,c.sub,false):(!t.sub||t.sub===c.sub);
  return pathOk&&subOk;
 });
 n._actTechsCache={path:c.path,sub:c.sub,st:effSt,tl,t0,tL,ver:n._passVer||0,out};
 return out;
};
M.bottleneckSkillDrive=n=>clamp(0.42+(HC.eff(n,'personality.ambition')-45)/105+(HC.eff(n,'values.martialPeak')-45)/125+(HC.eff(n,'personality.discipline')-45)/155-(HC.eff(n,'values.freedom')-55)/220,0.25,1.65);
const EMPTY_ARR=Object.freeze([]);
M.activeBottleneckSkills=(W,n)=>{
 if(!n||!n.cult||!n.cult.track||!CULT.checkTrackGates)return EMPTY_ARR;
 const tr=n.cult.track;
 if(tr.ordinal>=9)return EMPTY_ARR;
 const th=[200,520,1350,3400,8500,21000,50000,120000][tr.ordinal-1]||150000;
 if(tr.prog<th*0.65)return EMPTY_ARR;
 const def0=CULT.trackDef?CULT.trackDef(tr.subPath):null;
 const g0=(def0&&def0.realms&&def0.realms[tr.ordinal])?(def0.realms[tr.ordinal].skillGate||{}):{};
 const pSk=g0.primarySkill?M.skillRead(n,g0.primarySkill):0;
 const sSk=g0.secondarySkill?M.skillRead(n,g0.secondarySkill):0;
 const wt=W&&W.t>0?W.t:-1,ac=n._abnCache;
 if(wt>0&&ac&&ac.t===wt&&ac.sub===tr.subPath&&ac.ord===tr.ordinal&&ac.prog===tr.prog&&ac.ver===n._ver&&ac.pSk===pSk&&ac.sSk===sSk)return ac.out;
 const g=CULT.checkTrackGates(W,n);
 const out=(!g.skillOk&&Array.isArray(g.missingSkills))?g.missingSkills:EMPTY_ARR;
 if(wt>0)n._abnCache={t:wt,sub:tr.subPath,ord:tr.ordinal,prog:tr.prog,ver:n._ver,pSk,sSk,out};
 return out;
};
M.pickSkillPractice=(W,n)=>{
 const intent=n.martialIntent;if(intent&&intent.action==='prepare'&&intent.targetKey){const k=M.knowledge&&M.knowledge(intent.targetKey),profile=k&&M.PROFILES[k.id];if(profile){const id={FIST:'FIST_PALM'}[profile[3][0]]||profile[3][0];if(M.skillRead(n,id)<75)return id;}}
 const bnSkills=M.activeBottleneckSkills(W,n);
 const bnSig=bnSkills.length?bnSkills.map(x=>x.skill+':'+Math.floor(x.current)+'/'+x.required).join('|'):'';
 const wt=W?W.t:0,eqW=n.equip&&n.equip.WEAPON,psc=n._pspCache;
 if(wt>0&&psc&&wt>=psc.t&&wt-psc.t<45&&psc.ver===n._ver&&psc.post===n.post&&psc.sub===(n.cult&&n.cult.sub)&&psc.eqW===eqW&&psc.bnSig===bnSig&&Math.floor(M.skillRead(n,psc.best))===psc.bestLv)return psc.best;
 const profession=g.ECO&&g.ECO.profession(n);
 const drive=bnSkills.length?M.bottleneckSkillDrive(n):0;
 const trReady=bnSkills.length&&CULT.trackReady(n);
 const bnMap={};
 for(let i=0;i<bnSkills.length;i++){
  const ms=bnSkills[i];
  bnMap[ms.skill]=((trReady?68:46)*(i===0?1:0.82))*drive+Math.min(28,ms.deficit*0.95);
 }
 let best=null,score=-Infinity;
 const allIds=bnMap.WATER_ICE?M.SKILL_IDS.concat(['WATER_ICE']):bnMap.WOOD_LIFE?M.SKILL_IDS.concat(['WOOD_LIFE']):M.SKILL_IDS;
 for(const id of allIds){
  const info=M.SKILL_INFO[id]||elemGateSkills[id],interest=HC.eff(n,'interests.'+info.interest),need=(100-M.skillRead(n,id))*.25,role=(n.post==='healer'&&id==='MEDICINE'||n.post==='steward'&&id==='construction'||n.post==='treasury'&&id==='administration')?20:0;
  const eqBonus=(groups.weapon.includes(id)&&id===({FIST:'FIST_PALM'}[M.equippedType(n)]||M.equippedType(n)))?18:0;
  const gateBonus=bnMap[id]||0;
  const specialtyBonus=profession&&profession.skill===id?26:0;
  const value=interest*.65+need+role+eqBonus+gateBonus+specialtyBonus;
  if(value>score){score=value;best=id;}
 }
 n._pspCache={t:wt,ver:n._ver,post:n.post,sub:n.cult&&n.cult.sub,eqW,bnSig,best,bestLv:Math.floor(M.skillRead(n,best))};
 return best;
};
AI.ACTS.skillDrill={nameTh:'ฝึกทักษะเฉพาะ',icon:'🎯',color:'#a6c7e8',can:n=>n.h.state.energy>35&&n.h.state.satiety>30,score(n,W,S){const id=M.pickSkillPractice(W,n),info=M.SKILL_INFO[id]||M.SKILL_INFO.MOVEMENT;S.add('ฝึก'+info.nameTh,.25+(HC.eff(n,'interests.'+info.interest)-50)/180+(n.martialIntent&&n.martialIntent.action==='prepare'?.7:0));const bnSkills=M.activeBottleneckSkills(W,n),ms=bnSkills.find(x=>x.skill===id);if(ms){const isPhysical=groups.weapon.includes(id)||['MOVEMENT','BODY_REFINING','stealth','survival','BEAST_TAMING'].includes(id);const hasSt=!W||!W.map||AI.freeStation(W,n,isPhysical?'dummy':'read',isPhysical?'training_ground':'scripture')||(isPhysical?(AI.freeStation(W,n,'spar','training_ground')||AI.freeStation(W,n,'read','scripture')):AI.freeStation(W,n,'dummy','training_ground'));if(hasSt){const drive=M.bottleneckSkillDrive(n),s=n.h.state,gObj=n.cognition&&n.cognition.goal,isComp=!!(gObj&&((gObj.id==='crisis'&&W&&W.sect&&(W.sect.shortageDirectives||[]).some(d=>d.id===gObj.targetId&&d.deficit>0))||(gObj.id==='help_friend'&&W&&W.byId&&W.byId[gObj.targetId]&&W.byId[gObj.targetId].h.state.hp<CULT.hpMax(W.byId[gObj.targetId])*0.72)||(gObj.id==='recovery'&&(s.hp<CULT.hpMax(n)*0.75||s.satiety<25||s.rest<20)))),compMult=isComp?0.25:1,needFactor=clamp(Math.min(s.satiety/35,s.rest/25,s.energy/30),0.2,1)*compMult;S.add('ทะลวงคอขวดสายเฉพาะทาง: '+id+' '+Math.floor(ms.current)+'/'+ms.required,(CULT.trackReady(n)?1.25:0.85)*drive*needFactor);}}},where(W,n){const skill=M.pickSkillPractice(W,n),isPhysical=groups.weapon.includes(skill)||['MOVEMENT','BODY_REFINING','stealth','survival','BEAST_TAMING'].includes(skill);let st=AI.freeStation(W,n,isPhysical?'dummy':'read',isPhysical?'training_ground':'scripture');if(!st&&isPhysical)st=AI.freeStation(W,n,'spar','training_ground')||AI.freeStation(W,n,'read','scripture');else if(!st)st=AI.freeStation(W,n,'dummy','training_ground');return st?{st,skill}:null;},dur:()=>100,tick(n,W,ctx){M.skillPractice(n,ctx.skill,1/60,1.1);n.h.state.energy=Math.max(0,n.h.state.energy-.055);},done(n,W,ctx){n.merit=(n.merit||0)+.1;if(g.ELEM&&n.cult){const m=n.cult.mantra&&CULT.tech(n.cult.mantra);if(m)g.ELEM.gainMastery(n,m,'practice',W,{sourceId:'drill_'+(ctx&&ctx.skill||'skill'),scale:0.7});}if(n.cult&&n.cult.track&&CULT.trackReady&&CULT.trackReady(n)&&CULT.checkTrackGates&&CULT.checkTrackGates(W,n).ok&&CULT.trackBreakthrough){CULT.trackBreakthrough(W,n);}}};
// Training and teaching of additional proficiencies use the same native stations/actions.
const practiceWhere=AI.ACTS.practice.where;AI.ACTS.practice.where=(W,n)=>{const result=practiceWhere(W,n);if(result){const equipped={FIST:'FIST_PALM'}[M.equippedType(n)]||M.equippedType(n);if(groups.weapon.includes(equipped))result.skill=equipped;const bnSkills=M.activeBottleneckSkills(W,n);if(bnSkills.length){const picked=M.pickSkillPractice(W,n),ms=bnSkills.find(x=>x.skill===picked)||bnSkills[0];if(ms&&(groups.weapon.includes(ms.skill)||['MOVEMENT','BODY_REFINING','SOUL_DIVINE','POISON','WATER_ICE','WOOD_LIFE','stealth','survival'].includes(ms.skill)))result.skill=ms.skill;}if(n.martialIntent&&n.martialIntent.action==='prepare')result.skill=M.pickSkillPractice(W,n);}return result;};
const pickTeach=AI.pickTeachSkill;AI.pickTeachSkill=(t,s)=>{if(s&&t){const bnSkills=M.activeBottleneckSkills(null,s);for(let i=0;i<bnSkills.length;i++){const sk=bnSkills[i].skill;if(M.skillRead(t,sk)>M.skillRead(s,sk)+2)return sk;}}const best=pickTeach(t,s),newSkill=Object.keys(extra).filter(k=>k!=='WATER_ICE'&&k!=='WOOD_LIFE').sort((a,b)=>M.skillRead(t,b)-M.skillRead(s,b)-M.skillRead(t,a)+M.skillRead(s,a))[0];return M.skillRead(t,newSkill)-M.skillRead(s,newSkill)>M.skillRead(t,best)-M.skillRead(s,best)?newSkill:best;};
})(typeof globalThis!=='undefined'?globalThis:this);
