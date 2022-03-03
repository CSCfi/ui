# c-select



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description                             | Type                                           | Default     |
| ---------------- | ------------------ | --------------------------------------- | ---------------------------------------------- | ----------- |
| `dense`          | `dense`            | Dense variant                           | `boolean`                                      | `false`     |
| `hostId`         | `id`               | Id of the element                       | `string`                                       | `undefined` |
| `items`          | --                 | selectable items                        | `{ name: string; value: string \| number; }[]` | `[]`        |
| `itemsPerPage`   | `items-per-page`   | Items per page before adding scroll     | `number`                                       | `undefined` |
| `label`          | `label`            | Element label                           | `string`                                       | `undefined` |
| `labelRight`     | `label-right`      | Label is aligned to the right           | `boolean`                                      | `false`     |
| `name`           | `name`             | Input field name                        | `string`                                       | `undefined` |
| `placeholder`    | `placeholder`      | Placeholder text                        | `string`                                       | `''`        |
| `required`       | `required`         | Show required validation                | `boolean`                                      | `null`      |
| `shadow`         | `shadow`           | Shadow variant                          | `boolean`                                      | `false`     |
| `validate`       | `validate`         | Run validation when changed to true     | `boolean`                                      | `false`     |
| `validateOnBlur` | `validate-on-blur` | Show validation after touching the menu | `boolean`                                      | `false`     |
| `value`          | --                 | Selected item                           | `{ name: string; value: string \| number; }`   | `null`      |


## Events

| Event         | Description                        | Type               |
| ------------- | ---------------------------------- | ------------------ |
| `changeValue` | Triggered when an item is selected | `CustomEvent<any>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
