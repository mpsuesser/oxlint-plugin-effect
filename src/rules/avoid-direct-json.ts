import { Rule } from 'effect-oxlint';

export default Rule.banMember('JSON', ['parse', 'stringify'], {
	message:
		'Avoid `JSON.parse`/`JSON.stringify` in Effect code. Use `Schema.fromJsonString(MySchema)` for typed boundaries or `Schema.UnknownFromJsonString` for unknown payloads. (EF-19)'
});
