export type CPaginationOptions = {
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

export type CPaginationTextOverrides = {
  itemsPerPageText?: string;
  nextPage?: string;
  prevPage?: string;
  pageText?: ({ start, end, count }) => string;
  pageOfText?: ({ pageNumber, count }) => string;
};

export type CSelectItem = {
  name: string;
  value: string | number;
  disabled?: boolean;
};

export type CAutocompleteItem = CSelectItem & {
  ref?: HTMLElement;
};

export type CRadioGroupItem = {
  name: string;
  value: string | number;
  disabled?: boolean;
};

export type CDataTableFooterOptions = {
  hideDetails?: boolean;
  simple?: boolean;
  hideRange?: boolean;
  size?: 'default' | 'small';
};

export type CDataTableHeader = {
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

export type CDataTableData = {
  [key: string]: CDataTableDataItem;
};

export type CDataTableDataItem = {
  value: string | number;
  formattedValue?: string | number;
  plainTextValue?: string;
  children?: CDataTableChild[];
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end';
  component?: CDataTableComponent;
};

export type CDataTableChild = {
  value: null | string;
  component?: CDataTableComponent;
  children?: CDataTableChild[];
};

export type CDataTableComponent = {
  tag: string;
  params?: CDataTableComponentParams;
  injectValue?: boolean;
};

export type CDataTableComponentParams = {
  [key: string]: unknown;
  onClick?: (params: CDataTableFunctionParams) => unknown;
};

export type CDataTableFunctionParams = {
  event: MouseEvent;
  index: number;
  value: string | number;
  key: string;
  data: CDataTableData;
};

export type CNotificationItem = {
  name: string;
  type: CNotificationItemType;
  delay?: number;
  requiresClosing?: boolean;
};

export type CNotificationItemType = 'warning' | 'error' | 'success' | 'info';

export enum CToastType {
  Warning = 'warning',
  Error = 'error',
  Success = 'success',
  Info = 'info',
}

export enum CToastPosition {
  Absolute = 'absolute',
  Fixed = 'fixed',
}

export type CToastMessage = {
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

export enum CAlertType {
  Warning = 'warning',
  Error = 'error',
  Success = 'success',
  Info = 'info',
}

export type CMenuCustomTrigger = {
  value: string;
  component: {
    tag: string;
    params?: {
      [key: string]: unknown;
    };
  };
};

export type CMenuOption = {
  name: string;
  action: () => void;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'start' | 'end';
};

export type CLoginCardBlendMode =
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

export type CRowAlign = 'start' | 'center' | 'end';

export type CRowJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around';

export type CTabsJustify = 'stretch' | 'start' | 'end' | 'center';
