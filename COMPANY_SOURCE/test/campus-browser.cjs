"use strict";
// Run with npm run test:campus after installing Playwright and Chromium.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
let server, browser, address;

test.before(async () => {
  server = http.createServer((req, res) => {
    const file = path.resolve(root, "." + decodeURIComponent(new URL(req.url, "http://local").pathname));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    fs.readFile(file, (err, data) => {
      if (err) return res.writeHead(404).end();
      res.setHeader("Content-Type", file.endsWith(".html") ? "text/html; charset=utf-8" : file.endsWith(".css") ? "text/css" : "text/javascript");
      res.end(data);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  address = "http://127.0.0.1:" + server.address().port;
  const executablePath = process.env.CHROMIUM_PATH || (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
  browser = await chromium.launch({ headless: true, executablePath, args: ["--no-sandbox"] });
});
test.after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
});

async function openGame(viewport = { width: 390, height: 844 }, file = "index.html") {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, isMobile: viewport.width < 600, hasTouch: viewport.width < 600 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.scale;
    CanvasRenderingContext2D.prototype.scale = function (x, y) {
      if (this.canvas.id === "map") window.__mapZoom = x;
      return original.call(this, x, y);
    };
  });
  const response = await page.goto(address + "/" + file);
  assert.equal(response.status(), 200);
  await page.waitForFunction(() => window.CompanyDebug && window.__mapZoom);
  return { page, errors };
}

test("mobile selection card can be closed and remains closed as the simulation updates", async () => {
  const { page, errors } = await openGame();
  try {
    await page.evaluate(() => CompanyDebug.openPersonSheet(CompanyDebug.app.snapshot().people[0].id));
    await page.locator("#shClose").click();
    if (process.env.COMPANY_SCREENSHOTS_DIR) {
      fs.mkdirSync(process.env.COMPANY_SCREENSHOTS_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.COMPANY_SCREENSHOTS_DIR, "mobile-selection.png") });
    }
    const close = page.getByRole("button", { name: "ปิดข้อมูลตัวละคร" });
    assert.equal(await close.count(), 1, "selection card must have its own close button");
    await close.click();
    assert.equal(await page.locator("#selInfo").isVisible(), false);
    await page.evaluate(() => CompanyDebug.app.advance(5));
    await page.waitForTimeout(250);
    assert.equal(await page.locator("#selInfo").isVisible(), false);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test("zoom buttons and two-finger pinch change the actual canvas camera", async () => {
  const { page, errors } = await openGame();
  try {
    const initial = await page.evaluate(() => window.__mapZoom);
    await page.locator("#fZoomIn").click();
    await page.waitForFunction((z) => window.__mapZoom > z, initial);
    const afterButton = await page.evaluate(() => window.__mapZoom);
    await page.evaluate(() => {
      const canvas = document.querySelector("#map");
      const send = (type, id, x, y) => canvas.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: id, pointerType: "touch", clientX: x, clientY: y }));
      send("pointerdown", 31, 120, 400); send("pointerdown", 32, 220, 400);
      send("pointermove", 32, 280, 400);
      send("pointerup", 31, 120, 400); send("pointerup", 32, 280, 400);
    });
    await page.waitForTimeout(120);
    const afterPinch = await page.evaluate(() => window.__mapZoom);
    assert.ok(afterPinch > afterButton, "spreading two fingers should zoom in");
    await page.evaluate(() => {
      const canvas = document.querySelector("#map");
      const send = (type, id, x, y) => canvas.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: id, pointerType: "touch", clientX: x, clientY: y }));
      send("pointerdown", 41, 100, 400); send("pointerdown", 42, 260, 400);
      send("pointermove", 42, 200, 400);
      send("pointerup", 41, 100, 400); send("pointerup", 42, 200, 400);
    });
    await page.waitForTimeout(120);
    assert.ok(await page.evaluate(() => window.__mapZoom) < afterPinch, "pinching fingers together should zoom out");
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test("company management is observational while Edit Hub can grant an item to stock", async () => {
  const { page, errors } = await openGame();
  try {
    await page.locator('#hudBottom [data-nav="policy"]').click();
    assert.equal(await page.locator("#shBody input, #shBody select").count(), 0, "CEO policy and finance should be read-only");
    await page.locator('#hudBottom [data-nav="campus"]').click();
    await page.getByRole("button", { name: "การขยายนิคมและสถานี" }).click();
    assert.equal(await page.getByRole("button", { name: /ขยายที่ดินนิคม/ }).count(), 0);
    await page.locator('#hudBottom [data-nav="menu"]').click();
    await page.getByRole("button", { name: /ศูนย์แก้ไข \(Edit Hub\)/ }).click();
    await page.getByLabel("เลือกวัตถุดิบ").selectOption("pcb");
    await page.getByLabel("จำนวนวัตถุดิบ").fill("7");
    const before = await page.evaluate(() => CompanyDebug.app.snapshot().inventory.materials.pcb);
    await page.getByRole("button", { name: "เสกวัตถุดิบ" }).click();
    const after = await page.evaluate(() => CompanyDebug.app.snapshot().inventory.materials.pcb);
    assert.equal(after, before + 7);
    assert.equal(await page.getByLabel("เลือกตัวละคร").count(), 1);
    const personId = await page.evaluate(() => CompanyDebug.app.snapshot().people[1].id);
    await page.getByLabel("เลือกตัวละคร").selectOption(personId);
    await page.getByLabel("เลือกนิสัยหรือค่านิยม").selectOption("personality:sociability");
    await page.getByLabel("ค่านิสัยหรือค่านิยม").fill("72");
    await page.getByRole("button", { name: "บันทึกนิสัยหรือค่านิยม" }).click();
    assert.equal(await page.evaluate((id) => CompanyDebug.app.snapshot().people.find((p) => p.id === id).profile.personality.sociability, personId), 72);
    assert.equal(await page.getByRole("button", { name: /อัดฉีดทุน|เพิ่มแต้มวิจัย|ตั้งชื่อเสียง/ }).count(), 0);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test("CEO upgrade is reflected in the building sheet and visibly changes the building", async () => {
  const { page, errors } = await openGame({ width: 1280, height: 800 });
  try {
    const changed = await page.evaluate(() => {
      const app = CompanyDebug.app;
      app.dispatch({ type: "directorEdit", action: "grantCash", amount: 50000000 });
      app.dispatch({ type: "setPolicy", key: "autoAccept", value: true });
      app.advance(1505);
      return app.snapshot().campus.buildings.find((b) => b.level > 1);
    });
    assert.ok(changed, "CEO must invest when adequately funded");
    if (process.env.COMPANY_SCREENSHOTS_DIR) {
      fs.mkdirSync(process.env.COMPANY_SCREENSHOTS_DIR, { recursive: true });
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(process.env.COMPANY_SCREENSHOTS_DIR, "desktop-after-upgrade.png") });
    }
    await page.evaluate((id) => CompanyDebug.openBuildingSheet(id), changed.id);
    assert.match(await page.locator("#shBody").innerText(), /ระดับ 2/);
    const different = await page.evaluate((id) => {
      const snap = JSON.parse(JSON.stringify(CompanyDebug.app.snapshot()));
      snap.people = [];
      const canvas = document.createElement("canvas");
      canvas.style.width = "1280px"; canvas.style.height = "800px";
      document.body.append(canvas);
      const renderer = CampusRender.createRenderer(canvas, null);
      const building = snap.campus.buildings.find((b) => b.id === id);
      building.level = 1; renderer.render(snap, 1000, {});
      const oldImage = canvas.toDataURL();
      building.level = 3; renderer.render(snap, 1000, {});
      const changedImage = canvas.toDataURL();
      canvas.remove();
      return oldImage !== changedImage;
    }, changed.id);
    assert.equal(different, true);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test("a new company runs and fulfills orders without player management commands", async () => {
  const { page, errors } = await openGame();
  try {
    const result = await page.evaluate(() => {
      const app = CompanyDebug.app;
      const before = app.save();
      for (let i = 0; i < 10; i++) app.snapshot();
      const snapshotPure = before === app.save();
      app.advance(12 * 1440);
      const view = app.snapshot();
      return { orders: view.orders.length, paid: view.company.metrics.ordersPaid, audit: app.audit(), snapshotPure };
    });
    assert.ok(result.orders > 0 && result.paid > 0, "NPCs should accept and complete at least one order");
    assert.equal(result.snapshotPure, true);
    assert.deepEqual(result.audit, []);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test("desktop and standalone build boot without uncaught errors", async () => {
  for (const file of ["index.html", "CompanyFoundation_single.html"]) {
    const { page, errors } = await openGame({ width: 1280, height: 800 }, file);
    try {
      assert.ok(await page.locator("#map").isVisible());
      await page.waitForTimeout(300);
      if (process.env.COMPANY_SCREENSHOTS_DIR) {
        fs.mkdirSync(process.env.COMPANY_SCREENSHOTS_DIR, { recursive: true });
        await page.screenshot({ path: path.join(process.env.COMPANY_SCREENSHOTS_DIR, "desktop-" + file + ".png") });
      }
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  }
});
