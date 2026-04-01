import { Rule } from 'effect-oxlint';

export default Rule.banImport(
	(s) => s === 'node:child_process' || s === 'child_process',
	{
		message:
			"Avoid importing `child_process`. Use Effect's `Command` and `CommandExecutor` from `@effect/platform` for typed, composable process spawning with automatic lifecycle management."
	}
);
