<template>
  <div v-if="parentView" class="flex items-start gap-10">
    <article class="min-w-0 flex-1">
      <h1 class="mb-[0.67em] text-[2rem] font-bold">
        <code>&lt;{{ parentView.tagName }}&gt;</code>
      </h1>

      <p
        v-if="parentView.description"
        class="my-[1em] max-w-[45rem] whitespace-pre-line text-[1.0625rem] text-on-surface-muted"
      >
        {{ parentView.description }}
      </p>

      <section v-if="usageHtml" class="mt-10">
        <h2
          id="usage"
          class="my-[0.83em] scroll-mt-20 border-b border-border pb-1.5 text-2xl font-bold"
        >
          Usage
        </h2>
        <!-- eslint-disable-next-line vue/no-v-html — our markdown, html disabled, code Shiki-highlighted at prerender -->
        <div class="usage" v-html="usageHtml" />
      </section>

      <section v-if="examples.length" class="mt-10">
        <h2
          id="examples"
          class="my-[0.83em] scroll-mt-20 border-b border-border pb-1.5 text-2xl font-bold"
        >
          Examples
        </h2>

        <example-block
          v-for="example in examples"
          :key="example.name"
          :example="example"
          :html="examplesHtml[example.name]"
        />
      </section>

      <section class="mt-10">
        <h2
          id="api"
          class="my-[0.83em] scroll-mt-20 border-b border-border pb-1.5 text-2xl font-bold"
        >
          API reference
        </h2>

        <api-component
          v-for="view in views"
          :key="view.tagName"
          :linkable-types="pageTypeNames"
          :types-html="typesHtml"
          :view="view"
        />
      </section>
    </article>

    <aside
      aria-label="On this page"
      class="sticky top-24 max-h-[calc(100vh-3rem)] w-56 shrink-0 overflow-y-auto text-[0.8125rem] max-lg:hidden"
    >
      <p
        class="mb-2 text-[0.6875rem] font-bold uppercase tracking-wider text-primary"
      >
        On this page
      </p>

      <nav ref="navRef" class="relative flex flex-col border-l border-border">
        <!-- Scroll-position indicator: slides along the rail to the link of
             the section currently under the sticky toolbar. -->
        <span
          v-show="marker.visible"
          aria-hidden="true"
          class="absolute -left-px w-0.5 bg-primary transition-[top,height] duration-200"
          :style="{ top: `${marker.top}px`, height: `${marker.height}px` }"
        />

        <a v-if="usageHtml" :class="tocClass('usage')" href="#usage">Usage</a>

        <a
          v-if="examples.length"
          :class="tocClass('examples')"
          href="#examples"
        >
          Examples
        </a>

        <a
          v-for="example in examples"
          :key="example.name"
          :class="[tocClass(exampleAnchor(example.name)), 'pl-6']"
          :href="`#${exampleAnchor(example.name)}`"
        >
          {{ example.title }}
        </a>

        <a :class="tocClass('api')" href="#api">API reference</a>

        <template v-for="view in views" :key="view.tagName">
          <a
            :class="[
              tocClass(view.tagName),
              'mt-2 font-mono text-[0.78rem] font-semibold',
            ]"
            :href="`#${view.tagName}`"
          >
            {{ view.tagName }}
          </a>

          <a
            v-for="section in view.sections"
            :key="section.id"
            :class="[tocClass(section.id), 'pl-6']"
            :href="`#${section.id}`"
          >
            {{ section.label }}
          </a>
        </template>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { toComponentView, useManifest } from '~/composables/useManifest';

// The TOC target currently scrolled under the toolbar (see scrollspy below).
const activeId = ref('');

// Shared by every rail link; component/sub links append their own utilities
// (Tailwind orders pl-* after px-*, so the pl-6 override wins). The active
// text color is composed per-link in tocClass — never put the conflicting
// text utilities in one class list.
const TOC_LINK =
  '-ml-px border-l-2 border-l-transparent px-3 py-[0.15rem] no-underline hover:border-l-primary hover:text-on-surface';

const tocClass = (id: string) => [
  TOC_LINK,
  activeId.value === id ? 'text-on-surface' : 'text-on-surface-muted',
];

const route = useRoute();

const tag = String(route.params.tag);

const { findComponent, parentOf, resolveGroup } = useManifest();

// A folded composed child has no page of its own — send it to its parent's
// group (ADR-0013). routeRules also covers direct static hits.
const parent = parentOf(tag);

