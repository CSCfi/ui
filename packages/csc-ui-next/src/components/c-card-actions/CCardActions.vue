<template>
  <footer class="c-card-actions__footer">
    <menu class="c-card-actions" :class="actionClasses">
      <slot />
    </menu>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  align: { type: String, default: 'center' },
  justify: { type: String, default: 'start' },
});

const actionClasses = computed(() => ({
  [`c-card-actions--align-${props.align}`]: true,
  [`c-card-actions--justify-${props.justify}`]: true,
}));
</script>

<style>
/* Ported from packages/csc-ui/src/components/c-card-actions/c-card-actions.scss.
 * Horizontal padding lives on the <footer> (keyed off `--_c-card-gap` so
 * actions align with the title and content), the inner <menu> has zero
 * margin/padding, and the actions row itself is a flex container with
 * gap:8px. Vertical padding is intentionally absent — the parent c-card's
 * article supplies `padding-block: var(--_c-card-gap)`, so the bottom
 * gap below the actions row is already there. */

:host {
  display: block;
}

.c-card-actions__footer {
  padding: 0 var(--_c-card-gap, 24px);
}

.c-card-actions {
  margin: 0;
  padding: 0;
  display: flex;
  gap: 8px;
  align-items: center;
}

.c-card-actions--align-start {
  align-items: flex-start;
}

.c-card-actions--align-center {
  align-items: center;
}

.c-card-actions--align-end {
  align-items: flex-end;
}

.c-card-actions--justify-start {
  justify-content: flex-start;
}

.c-card-actions--justify-center {
  justify-content: center;
}

.c-card-actions--justify-end {
  justify-content: flex-end;
}

.c-card-actions--justify-space-between {
  justify-content: space-between;
}

.c-card-actions--justify-space-around {
  justify-content: space-around;
}

.c-card-actions--justify-stretch {
  justify-content: stretch;
}

.c-card-actions--justify-stretch ::slotted(*) {
  flex: 1;
}

::slotted(c-button[fit]) {
  flex: 1;
}
</style>
