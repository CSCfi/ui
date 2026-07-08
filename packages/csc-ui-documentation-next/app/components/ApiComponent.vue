<template>
  <section
    :aria-labelledby="`${view.tagName}--heading`"
    class="mt-8 border-t border-dashed border-border pt-5 first-of-type:border-t-0"
  >
    <h3 :id="view.tagName" class="mb-1 text-[1.35rem] font-bold">
      <code>&lt;{{ view.tagName }}&gt;</code>
    </h3>

    <p
      v-if="view.description"
      class="mb-[1em] whitespace-pre-line text-on-surface-muted"
    >
      {{ view.description }}
    </p>

    <template v-if="view.props.length">
      <h4 :id="`${view.tagName}--properties`" :class="H4">Properties</h4>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th :class="TH">Property</th>
              <th :class="TH">Attribute</th>
              <th :class="TH">Type</th>
              <th :class="TH">Default</th>
              <th :class="TH">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prop in view.props" :key="prop.name">
              <td :class="TD"><code class="whitespace-nowrap">{{ prop.name }}</code></td>
              <td :class="TD">
                <code v-if="prop.attribute">{{ prop.attribute }}</code>
                <span v-else class="text-on-surface-faint">—</span>
              </td>
              <td :class="TD">
                <!-- Aliased types link to their declaration in the Types
                     section on this page; type.text itself carries the
                     expanded union and shows on hover. Compound type text
                     (`CSelectItem[]`, `CFoo | null`) links each public type
                     name it mentions to its same-page anchor. -->
                <c-link
                  v-if="prop.typeAlias"
                  :href="`#${prop.typeAlias}`"
                  :title="prop.type"
                  underline
                >
                  <code>{{ prop.typeAlias }}</code>
                </c-link>

                <code v-else>
                  <template
                    v-for="(segment, i) in typeSegments(prop.type)"
                    :key="i"
                  >
                    <c-link v-if="segment.link" :href="`#${segment.text}`" underline>{{
                      segment.text
                    }}</c-link>
                    <template v-else>{{ segment.text }}</template>
                  </template>
                </code>
              </td>
              <td :class="TD">
                <code v-if="prop.default">{{ prop.default }}</code>
                <span v-else class="text-on-surface-faint">—</span>
              </td>
              <td :class="TD" class="whitespace-pre-line">{{ prop.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="view.events.length">
      <h4 :id="`${view.tagName}--events`" :class="H4">Events</h4>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th :class="TH">Event</th>
              <th :class="TH">Detail</th>
              <th :class="TH">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in view.events" :key="event.name">
              <td :class="TD"><code class="whitespace-nowrap">{{ event.name }}</code></td>
              <td :class="TD"><code>{{ event.detail }}</code></td>
              <td :class="TD" class="whitespace-pre-line">{{ event.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="view.methods.length">
      <h4 :id="`${view.tagName}--methods`" :class="H4">Methods</h4>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th :class="TH">Method</th>
              <th :class="TH">Signature</th>
              <th :class="TH">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="method in view.methods" :key="method.name">
              <td :class="TD"><code class="whitespace-nowrap">{{ method.name }}</code></td>
              <td :class="TD"><code>{{ method.signature }}</code></td>
              <td :class="TD" class="whitespace-pre-line">{{ method.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="view.slots.length">
      <h4 :id="`${view.tagName}--slots`" :class="H4">Slots</h4>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th :class="TH">Slot</th>
              <th :class="TH">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slot in view.slots" :key="slot.name">
              <td :class="TD"><code class="whitespace-nowrap">{{ slot.name }}</code></td>
              <td :class="TD" class="whitespace-pre-line">{{ slot.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="view.cssParts.length">
      <h4 :id="`${view.tagName}--css-parts`" :class="H4">CSS parts</h4>
      <p class="my-[1em] text-on-surface-faint">
        Style from outside with
        <code>{{ view.tagName }}::part(name)</code> — parts are the library's
        only styling customization API.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th :class="TH">Part</th>
              <th :class="TH">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="part in view.cssParts" :key="part.name">
              <td :class="TD"><code class="whitespace-nowrap">{{ part.name }}</code></td>
              <td :class="TD" class="whitespace-pre-line">{{ part.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="view.cssProperties.length">
      <h4 :id="`${view.tagName}--css-properties`" :class="H4">
        CSS custom properties
      </h4>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th :class="TH">Property</th>
              <th :class="TH">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cssProp in view.cssProperties" :key="cssProp.name">
              <td :class="TD"><code class="whitespace-nowrap">{{ cssProp.name }}</code></td>
              <td :class="TD" class="whitespace-pre-line">{{ cssProp.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="view.types.length">
      <h4 :id="`${view.tagName}--types`" :class="H4">Types</h4>
      <p class="my-[1em] text-on-surface-faint">
        Importable from the package root:
        <code>import type { … } from '@cscfi/csc-ui-next'</code>
      </p>
      <div v-for="apiType in view.types" :key="apiType.name">
        <h5 :id="apiType.name" class="my-[1.67em] text-[0.83em] font-bold">
          <code>{{ apiType.name }}</code>
          <span
            v-if="!apiType.owner"
            class="ml-[0.5em] rounded-full border border-border px-[0.6em] py-[0.1em] align-middle text-[0.7em] font-normal text-on-surface-faint"
          >
            shared
          </span>
        </h5>

        <p v-if="apiType.description" class="my-[1em] whitespace-pre-line">
          {{ apiType.description }}
        </p>

        <!-- eslint-disable-next-line vue/no-v-html — Shiki output built at prerender from manifest type text -->
        <div
          v-if="typesHtml?.[apiType.name]"
          class="example-shiki"
          v-html="typesHtml[apiType.name]"
        />
        <pre
          v-else
          class="my-[1em] overflow-x-auto rounded-lg bg-[#0f172a] px-5 py-4 text-[#e2e8f0]"
        ><code class="bg-transparent p-0 text-inherit">{{ apiType.declaration }}</code></pre>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { ComponentView } from '~/composables/useManifest';

// Shared table-cell and section-heading utilities (Tailwind scans these
// string literals like any template class attribute).
const TH =
  'border-b border-border px-3 py-2 text-left align-top font-semibold whitespace-nowrap text-on-surface-faint';

const TD = 'border-b border-border px-3 py-2 text-left align-top';

const H4 =
  'mb-2 mt-6 text-xs font-bold uppercase tracking-[0.04em] text-on-surface-faint text-primary';

const props = defineProps<{
  /** Names of every type rendered on this page — mentions of these in prop
   *  type text become same-page anchor links. */
  linkableTypes?: string[];
  /** Shiki-highlighted declarations keyed by type name, built at prerender. */
  typesHtml?: Record<string, string>;
  view: ComponentView;
}>();

/** Split a type's text into plain and linkable segments, so
 *  `CSelectItem[]` renders as a `CSelectItem` link followed by `[]`. */
const typeSegments = (text: string): { link?: boolean; text: string }[] => {
  const names = props.linkableTypes ?? [];

  if (!names.length || !text) return [{ text }];

  const matcher = new RegExp(`\\b(${names.join('|')})\\b`, 'g');

  return text
    .split(matcher)
    .filter(Boolean)
    .map((segment) =>
      names.includes(segment) ? { link: true, text: segment } : { text: segment },
    );
};
</script>
