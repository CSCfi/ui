import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-link',
  templateUrl: './c-link.component.html',
  styleUrls: ['./c-link.component.scss'],
})
export class CLinkComponent implements OnInit {
  template = `<c-link href="https://csc.fi">Default link</c-link>

  <c-link href="https://csc.fi" [underline]="true">Underlined link</c-link>`;

  constructor() {}

  ngOnInit(): void {}
}
