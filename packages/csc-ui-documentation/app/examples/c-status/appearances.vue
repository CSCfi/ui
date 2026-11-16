<template>
  <div class="example-grid">
    <div class="example-row">
      <c-status marker="dot">Draft</c-status>

      <c-status marker="dot" type="info">Pending</c-status>

      <c-status marker="dot" type="success">Active</c-status>

      <c-status marker="dot" type="warning">Expiring</c-status>

      <c-status marker="dot" type="error">Failed</c-status>
    </div>

    <div class="example-row">
      <c-status appearance="outlined" marker="dot">Draft</c-status>

      <c-status appearance="outlined" marker="dot" type="info">
        Pending
      </c-status>

      <c-status appearance="outlined" marker="dot" type="success">
        Active
      </c-status>

      <c-status appearance="outlined" marker="dot" type="warning">
        Expiring
      </c-status>

      <c-status appearance="outlined" marker="dot" type="error">
        Failed
      </c-status>
    </div>
  </div>
</template>
