import type { CreateRule, Visitor } from '@oxlint/plugins';

import { isMemberExpr } from '../utils.ts';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow os.tmpdir() and unscoped temp files — use makeTempFileScoped instead'
		}
	},
	create(context) {
		return {
			ImportDeclaration(node) {
				const src = node.source.value;
				if (src === 'os' || src === 'node:os') {
					context.report({
						node,
						message:
							'Avoid importing `os` for temp file operations. Use `FileSystem.makeTempFileScoped` from `@effect/platform` for automatically cleaned-up temp files.'
					});
				}
			},
			MemberExpression(node) {
				if (isMemberExpr(node, 'os', 'tmpdir')) {
					context.report({
						node,
						message:
							'Avoid `os.tmpdir()`. Use `FileSystem.makeTempFileScoped` from `@effect/platform` for scoped temp files with automatic cleanup.'
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
