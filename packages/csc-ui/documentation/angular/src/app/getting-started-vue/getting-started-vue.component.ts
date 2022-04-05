import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-getting-started-vue',
  templateUrl: './getting-started-vue.component.html',
  styleUrls: ['./getting-started-vue.component.scss'],
})
export class GettingStartedVueComponent implements OnInit {
  mainUsage = `import { createApp } from 'vue';
import { applyPolyfills, defineCustomElements } from 'csc-ui/loader';

import App from './App.vue';
import { vControl } from 'csc-ui-vue-directive';

const app = createApp(App);

app.directive('control', vControl);

applyPolyfills().then(() => {
  defineCustomElements();
});

app.mount('#app');
  `;

  formUsage = `<script setup lang="ts">
import { ref } from 'vue';
import { useValidation } from 'vue-composable';

const validators = {
  required: (value: any) => !!value,
  minLength: (min: number) => (value: string) => value.length >= min,
  nonNumeric: (value: string) => !!value.match(/^([^0-9]*)$/),
};

const form = useValidation({
  username: {
    $value: ref(''),
    required: {
      $validator: validators.required,
      $message: 'This is a required field',
    },
  },
  password: {
    $value: ref(''),
    required: {
      $validator: validators.required,
      $message: 'This is a required field',
    },
    nonNumeric: {
      $validator: validators.nonNumeric,
      $message: 'No numbers allowed',
    },
    minLength: {
      $validator: validators.minLength(8),
      $message: 'The value must be at least 8 characters long',
    },
  },
  consent: {
    $value: ref(false),
    required: {
      $validator: validators.required,
      $message: 'You have to agree to continue',
    },
  },
});

const onSubmit = () => {
  alert(
    'Form submitted with the following data: ' +
      JSON.stringify(form.toObject(), null, 2),
  );

  form.$reset();
};
</script>

<template>
  <c-card>
    <c-card-title>Using csc-ui with Vue 3</c-card-title>

    <c-card-content>
      <c-text-field
        v-model="form.username.$value"
        :valid="!form.username.$dirty || !form.username.$errors.length"
        :validation="form.username.$errors[0]"
        label="Username"
        v-control
      ></c-text-field>

      <c-text-field
        v-model="form.password.$value"
        :valid="!form.password.$dirty || !form.password.$errors.length"
        :validation="form.password.$errors[0]"
        hint="Please do not use numbers in your password"
        label="Password"
        type="password"
        v-control
      ></c-text-field>

      <c-checkbox
        v-model="form.consent.$value"
        :valid="!form.consent.$dirty || !form.consent.$errors.length"
        :validation="form.consent.$errors[0]"
        hint="Please agree to the terms and conditions"
        v-control
      >
        I consent to the
        <c-link href="https://csc.fi" underline>terms and conditions</c-link>
      </c-checkbox>
    </c-card-content>

    <c-card-actions justify="end">
      <c-button @click="onSubmit">Submit</c-button>
    </c-card-actions>
  </c-card>
</template>
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
