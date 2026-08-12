// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  mdiBellOutline,
  mdiDelete,
  mdiDotsVertical,
  mdiHeart,
  mdiPencil,
  mdiPlus,
} from '@mdi/js';
import { CIcon, CIconButton } from '@cscfi/csc-ui-react';

export const Basic = () => (
  <div className="example-row">
    <CIconButton>
      <CIcon path={mdiPlus} />
    </CIconButton>

    <CIconButton outlined>
      <CIcon path={mdiPencil} />
    </CIconButton>

    <CIconButton ghost>
      <CIcon path={mdiHeart} />
    </CIconButton>

    <CIconButton text>
      <CIcon path={mdiDotsVertical} />
    </CIconButton>

    <CIconButton danger>
      <CIcon path={mdiDelete} />
    </CIconButton>

    <CIconButton badge="3">
      <CIcon path={mdiBellOutline} />
    </CIconButton>

    <CIconButton disabled>
      <CIcon path={mdiPlus} />
    </CIconButton>
  </div>
);
