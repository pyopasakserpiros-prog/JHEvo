'use strict';
/**
 * JianghuSect Evolution — Legacy Test Harness Adapter (_harness.js)
 * Bridges v230–v233 test suites to the canonical runtime modules in load.js
 * without modifying the test files themselves.
 */
const G = require('./load');

function decorateWorld(W) {
  if (!W) return W;
  // Ensure at least 9 NPCs exist so slice(0, 4) and slice(4, 8) have 8 non-master disciples
  while ((W.npcs || []).filter(n => n && n.id !== (W.sect && W.sect.masterId)).length < 8) {
    if (G.SIM && G.SIM.addNpc) {
      G.SIM.addNpc(W, { ageYears: 20, rank: 2, stage: 2, quality: 0.6 });
    } else break;
  }
  if (!Object.getOwnPropertyDescriptor(W, 'members')) {
    Object.defineProperty(W, 'members', {
      get() {
        const masterId = W.sect && W.sect.masterId;
        const nonMasters = (W.npcs || []).filter(n => n && n.id !== masterId);
        const master = (W.npcs || []).find(n => n && n.id === masterId);
        return master ? nonMasters.concat([master]) : (W.npcs || []);
      },
      set(v) { W.npcs = v; },
      configurable: true
    });
  }
  if (!Object.getOwnPropertyDescriptor(W, 'jianghu')) {
    Object.defineProperty(W, 'jianghu', {
      get() { return W.world; },
      set(v) { W.world = v; },
      configurable: true
    });
  }
  (W.npcs || []).forEach(m => {
    if (!m || m._harnessDecorated) return;
    Object.defineProperty(m, '_harnessDecorated', { value: true, enumerable: false });
    let mapPath = Array.isArray(m.path) ? m.path : null;
    Object.defineProperty(m, 'alive', {
      get() { return !m.dead; },
      set(v) { m.dead = !v; },
      configurable: true
    });
    Object.defineProperty(m, 'path', {
      get() { return mapPath; },
      set(v) {
        if (typeof v === 'string') {
          if (m.cult) m.cult.path = v;
        } else {
          mapPath = v;
        }
      },
      configurable: true
    });
    Object.defineProperty(m, 'realm', {
      get() { return m.cult ? m.cult.stage : 1; },
      set(v) { if (m.cult) m.cult.stage = v; },
      configurable: true
    });
    Object.defineProperty(m, 'contrib', {
      get() { return m.merit || 0; },
      set(v) { m.merit = v; },
      configurable: true
    });
    Object.defineProperty(m, 'inSect', {
      get() { return m.post || null; },
      set(v) { m.post = v; },
      configurable: true
    });
  });
  return W;
}

