const e=`
<c-list>
  <c-list-item
    ripple
    @click="onItemClick('Address')"
    @keyup.enter="onItemClick('Address')"
    @keyup.space="onItemClick('Address')"
  >
    <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiHome" />

    <c-list-item-title>Address</c-list-item-title>

    Example street 12
  </c-list-item>

  <c-list-item
    ripple
    @click="onItemClick('Phone')"
    @keyup.enter="onItemClick('Phone')"
    @keyup.space="onItemClick('Phone')"
  >
    <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiPhone" />

    <c-list-item-title>Phone</c-list-item-title>

    +358 40 1234 123
  </c-list-item>

  <c-list-item
    ripple
    @click="onItemClick('Email')"
    @keyup.enter="onItemClick('Email')"
    @keyup.space="onItemClick('Email')"
  >
    <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiEmail" />

    <c-list-item-title>Email</c-list-item-title>

    example.person@example.com
  </c-list-item>
</c-list>

<teleport to="body">
  <c-toasts ref="toasts" />
</teleport>
`;export{e as default};
