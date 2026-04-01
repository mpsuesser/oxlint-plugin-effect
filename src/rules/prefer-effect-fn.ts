import type { CreateRule, Visitor } from '@oxlint/plugins';

import { isCallOfMember } from '../utils.ts';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Effect-returning functions should use Effect.fn for automatic tracing instead of plain Effect.gen (EF-14)'
		}
	},
	create(context) {
		// Track nesting depth inside ServiceMap.Service(...) definition bodies
		let serviceDefDepth = 0;
		// Track whether we're inside an Effect.fn or Effect.fnUntraced call
		let effectFnDepth = 0;
		// Track whether the current Effect.gen is the direct `make` value in ServiceMap.Service
		let serviceMakeDepth = 0;

		return {
			CallExpression(node) {
				// Detect ServiceMap.Service<T>()("key", { make: ... })
				// The outer pattern is ServiceMap.Service(...)(...) — a double call
				if (
					node.callee.type === 'CallExpression' &&
					node.callee.callee.type === 'MemberExpression' &&
					node.callee.callee.object.type === 'Identifier' &&
					node.callee.callee.object.name === 'ServiceMap' &&
					node.callee.callee.property.type === 'Identifier' &&
					node.callee.callee.property.name === 'Service'
				) {
					serviceDefDepth++;

					// Check if the second argument has a `make` property whose value is Effect.gen
					// If so, track it so we don't flag the factory itself
					const secondArg = node.arguments[1];
					if (secondArg && secondArg.type === 'ObjectExpression') {
						for (const propOrSpread of secondArg.properties) {
							if (propOrSpread.type !== 'Property') continue;
							if (
								propOrSpread.key.type === 'Identifier' &&
								propOrSpread.key.name === 'make' &&
								propOrSpread.value.type === 'CallExpression' &&
								propOrSpread.value.callee.type ===
									'MemberExpression' &&
								propOrSpread.value.callee.object.type ===
									'Identifier' &&
								propOrSpread.value.callee.object.name ===
									'Effect' &&
								propOrSpread.value.callee.property.type ===
									'Identifier' &&
								propOrSpread.value.callee.property.name ===
									'gen'
							) {
								serviceMakeDepth++;
							}
						}
					}
				}

				// Track Effect.fn(...) and Effect.fnUntraced(...) calls
				if (
					isCallOfMember(node, 'Effect', 'fn') ||
					isCallOfMember(node, 'Effect', 'fnUntraced')
				) {
					effectFnDepth++;
				}

				// Flag Effect.gen(...) that should use Effect.fn
				if (
					effectFnDepth === 0 &&
					isCallOfMember(node, 'Effect', 'gen')
				) {
					// Inside a service definition — flag methods but not the make factory
					if (serviceDefDepth > 0 && serviceMakeDepth === 0) {
						context.report({
							node,
							message:
								'Use `Effect.fn("ServiceName.methodName")(function* (...) { ... })` instead of `Effect.gen` for service methods. `Effect.fn` provides automatic tracing with named spans. (EF-14)'
						});
					}

					// Top-level: check if this Effect.gen is assigned to a variable/export
					if (serviceDefDepth === 0) {
						const { parent } = node;
						if (
							parent?.type === 'VariableDeclarator' ||
							parent?.type === 'ExportDefaultDeclaration'
						) {
							context.report({
								node,
								message:
									'Use `Effect.fn("functionName")(function* (...) { ... })` instead of assigning `Effect.gen(...)` to a variable. `Effect.fn` provides automatic tracing with named spans. (EF-14)'
							});
						}
					}
				}
			},
			'CallExpression:exit'(node) {
				if (
					node.callee.type === 'CallExpression' &&
					node.callee.callee.type === 'MemberExpression' &&
					node.callee.callee.object.type === 'Identifier' &&
					node.callee.callee.object.name === 'ServiceMap' &&
					node.callee.callee.property.type === 'Identifier' &&
					node.callee.callee.property.name === 'Service'
				) {
					serviceDefDepth--;
					if (serviceMakeDepth > 0) serviceMakeDepth--;
				}

				if (
					isCallOfMember(node, 'Effect', 'fn') ||
					isCallOfMember(node, 'Effect', 'fnUntraced')
				) {
					effectFnDepth--;
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
