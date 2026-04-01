import { memberExprRule } from '../utils.ts';

export default memberExprRule(
	'Prefer Effect.tryPromise over Effect.promise for typed error handling',
	[
		{
			obj: 'Effect',
			prop: 'promise',
			message:
				'Prefer `Effect.tryPromise` over `Effect.promise`. `tryPromise` captures rejections in the typed error channel via a `catch` handler, while `promise` treats rejections as defects. (EF-22)'
		}
	]
);
