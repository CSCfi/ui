---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

The first stable release of the rewrite: the CSC Design System as native custom elements, built with Vue 3, one set of `c-*` tags for plain HTML, Vue, React and Angular. Upgrading from 3.x: follow the migration guide, https://design-system.csc.fi/migration, which names every changed 3.x attribute, event, slot, part and method.

What breaks, by theme:

- **Registration.** `defineCustomElements()` comes from `@cscfi/csc-ui` itself (no `/loader`, no polyfills), the stylesheet is `css/tokens.css`, and the package is ESM-only. 3.x and 4.x cannot run side by side.
- **Events.** One lowercase vocabulary: `input` and `update:value` on every change, `change` with the value on a commit, `change:<prop>` for other state. `changeValue` and every other camelCase event are gone. Vue apps use plain `v-model`; `@cscfi/csc-ui-vue` and its `v-control` directive are retired.
- **Validity.** `valid` is now `invalid`, and no boolean attribute defaults to `true`.
- **Styling.** `::part()` and the semantic colour tokens replace the per-component CSS custom properties; `applyTheme()` derives the ramps and dark mode from one seed per family. Components inherit the page's font.
- **Names.** Attributes, slots, parts and events renamed or removed. Tags removed: `c-backdrop`, `c-menu-items`, `c-ripple`, `c-row`, `c-spacer`, `c-swiper`, `c-swiper-tab`, `c-text-field-open`; `c-dropdown`, `c-input` and `c-toast` are internal now.
- **React.** `@cscfi/csc-ui-react` is generated from the manifest and always carries the core's version; `onChangeValue` gives way to `onUpdateValue` and `onChange`.

Deprecated but working until 5.0: c-button and c-icon-button `outlined`, `ghost`, `text` and `danger` (`appearance`, `variant`); the fields' `hide-details` (`hide-message`); c-spinner and c-loader `width` (`thickness`); c-toasts `vertical`, `horizontal` and `absolute` (`position`, `contained`); the side-navigation items' `active` (`current`, `expanded`); c-card `fullscreen` (`show-fullscreen`); c-slider `labels` (`tick-labels`).

Supported browsers: the last two versions of Chrome, Edge, Firefox, Safari and iOS Safari, and Firefox ESR. 3.x is frozen at 3.0.19 (`@cscfi/csc-ui@3`); its documentation stays at https://design-system.csc.fi/v3/.
