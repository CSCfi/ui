<template>
  <c-table>
    <thead>
      <tr>
        <th>Attribute</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="item in items" :key="item.name" class="border-b">
        <td>{{ item.name }}</td>
        <td>{{ item.type }}</td>
        <td>{{ item.default }}</td>
        <td>{{ item.docs }}</td>
      </tr>
    </tbody>
  </c-table>
</template>

<script setup lang="ts">
defineProps<{
  items: any;
}>();
</script>

<style lang="scss"></style>
