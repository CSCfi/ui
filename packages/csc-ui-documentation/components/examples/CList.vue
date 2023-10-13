<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-list>
      <c-list-item>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </c-list-item>

      <c-list-item>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </c-list-item>

      <c-list-item>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </c-list-item>

      <c-list-item>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </c-list-item>
    </c-list>
  </component-example>

  <component-example name="titles" rows>
    <template #title>With titles</template>

    <c-list>
      <c-list-item>
        <c-list-item-title>Title for list item 1</c-list-item-title>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </c-list-item>

      <c-list-item>
        <c-list-item-title>Title for list item 2</c-list-item-title>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </c-list-item>

      <c-list-item>
        <c-list-item-title>Title for list item 3</c-list-item-title>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </c-list-item>

      <c-list-item>
        <c-list-item-title>Title for list item 4</c-list-item-title>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </c-list-item>
    </c-list>
  </component-example>

  <component-example name="slot" rows>
    <template #title>Slots</template>

    <c-list>
      <c-list-item>
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiHome" />

        <c-list-item-title>Address</c-list-item-title>

        Example street 12
        <c-icon-button slot="post" size="small" text>
          <c-icon :path="mdiPencil" />
        </c-icon-button>
      </c-list-item>

      <c-list-item>
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiPhone" />

        <c-list-item-title>Phone</c-list-item-title>

        +358 40 1234 123
        <c-icon-button slot="post" size="small" text>
          <c-icon :path="mdiPencil" />
        </c-icon-button>
      </c-list-item>

      <c-list-item>
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiEmail" />

        <c-list-item-title>Email</c-list-item-title>

        example.person@example.com
        <c-icon-button slot="post" size="small" text>
          <c-icon :path="mdiPencil" />
        </c-icon-button>
      </c-list-item>
    </c-list>
  </component-example>

  <component-example name="disabled" rows>
    <template #title>Disabled</template>

    <c-switch v-model="disabled" v-control>
      {{ disabled ? 'Disabled' : 'Not disabled' }}
    </c-switch>

    <c-list :disabled="disabled">
      <c-list-item>
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiHome" />

        <c-list-item-title>Address</c-list-item-title>

        Example street 12
        <c-icon-button slot="post" :disabled="disabled" size="small" text>
          <c-icon :path="mdiPencil" />
        </c-icon-button>
      </c-list-item>

      <c-list-item>
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiPhone" />

        <c-list-item-title>Phone</c-list-item-title>

        +358 40 1234 123
        <c-icon-button slot="post" :disabled="disabled" size="small" text>
          <c-icon :path="mdiPencil" />
        </c-icon-button>
      </c-list-item>

      <c-list-item>
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiEmail" />

        <c-list-item-title>Email</c-list-item-title>

        example.person@example.com
        <c-icon-button slot="post" :disabled="disabled" size="small" text>
          <c-icon :path="mdiPencil" />
        </c-icon-button>
      </c-list-item>
    </c-list>
  </component-example>

  <component-example name="disabledItems" rows>
    <template #title>Disabled items</template>

    <c-list>
      <c-list-item>
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiHome" />

        <c-list-item-title>Address</c-list-item-title>

        Example street 12
        <c-icon-button slot="post" size="small" text>
          <c-icon :path="mdiPencil" />
        </c-icon-button>
      </c-list-item>

      <c-list-item>
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiPhone" />

        <c-list-item-title>Phone</c-list-item-title>

        +358 40 1234 123
        <c-icon-button slot="post" size="small" text>
          <c-icon :path="mdiPencil" />
        </c-icon-button>
      </c-list-item>

      <c-list-item disabled>
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiEmail" />

        <c-list-item-title>Email</c-list-item-title>

        example.person@example.com
        <c-icon-button slot="post" size="small" text disabled>
          <c-icon :path="mdiPencil" />
        </c-icon-button>
      </c-list-item>
    </c-list>
  </component-example>

  <component-example name="actions" rows>
    <template #title>Action items</template>

    <c-list>
      <c-list-item
        ripple
        @click="onItemClick('Address')"
        @keyup.enter="onItemClick('Address')"
        @keyup.space="onItemClick('Address')"
      >
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiHome" />

        <c-list-item-title>Address</c-list-item-title>

        Example street 12
      </c-list-item>

      <c-list-item
        ripple
        @click="onItemClick('Phone')"
        @keyup.enter="onItemClick('Phone')"
        @keyup.space="onItemClick('Phone')"
      >
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiPhone" />

        <c-list-item-title>Phone</c-list-item-title>

        +358 40 1234 123
      </c-list-item>

      <c-list-item
        ripple
        @click="onItemClick('Email')"
        @keyup.enter="onItemClick('Email')"
        @keyup.space="onItemClick('Email')"
      >
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiEmail" />

        <c-list-item-title>Email</c-list-item-title>

        example.person@example.com
      </c-list-item>
    </c-list>

    <teleport to="body">
      <c-toasts ref="toasts" />
    </teleport>
  </component-example>

  <component-example name="active" rows>
    <template #title>Active items</template>

    <c-list>
      <c-list-item :active="selections[0]">
        <c-checkbox slot="pre" v-model="selections[0]" v-control hide-details />

        <c-list-item-title>Address</c-list-item-title>

        Example street 12
      </c-list-item>

      <c-list-item :active="selections[1]">
        <c-checkbox slot="pre" v-model="selections[1]" v-control hide-details />

        <c-list-item-title>Phone</c-list-item-title>

        +358 40 1234 123
      </c-list-item>

      <c-list-item :active="selections[2]">
        <c-checkbox slot="pre" v-model="selections[2]" v-control hide-details />

        <c-list-item-title>Email</c-list-item-title>

        example.person@example.com
      </c-list-item>
    </c-list>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|disabled|actions
import { ref } from 'vue';
// @example-end
// @example-start|slots|disabled|disabledItems|actions
import { mdiEmail, mdiHome, mdiPencil, mdiPhone } from '@mdi/js';
// @example-end
// @example-start|actions
import { CToastType } from '@cscfi/csc-ui';
// @example-end
// @example-start|disabled
const disabled = ref(true);
// @example-end
// @example-start|actions
const toasts = ref<HTMLCToastsElement | null>(null);

const onItemClick = (title: string) => {
  toasts.value?.addToast({
    message: `Item '${title}' was clicked`,
    duration: 3000,
    type: CToastType.Success,
  });
};
// @example-end

const selections = ref([false, false, false]);
</script>

<style lang="scss"></style>
