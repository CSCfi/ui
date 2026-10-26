<template>
  <div class="example-row">
    <c-link href="https://csc.fi">Default link</c-link>

    <c-link href="https://csc.fi" underline>Underlined link</c-link>

    <c-link href="https://csc.fi" target="_blank">Opens in a new tab</c-link>

    <c-link class="normal-weight" href="https://csc.fi">Normal weight</c-link>
  </div>
</template>

<style>
/* Restyle the link through its part (ADR-0006). */
c-link.normal-weight::part(root) {
  font-weight: 400;
}
</style>
