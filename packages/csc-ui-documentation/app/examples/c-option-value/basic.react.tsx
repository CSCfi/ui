// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CAutocomplete, COption, COptionValue } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [language, setLanguage] = useState<string | null>(null);

  return (
    <div>
      <CAutocomplete
        value={language}
        clearable
        hint="Only the c-option-value text is filtered, marked and used as the label"
        label="Programming language"
        placeholder="Start typing to search"
        onChangeValue={(event) => setLanguage(event.detail as string | null)}
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
