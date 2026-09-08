# Multiple selection for `c-select` and `c-autocomplete`

> **Status: implemented 2026-09-08** (ADR-0044) — see Outcome at the end. Grilling session 2026-09-08 (14 decisions below). Plan-mode constraint: CONTEXT.md / ADR / changeset text is drafted here under "Glossary & ADR updates" and written at implementation time; the plan itself is copied to `_plan/select-autocomplete-multiple.md` as step H4.

## Context

Both value-selection components (`c-select` on `c-dropdown`; `c-autocomplete` on its own popover panel, ADR-0009) hold exactly one selected value today. Consumers need to pick several options from one field. The request: a mode where each option row is prepended with a checkbox, clicking an option toggles it **without closing the panel**, and the selected options render as tags inside the field, with a fold ("+3 more" / "5 selected") when they overflow.

## Decisions so far

| # | Topic | Decision | Rationale |
|---|-------|----------|-----------|
| 1 | Prop name | `multiple` (not `multi`) | Matches `c-button-group`'s existing `multiple` and native `<select multiple>`; one word per concept. |
| 2 | Fold policy | One numeric cap prop (name TBD): unset = every tag, field wraps; `N > 0` = first N tags + one overflow tag "+X more"; `0` = no tags, summary only "X selected" | One prop covers both requested shapes; mirrors MUI `limitTags` / AntD `maxTagCount` / PrimeVue `maxSelectedLabels`. Auto-fit-to-width deferred (could become a later `'responsive'` value). |

| 3 | Query after a toggle (`c-autocomplete`) | Keep the query; the list stays filtered so several matches can be ticked in a row. Query still resets to `''` on open (ADR-0029 signal). | Search input lives inside the panel, not inline with the tags, so the MUI/AntD "clear on select" rationale does not apply. |

| 4 | Row checkbox semantics | **Decorative**: the option row is the single interactive target; the checkbox visual is `aria-hidden`, no tab stop; state via `aria-selected` on rows + `aria-multiselectable="true"` on the listbox. | A real `c-checkbox` inside `role="option"` is a nested interactive control (focusable input, own events, double toggle). WAI-ARIA multiselect listbox pattern. |
| 5 | Indicator source | Extract c-checkbox's indicator + mark into a shared internal non-element SFC `src/shared/SelectionIndicator.vue` (FormLabel pattern, ADR-0022), rendered by c-checkbox, c-dropdown (option rows) and c-autocomplete (option rows); stamps `part="indicator"` / `part="mark"` into each host's contract. | One source of truth; `c-select::part(indicator)` recolours option checkboxes the same way `c-checkbox::part(indicator)` does (ADR-0035/0039 recipe carries over). |

| 6 | Value contract | Widen `value`: in `multiple` mode it is `(number\|string)[]` (or `CSelectItem[]` with `return-object`); `changeValue` / `change-value` / `update:value` carry the **whole array in selection order** (decision 11); plain `v-model` keeps working. Component-owned aliases `CSelectValue` / `CAutocompleteValue` (like `CButtonGroupValue`). The manifest's `value` attribute disappears (arrays have no attribute form) → document `:value.prop`, as c-button-group does. | Matches c-button-group / c-accordion, the components whose value *is* the selection; a separate `selected` prop would create two value channels and no v-model. |

| 7 | Tag removal | Tags render `closeable`; only the × is a tab stop (accessible name "Remove <label>"), the tag host is not; Backspace on the focused closed field removes the last tag; `clearable` clears all. Requires a c-tag adjustment: a `closeable` tag's host stops being a `role=button` tab stop (the × is the button). | Otherwise N tags add 2N tab stops before the chevron; also fixes c-tag's nested-button ARIA. |

| 8 | Strings / i18n | `texts?: CSelectTexts` / `CAutocompleteTexts` object prop shallow-merged over English defaults (the `CDataTableTexts` pattern; counted strings are functions): `more(n)`, `selected(n)`, `remove(label)`, plus today's hardcoded `clearSelection`, `toggleOptions`, and for autocomplete `filterOptions`, `searchPlaceholder`, `loading`, `noResults`. **`noResultsText` is removed** (decision 14) — `texts.noResults` replaces it. Objects bind with `:texts.prop`. | One i18n mechanism library-wide; fixes c-select's empty `aria-label=""` on its clear button as a side effect. |

| 9 | Cap prop name | `maxTags?: number` (attribute `max-tags`); unset = all tags, `N>0` = N tags + "+X more", `0` = summary only. Glossary gains **Tag** (`c-tag`) and a flagged "tag vs tag name" ambiguity. | Names the thing being capped (c-tag elements); noun-phrase like the library's other props. |

| 10 | Extra scope | Nothing beyond `clearable` in v1: no select-all row, no `mandatory`, no max-selection rule. | Ships the requested feature; each extra can land later behind its own prop. |

| 11 | Array order | **Selection order**: ticking appends, unticking removes; tags in the field follow the same order. | Deterministic in every mode including `external`, where option order is undefined for values no longer listed; deviates knowingly from c-button-group's DOM-order sort. |

| 12 | ADR | One ADR-0044: "Multiple selection widens `value` and renders a decorative row indicator" (array-in-`value` + attribute loss; decorative shared indicator; selection order; panel stays open; query kept). | Hard to reverse, surprising without context, real trade-offs. |
| 13 | Backspace scope | Closed field only: Backspace on the focused readonly field input removes the last tag; inside the open panel it edits the query (autocomplete) / does nothing (select). | Predictable; no accidental removal while filtering. |
| 14 | `noResultsText` | **Removed** from c-autocomplete in favour of `texts.noResults`. Breaking for alpha consumers; the migration guide's c-autocomplete bullet (3.x `no-matching-items-message` → `no-results-text`) must now point at `texts.noResults` (property binding). | One string mechanism only. |

## Exploration facts (verified by explorers, 2026-09-08)

