# v2.0.6 follow-up review and fixes

## Findings fixed

- `SECT.masterDecision` used nonexistent diplomacy API names. It now calls the implemented `CONTENT.signTreaty` and `CONTENT.exchangeWithAlly`; successful trade records the cooldown, day zero is handled correctly, and the agreement threshold matches treaty signing.
- The compatibility panel calculated path/subpath combat fit, but real combat only applied weapon fit. `MARTIAL.skillEfficiency` now applies the path/subpath combat factor independently of equipment matching, and `SK.qiCost` applies the corresponding qi-cost factor. Regression checks cover cross-path combat scaling and composition with bow/sword fit.
- Breakthrough blessings compared their expiration against a nonexistent `STATS.now` clock. `CULT.breakthrough` now passes the simulation's `W.t` into the chance calculation; active and expired blessing behavior are covered.
- The previously absent `test/diplomacy_sanctum_ancestral_suite.js` is now included as a focused production-code suite. It checks diplomacy agreement and exchange, shrine blessing, three-floor sanctum completion and rewards, return of expedition members, bottleneck inspection, blessing effects/expiry, and save/load persistence.
- Rebuilt `JianghuSect_single.html` from the source.

## Verification

`node test/run_all.js`: **79/79 groups passed**, including browser UI and mobile performance groups. Browser checks ran in headless Chromium via a temporary local-HTTP adapter because this environment blocks direct `file://` navigation. Mobile performance check reported 0.795 ms/tick and 314.3x the tested cap for its 80-NPC stress case. Focused checks also passed for `martial_paths.js`, `diplomacy_sanctum_ancestral_suite.js`, `unified_weapon_skills_and_archetypes_suite.js`, `elemental_overhaul_suite.js`, and `standalone.js`.

## Review limits

These fixes close the concrete integration defects found in the audit; they do not certify balance for every legendary/manual combination. NPC cognition and life-authority regressions passed, but no statistical multi-seed gameplay balance campaign was run.
