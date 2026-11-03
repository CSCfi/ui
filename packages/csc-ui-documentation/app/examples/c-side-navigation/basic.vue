<docs>surface: canvas</docs>

<template>
  <div>
    <c-side-navigation>
      <c-side-navigation-title>My project</c-side-navigation-title>

      <c-side-navigation-item
        :current="current === 'dashboard'"
        @select="current = 'dashboard'"
      >
        <c-icon :path="mdiViewDashboardOutline" />
        Dashboard
      </c-side-navigation-item>

      <c-side-navigation-item expanded>
        <c-icon :path="mdiFolderOutline" />
        Projects

        <c-sub-navigation-item
          :current="current === 'active'"
          @select="current = 'active'"
        >
          Active projects
        </c-sub-navigation-item>

        <c-sub-navigation-item
          :current="current === 'archived'"
          @select="current = 'archived'"
        >
          Archived projects
        </c-sub-navigation-item>
      </c-side-navigation-item>

      <c-side-navigation-item href="https://csc.fi" target="_blank">
        <c-icon :path="mdiOpenInNew" />
        Service description
      </c-side-navigation-item>
    </c-side-navigation>
  </div>
</template>

<script setup lang="ts">
import {
  mdiFolderOutline,
  mdiOpenInNew,
  mdiViewDashboardOutline,
} from '@mdi/js';
import { ref } from 'vue';

const current = ref('active');
</script>
