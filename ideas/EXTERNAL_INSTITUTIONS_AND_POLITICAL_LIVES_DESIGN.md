# JS2 Design Proposal · Kingdoms, Dynasties, Sects, Clans, and Trade Halls

This is a design reference for a future patch. The objective is an external world in which a person can change institutions over a lifetime, and their later decisions can alter the institutions they once belonged to. The observer can trace those changes through people, places, agreements, and recorded consequences.

The owner's example is a displaced crown heir who finds refuge in the home sect, cultivates, builds an alliance, and eventually returns as emperor. It is one reachable outcome of general systems. Peaceful successions, failed claims, reconciliations, permanent exile, and quiet lives must also be possible.

## 1. Build on the existing simulation

The repository snapshot inspected for this proposal is `main-debug` at `04d11c8`. It contains the v3.5.0c runtime and the Continental, Living Lore, and External World Events work. The owner has a newer v3.6.0 game in the Gemini conversation. Inspect the actual implementation target before changing schemas, registries, planners, or thresholds. Read the project's constitution and relevant skills.

- Reuse the atlas, settlement and polity IDs, offices, court policies, existing external people, sect diplomacy, real routes, journey progress, and current inventories and ledgers where available. The inspected Continental baseline records nine polities, 54 settlement nodes, and 67 offices. Compute current counts from the actual registries. [Living Continent report](../PATCH_REPORTS/LIVING_CONTINENT_JS2_V3_0_0.md)
- Use Living Lore's distinction between evidence, belief, and news visibility. Search the latest implementation for `EXPED.LIVING_LORE`, the cognition module's lore state, event producers, and chronicle snapshots. Sources in two cities may know different facts about the same claimant.
- Read the project's prior Court Roster, Imperial Court, World Cities, and lineage proposals to identify overlaps. The `IMPERIAL_COURT_01A–01D`, `COURT_ROSTER_01A–01D`, and `WORLD_CITIES_01A–01D` PDFs in `ideas/from carbon/` are proposal material. Verify what actually runs in the target version.
- Keep the current observer role and Edit Hub permissions. NPCs make and carry out political, military, economic, career, and affiliation choices. Expose actual outcomes in the UI. Preserve the fixed atlas scale and real travel and messaging time. [Project constitution](../AGENTS.md) · [Master lore](Lore.md)

## 2. Give each institution a distinct source of power

| Entity | Durable state | Decisions it can support |
| --- | --- | --- |
| **Polity** | Territory and settlements, legal authority, treasury, reserves, stability, treaties, border and trade policies | Change duties, open emergency stores, issue exemptions, negotiate access, mobilize district resources |
| **Court** | Offices and real officeholders, appointment authority, jurisdiction, pending petitions, command assignments and political blocs | Appoint or remove officials, approve budgets, recruit help, act on reports, recognize a succession or negotiate a settlement |
| **Royal dynasty** | Family, recognized kinship, marriages or adoptions, succession custom, known and disputed beneficiaries, household assets | Designate or withdraw an heir, seek a regency, reconcile with exiles, divide property, sponsor a claim |
| **Cultivator clan** | Main and branch households, elders, leadership rules, lineage holdings, workshops, techniques and inheritance rights | Admit relatives or protégés, elect a head, lend assets, open access to a lineage art, form alliances or split a branch |
| **External sect** | Leadership, distinctive doctrine, disciples and specialists, training and material capacity, territory or headquarters, commitments | Offer refuge, recruit, teach, lend expertise, accept contracts, back or refuse a claimant, cooperate with a rival |
| **Trade hall** | Owners, officers, branches, liquidity, stock, shipping arrangements, outstanding obligations and reputation | Offer credit, consign goods, hire escorts, underwrite a voyage, negotiate rights, stop lending, reorganize after losses |

Keep family, office, sect membership, employer, civic allegiance, and current location as separate facts. One person can simultaneously be a royal relative, a sect disciple, a merchant's guarantor, and a former official. Resolve relevant conflicts of interest through that person's judgment and their commitments. Keep spendable accounts and asset ownership explicit. A sovereign, royal household, and polity can have different treasuries and authorizations.

Court rules can differ by polity. Examples include preference by birth order, nomination with court recognition, or a council's confirmation of a designated heir. Cultivator clans may use primogeniture, elder election, or selection by documented service. Doctrine and custom create different choices for similar people. Blood relations can provide access or credibility, while proficiency still follows actual training and capability.

### Clan affiliation and shared-clan recognition

Clan affiliation is optional for all named NPCs. Store an affiliation by stable clan ID, with branch and membership status when relevant. Keep origin, current membership, former membership, kinship, and public visibility distinct. A cultivator can join a clan later, leave it, or remain unaffiliated throughout life. A common surname alone gives no affiliation. The same person keeps these records when moving between external simulation and the home sect.

