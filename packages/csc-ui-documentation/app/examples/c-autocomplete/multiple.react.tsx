import {
  CAutocomplete,
  CIcon,
  COption,
  COptionValue,
} from '@cscfi/csc-ui-react';
import {
  mdiLanguageGo,
  mdiLanguageJavascript,
  mdiLanguagePython,
  mdiLanguageRuby,
  mdiLanguageRust,
  mdiLanguageTypescript,
} from '@mdi/js';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

const options = [
  {
    color: '#F7DF1E',
    icon: mdiLanguageJavascript,
    label: 'JavaScript',
    value: 'js',
  },
  {
    color: '#3178C6',
    icon: mdiLanguageTypescript,
    label: 'TypeScript',
    value: 'ts',
  },
  {
    color: '#3776AB',
    icon: mdiLanguagePython,
    label: 'Python',
    value: 'py',
  },
  {
    color: '#CE422B',
    icon: mdiLanguageRust,
    label: 'Rust',
    value: 'rs',
  },
  {
    color: '#00ADD8',
    icon: mdiLanguageGo,
    label: 'Go',
    value: 'go',
  },
  {
    color: '#CC342D',
    icon: mdiLanguageRuby,
    label: 'Ruby',
    value: 'rb',
  },
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
        clearable
        hint="Type to filter, pick several"
        label="Programming languages"
        maxTags={3}
        multiple
        onChangeValue={(event) => setLanguages(event.detail as string[])}
        placeholder="Start typing to search"
        value={languages}
      >
        {options.map((option) => (
          <COption key={option.value} value={option.value}>
            <div part="language">
              <COptionValue>{option.label}</COptionValue>
              <CIcon color={option.color} path={option.icon} />
            </div>
          </COption>
        ))}
      </CAutocomplete>

      <p>Value: {languages.length ? languages.join(', ') : '[]'}</p>
    </div>
  );
};
