const t=`
<c-otp-input
  id="automatic-submit-example"
  v-model="otp"
  v-control
  hint="Please enter your one time password"
  @completion="onComplete($event)"
/>

<teleport to="body">
  <c-toasts ref="toasts" vertical="top" />
</teleport>
`;export{t as default};
