/**
 * Anchored field panel (CONTEXT.md "Autocomplete", "Tree select", "Top
 * layer"; ADR-0008, ADR-0009, ADR-0047): the lifecycle shared by the
 * value-selection fields that keep a readonly value field in place and open a
 * native popover panel anchored under it — `c-autocomplete` and
 * `c-tree-select`.
 *
 * What it owns:
 *  - the anchor. CSS anchor names are tree-scoped, so the consumer wraps its
 *    value field in a shadow-DOM box carrying `anchor-name`; `anchorStyle`
 *    supplies that declaration and `panelStyle` the matching
 *    `position-anchor` / `position-area` plus the panel width pinned to the
 *    anchor's rect on open;
 *  - the message pull-back. The anchor wrapper spans the whole inner
 *    `c-input`, INCLUDING its hint / error message area (reserved unless
 *    `hide-details` is set). The panel must sit flush under the field
 *    itself, so the `[part='message']` height is measured on open and pulled
 *    back with a negative block-start margin;
 *  - open / close through `showPopover()` / `hidePopover()` on a
 *    `popover="manual"` panel, with the native `toggle` event as the single
 *    source of truth for `isOpen` (browser-initiated closes included);
 *  - light dismiss: a capture-phase document `pointerdown` listener that
 *    closes unless the composed path includes the host;
 *  - focus return to the value field on `close(true)`;
 *  - the OddBird anchor polyfill kick-off on open (Firefox).
 *
 * What stays in the consumer: the `@position-try --c-field-panel-above` /
 * `--c-field-panel-above-left` flip rules and `position-try-fallbacks` —
 * per-shadow-root escape-hatch CSS (ADR-0007; each element type has its own
 * adopted sheet, so the block is copy-identical in every consumer) — and the
 * open sequence (peek cap, focus, highlight seed, announcement), run from
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
} from 'vue';

import { ensureAnchorPositioning } from './anchorPolyfill';

/**
 * The `anchor-name` every anchored field panel uses. Anchor names are
 * tree-scoped, so one name serves every consumer's shadow root.
 */
export const FIELD_PANEL_ANCHOR = '--c-field-panel-anchor';

export interface AnchoredPanel {
  /** Inline style for the anchor wrapper: `anchor-name: --c-field-panel-anchor`. */
  anchorStyle: string;
  /** Hide the panel; `returnFocus` moves focus to `returnFocusTo` once the `toggle` event confirms the close. */
  close(returnFocus?: boolean): void;
  /** Open state — written only by the native `toggle` event (single source of truth, browser-initiated closes included). */
  isOpen: Readonly<Ref<boolean>>;
  /** Bind as the panel's `@toggle` handler. */
  onToggle(event: Event): void;
  /** Measure the anchor width and the field's message height, then `showPopover()`. */
  open(): void;
  /** Inline style for the panel: `position-anchor`, `position-area: bottom span-right`, `inset: auto`, the pinned width and the message pull-back. */
  panelStyle: ComputedRef<string>;
}

export interface UseAnchoredPanelOptions {
  /** Shadow-DOM wrapper around the value field; carries `anchor-name`, and its rect pins the panel width. */
  anchor: Readonly<Ref<HTMLElement | null>>;
  /** `open()` is a no-op while this returns true (the field's `disabled`). */
  disabled?: () => boolean;
  /** The inner `c-input` host: its `[part='message']` height is pulled back so the panel sits flush under the field box. */
  field: Readonly<Ref<HTMLElement | null>>;
  /** The custom element host: light dismiss keeps pointerdowns whose composed path includes it; its shadow root is what the anchor polyfill runs against. */
  host: HTMLElement | null;
  /** Runs inside the native `toggle` handler once closed, before focus returns. */
  onClosed?: () => void;
  /** Runs inside the native `toggle` handler once open, after the polyfill kick-off and the dismiss listener — the consumer's open sequence goes here. */
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

  const messageOffset = ref(0);

  let pendingReturnFocus = false;

  const panelStyle = computed(() => {
    const w = panelWidth.value ? `width:${panelWidth.value}px;` : '';

    const m = messageOffset.value
      ? `margin-top:-${messageOffset.value}px;`
      : '';

    return `position-anchor:${FIELD_PANEL_ANCHOR};position-area:bottom span-right;inset:auto;${w}${m}`;
  });

  const open = (): void => {
    const p = options.panel.value;

    if (options.disabled?.() || !p || p.matches(':popover-open')) return;

    // Pin the panel width to the field before showing so it lines up.
    panelWidth.value = options.anchor.value?.getBoundingClientRect().width ?? 0;

    // Anchor to the bottom of the FIELD, not the c-input's message area.
    const message =
      options.field.value?.shadowRoot?.querySelector<HTMLElement>(
        "[part='message']",
      );

    messageOffset.value = message?.getBoundingClientRect().height ?? 0;

    if (typeof p.showPopover === 'function') p.showPopover();
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

  const onDocPointerDown = (event: Event): void => {
    if (!isOpen.value || !options.host) return;

    if (!event.composedPath().includes(options.host)) close(false);
  };

  const onToggle = (event: Event): void => {
    const nowOpen = (event as ToggleEvent).newState === 'open';

    isOpen.value = nowOpen;

    if (nowOpen) {
      void ensureAnchorPositioning(options.host?.shadowRoot);
      document.addEventListener('pointerdown', onDocPointerDown, true);
      options.onOpened?.();
    } else {
      document.removeEventListener('pointerdown', onDocPointerDown, true);
      options.onClosed?.();

      if (pendingReturnFocus) toValue(options.returnFocusTo)?.focus();

      pendingReturnFocus = false;
    }
  };

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocPointerDown, true);

    // Ensure the popover is torn down if the consumer unmounts while open.
    const p = options.panel.value;

    if (p?.matches(':popover-open')) p.hidePopover();
  });

  return {
    anchorStyle: `anchor-name:${FIELD_PANEL_ANCHOR}`,
    close,
    isOpen,
    onToggle,
    open,
    panelStyle,
  };
};
