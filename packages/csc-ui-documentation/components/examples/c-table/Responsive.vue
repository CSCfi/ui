<template>
  <component-example name="responsive" rows>
    <template #title>Responsive table</template>

    <c-table responsive>
      <table>
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
      </table>
    </c-table>
  </component-example>
</template>

<script setup lang="ts">
const headers = ['Id', 'Name', 'Ssn'];

const users = [
  {
    id: '19-9985829',
    name: 'Trueman Stoving',
    ssn: '739-44-5303',
  },
  {
    id: '29-6327242',
    name: 'August Cosslett',
    ssn: '851-25-1988',
  },
  {
    id: '72-2577427',
    name: 'Ethe Kent',
    ssn: '624-36-3386',
  },
  {
    id: '28-0732117',
    name: 'Harbert Doey',
    ssn: '719-22-1203',
  },
  {
    id: '39-6848867',
    name: 'Sidonnie Lamas',
    ssn: '442-24-1083',
  },
];
</script>
