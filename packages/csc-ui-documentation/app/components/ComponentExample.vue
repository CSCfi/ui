<template>
  <div class="component-example flex flex-col gap-6">
    <div>
      <h2 v-if="slots.title" class="font-medium text-xl text-primary-600 dark:text-primary-500">
        <slot name="title" />
      </h2>

      <h3 v-if="slots.subtitle" class="text-tertiary-500">
        <slot name="subtitle" />
      </h3>
    </div>

    <p v-if="slots.description"><slot name="description" /></p>

    <div class="gap-4 flex flex-wrap w-full" :class="rows ? 'flex-col' : ''">
      <slot />
    </div>

    <c-accordion class="code-examples" value="" outlined>
      <c-accordion-item heading="Code" value="code">
        <c-icon slot="icon" :path="mdiXml" />

        <div class="flex justify-start mb-4">
          <c-tab-buttons v-model="exampleType" v-control size="small" mandatory>
            <!--
              `next` builds manage children via <c-tab-button> (sizing, active
              indicator, tabChange). The Stencil build has no such element and
              drives plain <c-button> children instead, so pick per impl mode.
            -->
            <component :is="tabButtonTag" value="template">
              <c-icon :size="20" :path="mdiLanguageHtml5" />
              Template
            </component>

            <component
              :is="tabButtonTag"
              v-show="exampleScript"
              value="script"
            >
              <c-icon :size="20" :path="mdiLanguageTypescript" />
              Script
            </component>
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

const config = useRuntimeConfig();

// The migrated (`next`) c-tab-buttons only manages <c-tab-button> children;
// the Stencil build uses plain <c-button>. See template comment.
const tabButtonTag =
  config.public.cscUiImpl === 'next' ? 'c-tab-button' : 'c-button';

const exampleType = ref<'template' | 'script'>('template');

const exampleScript = ref('');

const exampleTemplate = ref('');

const componentName = inject('componentName');

const scriptFiles = import.meta.glob(`../../example-data/**/*.script.js`);

const templateFiles = import.meta.glob(`../../example-data/**/*.template.js`);

onMounted(() => {
  const parent = props.name.replaceAll('-', '');

  requestAnimationFrame(() => {
    for (const path in scriptFiles) {
      if (path.includes(`/example-data/${componentName}/${parent}.`)) {
        // @ts-expect-error dynamic glob import return shape
        scriptFiles[path]().then((mod: { default?: string }) => {
          exampleScript.value = mod.default || '';
        });
      }
    }

    for (const path in templateFiles) {
      if (path.includes(`/example-data/${componentName}/${parent}.`)) {
        // @ts-expect-error dynamic glob import return shape
        templateFiles[path]().then((mod: { default?: string }) => {
          exampleTemplate.value = mod.default || '';
        });
      }
    }
  });
});
</script>

<style scoped lang="scss">
.code-examples {
  c-accordion-item {
    &::part(root) {
      --tw-ring-color: var(--c-tertiary-800);
    }

    &::part(header) {
      background-color: var(--c-tertiary-800);
      color: #fff;
    }
  }  
}

[data-theme="light"] {
  c-tab-button:not([active]) {
    &::part(root) {
      color: var(--c-tertiary-800);
    }
  }
  c-tab-buttons {
    &::part(indicator) {
      background-color: var(--c-tertiary-800);
    }
    &::part(root) {
      background-color: var(--c-tertiary-100);
    }
  }
}

.component-example {
  transform: translateX(0);
}
</style>
