<template>
  <component-example name="nextcontrolled" rows>
    <template #title>Controlled open + placement</template>

    <template #subtitle>
      Controlled open state via the open prop and update:open event, driven from
      outside the menu, plus the position prop
    </template>

    <div class="flex items-center gap-3">
      <c-menu
        ref="menuRef"
        :open="open"
        position="bottom-end"
        @select="onSelect"
      >
        <c-button slot="trigger" outlined>
          Actions
          <c-icon :path="mdiChevronDown" />
        </c-button>

        <c-menu-item value="rename">Rename</c-menu-item>

        <c-menu-item value="duplicate">Duplicate</c-menu-item>

        <c-divider />

        <c-menu-item value="delete" danger>
          Delete
          <c-icon :path="mdiDelete" class="ml-auto" />
        </c-menu-item>
      </c-menu>

      <c-button text @click="open = !open">Toggle from outside</c-button>
    </div>

    <p class="mt-3">open = {{ open }} · last action = {{ selected ?? '—' }}</p>
  </component-example>
</template>

<script setup lang="ts">
import { mdiChevronDown, mdiDelete } from '@mdi/js';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const open = ref(false);

const selected = ref<null | string>(null);

const menuRef = ref<HTMLElement | null>(null);

const onSelect = (event: CustomEvent<{ value: string }>) => {
  selected.value = event.detail.value;
};

// `update:open` is a v-model-style event name, which Vue only binds via
// `@update:open` on a *component* — not on a custom element. So consume it with
// a native listener to keep local state in sync when the menu closes itself
// (outside click, Esc, or after a selection).
const onOpenChange = (event: Event) => {
  open.value = (event as CustomEvent<boolean>).detail;
};

onMounted(() => menuRef.value?.addEventListener('update:open', onOpenChange));

onBeforeUnmount(() =>
  menuRef.value?.removeEventListener('update:open', onOpenChange),
);
</script>
