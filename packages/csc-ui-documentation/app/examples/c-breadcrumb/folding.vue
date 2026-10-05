<template>
  <!-- Drag the corner to narrow the box: the middle crumbs fold behind "…",
       then the current crumb's label shortens. -->
  <div
    style="
      resize: horizontal;
      overflow: hidden;
      width: 420px;
      min-width: 160px;
      max-width: 100%;
      padding: 8px;
      border: 1px dashed currentColor;
    "
  >
    <c-breadcrumb>
      <c-breadcrumb-item aria-label="Home" href="https://csc.fi">
        <c-icon slot="icon" :path="mdiHome" :size="20" />
      </c-breadcrumb-item>

      <c-breadcrumb-item href="https://csc.fi/en/services">
        <c-icon slot="icon" :path="mdiHome" :size="20" />
        Services
      </c-breadcrumb-item>

      <c-breadcrumb-item href="https://csc.fi/en/services/computing">
        <c-icon slot="icon" :path="mdiHome" :size="20" />
        Computing
      </c-breadcrumb-item>

      <c-breadcrumb-item href="https://csc.fi/en/services/computing/lumi">
        <c-icon slot="icon" :path="mdiHome" :size="20" />
        LUMI supercomputer
      </c-breadcrumb-item>

      <c-breadcrumb-item>Applying for computing resources</c-breadcrumb-item>
    </c-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { mdiHome } from '@mdi/js';
</script>
