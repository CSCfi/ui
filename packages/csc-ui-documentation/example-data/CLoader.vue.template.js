
/**
 * Examples for CLoader.vue.
 * Automatically generated at 10/2/2023, 8:59:00 AM.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */

export const basic = `
<c-card>
  <c-loader v-if="loader">Loading...</c-loader>

  <c-card-title>Loader card</c-card-title>

  <c-card-content>
    Click start to show a loader for 5 seconds
  </c-card-content>

  <c-card-actions>
    <c-button @click="startLoader()">Start</c-button>
  </c-card-actions>
</c-card>`;

export const delayed = `
<c-card>
  <c-loader v-if="loader" contentdelay="2">
    This loader will disappear soon
  </c-loader>

  <c-card-title>Loader card</c-card-title>

  <c-card-content>
    Click start to show a loader with a delayed explanation text
  </c-card-content>

  <c-card-actions>
    <c-button @click="startLoader()">Start</c-button>
  </c-card-actions>
</c-card>`;
