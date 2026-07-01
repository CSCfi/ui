<template>
  <div ref="rootRef" :class="ui.root()" part="root">
    <div
      ref="indicatorRef"
      :class="ui.indicator()"
      aria-hidden="true"
      part="indicator"
    />

    <slot />
  </div>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useTemplateRef,
  watch,
} from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { emitModelValue } from '../../shared/emitModelValue';

// We write to the host (classList, child <c-button> props) below — keep
// fallthrough attrs on the host element rather than the inner `root` div, so
// consumer attributes/styles target the custom element as expected.
defineOptions({ inheritAttrs: false });

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004): the inner `root`
 * div is the styled segmented-control box, so it can be customized via
 * `::part(root)` (ADR-0006) — the old `<slot />`-only host offered no styling
 * surface at all. The host stays `display:contents` (global).
 *
 * The frame and dividers are drawn entirely with the `root` background: the
 * padding shows it as the outer border and the grid gap shows it between buttons
 * (replacing the previous `box-shadow` ring + `margin`). A grid with
 * `auto-cols-fr` is used (not flex) so the buttons fill the frame in equal
 * columns: each slotted <c-tab-button>'s host is `display:contents`, so the
 * button box it wraps is promoted into this grid and sized by the *track* —
 * `flex-grow` on the (boxless) host would have no effect.
 *
 * Children are <c-tab-button> (not raw <c-button>): this component drives only
 * their clean `active` / `value` / `size` / `disabled` props and listens for the
 * `tabChange` / `tabFocus` events they emit. c-tab-button wraps c-button and
 * forwards its parts via `exportparts`, so consumers customize a button with
 * `c-tab-button[active]::part(root)` / `:not([active])::part(root)` (ADR-0006).
 */
const tabButtons = tv({
  defaultVariants: {
    disabled: false,
  },
  slots: {
    // The single sliding active fill. JS sets width + translateX to the active
    // button's measured box; `top-1 bottom-1` matches the root's `p-1` so it
    // covers the button vertically. Radius matches c-button's `rounded-xl`.
    indicator:
      'pointer-events-none absolute left-0 -z-10 w-0 origin-left rounded-csc-md bg-primary opacity-0 transition-[transform,width,opacity] duration-300 ease-out',
    // `relative isolate` so the `-z-10` indicator is contained in this box's
    // stacking context and paints above the root background but below the
    // (transparent) buttons.
    root: 'relative isolate flex auto-cols-fr rounded-csc-lg bg-surface-sunken',
  },
  variants: {
    disabled: {
      true: {
        indicator: 'bg-border-strong',
        root: 'bg-surface-muted pointer-events-none',
      },
    },
    size: {
      default: {
        indicator: 'top-1 bottom-1',
        root: 'p-1 gap-1',
      },
      small: {
        indicator: 'top-0.5 bottom-0.5',
        root: 'p-0.5 gap-0.5',
      },
    },
  },
});

interface CTabButtonsProps {
  disabled?: boolean;
  mandatory?: boolean;
  size?: 'default' | 'small';
  /** Set by c-tabs when this acts as its tab controller. */
  tabs?: boolean;
  value?: number | string;
}

const props = withDefaults(defineProps<CTabButtonsProps>(), {
  disabled: false,
  mandatory: false,
  size: 'default',
  tabs: false,
  value: 0,
});

const host = useHost();

const ui = computed(() =>
  tabButtons({ disabled: coerceBoolean(props.disabled), size: props.size }),
);

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const indicatorRef = useTemplateRef<HTMLElement>('indicatorRef');

// Internal value mirror. `props.value` is read-only inside the component and is
// only updated by the parent asynchronously (after the native `input` round
// trip), so click logic that needs the *just-selected* value synchronously
// (e.g. the deselect toggle) must read this mirror, not `props.value`. We also
// push the committed value onto the host's own `value` property (see
// `syncHostValue`) so native v-model can read it; that write re-enters the
// `props.value` watch, which keeps this mirror in sync.
const internalValue = ref<null | number | string>(props.value);

let isIndexBased = false;

let focusedTabValue: number | string = props.value;

