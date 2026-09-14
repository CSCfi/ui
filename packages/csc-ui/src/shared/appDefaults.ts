/**
 * App-wide prop defaults (ADR-0048).
 *
 * A consumer sets a *defaultable* prop once for every instance of a tag —
 * `labelOnTop` on every text field, one `texts` translation per list field —
 * instead of repeating it per instance:
 *
 *   applyDefaults({ 'c-text-field': { labelOnTop: true } });
 *
 * Only props tagged `@defaultable <built-in>` in their SFC take part; the
 * analyzer derives the `AppDefaults` type and the `DEFAULTABLE_PROPS`
 * allow-list from those tags (src/tag-name-map.ts). Each such prop declares
 * `undefined` in `withDefaults` — so "unset" is observable — and resolves
 * through `useAppDefault` below, in this order:
 *
 *   host attribute → own property (non-nullish) → app default → built-in
 *
 * Why the host attribute comes first — two Vue `defineCustomElement` quirks:
 *   1. A Boolean prop supplied via *attribute* (`<c-select hide-details>`)
 *      has been observed to reset to its default on the wrapper's re-render
 *      (it re-renders on every value change): the host attribute persists,
 *      but the prop flips. The attribute is the stable signal.
 *   2. Binding `hide-details` to a nested `c-input` in a template is mangled
 *      on update — the key matches c-input's declared prop, so Vue treats it
 *      as a property, and the reset above reflects back out and removes the
 *      attribute. Wrappers therefore forward it through a plain
 *      `data-hide-details` attribute (no declared-prop collision, so Vue
 *      patches it reliably) that c-input reads back.
 * Property writes reflect to attributes as well (`el.size = 'small'` writes
 * `size="small"`, `el.labelOnTop = false` removes the attribute), so one
 * attribute-first order is sound for Booleans, strings and numbers alike.
 *
 * The registry is a module-level `reactive()` object and every resolved
 * computed depends on it, so a later `applyDefaults()` re-renders mounted
 * elements (runtime language switching). Not provide/inject: the library
 * coordinates through module singletons (modalStack, popoverChain,
 * applyTheme), and a per-element app context would not be live for trees
 * that are already mounted.
 */

import { computed, type ComputedRef, reactive, useHost } from 'vue';

import { type AppDefaults, DEFAULTABLE_PROPS } from '../tag-name-map';

import { coerceBoolean } from './coerceBoolean';
import { hyphenate } from './defineElement';

export type { AppDefaults } from '../tag-name-map';
export { DEFAULTABLE_PROPS } from '../tag-name-map';

/** A tag with at least one defaultable prop. */
export type DefaultableTag = keyof AppDefaults;

type Bucket<T extends DefaultableTag> = NonNullable<AppDefaults[T]>;

/** The value a resolved prop takes: the element member type, made required. */
type Resolved<T extends DefaultableTag, K extends keyof Bucket<T>> = Required<
  NonNullable<Bucket<T>[K]>
>;

/** tag → { prop → app default }. Reactive: every resolved computed depends on it. */
const registry = reactive<{ [T in DefaultableTag]?: Bucket<T> }>({});

// The same proxy, viewed loosely for the merge/delete code below.
const buckets = registry as Record<string, Record<string, unknown> | undefined>;

const defaultableTags: readonly string[] = Object.keys(DEFAULTABLE_PROPS);

const isDefaultableTag = (tag: string): tag is DefaultableTag =>
  defaultableTags.includes(tag);

/**
 * Validate a consumer-supplied defaults object. Throws on an unknown tag or a
 * prop that is not defaultable — this is a developer-facing API, so fail loud
 * (cf. applyTheme's seedVars).
 */
