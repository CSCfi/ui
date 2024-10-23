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

| Event          | Description                       | Type               |
| -------------- | --------------------------------- | ------------------ |
| `change-value` | Emit inner value change to parent | `CustomEvent<any>` |


## Slots

| Slot      | Description               |
| --------- | ------------------------- |
| `"label"` | Label text for the switch |


## CSS Custom Properties

| Name                                      | Description                      |
| ----------------------------------------- | -------------------------------- |
| `--c-switch-border-color`                 | Border color                     |
| `--c-switch-border-color-active`          | Active border color              |
| `--c-switch-border-color-active-disabled` | Disabled active border color     |
| `--c-switch-border-color-disabled`        | Disabled border color            |
| `--c-switch-handle-color`                 | Handle color                     |
| `--c-switch-handle-color-active`          | Active handle color              |
| `--c-switch-handle-color-active-disabled` | Disabled active handle color     |
| `--c-switch-handle-color-disabled`        | Disabled handle color            |
| `--c-switch-slider-color`                 | Background color                 |
| `--c-switch-slider-color-active`          | Active background color          |
| `--c-switch-slider-color-active-disabled` | Disabled active background color |
| `--c-switch-slider-color-disabled`        | Disabled background color        |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
