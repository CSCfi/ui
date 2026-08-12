// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CTable } from '@cscfi/csc-ui-react';

export const Basic = () => {
  return (
    <div>
      <CTable>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Anna Virtanen</td>
              <td>Researcher</td>
              <td>anna.virtanen@example.fi</td>
            </tr>
            <tr>
              <td>Mikko Korhonen</td>
              <td>Data engineer</td>
              <td>mikko.korhonen@example.fi</td>
            </tr>
            <tr>
              <td>Sara Niemi</td>
              <td>Project manager</td>
              <td>sara.niemi@example.fi</td>
            </tr>
          </tbody>
        </table>
      </CTable>
    </div>
  );
};
