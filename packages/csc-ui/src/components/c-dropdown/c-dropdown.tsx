import {
  Component,
  Element,
  Host,
  Method,
  Prop,
  State,
  Watch,
  h,
} from '@stencil/core';
import { CAutocompleteItem, CSelectItem } from '../../types';
import { mdiAlert } from '@mdi/js';

export type _CDropdownUpdateParams = {
  items?: CSelectItem[] | CAutocompleteItem[];
  options?: Record<string, HTMLCOptionElement>;
};

@Component({
  tag: 'c-dropdown',
  styleUrl: 'c-dropdown.scss',
  shadow: true,
})
export class CDropdown {
  @Element() el: HTMLCDropdownElement;

  /**
   * Dropdown items
   */
  @Prop() items: CSelectItem[] | CAutocompleteItem[] = [];

  @Watch('items')
  onItemsChange() {
    if (!this.items.length) return;

    this._updateMenuItems();
  }

  /**
   * Dropdown options
   */
  @Prop() options: Record<string, HTMLCOptionElement>;

  @Watch('options')
  onOptionsChange() {
    if (!Object.keys(this.options).length) return;

    this._updateMenuItems();
  }

  /**
   * Items per page before adding scroll
   */
  @Prop() itemsPerPage: number;

  /**
   * Dropdown parent
   */
  @Prop() parent: HTMLCSelectElement | HTMLCAutocompleteElement;

  /**
   * Initial value index
   */
  @Prop() index: number;

  /**
   * Dropdown open state
   */
  @Prop() isOpen = false;

  /**
   * Focus dropdown on open
   */
  @Prop() focusList: boolean;

  /**
   * Id of the input element
   */
  @Prop() inputId: string;

  /**
   * Type of the parent element
   */
  @Prop() type: 'select' | 'autocomplete';

  /**
   * @private
   */
  @Prop() wasClicked = false;

  @State() currentIndex: number = null;

  @State() isVisible = false;

  @State() topPosition: number;

  @State() statusText = '';

  private _id = '';

  /**
   * @private
   */
  @Method()
  async updateDropdown(params: _CDropdownUpdateParams) {
    this.items = [];
    this._itemRefs = [];
    this.options = {};

    requestAnimationFrame(() => {
      this.currentIndex = null;
      this.items = params.items || this.items;
      this.options = params.options || this.options;

      this._updateMenuItems();
      this._updateStatusText();
    });
  }

  /**
   * @private
   */
  @Method()
  async open(focusList = false) {
    if (this.isOpen) return;

    this._onOpen();
    this._createEventListeners();

    this._outsideClickFn = this._handleOutsideClick.bind(this);

    requestAnimationFrame(() => {
      if (focusList) {
        if (this.type === 'autocomplete') {
          this.currentIndex = 0;
        }

        this._handleCurrentIndexChange();
      }

      this._positionMenu();

      window.addEventListener('click', this._outsideClickFn);
    });
  }

  /**
   * @private
   */
  @Method()
  async close() {
    this._openedOnTop = false;
    this._onClose();

    window.removeEventListener('click', this._outsideClickFn);
  }

  /**
   * @private
   */
  @Method()
  async focusItem(type: number) {
    requestAnimationFrame(() => {
      this.currentIndex = type;

      this._itemRefs[this.currentIndex].focus();
    });
  }

  @Watch('currentIndex')
  onCurrentIndexChange() {
    this._handleCurrentIndexChange();
  }

  private _debounce = null;

  private _itemRefs: HTMLLIElement[] = [];

  private _listElement: HTMLUListElement;

  private _dialogElement: HTMLDialogElement;

  private _inputElement: HTMLCInputElement;

  private _dummyElement: HTMLDivElement;

  private _inputSize = {
    height: 0,
    width: 0,
  };

  private _hideDetails = false;

  private _openedOnTop = false;

  private _resizeObserver: ResizeObserver;

  private _outsideClickFn: () => void;

