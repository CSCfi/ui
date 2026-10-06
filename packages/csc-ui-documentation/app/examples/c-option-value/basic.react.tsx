import { CAutocomplete, COption, COptionValue } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [language, setLanguage] = useState<null | string>(null);

  return (
    <div>
      <CAutocomplete
        clearable
        hint="Only the c-option-value text is filtered, marked and used as the label"
        label="Programming language"
        onChangeValue={(event) => setLanguage(event.detail as null | string)}
        placeholder="Start typing to search"
        value={language}
      >
        <COption value="js">
          <COptionValue>JavaScript</COptionValue>
          <small>Web pages and Node.js</small>
        </COption>
        <COption value="ts">
          <COptionValue>TypeScript</COptionValue>
          <small>JavaScript with static types</small>
        </COption>
        <COption value="py">
          <COptionValue>Python</COptionValue>
          <small>Scripting and data science</small>
        </COption>
        <COption value="rs">
          <COptionValue>Rust</COptionValue>
          <small>Systems programming</small>
        </COption>
      </CAutocomplete>

      <p>Value: {language ?? 'null'}</p>
    </div>
  );
};
