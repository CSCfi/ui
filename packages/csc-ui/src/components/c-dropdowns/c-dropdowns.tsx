import { Component, Element, Host, Method, h } from '@stencil/core';
import { CSelectItem } from '../../types';

export type CDropdownParamsSelect = {
  type: 'select';
  parent: HTMLCSelectElement;
};

export type CDropdownParamsAutoComplete = {
  type: 'autocomplete';
  parent: HTMLCAutocompleteElement;
};

export type _CDropdownParams = {
  index: number;
  click: boolean;
  items: CSelectItem[];
  id: string;
  wrapper?: HTMLElement;
  itemsPerPage?: number;
  options?: Map<string, HTMLCOptionElement>;
} & (CDropdownParamsSelect | CDropdownParamsAutoComplete);

export type Position = {
  bottom: number;
  left: number;
  width: number;
  height: number;
};

@Component({
  tag: 'c-dropdowns',
  styleUrl: 'c-dropdowns.scss',
  shadow: true,
})
export class CDropdowns {
  @Element() host: HTMLCDropdownsElement;

  /**
   * Creates a dropdown
   */
  @Method()
  async createDropdown(params: _CDropdownParams) {
    const element = document.createElement('c-dropdown');

    element.items = params.items;
    element.itemsPerPage = params.itemsPerPage || 6;
    element.options = params.options;
    element.parent = params.parent;
    element.wrapper = params.wrapper;
    element.inputId = params.id;
    element.index = params.index;
    element.type = params.type;

    this.host.shadowRoot.appendChild(element);

    return element;
    // if (this._parent === params.parent) return;
    // this._itemRefs.length = 0;
    // this.currentIndex = null;
    // this._parent = params.parent;
    // this._items = params.items;
    // this._overlay = document.createElement('div');
    // this._overlay.classList.add('c-input-options-overlay');
    // this._overlayContent = document.createElement('div');
    // this._overlayContent.classList.add('c-input-options-overlay__content');
    // this._renderList();
    // if (params.type === 'select' && params.options.size) {
    //   this._listSize = params.options.size;
    //   this._renderListOptions(params.options);
    // } else if (params.type === 'select' && params.items) {
    //   this._listSize = params.items.length;
    //   this._renderListItems(params.items);
    // }
    // this._overlay.appendChild(this._overlayContent);
    // this.host.shadowRoot.appendChild(this._overlay);
    // this._createEventListeners();
    // this._boundClickFn = this._handleOutsideClick.bind(this);
    // requestAnimationFrame(() => {
    //   if (params.click) {
    //     this.open();
    //   }
    //   window.addEventListener('click', this._boundClickFn);
    //   this.currentIndex = params.index;
    //   this._handleCurrentIndexChange();
    // });
  }

  render() {
    return <Host></Host>;
  }
}
