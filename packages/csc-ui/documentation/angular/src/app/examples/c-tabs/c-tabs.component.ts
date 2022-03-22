import { Component } from '@angular/core';

@Component({
  selector: 'app-c-tabs',
  templateUrl: './c-tabs.component.html',
  styleUrls: ['./c-tabs.component.scss'],
})
export class CTabsComponent {
  example = {
    angular: {
      template: `<c-tabs cControl [(ngModel)]="tab">
  <c-tab value="tab1">One</c-tab>
  <c-tab value="tab2">Two</c-tab>
  <c-tab value="tab3">Three</c-tab>
</c-tabs>

<p *ngIf="tab === 'tab1'">This is tab one</p>
<p *ngIf="tab === 'tab2'">And this is tab two</p>
<p *ngIf="tab === 'tab3'">Here is tab three</p>

<c-row><c-button (click)="onTabChange()">Select tab two</c-button></c-row>`,
      script: `tab = 'tab1';

onTabChange() {
  this.tab = 'tab2';
}`,
    },
  };

  tab = 'tab1';

  onTabChange() {
    this.tab = 'tab2';
  }
}
