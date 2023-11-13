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
import { CAutocompleteItem } from '../../types';

/**
 * @group Form
 * @slot pre - Content added before the input
 * @slot post - Content added after the input
 */
@Component({
  tag: 'c-autocomplete',
  styleUrl: 'c-autocomplete.scss',
  shadow: true,
  formAssociated: true,
})
export class CAutocomplete {
  @Element() el: HTMLCAutocompleteElement;

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
   * Shadow variant
   */
  @Prop() shadow = false;

  /**
   * Input field name
   */
  @Prop() name: string;

  /**
   * Element label
   */
  @Prop() label: string;

  /**
   * Search string
   */
  @Prop({ mutable: true }) query: string = null;

  /**
   * Selected item
   */
  @Prop({ mutable: true }) value: string | number | CAutocompleteItem = null;

  /**
   * Dense variant
   */
  @Prop() dense: boolean;

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
   * Placeholder text
   */
  @Prop() placeholder = '';

  /**
   * Return only the item value rather than the whole item object
   */
  @Prop() returnValue: false;

  /**
   * Items to be selected
   */
  @Prop() items: CAutocompleteItem[] = [];

  /**
   * Items per page before adding scroll
   */
  @Prop() itemsPerPage: number;

  /**
   * display the option as selection (works only when c-option elements are used)
   */
  @Prop() optionAsSelection: false;

  /**
   * Triggered when text is typed
   */
  @Event() changeQuery: EventEmitter;

  /**
   * Triggered when an item is selected
   */
  @Event({ bubbles: false }) changeValue: EventEmitter;

  /**
   * Sets the value of the autocomplete externally
   */
  @Method()
  async setValue(event, item) {
    this._select(event, item);
  }

  /**
   * Hide menu
   * @private
   */
  @Method()
  async onHideMenu() {
    this.menuVisible = false;
  }

  /**
   * @private
   */
  @Method()
  async setActiveDescendant(id: string) {
    if (!id) {
      this._inputElement.removeAttribute('aria-activedescendant');

      return;
    }

    this._inputElement.setAttribute('aria-activedescendant', id);
  }

  /**
   * @private
   */
  @Method()
  async updateQuery(query: string) {
    this.query = query;
    this.changeQuery.emit(this.query);
    this.changeValue.emit(null);
  }

  /**
   * Select item by index
   */
  @Method()
  async onItemSelection(index: number) {
    this.currentIndex = index;

    const selectedItem = this._items[this.currentIndex];

    this.value = selectedItem;
    this.query = selectedItem.name;
  }

  private _setFormValue(item) {
    if (!item) return;

    const value = this.returnValue ? item : (item as CAutocompleteItem).value;

    this.internals.setFormValue(value as string);
  }

  private _valueChangedHandler(item: string | number | CAutocompleteItem) {
    function isItem(element) {
      return element === item;
    }

    this.currentIndex = this.items.findIndex(isItem);

    const value = this.returnValue ? (item as CAutocompleteItem)?.value : item;

    this._setFormValue(item);

    this.changeValue.emit(value);
  }

  private _cOptionElements: Record<string, HTMLCOptionElement> = {};

  private _optionItems: CAutocompleteItem[] = [];

  private _inputId: string;

  private static _uniqueId = 0;

  private _direction = null;

  private _inputElement: HTMLInputElement;

  private _dropdownElement: HTMLCDropdownElement;

  get _items() {
    return this.hasOptionItems ? this._optionItems : this.items;
  }

  @State() menuVisible = false;

  @State() currentIndex: number = null;

  @State() hasOptionItems = false;

  @State() options: Record<string, HTMLCOptionElement> = {};

  private get _itemValues() {
    return this.items.map((item) => item.value);
  }

  private get _filteredOptions() {
    if (!Object.keys(this._cOptionElements).length) return {};

    return this._itemValues.reduce((items, item) => {
      if (!this._cOptionElements[item as string]) return items;

      items[item as string] = this._cOptionElements[item as string].cloneNode(
        true,
      ) as HTMLCOptionElement;

      return items;
    }, {} as Record<string, HTMLCOptionElement>);
  }

  @Watch('items')
  watchHandler(items) {
    this.currentIndex = !!items.length ? 0 : null;

    this._optionItems = this._optionItems.filter((item) =>
      this._itemValues.includes(item.value),
    );

    requestAnimationFrame(async () => {
      await this._dropdownElement.updateDropdown({
        items: items,
        options: this._filteredOptions,
      });
    });
  }

