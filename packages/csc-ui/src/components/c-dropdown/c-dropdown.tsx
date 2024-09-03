import { mdiAlert, mdiInformation } from '@mdi/js';
import {
  Component,
  Host,
  Prop,
  h,
  Element,
  Method,
  Watch,
  Event,
  EventEmitter,
  State,
} from '@stencil/core';
import { CAutocompleteItem, CSelectItem } from '../../types';

@Component({
  tag: 'c-dropdown',
  styleUrl: 'c-dropdown.scss',
  shadow: true,
})
export class CDropdown {
  @Element() el: HTMLCDropdownElement;

  /**
   * Items per page before adding scroll
   */
  @Prop() itemsPerPage: number;

  /**
   * Dropdown parent
   */
  @Prop() parent: HTMLCSelectElement | HTMLCAutocompleteElement;

  /**
   * Dropdown options
   */
  @Prop() items:
    | NodeListOf<HTMLCOptionElement>
    | CAutocompleteItem[]
    | CSelectItem[];

  /**
   * Current index value
   */
  @Prop() index: number;

  /**
   * Id of the element
   */
  @Prop({ attribute: 'id' }) hostId: string;

  /**
   * Triggered when option is selected
   */
  @Event() selectOption: EventEmitter;

  /**
   * Type of the parent element
   */
  @Prop() type: 'select' | 'autocomplete';

  /**
   * Type of items
   */
  @Prop() itemType: 'option' | 'item';

  /**
   * Triggered when dropdown opens or closes
   */
  @Event() dropdownStateChange: EventEmitter<boolean>;

  /**
   * Dropdown dialog element
   */
  private _dialog: HTMLDialogElement;

  private _debounce = null;

  private _list: HTMLUListElement;

  private _outsideClickFn: () => void;

  private _resizeObserver: ResizeObserver;

  private _inputElement: HTMLCInputElement;

  private _dummyElement: HTMLDivElement;

  private _isMobile = false;

  private _listItems: HTMLLIElement[] = [];

  private _originalOverflowValue: string;

  @State() renderedList = null;

  @State() isOpen = false;

  @State() statusText = '';

  @Watch('items')
  optionsWatcher() {
    requestAnimationFrame(() => {
      this.renderedList = this._renderList();
    });
  }

  @Watch('isOpen')
  async stateWatcher(isOpen) {
    this._originalOverflowValue =
      this._originalOverflowValue ||
      window.getComputedStyle(document.body).overflow;

    if (isOpen) {
      this._handleOpen();
      this._disableScroll();
    } else {
      this._enableScroll();
    }

    this.dropdownStateChange.emit(isOpen);
  }

  @Watch('index')
  handleIndexChange(index) {
    requestAnimationFrame(() => {
      this._updateStatusText();

      this._listItems[index]?.focus();
    });
  }

  /**
   * @private
   */
  @Method()
  async setStatusText(text: string) {
    requestAnimationFrame(() => {
      this.statusText = text;
    });
  }

  /**
   * @private
   */
  @Method()
  async focusItem(index: number) {
    requestAnimationFrame(() => {
      this._listItems[index]?.focus();
    });
  }

  /**
   * Open dropdown
   */
  @Method()
  async open() {
    if (this._dialog.open) return;

    this._outsideClickFn = this._handleOutsideClick.bind(this);

    this._dialog.addEventListener('click', this._outsideClickFn);

    requestAnimationFrame(() => {
      this.isOpen = true;

      this._positionMenu();
    });
  }

  /**
   * Close dropdown
   */
  @Method()
  async close() {
    this._dialog.close();

    this.isOpen = false;

    this._inputElement.slot = 'default';

    this._inputElement.hideDetails = this._hideDetails;

    this._dummyElement.style.width = '0';
    this._dummyElement.style.display = 'none';
    this._dialog.style.width = '0';

    window.removeEventListener('click', this._outsideClickFn);
  }

  private _setIsMobile() {
    this._isMobile = window.matchMedia(
      'only screen and (max-width: 760px)',
    ).matches;
  }

  private _isOpening = false;

  private _handleOpen() {
    this._isOpening = true;

    setTimeout(() => {
      this._isOpening = false;
    }, 500);
  }

  private _disableScroll() {
    document.body.style.overflow = 'hidden';
  }

  private _enableScroll() {
    if (
      this._originalOverflowValue &&
      this._originalOverflowValue !== 'visible'
    ) {
      document.body.style.overflow = this._originalOverflowValue;

      return;
    }

    document.body.style.removeProperty('overflow');
  }

