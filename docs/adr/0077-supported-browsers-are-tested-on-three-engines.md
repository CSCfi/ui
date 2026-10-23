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
- `@cscfi/csc-ui-react` gets its first runtime check: event-mapping specs per
  event kind on top of the React smoke.
