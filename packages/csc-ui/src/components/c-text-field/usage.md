A text field for a single line of text, or several lines under `rows`, with a label, a hint and an error message.

## Value

The value is the text in the field as a string. Bind it with `v-model`, or
listen for `update:value`:

```vue
<c-text-field v-model="name" label="Name" />
```

`type` maps to the native input type: `password` adds a toggle that reveals
the text, and `number` honours `min`, `max` and `step`. Setting `rows` above
`1` renders a textarea.

## Input mask

`mask` makes the typed text follow a pattern, such as a phone number, a postal
code or an account number. In the pattern, `#` stands for a digit, `A` for a
letter and `*` for a letter or a digit; every other character is a literal the
field inserts itself, and `\` makes the next character a literal (`\#`).

```vue
<c-text-field v-model="phone" label="Phone" mask="+358 ## ### ####" />
```

| Token | Takes             |
| ----- | ----------------- |
| `#`   | A digit           |
| `A`   | A letter          |
| `*`   | A letter or digit |
| `\x`  | `x` as a literal  |
| `[…]` | Optional section  |

Characters a token does not take are dropped as they are typed or pasted.
A literal appears only once the next character arrives, so typing `40` into
the mask above shows `+358 40`, an empty field stays empty, and Backspace
never gets stuck on a separator. Typing or pasting the literals yourself
works too: `+358401234567` fills the field the same way. A mask of digits
only brings up the numeric keyboard.

While the user types, a faint **mask guide** behind the text shows the rest
of the pattern — `+358 __ ___ ____` in an empty field, `_ ___ ____` once
`4` is typed — so it is clear what is still asked for. It is never part of
the value and screen readers do not announce it; describe the format in the
`hint` for them. It shows wherever a placeholder would: while the field is
focused or holds text, and always with `label-on-top` or without a `label`.
A `placeholder` replaces the guide — set one to write your own example
(`placeholder="+358 40 123 4567"`); the `mask-guide` part styles the guide.

### Optional sections

A pattern may end in **optional sections** in square brackets for formats of
varying length. Every token inside may be left unfilled, one by one, and the
literals inside appear only when a character after them is typed:

```vue
<!-- 5 to 12 digits after the country code -->
<c-text-field v-model="phone" label="Phone" mask="+358 #####[#######]" />

<!-- A ZIP code with an optional -#### -->
<c-text-field v-model="zip" label="ZIP code" mask="#####[-####]" />
```

The field is complete once every token outside the sections is filled, and
the guide draws only those: `+358 _____` in the empty phone field, nothing
once five digits are in. A section may stop part-way (`12345-67` is complete),
so check the length of `unmaskedValue` where an all-or-nothing part matters.

Sections come last — after the first one only further sections may follow
(`## ###[ ####][###]`) — and do not nest. A mask that breaks these rules is
ignored with a console warning, and the field takes any text. Write `\[` and
`\]` for literal brackets.

A phone mask with fixed groups fits only some numbers: Finnish numbers group
differently by area code (`+358 9 …`, `+358 40 …`), so an ungrouped run
like `+358 #####[#######]` suits them all.

The value is the text as shown, literals included — `'+358 40 123 4567'`.
The read-only `unmaskedValue` property holds only the characters that fill
the tokens (`'401234567'`). Give the field masked values: a value set from
code is shown through the mask, but the field does not rewrite or emit it.

Text that leaves some token unfilled is kept as typed. The read-only
`maskComplete` property tells whether every token is filled, and a field
holding such partial text exposes the `incomplete` custom state. The field
shows no error of its own; whether an incomplete value is an error is the
consumer's validation:

```vue
<c-text-field
  v-model="phone"
  :error-message="error"
  :valid="!error"
  label="Phone"
  mask="+358 ## ### ####"
  @change="
    error = $event.target.matches(':state(incomplete)')
      ? 'Enter the whole number'
      : ''
  "
/>
```

A mask applies to a single-line field of type `text`, `tel` or `search`;
other types (and a textarea) ignore it.
