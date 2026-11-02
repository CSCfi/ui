# 77. Supported browsers are tested on three engines

Date: 2026-10-23

## Status

Accepted. Amends ADR-0049. Lands before `4.0.0-rc.1`.

## Context

No release ever said which browsers it supports, and the suite ran on
Chromium only (ADR-0049). Users found every cross-engine bug of the alphas:
overlays mispositioned in Firefox 140 ESR (ADR-0056), sticky chrome vanishing
under the page lock in Firefox, the page lock on iOS Safari. A stable design
system for public-sector services needs a promise, and the promise needs a
test run behind it.

## Decision

- **Supported browsers:** the current and previous Chrome/Edge, Firefox and
  Safari (iOS included), plus the Firefox ESR that RHEL ships (140 today).
  Published on Getting started and in `browserslist`.
- **Behaviour specs run on Chromium, Firefox and WebKit** in CI. Visual
  baselines stay Chromium-only. The devcontainer keeps running Chromium alone,
  since Playwright's Firefox and WebKit are hard to install on arm64.
  Firefox ESR's missing anchor positioning stays covered by the
  `noAnchorPositioning` emulation, because Playwright's Firefox is newer.
- **A failure on a supported engine is a bug** and blocks the release. A spec
  may skip Firefox and WebKit only through one `chromiumOnly(reason)` helper,
  for test tooling that exists only in Chromium (CDP-driven touch), and a
  guard lists every use. Conformance suites never skip.
- **The example smoke grows into an accessibility and flavor check:** it runs
  axe-core (WCAG 2.1 AA) on every canon in both theme modes, requiring zero
  violations, and also mounts the React and plain-TypeScript canons against
  the built packages. A wrong axe rule is disabled per rule, with a reason,
  never per canon.

## Consequences

- CI time grows by two browser runs of the behaviour specs.
- `TEST_BROWSERS` (comma-separated, Chromium alone when unset) picks the
  engines of the csc-ui browser project; CI lists all three. Firefox and
  WebKit are the instances `browser (firefox)` and `browser (webkit)`. The
  docs example smoke stays on Chromium: it checks the canons and axe, not
  engine behaviour.
- `lint:engines` lists every `chromiumOnly` use with its reason, and fails on
  one in a conformance suite, on a missing reason, and on any other engine
  switch (`server.browser`, `navigator.userAgent`) in a spec.
- A spec may branch on a **capability**, probed at runtime, when a supported
  browser lacks it and an ADR documents what happens then: it asserts that
  documented behaviour instead, so nothing goes untested. The first Firefox
  run (Playwright's Firefox 150) needed two:
  - style container queries, which arrived in Firefox 151 and are missing in
    ESR 140: an element-level inverting scope is inert there (ADR-0054), and
    `modeScope.spec.ts` asserts exactly that;
  - Firefox's native anchor positioning neither shifts a panel no placement
    fits back into the viewport (Bug 1924792) nor keeps the last placement
    that fit. Where its native panel runs off the viewport, the
    anchored-overlay suite holds the fallback (ADR-0056) to the shift itself
    instead of to that placement.
- **iOS Safari is promised but not tested.** Playwright's WebKit is the Linux
  WebKitGTK build: Safari's engine without iOS's touch scrolling, on-screen
  keyboard or visual viewport, where the worst alpha bugs lived (the page
  lock). A green WebKit run says nothing about iPhones and iPads. Recorded as
  a known gap (decided 2026-10-23): no device check gates a release, and iOS
  faults arrive as user reports.
- Firefox's content sandbox cannot read the bundled test fonts until their
  directory is allowed (`security.sandbox.content.read_path_whitelist`);
  without it every family fell back to DejaVu, about 15% wider, and specs
  that measure text failed.
- `@cscfi/csc-ui-react` gets its first runtime check: event-mapping specs per
  event kind on top of the React smoke.
