A stack of collapsible sections, each a `c-accordion-item` whose header button shows or hides the content beneath it.

Give every item a `heading` and a `value`, and put its content in the item's default slot. The accordion's `value` names the expanded item.

```vue
<c-accordion v-model="expanded">
  <c-accordion-item heading="Project billing" value="billing">
    <p>Billing units are deducted monthly based on the resources in use.</p>
  </c-accordion-item>

  <c-accordion-item heading="Members and roles" value="members">
    <p>Invite members by email and assign them a role in the project.</p>
  </c-accordion-item>
</c-accordion>
```

## When to use

- To shorten a page of related sections the user reads one or a few at a time: questions and answers, groups of settings, the details behind a summary.
- For switching between views of the same subject, use `c-tabs`, which shows one panel at a time.
- Not for content the user must not miss or needs to compare side by side: collapsed content is easy to overlook.

## Value

`value` is the expanded item's `value`, or `null` when every item is collapsed. Bind it with `v-model`, or set it and listen for `change`, which carries the new value each time the user toggles an item. Setting `value` from code expands and collapses items without firing an event.

Values compare strictly: an item `value` written as an attribute is a string, so `value="2"` does not match the number `2`. An item without a `value` never expands.

Items must be direct children of the accordion; an item wrapped in another element is not expanded by it.

## One or several expanded

By default one item is expanded at a time: expanding an item collapses the one that was open. With `multiple`, items open and close independently and `value` is an array of the expanded items' values. Give a `multiple` accordion an array from the start, since a single value is dropped at the first toggle; in plain HTML set it through the `value` property, because the attribute carries a single value.

`mandatory` keeps the last expanded item open: its header stops responding and reports itself disabled until another item is expanded. It never expands an item by itself, so give a `mandatory` accordion an initial `value`.

## Headings and icons

`heading` sets the header's text. For richer content, such as a count beside the heading, use the item's `heading` slot, which replaces the prop. The `icon` slot shows an icon before the heading. Both slots render inside the header button, so they must not hold links, buttons or other interactive content.

## Keyboard

Each header is a native button: Tab moves through the headers and the content of the expanded items, and Enter or Space toggles the focused header. A collapsed item's content is inert, so focus never lands in a hidden section.

## Accessibility

The header button carries `aria-expanded` and `aria-controls`, and the content is a region labelled by its header. Headers are buttons, not heading elements, so items do not appear in the page's heading outline.

## Customization

Collapsed items stack flush into one accordion frame with a shared hairline border and rounded ends. An expanded item lifts out of the frame with its own primary outline, a faint primary wash, an accent bar on its leading edge and space above and below. `outlined` adds a primary ring inside the expanded items' outline.

`c-accordion::part(root)` is the column holding the items. Each item has `::part(root)` (its share of the frame, and the lifted box while expanded), `::part(header)` (the toggle row), `::part(indicator)` (the chevron) and `::part(content)` (the card around the slotted content). The `expanded` custom state selects an expanded item:

```css
c-accordion-item:state(expanded)::part(header),
c-accordion-item:state(expanded)::part(indicator) {
  color: var(--c-secondary);
}
```
