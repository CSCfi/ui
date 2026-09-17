/**
 * Anchored field panel (CONTEXT.md "Autocomplete", "Tree select", "Top
 * layer", "Fullscreen panel"; ADR-0008, ADR-0009, ADR-0047, ADR-0050): the
 * lifecycle shared by the value-selection fields that keep a readonly value
 * field in place and open a native popover panel — `c-autocomplete` and
 * `c-tree-select`. One panel, two layouts: **anchored** under the field, or
 * — on a **narrow viewport** — a **fullscreen panel** covering the viewport.
 *
 * What it owns:
 *  - the anchor. CSS anchor names are tree-scoped, so the consumer wraps its
 *    value field in a shadow-DOM box carrying `anchor-name`; `anchorStyle`
 *    supplies that declaration and `panelStyle` the matching
 *    `position-anchor` / `position-area` plus the panel width pinned to the
 *    anchor's rect on open;
 *  - the field-box pull-back. The anchor wrapper spans the whole inner
 *    `c-input`, INCLUDING its hint / error message area (reserved unless
 *    `hide-details` is set), the gap above it and an on-top label. The
 *    panel must sit flush against the field box itself — the same 0px every
 *    dropdown keeps (`c-select`'s listbox, `c-menu`'s default `distance`) —
 *    so on open the distance from the anchor's bottom edge to the field
 *    box's bottom edge is measured and pulled back with a negative
 *    block-start margin, and the distance from the anchor's top edge to the
 *    field box's top edge is published as `--_c-field-panel-top-offset` for
 *    the consumer's flipped-above `@position-try` rules;
 *  - the fullscreen layout: chosen at `open()` from the `fullscreen`
 *    predicate and kept for the whole open (crossing the threshold while open
 *    closes the panel). The panel drops anchor positioning and becomes the
 *    surface — `position: fixed; inset: 0`, the layout viewport, which the
 *    on-screen keyboard overlays but never shrinks — while the card inside it
 *    follows the *visual* viewport (`visualViewport` resize / scroll while
 *    open; `cardStyle`), so the heading row and search input stay above the
 *    keyboard and the page never shows beside them. The page behind it is
 *    locked (`pageLock.ts`: inert except toasts, no document scroll);
 *  - open / close through `showPopover()` / `hidePopover()` on a
 *    `popover="manual"` panel, with the native `toggle` event as the single
 *    source of truth for `isOpen` (browser-initiated closes included);
 *  - light dismiss (CONTEXT.md "Light dismiss", ADR-0050): a press and its
 *    release both outside the host close the panel; a press alone — the
 *    start of every touch scroll — never does (`lightDismiss.ts`);
 *  - focus return to the value field on `close(true)`;
 *  - the OddBird anchor polyfill kick-off on an anchored open (Firefox).
 *
 * What stays in the consumer: the `@position-try --c-field-panel-above` /
 * `--c-field-panel-above-left` flip rules and `position-try-fallbacks` —
 * per-shadow-root escape-hatch CSS (ADR-0007; each element type has its own
 * adopted sheet, so the block is copy-identical in every consumer) — the
 * fullscreen `tv` variant (the panel paints the surface, the card sheds its
 * anchored chrome, the list takes the rest, the heading row) and the open
 * sequence (peek cap, focus, highlight seed, announcement), run from
 * `onOpened` synchronously inside the `toggle` handler.
 */

import {
  computed,
  type ComputedRef,
  type MaybeRefOrGetter,
  onBeforeUnmount,
  type Ref,
  ref,
  toValue,
  watch,
} from 'vue';

import { ensureAnchorPositioning } from './anchorPolyfill';
import { attachLightDismiss, type Detach } from './lightDismiss';
import { lockPage, unlockPage } from './pageLock';
import {
  contentBoxStyle,
  FULLSCREEN_SURFACE_STYLE,
  type StopTracking,
  trackVisualViewport,
  type ViewportBox,
} from './visualViewport';

/**
 * The `anchor-name` every anchored field panel uses. Anchor names are
 * tree-scoped, so one name serves every consumer's shadow root.
 */
export const FIELD_PANEL_ANCHOR = '--c-field-panel-anchor';

