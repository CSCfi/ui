const t=`
<c-toolbar class="relative">
  <c-csc-logo />

  Application title

  <c-spacer />

  <c-menu :items="items" custom>
    <c-icon-button ghost badge="4" tabindex="-1" size="small">
      <c-icon :path="mdiEmailOutline" />
    </c-icon-button>
  </c-menu>

  <c-navigation-button />
</c-toolbar>
`;export{t as default};
