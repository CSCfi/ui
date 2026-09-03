import CAccordionItem from './components/c-accordion-item/CAccordionItem.vue';
import CAccordion from './components/c-accordion/CAccordion.vue';
import CAlert from './components/c-alert/CAlert.vue';
import CAutocomplete from './components/c-autocomplete/CAutocomplete.vue';
import CBadge from './components/c-badge/CBadge.vue';
import CButtonGroup from './components/c-button-group/CButtonGroup.vue';
import CButton from './components/c-button/CButton.vue';
import CCardActions from './components/c-card-actions/CCardActions.vue';
import CCardContent from './components/c-card-content/CCardContent.vue';
import CCardTitle from './components/c-card-title/CCardTitle.vue';
import CCard from './components/c-card/CCard.vue';
import CCheckbox from './components/c-checkbox/CCheckbox.vue';
import CCscLogo from './components/c-csc-logo/CCscLogo.vue';
import CDataTable from './components/c-data-table/CDataTable.vue';
import CDivider from './components/c-divider/CDivider.vue';
import CDropdown from './components/c-dropdown/CDropdown.vue';
import CIconButton from './components/c-icon-button/CIconButton.vue';
import CIcon from './components/c-icon/CIcon.vue';
import CInput from './components/c-input/CInput.vue';
import CLink from './components/c-link/CLink.vue';
import CListItemTitle from './components/c-list-item-title/CListItemTitle.vue';
import CListItem from './components/c-list-item/CListItem.vue';
import CList from './components/c-list/CList.vue';
import CLoader from './components/c-loader/CLoader.vue';
import CLoginButton from './components/c-login-button/CLoginButton.vue';
import CLoginButtons from './components/c-login-buttons/CLoginButtons.vue';
import CLoginCardActions from './components/c-login-card-actions/CLoginCardActions.vue';
import CLoginCardContent from './components/c-login-card-content/CLoginCardContent.vue';
import CLoginCardTitle from './components/c-login-card-title/CLoginCardTitle.vue';
import CLoginCard from './components/c-login-card/CLoginCard.vue';
import CMain from './components/c-main/CMain.vue';
import CMenuItem from './components/c-menu-item/CMenuItem.vue';
import CMenuLabel from './components/c-menu-label/CMenuLabel.vue';
import CMenu from './components/c-menu/CMenu.vue';
import CMessage from './components/c-message/CMessage.vue';
import CModal from './components/c-modal/CModal.vue';
import CNavigationButton from './components/c-navigation-button/CNavigationButton.vue';
import COptionValue from './components/c-option-value/COptionValue.vue';
import COption from './components/c-option/COption.vue';
import COtpInput from './components/c-otp-input/COtpInput.vue';
import CPage from './components/c-page/CPage.vue';
import CPagination from './components/c-pagination/CPagination.vue';
import CPopover from './components/c-popover/CPopover.vue';
import CProgressBar from './components/c-progress-bar/CProgressBar.vue';
import CProgressCircle from './components/c-progress-circle/CProgressCircle.vue';
import CRadioGroup from './components/c-radio-group/CRadioGroup.vue';
import CRadio from './components/c-radio/CRadio.vue';
import CSelect from './components/c-select/CSelect.vue';
import CSideNavigationItem from './components/c-side-navigation-item/CSideNavigationItem.vue';
import CSideNavigationTitle from './components/c-side-navigation-title/CSideNavigationTitle.vue';
import CSideNavigation from './components/c-side-navigation/CSideNavigation.vue';
import CSlider from './components/c-slider/CSlider.vue';
import CSpinner from './components/c-spinner/CSpinner.vue';
import CStatus from './components/c-status/CStatus.vue';
import CStep from './components/c-step/CStep.vue';
import CSteps from './components/c-steps/CSteps.vue';
import CSubNavigationItem from './components/c-sub-navigation-item/CSubNavigationItem.vue';
import CSwitch from './components/c-switch/CSwitch.vue';
import CTabButtons from './components/c-tab-buttons/CTabButtons.vue';
import CTabItem from './components/c-tab-item/CTabItem.vue';
import CTabItems from './components/c-tab-items/CTabItems.vue';
import CTab from './components/c-tab/CTab.vue';
import CTable from './components/c-table/CTable.vue';
import CTabs from './components/c-tabs/CTabs.vue';
import CTag from './components/c-tag/CTag.vue';
import CTags from './components/c-tags/CTags.vue';
import CTextField from './components/c-text-field/CTextField.vue';
import CToast from './components/c-toast/CToast.vue';
import CToasts from './components/c-toasts/CToasts.vue';
import CToolbar from './components/c-toolbar/CToolbar.vue';
import CTooltip from './components/c-tooltip/CTooltip.vue';
import { defineElement } from './shared/defineElement';

