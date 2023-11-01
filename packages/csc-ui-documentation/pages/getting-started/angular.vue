<template>
  <c-card ref="cardRef" class="max-w-screen-xl mx-auto">
    <c-card-content>
      <h1 class="text-4xl capitalize font-bold text-primary-600">
        Usage In Angular
      </h1>

      <p><strong>1. Install the required dependencies</strong></p>

      <code-block
        code="npm install @cscfi/csc-ui csc-ui-accessor"
        theme="atom-one-dark"
        lang="bash"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        This command will install the CSC Design system component library
        <code>@cscfi/csc-ui</code>
        and the control value accessor
        <code>csc-ui-accessor</code>
        which allows the components to support 2-way model binding.
      </p>

      <p class="mt-6">
        <strong>
          2. Add the following lines to
          <code>main.ts</code>
        </strong>
      </p>

      <code-block
        :code="mainUsage"
        theme="atom-one-dark"
        lang="typescript"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p class="mt-6">
        <strong>
          3. Configure
          <code>AppModule</code>
          to use the control value accessor and CUSTOM_ELEMENTS_SCHEMA.
        </strong>
      </p>

      <code-block
        :code="accessorUsage"
        theme="atom-one-dark"
        lang="typescript"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        Now you should be able to use the CSC Design system components in your
        project. Please note that the components require the control value
        accessor
        <code>cControl</code>
        as an additional attribute to enable 2-way binding with
        <code>[(ngModel)]</code>
        or
        <strong>Angular reactive forms</strong>
        .
      </p>
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
const mainUsage = `import { applyPolyfills, defineCustomElements } from '@cscfi/csc-ui/loader';

// ...

applyPolyfills().then(() => {
  defineCustomElements(window);
});
`;

const accessorUsage = `import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CscUiAccessorModule } from 'csc-ui-accessor';

@NgModule({
  imports: [CscUiAccessorModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
`;
</script>
