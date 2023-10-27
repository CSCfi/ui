<template>
  <component-example rows>
    <template #title>Mandatory selection</template>

    <template #subtitle>One expanded panel is required</template>

    <c-accordion value="one" mandatory>
      <c-accordion-item heading="One" value="one">
        <c-icon slot="icon" :path="mdiAccessPoint" />
        Lorem ipsum dolor sit amet.
      </c-accordion-item>

      <c-accordion-item heading="Two" value="two">
        <c-icon slot="icon" :path="mdiNas" />
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Harum,
        perspiciatis?
      </c-accordion-item>

      <c-accordion-item heading="Three" value="three">
        <c-icon slot="icon" :path="mdiCamera" />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia
        voluptatum perspiciatis itaque!
      </c-accordion-item>
    </c-accordion>
  </component-example>
</template>

<script setup lang="ts">
import { mdiAccessPoint, mdiCamera, mdiNas } from '@mdi/js';
</script>
