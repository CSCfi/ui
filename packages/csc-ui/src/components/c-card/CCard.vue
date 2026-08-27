<template>
  <article :class="ui.root()" part="root">
    <button
      v-if="fullscreen"
      :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
      :class="ui.fullscreenToggle()"
      :title="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
      part="fullscreen-toggle"
      @click="onFullscreen"
    >
      <svg aria-hidden="true" height="24" viewBox="0 0 24 24" width="24">
        <path
          :d="isFullscreen ? mdiFullscreenExit : mdiFullscreen"
          fill="currentColor"
        />
      </svg>
    </button>

    <slot />
  </article>
</template>

<script setup lang="ts">
/**
 * @slot default - Card components
 *
 * @csspart root - The card's visible surface, carries the background, border, radius, shadow and section spacing
 * @csspart fullscreen-toggle - The circular fullscreen toggle button shown when the fullscreen prop is set
 *
 * @seeded from csc-ui — verify
 *
 * @subcomponents c-card-title, c-card-content, c-card-actions
 */
import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed, onBeforeUnmount, onMounted, ref, useHost } from 'vue';

/**
 * Styling lives in this `tailwind-variants` config. The inner
 * `<article>` (`root` part) is the card's visible box: it stacks the card
 * sections vertically with gap + block padding AND carries the card's visual
 * surface — background, hairline border and border-radius here (no overflow
 * clipping: popovers, tooltips and focus rings may extend past the box), plus the drop shadow as plain CSS in the escape-hatch <style>
 * (arbitrary `shadow-[...]` values don't emit reliably in this setup). All of it
 * lives on the part (not `:host`) so consumers can restyle the whole box through
 * `c-card::part(root) { … }`; the host is no longer the styled
 * surface. The `fullscreen-toggle` is the 40px circular button, anchored to
 * `root` (`relative`).
 *
 * The old `--c-card-background-color` / `--c-card-gap` public override vars are
 * dropped; the background/border are semantic tokens and the spacing contract
 * lives in two private host vars (see the escape-hatch <style>) the slotted
 * child sections (c-card-title / c-card-content / c-card-actions) read across
 * their shadow boundaries: `--_c-card-gap` (block padding + section gap,
 * `clamp(1rem,2vw,1.5rem)` → 24px) and `--_c-card-padding-inline`
 * (`clamp(1rem,2.33vw,1.75rem)` → 28px), matching the 24px/28px card padding
 * of the MyCSC design spec.
 *
 * The host stays a real box only for structure: it must override the global
 * `:host{display:contents}` so it can size to / be sized by `root`, and it is
 * the element `requestFullscreen()` acts on. The positional `:host(:fullscreen)`
 * reset (which targets `root`) cannot be a utility, so it stays in the
 * escape-hatch <style> below.
 */
const card = tv({
  slots: {
    fullscreenToggle:
      'absolute top-[calc(var(--_c-card-gap)-8px)] right-[calc(var(--_c-card-padding-inline)-8px)] z-[1] flex items-center justify-center size-10 p-0 border-0 rounded-full bg-transparent text-primary cursor-pointer transition-colors duration-300 ease-standard hover:bg-primary-subtle-hover focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-primary focus-visible:outline-offset-2',
    root: 'relative flex flex-col flex-1 max-w-full gap-[var(--_c-card-gap)] py-[var(--_c-card-gap)] bg-surface-raised border border-solid border-border rounded-csc-xl',
  },
});

interface CCardProps {
  /**
   * Enable the fullscreen toggle button
   *
   * @seeded from csc-ui — verify
   */
  fullscreen?: boolean;
}

withDefaults(defineProps<CCardProps>(), {
  fullscreen: false,
});

const ui = computed(() => card());

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

/**
 * Enter fullscreen from the outside
 *
 * @seeded from csc-ui — verify
 */
const enterFullscreen = async () => {
  if (!host || document.fullscreenElement) return;
  try {
    await host.requestFullscreen();
  } catch (err) {
    console.warn('[c-card] enterFullscreen failed:', err);
  }
};

/**
 * Exit fullscreen from the outside
 *
 * @seeded from csc-ui — verify
 */
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

<!--
  Escape-hatch CSS: only what utilities and `::part` cannot express.
  The card's visible surface (background / radius / shadow / overflow) now lives
  on the `root` part above so it is consumer-customizable. What remains here:

  - `:host{display:flex}` — a real box that overrides the global
    `:host{display:contents}` (the per-type sheet is adopted after the shared
    one, so it wins). The host is an invisible wrapper sized to `root` in normal
    flow and the element `requestFullscreen()` targets; `root` (flex-1) fills it.
  - `--_c-card-gap` / `--_c-card-padding-inline` — the shared spacing contract
    (responsive design values, not tokens) defined on the host so the slotted
    card sections inherit them across their shadow boundaries.
  - `:host(:fullscreen) [part='root']` — a positional `:host(...)` selector that
    flattens the (now part-owned) radius and lets the filled box scroll when the
    host is blown up to the full screen.
-->
<style>
:host {
  --_c-card-gap: clamp(1rem, 2vw, 1.5rem);
  --_c-card-padding-inline: clamp(1rem, 2.33vw, 1.75rem);

  display: flex;
}

:host(:fullscreen) [part='root'] {
  border-radius: 0;
  overflow: auto;
}

/* The drop shadow is plain CSS, not a `shadow-[...]` utility: arbitrary shadow
   utilities did not paint reliably in this adopted-stylesheet shadow-DOM setup,
   whereas a direct `box-shadow` is. A single soft layer: elevation is expressed
   primarily by the surface + 1px border (per the design spec), not by a heavy
   shadow. Authored on the `root` part (not the host) so it stays
   consumer-overridable via `::part(root)`. */
[part='root'] {
  box-shadow: rgba(0, 0, 0, 0.25) 0 2px 8px;
}
</style>
