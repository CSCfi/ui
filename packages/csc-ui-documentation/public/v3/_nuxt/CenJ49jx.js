const e=`

<c-row gap="8">
  <c-autocomplete
    id="listOfCountriesBasic"
    v-model="selection"
    v-control
    label="Countries"
    placeholder="Choose a country"
    :items="filteredItems"
    :query="query"
    style="flex: 1"
    hide-details
    return-object
    @changeQuery="onQueryChange"
  >
    <c-icon slot="pre" :path="mdiEarth" size="16" />
  </c-autocomplete>

  <c-button @click="onAddTag()" @keyup.enter="onAddTag()">Add</c-button>
</c-row>

<c-tags v-if="tags.length" class="mt-3">
  <c-tag
    v-for="(tag, index) of tags"
    :key="index"
    closeable
    @click="onRemoveTag(index)"
    @keyup.enter="onRemoveTag(index)"
  >
    {{ tag.name }}
  </c-tag>
</c-tags>
`;export{e as default};
