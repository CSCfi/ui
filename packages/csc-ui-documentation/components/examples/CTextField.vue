<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-text-field label="Text field" />
  </component-example>

  <component-example name="date" rows>
    <template #title>Date field</template>

    <c-text-field label="Date field" type="date" />
  </component-example>

  <component-example name="password" rows>
    <template #title>Password field</template>

    <c-text-field label="Password field" type="password" />
  </component-example>

  <component-example name="shadow" rows>
    <template #title>Shadow variant</template>

    <c-text-field label="Shadow field" shadow />
  </component-example>
</template>

<script setup lang="ts"></script>

<style lang="scss"></style>
