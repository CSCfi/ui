const e=`
<c-switch v-model="singleSelection" v-control class="mb-4">
  Single selection
</c-switch>

<c-data-table
  id="complex"
  :data="data"
  :headers="headers"
  :single-selection="singleSelection"
  horizontal-scrolling
  selectable
/>
`;export{e as default};
