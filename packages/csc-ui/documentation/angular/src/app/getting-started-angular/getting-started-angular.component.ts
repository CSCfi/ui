import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatScript, formatTemplate } from '../utils/utils';

@Component({
  selector: 'app-getting-started-angular',
  templateUrl: './getting-started-angular.component.html',
  styleUrls: ['./getting-started-angular.component.scss'],
})
export class GettingStartedAngularComponent implements OnInit {
  accessorUsage = formatScript(`
    import { NgModule } from '@angular/core';
    import { CscUiAccessorModule } from 'csc-ui-accessor';

    @NgModule({
      imports: [CscUiAccessorModule],
    })
    export class AppModule { }
  `);

  mainUsage =
    formatScript(`import { applyPolyfills, defineCustomElements } from 'csc-ui/dist/loader';

    // ...

    applyPolyfills().then(() => {
      defineCustomElements(window);
    });
  `);

  formUsage = {
    template: formatTemplate(
      `
      <form [formGroup]="form">
        <c-card>
          <c-card-title>Usage in Angular forms</c-card-title>
          <c-card-content>
            <c-text-field
              formControlName="username"
              label="Username"
              [valid]="(username.valid && (username.dirty || username.touched)) || username.pristine"
              validation="Please enter your username"
              cControl
            ></c-text-field>

            <c-text-field
              formControlName="password"
              label="Password"
              type="password"
              [valid]="(password.valid && (password.dirty || password.touched)) || password.pristine"
              cControl
            ></c-text-field>

            <c-checkbox
              formControlName="consent"
              label="I agree to the terms and conditions"
              [valid]="(consent.valid && (consent.dirty || consent.touched)) || consent.pristine"
              cControl
            ></c-checkbox>
          </c-card-content>

          <c-card-actions right>
            <c-button [disabled]="!form.valid" (click)="onSubmit()">Submit</c-button>
          </c-card-actions>
        </c-card>
      </form>
    `,
      false,
    ),
    script: formatScript(`import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// ...

form: FormGroup;

constructor(private _formBuilder: FormBuilder) {}

ngOnInit() {
  this.form = this._formBuilder.group({
    username: [null, [Validators.required]],
    password: [null, [Validators.required]],
    consent: [false, [Validators.requiredTrue]],
  });
}

get consent() {
  return this.form.get('consent');
}

get password() {
  return this.form.get('password');
}

get username() {
  return this.form.get('username');
}

onSubmit() {
  alert('Form submitted with the following data: ' + JSON.stringify(this.form.value, null, 2));
}
`),
  };

  showCode = [];

  form: FormGroup;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this._formBuilder.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
      consent: [false, [Validators.requiredTrue]],
    });
  }

  get consent() {
    return this.form.get('consent');
  }

  get password() {
    return this.form.get('password');
  }

  get username() {
    return this.form.get('username');
  }

  onSubmit() {
    alert('Form submitted with the following data: ' + JSON.stringify(this.form.value, null, 2));
  }
}
