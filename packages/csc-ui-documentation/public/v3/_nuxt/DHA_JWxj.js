const e=`
import { mdiCellphone, mdiDelete, mdiMonitor } from '@mdi/js';
const displayType = ref<'desktop' | 'mobile'>('desktop');

const tableElementRef = useTemplateRef<HTMLCTableElement>('tableElementRef');

const headers = ['Id', 'Name', 'Ssn', ''];

const defaultUsers = [
  {
    id: '19-9985829',
    name: 'Trueman Stoving',
    ssn: '739-44-5303',
  },
  {
    id: '29-6327242',
    name: 'August Cosslett',
    ssn: '851-25-1988',
  },
  {
    id: '72-2577427',
    name: 'Ethe Kent',
    ssn: '624-36-3386',
  },
  {
    id: '28-0732117',
    name: 'Harbert Doey',
    ssn: '719-22-1203',
  },
  {
    id: '39-6848867',
    name: 'Sidonnie Lamas',
    ssn: '442-24-1083',
  },
];

const users = ref([...defaultUsers]);

const onRemoveUser = (id: string) => {
  users.value = users.value.filter((user) => user.id !== id);
};

const onAddUser = () => {
  users.value = [
    ...users.value,
    {
      id: 'user_' + Date.now(),
      name: 'New User',
      ssn: 'some-ssn',
    },
  ];

  // Update mobile labels when adding data
  tableElementRef.value?.updateMobileLabels();
};

const onReset = () => {
  users.value = [...defaultUsers];

  // Update mobile labels when adding data
  tableElementRef.value?.updateMobileLabels();
};
`;export{e as default};
