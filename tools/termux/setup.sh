#!/usr/bin/env bash
# Native Termux prerequisites only. Run from an existing project checkout.
set -euo pipefail

mode=${1:---check}
case "$mode" in
  --check|--install) ;;
  *) echo 'Usage: bash tools/termux/setup.sh [--check|--install]' >&2; exit 2 ;;
esac
repo=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)

if [[ "$mode" == --install ]]; then
  if ! command -v pkg >/dev/null 2>&1 || [[ -z ${TERMUX_VERSION:-} && ${PREFIX:-} != */com.termux/files/usr ]]; then
    echo 'Installation requires a native Termux shell; use --check for inspection elsewhere.' >&2
    exit 2
  fi
  packages=()
  command -v git >/dev/null 2>&1 || packages+=(git)
  command -v node >/dev/null 2>&1 || packages+=(nodejs-lts)
  command -v python3 >/dev/null 2>&1 || packages+=(python)
  command -v rg >/dev/null 2>&1 || packages+=(ripgrep)
  if ((${#packages[@]})); then
    pkg update -y
    pkg install -y "${packages[@]}"
  fi
fi

failed=0
for tool in git node python3 rg; do
  if command -v "$tool" >/dev/null 2>&1; then
    echo "AVAILABLE: $tool"
  else
    echo "MISSING: $tool" >&2
    failed=1
  fi
done
if command -v node >/dev/null 2>&1; then
  node --version
  node -e 'if (Number(process.versions.node.split(".")[0]) < 18) { console.error("Node 18+ required; current Termux LTS recommended."); process.exit(1); }' || failed=1
fi
if command -v python3 >/dev/null 2>&1; then
  python3 - "$repo" <<'PY' || failed=1
import hashlib, json, pathlib, sys
root = pathlib.Path(sys.argv[1]) / '.agents' / 'skills'
manifest = json.loads((root / 'UPSTREAM.json').read_text())
for relative, metadata in manifest['installed'].items():
    file = root / relative
    if not file.is_file() or hashlib.sha256(file.read_bytes()).hexdigest() != metadata['sha256']:
        raise SystemExit('Skill integrity check failed: ' + relative)
skills = sorted(p.parent.name for p in root.glob('*/SKILL.md'))
if not skills:
    raise SystemExit('No project skills found')
print('Project skills present and hashes match: ' + ', '.join(skills))
PY
fi
if command -v agy >/dev/null 2>&1; then
  echo 'Antigravity CLI command found: agy (authentication and execution not tested).'
else
  echo 'agy not found on PATH. If your launcher uses another name, use its existing command.'
fi
echo 'Browser automation is not validated by this prerequisites check.'
exit "$failed"
