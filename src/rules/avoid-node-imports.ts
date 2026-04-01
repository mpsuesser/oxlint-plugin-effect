import { Rule } from 'effect-oxlint';

// Sources already handled by more specific use-*-service rules.
// Exclude these to avoid duplicate diagnostics.
const SPECIFIC_SOURCES = new Set([
	'node:fs',
	'node:fs/promises',
	'node:path',
	'node:os',
	'node:child_process',
	'node:http',
	'node:https'
]);

export default Rule.banImport(
	(src) => src.startsWith('node:') && !SPECIFIC_SOURCES.has(src),
	{
		message:
			'Avoid `node:*` imports in domain code. Use `@effect/platform` abstractions (`FileSystem`, `Path`, `CommandExecutor`, `HttpClient`) for portable, testable code. (EF-41)'
	}
);
