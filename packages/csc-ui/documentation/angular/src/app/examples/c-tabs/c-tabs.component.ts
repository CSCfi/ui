import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-tabs',
  templateUrl: './c-tabs.component.html',
  styleUrls: ['./c-tabs.component.scss'],
})
export class CTabsComponent implements OnInit {
  value = 'tab1';

  constructor() {}

  ngOnInit(): void {}
}
