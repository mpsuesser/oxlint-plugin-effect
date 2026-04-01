import { memberExprRule } from '../utils.ts';

export default memberExprRule(
	'Consider streaming for large file reads — use Effect Stream instead of full reads',
	[
		{
			obj: 'fs',
			prop: ['readFile', 'readFileString'],
			message:
				'Consider using `Stream` for large file reads instead of `fs.readFile`/`fs.readFileString` which load entire files into memory. Use `Stream.fromReadableStream` or `FileSystem.stream` for streaming I/O.'
		}
	]
);
