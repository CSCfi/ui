// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiMemory, mdiRocket, mdiServer } from '@mdi/js';
import { CIcon, CSwiper, CSwiperTab } from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  return (
    <div>
      <CSwiper value="standard">
        <CSwiperTab value="standard" label="Standard">
          <CIcon slot="icon" path={mdiServer} />4 cores, 8 GB RAM
        </CSwiperTab>
        <CSwiperTab value="performance" label="Performance">
          <CIcon slot="icon" path={mdiMemory} />8 cores, 32 GB RAM
        </CSwiperTab>
        <CSwiperTab value="gpu" label="GPU" disabled>
          <CIcon slot="icon" path={mdiRocket} />1 GPU, 112 GB RAM
        </CSwiperTab>
      </CSwiper>
    </div>
  );
};
