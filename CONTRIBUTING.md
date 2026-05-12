# Contributing to oxlint-plugin-effect

Thanks for your interest in contributing. This guide covers everything you need to get started.

## Prerequisites

- [Bun](https://bun.sh) >= 1.3.0

## Setup

```sh
git clone https://github.com/mpsuesser/oxlint-plugin-effect.git
cd oxlint-plugin-effect
bun install
```

## Development Workflow

```sh
bun run check       # lint + format (auto-fix)
bun run test        # run all tests
bun run typecheck   # tsgo type-check only
```

Run a single test file or by name:

```sh
bunx vitest run test/Rule.test.ts
bunx vitest run -t "reports for matching"
```

## Submitting a Pull Request

1. Fork the repo and create a branch from `main`.
2. Add or update tests for any changed behavior.
3. Make sure all three checks pass:
    ```sh
    bun run check && bun run test && bun run typecheck
    ```
4. Open a pull request with a clear description of the change.

## Code Style

- Tabs, single quotes, semicolons, no trailing commas
- Rules are defined with the [`effect-oxlint`](https://github.com/mpsuesser/effect-oxlint) SDK
- JSDoc with `@since` on every export
- `readonly` on all fields and parameters

## Editor Setup

The `.vscode/` directory is gitignored. If you use VS Code, create `.vscode/settings.json` with:

```json
{
	"typescript.tsdk": "node_modules/typescript/lib",
	"typescript.enablePromptUseWorkspaceTsdk": true,
	"typescript.experimental.useTsgo": true
}
```

This enables the workspace TypeScript SDK and tsgo for native type-checking.

## Reporting Issues

Use the [GitHub issue templates](https://github.com/mpsuesser/oxlint-plugin-effect/issues/new/choose) for bug reports and feature requests.
