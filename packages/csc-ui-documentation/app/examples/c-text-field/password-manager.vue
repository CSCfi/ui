<template>
  <form @submit.prevent="loggedIn = username">
    <c-text-field label="Username">
      <input v-model="username" autocomplete="username" name="username" />
    </c-text-field>

    <c-text-field label="Password">
      <input
        v-model="password"
        autocomplete="current-password"
        name="password"
        type="password"
      />
    </c-text-field>

    <!-- The submit button is the page's own too: a password manager reads it
         to tell what the form is for. -->
    <c-button>
      <button type="submit">Log in</button>
    </c-button>

    <p v-if="loggedIn">Logged in as {{ loggedIn }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const username = ref('');

const password = ref('');

const loggedIn = ref('');
</script>
