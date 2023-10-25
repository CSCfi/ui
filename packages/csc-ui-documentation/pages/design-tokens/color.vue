<template>
  <c-card ref="cardRef" class="max-w-screen-xl mx-auto">
    <c-card-content>
      <h1 class="text-4xl capitalize font-bold text-primary-600">Color</h1>

      Color tokens are referenced using the --c-{color}-{n} CSS custom property,
      where {color} is the name of the palette and {n} is the numeric value of
      the desired shade.

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
  </c-card>
</template>

<script setup lang="ts">
import { theme } from '@cscfi/csc-ui/tailwind';

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
</script>
