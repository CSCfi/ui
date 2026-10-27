const t=`
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
`;export{t as default};
