<template>
  <slot />
</template>

<script setup lang="ts">
import { onMounted, useHost, watchEffect } from 'vue';

// Template is a bare `<slot />` (fragment root) and we write `--_c-row-gap`
// to the host's inline style below — which the custom-element wrapper reflects
// back as a `style` fallthrough attr. Opt out so it stays on the host (the
// flex container) instead of tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

interface CRowProps {
  align?: string;
  gap?: number;
  justify?: string;
  nowrap?: boolean;
}

const props = withDefaults(defineProps<CRowProps>(), {
  align: '',
  gap: 0,
  justify: '',
  nowrap: false,
});

// `--_c-row-gap` is read from the host's inline style by the gap rule.
// Stencil sets it once in componentDidLoad; mirror that with watchEffect
// so dynamic prop changes still update the gap.
const host = useHost();
onMounted(() => {
  if (!host) return;
  watchEffect(() => {
    host.style.setProperty('--_c-row-gap', `${props.gap}px`);
  });
});
</script>

<!--
  Escape-hatch CSS (ADR-0007): this component has no inner `root` element — the
  slotted children are the host's direct flex items, so the host itself MUST be
  the flex container. Utilities cannot target a shadow host, so the host layout,
  its positional `:host([attr])` variants (align/justify/nowrap), and the
  JS-driven `--_c-row-gap` inline var all live here. This `:host` deliberately
  overrides the global `:host{display:contents}` (the per-type sheet wins).
-->
<style>
:host {
  --_c-row-gap: 0px;

  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: var(--_c-row-gap);
}

:host([nowrap]) {
  flex-wrap: nowrap !important;
}

:host([align='center']) {
  align-items: center;
}
:host([align='start']) {
  align-items: flex-start;
}
:host([align='end']) {
  align-items: flex-end;
}

:host([justify='start']) {
  justify-content: flex-start;
}
:host([justify='center']) {
  justify-content: center;
}
:host([justify='end']) {
  justify-content: flex-end;
}
:host([justify='space-between']) {
  justify-content: space-between;
}
:host([justify='space-around']) {
  justify-content: space-around;
}
</style>
