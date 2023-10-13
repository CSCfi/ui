import { Component, Method, State, Element, Prop, Watch } from '@stencil/core';
import { CSelectItem } from '../../types';

export type CInputOptionsParamsSelect = {
  type: 'select';
  parent: HTMLCSelectElement;
};

export type CInputOptionsParamsAutoComplete = {
  type: 'auto-complete';
  parent: HTMLCAutocompleteElement;
};

export type CInputOptionsParams = {
  index: number;
  click: boolean;
  items: CSelectItem[];
  options?: Map<string, HTMLCOptionElement>;
} & (CInputOptionsParamsSelect | CInputOptionsParamsAutoComplete);

// export type CInputOptionsParamsMenu = {
//   type: 'menu';
//   items: CMenuOption[];
//   parent: HTMLCMenuElement;
// };

export type Position = {
  bottom: number;
  left: number;
  width: number;
  height: number;
};

/**
 * @group Form
 * @slot Default slot - Use c-option elements only
 */
@Component({
  tag: 'c-input-options',
  styleUrl: 'c-input-options.scss',
  shadow: true,
})
export class CInputOptions {
  @Element() host: HTMLCInputOptionsElement;

  /**
   * Items per page before adding scroll
   */
  @Prop() itemsPerPage = 6;

  @State() currentIndex: number = null;

  @State() scrollingParent: Element;

  @State() topPosition: number;

  @State() isOpen = false;

  private _inputElement: HTMLInputElement;

  private _overlay: HTMLDivElement;

  private _overlayContent: HTMLDivElement;

  private _list: HTMLUListElement;

  private _parent: HTMLCSelectElement | HTMLCAutocompleteElement;

  private _items: CSelectItem[] = [];

  private _parentTop = 0;

  private _listSize = 0;

  private _lastKeyPressTime = null;

  private _searchString = '';

  private _boundFn: () => void;

  private _boundClickFn: () => void;

  private _itemRefs: HTMLLIElement[] = [];

  private get _firstSelectableIndex() {
    return this._items.findIndex((item) => !item.disabled);
  }

  private get _lastSelectableIndex() {
    return [...this._items].reverse().findIndex((item) => !item.disabled);
  }

  @Watch('isOpen')
  onIsOpenChange(isOpen: boolean) {
    this._parent?.shadowRoot
      .querySelector('.c-input')
      .classList.toggle('active', isOpen);
  }

  private _handleCurrentIndexChange() {
    if (this.currentIndex === null) return;

    requestAnimationFrame(() => this._itemRefs[this.currentIndex].focus());
  }

  private _renderList() {
    this._list = document.createElement('ul');

    this._list.addEventListener('keyup', this._onKeyboardNavigation.bind(this));

    this._overlayContent.appendChild(this._list);
  }

  private _renderListItem(child: string | HTMLCOptionElement, index: number) {
    const listItem = document.createElement('li');

    this._itemRefs.push(listItem);

    listItem.setAttribute('tabindex', '-1');
    listItem.setAttribute('role', 'menuitem');

    listItem.append(child);

    listItem.addEventListener('click', () => {
      this._parent.onItemSelection(index);
      this._onClose();
    });

    listItem.addEventListener('focus', () => {
      listItem.classList.add('active');
    });

    listItem.addEventListener('blur', () => {
      listItem.classList.remove('active');
    });

    this._list.appendChild(listItem);
  }

  private _renderListOptions(options: Map<string, HTMLCOptionElement>) {
    for (const [key, option] of options.entries()) {
      this._renderListItem(option, Array.from(options.keys()).indexOf(key));
    }
  }

  private _renderListItems(items: CSelectItem[]) {
    for (const [key, option] of items.entries()) {
      this._renderListItem(option.name, key);
    }
  }

  private _onClose(focusInput = false) {
    this.isOpen = false;
    // this.host.shadowRoot.replaceChildren();

    window.removeEventListener('click', this._boundClickFn);

    this.scrollingParent.removeEventListener('scroll', this._boundFn);

    this._parent = null;

    this._overlay.remove();

    if (focusInput) {
      this._inputElement?.focus();
    }
  }

