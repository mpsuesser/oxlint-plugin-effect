import type { CreateRule, Visitor } from '@oxlint/plugins';

const SYNC_FS_METHODS = new Set([
	'readFileSync',
	'writeFileSync',
	'mkdirSync',
	'readdirSync',
	'statSync',
	'existsSync',
	'copyFileSync',
	'unlinkSync',
	'rmdirSync',
	'renameSync',
	'appendFileSync'
]);

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow synchronous fs operations — use Effect FileSystem service for async I/O'
		}
	},
	create(context) {
		return {
			CallExpression(node) {
				// Match bare `readFileSync(...)` calls
				if (
					node.callee.type === 'Identifier' &&
					SYNC_FS_METHODS.has(node.callee.name)
				) {
					context.report({
						node,
						message: `Avoid synchronous \`${node.callee.name}\` — it blocks the event loop. Use Effect's \`FileSystem\` service for async, composable file operations.`
					});
					return;
				}
				// Match `fs.readFileSync(...)` member calls
				if (
					node.callee.type === 'MemberExpression' &&
					node.callee.property.type === 'Identifier' &&
					SYNC_FS_METHODS.has(node.callee.property.name)
				) {
					context.report({
						node,
						message: `Avoid synchronous \`${node.callee.property.name}\` — it blocks the event loop. Use Effect's \`FileSystem\` service for async, composable file operations.`
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