  private get _listSize() {
    return this.items.length || 0;
  }

  private get _firstSelectableIndex() {
    return this.items.findIndex((item) => !item.disabled);
  }

  private get _lastSelectableIndex() {
    return this.items.findLastIndex((item) => !item.disabled);
  }

  private _highlightMatchingText(value: string) {
    if (
      this.type === 'select' ||
      (this.parent as HTMLCAutocompleteElement).query === ''
    )
      return value;

    const regex = new RegExp(
      (this.parent as HTMLCAutocompleteElement).query,
      'gi',
    );

    const highlighted = value
      .replace(/(<([^>]+)>)/gi, '')
      .replace(regex, (match) => `<mark>${match}</mark>`);

    return highlighted;
  }

  private _renderMenuItem = (item: CSelectItem, index: number) => {
    const isActive = this.items[this.currentIndex]?.value === item.value;

    let itemId = 'none';

    if (typeof item?.value === 'string') {
      itemId = item.value.replace(/[^a-zA-Z0-9-_]/g, '');
    }

    itemId = `item_${this.inputId}--${itemId}`;

    if (isActive) {
      this.currentIndex = index;
      this.parent.setActiveDescendant(itemId);
    }

    const listItem = document.createElement('li');

    // a11y
    listItem.role = 'option';
    listItem.ariaPosInSet = (index + 1).toString();
    listItem.ariaSetSize = this.items.length.toString();

    listItem.ariaSelected = isActive.toString();

    listItem.id = itemId;
    listItem.dataset.value = item.name;
    listItem.setAttribute('tabindex', '-1');

    listItem.classList.toggle('disabled', !!item.disabled);

    listItem.addEventListener('click', (event: MouseEvent) => {
      const isDisabled = this._itemRefs[index].classList.contains('disabled');

      if (isDisabled) {
        event.preventDefault();

        return;
      }

      this.currentIndex = index;
      this._onSelect(index);
    });

    listItem.addEventListener('focus', () => {
      listItem.classList.add('active');
    });

    listItem.addEventListener('blur', () => {
      listItem.classList.remove('active');
    });

    this._itemRefs.push(listItem);

    if (Object.keys(this.options).length) {
      requestAnimationFrame(() => {
        const option = this.options[item.value as string];

        if (!option) return;

        if (
          (this.parent as HTMLCAutocompleteElement).query?.length &&
          this.type === 'autocomplete'
        ) {
          const optionValue = option.querySelector('c-option-value');

          if (optionValue) {
            optionValue.innerHTML = this._highlightMatchingText(
              optionValue.textContent,
            );
          }
        }

        listItem.appendChild(option);

        this._listElement.appendChild(listItem);
      });

      return;
    }

    const span = document.createElement('span');
    span.innerHTML = this._highlightMatchingText(item.name);

    listItem.appendChild(span);

    this._listElement.appendChild(listItem);
  };

  private _renderEmptyItem() {
    const emptyElement = document.createElement('li');
    emptyElement.tabIndex = -1;

    const icon = document.createElement('c-icon');
    icon.path = mdiAlert;
    icon.size = 18;
    icon.color = 'var(--c-warning-600)';

    emptyElement.appendChild(icon);
    emptyElement.append('No suggestions found');

    this._listElement.replaceChildren(emptyElement);
  }

  private _updateMenuItems() {
    if (!this.items.length) {
      this._renderEmptyItem();

      return;
    }

    this._listElement.replaceChildren();
    this._itemRefs.length = 0;

    this.items.map((item, index) => this._renderMenuItem(item, index));

    requestAnimationFrame(() => {
      this._positionMenu();
    });
  }

