import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-radio-group',
  templateUrl: './c-radio-group.component.html',
  styleUrls: ['./c-radio-group.component.scss'],
})
export class CRadioGroupComponent implements OnInit {
  // @example-start|slot
  selectedValue = 'one';
  // @example-end

  // @example-start|basic|slot
  items = [
    { label: 'Radio 1', value: 'one' },
    { label: 'Radio 2', value: 'two' },
    { label: 'Radio 3', value: 'three' },
  ];
  // @example-end

  // @example-start|basic
  selectedItem = this.items[1];
  // @example-end

  // @example-start|disabled
  disabled = [
    { label: 'Radio 1', value: 'one--disabled' },
    { label: 'Radio 2', value: 'two--disabled' },
    { label: 'Radio 3', value: 'three--disabled' },
  ];

  selectedDisabledItem = this.disabled[2];
  // @example-end

  constructor() {}

  ngOnInit(): void {}
}
