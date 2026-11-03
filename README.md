# JianghuSect Evolution — v2.0.24

เกมบริหารสำนักและยุทธภพ เล่นได้จาก [ไฟล์เกมออฟไลน์](GAME_SOURCE/JianghuSect_single.html) หรือเปิด [เกมจากไฟล์ต้นฉบับ](GAME_SOURCE/index.html)

Source, data, assets, tests and build tools are in [GAME_SOURCE](GAME_SOURCE/). Project guidance is in [AGENTS.md](AGENTS.md), with subsystem references in `.agents/skills/`. See the [v2.0.24 report](PATCH_IMPLEMENTATION_REPORT_V2_0_24.md) for the world atlas and validation results. The roadmap and legendary content reference are retained for future development.

```bash
cd GAME_SOURCE
node tools/build_single.js
node tools/validate_data_schema.js
node tools/run_parallel_tests.js
```
