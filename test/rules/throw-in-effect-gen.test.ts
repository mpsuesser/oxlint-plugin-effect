import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/throw-in-effect-gen.ts';
import { callOfMember, runRuleMulti, throwStmt } from '../utils.ts';

describe('throw-in-effect-gen', () => {
	it('flags throw inside Effect.gen', () => {
		const effectGen = callOfMember('Effect', 'gen');
		const errors = runRuleMulti(rule, [
			['CallExpression', effectGen],
			['ThrowStatement', throwStmt()],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(1);
	});

	it('allows throw outside Effect.gen', () => {
		const errors = runRuleMulti(rule, [['ThrowStatement', throwStmt()]]);
		expect(errors).toHaveLength(0);
	});

	it('allows throw inside Effect.tryPromise try block', () => {
		const effectGen = callOfMember('Effect', 'gen');
		const tryPromise = callOfMember('Effect', 'tryPromise');
		const tryProp = {
			type: 'ObjectProperty',
			key: { type: 'Identifier', name: 'try' },
			parent: {
				type: 'ObjectExpression',
				parent: tryPromise
			}
		};
		const errors = runRuleMulti(rule, [
			['CallExpression', effectGen],
			['Property', tryProp],
			['ThrowStatement', throwStmt()],
			['Property:exit', tryProp],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(0);
	});

	it('allows throw inside Effect.try try block', () => {
		const effectGen = callOfMember('Effect', 'gen');
		const effectTry = callOfMember('Effect', 'try');
		const tryProp = {
			type: 'ObjectProperty',
			key: { type: 'Identifier', name: 'try' },
			parent: {
				type: 'ObjectExpression',
				parent: effectTry
			}
		};
		const errors = runRuleMulti(rule, [
			['CallExpression', effectGen],
			['Property', tryProp],
			['ThrowStatement', throwStmt()],
			['Property:exit', tryProp],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(0);
	});

	// ── Nested depth tests ──
	it('flags throw inside nested Effect.gen (depth > 1)', () => {
		const effectGen = callOfMember('Effect', 'gen');
		const innerGen = callOfMember('Effect', 'gen');
		const errors = runRuleMulti(rule, [
			['CallExpression', effectGen],
			['CallExpression', innerGen],
			['ThrowStatement', throwStmt()],
			['CallExpression:exit', innerGen],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(1);
	});

	it('does not flag throw after Effect.gen exits (counter reset)', () => {
		const effectGen = callOfMember('Effect', 'gen');
		const errors = runRuleMulti(rule, [
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen],
			['ThrowStatement', throwStmt()]
		]);
		expect(errors).toHaveLength(0);
	});
});
