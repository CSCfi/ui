
/**
 * Examples for CModal.vue.
 * Automatically generated at 10/2/2023, 8:59:00 AM.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */

export const basic = `
<c-button @click="basicModal = true">Open modal</c-button>

<c-modal v-model="basicModal" v-control>
  <c-card>
    <c-card-title>Modal</c-card-title>

    <c-card-content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
      eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
      minim veniam, quis nostrud exercitation ullamco laboris nisi ut
      aliquip ex ea commodo consequat.
    </c-card-content>

    <c-card-actions>
      <c-button @click="basicModal = false">Close</c-button>
    </c-card-actions>
  </c-card>
</c-modal>`;

export const customWidth = `
<c-row gap="8">
  <c-button @click="numericWidthModal = true">
    Open modal with a numeric width
  </c-button>

  <c-button @click="stringWidthModal = true">
    Open modal with a width defined as string
  </c-button>
</c-row>

<c-modal v-model="numericWidthModal" v-control width="400">
  <c-card>
    <c-card-title>Modal (400px)</c-card-title>

    <c-card-content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
      eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
      minim veniam, quis nostrud exercitation ullamco laboris nisi ut
      aliquip ex ea commodo consequat.
    </c-card-content>

    <c-card-actions>
      <c-button @click="numericWidthModal = false">Close</c-button>
    </c-card-actions>
  </c-card>
</c-modal>

<c-modal v-model="stringWidthModal" v-control width="60%">
  <c-card>
    <c-card-title>Modal (60%)</c-card-title>

    <c-card-content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
      eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
      minim veniam, quis nostrud exercitation ullamco laboris nisi ut
      aliquip ex ea commodo consequat.
    </c-card-content>

    <c-card-actions>
      <c-button @click="stringWidthModal = false">Close</c-button>
    </c-card-actions>
  </c-card>
</c-modal>`;

export const dismissable = `

<c-button @click="dismissableModal = true">Open dismissable modal</c-button>

<c-modal v-model="dismissableModal" v-control dismissable>
  <c-card fullscreen>
    <c-card-title>Dismissable</c-card-title>

    <c-card-content>
      <div>This modal can be dismissed by clicking outside the content</div>

      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
      eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
      minim veniam, quis nostrud exercitation ullamco laboris nisi ut
      aliquip ex ea commodo consequat.
    </c-card-content>

    <c-card-actions>
      <c-button @click="dismissableModal = false">Close</c-button>
    </c-card-actions>
  </c-card>
</c-modal>`;
