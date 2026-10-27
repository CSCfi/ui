<template>
  <nav
    :aria-label="t.pagination"
    v-bind="navAttributes"
    :class="ui.root()"
    part="root"
  >
    <div v-if="!hideDetails" :class="ui.details()" part="details">
      <div :class="ui.itemsPerPage()" part="items-per-page">
        {{ t.pageSize }}
        <!-- The migrated c-menu is slot-based: the trigger goes in
             the `trigger` slot and options are c-menu-item children; the
             Stencil-era `items` prop no longer exists. -->
        <c-menu @select="onPageSizeSelect">
          <!-- Named with the current size: the label alone hid it. -->
          <c-button
            slot="trigger"
            :aria-label="`${t.pageSize} ${pageSize}`"
            :class="ui.itemsPerPageValue()"
            size="small"
            text
          >
            {{ pageSize }}

            <c-icon :path="mdiChevronDown" />
          </c-button>

          <c-menu-item
            v-for="sizeOption in pageSizes"
            :key="sizeOption"
            :value="String(sizeOption)"
          >
            {{ sizeOption }}
          </c-menu-item>
        </c-menu>
      </div>

      <span :class="ui.rangeText({ range: !simple })">{{ rangeText }}</span>
    </div>

    <ul v-if="value.itemCount" :class="ui.pages()" part="pages">
      <li>
        <c-icon-button
          :aria-label="t.previousPage"
          :disabled="page <= 1"
          :size="buttonSize"
          text
          @click="decreasePage"
        >
          <span class="sr-only">{{ t.previousPage }}</span>

          <c-icon :path="chevronLeft" />
        </c-icon-button>
      </li>

      <template v-if="!simple">
        <li v-for="(btn, i) in pageButtons" :key="i">
          <!-- The ellipsis between page runs is decoration: hidden from
               assistive technology and out of the tab order. -->
          <c-icon-button
            v-if="btn.type === 'separator'"
            :size="buttonSize"
            aria-hidden="true"
            disabled
            text
          >
            <svg height="16" viewBox="0 0 24 24" width="16">
              <path :d="dotsIcon" fill="currentColor" />
            </svg>
          </c-icon-button>

          <!-- The name is the button's: an aria-label on a span is ignored. -->
          <c-icon-button
            v-else
            :aria-current="page === btn.number ? 'page' : undefined"
            :aria-label="t.page(btn.number!, totalPages)"
            :size="buttonSize"
            :text="page !== btn.number"
            @click="setPage(btn.number!)"
          >
            {{ btn.number }}
          </c-icon-button>
        </li>
      </template>

      <li>
        <c-icon-button
          :aria-label="t.nextPage"
          :disabled="page >= totalPages"
          :size="buttonSize"
          text
          @click="increasePage"
        >
          <span class="sr-only">{{ t.nextPage }}</span>

          <c-icon :path="chevronRight" />
        </c-icon-button>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
/**
 * The value of `c-pagination`. Set `itemCount`, and `page` and `pageSize`
 * where the defaults do not fit; each change emits a new object with the
 * picked `page` and `pageSize` and the `startFrom` / `endTo` range of the
 * page's items.
 */
export interface CPaginationOptions {
  /** Index of the page's last item, from 0; set on the value it emits. */
  endTo?: number;

  /** Number of items to page through. */
  itemCount: number;

  /** The current page, from 1. Default 1. */
  page?: number;

  /** Items on a page. Default 25. */
  pageSize?: number;

  /** The page sizes the page-size menu offers. Default `[5, 25, 50, 100]`. */
  pageSizes?: number[];

  /** Index of the page's first item, from 0; set on the value it emits. */
  startFrom?: number;

  /** Most page buttons shown at once. Default 7. */
  totalVisible?: number;
}

/**
 * Size of the pagination controls. `small` renders the compact page buttons.
 */
export type CPaginationSize = 'default' | 'small';

/**
 * UI texts of `c-pagination`, shallow-merged over the English defaults.
 * Static labels are strings; interpolated ones are functions.
 */
export interface CPaginationTexts {
  /** Accessible name of the next-page button. */
  nextPage?: string;

  /** Accessible name of a page button; receives the page and the page count. */
  page?: (page: number, pageCount: number) => string;

  /** Label of the page-size menu. */
  pageSize?: string;

  /** Accessible name of the navigation landmark. */
  pagination?: string;

  /** Accessible name of the previous-page button. */
  previousPage?: string;

  /**
   * The range of items shown; receives the first and the last item, from 1,
   * and the item count.
   */
  range?: (start: number, end: number, count: number) => string;
}

interface CPaginationProps {
  /**
   * Hide the details row: the page-size menu and the "x - y of n items" text
   */
  hideDetails?: boolean;

