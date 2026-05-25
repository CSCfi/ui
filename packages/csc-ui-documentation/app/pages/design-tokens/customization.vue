<template>
  <c-card>
    <h1 class="text-4xl capitalize font-bold text-primary-600 pl-6">
      Customization
    </h1>

    <c-card-content>
      <h2 class="text-2xl capitalize font-bold text-primary-600">Components</h2>

      <p>CSC-UI components can be customized through the design tokens.</p>

      <p>
        Customizations can be made to the theme colors or individual components
        either globally or by component / container.
      </p>

      <h2 class="text-xl text-primary">Customizing a theme color globally</h2>

      <code-block
        :code="themeOverride"
        theme="atom-one-dark"
        lang="css"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />
    </c-card-content>

    <c-card-content :style="themeOverrideVariables">
      <div>
        <c-button>Button</c-button>
      </div>

      <c-switch>Switch</c-switch>

      <c-checkbox hide-details>Checkbox</c-checkbox>

      <c-tags>
        <c-tag>Tag</c-tag>

        <c-tag active>Tag</c-tag>
      </c-tags>
    </c-card-content>

    <c-card-content class="mt-6">
      <h2 class="text-xl text-primary">Customizing components globally</h2>

      <code-block
        :code="componentOverride"
        theme="atom-one-dark"
        lang="css"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />
    </c-card-content>

    <c-card-content :style="componentOverrideVariables">
      <c-switch>Switch</c-switch>

      <c-row gap="8">
        <c-icon-button>
          <c-icon :path="mdiStar" />
        </c-icon-button>

        <c-icon-button outlined>
          <c-icon :path="mdiStar" />
        </c-icon-button>
      </c-row>
    </c-card-content>

    <c-card-content class="mt-6">
      <h2 class="text-xl text-primary">
        Customizing a component with a CSC class
      </h2>

      <code-block
        code='<c-button class="custom-button">Button</c-button>'
        theme="atom-one-dark"
        lang="html"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <code-block
        :code="classOverride"
        theme="atom-one-dark"
        lang="css"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />
    </c-card-content>

    <c-card-content>
      <div>
        <c-button class="custom-button">Button</c-button>
      </div>
    </c-card-content>

    <c-card-content class="mt-6">
      <h2 class="text-xl text-primary">Customizing SCSS variables</h2>

      <p>
        All the design tokens are also available as SCSS variables. They can be
        used to customize The components as well.
      </p>

      <code-block
        :code="scssOverride"
        theme="atom-one-dark"
        lang="scss"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />
    </c-card-content>

    <c-card-content class="mt-6">
      <h2 class="text-2xl capitalize font-bold text-primary-600">Typography</h2>

      <p>Font family used by CSC UI can also be customized</p>

      <code-block
        :code="fontOverride"
        theme="atom-one-dark"
        lang="css"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <code-block
        :code="fontOverrideHtml"
        theme="atom-one-dark"
        lang="html"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <div>
        <c-button class="custom-font">I should look different now</c-button>
      </div>
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
import { mdiStar } from '@mdi/js';

const themeOverrideVariables = `--c-primary-100: var(--c-link-100);
  --c-primary-200: var(--c-link-200);
  --c-primary-300: var(--c-link-300);
  --c-primary-400: var(--c-link-400);
  --c-primary-500: var(--c-link-500);
  --c-primary-600: var(--c-link-600);
  --c-primary-700: var(--c-link-700);
  --c-primary-800: var(--c-link-800);
  --c-primary-900: var(--c-link-900);
  --c-primary-rgb: var(--c-link-rgb);`;

const themeOverride = `:root {
  ${themeOverrideVariables}
}`;

const componentOverrideVariables = `/* customize the c-switch */
  --c-switch-border-color: var(--c-black);
  --c-switch-handle-color: var(--c-black);
  --c-switch-border-color-active: var(--c-accent-600);
  --c-switch-slider-color-active: transparent;
  --c-switch-handle-color-active: var(--c-accent-600);

  /* customize c-icon-button border radius */
  --c-icon-button-border-radius: 4px;`;

const componentOverride = `:root {
  ${componentOverrideVariables}
}`;

const classOverride = `.custom-button {
  /**
   * We're using the properties from the c-button,
   * but the same effect could be achieved by customizing the theme
   * inside here just like we did in the first example globally.
   */
  --c-button-background-color: var(--c-info-400);
  --c-button-text-color: var(--c-info-900);
  --c-button-background-color-hover: var(--c-accent-400);
  --c-button-border-radius: 100vw;
}`;

const scssOverride = `.custom-button {
  --c-button-background-color: $c-info-400;
  --c-button-text-color: $c-info-900;
  --c-button-background-color-hover: $c-accent-400;
  --c-button-border-radius: 100vw;
}`;

const fontOverride = `.custom-font {
  --c-font-family: cursive;
}`;

const fontOverrideHtml = `<c-button class="custom-font">I should look different now</c-button>`;
</script>

<style>
.custom-button {
  --c-button-background-color: var(--c-info-400);
  --c-button-text-color: var(--c-info-900);
  --c-button-background-color-hover: var(--c-accent-400);
  --c-button-border-radius: 100vw;
}

.custom-font {
  --c-font-family: cursive;
}
</style>
