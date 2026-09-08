<template>
  <slot />
</template>

<script setup lang="ts">
/**
 * @slot default - The option's label: the text c-select and c-autocomplete use for the option in the closed field, its tag and the filter, and the region c-autocomplete marks query matches in
 */
// The label region of a <c-option> (ADR-0045). A consumer wraps the label
// text in it so the option can carry more than its label — a description, an
// icon — without that content becoming part of the label: c-select and
// c-autocomplete read `optionLabel()` (src/shared/optionLabel.ts), which
// prefers the option's `name`, then this element's text, then the option's
// whole text. In c-autocomplete the row also marks the runs of this text that
// equal the query with `<mark part="match">` — on a query-time clone of the
// option, never by writing into the consumer's element. The content is
// treated as plain text: nested markup inside the wrapper is flattened while
// a query is typed and restored when it empties.

// Template is a bare `<slot />` (fragment root), so attrs can't be
// auto-inherited; keep any consumer `class`/`style` on the host element
// rather than tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });
</script>

<!--
  Escape-hatch CSS: this component renders a bare `<slot />` with no
  element to hang a utility class on, and its only style is the host box itself.
  `:host{display:block}` overrides the global `:host{display:contents}` so the
  label region is a real block box: the option rows ellipsise it as the block
  whose text overflows, and any secondary content after it stacks below the
  label. Utilities can't target the host. No tv config: there is no inner
  region to style.
-->
<style>
:host {
  display: block;
}
</style>
