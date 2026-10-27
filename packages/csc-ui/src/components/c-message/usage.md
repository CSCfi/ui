A single line of text under a form control: a neutral hint, or an error
message that takes its place while the control is invalid.

The library's form fields draw this line themselves from their own `hint`,
`error-message` and `invalid` props, so a field never needs a `c-message`
beside it. Use `c-message` under a control that has no message line of its
own, such as a native input or a control you build, to give it the same hint
and error presentation:

```html
<c-message hint="Use your organization email address"></c-message>
<c-message error-message="Email is required" invalid></c-message>
```

## When to use

- Under a control of your own that needs a hint or an error message matching
  the library's fields.
- Not under a `c-*` field — set the field's `hint` and `error-message`
  instead.
- Not for the status of a page or section — use `c-alert`; for transient
  feedback on an action, use `c-toasts`.

## Hint and error message

`hint` shows in muted text whenever it is set. While `invalid` is set and
`error-message` is not empty, the error message replaces the hint, in the
error colour and with an error icon. `invalid` without an `error-message`
keeps showing the hint as a hint. Deciding validity and wording the message
stay yours. When the text changes, the new one slides in.

With neither a hint nor an error message to show, the element renders nothing
and takes no height. A field's own message area keeps its height instead, so
an error appearing there does not shift the layout; reserve the space
yourself where that matters.

## Accessibility

The text carries a visually hidden "Hint:" or "Error:" prefix (fixed English
strings), and the icon is hidden from assistive technology. `c-message` is
not a live region and does not associate itself with any control, so a new
error message is not announced; if it must be heard when it appears, announce
it from your own live region.

## Customization

`::part(root)` is the message row. Its colours come from the muted
on-surface role for the hint and the error role for the error message. It
has the same 12px inline padding as the message line under the library's
fields; remove it to align with a control that has none:

```css
c-message::part(root) {
  padding-inline: 0;
}
```
