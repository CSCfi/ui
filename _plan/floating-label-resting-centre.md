# Fix: the resting floating label sits 2px above centre in the 52px field

> On approval, copy to `_plan/floating-label-resting-centre.md` (repo convention).
>
> **Carry-over:** the previous task in this file (docs example-smoke baseline
> refresh) is committed as `5ee2f850` but **still unpushed** — `git push origin
> development` is blocked by a permission rule. That commit must reach the remote;
> this fix lands on top of it and re-touches the same 12 PNGs.

## Context

`0116d82b` (ADR-0055) grew the shared `c-input` field box from 44px to 52px. It
*did* adjust the floating label — `top-3` → `top-3.5` — but by 2px instead of 4px,
so the **resting** label (unfocused, empty, sitting inside the box as a
placeholder) no longer tracks the box centre.

Measured from the visual baselines (pixel row profiles, ink bbox vs. box, light
**and** dark — identical in both, so this is layout, not tokens):

| Baseline | Box | Ink rows | Above | Below | Offset |
| --- | --- | --- | --- | --- | --- |
| c-text-field before | 44px | 15–29 | 15 | 14 | +0.5px |
| c-text-field **after** | 52px | 17–31 | 17 | 20 | **−1.5px** |
| c-select before | 44px | 15–29 | 15 | 14 | +0.5px |
| c-select **after** | 52px | 17–31 | 17 | 20 | **−1.5px** |
| c-tree-select before | 44px | 15–26 | 15 | 17 | −1.0px |
| c-tree-select **after** | 52px | 17–28 | 17 | 23 | **−3.0px** |

A uniform **−2px regression**. By contrast `c-button`'s glyph moved +4px
(15–26 → 19–30), i.e. correctly re-centred — the button centres with flex, the
label is absolutely positioned from a literal `top`.

### The invariant

