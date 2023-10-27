<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

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
    </c-table>
  </component-example>

  <component-example name="responsive" rows>
    <template #title>Responsive table</template>

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
    </c-table>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|responsive
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
// @example-end
</script>

<style lang="scss"></style>
