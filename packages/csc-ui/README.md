# @cscfi/csc-ui

The [CSC Design System](https://design-system.csc.fi)'s components as native
custom elements. One set of `c-*` tags works in plain HTML and in any
framework — Vue, React (through
[`@cscfi/csc-ui-react`](https://www.npmjs.com/package/@cscfi/csc-ui-react)),
Angular — with the design tokens, light and dark mode, TypeScript types and
editor completion data included.

```bash
npm install @cscfi/csc-ui
```

```ts
import { defineCustomElements } from '@cscfi/csc-ui';
import '@cscfi/csc-ui/css/tokens.css';

defineCustomElements();
```

```html
<c-text-field label="Project name"></c-text-field>
<c-button>Create</c-button>
```

[Getting started](https://design-system.csc.fi/getting-started) has the setup
for each framework, and every component has its own page with examples and
its API.

## Supported browsers

The current and previous versions of Chrome, Edge, Firefox and Safari (iOS
included), plus Firefox ESR. The package declares the same list as its
`browserslist` query.

## Upgrading from 3.x

4.0.0 is a rewrite under the same name and tag names; the
[migration guide](https://design-system.csc.fi/migration) lists every change,
name by name. 3.x is unsupported since 4.0.0: 3.0.19 is its last release, and
it gets no fixes. To stay on it for now, pin the major version:

```bash
npm install @cscfi/csc-ui@3
```

## TypeScript

Public component types are exported from the package root — prop-value unions
(`CButtonSize`, `CAlertType`, …), props interfaces (`CButtonProps`, …) and
shared data shapes (`CSelectItem`, `CToastMessage`, …):

```ts
import type { CAlertType, CSelectItem } from '@cscfi/csc-ui';
```

## Editor support

The package ships IDE completion data generated from its
[Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest)
(`dist/custom-elements.json`). Tag names, attributes, attribute **values**
(e.g. `type="error | info | success | warning"`), slots and CSS parts complete
and show their documentation on hover.

### JetBrains IDEs (WebStorm, IntelliJ)

Works out of the box — the `web-types` field in package.json is discovered
automatically.

### VS Code

Add the custom-data files to your workspace settings (`.vscode/settings.json`).
Volar picks up the same setting for Vue templates:

```json
{
  "html.customData": [
    "./node_modules/@cscfi/csc-ui/dist/vscode.html-custom-data.json"
  ],
  "css.customData": [
    "./node_modules/@cscfi/csc-ui/dist/vscode.css-custom-data.json"
  ]
}
```

## License

MIT
