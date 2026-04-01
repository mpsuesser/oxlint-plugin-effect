import { memberExprRule } from '../utils.ts';

export default memberExprRule(
	'Disallow Math.random — use Effect Random service for testable randomness',
	[
		{
			obj: 'Math',
			prop: 'random',
			message:
				'Avoid `Math.random()` in Effect code. Use the `Random` service for testable, deterministic randomness. (EF-9)'
		}
	]
);
