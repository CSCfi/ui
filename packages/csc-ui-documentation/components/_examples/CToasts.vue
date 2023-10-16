<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
      <c-card style="width: 340px; max-width: 100%">
        <c-card-content>
          <h5>Per toast options</h5>

          <c-text-field
            v-model="messageText"
            v-control
            label="Message"
            hide-details
          ></c-text-field>

          <c-text-field
            v-model="title"
            v-control
            label="Title (optional)"
            hide-details
          ></c-text-field>

          <c-text-field
            v-model="closeText"
            v-control
            label="Close text (optional)"
            hide-details
          ></c-text-field>

          <c-text-field
            v-model="duration"
            v-control
            label="Duration, ms (optional)"
            type="number"
            hint="Default: 6000ms"
          ></c-text-field>

          <c-select
            v-model="type"
            v-control
            label="Type (optional)"
            :items="types"
            hint="Default: 'Info'"
            return-value
          ></c-select>

          <c-checkbox v-model="persistent" v-control hint="Default: false">
            Persistent (optional)
          </c-checkbox>

          <c-checkbox v-model="progress" v-control hint="Default: true">
            Show progress (optional)
          </c-checkbox>

          <c-button
            fit
            :disabled="(!custom && !messageText) || (custom && !customContent)"
            @click="onAddToast()"
          >
            Add toast
          </c-button>
        </c-card-content>
      </c-card>

      <div class="flex flex-col">
        <div class="flex flex-wrap gap-4">
          <c-select
            v-model="vertical"
            v-control
            label="Vertical position"
            :items="verticalOptions"
            hint="Default: 'Bottom'"
            return-value
          ></c-select>

          <c-select
            v-model="horizontal"
            v-control
            label="Horizontal position"
            :items="horizontalOptions"
            hint="Default: 'Right'"
            return-value
          ></c-select>

          <c-checkbox v-model="absolute" v-control hint="Default: false">
            Absolute positioning
          </c-checkbox>
        </div>

        <div
          class="rounded bg-tertiary-100 relative w-full h-full flex-1 min-h-[400px]"
        >
          <teleport to="body" :disabled="absolute">
            <c-toasts
              ref="toasts"
              :absolute="absolute"
              :horizontal="horizontal"
              :vertical="vertical"
            />
          </teleport>
        </div>
      </div>
    </div>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|basic
import { CSelectItem, CToastMessage, CToastType } from '@cscfi/csc-ui';
import { ref } from 'vue';

const toasts = ref<HTMLCToastsElement | null>(null);

const custom = ref(false);

const title = ref('');

const messageText = ref('A toast message');

const closeText = ref('');

const customContent = ref('');

const type = ref('info');

const duration = ref(6000);

const types: CSelectItem[] = [
  { name: 'Info', value: 'info' },
  { name: 'Success', value: 'success' },
  { name: 'Warning', value: 'warning' },
  { name: 'Error', value: 'error' },
];

const absolute = ref(false);

const persistent = ref(false);

const progress = ref(true);

const verticalOptions: CSelectItem[] = [
  { name: 'Top', value: 'top' },
  { name: 'Bottom', value: 'bottom' },
];

const vertical = ref('bottom');

const horizontalOptions: CSelectItem[] = [
  { name: 'Left', value: 'left' },
  { name: 'Center', value: 'center' },
  { name: 'Right', value: 'right' },
];

const horizontal = ref('right');

const onAddToast = () => {
  const message: CToastMessage = {
    type: type.value as CToastType,
    title: title.value,
    duration: duration.value,
    message: messageText.value,
    persistent: persistent.value,
    progress: progress.value,
    closeText: closeText.value,
  };

  toasts.value?.addToast(message);
};
// @example-end
</script>

<style lang="scss"></style>
