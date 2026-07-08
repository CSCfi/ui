<template>
  <div>
    <c-side-navigation>
      <c-side-navigation-item
        :active.prop="current === 'dashboard'"
        @item-change="current = 'dashboard'"
      >
        <c-icon :path="mdiViewDashboardOutline" />
        Dashboard
      </c-side-navigation-item>

      <c-side-navigation-item active>
        <c-icon :path="mdiFolderOutline" />
        Projects

        <c-sub-navigation-item
          :active.prop="current === 'active'"
          @click="current = 'active'"
          @keyup.enter="current = 'active'"
        >
          Active projects
        </c-sub-navigation-item>

        <c-sub-navigation-item
          :active.prop="current === 'archived'"
          @click="current = 'archived'"
          @keyup.enter="current = 'archived'"
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

const current = ref('dashboard');
</script>
