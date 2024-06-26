# c-side-navigation

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description                    | Type                         | Default     |
| ------------- | -------------- | ------------------------------ | ---------------------------- | ----------- |
| `menuVisible` | `menu-visible` | Mobile version menu visibility | `boolean`                    | `false`     |
| `mobile`      | `mobile`       | Mobile version                 | `boolean`                    | `undefined` |
| `styles`      | --             | Background styles              | `{ [key: string]: string; }` | `undefined` |


## Slots

| Slot             | Description               |
| ---------------- | ------------------------- |
| `"Default slot"` | Default slot              |
| `"bottom"`       | Place items at the bottom |


## CSS Custom Properties

| Name                                   | Description                      |
| -------------------------------------- | -------------------------------- |
| `--c-side-navigation-background-color` | Side navigation background color |
| `--c-side-navigation-overlay-color`    | Side navigation overlay color    |


## Dependencies

### Depends on

- [c-icon-button](../c-icon-button)
- [c-icon](../c-icon)

### Graph
```mermaid
graph TD;
  c-side-navigation --> c-icon-button
  c-side-navigation --> c-icon
  c-icon-button --> c-badge
  c-icon-button --> c-spinner
  c-icon-button --> c-ripple
  style c-side-navigation fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