  @Watch('value')
  onValueChange() {
    if (!this.value) return;

    requestAnimationFrame(() => {
      const realValue = !(this.value as CAutocompleteItem)?.value
        ? this._items.find((item) => item.value === this.value)
        : this.value;

      this._valueChangedHandler(realValue as CAutocompleteItem);
    });
  }

  @Listen('keydown', { passive: true })
  handleKeyDown(ev: KeyboardEvent) {
    const alphanumeric = /^[0-9a-zA-Z]+$/;

    if (ev.key.match(alphanumeric) && ev.key.length === 1) {
      this._showMenu(false);

      this._inputElement.focus();
    }

    if (ev.key === 'Tab') {
      this._dropdownElement.close();
    }

    if (ev.key === 'ArrowDown') {
      ev.preventDefault();

      this._dropdownElement.open();
      this._dropdownElement.focusItem(0);
    }

    if (ev.key === 'ArrowUp') {
      ev.preventDefault();

      this._dropdownElement.open();
      this._dropdownElement.focusItem(this._items.length - 1);
    }

    if (ev.key === ' ') {
      ev.preventDefault();

      this._showMenu();
    }

    if (ev.key === 'Escape') {
      this._dropdownElement.close();
    }
  }

  private _showMenu(focusList = true) {
    if (this.disabled) return;

    this._dropdownElement.open(focusList);

    if (focusList) {
      // this._dropdownElement.focusDropdown();
    }
  }

  private _observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          entry.target.scrollIntoView({
            block: this._direction,
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

  private _getOptionItems() {
    requestAnimationFrame(() => {
      this._cOptionElements = {};
      this._optionItems.length = 0;

      let selection: CAutocompleteItem | null = null;

      this._optionItems = (
        this.el ? Array.from(this.el.querySelectorAll('c-option')) : []
      ).map((item, index) => {
        const cAutocompleteItem = {
          value: item.value,
          name: item.name || item.innerText,
          disabled: !!item.disabled,
        } as CAutocompleteItem;

        if (item.selected) {
          selection = cAutocompleteItem;
        }

        item.slot = `option-${index}`;

        this.options[item.value] = item.cloneNode(true) as HTMLCOptionElement;

        this._cOptionElements[item.value.toString()] = item.cloneNode(
          true,
        ) as HTMLCOptionElement;

        return cAutocompleteItem;
      });

      this.hasOptionItems = !!this._optionItems.length;

      if (selection) {
        this._valueChangedHandler(selection);
      }
    });
  }

  private _handleSlotChange = () => {
    this._getOptionItems();
  };

  private handleChange(event) {
    this.menuVisible = true;
    this.query = event.target.value;
    this.changeQuery.emit(this.query);
    this.changeValue.emit(null);
  }

  private _select(event, item) {
    event.preventDefault();
    event.stopPropagation();
    this.query = item.name;
    this.value = item;
    this._valueChangedHandler(item);
    this.menuVisible = false;
  }

  componentWillLoad() {
    CAutocomplete._uniqueId += 1;

    this._inputId =
      'input_' +
      (this.hostId || this.label || this.placeholder).replace(
        /[^a-zA-Z0-9-_]/g,
        '',
      );
  }

  componentDidLoad() {
    this._getOptionItems();
  }

  disconnectedCallback() {
    this._observer.disconnect();
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
          type="text"
          ref={(el) => (this._inputElement = el)}
          aria-expanded={this.menuVisible.toString()}
          aria-owns={this._inputId + '-items'}
          aria-autocomplete="list"
          autocomplete="off"
          class="c-input__input"
          role="combobox"
          value={this.query}
          name={this.name ?? null}
          onInput={(event) => this.handleChange(event)}
        />
      </div>
    );
  }

  render() {
    return (
      <Host title={this.query}>
        <c-dropdown
          ref={(el) => (this._dropdownElement = el)}
          slot="dropdown"
          items={this._items}
          options={this._cOptionElements}
          items-per-page={this.itemsPerPage}
          parent={this.el}
          index={this.currentIndex}
          input-id={this._inputId}
          type="autocomplete"
        >
          <c-input
            slot="default"
            autofocus={this.autofocus}
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
            onItemClick={() => this.items.length && this._showMenu(false)}
          >
            <slot name="pre" slot="pre"></slot>

            <div class="c-input__content">
              {this._renderInputElement()}
              {this._renderChevron()}

              <slot onSlotchange={this._handleSlotChange}></slot>
            </div>

            <slot name="post" slot="post"></slot>
          </c-input>
        </c-dropdown>
      </Host>
    );
  }
}
