# oxlint-effect

An opinionated [oxlint](https://oxc.rs/docs/guide/usage/linter) plugin for [Effect v4](https://effect.website) that drives your codebase toward being fully Effect-first. It flags imperative patterns, raw Node APIs, untyped errors, and other non-idiomatic code, steering every module toward Effect services, typed error channels, and functional composition.

50 rules. Zero configuration required.

## Installation

```sh
bun add oxlint-effect
```

Then register the plugin in your oxlint config:

```jsonc
// oxlint.json
{
  "plugins": ["oxlint-effect"]
}
```

## What it catches

Every rule ships a clear diagnostic message explaining *why* the pattern is problematic and *what* to use instead. Rules are grouped by the AST pattern they target:

### Statement bans

| Rule | What it flags |
|---|---|
| `effect/avoid-try-catch` | `try`/`catch` blocks -- use `Effect.try` or `Effect.tryPromise` with `Schema.TaggedErrorClass` |
| `effect/prefer-match-over-switch` | `switch` statements -- use `Match.value` for exhaustive, type-safe branching |
| `effect/imperative-loops` | `for`, `while`, `do`/`while` -- use `Arr.map`, `Arr.filter`, `Effect.forEach` |

### Import bans

| Rule | What it flags |
|---|---|
| `effect/use-filesystem-service` | `fs` / `node:fs` imports -- use `FileSystem` from `@effect/platform` |
| `effect/use-path-service` | `path` / `node:path` imports -- use `Path` from `@effect/platform` |
| `effect/use-command-executor-service` | `child_process` imports -- use `CommandExecutor` from `@effect/platform` |
| `effect/use-http-client-service` | `node-fetch`, `axios`, `got` imports -- use Effect `HttpClient` |
| `effect/avoid-platform-coupling` | `@effect/platform-node` in non-entrypoint code |
| `effect/avoid-node-imports` | Bare `node:*` imports in platform-agnostic code |

### Member expression bans

| Rule | What it flags |
|---|---|
| `effect/avoid-data-tagged-error` | `Data.TaggedError` -- use `Schema.TaggedErrorClass` for structured errors |
| `effect/avoid-direct-json` | `JSON.parse` / `JSON.stringify` -- use `Schema.fromJsonString` |
| `effect/avoid-option-getorthrow` | `Option.getOrThrow` -- handle absence with `Match`, `getOrElse`, or `pipe` |
| `effect/avoid-process-env` | `process.env` -- use a `Config` service for typed, layered configuration |
| `effect/use-random-service` | `Math.random` -- use the `Random` service for testability |
| `effect/use-console-service` | `console.*` -- use the `Console` service for testability |
| `effect/effect-run-in-body` | `Effect.runSync` / `runPromise` outside entrypoints |
| `effect/effect-promise-vs-trypromise` | `Effect.promise` -- prefer `Effect.tryPromise` to capture rejections in the typed error channel |
| `effect/prefer-schema-class` | `Schema.struct` -- prefer `Schema.Class` or `Schema.TaggedClass` |
| `effect/stream-large-files` | `fs.readFile` / `fs.readFileString` -- consider `Stream` for large files |

### Call expression rules

| Rule | What it flags |
|---|---|
| `effect/use-clock-service` | `Date.now()` / `new Date()` -- use the `Clock` service |
| `effect/avoid-native-fetch` | `fetch()` / `globalThis.fetch()` -- use Effect `HttpClient` |
| `effect/avoid-react-hooks` | React hooks (`useState`, `useEffect`, etc.) in Effect code |
| `effect/avoid-sync-fs` | `fs.readFileSync` and other sync fs calls |
| `effect/avoid-untagged-errors` | `new Error(...)` -- use `Schema.TaggedErrorClass` for typed, tagged errors |
| `effect/prefer-arr-sort` | `Array.prototype.sort` -- use `Arr.sort` with `Order` combinators |

### Type-level rules

| Rule | What it flags |
|---|---|
| `effect/avoid-any` | `as any` and `as unknown as T` casts |
| `effect/avoid-object-type` | The `object` type -- use a `Schema` or a specific interface |
| `effect/avoid-ts-ignore` | `@ts-ignore` / `@ts-expect-error` comments |
| `effect/avoid-mutable-state` | `let` bindings -- consider `Ref` for fiber-safe mutable state |
| `effect/avoid-schema-suffix` | Schema types suffixed with `Schema` -- name them after the domain concept |
| `effect/prefer-option-over-null` | `T \| null`, `T \| undefined` unions -- use `Option<T>` |
| `effect/casting-awareness` | `as T` type assertions (excluding `as const` and `as never`) |

### Complex / contextual rules

| Rule | What it flags |
|---|---|
| `effect/context-tag-extends` | Removed Effect v4 APIs (`Context.Tag`, `Context.GenericTag`, `Effect.Service`) -- use `ServiceMap.Service` |
| `effect/throw-in-effect-gen` | `throw` inside `Effect.gen` -- use `yield* Effect.fail()` (allows throw inside `Effect.tryPromise({ try })`) |
| `effect/prefer-effect-fn` | `Effect.gen` assigned to variables or used in service methods -- use `Effect.fn` for automatic tracing |
| `effect/yield-in-for-loop` | `yield*` inside `for` loops -- use `Effect.forEach` |
| `effect/avoid-expect-in-if` | `expect()` inside `if` blocks in tests -- leads to silently passing tests |
| `effect/avoid-yield-ref` | Incorrect `yield*` usage with `Ref` |
| `effect/effect-catchall-default` | `Effect.catch` / `Effect.catchCause` returning `Effect.succeed(default)` -- use `catchTag` for targeted recovery |
| `effect/avoid-direct-tag-checks` | Direct `_tag` checks -- use `Match` or Effect predicates |
| `effect/vm-in-wrong-file` | View Model interfaces and layers outside `.vm.ts` files |
| `effect/use-temp-file-scoped` | Temporary file usage that should be scoped |
| `effect/avoid-native-object-helpers` | `Object.keys`, `Object.entries`, etc. -- use `R.*` from `effect/Record` |

### Pattern enforcement rules

| Rule | What it flags |
|---|---|
| `effect/prefer-namespace-imports` | Named imports from Effect submodules -- use `import * as Arr from "effect/Array"` with canonical aliases |
| `effect/prefer-effect-is` | `typeof x === "string"` -- use `P.isString(x)` and other `Predicate` helpers |
| `effect/prefer-duration-constructors` | Raw millisecond literals -- use `Duration.seconds(5)`, `Duration.minutes(1)`, etc. |
| `effect/prefer-arr-match` | Pattern matching on arrays that could use `Arr.match` |
| `effect/require-schema-type-alias` | Exported schema constants without a matching `export type Foo = typeof Foo.Type` |
| `effect/require-filter-metadata` | `Schema.makeFilter` / `Schema.makeFilterGroup` without `identifier`, `title`, and `description` |
| `effect/no-barrel-imports` | Named imports from `effect` barrel -- use submodule imports |
| `effect/no-opaque-instance-fields` | Instance members on `Schema.Opaque` classes -- they should be pure wrappers |

## Writing rules

Rules are defined with the [`effect-oxlint`](https://github.com/3thr33s/effect-oxlint) SDK. There are several helpers depending on the complexity of what you need:

**Ban a statement type** (one-liner):

```ts
import { Rule } from 'effect-oxlint';

export default Rule.banStatement('TryStatement', {
  message: 'Use Effect.try or Effect.tryPromise instead of try/catch.'
});
```

**Ban a member access** (one-liner):

```ts
import { Rule } from 'effect-oxlint';

export default Rule.banMember('JSON', ['parse', 'stringify'], {
  message: 'Use Schema.fromJsonString for typed JSON boundaries.'
});
```

**Ban an import** (one-liner):

```ts
import { Rule } from 'effect-oxlint';

export default Rule.banImport(
  (s) => s === 'node:fs' || s === 'fs',
  { message: "Use Effect's FileSystem service from @effect/platform." }
);
```

**Custom rule with full AST visitor** (for complex logic):

```ts
import type { ESTree } from 'effect-oxlint';
import * as Effect from 'effect/Effect';
import { Diagnostic, Rule, RuleContext } from 'effect-oxlint';

export default Rule.define({
  name: 'my-rule',
  meta: Rule.meta({
    type: 'suggestion',
    description: 'Describe what this rule does'
  }),
  create: function* () {
    const ctx = yield* RuleContext;
    return {
      CallExpression: (node: ESTree.Node) => {
        // your logic here
        return ctx.report(
          Diagnostic.make({ node, message: '...' })
        );
      }
    };
  }
});
```

Rules use Effect generators for their `create` function, giving you access to `Ref`, `Effect.gen`, and other Effect primitives for tracking state across AST nodes. See the [`effect-oxlint`](https://github.com/3thr33s/effect-oxlint) repo for full SDK documentation.

## Development

```sh
bun install
bun test          # run the test suite
bun run check     # lint + format
```

## License

MIT
