import { FunctionalComponent, h } from '@stencil/core';
import { CAutocompleteItem } from '../../types';

// const created = new CustomEvent('itemcreated');

export const DropdownOptionsItem: FunctionalComponent<CAutocompleteItem> = (
  props,
  children,
) => [<li data-value={props.value}></li>, children];
