<template>
  <c-card>
    <h1 class="text-4xl capitalize font-bold text-primary-600 pl-6">Types</h1>

    <c-card-content>
      <div class="grid gap-6 md:grid-cols-[auto_1fr]">
        <div>
          <c-list class="sticky -top-4">
            <c-list-item
              v-for="{ name } in types"
              :key="name"
              :active="activeItem === name"
              target="_self"
              ripple
              @click="onItemClick(name)"
              @keyup.space.prevent="onItemClick(name)"
              @keyup.enter.prevent="onItemClick(name)"
            >
              <c-icon
                slot="pre"
                :path="mdiLanguageTypescript"
                class="text-info-700"
              />
              {{ name }}
            </c-list-item>
          </c-list>
        </div>

        <div class="grid gap-6 -mt-2">
          <div
            v-for="{ name, definition } in types"
            :id="name"
            :ref="(el) => definitionRefs.set(name, el as HTMLDivElement)"
            :key="`definition-${name}`"
          >
            <p class="font-medium text-lg text-primary-600 py-2">{{ name }}</p>

            <code-block
              :code="definition"
              theme="atom-one-dark"
              lang="typescript"
              code-block-radius="6px"
              highlightjs
              persistent-copy-button
            />
          </div>
        </div>
      </div>
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
import { mdiLanguageTypescript } from '@mdi/js';
import typeDefinitions from '../example-data/types';

const route = useRoute();

const definitionRefs = ref<Map<string, HTMLDivElement>>(new Map());

const types = Object.keys(typeDefinitions)
  .map((key) => ({
    name: key,
    definition: typeDefinitions[key as keyof typeof typeDefinitions].trim(),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const activeItem = ref('');

const onItemClick = (name: string) => {
  activeItem.value = name;

  requestAnimationFrame(() => {
    definitionRefs.value.get(name)?.scrollIntoView();
  });
};

onMounted(() => {
  setTimeout(() => {
    onItemClick(route.hash.replace('#', ''));
  }, 1000);
});
</script>

<style lang="scss"></style>
