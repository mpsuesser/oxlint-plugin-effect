import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-option-getorthrow.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-option-getorthrow', () => {
	// ── Receiver-agnostic detection ──
	it('flags `Option.getOrThrow`', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Option', 'getOrThrow')
			)
		).toHaveLength(1);
	});

	it('flags `O.getOrThrow` (namespace alias)', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('O', 'getOrThrow')
			)
		).toHaveLength(1);
	});

	it('flags `Either.getOrThrow`', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Either', 'getOrThrow')
			)
		).toHaveLength(1);
	});

	it('flags `Result.getOrThrow`', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Result', 'getOrThrow')
			)
		).toHaveLength(1);
	});

	it('flags method-form `opt.getOrThrow`', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('opt', 'getOrThrow')
			)
		).toHaveLength(1);
	});

	// ── Negative: other members ──
	it('allows `Option.getOrElse`', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Option', 'getOrElse')
			)
		).toHaveLength(0);
	});

	it('allows `Option.match`', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Option', 'match')
			)
		).toHaveLength(0);
	});

	it('allows `Option.getOrThrowWith` (different identifier)', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Option', 'getOrThrowWith')
			)
		).toHaveLength(0);
	});

	// ── Negative: computed access ──
	it("allows computed `opt['getOrThrow']` (computed access is excluded)", () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.computedMemberExpr('opt', 'getOrThrow')
			)
		).toHaveLength(0);
	});
});
