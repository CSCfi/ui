const t=`
<div>
  <c-otp-input
    id="manual-submit-example"
    ref="otpInput"
    v-model="otp"
    v-control
    hint="Please enter your one time password"
    :length="5"
    :valid="isValid"
    :validation="errorMessage"
  />

  <c-row gap="8">
    <c-button outlined @click="onReset()" @keyup.enter="onReset()">
      Reset
    </c-button>

    <c-button
      @click="onManualCompletion()"
      @keyup.enter="onManualCompletion()"
    >
      Submit
    </c-button>
  </c-row>
</div>

<teleport to="body">
  <c-toasts ref="toasts" vertical="bottom" />
</teleport>
`;export{t as default};
