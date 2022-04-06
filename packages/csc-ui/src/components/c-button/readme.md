# c-button



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description                                                                                                                              | Type                                       | Default     |
| ---------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------- |
| `disabled` | `disabled`  | Disable the button                                                                                                                       | `boolean`                                  | `false`     |
| `fit`      | `fit`       | Fit width to containing element                                                                                                          | `boolean`                                  | `false`     |
| `ghost`    | `ghost`     | Light button background                                                                                                                  | `boolean`                                  | `false`     |
| `grouped`  | `grouped`   | True when used as a tab button                                                                                                           | `boolean`                                  | `false`     |
| `hostId`   | `id`        | Id of the button                                                                                                                         | `string`                                   | `undefined` |
| `icon`     | `icon`      | <span style="color:red">**[DEPRECATED]**</span> Please use the icon slot instead<br/><br/>Name of the icon to be displayed in the button | `"account" \| "edit" \| "minus" \| "plus"` | `undefined` |
| `loading`  | `loading`   | Display loader on the button                                                                                                             | `boolean`                                  | `false`     |
| `noRadius` | `no-radius` | Remove the default border radius                                                                                                         | `boolean`                                  | `false`     |
| `outlined` | `outlined`  | Outlined button style                                                                                                                    | `boolean`                                  | `false`     |
| `size`     | `size`      | Size of the button                                                                                                                       | `"default" \| "large" \| "small"`          | `'default'` |
| `text`     | `text`      | Transparent button background                                                                                                            | `boolean`                                  | `false`     |
| `type`     | `type`      | Button type                                                                                                                              | `"button" \| "submit"`                     | `'button'`  |
| `value`    | `value`     | Value for the button - for use in the c-content-switcher                                                                                 | `number \| string`                         | `undefined` |


## Events

| Event       | Description                | Type                            |
| ----------- | -------------------------- | ------------------------------- |
| `tabChange` | Emit changes to the parent | `CustomEvent<number \| string>` |


## Slots

| Slot            | Description                                              |
| --------------- | -------------------------------------------------------- |
|                 | Button text                                              |
| `"description"` | Additional description to be shown below the button text |
| `"icon"`        | Icon                                                     |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
