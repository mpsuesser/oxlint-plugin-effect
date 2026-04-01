import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { Diagnostic, Rule, RuleContext, SourceCode } from 'effect-oxlint';

export default Rule.define({
	name: 'avoid-ts-ignore',
	meta: Rule.meta({
		type: 'problem',
		description:
			'Disallow @ts-ignore and @ts-expect-error comments — fix the underlying type issue'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			Program: (node: ESTree.Node) =>
				Effect.gen(function* () {
					const comments = yield* SourceCode.getAllComments();
					for (const comment of comments) {
						if (
							comment.value.includes('@ts-ignore') ||
							comment.value.includes('@ts-expect-error')
						) {
							yield* ctx.report(
								Diagnostic.make({
									node,
									message:
										'Avoid `@ts-ignore` and `@ts-expect-error` — they suppress type errors and hide bugs. Fix the underlying type issue instead.'
								})
							);
						}
					}
				})
		};
	}
});
