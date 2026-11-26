# CSC Design System landing page

## Context

The docs site's `/` (`packages/csc-ui-documentation/app/pages/index.vue`, 39 lines) is a bare
"Components" grid: a count, one sentence, one card per tag. There is no pitch, no "why" and no
path in for someone evaluating the library, even though 4.0.0 shipped on 2026-11-20 and the
site (design-system.csc.fi) is where people arrive. The site also has no description meta, no
og tags, no 4.x favicon, and names `museo-sans` without ever loading it, so most visitors get
the system font.

Outcome: a professional landing page at `/` that pitches the **CSC Design System** to
evaluators, with fast paths for existing users. It is built from the library's own components
and takes its figures from the manifest.

## Decisions (grilled)

1. **Location**: replace the docs site's `/`. The component grid moves to `/components`.
2. **Audience**: evaluators first; existing users get the hero CTAs and an upgrade strip.
3. **Shell**: a new Nuxt `landing` layout keeps `c-toolbar` (theme, flavor and colour controls)
   with full-width content and the footer. On `/` the side navigation is only the slide-in
   drawer (mobile mode forced) at every width. Today's shell becomes the `default` layout.
4. **Naming**: the page pitches the **CSC Design System**. **CSC UI** (`@cscfi/csc-ui`) is its
   implementation and what you install.
5. **Hero copy**: eyebrow "CSC DESIGN SYSTEM"; H1 "Build CSC services that look and work as
   one."; subline "N accessible web components in light and dark, for Vue, React, Angular or
   plain TypeScript." (N = `navComponents.length`); CTAs "Get started" → `/getting-started`,
   "Browse components" → `/components`; install line `npm i @cscfi/csc-ui`.
6. **Hero visual**: a live "Request compute resources" card of real components that re-themes
   with the toolbar controls.
7. **Hero look**: calm `surface`, generous whitespace, the card on `surface-raised`, and a soft
   `primary-subtle` shape behind it. Semantic tokens only.
8. **Sections**, in order: upgrade strip, proof pillars, flavor-aware "in your stack" snippet,
   component overview, then the footer from the layout.
9. **Groups** live in a docs-site map with a docs test, not in the manifest.
10. **Verification**: a hero-card spec in the docs harness, plus whole-page axe on `/` in the
    viewport smoke.
11. **Metadata**: the full set: `useSeoMeta` on `/`, site-wide favicon, default og:image,
    fallback description.
12. **Font**: **Noto Sans** (variable), self-hosted through `@fontsource-variable/noto-sans`.
    This changes the font site-wide and makes no runtime request to Google.

## Implementation (all in `packages/csc-ui-documentation` unless noted)

### Shell
- Extract the toolbar, side navigation and footer from `app/app.vue` into components
  (`AppToolbar.vue`, `AppSideNavigation.vue`, `AppFooter.vue`). `app.vue` becomes
  `<NuxtLayout><NuxtPage/></NuxtLayout>` plus its existing `useHead`.
- `app/layouts/default.vue` is today's shell, unchanged in behaviour.
- `app/layouts/landing.vue` has the toolbar, full-width `<main>` and footer. The side navigation
  is always in mobile/drawer mode, opened by `c-navigation-button`, which is shown at every
  width on this layout.
- `c-side-navigation-title` takes no link, so add an **"Overview"** item at the top of the
  Components section, routing to `/components`.

### Pages
- `app/pages/components/index.vue`: the current grid moves here unchanged, titled
  "Components — CSC Design System". Check that `[tag].vue` routing and prerender seeding in
  `nuxt.config.ts` still pick it up.
- `app/pages/index.vue`: the landing page (`definePageMeta({ layout: 'landing' })`). Heading
  outline: one H1, an H2 per section, H3 per pillar card. Mobile stacks the hero copy above
  the card.

### Hero card: `app/components/landing/LandingTaskCard.vue`
- A native `<form novalidate>` of **form-associated** fields:
  - `c-text-field` project name, required; the **error message** shows on an empty submit
  - `c-select` service: Puhti / Mahti / LUMI
  - `c-date-picker range` period
  - `c-number-field` CPU hours, with `min` and `step`
  - a `c-status` pill, "Draft" then "Submitted"
  - a primary submit `c-button` and a ghost reset `c-button` (a form reset of the fields)