  /**
   * Hide the range text ("11 - 20 of 96 items"), keeping the page-size menu.
   */
  hideRange?: boolean;

  /**
   * Drop the page buttons and move previous and next to the bar's end; the
   * range text is then the only sign of position.
   */
  simple?: boolean;

  /** Size of the controls: `small` renders the compact page buttons. */
  size?: CPaginationSize;

  /**
   * UI text overrides (i18n), merged over the English defaults. Objects have
   * no attribute form — bind as a DOM property
   *
   * @defaultable {}
   */
  texts?: CPaginationTexts;

  /**
   * The item count and the current page and page size; see
   * `CPaginationOptions`. Bind it with `v-model`, or set it and listen to
   * `change`.
   */
  value?: CPaginationOptions;
}
</script>

<script setup lang="ts">
/**
 * @csspart root - The `<nav>` element wrapping the whole pagination bar
 * @csspart details - The details area holding the items-per-page selector and range text
 * @csspart items-per-page - The items-per-page row (label text and page-size menu)
 * @csspart pages - The `<ul>` list of page buttons and the prev/next controls
 */
import {
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiDotsHorizontal,
} from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed, ref, useAttrs, useHost, watch } from 'vue';

import { useAppDefault } from '../../shared/appDefaults';
import { emitModelChange } from '../../shared/valueEvents';

/** Events dispatched by `<c-pagination>`. */
interface CPaginationEvents {
  /**
   * Fired when the user picks a page or a page size, carrying a new value
   * with the picked `page` and `pageSize` and the page's `startFrom` and
   * `endTo`.
   */
  change: CPaginationOptions;

  /**
   * Native bubbling input event dispatched alongside every value change so a
   * plain `v-model` stays in sync. Carries no detail.
   */
  input: void;

  /**
   * Fired alongside `change` with the same detail — the `v-model` contract.
   */
  'update:value': CPaginationOptions;
}

/**
 * Styling lives entirely in this `tailwind-variants` config: the
 * old per-component `--_c-pagination-*` override-variable layer is dropped and
 * authored directly against the design tokens. Customization is via `::part()`;
 * there is no `override` prop.
 *
 * The box lives on the inner `<nav>` (`part="root"`); the host stays
 * `display:contents`.
 *
 * CHILD CONTRACT: the page controls are <c-icon-button>s. Their colour is no
 * longer themed via the removed `--c-icon-button-*` vars — the active page uses
 * the icon-button DEFAULT appearance (primary-600 bg / white text) and every
 * other control uses its `text` appearance (transparent / primary-600 text).
 * The c-menu vars are likewise gone; the menu styles itself. Its text is the
 * `on-surface-muted` role, which themes in dark mode.
 *
 * The `:host(.c-pagination--simple|--small) ul` positional host rules map
 * directly to the `simple`/`size` props, so they become tv variants on `pages`.
 */
// Hoisted so the runtime guard below can test membership; the `satisfies`
// keeps the map complete against the public union.
const sizeVariants = {
  default: {},
  small: { pages: 'gap-0.5' },
} satisfies Record<CPaginationSize, object>;

const pagination = tv({
  defaultVariants: {
    range: false,
    simple: false,
    size: 'default',
  },
  slots: {
    // Items-per-page and the range: side by side with the range at the right
    // edge while both fit, else the range on its own row — where
    // `justify-between` puts a lone item at the start, flush under the
    // items-per-page control.
    details:
      'flex flex-auto flex-wrap items-center justify-between gap-x-6 gap-y-1 text-on-surface-muted',
    itemsPerPage:
      'flex items-center gap-1 text-right text-sm whitespace-nowrap text-on-surface-muted',
    itemsPerPageValue: '',
    // 'cursor-pointer border-0 bg-transparent p-0 text-sm text-primary underline decoration-dotted underline-offset-4 [font-family:inherit]',
    pages: 'm-0 flex list-none items-center justify-center gap-1 p-0',
    // No minimum width or right-aligned text on the range: a fixed box with
    // text pushed right indented the range when it wrapped to its own row.
    rangeText: 'text-sm whitespace-nowrap',
    root: 'flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-1',
  },
  variants: {
    // `range` is applied per-call on the rangeText span (original `.range`);
    // it no longer reserves a minimum width.
    range: {
      true: { rangeText: '' },
    },
    simple: {
      true: { pages: 'flex-1 justify-end' },
    },
    size: sizeVariants,
  },
});

const props = withDefaults(defineProps<CPaginationProps>(), {
  hideDetails: false,
  hideRange: false,
  simple: false,
  size: 'default',
  texts: undefined,
  value: () => ({ itemCount: 0 }),
});

// Attributes can deliver any string at runtime; unknown values fall back to
// the default size.
const ui = computed(() =>
  pagination({
    simple: props.simple,
    size: props.size in sizeVariants ? props.size : 'default',
  }),
);

