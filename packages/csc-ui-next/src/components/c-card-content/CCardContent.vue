<template>
  <article class="c-card-content">
    <slot />
  </article>
</template>

<script setup lang="ts"></script>

<style>
/* Ported from packages/csc-ui/src/components/c-card-content/c-card-content.scss.
 * Horizontal padding mirrors c-card-title's `padding-inline` so content
 * aligns with the title under the same `--_c-card-gap` value. Children
 * of the slot are laid out vertically with the same gap. */

:host {
  display: block;
}

.c-card-content {
  padding: 0 var(--_c-card-gap, 24px);
  display: flex;
  flex-direction: column;
  gap: var(--_c-card-gap, 24px);
}

::slotted(*) {
  max-width: 100%;
}
</style>
