import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-duration-constructors.ts';
import { Testing } from 'effect-oxlint';

describe('prefer-duration-constructors', () => {
	it('flags numeric literal in Effect.timeout', () => {
		const node = Testing.callOfMember('Effect', 'timeout', [
			Testing.numLiteral(5000)
		]);
		const errors = Testing.runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain(
			'Duration.millis(5000)'
		);
	});

	it('flags numeric literal in Effect.sleep', () => {
		const node = Testing.callOfMember('Effect', 'sleep', [
			Testing.numLiteral(1000)
		]);
		const errors = Testing.runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('Duration');
	});

	it('flags numeric literal in Schedule.spaced', () => {
		const node = Testing.callOfMember('Schedule', 'spaced', [
			Testing.numLiteral(250)
		]);
		const errors = Testing.runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('Duration');
	});

	it('does not flag non-numeric arguments', () => {
		const node = Testing.callOfMember('Effect', 'timeout', [
			{ type: 'Identifier', name: 'myDuration' }
		]);
		const errors = Testing.runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(0);
	});

	it('does not flag string arguments', () => {
		const node = Testing.callOfMember('Effect', 'timeout', [
			Testing.strLiteral('5 seconds')
		]);
		const errors = Testing.runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(0);
	});

	it('does not flag unrelated methods', () => {
		const node = Testing.callOfMember('Effect', 'map', [
			Testing.numLiteral(42)
		]);
		const errors = Testing.runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(0);
	});
});
