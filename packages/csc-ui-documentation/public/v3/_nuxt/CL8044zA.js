const t=`
<c-menu :items="items">Basic menu</c-menu>

<c-menu :items="items" flat>Flat menu</c-menu>

<c-menu :items="items" small>Small menu</c-menu>

<c-menu :items="items" custom>
  <c-icon-button ghost badge="8" tabindex="-1">
    <c-icon :path="mdiEmailOutline" />
  </c-icon-button>
</c-menu>

<teleport to="body">
  <c-toasts ref="toastsRef" />
</teleport>
`;export{t as default};
