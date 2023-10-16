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
  options?: Map<string, HTMLCOptionElement>;
};

@Component({
  tag: 'c-dropdown',
  styleUrl: 'c-dropdown.scss',
  shadow: true,
})
export class CDropdown {
  @Element() host: HTMLCDropdownElement;

  /**
   * Dropdown items
   */
  @Prop() items: CSelectItem[] | CAutocompleteItem[] = [];

  /**
   * Dropdown options
   */
  @Prop() options: Map<string, HTMLCOptionElement>;

  /**
   * Items per page before adding scroll
   */
  @Prop() itemsPerPage: number;

  /**
   * Dropdown parent
   */
  @Prop() parent: HTMLCSelectElement | HTMLCAutocompleteElement;

  /**
   * Dropdown scrolling parent
   */
  @Prop() wrapper: HTMLElement;

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

  @State() scrollingParent: HTMLElement;

  @State() statusText = '';

  private _isOpenedWithKeyboard = false;

  private _id = '';

  /**
   * @private
   */
  @Method()
  async updateDropdown(params: _CDropdownUpdateParams) {
    this.currentIndex = null;
    this.items = params.items || this.items;
    this.options = params.options || this.options;

    this._updateMenuItems();
    this._updateStatusText();
  }

  /**
   * @private
   */
  @Method()
  async focusDropdown() {
    requestAnimationFrame(() => {
      this._listElement.focus();
    });
  }

  @Watch('isOpen')
  onOpenStateChange(open) {
    if (!this.wasClicked && ['select', 'autocomplete'].includes(this.type)) {
      this._isOpenedWithKeyboard = open;
    }

    if (open) {
      this._onOpen();
      this._createEventListeners();

      requestAnimationFrame(() => {
        if (this.focusList) {
          this._listElement.focus();
          this._handleCurrentIndexChange();
        }
      });

      return;
    }

    this._onClose();
    this._removeEventListeners();
  }

  @Watch('currentIndex')
  onCurrentIndexChange() {
    this._handleCurrentIndexChange();
  }

  private _debounce = null;

  private _itemRefs: HTMLLIElement[] = [];

  private _lastKeyPressTime = null;

  private _listElement: HTMLUListElement;

  private _onScrollFn: () => void;

  private _parentTop = 0;

  private _searchString = '';

  private get _listSize() {
    return this.items.length || 0;
  }

  private get _firstSelectableIndex() {
    return this.items.findIndex((item) => !item.disabled);
  }

  private get _lastSelectableIndex() {
    return [...this.items].reverse().findIndex((item) => !item.disabled);
  }

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

    if (this.options.size) {
      listItem.appendChild(this.options.get(item.name));

      this._listElement.appendChild(listItem);

      return;
    }

    listItem.append(item.name);

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

