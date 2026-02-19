<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <form action="/" method="post">
      <c-text-field-open
        id="username"
        label="Username"
        type="username"
        autocomplete="username"
      />

      <c-text-field-open id="password" label="Password" type="password" />

      <c-button type="submit">Submit</c-button>
    </form>
  </component-example>
</template>
