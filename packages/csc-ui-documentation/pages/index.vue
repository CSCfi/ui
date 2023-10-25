<template>
  <c-card>
    <c-card-content>
      <c-row align="center" gap="16">
        <c-csc-logo width="100" />

        <div>
          <h1 class="text-4xl capitalize mb-0 text-primary">
            CSC Design System
          </h1>

          <h2 class="text-lg text-muted">
            Web Component Library | version {{ version }}
          </h2>
        </div>
      </c-row>

      <p class="mt-3 text-muted">
        CSC Design System is an accessible cross-platform UI Library for CSC
        applications and services.
      </p>

      <ul>
        <li>
          <c-link href="https://www.npmjs.com/package/csc-ui">
            NPM Package
          </c-link>
        </li>

        <li>
          <c-link href="https://github.com/CSCfi/csc-ui">
            Github Repository
          </c-link>
        </li>

        <li>
          <c-link href="https://csc.fi">CSC Website</c-link>
        </li>
      </ul>
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
import packageJson from '../package.json';

const version = ref(packageJson.version);
</script>

<style lang="scss"></style>
