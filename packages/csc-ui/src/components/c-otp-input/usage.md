A one-time-code field: a row of single-digit boxes, filled in order as the
user types or pastes a code, under a group label and above a hint or error
message.

Set `length` to the number of digits (six by default), name the field with
`label`, and listen for `completion` to act as soon as every box is filled:

```vue
<c-otp-input
  v-model="code"
  :error-message="error"
  :invalid="!!error"
  hint="Enter the 6-digit code we sent you"
  label="Verification code"
  @completion="verify"
/>
```

## When to use

- Entering a short numeric code sent by text message or email, or shown by an
  authenticator app.
- Not for other numbers — use `c-number-field`. For a code with letters or a
  fixed format, use `c-text-field` with a `mask`.

## Value

The value is the digits entered so far, joined into one string: `'12'` after
two digits, `''` when none. It is the same string everywhere — the `value`
property, `update:value` and `change`. Every change fires `update:value` and
`input`; `change` fires when the code is committed, on Enter or when focus
leaves the boxes after a change (moving between the boxes does not count).

The digits run from the first box up to the first empty one: clearing a box in
the middle ends the value there, and the digits after it count again once it
is filled.

`completion` fires with the whole code whenever a change leaves every box
filled, so editing a complete code fires it again with the new code.

Setting `value` fills the boxes from the first one and fires nothing; set it
to `''` to clear them.

## Typing and pasting

Each box takes one digit and brings up the numeric keyboard on a phone.
Typing a digit moves focus to the next box, and focusing a box selects its
digit, so typing replaces it. Backspace in an empty box moves back to the
previous one. Anything but a digit — a letter, a space, punctuation — is
dropped as it is typed.

Pasting a code into the first box fills the boxes in order, up to `length`
digits, and moves focus to the last box filled. Spaces and line breaks in the
pasted text are skipped; a paste with any other character that is not a digit
is ignored. The boxes opt out of browser and password-manager autofill.

## Label and validation

The `label` prop names the group; for richer label content, put it in the
default slot instead (the prop wins when both are set). `required` adds the
required marker to the label; enforcing it is your form logic's job.

Validation is yours too: set `invalid` and an `error-message` explaining why.
The boxes take the error colour and the message replaces the `hint`. While
invalid without an `error-message`, the boxes are still coloured but the hint
keeps rendering as a hint. Checking the code on `completion` or `change` fits
most flows. `hide-details` hides the hint and the error message.

## Accessibility

- The boxes form a `role="group"` named by the label. Without a `label` or
  slotted label the group has no name, so always give it one.
- Each box is its own input and Tab stop, labelled with its position ("Enter
  code - digit number - 2 of 6") and described by the hint or error message.
  `required` marks every box `aria-required`, and `invalid` every box
  `aria-invalid`.
- About 1.4 seconds after the digits stop changing, a polite live region reads
  what has been entered ("Currently entered - 1 - 2 - 3"), prefixed with the
  error message while one is shown.
- The box labels and the announcement are fixed English strings.
- `autofocus` focuses the first box when the field mounts. Use it where
  entering the code is the page's only task.

## Customization

Restyle via CSS parts: `::part(root)` wraps the label, the boxes and the
message; `::part(label)` is the group label; `::part(digits)` is the row of
boxes; `::part(input)` is each box; `::part(message)` is the hint or error
message.

```css
c-otp-input::part(input) {
  font-family: monospace;
}
```
