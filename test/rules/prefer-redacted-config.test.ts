import { describe, expect, it } from 'vitest';

import * as Arr from 'effect/Array';

import rule from '../../src/rules/prefer-redacted-config.ts';
import { Testing } from 'effect-oxlint';

const run = (node: unknown) => Testing.runRule(rule, 'CallExpression', node);

const configSchemaCall = (firstArg: unknown) => ({
	type: 'CallExpression',
	callee: Testing.memberExpr('Config', 'schema'),
	arguments: [firstArg]
});

const schemaStructCall = (struct: unknown) => ({
	type: 'CallExpression',
	callee: Testing.memberExpr('Schema', 'Struct'),
	arguments: [struct]
});

describe('prefer-redacted-config', () => {
	// ── Detection 1: primitive loaders ──
	describe('Config.string / Config.nonEmptyString', () => {
		it('flags Config.string("API_KEY")', () => {
			const errs = run(
				Testing.callOfMember('Config', 'string', [
					Testing.strLiteral('API_KEY')
				])
			);
			expect(errs).toHaveLength(1);
			expect(errs[0]?.diagnostic.message).toContain('Config.redacted');
			expect(errs[0]?.diagnostic.message).toContain('API_KEY');
		});

		it('flags Config.nonEmptyString("GITHUB_TOKEN")', () => {
			expect(
				run(
					Testing.callOfMember('Config', 'nonEmptyString', [
						Testing.strLiteral('GITHUB_TOKEN')
					])
				)
			).toHaveLength(1);
		});

		it('flags secret patterns case-insensitively (api_key, AuthToken, password, dsn)', () => {
			Arr.forEach(['api_key', 'AuthToken', 'PASSWORD', 'dsn'], (key) => {
				const errs = run(
					Testing.callOfMember('Config', 'string', [
						Testing.strLiteral(key)
					])
				);
				expect(errs, `should flag ${key}`).toHaveLength(1);
			});
		});

		it('flags suffix matches (DATABASE_URL, MY_API_KEY, db-url)', () => {
			Arr.forEach(['DATABASE_URL', 'MY_API_KEY', 'db-url'], (key) => {
				expect(
					run(
						Testing.callOfMember('Config', 'string', [
							Testing.strLiteral(key)
						])
					)
				).toHaveLength(1);
			});
		});

		it('does not flag non-secret keys (PORT, HOST, LOG_LEVEL)', () => {
			Arr.forEach(['PORT', 'HOST', 'LOG_LEVEL'], (key) => {
				expect(
					run(
						Testing.callOfMember('Config', 'string', [
							Testing.strLiteral(key)
						])
					)
				).toHaveLength(0);
			});
		});

		it('does not flag other Config.* primitives (Config.int, Config.boolean)', () => {
			expect(
				run(
					Testing.callOfMember('Config', 'int', [
						Testing.strLiteral('API_KEY')
					])
				)
			).toHaveLength(0);
			expect(
				run(
					Testing.callOfMember('Config', 'boolean', [
						Testing.strLiteral('SECRET')
					])
				)
			).toHaveLength(0);
		});

		it('does not flag Config.redacted itself', () => {
			expect(
				run(
					Testing.callOfMember('Config', 'redacted', [
						Testing.strLiteral('API_KEY')
					])
				)
			).toHaveLength(0);
		});

		it('does not flag identifier-key calls (cannot statically tell)', () => {
			expect(
				run(
					Testing.callOfMember('Config', 'string', [
						Testing.id('SECRET_KEY_NAME')
					])
				)
			).toHaveLength(0);
		});

		it('does not flag a zero-arg Config.string()', () => {
			expect(run(Testing.callOfMember('Config', 'string'))).toHaveLength(
				0
			);
		});
	});

	// ── Detection 2: Schema fields inside Config.schema(Schema.Struct({...})) ──
	describe('Config.schema(Schema.Struct({...})) fields', () => {
		it('flags `apiKey: Schema.String`', () => {
			const errs = run(
				configSchemaCall(
					schemaStructCall(
						Testing.objectExpr([
							{
								key: 'apiKey',
								value: Testing.memberExpr('Schema', 'String')
							}
						])
					)
				)
			);
			expect(errs).toHaveLength(1);
			expect(errs[0]?.diagnostic.message).toContain('Schema.Redacted');
			expect(errs[0]?.diagnostic.message).toContain('apiKey');
		});

		it('flags `password: Schema.NonEmptyString`', () => {
			expect(
				run(
					configSchemaCall(
						schemaStructCall(
							Testing.objectExpr([
								{
									key: 'password',
									value: Testing.memberExpr(
										'Schema',
										'NonEmptyString'
									)
								}
							])
						)
					)
				)
			).toHaveLength(1);
		});

		it('flags every secret-shaped field independently', () => {
			expect(
				run(
					configSchemaCall(
						schemaStructCall(
							Testing.objectExpr([
								{
									key: 'apiKey',
									value: Testing.memberExpr(
										'Schema',
										'String'
									)
								},
								{
									key: 'authToken',
									value: Testing.memberExpr(
										'Schema',
										'NonEmptyString'
									)
								},
								{
									key: 'port',
									value: Testing.memberExpr('Schema', 'Int')
								}
							])
						)
					)
				)
			).toHaveLength(2);
		});

		it('does not flag wrapped `Schema.Redacted(Schema.String)` values', () => {
			const redacted = {
				type: 'CallExpression',
				callee: Testing.memberExpr('Schema', 'Redacted'),
				arguments: [Testing.memberExpr('Schema', 'String')]
			};
			expect(
				run(
					configSchemaCall(
						schemaStructCall(
							Testing.objectExpr([
								{ key: 'apiKey', value: redacted }
							])
						)
					)
				)
			).toHaveLength(0);
		});

		it('does not flag non-secret keys (port, host, retries)', () => {
			expect(
				run(
					configSchemaCall(
						schemaStructCall(
							Testing.objectExpr([
								{
									key: 'port',
									value: Testing.memberExpr(
										'Schema',
										'Number'
									)
								},
								{
									key: 'host',
									value: Testing.memberExpr(
										'Schema',
										'String'
									)
								}
							])
						)
					)
				)
			).toHaveLength(0);
		});

		it('does not fire outside Config.schema(...)', () => {
			// `Schema.Struct({ apiKey: Schema.String })` alone, not wrapped
			// in Config.schema, is plain domain modelling and is fine.
			expect(
				run(
					schemaStructCall(
						Testing.objectExpr([
							{
								key: 'apiKey',
								value: Testing.memberExpr('Schema', 'String')
							}
						])
					)
				)
			).toHaveLength(0);
		});

		it('does not fire when Config.schema is given a named schema (cannot statically inspect)', () => {
			expect(
				run(configSchemaCall(Testing.id('AppConfigSchema')))
			).toHaveLength(0);
		});
	});
});