if (parent) {
  await navigateTo(`/components/${parent}#${tag}`, { redirectCode: 301 });
}

const group = resolveGroup(tag);

if (!parent && (!group.length || !findComponent(tag))) {
  throw createError({
    fatal: true,
    statusCode: 404,
    statusMessage: 'Unknown component',
  });
}

// Types dedupe across the group: a type renders once per page, under the
// first (parent-first) component that documents it.
const claimedTypes = new Set<string>();

const views = group.map((c) => toComponentView(c, claimedTypes));

// Every type rendered somewhere on this page — type names appearing in prop
// type text link to these same-page anchors.
const pageTypeNames = [...claimedTypes];

const parentView = views[0];

const examples = useExamples(group.map((c) => c.tagName));

const usageSource = useUsageDoc(tag);

// Highlight (Shiki) + render markdown at prerender; serialized into the static
// payload so the client ships no highlighter. See utils/highlight.ts.
const { data } = await useAsyncData(`page-${tag}`, async () => {
  const { highlightCode, renderMarkdown } = await import('~/utils/highlight');

  const examplesHtml: Record<string, Record<string, string>> = {};

  for (const example of examples) {
    const byFlavor: Record<string, string> = {};

    for (const t of example.tabs) {
      byFlavor[t.flavor] = await highlightCode(t.code, t.lang);
    }

    examplesHtml[example.name] = byFlavor;
  }

  const typesHtml: Record<string, string> = {};

  for (const view of views) {
    for (const apiType of view.types) {
      typesHtml[apiType.name] = await highlightCode(apiType.declaration, 'ts');
    }
  }

  return {
    examplesHtml,
    typesHtml,
    usageHtml: usageSource ? await renderMarkdown(usageSource) : null,
  };
});

const examplesHtml = computed(() => data.value?.examplesHtml ?? {});

const typesHtml = computed(() => data.value?.typesHtml ?? {});

const usageHtml = computed(() => data.value?.usageHtml ?? null);

// ---- "On this page" scrollspy ----------------------------------------------
// The active section is the last TOC target whose heading sits above the
// sticky toolbar; the rail marker slides to its link.

const navRef = useTemplateRef<HTMLElement>('navRef');

const marker = reactive({ height: 0, top: 0, visible: false });

// Every anchor the rail links to, in document order (mirrors the template).
const tocIds = computed(() => {
  const ids: string[] = [];

  if (usageHtml.value) ids.push('usage');

  if (examples.length) {
    ids.push(
      'examples',
      ...examples.map((example) => exampleAnchor(example.name)),
    );
  }

  ids.push('api');

  for (const view of views) {
    ids.push(view.tagName, ...view.sections.map((section) => section.id));
  }

  return ids;
});

// Sticky toolbar (60px) + the headings' scroll breathing room.
const HEADER_OFFSET = 104;

const positionMarker = () => {
  const link = navRef.value?.querySelector<HTMLElement>(
    `a[href="#${CSS.escape(activeId.value)}"]`,
  );

  if (!link) {
    marker.visible = false;

    return;
  }

  // offsetTop is relative to the nav (its offsetParent — it is `relative`).
  marker.top = link.offsetTop;
  marker.height = link.offsetHeight;
  marker.visible = true;
};

const updateActive = () => {
  let current = '';

  for (const id of tocIds.value) {
    const el = document.getElementById(id);

    if (el && el.getBoundingClientRect().top <= HEADER_OFFSET) current = id;
  }

  // Pin the last section once the page is scrolled to the bottom (short tail
  // sections could otherwise never reach the toolbar line).
  const scrolledToBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2;

  if (scrolledToBottom) current = tocIds.value.at(-1) ?? current;

  activeId.value = current || (tocIds.value[0] ?? '');
  positionMarker();
};

let frame = 0;

const scheduleUpdate = () => {
  if (frame) return;

  frame = requestAnimationFrame(() => {
    frame = 0;
    updateActive();
  });
};

let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
  window.addEventListener('scroll', scheduleUpdate, { passive: true });

  // Content height changes without a scroll event (flavor switch swapping
  // code blocks, example demos hydrating) — re-measure on any body resize.
  resizeObserver = new ResizeObserver(scheduleUpdate);
  resizeObserver.observe(document.body);

  updateActive();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleUpdate);
  resizeObserver?.disconnect();

  if (frame) cancelAnimationFrame(frame);
});

useHead({ title: `${tag} — CSC Design System` });
</script>
