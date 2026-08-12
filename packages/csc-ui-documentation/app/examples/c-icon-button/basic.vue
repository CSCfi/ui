<template>
  <div class="example-row">
    <c-icon-button>
      <c-icon :path="mdiPlus" />
    </c-icon-button>

    <c-icon-button outlined>
      <c-icon :path="mdiPencil" />
    </c-icon-button>

    <c-icon-button ghost>
      <c-icon :path="mdiHeart" />
    </c-icon-button>

    <c-icon-button text>
      <c-icon :path="mdiDotsVertical" />
    </c-icon-button>

    <c-icon-button danger>
      <c-icon :path="mdiDelete" />
    </c-icon-button>

    <c-icon-button badge="3">
      <c-icon :path="mdiBellOutline" />
    </c-icon-button>

    <c-icon-button disabled>
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
