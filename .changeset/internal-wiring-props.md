---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

Props, slots and methods that only a parent component sets or calls are now
internal (ADR-0075): they leave the manifest, the IDE data, the element types
and the React wrapper, and no release promises anything about them.

- `c-tab` `active`, `c-tab-item` `active`, `c-tab-items` `value` and
  `disable-animation`, and `c-tab-buttons` `value`: `c-tabs` sets them from its
  own `value` and `disable-animation`. `c-tab` loses `host-id`, `position` and
  `setsize`; a plain `id` on a tab or a panel now stays, where `c-tabs` used to
  replace it.
- `c-accordion-item` `expanded`, `collapsable` and `outlined`: `c-accordion`
  sets them. Style an expanded item with `c-accordion-item:state(expanded)`.
- `c-step` `current` and `complete` (`c-steps` sets them from its `value`),
  `c-list-item` `disabled-by-parent`, `c-list-item-title` `active`, `c-button`
  `no-ripple`, and `focusable` on `c-side-navigation-item` and
  `c-sub-navigation-item`.
- The slots a component assigns its own children to: `c-breadcrumb` `first`
  and `folded`, `c-side-navigation-item` `sub-item`.
- `c-menu-item`'s `openSubmenu()`, `closeSubmenu()` and `isSubmenuOpen()`.

The package entry no longer exports the `C*Props` types (use the `C*Element`
types), `migratedTags` or `tailwindVariantTags`.
