import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/require-filter-metadata.ts';
import { callOfMember, id, objectExpr, runRule } from '../utils.ts';

describe('require-filter-metadata', () => {
	it('flags Schema.makeFilter with no metadata argument', () => {
		const node = callOfMember('Schema', 'makeFilter', [
			{ type: 'Identifier', name: 'myPredicate' }
		]);
		const errors = runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('second argument');
	});

	it('flags Schema.makeFilter with incomplete metadata', () => {
		const node = callOfMember('Schema', 'makeFilter', [
			{ type: 'Identifier', name: 'myPredicate' },
			objectExpr([{ key: id('identifier') }])
		]);
		const errors = runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('`title`');
		expect(errors[0]?.message).toContain('`description`');
	});

	it('allows Schema.makeFilter with complete metadata', () => {
		const node = callOfMember('Schema', 'makeFilter', [
			{ type: 'Identifier', name: 'myPredicate' },
			objectExpr([
				{ key: id('identifier') },
				{ key: id('title') },
				{ key: id('description') }
			])
		]);
		const errors = runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(0);
	});

	it('flags Schema.makeFilterGroup with no metadata', () => {
		const node = callOfMember('Schema', 'makeFilterGroup', [
			{ type: 'ArrayExpression', elements: [] }
		]);
		const errors = runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('makeFilterGroup');
	});

	it('does not flag unrelated Schema methods', () => {
		const node = callOfMember('Schema', 'String', []);
		const errors = runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(0);
	});
});
