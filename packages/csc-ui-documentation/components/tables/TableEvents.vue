<template>
  <c-table>
    <thead>
      <tr>
        <th>Event</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="item in items" :key="item.event" class="border-b">
        <td>{{ item.event }}</td>
        <td>{{ item.detail }}</td>
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