  private _renderMenu() {
    this._id = `${this.inputId}--items`;

    this._dialogElement = document.createElement('dialog');

    const listElement = document.createElement('ul');

    const slotElementTop = document.createElement('slot');

    slotElementTop.name = 'input-slot-top';

    this._dialogElement.appendChild(slotElementTop);

    // a11y
    listElement.role = `listbox`;
    listElement.ariaExpanded = this.isVisible.toString();
    listElement.tabIndex = -1;

    listElement.id = this._id;

    this._listElement = listElement;

    this._dialogElement.appendChild(listElement);

    this.el.shadowRoot.appendChild(this._dialogElement);

    this.items.map((item, index) => this._renderMenuItem(item, index));

    this._listElement.addEventListener(
      'keydown',
      this._onKeyboardNavigation.bind(this),
    );

    this._listElement.addEventListener('keyup', this._onKeyDown.bind(this));

    const slotElementBottom = document.createElement('slot');

    slotElementBottom.name = 'input-slot-bottom';

    this._dialogElement.appendChild(slotElementBottom);
  }

  private _onOpen() {
    this.parent.shadowRoot.querySelector('.c-input').classList.add('active');
    this._dialogElement.classList.add('active');
    this._listElement.classList.add('active');
    this.isOpen = true;
    this._listElement.ariaExpanded = 'true';
    this._listElement.tabIndex = 0;

    this._dummyElement.style.width = `${this.parent.clientWidth}px`;
    this._dummyElement.style.height = `${this._inputSize.height}px`;
    this._dummyElement.style.display = 'block';

    this._dummyElement.slot = 'default';

    this._inputElement = this.el.querySelector('c-input');

    this._inputElement.hideDetails = true;
    this._inputElement.slot = 'input-slot-top';

    this._dialogElement.showModal();
  }

  private _onClose(focusInput = false) {
    this.parent.onHideMenu();
    this.parent.shadowRoot.querySelector('.c-input').classList.remove('active');
    this._listElement.classList.remove('active');
    this._listElement.ariaExpanded = 'false';
    this._listElement.tabIndex = -1;
    this.isOpen = false;
    this.currentIndex = this.index;
    this._dialogElement.close();
    this._inputElement.slot = 'default';
    this._inputElement.hideDetails = this._hideDetails;

    this._dummyElement.style.width = '0';
    this._dummyElement.style.display = 'none';

    this._dialogElement.style.width = '0';

    if (focusInput) {
      this.parent.shadowRoot.querySelector('input').focus();
    }
  }

  private _onSelect(index: number, focusInput = false) {
    if (index === null) return;

    const isDisabled = this._itemRefs[index].classList.contains('disabled');

    if (isDisabled) return;

    this.parent.onItemSelection(index);
    this.index = index;
    this._onClose(focusInput);

    this._itemRefs.forEach((item, i) => {
      item.ariaSelected = (i === index).toString();
    });
  }

  private _getParentPosition() {
    return this.parent.shadowRoot
      .querySelector('.c-input__slot')
      .getBoundingClientRect();
  }

  private _positionMenu() {
    const { innerWidth, innerHeight } = window;

    requestAnimationFrame(() => {
      const { bottom: parentBottom, top: parentTop } =
        this._getParentPosition();

      const inputSize = this.el.getBoundingClientRect();

      this._inputSize = {
        height: inputSize.height,
        width: inputSize.width,
      };

      this._dialogElement.style.width = `${this._inputSize.width}px`;
      this._dialogElement.style.top = `${inputSize.top}px`;
      this._dialogElement.style.bottom = 'auto';
      this._dialogElement.style.left = `${inputSize.left}px`;

      const { bottom, right, height } =
        this._dialogElement.getBoundingClientRect();

      this._listElement.style.maxHeight = 'calc(100svh - 52px)';

      const isInView = {
        x: right < innerWidth,
        y: bottom < innerHeight,
      };

      const fitsOnTop = parentTop - height > 0;

      if (!fitsOnTop && !isInView.y) {
        this._dialogElement.style.maxHeight = `${parentTop}px`;
      }

      if (!isInView.y || this._openedOnTop) {
        this._openedOnTop = true;

        this._inputElement.hideDetails = true;
        this._inputElement.slot = 'input-slot-bottom';

        this._dialogElement.style.top = 'auto';
        this._dialogElement.style.bottom = `${
          innerHeight - inputSize.top - 44
        }px`;
        this._inputElement.scrollIntoView();
      }

      this.topPosition = parentBottom;
    });
  }

