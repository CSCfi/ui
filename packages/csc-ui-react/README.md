# @cscfi/csc-ui-react

React components for the [CSC Design System](https://design-system.csc.fi)'s
custom elements from [`@cscfi/csc-ui`](https://www.npmjs.com/package/@cscfi/csc-ui):
one typed component per element, generated from the same source, with props
set as properties and events as typed `on*` callbacks.

```bash
npm install @cscfi/csc-ui @cscfi/csc-ui-react
```

Import the design tokens once at startup. Importing anything from this
package registers the custom elements, so there is no setup call:

```tsx
import '@cscfi/csc-ui/css/tokens.css';

import { CTextField } from '@cscfi/csc-ui-react';
import { useState } from 'react';

export const ProjectName = () => {
  const [name, setName] = useState('');

  return (
    <CTextField
      label="Project name"
      onUpdateValue={(event) => setName(event.detail as string)}
      value={name}
    />
  );
};
```

The two packages are released together under the same version; keep them
in step. React 18 or later is required. Types for props and event details
(`CSelectItem`, `CAlertType`, …) are exported from `@cscfi/csc-ui`.

[Getting started](https://design-system.csc.fi/getting-started) has the full
setup, and every component's page shows its React example.

## Upgrading from 3.x

4.0.0 is a rewrite; the
[migration guide](https://design-system.csc.fi/migration) lists every change.
3.x is unsupported since 4.0.0. To stay on it for now, pin the major version
of both packages (`@cscfi/csc-ui@3 @cscfi/csc-ui-react@3`).

## License

MIT
