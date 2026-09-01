# c-table: keep the consumer's `<table>` in the light DOM

> On execution start, copy this plan into the repo's `_plan/` folder (user preference).

## Context

Bug report: a `c-tag` inside `c-table` can't be styled from a docs example's page stylesheet (`c-tag.foo::part(root) { … }`), while the same styling works inside `c-data-table`.

Root cause: `CTable.vue` has no `<slot>` — on mount it physically **moves** the consumer's light-DOM `<table>` into its shadow root (`CTable.vue:122`) so its shadow sheet can style nested `td`/`th` (`::slotted` can't reach descendants). After the move, page CSS and `::part()` can no longer reach anything inside the table (`::part` pierces only one boundary; c-table exports no parts). `c-data-table` "works" only because its examples style the tag via VNode props/inline style, which travel with the element.

Secondary bugs from the same content model:
- Responsive mode clones `<th>` **innerHTML** into a `.c-table__mobile-label` span in every `<td>` (`CTable.vue:84`) — serializes markup; nested custom elements get duplicated as markup copies.
- A `<table>` added after mount is never adopted (one-shot `onMounted` query).
- The consumer's framework still owns the moved node in its vdom — a foreign-tree hazard for dynamic rows.

**Decision (user approved):** stop moving the node. Render a `<slot>`, keep the table in the light DOM, and deliver c-table's table styling as a **document-level stylesheet scoped under the `c-table` host tag**. Page CSS and `::part()` on nested components then work naturally.

## Changes

### 1. New: `packages/csc-ui/src/components/c-table/table.css`

Move every rule from the SFC `<style>` block (`CTable.vue:167-295`) except `:host{display:block}`, re-scoping each selector with a child combinator to the slotted table:

- `table.c-table` → `c-table > table.c-table`
- `table.c-table thead th` → `c-table > table.c-table thead th`
- likewise for all rules, including both `@supports (-webkit-hyphens: none)` blocks.

Keep stamping `.c-table` / toggling `.c-table--mobile` from the script. All colors already use semantic tokens (`var(--c-border)` etc.) — safe in the document (tokens.css is a document sheet).

Deliberately **unlayered** (no `@layer`): layered styles would lose to any consumer reset (`td { padding: 0 }`), stripping the defaults. Specificity `c-table > table.c-table td` (0,1,3) beats generic resets; targeted consumer selectors can still override. Record trade-off in the ADR.

### 2. New: `packages/csc-ui/src/components/c-table/injectTableStyles.ts`

One `<style data-csc-ui-c-table>` injected into `document.head`, mirroring the existing prior art `ensureTwPropsRegistered()` in `packages/csc-ui/src/shared/defineElement.ts:46-64` (SSR-guarded, module-flag idempotent, data-attribute probe against duplicate library copies):

```ts
import tableStyles from './table.css?inline';

let injected = false;
export const ensureTableStyles = (): void => {
  if (injected) return;
  injected = true;
  if (typeof document === 'undefined' || !document.head) return;
  if (document.querySelector('style[data-csc-ui-c-table]')) return;
  const style = document.createElement('style');
  style.setAttribute('data-csc-ui-c-table', '');
  style.textContent = tableStyles;
  document.head.appendChild(style);
};
```

Called from `CTable.vue` `<script setup>` body (runs in `connectedCallback` before first paint — no FOUC; not at module top level, which would inject for consumers who never use c-table).

Rejected alternatives: `document.adoptedStyleSheets` (sorts after all document sheets — page CSS could never win cascade ties); generalizing `defineElement` with a `documentStyles` convention (more machinery than one component needs; note in ADR as future option). `?inline` imports are established (`tailwind.css?inline` in defineElement); no build/analyzer/lint:tokens interaction (analyzer never reads external CSS; lint scans `.vue` only).

### 3. Rewrite `packages/csc-ui/src/components/c-table/CTable.vue`

- **Template**: `<slot @slotchange="onSlotChange" />`; delete the mount `<div>`; rewrite the lines 2–9 comment for the new model. Keep `defineOptions({ inheritAttrs: false })`.
- **Idempotent `adoptTable()`** replacing the `onMounted` body, called from both `onMounted` and `slotchange` (precedent: `CButtonGroup.vue`):
  - same table → re-run `createMobileLabels()` if responsive (rows may have changed);
  - new/replaced table → stop observer, un-stamp old, stamp `.c-table`, start observer + labels if responsive;
  - fixes late-added-table bug for free.
