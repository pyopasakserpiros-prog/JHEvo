# JianghuSect 2 v2.6.0 — Transcendent visual overhaul

Base: main-debug `2883b2b` (Gemini `260e.zip`). The old ring renderer and unused icon variants were replaced with game-rendered scenes and matching equipment and codex art.

- Six Sovereign combat arts have different silhouettes and animated accents. Four beats change the scene from inscription and apparition to impact and decay. Full scenes use a 114–126 world pixel base radius, a 3-second render clock, and a named cut-in. Legendary scenes use their existing 60–84 pixel base radius. The dormant patriarch stone uses a restrained 68-pixel scene.
- Armor chrysalis, time rewind and echo, escort weapons, off-turn clash, regalia awakening, and forge quench emit visual snapshots when their real mechanics fire. The renderer reads ground scars from active fights and connects casts to their recorded recipients. It creates no simulated attacks, targets, damage, or rewards.
- `COMBAT.attack` now calls the public `COMBAT.useSkill` route so the existing Sovereign verse and Sundial mechanics that produce these effects run for autonomous casts too. There are no formula changes. This fixes a real behavioral difference between the direct skill API and the NPC attack loop.
- The shared vector artwork covers 38 Sovereign codices, the three roaming/singleton artifacts, the three pure Genesis pieces, the patriarch regalia's 24 forms and six awakening stages, and Transcendent material and pill art. Inventory grids and lists, item detail, the library, NPC techniques, the regalia pedestal and Edit Hub show the actual art for the resolved item. Equipped silhouettes and passive/mantra auras appear on the actor.
- The cast queue is capped at 24. Transcendent and Legendary share the existing full-scene budget (2 full on high, 1 on low). Other casts get compact art and low mode caps recipient marks. Proc snapshots use a WeakMap and do not enter the save or consume RNG. The save schema and script order are unchanged.

## Verification

- Carbon Compendia Master suite, Full Release Audit and Human Behavior suite, Legendary Visual Identity suite, item art catalog suite, shared skill visual events, and data schema validator.
- Chromium at 412 × 860 with the rebuilt standalone. An actual combat skill and the Coffin escort hook reached the game Canvas. Verified the sect inventory renderer, 38 codex icons, 24 distinct regalia silhouettes, six artifact icons, and simulation/RNG purity during presentation. All four beats rendered distinct browser frames.
- This is a focused visual pass. The screenshots reproduce representative scenes from the shipped renderer and do not certify every rare acquisition route or long-running gameplay outcome.
