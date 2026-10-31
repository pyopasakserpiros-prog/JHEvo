#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# Agent Bridge for Termux
# Enables seamless command execution between Antigravity and Termux
# ==============================================================================

WORKSPACE="/data/data/com.termux/files/home/jhevo-work"
CMD_FILE="$WORKSPACE/.agent_cmd"
OUT_FILE="$WORKSPACE/.agent_out"
STATUS_FILE="$WORKSPACE/.agent_status"

cd "$WORKSPACE" || exit 1

# One-time initial info dump
echo "=== GIT STATUS ===" > "$OUT_FILE"
git status >> "$OUT_FILE" 2>&1
echo -e "\n=== GIT LOG ===" >> "$OUT_FILE"
git log -5 --oneline >> "$OUT_FILE" 2>&1
echo -e "\n=== FILE STRUCTURE (TRACKED) ===" >> "$OUT_FILE"
git ls-files >> "$OUT_FILE" 2>&1
echo -e "\n=== DIRECTORY TREE (DEPTH 2) ===" >> "$OUT_FILE"
ls -la >> "$OUT_FILE" 2>&1
echo "0" > "$STATUS_FILE"

echo "[Agent Bridge] Running in $WORKSPACE"
echo "[Agent Bridge] Ready and waiting for commands..."

while true; do
  if [ -f "$CMD_FILE" ]; then
    CMD=$(cat "$CMD_FILE")
    rm -f "$CMD_FILE"
    echo "[Agent Bridge] Executing: $CMD"
    echo "running" > "$STATUS_FILE"
    eval "$CMD" > "$OUT_FILE" 2>&1
    EXIT_CODE=$?
    echo "$EXIT_CODE" > "$STATUS_FILE"
  fi
  sleep 1
done
