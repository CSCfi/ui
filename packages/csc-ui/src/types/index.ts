export interface CPaginationOptions {
  itemCount: number;
  currentPage?: number;
  totalVisible?: number;
  itemsPerPage?: number;
  startFrom?: number;
  endTo?: number;
}

export interface CSelectItem {
  name: string;
  value: string | number;
}

export interface CAutocompleteItem extends CSelectItem {}

export interface CRadioGroupItem {
  label: string;
  value: string | number;
}
