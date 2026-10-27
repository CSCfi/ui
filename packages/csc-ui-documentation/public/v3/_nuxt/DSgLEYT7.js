const e=`
<c-radio-group
  v-model="selectedInlineValue"
  v-control
  :items="items"
  :valid="isValid"
  hint="Please select a value"
  validation="This is a required value"
>
  Inline radio buttons
</c-radio-group>

<c-switch v-model="isValid" v-control>Toggle validity</c-switch>
`;export{e as default};
