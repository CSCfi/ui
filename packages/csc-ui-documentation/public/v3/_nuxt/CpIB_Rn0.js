const c=`
<c-card style="max-width: 520px">
  <c-card-title>Mobile labels</c-card-title>

  <c-card-content>
    <c-steps v-model="step" v-control>
      <c-step>Step number 1</c-step>

      <c-step>Step number 2</c-step>

      <c-step>Step number 3</c-step>

      <c-step>Step number 4</c-step>
    </c-steps>
  </c-card-content>

  <c-card-actions justify="center">
    <c-icon-button :disabled="step === min" @click="move('<')">
      <c-icon :path="mdiChevronLeft" />
    </c-icon-button>

    <c-icon-button :disabled="step === max" @click="move('>')">
      <c-icon :path="mdiChevronRight" />
    </c-icon-button>
  </c-card-actions>
</c-card>
`;export{c as default};
