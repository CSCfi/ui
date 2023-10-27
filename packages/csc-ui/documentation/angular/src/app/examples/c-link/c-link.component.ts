import { Component, OnInit } from '@angular/core';
import { mdiOpenInNew } from '@mdi/js';

@Component({
  selector: 'app-c-link',
  templateUrl: './c-link.component.html',
  styleUrls: ['./c-link.component.scss'],
})
export class CLinkComponent implements OnInit {
  mdiOpenInNew = mdiOpenInNew;

  constructor() {}

  ngOnInit(): void {}
}
