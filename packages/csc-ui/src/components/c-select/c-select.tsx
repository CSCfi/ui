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
import { registerClickOutside } from 'stencil-click-outside';
/**
 * @group Form
 */
@Component({
  tag: 'c-select',
  styleUrl: '../c-input/c-input-menu.scss',
  shadow: true,
})
export class CSelect {
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
  @Prop() shadow: boolean = false;

  /**
   * Input field name
   */
  @Prop() name: string;

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
  @Prop({ mutable: true }) value: { name: string; value: string | number } =
    null;

  /**
   * selectable items
   */
  @Prop() items: { name: string; value: string | number }[] = [];

  @Element() host: HTMLCSelectElement;

  @State() menuVisible: boolean = false;

  @State() currentIndex: number = null;

  @State() itemRefs: { value: string; ref: HTMLElement }[] = [];

  @Watch('validate')
  validateChange(newValue: boolean) {
    if (newValue) {
      this._runValidate();
    }
  }

  private _direction = null;

  private _outerWrapperClasses = ['outer-wrapper'];

  private _validationClasses = ['validation-message'];

  private _inputElement: HTMLInputElement;

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
  /**
   * Triggered when an item is selected
   */
  @Event() changeValue: EventEmitter;
  private _valueChangedHandler(item: any) {
    function isItem(element) {
      return element.value === item.value;
    }
    this.currentIndex = this.items.findIndex(isItem);
    this.changeValue.emit({ name: item.name, value: item.value });
  }

  private _scrollToElement() {
    if (this.items.length > this.itemsPerPage) {
      const itemRef = this.itemRefs.find(
        (item) => item.value === this.items[this.currentIndex].value,
      )?.ref;

      if (!!itemRef) {
        this._observer.observe(itemRef);
      }
    }
  }

  @Listen('keydown', { capture: true })
  handleKeyDown(ev: any) {
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
      const selectedItem = this.items.find((i) =>
        i.name.toLowerCase().startsWith(this._searchString),
      );
      function isItem(element) {
        return element === selectedItem;
      }
      if (selectedItem) {
        if (this.menuVisible) {
          this.currentIndex = this.items.findIndex(isItem);
          this._scrollToElement();
        } else {
          this.value = selectedItem;
          this._valueChangedHandler(selectedItem);
        }
      }
    }

    if (ev.key === 'Tab') {
      this.menuVisible = false;
    }

    if (ev.key === 'ArrowLeft') {
      this._direction = 'start';
      ev.preventDefault();
      if (this.currentIndex !== null && this.currentIndex > 0) {
        this.currentIndex = this.currentIndex - 1;
      }
      const selectedItem = this.items[this.currentIndex];
      this.value = selectedItem;
      this._valueChangedHandler(selectedItem);
      this._scrollToElement();
    }

    if (ev.key === 'ArrowRight') {
      this._direction = 'end';
      ev.preventDefault();
      if (this.currentIndex === null) {
        this.currentIndex = 0;
      } else if (this.currentIndex + 1 < this.items.length) {
        this.currentIndex = this.currentIndex + 1;
      }
      const selectedItem = this.items[this.currentIndex];
      this.value = selectedItem;
      this._valueChangedHandler(selectedItem);
      this._scrollToElement();
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
        }
        if (this.menuVisible) {
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
        if (this.menuVisible) {
          this._scrollToElement();
        }
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
        this.value = selectedItem;
        this._valueChangedHandler(selectedItem);
        this.menuVisible = false;
      }
    }
  }

  private _lastKeyPressTime = null;
  private _searchString = '';
  private _blurred = false;

  private _showMenu() {
    this._inputElement.focus();

    if (this.menuVisible) {
      this.currentIndex = null;
    }
    this.menuVisible = !this.menuVisible;
  }

  private _hideMenu() {
    this.menuVisible = false;
    this._blurred = true;
  }

  private _select(item) {
    this.value = item;
    this._valueChangedHandler(item);
    this.menuVisible = false;
  }

  private _getListItem = (item) => {
    const classes = {
      active: this.items[this.currentIndex] === item,
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
        ref={(el) =>
          this.itemRefs.push({ value: item.value, ref: el as HTMLElement })
        }
        onClick={() => this._select(item)}
        class={classes}
      >
        {item.name}
      </li>
    );
  };

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
      <div class="c-input-menu__input" onClick={() => this._showMenu()}>
        <input
          ref={(el) => (this._inputElement = el as HTMLInputElement)}
          type="text"
          value={this.value?.name ?? null}
          name={this.name ?? null}
          readonly
        />
      </div>
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

  render() {
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
      <Host
        ref={(el) => registerClickOutside(this, el, () => this._hideMenu())}
      >
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
          value={this.value}
          variant="select"
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
