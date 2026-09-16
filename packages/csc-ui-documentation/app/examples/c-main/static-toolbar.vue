<docs>surface: canvas</docs>

<template>
  <c-main class="demo-shell">
    <c-toolbar static>
      <c-csc-logo />

      <span>My Service</span>
    </c-toolbar>

    <c-side-navigation>
      <c-side-navigation-title>My project</c-side-navigation-title>

      <c-side-navigation-item active>Dashboard</c-side-navigation-item>

      <c-side-navigation-item>Members</c-side-navigation-item>
    </c-side-navigation>

    <c-page>
      <h2>Dashboard</h2>

      <p>
        With static the toolbar is ordinary content: it scrolls away with the
        page instead of pinning to the top edge.
      </p>

      <p>
        c-main follows the toolbar. Once the bar has left, the side navigation
        pins to the top edge instead of one toolbar height down.
      </p>

      <p>
        In an application the shell fills the whole viewport and the document
        itself scrolls; here the shell is boxed to 320px so the behaviour is
        visible.
      </p>

      <p>Scroll back up to bring the toolbar back.</p>
    </c-page>
  </c-main>
</template>

<style scoped>
/* Demo-only sizing: c-main normally fills the whole viewport and the document scrolls. */
.demo-shell::part(root) {
  height: 320px;
  min-height: 0;
  overflow-y: auto;
}
</style>
