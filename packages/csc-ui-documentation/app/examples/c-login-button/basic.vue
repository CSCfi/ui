<template>
  <div>
    <c-login-buttons>
      <c-login-button :src="logo(mdiSchool)" alt="Haka logo">
        Haka login
      </c-login-button>

      <c-login-button :src="logo(mdiAccountCircle)" alt="CSC logo">
        CSC login
      </c-login-button>
    </c-login-buttons>
  </div>
</template>

<script setup lang="ts">
import { mdiAccountCircle, mdiSchool } from '@mdi/js';

// Stand-in provider logos; use your identity provider's logo url instead.
const logo = (path: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}" fill="#336b8e"/></svg>`,
  )}`;
</script>
