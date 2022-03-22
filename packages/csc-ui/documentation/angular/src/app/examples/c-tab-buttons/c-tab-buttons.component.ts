import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-tab-buttons',
  templateUrl: './c-tab-buttons.component.html',
  styleUrls: ['./c-tab-buttons.component.scss'],
})
export class CTabButtonsComponent implements OnInit {
  currentTab = 'three';
  currentTabIndex = 1;

  constructor() {}

  ngOnInit(): void {}
}
