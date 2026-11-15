# Removed player commands: source inventory

Baseline UI: commit 9410322. All listed commands are denied by current UI policy. Native references below are static navigation aids, including aliases/wrappers; their presence is not a reachability proof. See report 04 and observer_autonomy_suite for conditional execution evidence. An empty API column may be direct state assignment, debugging, or an editor dispatcher.

| Removed action | Original APIs | Current non-UI references (up to 2 per API) |
|---|---|---|
| `set-npc-forbidden-seal` |  |  |
| `demo-forbidden-taboo` |  |  |
| `set-npc-passive-constellation` |  |  |
| `set-sect-forbidden-policy` |  |  |
| `perform-forbidden-altar-ritual` |  |  |
| `set-npc-support-posture` |  |  |
| `demo-support-art-aura` |  |  |
| `trigger-sect-emergency-support` |  |  |
| `set-npc-defensive-posture` |  |  |
| `demo-defensive-aegis` |  |  |
| `set-npc-mantra-stance` |  |  |
| `demo-mantra-resonance` |  |  |
| `set-sect-formation-stance` | `SECT.FORMATION_WARFARE.setFormationStance` | `js/sect.js:6341` |
| `set-sect-weather-phenomenon` | `SECT.FORMATION_WARFARE.triggerWeatherPhenomenon` |  |
| `set-npc-qinggong-mode` | `CULT.QINGGONG.ensureState`, `CULT.QINGGONG.resolveNpcMode` | `js/ai.js:313`, `js/combat.js:892`, `js/ai.js:261`, `js/ai.js:295` |
| `demo-qinggong-flight` | `CULT.qiMax`, `CULT.QINGGONG.ensureState`, `CULT.QINGGONG.resolveNpcMode`, `AI.goTo` | `js/ai.js:859`, `js/ai.js:2388`, `js/ai.js:313`, `js/combat.js:892`, `js/ai.js:261`, `js/ai.js:295`, `js/ai.js:2212`, `js/combat.js:493` |
| `start-tribulation-ritual` | `CULT.TRIBULATION.start` | `js/ai.js:938`, `js/ai.js:2220` |
| `resolve-extradition` | `EXPED.resolveExtraditionUltimatum` | `js/expedition.js:7943` |
| `launch-vendetta-reclamation` | `EXPED.launchVendettaReclamation` | `js/sect.js:13076` |
| `bind-taoist-companions` | `SECT.bindTaoistCompanions` | `js/ai.js:1815`, `js/sect.js:8217` |
| `practice-dual-cultivation` | `SECT.practiceDualCultivation` |  |
| `spawn-companion-offspring` | `SECT.spawnCompanionOffspring` | `js/sect.js:8252`, `js/sect.js:8259` |
| `interact-wandering-figure` | `EXPED.interactWanderingFigure` | `js/expedition.js:7629`, `js/expedition.js:7788` |
| `recruit-wandering-figure` | `EXPED.recruitWanderingFigure` | `js/sect.js:17791` |
| `exchange-craft-elder` | `EXPED.exchangeWithCraftElder` | `js/sect.js:17795` |
| `attune-building-leyline` | `SECT.FENG_SHUI.attuneBuilding` | `js/sect.js:6323`, `js/sect.js:8710` |
| `activate-grand-array` | `SECT.FENG_SHUI.activateGrandGuardianArray` | `js/sect.js:8714` |
| `counsel-heart-demon` | `SECT.HEART_DEMON.counselHeartDemon` | `js/ai.js:2003`, `js/cognition.js:2519` |
| `devour-heart-demon` | `SECT.HEART_DEMON.devourHeartDemon` | `js/sect.js:9004` |
| `awaken-weapon-spirit` | `SECT.SOUL_FORGE.awakenWeaponSpirit` | `js/cognition.js:2508`, `js/sect.js:9133` |
| `annotate-heritage-sutra` | `SECT.SOUL_FORGE.annotateHeritageSutra` | `js/cognition.js:2515`, `js/sect.js:9687` |
| `dispatch-trade-caravan` | `SECT.CARAVAN_AUCTION.dispatchTradeCaravan` | `js/sect.js:9740`, `js/sect.js:15191` |
| `bid-auction-lot` | `SECT.CARAVAN_AUCTION.bidOnAuctionLot` | `js/sect.js:9747` |
| `convene-elder-council` | `SECT.ELDER_COUNCIL_EDICTS.conveneElderCouncil` | `js/sect.js:10319` |
| `execute-standing-edicts` | `SECT.ELDER_COUNCIL_EDICTS.executeStandingEdicts` | `js/sect.js:10018`, `js/sect.js:10314` |
| `audit-officer-conduct` | `SECT.ELDER_COUNCIL_EDICTS.auditOfficerConduct` | `js/sect.js:6494`, `js/sect.js:10029` |
| `run-secret-realm-nodes` | `SECT.SECRET_REALM_NODES.runFullNodeExpedition` | `js/sect.js:10652` |
| `restore-ancient-scroll` | `SECT.SECRET_REALM_NODES.restoreAncientScroll` | `js/sect.js:10025`, `js/sect.js:10655` |
| `convene-grand-assembly` | `SECT.GRAND_ASSEMBLY_BANQUET.conveneGrandAssembly` | `js/sect.js:10941` |
| `host-spirit-banquet` | `SECT.GRAND_ASSEMBLY_BANQUET.hostSpiritCuisineBanquet` | `js/sect.js:10945` |
| `director-pulse` | `SECT.HEAVENLY_DAO_DIRECTOR.evaluateDirectorPulse` | `js/sect.js:11375` |
| `shift-cultivation-era` | `SECT.HEAVENLY_DAO_DIRECTOR.shiftCultivationEra` | `js/sect.js:11373` |
| `found-specific-peak` | `SECT.PEAKS.foundPeak` | `js/sect.js:12597`, `js/sect.js:12662` |
| `appoint-peak-leader` | `SECT.PEAKS.appointPeakLeader` | `js/sect.js:17815` |
| `remove-peak-leader` | `SECT.PEAKS.removePeakLeader` |  |
| `assign-disciple-peak` | `SECT.PEAKS.transferDiscipleToPeak` | `js/sect.js:12823`, `js/sect.js:12848` |
| `remove-from-peak` | `SECT.PEAKS.removeDiscipleFromPeak` | `js/sect.js:17843` |
| `auto-assign-peak-disciples` | `SECT.PEAKS.autoAssignUnassignedDisciples` | `js/sect.js:14145` |
| `set-peak-policy` | `SECT.PEAKS.setPeakPolicy` | `js/sect.js:17841` |
| `distribute-single-peak` | `SECT.PEAKS.ensure`, `SECT.PEAKS.allocateCentralResourcesToPeaks`, `SECT.PEAKS.distributePeakResourcesToMembers` | `js/cognition.js:159`, `js/cognition.js:206`, `js/sect.js:12897`, `js/sect.js:12328` |
| `peak-joint-exchange` | `SECT.PEAKS.holdJointPeakExchange` | `js/sect.js:12908` |
| `unlock-all-offices` | `SECT.unlockAllOffices` |  |
| `auto-appoint-office` | `SECT.resolveOfficeId`, `SECT.appointScore`, `SECT.appoint` | `js/sect.js:574`, `js/sect.js:786`, `js/sect.js:1067`, `js/sect.js:1293`, `js/sect.js:1103`, `js/sect.js:1297` |
| `dismiss-office` | `SECT.resolveOfficeId`, `SECT.holder`, `SECT.dismiss` | `js/sect.js:574`, `js/sect.js:786`, `js/ai.js:1004`, `js/ai.js:1025`, `js/sect.js:2300`, `js/sect.js:6769` |
| `run-single-office` | `SECT.resolveOfficeId`, `SECT.runOfficerJurisdictionSingle` | `js/sect.js:574`, `js/sect.js:786`, `js/cognition.js:2565`, `js/sect.js:6586` |
| `pay-office-stipends` | `SECT.payOfficeStipends` | `js/sect.js:17806` |
| `toggle-peak-array` | `SECT.PEAKS.togglePeakArray` |  |
| `upgrade-peak-array` | `SECT.PEAKS.upgradePeakArray` | `js/sect.js:12901` |
| `open-meridian` | `CULT.MERIDIANS.openMeridian` | `js/cultivation.js:8624` |
| `trigger-meridian-overdrive` | `CULT.MERIDIANS.triggerOverdrive` | `js/combat.js:3591` |
| `bind-dao-oath` | `CULT.bindOathVow` | `js/sect.js:17673` |
| `grant-dao-seal` | `CULT.grantDaoSeal` | `js/sect.js:17703`, `js/sect.js:17704` |
| `socket-elemental-runes` | `ECO.socketElementalRunes`, `g.STATS.dirty` | `js/ai.js:1228`, `js/combat.js:1277`, `js/combat.js:1296` |
| `ingest-beast-core` | `CULT.BEAST_SYMBIOSIS.ingestBeastCore` | `js/sect.js:17682` |
| `activate-beast-possession` | `CULT.BEAST_SYMBIOSIS.activatePossession` | `js/combat.js:225` |
| `erect-totem-pillar` | `SECT.TOTEMS_BLOODLINES.erectTotemPillar` | `js/sect.js:17695` |
| `enter-closed-door-seclusion` | `CULT.enterClosedDoorSeclusion` | `js/sect.js:14184` |
| `resolve-defector-ultimatum` | `SECT.resolveDefectorUltimatum` | `js/sect.js:1329` |
| `peak-launch-expedition` | `SECT.PEAKS.launchPeakExpedition` | `js/sect.js:13977` |
| `tribunal-adjudicate` | `SECT.TRIBUNAL.adjudicateCase` | `js/sect.js:6490` |
| `assign-leyline-guard` | `SECT.LEYLINE_GRID.assignAnchorGuard` | `js/sect.js:17825` |
| `repair-leyline-anchor` | `SECT.LEYLINE_GRID.repairAnchor` | `js/sect.js:14154` |
| `awaken-weapon-soul` | `SECT.SOUL_FORGE.awakenWeaponSpirit` | `js/cognition.js:2508`, `js/sect.js:9133` |
| `toggle-automation-rule` | `SECT.AUTOMATION.toggleRule` | `js/sect.js:17829` |
| `recharge-elemental-barrier` | `SECT.ELEMENTAL_BARRIER.rechargeBarrier` | `js/sect.js:6349` |
| `invoke-founder-phantom` | `SECT.ANCESTRAL_PAVILION.invokeFounderPhantom` | `js/combat.js:7141` |
| `resolve-faction-schism` | `SECT.resolveFactionSchism` | `js/sect.js:17799` |
| `dispatch-exchange-disciple` | `SECT.dispatchExchangeDisciple` | `js/sect.js:17747` |
| `claim-bounty-hunt` | `SECT.BOUNTY_BOARD.claimBountyHunt` | `js/sect.js:17728` |
| `bid-black-market` | `SECT.CARAVAN_AUCTION.bidOnAuctionItem` | `js/sect.js:17835` |
| `brew-multiphase-pill` | `ECO.brewMultiPhaseSpecialtyPill` |  |
| `excavate-immortal-tomb` | `SECT.IMMORTAL_TOMB.excavateTombLayer` | `js/sect.js:15436`, `js/sect.js:17760` |
| `advance-world-crisis` | `SECT.WORLD_CRISIS.advanceCrisisChapter` | `js/sect.js:15534`, `js/sect.js:17771` |
| `establish-outpost` | `SECT.OUTPOSTS_LOGISTICS.establishOutpost` | `js/sect.js:6399`, `js/sect.js:15987` |
| `dispatch-supply-convoy` | `SECT.OUTPOSTS_LOGISTICS.dispatchSupplyConvoy` | `js/sect.js:6402` |
| `enact-sect-charter` | `SECT.CHARTER_DOCTRINE.enactSectCharter` | `js/sect.js:1345` |
| `convene-strategic-council` | `SECT.STRATEGIC_COUNCIL.conveneCouncil` | `js/sect.js:1350`, `js/sect.js:16463` |
| `resolve-council-agenda` | `SECT.STRATEGIC_COUNCIL.resolveCouncilAgenda` | `js/sect.js:1351` |
| `explore-micro-location` | `EXPLORE.dispatchExploration` | `js/sect.js:17721` |
| `cleanse-marrow-pool` | `SECT.TOTEMS_BLOODLINES.cleanseMarrowPool` | `js/sect.js:17688` |
| `scan-and-found-peaks` | `SECT.PEAKS.scanAndFoundEligiblePeaks` | `js/sect.js:12468`, `js/sect.js:12829` |
| `allocate-peak-resources` | `SECT.PEAKS.allocateCentralResourcesToPeaks` | `js/sect.js:12897` |
| `hold-inter-peak-tournament` | `SECT.PEAKS.holdInterPeakTournament` | `js/sect.js:12911` |
| `evaluate-elder-ascensions` | `SECT.reviewPromotions`, `SECT.ELDER_STATUS.evaluateElderAscensions` | `js/sect.js:1313`, `js/sect.js:1506`, `js/sect.js:11944` |
| `exchange-jade-seal` | `SECT.HEAVENLY_DAO_DIRECTOR.exportJadeSealCode`, `SECT.HEAVENLY_DAO_DIRECTOR.importJadeSealCode` |  |
| `launch-coalition-offensive` | `EXPED.launchCoalitionOffensive` | `js/sect.js:13074`, `js/sect.js:17784` |
| `trigger-siege-beacon` | `EXPED.triggerSiegeReinforcementBeacon` | `js/expedition.js:8514`, `js/sect.js:13075` |
| `offer-infernal-tribute` | `SECT.INFERNAL_SHRINE.offerInfernalTribute` | `js/cultivation.js:10587` |
| `sign-blood-covenant` | `SECT.INFERNAL_SHRINE.signBloodCovenant` | `js/cultivation.js:10575`, `js/sect.js:17765` |
| `swear-voluntary-vow` | `CULT.VOLUNTARY_VOWS.swearVow` | `js/ai.js:1584`, `js/ai.js:1586` |
| `toggle-combat-row` |  |  |
| `begin-tribulation` | `SECT.beginCelestialTribulation` | `js/sect.js:5080` |
| `elect-successor` | `SECT.electSuccessor` | `js/sect.js:7135` |
| `edit-pet-feed` | `SECT.EDITOR.applyPetAction` |  |
| `edit-pet-breed` | `SECT.EDITOR.petState`, `SECT.EDITOR.applyPetAction` |  |
| `edit-dip-exchange` | `SECT.EDITOR.applyDiplomacyAction` |  |
| `edit-dip-envoy` | `SECT.EDITOR.applyDiplomacyAction` |  |
| `edit-dip-spawnevent` | `SECT.EDITOR.applyDiplomacyAction` |  |
| `edit-dip-resolveevent` | `SECT.EDITOR.applyDiplomacyAction` |  |
| `edit-sanctum-run` | `SECT.EDITOR.applySanctumAction` |  |
| `edit-sanctum-refine` | `SECT.EDITOR.applySanctumAction` |  |
| `repair-gear` | `ECO.repairGear` | `js/sim.js:808` |
| `retire-gear` | `ECO.retireGear` | `js/cpeco.js:234`, `js/sect.js:4203` |
| `donate-personal` | `SECT.EDITOR.donatePersonalGear`, `SECT.donateMat`, `ECO.donatePersonalProduct`, `g.MARTIAL.donateCrystal`, `g.MARTIAL.donateManual`, `g.CONTENT.donateRecipe`, `g.CONTENT.donateOrgan` | `js/cpeco.js:340`, `js/fishing.js:1744`, `js/wild_resources.js:482`, `js/cpeco.js:1086`, `js/fishing.js:1679`, `js/knowledge.js:671`, `js/fishing.js:1682`, `js/fishing.js:1686`, `js/content.js:1237`, `js/content.js:1241`, `js/content.js:1216`, `js/cpeco.js:351` |
| `use-personal` | `SECT.EDITOR.usePersonalItem` |  |
| `stock-distribute-now` | `SECT.distributeSectStock` | `js/cpeco.js:1004`, `js/sim.js:937` |
| `shop-buy` | `g.CPE.buy`, `g.MARTIAL.startStudy` | `js/cpeco.js:575`, `js/cpeco.js:729` |
| `study-tech-lib` | `g.MARTIAL.startStudy`, `CULT.tech` | `js/cpeco.js:729`, `js/ai.js:885`, `js/ai.js:1031` |
| `study-sub-lib` | `g.MARTIAL.studySubpath`, `CULT.subList.find` | `js/knowledge.js:679`, `js/ai.js:1031`, `js/ai.js:1046` |
| `open-bag-container` | `g.FISHING.openContainer` | `js/fishing.js:1670` |
| `open-sect-container` | `g.FISHING.openContainer` | `js/fishing.js:1670` |
| `discard-bag-trash` | `g.FISHING.discardTrash` | `js/fishing.js:1663`, `js/fishing.js:1673` |
| `discard-sect-trash` | `g.FISHING.discardTrash` | `js/fishing.js:1663`, `js/fishing.js:1673` |
| `eat-bag-dish` | `g.FISHING.eatFishDish` | `js/fishing.js:1636`, `js/fishing.js:1642` |
| `cook-bag-fish` | `g.FISHING.cookDish` | `js/fishing.js:1604`, `js/fishing.js:1606` |
| `cook-sect-fish` | `g.FISHING.cookDish` | `js/fishing.js:1604`, `js/fishing.js:1606` |
| `fish-at-zone` | `AI.freeStation`, `AI.begin` | `js/ai.js:457`, `js/ai.js:491`, `js/ai.js:1935`, `js/ai.js:1936` |
| `refresh-rumors` | `SECT.JIANGHU.refreshTavernRumors` | `js/sect.js:5682`, `js/sect.js:5756` |
| `investigate-tavern-rumor` | `SECT.JIANGHU.investigateRumor` | `js/sect.js:5884` |
| `ally-aid` | `SECT.JIANGHU.triggerAllyAid` | `js/sect.js:17709` |
| `challenge-nemesis` | `SECT.JIANGHU.triggerNemesisChallenge` | `js/sect.js:17712` |
| `synthesize-sect-art` | `SECT.MENTORSHIP.synthesizeSectArt` | `js/sect.js:9270` |
| `form-mentor-bond` | `SECT.MENTORSHIP.formBond` | `js/sect.js:5386`, `js/sect.js:5649` |
| `coach-disciple` | `SECT.MENTORSHIP.coachDisciple` | `js/ai.js:2011` |
| `transmit-qi` | `SECT.MENTORSHIP.transmitQi`, `CULT.tech` | `js/ai.js:2051`, `js/sect.js:5110`, `js/ai.js:885`, `js/ai.js:1031` |
| `set-clue-approach` | `g.VC.ensure` | `js/cognition.js:159`, `js/cognition.js:206` |
| `atlas-depart` | `EXPED.marshalStrikeForce`, `EXPED.departResourceClaim`, `EXPED.departWorldAnomaly`, `EXPED.REGIONS.find`, `EXPED.depart` | `js/expedition.js:8463`, `js/sect.js:4365`, `js/sect.js:17738`, `js/expedition.js:1234`, `js/ai.js:1031`, `js/ai.js:1046`, `js/expedition.js:88`, `js/explore.js:7386` |
| `launch-sect-siege` | `EXPED.marshalStrikeForce` | `js/expedition.js:8463`, `js/sect.js:4365` |
| `set-vassal-policy` | `EXPED.setVassalTributePolicy` | `js/sect.js:4368`, `js/sect.js:6216` |
| `collect-vassal-tribute` | `EXPED.collectVassalTributes` | `js/expedition.js:3084`, `js/sect.js:4371` |
| `respond-vassal-distress` | `EXPED.respondVassalDistress` | `js/sect.js:4378`, `js/sect.js:6415` |
| `claim-resource-node` | `EXPED.departResourceClaim` | `js/sect.js:17738` |
| `assign-node-garrison` | `CULT.power`, `CULT.ensureMenagerie`, `EXPED.assignNodeGarrison` | `js/cognition.js:490`, `js/cognition.js:607`, `js/cultivation.js:7884`, `js/expedition.js:1047`, `js/expedition.js:3142`, `js/expedition.js:3144` |
| `harvest-resource-nodes` | `EXPED.harvestResourceNodes` | `js/expedition.js:3838` |
| `spawn-world-anomaly` | `EXPED.spawnWorldAnomaly` | `js/expedition.js:3863`, `js/sect.js:4384` |
| `dispatch-world-anomaly` | `EXPED.departWorldAnomaly` | `js/expedition.js:1234` |
| `declare-sect-alignment` | `SECT.declareSectAlignment` |  |
| `propose-clique-nomination` | `SECT.proposeCliqueNomination` | `js/sect.js:6707` |
| `resolve-nomination` | `SECT.resolvePoliticalNomination` | `js/sect.js:17803` |
| `appease-undercurrent` | `SECT.appeaseUndercurrent` | `js/sect.js:17805` |
| `run-officer-jurisdictions` | `SECT.runOfficerJurisdictions` | `js/sect.js:6988` |
| `intervene-jianghu-figure` | `EXPED.interveneJianghuFigure` | `js/sect.js:7167` |
| `trigger-alliance-council` | `EXPED.tickAllianceCouncil` | `js/expedition.js:3841` |
| `trigger-secret-realm` | `EXPED.spawnSecretRealm`, `EXPED.resolveSecretRealmRace` | `js/expedition.js:3851`, `js/expedition.js:6600`, `js/expedition.js:3847` |
| `hold-dao-lecture` | `SECT.holdGrandDaoLecture` | `js/sect.js:6985` |
| `handle-dungeon-prisoner` | `SECT.handleDungeonPrisoner` | `js/sect.js:6261`, `js/sect.js:7508` |
| `hold-martial-assembly` | `EXPED.holdGrandMartialAssembly` | `js/expedition.js:3843` |
