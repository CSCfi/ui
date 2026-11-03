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

    <CIconButton appearance="outlined" aria-label="Edit">
      <CIcon path={mdiPencil} />
    </CIconButton>

    <CIconButton appearance="ghost" aria-label="Like">
      <CIcon path={mdiHeart} />
    </CIconButton>

    <CIconButton appearance="text" aria-label="More actions">
      <CIcon path={mdiDotsVertical} />
    </CIconButton>

    <CIconButton aria-label="Delete" variant="danger">
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
