<template>
  <c-table responsive>
    <thead>
      <tr>
        <th>Method</th>

        <th>Description</th>

        <th>Signature</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="item in items" :key="item.name" class="border-b">
        <td>{{ item.name }}</td>

        <td>{{ item.docs }}</td>

        <td>{{ item.signature }}</td>
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
