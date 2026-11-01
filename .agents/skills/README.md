# Installed Codex game development skills

Focused skills for this project's vanilla HTML/JavaScript simulation game. Installed from `MRCalderon3D/everything-game-dev-code` at commit `1d83212e5084fe3b8000a8ae3c62bf972ad19f78` under its MIT license. Original `SKILL.md` files are retained. These cross-engine guidance skills do not change the game's runtime or select another engine.

| Skill | Apply when |
|---|---|
| `combat-design` | Designing combat roles, tradeoffs, readable counters and tuning. |
| `progression-design` | Adding major paths, subpaths, mastery and unlock pacing. |
| `economy-balancing` | Connecting recipes, prices, resource sinks and anti-exploit checks. |
| `gameplay-architecture` | A feature crosses modules or needs clear state ownership. |
| `ai-behavior-patterns` | Adding NPC decisions, actions, explanations and fallbacks. |
| `save-system-patterns` | Changing serialized game state, upgrades or recovery. |
| `performance-budgeting` | Adding simulation work or increasing population/effects. |
| `qa-test-matrix` | Mapping feature requirements to scenario and regression tests. |
| `web-testing` | Applying deterministic scenarios and browser smoke checks using existing runners. |
| `web-performance` | Profiling browser simulation/rendering costs, allocations and GC pressure. |

Skills live at `.agents/skills/<skill-name>/SKILL.md`, the portable project-level Agent Skills location. Read the applicable skills alongside the project's `AGENTS.md` and active patch prompt. They provide workflow guidance; repository instructions, actual code and tests remain authoritative when project-specific requirements differ.

## Context-efficient use

Codex's [official skill documentation](https://developers.openai.com/codex/skills/) describes progressive disclosure: names/descriptions are discovered first; full instructions load when selected. Use the routing table in `AGENTS.md` and read only relevant skills. Adding skills alone does not establish a measured token saving. This setup aims to reduce unrelated context, repeated investigation and failed iterations; no percentage saving has been measured.

The eight original skills cover design and planning. The two added web skills cover implementation-level browser verification and profiling. Use `web-testing` for executing browser/scenario work and `qa-test-matrix` for coverage planning; use `web-performance` for bottleneck work and `performance-budgeting` for budgeting a proposed feature. They need not all load together. Reuse the existing Node test harness, Playwright/system Chromium adapter and HTTP server instructions rather than installing a second runner by default.

## Online review and selection

Reviewed sources on 2 November 2026:

- [Everything Game Dev Code](https://github.com/MRCalderon3D/everything-game-dev-code/tree/1d83212e5084fe3b8000a8ae3c62bf972ad19f78): selected ten compact, Markdown-only skills; upstream files are unmodified, with hashes in `UPSTREAM.json` and the MIT license alongside them.
- [OpenAI skills catalog](https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431): reviewed the Playwright CLI skill. Its additional CLI workflow is unnecessary for the existing repository harness. The formerly named `develop-web-game` path returned 404 in this catalog revision; it was not installed.
- [Game development agent skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/tree/19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9): reviewed utility-AI and performance skills. Their longer cross-engine examples are less focused for this legacy JavaScript simulation than the selected short skills.

The upstream `web-js-ts-standards` skill was reviewed but not installed: its mandatory ES-module/global-removal approach conflicts with the protected script architecture. No external skill framework, hooks, packages or telemetry services are required by this installation. Related upstream agent/command names are reference pointers, not installed tools. Native discovery depends on the Codex client and opening a session inside this repository; if new skills are not shown, restart the session there. Files being present does not prove this chat's tool catalog has refreshed.
