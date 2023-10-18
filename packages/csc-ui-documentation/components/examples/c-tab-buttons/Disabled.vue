<template>
  <component-example name="disabled" rows>
    <template #title>Disabled</template>

    <c-tab-buttons disabled>
      <c-button>One</c-button>
      <c-button>Two</c-button>
      <c-button>Three</c-button>
    </c-tab-buttons>

    <c-tab-buttons>
      <c-button>One</c-button>
      <c-button>Two</c-button>
      <c-button disabled>Three</c-button>
    </c-tab-buttons>
  </component-example>
</template>
