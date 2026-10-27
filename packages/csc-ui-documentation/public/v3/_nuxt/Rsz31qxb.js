const t=`
import {  mdiButtonCursor,
  mdiCog,
  mdiEye,
  mdiInformationOutline,
  mdiLanguageHtml5,
  mdiLanguageJavascript,
  mdiPackageVariantClosed,
  mdiPalette,
} from '@mdi/js';

const currentMenuItem = ref('button');

const onNavigation = (item: string) => {
  currentMenuItem.value = item;
};
`;export{t as default};
