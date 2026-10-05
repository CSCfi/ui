<template>
  <li ref="rootRef" :class="ui.root()" part="root">
    <svg
      v-if="!first && !folded"
      :class="ui.separator()"
      aria-hidden="true"
      part="separator"
      viewBox="0 0 24 24"
    >
      <path :d="mdiChevronRight" />
    </svg>

    <!-- One `<a>` whatever the crumb's state: without `href` it is plain,
         unfocusable text, so the current crumb and a level with no page need
         no element swap (a swap would recreate the slots below). -->
    <a
      :aria-current="current ? 'page' : undefined"
      :aria-label="ariaLabel()"
      :class="ui.content()"
      :href="interactive ? href : undefined"
      :target="interactive && target ? target : undefined"
      :title="truncated ? labelText : undefined"
      part="content"
    >
      <span v-show="hasIcon" :class="ui.icon()">
        <slot name="icon" />
      </span>

      <span
        v-show="hasLabel"
        ref="labelRef"
        :class="ui.label()"
        :style="capShift ? { top: `${capShift}px` } : undefined"
        part="label"
      >
        <!-- Zero-size probe resting on the label's baseline. -->
        <span ref="baselineRef" :class="ui.baseline()" aria-hidden="true" />
        <slot />
      </span>
    </a>
  </li>
</template>

<script lang="ts">
export interface CBreadcrumbItemProps {
  /**
   * URL of the page the crumb leads to. Ignored on the current crumb (the
   * last one); a crumb without it names a level that has no page and renders
   * as plain text
   *
   * @freeform any URL
   */
  href?: string;
  /**
   * Browsing context the link opens in; the same tab when unset
   *
   * @freeform any browsing-context name (e.g. _blank, _self)
   */
  target?: string;
}
</script>

<script setup lang="ts">
/**
 * @slot default - The crumb's label
 * @slot icon - An icon shown before the label (e.g. a `c-icon`); give an icon-only crumb an `aria-label`
 *
 * @csspart root - The list item holding the separator and the crumb; in the fold panel, the row
 * @csspart separator - The chevron before every crumb but the first, hidden in the fold panel
 * @csspart content - The link (or, without `href` and on the current crumb, the text) holding the icon and label
 * @csspart label - The label text, truncated with an ellipsis when the breadcrumb runs out of room
 *
 * @cssstate current - Present on the current crumb (the last one)
 * @cssstate folded - Present while the crumb is folded into the breadcrumb's fold panel
 */
import { mdiChevronRight } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useHost,
  useTemplateRef,
  watch,
} from 'vue';

import { useHasSlot } from '../../shared/useHasSlot';
import { useHostStates } from '../../shared/useHostStates';

/**
 * Styling lives in this `tailwind-variants` config; `::part()` is the
 * customization surface. A crumb in the row is a small text button
 * (c-button's `size="small" text` look); folded into the breadcrumb's fold
 * panel the same element is a menu-like row. The first and current crumbs'
 * widths are capped by INTERNAL custom properties the breadcrumb sets when it
 * truncates them (not consumer API).
 *
 * The separator is an SVG, so it centres by its box like the icon; the label
 * is nudged into line with them by `capShift` (below), measured from the font
 * the page actually renders.
 */
const breadcrumbItem = tv({
  compoundVariants: [
    {
      class: {
        content:
          'text-primary cursor-pointer hover:bg-primary/15 focus-visible:outline-primary',
      },
      folded: false,
      interactive: true,
    },
    {
      class: {
        content:
          'cursor-pointer hover:bg-primary-subtle hover:text-primary focus-visible:outline-primary',
      },
      folded: true,
      interactive: true,
    },
    // After the `first` variant: a lone crumb is first AND current, and it is
    // the current crumb's cap the breadcrumb sets for it.
    {
      class: { root: 'max-w-[var(--_c-breadcrumb-current-max,none)]' },
      current: true,
    },
  ],
  defaultVariants: {
    current: false,
    first: false,
    folded: false,
    interactive: false,
  },
  slots: {
    content:
      'flex items-center gap-2 min-w-0 m-0 whitespace-nowrap no-underline text-on-surface [font-family:var(--c-font-family)] transition-colors duration-300 ease-in-out outline-none focus-visible:outline-2 focus-visible:outline-solid',
    icon: 'inline-flex items-center shrink-0 fill-current',
    baseline: 'inline-block w-0 h-0',
    label: 'relative block min-w-0 truncate',
    root: 'flex items-center min-w-0',
    separator: 'shrink-0 size-4 fill-current text-on-surface-muted',
  },
  variants: {
    current: { true: '' },
    first: {
      true: { root: 'max-w-[var(--_c-breadcrumb-first-max,none)]' },
    },
    folded: {
      false: {
        content:
          'min-h-7 px-3 rounded-csc-md text-sm font-bold focus-visible:outline-offset-2',
        root: 'shrink-0',
      },
      true: {
        content:
          'w-full min-h-10 px-3 rounded-csc-sm text-sm focus-visible:-outline-offset-2',
        root: 'w-full',
      },
    },
    interactive: { false: { content: 'cursor-default' }, true: '' },
  },
});

const props = withDefaults(defineProps<CBreadcrumbItemProps>(), {
  href: '',
  target: '',
});

// Vue mirrors EVERY host attribute into `$attrs` — the `slot` the breadcrumb
// assigns included — so nothing falls through; only `aria-label` (which
// names an icon-only crumb) is forwarded, to the link. Vue camelizes the key.
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

