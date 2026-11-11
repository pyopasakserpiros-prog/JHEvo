(function (root, factory) {
  "use strict";
  const value = factory();
  if (typeof module === "object" && module.exports) module.exports = value;
  else root.CampusRender = value;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const TS = 32; // Base pixels per tile in world space
  const PAD_X = 6; // Extra meadow tiles around layout
  const PAD_Y = 6;
  const FONT = '"Noto Sans Thai","Sarabun","Leelawadee UI",system-ui,sans-serif';

  const ROLE_STYLE = {
    sales: {
      cloth: "#2b5c8f",
      trim: "#f0c96b",
      badge: "#58b8f6",
      hat: null,
      labelTh: "ฝ่ายขาย B2B",
    },
    admin: {
      cloth: "#2e6f65",
      trim: "#a8e6cf",
      badge: "#58d68d",
      hat: null,
      labelTh: "จัดซื้อ/บัญชี",
    },
    engineer: {
      cloth: "#e8eef2",
      trim: "#3898ec",
      badge: "#b794f4",
      hat: "glasses",
      labelTh: "วิศวกร R&D",
    },
    assembler: {
      cloth: "#365880",
      trim: "#f5b041",
      badge: "#f5b041",
      hat: "cap",
      labelTh: "ช่างฝ่ายผลิต",
    },
    inspector: {
      cloth: "#6e4e2e",
      trim: "#f4d03f",
      badge: "#eccf82",
      hat: "visor",
      labelTh: "ผู้ตรวจ QC",
    },
    logistics: {
      cloth: "#4d6b3c",
      trim: "#e67e22",
      badge: "#76d7c4",
      hat: "cap",
      labelTh: "คลังและจัดส่ง",
    },
    coordinator: {
      cloth: "#2c3440",
      trim: "#e74c3c",
      badge: "#f1948a",
      hat: null,
      labelTh: "ผู้บริหาร/CEO",
    },
  };

  const SKIN_TONES = ["#f4cfb0", "#eac09e", "#dfb18b", "#f7d7bc", "#cfa07a"];
  const HAIR_COLORS = ["#23272a", "#3b2e28", "#4e3829", "#2c3539", "#5c4033"];

  const BUILDING_ART = {
    hq: {
      roof: "#266862",
      ridge: "#f2cf66",
      wall: "#efe4c8",
      wood: "#284b52",
      accent: "#38b2ac",
      plaqueBg: "#163532",
      plaqueInk: "#ffe89e",
      style: "hq",
    },
    rnd: {
      roof: "#31496b",
      ridge: "#7ce0ff",
      wall: "#e4ecf2",
      wood: "#2c3e50",
      accent: "#58b8f6",
      plaqueBg: "#1b2b40",
      plaqueInk: "#bfeaff",
      style: "rnd",
    },
    factory: {
      roof: "#434952",
      ridge: "#e69c4c",
      wall: "#d5cfc4",
      wood: "#544236",
      accent: "#f39c12",
      plaqueBg: "#26282c",
      plaqueInk: "#ffd699",
      style: "factory",
    },
    warehouse: {
      roof: "#68552b",
      ridge: "#f0cf68",
      wall: "#dcd4c4",
      wood: "#5c4828",
      accent: "#eab842",
      plaqueBg: "#362b14",
      plaqueInk: "#ffe88a",
      style: "warehouse",
    },
    canteen: {
      roof: "#7d4e32",
      ridge: "#e5c078",
      wall: "#f2e0c4",
      wood: "#8c5636",
      accent: "#e06040",
      plaqueBg: "#482b1b",
      plaqueInk: "#ffe6bd",
      style: "canteen",
    },
    courtyard: {
      roof: "#3e7864",
      ridge: "#d8c690",
      wall: "#e8dec6",
      wood: "#7c583c",
      accent: "#58d68d",
      plaqueBg: "#224438",
      plaqueInk: "#e8f8e0",
      style: "courtyard",
    },
    training: {
      roof: "#475482",
      ridge: "#b7dcf2",
      wall: "#e5e2d6",
      wood: "#354262",
      accent: "#8dbbe4",
      plaqueBg: "#263451",
      plaqueInk: "#e3f2ff",
      style: "training",
    },
    gate: {
      roof: "#2b5664",
      ridge: "#f0cf68",
      wall: "#9c362e",
      wood: "#8c2d26",
      accent: "#eccf82",
      plaqueBg: "#19313a",
      plaqueInk: "#ffe89e",
      style: "gate",
    },
    rawDepot: {
      roof: "#5d4a28",
      ridge: "#f5c542",
      wall: "#e2dac8",
      wood: "#4a3c22",
      accent: "#f39c12",
      plaqueBg: "#2e2412",
      plaqueInk: "#ffeaa0",
      style: "warehouse",
    },
    prodLineB: {
      roof: "#364559",
      ridge: "#58b8f6",
      wall: "#d8dfe6",
      wood: "#283646",
      accent: "#3898ec",
      plaqueBg: "#1a2634",
      plaqueInk: "#bfeaff",
      style: "factory",
    },
    prodLineC: {
      roof: "#2f3848",
      ridge: "#b794f4",
      wall: "#dce0e8",
      wood: "#252c3a",
      accent: "#9f7aea",
      plaqueBg: "#1d1b32",
      plaqueInk: "#e9d8fd",
      style: "factory",
    },
    dispatchHub: {
      roof: "#2d5a4c",
      ridge: "#58d68d",
      wall: "#d8e6df",
      wood: "#1f4236",
      accent: "#38b2ac",
      plaqueBg: "#142e26",
      plaqueInk: "#b8f7d4",
      style: "warehouse",
    },
    execAnnex: {
      roof: "#1f5460",
      ridge: "#ffe082",
      wall: "#ece6d4",
      wood: "#1b3f48",
      accent: "#4fd1c5",
      plaqueBg: "#122b30",
      plaqueInk: "#fff0b3",
      style: "hq",
    },
    maintWorkshop: {
      roof: "#584234",
      ridge: "#f5b041",
      wall: "#dfd6cb",
      wood: "#423126",
      accent: "#e67e22",
      plaqueBg: "#2d2018",
      plaqueInk: "#ffd8a8",
      style: "factory",
    },
    solarPlant: {
      roof: "#1e3a5f",
      ridge: "#7ce0ff",
      wall: "#cfe2f3",
      wood: "#162b46",
      accent: "#ecc94b",
      plaqueBg: "#122438",
      plaqueInk: "#fef08a",
      style: "solar",
    },
    dormitory: {
      roof: "#6e473b",
      ridge: "#f6ad55",
      wall: "#f5ebe1",
      wood: "#54342b",
      accent: "#68d391",
      plaqueBg: "#36211a",
      plaqueInk: "#ffedd5",
      style: "canteen",
    },
    prodLineD: {
      roof: "#1e4d4e",
      ridge: "#4fd1c5",
      wall: "#e0f2f1",
      wood: "#133638",
      accent: "#38b2ac",
      plaqueBg: "#0f292a",
      plaqueInk: "#b2f5ea",
      style: "factory",
    },
    qaLab: {
      roof: "#2b4268",
      ridge: "#90cdf4",
      wall: "#e8f0f8",
      wood: "#1d2e4a",
      accent: "#63b3ed",
      plaqueBg: "#152238",
      plaqueInk: "#bee3f8",
      style: "rnd",
    },
    waterPlant: {
      roof: "#235c52",
      ridge: "#68d391",
      wall: "#d9efe8",
      wood: "#19423b",
      accent: "#48bb78",
      plaqueBg: "#12302a",
      plaqueInk: "#c6f6d5",
      style: "solar",
    },
    expoHall: {
      roof: "#5a3e7a",
      ridge: "#fbd38d",
      wall: "#efe8f6",
      wood: "#3d2954",
      accent: "#d6bcfa",
      plaqueBg: "#2a1b3c",
      plaqueInk: "#feebc8",
      style: "hq",
    },
    refineryMill: {
      roof: "#6b5328",
      ridge: "#f6e05e",
      wall: "#f7f0dc",
      wood: "#4a3819",
      accent: "#ecc94b",
      plaqueBg: "#332610",
      plaqueInk: "#fefcbf",
      style: "warehouse",
    },
    bakeryPlant: {
      roof: "#8c4227",
      ridge: "#fbd38d",
      wall: "#fff5eb",
      wood: "#5c2b19",
      accent: "#ed8936",
      plaqueBg: "#3b1b10",
      plaqueInk: "#feebc8",
      style: "factory",
    },
  };

  function hash2(x, y) {
    let h = Math.imul(x, 73856093) ^ Math.imul(y, 19349663);
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
    return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  function drawPortrait(canvas, person) {
    if (!canvas || !person) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width || 64;
    const h = canvas.height || 64;
    ctx.clearRect(0, 0, w, h);

    const variant = Math.abs(Number(person.visual?.variant || 17));
    const skin = SKIN_TONES[variant % SKIN_TONES.length];
    const hair = HAIR_COLORS[Math.floor(variant / 5) % HAIR_COLORS.length];
    const rs = ROLE_STYLE[person.role] || ROLE_STYLE.assembler;

    const grad = ctx.createRadialGradient(w / 2, h * 0.45, 4, w / 2, h / 2, w * 0.55);
    grad.addColorStop(0, rs.badge + "44");
    grad.addColorStop(1, "#122620");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h * 0.56;
    const s = w / 64;

    ctx.fillStyle = rs.cloth;
    roundRectPath(ctx, cx - 18 * s, cy + 4 * s, 36 * s, 26 * s, 10 * s);
    ctx.fill();

    ctx.fillStyle = "#f4efe1";
    ctx.beginPath();
    ctx.moveTo(cx - 7 * s, cy + 4 * s);
    ctx.lineTo(cx, cy + 14 * s);
    ctx.lineTo(cx + 7 * s, cy + 4 * s);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = rs.trim;
    ctx.beginPath();
    ctx.moveTo(cx - 2.5 * s, cy + 7 * s);
    ctx.lineTo(cx + 2.5 * s, cy + 7 * s);
    ctx.lineTo(cx + 1.5 * s, cy + 22 * s);
    ctx.lineTo(cx - 1.5 * s, cy + 22 * s);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = skin;
    ctx.fillRect(cx - 4 * s, cy - 2 * s, 8 * s, 8 * s);
    ctx.beginPath();
    ctx.arc(cx, cy - 10 * s, 14 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(235, 115, 105, 0.25)";
    ctx.beginPath();
    ctx.arc(cx - 8 * s, cy - 7 * s, 2.6 * s, 0, Math.PI * 2);
    ctx.arc(cx + 8 * s, cy - 7 * s, 2.6 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1d2424";
    const stressed = (person.state?.stress || 0) >= 75;
    ctx.beginPath();
    ctx.arc(cx - 5 * s, cy - 10 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.arc(cx + 5 * s, cy - 10 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#2b221e";
    ctx.lineWidth = 1.4 * s;
    ctx.beginPath();
    if (stressed) {
      ctx.moveTo(cx - 7.5 * s, cy - 14 * s);
      ctx.lineTo(cx - 2.5 * s, cy - 12.5 * s);
      ctx.moveTo(cx + 7.5 * s, cy - 14 * s);
      ctx.lineTo(cx + 2.5 * s, cy - 12.5 * s);
      ctx.moveTo(cx - 3.5 * s, cy - 3.5 * s);
      ctx.quadraticCurveTo(cx, cy - 5.5 * s, cx + 3.5 * s, cy - 3.5 * s);
    } else {
      ctx.moveTo(cx - 3.8 * s, cy - 4.5 * s);
      ctx.quadraticCurveTo(cx, cy - 2 * s, cx + 3.8 * s, cy - 4.5 * s);
    }
    ctx.stroke();

    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(cx, cy - 12 * s, 14.8 * s, Math.PI * 0.92, Math.PI * 2.08);
    ctx.quadraticCurveTo(cx + 12 * s, cy - 17 * s, cx, cy - 16 * s);
    ctx.quadraticCurveTo(cx - 12 * s, cy - 17 * s, cx - 14.5 * s, cy - 10 * s);
    ctx.closePath();
    ctx.fill();

    if (rs.hat === "cap") {
      ctx.fillStyle = rs.cloth;
      ctx.beginPath();
      ctx.arc(cx, cy - 16 * s, 14 * s, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rs.trim;
      ctx.fillRect(cx - 14 * s, cy - 17 * s, 28 * s, 3 * s);
    } else if (rs.hat === "glasses") {
      ctx.strokeStyle = "#58b8f6";
      ctx.lineWidth = 1.3 * s;
      ctx.strokeRect(cx - 9 * s, cy - 13 * s, 7 * s, 5 * s);
      ctx.strokeRect(cx + 2 * s, cy - 13 * s, 7 * s, 5 * s);
      ctx.beginPath();
      ctx.moveTo(cx - 2 * s, cy - 10.5 * s);
      ctx.lineTo(cx + 2 * s, cy - 10.5 * s);
      ctx.stroke();
    }

    const ringCol =
      (person.state?.stress || 0) >= 75
        ? "#e66052"
        : (person.state?.energy || 100) <= 30
          ? "#f5b041"
          : "#58d68d";
    ctx.fillStyle = ringCol;
    ctx.beginPath();
    ctx.arc(w - 8 * s, 8 * s, 4.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0e1f1b";
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();
  }

  function createRenderer(canvas, minimap) {
    const cam = {
      x: 0,
      y: 0,
      zoom: 1,
      initialized: false,
      followId: null,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      camStartX: 0,
      camStartY: 0,
      moved: false,
    };

    const spriteState = new Map();
    let hitBoxes = [];
    let currentSnap = null;
    let onSelectBuilding = null;
    let onSelectPerson = null;

    function getWorldBounds(snap) {
      const layout = snap?.scene?.layout || { width: 32, height: 20 };
      const wTiles = layout.width + PAD_X * 2;
      const hTiles = layout.height + PAD_Y * 2 + 4;
      return {
        wTiles,
        hTiles,
        worldW: wTiles * TS,
        worldH: hTiles * TS,
        ox: PAD_X * TS,
        oy: PAD_Y * TS,
      };
    }

    function tileToWorld(tx, ty, bounds) {
      return {
        x: bounds.ox + (tx + 0.5) * TS,
        y: bounds.oy + (ty + 0.5) * TS,
      };
    }

    function centerCamera(snap) {
      const bounds = getWorldBounds(snap);
      const vw = canvas?.clientWidth || window.innerWidth || 1280;
      const vh = canvas?.clientHeight || window.innerHeight || 800;
      cam.zoom = vw < 600 ? 0.72 : Math.min(1.12, Math.max(0.78, vw / (bounds.worldW * 0.92)));
      cam.x = bounds.worldW * 0.5;
      cam.y = bounds.worldH * 0.47;
      cam.initialized = true;
    }

    function worldToScreen(wx, wy, vw, vh) {
      return {
        x: (wx - cam.x) * cam.zoom + vw * 0.5,
        y: (wy - cam.y) * cam.zoom + vh * 0.5,
      };
    }

    function screenToWorld(sx, sy, vw, vh) {
      return {
        x: (sx - vw * 0.5) / cam.zoom + cam.x,
        y: (sy - vh * 0.5) / cam.zoom + cam.y,
      };
    }

    function updateSpritePositions(snap, dtMs, simulationSpeed) {
      if (!snap || !snap.people) return;
      const bounds = getWorldBounds(snap);
      const allBuildings = [
        ...(snap.campus?.buildings || []),
        ...(snap.campus?.expansionPlots || []).filter((pl) => pl.constructed),
      ];
      const bMap = new Map(allBuildings.map((b) => [b.id, b]));
      const stepFactor = clamp(dtMs / 180, 0.08, 0.45);

      for (const p of snap.people) {
        if (!p.employed) {
          spriteState.delete(p.id);
          continue;
        }
        const bSpec = bMap.get(p.buildingId) || bMap.get("hq");
        const doorCell = bSpec?.doorCell || { x: p.position.x, y: p.position.y };
        const doorWorld = tileToWorld(doorCell.x, doorCell.y, bounds);
        const posWorld = tileToWorld(p.position.x, p.position.y, bounds);

        const targetX = p.isIndoors ? doorWorld.x : posWorld.x;
        const targetY = p.isIndoors ? doorWorld.y : posWorld.y;

        let st = spriteState.get(p.id);
        if (!st) {
          st = {
            x: targetX,
            y: targetY,
            indoorAlpha: p.isIndoors ? 0 : 1,
            lastBuildingId: p.buildingId,
            walkPhase: (p.visual?.variant || 0) % 100,
          };
          spriteState.set(p.id, st);
        }

        if (st.lastBuildingId !== p.buildingId) {
          const prevB = bMap.get(st.lastBuildingId);
          if (prevB && prevB.doorCell) {
            const prevDoor = tileToWorld(prevB.doorCell.x, prevB.doorCell.y, bounds);
            if (Math.hypot(st.x - prevDoor.x, st.y - prevDoor.y) < 12) {
              st.indoorAlpha = 1;
            }
          }
          st.lastBuildingId = p.buildingId;
        }

        const dx = targetX - st.x;
        const dy = targetY - st.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 1.5) {
          const distanceThisFrame = Math.min(dist, dtMs * 0.064 * clamp(simulationSpeed || 1, 1, 20));
          st.x += (dx / dist) * distanceThisFrame;
          st.y += (dy / dist) * distanceThisFrame;
          st.walkPhase += dtMs * 0.01 * clamp(simulationSpeed || 1, 1, 3);
          st.indoorAlpha = Math.min(1, st.indoorAlpha + stepFactor * 2.2);
        } else {
          st.x = targetX;
          st.y = targetY;
          if (!p.atWork) {
            st.indoorAlpha = Math.max(0, st.indoorAlpha - stepFactor * 1.5);
          } else if (p.isIndoors) {
            st.indoorAlpha = Math.max(0, st.indoorAlpha - stepFactor * 1.4);
          } else {
            st.indoorAlpha = Math.min(1, st.indoorAlpha + stepFactor * 1.8);
          }
        }
      }
    }

    function drawGroundsAndRoads(ctx, snap, bounds, nowMs) {
      const { wTiles, hTiles, worldW, worldH, ox, oy } = bounds;
      const layout = snap.scene.layout;

      ctx.fillStyle = "#91b970";
      ctx.fillRect(0, 0, worldW, worldH);

      for (let ty = 0; ty < hTiles; ty++) {
        for (let tx = 0; tx < wTiles; tx++) {
          const h = hash2(tx, ty);
          if (h < 0.35) {
            ctx.fillStyle = h < 0.17 ? "#8ab269" : "#98c077";
            ctx.fillRect(tx * TS, ty * TS, TS + 0.5, TS + 0.5);
          }
          if (h > 0.78 && (tx < PAD_X || tx >= PAD_X + layout.width || ty < PAD_Y || ty >= PAD_Y + layout.height)) {
            const gx = (tx + 0.4) * TS;
            const gy = (ty + 0.6) * TS;
            ctx.strokeStyle = "rgba(48, 88, 48, 0.32)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(gx, gy);
            ctx.lineTo(gx - 3, gy - 6);
            ctx.moveTo(gx, gy);
            ctx.lineTo(gx + 2, gy - 5);
            ctx.stroke();
          }
        }
      }

      const canalY = oy + (layout.height + 1.8) * TS;
      const canalH = 2.1 * TS;
      ctx.fillStyle = "#52a5aa";
      ctx.fillRect(0, canalY, worldW, canalH);
      ctx.fillStyle = "rgba(185, 240, 236, 0.38)";
      ctx.fillRect(0, canalY, worldW, 4);
      ctx.fillRect(0, canalY + canalH - 4, worldW, 4);
      for (let rx = 20; rx < worldW; rx += 54) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.fillRect(rx, canalY + 14 + (rx % 20), 22, 3);
      }

      const roadY = oy + (layout.height - 0.6) * TS;
      const roadH = 1.8 * TS;
      ctx.fillStyle = "#5c6468";
      ctx.fillRect(ox - TS, roadY, (layout.width + 2) * TS, roadH);
      ctx.strokeStyle = "#e6c86e";
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(ox - TS, roadY + roadH * 0.5);
      ctx.lineTo(ox + (layout.width + 1) * TS, roadY + roadH * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      const inboundTransit = (snap.logistics?.inboundShipments || []).filter((s) => s.status === "transit");
      const outboundActive = (snap.logistics?.outboundShipments || []).slice(0, 2);
      if (inboundTransit.length > 0) {
        const phase = ((nowMs || 0) / 8000) % 1;
        const tx = ox + phase * (layout.width - 10) * TS;
        const ty = roadY + 6;
        ctx.fillStyle = "#3498db";
        roundRectPath(ctx, tx, ty, 44, 18, 4);
        ctx.fill();
        ctx.fillStyle = "#f4efe1";
        ctx.fillRect(tx + 4, ty + 2, 26, 14);
        ctx.fillStyle = "#122438";
        ctx.font = `700 8.5px ${FONT}`;
        ctx.fillText("🚚 ส่งวัตถุดิบ", tx + 6, ty + 11);
      }
      if (outboundActive.length > 0) {
        const phase = 1 - (((nowMs || 0) / 9000) % 1);
        const tx = ox + 8 * TS + phase * (layout.width - 12) * TS;
        const ty = roadY + 28;
        ctx.fillStyle = "#2ecc71";
        roundRectPath(ctx, tx, ty, 48, 18, 4);
        ctx.fill();
        ctx.fillStyle = "#f4efe1";
        ctx.fillRect(tx + 16, ty + 2, 28, 14);
        ctx.fillStyle = "#142e26";
        ctx.font = `700 8.5px ${FONT}`;
        ctx.fillText("🚛 ส่งออก B2B", tx + 17, ty + 11);
      }

      const campX = ox + TS * 0.5;
      const campY = oy + TS * 0.5;
      const campW = (layout.width - 1) * TS;
      const campH = (layout.height - 1) * TS;

      ctx.fillStyle = "#9bc27b";
      ctx.fillRect(campX, campY, campW, campH);

      const plazaX = ox + 11 * TS;
      const plazaY = oy + 6.5 * TS;
      const plazaW = 8 * TS;
      const plazaH = 5.5 * TS;
      ctx.fillStyle = "#e4dac1";
      ctx.fillRect(plazaX, plazaY, plazaW, plazaH);
      ctx.strokeStyle = "#b8aa88";
      ctx.lineWidth = 2;
      ctx.strokeRect(plazaX, plazaY, plazaW, plazaH);

      ctx.strokeStyle = "rgba(130, 118, 92, 0.22)";
      ctx.lineWidth = 1;
      for (let x = plazaX + TS; x < plazaX + plazaW; x += TS) {
        ctx.beginPath();
        ctx.moveTo(x, plazaY);
        ctx.lineTo(x, plazaY + plazaH);
        ctx.stroke();
      }
      for (let y = plazaY + TS; y < plazaY + plazaH; y += TS) {
        ctx.beginPath();
        ctx.moveTo(plazaX, y);
        ctx.lineTo(plazaX + plazaW, y);
        ctx.stroke();
      }

      const fcx = plazaX + plazaW * 0.5;
      const fcy = plazaY + plazaH * 0.5;
      ctx.strokeStyle = "rgba(116, 100, 70, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fcx, fcy, 48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(fcx, fcy, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#55a9ad";
      ctx.beginPath();
      ctx.arc(fcx, fcy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d4c39a";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#dff6f8";
      ctx.beginPath();
      ctx.arc(fcx, fcy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#dcd0b2";
      const walkways = [
        { x: ox + 1.5 * TS, y: oy + 20 * TS, w: 50 * TS, h: 1.4 * TS },
        { x: ox + 2 * TS, y: oy + 16.5 * TS, w: 2.5 * TS, h: 14 * TS },
        { x: ox + 14 * TS, y: oy + 2 * TS, w: 2.2 * TS, h: 27 * TS },
        { x: ox + 5 * TS, y: oy + 6.5 * TS, w: 42 * TS, h: 1.5 * TS },
        { x: ox + 21.5 * TS, y: oy + 6.5 * TS, w: 2 * TS, h: 15 * TS },
        { x: ox + 6 * TS, y: oy + 11.5 * TS, w: 41 * TS, h: 1.4 * TS },
        { x: ox + 35 * TS, y: oy + 8 * TS, w: 1.4 * TS, h: 15 * TS },
        { x: ox + 40.5 * TS, y: oy + 4 * TS, w: 1.4 * TS, h: 25 * TS },
      ];
      for (const r of walkways) {
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeStyle = "rgba(120, 106, 78, 0.28)";
        ctx.lineWidth = 1;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      }

      const brX = ox + 2 * TS;
      ctx.fillStyle = "#c9ba96";
      ctx.fillRect(brX - 4, canalY - 4, 2.5 * TS + 8, canalH + 8);
      ctx.fillStyle = "#dfd3b6";
      ctx.fillRect(brX + 2, canalY, 2.5 * TS - 4, canalH);

      ctx.strokeStyle = "#868b7a";
      ctx.lineWidth = 8;
      ctx.strokeRect(campX, campY, campW, campH);
      ctx.strokeStyle = "#54594c";
      ctx.lineWidth = 2;
      ctx.strokeRect(campX - 4, campY - 4, campW + 8, campH + 8);
    }

    function drawExpansionPlotBlueprint(ctx, pl, bounds, selectedBuildingId) {
      const { ox, oy } = bounds;
      const fp = pl.footprint;
      const bx = ox + fp.x * TS;
      const by = oy + fp.y * TS;
      const bw = fp.width * TS;
      const bh = fp.height * TS;
      const isSelected = selectedBuildingId === pl.id;

      ctx.save();
      ctx.fillStyle = "rgba(32, 64, 52, 0.16)";
      roundRectPath(ctx, bx + 2, by + 2, bw - 4, bh - 4, 8);
      ctx.fill();

      ctx.strokeStyle = isSelected ? "#ffe885" : "rgba(236, 207, 130, 0.55)";
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.setLineDash([6, 5]);
      roundRectPath(ctx, bx + 2, by + 2, bw - 4, bh - 4, 8);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = `700 10px ${FONT}`;
      ctx.fillStyle = "rgba(22, 46, 38, 0.78)";
      const label = `📐 ${pl.shortNameTh}`;
      const tw = ctx.measureText(label).width + 12;
      roundRectPath(ctx, bx + bw / 2 - tw / 2, by + bh / 2 - 10, tw, 20, 5);
      ctx.fill();
      ctx.fillStyle = "#e8dfc4";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, bx + bw / 2, by + bh / 2);
      ctx.restore();

      hitBoxes.push({
        type: "building",
        id: pl.id,
        x: bx,
        y: by,
        w: bw,
        h: bh,
      });
    }

    function drawCampusTreesAndProps(ctx, snap, bounds) {
      const { ox, oy } = bounds;
      const layout = snap.scene.layout;
      const treeSpots = [
        [-2, 2, "pine", 1.1],
        [-3, 7, "blossom", 1.0],
        [-2, 13, "pine", 1.15],
        [-2, 18, "pine", 1.0],
        [4, -2, "pine", 1.1],
        [10, -2.5, "blossom", 1.0],
        [16, -2, "pine", 1.2],
        [23, -2.5, "pine", 1.1],
        [29, -2, "blossom", 1.05],
        [layout.width + 1.5, 3, "pine", 1.1],
        [layout.width + 2, 9, "blossom", 1.0],
        [layout.width + 1.5, 15, "pine", 1.15],
        [1.3, 9.5, "blossom", 0.95],
        [16.8, 9.5, "pine", 0.95],
      ];

      for (const [tx, ty, kind, sc] of treeSpots) {
        const x = ox + tx * TS;
        const y = oy + ty * TS;
        ctx.fillStyle = "rgba(32, 60, 44, 0.22)";
        ctx.beginPath();
        ctx.ellipse(x + 3, y + 4, 15 * sc, 6 * sc, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#6e4e32";
        ctx.fillRect(x - 2.5 * sc, y - 14 * sc, 5 * sc, 16 * sc);

        if (kind === "pine") {
          const greens = ["#2f6850", "#428262", "#5ea074"];
          for (let i = 0; i < 3; i++) {
            const w = (19 - i * 4) * sc;
            const cy = y - (11 + i * 8) * sc;
            ctx.fillStyle = greens[i];
            ctx.beginPath();
            ctx.moveTo(x, cy - 14 * sc);
            ctx.lineTo(x - w, cy + 3 * sc);
            ctx.lineTo(x + w, cy + 3 * sc);
            ctx.closePath();
            ctx.fill();
          }
        } else {
          const pinks = ["#d9849e", "#eba6bc", "#f7cad8"];
          const offsets = [
            [0, -18, 14],
            [-9, -14, 10],
            [9, -14, 10],
            [0, -24, 10],
          ];
          offsets.forEach(([dx, dy, r], idx) => {
            ctx.fillStyle = pinks[idx % pinks.length];
            ctx.beginPath();
            ctx.arc(x + dx * sc, y + dy * sc, r * sc, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }
    }

    function drawBuildingExterior(ctx, b, snap, bounds, nowMs, selectedBuildingId) {
      const { ox, oy } = bounds;
      const art = BUILDING_ART[b.id] || BUILDING_ART.hq;
      const fp = b.footprint;
      const bx = ox + fp.x * TS;
      const by = oy + fp.y * TS;
      const bw = fp.width * TS;
      const bh = fp.height * TS;
      const isSelected = selectedBuildingId === b.id;
      const minute = snap.time?.minute || 540;
      const isNightOrDusk = minute >= 990 || minute < 390;
      const lit = Boolean(b.lightsOn || (isNightOrDusk && b.totalAssignedCount > 0));

      ctx.save();

      if (isSelected) {
        ctx.strokeStyle = "#f2d582";
        ctx.lineWidth = 3.5;
        roundRectPath(ctx, bx - 6, by - 6, bw + 12, bh + 12, 14);
        ctx.stroke();
      }

      if (b.id === "courtyard") {
        ctx.fillStyle = "#87b56c";
        roundRectPath(ctx, bx, by, bw, bh, 12);
        ctx.fill();
        ctx.strokeStyle = "#b8aa82";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = "#dfd4b9";
        roundRectPath(ctx, bx + 14, by + 16, bw - 28, bh - 32, 8);
        ctx.fill();

        ctx.fillStyle = "#4fa3a8";
        ctx.beginPath();
        ctx.ellipse(bx + bw * 0.65, by + bh * 0.55, 26, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#c7ba98";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#8c5d3c";
        ctx.fillRect(bx + 22, by + 24, 48, 22);
      } else if (b.id === "solarPlant") {
        ctx.fillStyle = "#5c6468";
        roundRectPath(ctx, bx, by, bw, bh, 8);
        ctx.fill();
        ctx.strokeStyle = "#ecc94b";
        ctx.lineWidth = 2;
        ctx.stroke();
        for (let py = by + 10; py < by + bh - 16; py += 20) {
          ctx.fillStyle = "#1e3a5f";
          ctx.fillRect(bx + 8, py, bw - 16, 14);
          ctx.strokeStyle = "#7ce0ff";
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 8, py, bw - 16, 14);
        }
      } else if (b.id === "gate") {
        ctx.fillStyle = "rgba(24, 44, 36, 0.24)";
        ctx.beginPath();
        ctx.ellipse(bx + bw / 2, by + bh + 4, bw * 0.52, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#dfd5bc";
        ctx.fillRect(bx + 4, by + 18, bw * 0.42, bh - 18);
        ctx.fillRect(bx + bw - 24, by + 18, 20, bh - 18);

        ctx.fillStyle = art.roof;
        ctx.beginPath();
        ctx.moveTo(bx - 6, by + 26);
        ctx.lineTo(bx + 8, by + 4);
        ctx.lineTo(bx + bw - 8, by + 4);
        ctx.lineTo(bx + bw + 6, by + 26);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = art.ridge;
        ctx.fillRect(bx + 6, by + 3, bw - 12, 4);

        ctx.fillStyle = "#d9534f";
        ctx.fillRect(bx + bw * 0.45, by + bh - 18, bw * 0.4, 5);
        ctx.fillStyle = "#ffffff";
        for (let sx = 0; sx < 3; sx++) {
          ctx.fillRect(bx + bw * 0.48 + sx * 14, by + bh - 18, 6, 5);
        }
      } else {
        ctx.fillStyle = "rgba(22, 42, 34, 0.24)";
        ctx.beginPath();
        ctx.ellipse(bx + bw / 2 + 4, by + bh + 6, bw * 0.52, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#cfc5ad";
        ctx.fillRect(bx - 3, by + bh - 12, bw + 6, 14);
        ctx.fillStyle = "#e5dcc5";
        ctx.fillRect(bx, by + bh - 15, bw, 6);

        const roofH = Math.round(bh * 0.56);
        const wallY = by + roofH - 6;
        const wallH = bh - roofH + 4;
        ctx.fillStyle = art.wall;
        ctx.fillRect(bx + 4, wallY, bw - 8, wallH);
        ctx.strokeStyle = art.wood;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 4, wallY, bw - 8, wallH);

        const cols = Math.max(2, Math.round(bw / 52));
        ctx.fillStyle = art.wood;
        for (let i = 0; i <= cols; i++) {
          const cx = bx + 4 + (i * (bw - 12)) / cols;
          ctx.fillRect(cx, wallY, 4, wallH);
        }

        const winY = wallY + 10;
        const winH = Math.max(10, wallH - 26);
        for (let i = 0; i < cols; i++) {
          if (i === Math.floor(cols / 2)) continue;
          const wx = bx + 12 + (i * (bw - 12)) / cols;
          const ww = Math.max(8, (bw - 12) / cols - 14);
          if (lit) {
            ctx.save();
            ctx.shadowColor = "rgba(255, 208, 102, 0.85)";
            ctx.shadowBlur = 12;
            ctx.fillStyle = "#f9dc94";
            ctx.fillRect(wx, winY, ww, winH);
            ctx.restore();
          } else {
            ctx.fillStyle = "#567c78";
            ctx.fillRect(wx, winY, ww, winH);
          }
          ctx.strokeStyle = art.wood;
          ctx.lineWidth = 1.2;
          ctx.strokeRect(wx, winY, ww, winH);
        }

        const doorW = 24;
        const doorH = Math.min(26, Math.max(12, wallH - 6));
        const doorX = bx + bw / 2 - doorW / 2;
        const doorY = by + bh - doorH - 2;
        ctx.fillStyle = "#261b16";
        ctx.fillRect(doorX, doorY, doorW, doorH);
        ctx.strokeStyle = art.ridge;
        ctx.lineWidth = 1.8;
        ctx.strokeRect(doorX, doorY, doorW, doorH);
        ctx.fillStyle = "#d8ceb8";
        ctx.fillRect(doorX - 5, by + bh - 4, doorW + 10, 8);

        ctx.fillStyle = art.roof;
        ctx.beginPath();
        ctx.moveTo(bx - 6, wallY + 6);
        ctx.quadraticCurveTo(bx + 4, by + 8, bx + 12, by + 4);
        ctx.lineTo(bx + bw - 12, by + 4);
        ctx.quadraticCurveTo(bx + bw - 4, by + 8, bx + bw + 6, wallY + 6);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = art.ridge;
        ctx.fillRect(bx + 10, by + 2, Math.max(12, bw - 20), 4.5);
        ctx.fillStyle = art.accent;
        ctx.fillRect(bx - 4, wallY + 3, bw + 8, 3.5);

        if (["factory", "prodLineB", "prodLineC", "prodLineD", "refineryMill", "bakeryPlant"].includes(b.id)) {
          for (const chX of [bx + bw - 36, bx + bw - 18]) {
            ctx.fillStyle = "#3a3f47";
            ctx.fillRect(chX, by - 14, 10, 22);
            ctx.fillStyle = art.accent;
            ctx.fillRect(chX - 1, by - 14, 12, 4);
            if (b.activeJobCount > 0 || b.totalAssignedCount > 0) {
              for (let p = 0; p < 2; p++) {
                const phase = ((nowMs / 900 + p * 0.5) % 1);
                const sx = chX + 5 + Math.sin(phase * 5 + p) * 5;
                const sy = by - 18 - phase * 22;
                ctx.fillStyle = `rgba(220, 228, 232, ${(1 - phase) * 0.5})`;
                ctx.beginPath();
                ctx.arc(sx, sy, 4 + phase * 6, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }
      }

      // Level 2 & Level 3 visual upgrades (verified by campus-browser.cjs)
      const level = Math.max(1, Math.min(3, b.level || 1));
      if (level >= 2 && b.id !== "gate") {
        if (b.id === "courtyard") {
          ctx.fillStyle = "#d8e4c3";
          ctx.fillRect(bx + 16, by + bh - 25, bw - 32, 8);
          ctx.fillStyle = "#57a678";
          for (let x = bx + 22; x < bx + bw - 15; x += 20) ctx.fillRect(x, by + bh - 30, 8, 6);
        } else {
          ctx.fillStyle = "#c9e5e9";
          ctx.fillRect(bx + 10, by + 8, Math.max(12, bw - 20), 5);
          ctx.fillStyle = "#417d8e";
          for (let x = bx + 16; x < bx + bw - 22; x += 24) ctx.fillRect(x, by + 15, 17, 10);
        }
      }
      if (level >= 3 && b.id !== "gate") {
        ctx.fillStyle = b.id === "courtyard" ? "#e8d49b" : "#253f5f";
        ctx.fillRect(bx + bw * 0.28, by + 28, bw * 0.44, 13);
        ctx.strokeStyle = "#b9e9f2";
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
          const px = bx + bw * (0.28 + i * 0.11);
          ctx.beginPath(); ctx.moveTo(px, by + 28); ctx.lineTo(px, by + 41); ctx.stroke();
        }
      }
      if (level >= 2) {
        ctx.save();
        ctx.lineWidth = 2;
        if (b.id === "factory") {
          ctx.fillStyle = "#efb54f";
          ctx.fillRect(bx + 8, by + bh - 10, bw - 16, 4);
          if (level >= 3) { ctx.fillStyle = "#76d6e0"; ctx.fillRect(bx + bw - 34, by + 48, 20, 13); }
        } else if (b.id === "hq") {
          ctx.fillStyle = "#80c8cf";
          ctx.fillRect(bx + bw / 2 - 18, by + 23, 36, 12);
          if (level >= 3) { ctx.fillStyle = "#e5d08e"; ctx.fillRect(bx + bw / 2 - 4, by - 20, 8, 20); }
        } else if (b.id === "rnd") {
          ctx.strokeStyle = "#9de2f3";
          ctx.beginPath(); ctx.arc(bx + bw - 23, by + 18, 13, 0, Math.PI); ctx.stroke();
          if (level >= 3) { ctx.fillStyle = "#d4fbff"; ctx.fillRect(bx + bw - 25, by - 12, 4, 20); }
        } else if (b.id === "warehouse") {
          ctx.strokeStyle = "#e8c86b";
          ctx.strokeRect(bx + bw - 60, by + bh - 38, 44, 28);
          if (level >= 3) { ctx.fillStyle = "#74c7b9"; ctx.fillRect(bx + bw - 55, by + bh - 32, 34, 5); }
        } else if (b.id === "canteen") {
          ctx.fillStyle = "#f2d49a";
          ctx.fillRect(bx + 12, by + bh - 13, bw - 24, 5);
          if (level >= 3) { ctx.fillStyle = "#e98463"; ctx.fillRect(bx + bw / 2 - 16, by + 45, 32, 7); }
        } else if (b.id === "training") {
          ctx.fillStyle = "#d8eff7";
          ctx.fillRect(bx + bw / 2 - 14, by + 48, 28, 13);
          ctx.fillStyle = "#486b9a"; ctx.fillRect(bx + bw / 2 - 2, by + 48, 4, 13);
          if (level >= 3) { ctx.strokeStyle = "#a7e6ff"; ctx.strokeRect(bx + 12, by + bh - 38, bw - 24, 14); }
        } else if (b.id === "courtyard" && level >= 3) {
          ctx.fillStyle = "#d9f5ee";
          ctx.beginPath(); ctx.arc(bx + bw * 0.65, by + bh * 0.55, 7, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }

      const label = `${b.icon} ${b.shortNameTh}${b.id === "gate" || b.constructed ? "" : ` • Lv.${level}`}`;
      ctx.font = `700 11px ${FONT}`;
      const tw = ctx.measureText(label).width;
      const badgeText = b.totalAssignedCount > 0 ? ` 👥 ${b.totalAssignedCount}` : "";
      const bwText = badgeText ? ctx.measureText(badgeText).width + 6 : 0;
      const boxW = tw + bwText + 18;
      const boxH = 21;
      const px = bx + bw / 2 - boxW / 2;
      const py = by - 14;

      ctx.fillStyle = art.plaqueBg;
      roundRectPath(ctx, px, py, boxW, boxH, 7);
      ctx.fill();
      ctx.strokeStyle = isSelected ? "#fff2a8" : art.ridge;
      ctx.lineWidth = isSelected ? 2.2 : 1.3;
      ctx.stroke();

      ctx.fillStyle = art.plaqueInk;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(label, px + 8, py + boxH / 2);

      if (badgeText) {
        ctx.fillStyle = "#82f0b1";
        ctx.fillText(badgeText, px + 8 + tw + 4, py + boxH / 2);
      }

      ctx.restore();

      hitBoxes.push({
        type: "building",
        id: b.id,
        x: bx - 6,
        y: by - 18,
        w: bw + 12,
        h: bh + 24,
      });
    }

    function drawChibiEmployee(ctx, p, st, nowMs, selectedPersonId, isTracked = false, compactMode = false) {
      if (!st || st.indoorAlpha <= 0.04) return;
      const variant = Math.abs(Number(p.visual?.variant || 17));
      const skin = SKIN_TONES[variant % SKIN_TONES.length];
      const hair = HAIR_COLORS[Math.floor(variant / 5) % HAIR_COLORS.length];
      const rs = ROLE_STYLE[p.role] || ROLE_STYLE.assembler;
      const isSelected = selectedPersonId === p.id;
      const isWalking = p.activity === "walking" || st.indoorAlpha < 0.98;
      const swing = isWalking ? Math.sin(st.walkPhase) * 3.2 : Math.sin(nowMs / 240 + variant) * 0.8;
      const bob = isWalking ? Math.abs(Math.cos(st.walkPhase)) * -2.2 : 0;

      const x = st.x;
      const y = st.y + bob;

      ctx.save();
      ctx.globalAlpha = clamp(st.indoorAlpha, 0, 1);

      const stress = p.state?.stress || 0;
      const ringCol =
        stress >= 75
          ? "#e66052"
          : stress >= 55
            ? "#f5b041"
            : "#58d68d";
      ctx.strokeStyle = isSelected ? "#ffe885" : isTracked ? "#f5c542" : ringCol;
      ctx.lineWidth = isSelected || isTracked ? 2.8 : 1.8;
      ctx.beginPath();
      ctx.ellipse(x, st.y + 5, isSelected || isTracked ? 13 : 10, isSelected || isTracked ? 5.5 : 4, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "rgba(18, 36, 28, 0.28)";
      ctx.beginPath();
      ctx.ellipse(x, st.y + 4, 8, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#2c3a35";
      ctx.lineWidth = 2.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - 3, y - 2);
      ctx.lineTo(x - 3.5 + swing * 0.6, st.y + 4);
      ctx.moveTo(x + 3, y - 2);
      ctx.lineTo(x + 3.5 - swing * 0.6, st.y + 4);
      ctx.stroke();

      ctx.fillStyle = rs.cloth;
      roundRectPath(ctx, x - 6.5, y - 15, 13, 13.5, 4);
      ctx.fill();
      ctx.fillStyle = rs.trim;
      ctx.fillRect(x - 1.5, y - 14, 3, 9);

      ctx.strokeStyle = rs.cloth;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 12);
      ctx.lineTo(x - 9.5, y - 5 - swing * 0.5);
      ctx.moveTo(x + 6, y - 12);
      ctx.lineTo(x + 9.5, y - 5 + swing * 0.5);
      ctx.stroke();

      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(x, y - 21, 6.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1b2220";
      ctx.beginPath();
      ctx.arc(x - 2.3, y - 20.5, 1, 0, Math.PI * 2);
      ctx.arc(x + 2.3, y - 20.5, 1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.arc(x, y - 22.2, 7.1, Math.PI * 0.95, Math.PI * 2.05);
      ctx.closePath();
      ctx.fill();

      if (!compactMode || isSelected || isTracked) {
        const by = y - 36;
        ctx.fillStyle = "#fff9eb";
        ctx.beginPath();
        ctx.arc(x, by, 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = stress >= 75 ? "#e0584a" : "#d4af37";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji || "💼", x, by + 0.5);

        ctx.font = `700 9.5px ${FONT}`;
        const nm = (isTracked ? "⭐ " : "") + p.name;
        const nw = ctx.measureText(nm).width + 10;
        ctx.fillStyle = isSelected ? "#f0d794" : isTracked ? "#382e12" : "rgba(16, 36, 30, 0.85)";
        roundRectPath(ctx, x - nw / 2, st.y + 8, nw, 14, 5);
        ctx.fill();
        ctx.fillStyle = isSelected ? "#1d1810" : isTracked ? "#ffe885" : "#f4efe1";
        ctx.fillText(nm, x, st.y + 15);
      }

      ctx.restore();

      hitBoxes.push({
        type: "person",
        id: p.id,
        x,
        y: y - 14,
        r: 18,
      });
    }

    function drawDayNightAtmosphere(ctx, snap, bounds) {
      const minute = snap.time?.minute ?? 540;
      const { worldW, worldH, ox, oy } = bounds;

      let overlay = null;
      let lampGlow = 0;

      if (minute >= 990 && minute < 1080) {
        const t = (minute - 990) / 90;
        overlay = `rgba(235, 135, 45, ${(0.12 + t * 0.16).toFixed(3)})`;
        lampGlow = t * 0.65;
      } else if (minute >= 1080 || minute < 390) {
        overlay = "rgba(12, 22, 44, 0.42)";
        lampGlow = 1;
      } else if (minute >= 390 && minute < 510) {
        const t = 1 - (minute - 390) / 120;
        overlay = `rgba(240, 170, 95, ${(t * 0.18).toFixed(3)})`;
        lampGlow = t * 0.4;
      }

      if (overlay) {
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, worldW, worldH);
      }

      const lamps = [
        [6, 7.5],
        [13.5, 7.5],
        [16.5, 7.5],
        [21.5, 7.5],
        [13.5, 12.2],
        [16.5, 12.2],
        [23, 12.2],
        [4.5, 16],
        [14, 16],
        [24, 16],
      ];
      for (const [lx, ly] of lamps) {
        const wx = ox + lx * TS;
        const wy = oy + ly * TS;
        ctx.fillStyle = "#3c4a44";
        ctx.fillRect(wx - 1.5, wy - 14, 3, 14);
        ctx.fillStyle = lampGlow > 0.1 ? "#ffe28a" : "#d5d8dc";
        ctx.beginPath();
        ctx.arc(wx, wy - 15, 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (lampGlow > 0.05) {
          const rad = ctx.createRadialGradient(wx, wy - 10, 2, wx, wy - 6, 46);
          rad.addColorStop(0, `rgba(255, 218, 120, ${0.42 * lampGlow})`);
          rad.addColorStop(1, "rgba(255, 218, 120, 0)");
          ctx.fillStyle = rad;
          ctx.beginPath();
          ctx.arc(wx, wy - 6, 46, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function drawMinimap(snap, bounds, vw, vh) {
      if (!minimap || !snap) return;
      const mctx = minimap.getContext("2d");
      if (!mctx) return;
      const mw = minimap.clientWidth || 108;
      const mh = minimap.clientHeight || 76;
      if (minimap.width !== mw || minimap.height !== mh) {
        minimap.width = mw;
        minimap.height = mh;
      }
      mctx.clearRect(0, 0, mw, mh);

      mctx.fillStyle = "#7ea862";
      mctx.fillRect(0, 0, mw, mh);

      const sx = mw / bounds.worldW;
      const sy = mh / bounds.worldH;

      mctx.fillStyle = "#dfd4b9";
      mctx.fillRect(
        (bounds.ox + 11 * TS) * sx,
        (bounds.oy + 6.5 * TS) * sy,
        8 * TS * sx,
        5.5 * TS * sy,
      );

      mctx.fillStyle = "#4fa3a8";
      mctx.fillRect(0, (bounds.oy + (snap.scene.layout.height + 1.8) * TS) * sy, mw, 5);

      const allBuilt = [
        ...(snap.campus?.buildings || []),
        ...(snap.campus?.expansionPlots || []).filter((pl) => pl.constructed),
      ];
      for (const b of allBuilt) {
        const art = BUILDING_ART[b.id] || BUILDING_ART.hq;
        mctx.fillStyle = art.roof;
        mctx.fillRect(
          (bounds.ox + b.footprint.x * TS) * sx,
          (bounds.oy + b.footprint.y * TS) * sy,
          b.footprint.width * TS * sx,
          b.footprint.height * TS * sy,
        );
      }

      for (const p of snap.people || []) {
        if (!p.employed || !p.atWork) continue;
        const st = spriteState.get(p.id);
        const wx = st ? st.x : bounds.ox + p.position.x * TS;
        const wy = st ? st.y : bounds.oy + p.position.y * TS;
        mctx.fillStyle = "#ffe885";
        mctx.fillRect(wx * sx - 1, wy * sy - 1, 2.5, 2.5);
      }

      const tl = screenToWorld(0, 0, vw, vh);
      const br = screenToWorld(vw, vh, vw, vh);
      mctx.strokeStyle = "#ffffff";
      mctx.lineWidth = 1.4;
      mctx.strokeRect(
        tl.x * sx,
        tl.y * sy,
        (br.x - tl.x) * sx,
        (br.y - tl.y) * sy,
      );
    }

    let lastRenderTime = 0;

    function render(snap, nowMs, selectedState = {}) {
      if (!canvas || !snap) return;
      currentSnap = snap;
      const dtMs = lastRenderTime ? clamp(nowMs - lastRenderTime, 4, 100) : 16;
      lastRenderTime = nowMs;

      if (!cam.initialized) centerCamera(snap);
      updateSpritePositions(snap, dtMs, selectedState.speed);

      if (cam.followId) {
        const st = spriteState.get(cam.followId);
        if (st) {
          cam.x += (st.x - cam.x) * 0.15;
          cam.y += (st.y - cam.y) * 0.15;
        }
      }

      const vw = canvas.clientWidth || window.innerWidth || 1280;
      const vh = canvas.clientHeight || window.innerHeight || 800;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) {
        canvas.width = Math.round(vw * dpr);
        canvas.height = Math.round(vh * dpr);
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);

      const bounds = getWorldBounds(snap);
      hitBoxes = [];

      ctx.save();
      ctx.translate(vw * 0.5, vh * 0.5);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-cam.x, -cam.y);

      drawGroundsAndRoads(ctx, snap, bounds, nowMs);
      drawCampusTreesAndProps(ctx, snap, bounds);

      const expPlots = snap.campus?.expansionPlots || [];
      for (const pl of expPlots) {
        if (!pl.constructed) {
          drawExpansionPlotBlueprint(ctx, pl, bounds, selectedState.buildingId);
        }
      }

      const buildings = [
        ...(snap.campus?.buildings || []),
        ...expPlots.filter((pl) => pl.constructed),
      ].sort((a, b) => a.footprint.y - b.footprint.y);
      for (const b of buildings) {
        drawBuildingExterior(ctx, b, snap, bounds, nowMs, selectedState.buildingId);
      }

      const tlWorld = screenToWorld(-80, -80, vw, vh);
      const brWorld = screenToWorld(vw + 80, vh + 80, vw, vh);
      const trackedSet = selectedState.trackedIds instanceof Set ? selectedState.trackedIds : new Set();
      const employedPeople = (snap.people || []).filter((p) => p.employed);
      const compactMode = employedPeople.length > 100 && cam.zoom < 0.85;

      const visiblePeople = employedPeople
        .filter((p) => {
          const st = spriteState.get(p.id);
          if (!st || st.indoorAlpha <= 0.04) return false;
          return st.x >= tlWorld.x && st.x <= brWorld.x && st.y >= tlWorld.y && st.y <= brWorld.y;
        })
        .sort((a, b) => {
          const sa = spriteState.get(a.id)?.y || 0;
          const sb = spriteState.get(b.id)?.y || 0;
          return sa - sb;
        });

      for (const p of visiblePeople) {
        drawChibiEmployee(
          ctx,
          p,
          spriteState.get(p.id),
          nowMs,
          selectedState.personId,
          trackedSet.has(p.id),
          compactMode,
        );
      }

      drawDayNightAtmosphere(ctx, snap, bounds);

      ctx.restore();

      drawMinimap(snap, bounds, vw, vh);
    }

    function bindInteractions(handlers = {}) {
      onSelectBuilding = handlers.onSelectBuilding || null;
      onSelectPerson = handlers.onSelectPerson || null;
      if (!canvas) return;
      const pointers = new Map();
      let pinch = null;

      function beginPinch() {
        const [a, b] = [...pointers.values()];
        const rect = canvas.getBoundingClientRect();
        const midX = (a.x + b.x) / 2 - rect.left;
        const midY = (a.y + b.y) / 2 - rect.top;
        const vw = canvas.clientWidth || rect.width;
        const vh = canvas.clientHeight || rect.height;
        pinch = {
          distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
          zoom: cam.zoom,
          anchor: screenToWorld(midX, midY, vw, vh),
        };
        cam.moved = true;
        cam.dragging = false;
        cam.followId = null;
      }

      canvas.addEventListener("pointerdown", (e) => {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size >= 2) {
          beginPinch();
          return;
        }
        cam.dragging = true;
        cam.moved = false;
        cam.dragStartX = e.clientX;
        cam.dragStartY = e.clientY;
        cam.camStartX = cam.x;
        cam.camStartY = cam.y;
      });

      window.addEventListener("pointermove", (e) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch && pointers.size >= 2) {
          const [a, b] = [...pointers.values()];
          const rect = canvas.getBoundingClientRect();
          const midX = (a.x + b.x) / 2 - rect.left;
          const midY = (a.y + b.y) / 2 - rect.top;
          cam.zoom = clamp(pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y) / pinch.distance, 0.45, 2.2);
          cam.x = pinch.anchor.x - (midX - (canvas.clientWidth || rect.width) / 2) / cam.zoom;
          cam.y = pinch.anchor.y - (midY - (canvas.clientHeight || rect.height) / 2) / cam.zoom;
          return;
        }
        if (!cam.dragging) return;
        const dx = e.clientX - cam.dragStartX;
        const dy = e.clientY - cam.dragStartY;
        if (Math.hypot(dx, dy) > 6) {
          cam.moved = true;
          cam.followId = null;
        }
        cam.x = cam.camStartX - dx / cam.zoom;
        cam.y = cam.camStartY - dy / cam.zoom;
      });

      function endPointer(e) {
        if (!pointers.has(e.pointerId)) return;
        pointers.delete(e.pointerId);
        if (pinch) {
          pinch = null;
          cam.moved = true;
          cam.dragging = false;
        } else if (!pointers.size) cam.dragging = false;
      }
      window.addEventListener("pointerup", endPointer);
      window.addEventListener("pointercancel", endPointer);

      canvas.addEventListener("click", (e) => {
        if (cam.moved || !currentSnap) return;
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const vw = canvas.clientWidth || rect.width || 1280;
        const vh = canvas.clientHeight || rect.height || 800;
        const wpt = screenToWorld(sx, sy, vw, vh);

        let bestPerson = null;
        let bestDist = Infinity;
        for (const h of hitBoxes) {
          if (h.type === "person") {
            const d = Math.hypot(wpt.x - h.x, wpt.y - h.y);
            if (d <= h.r && d < bestDist) {
              bestPerson = h;
              bestDist = d;
            }
          }
        }
        if (bestPerson && onSelectPerson) {
          onSelectPerson(bestPerson.id);
          return;
        }

        for (let i = hitBoxes.length - 1; i >= 0; i--) {
          const h = hitBoxes[i];
          if (
            h.type === "building" &&
            wpt.x >= h.x &&
            wpt.x <= h.x + h.w &&
            wpt.y >= h.y &&
            wpt.y <= h.y + h.h
          ) {
            if (onSelectBuilding) onSelectBuilding(h.id);
            return;
          }
        }
      });

      canvas.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          const factor = e.deltaY < 0 ? 1.12 : 0.9;
          cam.zoom = clamp(cam.zoom * factor, 0.45, 2.2);
        },
        { passive: false },
      );

      if (minimap) {
        minimap.addEventListener("click", (e) => {
          if (!currentSnap) return;
          const rect = minimap.getBoundingClientRect();
          const rx = (e.clientX - rect.left) / (rect.width || 108);
          const ry = (e.clientY - rect.top) / (rect.height || 76);
          const bounds = getWorldBounds(currentSnap);
          cam.followId = null;
          cam.x = rx * bounds.worldW;
          cam.y = ry * bounds.worldH;
        });
      }
    }

    return Object.freeze({
      render,
      bindInteractions,
      centerCamera: () => currentSnap && centerCamera(currentSnap),
      zoomBy: (factor) => {
        cam.zoom = clamp(cam.zoom * factor, 0.45, 2.2);
      },
      setFollow: (personId) => {
        cam.followId = cam.followId === personId ? null : personId;
        return cam.followId;
      },
      getFollow: () => cam.followId,
      focusBuilding: (buildingId) => {
        if (!currentSnap) return;
        const all = [
          ...(currentSnap.campus?.buildings || []),
          ...(currentSnap.campus?.expansionPlots || []),
        ];
        const b = all.find((x) => x.id === buildingId);
        if (!b) return;
        const bounds = getWorldBounds(currentSnap);
        cam.followId = null;
        cam.x = bounds.ox + (b.footprint.x + b.footprint.width * 0.5) * TS;
        cam.y = bounds.oy + (b.footprint.y + b.footprint.height * 0.5) * TS;
      },
    });
  }

  return Object.freeze({
    ROLE_STYLE,
    BUILDING_ART,
    drawPortrait,
    createRenderer,
  });
});
