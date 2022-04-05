# c-sidenavigationitem



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description           | Type      | Default     |
| --------- | --------- | --------------------- | --------- | ----------- |
| `active`  | `active`  | Indicate active state | `boolean` | `undefined` |
| `href`    | `href`    | Hyperlink url         | `string`  | `undefined` |
| `loading` | `loading` | Loading state         | `boolean` | `false`     |


## Events

| Event        | Description                     | Type               |
| ------------ | ------------------------------- | ------------------ |
| `itemChange` | Emit changes to the c-accordion | `CustomEvent<any>` |


## Dependencies

### Depends on

- [c-row](../c-row)
- [c-loader](../c-loader)

### Graph
```mermaid
graph TD;
  c-sidenavigationitem --> c-row
  c-sidenavigationitem --> c-loader
  style c-sidenavigationitem fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