Reuse the existing shared-hometown or shared-polity relationship pattern as a starting point. When two NPCs interact and both recognize their shared clan, consider a small, bounded increase in initial familiarity or in the effect of positive interactions. Weigh it by each person's attachment to the clan, their relationship to their branch, and prior experience. Two strangers from allied branches may warm up faster. Estranged relatives or rival branches may respond weakly or retain a grudge. Kinship, shared clan, and shared polity can all matter, with a joint cap on overlapping familiarity modifiers so the same background does not dominate earned trust. Apply the effect during eligible interactions, using the identities and affiliations already involved in the decision. An unknown or unrecognized clan link cannot influence the choice. A concealed exile can stay undercover until a believable disclosure or discovery changes what the NPC knows.

## 3. Simulate external people at appropriate fidelity

| Fidelity | What it stores | What it evaluates |
| --- | --- | --- |
| **Aggregate population** | Households or population totals, occupations, reserves, public sentiment, and migration pressure by settlement or institution | Demography and production on scheduled intervals. Instantiate a person only when individual identity matters, reserving them from the appropriate aggregate where applicable. |
| **Named external NPC** | Stable person ID, age, kinship, affiliations, role or trade, location, personal resources where relevant, significant relationships and memories, known evidence, motives, and a compact aptitude/personality profile | Role-specific choices when scheduled or prompted by an event the person knows about. A shopkeeper and a commander can share basic traits while exposing different relevant capabilities. |
| **Home sect member** | Same person ID and continuity record, with the current full Human Core and normal sect NPC state | Ordinary full-fidelity sect life, cultivation, health, labor, social activity, travel, and decisions at the current simulation cadence. |

A lean profile might retain ambition, caution, loyalty, generosity, grudge, attachment to home, and distinct capacities such as command, negotiating, commerce, or a craft. Choose fields based on real decisions and map each shared trait to the current Human Core semantics. A person's allegiance can change after observable treatment. Store personal memories of consequential events independently of a faction's general attitude.

### Identity continuity and simulation transitions

- Maintain one canonical person identity and active simulation owner. Court posts, family trees, trade contracts, expedition groups, and membership records reference the same person. Display and chronicle snapshots can preserve historical facts while the live person changes roles.
- When an external person accepts and actually joins the home sect, materialize the full Human Core through existing APIs. Use stored values for known traits and a stable per-person seed for missing details. Preserve age, ties, kinship, claim, current possessions, learned facts, relevant skills, injuries, and cultivation through validated adapters. Holders of illegal, hidden, or disputed claims carry that status into the sect with the same visibility. Keep the protected Human Core source intact.
- On departure, retain the full record in a bounded archive or preserve the values needed for faithful re-entry. Switch routine updates to external cadence and keep current legal, family, physical, and economic state authoritative. Rejoining after time outside must account for age, injuries, debts, training, or roles that changed while away. Preserve established traits when details conflict with initial generation.
- Membership, travel, office changes, death, and return can occur close together. Resolve each transition through one authoritative commit with a stable receipt or equivalent idempotency guard. Update references and population counts according to the destination. Keep only one current location and one active simulation instance of the person. Preserve relevant historical snapshots when they die, disappear, or leave.

## 4. Make political change emerge from independent choices

Model **claim eligibility**, **personal willingness**, **recognized legitimacy**, and **capacity to act** separately. A nominated heir may depart permanently, a popular commander may support a younger candidate, and a wealthy clan may keep its troops home. Personal combat or cultivation strength matters where relevant, such as surviving an escape or gaining martial credibility. Influence also depends on allies, lawful or customary authority, office, supplies, access, public trust, and credible information.

### Succession and disputes

1. **Evaluate when triggered.** Death, incapacity, abdication, designation, major scandal, loss of local authority, or a credible political offer can trigger review. Normal scheduled decisions can also expose a viable opportunity. A crisis raises pressure, while capable governance and clear rules can settle the transition peacefully.
2. **Gather eligible people and their knowledge.** Apply local laws and customs to kinship, office, recognition, prior renunciations, and evidence. Keep an heir in hiding separate from the court's public information. Avoid pulling a character into a plot before a credible information path reaches them.
3. **Generate feasible choices for each actor.** An heir can accept, wait, renounce, seek asylum, bargain, back someone else, or pursue a claim. Officials, commanders, clans, sect leaders, and trade hall officers can recognize the incumbent, endorse a contender, mediate, offer concrete help, abstain, or withdraw. Each actor weighs what they know, personal motives, risk, loyalty, family safety, and costs. Use seeded variation among credible choices to represent judgment under uncertainty.
4. **Resolve actions in the world.** A letter has a sender and destination. A merchant's promise matters when supplies are funded and shipped. Armed help requires mustering and movement. Entry to a city requires authority, an opened gate, persuasion, or whatever the relevant system permits. Use existing diplomacy, logistics, conflict, and combat resolution.
5. **Commit and propagate results.** Appointment and accession update the relevant throne or office once. Losing factions may reconcile, seek exile, retain certain offices, or remain opponents. Apply documented obligations, changes in eligibility, public reaction, local economic impact, and delayed relationship consequences. A ruler can appreciate a former teacher privately while limiting their sect's public involvement.

