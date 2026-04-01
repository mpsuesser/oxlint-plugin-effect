import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/casting-awareness.ts';
import { runRule, tsAsExpr } from '../utils.ts';

describe('casting-awareness', () => {
	it('flags as string (non-const cast)', () => {
		expect(
			runRule(rule, 'TSAsExpression', tsAsExpr('TSStringKeyword'))
		).toHaveLength(1);
	});

	it('flags as number', () => {
		expect(
			runRule(rule, 'TSAsExpression', tsAsExpr('TSNumberKeyword'))
		).toHaveLength(1);
	});

	it('skips as any (handled by avoid-any)', () => {
		expect(
			runRule(rule, 'TSAsExpression', tsAsExpr('TSAnyKeyword'))
		).toHaveLength(0);
	});

	it('skips as unknown (handled by avoid-any)', () => {
		expect(
			runRule(rule, 'TSAsExpression', tsAsExpr('TSUnknownKeyword'))
		).toHaveLength(0);
	});

	it('skips as never (exhaustive check pattern)', () => {
		expect(
			runRule(rule, 'TSAsExpression', tsAsExpr('TSNeverKeyword'))
		).toHaveLength(0);
	});

	it('skips as const (TSTypeReference with name const)', () => {
		const node = {
			type: 'TSAsExpression',
			expression: { type: 'Identifier', name: 'x' },
			typeAnnotation: {
				type: 'TSTypeReference',
				typeName: { type: 'Identifier', name: 'const' }
			},
			parent: { type: 'ExpressionStatement' }
		};
		expect(runRule(rule, 'TSAsExpression', node)).toHaveLength(0);
	});

	it('skips as const (TSLiteralType)', () => {
		expect(
			runRule(rule, 'TSAsExpression', tsAsExpr('TSLiteralType'))
		).toHaveLength(0);
	});
});
