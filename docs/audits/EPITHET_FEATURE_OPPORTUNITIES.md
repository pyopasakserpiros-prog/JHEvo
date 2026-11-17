# Audit & Feature Opportunities: Living Jianghu Epithets (สมญานามมีชีวิตแห่งยุทธภพ)

## 1. Executive Summary
- **Baseline Audited**: `JS2-v2.6.0` (`HC.FINGERPRINT = 155:2f9c9dd7`, 40 `<script>` tags, Living Hunt 125 land beast species / 241 pool entries).
- **PDF Proposals Reviewed (`EPITHET_01A`, `EPITHET_01B`, `EPITHET_01C`)**: **260 / 260** proposals (`#001–#260`) reviewed in full (`0 UNREVIEWED`, `0 BLOCKED`).
  - `IMPLEMENTED`: **242**
  - `ADAPTED`: **15**
  - `ALREADY_EXISTS`: **1** (`#025` `EPI_CMB_025` bridged with `TR_AC_TOURNAMENT_CHAMPION`)
  - `MERGED`: **1** (`#255` `EPI_PST_255` merged into `#248` `EPI_PST_248`)
  - `REJECTED`: **1** (`#121` `EPI_INF_121` rejected due to Bugfix 11D monogamous companion lock)
- **Original Codebase-Grounded Additions (`#261–#276`)**: **16** new epithets (`EPI_NEW_261` .. `EPI_NEW_276`) grounded in real codebase mechanics not covered by the PDF drafts.
- **Total Active Runtime Epithet Definitions in `JD.EPITHETS.BY_ID`**: **274** (`258` from PDF + `16` original).

---

## 2. Real Codebase Systems Surveyed for Epithet Integration

| Subsystem | Module & Key Functions | Epithet & Deed Hooks Wired |
|---|---|---|
| **Combat & Tactical Engine** | `js/combat.js` (`C.conclude`, `C.duelEnd`), `js/stats.js` (`ST.compute`, `ST.getBaseFast`, `passiveCacheKey`) | `onCombatConclude` records serious kills, boss kills, outnumbered wins, low-HP survival wins, weapon-specific mastery kills, defensive redirects (`CULT.DEFENSIVE_ARTS`), and triggers direct Moveable Crown duel transfers (`#235–#246`). Anti-farming guards block non-serious spars and trivial targets (>2 stages lower). |
| **Living Hunt & Menagerie** | `js/explore.js` (`WILD`, 125 land species, herb offerings, `ABIL_IRON_MARROW_GUARD`, `ABIL_SOLAR_STAR_AEGIS`) | `EPI_NEW_261` (herb-offering beast taming) and `EPI_NEW_262` (primordial iron-marrow / solar-aegis breaker), plus `#069–#070` beast tamer epithets. |
| **6-Pillar Martial Architecture** | `js/cultivation.js` (`CULT.QINGGONG`, `CULT.MANTRA_SYSTEM`, `CULT.DEFENSIVE_ARTS`, `CULT.SUPPORT_ARTS`, `CULT.FORBIDDEN_ARTS`, `CULT.PASSIVE_RESONANCE`) | `EPI_NEW_263`..`EPI_NEW_268` hook directly into real runtime states (`qinggongState`, `mantraState`, `defensiveArtState`, `supportState`, `forbiddenArtState`, `passiveResonanceState`). |
| **Alchemy, Forging & Multi-Phase Crafting** | `js/economy.js` (`ECO.finishCraft`, `ECO.brewMultiphaseElementalPill`, `ECO.refineGearWithCatalyst`, `ECO.repairGear`, `ECO.socketElementalRunes`) | `onCraftFinish` records alchemy/forge masterworks, cauldron mishaps (`EPI_CMP_033`), subsequent cauldron mastery (`EPI_ART_057`), 3-phase elemental pills (`EPI_NEW_269`), and 3-Star catalyst attunements (`EPI_NEW_270`). |
| **Sect Governance, 8 Peaks & Leylines** | `js/sect.js` (`SECT.LEYLINE_GRID`, `SECT.STRATEGIC_COUNCIL`, `SECT.exposeEmbezzle`, `SECT.inscribeLegacyTablet`, `SECT.prayAtAncestralShrine`) | `EPI_NEW_271` (leyline anchor guardian), `EPI_NEW_272` (court memorial counselor), `EPI_INF_115` (embezzlement stigma), `#085–#092` (dynamic lineage seniority titles), and `#247–#260` (posthumous ancestral tablet honorifics). |
| **World Exploration, Micro-Locations & Chronicles** | `js/explore.js` (`EXPLORE.MICRO_LOCATIONS`), `js/expedition.js` (`EXPED.awakenAncientDaoLegacy`, `hydrateFigureToNpc`, `buildFactSnapshot`, `presentChronicleEntry`) | Unwitnessed wilderness deeds stay in `npc.deedStats.unwitnessedDeeds` until verified with physical proof (`verifySecretDeedWithProof`); `hydrateFigureToNpc` preserves external notable epithets and crowns; `buildFactSnapshot` freezes `epithetAtEventTh` for historical snapshot immutability. |
| **Social Cognition & Rumor Propagation** | `js/cognition.js` (`COG.shareKnowledgeOnInteract`, `COG.explain`) | Propagates epithet rumors across NPCs with `originEventId` deduplication so echo-chamber gossip never inflates `witnessCount`; supports multi-perspective `evaluatePerception(W, observer, target)`. |

---

## 3. Rationale for Non-Literal Decisions (`ALREADY_EXISTS`, `MERGED`, `REJECTED`, `ADAPTED`)

1. **`#025` (`EPI_CMB_025` ไร้พ่ายลานประลองสามสมัย) → `ALREADY_EXISTS`**:
   - `TR_AC_TOURNAMENT_CHAMPION` already exists in `GAME_SOURCE/data/data_core.js` and `js/combat.js` for single tournament victory (`atk +6%`).
   - Bridged `#025` as a 3-win dynasty honorific (`SOCIAL` tier, mentoring & prestige recognition) without duplicating combat stats.
2. **`#255` (`EPI_PST_255` บรรพชนผู้หลับใหลใต้สุสานศิลา) → `MERGED` into `#248` (`EPI_PST_248`)**:
   - The codebase has no 100-year `hibernationVault` building; ancient seclusion awakening is handled via `CULT.tickClosedDoorSeclusion` and `SECT.inscribeLegacyTablet`. Merged into `EPI_PST_248` (`บรรพชนผู้พลีชีพรักษาประตูสำนัก`) with an explicit seclusion-guardian epitaph variant.
3. **`#121` (`EPI_INF_121` คนหลายใจเหยียบเรือสองแคม) → `REJECTED`**:
   - Bugfix Category 11D in `js/ai.js` strictly enforces monogamous `companionId` / `spouse` courtship locks (`hasOtherPartner`), preventing simultaneous married adultery in the simulation.
4. **15 `ADAPTED` Proposals**:
   - Proposals referencing non-existent buildings or player-driven menus (`#008`, `#023`, `#091`, `#093`, `#113`, `#140`, `#172`, `#207`, `#217–#220`, `#222–#223`, `#232`) were adapted to authentic autonomous simulation hooks (`WILD` beast tide defense, `EXPED` caravan escort, `SECT.PEAKS` 8-Peak governance, `AI.ACTS` autonomous triggers, and `CULT.EPITHETS.bestowDaoName`).
