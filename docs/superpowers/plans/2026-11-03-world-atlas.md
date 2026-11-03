# World Atlas Implementation Plan

**Goal:** Replace the crowded world graph with a geographic, accessible, zoomable map connected to authoritative world state and real travel.

**Architecture:** Keep simulation topology and its stable IDs as authority; build a read-only UI atlas of actual topology, region discoveries, fortune-site records, active anomalies/secret realms and the dimensional gate. Place abstract fortune sites only approximately and explain their random selection. Use an embedded hand-painted terrain and DOM markers with alignment emblems, deterministic clustering and a non-modal detail panel. Dispatch supported missions through their existing mechanics with explicit real travel; never fabricate travel times.

**Constraints:** Thai labels; do not modify human_core.js; preserve script order and standalone offline build; no old-save compatibility required; no fabricated destination, reward, route or claim of real travel for an instant action.

1. Test atlas coverage, locations, faction identities, dynamic events, gate, fortune truthfulness and travel estimates against runtime data; implement adapter and deterministic markers.
2. Test actual deferred dispatch and settlement for sieges, resource claims, timed anomalies and existing trials. Preserve node IDs; reject unavailable parties. Build responsive atlas with zoom, pan, filters, clustering, detail panel and real action feedback.
3. Browser-playtest portrait, landscape and desktop: labels, no HUD overlap, clicks and touch/pinch, scroll, zoom and multi-marker clusters; verify no console errors. Validate builds, schema, current save roundtrip, regression, offline bundle and core lock; document results and update project skills.
