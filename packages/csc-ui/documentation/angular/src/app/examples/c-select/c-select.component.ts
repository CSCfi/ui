import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-select',
  templateUrl: './c-select.component.html',
  styleUrls: ['./c-select.component.scss'],
})
export class CSelectComponent implements OnInit {
  // @example-start|basic
  value = null;
  // @example-end

  // @example-start|scrollable|shadow
  selection = null;
  // @example-end

  // @example-start|scrollable|basic|shadow
  items = [
    { name: 'Banana', value: 'banana' },
    { name: 'Pineapple', value: 'pineapple' },
    { name: 'Apple', value: 'apple' },
    { name: 'Orange', value: 'orange' },
    { name: 'Pear', value: 'pear' },
    { name: 'Lemon', value: 'lemon' },
  ];
  // @example-end

  constructor() {}

  ngOnInit(): void {}
}
