const e=`

<c-select
  v-model="selectedOption"
  v-control
  label="Partition"
  placeholder="Choose partition..."
  style="max-width: 360px"
  clearable
  hide-details
  option-as-selection
>
  <c-option value="normal" name="normal">
    <c-row align="center" justify="space-between">
      Normal
      <c-tag flat>100 BU / node / h</c-tag>
    </c-row>
  </c-option>

  <c-option value="interactive" name="interactive">
    <c-row align="center" justify="space-between">
      Interactive
      <c-tag flat>1 BU / CPU / h</c-tag>
    </c-row>
  </c-option>

  <c-option value="gpu" name="gpu" disabled>
    <c-row align="center" justify="space-between">
      GPU
      <c-tag flat badge="N/A" active>100 BU / GPU / h</c-tag>
    </c-row>
  </c-option>
</c-select>

<p class="mt-3">Selected partition value: {{ selectedOption || '?' }}</p>
`;export{e as default};
