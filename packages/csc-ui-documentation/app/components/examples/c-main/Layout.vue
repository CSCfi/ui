<template>
  <component-example rows name="layout">
    <template #title>Default layout</template>

    <template #subtitle>
      Automatic dashboard layout with css grid areas by usin
      <code>c-toolbar</code>
      ,
      <code>c-side-navigation</code>
      and
      <code>c-page</code>
      as direct children of
      <code>c-main</code>
    </template>

    <c-main>
      <c-toolbar>
        <c-csc-logo />

        Application title
      </c-toolbar>

      <c-side-navigation>
        <c-side-navigation-item>About</c-side-navigation-item>

        <c-side-navigation-title>Two level navigation</c-side-navigation-title>

        <c-side-navigation-item>
          Examples

          <c-sub-navigation-item>Html</c-sub-navigation-item>

          <c-sub-navigation-item>Javascript</c-sub-navigation-item>
        </c-side-navigation-item>

        <c-side-navigation-item slot="bottom">
          <c-icon :path="mdiLogout" size="18" />
          Logout
        </c-side-navigation-item>
      </c-side-navigation>

      <c-page>
        <c-card>
          <c-card-title>Dashboard layout</c-card-title>

          <c-card-content>
            <c-alert type="info">
              <p slot="title">Using the layout</p>

              The default layout can be disabled using the 'disable-layout' prop
            </c-alert>

            <c-table responsive>
              <table>
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
              </table>
            </c-table>
          </c-card-content>
        </c-card>

        <div class="bg-primary-300 h-screen p-6 mt-6 rounded-md">
          Dummy content to force scrolling
        </div>

        <footer slot="footer" class="bg-tertiary-100 p-6 w-full">
          &copy; 2024
        </footer>
      </c-page>
    </c-main>
  </component-example>
</template>

<script setup lang="ts">
import { mdiLogout } from '@mdi/js';
</script>
