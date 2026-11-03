<template>
  <div class="example-row">
    <c-icon-button aria-label="Add">
      <c-icon :path="mdiPlus" />
    </c-icon-button>

    <c-icon-button appearance="outlined" aria-label="Edit">
      <c-icon :path="mdiPencil" />
    </c-icon-button>

    <c-icon-button appearance="ghost" aria-label="Like">
      <c-icon :path="mdiHeart" />
    </c-icon-button>

    <c-icon-button appearance="text" aria-label="More actions">
      <c-icon :path="mdiDotsVertical" />
    </c-icon-button>

    <c-icon-button aria-label="Delete" danger>
      <c-icon :path="mdiDelete" />
    </c-icon-button>

    <c-icon-button aria-label="3 notifications" badge="3">
      <c-icon :path="mdiBellOutline" />
    </c-icon-button>

    <c-icon-button aria-label="Add" disabled>
      <c-icon :path="mdiPlus" />
    </c-icon-button>
  </div>
</template>

<script setup lang="ts">
import {
  mdiBellOutline,
  mdiDelete,
  mdiDotsVertical,
  mdiHeart,
  mdiPencil,
  mdiPlus,
} from '@mdi/js';
</script>
