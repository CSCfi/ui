<template>
  <nav :aria-label="t.breadcrumb" :class="ui.root()" part="root">
    <ol ref="listRef" :class="ui.list()" part="list">
      <!-- The first crumb sits in its own slot so the fold button follows it
           in DOM and Tab order, not just on screen. -->
      <slot name="first" />

      <!-- Out of the row (and out of reach) while nothing is folded, yet
           still laid out, so its width is known before the first fold. -->
      <li ref="foldRef" :class="ui.fold()">
        <svg
          :class="ui.separator()"
          aria-hidden="true"
          part="separator"
          viewBox="0 0 24 24"
        >
          <path :d="mdiChevronRight" />
        </svg>

        <button
          ref="foldButtonRef"
          :aria-controls="PANEL_ID"
          :aria-expanded="isOpen ? 'true' : 'false'"
          :aria-label="t.fold(foldedCount)"
          :class="ui.foldButton()"
          part="fold-button"
          style="anchor-name: --c-breadcrumb-fold"
          type="button"
          @click="toggle"
        >
          <svg :class="ui.foldIcon()" aria-hidden="true" viewBox="0 0 24 24">
            <path :d="mdiDotsHorizontal" />
          </svg>
        </button>

        <!-- Manual popover in the top layer, after the button in the DOM so
             Tab walks from the button into the folded crumbs. -->
        <div
          :id="PANEL_ID"
          ref="panelRef"
          :class="ui.panel()"
          :style="panelStyle"
          part="panel"
          popover="manual"
          @toggle="onToggle"
        >
          <ul ref="panelListRef" :class="ui.panelList()" part="panel-list">
            <slot name="folded" />
          </ul>
        </div>
      </li>

      <slot />
    </ol>
  </nav>
</template>

<script lang="ts">
export interface CBreadcrumbProps {
  /**
   * UI text overrides (i18n), merged over the English defaults. Objects have
   * no attribute form — set it as a property
   *
   * @defaultable {}
   */
  texts?: CBreadcrumbTexts;
}

/**
 * UI texts of `c-breadcrumb`, shallow-merged over the English defaults.
 * Static labels are strings; interpolated ones are functions.
 */
export interface CBreadcrumbTexts {
  /** Accessible name of the breadcrumb navigation. */
  breadcrumb?: string;
  /** Accessible name of the fold button; receives the number of folded crumbs. */
  fold?: (count: number) => string;
}
</script>

<script setup lang="ts">
/**
 * @slot default - The crumbs (`c-breadcrumb-item`), from the top of the hierarchy down to the current page
 * @slot first - Assigned by the breadcrumb to its first crumb; never set `slot` on a crumb
 * @slot folded - Assigned by the breadcrumb to the crumbs it folds into the fold panel; never set `slot` on a crumb
 *
 * @csspart root - The `<nav>` landmark; it takes the full width it is given and folds the crumbs to fit it
 * @csspart list - The one-line list of crumbs
 * @csspart separator - The chevron before the fold button
 * @csspart fold-button - The "…" button standing in for the folded crumbs
 * @csspart panel - The top-layer popover holding the fold panel, anchored below the fold button
 * @csspart panel-list - The fold panel's list surface holding the folded crumbs
 *
 * @subcomponents c-breadcrumb-item
 */
import { mdiChevronRight, mdiDotsHorizontal } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useTemplateRef,
} from 'vue';

import type { CBreadcrumbCrumbWidth } from './fit';

import { useAppDefault } from '../../shared/appDefaults';
import { attachLightDismiss, type Detach } from '../../shared/lightDismiss';
import { applyPeekCap } from '../../shared/peekCap';
import { POSITION_AREA } from '../../shared/positionArea';
import {
  flipChain,
  useFallbackPosition,
} from '../../shared/useFallbackPosition';
import { fitCrumbs } from './fit';

/**
 * Styling lives in this `tailwind-variants` config; `::part()` is the
 * customization surface. The fold button wears the crumbs' small text-button
 * look; the fold panel wears the menu panel's (c-menu's `list`), with its
 * scrollbar hidden and a peek (ADR-0043). The `<style>` block is the escape
 * hatch for the anchor-positioning fallbacks and the panel's fade-in.
 */
