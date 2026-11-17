# ทะเบียนคุณลักษณะชีวิตและรอยชำนาญ — 260c repair บน JS2-v2.6.0

ทะเบียนนี้แทนข้ออ้าง PASS แบบเหมารวมของ 260c เดิม: 88 แถวข้อเสนอ รวม E120 ที่รวมกับของเดิม จึงมี runtime ใหม่/เดิมรวม 87 ID: วาสนาที่ได้รับภายหลัง 27, ประสบการณ์ชีวิต 36, รอยชำนาญ 24 ไม่ได้เพิ่มแกนมนุษย์หรือให้วาสนากลุ่ม E สุ่มติดตอนเกิด

CSV ฉบับละเอียด: [LIFE_TRAITS_72_REVIEW_TRACKER.csv](../handovers/LIFE_TRAITS_72_REVIEW_TRACKER.csv) มีแหล่งเหตุการณ์จริง เกณฑ์ ผล ข้อยกเว้น และระดับหลักฐานแยกกัน การมี hook และตรวจ modifier ไม่ได้แปลว่าพบทุกเหตุการณ์หายากในการปล่อยเกมครั้งเดียว

## สัญญาร่วม

- ET.emit ใช้ sequence ต่อชนิดเหตุการณ์จาก W.t*3+timePhase; recordExperienceEvent รองรับ receipt ภายนอกที่ไม่ถูกขับออกเมื่อครบ512จน replay ได้ เรียกด้วยจำนวนบวกเท่านั้น
- ประสบการณ์ให้ p/f และอัตราบ่มเพาะครั้งเดียว; consF เฉพาะขณะมีภาระ การฟื้นตัวเป็น terminal transition เก็บภูมิปัญญาแต่ไม่แจกการลด stress ซ้ำ
- รอยชำนาญมีผลเฉพาะ activeMasteryIds สูงสุด3 ทั้งค่าสถานะและกลไกเดิม เก็บ unlockedTraits เป็นประวัติ ไม่ใช้ hasTrait แทน isActiveTrait ใน mechanical consumers
- รอยชำนาญใหม่ในศึกนับเฉพาะผลงานจริง ไม่ใช่ spar/เป้าอ่อนเกินสองขั้น; ต่อชนิดต่อคนสูงสุด30ต่อศึกและหนึ่งครั้งต่อ work-step สถานะ lifeEvidence/lifeDamage/lifeSupport อยู่บน fight โดยตรงเพื่อผ่าน save filter
- active/cache เปลี่ยนต้อง dirty; stat cache รวมบริบทเวลา/HP/คู่บำเพ็ญ ไม่ให้การเปิด UI เปลี่ยน RNG หรือ world

## วาสนาที่เกิดภายหลัง (E)

