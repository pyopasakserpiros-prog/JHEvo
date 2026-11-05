# PATCH IMPLEMENTATION REPORT — v2.0.31 (4 Flagship Organic Systems)

## Implemented Flagship Systems
1. **ระบบปมในใจและวิกฤตการณ์ธาตุไฟเข้าแทรก (Obsession Knots & Heart Demon Crisis — `CULT.HEART_DEMON`)**
   - Located in `GAME_SOURCE/js/cultivation.js`: `formObsessionKnot`, `resolveObsessionKnot`, `triggerQiDeviationCrisis`, `stepDailyObsessions`.
2. **ระบบทูตสันถวไมตรี สายลับแฝงตัว และสงครามข่าวกรอง (Diplomacy Envoys, Sleeper Agents & Counter-Intelligence — `EXP.ESPIONAGE`)**
   - Located in `GAME_SOURCE/js/expedition.js`: `dispatchMission`, `resolveCompletedMission`, `runCounterIntelSweep`, `stepDailyEspionage`.
3. **ระบบวิวัฒนาการคัมภีร์และการบัญญัติวิชาประจำตระกูล/สำนัก (Manual Derivation & Lineage Codex Evolution — `SECT.CODEX_EVOLUTION`)**
   - Located in `GAME_SOURCE/js/sect.js`: `tryDeriveCodex`, `evaluateAndAttemptDerivation`, `applyCodexBonusToMember`, `stepYearlyCodex`.
4. **ระบบภัยพิบัติระดับทวีปและพันธมิตรกู้วิกฤตยุทธภพ (Continental Calamity & Jianghu Crisis Alliance — `EXP.CALAMITY`)**
   - Located in `GAME_SOURCE/js/expedition.js`: `spawnCalamity`, `contributeToCalamity`, `stepDailyCalamity`.