const breadcrumb = tv({
  slots: {
    // Shown only while a crumb is folded — `data-folding` is set with the
    // fold itself, so the button is focusable the moment it is needed.
    fold: 'invisible absolute flex shrink-0 items-center data-folding:visible data-folding:static',
    foldButton:
      'm-0 inline-flex min-h-7 cursor-pointer items-center justify-center rounded-csc-md border-0 bg-transparent px-3 [font-family:var(--c-font-family)] text-sm font-bold text-primary transition-colors duration-300 ease-in-out outline-none hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid aria-expanded:bg-primary/15',
    // Icons, not the `…` glyph: a glyph sits on the font's baseline, an SVG
    // centres with the crumbs' icons and chevrons whatever the font.
    foldIcon: 'size-5 shrink-0 fill-current',
    // One line that never wraps: what does not fit folds or truncates. The
    // clip keeps a row of floors from scrolling the page; its margin keeps
    // the crumbs' focus rings.
    list: 'relative m-0 flex min-w-0 list-none flex-nowrap items-center overflow-clip p-0 [overflow-clip-margin:4px]',
    panel:
      'fixed [inset:auto] m-0 overflow-visible border-0 bg-transparent p-0',
    panelList:
      'm-0 max-h-[80vh] w-max max-w-[calc(100vw-8px)] min-w-[180px] scrollbar-hidden list-none overflow-y-auto rounded-csc-md bg-surface-overlay p-1 text-on-surface shadow-[2px_4px_10px_#00000029] outline-none',
    root: 'block w-full min-w-0',
    separator: 'size-4 shrink-0 fill-current text-on-surface-muted',
  },
});

const ui = breadcrumb();

const props = withDefaults(defineProps<CBreadcrumbProps>(), {
  texts: undefined,
});

// Keep host attributes (an `id`, a consumer `aria-label`) off the `<nav>`.
defineOptions({ inheritAttrs: false });

const host = useHost();

// Defaultable props resolve host attribute → own value → app default →
// built-in (see src/shared/appDefaults.ts).
const appDefault = useAppDefault('c-breadcrumb', props);

const DEFAULT_TEXTS: Required<CBreadcrumbTexts> = {
  breadcrumb: 'Breadcrumb',
  fold: (count) => `Show ${count} more`,
};

const t = appDefault('texts', DEFAULT_TEXTS);

/** Tree-scoped: unique within this shadow root, which is all it needs. */
const PANEL_ID = 'fold-panel';

const listRef = useTemplateRef<HTMLElement>('listRef');

const foldRef = useTemplateRef<HTMLElement>('foldRef');

const foldButtonRef = useTemplateRef<HTMLButtonElement>('foldButtonRef');

const panelRef = useTemplateRef<HTMLElement>('panelRef');

const panelListRef = useTemplateRef<HTMLElement>('panelListRef');

const foldedCount = ref(0);

const isOpen = ref(false);

// ---- crumbs ----------------------------------------------------------------

const CRUMB = 'c-breadcrumb-item';

const crumbs = (): HTMLElement[] =>
  host
    ? Array.from(host.children).filter(
        (el): el is HTMLElement => el.localName === CRUMB,
      )
    : [];

const foldedCrumbs = (): HTMLElement[] =>
  crumbs().filter((c) => c.getAttribute('slot') === 'folded');

/** A part inside a crumb's shadow root — its host is `display:contents`, with no box to measure. */
const crumbPart = (crumb: HTMLElement, name: string): HTMLElement | null =>
  crumb.shadowRoot?.querySelector<HTMLElement>(`[part~="${name}"]`) ?? null;

// ---- measuring ---------------------------------------------------------------

/** The narrowest a truncated label gets (a label narrower than this keeps its own width). */
const LABEL_FLOOR = 48;

// Each crumb's widths, measured once in the row with no cap applied; every
// reset of the cache also lifts the caps and unfolds (`remeasure`).
let widths = new WeakMap<HTMLElement, CBreadcrumbCrumbWidth>();

let foldWidth = 0;

/**
 * A box's width in the list's own CSS px. Rects come out scaled by a `zoom` or
 * `transform` above the breadcrumb, while the caps it sets and the room it
 * reads are in layout px; dividing by the list's own ratio keeps them in one
 * unit.
 */
