import type { CreateRule } from '@oxlint/plugins';

import { Plugin } from 'effect-oxlint';

import avoidAny from './rules/avoid-any.ts';
import avoidDataTaggedError from './rules/avoid-data-tagged-error.ts';
import avoidDirectJson from './rules/avoid-direct-json.ts';
import avoidDirectTagChecks from './rules/avoid-direct-tag-checks.ts';
import avoidExpectInIf from './rules/avoid-expect-in-if.ts';
import avoidMutableState from './rules/avoid-mutable-state.ts';
import avoidNativeFetch from './rules/avoid-native-fetch.ts';
import avoidNativeObjectHelpers from './rules/avoid-native-object-helpers.ts';
import avoidNodeImports from './rules/avoid-node-imports.ts';
import avoidNonNullAssertion from './rules/avoid-non-null-assertion.ts';
import avoidObjectType from './rules/avoid-object-type.ts';
import avoidOptionGetorthrow from './rules/avoid-option-getorthrow.ts';
import avoidPlatformCoupling from './rules/avoid-platform-coupling.ts';
import avoidProcessEnv from './rules/avoid-process-env.ts';
import avoidReactHooks from './rules/avoid-react-hooks.ts';
import avoidSchemaSuffix from './rules/avoid-schema-suffix.ts';
import avoidSyncFs from './rules/avoid-sync-fs.ts';
import avoidTryCatch from './rules/avoid-try-catch.ts';
import avoidTsIgnore from './rules/avoid-ts-ignore.ts';
import avoidUntaggedErrors from './rules/avoid-untagged-errors.ts';
import avoidYieldRef from './rules/avoid-yield-ref.ts';
import castingAwareness from './rules/casting-awareness.ts';
import contextTagExtends from './rules/context-tag-extends.ts';
import effectCatchallDefault from './rules/effect-catchall-default.ts';
import effectPromiseVsTrypromise from './rules/effect-promise-vs-trypromise.ts';
import effectRunInBody from './rules/effect-run-in-body.ts';
import imperativeLoops from './rules/imperative-loops.ts';
import noBarrelImports from './rules/no-barrel-imports.ts';
import noOpaqueInstanceFields from './rules/no-opaque-instance-fields.ts';
import preferArrMatch from './rules/prefer-arr-match.ts';
import preferArrSort from './rules/prefer-arr-sort.ts';
import preferDurationConstructors from './rules/prefer-duration-constructors.ts';
import preferEffectFn from './rules/prefer-effect-fn.ts';
import preferEffectIs from './rules/prefer-effect-is.ts';
import preferMatchOverSwitch from './rules/prefer-match-over-switch.ts';
import preferNamespaceImports from './rules/prefer-namespace-imports.ts';
import preferOptionOverNull from './rules/prefer-option-over-null.ts';
import preferRedactedConfig from './rules/prefer-redacted-config.ts';
import preferSchemaClass from './rules/prefer-schema-class.ts';
import requireEffectConcurrency from './rules/require-effect-concurrency.ts';
import requireFilterMetadata from './rules/require-filter-metadata.ts';
import requireSchemaTypeAlias from './rules/require-schema-type-alias.ts';
import streamLargeFiles from './rules/stream-large-files.ts';
import throwInEffectGen from './rules/throw-in-effect-gen.ts';
import useClockService from './rules/use-clock-service.ts';
import useCommandExecutorService from './rules/use-command-executor-service.ts';
import useConsoleService from './rules/use-console-service.ts';
import useFilesystemService from './rules/use-filesystem-service.ts';
import useHttpClientService from './rules/use-http-client-service.ts';
import usePathService from './rules/use-path-service.ts';
import useRandomService from './rules/use-random-service.ts';
import useTempFileScoped from './rules/use-temp-file-scoped.ts';
import vmInWrongFile from './rules/vm-in-wrong-file.ts';
import yieldInForLoop from './rules/yield-in-for-loop.ts';

