<template>
  <div ref="rootRef" :class="ui.root()" part="root">
    <span :class="ui.content()" part="content">
      <slot />
    </span>

    <svg
      v-if="hasSubmenu"
      :class="ui.chevron()"
      aria-hidden="true"
      viewBox="0 0 24 24"
    >
      <path :d="mdiChevronRight" />
    </svg>
  </div>

  <!-- Submenu surface: its own manual popover in the top layer, anchored to
       this item's root via CSS anchor positioning (ADR-0008). Opened/closed
       on command from the controlling c-menu. Rendered only once a submenu
       has been detected so the empty case carries no popover. -->
  <div
    v-if="hasSubmenu"
    ref="submenuRef"
    :class="ui.submenuPanel()"
    :style="submenuStyle"
    part="submenu-panel"
    popover="manual"
  >
    <div
      :class="ui.submenu()"
      aria-orientation="vertical"
      part="submenu"
      role="menu"
    >
      <slot name="submenu" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * A single command in a `c-menu`.
 *
 * @slot default - The item's content: label text plus optional icons or shortcut hint
 * @slot submenu - c-menu-item components for the nested submenu
 *
 * @csspart root - The item row containing the content and the submenu chevron
 * @csspart content - The flex wrapper around the default-slot content
 * @csspart submenu-panel - The floating popover holding the submenu
 * @csspart submenu - The submenu list surface inside the popover
 */
import { mdiChevronRight } from '@mdi/js';
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

import { ensureAnchorPositioning } from '../../shared/anchorPolyfill';
import { coerceBoolean } from '../../shared/coerceBoolean';

/**
 * A single command in a `c-menu`. Mostly presentational: it renders its row
 * (the `root` part, `role="menuitem"` set on the host by this component), the
 * default-slot content wrapped in a `flex items-center gap-2` box for icons +
 * label, and — when its `submenu` slot is populated — a chevron and a nested
 * submenu popover.
 *
 * The owning `c-menu` is the sole keyboard/focus controller (see CMenu.vue):
 * `provide/inject` does not cross `defineCustomElement` boundaries, so the
 * menu drives this item through the DOM (delegated events, roving `tabindex`)
 * and through the `openSubmenu`/`closeSubmenu` methods exposed below.
 *
 * Styling is in this `tailwind-variants` config (ADR-0004); `::part()` is the
 * customization surface (ADR-0006). The `<style>` block is the ADR-0007
 * escape hatch: the host must be a focusable box (`:host{display:block}`,
 * focusable because the controller calls `host.focus()`), and the active-row
 * highlight keys off `:host([data-active])` — a contextual host selector that
 * cannot be a utility, driven by the `data-active` attribute the controller
 * toggles.
 */
const item = tv({
  compoundVariants: [
    // A disabled item always reads as disabled, even when also marked danger:
    // re-assert the neutral disabled colour over the danger red.
    {
      class: {
        root: 'text-on-surface-muted hover:text-on-surface-muted',
      },
      danger: true,
      disabled: true,
    },
  ],
  defaultVariants: { danger: false, disabled: false },
  slots: {
    chevron: 'shrink-0 size-4.5 -mr-1 fill-current',
    // `flex-1` so the content box fills the row width — this lets consumers
    // right-align trailing content placed in the default slot (e.g. an icon or
    // shortcut hint) with `ml-auto` / `justify-between`, instead of it sticking
    // to the label.
    content: 'flex flex-1 items-center gap-2 min-w-0',
    root: 'flex items-center justify-between gap-3 min-h-10 px-3 rounded-csc-sm text-sm cursor-pointer select-none outline-none whitespace-nowrap text-on-surface hover:bg-primary-subtle hover:text-primary hover:ring-1 hover:ring-primary',
    submenu:
      'list-none m-0 p-1 min-w-45 w-max max-h-[80vh] overflow-y-auto rounded-csc-sm bg-surface-overlay shadow-[2px_4px_10px_#00000029] outline-none',
    submenuPanel:
      'fixed m-0 p-0 border-0 bg-transparent overflow-visible [inset:auto]',
  },
  variants: {
    // Destructive action — matches c-button's danger token (error-600). The
    // keyboard-active (`[data-active]`) red state lives in the escape-hatch
    // <style> since it must target the host attribute.
    danger: {
      true: {
        root: 'text-error hover:bg-error-subtle hover:text-error hover:ring-error',
      },
    },
    disabled: {
      true: {
        root: 'cursor-default pointer-events-none opacity-60 text-on-surface-muted hover:bg-transparent hover:text-on-surface-muted',
      },
    },
  },
});

interface CMenuItemProps {
  /** Marks the action as destructive (renders in the error colour). */
  danger?: boolean;
  /** Disables the item — it is skipped by keyboard nav and emits no select. */
  disabled?: boolean;
  /**
   * Value reported in the menu's `select` event when this item is chosen.
   *
   * @freeform
   */
  value?: string;
}

