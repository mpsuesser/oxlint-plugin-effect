import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-duration-constructors.ts';
import { Testing } from 'effect-oxlint';

const run = (n: unknown) => Testing.runRule(rule, 'CallExpression', n);

describe('prefer-duration-constructors', () => {
	// ── Positional numeric arguments ──
	it('flags Effect.timeout(5000)', () => {
		const errs = run(
			Testing.callOfMember('Effect', 'timeout', [
				Testing.numLiteral(5000)
			])
		);
		expect(errs).toHaveLength(1);
		expect(errs[0]?.diagnostic.message).toContain('Duration.millis(5000)');
		expect(errs[0]?.diagnostic.message).toContain('`Effect.timeout`');
	});

	it('flags Effect.sleep(1000)', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'sleep', [
					Testing.numLiteral(1000)
				])
			)
		).toHaveLength(1);
	});

	it('flags Schedule.spaced(250)', () => {
		expect(
			run(
				Testing.callOfMember('Schedule', 'spaced', [
					Testing.numLiteral(250)
				])
			)
		).toHaveLength(1);
	});

	it('flags Schedule.fixed(500)', () => {
		expect(
			run(
				Testing.callOfMember('Schedule', 'fixed', [
					Testing.numLiteral(500)
				])
			)
		).toHaveLength(1);
	});

	// ── Options-object `duration` ──
	it('flags `duration: 5000` in an options object', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'timeoutOrElse', [
					Testing.id('effect'),
					Testing.objectExpr([
						{ key: 'duration', value: Testing.numLiteral(5000) },
						{ key: 'onTimeout', value: Testing.id('fallback') }
					])
				])
			)
		).toHaveLength(1);
	});

	it('flags `duration: <number>` even alongside positional non-numeric args', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'timeoutOrElse', [
					Testing.id('effect'),
					Testing.objectExpr([
						{ key: 'duration', value: Testing.numLiteral(3000) }
					])
				])
			)
		).toHaveLength(1);
	});

	// ── Negative cases ──
	it('does not flag string arguments', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'timeout', [
					Testing.strLiteral('5 seconds')
				])
			)
		).toHaveLength(0);
	});

	it('does not flag identifier arguments', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'timeout', [
					Testing.id('myDuration')
				])
			)
		).toHaveLength(0);
	});

	it('does not flag unrelated Effect.* methods', () => {
		expect(
			run(Testing.callOfMember('Effect', 'map', [Testing.numLiteral(42)]))
		).toHaveLength(0);
	});

	// ── Bogus entries are NOT flagged: Schedule.intersect / Schedule.union ──
	it('does not flag Schedule.intersect (combines Schedules, not Durations)', () => {
		expect(
			run(
				Testing.callOfMember('Schedule', 'intersect', [
					Testing.id('s1'),
					Testing.id('s2')
				])
			)
		).toHaveLength(0);
	});

	it('does not flag Schedule.union (combines Schedules, not Durations)', () => {
		expect(
			run(
				Testing.callOfMember('Schedule', 'union', [
					Testing.id('s1'),
					Testing.id('s2')
				])
			)
		).toHaveLength(0);
	});

	// ── Options object: non-duration key not flagged ──
	it('does not flag `concurrency: 4` (not a duration key)', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'forEach', [
					Testing.id('items'),
					Testing.id('fn'),
					Testing.objectExpr([
						{ key: 'concurrency', value: Testing.numLiteral(4) }
					])
				])
			)
		).toHaveLength(0);
	});

	// ── Multiple numeric args ──
	it('flags every numeric positional argument', () => {
		expect(
			run(
				Testing.callOfMember('Effect', 'timeout', [
					Testing.numLiteral(1000),
					Testing.numLiteral(2000)
				])
			)
		).toHaveLength(2);
	});
});
