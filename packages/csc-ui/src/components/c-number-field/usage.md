A field for a number — an integer, or one with decimals — shown with thousands separators as it is typed.

## Value

The value is a number, or `null` while the field holds no digit. What the
field shows is grouped text — `1 234 567,89` — but the value is always the
plain number (`1234567.89`), so it needs no parsing. Bind it with `v-model`,
or listen for `change`:

```vue
<c-number-field v-model="amount" label="Amount" />
```

The value follows the text on every keystroke: typing `1234,` gives `1234`,
a lone `-` gives `null`. Only typing emits; setting `value` shows the number
without emitting it.

Unlike `c-text-field type="number"`, the native number input, the field shows
separators, never shows spin buttons, and does not change the number on a
scroll or an arrow key.

## Separators

The thousands and decimal separators follow the page's `lang`: a space and
`,` under `lang="fi"`, `,` and `.` under `lang="en"`. Set `group-separator`
and `decimal-separator` to fix them for one field, or for the whole app with
`applyDefaults({ 'c-number-field': { groupSeparator: ' ', decimalSeparator: ',' } })`.

The field inserts the group separators itself, and typed or pasted ones are
ignored. Either `.` or `,` typed is read as the decimal separator — unless
it is the group separator — so the decimal key of any keyboard works. A
pasted `1,234.56` or `1.234,56` reads as `1234.56` either way.

## Decimals

`decimals` is the most fraction digits the field takes. By default it is
`0`, an integer field that ignores the decimal key:

```vue
<c-number-field
  v-model="price"
  :decimals="2"
  fixed-decimals
  label="Price"
  min="0"
>
  <span slot="post">€</span>
</c-number-field>
```

Typing never pads the fraction. With `fixed-decimals` the field pads it to
exactly `decimals` digits when the user leaves it — `12,5` shows as `12,50` —
while the value stays `12.5`. A value set with more fraction digits than
`decimals` is shown rounded.

The integer part takes up to 15 digits, the most a JavaScript number holds
exactly.

## Range

`min` and `max` never change what the user typed. A number outside them is
kept and emitted, and the host exposes the `out-of-range` custom state and a
read-only `outOfRange` property. The field shows no error of its own:

```vue
<c-number-field
  v-model="count"
  :error-message="error"
  :valid="!error"
  label="Participants"
  max="50"
  min="1"
  @change="error = $event.target.outOfRange ? 'Enter 1 to 50' : ''"
/>
```

With `min` at `0` or above, the minus key is ignored. Such a field also asks
for the numeric keyboard on a phone (a decimal one when `decimals` is set);
a field that takes negative numbers keeps the regular keyboard, because
numeric keyboards on iOS have no minus key.

Use the `pre` and `post` slots for a currency sign or a unit.
