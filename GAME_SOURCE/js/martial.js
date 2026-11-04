/* Derived martial identity, passive slot management, innate subpath techniques, synergies, and shared equipment suitability. Never writes HC attributes. */
(function(g){
'use strict';
const {JD,HC,U,CULT,ECO,STATS:ST}=g,D=JD.MARTIAL,clamp=U.clamp;
const M=g.MARTIAL={
 VERSION:D.version,
 TYPES:D.types,
 GRADES:D.GRADES||{},
 BASE_PASSIVE_SLOTS:D.BASE_PASSIVE_SLOTS||3,
 PASSIVE_SLOT_BONUSES:D.PASSIVE_SLOT_BONUSES||{},
 SYNERGIES:D.SYNERGIES||[],
 RESONANCE_SETS:D.RESONANCE_SETS||[],
 RESONANCE_BY_ID:Object.fromEntries((D.RESONANCE_SETS||[]).map(s=>[s.id,s])),
 INNATE_TECHNIQUES:D.innateTechniques||[],
 INNATE_BY_SUB:Object.fromEntries((D.innateTechniques||[]).map(t=>[t.innateSubpath,t]))
};
const paths={
 XIAN:{body:{meridianCapacity:28,spiritualFoundation:24,reflex:8},p:{matk:.14,def:-.05},life:{ARRAY:.12,TALISMAN:.10},curve:'late',weapons:['FOCUS','SWORD','ZITHER','BRUSH'],armor:['ROBE']},
 BODY:{body:{strength:34,toughness:30,endurance:26,vitality:22},p:{atk:.08,matk:-.1},life:{mining:.20,FORGING:.08},curve:'early',weapons:['FIST','STAFF','SPEAR'],armor:['HEAVY']},
 GOD:{body:{vitality:20,spiritualFoundation:18,endurance:12},p:{mdef:.12,cast:-.04},life:{MEDICINE:.12,herbalism:.10},curve:'steady',weapons:['SPEAR','FOCUS','BRUSH','ZITHER'],armor:['HEAVY','ROBE']},
 DEMON:{body:{strength:24,explosiveness:26,agility:18},p:{atk:.10,def:-.10},life:{POISON:.17,hunting:.12},curve:'early',weapons:['BLADE','FIST','WHIP'],armor:['LIGHT']},
 HEART_SOUL:{body:{reflex:18,spiritualFoundation:30,meridianCapacity:16},p:{matk:.13,hp:-.06},life:{SCRIPTURE:.18,ARRAY:.12},curve:'late',weapons:['ZITHER','FOCUS','SWORD','BRUSH'],armor:['ROBE','LIGHT']},
 MECH_PUPPET:{body:{dexterity:26,meridianCapacity:22,reflex:18,endurance:16},p:{atk:.09,matk:.09,def:.10},life:{FORGING:.28,ARRAY:.18,TALISMAN:.14},curve:'steady',weapons:['WHIP','FOCUS','SPEAR','STAFF','BOW'],armor:['HEAVY','LIGHT']},
 KARMA_SAMSARA:{body:{spiritualFoundation:26,vitality:22,endurance:18,reflex:14},p:{matk:.12,mdef:.14},life:{SCRIPTURE:.24,MEDICINE:.18,ritual:.20},curve:'late',weapons:['WHIP','BRUSH','STAFF','FOCUS','BLADE','SWORD'],armor:['ROBE','HEAVY']},
 BEAST_SOVEREIGN:{body:{strength:24,vitality:26,agility:20,endurance:20},p:{atk:.11,hp:.12,def:.06},life:{BEAST_TAMING:.38,hunting:.24,survival:.18},curve:'early',weapons:['SPEAR','WHIP','FIST','BOW','STAFF'],armor:['LIGHT','HEAVY']},
 SAGE_SUPPORT:{body:{spiritualFoundation:26,vitality:26,recoveryRate:24,dexterity:20},p:{matk:.10,mdef:.15,hp:.12},life:{MEDICINE:.38,ALCHEMY:.26,TALISMAN:.22,arts:.20},curve:'steady',weapons:['ZITHER','BRUSH','FOCUS','STAFF','SWORD','SPEAR','BOW'],armor:['ROBE','LIGHT']},
 CRAFT_CREATION:{body:{dexterity:28,spiritualFoundation:26,meridianCapacity:22,toughness:20,vitality:22},p:{atk:.10,matk:.12,def:.12,mdef:.12},life:{ALCHEMY:.38,FORGING:.38,ARRAY:.24,TALISMAN:.24,MEDICINE:.18,herbalism:.20,mining:.20},curve:'steady',weapons:['BRUSH','WHIP','FOCUS','STAFF','SWORD','BLADE','SPEAR','FIST','BOW','ZITHER'],armor:['ROBE','HEAVY','LIGHT']}
};
// [body, productive life skills, curve, preferred weapons, armor]. All current branches have a distinct record.
const profiles={
 SWORD_IMMORTAL:[{reflex:16,agility:10},{SWORD:.20},'late',['SWORD'],['LIGHT']],
 FIVE_ELEMENTS:[{meridianCapacity:14,spiritualFoundation:12},{ALCHEMY:.12,ARRAY:.12},'late',['FOCUS','SWORD'],['ROBE','LIGHT']],
 ELIXIR_DAO:[{vitality:20,recoveryRate:15},{ALCHEMY:.32,MEDICINE:.22},'steady',['FOCUS','STAFF'],['ROBE','LIGHT']],
 ASTRAL_ARRAY:[{spiritualFoundation:15},{ARRAY:.35,TALISMAN:.15},'late',['FOCUS','SWORD'],['ROBE','LIGHT']],
 BLOOD_DEMON:[{explosiveness:22,strength:12},{hunting:.25},'early',['BLADE','FIST'],['LIGHT']],
 PHANTOM_SOUL:[{agility:18,reflex:12},{survival:.20,SCRIPTURE:.12},'late',['FOCUS','BLADE'],['LIGHT']],
 TIME_VOID:[{speed:18,reflex:18},{ARRAY:.20,SCRIPTURE:.22},'late',['FOCUS','SWORD'],['ROBE','LIGHT']],
 SOUND_ZITHER:[{spiritualFoundation:15,dexterity:18},{MEDICINE:.14,TALISMAN:.22,ZITHER:.26},'steady',['ZITHER','FOCUS','BOW'],['ROBE','LIGHT']],
 YIN_YANG_HARMONY:[{recoveryRate:20,meridianCapacity:12},{ALCHEMY:.18,MEDICINE:.20},'steady',['FOCUS','STAFF'],['ROBE']],
 TIGER_SOVEREIGN:[{strength:22,explosiveness:20},{hunting:.28},'early',['FIST','BLADE','STAFF'],['LIGHT','HEAVY']],
 BLOOD_DRAGON:[{vitality:24,strength:18},{hunting:.18,mining:.16},'late',['FIST','SPEAR'],['HEAVY']],
 VAJRA_BODHI:[{toughness:28,endurance:16},{MEDICINE:.16,mining:.18},'late',['STAFF','FIST'],['HEAVY']],
 DEVOURING_FIEND:[{immunity:24,strength:18},{hunting:.24,POISON:.15},'early',['FIST','BLADE'],['HEAVY']],
 SOLAR_FORGE:[{strength:20,dexterity:20},{FORGING:.38,mining:.14},'steady',['STAFF','FIST'],['HEAVY']],
 THUNDER_BODY:[{reflex:26,speed:18},{mining:.20,FORGING:.16},'early',['SPEAR','FIST'],['LIGHT']],
 JADE_IMMORTAL_BODY:[{vitality:28,recoveryRate:26},{MEDICINE:.24,herbalism:.22},'late',['STAFF','FOCUS'],['ROBE']],
 TITAN_MOUNTAIN_BODY:[{toughness:32,endurance:26,speed:-8},{mining:.36},'late',['STAFF','FIST'],['HEAVY']],
 WAR_DEITY:[{strength:16,endurance:20},{FORGING:.20,hunting:.15},'steady',['SPEAR','BLADE'],['HEAVY']],
 MERCY_DEITY:[{vitality:22,recoveryRate:18},{MEDICINE:.38,ALCHEMY:.16},'steady',['FOCUS','STAFF'],['ROBE']],
 FATE_ORACLE:[{reflex:20,spiritualFoundation:12},{SCRIPTURE:.30,TALISMAN:.20},'late',['FOCUS','STAFF','BOW'],['ROBE','LIGHT']],
 TOTEM_BEAST_GOD:[{strength:16,agility:16},{BEAST_TAMING:.35,hunting:.18},'early',['SPEAR','FIST'],['LIGHT']],
 UNDERWORLD_JUDGE:[{spiritualFoundation:22,endurance:14},{SCRIPTURE:.24,POISON:.16},'late',['STAFF','FOCUS'],['HEAVY']],
 OCEAN_SOVEREIGN:[{meridianCapacity:24,flexibility:18},{MEDICINE:.20,ALCHEMY:.18},'late',['SPEAR','FOCUS'],['ROBE']],
 HARVEST_EARTH_GOD:[{vitality:20,endurance:18},{herbalism:.38,MEDICINE:.18},'steady',['STAFF','FOCUS'],['ROBE']],
 FROST_MOON_IMMORTAL:[{meridianCapacity:18,reflex:16},{ALCHEMY:.24,herbalism:.18},'late',['SWORD','FOCUS'],['ROBE']],
 WOOD_SPRING_BODY:[{vitality:26,recoveryRate:28},{herbalism:.30,MEDICINE:.22},'late',['STAFF','FIST'],['LIGHT']],
 MEDICINE_BODHI_GOD:[{vitality:20,spiritualFoundation:20},{MEDICINE:.34,ALCHEMY:.26},'steady',['FOCUS','STAFF'],['ROBE']],
 SHADOW_ASSASSIN:[{agility:26,speed:18},{survival:.28,hunting:.18},'early',['BLADE','SWORD','BOW'],['LIGHT']],
 VENOM_GU_SOVEREIGN:[{immunity:32,dexterity:16},{POISON:.36,ALCHEMY:.24},'late',['FOCUS','BLADE'],['ROBE']],
 NETHER_GHOST_KING:[{spiritualFoundation:28,endurance:12},{SCRIPTURE:.24,BEAST_TAMING:.18},'late',['FOCUS','STAFF'],['ROBE']],
 HEAVEN_DEVOURING_DEMON:[{strength:26,explosiveness:24},{hunting:.30,mining:.16},'early',['FIST','BLADE'],['HEAVY']],
 ZEN_VOID_MIND:[{spiritualFoundation:22,recoveryRate:18},{SCRIPTURE:.32,MEDICINE:.20},'late',['STAFF','FOCUS'],['ROBE']],
 CALLIGRAPHY_PAINTING_SAGE:[{dexterity:24,meridianCapacity:18},{TALISMAN:.35,ARRAY:.24,BRUSH:.28},'late',['BRUSH','FOCUS','SWORD'],['ROBE','LIGHT']],
 DREAM_ILLUSION_WEAVER:[{reflex:22,agility:18},{SCRIPTURE:.24,TALISMAN:.20},'late',['FOCUS','SWORD'],['LIGHT','ROBE']],
 MIND_SWORD_TELEKINESIS:[{reflex:24,spiritualFoundation:20},{SWORD:.20,ARRAY:.22},'late',['SWORD','FOCUS'],['ROBE']],
 STAR_ARCHER:[{reflex:24,dexterity:20},{hunting:.28,survival:.20},'late',['BOW','FOCUS','SWORD'],['LIGHT','ROBE']],
 SHADOW_ARCHER:[{agility:24,reflex:22,explosiveness:18},{hunting:.30,POISON:.18,survival:.18},'early',['BOW','BLADE'],['LIGHT']],
 STAFF_GUARD:[{toughness:26,endurance:24,speed:-6},{mining:.28,FORGING:.18},'early',['STAFF','SPEAR'],['HEAVY']],
 CLOUD_DRAGON_SPEAR:[{"reflex":22,"agility":20,"speed":14},{"SPEAR":0.26,"survival":0.16},"late",["SPEAR"],["LIGHT","ROBE"]],
 PURE_SWORD_SAINT:[{"reflex":24,"dexterity":22,"agility":12},{"SWORD":0.28,"BLADE":0.18},"steady",["SWORD","BLADE"],["LIGHT","ROBE"]],
 WAR_SPEAR_SOVEREIGN:[{"strength":24,"endurance":20,"reflex":16},{"SPEAR":0.28,"STAFF":0.18,"hunting":0.18,"FORGING":0.12},"steady",["SPEAR","STAFF"],["HEAVY","LIGHT"]],
 IRON_BOW_SENTINEL:[{"strength":22,"dexterity":22,"toughness":16},{"BOW":0.28,"hunting":0.24,"FORGING":0.12},"early",["BOW","SPEAR"],["HEAVY","LIGHT"]],
 OVERLORD_HEAVY_BLADE:[{"strength":28,"explosiveness":22,"endurance":14},{"BLADE":0.28,"mining":0.18,"FORGING":0.14},"early",["BLADE","STAFF"],["HEAVY"]],
 SUN_BOW_DEITY:[{"dexterity":22,"reflex":20,"spiritualFoundation":18},{"BOW":0.26,"ritual":0.2,"hunting":0.15},"steady",["BOW","SPEAR","FOCUS"],["LIGHT","ROBE"]],
 GOLDEN_ARHAT_STAFF:[{"toughness":22,"vitality":20,"endurance":18},{"STAFF":0.26,"FIST_PALM":0.18,"ritual":0.18},"steady",["STAFF","FIST"],["HEAVY","ROBE"]],
 BLOOD_SPEAR_ASURA:[{"strength":22,"explosiveness":24,"vitality":16},{"SPEAR":0.28,"hunting":0.22},"early",["SPEAR","BLADE"],["HEAVY","LIGHT"]],
 ASHURA_SLAUGHTER_BLADE:[{"explosiveness":26,"agility":22,"strength":18},{"BLADE":0.3,"survival":0.18,"stealth":0.14},"early",["BLADE","FIST"],["LIGHT"]],
 ZITHER_HEART_BOW:[{"dexterity":24,"spiritualFoundation":20,"reflex":18},{"ZITHER":0.28,"BOW":0.25,"FOCUS":0.22,"arts":0.25},"late",["ZITHER","BOW","FOCUS"],["ROBE","LIGHT"]],
 HEART_BLADE_MEDITATION:[{"reflex":26,"dexterity":24,"spiritualFoundation":16},{"BLADE":0.26,"FOCUS":0.2,"SCRIPTURE":0.16},"late",["BLADE","FOCUS"],["LIGHT","ROBE"]],
 VOID_SPEAR_MIND:[{"spiritualFoundation":24,"reflex":20,"meridianCapacity":18},{"SPEAR":0.25,"STAFF":0.2,"ARRAY":0.18},"late",["SPEAR","STAFF"],["ROBE","LIGHT"]],
 IRON_COLOSSUS:[{toughness:30,strength:24,endurance:22},{FORGING:.35,mining:.22},'steady',['STAFF','SPEAR','FIST'],['HEAVY']],
 THOUSAND_THREAD_PUPPETEER:[{dexterity:28,reflex:24,spiritualFoundation:18},{WHIP:.28,FOCUS:.24,TALISMAN:.24,ARRAY:.18},'late',['WHIP','FOCUS','BLADE'],['LIGHT','ROBE']],
 SPIRIT_ARTILLERY_ENGINEER:[{dexterity:26,reflex:22,meridianCapacity:18},{BOW:.28,FORGING:.25,ARRAY:.20},'steady',['BOW','FOCUS'],['LIGHT','HEAVY']],
 CLOCKWORK_SWARM_WEAVER:[{dexterity:26,agility:22,reflex:20},{FORGING:.26,ARRAY:.26,TALISMAN:.18},'early',['FOCUS','BOW'],['LIGHT','ROBE']],
 SOUL_VESSEL_AVATAR:[{spiritualFoundation:26,vitality:22,toughness:20},{SOUL_DIVINE:.26,FORGING:.22,TALISMAN:.20},'late',['FOCUS','STAFF'],['ROBE','HEAVY']],
 FORTRESS_BASTION_ARCHITECT:[{toughness:28,endurance:24,meridianCapacity:18},{ARRAY:.34,FORGING:.24,construction:.22},'late',['STAFF','FOCUS','SPEAR'],['HEAVY','ROBE']],
 ASTRAL_CLOCKWORK_PRIME:[{spiritualFoundation:26,dexterity:24,reflex:22},{ARRAY:.32,FORGING:.26,SCRIPTURE:.18},'late',['FOCUS','SWORD'],['ROBE','LIGHT']],
 RED_THREAD_ARBITER:[{spiritualFoundation:26,reflex:22,meridianCapacity:18},{WHIP:.26,SCRIPTURE:.28,TALISMAN:.24,SOUL_DIVINE:.20},'late',['WHIP','FOCUS','SWORD'],['ROBE','LIGHT']],
 SIX_PATHS_WHEEL:[{spiritualFoundation:24,vitality:22,endurance:20},{SCRIPTURE:.28,ritual:.26,SOUL_DIVINE:.20},'late',['STAFF','FOCUS'],['ROBE','HEAVY']],
 ASURA_JUDGMENT_BLADE:[{strength:24,explosiveness:24,spiritualFoundation:18},{BLADE:.28,SWORD:.20,ritual:.18},'early',['BLADE','SWORD','SPEAR'],['HEAVY','LIGHT']],
 LOTUS_MERCY_PURIFIER:[{vitality:26,recoveryRate:26,spiritualFoundation:20},{MEDICINE:.36,ritual:.24,SCRIPTURE:.20},'steady',['FOCUS','STAFF'],['ROBE']],
 PAST_LIFE_CHRONICLER:[{spiritualFoundation:28,reflex:20,meridianCapacity:20},{SCRIPTURE:.36,SOUL_DIVINE:.26,arts:.18},'late',['FOCUS','SWORD'],['ROBE']],
 REVERSED_RETRIBUTION:[{toughness:26,vitality:24,endurance:20},{BODY_REFINING:.24,ritual:.24,SCRIPTURE:.18},'steady',['STAFF','BLADE','FIST'],['HEAVY','ROBE']],
 BODHI_VOW_GUARDIAN:[{toughness:28,vitality:26,spiritualFoundation:20},{STAFF:.24,MEDICINE:.24,ritual:.26},'late',['STAFF','FOCUS'],['HEAVY','ROBE']],
 MYRIAD_BEAST_PACK:[{agility:22,reflex:22,vitality:20},{BEAST_TAMING:.38,hunting:.26,survival:.20},'early',['SPEAR','BOW','STAFF'],['LIGHT','HEAVY']],
 SYMBIOTIC_FANG_FUSION:[{strength:26,agility:24,explosiveness:22},{BEAST_TAMING:.34,FIST_PALM:.26,BODY_REFINING:.20},'early',['FIST','BLADE','SPEAR'],['LIGHT','HEAVY']],
 COLOSSUS_SHIELD_TAMER:[{toughness:30,vitality:28,endurance:22},{BEAST_TAMING:.34,BODY_REFINING:.26,STAFF:.20},'steady',['STAFF','SPEAR','FIST'],['HEAVY']],
 MOUNT_CHARGER:[{speed:26,strength:24,agility:22},{BEAST_TAMING:.34,SPEAR:.28,MOVEMENT:.22},'early',['SPEAR','BOW'],['LIGHT','HEAVY']],
 PRIMORDIAL_BLOOD_AWAKENER:[{vitality:28,strength:24,spiritualFoundation:20},{BEAST_TAMING:.36,ALCHEMY:.24,MEDICINE:.20},'late',['FIST','SPEAR','FOCUS'],['HEAVY','ROBE']],
 SWARM_INSECT_EMPEROR:[{immunity:28,dexterity:22,reflex:20},{BEAST_TAMING:.34,POISON:.32,herbalism:.20},'steady',['FOCUS','BOW','BLADE'],['ROBE','LIGHT']],
 ABYSSAL_DRAGON_TOTEM:[{strength:26,vitality:26,spiritualFoundation:22},{BEAST_TAMING:.36,SPEAR:.26,ritual:.20},'late',['SPEAR','STAFF','FIST'],['HEAVY','ROBE']],
 HEAVENLY_GOLEM:[{toughness:30,strength:24,endurance:22},{FORGING:.35,mining:.22},'steady',['STAFF','SPEAR','FIST'],['HEAVY']],
 THOUSAND_THREAD_ASSASSIN:[{dexterity:28,reflex:24,spiritualFoundation:18},{WHIP:.28,FOCUS:.24,TALISMAN:.24,ARRAY:.18},'late',['WHIP','BLADE','FOCUS','SWORD'],['LIGHT','ROBE']],
 BEAST_CHIMERA_MECH:[{toughness:26,strength:22,dexterity:20},{FORGING:.32,BEAST_TAMING:.22,ARRAY:.18},'steady',['SPEAR','STAFF','FOCUS'],['HEAVY','LIGHT']],
 CELESTIAL_BALLISTA:[{dexterity:26,reflex:22,meridianCapacity:18},{BOW:.28,FORGING:.25,ARRAY:.20},'steady',['BOW','FOCUS'],['LIGHT','HEAVY']],
 FLYING_BLADE_ORBITER:[{dexterity:26,agility:22,reflex:20},{FORGING:.26,ARRAY:.26,SWORD:.20},'early',['SWORD','BLADE','FOCUS'],['LIGHT','ROBE']],
 FATE_SEVERING_THREAD:[{spiritualFoundation:26,reflex:22,meridianCapacity:18},{WHIP:.28,SCRIPTURE:.28,TALISMAN:.24,SWORD:.20},'late',['WHIP','FOCUS','SWORD','BLADE'],['ROBE','LIGHT']],
 PAST_LIFE_MIRROR:[{spiritualFoundation:28,reflex:20,meridianCapacity:20},{SCRIPTURE:.36,SOUL_DIVINE:.26,arts:.18},'late',['FOCUS','SWORD'],['ROBE','LIGHT']],
 PRIMORDIAL_BLOOD_MUTATOR:[{vitality:28,strength:24,spiritualFoundation:20},{BEAST_TAMING:.36,ALCHEMY:.24,MEDICINE:.20},'late',['FIST','SPEAR','FOCUS'],['HEAVY','ROBE']],
 SYMBIOTIC_BEAST_WARRIOR:[{strength:26,agility:24,explosiveness:22},{BEAST_TAMING:.34,FIST_PALM:.26,BODY_REFINING:.20},'early',['FIST','BLADE','SPEAR'],['LIGHT','HEAVY']],
 SWARM_GU_HIVE_MASTER:[{immunity:28,dexterity:22,reflex:20},{BEAST_TAMING:.34,POISON:.32,herbalism:.20},'steady',['FOCUS','BOW','BLADE'],['ROBE','LIGHT']],
 CELESTIAL_ASTRAL_FAIRY_TAMER:[{spiritualFoundation:24,vitality:24,agility:20},{BEAST_TAMING:.34,MEDICINE:.24,herbalism:.22},'steady',['FOCUS','STAFF','BOW'],['ROBE','LIGHT']],
 GOLDEN_NEEDLE_SAINT:[{dexterity:26,spiritualFoundation:24,reflex:20},{MEDICINE:.38,ALCHEMY:.24,FOCUS:.22},'steady',['FOCUS','SWORD'],['ROBE','LIGHT']],
 CELESTIAL_ZITHER_ENVOY:[{spiritualFoundation:26,dexterity:24,reflex:20},{ZITHER:.30,arts:.36,FOCUS:.26,SOUL_DIVINE:.20},'late',['ZITHER','FOCUS','BOW'],['ROBE','LIGHT']],
 DIVINE_NECTAR_APOTHECARY:[{vitality:28,recoveryRate:28,spiritualFoundation:22},{MEDICINE:.40,ALCHEMY:.32,herbalism:.26},'steady',['FOCUS','STAFF'],['ROBE']],
 QIMEN_TALISMAN_PATRON:[{spiritualFoundation:26,toughness:22,endurance:20},{TALISMAN:.36,ARRAY:.32,FOCUS:.20},'late',['FOCUS','STAFF'],['ROBE','HEAVY']],
 SOUL_LANTERN_SHEPHERD:[{spiritualFoundation:28,vitality:24,endurance:20},{SOUL_DIVINE:.34,MEDICINE:.28,ritual:.24},'late',['FOCUS','STAFF'],['ROBE']],
 WAR_BANNER_CHORISTER:[{strength:22,vitality:24,endurance:22},{SPEAR:.28,STAFF:.24,ritual:.28},'early',['SPEAR','STAFF','FOCUS'],['HEAVY','LIGHT']],
 WOOD_SPIRIT_SYMBIONT:[{vitality:28,recoveryRate:26,meridianCapacity:22},{herbalism:.36,MEDICINE:.30,WOOD_LIFE:.24},'steady',['STAFF','FOCUS'],['ROBE','LIGHT']],
 PILL_FURNACE_IMMORTAL:[{vitality:26,spiritualFoundation:26,recoveryRate:22},{ALCHEMY:.42,MEDICINE:.28,herbalism:.24},'steady',['FOCUS','STAFF'],['ROBE','LIGHT']],
 POISON_VENOM_CAULDRON:[{immunity:28,dexterity:24,reflex:20},{ALCHEMY:.38,POISON:.34,herbalism:.22},'late',['FOCUS','BLADE'],['ROBE','LIGHT']],
 HEAVENLY_ANVIL_SMITH:[{strength:28,toughness:28,dexterity:22},{FORGING:.42,mining:.28},'steady',['STAFF','FIST','BLADE'],['HEAVY','LIGHT']],
 SPIRIT_SWORD_ARTIFICER:[{dexterity:26,reflex:26,spiritualFoundation:20},{FORGING:.38,SWORD:.28,BLADE:.22},'late',['SWORD','BLADE','SPEAR'],['LIGHT','HEAVY']],
 RUNE_ARRAY_ENGRAVER:[{spiritualFoundation:26,dexterity:24,meridianCapacity:22},{ARRAY:.38,TALISMAN:.34,FORGING:.24},'late',['FOCUS','BOW','SWORD'],['ROBE','LIGHT']],
 DIVINE_FLAME_SMELTER:[{spiritualFoundation:26,vitality:24,dexterity:24},{ALCHEMY:.34,FORGING:.34,mining:.20,herbalism:.20},'steady',['FOCUS','STAFF','SPEAR'],['ROBE','HEAVY']]
};
Object.assign(paths, D.pathProfiles || {});
Object.assign(profiles, D.subProfiles || {});
if(D.pathProfiles){for(const [k,v] of Object.entries(D.pathProfiles))if(!paths[k])paths[k]=v;else if(Array.isArray(v.weapons)){for(const w of v.weapons)if(!paths[k].weapons.includes(w))paths[k].weapons.push(w);}}
if(D.subProfiles){for(const [k,v] of Object.entries(D.subProfiles))if(!profiles[k])profiles[k]=v;else if(Array.isArray(v[3]))profiles[k][3]=v[3].slice();}
M.PATHS=paths;M.PROFILES=profiles;
if(D.SYNERGIES){for(const [sk,pr] of Object.entries(profiles)){const syn=D.SYNERGIES[sk];if(syn){if(Array.isArray(pr[3]))syn.weaponTypes=pr[3].slice();if(Array.isArray(pr[4]))syn.armorTypes=pr[4].slice();}}}

M.invalidateMartialCaches=n=>{
 if(!n)return;
 n._passVer=(n._passVer||0)+1;
 n._passRec=null;
 n._passStatsCache=null;
 n._innStatsCache=null;
 n._actTechsCache=null;
 n._synCache=null;
 n._resSetCache=null;
 n._innRec=null;
 n._qiMaxCache=null;
 n._lifeMultCache=null;
 n._progCache=null;
 n._skListCache=null;
 if(ST&&ST.dirty)ST.dirty(n);
};

/* ---------- Exclusive Innate Subpath Technique Authority ---------- */
M.isInnateTech=tOrId=>{
 const t=typeof tOrId==='string'?CULT.tech(tOrId):tOrId;
 return !!(t&&(t.innateOnly||t.acquisition==='SUBPATH_INNATE'));
};

function bindCultInnateAccessors(n){
 if(!n||!n.cult||n.cult._innAcc)return;
 const c=n.cult;
 if(Object.prototype.hasOwnProperty.call(c,'innateTechs')&&Object.getOwnPropertyDescriptor(c,'innateTechs').enumerable){
  if(Array.isArray(c.innateTechs)&&!Array.isArray(n.innateTechs))n.innateTechs=c.innateTechs;
  delete c.innateTechs;
 }
 if(Object.prototype.hasOwnProperty.call(c,'dormantInnate')&&Object.getOwnPropertyDescriptor(c,'dormantInnate').enumerable){
  if(Array.isArray(c.dormantInnate)&&!Array.isArray(n.dormantInnate))n.dormantInnate=c.dormantInnate;
  delete c.dormantInnate;
 }
 if(Object.prototype.hasOwnProperty.call(c,'innateGranted')&&Object.getOwnPropertyDescriptor(c,'innateGranted').enumerable){
  if(Array.isArray(c.innateGranted)&&!Array.isArray(n.innateGranted))n.innateGranted=c.innateGranted;
  delete c.innateGranted;
 }
 if(!Object.getOwnPropertyDescriptor(c,'innateTechs')){
  Object.defineProperty(c,'innateTechs',{get(){return n.innateTechs||[];},set(v){n.innateTechs=v;},enumerable:false,configurable:true});
 }
 if(!Object.getOwnPropertyDescriptor(c,'dormantInnate')){
  Object.defineProperty(c,'dormantInnate',{get(){return n.dormantInnate||[];},set(v){n.dormantInnate=v;},enumerable:false,configurable:true});
 }
 if(!Object.getOwnPropertyDescriptor(c,'innateGranted')){
  Object.defineProperty(c,'innateGranted',{get(){return n.innateGranted||[];},set(v){n.innateGranted=v;},enumerable:false,configurable:true});
 }
 Object.defineProperty(c,'_innAcc',{value:true,enumerable:false,configurable:true});
}

M.reconcileInnate=(n,W)=>{
 if(!n)return [];
 if(!n.cult){
  if(Array.isArray(n.innateTechs))delete n.innateTechs;
  return [];
 }
 const c=n.cult;
 const effSt0=CULT.effectiveTechStage?CULT.effectiveTechStage(n):(c.stage||1);
 const ir=n._innRec;
 if(ir&&ir.cult===c&&ir.path===c.path&&ir.sub===c.sub&&ir.st===effSt0&&ir.ver===(n._passVer||0)){
  return ir.out;
 }
 bindCultInnateAccessors(n);
 if(!Array.isArray(n.innateTechs))n.innateTechs=[];
 if(!Array.isArray(n.dormantInnate))n.dormantInnate=[];
 if(!Array.isArray(n.innateGranted))n.innateGranted=[];

 if(Array.isArray(c.techs)&&c.techs.some(id=>M.isInnateTech(id))){
  c.techs=c.techs.filter(id=>!M.isInnateTech(id));
  n._actTechsCache=null;
 }
 if(Array.isArray(n.passiveLoadout)&&n.passiveLoadout.some(id=>M.isInnateTech(id))){
  n.passiveLoadout=n.passiveLoadout.filter(id=>!M.isInnateTech(id));
  n._passRec=null;
 }
 if(n.inv){
  if(Array.isArray(n.inv.techs)&&n.inv.techs.some(id=>M.isInnateTech(id))){
   n.inv.techs=n.inv.techs.filter(id=>!M.isInnateTech(id));
  }
  if(n.inv.crystals){
   for(const k of Object.keys(n.inv.crystals)){
    if(k.startsWith('T:')&&M.isInnateTech(k.slice(2)))delete n.inv.crystals[k];
   }
  }
 }

 const effSt=CULT.effectiveTechStage?CULT.effectiveTechStage(n):(c.stage||1);
 const targetInnate=(c.sub&&c.sub!=='NONE')?M.INNATE_BY_SUB[c.sub]:null;
 const qualifies=!!(targetInnate&&targetInnate.path===c.path&&(targetInnate.reqTier||targetInnate.tier||1)<=effSt);

 for(const oldId of n.innateTechs){
  if(!qualifies||oldId!==targetInnate.id){
   if(M.isInnateTech(oldId)&&!n.dormantInnate.includes(oldId)){
    n.dormantInnate.push(oldId);
   }
  }
 }

 if(qualifies){
  const tid=targetInnate.id;
  n.dormantInnate=n.dormantInnate.filter(id=>id!==tid);
  const changed=n.innateTechs.length!==1||n.innateTechs[0]!==tid;
  if(changed){
   n.innateTechs=[tid];
   M.invalidateMartialCaches(n);
  }
  if(!n.innateGranted.includes(tid)){
   n.innateGranted.push(tid);
   if(W&&W.log&&!W._founding){
    W.log('insight',(n.h&&n.h.name?n.h.name.given:'ผู้บำเพ็ญ')+' ตื่นรู้วิชาเฉพาะสายย่อย「'+targetInnate.nameTh+'」',[n.id]);
   }
  }
 }else if(n.innateTechs.length>0){
  n.innateTechs=[];
  M.invalidateMartialCaches(n);
 }
 n._innRec={cult:c,path:c.path,sub:c.sub,st:effSt,ver:n._passVer||0,out:n.innateTechs};
 return n.innateTechs;
};

M.activeInnateTechs=n=>{
 if(!n||!n.cult)return [];
 return M.reconcileInnate(n);
};

M.dormantInnateTechs=n=>{
 if(!n||!n.cult)return [];
 M.reconcileInnate(n);
 return (n.cult.dormantInnate||[]).slice();
};

M.isInnateActive=(n,techOrId)=>{
 const t=typeof techOrId==='string'?CULT.tech(techOrId):techOrId;
 if(!t||!M.isInnateTech(t)||!n||!n.cult)return false;
 const active=M.activeInnateTechs(n);
 return active.includes(t.id);
};

const EMPTY_INNATE_STATS=Object.freeze({p:{},f:{},pp:{},qiMaxFlat:0,qiMaxPct:0,qiCostMult:1,cultRatePct:0,life:{},activeIds:[]});
M.innateStats=n=>{
 if(!n||!n.cult)return EMPTY_INNATE_STATS;
 const c=n.cult,eq=n.equip||{},ic=n._innStatsCache;
 if(ic&&ic.cult===c&&ic.path===c.path&&ic.sub===c.sub&&ic.rawSt===c.stage&&ic.eqW===eq.WEAPON&&ic.eqA===eq.ARMOR&&ic.ver===(n._passVer||0)&&ic.tm===(ic.tid&&c.tm?c.tm[ic.tid]||0:0)){
  return ic.out;
 }
 const effSt=CULT.effectiveTechStage?CULT.effectiveTechStage(n):c.stage;
 const active=M.activeInnateTechs(n);
 if(!active.length){
  n._innStatsCache={cult:c,path:c.path,sub:c.sub,rawSt:c.stage,st:effSt,tid:'',tm:0,eqW:eq.WEAPON,eqA:eq.ARMOR,ver:n._passVer||0,out:EMPTY_INNATE_STATS};
  return EMPTY_INNATE_STATS;
 }
 const tid=active[0],tmVal=(c.tm&&c.tm[tid])||0;
 const t=CULT.tech(tid);
 if(!t||!M.isInnateActive(n,t)){
  return EMPTY_INNATE_STATS;
 }
 const p={},f={},pp={},life={};
 let qiMaxFlat=0,qiMaxPct=0,qiCostMult=1,cultRatePct=0;
 const ib=t.innateBonus||{};
 for(const k in ib.p)p[k]=(p[k]||0)+ib.p[k];
 for(const k in ib.f)f[k]=(f[k]||0)+ib.f[k];
 for(const k in ib.pp)pp[k]=(pp[k]||0)+ib.pp[k];
 for(const k in ib.life)life[k]=(life[k]||0)+ib.life[k];
 if(ib.qiMaxFlat)qiMaxFlat+=ib.qiMaxFlat;
 if(ib.qiMaxPct)qiMaxPct+=ib.qiMaxPct;
 if(ib.qiCostMult)qiCostMult*=ib.qiCostMult;
 if(ib.cultRatePct)cultRatePct+=ib.cultRatePct;
 if(g.SK&&g.SK.unlockedStage&&Array.isArray(t.stages)&&M.conditionMatches(n,t)){
  const uStage=g.SK.unlockedStage(n,t);
  for(const st of t.stages){
   if(st.stage<=uStage&&st.passiveBonus){
    for(const k in st.passiveBonus.p)p[k]=(p[k]||0)+st.passiveBonus.p[k];
    for(const k in st.passiveBonus.f)f[k]=(f[k]||0)+st.passiveBonus.f[k];
    for(const k in st.passiveBonus.pp)pp[k]=(pp[k]||0)+st.passiveBonus.pp[k];
   }
  }
 }
 const out={p,f,pp,qiMaxFlat,qiMaxPct,qiCostMult,cultRatePct,life,activeIds:[tid]};
 n._innStatsCache={cult:c,path:c.path,sub:c.sub,rawSt:c.stage,st:effSt,tid,tm:tmVal,eqW:eq.WEAPON,eqA:eq.ARMOR,ver:n._passVer||0,out};
 return out;
};

M.normalize=n=>{
 if(!n||!n.cult)return;
 const c=n.cult,p=CULT.PATHS[c.path];
 if(!p)return;
 if(c.sub&&c.sub!=='NONE'&&CULT.resolveSubId){
  const rSub=CULT.resolveSubId(c.sub);
  if(rSub!==c.sub){c.sub=rSub;if(c.track&&c.track.subPath)c.track.subPath=rSub;}
 }
 if(c.sub!=='NONE'&&!p.subPaths.some(s=>s.id===c.sub)){
  c.sub='NONE';c.track=null;M.invalidateMartialCaches(n);
 }
 if(c.sub==='NONE'&&c.track){
  c.track=null;M.invalidateMartialCaches(n);
 }
 if(CULT.reconcileActivePetCap&&n.pets&&n.pets.length)CULT.reconcileActivePetCap(n);
 if(c.path==='MECH_PUPPET'&&CULT.ensureMechState)CULT.ensureMechState(n);
 if(c.path==='KARMA_SAMSARA'&&CULT.ensureKarmaState)CULT.ensureKarmaState(n);
 M.reconcileInnate(n);
};
const growth=(stage,max,curve)=>{const x=clamp((stage-1)/Math.max(1,max-1),0,1);return .18+.82*(curve==='early'?Math.sqrt(x):curve==='late'?x*x:x);};
const progressCache=new WeakMap();
M.progression=(n,stage)=>{
 const c=n.cult;if(!c||!paths[c.path])return {identity:'ปุถุชน',body:{},p:{},f:{},life:{},scale:0};
 const rank=Math.min(CULT.PATHS[c.path].maxStage,stage==null?c.stage:stage),track=c.track?c.track.ordinal||1:1;
 const pc=n._progCache;if(pc&&pc.path===c.path&&pc.sub===c.sub&&pc.rank===rank&&pc.track===track)return pc.value;
 const path=paths[c.path],sub=CULT.PATHS[c.path].subPaths.some(s=>s.id===c.sub)?profiles[c.sub]:null,max=CULT.PATHS[c.path].maxStage,ps=growth(rank,max,path.curve),ss=Math.max(growth(rank,max,sub?sub[2]:'steady'),track>1?growth(track,9,sub?sub[2]:'steady')*.85:0);
 const body={},p={},life={};for(const k in path.body)body[k]=path.body[k]*ps;if(sub)for(const k in sub[0])body[k]=(body[k]||0)+sub[0][k]*ss;
 for(const k in path.p)p[k]=path.p[k]*ps;for(const k in path.life)life[k]=1+path.life[k]*ps;if(sub)for(const k in sub[1])life[k]=(life[k]||1)+sub[1][k]*ss;
 Object.keys(body).forEach(k=>body[k]=Math.round(body[k]*10)/10);
 const value={identity:sub?CULT.subInfo(c.path,c.sub).nameTh:'พื้นฐาน (ยังไม่เลือกสายย่อย)',body,p,f:{},life,scale:ss,curve:sub?sub[2]:path.curve};
 n._progCache={path:c.path,sub:c.sub,rank,track,value};return value;
};
M.eff=(n,path)=>{const value=HC.eff(n,path);return path.startsWith('physiology.')?clamp(value+(M.progression(n).body[path.slice(11)]||0),0,180):value;};
const derivedCache=new WeakMap();M.derived=n=>{const day=HC.nowDay,ver=n._ver||0,c=n.cult,cSt=c?c.stage:0,cSub=c?c.sub:"",cTr=c&&c.track?c.track.ordinal:0,mHit=n._mDer;if(mHit&&mHit.day===day&&mHit.ver===ver&&mHit.cSt===cSt&&mHit.cSub===cSub&&mHit.cTr===cTr)return mHit.val;const d=HC.derived(n),prog=M.progression(n),hit=derivedCache.get(n);if(hit&&hit.day===day&&hit.ver===ver&&hit.prog===prog&&hit.d===d){n._mDer={day,ver,cSt,cSub,cTr,val:hit.val};return hit.val;}const b=prog.body,val=Object.assign({},d,{hpMax:Math.round(d.hpMax+(b.vitality||0)*1.1+(b.toughness||0)*.5+(b.strength||0)*.2),walkSpeed:d.walkSpeed+((b.speed||0)*.7+(b.agility||0)*.3)/100*.9});derivedCache.set(n,{day,ver,prog,d,val});n._mDer={day,ver,cSt,cSub,cTr,val};return val;};

/* ---------- Passive Slot Authority, Exclusivity & Toggle Safety ---------- */
M.passiveSlotInfo=n=>{
 if(!n||!n.cult)return {base:M.BASE_PASSIVE_SLOTS,bonus:0,max:0,reasonTh:'ยังไม่เปิดวิถีบำเพ็ญ'};
 const subBonus=M.PASSIVE_SLOT_BONUSES[n.cult.sub];
 const bonus=subBonus?(subBonus.slots||0):0;
 return {
  base:M.BASE_PASSIVE_SLOTS,
  bonus,
  max:M.BASE_PASSIVE_SLOTS+bonus,
  reasonTh:subBonus?subBonus.reasonTh:'ช่องพื้นฐาน '+M.BASE_PASSIVE_SLOTS+' ช่อง'
 };
};
M.maxPassiveSlots=n=>M.passiveSlotInfo(n).max;
for(const _id of [
 'ART190_BODY_003','ART190_BODY_008','ART190_BODY_012','ART190_BODY_017','ART190_BODY_025','ART190_BODY_031','ART190_BODY_036',
 'MP_FIST_BAJI_SHOULDER_T3','MP_FIST_TEMPEST_KICK_T4',
 'INNATE_ELIXIR_DAO_CAULDRON','INNATE_YIN_YANG_TAIJI_WHEEL','INNATE_TIGER_SOVEREIGN_FEROCITY','INNATE_VAJRA_BODHI_GOLDEN_BELL',
 'INNATE_MERCY_DEITY_LOTUS_GRACE','INNATE_SHADOW_ASSASSIN_NIGHT_VEIL','INNATE_VENOM_GU_HEART_PARASITE','INNATE_ZEN_VOID_HEART_MIRROR',
 'INNATE_FIVE_ELEMENTS_CORE','INNATE_ASTRAL_ARRAY_CORE','INNATE_BLOOD_DEMON_CORE','INNATE_PHANTOM_SOUL_CORE','INNATE_TIME_VOID_CORE',
 'INNATE_FROST_MOON_IMMORTAL_CORE','INNATE_BLOOD_DRAGON_CORE','INNATE_DEVOURING_FIEND_CORE','INNATE_SOLAR_FORGE_CORE',
 'INNATE_THUNDER_BODY_CORE','INNATE_JADE_IMMORTAL_BODY_CORE','INNATE_TITAN_MOUNTAIN_BODY_CORE','INNATE_WOOD_SPRING_BODY_CORE',
 'INNATE_FATE_ORACLE_CORE','INNATE_TOTEM_BEAST_GOD_CORE','INNATE_UNDERWORLD_JUDGE_CORE','INNATE_OCEAN_SOVEREIGN_CORE',
 'INNATE_HARVEST_EARTH_GOD_CORE','INNATE_MEDICINE_BODHI_GOD_CORE','INNATE_NETHER_GHOST_KING_CORE',
 'INNATE_HEAVEN_DEVOURING_DEMON_CORE','INNATE_DREAM_ILLUSION_WEAVER_CORE'
]){const _bt=CULT.tech(_id);if(_bt){delete _bt.weaponTypes;delete _bt.weapon;_bt.requiresWeapon=false;}}
M.classifyTechniqueAccess=tOrId=>{
 const t=typeof tOrId==='string'?CULT.tech(tOrId):tOrId;
 if(!t)return {accessClass:'INVALID',learnableAcrossPaths:false,learnableAcrossSubpaths:false,reasonTh:'ไม่พบข้อมูลวิชา'};
 if(t.innateOnly||M.isInnateTech(t))return {accessClass:'EXCLUSIVE_INNATE',learnableAcrossPaths:false,learnableAcrossSubpaths:false,reasonTh:'วิชาเฉพาะสายย่อยติดตัว (ตื่นรู้ตามสายย่อย ไม่ใช่คัมภีร์หอคัมภีร์)'};
 if(t.legendary)return {accessClass:'UNIVERSAL_LEGENDARY',learnableAcrossPaths:true,learnableAcrossSubpaths:true,reasonTh:'คัมภีร์ระดับตำนาน ศึกษาและสำแดงอานุภาพได้ทุกวิถีและสายย่อย'};
 if(/FORBIDDEN/.test(t.cat||'')||(t.sub&&['VENOM_GU_SOVEREIGN','CORPSE_PUPPET_MASTER'].includes(t.sub)&&/GU_|CORPSE_|PARASITE/.test(t.id||'')))return {accessClass:'EXCLUSIVE_PARASITE_FORBIDDEN',learnableAcrossPaths:false,learnableAcrossSubpaths:false,reasonTh:'ต้องใช้กู่พิษ ซากศพ หรือพิธีกรรมต้องห้ามเฉพาะทาง'};
 if(typeof t.id==='string'&&t.id.startsWith('MP_')||((t.passive||t.cat==='PASSIVE')&&t.sub))return {accessClass:'EXCLUSIVE_SUBPATH_PASSIVE',learnableAcrossPaths:false,learnableAcrossSubpaths:!t.sub,reasonTh:'รากฐานวิชาติดตัวเฉพาะสายบำเพ็ญ'};
 return {accessClass:'CROSS_PATH_MANUAL',learnableAcrossPaths:true,learnableAcrossSubpaths:true,reasonTh:'คัมภีร์ยุทธภพ เปิดกว้างให้ศึกษาข้ามสายย่อยและวิถีได้ (ปรับความเร็วเรียนและอานุภาพตามความสอดคล้อง)'};
};
M.weaponCompatibility=(n,tOrId)=>{
 const t=typeof tOrId==='string'?CULT.tech(tOrId):tOrId;
 if(!t||!t.weaponTypes||!t.weaponTypes.length)return {state:'UNRESTRICTED',mult:1,qiCostMult:1,accDelta:0,canUse:true,reasonTh:'ไม่จำกัดศาสตรา'};
 const eqType=M.equippedType?M.equippedType(n):(M.gearType(n&&n.equip&&n.equip.WEAPON)||'FIST');
 if(t.weaponTypes.includes(eqType))return {state:'MATCHED',mult:1.15,qiCostMult:1,accDelta:4,canUse:true,reasonTh:'อาวุธตรงตามเคล็ดวิชา (×1.15)'};
 if(t.legendary)return {state:'LEGENDARY_QI_PROJECTION',mult:1.0,qiCostMult:1,accDelta:0,canUse:true,reasonTh:'วิชาตำนานสำแดงผ่านปราณจำแลงโดยไม่ติดขัด (×1.00 · ถือศาสตราตรงสายได้โบนัส ×1.15)'};
 if(t.requiresWeapon)return {state:'BLOCKED_REQUIRED_WEAPON',mult:0,qiCostMult:1,accDelta:-99,canUse:false,reasonTh:'ต้องสวมใส่อาวุธ '+t.weaponTypes.join('/')};
 const severe=(t.weaponTypes.includes('BOW')&&eqType!=='BOW')||(eqType==='BOW'&&['SWORD','BLADE','SPEAR','STAFF','FIST'].some(w=>t.weaponTypes.includes(w)));
 if(severe)return {state:'SEVERE_MISMATCH',mult:0.65,qiCostMult:1.25,accDelta:-12,canUse:true,reasonTh:'อาวุธขัดแย้งกับท่วงท่าวิชา (×0.65 · แม่นยำลด · กินปราณเพิ่ม)'};
 return {state:'ADAPTED_WEAPON',mult:0.65,qiCostMult:1.10,accDelta:-4,canUse:true,reasonTh:'ดัดแปลงใช้อาวุธต่างชนิด (×0.65)'};
};
M.canLearnTech=(n,tOrId)=>M.resolveTechCompatibility(n,tOrId);
M.resolveTechCompatibility=(n,tOrId)=>{
 const t=typeof tOrId==='string'?CULT.tech(tOrId):tOrId;
 if(!n||!n.cult||!t)return {ok:false,studySpeedMult:1,combatPowerMult:1,qiCostMult:1,weaponMult:1,accessClass:'INVALID',summaryTh:'ไม่พร้อมคำนวณ'};
 const c=n.cult,cls=M.classifyTechniqueAccess(t),wpn=M.weaponCompatibility(n,t);
 const pathExact=t.path==='ANY'||t.path===c.path||(Array.isArray(t.compatiblePaths)&&t.compatiblePaths.includes(c.path));
 const subExact=!t.sub||t.sub===c.sub||(Array.isArray(t.preferredSubs)&&t.preferredSubs.includes(c.sub));
 const pathStudy=t.legendary?(pathExact&&t.path!=='ANY'?1.08:1.0):(pathExact?1.0:0.80);
 const subStudy=t.legendary?(subExact&&t.sub?1.12:1.0):(subExact?(t.sub?1.12:1.0):0.90);
 const pathCombat=t.legendary?(pathExact&&t.path!=='ANY'?1.10:1.0):(pathExact?1.0:0.88);
 const subCombat=t.legendary?(subExact&&t.sub?1.08:1.0):(subExact?(t.sub?1.08:1.0):0.94);
 const studySpeedMult=+(pathStudy*subStudy).toFixed(3);
 const combatPowerMult=+(pathCombat*subCombat).toFixed(3);
 const qiCostMult=+(wpn.qiCostMult*(t.legendary?1:(pathExact?1:1.12))).toFixed(3);
 const parts=[];
 parts.push(pathExact?(t.legendary&&t.path!=='ANY'?'ตรงวิถีหลัก (+10% อานุภาพตำนาน)':'ตรงวิถีหลัก'):(t.legendary?'วิชาตำนานไร้โทษต่างวิถี (×1.00)':'ต่างวิถีหลัก'));
 if(t.sub)parts.push(subExact?'ตรงสายย่อย (+12% เรียน/+8% รบ)':(t.legendary?'ข้ามสายย่อยไร้โทษ (×1.00)':'ข้ามสายย่อย'));
 parts.push(wpn.reasonTh);
 return {
  ok:M.isTechCompatible(n,t),
  learnable:M.isTechCompatible(n,t),
  accessClass:cls.accessClass,
  pathExact,
  subExact,
  studySpeedMult,
  combatPowerMult,
  qiCostMult,
  weaponCompatibility:wpn,
  weaponMult:wpn.mult,
  summaryTh:parts.join(' · ')+' (เรียน ×'+studySpeedMult.toFixed(2)+' · รบ ×'+combatPowerMult.toFixed(2)+')'
 };
};
M.auditTechniqueCatalog=()=>{
 const all=[...(JD.TECH.techniques||[]),...(JD.TECH.mantras||[])];
 const counts={total:all.length,techniques:JD.TECH.techniques.length,mantras:JD.TECH.mantras.length,byClass:{}};
 for(const t of all){
  const cl=M.classifyTechniqueAccess(t).accessClass;
  counts.byClass[cl]=(counts.byClass[cl]||0)+1;
 }
 return counts;
};
M.isTechCompatible=(n,t)=>{
 if(!n||!n.cult||!t)return false;
 const c=n.cult;
 const effSt=CULT.effectiveTechStage?CULT.effectiveTechStage(n):(c.stage||1);
 if(M.isInnateTech(t)){
  return c.path===t.path&&c.sub===t.innateSubpath&&(t.reqTier||t.tier||1)<=effSt;
 }
 if(t.legendary||t.isSectHeritage)return (t.reqTier||t.tier||1)<=effSt;
 const isExcl=CULT.isExclusiveSubpathTech?CULT.isExclusiveSubpathTech(t):(t.id.startsWith('MP_')||((t.passive||t.cat==='PASSIVE')&&!!t.sub));
 if(t.reqPath&&t.reqPath!=='ANY'){
  const rp=Array.isArray(t.reqPath)?t.reqPath:[t.reqPath];
  if(!rp.includes(c.path))return false;
 }
 if(t.reqSubpath){
  const rs=Array.isArray(t.reqSubpath)?t.reqSubpath:[t.reqSubpath];
  if(!rs.includes(c.sub))return false;
 }
 if(t.reqElement&&t.reqElement!=='NEUTRAL'&&t.reqElement!=='ANY'){
  const reqEls=Array.isArray(t.reqElement)?t.reqElement:[t.reqElement];
  const rEls=(n.h&&n.h.root&&Array.isArray(n.h.root.elements))?n.h.root.elements:[];
  const specAcc=(n.ext&&n.ext.elementalSystem&&n.ext.elementalSystem.specialAccess)||{};
  const subEl=(c.sub&&CULT.subInfo(c.path,c.sub)&&CULT.subInfo(c.path,c.sub).element)||null;
  const hasEl=reqEls.some(re=>re==='NEUTRAL'||re==='ANY'||rEls.includes(re)||(specAcc[re]&&specAcc[re].unlocked)||subEl===re);
  if(!hasEl)return false;
 }
 const pathOk=t.path==='ANY'||t.path===c.path||(!isExcl&&(t.legendary||!t.id.startsWith('MP_')));
 const subOk=CULT.isSubCompatible?CULT.isSubCompatible(t,c.sub,false):(!t.sub||t.sub===c.sub);
 return pathOk&&subOk&&(t.reqTier||t.tier)<=effSt;
};
M.passiveFamilyOf=t=>t?(t.passiveFamily||('FAM_'+t.id)):null;

M.reconcilePassives=n=>{
 if(!n||!n.cult||!Array.isArray(n.cult.techs))return [];
 const c=n.cult,tl=c.techs.length,tLast=tl?c.techs[tl-1]:'',tFirst=tl?c.techs[0]:'';
 const pArr=Array.isArray(n.passiveLoadout)?n.passiveLoadout:null;
 const pLen=pArr?pArr.length:-1,p0=pLen>0?pArr[0]:'',ver=n._passVer||0;
 const rc=n._passRec;
 const effSt=CULT.effectiveTechStage?CULT.effectiveTechStage(n):(c.stage||1);
 if(rc&&rc.path===c.path&&rc.sub===c.sub&&rc.stage===effSt&&rc.tl===tl&&rc.tLast===tLast&&rc.tFirst===tFirst&&rc.pLen===pLen&&rc.p0===p0&&rc.ver===ver&&Array.isArray(c.equippedPassives)){
  return c.equippedPassives;
 }
 M.reconcileInnate(n);
 if(rc&&rc.path===c.path&&rc.sub===c.sub&&rc.stage===effSt&&rc.tl===tl&&rc.tLast===tLast&&rc.tFirst===tFirst&&rc.pLen===pLen&&rc.p0===p0&&rc.ver===ver){
  return rc.out;
 }
 const maxSlots=M.maxPassiveSlots(n);
 const learnedPassives=n.cult.techs.filter(id=>{const t=CULT.tech(id);return !!(t&&!M.isInnateTech(t)&&(t.cat==='PASSIVE'||t.passive));});
 if(!learnedPassives.length){
  if(Array.isArray(n.passiveLoadout)&&n.passiveLoadout.length)n.passiveLoadout=[];
  const emptyOut=[];
  n._passRec={path:c.path,sub:c.sub,stage:effSt,tl,tLast,tFirst,pLen:Array.isArray(n.passiveLoadout)?n.passiveLoadout.length:-1,p0:'',ver:n._passVer||0,out:emptyOut};
  return emptyOut;
 }
 const unequipped=new Set(Array.isArray(n.passiveUnequipped)?n.passiveUnequipped:[]);
 const pinned=new Set(Array.isArray(n.passivePinned)?n.passivePinned:[]);
 const current=Array.isArray(n.passiveLoadout)?n.passiveLoadout:[];
 const next=[];
 const usedFamilies=new Map();

 // 1. Keep valid existing loadout order first
 for(const id of current){
  if(next.length>=maxSlots)break;
  if(!learnedPassives.includes(id)||unequipped.has(id))continue;
  const t=CULT.tech(id);
  if(!M.isTechCompatible(n,t))continue;
  const fam=M.passiveFamilyOf(t);
  if(usedFamilies.has(fam))continue;
  usedFamilies.set(fam,id);
  next.push(id);
 }

 // 2. Evaluate all compatible learned passives (sorted by tier DESC, power DESC) for auto-upgrade of same family (if not pinned) or filling open slots
 const compatible=learnedPassives.filter(id=>!unequipped.has(id)&&M.isTechCompatible(n,CULT.tech(id))).slice().sort((a,b)=>{
  const ta=CULT.tech(a),tb=CULT.tech(b);
  return (tb.tier-ta.tier)||((tb.power||0)-(ta.power||0));
 });

 for(const id of compatible){
  if(next.includes(id))continue;
  const t=CULT.tech(id),fam=M.passiveFamilyOf(t);
  if(usedFamilies.has(fam)){
   const prevId=usedFamilies.get(fam),prevT=CULT.tech(prevId);
   if(!pinned.has(prevId)&&prevT&&((t.tier>prevT.tier)||(t.tier===prevT.tier&&(t.power||0)>(prevT.power||0)))){
    const idx=next.indexOf(prevId);
    if(idx>=0){next[idx]=id;usedFamilies.set(fam,id);}
   }
   continue;
  }
  if(next.length<maxSlots){
   usedFamilies.set(fam,id);
   next.push(id);
  }
 }

 if(Array.isArray(n.passiveLoadout)||next.length>0){
  n.passiveLoadout=next;
 }
 const pArr2=Array.isArray(n.passiveLoadout)?n.passiveLoadout:null;
 n._passRec={path:c.path,sub:c.sub,stage:effSt,tl,tLast,tFirst,pLen:pArr2?pArr2.length:-1,p0:pArr2&&pArr2.length?pArr2[0]:'',ver:n._passVer||0,out:next};
 return next;
};

M.activePassives=n=>M.reconcilePassives(n);

M.inactivePassives=n=>{
 if(!n||!n.cult||!Array.isArray(n.cult.techs))return [];
 const grantedPassives=(M.grantedEquipmentTechs?M.grantedEquipmentTechs(n):[]).filter(id=>{const t=CULT.tech(id);return !!(t&&(t.cat==='PASSIVE'||t.passive));});
 const active=M.activePassives(n).concat(grantedPassives.filter(id=>!M.activePassives(n).includes(id)));
 const activeFamilies=new Set(active.map(id=>M.passiveFamilyOf(CULT.tech(id))));
 const maxSlots=M.maxPassiveSlots(n);
 const unequipped=new Set(Array.isArray(n.passiveUnequipped)?n.passiveUnequipped:[]);
 const out=[];
 for(const id of n.cult.techs){
  const t=CULT.tech(id);
  if(!t||M.isInnateTech(t)||!(t.cat==='PASSIVE'||t.passive))continue;
  if(!M.isTechCompatible(n,t)){
   out.push({id,tech:t,reason:'หยุดทำงาน (วิถี/สาย/ขั้นไม่ตรง)'});
  }else if(active.includes(id)){
   if(!M.conditionMatches(n,t)){
    out.push({id,tech:t,reason:'หยุดทำงาน (อุปกรณ์ไม่ตรง)'});
   }
  }else if(unequipped.has(id)){
   out.push({id,tech:t,reason:'ถอดออกจากช่องวิชาติดตัว'});
  }else if(activeFamilies.has(M.passiveFamilyOf(t))){
   out.push({id,tech:t,reason:'ทับซ้อนตระกูลวิชาติดตัวเดียวกัน ('+M.passiveFamilyOf(t)+')'});
  }else if(active.length>=maxSlots){
   out.push({id,tech:t,reason:'เกินจำนวนช่องวิชาติดตัวสูงสุด ('+maxSlots+' ช่อง)'});
  }else{
   out.push({id,tech:t,reason:'ไม่ได้ติดตั้งในช่องวิชาติดตัว'});
  }
 }
 return out;
};

M.syncResourceCaps=(n,oldHp,oldQi)=>{
 if(!n||!n.h||!n.h.state)return;
 M.invalidateMartialCaches(n);
 const newHpMax=CULT.hpMax(n),newQiMax=CULT.qiMax(n);
 const curHp=oldHp!=null?oldHp:n.h.state.hp;
 n.h.state.hp=clamp(Math.min(curHp,newHpMax),1,newHpMax);
 if(n.cult){
  const curQi=oldQi!=null?oldQi:(n.h.state.qi==null?newQiMax:n.h.state.qi);
  n.h.state.qi=clamp(Math.min(curQi,newQiMax),0,newQiMax);
 }
};

M.equipPassive=(W,n,id,slotIdx)=>{
 const t=CULT.tech(id);
 if(M.isInnateTech(t))return {ok:false,reason:'วิชาเฉพาะสายย่อยติดตัวทำงานอัตโนมัติตามสายย่อย ไม่ใช้ช่องวิชาติดตัว'};
 if(!n||!n.cult||!Array.isArray(n.cult.techs)||!n.cult.techs.includes(id))return {ok:false,reason:'ยังไม่ได้เรียนวิชานี้'};
 if(!t||!(t.cat==='PASSIVE'||t.passive))return {ok:false,reason:'ไม่ใช่เคล็ดวิชาติดตัว'};
 if(!M.isTechCompatible(n,t))return {ok:false,reason:'วิถี สายย่อย หรือขั้นบำเพ็ญไม่ตรงกับวิชานี้'};
 const oldHp=n.h&&n.h.state?n.h.state.hp:null;
 const oldQi=n.h&&n.h.state?n.h.state.qi:null;
 const maxSlots=M.maxPassiveSlots(n);
 const active=M.reconcilePassives(n).slice();
 n.passiveUnequipped=(n.passiveUnequipped||[]).filter(x=>x!==id);
 n.passivePinned=Array.from(new Set((n.passivePinned||[]).concat(id)));
 if(!active.includes(id)){
  const fam=M.passiveFamilyOf(t);
  const famIdx=active.findIndex(x=>M.passiveFamilyOf(CULT.tech(x))===fam);
  if(famIdx>=0){
   const replaced=active[famIdx];
   n.passivePinned=(n.passivePinned||[]).filter(x=>x!==replaced);
   active[famIdx]=id;
  }else if(Number.isInteger(slotIdx)&&slotIdx>=0&&slotIdx<maxSlots&&slotIdx<active.length){
   const replaced=active[slotIdx];
   n.passiveUnequipped=Array.from(new Set((n.passiveUnequipped||[]).concat(replaced)));
   n.passivePinned=(n.passivePinned||[]).filter(x=>x!==replaced);
   active[slotIdx]=id;
  }else if(active.length<maxSlots){
   active.push(id);
  }else{
   return {ok:false,reason:'ช่องวิชาติดตัวเต็มแล้ว ('+maxSlots+' ช่อง)'};
  }
 }
 n.passiveLoadout=active;
 M.syncResourceCaps(n,oldHp,oldQi);
 return {ok:true,loadout:n.passiveLoadout.slice(),maxSlots};
};

M.unequipPassive=(W,n,id)=>{
 if(!n||!n.cult)return {ok:false,reason:'ไม่มีข้อมูลผู้บำเพ็ญ'};
 if(M.isInnateTech(id))return {ok:false,reason:'วิชาเฉพาะสายย่อยติดตัวไม่สามารถถอดออกด้วยตนเอง'};
 const oldHp=n.h&&n.h.state?n.h.state.hp:null;
 const oldQi=n.h&&n.h.state?n.h.state.qi:null;
 const active=M.reconcilePassives(n).slice();
 if(!active.includes(id))return {ok:false,reason:'วิชานี้ไม่ได้อยู่ในช่องที่ใช้งาน'};
 n.passiveUnequipped=Array.from(new Set((n.passiveUnequipped||[]).concat(id)));
 n.passivePinned=(n.passivePinned||[]).filter(x=>x!==id);
 n.passiveLoadout=active.filter(x=>x!==id);
 M.syncResourceCaps(n,oldHp,oldQi);
 return {ok:true,loadout:n.passiveLoadout.slice()};
};

M.gearType=it=>it?(it.gearType||D.classify(it.slot,it.nameTh)):null;
M.weaponConditionMatches=(n,t)=>{
 if(!t)return false;
 if(t.weaponTypes&&t.weaponTypes.length){const type=(M.equippedType?M.equippedType(n):M.gearType(n&&n.equip&&n.equip.WEAPON)||'FIST');if(!t.weaponTypes.includes(type))return false;}
 if(t.armorTypes&&t.armorTypes.length&&!t.legendary&&(!M.gearUsable(n,n.equip&&n.equip.ARMOR)||!t.armorTypes.includes(M.gearType(n.equip&&n.equip.ARMOR))))return false;
 return true;
};
M.conditionMatches=(n,t)=>{
 if(!t)return false;
 if(t.legendary)return true;
 return M.weaponConditionMatches(n,t);
};
M.skillEfficiency=(n,p)=>{
 const t=CULT.tech(p.tech||p.id)||p;
 let equipmentMult=1;
 if(t.weaponTypes||t.armorTypes){
  if(M.weaponConditionMatches(n,t))equipmentMult=1.15;
  else if(t.legendary)equipmentMult=1.0;
  else if(t.requiresWeapon||p.requiresWeapon)return 0;
  else equipmentMult=0.65;
 }
 if(!n||!n.cult)return equipmentMult;
 const c=n.cult;
 const pathExact=t.path==='ANY'||t.path===c.path||(Array.isArray(t.compatiblePaths)&&t.compatiblePaths.includes(c.path));
 const subExact=!t.sub||t.sub===c.sub||(Array.isArray(t.preferredSubs)&&t.preferredSubs.includes(c.sub));
 const pathCombat=t.legendary?(pathExact&&t.path!=='ANY'?1.10:1.0):(pathExact?1.0:0.88);
 const subCombat=t.legendary?(subExact&&t.sub?1.08:1.0):(subExact?(t.sub?1.08:1.0):0.94);
 return equipmentMult*+(pathCombat*subCombat).toFixed(3);
};
M.elementalEfficiency=(n,p,target)=>{
 if(!n||!g.ELEM||!p)return {damageMult:1,costMult:1,accBonus:0,controlChanceMult:1,counterRelation:'NEUTRAL'};
 const t=CULT.tech(p.tech||p.id)||p;
 if(target)return g.ELEM.resolveCombatInteraction(n,target,t);
 const c=g.ELEM.resolveCompatibility(n,t,'combat');
 return {attackerCompat:c,targetCounterMult:1,counterRelation:'NEUTRAL',totalDamageMult:c.damageMult,damageMult:c.damageMult,costMult:c.costMult,accBonus:c.accBonus,controlChanceMult:c.controlChanceMult};
};

/* ---------- Technique / Subpath / Equipment Synergy Authority ---------- */
M.activeSynergies=M.evaluateSynergies=n=>{
 if(!n||!n.cult||!n.cult.sub||n.cult.sub==='NONE'){const e=[];e.active=e;return e;}
 const c=n.cult,eq=n.equip||{};
 const sc=n._synCache;
 if(sc&&sc.sub===c.sub&&sc.eqW===eq.WEAPON&&sc.eqA===eq.ARMOR&&sc.ver===(n._passVer||0)){
  return sc.out;
 }
 const wType=M.equippedType?M.equippedType(n):(M.gearType(eq.WEAPON)||'FIST');
 const aType=(M.gearUsable&&M.gearUsable(n,eq.ARMOR))?M.gearType(eq.ARMOR):null;
 const out=[];
 for(const syn of M.SYNERGIES){
  if(syn.subpath&&syn.subpath!==c.sub)continue;
  if(syn.weaponTypes&&!syn.weaponTypes.includes(wType))continue;
  if(syn.armorTypes&&(!aType||!syn.armorTypes.includes(aType)))continue;
  out.push(syn);
 }
 out.active=out;
 n._synCache={sub:c.sub,eqW:eq.WEAPON,eqA:eq.ARMOR,ver:n._passVer||0,out};
 return out;
};

const EMPTY_SKILL_SYN=Object.freeze({matched:false,synergies:[],dmgMult:1,shieldMult:1,healMult:1,dotMult:1,qiCostMult:1,penAdd:0,critAdd:0,critDmgAdd:0,windDelta:0,masteryMult:1,qiRestorePct:0,cleanseHeartDemon:0,extraSupportDur:0});
M.skillSynergy=(n,p)=>{
 if(!n||n.foe||!n.cult||!p)return EMPTY_SKILL_SYN;
 const syns=M.evaluateSynergies(n);
 if(!syns.length)return EMPTY_SKILL_SYN;
 const arch=p.arch||'strike';
 const matchedSyns=syns.filter(s=>!s.archs||s.archs.includes(arch));
 if(!matchedSyns.length)return EMPTY_SKILL_SYN;
 let dmgMult=1,shieldMult=1,healMult=1,dotMult=1,qiCostMult=1,penAdd=0,critAdd=0,critDmgAdd=0,windDelta=0,masteryMult=1,qiRestorePct=0,cleanseHeartDemon=0,extraSupportDur=0;
 for(const s of matchedSyns){
  const b=s.bonus||{};
  if(b.dmgMult)dmgMult*=b.dmgMult;
  if(b.shieldMult)shieldMult*=b.shieldMult;
  if(b.healMult)healMult*=b.healMult;
  if(b.dotMult)dotMult*=b.dotMult;
  if(b.qiCostMult)qiCostMult*=b.qiCostMult;
  if(b.penAdd)penAdd+=b.penAdd;
  if(b.critAdd)critAdd+=b.critAdd;
  if(b.critDmgAdd)critDmgAdd+=b.critDmgAdd;
  if(b.windDelta)windDelta+=b.windDelta;
  if(b.masteryMult)masteryMult*=b.masteryMult;
  if(b.qiRestorePct)qiRestorePct+=b.qiRestorePct;
  if(b.cleanseHeartDemon)cleanseHeartDemon+=b.cleanseHeartDemon;
  if(b.extraSupportDur)extraSupportDur+=b.extraSupportDur;
 }
 return {
  matched:true,
  synergies:matchedSyns,
  dmgMult:clamp(dmgMult,1,1.35),
  shieldMult:clamp(shieldMult,1,1.40),
  healMult:clamp(healMult,1,1.40),
  dotMult:clamp(dotMult,1,1.40),
  qiCostMult:clamp(qiCostMult,0.70,1.20),
  penAdd:clamp(penAdd,0,25),
  critAdd:clamp(critAdd,0,20),
  critDmgAdd:clamp(critDmgAdd,0,35),
  windDelta:clamp(windDelta,-2,2),
  masteryMult:clamp(masteryMult,1,1.50),
  qiRestorePct:clamp(qiRestorePct,0,0.08),
  cleanseHeartDemon:clamp(cleanseHeartDemon,0,10),
  extraSupportDur:clamp(extraSupportDur,0,8)
 };
};

/* ---------- 3-Piece Equipment Resonance Set Authority (v2.0.5 Pillar A) ---------- */
const GS_CACHE=new WeakMap();
const EMPTY_RESONANCE_SET=Object.freeze({active:false,pieces:0,setId:null,nameTh:'',set:null,matchedSlots:[],avgTier:0,tierScale:1,p:{},f:{},rider:null,isSubpathMatch:false,summaryTh:'ไม่มีชุดสัจธรรมที่ทำงาน'});

M.itemMatchesResonanceSet=(n,it,rs)=>{
 if(!it||!rs||!rs.slots)return false;
 const slot=it.slot;
 if(!['WEAPON','ARMOR','ACCESSORY'].includes(slot))return false;
 if((it.tier||1)<(rs.minTier||3))return false;
 if(it.resonanceSetId===rs.id||(Array.isArray(it.resonanceSetIds)&&it.resonanceSetIds.includes(rs.id)))return true;
 if(it.legendary)return true;
 const gType=M.gearType(it);
 const allowedTypes=rs.slots[slot];
 if(!allowedTypes||!allowedTypes.includes(gType))return false;
 const elKey=it.elementalRole==='EXPLICIT_NON_ELEMENTAL'?'EXPLICIT_NON_ELEMENTAL':(it.element||'NEUTRAL');
 if(Array.isArray(rs.elementFamily)&&(rs.elementFamily.includes(elKey)||(elKey==='NEUTRAL'&&rs.elementFamily.includes('EXPLICIT_NON_ELEMENTAL'))))return true;
 if(n&&n.cult&&Array.isArray(rs.subpaths)&&rs.subpaths.includes(n.cult.sub))return true;
 return false;
};

M.evaluateResonanceSet=(n,overrideEquip)=>{
 if(!n||n.foe||!n.cult||!Array.isArray(M.RESONANCE_SETS)||!M.RESONANCE_SETS.length)return EMPTY_RESONANCE_SET;
 const c=n.cult,eq=overrideEquip||(n.equip||{});
 if(!overrideEquip){
  const rc=n._resSetCache;
  if(rc&&rc.path===c.path&&rc.sub===c.sub&&rc.eqW===eq.WEAPON&&rc.eqA===eq.ARMOR&&rc.eqX===eq.ACCESSORY&&rc.ver===(n._passVer||0)){
   return rc.out;
  }
 }
 const slots=['WEAPON','ARMOR','ACCESSORY'];
 const usable={};
 for(const sl of slots){
  const it=eq[sl];
  if(it&&(!M.gearUsable||M.gearUsable(n,it))&&(it.tier||1)>=3)usable[sl]=it;
 }
 const usableCount=Object.keys(usable).length;
 if(usableCount<2){
  if(!overrideEquip)n._resSetCache={path:c.path,sub:c.sub,eqW:eq.WEAPON,eqA:eq.ARMOR,eqX:eq.ACCESSORY,ver:n._passVer||0,out:EMPTY_RESONANCE_SET};
  return EMPTY_RESONANCE_SET;
 }
 let bestSet=null,bestSlots=[],bestScore=-1;
 for(const rs of M.RESONANCE_SETS){
  const matched=[];
  for(const sl of slots){
   if(usable[sl]&&M.itemMatchesResonanceSet(n,usable[sl],rs))matched.push(sl);
  }
  if(matched.length<2)continue;
  const explicitPieces=matched.reduce((count,sl)=>count+(usable[sl].resonanceSetId===rs.id?1:0),0);
  const subMatch=Array.isArray(rs.subpaths)&&rs.subpaths.includes(c.sub);
  const pathMatch=rs.path==='ANY'||rs.path===c.path;
  const score=matched.length*100+explicitPieces*60+(subMatch?35:0)+(pathMatch?12:0);
  if(score>bestScore){
   bestScore=score;
   bestSet=rs;
   bestSlots=matched;
  }
 }
 if(!bestSet||bestSlots.length<2){
  if(!overrideEquip)n._resSetCache={path:c.path,sub:c.sub,eqW:eq.WEAPON,eqA:eq.ARMOR,eqX:eq.ACCESSORY,ver:n._passVer||0,out:EMPTY_RESONANCE_SET};
  return EMPTY_RESONANCE_SET;
 }
 const pieces=bestSlots.length;
 const sumTier=bestSlots.reduce((s,sl)=>s+(usable[sl].tier||3),0);
 const avgTier=Math.round((sumTier/pieces)*10)/10;
 const tierScale=Math.round((1+Math.max(0,avgTier-3)*0.12)*100)/100;
 const subMatch=Array.isArray(bestSet.subpaths)&&bestSet.subpaths.includes(c.sub);
 const subScale=subMatch?1.10:1.0;
 const totalScale=tierScale*subScale;
 const rawBonus=pieces>=3?bestSet.bonus3:bestSet.bonus2;
 const p={},f={};
 for(const k in (rawBonus.p||{}))p[k]=Math.round(rawBonus.p[k]*totalScale*1000)/1000;
 for(const k in (rawBonus.f||{}))f[k]=Math.round(rawBonus.f[k]*totalScale*10)/10;
 const rider=pieces>=3&&bestSet.bonus3.rider?Object.assign({},bestSet.bonus3.rider,{setId:bestSet.id,setNameTh:bestSet.nameTh}):null;
 const out={
  active:true,
  pieces,
  setId:bestSet.id,
  nameTh:bestSet.nameTh,
  set:bestSet,
  matchedSlots:bestSlots,
  avgTier,
  tierScale:Math.round(totalScale*100)/100,
  p,
  f,
  rider,
  isSubpathMatch:subMatch,
  summaryTh:bestSet.nameTh+' ('+pieces+'/3 ชิ้น · T'+Math.round(avgTier)+') — '+(rawBonus.descTh||'')
 };
 if(!overrideEquip)n._resSetCache={path:c.path,sub:c.sub,eqW:eq.WEAPON,eqA:eq.ARMOR,eqX:eq.ACCESSORY,ver:n._passVer||0,out};
 return out;
};

M.resonanceUpgradePreview=(n,it)=>{
 if(!n||!n.cult||!it||!['WEAPON','ARMOR','ACCESSORY'].includes(it.slot)||(it.tier||1)<3)return {completes:false,curPieces:0,nextPieces:0,setId:null,nameTh:''};
 const curRes=M.evaluateResonanceSet(n);
 const nextEq=Object.assign({},n.equip||{},{[it.slot]:it});
 const nextRes=M.evaluateResonanceSet(n,nextEq);
 if(nextRes.active&&nextRes.pieces>(curRes.active&&curRes.setId===nextRes.setId?curRes.pieces:0)){
  return {completes:true,curPieces:curRes.active?curRes.pieces:0,nextPieces:nextRes.pieces,setId:nextRes.setId,nameTh:nextRes.nameTh,isSubpathMatch:nextRes.isSubpathMatch,set:nextRes.set};
 }
 // Also check if this is the 1st piece of the NPC's primary subpath resonance set
 const primarySet=M.RESONANCE_SETS.find(rs=>Array.isArray(rs.subpaths)&&rs.subpaths.includes(n.cult.sub)&&M.itemMatchesResonanceSet(n,it,rs));
 if(primarySet){
  return {completes:false,curPieces:curRes.active?curRes.pieces:0,nextPieces:1,setId:primarySet.id,nameTh:primarySet.nameTh,isSubpathMatch:true,set:primarySet};
 }
 return {completes:false,curPieces:curRes.active?curRes.pieces:0,nextPieces:0,setId:null,nameTh:''};
};

/* ---------- Universal Legendary Relic Set Resonance (2/3 & 3/3 Primordial Trinity - v2.0.17) ---------- */
const EMPTY_LEG_RESONANCE=Object.freeze({active:false,pieces:0,count:0,nameTh:'',tierLabelTh:'',matchedSlots:[],relicIds:[],attunedStarsTotal:0,p:{},pct:{},f:{},flat:{},qiCostMult:1,procChanceMult:1,trinitySurge:false,summaryTh:'ยังไม่ได้ประสานเซ็ตศาสตราเทพในตำนาน (ต้องการ 2–3 ชิ้น)'});
M.evaluateLegendaryRelicResonance=(n,overrideEquip)=>{
 if(!n||n.foe||!n.cult)return EMPTY_LEG_RESONANCE;
 const eq=overrideEquip||(n.equip||{});
 const wStars=(eq.WEAPON&&eq.WEAPON.attunedStars)||0,aStars=(eq.ARMOR&&eq.ARMOR.attunedStars)||0,xStars=(eq.ACCESSORY&&eq.ACCESSORY.attunedStars)||0;
 if(!overrideEquip){
  const lrc=n._legResCache;
  if(lrc&&lrc.eqW===eq.WEAPON&&lrc.eqA===eq.ARMOR&&lrc.eqX===eq.ACCESSORY&&lrc.st===n.cult.stage&&lrc.ws===wStars&&lrc.as===aStars&&lrc.xs===xStars&&lrc.ver===(n._passVer||0)){
   return lrc.out;
  }
 }
 const slots=['WEAPON','ARMOR','ACCESSORY'];
 const matchedSlots=[],relicIds=[];
 let stars=0;
 for(const sl of slots){
  const it=eq[sl];
  if(it&&it.legendary&&(!M.gearUsable||M.gearUsable(n,it))){
   matchedSlots.push(sl);
   relicIds.push(it.id);
   stars+=(it.attunedStars||0);
  }
 }
 const pieces=matchedSlots.length;
 if(pieces<2){
  if(!overrideEquip)n._legResCache={eqW:eq.WEAPON,eqA:eq.ARMOR,eqX:eq.ACCESSORY,st:n.cult.stage,ws:wStars,as:aStars,xs:xStars,ver:n._passVer||0,out:EMPTY_LEG_RESONANCE};
  return EMPTY_LEG_RESONANCE;
 }
 const starScale=1+stars*0.03;
 const isTrinity=pieces>=3;
 const nameTh=isTrinity?'ไตรรัตนะเทวศาสตราบรรพกาล':'ทวิศาสตราเทวะประสาน';
 const baseP=isTrinity?{atk:0.16,matk:0.16,def:0.16,mdef:0.16,hp:0.16}:{atk:0.08,matk:0.08,def:0.08,mdef:0.08,hp:0.08};
 const baseF=isTrinity?{pen:14,crit:10,critDmg:18,cast:12,move:8,acc:14}:{pen:6,crit:5,cast:6,acc:8};
 const p={},f={};
 for(const k in baseP)p[k]=+(baseP[k]*starScale).toFixed(3);
 for(const k in baseF)f[k]=+(baseF[k]*starScale).toFixed(1);
 const qiCostMult=isTrinity?0.80:0.88;
 const procChanceMult=isTrinity?1.25:1.15;
 const out={
  active:true,
  pieces,
  count:pieces,
  nameTh,
  tierLabelTh:nameTh+' ('+pieces+'/3 ชิ้น)',
  matchedSlots,
  relicIds,
  attunedStarsTotal:stars,
  p,
  pct:p,
  f,
  flat:f,
  qiCostMult,
  procChanceMult,
  trinitySurge:isTrinity,
  summaryTh:nameTh+' ('+pieces+'/3 ชิ้น'+(stars>0?' · ★'+stars:'')+') — '+(isTrinity?'สเตตัสหลัก +16%, ปราณทักษะ -20%, โอกาสเอฟเฟกต์ตำนาน +25% และปลดล็อกคลื่นปราณไตรรัตนะ':'สเตตัสหลัก +8%, ปราณทักษะ -12%, โอกาสเอฟเฟกต์ตำนาน +15%')
 };
 if(!overrideEquip)n._legResCache={eqW:eq.WEAPON,eqA:eq.ARMOR,eqX:eq.ACCESSORY,st:n.cult.stage,ws:wStars,as:aStars,xs:xStars,ver:n._passVer||0,out};
 return out;
};

/* ---------- Target-Conditional Combat Passive Authority ---------- */
const EMPTY_TARGET_BONUS=Object.freeze({critAdd:0,critDmgAdd:0,penAdd:0,dmgMult:1});
M.combatTargetBonus=(attacker,target)=>{
 if(!attacker||attacker.foe||!attacker.cult||!target)return EMPTY_TARGET_BONUS;
 const active=M.activePassives(attacker);
 if(!active.length)return EMPTY_TARGET_BONUS;
 const targetDebuffed=!!(target.sx&&target.sx.some(x=>x.until>(ST?ST.now:0)&&['burn','bleed','poison','slow','stun','silence','weaken','blind','armorbreak','mdefbreak','exposed'].includes(x.k)));
 const tHpMax=target.foe?(target.hpMax||1):(CULT.hpMax(target)||1);
 const tHp=target.foe?(target.hp||0):(target.h&&target.h.state?target.h.state.hp:tHpMax);
 const tHpPct=(tHp/Math.max(1,tHpMax))*100;
 let critAdd=0,critDmgAdd=0,penAdd=0,dmgMult=1;
 for(const id of active){
  const t=CULT.tech(id);
  if(!t||!t.passive||!t.passive.cond||!M.isTechCompatible(attacker,t)||!M.conditionMatches(attacker,t))continue;
  const cnd=t.passive.cond;
  let ok=false;
  if(cnd.requiresDebuffOnTarget&&targetDebuffed)ok=true;
  if(cnd.targetHpBelowPct!=null&&tHpPct<=cnd.targetHpBelowPct)ok=true;
  if(cnd.targetHpAbovePct!=null&&tHpPct>=cnd.targetHpAbovePct)ok=true;
  if(ok){
   if(cnd.pp){
    if(cnd.pp.crit)critAdd+=cnd.pp.crit;
    if(cnd.pp.critDmg)critDmgAdd+=cnd.pp.critDmg;
    if(cnd.pp.pen)penAdd+=cnd.pp.pen;
   }
   if(cnd.p&&cnd.p.atk)dmgMult+=cnd.p.atk;
   if(cnd.requiresDebuffOnTarget&&dmgMult===1)dmgMult+=0.08;
  }
 }
 if(!critAdd&&!critDmgAdd&&!penAdd&&dmgMult===1)return EMPTY_TARGET_BONUS;
 return {critAdd,critDmgAdd,penAdd,dmgMult};
};

const EMPTY_PASSIVE_STATS=Object.freeze({p:{},f:{},pp:{},qiMaxFlat:0,qiMaxPct:0,qiCostMult:1,cultRatePct:0,life:{},procs:[],activeIds:[]});
M.passiveStats=n=>{
 if(!n||!n.cult)return EMPTY_PASSIVE_STATS;
 const c=n.cult,eq=n.equip||{},effSt=CULT.effectiveTechStage?CULT.effectiveTechStage(n):c.stage,tl=c.techs.length,tLast=tl?c.techs[tl-1]:'',tFirst=tl?c.techs[0]:'';
 const hpBand=(n._hpf==null||n._hpf>0.8)?2:(n._hpf<=0.4?0:(n._hpf<=0.45?1:(n._hpf<=0.5?3:4)));
 const pc=n._passStatsCache;
 if(pc&&pc.path===c.path&&pc.sub===c.sub&&pc.stage===effSt&&pc.mantra===c.mantra&&pc.tl===tl&&pc.tLast===tLast&&pc.tFirst===tFirst&&pc.eqW===eq.WEAPON&&pc.eqA===eq.ARMOR&&pc.hpBand===hpBand&&pc.ver===(n._passVer||0)){
  return pc.out;
 }
 const active=M.activePassives(n);
 const p0=active.length?active[0]:'',p1=active.length>1?active[1]:'',p2=active.length>2?active[2]:'',p3=active.length>3?active[3]:'';
 const p={},f={},pp={},life={},procs=[],activeIds=[];
 let qiMaxFlat=0,qiMaxPct=0,qiCostMult=1,cultRatePct=0;
 const seenFamilies=new Set();
 const hpPct=(n._hpf!=null?n._hpf:1)*100;
 for(const id of active){
  const t=CULT.tech(id);
  if(!t||!t.passive||!M.isTechCompatible(n,t)||!M.conditionMatches(n,t))continue;
  const fam=M.passiveFamilyOf(t);
  if(seenFamilies.has(fam))continue;
  seenFamilies.add(fam);
  activeIds.push(id);
  const ps=t.passive;
  const legMatchMult=(t.legendary&&t.weaponTypes&&t.weaponTypes.length&&M.weaponConditionMatches(n,t))?1.15:1.0;
  for(const k in ps.p)p[k]=(p[k]||0)+ps.p[k]*legMatchMult;
  for(const k in ps.f)f[k]=(f[k]||0)+ps.f[k]*legMatchMult;
  for(const k in ps.pp)pp[k]=(pp[k]||0)+ps.pp[k]*legMatchMult;
  for(const k in ps.life)life[k]=(life[k]||0)+ps.life[k];
  if(ps.qiMaxFlat)qiMaxFlat+=ps.qiMaxFlat;
  if(ps.qiMaxPct)qiMaxPct+=ps.qiMaxPct;
  if(ps.qiCostMult)qiCostMult*=ps.qiCostMult;
  if(ps.cultRatePct)cultRatePct+=ps.cultRatePct;
  if(ps.cond){
   const cnd=ps.cond;
   const hpLowOk=cnd.hpBelowPct!=null&&hpPct<=cnd.hpBelowPct;
   const hpHighOk=cnd.hpAbovePct!=null&&hpPct>=cnd.hpAbovePct;
   if(hpLowOk||hpHighOk){
    for(const k in cnd.p)p[k]=(p[k]||0)+cnd.p[k];
    for(const k in cnd.f)f[k]=(f[k]||0)+cnd.f[k];
    for(const k in cnd.pp)pp[k]=(pp[k]||0)+cnd.pp[k];
   }
  }
  if(ps.proc)procs.push(Object.assign({techId:t.id,nameTh:t.nameTh},ps.proc));
 }
 // Also include unlocked stage passiveBonuses on active learned techniques/mantras
 if(g.SK&&g.SK.unlockedStage){
  const checkIds=(M.activeTechs?M.activeTechs(n):n.cult.techs).concat(n.cult.mantra?[n.cult.mantra]:[]);
  for(const id of checkIds){
   const t=CULT.tech(id);
   if(!t||M.isInnateTech(t)||!Array.isArray(t.stages)||!M.conditionMatches(n,t))continue;
   const uStage=g.SK.unlockedStage(n,t);
   for(const st of t.stages){
    if(st.stage<=uStage&&st.passiveBonus){
     for(const k in st.passiveBonus.p)p[k]=(p[k]||0)+st.passiveBonus.p[k];
     for(const k in st.passiveBonus.f)f[k]=(f[k]||0)+st.passiveBonus.f[k];
     for(const k in st.passiveBonus.pp)pp[k]=(pp[k]||0)+st.passiveBonus.pp[k];
    }
   }
  }
 }
 qiCostMult=clamp(qiCostMult,.45,1.5);
 const out={p,f,pp,qiMaxFlat,qiMaxPct,qiCostMult,cultRatePct,life,procs,activeIds};
 n._passStatsCache={path:c.path,sub:c.sub,stage:effSt,mantra:c.mantra,tl,tLast,tFirst,al:active.length,p0,p1,p2,p3,eqW:eq.WEAPON,eqA:eq.ARMOR,hpBand,ver:n._passVer||0,out};
 return out;
};

M.lifeMult=(n,skill)=>{
 if(!n||!n.cult)return 1;
 const c=n.cult,lmc=n._lifeMultCache;
 if(lmc&&lmc.cult===c&&lmc.path===c.path&&lmc.sub===c.sub&&lmc.st===c.stage&&lmc.mantra===c.mantra&&lmc.ver===(n._passVer||0)){
  const hit=lmc.map[skill];
  if(hit!==undefined)return hit;
 }
 const base=M.progression(n).life[skill]||1;
 const pass=M.passiveStats(n);
 const passAdd=(pass.life&&pass.life[skill])||0;
 const inn=M.innateStats(n);
 const innAdd=(inn.life&&inn.life[skill])||0;
 const m=c.mantra?CULT.tech(c.mantra):null;
 const manAdd=(m&&m.mantraBonus&&m.mantraBonus.life&&m.mantraBonus.life[skill])||0;
 const val=base+passAdd+innAdd+manAdd;
 if(!lmc||lmc.cult!==c||lmc.path!==c.path||lmc.sub!==c.sub||lmc.st!==c.stage||lmc.mantra!==c.mantra||lmc.ver!==(n._passVer||0)){
  n._lifeMultCache={cult:c,path:c.path,sub:c.sub,st:c.stage,mantra:c.mantra,ver:n._passVer||0,map:{[skill]:val}};
 }else{
  lmc.map[skill]=val;
 }
 return val;
};

M.subStats=(n,fx,stage)=>{if(!n.cult||!CULT.PATHS[n.cult.path].subPaths.some(s=>s.id===n.cult.sub))return {p:{},f:{}};const scale=M.progression(n,stage).scale;return {p:Object.fromEntries(Object.entries(fx.p||{}).map(([k,v])=>[k,v*scale])),f:Object.fromEntries(Object.entries(fx.f||{}).map(([k,v])=>[k,v*scale]))};};
M.SUB_EQUIP_BONUSES={
 SWORD_IMMORTAL:{w:['SWORD'],a:['LIGHT','ROBE'],wb:{p:{atk:0.08,matk:0.06},f:{pen:8,crit:4},reasonTh:'ถือกระบี่ตรงสายเซียนกระบี่'},ab:{p:{eva:0.06},f:{move:4},reasonTh:'สวมเกราะเบา/อาภรณ์คล่องตัว'}},
 PURE_SWORD_SAINT:{w:['SWORD','BLADE'],a:['LIGHT','ROBE'],wb:{p:{atk:0.09},f:{crit:5,pen:8},reasonTh:'ถือกระบี่/ดาบตรงสายนักพรตกระบี่บริสุทธิ์'},ab:{p:{eva:0.06},f:{},reasonTh:'สวมเกราะเบา/อาภรณ์นักกระบี่'}},
 STAR_ARCHER:{w:['BOW'],a:['LIGHT','ROBE'],wb:{p:{atk:0.08},f:{acc:12,crit:4},reasonTh:'ถือธนูตรงสายเซียนศรดารา'},ab:{p:{eva:0.06},f:{move:4},reasonTh:'สวมเกราะเบายิงศรคล่องตัว'}},
 STAFF_GUARD:{w:['STAFF','SPEAR'],a:['HEAVY'],wb:{p:{def:0.10},f:{acc:6},reasonTh:'ถือพลอง/ทวนตรงสายองครักษ์พลองเหล็ก'},ab:{p:{def:0.10,hp:0.06},f:{},reasonTh:'สวมเกราะหนักตั้งปราการ'}},
 SOUND_ZITHER:{w:['ZITHER','FOCUS'],a:['ROBE','LIGHT'],wb:{p:{matk:0.10},f:{cast:6,acc:8},reasonTh:'บรรเลงพิณคีตเวทย์ตรงสายพิณสัจธรรม'},ab:{p:{mdef:0.08},f:{eva:5},reasonTh:'สวมอาภรณ์รับคลื่นคีตเวทย์'}},
 SOUL_MUSICIAN:{w:['ZITHER','FOCUS'],a:['ROBE','LIGHT'],wb:{p:{matk:0.10},f:{acc:8,cast:6},reasonTh:'บรรเลงพิณคีตเวทย์สะกดวิญญาณ'},ab:{p:{mdef:0.09},f:{cast:4},reasonTh:'สวมอาภรณ์นักดนตรีวิญญาณ'}},
 ZITHER_HEART_BOW:{w:['ZITHER','BOW','FOCUS'],a:['ROBE','LIGHT'],wb:{p:{matk:0.09,atk:0.06},f:{acc:10,crit:4},reasonTh:'ผสานพิณคีตเวทย์และคันศร'},ab:{p:{mdef:0.08},f:{eva:6},reasonTh:'สวมอาภรณ์เบาสายพิณศร'}},
 CALLIGRAPHY_PAINTING_SAGE:{w:['BRUSH','FOCUS','SWORD'],a:['ROBE','LIGHT'],wb:{p:{matk:0.11},f:{acc:10,cast:6},reasonTh:'ถือพู่กันอาคมวาดอักขระสัจธรรม'},ab:{p:{mdef:0.08},f:{eva:5},reasonTh:'สวมอาภรณ์บัณฑิตพริ้วไหว'}},
 SEAL_SCRIPT_EXORCIST:{w:['BRUSH','FOCUS','SWORD'],a:['ROBE','LIGHT'],wb:{p:{matk:0.10},f:{acc:8,pen:6},reasonTh:'ถือพู่กันอาคมจารึกยันต์สะกดมาร'},ab:{p:{mdef:0.09},f:{cast:4},reasonTh:'สวมอาภรณ์ลงยันต์คุ้มกาย'}},
 THUNDER_TALISMAN_ADEPT:{w:['BRUSH','FOCUS','SWORD'],a:['ROBE','LIGHT'],wb:{p:{matk:0.11},f:{cast:6,crit:4},reasonTh:'ถือพู่กันอาคมเขียนยันต์อสนี'},ab:{p:{mdef:0.08},f:{eva:5},reasonTh:'สวมอาภรณ์นำกระแสสายฟ้า'}},
 GRAND_FORMATION_ARCHITECT:{w:['BRUSH','FOCUS','STAFF'],a:['ROBE','LIGHT'],wb:{p:{matk:0.09,mdef:0.07},f:{acc:10,cast:5},reasonTh:'ถือพู่กันอาคมวางผังค่ายกลใหญ่'},ab:{p:{def:0.06,mdef:0.09},f:{},reasonTh:'สวมอาภรณ์เชื่อมชีพจรค่ายกล'}},
 SPIRIT_THREAD_PUPPET:{w:['WHIP','FOCUS','BLADE'],a:['LIGHT','ROBE'],wb:{p:{atk:0.08,matk:0.08},f:{acc:9,cast:5},reasonTh:'ใช้แส้และด้ายปราณเชิดหุ่นศึก'},ab:{p:{def:0.06,mdef:0.06},f:{eva:5},reasonTh:'สวมเกราะเบาคล่องตัวเชิดหุ่น'}},
 THOUSAND_THREAD_ASSASSIN:{w:['WHIP','BLADE','FOCUS'],a:['LIGHT','ROBE'],wb:{p:{atk:0.10,matk:0.06},f:{crit:5,pen:10},reasonTh:'ใช้ด้ายปราณและมีดสังหารเงา'},ab:{p:{def:0.05},f:{eva:8,move:4},reasonTh:'สวมเกราะเบาเร้นกาย'}},
 FATE_SEVERING_THREAD:{w:['WHIP','FOCUS','SWORD'],a:['ROBE','LIGHT'],wb:{p:{matk:0.10,atk:0.06},f:{acc:10,pen:8},reasonTh:'ใช้ด้ายชะตาและแส้ปราณตัดวาสนา'},ab:{p:{mdef:0.09},f:{eva:5},reasonTh:'สวมอาภรณ์พริ้วหลบเคราะห์กรรม'}},
 CELESTIAL_ARMOR_ARTISAN:{w:['STAFF','FOCUS','BLADE','BRUSH'],a:['HEAVY','LIGHT','ROBE'],wb:{p:{def:0.09,mdef:0.08},f:{acc:6},reasonTh:'ถือค้อนพลอง/พู่กันเขียนผังเกราะ'},ab:{p:{def:0.12,mdef:0.10},f:{},reasonTh:'เข้าถึงแก่นแท้ของเกราะที่สวมใส่'}}
};
const EMPTY_SUB_EQ_BONUS=Object.freeze({active:false,matchedCount:0,weaponMatched:false,armorMatched:false,accessoryMatched:false,wType:'FIST',aType:null,xType:null,preferredWeapons:[],preferredArmor:[],p:{},f:{},reasonsTh:[],summaryTh:''});
M.evaluateSubEquipmentBonus=n=>{
 if(!n||n.foe||!n.cult||!n.cult.sub||n.cult.sub==='NONE')return EMPTY_SUB_EQ_BONUS;
 const subId=n.cult.sub,cPath=n.cult.path,eq=n.equip||{};
 const sec=n._subEqCache;
 if(sec&&sec.path===cPath&&sec.sub===subId&&sec.eqW===eq.WEAPON&&sec.eqA===eq.ARMOR&&sec.eqX===eq.ACCESSORY&&sec.st===n.cult.stage&&sec.ver===(n._passVer||0)){
  return sec.out;
 }
 const hasUsableWpn=!!(eq.WEAPON&&(!M.gearUsable||M.gearUsable(n,eq.WEAPON)));
 const wType=hasUsableWpn?M.gearType(eq.WEAPON):'FIST';
 const aType=(eq.ARMOR&&(!M.gearUsable||M.gearUsable(n,eq.ARMOR)))?M.gearType(eq.ARMOR):null;
 const xType=(eq.ACCESSORY&&(!M.gearUsable||M.gearUsable(n,eq.ACCESSORY)))?M.gearType(eq.ACCESSORY):null;
 const spec=M.SUB_EQUIP_BONUSES[subId];
 const prof=profiles[subId];
 const pathProf=paths[cPath]||paths.XIAN;
 const prefW=spec?spec.w:(prof?prof[3]:pathProf.weapons);
 const prefA=spec?spec.a:(prof?prof[4]:pathProf.armor);
 const wMatch=hasUsableWpn&&Array.isArray(prefW)&&prefW.includes(wType)||(wType==='FIST'&&!hasUsableWpn&&Array.isArray(prefW)&&prefW.includes('FIST'));
 const aMatch=!!(aType&&Array.isArray(prefA)&&prefA.includes(aType));
 const xMatch=!!(xType&&['RING','NECKLACE','BRACELET','CHARM'].includes(xType));
 const p={},f={},reasonsTh=[];
 if(wMatch){
  const wb=spec?spec.wb:{p:{atk:0.06,matk:0.06},f:{acc:6,pen:4},reasonTh:'ถือศาสตราตรงสายย่อย ('+(D.types[wType]||wType)+')'};
  for(const k in (wb.p||{}))p[k]=(p[k]||0)+wb.p[k];
  for(const k in (wb.f||{}))f[k]=(f[k]||0)+wb.f[k];
  if(wb.reasonTh)reasonsTh.push(wb.reasonTh);
 }
 if(aMatch){
  const ab=spec?spec.ab:{p:{def:0.06,mdef:0.06},f:{},reasonTh:'สวมเกราะตรงสายย่อย ('+(D.types[aType]||aType)+')'};
  for(const k in (ab.p||{}))p[k]=(p[k]||0)+ab.p[k];
  for(const k in (ab.f||{}))f[k]=(f[k]||0)+ab.f[k];
  if(ab.reasonTh)reasonsTh.push(ab.reasonTh);
 }
 if(xMatch){
  const xb=xType==='RING'?{p:{atk:0.03,matk:0.03},f:{crit:3,pen:4}}:xType==='NECKLACE'?{p:{hp:0.05,mdef:0.05},f:{}}:xType==='BRACELET'?{p:{atk:0.04,def:0.04},f:{cast:4}}:{p:{matk:0.05,mdef:0.04},f:{acc:6}};
  for(const k in (xb.p||{}))p[k]=(p[k]||0)+xb.p[k];
  for(const k in (xb.f||{}))f[k]=(f[k]||0)+xb.f[k];
  reasonsTh.push('หนุนเครื่องประดับ ('+(D.types[xType]||xType)+')');
 }
 const matchedCount=(wMatch?1:0)+(aMatch?1:0)+(xMatch?1:0);
 const out={active:wMatch||aMatch||xMatch,matchedCount,weaponMatched:wMatch,armorMatched:aMatch,accessoryMatched:xMatch,wType,aType,xType,preferredWeapons:prefW||[],preferredArmor:prefA||[],p,f,reasonsTh,summaryTh:reasonsTh.join(' · ')};
 n._subEqCache={path:cPath,sub:subId,eqW:eq.WEAPON,eqA:eq.ARMOR,eqX:eq.ACCESSORY,st:n.cult.stage,ver:n._passVer||0,out};
 return out;
};
M.conditionText=t=>{
 const a=[];
 if(t.weaponTypes)a.push(t.weaponTypes.map(x=>D.types[x]).join('/'));
 if(t.armorTypes)a.push(t.armorTypes.map(x=>D.types[x]).join('/'));
 if(t.legendary)return (a.length?a.join(' + ')+' · ':'')+'วิชาตำนานใช้ได้ทุกศาสตรา (ปราณจำแลง ×1.00 / ถือศาสตราตรงสาย ×1.15)';
 if(!a.length)return 'ใช้ได้ทุกอุปกรณ์';
 return a.join(' + ')+(t.passive?' · ถอดแล้วผลหาย':t.requiresWeapon?' · จำเป็นต้องสวมใส่อาวุธนี้':' · อาวุธที่ถนัด ×1.15 / อื่น ×0.65');
};
M.gearSuitability=(n,it,price)=>{
 const effSt=n&&n.cult?(CULT.effectiveTechStage?CULT.effectiveTechStage(n):n.cult.stage):0;
 if(!it||it.retired||(it.procedural&&it.dur!=null&&it.dur<=0&&(it.maxDur||100)<=20)||!n.cult||(it.minStage||1)>effSt+1)return {score:-Infinity,reasons:[it&&it.retired?'ศาสตราชำรุดถาวร':'ขั้นบำเพ็ญไม่ถึง']};
 const c=n.cult;
 if(it.compatiblePath){const cp=Array.isArray(it.compatiblePath)?it.compatiblePath:[it.compatiblePath];if(!cp.includes('ANY')&&!cp.includes(c.path))return {score:-Infinity,reasons:['ต่างวิถีหลัก']};}
 const lowHp=!!(n.h&&n.h.root&&n.h.state&&n.h.state.hp<CULT.hpMax(n)*.6);
 const eq=n.equip||{};
 let gsc=(n.h&&n.h.root)?GS_CACHE.get(n):null;
 if(n.h&&n.h.root){
  if(!gsc||gsc.ver!==n._ver||gsc.st!==effSt||gsc.sub!==c.sub||gsc.path!==c.path||gsc.tl!==c.techs.length||gsc.eqW!==eq.WEAPON||gsc.eqA!==eq.ARMOR||gsc.eqX!==eq.ACCESSORY||gsc.post!==n.post||gsc.lowHp!==lowHp||gsc.pLen!==(n.pets?n.pets.length:0)){
   gsc={ver:n._ver,st:effSt,sub:c.sub,path:c.path,tl:c.techs.length,eqW:eq.WEAPON,eqA:eq.ARMOR,eqX:eq.ACCESSORY,post:n.post,lowHp,pLen:n.pets?n.pets.length:0,wm:new WeakMap()};
   GS_CACHE.set(n,gsc);
  }else{
   const hit=gsc.wm.get(it);
   if(hit&&hit.q===it.q&&hit.dur===it.dur&&hit.maxDur===it.maxDur&&hit.broken===it.broken&&hit.attEl===it.attunedElement){
    const cost=Number.isFinite(price)?price:0,thrift=.08+HC.eff(n,'values.wealthResource')/350;
    return {score:hit.rawPower-cost*thrift,rawPower:hit.rawPower,reasons:hit.reasons,type:hit.type,fit:hit.fit,durK:hit.durK};
   }
  }
 }
 const path=paths[c.path]||paths.XIAN,sub=profiles[c.sub],type=M.gearType(it),weapons=sub?sub[3]:path.weapons,armor=sub?sub[4]:path.armor,reasons=[],s=it.st||ST.gearStats(Object.assign({},it));
 let fit=1;
 if(it.slot==='WEAPON'){
  const wIdx=weapons.indexOf(type);
  if(wIdx===0){fit=1.48;reasons.push('ตรงแนวสายบำเพ็ญ (อาวุธหลัก)');}
  else if(wIdx>0){fit=1.38;reasons.push('ตรงแนวสายบำเพ็ญ (อาวุธรอง)');}
  else if(path.weapons&&path.weapons.includes(type)){fit=1.06;reasons.push('พลิกแพลงใช้อาวุธสำรองตามวิถีหลัก');}
  else{fit=.72;reasons.push('อาวุธไม่ถนัด');}
  if(M.weaponSkill){const wsk=M.weaponSkill(n,type);if(wsk>=45){fit+=Math.min(.22,(wsk-40)*.0035);reasons.push('ชำนาญอาวุธ ('+Math.round(wsk)+')');}else if(wsk<20&&wIdx<0){fit-=.08;}}
 }
 if(it.slot==='ARMOR'){fit=armor.includes(type)?1.25:.85;reasons.push(armor.includes(type)?'เกราะตรงวิถี':'เกราะต่างแนว');}
 const role=c.path==='BODY'?{atk:1.35,matk:.45,def:1.2,mdef:1.1}:c.path==='HEART_SOUL'||c.path==='XIAN'?{atk:.65,matk:1.35,def:1.1,mdef:1}:c.path==='DEMON'?{atk:1.15,matk:1.15,def:.85,mdef:.9}:c.path==='MECH_PUPPET'?{atk:1.15,matk:1.15,def:1.25,mdef:1.1}:c.path==='KARMA_SAMSARA'?{atk:.95,matk:1.28,def:1.12,mdef:1.32}:c.path==='BEAST_SOVEREIGN'?{atk:1.25,matk:.95,def:1.18,mdef:1.05}:c.path==='SAGE_SUPPORT'?{atk:.85,matk:1.30,def:1.18,mdef:1.34}:c.path==='CRAFT_CREATION'?{atk:1.15,matk:1.25,def:1.22,mdef:1.22}:c.path==='ARRAY_TALISMAN'?{atk:0.90,matk:1.32,def:1.15,mdef:1.30}:c.path==='STRATEGY_GOVERNANCE'?{atk:1.12,matk:1.22,def:1.22,mdef:1.22}:{atk:1,matk:1.1,def:1,mdef:1.2};
 let power=(s.atk||0)*role.atk+(s.matk||0)*role.matk+(s.def||0)*role.def+(s.mdef||0)*role.mdef+(s.hp||0)*.5+(s.crit||0)*8+(s.critDmg||0)*1.5+(s.pen||0)*6+(s.cast||0)*3+(s.eva||0)*.6+(s.acc||0)*2;
 if(it.combatMult||it.defMult){
  const stageScale=22+c.stage*16;
  power+=(it.combatMult||0)*stageScale*(role.atk+role.matk)*.55+(it.defMult||0)*stageScale*(role.def+role.mdef)*.55;
 }
 let moves=0,reqWeap=0;
 const checkList=c.techs.concat(M.activeInnateTechs(n));
 for(const id of checkList){
  const t=CULT.tech(id);
  if(t&&((it.slot==='WEAPON'&&t.weaponTypes&&t.weaponTypes.includes(type))||(it.slot==='ARMOR'&&t.armorTypes&&t.armorTypes.includes(type)))){
   moves++;
   if(it.slot==='WEAPON'&&t.requiresWeapon)reqWeap++;
  }
 }
 if(moves){
  fit+=Math.min(.55,moves*.12);
  if(it.slot==='WEAPON'&&!weapons.includes(type)&&(!n.equip||!n.equip.WEAPON||!weapons.includes(M.gearType(n.equip.WEAPON)))){
   fit+=0.26;
   reasons.push('พลิกแพลงใช้อาวุธสำรองตามวิชาที่รู้ ('+moves+' วิชา)');
  }else{
   reasons.push('หนุนวิชาที่เรียน '+moves+' วิชา');
  }
 }
 if(reqWeap){fit+=Math.min(.30,reqWeap*.18);reasons.push('ปลดล็อกวิชาที่บังคับใช้อาวุธนี้');}
 if(it.attunedElement){
  const subDef=CULT.sub?CULT.sub(n):null;
  const subW=(subDef&&subDef.elementProfile&&subDef.elementProfile.weights)||{};
  if(subW[it.attunedElement]||(subDef&&subDef.element===it.attunedElement)){
   fit+=0.14;
   reasons.push('หลอมจูนธาตุประสานสายย่อย ('+it.attunedElement+')');
  }
 }
 if(n.pets&&n.pets.length&&CULT.activePets){
  const pet=(CULT.activePets(n)[0]||null);
  if(pet){
   const pRole=pet.role||'FEROCIOUS_ASSAULT';
   if(pRole==='IRON_GUARDIAN'&&it.slot==='WEAPON'&&['BOW','FOCUS','SPEAR'].includes(type)){
    fit+=0.10;reasons.push('ประสานสัตว์อสูรแนวหน้าคุ้มกัน');
   }else if(pRole==='FEROCIOUS_ASSAULT'&&(it.slot==='ARMOR'&&type==='HEAVY'||it.slot==='WEAPON'&&['FIST','BLADE','SPEAR','STAFF'].includes(type))){
    fit+=0.10;reasons.push('ประสานสัตว์อสูรจู่โจมประชิด');
   }else if(pRole==='VENOM_SWARM'&&it.slot==='WEAPON'&&['FOCUS','BOW','BLADE'].includes(type)){
    fit+=0.10;reasons.push('ประสานฝูงอสูรพิษ');
   }else if(pRole==='MYSTIC_SUPPORT'&&it.slot==='WEAPON'){
    fit+=0.08;reasons.push('ประสานสัตว์อสูรสายหนุน');
   }
  }
 }
 // Bonus if equipment triggers a subpath synergy
 const synMatch=M.SYNERGIES.some(syn=>syn.subpath===c.sub&&((it.slot==='WEAPON'&&syn.weaponTypes&&syn.weaponTypes.includes(type))||(it.slot==='ARMOR'&&syn.armorTypes&&syn.armorTypes.includes(type))));
 if(synMatch){fit+=0.18;reasons.push('ปลดล็อกการประสานสายย่อย');}
 // Bonus if Legendary equipment advances or completes 2/3 or 3/3 Legendary Relic Resonance
 if(it.legendary&&M.evaluateLegendaryRelicResonance){
  const curLeg=M.evaluateLegendaryRelicResonance(n);
  const nextLeg=M.evaluateLegendaryRelicResonance(n,Object.assign({},n.equip||{},{[it.slot]:it}));
  if(nextLeg.pieces>=3&&curLeg.pieces<3){fit+=0.42;reasons.push('ครบชุดไตรรัตนะเทวศาสตรา 3/3 ชิ้น');}
  else if(nextLeg.pieces===2&&curLeg.pieces<2){fit+=0.25;reasons.push('ประสานทวิศาสตราเทวะ 2/3 ชิ้น');}
 }
 // Bonus if equipment advances or completes a 2-piece or 3-piece Resonance Set
 const resPrev=M.resonanceUpgradePreview?M.resonanceUpgradePreview(n,it):null;
 if(resPrev&&resPrev.nextPieces>=3){
  fit+=resPrev.isSubpathMatch?0.44:0.34;
  reasons.push('ครบชุดสัจธรรม 3/3 ชิ้น「'+resPrev.nameTh+'」');
 }else if(resPrev&&resPrev.nextPieces===2){
  fit+=resPrev.isSubpathMatch?0.26:0.18;
  reasons.push('ประสานชุดสัจธรรม 2/3 ชิ้น「'+resPrev.nameTh+'」');
 }else if(resPrev&&resPrev.nextPieces===1&&resPrev.isSubpathMatch){
  fit+=0.11;
  reasons.push('ชิ้นส่วนชุดสัจธรรมประจำสาย「'+resPrev.nameTh+'」');
 }
 const elemCompat=g.ELEM?g.ELEM.resolveCompatibility(n,it,'equipment'):null;
 if(elemCompat&&elemCompat.mode!=='EXPLICIT_NON_ELEMENTAL'){
  fit*=elemCompat.equipmentSuitabilityMult;
  if(elemCompat.equipmentSuitabilityMult>=1.06)reasons.push('ธาตุสอดคล้องรากปราณ ('+Math.round(elemCompat.equipmentSuitabilityMult*100)+'%)');
  else if(elemCompat.equipmentSuitabilityMult<=0.92)reasons.push('ธาตุขัดแย้งรากปราณ ('+Math.round(elemCompat.equipmentSuitabilityMult*100)+'%)');
 }
 const caution=HC.eff(n,'personality.caution')/100,aggression=HC.eff(n,'personality.aggression')/100;
 power+=(s.def||0)*caution*.35+(s.hp||0)*caution*.18+(s.atk||0)*aggression*.2;
 if(["guard","commander","wildwarden"].includes(n.post)){power+=(s.def||0)*.25+(s.hp||0)*.15;}
 if(n.h.state.hp<CULT.hpMax(n)*.6){power+=(s.def||0)*.45+(s.hp||0)*.4;reasons.push('ต้องการเอาตัวรอด');}
 if(it.fx)for(const fx of it.fx){const skill=(fx.params||{}).craftBonusPath;if(skill&&M.lifeMult(n,skill)>1.05){power+=30*M.lifeMult(n,skill);reasons.push('หนุนงาน '+skill);}}
 const maxD=it.maxDur==null?100:it.maxDur,curD=it.dur==null?maxD:it.dur;
 const durK=(it.procedural&&(curD<=0||it.broken))?0.12:clamp(curD/100,.35,1)*clamp(0.75+0.25*(maxD/100),0.75,1);
 if(it.procedural&&(curD<=0||it.broken))reasons.push('ชำรุด (ต้องซ่อมก่อนใช้งาน)');
 else if(curD<maxD*.85||maxD<95)reasons.push('ทนทาน '+Math.round(curD)+'/'+Math.round(maxD));
 power*=durK;
 const rawPower=power*fit;
 if(gsc)gsc.wm.set(it,{q:it.q,dur:it.dur,maxDur:it.maxDur,broken:it.broken,attEl:it.attunedElement,rawPower,reasons,type,fit,durK});
 const cost=Number.isFinite(price)?price:0,thrift=.08+HC.eff(n,'values.wealthResource')/350;
 return {score:rawPower-cost*thrift,rawPower,reasons,type,fit,durK};
};
M.classifyGearForNpc=(W,n,it,price)=>{
 if(!it||!n||!n.cult)return {category:'surplus',deltaScore:-Infinity,suit:{score:-Infinity,reasons:['ไม่พร้อมใช้งาน']},reasonTh:'ไม่เหมาะกับผู้ไร้ตบะ'};
 if(it.retired||(it.procedural&&it.dur!=null&&it.dur<=0&&(it.maxDur||100)<=20))return {category:'retired',deltaScore:-Infinity,suit:{score:-Infinity,reasons:['ชำรุดถาวร']},reasonTh:'เพดานความทนทานหมดสิ้น ควรปลดระวาง'};
 const suit=M.gearSuitability(n,it,price);
 const cur=n.equip&&n.equip[it.slot];
 const curSuit=cur?M.gearSuitability(n,cur,0):{score:0,rawPower:0,reasons:[]};
 const curScore=Number.isFinite(curSuit.score)?curSuit.score:0;
 const newScore=suit.score;
 const effSt=CULT.effectiveTechStage?CULT.effectiveTechStage(n):n.cult.stage;
 const isBroken=!!(it.broken||(it.procedural&&it.dur!=null&&it.dur<=0));
 const usableNow=!isBroken&&(it.minStage||1)<=effSt&&Number.isFinite(newScore);
 const hysteresis=cur?Math.max(8,Math.abs(curScore)*0.16):4;
 if(usableNow&&newScore>curScore+hysteresis){
  return {category:'useful-now',deltaScore:newScore-curScore,suit,curSuit,reasonTh:cur?'ดีกว่าของเดิมชัดเจน (+'+Math.round(newScore-curScore)+')':'ยังไม่มีอุปกรณ์ในช่องนี้'};
 }
 const futureStageOk=(it.minStage||1)===effSt+1&&Number.isFinite(newScore)&&newScore>curScore*1.22+12;
 const retrainPrep=n.martialIntent&&n.martialIntent.action==='prepare'&&suit.reasons.some(r=>r.includes('เตรียมอาวุธ'));
 if(futureStageOk||retrainPrep){
  return {category:'valuable-to-own',deltaScore:newScore-curScore,suit,curSuit,reasonTh:retrainPrep?'เก็บไว้เตรียมเปลี่ยนสายย่อย':'เก็บไว้ใช้เมื่อทะลวงขั้นถัดไป'};
 }
 if(W&&Array.isArray(W.npcs)){
  const rels=n.h&&n.h.mind&&n.h.mind.relations||{};
  for(const o of W.npcs){
   if(!o||o.id===n.id||o.dead||o.away||o.exiled||!o.cult)continue;
   const r=rels[o.id];
   const isClose=o.mentor===n.id||n.mentor===o.id||o.mentorId===n.id||n.mentorId===o.id||(n.h.life.family.spouse===o.id)||(r&&(r.a>=42||(r.g||0)>=30||['สหาย','คนรัก','คู่ครอง','ศิษย์','ศิษย์สายตรง','อาจารย์','อาจารย์สายตรง'].includes(r.bond)));
   if(!isClose)continue;
   const oEffSt=CULT.effectiveTechStage?CULT.effectiveTechStage(o):o.cult.stage;
   if((it.minStage||1)>oEffSt)continue;
   const oSuit=M.gearSuitability(o,it,0);
   const oCur=o.equip&&o.equip[it.slot];
   const oCurScore=oCur?M.gearSuitability(o,oCur,0).score:0;
   if(Number.isFinite(oSuit.score)&&oSuit.score>oCurScore+Math.max(8,Math.abs(oCurScore)*0.16)){
    return {category:'gift-worthy',targetNpcId:o.id,deltaScore:oSuit.score-oCurScore,suit,curSuit,reasonTh:'เหมาะมอบให้ '+o.h.name.given+' (+'+Math.round(oSuit.score-oCurScore)+')'};
   }
  }
 }
 return {category:'surplus',deltaScore:newScore-curScore,suit,curSuit,reasonTh:cur?'ไม่ดีกว่า「'+cur.nameTh+'」ที่สวมใส่อยู่':'ไม่เหมาะกับแนวทางปัจจุบัน'};
};
M.describe=(W,n)=>{const now=M.progression(n),next=n.cult&&n.cult.stage<CULT.maxStage(n)?M.progression(n,n.cult.stage+1):now,raw=n.cult&&(ST.SUBFX[n.cult.sub]||(JD.EXPANSION.subStats||{})[n.cult.sub])||{p:{},f:{}};return {now,next,subNow:M.subStats(n,raw),subNext:n.cult?M.subStats(n,raw,n.cult.stage+1):{p:{},f:{}},desires:n.cult?((profiles[n.cult.sub]||[null,null,null,paths[n.cult.path].weapons])[3]).map(x=>D.types[x]):[],crystals:Object.entries(n.inv&&n.inv.crystals||{}).filter(x=>x[1]>0),passiveSlots:M.passiveSlotInfo(n),activePassives:M.activePassives(n),inactivePassives:M.inactivePassives(n),innateTechs:M.activeInnateTechs(n),dormantInnate:M.dormantInnateTechs(n),activeSynergies:M.evaluateSynergies(n),subEquipBonus:M.evaluateSubEquipmentBonus(n),resonanceSet:M.evaluateResonanceSet(n),legResonance:M.evaluateLegendaryRelicResonance(n)};};
/* ---------- Equipment-Granted Temporary Skills & Skill Modifiers Authority (v2.0.34) ----------
 * Guarantees:
 * 1. Skills in `item.grantedSkills` are ONLY usable while the item is actively equipped in `n.equip[slot]` and usable (`M.gearUsable(n, it)`).
 * 2. Granted skills NEVER mutate `n.cult.techs` or `n.passiveLoadout`, so unequipping, trading, donating, or saving/loading NEVER turns a granted skill into a permanent learned skill.
 * 3. Equipment `skillModifiers` dynamically modify matching moves (`arch`, `element`, `path`, or `techId`).
 */
M.grantedEquipmentTechs = n => {
 if (!n || n.foe || !n.cult || !n.equip) return [];
 const out = [];
 const effSt = CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : (n.cult.stage || 1);
 for (const slot of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
  const it = n.equip[slot];
  if (!it || (M.gearUsable && !M.gearUsable(n, it))) continue;
  const src = (it.id && ECO.itemById && ECO.itemById[it.id]) || it;
  const list = it.grantedSkills || (src && src.grantedSkills);
  if (!Array.isArray(list) || !list.length) continue;
  if ((it.minStage || src.minStage || 1) > effSt) continue;
  const reqP = it.reqPath || src.reqPath || it.compatiblePath || src.compatiblePath;
  if (reqP) {
   const cp = Array.isArray(reqP) ? reqP : [reqP];
   if (!cp.includes('ANY') && !cp.includes(n.cult.path)) continue;
  }
  for (const tid of list) {
   if (typeof tid === 'string' && CULT.tech(tid) && !out.includes(tid)) out.push(tid);
  }
 }
 return out;
};

M.hasEquipmentSkillModifiers = n => {
 if (!n || n.foe || !n.equip) return false;
 for (const slot of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
  const it = n.equip[slot];
  if (!it || (M.gearUsable && !M.gearUsable(n, it))) continue;
  const src = (it.id && ECO.itemById && ECO.itemById[it.id]) || it;
  const mods = it.skillModifiers || (src && src.skillModifiers);
  if (Array.isArray(mods) && mods.length > 0) return true;
 }
 return false;
};

M.applyEquipmentSkillModifiers = (n, moveProf) => {
 if (!n || n.foe || !n.equip || !moveProf) return moveProf;
 let cloned = null;
 for (const slot of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
  const it = n.equip[slot];
  if (!it || (M.gearUsable && !M.gearUsable(n, it))) continue;
  const src = (it.id && ECO.itemById && ECO.itemById[it.id]) || it;
  const mods = it.skillModifiers || (src && src.skillModifiers);
  if (!Array.isArray(mods) || !mods.length) continue;
  for (const mod of mods) {
   if (!mod) continue;
   if (mod.matchArch && (!Array.isArray(mod.matchArch) ? mod.matchArch !== moveProf.arch : !mod.matchArch.includes(moveProf.arch))) continue;
   if (mod.matchElement && (!Array.isArray(mod.matchElement) ? mod.matchElement !== moveProf.element : !mod.matchElement.includes(moveProf.element))) continue;
   if (mod.matchTechId && mod.matchTechId !== moveProf.tech && mod.matchTechId !== moveProf.id) continue;
   if (!cloned) cloned = Object.assign({}, moveProf);
   const mAdd = mod.multAdd || mod.multPct || 0;
   if (mAdd) cloned.M = +((cloned.M || 1) * (1 + mAdd)).toFixed(2);
   if (mod.hitsAdd && cloned.M > 0) cloned.hits = Math.max(1, (cloned.hits || 1) + mod.hitsAdd);
   if (mod.cdDelta) cloned.cd = Math.max(3, (cloned.cd || 10) + mod.cdDelta);
   if (mod.penAdd) cloned.pen = (cloned.pen || 0) + mod.penAdd;
   if (mod.critAdd) cloned.critAdd = (cloned.critAdd || 0) + mod.critAdd;
   if (mod.costMult) cloned.costPct = +((cloned.costPct || 4) * mod.costMult).toFixed(1);
   if (mod.addRider && !cloned.rider) cloned.rider = mod.addRider;
   if ((mod.grantBuff || mod.addGrantBuff) && !cloned.grantBuff) cloned.grantBuff = mod.grantBuff || mod.addGrantBuff;
   if (mod.addMarkPrimer && !cloned.markPrimer) cloned.markPrimer = mod.addMarkPrimer;
   if (mod.addElementalFusion && !cloned.elementalFusion) cloned.elementalFusion = mod.addElementalFusion;
   if (mod.makeAoe) cloned.aoe = true;
   if (mod.composablePatch) {
    cloned.composable = Object.assign({}, cloned.composable || {}, mod.composablePatch);
   }
   cloned.modifiedByEquipment = true;
   cloned.equipmentModified = true;
  }
 }
 return cloned || moveProf;
};

// Also allow SK.canSelectMove to recognize equipment-granted skills while equipped
if (g.SK && g.SK.canSelectMove) {
 const origCanSelect = g.SK.canSelectMove;
 g.SK.canSelectMove = (n, techOrId, moveIdOrIdx) => {
  if (origCanSelect(n, techOrId, moveIdOrIdx)) return true;
  if (!n || !n.cult) return false;
  const t = typeof techOrId === 'string' ? CULT.tech(techOrId) : techOrId;
  if (!t || t.passive || t.cat === 'PASSIVE') return false;
  const granted = M.grantedEquipmentTechs(n);
  if (!granted.includes(t.id)) return false;
  return g.SK.allMoves(t).slice(0, 2).some(m => m.id === moveIdOrIdx || m.moveId === moveIdOrIdx || m.moveIndex === moveIdOrIdx);
 };
}

// Mint/catalog boundary types also cover historical recipe-only equipment.
const oldMint=ECO.mintGear;ECO.mintGear=(a,b,c,d)=>{const it=oldMint(a,b,c,d),r=(a&&a.sect&&a.npcs)?b:a,source=ECO.itemById[r&&(r.outItemId||r.itemId)]||r||{};it.gearType=it.gearType||source.gearType||D.classify(it.slot,it.nameTh);if(source.elementalRole){it.elementalRole=source.elementalRole;if(source.elementalRole==='EXPLICIT_NON_ELEMENTAL')delete it.element;}else if(source.element&&!it.element)it.element=source.element;if(source.elementProfile&&!it.elementProfile)it.elementProfile=source.elementProfile;if(source.attunedElement&&!it.attunedElement)it.attunedElement=source.attunedElement;if(source.resonanceSetId&&!it.resonanceSetId)it.resonanceSetId=source.resonanceSetId;if(source.resonanceSetIds&&!it.resonanceSetIds)it.resonanceSetIds=source.resonanceSetIds.slice();if(source.grantedSkills&&!it.grantedSkills)it.grantedSkills=source.grantedSkills.slice();if(source.skillModifiers&&!it.skillModifiers)it.skillModifiers=JSON.parse(JSON.stringify(source.skillModifiers));if(source.composableEffects&&!it.composableEffects)it.composableEffects=JSON.parse(JSON.stringify(source.composableEffects));if(source.st&&!it.st&&!source.fixedStats){const qf=it.q||1;it.st=Object.fromEntries(Object.entries(source.st).map(([k,v])=>[k,['crit','critDmg','pen','move','cast'].includes(k)?Math.round(v*10)/10:Math.round(v*qf*10)/10]));}return it;};
})(typeof globalThis!=='undefined'?globalThis:this);
