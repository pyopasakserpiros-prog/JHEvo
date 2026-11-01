# JianghuSect with Antigravity CLI on Termux

Researched 2 November 2026. This setup prepares an existing native Termux development shell and shares the project's ten Markdown skills with Antigravity. It does not install or modify Antigravity itself, its authentication, Android system files or third-party binary patches.

## On the phone

Use the project inside Termux's private home directory, for example `~/projects/JHEvo`. Android shared storage can impose filesystem/executable restrictions, so copy an extracted ZIP there before working. Preserve any work in an existing checkout; do not replace it blindly.

From the project root containing this file:

```bash
bash tools/termux/setup.sh --check
bash tools/termux/setup.sh --install
```

The install command uses the normal Termux package manager and installs only missing `git`, `nodejs-lts`, `python` and `ripgrep`. It refreshes package indexes when needed, preserves verification, and does not upgrade all installed packages. If another Node package is already installed, it is checked rather than automatically replaced. An older Node installation may need an explicit user-managed upgrade.

Use your existing Antigravity launcher from this project root. The official CLI command is `agy`; community Termux ports may use different wrappers. Do not reinstall a working CLI merely because its launcher has a different name. In the official interactive CLI, use `/skills reload` or start a new conversation after adding skills. A skill such as `web-testing` becomes available as `/web-testing`. Wrapper/older-version behavior can differ; check its help if commands are absent.

Antigravity's current documentation supports the same `.agents/skills/<name>/SKILL.md` location used by Codex. There is no need to duplicate all skills globally or download another bundle. The routing/context guidance is in `AGENTS.md`; explicitly direct a wrapper that does not discover that file to read it. If already using a `GEMINI.md`, preserve its instructions and reference `AGENTS.md` there rather than replacing it or copying the whole patch prompt into every turn. After updating a previously downloaded checkout, use `git pull` in that clone, then run `/skills reload` from an Antigravity CLI session rooted at the checkout; do not make another clone.

## Develop and inspect locally

```bash
cd GAME_SOURCE
node test/core_lock.js
node test/standalone.js
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/index.html` in the Android browser to check touch controls and UI. The standalone artifact is `JianghuSect_single.html`; rebuilding it with `node tools/build_single.js` writes a tracked file, so do that only when intended. The two Node checks above are a useful start, not the complete regression suite.

For larger work, use focused existing tests while iterating, capture verbose output to a log, then complete the required broader checks. Keep parallel workers conservative on a phone; begin with one if using the parallel runner (`TEST_WORKERS=1 node tools/run_parallel_tests.js`). Check the runner's real results; it includes browser tests and may fail without a working browser environment.

## Browser automation boundary

Playwright's documented host platforms are desktop Windows, macOS and specified Linux distributions; native Android/Termux is not listed. Do not assume `npx playwright install` will provide a working Android browser binary. Termux maintains a Chromium package in its X11 repository, but availability, architecture, dependencies, executable paths and CDP compatibility must be checked on the actual phone before installing it.

This game's existing CDP helper searches desktop Chromium paths; a supported local executable can be selected through `CHROMIUM_PATH`, but that alone does not establish that all tests will work. This cloud machine's `/workspace/.jhevo-cloud` adapter uses cloud-specific paths and should not be copied unchanged to Termux. Until native browser automation is verified, use Android Chrome for actual touch inspection and the existing cloud/desktop setup for automated browser regression. Keep manual and automated results distinct.

## Sources and validation limits

- [Official Antigravity agent skills documentation](https://antigravity.google/docs/skills): project skills location, CLI command, reload behavior and progressive disclosure.
- [Google Codelab: Authoring Antigravity Skills](https://codelabs.developers.google.com/getting-started-with-antigravity-skills): shared workspace/global skill scopes.
- [Official Termux package sources](https://github.com/termux/termux-packages): `packages/nodejs-lts`, `packages/python`, and `x11-packages/chromium`; use the device's repository candidate rather than hardcoding the upstream version observed during research.
- [Termux execution environment](https://github.com/termux/termux-packages/wiki/Termux-execution-environment): Android/Termux filesystem and execution constraints.
- [Playwright installation/system requirements](https://playwright.dev/docs/intro#system-requirements): supported host environments.

The script and portable files can be inspected on this cloud workspace. Installation, Antigravity discovery/authentication, Android Chrome access and the game's behavior on your phone require execution there. No remote connection to the phone is configured in this chat, so a successful cloud check is not a phone-installation result.
