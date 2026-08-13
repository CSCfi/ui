<template>
  <c-main class="demo-shell">
    <c-toolbar class="relative">
      <c-csc-logo />

      <span>My Service</span>
    </c-toolbar>

    <c-page>
      <h2>Dashboard</h2>

      <p>Page content goes here.</p>
    </c-page>
  </c-main>
</template>

<style scoped>
/* Demo-only sizing: c-main normally fills the whole viewport. */
.demo-shell::part(root) {
  height: 320px;
}

.demo-shell c-page {
  height: auto;
}
</style>
