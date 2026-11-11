(function (root, factory) {
  "use strict";
  const value = factory();
  if (typeof module === "object" && module.exports) module.exports = value;
  else root.CompanyLayout = value;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const clone = (o) => JSON.parse(JSON.stringify(o)),
    point = (p) => p && Number.isSafeInteger(p.x) && Number.isSafeInteger(p.y),
    key = (p) => p.x + "," + p.y;

  // High-speed pure LRU path cache for 200-500 concurrent NPC pathfinding
  const pathCache = new Map();
  const MAX_PATH_CACHE = 8192;

  function createLayout() {
    // 56x34 Greenfield Industrial Estate Campus:
    // - West wing (x: 1..15, y: 1..32): Office HQ + greenfield reserve for Trade Annex, Solar Grid, Dormitory, Expo Hall
    // - East wing (x: 17..54, y: 1..32): Main Factory Line A + vast greenfield land reserves for Lines B, C, D, Raw Depot, QA Lab, Dispatch Hub, Utility Plant
    const map = {
      width: 56,
      height: 34,
      revision: 1,
      entrance: { x: 2, y: 23 },
      zones: [
        { id: "office", nameTh: "ออฟฟิศ", x: 1, y: 1, width: 15, height: 32 },
        { id: "factory", nameTh: "โรงงาน", x: 17, y: 1, width: 38, height: 32 },
      ],
      blocked: [],
      stations: {},
    };
    for (let y = 1; y < 33; y++)
      if (![6, 14, 20, 27].includes(y)) map.blocked.push({ x: 16, y });
    const add = (id, kind, x, y, ax, ay, capacity = 1) => {
      map.stations[id] = {
        id,
        kind,
        cell: { x, y },
        access: { x: ax, y: ay },
        capacity,
        visualKey: "station." + kind,
      };
      map.blocked.push({ x, y });
    };
    add("sales", "sales", 4, 4, 4, 5);
    add("admin", "admin", 8, 4, 8, 5);
    add("research", "research", 14, 4, 14, 5);
    add("manager", "manager", 4, 8, 4, 9);
    add("assembly1", "assembly", 23, 4, 23, 5);
    add("assembly2", "assembly", 27, 4, 27, 5);
    add("assembly3", "assembly", 31, 4, 31, 5);
    add("quality1", "quality", 23, 9, 23, 10);
    add("quality2", "quality", 27, 9, 27, 10);
    add("packing", "packing", 31, 16, 31, 17);
    add("stock", "stock", 22, 18, 23, 18, 3);
    add("finished", "finished", 26, 18, 26, 19, 3);
    add("receiving", "receiving", 28, 19, 28, 20, 2);
    add("shipping", "shipping", 30, 18, 30, 19, 2);
    add("pantry", "pantry", 14, 16, 14, 17, 8);
    add("lounge", "lounge", 6, 13, 6, 14, 8);
    add("meal", "meal", 12, 16, 12, 17, 8);
    add("training", "training", 35, 14, 35, 15, 4);
    return map;
  }
  const inside = (m, p) =>
    point(p) && p.x >= 1 && p.y >= 1 && p.x < m.width - 1 && p.y < m.height - 1;
  const walkable = (m, p) =>
    inside(m, p) && !m.blocked.some((b) => b.x === p.x && b.y === p.y);
  function findPath(m, from, to) {
    if (!walkable(m, from) || !walkable(m, to)) return null;
    if (key(from) === key(to)) return [];
    const cacheKey =
      m.width +
      "x" +
      m.height +
      ":r" +
      (m.revision || 1) +
      ":b" +
      m.blocked.length +
      ":" +
      from.x +
      "," +
      from.y +
      "->" +
      to.x +
      "," +
      to.y;
    const hit = pathCache.get(cacheKey);
    if (hit !== undefined) {
      return hit === null ? null : hit.map((pt) => ({ x: pt.x, y: pt.y }));
    }
    const blocked = new Set(m.blocked.map(key)),
      q = [{ ...from }],
      seen = new Set([key(from)]),
      parents = new Map();
    let index = 0;
    while (index < q.length) {
      const at = q[index++];
      for (const [dx, dy] of [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ]) {
        const next = { x: at.x + dx, y: at.y + dy },
          k = key(next);
        if (!inside(m, next) || seen.has(k) || blocked.has(k)) continue;
        seen.add(k);
        parents.set(k, at);
        if (k === key(to)) {
          const path = [next];
          let p = at;
          while (key(p) !== key(from)) {
            path.push(p);
            p = parents.get(key(p));
          }
          path.reverse();
          if (pathCache.size >= MAX_PATH_CACHE) pathCache.clear();
          pathCache.set(cacheKey, path);
          return path.map((pt) => ({ x: pt.x, y: pt.y }));
        }
        q.push(next);
      }
    }
    if (pathCache.size >= MAX_PATH_CACHE) pathCache.clear();
    pathCache.set(cacheKey, null);
    return null;
  }
  function zoneAt(m, p) {
    const z = m.zones.find(
      (z) =>
        p.x >= z.x && p.y >= z.y && p.x < z.x + z.width && p.y < z.y + z.height,
    );
    return z ? z.id : "corridor";
  }
  function validateLayout(m) {
    const e = [];
    if (
      !m ||
      !Number.isSafeInteger(m.width) ||
      !Number.isSafeInteger(m.height) ||
      !Number.isSafeInteger(m.revision) ||
      m.width < 8 ||
      m.height < 8 ||
      m.width > 96 ||
      m.height > 64 ||
      !Array.isArray(m.blocked) ||
      !Array.isArray(m.zones) ||
      !m.stations ||
      typeof m.stations !== "object"
    )
      return ["invalid layout shape"];
    if (!walkable(m, m.entrance)) return ["entrance blocked"];
    const cells = new Set();
    for (const p of m.blocked) {
      if (!inside(m, p) || cells.has(key(p)))
        e.push("invalid/duplicate blocked cell");
      cells.add(key(p));
    }
    for (const z of m.zones)
      if (
        typeof z.id !== "string" ||
        !Number.isSafeInteger(z.x) ||
        !Number.isSafeInteger(z.y) ||
        !Number.isSafeInteger(z.width) ||
        !Number.isSafeInteger(z.height) ||
        z.width < 1 ||
        z.height < 1 ||
        z.x < 1 ||
        z.y < 1 ||
        z.x + z.width > m.width - 1 ||
        z.y + z.height > m.height - 1
      )
        e.push("invalid zone");
    for (const [id, s] of Object.entries(m.stations)) {
      if (
        !s ||
        id !== s.id ||
        !inside(m, s.cell) ||
        !point(s.access) ||
        !Number.isSafeInteger(s.capacity) ||
        s.capacity < 1 ||
        !cells.has(key(s.cell)) ||
        Math.abs(s.cell.x - s.access.x) + Math.abs(s.cell.y - s.access.y) !==
          1 ||
        findPath(m, m.entrance, s.access) === null
      )
        e.push("invalid/unreachable station " + id);
    }
    return e;
  }
  function expand(m, extraWidth, extraHeight) {
    if (
      !Number.isSafeInteger(extraWidth) ||
      !Number.isSafeInteger(extraHeight) ||
      extraWidth < 0 ||
      extraHeight < 0 ||
      extraWidth + extraHeight === 0 ||
      m.width + extraWidth > 96 ||
      m.height + extraHeight > 64
    )
      throw new TypeError("invalid expansion");
    const next = clone(m);
    next.width += extraWidth;
    next.height += extraHeight;
    next.revision++;
    const factory = next.zones.find((z) => z.id === "factory");
    if (factory) factory.width += extraWidth;
    for (const z of next.zones) z.height += extraHeight;
    const errors = validateLayout(next);
    if (errors.length) throw new TypeError(errors.join("; "));
    return next;
  }
  function addStation(m, s) {
    const next = clone(m);
    if (
      !s ||
      next.stations[s.id] ||
      !inside(m, s.cell) ||
      !walkable(m, s.cell) ||
      !walkable(m, s.access)
    )
      throw new TypeError("invalid station placement");
    next.stations[s.id] = clone(s);
    next.blocked.push({ ...s.cell });
    next.revision++;
    const errors = validateLayout(next);
    if (errors.length) throw new TypeError(errors.join("; "));
    return next;
  }
  return Object.freeze({
    createLayout,
    validateLayout,
    findPath,
    zoneAt,
    walkable,
    expand,
    addStation,
  });
});
