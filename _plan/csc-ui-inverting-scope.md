# csc-ui: an inverting scope (`data-theme-invert`)

## Context

ADR-0053 made any element carrying `data-theme="light"|"dark"` open a **mode
scope**. What it cannot express is a *relative* mode: a panel that is dark on a
light page and light on a dark page, following whatever the user picked. That is
the ask — a hero, a spotlight section, a permanently-contrasting band.

`data-theme` deliberately stays two-valued. ADR-0053 closed that door on
purpose:

> **Only `light` and `dark` pin a mode.** […] a stray `data-theme="cupcake"`
> would otherwise force a light island into someone's app.

So inversion arrives as a **separate boolean attribute**, `data-theme-invert`.
That keeps ADR-0053's clause untouched, removes any collision risk with DaisyUI
or Nuxt Color Mode, and reads truer: inversion is an operation on the mode, not
a mode. It also avoids a third meaning of "inverted" — CONTEXT.md already spends
that word on `surface-inverted` and warns that "inverse" collides with the
mode-invariant `inverse-*` family.

**The mechanism is verified, not hypothesised.** I ran it end to end in the
repo's pinned Chromium (playwright 1.60.0, `/ms-playwright/chromium-1223`).
Results in "Verified behaviour" below.

## Mechanism

A new public custom property `--c-mode` (keyword `light`/`dark`) is declared in
every existing mode block, and two `@container style(--c-mode: …)` blocks
declare the opposite role set on an inverting element:

```css
:root, [data-theme='light'] { color-scheme: light; --c-mode: light; …92 light roles… }
[data-theme='dark']         { color-scheme: dark;  --c-mode: dark;  …92 dark roles…  }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']):not([data-theme='dark']) {
    color-scheme: dark; --c-mode: dark; …dark…
  }
  /* <html data-theme-invert> — no ancestor container at :root, so invert the OS. */
  :root[data-theme-invert]:not([data-theme='light']):not([data-theme='dark']) {
    color-scheme: light; --c-mode: light; …light…
  }
}
@media (prefers-color-scheme: light) {
  :root[data-theme-invert]:not([data-theme='light']):not([data-theme='dark']) {
    color-scheme: dark; --c-mode: dark; …dark…
  }
}

/* An inverting scope declares the opposite of the mode its PARENT carries. */
@container style(--c-mode: light) {
  [data-theme-invert]:not([data-theme='light']):not([data-theme='dark']) {
    color-scheme: dark; --c-mode: dark; …92 dark roles…
  }
}
@container style(--c-mode: dark) {
  [data-theme-invert]:not([data-theme='light']):not([data-theme='dark']) {
    color-scheme: light; --c-mode: light; …92 light roles…
  }
}
```

Why this preserves ADR-0053's core invariant — *nesting resolves by inheritance
proximity, not specificity*: a style query evaluates against the nearest
**ancestor** container, so the inverting element reads the `--c-mode` it
inherited, then declares every role **on itself**. An own declaration beats an
inherited one at any depth, exactly as for a pinned scope. No descendant
selectors, no specificity arithmetic.

The `:not()` guards make an explicit `data-theme` on the *same element* win over
`data-theme-invert` — pinning beats inverting. Without them the invert blocks,
being later in source at equal specificity (0,1,0), would override the pin.

**Size** (measured on the real generated file): `tokens.css` grows from 21.2 KB
to 38.8 KB raw, and from 4.84 KB to 5.87 KB gzipped — **+1.0 KB, +21%**. (An
earlier estimate of +193 B was made by concatenating *identical* blocks; the
real ones differ in indentation and selector, and the file now exceeds gzip's
32 KB window, so they compress less well.)

**Specificity**: the element-level invert guards are wrapped in `:where()` so
the blocks stay (0,1,0) like every other mode block. Without it they are (0,3,0)
and beat the documented consumer override
`:root, [data-theme], [data-theme-invert] { … }` on every inverting scope,
however late the consumer's sheet loads — verified, then fixed. The two
root-level blocks keep the unwrapped guard because they must out-specify the
(0,3,0) OS block; that asymmetry is inherited from ADR-0053, whose OS block
already out-specifies a consumer override on `:root`.

## Verified behaviour

Run in the pinned Chromium against the CSS above. Every case is the wanted one:

