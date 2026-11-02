const e={CPaginationOptions:`
type CPaginationOptions = {
  itemCount: number;
  currentPage?: number;
  totalVisible?: number;
  itemsPerPage?: number;
  startFrom?: number;
  endTo?: number;
  locale?: string;
  textOverrides?: CPaginationTextOverrides;
  pageSizes?: number[];
};
`,CPaginationTextOverrides:`
type CPaginationTextOverrides = {
  itemsPerPageText?: string;
  nextPage?: string;
  prevPage?: string;
  pageText?: ({ start, end, count }) => string;
  pageOfText?: ({ pageNumber, count }) => string;
};
`,CSelectItem:`
type CSelectItem = {
  name: string;
  value: string | number;
  disabled?: boolean;
};
`,CAutocompleteItem:`
type CAutocompleteItem = CSelectItem & {
  ref?: HTMLElement;
};
`,CRadioGroupItem:`
type CRadioGroupItem = {
  name: string;
  value: string | number;
  disabled?: boolean;
};
`,CDataTableFooterOptions:`
type CDataTableFooterOptions = {
  hideDetails?: boolean;
  simple?: boolean;
  hideRange?: boolean;
  size?: 'default' | 'small';
};
`,CDataTableHeader:`
type CDataTableHeader = {
  key: string;
  value: null | string;
  component?: CDataTableComponent;
  width?: string;
  // pin items to exlude the from being hidden
  pinned?: boolean;
  sortable?: boolean;
  children?: CDataTableChild[];
  hidden?: boolean;
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end';
};
`,CDataTableData:`
type CDataTableData = {
  [key: string]: CDataTableDataItem;
};
`,CDataTableDataItem:`
type CDataTableDataItem = {
  value: string | number;
  formattedValue?: string | number;
  plainTextValue?: string;
  children?: CDataTableChild[];
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end';
  component?: CDataTableComponent;
};
`,CDataTableChild:`
type CDataTableChild = {
  value: null | string;
  component?: CDataTableComponent;
  children?: CDataTableChild[];
};
`,CDataTableComponent:`
type CDataTableComponent = {
  tag: string;
  params?: CDataTableComponentParams;
  injectValue?: boolean;
};
`,CDataTableComponentParams:`
type CDataTableComponentParams = {
  [key: string]: unknown;
  onClick?: (params: CDataTableFunctionParams) => unknown;
};
`,CDataTableFunctionParams:`
type CDataTableFunctionParams = {
  event: MouseEvent;
  index: number;
  value: string | number;
  key: string;
  data: CDataTableData;
};
`,CNotificationItem:`
type CNotificationItem = {
  name: string;
  type: CNotificationItemType;
  delay?: number;
  requiresClosing?: boolean;
};
`,CNotificationItemType:`
type CNotificationItemType = 'warning' | 'error' | 'success' | 'info';
`,CToastType:`
enum CToastType {
  Warning = 'warning',
  Error = 'error',
  Success = 'success',
  Info = 'info',
}
`,CToastPosition:`
enum CToastPosition {
  Absolute = 'absolute',
  Fixed = 'fixed',
}
`,CToastMessage:`
type CToastMessage = {
  message: string;
  title?: string;
  type?: CToastType;
  duration?: number;
  persistent?: boolean;
  position?: CToastPosition;
  id?: string;
  closeText?: string;
  indeterminate?: boolean;
  progress?: boolean;
  custom?: boolean;
};
`,CAlertType:`
enum CAlertType {
  Warning = 'warning',
  Error = 'error',
  Success = 'success',
  Info = 'info',
}
`,CMenuCustomTrigger:`
type CMenuCustomTrigger = {
  value: string;
  component: {
    tag: string;
    params?: {
      [key: string]: unknown;
    };
  };
};
`,CMenuOption:`
type CMenuOption = {
  name: string;
  action: () => void;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'start' | 'end';
};
`,CLoginCardBlendMode:`
type CLoginCardBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';
`,CRowAlign:`
type CRowAlign = 'start' | 'center' | 'end';
`,CRowJustify:`
type CRowJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around';
`,CTabsJustify:`
type CTabsJustify = 'stretch' | 'start' | 'end' | 'center';
`};export{e as t};
