<template>
  <component-example name="sizes">
    <template #title>Sizes</template>

    <c-button size="large">Large</c-button>

    <c-button>Default</c-button>

    <c-button size="small">Small</c-button>
  </component-example>
</template>

<style>
c-button::part(root) {
  align-self: flex-start;
}
</style>
