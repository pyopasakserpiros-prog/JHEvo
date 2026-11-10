"use strict";
const S = require("../js/sim.js"),
  Save = require("../js/save.js");
const report = {
  node: process.version,
  scope:
    "Simulation-only Node benchmark, not whole-frame or physical mobile performance",
  samples: [],
};
for (const count of [8, 30]) {
  const w = S.create("benchmark-" + count);
  S.command(w, { type: "setPolicy", key: "autoAccept", value: true });
  while (w.people.length < count) {
    const candidate = S.candidates(w)[0],
      r = S.command(w, {
        type: "hire",
        candidateId: candidate.id,
        role: ["assembler", "inspector", "logistics", "sales", "engineer"][
          w.people.length % 5
        ],
      });
    if (!r.ok) throw Error(r.message);
  }
  S.advance(w, 1440);
  const times = [];
  for (let i = 0; i < 288 * 2; i++) {
    const start = performance.now();
    S.step(w);
    times.push(performance.now() - start);
  }
  const errors = Save.validate(w);
  if (errors.length) throw Error(errors.join("; "));
  const sorted = [...times].sort((a, b) => a - b);
  report.samples.push({
    people: count,
    ticks: times.length,
    averageMs: times.reduce((a, b) => a + b, 0) / times.length,
    p95Ms: sorted[Math.floor(sorted.length * 0.95)],
    maxMs: Math.max(...times),
    saveBytes: Buffer.byteLength(Save.serialize(w)),
  });
}
console.log(JSON.stringify(report, null, 2));
