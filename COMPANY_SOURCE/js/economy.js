(function (root, factory) {
  "use strict";
  const value = factory();
  if (typeof module === "object" && module.exports) module.exports = value;
  else root.CompanyEconomy = value;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const KINDS = [
    "sales",
    "materials",
    "rent",
    "interest",
    "wages",
    "overtime",
    "welfare",
    "loan",
    "debtRepayment",
    "expansion",
    "equipment",
    "hiring",
    "customerRefund",
  ];
  const money = (n) => Number.isSafeInteger(n) && n >= 0;
  function createFinance(cash, debt) {
    if (!money(cash) || !money(debt))
      throw new TypeError("invalid opening balance");
    return {
      cash,
      debt,
      openingCash: cash,
      openingDebt: debt,
      totals: Object.fromEntries(KINDS.map((k) => [k, 0])),
      entries: [],
      postedIds: {},
      payables: { rent: 0, interest: 0 },
      arrearsSince: null,
    };
  }
  function post(b, e) {
    if (
      !e ||
      typeof e.id !== "string" ||
      !e.id.length ||
      !KINDS.includes(e.kind) ||
      !Number.isSafeInteger(e.delta) ||
      !Number.isSafeInteger(e.at) ||
      e.at < 0
    )
      throw new TypeError("invalid ledger entry");
    if (Object.hasOwn(b.postedIds, e.id)) {
      const previous = b.entries[b.postedIds[e.id]];
      if (previous.kind !== e.kind || previous.delta !== e.delta)
        throw new TypeError("conflicting transaction id");
      return false;
    }
    if (!money(b.cash + e.delta))
      throw new RangeError("insufficient cash/unsafe balance");
    if (
      (e.kind === "loan" && e.delta <= 0) ||
      (e.kind === "debtRepayment" && (e.delta >= 0 || b.debt < -e.delta))
    )
      throw new RangeError("invalid principal transaction");
    if (
      (e.kind === "sales" && e.delta < 0) ||
      (!["sales", "loan"].includes(e.kind) && e.delta > 0)
    )
      throw new RangeError("invalid cash flow sign");
    b.postedIds[e.id] = b.entries.length;
    b.entries.push({
      id: e.id,
      kind: e.kind,
      delta: e.delta,
      at: e.at,
      reference: e.reference || null,
    });
    b.cash += e.delta;
    b.totals[e.kind] += e.delta;
    if (e.kind === "loan" || e.kind === "debtRepayment") b.debt += e.delta;
    return true;
  }
  function auditFinance(b) {
    if (
      !b ||
      !money(b.cash) ||
      !money(b.debt) ||
      !money(b.openingCash) ||
      !money(b.openingDebt) ||
      !Array.isArray(b.entries) ||
      !b.totals ||
      !b.postedIds ||
      !b.payables
    )
      return ["invalid finance shape"];
    const e = [],
      seen = new Set(),
      totals = Object.fromEntries(KINDS.map((k) => [k, 0]));
    let cash = b.openingCash,
      debt = b.openingDebt;
    b.entries.forEach((t, i) => {
      if (
        !t ||
        !KINDS.includes(t.kind) ||
        !Number.isSafeInteger(t.delta) ||
        !Number.isSafeInteger(t.at) ||
        t.at < 0 ||
        typeof t.id !== "string" ||
        seen.has(t.id)
      ) {
        e.push("invalid ledger row " + i);
        return;
      }
      seen.add(t.id);
      cash += t.delta;
      totals[t.kind] += t.delta;
      if (t.kind === "loan" || t.kind === "debtRepayment") debt += t.delta;
      if (b.postedIds[t.id] !== i) e.push("ledger index mismatch");
      if (cash < 0 || debt < 0) e.push("negative historical balance");
    });
    if (cash !== b.cash || debt !== b.debt)
      e.push("cash/debt reconciliation failed");
    for (const k of KINDS)
      if (totals[k] !== b.totals[k]) e.push("total mismatch " + k);
    if (Object.keys(b.postedIds).length !== b.entries.length)
      e.push("transaction index mismatch");
    for (const v of Object.values(b.payables))
      if (!money(v)) e.push("invalid payable");
    return e;
  }
  return Object.freeze({ KINDS, createFinance, post, auditFinance });
});
