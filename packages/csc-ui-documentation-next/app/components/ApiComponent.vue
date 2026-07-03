<template>
  <section class="component-api" :aria-labelledby="`${view.tagName}--heading`">
    <h3 :id="view.tagName" class="component-api-heading">
      <code>&lt;{{ view.tagName }}&gt;</code>
    </h3>

    <p v-if="view.description" class="preline component-api-desc">
      {{ view.description }}
    </p>

    <template v-if="view.props.length">
      <h4 :id="`${view.tagName}--properties`">Properties</h4>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Attribute</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prop in view.props" :key="prop.name">
              <td><code>{{ prop.name }}</code></td>
              <td>
                <code v-if="prop.attribute">{{ prop.attribute }}</code>
                <span v-else class="muted">—</span>
              </td>
              <td>
                <!-- Aliased types link to their declaration in the Types
                     section on this page; type.text itself carries the
                     expanded union and shows on hover. Compound type text
                     (`CSelectItem[]`, `CFoo | null`) links each public type
                     name it mentions to its same-page anchor. -->
                <a
                  v-if="prop.typeAlias"
                  :href="`#${prop.typeAlias}`"
                  :title="prop.type"
                >
                  <code>{{ prop.typeAlias }}</code>
                </a>
                <code v-else>
                  <template
                    v-for="(segment, i) in typeSegments(prop.type)"
                    :key="i"
                  >
                    <a v-if="segment.link" :href="`#${segment.text}`">{{
                      segment.text
                    }}</a>
                    <template v-else>{{ segment.text }}</template>
                  </template>
                </code>
              </td>
              <td>
                <code v-if="prop.default">{{ prop.default }}</code>
                <span v-else class="muted">—</span>
              </td>
              <td class="preline">{{ prop.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="view.events.length">
      <h4 :id="`${view.tagName}--events`">Events</h4>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Detail</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in view.events" :key="event.name">
              <td><code>{{ event.name }}</code></td>
              <td><code>{{ event.detail }}</code></td>
              <td class="preline">{{ event.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="view.methods.length">
      <h4 :id="`${view.tagName}--methods`">Methods</h4>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Signature</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="method in view.methods" :key="method.name">
              <td><code>{{ method.name }}</code></td>
              <td><code>{{ method.signature }}</code></td>
              <td class="preline">{{ method.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="view.slots.length">
      <h4 :id="`${view.tagName}--slots`">Slots</h4>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Slot</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slot in view.slots" :key="slot.name">
              <td><code>{{ slot.name }}</code></td>
              <td class="preline">{{ slot.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="view.cssParts.length">
      <h4 :id="`${view.tagName}--css-parts`">CSS parts</h4>
      <p class="muted">
        Style from outside with
        <code>{{ view.tagName }}::part(name)</code> — parts are the library's
        only styling customization API.
      </p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Part</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="part in view.cssParts" :key="part.name">
              <td><code>{{ part.name }}</code></td>
              <td class="preline">{{ part.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="view.cssProperties.length">
      <h4 :id="`${view.tagName}--css-properties`">CSS custom properties</h4>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cssProp in view.cssProperties" :key="cssProp.name">
              <td><code>{{ cssProp.name }}</code></td>
              <td class="preline">{{ cssProp.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="view.types.length">
      <h4 :id="`${view.tagName}--types`">Types</h4>
      <p class="muted">
        Importable from the package root:
        <code>import type { … } from '@cscfi/csc-ui-next'</code>
      </p>
      <div v-for="apiType in view.types" :key="apiType.name" class="api-type">
        <h5 :id="apiType.name" class="api-type-heading">
          <code>{{ apiType.name }}</code>
          <span v-if="!apiType.owner" class="muted api-type-badge">shared</span>
        </h5>

        <p v-if="apiType.description" class="preline">
          {{ apiType.description }}
        </p>

        <!-- eslint-disable-next-line vue/no-v-html — Shiki output built at prerender from manifest type text -->
        <div
          v-if="typesHtml?.[apiType.name]"
          class="example-shiki"
          v-html="typesHtml[apiType.name]"
        />
        <pre v-else class="code-block"><code>{{ apiType.declaration }}</code></pre>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { ComponentView } from '~/composables/useManifest';

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

<style scoped>
.api-type-heading .api-type-badge {
  font-size: 0.7em;
  font-weight: 400;
  vertical-align: middle;
  margin-left: 0.5em;
  padding: 0.1em 0.6em;
  border: 1px solid var(--c-border, #ccc);
  border-radius: 999px;
}
</style>
