const c=`
<c-switch v-model="switch1" v-control>
  {{ switch1 ? 'Active' : 'Inactive' }}
</c-switch>

<c-switch v-model="switch2" v-control>
  {{ switch2 ? 'Active' : 'Inactive' }}
</c-switch>

<c-switch v-model="switch3" v-control :loading="switch2">
  {{ switch3 ? 'Active, loading' : 'Inactive, loading' }}
</c-switch>

<c-switch required>Required</c-switch>

<c-switch checked disabled>Disabled, active</c-switch>

<c-switch disabled>Disabled</c-switch>

<c-switch disabled loading>Disabled, loading</c-switch>
`;export{c as default};