- `c-select` closes via the `props.value` watcher → `onValueChanged` → `selectOption` → `dropdownRef.close()` (`CSelect.vue:347-353, 459-489`, close at :472). `c-autocomplete` closes with one explicit line in `onSelect` (`CAutocomplete.vue:714-718`), `commit()` and `closePanel()` already separated.
- No `multiple`/array value anywhere in select/autocomplete/dropdown/option. Precedents: `c-button-group` (`multiple` boolean, `CButtonGroupValue = (number|string)[] | null | number | string`, whole array emitted, re-ordered to DOM order, `mandatory` min-1) and `c-accordion` (same shape); `c-data-table` uses a separate `selected: string[]` + `change:selected`.
- `emitModelValue` (`src/shared/emitModelValue.ts`) dispatches `changeValue` + `change-value` twin + `update:value` + `input`; must never be called from a value watcher. Analyzer lint bans raw `new CustomEvent` in SFCs.
- Analyzer attribute rule (`scripts/analyzer/cem.mjs:23`): any type text containing `[]` is not attribute-compatible → widening `value` to include an array drops the `value` attribute from the manifest (c-button-group has no `value` attribute for that reason).
- `c-checkbox`: native input is focusable (clip-hidden, no tabindex hook unlike `c-radio`'s `_syncGroupState`), no `inheritAttrs:false` (host `aria-label` lands on `[part=root]`, not the input), no `size`, 42px ripple surface, `hide-details` needed to drop the 16px message strip. Parts `indicator`/`mark`, states `checked`/`indeterminate` (ADR-0035).
- `c-tag`: props `active`, `badge`, `closeable`, `flat`, `size`; single event `close`; single part `root`; host is `role=button tabindex=0` unless `flat`. Composed child of `c-tags` only (`@subcomponents`). No component renders `<c-tag>` internally yet. `c-tags` lays out with `flex flex-wrap gap-1`.
- `c-input`: `min-h-11`/`min-h-9` (grows with content), `.c-input__field` has no `flex-wrap`; the components own `.c-input__content` inside c-input's default slot, where `optionAsSelection`'s overlay already hides the readonly input via `:has()` (`CSelect.vue:905-907`). Only the `pre` slot shifts the floating label.
- i18n: only `c-data-table` has a `texts` prop (`CDataTableTexts`, functions for counted strings, merged over defaults at `CDataTable.vue:621`); `c-autocomplete` has a lone `noResultsText`. Everything else is hardcoded English. `c-select`'s clear button has `aria-label=""` (bug).
- Composition = real nested custom elements (`isCustomElement: tag.startsWith('c-')`), each with its own shadow root; registration order in `src/index.ts` matters. Shared internal SFCs (`FormLabel.vue`, `FieldMessage.vue`) are the other mode and stamp parts into the host's contract.
- No test harness in the repo; verification = docs site + analyzer strict + lints + example parity (`packages/csc-ui-documentation/scripts/check-example-parity.mjs`: every canon needs `.react.tsx`, `.angular.ts`, `.typescript.html`).
- Glossary gaps: "tag" in CONTEXT.md means *element tag name*; `c-tag`/`c-tags` are undefined; `item` vs `option` used inconsistently (API says `items`, prose/DOM say option).
- Pre-release: `4.0.0-alpha.11`, changesets in `pre` mode (tag `alpha`).

### Routine calls made without asking (flip at review if wanted)

- Overflow tag is a non-interactive `flat` c-tag, `aria-hidden`; the readonly combobox's value carries the full selection for AT (G4).
- `max-tags` defaults to unset (every tag shows; the field wraps and grows).
- Panel close rules unchanged: Escape, Tab, light dismiss; Enter/Space (select) and Enter (autocomplete) toggle.
- `reset()` / `clearable` produce `[]` in multiple mode; `<c-option selected>` seeding with several flagged options yields the array in DOM order, only when the value is currently empty.
- `c-autocomplete`'s `placeholder` prop stays (search-input placeholder) and wins over `texts.searchPlaceholder`.
- New `item` part on c-autocomplete rows (resolves the asymmetry with c-select).
- Incidental a11y fixes in the touched code: c-select's empty `aria-label=""` on the clear button, the chevron's missing label, and an `aria-label` for the readonly combobox (no accessible name today).

## Implementation

Sequencing: A (indicator + analyzer + checkbox refit) → B (c-tag) → C (c-dropdown) → D (c-select) → E (c-autocomplete) → F (exports) → G (field tag row / fold / texts, both components) → H (docs, changeset, ADR, CONTEXT.md). Run `pnpm ui docs:manifest:strict` + `pnpm ui lint:tokens` after A, `pnpm ui lint:a11y` after B, `pnpm ui build` after F and G.

### A. Shared indicator SFC + analyzer + c-checkbox refit

**A1. Analyzer: parts stamped by an imported `src/shared/*.vue` belong to the host's contract.** `scripts/analyzer/index.mjs` `analyzeComponent` (~:91 reads one SFC; ~:147 `analyzeTemplate(descriptor.template?.ast)`): after analysing the host template, find `import X from '../../shared/<Name>.vue'` statements in `source`, `parse()` each shared SFC, run `analyzeTemplate` on it and merge **only its static `parts`** into `template.parts` (not its slots, dynamics or exportparts — FormLabel has a `<slot/>` and both FormLabel/FieldMessage use a dynamic `:part`, so existing hosts are unaffected). Update the header comments of `scripts/analyzer/template.mjs` (:1-14) and `lint.mjs` (:1-33). Without this, moving `part="indicator"`/`part="mark"` into the shared SFC fails c-checkbox's `@csspart` ↔ template symmetry lint, which `pnpm build` runs in strict mode (`package.json:24`).

**A2. New `src/shared/SelectionIndicator.vue`** (non-element SFC, single root, no `<style>`; pattern `src/shared/FormLabel.vue`; Tailwind already scans `src/shared/**/*.vue`, `src/tailwind.css:12`; `lint:tokens` scans it too).
- Template: `<span :class="ui.root()" aria-hidden="true" part="indicator">` containing `<svg v-if="checked || indeterminate" :class="ui.mark()" part="mark" viewBox="0 0 100 100">` with the two paths from `CCheckbox.vue:52-62` (indeterminate bar `M20 56 h60 v-8 h-60 z`, check `M 12 52 l 24 24 l 47 -47 l -3 -3 l -44 44 l -21 -21 l -3 3`).
- Props (JSDoc each): `checked`, `indeterminate` (wins over checked), `disabled` (channel `text-border-strong`), `error` (channel `text-error` unless disabled; mark `text-on-error` even when disabled — mirrors `CCheckbox.vue:273-278`), `focusHalo` (renders the ADR-0039 `before:` halo; default `false` — rows must not render it: the 44px pseudo adds scrollable overflow in the `overflow-y-auto` list).
- tv: `root` = `block shrink-0 h-[18px] w-[18px] rounded-csc-sm border-2 border-current bg-transparent text-primary transition-[color,background-color,border-color] duration-200 ease-out` — **no position utility** (host passes `absolute top-3 left-3` via `class` in c-checkbox, `relative` in rows); `mark` = `absolute inset-0 h-[14px] w-[14px] text-on-primary` (the svg is now a child of the 18px box whose padding box is 14×14 — same spot as today's `top-[14px] left-[14px]` sibling); `path` = `fill-current stroke-current [stroke-width:13] [stroke-linecap:round] [stroke-linejoin:round] [stroke-miterlimit:10]` (replaces the `.c-checkbox__path` rules `CCheckbox.vue:526-537`); variants `checked.true → root 'bg-current'`, `indeterminate.true → root 'bg-current', path 'stroke-transparent'`, `disabled.true → root 'text-border-strong'`, `error.true → mark 'text-on-error'`, `focusHalo.true → root "before:content-[''] before:pointer-events-none before:absolute before:-inset-[15px] before:rounded-full before:border-2 before:border-current before:opacity-0"`, compound `{error:true, disabled:false} → root 'text-error'`.

**A3. `src/components/c-checkbox/CCheckbox.vue` refit (pixel-identical).** Import the SFC beside FormLabel (:130). Replace :39-63 with `<selection-indicator :checked="isChecked" :disabled :error="!valid" :indeterminate class="c-checkbox__box absolute top-3 left-3" focus-halo />` — keep the literal `c-checkbox__box` class so the sibling rules `:543-546` (fill) and `:556-558` (halo reveal) keep working (fill becomes redundant with `bg-current`; comment it). Delete tv slots `indicator` (:224-225) and `svg` (:258), `disabled.true.indicator` (:269-271), `error.true.svg` (:277), the `indicator: 'text-error'` entry of the error compound (:193); delete `.c-checkbox__path*` rules (:526-537); update the escape-hatch comment (:508-510). `@csspart indicator`/`mark` (:115-116) stay and resolve via A1. Verify c-checkbox in all states + `c-data-table`'s header/row checkboxes + `usage.md` recipes (`::part(indicator)`, `:state(checked)::part(mark)`).

### B. `src/components/c-tag/CTag.vue`

- New prop `closeLabel?: string` (`@freeform`, "Accessible name of the close button rendered when `closeable`"), default `'Remove'`; template :5 → `<c-icon-button v-if="closeable" :aria-label="closeLabel" size="x-small" text @click="onClose">` (non-prop attr falls through onto the icon-button's root button, same path CAutocomplete :56 relies on).
- `watchEffect` :184-192: `flat` → `tabindex=-1`, no role (as today); **`closeable` → remove `tabindex` and `role`** (the × is the control); otherwise `tabindex=0 role=button`. Update comment :179-181. `inheritAttrs:false` (:149) stays so `lint:a11y` passes.
- Polish: stamp `data-closeable` on the host in the same effect and add `:host([data-closeable]:focus-visible) { outline: none }` so the host ring does not double the ×'s own focus ring.
- Docs consequence: `csc-ui-documentation/app/examples/c-tag/closeable.vue` toggles `active` on host `@click` — after this change that is pointer-only; adjust the example text/behaviour (H).

### C. `src/components/c-dropdown/CDropdown.vue` (internal-only; API free to change)

- Props (:208-227): `multiple?: boolean` ("Multi-select mode: rows toggle, carry a decorative checkbox indicator, listbox is `aria-multiselectable`"), `selected?: (number|string)[]` ("Values of the selected items in `multiple` mode; drives `aria-selected` and the indicator"); defaults `false`, `() => []`. `selectedSet = computed(() => new Set(props.selected))`, `isSelectedValue(v)`. Reactive props → `aria-selected`/indicator re-render without `updateList()` bumps.
- `<ul>` :33-41: `:aria-multiselectable="multiple ? 'true' : undefined"`.
- Option-mode `<li>` :45-61: `:aria-selected="multiple ? isSelectedValue(opt.value) : !!opt.selected"`; move `v-html` off the `<li>` into a child `<span v-html="opt.outerHTML" />` (the CAutocomplete :182 pattern; the existing `li span` ellipsis rule :807-813 then applies), preceded by `<selection-indicator v-if="multiple" :checked="isSelectedValue(opt.value)" :disabled="!!opt.disabled" class="relative" />`. One visual check of single-mode rich `<c-option>` content; fallback = `v-if`/`v-else` pair of `<li>`s.
- Item-mode `<li>` :66-94: `:aria-selected="multiple ? isSelectedValue(item.value) : index === i"`; indicator before the span; trailing check `v-if="!multiple && index === i"`.
- Docblock (:106-114): `@csspart indicator`, `@csspart mark`. Import the SFC. `onSelect`/`selectItem`/`close`/`focusItem` unchanged. Selected rows also get the `aria-selected:*` tint (:168) — acceptable.

### D. `src/components/c-select/CSelect.vue`

- **Types**: add a plain `<script lang="ts">` block (precedent CAutocomplete :200-310); move the `CFieldSize`/`CSelectItem` type import there; export `CSelectValue = (number|string)[] | CSelectItem | CSelectItem[] | null | number | string` (JSDoc: scalar / item with `return-object` / `null`; array in selection order in `multiple`, `[]` when empty) and export `CSelectProps`. Prop `multiple?: boolean` ("Allow selecting several options: rows toggle and the list stays open, `value` becomes an array … in selection order; `option-as-selection` is ignored"), default `false`; `value?: CSelectValue` (:279-280); event map :136-153 `changeValue`/`update:value` → `CSelectValue`.
- **Derived state** (after :325): `multipleOn` (resolve from `host.hasAttribute('multiple')` first, then `coerceBoolean(props.multiple)` — the Boolean-attribute reset quirk :308-320), `valueOf(v)` (object → `.value`), `selectedValues` (array of scalar values, `[]` outside multiple), `hasSelection` (`multiple ? length>0 : !!value`), `firstSelectedIndex()`. `value` ref (:346) and `emitValue` (:421) typed `CSelectValue`.
- **Template**: :20 `:filled="hasSelection"`; :65 `v-else-if="hasSelection && clearable"` (`[]` is truthy); c-dropdown gets `:multiple="multipleOn" :selected="selectedValues"`; :11 `exportparts="menu, list, item, indicator, mark"` and `STATIC_EXPORTED_PARTS` (:752) match; docblock adds `@csspart indicator`/`mark`. `displayValue` (:395): `if (multipleOn.value) return ''` (G replaces it with the joined labels / summary — see G).
- **Toggle** (new, near :459): `toggleValue({name, value})` — find by `valueOf(item) === v`; present → filter out; absent → append `returnObject ? {name, value} : value`; `emitValue(next)`; `syncMultiple()`. `syncMultiple()` stamps `item.selected` on option elements from `selectedValues` and calls `dropdownRef.updateList()`.
- **Bypass the watcher-driven close**: top of `onValueChanged` (:501): `if (multipleOn.value) { syncMultiple(); return; }` (never closes, never moves focus, ignores `optionAsSelection`). Top of `onSelectOption` (:517): `if (multipleOn.value) { currentIndex.value = <index of detail>; toggleValue(detail); return; }`. Everything below stays byte-identical for single mode. Focus stays on the `<li>` (real DOM focus); the index watcher re-focuses the same row and refreshes the status text.
- **Other sites**: `onReset` :570 / `reset` :737 → `emitValue(multipleOn ? [] : null)`; mount seeding :829-843 → `multipleOn ? syncMultiple() : existing`; `refreshOptions` :792-802 → multiple: `picked = options.filter(o => coerceBoolean(o.selected))`, emit the array (DOM order) only when `!selectedValues.length` (mirrors CAutocomplete :1076 and stops the MutationObserver re-seeding after the user unticks all).
- **Keyboard** `handleKeyDown` (:619-727), multiple-only branches: Space (:709) → after `preventDefault`, if open and `currentIndex !== null` → `dropdownRef.selectItem(currentIndex)` (clicks the row → toggle); Enter (:713) → if closed, `open()` and return (today Enter on a closed select re-clicks the row — would silently untick); Escape (:653) → `if (!hasSelection) currentIndex = null`; ArrowDown/Up when closed (:670-671, :696-697) → `currentIndex = firstSelectedIndex()` in multiple. Backspace → G. Escape/Tab/outside click still close.

### E. `src/components/c-autocomplete/CAutocomplete.vue`

- **Types** (plain block :200-310): export `CAutocompleteValue` (same shape as `CSelectValue` over `CAutocompleteItem`); prop `multiple?: boolean` ("… panel stays open and keeps the query …"), default `false`; `value?: CAutocompleteValue` (:307-308); event map :351-383 `changeValue`/`update:value` → `CAutocompleteValue`. Remove `noResultsText` (:290, :466) and its use (:163) — replaced by `texts.noResults` (G).
- **Derived state** (after `externalOn` :639): `multipleOn` (host-attribute-first like c-select), `valueOf`, `selectedValues`, `hasSelection`, `committedLabels = ref(new Map<number|string, string>())` (per-value label cache for multiple; the single-slot `committedLabel` :667-669 stays for single mode). `isSelected` (:661) → `multipleOn ? selectedValues.includes(opt.value) : existing`. `displayLabel` (:671) → `if (multipleOn.value) return ''` (G). Template :17 `:filled="hasSelection"`, :53 `v-else-if="hasSelection && clearable"`.
- **`toggle(opt)`** (new; `commit` :695-712 stays verbatim for single mode): compute next array as in D; maintain `committedLabels` (set on tick, delete on untick); `value.value = next; emitModelValue(host, next); emit('change', …)`; mirror `.selected` onto option elements from the set. `onSelect` (:714-718): `if (multipleOn) { toggle(opt); searchRef.value?.focus(); updateStatusText(); return; }` else existing `commit + closePanel(true)`. Rows (:166-181): add `@mousedown.prevent` so a pointer toggle does not move DOM focus from the search input onto the `tabindex=-1` row (CONTEXT.md "Search input"). Enter (:945-953) already routes through `onSelect`; Escape/Tab/outside pointerdown still close; `onToggle` (:777-807) resets the query only on open (unchanged → query kept after toggles).
- `onReset` (:720-735): `value.value = multipleOn ? [] : null; committedLabels.clear(); emitModelValue(host, value.value)`. `refreshOptions` seeding (:1072-1083): multiple → `picked = options.filter(o => coerceBoolean(o.selected))`, set `value.value` (no emit — this component's convention) only when currently empty. `seedActiveIndex` (:809-819) already lands on the first selected row.
- **Rows / a11y / parts**: `<ul>` :135-142 `:aria-multiselectable="multipleOn ? 'true' : undefined"`; `<li>` :166-194 gets `part="item"` (new; resolves the asymmetry with c-select), `<selection-indicator v-if="multipleOn" :checked="isSelected(opt)" :disabled="opt.disabled" class="relative" />` before the label span, trailing check `v-if="!multipleOn && isSelected(opt)"`. Docblock (:318-322) adds `@csspart item`, `@csspart indicator`, `@csspart mark`.

### F. `src/index.ts`

Add `CSelectValue`, `CSelectProps`, `CSelectTexts`, `CAutocompleteValue`, `CAutocompleteTexts` to the type re-exports (near :81-85 and the c-select line). Registration order already correct (`c-tag` :257 before `c-select` :305 / `c-autocomplete` :308). React wrapper regenerates from the manifest — no hand edits.

### G. Field tag row, fold, Backspace, `texts` (both components)

Shared names used below (define in D/E): `multipleOn`, `selectedValues`, `hasSelection`, `selectedOptions: { label, value }[]` (selection order, labels via `labelFor`), `toggleValue(...)`, `removeValue(v)` (= toggle of a present value), `t` (merged texts).

**G1. Labels for N values.**
- c-autocomplete: `labelFor(v, raw?)` = `normalizedOptions` match → `committedLabels.get(v)` → `raw.name` (return-object) → `String(v)` (the ADR-0029 chain per value; `displayLabel` :671-691 becomes `sel == null ? '' : labelFor(sel, value.value)` in single mode). `committedLabels` is `ref(new Map())` (deeply reactive): set on tick, delete on untick, clear on reset.
- c-select: `labelFor(v)` = `dropdownItems.find(i => i.value === v)?.name ?? String(v)` (options are always present; the raw value shows only during the pre-`refreshOptions` frame).

**G2. `texts` prop.** Types in the plain `<script lang="ts">` block of each SFC (component-owned, declared independently — no `extends`):
```ts
/** UI texts of `c-select`, shallow-merged over the English defaults. Static labels are strings; count- or label-interpolated ones are functions. */
export interface CSelectTexts {
  /** Accessible label of the clear button. */ clearSelection?: string;
  /** Text of the overflow tag when `max-tags` folds the selection; receives the number of hidden tags. */ more?: (count: number) => string;
  /** Accessible label of a tag's remove button; receives the option label. */ remove?: (label: string) => string;
  /** Field text when `max-tags="0"` shows no tags; receives the selection count. */ selected?: (count: number) => string;
  /** Accessible label of the chevron button that opens and closes the list. */ toggleOptions?: string;
}
```
`CAutocompleteTexts` = the same five + `filterOptions` (search input `aria-label`), `loading` (loading row), `noResults`, `searchPlaceholder`. Prop `texts?: CSelectTexts` ("UI text overrides (i18n), merged over the English defaults. Objects have no attribute form — bind as a DOM property (`:texts.prop` in Vue)"), default `() => ({})` (CDataTable :546 precedent). `DEFAULT_TEXTS: Required<…>` = `clearSelection 'Clear selection'`, `more n => \`+${n} more\``, `remove l => \`Remove ${l}\``, `selected n => \`${n} selected\``, `toggleOptions 'Toggle options'`; autocomplete adds `filterOptions 'Filter options'`, `loading 'Loading'`, `noResults 'No matching data'`, `searchPlaceholder 'Search...'`. Merge: `t = computed(() => ({ ...DEFAULT_TEXTS, ...props.texts }))`; in autocomplete the existing `placeholder` prop (search-input placeholder, :291-296) still wins when non-empty: `:placeholder="placeholder || t.searchPlaceholder"`. **`noResultsText` is deleted** (decision 14): prop :290, default :466, use :163 → `{{ t.noResults }}`; the loading row's literal "Loading" (:151) → `{{ t.loading }}`.
Use sites: CSelect :68 `:aria-label="t.clearSelection"` (was `""`), chevron :77-87 `:aria-label="t.toggleOptions"` (missing today); CAutocomplete :56, :69, :124, :127, :151, :163.

**G3. Field markup** (c-select :35-94; c-autocomplete :32-83 identically): keep the readonly `<input role="combobox">` **first** in `.c-input__content`; bind `:value="inputValue"`; add after it (inside `.c-input-menu__input` for c-select, beside the selection overlay):
```html
<div v-if="tagsShown" :class="ui.tags()" part="tags" @click="onTagsClick" @keydown="onTagsKeyDown">
  <c-tag v-for="opt in visibleTags" :key="String(opt.value)" :close-label="t.remove(opt.label)" :size
         class="max-w-full" closeable exportparts="root:tag-root" part="tag" @close="removeValue(opt.value)">
    <span :class="ui.tagLabel()" aria-hidden="true">{{ opt.label }}</span>
  </c-tag>
  <c-tag v-if="hiddenCount" :size aria-hidden="true" flat part="tag">{{ t.more(hiddenCount) }}</c-tag>
</div>
```
Derived: `maxTagsResolved` (`maxTags == null || < 0 → Infinity`, else `Math.floor(Number(maxTags))`), `tagsShown = multipleOn && selectedOptions.length && maxTagsResolved > 0`, `visibleTags = selectedOptions.slice(0, maxTagsResolved)`, `hiddenCount`, `inputValue` = single-mode `displayValue`/`displayLabel`; multiple: `''` when empty, joined labels when `tagsShown`, else `t.selected(n)`. Prop `maxTags?: number` ("Show at most this many selected-value tags and fold the rest into one "+N more" tag; `0` shows no tags and reads "N selected"; unset shows every tag"), default `undefined`.
tv: `tags: 'flex flex-wrap items-center gap-1 py-2 flex-1 min-w-0'` (default tag `min-h-7` + `py-2` = 44px = `min-h-11`; small `min-h-5` + 16 = 36px = `min-h-9`; `gap-1` mirrors c-tags), `tagLabel: 'truncate min-w-0'`, variant `inputHidden.true → input: 'absolute w-px h-px p-0 m-0 overflow-hidden whitespace-nowrap border-0 [clip:rect(0_0_0_0)]'` fed with `tagsShown` — **clip, never `display:none`** (a `display:none` input cannot take focus: breaks c-input `focusInput()` :495-520, c-dropdown's post-open focus :465-467, every `inputRef.focus()` and removes the combobox from the a11y tree). Tag `:size` passes straight through (`CFieldSize` ≡ `CTagSize`; c-tag's `:host([size='small'])` rules keep matching via attribute reflection). The content row itself stays `flex items-center w-full` so the clear/chevron stay centred; wrapping happens only inside the tags div (c-input's `.c-input__field` has no wrap, CInput :185).
Parts: `tags`, `tag` (the c-tag host, incl. the overflow tag), `tag-root` (via `exportparts="root:tag-root"`, precedent `c-side-navigation-title` `<c-divider exportparts="root:divider-root">`). All three are nodes of the component's own shadow tree (only *slotted* through c-input/c-dropdown), so `c-select::part(tags)` matches without touching the c-dropdown `exportparts`. Docblocks: `@csspart tags - The row of selected-value tags inside the field (multiple mode)`, `@csspart tag - One selected-value tag: the c-tag host, including the overflow tag`, `@csspart tag-root - The pill box inside each tag (the c-tag root part), for colours and borders`.

**G4. Accessible value model.** The readonly combobox keeps `aria-expanded`/`aria-owns|controls`/focus; its `value` is the comma-joined labels of the whole selection while tags show (`t.selected(n)` with `max-tags="0"`), visually hidden by clip. Each tag's visible label is `aria-hidden`; the only thing a tag exposes is its × named `t.remove(label)`; the overflow tag is `aria-hidden` (no focusable content: `flat`). The tags container has no role. Tab order: combobox → each × → clear/chevron. Incidental fix while here: the combobox input has no accessible name (c-input's `<label for>` cannot cross the shadow boundary) — add `:aria-label="label || undefined"` on the readonly input in both components (pattern `CSlider.vue` :26).

**G5. Click / key plumbing.** `onTagsClick(e)`: `if (e.composedPath().some(n => n.tagName === 'C-ICON-BUTTON')) e.stopPropagation()` — × clicks must not reach `c-input @click` (`onInputClick` :578 / `onFieldClick` :823) and open the list; clicks on a tag body keep bubbling (open the list like any field click). c-select only — `onTagsKeyDown(e)`: for `Enter` / `' '` call `e.stopPropagation()` only (the host-level `handleKeyDown` :619 would `preventDefault` Space and Enter and `selectItem` the highlighted row, killing keyboard activation of the ×; Escape/Tab/arrows keep bubbling). `removeValue` ends with `requestAnimationFrame(() => inputRef.value?.focus())` (c-select; mirrors `onReset` :574) / `(isOpen ? searchRef : fieldRef).value?.focus()` (autocomplete) so focus never dies with the removed button.

**G6. Backspace** (decision 13): c-select `handleKeyDown` (:619), first branch: `if (event.key === 'Backspace') { if (multipleOn && event.target === inputRef.value && selectedOptions.length) { preventDefault(); removeValue(selectedOptions.at(-1).value) } return; }` — acts only when the readonly input itself is the target (while arrow-navigating, the retargeted `event.target` is the `c-dropdown` element, so the guard fails). c-autocomplete: same guard (`event.target === fieldRef.value`) as the first branch of `onFieldKeyDown` (:854); **no** Backspace handling in `onSearchKeyDown`.

**G7. Relocation / growth.** c-select's `<c-input>` (tags included) moves into the dialog as a unit (CDropdown :454-457); open-time positioning reads real heights (:413-415, :444, :449-451). Toggling while open grows the field inside the dialog; the list cap re-runs via `updateList()` → `version++` → `watch([itemsArray, isMobile])` (:697-705) → `applyListCap` (ceiling reads the new field height :681-683). Known cosmetic: the `dummyRef` placeholder keeps its open-time height (:448-452) → up to one tag-row page reflow on close. Autocomplete: the panel is anchor-positioned (`position-area: bottom span-right`), `panelWidth` is width-only, so a taller field needs no re-measure; verify the polyfill path in Firefox.

### H. Docs, examples, changeset, ADR, CONTEXT.md

**H1. Examples** — one `multiple` canon per component + the three required variants (+ optional `.typescript.ts`), shaped on `c-select/basic.*`, `c-button-group/multiple.*` (array `v-model`, `[value]` + `(changeValue)` in Angular, `value={…} onChangeValue` in React, `el.value = […]` in TS) and `c-data-table/selection.*`:
- `packages/csc-ui-documentation/app/examples/c-select/multiple.vue`: `<c-select v-model="countries" clearable hint="Pick as many as you like" label="Countries" max-tags="3" multiple>` with six `<c-option>`s (fi, se, no, dk, is, ee), `<p>Value: {{ countries.length ? countries.join(', ') : '[]' }}</p>`, `const countries = ref<string[]>(['fi', 'se'])`, explicit `import { ref } from 'vue'` (parity script rejects auto-imports). Variants: `multiple.react.tsx` (`// @ts-nocheck`, `useState<string[]>`, `maxTags={3}`, `onChangeValue={(e) => setCountries(e.detail as string[])}`), `multiple.angular.ts` (`signal<string[]>`, `[value]="countries()"`, `(changeValue)="countries.set($any($event).detail)"`, static `max-tags="3" multiple`), `multiple.typescript.html` (static markup, `<p>Value: fi, se</p>`), `multiple.typescript.ts` (`select.value = ['fi', 'se']` + `addEventListener('changeValue', …)`).
- `…/c-autocomplete/multiple.*`: same five files; `label="Programming languages"`, `hint="Type to filter, pick several"`, `placeholder="Start typing to search"`, six `<c-option value><c-option-value>…</c-option-value></c-option>` rows as in `basic.vue`, `languages = ref<string[]>(['ts'])`, `max-tags="3"`; React imports `CAutocomplete, COption, COptionValue`.
- `c-tag/closeable.vue` (and variants): the host `@click` toggle becomes pointer-only after B — reword/rework so the example listens to `close`.

**H2. usage.md** — `c-select/usage.md` (insert before `## Scrolling`; first paragraph untouched, ADR-0026) and `c-autocomplete/usage.md` (insert after `## External data`):
```md
## Multiple selection

Set `multiple` to let the user pick several options. The value is then an
array of the picked options' values in the order they were picked (an array
of `{ name, value }` items with `return-object`), and `[]` when nothing is
picked. Arrays have no attribute form — bind `value` as a DOM property
(`v-model` or `:value.prop` in Vue; the React wrapper and property
assignment do this naturally). Picking an option toggles it and keeps the
list open; `clearable` clears the whole selection. `option-as-selection`
has no effect in this mode.                      ← (c-select only)
[c-autocomplete only:] The search input keeps its query after a pick, so
several matches can be picked in a row.

Each picked option shows as a tag inside the field, and the field grows as
the tags wrap. A tag's close button removes that option; Backspace in the
closed field removes the last one. Set `max-tags` to show only that many
tags and fold the rest into a single "+N more" tag, or `max-tags="0"` to
show no tags at all — the field then reads "N selected". Assistive
technology always hears the full selection as the field's value.

The tags are stylable through the `tags`, `tag` and `tag-root` parts:

```css
c-select::part(tag-root) { background: var(--c-primary-subtle); }
```

## Texts

Every built-in string — the clear and toggle button labels, a tag's remove
label, the overflow and count texts [autocomplete: the search placeholder,
its accessible label, the loading and no-results rows] — can be replaced
for another language through the `texts` object, merged over the English
defaults. Count and label texts are functions, so the object must be bound
as a DOM property:

```vue
<c-select :texts.prop="{ more: (n) => `+${n} lisää`, remove: (label) => `Poista ${label}` }" multiple />
```
```

**H3. Migration guide** — `packages/csc-ui-documentation/app/content/migration.ts` :479: "no-matching-items-message is now no-results-text" → "no-matching-items-message is now `texts.noResults` (bind `texts` as a property)".

**H4. Records** — write `.changeset/select-autocomplete-multiple.md`, `docs/adr/0044-multiple-selection-widens-value-decorative-row-indicator.md` and the CONTEXT.md additions exactly as drafted under "Glossary & ADR updates" below; also amend the **Dropdown**, **Autocomplete** and **Button group** entries as noted there. Copy this plan to `_plan/select-autocomplete-multiple.md` first (memory: plans live in `_plan/`).

**H5. Manifest / React / IDE** — no generator edits: `packages/csc-ui-react/scripts/generate.mjs` derives props from the element interfaces and events from the event maps; `multiple`, `maxTags`, `texts`, `closeLabel` collide with no `HTMLElement` member. Expected manifest deltas: `value` leaves `attributes` on both components (type contains `[]`), `multiple` → attr `multiple`, `maxTags` → attr `max-tags`, `texts` field-only, `closeLabel` → attr `close-label`, new `cssParts`. `src/tag-name-map.ts` regenerates in `pnpm ui build` — commit it (strict mode fails on a stale map).

### Risks / gotchas (carry into implementation)

- A1 is a build gate, not optional. Boolean-attribute reset quirk (`CSelect.vue:308-320`): resolve `multiple` from the host attribute first in both components. `emitModelValue` writes `host.value` on every toggle (fresh array → the `props.value` watcher always fires and must only sync, never emit). Consumers mutating a bound array in place will not trigger the non-deep watcher — document "assign a new array". Vue `v-model` writes `''` for `null`; helpers treat it as no selection. Grep every `value.value` / `!!value` truthiness site before finishing (CSelect :20, :65, :398, :501, :653, :670, :696, :829; CAutocomplete :17, :53). Duplicate option values are indistinguishable (by-value identity, same as today). Never render `focusHalo` in rows.

## Glossary & ADR updates (apply on implementation)

### CONTEXT.md — new terms (under "### Form fields", after **Mandatory**)

```md
**Multiple** (mode):
The selection mode in which a value control holds *several* values at once — `c-button-group`, `c-select` and `c-autocomplete` with the `multiple` prop set. The `value` becomes an array (`[]` when empty), bound as a DOM property since arrays have no attribute form, and the same value events carry the whole array. The two fields keep it in selection order and show each pick as a **tag**; `c-button-group` keeps DOM order (ADR-0044). Picking a selected option unselects it and the panel stays open. Says nothing about how many are demanded (**required**) or whether it may empty out (**mandatory**).
_Avoid_: multi, multiselect / multi-select (as a prop or mode name — fine as an adjective in prose), checkbox mode (the row indicator is decorative, never a `c-checkbox`), selection mode (that is `c-data-table`'s separate `selection` prop, which keeps its value in `selected`)

**Tag** (`c-tag`):
The pill-shaped chip component naming one item in a set — authored by the consumer inside `c-tags`, or rendered by `c-select` / `c-autocomplete` inside their field for each selected option in **multiple** mode. A **closeable** tag carries a × that removes it and is the tag's only interactive control. Not to be confused with an element's *tag name* (see Flagged ambiguities).
_Avoid_: Chip (Material vocabulary), token, pill (its shape, not its name), badge (that is `c-badge` / the tag's own `badge` prop)

**Overflow tag**:
The single non-interactive tag ending a folded tag row in a **multiple** field — "+3 more" — standing in for the selections that `max-tags` hides. Rendered only when the cap is exceeded; with `max-tags="0"` no tags render at all and the field shows the summary text ("5 selected") instead.
_Avoid_: More tag, counter, badge, "+N chip"
```

### CONTEXT.md — Flagged ambiguities (append)

```md
- **"Tag"** is overloaded: (a) a component's *tag name* (`<c-button>` — the canonical identifier, see **Component**), (b) the **Tag** component `c-tag`, including the tags a **multiple** field renders for its selections (the `tag` part), (c) a docblock tag (`@csspart`). Say **"tag name"** for (a), plain **"tag"** only for (b) — the `max-tags` prop counts these — and **"docblock tag"** for (c).
```

Also touch: **Dropdown** and **Autocomplete** entries — add one clause each: "…holds a current value — or, in **multiple** mode, an array of them — …". **Button group** entry: replace "cumulative with `multiple`" with "cumulative in **multiple** mode".

### ADR-0044 — `docs/adr/0044-multiple-selection-widens-value-decorative-row-indicator.md`

```md
---
status: accepted
---

# Multiple selection widens `value` and renders a decorative row indicator

`c-select` and `c-autocomplete` gain a `multiple` mode. In it the existing
`value` prop holds an array and the existing value events (`changeValue` +
twin, `update:value`, `input`) carry that array; each option row shows a
decorative checkbox indicator and toggles without closing the panel; the
selections render as `c-tag`s inside the field, folded by `max-tags`.

## Context

The value-selection fields held exactly one value. The library already had
two ways of modelling a plural selection: `c-button-group` / `c-accordion`
widen `value` to an array behind a boolean `multiple`, while `c-data-table`
keeps the selection in a separate `selected` prop with a `change:selected`
event. A multiselect listbox also needs a per-row selected affordance, and
the obvious building block — a `c-checkbox` inside each `role="option"` row
— is a nested interactive control: its native input stays focusable, it
emits its own value events, and a click would toggle twice.

## Decisions

- **The selection lives in `value`** (the button-group model), not in a
  separate prop: a field has one value and `v-model` must keep working.
  Consequence: `value`'s type now contains an array, so the manifest no
  longer lists a `value` *attribute* for either component (arrays have no
  attribute form); consumers bind the property (`v-model`, `:value.prop`,
  `el.value = …`). The scalar single-mode contract is unchanged.
- **The array is in selection order** — ticking appends, unticking removes.
  `c-button-group` re-sorts to DOM order because every button is always
  present; with `external` autocomplete data an earlier selection may no
  longer be in the option list, so option order is undefined there.
- **The row checkbox is decorative.** The option row stays the only
  interactive target (WAI-ARIA multiselect listbox: `aria-multiselectable`
  on the listbox, `aria-selected` on rows); the indicator is `aria-hidden`
  and unfocusable. It is drawn by one shared internal SFC
  (`src/shared/SelectionIndicator.vue`) extracted from `c-checkbox`, so it
  stays pixel-identical and stamps the same `indicator` / `mark` parts into
  each host's `::part()` contract (ADR-0035 recipe carries over:
  `c-select::part(indicator) { color }`).
- **Toggling never closes the panel**; Escape, Tab and light dismiss do.
  In `c-autocomplete` the query is kept after a toggle (it still resets on
  open, ADR-0029) so several matches can be ticked in a row.
- **Tags in the field are `c-tag` elements**, closeable, with the × as the
  only tab stop; a `closeable` `c-tag`'s host therefore stops acting as a
  `role="button"` tab stop everywhere (it was a nested-button violation).

## Considered alternatives

- A separate `selected` array prop + `change:selected` (the data-table
  model). Rejected: two competing value channels on one field and no
  `v-model` in multiple mode.
- A real `<c-checkbox>` per row, made inert. Rejected: 42px ripple surface,
  message strip and a shadow root per row; unreachable via `::part()`
  through two boundaries; still a foreign element inside `role="option"`.
- Re-authoring the checkbox glyph per component. Rejected: three copies of
  a visual ADR-0035/0039 already tuned once.

## Consequences

- Any new plural-selection field follows this shape: boolean `multiple`,
  array in `value`, selection order.
- `c-tag` is now rendered inside another component's shadow root for the
  first time; its `closeLabel` prop exists so the host can name the ×.
- User-visible strings the fold introduces go through a `texts` object prop
  (the `c-data-table` pattern), which also localises the field chrome that
  was hardcoded before.
```

### Changeset — `.changeset/select-autocomplete-multiple.md`

```md
---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

c-select and c-autocomplete gain a `multiple` mode (ADR-0044). With the
`multiple` attribute set, `value` holds an array of the picked values (or
items with `return-object`), in the order they were picked, and the value
events carry that array — `v-model` keeps working. Every option row shows a
checkbox indicator and toggles without closing the list; the selections
render as removable tags inside the field. `max-tags` folds the row: `N`
shows the first N tags and one "+X more" tag, `0` shows only "X selected".
A new `texts` prop localises those strings and the field's control labels
(clear, toggle, search) that were hardcoded before. `c-select::part(indicator)`
/ `::part(mark)` recolour the row checkboxes the same way they do on
c-checkbox; the new `tags` and `tag` parts reach the tag row.

c-tag gains a `closeLabel` prop naming its × button for assistive tech.

BREAKING: because `value` can now be an array, the manifest no longer lists a
`value` attribute on c-select and c-autocomplete — bind it as a property
(`v-model`, `:value.prop`, `element.value = …`); the single-value contract
is otherwise unchanged. c-autocomplete's `no-results-text` prop is removed:
set `texts.noResults` instead. A `closeable` c-tag's host is no longer a
`role="button"` tab stop — its × button is the interactive control — so
`click` listeners on a closeable tag's host fire only for pointer clicks.
```

### Verification (whole feature)

1. `pnpm ui build` — tokens → tag map → vite → `build:types` → **strict manifest** (analyzer: every new `part` has `@csspart` incl. the shared-SFC parts via A1, JSDoc on every new prop, no raw `CustomEvent`, `emitModelValue` event-map triple intact, all exported plain-block types re-exported from `src/index.ts`, tag map not stale — commit the regenerated `src/tag-name-map.ts`). Inspect `dist/custom-elements.json`: `multiple`, `max-tags`, `texts` on both; `value` attribute absent (expected); `indicator`, `mark`, `tags`, `tag`, `tag-root`, `item` parts listed; `close-label` on c-tag; `noResultsText` gone.
2. `pnpm ui lint:tokens`, `pnpm ui lint:a11y`, `pnpm ui lint:chart` (untouched but CI runs it), `pnpm ui type-check` (`vue-tsc --build --force` — not while the docs dev server runs: OOM, memory `project_pnpm_tty_and_memory`).
3. `pnpm --filter @cscfi/csc-ui-react build` — wrappers regenerate; no hand edits.
4. `pnpm --filter @cscfi/csc-ui-documentation lint:examples` (`scripts/check-example-parity.mjs`) — new `multiple.*` canons complete with explicit imports; then `pnpm build` at the root.
5. `pnpm dev` → http://localhost:3500, both component pages, light + dark, `size="small"`:
   - Toggle by click / Enter / Space (select) and click / Enter (autocomplete); panel stays open; tags appear in pick order; untick removes the tag.
   - `max-tags="2"`: third pick yields "+1 more"; `max-tags="0"`: "3 selected" in the input; unset: row wraps and the field grows, label stays lifted, dropdown re-positions (select) / panel re-anchors (autocomplete).
   - × removes one (Enter/Space on a focused × works in c-select despite the host keydown handler; focus returns to the field); Backspace on the focused readonly input removes the last, and does nothing in the search input; `clearable` clears to `[]`; `reset()` clears.
   - Autocomplete: query survives a toggle, resets on reopen; mouse toggles keep DOM focus in the search input; `external` example with a preset array value shows raw values then labels once items land, and keeps labels after a fetch that omits them.
   - Growth while open: c-select opened below and above (dialog grows down / up, list cap re-runs, viewport-capped case; note the one-row page reflow on close from the fixed placeholder); autocomplete panel follows the anchor, also in Firefox (anchor polyfill path).
   - Tab order: combobox → each × ("Remove <label>") → clear/chevron; no tab stop on tag hosts; `c-tag` closeable example still works via `close`.
   - `texts` bound with `:texts.prop` replaces every string (Finnish sample from usage.md); `placeholder` still wins over `texts.searchPlaceholder`.
   - Screen-reader attributes in DevTools: `aria-multiselectable="true"`, `aria-selected` per row, indicator `aria-hidden`, readonly combobox value = joined labels (or the summary) and named by `aria-label`, tag label text absent from the a11y tree, overflow tag hidden.
   - Single mode regression: unchanged behaviour on the `basic` / `small` / `external` / `custom-filter` examples; c-checkbox visually identical (indicator + mark + focus ring, checked/indeterminate/disabled/error) — compare with the headless-chromium screenshot recipe (memory: `project_csc_ui_next_visual_verify`).
6. New SFC hazard: after adding `SelectionIndicator.vue`, grep `dist/*.css` for its utilities; rebuild once if missing (memory: first build after adding an SFC can omit its utilities).

### Plan file location

Per the user's standing preference, copy this plan to `_plan/select-autocomplete-multiple.md` as the first implementation step (plan mode only allows writing the harness plan file now).

## Outcome (2026-09-08)

Implemented as planned (steps A–H); verified with `pnpm ui build` (strict manifest 0 errors, vue-tsc clean), `lint:tokens`, `lint:a11y`, the React wrapper build, the docs build (`lint:examples` + nuxt), and a 44-check headless functional pass (raw CDP driver; playwright-core is no longer in the pnpm store) covering toggle/keyboard/tags/fold/Backspace/a11y attributes in both components, single-mode regression, c-checkbox visuals and c-tag. Deviations and findings during execution:

- **Analyzer**: `scripts/analyzer/index.mjs` now merges the static parts of imported `src/shared/*.vue` SFCs into the host's contract (A1) — required for `SelectionIndicator.vue`.
- **Tag map**: private `<script setup>` type aliases are package-global in the tag-map generator — `RawValue` clashed between the two SFCs; renamed `SelectRawValue` / `AutocompleteRawValue` (memory: `reference_tag_map_local_type_names`).
- **c-dropdown escape hatch**: the unlayered `li span { width: 100% }` rule beat the indicator's `w-[18px]` (cascade layers); scoped it to a `.c-dropdown__label` class on the label wrapper.
- **Pre-existing Boolean-attribute bugs surfaced**: `<c-option disabled>` / `<c-option selected>` deliver `""`, so `!!` tests failed — c-dropdown now uses `coerceBoolean` for `disabled` (a disabled row could be picked by click before), and both components coerce `selected` when seeding.
- **Keyboard**: Space/Enter in multiple mode toggle the row holding DOM focus (falls back to the tracked index), which is more robust than index-only.
- **Docs**: `c-tag/closeable.*` examples now rely on `close` only (the host is no longer a keyboard-activatable button); migration guide points `no-matching-items-message` at `texts.noResults`.
- Manifest: `value` is property-only on both components (expected); `multiple`, `max-tags`, `close-label` are attributes; new parts `indicator`, `mark`, `tags`, `tag`, `tag-root` (+ `item` on c-autocomplete).
- Not done: no automated test harness added (none exists in the repo); the CDP script lives in the session scratchpad only.
