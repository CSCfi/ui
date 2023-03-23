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


## Dependencies

### Used by

 - [c-sidenavigationitem](../c-sidenavigationitem)
 - [c-subnavigationitem](../c-subnavigationitem)

### Graph
```mermaid
graph TD;
  c-sidenavigationitem --> c-loader
  c-subnavigationitem --> c-loader
  style c-loader fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
