const e=`

<c-row gap="8" nowrap align="start">
  <c-autocomplete
    ref="autocomplete"
    v-model="selection"
    v-control
    style="flex: 1"
    label="Countries"
    :query="query"
    :items-per-page="10"
    :loading="loading"
    @changeQuery="onQueryChange"
  >
    <c-icon slot="pre" :path="mdiEarth" size="16" />

    <c-option
      v-for="(item, index) in filteredItems"
      :key="item.value"
      :value="item.value"
      :name="item.name"
      :disabled="index === 3"
    >
      <c-row align="center" gap="16" nowrap>
        <c-tag active flat>{{ item.value }}</c-tag>

        <c-option-value>{{ item.name }}</c-option-value>
      </c-row>
    </c-option>
  </c-autocomplete>

  <c-button :disabled="!selection" @click="add()" @keyup.enter="add()">
    Add
  </c-button>
</c-row>

<c-tags>
  <c-tag v-for="country in selections" :key="country">
    {{ country }}
  </c-tag>
</c-tags>
`;export{e as default};
