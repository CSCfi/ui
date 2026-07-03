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
  </section>
</template>

<script setup lang="ts">
import type { ComponentView } from '~/composables/useManifest';

defineProps<{ view: ComponentView }>();
</script>