// Read on every render: `attrs` is not reactive, but a changed host
// attribute re-renders the element.
const ariaLabel = (): string | undefined =>
  (attrs.ariaLabel as string | undefined) || undefined;

const host = useHost();

const setState = useHostStates();

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const labelRef = useTemplateRef<HTMLElement>('labelRef');

const hasIcon = useHasSlot(rootRef, 'icon');

const TAG = 'c-breadcrumb-item';

// ---- place among the sibling crumbs ---------------------------------------

// The current crumb is the last crumb, the first one carries no separator.
// Read from the light DOM, like c-accordion-item's place in its frame, so a
// crumb appended by the consumer moves "current" with no prop to set.
const first = ref(false);

const current = ref(false);

// The breadcrumb folds a crumb by assigning it to its `folded` slot.
const folded = ref(false);

const isCrumb = (el: Element): boolean => el.localName === TAG;

const readPlace = (): void => {
  if (!host) return;

  const parent = host.parentElement;

  const crumbs = parent ? Array.from(parent.children).filter(isCrumb) : [host];

  first.value = crumbs[0] === host;
  current.value = crumbs[crumbs.length - 1] === host;
  folded.value = host.getAttribute('slot') === 'folded';
};

const interactive = computed(() => !!props.href && !current.value);

watch(current, (on) => setState('current', on), { immediate: true });

watch(folded, (on) => setState('folded', on), { immediate: true });

// ---- label: presence, text, truncation ------------------------------------

// The default slot also receives the whitespace between tags, so "has a
// label" means an element or a non-blank text node — an icon-only crumb must
// not reserve the label's gap.
const hasLabel = ref(false);

const labelText = ref('');

const truncated = ref(false);

const labelSlot = (): HTMLSlotElement | null =>
  labelRef.value?.querySelector('slot') ?? null;

const readLabel = (): void => {
  const nodes = labelSlot()?.assignedNodes({ flatten: true }) ?? [];

  hasLabel.value = nodes.some(
    (n) =>
      n.nodeType === Node.ELEMENT_NODE ||
      (n.nodeType === Node.TEXT_NODE && !!n.textContent?.trim()),
  );
  labelText.value = nodes
    .map((n) => n.textContent ?? '')
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
};

const readTruncated = (): void => {
  const label = labelRef.value;

  truncated.value = !!label && label.scrollWidth > label.clientWidth;
};

// ---- optical centring -----------------------------------------------------

// Flex centring puts the label's line box in the middle of the crumb, but
// where the capitals sit inside a line box depends on the font's ascent and
// descent — and the page's font is whatever sans-serif the OS falls back to
// (Helvetica on macOS sets them a pixel high). So it is measured: the baseline
// from a zero-size probe resting on it, the cap height from the font itself,
// and the label moves so the capitals' middle is the line box's, where the
// icon and the chevron are centred. The same in every browser, unlike
// `text-box` trimming, which Firefox lacks.
const baselineRef = useTemplateRef<HTMLElement>('baselineRef');

const capShift = ref(0);

let capCanvas: CanvasRenderingContext2D | null | undefined;

const readCapShift = (): void => {
  const label = labelRef.value;

  const probe = baselineRef.value;

  if (!label || !probe || !label.getClientRects().length) return;

  capCanvas ??= document.createElement('canvas').getContext('2d');

  const style = getComputedStyle(label);

  const lineHeight = parseFloat(style.lineHeight);

  const box = label.getBoundingClientRect();

  if (!capCanvas || !lineHeight || !box.height) return;

  capCanvas.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

  const capHeight = capCanvas.measureText('H').actualBoundingBoxAscent;

  // Rects carry any zoom or transform above the crumb; the line height does
  // not. The shift moves the probe with the box, so reading it is stable.
  const baseline =
    (probe.getBoundingClientRect().top - box.top) / (box.height / lineHeight);

  capShift.value =
    Math.round((lineHeight / 2 - (baseline - capHeight / 2)) * 2) / 2;
};

const onLabelResize = (): void => {
  readTruncated();
  readCapShift();
};

let placeObserver: MutationObserver | null = null;

let ownObserver: MutationObserver | null = null;

let labelResize: null | ResizeObserver = null;

const onLabelSlotChange = (): void => {
  readLabel();
  requestAnimationFrame(readTruncated);
};

onMounted(() => {
  readPlace();
  readLabel();

  const parent = host?.parentElement;

  if (parent) {
    placeObserver = new MutationObserver(readPlace);
    placeObserver.observe(parent, { childList: true });
  }

  if (host) {
    // The assigned slot (folding) and the label's own text.
    ownObserver = new MutationObserver((records) => {
      if (records.some((r) => r.type === 'attributes')) readPlace();

      if (records.some((r) => r.type !== 'attributes')) onLabelSlotChange();
    });
    ownObserver.observe(host, {
      attributeFilter: ['slot'],
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  labelSlot()?.addEventListener('slotchange', onLabelSlotChange);
  document.fonts?.addEventListener('loadingdone', readCapShift);

  if (labelRef.value) {
    labelResize = new ResizeObserver(onLabelResize);
    labelResize.observe(labelRef.value);
  }
});

onBeforeUnmount(() => {
  placeObserver?.disconnect();
  ownObserver?.disconnect();
  labelResize?.disconnect();
  labelSlot()?.removeEventListener('slotchange', onLabelSlotChange);
  document.fonts?.removeEventListener('loadingdone', readCapShift);
});

const ui = computed(() =>
  breadcrumbItem({
    current: current.value,
    first: first.value,
    folded: folded.value,
    interactive: interactive.value,
  }),
);
</script>