export type {
  CAlertIconType,
  CAlertProps,
  CAlertType,
} from './components/c-alert/CAlert.vue';

export type {
  CAutocompleteFilter,
  CAutocompleteItem,
  CAutocompleteOption,
  CAutocompleteProps,
} from './components/c-autocomplete/CAutocomplete.vue';

export type {
  CButtonGroupProps,
  CButtonGroupSize,
  CButtonGroupValue,
} from './components/c-button-group/CButtonGroup.vue';

export type {
  CButtonProps,
  CButtonSize,
  CButtonType,
} from './components/c-button/CButton.vue';

export type {
  CCardActionsAlign,
  CCardActionsJustify,
  CCardActionsProps,
} from './components/c-card-actions/CCardActions.vue';

export type {
  CDataTableAlign,
  CDataTableCellContent,
  CDataTableCellContext,
  CDataTableColumn,
  CDataTableColumnExpansion,
  CDataTableColumnPin,
  CDataTableExpandedContext,
  CDataTableFooterContext,
  CDataTableProps,
  CDataTableRow,
  CDataTableSelectionMode,
  CDataTableSort,
  CDataTableSortDirection,
  CDataTableTexts,
} from './components/c-data-table/CDataTable.vue';

export type {
  CIconButtonProps,
  CIconButtonSize,
} from './components/c-icon-button/CIconButton.vue';

export type {
  CLoginCardActionsAlign,
  CLoginCardActionsJustify,
  CLoginCardActionsProps,
} from './components/c-login-card-actions/CLoginCardActions.vue';

export type {
  CLoginCardBlendMode,
  CLoginCardProps,
} from './components/c-login-card/CLoginCard.vue';

export type {
  CPaginationOptions,
  CPaginationProps,
  CPaginationSize,
} from './components/c-pagination/CPagination.vue';

export type { CPopoverProps } from './components/c-popover/CPopover.vue';

export type { CProgressCircleProps } from './components/c-progress-circle/CProgressCircle.vue';

export type {
  CStatusProps,
  CStatusType,
} from './components/c-status/CStatus.vue';

export type {
  CTabButtonsProps,
  CTabButtonsSize,
} from './components/c-tab-buttons/CTabButtons.vue';

export type { CTabsJustify, CTabsProps } from './components/c-tabs/CTabs.vue';

export type { CTagProps, CTagSize } from './components/c-tag/CTag.vue';

export type { CTagsProps, CTagsSize } from './components/c-tags/CTags.vue';

export type {
  CTextFieldAutocapitalize,
  CTextFieldProps,
  CTextFieldType,
} from './components/c-text-field/CTextField.vue';

export type { CToastProps } from './components/c-toast/CToast.vue';

export type {
  CToastsHorizontal,
  CToastsProps,
  CToastsVertical,
} from './components/c-toasts/CToasts.vue';

export type { CTooltipProps } from './components/c-tooltip/CTooltip.vue';

// Typed element interfaces and the global HTMLElementTagNameMap augmentation
// (generated by scripts/analyzer/tag-map.mjs). Re-exported so framework-free
// TypeScript consumers get typed `createElement`/`querySelector` results and
// wrapper packages can anchor on the element types.
export type * from './tag-name-map';

// Runtime consumer theming: rebrand chromatic families by supplying their
// step-500 seed; the full ramp regenerates and re-themes every component in
// both light and dark mode.
export { applyTheme, resetTheme, themeToCss } from './theme/applyTheme';

