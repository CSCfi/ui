const o=`
<c-radio-group v-model="selection" v-control>
  Radio Group with c-radio elements
  <c-button outlined size="small" class="ml-3">Read more</c-button>

  <c-radio value="one">Radio one</c-radio>

  <c-radio value="two" checked>Radio two</c-radio>

  <c-radio value="three" disabled>Radio three</c-radio>
</c-radio-group>

<p class="mb-6">Selected: {{ selection }}</p>

<c-radio-group
  v-model="selection2"
  v-control
  label="Another Radio Group with c-radio elements"
>
  <c-radio value="one" checked>Radio one</c-radio>

  <c-radio value="two">Radio two</c-radio>

  <c-radio value="three">Radio three</c-radio>
</c-radio-group>

<p class="mb-6">Selected: {{ selection2 }}</p>
`;export{o as default};
