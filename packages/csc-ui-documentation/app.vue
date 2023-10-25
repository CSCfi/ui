<template>
  <div>
    <nuxt-layout>
      <nuxt-page />
    </nuxt-layout>
  </div>
</template>

<script lang="ts" setup>
import { defineCustomElements } from '@cscfi/csc-ui/loader';

defineCustomElements();
</script>
