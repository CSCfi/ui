<template>
  <div class="c-step" :class="{ 'c-step--complete': complete }">
    <div class="c-step__indicator">
      <div v-if="!complete" class="dot" :class="{ current }" />
      <div v-else class="complete">
        <svg viewBox="0 0 100 100">
          <path
            class="path"
            d="M 12 52 l 24 24 l 47 -47 l -3 -3 l -44 44 l -21 -21 l -3 3"
          />
        </svg>
      </div>
    </div>

    <div class="c-step__label">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  complete: { type: Boolean, default: false },
  current: { type: Boolean, default: false },
});
</script>

<style>
:host {
  --_c-step-color: var(--c-step-color, var(--c-tertiary-500));
  --_c-step-color-complete: var(--c-step-color-complete, var(--c-primary-600));
  --_c-step-text-color-complete: var(--c-step-text-color-complete, var(--c-white));

  position: relative;
  width: 180px;
}

/* c-steps toggles `.mobile` on each step host via JS when the container
 * is too narrow to fit every label. */
:host(.mobile) {
  width: 22px;
  height: 22px;
}

:host(.mobile) .c-step__label {
  display: none;
}

.c-step {
  display: grid;
  justify-items: center;
  padding: 0;
  gap: 8px;
  position: relative;
  box-sizing: border-box;
}

.c-step__indicator {
  box-sizing: border-box;
}

.c-step__indicator .dot {
  background-color: var(--c-white);
  box-shadow: inset 0 0 0 2px var(--_c-step-color);
  border-radius: 22px;
  height: 22px;
  width: 22px;
  position: relative;
}

.c-step__indicator .dot.current {
  box-shadow: inset 0 0 0 3px var(--_c-step-color-complete);
}

.c-step__indicator .dot.current::before {
  content: '';
  border-radius: 14px;
  height: 10px;
  width: 10px;
  background-color: var(--_c-step-color-complete);
  position: absolute;
  top: 6px;
  left: 6px;
}

.c-step__indicator .complete {
  background-color: var(--_c-step-color-complete);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.c-step__indicator .complete svg {
  width: 100%;
  height: 100%;
}

.c-step--complete .c-step__indicator > div {
  position: relative;
  border-radius: 22px;
  height: 22px;
  width: 22px;
  background-color: var(--_c-step-color-complete);
  padding: 4px;
}

.c-step--complete .c-step__indicator > div svg {
  position: relative;
  fill: var(--_c-step-text-color-complete);
}

.c-step--complete .c-step__indicator > div svg .path {
  fill: none;
  stroke: var(--_c-step-text-color-complete);
  stroke-dashoffset: 0;
  stroke-width: 13;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-miterlimit: 10;
}
</style>
