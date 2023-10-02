
/**
 * Examples for CTags.vue.
 * Automatically generated at 10/2/2023, 2:21:28 PM.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */

export const basic = `
<c-tags>
  <c-tag :active="active[0]" @click="toggleActive(0)">One</c-tag>
  <c-tag :active="active[1]" @click="toggleActive(1)">Two</c-tag>
  <c-tag :active="active[2]" @click="toggleActive(2)">Three</c-tag>
</c-tags>`;

export const flat = `
<c-tags>
  <c-tag flat>One</c-tag>
  <c-tag flat>Two</c-tag>
  <c-tag flat>Three</c-tag>
</c-tags>`;

export const closeable = `
<c-tags>
  <c-tag
    v-for="tag in tags"
    :key="tag.id"
    :active="tag.active"
    closeable
    @click="tag.active = !tag.active"
    @close="removeTag(tag.id)"
  >
    {{ tag.label }}
  </c-tag>
</c-tags>

<div>
  <c-button @click="resetTags()">Reset tags</c-button>
</div>`;

export const badges = `
<c-tags>
  <c-tag badge="0">Orange</c-tag>
  <c-tag badge="4" active>Pineapple</c-tag>
  <c-tag badge="2" closeable active>Banana</c-tag>
  <c-tag badge="1" closeable active>Apple</c-tag>
  <c-tag badge="12" closeable>Strawberry</c-tag>
</c-tags>`;

export const fit = `
<c-tags>
  <c-tag fit>One</c-tag>
  <c-tag fit active>Two</c-tag>
  <c-tag fit>Three</c-tag>
</c-tags>`;

export const block = `
<c-tags>
  <c-tag block>One</c-tag>
  <c-tag block active>Two</c-tag>
  <c-tag block>Three</c-tag>
</c-tags>`;
