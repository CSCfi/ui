# c-row



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description                  | Type                                              | Default   |
| --------- | --------- | ---------------------------- | ------------------------------------------------- | --------- |
| `align`   | `align`   | Align items vertically       | `"center" \| "end" \| "start"`                    | `'start'` |
| `gap`     | `gap`     | Gap between items in px      | `number`                                          | `0`       |
| `justify` | `justify` | Justify content horizontally | `"center" \| "end" \| "space-between" \| "start"` | `'start'` |
| `wrap`    | `wrap`    | Flex wrap                    | `boolean`                                         | `true`    |


## Slots

| Slot | Description                                     |
| ---- | ----------------------------------------------- |
|      | Should contain items to be displayed in the row |


## Dependencies

### Used by

 - [c-autocomplete](../c-autocomplete)
 - [c-consent](../c-consent)
 - [c-pagination](../c-pagination)
 - [c-sidenavigationitem](../c-sidenavigationitem)

### Graph
```mermaid
graph TD;
  c-autocomplete --> c-row
  c-consent --> c-row
  c-pagination --> c-row
  c-sidenavigationitem --> c-row
  style c-row fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*