  componentDidLoad() {
    this._setIsMobile();

    this._hideDetails = this.parent.hideDetails;

    this._inputElement = this.el.querySelector('c-input');

    this._resizeObserver = new ResizeObserver((entries) => {
      if (!this._dialog.open) return;

      requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length || this._isOpening)
          return;

        this._setIsMobile();

        this.close();
      });
    });

    this._resizeObserver.observe(window.document.body);

    requestAnimationFrame(() => {
      this.renderedList = this._renderList();
    });
  }

  /**
   * Select item
   * @returns the disabled status of the input
   */
  @Method()
  async selectItem(index: number) {
    const item = this._listItems[index];

    if (item.classList.contains('disabled')) {
      return true;
    }

    this._listItems[index].click();

    return false;
  }

  /**
   * Update list items
   */
  @Method()
  async updateList() {
    requestAnimationFrame(() => {
      this.renderedList = this._renderList();
    });
  }

  private _handleOutsideClick() {
    if (!this.isOpen) return;

    this.close();
  }

  private _inputSize = {
    height: 0,
    width: 0,
  };

  private _openedOnTop = false;

  private _hideDetails = false;

  private _highlightMatchingText(value: string) {
    const { query } = this.parent as HTMLCAutocompleteElement;

    if (this.parent.tagName === 'C-SELECT' || query === '') return value;

    const regex = new RegExp(query, 'gi');

    const highlighted = value
      .replace(/(<([^>]+)>)/gi, '')
      .replace(regex, (match) => `<mark>${match}</mark>`);

    return highlighted;
  }

  private _getParentPosition() {
    return this.parent.shadowRoot
      .querySelector('.c-input__slot')
      .getBoundingClientRect();
  }

  private _positionMenu() {
    const { innerWidth, innerHeight } = window;

    this._dialog.style.width = 'auto';
    this._dialog.style.opacity = '0';

    this._dialog.showModal();

    requestAnimationFrame(() => {
      let inputSlot = 'input-top';

      const { top: parentTop, width } = this._getParentPosition();

      const inputSize = this.el.getBoundingClientRect();

      this._inputSize = {
        height: inputSize.height,
        width: inputSize.width,
      };

      if (!this._isMobile) {
        this._dialog.style.width = `${width}px`;
        this._dialog.style.top = `${inputSize.top}px`;
        this._dialog.style.bottom = 'auto';
        this._dialog.style.left = `${inputSize.left}px`;

        const { bottom, right, height } = this._dialog.getBoundingClientRect();

        const isInView = {
          x: right < innerWidth,
          y: bottom < innerHeight,
        };

        const fitsOnTop = parentTop - height > 0;

        if (!fitsOnTop && !isInView.y) {
          this._dialog.style.maxHeight = `${parentTop}px`;
        }

        if (!isInView.y || this._openedOnTop) {
          this._openedOnTop = true;

          this._inputElement.hideDetails = true;
          inputSlot = 'input-bottom';

          this._dialog.style.top = 'auto';
          this._dialog.style.bottom = `${innerHeight - inputSize.top - 44}px`;
        }
      }

      this._dummyElement.style.width = `${this._getParentPosition().width}px`;
      this._dummyElement.style.height = `${this._inputSize.height}px`;
      this._dummyElement.style.display = 'block';
      this._dummyElement.slot = 'default';

      this._inputElement.slot = inputSlot;

      this._inputElement.hideDetails = true;

      this._dialog.style.opacity = '1';

      const input = this.parent.shadowRoot.querySelector('input');

      input.focus();
    });
  }

  private _minimumQueryItem() {
    const { query, loading, minimumQueryLength, minimumQueryLengthMessage } =
      this.parent as HTMLCAutocompleteElement;

    if (
      this.type !== 'autocomplete' ||
      query?.length > minimumQueryLength ||
      loading
    )
      return;

    return (
      <li>
        <c-icon
          path={mdiInformation}
          size={18}
          color="var(--c-info-600)"
        ></c-icon>
        {minimumQueryLengthMessage.replace(
          '{n}',
          minimumQueryLength.toString(),
        )}
      </li>
    );
  }

  private _emptyItem() {
    const { query, loading, noMatchingItemsMessage } = this
      .parent as HTMLCAutocompleteElement;

    if (!query || loading) return;

    return (
      <li>
        <c-icon path={mdiAlert} size={18} color="var(--c-warning-600)"></c-icon>
        {noMatchingItemsMessage}
      </li>
    );
  }

  private _renderList() {
    return this.itemType === 'option'
      ? this._renderOptionsList()
      : this._renderItemsList();
  }

  private _renderOptionsList() {
    if (!this.items.length)
      return this._minimumQueryItem() || this._emptyItem();

    const options = Array.from(this.items) as HTMLCOptionElement[];

    this._listItems.length = 0;

    return options.map((option, index) => {
      const optionValue = option.querySelector('c-option-value');

      if (optionValue) {
        optionValue.innerHTML = this._highlightMatchingText(
          optionValue.textContent,
        );
      }

      return (
        <li
          ref={(el) => this._listItems.push(el)}
          id={`${this.hostId}-option-${option.value}`}
          tabindex="-1"
          role="option"
          aria-set-size={this.items.length.toString()}
          aria-pos-in-set={(index + 1).toString()}
          aria-selected={(!!option.selected).toString()}
          class={{ disabled: !!option.disabled }}
          data-name={option.name}
          onClick={(event) => {
            if (option.disabled) {
              event.preventDefault();

              return;
            }

            this.selectOption.emit({ name: option.name, value: option.value });
          }}
          innerHTML={option.outerHTML}
        ></li>
      );
    });
  }

  private _renderItemsList() {
    if (!this.items.length)
      return this._minimumQueryItem() || this._emptyItem();

    this._listItems.length = 0;

    return (this.items as unknown as CAutocompleteItem[]).map((item, index) => {
      return (
        <li
          ref={(el) => this._listItems.push(el)}
          id={`${this.hostId}-option-${item.value}`}
          tabindex="-1"
          role="option"
          aria-set-size={this.items.length.toString()}
          aria-pos-in-set={(index + 1).toString()}
          aria-selected={(this.index === index).toString()}
          class={{ disabled: !!item.disabled }}
          data-name={item.name}
          onClick={(event) => {
            if (item.disabled) {
              event.preventDefault();

              return;
            }

            this.selectOption.emit({ name: item.name, value: item.value });
          }}
        >
          <span innerHTML={this._highlightMatchingText(item.name)}></span>
        </li>
      );
    });
  }

  private _updateStatusText() {
    if (this._debounce !== null) {
      clearTimeout(this._debounce);
      this._debounce = null;
    }

    this._debounce = window.setTimeout(() => {
      const selection = this._listItems[this.index];

      const ending = !!this.items.length
        ? ', to navigate use up and down arrows'
        : '';

      const total = this._listItems.length;

      const position = this.index + 1;

      const isDisabled = !!selection?.classList?.contains('disabled');

      const beginning = isDisabled ? 'Disabled option - ' : '';

      let selectionText = !!selection
        ? `${beginning}${selection.dataset.name} -  ${position} of ${total} is highlighted`
        : null;

      if (this.index === null && this.type === 'autocomplete') {
        selectionText = this.items.length
          ? `${this.items.length} result${
              this.items.length !== 1 ? 's' : ''
            } available`
          : 'No search results available';
      }

      this.statusText = `${selectionText || ending}`;

      this._debounce = null;
    }, 1400);
  }

  render() {
    if (
      !this._isMobile &&
      this._dialog &&
      this.itemsPerPage &&
      this.itemsPerPage > 0 &&
      this.items.length > this.itemsPerPage
    ) {
      this._dialog.style.maxHeight = 42 * (this.itemsPerPage + 0.5) + 60 + 'px';
      this._list.style.maxHeight = 42 * (this.itemsPerPage + 0.5) + 'px';
    }

    return (
      <Host>
        <slot name="default"></slot>

        <div class="dummy" ref={(el) => (this._dummyElement = el)}></div>

        <dialog
          tabindex="-1"
          ref={(el) => (this._dialog = el)}
          class={{ mobile: this._isMobile }}
          onCancel={() => this.close()}
        >
          <div onClick={(event) => event.stopPropagation()}>
            <div
              id={'announce-' + this.hostId}
              class="visuallyhidden"
              aria-live="polite"
              aria-atomic="true"
            >
              {this.statusText}
            </div>

            <div class="input-top-wrapper">
              <slot name="input-top"></slot>
            </div>

            <ul
              ref={(el) => (this._list = el)}
              id={`${this.hostId}--results`}
              role="listbox"
              aria-expanded={this.isOpen.toString()}
              class={{ active: this.isOpen, mobile: this._isMobile }}
              tabindex="-1"
            >
              {this.renderedList}
            </ul>

            <div
              class={{
                active: this._openedOnTop,
                'input-bottom-wrapper': true,
              }}
            >
              <slot name="input-bottom"></slot>
            </div>
          </div>
        </dialog>
      </Host>
    );
  }
}
