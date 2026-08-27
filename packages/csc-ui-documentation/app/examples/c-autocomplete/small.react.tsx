// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CAutocomplete, COption, COptionValue } from '@cscfi/csc-ui-react';

export const Small = () => {
  const [language, setLanguage] = useState<string | null>(null);

  return (
    <div>
      <CAutocomplete
        value={language}
        label="Programming language"
        size="small"
        onChangeValue={(event) => setLanguage(event.detail as string | null)}
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
