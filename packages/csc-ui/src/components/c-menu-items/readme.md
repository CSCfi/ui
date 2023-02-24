# c-menu-items



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description   | Type               | Default     |
| -------- | --------- | ------------- | ------------------ | ----------- |
| `active` | `active`  | is active     | `boolean`          | `false`     |
| `index`  | `index`   | is active     | `number`           | `null`      |
| `items`  | --        | Menu items    | `CMenuOption[]`    | `[]`        |
| `parent` | --        | Menu parent   | `HTMLCMenuElement` | `undefined` |
| `small`  | `small`   | Small variant | `boolean`          | `false`     |


## Events

| Event   | Description                   | Type               |
| ------- | ----------------------------- | ------------------ |
| `close` | Triggered when menu is closed | `CustomEvent<any>` |


## Dependencies

### Used by

 - [c-menu](../c-menu)

### Graph
```mermaid
graph TD;
  c-menu --> c-menu-items
  style c-menu-items fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
