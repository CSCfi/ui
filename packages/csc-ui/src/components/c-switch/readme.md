# c-switch



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute     | Description                                                                     | Type                | Default     |
| -------------- | ------------- | ------------------------------------------------------------------------------- | ------------------- | ----------- |
| `checked`      | `checked`     | If `true`, the checkbox is selected.                                            | `boolean`           | `false`     |
| `falseValue`   | `false-value` | The value when the checkbox is unchecked                                        | `boolean \| string` | `false`     |
| `hostDisabled` | `disabled`    | Disable the switch                                                              | `boolean`           | `false`     |
| `hostId`       | `id`          | Id for the element                                                              | `string`            | `undefined` |
| `required`     | `required`    | Set as required                                                                 | `boolean`           | `false`     |
| `trueValue`    | `true-value`  | The value when the checkbox is checked                                          | `boolean \| string` | `true`      |
| `value`        | `value`       | The input value - Only used when the checkbox participates in a native `<form>` | `boolean \| string` | `false`     |


## Events

| Event         | Description                       | Type               |
| ------------- | --------------------------------- | ------------------ |
| `changeValue` | Emit inner value change to parent | `CustomEvent<any>` |


## Slots

| Slot      | Description               |
| --------- | ------------------------- |
| `"label"` | Label text for the switch |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
