<template>
  <component-example name="basic">
    <template #title>Basic usage</template>

    <c-card>
      <c-card-title>The title of the card</c-card-title>

      <c-card-content>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </c-card-content>

      <c-card-actions justify="space-between">
        <c-checkbox label="Example checkbox" hide-details></c-checkbox>
        <c-button>Confirm</c-button>
      </c-card-actions>
    </c-card>
  </component-example>
</template>

<script setup lang="ts"></script>

<style lang="scss"></style>
