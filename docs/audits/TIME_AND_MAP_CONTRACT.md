# Time, Speed & Map Architecture Contract (`JS2-v2.6.0` Life Traits & 360×304 Sect Expansion)

## 1. Expanded Sect Compound & Wilderness Geometry (`360×304`)
- **Canvas & Grid Dimensions**:
  - `MAP.W = 360`, `MAP.H = 304`, `MAP.H_BASE = 248`, `MAP.TILE = 16`, `MAP.OX = 84`, `MAP.OY = 56` (`109,440` total tiles, `2.37×` larger than legacy `240×192`).
- **Inner Compound Wall & Sacred Axis**:
  - `WX0 = 72`, `WY0 = 56`, `WX1 = 288`, `WY1 = 204` (`216×148` inner compound).
  - Central Axis: `x = 180` (`96 + OX`), Central Plaza: `x = 164..196, y = 114..132`, Plaza Center `(180, 123)`.
- **Four Directional Wall Gates (`MAP.WALL_GATES`) & Gate Outposts**:
  - **South Gate (`S`, Main)**: `(180, 204)`, `MAP.GATE_IN = (180, 196)`, `MAP.EXIT = (180, 298)`, `gate` (`x=174, y=200, w=12, h=5`).
  - **North Gate (`N`, Back Mountain)**: `(180, 56)`, `gate_north` (`x=176, y=54, w=8, h=4`).
  - **West Gate (`W`, Bamboo & Beast Pass)**: `(72, 123)`, `gate_west` (`x=70, y=120, w=4, h=6`).
  - **East Gate (`E`, Spirit Cliff Pass)**: `(288, 123)`, `gate_east` (`x=286, y=120, w=4, h=6`).
- **8 Sacred Peak Terraces (`PEAK_LAYOUT_SPECS`) & 8 Expansion Plots (`MAP.PLOTS`)**:
  - All 8 peaks sit on dedicated outer-ring compound terraces (`y=60..191`, `x=78..281`) with zero road overlap (`0` blocked road tiles) and zero building-to-building overlap.
  - Dynamic building expansion (`MAP.expandBuilding`) increments `M.topologyRev`, automatically invalidating stale cached paths in `MAP.findPath`.
- **True 4-Gate Routing (`MAP.findPath`)**:
  - Evaluates total Manhattan distance (`NPC → Gate + Gate → Target`) across all 4 directional gates (`S, N, W, E`), picks the shortest valid gate, and falls back to alternative open gates if a gate approaches blocked tiles.
- **Southern Spirit River (`MAP.RIVER_BELT`) & Fishing Stations**:
  - `MAP.SAFE_BELT = { x0: 120, x1: 240, y0: 204, y1: 230 }`.
  - `MAP.RIVER_BELT = { x0: 56, x1: 300, y0: 254, y1: 284 }`, centerline `y ≈ 268`, 3 stone bridges (`x = 92..94`, `x = 178..182`, `x = 264..266`), 4 fishing zones with `26` walkable bank tiles adjacent to water.
- **8 Physical Beast Dens (`W.wildlife.dens`)**:
  - Persistent wilderness structures across all 4 directions (`DEN_NORTH_RIDGE`, `DEN_NORTH_ABYSS`, `DEN_WEST_BAMBOO`, `DEN_WEST_MIASMA`, `DEN_EAST_CLIFF`, `DEN_EAST_THUNDERTREE`, `DEN_SOUTH_MARSH`, `DEN_SOUTH_RIVERBANK`) with obstacle-checked beast movement (`!MAP.blocked(M, nx, ny)`).

## 2. นาฬิกา: วันยาว1.5เท่า โดยไม่คูณเหตุการณ์ปฏิทินซ้ำ

