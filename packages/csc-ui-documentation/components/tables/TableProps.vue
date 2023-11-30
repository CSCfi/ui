<template>
  <c-table responsive>
    <table>
      <thead>
        <tr>
          <th>Attribute</th>

          <th>Type</th>

          <th>Default</th>

          <th>Description</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in items" :key="item.name" class="border-b">
          <td class="w-56">{{ kebabify(item.name) }}</td>

          <td>
            <template v-if="hasCType(item)">
              <nuxt-link
                class="text-primary-600"
                :to="{ name: 'types', hash: `#${item.type.replace('[]', '')}` }"
              >
                {{ item.type }}
              </nuxt-link>
            </template>

            <template v-else>
              {{ item.type }}
            </template>
          </td>

          <td>{{ item.default }}</td>

          <td>{{ item.docs }}</td>
        </tr>
      </tbody>
    </table>
  </c-table>
</template>

<script setup lang="ts">
import typeDefinitions from '../../example-data/types';

type TypeTableItem = {
  name: string;
  type: string;
  default: string;
  docs: string;
};

defineProps<{
  items: TypeTableItem[];
}>();

const kebabify = (str: string) =>
  str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? '-' : '') + $.toLowerCase(),
  );

const hasCType = (item: TypeTableItem) => {
  return Object.keys(typeDefinitions).includes(item.type.replace('[]', ''));
};
</script>

<style lang="scss"></style>