// c-tabs uses setAttribute('tabs', 'true'), which Vue's Boolean prop
// validator warns about. Tolerate both — read the host attribute too.
const isInTabsMode = (): boolean => {
  if (coerceBoolean(props.tabs)) return true;

  if (!host) return false;

  return host.hasAttribute('tabs') && host.getAttribute('tabs') !== 'false';
};

type CTabButtonEl = {
  active?: boolean;
  disabled?: boolean;
  focusButton?: () => void;
  getButtonRect?: () => DOMRect | null;
  size?: string;
  value?: number | string;
} & HTMLElement;

const buttons = () =>
  Array.from(
    host?.querySelectorAll(':scope > c-tab-button') ?? [],
  ) as CTabButtonEl[];

// Slide the single active-fill indicator over the currently-active button.
// Measured from c-tab-button.getButtonRect() (the inner c-button's box) since
// the c-tab-button host itself is display:contents and has no box of its own.
// `animate=false` (initial mount, resize) snaps without a transition so the
// pill doesn't fly in from the left.
const moveIndicator = (animate = true) => {
  const root = rootRef.value;

  const ind = indicatorRef.value;

  if (!root || !ind) return;

  const active = buttons().find((b) => b.hasAttribute('active'));

  if (!active) {
    ind.style.opacity = '0';

    return;
  }

  const box = active.getButtonRect?.() ?? active.getBoundingClientRect();

  if (!box || box.width === 0) return;

  const rootBox = root.getBoundingClientRect();

  // A hidden indicator (no prior selection) must snap to its first position,
  // not animate from left-0/width-0.
  const wasHidden = ind.style.opacity === '' || ind.style.opacity === '0';

  const snap = !animate || wasHidden;

  if (snap) ind.style.transition = 'none';
  ind.style.width = `${box.width}px`;
  ind.style.transform = `translateX(${box.left - rootBox.left}px)`;
  ind.style.opacity = '1';

  if (snap) {
    // Force a reflow so the snapped geometry commits before transitions resume.
    void ind.offsetWidth;
    ind.style.transition = '';
  }
};

// Re-snap the indicator (no animation) whenever geometry changes that the
// `props.value` watch can't see: the viewport resizing, the panel that holds us
// (an accordion / tab body) expanding from display:none, fonts loading, or a
// sibling button appearing — e.g. a `v-show`'d button that loads async — which
// reflows the equal-width columns and shrinks the active button.
//
// We observe the root AND each button's native control box: when a sibling
// appears the root width is unchanged (it's the full container), only the
// per-button column width shifts, so a root-only observer would miss it.
let resizeObserver: null | ResizeObserver = null;

const nativeControlOf = (btn: CTabButtonEl): Element | null =>
  btn.shadowRoot
    ?.querySelector('c-button')
    ?.shadowRoot?.querySelector('button, a') ?? null;

const observeGeometry = () => {
  if (!resizeObserver) return;
  resizeObserver.disconnect();

  if (rootRef.value) resizeObserver.observe(rootRef.value);
  buttons().forEach((b) => {
    const ctrl = nativeControlOf(b);

    if (ctrl) resizeObserver!.observe(ctrl);
  });
};

const availableValues = () => buttons().map((b) => b.value ?? b.dataset.index);

const getTabIndex = (value: number | string) =>
  availableValues().findIndex((v) => v === value);

// Reflect the active button by flipping each one's clean `active` prop (the
// buttons stay transparent; the solid fill is the sliding indicator below).
// Touch both prop and attribute on every iteration (rather than "set all then
// unset one")
// because Vue defineCustomElement reflects Boolean prop changes back to the
// attribute; the empty attribute also drives consumers' `c-tab-button[active]`
// selectors.
const applyActive = (value: null | number | string) => {
  const btns = buttons();

  const active =
    value === null || value === undefined
      ? undefined
      : (btns.find((b) => b.value === value) ?? btns[value as number]);
  btns.forEach((b) => {
    if (b.disabled) return;

    const isActive = b === active;
    b.active = isActive;

    if (isActive) b.setAttribute('active', '');
    else b.removeAttribute('active');
  });
  // Animate the indicator to the new selection (after the attribute change has
  // flipped the buttons' transparent/text state and layout is current).
  requestAnimationFrame(() => moveIndicator(true));
};

