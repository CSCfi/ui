<template>
  <component-example name="variants">
    <template #title>Variants</template>

    <c-icon-button>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button outlined>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button ghost>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button text>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button danger>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>
  </component-example>

  <component-example name="loading">
    <template #title>Loading</template>

    <c-icon-button loading>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button outlined loading>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button ghost loading>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button text loading>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button danger loading>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>
  </component-example>

  <component-example name="disabled">
    <template #title>Disabled</template>

    <c-icon-button disabled>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button outlined disabled>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button ghost disabled>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button text disabled>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button danger disabled>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>
  </component-example>

  <component-example name="sizes">
    <template #title>Sizes</template>

    <c-icon-button size="x-small">
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button size="small">
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>
  </component-example>

  <component-example name="badges">
    <template #title>Badges</template>

    <c-icon-button badge="8">
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button badge="6" outlined>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button badge="1" ghost>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button badge="new" text>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button badge="1" danger>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>
  </component-example>

  <component-example name="inverted">
    <template #title>Inverted</template>

    <c-row gap="16" class="bg-primary-600 p-2 rounded-md">
      <c-icon-button inverted>
        <c-icon :path="mdiStar"></c-icon>
      </c-icon-button>
      <c-icon-button inverted outlined>
        <c-icon :path="mdiStar"></c-icon>
      </c-icon-button>
      <c-icon-button inverted ghost>
        <c-icon :path="mdiStar"></c-icon>
      </c-icon-button>
      <c-icon-button inverted text>
        <c-icon :path="mdiStar"></c-icon>
      </c-icon-button>
      <c-icon-button inverted danger>
        <c-icon :path="mdiStar"></c-icon>
      </c-icon-button>
    </c-row>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|icon
import { mdiStar } from '@mdi/js';
// @example-end
</script>

<style lang="scss"></style>
