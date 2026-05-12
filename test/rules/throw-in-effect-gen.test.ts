import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/throw-in-effect-gen.ts';
import { Testing } from 'effect-oxlint';

describe('throw-in-effect-gen', () => {
	// ── Effect.gen ──
	it('flags throw inside Effect.gen', () => {
		const effectGen = Testing.callOfMember('Effect', 'gen');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['ThrowStatement', Testing.throwStmt()],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(1);
	});

	it('allows throw outside any generator constructor', () => {
		const errors = Testing.runRuleMulti(rule, [
			['ThrowStatement', Testing.throwStmt()]
		]);
		expect(errors).toHaveLength(0);
	});

	// ── Effect.fn ──
	it('flags throw inside Effect.fn', () => {
		const effectFn = Testing.callOfMember('Effect', 'fn');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectFn],
			['ThrowStatement', Testing.throwStmt()],
			['CallExpression:exit', effectFn]
		]);
		expect(errors).toHaveLength(1);
	});

	// ── Effect.fnUntraced ──
	it('flags throw inside Effect.fnUntraced', () => {
		const effectFnUntraced = Testing.callOfMember('Effect', 'fnUntraced');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectFnUntraced],
			['ThrowStatement', Testing.throwStmt()],
			['CallExpression:exit', effectFnUntraced]
		]);
		expect(errors).toHaveLength(1);
	});

	// ── try: callback exemption ──
	it('allows throw inside Effect.tryPromise try block', () => {
		const effectGen = Testing.callOfMember('Effect', 'gen');
		const tryPromise = Testing.callOfMember('Effect', 'tryPromise');
		const tryProp = {
			type: 'Property',
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
			type: 'Property',
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

	// ── Negative: try property NOT inside Effect.try ──
	it('does not exempt try property of an unrelated call', () => {
		const effectGen = Testing.callOfMember('Effect', 'gen');
		const otherCall = Testing.callOfMember('Other', 'method');
		const tryProp = {
			type: 'Property',
			key: { type: 'Identifier', name: 'try' },
			parent: {
				type: 'ObjectExpression',
				parent: otherCall
			}
		};
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['Property', tryProp],
			['ThrowStatement', Testing.throwStmt()],
			['Property:exit', tryProp],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(1);
	});

	it('does not exempt non-try property inside Effect.tryPromise', () => {
		const effectGen = Testing.callOfMember('Effect', 'gen');
		const tryPromise = Testing.callOfMember('Effect', 'tryPromise');
		const catchProp = {
			type: 'Property',
			key: { type: 'Identifier', name: 'catch' },
			parent: {
				type: 'ObjectExpression',
				parent: tryPromise
			}
		};
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['Property', catchProp],
			['ThrowStatement', Testing.throwStmt()],
			['Property:exit', catchProp],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(1);
	});

	// ── Depth tracking ──
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

	it('flags throw inside Effect.fn nested under Effect.gen', () => {
		const effectGen = Testing.callOfMember('Effect', 'gen');
		const effectFn = Testing.callOfMember('Effect', 'fn');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['CallExpression', effectFn],
			['ThrowStatement', Testing.throwStmt()],
			['CallExpression:exit', effectFn],
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
