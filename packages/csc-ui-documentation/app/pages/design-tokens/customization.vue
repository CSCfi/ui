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
      <h2 class="text-xl text-primary">Customizing a theme color at runtime</h2>

      <p>
        The override above works, but you must restate every ramp step (
        <code>50</code>

        –
        <code>950</code>
        ) by hand — miss one and the hover, subtle and dark-mode states keep the
        old brand. Instead, give
        <code>applyTheme</code>

        just the base (
        <code>500</code>
        ) seed for the families you want to rebrand; it regenerates each full
        ramp with the same perceptual OKLCH generator the library ships with,
        and re-themes every component in both light and dark mode.
      </p>

      <code-block
        :code="applyThemeExample"
        theme="atom-one-dark"
        lang="ts"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <h3 class="text-lg text-primary mt-4">Try it live</h3>

      <p>
        Pick a base colour or choose a preset — the whole page re-themes from
        the single seed, in the current mode. (This demo resets when you leave
        the page.)
      </p>

      <div class="theme-playground grid gap-6">
        <label class="theme-playground__picker">
          <span>Primary seed</span>

          <input v-model="primarySeed" type="color" />

          <code>{{ primarySeed }}</code>

          <c-button size="small" outlined @click="applySeed()">Apply theme</c-button>
        </label>

      </div>

      <c-row gap="8">
        <button
          v-for="swatch in swatches"
          :key="swatch"
          class="size-7 supports-corner-shape:[corner-shape:squircle] supports-corner-shape:rounded-xl not-supports-corner-shape:rounded-md cursor-pointer"
          :style="`background-color: ${swatch}`"
          @click="applySeed(swatch)"
        />

        <c-button size="small" outlined @click="resetSeeds">Reset</c-button>
      </c-row>

      <div class="theme-preview">
        <c-button>Solid</c-button>

        <c-button outlined>Outlined</c-button>

        <c-switch>Switch</c-switch>

        <c-checkbox hide-details>Checkbox</c-checkbox>

        <c-tags>
          <c-tag>Tag</c-tag>

          <c-tag active>Active</c-tag>
        </c-tags>
      </div>

      <p>
        The overridable families are
        <code>primary</code>
        ,
        <code>secondary</code>

        ,
        <code>accent</code>

        ,
        <code>success</code>
        ,
        <code>info</code>

        ,
        <code>warning</code>

        ,
        <code>error</code>
        and
        <code>link</code>
        . Neutrals (surfaces, borders) stay fixed so the audited contrast holds.
        Call
        <code>resetTheme()</code>
        to revert.
      </p>

      <p>
        For server-rendered apps, avoid a flash of the default palette by
        generating the CSS on the server and injecting it into
        <code>&lt;head&gt;</code>

        with
        <code>themeToCss</code>
        :
      </p>

      <code-block
        :code="themeToCssExample"
        theme="atom-one-dark"
        lang="ts"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />
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
        Customizing converted components with
        <code>::part()</code>
      </h2>

      <p>
        Components converted to the Tailwind-variants styling system no longer
        expose
        <code>--c-*</code>
        override variables. Instead, each component stamps its public regions as
        <c-link
          href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part"
          target="_blank"
          rel="noopener"
          underline
        >
          CSS parts
        </c-link>

        (
        <code>root</code>

        ,
        <code>content</code>
        , …), which you can target from your own global stylesheet to restyle
        every instance at once — no prop needed on each element.
      </p>

      <code-block
        :code="partOverride"
        theme="atom-one-dark"
        lang="css"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        The live example below is scoped to a wrapper so it doesn't affect the
        other buttons on this page; dropping the wrapper selector applies it
        site-wide.
      </p>
    </c-card-content>

    <c-card-content>
      <div class="part-demo">
        <c-button>Rounded button</c-button>
      </div>
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
import { applyTheme, resetTheme } from '@cscfi/csc-ui-next';

const DEFAULT_PRIMARY = '#006778';

const primarySeed = ref(DEFAULT_PRIMARY);

const applySeed = (hex?: string) => {
  if (hex) {
    primarySeed.value = hex;
  }

  applyTheme({ primary: primarySeed.value });
};

const resetSeeds = () => {
  primarySeed.value = DEFAULT_PRIMARY;
  resetTheme();
};

const swatches = ref(['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#e500a4']);

// applyTheme writes to <html>, so it re-themes the whole site — revert when
// leaving this page so the live demo doesn't tint the rest of the docs.
// onUnmounted(() => resetTheme());

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

const applyThemeExample = `import { applyTheme } from '@cscfi/csc-ui-next';

// Supply only the base (500) seed per family you want to override.
applyTheme({
  primary: '#7c3aed',
  error: '#e11d48',
});

// Revert to the defaults later:
// resetTheme();`;

const themeToCssExample = `import { themeToCss } from '@cscfi/csc-ui-next';

// Pure — safe to run on the server. Returns a ':root { … }' string.
const css = themeToCss({ primary: '#7c3aed' });

// Inject into <head> before first paint (e.g. Nuxt useHead / Next metadata)
// so the branded palette is present on the very first render:
//   <style>{ css }</style>`;

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

const partOverride = `/* Targets the root part of every <c-button> instance */
c-button::part(root) {
  border-radius: 9999px;
  /* Unset the corner-shape from the default (squircle) */
  corner-shape: unset;
}`;

const classOverride = `.custom-button::part(root) {
  background-color: var(--c-info-400);
  color: var(--c-info-900);
  border-radius: 2px;
}
  
.custom-button:hover::part(root) {
  background-color: var(--c-info-500);
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
.custom-button::part(root) {
  background-color: var(--c-info-400);
  color: var(--c-info-900);
  border-radius: 2px;
}

.custom-button:hover::part(root) {
  background-color: var(--c-info-500);
}

.custom-font {
  --c-font-family: cursive;
}

.part-demo c-button::part(root) {
  border-radius: 9999px;
  corner-shape: unset;
}

.theme-playground {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin: 12px 0;
}

.theme-playground__picker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.theme-playground__picker input[type='color'] {
  inline-size: 40px;
  block-size: 32px;
  padding: 0;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  background: none;
  cursor: pointer;
}

.theme-preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}
</style>
