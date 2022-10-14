import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { sanitize } from '../utils/utils';

@Component({
  selector: 'app-getting-started-angular',
  templateUrl: './getting-started-angular.component.html',
  styleUrls: ['./getting-started-angular.component.scss'],
})
export class GettingStartedAngularComponent implements OnInit {
  accessorUsage = `import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CscUiAccessorModule } from 'csc-ui-accessor';

@NgModule({
  imports: [CscUiAccessorModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
`;

  mainUsage = `import { applyPolyfills, defineCustomElements } from 'csc-ui/dist/loader';

  // ...

  applyPolyfills().then(() => {
    defineCustomElements(window);
  });
`;

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
