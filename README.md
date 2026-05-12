# oxlint-plugin-effect

[![npm](https://img.shields.io/npm/v/@mpsuesser/oxlint-plugin-effect)](https://www.npmjs.com/package/@mpsuesser/oxlint-plugin-effect)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

An opinionated [oxlint](https://oxc.rs/docs/guide/usage/linter) plugin for [Effect v4](https://effect.website) that drives every module toward Effect services, typed error channels, and functional composition. It flags imperative patterns, raw Node APIs, untyped errors, and other non-idiomatic shapes at the lint layer so they never make it into review.

The plugin ships **54 rules** namespaced under `effect/`. Rules are implemented with the [`effect-oxlint`](https://github.com/mpsuesser/effect-oxlint) SDK and run as standard oxlint custom rules.

## Installation

```sh
npm install @mpsuesser/oxlint-plugin-effect
# or
bun add @mpsuesser/oxlint-plugin-effect
```

Register the plugin and enable the recommended category in your oxlint config:

```jsonc
// oxlint.json
{
	"plugins": ["@mpsuesser/oxlint-plugin-effect"],
	"categories": {
		"recommended": "error"
	}
}
```

All 54 rules ship in the `recommended` category, so the snippet above turns the whole rule set on at once. To switch the severity, change `"error"` to `"warn"`.

To turn an individual rule off, set it to `"off"` in the `rules` block. Rules are namespaced under `effect/`:

```jsonc
{
	"plugins": ["@mpsuesser/oxlint-plugin-effect"],
	"categories": {
		"recommended": "error"
	},
	"rules": {
		"effect/avoid-native-object-helpers": "off"
	}
}
```

To suppress a rule at a specific call site, use oxlint's native disable directive:

```ts
// oxlint-disable-next-line effect/avoid-try-catch -- gating a third-party callback we can't change
try { ... } catch (e) { ... }
```

## Rules at a glance

| Rule                                                            | What it catches                                                                  |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`avoid-any`](#avoid-any)                                       | `as any` and `as unknown as T` casts                                             |
| [`avoid-data-tagged-error`](#avoid-data-tagged-error)           | `Data.TaggedError` — use `Schema.TaggedErrorClass`                               |
| [`avoid-direct-json`](#avoid-direct-json)                       | `JSON.parse` / `JSON.stringify` — use `Schema.fromJsonString`                    |
| [`avoid-direct-tag-checks`](#avoid-direct-tag-checks)           | `x._tag === "..."` checks — use `$is` / `$match` / `Match`                       |
| [`avoid-expect-in-if`](#avoid-expect-in-if)                     | `expect(...)` nested inside `if` blocks in tests                                 |
| [`avoid-mutable-state`](#avoid-mutable-state)                   | `let` bindings inside service / layer factories                                  |
| [`avoid-native-fetch`](#avoid-native-fetch)                     | Native `fetch()` — use Effect `HttpClient`                                       |
| [`avoid-native-object-helpers`](#avoid-native-object-helpers)   | `Object.keys` / `Object.entries` / `Object.fromEntries` etc.                     |
| [`avoid-node-imports`](#avoid-node-imports)                     | Bare `node:*` imports in platform-agnostic code                                  |
| [`avoid-non-null-assertion`](#avoid-non-null-assertion)         | The `!` non-null assertion operator                                              |
| [`avoid-object-type`](#avoid-object-type)                       | `Object` and `{}` as types                                                       |
| [`avoid-option-getorthrow`](#avoid-option-getorthrow)           | `.getOrThrow` on `Option` / `Either` / `Result`                                  |
| [`avoid-platform-coupling`](#avoid-platform-coupling)           | `@effect/platform-bun` imports in binding packages                               |
| [`avoid-process-env`](#avoid-process-env)                       | `process.env` — use a `Config` service                                           |
| [`avoid-react-hooks`](#avoid-react-hooks)                       | `useState` / `useEffect` / `useReducer` — use Effect Atom VMs                    |
| [`avoid-schema-suffix`](#avoid-schema-suffix)                   | Schema constants suffixed with `Schema`                                          |
| [`avoid-sync-fs`](#avoid-sync-fs)                               | `fs.readFileSync` and other synchronous `fs` calls                               |
| [`avoid-try-catch`](#avoid-try-catch)                           | `try` / `catch` in Effect code                                                   |
| [`avoid-ts-ignore`](#avoid-ts-ignore)                           | `@ts-ignore` / `@ts-expect-error` comments                                       |
| [`avoid-untagged-errors`](#avoid-untagged-errors)               | `new Error(...)` and `instanceof Error` for recoverable failures                 |
| [`avoid-yield-ref`](#avoid-yield-ref)                           | `yield* ref` / `yield* deferred` / `yield* fiber` (removed in v4)                |
| [`casting-awareness`](#casting-awareness)                       | `as T` assertions (excluding `as const` / `as never`)                            |
| [`context-tag-extends`](#context-tag-extends)                   | `Context.Tag` / `Context.GenericTag` / `Effect.Service` / legacy `ServiceMap.*`  |
| [`effect-catchall-default`](#effect-catchall-default)           | Blanket `Effect.catch` / `catchCause` swallowing all errors                      |
| [`effect-promise-vs-trypromise`](#effect-promise-vs-trypromise) | `Effect.promise` — prefer `Effect.tryPromise`                                    |
| [`effect-run-in-body`](#effect-run-in-body)                     | `Effect.runSync` / `runPromise` / `runFork` outside entrypoints                  |
| [`imperative-loops`](#imperative-loops)                         | `for` / `while` / `do…while` in domain code                                      |
| [`no-barrel-imports`](#no-barrel-imports)                       | Named imports from the `effect` barrel package                                   |
| [`no-opaque-instance-fields`](#no-opaque-instance-fields)       | Instance members on `Schema.Opaque` classes                                      |
| [`prefer-arr-match`](#prefer-arr-match)                         | Manual empty / non-empty branching — use `Arr.match`                             |
| [`prefer-arr-sort`](#prefer-arr-sort)                           | `Array.prototype.sort` — use `Arr.sort` with an `Order`                          |
| [`prefer-duration-constructors`](#prefer-duration-constructors) | Raw millisecond numbers passed to Effect timing APIs                             |
| [`prefer-effect-fn`](#prefer-effect-fn)                         | `Effect.gen` bound to a const or used in a service method                        |
| [`prefer-effect-is`](#prefer-effect-is)                         | `typeof x === "string"` — use `P.isString` and friends                           |
| [`prefer-match-over-switch`](#prefer-match-over-switch)         | `switch` statements — use `Match.value`                                          |
| [`prefer-namespace-imports`](#prefer-namespace-imports)         | Named imports from Effect submodules — use namespace imports                     |
| [`prefer-option-over-null`](#prefer-option-over-null)           | `T \| null` / `T \| undefined` union types                                       |
| [`prefer-redacted-config`](#prefer-redacted-config)             | `Config.string("apiKey")` etc. for secret-looking keys                           |
| [`prefer-schema-class`](#prefer-schema-class)                   | `Schema.Struct` for named types — prefer `Schema.Class`                          |
| [`require-effect-concurrency`](#require-effect-concurrency)     | `Effect.all` / `forEach` / `validateAll` without explicit `concurrency`          |
| [`require-filter-metadata`](#require-filter-metadata)           | `Schema.makeFilter` / `makeFilterGroup` missing identifier / title / description |
| [`require-schema-type-alias`](#require-schema-type-alias)       | Exported schema constant without a matching `export type` alias                  |
| [`stream-large-files`](#stream-large-files)                     | `fs.readFile` on paths that look like large / unbounded files                    |
| [`throw-in-effect-gen`](#throw-in-effect-gen)                   | `throw` inside `Effect.gen` / `Effect.fn` / `Effect.fnUntraced`                  |
| [`use-clock-service`](#use-clock-service)                       | `new Date()` / `Date.now()` / `Date.UTC()` — use `Clock` / `DateTime`            |
| [`use-command-executor-service`](#use-command-executor-service) | `child_process` / `node:child_process` imports                                   |
| [`use-console-service`](#use-console-service)                   | `console.*` — use `Effect.log*` / `Console`                                      |
| [`use-filesystem-service`](#use-filesystem-service)             | `fs` / `node:fs` / `fs/promises` imports                                         |
| [`use-http-client-service`](#use-http-client-service)           | `http` / `https` / `node:http` / `node:https` imports                            |
| [`use-path-service`](#use-path-service)                         | `path` / `node:path` imports                                                     |
| [`use-random-service`](#use-random-service)                     | `Math.random()` — use the `Random` service                                       |
| [`use-temp-file-scoped`](#use-temp-file-scoped)                 | `os.tmpdir()` / unscoped `makeTempFile` / `makeTempDirectory`                    |
| [`vm-in-wrong-file`](#vm-in-wrong-file)                         | View Model interfaces and layers outside `.vm.ts` files                          |
| [`yield-in-for-loop`](#yield-in-for-loop)                       | `yield*` inside `for` loops — use `Effect.forEach`                               |

---

### `avoid-any`

`as any` and `as unknown as T` casts erase type safety. Validate unknown data with `Schema.decodeUnknown*`, preserve types with generics, or fix the upstream type.

```ts
// ❌
const user = data as any;
const config = JSON.parse(raw) as unknown as Config;

// ✅
const user = yield * Schema.decodeUnknown(User)(data);
const config = yield * Schema.decodeUnknownString(Config)(raw);
```

### `avoid-data-tagged-error`

`Data.TaggedError` does not integrate with the Schema encode / decode pipeline. Use `Schema.TaggedErrorClass` so errors round-trip through RPC, serialization, and structured logging.

```ts
// ❌
class NotFound extends Data.TaggedError('NotFound')<{ id: string }> {}

// ✅
class NotFound extends Schema.TaggedErrorClass<NotFound>('NotFound')(
	'NotFound',
	{ id: Schema.String }
) {}
```

### `avoid-direct-json`

`JSON.parse` produces `any` and `JSON.stringify` swallows schema shape. Use `Schema.fromJsonString(MySchema)` at typed boundaries or `Schema.UnknownFromJsonString` for unknown payloads.

```ts
// ❌
const user: User = JSON.parse(raw);
const body = JSON.stringify(payload);

// ✅
const user = yield * Schema.decode(Schema.fromJsonString(User))(raw);
const body = yield * Schema.encode(Schema.fromJsonString(Payload))(payload);
```

### `avoid-direct-tag-checks`

Reading `_tag` directly couples call sites to the discriminant string. Use the auto-generated `$is` / `$match` helpers or `Match.value` so renaming a variant is a typed refactor.

```ts
// ❌
if (result._tag === 'Success') return result.value;
switch (msg._tag) {
	case 'Loaded':
		/* ... */
}

// ✅
if (Result.$is('Success')(result)) return result.value;
return Match.value(msg).pipe(
	Match.tag('Loaded', (m) => /* ... */),
	Match.exhaustive
);
```

### `avoid-expect-in-if`

`expect(...)` nested inside an `if` block silently passes when the condition is false. Narrow first, then assert.

```ts
// ❌
if (result) {
	expect(result.id).toBe('abc');
}

// ✅
expect(result).toBeDefined();
expect(result.id).toBe('abc');
```

### `avoid-mutable-state`

`let` bindings inside service or layer factories hide fiber-visible state and lifecycle behavior. Use `Ref`, `SynchronizedRef`, or `Effect.cached` so concurrent access is explicit. `let` inside pure helpers and narrow scopes is fine.

```ts
// ❌
export const CounterLive = Layer.effect(
	Counter,
	Effect.gen(function* () {
		let count = 0;
		return Counter.of({ inc: () => Effect.sync(() => count++) });
	})
);

// ✅
export const CounterLive = Layer.effect(
	Counter,
	Effect.gen(function* () {
		const count = yield* Ref.make(0);
		return Counter.of({ inc: () => Ref.update(count, (n) => n + 1) });
	})
);
```

### `avoid-native-fetch`

Native `fetch()` returns a `Promise<Response>` with untyped errors. Effect's `HttpClient` gives you typed errors, request / response schemas, and testable layer substitution.

```ts
// ❌
const res = await fetch('/api/users');
const users = await res.json();

// ✅
const client = yield * HttpClient.HttpClient;
const users =
	yield *
	client
		.get('/api/users')
		.pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(UserList)));
```

### `avoid-native-object-helpers`

`Object.keys` returns `string[]` (not `keyof T`); `Object.entries` loses value types. Use the `effect/Record` helpers for type-safe equivalents.

```ts
// ❌
const keys = Object.keys(user);
const entries = Object.entries(config);
const obj = Object.fromEntries(pairs);

// ✅
import * as R from 'effect/Record';
const keys = R.keys(user);
const entries = R.toEntries(config);
const obj = R.fromEntries(pairs);
```

### `avoid-node-imports`

`node:*` imports tie domain code to a single runtime. Use `@effect/platform` abstractions so the same code runs on Node, Bun, Deno, and Workers. Dedicated rules cover the most common cases (`use-filesystem-service`, `use-path-service`, `use-command-executor-service`, `use-http-client-service`); this rule is the catch-all.

```ts
// ❌
import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';

// ✅  Provide a service or pass a `FromEffect`-shaped Layer
import { Crypto } from '@effect/platform/Crypto';
import { Stream } from 'effect/Stream';
```

### `avoid-non-null-assertion`

`!` tells the compiler "trust me" and crashes at runtime when wrong. Model absence with `Option`, decode unknown shapes via `Schema.decodeUnknown*`, or guard at the boundary with `?.` / `??` / `Option.fromNullishOr`.

```ts
// ❌
const name = user!.profile!.displayName!;

// ✅
const name = Option.fromNullishOr(user).pipe(
	Option.flatMapNullishOr((u) => u.profile?.displayName),
	Option.getOrElse(() => 'Anonymous')
);
```

### `avoid-object-type`

`Object` provides no type safety, and `{}` matches any non-nullish value (including `42` and `"hi"`). Use a specific interface, `Record<string, unknown>`, or a `Schema.Class`.

```ts
// ❌
function merge(a: object, b: {}): object { ... }

// ✅
function merge<A extends Record<string, unknown>>(a: A, b: Partial<A>): A { ... }
```

### `avoid-option-getorthrow`

`.getOrThrow` defeats the point of `Option` / `Either` / `Result` by throwing where the type promised a total handler. Use `match`, `getOrElse`, or `map`.

```ts
// ❌
const value = Option.getOrThrow(maybeUser);

// ✅
const value = Option.match(maybeUser, {
	onNone: () => defaultUser,
	onSome: (u) => u
});
```

### `avoid-platform-coupling`

Packages under `packages/*/binding/` are the seam where platform-specific code lives — they import `@effect/platform-bun`, `@effect/platform-node`, etc. Code outside the `binding/` directory must stay platform-agnostic so it can run anywhere.

```ts
// ❌  packages/myapp/src/MyService.ts
import { BunHttpServer } from '@effect/platform-bun';

// ✅  packages/myapp/binding/index.ts
import { BunHttpServer } from '@effect/platform-bun';
```

### `avoid-process-env`

`process.env` is untyped, untested, and global. `Config.*` builds typed, layered, redactable configuration with default values and validation.

```ts
// ❌
const apiKey = process.env.API_KEY!;
const port = parseInt(process.env.PORT ?? '3000');

// ✅
const apiKey = yield * Config.redacted('API_KEY');
const port = yield * Config.integer('PORT').pipe(Config.withDefault(3000));
```

### `avoid-react-hooks`

React hooks scatter state, effects, and rendering across a single component. VMs with Effect Atom keep state in atoms, effects in actions, and components as pure renderers.

```ts
// ❌
function Profile({ id }: Props) {
	const [user, setUser] = useState<User>();
	useEffect(() => { fetchUser(id).then(setUser); }, [id]);
	return <div>{user?.name}</div>;
}

// ✅
// profile.vm.ts
export const userAtom = Atom.family((id: string) =>
	Atom.fn(Effect.fn('fetchUser')(function* () { ... }))
);

// profile.tsx
function Profile({ id }: Props) {
	const user = useAtomValue(userAtom(id));
	return <div>{user.name}</div>;
}
```

### `avoid-schema-suffix`

Schema constants represent a domain type, not "a schema for a type." Name them after the concept (`User`) rather than the construction (`UserSchema`) — this matches how `Schema.Class` is named and keeps types and instances grep-symmetric.

```ts
// ❌
const UserSchema = Schema.Struct({ id: Schema.String });

// ✅
const User = Schema.Struct({ id: Schema.String });
export type User = typeof User.Type;
```

### `avoid-sync-fs`

Synchronous `fs` calls block the event loop. Use `FileSystem` from `@effect/platform` for async, composable, testable file I/O.

```ts
// ❌
const text = fs.readFileSync(path, 'utf8');
fs.writeFileSync(path, data);

// ✅
const fs = yield * FileSystem.FileSystem;
const text = yield * fs.readFileString(path);
yield * fs.writeFileString(path, data);
```

### `avoid-try-catch`

`try` / `catch` discards the failure type and forces every caller to inspect a generic `unknown`. Use `Effect.try` or `Effect.tryPromise` with `Schema.TaggedErrorClass` to keep errors in the typed channel.

```ts
// ❌
try {
	return JSON.parse(raw);
} catch (e) {
	return null;
}

// ✅
return (
	yield *
	Effect.try({
		try: () => JSON.parse(raw),
		catch: () => new ParseFailed({ raw })
	})
);
```

### `avoid-ts-ignore`

`@ts-ignore` and `@ts-expect-error` mask real bugs and silently rot when the underlying type changes. Fix the type at the source instead.

```ts
// ❌
// @ts-ignore
const result = someApi.experimental.method();

// ✅
// Augment the third-party type or wrap in a typed adapter
declare module 'some-api' {
	interface ExperimentalApi {
		method(): Result;
	}
}
```

### `avoid-untagged-errors`

`new Error(...)` and `instanceof Error` make every failure interchangeable. `Schema.TaggedErrorClass` gives each failure mode a tag that `catchTag` / `catchTags` can discriminate at the type level.

```ts
// ❌
throw new Error('User not found');
if (err instanceof Error) return null;

// ✅
class UserNotFound extends Schema.TaggedErrorClass<UserNotFound>(
	'UserNotFound'
)('UserNotFound', { id: Schema.String }) {}

yield * Effect.fail(new UserNotFound({ id }));
yield *
	effect.pipe(Effect.catchTag('UserNotFound', () => Effect.succeed(null)));
```

### `avoid-yield-ref`

Direct `yield* ref` / `yield* deferred` / `yield* fiber` / `yield* latch` was removed in Effect v4. Use the explicit method calls.

```ts
// ❌
const value = yield * counter;
const result = yield * deferred;

// ✅
const value = yield * Ref.get(counter);
const result = yield * Deferred.await(deferred);
const exit = yield * Fiber.join(fiber);
yield * Latch.await(latch);
```

### `casting-awareness`

Every `as T` assertion is a checkpoint: is the cast redundant? Can generics or `Schema.decode` replace it? Does the upstream type need fixing? `as const` and `as never` are always allowed; everything else gets flagged so the reviewer notices.

```ts
// ❌
const items = (data as Array<User>).filter((u) => u.active);

// ✅
const items =
	yield *
	Schema.decodeUnknown(Schema.Array(User))(data).pipe(
		Effect.map(Arr.filter((u) => u.active))
	);

// ✅  as const is fine
const STATUSES = ['Pending', 'Active', 'Closed'] as const;
```

### `context-tag-extends`

`class FooTag extends Context.Tag(...)`, `Context.GenericTag`, `Effect.Service`, and the legacy `ServiceMap.*` aliases were all removed or superseded in Effect v4. Define services with `Context.Service` and name them directly — no `*Tag` suffix.

```ts
// ❌
class UserRepoTag extends Context.Tag('UserRepo')<UserRepoTag, Service>() {}
const UserRepo = Context.GenericTag<Service>('UserRepo');
class UserRepo extends Effect.Service<Service>()('UserRepo', { ... }) {}

// ✅
class UserRepo extends Context.Service<UserRepo, Service>()('UserRepo') {}
```

### `effect-catchall-default`

Blanket `Effect.catch` / `Effect.catchCause` returning a default value silently swallows every failure mode — including ones you didn't know about. Use `catchTag` / `catchTags` for targeted recovery.

```ts
// ❌
effect.pipe(Effect.catchAll(() => Effect.succeed(defaultUser)));

// ✅
effect.pipe(
	Effect.catchTags({
		UserNotFound: () => Effect.succeed(defaultUser),
		NetworkError: (e) => Effect.fail(e) // re-raise the rest
	})
);
```

### `effect-promise-vs-trypromise`

`Effect.promise` treats rejections as defects (unrecoverable). `Effect.tryPromise` captures them in the typed error channel so callers can `catchTag` them.

```ts
// ❌
const user = yield * Effect.promise(() => fetchUser(id));

// ✅
const user =
	yield *
	Effect.tryPromise({
		try: () => fetchUser(id),
		catch: (cause) => new FetchFailed({ cause })
	});
```

### `effect-run-in-body`

`Effect.runSync` / `runPromise` / `runFork` collapse the program down to a concrete value. Keep them at the boundary (`main.ts`, the test harness, the HTTP route handler) and return `Effect` values everywhere else.

```ts
// ❌  inside a service method
const get = (id: string) => {
	const user = Effect.runSync(fetchUser(id));
	return user;
};

// ✅
const get = (id: string) => fetchUser(id);
```

### `imperative-loops`

`for`, `while`, and `do…while` over collections obscure the intent of the transformation. Use `Arr.map`, `Arr.filter`, `Arr.filterMap`, `Arr.reduce`, or `Effect.forEach` so the operation is on the page.

```ts
// ❌
const names: Array<string> = [];
for (const user of users) {
	if (user.active) names.push(user.name);
}

// ✅
const names = Arr.filterMap(users, (u) =>
	u.active ? Option.some(u.name) : Option.none()
);
```

### `no-barrel-imports`

Named imports from the `effect` barrel pull the entire module graph and break tree-shaking. Import from the submodule instead.

```ts
// ❌
import { Effect, Array as Arr, Option } from 'effect';

// ✅
import * as Effect from 'effect/Effect';
import * as Arr from 'effect/Array';
import * as Option from 'effect/Option';
```

### `no-opaque-instance-fields`

`Schema.Opaque` classes are pure type-level wrappers — they have no runtime identity beyond the underlying schema. Adding instance methods or fields turns them into something the type system can no longer treat as opaque.

```ts
// ❌
class UserId extends Schema.Opaque<UserId>()(Schema.String) {
	greet() {
		return `Hello ${this.toString()}`;
	}
}

// ✅
class UserId extends Schema.Opaque<UserId>()(Schema.String) {}
const greet = (id: UserId) => `Hello ${id}`;
```

### `prefer-arr-match`

Manual `.length === 0` / `.length > 0` branching obscures the empty vs non-empty intent. `Arr.match` makes both branches explicit and gives you the non-empty array witness in the body.

```ts
// ❌
if (items.length === 0) return placeholder;
return list(items);

// ✅
return Arr.match(items, {
	onEmpty: () => placeholder,
	onNonEmpty: (xs) => list(xs)
});
```

### `prefer-arr-sort`

`Array.prototype.sort` mutates in place, sorts lexicographically by default, and has no notion of an `Order`. `Arr.sort` is immutable and composes with `Order` combinators.

```ts
// ❌
const sorted = [...users].sort((a, b) => a.age - b.age);

// ✅
const sorted = Arr.sort(
	users,
	Order.mapInput(Order.number, (u: User) => u.age)
);
```

### `prefer-duration-constructors`

Raw millisecond literals passed to `Effect.sleep`, `Schedule.spaced`, etc. read poorly. `Duration.seconds`, `Duration.minutes`, `Duration.millis` keep units at the call site.

```ts
// ❌
yield * Effect.sleep(5000);
const sched = Schedule.spaced(60_000);

// ✅
yield * Effect.sleep(Duration.seconds(5));
const sched = Schedule.spaced(Duration.minutes(1));
```

### `prefer-effect-fn`

`Effect.gen(function*() { ... })` assigned to a `const`, or used as a service method, lacks an attached span name. `Effect.fn("name")(function*() { ... })` adds automatic tracing.

```ts
// ❌
const getUser = (id: string) => Effect.gen(function* () { ... });

const make = Effect.gen(function* () {
	return UserRepo.of({
		get: (id) => Effect.gen(function* () { ... })
	});
});

// ✅
const getUser = Effect.fn('getUser')(function* (id: string) { ... });

const make = Effect.gen(function* () {
	return UserRepo.of({
		get: Effect.fn('UserRepo.get')(function* (id) { ... })
	});
});
```

### `prefer-effect-is`

`typeof x === "string"` is non-composable and doesn't narrow union types as cleanly as Effect's `Predicate` helpers.

```ts
// ❌
if (typeof value === 'string') return value;
if (typeof n === 'number' && n > 0) return n;

// ✅
import * as P from 'effect/Predicate';
if (P.isString(value)) return value;
if (P.isNumber(n) && n > 0) return n;
```

### `prefer-match-over-switch`

`switch` is not exhaustive (TypeScript can't prove every case is handled) and doesn't compose with pipe. `Match.value` is exhaustive, expression-level, and pipe-friendly.

```ts
// ❌
switch (status) {
	case 'Pending':
		return spinner();
	case 'Active':
		return view();
	case 'Closed':
		return summary();
}

// ✅
return Match.value(status).pipe(
	Match.when('Pending', () => spinner()),
	Match.when('Active', () => view()),
	Match.when('Closed', () => summary()),
	Match.exhaustive
);
```

### `prefer-namespace-imports`

Named imports from `effect/*` submodules break tree-shaking and diverge from Effect's canonical idiom. Use namespace imports with the canonical alias (`Effect`, `Arr` for `effect/Array`, `Option`, `R` for `effect/Record`, etc.).

```ts
// ❌
import { map, filter } from 'effect/Array';
import { Array } from 'effect';

// ✅
import * as Arr from 'effect/Array';
import * as Effect from 'effect/Effect';
```

### `prefer-option-over-null`

`T | null` / `T | undefined` doesn't compose: every caller has to repeat the null check. `Option<T>` ships `map`, `flatMap`, `match`, `getOrElse`, and friends.

```ts
// ❌
function find(id: string): User | null { ... }

// ✅
function find(id: string): Option.Option<User> { ... }
```

### `prefer-redacted-config`

Configuration keys whose name conventionally identifies a secret (`apiKey`, `authToken`, `password`, `privateKey`, `dsn`, etc.) must be loaded as `Config.redacted(...)` (or wrapped in `Schema.Redacted` inside a `Config.schema`) so the value stays masked in logs and `toString`.

```ts
// ❌
const apiKey = yield * Config.string('apiKey');
const cfg =
	yield *
	Config.schema(
		Schema.Struct({
			apiKey: Schema.String
		})
	);

// ✅
const apiKey = yield * Config.redacted('apiKey');
const cfg =
	yield *
	Config.schema(
		Schema.Struct({
			apiKey: Schema.Redacted(Schema.String)
		})
	);
```

### `prefer-schema-class`

`Schema.Struct` produces a plain object type. `Schema.Class` adds a constructor, `$is`, `$match`, and a branded nominal type, all for free.

```ts
// ❌
const User = Schema.Struct({ id: Schema.String, name: Schema.String });
type User = typeof User.Type;

// ✅
class User extends Schema.Class<User>('User')({
	id: Schema.String,
	name: Schema.String
}) {}
```

### `require-effect-concurrency`

`Effect.all`, `Effect.forEach`, `Effect.validateAll`, and friends silently default to sequential execution. Sequential is sometimes correct — but it's a concurrency decision, so it should be reviewable at the call site.

```ts
// ❌
yield * Effect.forEach(ids, fetchUser);

// ✅
yield * Effect.forEach(ids, fetchUser, { concurrency: 'unbounded' });
yield * Effect.forEach(ids, fetchUser, { concurrency: 4 });
yield * Effect.forEach(ids, fetchUser, { concurrency: 1 }); // explicit sequential
```

### `require-filter-metadata`

`Schema.makeFilter` and `Schema.makeFilterGroup` produce reusable validators. Without `identifier`, `title`, and `description` they show up in error messages and OpenAPI docs as opaque blobs.

```ts
// ❌
const PositiveInt = Schema.makeFilter((n: number) => n > 0);

// ✅
const PositiveInt = Schema.makeFilter((n: number) => n > 0, {
	identifier: 'PositiveInt',
	title: 'Positive integer',
	description: 'A whole number strictly greater than zero.'
});
```

### `require-schema-type-alias`

Exported `Schema.Struct` / `Schema.TaggedStruct` / `Schema.Literals` constants don't carry a TypeScript type at the value name. Pair them with `export type Foo = typeof Foo.Type` so importers can refer to the inferred type.

```ts
// ❌
export const User = Schema.Struct({ id: Schema.String });

// ✅
export const User = Schema.Struct({ id: Schema.String });
export type User = typeof User.Type;
```

### `stream-large-files`

`fs.readFile` / `fs.readFileString` load the entire file into memory. For paths whose names suggest unbounded size (`*.log`, `dump.json`, `archive.tar`, `export.csv`, `*.ndjson`, …), use `Stream.fromReadableStream` or `FileSystem.stream` instead.

```ts
// ❌
const text = yield * fs.readFileString('events.log');

// ✅
const fs = yield * FileSystem.FileSystem;
const lines = fs
	.stream('events.log')
	.pipe(Stream.decodeText('utf-8'), Stream.splitLines);
```

### `throw-in-effect-gen`

`throw` inside `Effect.gen` / `Effect.fn` / `Effect.fnUntraced` lands in the unrecoverable defect channel. Use `yield* Effect.fail(new MyError(...))` (or `yield* new MyTaggedError({ ... })`) to keep failures typed. The `try:` arm of `Effect.tryPromise` / `Effect.try` is excluded — that's the point of `try:`.

```ts
// ❌
Effect.gen(function* () {
	if (!user) throw new Error('User missing');
	return user;
});

// ✅
Effect.gen(function* () {
	if (!user) return yield* Effect.fail(new UserMissing({ id }));
	return user;
});
```

### `use-clock-service`

`new Date()` / `Date.now()` / `Date.UTC()` are non-deterministic and untestable. Use the `Clock` service or the `DateTime` module so tests can freeze time.

```ts
// ❌
const now = new Date();
const ms = Date.now();

// ✅
const now = yield * DateTime.now;
const ms = yield * Clock.currentTimeMillis;
```

### `use-command-executor-service`

`child_process` / `node:child_process` ties code to Node's process model and yields untyped errors. Use `ChildProcessSpawner` + `ChildProcess` from `effect/unstable/process`, or `Command` + `CommandExecutor` from `@effect/platform`, for typed, scoped, composable process spawning.

```ts
// ❌
import { spawn } from 'node:child_process';
const proc = spawn('git', ['status']);

// ✅
import { Command } from '@effect/platform';
const status = yield * Command.make('git', 'status').pipe(Command.string);
```

### `use-console-service`

`console.*` writes to stdout / stderr without spans, structured fields, or test capture. Use `Effect.logInfo` / `logError` / `logWarning` / `logDebug` (preferred), or the `Console` service.

```ts
// ❌
console.log('Fetched user', user.id);
console.error('Failed', err);

// ✅
yield *
	Effect.logInfo('Fetched user').pipe(Effect.annotateLogs('userId', user.id));
yield * Effect.logError('Failed').pipe(Effect.annotateLogs('cause', err));
```

### `use-filesystem-service`

`fs`, `node:fs`, and `fs/promises` tie code to Node's runtime. The `FileSystem` service from `@effect/platform` is portable, layer-substitutable, and integrates with `Stream`, `Scope`, and the rest of Effect.

```ts
// ❌
import * as fs from 'node:fs/promises';
const text = await fs.readFile(path, 'utf8');

// ✅
import { FileSystem } from '@effect/platform';
const fs = yield * FileSystem.FileSystem;
const text = yield * fs.readFileString(path);
```

### `use-http-client-service`

Direct `http` / `https` imports give you a raw socket and untyped errors. Use `HttpClient`, `HttpClientRequest`, and `HttpClientResponse` for typed responses, automatic retries, and testable layer substitution.

```ts
// ❌
import * as https from 'node:https';
https.get(url, (res) => { ... });

// ✅
const client = yield* HttpClient.HttpClient;
const json = yield* client.get(url).pipe(
	Effect.flatMap(HttpClientResponse.schemaBodyJson(Payload))
);
```

### `use-path-service`

`node:path` is Posix-or-Windows-flavored depending on the runtime. The `Path` service from `@effect/platform` is explicit about which variant you're using and is testable / mockable.

```ts
// ❌
import * as path from 'node:path';
const full = path.join(dir, name);

// ✅
import { Path } from '@effect/platform';
const path_ = yield * Path.Path;
const full = path_.join(dir, name);
```

### `use-random-service`

`Math.random()` is non-deterministic; tests can't pin it. The `Random` service threads a seed through the program so `Random.nextInt` is reproducible.

```ts
// ❌
const n = Math.floor(Math.random() * 100);

// ✅
const n = yield * Random.nextIntBetween(0, 100);
```

### `use-temp-file-scoped`

`os.tmpdir()` and unscoped `FileSystem.makeTempFile` / `makeTempDirectory` leak temp files when the program crashes. Use `FileSystem.makeTempFileScoped` / `makeTempDirectoryScoped` so cleanup is tied to the `Scope`.

```ts
// ❌
import { tmpdir } from 'node:os';
const dir = path.join(tmpdir(), 'work');

// ✅
const fs = yield * FileSystem.FileSystem;
const dir = yield * fs.makeTempDirectoryScoped();
```

### `vm-in-wrong-file`

View Model interfaces and their layers belong in `.vm.ts` files. Co-locating them with the component flattens the seam between rendering and state management — and the seam is the whole point of the VM pattern.

```ts
// ❌  profile.tsx
export interface ProfileVM { ... }
export const ProfileVMLive = Layer.effect(...);

// ✅  profile.vm.ts
export interface ProfileVM { ... }
export const ProfileVMLive = Layer.effect(...);
```

### `yield-in-for-loop`

`yield*` inside a `for` loop forces sequential execution and hides the iteration intent. `Effect.forEach` is declarative and parallelizable.

```ts
// ❌
for (const id of ids) {
	yield * fetchUser(id);
}

// ✅
yield * Effect.forEach(ids, fetchUser, { concurrency: 'unbounded' });
```

---

## Suppression

All rules respect oxlint's standard disable directives:

```ts
// oxlint-disable-next-line effect/<rule-name> -- reason

/* oxlint-disable effect/<rule-name> -- reason */
// ... block ...
/* oxlint-enable effect/<rule-name> */
```

A trailing `-- <reason>` comment is encouraged for any suppression that lives longer than a single PR review.

## Development

```sh
bun install
bun test          # run the test suite (374 tests across 54 rules)
bun run check     # format + lint + typecheck
```

Each rule lives in `src/rules/<rule-name>.ts` with a sibling test in `test/rules/<rule-name>.test.ts`. The rule SDK is documented at [`effect-oxlint`](https://github.com/mpsuesser/effect-oxlint).

The same rule set is also expressed as a [`pi-effect-harness`](https://github.com/mpsuesser/pi-effect-harness) pattern catalog for ast-grep — the two implementations are kept in alignment.

## License

MIT
