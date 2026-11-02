const e=`
<c-row gap="8">
  <c-autocomplete
    v-model="selection"
    v-control
    label="Countries"
    hide-details
    :items="filteredItems"
    :query="query"
    :items-per-page="10"
    @changeQuery="onQueryChange($event)"
  >
    <c-icon slot="pre" :path="mdiEarth" size="16" />
  </c-autocomplete>

  <c-button @click="onAddTag()" @keyup.enter="onAddTag()">Add</c-button>
</c-row>

<p style="margin: 16px 0 0">
  Added values:
  <c-tag flat>{{ tags.length }}</c-tag>
</p>

<ul>
  <li v-for="tag in tags" :key="tag">
    {{ tag }}
  </li>

  <li v-if="!tags.length">No added values</li>
</ul>
`;export{e as default};
