<template>
  <div class="example-row">
    <c-message hint="Use your organization email address" />

    <c-message :valid.prop="false" error-message="Email is required" />
  </div>
</template>