export type { Family, ThemeSeeds } from './theme/applyTheme';

// Chart tokens as importable data (ADR-0040): the frozen series slots and
// anatomy roles per theme mode, in `oklch()` with a `#rrggbb` twin for chart
// libraries that do their own colour maths in sRGB. `themeMode()` resolves
// the mode on screen by the same cascade tokens.css uses.
export {
  chartAnatomy,
  chartAnatomyHex,
  chartSlots,
  chartSlotsHex,
} from './theme/chart-data';

export type { ChartAnatomy, ChartSlots } from './theme/chart-data';

// The built-in seeds and the themable family list, so a theme UI can start
// from the defaults instead of reading `--c-*-500` back off the document
// (token values are oklch() strings, ADR-0041 — not what a colour input takes).
export { DEFAULT_SEEDS, FAMILIES } from './theme/ramp.js';

export { themeMode } from './theme/themeMode';

export type { ThemeMode } from './theme/themeMode';

// Public component types, re-exported so consumers can import them
// from the package root: `import type { CAlertType } from '@cscfi/csc-ui'`.
// Shared types (value crosses a component boundary) come from src/types.ts;
// component-owned types come from their owning SFC.
export type {
  CFieldSize,
  CPlacement,
  CSelectItem,
  CToastMessage,
  CToastType,
} from './types';

// Vue's `h`, re-exported so consumers author c-data-table cell/footer/expanded
// render functions without a direct `vue` dependency.
export { h } from 'vue';

export type { VNode, VNodeChild } from 'vue';

/**
 * Map of custom-element tag → Vue SFC component. The single source of
 * truth for what `csc-ui` registers. As components are migrated,
 * they are added here.
 */
const components: Array<[string, unknown]> = [
  ['c-icon', CIcon],
  ['c-button', CButton],
  // c-tab-buttons (below) renders c-button-group in its shadow — the group
  // must be defined before the adapter upgrades.
  ['c-button-group', CButtonGroup],
  ['c-checkbox', CCheckbox],
  ['c-card', CCard],
  ['c-card-actions', CCardActions],
  ['c-card-content', CCardContent],
  ['c-card-title', CCardTitle],
  ['c-accordion', CAccordion],
  ['c-accordion-item', CAccordionItem],
  ['c-input', CInput],
  ['c-text-field', CTextField],
  ['c-spinner', CSpinner],
  ['c-loader', CLoader],
  ['c-icon-button', CIconButton],
  ['c-link', CLink],
  ['c-tag', CTag],
  ['c-tags', CTags],
  ['c-progress-bar', CProgressBar],
  ['c-progress-circle', CProgressCircle],
  ['c-radio', CRadio],
  ['c-radio-group', CRadioGroup],
  ['c-switch', CSwitch],
  ['c-csc-logo', CCscLogo],
  ['c-badge', CBadge],
  ['c-status', CStatus],
  ['c-toolbar', CToolbar],
  ['c-main', CMain],
  ['c-page', CPage],
  ['c-message', CMessage],
  ['c-alert', CAlert],
  ['c-toast', CToast],
  ['c-toasts', CToasts],
  ['c-modal', CModal],
  ['c-step', CStep],
  ['c-steps', CSteps],
  ['c-list', CList],
  ['c-list-item', CListItem],
  ['c-list-item-title', CListItemTitle],
  ['c-tabs', CTabs],
  ['c-tab', CTab],
  ['c-tab-buttons', CTabButtons],
  ['c-tab-items', CTabItems],
  ['c-tab-item', CTabItem],
  ['c-pagination', CPagination],
  ['c-navigation-button', CNavigationButton],
  ['c-side-navigation-title', CSideNavigationTitle],
  ['c-sub-navigation-item', CSubNavigationItem],
  ['c-side-navigation-item', CSideNavigationItem],
  ['c-side-navigation', CSideNavigation],
  ['c-login-card', CLoginCard],
  ['c-login-card-title', CLoginCardTitle],
  ['c-login-card-content', CLoginCardContent],
  ['c-login-card-actions', CLoginCardActions],
  ['c-login-button', CLoginButton],
  ['c-login-buttons', CLoginButtons],
  ['c-table', CTable],
  ['c-slider', CSlider],
  ['c-otp-input', COtpInput],
  // Dropdown stack: leaf elements must register before c-select so the
  // option/dropdown tags are defined when c-select renders them.
  ['c-option-value', COptionValue],
  ['c-option', COption],
  ['c-dropdown', CDropdown],
  ['c-select', CSelect],
  // c-autocomplete reuses c-option (registered above) as its data source and
  // builds its own popover panel; register after the option leaves.
  ['c-autocomplete', CAutocomplete],
  // Menu stack: leaf elements register before c-menu so item/label/divider
  // tags are defined when c-menu's slotted content upgrades.
  ['c-divider', CDivider],
  ['c-menu-label', CMenuLabel],
  ['c-menu-item', CMenuItem],
  ['c-menu', CMenu],
  // Anchor-positioned overlays on the same popover pattern as the menu
  // family (ADR-0008); no shadow-rendered children, so order is free.
  ['c-tooltip', CTooltip],
  ['c-popover', CPopover],
  // c-data-table renders c-checkbox, c-pagination (itself using c-menu),
  // c-icon-button, c-icon and c-button — register after all of them.
  ['c-data-table', CDataTable],
];

