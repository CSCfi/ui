import {
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
} from '@stencil/core';
import { mdiChevronDown, mdiAlert } from '@mdi/js';
import { v4 as uuid } from 'uuid';
import { CAutocompleteItem } from '../../types';

/**
 * @group Form
 */
@Component({
  tag: 'c-autocomplete',
  styleUrl: '../c-input/c-input-menu.scss',
  shadow: true,
})
export class CAutocomplete {
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
   * Triggered when text is typed
   */
  @Event() changeQuery: EventEmitter;

  /**
   * Triggered when an item is selected
   */
  @Event({ bubbles: false }) changeValue: EventEmitter;

  private _valueChangedHandler(item: string | number | CAutocompleteItem) {
    function isItem(element) {
      return element === item;
    }

    this.currentIndex = this.items.findIndex(isItem);

    const value = this.returnValue ? (item as CAutocompleteItem)?.value : item;

    this.changeValue.emit(value);
  }

  private _itemRefs: { value: string | number | boolean; ref: HTMLElement }[] =
    [];

  private _id: string;

  private _inputId: string;

  private _uniqueId = uuid();

  private _direction = null;

  private _debounce = null;

  @Element() host: HTMLCAutocompleteElement;

  @State() menuVisible = false;

  @State() currentIndex: number = null;

  @State() statusText = '';

  @Watch('items')
  watchHandler(newValue, oldValue) {
    if (newValue.length !== oldValue.length) {
      this.currentIndex = !!newValue.length ? 0 : null;

      this._updateStatusText();
    }
  }

