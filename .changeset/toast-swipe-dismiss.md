---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Toasts can be swiped away (ADR-0073). Drag a toast left or right with a mouse,
finger or pen and let go past a third of its width, or flick it, to dismiss it
as its dismiss button does; a shorter drag springs back, and a vertical drag
still scrolls the page. Only toasts with a dismiss button can be swiped, so
custom and indeterminate toasts are unchanged. Pressing a toast now pauses its
timer the way hovering does, so touch users can hold a toast up while they read
it. When a toast arrives or leaves, the others in `c-toasts` glide to their new
places instead of jumping. Under reduced motion the toast still follows the
pointer, but a dismissed toast fades where it was let go and the stack moves in
one step.
