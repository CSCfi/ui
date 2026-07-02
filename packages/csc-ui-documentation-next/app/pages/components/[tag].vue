<template>
  <article v-if="component">
    <h1><code>&lt;{{ component.tagName }}&gt;</code></h1>

    <p v-if="component.description" class="lead preline">{{ component.description }}</p>

    <section v-if="usageHtml" class="api-section">
      <h2 id="usage">Usage</h2>
      <!-- eslint-disable-next-line vue/no-v-html — our own markdown, html disabled in the renderer -->
      <div class="usage" v-html="usageHtml" />
    </section>

    <section v-if="examples.length" class="api-section">
      <h2 id="examples">Examples</h2>
      <ExampleBlock
        v-for="example in examples"
        :key="example.name"
        :example="example"
      />
    </section>

    <section v-if="props.length" class="api-section">
      <h2 id="properties">Properties</h2>
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
            <tr v-for="prop in props" :key="prop.name">
              <td><code>{{ prop.name }}</code></td>
              <td>
                <code v-if="prop.attribute">{{ prop.attribute }}</code>
                <span v-else class="muted">—</span>
              </td>
              <td><code>{{ prop.type }}</code></td>
              <td>
                <code v-if="prop.default">{{ prop.default }}</code>
                <span v-else class="muted">—</span>
              </td>
              <td class="preline">{{ prop.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="component.events?.length" class="api-section">
      <h2 id="events">Events</h2>
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
            <tr v-for="event in component.events" :key="event.name">
              <td><code>{{ event.name }}</code></td>
              <td><code>{{ eventDetail(event) }}</code></td>
              <td class="preline">{{ event.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="methods.length" class="api-section">
      <h2 id="methods">Methods</h2>
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
            <tr v-for="method in methods" :key="method.name">
              <td><code>{{ method.name }}</code></td>
              <td><code>{{ method.csc?.signature ?? '()' }}</code></td>
              <td class="preline">{{ method.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="component.slots?.length" class="api-section">
      <h2 id="slots">Slots</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Slot</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slot in component.slots" :key="slot.name">
              <td><code>{{ slot.name }}</code></td>
              <td class="preline">{{ slot.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="component.cssParts?.length" class="api-section">
      <h2 id="css-parts">CSS parts</h2>
      <p class="muted">
        Style these from the outside with
        <code>{{ component.tagName }}::part(name)</code> — parts are the
        library's only styling customization API.
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
            <tr v-for="part in component.cssParts" :key="part.name">
              <td><code>{{ part.name }}</code></td>
              <td class="preline">{{ part.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="component.cssProperties?.length" class="api-section">
      <h2 id="css-properties">CSS custom properties</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cssProp in component.cssProperties" :key="cssProp.name">
              <td><code>{{ cssProp.name }}</code></td>
              <td class="preline">{{ cssProp.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import type { CemEvent } from '~/composables/useManifest';

const route = useRoute();

const { findComponent } = useManifest();

const component = findComponent(String(route.params.tag));

if (!component) {
  throw createError({ fatal: true, statusCode: 404, statusMessage: 'Unknown component' });
}

// Fields carry the property-side truth; the attributes array only lists the
// attribute-compatible subset — join them so the table shows both names.
const attributeByField = new Map(
  (component.attributes ?? []).map((attribute) => [attribute.fieldName, attribute.name]),
);

const props = (component.members ?? [])
  .filter((member) => member.kind === 'field')
  .map((member) => ({
    attribute: attributeByField.get(member.name) ?? null,
    default: member.default,
    description: member.description,
    name: member.name,
    type: member.type?.text ?? '',
  }));

const methods = (component.members ?? []).filter((member) => member.kind === 'method');

const eventDetail = (event: CemEvent) =>
  event.type?.text.replace(/^CustomEvent<(.*)>$/s, '$1') ?? 'void';

const examples = useExamples(component.tagName);

const usageMarkdown = useUsageDoc(component.tagName);

const usageHtml = usageMarkdown ? renderMarkdown(usageMarkdown) : null;

useHead({ title: `${component.tagName} — CSC Design System` });
</script>