const layoutWidth = (el: Element | null | undefined): number => {
  const list = listRef.value;

  const width = el?.getBoundingClientRect().width ?? 0;

  if (!list?.clientWidth) return width;

  return width / (list.getBoundingClientRect().width / list.clientWidth);
};

const measure = (crumb: HTMLElement): CBreadcrumbCrumbWidth | null => {
  const cached = widths.get(crumb);

  if (cached) return cached;

  // A folded crumb is in the panel, not the row: only a remeasure reads it.
  if (crumb.getAttribute('slot') === 'folded') return null;

  const natural = layoutWidth(crumbPart(crumb, 'root'));

  // Not upgraded or not rendered yet.
  if (!natural) return null;

  const label = layoutWidth(crumbPart(crumb, 'label'));

  const width = {
    floor: natural - label + Math.min(label, LABEL_FLOOR),
    natural,
  };

  widths.set(crumb, width);

  return width;
};

// ---- laying out --------------------------------------------------------------

const setSlot = (crumb: HTMLElement, slot: null | string): void => {
  if (crumb.getAttribute('slot') === slot) return;

  if (slot) crumb.setAttribute('slot', slot);
  else crumb.removeAttribute('slot');
};

const setCap = (name: string, px: null | number): void => {
  if (px === null) listRef.value?.style.removeProperty(name);
  else listRef.value?.style.setProperty(name, `${px}px`);
};

/**
 * Whether focus is on the fold button or a folded crumb. Read in the
 * breadcrumb's own tree: inside an app's shadow root the document's active
 * element is the app's host.
 */
const focusInFold = (): boolean => {
  const active = host
    ? (host.getRootNode() as Document | ShadowRoot).activeElement
    : null;

  if (!host || !active) return false;

  if (active === host) {
    const inner = host.shadowRoot?.activeElement ?? null;

    return (
      !!inner &&
      (inner === foldButtonRef.value || !!panelRef.value?.contains(inner))
    );
  }

  return (
    active.parentElement === host && active.getAttribute('slot') === 'folded'
  );
};

// Focus that was in the fold when a re-layout took the fold away; restored
// once the new layout is in place.
let refocus = false;

const restoreFocus = (): void => {
  if (!refocus) return;

  refocus = false;

  if (foldedCount.value) {
    foldButtonRef.value?.focus();

    return;
  }

  const head = crumbs()[0];

  crumbPart(head, 'content')?.focus();
};

/**
 * Close an open fold panel ahead of a layout that unfolds every crumb, and say
 * whether it did. Chromium 148's renderer crashes when one frame both moves the
 * folded crumbs out of the open panel and takes the fold button it is anchored
 * to out of the row; closed a frame earlier, the panel survives either.
 */
const closeBeforeUnfold = (): boolean => {
  if (!panelRef.value?.matches(':popover-open')) return false;

  refocus ||= focusInFold();
  closePanel(false);

  return true;
};

/** Assign the slots and caps of a layout; the first crumb always leads. */
const layOut = (
  folded: number,
  firstMax: null | number,
  currentMax: null | number,
): void => {
  if (!folded && closeBeforeUnfold()) {
    requestAnimationFrame(refit);

    return;
  }

  crumbs().forEach((crumb, i) =>
    setSlot(crumb, i === 0 ? 'first' : i <= folded ? 'folded' : null),
  );
  setCap('--_c-breadcrumb-first-max', firstMax);
  setCap('--_c-breadcrumb-current-max', currentMax);
  foldRef.value?.toggleAttribute('data-folding', folded > 0);
  foldedCount.value = folded;
  restoreFocus();
};

/** Lay the crumbs out for the current width; `false` while one cannot be measured yet. */
const fit = (): boolean => {
  const list = listRef.value;

  const fold = foldRef.value;

  if (!list || !fold) return false;

  const measured = crumbs().map(measure);

  if (measured.some((m) => !m)) return false;

  foldWidth ||= layoutWidth(fold);

  const result = fitCrumbs(
    measured as CBreadcrumbCrumbWidth[],
    foldWidth,
    list.clientWidth,
  );

  layOut(result.folded, result.firstMax, result.currentMax);

  return true;
};

