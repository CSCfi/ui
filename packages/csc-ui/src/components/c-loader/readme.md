# c-loader

<!-- Auto Generated Below -->


## Overview

A loader component that fills the nearest containing element that has css-property position set to 'relative'

## Properties

| Property       | Attribute      | Description                                                        | Type      | Default |
| -------------- | -------------- | ------------------------------------------------------------------ | --------- | ------- |
| `contentdelay` | `contentdelay` | Delay in seconds of showing the contents in the slot of the loader | `number`  | `0`     |
| `hide`         | `hide`         | Hide the loader                                                    | `boolean` | `false` |
| `size`         | `size`         | Size of the loader                                                 | `number`  | `48`    |
| `width`        | `width`        | Width of the loader                                                | `number`  | `4`     |


## CSS Custom Properties

| Name                          | Description             |
| ----------------------------- | ----------------------- |
| `--c-loader-background-color` | Loader background color |
| `--c-loader-color`            | Loader color            |
| `--c-loader-text-color`       | Loader text color       |


## Dependencies

### Used by

 - [c-side-navigation-item](../c-side-navigation-item)
 - [c-sub-navigation-item](../c-sub-navigation-item)

### Depends on

- [c-spinner](../c-spinner)

### Graph
```mermaid
graph TD;
  c-loader --> c-spinner
  c-side-navigation-item --> c-loader
  c-sub-navigation-item --> c-loader
  style c-loader fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
