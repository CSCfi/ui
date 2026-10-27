const t=`
<c-button>
  <c-icon :path="mdiLogin" />
  Login
</c-button>

<c-button ghost>
  <c-icon :path="mdiLogout" />
  Logout
</c-button>

<c-button disabled>
  <c-icon :path="mdiLogin" />
  Login
</c-button>

<c-button text>
  Next
  <c-icon :path="mdiArrowRight" />
</c-button>

<c-button danger>
  <c-icon :path="mdiDelete" />
  Delete
</c-button>
`;export{t as default};
