import { CButton, CTextField } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const PasswordManager = () => {
  const [username, setUsername] = useState('');

  const [password, setPassword] = useState('');

  const [loggedIn, setLoggedIn] = useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setLoggedIn(username);
      }}
    >
      <CTextField label="Username">
        <input
          autoComplete="username"
          name="username"
          onChange={(event) => setUsername(event.target.value)}
          value={username}
        />
      </CTextField>

      <CTextField label="Password">
        <input
          autoComplete="current-password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
      </CTextField>

      {/* The submit button is the page's own too: a password manager reads it
          to tell what the form is for. */}
      <CButton>
        <button type="submit">Log in</button>
      </CButton>

      {loggedIn && <p>Logged in as {loggedIn}</p>}
    </form>
  );
};
