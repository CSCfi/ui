<template>
  <div>
    <c-tabs vertical value="profile">
      <c-tab value="profile">Profile</c-tab>
      <c-tab value="security">Security</c-tab>
      <c-tab value="tokens">API tokens</c-tab>

      <c-tab-items slot="items">
        <c-tab-item value="profile">
          <p>Your name, email and avatar.</p>
        </c-tab-item>
        <c-tab-item value="security">
          <p>Password and two-factor authentication.</p>
        </c-tab-item>
        <c-tab-item value="tokens">
          <p>Personal access tokens for the API.</p>
        </c-tab-item>
      </c-tab-items>
    </c-tabs>
  </div>
</template>
