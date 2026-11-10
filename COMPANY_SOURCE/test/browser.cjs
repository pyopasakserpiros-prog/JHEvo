"use strict";
// Optional integration check: Node >=22 WebSocket + a local Chromium executable.
const fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path"),
  http = require("node:http"),
  assert = require("node:assert/strict"),
  { spawn } = require("node:child_process"),
  { pathToFileURL } = require("node:url");
const root = path.resolve(__dirname, ".."),
  sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function connect(url) {
  const net = require("node:net"),
    crypto = require("node:crypto");
  class LocalWS {
    constructor(url) {
      this.listeners = { open: [], message: [], error: [] };
      const u = new URL(url);
      const sock = (this.sock = net.connect(Number(u.port), u.hostname, () => {
        const key = crypto.randomBytes(16).toString("base64");
        sock.write(
          "GET " +
            u.pathname +
            (u.search || "") +
            " HTTP/1.1\r\n" +
            "Host: " +
            u.host +
            "\r\n" +
            "Upgrade: websocket\r\n" +
            "Connection: Upgrade\r\n" +
            "Sec-WebSocket-Key: " +
            key +
            "\r\n" +
            "Sec-WebSocket-Version: 13\r\n\r\n",
        );
      }));
      let upgraded = false,
        buf = Buffer.alloc(0);
      sock.on("error", (e) => this.emit("error", e));
      sock.on("data", (chunk) => {
        buf = Buffer.concat([buf, chunk]);
        if (!upgraded) {
          const idx = buf.indexOf("\r\n\r\n");
          if (idx === -1) return;
          upgraded = true;
          buf = buf.subarray(idx + 4);
          this.emit("open", {});
        }
        while (buf.length >= 2) {
          const b0 = buf[0],
            b1 = buf[1],
            op = b0 & 0x0f;
          let len = b1 & 0x7f,
            offset = 2;
          if (len === 126) {
            if (buf.length < 4) return;
            len = buf.readUInt16BE(2);
            offset = 4;
          } else if (len === 127) {
            if (buf.length < 10) return;
            len = Number(buf.readBigUInt64BE(2));
            offset = 10;
          }
          if (buf.length < offset + len) return;
          const payload = buf.subarray(offset, offset + len);
          buf = buf.subarray(offset + len);
          if (op === 1)
            this.emit("message", { data: payload.toString("utf8") });
          else if (op === 8) sock.end();
        }
      });
    }
    addEventListener(type, fn) {
      if (this.listeners[type]) this.listeners[type].push(fn);
    }
    emit(type, ev) {
      for (const fn of this.listeners[type] || []) fn(ev);
    }
    send(str) {
      const data = Buffer.from(str, "utf8"),
        mask = crypto.randomBytes(4);
      let head;
      if (data.length < 126) {
        head = Buffer.from([0x81, 0x80 | data.length]);
      } else if (data.length < 65536) {
        head = Buffer.alloc(4);
        head[0] = 0x81;
        head[1] = 0x80 | 126;
        head.writeUInt16BE(data.length, 2);
      } else {
        head = Buffer.alloc(10);
        head[0] = 0x81;
        head[1] = 0x80 | 127;
        head.writeBigUInt64BE(BigInt(data.length), 2);
      }
      const masked = Buffer.alloc(data.length);
      for (let i = 0; i < data.length; i++) masked[i] = data[i] ^ mask[i & 3];
      this.sock.write(Buffer.concat([head, mask, masked]));
    }
    close() {
      this.sock.end();
    }
  }
  const WS = typeof WebSocket !== "undefined" ? WebSocket : LocalWS;
  const ws = new WS(url);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  let seq = 0;
  const pending = new Map(),
    handlers = new Map();
  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.id) {
      const item = pending.get(data.id);
      if (!item) return;
      clearTimeout(item.timer);
      pending.delete(data.id);
      data.error
        ? item.reject(Error(data.error.message))
        : item.resolve(data.result);
    } else
      for (const fn of handlers.get(data.method) || [])
        fn(data.params, data.sessionId);
  });
  return {
    send(method, params = {}, sessionId) {
      return new Promise((resolve, reject) => {
        const id = ++seq,
          timer = setTimeout(() => {
            pending.delete(id);
            reject(Error("CDP timeout " + method));
          }, 20000);
        pending.set(id, { resolve, reject, timer });
        ws.send(
          JSON.stringify({
            id,
            method,
            params,
            ...(sessionId ? { sessionId } : {}),
          }),
        );
      });
    },
    on(method, fn) {
      if (!handlers.has(method)) handlers.set(method, []);
      handlers.get(method).push(fn);
    },
    close() {
      for (const p of pending.values()) {
        clearTimeout(p.timer);
        p.reject(Error("connection closed"));
      }
      pending.clear();
      ws.close();
    },
  };
}
(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "company-browser-")),
    chrome = process.env.CHROMIUM_PATH || "/usr/bin/chromium";
  const server = http.createServer((req, res) => {
    const relative = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      ),
      file = path.resolve(root, "." + relative);
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404).end();
        return;
      }
      res.setHeader(
        "Content-Type",
        file.endsWith(".html")
          ? "text/html; charset=utf-8"
          : file.endsWith(".css")
            ? "text/css"
            : file.endsWith(".js")
              ? "text/javascript"
              : "application/octet-stream",
      );
      res.end(data);
    });
  });
  await new Promise((resolve) =>
    server.listen(0, process.env.COMPANY_BROWSER_HOST || "127.0.0.2", resolve),
  );
  const host = process.env.COMPANY_BROWSER_HOST || "127.0.0.2";
  const address = "http://" + host + ":" + server.address().port;
  const child = spawn(
    chrome,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-debugging-port=0",
      "--user-data-dir=" + profile,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  let stderr = "";
  child.stderr.on("data", (data) => {
    stderr += data.toString();
  });
  let childError = null;
  child.on("error", (e) => {
    childError = e;
  });
  let cdp;
  try {
    const portFile = path.join(profile, "DevToolsActivePort");
    for (let i = 0; i < 200 && !fs.existsSync(portFile); i++) {
      if (childError) throw childError;
      if (child.exitCode !== null)
        throw Error("Chromium startup: " + stderr.slice(-1000));
      await sleep(50);
    }
    if (!fs.existsSync(portFile))
      throw Error("Chromium did not start: " + stderr.slice(-1000));
    const [port, endpoint] = fs
      .readFileSync(portFile, "utf8")
      .trim()
      .split("\n");
    cdp = await connect("ws://127.0.0.1:" + port + endpoint);
    const errors = [],
      requests = [];
    cdp.on("Runtime.exceptionThrown", (p) =>
      errors.push(
        p.exceptionDetails.exception?.description || p.exceptionDetails.text,
      ),
    );
    cdp.on("Network.requestWillBeSent", (p) => requests.push(p.request.url));
    for (const [width, height, url] of [
      [1280, 800, address + "/index.html"],
      [
        390,
        844,
        process.env.COMPANY_BROWSER_FILE_URL
          ? pathToFileURL(path.join(root, "CompanyFoundation_single.html")).href
          : address + "/CompanyFoundation_single.html",
      ],
    ]) {
      const { targetId } = await cdp.send("Target.createTarget", {
          url: "about:blank",
        }),
        { sessionId } = await cdp.send("Target.attachToTarget", {
          targetId,
          flatten: true,
        });
      const send = (method, params) => cdp.send(method, params, sessionId),
        evaluate = async (expression) => {
          const r = await send("Runtime.evaluate", {
            expression,
            returnByValue: true,
            awaitPromise: true,
          });
          if (r.exceptionDetails)
            throw Error(
              r.exceptionDetails.exception?.description ||
                r.exceptionDetails.text,
            );
          return r.result.value;
        };
      await send("Runtime.enable");
      await send("Network.enable");
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 500,
      });
      const navigation = await send("Page.navigate", { url });
      if (navigation.errorText)
        throw Error("Navigation: " + navigation.errorText + " " + url);
      let ready = false;
      for (let i = 0; i < 200; i++) {
        if (await evaluate("Boolean(window.CompanyDebug)")) {
          ready = true;
          break;
        }
        await sleep(50);
      }
      assert(
        ready,
        "debug interface initialises: " +
          JSON.stringify(errors) +
          " " +
          (await evaluate(
            "location.href+' | '+document.readyState+' | '+document.body?.innerText.slice(0,150)",
          )),
      );
      assert.equal(
        await evaluate("document.documentElement.scrollWidth<=innerWidth+1"),
        true,
        "no page-wide overflow",
      );
      assert.equal(
        await evaluate("CompanyDebug.app.snapshot().people.length"),
        8,
      );
      await evaluate(
        "document.querySelector('#offers button').click();for(let i=0;i<7;i++)document.getElementById('advance-day').click();",
      );
      assert.equal(
        await evaluate("CompanyDebug.app.snapshot().orders[0].status"),
        "paid",
        "actual UI buttons drive order to payment",
      );
      assert.deepEqual(await evaluate("CompanyDebug.app.audit()"), []);
      const saved = await evaluate("CompanyDebug.app.save()");
      assert.equal(await evaluate('CompanyDebug.app.load("{").ok'), false);
      assert.equal(await evaluate("CompanyDebug.app.save()"), saved);
      await evaluate(
        "document.getElementById('save-local').click();document.getElementById('advance-hour').click();document.getElementById('load-local').click()",
      );
      assert.equal(
        await evaluate("CompanyDebug.app.save()"),
        saved,
        "local save/load restores exact state",
      );
      assert.equal(
        await evaluate(
          "(()=>{const before=CompanyDebug.app.save();for(let i=0;i<30;i++)CompanyDebug.app.snapshot();return before===CompanyDebug.app.save();})()",
        ),
        true,
        "presentation reads stay pure",
      );
      if (process.env.COMPANY_BROWSER_CAPTURE_DIR) {
        fs.mkdirSync(process.env.COMPANY_BROWSER_CAPTURE_DIR, {
          recursive: true,
        });
        const image = await send("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync(
          path.join(
            process.env.COMPANY_BROWSER_CAPTURE_DIR,
            "debug-" + width + ".png",
          ),
          Buffer.from(image.data, "base64"),
        );
      }
      await cdp.send("Target.closeTarget", { targetId });
      console.log(
        "PASS inspection UI " +
          width +
          "×" +
          height +
          " " +
          (url.includes("CompanyFoundation_single")
            ? "embedded standalone"
            : "source HTML"),
      );
    }
    assert.deepEqual(errors, []);
    assert(
      !requests.some((url) => /^https?:/.test(url) && !url.startsWith(address)),
      "no remote runtime requests",
    );
    console.log(
      "PASS actual commands, 7-day fulfilment, local/invalid save handling, immutable reads and no uncaught browser errors",
    );
  } finally {
    if (cdp) {
      try {
        await cdp.send("Browser.close");
      } catch (_) {}
      cdp.close();
    }
    child.kill("SIGTERM");
    await new Promise((resolve) => server.close(resolve));
    for (let i = 0; i < 40 && child.exitCode === null && !childError; i++)
      await sleep(50);
    fs.rmSync(profile, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
