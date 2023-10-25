import {
  AttachInternals,
  Component,
  Element,
  Host,
  Prop,
  State,
  h,
  Listen,
  Event,
  EventEmitter,
  Watch,
  Method,
} from '@stencil/core';
import { mdiChevronDown } from '@mdi/js';
import { CSelectItem } from '../../types';

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
  // eslint-disable-next-line
  @AttachInternals() internals: ElementInternals;

  /**
   * Auto focus the input
   */
  @Prop() autofocus = false;

  /**
   * Disable the input
   */
  @Prop() disabled = false;

  /**
   * Hide the hint and error messages
   */
  @Prop() hideDetails = false;

  /**
   * Hint text for the input
   */
  @Prop() hint = '';

  /**
   * Id of the element
   */
  @Prop({ attribute: 'id' }) hostId: string;

  /**
   * Element label
   */
  @Prop() label: string;

  /**
   * Shadow variant
   */
  @Prop() shadow = false;

  /**
   * Input field name
   */
  @Prop() name: string;

  /**
   * Set as required
   */
  @Prop() required = false;

  /**
   * Return only the item value rather than the whole item object
   */
  @Prop() returnValue: false;

  /**
   * Set the validity of the input
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
   * Items per page before adding scroll
   */
  @Prop() itemsPerPage = 6;

  /**
   * Placeholder text
   */
  @Prop() placeholder = '';

  /**
   * Selected item
   */
  @Prop({ mutable: true }) value: string | number | boolean | CSelectItem =
    null;

  /**
   * selectable items
   */
  @Prop() items: CSelectItem[] = [];

  /**
   * display the option as selection (works only when c-option elements are used)
   */
  @Prop() optionAsSelection: false;

  /**
   * Triggered when an item is selected
   */
  @Event({ bubbles: false }) changeValue: EventEmitter;

  @Element() host: HTMLCSelectElement;

  @State() menuVisible = false;

  @State() currentIndex: number = null;

  @State() activeListItemId: string = null;

  @State() statusText = '';

  @State() hasOptionItems = false;

  @State() previousValue: CSelectItem = { value: '', name: '' };

  private _itemRefs: { value: string | number | boolean; ref: HTMLElement }[] =
    [];

  private _id: string;

  private _cOptionElements: Record<string, HTMLCOptionElement> = {};

  private _selectionElement: HTMLDivElement;

  private _cInput: HTMLCInputElement;

  private _outerWrapperClasses = ['outer-wrapper'];

  private static _uniqueId = 0;

  private _validationClasses = ['validation-message'];

  private _debounce = null;

  private _observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          entry.target.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
          });
          observer.unobserve(entry.target);
        } else {
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 1 },
  );

  @Watch('value')
  onValueChange() {
    if (!this.value) return;

    const realValue = !(this.value as CSelectItem)?.value
      ? this._items.find((item) => item.value === this.value)
      : this.value;

    this._valueChangedHandler(realValue as CSelectItem);
  }

  @Watch('validate')
  validateChange(newValue: boolean) {
    if (newValue) {
      this._runValidate();
    }
  }

  @Watch('currentIndex')
  onCurrentIndexChange(index: number) {
    this.activeListItemId = this._itemRefs[index]?.ref?.id ?? null;

    this._scrollToElement();

    this._updateStatusText();
  }

  private get _items() {
    return this.hasOptionItems ? this._optionItems : this.items;
  }

  private _setValue(item: CSelectItem) {
    return this.returnValue
      ? item?.value
      : {
          name: item?.name,
          value: item?.value,
        };
  }

  private _valueChangedHandler(item: CSelectItem) {
    if (this.hasOptionItems && this.optionAsSelection) {
      const selection = this._cOptionElements[item.value.toString()];

      if (!selection) return;

      const clone = selection.cloneNode(true);

      this._selectionElement.classList.add('c-input-menu__selection--show');
      this._selectionElement.replaceChildren(clone);
    }

    this.currentIndex = this._items.findIndex(
      (element) => element.value === item?.value,
    );

    const value = this._setValue(item);

    if (this.previousValue && this.previousValue?.value === item?.value) return;

    this.previousValue = item;

    this.changeValue.emit(value);

    this.internals.setFormValue(item.value as string);
  }

  private _getLabel() {
    if (!this.value) return '';

    if (
      this.returnValue &&
      ['number', 'string', 'boolean'].includes(typeof this.value)
    ) {
      return this._items?.find((item) => item.value === this.value)?.name;
    }

    return this._items?.find(
      (item) => item.value === (this.value as CSelectItem).value,
    )?.name;
  }

  private _scrollToElement() {
    if (this._items.length > this.itemsPerPage) {
      const itemRef = this._itemRefs.find(
        (item) => item.value === this._items[this.currentIndex]?.value,
      )?.ref;

      if (!!itemRef) {
        this._observer.observe(itemRef);
      }
    }
  }

  @Listen('keydown', { capture: true })
  handleKeyDown(ev: KeyboardEvent) {
    if (this.disabled) return;

    const letterNumber = /^[0-9a-zA-Z]+$/;

    if (ev.key.match(letterNumber) && ev.key.length === 1) {
      if (
        Date.now() - this._lastKeyPressTime > 3000 ||
        this._searchString.length > 2
      ) {
        this._searchString = ev.key;
      } else {
        this._searchString = `${this._searchString}${ev.key}`;
      }

      this._lastKeyPressTime = Date.now();

      const selectedItem = this._items.find((i) =>
        i.name.toLowerCase().startsWith(this._searchString),
      );

      function isItem(element) {
        return element === selectedItem;
      }

      if (selectedItem) {
        if (this.menuVisible) {
          this.currentIndex = this._items.findIndex(isItem);
          this._scrollToElement();
        } else {
          this.value = selectedItem;
        }
      }
    }

    if (ev.key === 'Tab') {
      this._cInput.closeDropdown();
    }

    if (ev.key === 'ArrowDown') {
      ev.preventDefault();

      this._showMenu();
    }

    if (ev.key === 'ArrowUp') {
      ev.preventDefault();

      this._showMenu();
    }

    if (ev.key === ' ') {
      ev.preventDefault();

      this._showMenu();
    }
  }

  /**
   * Select item by index
   */
  @Method()
  async onItemSelection(index: number) {
    this.currentIndex = index;

    this._selectItem();
  }

  /**
   * Hide menu
   * @private
   */
  @Method()
  async onHideMenu() {
    this.menuVisible = false;
  }

  componentWillLoad() {
    CSelect._uniqueId += 1;

    this._id =
      this.hostId?.replace(/[^a-zA-Z0-9-_]/g, '') ??
      CSelect._uniqueId.toString();

    this._inputId =
      'input-' +
      (this.hostId || this.label || this.placeholder)
        .replace(/[^a-zA-Z0-9-_]/g, '')
        .toLowerCase();

    this._setInitialValue();
  }

  private _setInitialValue() {
    if (!this.value) return;

    const value = this.returnValue
      ? this.value
      : (this.value as CSelectItem).value;

    this.internals.setFormValue(value as string);
  }

  componentDidLoad() {
    this._getOptionItems();

    if (
      (this.value || typeof this.value === 'boolean') &&
      !this.currentIndex &&
      this.currentIndex !== 0
    ) {
      this.currentIndex = this._items.findIndex(
        (item) => item.value === this.value,
      );
    }

    requestAnimationFrame(() => {
      this._cInput.createDropdown({
        type: 'select',
        items: this._items,
        options: this._cOptionElements,
        parent: this.host,
        itemsPerPage: this.itemsPerPage,
        index: this.currentIndex,
        click: false,
        id: this._inputId,
      });
    });
  }

  disconnectedCallback() {
    this._observer.disconnect();
  }

  private _inputId: string;

  private _lastKeyPressTime = null;

  private _searchString = '';

  private _blurred = false;

  private _optionItems: CSelectItem[] = [];

  private _inputElement: HTMLInputElement;

  private _selectItem() {
    const selectedItem = this._items[this.currentIndex];

    this.value = selectedItem;

    this._scrollToElement();
  }

  /**
   * @private
   */
  @Method()
  async setActiveDescendant(id: string) {
    this._inputElement.setAttribute('aria-activedescendant', id);
  }

  private _showMenu() {
    if (this.disabled) return;

    this.menuVisible = true;
    this._cInput.openDropdown();
  }

  private _getOptionItems() {
    requestAnimationFrame(() => {
      this._cOptionElements = {};

      let selection: CSelectItem | null = null;

      this._optionItems = (
        this.host ? Array.from(this.host.querySelectorAll('c-option')) : []
      ).map((item, index) => {
        const cSelectItem = {
          value: item.value,
          name: item.name || item.innerText,
          disabled: !!item.disabled,
        } as CSelectItem;

        if (item.selected) {
          selection = cSelectItem;
        }

        item.slot = `option-${index}`;

        this._cOptionElements[item.value.toString()] = item;

        return cSelectItem;
      });

      this.hasOptionItems = !!this._optionItems.length;

      if (selection) {
        this._valueChangedHandler(selection);
      }
    });
  }

  private _runValidate() {
    if (
      this.required &&
      !this.value &&
      (this._blurred || !this.validateOnBlur)
    ) {
      this._outerWrapperClasses.push('required');
      this._validationClasses.push('show');
    } else {
      this._outerWrapperClasses = this._outerWrapperClasses.filter(
        (c) => c !== 'required',
      );
      this._validationClasses = this._validationClasses.filter(
        (c) => c !== 'show',
      );
    }
  }

  private _renderChevron() {
    const classes = {
      'c-input-menu__chevron': true,
      'c-input-menu__chevron--active': this.menuVisible,
    };

    return (
      <svg class={classes} viewBox="0 0 24 24">
        <path d={mdiChevronDown} />
      </svg>
    );
  }

  private _renderInputElement() {
    return (
      <div class="c-input-menu__input">
        <input
          aria-controls={this._inputId + '-items'}
          aria-expanded={this.menuVisible.toString()}
          aria-readonly="true"
          aria-haspopup="listbox"
          ref={(el) => (this._inputElement = el)}
          id={this._inputId}
          autocomplete="off"
          class="c-input__input"
          type="text"
          value={this._getLabel() ?? null}
          name={this.name ?? null}
          readonly="true"
        />

        <div
          ref={(el) => (this._selectionElement = el)}
          class="c-input-menu__selection"
        />
      </div>
    );
  }

  private _handleSlotChange = () => {
    this._getOptionItems();
  };

  private _updateStatusText() {
    if (this._debounce !== null) {
      clearTimeout(this._debounce);
      this._debounce = null;
    }

    this._debounce = window.setTimeout(() => {
      const selection = this.host.shadowRoot.querySelector(
        'li[aria-selected="true"]',
      ) as HTMLLIElement;

      const ending = !!this._items.length
        ? ', to navigate use up and down arrows'
        : '';

      const isDisabled = !!selection?.classList?.contains('disabled');

      const beginning = isDisabled ? 'Disabled option - ' : '';

      const selectionText = !!selection
        ? `${beginning}${selection.dataset.value} -  ${selection.ariaPosInSet} of ${selection.ariaSetSize} is highlighted`
        : null;

      this.statusText = `${selectionText || ending}`;

      this._debounce = null;
    }, 1400);
  }

  render() {
    return (
      <Host>
        <div
          id={'announce-' + this._id}
          class="visuallyhidden"
          aria-live="polite"
          aria-atomic="true"
        >
          {this.statusText}
        </div>

        <c-input
          ref={(el) => (this._cInput = el)}
          autofocus={this.autofocus}
          disabled={this.disabled}
          hide-details={this.hideDetails}
          hint={this.hint}
          id={this.hostId}
          input-id={this._inputId}
          itemns-per-page={this.itemsPerPage}
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
          onItemClick={() => this._showMenu()}
        >
          <slot name="pre" slot="pre"></slot>

          <div class="c-input__content">
            {this._renderInputElement()}
            {this._renderChevron()}

            <slot onSlotchange={this._handleSlotChange}></slot>
          </div>

          <slot name="post" slot="post"></slot>
        </c-input>
      </Host>
    );
  }
}
