# c-tag



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute   | Description                                       | Type                   | Default     |
| ----------- | ----------- | ------------------------------------------------- | ---------------------- | ----------- |
| `active`    | `active`    | Mark tag as active                                | `boolean`              | `false`     |
| `badge`     | `badge`     | Display an optional badge at the start of the tag | `number \| string`     | `null`      |
| `block`     | `block`     | Stretch to fill the container row                 | `boolean`              | `false`     |
| `closeable` | `closeable` | Mark tag as closeable                             | `boolean`              | `false`     |
| `fit`       | `fit`       | Stretch to fill the container                     | `boolean`              | `false`     |
| `flat`      | `flat`      | Remove the hover effect                           | `boolean`              | `false`     |
| `size`      | `size`      | Size of the tag                                   | `"default" \| "small"` | `'default'` |


## Events

| Event   | Description                          | Type               |
| ------- | ------------------------------------ | ------------------ |
| `close` | Emit close event on close icon click | `CustomEvent<any>` |


## Slots

| Slot             | Description  |
| ---------------- | ------------ |
| `"Default slot"` | Default slot |


## CSS Custom Properties

| Name                                    | Description                          |
| --------------------------------------- | ------------------------------------ |
| `--c-tag-background-color`              | Tag background color                 |
| `--c-tag-background-color-active`       | Active tag background color          |
| `--c-tag-background-color-active-hover` | Active tag background color on hover |
| `--c-tag-background-color-hover`        | Tag background color on hover        |
| `--c-tag-badge-background-color`        | Tag badge background color           |
| `--c-tag-badge-background-color-active` | Active tag badge background color    |
| `--c-tag-badge-text-color`              | Tag badge text color                 |
| `--c-tag-badge-text-color-active`       | Active tag badge text color          |
| `--c-tag-border-color`                  | Tag border color                     |
| `--c-tag-border-radius`                 | Tag border radius                    |
| `--c-tag-text-color`                    | Tag text color                       |
| `--c-tag-text-color-active`             | Active tag text color                |


## Dependencies

### Depends on

- [c-icon-button](../c-icon-button)
- [c-icon](../c-icon)

### Graph
```mermaid
graph TD;
  c-tag --> c-icon-button
  c-tag --> c-icon
  c-icon-button --> c-badge
  c-icon-button --> c-spinner
  c-icon-button --> c-ripple
  style c-tag fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
