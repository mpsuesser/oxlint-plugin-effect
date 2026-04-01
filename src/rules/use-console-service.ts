import { memberExprRule } from '../utils.ts';

export default memberExprRule(
	'Disallow console.* — use Effect.log* or Console service instead',
	[
		{
			obj: 'console',
			prop: ['log', 'error', 'warn', 'info', 'debug', 'trace'],
			message:
				'Avoid `console.*` in Effect code. Use `Effect.logInfo`, `Effect.logError`, `Effect.logWarning`, `Effect.logDebug`, or the `Console` service for structured, testable logging. (EF-15)'
		}
	]
);
