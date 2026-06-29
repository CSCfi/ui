<template>
  <div :class="ui.root()" part="root">
    <div :class="ui.indicator()" part="indicator">
      <div v-if="!complete" :class="ui.dot()" part="dot" />

      <div v-else :class="ui.complete()" part="complete">
        <svg :class="ui.checkSvg()" viewBox="0 0 100 100">
          <path
            :class="ui.checkPath()"
            d="M 12 52 l 24 24 l 47 -47 l -3 -3 l -44 44 l -21 -21 l -3 3"
          />
        </svg>
      </div>
    </div>

    <div :class="ui.label()" part="label">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004): the
 * old per-component `--_c-step-*` override-variable layer is dropped and
 * authored directly against the design tokens; the `complete`/`current` prop
 * matrix becomes `variants`. Customization is via `::part()` (ADR-0006); there
 * is no `override` prop.
 *
 * The host MUST stay a real box (the parent <c-steps> lays out each step plus
 * its sibling `.divider` in the host's light DOM as flex children, so the
 * host's width drives the layout). That `:host` box and the JS-toggled
 * `:host(.mobile)` collapse live in the escape-hatch <style> below (ADR-0007);
 * everything else is utilities.
 *
 * Indicator colours:
 *  - incomplete dot: `inset` ring in tertiary-500 (current → primary-600 ring
 *    + a centred primary-600 `::before` pip).
 *  - complete: primary-600 filled circle with a white check (SVG stroke/fill
 *    use `currentColor`, set white via `text-white` on the container).
 */
const step = tv({
  defaultVariants: {
    current: false,
  },
  slots: {
    checkPath:
      'fill-none stroke-current [stroke-dashoffset:0] [stroke-width:13] [stroke-linecap:round] [stroke-linejoin:round] [stroke-miterlimit:10]',
    checkSvg: 'relative size-full',
    // complete: primary-600 filled circle holding the white check SVG.
    complete:
      'relative flex items-center justify-center box-border size-[22px] rounded-full bg-primary-600 p-1 text-white',
    // incomplete: white circle with a 2px inset tertiary-500 ring.
    dot: 'relative size-[22px] rounded-full bg-white shadow-[inset_0_0_0_2px_var(--c-tertiary-500)]',
    indicator: 'box-border',
    label: 'px-2',
    root: 'relative grid justify-items-center p-0 gap-2 box-border',
  },
  variants: {
    current: {
      // current ring (primary-600, 3px inset) + centred pip via ::before.
      true: {
        dot: "shadow-[inset_0_0_0_3px_var(--c-primary-600)] before:content-[''] before:absolute before:size-2.5 before:rounded-full before:bg-primary-600 before:top-1.5 before:left-1.5",
      },
    },
  },
});

interface CStepProps {
  complete?: boolean;
  current?: boolean;
}

const props = withDefaults(defineProps<CStepProps>(), {
  complete: false,
  current: false,
});

const ui = computed(() => step({ current: props.current }));
</script>

<!--
  Escape-hatch CSS (ADR-0007): constructs Tailwind utilities cannot express.
  - :host box — the host must be a real, sized box (180px wide) because the
    parent <c-steps> arranges each step and its sibling `.divider` as flex
    children in the host's light DOM. This deliberately overrides the global
    `:host{display:contents}`; the per-type sheet is adopted after the shared
    sheet, so it wins.
  - :host(.mobile) — positional/contextual host state toggled imperatively by
    <c-steps> (a JS-added class, not a prop), collapsing the step to a bare
    22×22 dot and hiding the label. Tokens only.
  All static / variant styling lives in the `tv` config above.
-->
<style>
:host {
  display: block;
  position: relative;
  width: 180px;
}

:host(.mobile) {
  width: 22px;
  height: 22px;
}

:host(.mobile) [part='label'] {
  display: none;
}
</style>
