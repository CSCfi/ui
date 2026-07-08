<template>
  <c-page class="demo-page">
    <h2>Reports</h2>

    <p>The default slot is wrapped in a centered max-width container.</p>

    <div slot="footer">Footer content</div>
  </c-page>
</template>

<style scoped>
/* Demo-only sizing: c-page normally fills the viewport below the toolbar. */
.demo-page {
  height: 240px;
}
</style>
