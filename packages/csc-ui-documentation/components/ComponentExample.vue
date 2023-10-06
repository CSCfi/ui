<template>
  <div class="component-example grid gap-6">
    <div>
      <h2 v-if="slots.title" class="font-medium text-xl text-primary-600">
        <slot name="title" />
      </h2>
      <h3 v-if="slots.subtitle" class="text-tertiary-600 -mt-2">
        <slot name="subtitle" />
      </h3>
    </div>

    <p v-if="slots.description"><slot name="description" /></p>

    <div class="gap-4 flex" :class="rows ? 'flex-col' : 'flex-wrap'">
      <slot />
    </div>

    <c-accordion value="" outlined>
      <c-accordion-item heading="Code" value="code">
        <c-icon slot="icon" :path="mdiXml"></c-icon>

        <div class="flex justify-start mb-4">
          <c-tab-buttons v-model="exampleType" v-control size="small" mandatory>
            <c-button value="template">
              <c-icon :path="mdiLanguageHtml5"></c-icon>
              Template
            </c-button>
            <c-button v-if="examples.scripts.get(name)" value="script">
              <c-icon :path="mdiLanguageTypescript"></c-icon>
              Script
            </c-button>
          </c-tab-buttons>
        </div>

        <keep-alive>
          <CodeBlock
            v-if="exampleType === 'template' && examples.templates.get(name)"
            :code="examples.templates.get(name).trim()"
            :highlightjs="true"
            lang="html"
            theme="atom-one-dark"
            code-block-radius="6px"
            persistent-copy-button
          />

          <CodeBlock
            v-else-if="exampleType === 'script' && examples.scripts.get(name)"
            :code="examples.scripts.get(name).trim()"
            :highlightjs="true"
            theme="atom-one-dark"
            code-block-radius="6px"
            persistent-copy-button
          />
        </keep-alive>
      </c-accordion-item>
    </c-accordion>
  </div>
</template>

<script setup lang="ts">
import { mdiLanguageHtml5, mdiLanguageTypescript, mdiXml } from '@mdi/js';

defineProps<{
  rows?: boolean;
  name: string;
}>();

const slots = useSlots();

const exampleType = ref<'template' | 'script'>('template');

const examples = ref({ scripts: new Map(), templates: new Map() });

const componentName = inject('componentName');

// const { componentData } = storeToRefs(useExampleStore());

const scripts = computed(() => {
  return import(`../example-data/${componentName}.vue.script.js`);
});

const templates = computed(() => {
  return import(`../example-data/${componentName}.vue.template.js`);
});

onMounted(async () => {
  Object.entries(await scripts.value).forEach(([key, value]) => {
    examples.value.scripts.set(key, value);
  });

  Object.entries(await templates.value).forEach(([key, value]) => {
    examples.value.templates.set(key, value);
  });
});
</script>
