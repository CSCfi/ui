# c-radio



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                      | Type                                                                                 | Default            |
| -------------- | --------------- | -------------------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| `color`        | `color`         | Color of the radio group         | `string`                                                                             | `''`               |
| `disabled`     | `disabled`      | Disable the radio group          | `boolean`                                                                            | `false`            |
| `hideDetails`  | `hide-details`  | Hide the hint and error messages | `boolean`                                                                            | `false`            |
| `hint`         | `hint`          | Hint text for the input          | `string`                                                                             | `''`               |
| `hostId`       | `id`            | Id of the element                | `string`                                                                             | `undefined`        |
| `inline`       | `inline`        | Display radio buttons inline     | `boolean`                                                                            | `false`            |
| `items`        | --              | Radio group items                | `CRadioGroupItem[]`                                                                  | `[]`               |
| `label`        | `label`         | Label of the radio group         | `string`                                                                             | `undefined`        |
| `required`     | `required`      | Set as required                  | `boolean`                                                                            | `false`            |
| `returnObject` | `return-object` | Return the whole item object     | `boolean`                                                                            | `false`            |
| `valid`        | `valid`         | Set the validity of the input    | `boolean`                                                                            | `true`             |
| `validation`   | `validation`    | Custom validation message        | `string`                                                                             | `'Required field'` |
| `value`        | `value`         | Value of the radio group         | `number \| string \| { name: string; value: string \| number; disabled?: boolean; }` | `undefined`        |


## Events

| Event         | Description                     | Type               |
| ------------- | ------------------------------- | ------------------ |
| `changeValue` | Emit value change to the parent | `CustomEvent<any>` |


## Slots

| Slot             | Description                |
| ---------------- | -------------------------- |
| `"Default slot"` | Default slot for the label |


## CSS Custom Properties

| Name                                     | Description                         |
| ---------------------------------------- | ----------------------------------- |
| `--c-radio-group-background-color-hover` | Radio button hover background color |
| `--c-radio-group-color`                  | Radio button color                  |
| `--c-radio-group-color-active`           | Active radio button color           |
| `--c-radio-group-color-disabled`         | Disabled radio button color         |


## Dependencies

### Depends on

- [c-ripple](../c-ripple)
- [c-message](../c-message)

### Graph
```mermaid
graph TD;
  c-radio-group --> c-ripple
  c-radio-group --> c-message
  style c-radio-group fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
