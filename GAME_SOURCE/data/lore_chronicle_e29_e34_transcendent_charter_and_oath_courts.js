/* ============================================================================
 * lore_chronicle_e29_e34_transcendent_charter_and_oath_courts.js
 * มหากาพย์ยุคที่ 29–34: "ศาลธรรมนูญสัตย์สาบาน กุญแจผนึกทั้งเก้า และรอยต่อหลังโศกนาฏกรรมอวี้จิง"
 * ----------------------------------------------------------------------------
 * ไฟล์คลัง Lore แยกเฉพาะ (Standalone JS — JianghuSect Evolution JS2 v3.8.3)
 * ช่วงเวลา: ยุคที่ 29 ปีที่ 515 – ยุคที่ 34 ปีที่ 772 (ศ.ท. 28,515 – 33,772)
 * ============================================================================ */
(function (g) {
  'use strict';
  const JD = g.JD = g.JD || {};

  const META = Object.freeze({
    id: 'LORE_CHRONICLE_E29_E34_CHARTER',
    exportKey: 'JD.LORE_CHRONICLE_E29_E34_CHARTER',
    version: '3.8.3-standalone-e29-e34-charter',
    status: 'STANDALONE_UNBUNDLED_CHRONICLE',
    titleTh: 'มหากาพย์ยุคที่ 29–34: ศาลธรรมนูญสัตย์สาบาน กุญแจผนึกทั้งเก้า และรอยต่อหลังโศกนาฏกรรมอวี้จิง',
    eraSpanTh: 'ยุคที่ 29 ปีที่ 515 – ยุคที่ 34 ปีที่ 772 (ศ.ท. 28,515 – 33,772)',
    worldYearStart: 28515,
    worldYearEnd: 33772,
    calendarStandardTh: '1 ยุค = 1,000 ปี · 12 เดือนไทย (เดือนอ้ายวสันต์–เดือนสิบสองเหมันต์ลึก) × 30 วัน',
    continuityAnchorTh: 'สืบเนื่องหลังมหานิกายอวี้จิงล่มสลายในคืนเดียว (ยุคที่ 26 ปีที่ 488) เหล่าปราชญ์จึงสร้างระบบธรรมนูญกลางและหอผนึกกุญแจทั้งเก้าเพื่อควบคุมพันธสัญญาและวิชาต้องห้าม',
    realmSeparationRuleTh: 'ยึดกฎ "น้ำบ่อไม่ยุ่งกับน้ำคลอง" — อิ๋นเหิงรบจินอวี้เฉพาะวงราชสำนัก ส่วนศาลธรรมนูญ หอกุญแจทั้งเก้า และม่อชี่เหมินรบเฉพาะวงยุทธภพ',
    linkedGamePaths: Object.freeze([
      'LEG_OATH_JUDGE_WARDEN',
      'LEG_SUB_VOW_WITNESS',
      'LEG_SUB_TRUTH_LANTERN',
      'LEG_SUB_BLOOD_DEBT_BAILIFF',
      'TRANS_FIELD_CLAUSE_SOVEREIGN',
      'TRANS_SUB_EQUAL_GROUND',
      'TRANS_SUB_TRUCE_BOUNDARY',
      'TRANS_SEALKEEPER_FORBIDDEN_KEY',
      'TRANS_SUB_KEYBEARER_LOCK',
      'TRANS_SUB_TABOO_DAMPER',
      'TRANS_SUB_RELIC_CAGE',
      'TRANS_DYNASTIC_MANDATE_WEAVER',
      'MERCANTILE_DAO',
      'BLOOD_CONTRACT_NOTARY',
      'GOLDEN_ABACUS_ARBITER'
    ]),
    linkedResonanceSets: Object.freeze([
      'RES_V320_ARCHIVIST_RELIC',
      'RES_V320_TWIN_STAR_BOND'
    ]),
    openMysteriesPreserved: Object.freeze([
      'ไม่เฉลยสาเหตุที่จักรวรรดิจินหยางถอนทัพในยุคที่ 1',
      'ไม่เฉลยความลับเบื้องหลังทะเลหมอกปิดอนุทวีป'
    ])
  });

  const EVENTS = Object.freeze([
    {
      id: 'EVT_E29_01_CHARTER_OF_NINE_SCALES',
      eraGroup: 'ERA_29',
      eraId: 'ERA_3_MIDDLE_EPOCHS',
      worldYear: 28515,
      yearLabelTh: 'ยุคที่ 29 ปีที่ 515 · เดือนอ้ายวสันต์ วันที่ 15 (ศ.ท. 28,515)',
      titleTh: 'ธรรมนูญเก้าตาชั่ง ณ ชายขอบหุบเขาเงียบงัน — กำเนิดศาลธรรมนูญสัตย์สาบานและหอกุญแจทั้งเก้า',
      locationTh: 'ลานศิลาเก้าแท่น นอกหุบเขาเงียบงันอวี้จิงสามสิบลี้',
      factions: ['ศาลธรรมนูญสัตย์สาบาน', 'หอผู้ถือกุญแจผนึกทั้งเก้า', 'สามสิบหกสำนักกลาง'],
      keyFigures: ['มหาตุลาการ ซือหม่าเหิง', 'เจ้าหอกุญแจ กู้เซวียนกวน'],
      linkedSystems: ['LEG_OATH_JUDGE_WARDEN', 'LEG_SUB_VOW_WITNESS', 'TRANS_FIELD_CLAUSE_SOVEREIGN', 'TRANS_SEALKEEPER_FORBIDDEN_KEY', 'TRANS_SUB_KEYBEARER_LOCK'],
      narrativeTh: 'สามพันยี่สิบเจ็ดปีหลังราตรีพันธะขาดสะบั้นที่นิกายอวี้จิงดับสูญในคืนเดียว สำนักกว่ายี่สิบแห่งลักลอบแกะรอยค่ายกลเชื่อมชีพจรจนปราณสะท้อนทำลายตนเองซ้ำซาก มหาตุลาการ ซือหม่าเหิง และปรมาจารย์ผนึก กู้เซวียนกวน จึงนัดสามสิบหกสำนักเป็นกลางชุมนุม ณ ลานศิลาเก้าแท่น ห่างจากหอคอยศิลาของฉินอวี้หลันออกไปสามสิบลี้เพื่อมิให้กลิ่นปราณปลุกรังไหมโม่หมิง ทั้งสองสลัก "ธรรมนูญเก้าตาชั่ง" ก่อตั้ง "ศาลธรรมนูญสัตย์สาบาน" กำกับคำสัตย์และเขตสงบศึกด้วยวิถี LEG_OATH_JUDGE_WARDEN กับ TRANS_FIELD_CLAUSE_SOVEREIGN คู่กับ "หอผู้ถือกุญแจผนึกทั้งเก้า" เก็บกักศาสตราต้องห้ามใต้ดินด้วยวิถี TRANS_SEALKEEPER_FORBIDDEN_KEY พร้อมห้ามสร้างค่ายกลเชื่อมชีพจรหมู่เกินสามคนโดยไร้ตราพยาน',
      aftermathTh: 'ยุทธภพเข้าสู่ยุคธรรมนูญกลาง ข้อพิพาทระหว่างสำนักลดความสูญเสีย และวิชาต้องห้ามยุคที่ 26 ถูกทยอยเก็บกักเข้าโถงผนึก',
      reusableHooks: ['ลานศิลาเก้าแท่นนอกหุบเขาอวี้จิง', 'ข้อห้ามค่ายกลเชื่อมชีพจรหมู่']
    },
    {
      id: 'EVT_E30_02_RISE_OF_YINHENG_AND_JINYU',
      eraGroup: 'ERA_30',
      eraId: 'ERA_3_MIDDLE_EPOCHS',
      worldYear: 29208,
      yearLabelTh: 'ยุคที่ 30 ปีที่ 208 · เดือนสี่คิมหันต์ต้น วันที่ 9 (ศ.ท. 29,208)',
      titleTh: 'กำเนิดราชอาณาจักรตราชั่งเงินอิ๋นเหิง และสหพันธ์แคว้นสัญญาจินอวี้',
      locationTh: 'นครหลวงอิ๋นตู และ สภานครเจ็ดหยกจินอวี้',
      factions: ['ราชอาณาจักรตราชั่งเงินอิ๋นเหิง', 'สหพันธ์แคว้นสัญญาจินอวี้'],
      keyFigures: ['กษัตริย์ อิ๋นเจิ้นเหิง', 'อัครเสนาบดี จินอวี้ซวน'],
      linkedSystems: ['TRANS_DYNASTIC_MANDATE_WEAVER', 'MERCANTILE_DAO', 'GOLDEN_ABACUS_ARBITER', 'BLOOD_CONTRACT_NOTARY'],
      narrativeTh: 'ในฟากโลกปุถุชนหลังสุญญากาศสิบสี่ราชสำนักยุคที่ 26 กษัตริย์ อิ๋นเจิ้นเหิง รวบรวมแคว้นเหมืองตะวันตกตั้ง "ราชอาณาจักรตราชั่งเงินอิ๋นเหิง" ผสาน TRANS_DYNASTIC_MANDATE_WEAVER กับ GOLDEN_ABACUS_ARBITER จนการคลังเที่ยงตรงระดับหยดน้ำ ส่วนลุ่มน้ำตะวันออก อัครเสนาบดี จินอวี้ซวน ผนึกเจ็ดนครรัฐตั้ง "สหพันธ์แคว้นสัญญาจินอวี้" ใช้ BLOOD_CONTRACT_NOTARY ใต้สาย MERCANTILE_DAO เชื่อมท่าเรือและคลองส่งข้าว ทั้งสองราชสำนักออกโองการรับรองเขตเป็นกลางของศาลธรรมนูญ ยึดกฎ "น้ำบ่อไม่ยุ่งกับน้ำคลอง" ไม่ส่งทัพหลวงแทรกแซงสำนักยุทธ์',
      aftermathTh: 'มาตรฐานตราชั่งเงินและใบสัญญาหยกกลายเป็นต้นแบบการคลังและการค้าข้ามพรมแดนของอาณาจักรยุคหลัง',
      reusableHooks: ['เหรียญตราชั่งเงินอิ๋นเหิง', 'โองการสองขั้วรับรองเขตเป็นกลาง']
    },
    {
      id: 'EVT_E31_03_TWIN_STAR_AND_ARCHIVIST_FORGING',
      eraGroup: 'ERA_31',
      eraId: 'ERA_3_MIDDLE_EPOCHS',
      worldYear: 30142,
      yearLabelTh: 'ยุคที่ 31 ปีที่ 142 · เดือนเจ็ดสารทต้น วันที่ 21 (ศ.ท. 30,142)',
      titleTh: 'หอจดหมายเหตุเมฆาขาว และกำเนิด "ชุดอาลักษณ์บันทึกวีรกรรม" กับ "ชุดดาราคู่พันธะนิรันดร์"',
      locationTh: 'หอจดหมายเหตุเมฆาขาว ภายในศาลธรรมนูญสัตย์สาบาน',
      factions: ['ศาลธรรมนูญสัตย์สาบาน', 'หอผู้ถือกุญแจผนึกทั้งเก้า'],
      keyFigures: ['ปราชญ์อาลักษณ์ เหวินชิงจือ', 'หลินซวงซิง', 'เซียวเจี้ยนเหิง'],
      linkedSystems: ['RES_V320_ARCHIVIST_RELIC', 'RES_V320_TWIN_STAR_BOND', 'LEG_SUB_TRUTH_LANTERN', 'LEG_SUB_VOW_WITNESS'],
      narrativeTh: 'ปราชญ์อาลักษณ์ เหวินชิงจือ รวบรวมสำเนาบันทึกพยานคืนราตรีโม่หมิงขององค์ชายลู่เจาเหวิน รายชื่อของวิเศษเก้าห้อง และคดีคำสัตย์ตลอดสองพันปี หลอมเข้ากับหยกหมึกและพู่กันขนหงส์ขาวเกิดเป็น "ชุดอาลักษณ์บันทึกวีรกรรม" (RES_V320_ARCHIVIST_RELIC) ปีเดียวกัน แม่นาง หลินซวงซิง แห่งสาย LEG_SUB_TRUTH_LANTERN และคู่สาบาน เซียวเจี้ยนเหิง แก้โจทย์พันธะจากยุคที่ 26 ด้วยวงจรจำกัดสองดวงจิตพร้อมกลไกตัดฉับพลันเมื่อต้องพิษปราณ กำเนิดเป็น "ชุดดาราคู่พันธะนิรันดร์" (RES_V320_TWIN_STAR_BOND) ที่ชอบด้วยธรรมนูญเก้าตาชั่ง',
      aftermathTh: 'ศาสตราพ้องก้องทั้งสองชุดกลายเป็นสัญลักษณ์แห่งปัญญาของยุคศาลธรรมนูญ',
      reusableHooks: ['ที่มาของ RES_V320_ARCHIVIST_RELIC', 'ที่มาของ RES_V320_TWIN_STAR_BOND แก้ทางบทเรียนอวี้จิง']
    },
    {
      id: 'EVT_E31_04_SILVER_AND_JADE_TARIFF_WAR',
      eraGroup: 'ERA_31',
      eraId: 'ERA_3_MIDDLE_EPOCHS',
      worldYear: 30864,
      yearLabelTh: 'ยุคที่ 31 ปีที่ 864 · เดือนเก้าสารทลึก วันที่ 3 (ศ.ท. 30,864)',
      titleTh: 'สงครามภาษีเงินตราและยุทธการสามด่านจินอิ๋นระหว่างสองราชสำนัก',
      locationTh: 'สามด่านชายแดนจินอิ๋น (ด่านหอเงิน ด่านสะพานหยก ด่านคลองพันเรือ)',
      factions: ['ราชอาณาจักรตราชั่งเงินอิ๋นเหิง', 'สหพันธ์แคว้นสัญญาจินอวี้'],
      keyFigures: ['จักรพรรดิอิ๋นเสวียนเหิง', 'ประธานสภาเจ็ดหยก จินซานไห่'],
      linkedSystems: ['TRANS_DYNASTIC_MANDATE_WEAVER', 'MERCANTILE_DAO', 'GOLDEN_ABACUS_ARBITER', 'BLOOD_CONTRACT_NOTARY', 'TRANS_SUB_TRUCE_BOUNDARY'],
      narrativeTh: 'เมื่อจินอวี้ใช้เครือข่ายสัญญาโลหิตผูกขาดธัญพืชและขึ้นภาษีคลองพันเรือสามเท่า อิ๋นเหิงจึงตรึงค่าเงินตราชั่งและตัดเส้นทางแร่ ก่อนปะทุเป็นสงครามทัพหลวงเต็มรูปแบบ ณ สามด่านจินอิ๋นนานสิบเจ็ดปีระหว่างทัพเกราะเงินกับกองเรือหยก ตลอดศึกทั้งสองฝ่ายเคารพกฎ "น้ำบ่อไม่ยุ่งกับน้ำคลอง" ไม่มีทัพใดเหยียบข้ามศิลา TRANS_SUB_TRUCE_BOUNDARY รอบเมืองท่าเป็นกลาง และศาลธรรมนูญส่งเพียงผู้คุมสาย LEG_SUB_VOW_WITNESS เป็นพยานลงนามสงบศึก',
      aftermathTh: 'สงครามจบแบบไร้ผู้ชนะ คลังหลวงอิ๋นเหิงร่อยหรอจนพิมพ์ตั๋วเงินเกินสำรอง ส่วนเจ็ดนครจินอวี้แตกคอกันเพราะหนี้สงคราม',
      reusableHooks: ['ซากสมรภูมิสามด่านจินอิ๋น', 'สนธิสัญญาสงบศึกสามด่าน']
    },
    {
      id: 'EVT_E32_05_MOQI_HERESY_AND_STOLEN_KEYS',
      eraGroup: 'ERA_32',
      eraId: 'ERA_3_MIDDLE_EPOCHS',
      worldYear: 31419,
      yearLabelTh: 'ยุคที่ 32 ปีที่ 419 · เดือนสิบเหมันต์ต้น วันที่ 28 (ศ.ท. 31,419)',
      titleTh: 'กบฏสำนักพันธะหวนคืน (ม่อชี่เหมิน) และการโจรกรรมกุญแจดอกที่สามกับดอกที่เจ็ด',
      locationTh: 'โถงผนึกเก้าชั้นใต้ดิน หอผู้ถือกุญแจผนึกทั้งเก้า',
      factions: ['หอผู้ถือกุญแจผนึกทั้งเก้า', 'สำนักพันธะหวนคืน · ม่อชี่เหมิน'],
      keyFigures: ['ผู้ทรยศกุญแจ โม่เซียวเหยียน', 'เจ้าหอกุญแจ เสิ่นชิงซั่ว'],
      linkedSystems: ['TRANS_SEALKEEPER_FORBIDDEN_KEY', 'TRANS_SUB_KEYBEARER_LOCK', 'TRANS_SUB_TABOO_DAMPER', 'TRANS_SUB_RELIC_CAGE'],
      narrativeTh: 'คืนหิมะแรกปีที่ 419 แห่งยุคที่ 32 โม่เซียวเหยียน อดีตผู้ถือกุญแจลำดับที่สี่ที่ถูกขับเพราะแอบศึกษาค่ายกลเชื่อมชีพจรยุคที่ 26 นำกำลัง "สำนักพันธะหวนคืน · ม่อชี่เหมิน" เจาะจุดบอดเสา TRANS_SUB_TABOO_DAMPER บุกโถงผนึกชั้นกลาง เจ้าหอ เสิ่นชิงซั่ว ทุ่มตบะปิดกรง TRANS_SUB_RELIC_CAGE ชั้นในสุดไว้ได้แต่ต้องเสียผู้อาวุโสสี่ท่าน และไม่อาจกันโม่เซียวเหยียนที่ชิง "กุญแจดอกที่สาม (ทวงหนี้โลหิต)" กับ "กุญแจดอกที่เจ็ด (รังไหมกระซิบ)" หนีไปได้',
      aftermathTh: 'วงจรผนึกทั้งเก้าขาดความสมบูรณ์เป็นครั้งแรก หอกุญแจจึงผนึกกำลังศาลธรรมนูญไล่ล่าม่อชี่เหมินทั่ววงยุทธภพ',
      reusableHooks: ['กุญแจดอกที่สามและดอกที่เจ็ดที่ถูกโจรกรรม', 'รอยร้าวบนเสาสะกดวิชาต้องห้าม']
    },
    {
      id: 'EVT_E33_06_WAR_OF_THE_EQUAL_GROUND',
      eraGroup: 'ERA_33',
      eraId: 'ERA_3_MIDDLE_EPOCHS',
      worldYear: 32305,
      yearLabelTh: 'ยุคที่ 33 ปีที่ 305 · เดือนหกคิมหันต์ลึก วันที่ 12 (ศ.ท. 32,305)',
      titleTh: 'มหาสงครามลานเสมอภาค — พิพากษาสำนักม่อชี่เหมิน ณ หุบผาร้อยศิลา',
      locationTh: 'หุบผาร้อยศิลา (เขตภูเขากลางของวงยุทธภพ)',
      factions: ['ศาลธรรมนูญสัตย์สาบาน', 'หอผู้ถือกุญแจผนึกทั้งเก้า', 'สำนักพันธะหวนคืน · ม่อชี่เหมิน'],
      keyFigures: ['โม่เซียวเหยียน', 'มหาตุลาการ กงซุนเจิ้ง', 'ฮั่วเจิ้งเต้า'],
      linkedSystems: ['TRANS_FIELD_CLAUSE_SOVEREIGN', 'TRANS_SUB_EQUAL_GROUND', 'LEG_OATH_JUDGE_WARDEN', 'LEG_SUB_BLOOD_DEBT_BAILIFF', 'LEG_SUB_TRUTH_LANTERN', 'TRANS_SUB_TABOO_DAMPER'],
      narrativeTh: 'เมื่อม่อชี่เหมินเปิดค่ายกล "ข่ายพันธะย้อนศร" ดูดปราณสัตย์สาบานของสิบแปดสำนักใกล้เคียง ศาลธรรมนูญและหอกุญแจจึงเปิดศึกสำนักปะทะสำนักครั้งใหญ่ที่สุด ฝ่ายศาลกางอาณาเขต TRANS_SUB_EQUAL_GROUND กดพลังที่ฝ่ายกบฏปล้นชิงให้เสมอภาค จุด LEG_SUB_TRUTH_LANTERN ทำลายคำสาบานเท็จ แล้วส่งกอง LEG_SUB_BLOOD_DEBT_BAILIFF กวาดล้างม่อชี่เหมินจนพินาศ ทว่าก่อนตาย โม่เซียวเหยียนระเบิด "กุญแจดอกที่เจ็ด" ไอมลทินพันธะพุ่งกระแทกศิลาธรรมนูญแม่จนร้าวเก้ารอยและคร่าปรมาจารย์สองสถาบันไปกว่าสองในสาม แม้กู้กุญแจดอกที่สามคืนได้แต่รากฐานทั้งสองสำนักก็ทรุดโทรมเกินฟื้น',
      aftermathTh: 'ม่อชี่เหมินดับสูญถาวร แต่ศาลธรรมนูญและหอกุญแจเข้าสู่ยุคเสื่อมถอย ไม่อาจส่งพยานคำสัตย์กำกับทั่วทวีปได้อีก',
      reusableHooks: ['หุบผาร้อยศิลาที่มีคลื่นพื้นเสมอภาคตกค้าง', 'เศษกุญแจดอกที่เจ็ดที่สูญหาย']
    },
    {
      id: 'EVT_E34_07_COLLAPSE_OF_YINHENG_AND_JINYU',
      eraGroup: 'ERA_34',
      eraId: 'ERA_3_MIDDLE_EPOCHS',
      worldYear: 33290,
      yearLabelTh: 'ยุคที่ 34 ปีที่ 290 · เดือนสิบเอ็ดเหมันต์กลาง วันที่ 6 (ศ.ท. 33,290)',
      titleTh: 'ตราชั่งเงินหักสะบั้นและสัญญาจินอวี้แตกสลาย — อวสานสองมหาอำนาจราชสำนัก',
      locationTh: 'นครหลวงอิ๋นตู และ สภานครเจ็ดหยกจินอวี้',
      factions: ['ราชอาณาจักรตราชั่งเงินอิ๋นเหิง', 'สหพันธ์แคว้นสัญญาจินอวี้'],
      keyFigures: ['กษัตริย์องค์สุดท้าย อิ๋นโม่เหิง', 'เจ็ดเจ้าผู้ครองนครจินอวี้รุ่นสุดท้าย'],
      linkedSystems: ['TRANS_DYNASTIC_MANDATE_WEAVER', 'MERCANTILE_DAO', 'BLOOD_CONTRACT_NOTARY', 'GOLDEN_ABACUS_ARBITER'],
      narrativeTh: 'เมื่อเครือข่ายพยานคำสัตย์เสื่อมถอย คดีปลอมสมุดสัญญาโลหิตก็ปะทุกลางสภาเจ็ดหยก สามนครรัฐเบี้ยวหนี้คลังร่วมและกรีธาทัพเรือยึดท่าเรือสี่นครที่เหลือจนสหพันธ์จินอวี้แตกเป็นเจ็ดเสี่ยง อิ๋นเหิงฉวยโอกาสเคลื่อนทัพหลวงลงใต้ ทว่าราชสำนักตนเองก็ผุกร่อนจากตั๋วเงินเฟ้อ ภัยแล้งสามปี และศึกขุนนางลูกคิดทองกับขุนพล เมื่อทัพหลวงติดหล่ม กบฏชาวนาและศึกชิงบัลลังก์ก็ลุกฮือในอิ๋นตู กษัตริย์อิ๋นโม่เหิงสิ้นพระชนม์ในหอคลังว่างเปล่า ปิดฉากสองมหาอำนาจทางโลกห่างกันไม่ถึงสี่ทศวรรษ',
      aftermathTh: 'แผ่นดินทางโลกแตกกลับเป็นแคว้นเล็ก ทิ้งซากหอคลังตราชั่งเงินและท่าเรือเจ็ดหยกไว้ให้คนรุ่นหลัง',
      reusableHooks: ['ห้องนิรภัยหอคลังตราชั่งเงินอิ๋นตู', 'สมุดสัญญาโลหิตปลอมแห่งสภาเจ็ดหยก']
    },
    {
      id: 'EVT_E34_08_SEALING_OF_PANGUANSHI_VAULT',
      eraGroup: 'ERA_34',
      eraId: 'ERA_3_MIDDLE_EPOCHS',
      worldYear: 33772,
      yearLabelTh: 'ยุคที่ 34 ปีที่ 772 · เดือนสิบสองเหมันต์ลึก วันที่ 30 (ศ.ท. 33,772)',
      titleTh: 'คืนสิ้นปีแห่งการปิดผนึกหอเก้ากุญแจ และกำเนิด "ตุลาการศิลาไร้หน้า · พ่านกวนสือ"',
      locationTh: 'โถงกรงผนึกศาสตราใต้หุบเขาหินสีเทา',
      factions: ['ศาลธรรมนูญสัตย์สาบาน', 'หอผู้ถือกุญแจผนึกทั้งเก้า'],
      keyFigures: ['มหาตุลาการ กงซุนเจิ้ง', 'เจ้าหอกุญแจ เสิ่นซั่วกวน', 'ตุลาการศิลาไร้หน้า · พ่านกวนสือ'],
      linkedSystems: ['TRANS_SEALKEEPER_FORBIDDEN_KEY', 'TRANS_SUB_RELIC_CAGE', 'TRANS_FIELD_CLAUSE_SOVEREIGN', 'TRANS_SUB_EQUAL_GROUND', 'TRANS_SUB_TRUCE_BOUNDARY', 'LEG_OATH_JUDGE_WARDEN'],
      narrativeTh: 'คืนส่งท้ายปีเดือนสิบสองเหมันต์ลึกปีที่ 772 แห่งยุคที่ 34 ศาลธรรมนูญและหอกุญแจเหลือศิษย์เพียงไม่กี่สิบคน มหาตุลาการ กงซุนเจิ้ง และเจ้าหอ เสิ่นซั่วกวน จึงยุบเลิกสองสำนัก สั่งศิษย์ที่เหลือนำชุด RES_V320_ARCHIVIST_RELIC และเคล็ด RES_V320_TWIN_STAR_BOND แยกย้ายไปฝากตามหอสมุดลับ จากนั้นทั้งสองหลอมศิลาธรรมนูญเก้าตาชั่ง กุญแจแปดดอกที่เหลือ และเจตจำนงการพิพากษาเฮือกสุดท้ายเข้ากับรูปสลักศิลาไร้หน้า เกิดเป็น "ตุลาการศิลาไร้หน้า · พ่านกวนสือ" ที่ทุบค้อนปิดผนึกกรงศาสตราทั้งเก้าชั้นจมใต้หุบเขา ปิดฉากมหากาพย์ห้าพันปีแห่งยุคศาลธรรมนูญ',
      aftermathTh: 'กรงผนึกศาสตราและพ่านกวนสือกลายเป็นดันเจี้ยนต้องห้ามที่พิพากษาผู้บุกรุกทุกคนด้วยธรรมนูญขีดเขตและน้ำหนักคำสัตย์',
      reusableHooks: ['ดันเจี้ยนกรงผนึกศาสตราและบอสพ่านกวนสือ', 'เบาะแสชุด RES_V320_ARCHIVIST_RELIC และ RES_V320_TWIN_STAR_BOND']
    }
  ]);

  const FIGURES = Object.freeze([
    {
      id: 'CHR_E29_01_SIMA_HENG',
      nameTh: 'มหาตุลาการ ซือหม่าเหิง (司馬衡)',
      epithetTh: 'บิดาแห่งธรรมนูญเก้าตาชั่ง · ผู้ขีดเขตฟ้าสะกดศึก',
      eraGroup: 'ERA_29',
      birthYear: 28410,
      factionTh: 'ศาลธรรมนูญสัตย์สาบาน (ผู้ร่วมก่อตั้ง)',
      gamePathIds: ['LEG_OATH_JUDGE_WARDEN', 'LEG_SUB_VOW_WITNESS', 'TRANS_FIELD_CLAUSE_SOVEREIGN', 'TRANS_SUB_EQUAL_GROUND', 'TRANS_SUB_TRUCE_BOUNDARY'],
      survivalStatus: 'DECEASED_LEGACY',
      survivalMethodTh: 'สิ้นอายุขัยในปีที่ 892 ยุคที่ 29 เจตจำนงธรรมนูญสถิตในศิลาเก้าตาชั่งและค้อนของพ่านกวนสือ',
      possibleLocationTh: 'สุสานศิลาเรียบหลังซากศาลธรรมนูญ',
      biographyTh: 'ผู้สูญเสียอาจารย์จากค่ายกลเชื่อมพันธะเลียนแบบอวี้จิง อุทิศชีวิตบัญญัติวิถีผู้คุมสัตย์สาบานและธรรมนูญฟ้าขีดเขต โดยยืนกรานแยกศาลธรรมนูญออกจากการเมืองราชสำนักเด็ดขาด',
      reusableHooks: ['ตำราธรรมนูญเก้าตาชั่งฉบับลายมือซือหม่าเหิง']
    },
    {
      id: 'CHR_E29_02_GU_XUANGUAN',
      nameTh: 'เจ้าหอกุญแจ กู้เซวียนกวน (顧玄關)',
      epithetTh: 'ผู้ถือกุญแจดอกแรก · ช่างหลอมกรงผนึกต้องห้าม',
      eraGroup: 'ERA_29',
      birthYear: 28425,
      factionTh: 'หอผู้ถือกุญแจผนึกทั้งเก้า (ผู้ก่อตั้ง)',
      gamePathIds: ['TRANS_SEALKEEPER_FORBIDDEN_KEY', 'TRANS_SUB_KEYBEARER_LOCK', 'TRANS_SUB_TABOO_DAMPER', 'TRANS_SUB_RELIC_CAGE'],
      survivalStatus: 'DECEASED_LEGACY',
      survivalMethodTh: 'สละตบะหลอมกุญแจดอกที่เก้า ทิ้งพิมพ์เขียวกรงผนึกศาสตราไว้ในโถงเตาหลอมใต้ดิน',
      possibleLocationTh: 'ห้องเตาหลอมโบราณใต้หอกุญแจทั้งเก้า',
      biographyTh: 'อัจฉริยะค่ายกลกักขังผู้ออกแบบกุญแจผนึกทั้งเก้าดอกและกรงผนึกศาสตราเก้าชั้น โดยแยกหน้าที่กุญแจแต่ละดอกเพื่อถ่วงดุลไม่ให้ผู้ใดเปิดกรงทั้งหมดได้ลำพัง',
      reusableHooks: ['พิมพ์เขียวกุญแจผนึกทั้งเก้าดอก', 'เคล็ด TRANS_SUB_TABOO_DAMPER']
    },
    {
      id: 'CHR_E30_03_YIN_ZHENHENG',
      nameTh: 'กษัตริย์ตราชั่งเงิน อิ๋นเจิ้นเหิง (銀鎮衡)',
      epithetTh: 'ปฐมกษัตริย์แห่งอิ๋นเหิง · ผู้ทอชะตาแผ่นดินด้วยตาชั่งเงิน',
      eraGroup: 'ERA_30',
      birthYear: 29165,
      factionTh: 'ราชอาณาจักรตราชั่งเงินอิ๋นเหิง (ผู้ก่อตั้ง)',
      gamePathIds: ['TRANS_DYNASTIC_MANDATE_WEAVER', 'MERCANTILE_DAO', 'GOLDEN_ABACUS_ARBITER'],
      survivalStatus: 'DECEASED_LEGACY',
      survivalMethodTh: 'สวรรคตอย่างสงบ ทิ้งลูกคิดทองคำหลวงและระบบชั่งตวงวัดมาตรฐานไว้สืบต่อหลายพันปี',
      possibleLocationTh: 'สุสานหลวงใต้ที่ราบสูงอิ๋นตู',
      biographyTh: 'อดีตเจ้าเมืองเหมืองเงินผู้รวมหัวเมืองตะวันตกด้วยนโยบายหนึ่งตราชั่งหนึ่งมาตรฐาน และตราพระราชกฤษฎีกาห้ามขุนพลหลวงรุกล้ำสำนักยุทธ์ตามกฎน้ำบ่อไม่ยุ่งกับน้ำคลอง',
      reusableHooks: ['ลูกคิดทองคำหลวงแห่งอิ๋นเหิง']
    },
    {
      id: 'CHR_E30_04_JIN_YUXUAN',
      nameTh: 'อัครเสนาบดี จินอวี้ซวน (金玉軒)',
      epithetTh: 'สถาปนิกสหพันธ์เจ็ดหยก · เจ้าแห่งสัญญาโลหิต',
      eraGroup: 'ERA_30',
      birthYear: 29172,
      factionTh: 'สหพันธ์แคว้นสัญญาจินอวี้ (ผู้ก่อตั้ง)',
      gamePathIds: ['MERCANTILE_DAO', 'BLOOD_CONTRACT_NOTARY'],
      survivalStatus: 'DECEASED_LEGACY',
      survivalMethodTh: 'สิ้นอายุขัยหลังวางรากฐานสภาเจ็ดหยก ทิ้งตราประทับนายทะเบียนสัญญาโลหิตไว้ในคลังสภา',
      possibleLocationTh: 'ซากหอประชุมเจ็ดหยกใต้สันดอนปากแม่น้ำตะวันออก',
      biographyTh: 'ทายาทขุนนางเก่าจากอดีตสิบสี่แคว้นยุคที่ 26 ผู้ออกแบบสหพันธ์เจ็ดนครรัฐการค้าด้วยสมุดสัญญาโลหิต สร้างความมั่งคั่งมหาศาลก่อนระบบจะถูกทุจริตในรุ่นหลัง',
      reusableHooks: ['ตราประทับนายทะเบียนสัญญาโลหิตปฐมกาล']
    },
    {
      id: 'CHR_E31_05_WEN_QINGZHI',
      nameTh: 'ปราชญ์อาลักษณ์ เหวินชิงจือ (文青執)',
      epithetTh: 'ผู้บันทึกวีรกรรมไม่รู้ลืม · บิดาแห่งชุดอาลักษณ์',
      eraGroup: 'ERA_31',
      birthYear: 30078,
      factionTh: 'ศาลธรรมนูญสัตย์สาบาน (หัวหน้าหอจดหมายเหตุเมฆาขาว)',
      gamePathIds: ['LEG_OATH_JUDGE_WARDEN', 'LEG_SUB_VOW_WITNESS', 'LEG_SUB_TRUTH_LANTERN'],
      survivalStatus: 'DECEASED_LEGACY',
      survivalMethodTh: 'ละสังขารกลางโต๊ะหนังสือ เหลือมรดกเป็นชุด RES_V320_ARCHIVIST_RELIC',
      possibleLocationTh: 'ซากหอจดหมายเหตุเมฆาขาว',
      biographyTh: 'ผู้ฝึกยุทธ์ที่แทบไม่เคยชักกระบี่แต่เป็นที่ยำเกรงทั่วแผ่นดิน รวบรวมบันทึกพยานยุคที่ 26 และคำพิพากษาสองพันปีหลอมเป็นชุดอาลักษณ์บันทึกวีรกรรม',
      reusableHooks: ['เควสต์รวบรวม RES_V320_ARCHIVIST_RELIC']
    },
    {
      id: 'CHR_E31_06_LIN_SHUANGXING',
      nameTh: 'แม่นางดาราคู่ หลินซวงซิง (林雙星)',
      epithetTh: 'ผู้ถือโคมส่องสัจจะ · ผู้ถักทอพันธะดาราคู่',
      eraGroup: 'ERA_31',
      birthYear: 30095,
      factionTh: 'ศาลธรรมนูญสัตย์สาบาน (สายโคมส่องสัจจะ)',
      gamePathIds: ['LEG_OATH_JUDGE_WARDEN', 'LEG_SUB_TRUTH_LANTERN'],
      survivalStatus: 'DECEASED_LEGACY',
      survivalMethodTh: 'หายสาบสูญพร้อมคู่สาบาน เซียวเจี้ยนเหิง ทิ้งชุด RES_V320_TWIN_STAR_BOND ไว้เป็นมรดก',
      possibleLocationTh: 'หอดูดาวคู่บนยอดเขาเมฆาใส',
      biographyTh: 'อัจฉริยะหญิงสายโคมส่องสัจจะที่มองเห็นรอยร้าวในคำสาบาน นางร่วมกับเซียวเจี้ยนเหิงสร้างวงจรพันธะสองดวงจิตตัดฉับพลันแก้จุดอ่อนจากยุคที่ 26 เกิดเป็นชุดดาราคู่พันธะนิรันดร์',
      reusableHooks: ['เควสต์คู่หูปลดล็อก RES_V320_TWIN_STAR_BOND']
    },
    {
      id: 'CHR_E32_07_MO_XIAOYAN',
      nameTh: 'ผู้ทรยศกุญแจ โม่เซียวเหยียน (墨宵嚴)',
      epithetTh: 'เจ้าสำนักพันธะหวนคืน · ผู้ทำลายกุญแจดอกที่เจ็ด',
      eraGroup: 'ERA_32',
      birthYear: 31290,
      factionTh: 'อดีตหอกุญแจทั้งเก้า / ผู้ก่อตั้งม่อชี่เหมิน',
      gamePathIds: ['TRANS_SEALKEEPER_FORBIDDEN_KEY', 'TRANS_SUB_KEYBEARER_LOCK', 'LEG_SUB_BLOOD_DEBT_BAILIFF'],
      survivalStatus: 'DESTROYED_IN_BATTLE',
      survivalMethodTh: 'ร่างแหลกสลายพร้อมการระเบิดของกุญแจดอกที่เจ็ดในมหาสงครามลานเสมอภาค',
      possibleLocationTh: 'หุบผาร้อยศิลา',
      biographyTh: 'อดีตผู้ถือกุญแจลำดับที่สี่ผู้หลงใหลอำนาจในอดีตของอวี้จิง ทรยศหอผนึกชิงกุญแจดอกที่สามกับเจ็ด ก่อตั้งม่อชี่เหมินวิจัยข่ายพันธะย้อนศรจนพินาศไปพร้อมรากฐานศาลธรรมนูญ',
      reusableHooks: ['เศษกุญแจดอกที่เจ็ดและคัมภีร์ข่ายพันธะย้อนศร']
    },
    {
      id: 'CHR_E34_08_GONGSUN_ZHENG',
      nameTh: 'มหาตุลาการคนสุดท้าย กงซุนเจิ้ง (公孫正)',
      epithetTh: 'ผู้ปิดประตูกรงศาสตรา · ดวงจิตผู้ให้กำเนิดพ่านกวนสือ',
      eraGroup: 'ERA_34',
      birthYear: 32240,
      factionTh: 'ศาลธรรมนูญสัตย์สาบาน (เจ้าศาลคนสุดท้าย)',
      gamePathIds: ['LEG_OATH_JUDGE_WARDEN', 'TRANS_FIELD_CLAUSE_SOVEREIGN', 'TRANS_SUB_EQUAL_GROUND', 'TRANS_SUB_RELIC_CAGE'],
      survivalStatus: 'MERGED_WITH_CONSTRUCT',
      survivalMethodTh: 'หลอมเจตจำนงแห่งการพิพากษาเฮือกสุดท้ายเข้ากับรูปสลักศิลาพ่านกวนสือในคืนสิ้นปีของยุคที่ 34',
      possibleLocationTh: 'โถงกรงผนึกศาสตรา (ภายในร่างพ่านกวนสือ)',
      biographyTh: 'เจ้าศาลคนสุดท้ายที่ตระหนักว่าองค์กรมนุษย์ย่อมผุกร่อน จึงยุบศาลด้วยตนเองและหลอมจิตวิญญาณเข้าสู่ศิลาไร้หน้า เพื่อดำรงอยู่เป็นกฎเกณฑ์ที่ไม่อาจติดสินบนได้',
      reusableHooks: ['เสียงกระซิบของกงซุนเจิ้งเมื่อพิชิตพ่านกวนสืออย่างเที่ยงธรรม']
    }
  ]);

  const FALLEN_KINGDOMS = Object.freeze([
    {
      id: 'FKING_E30_YINHENG_SILVER_SCALE',
      nameTh: 'ราชอาณาจักรตราชั่งเงินอิ๋นเหิง (銀衡王國 — Yinheng Silver-Scale Kingdom)',
      eraSpanTh: 'ยุคที่ 30 ปีที่ 208 → ยุคที่ 34 ปีที่ 328 (4,120 ปี)',
      regionTh: 'ที่ราบสูงเหมืองเงินและเขตปราการตะวันตก',
      founderTh: 'กษัตริย์ อิ๋นเจิ้นเหิง',
      dominantPaths: ['TRANS_DYNASTIC_MANDATE_WEAVER', 'MERCANTILE_DAO', 'GOLDEN_ABACUS_ARBITER'],
      governanceStyleTh: 'ราชาธิปไตยนิติธรรมการคลัง ปกครองด้วยมาตรฐานชั่งตวงวัด เงินตราสำรองแร่เงิน และขุนนางสายลูกคิดทอง',
      realmSeparationStanceTh: 'เคารพกฎ "น้ำบ่อไม่ยุ่งกับน้ำคลอง" ห้ามทัพหลวงรุกล้ำสำนักยุทธ์ ใช้เพียงสัมปทานเหมืองเป็นสื่อกลาง',
      causeOfFallTh: 'คลังเงินร่อยหรอจากสงครามสามด่านจินอิ๋นจนออกตั๋วเงินเฟ้อ บวกภัยแล้งและศึกชิงบัลลังก์ในนครอิ๋นตู',
      ruinsAndLegacyTh: 'ห้องนิรภัยตราชั่งเงินอิ๋นตูและระบบมาตรฐานชั่งตวงวัดยุคโบราณ',
      reusableHooks: ['ห้องนิรภัยกลไกน้ำหนักแห่งอิ๋นตู']
    },
    {
      id: 'FKING_E30_JINYU_COVENANT_LEAGUE',
      nameTh: 'สหพันธ์แคว้นสัญญาจินอวี้ (金玉盟國 — Jinyu Covenant League)',
      eraSpanTh: 'ยุคที่ 30 ปีที่ 208 → ยุคที่ 34 ปีที่ 298 (4,090 ปี)',
      regionTh: 'ลุ่มน้ำการค้าเจ็ดสายและชายฝั่งท่าเรือตะวันออก',
      founderTh: 'อัครเสนาบดี จินอวี้ซวน และเจ็ดเจ้าเมืองท่า',
      dominantPaths: ['MERCANTILE_DAO', 'BLOOD_CONTRACT_NOTARY'],
      governanceStyleTh: 'สหพันธ์เจ็ดนครรัฐการค้า บริหารผ่านสภาเจ็ดหยกและสมุดสัญญาโลหิตร่วมกัน',
      realmSeparationStanceTh: 'ยึดกฎ "น้ำบ่อไม่ยุ่งกับน้ำคลอง" ห้ามจ้างสำนักยุทธ์มารบแทนทหารเรือในศึกแคว้น',
      causeOfFallTh: 'คดีปลอมสมุดสัญญาโลหิตกลางสภาเจ็ดหยกจุดชนวนสงครามกลางเมืองระหว่างสามนครรัฐกับสี่นครรัฐจนแตกสลาย',
      ruinsAndLegacyTh: 'ซากท่าเรือเจ็ดหยก คลองพันเรือ และหอทะเบียนสัญญาจมน้ำ',
      reusableHooks: ['หอทะเบียนสัญญาจมน้ำแห่งสภาเจ็ดหยก']
    }
  ]);

  const FALLEN_SECTS = Object.freeze([
    {
      id: 'FSECT_E29_OATH_CHARTER_TRIBUNAL',
      nameTh: 'ศาลธรรมนูญสัตย์สาบาน (誓憲裁判庭 — Oath-Charter Tribunal)',
      eraSpanTh: 'ยุคที่ 29 ปีที่ 515 → ยุคที่ 34 ปีที่ 772 (5,257 ปี · ยุบสำนักเอง)',
      locationTh: 'ลานศิลาเก้าแท่นและหอจดหมายเหตุเมฆาขาว',
      founderTh: 'มหาตุลาการ ซือหม่าเหิง',
      status: 'VOLUNTARILY_DISSOLVED_SEALED',
      corePaths: ['LEG_OATH_JUDGE_WARDEN', 'LEG_SUB_VOW_WITNESS', 'LEG_SUB_TRUTH_LANTERN', 'LEG_SUB_BLOOD_DEBT_BAILIFF', 'TRANS_FIELD_CLAUSE_SOVEREIGN', 'TRANS_SUB_EQUAL_GROUND', 'TRANS_SUB_TRUCE_BOUNDARY'],
      doctrineTh: 'ยึดสามเสาหลัก "คำสัตย์ต้องมีพยาน สงครามต้องมีขอบเขต และพันธะต้องมีทางตัด" เป็นศาลกลางยุทธภพที่ไม่ขึ้นกับราชสำนักใด',
      fallAndTransitionTh: 'ศิลาธรรมนูญแม่ร้าวในสงครามลานเสมอภาค (ยุคที่ 33) ก่อนกงซุนเจิ้งยุบศาลในปีที่ 772 ยุคที่ 34 และหลอมเจตจำนงสู่พ่านกวนสือ',
      legacyTh: 'มรดกวิถีผู้คุมสัตย์สาบาน ธรรมนูญฟ้าขีดเขต และชุด RES_V320_ARCHIVIST_RELIC กับ RES_V320_TWIN_STAR_BOND',
      reusableHooks: ['ซากหอพิพากษาลานเก้าตาชั่ง']
    },
    {
      id: 'FSECT_E29_HALL_OF_NINE_FORBIDDEN_KEYS',
      nameTh: 'หอผู้ถือกุญแจผนึกทั้งเก้า (九禁鑰閣 — Hall of Nine Forbidden Keys)',
      eraSpanTh: 'ยุคที่ 29 ปีที่ 515 → ยุคที่ 34 ปีที่ 772 (5,257 ปี · ปิดผนึกใต้ดิน)',
      locationTh: 'โถงกรงผนึกศาสตราเก้าชั้น ใต้หุบเขาหินสีเทา',
      founderTh: 'เจ้าหอกุญแจ กู้เซวียนกวน',
      status: 'SEALED_UNDERGROUND_VAULT',
      corePaths: ['TRANS_SEALKEEPER_FORBIDDEN_KEY', 'TRANS_SUB_KEYBEARER_LOCK', 'TRANS_SUB_TABOO_DAMPER', 'TRANS_SUB_RELIC_CAGE'],
      doctrineTh: 'สำนักเงาคู่ขนานของศาลธรรมนูญ รวบรวมและกักขังศาสตราต้องสาป ค่ายกลเชื่อมชีพจรหมู่ และดักแด้พันธะด้วยระบบถ่วงดุลกุญแจเก้าดอก',
      fallAndTransitionTh: 'ถูกโม่เซียวเหยียนชิงกุญแจดอกที่สามกับเจ็ดในยุคที่ 32 หลังดอกที่เจ็ดระเบิด เสิ่นซั่วกวนจึงปิดตายโถงผนึกและมอบแปดกุญแจให้พ่านกวนสือพิทักษ์',
      legacyTh: 'ดันเจี้ยนกรงผนึกศาสตราใต้ดินที่เก็บของวิเศษต้องห้ามแห่งยุคกลาง',
      reusableHooks: ['ดันเจี้ยนกรงผนึกศาสตราทั้งเก้าชั้น', 'ปริศนาห้องผนึกที่เจ็ด']
    },
    {
      id: 'FSECT_E32_MOQI_RETURNING_BOND_SECT',
      nameTh: 'สำนักพันธะหวนคืน · ม่อชี่เหมิน (墨契還宗 — Moqi Returning-Bond Sect)',
      eraSpanTh: 'ยุคที่ 32 ปีที่ 360 → ยุคที่ 33 ปีที่ 305 (945 ปี · ถูกกวาดล้าง)',
      locationTh: 'หุบผาร้อยศิลาแนวเขาตะวันตก',
      founderTh: 'ผู้ทรยศกุญแจ โม่เซียวเหยียน',
      status: 'ANNIHILATED_IN_SECT_WAR',
      corePaths: ['TRANS_SEALKEEPER_FORBIDDEN_KEY', 'LEG_SUB_BLOOD_DEBT_BAILIFF'],
      doctrineTh: 'ลัทธินอกรีตที่บิดเบือนตำนานอวี้จิง วิจัย "ข่ายพันธะย้อนศร" เพื่อปล้นปราณสัตย์สาบานของสำนักอื่น',
      fallAndTransitionTh: 'ถูกศาลธรรมนูญและหอกุญแจกวาดล้างสิ้นซากในมหาสงครามลานเสมอภาค (ยุคที่ 33 ปีที่ 305)',
      legacyTh: 'คำเตือนซ้ำสองเรื่องอันตรายของค่ายกลเชื่อมชีพจรหมู่',
      reusableHooks: ['ซากถ้ำทดลองข่ายพันธะย้อนศร']
    }
  ]);

  const LEGENDARY_RELICS_AND_TECHNIQUES = Object.freeze([
    {
      id: 'RELIC_E31_ARCHIVIST_RELIC_SET',
      gameRefId: 'RES_V320_ARCHIVIST_RELIC',
      type: 'RESONANCE_SET',
      tier: 7,
      nameTh: 'ชุดอาลักษณ์บันทึกวีรกรรม (RES_V320_ARCHIVIST_RELIC)',
      creatorTh: 'ปราชญ์อาลักษณ์ เหวินชิงจือ (ยุคที่ 31)',
      originTh: 'หลอมจากหยกหมึกบริสุทธิ์ พู่กันขนหงส์ขาว และม้วนคำพิพากษาสองพันปีรวมถึงสำเนาพยานคืนราตรีโม่หมิงของลู่เจาเหวิน',
      mechanismTh: 'กระตุ้นพลังพ้องก้องแห่งความทรงจำ เสริมสาย LEG_OATH_JUDGE_WARDEN วิเคราะห์จุดอ่อนศัตรู และต้านทานการบิดเบือนจิตใจ',
      currentFateTh: 'ศิษย์รุ่นสุดท้ายแยกฝากตามหอสมุดลับทั่วทวีปในคืนสิ้นปีของยุคที่ 34',
      reusableHooks: ['เชื่อมโยงกับ RES_V320_ARCHIVIST_RELIC ในเกม']
    },
    {
      id: 'RELIC_E31_TWIN_STAR_BOND_SET',
      gameRefId: 'RES_V320_TWIN_STAR_BOND',
      type: 'RESONANCE_SET',
      tier: 7,
      nameTh: 'ชุดดาราคู่พันธะนิรันดร์ (RES_V320_TWIN_STAR_BOND)',
      creatorTh: 'หลินซวงซิง และ เซียวเจี้ยนเหิง (ยุคที่ 31)',
      originTh: 'ประดิษฐ์ขึ้นเพื่อตอบโจทย์โศกนาฏกรรมอวี้จิง จำกัดวงจรพันธะเพียงสองดวงจิตพร้อมกลไกตัดวงจรอัตโนมัติ',
      mechanismTh: 'เชื่อมปราณดาราคู่ถ่ายเทโล่และจังหวะโจมตี หากฝ่ายหนึ่งต้องพิษสะท้อนพันธะหรือละอองหมึก วงจรจะดีดตัวตัดทันที',
      currentFateTh: 'แบ่งเก็บเป็นสองครึ่ง (ดาราเหนือ–ดาราใต้) ในหอดูดาวคู่และคลังลับศาลธรรมนูญ',
      reusableHooks: ['เชื่อมโยงกับ RES_V320_TWIN_STAR_BOND ในเกม', 'แก้ทางบอสโม่หมิง']
    },
    {
      id: 'RELIC_E29_NINE_FORBIDDEN_KEYS',
      gameRefId: 'TRANS_SEALKEEPER_FORBIDDEN_KEY',
      type: 'FORBIDDEN_ARTIFACT_SET',
      tier: 7,
      nameTh: 'กุญแจผนึกทั้งเก้าแห่งกู้เซวียนกวน (九禁鑰)',
      creatorTh: 'เจ้าหอกุญแจ กู้เซวียนกวน (ยุคที่ 29)',
      originTh: 'หลอมจากโลหะนิลอุกกาบาตเพื่อล็อกกรงผนึกศาสตราทั้งเก้าชั้น แต่ละดอกสะกดพลังต้องห้ามเฉพาะแขนง เช่น ดอกที่สามสะกดหนี้โลหิต และดอกที่เจ็ดสะกดรังไหมพันธะ',
      mechanismTh: 'ใช้ร่วมกับ TRANS_SUB_KEYBEARER_LOCK, TRANS_SUB_TABOO_DAMPER และ TRANS_SUB_RELIC_CAGE ผนึกไม้ตายศัตรูและกักขังศาสตรา',
      currentFateTh: 'แปดดอกฝังในแผ่นอกพ่านกวนสือ ส่วนดอกที่เจ็ดแตกสลายในหุบผาร้อยศิลา',
      reusableHooks: ['กุญแจเปิดห้องลับกรงผนึกศาสตรา', 'ภารกิจตามหาเศษกุญแจดอกที่เจ็ด']
    },
    {
      id: 'TECH_E29_EQUAL_GROUND_CHARTER',
      gameRefId: 'TRANS_FIELD_CLAUSE_SOVEREIGN',
      type: 'TRANSCENDENT_TECHNIQUE',
      tier: 7,
      nameTh: 'มหาอาณาเขตธรรมนูญฟ้าขีดเขต · ลานเสมอภาคและเขตสงบศึก',
      creatorTh: 'มหาตุลาการ ซือหม่าเหิง (ยุคที่ 29)',
      originTh: 'สุดยอดวิชาเขตแดนประจำศาลธรรมนูญ แบ่งเป็น TRANS_SUB_EQUAL_GROUND และ TRANS_SUB_TRUCE_BOUNDARY',
      mechanismTh: 'พื้นเสมอภาคกดทับส่วนต่างพลังปราณและบัฟผิดธรรมชาติ ส่วนเขตสงบศึกสะท้อนความเสียหายใส่ผู้ชิงลงมือก่อนผิดกติกา',
      currentFateTh: 'จารึกฉบับสมบูรณ์อยู่บนหลังค้อนศิลาของพ่านกวนสือ',
      reusableHooks: ['แกนกลไกบอสพ่านกวนสือ', 'ตำราลับ TRANS_FIELD_CLAUSE_SOVEREIGN']
    },
    {
      id: 'RELIC_E31_TRUTH_LANTERN_AND_BAILIFF_CHAIN',
      gameRefId: 'LEG_OATH_JUDGE_WARDEN',
      type: 'LEGENDARY_DUAL_RELIC',
      tier: 6,
      nameTh: 'โคมส่องสัจจะหยกขาว และ โซ่ตระเวนหนี้โลหิต',
      creatorTh: 'ศาลธรรมนูญสัตย์สาบาน (ยุคที่ 30–31)',
      originTh: 'ศาสตราคู่ประจำสาย LEG_SUB_TRUTH_LANTERN และ LEG_SUB_BLOOD_DEBT_BAILIFF',
      mechanismTh: 'โคมส่องสัจจะสลายมายาและเปิดโปงผู้ผิดสัตย์ ส่วนโซ่ตระเวนหนี้โลหิตติดตามและทวีแรงรัดตามบาปพันธะ',
      currentFateTh: 'โคมหายไปพร้อมหลินซวงซิง ส่วนโซ่ผนึกไว้ในโถงชั้นที่สามของกรงผนึกศาสตรา',
      reusableHooks: ['รางวัลชั้นกลางของกรงผนึกศาสตรา']
    },
    {
      id: 'RELIC_E30_GOLDEN_ABACUS_OF_YINHENG',
      gameRefId: 'GOLDEN_ABACUS_ARBITER',
      type: 'MERCANTILE_RELIC',
      tier: 6,
      nameTh: 'ลูกคิดทองคำหลวงอิ๋นเหิง และ ตราประทับสัญญาโลหิตจินอวี้',
      creatorTh: 'อิ๋นเจิ้นเหิง และ จินอวี้ซวน (ยุคที่ 30)',
      originTh: 'สองศาสตราฝ่ายพาณิชย์ (MERCANTILE_DAO) คุมบัญชีคลังหลวงและรับรองสัญญาข้ามแคว้น',
      mechanismTh: 'ลูกคิดทองคำ (GOLDEN_ABACUS_ARBITER) แปรทรัพย์เป็นเกราะคุ้มครอง ส่วนตราประทับ (BLOOD_CONTRACT_NOTARY) บังคับข้อตกลงการค้า',
      currentFateTh: 'ลูกคิดสูญหายในหอคลังอิ๋นตู ส่วนตราประทับจมอยู่ใต้สภาเจ็ดหยก',
      reusableHooks: ['สมบัติสาย MERCANTILE_DAO เพิ่มรายได้และการทูตสำนัก']
    }
  ]);

  // บอสผู้พิทักษ์ดันเจี้ยน (เคารพเพดานโลกเบื้องล่างระดับ Tier 7 สูงสุด)
  const CALAMITY_BEAST_OR_BOSS_SPEC = Object.freeze({
    id: 'BOSS_E34_PANGUANSHI_FACELESS_MAGISTRATE',
    codeName: 'FACELESS_STONE_MAGISTRATE_PANGUANSHI',
    nameTh: 'ตุลาการศิลาไร้หน้า · พ่านกวนสือ (無面判官石)',
    epithetTh: 'ผู้พิทักษ์กรงผนึกศาสตรา · ตราชั่งไร้เมตตาแห่งธรรมนูญเก้าตาชั่ง',
    entityType: 'ANCIENT_CHARTER_CONSTRUCT',
    realmCeilingNoteTh: 'ระดับพลังภายใต้เพดานโลกเบื้องล่าง (Tier 7 Apex Guardian Construct) อาศัยอาณาเขตธรรมนูญและกุญแจแปดดอกในกรงผนึกศาสตรา',
    element: 'EARTH_METAL',
    secondaryElement: 'ORDER_SEAL',
    linkedGamePaths: [
      'TRANS_FIELD_CLAUSE_SOVEREIGN',
      'TRANS_SUB_EQUAL_GROUND',
      'TRANS_SUB_TRUCE_BOUNDARY',
      'LEG_OATH_JUDGE_WARDEN',
      'LEG_SUB_VOW_WITNESS',
      'LEG_SUB_TRUTH_LANTERN',
      'LEG_SUB_BLOOD_DEBT_BAILIFF',
      'TRANS_SEALKEEPER_FORBIDDEN_KEY',
      'TRANS_SUB_KEYBEARER_LOCK',
      'TRANS_SUB_TABOO_DAMPER',
      'TRANS_SUB_RELIC_CAGE'
    ],
    originTh: 'ถือกำเนิดในคืนสิ้นปีของยุคที่ 34 ปีที่ 772 เมื่อกงซุนเจิ้งและเสิ่นซั่วกวนหลอมศิลาธรรมนูญ กุญแจแปดดอก และเจตจำนงการพิพากษาเฮือกสุดท้ายเข้ากับรูปสลักศิลาไร้หน้าเพื่อเฝ้ากรงผนึกศาสตรา',
    appearanceTh: 'รูปสลักศิลาสีเทาสูงสามจั้ง ใบหน้าเรียบไร้ตาปาก มีเส้นตาชั่งทองพาดหน้าผาก แผ่นอกฝังรูกุญแจเก้าช่องซึ่งเสียบกุญแจนิลไว้แปดดอกและเว้นว่างช่องที่เจ็ดที่มีรอยร้าวสีหมึก มือขวาถือค้อนธรรมนูญ มือซ้ายถือโซ่ตราชั่ง',
    judgmentPhilosophyTh: 'พิพากษาผู้บุกรุกตามน้ำหนักคำสัตย์และกติกาอาณาเขต ผู้ผิดคำสาบานหรือใช้วิชาต้องห้ามรับทัณฑ์ทวีคูณ ส่วนผู้สู้ตามกติกาอย่างเที่ยงธรรมมีสิทธิ์รับมรดกโดยชอบธรรม',
    currentStatus: 'ACTIVE_DUNGEON_GUARDIAN',
    dungeonLocationTh: 'โถงกรงผนึกศาสตรา ใต้หุบเขาหินสีเทา (แดนกลาง–ตะวันออก)',
    futureBossDesignHooks: Object.freeze({
      suggestedTier: 7,
      bossArchetype: 'LAW_ENFORCER_FIELD_CONTROLLER',
      passiveMechanicTh: 'ตราชั่งน้ำหนักคำสัตย์ (Weight of Oaths) — สแกนประวัติการผิดคำสัตย์หรือสถานะต้องห้ามของทีม ศิษย์ที่มีรอยด่างพร้อยจะติดดีบัฟ "ทัณฑ์พยาน" รับความเสียหายเพิ่มและฟื้นปราณช้าลง',
      phase1Th: 'เฟส 1: เขตสงบศึก (TRANS_SUB_TRUCE_BOUNDARY) — กางวงแหวนศิลาบังคับประกาศเจตนา หากใช้ทักษะต้องห้ามหรือบัฟซ้อนเกินสามชั้นก่อนครบเงื่อนไข จะสะท้อนความเสียหายและล็อกทักษะด้วยกุญแจดอกที่หนึ่ง–สอง',
      phase2Th: 'เฟส 2: ลานเสมอภาคและสะกดวิชาต้องห้าม (HP < 65%) — เปิด TRANS_SUB_EQUAL_GROUND กดทับบัฟชั่วคราว พร้อมคลื่น TRANS_SUB_TABOO_DAMPER และโซ่หนี้โลหิต ต้องใช้กระบวนท่าแม่นยำหรือชุด RES_V320_TWIN_STAR_BOND / RES_V320_ARCHIVIST_RELIC แก้ทาง',
      phase3Th: 'เฟส 3: กรงผนึกแปดกุญแจและรอยร้าวช่องที่เจ็ด (HP < 30%) — เปิด TRANS_SUB_RELIC_CAGE กักขังอาวุธหลักหนึ่งคนต่อรอบ จุดอ่อนคือ "ช่องกุญแจที่เจ็ดที่ว่างเปล่า" ใช้โคมส่องสัจจะหรือพลังพยานโจมตีตอนตาชั่งเอียงเพื่อทำลายเกราะศิลา',
      peacefulResolutionHookTh: 'หากหัวหน้าทีมสวม RES_V320_ARCHIVIST_RELIC หรือมีศิษย์สาย LEG_OATH_JUDGE_WARDEN ที่ไม่เคยผิดคำสัตย์ เมื่อ HP < 15% พ่านกวนสือจะหยุดมือ รับรองผู้สืบทอด และเปิดคลังมรดกธรรมนูญโดยสันติ',
      potentialDrops: Object.freeze([
        'เศษศิลาธรรมนูญเก้าตาชั่ง (วัตถุดิบหลอมระดับ 7)',
        'แบบจำลองกุญแจผนึกศาสตรา (ปลดล็อกสาย TRANS_SEALKEEPER_FORBIDDEN_KEY)',
        'ชิ้นส่วนชุด RES_V320_ARCHIVIST_RELIC (ชุดอาลักษณ์บันทึกวีรกรรม)',
        'ชิ้นส่วนชุด RES_V320_TWIN_STAR_BOND (ชุดดาราคู่พันธะนิรันดร์)',
        'คัมภีร์อรรถาธิบายลานเสมอภาค (ตำราลับสาย TRANS_FIELD_CLAUSE_SOVEREIGN)'
      ])
    })
  });

  JD.LORE_CHRONICLE_E29_E34_CHARTER = Object.freeze({
    META,
    EVENTS,
    FIGURES,
    FALLEN_KINGDOMS,
    FALLEN_SECTS,
    LEGENDARY_RELICS_AND_TECHNIQUES,
    CALAMITY_BEAST_OR_BOSS_SPEC
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
