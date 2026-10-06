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
/**
 * @slot header - Custom header slot
 * @slot icon - Icon shown in the header before the heading
 * @slot default - Default slot
 *
 * @csspart root - The outer wrapper of the item: its share of the accordion frame, the lifted outline and wash when expanded, and a 2px outline on expanded items when outlined
 * @csspart header - The toggle button row containing the icon, heading and indicator
 * @csspart indicator - The rotating chevron at the end of the header
 * @csspart content - The padded card around the slotted content inside the collapsing region
 *
 * @seeded from csc-ui — verify
 */
import { mdiChevronRight } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useId,
  useTemplateRef,
} from 'vue';

import { useHasSlot } from '../../shared/useHasSlot';
import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-accordion-item>`. */
interface CAccordionItemEvents {
  /**
   * Fired when the header is toggled, carrying the requested expansion state
   * and the item's `value`; bubbles so the parent `<c-accordion>` can update
   * its model.
   */
  'item-change': { expanded: boolean; value: number | string | undefined };
}

// Styling lives in `tailwind-variants`: no `<style>` block and the
// public `--c-accordion-item-*` override vars are dropped — theming now flows
// through global design tokens, and consumer customization through `::part()`
// (there is no `override` prop).
//
// THE ACCORDION FRAME (CONTEXT.md "Accordion frame", ADR-0058). Collapsed
// items stack flush into one hairline frame: every root carries a `border`
// bar but drops its top edge (`border-t-0`) so the shared edge is one line,
// and only the ends of a run round off (`rounded-csc-t-lg` / `-b-lg`). An
// expanded item lifts out of the frame: its own primary outline on a 5%
// primary wash, 16px squircle corners, a 2px inset accent bar (an inset
// shadow, so nothing shifts) and 8px of margin above and below. The items on
// either side of it close their run's ends — the one after it regains its
// top edge. Where an item sits in the frame (`first`, `last`,
// `afterExpanded`, `beforeExpanded`) is derived below from its light-DOM
// siblings, because `:host()` cannot see them: Chromium matches neither
// `:host(:is([expanded] + *))` nor `:host(:has(+ [expanded]))`.
//
// The header is transparent at rest so the frame reads as one surface, with
// c-button's ghost hover/active washes. The wash takes the root's corners and
// squircle shape, but only the top ones on an expanded item, so it never
// rounds off inside the card. The content is a raised card inside
// the wash: 8px inset, 12px padding, a 25% primary inset hairline. `root`
// deliberately has no `overflow-hidden` (that would clip the header's focus
// outline); clipping lives on the content wrapper + content. The `*:` child
// variant on `icon` reproduces the old `.icon > *` sizing without `::slotted`.
// Motion: the content grid-rows collapse, the chevron rotate and the margin
// lift all transition, and all go instant under reduced motion through the
// shared sheet (ADR-0057).
const accordionItem = tv({
  compoundVariants: [
    {
      class: {
        header: 'cursor-default hover:bg-transparent active:bg-transparent',
      },
      collapsable: false,
      expanded: true,
    },
    // The ends of a collapsed run round off: the frame's first and last item,
    // and the items either side of an expanded one.
    { class: { root: 'rounded-csc-t-lg' }, expanded: false, first: true },
    {
      afterExpanded: true,
      class: { root: 'rounded-csc-t-lg' },
      expanded: false,
    },
    { class: { root: 'rounded-csc-b-lg' }, expanded: false, last: true },
    {
      beforeExpanded: true,
      class: { root: 'rounded-csc-b-lg' },
      expanded: false,
    },
    // An expanded item clears its neighbours by 8px: none above the first,
    // and none between two expanded items (the upper one's margin is the gap).
    { class: { root: 'mt-0' }, expanded: true, first: true },
    { afterExpanded: true, class: { root: 'mt-0' }, expanded: true },
    // `outlined` outlines expanded items only: a collapsed item is part of
    // the frame, and a ring inside its hairline read as a double border.
    {
      class: { root: 'ring-1 ring-primary ring-inset' },
      expanded: true,
      outlined: true,
    },
  ],
  defaultVariants: {
    afterExpanded: false,
    beforeExpanded: false,
    collapsable: false,
    expanded: false,
    first: false,
    hasIcon: false,
    last: false,
    outlined: false,
  },
  slots: {
    content:
      'mx-2 mb-2 min-h-0 overflow-hidden rounded-sm bg-surface-raised p-3 text-on-surface-muted inset-ring inset-ring-primary/25',
    contentWrapper:
      'grid grid-rows-[minmax(0,0fr)] overflow-hidden transition-[grid-template-rows] duration-300 ease-standard',
    header:
      'relative m-0 grid min-h-[46px] w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-x-2 rounded-[inherit] border-0 bg-transparent px-3 text-left text-primary transition-colors duration-200 ease-standard select-none [font:inherit] hover:bg-primary/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-primary/15 supports-corner-shape:[corner-shape:squircle]',
    icon: 'flex h-6 items-center text-2xl text-primary *:flex *:h-6 *:items-center',
    indicator:
      'flex -rotate-90 items-center text-primary transition-transform duration-300 ease-standard',
    root: 'block max-w-full border border-t-0 border-border transition-[margin] duration-300 ease-in-out supports-corner-shape:[corner-shape:squircle]',
    title: 'm-0 text-base leading-none font-medium',
  },
  variants: {
    afterExpanded: {
      true: { root: 'border-t' },
    },
    beforeExpanded: {
      true: '',
    },
    collapsable: {
      true: '',
    },
    expanded: {
      true: {
        contentWrapper: 'grid-rows-[minmax(0,1fr)]',
        header: 'rounded-b-none',
        indicator: 'rotate-90',
        root: 'my-2 rounded-csc-lg border-t border-primary bg-primary/5 inset-shadow-[2px_0_0_0] inset-shadow-primary',
      },
    },
    first: {
      true: { root: 'border-t' },
    },
    hasIcon: {
      true: { header: 'grid-cols-[auto_1fr_auto]' },
    },
    last: {
      true: '',
    },
    outlined: {
      true: '',
    },
  },
});

interface CAccordionItemProps {
  /**
   * Marks the item as collapsable
   *
   * @seeded from csc-ui — verify
   */
  collapsable?: boolean;
  /**
   * Expansion status of the item
   *
   * @seeded from csc-ui — verify
   */
  expanded?: boolean;
  /**
   * Heading of the accordion item
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  heading?: string;
  /**
   * Show an outline around the expanded item
   *
   * @seeded from csc-ui — verify
   */
  outlined?: boolean;
  /**
   * Value of the accordion item
   *
   * @seeded from csc-ui — verify
   */
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

const host = useHost();

const TAG = 'c-accordion-item';

// Where this item sits in the accordion frame. Read from the light DOM: the
// run's ends are the first and last item among the parent's children, and an
// expanded neighbour shows as the `expanded` attribute Vue reflects onto every
// item host. Re-read whenever a sibling's `expanded` flips or the parent's
// children change; nothing here needs `c-accordion`, so a hand-placed run of
// items frames itself the same way.
const first = ref(false);

const last = ref(false);

const afterExpanded = ref(false);

const beforeExpanded = ref(false);

const isItem = (el: Element | null): el is HTMLElement =>
  el?.tagName.toLowerCase() === TAG;

const isExpandedItem = (el: Element | null): boolean =>
  isItem(el) && el.hasAttribute('expanded');

const readSiblings = (): void => {
  if (!host) return;

  const parent = host.parentElement;

  const items = parent
    ? Array.from(parent.children).filter((el) => isItem(el))
    : [host];

  first.value = items[0] === host;
  last.value = items[items.length - 1] === host;
  afterExpanded.value = isExpandedItem(host.previousElementSibling);
  beforeExpanded.value = isExpandedItem(host.nextElementSibling);
};

let siblingObserver: MutationObserver | null = null;

onMounted(() => {
  readSiblings();

  const parent = host?.parentElement;

  if (!parent) return;

  siblingObserver = new MutationObserver((records) => {
    // `subtree` is needed to see a sibling's attribute, but the children that
    // matter are the parent's own.
    if (records.every((r) => r.type === 'childList' && r.target !== parent)) {
      return;
    }

    readSiblings();
  });
  siblingObserver.observe(parent, {
    attributeFilter: ['expanded'],
    attributes: true,
    childList: true,
    subtree: true,
  });
});

onBeforeUnmount(() => {
  siblingObserver?.disconnect();
  siblingObserver = null;
});

const ui = computed(() =>
  accordionItem({
    afterExpanded: afterExpanded.value,
    beforeExpanded: beforeExpanded.value,
    collapsable: props.collapsable,
    expanded: props.expanded,
    first: first.value,
    hasIcon: hasIcon.value,
    last: last.value,
    outlined: props.outlined,
  }),
);

const autoId = useId();

const headerId = `c-accordion-item-header-${autoId}`;

const contentId = `c-accordion-item-content-${autoId}`;

const emit = useHostEmit<CAccordionItemEvents>();

const onToggle = () => {
  if (!props.collapsable && props.expanded) return;
  emit(
    'item-change',
    { expanded: !props.expanded, value: props.value },
    { bubbles: true, composed: true },
  );
};
</script>
