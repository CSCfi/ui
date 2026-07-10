<template>
  <c-button-group
    :disabled
    :size
    :value.prop="value"
    exportparts="root, indicator"
    mandatory
    @change="onGroupChange"
  >
    <slot />
  </c-button-group>
</template>

<script lang="ts">
export interface CTabButtonsProps {
  /** Disable the whole tab strip — every slotted c-button is disabled and the selection can no longer be changed. */
  disabled?: boolean;
  /**
   * Size of the buttons
   *
   * @seeded from csc-ui — verify
   */
  size?: CTabButtonsSize;
  /**
   * Value of the active tab — pushed down by the parent c-tabs.
   *
   * @seeded from csc-ui — verify
   */
  value?: number | string;
}

/**
 * Size of the tab strip. `small` renders a more compact control; the size is
 * also propagated to every slotted `<c-button>`. Omitting the attribute
 * renders the default size.
 */
export type CTabButtonsSize = 'default' | 'small';
</script>

<script setup lang="ts">
/**
 * The tab-strip adapter for `<c-tabs>` (ADR-0023): presents the tab list as a
 * button group. Authored only inside `<c-tabs>`, with plain `<c-button>`
 * children. It carries no form semantics — for a standalone value picker use
 * `<c-button-group>`, which this component wraps. Selection is inherently
 * mandatory: a tab strip always has an active tab.
 *
 * @slot default - Default slot for the c-button elements
 * @csspart root - The segmented-control box framing the buttons, forwarded from the wrapped c-button-group
 * @csspart indicator - The sliding fill highlighting the active tab, forwarded from the wrapped c-button-group
 */
import { useHost } from 'vue';

import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-tab-buttons>`. */
interface CTabButtonsEvents {
  /**
   * Fired when the user activates a tab button, carrying the newly selected
   * value. The parent `<c-tabs>` listens for it and pushes the accepted value
   * back down; consumers should listen to `c-tabs` instead.
   */
  tabChange: {
    element: HTMLElement | null;
    value: number | string;
  };
}

// The wrapped c-button-group owns all rendering; nothing is written to the
// host, so fallthrough attrs may stay on the group element — but the group is
// in OUR shadow root, so keep them on the host for consumer expectations.
defineOptions({ inheritAttrs: false });

withDefaults(defineProps<CTabButtonsProps>(), {
  disabled: false,
  size: 'default',
  value: 0,
});

const host = useHost();

const emit = useHostEmit<CTabButtonsEvents>();

// Bridge the group's selection to the c-tabs contract: c-tabs listens for
// `tabChange` bubbling from its light-DOM children and pushes the accepted
// value back via the `value` property, which flows down to the group through
// the template binding. The group knows nothing about tabs.
const onGroupChange = (e: Event) => {
  const value = (e as CustomEvent<number | string>).detail;
  // The group's own change/update:value stay inside this shadow root (they
  // are dispatched non-bubbling on the group element); only the tab contract
  // crosses the host boundary.
  e.stopPropagation();

  emit(
    'tabChange',
    { element: host, value },
    { bubbles: true, composed: true },
  );
};
</script>
