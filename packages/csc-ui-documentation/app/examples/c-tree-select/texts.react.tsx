import type { CTreeSelectItem, CTreeSelectTexts } from '@cscfi/csc-ui';

import { CTreeSelect } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

const items: CTreeSelectItem[] = [
  {
    children: [
      {
        children: [
          { code: '1111', name: 'Puhdas matematiikka', value: '1111' },
          { code: '1112', name: 'Sovellettu matematiikka', value: '1112' },
        ],
        code: '111',
        name: 'Matematiikka',
        value: '111',
      },
      {
        children: [
          { code: '1131', name: 'Tietojenkäsittelytiede', value: '1131' },
          { code: '1132', name: 'Tietojärjestelmätiede', value: '1132' },
        ],
        code: '113',
        name: 'Tietojenkäsittely ja informaatiotieteet',
        value: '113',
      },
    ],
    code: '1',
    name: 'Luonnontieteet',
    value: '1',
  },
  {
    children: [
      {
        children: [
          { code: '2131', name: 'Elektroniikka', value: '2131' },
          { code: '2133', name: 'Tietoliikennetekniikka', value: '2133' },
        ],
        code: '213',
        name: 'Sähkö-, automaatio- ja tietoliikennetekniikka',
        value: '213',
      },
      {
        children: [
          { code: '2171', name: 'Biolääketieteen tekniikka', value: '2171' },
          {
            code: '2172',
            name: 'Lääketieteellinen kuvantaminen',
            value: '2172',
          },
        ],
        code: '217',
        name: 'Lääketieteen tekniikka',
        value: '217',
      },
    ],
    code: '2',
    name: 'Tekniikka',
    value: '2',
  },
];

const levelLabels = ['päätieteenala', 'tieteenala', 'alatieteenala'];

const texts: CTreeSelectTexts = {
  breadcrumb: 'Sijainti',
  browse: 'Selaa sen sijaan',
  children: (count) => `${count} alakohtaa`,
  choose: (level) => `Valitse ${level}`,
  clearSelection: 'Tyhjennä valinta',
  filterOptions: 'Suodata vaihtoehtoja',
  final: 'Viimeinen taso',
  level: (n) => `taso ${n}`,
  matches: (count) => `${count} osumaa`,
  noResults: 'Ei osumia',
  root: 'Kaikki',
  searchPlaceholder: 'Hae nimellä tai koodilla',
  select: (name) => `Valitse ${name}`,
  step: (n, total) => `Vaihe ${n}/${total}`,
  toggleOptions: 'Näytä vaihtoehdot',
};

export const Texts = () => {
  const [field, setField] = useState<null | string>(null);

  return (
    <div>
      <CTreeSelect
        clearable
        hint="Selaa tasoja tai hae"
        items={items}
        label="Tieteenala"
        levelLabels={levelLabels}
        onChange={(event) => setField(event.detail as null | string)}
        texts={texts}
        value={field}
      />

      <p>Value: {field ?? 'null'}</p>
    </div>
  );
};
