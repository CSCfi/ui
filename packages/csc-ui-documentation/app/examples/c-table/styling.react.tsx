// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CTable, CTag } from '@cscfi/csc-ui-react';

// The table stays in your DOM, so page CSS reaches components inside cells.
const styles = `
c-tag.tag-success::part(root) {
  background-color: var(--c-success-subtle);
  color: var(--c-on-success-subtle);
  box-shadow: inset 0 0 0 1px var(--c-success);
}

c-tag.tag-warning::part(root) {
  background-color: var(--c-warning-subtle);
  color: var(--c-on-warning-subtle);
  box-shadow: inset 0 0 0 1px var(--c-warning);
}
`;

export const Styling = () => {
  return (
    <div>
      <style>{styles}</style>

      <CTable>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Status</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Puhti</td>
              <td>
                <CTag className="tag-success" flat>
                  Running
                </CTag>
              </td>
              <td>Anna Virtanen</td>
            </tr>
            <tr>
              <td>Mahti</td>
              <td>
                <CTag className="tag-warning" flat>
                  Maintenance
                </CTag>
              </td>
              <td>Mikko Korhonen</td>
            </tr>
            <tr>
              <td>Allas</td>
              <td>
                <CTag className="tag-success" flat>
                  Running
                </CTag>
              </td>
              <td>Sara Niemi</td>
            </tr>
          </tbody>
        </table>
      </CTable>
    </div>
  );
};
