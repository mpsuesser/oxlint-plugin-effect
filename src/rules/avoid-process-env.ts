import { memberExprRule } from '../utils.ts';

export default memberExprRule(
	'Disallow process.env — use Effect Config and ConfigProvider instead',
	[
		{
			obj: 'process',
			prop: 'env',
			message:
				'Avoid direct `process.env` access in domain code. Use `Config.string`, `Config.int`, `Config.redacted`, etc. for typed, testable configuration loading. (EF-28)'
		}
	]
);