/**
 * Mark a rule as part of the plugin's recommended set.
 *
 * Users can then enable every Effect rule at once via
 * `"categories": { "recommended": "error" }` in `oxlint.json`, instead of
 * having to list each rule individually.
 */
const recommend = (rule: CreateRule): CreateRule => ({
	...rule,
	meta: {
		...rule.meta,
		docs: {
			...rule.meta?.docs,
			recommended: true
		}
	}
});

const rules: Record<string, CreateRule> = {
	// ── Statement bans ───────────────────────────────────────
	'avoid-try-catch': avoidTryCatch,
	'prefer-match-over-switch': preferMatchOverSwitch,
	'imperative-loops': imperativeLoops,

	// ── Member expression bans ───────────────────────────────
	'avoid-data-tagged-error': avoidDataTaggedError,
	'avoid-direct-json': avoidDirectJson,
	'avoid-option-getorthrow': avoidOptionGetorthrow,
	'avoid-process-env': avoidProcessEnv,
	'use-random-service': useRandomService,
	'effect-run-in-body': effectRunInBody,
	'effect-promise-vs-trypromise': effectPromiseVsTrypromise,
	'prefer-schema-class': preferSchemaClass,
	'use-console-service': useConsoleService,
	'stream-large-files': streamLargeFiles,

	// ── Import bans ──────────────────────────────────────────
	'use-filesystem-service': useFilesystemService,
	'use-path-service': usePathService,
	'use-command-executor-service': useCommandExecutorService,
	'use-http-client-service': useHttpClientService,
	'avoid-platform-coupling': avoidPlatformCoupling,
	'avoid-node-imports': avoidNodeImports,

	// ── Type-level rules ─────────────────────────────────────
	'avoid-any': avoidAny,
	'avoid-object-type': avoidObjectType,
	'avoid-ts-ignore': avoidTsIgnore,
	'avoid-mutable-state': avoidMutableState,
	'avoid-schema-suffix': avoidSchemaSuffix,
	'avoid-non-null-assertion': avoidNonNullAssertion,
	'prefer-option-over-null': preferOptionOverNull,
	'casting-awareness': castingAwareness,

	// ── Call expression rules ────────────────────────────────
	'use-clock-service': useClockService,
	'avoid-native-fetch': avoidNativeFetch,
	'avoid-react-hooks': avoidReactHooks,
	'avoid-sync-fs': avoidSyncFs,
	'avoid-untagged-errors': avoidUntaggedErrors,
	'prefer-arr-sort': preferArrSort,

	// ── Complex / contextual rules ───────────────────────────
	'context-tag-extends': contextTagExtends,
	'throw-in-effect-gen': throwInEffectGen,
	'prefer-effect-fn': preferEffectFn,
	'yield-in-for-loop': yieldInForLoop,
	'avoid-expect-in-if': avoidExpectInIf,
	'avoid-yield-ref': avoidYieldRef,
	'effect-catchall-default': effectCatchallDefault,
	'avoid-direct-tag-checks': avoidDirectTagChecks,
	'vm-in-wrong-file': vmInWrongFile,
	'use-temp-file-scoped': useTempFileScoped,
	'avoid-native-object-helpers': avoidNativeObjectHelpers,

	// ── Pattern enforcement rules ────────────────────────────
	'prefer-namespace-imports': preferNamespaceImports,
	'prefer-effect-is': preferEffectIs,
	'prefer-duration-constructors': preferDurationConstructors,
	'prefer-arr-match': preferArrMatch,
	'prefer-redacted-config': preferRedactedConfig,
	'require-schema-type-alias': requireSchemaTypeAlias,
	'require-filter-metadata': requireFilterMetadata,
	'require-effect-concurrency': requireEffectConcurrency,
	'no-barrel-imports': noBarrelImports,
	'no-opaque-instance-fields': noOpaqueInstanceFields
};

export default Plugin.define({
	name: 'effect',
	rules: Object.fromEntries(
		Object.entries(rules).map(([name, rule]) => [name, recommend(rule)])
	)
});
