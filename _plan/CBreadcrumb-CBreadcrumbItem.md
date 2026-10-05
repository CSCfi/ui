# CBreadcrumb and CBreadcrumbItem

we'd like to add breadcrumb components to the design system

## Features

### CBreadcrumb
- container for the breadcrumb items
- separates the items with a configurable separator
- the first and last items are always visible
- the items in the middle can be folded into a [...] button that will act as a trigger for a popover that have all the folded items inside

### CBreadcrumbItem
- something similar to smal CButton with a 'text' prop
- 'flex gap-2 items-center' for the base for easy icon + label insertion

## Usage
```vue
<c-breadcrumb>
  <c-breadcrumb-item separator=">">
    <c-icon :path="mdiHome" />
  </c-breadcrumb-item>

  <c-breadcrumb-item>Projects</c-breadcrumb-item>

  <c-breadcrumb-item disabled>Project #1</c-breadcrumb-item>
</c-breadcrumb>
```

---

# Grilled plan (2026-10-02)

The sections below supersede the draft above where they differ (no `disabled`, no `separator`, icon in the `icon` slot).

## Decisions (grilling log)

1. **Vocabulary** — **Breadcrumb** = `c-breadcrumb`; **Crumb** = `c-breadcrumb-item`;
   tree-select's = **panel breadcrumb** (parts unchanged, not refactored). *Already in CONTEXT.md.*
2. **Current crumb** — the last crumb is always the current page: non-link text in
   `on-surface` ink, `aria-current="page"`, ignores `href`. No `disabled` on crumbs.
