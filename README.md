# JianghuSect Evolution — v2.0.24

Playable cultivation, sect-management, and martial warfare game. Version 2.0.24 replaces the world map with a navigable illustrated atlas connected to the living world and real expeditions. See [the 2.0.24 report](PATCH_IMPLEMENTATION_REPORT_V2_0_24.md) and [the previous UI report](PATCH_IMPLEMENTATION_REPORT_V2_0_23.md). This working branch integrates **v2.0.17** (Deep Cohesion, Universal 21-Relic Trinity, 2-Piece/3-Piece Legendary Relic Resonance, Relic Star Attunement, Cross-Path Mentorship, Dying-Wish Qi Transmission, and Sworn Ally Raid Reinforcements).

- Play: [standalone HTML](GAME_SOURCE/JianghuSect_single.html)
- Source and tests: [GAME_SOURCE](GAME_SOURCE/)
- Current implementation and validation: [v2.0.24 report](PATCH_IMPLEMENTATION_REPORT_V2_0_24.md)
- Historical patch assignment: [v2.0.18 assignment](NEXT_PATCH_PROMPT_V2_0_18_EN.md)
- AI developer instructions: [START_HERE_FOR_AI.md](START_HERE_FOR_AI.md), [AGENTS.md](AGENTS.md)

## v2.0.17 Highlights

- **Universal 21-Relic Trinity (`VC.LEGENDARY_EQUIPMENT`):** Complete coverage across all 17 equipment types (14 weapons, 3 armors, 4 accessories) with 62 living clue templates.
- **2-Piece & 3-Piece Legendary Relic Resonance (`MARTIAL.evaluateLegendaryRelicResonance`):** Two-piece ("ทวิศาสตราเทวะประสาน") and three-piece ("ไตรรัตนะเทวศาสตราบรรพกาล") set resonances with stat multipliers, flat damage mitigation, and wildcard set slot.
- **Relic Star Attunement (`ECO.attuneLegendaryRelic` 1–3 ★):** Infuse high-tier catalysts to awaken 1 to 3 stars, scaling stats up to +30%.
- **Cross-Path Mentorship & Dying-Wish Qi Transmission (`SECT.MENTORSHIP`):** Master-apprentice coaching, Sect Heritage Arts preservation, and pre-death cultivation inheritance.
- **Living Jianghu & Karma Bonds (`SECT.JIANGHU`):** Dynamic sworn allies that arrive as reinforcements during hostile sect raids.
- **Combat Wiring for Custom Stats & Support AI:** `soul_atk`, `aura_potency`, `command_authority`, and `construct_atk` fully integrated into combat formulas; autonomous NPC heals and timed buffs.

## Verification

- Data schema validation: passed with 0 errors (0 warnings).
- Full regression matrix: 96 of 102 groups pass, including all present suites and the syntax sweep; six suites referenced by the baseline are missing from the supplied source (see the report).
- Protected `human_core.js` SHA-256 (`155:2f9c9dd7`) and exact 40-script-tag load order invariant intact.
- Performance budget: `< 3.0 ms/tick` across 80 active NPCs.
