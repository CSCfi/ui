<template>
  <!-- One toolbar switcher, rendered twice and switched by CSS at `md`: a
       labelled button from `md` up, an icon button below it, so the bar fits
       a 360px phone. CSS rather than a JS breakpoint keeps the prerendered
       page right before hydration; the hidden copy is display:none, out of
       the tab order and the accessibility tree. -->
  <div class="contents">
    <div
      v-for="compact in [false, true]"
      :key="String(compact)"
      :class="compact ? 'contents md:hidden' : 'contents max-md:hidden'"
    >
      <c-menu
        distance="8"
        position="bottom-end"
        @select="emit('select', $event)"
      >
        <c-icon-button
          v-if="compact"
          slot="trigger"
          :aria-label="label"
          appearance="text"
          size="small"
        >
          <slot :compact="true" name="icon" />
        </c-icon-button>

        <c-button
          v-else
          slot="trigger"
          :aria-label="label"
          appearance="text"
          size="small"
        >
          <slot :compact="false" name="icon" />

          {{ text }}
        </c-button>

        <slot />
      </c-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** The trigger's accessible name; it contains `text`. */
  label: string;

  /** The trigger's visible label from `md` up. */
  text: string;
}>();

// The menu's own `select` event, passed on; each switcher types its detail.
const emit = defineEmits<{
  select: [event: CustomEvent];
}>();

defineSlots<{
  default(): unknown;
  icon(props: { compact: boolean }): unknown;
}>();
</script>

<style scoped>
c-button::part(root) {
  color: var(--c-on-surface);
}
</style>