3. **Crumb separator** — fixed, `aria-hidden`, not configurable (plan's `separator` dropped). *Amended 2026-10-02:* the `mdiChevronRight` icon (16px SVG), not the `›` glyph — a glyph sits on font metrics and rendered low; the fold button shows `mdiDotsHorizontal` for the same reason, and each label is nudged so its capitals centre with the icons (baseline measured by a zero-size probe, cap height by canvas `measureText`; `text-box` trimming was tried and dropped — Firefox lacks it, and macOS Helvetica then set the caps a pixel high).
4. **Fold trigger** — measured overflow; one line; middle crumbs fold root-side first
   (2, 3, …) until the row fits. First and current never fold. No `max-items`.
5. **Still too wide** — truncate with ellipsis: current crumb first, then the first crumb,
   each down to a floor; a truncated crumb gets its full label as native `title`. Never wraps.
6. **Crumb look** — small text `c-button` (28px, primary ink, c-button's text-variant hover),
   rendered by the crumb itself — never wrap `c-button` (its `href` mode defaults
   `target=_blank` and Space/Enter call `window.open`, `CButton.vue:486,563-575`).
7. **Link & routing** — `href` (+ optional `target`, default none) → the crumb's own `<a>`.
   SPA routing = intercept the host's native click. Non-current crumb without `href` =
   non-interactive text.
8. **Fold panel** — `c-breadcrumb`'s own disclosure: native `<button aria-expanded
   aria-controls>` + `popover="manual"` panel listing folded crumbs as links. Tab walks them;
   Escape / light dismiss close and return focus to the fold button. c-menu panel visuals,
   hidden scrollbar + peek; Floating UI fallback; always anchored (no fullscreen).
9. **Fold mechanics** — the breadcrumb sets `slot="folded"` on folded crumbs (precedent
   `CSideNavigation.vue:277-284`); real elements project into the panel. First crumb gets
   `slot="first"` so the fold button follows it in DOM/Tab order.
10. **Icon-only crumbs** — named by host `aria-label`, forwarded to the `<a>`. No `label` prop.
11. **Icon placement** — named `icon` slot (c-button precedent); the label sits in its own
    truncating box. Usage: `<c-icon slot="icon" :path="mdiHome" />`.
12. **Names** — **fold button**, **fold panel** (a transient list panel), **folded crumbs**.
13. **Defaults taken** — crumb derives *current* from position (`CAccordionItem.vue:251-317`
    pattern) and *folded* from its slot; no public props for either; exposed as
    `:state(current)` / `:state(folded)`. `texts` (defaultable): `breadcrumb` ("Breadcrumb"),
    `fold: (count) => string` ("Show 3 more"). Folded crumbs root-first, no indentation.
14. **ADR-0067** — "c-breadcrumb folds overflowing crumbs into a disclosure panel by moving
    them": measured overflow vs `max-items`; disclosure of links vs embedded `c-menu`
    (c-pagination's approach); slot reassignment vs mirrored rows (c-autocomplete's).

## Implementation

### c-breadcrumb-item (`src/components/c-breadcrumb-item/CBreadcrumbItem.vue`)

```html
<li part="root">
  <span v-if="!first && !folded" aria-hidden="true" part="separator">›</span>
  <a :href="interactive ? href : undefined" :target="…" :aria-current="current ? 'page' : undefined"
     :aria-label="…host aria-label…" :title="truncated ? labelText : undefined" part="content">
    <span v-show="hasIcon"><slot name="icon" /></span>
    <span v-show="hasLabel" part="label"><slot /></span>
  </a>
</li>
```
- One `<a>` always (no `:is` swap — swapping recreates slots and strands `useHasSlot`,
  `shared/useHasSlot.ts:38-48`); `interactive = !!href && !current`.
- `defineOptions({ inheritAttrs: false })` — Vue CE routes every host attribute (incl. the
  parent's `slot`) into `$attrs`; forward only `aria-label` (check whether the key arrives
  camelized as `ariaLabel`; assert in spec).
- States: first/current from a parent `childList` MutationObserver (accordion-item copy);
  folded from an own-host `attributeFilter: ['slot']` observer; publish via
  `shared/useHostStates.ts`. Truncated = label `scrollWidth > clientWidth` (ResizeObserver).
- tv: copy c-button's small + text classes (`CButton.vue:228-232,289-295,425-444`) for
  `content`; `label: truncate min-w-12`; `root` max-width from internal vars
  `--_c-breadcrumb-first-max` / `--_c-breadcrumb-current-max` (set by the parent);
  `folded` variant = c-menu-item row look (`CMenuItem.vue:136`). Focus ring needs
  `outline-solid` (`lint:focus`).
- Parts `root, separator, content, label`; slots default, `icon`; states `current, folded`.

### c-breadcrumb (`src/components/c-breadcrumb/CBreadcrumb.vue`)

```html
<nav :aria-label="t.breadcrumb" part="root">
  <ol part="list" :style="truncationVars">
    <slot name="first" />
    <li class="fold"><span aria-hidden="true" part="separator">›</span>
      <button part="fold-button" :aria-expanded :aria-controls :aria-label="t.fold(n)">…</button>
      <div popover="manual" part="panel"><ul part="panel-list"><slot name="folded" /></ul></div>
    </li>
    <slot />
  </ol>
</nav>
```
- Panel always rendered (the conformance suite probes `[popover]` on a bare mount). Fold
  `<li>` is `absolute invisible pointer-events-none` while nothing is folded (still measurable).
- Model the panel on **c-menu's own code**, not `useAnchoredPanel` (that one is field-shaped:
  `useAnchoredPanel.ts:96-121,214-241`): `toggle` event as open-state source
  (`CMenu.vue:615-651`), `attachLightDismiss` (`CMenu.vue:830-853`), `useFallbackPosition`
  (`CMenu.vue:188-206`), `applyPeekCap` on the folded crumbs' shadow `<li>`s, panel/list
  classes and `<style>` from `CMenu.vue:127-129,925-946`. `panel-list` paints `text-on-surface`
  (projected-ink suite).
- Escape: host keydown while open → `preventDefault` → close → focus fold button. Click on a
  folded crumb: delegated host listener (after the consumer's) closes the panel, never
  `preventDefault`s. `focusout` leaving panel + button closes without moving focus.
- `texts`: `CBreadcrumbTexts`, `@defaultable {}`, resolved via
  `useAppDefault('c-breadcrumb', props)('texts', DEFAULT_TEXTS)` (`CTreeSelect.vue:783-806`).
- `inheritAttrs: false`. `@slot` tags for `first` / `folded` ("assigned by the breadcrumb").
- Parts `root, list, separator, fold-button, panel, panel-list`. `@subcomponents c-breadcrumb-item`.

### Fold algorithm (`src/components/c-breadcrumb/fit.ts`, pure, no classes)

- Measure only crumbs in the row, on their shadow `[part~=root]` (hosts are
  `display:contents`, zero rect). `natural = root.width + label.scrollWidth − label.clientWidth`;
  `floor = natural − label.scrollWidth + label min-width`. Cache in a `WeakMap`, first
  measurement wins (`CDataTable.vue:1107-1162` precedent).
- `fit(naturals, floors, foldWidth, avail)` → `{ folded, currentMax, firstMax }`: add fold
  width once anything folds; fold index 1.. until it fits (never first/last); remaining
  deficit shrinks current to its floor, then first. ε = 0.5px.
- Apply: write `slot` only when changed; truncation via the two vars on `<ol>`.
- Triggers: mount → `whenDefined('c-breadcrumb-item')` → rAF → measure → fit. Host
  MutationObserver `{childList, subtree, characterData}` (no attributes, so own `slot` writes
  don't retrigger) → clear cache, unfold all, rAF re-measure (covers `v-for` route changes; no
  `flush:'post'` watchers). ResizeObserver on `<nav>` (width changes only) → fit from cache.
  `document.fonts` `loadingdone` → reset. Bounded rAF retry for unmeasurable crumbs.
- Open panel when the folded set changes: stays open while ≥1 folded (re-peek on
  `slotchange`); closes when empty, moving focus to the fold button or first crumb if focus
  was inside.

### Wiring & generated files

- `src/index.ts`: imports, `export type { CBreadcrumbProps, CBreadcrumbTexts, CBreadcrumbItemProps }`,
  register `c-breadcrumb-item` before `c-breadcrumb` (`index.ts:378`), add both to
  `tailwindVariantTags` (`index.ts:412`).
- Regenerate + commit: `src/tag-name-map.ts` (run `docs:tag-map` before type-check),
  manifest, `api.snapshot.json` ×2, `src/api.entry.snapshot.json`,
  `packages/csc-ui-react/src/components.ts` (generated — nothing hand-written).
- `src/test/conformance/kinds.ts`: `OVERLAY_RECIPES['c-breadcrumb']` (six long crumbs; `open`
  narrows `m.stage` to 320px, settles twice, clicks `fold-button`; `focusHome` = fold button;
  `lightDismiss: true`; `panel` = `panel` part).
- Hazards: component-prefix private type names (tag-map collision); first build may drop new
  SFC utilities — grep `dist` for `_c-breadcrumb-current-max`, rebuild; specs type-check on
  ES2022 lib; check Chromium's a11y tree once for a named generic node from a host `aria-label`.

### Docs, glossary, ADR, changeset

- `usage.md` for both tags (first paragraph = description, ADR-0026): crumbs & icon slot,
  icon-only naming, folding & truncation (flex-row hint `::part(root){flex:1;min-width:0}`),
  single-page apps, texts, parts & states.
- Examples `packages/csc-ui-documentation/app/examples/c-breadcrumb/`: `basic`, `folding`,
  `spa-routing` (in-memory route ref + `// router.push(to)` — the smoke has no router; Vue
  `@click.exact.prevent`, React modifier check + `preventDefault`, Angular `(click)`, TS
  delegated `closest('c-breadcrumb-item')`), `texts` (every key, Finnish). All four flavors.
- `CONTEXT.md`: add **Current crumb**, **Crumb separator**, **Fold button**, **Fold panel**,
  **Folded crumbs**; extend **Transient list panel** / **Peek** enumerations.
- `docs/adr/0067-c-breadcrumb-folds-overflowing-crumbs-into-a-disclosure-panel.md`.
- `.changeset/breadcrumb-component.md`: `minor`, both packages, one high-level line.

# Grilled: fold panel keyboard (2026-10-05)

Question: is the fold panel's keyboard navigation correct, and should it take arrow keys?
The ADR-0067 contract (Tab, Escape, light dismiss, focus return, Escape inside `c-modal`)
held; the panel looked like c-menu's yet ↓ scrolled the page.

1. **Disclosure + arrow keys.** Still a disclosure of links (no roles change, Tab walks
   every folded crumb); ↓/↑ move between folded crumbs, Home/End jump to the ends.
2. **Arrows on the fold button open and enter.** ↓ opens the panel (if closed) onto the
   first folded crumb, ↑ onto the last (c-menu trigger parity). Enter/Space stay the
   native toggle, focus kept on the button.
3. **Arrows wrap** (c-menu / c-radio-group / c-button-group parity).
4. **No typeahead; ←/→ untouched.** Href-less folded crumbs are skipped, as Tab skips them.
5. **Escape inside a `c-popover`** closing both stays a documented limitation, shared with
   c-menu (`popoverChain.ts`).

Found while auditing: `focusInFold` read `document.activeElement`, so inside an app's
shadow root Tab into the panel closed it. Now read from the breadcrumb's own root node.
