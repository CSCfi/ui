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
/**
 * @group Form
 */
@Component({
  tag: 'c-select',
  styleUrl: 'c-select.scss',
  shadow: true,
})
export class CSelect {
  /**
   * Run validation when changed to true
   */
  @Prop() validate: boolean = false;

  /**
   * Id of the element
   */
  @Prop({ attribute: 'id' }) hostId: string;

  @Watch('validate')
  validateChange(newValue: boolean) {
    if (newValue) {
      this._runValidate();
    }
  }

  /**
   * Element label
   */
  @Prop() label: string;

  /**
   * Dense variant
   */
  @Prop() dense: boolean = false;

  /**
   * Shadow variant
   */
  @Prop() shadow: boolean = false;

  /**
   * Label is aligned to the right
   */
  @Prop() labelRight: boolean = false;

  /**
   * Input field name
   */
  @Prop() name: string;

  /**
   * Show required validation
   */
  @Prop() required: boolean = null;

  /**
   * Show validation after touching the menu
   */
  @Prop() validateOnBlur: boolean = false;

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

  private _outerWrapperClasses = ['outer-wrapper'];
  private _validationClasses = ['validation-message'];

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
      this.itemRefs
        .find((item) => item.value === this.items[this.currentIndex].value)
        ?.ref.scrollIntoView();
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
      ev.preventDefault();
      if (this.currentIndex !== null && this.currentIndex > 0) {
        this.currentIndex = this.currentIndex - 1;
      }
      const selectedItem = this.items[this.currentIndex];
      this.value = selectedItem;
      this._valueChangedHandler(selectedItem);
    }

    if (ev.key === 'ArrowRight') {
      ev.preventDefault();
      if (this.currentIndex === null) {
        this.currentIndex = 0;
      } else if (this.currentIndex + 1 < this.items.length) {
        this.currentIndex = this.currentIndex + 1;
      }
      const selectedItem = this.items[this.currentIndex];
      this.value = selectedItem;
      this._valueChangedHandler(selectedItem);
    }

    if (ev.key === 'ArrowDown') {
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
    let classes = '';
    if (this.dense) {
      classes = 'dense';
    }

    if (this.items[this.currentIndex] === item) {
      classes = `${classes} active`;
    }

    if (item.value === null) {
      classes = `${classes} none`;
    }

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

  private _validationIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#E71D32"
      width="18px"
      height="18px"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </svg>
  );

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
  render() {
    this.itemRefs = [];
    let itemsPerPageStyle = {};
    if (
      this.itemsPerPage &&
      this.itemsPerPage > 0 &&
      this.items.length > this.itemsPerPage
    ) {
      itemsPerPageStyle = {
        'max-height': 47 * this.itemsPerPage + 'px',
        'overflow-y': 'scroll',
      };
    }
    let borderLabel = 'border-label';
    if (!!this.value || this.placeholder) {
      borderLabel += ' value-set';
      this._outerWrapperClasses.push('value-set');
    }
    this._runValidate();

    const labelBlock = (
      <div class={borderLabel}>
        <label class="top-span" htmlFor={this.name}>
          {this.label}
          {this.required ? '*' : ''}
        </label>
        <label class="hidden">
          {this.label}
          {this.required ? '*' : ''}
        </label>
      </div>
    );

    if (this.shadow) {
      this._outerWrapperClasses.push('shadow');
    }
    if (this.labelRight) {
      this._outerWrapperClasses.push('label-right');
    }

    return (
      <Host>
        <div
          id={this.hostId}
          class={this._outerWrapperClasses.join(' ')}
          tabindex="0"
          role="button"
          onBlur={() => this._hideMenu()}
          aria-labelledby="c-select-label"
        >
          <div onClick={() => this._showMenu()} class="full-width">
            <div class="c-select-row">
              <slot name="pre"></slot>
              {this.items.length === 0 ? (
                <div class="c-select-current c-menu-no-items"></div>
              ) : (
                <div class="c-select-current">
                  {this.value && this.value.name ? (
                    this.value.name
                  ) : (
                    <span>{this.placeholder}</span>
                  )}
                </div>
              )}
              <slot name="post"></slot>
              <svg
                width="22"
                height="22"
                fill="#222"
                viewBox="0 0 24 24"
                class={
                  this.menuVisible ? 'c-select-icon rotated' : 'c-select-icon'
                }
              >
                <path d={mdiChevronDown} />
              </svg>
            </div>
          </div>

          <input
            type="hidden"
            value={this.value ? this.value.value : null}
            name={this.name}
          />
          <div class="c-menu-parent" aria-expanded={this.menuVisible}>
            {
              <div
                style={itemsPerPageStyle}
                class={this.menuVisible ? 'c-menu' : 'c-menu c-menu-hide'}
              >
                {this.items.map((item) => this._getListItem(item))}
              </div>
            }
          </div>
          <div class="border-wrapper">
            <div class="border-left"></div>
            {this.label ? labelBlock : null}
            <div class="border-right"></div>
          </div>
        </div>
        <div class={this._validationClasses.join(' ')}>
          {this._validationIcon} Required field
        </div>
      </Host>
    );
  }
}
