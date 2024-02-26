<template>
  <component-example rows name="custom-header">
    <template #title>Custom Header</template>

    <c-accordion v-model="activeItem" v-control>
      <c-accordion-item value="one">
        <div slot="header" class="flex gap-3 py-2 items-center">
          <div
            class="size-3 rounded-full transition-all"
            :class="{
              'bg-primary/50 size-1': activeItem !== 'one',
              'bg-primary-600 size-3 -m-1': activeItem === 'one',
            }"
          />

          <div class="grid items-center flex-1">
            <p class="font-semibold text-primary">Custom header one</p>

            <p>Subheader</p>
          </div>

          <c-tags style="--c-tag-border-radius: 6px">
            <c-tag badge="1" active flat>Tag One</c-tag>

            <c-tag badge="7" active flat>Tag Two</c-tag>
          </c-tags>
        </div>

        Lorem ipsum dolor sit amet.
      </c-accordion-item>

      <c-accordion-item value="two">
        <div slot="header" class="flex gap-3 py-2 items-center">
          <div
            class="rounded-full transition-all"
            :class="{
              'bg-primary/50 size-1': activeItem !== 'two',
              'bg-primary-600 size-3 -m-1': activeItem === 'two',
            }"
          />

          <div class="grid items-center flex-1">
            <p class="font-semibold text-primary">Custom header two</p>

            <p>Subheader</p>
          </div>

          <c-tags style="--c-tag-border-radius: 6px">
            <c-tag badge="13" active flat>Tag One</c-tag>

            <c-tag badge="10" active flat>Tag Two</c-tag>
          </c-tags>
        </div>

        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Harum,
        perspiciatis?
      </c-accordion-item>

      <c-accordion-item value="three">
        <div slot="header" class="flex gap-3 py-2 items-center">
          <div
            class="size-3 rounded-full transition-all"
            :class="{
              'bg-primary/50 size-1': activeItem !== 'three',
              'bg-primary-600 size-3 -m-1': activeItem === 'three',
            }"
          />

          <div class="grid items-center flex-1">
            <p class="font-semibold text-primary">Custom header three</p>

            <p>Subheader</p>
          </div>

          <c-tags style="--c-tag-border-radius: 6px">
            <c-tag badge="0" active flat>Tag One</c-tag>

            <c-tag badge="1" active flat>Tag Two</c-tag>
          </c-tags>
        </div>

        Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia
        voluptatum perspiciatis itaque!
      </c-accordion-item>
    </c-accordion>
  </component-example>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const activeItem = ref<'one' | 'two' | 'three'>('one');
</script>