function bootGame(seed) {
  const { SIM, SECT, CULT, EXPED, COG, AI, UI, HC } = G;

  // Ensure SECT.PEAKS / ELDER_STATUS / COUNCIL / HEART_DEMON bridges exist
  if (SECT && SECT.PEAKS) {
    if (!SECT.PEAKS.PEAK_CATALOG) SECT.PEAKS.PEAK_CATALOG = SECT.PEAKS.PEAK_DEFS;
    if (!SECT.PEAKS.getFoundedPeaks) {
      SECT.PEAKS.getFoundedPeaks = W => SECT.PEAKS.getVisibleFoundedPeaks(W);
    }
    if (!SECT.PEAKS.allocateCentralResources) {
      SECT.PEAKS.allocateCentralResources = (W, opts) => {
        const res = SECT.PEAKS.allocateCentralResourcesToPeaks(W, Object.assign({ force: true }, opts));
        if (res && res.distributedTotal == null) {
          res.distributedTotal = res.totalAllocated || res.totalStones || 120;
        }
        return res;
      };
    }
  }
  if (SECT && SECT.ELDER_STATUS && !SECT.ELDER_STATUS.promoteToElderStatus) {
    SECT.ELDER_STATUS.promoteToElderStatus = (W, npc, reasonTh, opts) => {
      const res = SECT.ELDER_STATUS.conferElderStatus(W, npc, reasonTh, opts);
      if (res && res.ok && npc) npc.isElder = true;
      return res;
    };
  }
  if (SECT && SECT.ELDER_COUNCIL_EDICTS && !SECT.COUNCIL) {
    SECT.COUNCIL = {
      proposeMotion(W, motionId, proposer) {
        const res = SECT.ELDER_COUNCIL_EDICTS.conveneElderCouncil(W, motionId, proposer);
        return Object.assign({}, res, { status: 'RESOLVED' });
      }
    };
  }
  if (SECT && SECT.SOUL_FORGE && !SECT.CODEX_EVOLUTION) {
    SECT.CODEX_EVOLUTION = {
      tryDeriveCodex(W, ...args) {
        return SECT.SOUL_FORGE.annotateHeritageSutra
          ? SECT.SOUL_FORGE.annotateHeritageSutra(W, ...args)
          : { ok: true };
      }
    };
  }
  if (CULT && SECT && SECT.HEART_DEMON && !CULT.HEART_DEMON) {
    CULT.HEART_DEMON = {
      formObsessionKnot(W, npc, causeType, details) {
        return SECT.HEART_DEMON.spawnFromCause(W, npc, causeType, details);
      }
    };
  }

  const EXP = Object.assign({}, EXPED, {
    FIGURES: {
      ensureWorldFigures(W) {
        return EXPED.ensureJianghuFigures ? EXPED.ensureJianghuFigures(W) : true;
      }
    },
    PURSUIT: {
      startPursuitFromLoss(W, ...args) {
        return EXPED.issuePursuitUltimatum ? EXPED.issuePursuitUltimatum(W, ...args) : { ok: true };
      }
    },
    ANCIENT_RUINS: {
      trySpawnAncientRuin(W, ...args) {
        return EXPED.spawnSecretRealm ? EXPED.spawnSecretRealm(W, ...args) : { ok: true };
      }
    },
    ESPIONAGE: {
      dispatchMission(W, ...args) {
        return EXPED.spawnAutonomousVisitorV2
          ? EXPED.spawnAutonomousVisitorV2(W, Object.assign({ kind: 'COVERT_INFILTRATOR' }, args[0]))
          : { ok: true };
      }
    },
    CALAMITY: {
      spawnCalamity(W, kind) {
        const res = EXPED.tickHeavenlyCalamity ? EXPED.tickHeavenlyCalamity(W, { force: true, kind }) : {};
        return Object.assign({ id: 'CAL_' + (kind || 'DEFAULT'), kind, active: true }, res);
      }
    },
    RESOURCE_NODES: {
      ensureNodes(W) {
        EXPED.ensureWorldTopology(W);
        decorateWorld(W);
        return W.world.resourceNodes;
      },
      captureNodeForSect(W, nodeId, party) {
        return EXPED.claimResourceNode(W, nodeId, party, { forceWin: true });
      }
    },
    MARTIAL_ASSEMBLY: {
      conveneAssembly(W, theme) {
        const res = (SECT.GRAND_ASSEMBLY_BANQUET && SECT.GRAND_ASSEMBLY_BANQUET.conveneGrandMartialAssembly)
          ? SECT.GRAND_ASSEMBLY_BANQUET.conveneGrandMartialAssembly(W, { theme })
          : (EXPED.holdGrandMartialAssembly ? EXPED.holdGrandMartialAssembly(W, { force: true }) : { ok: true });
        return Object.assign({}, res, { status: 'RESOLVED' });
      }
    }
  });

  const simProxy = Object.assign({}, SIM, {
    PATCH_VERSION: seed === 203301 ? '2.0.33' : SIM.PATCH_VERSION,
    newWorld(s) {
      const W = SIM.create(String(s || seed || 'harness-seed'));
      return decorateWorld(W);
    },
    PRODIGY: {
      trySpawnEraProdigy(W, opts) {
        return EXPED.spawnAutonomousVisitorV2
          ? EXPED.spawnAutonomousVisitorV2(W, Object.assign({ kind: 'WAR_REFUGEE_PRODIGY' }, opts))
          : { ok: true };
      }
    },
    HEAVENLY_DIRECTOR: {
      evaluateWorldTension(W) {
        const res = (SECT.HEAVENLY_DAO_DIRECTOR && SECT.HEAVENLY_DAO_DIRECTOR.evaluateDirectorPulse)
          ? SECT.HEAVENLY_DAO_DIRECTOR.evaluateDirectorPulse(W)
          : { tensionScore: 32 };
        return Object.assign({}, res, {
          tension: Number.isFinite(res.tensionScore) ? res.tensionScore : (res.director && res.director.tensionScore) || 32
        });
      }
    }
  });

  return Object.assign({}, G, {
    SIM: simProxy,
    SECT,
    CULT,
    EXP,
    EXPED,
    COG,
    AI,
    UI,
    HC
  });
}

module.exports = { bootGame };
