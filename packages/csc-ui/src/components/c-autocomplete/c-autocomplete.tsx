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
import { mdiChevronDown } from '@mdi/js';
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
  @Prop() shadow: boolean = false;

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
  @Prop({ mutable: true }) value: CAutocompleteItem = null;

  /**
   * Dense variant
   */
  @Prop() dense: boolean;

  /**
   * Show required validation
   */
  @Prop() required: boolean = null;

  /**
   * Set the validíty of the input
   */
  @Prop() valid: boolean = true;

  /**
   * Manual validation
   */
  @Prop() validate: boolean = false;

  /**
   * Validate the input on blur
   */
  @Prop() validateOnBlur: boolean = false;

  /**
   * Custom validation message
   */
  @Prop() validation: string = 'Required field';

  /**
   * Placeholder text
   */
  @Prop() placeholder = '';

  /**
   * Items to be selected
   */
  @Prop() items: {
    name: string;
    value: string;
  }[] = [];

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
  @Event() changeValue: EventEmitter;
  private valueChangedHandler(item: any) {
    function isItem(element) {
      return element === item;
    }
    this.currentIndex = this.items.findIndex(isItem);
    this.changeValue.emit({ name: item.name, value: item.value });
  }

  private _inputElement: HTMLInputElement;

  private _itemRefs: { value: string; ref: HTMLElement }[] = [];

  @Watch('items')
  watchHandler(newValue, oldValue) {
    if (newValue.length !== oldValue.length) {
      if (typeof this.currentIndex === 'number') {
        this.currentIndex = null;
      }
    }
  }

  @Element() host: HTMLCAutocompleteElement;
  @State() menuVisible: boolean = false;
  @State() currentIndex: number = null;
  private _direction = null;
  @Listen('keydown', { passive: true })
  handleKeyDown(ev: any) {
    if (ev.key === 'Tab') {
      this.menuVisible = false;
    }

    if (ev.key === 'ArrowDown') {
      this._direction = 'end';
      ev.preventDefault();
      if (this.menuVisible === false) {
        this.menuVisible = true;
      } else {
        if (this.currentIndex === null) {
          this.currentIndex = 0;
        } else if (this.currentIndex + 1 < this.items.length) {
          this.currentIndex = this.currentIndex + 1;
          this._scrollToElement();
        }
      }
    }

    if (ev.key === 'ArrowUp') {
      this._direction = 'start';
      ev.preventDefault();
      this.menuVisible = true;
      if (this.currentIndex !== null && this.currentIndex > 0) {
        this.currentIndex = this.currentIndex - 1;
        this._scrollToElement();
      } else if (this.currentIndex === 0) {
        this.currentIndex = null;
      }
    }
    if (ev.keyCode === 32) {
      if (this.menuVisible === false) {
        this.menuVisible = true;
      }
    }

    if (ev.key === 'Escape') {
      if (this.menuVisible === true) {
        this.menuVisible = false;
        this.currentIndex = null;
      }
    }

    if (ev.key === 'Enter') {
      if (this.currentIndex !== null) {
        const selectedItem = this.items[this.currentIndex];
        this.select(selectedItem);
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
  }

  private _showMenu() {
    this._inputElement.focus();

    if (this.menuVisible) {
      this.currentIndex = null;
    }
    this.menuVisible = !this.menuVisible;
  }

  private handleChange(event) {
    this.menuVisible = true;
    this.query = event.target.value;
    this.changeQuery.emit(this.query);
    this.changeValue.emit(null);
  }

  private select(item) {
    this.query = item.name;
    this.value = item;
    this.valueChangedHandler(item);
    this.menuVisible = false;
  }

  componentDidLoad() {
    const _this = this;

    window.addEventListener('click', function (event: any) {
      if (!event.target.matches('c-autocomplete')) {
        _this.menuVisible = false;
        _this.currentIndex = null;
      }
    });
  }

  private _getListItem = (item) => {
    const classes = {
      active:
        this.items.length > this.currentIndex
          ? this.items[this.currentIndex] === item
          : false,
      none: item.value === null,
    };

    let itemId = 'none';

    if (typeof item?.value === 'string') {
      itemId = item.value.replace(/[^a-zA-Z0-9-_]/g, '');
    }

    itemId = `item_${itemId}`;

    return (
      <li
        id={itemId}
        ref={(el) => {
          item.ref = el as HTMLElement;
          this._itemRefs.push({ value: item.value, ref: el as HTMLElement });
        }}
        onClick={() => this.select(item)}
        class={classes}
      >
        {item.name}
      </li>
    );
  };

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
        aria-expanded={this.menuVisible}
      >
        <div
          style={style}
          class={
            this.menuVisible
              ? 'c-input-menu__items'
              : 'c-input-menu__items c-input-menu__items--hidden'
          }
        >
          {this.items.map((item) => this._getListItem(item))}
        </div>
      </div>
    );
  }

  private _renderInputElement() {
    return (
      <div class="c-input-menu__input" onClick={() => this._showMenu()}>
        <input
          ref={(el) => (this._inputElement = el as HTMLInputElement)}
          type="text"
          value={this.value?.name ?? null}
          name={this.name ?? null}
          onInput={(event) => this.handleChange(event)}
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
        'overflow-y': 'scroll',
      };
    }

    return (
      <Host>
        <c-input
          autofocus={this.autofocus}
          disabled={this.disabled}
          hide-details={this.hideDetails}
          hint={this.hint}
          id={this.hostId}
          label={this.label}
          name={this.name}
          placeholder={this.placeholder}
          shadow={this.shadow}
          valid={this.valid}
          validate={this.validate}
          validate-on-blur={this.validateOnBlur}
          validation={this.validation}
          value={this.query}
        >
          <slot name="pre" slot="pre"></slot>

          {this._renderInputElement()}
          {this._renderMenu(itemsPerPageStyle)}

          {this._renderChevron()}

          <slot name="post" slot="post"></slot>
        </c-input>
      </Host>
    );
  }
}
