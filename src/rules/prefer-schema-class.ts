import { Rule } from 'effect-oxlint';

export default Rule.banMember('Schema', 'Struct', {
	message:
		'Prefer `Schema.Class` over `Schema.Struct` for named schema types with instance methods. `Schema.Class` provides constructor, `$is`, `$match`, and type branding. (EF-8)'
});
