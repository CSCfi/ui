<template>
  <footer class="c-login-card-actions__footer">
    <menu class="c-login-card-actions" :class="actionClasses">
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
  [`c-login-card-actions--align-${props.align}`]: true,
  [`c-login-card-actions--justify-${props.justify}`]: true,
}));
</script>

<style>
/* The Stencil version delegated to <c-card-actions> with --_c-card-gap: 0.
 * Inline the layout here (footer + flex menu) so we don't nest custom
 * elements just to override a single CSS variable, which would also
 * introduce a second shadow boundary that CSS overrides have to cross. */

:host {
  display: block;
}

.c-login-card-actions__footer {
  padding: 0;
}

.c-login-card-actions {
  margin: 0;
  padding: 0;
  display: flex;
  gap: 8px;
  align-items: center;
}

.c-login-card-actions--align-start { align-items: flex-start; }
.c-login-card-actions--align-center { align-items: center; }
.c-login-card-actions--align-end { align-items: flex-end; }

.c-login-card-actions--justify-start { justify-content: flex-start; }
.c-login-card-actions--justify-center { justify-content: center; }
.c-login-card-actions--justify-end { justify-content: flex-end; }
.c-login-card-actions--justify-space-between { justify-content: space-between; }
.c-login-card-actions--justify-space-around { justify-content: space-around; }
.c-login-card-actions--justify-stretch { justify-content: stretch; }

.c-login-card-actions--justify-stretch ::slotted(*) {
  flex: 1;
}

::slotted(c-button[fit]) {
  flex: 1;
}
</style>
