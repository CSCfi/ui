import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-sidenavigation',
  templateUrl: './c-sidenavigation.component.html',
  styleUrls: ['./c-sidenavigation.component.scss'],
})
export class CSidenavigationComponent implements OnInit {
  template = `<c-sidenavigation>
  <c-sidenavigationitem
    *ngFor="let item of items"
    [active]="currentItem === item"
    (click)="currentItem = item"
  >
    <div slot="main">
      <span class="mdi {{ item.icon }}"></span>
      {{ item.title }}
    </div>
    <div *ngIf="item.subs?.length" slot="subnavitem">
      <c-subnavigationitem *ngFor="let sub of item.subs" href="https://www.csc.fi">
        {{ sub.title }}
      </c-subnavigationitem>
    </div>
  </c-sidenavigationitem>
</c-sidenavigation>`;
  script = `items = [
  {
    title: 'Home',
    icon: 'mdi-home',
  },
  {
    title: 'Something',
    icon: 'mdi-alarm',
    subs: [
      {
        title: 'Link to CSC website',
      },
    ],
  },
  {
    title: 'Logout',
    icon: 'mdi-logout',
  },
];

currentItem = this.items[0];`;

  items = [
    {
      title: 'Home',
      icon: 'mdi-home',
    },
    {
      title: 'Something',
      icon: 'mdi-alarm',
      subs: [
        {
          title: 'Link to CSC website',
        },
      ],
    },
    {
      title: 'Logout',
      icon: 'mdi-logout',
    },
  ];

  currentItem = this.items[0];

  constructor() {}

  ngOnInit(): void {}
}
