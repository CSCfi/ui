# Restore `c-option-value` as the option's label region

> **Status: implemented 2026-09-08** (ADR-0045) — see Outcome at the end.

## Context

`c-option-value` is a 3.x (Stencil) subcomponent: a wrapper the consumer puts
inside `<c-option>` to mark the label text. In 3.x `c-dropdown`'s autocomplete
mode did `option.querySelector('c-option-value')` and rewrote its `innerHTML`
with the typed query wrapped in `<mark>`; `items`-mode names got the same
treatment (`git show 84882b8b^:packages/csc-ui/src/components/c-dropdown/c-dropdown.tsx`,
`_highlightMatchingText` ~:298 and ~:440, ~:505).

In 4.x the consumer of that element was deleted without the element:

- ADR-0009 rebuilt `c-autocomplete` on the Popover API and left `c-dropdown`'s
  autocomplete-only query marking behind.
- Commit `11351000` (ADR-0029, external mode) deleted the "dead 3.x query
  machinery" from `CDropdown.vue`, including the marking function.

Today `c-option-value` is inert public API: a bare `<slot />` with
`:host{display:block}`, still exported, in the tag map, the React wrapper, the
manifest (`@subcomponents c-option, c-option-value` on `c-autocomplete`) and a
docs example whose hint promises "match highlighting" that never happens. The
option label used for the tag, the closed field and the `filter` predicate is
`name ?? textContent` of the **whole** `c-option`
(`CAutocomplete.vue:781`, `:1400`; `CSelect.vue:584`), so content outside
`c-option-value` still reaches the tag — the observation that prompted this.
The docblock, comments and CSS comments in `COptionValue.vue`,
`CAutocomplete.vue` and `CDropdown.vue` still claim `c-dropdown` targets it.

### Decisions taken (user, 2026-09-08)

- **Restore the role** rather than remove the element.
- **Both fields** honour `c-option-value` for the option label; match marking
  is autocomplete-only (only it has a query).

### Vocabulary

CONTEXT.md:41 already uses *highlighting* for the virtual active row
(`aria-activedescendant`). This feature is therefore **match marking**: the
`<mark part="match">` around query occurrences in an option label. Use
"marking"/"marked"/`match` in code comments, docblocks, usage.md, ADR and
changeset; never "highlight". The part is `match`, not `mark`: `::part(mark)` is
the check glyph of the row indicator (`src/shared/SelectionIndicator.vue:6`,
ADR-0044).

## Design

### 1. Shared helpers (`packages/csc-ui/src/shared/`, plain `.ts`, style of `coerceBoolean.ts`)

**`optionLabel.ts`**

```ts
export const optionValueElement = (option: Element) =>
  option.querySelector('c-option-value');

export const optionLabel = (option: HTMLElement): string => {
  const name =
    (option as { name?: string } & HTMLElement).name ?? option.getAttribute('name');

  if (name) return name.trim();

  const wrapper = optionValueElement(option)?.textContent?.trim();

  return wrapper || (option.textContent ?? '').trim();
};
```

Chain: `name` (property, else attribute — `refreshOptions` runs in `onMounted`
when a `<c-option>` may not be upgraded yet, as the `value` read at
`CAutocomplete.vue:782` already assumes) → first `c-option-value` text → the
option's own text; trimmed. Callers keep their `|| String(value)` fallback.
Deliberate change: `name=""` now counts as absent (today `o.name ?? …` keeps
`''`). `optionValueElement` is exported so "the first wrapper in the option" is
defined once for label and marking.

**`splitMatches.ts`**

```ts
export interface MatchSegment { match: boolean; text: string }

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const splitMatches = (text: string, query: string): MatchSegment[] => {
  if (!query) return text ? [{ match: false, text }] : [];

  const re = new RegExp(`(${escapeRegExp(query)})`, 'i');

  return text
    .split(re)
    .map((part, i) => ({ match: i % 2 === 1, text: part }))
    .filter((s) => s.text);
};
```

