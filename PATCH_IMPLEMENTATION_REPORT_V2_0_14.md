# v2.0.14 — Specialist Crafts, Formations and Strategic Cultivation

## Baseline and scope

Source imported from `JHEvo-v2.0.13.zip` at `origin/Gemini` commit `6454c6061efe6e4055f184e96bd87332e73ad296`. The archive's source, rather than the older unpacked directory in that branch, is the baseline. No full repository ZIP is added. Original crafting IDs, six crafting subpaths and NPC investments remain available.

The new cultivation path is independent of office authority: other paths can hold offices and become Sect Master under existing decisions; strategic cultivators can train and cultivate as ordinary members. Available qualified officers provide bounded organizational benefits, regardless of cultivation path. No office is reserved to the new path.

## Content

12 major paths / 96 subpaths in the resulting registry. New path names and branches:

- วิถีค่ายกลและอักขระยันต์: ผู้พิทักษ์ค่ายกลชีพจรดิน, ยันต์ผนึกชำระมาร, ยันต์อัสนีทะลวงทัพ, ค่ายกลมายาพรางเงา.
- วิถีพิชัยยุทธ์และอภิบาลสรรพชน: กุนซือธงศึก, ผู้ดูแลรากฐานสำนัก, ทูตประสานพันธมิตร, ผู้จัดเสบียงคาราวาน, อาจารย์อภิบาลศิษย์.
- Existing unified craft path gains ครัวทิพย์ฟื้นชีวา, สำรับหยกเตรียมบำเพ็ญ, ช่างเกราะไหมเหล็กสวรรค์. Broad existing craftsmen remain generalists rather than being removed.

Adds 24 active arts, 12 innates, 12 passives, two foundation arts, nine mantras and 12 nine-ordinal specialization tracks. New paths use eight native stages and canonical realm equivalence. Existing shared resonance sets cover new specialists; two new Pagoda path sets and floors complete actual reward/progression integration. Names, strengths, weaknesses, actual skills, sources and runtime profiles are registered through existing authorities. Generic library and discovery flows expose learnable arts; innates stay exclusive.

## Gameplay

- Paid cooking reserves grain and settles once, preserving receipts on save/load. Ordinary cooking remains accessible to everyone. Specialty meal batches are backed by meal stock, bounded and expire; food recovery and cultivation preparation produce different modest effects when eaten, with a shared cooldown. Sold meals cannot be replaced by ordinary meals to manufacture specialty effects.
- Armor craftsmanship improves an actual armor recipe's outcome; specialist work and training use existing skills. Teaching specialists improve real student practice, not passive free skill awards.
- Strategy uses the strongest qualified contribution rather than unbounded per-head stacking. Available officials can reduce upkeep by at most 8%, accelerate construction by at most 12%, and reduce provision losses by at most 20%. Practice requires authorized actual duties and has a saved cooldown. Envoys actually participating in diplomacy add at most two attitude points; nonparticipants and duplicate envoys do not stack benefits.
- Formation and command paths have bounded group synergies and skill-sensitive solo combat effects. Civil specialists retain usable combat and shared learning options without matching every dedicated fighter's damage.
- Major-path selection now gives each path one best-fit candidate, then chooses a branch within the selected path. There is no top-six-global-subpath cutoff or extra lottery tickets from adding duplicate branches. Neutral-input baseline offsets are brought to a common scale; character traits, roots, skills and preferences still influence choice. This is not an equal-population quota.

## Existing-game review and fixes

Corrected fixed UI/path catalogs, missing new-path stat/profile integration, missing Pagoda floors/rewards and invalid raw-skill affinity assumptions. Skill changes invalidate relevant cached path scores. Timed cultivation food effects use their actual numeric bonus rather than treating any positive bonus as a fixed 15%. Emergency cognition can select recovery during a pending review cooldown even when no prior goal exists. The legacy audit also found independent-track native realm bands being compared directly against canonical realms: all subpaths now map terminal specialization to equivalent realm9. Cross-path appointment/recruitment merit uses equivalent realm without reserving offices to any path. Generic NPC pill choices and precombat eligibility use equivalent realm, while native path-specific breakthrough pills retain exact path/stage requirements; both purchase cache layers track path/stage. Elemental skill training uses real WATER_ICE/WOOD_LIFE affinities. Old BOW/STAFF/ASTRAL preference aliases map to real HC affinities instead of nonexistent fields. Cultivation-rate caches track skill changes, including older crafting and general paths. Actual summoned helper strength inherits bounded caster statistics instead of falling back to mortal foe power20.

## Research and design reasoning

Consulted *The Art of War*, Lionel Giles translation, Project Gutenberg: https://www.gutenberg.org/files/132/132-h/132-h.htm . Its discussion of the commander, method/discipline, forethought and supply costs informed the distinction between combat leadership, administration and provisioning. These are thematic inspirations, not historical validation of fantasy mechanics or numeric bonuses. Wikipedia pages on fulu and food therapy returned HTTP403 here and were not used as verified sources. Fantasy names, formations and food buffs are original game design choices.

## Validation

New focused suites: `v214_legacy_combat`, `v214_content`, `v214_governance`, `v214_professions`, `v214_path_selection`. Test registration and coverage include actual crafted output, meal stock consumption, expiry, transaction/save idempotency, trained-skill effects, old-save hydration, office independence, strongest-only contributions and finite progression. Independent review exercised 96 new branch/native-stage combinations and verified new technique/mantra resolution.

The supplied v2.0.13 runner referenced absent v2.0.12 and v2.0.13 test files. Added real regression suites for authored build-depth registration and unique generated gear/repair/save behavior; these are reconstructed checks, not recovered original test files.

Managed Chromium permits local HTTP but blocks file navigation. Browser fixtures now use a bounded loopback fixture server; assertions remain active. Installed system Chromium was used through the local Playwright executable configuration.

Final commands and results are recorded after the final legacy audit below. Schema warnings inherited from the supplied baseline are distinguished from failures. Statistical path samples are synthetic generated populations, not proof of equal viability in every sect or long campaign.

## Limits and follow-up

This patch does not establish that the entire game is bug-free. Long campaigns should continue to monitor trained-skill progression pace, treasury effects and specialist recruitment in different sect archetypes. Strategic and civil competence is not an exclusive appointment qualification. Earlier audit prompts and reports remain historical references, not automatic instructions to rebuild completed features.

## Final audit notes

Removed two nonexistent legacy staff-technique IDs from the staff archetype's starting curriculum; existing real staff arts remain. Updated the old successor/archetype test's obsolete fixed library-size assumption to enforce a curated fraction, unique IDs and real references, while retaining successor-election and archetype signature tests. Its original fixed-size assertion also failed in the supplied v2.0.13 baseline.

A deterministic 3,000-NPC sample (seed214) selected all12 major paths, including GOD56, KARMA112 and STRATEGY91. This demonstrates reachability in that sample, not equal gameplay performance. A10-game-day simulation completed without a runtime crash. Independent review was followed by actual regression tests of summon casting, old-path office merit, pill eligibility and all96 specialization endpoints.

## Final verification results

- Core fingerprint:155:2f9c9dd7; locked human_core.js unchanged.
- Schema auditor:0 errors;11 warnings (same count as supplied v2.0.13 baseline).
- Single-file build:success; source index retains40 script tags.
- Full registered regression matrix:93/93 groups PASS,0 failures/timeouts, including mobile browser performance and startup/import flows;163 JavaScript files syntax-checked. Final run duration64.83s.
- `git diff --check`:clean.

Runtime release tag is SIM.PATCH_VERSION2.0.14; existing save-schema marker is retained for compatibility.
