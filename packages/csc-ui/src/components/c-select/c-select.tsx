import {
  AttachInternals,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Watch,
  Listen,
  Method,
  Prop,
  State,
  h,
} from '@stencil/core';
import { CSelectItem } from '../../types';
import { mdiChevronDown, mdiClose } from '@mdi/js';

/**
 * @group Form
 * @slot Default slot - Use c-option elements only
 */
@Component({
  tag: 'c-select',
  styleUrl: 'c-select.scss',
  shadow: true,
  formAssociated: true,
})
export class CSelect {
  @Element() el: HTMLCSelectElement;

  // eslint-disable-next-line
  @AttachInternals() internals: ElementInternals;

  /**
   * Dropdown items
   */
  @Prop() items: CSelectItem[] = [];

  /**
   * Selected item
   */
  @Prop() value: string | number | CSelectItem = null;

  /**
   * Id of the element
   */
  @Prop({ attribute: 'id' }) hostId: string;

  /**
   * Make the selected value clearable
   */
  @Prop() clearable = false;

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
   * Return object instead of value
   */
  @Prop() returnObject = false;

  /**
   * Items per page before adding scroll
   */
  @Prop() itemsPerPage = 6;

  /**
   * display the option as selection (works only when c-option elements are used)
   */
  @Prop() optionAsSelection: false;

  /**
   * Triggered when option is selected
   */
  @Event({ bubbles: false, eventName: 'change-value' })
  changeValue: EventEmitter;

  @State() optionElements: NodeListOf<HTMLCOptionElement>;

  @State() currentIndex: number = null;

  @State() dropdownVisible = false;

  @State() statusText = '';

  @State() optionElementsExist = false;

  private static _uniqueId = 0;

  private _dropdownElement: HTMLCDropdownElement;

  private _inputElement: HTMLInputElement;

  private _cInputElement: HTMLCInputElement;

  private _selectionElement: HTMLDivElement;

  private _inputId: string;

  private _preventDialogOpen = false;

  private _debounce = null;

  private _lastKeyPressTime = null;

  private _searchString = '';

  private get _id() {
    return this.hostId || `select_${CSelect._uniqueId}`;
  }

  private get _items() {
    return this.optionElementsExist ? this.optionElements : this.items;
  }

  private get _value() {
    if (!this.value) return '';

    if (
      !this.returnObject &&
      !['number', 'string'].includes(typeof this.value)
    ) {
      console.warn(
        `[C-SELECT] The value should be of type 'number' or 'string' when return-object is not used.`,
      );

      return '';
    }

    if (
      !this.returnObject &&
      ['number', 'string'].includes(typeof this.value)
    ) {
      return Array.from(this._items)?.find((item) => item.value === this.value)
        ?.name;
    }

    return Array.from(this._items as CSelectItem[])?.find(
      (item) => item.value === (this.value as CSelectItem).value,
    )?.name;
  }

  /**
   * Reset select state
   */
  @Method()
  async reset() {
    this.changeValue.emit(null);

    this.internals.setFormValue(null);

    this._dropdownElement.updateList();
  }

  @Listen('keydown', { passive: true })
  handleKeyDown(event: KeyboardEvent) {
    const alphanumeric = /^[0-9a-zA-Z ]+$/;

    if (this.disabled) return;

    if (event.key.match(alphanumeric) && event.key.length === 1) {
      if (this.dropdownVisible) return;

      if (Date.now() - this._lastKeyPressTime > 3000) {
        this._searchString = event.key;
      } else {
        this._searchString += event.key;
      }

      this._lastKeyPressTime = Date.now();

      const selectionIndex = Array.from(this._items).findIndex((i) =>
        i.name.toLowerCase().startsWith(this._searchString),
      );

      this.currentIndex = selectionIndex >= 0 ? selectionIndex : null;

      if (this.currentIndex !== null) {
        this._dropdownElement.selectItem(this.currentIndex);
      }

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
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (!this._items.length) return;

      if (!this.dropdownVisible) {
        this._dropdownElement.open();
      }

      this.currentIndex =
        this.currentIndex === null
          ? 0
          : Math.min(this.currentIndex + 1, this._items.length - 1);

      this._dropdownElement.focusItem(this.currentIndex);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (this.currentIndex === 0) {
        this._dropdownElement.close();
        this._inputElement.focus();
      }

      if (!this.dropdownVisible) {
        this._dropdownElement.open();
      }

      this.currentIndex =
        this.currentIndex === null
          ? this._items.length - 1
          : Math.max(this.currentIndex - 1, 0);

      this._dropdownElement.focusItem(this.currentIndex);
    }

    if (event.key === ' ') {
      event.preventDefault();
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      if (this.currentIndex === null) return;

      this._dropdownElement.selectItem(this.currentIndex);
    }

    if (event.key === 'Home' && this.dropdownVisible) {
      this.currentIndex = 0;
    }

    if (event.key === 'End' && this.dropdownVisible) {
      this.currentIndex = this._items.length - 1;
    }
  }

