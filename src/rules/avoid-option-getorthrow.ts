import { memberExprRule } from '../utils.ts';

export default memberExprRule(
	'Disallow Option.getOrThrow — handle both cases explicitly with Option.match or Option.getOrElse',
	[
		{
			obj: 'Option',
			prop: 'getOrThrow',
			message:
				'Do not use `Option.getOrThrow` — it defeats the purpose of Option. Use `Option.match`, `Option.getOrElse`, or `Option.map` to handle both cases explicitly. (EF-2)'
		}
	]
);
