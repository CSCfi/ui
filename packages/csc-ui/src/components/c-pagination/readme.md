# c-pagination



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute    | Description                                                                                                                                        | Type                                                                                                                             | Default            |
| --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `hideRange`           | `hide-range` | Hide range indicator                                                                                                                               | `boolean`                                                                                                                        | `false`            |
| `itemsPerPageOptions` | --           | Items per page options                                                                                                                             | `number[]`                                                                                                                       | `[5, 25, 50, 100]` |
| `value`               | --           | Object containing values that are needed for pagination.  Note! startFrom and endTo are assigned automatically to the object based on other values | `{ itemCount: number; currentPage?: number; totalVisible?: number; itemsPerPage?: number; startFrom?: number; endTo?: number; }` | `undefined`        |


## Events

| Event         | Description                       | Type                                                                                                                                          |
| ------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `changeValue` | Triggered when values are changed | `CustomEvent<{ itemCount: number; currentPage?: number; totalVisible?: number; itemsPerPage?: number; startFrom?: number; endTo?: number; }>` |


## Dependencies

### Depends on

- [c-menu](../c-menu)
- [c-icon-button](../c-icon-button)
- [c-row](../c-row)
- [c-spacer](../c-spacer)

### Graph
```mermaid
graph TD;
  c-pagination --> c-menu
  c-pagination --> c-icon-button
  c-pagination --> c-row
  c-pagination --> c-spacer
  c-menu --> c-menu-item
  style c-pagination fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
