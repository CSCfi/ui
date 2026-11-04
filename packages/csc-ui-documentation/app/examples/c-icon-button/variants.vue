<template>
  <div class="example-grid">
    <div class="example-row">
      <c-icon-button aria-label="Add">
        <c-icon :path="mdiPlus" />
      </c-icon-button>

      <c-icon-button aria-label="Favourite" variant="secondary">
        <c-icon :path="mdiStarOutline" />
      </c-icon-button>

      <c-icon-button aria-label="Approve" variant="success">
        <c-icon :path="mdiCheck" />
      </c-icon-button>

      <c-icon-button aria-label="Details" variant="info">
        <c-icon :path="mdiInformationOutline" />
      </c-icon-button>

      <c-icon-button aria-label="Warnings" variant="warning">
        <c-icon :path="mdiAlertOutline" />
      </c-icon-button>

      <c-icon-button aria-label="Delete" variant="danger">
        <c-icon :path="mdiDelete" />
      </c-icon-button>
    </div>

    <div class="example-row">
      <c-icon-button appearance="outlined" aria-label="Add">
        <c-icon :path="mdiPlus" />
      </c-icon-button>

      <c-icon-button
        appearance="outlined"
        aria-label="Favourite"
        variant="secondary"
      >
        <c-icon :path="mdiStarOutline" />
      </c-icon-button>

      <c-icon-button
        appearance="outlined"
        aria-label="Approve"
        variant="success"
      >
        <c-icon :path="mdiCheck" />
      </c-icon-button>

      <c-icon-button appearance="outlined" aria-label="Details" variant="info">
        <c-icon :path="mdiInformationOutline" />
      </c-icon-button>

      <c-icon-button
        appearance="outlined"
        aria-label="Warnings"
        variant="warning"
      >
        <c-icon :path="mdiAlertOutline" />
      </c-icon-button>

      <c-icon-button appearance="outlined" aria-label="Delete" variant="danger">
        <c-icon :path="mdiDelete" />
      </c-icon-button>
    </div>

    <div class="example-row">
      <c-icon-button appearance="ghost" aria-label="Add">
        <c-icon :path="mdiPlus" />
      </c-icon-button>

      <c-icon-button
        appearance="ghost"
        aria-label="Favourite"
        variant="secondary"
      >
        <c-icon :path="mdiStarOutline" />
      </c-icon-button>

      <c-icon-button appearance="ghost" aria-label="Approve" variant="success">
        <c-icon :path="mdiCheck" />
      </c-icon-button>

      <c-icon-button appearance="ghost" aria-label="Details" variant="info">
        <c-icon :path="mdiInformationOutline" />
      </c-icon-button>

      <c-icon-button appearance="ghost" aria-label="Warnings" variant="warning">
        <c-icon :path="mdiAlertOutline" />
      </c-icon-button>

      <c-icon-button appearance="ghost" aria-label="Delete" variant="danger">
        <c-icon :path="mdiDelete" />
      </c-icon-button>
    </div>

    <div class="example-row">
      <c-icon-button appearance="text" aria-label="Add">
        <c-icon :path="mdiPlus" />
      </c-icon-button>

      <c-icon-button
        appearance="text"
        aria-label="Favourite"
        variant="secondary"
      >
        <c-icon :path="mdiStarOutline" />
      </c-icon-button>

      <c-icon-button appearance="text" aria-label="Approve" variant="success">
        <c-icon :path="mdiCheck" />
      </c-icon-button>

      <c-icon-button appearance="text" aria-label="Details" variant="info">
        <c-icon :path="mdiInformationOutline" />
      </c-icon-button>

      <c-icon-button appearance="text" aria-label="Warnings" variant="warning">
        <c-icon :path="mdiAlertOutline" />
      </c-icon-button>

      <c-icon-button appearance="text" aria-label="Delete" variant="danger">
        <c-icon :path="mdiDelete" />
      </c-icon-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  mdiAlertOutline,
  mdiCheck,
  mdiDelete,
  mdiInformationOutline,
  mdiPlus,
  mdiStarOutline,
} from '@mdi/js';
</script>
