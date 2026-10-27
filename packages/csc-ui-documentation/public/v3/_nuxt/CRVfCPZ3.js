const e=`
<c-select
  v-model="value"
  v-control
  label="Country"
  placeholder="Choose country..."
  style="max-width: 360px"
  hide-details
  return-object
  :items="items"
  clearable
/>

<p class="mt-3">Selected country: {{ value || 'None' }}</p>
`;export{e as default};
