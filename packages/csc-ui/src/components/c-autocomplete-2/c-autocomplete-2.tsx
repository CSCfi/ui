import {
  Component,
  Host,
  h,
  Prop,
  State,
  Element,
  Event,
  EventEmitter,
  Listen,
} from '@stencil/core';
import { CAutocompleteItem } from '../../types';
import { mdiChevronDown, mdiClose } from '@mdi/js';

@Component({
  tag: 'c-autocomplete-2',
  styleUrl: 'c-autocomplete-2.scss',
  shadow: true,
})
export class CAutocomplete2 {
  @Element() el: HTMLCAutocomplete2Element;

  private static _uniqueId = 0;

  private _dropdownElement: HTMLCDropdownOptionsElement;

  // private _inputElement: HTMLInputElement;

  private _inputId: string;

  /**
   * Selected item
   */
  @Prop() value: string | number | CAutocompleteItem = null;

  /**
   * Search string
   */
  @Prop() query: string = null;

  /**
   * Id of the element
   */
  @Prop({ attribute: 'id' }) hostId: string;

  /**
   * Disable the input
   */
  @Prop() disabled = false;

  /**
   * Element label
   */
  @Prop() label: string;

  /**
   * Input field name
   */
  @Prop() name: string;

  /**
   * Placeholder text
   */
  @Prop() placeholder = '';

  /**
   * Hide the hint and error messages
   */
  @Prop() hideDetails = false;

  /**
   * Hint text for the input
   */
  @Prop() hint = '';

  /**
   * Show required validation
   */
  @Prop() required = false;

  /**
   * Set the validíty of the input
   */
  @Prop() valid = true;

  /**
   * Manual validation
   */
  @Prop() validate = false;

  /**
   * Validate the input on blur
   */
  @Prop() validateOnBlur = false;

  /**
   * Custom validation message
   */
  @Prop() validation = 'Required field';

  /**
   * Shadow variant
   */
  @Prop() shadow = false;

  /**
   * Triggered when text is typed
   */
  @Event() changeQuery: EventEmitter;

  /**
   * Triggered when option is selected
   */
  @Event({ bubbles: false }) changeValue: EventEmitter;

  /**
   * Items per page before adding scroll
   */
  @Prop() itemsPerPage: number;

  @State() optionElements: NodeListOf<HTMLCOptionElement>;

  @State() currentIndex: number = null;

  @State() dropdownVisible = false;

  @Listen('dropdownStateChange')
  onDropdownStateChange(event: CustomEvent<boolean>) {
    this.dropdownVisible = event.detail;
  }

  @Listen('selectOption')
  onSelectOption(event: CustomEvent<{ name: string; value: string }>) {
    this._dropdownElement.close();

    this.changeValue.emit(event.detail.value);

    this.changeQuery.emit(event.detail.name);
  }

  private _updateInput(event: InputEvent) {
    this._dropdownElement.open();

    this.query = (event.target as HTMLInputElement).value;

    this.changeQuery.emit(this.query);

    this._dropdownElement.updateList();
  }

  private _handleSlotChange = () => {
    this.optionElements = this.el.querySelectorAll('c-option');
  };

  private _toggleDropdown = (event) => {
    event.stopPropagation();

    if (this.dropdownVisible) {
      this._dropdownElement.close();

      return;
    }

    this._dropdownElement.open();
  };

  private _renderChevron() {
    const classes = {
      'c-input-menu__chevron': true,
      'c-input-menu__chevron--active': this.dropdownVisible,
    };

    return (
      <c-icon-button
        text
        size="small"
        class={classes}
        onClick={(event) => this._toggleDropdown(event)}
      >
        <c-icon path={mdiChevronDown} />
      </c-icon-button>
    );
  }

  private _reset = (event) => {
    event.stopPropagation();

    this.query = '';

    this.changeValue.emit(null);

    this.changeQuery.emit('');

    this._dropdownElement.updateList();
  };

  private _renderReset() {
    return (
      <c-icon-button text size="small" onClick={(event) => this._reset(event)}>
        <c-icon path={mdiClose} />
      </c-icon-button>
    );
  }

  private _renderInputElement() {
    return (
      <div class="c-input-menu__input">
        <input
          type="text"
          // ref={(el) => (this._inputElement = el)}
          aria-expanded={this.dropdownVisible.toString()}
          aria-owns={this._inputId + '-items'}
          aria-autocomplete="list"
          autocomplete="off"
          class="c-input__input"
          role="combobox"
          value={this.query}
          name={this.name ?? null}
          onInput={(event) => this._updateInput(event)}
          onFocus={() => this._dropdownElement.open()}
        />
      </div>
    );
  }

  componentWillLoad() {
    CAutocomplete2._uniqueId += 1;

    this._inputId =
      'input_' +
      (this.hostId || this.label || this.placeholder).replace(
        /[^a-zA-Z0-9-_]/g,
        '',
      );
  }

  render() {
    return (
      <Host>
        <c-dropdown-options
          ref={(el) => (this._dropdownElement = el)}
          options={this.optionElements}
          items-per-page={this.itemsPerPage}
          parent={this.el}
          index={this.currentIndex}
        >
          <c-input
            slot="default"
            disabled={this.disabled}
            hide-details={this.hideDetails}
            hint={this.hint}
            id={this.hostId}
            input-id={this._inputId}
            label={this.label}
            name={this.name}
            placeholder={this.placeholder}
            required={this.required}
            shadow={this.shadow}
            valid={this.valid}
            validate={this.validate}
            validate-on-blur={this.validateOnBlur}
            validation={this.validation}
            value={this.query}
            variant="select"
          >
            <slot name="pre" slot="pre"></slot>

            <div class="c-input__content">
              {this._renderInputElement()}
              {this.value ? this._renderReset() : this._renderChevron()}
              <slot onSlotchange={() => this._handleSlotChange()}></slot>
            </div>

            <slot name="post" slot="post"></slot>
          </c-input>
        </c-dropdown-options>
      </Host>
    );
  }
}
