import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-mutable-state.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-mutable-state', () => {
	it('flags let declarations', () => {
		expect(
			Testing.runRule(
				rule,
				'VariableDeclaration',
				Testing.varDecl('let', 'x')
			)
		).toHaveLength(1);
	});
	it('allows const declarations', () => {
		expect(
			Testing.runRule(
				rule,
				'VariableDeclaration',
				Testing.varDecl('const', 'x')
			)
		).toHaveLength(0);
	});
});
