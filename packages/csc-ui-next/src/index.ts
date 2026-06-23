import { defineElement } from './shared/defineElement';
import CIcon from './components/c-icon/CIcon.vue';
import CButton from './components/c-button/CButton.vue';
import CCheckbox from './components/c-checkbox/CCheckbox.vue';
import CCard from './components/c-card/CCard.vue';
import CCardActions from './components/c-card-actions/CCardActions.vue';
import CCardContent from './components/c-card-content/CCardContent.vue';
import CCardTitle from './components/c-card-title/CCardTitle.vue';
import CAccordion from './components/c-accordion/CAccordion.vue';
import CAccordionItem from './components/c-accordion-item/CAccordionItem.vue';
import CInput from './components/c-input/CInput.vue';
import CTextField from './components/c-text-field/CTextField.vue';
import CSpinner from './components/c-spinner/CSpinner.vue';
import CLoader from './components/c-loader/CLoader.vue';
import CIconButton from './components/c-icon-button/CIconButton.vue';
import CLink from './components/c-link/CLink.vue';
import CTag from './components/c-tag/CTag.vue';
import CTags from './components/c-tags/CTags.vue';
import CProgressBar from './components/c-progress-bar/CProgressBar.vue';
import CRadio from './components/c-radio/CRadio.vue';
import CRadioGroup from './components/c-radio-group/CRadioGroup.vue';
import CSwitch from './components/c-switch/CSwitch.vue';
import CSpacer from './components/c-spacer/CSpacer.vue';
import CCscLogo from './components/c-csc-logo/CCscLogo.vue';
import CBadge from './components/c-badge/CBadge.vue';
import CStatus from './components/c-status/CStatus.vue';
import CRow from './components/c-row/CRow.vue';
import CToolbar from './components/c-toolbar/CToolbar.vue';
import CMain from './components/c-main/CMain.vue';
import CPage from './components/c-page/CPage.vue';
import CMessage from './components/c-message/CMessage.vue';
import CAlert from './components/c-alert/CAlert.vue';
import CToast from './components/c-toast/CToast.vue';
import CToasts from './components/c-toasts/CToasts.vue';
import CBackdrop from './components/c-backdrop/CBackdrop.vue';
import CModal from './components/c-modal/CModal.vue';
import CStep from './components/c-step/CStep.vue';
import CSteps from './components/c-steps/CSteps.vue';
import CList from './components/c-list/CList.vue';
import CListItem from './components/c-list-item/CListItem.vue';
import CListItemTitle from './components/c-list-item-title/CListItemTitle.vue';
import CTabs from './components/c-tabs/CTabs.vue';
import CTab from './components/c-tab/CTab.vue';
import CTabButtons from './components/c-tab-buttons/CTabButtons.vue';
import CTabItems from './components/c-tab-items/CTabItems.vue';
import CTabItem from './components/c-tab-item/CTabItem.vue';
import CPagination from './components/c-pagination/CPagination.vue';
import CNavigationButton from './components/c-navigation-button/CNavigationButton.vue';
import CSideNavigationTitle from './components/c-side-navigation-title/CSideNavigationTitle.vue';
import CSubNavigationItem from './components/c-sub-navigation-item/CSubNavigationItem.vue';
import CSideNavigationItem from './components/c-side-navigation-item/CSideNavigationItem.vue';
import CSideNavigation from './components/c-side-navigation/CSideNavigation.vue';
import CLoginCard from './components/c-login-card/CLoginCard.vue';
import CLoginCardTitle from './components/c-login-card-title/CLoginCardTitle.vue';
import CLoginCardContent from './components/c-login-card-content/CLoginCardContent.vue';
import CLoginCardActions from './components/c-login-card-actions/CLoginCardActions.vue';
import CLoginButton from './components/c-login-button/CLoginButton.vue';
import CLoginButtons from './components/c-login-buttons/CLoginButtons.vue';
import CRipple from './components/c-ripple/CRipple.vue';
import CTable from './components/c-table/CTable.vue';
import CSwiperTab from './components/c-swiper-tab/CSwiperTab.vue';
import CSwiper from './components/c-swiper/CSwiper.vue';
import CSlider from './components/c-slider/CSlider.vue';
import COtpInput from './components/c-otp-input/COtpInput.vue';
import COptionValue from './components/c-option-value/COptionValue.vue';
import COption from './components/c-option/COption.vue';
import CDropdown from './components/c-dropdown/CDropdown.vue';
import CSelect from './components/c-select/CSelect.vue';

/**
 * Map of custom-element tag → Vue SFC component. The single source of
 * truth for what `csc-ui-next` registers. As components are migrated,
 * they are added here.
 */
const components: Array<[string, unknown]> = [
  ['c-icon', CIcon],
  ['c-button', CButton],
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
  ['c-radio', CRadio],
  ['c-radio-group', CRadioGroup],
  ['c-switch', CSwitch],
  ['c-spacer', CSpacer],
  ['c-csc-logo', CCscLogo],
  ['c-badge', CBadge],
  ['c-status', CStatus],
  ['c-row', CRow],
  ['c-toolbar', CToolbar],
  ['c-backdrop', CBackdrop],
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
  ['c-ripple', CRipple],
  ['c-table', CTable],
  ['c-swiper-tab', CSwiperTab],
  ['c-swiper', CSwiper],
  ['c-slider', CSlider],
  ['c-otp-input', COtpInput],
  // Dropdown stack: leaf elements must register before c-select so the
  // option/dropdown tags are defined when c-select renders them.
  ['c-option-value', COptionValue],
  ['c-option', COption],
  ['c-dropdown', CDropdown],
  ['c-select', CSelect],
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
