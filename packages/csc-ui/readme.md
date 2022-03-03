# CSC Design System - Web Component library

A cross-platform web component library that utilizes CSC Design System guidelines. It helps CSC developers to build applications with unified design. The components can be used with any browser and on top of any front-end framework.

## Getting Started

See [documentation](https://csc-design-system-docs.web.app) how to use the web components and their attributes.

## Contributing

### Creating / modifying components

- Run `npm install` in root of the project
- Run `npm run generate` in the root of the project to generate new components
- Run `npm run build:watch` in root of the project

### The documentation project

The root project generates a json that is used to generate the base of the documentation of the component.

- Run `npm install` in documentation/angular
- Run `npm start` in documentation/angular

Create an example for a new web component

- Run `ng g c examples/c-name-of-the-component` in documentation/angular
