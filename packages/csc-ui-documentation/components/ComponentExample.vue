<template>
  <div class="component-example flex flex-col gap-6">
    <div>
      <h2 v-if="slots.title" class="font-medium text-xl text-primary-600">
        <slot name="title" />
      </h2>

      <h3 v-if="slots.subtitle" class="text-tertiary-600">
        <slot name="subtitle" />
      </h3>
    </div>

    <p v-if="slots.description"><slot name="description" /></p>

    <div class="gap-4 flex w-full" :class="rows ? 'flex-col' : 'flex-wrap'">
      <slot />
    </div>

    <c-accordion class="code-examples" value="" outlined>
      <c-accordion-item heading="Code" value="code">
        <c-icon slot="icon" :path="mdiXml" />

        <div class="flex justify-start mb-4">
          <c-tab-buttons v-model="exampleType" v-control size="small" mandatory>
            <c-button value="template">
              <c-icon :path="mdiLanguageHtml5" />
              Template
            </c-button>

            <c-button v-show="exampleScript" value="script">
              <c-icon :path="mdiLanguageTypescript" />
              Script
            </c-button>
          </c-tab-buttons>
        </div>

        <keep-alive>
          <code-block
            v-if="exampleType === 'template' && exampleTemplate"
            :code="exampleTemplate.trim()"
            lang="html"
            theme="atom-one-dark"
            code-block-radius="6px"
            highlightjs
            persistent-copy-button
          />

          <code-block
            v-else-if="exampleType === 'script' && exampleScript"
            :code="exampleScript.trim()"
            theme="atom-one-dark"
            code-block-radius="6px"
            highlightjs
            persistent-copy-button
          />
        </keep-alive>
      </c-accordion-item>
    </c-accordion>
  </div>
</template>

<script setup lang="ts">
import { mdiLanguageHtml5, mdiLanguageTypescript, mdiXml } from '@mdi/js';

const props = defineProps<{
  rows?: boolean;
  name: string;
}>();

const slots = useSlots();

const exampleType = ref<'template' | 'script'>('template');

const exampleScript = ref('');

const exampleTemplate = ref('');

const componentName = inject('componentName');

const scriptFiles = import.meta.glob(`../example-data/**/*.script.js`);

const templateFiles = import.meta.glob(`../example-data/**/*.template.js`);

onMounted(() => {
  const parent = props.name.replaceAll('-', '');

  requestAnimationFrame(() => {
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
});
</script>

<style scoped lang="scss">
c-accordion.code-examples c-accordion-item {
  --c-accordion-item-header-background-color: var(--c-tertiary-800);
  --c-accordion-item-outline-color: var(--c-tertiary-800);
  --c-accordion-item-text-color: var(--c-white);
}

c-tab-buttons {
  --_c-tab-buttons-background-color-active: var(--c-tertiary-800);
  --_c-tab-buttons-border-color: var(--c-tertiary-800);
  --_c-tab-buttons-text-color: var(--c-tertiary-800);
  --_c-tab-buttons-background-color-active-hover: var(--c-tertiary-500);
}
.component-example {
  transform: translateX(0);
}
</style>
