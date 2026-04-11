/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Test fixture: all three rules should report violations on this file.
 *
 * Expected violations:
 *   1. effect/avoid-try-catch        — line 17 (TryStatement)
 *   2. effect/context-tag-extends    — line 27 (Context.Tag)
 *   3. effect/context-tag-extends    — line 28 (Effect.Service)
 *   4. effect/throw-in-effect-gen     — line 35 (throw inside Effect.gen)
 *
 * Expected non-violations (should NOT trigger):
 *   - throw outside Effect.gen       — line 44
 *   - throw inside tryPromise try    — line 52
 */

// Intentional undeclared globals — this file is a violation fixture, not real code.
declare const Context: any;
declare const Effect: any;

// ── Rule 1: avoid-try-catch ──────────────────────────────────
// Should trigger: TryStatement
function riskyOperation() {
	try {
		return JSON.parse('{}');
	} catch {
		return null;
	}
}

// ── Rule 2: context-tag-extends ──────────────────────────────
// Should trigger: Context.Tag and Effect.Service
const _tag1 = Context.Tag();
const _tag2 = Effect.Service();

// Correct usage — should NOT trigger
const _tag3 = Context.Service;

// ── Rule 3: throw-in-effect-gen ──────────────────────────────
// Should trigger: throw inside Effect.gen
const _bad = Effect.gen(function* () {
	const value = yield* Effect.succeed(42);
	if (value < 0) {
		throw new Error('negative value'); // VIOLATION
	}
	return value;
});

// Should NOT trigger: throw outside Effect.gen
function throwOutside() {
	throw new Error('this is fine — not inside Effect.gen');
}

// Should NOT trigger: throw inside Effect.tryPromise try block
const _ok = Effect.gen(function* () {
	return yield* Effect.tryPromise({
		try: () => {
			throw new Error('caught by tryPromise'); // ACCEPTABLE
		},
		catch: (e: unknown) => new Error(String(e))
	});
});

export { riskyOperation, throwOutside };
