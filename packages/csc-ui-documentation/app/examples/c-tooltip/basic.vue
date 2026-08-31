<template>
  <div class="example-row">
    <c-tooltip text="Download the report as PDF">
      <c-icon-button slot="trigger" aria-label="Download" ghost>
        <c-icon :path="mdiDownload" />
      </c-icon-button>
    </c-tooltip>

    <c-tooltip text="Remove the report permanently" position="bottom">
      <c-icon-button slot="trigger" aria-label="Remove" ghost>
        <c-icon :path="mdiTrashCanOutline" />
      </c-icon-button>
    </c-tooltip>
  </div>
</template>

<script setup lang="ts">
import { mdiDownload, mdiTrashCanOutline } from '@mdi/js';
</script>