const chevronLeft = mdiChevronLeft;

const chevronRight = mdiChevronRight;

const dotsIcon = mdiDotsHorizontal;

const host = useHost();

// The element's own attributes stay on it: its classes would also land on the
// <nav> (as the 3.x `c-pagination--small` / `--simple` classes once did) and
// match the nav's own utilities. A host `aria-label` still names the nav.
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const navAttributes = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([name]) => name.startsWith('aria-')),
  ),
);

// Defaultable props resolve host attribute → own value → app default →
// built-in (see src/shared/appDefaults.ts).
const appDefault = useAppDefault('c-pagination', props);

const DEFAULT_TEXTS: Required<CPaginationTexts> = {
  nextPage: 'Next page',
  page: (page, pageCount) => `page ${page} of ${pageCount}`,
  pageSize: 'Items per page:',
  pagination: 'Pagination',
  previousPage: 'Previous page',
  range: (start, end, count) => `${start} - ${end} of ${count} items`,
};

const t = appDefault('texts', DEFAULT_TEXTS);

const page = ref(1);

const pageSize = ref(25);

const totalVisible = ref(7);

const pageSizes = ref<number[]>([5, 25, 50, 100]);

// The value is the consumer's: read it, never write into it. A value set
// from outside re-syncs the controls and emits nothing (CONTEXT.md "Value
// control").
const sync = () => {
  page.value = props.value?.page || 1;
  pageSize.value = props.value?.pageSize || 25;
  totalVisible.value = props.value?.totalVisible || 7;
  pageSizes.value = props.value?.pageSizes || [5, 25, 50, 100];
};

sync();
watch(() => props.value, sync, { deep: true });

const totalPages = computed(() =>
  Math.ceil((props.value?.itemCount ?? 0) / pageSize.value),
);

const buttonSize = computed(() =>
  props.size === 'small' ? 'x-small' : 'small',
);

// Each page or page-size pick is its own commit: a new value object, with
// the page's item range.
const commit = () => {
  const next: CPaginationEvents['change'] = {
    ...props.value,
    // The last page ends at the last item, not a full page further.
    endTo:
      Math.min(page.value * pageSize.value, props.value?.itemCount ?? 0) - 1,
    page: page.value,
    pageSize: pageSize.value,
    startFrom: (page.value - 1) * pageSize.value,
  };

  emitModelChange(host, next);
};

const setPage = (n: number) => {
  if (n === page.value) return;
  page.value = n;
  commit();
};

const increasePage = () => {
  if (page.value < totalPages.value) setPage(page.value + 1);
};

const decreasePage = () => {
  if (page.value > 1) setPage(page.value - 1);
};

// The page-size menu's `select` is this component's business: it ends here
// instead of reaching the page as a stray `select` from the pagination.
const onPageSizeSelect = (event: Event) => {
  event.stopPropagation();

  const size = Number((event as CustomEvent<{ value: unknown }>).detail?.value);

  if (!Number.isFinite(size) || size === pageSize.value) return;
  pageSize.value = size;
  page.value = 1;
  commit();
};

const rangeText = computed(() => {
  const count = props.value?.itemCount ?? 0;

  if (props.hideRange || !count) return '';

  const end = Math.min(page.value * pageSize.value, count);

  return t.value.range((page.value - 1) * pageSize.value + 1, end, count);
});

// Build the page-button window (with leading/trailing separators) the
// same way the Stencil component does.
interface Btn {
  number?: number;
  type: 'page' | 'separator';
}

const pageButtons = computed<Btn[]>(() => {
  const total = totalPages.value;

  const visible = totalVisible.value;

  const buttons: Btn[] = [];

  let buttonStart = 0;

  let buttonCount = total + 1;

  const more = total > visible;

  if (more) {
    if (page.value < visible - 2) {
      buttonCount = visible - 1;
    } else if (page.value < total - visible + 4) {
      buttonStart = Math.ceil(page.value - visible / 2) + 1;
      buttonCount = visible - 3;
    } else {
      buttonStart = total - visible + 2;
      buttonCount = visible - 2;
    }
  }

  if (buttonStart > 1) {
    buttons.push({ number: 1, type: 'page' });
    buttons.push({ type: 'separator' });
  }

  for (let index = 1; index < buttonCount; index++) {
    buttons.push({ number: buttonStart + index, type: 'page' });
  }

  const allVisible = total <= visible;

  if (
    (page.value < visible - 1 || page.value < total - visible + 4) &&
    !allVisible
  ) {
    buttons.push({ type: 'separator' });
  }

  if (more) buttons.push({ number: total, type: 'page' });

  return buttons;
});
</script>

<style>
c-menu c-button::part(root) {
  min-width: 0;
}
</style>
