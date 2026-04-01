import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/throw-in-effect-gen.ts';
import { Testing } from 'effect-oxlint';

describe('throw-in-effect-gen', () => {
	it('flags throw inside Effect.gen', () => {
		const effectGen = Testing.callOfMember('Effect', 'gen');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['ThrowStatement', Testing.throwStmt()],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(1);
	});

	it('allows throw outside Effect.gen', () => {
		const errors = Testing.runRuleMulti(rule, [
			['ThrowStatement', Testing.throwStmt()]
		]);
		expect(errors).toHaveLength(0);
	});

	it('allows throw inside Effect.tryPromise try block', () => {
		const effectGen = Testing.callOfMember('Effect', 'gen');
		const tryPromise = Testing.callOfMember('Effect', 'tryPromise');
		const tryProp = {
			type: 'ObjectProperty',
			key: { type: 'Identifier', name: 'try' },
			parent: {
				type: 'ObjectExpression',
				parent: tryPromise
			}
		};
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['Property', tryProp],
			['ThrowStatement', Testing.throwStmt()],
			['Property:exit', tryProp],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(0);
	});

	it('allows throw inside Effect.try try block', () => {
		const effectGen = Testing.callOfMember('Effect', 'gen');
		const effectTry = Testing.callOfMember('Effect', 'try');
		const tryProp = {
			type: 'ObjectProperty',
			key: { type: 'Identifier', name: 'try' },
			parent: {
				type: 'ObjectExpression',
				parent: effectTry
			}
		};
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['Property', tryProp],
			['ThrowStatement', Testing.throwStmt()],
			['Property:exit', tryProp],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(0);
	});

	// ── Nested depth tests ──
	it('flags throw inside nested Effect.gen (depth > 1)', () => {
		const effectGen = Testing.callOfMember('Effect', 'gen');
		const innerGen = Testing.callOfMember('Effect', 'gen');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['CallExpression', innerGen],
			['ThrowStatement', Testing.throwStmt()],
			['CallExpression:exit', innerGen],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(1);
	});

	it('does not flag throw after Effect.gen exits (counter reset)', () => {
		const effectGen = Testing.callOfMember('Effect', 'gen');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen],
			['ThrowStatement', Testing.throwStmt()]
		]);
		expect(errors).toHaveLength(0);
	});
});