Start by representing each active dispute with stable references to the contested office, credible contenders, actual commitments, known supporters, opened opportunities, and a finite review schedule. Preference scores recommend actions. Facts and commitments change only through resolved actions. Support should be private or public according to how it was communicated, and acts on behalf of an organization require the actor's real authority.

## 5. Connect the institutions through contracts and civic choices

A shared contract lifecycle can support relief, escort, supply, access, credit, and services without duplicating their economic rules. Suggested progression:

`OFFERED → ACCEPTED → IN_PROGRESS → DELIVERED → SETTLED`

Allow terminal or intervening states such as `DECLINED`, `EXPIRED`, `CANCELLED`, `PARTIAL`, `DEFAULTED`, and `DISPUTED`. A partial delivery can settle the fulfilled portion when the terms permit. Each record can identify issuer, counterparty, signing authority, goods/services, quantities and prices, deadlines, origin and destination, collateral or escrow where relevant, acceptance and delivery receipts, and visibility. Maintain inventories and cash in their current authoritative ledgers.

- **Court procurement.** A border garrison requests grain. A court official can release stock, solicit a trade hall, postpone purchase, reassign transport, or offer a lawful exemption. The treasury pays and inventories move through actual delivery.
- **Sect service agreements.** A medical sect offers treatment in exchange for escorts. The sect leader weighs a competing need at home. Partial fulfillment, voluntary renegotiation, and delayed retaliation depend on the agreement, witnesses, and personal relationships.
- **Trade hall credit.** A hall lends operating capital against recorded liquid assets, a letter of credit, or a named guarantor. Exposure, interest, defaults, and slow collection affect liquidity. A default can reduce future offers and force lenders to sell stock or suspend shipments. Treat credit as a recorded obligation and actual funds transfer, with principal and revenue tracked separately.
- **Market and border policy.** A polity can grant a concession, raise tolls, issue a restriction, or honor a treaty. Branches and merchants consider compliance, licensing, alternate legal routes, or local black markets when available. Prices reflect real changes in available stock, demand, and delivery. A region can prosper from diverted trade while another loses revenue.
- **Mediation.** Contract breach, asset disputes, and contested toll collection can open a negotiation. Existing evidence and reputation influence whom parties trust as mediator. A ruling changes legal or contractual state only where jurisdiction and enforcement support it.
- **Kinship and inheritance.** Marriages, apprenticeships, succession, or branch separation can create overlapping loyalties. Clan leadership and specific assets can pass under different rules. A family elder can claim custody of a manual while another inherits a workshop. Carry the actual ownership and eligibility changes into access, production, and relationships.

Resolve reserve, debit, departure, arrival, payment, refund, and enforcement changes in one owner per ledger. Apply partial or repeated notifications against the same transaction receipt. Use the existing routes for physical goods and people. Account for interception, delays, insolvency, closure of an institution, and lost authority during delivery. Any implemented favor, monopoly, or exemption needs an actual consumer and a visible effect at an appropriate level of detail.

## 6. Example trajectories to use as design probes

### Displaced heir and the home sect

A ruler dies, or a living ruler strips a claimant's authority. The claimant fears arrest and receives an offer of refuge based on a real relationship. They travel to the home sect and request admission. The sect weighs existing commitments and what it knows about the person. If admitted, the claimant becomes a full sect member and can cultivate, acquire mentors, and change their ambitions over years.

Later, a real opening becomes known through a trusted courier, a public succession dispute, or family contact. The former heir chooses between a quiet life, reconciliation, backing a relative, or seeking allies to return. A clan head may offer a route, an official may support the current ruler, and a trade hall may refuse an unfunded military contract. If the claimant gains a throne, a former teacher might receive a personal honor, the sect might gain travel privileges, or the new ruler may set a public distance to maintain court trust. If the claim fails, surrender, negotiated exile, imprisonment, flight, or death depend on actual actions and game rules. Earlier admission can still matter without a return to power.

### Additional outcomes with the same systems