export interface AnchoredPanel {
  /** Inline style for the anchor wrapper: `anchor-name: --c-field-panel-anchor`. */
  anchorStyle: string;
  /** Inline style for the card inside the panel: empty while anchored; fullscreen — the visual viewport's box inside the surface (the whole surface with no API). */
  cardStyle: ComputedRef<string>;
  /** Hide the panel; `returnFocus` moves focus to `returnFocusTo` once the `toggle` event confirms the close. */
  close(returnFocus?: boolean): void;
  /** Open state — written only by the native `toggle` event (single source of truth, browser-initiated closes included). */
  isOpen: Readonly<Ref<boolean>>;
  /** The layout of the current open, fixed at `open()` for its whole duration; `'anchored'` — the resting shape, no heading row — while closed. */
  layout: ComputedRef<PanelLayout>;
  /** Bind as the panel's `@toggle` handler. */
  onToggle(event: Event): void;
  /** Choose the layout, measure (anchored: the anchor width and the field box's offsets from the anchor's edges), then `showPopover()`. */
  open(): void;
  /** Inline style for the panel: anchored — `position-anchor`, `position-area: bottom span-right`, `inset: auto`, the pinned width, the field-box pull-back and `--_c-field-panel-top-offset`; fullscreen — the surface, the layout viewport's box. */
  panelStyle: ComputedRef<string>;
}

/** The two layouts one field panel takes (CONTEXT.md "Fullscreen panel"). */
export type PanelLayout = 'anchored' | 'fullscreen';

export interface UseAnchoredPanelOptions {
  /** Shadow-DOM wrapper around the value field; carries `anchor-name`, and its rect pins the panel width. */
  anchor: Readonly<Ref<HTMLElement | null>>;
  /** `open()` is a no-op while this returns true (the field's `disabled`). */
  disabled?: () => boolean;
  /** The inner `c-input` host: the offsets between its field box (`.c-input__slot`) and the anchor's edges are pulled back so the panel sits flush against the field box. */
  field: Readonly<Ref<HTMLElement | null>>;
  /** Open as a fullscreen panel while true — the shared narrow-viewport predicate (`useNarrowViewport`). Absent: always anchored. */
  fullscreen?: Readonly<Ref<boolean>>;
  /** The custom element host: light dismiss keeps gestures whose composed path includes it; its shadow root is what the anchor polyfill runs against; it is what the page lock keeps interactive. */
  host: HTMLElement | null;
  /** Runs inside the native `toggle` handler once closed, before focus returns. */
  onClosed?: () => void;
  /** Runs inside the native `toggle` handler once open, after the polyfill kick-off / page lock and the dismiss listener — the consumer's open sequence goes here. */
  onOpened?: () => void;
  /** The `popover="manual"` panel element. */
  panel: Readonly<Ref<HTMLElement | null>>;
  /** Receives focus when the panel closes via `close(true)`. */
  returnFocusTo: MaybeRefOrGetter<HTMLElement | null | undefined>;
}