/** Fit from the cached widths, remeasuring when a crumb has none. */
const refit = (): void => {
  if (!fit()) remeasure();
};

let frame = 0;

let attempts = 0;

/** Frames to wait for crumbs to upgrade and render before giving up until the next resize. */
const MAX_ATTEMPTS = 20;

const scheduleFit = (): void => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    frame = 0;

    if (!fit() && ++attempts < MAX_ATTEMPTS) scheduleFit();
  });
};

/**
 * Forget every width, show every crumb in the row untruncated, and fit again
 * next frame — after the crumbs have re-rendered, before the paint.
 */
const remeasure = (): void => {
  if (closeBeforeUnfold()) {
    requestAnimationFrame(remeasure);

    return;
  }

  widths = new WeakMap();
  foldWidth = 0;
  attempts = 0;
  layOut(0, null, null);
  scheduleFit();
};

// ---- the fold panel -----------------------------------------------------------

const panelStyle = computed(
  () =>
    `position-anchor:--c-breadcrumb-fold;position-area:${POSITION_AREA['bottom-start']};inset:auto;${fallback.style.value}`,
);

// Without native anchor positioning (Firefox 140 ESR) Floating UI places the
// panel; the chain mirrors the `position-try-fallbacks` rule below (ADR-0056).
const fallback = useFallbackPosition({
  fallbacks: flipChain,
  floating: panelRef,
  gap: () => 0,
  placement: () => 'bottom-start',
  reference: () => foldButtonRef.value,
});

let pendingReturnFocus = false;

let detachDismiss: Detach | null = null;

const openPanel = (): void => {
  const p = panelRef.value;

  if (!foldedCount.value || !p || p.matches(':popover-open')) return;

  p.showPopover();
};

function closePanel(returnFocus: boolean): void {
  const p = panelRef.value;

  if (!p?.matches(':popover-open')) return;

  pendingReturnFocus = returnFocus;
  p.hidePopover();
}

const toggle = (): void => {
  if (isOpen.value) closePanel(false);
  else openPanel();
};

// The list hides its scrollbar, so an overflowing fold panel ends on a
// half-visible crumb — the peek (ADR-0043). The rows are the crumbs' shadow
// roots; their hosts have no box.
const applyCap = (): void => {
  const list = panelListRef.value;

  if (!list) return;

  applyPeekCap(list, {
    rows: foldedCrumbs()
      .map((c) => crumbPart(c, 'root'))
      .filter((row): row is HTMLElement => !!row),
  });
};

const onFoldedSlotChange = (): void => {
  if (isOpen.value) requestAnimationFrame(applyCap);
};

// The `toggle` event is the single source of the open state: the panel can
// also close on its own (removed from the document).
const onToggle = (event: Event): void => {
  const nowOpen = (event as ToggleEvent).newState === 'open';

  isOpen.value = nowOpen;

  if (nowOpen) {
    fallback.start();
    detachDismiss?.();
    detachDismiss = attachLightDismiss({
      isInside: (path) =>
        (!!panelRef.value && path.includes(panelRef.value)) ||
        (!!foldButtonRef.value && path.includes(foldButtonRef.value)),
      onDismiss: () => closePanel(false),
    });
    requestAnimationFrame(applyCap);
  } else {
    detachDismiss?.();
    detachDismiss = null;
    fallback.stop();

    if (pendingReturnFocus) foldButtonRef.value?.focus();

    pendingReturnFocus = false;
  }
};

// ---- delegated host listeners ---------------------------------------------------

const inPanel = (event: Event): boolean =>
  !!panelRef.value && event.composedPath().includes(panelRef.value);

// A folded crumb's own (consumer) click listener has run by now: close the
// panel and hand focus back to the fold button. The link's navigation goes
// ahead untouched.
const onClick = (event: MouseEvent): void => {
  if (!isOpen.value || !inPanel(event)) return;

  const onLink = event
    .composedPath()
    .some((el) => el instanceof HTMLAnchorElement && el.hasAttribute('href'));

  if (onLink) closePanel(true);
};

