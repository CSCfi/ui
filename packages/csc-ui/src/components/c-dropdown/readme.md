# c-dropdown



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute        | Description                         | Type                                             | Default     |
| -------------- | ---------------- | ----------------------------------- | ------------------------------------------------ | ----------- |
| `focusList`    | `focus-list`     | Focus dropdown on open              | `boolean`                                        | `undefined` |
| `index`        | `index`          | Initial value index                 | `number`                                         | `undefined` |
| `inputId`      | `input-id`       | Id of the input element             | `string`                                         | `undefined` |
| `isOpen`       | `is-open`        | Dropdown open state                 | `boolean`                                        | `false`     |
| `items`        | --               | Dropdown items                      | `CAutocompleteItem[] \| CSelectItem[]`           | `[]`        |
| `itemsPerPage` | `items-per-page` | Items per page before adding scroll | `number`                                         | `undefined` |
| `options`      | --               | Dropdown options                    | `{ [x: string]: HTMLCOptionElement; }`           | `undefined` |
| `parent`       | --               | Dropdown parent                     | `HTMLCAutocompleteElement \| HTMLCSelectElement` | `undefined` |
| `type`         | `type`           | Type of the parent element          | `"autocomplete" \| "select"`                     | `undefined` |
| `wasClicked`   | `was-clicked`    |                                     | `boolean`                                        | `false`     |


## Methods

### `close() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `focusItem(type: number) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `open(focusList?: boolean) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `updateDropdown(params: _CDropdownUpdateParams) => Promise<void>`



#### Returns

Type: `Promise<void>`




## CSS Custom Properties

| Name                                  | Description                      |
| ------------------------------------- | -------------------------------- |
| `--c-dropdown-background-color`       | Menu background color            |
| `--c-dropdown-background-color-hover` | Menu item hover background color |
| `--c-dropdown-text-color`             | Menu item text color             |
| `--c-dropdown-text-color-active`      | Active menu item text color      |


## Dependencies

### Used by

 - [c-autocomplete](../c-autocomplete)
 - [c-select](../c-select)

### Depends on

- [c-icon](../c-icon)

### Graph
```mermaid
graph TD;
  c-dropdown --> c-icon
  c-autocomplete --> c-dropdown
  c-select --> c-dropdown
  style c-dropdown fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
