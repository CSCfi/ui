<template>
  <div>
    <!-- Hero: the pitch beside a live card of real components. Calm page
         surface; the only colour is the card's primary-subtle backdrop, which
         re-seeds with everything else. -->
    <section
      class="mx-auto grid max-w-300 items-center gap-x-16 gap-y-12 px-5 pt-12 pb-16 md:px-12 lg:pt-20 lg:pb-24 xl:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]"
    >
      <div>
        <p
          class="text-sm font-semibold tracking-[0.14em] text-primary uppercase"
        >
          CSC Design System
        </p>

        <h1
          class="mt-4 text-[2.5rem] leading-[1.1] font-bold tracking-tight text-balance md:text-[3.25rem]"
        >
          Build CSC services that look and work as one.
        </h1>

        <p
          class="mt-6 max-w-[34rem] text-lg text-pretty text-on-surface-muted md:text-xl"
        >
          {{ navComponents.length }} accessible web components in light and
          dark, for Vue, React, Angular or plain TypeScript.
        </p>

        <!-- `min-h-15`: the large buttons' resting height, reserved through
             the pre-upgrade window so the row does not grow on upgrade. -->
        <div class="mt-9 flex min-h-15 flex-wrap items-center gap-3">
          <c-button
            href="/getting-started"
            size="large"
            @click="onLinkClick($event, '/getting-started')"
          >
            Get started
          </c-button>

          <c-button
            appearance="outlined"
            href="/components"
            size="large"
            @click="onLinkClick($event, '/components')"
          >
            Browse components
          </c-button>
        </div>

        <p
          class="mt-6 inline-flex items-center gap-1 rounded-lg border border-border bg-surface-raised py-1 pr-1 pl-4 font-mono text-sm"
        >
          <span aria-hidden="true" class="text-on-surface-faint select-none">
            $
          </span>

          <code class="bg-transparent p-0">{{ INSTALL }}</code>

          <c-icon-button
            :aria-label="copied ? 'Copied' : 'Copy the install command'"
            :path="copied ? mdiCheck : mdiContentCopy"
            appearance="text"
            size="small"
            @click="copyInstall"
          />
        </p>
      </div>

      <div class="relative w-full max-w-[34rem]">
        <!-- Decorative backdrop: a soft tilted tint behind the card. -->
        <div
          aria-hidden="true"
          class="absolute -inset-4 -rotate-2 rounded-[2rem] bg-primary-subtle md:-inset-6"
        />

        <!-- The card's height is reserved until the client-only card mounts,
             so nothing below the hero moves. -->
        <div class="relative min-h-[27.25rem]">
          <landing-task-card />
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-300 px-5 md:px-12">
      <!-- Fast path for 3.x users. -->
      <p
        class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-surface-raised px-5 py-4"
      >
        <c-status type="info">4.0</c-status>

        <span>
          <strong>Upgrading from 3.x?</strong>
          4.0 is a rewrite with the same tag names.
        </span>

        <nuxt-link class="font-semibold text-link underline" to="/migration">
          Read the upgrade guide →
        </nuxt-link>
      </p>

      <section aria-labelledby="why" class="mt-24">
        <h2 id="why" class="text-3xl font-bold tracking-tight">
          One design system, every CSC service
        </h2>

        <p class="mt-3 max-w-[42rem] text-lg text-on-surface-muted">
          The components carry the CSC look, behaviour and accessibility, so a
          service team builds its own pages instead of its own controls.
        </p>

        <ul class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="pillar in PILLARS"
            :key="pillar.id"
            class="flex flex-col rounded-xl border border-border bg-surface-raised p-6"
          >
            <span
              aria-hidden="true"
              class="flex size-11 items-center justify-center rounded-lg bg-primary-subtle text-on-primary-subtle"
            >
              <c-icon :path="pillar.icon" :size="24" />
            </span>

            <h3 class="mt-5 text-lg font-bold">{{ pillar.title }}</h3>

            <p class="mt-2 flex-1 text-on-surface-muted">{{ pillar.text }}</p>

            <!-- Any framework: the four flavors, decorative (the text names
                 them). -->
            <p
              v-if="pillar.id === 'frameworks'"
              aria-hidden="true"
              class="mt-4 flex items-center gap-3"
            >
              <c-icon
                v-for="item in FLAVORS"
                :key="item.id"
                :class="ICON_COLORS[item.id]"
                :path="item.icon"
                :size="24"
              />
            </p>

            <!-- Your brand: seed presets that re-brand the whole page,
                 shared with the toolbar's colour switcher. -->
            <p
              v-if="pillar.id === 'theming'"
              aria-label="Primary colour"
              class="mt-4 flex items-center gap-2"
              role="group"
            >
              <button
                v-for="preset in SEED_PRESETS"
                :key="preset.value"
                :aria-label="preset.label"
                :aria-pressed="seeds.primary === preset.value"
                :style="{ 'background-color': preset.value }"
                class="size-7 cursor-pointer rounded-full border-2 border-surface-raised outline-2 outline-offset-0 outline-transparent aria-pressed:outline-on-surface"
                type="button"
                @click="setSeed('primary', preset.value)"
              />
            </p>

            <nuxt-link
              :to="pillar.link.to"
              class="mt-5 font-semibold text-link underline"
            >
              {{ pillar.link.label }} →
            </nuxt-link>
          </li>
        </ul>
      </section>

      <section aria-labelledby="stack" class="mt-24">
        <h2 id="stack" class="text-3xl font-bold tracking-tight">
          Works in your stack
        </h2>

        <p class="mt-3 max-w-[42rem] text-lg text-on-surface-muted">
          {{ firstComponent.intro[flavor] ?? firstComponent.intro.all }}
        </p>

        <figure
          class="mt-8 overflow-hidden rounded-xl border border-border bg-surface-raised"
        >
          <!-- Picking a flavor here switches the documentation-wide flavor,
               as every example's tabs do (ADR-0020). -->
          <figcaption
            class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-surface-muted px-4 py-2"
          >
            <c-button-group
              :value="flavor"
              aria-label="Flavor"
              size="small"
              mandatory
              @input="onFlavorInput"
            >
              <c-button v-for="item in FLAVORS" :key="item.id" :value="item.id">
                <c-icon
                  slot="icon"
                  :class="ICON_COLORS[item.id]"
                  :path="item.icon"
                  :size="16"
                />

                {{ item.label }}
              </c-button>
            </c-button-group>

            <span class="ml-auto font-mono text-xs text-on-surface-muted">
              {{ snippet?.filename }}
            </span>
          </figcaption>

          <!-- eslint-disable-next-line vue/no-v-html — Shiki output built at prerender from our own snippets -->
          <div
            v-if="snippetHtml[flavor]"
            class="example-shiki"
            v-html="snippetHtml[flavor]"
          />

          <pre
            v-else
            class="m-0 overflow-x-auto bg-[#0f172a] px-5 py-4 text-[0.8125rem] text-[#e2e8f0]"
          ><code class="bg-transparent p-0">{{ snippet?.code }}</code></pre>
        </figure>

        <p class="mt-5">
          <nuxt-link
            class="font-semibold text-link underline"
            to="/getting-started"
          >
            Install, set up and theme it in Getting started →
          </nuxt-link>
        </p>
      </section>

      <section aria-labelledby="components" class="mt-24 mb-24">
        <h2 id="components" class="text-3xl font-bold tracking-tight">
          {{ navComponents.length }} components, ready to compose
        </h2>

        <p class="mt-3 max-w-[42rem] text-lg text-on-surface-muted">
          Every component page shows live examples in your flavor and an API
          reference generated from the same source the build verifies.
        </p>

        <ul class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="group in COMPONENT_GROUPS"
            :key="group.id"
            class="flex flex-col rounded-xl border border-border bg-surface-raised p-6"
          >
            <h3
              class="flex items-baseline justify-between gap-3 text-lg font-bold"
            >
              <!-- The group's section on the components overview page. The
                   card holds a link per component, so only its heading
                   links (links cannot nest). -->
              <nuxt-link
                :to="`/components#${group.id}`"
                class="text-inherit no-underline hover:underline"
              >
                {{ group.title }} →
              </nuxt-link>

              <span class="text-sm font-semibold text-on-surface-muted">
                {{ group.tags.length }}
              </span>
            </h3>

            <p class="mt-2 text-sm text-on-surface-muted">
              {{ group.summary }}
            </p>

            <ul class="mt-4 flex flex-wrap gap-1.5">
              <li v-for="tag in group.tags" :key="tag">
                <nuxt-link
                  :to="`/components/${tag}`"
                  class="block rounded-md bg-surface-muted px-2 py-0.5 font-mono text-xs text-on-surface no-underline hover:bg-primary-subtle hover:text-on-primary-subtle"
                >
                  {{ tag }}
                </nuxt-link>
              </li>
            </ul>
          </li>
        </ul>

        <div class="mt-10 flex min-h-13 items-center">
          <c-button
            appearance="outlined"
            href="/components"
            @click="onLinkClick($event, '/components')"
          >
            Browse all {{ navComponents.length }} components
          </c-button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DEFAULT_SEEDS } from '@cscfi/csc-ui';
