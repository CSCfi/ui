import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-tab-buttons',
  templateUrl: './c-tab-buttons.component.html',
  styleUrls: ['./c-tab-buttons.component.scss'],
})
export class CTabButtonsComponent implements OnInit {
  currentTab = 'three';
  currentTabIndex = 1;

  templates = {
    values: `<c-tab-buttons cControl [(ngModel)]="currentTab">
    <c-button value="one">One</c-button>
    <c-button value="two">Two</c-button>
    <c-button value="three">Three</c-button>
  </c-tab-buttons>

  <c-card-content>Current tab: {{ currentTab }}</c-card-content>

  <c-card-actions>
    <c-button
      (keyup.enter)="currentTab = 'one'"
      (keyup.space)="currentTab = 'one'"
      (click)="currentTab = 'one'"
    >
      Select One
    </c-button>
    <c-button
      (keyup.enter)="currentTab = 'two'"
      (keyup.space)="currentTab = 'two'"
      (click)="currentTab = 'two'"
    >
      Select Two
    </c-button>
    <c-button
      (keyup.enter)="currentTab = 'three'"
      (keyup.space)="currentTab = 'three'"
      (click)="currentTab = 'three'"
    >
      Select Three
    </c-button>
  </c-card-actions>`,
    indexes: `<c-tab-buttons cControl [(ngModel)]="currentTabIndex">
    <c-button>One</c-button>
    <c-button>Two</c-button>
    <c-button>Three</c-button>
  </c-tab-buttons>

  <c-card-content>Current tab: {{ currentTabIndex }}</c-card-content>

  <c-card-actions>
    <c-button
      (keyup.enter)="currentTabIndex = 0"
      (keyup.space)="currentTabIndex = 0"
      (click)="currentTabIndex = 0"
    >
      Select One
    </c-button>
    <c-button
      (keyup.enter)="currentTabIndex = 1"
      (keyup.space)="currentTabIndex = 1"
      (click)="currentTabIndex = 1"
    >
      Select Two
    </c-button>
    <c-button
      (keyup.enter)="currentTabIndex = 2"
      (keyup.space)="currentTabIndex = 2"
      (click)="currentTabIndex = 2"
    >
      Select Three
    </c-button>
  </c-card-actions>`,
  };

  constructor() {}

  ngOnInit(): void {}
}
