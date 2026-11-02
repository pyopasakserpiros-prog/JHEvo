# v2.0.11 Heavenly Tribulation, Ascension, and Design Audit

## Goal

Implement the roadmap's Heavenly Tribulation & Ascension feature while correcting clearly unreasonable gameplay loops found in the v2.0.8–v2.0.10 additions. This is a design review, not a bug hunt. Preserve all nine paths, existing save compatibility, and the separation between ascension and death.

## Existing systems to extend

- The Ancestral Shrine already stores legacy tablets (capped at 36) and grants a 14-day blessing. Ascension should add a durable ascension record and a bounded sect-wide legacy effect without replacing ordinary tablets or shrine prayers.
- `CULT.maxStage` and `CULT.equivalentStage` already normalize the different path caps (4, 5, 8, and 9). All nine paths must qualify at their own maximum stage and equivalent stage 9.
- `SIM.retire` removes a cultivator without counting a death, returns their property and knowledge to the sect, and adds them to `W.gone`. A sect master must pass succession before retirement.
- The elemental realm UI already chooses the realm active on the current 90-day cycle, but the API currently accepts any realm at any time.

## Chosen mechanics

### Heavenly Tribulation & Ascension

- Start only by player action at the Ancestral Shrine. Require a living, active cultivator at `CULT.maxStage` and equivalent stage 9, at least two available sect helpers, no other active tribulation, and 500 sect spirit stones.
- Auto-select up to three available helpers with guardian, healer, and formation roles. An available restorative pill may be used for a modest bonus; the feature does not require a rare pill.
- Lock the candidate and helpers into a three-day saved preparation. Keep the attempt as persistent IDs/dates and restore all surviving participants after any outcome.
- Resolve one seeded success roll using `CULT.breakthroughChance` as a baseline, then bounded helper, cross-path formation, role, and optional medicine bonuses. Never call `CULT.breakthrough` at a capped stage.
- On failure, keep the cultivator alive, apply a recoverable injury/stress cost, and set a 90-day retry cooldown. A failed trial cannot consume the candidate or helpers.
- On success, inscribe an ascended legacy tablet, append a capped history record, increment a persisted aggregate count, run succession if the ascendant is master, and retire the ascendant without adding a death. Each legacy grants +1% cultivation gain to future sect cultivation, capped at +5%; this aggregate survives the tablet list's 36-entry cap.
- Show eligibility, current preparation, support members, cost, and legacy bonus in the Ancestral Shrine UI.

### Design-reasonableness adjustments

1. Keep the 14-day Ancestral blessing, but allow a new blessing only every 30 days. Ordinary prayer remains available for its stress relief; the cooldown is persisted and old saves hydrate without it.
2. Enforce the 90-day elemental realm schedule when a caller names a realm. Requests for an off-cycle realm return no expedition; the current realm and existing rewards remain unchanged.
3. Only convert a defeated sect into a vassal after a win against a formal `RIVAL_FEUD`. A merely low attitude is not enough to turn one envoy duel into a vassal treaty. The existing vassal tribute flow remains intact.
4. Correct the historical v2.0.10 prompt's “Quadrennial” label to “Triennial”; the implemented 1,080-day schedule and the roadmap both mean every three game years.

## Audit coverage

Review the v2.0.8–v2.0.10 additions: path equivalence/archetypes, pet breeding and beast progression, facilities and support doctrine, universal pagoda and rotating realms, gate war-beasts and mounts, formation synergies, martial conference cadence, vassal treaty conversion, and Ancestral Shrine rewards. Keep systems whose current rules match the roadmap: path-equivalent stage handling, one mount bonus per expedition, one-time pagoda set rewards, bounded formation bonuses, and the 1,080-day conference cadence.

## Save, lifecycle, and UI rules

- Do not persist data under underscore-prefixed keys.
- Hydrate new state idempotently for old saves.
- Store IDs rather than object references in active attempts; re-resolve references at start and resolution.
- Release every surviving participant on success, failure, or invalidated attempts.
- Keep ascended-history display bounded while retaining an aggregate permanent bonus.
- Localize new player-facing text in Thai and escape all dynamic text in the UI.
- Preserve the `human_core.js` lock, the exact 40 HTML script tags, and `test/load.js` source order.

## Verification

- Add a v2.0.11 suite first and verify it fails before implementation.
- Cover all nine path caps, eligibility, helper/medicine contribution, three-day save/load, successful succession/retirement without death, nonlethal failure and cooldown, bounded legacy bonus, old-save hydration, shrine prayer cooldown, realm rotation enforcement, and the narrower vassal condition.
- Run schema validation, the single-file builder, focused suites, all regression groups, syntax checks, and invariant checks.