import {
  mdiCheck,
  mdiContentCopy,
  mdiFormTextbox,
  mdiHumanHandsup,
  mdiPaletteOutline,
  mdiPuzzleOutline,
} from '@mdi/js';

import { COMPONENT_GROUPS } from '~/content/component-groups';
import { GETTING_STARTED_SECTIONS } from '~/content/getting-started';

definePageMeta({ layout: 'landing' });

const INSTALL = 'pnpm add @cscfi/csc-ui';

const PILLARS = [
  {
    icon: mdiPuzzleOutline,
    id: 'frameworks',
    link: { label: 'Getting started', to: '/getting-started' },
    text: 'Native custom elements: the same <c-*> tags in Vue, Angular and plain TypeScript, and typed components for React.',
    title: 'Any framework',
  },
  {
    icon: mdiHumanHandsup,
    id: 'accessibility',
    link: { label: 'Accessibility', to: '/getting-started#accessibility' },
    text: 'Keyboard, focus and ARIA come built in. Every component is checked with axe in light and dark and tested on Chromium, Firefox and WebKit.',
    title: 'Accessible by default',
  },
  {
    icon: mdiPaletteOutline,
    id: 'theming',
    link: { label: 'Customization', to: '/customization' },
    text: 'Every colour is a semantic token: components follow light or dark mode, and one seed colour re-brands a whole family. Try one:',
    title: 'Light, dark, your brand',
  },
  {
    icon: mdiFormTextbox,
    id: 'forms',
    link: { label: 'Text field', to: '/components/c-text-field' },
    text: 'Fields submit and reset with a native <form>, and work with browser autofill and password managers.',
    title: 'Forms that behave natively',
  },
];

