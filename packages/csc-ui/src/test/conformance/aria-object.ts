/**
 * Where a host's ARIA id references (`aria-labelledby`, `aria-describedby`, …)
 * reach each tag's accessible object (ADR-0078). Every tag not listed here
 * hands them to the element in its shadow tree that carries its role
 * (`useIdReferences`); the all-components suite asserts it in both
 * directions, so a new tag either does that or is listed with its reason.
 */

/** The host carries the role itself, so its id references already work. */
export const HOST_ARIA_OBJECT: readonly string[] = [
  'c-list-item',
  'c-tab',
  'c-tab-item',
  'c-tag',
];

/** No accessible object that a page names or describes by id. */
export const NO_ARIA_OBJECT: readonly string[] = [
  // Decoration: an image or indicator named by `aria-label` alone.
  'c-badge',
  'c-csc-logo',
  'c-divider',
  'c-icon',
  'c-loader',
  'c-spinner',
  'c-status',
  // Text and layout inside another component, or a plain container.
  'c-accordion',
  'c-card-actions',
  'c-card-content',
  'c-card-title',
  'c-list',
  'c-list-item-title',
  'c-login-buttons',
  'c-login-card-actions',
  'c-login-card-content',
  'c-login-card-title',
  'c-menu-label',
  'c-page',
  'c-side-navigation-title',
  'c-step',
  'c-steps',
  'c-tab-items',
  'c-table',
  'c-toolbar',
  // Internal parts, wired by their parent.
  'c-dropdown',
  'c-input',
  'c-option',
  'c-option-value',
  'c-tab-buttons',
  'c-toast',
  // Announces its own content, or describes its trigger (ADR-0033).
  'c-alert',
  'c-message',
  'c-toasts',
  'c-tooltip',
  // A menu names itself after its slotted trigger; its items are rows of it.
  'c-menu',
  'c-menu-item',
];
