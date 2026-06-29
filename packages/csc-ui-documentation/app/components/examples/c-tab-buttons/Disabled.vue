<template>
  <component-example name="disabled" rows>
    <template #title>Disabled</template>

    <p>Whole c-tab-buttons</p>

    <c-tab-buttons value="two" disabled>
      <c-tab-button value="one">One</c-tab-button>
      
      <c-tab-button value="two">Two</c-tab-button>
      
      <c-tab-button value="three">Three</c-tab-button>
    </c-tab-buttons>
    
    <p>Single c-tab-button</p>

    <c-tab-buttons>
      <c-tab-button>One</c-tab-button>

      <c-tab-button>Two</c-tab-button>

      <c-tab-button disabled>Three</c-tab-button>
    </c-tab-buttons>
  </component-example>
</template>
