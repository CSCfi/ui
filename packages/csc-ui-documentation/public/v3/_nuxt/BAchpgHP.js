const e=`
<c-radio-group
  v-model="selectedInlineValue"
  v-control
  :items="items"
  inline
  hide-details
>
  Inline radio buttons
</c-radio-group>

<p>Selected: {{ selectedInlineValue }}</p>
`;export{e as default};
