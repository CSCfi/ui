import { Component, OnInit } from '@angular/core';
import { CNotificationItem, CNotificationItemType, CSelectItem } from '../../../../../../src/types';

@Component({
  selector: 'app-c-notification',
  templateUrl: './c-notification.component.html',
  styleUrls: ['./c-notification.component.scss'],
})
export class CNotificationComponent implements OnInit {
  /*
  // @example-start|basic
  import { CNotificationItem } from 'csc-ui';
  // @example-end
  */

  /*
  // @example-start|custom
  import { CNotificationItem, CNotificationItemType, CSelectItem } from 'csc-ui';
  // @example-end
  */

  // @example-start|basic
  basicNotification: CNotificationItem;
  // @example-end

  // @example-start|custom
  notification: CNotificationItem;
  // @example-end

  // @example-start|basic
  addNotification() {
    this.basicNotification = {
      name: 'This is an example',
      type: 'success',
      delay: 5,
    };
  }
  // @example-end

  // @example-start|custom
  delay = 2;

  types: CSelectItem[] = [
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

  positions: CSelectItem[] = [
    {
      name: 'Fixed',
      value: 'fixed',
    },
    {
      name: 'Absolute',
      value: 'absolute',
    },
  ];

  requiresClosingOptions: CSelectItem[] = [
    {
      name: 'No',
      value: false,
    },
    {
      name: 'Yes',
      value: true,
    },
  ];

  requiresClosing = false;

  position = 'fixed';

  type: CNotificationItemType = 'warning';

  message = 'Example text';

  addCustomNotification() {
    this.notification = {
      name: this.message,
      type: this.type,
      delay: this.delay,
      requiresClosing: this.requiresClosing,
    };
  }
  // @example-end

  constructor() {}

  ngOnInit(): void {}
}
