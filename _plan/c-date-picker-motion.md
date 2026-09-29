# c-date-picker: calendar motion

## Context
The date picker (built 2026-09-28, still uncommitted) swaps views instantly:
- **Month changes:** a month change re-renders the day grid in place.
- **Month and year lists:** opening a list hides the other control and the arrows with `v-show`.
  - The header is `justify-between`, so the year button jumps to the row's start.

The user wants three changes:
- The grid should slide left or right to reveal the new month.
- The month and year lists should fade down in.
- The ▾ button should stay where it is.

The grilling session settled these decisions:
1. **Carousel slide.** The old month slides out one side while the new month slides in from the other. Both are clipped to the body, and the whole table moves as one, weekday row included.
2. **Every relative step slides by direction.** That covers:
   - the month arrows and the year arrows (±12 months);
   - grid keys that cross a month edge: arrows, Home/End, PageUp/PageDown and Shift+PageUp/PageDown.

   Picking from a list and opening the panel never slide.
3. **Interrupts restart from the grid on screen.** A step during a running slide finishes the old slide at once. The grid now on screen then slides out toward the newest month. Focus and `change:month` follow the latest month right away and never queue.
4. **The header keeps every slot.**
   - The active ▾ button stays where it is.
   - The other control and all four arrows fade to `opacity-0 invisible`. They keep their space, can't be focused, and aren't in the Tab trap.
   - The fade reverses when the grid comes back.
5. **Lists use MD3's fade-through** (matched frame by frame to the GM3 date-picker guideline video on 2026-09-29; it replaced an earlier simultaneous 8px crossfade).
   - Opening: the grid fades out in 70ms, drifting 8px down. After it, the list unrolls from the header over 250ms on `cubic-bezier(0.2, 0, 0, 1)`: a `clip-path` opens downward while `translateY(-10px) scaleY(0.95)` (origin top) settles, so lower rows drop further.
   - Closing: the list fades out in place in 70ms, then the grid fades in rising 8px.
   - The peek cap is applied in the list's enter hook, before the entrance transform. Measured a frame later it read transformed rects and came out 13px short.
5b. **The card is as tall as its month** (from the second GM3 video, 2026-09-29). The grid renders only the weeks a month spans (4–6; `monthMatrix`), and the body height animates old → new alongside the slide or list return. An open list holds the height the grid had, so opening it never resizes the card. There's no height animation under reduced motion (it jumps) or in the fullscreen panel.
6. **Reduced motion uses opacity only.** Under `prefers-reduced-motion: reduce`:
   - the slide becomes a crossfade;
   - the list's drop becomes a plain fade;
   - the header fade stays.

No ADR is needed, since this is easy to reverse, and there are no new glossary terms.

## Implementation (`packages/csc-ui/src/components/c-date-picker/CDatePicker.vue`)
- **Slide direction.** Add `slide = ref<'next' | 'prev' | null>(null)`. `setMonth(month, force, animate = false)` sets it by comparing the new month with the old one.
  - `stepMonth` and `moveTo` pass `animate: true`.
  - `pickOption` and `onOpened` keep the default, so they don't slide.
- **Day grid transition.**
  - Wrap the grid `<table>` in `<Transition :css="false" @enter @leave @before-leave>` and key it by `displayedMonth`. `c-message` and `c-input` already use `<transition>` inside a CE.
  - The hooks use WAAPI `el.animate()`:
    - the entering grid moves from `translateX(±100%)` to 0;
    - the leaving grid moves from 0 to `∓100%`;
    - both use 250ms `cubic-bezier(0.2, 0, 0, 1)`.
  - Under `matchMedia('(prefers-reduced-motion: reduce)')` the hooks run an opacity crossfade instead. With `slide === null` they skip the animation and call `done()` straight away.
  - `@before-leave` makes the old grid `inert` and `aria-hidden`, then positions it `absolute inset-x-0 top-0`. The body is already `relative`; add `overflow-hidden` to it.
  - Keep each running `Animation` in a local set. `@enter` first calls `finish()` on every one, which completes the earlier leave; that gives the restart behaviour in decision 3.
- **Scope focusing to the live grid.** Add `gridRef` on the keyed table and have `focusCell` query that, not `cardRef`. Paging back and forth quickly can leave the outgoing grid holding the same `data-date`.
- **Header.**
  - Replace the `v-show`s on the two controls and four arrows with a tv variant: `hidden: { true: 'opacity-0 invisible' }`, on a `transition-[opacity,visibility] duration-150` base. It's opacity only, so it needs no `motion-reduce:` override.
  - Both controls then always take their space, so `justify-between` keeps the ▾ button in place.
  - In `onPanelKeyDown`, add `el.checkVisibility({ visibilityProperty: true })` to the Tab-trap filter, since `visibility:hidden` elements still have client rects.
- **Lists.**
  - Put the `v-if` grid and `v-else` list swap under a second `<Transition>`: the list drops in from `translateY(-8px)` with `opacity 0`, about 150ms, and the grid fades while sliding down 8px (reversed on close).
  - Under reduced motion, use opacity only.
  - This transition doesn't slide, because `slide` is `null` for list swaps.
  - `applyListCap` and `focusOption(true)` still run after `nextTick` and rAF, since centring reads layout, not transforms.
- **Style block.** Document any new escape-hatch CSS in the style comment. The plan uses WAAPI and tv utilities, so no new keyframes are expected.
- **Changeset.** Fold the change into the existing uncommitted `.changeset/date-picker-component.md`; the component hasn't shipped yet, so it needs no separate entry. `usage.md` needs no change.

## Tests (`CDatePicker.spec.ts`)
- Add a `finishAnimations(m)` helper that calls `getAnimations({ subtree: true }).forEach(a => a.finish())` on the card, the same pattern as `test/conformance/anchored-overlays.spec.ts:247`.
  - Call it wherever existing specs step months, then read `m.part('grid')`. The spec file currently has these reads at lines 224, 396, 420 and 563.
- New behaviour specs:
  - `›` animates the outgoing and incoming grids in opposite directions: check the two tables, their `inert` flags, and each `getAnimations()` keyframe sign. `‹` reverses the directions.
  - PageDown past the month edge slides; a pick from the month list does not (no animations on the table).
  - A quick `› ›` leaves at most two grids, focus sits on the newest grid's cell, and `change:month` fired twice.
  - Opening the year list leaves `year-button`'s bounding rect unchanged. The hidden month control and arrows have `visibility: hidden` and are skipped by Tab.
  - Reduced motion, by stubbing `window.matchMedia`: the slide's keyframes carry opacity only, with no transform.
- Visual baselines: re-check that they're unchanged (closed field, open panel, range band, year list) after `finishAnimations`. Hidden header items now keep their space, so the year-list baseline will change: regenerate it, review it, and confirm the year button hasn't moved.

## Verification
- `pnpm ui test -- src/components/c-date-picker/CDatePicker.spec.ts` (one file per run, because of the devcontainer OOM). For baselines, use `--update` with the spec path, then check `git status` for stray PNGs.
- The conformance suites (value control and anchored overlays, including the no-anchor-positioning fallback) and the full browser plus node projects.
- `pnpm ui lint` and `pnpm ui build`. The API snapshot should be unchanged, since there are no new props or parts.
- A manual look in the docs dev server: click `›` quickly, page with the keyboard, and open and pick in the year list. Then repeat with reduced motion emulated.