  @Listen('dropdownStateChange')
  onDropdownStateChange(event: CustomEvent<boolean>) {
    const isOpen = event.detail;

    this.dropdownVisible = isOpen;
  }

  @Watch('value')
  onValueChanged(v) {
    if (!this.value && this.optionAsSelection) {
      this._selectionElement?.replaceChildren();
    }

    console.log('VALUE VAIHTUS', v);

    this._selectOption(this.returnObject ? v : { name: v, value: v });
  }

  @Listen('selectOption')
  onSelectOption(event: CustomEvent<{ name: string; value: string }>) {
    this._setValue(event.detail);
  }

  private _selectOption({ value, name }: { value: string; name: string }) {
    console.log('selecteerataan', value, name);
    this._dropdownElement.close();

    const selection = this._setCurrentIndex({ name, value });

    if (this.optionElementsExist && this.optionAsSelection && selection) {
      const clone = (selection as HTMLCOptionElement).cloneNode(true);

      this._selectionElement.classList.add('c-input-menu__selection--show');
      this._selectionElement.replaceChildren(clone);
    }

    this._dropdownElement.updateList();

    this._preventDialogOpen = true;

    this._inputElement.focus();
  }

  private _setValue({ value, name }: { value: string; name: string }) {
    this.value = this.returnObject ? { name, value } : value;

    this.changeValue.emit(this.value);

    this.internals.setFormValue(value);
  }

  private _setCurrentIndex({ value, name }: { value: string; name: string }) {
    let selection: HTMLCOptionElement | CSelectItem | null = null;

    Array.from(this._items).forEach((item, index) => {
      const selected = item.value === value && item.name === name;

      if (this.optionElementsExist) {
        (item as HTMLCOptionElement).selected = selected;
      }

      if (selected) {
        this.currentIndex = index;

        selection = item;
      }
    });

    return selection;
  }

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

      this._onReset(event);

      this._preventDialogOpen = true;

