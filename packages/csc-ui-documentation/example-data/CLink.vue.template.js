
/**
 * Examples for CLink.vue.
 * Automatically generated at 10/2/2023, 2:21:28 PM.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */

export const basic = `
<c-link href="https://csc.fi">Default link</c-link>
<c-link href="https://csc.fi" underline>Underlined link</c-link>`;

export const variants = `
<c-link href="https://csc.fi" style="--c-link-color: var(--c-warning-600)">
  Link with custom color
</c-link>

<c-link href="https://csc.fi" weight="400">Link with custom weight</c-link>

<c-link href="https://csc.fi" target="_blank">
  Link with icon
  <c-icon
    :path="mdiOpenInNew"
    color="var(--c-primary-600)"
    size="18"
  ></c-icon>
</c-link>

<c-link href="https://csc.fi" color="error" target="_blank">
  <c-icon :path="mdiOpenInNew" size="18"></c-icon>
  Link with icon in front
</c-link>`;