/** The folded crumbs Tab stops on — the ones with a link — in order. */
const foldedLinks = (): HTMLElement[] =>
  foldedCrumbs()
    .map((c) => crumbPart(c, 'content'))
    .filter((a): a is HTMLElement => !!a?.hasAttribute('href'));

/** Where a key moves from folded link `at` of `count`; `null` when it moves nothing. */
const step = (key: string, at: number, count: number): null | number => {
  switch (key) {
    case 'ArrowDown':
      return (at + 1) % count;
    case 'ArrowUp':
      return (at - 1 + count) % count;
    case 'End':
      return count - 1;
    case 'Home':
      return 0;
    default:
      return null;
  }
};

// The menu's keys without its roles: the folded crumbs stay links, each a Tab
// stop, and the arrows add a quicker way through them — ↓/↑ on the fold
// button open the panel onto the first/last, then move between them and wrap;
// Home/End reach the ends. Enter and Space stay the button's own toggle.
const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    if (!isOpen.value) return;

    event.preventDefault();
    closePanel(true);

    return;
  }

  if (event.altKey || event.ctrlKey || event.metaKey) return;

  const path = event.composedPath();

  const links = foldedLinks();

  if (foldButtonRef.value && path.includes(foldButtonRef.value)) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    event.preventDefault();
    openPanel();
    links[event.key === 'ArrowDown' ? 0 : links.length - 1]?.focus();

    return;
  }

  if (!isOpen.value || !inPanel(event) || !links.length) return;

  const to = step(
    event.key,
    links.indexOf(path[0] as HTMLElement),
    links.length,
  );

  if (to === null) return;

  event.preventDefault();
  links[to]?.focus();
};

// Tabbing past the last folded crumb (or back before the button) closes the
// panel, leaving focus where it went.
const onFocusOut = (): void => {
  requestAnimationFrame(() => {
    if (isOpen.value && !focusInFold()) closePanel(false);
  });
};

// ---- lifecycle -------------------------------------------------------------------

let contentObserver: MutationObserver | null = null;

let resizeObserver: null | ResizeObserver = null;

let lastWidth = -1;

const onResize = (entries: ResizeObserverEntry[]): void => {
  const width = entries[entries.length - 1]?.contentRect.width ?? 0;

  if (width === lastWidth) return;

  lastWidth = width;
  refit();
};

onMounted(() => {
  if (!host) return;

  host.addEventListener('click', onClick);
  host.addEventListener('keydown', onKeydown);
  host.addEventListener('focusout', onFocusOut);

  // Crumbs added, removed or relabelled — a route change re-rendering them
  // included. Attributes are not watched: the slots written here are
  // attributes, and a changed `href` changes no width.
  contentObserver = new MutationObserver(remeasure);
  contentObserver.observe(host, {
    characterData: true,
    childList: true,
    subtree: true,
  });

  panelListRef.value
    ?.querySelector('slot')
    ?.addEventListener('slotchange', onFoldedSlotChange);

  if (listRef.value) {
    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(listRef.value);
  }

  document.fonts?.addEventListener('loadingdone', remeasure);
  customElements.whenDefined(CRUMB).then(remeasure, () => {});
  remeasure();
});

onBeforeUnmount(() => {
  host?.removeEventListener('click', onClick);
  host?.removeEventListener('keydown', onKeydown);
  host?.removeEventListener('focusout', onFocusOut);
  contentObserver?.disconnect();
  resizeObserver?.disconnect();
  panelListRef.value
    ?.querySelector('slot')
    ?.removeEventListener('slotchange', onFoldedSlotChange);
  document.fonts?.removeEventListener('loadingdone', remeasure);
  cancelAnimationFrame(frame);
  detachDismiss?.();
  detachDismiss = null;
  fallback.stop();
});
</script>

<!--
  Escape-hatch CSS — constructs utilities cannot express (as in c-menu):
   - `position-try-fallbacks` on the panel: native flip when the preferred
     placement below the fold button lacks room.
   - the panel's fade-in (`@keyframes`; a fade is not movement, ADR-0057).
-->
<style>
[part='panel'] {
  position-try-fallbacks:
    flip-block,
    flip-inline,
    flip-block flip-inline;
}

[part='panel']:popover-open {
  animation: c-breadcrumb-fade-in 0.12s ease-out;
}

@keyframes c-breadcrumb-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