// Commit a user-driven selection: update the internal mirror and visuals
// immediately, mirror the value onto the host property (for native v-model),
// then emit. Emission lives here — on interaction only — never in the
// `props.value` watch, so parent/programmatic value changes don't echo back as
// events (which would loop with v-model).
const commitValue = (resolved: null | number | string) => {
  internalValue.value = resolved;
  applyActive(resolved);
  emitModelValue(host, resolved);
};

// Visuals-only: fires when the parent (or our own `syncHostValue` write) changes
// the value. Re-sync the mirror and active button; never emit here.
watch(
  () => props.value,
  (value) => {
    internalValue.value = value;
    applyActive(value);
  },
);

onMounted(() => {
  if (!host) return;
  host.classList.add('c-tab-buttons');
  host.classList.toggle('disabled', props.disabled);

  const btns = buttons();
  isIndexBased = btns.every((b) => typeof b.value === 'undefined');

  btns.forEach((button, index) => {
    button.setAttribute('data-index', String(index));
    button.disabled = props.disabled || button.disabled;
    button.size = props.size;

    const isActive =
      props.value !== null &&
      (isIndexBased ? index === +props.value : button.value === props.value);

    // Flip the clean `active` prop per button. c-tab-button derives its look
    // (and roving tabindex) from it. Set both prop and attribute per button —
    // see applyActive above for why we don't "set all then unset one".
    button.active = isActive;

    if (isActive) button.setAttribute('active', '');
    else button.removeAttribute('active');
  });

  // Place the indicator under the initial selection without animating it in.
  // Double rAF so the buttons' inner c-button shadow has laid out and reports a
  // real box before we measure.
  resizeObserver = new ResizeObserver(() => moveIndicator(false));
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      moveIndicator(false);
      observeGeometry();
    }),
  );

  // Selection toggling on click. Two modes:
  //  - Tabs mode (acting as c-tabs's controller): let the tabChange event
  //    bubble up to c-tabs and let c-tabs push the new value back via
  //    `tb.value = ...`. Don't touch local state — c-tabs owns the value
  //    and forbids deselection, so handling it here would just race.
  //  - Standalone mode: own the value via internalValue. `commitValue` updates
  //    the visuals immediately, mirrors the value to the host property, and
  //    emits `changeValue` + a native `input` so both `v-control` and a plain
  //    `v-model` consumer sync. Clicking the active button toggles it off
  //    (unless `mandatory`).
  host.addEventListener('tabChange', (e) => {
    const ev = e as CustomEvent<{ value: number | string }>;

    if (isInTabsMode()) return;
    ev.stopPropagation();

    const current = internalValue.value;

    const isActive =
      current !== null &&
      (isIndexBased
        ? +ev.detail.value === +(current as number)
        : ev.detail.value === current);

    if (props.mandatory && isActive) return;

    const nullValue = isIndexBased ? null : '';

    const next = isIndexBased ? +ev.detail.value : ev.detail.value;

    const resolved = (isActive ? nullValue : next) as number | string;
    commitValue(resolved);
  });

  host.addEventListener('tabFocus', (e) => {
    const ev = e as CustomEvent<number | string>;
    ev.stopPropagation();
    focusedTabValue = ev.detail;
  });

  // Arrow-key navigation between buttons.
  host.addEventListener(
    'keyup',
    (e) => {
      const ev = e as KeyboardEvent;
      ev.stopPropagation();

      const isLeft = ev.key === 'ArrowLeft';

      const isRight = ev.key === 'ArrowRight';

      if (!isLeft && !isRight) return;

      const values = availableValues();

      const tabIndex =
        getTabIndex(focusedTabValue) ??
        +(buttons()[focusedTabValue as number]?.dataset.index ?? 0);

      const first = values.at(0);

      const last = values.at(-1);

      const isBeginning = focusedTabValue === first;

      const isEnd = focusedTabValue === last;

      const nextValue = isEnd ? first : values[tabIndex + 1];

      const prevValue = isBeginning ? last : values[tabIndex - 1];

      const target = isLeft ? prevValue : nextValue;

      const item = buttons().find(
        (b) => b.value === target || b.dataset.index === target,
      );
      requestAnimationFrame(() => item?.focusButton?.());
    },
    true,
  );
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>
