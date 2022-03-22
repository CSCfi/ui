# c-pagination



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute      | Description                                                                                                                                        | Type                   | Default            |
| --------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------ |
| `hideDetails`         | `hide-details` | Hide details (per page dropdown and the 'x - y of n pages' text)                                                                                   | `boolean`              | `false`            |
| `hideRange`           | `hide-range`   | Hide range indicator                                                                                                                               | `boolean`              | `false`            |
| `itemsPerPageOptions` | --             | Items per page options                                                                                                                             | `number[]`             | `[5, 25, 50, 100]` |
| `simple`              | `simple`       | Hide page number buttons                                                                                                                           | `boolean`              | `false`            |
| `size`                | `size`         | Hide details (per page dropdown and the 'x - y of n pages' text)                                                                                   | `"default" \| "small"` | `'default'`        |
| `value`               | --             | Object containing values that are needed for pagination.  Note! startFrom and endTo are assigned automatically to the object based on other values | `CPaginationOptions`   | `undefined`        |


## Events

| Event         | Description                       | Type                              |
| ------------- | --------------------------------- | --------------------------------- |
| `changeValue` | Triggered when values are changed | `CustomEvent<CPaginationOptions>` |


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
