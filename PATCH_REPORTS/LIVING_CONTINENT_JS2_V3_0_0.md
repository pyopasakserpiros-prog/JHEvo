# JianghuSect 2 v3.0.0 — Living Continent

Development base: `main-debug` at `e4ce280`. Runtime stays in JianghuSect 2. The save marker for this patch is `3.0.0-living-continent`.

## Canonical geography

- The painted atlas occupies a 1,000 × 1,000 li coordinate frame. The top left is `(0, 0)`; x increases east and y south. The `0–100` coordinates in data are map units. Each map unit equals 10 li on either axis. Keep that relationship for future content.
- `JD.CONTINENT` defines 54 settlements across five geographic regions and 9 polities. It contains 66 designed links between settlements and the home sect. `EXPED.ensureWorldTopology` joins older sects, regions, trials and resources to that network. Settlement IDs are durable references for travel, births, seats, news and saves. Numbered road endpoints are indices into the gazetteer table, with 0 reserved for the home sect. Preserve the order or update all affected endpoints together.
- The final painting and route data were reconciled at the Sanjiang crossing, Bailang water gate, Haimen harbor, southern lighthouse, crocodile hunting village and sea corridors. Ferry routes include authored bends. The painting uses the same square as the live points, so resizing the viewport preserves registration.
- Travel cost uses the length of every segment and its terrain, with 123 li per calendar day as the unmodified plains reference. Road safety lengthens poorly maintained legs. Existing individual mounts and movement arts can modify duration. The graph can choose a different route when conditions change. A departed party keeps the route and timing it planned.
- The map detail card shows coordinates, route distance, estimated outbound time, and any known travel or exploration distinctions. Local realm portals use their existing timing. Fortune locations show trailheads where a party enters an exploration area. Their reward is still determined by the expedition.

## Playable systems

- The main atlas uses a continuous painting. Zoom is 1×–10×. At 2.8× the browser draws visible terrain tiles using six additional painted surfaces. Named terrain appears by proximity scale and settlement plans appear at 5.5×. Icon size uses screen pixels. Filters show all, sects, settlements, fortune sites, special sites, figures, resources, or regions.
- Open **ยุทธภพ → อาณาจักร** for the nine polities. The detail window shows the capital, ruler, stability, current policy, officeholders and vacancies, cities, diplomatic attitudes and recent court news. City panels and NPC birthplace chips link to the relevant window. Town names, capitals and recorded events link to the coordinates on the atlas.
- The new civil layer has 67 offices. External figures and court reserves have separate identities from the sect population. Each office has a permanent station and one holder reference. Officials retire over time, willing applicants enter vacancies, and rulers choose policies with weighted preferences and a minimum policy interval. Officials contribute to city safety and prosperity. Border diplomacy changes some initial international relationships over time.
- Public hometown and birth polity live in `npc.ext.world`. Like-minded NPCs may warm up more quickly if they recognize a shared home. Rival origins can cause guardedness if the person cares about home, but openness, friendship and accumulated trust can outweigh it. The effect applies during social choice and actual conversation.
- A visit to town is an optional entry in the normal NPC action chooser. The sect needs a reserve of food and people. The traveler considers nearby towns and their own hometown, and chooses among feasible trips using interests, risk and journey cost. Arrival credits the visit once, contributes to memories and social practice, and produces a location record. Generic expeditions consider distance when choosing a region. Their older encounter budget uses the previous activity estimate, so a longer path by itself does not create additional loot.
- Expeditions, trials, timed anomalies, military claims and supply convoys now carry route and timing data. Outpost cargo leaves the sect stock once and enters camp stock upon arrival. An active shipment blocks repeat orders to the same camp. Cargo returns if that camp closes. Quartermasters account for travel and upkeep when restocking. The atlas follows only live shipments.

## Runtime boundaries

The city and court layer is an exterior simulation of settlements, officials and diplomacy. Residents of the player sect continue to use the existing residential map. The full historical succession, claimant and war arcs remain proposals. Existing abstract diplomatic exchanges and market ledger transactions are separate from routed trips. Regular coastal ferries are part of the fixed geography. Shared passenger vessels are documented in the next patch proposal.

The source tree and rebuilt `GAME_SOURCE/JianghuSect_single.html` share the same data. Both terrain layers are embedded in the single file. `AGENTS.md`, `js/human_core.js`, script order and test load order match the base. The human core fingerprint is `155:2f9c9dd7`.

## Verification

- `node GAME_SOURCE/tools/validate_data_schema.js` validates settlement IDs, bounds, owner links, capitals, connectivity, office references and the scale, alongside the existing game data checks.
- `node GAME_SOURCE/test/world_atlas.js` covers all city endpoints, a sea route, estimate and execution parity, saved journeys, one-time city arrival and release, court assignments and directional origins.
- `node GAME_SOURCE/test/world_atlas_standalone.js` checks both embedded art resources.
- Chromium atlas checks cover narrow portrait, short landscape and desktop. They exercise filters, zoom layers, stable pin size, kingdom navigation, shortcuts to the atlas, and observer controls. Browser test URLs used a loopback HTTP server because the workstation blocks `file://`.
- `test/observer_autonomy_suite.js` recorded a city visit decision and another autonomous opportunity during a normal 30,000-step seeded game.
- Parallel regression via `GAME_SOURCE/tools/run_parallel_tests.js` completed 186 groups with **183 pass, 3 fail, 0 timeouts** and a syntax sweep of 264 files. The existing failures reproduced against `e4ce280`: `v500_celestial_visual_overhaul_suite` expects a contracted-spirit-beast render path; `carbon_compendia_master_suite` and `full_release_audit_and_behavior_suite` expect the earlier constitution hash. The current constitution matches the branch base byte for byte.
- The existing mobile/desktop performance suite passed at **1.83 ms/tick** with 80 NPCs. Observer controls passed a sweep of 504 rendered actions, including the new kingdom window. The schema validator reported zero errors and warnings. See `GAME_SOURCE/test/results/parallel_audit_latest.json`.
