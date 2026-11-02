const e=`
<c-tags>
  <c-tag
    :active="activeTags[0]"
    badge="0"
    @click="onToggleActive(0)"
    @keyup.enter="onToggleActive(0)"
  >
    One
  </c-tag>

  <c-tag
    :active="activeTags[1]"
    badge="125"
    @click="onToggleActive(1)"
    @keyup.enter="onToggleActive(1)"
  >
    Two
  </c-tag>

  <c-tag
    :active="activeTags[2]"
    badge="9"
    @click="onToggleActive(2)"
    @keyup.enter="onToggleActive(2)"
  >
    Three
  </c-tag>
</c-tags>
`;export{e as default};
