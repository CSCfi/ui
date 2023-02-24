import { Component } from '@angular/core';
import { mdiDotsHorizontal, mdiInformationOutline } from '@mdi/js';
import { CMenuCustomTrigger } from '../../../../../../src/types';

@Component({
  selector: 'app-c-menu',
  templateUrl: './c-menu.component.html',
  styleUrls: ['./c-menu.component.scss'],
})
export class CMenuComponent {
  // @example-start|basic|nohover|small|simple|custom
  items = [
    { name: 'Item 1', action: () => alert('Item 1 selected') },
    { name: 'Item 2', action: () => alert('Item 2 selected') },
    { name: 'Item 3', action: () => alert('Item 3 selected'), disabled: true },
    { name: 'Item 4', action: () => alert('Item 4 selected'), icon: mdiInformationOutline, iconPosition: 'end' },
  ];
  // @example-end

  // @example-start|custom
  customTriggerProps: CMenuCustomTrigger = {
    value: 'Custom trigger',
    component: {
      tag: 'c-button',
      params: {
        text: true,
        path: mdiDotsHorizontal,
        title: 'Menu with custom trigger',
        size: 'small',
      },
    },
  };
  // @example-end
}
