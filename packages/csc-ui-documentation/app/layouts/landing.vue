<template>
  <!-- The landing page's shell: the docs toolbar over full-width content.
       The side navigation is the slide-in drawer at every width, opened by
       the toolbar's burger, so every docs page stays one click away without
       a pinned column squeezing the page. -->
  <div class="flex min-h-screen flex-col">
    <app-toolbar navigation-button />

    <app-side-navigation mobile />

    <main class="flex-1">
      <slot />
    </main>

    <div class="mx-auto mb-12 w-full max-w-300 px-5 md:px-12">
      <app-footer />
    </div>
  </div>
</template>
