import { CIcon, CIconButton } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  mdiAlertOutline,
  mdiCheck,
  mdiDelete,
  mdiInformationOutline,
  mdiPlus,
  mdiStarOutline,
} from '@mdi/js';

export const Variants = () => (
  <div className="example-grid">
    <div className="example-row">
      <CIconButton aria-label="Add">
        <CIcon path={mdiPlus} />
      </CIconButton>

      <CIconButton aria-label="Favourite" variant="secondary">
        <CIcon path={mdiStarOutline} />
      </CIconButton>

      <CIconButton aria-label="Approve" variant="success">
        <CIcon path={mdiCheck} />
      </CIconButton>

      <CIconButton aria-label="Details" variant="info">
        <CIcon path={mdiInformationOutline} />
      </CIconButton>

      <CIconButton aria-label="Warnings" variant="warning">
        <CIcon path={mdiAlertOutline} />
      </CIconButton>

      <CIconButton aria-label="Delete" variant="danger">
        <CIcon path={mdiDelete} />
      </CIconButton>
    </div>

    <div className="example-row">
      <CIconButton appearance="outlined" aria-label="Add">
        <CIcon path={mdiPlus} />
      </CIconButton>

      <CIconButton
        appearance="outlined"
        aria-label="Favourite"
        variant="secondary"
      >
        <CIcon path={mdiStarOutline} />
      </CIconButton>

      <CIconButton appearance="outlined" aria-label="Approve" variant="success">
        <CIcon path={mdiCheck} />
      </CIconButton>

      <CIconButton appearance="outlined" aria-label="Details" variant="info">
        <CIcon path={mdiInformationOutline} />
      </CIconButton>

      <CIconButton
        appearance="outlined"
        aria-label="Warnings"
        variant="warning"
      >
        <CIcon path={mdiAlertOutline} />
      </CIconButton>

      <CIconButton appearance="outlined" aria-label="Delete" variant="danger">
        <CIcon path={mdiDelete} />
      </CIconButton>
    </div>

    <div className="example-row">
      <CIconButton appearance="ghost" aria-label="Add">
        <CIcon path={mdiPlus} />
      </CIconButton>

      <CIconButton
        appearance="ghost"
        aria-label="Favourite"
        variant="secondary"
      >
        <CIcon path={mdiStarOutline} />
      </CIconButton>

      <CIconButton appearance="ghost" aria-label="Approve" variant="success">
        <CIcon path={mdiCheck} />
      </CIconButton>

      <CIconButton appearance="ghost" aria-label="Details" variant="info">
        <CIcon path={mdiInformationOutline} />
      </CIconButton>

      <CIconButton appearance="ghost" aria-label="Warnings" variant="warning">
        <CIcon path={mdiAlertOutline} />
      </CIconButton>

      <CIconButton appearance="ghost" aria-label="Delete" variant="danger">
        <CIcon path={mdiDelete} />
      </CIconButton>
    </div>

    <div className="example-row">
      <CIconButton appearance="text" aria-label="Add">
        <CIcon path={mdiPlus} />
      </CIconButton>

      <CIconButton appearance="text" aria-label="Favourite" variant="secondary">
        <CIcon path={mdiStarOutline} />
      </CIconButton>

      <CIconButton appearance="text" aria-label="Approve" variant="success">
        <CIcon path={mdiCheck} />
      </CIconButton>

      <CIconButton appearance="text" aria-label="Details" variant="info">
        <CIcon path={mdiInformationOutline} />
      </CIconButton>

      <CIconButton appearance="text" aria-label="Warnings" variant="warning">
        <CIcon path={mdiAlertOutline} />
      </CIconButton>

      <CIconButton appearance="text" aria-label="Delete" variant="danger">
        <CIcon path={mdiDelete} />
      </CIconButton>
    </div>
  </div>
);