const props = withDefaults(defineProps<CMenuItemProps>(), {
  danger: false,
  disabled: false,
  value: undefined,
});

// Two root nodes (row + submenu popover) — opt out of attribute fallthrough.
defineOptions({ inheritAttrs: false });

const host = useHost();

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const submenuRef = useTemplateRef<HTMLElement>('submenuRef');

const isDisabled = computed(() => coerceBoolean(props.disabled));

const isDanger = computed(() => coerceBoolean(props.danger));

const ui = computed(() =>
  item({ danger: isDanger.value, disabled: isDisabled.value }),
);

// Anchor the submenu to this item's row. The name is tree-scoped to this
// component's shadow root, so a constant is collision-free across instances.
const submenuStyle =
  'position-anchor:--c-menu-item-anchor;position-area:right span-bottom;inset:auto;';

// Whether a populated `submenu` slot exists. Detected by querying this host's
// own light-DOM children for `slot="submenu"` (not via the shadow `<slot>`),
// so detection does not depend on the popover being rendered first.
const slotCount = ref(0);

const hasSubmenu = computed(() => slotCount.value > 0);

let observer: MutationObserver | null = null;

const refreshSubmenu = () => {
  slotCount.value =
    host?.querySelectorAll(':scope > [slot="submenu"]').length ?? 0;
};

// ---- exposed imperative API (called by the controlling c-menu) ----------

const openSubmenu = () => {
  const panel = submenuRef.value;

  if (!panel) return;

  if (!panel.matches(':popover-open')) panel.showPopover();

  host?.setAttribute('aria-expanded', 'true');
  void ensureAnchorPositioning(host?.shadowRoot);
};

const closeSubmenu = () => {
  const panel = submenuRef.value;

  if (panel?.matches(':popover-open')) panel.hidePopover();

  if (host?.hasAttribute('aria-haspopup')) {
    host.setAttribute('aria-expanded', 'false');
  }
};

defineExpose({ closeSubmenu, openSubmenu });

// ---- host ARIA / role wiring --------------------------------------------

watch(isDisabled, (disabled) => {
  if (disabled) host?.setAttribute('aria-disabled', 'true');
  else host?.removeAttribute('aria-disabled');
});

// Reflected so the escape-hatch active-row rule can pick out danger items
// (`:host([data-active][data-danger])`), which Tailwind cannot target.
watch(isDanger, (danger) => {
  if (danger) host?.setAttribute('data-danger', '');
  else host?.removeAttribute('data-danger');
});

watch(hasSubmenu, (has) => {
  if (has) {
    host?.setAttribute('aria-haspopup', 'menu');
    host?.setAttribute('aria-expanded', 'false');
  } else {
    host?.removeAttribute('aria-haspopup');
    host?.removeAttribute('aria-expanded');
  }
});

const rootEl = computed(() => rootRef.value);

watch(rootEl, (el) => {
  // The anchor name lives on the rendered root box.
  if (el) el.style.setProperty('anchor-name', '--c-menu-item-anchor');
});

onMounted(() => {
  if (!host) return;

  host.setAttribute('role', 'menuitem');

  if (!host.hasAttribute('tabindex')) host.tabIndex = -1;

  if (isDisabled.value) host.setAttribute('aria-disabled', 'true');

  if (isDanger.value) host.setAttribute('data-danger', '');

  rootRef.value?.style.setProperty('anchor-name', '--c-menu-item-anchor');

  refreshSubmenu();

  if (hasSubmenu.value) {
    host.setAttribute('aria-haspopup', 'menu');
    host.setAttribute('aria-expanded', 'false');
  }

  // Submenu items are added/removed as light-DOM children; keep in sync.
  observer = new MutationObserver(refreshSubmenu);
  observer.observe(host, { childList: true });
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<!--
  ADR-0007 escape-hatch CSS — constructs utilities cannot express:
   - `:host{display:block}` makes the host a focusable box (the controller
     calls `host.focus()` for roving-tabindex navigation) and overrides the
     global `:host{display:contents}`.
   - `:host([data-active]) [part="root"]` is the keyboard-highlight, driven by
     the `data-active` attribute the controlling c-menu toggles — a contextual
     host selector, not a utility. The danger variant of that highlight keys off
     the additionally-reflected `data-danger` attribute. Tokens only.
-->
<style>
:host {
  display: block;
}

:host(:focus) {
  outline: none;
}

:host([data-active]) [part='root'] {
  background-color: var(--c-primary-subtle);
  box-shadow: inset 0 0 0 1px var(--c-primary);
  color: var(--c-primary);
}

:host([data-active][data-danger]) [part='root'] {
  background-color: var(--c-error-subtle);
  box-shadow: inset 0 0 0 1px var(--c-error);
  color: var(--c-error);
}
</style>