| Case | Result |
| --- | --- |
| Style query reads the **parent**, not self (element setting `--c-mode` on itself still matched its parent's value) | confirmed — no cycle |
| invert in a light root | dark, `color-scheme: dark` |
| plain child of an inverting scope | inherits dark |
| invert **inside** invert | back to light — identity restored |
| invert inside an explicit `data-theme="dark"` island | light (nearest scope, not the root) |
| invert two levels deep under a dark island | light |
| element with **both** `data-theme="dark"` and `data-theme-invert` | dark — the pin wins |
| a custom element's **shadow root** under an inverting scope | reads the inverted token |
| `<html data-theme-invert>`, OS light / OS dark | dark / light |
| toggling the attribute at runtime (`toggleAttribute`) | flips both ways, no stale state |
| a **top-layer** `popover` carrying the attribute | inverts — it stays in the DOM tree (ADR-0053) |
| `data-theme="auto"` or `="cupcake"` **plus** the attribute | inverts — an inert value is no pin, composing with ADR-0053 |
| `--c-mode` read off a deep descendant | `dark` — confirms the `themeMode()` resolver design |

Style-query matching on the unregistered `--c-mode` is whitespace-tolerant and
comment-tolerant but **case-sensitive** (`DARK` does not match `dark`), and an
element with no `--c-mode` simply never matches — the correct inert behaviour.
Since the emitter is the only writer of the value, no `@property` registration
is needed; the plan should say `--c-mode` is emitter-owned and not for consumers
to hand-write.

## Changes

### 1. Emitter — `packages/csc-ui/utils/createSemanticTheme.cjs`

The only place token CSS is authored. It is a flat array of line strings joined
with `\n`; `decls(map, indent)` builds a block body with the indent passed in
(tabs), no braces, no trailing newline. Add:

- `'\t--c-mode: light;'` / `'\t--c-mode: dark;'` beside the existing hand-written
  `color-scheme` line in each of the three current blocks (`'\t\t'` in the
  `@media`-nested one).
- Two `@container` blocks and two `:root[data-theme-invert]` media blocks, each
  needing its own `decls(map, '\t\t')` call — there is no re-indent helper.
- Source order is load-bearing and must be documented in the file's header
  docblock, which is the canonical cascade rationale: the invert blocks go
  **last**, after the `@media` block, so an inverting scope overrides the light
  default it would otherwise inherit at equal specificity.

### 2. Resolver — `packages/csc-ui/src/theme/themeMode.ts`

`themeMode(el)` currently does `el.closest("[data-theme='light'],[data-theme='dark']")`
plus a binary ternary, which cannot see an inverting scope. Replace the lookup
with a read of the cascade's own answer:

```ts
const declared = getComputedStyle(el).getPropertyValue('--c-mode').trim();
if (declared === 'dark' || declared === 'light') return declared;
// fall back to the existing closest() + matchMedia path
```

This is strictly better than a DOM walk: it always agrees with the CSS, handles
invert/nesting/OS for free, and — unlike `closest()`, which stops at a shadow
root — works for an element **inside** a shadow root, because custom properties
inherit across the boundary. Keep the existing path as the fallback for an
unstyled document, SSR, or a detached node.

**`ThemeMode` stays `'dark' | 'light'`.** An inverting scope *resolves to* one of
those. Widening it would break the four exhaustive `Readonly<Record<ThemeMode, …>>`
maps in `src/theme/chart-data.ts` and `scripts/generate-chart-data.mjs:30`
(`MODES`), which read exactly two token files — and would falsify the documented
`// 'light' | 'dark'` at `data-visualization.vue:651`.

`observeThemeMode` needs one change: `attributeFilter: ['data-theme']` must also
watch `'data-theme-invert'`. Note in its docblock that re-parenting — already
documented as unobserved at `:51` — becomes semantically load-bearing for an
inverting scope in a way it never was for a pinned one.

### 3. Guards that will fail — `packages/csc-ui/src/theme/tokens.node.spec.ts`

Deliberate tripwires on the emitted shape, all of which must be updated and
extended, not loosened:

- `MODE_BLOCKS` (:20-24) and the exactly-once assertion (:27) — add the four new
  selectors.
- The exact `color-scheme` counts (:53-56): `light` twice and `dark` three times
  today; both grow by two.
- Add assertions for the new invariants: the invert blocks come **last**, each
  carries the `:not()` pin guard, and `--c-mode` is declared in every mode block.

### 4. Behaviour spec — `packages/csc-ui/src/theme/modeScope.spec.ts`

Extend, don't replace. Its technique is already right: it never asserts a
literal colour, it compares against `rootIn(mode)` — a probe with the mode
pinned on `<html>`. A new `describe('inverting scope')` covering exactly the
rows in "Verified behaviour" above, plus:

- `themeMode()` and `observeThemeMode()` agree with the computed token inside an
  inverting scope, and `observeThemeMode` fires when `data-theme-invert` is
  toggled on an ancestor.
- A component (`c-button`) and a top-layer popover panel inside an inverting
  scope, mirroring `:252` and `:268-284`.

The existing inertness tests at `:102-122` (`cupcake`, `auto`) **stay unchanged
and keep passing** — that is the payoff of not touching `data-theme`.

**No third pass on the per-tag conformance suite** (`src/test/conformance/mode-scope.spec.ts`,
72 tags, already the slowest at ~98s). No component branches on the mode, none
calls `themeMode()`, none resolves a colour in JS — if the tokens resolve, every
component follows, and the existing suite already proves scope-vs-root parity.
**No new visual baselines** either: an inverting scope resolves to light or dark
and must paint identically to the pinned equivalent, which is an assertion, not
a screenshot.

### 5. Docs and vocabulary

- **ADR-0054**, following ADR-0053's own layout: a `## Status` section reading
  `Accepted` followed by the relationship line (ADR-0053 opens with "Amends
  ADR-0010's activation decision…"; older ADRs such as 0010 use YAML
  frontmatter instead — match 0053, the one being extended). It *extends*
  rather than contradicts — record that
  `data-theme` stays two-valued, why the attribute is separate, and that the
  style query reads the parent.
- **CONTEXT.md**: a new **Inverting scope** entry; edits to **Theme mode** (:298)
  and **Mode scope** (:301-303). The _Avoid_ line should name "inverted scope"
  (collides with **Inverted surface**) and "inverse".
- **`packages/csc-ui-documentation/app/content/customization.ts`** dark-mode
  section (:196-280). One wart to document honestly: the override recipe at
  :271-277 currently reads `:root, [data-theme] { --c-surface: … }` and must
  become `:root, [data-theme], [data-theme-invert] { … }`, because an inverting
  scope also re-declares every role on itself. A consumer who misses this loses
  their override inside inverting scopes only.
- A docs example is warranted — a page section that stays opposite the page.
  `lint:examples` enforces flavor parity, so it needs all four variants.

### 6. Changeset and commit

`minor` for both packages. Commit
`Feat(tokens): Invert the theme mode for a subtree with data-theme-invert`.

## Sequencing

The ink fix from the previous task is still uncommitted in the working tree.
Commit it first — `Fix(surfaces): Declare the on-surface ink where a painted box
projects content`, with `.changeset/surface-ink-on-painted-containers.md` — so it
stays a clean single-cause patch, then build this on top.

## Out of scope

- No change to `data-theme` itself; no third recognised value.
- No component changes — as with ADR-0053, none is needed.
- No polyfill. Style container queries are in all three engines (Chrome 111,
  Safari 18, Firefox 128) and the repo already ships anchor positioning that
  Firefox lacks entirely (ADR-0008). Where unsupported, `data-theme-invert` is
  inert — the subtree simply keeps the ambient mode, which degrades to a no-op
  rather than a half-inverted mess.

## Verification

```bash
pnpm --filter @cscfi/csc-ui run style-dictionary:build   # regenerate tokens.css
pnpm --filter @cscfi/csc-ui test:node                    # tokens.node.spec.ts shape guards
pnpm --filter @cscfi/csc-ui test:browser                 # modeScope + conformance + all specs
pnpm --filter @cscfi/csc-ui lint                         # tokens / a11y / ramp / chart
pnpm build                                               # docs + react read the manifest
pnpm --filter csc-ui-documentation test                  # example smoke
pnpm --filter csc-ui-documentation lint:examples         # flavor parity for the new example
```

1. Inspect the regenerated `src/styles/css/tokens.css` by eye before running
   anything — block order is the one thing no test fully captures.
2. Confirm gzip growth stays ≈200 B (`gzip -c src/styles/css/tokens.css | wc -c`,
   baseline 4844 B).
3. Manual check in the docs: `pnpm dev`, <http://localhost:3500>, drop
   `data-theme-invert` on a section in devtools and flip the theme toggle —
   the section must move opposite the page in both directions.
