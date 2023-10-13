import { Component, Element, Host, Prop, State, Watch, h } from '@stencil/core';
import { CSelectItem } from '../../types';

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
  @Prop() items: CSelectItem[] = [];

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
   * Id of the input element
   */
  @Prop() inputId: string;

  @State() currentIndex: number = null;

  @State() isVisible = false;

  @State() topPosition: number;

  @State() scrollingParent: HTMLElement;

  @State() statusText = '';

  private _id = '';

  @Watch('isOpen')
  onOpenStateChange(open) {
    if (open) {
      this._onOpen();
      this._createEventListeners();

      requestAnimationFrame(() => {
        this._listElement.focus();
      });

      return;
    }

    this._onClose();
    this._removeEventListeners();
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
      this._listElement.setAttribute('aria-activedescendant', itemId);
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

    // return (
    //   <div
    //     class={{
    //       'c-input-menu__item-wrapper': true,
    //     }}
    //   >
    //     <ul
    //       id={'results_' + this.hostId}
    //       class="active"
    //       // aria-activedescendant={this.activeListItemId}
    //       // aria-expanded={this.menuVisible.toString()}
    //       // style={style}
    //       // title={this.label || this.placeholder}
    //       // class={
    //       //   this.menuVisible
    //       //     ? 'c-input-menu__items'
    //       //     : 'c-input-menu__items c-input-menu__items--hidden'
    //       // }
    //       role="listbox"
    //     >
    //       {this.items.map((item, index) => this._renderMenuItem(item, index))}
    //     </ul>
    //   </div>
    // );
  }

  private _onOpen() {
    this.parent.shadowRoot.querySelector('.c-input').classList.add('active');
    this._listElement.classList.add('active');
    this._listElement.ariaExpanded = 'true';
    this._listElement.tabIndex = 0;
  }

  private _onClose(focusInput = false) {
    this.parent.shadowRoot.querySelector('.c-input').classList.remove('active');
    this._listElement.classList.remove('active');
    this._listElement.ariaExpanded = 'false';
    this._listElement.tabIndex = -1;

    if (focusInput) {
      this.parent.shadowRoot.querySelector('input').focus();
    }
  }

  private _onSelect(index: number, focusInput = false) {
    const isDisabled = this._itemRefs[index].classList.contains('disabled');

    if (isDisabled) return;

    this.parent.onItemSelection(index);
    this._onClose(focusInput);

    this._itemRefs.forEach((item, i) => {
      item.ariaSelected = (i === index).toString();

      if (i === index) {
        this._listElement.setAttribute(
          'aria-activedescendant',
          item.id ?? null,
        );
      }
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

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

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
        x: right < viewportWidth,
        y: bottom < viewportHeight,
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
    const letterNumber = /^[0-9a-zA-Z]+$/;

    if (event.key.match(letterNumber) && event.key.length === 1) {
      this.isOpen = true;

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

      function isItem(element) {
        return element === selectedItem;
      }

      if (selectedItem) {
        this.currentIndex = this.items.findIndex(isItem);

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

    this._handleCurrentIndexChange();
  }

  private _handleCurrentIndexChange() {
    if (this.currentIndex === null) return;

    this._updateStatusText();

    requestAnimationFrame(() => this._itemRefs[this.currentIndex].focus());
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

      const selectionText = !!selection
        ? `${beginning}${selection.dataset.value} -  ${selection.ariaPosInSet} of ${selection.ariaSetSize} is highlighted`
        : null;

      this.statusText = `${selectionText || ending}`;

      this._debounce = null;
    }, 100);
  }

  componentWillLoad() {
    this.currentIndex = this.index;
    this._renderMenu();
  }

  render() {
    return (
      <Host>
        <div
          id={'announce-' + this._id}
          class="visuallyhidden"
          aria-live="assertive"
          aria-atomic="true"
        >
          {this.statusText}
        </div>
      </Host>
    );
  }
}
