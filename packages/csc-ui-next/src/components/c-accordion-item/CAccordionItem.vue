<template>
  <div ref="rootRef" :class="ui.root()" part="root">
    <button
      :id="headerId"
      :aria-controls="contentId"
      :aria-disabled="!collapsable && expanded ? 'true' : undefined"
      :aria-expanded="expanded"
      :class="ui.header()"
      part="header"
      type="button"
      @click="onToggle"
    >
      <div v-show="hasIcon" :class="ui.icon()" aria-hidden="true">
        <slot name="icon" />
      </div>

      <slot name="header">
        <div :class="ui.title()">{{ heading }}</div>
      </slot>

      <span :class="ui.indicator()" aria-hidden="true" part="indicator">
        <svg height="24" viewBox="0 0 24 24" width="24">
          <path :d="chevronPath" fill="currentColor" />
        </svg>
      </span>
    </button>

    <div
      :id="contentId"
      :aria-hidden="!expanded"
      :aria-labelledby="headerId"
      :class="ui.contentWrapper()"
      :inert="!expanded"
      role="region"
    >
      <div :class="ui.content()" part="content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiChevronRight } from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed, useHost, useId, useTemplateRef } from 'vue';

import { useHasSlot } from '../../shared/useHasSlot';

// Styling lives in `tailwind-variants` (ADR-0004): no `<style>` block and the
// public `--c-accordion-item-*` override vars are dropped — theming now flows
// through global design tokens, and consumer customization through `::part()`
// (ADR-0006; there is no `override` prop). The grid-template-rows
// collapse, chevron rotate and inset outline are all expressible as utilities,
// so no bespoke CSS remains. `root` deliberately has no `overflow-hidden`
// (that would clip the header's focus outline); clipping lives on the content
// wrapper + content. The `*:` child variant on `icon` reproduces the old
// `.icon > *` sizing without `::slotted`.
const accordionItem = tv({
  compoundVariants: [
    { class: { header: 'cursor-default' }, collapsable: false, expanded: true },
  ],
  defaultVariants: {
    collapsable: false,
    expanded: false,
    hasIcon: false,
    outlined: false,
  },
  slots: {
    content: 'min-h-0 overflow-hidden p-4 text-current',
    contentWrapper:
      'grid grid-rows-[minmax(0,0fr)] overflow-hidden transition-[grid-template-rows] duration-300 ease-standard',
    header:
      'bg-primary-200 min-h-[46px] text-primary-600 select-none grid grid-cols-[1fr_auto] gap-x-2 items-center px-3 rounded-csc-md cursor-pointer text-left m-0 [font:inherit] text-inherit border-0 w-full relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
    icon: 'h-6 text-2xl text-current flex items-center *:h-6 *:flex *:items-center',
    indicator:
      'flex items-center text-current -rotate-90 transition-transform duration-300 ease-standard',
    root: 'block max-w-full rounded-csc-md',
    title: 'm-0 font-medium text-base leading-none text-current',
  },
  variants: {
    collapsable: {
      true: '',
    },
    expanded: {
      true: {
        contentWrapper: 'grid-rows-[minmax(0,1fr)]',
        indicator: 'rotate-90',
      },
    },
    hasIcon: {
      true: { header: 'grid-cols-[auto_1fr_auto]' },
    },
    outlined: {
      true: { root: 'ring-2 ring-inset ring-primary-200' },
    },
  },
});

interface CAccordionItemProps {
  collapsable?: boolean;
  expanded?: boolean;
  heading?: string;
  outlined?: boolean;
  value?: number | string;
}

const props = withDefaults(defineProps<CAccordionItemProps>(), {
  collapsable: false,
  expanded: false,
  heading: '',
  outlined: false,
  value: undefined,
});

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const hasIcon = useHasSlot(rootRef, 'icon');

const chevronPath = mdiChevronRight;

const ui = computed(() =>
  accordionItem({
    collapsable: props.collapsable,
    expanded: props.expanded,
    hasIcon: hasIcon.value,
    outlined: props.outlined,
  }),
);

const autoId = useId();

const headerId = `c-accordion-item-header-${autoId}`;

const contentId = `c-accordion-item-content-${autoId}`;

const host = useHost();

const dispatchItemChange = (expanded: boolean) => {
  if (!host) return;
  host.dispatchEvent(
    new CustomEvent('item-change', {
      bubbles: true,
      composed: true,
      detail: { expanded, value: props.value },
    }),
  );
};

const onToggle = () => {
  if (!props.collapsable && props.expanded) return;
  dispatchItemChange(!props.expanded);
};
</script>
