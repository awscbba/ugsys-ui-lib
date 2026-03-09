#!/usr/bin/env bash
# Install git hooks for @ugsys/ui-lib
# Usage: bash scripts/install-hooks.sh
# Or via justfile: just install-hooks

set -euo pipefail

HOOKS_DIR="$(git rev-parse --git-dir)/hooks"
SCRIPTS_DIR="$(dirname "$0")/hooks"

cp "$SCRIPTS_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
cp "$SCRIPTS_DIR/pre-push"   "$HOOKS_DIR/pre-push"
chmod +x "$HOOKS_DIR/pre-commit" "$HOOKS_DIR/pre-push"

echo "✅ Git hooks installed:"
echo "   pre-commit  — ESLint + Prettier check, blocks commits to main"
echo "   pre-push    — tsc + vitest coverage gate, blocks pushes to main"
