<template>
  <slot />
</template>

<script setup lang="ts">
/**
 * @slot default - The radio button's label text, read by the parent c-radio-group
 */
// `<slot />` root (fragment) — keep consumer fallthrough attrs (class/style)
// on the host element instead of tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

interface CRadioProps {
  /**
   * Set option as checked
   *
   * @seeded from csc-ui — verify
   */
  checked?: boolean;
  /**
   * Disable the radio button
   *
   * @seeded from csc-ui — verify
   */
  disabled?: boolean;
  /**
   * Radio button value
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  value?: string;
}

withDefaults(defineProps<CRadioProps>(), {
  checked: false,
  disabled: false,
  value: '',
});
</script>

<!--
  Escape-hatch CSS: c-radio is a data-only element with no visual
  region to style via `tv`. The actual radio button visuals are rendered by the
  parent <c-radio-group>, which scans for slotted c-radio children at mount time
  and reads their attributes + text content. The only rule here is a host box
  override (`display: none`, overriding the global `:host{display:contents}`) so
  the unstyled fallback text doesn't show — the group provides the rendered UI.
  This is not expressible as a `tv` utility (it targets the host itself).
-->
<style>
:host {
  display: none;
}
</style>
