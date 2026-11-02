const e=`
<c-row gap="8" align="center">
  <c-icon-button text :disabled="volume === 0" @click="onVolumeDecrease()">
    <c-icon :path="mdiVolumeLow" />
  </c-icon-button>

  <c-slider v-model="volume" v-control aria-label="Volume" segments="5" />

  <c-icon-button
    text
    :disabled="volume === 100"
    @click="onVolumeIncrease()"
  >
    <c-icon :path="mdiVolumeHigh" />
  </c-icon-button>
</c-row>
`;export{e as default};
