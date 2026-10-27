const s=`
<c-text-field
  label="Hint and error "
  hint="This is a hint message"
  :valid="!hasErrors"
  validation="This is an error message"
  required
/>

<c-switch v-model="hasErrors" v-control>Toggle error status</c-switch>
`;export{s as default};
