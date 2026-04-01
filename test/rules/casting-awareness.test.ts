import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/casting-awareness.ts';
import { Testing } from 'effect-oxlint';

describe('casting-awareness', () => {
	it('flags as string (non-const cast)', () => {
		expect(
			Testing.runRule(
				rule,
				'TSAsExpression',
				Testing.tsAsExpr('TSStringKeyword')
			)
		).toHaveLength(1);
	});

	it('flags as number', () => {
		expect(
			Testing.runRule(
				rule,
				'TSAsExpression',
				Testing.tsAsExpr('TSNumberKeyword')
			)
		).toHaveLength(1);
	});

	it('skips as any (handled by avoid-any)', () => {
		expect(
			Testing.runRule(
				rule,
				'TSAsExpression',
				Testing.tsAsExpr('TSAnyKeyword')
			)
		).toHaveLength(0);
	});

	it('skips as unknown (handled by avoid-any)', () => {
		expect(
			Testing.runRule(
				rule,
				'TSAsExpression',
				Testing.tsAsExpr('TSUnknownKeyword')
			)
		).toHaveLength(0);
	});

	it('skips as never (exhaustive check pattern)', () => {
		expect(
			Testing.runRule(
				rule,
				'TSAsExpression',
				Testing.tsAsExpr('TSNeverKeyword')
			)
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
		expect(Testing.runRule(rule, 'TSAsExpression', node)).toHaveLength(0);
	});

	it('skips as const (TSLiteralType)', () => {
		expect(
			Testing.runRule(
				rule,
				'TSAsExpression',
				Testing.tsAsExpr('TSLiteralType')
			)
		).toHaveLength(0);
	});
});
