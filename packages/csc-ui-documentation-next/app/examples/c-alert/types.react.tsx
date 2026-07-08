// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CAlert } from '@cscfi/csc-ui-next-react';

export const Types = () => (
  <div style={{ display: 'grid', gap: '1rem' }}>
    <CAlert>A default alert without a type.</CAlert>

    <CAlert type="info">Your session expires in 15 minutes.</CAlert>

    <CAlert type="success">Your project was created.</CAlert>

    <CAlert type="warning">Your quota is almost full.</CAlert>

    <CAlert type="error">The file could not be uploaded.</CAlert>
  </div>
);
