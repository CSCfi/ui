<template>
  <div style="width: 320px; max-width: 100%">
    <c-breadcrumb :texts>
      <c-breadcrumb-item href="https://csc.fi">Etusivu</c-breadcrumb-item>

      <c-breadcrumb-item href="https://csc.fi/palvelut">
        Palvelut
      </c-breadcrumb-item>

      <c-breadcrumb-item href="https://csc.fi/palvelut/laskenta">
        Laskenta
      </c-breadcrumb-item>

      <c-breadcrumb-item>Supertietokoneet</c-breadcrumb-item>
    </c-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import type { CBreadcrumbTexts } from '@cscfi/csc-ui';

const texts: CBreadcrumbTexts = {
  breadcrumb: 'Murupolku',
  fold: (count) => `Näytä ${count} lisää`,
};
</script>
