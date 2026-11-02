const e=`
<c-swiper v-model="currentTabItem" v-control>
  <c-swiper-tab
    v-for="(tab, index) in tabsItems"
    :key="tab.value"
    :active="selectedTabItem === tab.value"
    :label="tab.label"
    :value="tab.value"
    :disabled="tab.disabled"
    @click="!tab.disabled && selectTabItem(tab)"
    @keyup.enter="!tab.disabled && selectTabItem(tab)"
  >
    <c-icon slot="icon" :path="mdiServer" />

    Lorem ipsum dolor sit amet, consectetur adipiscing elit.

    <span v-if="index % 2 === 0">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </span>
  </c-swiper-tab>
</c-swiper>

<p class="mt-3">Focused tab: {{ currentTabItem }}</p>

<p class="mt-2">Selection: {{ selectionItemText }}</p>
`;export{e as default};