- **Mobile labels without serialization**: `headers()` returns `th` elements (tighten query to `:scope > thead th` — avoids picking up nested tables' headers; note in changeset). In `createMobileLabels`, replace `span.innerHTML = heading` with cloning: `for (const node of th.childNodes) span.appendChild(node.cloneNode(true))`. Keep `no-mobile-labels`, `colSpan` skipping, idempotence, and the `host.updateMobileLabels` exposure (`CTable.vue:124`) exactly as-is.
- **Lifecycle**: `watch(responsive)` unchanged. `onBeforeUnmount`: disconnect observer **and** remove `.c-table--mobile` (the table now outlives the component); leave `.c-table` and label spans in place (un-mutating a framework-owned tree at teardown is riskier than inert artifacts).
- **`<style>`** shrinks to `:host { display: block }` (host must be a real box for the slotted table) with an updated escape-hatch comment pointing at `table.css` / the new ADR. Keeping it in the shadow sheet preserves override semantics (any consumer document rule on the host beats `:host`).

### 4. New: `packages/csc-ui/src/components/c-table/usage.md`

First paragraph = manifest description (ADR-0026; currently empty): the table stays in the consumer's DOM — their CSS, framework rendering, and `::part()` on nested components keep working — while c-table supplies the CSC look and optional responsive card layout. Sections: responsive mode + `mobile-breakpoint`, `no-mobile-labels` row attribute, `updateMobileLabels()` after framework-driven row changes, and a note that responsive mode prepends label spans into cells (visible to the consumer's framework; keyed re-renders may drop them — call `updateMobileLabels()`).

### 5. New docs example: `packages/csc-ui-documentation/app/examples/c-table/styling.vue`

Table with a Status column of `c-tag`s + unscoped plain-CSS `<style>` (examples are excluded from the docs Tailwind scan via `@source not '../examples'`); pattern precedent `app/examples/c-badge/basic.vue`:

```css
c-tag.tag-success::part(root) { background-color: var(--c-success); }
```

Flavor variants to satisfy `check-example-parity.mjs`, mirroring the existing c-table set: `styling.react.tsx`, `styling.angular.ts`, `styling.typescript.html`.

### 6. New ADR: `docs/adr/0037-c-table-light-dom-table-scoped-document-sheet.md`

Status accepted. Records the slot + scoped document sheet model; supersedes move-into-shadow (previously only a template comment). Positions against ADR-0005 (library-wide shadow DOM stands — c-table keeps its shadow root; the exception is only that consumer-authored slotted content can't be styled from a shadow sheet). Rejected alternatives: keep moving the node, `::slotted`, `adoptedStyleSheets`, `@layer`, CSS-only `attr()` mobile labels (drops rich header markup). Consequences: first document-level component sheet — precedent constraints: host-tag scoping, semantic tokens only, injected once.

### 7. Changeset (`minor` for the fixed group `@cscfi/csc-ui` + `@cscfi/csc-ui-react`)

Consumer-observable change: table stays in consumer DOM; page CSS/`::part()` on nested components now apply; a scoped stylesheet is added to `document.head`; mobile labels built from cloned nodes. High-level, user-facing wording; mention that consumer resets can now reach the table (previously blocked by the shadow boundary).

## Verification

1. `pnpm ui build` — full pipeline incl. strict manifest; confirm `custom-elements.json` gains c-table's default slot + description.
2. `pnpm --filter @cscfi/csc-ui-react build` (wrappers regenerate from manifest).
3. `pnpm ui lint:tokens`, `pnpm ui lint:a11y`; docs package `pnpm lint:examples` (flavor parity).
4. `pnpm dev` → http://localhost:3500/components/c-table: basic + responsive render as before (labels include rich header content); new styling example shows page-CSS-styled `c-tag`s. Verify light **and** dark via the headless-chromium screenshot recipe (memory `project_csc_ui_next_visual_verify`).
5. Manual: two c-tables → exactly one `style[data-csc-ui-c-table]`; toggle `responsive` at runtime; append a `<table>` after mount (slotchange adoption); devtools confirms the table never leaves the light DOM.
6. No existing c-table tests (none in repo).

## Risks

- **Inbound bleed by design**: consumer resets/preflight now reach the table; apps with aggressive `table`/`td` resets may see diffs. Accepted trade; 0,1,3 specificity shields against generic resets; call out in changeset.
- **Override ergonomics**: consumers must match 0,1,3 specificity (`c-table table.c-table td`) to override cell defaults — deliberate rejection of `:where()` scoping recorded in ADR.
- **Label spans in framework-owned DOM**: keyed re-renders may drop them; covered by idempotent `updateMobileLabels()` + docs note (pre-existing hazard, now more visible).
