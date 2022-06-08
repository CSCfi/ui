import { Component } from '@angular/core';
import { CAlertType, CRadioGroupItem } from '../../../../../../src/types';

@Component({
  selector: 'app-c-alert',
  templateUrl: './c-alert.component.html',
  styleUrls: ['./c-alert.component.scss'],
})
export class CAlertComponent {
  /*
  // @example-start|basic
  import { CAlertType, CRadioGroupItem } from 'csc-ui';
  // @example-end
  */

  // @example-start|basic
  type: CAlertType = CAlertType.Info;

  types: CRadioGroupItem[] = [
    { value: '', label: 'Default' },
    { value: CAlertType.Info, label: 'Info' },
    { value: CAlertType.Success, label: 'Success' },
    { value: CAlertType.Warning, label: 'Warning' },
    { value: CAlertType.Error, label: 'Error' },
  ];
  // @example-end
}
