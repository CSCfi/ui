// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import {
  mdiLanguageGo,
  mdiLanguageJavascript,
  mdiLanguagePython,
  mdiLanguageRuby,
  mdiLanguageRust,
  mdiLanguageTypescript,
} from '@mdi/js';
import {
  CAutocomplete,
  CIcon,
  COption,
  COptionValue,
} from '@cscfi/csc-ui-react';

const options = [
  { value: 'js', label: 'JavaScript', icon: mdiLanguageJavascript },
  { value: 'ts', label: 'TypeScript', icon: mdiLanguageTypescript },
  { value: 'py', label: 'Python', icon: mdiLanguagePython },
  { value: 'rs', label: 'Rust', icon: mdiLanguageRust },
  { value: 'go', label: 'Go', icon: mdiLanguageGo },
  { value: 'rb', label: 'Ruby', icon: mdiLanguageRuby },
];

/* Option content is copied into the panel: page classes do not reach it,
   the 'part' does. */
const styles = `
c-autocomplete::part(language) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
`;

export const Multiple = () => {
  const [languages, setLanguages] = useState<string[]>(['ts']);

  return (
    <div>
      <style>{styles}</style>

      <CAutocomplete
        value={languages}
        clearable
        hint="Type to filter, pick several"
        label="Programming languages"
        maxTags={3}
        multiple
        placeholder="Start typing to search"
        onChangeValue={(event) => setLanguages(event.detail as string[])}
      >
        {options.map((option) => (
          <COption key={option.value} value={option.value}>
            <div part="language">
              <COptionValue>{option.label}</COptionValue>
              <CIcon path={option.icon} />
            </div>
          </COption>
        ))}
      </CAutocomplete>

      <p>Value: {languages.length ? languages.join(', ') : '[]'}</p>
    </div>
  );
};
