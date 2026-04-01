import { Rule } from 'effect-oxlint';

export default Rule.banMember(
	'console',
	['log', 'error', 'warn', 'info', 'debug', 'trace'],
	{
		message:
			'Avoid `console.*` in Effect code. Use `Effect.logInfo`, `Effect.logError`, `Effect.logWarning`, `Effect.logDebug`, or the `Console` service for structured, testable logging. (EF-15)'
	}
);
