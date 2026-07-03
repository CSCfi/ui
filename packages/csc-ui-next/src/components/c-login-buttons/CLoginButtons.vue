<template>
  <slot />
</template>

<script setup lang="ts">
/**
 * @slot default - Default slot
 *
 * @seeded from csc-ui — verify
 *
 * @subcomponents c-login-button
 */
// `<slot />` root (fragment) — keep consumer fallthrough attrs (class/style)
// on the host element instead of tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });
</script>

<!--
  Escape-hatch CSS (ADR-0007): the host itself must be the grid container so the
  slotted light-DOM <c-login-button> children become its grid items — there is
  no inner element that could host the grid without breaking that parent/child
  relationship. This `:host{display:grid}` deliberately overrides the global
  `:host{display:contents}` (the per-type sheet is adopted after the shared
  sheet, so it wins). The `clamp()` gap and `repeat(auto-fill, minmax())`
  template are layout-only (no design tokens) and have no Tailwind utility.
-->
<style>
:host {
  display: grid;
  grid-gap: clamp(1rem, 2vw, 1.5rem);
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
}
</style>
