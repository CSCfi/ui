import { Component } from '@angular/core';
import {
  CRadioGroupItem,
  CSelectItem,
  CToastMessage,
  CToastType,
} from '../../../../../../src/types';

@Component({
  selector: 'app-c-toasts',
  templateUrl: './c-toasts.component.html',
  styleUrls: ['./c-toasts.component.scss'],
})
export class CToastsComponent {
  // @example-start|basic
  title = '';

  message = 'A toast message';

  closeText = '';

  type = 'info';

  duration = 6000;

  types: CSelectItem[] = [
    { name: 'Info', value: 'info' },
    { name: 'Success', value: 'success' },
    { name: 'Warning', value: 'warning' },
    { name: 'Error', value: 'error' },
  ];

  absolute = false;

  persistent = false;

  indeterminateCounter = 0;

  verticalOptions: CSelectItem[] = [
    { name: 'Top', value: 'top' },
    { name: 'Bottom', value: 'bottom' },
  ];

  vertical = 'bottom';

  horizontalOptions: CSelectItem[] = [
    { name: 'Left', value: 'left' },
    { name: 'Center', value: 'center' },
    { name: 'Right', value: 'right' },
  ];

  horizontal = 'right';

  onAddToast() {
    const message: CToastMessage = {
      type: this.type as CToastType,
      title: this.title,
      duration: this.duration,
      message: this.message,
      persistent: this.persistent,
      closeText: this.closeText,
    };

    const toasts = document.querySelector('#toasts') as HTMLCToastsElement;
    toasts?.addToast(message);
  }
  // @example-end

  // @example-start|indeterminate
  hasToast = false;

  onAddIndeterminateToast() {
    const message: CToastMessage = {
      type: this.type as CToastType,
      title: 'Indeterminate toast',
      message: 'Close me by pressing the "Remove toast" button',
      indeterminate: true,
      id: 'indeterminate',
    };

    const toasts = document.querySelector('#indeterminateToasts') as HTMLCToastsElement;
    toasts?.addToast(message);
    this.hasToast = true;
  }

  onRemoveIndeterminateToast() {
    const toasts = document.querySelector('#indeterminateToasts') as HTMLCToastsElement;
    toasts?.removeToast('indeterminate');
    this.hasToast = false;
  }
  // @example-end
}
