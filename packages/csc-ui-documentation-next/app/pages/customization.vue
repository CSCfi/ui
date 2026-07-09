<template>
  <article class="min-w-0 max-w-[52rem]">
    <h1 class="mb-[0.67em] text-[2rem] font-bold">Customization</h1>

    <p class="my-[1em] max-w-[45rem] text-[1.0625rem] text-on-surface-muted">
      Everything about making the design system yours: re-branding with theme
      seeds, dark mode, the semantic tokens, restyling components through their
      parts, and using the tokens in your own Tailwind build.
    </p>

    <flavor-switcher class="md:hidden" />

    <section v-for="section in sections" :key="section.id" class="mt-10">
      <h2
        :id="section.id"
        class="my-[0.83em] border-b border-border pb-1.5 text-2xl font-bold"
      >
        {{ section.title }}
      </h2>

      <p
        class="my-[1em] max-w-[45rem] whitespace-pre-line text-on-surface-muted"
      >
        {{ section.intro[flavor] ?? section.intro.all }}
      </p>

      <figure
        v-for="(block, index) in section.blocks[flavor]"
        :key="`${section.id}-${flavor}-${index}`"
        class="my-4 overflow-hidden rounded-lg border border-border"
      >
        <figcaption
          v-if="block.filename"
          class="border-b border-border bg-surface-muted px-4 py-2 font-mono text-[0.75rem] text-on-surface-faint"
        >
          {{ block.filename }}
        </figcaption>

        <!-- eslint-disable-next-line vue/no-v-html — Shiki output built at prerender from our own snippets -->
        <div
          v-if="blocksHtml[`${section.id}:${flavor}:${index}`]"
          class="example-shiki"
          v-html="blocksHtml[`${section.id}:${flavor}:${index}`]"
        />

        <pre
          v-else
          class="m-0 overflow-x-auto bg-[#0f172a] px-5 py-4 text-[0.8125rem] text-[#e2e8f0]"
        ><code class="bg-transparent p-0">{{ block.code }}</code></pre>
      </figure>

      <!-- Bespoke inserts, keyed by section id (see the plan: no generalized
           section engine — this page alone mixes data-driven prose/code with
           hand-written tables and a live playground). -->
      <client-only v-if="section.id === 'brand-theming'">
        <theme-playground />
      </client-only>

      <template v-if="section.id === 'tokens'">
        <template v-for="group in TOKEN_GROUPS" :key="group.heading">
          <h3 :class="H3">{{ group.heading }}</h3>

          <p v-if="group.note" class="my-2 text-sm text-on-surface-muted">
            {{ group.note }}
          </p>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr>
                  <th :class="TH">Token</th>

                  <th :class="TH"><span class="sr-only">Swatch</span></th>

                  <th :class="TH">Light</th>

                  <th :class="TH">Dark</th>

                  <th :class="TH">Purpose</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="row in group.rows" :key="row.token">
                  <td :class="TD">
                    <code class="whitespace-nowrap">--c-{{ row.token }}</code>
                  </td>

                  <td :class="TD">
                    <span
                      :class="SWATCH"
                      :style="{ background: `var(--c-${row.token})` }"
                    />
                  </td>

                  <td :class="TD">
                    <code class="whitespace-nowrap">{{ row.light }}</code>
                  </td>

                  <td :class="TD">
                    <code class="whitespace-nowrap">{{ row.dark }}</code>
                  </td>

                  <td :class="TD">{{ row.purpose }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <h3 :class="H3">Role tokens</h3>

        <p class="my-2 max-w-[45rem] text-sm text-on-surface-muted">
          Each of the eight role families — {{ ROLE_FAMILIES.join(', ') }} —
          exposes the same six tokens. The palette step behind each one is
          hand-tuned per family and mode, so the matrix below shows the live
          values instead of a step table.
        </p>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr>
                <th :class="TH">Token pattern</th>

                <th :class="TH">Purpose</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in ROLE_SEXTET" :key="row.pattern">
                <td :class="TD">
                  <code class="whitespace-nowrap">--c-{{ row.pattern }}</code>
                </td>

                <td :class="TD">{{ row.purpose }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr>
                <th :class="TH"><span class="sr-only">Family</span></th>

                <th
                  v-for="sextet in ROLE_SEXTET"
                  :key="sextet.pattern"
                  :class="TH"
                >
                  <code>{{ sextet.pattern }}</code>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="family in ROLE_FAMILIES" :key="family">
                <td :class="TD">
                  <code class="whitespace-nowrap">{{ family }}</code>
                </td>

                <td
                  v-for="token in roleTokens(family)"
                  :key="token"
                  :class="TD"
                >
                  <span
                    :class="SWATCH"
                    :style="{ background: `var(--c-${token})` }"
                    :title="`--c-${token}`"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>
  </article>
</template>

<script setup lang="ts">
import {
  CUSTOMIZATION_SECTIONS,
  ROLE_FAMILIES,
  ROLE_SEXTET,
  TOKEN_GROUPS,
  roleTokens,
  type CustomizationSection,
} from '~/content/customization';

const sections: CustomizationSection[] = CUSTOMIZATION_SECTIONS;

const { flavor } = useFlavor();

// Shared table-cell utilities (same shape as ApiComponent.vue; Tailwind scans
// these string literals like any template class attribute).
const TH =
  'border-b border-border px-3 py-2 text-left align-top font-semibold whitespace-nowrap text-on-surface-faint';

const TD = 'border-b border-border px-3 py-2 text-left align-top';

const H3 =
  'mb-1 mt-6 text-xs font-bold uppercase tracking-[0.04em] text-primary';

// Live swatch: resolves the token at render time, so it tracks both the
// theme mode and any playground/applyTheme re-seeding.
const SWATCH = 'inline-block size-4 rounded border border-border align-middle';

// Highlight every flavor's blocks at prerender (see utils/highlight.ts);
// switching flavor swaps pre-highlighted HTML client-side, like example tabs.
const { data } = await useAsyncData('customization', async () => {
  const { highlightCode } = await import('~/utils/highlight');

  const html: Record<string, string> = {};

  for (const section of sections) {
    for (const [sectionFlavor, blocks] of Object.entries(section.blocks)) {
      for (const [index, block] of blocks.entries()) {
        html[`${section.id}:${sectionFlavor}:${index}`] = await highlightCode(
          block.code,
          block.lang,
        );
      }
    }
  }

  return html;
});

const blocksHtml = computed(() => data.value ?? {});

useHead({ title: 'Customization — CSC Design System' });
</script>
