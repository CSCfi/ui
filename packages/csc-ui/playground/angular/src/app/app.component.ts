import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  csValue = 2;
  csValue2 = 1;
  tfValue = '';
  swValue = false;
  cbValue = { name: 'Joo', value: '1' };
  test = '';
  form: FormGroup;
  form2: FormGroup;

  constructor() {
    this.form = new FormGroup({
      contentSwitcher: new FormControl(2, [Validators.required]),
      switch: new FormControl(false, [Validators.requiredTrue]),
    });

    this.form2 = new FormGroup({
      contentSwitcher2: new FormControl(1, [Validators.required]),
      switch: new FormControl(false, [Validators.requiredTrue]),
    });
  }

  log(e: Event) {
    console.log('🤡', e.type, (e.target as HTMLInputElement).value);
  }

  setCsValue(e: Event) {
    this.csValue = +(e.target as HTMLInputElement).value;
  }

  setCsValue2(e: Event) {
    this.csValue2 = +(e.target as HTMLInputElement).value;
  }

  onChange(e: Event) {
    console.log(e);
  }
}
