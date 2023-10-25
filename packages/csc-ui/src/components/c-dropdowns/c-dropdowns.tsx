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
  options?: Record<string, HTMLCOptionElement>;
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
  }

  render() {
    return <Host></Host>;
  }
}