    this._listElement.appendChild(emptyElement);
  }

  private _updateMenuItems() {
    this._listElement.replaceChildren();
    this._itemRefs.length = 0;

    if (!this.items.length) {
      this._renderEmptyItem();

      return;
    }

    this.items.map((item, index) => this._renderMenuItem(item, index));
  }

  private _renderMenu(/* style */) {
    this._id = `${this.inputId}--items`;

    const listElement = document.createElement('ul');

    // a11y
    listElement.role = `listbox`;
    // listElement.ariaActivedescendant = this.activeListItemId;
    listElement.ariaExpanded = this.isVisible.toString();
    listElement.tabIndex = -1;

    listElement.id = this._id;

    this._listElement = listElement;

    this.host.shadowRoot.appendChild(listElement);

    this.items.map((item, index) => this._renderMenuItem(item, index));

    this.scrollingParent = this.wrapper;

    this._listElement.addEventListener(
      'keyup',
      this._onKeyboardNavigation.bind(this),
    );
  }

  private _onOpen() {
    this.parent.shadowRoot.querySelector('.c-input').classList.add('active');
    this._listElement.classList.add('active');
    this._listElement.ariaExpanded = 'true';
    this._listElement.tabIndex = 0;
  }

  private _onClose(focusInput = false) {
    this.parent.onHideMenu();
    this.parent.shadowRoot.querySelector('.c-input').classList.remove('active');
    this._listElement.classList.remove('active');
    this._listElement.ariaExpanded = 'false';
    this._listElement.tabIndex = -1;
    this.isOpen = false;
    this.currentIndex = this.index;

    if (focusInput) {
      this.parent.shadowRoot.querySelector('input').focus();
    }
  }

  private _onSelect(index: number, focusInput = false) {
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
    const { bottom, left, width } = this._getParentPosition();

    this.topPosition = bottom;

    this.host.style.top = `${bottom}px`;
    this.host.style.left = `${left}px`;
    this.host.style.minWidth = `${width}px`;
  }

  private _removeEventListeners() {
    this.scrollingParent.removeEventListener('scroll', this._onScrollFn);
  }

  private _createEventListeners() {
    requestAnimationFrame(async () => {
      this._positionMenu();

      const { bottom, right, height, width } =
        this.host.getBoundingClientRect();

      const {
        top: parentTop,
        height: parentHeight,
        width: parentWidth,
      } = this._getParentPosition();

      this._parentTop = parentTop;

      this._onScrollFn = this._onScroll.bind(this);

      this.scrollingParent.addEventListener('scroll', this._onScrollFn);

      const isInView = {
        x: right < this.scrollingParent.scrollWidth,
        y: bottom < this.scrollingParent.scrollHeight,
      };

      // ------

      if (!isInView.y) {
        const posY = parseFloat(this.host.style.top) - height - parentHeight;

        this.host.style.top = `${posY}px`;
        this.topPosition = posY;
      }

      if (!isInView.x) {
        this.host.style.left = `${
          parseFloat(this.host.style.left) - width + parentWidth
        }px`;
      }

      this._listElement.classList.add('active');
    });
  }

  private _scrollToElement() {
    if (this.items.length > this.itemsPerPage) {
      const itemRef = this._itemRefs[this.currentIndex];

      if (!!itemRef) {
        this._observer.observe(itemRef);
      }
    }
  }

  private _onScroll() {
    const { top: parentTop } = this.parent.getBoundingClientRect();

    const differenceY = this._parentTop - parentTop;

    this.host.style.top = `${this.topPosition - differenceY}px`;
  }

  private _onKeyboardNavigation(event: KeyboardEvent) {
    if (this._isOpenedWithKeyboard) {
      this._isOpenedWithKeyboard = false;

      return;
    }

    this.wasClicked = false;

    const letterNumber = /^[0-9a-zA-Z]+$/;

    if (
      (event.key.match(letterNumber) && event.key.length === 1) ||
      event.key === 'Backspace'
    ) {
      if (this.type === 'autocomplete') {
        this.parent.shadowRoot.querySelector('input').focus();

        const { query } = this.parent as HTMLCAutocompleteElement;

        let updatedQuery = '';

        if (event.key === 'Backspace') {
          updatedQuery = query.slice(0, -1);
        } else {
          updatedQuery = `${query}${event.key}`;
        }

        (this.parent as HTMLCAutocompleteElement).updateQuery(updatedQuery);

        return;
      }
      // this.isOpen = true;

      if (
        Date.now() - this._lastKeyPressTime > 3000 ||
        this._searchString.length > 2
      ) {
        this._searchString = event.key;
      } else {
        this._searchString = `${this._searchString}${event.key}`;
      }

      this._lastKeyPressTime = Date.now();

      const selectedItem = this.items.find((i) =>
        i.name.toLowerCase().startsWith(this._searchString),
      );

      if (selectedItem) {
        this.currentIndex = this.items.findIndex(
          (element) => element === selectedItem,
        );

        if (this.isOpen) {
          this._scrollToElement();
        } else {
          this._onSelect(this.currentIndex, true);
        }
      }
    }

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

      if (this.currentIndex === null) {
        this.currentIndex = 0;
      } else if (this.isOpen && this.currentIndex + 1 < this._listSize) {
        this.currentIndex += 1;
      }

      this.isOpen = true;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (this.isOpen && this.currentIndex > 0) {
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
      this.parent.setActiveDescendant('');

      return;
    }

    this._updateStatusText();

    requestAnimationFrame(() => {
      const item = this._itemRefs[this.currentIndex];

      item?.focus();

      this.parent.setActiveDescendant(item.id ?? null);
    });
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

  componentWillLoad() {
    this._renderMenu();
  }

  componentDidLoad() {
    this.currentIndex = this.index;
  }

  render() {
    if (
      this.itemsPerPage &&
      this.itemsPerPage > 0 &&
      this.items.length > this.itemsPerPage
    ) {
      this._listElement.style.maxHeight = 42 * (this.itemsPerPage + 0.5) + 'px';
      this._listElement.style.overflowY = 'scroll';
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
      </Host>
    );
  }
}
