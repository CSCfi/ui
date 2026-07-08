# @cscfi/csc-ui-next

Vue 3-based implementation of the CSC Design System, compiled to custom
elements. Same tag names as `@cscfi/csc-ui`, native Vue `v-model` contract.

```bash
npm install @cscfi/csc-ui-next
```

```ts
import { defineCustomElements } from '@cscfi/csc-ui-next';
import '@cscfi/csc-ui-next/css/tokens.css';

defineCustomElements();
```

## TypeScript

Public component types are exported from the package root — prop-value unions
(`CButtonSize`, `CAlertType`, …), props interfaces (`CButtonProps`, …) and
shared data shapes (`CSelectItem`, `CToastMessage`, …):

```ts
import type { CAlertType, CSelectItem } from '@cscfi/csc-ui-next';
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
    "./node_modules/@cscfi/csc-ui-next/dist/vscode.html-custom-data.json"
  ],
  "css.customData": [
    "./node_modules/@cscfi/csc-ui-next/dist/vscode.css-custom-data.json"
  ]
}
```
