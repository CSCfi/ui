<template>
  <div
    ref="root"
    class="c-accordion-item"
    :class="{
      'c-accordion-item--outlined': outlined,
      'c-accordion-item--expanded': expanded,
    }"
  >
    <button
      :id="headerId"
      type="button"
      class="c-accordion-item__header"
      :class="{
        'c-accordion-item__header--has-icon': hasIcon,
        'c-accordion-item__header--expanded': expanded,
        'c-accordion-item__header--collapsable': collapsable,
      }"
      :aria-expanded="expanded"
      :aria-controls="contentId"
      :aria-disabled="!collapsable && expanded ? 'true' : undefined"
      @click="onToggle"
    >
      <div v-show="hasIcon" class="c-accordion-item__icon" aria-hidden="true">
        <slot name="icon" />
      </div>

      <slot name="header">
        <div class="c-accordion-item__title">{{ heading }}</div>
      </slot>

      <span class="c-accordion-item__indicator" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path :d="chevronPath" fill="currentColor" />
        </svg>
      </span>
    </button>

    <div
      :id="contentId"
      role="region"
      :aria-labelledby="headerId"
      :aria-hidden="!expanded"
      :inert="!expanded"
      class="c-accordion-item__content-wrapper"
      :class="{ 'is-expanded': expanded }"
    >
      <div class="c-accordion-item__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiChevronRight } from '@mdi/js';
import { useTemplateRef, useHost } from 'vue';
import { useHasSlot } from '../../shared/useHasSlot';

const props = defineProps({
  collapsable: { type: Boolean, default: false },
  heading: { type: String, default: '' },
  value: { type: [Number, String], default: undefined },
  expanded: { type: Boolean, default: false },
  outlined: { type: Boolean, default: false },
});

const root = useTemplateRef<HTMLElement>('root');
const hasIcon = useHasSlot(root, 'icon');
const chevronPath = mdiChevronRight;

let __uid = 0;
const uid = ++__uid;
const headerId = `c-accordion-item-header-${uid}`;
const contentId = `c-accordion-item-content-${uid}`;

const host = useHost();

const dispatchItemChange = (expanded: boolean) => {
  if (!host) return;
  host.dispatchEvent(
    new CustomEvent('item-change', {
      bubbles: true,
      composed: true,
      detail: { value: props.value, expanded },
    }),
  );
};

const onToggle = () => {
  if (!props.collapsable && props.expanded) return;
  dispatchItemChange(!props.expanded);
};
</script>

<style>
/* Ported from packages/csc-ui-next/src/components/c-accordion-item with the
 * native <details>/<summary> swapped for <div> + <button>. The
 * grid-template-rows trick collapses/expands a CSS-only animated container
 * — <details> would synchronously toggle display:none on the body and
 * block any transition. Aria semantics (expanded / controls / region /
 * labelledby / hidden + inert) are wired up explicitly to compensate for
 * losing the native disclosure-widget semantics. */

:host {
  --_c-accordion-item-header-background-color: var(
    --c-accordion-item-header-background-color,
    var(--c-primary-200)
  );
  --_c-accordion-item-outline-color: var(
    --c-accordion-item-outline-color,
    var(--c-primary-600)
  );
  --_c-accordion-item-text-color: var(
    --c-accordion-item-text-color,
    var(--c-primary-600)
  );

  --_c-accordion-item-min-height: 46px;
  --_c-accordion-item-border-radius: 6px;
  --_c-accordion-item-padding: 12px;
  --_c-accordion-item-transition-duration: 0.3s;
  --_c-accordion-item-transition-easing: cubic-bezier(0.25, 0.8, 0.5, 1);

  display: block;
  max-width: 100%;
  color: var(--_c-accordion-item-text-color);
}

:host([outlined]) {
  display: block;
  box-shadow: inset 0 0 0 2px var(--_c-accordion-item-header-background-color);
  border-radius: var(--_c-accordion-item-border-radius);
}

/* Note: NO `overflow: hidden` here — that would clip the header's focus
 * outline (which extends 2px outside the header via outline-offset). The
 * collapse animation is masked by `.c-accordion-item__content`'s own
 * `overflow: hidden`, so the outer wrapper can stay overflow:visible. */
.c-accordion-item {
  display: block;
  border-radius: var(--_c-accordion-item-border-radius);
}

.c-accordion-item__header {
  background-color: var(--_c-accordion-item-header-background-color);
  min-height: var(--_c-accordion-item-min-height);
  user-select: none;
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 8px;
  align-items: center;
  padding: 0 var(--_c-accordion-item-padding);
  border-radius: var(--_c-accordion-item-border-radius);
  cursor: pointer;
  text-align: left;
  margin: 0;
  font-family: var(--c-font-family);
  font: inherit;
  color: inherit;
  border: none;
  width: 100%;
  position: relative;
}

.c-accordion-item__header--has-icon {
  grid-template-columns: auto 1fr auto;
}

.c-accordion-item__header--expanded:not(.c-accordion-item__header--collapsable) {
  cursor: default;
}

.c-accordion-item__header:focus-visible {
  outline: 2px solid var(--_c-accordion-item-outline-color);
  outline-offset: 2px;
}

.c-accordion-item__title {
  margin: 0;
  font-weight: 500;
  font-size: 16px;
  line-height: 1;
  color: var(--_c-accordion-item-text-color);
}

.c-accordion-item__icon {
  height: 24px;
  font-size: 24px;
  color: var(--_c-accordion-item-text-color);
  display: flex;
  align-items: center;
}

.c-accordion-item__icon > * {
  height: 24px;
  display: flex;
  align-items: center;
}

.c-accordion-item__indicator {
  display: flex;
  align-items: center;
  color: var(--_c-accordion-item-text-color);
  transform: rotate(-90deg);
  transition: transform var(--_c-accordion-item-transition-duration)
    var(--_c-accordion-item-transition-easing);
}

.c-accordion-item__header--expanded .c-accordion-item__indicator {
  transform: rotate(90deg);
}

/* Collapsed: grid track is 0fr, child has min-height:0 and overflow:hidden
 * so it visually disappears while staying in the document. Expanded: track
 * grows to 1fr. The grid-template-rows property is interpolatable, so the
 * change animates. */
/* `minmax(0, ...)` forces the grid track's min size to 0 — without it, the
 * track would expand to fit the content's min-content size (including
 * padding), so collapsed items would leak ~32px of vertical space.
 * `overflow: hidden` lives here (not on the outer .c-accordion-item) so
 * the body is clipped during the collapse animation, while the header's
 * focus outline (which extends above the header) stays visible. */
.c-accordion-item__content-wrapper {
  display: grid;
  grid-template-rows: minmax(0, 0fr);
  overflow: hidden;
  transition: grid-template-rows var(--_c-accordion-item-transition-duration)
    var(--_c-accordion-item-transition-easing);
}

.c-accordion-item__content-wrapper.is-expanded {
  grid-template-rows: minmax(0, 1fr);
}

.c-accordion-item__content {
  min-height: 0;
  overflow: hidden;
  padding: 16px;
}
</style>