  @Listen('keydown', { passive: true })
  handleKeyDown(ev: KeyboardEvent) {
    if (ev.key === 'Escape') {
      this.menuVisible = false;
      this.currentIndex = null;

      return;
    }

    if (ev.key === 'Tab') {
      this.menuVisible = false;

      const item = this.items[this.currentIndex];

      if (!item) return;

      const { name, value } = item;

      this.query = name;
      this.changeValue.emit(this.returnValue ? value : item);
    }

    if (ev.key === 'ArrowDown') {
      this._direction = 'end';
      ev.preventDefault();

      if (!this.menuVisible) {
        this.menuVisible = true;

        return;
      }

      if (this.currentIndex === null) {
        this.currentIndex = 0;
      } else if (this.currentIndex + 1 < this.items.length) {
        this.currentIndex += 1;
      }

      this._scrollToElement();
    }

    if (ev.key === 'ArrowUp') {
      this._direction = 'start';
      ev.preventDefault();

      if (!this.menuVisible) {
        this.menuVisible = true;

        return;
      }

      if (this.currentIndex > 0) {
        this.currentIndex -= 1;
      } else if (this.currentIndex === null) {
        this.currentIndex = this.items.length - 1;
      }

      this._scrollToElement();
    }

    if (ev.keyCode === 32) {
      if (!this.menuVisible) {
        this.menuVisible = true;
        ev.preventDefault();
      }
    }

    if (ev.key === 'Enter') {
      if (this.currentIndex !== null) {
        const selectedItem = this.items[this.currentIndex];
        this._select(ev, selectedItem);
        this.menuVisible = false;
      }
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

  private _scrollToElement() {
    if (this.items.length > this.itemsPerPage) {
      const itemRef = this._itemRefs.find(
        (item) => item.value === this.items[this.currentIndex].value,
      )?.ref;

      if (!!itemRef) {
        this._observer.observe(itemRef);
      }
    }

    this._updateStatusText();
  }

  private _updateStatusText() {
    this.statusText = this.query;

    if (this._debounce !== null) {
      clearTimeout(this._debounce);
      this._debounce = null;
    }

    this._debounce = window.setTimeout(() => {
      const word = this.items.length === 1 ? 'suggestion' : 'suggestions';
      const ending = !!this.items.length
        ? ', to navigate use up and down arrows'
        : '.';

      const selection = this.host.shadowRoot.querySelector(
        'li[aria-selected="true"]',
      );

      const selectionText = !!selection
        ? `. ${selection.innerHTML} ${selection.ariaPosInSet} of ${selection.ariaSetSize} is highlighted`
        : null;

      this.statusText = `${this.items.length} ${word} found${
        selectionText || ending
      }`;

      this._debounce = null;
    }, 1400);
  }

  private handleChange(event) {
    this.menuVisible = true;
    this.query = event.target.value;
    this.changeQuery.emit(this.query);
    this.changeValue.emit(null);

    if (!this.query.length) {
      this.statusText = '';
    }
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
    this._id = this.hostId?.replace(/[^a-zA-Z0-9-_]/g, '') ?? this._uniqueId;
    this._inputId =
      'input_' +
      (this.hostId || this.label || this.placeholder).replace(
        /[^a-zA-Z0-9-_]/g,
        '',
      );
  }

  componentDidLoad() {
    window.addEventListener('click', (event: MouseEvent) => {
      if (!(event.target as HTMLElement).matches('c-autocomplete')) {
        this.menuVisible = false;
        this.currentIndex = null;
      }
    });
  }

  disconnectedCallback() {
    this._observer.disconnect();
  }

  private _getActiveListItemId() {
    return `option--${this._id}-${this.currentIndex}`;
  }

  private _handleFocus(event: FocusEvent) {
    const { value } = event.target as HTMLInputElement;

    if (!!value) {
      this.menuVisible = true;
    }

    this.statusText = '';

    this._updateStatusText();
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

  private _renderMenu(style) {
    return (
      <div
        class={{
          'c-input-menu__item-wrapper': true,
          'c-input-menu__item-wrapper--shadow': this.shadow,
        }}
      >
        {!!this.items.length && (
          <ul
            id={'results_' + this._id}
            class={
              this.menuVisible
                ? 'c-input-menu__items'
                : 'c-input-menu__items c-input-menu__items--hidden'
            }
            role="listbox"
            style={style}
          >
            {this.menuVisible &&
              this.items.map((item, index) => (
                <li
                  id={`option--${this._id}-${index}`}
                  aria-posinset={(index + 1).toString()}
                  aria-setsize={this.items.length.toString()}
                  aria-selected={(this.currentIndex === index).toString()}
                  role="option"
                  tabindex="-1"
                  ref={(el) => {
                    item.ref = el as HTMLElement;
                    this._itemRefs.push({
                      value: item.value,
                      ref: el as HTMLElement,
                    });
                  }}
                  onClick={(event) => this._select(event, item)}
                >
                  {item.name}
                </li>
              ))}
          </ul>
        )}

        {!this.items.length && this.menuVisible && (
          <ul class="c-input-menu__items c-input-menu__items--empty">
            <li tabindex="-1">
              <svg viewBox="0 0 24 24">
                <path d={mdiAlert} />
              </svg>
              No suggestions found
            </li>
          </ul>
        )}
      </div>
    );
  }

  private _renderInputElement() {
    return (
      <div class="c-input-menu__input">
        <input
          type="text"
          aria-expanded={this.menuVisible.toString()}
          aria-owns={'results_' + this._id}
          aria-autocomplete="list"
          aria-activedescendant={this._getActiveListItemId()}
          autocomplete="off"
          class="c-input__input"
          role="combobox"
          value={this.query}
          name={this.name ?? null}
          onInput={(event) => this.handleChange(event)}
          onFocus={(event) => this._handleFocus(event)}
        />
      </div>
    );
  }

  render() {
    this._itemRefs = [];
    let itemsPerPageStyle = {};

    if (
      this.itemsPerPage &&
      this.itemsPerPage > 0 &&
      this.items.length > this.itemsPerPage
    ) {
      itemsPerPageStyle = {
        'max-height': 48 * this.itemsPerPage + 'px',
      };
    }

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
        >
          <slot name="pre" slot="pre"></slot>

          <div class="c-input__content">
            {this._renderInputElement()}
            {this._renderMenu(itemsPerPageStyle)}
            {this._renderChevron()}
          </div>

          <slot name="post" slot="post"></slot>
        </c-input>
      </Host>
    );
  }
}
