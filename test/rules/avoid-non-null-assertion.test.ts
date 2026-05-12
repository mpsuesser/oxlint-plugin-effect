import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-non-null-assertion.ts';
import { Testing } from 'effect-oxlint';

const nonNullExpr = (expression: unknown) => ({
	type: 'TSNonNullExpression',
	expression
});

const run = (node: unknown) =>
	Testing.runRule(rule, 'TSNonNullExpression', node);

describe('avoid-non-null-assertion', () => {
	it('flags `x!`', () => {
		const errs = run(nonNullExpr(Testing.id('x')));
		expect(errs).toHaveLength(1);
		expect(errs[0]?.diagnostic.message).toContain('non-null assertion');
	});

	it('flags `getUser()!`', () => {
		expect(run(nonNullExpr(Testing.callExpr('getUser')))).toHaveLength(1);
	});

	it('flags `user.name!` (member access)', () => {
		expect(
			run(nonNullExpr(Testing.memberExpr('user', 'name')))
		).toHaveLength(1);
	});

	it('flags every `!` independently (each visited TSNonNullExpression reports)', () => {
		const inner = nonNullExpr(Testing.id('x'));
		const outer = nonNullExpr(inner);
		// Visitor will be called once per node by the test harness; we
		// confirm each direct call reports exactly one diagnostic.
		expect(run(inner)).toHaveLength(1);
		expect(run(outer)).toHaveLength(1);
	});

	it('does not fire on `as T` (handled by avoid-any / casting-awareness)', () => {
		// The rule listens for TSNonNullExpression only; sending an
		// unrelated visitor key must not produce any diagnostics.
		expect(
			Testing.runRule(
				rule,
				'TSAsExpression',
				Testing.tsAsExpr('TSStringKeyword')
			)
		).toHaveLength(0);
	});
});
