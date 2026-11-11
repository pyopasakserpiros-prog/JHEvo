"use strict";
const S = require("../js/sim.js"),
  Save = require("../js/save.js");
const report = {
  node: process.version,
  scope:
    "Simulation-only Node benchmark (8, 30, 100, 300, 500 NPCs), verifying high-scale performance",
  samples: [],
};
for (const count of [8, 30, 100, 300, 500]) {
  const w = S.create("benchmark-" + count);
  S.command(w, { type: "setPolicy", key: "autoAccept", value: true });
  if (count <= 30) {
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
  } else {
    S.command(w, { type: "directorEdit", action: "grantCash", amount: 150000000 });
    S.command(w, { type: "constructPlot", plotId: "prodLineB" });
    S.command(w, { type: "constructPlot", plotId: "prodLineC" });
    S.command(w, { type: "constructPlot", plotId: "dispatchHub" });
    S.command(w, { type: "scaleCompany", targetCount: count, freeGrant: true });
  }
  S.advance(w, 720);
  const sampleTicks = count >= 300 ? 144 : 288;
  const times = [];
  for (let i = 0; i < sampleTicks; i++) {
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
    averageMs: Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 1000) / 1000,
    p95Ms: Math.round(sorted[Math.floor(sorted.length * 0.95)] * 1000) / 1000,
    maxMs: Math.round(Math.max(...times) * 1000) / 1000,
    saveBytes: Buffer.byteLength(Save.serialize(w)),
  });
}
console.log(JSON.stringify(report, null, 2));
