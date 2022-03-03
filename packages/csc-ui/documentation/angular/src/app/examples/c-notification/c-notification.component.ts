import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-notification',
  templateUrl: './c-notification.component.html',
  styleUrls: ['./c-notification.component.scss'],
})
export class CNotificationComponent implements OnInit {
  templates = [
    `<c-button (click)="addNotification()">Add notification</c-button>
  
    <c-notification [notification]="notification"></c-notification>`,
    `<c-row gap="16">
  <c-text-field label="Message" cControl [(ngModel)]="message"></c-text-field>

  <c-select label="Type" name="type" cControl [(ngModel)]="type" [items]="types"></c-select>

  <c-text-field label="Showing time" cControl number [(ngModel)]="delay"></c-text-field>

  <c-select
    label="Requires closing"
    name="type"
    cControl
    [(ngModel)]="requiresClosing"
    [items]="requiresClosingOptions"
  ></c-select>

  <c-select
    label="Position"
    name="type"
    cControl
    [(ngModel)]="position"
    [items]="positions"
  ></c-select>

  <c-button (click)="customNotification()">Add notification</c-button>
</c-row>

<c-notification [notification]="notification" [position]="position?.value"></c-notification>`,
  ];
  scripts = [
    `
notification = {};

addNotification() {
  this.notification = {
    name: 'This is an example',
    type: 'success',
    delay: 5,
  };
}
`,
    `delay = 2;
types = [
  {
    name: 'Warning',
    value: 'warning',
  },
  {
    name: 'Error',
    value: 'error',
  },
  {
    name: 'Success',
    value: 'success',
  },
  {
    name: 'Info',
    value: 'info',
  },
];

positions = [
  {
    name: 'Fixed',
    value: 'fixed',
  },
  {
    name: 'Absolute',
    value: 'absolute',
  },
];

requiresClosingOptions = [
  {
    name: 'No',
    value: false,
  },
  {
    name: 'Yes',
    value: true,
  },
];

requiresClosing = this.requiresClosingOptions[0];
position = this.positions[0];
type = this.types[0];
notification = {};
message = 'Example text';

customNotification() {
  this.notification = {
    name: this.message,
    type: this.type?.value,
    delay: this.delay,
    requiresClosing: this.requiresClosing.value,
  };
}`,
  ];
  delay = 2;
  types = [
    {
      name: 'Warning',
      value: 'warning',
    },
    {
      name: 'Error',
      value: 'error',
    },
    {
      name: 'Success',
      value: 'success',
    },
    {
      name: 'Info',
      value: 'info',
    },
  ];
  positions = [
    {
      name: 'Fixed',
      value: 'fixed',
    },
    {
      name: 'Absolute',
      value: 'absolute',
    },
  ];
  requiresClosingOptions = [
    {
      name: 'No',
      value: false,
    },
    {
      name: 'Yes',
      value: true,
    },
  ];
  requiresClosing = this.requiresClosingOptions[0];
  position = this.positions[0];
  type = this.types[0];
  notification = {};
  message = 'Example text';

  addNotification() {
    this.notification = {
      name: 'This is an example',
      type: 'success',
      delay: 5,
    };
  }

  customNotification() {
    this.notification = {
      name: this.message,
      type: this.type?.value,
      delay: this.delay,
      requiresClosing: this.requiresClosing.value,
    };
  }

  constructor() {}

  ngOnInit(): void {}
}
