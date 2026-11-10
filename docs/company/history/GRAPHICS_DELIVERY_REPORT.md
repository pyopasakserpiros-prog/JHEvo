# Graphics/UI delivery report — Common Ground v0.2.0

> สถานะหลังผู้ใช้ตรวจ: v0.2.0 ถูกปฏิเสธว่าไม่ตรงเป้าหมาย รายการตรวจด้านล่างเป็นข้อเท็จจริงทางเทคนิคของ build เดิม ไม่ได้ยืนยันว่า gameplay/art direction ผ่าน acceptance. ดู GEMINI_REORIENTATION_HANDOFF.md สำหรับงานต่อ

> สถานะหลังผู้ใช้ตรวจ: v0.2.0 ถูกปฏิเสธว่าไม่ตรงเป้าหมาย รายการตรวจด้านล่างคือข้อเท็จจริงทางเทคนิคของ build เดิม ไม่ได้ยืนยันว่า gameplay/art direction ผ่าน acceptance. ดู GEMINI_REORIENTATION_HANDOFF.md สำหรับงานต่อ

วันที่: 10 พฤศจิกายน 2026

## ผลงาน

- สร้าง player-facing UI ใหม่แทน inspection/debug dashboard เดิม
- เพิ่ม 2D isometric Canvas scene ที่อ่าน office/factory layout จริง และปรับตามการขยายพื้นที่
- เพิ่ม procedural vector worker/station artwork, role/visual variants, activity markers, route hints, selection และ cosmetic motion
- เพิ่ม 5 หน้าจอ Overview / People / Operations / Finance / Research
- เชื่อมปุ่ม/ฟอร์มกับ CompanyAPI จริง: accept/cancel offer/order, buy materials, borrow/repay/pay arrears, policy/OT/wellbeing, role/wage, hire, expand site, install station, time, save/load/import/export
- เพิ่ม UI static/runtime smoke test ครอบคลุมการเริ่ม renderer, map station placement, รับงาน, เดิน simulation 7 วันจน paid, audit และ local save/load
- อัปเดต standalone build และเอกสารรับช่วง

## การตรวจ

| Check | Result |
| --- | --- |
| `npm test` | PASS — 87/87 |
| `npm run check` | PASS |
| `npm run core:check` | PASS — SHA-256 unchanged |
| `npm run build` | PASS — standalone HTML generated |
| `node --check js/debug.js` | PASS |
| HTML IDs / script order / no remote runtime URLs | PASS |
| CSS parse | PASS — 267 rules, 0 parse errors |
| Runtime smoke (DOM/canvas stub) | PASS — scene boot, station install, order paid, audit, save/load |
| Node simulation benchmark | 8 people avg 0.239 ms/tick, p95 0.717 ms; 30 people avg 0.337 ms/tick, p95 1.163 ms |
| Browser screenshot/interaction suite | NOT VERIFIED — managed Chromium policy returned `ERR_BLOCKED_BY_ADMINISTRATOR` for localhost HTTP and `file://`; policy was not bypassed |
| Physical Android performance/touch QA | NOT RUN — no device session available |

Node benchmark measures simulation ticks only; it is not renderer frame time or physical-device FPS.

## Invariants

- `js/human-core.js` unchanged; SHA-256 remains `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`
- `CORE_LOCK.json` unchanged
- Renderer reads snapshots and uses public API commands; no direct world mutation or simulation RNG from drawing/animation
- No CDN, external fonts, remote image, or runtime network dependency
- Save compatibility across future versions is not promised under the current early-development rule

## Workspace and handoff

Input arrived as a ZIP without `.git` metadata. Therefore branch/remote state could not be inspected and no commit/push is claimed. Delivery is returned as a source ZIP plus the standalone HTML build. Run browser QA in an environment that permits local HTTP and repeat touch/FPS QA on the target Android device.