  private async _getScrollParent(element): Promise<HTMLElement> {
    return new Promise((resolve) => {
      if (!element) {
        resolve(undefined);
      }

      let parent = element.parentNode;

      while (parent) {
        if (parent.shadowRoot === undefined) {
          parent = parent.host;
        } else {
          const { overflow, overflowX } = window.getComputedStyle(parent);

          if (
            overflowX !== 'scroll' &&
            overflow.split(' ').every((o) => o === 'auto' || o === 'scroll')
          ) {
            resolve(parent);
          }

          parent = parent.parentNode;
        }
      }

      resolve(document.documentElement);
    });
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

  private _scrollToElement() {
    if (this._items.length > this.itemsPerPage) {
      const itemRef = this._itemRefs[this.currentIndex];

      if (!!itemRef) {
        this._observer.observe(itemRef);
      }
    }
  }

  private _onKeyboardNavigation(event: KeyboardEvent) {
    this._inputElement = this._parent.shadowRoot.querySelector('input');

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

      const selectedItem = this._items.find((i) =>
        i.name.toLowerCase().startsWith(this._searchString),
      );

      function isItem(element) {
        return element === selectedItem;
      }

      if (selectedItem) {
        this.currentIndex = this._items.findIndex(isItem);

        if (this.isOpen) {
          this._scrollToElement();
        } else {
          this._parent.onItemSelection(this.currentIndex);
        }
      }
    }

    if (event.key === 'Enter') {
      this._parent.onItemSelection(this.currentIndex);
      this._onClose(true);
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

  private _createEventListeners() {
    window.requestAnimationFrame(async () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const { bottom, right, height, width } =
        this._list.getBoundingClientRect();

      const {
        top: parentTop,
        height: parentHeight,
        width: parentWidth,
      } = this._parent.getBoundingClientRect();

      this._parentTop = parentTop;

      this.scrollingParent = await this._getScrollParent(this._parent);

      this._boundFn = this._onScroll.bind(this);

      this.scrollingParent.addEventListener('scroll', this._boundFn);

      const isInView = {
        x: right < viewportWidth,
        y: bottom < viewportHeight,
      };

      // ------

      if (!isInView.y) {
        const posY =
          parseFloat(this._overlayContent.style.top) - height - parentHeight;

        this._overlayContent.style.top = `${posY}px`;
        this.topPosition = posY;
      }

      if (!isInView.x) {
        this._overlayContent.style.left = `${
          parseFloat(this._overlayContent.style.left) - width + parentWidth
        }px`;
      }

      this._list.classList.add('active');

      this._list.focus();
    });
  }

  private _onScroll() {
    const { top: parentTop } = this._parent.getBoundingClientRect();

    const differenceY = this._parentTop - parentTop;

    this._overlayContent.style.top = `${this.topPosition - differenceY}px`;
  }

  private _handleOutsideClick(event) {
    if (!event.composedPath().includes(this.host)) {
      this._onClose();
    }
  }

  /**
   * juu
   * @param params jees
   */
  @Method()
  async createMenuItems(params: CInputOptionsParams) {
    if (this._parent === params.parent) return;

    this._itemRefs.length = 0;
    this.currentIndex = null;

    this._parent = params.parent;

    this._items = params.items;

    this._overlay = document.createElement('div');

    this._overlay.classList.add('c-input-options-overlay');

    this._overlayContent = document.createElement('div');

    this._overlayContent.classList.add('c-input-options-overlay__content');

    this._renderList();

    if (params.type === 'select' && params.options.size) {
      this._listSize = params.options.size;

      this._renderListOptions(params.options);
    } else if (params.type === 'select' && params.items) {
      this._listSize = params.items.length;

      this._renderListItems(params.items);
    }

    this._overlay.appendChild(this._overlayContent);

    this.host.shadowRoot.appendChild(this._overlay);

    this._createEventListeners();

    this._boundClickFn = this._handleOutsideClick.bind(this);

    requestAnimationFrame(() => {
      if (params.click) {
        this.open();
      }

      window.addEventListener('click', this._boundClickFn);

      this.currentIndex = params.index;

      this._handleCurrentIndexChange();
    });
  }

  /**
   * juu
   * @param params jees
   */
  @Method()
  async open() {
    this.isOpen = true;
    this._list.classList.add('active');
  }

  /**
   * juu
   * @param params jees
   */
  @Method()
  async selectItem(index: number) {
    this._itemRefs.forEach((item, i) => {
      item.classList.toggle('active', index === i);
    });
  }

  /**
   * kusi
   * @param options kakka
   */
  @Method()
  async positionMenu(options: Position) {
    this.topPosition = options.bottom;

    this._overlayContent.style.top = `${options.bottom}px`;
    this._overlayContent.style.left = `${options.left}px`;
    this._overlayContent.style.minWidth = `${options.width}px`;
  }
}
