import { memberExprRule } from '../utils.ts';

export default memberExprRule(
	'Prefer Schema.Class over Schema.Struct for domain models',
	[
		{
			obj: 'Schema',
			prop: 'Struct',
			message:
				'Prefer `Schema.Class` over `Schema.Struct` for domain models. Schema.Class provides a named constructor, instanceof checks, and cleaner type derivation. (EF-33)'
		}
	]
);
