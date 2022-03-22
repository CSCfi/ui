import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-c-text-field',
  templateUrl: './c-text-field.component.html',
  styleUrls: ['./c-text-field.component.scss'],
})
export class CTextFieldComponent implements OnInit {
  template = `<form [formGroup]="form">
    <c-card>
      <c-card-title>Login</c-card-title>

      <c-card-content>
        <c-text-field
          formControlName="username"
          label="Username"
          hint="Enter your username"
          [valid]="isValid('username')"
          [validation]="errors('username')"
          cControl
        ></c-text-field>

        <c-text-field
          formControlName="age"
          label="Age"
          type="number"
          hint="Verify your age"
          [valid]="isValid('age')"
          [validation]="errors('age')"
          cControl
        ></c-text-field>

        <c-text-field
          formControlName="password"
          label="Password"
          type="password"
          hint="Enter your super secret password"
          [valid]="isValid('password')"
          [validation]="errors('password')"
          cControl
        ></c-text-field>
      </c-card-content>

      <c-card-actions>
        <c-button [disabled]="!form.valid" (click)="onSubmit()">Submit</c-button>
      </c-card-actions>
    </c-card>
  </form>`;

  script = `form: FormGroup;

errorMessages = {
  required: 'This is a required field',
  min: 'You must be at least 18 to enter',
  minlength: 'Please enter at least 8 characters',
};

ngOnInit(): void {
  this.form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    age: new FormControl(null, [Validators.required, Validators.min(18)]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });
}

isValid(field) {
  const input = this.form.get(field);

  return input?.pristine || input?.valid || false;
}

errors(field) {
  const errors = Object.keys(this.form.get(field)?.errors || {});

  if (!errors) return '';

  return this.errorMessages[errors[0]] || '';
}

onSubmit() {
  alert(JSON.stringify(this.form.value, null, 2));

  this.form.reset();
}`;

  form: FormGroup;

  errorMessages = {
    required: 'This is a required field',
    min: 'You must be at least 18 to enter',
    minlength: 'Please enter at least 8 characters',
  };

  ngOnInit(): void {
    this.form = new FormGroup({
      username: new FormControl('', [Validators.required]),
      age: new FormControl(null, [Validators.required, Validators.min(18)]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });
  }

  isValid(field) {
    const input = this.form.get(field);

    return input?.pristine || input?.valid || false;
  }

  errors(field) {
    const errors = Object.keys(this.form.get(field)?.errors || {});

    if (!errors) return '';

    return this.errorMessages[errors[0]] || '';
  }

  onSubmit() {
    alert(JSON.stringify(this.form.value, null, 2));
    this.form.reset();
  }
}
