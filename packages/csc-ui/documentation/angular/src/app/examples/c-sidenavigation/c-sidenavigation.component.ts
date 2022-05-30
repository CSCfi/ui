import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-sidenavigation',
  templateUrl: './c-sidenavigation.component.html',
  styleUrls: ['./c-sidenavigation.component.scss'],
})
export class CSidenavigationComponent implements OnInit {
  // @example-start|basic
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
  // @example-end

  constructor() {}

  ngOnInit(): void {}
}
