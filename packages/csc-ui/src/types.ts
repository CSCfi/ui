/**
 * Shared public types for csc-ui: types whose value crosses a
 * component boundary, so no single component owns them. Component-owned types
 * live in their component's SFC; everything here and there is re-exported from
 * the package entry (`src/index.ts`):
 *
 *   import type { CSelectItem } from '@cscfi/csc-ui';
 */

/**
 * Field height of the form controls built on `c-input`. `default` is the 44px
 * field; `small` is the 36px field. Owned here because the value passes from
 * the wrapping control (`c-select`) into `c-input`.
 */
export type CFieldSize = 'default' | 'small';

/**
 * Preferred placement of a floating panel relative to its anchor, shared by
 * the anchor-positioned overlay components (`c-menu`, `c-tooltip`,
 * `c-popover`). The side names the panel's position; `-start`/`-end` align
 * the panel's edge with the anchor's on the cross axis.
 */
export type CPlacement =
  | 'bottom-end'
  | 'bottom-start'
  | 'bottom'
  | 'left-end'
  | 'left-start'
  | 'left'
  | 'right-end'
  | 'right-start'
  | 'right'
  | 'top-end'
  | 'top-start'
  | 'top';

/**
 * A selectable item for the value-selection components (`c-select`,
 * `c-autocomplete`) when options are supplied via the `items` prop instead of
 * slotted `<c-option>` elements.
 */
export interface CSelectItem {
  /** Disable the item so it cannot be selected. */
  disabled?: boolean;
  /** The item's display label. */
  name: string;
  /** The value emitted via v-model when the item is selected. */
  value: number | string;
}

/**
 * A toast notification: the argument to `c-toasts`' `addToast` method,
 * rendered by the composed `c-toast` child.
 */
export interface CToastMessage {
  /** Label of the toast's close button. */
  closeText?: string;
  /** Render the slotted custom content instead of `message`. */
  custom?: boolean;
  /** How long the toast stays visible, in milliseconds. Defaults to 6000. */
  duration?: number;
  /** Identifier used to remove the toast via `removeToast`. */
  id?: string;
  /** Show an indeterminate progress bar instead of the countdown. */
  indeterminate?: boolean;
  /** The message text. */
  message: string;
  /** Keep the toast visible until it is explicitly closed. */
  persistent?: boolean;
  /** Show a progress bar counting down the toast's remaining duration. */
  progress?: boolean;
  /** Optional title rendered above the message. */
  title?: string;
  /** Status type of the toast. Defaults to `info`. */
  type?: CToastType;
}

/**
 * Status type of a toast notification, selecting the accent colour and icon.
 */
export type CToastType = 'error' | 'info' | 'success' | 'warning';
