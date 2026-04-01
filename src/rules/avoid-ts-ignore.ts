import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow @ts-ignore and @ts-expect-error comments — fix the underlying type issue'
		}
	},
	create(context) {
		return {
			Program(node) {
				const comments = context.sourceCode.getAllComments();
				for (const comment of comments) {
					if (
						comment.value.includes('@ts-ignore') ||
						comment.value.includes('@ts-expect-error')
					) {
						// Comments aren't reportable nodes — report on the Program node with a loc override
						context.report({
							node,
							loc: {
								start: context.sourceCode.getLocFromIndex(
									comment.start
								),
								end: context.sourceCode.getLocFromIndex(
									comment.end
								)
							},
							message:
								'Avoid `@ts-ignore` and `@ts-expect-error` — they suppress type errors and hide bugs. Fix the underlying type issue instead.'
						});
					}
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
