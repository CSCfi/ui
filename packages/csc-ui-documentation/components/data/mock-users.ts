import type { CDataTableData, CDataTableFunctionParams } from '@cscfi/csc-ui';

const users: CDataTableData[] = [
  {
    city: {
      value: 'Petaling Jaya',
    },
    email: {
      value: 'ywhitehorn0@google.ca',
      children: [
        {
          value: 'Send email',
          component: {
            tag: 'c-button',
            params: {
              ghost: true,
              size: 'small',
              onClick: (options: CDataTableFunctionParams) =>
                console.log('Sending email to', options.value),
            },
          },
        },
      ],
    },
    firstName: {
      value: 'Yovonnda',
    },
    id: {
      value: 'user_01',
    },
    lastName: {
      value: 'Whitehorn',
    },
  },
  {
    city: {
      value: 'Sitovo',
    },
    email: {
      value: 'gmccrillis1@state.gov',
    },
    firstName: {
      value: 'Gerry',
    },
    id: {
      value: 'user_02',
    },
    lastName: {
      value: 'McCrillis',
    },
  },
  {
    city: {
      value: 'Krasne',
    },
    email: {
      value: 'sdoxey2@abc.net.au',
    },
    firstName: {
      value: 'Sarajane',
    },
    id: {
      value: 'user_03',
    },
    lastName: {
      value: 'Doxey',
    },
  },
  {
    city: {
      value: 'Haukivuori',
    },
    email: {
      value: 'eguiot3@imdb.com',
    },
    firstName: {
      value: 'Elle',
    },
    id: {
      value: 'user_04',
    },
    lastName: {
      value: 'Guiot',
    },
  },
  {
    city: {
      value: 'Little Current',
    },
    email: {
      value: 'pbotley4@nih.gov',
    },
    firstName: {
      value: 'Patten',
    },
    id: {
      value: 'user_05',
    },
    lastName: {
      value: 'Botley',
    },
  },
  {
    city: {
      value: 'Kulase',
    },
    email: {
      value: 'mpenswick5@webeden.co.uk',
    },
    firstName: {
      value: 'Marleah',
    },
    id: {
      value: 'user_06',
    },
    lastName: {
      value: 'Penswick',
    },
  },
  {
    city: {
      value: 'Hikkaduwa',
    },
    email: {
      value: 'ptriner6@upenn.edu',
    },
    firstName: {
      value: 'Pat',
    },
    id: {
      value: 'user_07',
    },
    lastName: {
      value: 'Triner',
    },
  },
  {
    city: {
      value: 'Suka Makmue',
    },
    email: {
      value: 'mantoniou7@illinois.edu',
    },
    firstName: {
      value: 'Martynne',
    },
    id: {
      value: 'user_08',
    },
    lastName: {
      value: 'Antoniou',
    },
  },
  {
    city: {
      value: 'Perreng',
    },
    email: {
      value: 'jmudie8@google.ca',
    },
    firstName: {
      value: 'Jamal',
    },
    id: {
      value: 'user_09',
    },
    lastName: {
      value: 'Mudie',
    },
  },
  {
    city: {
      value: 'Shiree',
    },
    email: {
      value: 'echildren9@icq.com',
    },
    firstName: {
      value: 'Elvera',
    },
    id: {
      value: 'user_10',
    },
    lastName: {
      value: 'Children',
    },
  },
  {
    city: {
      value: 'Sandnes',
    },
    email: {
      value: 'lmitchinsona@reference.com',
    },
    firstName: {
      value: 'Ladonna',
    },
    id: {
      value: 'user_11',
    },
    lastName: {
      value: 'Mitchinson',
    },
  },
  {
    city: {
      value: 'Kaberamaido',
    },
    email: {
      value: 'jtiffinb@miitbeian.gov.cn',
    },
    firstName: {
      value: 'Jehanna',
    },
    id: {
      value: 'user_12',
    },
    lastName: {
      value: 'Tiffin',
    },
  },
  {
    city: {
      value: 'General Vedia',
    },
    email: {
      value: 'nborthramc@geocities.jp',
    },
    firstName: {
      value: 'Norby',
    },
    id: {
      value: 'user_13',
    },
    lastName: {
      value: 'Borthram',
    },
  },
  {
    city: {
      value: 'Padaran',
    },
    email: {
      value: 'kstringfellowd@google.fr',
    },
    firstName: {
      value: 'Kimberlee',
    },
    id: {
      value: 'user_14',
    },
    lastName: {
      value: 'Stringfellow',
    },
  },
  {
    city: {
      value: 'Helsingborg',
    },
    email: {
      value: 'gbanasike@ycombinator.com',
    },
    firstName: {
      value: 'Gordie',
    },
    id: {
      value: 'user_15',
    },
    lastName: {
      value: 'Banasik',
    },
  },
  {
    city: {
      value: 'Ntungamo',
    },
    email: {
      value: 'amcmainsf@rambler.ru',
    },
    firstName: {
      value: 'Aurel',
    },
    id: {
      value: 'user_16',
    },
    lastName: {
      value: 'McMains',
    },
  },
  {
    city: {
      value: 'Kambing',
    },
    email: {
      value: 'ckleinmanng@de.vu',
    },
    firstName: {
      value: 'Cristen',
    },
    id: {
      value: 'user_17',
    },
    lastName: {
      value: 'Kleinmann',
    },
  },
  {
    city: {
      value: 'Jequié',
    },
    email: {
      value: 'tpluesh@myspace.com',
    },
    firstName: {
      value: 'Thibaud',
    },
    id: {
      value: 'user_18',
    },
    lastName: {
      value: 'Plues',
    },
  },
  {
    city: {
      value: 'Pirca',
    },
    email: {
      value: 'coliphardi@webnode.com',
    },
    firstName: {
      value: 'Carver',
    },
    id: {
      value: 'user_19',
    },
    lastName: {
      value: 'Oliphard',
    },
  },
  {
    city: {
      value: 'Sanfang',
    },
    email: {
      value: 'sorrisj@homestead.com',
    },
    firstName: {
      value: 'Shurlocke',
    },
    id: {
      value: 'user_20',
    },
    lastName: {
      value: 'Orris',
    },
  },
  {
    city: {
      value: 'Daphu',
    },
    email: {
      value: 'bbethunek@51.la',
    },
    firstName: {
      value: 'Bryan',
    },
    id: {
      value: 'user_21',
    },
    lastName: {
      value: 'Bethune',
    },
  },
  {
    city: {
      value: 'Haykashen',
    },
    email: {
      value: 'cyonniel@sun.com',
    },
    firstName: {
      value: 'Carleton',
    },
    id: {
      value: 'user_22',
    },
    lastName: {
      value: 'Yonnie',
    },
  },
  {
    city: {
      value: 'Qigzhi',
    },
    email: {
      value: 'seasumm@aboutads.info',
    },
    firstName: {
      value: 'Sibilla',
    },
    id: {
      value: 'user_23',
    },
    lastName: {
      value: 'Easum',
    },
  },
  {
    city: {
      value: 'Mossel Bay',
    },
    email: {
      value: 'dclaesensn@fc2.com',
    },
    firstName: {
      value: 'Dosi',
    },
    id: {
      value: 'user_24',
    },
    lastName: {
      value: 'Claesens',
    },
  },
  {
    city: {
      value: 'Mežica',
    },
    email: {
      value: 'depinoyo@oracle.com',
    },
    firstName: {
      value: 'Daron',
    },
    id: {
      value: 'user_25',
    },
    lastName: {
      value: 'Epinoy',
    },
  },
  {
    city: {
      value: 'Kraaifontein',
    },
    email: {
      value: 'vfilippuccip@alexa.com',
    },
    firstName: {
      value: 'Vanya',
    },
    id: {
      value: 'user_26',
    },
    lastName: {
      value: 'Filippucci',
    },
  },
  {
    city: {
      value: 'Lipník nad Bečvou',
    },
    email: {
      value: 'cjanuq@arstechnica.com',
    },
    firstName: {
      value: 'Caroline',
    },
    id: {
      value: 'user_27',
    },
    lastName: {
      value: 'Janu',
    },
  },
  {
    city: {
      value: 'Al Khāniq',
    },
    email: {
      value: 'mchantillonr@yale.edu',
    },
    firstName: {
      value: 'Meyer',
    },
    id: {
      value: 'user_28',
    },
    lastName: {
      value: 'Chantillon',
    },
  },
  {
    city: {
      value: 'Cikarang',
    },
    email: {
      value: 'ibens@blogspot.com',
    },
    firstName: {
      value: 'Iorgos',
    },
    id: {
      value: 'user_29',
    },
    lastName: {
      value: 'Ben',
    },
  },
  {
    city: {
      value: 'Mrganush',
    },
    email: {
      value: 'sfulbrookt@google.com.br',
    },
    firstName: {
      value: 'Stella',
    },
    id: {
      value: 'user_30',
    },
    lastName: {
      value: 'Fulbrook',
    },
  },
  {
    city: {
      value: 'Borjomi',
    },
    email: {
      value: 'apepperellu@dmoz.org',
    },
    firstName: {
      value: 'Adamo',
    },
    id: {
      value: 'user_31',
    },
    lastName: {
      value: 'Pepperell',
    },
  },
  {
    city: {
      value: 'Dapuchaihe',
    },
    email: {
      value: 'ebencev@wikipedia.org',
    },
    firstName: {
      value: 'Esme',
    },
    id: {
      value: 'user_32',
    },
    lastName: {
      value: 'Bence',
    },
  },
  {
    city: {
      value: 'Lotoshino',
    },
    email: {
      value: 'vseearw@jimdo.com',
    },
    firstName: {
      value: 'Viv',
    },
    id: {
      value: 'user_33',
    },
    lastName: {
      value: 'Seear',
    },
  },
  {
    city: {
      value: 'Yingchuan',
    },
    email: {
      value: 'hmarchellix@upenn.edu',
    },
    firstName: {
      value: 'Hester',
    },
    id: {
      value: 'user_34',
    },
    lastName: {
      value: 'Marchelli',
    },
  },
  {
    city: {
      value: 'Piraí do Sul',
    },
    email: {
      value: 'flaurischy@netlog.com',
    },
    firstName: {
      value: 'Francisco',
    },
    id: {
      value: 'user_35',
    },
    lastName: {
      value: 'Laurisch',
    },
  },
  {
    city: {
      value: 'Randu',
    },
    email: {
      value: 'nranscombez@vinaora.com',
    },
    firstName: {
      value: 'Nikos',
    },
    id: {
      value: 'user_36',
    },
    lastName: {
      value: 'Ranscombe',
    },
  },
  {
    city: {
      value: 'Vamvakoú',
    },
    email: {
      value: 'smarquet10@tmall.com',
    },
    firstName: {
      value: 'Sherlocke',
    },
    id: {
      value: 'user_37',
    },
    lastName: {
      value: 'Marquet',
    },
  },
  {
    city: {
      value: 'Arzila',
    },
    email: {
      value: 'ddallinder11@nps.gov',
    },
    firstName: {
      value: 'Dario',
    },
    id: {
      value: 'user_38',
    },
    lastName: {
      value: 'Dallinder',
    },
  },
  {
    city: {
      value: 'Lagoaça',
    },
    email: {
      value: 'cranfield12@technorati.com',
    },
    firstName: {
      value: 'Cliff',
    },
    id: {
      value: 'user_39',
    },
    lastName: {
      value: 'Ranfield',
    },
  },
  {
    city: {
      value: 'Ramada',
    },
    email: {
      value: 'lrammell13@ycombinator.com',
    },
    firstName: {
      value: 'Lina',
    },
    id: {
      value: 'user_40',
    },
    lastName: {
      value: 'Rammell',
    },
  },
  {
    city: {
      value: 'Horred',
    },
    email: {
      value: 'dfarnish14@ehow.com',
    },
    firstName: {
      value: 'Dennison',
    },
    id: {
      value: 'user_41',
    },
    lastName: {
      value: 'Farnish',
    },
  },
  {
    city: {
      value: 'Barurao',
    },
    email: {
      value: 'atwinbourne15@google.com.au',
    },
    firstName: {
      value: 'Alard',
    },
    id: {
      value: 'user_42',
    },
    lastName: {
      value: 'Twinbourne',
    },
  },
  {
    city: {
      value: 'Zhouxi',
    },
    email: {
      value: 'cgitting16@salon.com',
    },
    firstName: {
      value: 'Cary',
    },
    id: {
      value: 'user_43',
    },
    lastName: {
      value: 'Gitting',
    },
  },
  {
    city: {
      value: 'Stare Kurowo',
    },
    email: {
      value: 'dgillinghams17@gnu.org',
    },
    firstName: {
      value: 'Darla',
    },
    id: {
      value: 'user_44',
    },
    lastName: {
      value: 'Gillinghams',
    },
  },
  {
    city: {
      value: 'Shuinan',
    },
    email: {
      value: 'bblampey18@nydailynews.com',
    },
    firstName: {
      value: 'Basil',
    },
    id: {
      value: 'user_45',
    },
    lastName: {
      value: 'Blampey',
    },
  },
  {
    city: {
      value: 'Sonsón',
    },
    email: {
      value: 'cdowda19@canalblog.com',
    },
    firstName: {
      value: 'Chan',
    },
    id: {
      value: 'user_46',
    },
    lastName: {
      value: 'Dowda',
    },
  },
  {
    city: {
      value: 'Aemura',
    },
    email: {
      value: 'cshower1a@webnode.com',
    },
    firstName: {
      value: 'Cherlyn',
    },
    id: {
      value: 'user_47',
    },
    lastName: {
      value: 'Shower',
    },
  },
  {
    city: {
      value: 'Nanling',
    },
    email: {
      value: 'hflower1b@ucoz.ru',
    },
    firstName: {
      value: 'Harold',
    },
    id: {
      value: 'user_48',
    },
    lastName: {
      value: 'Flower',
    },
  },
  {
    city: {
      value: 'Cincinnati',
    },
    email: {
      value: 'zduesbury1c@blog.com',
    },
    firstName: {
      value: 'Zonda',
    },
    id: {
      value: 'user_49',
    },
    lastName: {
      value: 'Duesbury',
    },
  },
  {
    city: {
      value: 'Kostinbrod',
    },
    email: {
      value: 'cdiplock1d@clickbank.net',
    },
    firstName: {
      value: 'Chance',
    },
    id: {
      value: 'user_50',
    },
    lastName: {
      value: 'Diplock',
    },
  },
];

const getProgressFromValue = (value: string) =>
  Math.min(value.length * 10, 100);

users.forEach((user) => {
  const progress = getProgressFromValue(user.firstName.value as string);
  const progress2 = getProgressFromValue(user.lastName.value as string);

  user.progress = {
    value: progress,
    formattedValue: `${formatNumber(progress, 1)} %`,
  };

  user.progress2 = {
    value: progress2,
    formattedValue: `${formatNumber(progress2, 1)} %`,
  };

  const failure = getProgressFromValue(user.firstName.value as string) / 3;

  user.failure = {
    value: failure,
    formattedValue: `${formatNumber(failure, 1)} %`,
  };

  const salary = getProgressFromValue(user.firstName.value as string) * 64;

  user.salary = {
    value: salary,
    formattedValue: `${formatNumber(salary, 1)} $`,
  };
});

export default users;
