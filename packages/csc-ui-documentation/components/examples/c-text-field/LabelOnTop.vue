<template>
  <component-example name="label-on-top" rows>
    <template #title>Label on top</template>

    <c-text-field
      label="Text field"
      hint="I have a label on top"
      label-on-top
    />

    <c-text-field label="Text area" rows="6" label-on-top />
  </component-example>
</template>
