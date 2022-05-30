import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { sanitize } from '../utils/utils';

@Component({
  selector: 'app-getting-started-angular',
  templateUrl: './getting-started-angular.component.html',
  styleUrls: ['./getting-started-angular.component.scss'],
})
export class GettingStartedAngularComponent implements OnInit {
  accessorUsage = `import { NgModule } from '@angular/core';
  import { CscUiAccessorModule } from 'csc-ui-accessor';

  @NgModule({
    imports: [CscUiAccessorModule],
  })
  export class AppModule { }
`;

  mainUsage = `import { applyPolyfills, defineCustomElements } from 'csc-ui/dist/loader';

  // ...

  applyPolyfills().then(() => {
    defineCustomElements(window);
  });
`;

  formUsage = {
    template: `<form [formGroup]="form">
  <c-card>
    <c-card-title>Usage in Angular forms</c-card-title>
    <c-card-content>
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

      <c-checkbox
        formControlName="consent"
        hint="Please agree to the terms and conditions"
        [valid]="isValid('consent')"
        [validation]="errors('consent')"
        cControl
      >
        I agree to the
        <c-link href="https://csc.fi" underline>terms and conditions</c-link>
      </c-checkbox>
    </c-card-content>

    <c-card-actions justify="end">
      <c-button [disabled]="!form.valid" (click)="onSubmit()">Submit</c-button>
    </c-card-actions>
  </c-card>
</form>`,
    script: `import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// ...

form: FormGroup;

errorMessages = {
  required: 'This is a required field',
  pattern: 'No numbers allowed',
  minlength: 'The value must be at least 8 characters long',
};

customMessages = {
  consent: {
    required: 'You have to agree to continue',
  },
};

constructor(private _formBuilder: FormBuilder) {}

ngOnInit() {
  this.form = this._formBuilder.group({
    username: [null, [Validators.required]],
    password: [
      null,
      [Validators.required, Validators.pattern(/^([^0-9]*)$/), Validators.minLength(8)],
    ],
    consent: [false, [Validators.requiredTrue]],
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

  return this.customMessages[field]?.[error] || this.errorMessages[error] || 'Invalid value';
}

onSubmit() {
  alert('Form submitted with the following data: ' + JSON.stringify(this.form.value, null, 2));
  this.form.reset();
}`,
  };

  showCode = [];

  form: FormGroup;

  errorMessages = {
    required: 'This is a required field',
    pattern: 'No numbers allowed',
    minlength: 'The value must be at least 8 characters long',
  };

  customMessages = {
    consent: {
      required: 'You have to agree to continue',
    },
  };

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this._formBuilder.group({
      username: [null, [Validators.required]],
      password: [
        null,
        [Validators.required, Validators.pattern(/^([^0-9]*)$/), Validators.minLength(8)],
      ],
      consent: [false, [Validators.requiredTrue]],
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

    return this.customMessages[field]?.[error] || this.errorMessages[error] || 'Invalid value';
  }

  onSubmit() {
    alert('Form submitted with the following data: ' + JSON.stringify(this.form.value, null, 2));
    this.form.reset();
  }
}
