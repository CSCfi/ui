<template>
  <div>
    <!-- Below the breakpoint each row becomes a card with header labels -->
    <c-table responsive mobile-breakpoint="800">
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
        </tbody>
      </table>
    </c-table>
  </div>
</template>
