<script setup lang="ts">
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
        <c-link underline>terms and conditions</c-link>
      </c-checkbox>
    </c-card-content>

    <c-card-actions justify="end">
      <c-button @click="onSubmit">Submit</c-button>
    </c-card-actions>
  </c-card>
</template>
