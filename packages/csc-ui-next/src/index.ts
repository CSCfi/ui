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
