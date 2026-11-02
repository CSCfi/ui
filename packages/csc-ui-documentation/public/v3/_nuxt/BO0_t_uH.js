const t=`
<c-radio-group
  v-model="justify"
  v-control
  label="Justify"
  :items="justifyItems"
  inline
/>

<c-radio-group
  v-model="align"
  v-control
  label="Align"
  :items="alignItems"
  inline
/>

<c-row gap="8" :justify="justify" :align="align">
  <c-icon-button size="x-small">
    <c-icon :path="mdiStar" />
  </c-icon-button>

  <c-icon-button size="small">
    <c-icon :path="mdiStar" />
  </c-icon-button>

  <c-icon-button>
    <c-icon :path="mdiStar" />
  </c-icon-button>
</c-row>
`;export{t as default};
