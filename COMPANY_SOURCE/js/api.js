(function (root, factory) {
  "use strict";
  const node = typeof module === "object" && module.exports;
  const value = factory(
    node ? require("./human-core.js") : root.CompanyCore,
    node ? require("./sim.js") : root.CompanySim,
    node ? require("./save.js") : root.CompanySave,
    node ? require("./layout.js") : root.CompanyLayout,
  );
  if (node) module.exports = value;
  else root.CompanyAPI = value;
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function (H, S, Save, L) {
    "use strict";
    const clone = (o) => JSON.parse(JSON.stringify(o)),
      freeze = (o) => {
        if (o && typeof o === "object" && !Object.isFrozen(o)) {
          Object.values(o).forEach(freeze);
          Object.freeze(o);
        }
        return o;
      };
    const labels = {
      humility: "ความถ่อมตน",
      optimism: "แนวโน้มมองอนาคตในทางบวก",
      care: "ความเอื้ออาทร",
      stewardship: "ความรับผิดชอบต่อสิ่งมีชีวิตและส่วนรวม",
      influence: "อำนาจในการกำหนดทิศทาง",
      tradition: "ความผูกพันกับธรรมเนียม",
      variety: "ความหลากหลายของประสบการณ์",
      craftsmanship: "คุณค่าของฝีมือและความประณีต",
      numerical: "การเข้าใจตัวเลข",
      verbal: "การเข้าใจภาษา",
      attention: "การกำกับและแบ่งความสนใจ",
      problemSensitivity: "การสังเกตความผิดปกติ",
      perceptualSpeed: "การจำแนกแบบแผนอย่างรวดเร็ว",
      reactionSpeed: "การตอบสนองต่อสัญญาณ",
      controlPrecision: "การควบคุมเครื่องจักรอย่างแม่นยำ",
      coordination: "การประสานการเคลื่อนไหว",
      balance: "การทรงตัว",
      flexibility: "ความยืดหยุ่นทางกาย",
      visualAcuity: "การเห็นรายละเอียด",
      colorDiscrimination: "การแยกเฉดสี",
      hearing: "การจำแนกเสียง",
      speechClarity: "ความชัดเจนในการออกเสียง",
      tasteSmell: "การจำแนกรสและกลิ่น",
      uncertaintyReasoning: "การให้เหตุผลเมื่อข้อมูลไม่แน่นอน",
      sociability: "การเข้าสังคม",
      conscientiousness: "ความรับผิดชอบ",
      agreeableness: "การร่วมมือ",
      openness: "ความเปิดรับ",
      riskTaking: "ความกล้าเสี่ยง",
      stressReactivity: "ความไวต่อความเครียด",
      assertiveness: "ความกล้าแสดงออก",
      patience: "ความอดทนรอ",
      integrity: "ความซื่อตรง",
      adaptability: "ความยืดหยุ่นปรับตัว",
      ambition: "แรงผลักดันถีบตัว",
      prudence: "ความรอบคอบก่อนลงมือ",
      security: "ความมั่นคง",
      income: "รายได้",
      autonomy: "อิสระ",
      fairness: "ความเป็นธรรม",
      belonging: "ความเป็นส่วนหนึ่ง",
      learning: "การเรียนรู้",
      achievement: "ความสำเร็จ",
      meaning: "ความหมาย",
      workLifeBalance: "สมดุลชีวิต",
      recognition: "การยอมรับและเกียรติภูมิ",
      family: "ความรักและครอบครัว",
      comfort: "คุณภาพชีวิตและทรัพย์สิน",
      analytical: "การวิเคราะห์",
      creativity: "ความคิดสร้างสรรค์",
      communication: "การสื่อสาร",
      organization: "การจัดระบบ",
      precision: "ความละเอียดแม่นยำ",
      dexterity: "ความคล่องมือ",
      learningSpeed: "การเรียนรู้เร็ว",
      stamina: "ความอึดทน",
      memory: "ความจำ",
      emotionalInsight: "การเข้าใจอารมณ์",
      spatial: "มิติสัมพันธ์และโครงสร้าง",
      strength: "พละกำลังกาย",
      composure: "ความนิ่งในวิกฤต",
      sensory: "ประสาทสัมผัสและสุนทรียะ",
    };
    function view(w) {
      const day = Math.floor(w.clock.absoluteMinute / 1440) + 1,
        minute = w.clock.absoluteMinute % 1440,
        employed = w.people.filter((p) => p.employed),
        burn =
          w.catalog.rules.rentDaily +
          Math.round(w.finance.debt * w.catalog.rules.interestDaily) +
          employed.reduce((n, p) => n + p.pay.dailyWage, 0) +
          w.policies.wellbeingDaily * employed.length;
      const people = w.people.map((p) => {
        const unpaidDays =
          p.pay.overdueSince === null
            ? 0
            : Math.max(1, day - p.pay.overdueSince);
        return {
          id: p.id,
          name: p.name,
          role: p.role,
          roleName: w.catalog.roles[p.role].nameTh,
          employed: p.employed,
          profile: p.profile,
          state: p.state,
          affect: H.deriveAffect(p.profile, p.state, { unpaidDays }),
          aspirations: H.deriveAspirations(p.profile, p.state, {
            wallet: p.pay.wallet,
            goalSpecs: w.catalog.lifeGoals,
          }),
          skills: p.skills,
          experience: p.experience,
          relationships: p.relationships,
          concern: p.concern,
          pay: p.pay,
          activity: p.activity,
          intent: p.intent,
          decision: p.decision || null,
          ot: p.ot,
          taskId: p.taskId,
          stationId: p.stationId,
          position: p.position,
          previousPosition: p.previousPosition,
          path: p.path,
          zoneId: L.zoneAt(w.layout, p.position),
          visible: p.employed && p.atWork,
          visual: p.visual,
        };
      });
      const jobs = Object.values(w.jobs).map((j) => {
        let blockedReason = null;
        if (!j.assignee) {
          const u = w.units[j.unitId];
          if (
            u &&
            !u.materialConsumed &&
            !u.reserved &&
            Object.entries(w.catalog.products[u.productId].bom).some(
              ([m, n]) =>
                w.inventory.materials[m] - w.inventory.reserved[m] < n,
            )
          )
            blockedReason = "materials";
          else if (
            !Object.values(w.layout.stations).some(
              (s) =>
                s.kind === j.stationKind &&
                w.people.filter(
                  (p) => p.employed && p.taskId && p.stationId === s.id,
                ).length < s.capacity,
            )
          )
            blockedReason = "stationCapacity";
        }
        return { ...j, fraction: j.progress / j.required, blockedReason };
      });
      const units = Object.values(w.units).map((u) => {
        const job = Object.values(w.jobs).find((j) => j.unitId === u.id),
          person = job && w.people.find((p) => p.id === job.assignee);
        return {
          ...u,
          stationId: person?.stationId || null,
          storageStationId:
            u.stage === "ready"
              ? "finished"
              : !u.materialConsumed
                ? "stock"
                : null,
        };
      });
      return freeze(
        clone({
          apiVersion: "1.0.0",
          gameVersion: S.VERSION,
          core: {
            version: H.VERSION,
            status: "locked",
            personalityDimensions: H.PERSONALITY.length,
            valueDimensions: H.VALUES.length,
            aptitudeDimensions: H.APTITUDES.length,
          },
          time: {
            absoluteMinute: w.clock.absoluteMinute,
            day,
            minute,
            tick: w.clock.tick,
            hour: Math.floor(minute / 60),
            minuteOfHour: minute % 60,
          },
          seed: w.seed,
          status: w.status,
          outcome: w.outcome,
          company: {
            cash: w.finance.cash,
            debt: w.finance.debt,
            reputation: w.reputation,
            dailyBurnEstimate: burn,
            runwayDays: burn
              ? Math.floor((w.finance.cash / burn) * 10) / 10
              : null,
            runwayNote: "ค่าใช้จ่ายเฉลี่ย ไม่ใช่วันล้มละลายแน่นอน",
            unpaidWages: w.people.reduce(
              (n, p) => n + p.pay.dueBase + p.pay.dueOT,
              0,
            ),
            overdueBills: w.finance.payables,
            receivable: Object.values(w.invoices)
              .filter((i) => i.status === "unpaid")
              .reduce((n, i) => n + i.amount, 0),
            totals: w.finance.totals,
            metrics: w.metrics,
          },
          policies: w.policies,
          people,
          offers: Object.values(w.offers).filter((o) => o.status === "open"),
          orders: Object.values(w.orders),
          jobs,
          purchases: Object.values(w.purchases),
          invoices: Object.values(w.invoices),
          inventory: w.inventory,
          research: w.research,
          production: w.production,
          catalog: {
            materials: Object.values(w.catalog.materials),
            products: Object.values(w.catalog.products).map((p) => ({
              ...p,
              bomCost: Object.entries(p.bom).reduce(
                (n, [m, q]) => n + w.catalog.materials[m].unitCost * q,
                0,
              ),
              unlocked: w.research.unlocked.includes(p.id),
            })),
            skills: Object.values(w.catalog.skills),
            roles: Object.entries(w.catalog.roles).map(([id, r]) => ({
              id,
              ...r,
            })),
            taskKinds: Object.values(w.catalog.taskKinds || {}),
            dimensions: {
              personality: H.PERSONALITY.map((id) => ({
                id,
                nameTh: labels[id],
              })),
              values: H.VALUES.map((id) => ({ id, nameTh: labels[id] })),
              aptitudes: H.APTITUDES.map((id) => ({ id, nameTh: labels[id] })),
            },
          },
          candidates: S.candidates(w),
          scene: {
            coordinateSystem: "tile-x-right-y-down",
            tileSize: 1,
            layout: w.layout,
            units,
            people: people.map((p) => ({
              id: p.id,
              position: p.position,
              previousPosition: p.previousPosition,
              path: p.path,
              activity: p.activity,
              stationId: p.stationId,
              visible: p.visible,
              visual: p.visual,
            })),
          },
          events: w.events.slice(-30),
          ledger: w.finance.entries.slice(-30),
          dailyHistory: w.history.days.slice(-30),
          taskHistory: w.history.tasks.slice(-30),
        }),
      );
    }
    function create(seed = "company") {
      let world = S.create(seed),
        speed = 0,
        lastFrame = null,
        accumulator = 0,
        lastError = null;
      const listeners = new Set();
      const snapshot = () => view(world);
      const publish = () => {
        if (!listeners.size) return;
        const data = snapshot();
        for (const fn of listeners)
          try {
            fn(data);
          } catch (e) {
            lastError = e.message || String(e);
          }
      };
      const api = {
        snapshot,
        dispatch(command) {
          const result = S.command(world, command);
          if (result.ok) publish();
          return result;
        },
        advance(minutes) {
          const result = S.advance(world, minutes);
          publish();
          return result;
        },
        save() {
          return Save.serialize(world);
        },
        load(text) {
          let next;
          try {
            next = Save.deserialize(text);
          } catch (e) {
            return { ok: false, code: "invalidSave", message: e.message };
          }
          world = next;
          lastFrame = null;
          accumulator = 0;
          publish();
          return { ok: true };
        },
        newGame(nextSeed) {
          const next = S.create(nextSeed);
          world = next;
          speed = 0;
          lastFrame = null;
          accumulator = 0;
          publish();
          return snapshot();
        },
        subscribe(fn) {
          if (typeof fn !== "function")
            throw new TypeError("listener must be a function");
          listeners.add(fn);
          try {
            fn(snapshot());
          } catch (e) {
            lastError = e.message || String(e);
          }
          return () => listeners.delete(fn);
        },
        setSpeed(value) {
          if (![0, 1, 2, 5, 10, 20].includes(value))
            throw new TypeError("unsupported speed");
          speed = value;
          lastFrame = null;
          accumulator = 0;
        },
        getSpeed() {
          return speed;
        },
        resetClock() {
          lastFrame = null;
          accumulator = 0;
        },
        frame(timestamp) {
          if (typeof timestamp !== "number" || !Number.isFinite(timestamp))
            throw new TypeError("invalid frame time");
          const dt = lastFrame === null ? 0 : timestamp - lastFrame;
          lastFrame = timestamp;
          if (dt < 0 || dt > 1000 || speed === 0 || world.status !== "running")
            return 0;
          accumulator += (dt / 1000) * 10 * speed;
          const minutes = Math.floor(accumulator / S.TICK) * S.TICK;
          if (minutes) {
            accumulator -= minutes;
            const result = S.advance(world, minutes);
            publish();
            return result;
          }
          return 0;
        },
        lastPresentationError() {
          return lastError;
        },
        audit() {
          return Save.validate(world);
        },
      };
      return Object.freeze(api);
    }
    return Object.freeze({ VERSION: "1.0.0", create });
  },
);