- A valid submit raises a `c-toasts` toast: "Demo only — nothing was sent."
- Reserve the card's box size so the **pre-upgrade window** causes no layout shift.

### Sections
- **Upgrade strip**: "Upgrading from 3.x? 4.0 is a rewrite with the same tag names" →
  `/migration`. The copy says *upgrade*, per the glossary.
- **Proof pillars**, four cards, each linking to its guide:
  - Any framework: flavor icons from `useFlavor`'s `ICONS`
  - Accessible by default: axe in both modes, three engines, keyboard
  - Light, dark, your brand: inline seed presets through `useThemeSeeds`, shared with
    `ColorSwitcher`, so the whole page re-seeds
  - Forms that behave natively: form-associated fields, autofill
- **In your stack**: one snippet per **flavor** (install, register, a `c-button` with an event)
  in `app/content/landing.ts`, following the `content/*.ts` pattern. Highlight it at prerender
  with `highlightCode` (`app/utils/highlight.ts`) through `useAsyncData`, as
  `getting-started.vue` does; it follows the global flavor.
- **Component overview**: `app/content/component-groups.ts` maps each standalone tag to one
  group. Draft groups: Forms; Actions; Navigation & layout; Overlays; Feedback & status; Data
  display; Brand. Each group card shows its count and a few tag links, and the section ends
  with "Browse all N components" → `/components`.

### Font
- Add `@fontsource-variable/noto-sans` (docs package, `wght` axis) and import it through
  `nuxt.config.ts` `css` (not `site.css`, so the example-smoke baselines keep the harness's
  Liberation pin).
- In `app/assets/tailwind.css`, set `--font-sans: 'Noto Sans Variable', system-ui, sans-serif`
  and update the comment.

### Metadata
- `nuxt.config.ts` `app.head`: favicon (an SVG of the CSC mark from `c-csc-logo`; if the mark
  doesn't separate cleanly, use `public/v3/favicon.ico` copied to the root), default
  description, `og:site_name`, default `og:image`.
- `index.vue`: `useSeoMeta` with title, description, `og:*` and `twitter:card`.
- `scripts/og-image.mjs`: renders a 1200×630 logo-plus-headline template in the pinned Playwright
  Chromium and writes `public/og-image.png`. Commit both the script and the PNG.

### Tests
- `tests/landing.spec.ts`, using the existing `tests/smoke.ts` helpers and `setup.ts`:
  - mount `LandingTaskCard` against the built csc-ui
  - assert a clean upgrade and no axe violations in both theme modes
  - a light/dark screenshot baseline
  - an empty submit shows the error message; a valid submit raises the toast
  - a group-map completeness check: every `navComponents` tag (reuse `useManifest`'s
    derivation) is in exactly one group, and the map names no unknown tag
- `scripts/viewport-smoke.mjs`: add an axe pass on the prerendered `/` in both theme modes.
  `axe-core` is already used by `tests/smoke.ts`.

### Records
- `CONTEXT.md`, under Documentation:
  - **CSC Design System**: the design language of CSC's services (tokens, colour families,
    theme modes, accessibility, component designs) and the site presenting it. _Avoid_:
    csc-ui for the whole system.
  - **CSC UI**: the web-component library (`@cscfi/csc-ui`) implementing it. _Avoid_: the
    design system.
  - **Component group**: the docs site's grouping of standalone components on the landing
    overview, a presentation concern absent from the manifest. _Avoid_: category (implies a
    manifest field). Not to be confused with a **group label**.
- No ADR. None of these decisions is hard to reverse.
- Changeset: `pnpm changeset --empty`, because the docs package is private.

## Verification
1. `pnpm build`, then in the docs package `pnpm test`. Run one spec file per run because of the
   devcontainer's Chromium OOM: `landing.spec.ts` first, then the example smoke to confirm its
   30 baselines are unchanged by the font move. `pnpm test:update` writes the new card
   baselines; review the PNGs.
2. `pnpm --filter @cscfi/csc-ui-documentation generate`, then `test:viewport` over **all routes**
   (Noto Sans is wider than Liberation), plus the new axe pass on `/`.
