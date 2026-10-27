A step indicator for a multi-step flow: a row of `c-step` dots joined by lines, with the steps before the current one checked off and the current one ringed.

Set `value` to the number of the current step, counting from 1 (`value="3"` reads as 3). The steps before it show a check mark and the lines up to it fill in; a `value` one past the last step shows every step complete. The indicator only displays progress: its steps are not clickable and it fires no events, so move between steps with the flow's own controls and update `value` from them.

```vue
<c-steps :value="step">
  <c-step>Choose resources</c-step>
  <c-step>Billing details</c-step>
  <c-step>Review</c-step>
</c-steps>

<c-button @click="step++">Next</c-button>
```

Render the full list of steps up front: `c-steps` inserts the connecting lines between your `c-step` elements, in your own DOM, once, when it mounts.

## When to use

- Showing where the user is in a fixed sequence — a multi-page form, an order flow.
- For sections the user switches between freely, use `c-tabs`.
- For a completion percentage, use `c-progress-bar`.

## Narrow containers

When the step labels no longer fit side by side within the element's own width, the steps shrink to bare dots joined by lines and the current step's label is shown below the row. The full layout returns once the labels fit again.

## Accessibility

The row of dots is hidden from assistive technology. In its place `c-steps` carries a one-sentence summary — for example "Steps, step 2 of 4. Billing details. 1 step marked as completed." — and the element is a Tab stop, so a screen-reader user can reach it. The summary is not a live region: a change of `value` is not announced, so when the step changes, move focus to the new step's content, such as its heading.

## Customization

`c-steps::part(root)` is the row of steps, and `::part(label)` the current step's label shown below it in the narrow layout. Each step exposes `::part(root)` (the step's box, its dot over its label), `::part(indicator)` around the dot, `::part(dot)` (an incomplete step's circle), `::part(complete)` (a complete step's filled circle with its check mark) and `::part(label)`.

The current step's ring, complete steps and the lines leading up to the current step use the primary role, and upcoming steps and their lines the `border-strong` role; override the tokens to re-theme.
