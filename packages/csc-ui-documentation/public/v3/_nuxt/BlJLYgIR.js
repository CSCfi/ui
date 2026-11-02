const a=`
<c-card>
  <c-loader v-if="loader" contentdelay="2">
    This loader will disappear soon
  </c-loader>

  <c-card-title>Loader card</c-card-title>

  <c-card-content>
    Click start to show a loader with a delayed explanation text
  </c-card-content>

  <c-card-actions>
    <c-button @click="startLoader()">Start</c-button>
  </c-card-actions>
</c-card>
`;export{a as default};
