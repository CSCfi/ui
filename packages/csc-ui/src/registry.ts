import CAccordionItem from './components/c-accordion-item/CAccordionItem.vue';
import CAccordion from './components/c-accordion/CAccordion.vue';
import CAlert from './components/c-alert/CAlert.vue';
import CAutocomplete from './components/c-autocomplete/CAutocomplete.vue';
import CBadge from './components/c-badge/CBadge.vue';
import CBreadcrumbItem from './components/c-breadcrumb-item/CBreadcrumbItem.vue';
import CBreadcrumb from './components/c-breadcrumb/CBreadcrumb.vue';
import CButtonGroup from './components/c-button-group/CButtonGroup.vue';
import CButton from './components/c-button/CButton.vue';
import CCardActions from './components/c-card-actions/CCardActions.vue';
import CCardContent from './components/c-card-content/CCardContent.vue';
import CCardTitle from './components/c-card-title/CCardTitle.vue';
import CCard from './components/c-card/CCard.vue';
import CCheckbox from './components/c-checkbox/CCheckbox.vue';
import CColorPicker from './components/c-color-picker/CColorPicker.vue';
import CCscLogo from './components/c-csc-logo/CCscLogo.vue';
import CDataTable from './components/c-data-table/CDataTable.vue';
import CDatePicker from './components/c-date-picker/CDatePicker.vue';
import CDivider from './components/c-divider/CDivider.vue';
import CDropdown from './components/c-dropdown/CDropdown.vue';
import CFileUpload from './components/c-file-upload/CFileUpload.vue';
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
import CNumberField from './components/c-number-field/CNumberField.vue';
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
import CTimePicker from './components/c-time-picker/CTimePicker.vue';
import CToast from './components/c-toast/CToast.vue';
import CToasts from './components/c-toasts/CToasts.vue';
import CToolbar from './components/c-toolbar/CToolbar.vue';
import CTooltip from './components/c-tooltip/CTooltip.vue';
import CTreeSelect from './components/c-tree-select/CTreeSelect.vue';

/**
 * Map of custom-element tag → Vue SFC component: the single source of truth
 * for what `csc-ui` registers, internal tags included, in registration order.
 * Not part of the package entry (the manifest lists the public tags); the
 * conformance suites enrol every tag from it.
 */
export const components: ReadonlyArray<readonly [string, unknown]> = [
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
  // c-number-field renders c-input (registered above) inside its shadow root.
  ['c-number-field', CNumberField],
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
  // c-tree-select renders c-input, c-icon-button and c-icon (all registered
  // above) inside its shadow root and takes its tree from `items` only.
  ['c-tree-select', CTreeSelect],
  // c-date-picker renders c-input, c-icon-button and c-icon (all registered
  // above) inside its shadow root.
  ['c-date-picker', CDatePicker],
  // c-time-picker renders c-input, c-icon-button and c-icon (all registered
  // above) inside its shadow root.
  ['c-time-picker', CTimePicker],
  // c-color-picker renders c-input, c-icon-button and c-icon (all registered
  // above) inside its shadow root.
  ['c-color-picker', CColorPicker],
  // c-file-upload renders no c-* children; its rows use native buttons.
  ['c-file-upload', CFileUpload],
  // Menu stack: leaf elements register before c-menu so item/label/divider
  // tags are defined when c-menu's slotted content upgrades.
  ['c-divider', CDivider],
  ['c-menu-label', CMenuLabel],
  ['c-menu-item', CMenuItem],
  ['c-menu', CMenu],
  // Breadcrumb: crumbs register before c-breadcrumb, which measures them to
  // fold the overflow into its own popover panel (ADR-0067).
  ['c-breadcrumb-item', CBreadcrumbItem],
  ['c-breadcrumb', CBreadcrumb],
  // Anchor-positioned overlays on the same popover pattern as the menu
  // family (ADR-0008); no shadow-rendered children, so order is free.
  ['c-tooltip', CTooltip],
  ['c-popover', CPopover],
  // c-data-table renders c-checkbox, c-pagination (itself using c-menu),
  // c-icon-button, c-icon and c-button — register after all of them.
  ['c-data-table', CDataTable],
];

/** Every tag `defineCustomElements()` registers, internal ones included. */
export const registeredTags: ReadonlyArray<string> = components.map(([t]) => t);
