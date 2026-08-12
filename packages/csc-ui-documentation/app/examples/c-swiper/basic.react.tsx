// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CIcon, CSwiper, CSwiperTab } from '@cscfi/csc-ui-react';
import { mdiMemory, mdiRocket, mdiServer } from '@mdi/js';

export const Basic = () => {
  const [flavor, setFlavor] = useState<number | string>('standard');

  return (
    <div>
      <CSwiper
        value={flavor}
        onChangeValue={(event) => setFlavor(event.detail as number | string)}
      >
        <CSwiperTab value="standard" label="Standard">
          <CIcon slot="icon" path={mdiServer} />4 cores, 8 GB RAM
        </CSwiperTab>
        <CSwiperTab value="performance" label="Performance">
          <CIcon slot="icon" path={mdiMemory} />8 cores, 32 GB RAM
        </CSwiperTab>
        <CSwiperTab value="gpu" label="GPU">
          <CIcon slot="icon" path={mdiRocket} />1 GPU, 112 GB RAM
        </CSwiperTab>
      </CSwiper>

      <p>Selected flavor: {flavor}</p>
    </div>
  );
};
