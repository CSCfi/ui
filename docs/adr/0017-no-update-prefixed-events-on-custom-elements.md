# 17. No `update:`-prefixed events on custom elements

Date: 2026-07-06

## Status

Accepted

## Context

csc-ui-next components dispatch raw `CustomEvent`s from the host element
(ADR-0012). For two-way-ish state (`page`, `sort`, `open`, …) we had adopted
Vue-idiomatic `update:<prop>` event names, documenting the consumer contract as
`:prop` in + `@update:prop` out (v-model args don't compile on custom
elements).

That contract turned out to be unlistenable from Vue itself. Vue compiles
`@update:page` on an element to the vnode key `onUpdate:page`, and
`runtime-dom`'s `patchProp` guards every event key with
`if (!isModelListener(key)) patchEvent(...)`, where `isModelListener` is
literally `key.startsWith('onUpdate:')` — such keys are assumed to be v-model
component plumbing and are **silently dropped on native/custom elements**: no
listener, no warning. The template compiler only emits the escaped exact-name
key (`"on:update:pageSize"`), which bypasses the guard, when the event name
contains an uppercase character. Net effect: `@update:pageSize` worked by
accident while `@update:page`, `@update:sort`, `@update:selected`,
`@update:expanded` (c-data-table), `@update:open` (c-menu) and
`@update:menu-visible` (c-side-navigation) could never fire in any Vue
consumer. This surfaced as "pagination does nothing" in the c-data-table
external-data docs example.

There is a second, subtler casing trap: for event names Vue considers
round-trippable it attaches the *hyphenated* name (`parseName` runs
`hyphenate()`), so a camelCase CustomEvent is only listenable when the
compiler knows the element is a custom element and emits the `on:` escape —
which never happens in no-build in-DOM templates, where the HTML parser has
already lowercased the attribute.

## Decision

Component events never use the `update:` prefix. State-change events are named
`change:<prop>` with the prop in **all-lowercase kebab-case**: `change:sort`,
`change:page`, `change:page-size`, `change:selected`, `change:expanded`
(c-data-table), `change:open` (c-menu), `change:menu-visible`
(c-side-navigation, which also drops its former camelCase twin event).

The namespaced form keeps the "mirrors the prop" readability of `update:*`,
and the all-lowercase constraint makes every name survive Vue's
`hyphenate()` round-trip — so `@change:page` works identically in SFC/JSX
builds *and* no-build in-DOM templates, plus `addEventListener` everywhere.

The sole `update:*` survivor is the `changeValue` / `update:value` / `input`
triple dispatched by `emitModelValue`: `update:value` is kept for the legacy
`v-control` directive, plain `v-model` rides the native `input` event, and
`changeValue` is the documented listenable name (a legacy-compat exception,
not the convention).

## Alternatives considered

- **`change<Prop>` camelCase** (`changePage`, after `changeValue`): consistent
  with the legacy triple, but depends on the compiler's `on:` escape, so it is
  unlistenable from no-build in-DOM templates.
- **Dual-dispatch `update:<prop>` plus a working alias**: no rename, but every
  event carries two names in the manifest and docs forever, and the primary
  documented name remains a silent no-op in Vue templates.

## Consequences

- The `:prop` + `@update:prop` contract is replaced by `:prop` +
  `@change:prop` throughout docs and examples.
- New event names must be all-lowercase (kebab-case for multi-word props);
  an event map key starting with `update:` or containing an uppercase letter
  should be rejected in review.
- `changeValue` remains a grandfathered exception on the value components.
