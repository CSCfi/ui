import { CAutocomplete, COption, COptionValue } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Small = () => {
  const [language, setLanguage] = useState<null | string>(null);

  return (
    <div>
      <CAutocomplete
        label="Programming language"
        onChangeValue={(event) => setLanguage(event.detail as null | string)}
        size="small"
        value={language}
      >
        <COption value="js">
          <COptionValue>JavaScript</COptionValue>
        </COption>
        <COption value="ts">
          <COptionValue>TypeScript</COptionValue>
        </COption>
        <COption value="py">
          <COptionValue>Python</COptionValue>
        </COption>
      </CAutocomplete>
    </div>
  );
};
