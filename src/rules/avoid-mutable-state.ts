import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Flag let bindings — consider using Ref for fiber-safe mutable state in Effect services'
		}
	},
	create(context) {
		return {
			VariableDeclaration(node) {
				if (node.kind === 'let') {
					context.report({
						node,
						message:
							'Consider using `Ref` instead of `let` for mutable state in Effect services. `Ref` provides atomic updates and fiber safety. `let` is acceptable in pure synchronous helpers and narrow scopes.'
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
