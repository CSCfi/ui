import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-consent',
  templateUrl: './c-consent.component.html',
  styleUrls: ['./c-consent.component.scss'],
})
export class CConsentComponent implements OnInit {
  template = `<c-button (click)="consent = true">Show consent</c-button>

<c-consent *ngIf="consent">
  <span>
    Our service uses cookies to ensure you get the best experience. It may also include third
    party cookies.
    <c-link href="https://www.csc.fi">Read more</c-link>
  </span>
  <c-spacer></c-spacer>
  <c-button ghost (click)="consent = false">Deny</c-button>
  <c-button (click)="consent = false">Accept</c-button>
</c-consent>`;

  consent = false;
  constructor() {}

  ngOnInit(): void {}
}
