import { memberExprRule } from '../utils.ts';

export default memberExprRule(
	'Disallow Data.TaggedError — use Schema.TaggedErrorClass instead (Effect v4)',
	[
		{
			obj: 'Data',
			prop: 'TaggedError',
			message:
				'Use `Schema.TaggedErrorClass` instead of `Data.TaggedError`. Schema-based errors integrate with decode/encode and carry structured metadata. (EF-1)'
		}
	]
);
