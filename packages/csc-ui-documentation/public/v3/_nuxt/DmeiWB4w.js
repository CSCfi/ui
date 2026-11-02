const e=`
<c-select
  v-model="selectedItem"
  v-control
  label="Partition"
  placeholder="Choose partition..."
  style="max-width: 360px"
  hide-details
  label-on-top
>
  <c-option value="normal" name="Normal">
    <c-row align="center" justify="space-between">
      Normal
      <c-tag flat>100 BU / node / h</c-tag>
    </c-row>
  </c-option>

  <c-option value="interactive" name="Interactive">
    <c-row align="center" justify="space-between">
      Interactive
      <c-tag flat>1 BU / CPU / h</c-tag>
    </c-row>
  </c-option>

  <c-option value="gpu" name="GPU" disabled>
    <c-row align="center" justify="space-between">
      GPU
      <c-tag flat badge="N/A" active>100 BU / GPU / h</c-tag>
    </c-row>
  </c-option>
</c-select>

<p class="mt-3">Selected partition value: {{ selectedItem || '?' }}</p>
`;export{e as default};
