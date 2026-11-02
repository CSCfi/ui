const e=`
<c-radio-group
  v-model="selectedItem"
  v-control
  :items="items"
  hide-details
  return-object
>
  Example radio buttons with a
  <c-link underline>link</c-link>
  in the label
</c-radio-group>

<p class="mb-6">Selected: {{ selectedItem }}</p>

<c-radio-group
  v-model="selectedItemValue"
  v-control
  :items="items"
  label="Label with a prop and return value"
  hide-details
/>

<p>Selected: {{ selectedItemValue }}</p>
`;export{e as default};
