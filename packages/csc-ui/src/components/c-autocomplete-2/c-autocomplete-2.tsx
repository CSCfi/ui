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
  Watch,
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

  private _inputElement: HTMLInputElement;

  private _inputId: string;

  private _preventDialogOpen = false;

  private _debounce = null;

  private get _id() {
    return this.hostId || `autocomplete_${CAutocomplete2._uniqueId}`;
  }

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
   * Show loading state
   */
  @Prop() loading = false;

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

  @State() statusText = '';

  @Listen('keydown', { passive: true })
  handleKeyDown(event: KeyboardEvent) {
    const alphanumeric = /^[0-9a-zA-Z ]+$/;

    if (event.key.match(alphanumeric) && event.key.length === 1) {
      if (!this.dropdownVisible) {
        this._dropdownElement.open();

        return;
      }

      this._inputElement.focus();

      return;
    }

    if (event.key === 'Escape') {
      this._preventDialogOpen = true;
      this._dropdownElement.close();
      this._inputElement.focus();

      return;
    }

    if (event.key === 'Tab') {
      this._dropdownElement.close();

      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (!this.dropdownVisible || this.currentIndex === null) {
        this.currentIndex = 0;
        this._dropdownElement.open();
        this._dropdownElement.focusItem(this.currentIndex);

        return;
      }

      this.currentIndex = Math.min(
        this.currentIndex + 1,
        this.optionElements.length - 1,
      );

      this._dropdownElement.focusItem(this.currentIndex);

      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (this.currentIndex === 0) {
        this._dropdownElement.close();
        this._inputElement.focus();
      }

      if (!this.dropdownVisible || this.currentIndex === null) {
        this.currentIndex = this.optionElements.length - 1;
        this._dropdownElement.open();
        this._dropdownElement.focusItem(this.currentIndex);

        return;
      }

      this.currentIndex = Math.max(this.currentIndex - 1, 0);

      this._dropdownElement.focusItem(this.currentIndex);
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      if (this.currentIndex === null) return;

      const isDisabled = this._dropdownElement.selectItem(this.currentIndex);

      if (isDisabled) return;

      this._preventDialogOpen = true;

      this._inputElement.focus();

      return;
    }

    if (event.key === 'Home' && this.dropdownVisible) {
      this.currentIndex = 0;
    }

    if (event.key === 'End' && this.dropdownVisible) {
      this.currentIndex = this.optionElements.length - 1;
    }
  }

  @Listen('dropdownStateChange')
  onDropdownStateChange(event: CustomEvent<boolean>) {
    const isOpen = event.detail;

    this.dropdownVisible = isOpen;

    if (!isOpen) {
      requestAnimationFrame(() => {
        this.currentIndex = null;
      });
    }
  }

  @Listen('selectOption')
  onSelectOption(event: CustomEvent<{ name: string; value: string }>) {
    this._dropdownElement.close();

    this.changeValue.emit(event.detail.value);

    this.changeQuery.emit(event.detail.name);
  }

  @Watch('query')
  handleQueryChange() {
    this._updateStatusText();
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

  private _onButtonKeyDown = (
    src: 'chevron' | 'reset',
    event: KeyboardEvent,
  ) => {
    event.stopPropagation();

    if (event.key !== 'Tab') event.preventDefault();

    if (['Enter', ' '].includes(event.key)) {
      if (src === 'chevron') {
        this._toggleDropdown(event);

        return;
      }

      this._reset(event);

      this._preventDialogOpen = true;

      this._inputElement.focus();
    }
  };

  private _renderLoader() {
    return <c-spinner color="var(--_c-autocomplete-active-color)" size={20} />;
  }

  private _renderChevron() {
    const classes = {
      'c-input-menu__chevron': true,
      'c-input-menu__chevron--active': this.dropdownVisible,
    };

    return (
      <c-icon-button
        size="x-small"
        class={classes}
        text
        onClick={(event) => this._toggleDropdown(event)}
        onKeyDown={(event) => this._onButtonKeyDown('chevron', event)}
      >
        <c-icon path={mdiChevronDown} size={24} />
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
      <c-icon-button
        aria-label=""
        size="x-small"
        text
        onClick={(event) => this._reset(event)}
        onKeyDown={(event) => this._onButtonKeyDown('reset', event)}
      >
        <c-icon path={mdiClose} size={20} />
      </c-icon-button>
    );
  }

  private _onInputFocus = () => {
    if (!this._preventDialogOpen) {
      this._dropdownElement.open();
    }

    this._updateStatusText();

    this._preventDialogOpen = false;
  };

  private _renderInputElement() {
    return (
      <div class="c-input-menu__input">
        <input
          type="text"
          ref={(el) => (this._inputElement = el)}
          aria-expanded={this.dropdownVisible.toString()}
          aria-owns={this._inputId + '-items'}
          aria-autocomplete="list"
          autocomplete="off"
          class="c-input__input"
          role="combobox"
          value={this.query}
          name={this.name ?? null}
          onInput={(event) => this._updateInput(event)}
          onFocus={() => this._onInputFocus()}
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

  private _updateStatusText() {
    if (this._debounce !== null) {
      clearTimeout(this._debounce);
      this._debounce = null;
    }

    this._debounce = window.setTimeout(() => {
      const ending = !!this.optionElements.length
        ? ' or navigate using the up and down arrows'
        : '';

      if (this.currentIndex === null) {
        this.statusText = this.optionElements.length
          ? `${this.optionElements.length} result${
              this.optionElements.length !== 1 ? 's' : ''
            } available`
          : 'No search results available';
      }

      if (this.query !== null) {
        this.statusText += ', input a search query to filter the results';
      }

      this._dropdownElement.setStatusText(this.statusText + ending);

      this._debounce = null;
    }, 1400);
  }

  render() {
    return (
      <Host>
        <c-dropdown-options
          ref={(el) => (this._dropdownElement = el)}
          id={`${this._id}-dropdown`}
          index={this.currentIndex}
          items-per-page={this.itemsPerPage}
          options={this.optionElements}
          parent={this.el}
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

              {this.loading && this._renderLoader()}

              {!this.loading && this.value && this._renderReset()}

              {!this.loading && !this.value && this._renderChevron()}

              <slot onSlotchange={() => this._handleSlotChange()}></slot>
            </div>

            <slot name="post" slot="post"></slot>
          </c-input>
        </c-dropdown-options>
      </Host>
    );
  }
}