3. `pnpm lint` (guards and example parity), and type-check the docs (verify via build if the
   typecheck is flaky).
4. In `pnpm dev`:
   - `/` in light, dark and system
   - the colour switcher and the inline seeds re-theme the hero card
   - a flavor switch changes the snippet
   - 360px layout, and the drawer opens from the navigation button
   - the network tab shows no `fonts.googleapis.com` / `gstatic` requests
   - Noto Sans renders without any local install
5. Screenshot `/` in light and dark with the headless Chromium recipe for review. Check the
   generated `index.html` for the og/twitter tags and the `og-image.png` link.

## Outcome (2026-11-23, branch `docs-landing-page`, uncommitted)

Implemented as planned. Deviations and findings:

- **Install line** reads `pnpm add @cscfi/csc-ui`, matching Getting started (the plan's draft said
  `npm i`).
- **"In your stack"** reuses Getting started's "Use a component" section
  (`GETTING_STARTED_SECTIONS`) instead of a new `content/landing.ts`, so the two pages cannot
  disagree.
- **Hero breakpoint**: side by side from `xl` (1280px). At `lg` (1024px) the copy column squeezed
  the H1 to five lines; below `xl` the card stacks under the copy, capped at 34rem.
- **Seed presets** sit in a `role="group"` labelled "Primary colour". Naming each button
  "Primary colour: X" collided with the toolbar switcher's trigger, which takes the same name
  once a preset is picked, since the two share state.
- **Font**: the Noto Sans italic variable face is loaded too (`wght-italic.css`), for emphasis in
  the usage docs. Every route still fits 360px with Noto Sans.
- **`<html lang="en">`**: the site never set it. The landing page's axe pass found it, and it is
  fixed site-wide in `app.vue`.
- **Follow-up, Shiki contrast**: the code themes (One Light / One Dark Pro,
  `utils/highlight.ts`) fail `color-contrast` on several token colours in both modes, on every
  code block of the site. The landing page's axe pass excludes `.shiki` with that reason.
  Choosing AA-passing themes is a separate, site-wide change.
- **Test note**: Vitest's `getByText` does not match the toast message, a text node beside the
  toast's heading. The spec reads the toast's `content` part instead.
- **Follow-ups not done**: grouping the side navigation by `COMPONENT_GROUPS`; per-page
  descriptions for component pages from each usage doc's first paragraph.

## Follow-up: component previews on /components (2026-11-23)

Each card on the `/components` overview shows a picture of the component's live example.

- **Generator**: `pnpm previews` (`scripts/component-previews.mjs`) runs after `pnpm generate`.
  It writes `public/previews/<tag>-{light,dark}.webp` (51 × 2, about 1 MB in total; each
  image is 880×550, an 8:5 frame at 2× density).
  - It frames the `basic` example, or the example a recipe names.
  - The demo pane fills the viewport, so no part of the docs page shows.
  - Overlays are opened first (menu, popover, tooltip, modal, toasts).
  - Large demos are rendered in a larger frame and scaled down.
  - The examples' "Value: …" read-outs are hidden.
  - Every animation is frozen at 2.5s, so each run produces the same images.
- **Open fields and overlays**: select, autocomplete, tree select, and the date, time and
  colour pickers are captured with their panel open, as are the menu, popover, tooltip and
  modal. The page clock starts at 2026-05-14 09:30 (`clock.setSystemTime`), so the calendar
  and time columns are the same on every run. The clock must keep running: a frozen one
  (`setFixedTime`) makes Vue drop the clicks that open the panels.
- **Viewport**: the capture keeps a desktop-width viewport (the narrow-viewport threshold is
  760px, below which fields open fullscreen panels) and clips to the frame-sized pane. Only
  the modal makes the viewport the frame, since it centres in the viewport.
- **No trigger buttons**: the loader hides its toggle. The toasts become `contained`, raise a
  success and an error toast, and hide their buttons.
