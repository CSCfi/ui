
/**
 * Examples for CButton.vue.
 * Automatically generated at 10/2/2023, 8:59:00 AM.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */

export const variants = `
<c-button>Default</c-button>
<c-button outlined>Outlined</c-button>
<c-button ghost>Ghost</c-button>
<c-button text>Text</c-button>
<c-button danger>Danger</c-button>`;

export const loading = `
<c-button loading>Default</c-button>
<c-button loading outlined>Outlined</c-button>
<c-button loading ghost>Ghost</c-button>
<c-button loading text>Text</c-button>
<c-button loading danger>Danger</c-button>`;

export const disabled = `
<c-button disabled>Default</c-button>
<c-button disabled outlined>Outlined</c-button>
<c-button disabled ghost>Ghost</c-button>
<c-button disabled text>Text</c-button>
<c-button disabled danger>Danger</c-button>`;

export const icon = `
<c-button>
  <c-icon slot="icon" :path="mdiLogin"></c-icon>
  Login
</c-button>

<c-button ghost>
  <c-icon slot="icon" :path="mdiLogout"></c-icon>
  Logout
</c-button>

<c-button disabled>
  <c-icon slot="icon" :path="mdiLogin"></c-icon>
  Login
</c-button>

<c-button text icon-end>
  <c-icon slot="icon" :path="mdiArrowRight"></c-icon>
  Next
</c-button>

<c-button danger>
  <c-icon slot="icon" :path="mdiDelete"></c-icon>
  Delete
</c-button>`;