- Two potential heirs acknowledge the designated successor. A former rival helps administer a poor district and later becomes the successor's most trusted official.
- A cultivator clan's junior branch loses control of the family workshop. Craftspeople who choose to follow the branch establish a competing supplier under a trade hall's credit. A powerful relative decides whether to reconcile, negotiate shared use, or try to block the rival business.
- A trade hall funds a border convoy secured by a sect. A change in checkpoints delays it. The resulting shortage shifts work to another sect and weakens the official who promised prompt delivery. A former disciple provides credible evidence that allows the parties to renegotiate instead of remaining enemies.
- A former student serves as a governor during a disaster. Their clan asks them to favor its settlements, while their former teacher asks for safe passage for healers. Decisions create effects in supply, reputation, and personal relationships that can persist after the emergency.

## 7. Scheduling, scale, and observer presentation

Drive work from due dates, meaningful events, and bounded periodic review. Index stakeholders by polity, court, family, location, organization, and active claim or contract. Signal only the actors eligible to know and act. Aggregate regional stock and demographics on the existing calendar. Named external choices can typically run on a staggered daily, weekly, or monthly schedule according to their urgency. Immediate actions use event callbacks or due work. A court decision can depend on delayed news without forcing all other courts to recalculate.

Avoid pairwise scans across the continental population. Evaluate only open opportunities and relevant relationships. Use bounded per-tick work, stable event ordering, explicit expiry, and retriable backlog processing. Do not drop overdue commitments at high simulation speed. Keep aggregate updates and semantic event execution deterministic under the game's seed and calendar. At 96×, clarify which timing is simulated and which presentation details can be coalesced. Measure idle, ordinary, and crisis loads on representative saves, including largest expected wars, rapid succession, simultaneous convoy failures, and extended generational runs.

Give the observer a person-to-institution path through existing surfaces. The character overview displays a **Clan** row beside the polity or hometown information when the person has a visible current clan affiliation. Show the clan name and branch where known, with a link to its observer profile if available. Omit the row for unaffiliated characters and when the affiliation is still hidden. Display visible former affiliations as biography entries. The card can also show known family links, offices, and significant life events. An institution screen can show leaders, public claims, current policy, known agreements, cargo outcomes, and relations. The atlas can follow actual convoys or journeys where the information is visible. The chronicle should link consequence to causes and distinguish a witness account from confirmed results. Keep private kinship, hidden locations, contacts, and secrets scoped to discovery. Viewing a report or panel has no simulation side effects.

## 8. Recommended implementation sequence

1. **Audit and reconcile.** Compare the actual target version's identity, claimant and court code, institution registries, clan or family support, economic transactions, secrets, travel, and simulation scheduling. Identify which existing definitions can be extended and where overlapping proposals would create redundant authority.
2. **Prove a vertical slice.** Use one border district, its court, a trade hall, and two sects or a sect and a clan. A shortage causes real offers, someone accepts one, goods move, and a late or completed delivery changes later choices. Connect it to the atlas and chronicle. Vary the decision makers and seed so refusal, rerouting, normal delivery, and renegotiation are all reachable.
3. **Prove the person lifecycle.** Add a small, meaningful roster and verify light → full → light, refuge, voluntary departure, and re-entry. Keep identity, links, evidence, assets, and learned traits continuous.
4. **Add succession and cross-institution commitments.** Implement routine succession and regency, then open claim, negotiation, military or political support, disputed accession, and outcomes. Build the heir-to-disciple-to-contender trajectory as a test of the shared systems. Add a parallel clan succession that shares ideas while respecting different rules.
5. **Widen the systemic repertoire.** Add differentiated institutions, branches, credit, concessions, civic bargaining, specialized sect services, and long-horizon consequences when each consumer can use them. Keep working play loops, save continuation, and performance visible at each step. Select and refine the scope based on the target game and actual implementation evidence.

### Evidence to gather when implementing

- A quiet seeded run with repeated legitimate succession and no required power struggle. Other seeds with rival claims, declined participation, regency, real fighting or negotiation, and accession or failure.
- The displaced heir example can succeed under plausible natural conditions. Show the information, routes, support, and decisions that make it possible, alongside variants that end peacefully, fail, or never advance. Distinguish natural seeded runs from focused fixtures.
- Stable person ID, trait values, relatives, commitments, ownership, and location across join, departure, death, or re-entry. Save and reload while traveling, negotiating, or awaiting delivery. Replayed notices should settle once.
- Show the clan row for a known active affiliation and hide it for unaffiliated and undiscovered members. Compare a friendly same-clan meeting with a known branch rivalry, a concealed affiliation, and a shared polity without shared clan. Verify that disclosure can affect subsequent choices and that multiple background matches respect the combined cap.
- Finance and resource conservation through joint commitments, transfers, debt repayment, shortage, partial delivery, seizure, and default. No money, stock, office holder, or tracked person should exist twice as a result of repeated notification or conflicting updates.
- Relevant home sect autonomy, existing diplomacy and travel, hidden lore, mobile UI, known-world reporting, and current-version save continuation. Benchmark aggregate and individual work at normal and accelerated speed. Publish actual results and tradeoffs in the implementing patch's report.
