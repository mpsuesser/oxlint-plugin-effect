import { memberExprRule } from '../utils.ts';

export default memberExprRule(
	'Disallow JSON.parse/JSON.stringify — use Schema-based JSON codecs instead',
	[
		{
			obj: 'JSON',
			prop: ['parse', 'stringify'],
			message:
				'Avoid `JSON.parse`/`JSON.stringify` in Effect code. Use `Schema.fromJsonString(MySchema)` for typed boundaries or `Schema.UnknownFromJsonString` for unknown payloads. (EF-19)'
		}
	]
);