Literal, regex-escaped query (3.x used `new RegExp(query, 'gi')` unescaped and
threw on `c++` / `(`), case-insensitive via the `i` flag on the original string
(no lowercased-`indexOf` index drift for `İ`-style case mapping). Every
occurrence is marked (3.x parity) even though the default filter is prefix-only;
adjacent occurrences give adjacent marks; overlaps resolve left-to-right; no
occurrence → one plain segment. Raw query, not trimmed (parity with the filter).

### 2. Label chain call sites

Replace the inline `name ?? textContent` copies with `optionLabel(el)`:

- `CAutocomplete.vue:781` (`normalizedOptions`; keep `html: el.outerHTML` as
  the query-independent baseline).
- `CAutocomplete.vue:1400` (`labelOf` in `refreshOptions`) → delete, use the
  helper at `:1412` and `:1425`.
- `CSelect.vue:584` (`labelFor`): `optionElementsExist.value ? optionLabel(item) : item.name`, keeping `text || String(v)`.
- `CSelect.vue:1196`, `:1213`, `:1255`: `return-object` payloads / current
  index seeded from `<c-option selected>` currently read raw `.name` (yields
  `undefined` for a name-less option) → `optionLabel(o)`.
- `CDropdown.vue:59` (`:data-name`, read back for the live status text at
  `:559`) and `:365` (`selectOption` emit `name`): for element items
  `item.name ?? optionLabel(item)`; `items`-array entries keep `item.name`.
- `CSelect.vue:281`: `@subcomponents c-option` → `c-option, c-option-value`.
  The docs fold a child under its first declaring parent (`useManifest.ts:90`),
  which stays `c-autocomplete`; no duplicate page or examples appear.
- Update the `CAutocompleteOption.label` doc comment (`CAutocomplete.vue:274`)
  to state the chain — it is the public shape the `filter` predicate receives.
- `commit`/`toggle`/`committedLabels`/`displayLabel`/`selectedOptions` all read
  `opt.label` from `NormalizedOption` and need no edits.
- Cheap follow-through: add `characterData: true` to both option observers
  (`CAutocomplete.vue:1437`, `CSelect.vue:1239`) so a `{{ text }}` change inside
  the wrapper re-derives the label (today only `childList` is observed).

### 3. Match marking in `CAutocomplete.vue`

Insert after `filteredOptions` (`:814`):

```ts
// Query-time copy of an option whose first <c-option-value> text is rebuilt as
// text + <mark part="match"> DOM nodes (no string escaping; the clone never
// connects). `null` without a wrapper: consumer markup renders verbatim.
const markedOptionHtml = (el: HTMLElement, q: string): null | string => {
  if (!optionValueElement(el)) return null;

  const clone = el.cloneNode(true) as HTMLElement;
  const wrapper = optionValueElement(clone) as Element;

  wrapper.replaceChildren(
    ...splitMatches(wrapper.textContent ?? '', q).map((seg) => {
      if (!seg.match) return document.createTextNode(seg.text);

      const mark = document.createElement('mark');
      mark.setAttribute('part', 'match');
      mark.textContent = seg.text;

      return mark;
    }),
  );

  return clone.outerHTML;
};

type RenderedOption = { segments?: MatchSegment[] } & NormalizedOption;

// Rows as drawn: `filteredOptions` positionally (row ids, activeIndex and the
// cap/status watchers stay keyed on that array) plus the match marking.
const renderedOptions = computed<RenderedOption[]>(() => {
  const q = query.value;

  return filteredOptions.value.map((o) =>
    o.el
      ? { ...o, html: (q && markedOptionHtml(o.el, q)) || o.html }
      : { ...o, segments: splitMatches(o.label, q) },
  );
});
```

A computed, not a template method: `@pointermove="activeIndex = i"` re-renders
the list on every mouse move and would clone every row per event. Marking
applies whenever the query is non-empty — default filter, custom `filter`,
`external` mode alike (in `external` mode `filteredOptions` keeps its reference
so the cap/status watchers at `:1331`/`:1343` correctly stay quiet, while
`renderedOptions` re-derives because it reads `query`). Re-parsing the
`v-html` string re-upgrades the nested `c-option`/`c-option-value` (c-option
re-sets `tabindex=-1`); that already happens today for rows that shift
position under the positional `opt-${i}` keys, and has no side effects.

Template: `:206` `v-for="(opt, i) in filteredOptions"` → `renderedOptions`;
`:230-232` becomes