`packages/csc-ui/src/components/c-input/CInput.vue:208` sets `top`, and the
escape-hatch rule at `:639-646` applies `translateY(-2px)`. The painted line box
(24px, `text-base`'s own) therefore spans `top−2 … top+22`, centre `top+10`. For
that centre to equal the box centre:

```
top = (box − 24) / 2 + 2
  44px → top-3 (12)  ✓ was correct
  36px → top-2  (8)  ✓ `small`, still correct
  52px → top-4 (16)  ✗ the commit used top-3.5 (14)
```

The `+2` cancels the `translateY(-2px)` optical nudge; the net is a
geometrically centred line box, which is exactly what the old 44px baseline
shows. `top-4` reproduces that relationship (predicted ink 19–33, centre 26 =
box centre — matching the old +0.5px).

The **lifted** state is already correct and must stay put: painted top is
`14 − 22 = −8px`; with `top-4` the transform must become `−24px` to keep `−8`.
Confirmed unaffected in the baselines — the notch label's ink is y=4–9 in
`c-select` `field-selected` both before and after. The **value** text also
centres correctly (ink centre 32.5 vs interior centre 33.5).

**Intended outcome:** the resting label is centred in the 52px box across the
whole input family and both theme modes, with the lifted label and the value
text pixel-unchanged, and a spec that names the invariant so it cannot drift
again.

## Changes

### 1. `packages/csc-ui/src/components/c-input/CInput.vue` — two literals

Only `c-input` renders a floating label; `c-text-field`, `c-select`,
`c-autocomplete` and `c-tree-select` all wrap it and override nothing, so both
edits fix the whole family.

- **`:208`** in the `tv` config: `absolute top-3.5` → `absolute top-4`.
- **`:645-651`** escape-hatch: `[data-lifted]` transform `translateY(-22px)` →
  `translateY(-24px)`, preserving the −8px painted top.

Leave `[data-size='small']`'s `translateY(-16px)` and `sizeVariants.small`'s
`top-2` alone — 36px already satisfies the invariant (8 − 16 = −8).

Update the three comments that state the arithmetic, which are currently wrong:
the `:645-650` block ("rests 14px into the 52px box … −22px"), and
`sizeVariants.small` at `:149-159` ("as 14px does in the 52px box"). State the
invariant `top = (box − 24)/2 + 2` in the tv comment at `:200-207` so the next
person changing `--spacing-control` sees it.

### 2. Guard spec — `packages/csc-ui/src/test/controlHeight.spec.ts`

This file already owns the ADR-0055 concept and already mounts `c-text-field`
and reaches `field.deep('c-input', '.c-input__slot')`. Add one case beside the
existing height assertions — **it must fail by 2px before the edit**:

```ts
it('rests the floating label centred in the field box, at both sizes', async () => {
  for (const [size, height] of [['default', 52], ['small', 36]] as const) {
    const m = await mount('c-text-field', {
      attrs: { style: 'width: 240px' },
      props: { label: 'Name', size },
    });

    await settle();

    const slot = m.deep('c-input', '.c-input__slot').getBoundingClientRect();
    const label = m
      .deep('c-input', '.c-input__label--floating')
      .getBoundingClientRect();

    expect(slot.height, `${size} box`).toBe(height);
    // Resting, not lifted: an empty unfocused field sets no `data-lifted`.
    expect(m.deep('c-input', '[data-lifted]') ?? null).toBeNull();
    expect(
      Math.abs((label.top + label.bottom) / 2 - (slot.top + slot.bottom) / 2),
      `${size} label centred`,
    ).toBeLessThanOrEqual(1);

    m.unmount();
  }
});
```

Notes for the implementer:
- `getBoundingClientRect()` returns the **painted** box, so it already accounts
  for `translateY`; no need to read the transform.
- `c-text-field` forwards `:size="sizeResolved"` to `c-input` (`CTextField.vue:15`),
  so the `small` case exercises the second box size through the public prop.
- Use the `.c-input__label--floating` class, not `part="label"` — `labelTop`
  shares that part name.
- `deep` throws on a missing element; use a tolerant lookup for the
  `data-lifted` assertion, or assert `data-lifted` is absent on the label
  element itself (`label.hasAttribute('data-lifted')`), whichever reads cleaner
  against the harness.
- Reuse `mount`/`settle` from `./harness`; the existing `centre` helper lives in
  `CTreeSelect.spec.ts:613` — a local one-liner here is fine rather than
  exporting it.

### 3. Regenerate the docs canon baselines (again)

The 12 PNGs refreshed in `5ee2f850` have the 2px-high label baked in. The box
dimensions do not change, only the label within them, so this is a content-only
rewrite of the same six canons.

```bash
pnpm --filter @cscfi/csc-ui run build          # the docs smoke mounts the BUILT package
pnpm --filter @cscfi/csc-ui-documentation run test:update
```

Component-level baselines (`field-selected`, `fullscreen`, `open-*`, `search`)
are expected to be **byte-unchanged**: they show the lifted label (preserved at
−8px) or panel captures whose search box is a plain input, not a floating label.
If any of them moves, the lifted compensation is wrong — do not absorb it.

### 4. Changeset

This one *is* user-facing (visibly misaligned labels in every field), so it ships
its own changeset — a patch on `@cscfi/csc-ui`, one line, no internal detail.

## Critical files

- `packages/csc-ui/src/components/c-input/CInput.vue` — `:208` (`top-3.5`), `:645-651` (lifted transform), `:149-159` + `:200-207` (comments)
- `packages/csc-ui/src/test/controlHeight.spec.ts` — the new guard case
- `packages/csc-ui-documentation/tests/__screenshots__/examples.spec.ts/` — 12 PNGs, regenerated
- `packages/csc-ui/src/test/harness.ts` — `mount`, `settle`, `deep` (reuse; no new helpers)

## Verification

1. **Fail first.** Add the spec before the edit and run it — it must fail with
   ~2px on `default` and pass on `small`:
   ```bash
   pnpm ui test:browser -- controlHeight
   ```
2. Apply the two literal changes; re-run — both sizes pass.
3. **Independent pixel check.** Re-measure the regenerated `c-text-field` canon:
   ink should land at rows 19–33 (above 19 / below 18), reproducing the old
   44px relationship. The row-profile script used for the table above is in the
   scratchpad (`png.py`).
4. Full suite exactly as CI runs it — expect only the 12 docs PNGs to differ:
   ```bash
   pnpm --filter @cscfi/csc-ui run build
   pnpm test
   git diff --stat        # 12 PNGs + CInput.vue + controlHeight.spec.ts + changeset
   ```
5. Visually confirm one light and one dark pair (the Read tool renders PNGs) —
   the label should sit level with where the value text appears in the filled
   `field-selected` baseline.
6. Commit as `Fix(core): Centre the resting floating label in the 52px field`,
   then push **both** this and the pending `5ee2f850`, and confirm the CI run
   via the check-runs annotations API (`gh` is unavailable; run logs need admin).

## Watch item

`--spacing-control` and the label's `top` remain independent literals. The new
spec is what ties them together — if someone retunes the control height, that
spec fails and names the invariant. (A `calc()`-derived offset was considered and
set aside to keep the geometry in tailwind-variants.)
