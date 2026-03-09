# @ugsys/ui-lib — task runner

# Build CJS + ESM + .d.ts outputs
build:
    pnpm build

# Run tests with coverage
test:
    pnpm test

# Run tests in watch mode
test-watch:
    pnpm test:watch

# Lint: ESLint + TypeScript type check
lint:
    pnpm lint

# ESLint only (fast, used in pre-commit)
lint-eslint:
    pnpm lint:eslint

# Format source files with Prettier
format:
    pnpm format

# Check formatting without writing (used in pre-commit)
format-check:
    pnpm format:check

# TypeScript type check only (used in pre-push)
typecheck:
    pnpm typecheck

# Install git hooks (pre-commit + pre-push)
install-hooks:
    bash scripts/install-hooks.sh

# Full quality gate: lint + typecheck + test (mirrors CI)
check:
    just lint
    just test

# Release: bump version, build, tag
# Usage: just release 0.2.0
release version:
    pnpm version {{version}} --no-git-tag-version
    just build
    git add package.json
    git commit -m "chore: release v{{version}}"
    git tag v{{version}}
    @echo "Tagged v{{version}} — push with: git push origin main --tags"