const validate = (defaults: AppDefaults): void => {
  for (const [tag, bucket] of Object.entries(defaults)) {
    if (!isDefaultableTag(tag)) {
      throw new Error(
        `applyDefaults: <${tag}> has no defaultable props. ` +
          `Tags with defaultable props: ${defaultableTags.join(', ')}.`,
      );
    }

    const allowed: readonly string[] = DEFAULTABLE_PROPS[tag];

    for (const key of Object.keys(bucket ?? {})) {
      if (!allowed.includes(key)) {
        throw new Error(
          `applyDefaults: "${key}" is not a defaultable prop of <${tag}>. ` +
            `Defaultable: ${allowed.join(', ')}.`,
        );
      }
    }
  }
};

/**
 * Set app-wide defaults. Merges with previously applied defaults tag by tag;
 * a key set to `undefined` clears that key. An object prop (`texts`) is stored
 * whole and merged key by key with the built-in and per-instance texts at each
 * element. Live: mounted elements re-render. No-op outside the browser — a
 * module-level registry must not leak across server requests, and custom
 * elements never render on the server.
 */
export function applyDefaults(defaults: AppDefaults): void {
  validate(defaults); // validate before touching state

  if (typeof document === 'undefined') return;

  for (const [tag, bucket] of Object.entries(defaults)) {
    if (!bucket) continue;

    const target = (buckets[tag] ??= {});

    for (const [key, value] of Object.entries(bucket)) {
      if (value === undefined) delete target[key];
      else target[key] = value;
    }
  }
}

/** Clear the app-wide defaults of the given tags, or of every tag when omitted. */
export function resetDefaults(tags?: DefaultableTag[]): void {
  for (const tag of tags ?? Object.keys(buckets)) delete buckets[tag];
}

/** An object's own entries whose value is not `undefined`, for a per-key merge. */
const defined = (o: unknown): Record<string, unknown> =>
  typeof o === 'object' && o !== null
    ? Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined))
    : {};

/** Parse a host attribute into the prop's shape (decided by the built-in). */
const fromAttribute = (attr: string, builtIn: unknown): unknown => {
  if (typeof builtIn === 'boolean') return coerceBoolean(attr); // '' → true

  if (typeof builtIn === 'number') {
    const n = Number(attr);

    return attr.trim() !== '' && Number.isFinite(n) ? n : builtIn;
  }

  return attr;
};

/**
 * Per-instance resolver for defaultable props. Call once in setup, then one
 * line per prop:
 *
 *   const appDefault = useAppDefault('c-text-field', props);
 *   const labelOnTopResolved = appDefault('labelOnTop', false);
 *
 * Scalars: host attribute → own property (non-nullish) → app default →
 * built-in, with Boolean coercion applied *after* the layer is chosen
 * (`coerceBoolean(undefined)` is `false` and would swallow the fallthrough).
 * Objects (`texts`): per-key merge, built-in ← app default ← own.
 *
 * A nullish own value counts as "unset" (Vue itself treats `null` as an
 * explicit value; here it falls through to the app default).
 */
export const useAppDefault = <T extends DefaultableTag>(
  tag: T,
  props: object,
) => {
  const host = useHost();

  const own = props as Record<string, unknown>;

  return <K extends keyof Bucket<T> & string>(
    key: K,
    builtIn: Resolved<T, K>,
  ): ComputedRef<Resolved<T, K>> =>
    computed(() => {
      // Read the prop FIRST, unconditionally: it is the reactive dependency
      // that re-runs this computed when the instance value changes.
      const value = own[key];

      const app = buckets[tag]?.[key];

      if (typeof builtIn === 'object' && builtIn !== null) {
        return {
          ...(builtIn as object),
          ...defined(app),
          ...defined(value),
        } as Resolved<T, K>;
      }

      const attr = host?.getAttribute(hyphenate(key)) ?? null;

      if (attr !== null) return fromAttribute(attr, builtIn) as Resolved<T, K>;

      if (value != null) {
        return (
          typeof builtIn === 'boolean' ? coerceBoolean(value) : value
        ) as Resolved<T, K>;
      }

      return (app ?? builtIn) as Resolved<T, K>;
    });
};
