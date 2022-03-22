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

export interface SelectItem {
  name: string;
  value: string;
}
/**
 * @group Form
 */
@Component({
  tag: 'c-autocomplete',
  styleUrl: 'c-autocomplete.scss',
  shadow: true,
})
export class CAutocomplete {
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
  @Prop({ mutable: true }) value: { name: string; value: string } = null;

  /**
   * Dense variant
   */
  @Prop() dense: boolean;

  /**
   * Show required validation
   */
  @Prop() required: boolean = null;

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

  @State() itemRefs: { value: string; ref: HTMLElement }[] = [];

  @Watch('items')
  watchHandler(newValue, oldValue) {
    if (newValue.length !== oldValue.length) {
      this.currentIndex = null;
    }
  }

  @Element() host: HTMLCAutocompleteElement;
  @State() menuVisible: boolean = false;
  @State() currentIndex: number = null;
  private outerWrapperClasses = ['outer-wrapper'];
  private validationClasses = ['validation-message'];
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

  private validationIcon = (
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

  private showMenu = () => {
    if (this.menuVisible) {
      this.currentIndex = null;
    }
    this.menuVisible = !this.menuVisible;
  };

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

  private _setItemsPerPage() {
    if (this.itemsPerPage > 0 && this.items.length > this.itemsPerPage) {
      this._itemsPerPageStyle = {
        'max-height': 49 * this.itemsPerPage + 'px',
        'overflow-y': 'auto',
      };
    }
  }

  private getListItem = (item) => {
    let classes = '';
    if (this.dense) {
      classes = 'dense';
    }

    if (this.items[this.currentIndex] === item) {
      classes = `${classes} active`;
    }

    return (
      <li
        id={'item_' + item.value}
        ref={(el) => {
          item.ref = el as HTMLElement;
          this.itemRefs.push({ value: item.value, ref: el as HTMLElement });
        }}
        onClick={() => this.select(item)}
        class={classes}
      >
        {item.name}
      </li>
    );
  };

  private _itemsPerPageStyle = {};

  render() {
    this.itemRefs = [];

    this._setItemsPerPage();
    let borderLabel = 'border-label';
    if (this.query !== '') {
      borderLabel += ' value-set';
    }

    if (this.required && !this.value) {
      this.outerWrapperClasses.push('required');
      this.validationClasses.push('show');
    } else {
      this.outerWrapperClasses = this.outerWrapperClasses.filter(
        (c) => c !== 'required',
      );
      this.validationClasses = this.validationClasses.filter(
        (c) => c !== 'show',
      );
    }

    let classes = 'c-autocomplete-wrapper';
    if (this.menuVisible) classes = `${classes} c-autocomplete-wrapper-active`;
    if (this.dense) classes = `${classes} c-autocomplete-dense`;
    const labelBlock = (
      <div class={borderLabel}>
        <label class="top-span">
          {this.label}
          {this.required ? '*' : ''}
        </label>
        <label class="hidden">
          {this.label}
          {this.required ? '*' : ''}
        </label>
      </div>
    );

    return (
      <Host>
        <div
          class={this.outerWrapperClasses.join(' ')}
          tabindex="0"
          onClick={this.showMenu}
          role="button"
          aria-labelledby="c-select-label"
        >
          <div
            class="full-width"
            role="button"
            aria-labelledby="c-autocomplete-label"
          >
            <c-row align="center" nowrap>
              <div class="c-autocomplete-current">
                <input
                  value={this.query}
                  aria-autocomplete="list"
                  aria-controls="c-menu-parent"
                  aria-haspopup="true"
                  type="text"
                  onInput={(event) => this.handleChange(event)}
                />
              </div>
              <div class="c-autocomplete-icon-wrapper">
                <svg
                  width="22px"
                  height="22px"
                  fill="#222"
                  viewBox="0 0 24 24"
                  class={
                    this.menuVisible
                      ? 'c-autocomplete-icon rotated'
                      : 'c-autocomplete-icon'
                  }
                >
                  <path d={mdiChevronDown} />
                </svg>
              </div>
            </c-row>
          </div>
          <input type="hidden" value={this.value?.value} />
          <div
            id="c-menu-parent"
            class="c-menu-parent"
            aria-expanded={this.menuVisible}
          >
            {this.menuVisible ? (
              <div class="c-menu" style={this._itemsPerPageStyle}>
                {this.items.map((item) => this.getListItem(item))}
              </div>
            ) : (
              ''
            )}
          </div>
          <div class="border-wrapper">
            <div class="border-left"></div>
            {this.label && labelBlock}
            <div class="border-right"></div>
          </div>
        </div>
        <div class={this.validationClasses.join(' ')}>
          {this.validationIcon} Required field
        </div>
      </Host>
    );
  }
}
