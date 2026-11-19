# Toolbar and side navigation vanish in Firefox 140 while a c-select is open (docs site)

Outcome: the plan's c-main suspect was wrong, because the docs site doesn't use c-main. The real cause is the
shared page lock (`packages/csc-ui/src/shared/pageLock.ts`). It fixed `<body>` with `top: -scrollY`, and
Firefox 140 left sticky descendants at their in-page position, above the viewport. c-select (which locks on
every open) and c-modal were affected. I reproduced it through WebDriver BiDi against the real Firefox 140.

The fix: the locked body is `position: fixed; inset: 0; overflow: hidden` and is scrolled to the offset. c-dropdown's
reflow close now also observes the body's children and their list, comparing the body's `scrollHeight`. The
changes are in the spec (`pageLock.spec.ts`, red on HEAD), the ADR-0014 and ADR-0050 amendments, and the changeset
`page-lock-sticky-firefox.md`.
