<template>
  <component-example name="labelOnTop" rows>
    <template #title>Label on top</template>

    <c-text-field label="Text field" label-on-top />

    <c-text-field label="Text area" rows="8" label-on-top />

    <c-select label="Select" label-on-top>
      <c-option value="one">One</c-option>

      <c-option value="two">Two</c-option>
    </c-select>
  </component-example>
</template>
