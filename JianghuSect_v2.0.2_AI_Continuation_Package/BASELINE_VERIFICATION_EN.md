# BASELINE VERIFICATION — INDEPENDENT CHECKS

## Archive and source integrity

- Original archive: 19,080,530 bytes; SHA-256 `56157fcdd3bc1eaffa8878d549b4a47ef665375ba54ba0c421770105e0d89194`.
- ZIP integrity: PASS (`ZipFile.testzip()` returned `None`).
- Original manifest: 400/400 file sizes and SHA-256 hashes independently matched.
- Original archive entries: 401.
- Source standalone and package-root standalone: byte-identical.
- Rebuild using `node tools/build_single.js`: byte-identical to the shipped standalone.
- Verified standalone: 3,582,995 bytes; SHA-256 `57c65c23ed4cd97657ebea85bc484a8ec995099ac8980be6394c36676dc8ec41`.
- Protected `js/human_core.js`: SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`; fingerprint `155:2f9c9dd7`.

## Fresh execution in the original full-source extraction

Node environment: `v22.16.0`.

| Command | Result |
|---|---|
| `node test/run_all.js` | PASS — 70/70 groups |
| Independent `node --check` sweep | PASS — 140/140 JavaScript files |
| `node test/phase2_edit_hub_inventory.js` | PASS |
| `node test/elemental_overhaul_suite.js` | PASS — 78/78 focused assertions |
| `node test/standalone.js` | PASS — 40 inline scripts, offline runtime, initialization and save/load |
| `node test/core_lock.js` | PASS — protected fingerprint and core dimensions verified |
| `node tools/build_single.js` | PASS — standalone reproduced byte-for-byte |

Targeted probes also reproduced:
- Missing `T:` technique-crystal catalog entries while direct `T:` spawn API succeeds.
- Duplicate main/subpath manuals are consumed for zero CP reward.
- Duplicate recipe scrolls are consumed for zero reward.
- Crystal donation rejects a stack at 999 instead of using overflow.
- A non-spawned subpath crystal with an already-known manual can still be accepted for positive reward under a default fresh-world condition (price 62, reward 24).

## Fresh execution in the curated handoff package

The source cleanup removed only obsolete tools and historical artifacts; all 89 test JavaScript files were retained.

| Command | Result |
|---|---|
| `node test/run_all.js` | **68/70 groups PASS**; two browser-only tests failed at DevTools startup |
| Independent `node --check` sweep | PASS — 136/136 retained JavaScript files |
| `node test/standalone.js` | PASS |
| `node test/core_lock.js` | PASS |
| `node test/phase2_edit_hub_inventory.js` | PASS |
| `node test/elemental_overhaul_suite.js` | PASS — 78/78 focused assertions |
| `node tools/build_single.js` | PASS — standalone hash unchanged |

The two curated-package full-run failures were:
- `skill_visual_browser`: `ECONNREFUSED 127.0.0.1:<ephemeral-port>`
- `browser_mobile_perf`: `ECONNREFUSED 127.0.0.1:<ephemeral-port>`

Both failures occurred while connecting to the local DevTools/browser process, not from a game assertion. The other 68 groups passed. The machine-readable output is retained at `QA_BASELINE/curated_source_full_regression_2026-10-31.json`.

## Parallel browser-runner inconsistency

`node tools/run_parallel_tests.js` was also rerun in the original extraction and returned **69/70**, with a browser test intermittently failing during local DevTools/browser startup (`ECONNREFUSED` to localhost). A second run with one worker also returned 69/70 but failed a different browser test. Running browser test files individually in that environment exited successfully without useful output.

Interpretation: ordinary sequential regression was green in one environment, but browser automation was not reproducible across execution environments. Treat affected browser automation as **FLAKY / NOT RELIABLY VERIFIED**, not as a confirmed gameplay defect and not as a clean 70/70 parallel result. The next agent must rerun browser QA in its own environment and report exact failures.

## Historical long-simulation evidence

The original v2.0.2 handoff contains final-code evidence for:
- Native simulation: 90 simulated days / 129,600 ticks PASS.
- Ecology/craft simulation: 90 simulated days / 129,600 ticks PASS.
- Root-generation calibration: 14 runs, pooled mean 386.43 generated-character appearances per 360-day world-year.

The original continuation prompt also says "180 days PASS", but the more precise final handoff and patch report state that the 180-day run passed **before** the final DOT/AI refinement, while the final code was verified for 90 days. Therefore:
- 90-day final-code evidence is retained in `QA_BASELINE/`.
- 180-day final-code status is **NOT VERIFIED**.
- Physical Android/Snapdragon 8 Elite certification is **NOT PERFORMED**.

## QA policy for the next release

Distinguish:
- inherited evidence vs tests rerun on the final code hash;
- sequential vs parallel test-runner behavior;
- Node simulation vs real browser behavior;
- responsive viewport emulation vs physical Android device testing;
- fixture coverage vs natural-world simulation;
- passing assertions vs actual gameplay correctness.

Do not claim "all tests passed" if any required suite is flaky, skipped, timed out or not run. If the final code changes after a test run, rerun all affected checks.
