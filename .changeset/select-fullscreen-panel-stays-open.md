---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Keep `c-select`'s fullscreen panel open on a narrow viewport. In `multiple`
mode the panel closed on the pick that made the field's row of tags wrap: the
field stays in the page on a narrow viewport, so growing it reflowed the page,
and the menu still treated any page reflow as a reason to close. Anything else
that grew the page behind the open panel closed it the same way. The reflow
close now applies only to the anchored menu, which is placed against the page;
the fullscreen panel closes on the viewport crossing the narrow threshold, as
before. A tap on the panel surface beside its content — visible only while the
browser chrome or the on-screen keyboard is animating — no longer closes it.
