import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-menu',
  templateUrl: './c-menu.component.html',
  styleUrls: ['./c-menu.component.scss'],
})
export class CMenuComponent implements OnInit {
  templates = [
    '<c-menu [items]="items">Basic menu</c-menu>',
    '<c-menu [items]="items" nohover>Menu without hover</c-menu>',
    '<c-menu [items]="items" small>Small menu</c-menu>',
    `<c-menu [items]="items" simple>
  <c-icon-button ghost badge="7">
    <i class="mdi mdi-email-outline"></i>
  </c-icon-button>
</c-menu>`,
  ];

  script = `items = [
  {
    name: 'Item 1',
    action: () => alert('Item 1 selected'),
  },
  {
    name: 'Item 2',
    action: () => alert('Item 2 selected'),
  },
];`;
  items = [
    {
      name: 'Item 1',
      action: () => alert('Item 1 selected'),
    },
    {
      name: 'Item 2',
      action: () => alert('Item 2 selected'),
    },
  ];
  constructor() {}

  ngOnInit(): void {}
}
