---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix c-modal focus behaviour: the dialog box no longer shows a focus ring
(the native `<dialog>` root is a focus start point, not an interactive
control — it now suppresses the UA `:focus-visible` outline), and initial
focus reliably moves to the first focusable or `[autofocus]` element also
when the modal is open at mount. Previously the mount-time open path ran the
focus search before the slotted csc-ui elements had upgraded (their shadow
roots were still empty), so focus always fell back to the dialog itself.
