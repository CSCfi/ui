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
  {
    value: 'js',
    label: 'JavaScript',
    icon: mdiLanguageJavascript,
    color: '#F7DF1E',
  },
  {
    value: 'ts',
    label: 'TypeScript',
    icon: mdiLanguageTypescript,
    color: '#3178C6',
  },
  {
    value: 'py',
    label: 'Python',
    icon: mdiLanguagePython,
    color: '#3776AB',
  },
  {
    value: 'rs',
    label: 'Rust',
    icon: mdiLanguageRust,
    color: '#CE422B',
  },
  {
    value: 'go',
    label: 'Go',
    icon: mdiLanguageGo,
    color: '#00ADD8',
  },
  {
    value: 'rb',
    label: 'Ruby',
    icon: mdiLanguageRuby,
    color: '#CC342D',
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
              <CIcon color={option.color} path={option.icon} />
            </div>
          </COption>
        ))}
      </CAutocomplete>

      <p>Value: {languages.length ? languages.join(', ') : '[]'}</p>
    </div>
  );
};
