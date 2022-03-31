<script setup lang="ts">
// import { computed } from 'vue';
import {
  useField,
  useForm,
  useFormValues,
  useValidateForm,
  useIsSubmitting,
} from 'vee-validate';
import type { CRadioGroupItem, CSelectItem } from '../../../../dist/types';
import * as yup from 'yup';

const validationMessages = {
  required: () => 'Required field',
  max: (value: number) => `Value must be ${value} or less`,
  min: (value: number) => `Value must be ${value} or more`,
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const roles: CSelectItem[] = [
  {
    name: 'User',
    value: 'user',
  },
  {
    name: 'Super User',
    value: 'super',
  },
  {
    name: 'Admin',
    value: 'admin',
  },
];

const colors: CRadioGroupItem[] = [
  {
    label: 'Cyan',
    value: 'cyan',
  },
  {
    label: 'Pink',
    value: 'hotpink',
  },
  {
    label: 'Orange',
    value: 'orange',
  },
];

const validationSchema = yup.object({
  username: yup
    .string()
    .required(validationMessages.required())
    .max(12, 'Username cannot be longer than 12 characters'),
  description: yup.string().required(validationMessages.required()),
  password: yup.string().required(validationMessages.required()),
  age: yup
    .number()
    .required(validationMessages.required())
    .max(100, validationMessages.max(100))
    .min(18, validationMessages.min(18)),
  role: yup.string().required(validationMessages.required()),
  color: yup.string().required(validationMessages.required()),
  consent: yup.boolean().isTrue('Consent is needed before continuing'),
});

const { handleSubmit, handleReset } = useForm({
  validationSchema,
  initialValues: {
    username: '',
    description: '',
    password: '',
    age: undefined,
    role: '',
    color: '',
    consent: false,
  },
});

const { value: username, errorMessage: usernameError } = useField('username');
const { value: description, errorMessage: descriptionError } =
  useField('description');
const { value: password, errorMessage: passwordError } = useField('password');
const { value: role, errorMessage: roleError } = useField('role');
const { value: age, errorMessage: ageError } = useField('age');
const { value: color, errorMessage: colorError } = useField('color');
const { value: consent, errorMessage: consentError } = useField('consent');

const values = useFormValues();
const validate = useValidateForm();
const isSubmitting = useIsSubmitting();

const onSubmit = handleSubmit(async (values) => {
  await validate();
  await sleep(2000);

  console.log('Submitted the form with:', values);
});
</script>

<template>
  <main>
    <c-card>
      <c-card-title>Using csc-ui with Vue 3</c-card-title>

      <c-card-content>
        <c-text-field
          v-model="username"
          :valid="!usernameError"
          :validation="usernameError"
          label="Username"
          v-control
        ></c-text-field>

        <c-text-field
          v-model="description"
          :valid="!descriptionError"
          :validation="descriptionError"
          label="Description"
          placeholder="Please give a short description"
          rows="5"
          v-control
        ></c-text-field>

        <c-text-field
          v-model="password"
          :valid="!passwordError"
          hint="Try to remember your password"
          label="Password"
          type="password"
          v-control
        ></c-text-field>

        <c-text-field
          v-model="age"
          :valid="!ageError"
          :validation="ageError"
          hint="You must be between 18 and 100 years old"
          label="Age"
          type="number"
          v-control
        ></c-text-field>

        <c-select
          v-model="role"
          :valid="!roleError"
          :items.prop="roles"
          label="Role"
          v-control
          return-value
        ></c-select>

        <c-radio-group
          v-model="color"
          hint="Your selection will be ignored"
          :items.prop="colors"
          :valid="!colorError"
          return-value
          v-control
        >
          Select a color
        </c-radio-group>

        <c-row gap="8" align="center">
          Selected color:
          <span
            v-if="color"
            class="badge"
            :style="`background-color: ${color}`"
          ></span>
          <span v-else class="badge" :style="`background-color: #eee`">
            N/A
          </span>
        </c-row>

        <c-checkbox
          v-model="consent"
          :valid="!consentError"
          :validation="consentError"
          v-control
        >
          I consent to the
          <c-link underline>terms and conditions</c-link>
        </c-checkbox>
      </c-card-content>

      <c-card-actions justify="end">
        <c-button outlined @click="handleReset">Reset</c-button>
        <c-button :loading="isSubmitting" @click="onSubmit">Submit</c-button>
      </c-card-actions>
    </c-card>

    <pre style="padding: 16px">{{ values }}</pre>
  </main>
</template>

<style lang="scss">
.badge {
  width: 24px;
  height: 24px;
  display: flex;
  border-radius: 4px;
  font-size: 12px;
  align-items: center;
  display: flex;
  justify-content: center;
  transition: background-color 0.2s ease-in-out;
}
</style>
