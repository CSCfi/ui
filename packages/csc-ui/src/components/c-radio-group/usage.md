A radio group is a set of mutually exclusive choices where exactly one can
be selected, authored as slotted `c-radio` children. Give the group a
`label` so the choice it represents is named for every user, and a `hint`
describing how to answer.

## Authoring the options

Each option is a `<c-radio value="...">` whose default slot is its label —
keep the label text (or richer markup) inside the radio so it stays
clickable and is announced with the control:

```html
<c-radio-group label="Subscription plan" value="free">
  <c-radio value="free">Free</c-radio>
  <c-radio value="paid">Paid</c-radio>
</c-radio-group>
```

The radios may sit at any depth inside the default slot, so custom layouts
are plain markup — wrap each radio in whatever layout element the design
needs:

```html
<c-radio-group label="Subscription plan" value="free">
  <div class="card"><c-radio value="free">Free</c-radio></div>
  <div class="card"><c-radio value="paid">Paid</c-radio></div>
</c-radio-group>
```

Text placed *next to* a radio instead of inside it renders, but is not
click-associated or announced — put the label content in the radio's slot.

## Value

The group's `value` is the selected radio's `value`, matched by strict
string equality; the group holds string values only. Selection is expressed
solely through the group — radios carry no checked state of their own.
Giving two radios the same `value` is a consumer error: every matching
radio will show as checked.

In Vue, bind with a plain `v-model`. The group also emits its radios'
bubbling `change` events onward, with the selected `c-radio` as the
event target.

## Label

The `label` prop names the group; when richer label content is needed, use
the `label` slot instead (the prop wins when both are set). The default
slot is exclusively the radios' home — loose text there is not treated as a
label.

## Validation

Validation is your job: set `valid` to `false` and supply an
`error-message` explaining why. While invalid without an `error-message`,
the `hint` keeps rendering as a hint. The message area reserves its height
(unless `hide-details`), so an error appearing at runtime doesn't shift the
layout.

## Accessibility

The group is announced as a `radiogroup` named by its label. Keyboard
behavior follows the native pattern: Tab moves into the group (onto the
checked radio, or the first enabled one) and out of it in one stop; the
arrow keys move between radios, selecting as they go, wrapping at the ends
and skipping disabled radios; Space selects the focused radio. Enter is
left to the surrounding form.
