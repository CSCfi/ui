# Plan: `c-menu` / `c-menu-item` / `c-menu-label` / `c-divider` (csc-ui-next)

## Context

`_todo/csc-ui-next-menu-component.md` asks for a **declarative, slot-based dropdown menu**
for `csc-ui-next`. The existing Stencil `c-menu` is a *programmatic* `items`-array API with
hand-rolled `getBoundingClientRect()` positioning teleported to `document.body`, and it has no
submenus and mislabels itself `role="listbox"`. We are **not** porting that; we are building a
modern, accessible **command menu** whose items are authored as markup (`<c-menu-item>` children),
matching the visual references in `_todo/data/`.

This is a net-new component family in `csc-ui-next` (nothing here is a 1:1 migration). It must
match the look of existing components (baseline styling lifted from `c-dropdown`'s item/list
look) and follow csc-ui-next conventions (ADR-0004 `tailwind-variants`, ADR-0006 `::part()`-only
customization, ADR-0007 escape-hatch `<style>`).

### Terminology guard (resolved with user)
This is a **`c-menu`** (commands / navigation / submenus, fire-and-forget), distinct from the
existing **`c-dropdown`** (value-selection listbox behind `c-select`, emits `update:value`). The
todo's phrase "the dropdown's 'select' event" conflates the two; we keep them separate. A glossary
entry will be added to `CONTEXT.md` (see Deliverables).

## Decisions (from the grilling session)

| Topic | Decision |
|---|---|
| Overlay + positioning | Native **Popover API** (`popover` attr, top-layer, free light-dismiss + Esc) + **CSS anchor positioning** (`anchor-name` / `position-anchor` / `position-area` / `position-try`) |
| Cross-browser (Firefox) | Load the **OddBird `@oddbird/css-anchor-positioning`** polyfill at runtime only when `!CSS.supports('anchor-name: --x')` |
| Components / tags | `c-menu`, `c-menu-item`, `c-menu-label`, `c-divider` |
| `c-divider` scope | **General-purpose** separator (`role="separator"`), horizontal default, `vertical` boolean. Menu is just its first consumer. |
| Selection contract | **Fire-and-forget**: `c-menu` emits a bubbling/composed `select` CustomEvent `{ value }` for the activated **leaf** item; activating a leaf closes the whole menu. No persistent selected state, no checkmarks. Submenu-parent items expand instead of emitting. Disabled items do nothing. |
| Open state | **Two-way `open`** (v-model:open capable): prop drives `showPopover()`/`hidePopover()`; the popover `toggle` event drives `emit('update:open', …)`. Stays consistent with browser light-dismiss. |
| Submenus | **Hover + click + keyboard.** Open on hover (open-delay) / click / Enter / Space / ArrowRight; ArrowRight moves focus into first child; ArrowLeft & Esc close + refocus parent; close on leave (close-delay). Each submenu is its own nested popover anchored `right-start` (flips to `left-start`). |
| A11y / keyboard | **Full WAI-ARIA menu-button pattern**: `role=menu` + `role=menuitem`, roving tabindex (single tab stop), Up/Down (wrap), Home/End, Enter/Space activate, Esc close + refocus trigger, Tab close+exit, Right/Left submenu, printable-char **type-ahead**. Trigger gets `aria-haspopup="menu"` / `aria-expanded` / `aria-controls`; `c-menu-label` is `role="group"`/presentation with `aria-labelledby` wiring. |

## Architecture: `c-menu` is the sole controller

`provide/inject` does **not** cross `defineCustomElement` boundaries (each `c-*` is an isolated Vue
app), so coordination is via the DOM:

- `c-menu-item`, `c-menu-label`, `c-divider` are **light-DOM children** of `c-menu`; submenu items
  are light-DOM descendants of their parent `c-menu-item`, hence still inside `c-menu`'s subtree.
- `c-menu` attaches **delegated listeners** (`click`, `keydown`, `pointerover`/`pointerout`) — native
  `click`/`keydown` are `composed`, so they bubble across shadow roots — and resolves the target via
  `event.target.closest('c-menu-item')`, reading the item's `value`.
- `c-menu` runs the **keyboard/roving-tabindex manager** over a flattened, DOM-order list from
  `this.querySelectorAll('c-menu-item')` (filtering out disabled and collapsed-submenu descendants),
  setting `tabindex` and calling `.focus()`.
- `c-menu-item` is mostly presentational: renders its row (`role="menuitem"`), its default-slot
  content wrapper, and — when its `submenu` slot is populated — its own submenu **popover** + the
  `aria-haspopup`/`aria-expanded` state, opened/closed on command from the controller or its own
  pointer/keys.

**Risk to verify (not assume):** the browser's automatic *nested-popover* dismissal chain is
established by DOM containment / invoker; across separate shadow roots it may not chain. Plan to
**coordinate dismissal in `c-menu`** (closing the root popover closes all open submenu popovers)
rather than relying on auto-nesting. Confirm behaviour during implementation.

## Positioning specifics (anchor across the slot boundary)

The trigger is **slotted** (light DOM) but the panel popover lives in `c-menu`'s **shadow DOM**.
CSS `anchor-name` references are tree-scoped, so the anchor must be a shadow-DOM element. Therefore
`c-menu` renders an **anchor wrapper inside its shadow root** around `<slot name="trigger">`:

```
<span part="trigger" :class="ui.trigger()">      <!-- carries anchor-name: --c-menu-anchor; inline-flex box -->
  <slot name="trigger" />
</span>
<div popover part="panel" :class="ui.panel()">    <!-- position-anchor: --c-menu-anchor -->
  <div role="menu" part="list" :class="ui.list()"><slot /></div>
</div>
```

