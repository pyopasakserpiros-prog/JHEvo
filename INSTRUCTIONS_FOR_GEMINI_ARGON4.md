# ข้อความคำสั่งสำหรับส่งให้ Gemini 4 Argon ในแชท (Prompt for Gemini 4 Argon)

> คุณสามารถก๊อปปี้ข้อความในกล่องด้านล่างนี้ (Copy code) ไปวางส่งให้ **Gemini 4 Argon** ในแชทที่แนบไฟล์ ZIP ได้ทันทีครับ:

```markdown
Hello Gemini! I have provided the complete, verified JianghuSect Evolution (JHEvo) project archive (v2.0.17 baseline).

Your mission is to architect, implement, and fully integrate the next major release: **v2.0.18 (Interactive Jianghu World Map, Strategic Sect Hegemony, and Mythological Beast Evolution)**.

### 1. Architectural Mandate & Independent Design Authority
- Read and follow `START_HERE_FOR_AI.md` and `NEXT_PATCH_PROMPT_V2_0_18_EN.md` as your foundational blueprint.
- **You are granted full systems design authority:** Do not treat prompt suggestions or coordinates as rigid dogma. Reason independently, challenge assumptions, and design the most balanced, elegant, and lore-coherent implementation.
- **Mandatory Preflight:** Always load and read the matching Master Skill in `.agents/skills/<skill>/SKILL.md` before editing any subsystem in `GAME_SOURCE/`.
- **Non-Negotiable Locks:**
  1. Never modify `GAME_SOURCE/js/human_core.js` (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 locked).
  2. Preserve exactly 40 `<script>` tags in `GAME_SOURCE/index.html` and identical module load order in `GAME_SOURCE/test/load.js`.
  3. All player-facing items, techniques, locations, notifications, and AI utility reasons must include Thai localization (`nameTh`).
  4. Maintain simulation tick performance at `< 3.0 ms/tick` across 80 active NPCs.
  5. **No Legacy Save Baggage:** Backwards compatibility with older legacy saves is NOT required. Innovate boldly without worrying about breaking old saves.

### 2. Core Features to Implement (The 4 Pillars)
1. **Pillar 1: Interactive Jianghu World Map & Topological Node Network:**
   - 5-Region Geographic layout (Center player sect, North snowy crags/pagoda, South wetlands/river, East trading plains/forest, West fiery desert).
   - Node connections, distance/day travel times, and mount travel speed scaling (`MOUNT_CHARGER`, `MOUNT_AVIAN`, `MOUNT_UNGULATE`).
2. **Pillar 2: Active Sect Warfare, Sieges & Balanced Hegemony Dynamics:**
   - 3-Phase offensive sect sieges (Outer Gate & Beast Vanguard -> Sect Array & Elders -> Patriarch Duel/Surrender).
   - Post-siege resolutions: Vassalage (`VASSAL_TREATY`), Pillage, or Free Trade.
   - Realistic vassalage balance: Seasonal tributes, protectorate duty (defending vassals from raids), and dynamic loyalty/rebellion risk (`loyalty < 20`).
3. **Pillar 3: Mythological Beast Evolution & Four-Symbol Bloodlines:**
   - Awaken 4 mythical sovereign bloodlines using Primordial Elemental Catalysts: Azure Dragon (Water/Wood), White Tiger (Metal/Wind), Vermilion Phoenix (Fire/Yang), Black Tortoise (Earth/Yin).
   - Active roles in offensive sieges (battering defenses) and node garrison defense.
4. **Pillar 4: Serendipity & Contestable Resource Nodes:**
   - Contestable nodes (Spirit Stone Mines, Millennial Herb Valleys, Caravan Toll Gates) requiring disciple garrisons or sentinel beasts.
   - Timed world anomalies (transient ancient grottoes racing with rival sects).

### 3. Mandatory 5-Step Delivery Sequence
When you have finished implementation, deliver the results in this exact sequence:
1. **Verification & Testing:**
   - Ensure `node GAME_SOURCE/tools/validate_data_schema.js` passes with `Errors: 0`.
   - Ensure core Node.js test suites pass (`cd GAME_SOURCE && node test/run_all.js`). Any browser/Chromium/DOM failures caused by chat environment limitations are completely excused. Focus on game logic, data integrity, and formulas.
2. **Single-File Standalone Rebuild:**
   - Run `cd GAME_SOURCE && node tools/build_single.js` to update `JianghuSect_single.html`.
3. **Implementation Report:**
   - Write a detailed technical report in `PATCH_IMPLEMENTATION_REPORT_V2_0_18.md` covering all new modules, schema changes, formulas, test suites, and UI additions.
4. **Synchronize Master Skills:**
   - Update all relevant Master Skills in `.agents/skills/<skill>/SKILL.md` (specifically `combat-design`, `procedural-gen`, `progression-design`, `game-ui-ux`, `economy-balancing`, `gameplay-architecture`, `qa-test-matrix`) to reflect the v2.0.18 systems and formulas you just built!
5. **Full Project ZIP Delivery:**
   - Package and provide a complete downloadable ZIP containing the full project (`JianghuSect_single.html`, `GAME_SOURCE/`, `test/`, `tools/`, `.agents/skills/`, and reports) so I can immediately download and deploy it.

Please begin your analysis and development!
```