| ข้อ | ชื่อที่ใช้จริง | เหตุการณ์/เงื่อนไข | การประยุกต์ |
|---|---|---|---|
| E093 | ผู้กลืนกินอัคคีพิภพหลอมตันเถียน | ET.onCraftOutcome: สำเร็จงานโอสถต่อเนื่อง 12 ครั้ง; FIRE>=70; equivalentStage>=3 | ปรับจากกลืนเพลิงที่ไม่มีเหตุการณ์จริง เป็นประสบการณ์งานปรุงไฟสำเร็จ |
| E094 | ผู้หลอมศาสตราแร่อุกกาบาตดารา | ET.onCraftOutcome: สำเร็จสูตร FORGING ที่จ่ายวัตถุดิบ STAR/METEOR | ฝีมือหลอมแร่ดาวตก ไม่ผ่าตัดฝังแร่ในกระดูก |
| E095 | ผู้กลืนมุกปลามังกรพันปี | FISHING.eatFishDish: บริโภคอาหารปลา tier>=5 สำเร็จ | ได้รับจากการกินอาหารจริง ไม่ใช่เพียงตกได้ |
| E096 | ผู้ตรัสรู้คมกระบี่หน้าน้ำตกหมื่นจั้ง | AI.insight: เกิด insight สำเร็จ ขณะฝน/storm อยู่ริมน้ำจริง และ SWORD affinity>=60 | ยึดตำแหน่งจริง ไม่เชื่อชื่อกิจกรรมที่ค้างอยู่ |
| E097 | กายารอดตายจากพิษกู่สะสม | ET.evaluateDaily: สังเกต toxic>=80 แล้วหายจากพิษทั้งหมด | ต้องมีตอนป่วยและตอนหาย |
| E098 | ปราณดาบฝ่าวิกฤตเส้นเอ็นสะบั้น | AI.injure: แผลแขน/ไหล่จริง sev>=3 และ BLADE affinity>=50 | แผลเส้นเอ็น ไม่ตีความ HP ต่ำว่าแขนขาด |
| E099 | ภาวนาด้วยใจไร้เสียง | STATS.addStatus + ET.onActivityComplete: ผ่าน silence จริง แล้วทำ cultivate/pray สำเร็จ | ภาวนาในใจ ไม่อ้างเส้นเสียงขาดถาวร |
| E100 | จิตเหล็กกล้าผู้รอดจากศึกปิดล้อม | COMBAT.recordLifeConclude: ชนะ raid จริงพร้อมผลงานที่ไม่ใช่เป้าหมายอ่อนเกินสองขั้น | ยืนหยัดผ่านศึกล้อม ไม่สร้างคุกต่างสำนักปลอม |
| E101 | ผู้สืบเคล็ดวิชาลับจากผาสำนึกตน | EXPLORE.visit: stele/ruin 8 เหตุการณ์คนละ work-step | ศึกษาศิลาจารึกที่มีในเกม |
| E102 | ร่องรอยปราณเย็นจากการต่อสู้ | STATS.addStatus: รับ chill จริง duration>=10 | ร่องรอยปราณเย็น ไม่อ้างว่าบาดเจ็บสาหัสทุกครั้ง |
| E103 | กายาหยกน้ำแข็งบริสุทธิ์หลังผ่านพิษเย็น | ET.onBreakthrough: ทะลวงขั้นสำเร็จหลังมี E102 | เปลี่ยนแทน E102 ไม่ซ้อนสองร่าง |
| E104 | ผู้ก้าวข้ามธรณีประตูนรกแล้วเดินกลับ | COMBAT.recordLifeConclude + ET.onActivityComplete: รอด HP<=5% ในศึกจริง แล้วรักษาจน>=95% ครบสองตอน | ไม่รับจากค่า HP ต่ำลอยๆ |
| E105 | ผู้รู้แจ้งจากศิลาจารึกโบราณ | EXPLORE.visit: stele/ruin 12 เหตุการณ์ และ SCRIPTURE>=65 | รู้แจ้งศิลาจารึก ไม่อ้างครูในแหวนที่ไม่มี producer |
| E106 | ดวงจิตชนะมารท้าชิงวิญญาณ | ET.evaluateDaily: heartDemon>=75 แล้วฟื้นลง<=25 | ชนะจิตมาร ไม่เพิ่มระบบยึดร่างที่ไม่มีจริง |
| E107 | รอยคำสาปสุสานโบราณที่รอการชำระ | EXPLORE.visit + ET.evaluateDaily: เยือน ruin แล้วติด curse จริง; ชำระได้เมื่อใช้ชีวิตปลอดภัยเจ็ดวัน | ไม่สุ่มคำสาปโดยไม่มี status |
| E108 | ผู้ได้ร่วมสำรับปราณสำนัก | SECT.GRAND_ASSEMBLY_BANQUET.hostSpiritCuisineBanquet: ผู้เข้าร่วมใน attendeeIds ของงานที่จ่ายต้นทุนสำเร็จ | สำรับปราณ ไม่อ้างเหล้าท้อ |
| E109 | เนตรตื่นรู้ความจริงใต้ม่านกั้นภพ | ET.onBreakthrough: ทะลวงสำเร็จจน equivalentStage>=7 | ประสบการณ์ขั้นสูง ไม่เพิ่มการมองทะลุ UI |
| E110 | ผู้ฟื้นเส้นลมปราณหลังพลังสะท้อน | ET.evaluateDaily: เคยบาดเจ็บ MERIDIAN_OVERDRIVE_BACKLASH แล้วหายและ HP>=95% | ฟื้นเส้นลมปราณ ไม่อ้างเปลี่ยนตันเถียนใหม่ |
| E111 | ผู้ยืนหยัดหลังพ่ายคู่ต่อสู้เหนือชั้น | COMBAT.recordLifeConclude: แพ้คู่ต่อสู้เหนือขั้นในศึกจริง มีผลงาน และยังรอดโดยไม่ fled | ไม่อ้างถูกกระบี่เจ็ดแผลถ้าไม่มีหลักฐาน |
| E112 | รัศมีเมตตาธรรมคุ้มครองสรรพสัตว์ | ET.onHealed: รักษาผู้อื่นจริง HPเดิม<90% 20 patient-days และ empathy>=65 | ไม่เก็บ overheal หรือฮีลตนเอง |
| E113 | ไอสังหารเยียบเย็นสะท้านสมรภูมิ | COMBAT.slay: สังหารจริงสะสม>=20 และ aggression>=65 | วาสนาสายสังหารจากผลงานจริง |
| E114 | ผู้รู้แจ้งจากวิสัชนาธรรม | SECT.GRAND_DAO_DEBATE.holdDebate: ชนะวิสัชนาธรรมที่จ่ายต้นทุนสองครั้ง และ SCRIPTURE>=60 | แทน chess/STRATEGY ที่ไม่มีกิจกรรมหรือ skill ดังกล่าว |
| E115 | โลหิตประสานใจเป็นหนึ่งเดียวกับอสูรคู่ชีพ | COMBAT.recordLifeConclude: ชนะศึกจริงร่วมกับสัตว์คู่ชีพที่ active และ bond>=80 | สายสัมพันธ์จริง ไม่เสกสัญญาเลือดใหม่ |
| E116 | บุญคุณข้าวต้มหนึ่งชามจำฝังใจ | ET.evaluateDaily: อดอาหารสองวันแล้วฟื้นด้วยกิจกรรม eat ของสำนัก | ผู้ได้รับการช่วยเหลือ ไม่อ้างเป็นผู้แจกข้าว |
| E117 | ดวงใจแปดเปื้อนกิเลสหินวิญญาณ | EPITHETS.recordDeed: บันทึก embezzle_exposed ที่ผ่าน guard จริง; ล้างเมื่อ redemption สำเร็จ | ผลเสียจากทุจริตที่ถูกเปิดเผย |
| E118 | หน้าดำคราบเขม่าแต่รู้ใจไฟทุกเตา | ET.onCraftOutcome: เคยล้มเหลวงานผลิต>=3 แล้วสำเร็จโดย skillงานนั้น>=65 | ประสบการณ์งานเสียและงานสำเร็จ ไม่เรียกทุก failure ว่าระเบิด |
| E119 | ผู้ชินเส้นทางแดนเร้นลับ | EXPLORE.dispatchExploration: สำรวจ micro-location จริงสามแห่งต่างกัน | คุ้นเส้นทางแดนเร้นลับ ไม่อ้างแรงโน้มถ่วงที่ไม่มีการคำนวณ |
| E120 | ชีพจรจำศีลปิดด่านลึก | merged into EXP_TRAIT_TRIBULATION_SURVIVOR: ไม่เพิ่ม runtime trait ซ้ำ | รวมข้อเสนอจำศีลกับคุณลักษณะเดิม; ไม่เพิ่มระบบจำศีลใหม่ |

