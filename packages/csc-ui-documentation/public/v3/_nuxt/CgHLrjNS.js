const c=`
<c-card>
  <c-loader v-if="loader">Loading...</c-loader>

  <c-card-title>Loader card</c-card-title>

  <c-card-content>
    Click start to show a loader for 5 seconds
  </c-card-content>

  <c-card-actions>
    <c-button @click="startLoader()">Start</c-button>
  </c-card-actions>
</c-card>
`;export{c as default};
