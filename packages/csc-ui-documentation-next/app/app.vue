<template>
  <div class="site">
    <header class="site-header">
      <NuxtLink class="site-title" to="/">
        CSC Design System <span class="site-title-badge">next</span>
      </NuxtLink>

      <ThemeToggle />
    </header>

    <div class="site-body">
      <nav aria-label="Components" class="site-nav">
        <NuxtLink class="site-nav-link" to="/types">Shared types</NuxtLink>

        <p class="site-nav-heading">Components</p>

        <NuxtLink
          v-for="component in navComponents"
          :key="component.tagName"
          class="site-nav-link"
          :to="`/components/${component.tagName}`"
        >
          {{ component.tagName }}
        </NuxtLink>
      </nav>

      <main class="site-main">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { navComponents } = useManifest();
</script>