- **Cursor**: parked outside the frame for every capture (except the tooltip's hover), so
  nothing shows a hover state left from the previous capture.
- **Guard**: `tests/component-previews.spec.ts` fails when a standalone component lacks either
  image, or when an image names a removed component.
- **Theme swap**: in `site.css`, keyed on `data-theme` with an OS-preference fallback, the same
  predicate as the Shiki rules. A hidden lazy image is never fetched, so a reader downloads
  only the previews for their mode (checked: 51 light, 0 dark).
- **Limits**: previews show the CSC default colours, not a re-seeded primary. They are re-taken
  by `pnpm previews`, which CI's `test:previews` now enforces (see the last follow-up).
- **Traps found**:
  - A c-* host is `display: contents`, so Playwright cannot hover or click it; target the
    button inside it.
  - `document.getAnimations()` does not return animations inside shadow roots, so a
    spinner's arc or a toast's timer stayed live. The script calls `getAnimations()` on every
    shadow root, which makes repeated runs pixel-identical.

## Follow-up: /components in sections (2026-11-23)

The components overview lists its cards in one section per component group: Forms, Actions,
Layout & navigation, Overlays, Feedback & status, Data display, Sign-in, Icons & brand. Each
section has an H2 with the group's count, the group's summary, then its cards in
alphabetical order. The groups and their order come from `content/component-groups.ts`, as on the landing
page, so the existing completeness test covers this page too. The anchors (`#forms`,
`#overlays`…) can be linked to.

## Follow-up: side navigation in groups (2026-11-23)

The side navigation lists the components under one title per component group: Guides, then
Components (Overview), then Forms, Actions, Layout & navigation, Overlays, Feedback & status,
Data display, Sign-in, Icons & brand. Items follow `content/component-groups.ts`, the same
as the overview page. They are titles, not collapsible parents: every
component stays one click away, and no expanded state has to follow the route.

## Follow-up: alphabetical within groups (2026-11-23)

Each group's tags in `content/component-groups.ts` are alphabetical, which orders the overview
sections, the side navigation and the landing page's chips. `tests/landing.spec.ts` checks the
order (`localeCompare`, as the old A–Z navigation sorted).

## Follow-up: CI fails on out-of-date previews (2026-11-24)

The pictures are committed, so a change to a component's look left the old picture on the
overview with nothing failing. `pnpm previews --check` (`pnpm test:previews`) now runs in CI
after the viewport smoke, on the same generated site. It re-takes every picture and compares
it with the committed one; on a mismatch it fails with the stale names and uploads the fresh
pictures as the `component-previews` artifact. A plain `pnpm previews` rewrites only the
pictures that no longer match, so a re-run after a one-component change adds only that
component's pictures to the history.

- **Comparator**: `pixelmatch` (the comparator of the visual baselines, now a docs
  devDependency) at an OKLab threshold of 0.05, skipping anti-aliased pixels. A picture
  matches while no 16-pixel square has more than 5% of its pixels differing. Measuring the
  worst square, rather than the whole picture, keeps a small component in a large frame
  detectable.
- **Calibration**:
  - A one-step ramp change of the primary or border token differed in 23–100% of a square,
    across c-checkbox, c-progress-circle, c-spinner, c-radio-group, c-button, c-data-table
    and c-date-picker.
  - A 0.03 lightness nudge differed in 6–25%.
  - Repeated local renders and a render with Skia's CPU-specific paths off
    (`--disable-skia-runtime-opts`) differed in 0%.
  - x64 CI against the arm64 devcontainer (2026-11-26, PR #335) differed in at most 3%,
    with LCD text off.
- **Trap fixed**: the page clock started at 09:30 once per run, so the time picker showed
  whichever minute the run had reached. The clock now restarts at 09:30 for each component.
- **Trap fixed**: subpixel text. The first CI run failed 64 of 102 pictures, by up to 57%
  of a square. CI's text had coloured LCD edges; the devcontainer's text is grayscale.
  `fonts.conf` includes the system's fontconfig, and Ubuntu turns on subpixel rendering
  where Debian doesn't. A local run with fontconfig forced to `rgba=rgb` reproduced CI's
  pictures to within 3%, 18 of them byte for byte. The script now launches Chromium with
  `--disable-lcd-text`, which overrides fontconfig. With it, the forced run and the plain
  run both match 102/102 with no picture re-taken.
