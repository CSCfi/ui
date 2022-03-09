import { Component } from '@angular/core';

@Component({
  selector: 'app-c-tabs',
  templateUrl: './c-tabs.component.html',
  styleUrls: ['./c-tabs.component.scss'],
})
export class CTabsComponent {
  value = 'tab1';
  tab = 'tab1';

  onTabChange() {
    this.tab = 'tab2';
  }
}