```html
<span v-if="opt.html" :class="ui.itemLabel()" v-html="opt.html" />

<span v-else :class="ui.itemLabel()">
  <template v-for="(seg, j) in opt.segments" :key="j">
    <mark v-if="seg.match" part="match">{{ seg.text }}</mark>
    <template v-else>{{ seg.text }}</template>
  </template>
</span>
```

The static `part="match"` here is load-bearing for the analyzer
(`scripts/analyzer/template.mjs` collects only static `part=` attributes and
`lint.mjs:73-82` demands a 1:1 match with `@csspart` tags); the JS-built mark is
invisible to it. Leave a comment saying so. Slotted options **without** a
wrapper render `outerHTML` verbatim — consumer markup is never rewritten; that
is what gives the wrapper its meaning (opt-in to marking and to a label
narrower than the whole option).

Docblock (`:434`, after `@csspart mark`):
`@csspart match - A run of an option's label equal to the query, in the row; underlined in the primary colour, text inherits the row`.

Escape-hatch `<style>` (after `:1520`, plus a bullet in the comment block at
`:1469-1471`: the slotted-path `<mark>` is `v-html`-injected so no utility can
reach it; the UA `mark` yellow/black is unreadable in dark mode):

```css
[part='match'] {
  background: transparent;
  color: inherit;
  text-decoration: underline 2px var(--c-primary);
  text-decoration-skip-ink: none;
  text-underline-offset: 0.15em;
}
```

`text-decoration` rather than 3.x's `box-shadow`: the wrapper is
`overflow:hidden` and a shadow below the line box clips at `text-sm`;
decorations also survive forced-colors mode. `var(--c-primary)` is theme-mapped
in `tokens.css`, so the underline follows dark mode; `color: inherit` keeps the
row's on-surface / active primary / disabled greyscale.

`::part(match)` reach: the mark is a node of c-autocomplete's shadow tree
(slotting into `c-option-value`'s shadow changes the flat tree, not tree
membership), so both `c-autocomplete::part(match)` from the page and the
shadow stylesheet's `[part='match']` hit it — the existing `li c-option-value`
rule at `:1516` is the precedent.

### 4. `COptionValue.vue`

