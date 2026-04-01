import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/prefer-duration-constructors.ts';
import { callOfMember, strLiteral, runRule } from '../utils.ts';

describe('prefer-duration-constructors', () => {
	const numLiteral = (value: number) => ({ type: 'Literal', value }) as const;

	it('flags numeric literal in Effect.timeout', () => {
		const node = callOfMember('Effect', 'timeout', [numLiteral(5000)]);
		const errors = runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('Duration.millis(5000)');
	});

	it('flags numeric literal in Effect.sleep', () => {
		const node = callOfMember('Effect', 'sleep', [numLiteral(1000)]);
		const errors = runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('Duration');
	});

	it('flags numeric literal in Schedule.spaced', () => {
		const node = callOfMember('Schedule', 'spaced', [numLiteral(250)]);
		const errors = runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('Duration');
	});

	it('does not flag non-numeric arguments', () => {
		const node = callOfMember('Effect', 'timeout', [
			{ type: 'Identifier', name: 'myDuration' }
		]);
		const errors = runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(0);
	});

	it('does not flag string arguments', () => {
		const node = callOfMember('Effect', 'timeout', [
			strLiteral('5 seconds')
		]);
		const errors = runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(0);
	});

	it('does not flag unrelated methods', () => {
		const node = callOfMember('Effect', 'map', [numLiteral(42)]);
		const errors = runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(0);
	});
});
