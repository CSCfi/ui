<template>
  <nav role="navigation" aria-label="pagination">
    <div v-if="!hideDetails" class="c-pagination__details">
      <div class="c-pagination__items-per-page">
        {{ itemsPerPageText }}
        <c-menu :items="pageSizeItems" @click="onMenuClick">
          <div><span class="items-per-page">{{ itemsPerPage }}</span></div>
        </c-menu>
      </div>
      <span :class="{ range: !simple }">{{ rangeText }}</span>
    </div>

    <ul v-if="value.itemCount">
      <li>
        <c-icon-button
          :aria-label="prevPageText"
          :disabled="(value.currentPage ?? 1) <= 1"
          :size="buttonSize"
          text
          @click="decreasePage"
        >
          <span class="visuallyhidden">{{ prevPageText }}</span>
          <c-icon :path="chevronLeft" />
        </c-icon-button>
      </li>

      <template v-if="!simple">
        <li v-for="(btn, i) in pageButtons" :key="i">
          <c-icon-button
            v-if="btn.type === 'separator'"
            aria-disabled="true"
            :size="buttonSize"
            tabindex="-1"
            role="separator"
            disabled
            text
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path :d="dotsIcon" fill="currentColor" />
            </svg>
          </c-icon-button>
          <c-icon-button
            v-else
            :text="currentPage !== btn.number"
            :size="buttonSize"
            :aria-current="currentPage === btn.number ? 'page' : undefined"
            @click="setPage(btn.number!)"
          >
            <span :aria-label="`page ${btn.number} of ${totalPages}`">{{ btn.number }}</span>
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
          <span class="visuallyhidden">{{ nextPageText }}</span>
          <c-icon :path="chevronRight" />
        </c-icon-button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { mdiChevronLeft, mdiChevronRight, mdiDotsHorizontal } from '@mdi/js';
import { computed, onMounted, ref, useHost, watch, watchEffect } from 'vue';

interface PaginationOptions {
  itemCount: number;
  currentPage?: number;
  totalVisible?: number;
  itemsPerPage?: number;
  startFrom?: number;
  endTo?: number;
  pageSizes?: number[];
  textOverrides?: Record<string, unknown>;
}

const props = defineProps({
  value: { type: Object as () => PaginationOptions, default: () => ({ itemCount: 0 }) },
  hideDetails: { type: Boolean, default: false },
  simple: { type: Boolean, default: false },
  size: { type: String, default: 'default' },
  hideRange: { type: Boolean, default: false },
});

const chevronLeft = mdiChevronLeft;
const chevronRight = mdiChevronRight;
const dotsIcon = mdiDotsHorizontal;

const host = useHost();
const dispatchValue = (value: unknown) => {
  host?.dispatchEvent(new CustomEvent('changeValue', { detail: value }));
  host?.dispatchEvent(new CustomEvent('update:value', { detail: value }));
};

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

const pageSizeItems = computed(() =>
  pageSizes.value.map((i) => ({
    name: i.toString(),
    action: () => {
      itemsPerPage.value = i;
      currentPage.value = 1;
      commit();
    },
  })),
);

const onMenuClick = (event: Event) => event.stopPropagation();

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
  type: 'page' | 'separator';
  number?: number;
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
    buttons.push({ type: 'page', number: 1 });
    buttons.push({ type: 'separator' });
  }
  for (let index = 1; index < buttonCount; index++) {
    buttons.push({ type: 'page', number: buttonStart + index });
  }
  const allVisible = total <= visible;
  if (
    (currentPage.value < visible - 1 ||
      currentPage.value < total - visible + 4) &&
    !allVisible
  ) {
    buttons.push({ type: 'separator' });
  }
  if (more) buttons.push({ type: 'page', number: total });

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
:host {
  --_c-pagination-button-active-background-color: var(--c-pagination-button-active-background-color, var(--c-primary-600));
  --_c-pagination-button-active-background-color-hover: var(--c-pagination-button-active-background-color-hover, var(--c-primary-400));
  --_c-pagination-button-active-text-color: var(--c-pagination-button-active-text-color, var(--c-white));
  --_c-pagination-button-background-color: var(--c-pagination-button-background-color, var(--c-transparent));
  --_c-pagination-button-background-color-hover: var(--c-pagination-button-background-color-hover, rgba(var(--c-primary-rgb), 0.1));
  --_c-pagination-button-text-color: var(--c-pagination-button-text-color, var(--_c-pagination-button-active-background-color));
  --_c-pagination-text-color: var(--c-pagination-text-color, var(--c-text-system));
  --_c-pagination-menu-text-color: var(--c-pagination-menu-text-color, var(--c-text-system));
  --_c-pagination-menu-text-color-active: var(--c-pagination-menu-text-color-active, var(--c-primary-600));
  --_c-pagination-menu-background-color-hover: var(--c-pagination-menu-background-color-hover, var(--c-primary-200));
  --_c-pagination-menu-outline-color: var(--c-pagination-menu-outline-color, var(--c-primary-600));

  display: block;
}

c-icon-button {
  --c-icon-button-background-color: var(--_c-pagination-button-active-background-color);
  --c-icon-button-background-color-hover: var(--_c-pagination-button-active-background-color-hover);
  --c-icon-button-text-color: var(--_c-pagination-button-active-text-color);
  --c-icon-button-text-background-color: var(--_c-pagination-button-background-color);
  --c-icon-button-text-background-color-hover: var(--_c-pagination-button-background-color-hover);
  --c-icon-button-text-text-color: var(--_c-pagination-button-text-color);
}

c-menu {
  --c-menu-text-color: var(--_c-pagination-menu-text-color);
  --c-menu-text-color-active: var(--_c-pagination-menu-text-color-active);
  --c-menu-background-color-hover: var(--_c-pagination-menu-background-color-hover);
  --c-menu-outline-color: var(--_c-pagination-menu-outline-color);
}

span {
  font-size: 14px;
  text-align: right;
  white-space: nowrap;
}

.range {
  min-width: 132px;
}

nav {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0 24px;
  justify-content: center;
  width: 100%;
}

ul {
  align-items: center;
  display: flex;
  gap: 4px;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.c-pagination__details {
  color: var(--_c-pagination-text-color);
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  flex: auto;
  justify-content: space-between;
}

.c-pagination__items-per-page {
  color: var(--_c-pagination-text-color);
  font-size: 14px;
  text-align: right;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}

:host(.c-pagination--simple) ul {
  flex: 1;
  justify-content: flex-end;
}

:host(.c-pagination--small) ul {
  gap: 2px;
}

.visuallyhidden {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
</style>
