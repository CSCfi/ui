const t=`
<c-tags>
  <c-tag
    v-for="tag in tags"
    :key="tag.id"
    :active="tag.active"
    closeable
    @click="tag.active = !tag.active"
    @keyup.enter="tag.active = !tag.active"
    @close="onRemoveTag(tag.id)"
  >
    {{ tag.label }}
  </c-tag>
</c-tags>

<div>
  <c-button @click="onResetTags()">Reset tags</c-button>
</div>
`;export{t as default};
