import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-radio-group',
  templateUrl: './c-radio-group.component.html',
  styleUrls: ['./c-radio-group.component.scss'],
})
export class CRadioGroupComponent implements OnInit {
  items = {
    default: [
      { label: 'Radio 1', value: 'one' },
      { label: 'Radio 2', value: 'two' },
      { label: 'Radio 3', value: 'three' },
    ],
    disabled: [
      { label: 'Radio 1', value: 'one--disabled' },
      { label: 'Radio 2', value: 'two--disabled' },
      { label: 'Radio 3', value: 'three--disabled' },
    ],
  };

  selectedValue = 'one';
  selectedItem = this.items.default[1];
  selectedItemDisabled = this.items.disabled[2];

  raw = {
    default: `<c-radio-group
      cControl
      label="Example radio buttons"
      [items]="items"
      [(ngModel)]="selectedItem"
    ></c-radio-group>

    <p style="margin-top: 16px">Selected item: {{ selectedItem.label }}</p>`,

    slot: `<c-radio-group
    [items]="items.default"
    [(ngModel)]="selectedValue"
    return-value
    cControl
  >
    Choose one of the following
    <c-link href="https://csc.fi" underline>options</c-link>
  </c-radio-group>

  <p style="margin-top: 16px">Selected value: {{ selectedValue }}</p>`,

    disabled: `<c-radio-group
      cControl
      label="Disabled radio buttons"
      [items]="items"
      [(ngModel)]="selectedItem"
      disabled
    ></c-radio-group>

    <p style="margin-top: 16px">Selected item: {{ selectedItem.label }}</p>`,
  };

  script = {
    default: `items = [
      { label: 'Radio 1', value: 'one' },
      { label: 'Radio 2', value: 'two' },
      { label: 'Radio 3', value: 'three' },
    ];

    selectedItem = this.items[1];`,
    slot: `items = [
      { label: 'Radio 1', value: 'one' },
      { label: 'Radio 2', value: 'two' },
      { label: 'Radio 3', value: 'three' },
    ];

    selectedValue = 'one';`,
    disabled: `items = [
      { label: 'Radio 1', value: 'one--disabled' },
      { label: 'Radio 2', value: 'two--disabled' },
      { label: 'Radio 3', value: 'three--disabled' },
    ];

    selectedItem = this.items[2];`,
  };

  constructor() {}

  ngOnInit(): void {}
}
