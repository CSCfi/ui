/**
 * The component groups by which the landing page's overview, the /components
 * page's sections and the side navigation list the components: every
 * standalone component (`useManifest().navComponents`) in exactly one group.
 * Grouping is how the docs present the library, not a fact about a component,
 * so it lives here and not in the manifest; tests/landing.spec.ts fails when
 * a standalone tag is in no group or in two, and when a group names a tag the
 * manifest lacks.
 */
export interface ComponentGroup {
  id: string;

  /** One line on what the group's components are for. */
  summary: string;

  /** Tag names, alphabetically (tests/landing.spec.ts checks). */
  tags: string[];
  title: string;
}

export const COMPONENT_GROUPS: ComponentGroup[] = [
  {
    id: 'forms',
    summary:
      'Value controls that submit with a native form, with labels, hints and error messages.',
    tags: [
      'c-autocomplete',
      'c-button-group',
      'c-checkbox',
      'c-color-picker',
      'c-date-picker',
      'c-file-upload',
      'c-message',
      'c-number-field',
      'c-otp-input',
      'c-radio-group',
      'c-select',
      'c-slider',
      'c-switch',
      'c-text-field',
      'c-time-picker',
      'c-tree-select',
    ],
    title: 'Forms',
  },
  {
    id: 'actions',
    summary: 'Buttons and links in every appearance and colour.',
    tags: ['c-button', 'c-icon-button', 'c-link'],
    title: 'Actions',
  },
  {
    id: 'layout',
    summary:
      'The dashboard layout and the pieces that organise a page around it.',
    tags: [
      'c-accordion',
      'c-breadcrumb',
      'c-card',
      'c-divider',
      'c-main',
      'c-navigation-button',
      'c-page',
      'c-pagination',
      'c-side-navigation',
      'c-steps',
      'c-tabs',
      'c-toolbar',
    ],
    title: 'Layout & navigation',
  },
  {
    id: 'overlays',
    summary: 'Menus, popovers, tooltips and modals anchored to their trigger.',
    tags: ['c-menu', 'c-modal', 'c-popover', 'c-tooltip'],
    title: 'Overlays',
  },
  {
    id: 'feedback',
    summary: 'Messages, status and progress, from a pill to a toast.',
    tags: [
      'c-alert',
      'c-badge',
      'c-loader',
      'c-progress-bar',
      'c-progress-circle',
      'c-spinner',
      'c-status',
      'c-toasts',
    ],
    title: 'Feedback & status',
  },
  {
    id: 'data',
    summary: 'Tables and lists for records, sortable and paged.',
    tags: ['c-data-table', 'c-list', 'c-table', 'c-tags'],
    title: 'Data display',
  },
  {
    id: 'sign-in',
    summary: 'The sign-in page of a CSC service and its identity providers.',
    tags: ['c-login-buttons', 'c-login-card'],
    title: 'Sign-in',
  },
  {
    id: 'brand',
    summary: 'The CSC logo and icons that take the colour of their text.',
    tags: ['c-csc-logo', 'c-icon'],
    title: 'Icons & brand',
  },
];
