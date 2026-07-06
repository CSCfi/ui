<template>
  <nav :class="ui.root()" aria-label="pagination" part="root" role="navigation">
    <div v-if="!hideDetails" :class="ui.details()" part="details">
      <div :class="ui.itemsPerPage()" part="items-per-page">
        {{ itemsPerPageText }}
        <!-- The migrated c-menu is slot-based (ADR-0008): the trigger goes in
             the `trigger` slot and options are c-menu-item children; the
             Stencil-era `items` prop no longer exists. -->
        <c-menu @select="onPageSizeSelect">
          <c-button
            slot="trigger"
            :aria-label="itemsPerPageText"
            :class="ui.itemsPerPageValue()"
            size="small"
            text
          >
            {{ itemsPerPage }}

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
          :aria-label="prevPageText"
          :disabled="(value.currentPage ?? 1) <= 1"
          :size="buttonSize"
          text
          @click="decreasePage"
        >
          <span class="sr-only">{{ prevPageText }}</span>

          <c-icon :path="chevronLeft" />
        </c-icon-button>
      </li>

      <template v-if="!simple">
        <li v-for="(btn, i) in pageButtons" :key="i">
          <c-icon-button
            v-if="btn.type === 'separator'"
            :size="buttonSize"
            aria-disabled="true"
            role="separator"
            tabindex="-1"
            disabled
            text
          >
            <svg height="16" viewBox="0 0 24 24" width="16">
              <path :d="dotsIcon" fill="currentColor" />
            </svg>
          </c-icon-button>

          <c-icon-button
            v-else
            :aria-current="currentPage === btn.number ? 'page' : undefined"
            :size="buttonSize"
            :text="currentPage !== btn.number"
            @click="setPage(btn.number!)"
          >
            <span :aria-label="`page ${btn.number} of ${totalPages}`">
              {{ btn.number }}
            </span>
          </c-icon-button>
        </li>
      </template>

      <li>
        <c-icon-button
          :aria-label="nextPageText"
          :disabled="(value.currentPage ?? 1) >= totalPages"
          :size="buttonSize"
          text
          @click="increasePage"
        >
          <span class="sr-only">{{ nextPageText }}</span>

          <c-icon :path="chevronRight" />
        </c-icon-button>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
export interface CPaginationOptions {
  currentPage?: number;
  endTo?: number;
  itemCount: number;
  itemsPerPage?: number;
  pageSizes?: number[];
  startFrom?: number;
  textOverrides?: Record<string, unknown>;
  totalVisible?: number;
}

export interface CPaginationProps {
  /**
   * Hide details (per page dropdown and the 'x - y of n pages' text)
   *
   * @seeded from csc-ui — verify
   */
  hideDetails?: boolean;
  /**
   * Hide range indicator
   *
   * @seeded from csc-ui — verify
   */
  hideRange?: boolean;
  /**
   * Hide page number buttons
   *
   * @seeded from csc-ui — verify
   */
  simple?: boolean;
  /**
   * Hide details (per page dropdown and the 'x - y of n pages' text)
   *
   * @seeded from csc-ui — verify
   */
  size?: CPaginationSize;
  /**
   * Object containing values that are needed for pagination.
   *
   * Note! startFrom and endTo are assigned automatically to the object based on other values
   *
   * @seeded from csc-ui — verify
   */
  value?: CPaginationOptions;
}

/**
 * Size of the pagination controls. `small` renders the compact page buttons.
 */
export type CPaginationSize = 'default' | 'small';
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
import { computed, onMounted, ref, useHost, watch, watchEffect } from 'vue';

import { emitModelValue } from '../../shared/emitModelValue';

/** Events dispatched by `<c-pagination>`. */
interface CPaginationEvents {
  /**
   * Fired when the user changes the page or the page size, carrying the
   * pagination options object with the recomputed `currentPage`,
   * `itemsPerPage`, `startFrom` and `endTo` fields.
   */
  changeValue: CPaginationOptions;
  /**
   * Native bubbling input event dispatched alongside every value change so a
   * plain `v-model` stays in sync. Carries no detail.
   */
  input: void;
  /**
   * Fired alongside `changeValue` with the same detail — the `v-model`
   * contract.
   */
  'update:value': CPaginationOptions;
}

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004): the
 * old per-component `--_c-pagination-*` override-variable layer is dropped and
 * authored directly against the design tokens. Customization is via `::part()`
 * (ADR-0006); there is no `override` prop.
 *
 * The box lives on the inner `<nav>` (`part="root"`); the host stays
 * `display:contents`.
 *
 * CHILD CONTRACT: the page controls are <c-icon-button>s. Their colour is no
 * longer themed via the removed `--c-icon-button-*` vars — the active page uses
 * the icon-button DEFAULT appearance (primary-600 bg / white text) and every
 * other control uses its `text` appearance (transparent / primary-600 text).
 * The c-menu vars are likewise gone; the menu styles itself. Body text uses the
 * design token directly (`text-[var(--c-text-system)]` — no `text-system`
 * utility exists in this theme).
 *
 * The `:host(.c-pagination--simple|--small) ul` positional host rules map
 * directly to the `simple`/`size` props, so they become tv variants on `pages`.
 */
