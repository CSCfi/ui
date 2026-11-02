const t=`
<c-tags>
  <c-tag v-for="country in filteredCountries" :key="country">
    {{ country }}
  </c-tag>
</c-tags>

<c-pagination v-model="options" v-control />
`;export{t as default};