- The `position` prop (12 placements) maps to `position-area` + `position-try` fallbacks for
  flip/shift. `position-try` syntax is un-Tailwindable → lives in the **escape-hatch `<style>`**
  (ADR-0007), referencing only tokens; the dynamic `position-area` is driven by `position`.
- `aria-haspopup`/`aria-expanded`/`aria-controls` are mirrored onto the **assigned trigger element**
  (`slot.assignedElements()[0]`) so the focusable control carries them; interaction listeners sit on
  the controller.
- Polyfill: lazy `import()` of `@oddbird/css-anchor-positioning/fn` and invoke once, on first open,
  only when the feature is unsupported.

## Files to create

Each is a single SFC per folder, following the `c-dropdown`/`c-button` structure
(`<template>` → `<script setup lang="ts">` with `interface Props` + `withDefaults` → optional
escape-hatch `<style>`), styling in a `tv()` config, parts stamped via `part="…"`, **no `override`
prop** (ADR-0006).

- `packages/csc-ui-next/src/components/c-menu/CMenu.vue` — controller. Props: `position`
  (`'top'|'top-start'|…|'left-end'`, default `'bottom-start'`), `open` (boolean, default `false`).
  Emits `select` `{ value }` and `update:open`. Parts: `trigger`, `panel`, `list`. `useHost()` +
  delegated listeners + keyboard manager + popover sync + polyfill loader. Escape-hatch `<style>`
  for `:host`, `position-try` fallbacks, `::backdrop`.
- `packages/csc-ui-next/src/components/c-menu-item/CMenuItem.vue` — Props: `disabled` (boolean,
  default `false`), `value` (string). Default slot wrapped in `flex items-center gap-2` (per todo,
  for icons etc.); `submenu` slot → own nested popover. Parts: `root`, `content`. Uses `useHasSlot`
  to detect a populated `submenu` slot (drives `aria-haspopup`/chevron).
- `packages/csc-ui-next/src/components/c-menu-label/CMenuLabel.vue` — Props: none. Default slot;
  `role` presentation/group label. Part: `root`. (Tag `c-menu-label` per usage example.)
- `packages/csc-ui-next/src/components/c-divider/CDivider.vue` — Props: `vertical` (boolean,
  default `false`). `role="separator"` + `aria-orientation`. Part: `root`. Standalone primitive.

## Files to modify

- `packages/csc-ui-next/src/index.ts` — import the four SFCs and add to the `components` registry
  array; add the four tags to `tailwindVariantTags`. (Order: register `c-menu-item`/`c-menu-label`/
  `c-divider` before `c-menu`, mirroring the dropdown-stack ordering comment.)
- `packages/csc-ui-next/package.json` — add dependency `@oddbird/css-anchor-positioning`.

## Reuse (do not re-implement)

- `useHost()` (vue) for the host element — event dispatch / DOM queries, as in `CDropdown.vue:225`.
- `useHasSlot()` (`src/shared/useHasSlot.ts`) — detect populated `submenu` slot.
- `useTemplateRef` for the popover/anchor refs.
- The `emit` helper pattern (`host.dispatchEvent(new CustomEvent(name,{bubbles,composed,detail}))`),
  `CDropdown.vue:354`.
- `tv` from `tailwind-variants`; tokens via `@theme inline` utilities (`bg-white`, `bg-primary-200`,
  `text-primary-600`, `shadow-[2px_4px_10px_#00000029]`, `rounded`, `rounded-csc-md`). Item styling
  baseline from `CDropdown.vue:155` (`flex items-center … min-h-[42px] px-[10px] rounded hover:…`).
- `@mdi/js` (`mdiChevronRight` for the submenu affordance), rendered as inline `<svg>` like
  `CDropdown.vue:94`.
- `:host{display:contents}` baseline stays; trigger wrapper supplies the anchor box.

## Deliverables beyond code (post-approval; blocked by plan mode now)

- **`CONTEXT.md`**: add a *Menu* section distinguishing `c-menu` (command menu, `select`, submenus)
  from `c-dropdown` (value-selection listbox); define **Trigger**, **Submenu**, **Separator** terms.
- **`docs/adr/0008-popover-api-and-css-anchor-positioning.md`**: record the overlay/positioning
  architecture — Popover API + CSS anchor positioning + OddBird polyfill, chosen over `@floating-ui`
  and over the manual `getBoundingClientRect()` approach the rest of the codebase uses. (Hard to
  reverse, surprising, real trade-off — meets all three ADR criteria.)
- Per the user's standing convention, the approved plan will also be placed in the repo `_plan/`
  folder.

## Verification

1. **Build**: `cd packages/csc-ui-next && npm run build` — confirm the four tags compile and the
   `tv` utilities resolve inside shadow roots (Tailwind `@source` picks up the new `.vue` files).
2. **Docs harness**: `cd packages/csc-ui-documentation && CSC_UI_IMPL=next npm run dev`; add a
   scratch page using both usage examples from the todo (flat menu with label + divider; nested
   submenu). Verify: trigger toggles; placement honours `position` and flips near viewport edges;
   `select` fires with the right `value`; leaf-activation closes; submenu opens on hover/click/→.
3. **Cross-browser**: manually exercise in **Chrome** (native anchor) and **Firefox** (OddBird
   polyfill path) — explicitly confirm the polyfill positions the shadow-DOM popover correctly
   (its known weak spot). Check Safari if available.
4. **A11y**: keyboard-only walkthrough (Up/Down/Home/End/type-ahead/Esc/Tab/→/←), screen-reader
   announce of `menu`/`menuitem`/group label, and an axe/Lighthouse pass. Confirm focus returns to
   the trigger on close.
5. **v-model**: bind `v-model:open` and confirm it tracks light-dismiss (outside-click/Esc) and
   programmatic open/close.
```
