const t=`
<div>
  <c-tags>
    <c-tag v-for="country in filteredCountries" :key="country">
      {{ country }}
    </c-tag>
  </c-tags>

  <c-pagination v-model="options" v-control hide-details simple />
</div>

<p>Programmatically change pagination values:</p>

<c-row gap="8">
  <c-button @click="setPageToTwo()">Page 2</c-button>

  <c-button @click="showFiftyItemsPerPage()">50 items per page</c-button>
</c-row>
`;export{t as default};
