import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/require-effect-concurrency.ts';
import { Testing } from 'effect-oxlint';

const run = (node: unknown) => Testing.runRule(rule, 'CallExpression', node);

const concurrencyOpts = (value: unknown) =>
	Testing.objectExpr([{ key: 'concurrency', value }]);

describe('require-effect-concurrency', () => {
	// ── Effect.forEach ──
	it('flags Effect.forEach(items, fn)', () => {
		const errs = run(
			Testing.callOfMember('Effect', 'forEach', [
				Testing.id('items'),
				Testing.id('fn')
			])
		);
		expect(errs).toHaveLength(1);
		expect(errs[0]?.diagnostic.message).toContain('Effect.forEach');
		expect(errs[0]?.diagnostic.message).toContain('concurrency');
	});

	it('flags Effect.forEach with an options object missing concurrency', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'forEach', [
					Testing.id('items'),
					Testing.id('fn'),
					Testing.objectExpr([
						{ key: 'discard', value: Testing.boolLiteral(true) }
					])
				])
			)
		).toHaveLength(1);
	});

	it('does not flag Effect.forEach with concurrency: 4', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'forEach', [
					Testing.id('items'),
					Testing.id('fn'),
					concurrencyOpts(Testing.numLiteral(4))
				])
			)
		).toHaveLength(0);
	});

	it('does not flag Effect.forEach with concurrency: "unbounded"', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'forEach', [
					Testing.id('items'),
					Testing.id('fn'),
					concurrencyOpts(Testing.strLiteral('unbounded'))
				])
			)
		).toHaveLength(0);
	});

	it('does not flag Effect.forEach when concurrency sits alongside other options', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'forEach', [
					Testing.id('items'),
					Testing.id('fn'),
					Testing.objectExpr([
						{ key: 'concurrency', value: Testing.numLiteral(8) },
						{ key: 'discard', value: Testing.boolLiteral(true) }
					])
				])
			)
		).toHaveLength(0);
	});

	// ── Effect.all ──
	it('flags Effect.all(tasks)', () => {
		expect(
			run(Testing.callOfMember('Effect', 'all', [Testing.id('tasks')]))
		).toHaveLength(1);
	});

	it('does not flag Effect.all with concurrency option', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'all', [
					Testing.id('tasks'),
					concurrencyOpts(Testing.strLiteral('unbounded'))
				])
			)
		).toHaveLength(0);
	});

	// ── Effect.validate ──
	it('flags Effect.validate(items, fn)', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'validate', [
					Testing.id('items'),
					Testing.id('fn')
				])
			)
		).toHaveLength(1);
	});

	it('flags Effect.validate with options missing concurrency', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'validate', [
					Testing.id('items'),
					Testing.id('fn'),
					Testing.objectExpr([
						{ key: 'discard', value: Testing.boolLiteral(true) }
					])
				])
			)
		).toHaveLength(1);
	});

	it('does not flag Effect.validate with concurrency + other options', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'validate', [
					Testing.id('items'),
					Testing.id('fn'),
					Testing.objectExpr([
						{ key: 'concurrency', value: Testing.numLiteral(4) },
						{ key: 'discard', value: Testing.boolLiteral(true) }
					])
				])
			)
		).toHaveLength(0);
	});

	// ── Negative cases ──
	it('does not flag unrelated Effect.* calls', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'map', [
					Testing.id('eff'),
					Testing.id('fn')
				])
			)
		).toHaveLength(0);
	});

	it('does not flag identically-named methods on other objects (e.g. Stream.forEach)', () => {
		expect(
			run(
				Testing.callOfMember('Stream', 'forEach', [Testing.id('items')])
			)
		).toHaveLength(0);
	});

	it('does not flag bare `forEach(...)` (only `Effect.forEach` matters here)', () => {
		expect(
			run(Testing.callExpr('forEach', [Testing.id('items')]))
		).toHaveLength(0);
	});
});