## ประสบการณ์ชีวิต (36)

| ID / ชื่อ | เหตุการณ์และจำนวน | producer | ผลจริง |
|---|---|---|---|
| EXP_TRAIT_COMPANION_GUARDIAN / ผู้คุ้มภัยคู่บำเพ็ญ (Companion Guardian) | PROTECTED_SECLUSION_OR_ALLY ×2 | COMBAT: actual intercept/bodyblock | ป้องกัน +14%, ป้องกันวิชา +10%, อัตราบ่มเพาะ +6%, โอกาสรับการโจมตีแทนสหาย +15%; ภาระ: หลบหลีก -3, รับความเสียหายแทนเพิ่ม 10% ระหว่างมีภาระ |
| EXP_TRAIT_TRIBULATION_SURVIVOR / ผู้รอดชีวิตจากทัณฑ์สวรรค์ (Tribulation-Scarred Survivor) | TRIBULATION_SURVIVED_OR_SCARRED ×1 | AI breakthrough outcome / tribulation scar | ป้องกันวิชา +15%, พลังชีวิต +8%, เจาะเกราะ +10, อัตราบ่มเพาะ +8%; ภาระ: ความเร็วเคลื่อนที่ -3 |
| EXP_TRAIT_SKEPTICAL_ARCHIVIST / นักคัดลอกคัมภีร์ผู้กังขา (Skeptical Archivist) | MANUAL_STUDY_AND_ARCHIVE ×3 | AI.A.study.done | โจมตีวิชา +10%, ป้องกันวิชา +10%, แม่นยำ +14, อัตราบ่มเพาะ +12%; ภาระ: ความเร็วเคลื่อนที่ -5 |
| EXP_TRAIT_BEAST_COVENANT_CARETAKER / ผู้ผูกพันธะอสูรคู่ชีพ (Beast-Covenant Caretaker) | BEAST_NURTURE_AND_BOND ×2 | SECT: actual pet nurture | พลังชีวิต +12%, โจมตี +8%, อัตราบ่มเพาะ +5%; ภาระ: ความเร็วร่าย -3 |
| EXP_TRAIT_OATH_KEEPER / ผู้รักษาสัตย์สาบาน (Unyielding Oath-Keeper) | UPHELD_VOW_OR_CONTRACT ×1 | SECT: actual vow completion | โจมตี +10%, ป้องกันวิชา +12%, คริติคอล +6, อัตราบ่มเพาะ +15%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_DEFEAT_VETERAN / ทหารผ่านศึกผู้ลุกขึ้นจากความพ่ายแพ้ (Battle-Hardened Veteran) | SURVIVED_HEAVY_DEFEAT ×1 | COMBAT.conclude: surviving serious defeat | ป้องกัน +12%, พลังชีวิต +10%, เจาะเกราะ +8, อัตราบ่มเพาะ +5%; ภาระ: ความเร็วร่าย -4 |
| EXP_TRAIT_GATE_WALL_VETERAN / ผู้ผ่านศึกหน้าประตูสำนัก | DEFEND_GATE_RAID ×2 | COMBAT.recordLifeConclude: actual qualified raid victory | ป้องกัน +10%, ป้องกันวิชา +8%, แม่นยำ +6, อัตราบ่มเพาะ +4%; ภาระ: ความเร็วร่าย -3 |
| EXP_TRAIT_SOLE_PARTY_SURVIVOR / ผู้รอดกลับมาจากคณะสูญเสีย | PARTY_CASUALTY_SURVIVED ×1 | COMBAT.recordLifeConclude / EXPED.resolve: real casualty | หลบหลีก +10%, ป้องกัน +6%, อัตราบ่มเพาะ +3%; ภาระ: ความเร็วร่าย -4 |
| EXP_TRAIT_CAULDRON_BLAST_SCAR / ช่างโอสถผู้รอบคอบหลังความล้มเหลว | CAULDRON_ACCIDENT_SURVIVED ×2 | ECO.finishCraft/personalCraft: paid failed alchemy, or verified explosion deed | ป้องกันวิชา +8%, แม่นยำ +8, อัตราบ่มเพาะ +4%; ภาระ: ความเร็วร่าย -3 |
| EXP_TRAIT_TOURNEY_FINAL_CHOKER / ผู้ขัดเกลาตนหลังพลาดรอบสำคัญ | TOURNEY_OR_DUEL_HEARTBREAK ×2 | COMBAT.recordLifeConclude: loss in resolved duel/tourney | โจมตี +8%, แม่นยำ +6, อัตราบ่มเพาะ +6%; ภาระ: คริติคอล -3 |
| EXP_TRAIT_POISON_TEST_SUBJECT / ผู้เรียนรู้พิษจากบาดแผล | POISON_SURVIVED_AND_CURED ×3 | ET.evaluateDaily: observed poison episode then cured | ป้องกันวิชา +10%, พลังชีวิต +6%, อัตราบ่มเพาะ +3%; ภาระ: ความเร็วเคลื่อนที่ -2 |
| EXP_TRAIT_NIGHT_WATCH_SENTINEL / ยามผู้คุ้นราตรี | NIGHT_GUARD_SHIFT_DONE ×3 | ET.onActivityComplete: completed night guard/patrol | ป้องกัน +6%, แม่นยำ +10, หลบหลีก +6, อัตราบ่มเพาะ +3%; ภาระ: แม่นยำ -3 |
| EXP_TRAIT_HEARTBROKEN_ASCETIC / ผู้ปิดใจมุ่งมรรคาหลังรักร้าว | RELATIONSHIP_HEARTBREAK ×1 | AI.pairEnd / ET.onDeath: rejected date or companion loss | ป้องกันวิชา +10%, ความเร็วร่าย +5, อัตราบ่มเพาะ +8%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_BEREAVED_MENTOR / อาจารย์ผู้สูญเสียศิษย์ | APPRENTICE_FALLEN ×1 | AI.kill -> ET.onDeath: actual mentor relationship | ป้องกัน +10%, โจมตี +6%, อัตราบ่มเพาะ +4%; ภาระ: ความเร็วร่าย -3 |
| EXP_TRAIT_STARVATION_MEMORY / ผู้จดจำความอดอยาก | FAMINE_SURVIVED ×2 | ET.evaluateDaily: prolonged hunger followed by recovery | พลังชีวิต +8%, ป้องกัน +6%, อัตราบ่มเพาะ +3%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_GIANT_HUNTER_NERVE / ผู้คุ้นอสูรใหญ่ | GREAT_BEAST_HUNTED ×2 | COMBAT.recordLifeConclude: qualified tier>=5 wild kill | โจมตี +9%, ป้องกัน +6%, เจาะเกราะ +5, อัตราบ่มเพาะ +4%; ภาระ: หลบหลีก -3 |
| EXP_TRAIT_SHARP_MERCHANT_CYNIC / พ่อค้าผ่านตลาดมาก | MARKET_DEAL_COMPLETED ×4 | EXPED.tradeResult / resolve | ป้องกันวิชา +6%, แม่นยำ +8, อัตราบ่มเพาะ +3%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_UNJUSTLY_PUNISHED / ผู้ระแวงหลังตกเป็นข้อกล่าวหา | UNFAIR_DISCIPLINE_OR_RUMOR ×1 | EPITHETS.seedAccusationRumor: receipt accepted | โจมตี +7%, ป้องกัน +7%, อัตราบ่มเพาะ +5%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_MERCIFUL_DOCTOR_BURDEN / หมอผู้แบกความสูญเสีย | HEALER_WITNESSED_LOSS ×1 | AI.kill: patient last treated within 360 calendar minutes | พลังชีวิต +8%, ป้องกันวิชา +8%, ความเร็วร่าย +5, อัตราบ่มเพาะ +4%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_BOTTLENECK_WALL_GRIT / ผู้ผ่านคอขวดซ้ำ | BOTTLENECK_FAILURE_ENDURED ×2 | CULT.breakthrough: failed surviving attempt | ป้องกัน +9%, ป้องกันวิชา +9%, อัตราบ่มเพาะ +6%; ภาระ: ความเร็วร่าย -2 |
| EXP_TRAIT_DEEP_MINE_TUNNELER / ผู้คุ้นอุโมงค์เหมือง | MINE_SHIFT_COMPLETED ×5 | ECO.mineYield: actual yielded output | ป้องกัน +8%, พลังชีวิต +8%, อัตราบ่มเพาะ +3%; ภาระ: ความเร็วเคลื่อนที่ -2 |
| EXP_TRAIT_DIPLOMAT_HOSTAGE_CALM / ทูตผู้เคยอยู่กลางวงล้อม | HAZARDOUS_ENVOY_RETURNED ×1 | EXPED.diplomacyResult / resolve: captured hostile relation or danger | ป้องกันวิชา +10%, ป้องกัน +6%, หลบหลีก +6, อัตราบ่มเพาะ +4%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_FORGE_BURN_CALLUS / ช่างหลอมมือผ่านไฟ | FORGE_CRAFT_COMPLETED ×5 | ECO.finishCraft/personalCraft: successful forging | โจมตี +8%, ป้องกัน +8%, อัตราบ่มเพาะ +3%; ภาระ: ความเร็วร่าย -2 |
| EXP_TRAIT_DUET_SOUL_SYNC / คู่ประสานที่รู้ใจกัน | DUET_RESONANCE_CAST ×2 | COMBAT: successful real duet, both partners | โจมตี +8%, โจมตีวิชา +8%, แม่นยำ +8, อัตราบ่มเพาะ +5%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_ANCIENT_CIPHER_OBSESSED / ผู้หมกมุ่นศึกษาศิลาจารึกโบราณ | ANCIENT_STELE_DECIPHERED ×2 | EXPLORE.visit: actual stele/ruin | โจมตีวิชา +10%, แม่นยำ +8, เจาะเกราะ +5, อัตราบ่มเพาะ +7%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_BLOOD_DEBT_TRACKER / ผู้ชำนาญตามรอยหนี้แค้น | BOUNTY_OR_GRUDGE_RESOLVED ×2 | SECT.BOUNTY_BOARD.claimBountyHunt: settled actual hunter | โจมตี +9%, แม่นยำ +10, เจาะเกราะ +6, อัตราบ่มเพาะ +4%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_PEAK_PIONEER_FOUNDER / ผู้บุกเบิกยอดเขา | PEAK_SANCTUARY_PIONEER ×1 | SECT.PEAKS.foundPeak: newly founded peak participants | ป้องกัน +8%, ป้องกันวิชา +8%, พลังชีวิต +6%, อัตราบ่มเพาะ +6%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_RIVER_ANGLER_ZEN / ผู้สงบจากสายน้ำ | RIVER_FISHING_MEDITATION ×4 | FISHING.resolveSuccessfulCatch: fish outcome with real stock | ป้องกันวิชา +10%, แม่นยำ +6, หลบหลีก +6, อัตราบ่มเพาะ +5%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_SIEGE_ENGINEER_BREAKER / ผู้เรียนรู้ค่ายกลจากศึกล้อม | SIEGE_ARRAY_PARTICIPATION ×2 | COMBAT.recordLifeConclude: qualified array/strategy raid participant | โจมตี +8%, โจมตีวิชา +8%, เจาะเกราะ +8, อัตราบ่มเพาะ +4%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_REFORMED_EX_BANDIT / ผู้แปรพักตร์ที่พิสูจน์ตนด้วยผลงาน | REFORMED_LOYAL_SERVICE ×1 | ET.evaluateDaily: recruited defector merit>=300 loyalty>=75 | หลบหลีก +8%, ป้องกัน +6%, แม่นยำ +6, อัตราบ่มเพาะ +4%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_HOMEWARD_PATHFINDER / ผู้รู้ทางกลับบ้าน | SAFE_RETURN_FROM_DEEP_WILD ×3 | ET.evaluateDaily: won hunt then physically returned inside; EXPED.resolve | ป้องกัน +6%, หลบหลีก +8, ความเร็วเคลื่อนที่ +4, อัตราบ่มเพาะ +3%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_PRE_HUNT_PREPARED / ผู้เตรียมพร้อมก่อนออกล่า | PREPARED_WILD_HUNT_SUCCESS ×3 | WILD prepared context at departure + qualified win + physical return | พลังชีวิต +8%, ป้องกัน +6%, แม่นยำ +6, อัตราบ่มเพาะ +4%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_CRISIS_COMRADE_LIFELINE / ผู้พยุงเพื่อนผ่านวิกฤต | ALLY_SAVED_IN_CRISIS ×2 | ET.onHealed: actual ally HP<25% restored / verified rescue deed | ป้องกัน +8%, ป้องกันวิชา +8%, พลังชีวิต +6%, อัตราบ่มเพาะ +5%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_RESILIENT_COMEBACK / ผู้ผ่านความล้มเหลวแล้วตั้งหลัก | OVERCOME_PAST_FAILURE ×1 | CULT.breakthrough: succeed after recorded same-stage failure | โจมตี +7%, โจมตีวิชา +7%, ป้องกันวิชา +7%, อัตราบ่มเพาะ +6%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_BALANCED_LIFE_RHYTHM / ผู้รักษาจังหวะชีวิตสมดุล | BALANCED_DAILY_RHYTHM ×3 | ET.evaluateDaily: previous-day food/sleep/work or practice/social actually completed | พลังชีวิต +6%, ป้องกันวิชา +8%, ความเร็วร่าย +4, อัตราบ่มเพาะ +6%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |
| EXP_TRAIT_ATONING_RESPONSIBILITY / ผู้รับผิดชอบหลังความผิดพลาด | ATONED_MISTAKE_WITH_DEED ×1 | EPITHETS.recordDeed: actual redemption completion | ป้องกัน +8%, ป้องกันวิชา +8%, แม่นยำ +6, อัตราบ่มเพาะ +5%; ภาระ: ไม่มีโทษค่าสถานะเพิ่มเติม |