export const useAnchoredPanel = (
  options: UseAnchoredPanelOptions,
): AnchoredPanel => {
  const isOpen = ref(false);

  const panelWidth = ref(0);

  /** Anchor bottom edge → field box bottom edge (the message area and the gap above it). */
  const bottomOffset = ref(0);

  /** Anchor top edge → field box top edge (an on-top label and the gap under it). */
  const topOffset = ref(0);

  let pendingReturnFocus = false;

  /** The layout chosen at `open()`; `null` while closed. */
  const openLayout = ref<null | PanelLayout>(null);

  const wouldBeFullscreen = (): boolean => options.fullscreen?.value === true;

  // Resting shape while closed: the consumers key the heading row, the
  // dialog role and the fullscreen `tv` variant off this, none of which may
  // linger on a hidden panel.
  const layout = computed<PanelLayout>(() => openLayout.value ?? 'anchored');

  // ---- visual viewport (fullscreen layout) --------------------------------

  /** The visual viewport's box while a fullscreen panel is open; `null` without the API (then the card fills the surface). */
  const viewportBox = ref<null | ViewportBox>(null);

  let stopViewport: null | StopTracking = null;

  const trackViewport = (): void => {
    stopViewport?.();
    stopViewport = trackVisualViewport((box) => {
      viewportBox.value = box;
    });
  };

  const untrackViewport = (): void => {
    stopViewport?.();
    stopViewport = null;
    viewportBox.value = null;
  };

  // ---- style ----------------------------------------------------------------

  const panelStyle = computed(() => {
    if (layout.value === 'fullscreen') return FULLSCREEN_SURFACE_STYLE;

    const w = panelWidth.value ? `width:${panelWidth.value}px;` : '';

    const m = bottomOffset.value ? `margin-top:-${bottomOffset.value}px;` : '';

    // Read by the consumer's flipped-above `@position-try` rules as a
    // negative `margin-bottom`, so the panel meets the field box's top edge
    // too (and not an on-top label's).
    const t = `--_c-field-panel-top-offset:${topOffset.value}px;`;

    return `position-anchor:${FIELD_PANEL_ANCHOR};position-area:bottom span-right;inset:auto;${w}${m}${t}`;
  });

  const cardStyle = computed(() =>
    layout.value === 'fullscreen' ? contentBoxStyle(viewportBox.value) : '',
  );

  // ---- open / close -----------------------------------------------------------

  const open = (): void => {
    const p = options.panel.value;

    if (options.disabled?.() || !p || p.matches(':popover-open')) return;

    if (typeof p.showPopover !== 'function') return;

    const fullscreen = wouldBeFullscreen();

    openLayout.value = fullscreen ? 'fullscreen' : 'anchored';

    if (fullscreen) {
      trackViewport();
    } else {
      // Pin the panel width to the field before showing so it lines up.
      const anchorRect = options.anchor.value?.getBoundingClientRect();

      panelWidth.value = anchorRect?.width ?? 0;

      // Anchor to the FIELD BOX's edges, not the c-input's: below it lie the
      // gap and the message area, above it an on-top label.
      const box = options.field.value?.shadowRoot
        ?.querySelector('.c-input__slot')
        ?.getBoundingClientRect();

      bottomOffset.value =
        anchorRect && box ? Math.max(0, anchorRect.bottom - box.bottom) : 0;
      topOffset.value =
        anchorRect && box ? Math.max(0, box.top - anchorRect.top) : 0;
    }

    p.showPopover();
  };

  const close = (returnFocus = false): void => {
    pendingReturnFocus = returnFocus;

    const p = options.panel.value;

    if (
      p &&
      typeof p.hidePopover === 'function' &&
      p.matches(':popover-open')
    ) {
      p.hidePopover();
    }
  };

  // ---- light dismiss ------------------------------------------------------------

  let detachDismiss: Detach | null = null;

  const attachDismiss = (): void => {
    detachDismiss?.();

    const { host } = options;

    if (!host) return;

    detachDismiss = attachLightDismiss({
      isInside: (path) => path.includes(host),
      onDismiss: () => {
        if (isOpen.value) close(false);
      },
    });
  };

  const detachDismissListeners = (): void => {
    detachDismiss?.();
    detachDismiss = null;
  };

  // ---- toggle -----------------------------------------------------------------------

  const onToggle = (event: Event): void => {
    const nowOpen = (event as ToggleEvent).newState === 'open';

    isOpen.value = nowOpen;

    if (nowOpen) {
      // A `manual` popover only opens through `open()`, which set the layout;
      // fall back to the live predicate for any other route.
      openLayout.value ??= wouldBeFullscreen() ? 'fullscreen' : 'anchored';

      if (openLayout.value === 'fullscreen') {
        if (options.host) lockPage(options.host);
      } else {
        void ensureAnchorPositioning(options.host?.shadowRoot);
      }

      attachDismiss();
      options.onOpened?.();
    } else {
      detachDismissListeners();

      if (options.host) unlockPage(options.host);

      untrackViewport();
      openLayout.value = null;
      options.onClosed?.();

      if (pendingReturnFocus) toValue(options.returnFocusTo)?.focus();

      pendingReturnFocus = false;
    }
  };

  // Crossing the threshold while open: the layouts are not interchangeable
  // mid-open (anchor vs viewport box, page lock), so the panel closes.
  if (options.fullscreen) {
    watch(options.fullscreen, (fullscreen) => {
      if (
        isOpen.value &&
        openLayout.value !== null &&
        (openLayout.value === 'fullscreen') !== fullscreen
      ) {
        close(false);
      }
    });
  }

  onBeforeUnmount(() => {
    detachDismissListeners();
    untrackViewport();

    if (options.host) unlockPage(options.host);

    // Ensure the popover is torn down if the consumer unmounts while open.
    const p = options.panel.value;

    if (p?.matches(':popover-open')) p.hidePopover();
  });

  return {
    anchorStyle: `anchor-name:${FIELD_PANEL_ANCHOR}`,
    cardStyle,
    close,
    isOpen,
    layout,
    onToggle,
    open,
    panelStyle,
  };
};
