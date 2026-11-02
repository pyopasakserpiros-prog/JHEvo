# v2.0.11 implementation plan

## 1. Tests first

- Add `test/v211_tribulation_ascension_suite.js` for all nine paths, eligibility gates, support and medicine, preparation persistence, success/failure, succession, retirement-vs-death, legacy cap, and old-save hydration.
- Add failing regression assertions for the Ancestral blessing cooldown, off-cycle realm rejection, and formal-rivalry-only vassal conversion.
- Register the new suite in `test/run_all.js`.
- Run the focused suites and confirm the new assertions fail for the intended reasons.

## 2. Implement the ascension lifecycle

- Add idempotent tribulation/legacy-state hydration and eligibility, support selection, chance calculation, start, daily tick, resolution, and participant-release helpers in `js/sect.js`.
- Integrate the saved three-day lifecycle with the existing daily sect update.
- Use `CULT.breakthroughChance` only as a non-mutating baseline. Do not invoke capped-stage breakthrough or its death path.
- Add capped cultivation-legacy scaling in `js/cultivation.js`; retire ascended characters with succession first when needed.

## 3. Integrate UI and balance adjustments

- Add Shrine UI for eligible candidates, active preparation, helpers, stone cost, history, and the permanent bonus; wire the start action in `UI.doAction`.
- Add the 30-day persisted regrant cooldown while retaining ordinary prayer behavior.
- Reject named elemental realms that are not active for `W.day` and update tests to use the proper cycle.
- Require formal `RIVAL_FEUD` before a win can create a vassal treaty.
- Fix the v2.0.10 prompt cadence wording and update baseline, roadmap, and release documentation for v2.0.11.

## 4. Verify and publish

- Run relevant progression, shrine, exploration, vassal, save/load, UI, and all-regression suites.
- Run data validation, syntax checks, single-file build, `git diff --check`, `human_core.js` fingerprint, and 40-script-tag checks.
- Write the Thai v2.0.11 implementation report with design-audit findings, test evidence, and follow-up recommendations.
- Commit and push the source and documentation to `main`; do not add a full-project ZIP.
