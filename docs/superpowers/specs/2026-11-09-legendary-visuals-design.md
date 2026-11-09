# Legendary visual identity — approved direction

User approved implementation and delegated visual decisions on 2026-11-09. Base: main e048b5f / JS2-v2.5.0. This is a visual refinement of that baseline; it does not claim the unrelated JS2-v2.6.0 assignment is implemented.

Goal: every existing legendary art and authored relic reads as legendary and retains its own thematic silhouette. Use the existing Canvas pipeline and real combat events. Preserve simulation, RNG, core bytes and script order.

Approaches: only enlarge shared signatures (too little identity); fully replace all renderers (unnecessary duplication); selected approach: restore authored legendary motifs, combine path-specific manifestations with existing signatures for newer apex arts, and author 27 equipment glyphs with matching ambient/proc presentations.

Arts have a 1.5 second anticipation/manifestation/afterglow, larger bounds than ordinary signatures. Existing passive identities remain active-loadout gated. Equipment has distinct weapon/chest/accessory presentation and real-proc bursts; ordinary T7 cannot receive this layer. Complete all six missing named weapon silhouettes and prevent generic held weapons from overpainting authored silhouettes.

Constraints: bounded 24 event queue, viewport culling, pause freezes clocks, no saved cosmetic state, baseline loaded events to prevent replay, no global flashes/shake. Low quality reduces ornament counts; reduced motion keeps stable silhouettes. No new dependencies or script tags.

Verification: registry coverage (50 legendary arts, 27 relics), unique geometry, dispatch precedence, real combat/proc ingestion, unknown data, unusable gear, same-id rarity changes, pause/load/despawn, context balance and serialized world/RNG purity; Chromium desktop/mobile plus rebuilt standalone. Do not claim full-game play balance verification.
