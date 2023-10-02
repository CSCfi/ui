<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-tab-buttons>
      <c-button>One</c-button>
      <c-button>Two</c-button>
      <c-button>Three</c-button>
    </c-tab-buttons>
  </component-example>

  <component-example name="mandatory" rows>
    <template #title>Mandatory selection</template>

    <c-tab-buttons mandatory>
      <c-button>One</c-button>
      <c-button>Two</c-button>
      <c-button>Three</c-button>
    </c-tab-buttons>
  </component-example>

  <component-example name="disabled" rows>
    <template #title>Disabled</template>

    <c-tab-buttons disabled>
      <c-button>One</c-button>
      <c-button>Two</c-button>
      <c-button>Three</c-button>
    </c-tab-buttons>
  </component-example>
</template>

<script setup lang="ts"></script>

<style lang="scss"></style>
