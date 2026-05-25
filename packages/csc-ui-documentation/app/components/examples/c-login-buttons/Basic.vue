<template>
  <component-example name="basic">
    <template #title>Basic usage</template>

    <c-card class="max-w-xl w-full">
      <c-card-title>Select authentication provider</c-card-title>

      <c-card-content>
        <c-login-buttons>
          <c-login-button src="/img/csc-logo.png">Provider 1</c-login-button>

          <c-login-button src="/img/csc-logo.png">Provider 2</c-login-button>

          <c-login-button src="/img/csc-logo.png">Provider 3</c-login-button>

          <c-login-button src="/img/csc-logo.png">Provider 4</c-login-button>
        </c-login-buttons>
      </c-card-content>
    </c-card>
  </component-example>
</template>
