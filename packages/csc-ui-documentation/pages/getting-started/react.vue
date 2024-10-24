<template>
  <c-card ref="cardRef" class="max-w-screen-xl mx-auto">
    <c-card-content>
      <h1 class="text-4xl capitalize font-bold text-primary-600">
        Usage in React
      </h1>

      <p><strong>1. Install the required dependencies</strong></p>

      <code-block
        theme="atom-one-dark"
        lang="html"
        code="npm install @cscfi/csc-ui @cscfi/csc-ui-react"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        This command will install the CSC Design system component library
        <code>@cscfi/csc-ui</code>
        and the wrapper
        <code>@cscfi/csc-ui-react</code>
        which allows the components to support 2-way model binding.
      </p>

      <p>
        <strong>
          2. Add the following line to eg.
          <code>App.css</code>
        </strong>
      </p>

      <code-block
        theme="atom-one-dark"
        lang="css"
        code="@import url('@cscfi/csc-ui-react/css/theme.css');"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        <strong>3. Use in your React components</strong>
      </p>

      <code-block
        theme="atom-one-dark"
        lang="typescript"
        :code="appTsx"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        <strong>Working example</strong>
      </p>

      <div id="react-example" />
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
import sdk from '@stackblitz/sdk';

onMounted(() => {
  sdk.embedProjectId('react-example', 'vitejs-vite-d6igeu', {
    forceEmbedLayout: true,
    openFile: 'src/App.tsx',
  });
});

const appTsx = `import { useState } from 'react';
import {
  CMain,
  CToolbar,
  CCscLogo,
  CSideNavigation,
  CSideNavigationItem,
  CSideNavigationTitle,
  CSubNavigationItem,
  CPage,
  CCard,
  CCardTitle,
  CCardContent,
  CCardActions,
  CTable,
  CAlert,
  CButton,
  CModal,
  CTextField,
  CToasts,
} from '@cscfi/csc-ui-react';
import { CAlertType, CToastMessage } from '@cscfi/csc-ui';
import './App.css';
import { useRef } from 'react';

function App() {
  const toastRef = useRef<HTMLCToastsElement>(null);

  const [users, setUsers] = useState([
    { id: 1, name: 'Jason Miller', age: 23 },
    { id: 2, name: 'Silvia Nyholm', age: 18 },
    { id: 3, name: 'Mark Samsonov', age: 56 },
    { id: 4, name: 'Michael Nielsen', age: 29 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);

  const onAddUser = () => {
    setUsers([...users, { name, age, id: users.length + 1 }]);

    setIsModalOpen(false);

    const message: CToastMessage = {
      message: 'New user added',
    };

    toastRef.current?.addToast(message);

    setName('');
    setAge(0);

    console.log(name, age);
  };

  const onOpenDialog = () => {
    setIsModalOpen(true);
  };

  const onRemoveUser = (id: number) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const getCurrentYear = () => new Date().getFullYear();

  return (
    <>
      <CMain>
        <CToolbar>
          <CCscLogo></CCscLogo>
          CSC UI React
        </CToolbar>

        <CSideNavigation>
          <CSideNavigationItem>About</CSideNavigationItem>

          <CSideNavigationTitle>Two level navigation</CSideNavigationTitle>

          <CSideNavigationItem>
            Examples
            <CSubNavigationItem>Html</CSubNavigationItem>
            <CSubNavigationItem>Javascript</CSubNavigationItem>
          </CSideNavigationItem>

          <CButton style={{ marginRight: '24px' }} slot="bottom" inverted ghost>
            Logout
          </CButton>
        </CSideNavigation>

        <CPage>
          <CCard>
            <CCardTitle>Dashboard layout</CCardTitle>

            <CCardContent>
              <CAlert type={'info' as CAlertType}>
                <p slot="title">Using the layout</p>
                The default layout can be disabled using the 'disable-layout'
                prop
              </CAlert>

              <CTable responsive>
                <table>
                  <thead>
                    <tr>
                      <th>Id</th>

                      <th>Name</th>

                      <th>Age</th>

                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>

                        <td>{user.name}</td>

                        <td>{user.age}</td>

                        <td>
                          <div
                            style={{
                              display: 'flex',
                              width: '100%',
                              justifyContent: 'end',
                            }}
                          >
                            <CButton
                              size="small"
                              text
                              onClick={() => onRemoveUser(user.id)}
                            >
                              Delete
                            </CButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!users.length && (
                      <tr>
                        <td colSpan={4}>No more users to delete</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CTable>
            </CCardContent>

            <CCardActions>
              <CButton onClick={() => onOpenDialog()}>Add user</CButton>
            </CCardActions>
          </CCard>

          <footer
            slot="footer"
            style={{
              width: '100%',
              padding: '24px',
              backgroundColor: 'var(--c-tertiary-200)',
            }}
          >
            {getCurrentYear()} - CSC Design system
          </footer>
        </CPage>

        <CModal
          value={isModalOpen}
          onChangeValue={(event: CustomEvent<boolean>) =>
            setIsModalOpen(event.detail)
          }
        >
          <CCard>
            <CCardTitle>Add a new user</CCardTitle>

            <CCardContent>
              <p>User Id: {users.length + 1}</p>

              <CTextField
                label="Name"
                value={name}
                onChangeValue={(event: CustomEvent<string>) =>
                  setName(event.detail)
                }
              ></CTextField>

              <CTextField
                label="Age"
                type="number"
                value={age.toString()}
                onChangeValue={(event: CustomEvent<string>) =>
                  setAge(+event.detail)
                }
              ></CTextField>
            </CCardContent>

            <CCardActions justify="end">
              <CButton onClick={() => setIsModalOpen(false)} text>
                Cancel
              </CButton>
              <CButton onClick={() => onAddUser()}>Add user</CButton>
            </CCardActions>
          </CCard>
        </CModal>

        <CToasts ref={toastRef}></CToasts>
      </CMain>
    </>
  );
}

export default App;
`;
</script>