/**
 * Register all migrated components as custom elements. Idempotent; safe
 * to call multiple times. Tags already defined (e.g. by the Stencil
 * loader) are skipped silently.
 */
export function defineCustomElements(): void {
  for (const [tag, component] of components) {
    defineElement(tag, component as never);
  }
}

/** List of tags this package will register. Useful for docs/tests. */
export const migratedTags: ReadonlyArray<string> = components.map(([t]) => t);

/**
 * Tags converted to the tailwind-variants styling system.
 * Append a tag as each component is migrated. Used by the docs to mark
 * conversion progress in the side navigation.
 */
export const tailwindVariantTags: ReadonlyArray<string> = [
  'c-button',
  'c-accordion',
  'c-accordion-item',
  // Wave A — layout / wrapper components.
  'c-main',
  'c-page',
  'c-toolbar',
  'c-csc-logo',
  'c-icon',
  'c-card',
  'c-card-actions',
  'c-card-content',
  'c-card-title',
  'c-list',
  'c-list-item',
  'c-list-item-title',
  // Wave B — display / feedback components.
  'c-spinner',
  'c-loader',
  'c-icon-button',
  'c-link',
  'c-badge',
  'c-status',
  'c-tag',
  'c-tags',
  'c-alert',
  'c-message',
  'c-toast',
  'c-toasts',
  'c-progress-bar',
  'c-login-button',
  'c-login-buttons',
  'c-navigation-button',
  'c-side-navigation-title',
  'c-login-card',
  'c-login-card-title',
  'c-login-card-content',
  'c-login-card-actions',
  // Wave C — navigation / tabs / steps components.
  'c-tabs',
  'c-tab',
  'c-tab-buttons',
  'c-tab-items',
  'c-tab-item',
  'c-steps',
  'c-step',
  'c-pagination',
  'c-side-navigation',
  'c-side-navigation-item',
  'c-sub-navigation-item',
  // Wave D — form controls, modal, table (hybrid; heavy escape-hatch `<style>` blocks).
  'c-checkbox',
  'c-radio',
  'c-radio-group',
  'c-switch',
  'c-input',
  'c-text-field',
  'c-otp-input',
  'c-slider',
  'c-select',
  'c-option',
  'c-option-value',
  'c-dropdown',
  'c-autocomplete',
  'c-modal',
  'c-table',
  // Wave E — menu family (Popover API + CSS anchor positioning).
  'c-divider',
  'c-menu-label',
  'c-menu-item',
  'c-menu',
  // New components (born tailwind-variants; no Stencil-era styles to convert).
  'c-data-table',
  'c-button-group',
  'c-tooltip',
  'c-popover',
  'c-progress-circle',
];
