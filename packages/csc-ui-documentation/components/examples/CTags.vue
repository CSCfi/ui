<template>
  <component-example name="basic">
    <template #title>Basic usage</template>

    <c-tags>
      <c-tag :active="active[0]" @click="toggleActive(0)">One</c-tag>
      <c-tag :active="active[1]" @click="toggleActive(1)">Two</c-tag>
      <c-tag :active="active[2]" @click="toggleActive(2)">Three</c-tag>
    </c-tags>
  </component-example>

  <component-example name="flat">
    <template #title>Basic usage</template>

    <c-tags>
      <c-tag flat>One</c-tag>
      <c-tag flat>Two</c-tag>
      <c-tag flat>Three</c-tag>
    </c-tags>
  </component-example>

  <component-example name="closeable" rows>
    <template #title>Closeable</template>

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
    </div>
  </component-example>

  <component-example name="badges" rows>
    <template #title>Badges</template>

    <c-tags>
      <c-tag badge="0">Orange</c-tag>
      <c-tag badge="4" active>Pineapple</c-tag>
      <c-tag badge="2" closeable active>Banana</c-tag>
      <c-tag badge="1" closeable active>Apple</c-tag>
      <c-tag badge="12" closeable>Strawberry</c-tag>
    </c-tags>
  </component-example>

  <component-example name="fit" rows>
    <template #title>Fit</template>

    <c-tags>
      <c-tag fit>One</c-tag>
      <c-tag fit active>Two</c-tag>
      <c-tag fit>Three</c-tag>
    </c-tags>
  </component-example>

  <component-example name="block" rows>
    <template #title>Block</template>

    <c-tags>
      <c-tag block>One</c-tag>
      <c-tag block active>Two</c-tag>
      <c-tag block>Three</c-tag>
    </c-tags>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|basic
const active = ref([false, true, false]);

const toggleActive = (index: number) => {
  active.value[index] = !active.value[index];
};
// @example-end

// @example-start|closeable
const createTags = () => {
  return [
    { id: 1, label: 'Tag One', active: false },
    { id: 2, label: 'Tag Two', active: false },
    { id: 3, label: 'Tag Three', active: false },
  ];
};

const tags = ref(createTags());

const removeTag = (id: number) => {
  tags.value = tags.value.filter((tag) => tag.id !== id);
};

const resetTags = () => {
  tags.value = createTags();
};
// @example-end
</script>

<style lang="scss"></style>
