<template>
  <header
    ref="root"
    class="c-card-title"
    :class="{ 'c-card-title--actions': hasActions }"
  >
    <div class="c-card-title__header">
      <p class="c-card-title__heading"><slot /></p>
      <div class="c-card-title__underline" />
    </div>
    <div v-show="hasActions" class="c-card-title__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useHasSlot } from '../../shared/useHasSlot';

const root = useTemplateRef<HTMLElement>('root');
const hasActions = useHasSlot(root, 'actions');
</script>

<style>
/* Ported from packages/csc-ui/src/components/c-card-title/c-card-title.scss.
 * The host carries the typography (uppercase, 500 weight, 1rem). The
 * `--c-card-title-color` and `--c-card-title-underline-color` are the
 * public override variables. Layout details:
 *   - `.c-card-title` is `padding-inline` driven by `--_c-card-gap`
 *     (set on the parent c-card, inherits via CSS custom-property cascade).
 *   - When the `actions` slot has content, `.c-card-title--actions` makes
 *     the row a flex container with gap:8px so header + actions sit side-
 *     by-side with a gap.
 *   - `.c-card-title__actions` itself is also a flex container with
 *     gap:8px so multiple actions inside the slot are spaced. */

:host {
  --_c-card-title-color: var(--c-card-title-color, var(--c-text-system));
  --_c-card-title-underline-color: var(
    --c-card-title-underline-color,
    var(--c-primary-600)
  );

  color: var(--_c-card-title-color);
  display: block;
  font-family: var(--c-font-family);
  font-size: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  text-wrap: balance;
}

.c-card-title {
  /* Falls back to 24px when not rendered inside a c-card. Inside a c-card
   * `--_c-card-gap` is set on the parent and cascades down through the
   * shadow boundary via CSS custom-property inheritance. */
  padding-inline: var(--_c-card-gap, 24px);
}

.c-card-title--actions {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  flex: 0 0 auto;
  gap: 8px;
}

.c-card-title__header p {
  margin: 0;
}

.c-card-title__heading {
  margin: 0;
}

.c-card-title__underline {
  background-color: var(--_c-card-title-underline-color);
  border-radius: 4px;
  height: 4px;
  margin-top: 10px;
  width: 44px;
}

.c-card-title__actions {
  display: flex;
  flex-wrap: wrap-reverse;
  align-items: center;
  justify-content: end;
  gap: 8px;
  flex: 1;
}
</style>
