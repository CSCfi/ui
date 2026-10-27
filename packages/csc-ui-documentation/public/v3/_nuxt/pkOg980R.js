const t=`
<c-steps v-model="step">
  <c-step>Step number 1</c-step>

  <c-step>Step number 2</c-step>

  <c-step>Step number 3</c-step>

  <c-step>Step number 4</c-step>
</c-steps>

<c-row gap="4">
  <c-icon-button :disabled="step === min" @click="move('<')">
    <c-icon :path="mdiChevronLeft" />
  </c-icon-button>

  <c-icon-button :disabled="step === max" @click="move('>')">
    <c-icon :path="mdiChevronRight" />
  </c-icon-button>
</c-row>
`;export{t as default};
