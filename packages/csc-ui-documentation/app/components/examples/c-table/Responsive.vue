<template>
  <component-example name="responsive" rows>
    <template #title>Responsive table</template>

    <div class="flex justify-start">
      <c-tab-buttons v-model="displayType" v-control size="small" mandatory>
        <c-button value="desktop">
          <c-icon :size="20" :path="mdiMonitor" />
          Desktop
        </c-button>

        <c-button value="mobile">
          <c-icon :size="20" :path="mdiCellphone" />
          Mobile
        </c-button>
      </c-tab-buttons>
    </div>

    <div
      :style="{ maxWidth: displayType === 'desktop' ? '100%' : '600px' }"
      class="grid gap-4"
    >
      <c-table ref="tableElementRef" responsive>
        <table>
          <thead>
            <tr>
              <th v-for="header in headers" :key="header">{{ header }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="!users.length" no-mobile-labels>
              <td colspan="4">
                <div class="grid place-content-center p-4 gap-4">
                  No users found
                  <c-button @click="onReset()">Reset</c-button>
                </div>
              </td>
            </tr>

            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>

              <td>{{ user.name }}</td>

              <td>{{ user.ssn }}</td>

              <td class="text-right">
                <c-button size="small" ghost @click="onRemoveUser(user.id)">
                  <c-icon :path="mdiDelete" :size="20" />
                  Remove
                </c-button>
              </td>
            </tr>
          </tbody>
        </table>
      </c-table>

      <c-button class="justify-self-start" @click="onAddUser()">
        Add user
      </c-button>
    </div>
  </component-example>
</template>

<script setup lang="ts">
import { mdiCellphone, mdiDelete, mdiMonitor } from '@mdi/js';

const displayType = ref<'desktop' | 'mobile'>('desktop');

const tableElementRef = useTemplateRef<HTMLCTableElement>('tableElementRef');

const headers = ['Id', 'Name', 'Ssn', ''];

const defaultUsers = [
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

const users = ref([...defaultUsers]);

const onRemoveUser = (id: string) => {
  users.value = users.value.filter((user) => user.id !== id);
};

const onAddUser = () => {
  users.value = [
    ...users.value,
    {
      id: 'user_' + Date.now(),
      name: 'New User',
      ssn: 'some-ssn',
    },
  ];

  // Update mobile labels when adding data
  tableElementRef.value?.updateMobileLabels();
};

const onReset = () => {
  users.value = [...defaultUsers];

  // Update mobile labels when adding data
  tableElementRef.value?.updateMobileLabels();
};
</script>
