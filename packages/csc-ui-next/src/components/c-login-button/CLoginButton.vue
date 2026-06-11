<template>
  <a tabindex="0" :href="href || undefined">
    <img :src="src || ''" :alt="alt" />
    <div>
      <slot />
    </div>
  </a>
</template>

<script setup lang="ts">
defineProps({
  href: { type: String, default: '' },
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
});
</script>

<style>
:host {
  --_c-login-button-background-color: var(--c-login-button-background-color, var(--c-white));
  --_c-login-button-border-color: var(--c-login-button-border-color, var(--c-tertiary-200));
  --_c-login-button-outline-color: var(--c-login-button-outline-color, var(--c-primary-600));
  --_c-login-button-text-color: var(--c-login-button-text-color, var(--c-text-system));
  --_c-login-button-title-background-color: var(--c-login-button-title-background-color, var(--c-tertiary-100));
}

a {
  background-color: var(--_c-login-button-background-color);
  border-radius: 4px;
  border: 1px var(--_c-login-button-border-color) solid;
  color: var(--_c-login-button-text-color);
  cursor: pointer;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
  height: 100%;
  min-height: 168px;
  outline: 1px transparent solid;
  place-content: center;
  text-align: center;
  text-decoration: none;
}

a img {
  max-height: 120px;
  max-width: 200px;
  padding: 8px 24px;
  place-self: center;
}

a div {
  background-color: var(--_c-login-button-title-background-color);
  border-radius: 0 0 4px 4px;
  box-shadow: 0 -1px 0 0 var(--_c-login-button-border-color);
  font-size: 14px;
  padding: 4px;
}

a:hover {
  border-color: var(--_c-login-button-outline-color);
  outline: 1px var(--_c-login-button-outline-color) solid;
}

a:focus-visible {
  outline: 2px var(--_c-login-button-outline-color) solid;
  outline-offset: 2px;
}
</style>
