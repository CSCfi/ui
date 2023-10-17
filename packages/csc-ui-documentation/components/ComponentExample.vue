<template>
  <div class="component-example grid gap-6">
    <div>
      <h2 v-if="slots.title" class="font-medium text-xl text-primary-600">
        <slot name="title" />
      </h2>
      <h3 v-if="slots.subtitle" class="text-tertiary-600">
        <slot name="subtitle" />
      </h3>
    </div>

    <p v-if="slots.description"><slot name="description" /></p>

    <div class="gap-4 flex" :class="rows ? 'flex-col' : 'flex-wrap'">
      <slot />
    </div>

    <c-accordion class="code-examples" value="" outlined>
      <c-accordion-item heading="Code" value="code">
        <c-icon slot="icon" :path="mdiXml"></c-icon>

        <div class="flex justify-start mb-4">
          <c-tab-buttons v-model="exampleType" v-control size="small" mandatory>
            <c-button value="template">
              <c-icon :path="mdiLanguageHtml5"></c-icon>
              Template
            </c-button>
            <c-button v-if="exampleScript" value="script">
              <c-icon :path="mdiLanguageTypescript"></c-icon>
              Script
            </c-button>
          </c-tab-buttons>
        </div>

        <keep-alive>
          <CodeBlock
            v-if="exampleType === 'template' && exampleTemplate"
            :code="exampleTemplate.trim()"
            :highlightjs="true"
            lang="html"
            theme="atom-one-dark"
            code-block-radius="6px"
            persistent-copy-button
          />

          <CodeBlock
            v-else-if="exampleType === 'script' && exampleScript"
            :code="exampleScript.trim()"
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
}>();

const slots = useSlots();

const exampleType = ref<'template' | 'script'>('template');

const exampleScript = ref('');

const exampleTemplate = ref('');

const componentName = inject('componentName');

const scriptFiles = import.meta.glob(`../example-data/**/*.script.js`);

const templateFiles = import.meta.glob(`../example-data/**/*.template.js`);

onMounted(() => {
  const instance = getCurrentInstance();
  const parent = instance?.parent?.type?.__file
    ?.split('/')
    ?.at(-1)
    ?.replace('.vue', '')
    .toLowerCase();

  for (const path in scriptFiles) {
    if (path.includes(`/example-data/${componentName}/${parent}.`)) {
      // @ts-ignore
      scriptFiles[path]().then((mod: any) => {
        exampleScript.value = mod.default || '';
      });
    }
  }

  for (const path in templateFiles) {
    if (path.includes(`/example-data/${componentName}/${parent}.`)) {
      // @ts-ignore
      templateFiles[path]().then((mod: any) => {
        exampleTemplate.value = mod.default;
      });
    }
  }
});
</script>

<style scoped lang="scss">
c-accordion.code-examples c-accordion-item {
  --c-accordion-item-header-background-color: var(--c-tertiary-700);
  --c-accordion-item-outline-color: var(--c-tertiary-700);
  --c-accordion-item-text-color: var(--c-white);
}

c-button {
  --c-button-background-color: var(--c-tertiary-700);
}
</style>
