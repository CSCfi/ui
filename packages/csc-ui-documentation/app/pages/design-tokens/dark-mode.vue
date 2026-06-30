<template>
  <c-card class="max-w-screen-xl mx-auto">
    <c-card-content>
      <h1 class="text-4xl capitalize font-bold text-primary-600">Dark mode</h1>

      <p>
        <code>@cscfi/csc-ui-next</code>
        components are authored against a
        <strong>semantic-token layer</strong>
        — role-named CSS custom properties such as
        <code>--c-surface</code>
        and
        <code>--c-primary</code>
        rather than raw palette steps. Each role resolves to a different
        palette step per theme, so switching themes re-colours every component
        at once with no per-component work.
      </p>

      <p>
        The roles, and their dark-mode values, live in a single stylesheet you
        import once:
      </p>

      <code-block
        :code="importCss"
        theme="atom-one-dark"
        lang="css"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />
    </c-card-content>

    <c-card-content class="mt-4">
      <h2 class="text-xl font-bold">Activating a theme</h2>

      <p>
        The mode is selected by the
        <code>data-theme</code>
        attribute on the document root. There are three states:
      </p>

      <ul class="list-disc pl-6 flex flex-col gap-1">
        <li>
          <code>&lt;html data-theme="light"&gt;</code>
          — force light.
        </li>

        <li>
          <code>&lt;html data-theme="dark"&gt;</code>
          — force dark.
        </li>

        <li>
          <strong>No attribute</strong>
          — follow the operating system via
          <code>prefers-color-scheme</code>
          (defaults to light).
        </li>
      </ul>

      <p>
        A typical toggle just writes the attribute and persists the choice:
      </p>

      <code-block
        :code="toggleSnippet"
        theme="atom-one-dark"
        lang="javascript"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p class="text-system">
        Use the
        <strong>sun / moon button in the toolbar</strong>
        to switch this documentation between light and dark and watch the
        components below re-theme live.
      </p>
    </c-card-content>

    <c-card-content v-if="isNextImpl" class="mt-4">
      <h2 class="text-xl font-bold">Semantic roles</h2>

      <p>
        These are the roles components author against. The swatches read the
        live
        <code>--c-*</code>
        values, so they reflect the theme currently selected in the toolbar.
      </p>

      <div class="flex flex-col gap-8 mt-4">
        <div v-for="group in roleGroups" :key="group.title">
          <p class="text-lg font-bold mb-3">{{ group.title }}</p>

          <div
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            <div
              v-for="role in group.roles"
              :key="role.surface"
              class="rounded-md overflow-hidden"
              :style="{ boxShadow: '0 0 0 1px var(--c-border)' }"
            >
              <div
                class="h-16 flex items-end p-2"
                :style="{ backgroundColor: `var(--c-${role.surface})` }"
              >
                <span
                  v-if="role.on"
                  class="text-xs font-semibold"
                  :style="{ color: `var(--c-${role.on})` }"
                >
                  Aa
                </span>
              </div>

              <div
                class="p-2 text-xs"
                :style="{
                  backgroundColor: 'var(--c-surface)',
                  color: 'var(--c-on-surface-muted)',
                }"
              >
                --c-{{ role.surface }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </c-card-content>

    <c-card-content v-else class="mt-4">
      <c-alert type="info">
        The live semantic-token preview is only available when the docs run
        against the
        <code>csc-ui-next</code>
        implementation
        (<code>CSC_UI_IMPL=next</code>). The activation contract above applies
        regardless.
      </c-alert>
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const isNextImpl = config.public.cscUiImpl === 'next';

const importCss = `/* Once, e.g. in your global stylesheet or entry point */
@import url('@cscfi/csc-ui-next/css/tokens.css');

/* Author components against roles, not palette steps: */
.panel {
  background-color: var(--c-surface);
  color: var(--c-on-surface);
}`;

const toggleSnippet = `const root = document.documentElement;

function setTheme(mode /* 'light' | 'dark' */) {
  root.dataset.theme = mode;
  localStorage.setItem('theme', mode);
}

// Restore the saved choice on load; otherwise the OS preference applies.
const saved = localStorage.getItem('theme');
if (saved) root.dataset.theme = saved;`;

// Representative roles per family. The 'surface' field is the role painted as
// the background; 'on' (optional) is the matching foreground role, shown as an
// "Aa" sample so contrast is visible in both themes.
const roleGroups = [
  {
    title: 'Surfaces & text',
    roles: [
      { surface: 'surface', on: 'on-surface' },
      { surface: 'surface-raised', on: 'on-surface' },
      { surface: 'surface-overlay', on: 'on-surface' },
      { surface: 'surface-muted', on: 'on-surface-muted' },
    ],
  },
  {
    title: 'Primary',
    roles: [
      { surface: 'primary', on: 'on-primary' },
      { surface: 'primary-hover', on: 'on-primary' },
      { surface: 'primary-subtle', on: 'on-primary-subtle' },
      { surface: 'primary-subtle-hover', on: 'on-primary-subtle' },
    ],
  },
  {
    title: 'Status',
    roles: [
      { surface: 'success', on: 'on-success' },
      { surface: 'info', on: 'on-info' },
      { surface: 'warning', on: 'on-warning' },
      { surface: 'error', on: 'on-error' },
    ],
  },
  {
    title: 'Subtle status',
    roles: [
      { surface: 'success-subtle', on: 'on-success-subtle' },
      { surface: 'info-subtle', on: 'on-info-subtle' },
      { surface: 'warning-subtle', on: 'on-warning-subtle' },
      { surface: 'error-subtle', on: 'on-error-subtle' },
    ],
  },
  {
    title: 'Link & navigation',
    roles: [
      { surface: 'link', on: 'on-link' },
      { surface: 'link-subtle', on: 'on-link-subtle' },
      { surface: 'nav-surface', on: 'on-nav' },
      { surface: 'nav-surface-hover', on: 'on-nav' },
    ],
  },
  {
    title: 'Mode-invariant (inverse)',
    roles: [
      { surface: 'inverse-surface', on: 'inverse-primary' },
      { surface: 'inverse-primary', on: 'inverse-on' },
      { surface: 'border-strong', on: null },
      { surface: 'border', on: null },
    ],
  },
];
</script>
