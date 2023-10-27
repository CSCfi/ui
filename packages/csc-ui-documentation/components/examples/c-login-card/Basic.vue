<template>
  <component-example name="basic">
    <template #title>Basic usage</template>

    <c-login-card background-position="50% 0%" src="/img/bg.png">
      <c-login-card-title>Login to service</c-login-card-title>

      <c-login-card-content>
        <div>
          Service name provides a platform for you to host your own applications
          and make them accessible over the web.
        </div>

        <c-text-field label="Username" />

        <c-text-field
          hint="Please do not use numbers in your password"
          label="Password"
          type="password"
        />
      </c-login-card-content>

      <c-login-card-actions justify="space-between">
        <c-button size="large">Submit</c-button>
      </c-login-card-actions>

      <c-link href="http://csc.fi" underline>Forgot password?</c-link>
    </c-login-card>
  </component-example>
</template>
