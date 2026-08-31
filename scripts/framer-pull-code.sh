#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_URL="${FRAMER_PROJECT_URL:-https://framer.com/projects/Govinda-Portfolio--KFUflMBkwkSj9SBYfgHD-fkTqY}"
DEST="$ROOT/src/framer/code"

cd "$ROOT"

SESSION="$(npx @framer/agent@latest session new "$PROJECT_URL" | tail -n 1 | tr -d '[:space:]')"
if [[ -z "$SESSION" ]]; then
  echo "Could not open a Framer session" >&2
  exit 1
fi

npx @framer/agent@latest exec -s "$SESSION" <<'FRAMER_EXEC'
const fs = require("fs");
const path = require("path");
const os = require("os");
const files = await framer.getCodeFiles();
const root = path.join(os.tmpdir(), "framer-code-pull");
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root, { recursive: true });
for (const f of files) {
  const dest = path.join(root, f.path);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, f.content, "utf8");
}
const manifest = files.map((f) => ({
  id: f.id,
  name: f.name,
  path: f.path,
  exports: (f.exports || []).map((e) => ({ name: e.name, type: e.type })),
}));
fs.writeFileSync(path.join(root, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(root);
FRAMER_EXEC

AGENT_OUT="$(node -e 'console.log(require("os").tmpdir())')/framer-code-pull"
if [[ ! -d "$AGENT_OUT" ]]; then
  echo "Pull did not write code files" >&2
  exit 1
fi

rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$AGENT_OUT/." "$DEST/"

# Pulled files target Framer's TS env; skip checking them in this app.
while IFS= read -r -d '' file; do
  if ! head -n 1 "$file" | grep -q '@ts-nocheck'; then
    tmpf="$(mktemp)"
    { echo '// @ts-nocheck'; cat "$file"; } > "$tmpf"
    mv "$tmpf" "$file"
  fi
done < <(find "$DEST" -name '*.tsx' -print0)

echo "Pulled Framer code components into src/framer/code"
