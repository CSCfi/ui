
/**
 * Examples for CTable.vue.
 * Automatically generated at 10/2/2023, 8:59:00 AM.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */

export const basic = `
<c-table>
  <thead>
    <tr>
      <th>Id</th>
      <th>Name</th>
      <th>Age</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>user-id-1</td>
      <td>Jason Miller</td>
      <td>23</td>
    </tr>
    <tr>
      <td>user-id-2</td>
      <td>Silvia Nyholm</td>
      <td>18</td>
    </tr>
    <tr>
      <td>user-id-3</td>
      <td>Mark Samsonov</td>
      <td>56</td>
    </tr>
    <tr>
      <td>user-id-4</td>
      <td>Michael Nielsen</td>
      <td>2</td>
    </tr>
  </tbody>
</c-table>`;

export const responsive = `
<c-table responsive>
  <thead>
    <tr>
      <th v-for="header in headers" :key="header">{{ header }}</th>
    </tr>
  </thead>

  <tbody>
    <tr v-for="user in users" :key="user.id">
      <td>{{ user.id }}</td>
      <td>{{ user.name }}</td>
      <td>{{ user.ssn }}</td>
    </tr>
  </tbody>
</c-table>`;
