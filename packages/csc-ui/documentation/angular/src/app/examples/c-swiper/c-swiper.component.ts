import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-swiper',
  templateUrl: './c-swiper.component.html',
  styleUrls: ['./c-swiper.component.scss'],
})
export class CSwiperComponent implements OnInit {
  example = `<c-swiper cControl [(ngModel)]="selectedTab">
  <c-swiper-tab
    *ngFor="let tab of tabs; let i = index"
    icon="storage"
    [label]="tab.label"
    [value]="tab.value"
  >
    <i class="mdi mdi-server" slot="icon"></i>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    <span *ngIf="i % 2 === 0">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
  </c-swiper-tab>
</c-swiper>

<p>Active tab: {{ selectedTab }}</p>
  `;

  script = `selectedTab: '1';

tabs = [
  {
    label: 'One',
    value: '1',
  },
  {
    label: 'Two',
    value: '2',
  },
  {
    label: 'Three',
    value: '3',
  },
  {
    label: 'Four',
    value: '4',
  },
  {
    label: 'Five',
    value: '5',
  },
  {
    label: 'Six',
    value: '6',
  },
];
  `;

  selectedTab = '1';

  tabs = [
    {
      label: 'One',
      value: '1',
    },
    {
      label: 'Two',
      value: '2',
    },
    {
      label: 'Three',
      value: '3',
    },
    {
      label: 'Four',
      value: '4',
    },
    {
      label: 'Five',
      value: '5',
    },
    {
      label: 'Six',
      value: '6',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
