<template>
  <div class="example-row">
    <c-message hint="Use your organization email address" />

    <c-message :valid.prop="false" validation="Email is required" />
  </div>
</template>
