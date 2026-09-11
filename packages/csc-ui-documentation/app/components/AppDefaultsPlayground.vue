<template>
  <figure class="my-6 rounded-lg border border-border bg-surface-muted p-4">
    <figcaption
      class="mb-3 text-[0.8125rem] font-semibold text-on-surface-faint"
    >
      App defaults playground — the fields below follow these defaults live
    </figcaption>

    <!-- Native controls on purpose: a c-* control here would itself follow
         the defaults it drives. -->
    <div class="flex flex-wrap gap-x-6 gap-y-3 text-sm text-on-surface">
      <label class="flex cursor-pointer items-center gap-2">
        <input
          v-model="labelOnTop"
          class="size-4 accent-primary"
          type="checkbox"
        />

        <code>c-text-field</code>
        label-on-top
      </label>

      <label class="flex cursor-pointer items-center gap-2">
        <input
          v-model="hideDetails"
          class="size-4 accent-primary"
          type="checkbox"
        />

        <code>c-text-field</code>
        hide-details
      </label>

      <label class="flex items-center gap-2">
        <code>c-text-field</code>
        size
        <select
          v-model="size"
          class="rounded border border-border bg-surface px-2 py-1 text-on-surface"
        >
          <option value="default">default</option>

          <option value="small">small</option>
        </select>
      </label>

      <label class="flex items-center gap-2">
        <code>c-select</code>
        texts
        <select
          v-model="language"
          class="rounded border border-border bg-surface px-2 py-1 text-on-surface"
        >
          <option value="en">English (built-in)</option>

          <option value="fi">suomi</option>
        </select>
      </label>
    </div>

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <c-text-field hint="Shown on your public profile" label="Display name" />

      <c-select
        v-model="country"
        hint="Clear and toggle labels follow the texts default"
        label="Country"
        clearable
      >
        <c-option name="Finland" value="fi">Finland</c-option>

        <c-option name="Sweden" value="se">Sweden</c-option>

        <c-option name="Norway" value="no">Norway</c-option>
      </c-select>
    </div>

    <c-button class="mt-4" size="small" @click="reset">Reset defaults</c-button>
  </figure>
</template>

<script setup lang="ts">
import {
  type CFieldSize,
  type CSelectTexts,
  applyDefaults,
  resetDefaults,
} from '@cscfi/csc-ui';
import { onBeforeUnmount, ref, watch } from 'vue';

const labelOnTop = ref(false);

const hideDetails = ref(false);

const size = ref<CFieldSize>('default');

const language = ref<'en' | 'fi'>('en');

const country = ref<string | null>('fi');

const FINNISH: CSelectTexts = {
  clearSelection: 'Tyhjennä valinta',
  more: (count) => `+${count} lisää`,
  remove: (label) => `Poista ${label}`,
  selectAll: () => 'Valitse kaikki',
  selected: (count) => `${count} valittu`,
  toggleOptions: 'Näytä vaihtoehdot',
};

// A control at its built-in value clears the key (`undefined`) instead of
// pinning the built-in as an app default, so "Reset" leaves no trace.
watch([labelOnTop, hideDetails, size], ([top, hide, fieldSize]) => {
  applyDefaults({
    'c-text-field': {
      hideDetails: hide || undefined,
      labelOnTop: top || undefined,
      size: fieldSize === 'default' ? undefined : fieldSize,
    },
  });
});

watch(language, (code) => {
  applyDefaults({ 'c-select': { texts: code === 'fi' ? FINNISH : undefined } });
});

const reset = () => {
  labelOnTop.value = false;
  hideDetails.value = false;
  size.value = 'default';
  language.value = 'en';
};

// The registry is app-wide; do not leak the demo into the component pages.
onBeforeUnmount(() => resetDefaults(['c-text-field', 'c-select']));
</script>