## รอยชำนาญ (24)

| ID / ชื่อ | เกณฑ์ | producer | ผลจริง |
|---|---|---|---|
| TRAIT_PARRY_COUNTER / กระบี่ตอบโต้ | parryCount ×15 | COMBAT: actual parry | ปัดป้องครบ 15 ครั้ง: ความเสียหายสะท้อนกลับ +15% |
| TRAIT_VANGUARD_GUARD / ทวนพิทักษ์ | coverCount ×20 | COMBAT: actual intercept | เข้าขวางรับดาเมจแทนเพื่อนครบ 20 ครั้ง: ป้องกันตนเองและเพื่อนข้างเคียง +12% |
| TRAIT_COMBAT_MEDIC / หมอสนาม | clutchHealCount ×10 | ET.onHealed: actual crisis ally heal | ฮีลช่วยเพื่อนที่ HP < 25% ครบ 10 ครั้ง: ผลฮีลฉุกเฉิน +20% |
| TRAIT_FORMATION_STRATEGIST / ผู้วางหมาก | formationTicks ×30 | COMBAT: actual active array ticks | เปิดใช้ค่ายกลในสนามรบสะสมครบ 30 เทิร์น: ฟื้นฟูปราณ +15% |
| TRAIT_LONG_RANGE_DEADEYE / ศรสังหารสุดขอบฟ้า | longRangeHits ×25 | COMBAT.observeLifeHit: hit at distance>=4.5 | โจมตี +8%, แม่นยำ +8 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_CLOSE_QUARTERS_INFILTRATOR / คลุกวงในไร้ช่องว่าง | closeInStrikes ×25 | COMBAT.observeLifeHit: hit ranged/caster at distance<=2 | โจมตี +8%, ความเร็วเคลื่อนที่ +5, หลบหลีก +5 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_POISE_SHATTER_BREAKER / ทุบสะท้านทลายร่าย | interruptCount ×10 | COMBAT.interruptChannel: actual interrupted channel | โจมตี +7%, เจาะเกราะ +6 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_PHANTOM_FOOTWORK_EVADER / ก้าวพรายหลบพ้นเส้นยาแดง | dodgeCount ×25 | COMBAT.strike: actual ordinary miss | หลบหลีก +8, ความเร็วเคลื่อนที่ +5 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_ELEMENTAL_CATALYST_SAVANT / จุดปฏิกิริยาธาตุต่อเนื่อง | reactionsTriggered ×12 | COMBAT: actual elemental reaction damage | โจมตีวิชา +10%, เจาะเกราะ +5 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_EXECUTIONER_FINISHER / คมดาบปิดบัญชี | finisherKills ×12 | COMBAT.observeLifeHit: real kill from <=35% HP | โจมตี +8%, คริติคอล +6 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_VENOM_ACUPOINT_WEAVER / เข็มพิษซึมลึกเจ็ดจุด | debuffsLanded ×25 | STATS.addStatus: actual accepted hostile debuff in combat scope | โจมตีวิชา +8%, แม่นยำ +8 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_UNSHAKEABLE_CHANNELER / สมาธินิ่งดั่งขุนเขาขณะร่าย | completedChannels ×12 | COMBAT: completed final channel hit | ป้องกันวิชา +10%, ความเร็วร่าย +6 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_PUPPET_SWARM_COMMANDER / บัญชากองทัพหุ่นเงา | summonAssists ×20 | COMBAT.observeLifeHit: summoned unit actual hit credited to owner | โจมตี +6%, โจมตีวิชา +6%, ป้องกัน +6% เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_BEAST_PACK_TACTICIAN / เขี้ยวเล็บประสานเจ้านาย | petComboHits ×20 | COMBAT.observeLifeHit: actual isPetAssist hit | โจมตี +8%, พลังชีวิต +6% เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_OUTNUMBERED_LONE_WOLF / เสือดุกลางวงล้อม | outnumberedFights ×4 | COMBAT.recordLifeConclude: qualified outnumbered victory vs>=3 | ป้องกัน +10%, โจมตี +8% เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_GIANT_ANATOMY_SLAYER / ผ่าเส้นเอ็นอสูรยักษ์ | bossPartsBroken ×4 | COMBAT.observeLifeHit: newly broken anatomy part | โจมตี +8%, เจาะเกราะ +8 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_SHIELD_SUNDER_SPECIALIST / เจาะเกราะผ่าม่านคุ้มกาย | shieldsCracked ×10 | COMBAT.observeLifeHit: shield actually depleted | โจมตี +7%, เจาะเกราะ +8 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_HARMONIC_CHORD_CONDUCTOR / สายพิณประคองขวัญทัพ | aurasMaintainedTicks ×30 | COMBAT: real ally buff held during combat | ป้องกันวิชา +9%, พลังชีวิต +6%, ความเร็วร่าย +5 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_BLOOD_BOIL_SURVIVOR / ยิ่งหลั่งเลือดยิ่งดุดัน | lowHpCombatWins ×4 | COMBAT.recordLifeConclude: qualified victory with HP<35% | ป้องกัน +10%, ป้องกันวิชา +8%, พลังชีวิต +6% เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_DISARM_SHACKLE_CONTROLLER / พันธนาการสยบพยศ | hardCcLanded ×12 | STATS.addStatus: accepted actual hostile hard control | ป้องกัน +6%, แม่นยำ +10 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_FIRST_BLOOD_BLITZ / ชิงลงมือก่อนฟ้าผ่า | openingStrikeCrits ×10 | COMBAT.observeLifeHit: actual early critical | คริติคอล +6, ความเร็วร่าย +6 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_SPELL_WARD_BREAKER / สยบอาคมสะท้อนมนตรา | magicMitigatedCount ×25 | COMBAT.observeLifeHit: survives magic damage (not inferred reflect) | ป้องกันวิชา +12% เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_NONLETHAL_SUBDUER / ออมมือไว้ชีวิตแม่นยำ | mercifulSubdues ×6 | COMBAT.observeLifeHit: real human yielded without death | ป้องกัน +8%, แม่นยำ +8 เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |
| TRAIT_TRIBULATION_LIGHTNING_TAMER / ฝ่าอัสนีเก้าชั้นฟ้า | tribulationBoltsSurvived ×8 | CULT.TRIBULATION.tick: actual strikesLanded delta | ป้องกันวิชา +10%, พลังชีวิต +8% เมื่อเป็นหนึ่งในรอยชำนาญที่ใช้งาน |

## ขอบเขตหลักฐาน

ชุด regression ตรวจ modifier contract ของ E ทั้ง27 และเส้นทาง derived stats ของ mastery ทั้ง24; มีกรณีจริงเรื่องยิงไกล ออมมือ เหมือง วิสัชนาธรรม และศิลาจารึก ไม่ได้เล่นฉากทุกชนิดครบทั้ง87 ID โดยธรรมชาติ ชุดปล่อย80 NPC สอง seed ข้าม30/10ขอบวันและชุดสั้นอีก6ขอบวันพบประสบการณ์/รอยชำนาญหลายชนิด ดูรายงานกับ evidence ห้ามเปลี่ยน NOT_OBSERVED เป็น FAILED หรืออ้างทุกแถวพบจริง
