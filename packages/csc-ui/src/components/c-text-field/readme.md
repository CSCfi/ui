# c-text-field



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute          | Description                           | Type      | Default            |
| --------------------- | ------------------ | ------------------------------------- | --------- | ------------------ |
| `autocomplete`        | `autocomplete`     | HTML input autocomplete               | `string`  | `''`               |
| `autocorrect`         | `autocorrect`      | HTML input autocorrect                | `string`  | `''`               |
| `automaticCapitalize` | `autocapitalize`   | HTML input autocapitalize             | `string`  | `''`               |
| `automaticFocus`      | `autofocus`        | Auto focus the input                  | `boolean` | `false`            |
| `disabled`            | `disabled`         | Disable the input                     | `boolean` | `false`            |
| `hideDetails`         | `hide-details`     | Hide the hint and error messages      | `boolean` | `false`            |
| `hint`                | `hint`             | Hint text for the input               | `string`  | `''`               |
| `hostId`              | `id`               | Id of the input                       | `string`  | `undefined`        |
| `label`               | `label`            | Label of the input                    | `string`  | `undefined`        |
| `max`                 | `max`              | Maximum value on a numeric input      | `number`  | `null`             |
| `min`                 | `min`              | Minimum value on a numeric input      | `number`  | `null`             |
| `name`                | `name`             | Name of the input                     | `string`  | `undefined`        |
| `placeholder`         | `placeholder`      | Placeholder of the input              | `string`  | `undefined`        |
| `readonly`            | `readonly`         | Mark as readonly                      | `boolean` | `false`            |
| `required`            | `required`         | Set the input as required             | `boolean` | `false`            |
| `rows`                | `rows`             | Rows on the input                     | `number`  | `1`                |
| `shadow`              | `shadow`           | Shadow variant of the input           | `boolean` | `false`            |
| `step`                | `step`             | Step size on a numeric input          | `number`  | `null`             |
| `trimWhitespace`      | `trim-whitespace`  | Trim whitespace from the return value | `boolean` | `false`            |
| `type`                | `type`             | Type of the input                     | `string`  | `'text'`           |
| `valid`               | `valid`            | Set the validity of the input         | `boolean` | `true`             |
| `validate`            | `validate`         | Manual validation                     | `boolean` | `false`            |
| `validateOnBlur`      | `validate-on-blur` | Validate the input on blur            | `boolean` | `false`            |
| `validation`          | `validation`       | Custom validation message             | `string`  | `'Required field'` |
| `value`               | `value`            | Value of the input                    | `string`  | `undefined`        |


## Events

| Event         | Description                | Type               |
| ------------- | -------------------------- | ------------------ |
| `changeValue` | Emit changes to the parent | `CustomEvent<any>` |


## Slots

| Slot     | Description                    |
| -------- | ------------------------------ |
| `"post"` | Content added after the input  |
| `"pre"`  | Content added before the input |


## CSS Custom Properties

| Name                                      | Description                          |
| ----------------------------------------- | ------------------------------------ |
| `--c-text-field-active-color`             | Active text field color              |
| `--c-text-field-background-color`         | Inactive text field background color |
| `--c-text-field-inactive-color`           | Inactive text field color            |
| `--c-text-field-placeholder-color`        | Text field placeholder color         |
| `--c-text-field-shadow-active-color`      | Shadow text field active color       |
| `--c-text-field-shadow-background-color`  | Shadow text field background color   |
| `--c-text-field-shadow-placeholder-color` | Shadow text field placeholder color  |
| `--c-text-field-shadow-text-color`        | Shadow text field text color         |
| `--c-text-field-text-color`               | Text field text color                |


## Dependencies

### Depends on

- [c-input](../c-input)

### Graph
```mermaid
graph TD;
  c-text-field --> c-input
  c-input --> c-message
  style c-text-field fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
