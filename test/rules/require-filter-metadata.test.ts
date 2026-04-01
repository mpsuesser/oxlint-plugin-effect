import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/require-filter-metadata.ts';
import { Testing } from 'effect-oxlint';

describe('require-filter-metadata', () => {
	it('flags Schema.makeFilter with no metadata argument', () => {
		const node = Testing.callOfMember('Schema', 'makeFilter', [
			{ type: 'Identifier', name: 'myPredicate' }
		]);
		const errors = Testing.runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('second argument');
	});

	it('flags Schema.makeFilter with incomplete metadata', () => {
		const node = Testing.callOfMember('Schema', 'makeFilter', [
			{ type: 'Identifier', name: 'myPredicate' },
			Testing.objectExpr([{ key: 'identifier' }])
		]);
		const errors = Testing.runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('`title`');
		expect(errors[0]?.diagnostic.message).toContain('`description`');
	});

	it('allows Schema.makeFilter with complete metadata', () => {
		const node = Testing.callOfMember('Schema', 'makeFilter', [
			{ type: 'Identifier', name: 'myPredicate' },
			Testing.objectExpr([
				{ key: 'identifier' },
				{ key: 'title' },
				{ key: 'description' }
			])
		]);
		const errors = Testing.runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(0);
	});

	it('flags Schema.makeFilterGroup with no metadata', () => {
		const node = Testing.callOfMember('Schema', 'makeFilterGroup', [
			{ type: 'ArrayExpression', elements: [] }
		]);
		const errors = Testing.runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('makeFilterGroup');
	});

	it('does not flag unrelated Schema methods', () => {
		const node = Testing.callOfMember('Schema', 'String', []);
		const errors = Testing.runRule(rule, 'CallExpression', node);
		expect(errors.length).toBe(0);
	});
});
