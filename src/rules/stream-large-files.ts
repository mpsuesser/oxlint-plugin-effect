import { Rule } from 'effect-oxlint';

export default Rule.banMember('fs', ['readFile', 'readFileString'], {
	message:
		'Consider using `Stream` for large file reads instead of `fs.readFile`/`fs.readFileString` which load entire files into memory. Use `Stream.fromReadableStream` or `FileSystem.stream` for streaming I/O.'
});
