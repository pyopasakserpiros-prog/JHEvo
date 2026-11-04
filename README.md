# JianghuSect Evolution — v2.0.28

เกมบริหารสำนักและยุทธภพ เล่นได้จาก [ไฟล์เกมออฟไลน์](GAME_SOURCE/JianghuSect_single.html) หรือเปิด [เกมจากไฟล์ต้นฉบับ](GAME_SOURCE/index.html)

Source, data, assets, tests and build tools are in [GAME_SOURCE](GAME_SOURCE/). Project guidance is in [AGENTS.md](AGENTS.md), with subsystem references in `.agents/skills/`. See the [v2.0.24 report](PATCH_IMPLEMENTATION_REPORT_V2_0_24.md) for the world atlas and its validation results. The roadmap and legendary content reference are retained for future development.

```bash
cd GAME_SOURCE
node tools/build_single.js
node tools/validate_data_schema.js
node tools/run_parallel_tests.js
```

Package 2.0.25 was imported from the Gemini branch archive. Its runtime patch identifier remains 2.0.24. The import audit found seven referenced suites missing from the archive (v215–v219, v222, and v225); the full test matrix also reported failures in trade-pact and realm-rank checks. Browser suites require a configured browser. Investigate these before claiming release readiness.

รายละเอียดแพตช์สายสืบทอด: [v2.0.26 report](PATCH_IMPLEMENTATION_REPORT_V2_0_26.md)

รายละเอียดผังสายสืบทอดและพงศาวดาร: [v2.0.27 report](PATCH_IMPLEMENTATION_REPORT_V2_0_27.md)

รายละเอียดหน้าบรรพชน: [v2.0.28 report](PATCH_IMPLEMENTATION_REPORT_V2_0_28.md)

ข้อเสนอแพตช์ถัดไปสำหรับ AGY: [สำนักเติบโต–ตกต่ำและบุตรสวรรค์](docs/proposals/next_dynamic_sects_heavenly_talents.md) (ยังเป็นข้อเสนอ ไม่ใช่งานที่พัฒนาแล้ว)
