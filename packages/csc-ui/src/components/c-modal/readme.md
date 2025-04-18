# c-modal



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute               | Description                                                                    | Type               | Default |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------ | ------------------ | ------- |
| `disableBackdropBlur` | `disable-backdrop-blur` | Disable backdrop blur effect                                                   | `boolean`          | `false` |
| `dismissable`         | `dismissable`           | Dismissed when touching/clicking outside the content                           | `boolean`          | `false` |
| `value`               | `value`                 | Is the modal visible                                                           | `boolean`          | `false` |
| `width`               | `width`                 | Width of the dialog. Numeric value is considered as pixel value (400 -> 400px) | `number \| string` | `600`   |
| `zIndex`              | `z-index`               | Z-index of the modal                                                           | `number`           | `10`    |


## Events

| Event         | Description                     | Type                   |
| ------------- | ------------------------------- | ---------------------- |
| `changeValue` | Triggered when value is changed | `CustomEvent<boolean>` |


## Dependencies

### Depends on

- [c-backdrop](../c-backdrop)

### Graph
```mermaid
graph TD;
  c-modal --> c-backdrop
  style c-modal fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
