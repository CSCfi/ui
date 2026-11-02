const t=`
<c-list>
  <c-list-item :active="selections[0]">
    <c-checkbox slot="pre" v-model="selections[0]" v-control hide-details />

    <c-list-item-title>Address</c-list-item-title>

    Example street 12
  </c-list-item>

  <c-list-item :active="selections[1]">
    <c-checkbox slot="pre" v-model="selections[1]" v-control hide-details />

    <c-list-item-title>Phone</c-list-item-title>

    +358 40 1234 123
  </c-list-item>

  <c-list-item :active="selections[2]">
    <c-checkbox slot="pre" v-model="selections[2]" v-control hide-details />

    <c-list-item-title>Email</c-list-item-title>

    example.person@example.com
  </c-list-item>
</c-list>
`;export{t as default};