- `SIM.DAY_FACTOR=1.5`, ปฏิทิน1440นาที/วัน, `SIM.WORK_STEPS_PER_DAY=2160` การเดิน/กิจกรรม/ต่อสู้ทำงานทุก work-step
- `SIM.tick`: เพิ่ม `W.workSteps` หนึ่ง, เพิ่ม integer `W.timePhase` สอง; เมื่อ phase>=3 ให้ลบสามและเพิ่ม `W.t` หนึ่งนาที phaseมีค่า0..2 ห้ามสลับไปเป็นเศษทศนิยมโดยยังโหลดด้วยสัญญาเดิม
- `W._isNewCalendarMinute` ระบุว่าขั้นนี้นาทีเปลี่ยนจริงหรือไม่ modulo hooks ของรายชั่วโมง/รายวัน/เทศกาล/จ่ายเงิน/เกิดอสูรที่แก้ต้องเช็คนี้ก่อน ไม่ห่อ SIM.tick ทั้งก้อนจน NPC หยุดทุกสามขั้น
- เมตาบอลิซึม hunger/rest ที่ชดเชยแล้วและ passive cultivation/body practice/mine/forge/craft_tick ใช้ `1/DAY_FACTOR` เพื่อไม่เพิ่มตบะ/ความหิวรายวันตามจำนวน work-step โดยไม่ตั้งใจ เวลารอแบบ timestamp ยังใช้นาทีปฏิทิน กิจกรรมแบบขั้นงานยังใช้ work-step ไม่แปลงทุกระบบเป็นหน่วยเดียวแบบเหมารวม
- `CULT.TRIBULATION.tickAll` กันเรียกซ้ำด้วย lastTickAllWorkStep; การนับรอยชำนาญฟ้าผ่าดู strikesLanded จริง ไม่ดูจำนวนครั้งเรียก

## 3. ความเร็วและการแสดงผล

- ความเร็ว `[0,1,2,4,8,16,32,48,96]`; 1×ร้องขอสี่ work-step/วินาที 96×ร้องขอ384 ไม่ได้ทำให้หนึ่งวันมีงานมากกว่า2160ขั้น
- `main.js` ใช้ `SIM_BUDGET_MS=12` จำกัดเวลาจำลองต่อเฟรม ไม่ใช่ MAX_CATCHUP_TICKS ตามเอกสารรับเข้าเก่า เก็บงานค้างใน accumulator พร้อม runtimeTiming.pendingTicks; เซฟ/โหลดไม่ตัด backlog ที่100800อีก
- ลดการวาดที่96×เป็น20fps, >=32×เป็น30fps, >=16×เป็น40fps; งบจำลองยังขึ้นกับ CPU และต้นทุน UI/render
- การวัด throughput ต้องหารด้วย delta `W.workSteps` ไม่ใช่ delta `W.t` เพราะปฏิทินช้าลง1.5เท่า ปุ่ม96×ทำงานไม่ได้ยืนยัน sustained96ทุกเครื่อง ผลทดสอบ80NPC isolated2.788ms/step คิดเป็นเพดานทฤษฎี89.7×ก่อนต้นทุน render/UI ไม่ใช่ผลมือถือผู้ใช้

## 4. เซฟและหลักฐาน

เซฟปัจจุบันเก็บ workSteps/timePhase และหลักฐานระหว่างศึก f.lifeEvidence/lifeDamage/lifeSupport/lifeSettled; ห้ามใส่เฉพาะ _tac ที่ serializer ลบทิ้ง เริ่ม ET/AM state เมื่อสร้าง NPC เพื่อให้การเปิด UI ไม่เปลี่ยน world และโหลดแล้ว canonical ตรงต้นฉบับ ไม่กำหนดงานรองรับเซฟเก่า; โค้ด migration ที่รับมาบางส่วนยังอยู่แต่ไม่ใช่ข้อยืนยันว่าครอบคลุมทุกเซฟประวัติ

แผนที่และจำนวนด้านบนตรวจด้วย life_traits_map_time_suite/fishing_river_suite และ regression ที่เกี่ยวข้อง การวัดเวลาเดินต้องอ่าน act.stage==='move' ไม่ใช่ 'walk': seed repair-final-80 รวม12,420ขั้น/6ขอบวัน ใช้เวลาเดิน309,284จาก993,600 NPC-step (31.13%) สมาชิก80คนยังอยู่ครบและมีการกิน/นอน/งาน/ฝึก/รักษา/สู้จริง ไม่สรุปว่าทุก seed หรือทุกตบะมีสัดส่วนนี้ ดู [รายงาน](../../PATCH_REPORTS/260C_REPAIR_JS2_V2_6_0.md)
