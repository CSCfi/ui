<template>
  <article class="c-card__article">
    <button
      v-if="fullscreen"
      class="c-card__fullscreen-toggle"
      :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
      :title="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
      @click="onFullscreen"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path :d="isFullscreen ? mdiFullscreenExit : mdiFullscreen" fill="currentColor" />
      </svg>
    </button>
    <slot />
  </article>
</template>

<script setup lang="ts">
import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
import { onMounted, onBeforeUnmount, ref, useHost } from 'vue';

defineProps({
  fullscreen: { type: Boolean, default: false },
});

const isFullscreen = ref(false);
const host = useHost();

// `fullscreenchange` fires reliably on `document` — listening on the
// element itself is spec-y but inconsistent across browsers, so go
// through document and check `document.fullscreenElement === host`.
const handleFullscreenChange = () => {
  isFullscreen.value = document.fullscreenElement === host;
};

const onFullscreen = async (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (host) {
      // requestFullscreen returns a Promise that rejects if the API call
      // is denied (permissions policy, lack of user activation, etc.).
      // Swallowed rejections were why the button felt like a no-op.
      await host.requestFullscreen();
    }
  } catch (err) {
    console.warn('[c-card] fullscreen toggle failed:', err);
  }
};

const enterFullscreen = async () => {
  if (!host || document.fullscreenElement) return;
  try {
    await host.requestFullscreen();
  } catch (err) {
    console.warn('[c-card] enterFullscreen failed:', err);
  }
};

const exitFullscreen = async () => {
  if (!document.fullscreenElement) return;
  try {
    await document.exitFullscreen();
  } catch (err) {
    console.warn('[c-card] exitFullscreen failed:', err);
  }
};

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});

defineExpose({ enterFullscreen, exitFullscreen });
</script>

<style>
/* Ported from packages/csc-ui/src/components/c-card/c-card.scss.
 * `--c-card-gap` (vertical spacing between sections and block padding)
 * and `--c-card-background-color` are the public override variables.
 * Border-radius and box-shadow are part of the design, not overridable. */

:host {
  --_c-card-gap: var(--c-card-gap, clamp(1rem, 2vw, 1.5rem));
  --_c-card-background-color: var(--c-card-background-color, var(--c-white));

  display: flex;
  border-radius: 6px;
  box-shadow: rgba(0, 0, 0, 0.15) 0 10px 20px,
    rgba(0, 0, 0, 0.2) 0 5px 5px;
  position: relative;
  background-color: var(--_c-card-background-color);
  overflow: hidden;
}

/* The inner <article> stacks card-title / card-content / card-actions
 * vertically with `gap` between them, and adds top/bottom padding equal
 * to `--_c-card-gap`. Horizontal padding lives on the children
 * (c-card-title's padding-inline and c-card-content's horizontal
 * padding) so they can each control their own alignment relative to the
 * card edge. */
.c-card__article {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--_c-card-gap);
  max-width: 100%;
  padding-block: var(--_c-card-gap);
}

/* The original Stencil c-card uses <c-icon-button text> for this — a
 * 40px circular button with primary text colour, transparent default
 * background, and primary-100 hover background. Inlined here to avoid
 * pulling in the full c-icon-button (not part of v0). */
.c-card__fullscreen-toggle {
  position: absolute;
  top: calc(var(--_c-card-gap) - 8px);
  right: calc(var(--_c-card-gap) - 8px);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  color: var(--c-primary-600);
  cursor: pointer;
  transition: background-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1),
    color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.c-card__fullscreen-toggle:hover {
  background-color: var(--c-primary-100);
}

.c-card__fullscreen-toggle:focus {
  outline: none;
}

.c-card__fullscreen-toggle:focus-visible {
  outline: 2px solid var(--c-primary-600);
  outline-offset: 2px;
}

:host(:fullscreen) {
  --c-icon-button-text-background-color: var(--c-white);
  border-radius: 0;
  height: 100%;
  width: 100%;
  overflow: auto;
}
</style>