      requestAnimationFrame(() => {
        this._inputElement.focus();
      });
    }
  };

  private _onSlotChange = () => {
    this.optionElements = this.el.querySelectorAll('c-option');

    if (this.optionElements.length && !this.optionElementsExist) {
      this.optionElementsExist = true;
    }

    const selection = Array.from(this.optionElements).find(
      (option) => option.selected,
    );

    if (selection) {
      this.value = this.returnObject
        ? { name: selection.name, value: selection.value }
        : selection.value;

      this.changeValue.emit(this.value);

      this.internals.setFormValue(selection.value.toString());
    }
  };

  private _onReset = (event) => {
    event.stopPropagation();

    this.changeValue.emit(null);

    this.internals.setFormValue(null);

    this._selectionElement.classList.remove('c-input-menu__selection--show');
    this._selectionElement.replaceChildren(null);

    this._preventDialogOpen = true;

    this._cInputElement.reset();

    this._inputElement.focus();

    this._dropdownElement.updateList();
  };

  private _updateInput() {
    this._dropdownElement.open();

    this._dropdownElement.updateList();
  }

  private _updateStatusText() {
    if (this._debounce !== null) {
      clearTimeout(this._debounce);
      this._debounce = null;
    }

    this._debounce = window.setTimeout(() => {
      this.statusText = '';

      if (this.currentIndex === null) {
        this.statusText = this._items.length
          ? `${this._items.length} option${
              this._items.length !== 1 ? 's' : ''
            } available`
          : 'No options available';
      }

      const ending = !!this._items.length
        ? ', navigate using the up and down arrows'
        : '';

      this._dropdownElement.setStatusText(this.statusText + ending);

      this._debounce = null;
    }, 1400);
  }

  private _onInputFocus = () => {
    if (this.disabled) return;

    if (!this._preventDialogOpen) {
      this._dropdownElement.open();
    }

    this._updateStatusText();

    this._preventDialogOpen = false;
  };

  componentWillLoad() {
    CSelect._uniqueId += 1;

    this._inputId =
      'input_' +
      (this.hostId || this.label || this.placeholder).replace(
        /[^a-zA-Z0-9-_]/g,
        '',
      );
  }

  componentDidLoad() {
    if (!this.value) return;

    const selection = Array.from(this._items).find((item) => {
      if (this.returnObject) {
        return (
          item.name === (this.value as CSelectItem).name &&
          item.value === (this.value as CSelectItem).value
        );
      }

      return item.value === this.value;
    });

    if (selection) {
      this._setCurrentIndex({
        name: selection.name,
        value: selection.value.toString(),
      });
    }
  }

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
        disabled={this.disabled}
        text
        onClick={(event) => this._toggleDropdown(event)}
        onKeyDown={(event) => this._onButtonKeyDown('chevron', event)}
      >
        <c-icon path={mdiChevronDown} size={24} />
      </c-icon-button>
    );
  }

  private _renderInputElement() {
    return (
      <div class="c-input-menu__input">
        <input
          type="text"
          readonly
          ref={(el) => (this._inputElement = el)}
          aria-expanded={this.dropdownVisible.toString()}
          aria-owns={this._inputId + '-items'}
          aria-autocomplete="list"
          autocomplete="off"
          class="c-input__input"
          role="combobox"
          value={this._value}
          name={this.name ?? null}
          disabled={this.disabled}
          onInput={() => this._updateInput()}
          onFocus={() => this._onInputFocus()}
        />

        <div
          ref={(el) => (this._selectionElement = el)}
          class="c-input-menu__selection"
        />
      </div>
    );
  }

  private _renderReset() {
    return (
      <c-icon-button
        aria-label=""
        size="x-small"
        disabled={this.disabled}
        text
        onClick={(event) => this._onReset(event)}
        onKeyDown={(event) => this._onButtonKeyDown('reset', event)}
      >
        <c-icon path={mdiClose} size={20} />
      </c-icon-button>
    );
  }

  render() {
    const itemType = this.optionElementsExist ? 'option' : 'item';

    return (
      <Host>
        <c-dropdown
          ref={(el) => (this._dropdownElement = el)}
          id={`${this._id}-dropdown`}
          index={this.currentIndex}
          items-per-page={this.itemsPerPage}
          dropdown-item-type={itemType}
          items={this._items as NodeListOf<HTMLCOptionElement> & CSelectItem[]}
          parent={this.el}
          type="select"
        >
          <c-input
            slot="default"
            ref={(el) => (this._cInputElement = el)}
            active={this.dropdownVisible}
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
            value={this.value}
            variant="select"
            onClick={() => !this.disabled && this._dropdownElement.open()}
          >
            <slot name="pre" slot="pre"></slot>

            <div class="c-input__content">
              {this._renderInputElement()}

              {this.loading && this._renderLoader()}

              {!this.loading &&
                this.value &&
                this.clearable &&
                this._renderReset()}

              {!this.loading &&
                (!this.value || !this.clearable) &&
                this._renderChevron()}

              <slot onSlotchange={() => this._onSlotChange()}></slot>
            </div>

            <slot name="post" slot="post"></slot>
          </c-input>
        </c-dropdown>
      </Host>
    );
  }
}
