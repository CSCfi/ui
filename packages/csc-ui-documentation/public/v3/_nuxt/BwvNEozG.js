const i=`
<c-alert :type="type">
  <div slot="title">Quis porro id?</div>

  Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero, harum
  pariatur deserunt obcaecati maiores cupiditate magnam! Minima omnis libero
  sequi consectetur nesciunt. Facilis maxime ratione molestiae expedita quis
  porro id?
</c-alert>

<c-radio-group
  v-model="type"
  v-control
  :items="types"
  hide-details
  inline
/>
`;export{i as default};
