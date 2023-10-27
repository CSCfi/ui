# c-list-item



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description                       | Type      | Default     |
| ------------------ | -------------------- | --------------------------------- | --------- | ----------- |
| `active`           | `active`             | Set the item active               | `boolean` | `false`     |
| `disabled`         | `disabled`           | Disable the item                  | `boolean` | `false`     |
| `disabledByParent` | `disabled-by-parent` | Disabled by the parent list       | `boolean` | `false`     |
| `hoverable`        | `hoverable`          | Display background color on hover | `boolean` | `false`     |
| `href`             | `href`               | Hyperlink url                     | `string`  | `undefined` |
| `ripple`           | `ripple`             | Add ripple effect to the item     | `boolean` | `false`     |
| `target`           | `target`             | Hyperlink target                  | `string`  | `'_blank'`  |


## CSS Custom Properties

| Name                                    | Description              |
| --------------------------------------- | ------------------------ |
| `--c-list-item-background-color`        | Default background color |
| `--c-list-item-background-color-active` | Active background color  |
| `--c-list-item-background-color-hover`  | Hover background color   |
| `--c-list-item-outline-color`           | Outline color            |
| `--c-list-item-text-color`              | Default text color       |
| `--c-list-item-text-color-active`       | Active text color        |


## Dependencies

### Depends on

- [c-ripple](../c-ripple)

### Graph
```mermaid
graph TD;
  c-list-item --> c-ripple
  style c-list-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
