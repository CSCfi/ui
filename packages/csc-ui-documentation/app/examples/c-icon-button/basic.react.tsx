import { CIcon, CIconButton } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  mdiBellOutline,
  mdiDelete,
  mdiDotsVertical,
  mdiHeart,
  mdiPencil,
  mdiPlus,
} from '@mdi/js';

export const Basic = () => (
  <div className="example-row">
    <CIconButton aria-label="Add">
      <CIcon path={mdiPlus} />
    </CIconButton>

    <CIconButton aria-label="Edit" outlined>
      <CIcon path={mdiPencil} />
    </CIconButton>

    <CIconButton aria-label="Like" ghost>
      <CIcon path={mdiHeart} />
    </CIconButton>

    <CIconButton aria-label="More actions" text>
      <CIcon path={mdiDotsVertical} />
    </CIconButton>

    <CIconButton aria-label="Delete" danger>
      <CIcon path={mdiDelete} />
    </CIconButton>

    <CIconButton aria-label="3 notifications" badge="3">
      <CIcon path={mdiBellOutline} />
    </CIconButton>

    <CIconButton aria-label="Add" disabled>
      <CIcon path={mdiPlus} />
    </CIconButton>
  </div>
);
