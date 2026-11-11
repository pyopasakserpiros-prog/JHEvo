(function (root, factory) {
  "use strict";
  const node = typeof module === "object" && module.exports;
  const value = factory(
    node ? require("./human-core.js") : root.CompanyCore,
    node ? require("./sim.js") : root.CompanySim,
    node ? require("./layout.js") : root.CompanyLayout,
  );
  if (node) module.exports = value;
  else root.CompanySave = value;
})(typeof globalThis !== "undefined" ? globalThis : this, function (H, S, L) {
  "use strict";
  const MAX_BYTES = 16 * 1024 * 1024,
    record = (v) => v && typeof v === "object" && !Array.isArray(v),
    int = (v, a = 0, b = Number.MAX_SAFE_INTEGER) =>
      Number.isSafeInteger(v) && v >= a && v <= b,
    finite = (v, a = 0, b = Number.MAX_VALUE) =>
      typeof v === "number" && Number.isFinite(v) && v >= a && v <= b;
  function checkJsonTree(w) {
    let nodes = 0;
    function tree(v, depth = 0) {
      if (++nodes > 2500000 || depth > 40) throw Error("save structure limit");
      if (typeof v === "number" && !Number.isFinite(v))
        throw Error("non-finite number");
      if (
        typeof v === "function" ||
        typeof v === "undefined" ||
        typeof v === "symbol" ||
        typeof v === "bigint"
      )
        throw Error("non-JSON value");
      if (v && typeof v === "object") {
        for (const [k, n] of Object.entries(v)) {
          if (["__proto__", "constructor", "prototype"].includes(k))
            throw Error("forbidden key");
          tree(n, depth + 1);
        }
      }
    }
    tree(w);
  }
  function migrate(w) {
    checkJsonTree(w);
    if (!record(w)) throw new TypeError("world missing");
    if (
      w.version !== S.VERSION ||
      w.schema !== S.SCHEMA ||
      !(H.COMPATIBLE_VERSIONS || [H.VERSION]).includes(w.coreVersion)
    )
      throw new TypeError("unsupported game/save/core version");
    const copy = JSON.parse(JSON.stringify(w));
    if (copy.coreVersion !== H.VERSION) {
      if (!Array.isArray(copy.people))
        throw new TypeError("missing legacy people");
      const historicalVersion = copy.coreVersion;
      const legacyKeys = Object.keys(H.STATE_DEFAULTS).slice(
        0,
        historicalVersion === "0.1.0-review.1" ? 10 : 12,
      );
      for (const p of copy.people) {
        if (
          !p ||
          !p.profile ||
          p.profile.version !== historicalVersion ||
          !record(p.state) ||
          !legacyKeys.every((k) => finite(p.state[k], 0, 100))
        )
          throw new TypeError("invalid legacy employee or mixed core versions");
        p.profile = H.migrateProfile(p.profile);
        if (historicalVersion === "0.1.0-review.1") {
          const defaults = H.createState(p.profile);
          p.state.fulfillment = defaults.fulfillment;
          p.state.drive = defaults.drive;
        }
      }
      copy.coreVersion = H.VERSION;
      if (record(copy.catalog) && copy.catalog.taskKinds === undefined)
        copy.catalog.taskKinds = {};
      if (record(copy.orders))
        for (const o of Object.values(copy.orders))
          if (record(o) && o.materialConsumed === undefined) {
            const units = Object.values(copy.units || {}).filter(
              (u) => u.orderId === o.id,
            );
            o.materialConsumed =
              units.some((u) => u.materialConsumed) ||
              (o.status !== "accepted" && o.status !== "cancelled") ||
              (o.status === "accepted" &&
                (copy.production?.scrapped?.[o.productId] || 0) > 0);
          }
    }
    return copy;
  }
  function validate(w) {
    const errors = [],
      add = (ok, message) => {
        if (!ok) errors.push(message);
      };
    try {
      checkJsonTree(w);
    } catch (e) {
      return [e.message];
    }
    if (!record(w)) return ["world missing"];
    add(
      w.version === S.VERSION &&
        w.schema === S.SCHEMA &&
        w.coreVersion === H.VERSION,
      "unsupported game/save/core version",
    );
    for (const k of [
      "catalog",
      "layout",
      "finance",
      "inventory",
      "production",
      "clock",
      "rng",
      "orders",
      "offers",
      "units",
      "jobs",
      "purchases",
      "invoices",
      "research",
      "policies",
      "history",
      "metrics",
      "socialAt",
    ])
      add(record(w[k]), k + " missing");
    add(
      Array.isArray(w.people) && w.people.length > 0 && w.people.length <= 600,
      "invalid people",
    );
    add(Array.isArray(w.events) && w.events.length <= 160, "invalid events");
    if (errors.length) return errors;
    add(
      typeof w.seed === "string" &&
        int(w.sequence, 0) &&
        int(w.nextCandidate, 1),
      "invalid seed/counter",
    );
    add(
      int(w.clock.absoluteMinute, 540) &&
        w.clock.absoluteMinute % S.TICK === 0 &&
        int(w.clock.tick) &&
        w.clock.tick * S.TICK === w.clock.absoluteMinute - 540,
      "invalid simulation clock",
    );
    add(int(w.rng.state, 1, 4294967295) && int(w.rng.draws), "invalid RNG");
    add(
      int(w.lastSettledDay) &&
        w.lastSettledDay === Math.floor(w.clock.absoluteMinute / 1440),
      "invalid accounting day",
    );
    if (w.facilities !== undefined) {
      const f = w.facilities;
      const ids = Object.keys(S.FACILITY_RULES);
      add(
        record(f) &&
          record(f.levels) &&
          ids.every((id) => int(f.levels[id], 1, 3)) &&
          Object.keys(f.levels || {}).every((id) => ids.includes(id)) &&
          int(f.trainingMinutes) &&
          f.trainingMinutes % S.TICK === 0 &&
          int(
            f.lastDecisionDay,
            0,
            Math.floor(w.clock.absoluteMinute / 1440) + 1,
          ) &&
          (f.machineCondition === undefined ||
            finite(f.machineCondition, 0, 100)) &&
          (f.maintenanceCount === undefined || int(f.maintenanceCount, 0)) &&
          (f.totalPromotions === undefined || int(f.totalPromotions, 0)) &&
          (f.totalBonusesPaid === undefined || int(f.totalBonusesPaid, 0)) &&
          (f.constructedPlots === undefined ||
            Array.isArray(f.constructedPlots)) &&
          (f.lastDecision === null ||
            (record(f.lastDecision) &&
              ids.includes(f.lastDecision.facilityId) &&
              ["upgrade", "wait"].includes(f.lastDecision.decision) &&
              typeof f.lastDecision.personId === "string" &&
              int(f.lastDecision.cost) &&
              int(f.lastDecision.reserve) &&
              typeof f.lastDecision.score === "number" &&
              Number.isFinite(f.lastDecision.score))),
        "invalid facility state",
      );
      if (record(f) && record(f.levels) && Array.isArray(w.finance.entries)) {
        for (const id of ids) {
          const entries = w.finance.entries.filter(
            (e) =>
              e && e.kind === "equipment" && e.reference === "facility:" + id,
          );
          add(
            entries.length === f.levels[id] - 1 &&
              entries.every(
                (e, i) => e.delta === -S.FACILITY_RULES[id].cost * (i + 1),
              ),
            "facility investment ledger mismatch: " + id,
          );
        }
      }
    }
    if (w.logistics !== undefined) {
      add(
        record(w.logistics) &&
          Array.isArray(w.logistics.b2bDeals) &&
          Array.isArray(w.logistics.inboundShipments) &&
          Array.isArray(w.logistics.outboundShipments) &&
          record(w.logistics.productionLines),
        "invalid logistics state",
      );
    }
    if (w.externalWorld !== undefined) {
      add(
        record(w.externalWorld) &&
          record(w.externalWorld.clients) &&
          record(w.externalWorld.suppliers) &&
          record(w.externalWorld.competitors) &&
          record(w.externalWorld.government) &&
          record(w.externalWorld.stockMarket),
        "invalid externalWorld state",
      );
    }
    add(
      ["running", "won", "lost"].includes(w.status) &&
        finite(w.reputation, 0, 100) &&
        (w.status === "running"
          ? w.outcome === null
          : record(w.outcome) &&
            typeof w.outcome.code === "string" &&
            int(w.outcome.at, 540)),
      "invalid outcome/reputation",
    );
    add(
      typeof w.policies.autoBuy === "boolean" &&
        typeof w.policies.autoAccept === "boolean" &&
        ["balanced", "research", "delivery"].includes(
          w.policies.workPriority,
        ) &&
        finite(w.policies.overtimeHours, 0, 3) &&
        finite(w.policies.overtimeMultiplier, 1.5, 3) &&
        int(w.policies.wellbeingDaily, 0, 10000),
      "invalid policy",
    );
    add(
      Array.isArray(w.history.tasks) &&
        w.history.tasks.length <= 240 &&
        Array.isArray(w.history.days) &&
        w.history.days.length <= 180,
      "invalid history",
    );
    add(
      finite(w.research.points) &&
        Array.isArray(w.research.unlocked) &&
        new Set(w.research.unlocked).size === w.research.unlocked.length &&
        w.research.unlocked.every(
          (id) =>
            Object.hasOwn(w.catalog.products || {}, id) &&
            w.catalog.products[id].researchRequired <= w.research.points,
        ),
      "invalid research",
    );
    const customTaskKinds = record(w.catalog.taskKinds)
      ? Object.keys(w.catalog.taskKinds)
      : [];
    const kinds = [
        "assembly",
        "rework",
        "qa",
        "packing",
        "shipping",
        "purchase",
        "invoice",
        "research",
        "sales",
        ...customTaskKinds,
      ],
      unitStages = ["assembly", "rework", "qa", "packing", "ready"];
    try {
      for (const group of [
        "materials",
        "opening",
        "reserved",
        "purchased",
        "consumed",
        "finished",
      ]) {
        add(record(w.inventory[group]), "invalid inventory " + group);
        if (w.inventory[group])
          for (const n of Object.values(w.inventory[group]))
            add(int(n), "invalid inventory count");
      }
      for (const group of ["started", "completed", "scrapped", "shipped"]) {
        add(record(w.production[group]), "invalid production");
        if (w.production[group])
          for (const n of Object.values(w.production[group]))
            add(int(n), "invalid production count");
      }
      add(
        Object.keys(w.units).length <= w.catalog.rules.maxUnits,
        "too many WIP units",
      );
      const people = new Map(w.people.map((p) => [p.id, p]));
      for (const p of w.people) {
        add(
          record(p) &&
            typeof p.id === "string" &&
            typeof p.name === "string" &&
            typeof p.employed === "boolean" &&
            Object.hasOwn(w.catalog.roles, p.role),
          "invalid employee",
        );
        if (p.identity !== undefined && p.identity !== null) {
          add(
            record(p.identity) &&
              typeof p.identity.nationality === "string" &&
              int(p.identity.age, 18, 80),
            "invalid employee identity",
          );
        }
        if (p.career !== undefined && p.career !== null) {
          add(
            record(p.career) &&
              int(p.career.level, 1, 10) &&
              finite(p.career.satisfaction, 0, 100) &&
              finite(p.career.kpiScore, 0, 100),
            "invalid employee career",
          );
        }
        add(
          record(p.pay) &&
            int(p.pay.dailyWage) &&
            int(p.pay.dayWage) &&
            (p.pay.overdueSince === null || int(p.pay.overdueSince, 1)) &&
            [
              "dueBase",
              "dueOT",
              "totalEarned",
              "totalPaid",
              "wallet",
              "outsideSpending",
            ].every((k) => int(p.pay[k])),
          "invalid pay",
        );
        add(
          record(p.state) &&
            Object.keys(H.STATE_DEFAULTS).every((k) =>
              finite(p.state[k], 0, 100),
            ),
          "missing/invalid vital state",
        );
        add(
          record(p.skills) &&
            Object.keys(w.catalog.skills).every(
              (id) => p.skills[id] && p.skills[id].id === id,
            ),
          "missing skill",
        );
        add(
          Array.isArray(p.path) &&
            p.path.length <= w.layout.width * w.layout.height &&
            L.walkable(w.layout, p.position),
          "invalid employee path/position",
        );
        if (Array.isArray(p.path)) {
          let prev = p.position;
          for (const point of p.path) {
            add(
              L.walkable(w.layout, point) &&
                Math.abs(point.x - prev.x) + Math.abs(point.y - prev.y) === 1,
              "invalid path step",
            );
            prev = point;
          }
        }
        add(
          p.stationId === null || Object.hasOwn(w.layout.stations, p.stationId),
          "invalid station reference",
        );
        if (!p.employed)
          add(
            p.taskId === null && p.stationId === null,
            "former employee still assigned",
          );
        if (p.taskId) {
          const task = w.jobs[p.taskId],
            station = w.layout.stations[p.stationId];
          add(
            Boolean(task && station && task.stationKind === station.kind),
            "task station mismatch",
          );
        }
        if (p.stationId && w.layout.stations[p.stationId]) {
          const end = p.path.at(-1) || p.position,
            access = w.layout.stations[p.stationId].access;
          add(
            end.x === access.x && end.y === access.y,
            "path does not lead to assigned station",
          );
        }
        add(
          int(p.breakUntil) &&
            [
              "idle",
              "walking",
              "working",
              "resting",
              "eating",
              "socialising",
              "helping",
              "offDuty",
              "sleeping",
              "blocked",
            ].includes(p.activity),
          "invalid activity",
        );
        add(
          record(p.intent) &&
            typeof p.intent.code === "string" &&
            Array.isArray(p.intent.reasons) &&
            record(p.relationships) &&
            record(p.experience) &&
            record(p.dayStats) &&
            record(p.ot) &&
            int(p.ot.day) &&
            int(p.ot.maxMinutes, 0, 240) &&
            (p.concern === null ||
              (record(p.concern) &&
                int(p.concern.day, 1) &&
                typeof p.concern.action === "string" &&
                Array.isArray(p.concern.reasons))),
          "invalid employee state",
        );
        add(
          int(p.experience.workMinutes) &&
            int(p.experience.helpMinutes) &&
            int(p.dayStats.workMinutes) &&
            int(p.dayStats.otMinutes),
          "missing/invalid experience or attendance counters",
        );
        for (const [other, rel] of Object.entries(p.relationships))
          add(
            people.has(other) &&
              other !== p.id &&
              finite(rel.trust, -100, 100) &&
              finite(rel.familiarity, 0, 100),
            "invalid relationship",
          );
      }
      for (const [id, o] of Object.entries(w.offers))
        add(
          record(o) &&
            o.id === id &&
            Object.hasOwn(w.catalog.products, o.productId) &&
            int(o.quantity, 1, 200) &&
            int(o.unitPrice, 1) &&
            int(o.deadline) &&
            int(o.expiresAt) &&
            int(o.paymentMinutes) &&
            finite(o.depositPct, 0, 0.5) &&
            ["open", "accepted", "expired"].includes(o.status),
          "invalid offer",
        );
      for (const [id, o] of Object.entries(w.orders))
        add(
          record(o) &&
            o.id === id &&
            Object.hasOwn(w.offers, o.offerId) &&
            Object.hasOwn(w.catalog.products, o.productId) &&
            int(o.quantity, 1, 200) &&
            int(o.unitPrice, 1) &&
            o.total === o.quantity * o.unitPrice &&
            int(o.deposit) &&
            o.deposit <= o.total &&
            int(o.deadline) &&
            int(o.paymentMinutes) &&
            int(o.shipped, 0, o.quantity) &&
            typeof o.materialConsumed === "boolean" &&
            [
              "accepted",
              "invoicing",
              "awaitingPayment",
              "paid",
              "cancelled",
            ].includes(o.status),
          "invalid order",
        );
      const unitJobs = new Set();
      for (const [id, u] of Object.entries(w.units))
        add(
          record(u) &&
            u.id === id &&
            Object.hasOwn(w.orders, u.orderId) &&
            Object.hasOwn(w.catalog.products, u.productId) &&
            u.productId === w.orders[u.orderId].productId &&
            unitStages.includes(u.stage) &&
            typeof u.reserved === "boolean" &&
            typeof u.materialConsumed === "boolean" &&
            !(u.reserved && u.materialConsumed) &&
            finite(u.quality, 0, 1) &&
            int(u.attempts, 0, 2),
          "invalid unit",
        );
      for (const [id, j] of Object.entries(w.jobs)) {
        add(
          record(j) &&
            j.id === id &&
            kinds.includes(j.kind) &&
            Object.hasOwn(w.catalog.skills, j.skill) &&
            Object.values(w.layout.stations).some(
              (s) => s.kind === j.stationKind,
            ) &&
            finite(j.required, 0.01, 100000) &&
            finite(j.progress, 0, j.required),
          "invalid job",
        );
        const external = w.catalog.taskKinds && w.catalog.taskKinds[j.kind];
        if (external)
          add(
            j.skill === external.skill &&
              j.stationKind === external.stationKind &&
              int(j.required, 5, 1440) &&
              !j.unitId &&
              !j.orderId &&
              !j.purchaseId,
            "invalid external task binding",
          );
        if (j.unitId) {
          add(
            Object.hasOwn(w.units, j.unitId) && !unitJobs.has(j.unitId),
            "orphan/duplicate unit job",
          );
          unitJobs.add(j.unitId);
          add(
            w.units[j.unitId]?.stage === j.kind,
            "unit stage and task mismatch",
          );
        }
        if (j.orderId)
          add(Object.hasOwn(w.orders, j.orderId), "orphan order job");
        if (j.purchaseId)
          add(Object.hasOwn(w.purchases, j.purchaseId), "orphan purchase job");
      }
      for (const unit of Object.values(w.units)) {
        add(
          unit.stage === "ready"
            ? !unitJobs.has(unit.id)
            : unitJobs.has(unit.id),
          "unit has missing or unexpected task",
        );
        add(
          unit.stage === "assembly" || unit.materialConsumed,
          "later production stage without material consumption",
        );
      }
      for (const order of Object.values(w.orders)) {
        const invoices = Object.values(w.invoices).filter(
          (i) => i.orderId === order.id,
        );
        add(invoices.length <= 1, "duplicate invoice for order");
        if (["paid", "awaitingPayment"].includes(order.status))
          add(
            invoices.length === 1 &&
              invoices[0].status ===
                (order.status === "paid" ? "paid" : "unpaid"),
            "order invoice status mismatch",
          );
      }
      for (const [id, p] of Object.entries(w.purchases))
        add(
          record(p) &&
            p.id === id &&
            Object.hasOwn(w.catalog.materials, p.materialId) &&
            int(p.quantity, 1, 500) &&
            int(p.cost, 1) &&
            ["paperwork", "transit", "received"].includes(p.status) &&
            (p.status === "paperwork" ? p.dueAt === null : int(p.dueAt)),
          "invalid purchase",
        );
      for (const [id, i] of Object.entries(w.invoices))
        add(
          record(i) &&
            i.id === id &&
            Object.hasOwn(w.orders, i.orderId) &&
            int(i.amount) &&
            i.amount ===
              w.orders[i.orderId].finalTotal - w.orders[i.orderId].deposit &&
            int(i.dueAt) &&
            ["unpaid", "paid"].includes(i.status) &&
            (i.status === "paid" ? int(i.paidAt) : i.paidAt === null),
          "invalid invoice",
        );
      let max = 0;
      const ids = [
        ...Object.keys(w.orders),
        ...Object.keys(w.offers),
        ...Object.keys(w.units),
        ...Object.keys(w.jobs),
        ...Object.keys(w.purchases),
        ...Object.keys(w.invoices),
        ...w.events.map((e) => e.id),
        ...w.finance.entries.map((e) => e.id),
        ...Object.keys(w.layout.stations),
      ];
      for (const id of ids) {
        const m =
          /^(?:order|offer|unit|job|purchase|invoice|event|tx|station)-(\d+)$/.exec(
            id,
          );
        if (m) max = Math.max(max, Number(m[1]));
      }
      add(w.sequence >= max, "sequence would reuse existing IDs");
      if (errors.length) return errors;
      errors.push(...S.audit(w));
    } catch (e) {
      errors.push("invalid world structure: " + e.message);
    }
    return errors;
  }
  function serialize(w) {
    const errors = validate(w);
    if (errors.length)
      throw new TypeError("Cannot save: " + errors.slice(0, 5).join("; "));
    const text = JSON.stringify(w);
    if (new TextEncoder().encode(text).length > MAX_BYTES)
      throw new RangeError("save exceeds 16 MiB limit");
    return text;
  }
  function deserialize(text) {
    if (
      typeof text !== "string" ||
      text.length > MAX_BYTES ||
      new TextEncoder().encode(text).length > MAX_BYTES
    )
      throw new TypeError("invalid/oversized save");
    let world;
    try {
      world = JSON.parse(text);
    } catch (_) {
      throw new TypeError("invalid JSON save");
    }
    if (
      record(world) &&
      world.version === S.VERSION &&
      world.schema === S.SCHEMA &&
      world.coreVersion !== H.VERSION &&
      (H.COMPATIBLE_VERSIONS || []).includes(world.coreVersion)
    )
      world = migrate(world);
    const errors = validate(world);
    if (errors.length)
      throw new TypeError("Cannot load: " + errors.slice(0, 5).join("; "));
    for (const p of world.people) H.freezeProfile(p.profile);
    return world;
  }
  return Object.freeze({
    MAX_BYTES,
    migrate,
    validate,
    serialize,
    deserialize,
  });
});