  private _createEventListeners() {
    requestAnimationFrame(async () => {
      this._listElement.classList.add('active');
    });
  }

  private _onKeyDown(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  private _onKeyboardNavigation(event: KeyboardEvent) {
    this.wasClicked = false;

    if (event.key === 'Enter') {
      this._onSelect(this.currentIndex, true);
    }

    if (event.key === ' ' && !this.isOpen) {
      event.preventDefault();

      this.isOpen = true;
    }

    if ('Tab' === event.key) {
      this._onClose();
    }

    if (event.key === 'Escape') {
      this._onClose(true);
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();

      if (this.currentIndex === null) {
        this.currentIndex = 0;
      } else if (this.isOpen && this.currentIndex + 1 < this._listSize) {
        this.currentIndex += 1;
      }

      this.isOpen = true;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();

      if (this.isOpen && this.currentIndex === 0) {
        this.currentIndex = null;
        this._onClose(true);

        return;
      } else if (this.isOpen && this.currentIndex > 0) {
        this.currentIndex -= 1;
      } else if (this.currentIndex === null) {
        this.currentIndex = this._listSize - 1;
      }

      this.isOpen = true;
    }

    if (event.key === 'Home' && this.isOpen) {
      event.preventDefault();

      this.currentIndex = this._firstSelectableIndex;
    }

    if (event.key === 'End' && this.isOpen) {
      event.preventDefault();

      this.currentIndex = this._lastSelectableIndex;
    }
  }

  private _handleCurrentIndexChange() {
    if (this.currentIndex === null) {
      this.parent?.setActiveDescendant('');

      return;
    }

    this._updateStatusText();

    requestAnimationFrame(() => {
      const item = this._itemRefs[this.currentIndex];

      if (!item) return;

      item?.focus();

      this.parent?.setActiveDescendant(item.id ?? null);
    });
  }

  private _handleOutsideClick(event) {
    if (!event.composedPath().includes(this._dialogElement)) {
      this.close();
    }
  }

  private _updateStatusText() {
    if (this._debounce !== null) {
      clearTimeout(this._debounce);
      this._debounce = null;
    }

    this._debounce = window.setTimeout(() => {
      const selection = this._itemRefs[this.currentIndex];

      const ending = !!this.items.length
        ? ', to navigate use up and down arrows'
        : '';

      const isDisabled = !!selection?.classList?.contains('disabled');

      const beginning = isDisabled ? 'Disabled option - ' : '';

      let selectionText = !!selection
        ? `${beginning}${selection.dataset.value} -  ${selection.ariaPosInSet} of ${selection.ariaSetSize} is highlighted`
        : null;

      if (this.currentIndex === null && this.type === 'autocomplete') {
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

  componentDidLoad() {
    this._hideDetails = this.parent.hideDetails;
    this._renderMenu();
    this._positionMenu();

    this.currentIndex = this.index;

    this._resizeObserver = new ResizeObserver(() => {
      if (!this.isOpen) return;

      this.close();
    });

    this._resizeObserver.observe(window.document.body);
  }

  disconnectedCallback() {
    this._resizeObserver.disconnect();
  }

  render() {
    if (
      this._dialogElement &&
      this.itemsPerPage &&
      this.itemsPerPage > 0 &&
      this.items.length > this.itemsPerPage
    ) {
      this._dialogElement.style.maxHeight =
        42 * (this.itemsPerPage + 0.5) + 'px';
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

        <slot name="default"></slot>

        <div class="dummy" ref={(el) => (this._dummyElement = el)}></div>
      </Host>
    );
  }
}
