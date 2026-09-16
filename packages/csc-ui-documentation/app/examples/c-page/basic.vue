<docs>surface: canvas</docs>

<template>
  <c-page class="demo-page">
    <h2>Reports</h2>

    <p>The default slot is wrapped in a centered max-width container.</p>

    <div slot="footer">Footer content</div>
  </c-page>
</template>

<style scoped>
/* Demo-only sizing: c-page normally fills the dashboard's page area and the document scrolls. */
.demo-page {
  height: 240px;
}
</style>
