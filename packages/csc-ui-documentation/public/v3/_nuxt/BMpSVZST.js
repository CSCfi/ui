const e=`
<c-swiper v-model="currentTab" v-control>
  <c-swiper-tab
    v-for="(tab, index) in tabs"
    :key="tab.value"
    :active="selectedTab === tab.value"
    :label="tab.label"
    :value="tab.value"
    :disabled="tab.disabled"
    @click="!tab.disabled && selectTab(tab)"
    @keyup.enter="!tab.disabled && selectTab(tab)"
  >
    <c-icon slot="icon" :path="mdiServer" />

    Lorem ipsum dolor sit amet, consectetur adipiscing elit.

    <span v-if="index % 2 === 0">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </span>
  </c-swiper-tab>
</c-swiper>

<p class="mt-3">Focused tab: {{ currentTab }}</p>

<p class="mt-2">Selection: {{ selectionText }}</p>
`;export{e as default};
