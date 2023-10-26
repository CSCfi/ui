<template>
  <c-card class="max-w-screen-xl mx-auto">
    <c-card-content>
      <h1 class="text-4xl capitalize font-bold text-primary-600">Color</h1>

      <p>
        Color tokens are referenced using the
        <code>--c-{color}-{n}</code>
        CSS custom property, where
        <code>{color}</code>
        is the name of the palette and
        <code>{n}</code>
        is the numeric value of the desired shade.
      </p>

      <div
        class="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-8 md:gap-y-4 align-top"
      >
        <template v-for="(color, index) in themeColors" :key="color.name">
          <div :class="{ 'mt-4': index > 0 }">
            <p class="text-lg font-bold">{{ color.name }}</p>

            <p>--c-{{ color.name }}-{n}</p>
          </div>

          <div :class="{ 'mt-4': index > 0 }" class="grid grid-cols-9 gap-2">
            <div
              v-for="shade in color.shades"
              :key="`${color.name}-${shade}`"
              class="grid justify-items-center"
            >
              <div
                class="w-full h-9 md:h-12 rounded md:rounded-md"
                :style="{
                  backgroundColor: `var(--c-${color.name}-${shade})`,
                }"
              />

              <p class="text-sm">{{ shade }}</p>
            </div>
          </div>
        </template>

        <hr class="md:col-span-2 mt-4 md:mt-0" />

        <p class="md:col-span-2">
          The following token have only the base shade
        </p>

        <div class="mt-4">
          <p class="text-lg font-bold">Black</p>

          <p>--c-black</p>
        </div>

        <div class="grid grid-cols-9 gap-2 mt-4">
          <div class="grid justify-items-center">
            <div
              class="w-full h-9 md:h-12 rounded md:rounded-md"
              :style="{
                backgroundColor: 'var(--c-black)',
              }"
            />
          </div>
        </div>

        <div class="mt-4">
          <p class="text-lg font-bold">White</p>

          <p>--c-white</p>
        </div>

        <div class="grid grid-cols-9 gap-2 mt-4">
          <div class="grid justify-items-center">
            <div
              class="w-full h-9 md:h-12 rounded md:rounded-md border"
              :style="{
                backgroundColor: 'var(--c-white)',
              }"
            />
          </div>
        </div>

        <div class="mt-4">
          <p class="text-lg font-bold">Transparent</p>

          <p>--c-transparent</p>
        </div>

        <div class="grid grid-cols-9 gap-2 mt-4">
          <div class="grid justify-items-center">
            <div
              class="w-full h-9 md:h-12 rounded md:rounded-md border"
              :style="{
                backgroundColor: 'var(--c-transparent)',
              }"
            />
          </div>
        </div>
      </div>
    </c-card-content>

    <c-card-content class="mt-4">
      <h2 class="text-xl capitalize font-bold flex items-center gap-2">
        <c-icon
          :path="mdiLanguageHtml5"
          :size="32"
          color="var(--c-warning-600)"
        />
        Usage in HTML
      </h2>

      <code-block
        :code="cssHead"
        theme="atom-one-dark"
        lang="html"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />
    </c-card-content>

    <c-card-content class="mt-4">
      <h2 class="text-xl capitalize font-bold flex items-center gap-2">
        <c-icon :path="mdiLanguageCss3" :size="32" color="var(--c-info-600)" />
        Usage in CSS
      </h2>

      <code-block
        :code="cssUsage"
        theme="atom-one-dark"
        lang="css"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />
    </c-card-content>

    <c-card-content class="mt-4">
      <h2 class="text-xl capitalize font-bold flex items-center gap-2">
        <c-icon :path="mdiSass" :size="32" color="var(--c-error-300)" />
        Usage in SCSS
      </h2>

      <code-block
        :code="scssUsage"
        theme="atom-one-dark"
        lang="scss"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />
    </c-card-content>

    <c-card-content class="mt-4">
      <h2 class="text-xl capitalize font-bold flex items-center gap-2">
        <c-icon :path="mdiTailwind" :size="32" color="var(--c-info-600)" />
        Usage with Tailwind CSS
      </h2>

      CSC-UI provides the color tokens as a theme for Tailwind CSS.

      <code-block
        :code="tailwindConfig"
        theme="atom-one-dark"
        lang="javascript"
        label="tailwind.config.js"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <code-block
        :code="tailwindUsage"
        theme="atom-one-dark"
        lang="html"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p class="text-primary-600">I should have primary colored text</p>
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
import { theme } from '@cscfi/csc-ui/tailwind';
import {
  mdiLanguageCss3,
  mdiLanguageHtml5,
  mdiSass,
  mdiTailwind,
} from '@mdi/js';

const sortOrder = [
  'primary',
  'secondary',
  'tertiary',
  'accent',
  'info',
  'link',
  'success',
  'warning',
  'error',
];

const themeColors = computed(() => {
  const order = Object.fromEntries(sortOrder.map((k, i) => [k, i + 1]));

  return Object.keys(theme.colors)
    .reduce(
      (items, item) => {
        if (typeof theme.colors[item] === 'string') return items;

        const color = {
          name: item,
          shades: Object.keys(theme.colors[item])
            .filter((key) => key !== 'DEFAULT')
            .map((key) => key),
        };

        items.push(color);

        return items;
      },
      [] as { name: string; shades: string[] }[],
    )
    .sort((a, b) => order[a.name] - order[b.name]);
});

const cssHead = `<html>
  <head>
    <link rel="stylesheet" href="path/to/csc-ui/css/theme.css" />
  </head>

  <body>
    ...
  </body>
</html>`;

const tailwindConfig = `/** @type {import('tailwindcss').Config} */

const defaultColors = require('tailwindcss/colors');
const { theme } = require('@cscfi/csc-ui/tailwind');

module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    colors: {
      ...defaultColors,
      ...theme.colors,
    },
  },
}`;

const tailwindUsage = `<p class="text-primary-600">I should have primary colored text</p>`;

const cssUsage = `@import url('@cscfi/csc-ui/css/theme.css');

p {
  color: var(--c-primary-600);
}`;

const scssUsage = `@import url('@cscfi/csc-ui/scss/theme.scss');

p {
  color: $c-primary-600;
}`;
</script>
