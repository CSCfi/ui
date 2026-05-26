<template>
  <a
    :class="{ underline }"
    :href="href || undefined"
    :target="target || undefined"
    :style="{ fontWeight: String(weight) }"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
defineProps({
  href: { type: String, default: '' },
  underline: { type: Boolean, default: false },
  target: { type: String, default: '' },
  weight: { type: [String, Number], default: '600' },
});
</script>

<style>
:host {
  --_c-link-color: var(--c-link-color, var(--c-info-700));
  --_c-link-hover: var(--c-link-hover, var(--c-accent-200));

  display: inline;
}

a {
  --_c-link-icon-margin: 8px;

  align-items: center;
  background-color: transparent;
  color: var(--_c-link-color);
  cursor: pointer;
  display: inline-flex;
  font-size: inherit;
  gap: var(--_c-link-icon-margin);
  justify-content: start;
  text-decoration: none;
  transition: background-color 0.3s ease-in-out;
}

a:hover {
  background-color: var(--_c-link-hover);
}

a.underline {
  text-decoration: underline;
}

a:focus {
  outline: none;
}

a:focus-visible {
  outline: 2px var(--_c-link-color) solid;
  outline-offset: 4px;
  border-radius: 2px;
}
</style>
