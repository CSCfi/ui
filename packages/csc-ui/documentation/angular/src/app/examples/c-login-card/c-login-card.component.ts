import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CSelectItem } from '../../../../../../dist/types/types';

@Component({
  selector: 'app-c-login-card',
  templateUrl: './c-login-card.component.html',
  styleUrls: ['./c-login-card.component.scss'],
})
export class CLoginCardComponent implements OnInit {
  form: FormGroup;

  overlay = true;

  errorMessages = {
    required: 'This is a required field',
    pattern: 'No numbers allowed',
    minlength: 'The value must be at least 8 characters long',
  };

  blendModes: CSelectItem[] = [
    { value: 'normal', name: 'normal' },
    { value: 'multiply', name: 'multiply' },
    { value: 'screen', name: 'screen' },
    { value: 'overlay', name: 'overlay' },
    { value: 'darken', name: 'darken' },
    { value: 'lighten', name: 'lighten' },
    { value: 'color-dodge', name: 'color-dodge' },
    { value: 'color-burn', name: 'color-burn' },
    { value: 'hard-light', name: 'hard-light' },
    { value: 'soft-light', name: 'soft-light' },
    { value: 'difference', name: 'difference' },
    { value: 'exclusion', name: 'exclusion' },
    { value: 'hue', name: 'hue' },
    { value: 'saturation', name: 'saturation' },
    { value: 'color', name: 'color' },
    { value: 'luminosity', name: 'luminosity' },
  ];

  blendMode: CSelectItem = this.blendModes[1];

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this._formBuilder.group({
      username: [null, [Validators.required]],
      password: [
        null,
        [Validators.required, Validators.pattern(/^([^0-9]*)$/), Validators.minLength(8)],
      ],
    });
  }

  isValid(field) {
    const input = this.form.get(field);

    return input?.pristine || input?.valid || false;
  }

  errors(field) {
    const errors = Object.keys(this.form.get(field)?.errors || {});

    if (!errors) return '';

    const error = errors[0];

    return this.errorMessages[error] || 'Invalid value';
  }

  onSubmit() {
    alert('Form submitted with the following data: ' + JSON.stringify(this.form.value, null, 2));
    this.form.reset();
  }

  templates = {
    basic: `<form [formGroup]="form">
    <c-login-card background-position="50% 0%" src="assets/high-rise.jpg">
      <c-login-card-title>Login to service</c-login-card-title>

      <c-login-card-content>
        <div>
          Service name provides a platform for you to host your own applications and make them
          accessible over the web.
        </div>

        <c-text-field
          formControlName="username"
          label="Username"
          [valid]="isValid('username')"
          [validation]="errors('username')"
          cControl
        ></c-text-field>

        <c-text-field
          formControlName="password"
          hint="Please do not use numbers in your password"
          label="Password"
          type="password"
          [valid]="isValid('password')"
          [validation]="errors('password')"
          cControl
        ></c-text-field>
      </c-login-card-content>

      <c-login-card-actions justify="space-between">
        <c-button [disabled]="!form.valid" (click)="onSubmit()">Submit</c-button>
      </c-login-card-actions>

      <c-link href="http://csc.fi" underline>Forgot password?</c-link>
    </c-login-card>
  </form>`,
    overlay: `<form [formGroup]="form">
    <c-login-card
      background-position="50% 0%"
      src="assets/wall2.jpg"
      [overlay]="overlay"
      [overlayBlendMode]="blendMode.value"
    >
      <c-login-card-title>Login to service</c-login-card-title>

      <c-login-card-content>
        <div>
          Service name provides a platform for you to host your own applications and make them
          accessible over the web.
        </div>

        <c-text-field
          formControlName="username"
          label="Username"
          [valid]="isValid('username')"
          [validation]="errors('username')"
          cControl
        ></c-text-field>

        <c-text-field
          formControlName="password"
          hint="Please do not use numbers in your password"
          label="Password"
          type="password"
          [valid]="isValid('password')"
          [validation]="errors('password')"
          cControl
        ></c-text-field>
      </c-login-card-content>

      <c-login-card-actions justify="space-between">
        <c-button [disabled]="!form.valid" (click)="onSubmit()">Submit</c-button>
      </c-login-card-actions>

      <c-link href="http://csc.fi" underline>Forgot password?</c-link>
    </c-login-card>
  </form>

  <div class="mt-4">
    <c-row gap="8">
      <c-button class="" (click)="overlay = !overlay">Toggle overlay</c-button>

      <c-select
        [(ngModel)]="blendMode"
        [items]="blendModes"
        label="Overlay blend mode"
        hide-details
        cControl
      ></c-select>
    </c-row>
  </div>`,
  };

  scripts = {
    basic: `form: FormGroup;

errorMessages = {
  required: 'This is a required field',
  pattern: 'No numbers allowed',
  minlength: 'The value must be at least 8 characters long',
};

constructor(private _formBuilder: FormBuilder) {}

ngOnInit() {
  this.form = this._formBuilder.group({
    username: [null, [Validators.required]],
    password: [
      null,
      [Validators.required, Validators.pattern(/^([^0-9]*)$/), Validators.minLength(8)],
    ],
  });
}

isValid(field) {
  const input = this.form.get(field);

  return input?.pristine || input?.valid || false;
}

errors(field) {
  const errors = Object.keys(this.form.get(field)?.errors || {});

  if (!errors) return '';

  const error = errors[0];

  return this.errorMessages[error] || 'Invalid value';
}

onSubmit() {
  alert('Form submitted with the following data: ' + JSON.stringify(this.form.value, null, 2));
  this.form.reset();
}`,
    overlay: `form: FormGroup;

overlay = true;

errorMessages = {
  required: 'This is a required field',
  pattern: 'No numbers allowed',
  minlength: 'The value must be at least 8 characters long',
};

blendModes: CSelectItem[] = [
  { value: 'normal', name: 'normal' },
  { value: 'multiply', name: 'multiply' },
  { value: 'screen', name: 'screen' },
  { value: 'overlay', name: 'overlay' },
  { value: 'darken', name: 'darken' },
  { value: 'lighten', name: 'lighten' },
  { value: 'color-dodge', name: 'color-dodge' },
  { value: 'color-burn', name: 'color-burn' },
  { value: 'hard-light', name: 'hard-light' },
  { value: 'soft-light', name: 'soft-light' },
  { value: 'difference', name: 'difference' },
  { value: 'exclusion', name: 'exclusion' },
  { value: 'hue', name: 'hue' },
  { value: 'saturation', name: 'saturation' },
  { value: 'color', name: 'color' },
  { value: 'luminosity', name: 'luminosity' },
];

blendMode: CSelectItem = this.blendModes[1];

constructor(private _formBuilder: FormBuilder) {}

ngOnInit() {
  this.form = this._formBuilder.group({
    username: [null, [Validators.required]],
    password: [
      null,
      [Validators.required, Validators.pattern(/^([^0-9]*)$/), Validators.minLength(8)],
    ],
  });
}

isValid(field) {
  const input = this.form.get(field);

  return input?.pristine || input?.valid || false;
}

errors(field) {
  const errors = Object.keys(this.form.get(field)?.errors || {});

  if (!errors) return '';

  const error = errors[0];

  return this.errorMessages[error] || 'Invalid value';
}

onSubmit() {
  alert('Form submitted with the following data: ' + JSON.stringify(this.form.value, null, 2));
  this.form.reset();
}`,
  };
}
