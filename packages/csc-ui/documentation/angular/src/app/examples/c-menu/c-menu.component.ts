import { Component } from '@angular/core';
import { mdiInformationOutline } from '@mdi/js';

@Component({
  selector: 'app-c-menu',
  templateUrl: './c-menu.component.html',
  styleUrls: ['./c-menu.component.scss'],
})
export class CMenuComponent {
  // @example-start|basic|nohover|small|simple
  items = [
    { name: 'Item 1', action: () => alert('Item 1 selected') },
    { name: 'Item 2', action: () => alert('Item 2 selected') },
    { name: 'Item 3', action: () => alert('Item 3 selected'), disabled: true },
    { name: 'Item 4', action: () => alert('Item 4 selected'), icon: mdiInformationOutline, iconPosition: 'end' },
  ];
  // @example-end
}