// Hoisted so the runtime guard below can test membership; the `satisfies`
// keeps the map complete against the public union (ADR-0015).
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
    details:
      'flex flex-auto flex-wrap items-center justify-between text-[var(--c-text-system)]',
    itemsPerPage:
      'flex items-center gap-1 text-sm text-right whitespace-nowrap text-[var(--c-text-system)]',
    itemsPerPageValue: '',
    // 'cursor-pointer border-0 bg-transparent p-0 text-sm text-primary underline decoration-dotted underline-offset-4 [font-family:inherit]',
    pages: 'flex items-center justify-center list-none m-0 p-0 gap-1',
    rangeText: 'text-sm text-right whitespace-nowrap',
    root: 'flex flex-wrap items-center justify-center w-full gap-x-6 gap-y-0',
  },
  variants: {
    // `range` is applied per-call on the rangeText span (original `.range`).
    range: {
      true: { rangeText: 'min-w-[132px]' },
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
  value: () => ({ itemCount: 0 }),
});

// Attributes can deliver any string at runtime; unknown values fall back to
// the default size (ADR-0015).
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

// changeValue/update:value + native `input` (so a plain `v-model` works without
// `v-control`). The value is the same object reference the consumer holds
// (mutated in place with the computed range), so the helper's identity guard
// skips re-writing `host.value` and there is no loop with the value watch.
const dispatchValue = (value: CPaginationEvents['changeValue']) =>
  emitModelValue(host, value);

const currentPage = ref(1);

const itemsPerPage = ref(25);

const totalVisible = ref(7);

const pageSizes = ref<number[]>([5, 25, 50, 100]);

const itemsPerPageText = 'Items per page:';

const prevPageText = 'Previous page';

const nextPageText = 'Next page';

const totalPages = computed(() =>
  Math.ceil(props.value.itemCount / itemsPerPage.value),
);

const buttonSize = computed(() =>
  props.size === 'small' ? 'x-small' : 'small',
);

/*
  We intentionally mutate `props.value` in place here. The value is the same
  object reference the consumer holds, and `emitModelValue`'s identity guard
  depends on that identity to skip re-writing `host.value` (no update loop —
  see the dispatchValue comment above). Cloning would break that contract.
*/
/* eslint-disable vue/no-mutating-props -- write-back-by-identity contract */

// Recompute the visible window + write startFrom/endTo back onto the
// value object, then notify the consumer — mirrors Stencil's _setRange.
const setRange = () => {
  if (!props.value) return;
  currentPage.value = props.value.currentPage || 1;
  itemsPerPage.value = props.value.itemsPerPage || 25;
  totalVisible.value = props.value.totalVisible || 7;
  pageSizes.value = props.value.pageSizes || [5, 25, 50, 100];
  props.value.startFrom =
    currentPage.value * itemsPerPage.value - itemsPerPage.value;
  props.value.endTo = currentPage.value * itemsPerPage.value - 1;
  dispatchValue(props.value);
};

const commit = () => {
  props.value.currentPage = currentPage.value;
  props.value.itemsPerPage = itemsPerPage.value;
  setRange();
};

/* eslint-enable vue/no-mutating-props */

const setPage = (n: number) => {
  currentPage.value = n;
  commit();
};

const increasePage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
    commit();
  }
};

const decreasePage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
    commit();
  }
};

const onPageSizeSelect = (event: Event) => {
  const size = Number((event as CustomEvent<{ value: unknown }>).detail?.value);

  if (!Number.isFinite(size) || size === itemsPerPage.value) return;
  itemsPerPage.value = size;
  currentPage.value = 1;
  commit();
};

const rangeText = computed(() => {
  if (props.hideRange || !props.value.itemCount) return '';

  const end = Math.min(
    currentPage.value * itemsPerPage.value,
    props.value.itemCount,
  );

  const start = (props.value.startFrom ?? 0) + 1;

  return `${start} - ${end} of ${props.value.itemCount} items`;
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
    if (currentPage.value < visible - 2) {
      buttonCount = visible - 1;
    } else if (currentPage.value < total - visible + 4) {
      buttonStart = Math.ceil(currentPage.value - visible / 2) + 1;
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
    (currentPage.value < visible - 1 ||
      currentPage.value < total - visible + 4) &&
    !allVisible
  ) {
    buttons.push({ type: 'separator' });
  }

  if (more) buttons.push({ number: total, type: 'page' });

  return buttons;
});

watch(
  () => props.value,
  (v, old) => {
    if (JSON.stringify(v) === JSON.stringify(old)) return;
    requestAnimationFrame(setRange);
  },
);

onMounted(() => {
  setRange();
  watchEffect(() => {
    if (!host) return;
    host.classList.add('c-pagination');
    host.classList.toggle('c-pagination--small', props.size === 'small');
    host.classList.toggle('c-pagination--simple', props.simple);
  });
});
</script>

<style>
c-menu c-button::part(root) {
  min-width: 0;
}
</style>
