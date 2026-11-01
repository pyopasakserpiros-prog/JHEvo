# Execute the v2.0.8 patch

This archive is a ready-to-execute implementation handoff. The user asks you to implement the next patch, not merely summarize these files. Begin work directly; no additional chat prompt is required to define the task.

1. Read and execute `SUBSEQUENT_PATCH_PROMPT_V2_0_8_EN.md`, including its appended advisory reference (sections 10–16). Use independent judgment: adapt or replace suggestions when a better design fits the game and constraints, and document your reasoning.
2. The baseline is the reviewed v2.0.7 game. Its only source tree and playable standalone are `GAME_SOURCE/` and `GAME_SOURCE/JianghuSect_single.html`. Work from this baseline. v2.0.8 is planned work, not already implemented content.
3. Consult `BASELINE_REVIEW.md` for review results and limitations. `PATCH_IMPLEMENTATION_REPORT.md` is the v2.0.7 author's report, retained for current-system context; verify relevant claims against source. Do not reimplement completed baseline features without a confirmed reason.
4. Implement the three new paths, 18 subpaths, companion lifecycle and integrations described in the active prompt. Prioritize complete functioning behavior, appropriate NPC decisions, balance and honest verification. If external research is blocked, record the limitation and continue with available evidence and reasoned design.
5. Deliver an actual downloadable ZIP containing the runnable game, matching complete source/assets/build tools, tests, a detailed change/decision/validation report, known limitations and unfinished work, and a separate detailed English prompt for the subsequent patch. Explain significant choices, additional work and deviations. Follow the active prompt's constraints and acceptance criteria.

The existing test files with older patch names remain necessary regression coverage. Their names do not make them obsolete. Old release packages, superseded prompts and duplicate bundles have been removed to keep this handoff focused.