// The seed presets the theming pillar offers; the first is the CSC default.
const SEED_PRESETS = [
  { label: 'CSC teal', value: DEFAULT_SEEDS.primary },
  { label: 'CSC magenta', value: DEFAULT_SEEDS.secondary },
  { label: 'Blue', value: '#1982c4' },
  { label: 'Purple', value: '#6a4c93' },
];

const { navComponents } = useManifest();

const { flavor, setFlavor } = useFlavor();

const { seeds, setSeed } = useThemeSeeds();

// The snippet is getting-started's "Use a component" section, so the two
// pages can never disagree.
const firstComponent = GETTING_STARTED_SECTIONS.find(
  (section) => section.id === 'first-component',
)!;

const snippet = computed(() => firstComponent.blocks[flavor.value][0]);

// Highlight every flavor at prerender (see utils/highlight.ts); switching
// flavor swaps pre-highlighted HTML client-side.
const { data } = await useAsyncData('landing-stack', async () => {
  const { highlightCode } = await import('~/utils/highlight');

  const html: Partial<Record<Flavor, string>> = {};

  for (const { id } of FLAVORS) {
    const block = firstComponent.blocks[id][0];

    if (block) html[id] = await highlightCode(block.code, block.lang);
  }

  return html;
});

const snippetHtml = computed(() => data.value ?? {});

const onFlavorInput = (event: Event) => {
  setFlavor((event.target as { value: Flavor } & HTMLElement).value);
};

// A c-button with `href` renders a real link (crawlable, opens in a new tab
// on a modified click); a plain click stays in the client router.
const onLinkClick = (event: MouseEvent, to: string) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  navigateTo(to);
};

const copied = ref(false);

const copyInstall = async () => {
  try {
    await navigator.clipboard.writeText(INSTALL);
  } catch {
    // No clipboard (an insecure context, a denied permission): the command
    // stays selectable on the page.
    return;
  }

  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};

const DESCRIPTION = `${navComponents.length} accessible web components for CSC services, in light and dark, for Vue, React, Angular or plain TypeScript.`;

useSeoMeta({
  description: DESCRIPTION,
  ogDescription: DESCRIPTION,
  ogTitle: 'CSC Design System',
  title: 'CSC Design System',
  twitterCard: 'summary_large_image',
});
</script>
