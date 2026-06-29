# Share one stylesheet across shadow roots via `adoptedStyleSheets`

**Status: implemented** (`packages/csc-ui-next/src/shared/defineElement.ts`).

## Context

Every `csc-ui-next` component is registered with Vue's `defineCustomElement` and a shared
Tailwind sheet is inlined into each one (`packages/csc-ui-next/src/shared/defineElement.ts`
passed `styles: [tailwindStyles, ...sfcStyles]` to **all 67 components**).

Investigation of Vue 3.5.34's runtime (`@vue/runtime-dom` `VueElement._applyStyles`) found that
on every instance connect Vue does `document.createElement("style")` + `s.textContent = styles[i]`
**into that instance's own shadow root** — no `adoptedStyleSheets`, no constructable-sheet
sharing, no dedup across instances or component types. Measured: the inlined sheet is **~280 KB**
(53% of the 537 KB bundle). So each component instance materialized its **own ~280 KB `<style>`
copy** — e.g. ~40 elements on a page ≈ ~11 MB of CSS text + 40 redundant CSSOM parses. The
download cost is unaffected (the string ships once, ~130 KB gzipped); the cost is **runtime DOM
text + parse + style-recalc**, scaling with element count.

Goal: collapse the N per-instance copies into **one shared `CSSStyleSheet`** adopted by every
shadow root, with per-component SFC styles in a per-type shared sheet — preserving identical
visual output and the current cascade order, with a graceful fallback for browsers without
constructable-stylesheet support.

## Approach — route all styling through `adoptedStyleSheets` (single file)

Changed only `packages/csc-ui-next/src/shared/defineElement.ts`. `tailwind.css` and all SFCs
are untouched.

Key facts validated against the Vue source:
- The shadow root is created in the `VueElement` **constructor** (`attachShadow`, line ~916), so
  it exists by the time a subclass's `connectedCallback` runs.
- `_applyStyles` no-ops on an empty array, so `defineCustomElement(component, { styles: [] })`
  cleanly disables Vue's per-instance `<style>` injection.
- No component imports another `.vue` SFC as an in-shadow child, so there are **no** Vue-injected
  child-component styles to preserve — 100% of styling can move to adopted sheets.
- Within `adoptedStyleSheets`, later array entries win cascade ties. Ordering
  `[sharedTailwindSheet, perTypeSfcSheet]` reproduces the previous `[tailwindStyles, ...sfcStyles]`
  order (Tailwind/preflight lower priority, SFC styles higher) → identical rendering, including
  for the ~64 components still styled by an SFC `<style>` block.

Implementation in `defineElement.ts`:

1. **Feature-detect** constructable stylesheets once at module load (also SSR-safe, since the docs
   site imports this package under Nuxt SSR where these globals are absent):
   ```ts
   const supportsAdopted =
     typeof CSSStyleSheet !== 'undefined' &&
     'replaceSync' in CSSStyleSheet.prototype &&
     typeof Document !== 'undefined' &&
     'adoptedStyleSheets' in Document.prototype;
   ```

2. **Shared Tailwind sheet**, built once (lazy module singleton): `new CSSStyleSheet()` +
   `.replaceSync(tailwindStyles)`. One sheet for the whole library.

3. **Per-type SFC sheet**, cached by tag in a `Map<string, CSSStyleSheet>` (only when the
   component has SFC styles): `new CSSStyleSheet()` + `.replaceSync(sfcStyles.join('\n'))`, so all
   instances of a type share it.

4. **Subclass and wire adoption** when supported:
   ```ts
   const Base = defineCustomElement(component, { styles: [] }); // suppress Vue injection
   class Element extends Base {
     connectedCallback() {
       super.connectedCallback?.();
       const root = this.shadowRoot;
       if (!root) return;
       const shared = getSharedTailwindSheet();
       if (root.adoptedStyleSheets.includes(shared)) return; // idempotent
       root.adoptedStyleSheets = [shared, ...(typeSheet ? [typeSheet] : []), ...root.adoptedStyleSheets];
     }
   }
   customElements.define(tag, Element);
   ```

5. **Fallback path** when `supportsAdopted` is false: keep the previous behavior verbatim —
   `defineCustomElement(component, { styles: [tailwindStyles, ...sfcStyles] })` — so older
   browsers / SSR still render (just without the sharing optimization).

The existing no-op guard (`if (customElements.get(tag)) return;`) and the `defineElement`
signature are unchanged; only the internals differ.

## Critical files

- `packages/csc-ui-next/src/shared/defineElement.ts` — the only file modified.
- Reference (no change): `src/tailwind.css` (`:host{display:contents}` and `@theme` resolve fine
  from an adopted sheet — `:host` matches the shadow host from `adoptedStyleSheets`).

## Verification (done)

1. **Build:** `cd packages/csc-ui-next && npm run build` — succeeds; bundle ~538 KB (the string
   still ships once; the win is runtime, not download).
2. **Sharing (headless, happy-dom + vitest):** a temporary spec defined `c-button` (no SFC styles)
   and `c-switch` (has an SFC `<style>`), connected instances, and asserted:
   - no per-instance `<style>` in any shadow root;
   - the same sheet object across two `c-button` instances **and** across `c-button` ↔ `c-switch`
     (shared Tailwind sheet);
   - `c-switch` carries exactly one extra per-type sheet, distinct from the shared sheet.
   All passed; spec removed afterward.
3. **Visual parity (manual, optional):** `cd packages/csc-ui-documentation && npm run dev`, then in
   devtools confirm `b[0].shadowRoot.adoptedStyleSheets[0] === b[1].shadowRoot.adoptedStyleSheets[0]`
   and that converted + unconverted components render identically. (Not run here — no browser in the
   build sandbox.)
4. **Fallback:** the `supportsAdopted === false` branch is the exact prior code path; not separately
   re-tested.

## Out of scope

- Reducing the ~280 KB sheet size itself (it's the union of utilities scanned across all 67
  components' templates via `@source`); this change shares it, it doesn't shrink it.
- Any ADR — this is a runtime optimization preserving the ADR-0003/0004/0006 decisions, not a new
  architectural trade-off. The rationale is captured in a doc comment in `defineElement.ts`.
