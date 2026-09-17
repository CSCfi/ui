# Mode scope — pin a theme mode to any subtree

## Context

Today a **theme mode** is a document-wide fact. `tokens.css` anchors every
semantic-token block to `:root`, so `data-theme` only means anything on
`<html>`; CONTEXT.md:293 states the invariant outright ("Controlled by the
consumer at the document root"), and the customization page tells consumers to
set it "on `<html>`".

Consumers need to pin a mode for part of a page — a permanently-dark hero, a
marketing panel, a single `<c-button data-theme="dark">` — regardless of the
user's global choice. Nothing in the library supports that, and no workaround
exists: `:host-context()` misses the OS-preference path, and Tailwind `dark:`
variants cannot cross a shadow boundary.

The mechanism that makes this cheap is already in place. Nothing inside a shadow
root ever *declares* a semantic token — it only reads one, and custom properties
inherit across the shadow boundary. So dropping `:root` from four selectors in
one generated file is the entire CSS-side change, and `<c-button data-theme="dark">`
then works with **zero component changes** (the host is `display:contents`, the
block applies to it, inheritance carries it inward).

Outcome: any element carrying `data-theme="light"|"dark"` becomes a **mode
scope** — it and everything inside resolve the semantic tokens in that mode.
Scopes nest; the nearest one wins.

## Decisions taken (grilling session, 2026-09-16)

1. **Mode only.** A mode scope pins light-vs-dark. Brand **families**/**seeds**
   stay global — `applyTheme` keeps writing to `documentElement`. Seeds compose
   for free: a scope re-declares roles as `var(--c-slate-800)` etc., and the
   palette tokens those point at still come from `:root`.
2. **Tokens only, no paint.** `data-theme` re-points `--c-*` and sets
   `color-scheme`; it never sets a background. A `<c-button data-theme="dark">`
   must stay transparent. Container authors opt in with `bg-surface text-on-surface`.
3. **Strict values.** Only `light` and `dark` select a mode. Anything else is
   ignored — a subtree inherits its ancestor, and at the root the OS decides.
   Behaviour change: `<html data-theme="corporate">` was light, now follows the OS;
   `<html data-theme="auto">` now means "follow the OS" for free.
4. **`color-scheme` ships in the same change.** Fixes scoped islands *and* the
   pre-existing root-level dark gap (light scrollbars, resize grabbers, autofill,
   date pickers under root dark today).
5. **`observeThemeMode()` is new public API.** The docs' current
   `MutationObserver(documentElement, {attributeFilter:['data-theme']})` recipe
   silently misses a scope flip on a non-root ancestor.
6. **Glossary term: "mode scope."** "Theme scope"/"theme island" are barred —
   CONTEXT.md:295 bans "theme" for this axis, and "island" implies paint we
   deliberately don't ship. The verb stays **pin** (already in customization.ts:199).

## Implementation

### 1. Token generator — the whole CSS change

`packages/csc-ui/utils/createSemanticTheme.cjs` (four selector strings + the
header docblock). `src/styles/css/tokens.css` is **generated and untracked**, so
there is no committed artifact to refresh; `pnpm test` runs
`style-dictionary:build` first.

```css
/* Mode-invariant roles (identical in light and dark). */
:root { --c-inverse-*, --c-scrim }                 /* unchanged */

/* Light is the default; any element may open a light mode scope. */
:root,
[data-theme='light']          { color-scheme: light; …light roles… }

/* Explicit dark, at the root or in any mode scope (wins over the OS preference). */
[data-theme='dark']           { color-scheme: dark;  …dark roles…  }

/* OS dark preference, only when the root pins no mode. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']):not([data-theme='dark'])
                              { color-scheme: dark;  …dark roles…  }
}
```

Cascade proof (put this in the file's comment — it is the non-obvious part):

- `:root` (0,1,0) vs `[data-theme='dark']` (0,1,0) → equal specificity, dark
  block is **later in source**, so `<html data-theme="dark">` resolves dark.
- The media selector is (0,3,0), beating the `:root` light block on `<html>`
  when the OS prefers dark and the root pins nothing; its `:not()`s make it
  unmatchable once the root pins a mode.
- **Nesting resolves by inheritance proximity, not specificity.** A scope
  declares every role *on itself*, and an element's own declaration always beats
  an inherited one — so the nearest enclosing scope wins at any depth. This is
  also why a cascade layer cannot change the outcome (see Consequences).

The palette block (`:root, :host`) and the invariant block are unchanged.

### 2. `themeMode()` walks up

`packages/csc-ui/src/theme/themeMode.ts` — must stay a faithful mirror of the
cascade above:

```ts
const scope = el?.closest("[data-theme='light'],[data-theme='dark']");
if (scope) return scope.getAttribute('data-theme') as ThemeMode;
// …then matchMedia, then 'light'
```

`themeMode()` with no argument is unchanged (`<html>` is its own scope). Update
the docblock, which currently documents the retired "any value other than `dark`
is light" rule.

### 3. `observeThemeMode()` — new export

Same file, beside `themeMode`. Signature and semantics:

```ts
export function observeThemeMode(
  target: Element,
  onChange: (mode: ThemeMode) => void,
): () => void
```

- Resolves through `themeMode(target)`.
- **Fires once synchronously on subscribe**, so `observeThemeMode(el, apply)` is
  the complete wiring, then only on an actual mode *change* (dedupe against the
  last value). ← a public-API semantic worth confirming at review time.
- One `MutationObserver` on `document`, `{ subtree: true, attributes: true,
  attributeFilter: ['data-theme'] }` — cheap, since every hit just re-resolves.
- One `matchMedia('(prefers-color-scheme: dark)')` `change` listener.
- SSR-safe: no `document` → call `onChange('light')` and return a no-op disposer.
- The returned disposer detaches both.

Export sites — all four must be updated or the API is invisible/untested:

- `packages/csc-ui/src/index.ts` (beside the existing `themeMode` export, ~L241)
- `packages/csc-ui-react/src/index.ts` — the **hand-written** re-export block
  (`components.ts` is generated; this file is not)
- `packages/csc-ui/src/test/dist-smoke.spec.ts` export list
- `packages/csc-ui/src/index.node.spec.ts`

### 4. Docs

- `packages/csc-ui-documentation/app/content/customization.ts`, `dark-mode`
  section (L199–201): the "set `data-theme` on `<html>`" copy becomes "on
  `<html>`, or on any element to open a **mode scope**". New subsection covering
  the nesting rule, the strict-value rule, the tokens-only caveat (pair with
  `bg-surface text-on-surface`), and the `:root` semantic-override caveat below.
- `packages/csc-ui-documentation/app/pages/data-visualization.vue`: replace the
  `MutationObserver` recipe with `observeThemeMode`.
- Optional: a live mode-scope demo on the customization page.
- `useTheme.ts` / the pre-paint script in `nuxt.config.ts` stay as they are —
  both are root-level and unaffected.

### 5. Documentation of record

Both are load-bearing per CLAUDE.md and **cannot be written in plan mode** — they
land as the first commits of the implementation.

**CONTEXT.md**, "Theming & dark mode":

- Amend **Theme mode** (L293): drop "Controlled by the consumer at the document
  root"; say the root is the outermost **mode scope**.
- Amend **Semantic token** (L269): "Defined at the document `:root`" → "at the
  document root, and re-declared at any **mode scope**".
- Add **Mode scope**:

  > An element carrying `data-theme="light"|"dark"`, together with everything
  > inside it — the region whose **semantic tokens** resolve in that pinned
  > **theme mode**. The document root is the outermost mode scope; scopes nest,
  > and the nearest enclosing one wins, because a mode scope re-declares the role
  > tokens on itself and inheritance carries them inward. A mode scope re-points
  > colour only — it paints no background of its own.
  > _Avoid_: Theme scope / theme island ("theme" is the banned word for this
  > axis), forced dark, local theme

**ADR-0053 — Theme modes are scoped to any element, not the document root.**
Qualifies on all three counts: the selector shape is a public CSS contract (ADR-0018
treats token/utility names as compatibility contracts), the `:not(…):not(…)` media
guard is baffling without the rationale, and there were real alternatives. Amends
ADR-0010's "Activation: `data-theme` attribute + system fallback" decision.
Alternatives to record as rejected: a namespaced `data-csc-theme` (two attributes
for one concept), a `<c-theme>` wrapper component (a component that renders nothing
is a CSS rule in costume), `:host-context()` (cannot see the OS-preference path),
and auto-painting the scope (would give every `display:contents` host a background).

### 6. Tests

| File | Kind | Covers |
| --- | --- | --- |
| `packages/csc-ui/src/theme/modeScope.spec.ts` | browser | dark scope on a light root; light scope nested inside a dark scope; `data-theme="cupcake"` inherits rather than forcing light; `<html data-theme="auto">` follows the OS; `themeMode(el)` agrees with the computed token; `observeThemeMode` fires on subscribe, on an ancestor flip, and not after dispose; `c-table`'s light-DOM sheet follows an enclosing scope |
| `packages/csc-ui/src/theme/tokens.node.spec.ts` | node | pins the four emitted selectors and the two `color-scheme` declarations in the generated `tokens.css` |
| `packages/csc-ui/src/test/conformance/mode-scope.spec.ts` | browser | every tag in `migratedTags` renders identically in a scope as it does under root-dark |
| one visual baseline | browser | a representative island (card + text field + button) on a light root |

Conformance suite design — follow `src/test/conformance/all-components.spec.ts`
(`describe.each(migratedTags)`, fixtures from `kinds.ts`):

1. Mount the tag inside `<div data-theme="dark">` with the root pinned light;
   `settle()`; read `background-color` + `color` off every `[part]` element in
   the shadow root.
2. On **the same mounted instance**, remove the scope attribute and pin the root
   dark; `settle()`; read again.
3. Expect equal.

Flipping one live instance rather than comparing two mounts removes cross-mount
variance (ids, hover, in-flight transitions) — the main flake risk here. Probing
`[part]` elements rather than the root part covers the 14 `NO_ROOT_PART` tags;
`c-table` has no shadow parts and is covered explicitly in `modeScope.spec.ts`.

The visual baseline is a single PNG (not a `matchScreenshotInBothModes` pair —
that helper flips the *root*): pin the root light, screenshot the dark island.

### 7. Changeset

One minor changeset for both packages (fixed group). User-facing; mention the
`<html data-theme="<unknown>">` behaviour change and the `color-scheme` addition.
Commits: `Feat(tokens): …`, `Feat(theme): …`, `Fix(tokens): color-scheme follows the mode`.

## Consequences to document

- **A consumer's hand-written semantic-role override at `:root` does not survive
  into a mode scope.** `:root { --c-surface: … }` is an *inherited* value inside
  the scope, and the scope declares `--c-surface` on itself — an own declaration
  always wins, and cascade layers cannot change that. Mitigation to publish:
  `:root, [data-theme] { --c-surface: … }`. **Seed** overrides via `applyTheme`
  are unaffected (they set palette tokens the role still points at through `var()`).
- A `c-toasts` placed outside a scope keeps the page's mode even when the toast is
  triggered from inside one. Correct — toasts are page chrome — but surprising.
- Consumers running another `data-theme` system (DaisyUI, Nuxt Color Mode) now
  interact with ours. Strict values contain the blast radius to the literal
  strings `light`/`dark`.

## Verification

```bash
pnpm --filter @cscfi/csc-ui style-dictionary:build
grep -n "data-theme\|color-scheme" packages/csc-ui/src/styles/css/tokens.css   # the 4 selectors

pnpm ui test:node          # selector guard
pnpm ui test:browser       # cascade + conformance
pnpm ui test:update        # devcontainer only — review the PNG diffs, incl. dark churn from color-scheme
pnpm ui lint               # tokens / a11y / ramp / chart
pnpm build && pnpm test    # dist smoke + docs example smoke
```

Manual pass on the docs dev server (`pnpm dev`, :3500), root pinned **light**,
inside a `<div data-theme="dark" class="bg-surface text-on-surface">`:

1. `c-button`, `c-card`, `c-alert` paint dark. ✅ expected — plain inheritance.
2. **`c-select` / `c-menu` / `c-tooltip` opened from inside the scope.** The
   claim to prove: Popover-API top-layer promotion changes painting and stacking
   but leaves the element in the DOM tree, so it still inherits the scope. This
   is the single most load-bearing assumption in the plan — check it first.
3. `c-data-table` scrollbars, a `c-text-field` textarea's resize grabber, and a
   `type="date"` field's picker are dark (`color-scheme`).
4. A nested `<div data-theme="light">` inside it flips back.
5. `c-table` (light-DOM table, ADR-0037 document sheet) follows the scope.
6. Toggle the docs theme switcher — the scope does not move.
