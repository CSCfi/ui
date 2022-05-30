import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-consent',
  templateUrl: './c-consent.component.html',
  styleUrls: ['./c-consent.component.scss'],
})
export class CConsentComponent implements OnInit {
  // @example-start|basic
  consent = false;
  // @example-end

  constructor() {}

  ngOnInit(): void {}
}
