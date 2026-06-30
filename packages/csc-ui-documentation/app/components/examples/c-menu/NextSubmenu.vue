<template>
  <component-example name="nextsubmenu" rows>
    <template #title>Submenus</template>

    <template #subtitle>
      Nest items in a parent item's submenu slot — open on hover, click, or
      arrow keys
    </template>

    <c-menu @select="onSelect">
      <c-button slot="trigger" ghost>
        Export
        <c-icon :path="mdiChevronDown" />
      </c-button>

      <c-menu-item value="documents">
        Documents

        <c-menu-item slot="submenu" value="pdf">
          <c-icon :path="mdiFilePdfBox"></c-icon>
          PDF
        </c-menu-item>
        
        <c-menu-item slot="submenu" value="docx">
          <c-icon :path="mdiFileDocument"></c-icon>
          Word document
        </c-menu-item>
      </c-menu-item>
      
      <c-menu-item value="images">
        Images
        
        <c-menu-item slot="submenu" value="png">
          <c-icon :path="mdiFilePngBox"></c-icon>
          PNG
        </c-menu-item>
        
        <c-menu-item slot="submenu" value="jpg">
          <c-icon :path="mdiFileJpgBox"></c-icon>
          JPEG
        </c-menu-item>
      </c-menu-item>

      <c-divider />

      <c-menu-item value="settings">Export settings…</c-menu-item>
    </c-menu>

    <p class="mt-3">Selected value: {{ selected ?? '—' }}</p>
  </component-example>
</template>

<script setup lang="ts">
import { mdiChevronDown, mdiFileDocument, mdiFileJpgBox, mdiFilePdfBox, mdiFilePngBox } from '@mdi/js';
import { ref } from 'vue';

const selected = ref<null | string>(null);

const onSelect = (event: CustomEvent<{ value: string }>) => {
  selected.value = event.detail.value;
};
</script>
