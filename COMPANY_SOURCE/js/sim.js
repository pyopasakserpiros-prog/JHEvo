(function (root, factory) {
  "use strict";
  const node = typeof module === "object" && module.exports;
  const value = factory(
    node ? require("./human-core.js") : root.CompanyCore,
    node ? require("./data.js") : root.CompanyData,
    node ? require("./layout.js") : root.CompanyLayout,
    node ? require("./economy.js") : root.CompanyEconomy,
  );
  if (node) module.exports = value;
  else root.CompanySim = value;
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function (H, D, L, E) {
    "use strict";
    const VERSION = "0.1.0",
      SCHEMA = "company-foundation-1",
      TICK = 5;
    const BUILTIN_TASK_SKILLS = {
      assembly: "assembly",
      rework: "assembly",
      qa: "quality",
      packing: "logistics",
      shipping: "logistics",
      purchase: "admin",
      invoice: "admin",
      research: "engineering",
      sales: "sales",
    };
    const BUILTIN_TASK_STATIONS = {
      assembly: "assembly",
      rework: "assembly",
      qa: "quality",
      packing: "packing",
      shipping: "shipping",
      purchase: "admin",
      invoice: "admin",
      research: "research",
      sales: "sales",
    };
    const clone = (o) => JSON.parse(JSON.stringify(o)),
      clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const now = (w) => w.clock.absoluteMinute,
      day = (w) => Math.floor(now(w) / 1440) + 1,
      tod = (w) => now(w) % 1440;
    const id = (w, prefix) => prefix + "-" + ++w.sequence;
    const own = (obj, key) =>
      obj && typeof key === "string" && Object.hasOwn(obj, key)
        ? obj[key]
        : null;
    const int = (n, min = 0, max = Number.MAX_SAFE_INTEGER) =>
      Number.isSafeInteger(n) && n >= min && n <= max;
    function seedHash(seed) {
      let h = 2166136261;
      for (const ch of String(seed)) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0 || 0x9e3779b9;
    }
    function random(w) {
      let x = w.rng.state;
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      w.rng.state = x >>> 0;
      w.rng.draws++;
      return w.rng.state / 4294967296;
    }
    function event(w, code, message, details = {}) {
      w.events.push({
        id: id(w, "event"),
        at: now(w),
        code,
        message,
        details: clone(details),
      });
      if (w.events.length > 120) w.events.shift();
    }
    function post(w, kind, delta, reference) {
      return E.post(w.finance, {
        id: id(w, "tx"),
        kind,
        delta,
        at: now(w),
        reference,
      });
    }
    function createPerson(w, pid, name, role, wage) {
      const profile = H.createProfile(w.seed, pid),
        skills = {};
      for (const spec of Object.values(w.catalog.skills))
        skills[spec.id] = H.createSkill(profile, spec);
      const primary = w.catalog.roles[role].skill;
      skills[primary].level = Math.min(
        H.skillCap(profile, w.catalog.skills[primary]),
        skills[primary].level + 23,
      );
      return {
        id: pid,
        name,
        role,
        profile,
        skills,
        state: H.createState(profile),
        employed: true,
        hiredAt: now(w),
        leftAt: null,
        position: { ...w.layout.entrance },
        previousPosition: { ...w.layout.entrance },
        path: [],
        activity: "offDuty",
        intent: { code: "offDuty", reasons: [] },
        decision: null,
        taskId: null,
        stationId: null,
        breakUntil: 0,
        breakKind: null,
        atWork: false,
        ot: { day: 0, decision: "none", maxMinutes: 0 },
        pay: {
          dailyWage: wage,
          dayWage: wage,
          overdueSince: null,
          dueBase: 0,
          dueOT: 0,
          totalEarned: 0,
          totalPaid: 0,
          wallet: 0,
          outsideSpending: 0,
        },
        experience: { workMinutes: 0, helpMinutes: 0 },
        dayStats: { workMinutes: 0, otMinutes: 0 },
        relationships: {},
        concern: null,
        visual: {
          key: "employee.default",
          variant: seedHash(pid),
          roleKey: role,
        },
      };
    }
    function makeOffer(w, productId, quantity, days = 6, salesQuality = 0.65) {
      const p = w.catalog.products[productId],
        oid = id(w, "offer"),
        rawRoll = random(w),
        repBias = ((w.reputation - 45) / 100) * 0.15,
        skillBias = (salesQuality - 0.65) * 0.2,
        blended = clamp(rawRoll + repBias + skillBias, 0, 1),
        price = Math.round(p.priceMin + (p.priceMax - p.priceMin) * blended);
      w.offers[oid] = {
        id: oid,
        productId,
        quantity,
        unitPrice: price,
        deadline: now(w) + days * 1440,
        expiresAt: now(w) + 1440 * 3,
        paymentMinutes: Math.round(random(w) * 2) * 1440,
        depositPct: 0.3,
        customerName: "ลูกค้า " + oid.split("-")[1],
        status: "open",
      };
      return w.offers[oid];
    }
    function create(seed = "company", options = {}) {
      if (
        !(
          typeof seed === "string" ||
          (typeof seed === "number" && Number.isFinite(seed))
        )
      )
        throw new TypeError("invalid seed");
      const catalog = options.catalog
        ? clone(options.catalog)
        : D.createCatalog();
      if (!catalog.taskKinds) catalog.taskKinds = {};
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      const materials = Object.fromEntries(
          Object.keys(catalog.materials).map((k) => [
            k,
            catalog.initialStock[k] || 0,
          ]),
        ),
        zeros = Object.fromEntries(Object.keys(materials).map((k) => [k, 0])),
        productsZero = Object.fromEntries(
          Object.keys(catalog.products).map((k) => [k, 0]),
        );
      const w = {
        version: VERSION,
        schema: SCHEMA,
        coreVersion: H.VERSION,
        seed: String(seed),
        clock: { absoluteMinute: 540, tick: 0 },
        sequence: 0,
        rng: { state: seedHash(seed), draws: 0 },
        catalog,
        layout: L.createLayout(),
        finance: E.createFinance(
          catalog.rules.initialCash,
          catalog.rules.initialDebt,
        ),
        inventory: {
          materials,
          opening: clone(materials),
          reserved: clone(zeros),
          purchased: clone(zeros),
          consumed: clone(zeros),
          finished: clone(productsZero),
        },
        production: {
          started: clone(productsZero),
          completed: clone(productsZero),
          scrapped: clone(productsZero),
          shipped: clone(productsZero),
        },
        people: [],
        orders: {},
        offers: {},
        units: {},
        jobs: {},
        purchases: {},
        invoices: {},
        research: {
          points: 0,
          unlocked: Object.values(catalog.products)
            .filter((p) => p.researchRequired === 0)
            .map((p) => p.id),
        },
        reputation: 45,
        policies: {
          autoBuy: true,
          autoAccept: false,
          workPriority: "balanced",
          overtimeHours: 0,
          overtimeMultiplier: 1.5,
          wellbeingDaily: 0,
        },
        status: "running",
        outcome: null,
        lastSettledDay: 0,
        nextCandidate: 1,
        events: [],
        history: { tasks: [], days: [] },
        socialAt: {},
        metrics: { ordersPaid: 0, unitsScrapped: 0, receipts: 0 },
      };
      w.people = catalog.starters.map((s, i) =>
        createPerson(w, "employee-" + (i + 1), s.name, s.role, s.dailyWage),
      );
      const first = w.research.unlocked[0];
      makeOffer(w, first, 8, 6);
      makeOffer(w, first, 10, 8);
      event(
        w,
        "companyStarted",
        "เริ่มบริษัท: เลือกรับงานเพื่อให้ทีมเริ่มผลิต",
      );
      return w;
    }
    function job(w, kind, fields = {}) {
      const custom = own(w.catalog.taskKinds, kind);
      const skill = BUILTIN_TASK_SKILLS[kind] || (custom && custom.skill);
      const stationKind =
        BUILTIN_TASK_STATIONS[kind] || (custom && custom.stationKind);
      if (!skill || !stationKind)
        throw new TypeError("unknown job kind: " + kind);
      const j = {
        id: id(w, "job"),
        kind,
        skill,
        stationKind,
        required: custom ? custom.requiredMinutes : 10,
        progress: 0,
        assignee: null,
        createdAt: now(w),
        ...fields,
      };
      w.jobs[j.id] = j;
      return j;
    }
    function addUnit(w, order) {
      const p = w.catalog.products[order.productId],
        u = {
          id: id(w, "unit"),
          orderId: order.id,
          productId: p.id,
          stage: "assembly",
          reserved: false,
          materialConsumed: false,
          quality: 0,
          attempts: 0,
        };
      w.units[u.id] = u;
      job(w, "assembly", {
        unitId: u.id,
        orderId: order.id,
        required: p.assemblyMinutes,
      });
      return u;
    }
    function reserve(w, u) {
      if (u.materialConsumed) return true;
      if (u.reserved) return true;
      const bom = w.catalog.products[u.productId].bom;
      if (
        Object.entries(bom).some(
          ([m, n]) => w.inventory.materials[m] - w.inventory.reserved[m] < n,
        )
      )
        return false;
      for (const [m, n] of Object.entries(bom)) w.inventory.reserved[m] += n;
      u.reserved = true;
      return true;
    }
    function unreserve(w, u) {
      if (u && u.reserved) {
        for (const [m, n] of Object.entries(
          w.catalog.products[u.productId].bom,
        ))
          w.inventory.reserved[m] -= n;
        u.reserved = false;
      }
    }
    function consume(w, u) {
      if (u.materialConsumed) return;
      if (!reserve(w, u))
        throw Error("materials unavailable after reservation");
      for (const [m, n] of Object.entries(
        w.catalog.products[u.productId].bom,
      )) {
        w.inventory.reserved[m] -= n;
        w.inventory.materials[m] -= n;
        w.inventory.consumed[m] += n;
      }
      u.reserved = false;
      u.materialConsumed = true;
      if (w.orders[u.orderId]) w.orders[u.orderId].materialConsumed = true;
      w.production.started[u.productId]++;
    }
    function release(w, p) {
      const j = w.jobs[p.taskId];
      if (j) {
        j.assignee = null;
        if (j.unitId) unreserve(w, w.units[j.unitId]);
      }
      p.taskId = null;
      p.stationId = null;
      p.path = [];
    }
    function destination(w, p, station, activity, reason) {
      const path = L.findPath(w.layout, p.position, station.access);
      if (path === null) {
        p.activity = "blocked";
        p.intent = { code: "unreachableStation", reasons: [station.id] };
        return false;
      }
      p.stationId = station.id;
      p.path = path;
      p.activity = path.length ? "walking" : activity;
      p.intent = { code: reason, reasons: [station.id] };
      return true;
    }
    function stations(w, kind) {
      return Object.values(w.layout.stations).filter(
        (s) =>
          s.kind === kind &&
          w.people.filter((p) => p.employed && p.taskId && p.stationId === s.id)
            .length < s.capacity,
      );
    }
    function pauseFor(w, p, kind, minutes, reason, decision = null) {
      release(w, p);
      p.breakKind = kind;
      p.breakUntil = now(w) + minutes;
      if (decision) p.decision = decision;
      const station =
        w.layout.stations[
          kind === "meal" ? "meal" : kind === "social" ? "pantry" : "lounge"
        ];
      destination(
        w,
        p,
        station,
        kind === "meal"
          ? "eating"
          : kind === "social"
            ? "socialising"
            : "resting",
        reason,
      );
    }
    function move(p) {
      p.previousPosition = { ...p.position };
      const steps = p.path.splice(0, 24);
      if (steps.length) p.position = { ...steps.at(-1) };
    }
    function ability(w, p, skill, context = {}) {
      return H.evaluateAbility(
        p.profile,
        p.state,
        p.skills[skill],
        w.catalog.skills[skill],
        context,
      );
    }
    function orderOpen(o) {
      return !["paid", "cancelled"].includes(o.status);
    }
    function activeOrders(w) {
      return Object.values(w.orders).filter(orderOpen);
    }
    function ensureJobs(w) {
      for (const o of Object.values(w.offers))
        if (o.status === "open" && o.expiresAt <= now(w)) o.status = "expired";
      if (
        !Object.values(w.jobs).some((j) => j.kind === "sales") &&
        Object.values(w.offers).filter((o) => o.status === "open").length < 6
      )
        job(w, "sales", { required: 150 });
      const researchStations = Object.values(w.layout.stations)
          .filter((s) => s.kind === "research")
          .reduce((n, s) => n + s.capacity, 0),
        activeResearch = Object.values(w.jobs).filter(
          (j) => j.kind === "research",
        ).length;
      for (let i = activeResearch; i < Math.max(1, researchStations); i++)
        job(w, "research", { required: 60 });
      for (const o of activeOrders(w)) {
        if (o.status === "accepted") {
          const units = Object.values(w.units).filter(
            (u) => u.orderId === o.id,
          );
          if (units.length < o.quantity)
            for (
              let i = units.length;
              i < o.quantity &&
              Object.keys(w.units).length < w.catalog.rules.maxUnits;
              i++
            )
              addUnit(w, o);
          const ready = Object.values(w.units).filter(
            (u) => u.orderId === o.id && u.stage === "ready",
          );
          if (
            ready.length === o.quantity &&
            !Object.values(w.jobs).some(
              (j) => j.orderId === o.id && j.kind === "shipping",
            )
          )
            job(w, "shipping", { orderId: o.id, required: 10 });
        }
      }
    }
    function planPurchases(w) {
      if (!w.policies.autoBuy) return;
      const needed = Object.fromEntries(
        Object.keys(w.catalog.materials).map((k) => [k, 0]),
      );
      for (const u of Object.values(w.units))
        if (!u.materialConsumed)
          for (const [m, n] of Object.entries(
            w.catalog.products[u.productId].bom,
          ))
            needed[m] += n;
      const reserveCash =
        w.people
          .filter((p) => p.employed)
          .reduce((s, p) => s + p.pay.dailyWage, 0) * 2;
      for (const [m, n] of Object.entries(needed)) {
        const incoming = Object.values(w.purchases)
            .filter((p) => p.materialId === m && p.status !== "received")
            .reduce((s, p) => s + p.quantity, 0),
          short = n - w.inventory.materials[m] - incoming;
        if (short > 0) {
          const unitCost = w.catalog.materials[m].unitCost,
            maxAffordable = Math.floor(
              Math.max(0, w.finance.cash - reserveCash) / unitCost,
            ),
            desired = Math.min(200, short + 4),
            count =
              maxAffordable >= desired
                ? desired
                : maxAffordable >= short
                  ? short
                  : maxAffordable;
          if (count > 0 && w.finance.cash - count * unitCost >= reserveCash)
            placePurchase(w, m, count);
        }
      }
    }
    function placePurchase(w, materialId, quantity) {
      const mat = w.catalog.materials[materialId],
        p = {
          id: id(w, "purchase"),
          materialId,
          quantity,
          cost: quantity * mat.unitCost,
          status: "paperwork",
          orderedAt: now(w),
          dueAt: null,
        };
      post(w, "materials", -p.cost, p.id);
      w.purchases[p.id] = p;
      job(w, "purchase", { purchaseId: p.id, required: 15 });
      event(w, "purchaseOrdered", "สั่งซื้อวัตถุดิบ", {
        purchaseId: p.id,
        materialId,
        quantity,
      });
      return p;
    }
    function accept(w, offer) {
      const total = offer.quantity * offer.unitPrice,
        deposit = Math.floor(total * offer.depositPct);
      if (
        !int(total, 1) ||
        !int(deposit) ||
        !int(w.finance.cash + deposit) ||
        !int(w.finance.totals.sales + deposit)
      )
        return null;
      const oid = id(w, "order"),
        o = {
          id: oid,
          offerId: offer.id,
          productId: offer.productId,
          quantity: offer.quantity,
          unitPrice: offer.unitPrice,
          deadline: offer.deadline,
          paymentMinutes: offer.paymentMinutes,
          deposit,
          total,
          status: "accepted",
          acceptedAt: now(w),
          shipped: 0,
          materialConsumed: false,
          completedAt: null,
        };
      offer.status = "accepted";
      w.orders[oid] = o;
      if (deposit) post(w, "sales", deposit, oid + ":deposit");
      for (let i = 0; i < o.quantity; i++) addUnit(w, o);
      event(w, "orderAccepted", "รับคำสั่งซื้อ", {
        orderId: oid,
        productId: o.productId,
        quantity: o.quantity,
      });
      return o;
    }
    function autoAccept(w) {
      if (!w.policies.autoAccept) return;
      const open = activeOrders(w).filter((o) => o.status === "accepted"),
        queued = Object.keys(w.units).length;
      if (open.length >= 2 || queued >= 24) return;
      const offer = Object.values(w.offers).find(
        (o) =>
          o.status === "open" &&
          o.deadline > now(w) + 1440 &&
          w.research.unlocked.includes(o.productId) &&
          queued + o.quantity <= w.catalog.rules.maxUnits,
      );
      if (offer) accept(w, offer);
    }
    function processDue(w) {
      for (const p of Object.values(w.purchases))
        if (p.status === "transit" && p.dueAt <= now(w)) {
          w.inventory.materials[p.materialId] += p.quantity;
          w.inventory.purchased[p.materialId] += p.quantity;
          p.status = "received";
          event(w, "materialsReceived", "วัตถุดิบมาถึงแล้ว", {
            purchaseId: p.id,
            quantity: p.quantity,
          });
        }
      for (const i of Object.values(w.invoices))
        if (i.status === "unpaid" && i.dueAt <= now(w)) {
          post(w, "sales", i.amount, i.id);
          i.status = "paid";
          i.paidAt = now(w);
          w.orders[i.orderId].status = "paid";
          w.metrics.ordersPaid++;
          w.metrics.receipts++;
          event(w, "paymentReceived", "ลูกค้าชำระเงิน", {
            invoiceId: i.id,
            amount: i.amount,
          });
        }
    }
    function finishJob(w, p, j, a) {
      const u = w.units[j.unitId],
        product = u && w.catalog.products[u.productId];
      if (j.kind === "assembly") {
        u.stage = "qa";
        u.quality = a.qualityChance;
        job(w, "qa", {
          unitId: u.id,
          orderId: u.orderId,
          required: product.qaMinutes,
        });
      } else if (j.kind === "rework") {
        u.quality = Math.min(0.99, u.quality + 0.1 + a.qualityChance * 0.04);
        u.stage = "qa";
        job(w, "qa", {
          unitId: u.id,
          orderId: u.orderId,
          required: product.qaMinutes,
        });
      } else if (j.kind === "qa") {
        const chance = clamp(
          u.quality * 0.85 + a.qualityChance * 0.15,
          0.1,
          0.99,
        );
        if (random(w) < chance) {
          u.stage = "packing";
          job(w, "packing", {
            unitId: u.id,
            orderId: u.orderId,
            required: product.packingMinutes,
          });
        } else if (u.attempts < 2) {
          u.attempts++;
          u.stage = "rework";
          job(w, "rework", {
            unitId: u.id,
            orderId: u.orderId,
            required: Math.ceil(product.assemblyMinutes * 0.4),
          });
          event(w, "reworkNeeded", "ชิ้นงานไม่ผ่าน QC ส่งซ่อม", {
            unitId: u.id,
            orderId: u.orderId,
          });
        } else {
          w.production.scrapped[u.productId]++;
          w.metrics.unitsScrapped++;
          delete w.units[u.id];
          event(w, "unitScrapped", "ชิ้นงานเสีย ตรวจสอบวัตถุดิบและภาระงาน", {
            orderId: u.orderId,
          });
        }
      } else if (j.kind === "packing") {
        u.stage = "ready";
        w.inventory.finished[u.productId]++;
        w.production.completed[u.productId]++;
      } else if (j.kind === "shipping") {
        const o = w.orders[j.orderId],
          units = Object.values(w.units).filter(
            (u) => u.orderId === o.id && u.stage === "ready",
          );
        if (units.length !== o.quantity)
          throw Error("shipment requires complete ready order");
        for (const item of units) {
          w.inventory.finished[item.productId]--;
          w.production.shipped[item.productId]++;
          delete w.units[item.id];
        }
        o.shipped = o.quantity;
        o.completedAt = now(w);
        o.status = "invoicing";
        const late = Math.max(0, now(w) - o.deadline);
        o.finalTotal = Math.max(
          o.deposit,
          Math.round(o.total * (1 - Math.min(0.2, (late / 1440) * 0.04))),
        );
        w.reputation = clamp(w.reputation + (late ? -0.5 : 2), 0, 100);
        job(w, "invoice", { orderId: o.id, required: 10 });
        event(w, "orderShipped", "ส่งมอบสินค้าแล้ว", {
          orderId: o.id,
          quantity: o.quantity,
          lateMinutes: late,
        });
      } else if (j.kind === "invoice") {
        const o = w.orders[j.orderId],
          i = {
            id: id(w, "invoice"),
            orderId: o.id,
            amount: o.finalTotal - o.deposit,
            issuedAt: now(w),
            dueAt: now(w) + o.paymentMinutes,
            status: "unpaid",
            paidAt: null,
          };
        w.invoices[i.id] = i;
        o.status = "awaitingPayment";
      } else if (j.kind === "purchase") {
        const purchase = w.purchases[j.purchaseId];
        purchase.status = "transit";
        purchase.dueAt =
          now(w) + w.catalog.materials[purchase.materialId].leadMinutes;
      } else if (j.kind === "research") {
        const bonus = Math.max(0, Math.round((a.qualityChance - 0.65) * 12));
        w.research.points += 25 + bonus;
        for (const prod of Object.values(w.catalog.products))
          if (
            prod.researchRequired <= w.research.points &&
            !w.research.unlocked.includes(prod.id)
          ) {
            w.research.unlocked.push(prod.id);
            event(w, "productUnlocked", "ทีมวิจัยสินค้าใหม่สำเร็จ", {
              productId: prod.id,
            });
          }
      } else if (j.kind === "sales") {
        const products = w.research.unlocked,
          productId = products[Math.floor(random(w) * products.length)];
        makeOffer(
          w,
          productId,
          8 + Math.floor(random(w) * 7),
          6 + Math.floor(random(w) * 3),
          a.qualityChance,
        );
      } else if (own(w.catalog.taskKinds, j.kind)) {
        const spec = w.catalog.taskKinds[j.kind];
        if (spec.researchPoints > 0) {
          w.research.points += spec.researchPoints;
          for (const prod of Object.values(w.catalog.products))
            if (
              prod.researchRequired <= w.research.points &&
              !w.research.unlocked.includes(prod.id)
            )
              w.research.unlocked.push(prod.id);
        }
        if (spec.reputationDelta)
          w.reputation = clamp(w.reputation + spec.reputationDelta, 0, 100);
        if (spec.revenue > 0) post(w, "sales", spec.revenue, j.id + ":service");
        event(w, "customTaskCompleted", "ดำเนินงานเฉพาะทางสำเร็จ", {
          jobId: j.id,
          kind: j.kind,
          personId: p.id,
        });
      }
      w.history.tasks.push({
        id: j.id,
        kind: j.kind,
        personId: p.id,
        at: now(w),
        orderId: j.orderId || null,
      });
      if (w.history.tasks.length > 160) w.history.tasks.shift();
      delete w.jobs[j.id];
      p.taskId = null;
      p.stationId = null;
      p.activity = "idle";
    }
    function jobImpacts(w, j, primary, urgent) {
      const custom = own(w.catalog.taskKinds, j.kind);
      if (custom && custom.impacts)
        return {
          ...custom.impacts,
          change: primary ? -0.15 : 0.45,
        };
      const u = clamp(urgent / 4, 0, 1);
      const map = {
        sales: {
          income: 0.55,
          social: 0.65,
          achievement: 0.55,
          recognition: 0.6,
          voice: 0.45,
          risk: 0.25,
        },
        purchase: {
          security: 0.6,
          fairness: 0.4,
          integrity: 0.65,
          duty: 0.7,
          routine: 0.5,
        },
        invoice: {
          income: 0.45,
          security: 0.65,
          integrity: 0.7,
          duty: 0.75,
          routine: 0.45,
        },
        research: {
          learning: 0.95,
          novelty: 0.85,
          autonomy: 0.65,
          meaning: 0.6,
          recognition: 0.45,
        },
        assembly: {
          craft: 0.75,
          achievement: 0.55,
          meaning: 0.45,
          duty: Math.max(0.35, u),
          routine: 0.35,
          help: 0.3,
        },
        rework: {
          craft: 0.8,
          integrity: 0.75,
          duty: Math.max(0.55, u),
          learning: 0.35,
          help: 0.45,
          risk: u,
        },
        qa: {
          integrity: 0.85,
          security: 0.6,
          fairness: 0.5,
          meaning: 0.5,
          craft: 0.55,
          duty: Math.max(0.45, u),
        },
        packing: {
          belonging: 0.45,
          help: 0.55,
          duty: Math.max(0.5, u),
          routine: 0.45,
          achievement: 0.4,
        },
        shipping: {
          achievement: 0.7,
          recognition: 0.5,
          duty: Math.max(0.65, u),
          help: 0.6,
          security: 0.45,
        },
      };
      return {
        ...(map[j.kind] || { achievement: 0.5, duty: 0.5 }),
        change: primary ? -0.15 : 0.45,
      };
    }
    function selectJob(w, p) {
      const choices = [];
      for (const j of Object.values(w.jobs)) {
        if (j.assignee) continue;
        if (j.unitId) {
          const u = w.units[j.unitId];
          if (!u) continue;
          const bom = w.catalog.products[u.productId].bom;
          if (
            !u.materialConsumed &&
            !u.reserved &&
            Object.entries(bom).some(
              ([m, n]) =>
                w.inventory.materials[m] - w.inventory.reserved[m] < n,
            )
          )
            continue;
        }
        const available = stations(w, j.stationKind);
        if (!available.length) continue;
        const demand = own(w.catalog.taskKinds, j.kind) || {},
          a = ability(w, p, j.skill, demand),
          primary = w.catalog.roles[p.role].skill === j.skill,
          per = p.profile.personality,
          v = p.profile.values,
          o = w.orders[j.orderId],
          urgent = o ? clamp((now(w) + 3 * 1440 - o.deadline) / 1440, 0, 4) : 0;
        let score =
          a.speedMultiplier * 22 +
          (primary ? 26 : 0) +
          Math.min(12, (now(w) - j.createdAt) / 120) +
          urgent * 8;
        if (j.kind === "research")
          score +=
            per.openness * 0.1 +
            v.learning * 0.06 +
            (w.policies.workPriority === "research" ? 35 : 0) -
            (activeOrders(w).length ? 12 : 0);
        if (j.orderId)
          score +=
            (w.policies.workPriority === "delivery" ? 24 : 0) +
            per.conscientiousness * 0.08;
        if (["purchase", "invoice", "shipping"].includes(j.kind)) score += 20;
        const motives = H.scoreOptions(p.profile, p.state, [
          {
            id: j.id,
            effort: j.kind === "rework" ? 0.45 : 0.35,
            delay: Math.min(1, (now(w) - j.createdAt) / 1440),
            skillFit: clamp((a.aptitudeFit - 50) / 50, -1, 1),
            impacts: jobImpacts(w, j, primary, urgent),
          },
        ])[0];
        score += motives.score * 0.65;
        const station = available.sort(
          (a, b) =>
            Math.abs(a.access.x - p.position.x) +
            Math.abs(a.access.y - p.position.y) -
            (Math.abs(b.access.x - p.position.x) +
              Math.abs(b.access.y - p.position.y)),
        )[0];
        choices.push({
          j,
          station,
          score,
          motives: motives.contributions,
          roleMatch: primary,
        });
      }
      choices.sort((a, b) => b.score - a.score || a.j.id.localeCompare(b.j.id));
      for (const c of choices) {
        const u = w.units[c.j.unitId];
        if (u && !reserve(w, u)) continue;
        c.j.assignee = p.id;
        p.taskId = c.j.id;
        p.decision = {
          at: now(w),
          taskId: c.j.id,
          score: c.score,
          roleMatch: c.roleMatch,
          motives: c.motives,
        };
        if (destination(w, p, c.station, "working", "chosen:" + c.j.kind))
          return true;
        release(w, p);
      }
      return false;
    }
    function updateSocial(w, p) {
      if (
        !["socialising", "resting", "eating"].includes(p.activity) ||
        !p.stationId
      )
        return;
      for (const other of w.people) {
        if (
          other.id === p.id ||
          !other.employed ||
          other.stationId !== p.stationId ||
          other.path.length ||
          p.path.length
        )
          continue;
        const pair =
          p.id < other.id ? p.id + "|" + other.id : other.id + "|" + p.id;
        if ((w.socialAt[pair] || -100) < now(w) - 30) {
          w.socialAt[pair] = now(w);
          const existing = p.relationships[other.id]?.trust || 0,
            inter = H.evaluateInteraction(
              p.profile,
              p.state,
              other.profile,
              other.state,
              { mode: "social", existingTrust: existing },
            );
          for (const [a, b] of [
            [p, other],
            [other, p],
          ]) {
            const rel =
              a.relationships[b.id] ||
              (a.relationships[b.id] = { trust: 0, familiarity: 0 });
            rel.familiarity = Math.min(
              100,
              +(rel.familiarity + inter.familiarityDelta).toFixed(2),
            );
            rel.trust = clamp(
              +(rel.trust + inter.trustDelta).toFixed(2),
              -100,
              100,
            );
            a.state.morale = clamp(a.state.morale + inter.moraleDelta, 0, 100);
          }
        }
      }
    }
    function pickColleagueToHelp(w, p) {
      const zone = L.zoneAt(w.layout, p.position);
      const candidates = w.people.filter(
        (q) =>
          q.employed &&
          q.taskId &&
          q.id !== p.id &&
          L.zoneAt(w.layout, q.position) === zone,
      );
      if (!candidates.length) return null;
      return candidates
        .map((q) => {
          const currentHelpers = w.people.filter(
              (h) =>
                h.employed &&
                h.id !== p.id &&
                h.activity === "helping" &&
                h.intent.reasons.includes(q.id),
            ).length,
            trust = p.relationships[q.id]?.trust || 0,
            inter = H.evaluateInteraction(
              p.profile,
              p.state,
              q.profile,
              q.state,
              { mode: "help", existingTrust: trust },
            ),
            task = w.jobs[q.taskId],
            urgent =
              task && task.orderId && w.orders[task.orderId]
                ? clamp(
                    (now(w) + 2 * 1440 - w.orders[task.orderId].deadline) /
                      1440,
                    0,
                    3,
                  )
                : 0;
          return {
            person: q,
            inter,
            score:
              inter.compatibility +
              trust * 0.3 +
              urgent * 12 -
              currentHelpers * 35,
          };
        })
        .sort(
          (a, b) => b.score - a.score || a.person.id.localeCompare(b.person.id),
        )[0];
    }
    function personStep(w, p) {
      if (!p.employed) return;
      const time = tod(w),
        active =
          (time >= 540 && time < 1080) ||
          (time >= 1080 &&
            time < 1080 + p.ot.maxMinutes &&
            p.ot.day === day(w));
      if (!active) {
        release(w, p);
        p.atWork = false;
        p.activity = time >= 1320 || time < 360 ? "sleeping" : "offDuty";
        p.position = { ...w.layout.entrance };
        p.previousPosition = { ...p.position };
        p.intent = { code: p.activity, reasons: [] };
        p.state = H.tickState(p.profile, p.state, {
          activity: p.activity === "sleeping" ? "sleep" : "offDuty",
          minutes: TICK,
        });
        return;
      }
      if (!p.atWork) {
        p.atWork = true;
        p.activity = "idle";
      }
      if (p.path.length) {
        move(p);
        p.activity = "walking";
        p.state = H.tickState(p.profile, p.state, {
          activity: "walk",
          minutes: TICK,
        });
        return;
      }
      if (p.breakUntil > now(w)) {
        p.activity =
          p.breakKind === "meal"
            ? "eating"
            : p.breakKind === "social"
              ? "socialising"
              : "resting";
        p.state = H.tickState(p.profile, p.state, {
          activity:
            p.breakKind === "meal"
              ? "meal"
              : p.breakKind === "social"
                ? "social"
                : "rest",
          minutes: TICK,
        });
        updateSocial(w, p);
        return;
      }
      p.breakKind = null;
      if (time >= 720 && time < 780) {
        const lunchChoices = H.scoreOptions(p.profile, p.state, [
          {
            id: "meal",
            effort: 0,
            impacts: {
              hunger: 1,
              energy: 0.4,
              stress: 0.3,
              workLifeBalance: 0.3,
            },
          },
          {
            id: "social",
            effort: 0.05,
            impacts: { social: 0.9, belonging: 0.7, stress: 0.4, energy: 0.25 },
          },
        ]);
        const chosen = p.state.hunger > 25 ? "meal" : lunchChoices[0].id;
        const ranked =
          lunchChoices.find((c) => c.id === chosen) || lunchChoices[0];
        pauseFor(w, p, chosen, 20, "lunchBreak", {
          at: now(w),
          taskId: "break:" + chosen,
          score: ranked.score,
          roleMatch: false,
          motives: ranked.contributions,
        });
        return;
      }
      if (
        p.state.health < 35 ||
        p.state.energy < 24 ||
        p.state.stress > 82 ||
        p.state.burnout > 85
      ) {
        const rec = H.scoreOptions(p.profile, p.state, [
          {
            id: "rest",
            effort: 0,
            impacts: {
              energy: 1,
              stress: 0.9,
              health: 0.8,
              burnout: 0.8,
              workLifeBalance: 0.6,
            },
          },
        ])[0];
        pauseFor(w, p, "rest", 30, "needsRecovery", {
          at: now(w),
          taskId: "break:rest",
          score: rec.score,
          roleMatch: false,
          motives: rec.contributions,
        });
        return;
      }
      if (p.state.hunger > 72) {
        const mealChoice = H.scoreOptions(p.profile, p.state, [
          {
            id: "meal",
            effort: 0,
            impacts: { hunger: 1, energy: 0.45, focus: 0.35, stress: 0.3 },
          },
        ])[0];
        pauseFor(w, p, "meal", 20, "hungry", {
          at: now(w),
          taskId: "break:meal",
          score: mealChoice.score,
          roleMatch: false,
          motives: mealChoice.contributions,
        });
        return;
      }
      if (p.state.socialNeed > 75 && p.profile.personality.sociability > 60) {
        const socChoice = H.scoreOptions(p.profile, p.state, [
          {
            id: "social",
            effort: 0.05,
            impacts: { social: 1, belonging: 0.75, stress: 0.45, energy: 0.25 },
          },
        ])[0];
        pauseFor(w, p, "social", 15, "needsConnection", {
          at: now(w),
          taskId: "break:social",
          score: socChoice.score,
          roleMatch: false,
          motives: socChoice.contributions,
        });
        return;
      }
      let j = w.jobs[p.taskId];
      if (!j) {
        p.taskId = null;
        if (!selectJob(w, p)) {
          const helpPick = pickColleagueToHelp(w, p);
          if (
            helpPick &&
            (p.profile.personality.agreeableness > 45 ||
              p.profile.values.belonging > 65)
          ) {
            const target = helpPick.person,
              inter = helpPick.inter;
            p.activity = "helping";
            p.intent = { code: "helpColleague", reasons: [target.id] };
            p.experience.helpMinutes += TICK;
            p.skills.leadership = H.learn(
              p.profile,
              p.skills.leadership,
              w.catalog.skills.leadership,
              TICK,
            );
            for (const [a, b] of [
              [p, target],
              [target, p],
            ]) {
              const rel =
                a.relationships[b.id] ||
                (a.relationships[b.id] = { trust: 0, familiarity: 0 });
              rel.familiarity = Math.min(
                100,
                +(rel.familiarity + 0.2).toFixed(2),
              );
              rel.trust = clamp(
                +(rel.trust + inter.trustDelta * 0.2).toFixed(2),
                -100,
                100,
              );
            }
            p.state = H.tickState(p.profile, p.state, {
              activity: "help",
              minutes: TICK,
            });
            return;
          }
          const primarySkill = w.catalog.roles[p.role].skill;
          const waitOptions = H.scoreOptions(p.profile, p.state, [
            {
              id: "selfStudy",
              effort: 0.25,
              impacts: {
                learning: 0.85,
                achievement: 0.45,
                novelty: 0.4,
                autonomy: 0.5,
              },
            },
            {
              id: "wait",
              effort: 0,
              impacts: { energy: 0.25, workLifeBalance: 0.3, routine: 0.3 },
            },
          ]);
          p.activity = "blocked";
          if (
            waitOptions[0].id === "selfStudy" &&
            p.state.energy > 50 &&
            p.state.stress < 65 &&
            p.skills[primarySkill].level <
              H.skillCap(p.profile, w.catalog.skills[primarySkill])
          ) {
            p.intent = { code: "selfStudy", reasons: [primarySkill] };
            p.decision = {
              at: now(w),
              taskId: "selfStudy:" + primarySkill,
              score: waitOptions[0].score,
              roleMatch: true,
              motives: waitOptions[0].contributions,
            };
            p.skills[primarySkill] = H.learn(
              p.profile,
              p.skills[primarySkill],
              w.catalog.skills[primarySkill],
              TICK * 0.35,
            );
            p.state = H.tickState(p.profile, p.state, {
              activity: "learn",
              minutes: TICK,
              workload: 0.45,
            });
            return;
          }
          p.intent = {
            code: Object.keys(w.units).length
              ? "waitingForWorkOrMaterials"
              : "noProductionOrder",
            reasons: [],
          };
          p.state = H.tickState(p.profile, p.state, {
            activity: "idle",
            minutes: TICK,
          });
          return;
        }
        if (p.path.length) {
          p.state = H.tickState(p.profile, p.state, {
            activity: "walk",
            minutes: TICK,
          });
          return;
        }
        j = w.jobs[p.taskId];
      }
      const u = w.units[j.unitId];
      if (u && !u.materialConsumed) consume(w, u);
      const demand = own(w.catalog.taskKinds, j.kind) || {},
        a = ability(w, p, j.skill, demand),
        helpers = w.people.filter(
          (q) =>
            q.employed &&
            q.activity === "helping" &&
            q.intent.reasons.includes(p.id),
        );
      let help = 1;
      if (helpers.length) {
        const helper = helpers[0],
          inter = H.evaluateInteraction(
            helper.profile,
            helper.state,
            p.profile,
            p.state,
            {
              mode: "help",
              existingTrust: p.relationships[helper.id]?.trust || 0,
            },
          );
        help = inter.collaborationMultiplier;
      }
      j.progress = Math.min(
        j.required,
        j.progress + TICK * a.speedMultiplier * help,
      );
      p.activity = "working";
      p.intent = { code: j.kind, reasons: [j.id] };
      const order = j.orderId ? w.orders[j.orderId] : null,
        urgentLoad = order && order.deadline < now(w) + 1440 ? 0.1 : 0,
        otLoad = time >= 1080 ? 0.12 : 0;
      p.state = H.tickState(p.profile, p.state, {
        activity: j.kind === "research" ? "learn" : "work",
        minutes: TICK,
        workload: Math.min(2, (demand.workload ?? 1) + urgentLoad + otLoad),
        domain: demand.domain || "balanced",
        hazard: demand.hazard || 0,
      });
      p.skills[j.skill] = H.learn(
        p.profile,
        p.skills[j.skill],
        w.catalog.skills[j.skill],
        TICK,
      );
      p.experience.workMinutes += TICK;
      p.dayStats.workMinutes += TICK;
      if (time >= 1080) p.dayStats.otMinutes += TICK;
      if (j.progress >= j.required) finishJob(w, p, j, a);
    }
    function pay(w, isScheduledPayday = false) {
      const people = w.people.filter((p) => p.pay.dueBase + p.pay.dueOT > 0),
        total = people.reduce((s, p) => s + p.pay.dueBase + p.pay.dueOT, 0),
        budget = Math.min(w.finance.cash, total);
      let left = budget;
      for (let index = 0; index < people.length; index++) {
        const p = people[index],
          due = p.pay.dueBase + p.pay.dueOT,
          wasOverdue = p.pay.overdueSince !== null,
          amount = Math.min(
            due,
            index === people.length - 1
              ? left
              : Math.floor((budget * due) / total),
          ),
          base = Math.min(p.pay.dueBase, amount),
          ot = amount - base;
        if (base) post(w, "wages", -base, p.id);
        if (ot) post(w, "overtime", -ot, p.id);
        p.pay.dueBase -= base;
        p.pay.dueOT -= ot;
        p.pay.wallet += amount;
        p.pay.totalPaid += amount;
        left -= amount;
        if (p.pay.dueBase + p.pay.dueOT === 0) p.pay.overdueSince = null;
        if (isScheduledPayday) {
          if (amount < due) p.state.morale = clamp(p.state.morale - 8, 0, 100);
          else p.state.morale = clamp(p.state.morale + 2, 0, 100);
        } else if (wasOverdue && p.pay.dueBase + p.pay.dueOT === 0) {
          p.state.morale = clamp(p.state.morale + 2, 0, 100);
        }
      }
      return budget;
    }
    function payBills(w) {
      for (const kind of ["rent", "interest"]) {
        const amount = Math.min(w.finance.cash, w.finance.payables[kind]);
        if (amount) {
          post(w, kind, -amount, "payable");
          w.finance.payables[kind] -= amount;
        }
      }
    }
    function refreshArrears(w, referenceDay) {
      const overdueWages = w.people
        .filter((p) => p.pay.overdueSince !== null)
        .reduce((n, p) => n + p.pay.dueBase + p.pay.dueOT, 0);
      const unpaid =
        w.finance.payables.rent + w.finance.payables.interest + overdueWages;
      if (unpaid > 0) {
        if (w.finance.arrearsSince === null && referenceDay !== undefined)
          w.finance.arrearsSince = referenceDay;
      } else {
        w.finance.arrearsSince = null;
      }
    }
    function settleDay(w, completedDay) {
      if (completedDay <= w.lastSettledDay) return;
      w.lastSettledDay = completedDay;
      for (const p of w.people) {
        if (p.employed) {
          const ot = Math.round(
            (p.pay.dayWage / 480) *
              p.dayStats.otMinutes *
              (p.ot.payMultiplier || w.policies.overtimeMultiplier),
          );
          p.pay.dueBase += p.pay.dayWage;
          p.pay.dueOT += ot;
          p.pay.totalEarned += p.pay.dayWage + ot;
          p.pay.dayWage = p.pay.dailyWage;
        }
        const desiredLiving = Math.round(
          6500 +
            p.state.lifeBurden * 55 +
            (p.profile.values.comfort ?? 50) * 35 -
            (p.profile.personality.prudence ?? 50) * 30,
        );
        const living = Math.min(p.pay.wallet, Math.max(4000, desiredLiving));
        p.pay.wallet -= living;
        p.pay.outsideSpending += living;
        if (p.employed && p.pay.wallet >= 150000) {
          p.state.fulfillment = clamp(p.state.fulfillment + 0.35, 0, 100);
        }
        p.dayStats = { workMinutes: 0, otMinutes: 0 };
      }
      w.finance.payables.rent += w.catalog.rules.rentDaily;
      w.finance.payables.interest += Math.round(
        w.finance.debt * w.catalog.rules.interestDaily,
      );
      payBills(w);
      if (completedDay % w.catalog.rules.paydayInterval === 0) {
        pay(w, true);
        for (const p of w.people)
          if (p.pay.dueBase + p.pay.dueOT > 0 && p.pay.overdueSince === null)
            p.pay.overdueSince = completedDay;
      }
      const welfare =
        w.policies.wellbeingDaily * w.people.filter((p) => p.employed).length;
      if (welfare && w.finance.cash >= welfare) {
        post(w, "welfare", -welfare, "wellbeing");
        for (const p of w.people.filter((p) => p.employed)) {
          p.state.morale = clamp(p.state.morale + 1, 0, 100);
          p.state.stress = clamp(p.state.stress - 2, 0, 100);
        }
      }
      refreshArrears(w, completedDay);
      for (const p of w.people.filter((p) => p.employed)) {
        const unpaidDays =
            p.pay.overdueSince === null
              ? 0
              : completedDay - p.pay.overdueSince + 1,
          primarySkill = w.catalog.roles[p.role].skill,
          expectedWage = Math.max(
            w.catalog.rules.minimumWage,
            26000 + p.skills[primarySkill].level * 200,
          ),
          voice = H.workplaceVoice(p.profile, p.state, {
            unpaidDays,
            unresolvedDays: p.concern ? completedDay - p.concern.day : 0,
            wageFairness: p.pay.dailyWage / expectedWage,
          });
        if (voice.action !== "none") {
          if (!p.concern) {
            p.concern = {
              day: completedDay,
              action: voice.action,
              reasons: voice.reasons,
            };
            event(w, "employeeConcern", "พนักงานแจ้งข้อกังวล", {
              personId: p.id,
              reasons: voice.reasons,
            });
          } else {
            p.concern.action = voice.action;
            p.concern.reasons = voice.reasons;
            if (voice.action === "considerLeaving") {
              release(w, p);
              p.employed = false;
              p.atWork = false;
              p.breakUntil = 0;
              p.breakKind = null;
              p.leftAt = now(w);
              p.activity = "offDuty";
              p.position = { ...w.layout.entrance };
              p.previousPosition = { ...p.position };
              p.intent = { code: "leftCompany", reasons: voice.reasons };
              event(w, "employeeLeft", "พนักงานตัดสินใจลาออก", {
                personId: p.id,
                reasons: voice.reasons,
              });
            }
          }
        } else if (p.concern && p.state.morale >= 35 && p.state.burnout <= 58) {
          p.concern = null;
        }
      }
      w.history.days.push({
        day: completedDay,
        cash: w.finance.cash,
        debt: w.finance.debt,
        reputation: w.reputation,
        ordersPaid: w.metrics.ordersPaid,
      });
      if (w.history.days.length > 120) w.history.days.shift();
    }
    function checkOutcome(w) {
      if (
        w.finance.debt === 0 &&
        w.finance.cash >= w.catalog.rules.winCash &&
        w.reputation >= w.catalog.rules.winReputation
      ) {
        w.status = "won";
        w.outcome = { code: "companyRecovered", at: now(w) };
      } else if (!w.people.some((p) => p.employed)) {
        w.status = "lost";
        w.outcome = { code: "teamCollapsed", at: now(w) };
      } else if (
        w.finance.arrearsSince !== null &&
        day(w) - w.finance.arrearsSince >= 4
      ) {
        w.status = "lost";
        w.outcome = { code: "insolvent", at: now(w) };
      } else if (day(w) > w.catalog.rules.scenarioDays) {
        w.status = "lost";
        w.outcome = { code: "deadlineReached", at: now(w) };
      }
    }
    function step(w) {
      if (w.status !== "running") return false;
      processDue(w);
      ensureJobs(w);
      autoAccept(w);
      planPurchases(w);
      if (tod(w) === 1020)
        for (const p of w.people.filter((p) => p.employed)) {
          const unpaidDays =
            p.pay.overdueSince === null
              ? 0
              : Math.max(1, day(w) - p.pay.overdueSince);
          const answer = H.respondToRequest(p.profile, p.state, {
            hours: w.policies.overtimeHours,
            payMultiplier: w.policies.overtimeMultiplier,
            urgency: activeOrders(w).some((o) => o.deadline < now(w) + 1440)
              ? 1
              : 0,
            unpaidDays,
          });
          p.ot = {
            day: day(w),
            payMultiplier: w.policies.overtimeMultiplier,
            ...answer,
          };
          if (w.policies.overtimeHours > 0)
            event(w, "overtimeResponse", "คำตอบเรื่อง OT", {
              personId: p.id,
              ...answer,
            });
        }
      for (const p of w.people) personStep(w, p);
      w.clock.absoluteMinute += TICK;
      w.clock.tick++;
      if (tod(w) === 0) settleDay(w, day(w) - 1);
      checkOutcome(w);
      return true;
    }
    function advance(w, minutes) {
      if (!int(minutes, 0, 1440 * 365) || minutes % TICK)
        throw new TypeError(
          "advance duration must be a multiple of 5 minutes, <=365 days",
        );
      let advanced = 0;
      for (let i = 0; i < minutes / TICK; i++) {
        if (!step(w)) break;
        advanced += TICK;
      }
      return advanced;
    }
    function candidates(w) {
      return [0, 1, 2].map((offset) => {
        const cid = "candidate-" + (w.nextCandidate + offset),
          profile = H.createProfile(w.seed, cid);
        return {
          id: cid,
          name:
            ["พลอย", "นนท์", "ฝน"][(w.nextCandidate + offset - 1) % 3] +
            " " +
            (w.nextCandidate + offset),
          profile,
          dailyWage: 32000 + offset * 4000,
        };
      });
    }
    const failure = (code, message) => ({ ok: false, code, message });
    function command(w, c) {
      if (!c || typeof c !== "object" || typeof c.type !== "string")
        return failure("invalidCommand", "คำสั่งไม่ถูกต้อง");
      if (w.status !== "running")
        return failure("scenarioEnded", "สถานการณ์สิ้นสุดแล้ว");
      const person = c.personId
        ? w.people.find((p) => p.id === c.personId && p.employed)
        : null;
      switch (c.type) {
        case "setPolicy": {
          const valid = {
            autoBuy: typeof c.value === "boolean",
            autoAccept: typeof c.value === "boolean",
            workPriority: ["balanced", "delivery", "research"].includes(
              c.value,
            ),
            overtimeHours:
              typeof c.value === "number" &&
              Number.isFinite(c.value) &&
              c.value >= 0 &&
              c.value <= 3 &&
              c.value * 2 === Math.floor(c.value * 2),
            overtimeMultiplier:
              typeof c.value === "number" &&
              Number.isFinite(c.value) &&
              c.value >= 1.5 &&
              c.value <= 3,
            wellbeingDaily: int(c.value, 0, 10000),
          };
          if (
            typeof c.key !== "string" ||
            !Object.hasOwn(valid, c.key) ||
            !valid[c.key]
          )
            return failure("invalidPolicy", "ค่านโยบายไม่ถูกต้อง");
          w.policies[c.key] = c.value;
          return { ok: true };
        }
        case "buyMaterials": {
          const m = own(w.catalog.materials, c.materialId);
          if (!m || !int(c.quantity, 1, 200))
            return failure("invalidPurchase", "วัตถุดิบหรือจำนวนไม่ถูกต้อง");
          if (w.finance.cash < m.unitCost * c.quantity)
            return failure("insufficientCash", "เงินสดไม่พอซื้อวัตถุดิบ");
          return {
            ok: true,
            purchaseId: placePurchase(w, c.materialId, c.quantity).id,
          };
        }
        case "acceptOffer": {
          const o = own(w.offers, c.offerId);
          if (
            !o ||
            o.status !== "open" ||
            o.expiresAt <= now(w) ||
            o.deadline <= now(w) ||
            !w.research.unlocked.includes(o.productId)
          )
            return failure("offerUnavailable", "ข้อเสนอใช้ไม่ได้แล้ว");
          if (
            activeOrders(w).length >= w.catalog.rules.maxActiveOrders ||
            Object.keys(w.units).length + o.quantity > w.catalog.rules.maxUnits
          )
            return failure("capacityLimit", "งานค้างเกินขีดจำกัด");
          const order = accept(w, o);
          if (!order)
            return failure(
              "financialLimit",
              "ยอดคำสั่งซื้อเกินขอบเขตตัวเลขที่รองรับ",
            );
          return { ok: true, orderId: order.id };
        }
        case "cancelOrder": {
          const o = own(w.orders, c.orderId);
          if (
            !o ||
            o.status !== "accepted" ||
            o.materialConsumed ||
            Object.values(w.units).some(
              (u) => u.orderId === o.id && u.materialConsumed,
            )
          )
            return failure(
              "orderCannotCancel",
              "ยกเลิกได้ก่อนเริ่มใช้วัตถุดิบเท่านั้น",
            );
          if (w.finance.cash < o.deposit)
            return failure("insufficientCash", "เงินสดไม่พอคืนมัดจำ");
          if (o.deposit) post(w, "customerRefund", -o.deposit, o.id);
          for (const j of Object.values(w.jobs).filter(
            (j) => j.orderId === o.id,
          )) {
            const p = w.people.find((p) => p.taskId === j.id);
            if (p) release(w, p);
            delete w.jobs[j.id];
          }
          for (const u of Object.values(w.units).filter(
            (u) => u.orderId === o.id,
          )) {
            unreserve(w, u);
            delete w.units[u.id];
          }
          o.status = "cancelled";
          return { ok: true };
        }
        case "borrow":
          if (
            !int(c.amount, 1) ||
            c.amount + w.finance.debt > w.catalog.rules.creditLimit ||
            !Number.isSafeInteger(w.finance.cash + c.amount)
          )
            return failure("creditLimit", "วงเงินหรือจำนวนไม่ถูกต้อง");
          post(w, "loan", c.amount, "bank");
          return { ok: true };
        case "repayDebt":
          if (
            !int(c.amount, 1) ||
            c.amount > w.finance.cash ||
            c.amount > w.finance.debt
          )
            return failure(
              "invalidRepayment",
              "จำนวนชำระหนี้หรือเงินสดไม่ถูกต้อง",
            );
          post(w, "debtRepayment", -c.amount, "bank");
          checkOutcome(w);
          return { ok: true };
        case "payArrears":
          payBills(w);
          pay(w, false);
          refreshArrears(w);
          return { ok: true };
        case "setRole":
          if (!person || !own(w.catalog.roles, c.role))
            return failure("invalidRole", "พนักงานหรือตำแหน่งไม่ถูกต้อง");
          person.role = c.role;
          person.visual.roleKey = c.role;
          return { ok: true };
        case "setWage":
          if (!person || !int(c.dailyWage, w.catalog.rules.minimumWage, 200000))
            return failure("invalidWage", "ค่าจ้างไม่ถูกต้อง");
          person.pay.dailyWage = c.dailyWage;
          return { ok: true };
        case "hire": {
          const candidate = candidates(w).find((p) => p.id === c.candidateId);
          if (!candidate || !own(w.catalog.roles, c.role))
            return failure("invalidCandidate", "ผู้สมัครหรือตำแหน่งไม่ถูกต้อง");
          if (
            w.people.filter((p) => p.employed).length >=
            w.catalog.rules.maxPeople
          )
            return failure("staffLimit", "พนักงานถึงขีดจำกัด");
          if (w.finance.cash < w.catalog.rules.hireFee)
            return failure("insufficientCash", "เงินสดไม่พอค่ารับสมัคร");
          const p = createPerson(
            w,
            candidate.id,
            candidate.name,
            c.role,
            candidate.dailyWage,
          );
          post(w, "hiring", -w.catalog.rules.hireFee, p.id);
          w.people.push(p);
          w.nextCandidate += 3;
          event(w, "employeeHired", "รับพนักงานเข้าทำงาน", { personId: p.id });
          return { ok: true, personId: p.id };
        }
        case "expandSite": {
          if (
            !int(c.width, 0, 8) ||
            !int(c.height, 0, 6) ||
            c.width + c.height === 0
          )
            return failure("invalidExpansion", "ขนาดขยายพื้นที่ไม่ถูกต้อง");
          let layout;
          try {
            layout = L.expand(w.layout, c.width, c.height);
          } catch (_) {
            return failure("invalidExpansion", "ขยายพื้นที่เกินขีดจำกัด");
          }
          const cost =
            (layout.width * layout.height - w.layout.width * w.layout.height) *
            25000;
          if (cost > w.finance.cash)
            return failure("insufficientCash", "เงินสดไม่พอขยายพื้นที่");
          post(w, "expansion", -cost, "site");
          w.layout = layout;
          return { ok: true };
        }
        case "installStation": {
          const customStationKinds = Object.values(
            w.catalog.taskKinds || {},
          ).map((t) => t.stationKind);
          const allowedStationKinds = new Set([
            "assembly",
            "quality",
            "packing",
            "research",
            "sales",
            "admin",
            ...customStationKinds,
          ]);
          if (
            typeof c.kind !== "string" ||
            !allowedStationKinds.has(c.kind) ||
            !int(c.x, 1, 95) ||
            !int(c.y, 1, 63) ||
            !int(c.accessX, 1, 95) ||
            !int(c.accessY, 1, 63)
          )
            return failure("invalidStation", "ตำแหน่งสถานีไม่ถูกต้อง");
          const cost = 1200000;
          if (w.finance.cash < cost)
            return failure("insufficientCash", "เงินสดไม่พอติดตั้งสถานี");
          const sid = "station-" + (w.sequence + 1),
            station = {
              id: sid,
              kind: c.kind,
              cell: { x: c.x, y: c.y },
              access: { x: c.accessX, y: c.accessY },
              capacity: 1,
              visualKey: "station." + c.kind,
            };
          let map;
          try {
            map = L.addStation(w.layout, station);
          } catch (_) {
            return failure(
              "invalidStation",
              "พื้นที่ใช้งานไม่ได้หรือปิดกั้นทางเดิน",
            );
          }
          if (
            w.people.some(
              (p) =>
                !L.walkable(map, p.position) ||
                (p.stationId &&
                  L.findPath(
                    map,
                    p.position,
                    map.stations[p.stationId].access,
                  ) === null),
            )
          )
            return failure("occupiedSite", "พื้นที่มีคนหรือปิดกั้นทางเดิน");
          id(w, "station");
          post(w, "equipment", -cost, sid);
          w.layout = map;
          for (const p of w.people)
            if (p.stationId)
              p.path =
                L.findPath(map, p.position, map.stations[p.stationId].access) ||
                [];
          return { ok: true, stationId: sid };
        }
        default:
          return failure("unknownCommand", "ไม่รู้จักคำสั่ง");
      }
    }
    function addSkill(w, spec) {
      const catalog = clone(w.catalog);
      D.registerSkill(catalog, spec);
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      const records = w.people.map((p) => H.createSkill(p.profile, spec));
      w.catalog = catalog;
      w.people.forEach((p, i) => {
        p.skills[spec.id] = records[i];
      });
      return spec.id;
    }
    function addRole(w, spec) {
      const catalog = clone(w.catalog);
      D.registerRole(catalog, spec);
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      w.catalog = catalog;
      return spec.id;
    }
    function addProduct(w, productSpec, materialSpecs = []) {
      const catalog = clone(w.catalog);
      if (!Array.isArray(materialSpecs))
        throw new TypeError("materialSpecs must be an array");
      for (const m of materialSpecs) D.registerMaterial(catalog, m);
      D.registerProduct(catalog, productSpec);
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      w.catalog = catalog;
      for (const m of materialSpecs) {
        const openQty = catalog.initialStock[m.id] || 0;
        w.inventory.materials[m.id] = openQty;
        w.inventory.opening[m.id] = openQty;
        w.inventory.reserved[m.id] = 0;
        w.inventory.purchased[m.id] = 0;
        w.inventory.consumed[m.id] = 0;
      }
      w.inventory.finished[productSpec.id] = 0;
      w.production.started[productSpec.id] = 0;
      w.production.completed[productSpec.id] = 0;
      w.production.scrapped[productSpec.id] = 0;
      w.production.shipped[productSpec.id] = 0;
      if (
        w.catalog.products[productSpec.id].researchRequired <=
          w.research.points &&
        !w.research.unlocked.includes(productSpec.id)
      )
        w.research.unlocked.push(productSpec.id);
      return productSpec.id;
    }
    function addTaskKind(w, spec) {
      const catalog = clone(w.catalog);
      D.registerTaskKind(catalog, spec);
      const errors = D.validateCatalog(catalog);
      if (errors.length) throw new TypeError(errors.join("; "));
      w.catalog = catalog;
      return spec.id;
    }
    function enqueueTask(w, kind, fields = {}) {
      const custom = own(w.catalog.taskKinds, kind);
      if (!custom)
        throw new TypeError("only registered external tasks may be enqueued");
      if (
        !fields ||
        typeof fields !== "object" ||
        Array.isArray(fields) ||
        Object.keys(fields).some((k) => k !== "required") ||
        (fields.required !== undefined && !int(fields.required, 5, 1440)) ||
        !Object.values(w.layout.stations).some(
          (s) => s.kind === custom.stationKind,
        )
      )
        throw new TypeError("invalid task fields or unavailable station");
      return job(w, kind, fields);
    }
    function audit(w) {
      const errors = [
        ...E.auditFinance(w.finance),
        ...D.validateCatalog(w.catalog),
        ...L.validateLayout(w.layout),
      ];
      const reserved = Object.fromEntries(
          Object.keys(w.inventory.materials).map((k) => [k, 0]),
        ),
        finished = Object.fromEntries(
          Object.keys(w.catalog.products).map((k) => [k, 0]),
        ),
        inProcess = clone(finished);
      for (const u of Object.values(w.units)) {
        if (!w.orders[u.orderId] || !w.catalog.products[u.productId]) {
          errors.push("orphan unit");
          continue;
        }
        if (u.reserved)
          for (const [m, n] of Object.entries(
            w.catalog.products[u.productId].bom,
          ))
            reserved[m] += n;
        if (u.materialConsumed) inProcess[u.productId]++;
        if (u.stage === "ready") finished[u.productId]++;
      }
      for (const m of Object.keys(w.inventory.materials)) {
        const stock = w.inventory.materials[m];
        if (
          !int(stock) ||
          stock !==
            w.inventory.opening[m] +
              w.inventory.purchased[m] -
              w.inventory.consumed[m] ||
          reserved[m] !== w.inventory.reserved[m] ||
          reserved[m] > stock
        )
          errors.push("material conservation " + m);
        const consumed = Object.values(w.catalog.products).reduce(
          (n, p) => n + (p.bom[m] || 0) * w.production.started[p.id],
          0,
        );
        if (consumed !== w.inventory.consumed[m])
          errors.push("material allocation " + m);
        const received = Object.values(w.purchases)
          .filter((p) => p.materialId === m && p.status === "received")
          .reduce((n, p) => n + p.quantity, 0);
        if (received !== w.inventory.purchased[m])
          errors.push("purchase reconciliation " + m);
      }
      for (const p of Object.keys(finished))
        if (
          w.inventory.finished[p] !== finished[p] ||
          w.production.completed[p] !== w.production.shipped[p] + finished[p] ||
          w.production.started[p] !==
            w.production.shipped[p] + w.production.scrapped[p] + inProcess[p]
        )
          errors.push("product conservation " + p);
      const personIds = new Set();
      for (const p of w.people) {
        if (personIds.has(p.id) || p.profile.id !== p.id)
          errors.push("duplicate/invalid person");
        personIds.add(p.id);
        errors.push(
          ...H.validateProfile(p.profile).map((e) => p.id + ": " + e),
        );
        if (
          p.taskId &&
          (!w.jobs[p.taskId] || w.jobs[p.taskId].assignee !== p.id)
        )
          errors.push("person task mismatch");
        for (const v of Object.values(p.state))
          if (!Number.isFinite(v) || v < 0 || v > 100)
            errors.push("invalid vital state");
        if (
          p.pay.totalEarned !== p.pay.totalPaid + p.pay.dueBase + p.pay.dueOT ||
          p.pay.wallet + p.pay.outsideSpending !== p.pay.totalPaid
        )
          errors.push("payroll reconciliation");
        for (const [k, s] of Object.entries(p.skills))
          if (
            !w.catalog.skills[k] ||
            !Number.isFinite(s.level) ||
            s.level < 0 ||
            s.level > H.skillCap(p.profile, w.catalog.skills[k]) ||
            !Number.isFinite(s.xp) ||
            s.xp < 0 ||
            s.xp > Number.MAX_SAFE_INTEGER ||
            !Number.isFinite(s.totalXp) ||
            s.totalXp < 0 ||
            s.totalXp > Number.MAX_SAFE_INTEGER
          )
            errors.push("invalid skill");
      }
      for (const s of Object.values(w.layout.stations)) {
        const activeWorkers = w.people.filter(
          (p) => p.employed && p.taskId && p.stationId === s.id,
        ).length;
        if (activeWorkers > s.capacity)
          errors.push("station capacity exceeded " + s.id);
      }
      const materialCosts = Object.values(w.purchases).reduce(
        (n, p) => n + p.cost,
        0,
      );
      if (materialCosts !== -w.finance.totals.materials)
        errors.push("purchase cash reconciliation");
      for (const invoice of Object.values(w.invoices)) {
        const receipts = w.finance.entries.filter(
          (t) => t.kind === "sales" && t.reference === invoice.id,
        );
        if (
          invoice.status === "paid"
            ? receipts.length !== 1 || receipts[0].delta !== invoice.amount
            : receipts.length !== 0
        )
          errors.push("invoice cash reconciliation");
      }
      const paid = w.people.reduce((n, p) => n + p.pay.totalPaid, 0);
      if (paid !== -w.finance.totals.wages - w.finance.totals.overtime)
        errors.push("wage cash reconciliation");
      for (const j of Object.values(w.jobs))
        if (
          (j.assignee &&
            !w.people.some(
              (p) => p.id === j.assignee && p.taskId === j.id && p.employed,
            )) ||
          (j.unitId && !w.units[j.unitId]) ||
          (j.orderId && !w.orders[j.orderId]) ||
          (j.purchaseId && !w.purchases[j.purchaseId]) ||
          !Number.isFinite(j.progress) ||
          j.progress < 0 ||
          j.progress > j.required
        )
          errors.push("invalid job reference/progress");
      return errors;
    }
    return Object.freeze({
      VERSION,
      SCHEMA,
      TICK,
      create,
      step,
      advance,
      command,
      candidates,
      addSkill,
      addRole,
      addProduct,
      addTaskKind,
      enqueueTask,
      audit,
    });
  },
);
