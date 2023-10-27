import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-checkbox',
  templateUrl: './c-checkbox.component.html',
  styleUrls: ['./c-checkbox.component.scss'],
})
export class CCheckboxComponent implements OnInit {
  // @example-start|basic|disabled
  value = false;
  // @example-end

  constructor() {}

  ngOnInit(): void {}
}