Keep `<slot />` and `:host{display:block}` — the `li c-option-value` ellipsis
rule needs a block box, and the block wrapper stacks any secondary content
(`<small>` after it) below the label, the same "title + description" layout
3.x had. Rewrite the `@slot` description (`:7`) and the comment blocks
(`:9-12`, `:20-27`): the option's label region — its text is the option label
in `c-select`/`c-autocomplete`, and `c-autocomplete` marks query matches inside
a query-time copy of it (nothing writes the consumer's element). Note that the
wrapper content is treated as plain text: nested markup inside it is flattened
while a query is typed and restored when it empties.

### 5. Stale comments / CSS

- `CAutocomplete.vue:1469-1471`, `:1510-1520`: keep the `li c-option-value`
  rule (load-bearing), reword the comment (label region, not "reset").
- `CDropdown.vue:182`, `:798`, `:855-866`: the `li c-option-value` rule still
  serves `c-select` rows; drop the `<mark>` mention (the dropdown marks nothing).

## Docs, vocabulary, decision record

- **`c-autocomplete/usage.md`**: new "Options" section before "Filtering": the
  label chain; `c-option-value` narrows the label to part of a richer option;
  matches are marked inside it (and in `items` labels) whatever the filter —
  a fuzzy `filter` or a `name` that differs from the wrapper text can leave
  rows unmarked; wrapper content is plain text; `::part(match)` CSS snippet.
  One sentence in "Filtering" that the query is matched against the label.
- **`c-select/usage.md`**: a short "Options" section before "Multiple
  selection" (same label chain; no marking).
- **`c-option-value/usage.md`** (new, one paragraph). The docs render a folded
  child's first paragraph as its blurb in the API reference and nothing more
  (`[tag].vue`, `ApiComponent.vue`), so keep it to the description. A missing
  usage.md is only an analyzer warning (`lint.mjs:178`), so this is optional
  but cheap.
- **Docs example `examples/c-option-value/basic.*`** (all five files: `.vue`,
  `.react.tsx`, `.angular.ts`, `.typescript.html`, `.typescript.ts`; parity is
  filename-level, `scripts/check-example-parity.mjs`): demonstrate the role —
  label in `c-option-value` plus secondary text outside it (e.g. `<small>`),
  hint "Only the c-option-value text is filtered, marked and used as the label".
  The `c-autocomplete/basic|small|multiple.*` examples keep their wrappers (they
  simply gain marking).
- **`CONTEXT.md`**: add **Option label** (the text naming one option: `name` →
  `c-option-value` text → text content; what the row shows, the filter matches,
  the tag / closed field displays; distinct from **Label**, the form-control
  label) and **Match marking** (avoid: highlight — that is the active row).
  Mention `c-option-value` in the Subcomponent entry's examples.
- **ADR-0045** `c-option-value-is-the-option-label-region.md` (format of
  ADR-0044): context (3.x purpose, how ADR-0009/0029 orphaned it); decisions
  (label chain in both fields; marking rule and where it applies; consumer
  markup without the wrapper is never rewritten; `match` because `mark` is
  taken; regex-escaped literal query; kept, not removed, because it is
  3.x-authored public API); consequences. Add a dated amendment note to
  ADR-0009's consequence bullet pointing here.
- **Migration guide** `csc-ui-documentation/app/content/migration.ts`: a line
  in the c-autocomplete bullet of the "Other components" md block (~`:471-490`;
  the bullet is already being edited in the working tree) — marking restored,
  `::part(match)`, `name` vs wrapper precedence.
- **Changeset**: new file (both packages `minor`, present-tense prose naming
  the component first, per `.changeset/select-autocomplete-multiple.md`),
  separate from the in-flight multiple-mode changeset.
- **Plan copy**: on execution, copy this plan to `_plan/c-option-value-label-region.md`
  (repo convention; `_plan/select-autocomplete-multiple.md` is the precedent).

## Verification

No test suite exists in `packages/csc-ui`; the gates are the build-time
checkers plus a manual pass.

- `packages/csc-ui`: `pnpm build` (tokens → tag map → vite → vue-tsc → strict
  manifest lint: `@csspart match` must be satisfied by the template stamp;
  `@subcomponents c-option-value` on c-select must resolve), `pnpm lint:tokens`
  (`var(--c-primary)` in `<style>` is the existing pattern at `:1506`),
  `pnpm lint:a11y`.
- `custom-elements.json`: `match` listed under `c-autocomplete` cssParts;
  `c-option-value` under both parents' `csc.subcomponents`.
- `packages/csc-ui-react`: `pnpm build` (wrapper regenerates; nothing new
  expected beyond the manifest).
- Docs: `pnpm lint:examples`; `pnpm dev` → c-autocomplete page →
  c-option-value example: type `ja` → the "JavaScript" row underlines "Ja" and
  the secondary text is unmarked; pick it → tag/closed field shows only
  "JavaScript". Type `(` and `c++` → no error, no marks. `items` example rows
  mark too. An option without a wrapper renders its markup untouched.
  `external` example marks the typed query. `multiple` tags use the narrowed
  label. c-select: an option with a wrapper and no `name` shows the wrapper
  text in its tag / closed field.
- Headless-chromium light/dark screenshots of the open panel (memory recipe)
  to confirm the `mark` override is legible in dark mode.

## Outcome (2026-09-08)

Implemented as planned. `src/shared/optionLabel.ts` and `src/shared/splitMatches.ts`
feed both fields; `c-autocomplete` renders `renderedOptions` (a computed over
`filteredOptions` + query) with `<mark part="match">`; `c-select`/`c-dropdown`
route every option-name read through the same chain. Verified with a CDP-driven
static demo (27 checks, light + dark): wrapper-only label in the closed field,
tags and `return-object`; marks inside the wrapper only, `items` and `external`
rows marked on every occurrence, options without the wrapper untouched, `name`
winning over wrapper text, `(`, `c++`, `[\` queries safe, `::part(match)`
reachable from the page, dark primary underline. Gates: `pnpm build` (0 analyzer
errors), `lint:tokens`, `lint:a11y`, React wrapper build, docs example parity.
