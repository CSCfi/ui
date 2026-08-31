# Radio Group Refactor — self-rendering c-radio

> On execution start: per user preference, mirror this plan into the repo's `_plan/` folder (e.g. `_plan/radio-group-refactor.md`); `_todo/radio-group-refactor.md` is superseded by it.

## Context

`c-radio` is today a data-only carrier (`template = <slot/>`, `:host{display:none}`): `c-radio-group` scans `:scope > c-radio` light-DOM children (attributes + `textContent`) and renders every row inside its **own** shadow root (`CRadioGroup.vue:27-70, 453-505`). Consequently a `<c-radio>` wrapped in a layout `<div>` renders nothing (the `_todo` brief's motivating case), rich label markup flattens to text, and the React wrapper's property-vs-attribute mismatch silently yields empty values. A depth-agnostic scan would not help — the rendered rows would still live in the group's shadow root, so consumer wrappers could never wrap them. The fix: `c-radio` renders itself (semantic `<label>` + `<input type="radio">` in its own shadow root); the group becomes a coordinator.

## Decisions (grilled 2026-08-28, confirmed by Oskari)

1. **Group wrapper unchanged**: `role="radiogroup"` + `aria-labelledby` + shared `FormLabel` (ADR-0022). No `<fieldset>`/`<legend>`.
2. **c-radio self-renders**: shadow `<label>` wrapping a visually-hidden `<input type="radio">`, the indicator (ring/dot/ripple), and the default slot — slot content is the clickable, announced label.
3. **`items` and `returnObject` dropped** from the group; slotted `<c-radio>` (wrappable at any depth) is the only API. `hostId` also drops (it only fed the now-meaningless native `name`; the other group-labeled components never had it).
4. **Group label = `label` prop primary + new named `slot="label"` fallback** (forwarded into FormLabel's slot; prop wins — FormLabel's existing contract). The filtered default-slot label heuristic (`hasLabelContent`) is deleted. Requires a narrow ADR-0022 amendment.
5. **Keyboard = WAI-ARIA radio pattern, group-implemented** (native `name` grouping cannot cross shadow roots): roving tabindex (checked radio is the tab stop, else first enabled), arrows wrap + select immediately, disabled skipped, Space native, **Enter no longer intercepted**.
6. **`checked` dropped from c-radio**; group `value`/v-model (`null | string`, strict string equality) is the sole selection source. Model events are emitted only from user interaction, never from DOM scans.
7. **Shared `FieldMessage.vue`** extracted into `src/shared/`; used by radio-group only in this change (`c-input`/`c-checkbox`/`c-message` refits are follow-ups).
8. **Docs**: new ADR-0031, amendment note in ADR-0022, CONTEXT.md updates, missing `usage.md` added for both components.

## Architecture (resolved by design pass)

- **Discovery (down)**: group scrapes `host.querySelectorAll('c-radio')` filtered by `radio.closest('c-radio-group') === host` (nested-group guard), + one MutationObserver `{childList, subtree, attributes, attributeFilter: ['value','disabled']}`. Precedent: `CSelect.vue:769`. Rejected: child self-registration events (mount/unmount protocol + sorting for no gain). Recorded limitation for the ADR: scrape fails if the group is composed inside another component's shadow root — no such composition exists.
- **State push-down**: `syncRadios()` writes imperatively into each child's shadow input (`r.shadowRoot.querySelector('input')`): `.checked` (strict string match vs `internalValue`), `.disabled` (`group.disabled || r.disabled`), roving `.tabIndex`. Child template never binds `checked`/`tabindex` (no Vue-patch clobber); child binds only its own `:disabled`. Reads `r.value`/`r.disabled` as DOM **properties** (React wrapper safe). Timing: `onMounted` + double `requestAnimationFrame` (child shadow roots may not exist yet — `CButtonGroup.vue:460` precedent), observer, and watches on `props.value`/`props.disabled`; `inputOf()` null-skips pre-upgrade children.
- **Selection up-flow**: c-radio's inner input fires native `change` only on user interaction; c-radio re-dispatches via `useHostEmit` — `CRadioEvents { change: string }` with `{bubbles: true, composed: true}` (precedent: `CAccordionItem.vue:196-206` `item-change`, and c-checkbox's host-redispatched `change`). All-lowercase per ADR-0017, no kebab twin. Group listens with `host.addEventListener('change', ...)` (light-DOM events never enter the parent's shadow root — `CAccordion.vue:186-193`), guards `radios().includes(event.target)`, then `internalValue = detail; emitModelValue(host, detail); syncRadios()`. `props.value` watch stays visuals-only (re-entrancy rule in `emitModelValue.ts`).
- **Arrow keys**: group `host.addEventListener('keydown', ...)` (keyboard events are composed); prev/next wrapping, skipping disabled; select via `inputOf(next).focus(); inputOf(next).click()` — programmatic click checks natively and fires `change`, reusing the single up-flow path; `preventDefault()` stops scroll. Space = native. Enter untouched (delete `CRadioGroup.vue:440-445`).
- **Visual state push-down**: inherited internal custom property `--_c-radio-color` set by the group's `items` tv slot (error → `var(--c-error)`, disabled → `var(--c-on-surface-muted)`); c-radio's ring/dot/focus-ring resolve `var(--_c-radio-color, var(--c-primary))`. Precedent: `--_c-button-min-height` (`CButtonGroup.vue:139`).
- **Parts** (ADR-0006 curated): c-radio `root` / `indicator` / `content` (names mirror c-checkbox); ripple spans stay internal. Group keeps `root` / `label` / `items` / `message`.
- **Disabled**: real `disabled` on the native input (no `aria-disabled`/`aria-checked` duplication); disabled checked radio keeps its visual, tab stop falls to first enabled; all-disabled group is Tab-skipped.

## Implementation steps

**1. Shared FieldMessage + guard globs**
- New `packages/csc-ui/src/shared/FieldMessage.vue` (non-element SFC, FormLabel-style header comment; no `<style>` block — non-element SFCs have no shadow root to adopt sheets into). Props: `errorMessage?`, `hint?`, `hideDetails?`, `valid?`, `part?` (default `'message'`). Model on `CCheckbox.vue:78-97`: always-in-flow row **reserving height** (`min-h-4` — fixes radio-group's current layout shift), `<Transition mode="out-in">` using explicit **class props** bound to Tailwind utilities (named-transition CSS impossible without a style block), keyed on message identity, error icon, visually-hidden `Error: `/`Hint: ` prefix.
- `packages/csc-ui/src/tailwind.css`: add `@source './shared/**/*.vue';` (currently only `./components/**` is scanned — FormLabel works by coincidence).
- `packages/csc-ui/scripts/check-palette-utilities.mjs`: widen scan to cover `src/shared`.

**2. Rewrite `packages/csc-ui/src/components/c-radio/CRadio.vue`**
- Template: `<label part="root">` → hidden `<input type="radio" :disabled @change="onChange">` (clip-pattern class from c-checkbox, not `h-0 w-0`) + indicator span (`part="indicator"`, ripple container + selection dot) + `<span part="content"><slot/></span>`.
- Script: props `{ value?: string (@freeform); disabled?: boolean }`; `CRadioEvents { change: string }` + `useHostEmit`; `useRipple` (centered, checkbox-style); `onChange` → ripple + `emit('change', props.value, {bubbles: true, composed: true})`. Keep `inheritAttrs: false` (comment updated). Docblock: tags only — `@slot`, three `@csspart` (lint is 1:1).
- Style: tv slots moved from group (`root`/`input`/`indicator`/`rippleEffect`/`selection`/`content`); escape hatch (ADR-0007): `input:checked ~ … .selection::after {transform: scale(1)}`, hover tint via `color-mix(... currentColor 10% ...)`, focus ring `input:focus-visible` outline in `--_c-radio-color`, `label:has(input:disabled)` dimming; `:host{display:block; width:fit-content}` (replaces `display:none`).

**3. Rewrite `packages/csc-ui/src/components/c-radio-group/CRadioGroup.vue`**
- Template: root (`role="radiogroup"`, `aria-labelledby`, `aria-required`, `part="root"`); `<form-label v-show="labelVisible" …><slot name="label"/></form-label>` (v-show not v-if — `useHasSlot` needs the slot mounted, `COtpInput.vue:246-252`); `<div part="items"><slot/></div>`; `<field-message v-if="!hideDetails" …/>`.
- Script: delete `items`/`returnObject`/`hostId`/`RadioItem`/`scanChildren`/`slotMode`/`hasLabelContent`/ripple machinery/`radioName`/Enter handler; `value: null | string`; `labelVisible = !!label || useHasSlot(…, 'label')`; event map triple (`changeValue`/`update:value`/`input`) typed `string` (lint requires exactly the triple for `emitModelValue` callers); discovery/sync/keydown/change listener per Architecture.
- Docblock: `@slot default` (radios' home, arbitrary wrappers), `@slot label`, four `@csspart`, keep `@subcomponents c-radio`.
- Style: `items` tv variants — `inline` false → `flex flex-col gap-0.5`, true → `flex flex-row flex-wrap gap-3`; error/disabled compound variants set text color + `--_c-radio-color`; escape hatch shrinks to `:host` rules only.

**4. `usage.md` for both components** (ADR-0026: ¶1 = description; kills the two analyzer warnings). Group: label prop vs `slot="label"`, custom-layout guidance (keep label text inside the radio's slot so it stays click-associated), keyboard contract, string values, removed-API notes. Radio: composed-child role, `change` bubbles through the group, standalone behavior.

**5. `packages/csc-ui/src/shared/modalStack.ts:307`**: replace `'c-radio-group:not([disabled])'` with `'c-radio:not([disabled])'` in `FOCUSABLE` — after the refactor the group's shadow root has no native focusable and `tryFocus` reaches only one shadow level; without this, modals fail to focus radio groups.

**6. `packages/csc-ui/src/styles/css/tokens.css:411`**: add `c-radio:not(:defined) { display: block; min-height: 42px; }` to the geometry-exception set (fixed per-row resting height, exact reservation; the group stays generic).

**7. Docs examples**: existing `basic`/`inline` (group) and `basic` (radio) sets already use the slot form — unchanged. Add `custom-layout` set (5 flavor files, parity-checked by `check-example-parity.mjs`) under `packages/csc-ui-documentation/app/examples/c-radio-group/`: the `_todo` motivating shape (bordered wrapper divs) with label text inside each radio's slot; canon `.vue` imports `ref` explicitly.

**8. Docs/ADR/CONTEXT**
- New `docs/adr/0031-self-rendering-c-radio.md`: decision + alternatives rejected (depth-agnostic parent scrape à la c-select — group-shadow rows preclude consumer layout; light DOM — ADR-0005) + consequences (scrape precludes composing the group inside another shadow root; FieldMessage follow-up refits: c-input, c-checkbox, c-message).
- Amendment note atop ADR-0022: `slot="label"` sanctioned narrowly (group-labeled components whose default slot is the children's home; currently c-radio-group only; prop stays primary).
- `CONTEXT.md`: Group-label entry gains the slot="label" fallback note; pre-upgrade-placeholder entry reflects the widened geometry-exception set.

**9. Regenerate + changeset**
- `pnpm --filter @cscfi/csc-ui docs:manifest` then `pnpm build`; commit regenerated `tag-name-map.ts` (`RadioItem` disappears, `CRadioElementEventMap` appears — file is generated, never hand-edit).
- `packages/csc-ui-react`: `pnpm build` regenerates `src/components.ts` (CRadio gains `onChange`); commit generated output.
- One changeset, `minor` (repo is in changesets pre mode `alpha`, major already pending — any bump yields next `4.0.0-alpha.x`), high-level: self-rendering c-radio, arbitrary slot layouts, WAI-ARIA keyboard (Enter no longer selects), reserved message height, removed `items`/`return-object`/`checked`/`host-id`.

## Edge cases to honor

- Checked radio removed dynamically → value untouched (never emit from scans), nothing checked, tab stop = first enabled.
- Value matches no radio → nothing checked, no emission.
- All radios / group disabled → all `tabIndex=-1`, group Tab-skipped, arrows no-op.
- Duplicate values → all matching show checked (degenerate input; document in usage.md).
- Nested groups → `closest()` filter + `radios().includes(target)` event guard.
- Standalone `<c-radio>` → functional lone radio (selectable, never uncheckable, `change` bubbles).
- Pre-upgrade children at group mount → double-rAF + observer heal.

## Verification

1. `pnpm --filter @cscfi/csc-ui docs:manifest` — zero analyzer errors, usage.md warnings gone, no raw `CustomEvent`, event-map triple intact.
2. `pnpm --filter @cscfi/csc-ui lint:tokens && pnpm --filter @cscfi/csc-ui lint:a11y && pnpm --filter @cscfi/csc-ui build`; then `pnpm build` in `packages/csc-ui-react` (tsc catches element-interface drift).
3. `node packages/csc-ui-documentation/scripts/check-example-parity.mjs` — custom-layout flavors complete.
4. Visual: root `pnpm dev` (docs at :3500), headless-chromium screenshots of the radio-group page light + dark (established memory recipe): ring/dot/ripple/error/disabled/inline render; message area reserves height; custom-layout rows render and select. (Don't run vue-tsc while the dev server is up — OOM, per memory.)
5. Keyboard/AT pass: Tab lands on checked (else first enabled) radio only; arrows wrap + select + skip disabled; Space selects; Enter does nothing; clicking slotted label text selects; group announced as radiogroup with label; a radio inside `c-modal` receives initial focus (step 5 fix).
