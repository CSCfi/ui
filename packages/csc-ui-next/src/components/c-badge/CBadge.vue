<template>
  <slot />
</template>

<script setup lang="ts"></script>

<style>
:host {
  --_c-badge-background-color: var(--c-badge-background-color, var(--c-warning-600));
  --_c-badge-text-color: var(--c-badge-text-color, var(--c-white));
  --_c-badge-border-color: var(--c-badge-border-color, var(--c-white));

  align-items: center;
  background-color: var(--_c-badge-background-color);
  border-radius: 16px;
  box-shadow: 0 0 0 2px var(--_c-badge-border-color);
  color: var(--_c-badge-text-color);
  display: flex;
  font-size: 12px;
  height: 16px;
  justify-content: center;
  line-height: 1;
  min-width: 16px;
  padding: 0 4px;
  pointer-events: none;
  position: absolute;
  right: -6px;
  top: -6px;
  z-index: 2;
}
</style>
