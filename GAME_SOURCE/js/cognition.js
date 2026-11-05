/* ความตั้งใจ ความฝัน ความรู้ ขอบเขตอำนาจ และความสัมพันธ์ของ NPC — JSON bounded state, no RNG in scores or explanations. */
(function (g) {
  'use strict';
  const { HC, CULT, SECT, ECO, U } = g, COG = { VERSION: 1 }, skProfCache = {}, E = (n, p) => HC.eff(n, p), clamp = U.clamp;
  const INCOME = ['forage', 'brewBasic', 'brew', 'forge', 'donate', 'personalPillDonation', 'mine', 'farm', 'cook'];
  const TRAIN = ['cultivate', 'practice', 'paidTraining', 'study', 'guidedStudy', 'skillDrill'];
  const REST = ['sleep', 'leisure', 'pray'];

  const OFFICE = {
    commander: ['แม่ทัพสำนัก', 'ประเมินกำลังศัตรู จัดกำลัง และนำการป้องกันสำนัก'],
    provision: ['ฝ่ายเสบียง', 'ประเมินอาหารสำรองและวางแผนปลูกหรือประกอบอาหาร'],
    herbal: ['ฝ่ายสมุนไพร', 'ประเมินสมุนไพรและวัตถุดิบที่ต้องเก็บหรือปลูก'],
    wildwarden: ['ฝ่ายลาดตระเวนอสูร', 'ตรวจความเสี่ยงนอกกำแพงและความพร้อมของผู้ล่า'],
    steward: ['ฝ่ายอาคารสถานที่', 'ตรวจการใช้สถานีและเสนอขยายเมื่อแออัด'],
    master: ['เจ้าสำนัก', 'วางนโยบาย จัดคน ทรัพยากร และความมั่นคงของสำนัก'],
    deputy: ['รองเจ้าสำนัก', 'ช่วยกำกับงานและรับผิดชอบเมื่อเจ้าสำนักไม่พร้อม'],
    martial: ['หอยุทธ์', 'ฝึกศิษย์และดูแลความพร้อมด้านการต่อสู้'],
    alchemy: ['หอโอสถ', 'วางแผนโอสถที่ขาดและจัดงานปรุง'],
    forge: ['โรงหลอม', 'จัดงานผลิตอุปกรณ์ให้เหมาะกับความต้องการ'],
    scripture: ['หอคัมภีร์', 'จัดการวิชาและสนับสนุนการเรียนรู้'],
    discipline: ['ผู้คุมกฎสำนัก', 'รักษากฎและตรวจสอบความไม่เป็นธรรม'],
    treasury: ['หอคลัง', 'ดูแลเงิน ของสำรอง และการจัดสรรตามนโยบาย'],
    mission: ['ผู้อาวุโสฝ่ายกิจการนอกสำนัก', 'พิจารณาคณะเดินทางและความเสี่ยง'],
    guard: ['องครักษ์', 'เฝ้าระวังและรักษาความปลอดภัย'],
    registry: ['หอทะเบียน', 'ดูแลทะเบียนและผู้สมัคร'],
    healer: ['หมอหลวง', 'ดูแลผู้บาดเจ็บและความพร้อมของสถานรักษา'],
    disciples: ['ศิษย์สืบทอด', 'ศึกษาการบริหารสำนัก ฝึกฝนตน และเตรียมสืบทอดตำแหน่งเจ้าสำนัก'],
    envoy: ['ทูตยุทธภพและกิจการบริวาร', 'เจรจาสนธิสัญญา กำหนดบรรณาการสำนักบริวาร และประสานสมาพันธ์ยุทธภพ'],
    spymaster: ['เจ้าหอข่าวกรองและเบาะแส', 'สืบข่าวลือโรงเตี๊ยม ตรวจจับวาสนาฟ้าดิน และเฝ้าระวังคลื่นใต้น้ำในสำนัก'],
    beastmaster: ['เจ้าอุทยานอสูรและพาหนะ', 'ดูแลโรงเพาะเลี้ยงสัตว์วิญญาณ ฟื้นฟูพาหนะ และจัดทัพอสูรพิทักษ์ด่าน'],
    arraymaster: ['ปรมาจารย์ค่ายกลและปราการ', 'บำรุงรักษาค่ายกลพิทักษ์สำนัก เสริมปราการจุดยุทธศาสตร์ และคุมม่านพลังป้องกัน'],
    censor: ['ผู้ตรวจการสภาและคลื่นใต้น้ำ', 'ถ่วงดุลก๊กการเมืองภายในสำนัก ตรวจสอบการใช้อำนาจ และระงับคลื่นใต้น้ำ'],
    quartermaster: ['แม่ทัพยุทธปัจจัยและคาราวาน', 'จัดสรรเสบียงทัพ ควบคุมเส้นทางคาราวานการค้าเสรี และดูแลคลังยุทธปัจจัย']
  };
  COG.OFFICE = OFFICE;

  /* ============================================================================
   * 1. PERSISTENT ASPIRATIONS (LONG-TERM DREAMS)
   * ============================================================================ */
  const ASPIRATIONS = {
    martial_master: {
      id: 'martial_master',
      title: 'บรรลุยอดยุทธ์และศาสตราคู่กาย',
      descTh: 'ฝึกฝนทักษะการรบ หาศาสตราที่เข้ามือ และขัดเกลากระบวนท่าให้เชี่ยวชาญ',
      prefGoals: ['scripture', 'gear_upgrade', 'rival', 'breakthrough', 'investigate_clue']
    },
    realm_ascendant: {
      id: 'realm_ascendant',
      title: 'ก้าวข้ามขอบเขตบำเพ็ญสู่ขั้นสูง',
      descTh: 'มุ่งมั่นสั่งสมตบะ ทะลวงคอขวด และเปิดสายวิชาเฉพาะทางให้ถึงขีดสุด',
      prefGoals: ['breakthrough', 'scripture', 'craft', 'investigate_clue']
    },
    master_alchemist: {
      id: 'master_alchemist',
      title: 'เป็นปรมาจารย์ปรุงโอสถและสมุนไพร',
      descTh: 'เสาะหาสมุนไพรวิญญาณ ศึกษาตำรับยา และหลอมโอสถคุณภาพสูง',
      prefGoals: ['craft', 'crisis', 'service', 'scripture', 'investigate_clue']
    },
    master_artificer: {
      id: 'master_artificer',
      title: 'เป็นช่างหลอมศาสตราและค่ายกลชั้นครู',
      descTh: 'ขุดแร่หายาก หลอมยุทโธปกรณ์ และวางค่ายกลเสริมความแข็งแกร่ง',
      prefGoals: ['craft', 'gear_upgrade', 'service', 'crisis', 'investigate_clue']
    },
    benevolent_healer: {
      id: 'benevolent_healer',
      title: 'เป็นหมอยาผู้เป็นที่พึ่งของศิษย์ร่วมสำนัก',
      descTh: 'ดูแลรักษาผู้บาดเจ็บ แบ่งปันโอสถช่วยชีวิต และคุ้มครองพวกพ้อง',
      prefGoals: ['help_friend', 'service', 'craft', 'crisis']
    },
    respected_mentor: {
      id: 'respected_mentor',
      title: 'เป็นอาจารย์ผู้สืบทอดวิชาและชี้แนะรุ่นหลัง',
      descTh: 'ค้นคว้าคัมภีร์ ถ่ายทอดวิชาความรู้ให้ศิษย์ และสร้างรากฐานวิชาสำนัก',
      prefGoals: ['mentor_disciple', 'scripture', 'service', 'investigate_clue']
    },
    wealthy_trader: {
      id: 'wealthy_trader',
      title: 'สร้างฐานะมั่งคั่งและสะสมทรัพยากรล้ำค่า',
      descTh: 'ขยันหาแต้มคุณูปการ ค้าขายแลกเปลี่ยน และสะสมของล้ำค่าไว้พึ่งพาตนเอง',
      prefGoals: ['gear_upgrade', 'craft', 'scripture']
    },
    sect_pillar: {
      id: 'sect_pillar',
      title: 'เป็นเสาหลักบริหารและค้ำจุนสำนัก',
      descTh: 'ปฏิบัติหน้าที่ประจำตำแหน่ง แก้ไขวิกฤตขาดแคลน และรักษาความมั่นคงของสำนัก',
      prefGoals: ['service', 'crisis', 'mentor_disciple', 'breakthrough']
    },
    peaceful_companion: {
      id: 'peaceful_companion',
      title: 'ใช้ชีวิตสงบสุขเคียงข้างมิตรสหาย',
      descTh: 'ไม่แก่งแย่งชิงดี ให้ความสำคัญกับมิตรภาพ ศิลปะ และความร่มเย็นในสำนัก',
      prefGoals: ['social_bond', 'help_friend', 'craft']
    }
  };
  COG.ASPIRATIONS = ASPIRATIONS;

  // Deterministic evaluation of long-term aspiration (never consumes RNG)
  COG.evaluateAspirations = (W, n) => {
    if (!n || !n.h) return [{ id: 'peaceful_companion', score: 1, reasonTh: 'ใช้ชีวิตเรียบง่าย' }];
    const r = COG.role(W, n);
    const sk = n.h.skills || {};
    const wpnSk = Math.max(sk.SWORD || 0, sk.BLADE || 0, sk.SPEAR || 0, sk.FIST_PALM || 0, sk.BOW || 0, sk.STAFF || 0, sk.FOCUS || 0, sk.ZITHER || 0, sk.BRUSH || 0, sk.WHIP || 0);
    const scores = [
      {
        id: 'martial_master',
        score: E(n, 'values.martialPeak') * 0.40 + E(n, 'interests.combat') * 0.35 + E(n, 'aptitudes.combat') * 0.25 + wpnSk * 0.35 + (E(n, 'personality.courage') - 45) * 0.2,
        reasonTh: 'รักการต่อสู้และปรารถนาความเชี่ยวชาญเชิงอาวุธ'
      },
      {
        id: 'realm_ascendant',
        score: (n.cult ? 18 : -20) + E(n, 'values.martialPeak') * 0.45 + E(n, 'personality.ambition') * 0.35 + E(n, 'aptitudes.cultivation') * 0.25 + E(n, 'interests.meditation') * 0.2,
        reasonTh: 'มุ่งหวังทะลวงขอบเขตตบะและอายุขัยที่สูงขึ้น'
      },
      {
        id: 'master_alchemist',
        score: E(n, 'interests.alchemy') * 0.50 + E(n, 'interests.herbs') * 0.25 + E(n, 'values.knowledgeCraft') * 0.30 + (sk.ALCHEMY || 0) * 0.45 + (r.id === 'alchemy' || r.id === 'herbal' ? 22 : 0),
        reasonTh: 'หลงใหลศาสตร์การปรุงโอสถและสมุนไพรวิญญาณ'
      },
      {
        id: 'master_artificer',
        score: E(n, 'interests.forging') * 0.50 + E(n, 'values.knowledgeCraft') * 0.30 + Math.max(sk.FORGING || 0, sk.ARRAY || 0, sk.TALISMAN || 0) * 0.45 + E(n, 'aptitudes.crafting') * 0.2 + (r.id === 'forge' ? 22 : 0),
        reasonTh: 'ถนัดงานหลอมศาสตราและค่ายกล'
      },
      {
        id: 'benevolent_healer',
        score: E(n, 'personality.empathy') * 0.50 + (sk.MEDICINE || 0) * 0.50 + E(n, 'values.familyClan') * 0.25 + E(n, 'personality.integrity') * 0.15 + (r.id === 'healer' ? 25 : 0),
        reasonTh: 'มีจิตเมตตาและต้องการช่วยเหลือผู้บาดเจ็บ'
      },
      {
        id: 'respected_mentor',
        score: (n.rank >= 3 ? 16 : -10) + E(n, 'social.teaching') * 0.40 + E(n, 'interests.teaching') * 0.35 + E(n, 'interests.scholarship') * 0.25 + E(n, 'values.honorLegacy') * 0.25 + ((n.h.life.family.disciples || []).length * 8) + (r.id === 'scripture' || r.id === 'martial' ? 15 : 0),
        reasonTh: 'ต้องการถ่ายทอดวิชาและสร้างศิษย์สืบทอด'
      },
      {
        id: 'wealthy_trader',
        score: E(n, 'values.wealthResource') * 0.55 + E(n, 'interests.trade') * 0.35 + E(n, 'aptitudes.socialCommerce') * 0.25 + (sk.trading || 0) * 0.35 - E(n, 'personality.empathy') * 0.1,
        reasonTh: 'ให้ความสำคัญกับทรัพย์สินและการค้าแลกเปลี่ยน'
      },
      {
        id: 'sect_pillar',
        score: (r.id !== 'member' ? 24 : 0) + E(n, 'values.sectDuty') * 0.45 + E(n, 'personality.loyalty') * 0.30 + E(n, 'personality.discipline') * 0.25 + E(n, 'values.powerStatus') * 0.25,
        reasonTh: 'ยึดมั่นในหน้าที่และการบริหารสำนัก'
      },
      {
        id: 'peaceful_companion',
        score: E(n, 'values.freedom') * 0.42 + E(n, 'values.familyClan') * 0.35 + Math.max(E(n, 'interests.arts'), E(n, 'interests.solitude'), E(n, 'interests.cuisine')) * 0.30 + (100 - E(n, 'personality.ambition')) * 0.35 + (100 - E(n, 'personality.aggression')) * 0.15,
        reasonTh: 'รักอิสระ มิตรภาพ และความสงบสุขมากกว่าการแก่งแย่ง'
      }
    ];
    scores.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    return scores;
  };

  COG.ensureAspiration = (W, n) => {
    const c = COG.ensure(n);
    const day = W ? (W.day || 0) : 0;
    if (c.aspiration && ASPIRATIONS[c.aspiration.id] && day - (c.aspiration.lastReviewDay || 0) < 30) {
      return c.aspiration;
    }
    const ranked = COG.evaluateAspirations(W, n);
    const top = ranked[0];
    if (!c.aspiration || !ASPIRATIONS[c.aspiration.id]) {
      const def = ASPIRATIONS[top.id] || ASPIRATIONS.peaceful_companion;
      c.aspiration = {
        id: def.id,
        title: def.title,
        descTh: def.descTh,
        reasonTh: top.reasonTh,
        sinceDay: day,
        lastReviewDay: day,
        progress: 0,
        milestones: [],
        revisions: 0
      };
      return c.aspiration;
    }
    // Check if major life shift warrants revising aspiration (bounded hysteresis: at least 45 days or major role/cultivation shift)
    const cur = c.aspiration;
    const curScoreObj = ranked.find(x => x.id === cur.id) || { score: 0 };
    const daysHeld = day - (cur.sinceDay || 0);
    const roleChangedToLeader = COG.role(W, n).id !== 'member' && cur.id === 'peaceful_companion' && top.id === 'sect_pillar';
    if ((daysHeld >= 45 || roleChangedToLeader) && day - (cur.lastReviewDay || 0) >= 30) {
      cur.lastReviewDay = day;
      if (top.id !== cur.id && top.score > curScoreObj.score + 18) {
        const def = ASPIRATIONS[top.id];
        const prevTitle = cur.title;
        cur.id = def.id;
        cur.title = def.title;
        cur.descTh = def.descTh;
        cur.reasonTh = top.reasonTh + ' (ปรับเปลี่ยนจาก「' + prevTitle + '」)';
        cur.sinceDay = day;
        cur.revisions = (cur.revisions || 0) + 1;
        if (W && W.log && !W._founding) {
          W.log('insight', n.h.name.given + ' ทบทวนเส้นทางชีวิตและตั้งปณิธานใหม่:「' + def.title + '」', [n.id]);
        }
      }
    }
    return c.aspiration;
  };

  COG.recordAspirationMilestone = (W, n, text, delta) => {
    const c = COG.ensure(n);
    const asp = c.aspiration || COG.ensureAspiration(W, n);
    if (!asp) return;
    asp.progress = clamp(Math.round(((asp.progress || 0) + (delta || 10)) * 10) / 10, 0, 100);
    asp.milestones = Array.isArray(asp.milestones) ? asp.milestones : [];
    asp.milestones.push({ day: W ? W.day : 0, text });
    if (asp.milestones.length > 8) asp.milestones.shift();
  };

  /* ============================================================================
   * 2. OFFICE JURISDICTION, DELEGATION & AUTHORITY
   * ============================================================================ */
  COG.available = (n, W) => !!n && !n.dead && !n.away && !n.exiled && !n.sealed && !n.sealedBt && !(n.jail > (W?.t ?? 0)) && !(n.punished > (W?.t ?? 0));

  COG.role = (W, n) => {
    if (!W || !W.sect || !n) return { id: 'member', title: 'สมาชิกสำนัก', responsibility: 'ดูแลตนเอง ฝึกฝน และเลือกช่วยสำนักตามความสามารถ', acting: false, delegated: false };
    const rc = n._cogRoleCache;
    if (rc && rc.t === W.t && rc.post === n.post && rc.assist === n.assist && rc.isM === (W.sect.masterId === n.id) && rc.isD === (W.sect.deputyId === n.id)) {
      return rc.val;
    }
    let id = W.sect.masterId === n.id ? 'master' : W.sect.deputyId === n.id ? 'deputy' : (n.post && W.sect.posts && W.sect.posts[n.post] === n.id ? n.post : null);
    if (!id && W.sect.posts) {
      const pids = SECT.POST_IDS;
      for (let i = 0; i < pids.length; i++) {
        if (W.sect.posts[pids[i]] === n.id) { id = pids[i]; break; }
      }
    }
    let acting = false, delegated = false;
    if (!id && W.sect.welfareAuthority?.id === n.id && W.sect.welfareAuthority.acting) {
      id = 'treasury';
      acting = true;
      delegated = true;
    }
    if (!id && W.sect.delegations) {
      for (const p in W.sect.delegations) {
        const d = W.sect.delegations[p];
        if (d && d.delegateId === n.id && d.until > W.t && OFFICE[p]) {
          id = p;
          acting = true;
          delegated = true;
          break;
        }
      }
    }
    if (!id && n.assist && OFFICE[n.assist]) {
      id = n.assist;
      acting = true;
    }
    const o = OFFICE[id];
    const val = {
      id: id || 'member',
      title: o ? (acting ? (delegated ? 'ผู้รับมอบหมาย/รักษาการ' : 'ผู้ช่วย/รักษาการ') : '') + o[0] : 'สมาชิกสำนัก',
      responsibility: o ? o[1] : 'ดูแลตนเอง ฝึกฝน และเลือกช่วยสำนักตามความสามารถ',
      acting,
      delegated
    };
    n._cogRoleCache = { t: W.t, post: n.post, assist: n.assist, isM: W.sect.masterId === n.id, isD: W.sect.deputyId === n.id, val };
    return val;
  };

  COG.hasAuthority = (W, n, domain) => {
    if (!COG.available(n, W) || !W || !W.sect) return false;
    if (domain === 'master') return W.sect.masterId === n.id || (W.sect.deputyId === n.id && !COG.available(W.byId[W.sect.masterId], W));
    if (domain === 'deputy') return W.sect.deputyId === n.id;
    if (W.sect.posts && W.sect.posts[domain] === n.id) return true;
    if (domain === 'treasury' && W.sect.welfareAuthority?.id === n.id) return true;
    const del = W.sect.delegations && W.sect.delegations[domain];
    if (del && del.delegateId === n.id && del.until > W.t) return true;
    return false;
  };

  // Delegate/handover office duty when appointed officer is unavailable
  COG.syncOfficeAuthority = W => {
    if (!W || !W.sect) return;
    const S = W.sect;
    S.delegations = S.delegations || {};
    S.officePlans = S.officePlans || {};
    S.officeOrders = S.officeOrders || {};

    // Invalidate expired or revoked office plans and orders
    for (const [post, plan] of Object.entries(S.officePlans)) {
      const holder = W.byId[plan.by];
      const currentHolderId = post === 'master' ? S.masterId : post === 'deputy' ? S.deputyId : S.posts[post];
      const del = S.delegations[post];
      const authorizedId = (del && del.until > W.t) ? del.delegateId : currentHolderId;
      if (plan.expiresAt <= W.t || !holder || holder.dead || holder.exiled || plan.by !== authorizedId) {
        delete S.officePlans[post];
      }
    }

    for (const [post, ord] of Object.entries(S.officeOrders)) {
      if (!ord || ord.expiresAt <= W.t || !COG.available(W.byId[ord.by], W)) {
        delete S.officeOrders[post];
      }
    }

    // Check active posts for unavailable holders and hand over to an eligible assistant/deputy
    for (const post of Object.keys(SECT.POSTS)) {
      const holderId = S.posts[post];
      const holder = holderId ? W.byId[holderId] : null;
      const existingDel = S.delegations[post];

      if (!holder || holder.dead || holder.exiled) {
        if (holder && (holder.dead || holder.exiled)) S.posts[post] = null;
        delete S.delegations[post];
        continue;
      }

      if (COG.available(holder, W)) {
        if (existingDel) {
          delete S.delegations[post];
        }
        continue;
      }

      // Holder is temporarily unavailable (away, sealed, jailed). Keep valid delegation or create one.
      if (existingDel && existingDel.until > W.t && COG.available(W.byId[existingDel.delegateId], W)) {
        continue;
      }
      const cands = W.npcs.filter(x => x.id !== holder.id && COG.available(x, W) && (x.assist === post || (x.id === S.deputyId && !x.post) || (!x.post && x.rank >= 2 && SECT.relevance(post, x) >= 24)));
      cands.sort((a, b) => ((b.assist === post ? 25 : 0) + SECT.relevance(post, b)) - ((a.assist === post ? 25 : 0) + SECT.relevance(post, a)));
      const delegate = cands[0];
      if (delegate) {
        S.delegations[post] = {
          post,
          holderId: holder.id,
          delegateId: delegate.id,
          since: W.t,
          until: W.t + 1440,
          reason: holder.away ? 'ผู้ดำรงตำแหน่งออกเดินทางนอกสำนัก' : holder.sealed || holder.sealedBt ? 'ผู้ดำรงตำแหน่งกำลังปิดด่าน' : 'ผู้ดำรงตำแหน่งไม่สามารถปฏิบัติงานได้ชั่วคราว'
        };
        if (S.officePlans[post] && S.officePlans[post].by === holder.id) {
          S.officePlans[post].by = delegate.id;
          S.officePlans[post].delegatedFrom = holder.id;
        }
      } else {
        delete S.delegations[post];
      }
    }
  };

  /* ============================================================================
   * 3. BOUNDED KNOWLEDGE, BELIEF STATE & HEURISTIC FORECASTING
   * ============================================================================ */
  COG.ensure = n => {
    if (!n.cognition || typeof n.cognition !== 'object' || n.cognition.version !== 1) {
      n.cognition = { version: 1, goal: null, memory: [], trace: [], nextReview: 0 };
    }
    const c = n.cognition;
    if (!Array.isArray(c.memory)) c.memory = [];
    else if (c.memory.length > 24) c.memory = c.memory.slice(-24);
    if (!Array.isArray(c.trace)) c.trace = [];
    else if (c.trace.length > 8) c.trace = c.trace.slice(-8);
    if (!Array.isArray(c.commitments)) c.commitments = [];
    else if (c.commitments.length > 12) c.commitments = c.commitments.slice(-12);
    return c;
  };

  COG.knowledgeScope = (W, n) => {
    const r = COG.role(W, n);
    const maxTechTier = (W && W.sect && SECT.canLearnTier) ? SECT.canLearnTier(W, n) : 1;
    const isExec = ['master', 'deputy', 'treasury', 'discipline'].includes(r.id);
    const isRegistry = ['master', 'deputy', 'registry'].includes(r.id);
    return {
      roleId: r.id,
      maxTechTier,
      canSeeFullTreasury: isExec,
      canSeeAuditEvidence: ['master', 'deputy', 'discipline'].includes(r.id),
      canSeeApplicantCA: isRegistry,
      canSeeHiddenPA: false, // Hard invariant: NO NPC ever sees hidden PA
      knownZones: Array.from(new Set((n.cognition?.memory || []).filter(m => m.zoneId).map(m => m.zoneId)))
    };
  };

  COG.recordHallAddition = (W, kind, itemId, actorId) => {
    if (!W || !W.sect || !itemId) return;
    const map = W.sect._recentHallAdditions || (W.sect._recentHallAdditions = {});
    map[kind + ':' + itemId] = { at: W.t || 0, actorId: actorId || null };
    if (actorId && W.byId && W.byId[actorId]) {
      COG.perceive(W, W.byId[actorId], true);
    }
  };

  COG.isAwareOf = (W, n, kind, itemId) => {
    if (!W || !W.sect || !n || n.dead || n.away) return false;
    if (kind === 'library_tech' || kind === 'library') {
      if (!Array.isArray(W.sect.library) || !W.sect.library.includes(itemId)) return false;
      const rec = W.sect._recentHallAdditions && W.sect._recentHallAdditions['library:' + itemId];
      if (!rec || (W.t || 0) <= 0 || (W.t - rec.at) >= 180) return true;
      if (rec.actorId === n.id) return true;
      const roleId = COG.role(W, n).id;
      if (['scripture', 'master', 'deputy'].includes(roleId)) return true;
      if (n.act && ['study', 'guidedStudy', 'donate', 'duty', 'shop'].includes(n.act.id)) return true;
      const k = n.cognition && n.cognition.knowledge;
      if (k && Array.isArray(k.visibleTechIds) && k.visibleTechIds.includes(itemId)) return true;
      return false;
    }
    if (kind === 'tablet') {
      return Array.isArray(W.sect.legacyTablets) && W.sect.legacyTablets.length > 0;
    }
    if (kind === 'catalyst') {
      return !!(W.sect.catalysts && Object.values(W.sect.catalysts).some(v => v > 0));
    }
    return true;
  };

  COG.visibleLibraryFor = (W, n) => {
    if (!W || !W.sect || !Array.isArray(W.sect.library)) return [];
    if (!W.sect._recentHallAdditions) return W.sect.library;
    return W.sect.library.filter(id => COG.isAwareOf(W, n, 'library_tech', id));
  };

  // Update NPC's bounded perception of library/shop/shortages/tablets/catalysts on realistic cadence
  COG.perceive = (W, n, force) => {
    if (!W || !W.sect || !n) return null;
    const c = COG.ensure(n);
    const k = c.knowledge || (c.knowledge = { updatedAt: -9999, visibleTechIds: [], visibleGearIds: [], knownShortageIds: [], knownTabletIds: [], knownCatalysts: [], estimates: {} });
    const nearInfoHub = n.act && ['study', 'guidedStudy', 'shop', 'duty', 'donate'].includes(n.act.id);
    if (!force && W.t - (k.updatedAt || -9999) < (nearInfoHub ? 45 : 240)) return k;
    const cap = Math.min(CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : (n.cult?.stage || 1), SECT.canLearnTier(W, n));
    k.updatedAt = W.t;
    const rawLib = force || nearInfoHub ? (W.sect.library || []) : COG.visibleLibraryFor(W, n);
    k.visibleTechIds = n.cult ? rawLib.filter(id => {
      const t = CULT.tech(id);
      return t && (t.reqTier || t.tier || 1) <= cap && (t.path === 'ANY' || t.path === n.cult.path || t.legendary);
    }).slice(0, 24) : [];
    k.visibleGearIds = (W.sect.gear || []).filter(eq => eq && SECT.canAccessItem(W, n, eq)).map(eq => eq.uid || eq.id).slice(0, 16);
    k.knownShortageIds = (W.sect.shortageDirectives || []).filter(d => d.deficit > 0).map(d => d.id).slice(0, 8);
    k.knownTabletIds = (W.sect.legacyTablets || []).map(t => t.id).slice(0, 12);
    k.knownCatalysts = Object.keys(W.sect.catalysts || {}).filter(id => (W.sect.catalysts[id] || 0) > 0);
    return k;
  };

  // Inexpensive deterministic heuristic forecasting (never clones world or rolls RNG)
  COG.forecast = (W, n, kind, target) => {
    if (!W || !n) return null;
    if (kind === 'affordability') {
      const price = Number(target?.price ?? target) || 0;
      const cp = n.cp || 0;
      if (cp >= price) {
        return { kind: 'affordability', isEstimate: true, ok: true, daysNeeded: 0, confidence: 0.95, assumptionsTh: 'มีแต้มคุณูปการพอจ่ายแล้ว (' + Math.round(cp) + '/' + Math.round(price) + ' คป.)' };
      }
      const daysInSect = Math.max(1, (W.day || 1) - (n.joinDay || 0));
      const observedRate = (n.cpEarned || 0) > 10 ? (n.cpEarned / daysInSect) : (6 + n.rank * 3.5 + E(n, 'personality.discipline') * 0.06);
      const dailyNet = Math.max(1.5, observedRate * (0.85 + E(n, 'personality.optimism' in (n.h.temperament || {}) ? 'temperament.optimism' : 'personality.ambition') / 400));
      const deficit = price - cp;
      const daysNeeded = Math.round((deficit / dailyNet) * 10) / 10;
      const confidence = clamp(0.45 + Math.min(0.35, daysInSect / 90) + E(n, 'intellect.numeracy') / 400, 0.35, 0.9);
      return {
        kind: 'affordability',
        isEstimate: true,
        ok: daysNeeded <= 28,
        daysNeeded,
        dailyNet: Math.round(dailyNet * 10) / 10,
        deficit: Math.round(deficit),
        confidence: Math.round(confidence * 100) / 100,
        assumptionsTh: '[คาดการณ์] ต้องเก็บเพิ่ม ' + Math.round(deficit) + ' คป. (~' + daysNeeded + ' วัน ที่อัตราเฉลี่ย ~' + Math.round(dailyNet) + ' คป./วัน)'
      };
    }
    if (kind === 'huntRisk') {
      const bPower = Math.max(1, Number(target?.power ?? target?.cp ?? 60));
      const zoneId = target?.zone || target?.id || null;
      const ownPower = Math.max(1, CULT.power(n));
      const caution = E(n, 'personality.caution') / 100, courage = E(n, 'personality.courage') / 100;
      let memBias = 0;
      for (const m of n.cognition?.memory || []) {
        if (zoneId && m.zoneId !== zoneId) continue;
        const fade = Math.max(0, 1 - (W.t - m.at) / (14 * 1440));
        if (m.kind === 'hunt_loss') memBias -= m.severity * fade * (0.22 + caution * 0.2);
        if (m.kind === 'hunt_win') memBias += 0.10 * fade;
      }
      const rawRatio = ownPower / (ownPower + bPower);
      const perceivedWin = clamp(rawRatio + (courage - caution) * 0.08 + memBias, 0.05, 0.96);
      return {
        kind: 'huntRisk',
        isEstimate: true,
        winProb: Math.round(perceivedWin * 100) / 100,
        risky: perceivedWin < 0.52,
        confidence: clamp(0.5 + E(n, 'intellect.perceptiveness') / 250, 0.4, 0.88),
        assumptionsTh: '[คาดการณ์] โอกาสชนะราว ' + Math.round(perceivedWin * 100) + '% (เทียบกำลังตน ' + Math.round(ownPower) + ' กับเป้าหมาย ~' + Math.round(bPower) + (memBias < -0.05 ? ' · เคยพลาดท่าในพื้นที่นี้' : '') + ')'
      };
    }
    if (kind === 'invitation') {
      const other = typeof target === 'string' ? W.byId[target] : target?.partner || target;
      const invType = target?.type || 'chat';
      if (!other) return null;
      const r = (n.h.mind.relations && n.h.mind.relations[other.id]) || { a: 0, t: 40, r: 30, g: 0, f: 0 };
      const busyPenalty = (other.act && ['duty', 'cultivate', 'study', 'practice'].includes(other.act.id)) ? -0.22 : 0;
      const est = clamp(0.50 + (r.a || 0) / 220 + ((r.t ?? 40) - 40) / 250 + (r.g || 0) / 250 + busyPenalty, 0.05, 0.95);
      return {
        kind: 'invitation',
        isEstimate: true,
        acceptProb: Math.round(est * 100) / 100,
        confidence: clamp(0.4 + Math.min(0.4, (r.n || 0) * 0.04), 0.4, 0.85),
        assumptionsTh: '[คาดการณ์] คาดว่า ' + other.h.name.given + ' จะตอบรับ ~' + Math.round(est * 100) + '% จากความคุ้นเคยและงานที่ทำอยู่'
      };
    }
    if (kind === 'reserves') {
      const pop = Math.max(1, W.npcs.filter(x => !x.dead && !x.exiled).length);
      const foodTotal = ECO.count(W, 'meal') + ECO.count(W, 'grain') * 3;
      const foodDays = Math.round((foodTotal / (pop * 3)) * 10) / 10;
      const upkeepEst = pop * 7 + (W.map?.buildings || []).reduce((s, b) => s + b.level * 15, 0);
      const stoneMonths = Math.round(((W.sect.stones || 0) / Math.max(1, upkeepEst)) * 10) / 10;
      return {
        kind: 'reserves',
        isEstimate: true,
        foodDays,
        stoneMonths,
        shortageRisk: foodDays < 7 || stoneMonths < 1.5,
        confidence: 0.85,
        assumptionsTh: '[คาดการณ์คลัง] เสบียงพอราว ' + foodDays + ' วัน · ศิลาพอบำรุงสำนักราว ' + stoneMonths + ' เดือน'
      };
    }
    return null;
  };

  /* ============================================================================
   * 4. DELIBERATE TECHNIQUE & EQUIPMENT EVALUATION
   * ============================================================================ */
  const TP_CACHE = new WeakMap();
  const BLT_CACHE = new WeakMap();
  COG.techPreference = (n, t) => {
    if (!t || !n) return -999;
    let tpc = null;
    if (t.id && n.cult && n.h) {
      const eqW = n.equip ? n.equip.WEAPON : null, eqA = n.equip ? n.equip.ARMOR : null, pLen = n.pets ? n.pets.length : 0;
      const emVer = (n.ext && n.ext.elementalSystem && n.ext.elementalSystem._mVer) || 0;
      tpc = TP_CACHE.get(n);
      const rat0 = n.h.personality.rationality, mLen0 = n.mods ? n.mods.length : 0;
      if (!tpc || tpc.rat !== rat0 || tpc.mLen !== mLen0 || tpc.emVer !== emVer || tpc.st !== n.cult.stage || tpc.sub !== n.cult.sub || tpc.path !== n.cult.path || tpc.tl !== n.cult.techs.length || tpc.post !== n.post || tpc.eqW !== eqW || tpc.eqA !== eqA || tpc.pVer !== (n._passVer || 0) || tpc.pLen !== pLen) {
        const elemMap = (tpc && tpc.emVer === emVer && tpc.root === n.h.root && tpc.st === n.cult.stage) ? tpc.elemMap : Object.create(null);
        tpc = { rat: rat0, mLen: mLen0, emVer, root: n.h.root, st: n.cult.stage, sub: n.cult.sub, path: n.cult.path, tl: n.cult.techs.length, post: n.post, eqW, eqA, pVer: n._passVer || 0, pLen, map: Object.create(null), elemMap };
        TP_CACHE.set(n, tpc);
      } else {
        const hit = tpc.map[t.id];
        if (hit !== undefined) return hit;
      }
    }
    const rational = E(n, 'personality.rationality') / 100, M = g.MARTIAL, isPass = !!(t && (t.passive || t.cat === 'PASSIVE'));
    const openPass = isPass && M && M.activePassives && M.maxPassiveSlots && M.activePassives(n).length < M.maxPassiveSlots(n) ? 1.45 : 0;
    const condMatch = M ? (M.conditionMatches(n, t) ? 0.8 : (t.requiresWeapon ? -1.8 : -0.8)) : 0;
    // Evaluate multi-move / stage depth, passive family overlap, and combat role fit
    let roleFit = 0;
    if (isPass && M && M.passiveFamilyOf && Array.isArray(n.cult?.techs)) {
      const fam = M.passiveFamilyOf(t);
      const activePass = M.activePassives ? M.activePassives(n) : [];
      const sameFamId = activePass.find(id => M.passiveFamilyOf(CULT.tech(id)) === fam);
      if (sameFamId) {
        const prevT = CULT.tech(sameFamId);
        if (prevT && (prevT.tier || 1) >= (t.tier || 1)) roleFit -= 1.25; // redundant passive family
        else roleFit += 0.35; // upgrades existing passive family
      }
    }
    if (!isPass && t.id && g.SK && g.SK.profile) {
      const prof = skProfCache[t.id] || (skProfCache[t.id] = g.SK.profile(t));
      if (prof) {
        const caution = E(n, 'personality.caution') / 100;
        const aggr = E(n, 'personality.aggression') / 100;
        const emp = E(n, 'personality.empathy') / 100;
        if (['guard', 'counter', 'evade'].includes(prof.arch)) roleFit += caution * 0.45;
        if (['heal', 'support'].includes(prof.arch)) roleFit += emp * 0.55 + (n.post === 'healer' || n.post === 'commander' ? 0.4 : 0);
        if (['burst', 'pierce', 'flurry'].includes(prof.arch)) roleFit += aggr * 0.35;
        if (prof.arch === 'forbid') roleFit += (n.cult?.path === 'DEMON' ? 0.35 : -caution * 0.85);
      }
      if (Array.isArray(t.moveDefs) && t.moveDefs.length > 1) {
        roleFit += Math.min(0.45, (t.moveDefs.length - 1) * 0.10) * rational;
      }
    }
    let elemFit = 0;
    if (g.ELEM && n.h) {
      let cCompat = tpc && tpc.elemMap && t.id ? tpc.elemMap[t.id] : undefined;
      if (!cCompat) {
        cCompat = g.ELEM.resolveCompatibility(n, t, isPass ? 'passive' : 'combat');
        if (tpc && tpc.elemMap && t.id) tpc.elemMap[t.id] = cCompat;
      }
      elemFit = (cCompat.combatMultiplier - 1) * 3.8 + (cCompat.studySpeedMult - 1) * 1.4;
    }
    const isPrimarySub = !!(t.sub && n.cult && t.sub === n.cult.sub);
    const isCompatSub = !!(n.cult && Array.isArray(t.compatibleSubs) && t.compatibleSubs.includes(n.cult.sub));
    const subMatch = isPrimarySub ? 3.6 : isCompatSub ? 2.4 : 0;
    let buildFit = isPrimarySub ? 1.15 : isCompatSub ? 0.45 : 0;
    if (M && n.cult) {
      const subDef = CULT.sub ? CULT.sub(n) : null;
      const subW = (subDef && subDef.elementProfile && subDef.elementProfile.weights) || null;
      const tEl = (t.elementProfile && t.elementProfile.primary) || t.element;
      if (tEl && ((subDef && subDef.element === tEl) || (subW && subW[tEl] > 0))) {
        buildFit += (subDef && subDef.element === tEl) ? 0.95 : 0.65;
      }
      const profWpn = (M.PROFILES && M.PROFILES[n.cult.sub] && M.PROFILES[n.cult.sub][3]) || (M.PATHS && M.PATHS[n.cult.path] && M.PATHS[n.cult.path].weapons) || [];
      const wTypes = Array.isArray(t.weaponTypes) ? t.weaponTypes : [];
      const hasWeaponEquipped = !!(n.equip && n.equip.WEAPON);
      if (wTypes.length) {
        if (profWpn[0] && wTypes.includes(profWpn[0])) buildFit += (hasWeaponEquipped ? 0.75 : 1.35);
        else if (profWpn.some(w => wTypes.includes(w))) buildFit += (hasWeaponEquipped ? 0.50 : 1.10);
        else if (hasWeaponEquipped && wTypes.includes(M.gearType(n.equip.WEAPON))) {
          buildFit += 0.45; // Improvise around currently held fallback weapon
        }
      } else if (t.v212Pack && t.element === 'NEUTRAL') {
        buildFit += 0.30; // Universal adaptive bridge passive
      }
      if (n.pets && n.pets.length && CULT.activePets) {
        const pet = CULT.activePets(n)[0] || null;
        if (pet) {
          const arch = t.combatArch || (t.id && skProfCache[t.id] && skProfCache[t.id].arch) || '';
          const pRole = pet.role || 'FEROCIOUS_ASSAULT';
          if (pRole === 'IRON_GUARDIAN' && ['snipe', 'barrage', 'channel', 'control', 'support', 'heal'].includes(arch)) buildFit += 0.28;
          else if (pRole === 'FEROCIOUS_ASSAULT' && ['charge', 'flurry', 'strike', 'shield', 'heal', 'buff'].includes(arch)) buildFit += 0.28;
          else if (pRole === 'VENOM_SWARM' && ['dot', 'control', 'drain'].includes(arch)) buildFit += 0.28;
          else if (pRole === 'MYSTIC_SUPPORT' && ['burst', 'pierce', 'execute', 'strike'].includes(arch)) buildFit += 0.28;
        }
      }
    }
    const res = condMatch + openPass + roleFit + elemFit + buildFit + rational * Math.log2(Math.max(1, t.power || 1)) + (1 - rational) * (subMatch + (t.path === n.cult?.path ? 1 : 0)) + E(n, 'personality.curiosity') / 100 * (t.tier || 1) * 0.2;
    if (tpc && t.id) tpc.map[t.id] = res;
    return res;
  };

  COG.evaluateTech = (W, n, tOrId) => {
    const t = typeof tOrId === 'string' ? CULT.tech(tOrId) : tOrId;
    if (!t || !n || !n.cult) return { ok: false, score: -Infinity, reasons: ['ยังไม่เปิดวิถีบำเพ็ญ'] };
    const M = g.MARTIAL;
    const isPass = !!(t.passive || t.cat === 'PASSIVE');
    const reasons = [];
    const score = COG.techPreference(n, t);
    if (t.sub && (t.sub === n.cult.sub || (Array.isArray(t.compatibleSubs) && t.compatibleSubs.includes(n.cult.sub)))) reasons.push('ตรงสายย่อย ' + n.cult.sub);
    else if (t.path === n.cult.path) reasons.push('ตรงวิถี ' + t.path);
    const elemExplain = g.ELEM ? g.ELEM.explainCompatibility(n, t, isPass ? 'passive' : 'combat') : null;
    const learnCompat = g.ELEM ? g.ELEM.resolveCompatibility(n, t, 'learning') : null;
    if (elemExplain && elemExplain.mode !== 'EXPLICIT_NON_ELEMENTAL') {
      reasons.push('ความเข้ากันธาตุ: ' + elemExplain.summaryTh);
    }
    const profWpn = (M && M.PROFILES && M.PROFILES[n.cult.sub] && M.PROFILES[n.cult.sub][3]) || [];
    if (M && M.conditionMatches(n, t)) {
      if (Array.isArray(t.weaponTypes) && profWpn.some(w => t.weaponTypes.includes(w))) reasons.push('ตรงกับศาสตราประจำสายที่ถืออยู่');
      else reasons.push('พลิกแพลงใช้ตามศาสตรา/เกราะที่ถืออยู่');
    } else if (Array.isArray(t.weaponTypes) && profWpn.some(w => t.weaponTypes.includes(w))) {
      reasons.push('ตรงศาสตราประจำสายย่อย (' + profWpn.join('/') + ')');
    } else if (t.weaponTypes || t.armorTypes) {
      reasons.push(t.requiresWeapon ? 'ต้องมีอาวุธเฉพาะจึงใช้ได้' : 'วิชาพลิกแพลงเชื่อมสาย (ใช้อาวุธสำรองได้)');
    }
    if (CULT.activePets && (CULT.activePets(n)[0]||null)) {
      reasons.push('ประสานบทบาทสัตว์อสูรคู่สัญญา (' + ((CULT.activePets(n)[0]||null).role || 'FEROCIOUS_ASSAULT') + ')');
    }
    if (isPass) {
      const slots = M ? M.maxPassiveSlots(n) : 3;
      const active = M ? M.activePassives(n) : [];
      reasons.push('วิชาติดตัว (ช่องว่าง ' + Math.max(0, slots - active.length) + '/' + slots + ')');
    } else if (Array.isArray(t.moveDefs) && t.moveDefs.length > 1) {
      reasons.push('มี ' + t.moveDefs.length + ' กระบวนท่าตามขั้นความชำนาญ');
    }
    const fee = (W && g.CPE && g.CPE.techPrice) ? g.CPE.techPrice(W, t) : 0;
    const canAfford = (n.cp || 0) >= fee;
    return { ok: true, id: t.id, nameTh: t.nameTh, score: Math.round(score * 100) / 100, fee, canAfford, isPassive: isPass, elemCompat: elemExplain, learnCompat, reasons };
  };

  // Ensure learned passives that best match current equipment & build are slotted (respecting player-pinned passives)
  COG.reconcileLoadout = (W, n) => {
    const M = g.MARTIAL;
    if (!M || !n || !n.cult || !Array.isArray(n.cult.techs)) return [];
    const lSig = (n._ver || 0) + ':' + n.cult.stage + ':' + (n.cult.sub || '') + ':' + n.cult.techs.length + ':' + (n.passivePinned ? n.passivePinned.length : 0) + ':' + (n.passiveUnequipped ? n.passiveUnequipped.length : 0) + ':' + (n.equip && n.equip.WEAPON ? n.equip.WEAPON.id : '') + ':' + (n.equip && n.equip.ARMOR ? n.equip.ARMOR.id : '');
    if (n._reconcileLoadoutSig === lSig && Array.isArray(n.passiveLoadout)) return n.passiveLoadout;
    n._reconcileLoadoutSig = lSig;
    const maxSlots = M.maxPassiveSlots(n);
    const learnedPassives = n.cult.techs.filter(id => {
      const t = CULT.tech(id);
      return !!(t && !M.isInnateTech(t) && (t.cat === 'PASSIVE' || t.passive) && M.isTechCompatible(n, t));
    });
    if (!learnedPassives.length) return M.reconcilePassives(n);
    const pinned = new Set(Array.isArray(n.passivePinned) ? n.passivePinned : []);
    const unequipped = new Set(Array.isArray(n.passiveUnequipped) ? n.passiveUnequipped : []);
    const candidates = learnedPassives.filter(id => !unequipped.has(id)).slice().sort((a, b) => {
      if (pinned.has(a) !== pinned.has(b)) return pinned.has(a) ? -1 : 1;
      const ta = CULT.tech(a), tb = CULT.tech(b);
      const condA = M.conditionMatches(n, ta) ? 1 : 0, condB = M.conditionMatches(n, tb) ? 1 : 0;
      if (condA !== condB) return condB - condA;
      return COG.techPreference(n, tb) - COG.techPreference(n, ta);
    });
    const next = [];
    const usedFam = new Set();
    for (const id of candidates) {
      if (next.length >= maxSlots) break;
      const t = CULT.tech(id), fam = M.passiveFamilyOf(t);
      if (usedFam.has(fam)) continue;
      usedFam.add(fam);
      next.push(id);
    }
    const cur = Array.isArray(n.passiveLoadout) ? n.passiveLoadout : [];
    if (next.length !== cur.length || next.some((id, idx) => cur[idx] !== id)) {
      n.passiveLoadout = next;
      M.syncResourceCaps(n);
    }
    return M.reconcilePassives(n);
  };

  // Pure, zero-RNG evaluation of an NPC's weapon/manual build state and improvisation fallbacks
  COG.evaluateBuildImprovisation = (W, n) => {
    const M = g.MARTIAL;
    if (!W || !W.sect || !M || !n || !n.cult) {
      return { mode: 'none', hasPreferredWeapon: false, preferredWeapons: [], equippedWeaponType: null, summaryTh: 'ยังไม่ได้เปิดวิถีบำเพ็ญ', reasons: [], targetActions: [] };
    }
    const c = n.cult;
    const subDef = CULT.sub ? CULT.sub(n) : null;
    const profWpn = (M.PROFILES && M.PROFILES[c.sub] && M.PROFILES[c.sub][3]) || (M.PATHS && M.PATHS[c.path] && M.PATHS[c.path].weapons) || [];
    const subElems = Object.keys((subDef && subDef.elementProfile && subDef.elementProfile.weights) || {});
    if (!subElems.length && subDef && subDef.element) subElems.push(subDef.element);
    const eqWpn = n.equip && n.equip.WEAPON;
    const eqType = eqWpn ? M.gearType(eqWpn) : null;
    const hasPreferredWeapon = !!(eqType && profWpn.includes(eqType));
    const hasPrimaryWeapon = !!(eqType && profWpn[0] === eqType);
    const effSt = CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : c.stage;
    const allGearPool = ((n.inv && Array.isArray(n.inv.gear)) ? n.inv.gear : []).concat(W.sect.gear || []).filter(g2 => g2 && g2.slot === 'WEAPON' && (g2.minStage || 1) <= effSt);
    const availPrefGear = allGearPool.filter(g2 => profWpn.includes(M.gearType(g2)));
    const availFallbackGear = allGearPool.filter(g2 => !profWpn.includes(M.gearType(g2)));
    const knownForgeRecs = (ECO && ECO.recipesFor) ? ECO.recipesFor(W, ['FORGING', 'ARRAY', 'TALISMAN']).filter(r => {
      const outIt = r.outItemId && ECO.itemById && ECO.itemById[r.outItemId];
      const gt = r.gearType || (outIt && outIt.gearType);
      return gt && profWpn.includes(gt) && (r.tier || 1) <= effSt + 1;
    }) : [];
    const craftablePrefRec = knownForgeRecs.find(r => ECO.inputsOk(W, r)) || knownForgeRecs[0] || null;
    const learnableIds = CULT.learnable(n, W.sect.library || []);
    const learnableTechs = learnableIds.map(id => CULT.tech(id)).filter(Boolean);
    const prefTechs = learnableTechs.filter(t => Array.isArray(t.weaponTypes) && t.weaponTypes.some(w => profWpn.includes(w)) && subElems.includes(t.elementProfile?.primary || t.element));
    const fallbackTechs = learnableTechs.filter(t => !prefTechs.includes(t));
    const pet = CULT.activePets ? (CULT.activePets(n)[0]||null) : null;
    const threatHigh = !!(W.threat && (W.threat.raid || W.threat.alert > 0));
    const reasons = [];
    const targetActions = [];
    let mode = 'optimal';
    let summaryTh = 'ศาสตราและคัมภีร์สอดคล้องกับสายย่อย ' + (subDef ? subDef.nameTh : c.sub);

    if (!hasPreferredWeapon) {
      if (availPrefGear.length > 0) {
        mode = 'upgrade_to_preferred';
        summaryTh = eqWpn
          ? 'ถืออาวุธสำรอง「' + eqWpn.nameTh + '」และพบศาสตราตรงสาย「' + availPrefGear[0].nameTh + '」พร้อมเปลี่ยน'
          : 'พบศาสตราประจำสาย「' + availPrefGear[0].nameTh + '」พร้อมสวมใส่';
        reasons.push('เปลี่ยนจากอาวุธสำรองเป็นศาสตราประจำสายย่อย (' + profWpn.join('/') + ')');
        targetActions.push('shop');
      } else if (!eqWpn && availFallbackGear.length > 0) {
        mode = 'improvise_weapon';
        summaryTh = 'ยังไม่มีศาสตราหลัก (' + profWpn.join('/') + ') จึงพลิกแพลงใช้อาวุธสำรอง「' + availFallbackGear[0].nameTh + '」ไปก่อน';
        reasons.push('พลิกแพลงใช้อาวุธสำรองระหว่างรอศาสตราประจำสาย');
        targetActions.push('shop');
      } else if (craftablePrefRec) {
        mode = 'improvise_craft_weapon';
        summaryTh = 'ยังไม่มีศาสตราประจำสายในคลัง เตรียมหลอม「' + (craftablePrefRec.outNameTh || craftablePrefRec.nameTh) + '」ด้วยตนเอง';
        reasons.push('วางแผนตีศาสตราประจำสายจากตำรับโรงหลอม');
        targetActions.push('forge');
      } else if (eqWpn) {
        mode = 'improvise_weapon';
        summaryTh = 'พลิกแพลงใช้อาวุธสำรอง「' + eqWpn.nameTh + '」ประคองการรบและฝึกฝน';
        reasons.push('พลิกแพลงใช้อาวุธสำรองตามที่มีในสำนัก');
        targetActions.push('practice', 'forge');
      } else {
        mode = 'improvise_unarmed';
        summaryTh = 'ยังไม่มีศาสตราประจำสาย (' + profWpn.join('/') + ') อาศัยปราณและวิชาพื้นฐานประคองตัว';
        reasons.push('ใช้วิชาพื้นฐานและรอโรงหลอมผลิตศาสตรา');
        targetActions.push('forge', 'study');
      }
    }
    if (prefTechs.length === 0 && fallbackTechs.length > 0) {
      if (mode === 'optimal') mode = 'improvise_manual';
      reasons.push('เลือกคัมภีร์ธาตุรอง/วิชาเชื่อมสาย「' + fallbackTechs[0].nameTh + '」ทดแทนคัมภีร์หลัก');
      if (!targetActions.includes('study')) targetActions.push('study');
      if (mode === 'improvise_manual') {
        summaryTh = 'หอคัมภีร์ยังไม่มีวิชาตรงธาตุ/อาวุธหลัก จึงพลิกแพลงศึกษา「' + fallbackTechs[0].nameTh + '」แทน';
      }
    }
    if (pet) {
      reasons.push('ประสานจังหวะรบกับสัตว์อสูรคู่สัญญา「' + pet.nameTh + '」(' + (pet.role || 'FEROCIOUS_ASSAULT') + ')');
    }
    if (threatHigh) {
      reasons.push('ปรับสมดุลเน้นวิชาป้องกัน/ฟื้นฟูเนื่องจากสำนักอยู่ในภาวะเฝ้าระวังภัย');
    }
    return {
      mode,
      hasPreferredWeapon,
      hasPrimaryWeapon,
      preferredWeapons: profWpn.slice(),
      profileElements: subElems.slice(),
      equippedWeaponType: eqType,
      availablePreferredGearId: availPrefGear[0] ? (availPrefGear[0].uid || availPrefGear[0].id) : null,
      availableFallbackGearId: availFallbackGear[0] ? (availFallbackGear[0].uid || availFallbackGear[0].id) : null,
      craftablePreferredRecipeId: craftablePrefRec ? craftablePrefRec.id : null,
      preferredManualCount: prefTechs.length,
      fallbackManualCount: fallbackTechs.length,
      petRole: pet ? (pet.role || 'FEROCIOUS_ASSAULT') : null,
      threatPosture: threatHigh ? 'defensive_alert' : 'normal',
      summaryTh,
      reasons,
      targetActions
    };
  };

  // Find best desirable gear upgrade in sect armory/shop or personal bag with hysteresis
  COG.bestGearUpgrade = (W, n) => {
    const M = g.MARTIAL;
    if (!W || !W.sect || !M || !n || !n.cult) return null;
    const profWpn = (M.PROFILES && M.PROFILES[n.cult.sub] && M.PROFILES[n.cult.sub][3]) || (M.PATHS && M.PATHS[n.cult.path] && M.PATHS[n.cult.path].weapons) || [];
    const curWpn = n.equip && n.equip.WEAPON;
    const curWpnIsFallback = !!(curWpn && !profWpn.includes(M.gearType(curWpn)));
    const minCooldown = curWpnIsFallback ? 180 : 720;
    if (n._lastGearSwapAt && W.t - n._lastGearSwapAt < minCooldown) return null;
    let best = null, bestDelta = 0;
    // 1. Check personal bag first (free immediate equip if useful-now or completes resonance set)
    const bagGear = (n.inv && Array.isArray(n.inv.gear)) ? n.inv.gear : [];
    for (const eq of bagGear) {
      if (!eq || !eq.slot) continue;
      const cl = M.classifyGearForNpc(null, n, eq, 0);
      const resPrev = M.resonanceUpgradePreview ? M.resonanceUpgradePreview(n, eq) : null;
      const resBonus = (resPrev && resPrev.completes) ? (resPrev.nextPieces >= 3 ? 45 : 22) : 0;
      const effDelta = cl.deltaScore + resBonus;
      if ((cl.category === 'useful-now' || (resPrev && resPrev.completes && effDelta > 4)) && effDelta > bestDelta) {
        bestDelta = effDelta;
        best = { source: 'bag', gear: eq, price: 0, deltaScore: effDelta, reasons: cl.suit.reasons, reasonTh: cl.reasonTh, resonancePreview: resPrev };
      }
    }
    if (best) return best;
    // 2. Check sect shop / armory gear
    const effSt = CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage;
    for (const eq of (W.sect.gear || [])) {
      if (!eq || !eq.slot || (eq.minStage || 1) > effSt) continue;
      if (!SECT.canAccessItem(W, n, eq)) continue;
      const price = (g.CPE && g.CPE.gearPrice) ? g.CPE.gearPrice(W, eq) : 20;
      const cl = M.classifyGearForNpc(null, n, eq, price);
      const resPrev = M.resonanceUpgradePreview ? M.resonanceUpgradePreview(n, eq) : null;
      const resBonus = (resPrev && resPrev.completes) ? (resPrev.nextPieces >= 3 ? 45 : 22) : 0;
      const effDelta = cl.deltaScore + resBonus;
      if ((cl.category === 'useful-now' || (resPrev && resPrev.completes && effDelta > 4)) && effDelta > bestDelta) {
        bestDelta = effDelta;
        best = { source: 'shop', gear: eq, price, deltaScore: effDelta, reasons: cl.suit.reasons, reasonTh: cl.reasonTh, resonancePreview: resPrev };
      }
    }
    return best;
  };

  /* ============================================================================
   * 5. MULTI-HORIZON GOALS & REAL MILESTONE PREDICATES
   * ============================================================================ */
  function safe(n) {
    const s = n.h.state;
    const sevInj = Array.isArray(n.inj) && n.inj.some(i => (i.sev || 1) >= 2);
    return !sevInj && s.hp / CULT.hpMax(n) >= 0.35 && s.satiety >= 20 && s.rest >= 8;
  }
  COG.safe = safe;

  function roleNeed(W, n) {
    const r = COG.role(W, n).id, short = (W.sect.shortageDirectives || []).some(d => d.priority === 'critical');
    if (r === 'member') return 0;
    if (r === 'healer') return W.npcs.some(x => !x.dead && !x.away && (x.inj?.length || x.h.state.hp < CULT.hpMax(x) * 0.5)) ? 1 : 0.1;
    if (r === 'guard' || r === 'martial' || r === 'commander') return W.threat?.raid || W.threat?.alert > 0 ? 1 : 0.15;
    if (r === 'alchemy') return (W.sect.shortageDirectives || []).some(d => d.kind === 'medicine') ? 0.8 : 0.15;
    if (r === 'forge') return (W.sect.needSummary ? ECO.needSummary(W).noWeapon > 0 : false) ? 0.65 : 0.15;
    if (r === 'provision') return ECO.count(W, 'meal') < W.npcs.length * 3 ? 0.85 : 0.15;
    if (r === 'herbal') return (W.sect.shortageDirectives || []).some(d => ECO.matById[d.id]?.category === 'HERB') ? 0.75 : 0.15;
    if (r === 'treasury' || r === 'master' || r === 'deputy') return short ? 0.9 : 0.2;
    return 0.2;
  }

  function snapshotForGoal(W, n, goal) {
    const t = goal.id === 'scripture' && goal.targetId ? CULT.tech(goal.targetId) : null;
    const price = t && g.CPE ? g.CPE.techPrice(W, t) : (goal.price || 0);
    const tgtNpc = goal.targetId && W.byId ? W.byId[goal.targetId] : null;
    const rel = tgtNpc && n.h.mind.relations ? n.h.mind.relations[tgtNpc.id] : null;
    const shortDir = (W.sect.shortageDirectives || []).find(d => d.id === goal.targetId);
    let bnSkillSum = 0;
    if (goal.id === 'track_bottleneck' && n.cult && n.cult.track && CULT.checkTrackGates) {
      const tg = CULT.checkTrackGates(W, n);
      if (tg && Array.isArray(tg.missingSkills)) {
        for (let i = 0; i < tg.missingSkills.length; i++) bnSkillSum += tg.missingSkills[i].current || 0;
      }
    }
    return {
      cp: n.cp || 0,
      stones: (n.inv && n.inv.stones) || 0,
      bnSkillSum,
      price,
      stage: n.cult ? n.cult.stage : 0,
      prog: n.cult ? n.cult.prog : 0,
      learningGot: (n.cult && n.cult.learning) ? n.cult.learning.got : 0,
      crafted: n.stats?.crafted || 0,
      lastDuty: (W.sect.lastDuty && W.sect.lastDuty[n.id]) || 0,
      deficit: shortDir ? shortDir.deficit : 0,
      relN: rel ? (rel.n || 0) : 0,
      relA: rel ? (rel.a || 0) : 0,
      tgtHp: tgtNpc ? tgtNpc.h.state.hp : 0,
      gearUid: (goal.slot && n.equip && n.equip[goal.slot]) ? (n.equip[goal.slot].uid || n.equip[goal.slot].id) : null
    };
  }

  function computeGoalStep(W, n, goal) {
    if (!goal) return { step: 'none', stepTitle: 'รอดำเนินการ', missingPrereq: null, actions: [] };
    if (goal.id === 'recovery') {
      return { step: 'recover', stepTitle: 'พักรักษาตัวและฟื้นฟูกำลัง', missingPrereq: null, actions: ['heal', 'personalPillUse', 'eat', 'sleep'] };
    }
    if (goal.id === 'scripture') {
      const t = CULT.tech(goal.targetId);
      if (!t) return { step: 'invalid', stepTitle: 'ไม่พบคัมภีร์เป้าหมาย', missingPrereq: 'ไม่พบคัมภีร์', actions: [] };
      const cap = Math.min(CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : (n.cult?.stage || 1), SECT.canLearnTier(W, n));
      if ((t.reqTier || t.tier || 1) > cap) {
        return { step: 'seek_access', stepTitle: 'สะสมผลงาน/ตบะเพื่อขอสิทธิ์เข้าถึงคัมภีร์', missingPrereq: 'ต้องการสิทธิ์หอคัมภีร์/ขั้นตบะระดับ ' + (t.reqTier || t.tier), actions: ['cultivate', 'duty', 'forage'] };
      }
      if (n.cult && n.cult.learning && n.cult.learning.id === goal.targetId) {
        return { step: 'study', stepTitle: 'ศึกษาคัมภีร์ให้สำเร็จ (' + Math.round((n.cult.learning.got / Math.max(1, n.cult.learning.need)) * 100) + '%)', missingPrereq: null, actions: ['study', 'guidedStudy'] };
      }
      const price = g.CPE ? g.CPE.techPrice(W, t) : 0;
      if ((n.cp || 0) < price) {
        const deficit = Math.ceil(price - (n.cp || 0));
        return { step: 'earn_cp', stepTitle: 'หาแต้มคุณูปการเพิ่มอีก ' + deficit + ' คป. เพื่อเรียนวิชา', missingPrereq: 'ขาดแต้มคุณูปการ ' + deficit + ' คป. (มี ' + Math.round(n.cp || 0) + '/' + price + ')', actions: INCOME };
      }
      return { step: 'study', stepTitle: 'เข้าหอคัมภีร์เพื่อเริ่มศึกษา ' + t.nameTh, missingPrereq: null, actions: ['study', 'guidedStudy'] };
    }
    if (goal.id === 'gear_upgrade') {
      const inBag = (n.inv && Array.isArray(n.inv.gear)) ? n.inv.gear.find(g2 => g2 && (g2.uid === goal.targetId || g2.id === goal.targetId)) : null;
      if (inBag) {
        return { step: 'equip_gear', stepTitle: 'สวมใส่「' + inBag.nameTh + '」จากถุงส่วนตัว', missingPrereq: null, actions: ['practice', 'idle'] };
      }
      const inShop = (W.sect.gear || []).find(g2 => g2 && (g2.uid === goal.targetId || g2.id === goal.targetId));
      if (!inShop) {
        return { step: 'craft_or_wait', stepTitle: 'รอโรงหลอมผลิตหรือหาอุปกรณ์ทดแทน', missingPrereq: 'อุปกรณ์เป้าหมายไม่อยู่ในคลังแล้ว', actions: ['forge', 'shop'] };
      }
      const price = g.CPE ? g.CPE.gearPrice(W, inShop) : 20;
      if ((n.cp || 0) < price) {
        const deficit = Math.ceil(price - (n.cp || 0));
        return { step: 'earn_cp', stepTitle: 'สะสมแต้มอีก ' + deficit + ' คป. เพื่อแลก「' + inShop.nameTh + '」', missingPrereq: 'ขาดแต้มคุณูปการ ' + deficit + ' คป. (มี ' + Math.round(n.cp || 0) + '/' + price + ')', actions: INCOME };
      }
      return { step: 'buy_gear', stepTitle: 'ไปร้านค้าสำนักเพื่อแลก「' + inShop.nameTh + '」', missingPrereq: null, actions: ['shop'] };
    }
    if (goal.id === 'craft') {
      const r = ECO.recipeById[goal.targetId];
      if (!r) return { step: 'invalid', stepTitle: 'ไม่พบตำรับ', missingPrereq: 'ไม่พบตำรับ', actions: [] };
      const quote = r.outType === 'PILL' ? ECO.personalCraftQuote(W, n, r) : null;
      if (quote && quote.owned.length > 0) {
        return { step: 'brew', stepTitle: 'ลงมือปรุง「' + r.outNameTh + '」ที่หอโอสถ', missingPrereq: null, actions: ['personalBrew', 'brew', 'brewBasic'] };
      }
      if (ECO.inputsOk(W, r)) {
        return { step: 'hall_craft', stepTitle: 'ผลิต「' + r.outNameTh + '」ตามวัตถุดิบคลัง', missingPrereq: null, actions: [r.craft === 'ALCHEMY' ? 'brew' : 'forge', 'brewBasic', 'personalBrew'] };
      }
      return { step: 'gather_input', stepTitle: 'รวบรวมวัตถุดิบสำหรับ「' + r.outNameTh + '」', missingPrereq: 'ขาดวัตถุดิบหรือแต้มแลกส่วนผสม', actions: ['forage', 'farm', 'mine', 'personalBrew', 'donate'] };
    }
    if (goal.id === 'track_bottleneck') {
      if (n.inj && n.inj.some(i => (i.sev || 1) >= 2)) {
        return { step: 'recover_injury', stepTitle: 'รักษาอาการบาดเจ็บหนักก่อนฝึกทะลวงคอขวดต่อ', missingPrereq: 'อาการบาดเจ็บหนักขัดขวางการฝึกฝน', actions: ['heal', 'personalPillUse', 'shop'] };
      }
      const bn = (CULT.inspectProgressionBottleneck && n.cult) ? CULT.inspectProgressionBottleneck(W, n) : null;
      const trInfo = bn && bn.track;
      if (!trInfo || !trInfo.active || trInfo.gateOk) {
        return { step: 'ready', stepTitle: 'ผ่านเงื่อนไขคอขวดสายเฉพาะทางแล้ว', missingPrereq: null, actions: ['cultivate'] };
      }
      const acts = trInfo.feasibleActions.slice();
      return {
        step: !acts.length ? 'blocked_impossible' : (trInfo.primarySkillToTrain ? 'train_gate_skill' : 'acquire_gate_stones'),
        stepTitle: trInfo.statusTh || goal.title,
        missingPrereq: trInfo.blockerReasonTh || (trInfo.missingSkills.length ? trInfo.missingSkills.map(m => m.skill + ' ' + Math.floor(m.current) + '/' + m.required).join(', ') : ('STONES ' + Math.floor(trInfo.missingStones.currentPersonal) + '/' + trInfo.missingStones.required)),
        actions: acts
      };
    }
    if (goal.id === 'breakthrough') {
      if (n.cult && CULT.ready(n)) {
        if (n.h.state.hp < CULT.hpMax(n) * 0.7 || (n.inj && n.inj.length)) {
          return { step: 'prepare_body', stepTitle: 'ฟื้นฟูร่างกายให้พร้อมก่อนปิดด่านทะลวงขั้น', missingPrereq: 'ร่างกายยังไม่สมบูรณ์สำหรับทะลวงขั้น', actions: ['heal', 'personalPillUse', 'sleep'] };
        }
        const bn = CULT.inspectProgressionBottleneck ? CULT.inspectProgressionBottleneck(W, n) : null;
        if (bn && bn.major && bn.major.plan === 'wait' && bn.major.feasibleActions.length) {
          return { step: 'consolidate_gate', stepTitle: bn.major.statusTh || 'เตรียมฐานปราณและโอสถก่อนทะลวงขั้น', missingPrereq: bn.major.blockerReasonTh || null, actions: bn.major.feasibleActions };
        }
        return { step: 'seclude', stepTitle: 'เข้าปิดด่านทะลวงสู่ขั้นถัดไป', missingPrereq: null, actions: ['breakthrough', 'consolidate', 'shop', 'pray'] };
      }
      return { step: 'accumulate_qi', stepTitle: 'บำเพ็ญสั่งสมปราณให้ถึงคอขวด', missingPrereq: n.cult ? ('ตบะ ' + Math.round(n.cult.prog) + '/' + CULT.threshold(n)) : null, actions: ['cultivate', 'paidTraining', 'shop', 'pray'] };
    }
    if (goal.id === 'rival') {
      return { step: 'train_power', stepTitle: 'ขัดเกลาฝีมือและตบะเพื่อก้าวข้ามคู่แข่ง', missingPrereq: null, actions: TRAIN };
    }
    if (goal.id === 'service') {
      const planActs = W.sect.officePlans && W.sect.officePlans[goal.targetId]?.actions;
      return { step: 'perform_duty', stepTitle: 'ปฏิบัติงานในหน้าที่และกำกับดูแลหอ', missingPrereq: null, actions: Array.from(new Set(['duty'].concat(planActs || []))) };
    }
    if (goal.id === 'crisis') {
      const acts = goal.targetId === 'meal' ? ['cook', 'farm'] : goal.targetId === 'grain' ? ['farm'] : goal.source === 'alchemy' ? ['brew', 'brewBasic', 'forage'] : ['forage', 'donate', 'mine', 'farm'];
      return { step: 'resolve_shortage', stepTitle: 'เร่งผลิต/จัดหาของที่สำนักขาดแคลน', missingPrereq: null, actions: acts };
    }
    if (goal.id === 'help_friend') {
      const p = helpCandidate(W, n, goal.targetId);
      if (p) return { step: 'deliver_medicine', stepTitle: 'นำโอสถไปมอบให้สหายที่บาดเจ็บ', missingPrereq: null, actions: ['shareMedicine', 'giftItem'] };
      return { step: 'obtain_remedy', stepTitle: 'จัดหาโอสถรักษาเพื่อนำไปช่วยสหาย', missingPrereq: 'ยังไม่มีโอสถรักษาในถุงส่วนตัว', actions: ['personalBrew', 'shop', 'brewBasic'] };
    }
    if (goal.id === 'mentor_disciple') {
      return { step: 'teach_student', stepTitle: 'ชี้แนะเคล็ดวิชาและทักษะให้ศิษย์/รุ่นน้อง', missingPrereq: null, actions: ['pair', 'duty'] };
    }
    if (goal.id === 'social_bond') {
      return { step: 'build_rapport', stepTitle: 'พูดคุยแลกเปลี่ยนและใช้เวลาร่วมกับมิตรสหาย', missingPrereq: null, actions: ['pair', 'leisure', 'giftItem'] };
    }
    if (goal.id === 'investigate_clue') {
      const inst = W.world && W.world.clues && W.world.clues.active && W.world.clues.active[goal.targetId];
      if (!inst || ['claimed', 'disproven', 'abandoned', 'expired'].includes(inst.status)) {
        return { step: 'done', stepTitle: 'การสืบเบาะแสสิ้นสุดลงแล้ว', missingPrereq: null, actions: [] };
      }
      return { step: 'investigate', stepTitle: 'สืบค้นและคลี่คลายเบาะแส「' + inst.titleTh + '」', missingPrereq: null, actions: ['investigateClueLocal', 'meetVisitor', 'practice', 'study', 'cultivate'] };
    }
    return { step: 'active', stepTitle: goal.title, missingPrereq: null, actions: REST };
  }

  function complete(W, n, goal) {
    if (!goal || goal.expiresAt <= W.t || W.t - (goal.lastProgress ?? goal.createdAt) > 3 * 1440) return true;
    if (goal.id === 'scripture') return !n.cult || n.cult.techs.includes(goal.targetId) || !W.sect.library.includes(goal.targetId) || !CULT.learnable(n, [goal.targetId]).length;
    if (goal.id === 'gear_upgrade') {
      if (!n.cult) return true;
      const cur = n.equip && n.equip[goal.slot || 'WEAPON'];
      if (cur && (cur.uid === goal.targetId || cur.id === goal.targetId)) return true;
      const stillInBag = n.inv && Array.isArray(n.inv.gear) && n.inv.gear.some(g2 => g2 && (g2.uid === goal.targetId || g2.id === goal.targetId));
      const stillInShop = (W.sect.gear || []).some(g2 => g2 && (g2.uid === goal.targetId || g2.id === goal.targetId));
      return !stillInBag && !stillInShop;
    }
    if (goal.id === 'rival') return !W.byId[goal.targetId] || W.byId[goal.targetId].dead || W.byId[goal.targetId].exiled || CULT.power(n) > CULT.power(W.byId[goal.targetId]) * 1.15;
    if (goal.id === 'craft') return !ECO.recipeById[goal.targetId] || (n.stats?.crafted || 0) > (goal.startCrafted ?? 0);
    if (goal.id === 'track_bottleneck') return !n.cult || !n.cult.track || n.cult.track.ordinal > (goal.startOrdinal ?? n.cult.track.ordinal) || !!(CULT.checkTrackGates && CULT.checkTrackGates(W, n).ok);
    if (goal.id === 'breakthrough') return !n.cult || n.cult.stage > (goal.startStage ?? n.cult.stage);
    if (goal.id === 'service') return (W.sect.lastDuty[n.id] || 0) > goal.createdAt || COG.role(W, n).id !== goal.targetId;
    if (goal.id === 'crisis') return !(W.sect.shortageDirectives || []).some(d => d.id === goal.targetId && d.deficit > 0);
    if (goal.id === 'recovery') return safe(n) && n.h.state.hp >= CULT.hpMax(n) * 0.8 && n.h.state.rest >= 40;
    if (goal.id === 'help_friend') {
      const f = W.byId[goal.targetId];
      return !f || f.dead || f.away || f.h.state.hp >= CULT.hpMax(f) * 0.72 || (n.cognition?.memory || []).some(m => m.kind === 'gave_help' && m.subjectId === goal.targetId && m.at > goal.createdAt);
    }
    if (goal.id === 'mentor_disciple') {
      const s = W.byId[goal.targetId];
      const rel = s && n.h.mind.relations && n.h.mind.relations[s.id];
      return !s || s.dead || s.away || (n.stats?.taughtCount || 0) > (goal.startTaught || 0) || (rel && rel.last > goal.createdAt && (rel.n || 0) > (goal.startRelN || 0));
    }
    if (goal.id === 'social_bond') {
      const f = W.byId[goal.targetId];
      const rel = f && n.h.mind.relations && n.h.mind.relations[f.id];
      return !f || f.dead || f.exiled || (rel && ((rel.n || 0) >= (goal.startRelN || 0) + 2 || (rel.a || 0) >= (goal.startRelA || 0) + 4));
    }
    if (goal.id === 'investigate_clue') {
      const inst = W.world && W.world.clues && W.world.clues.active && W.world.clues.active[goal.targetId];
      return !inst || ['claimed', 'disproven', 'abandoned', 'expired'].includes(inst.status) || (inst.currentNodeIdx || 0) > (goal.startNodeIdx || 0);
    }
    return false;
  }

  function isGenuineGoalSuccess(W, n, goal) {
    if (!goal) return false;
    if (goal.id === 'scripture') return !!(n.cult && n.cult.techs.includes(goal.targetId));
    if (goal.id === 'gear_upgrade') {
      const cur = n.equip && n.equip[goal.slot || 'WEAPON'];
      return !!(cur && (cur.uid === goal.targetId || cur.id === goal.targetId));
    }
    if (goal.id === 'rival') return !!(W.byId[goal.targetId] && !W.byId[goal.targetId].dead && CULT.power(n) > CULT.power(W.byId[goal.targetId]) * 1.15);
    if (goal.id === 'craft') return (n.stats?.crafted || 0) > (goal.startCrafted ?? 0);
    if (goal.id === 'track_bottleneck') return !!(n.cult && n.cult.track && (n.cult.track.ordinal > (goal.startOrdinal ?? 99) || (CULT.checkTrackGates && CULT.checkTrackGates(W, n).ok)));
    if (goal.id === 'breakthrough') return !!(n.cult && n.cult.stage > (goal.startStage ?? 99));
    if (goal.id === 'service') return (W.sect.lastDuty[n.id] || 0) > goal.createdAt;
    if (goal.id === 'crisis') return !(W.sect.shortageDirectives || []).some(d => d.id === goal.targetId && d.deficit > 0);
    if (goal.id === 'recovery') return safe(n) && n.h.state.hp >= CULT.hpMax(n) * 0.8;
    if (goal.id === 'help_friend') return !!(W.byId[goal.targetId] && (W.byId[goal.targetId].h.state.hp >= CULT.hpMax(W.byId[goal.targetId]) * 0.72 || (n.cognition?.memory || []).some(m => m.kind === 'gave_help' && m.subjectId === goal.targetId && m.at > goal.createdAt)));
    if (goal.id === 'mentor_disciple') return (n.stats?.taughtCount || 0) > (goal.startTaught || 0);
    if (goal.id === 'social_bond') {
      const f = W.byId[goal.targetId], rel = f && n.h.mind.relations && n.h.mind.relations[f.id];
      return !!(rel && ((rel.n || 0) >= (goal.startRelN || 0) + 2 || (rel.a || 0) >= (goal.startRelA || 0) + 4));
    }
    if (goal.id === 'investigate_clue') {
      const inst = W.world && W.world.clues && W.world.clues.active && W.world.clues.active[goal.targetId];
      return !!(inst && (inst.status === 'claimed' || (inst.currentNodeIdx || 0) > (goal.startNodeIdx || 0)));
    }
    return false;
  }

  COG.prepare = (W, n) => {
    const c = COG.ensure(n), r = COG.role(W, n);
    if (c.lastRoleId && c.lastRoleId !== r.id) {
      c.lastRoleId = r.id;
      c.nextReview = 0;
      if (r.id !== 'member' && c.goal && ['social_bond'].includes(c.goal.id) && (E(n, 'values.sectDuty') + E(n, 'personality.loyalty')) >= 95) {
        c.goal.expiresAt = W.t;
      }
    } else {
      c.lastRoleId = r.id;
    }
    c.office = r;
    const asp = COG.ensureAspiration(W, n);
    COG.perceive(W, n, false);

    // Auto-use compatible personal crystals or personal manuals in bag when safe and not fighting
    if (n.cult && n.inv && !(n.act && n.act.id === 'fight')) {
      let hasCrys = false;
      if (n.inv.crystals) { for (const _k in n.inv.crystals) { hasCrys = true; break; } }
      const tKeys = (n.inv.techs && n.inv.techs.length) ? n.inv.techs : null;
      if ((hasCrys || tKeys) && safe(n)) {
        const cKeys = hasCrys ? Object.keys(n.inv.crystals) : [];
        const kSig = cKeys.length + ':' + (tKeys ? tKeys.length : 0) + ':' + n.cult.stage + ':' + (n.cult.sub || '');
        if (n._bagKnowSig !== kSig) {
          n._bagKnowSig = kSig;
          if (cKeys.length && g.MARTIAL && g.MARTIAL.eligible && g.MARTIAL.useCrystal) {
            for (const key of cKeys) {
              if ((n.inv.crystals[key] || 0) > 0 && g.MARTIAL.eligible(n, key).ok && g.MARTIAL.knowledgeFit(n, key) >= 48) {
                g.MARTIAL.useCrystal(W, n, key);
                n._bagKnowSig = '';
                break;
              }
            }
          }
          if (tKeys && tKeys.length && SECT.EDITOR && SECT.EDITOR.usePersonalItem) {
            const effSt = CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage;
            for (const tid of tKeys.slice()) {
              const tObj = CULT.tech(tid);
              if (tObj && (tObj.reqTier || tObj.tier || 1) <= effSt && CULT.learnable(n, [tid]).length > 0 && (W.sect.library.includes(tid) || E(n, 'personality.loyalty') < 52)) {
                SECT.EDITOR.usePersonalItem(W, n.id, 'TECH_MANUAL', tid);
                n._bagKnowSig = '';
                break;
              }
            }
          }
        }
      }
    }

    // Auto-equip personal bag gear if it is an immediate useful upgrade
    if (n.cult && n.inv && Array.isArray(n.inv.gear) && n.inv.gear.length && !(n.act && n.act.id === 'fight') && SECT.EDITOR && SECT.EDITOR.equipPersonalGear) {
      const gLen = n.inv.gear.length, gLast = n.inv.gear[gLen - 1], cSt = n.cult.stage;
      if (n._bagChkLen !== gLen || n._bagChkLast !== gLast || n._bagChkSt !== cSt) {
        n._bagChkLen = gLen; n._bagChkLast = gLast; n._bagChkSt = cSt;
        for (const eq of n.inv.gear.slice()) {
          const cl = g.MARTIAL && g.MARTIAL.classifyGearForNpc ? g.MARTIAL.classifyGearForNpc(null, n, eq, 0) : null;
          if (cl && cl.category === 'useful-now') {
            SECT.EDITOR.equipPersonalGear(W, n.id, eq.uid || eq.id);
            n._lastGearSwapAt = W.t;
            n._bagChkLen = -1;
            break;
          }
        }
      }
    }

    // 1. Emergency suspension: if unsafe and currently holding a non-recovery goal, suspend it instead of losing it
    if (!safe(n) && c.goal && c.goal.id !== 'recovery') {
      c.suspendedGoal = Object.assign({}, c.goal, { suspendedAt: W.t, suspendReason: 'ระงับชั่วคราวเพื่อฟื้นฟูร่างกายเร่งด่วน' });
      c.goal = {
        id: 'recovery',
        title: 'ฟื้นร่างกายก่อนตัดสินใจเรื่องอื่น',
        targetId: null,
        createdAt: W.t,
        expiresAt: W.t + 3 * 1440,
        lastProgress: W.t,
        blocked: 0,
        status: 'active',
        step: 'recover',
        stepTitle: 'พักรักษาตัวและฟื้นฟูกำลัง'
      };
      return c;
    }

    // 2. Check completion or expiry of current goal
    if (c.goal && complete(W, n, c.goal)) {
      const won = isGenuineGoalSuccess(W, n, c.goal);
      const outcomeStatus = won ? 'completed' : (c.goal.expiresAt <= W.t || W.t - (c.goal.lastProgress ?? c.goal.createdAt) > 3 * 1440) ? 'expired' : 'invalid_target';
      c.lastGoal = { id: c.goal.id, title: c.goal.title, targetId: c.goal.targetId || null, endedAt: W.t, status: outcomeStatus };
      if (won && c.goal.id !== 'recovery') {
        COG.recordAspirationMilestone(W, n, 'สำเร็จเป้าหมาย「' + c.goal.title + '」', 12);
      }
      c.goal = null;
      c.nextReview = 0;

      // Resume suspended goal if safe and suspended goal is still valid!
      if (safe(n) && c.suspendedGoal) {
        const sg = c.suspendedGoal;
        c.suspendedGoal = null;
        const pausedDur = Math.max(0, W.t - (sg.suspendedAt || W.t));
        sg.expiresAt = (sg.expiresAt || W.t + 5 * 1440) + pausedDur;
        sg.lastProgress = W.t;
        sg.blocked = 0;
        delete sg.suspendedAt;
        delete sg.suspendReason;
        if (!complete(W, n, sg)) {
          const stInfo = computeGoalStep(W, n, sg);
          sg.step = stInfo.step;
          sg.stepTitle = stInfo.stepTitle;
          sg.missingPrereq = stInfo.missingPrereq;
          sg.status = stInfo.missingPrereq ? 'blocked_prereq' : 'active';
          sg.progressSnap = snapshotForGoal(W, n, sg);
          c.goal = sg;
          return c;
        }
      }
    }

    // Update active goal's current step & prerequisite status
    if (c.goal) {
      if (!c.goal.step || W.t - (c.goal._stepAt || -999) >= 60) {
        const stInfo = computeGoalStep(W, n, c.goal);
        c.goal.step = stInfo.step;
        c.goal.stepTitle = stInfo.stepTitle;
        c.goal.missingPrereq = stInfo.missingPrereq;
        c.goal.status = stInfo.missingPrereq ? 'blocked_prereq' : 'active';
        c.goal._stepAt = W.t;
      }
      if (!c.goal.progressSnap) c.goal.progressSnap = snapshotForGoal(W, n, c.goal);
      return c;
    }

    const hasUrgentTrackBn = !!(n.cult && n.cult.track && CULT.trackReady && CULT.trackReady(n) && CULT.checkTrackGates && !CULT.checkTrackGates(W, n).ok && W.t - (c._lastUrgentBnAt || -999) >= 60);
    if (W.t < (c.nextReview || 0) && !hasUrgentTrackBn && safe(n)) return c;
    if (hasUrgentTrackBn) c._lastUrgentBnAt = W.t;
    c.nextReview = W.t + 180;

    const options = [];
    const aspBoost = id => (asp && ASPIRATIONS[asp.id] && ASPIRATIONS[asp.id].prefGoals.includes(id)) ? 0.38 : 0;
    const add = (id, title, weight, targetId, extra) => {
      if (weight > 0) options.push({ id, title, weight: weight + aspBoost(id), targetId, ...extra });
    };

    if (!safe(n)) {
      add('recovery', 'ฟื้นร่างกายก่อนตัดสินใจเรื่องอื่น', 20, null);
    } else {
      if (r.id !== 'member') {
        add('service', 'รับผิดชอบงาน' + r.title, 0.2 + (E(n, 'values.sectDuty') + E(n, 'personality.discipline') + E(n, 'personality.loyalty')) / 200 + roleNeed(W, n), r.id);
      }
      const crisis = (W.sect.shortageDirectives || []).find(d => d.priority === 'critical' && d.deficit > 0);
      if (crisis) {
        add('crisis', 'ช่วยสำนักแก้การขาด ' + (crisis.nameTh || ECO.name(crisis.id)), Math.max(0, (E(n, 'values.sectDuty') + E(n, 'personality.empathy') + E(n, 'personality.loyalty') - 130) / 100), crisis.id, { source: crisis.source });
      }
      // Help injured friend goal (check empathy first, and relationScore before hpMax!)
      if (E(n, 'personality.empathy') >= 48) {
        const relMap = n.h.mind.relations || {}; const injuredFriend = W.npcs.find(x => x && x.id !== n.id && !x.dead && !x.away && relMap[x.id] && SECT.relationScore(n, x) >= 25 && x.h.state.hp < CULT.hpMax(x) * 0.55);
        if (injuredFriend) {
          add('help_friend', 'หาโอสถช่วยรักษา ' + injuredFriend.h.name.given, 0.25 + (E(n, 'personality.empathy') + Math.max(0, SECT.relationScore(n, injuredFriend))) / 180, injuredFriend.id);
        }
      }
      // Investigate known actionable clue goal (Item 9)
      if (g.VC && g.VC.pickActionableClueForNpc) {
        const cluePick = g.VC.pickActionableClueForNpc(W, n);
        if (cluePick && cluePick.inst) {
          add('investigate_clue', 'สืบเบาะแส「' + cluePick.inst.titleTh + '」', 0.28 + (E(n, 'personality.curiosity') + E(n, 'personality.ambition')) / 190, cluePick.inst.instanceId, { startNodeIdx: cluePick.inst.currentNodeIdx || 0 });
        }
      }
      // Mentor disciple goal
      if (n.rank >= 3 && E(n, 'social.teaching') >= 42) {
        const discId = (n.h.life.family.disciples || []).find(id => W.byId[id] && !W.byId[id].dead && !W.byId[id].away);
        const relMap2 = n.h.mind.relations || {}; const junior = discId ? W.byId[discId] : W.npcs.find(x => !x.dead && !x.away && x.rank < n.rank && x.cult && n.cult && x.cult.path === n.cult.path && relMap2[x.id] && SECT.relationScore(n, x) >= 15);
        if (junior) {
          const rel = n.h.mind.relations[junior.id] || {};
          add('mentor_disciple', 'ชี้แนะวิชาแก่ ' + junior.h.name.given, 0.22 + (E(n, 'social.teaching') + E(n, 'interests.teaching')) / 190, junior.id, { startTaught: n.stats?.taughtCount || 0, startRelN: rel.n || 0 });
        }
      }
      // Peaceful social bond goal
      if (asp && asp.id === 'peaceful_companion') {
        const relMap3 = n.h.mind.relations || {}; const friend = W.npcs.find(x => x && x.id !== n.id && !x.dead && !x.away && relMap3[x.id] && SECT.relationScore(n, x) >= 10);
        if (friend) {
          const rel = n.h.mind.relations[friend.id] || {};
          add('social_bond', 'กระชับมิตรไมตรีกับ ' + friend.h.name.given, 0.35 + E(n, 'values.familyClan') / 180, friend.id, { startRelN: rel.n || 0, startRelA: rel.a || 0 });
        }
      }
      if (n.cult) {
        if (n.cult.bn || CULT.ready(n)) {
          add('breakthrough', 'เตรียมตัวก้าวข้ามขอบเขต', 0.3 + E(n, 'values.martialPeak') / 80 + E(n, 'personality.ambition') / 180, null, { startStage: n.cult.stage });
        }
        if (n.cult.track && n.cult.track.ordinal < 9 && (CULT.trackReady(n) || n.cult.track.prog >= CULT.trackThreshold(n) * 0.70)) {
          const tg = CULT.checkTrackGates(W, n);
          if (!tg.ok) {
            const drive = (g.MARTIAL && g.MARTIAL.bottleneckSkillDrive) ? g.MARTIAL.bottleneckSkillDrive(n) : 1;
            const tgtSk = tg.missingSkills && tg.missingSkills[0] ? tg.missingSkills[0].skill : 'STONES';
            add('track_bottleneck', 'แก้คอขวดสายเฉพาะทาง (' + (tg.reason || tgtSk) + ')', (tg.readyToAdvance ? 0.65 : 0.42) + drive * 0.95, tgtSk, { startOrdinal: n.cult.track.ordinal });
          }
        }
        const cap = Math.min(CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage, SECT.canLearnTier(W, n));
        const visibleLib = COG.visibleLibraryFor(W, n);
        const eqW0 = n.equip ? n.equip.WEAPON : null;
        let blc = BLT_CACHE.get(n);
        let bestTech = null;
        const rat0 = n.h.personality.rationality, mLen0 = n.mods ? n.mods.length : 0;
        if (blc && blc.libLen === visibleLib.length && blc.cap === cap && blc.sub === n.cult.sub && blc.tl === n.cult.techs.length && blc.rat === rat0 && blc.mLen === mLen0 && blc.eqW === eqW0 && (!blc.bestTech || !n.cult.techs.includes(blc.bestTech.id))) {
          bestTech = blc.bestTech;
        } else {
          const eligible = CULT.learnable(n, visibleLib).map(CULT.tech).filter(t => t && (t.reqTier || t.tier) <= cap && g.CPE.techPrice(W, t) > 0);
          let bestPref = -1e9;
          for (let i = 0; i < eligible.length; i++) {
            const p = COG.techPreference(n, eligible[i]);
            if (p > bestPref) { bestPref = p; bestTech = eligible[i]; }
          }
          BLT_CACHE.set(n, { libLen: visibleLib.length, cap, sub: n.cult.sub, tl: n.cult.techs.length, rat: rat0, mLen: mLen0, eqW: eqW0, bestTech });
        }
        const eligible = [bestTech];
        if (eligible[0]) {
          const fc = COG.forecast(W, n, 'affordability', { price: g.CPE.techPrice(W, eligible[0]) });
          if (!fc || fc.ok || fc.daysNeeded <= 35) {
            add('scripture', 'ตั้งใจเรียน ' + eligible[0].nameTh, 0.2 + (E(n, 'personality.curiosity') + E(n, 'values.knowledgeCraft') + E(n, 'interests.scholarship')) / 160, eligible[0].id);
          }
        }
        // Equipment upgrade goal
        const gearUp = COG.bestGearUpgrade(W, n);
        if (gearUp && gearUp.gear) {
          const fcG = COG.forecast(W, n, 'affordability', { price: gearUp.price });
          if (!fcG || fcG.ok || fcG.daysNeeded <= 30) {
            add('gear_upgrade', 'จัดหา' + gearUp.gear.nameTh + 'คู่กาย', 0.22 + (E(n, 'values.martialPeak') + E(n, 'interests.combat')) / 190, gearUp.gear.uid || gearUp.gear.id, { slot: gearUp.gear.slot, price: gearUp.price });
          }
        }
        const recipes = [...(n.inv.recipes || []), ...(n.recipes || [])].map(id => ECO.recipeById[id]).filter(r2 => r2 && r2.craft === 'ALCHEMY' && r2.inputs.some(i => (n.inv.mats[i.matId] || 0) > 0));
        if (recipes[0]) {
          add('craft', 'เก็บส่วนผสมเพื่อปรุง ' + recipes[0].nameTh, 0.2 + (E(n, 'interests.alchemy') + E(n, 'values.knowledgeCraft')) / 120, recipes[0].id, { startCrafted: n.stats?.crafted || 0 });
        }
        const rival = Object.entries(n.h.mind.relations || {}).find(([id, v]) => ['คู่แข่ง', 'ศัตรู'].includes(v.bond) && W.byId[id] && !W.byId[id].dead);
        if (rival && CULT.power(W.byId[rival[0]]) >= CULT.power(n)) {
          add('rival', 'ฝึกฝนเพื่อก้าวข้าม ' + W.byId[rival[0]].h.name.given, Math.max(0, (E(n, 'personality.pride') + E(n, 'personality.ambition') - 100) / 65), rival[0]);
        }
      }
    }
    options.push({ id: 'none', weight: 1.2 + E(n, 'values.freedom') / 100 });
    const chosen = options.length === 1 ? options[0] : W.rng.weighted(options, x => x.weight);
    if (chosen.id !== 'none') {
      const gObj = {
        id: chosen.id,
        title: chosen.title,
        targetId: chosen.targetId || null,
        source: chosen.source || null,
        slot: chosen.slot || null,
        price: chosen.price || 0,
        createdAt: W.t,
        expiresAt: W.t + 7 * 1440,
        lastProgress: W.t,
        startStage: chosen.startStage ?? null,
        startOrdinal: chosen.startOrdinal ?? null,
        startCrafted: chosen.startCrafted ?? null,
        startTaught: chosen.startTaught ?? null,
        startRelN: chosen.startRelN ?? null,
        startRelA: chosen.startRelA ?? null,
        startNodeIdx: chosen.startNodeIdx ?? 0,
        blocked: 0
      };
      const stInfo = computeGoalStep(W, n, gObj);
      gObj.step = stInfo.step;
      gObj.stepTitle = stInfo.stepTitle;
      gObj.missingPrereq = stInfo.missingPrereq;
      gObj.status = stInfo.missingPrereq ? 'blocked_prereq' : 'active';
      gObj.progressSnap = snapshotForGoal(W, n, gObj);
      c.goal = gObj;
    }
    return c;
  };

  /* ============================================================================
   * 6. UTILITY MODIFIERS & TRUE PROGRESS VERIFICATION
   * ============================================================================ */
  const ROLE_RELEVANT_ACTS = {
    commander: ['duty', 'practice', 'guard'], provision: ['cook', 'farm'], herbal: ['farm', 'forage'],
    wildwarden: ['guard', 'wildHunt'], steward: ['duty'], alchemy: ['brew', 'brewBasic'],
    forge: ['forge'], scripture: ['study', 'guidedStudy'], martial: ['practice', 'pair'],
    guard: ['guard'], healer: ['duty', 'shareMedicine'], mission: ['duty'], treasury: ['duty'],
    registry: ['duty'], discipline: ['duty'], disciples: ['duty', 'pair'], master: ['duty'], deputy: ['duty'],
    envoy: ['duty'], spymaster: ['duty', 'investigateClueLocal'], beastmaster: ['duty', 'guard'], arraymaster: ['duty', 'forge'], censor: ['duty'], quartermaster: ['duty']
  };
  COG.modifiers = (W, n, id, SAcc) => {
    const isFast = !!(SAcc && SAcc._fast), out = SAcc ? null : [], s = n.h.state, c = n.cognition; const push = isFast ? ((_, x) => { if (x > 0.025 || x < -0.025) SAcc.u += (x < -2 ? -2 : x > 2 ? 2 : x); }) : ((why, x) => { if (x > 0.025 || x < -0.025) { const v = x < -2 ? -2 : x > 2 ? 2 : x; if (SAcc) SAcc.add(why, v); else out.push([why, v]); } });
    let mc = n._cogModCtx;
    if (!(SAcc && mc && mc._decTick === W.t && mc.ver === n._ver)) {
      const vSd = n.h.values.sectDuty, pDi = n.h.personality.discipline, pLo = n.h.personality.loyalty, rawGoal = c?.goal && c.goal.expiresAt > W.t ? c.goal : null, curGoal = (rawGoal && rawGoal.id === 'recovery' && s.satiety >= 25 && s.rest >= 20 && !(n.inj && n.inj.length) && s.hp >= 80) ? null : rawGoal, cpNow = n.cp || 0;
      const postsRef = W.sect && W.sect.posts;
      const safeNow = safe(n), hourBand = ((W.t % 1440) / 60) | 0, planAnchor = W.sect && W.sect.officePlans && W.sect.officePlans.alchemy ? W.sect.officePlans.alchemy.by : null;
      const pCmd = postsRef ? postsRef.commander : null, pAlc = postsRef ? postsRef.alchemy : null, pFrg = postsRef ? postsRef.forge : null, pMas = W.sect ? W.sect.masterId : null;
      if (!mc || (W.t - mc.t >= 60 || mc.t > W.t || mc.injLen !== (n.inj ? n.inj.length : 0)) || mc.hourBand !== hourBand || mc.ver !== n._ver || mc.safe !== safeNow || mc.planAnchor !== planAnchor || mc.vSd !== vSd || mc.pDi !== pDi || mc.pLo !== pLo || mc.post !== n.post || mc.assist !== n.assist || mc.goalRef !== curGoal || (curGoal && (curGoal.id === 'scripture' || curGoal.id === 'gear_upgrade') && mc.cp !== cpNow) || mc.pCmd !== pCmd || mc.pAlc !== pAlc || mc.pFrg !== pFrg || mc.pMas !== pMas || (postsRef && (mc.pTre !== postsRef.treasury || mc.pHea !== postsRef.healer || mc.pMar !== postsRef.martial || mc.pScr !== postsRef.scripture || mc.pMis !== postsRef.mission || mc.pGrd !== postsRef.guard || mc.pReg !== postsRef.registry || mc.pDis !== postsRef.discipline))) {
      const r0 = COG.role(W, n);
      const duty0 = (E(n, 'values.sectDuty') + E(n, 'personality.discipline') + E(n, 'personality.loyalty')) / 300;
      const disc0 = E(n, 'personality.discipline') / 100;
      const safe0 = safe(n);
      let goalActs = null, goalVal = 0, goalShopPen = 0;
      if (safe0 && curGoal) {
        const t = curGoal.id === 'scripture' ? CULT.tech(curGoal.targetId) : null;
        const price = curGoal.id === 'scripture' ? (t ? g.CPE.techPrice(W, t) : 0) : curGoal.id === 'gear_upgrade' ? (curGoal.price || 0) : 0;
        goalActs = curGoal.id === 'scripture' ? (cpNow >= price ? ['study', 'guidedStudy'] : INCOME)
          : curGoal.id === 'gear_upgrade' ? (cpNow >= price ? ['shop'] : INCOME)
          : curGoal.id === 'service' ? ['duty']
          : curGoal.id === 'craft' ? ['personalBrew', 'forage', 'donate', 'brew', 'brewBasic', 'forge']
          : curGoal.id === 'rival' ? TRAIN
          : curGoal.id === 'track_bottleneck' ? ((CULT.inspectProgressionBottleneck && CULT.inspectProgressionBottleneck(W, n).feasibleActions) || ['skillDrill', 'practice', 'pair', 'shop', 'mine', 'forage'])
          : curGoal.id === 'breakthrough' ? ((CULT.inspectProgressionBottleneck && CULT.inspectProgressionBottleneck(W, n).feasibleActions.concat(['cultivate', 'breakthrough', 'consolidate', 'shop', 'pray'])) || ['cultivate', 'breakthrough', 'consolidate', 'shop', 'pray', 'paidTraining'])
          : curGoal.id === 'help_friend' ? ['shareMedicine', 'giftItem', 'personalBrew', 'shop']
          : curGoal.id === 'mentor_disciple' ? ['pair', 'duty']
          : curGoal.id === 'social_bond' ? ['pair', 'leisure', 'giftItem']
          : curGoal.id === 'investigate_clue' ? ['investigateClueLocal', 'meetVisitor', 'practice', 'study', 'cultivate']
          : curGoal.id === 'crisis' ? (curGoal.targetId === 'meal' ? ['cook', 'farm'] : curGoal.targetId === 'grain' ? ['farm'] : curGoal.source === 'alchemy' ? ['brew', 'brewBasic'] : ['forage', 'donate', 'mine'])
          : REST;
        goalVal = 0.35 + E(n, 'intellect.planning') / 180 + disc0 / 2.5;
        if (curGoal.id === 'scripture' && cpNow < price) goalShopPen = -disc0 * (100 / 140);
      }
      const defCache = {};
      const poMods = {};
      if (safe0) {
        const plans = W.sect.officePlans;
        if (plans) {
          for (const post in plans) {
            const plan = plans[post];
            if (!plan || plan.expiresAt <= W.t || !plan.actions) continue;
            const authorizedId = (W.sect.delegations && W.sect.delegations[post] && W.sect.delegations[post].until > W.t)
              ? W.sect.delegations[post].delegateId
              : (post === 'master' ? W.sect.masterId : post === 'deputy' ? W.sect.deputyId : W.sect.posts[post]);
            if (authorizedId !== plan.by) continue;
            const owner = W.byId[plan.by];
            if (!COG.available(owner, W)) continue;
            const defObj = owner.id !== n.id ? (defCache[owner.id] || (defCache[owner.id] = COG.deferenceToward(W, n, owner))) : { deference: 50 };
            const val = clamp(0.08 + duty0 * 0.16 + (defObj.deference / 100) * 0.08, -2, 2);
            const why = 'ข้อเสนอฝ่าย: ' + plan.title;
            for (let i = 0; i < plan.actions.length; i++) {
              const actId = plan.actions[i];
              (poMods[actId] || (poMods[actId] = [])).push([why, val]);
            }
          }
        }
        const orders = W.sect.officeOrders;
        if (orders) {
          for (const post in orders) {
            const ord = orders[post];
            if (!ord || ord.expiresAt <= W.t || (ord.targetNpcId && ord.targetNpcId !== n.id) || !ord.actions) continue;
            const officer = W.byId[ord.by];
            if (!COG.available(officer, W) || !COG.hasAuthority(W, officer, post)) continue;
            const def = defCache[officer.id] || (defCache[officer.id] = COG.deferenceToward(W, n, officer));
            const compliance = clamp(0.15 + duty0 * 0.25 + def.deference / 250 + def.fear / 300 - (def.resentment / 400), 0.05, 0.65);
            const why = 'คำสั่ง' + (OFFICE[post]?.[0] || 'ฝ่าย') + ': ' + ord.title;
            for (let i = 0; i < ord.actions.length; i++) {
              const actId = ord.actions[i];
              (poMods[actId] || (poMods[actId] = [])).push([why, compliance]);
            }
          }
        }
      }
      const hour0 = (W.t % 1440) / 60;
      mc = n._cogModCtx = {
        t: W.t, hourBand, planAnchor, ver: n._ver, hp: s.hp, vSd, pDi, pLo, post: n.post, assist: n.assist, goalRef: curGoal, cp: cpNow, pCmd, pAlc, pFrg, pMas, pTre: postsRef && postsRef.treasury, pHea: postsRef && postsRef.healer, pMar: postsRef && postsRef.martial, pScr: postsRef && postsRef.scripture, pMis: postsRef && postsRef.mission, pGrd: postsRef && postsRef.guard, pReg: postsRef && postsRef.registry, pDis: postsRef && postsRef.discipline, poMods,
        safe: safe0, r: r0, duty: duty0, disc: disc0,
        dutyActVal: safe0 && r0.id !== 'member' ? (0.1 + duty0 * 0.55 + roleNeed(W, n) * duty0) * ((W.sect.lastDuty[n.id] || -9999) > W.t - 180 ? 0.15 : 1) : 0,
        relActs: ROLE_RELEVANT_ACTS[r0.id] || null,
        goalActs, goalVal, goalShopPen, defCache,
        hour: hour0, night: hour0 >= 21 || hour0 < 5,
        socEvening: (hour0 >= 17 && hour0 < 21) ? E(n, 'temperament.sociability') / 300 : 0,
        freeVal: E(n, 'values.freedom') / 100,
        injLen: n.inj ? n.inj.length : 0, hasSevInj: !!(n.inj && n.inj.length && n.inj.some(i => (i.sev || 1) >= 2)),
        hasTrackBnWindow: !!(safe0 && n.cult && n.cult.track && n.cult.track.ordinal < 9 && !(n.inj && n.inj.length && n.inj.some(i => (i.sev || 1) >= 2)) && !(curGoal && (curGoal.id === 'crisis' || curGoal.id === 'help_friend' || curGoal.id === 'recovery')) && (CULT.trackReady(n) || n.cult.track.prog >= CULT.trackThreshold(n) * 0.65)),
        weatherPen: (['rain', 'snow'].includes(W.weather?.kind)) ? (-0.12 - E(n, 'personality.caution') / 800) : 0,
        hasRefineCand: undefined
      };
      }
      if (SAcc && mc) mc._decTick = W.t;
    }
    const r = mc.r, goal = mc.goalRef;
    if (!mc.safe) {
      const lowHp = s.hp / CULT.hpMax(n) < 0.35 || mc.hasSevInj;
      const lowFood = s.satiety < 20;
      const lowRest = s.rest < 8;
      if ((lowRest && id === 'sleep') || (lowFood && id === 'eat') || (lowHp && ['heal', 'personalPillUse', 'shop', 'sleep'].includes(id))) {
        push('ร่างกายเร่งด่วนสำคัญกว่างานหรือความชอบ', 2.4);
      }
      if (['wildHunt', 'paidTraining', 'practice', 'skillDrill', 'personalBrew', 'duty', 'flatter', 'giftItem'].includes(id)) push('ต้องรักษาตัวก่อน', -1.6);
      return out;
    }
    const duty = mc.duty;
    if (r.id !== 'member') {
      if (id === 'duty') push('หน้าที่ของ' + r.title, mc.dutyActVal);
      if (mc.relActs && mc.relActs.includes(id)) push('งานในความรับผิดชอบ', duty * 0.25);
    }
    const aspId = c?.aspiration?.id;
    if (aspId === 'peaceful_companion' && (id === 'pair' || id === 'leisure')) push('วิถีชีวิต: รักความสงบและมิตรภาพ', 0.18);
    else if (aspId === 'martial_master' && (id === 'practice' || id === 'skillDrill')) push('ปณิธาน: ขัดเกลาวิชายุทธ์', 0.18);
    else if (aspId === 'benevolent_healer' && (id === 'shareMedicine' || id === 'heal')) push('ปณิธาน: ช่วยเหลือผู้บาดเจ็บ', 0.22);

    if (goal) {
      if (mc.goalActs && mc.goalActs.includes(id)) push('เป้าหมาย: ' + goal.title, mc.goalVal);
      if (id === 'shop' && mc.goalShopPen) push('เก็บแต้มไว้เรียนวิชาที่ตั้งใจ', mc.goalShopPen);
    }
    if (mc.hasSevInj) {
      if (id === 'heal' || id === 'personalPillUse') push('รักษาบาดแผลหนักที่ขัดขวางการฝึก/ทำงาน', 1.35);
      else if (id === 'shop' && W.sect && W.sect.stock && (W.sect.stock['P:BASIC_WOUND'] > 0)) push('ซื้อโอสถสมานแผลรักษาอาการบาดเจ็บ', 0.85);
    }
    if (n.cult && (n.cult.toxic || 0) >= 45 && (id === 'personalPillUse' || id === 'shop' || id === 'personalBrew')) {
      push('ขับพิษโอสถสะสมในเส้นลมปราณ', 0.62);
    }
    if ((s.heartDemon || 0) >= 45 && (id === 'pray' || id === 'consolidate' || id === 'personalPillUse') && (!n.cult || n.cult.path !== 'DEMON' || s.heartDemon >= 68)) {
      push('สงบจิตมารที่รบกวนตบะ', 0.62);
    }
    if (id === 'forge' && (mc.hasRefineCand !== undefined ? mc.hasRefineCand : (mc.hasRefineCand = !!(mc.safe && n.rank >= 2 && W.sect && W.sect.catalysts && ECO.findCatalystRefinementCandidate && ECO.findCatalystRefinementCandidate(W, n))))) {
      push('ขัดเกลาศาสตรา T4–T6 ด้วยผลึกโบราณ', 0.52);
    }
    if (mc.hasTrackBnWindow) {
      const bn = mc._bn !== undefined ? mc._bn : (mc._bn = CULT.inspectProgressionBottleneck ? CULT.inspectProgressionBottleneck(W, n) : null);
      if (bn && bn.track && bn.track.active && !bn.track.gateOk && bn.track.feasibleActions.includes(id)) {
        const nf = clamp(Math.min(s.satiety / 35, s.rest / 25, s.energy / 28), 0.2, 1);
        push('เร่งแก้คอขวดสายเฉพาะทาง', (bn.track.ready ? 0.68 : 0.45) * bn.driveMult * nf);
      }
    }
    if (c && c.cluePrep && c.cluePrep.until > W.t && c.cluePrep.recommendedAction === id) {
      push('เตรียมความพร้อมเพื่อสืบเบาะแส', 0.28);
    }
    // Office plans & actionable orders (cached per tick + live post signature)
    const poList = mc.poMods && mc.poMods[id];
    if (poList) {
      for (let i = 0; i < poList.length; i++) {
        if (SAcc) SAcc.add(poList[i][0], poList[i][1]);
        else out.push(poList[i]);
      }
    }
    const hour = mc.hour, night = mc.night, discipline = mc.disc;
    if (night && (id === 'duty' || id === 'farm' || id === 'mine' || id === 'forage')) push('ยามดึกควรพัก', -0.25 * discipline);
    if (hour >= 8 && hour < 17 && id === 'duty') push('ช่วงเวลาปฏิบัติหน้าที่', 0.15 + 0.15 * discipline);
    if (mc.socEvening && (id === 'pair' || id === 'leisure')) push('ยามเย็นอยากผ่อนคลาย', mc.socEvening);
    if (s.stress > 60) {
      if (REST.includes(id)) push('ผ่อนคลายความเครียด', (s.stress - 60) / 70 * (0.5 + mc.freeVal));
      if (id === 'duty') push('เหนื่อยล้าแต่ยังชั่งใจเรื่องหน้าที่', -(s.stress - 60) / 120 * (1 - duty));
    }
    if ((n.grief || 0) > 0 && (id === 'pray' || id === 'leisure')) push('กำลังโศกเศร้าและต้องการสงบใจ', Math.min(0.6, n.grief / 10));
    if (s.anger > 45 && id === 'pair') push('อารมณ์ร้อนอยากพูดคุยหรือระบาย', Math.min(0.3, (s.anger - 45) / 180));
    if (mc.weatherPen && (id === 'farm' || id === 'mine' || id === 'wildHunt' || id === 'forage')) push('อากาศทำให้งานกลางแจ้งไม่น่าสบาย', mc.weatherPen);
    return out;
  };

  COG.chosen = (W, n, actionId, reasons) => {
    const c = COG.ensure(n);
    c.trace.push({ at: W.t, actionId, reasons: reasons.slice(0, 4).map(x => [String(x[0]), x[1]]) });
    if (c.trace.length > 8) c.trace.shift();
    if (c.goal) {
      c.goal.blocked = 0;
      c.goal.lastAction = actionId;
    }
  };

  COG.isContinuingProductiveWork = (W, n, id) => {
    if (!W || !n || !safe(n)) return false;
    const lastAct = n.recent && n.recent.length ? n.recent[n.recent.length - 1] : null;
    if (lastAct !== id) return false;
    if (id === 'study' && n.cult && n.cult.learning && n.cult.learning.got > 0 && n.cult.learning.got < n.cult.learning.need) return true;
    if ((id === 'skillDrill' || id === 'practice') && n.cult && n.cult.track && (CULT.trackReady(n) || n.cult.track.prog >= CULT.trackThreshold(n) * 0.65) && CULT.checkTrackGates && !CULT.checkTrackGates(W, n).skillOk && !(n.inj && n.inj.some(i => i.sev >= 2))) return true;
    if (id === 'consolidate' && n.cult && n.cult.bn && n.cult.bn.plan === 'wait' && (n.cult.found || 0) < 0.08) return true;
    if (id === 'heal' && ((n.inj && n.inj.length > 0) || n.h.state.hp < CULT.hpMax(n) * 0.78)) return true;
    const gObj = n.cognition && n.cognition.goal;
    if (gObj && gObj.id === 'crisis' && ((gObj.targetId === 'meal' && (id === 'cook' || id === 'farm')) || (gObj.targetId === 'grain' && id === 'farm'))) return true;
    return false;
  };

  // Decompose or suspend on block rather than blindly destroying valid multi-step goals
  COG.blocked = (W, n, id) => {
    const c = n.cognition;
    if (!c || !c.goal) return;
    const gId = c.goal.id;
    const isGoalAct = (gId === "scripture" && (id === "study" || id === "guidedStudy")) ||
      (gId === "gear_upgrade" && id === "shop") ||
      (gId === "track_bottleneck" && ["skillDrill", "practice", "pair", "shop", "mine", "forage"].includes(id)) ||
      (gId === "breakthrough" && (id === "cultivate" || id === "breakthrough" || id === "paidTraining")) ||
      (gId === "craft" && (id === "personalBrew" || id === "brew" || id === "brewBasic" || id === "forge")) ||
      (gId === "service" && id === "duty") ||
      (gId === "rival" && TRAIN.includes(id));
    if (!isGoalAct) return;
    c.goal.blocked = (c.goal.blocked || 0) + 1;
    c.goal.blockReason = 'ยังทำ ' + (g.AI.ACTS[id]?.nameTh || id) + ' ไม่ได้ (สถานีเต็มหรือติดเงื่อนไข)';
    const stInfo = computeGoalStep(W, n, c.goal);
    c.goal.step = stInfo.step;
    c.goal.stepTitle = stInfo.stepTitle;
    c.goal.missingPrereq = stInfo.missingPrereq || c.goal.blockReason;
    c.goal.status = 'blocked_prereq';
    // Only expire if blocked repeatedly and no alternative decomposition step exists
    const hasDecomposedFallback = c.goal.step === 'earn_cp' || c.goal.step === 'gather_input' || c.goal.step === 'obtain_remedy';
    const maxBlocks = hasDecomposedFallback ? 10 : 4;
    if (c.goal.blocked >= maxBlocks) {
      c.lastGoal = { id: c.goal.id, title: c.goal.title, targetId: c.goal.targetId || null, endedAt: W.t, status: 'blocked_replan', reason: c.goal.blockReason };
      c.goal.expiresAt = W.t;
      c.nextReview = W.t + 120;
    }
  };

  // Defect #1 Fix: Verify actual goal-relevant progress before refreshing lastProgress!
  COG.doesActionAdvanceGoal = (W, n, goal, actionId) => {
    if (!goal || !actionId) return false;
    const snap = goal.progressSnap || {};
    if (goal.id === 'scripture') {
      if (actionId === 'study' || actionId === 'guidedStudy') {
        const got = (n.cult && n.cult.learning) ? n.cult.learning.got : 0;
        return !!(n.cult && (n.cult.techs.includes(goal.targetId) || got > (snap.learningGot || 0)));
      }
      const t = CULT.tech(goal.targetId);
      const price = t && g.CPE ? g.CPE.techPrice(W, t) : (snap.price || 0);
      if ((n.cp || 0) < price && INCOME.includes(actionId)) {
        return (n.cp || 0) > (snap.cp || 0);
      }
      return false;
    }
    if (goal.id === 'gear_upgrade') {
      if (actionId === 'shop' || actionId === 'forge') return true;
      const price = goal.price || snap.price || 20;
      if ((n.cp || 0) < price && INCOME.includes(actionId)) {
        return (n.cp || 0) > (snap.cp || 0);
      }
      return false;
    }
    if (goal.id === 'service') {
      const planActs = (W.sect.officePlans && W.sect.officePlans[goal.targetId]?.actions) || ['duty'];
      return actionId === 'duty' || planActs.includes(actionId);
    }
    if (goal.id === 'track_bottleneck') {
      if (!['skillDrill', 'practice', 'pair', 'study', 'guidedStudy', 'shop', 'outsideTrade', 'mine', 'forage', 'gatherWildResource', 'donate', 'errand', 'heal', 'personalPillUse'].includes(actionId)) return false;
      if (CULT.checkTrackGates && n.cult && n.cult.track) {
        const tg = CULT.checkTrackGates(W, n);
        if (tg.ok) return true;
        let curSum = 0;
        for (let i = 0; i < (tg.missingSkills || []).length; i++) curSum += tg.missingSkills[i].current || 0;
        if (curSum > (snap.bnSkillSum || 0)) return true;
      }
      if (((n.inv && n.inv.stones) || 0) > (snap.stones || 0) || (n.cp || 0) > (snap.cp || 0)) return true;
      return ['skillDrill', 'practice', 'pair', 'mine', 'forage'].includes(actionId);
    }
    if (goal.id === 'rival') {
      return TRAIN.includes(actionId) || actionId === 'pair' || actionId === 'wildHunt';
    }
    if (goal.id === 'breakthrough') {
      return ['cultivate', 'breakthrough', 'paidTraining', 'shop', 'pray'].includes(actionId) && (n.cult && (n.cult.stage > (snap.stage || 0) || n.cult.prog > (snap.prog || 0) || actionId === 'pray' || actionId === 'shop'));
    }
    if (goal.id === 'craft') {
      return ['personalBrew', 'brew', 'brewBasic', 'forge', 'forage', 'farm', 'mine'].includes(actionId);
    }
    if (goal.id === 'crisis') {
      const valid = goal.targetId === 'meal' ? ['cook', 'farm'] : goal.targetId === 'grain' ? ['farm'] : goal.source === 'alchemy' ? ['brew', 'brewBasic', 'forage'] : ['forage', 'donate', 'mine', 'farm'];
      return valid.includes(actionId);
    }
    if (goal.id === 'help_friend') {
      return ['shareMedicine', 'giftItem', 'personalBrew', 'brewBasic', 'shop'].includes(actionId);
    }
    if (goal.id === 'mentor_disciple') {
      return ['pair', 'guidedStudy', 'duty'].includes(actionId);
    }
    if (goal.id === 'social_bond') {
      return ['pair', 'leisure', 'giftItem', 'festival'].includes(actionId);
    }
    if (goal.id === 'recovery') {
      return ['heal', 'sleep', 'eat', 'personalPillUse'].includes(actionId);
    }
    if (goal.id === 'investigate_clue') {
      return ['investigateClueLocal', 'meetVisitor', 'practice', 'study', 'cultivate'].includes(actionId);
    }
    return false;
  };

  COG.finished = (W, n, id) => {
    const c = n.cognition;
    if (!c || !c.goal) return;
    if (COG.doesActionAdvanceGoal(W, n, c.goal, id)) {
      c.goal.lastProgress = W.t;
      c.goal.progressSnap = snapshotForGoal(W, n, c.goal);
      const stInfo = computeGoalStep(W, n, c.goal);
      c.goal.step = stInfo.step;
      c.goal.stepTitle = stInfo.stepTitle;
      c.goal.missingPrereq = stInfo.missingPrereq;
    }
  };

  COG.remember = (W, n, event) => {
    const c = COG.ensure(n), e = {
      kind: event.kind,
      zoneId: event.zoneId || null,
      subjectId: event.subjectId || null,
      at: W.t,
      severity: clamp(event.severity || 0.5, 0.05, 1)
    };
    const old = c.memory.find(x => x.kind === e.kind && x.zoneId === e.zoneId && x.subjectId === e.subjectId);
    if (old) Object.assign(old, e);
    else c.memory.push(e);
    if (c.memory.length > 24) c.memory.shift();
  };

  COG.huntValue = (W, n, b) => {
    const ratio = CULT.power(n) / Math.max(1, b.power), caution = E(n, 'personality.caution') / 100, courage = E(n, 'personality.courage') / 100;
    let v = Math.log2(Math.max(0.05, ratio)) * (0.6 + caution) + (courage - 0.5) * 0.25;
    for (const m of n.cognition?.memory || []) {
      if (m.zoneId !== b.zone) continue;
      const fade = Math.max(0, 1 - (W.t - m.at) / (14 * 1440));
      if (m.kind === 'hunt_loss') v -= m.severity * fade * (0.25 + caution);
      if (m.kind === 'hunt_win') v += 0.12 * fade;
    }
    const preferred = (b.x - n.x) ** 2 + (b.y - n.y) ** 2;
    return v - Math.min(0.4, Math.sqrt(preferred) / 400);
  };

  /* ============================================================================
   * 7. MULTI-DIMENSIONAL RELATIONSHIPS, RECIPROCITY, COMMITMENTS & MENTORING
   * ============================================================================ */
  // Evaluates relationship dimensions including consumed memories (received_help, kept/broken commitments, unfair_allocation)
  COG.relInfo = (W, a, bOrId) => {
    if (W && W.h && W.h.mind && bOrId === undefined) { bOrId = a; a = W; W = null; }
    const bId = typeof bOrId === 'string' ? bOrId : bOrId?.id;
    const b = typeof bOrId === 'object' ? bOrId : (W && W.byId && W.byId[bId]);
    const r = (a && a.h && a.h.mind && a.h.mind.relations && a.h.mind.relations[bId]) || { a: 0, t: 40, r: 30, l: 0, v: 0, g: 0, f: 0, n: 0, last: 0, bond: '' };
    let memGratitude = 0, memTrust = 0, memResent = 0;
    for (const m of a.cognition?.memory || []) {
      if (m.subjectId !== bId) continue;
      const nowT = (W && Number.isFinite(W.t)) ? W.t : ((g.STATS && Number.isFinite(g.STATS.now)) ? g.STATS.now : m.at);
      const fade = clamp(1 - Math.max(0, nowT - m.at) / (30 * 1440), 0, 1);
      if (m.kind === 'received_help') { memGratitude += 18 * m.severity * fade; memTrust += 8 * m.severity * fade; }
      else if (m.kind === 'kept_commitment' || m.kind === 'shared_danger') { memTrust += 10 * m.severity * fade; }
      else if (m.kind === 'broken_commitment') { memTrust -= 14 * m.severity * fade; }
      else if (m.kind === 'unfair_allocation') { memTrust -= 16 * m.severity * fade; memResent += 18 * m.severity * fade; }
    }
    const affection = clamp(r.a || 0, -100, 100);
    const trust = clamp((r.t ?? 40) + memTrust, 0, 100);
    const respect = clamp(r.r ?? 30, 0, 100);
    const gratitude = clamp((r.g || 0) + memGratitude, 0, 100);
    const fear = clamp(r.f || 0, 0, 100);
    const rivalry = clamp(r.v || 0, 0, 100);
    const isKin = !!(b && (a.mentor === b.id || b.mentor === a.id || a.h.life.family.spouse === b.id));
    return { affection, trust, respect, gratitude, fear, rivalry, bond: r.bond || '', isKin, memResent };
  };

  // Contextual deference, respect, fear and resentment toward elders/leaders
  COG.deferenceToward = (W, a, b) => {
    if (!a || !b || a.id === b.id) return { deference: 0, respect: 30, fear: 0, resentment: 0, summaryTh: 'ปกติ' };
    const ri = COG.relInfo(W, a, b);
    const bRole = COG.role(W, b);
    const rankGap = Math.max(0, (b.rank || 0) - (a.rank || 0));
    const stageGap = Math.max(0, (b.cult?.stage || 0) - (a.cult?.stage || 0));
    const peakMasterWeight = b.peakRole === 'MASTER' ? 24 : b.peakRole === 'DEPUTY' ? 16 : (b.rank >= 4 || b.isElder) ? 14 : 0;
    const officeWeight = Math.max(peakMasterWeight, bRole.id === 'master' ? 32 : bRole.id === 'deputy' ? 24 : bRole.id !== 'member' ? (bRole.acting ? 10 : 18) : 0);
    const loyalty = E(a, 'personality.loyalty'), discipline = E(a, 'personality.discipline'), pride = E(a, 'personality.pride');
    const bIntim = E(b, 'social.intimidation') + (bRole.id === 'discipline' || bRole.id === 'master' ? 15 : 0);
    const fear = clamp(ri.fear + Math.max(0, (bIntim - E(a, 'personality.courage')) * 0.35) + (rankGap >= 2 && E(b, 'personality.aggression') > 65 ? 12 : 0), 0, 100);
    const respect = clamp(ri.respect + stageGap * 5 + rankGap * 4 + (SECT.relevance && bRole.id !== 'member' && SECT.POSTS[bRole.id] ? Math.min(12, SECT.relevance(bRole.id, b) * 0.15) : 0), 0, 100);
    const resentment = clamp(ri.memResent + (ri.affection < -15 && officeWeight > 0 ? Math.abs(ri.affection) * 0.5 : 0) + (pride > 65 && rankGap > 0 && CULT.power(a) > CULT.power(b) * 1.1 ? 15 : 0), 0, 100);
    const deference = clamp(officeWeight * (0.5 + (loyalty + discipline) / 220) + respect * 0.35 + fear * 0.25 + ri.gratitude * 0.2 - resentment * 0.25 - Math.max(0, pride - 60) * 0.2, 0, 100);
    const summaryTh = deference >= 65 && ri.affection < -10 ? 'ยำเกรงอำนาจแต่เก็บความขุ่นเคืองในใจ'
      : deference >= 65 ? 'เคารพนบนอบและเชื่อฟัง'
      : fear >= 45 ? 'หวาดเกรงอิทธิพล'
      : respect >= 60 ? 'นับถือความสามารถ'
      : resentment >= 35 ? 'ไม่พอใจการใช้อำนาจ'
      : 'ตามมารยาทสำนัก';
    return { deference: Math.round(deference), respect: Math.round(respect), fear: Math.round(fear), resentment: Math.round(resentment), summaryTh };
  };

  // Commitments & reliability tracking for accepted invitations
  COG.startCommitment = (W, a, b, type, dur) => {
    if (!a || !b) return null;
    const ca = COG.ensure(a);
    if (b && typeof b === 'object' && !b.h && (b.kind || b.partnerId)) {
      const opts = b;
      const partnerId = opts.partnerId || 'sect';
      const cmType = opts.kind || opts.type || 'oath';
      const cmDur = opts.duration || 360;
      const cid = 'cm_' + W.t + '_' + a.id + '_' + partnerId;
      const rec = { id: cid, partnerId, type: cmType, kind: cmType, clueId: opts.clueId || null, region: opts.region || null, noteTh: opts.noteTh || '', startedAt: W.t, expiresAt: W.t + cmDur, status: 'active' };
      ca.commitment = rec;
      ca.commitments.push(rec);
      const partner = W && W.byId && W.byId[partnerId];
      if (partner) {
        const cb = COG.ensure(partner);
        cb.commitments.push(Object.assign({}, rec, { partnerId: a.id }));
      }
      return rec;
    }
    const cb = COG.ensure(b);
    const cid = 'cm_' + W.t + '_' + a.id + '_' + b.id;
    const recA = { id: cid, partnerId: b.id, type, kind: type, startedAt: W.t, expiresAt: W.t + (dur || 120) + 120, status: 'active' };
    const recB = { id: cid, partnerId: a.id, type, kind: type, startedAt: W.t, expiresAt: W.t + (dur || 120) + 120, status: 'active' };
    ca.commitment = recA;
    cb.commitment = recB;
    ca.commitments.push(recA);
    cb.commitments.push(recB);
    return recA;
  };

  COG.resolveCommitment = (W, a, b, outcome, d) => {
    if (!a || !b) return null;
    const ca = COG.ensure(a), cb = COG.ensure(b);
    const ra = SECT.rel(a, b.id), rb = SECT.rel(b, a.id);
    let resStatus = "completed";
    if (outcome === "completed" || outcome === true) {
      ra.t = clamp((ra.t ?? 40) + 1.5, 0, 100);
      rb.t = clamp((rb.t ?? 40) + 1.5, 0, 100);
      COG.remember(W, a, { kind: "kept_commitment", subjectId: b.id, severity: 0.35 });
      COG.remember(W, b, { kind: "kept_commitment", subjectId: a.id, severity: 0.35 });
      if (d && d.type === "teach") {
        COG.completeMentorLesson(W, a, b, a.act?.ctx?.skillTgt);
      }
    } else if (outcome === "aborted" || outcome === false) {
      // Distinguish understandable emergency (injury, raid, critical hunger) from neglect
      const bExcused = !COG.available(b, W) || !safe(b) || (b.inj && b.inj.length > 0) || !!(W.threat && W.threat.raid);
      const aExcused = !COG.available(a, W) || !safe(a) || (a.inj && a.inj.length > 0) || !!(W.threat && W.threat.raid);
      resStatus = (aExcused || bExcused) ? "excused" : "broken";
      if (!bExcused && (b.act?.id !== "pair")) {
        ra.t = clamp((ra.t ?? 40) - 3, 0, 100);
        COG.remember(W, a, { kind: "broken_commitment", subjectId: b.id, severity: 0.55 });
      }
      if (!aExcused && (a.act?.id !== "pair")) {
        rb.t = clamp((rb.t ?? 40) - 3, 0, 100);
        COG.remember(W, b, { kind: "broken_commitment", subjectId: a.id, severity: 0.55 });
      }
    }
    if (ca.commitment && ca.commitment.partnerId === b.id) { ca.commitment.status = resStatus; ca.commitment = null; }
    if (cb.commitment && cb.commitment.partnerId === a.id) { cb.commitment.status = resStatus; cb.commitment = null; }
    return resStatus;
  };

  // Concrete apprenticeship & mentoring transfer
  COG.completeMentorLesson = (W, mentor, student, skillTgt) => {
    if (!mentor || !student || mentor.dead || student.dead) return false;
    const teachQuality = 1 + E(mentor, 'social.teaching') / 100 + E(student, 'intellect.comprehension') / 150;
    const sk = skillTgt || (g.AI && g.AI.pickTeachSkill ? g.AI.pickTeachSkill(mentor, student) : 'SCRIPTURE');
    if (g.MARTIAL && g.MARTIAL.skillPractice) {
      g.MARTIAL.skillPractice(student, sk, 0.45, teachQuality);
    } else {
      HC.practice(student, sk, 0.45, teachQuality);
    }
    let transferredTech = null;
    // If student is currently studying a technique that mentor knows, advance study progress directly
    if (student.cult && student.cult.learning && mentor.cult && (mentor.cult.techs.includes(student.cult.learning.id) || (mentor.cult.stage || 0) > (student.cult.stage || 0))) {
      const boost = Math.max(8, student.cult.learning.need * 0.14 * (teachQuality / 2));
      student.cult.learning.got = Math.min(student.cult.learning.need, student.cult.learning.got + boost);
      transferredTech = CULT.tech(student.cult.learning.id)?.nameTh || student.cult.learning.id;
    } else if (student.cult && mentor.cult && g.SK && g.SK.gainMastery) {
      // Or if student and mentor share a learned technique, grant mastery insight
      const sharedId = student.cult.techs.find(id => mentor.cult.techs.includes(id));
      if (sharedId) {
        g.SK.gainMastery(W, student, sharedId, Math.round(2 * teachQuality));
        transferredTech = CULT.tech(sharedId)?.nameTh || sharedId;
      }
    }
    const rS = SECT.rel(student, mentor.id);
    rS.g = clamp((rS.g || 0) + 6, 0, 100);
    rS.r = clamp((rS.r || 30) + 3, 0, 100);
    COG.remember(W, student, { kind: 'received_help', subjectId: mentor.id, severity: 0.45 });
    mentor.stats = mentor.stats || {};
    mentor.stats.taughtCount = (mentor.stats.taughtCount || 0) + 1;
    if (transferredTech && W && W.log && (W.t + mentor.n) % 3 === 0) {
      W.log('learn', mentor.h.name.given + ' ชี้แนะเคล็ดวิชา「' + transferredTech + '」แก่ ' + student.h.name.given + ' จนเข้าใจลึกซึ้งขึ้น', [mentor.id, student.id]);
    }
    return { ok: true, transferredTech };
  };

  /* ---------- Medicine Sharing & Surplus Gear Gifting ---------- */
  function helpCandidate(W, n, target) {
    if (!COG.available(n, W) || !safe(n) || n.act?.id === 'fight') return null;
    if (!target && W.t > 0 && n._helpCandCache && n._helpCandCache.t === W.t) return n._helpCandCache.val;
    const pills = n.inv && n.inv.pills;
    if (!pills) return null;
    const recHp = g.JD.CP.RECOVERY.hp || [];
    let key = null;
    for (let i = 0; i < recHp.length; i++) { const k = recHp[i]; if (pills[k] > 0 && ECO.pillInfo(k)?.effect.healHealth) { key = k; break; } }
    if (!key) { if (!target && W.t > 0) n._helpCandCache = { t: W.t, val: null }; return null; }
    const candidates = target ? [W.byId[target]] : W.npcs;
    let best = null, score = 0;
    for (let i = 0; i < candidates.length; i++) {
      const x = candidates[i];
      if (!x || x.id === n.id || x.dead || x.away || x.exiled || x.hidden || x.act?.id === 'fight' || Math.abs(x.x - n.x) > 12 || Math.abs(x.y - n.y) > 12 || !COG.available(x, W) || Math.hypot(x.x - n.x, x.y - n.y) > 12 || x.h.state.hp >= (x._nd ? x._nd.hpMax : CULT.hpMax(x)) * 0.55 || (x.inv.pills[key] || 0) >= 1) continue;
      const ri = COG.relInfo(W, n, x);
      const empathy = E(n, 'personality.empathy');
      const v = empathy / 100 + Math.max(0, ri.affection) / 100 + ri.gratitude / 140 + (ri.isKin ? 0.4 : 0) - (E(n, 'values.wealthResource') / 200);
      if (v > 0.55 && v > score) {
        score = v;
        best = { id: x.id, key, score: v };
      }
    }
    if (!target && W.t > 0) n._helpCandCache = { t: W.t, val: best };
    return best;
  }
  COG.helpCandidate = helpCandidate;

  COG.giveMedicine = (W, n, target) => {
    const p = helpCandidate(W, n, target), x = p && W.byId[p.id];
    if (!p || Math.hypot(x.x - n.x, x.y - n.y) > 3) return false;
    const quality = n.inv.pillQuality?.[p.key] || 1;
    const wasSpawned = (n.inv.spawnedPills && n.inv.spawnedPills[p.key] > 0);
    n.inv.pills[p.key]--;
    if (n.inv.pills[p.key] <= 0) {
      delete n.inv.pills[p.key];
      if (n.inv.pillQuality) delete n.inv.pillQuality[p.key];
    }
    if (wasSpawned) {
      n.inv.spawnedPills[p.key]--;
      if (n.inv.spawnedPills[p.key] <= 0) delete n.inv.spawnedPills[p.key];
      x.inv.spawnedPills = x.inv.spawnedPills || {};
      x.inv.spawnedPills[p.key] = (x.inv.spawnedPills[p.key] || 0) + 1;
    }
    ECO.addPersonalPill(x, p.key, quality);
    const rel = SECT.rel(x, n.id);
    rel.a = clamp(rel.a + 2, -100, 100);
    rel.g = clamp((rel.g || 0) + 12, 0, 100);
    rel.t = clamp((rel.t ?? 40) + 3, 0, 100);
    COG.remember(W, x, { kind: 'received_help', subjectId: n.id, severity: 0.5 });
    COG.remember(W, n, { kind: 'gave_help', subjectId: x.id, severity: 0.4 });
    W.log('relation', n.h.name.given + ' มอบ ' + ECO.name(p.key) + ' จากของส่วนตัวให้ ' + x.h.name.given + ' ที่บาดเจ็บ', [n.id, x.id]);
    return true;
  };

  g.AI.ACTS.shareMedicine = {
    nameTh: 'แบ่งปันโอสถให้คนใกล้ตัว', icon: '💊', color: '#8dd9b4',
    can: (n, W) => !!helpCandidate(W, n),
    score(n, W, S) { const p = helpCandidate(W, n); if (p) S.add('เป็นห่วงผู้บาดเจ็บและมีโอสถแบ่งได้', Math.min(2, p.score)); },
    where(W, n) { const p = helpCandidate(W, n), x = p && W.byId[p.id]; return x ? { pos: { x: x.x, y: x.y }, recipient: p.id } : null; },
    dur: () => 5,
    tick() {},
    done(n, W, ctx) { COG.giveMedicine(W, n, ctx.recipient); },
    cooldown: 180
  };

  // Gift surplus personal gear to a close friend/disciple/spouse who needs it
  COG.giftCandidate = (W, n) => {
    if (!n || !n.inv || !Array.isArray(n.inv.gear) || !n.inv.gear.length || !COG.available(n, W) || !safe(n)) return null;
    if (W.t > 0 && n._giftCache && n._giftCache.t === W.t && n._giftCache.len === n.inv.gear.length) return n._giftCache.val;
    if ((n.cool?.giftItem || 0) > W.t) return null;
    const M = g.MARTIAL;
    if (!M || !M.classifyGearForNpc) return null;
    for (const eq of n.inv.gear) {
      if (!eq) continue;
      const cl = M.classifyGearForNpc(null, n, eq, 0);
      if (cl.category === 'gift-worthy' && cl.targetNpcId) {
        const rec = W.byId[cl.targetNpcId];
        if (rec && COG.available(rec, W) && !rec.hidden) {
          const res = { item: eq, recipient: rec, deltaScore: cl.deltaScore, reasonTh: cl.reasonTh };
          if (W.t > 0) n._giftCache = { t: W.t, len: n.inv.gear.length, val: res };
          return res;
        }
      }
    }
    if (W.t > 0) n._giftCache = { t: W.t, len: n.inv.gear.length, val: null };
    return null;
  };

  COG.giveGearGift = (W, n, recipientId, gearUidOrId) => {
    if (!n || !n.inv || !Array.isArray(n.inv.gear)) return false;
    const rec = W.byId[recipientId];
    if (!rec || rec.dead || rec.away || !rec.cult) return false;
    const idx = n.inv.gear.findIndex(g2 => g2 && (g2.uid === gearUidOrId || g2.id === gearUidOrId));
    if (idx < 0) return false;
    const eq = n.inv.gear[idx];
    const recEffSt = CULT.effectiveTechStage ? CULT.effectiveTechStage(rec) : rec.cult.stage;
    if ((eq.minStage || 1) > recEffSt) return false;
    n.inv.gear.splice(idx, 1);
    if (!n.inv.gear.length) delete n.inv.gear;
    rec.inv = rec.inv || {};
    rec.inv.gear = rec.inv.gear || [];
    rec.inv.gear.push(eq);
    if (SECT.EDITOR && SECT.EDITOR.equipPersonalGear) {
      SECT.EDITOR.equipPersonalGear(W, rec.id, eq.uid || eq.id);
    }
    const r = SECT.rel(rec, n.id);
    r.a = clamp((r.a || 0) + 5, -100, 100);
    r.g = clamp((r.g || 0) + 16, 0, 100);
    r.t = clamp((r.t ?? 40) + 4, 0, 100);
    COG.remember(W, rec, { kind: 'received_help', subjectId: n.id, severity: 0.65 });
    n.cool.giftItem = W.t + 7 * 1440;
    W.log('relation', n.h.name.given + ' มอบอุปกรณ์「' + eq.nameTh + '」จากถุงส่วนตัวให้ ' + rec.h.name.given + ' ไว้ใช้งาน', [n.id, rec.id]);
    return true;
  };

  g.AI.ACTS.giftItem = {
    nameTh: 'มอบอุปกรณ์ให้คนสนิท', icon: '🎁', color: '#f2b880',
    can: (n, W) => !!COG.giftCandidate(W, n),
    score(n, W, S) {
      const gCand = COG.giftCandidate(W, n);
      if (gCand) S.add('อยากแบ่งปัน「' + gCand.item.nameTh + '」ให้ ' + gCand.recipient.h.name.given, 0.85 + E(n, 'personality.empathy') / 200);
    },
    where(W, n) {
      const gCand = COG.giftCandidate(W, n);
      return gCand ? { pos: { x: gCand.recipient.x, y: gCand.recipient.y }, recipientId: gCand.recipient.id, gearId: gCand.item.uid || gCand.item.id } : null;
    },
    dur: () => 8,
    tick() {},
    done(n, W, ctx) { COG.giveGearGift(W, n, ctx.recipientId, ctx.gearId); },
    cooldown: 7 * 1440
  };

  /* ============================================================================
   * 8. FLATTERY, PETITIONS, COMPLAINTS & PERSONALITY-DEPENDENT OFFICE POWER
   * ============================================================================ */
  COG.flatteryCandidate = (W, n) => {
    if (!W || !W.sect || !n || n.rank >= 6 || (n.cool?.flatter || 0) > W.t || !COG.available(n, W) || !safe(n)) return null;
    if (W.t > 0 && n._flatCache && n._flatCache.until >= W.t) return n._flatCache.val;
    // Only ambitious, status/wealth-seeking, or manipulative NPCs choose to flatter
    const motive = (E(n, 'personality.ambition') * 0.35 + E(n, 'values.powerStatus') * 0.35 + E(n, 'values.wealthResource') * 0.2 + E(n, 'social.deception') * 0.25 - E(n, 'personality.integrity') * 0.45 - E(n, 'personality.pride') * 0.25);
    if (motive < 14) {
      if (W.t > 0) n._flatCache = { until: W.t + 180, val: null };
      return null;
    }
    const targets = [W.byId[W.sect.masterId], W.byId[W.sect.deputyId], SECT.holder(W, 'treasury'), SECT.holder(W, 'registry'), SECT.holder(W, 'martial'), SECT.holder(W, 'mission')].filter(x => x && x.id !== n.id && COG.available(x, W) && !x.hidden && x.rank > n.rank);
    if (!targets.length) return null;
    const perTargetCd = n.cognition?.flatterCd || {};
    const valid = targets.filter(t => (perTargetCd[t.id] || 0) <= W.t);
    if (!valid.length) return null;
    valid.sort((a, b) => (b.rank * 10 + SECT.relationScore(n, b)) - (a.rank * 10 + SECT.relationScore(n, a)));
    const res = { target: valid[0], motiveScore: clamp(motive / 45, 0.2, 1.35) };
    if (W.t > 0) n._flatCache = { until: W.t, val: res };
    return res;
  };

  COG.executeFlattery = (W, actor, targetId) => {
    const target = W && W.byId && W.byId[targetId];
    if (!actor || !target || !COG.available(actor, W) || !COG.available(target, W)) return null;
    const cA = COG.ensure(actor), cT = COG.ensure(target);
    cA.flatterCd = cA.flatterCd || {};
    cA.flatterCd[target.id] = W.t + 3 * 1440; // Per-target 3-day cooldown
    actor.cool.flatter = W.t + 1440; // Per-actor 1-day cooldown
    cT.flatteryHistory = cT.flatteryHistory || {};
    const hist = cT.flatteryHistory[actor.id] || { count: 0, lastAt: -99999, favor: 0 };
    const recentRepeat = W.t - hist.lastAt < 6 * 1440 ? hist.count : 0;

    // Non-omniscient recipient judgment: uses own pride, trustfulness, readPeople, integrity, and observable repetition
    const skill = (E(actor, 'social.persuasion') * 0.5 + E(actor, 'social.charisma') * 0.3 + E(actor, 'social.hospitality') * 0.2);
    const discern = (E(target, 'intellect.readPeople') * 0.45 + E(target, 'intellect.judgement') * 0.35 + E(target, 'personality.integrity') * 0.2) + recentRepeat * 14 - (E(target, 'personality.pride') - 50) * 0.35 - (E(target, 'personality.trustfulness') - 50) * 0.25;
    const rT = SECT.rel(target, actor.id), rA = SECT.rel(actor, target.id);
    rT.n = (rT.n || 0) + 1; rT.last = W.t;
    rA.n = (rA.n || 0) + 1; rA.last = W.t;

    let outcome = 'ignored';
    if (discern >= skill + 12) {
      outcome = 'distrusted';
      rT.t = clamp((rT.t ?? 40) - 4, 0, 100);
      rT.r = clamp((rT.r ?? 30) - 3, 0, 100);
      rT.a = clamp((rT.a || 0) - 2, -100, 100);
      hist.favor = clamp((hist.favor || 0) - 6, -20, 20);
      COG.remember(W, target, { kind: 'suspected_flattery', subjectId: actor.id, severity: 0.45 });
      if (W.log) W.log('politics', actor.h.name.given + ' เข้าพบกล่าวคำยกยอ ' + target.h.name.given + ' แต่กลับถูกมองว่าไม่จริงใจ', [actor.id, target.id]);
    } else if (skill + (E(target, 'personality.pride') - 45) * 0.4 >= discern - 4) {
      outcome = 'welcomed';
      rT.a = clamp((rT.a || 0) + 3, -100, 100);
      hist.favor = clamp((hist.favor || 0) + 5, -20, 18); // Bounded favor cap prevents exploitation loops
      HC.feel(target, { mood: 2 });
      if (W.log) W.log('politics', actor.h.name.given + ' เข้าพบแสดงความเคารพและกล่าวชื่นชม ' + target.h.name.given + ' จนอีกฝ่ายพึงพอใจ', [actor.id, target.id]);
    } else {
      outcome = 'ignored';
      if (W.log && W.rng.chance(0.25)) W.log('relation', actor.h.name.given + ' เข้าพบคารวะ ' + target.h.name.given + ' ตามธรรมเนียม', [actor.id, target.id]);
    }
    hist.count = recentRepeat + 1;
    hist.lastAt = W.t;
    cT.flatteryHistory[actor.id] = hist;
    return { outcome, favor: hist.favor };
  };

  COG.flatteryBonus = (officer, candidate) => {
    if (!officer || !candidate || !officer.cognition || !officer.cognition.flatteryHistory) return 0;
    const h = officer.cognition.flatteryHistory[candidate.id];
    return h ? clamp(h.favor || 0, -15, 15) : 0;
  };

  g.AI.ACTS.flatter = {
    nameTh: 'เข้าพบประจบผู้มีอำนาจ', icon: '🙇', color: '#e6b86a',
    can: (n, W) => !!COG.flatteryCandidate(W, n),
    score(n, W, S) {
      const fc = COG.flatteryCandidate(W, n);
      if (fc) S.add('หวังสร้างสายสัมพันธ์กับ ' + fc.target.h.name.given + ' (' + SECT.title(fc.target) + ')', fc.motiveScore);
    },
    where(W, n) {
      const fc = COG.flatteryCandidate(W, n);
      return fc ? { pos: { x: fc.target.x, y: fc.target.y }, targetId: fc.target.id } : null;
    },
    dur: () => 28,
    tick(n) { n.h.state.energy = Math.max(0, n.h.state.energy - 0.02); },
    done(n, W, ctx) { COG.executeFlattery(W, n, ctx.targetId); },
    cooldown: 1440
  };

  /* ---------- Needs, Petitions & Complaints ---------- */
  COG.submitPetition = (W, n, kind, detail) => {
    if (!W || !W.sect || !n || n.dead || n.exiled) return null;
    const list = W.sect.petitions || (W.sect.petitions = []);
    const existing = list.find(p => p.npcId === n.id && p.kind === kind && p.status === 'open');
    if (existing) return existing;
    const pet = {
      id: 'pet_' + W.t + '_' + n.id,
      npcId: n.id,
      kind, // 'medicine' | 'equipment' | 'complaint'
      detail: detail || '',
      accusedId: detail?.accusedId || null,
      createdAt: W.t,
      expiresAt: W.t + 5 * 1440,
      status: 'open'
    };
    list.push(pet);
    if (list.length > 16) list.shift();
    return pet;
  };

  /* ---------- Office Reviews, Orders, Favoritism & Self-Dealing ---------- */
  COG.officeBias = (W, n, kind) => {
    const critical = (W.sect.shortageDirectives || []).some(x => x.priority === 'critical'), duty = E(n, 'values.sectDuty') / 100, empathy = E(n, 'personality.empathy') / 100;
    if (critical && ['upgrade', 'research', 'seclusion', 'tournament', 'banquet', 'drive'].includes(kind)) return -(0.2 + duty * 0.4);
    if (kind === 'banquet') return (W.avgMood < 0 ? empathy * 0.25 : 0);
    if (kind === 'upgrade') return Object.values(W.sect.facilityDemand || {}).some(x => x.failedAttempts >= 2 || x.congestedHours >= 3) ? duty * 0.35 : 0;
    if (kind === 'audit') return E(n, 'personality.integrity') / 400 * (W.sect.suspicion || 0) / 50;
    return 0;
  };

  COG.officeDecision = (W, n, action, reasons) => {
    const c = COG.ensure(n);
    c.office = COG.role(W, n);
    c.officeDecision = { action, at: W.t, reasons: reasons.slice(0, 3), status: 'attempted' };
  };

  COG.orderBias = (W, n, r) => {
    const e = r.outType === 'PILL' ? ECO.pillInfo(r.outItemId || 'P:' + r.id)?.effect || {} : {};
    let v = 0;
    if (e.healHealth || e.healInjury) v += (E(n, 'personality.empathy') - 50) / 150;
    if (e.cbBuff) v += (E(n, 'values.martialPeak') - 50) / 220;
    if (r.outType === 'EQUIPMENT' && g.MARTIAL && W && Array.isArray(W.npcs)) {
      const outIt = r.outItemId && ECO.itemById && ECO.itemById[r.outItemId];
      const gt = r.gearType || (outIt && outIt.gearType);
      if (gt) {
        if (W._wpnNeedDay !== W.day || !W._wpnNeedMap) {
          const map = Object.create(null);
          for (let i = 0; i < W.npcs.length; i++) {
            const m = W.npcs[i];
            if (!m || m.dead || m.away || !m.cult) continue;
            const pw = (g.MARTIAL.PROFILES && g.MARTIAL.PROFILES[m.cult.sub] && g.MARTIAL.PROFILES[m.cult.sub][3]) || null;
            if (!pw || !pw.length) continue;
            const curW = m.equip && m.equip.WEAPON;
            if (!curW || !pw.includes(g.MARTIAL.gearType(curW))) {
              for (let j = 0; j < pw.length; j++) map[pw[j]] = (map[pw[j]] || 0) + 1;
            }
          }
          W._wpnNeedDay = W.day;
          W._wpnNeedMap = map;
        }
        const needCount = W._wpnNeedMap[gt] || 0;
        if (needCount > 0) v += Math.min(0.42, needCount * 0.16);
      }
    }
    v += (E(n, 'personality.ambition') - E(n, 'personality.caution')) / 500 * Math.max(0, r.tier - 1);
    v += (E(n, 'values.wealthResource') - 50) / 500 * clamp((ECO.outputValue(W, r) - ECO.inputCost(W, r)) / 100, -1, 1);
    return clamp(v, -0.6, 0.6);
  };

  COG.reviewOffice = (W, n) => {
    const r = COG.role(W, n);
    if (!COG.available(n, W) || r.id === 'member') return;
    if (!['master', 'deputy'].includes(r.id) && !COG.hasAuthority(W, n, r.id)) return;
    const short = (W.sect.shortageDirectives || []).filter(d => d.deficit > 0), critical = short.find(d => d.priority === 'critical');
    let title = r.responsibility, actions = ['duty'], targetId = null;
    if (r.id === 'provision') {
      const lack = ECO.count(W, 'meal') < W.npcs.filter(x => !x.dead).length * 3;
      title = lack ? 'เสบียงพร้อมกินต่ำกว่าที่ควรสำรอง' : 'ดูแลเสบียงโดยยังไม่เร่งผลิต';
      actions = lack ? (ECO.count(W, 'grain') >= 3 ? ['cook'] : ['farm']) : ['duty'];
      targetId = lack ? 'meal' : null;
    }
    if (r.id === 'herbal') {
      const d = short.find(d => ECO.matById[d.id]?.category === 'HERB');
      title = d ? 'หาและปลูกส่วนผสมที่ขาด: ' + (d.nameTh || ECO.name(d.id)) : 'ตรวจสมุนไพรที่สำรองไว้';
      actions = d ? ['forage', 'farm'] : ['duty'];
      targetId = d?.id || null;
    }
    if (r.id === 'steward') {
      const entries = Object.entries(W.sect.facilityDemand || {}).filter(([id, x]) => {
        const b = W.map.byId[id], maxLv = SECT.maxBuildingLevel ? SECT.maxBuildingLevel(b) : 3;
        return b && !b.building && b.level < maxLv && W.t - (x.lastCongestionHour || 0) < 2880 && (x.failedAttempts >= 2 || x.congestedHours >= 3);
      });
      entries.sort((a, b) => b[1].failedAttempts - a[1].failedAttempts);
      targetId = entries[0]?.[0] || null;
      title = targetId ? 'เสนอให้เจ้าสำนักพิจารณาขยาย ' + W.map.byId[targetId].nameTh : 'ยังไม่พบความแออัดที่ต้องเสนอขยาย';
    }
    if (r.id === 'wildwarden') {
      const danger = (W.wildlife?.beasts || []).filter(b => !b.dead && !b.gone && b.legendary).length;
      title = danger ? 'เฝ้าระวังอสูรตำนาน ไม่แนะนำผู้ล่าที่ไม่พร้อม' : 'ประเมินพื้นที่และความพร้อมในการล่า';
      actions = danger ? ['guard'] : ['guard', 'wildHunt'];
    }
    if (r.id === 'discipline') {
      title = (W.sect.suspicion || 0) > 0 ? 'มีข้อสงสัยด้านบัญชี ต้องตรวจหลักฐานก่อนกล่าวโทษ' : 'ดูแลระเบียบและตรวจสอบข้อร้องเรียน';
    }
    if (r.id === 'commander') {
      const raid = !!W.threat.raid;
      title = raid ? 'ระดมกำลังป้องกันสำนัก' : (W.wildlife?.beasts || []).some(b => b.legendary && !b.gone && !b.dead) ? 'ประเมินอสูรตำนานก่อนเสี่ยงกำลังพล' : 'ตรวจความพร้อมของกำลังป้องกัน';
      actions = raid ? ['guard', 'duty'] : ['duty', 'practice'];
    }
    if (r.id === 'mission') {
      title = W.threat.roadBlocked > 0 ? 'เส้นทางถูกปิด พิจารณาชะลอภารกิจ' : 'พิจารณาภารกิจตามกำลังและนโยบายสำนัก';
      actions = W.threat.roadBlocked > 0 ? ['duty'] : ['errand'];
    }
    if (r.id === 'alchemy') {
      const d = short.find(d => d.kind === 'medicine');
      actions = d ? ['brewBasic', 'brew'] : ['duty'];
      targetId = d?.id || null;
      title = d ? 'วางแผนโอสถที่ต้องการ: ' + (d.nameTh || ECO.name(d.id)) : 'ตรวจความพร้อมของหอโอสถ';
    }
    if (r.id === 'treasury') {
      title = critical ? 'จัดลำดับซื้อและสำรองของที่ขาด: ' + (critical.nameTh || ECO.name(critical.id)) : 'ตรวจของล้นและเงินสำรองก่อนซื้อขาย';
    }
    if (r.id === 'envoy') {
      const lowVassal = (W.world?.allSects || []).find(s => s && s.isVassal && (s.loyalty || 50) < 40);
      title = lowVassal ? ('ประสานสำนักบริวาร「' + lowVassal.nameTh + '」เพื่อป้องกันการแข็งข้อ') : 'วางแผนการทูตยุทธภพและดูแลบรรณาการสำนักบริวาร';
      actions = ['duty'];
      targetId = lowVassal ? lowVassal.id : null;
    }
    if (r.id === 'spymaster') {
      const uc = W.sect?.internalPolitics?.undercurrent || 0;
      title = uc >= 45 ? ('สอดส่องคลื่นใต้น้ำในสำนัก (' + Math.round(uc) + '/100) และรวบรวมข่าวกรอง') : 'รวบรวมข่าวลือโรงเตี๊ยมและตรวจจับวาสนาฟ้าดิน';
      actions = ['duty'];
    }
    if (r.id === 'beastmaster') {
      const tired = (W.sect?.beasts || []).find(b => b && !b.dead && ((b.fatigue || 0) >= 50 || (b.hunger || 80) <= 45));
      title = tired ? ('ฟื้นฟูและให้อาหารสัตว์วิญญาณ「' + (tired.nameTh || tired.id) + '」') : 'ดูแลอุทยานสัตว์วิญญาณและเตรียมพาหนะออกศึก';
      actions = ['duty', 'guard'];
      targetId = tired ? (tired.uid || tired.id) : null;
    }
    if (r.id === 'arraymaster') {
      title = 'บำรุงรักษาค่ายกลพิทักษ์สำนักและปราการจุดยุทธศาสตร์';
      actions = ['duty', 'forge'];
    }
    if (r.id === 'censor') {
      const uc = W.sect?.internalPolitics?.undercurrent || 0;
      title = uc >= 35 ? ('ไต่สวนความขัดแย้งระหว่างก๊กและระงับคลื่นใต้น้ำ (' + Math.round(uc) + '/100)') : 'ตรวจสอบสมดุลอำนาจและวินัยขุนนางในสภาสำนัก';
      actions = ['duty'];
    }
    if (r.id === 'quartermaster') {
      title = critical ? ('เร่งจัดสรรยุทธปัจจัยแก้การขาดแคลน ' + (critical.nameTh || ECO.name(critical.id))) : 'กำกับคลังยุทธปัจจัยและเส้นทางคาราวานการค้าเสรี';
      actions = ['duty'];
      targetId = critical ? critical.id : null;
    }
    const plans = W.sect.officePlans || (W.sect.officePlans = {});
    plans[r.id] = { by: n.id, title, targetId, actions, at: W.t, expiresAt: W.t + 1440 };
    // Issue actionable order for urgent shortages/threats
    if (targetId || actions[0] !== 'duty') {
      const orders = W.sect.officeOrders || (W.sect.officeOrders = {});
      orders[r.id] = { id: 'ord_' + r.id + '_' + W.t, post: r.id, by: n.id, title, targetId, actions, priority: critical ? 'critical' : 'normal', at: W.t, expiresAt: W.t + 1440 };
    }
    COG.officeDecision(W, n, title, [r.responsibility]);
  };

  COG.reviewOffices = W => {
    COG.syncOfficeAuthority(W);
    for (const id of Object.keys(SECT.POSTS)) {
      const n = SECT.holder(W, id) || (W.sect.delegations && W.sect.delegations[id] && W.byId[W.sect.delegations[id].delegateId]);
      if (n) COG.reviewOffice(W, n);
    }
  };

  // Execute office duty including personality-sensitive allocation, favoritism, or discipline investigation
  COG.performDuty = (W, n) => {
    const r = COG.role(W, n);
    if (r.id === 'member' || !COG.available(n, W)) return;
    COG.reviewOffice(W, n);
    // An ordinary assistant without explicit delegated authority cannot issue official production orders
    if (r.acting && !r.delegated) {
      COG.officeDecision(W, n, 'ช่วยงานภายใต้ผู้มีอำนาจ', [r.responsibility]);
      return;
    }
    if (SECT.governancePractice) SECT.governancePractice(W, n, r.id);
    if (['alchemy', 'forge'].includes(r.id)) {
      const o = ECO.pickOrder(W, r.id, n);
      W.sect.orders[r.id] = o.recipe ? { rid: o.recipe.id, why: o.why, by: n.id } : null;
      if (r.id === 'forge' && SECT.SOUL_FORGE && (W.day - (n._lastSoulForgeDay || -99)) >= 12) {
        n._lastSoulForgeDay = W.day;
        SECT.SOUL_FORGE.awakenWeaponSpirit(W, n, null, { quiet: true });
      }
      COG.officeDecision(W, n, 'จัดแผนผลิต' + (o.recipe ? ' ' + o.recipe.nameTh : ' รอวัตถุดิบ'), [r.responsibility, o.why || 'ยังไม่มีงานผลิตที่พร้อม']);
      return;
    }
    if (r.id === 'scripture' && SECT.SOUL_FORGE && (W.day - (n._lastSutraAnnotateDay || -99)) >= 15) {
      n._lastSutraAnnotateDay = W.day;
      SECT.SOUL_FORGE.annotateHeritageSutra(W, n, null, { quiet: true });
    }
    if (r.id === 'healer' && SECT.HEART_DEMON && (W.day - (n._lastCounselDay || -99)) >= 7) {
      n._lastCounselDay = W.day;
      SECT.HEART_DEMON.counselHeartDemon(W, n, null, null, { quiet: true });
    }
    if (r.id === 'master' && !n.sealed && !n.away) {
      SECT.masterDecision(W, n);
      return;
    }
    if (r.id === 'treasury') {
      // Personality-dependent treasury behavior: fair reserve check vs favoritism gift vs self-dealing
      const integrity = E(n, 'personality.integrity'), greed = E(n, 'values.wealthResource');
      if (integrity < 36 && greed > 65 && W.sect.stones > 500 && (W.day - (n._lastSkimDay || -99)) >= 10 && W.rng.chance(0.25)) {
        const skim = Math.min(45, Math.max(8, Math.round(W.sect.stones * 0.008)));
        W.sect.stones -= skim;
        n.inv.stones = (n.inv.stones || 0) + skim;
        n.embezzled = (n.embezzled || 0) + skim;
        n._lastSkimDay = W.day;
        W.sect.suspicion = (W.sect.suspicion || 0) + 5;
        W.sect.auditTrail = W.sect.auditTrail || [];
        W.sect.auditTrail.push({ day: W.day, t: W.t, actorId: n.id, kind: 'embezzle', amt: skim, evidence: 'ส่วนต่างบัญชีคลังศิลา ' + skim + ' ก้อน' });
        if (W.sect.auditTrail.length > 25) W.sect.auditTrail.shift();
      }
      COG.officeDecision(W, n, 'ตรวจของสำรองและความขาดแคลน', [r.responsibility]);
      return;
    }
    if (r.id === 'discipline') {
      // Evidence-based discipline investigation
      const tre = SECT.holder(W, 'treasury');
      const eye = (E(n, 'intellect.perceptiveness') + E(n, 'intellect.judgement')) / 2;
      if (tre && (tre.embezzled || 0) > 0 && (W.sect.suspicion || 0) > 0) {
        const relBias = SECT.relationScore(n, tre);
        const integrity = E(n, 'personality.integrity');
        // High-integrity discipline officer exposes embezzlement when evidence is found; corrupt/biased officer may overlook a friend
        if (integrity >= 45 || relBias < 25) {
          if (W.rng.next() < clamp(0.25 + eye / 180 + (W.sect.suspicion || 0) / 80, 0.15, 0.85)) {
            SECT.exposeEmbezzle(W, tre, n);
            COG.officeDecision(W, n, 'ตรวจพบหลักฐานทุจริตและลงโทษตามกฎสำนัก', ['หลักฐานส่วนต่างบัญชีคลังชัดเจน']);
            return;
          }
        } else {
          COG.officeDecision(W, n, 'ชะลอการสอบสวนคนสนิทแม้มีข้อสงสัย', ['เห็นแก่ความสัมพันธ์ส่วนตัว']);
          return;
        }
      }
      COG.officeDecision(W, n, 'ดูแลระเบียบและตรวจสอบข้อร้องเรียน', [r.responsibility]);
      return;
    }
    if (['envoy', 'spymaster', 'beastmaster', 'arraymaster', 'censor', 'quartermaster'].includes(r.id) && SECT.runOfficerJurisdictionSingle) {
      const res = SECT.runOfficerJurisdictionSingle(W, r.id, n);
      if (res && res.summaryTh) {
        COG.officeDecision(W, n, res.summaryTh, [r.responsibility]);
        return;
      }
    }
        const status = r.id === 'healer' ? 'ตรวจความจำเป็นของผู้บาดเจ็บ' : r.id === 'guard' ? 'ตรวจความพร้อมในการเฝ้ายาม' : 'ปฏิบัติงานตามตำแหน่ง';
    COG.officeDecision(W, n, status, [r.responsibility]);
  };

  COG.missionBias = (W, approver, kind) => {
    const critical = (W.sect.shortageDirectives || []).some(d => d.priority === 'critical');
    if (critical && kind === 'gather') return E(approver, 'values.sectDuty') / 100 * 0.7;
    if (['hunt', 'bounty'].includes(kind)) return (E(approver, 'personality.courage') - E(approver, 'personality.caution')) / 200;
    if (kind === 'trade') return (E(approver, 'values.wealthResource') - 50) / 100;
    if (kind === 'diplomacy') return (E(approver, 'personality.empathy') - 50) / 100;
    return 0;
  };

  COG.choiceTemperature = n => clamp(0.2 + (E(n, 'temperament.sensationSeeking') + E(n, 'personality.creativity')) / 1100 - (E(n, 'personality.rationality') + E(n, 'intellect.judgement') + E(n, 'personality.discipline')) / 1800 + E(n, 'temperament.emotionalReactivity') / 1400, 0.06, 0.4);

  COG.rallyLeader = (W, f) => {
    if (f.over) return null;
    const current = W.byId[f.ctx.commanderId];
    if (current && COG.available(current, W) && !current.fled && !current.yield && current.h.state.hp >= CULT.hpMax(current) * 0.45 && f.A.includes(current.id) && current.act?.ctx?.fid === f.id) return current;
    const ids = [W.sect.posts.commander, W.sect.posts.guard, W.sect.posts.martial, W.sect.masterId];
    for (const id of ids) {
      const n = W.byId[id];
      if (!COG.available(n, W) || n.fled || n.yield || (f.A.length >= 14 && !f.A.includes(n.id)) || n.h.state.hp < CULT.hpMax(n) * 0.45 || (n.act?.id === 'fight' && !f.A.includes(n.id))) continue;
      const resolve = (E(n, 'personality.courage') + E(n, 'personality.loyalty') + E(n, 'values.sectDuty')) / 300;
      if (resolve < 0.45) continue;
      g.COMBAT.join(W, f, n.id, 'A');
      f.ctx.commanderId = n.id;
      f.ctx.formation = E(n, 'personality.caution') + E(n, 'personality.empathy') > 120 ? 'ตั้งรับรักษากำลัง' : 'รุกสกัดผู้บุกรุก';
      COG.officeDecision(W, n, f.ctx.formation, ['เข้าร่วมการต่อสู้จริงเพื่อป้องกันสำนัก']);
      W.log('raid', n.h.name.given + ' นำกำลัง ' + f.ctx.formation, [n.id]);
      return n;
    }
    return null;
  };

  /* ============================================================================
   * 9. READ-ONLY EXPLANATION FOR UI & INSPECTION (PURE — ZERO RNG, ZERO MUTATION)
   * ============================================================================ */
  COG.evaluateSituationalAwareness = (W, n) => {
    if (!W || !n || !n.h) return { activeCircumstances: [], excludedCircumstances: [], competingPriorities: [], practicalBlockers: [] };
    const activeCircumstances = [];
    const excludedCircumstances = [];
    const competingPriorities = [];
    const practicalBlockers = [];
    const s = n.h.state, curAct = n.act ? n.act.id : 'idle';
    const hpMax = CULT.hpMax(n);
    const r = COG.role(W, n);
    const goal = n.cognition && n.cognition.goal && !complete(W, n, n.cognition.goal) ? n.cognition.goal : null;

    // 1. Vital & Health Needs
    if (s.hp < hpMax * 0.4 || (n.inj && n.inj.length)) {
      const sev = (n.inj && n.inj.length) ? Math.max(...n.inj.map(i => i.sev || 1)) : 1;
      const isHealing = ['heal', 'personalPillUse', 'sleep'].includes(curAct);
      activeCircumstances.push({ kind: 'injury_or_low_hp', summaryTh: 'บาดเจ็บ/พลังชีวิตต่ำ (ระดับความรุนแรง ' + sev + ')', targetActions: ['heal', 'personalPillUse'], isAddressingNow: isHealing });
      if (!safe(n) || sev >= 2) competingPriorities.push('ต้องรักษาอาการบาดเจ็บก่อนทำงานหรือฝึกยุทธ์หนัก');
    }
    if (s.satiety < 24) {
      competingPriorities.push('ความหิวเร่งด่วน (' + Math.round(s.satiety) + '/100)');
      activeCircumstances.push({ kind: 'hunger', summaryTh: 'หิวโหย ต้องรับประทานอาหาร', targetActions: ['eat'], isAddressingNow: curAct === 'eat' });
    }
    if (s.rest < 14) {
      competingPriorities.push('ความอ่อนล้าเร่งด่วน (' + Math.round(s.rest) + '/100)');
      activeCircumstances.push({ kind: 'exhaustion', summaryTh: 'อ่อนล้าสะสม ต้องนอนพักผ่อน', targetActions: ['sleep'], isAddressingNow: curAct === 'sleep' });
    }

    // 2. Progression Bottleneck
    const bn = (n.cult && CULT.inspectProgressionBottleneck) ? CULT.inspectProgressionBottleneck(W, n) : null;
    if (bn && bn.active) {
      if (bn.competingNeed) {
        excludedCircumstances.push({ kind: 'bottleneck_deferred', reasonTh: 'ชะลอการแก้คอขวดชั่วคราวเพราะ' + bn.competingNeed });
      } else {
        activeCircumstances.push({
          kind: bn.kind === 'track' ? 'track_bottleneck' : 'major_bottleneck',
          summaryTh: bn.explanationTh,
          targetActions: bn.feasibleActions.slice(0, 4),
          isAddressingNow: !!bn.isActivelyResolving
        });
      }
      if (bn.blockerReasonTh) practicalBlockers.push(bn.blockerReasonTh);
      else if (Array.isArray(bn.blockedReasons)) {
        for (let i = 0; i < Math.min(2, bn.blockedReasons.length); i++) practicalBlockers.push(bn.blockedReasons[i]);
      }
    }

    // 3. Library Manuals & Bounded Awareness
    if (W.sect && Array.isArray(W.sect.library) && W.sect.library.length && n.cult) {
      const hiddenFromNpc = W.sect.library.filter(id => !COG.isAwareOf(W, n, 'library_tech', id));
      if (hiddenFromNpc.length) {
        excludedCircumstances.push({ kind: 'unperceived_manual', reasonTh: 'ยังไม่รับรู้คัมภีร์ใหม่ในหอคัมภีร์ (' + hiddenFromNpc.length + ' เล่ม) เนื่องจากยังไม่ได้แวะหอคัมภีร์หรือศูนย์ข่าวสาร' });
      }
      const nextT = g.AI && g.AI.nextTechToStudy ? g.AI.nextTechToStudy(W, n) : null;
      if (nextT) {
        activeCircumstances.push({
          kind: 'accessible_technique',
          summaryTh: 'รับรู้คัมภีร์ที่เรียนได้「' + nextT.nameTh + '」',
          targetActions: ['study', 'guidedStudy'],
          isAddressingNow: curAct === 'study' || curAct === 'guidedStudy'
        });
      }
    }

    // 4. Ancestral Shrine Legacy Tablets
    if (W.sect && Array.isArray(W.sect.legacyTablets) && W.sect.legacyTablets.length && n.cult) {
      if (CULT.isAncestralBlessingActive ? CULT.isAncestralBlessingActive(n, W.t) : (n.ancestralBlessing && (!n.ancestralBlessing.until || n.ancestralBlessing.until >= W.t))) {
        activeCircumstances.push({
          kind: 'ancestral_blessing_active',
          summaryTh: 'ได้รับพรบรรพชนจาก「' + n.ancestralBlessing.elderNameTh + '」(เร่งศึกษา ×' + n.ancestralBlessing.studySpeedMult + ' · ทะลวง +' + Math.round(n.ancestralBlessing.breakthroughBonus * 100) + '%)',
          targetActions: ['cultivate', 'study', 'breakthrough'],
          isAddressingNow: ['cultivate', 'study', 'breakthrough'].includes(curAct)
        });
      } else {
        const tabs = W.sect.legacyTablets;
        const match = tabs.some(t => t.sub === n.cult.sub || t.path === n.cult.path || t.npcId === n.mentor);
        const needBlessing = !!(n.cult.bn || CULT.ready(n) || (n.cult.track && CULT.trackReady && CULT.trackReady(n)) || n.cult.learning || (s.heartDemon || 0) >= 35);
        if (match && needBlessing) {
          activeCircumstances.push({
            kind: 'ancestral_blessing_opportunity',
            summaryTh: 'มีป้ายวิญญาณบรรพชนตรงสายพร้อมขอพรหนุนการทะลวงขั้น/ศึกษาวิชา',
            targetActions: ['pray'],
            isAddressingNow: curAct === 'pray'
          });
        } else {
          excludedCircumstances.push({
            kind: 'ancestral_tablet_not_needed',
            reasonTh: match ? 'มีป้ายวิญญาณบรรพชนแต่ยังไม่ติดคอขวดหรือเรียนวิชาสำคัญ' : 'ป้ายวิญญาณบรรพชนในศาลต่างวิถีและยังไม่มีความจำเป็นเร่งด่วน'
          });
        }
      }
    }

    // 5. Sanctum Catalyst Gear Refinement & Build Improvisation
    if (ECO.findCatalystRefinementCandidate) {
      const rc = ECO.findCatalystRefinementCandidate(W, n);
      if (rc) {
        activeCircumstances.push({
          kind: 'catalyst_refinement_ready',
          summaryTh: 'มีผลึกโบราณ「' + rc.cat.nameTh + '」พร้อมขัดเกลา「' + rc.gear.nameTh + '」',
          targetActions: ['forge'],
          isAddressingNow: curAct === 'forge'
        });
      }
    }
    if (n.cult && COG.evaluateBuildImprovisation) {
      const imp = COG.evaluateBuildImprovisation(W, n);
      if (imp && imp.mode && imp.mode !== 'optimal' && imp.mode !== 'none') {
        activeCircumstances.push({
          kind: 'build_improvisation',
          mode: imp.mode,
          summaryTh: imp.summaryTh,
          targetActions: imp.targetActions.slice(0, 3),
          isAddressingNow: imp.targetActions.includes(curAct)
        });
      }
    }

    // 6. Office Duties & Sect Crises
    if (r.id !== 'member') {
      competingPriorities.push('หน้าที่ประจำตำแหน่ง: ' + r.title);
    }
    if (W.threat && (W.threat.raid || W.threat.alert > 0)) {
      competingPriorities.push(W.threat.raid ? 'สำนักกำลังถูกโจมตี ต้องป้องกันสำนัก' : 'สำนักอยู่ในภาวะเฝ้าระวังภัยคุกคาม');
    }
    if (goal && goal.blocked) {
      practicalBlockers.push(goal.blockReason || goal.missingPrereq || 'ติดเงื่อนไขเป้าหมาย');
    }

    return { activeCircumstances, excludedCircumstances, competingPriorities, practicalBlockers };
  };

  COG.explain = (W, n) => {
    const c = n.cognition, r = COG.role(W, n), goal = c?.goal && !complete(W, n, c.goal) ? c.goal : null, last = c?.trace?.at(-1);
    const aspRanked = COG.evaluateAspirations(W, n);
    const asp = c?.aspiration || (aspRanked[0] && ASPIRATIONS[aspRanked[0].id] ? {
      id: aspRanked[0].id,
      title: ASPIRATIONS[aspRanked[0].id].title,
      descTh: ASPIRATIONS[aspRanked[0].id].descTh,
      reasonTh: aspRanked[0].reasonTh,
      progress: 0,
      milestones: []
    } : null);
    const stepInfo = goal ? computeGoalStep(W, n, goal) : null;
    const master = W && W.sect && W.byId ? W.byId[W.sect.masterId] : null;
    const defMaster = (master && master.id !== n.id) ? COG.deferenceToward(W, n, master) : null;
    const estimates = [];
    if (goal && goal.id === 'scripture' && goal.targetId) {
      const t = CULT.tech(goal.targetId);
      if (t) {
        const fc = COG.forecast(W, n, 'affordability', { price: g.CPE ? g.CPE.techPrice(W, t) : 0 });
        if (fc) estimates.push(fc.assumptionsTh);
      }
    } else if (goal && goal.id === 'gear_upgrade' && goal.price) {
      const fc = COG.forecast(W, n, 'affordability', { price: goal.price });
      if (fc) estimates.push(fc.assumptionsTh);
    }
    if (r.id === 'treasury' || r.id === 'provision' || r.id === 'master') {
      const fcR = COG.forecast(W, n, 'reserves');
      if (fcR) estimates.push(fcR.assumptionsTh);
    }
    return {
      role: r.title,
      responsibility: r.responsibility,
      acting: r.acting,
      delegated: r.delegated,
      aspiration: asp ? {
        id: asp.id,
        title: asp.title,
        descTh: asp.descTh,
        reasonTh: asp.reasonTh,
        progress: asp.progress || 0,
        milestones: (asp.milestones || []).slice(-3)
      } : null,
      goal: goal ? {
        id: goal.id,
        title: goal.title,
        targetId: goal.targetId,
        step: goal.step || stepInfo?.step || 'active',
        stepTitle: goal.stepTitle || stepInfo?.stepTitle || goal.title,
        missingPrereq: goal.missingPrereq || stepInfo?.missingPrereq || null,
        blocked: goal.blockReason || goal.missingPrereq || stepInfo?.missingPrereq || null,
        status: goal.status || 'active'
      } : null,
      suspendedGoal: c?.suspendedGoal ? {
        id: c.suspendedGoal.id,
        title: c.suspendedGoal.title,
        reason: c.suspendedGoal.suspendReason || 'ระงับชั่วคราว'
      } : null,
      lastGoal: c?.lastGoal ? { ...c.lastGoal } : null,
      commitment: c?.commitment ? { ...c.commitment } : null,
      deferenceToMaster: defMaster,
      estimates,
      actionId: last?.actionId || n.act?.id || null,
      reasons: (last?.reasons || n.why || []).map(x => x.slice()),
      bottleneck: (n && n.cult && CULT.inspectProgressionBottleneck) ? CULT.inspectProgressionBottleneck(W, n) : null,
      situational: COG.evaluateSituationalAwareness(W, n),
      buildImprovisation: COG.evaluateBuildImprovisation ? COG.evaluateBuildImprovisation(W, n) : null,
      officeDecision: c?.officeDecision ? { ...c.officeDecision } : null
    };
  };

  g.COG = COG;
  if (typeof module === 'object' && module.exports) module.exports = COG;
})(typeof globalThis !== 'undefined' ? globalThis : this);
