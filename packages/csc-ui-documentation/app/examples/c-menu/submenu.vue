<template>
  <div class="example-row">
    <c-menu @select="onSelect">
      <c-button slot="trigger" ghost>
        Export
        <c-icon :path="mdiChevronDown" />
      </c-button>

      <c-menu-item value="documents">
        Documents

        <c-menu-item slot="submenu" value="pdf">
          <c-icon :path="mdiFilePdfBox" />
          PDF
        </c-menu-item>

        <c-menu-item slot="submenu" value="docx">
          <c-icon :path="mdiFileDocument" />
          Word document
        </c-menu-item>
      </c-menu-item>

      <c-menu-item value="images">
        Images

        <c-menu-item slot="submenu" value="png">
          <c-icon :path="mdiFilePngBox" />
          PNG
        </c-menu-item>

        <c-menu-item slot="submenu" value="jpg">
          <c-icon :path="mdiFileJpgBox" />
          JPEG
        </c-menu-item>
      </c-menu-item>

      <c-divider />

      <c-menu-item value="settings">Export settings…</c-menu-item>
    </c-menu>

    <p>Selected: {{ selected ?? '—' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import {
  mdiChevronDown,
  mdiFileDocument,
  mdiFileJpgBox,
  mdiFilePdfBox,
  mdiFilePngBox,
} from '@mdi/js';

const selected = ref<null | string>(null);

const onSelect = (event: Event) => {
  selected.value = (event as CustomEvent<{ value: string }>).detail.value;
};
</script>
