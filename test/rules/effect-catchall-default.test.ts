import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/effect-catchall-default.ts';
import { Testing } from 'effect-oxlint';

describe('effect-catchall-default', () => {
	// ── Fully-qualified handler bodies (Effect.succeed / Effect.sync) ──
	it('flags `Effect.catchAll(() => Effect.succeed(default))`', () => {
		const handler = Testing.arrowFn(
			Testing.callOfMember('Effect', 'succeed', [
				{ type: 'Literal', value: 'default' }
			])
		);
		const node = Testing.callOfMember('Effect', 'catchAll', [handler]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	it('flags `Effect.catch(() => Effect.sync(default))` (v4 name)', () => {
		const handler = Testing.arrowFn(
			Testing.callOfMember('Effect', 'sync', [
				{ type: 'Literal', value: 'default' }
			])
		);
		const node = Testing.callOfMember('Effect', 'catch', [handler]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	it('flags `Effect.catchAll(() => { return Effect.sync(...) })` (block body)', () => {
		const body = Testing.blockStmt([
			Testing.returnStmt(
				Testing.callOfMember('Effect', 'sync', [
					{ type: 'Literal', value: 'default' }
				])
			)
		]);
		const handler = Testing.arrowFn(body);
		const node = Testing.callOfMember('Effect', 'catchAll', [handler]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	it('flags `Effect.catchAllCause(() => Effect.succeed(...))`', () => {
		const handler = Testing.arrowFn(
			Testing.callOfMember('Effect', 'succeed', [
				{ type: 'Literal', value: 'default' }
			])
		);
		const node = Testing.callOfMember('Effect', 'catchAllCause', [handler]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	it('flags `Effect.catchCause(() => Effect.succeed(...))` (v4 name)', () => {
		const handler = Testing.arrowFn(
			Testing.callOfMember('Effect', 'succeed', [
				{ type: 'Literal', value: 'default' }
			])
		);
		const node = Testing.callOfMember('Effect', 'catchCause', [handler]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	// ── Bare callee form (e.g. `import * as E from "effect/Effect"`) ──
	it('flags `Effect.catch(() => succeed(default))` (bare callee)', () => {
		const handler = Testing.arrowFn(
			Testing.callExpr('succeed', [{ type: 'Literal', value: 'default' }])
		);
		const node = Testing.callOfMember('Effect', 'catch', [handler]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	it('flags `Effect.catch(() => sync(default))` (bare callee)', () => {
		const handler = Testing.arrowFn(
			Testing.callExpr('sync', [{ type: 'Literal', value: 'default' }])
		);
		const node = Testing.callOfMember('Effect', 'catch', [handler]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	// ── Negative cases ──
	it('allows `Effect.catchTag(...)` (targeted)', () => {
		const node = Testing.callOfMember('Effect', 'catchTag');
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(0);
	});

	it('allows `Effect.catchAll(...)` with a non-succeed handler', () => {
		const handler = Testing.arrowFn(
			Testing.callOfMember('Effect', 'fail', [
				{ type: 'Literal', value: 'err' }
			])
		);
		const node = Testing.callOfMember('Effect', 'catchAll', [handler]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(0);
	});

	it('allows `Effect.catch(...)` with a handler that does work then succeeds', () => {
		// () => { doWork(); return Effect.succeed(x) } — two-statement block: not flagged
		const body = Testing.blockStmt([
			Testing.exprStmt(Testing.callExpr('doWork')),
			Testing.returnStmt(
				Testing.callOfMember('Effect', 'succeed', [
					{ type: 'Literal', value: 'x' }
				])
			)
		]);
		const handler = Testing.arrowFn(body);
		const node = Testing.callOfMember('Effect', 'catch', [handler]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(0);
	});

	it('allows `Effect.catch(...)` when called with no handler arg', () => {
		const node = Testing.callOfMember('Effect', 'catch');
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(0);
	});

	it('allows unrelated `succeed(...)` calls outside a catch context', () => {
		const node = Testing.callExpr('succeed', [
			{ type: 'Literal', value: 'x' }
		]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(0);
	});
});
