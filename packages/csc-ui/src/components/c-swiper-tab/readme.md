# c-tab

<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description         | Type               | Default     |
| ---------- | ---------- | ------------------- | ------------------ | ----------- |
| `active`   | `active`   | Mark as active      | `boolean`          | `false`     |
| `disabled` | `disabled` | Disable button      | `boolean`          | `false`     |
| `hostId`   | `id`       | Id of the button    | `string`           | `undefined` |
| `label`    | `label`    | Label of the button | `string`           | `undefined` |
| `value`    | `value`    | Value of the button | `number \| string` | `undefined` |


## Events

| Event         | Description                     | Type                            |
| ------------- | ------------------------------- | ------------------------------- |
| `changeValue` | Emit value change to the parent | `CustomEvent<number \| string>` |
| `focusTab`    | Emit tab focus to the parent    | `CustomEvent<any>`              |
| `tabChange`   | Emit tab change to parent       | `CustomEvent<any>`              |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
