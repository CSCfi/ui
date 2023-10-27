import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-tab-buttons',
  templateUrl: './c-tab-buttons.component.html',
  styleUrls: ['./c-tab-buttons.component.scss'],
})
export class CTabButtonsComponent implements OnInit {
  // @example-start|customValues
  currentTab = 'three';
  // @example-end

  // @example-start|indexes
  currentTabIndex = 1;
  // @example-end

  constructor() {}

  ngOnInit(): void {}
}
