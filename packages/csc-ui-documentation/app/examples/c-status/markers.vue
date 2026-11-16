<template>
  <div class="example-grid">
    <div class="example-row">
      <c-status marker="icon">Draft</c-status>

      <c-status marker="icon" type="info">Pending</c-status>

      <c-status marker="icon" type="success">Active</c-status>

      <c-status marker="icon" type="warning">Expiring</c-status>

      <c-status marker="icon" type="error">Failed</c-status>
    </div>

    <div class="example-row">
      <c-status marker="dot">Draft</c-status>

      <c-status marker="dot" type="info">Pending</c-status>

      <c-status marker="dot" type="success">Active</c-status>

      <c-status marker="dot" type="warning">Expiring</c-status>

      <c-status marker="dot" type="error">Failed</c-status>
    </div>
  </div>
</template>
