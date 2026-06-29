<template>
  <component-example name="bordered" rows>
    <template #title>Bordered items</template>

    
    <c-list bordered>
      <c-list-item :active="selections[0]">
        <c-checkbox slot="pre" v-model="selections[0]" v-control hide-details />
        
        <c-list-item-title>Address</c-list-item-title>
        
        Example street 12
      </c-list-item>
      
      <c-list-item :active="selections[1]">
        <c-checkbox slot="pre" v-model="selections[1]" v-control hide-details />
        
        <c-list-item-title>Phone</c-list-item-title>
        
        +358 40 1234 123
      </c-list-item>
      
      <c-list-item :active="selections[2]">
        <c-checkbox slot="pre" v-model="selections[2]" v-control hide-details />
        
        <c-list-item-title>Email</c-list-item-title>
        
        example.person@example.com
      </c-list-item>
    </c-list>
    
    <p>Another list with custom gap (0.75rem)</p>

    <c-list class="custom-gap" bordered>
      <c-list-item :active="selections[0]">
        <c-checkbox slot="pre" v-model="selections[0]" v-control hide-details />

        <c-list-item-title>Address</c-list-item-title>

        Example street 12
      </c-list-item>

      <c-list-item :active="selections[1]">
        <c-checkbox slot="pre" v-model="selections[1]" v-control hide-details />

        <c-list-item-title>Phone</c-list-item-title>

        +358 40 1234 123
      </c-list-item>

      <c-list-item :active="selections[2]">
        <c-checkbox slot="pre" v-model="selections[2]" v-control hide-details />

        <c-list-item-title>Email</c-list-item-title>

        example.person@example.com
      </c-list-item>
    </c-list>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const selections = ref([false, false, false]);
</script>

<style>
c-list.custom-gap::part(root) {
  gap: 0.75rem;
}
</style>
