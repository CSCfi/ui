import { Component } from '@angular/core';

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
  ];
  // @example-end
}
