import {
  mdiArrowDownThin,
  mdiArrowUpThin,
  mdiSwapVertical,
  mdiChevronDown,
} from '@mdi/js';
import {
  Component,
  Host,
  h,
  Element,
  Event,
  EventEmitter,
  State,
  Fragment,
  Watch,
} from '@stencil/core';
import { Prop } from '../../../dist/types/stencil-public-runtime';
import {
  CDataTableData,
  CDataTableDataItem,
  CDataTableFooterOptions,
  CDataTableHeader,
  CPaginationOptions,
} from '../../types';

interface CDataTableDataItemPrivate extends Omit<CDataTableDataItem, 'value'> {
  _hiddenData?: {
    id?: string;
    key?: string;
    value?: CDataTableDataItem;
  }[];
}

type HeaderRefs = Map<string, HTMLElement>;

/**
 * @group Tables
 */
@Component({
  tag: 'c-data-table',
  styleUrl: 'c-data-table.scss',
  shadow: true,
})
export class CDataTable {
  @Element() element: HTMLCDataTableElement;

  /**
   * Data of the table
   */
  @Prop() data: CDataTableData[] = [];

  /**
   * Externally sorted and paginated data
   */
  @Prop() externalData = false;

  /**
   * Headers of the table
   */
  @Prop() headers: CDataTableHeader[] = [];

  /**
   * Add hover effect to the table rows
   */
  @Prop() hoverable = false;

  /**
   * Items per page options
   */
  @Prop() footerOptions: CDataTableFooterOptions = {
    itemsPerPageOptions: [5, 25, 50, 100],
    hideDetails: false,
    simple: false,
    hideRange: false,
    size: 'default',
  };

  /**
   * Show a loader on top of the table
   */
  @Prop() loading = false;

  /**
   * Pagination options
   */
  @Prop() pagination: CPaginationOptions;

  /**
   * Make rows selectable
   */
  @Prop() selectable = false;

  /**
   * Property used in selections
   */
  @Prop() selectionProperty: string = null;

  /**
   * Sort data by
   */
  @Prop() sortBy = null;

  /**
   * Sorting direction
   */
  @Prop() sortDirection: 'asc' | 'desc' | null = null;

  /**
   * Triggered on pagination
   */
  @Event() paginate: EventEmitter<CPaginationOptions>;

  /**
   * Triggered on sort
   */
  @Event() sort: EventEmitter;

  /**
   * Triggered on selection
   */
  @Event() selection: EventEmitter;

  @State() _activeRows: (number | string)[] = [];

  @State() _data: CDataTableDataItemPrivate[] = [];

  @State() _isPaginationSimple = false;

  @State() _selectedRows: number[] = [];

  @State() hasOverflow = false;

  @State() hiddenHeaders: string[] = [];

  private _debounce = null;

  private _extraHeaders: CDataTableHeader[] = [];

  private _rootIntersectionObserver: IntersectionObserver;

  private _resizeObserver: ResizeObserver;

  private _tableElement: HTMLTableElement;

  private _footerElement: HTMLTableRowElement;

  private _headerRefs: HeaderRefs;

  private _isValidated = false;

  private _isVisible = false;

  @Watch('hiddenHeaders')
  onHeaderChange() {
    this._getData();
  }

  @Watch('data')
  onDataChange() {
    this._getData();
  }

  componentWillLoad() {
    this._getData();
  }

  componentDidLoad() {
    this._rootIntersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this._handleResponsiveHeaders();

        this._isVisible = true;
      }
    });

    this._resizeObserver = new ResizeObserver(([entry]) => {
      this._handleResize(entry);
    });

    this._rootIntersectionObserver.observe(this.element);
    this._resizeObserver.observe(this._tableElement);
  }

  disconnectedCallback() {
    this._resizeObserver.disconnect();
    this._rootIntersectionObserver.disconnect();
  }

  private _handleResponsiveHeaders() {
    const { width: tableWidth } = this._tableElement.getBoundingClientRect();
    const { width: rootWidth, x } = this.element.getBoundingClientRect();

    if (rootWidth < tableWidth) {
      if (this._debounce !== null) {
        clearTimeout(this._debounce);
        this._debounce = null;
      }

      setTimeout(() => {
        for (const header of this._headerRefs.values()) {
          if (header) {
            const position = header.getBoundingClientRect();
            const isFullyVisible = position.right - x <= rootWidth;
            const isLastVisibleHeader =
              header.dataset.id === Array.from(this._headerRefs.keys()).at(0);

            if (!isFullyVisible && !isLastVisibleHeader) {
              this.hiddenHeaders = [
                ...new Set([...this.hiddenHeaders, header.dataset.id]),
              ];
            }
          }
        }

        this._debounce = setTimeout(() => {
          const footerWidth =
            this._footerElement?.getBoundingClientRect()?.width || 0;

          if (rootWidth < footerWidth) {
            this._isPaginationSimple = true;
          }
        }, 200);
      }, 0);
    }
  }

  private _addHeaderRef(key: string, el: HTMLElement) {
    if (!this._headerRefs) {
      this._headerRefs = new Map([[key, el]]);

      return;
    }

    this._headerRefs.set(key, el);
  }

  private _getData() {
    this._extraHeaders = this.headers.filter(
      (header) => !Object.keys(this.data?.[0] || {}).includes(header.key),
    );

    const extraCells = this._extraHeaders.reduce(
      (cells, header) => ({
        ...cells,
        [header.key]: {
          value: null,
        },
      }),
      {},
    );

    const items = this.data
      .map((row) => ({
        ...row,
        ...extraCells,
      }))
      .reduce<CDataTableDataItemPrivate[]>((data, cell) => {
        const item: CDataTableDataItemPrivate = {
          _hiddenData: [],
        };

        Object.keys(cell)
          .filter((key) => !this.hiddenHeaders.includes(key))
          .forEach((key) => {
            item[key] = cell[key];
          });

        this.hiddenHeaders.forEach((header) => {
          const cellData = this.headers.find((h) => h.key === header);

          item._hiddenData.push({
            id: cellData?.key,
            key: cellData?.value,
            value: cell[header],
          });
        });

        data.push(item);

        return data;
      }, []);

    this._data = this._sortData(items);

    this._validateProps(this._data[0]);
  }

  private get _headers() {
    return this.headers.filter(
      (header) => !this.hiddenHeaders.includes(header.key),
    );
  }

  private get _headerKeys() {
    return this._headers.map((header) => header.key);
  }

  private get _hasHiddenData() {
    return !!this.hiddenHeaders.length;
  }

  private _sortData(
    data: CDataTableDataItem[] | CDataTableDataItemPrivate[],
  ): CDataTableDataItemPrivate[] {
    if (!this.sortBy || this.externalData) return data;

    const sorted = data.sort((a, b) => {
      const valueA = a[this.sortBy].value;
      const valueB = b[this.sortBy].value;

      if (typeof valueA === 'string') {
        if (this.sortDirection === 'asc') {
          return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
        }

        return valueB.toLowerCase().localeCompare(valueA.toLowerCase());
      }

      if (typeof valueA === 'number') {
        if (this.sortDirection === 'asc') {
          return valueA - valueB;
        }

        return valueB - valueA;
      }
    });

    return !!this.pagination
      ? sorted.slice(this.pagination.startFrom, this.pagination.endTo + 1)
      : sorted;
  }

  private _handleResize(entry: ResizeObserverEntry) {
    const { height } = entry.contentRect;

    this.element.style.height = `${Math.ceil(height)}px`;

    if (this._isVisible) {
      this._handleResponsiveHeaders();
    }
  }

  private _onPaginationChange(event: CustomEvent) {
    if (this.externalData) {
      this.paginate.emit(event.detail);

      return;
    }

    this.pagination = {
      ...this.pagination,
      ...event.detail,
    };

    this._getData();
  }

  private _onSelection(index: number) {
    if (this._selectedRows.includes(index)) {
      this._selectedRows = this._selectedRows.filter(
        (selection) => selection !== index,
      );
    } else {
      this._selectedRows = [...this._selectedRows, index];
    }

    this.selection.emit(this._selectedRows);
  }

  private _onSort(key: string) {
    if (this.sortBy === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortDirection = 'asc';
    }

    this.sortBy = key;

    this.sort.emit({ sortBy: this.sortBy, direction: this.sortDirection });

    this._getData();
  }

  private _onToggleAdditionalData(value: string | number) {
    if (!this._hasHiddenData) return;

    if (this._activeRows.includes(value)) {
      this._activeRows = this._activeRows.filter((i) => i !== value);

      return;
    }

    this._activeRows = [...this._activeRows, value];
  }

  private _renderCell(key, options, index, rowIndex, data) {
    const Tag = this.headers[index]?.component?.tag;
    const injectValue = !!this.headers[index]?.component?.injectValue;
    const params = this.headers[index]?.component?.params || {};

    if (injectValue) {
      params.value = options.value;
    }

    return !!Tag ? (
      <Tag
        {...params}
        onClick={(event: MouseEvent) =>
          params?.onClick?.({
            index: rowIndex,
            value: options.value,
            event,
            key,
            data,
          })
        }
      >
        {options.value}
      </Tag>
    ) : (
      options.value
    );
  }

  private _renderCellChildren(
    options: CDataTableDataItem | CDataTableHeader,
    index: number,
    key: string,
    data = {},
  ) {
    return options.children.map((child) => {
      const Tag = child.component?.tag;
      const params = child.component?.params || {};

      return !!Tag ? (
        <Tag
          {...params}
          onClick={(event: MouseEvent) =>
            params?.onClick?.({
              value: options.value,
              index,
              event,
              key,
              data,
            })
          }
        >
          {child.value}
        </Tag>
      ) : (
        child.value
      );
    });
  }

  private _renderRows() {
    return Object.values(this._data).map((row, i) => {
      const selectionValue = !!this.selectionProperty
        ? row[this.selectionProperty]?.value || i
        : i;
      const isSelected = this._selectedRows.includes(selectionValue);

      return (
        <Fragment>
          <tr
            class={{
              active: this._activeRows.includes(i),
              parent: this._hasHiddenData,
              selected: isSelected,
            }}
            onClick={() => this._onToggleAdditionalData(i)}
          >
            {this.selectable && (
              <td>
                <div class="selection">
                  <c-checkbox
                    value={isSelected}
                    hide-details
                    onChangeValue={() => this._onSelection(selectionValue)}
                  ></c-checkbox>
                </div>
              </td>
            )}

            {this._hasHiddenData && (
              <td>
                <div>
                  <svg width="22" height="22" viewBox="0 0 24 24">
                    <path d={mdiChevronDown} />
                  </svg>
                </div>
              </td>
            )}

            {Object.entries(row)
              .filter(([key]) => !['_hiddenData'].includes(key))
              .sort(
                ([keyA], [keyB]) =>
                  this._headerKeys.indexOf(keyA) -
                  this._headerKeys.indexOf(keyB),
              )
              .map(([key, options], index) => (
                <td>
                  <div>
                    {this._renderCell(key, options, index, i, row)}
                    {!!options.children && (
                      <div class="children">
                        {this._renderCellChildren(options, i, key, row)}
                      </div>
                    )}

                    {!!this.headers[index]?.children && (
                      <div class="children">
                        {this._renderCellChildren(
                          this.headers[index],
                          i,
                          key,
                          row,
                        )}
                      </div>
                    )}
                  </div>
                </td>
              ))}
          </tr>

          {this._hasHiddenData && (
            <tr
              class={{
                'additional-data': true,
                active: this._activeRows.includes(i),
              }}
            >
              <td colSpan={100}>
                <div>
                  <ul>
                    {this._data[i]._hiddenData
                      .filter(
                        (d) => !this._extraHeaders.find((h) => h.key === d.id),
                      )
                      .map(({ id, key, value: options }) => {
                        const index = this.headers.findIndex(
                          (h) => h.key === id,
                        );

                        return (
                          <li>
                            {key}: {this._renderCell(id, options, index, i, {})}
                            {!!options.children && (
                              <div class="children">
                                {this._renderCellChildren(options, i, id)}
                              </div>
                            )}
                          </li>
                        );
                      })}

                    {this._data[i]._hiddenData.map(({ id, key }) => {
                      const index = this.headers.findIndex((h) => h.key === id);

                      return (
                        !!this.headers[index]?.children && (
                          <li>
                            <div class="children">
                              {this._renderCellChildren(
                                this.headers[index],
                                i,
                                key,
                                row,
                              )}
                            </div>
                          </li>
                        )
                      );
                    })}
                  </ul>
                </div>
              </td>
            </tr>
          )}
        </Fragment>
      );
    });
  }

  private _renderSortIndicator(key: string) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24">
        {key === this.sortBy && this.sortDirection === 'asc' && (
          <path d={mdiArrowUpThin} />
        )}
        {key === this.sortBy && this.sortDirection === 'desc' && (
          <path d={mdiArrowDownThin} />
        )}
        {(key !== this.sortBy || !this.sortDirection) && (
          <path d={mdiSwapVertical} />
        )}
      </svg>
    );
  }

  private _validateProps(data) {
    if (
      !this._isValidated &&
      this.selectionProperty !== null &&
      !data[this.selectionProperty]
    ) {
      console.warn(
        `[C-DATA-TABLE] Invalid selection property '${this.selectionProperty}'. Using row index as a fallback. This may lead to unexpected behavior.`,
      );

      this._isValidated = true;
    }
  }

  render() {
    const tableClasses = {
      'c-data-table': true,
      'c-data-table--hoverable': this.hoverable,
    };

    return (
      <Host>
        <table
          class={tableClasses}
          ref={(el) => (this._tableElement = el as HTMLTableElement)}
        >
          <thead>
            <tr>
              {this.selectable && <th class="selection"></th>}

              {this._hasHiddenData && <th class="indicator"></th>}

              {!!this._headers.length &&
                this._headers.map((header) => {
                  const isSortable =
                    !!header.sortable || typeof header.sortable === 'undefined';
                  const params = {
                    'data-id': header.key,
                    ref: (el) => this._addHeaderRef(header.key, el),
                    ...(!!header.width && {
                      style: {
                        width: header.width || 'auto',
                      },
                    }),
                    ...(isSortable && {
                      onClick: () => this._onSort(header.key),
                    }),
                  };

                  return (
                    <th {...params}>
                      <div class={{ sortable: isSortable }}>
                        {header.value}
                        {isSortable && this._renderSortIndicator(header.key)}
                      </div>
                    </th>
                  );
                })}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td class="loader" colSpan={100}>
                {this.loading && (
                  <div class="c-data-table__loader">
                    <div class="loading-bar" />
                  </div>
                )}
              </td>
            </tr>

            {!this._data.length && (
              <tr>
                <td class="info" colSpan={100}>
                  <div>{this.loading ? 'Loading data' : 'No data'}</div>
                </td>
              </tr>
            )}

            {!!this._data.length && this._renderRows()}
          </tbody>

          {!!this.pagination && (
            <tfoot>
              <tr
                ref={(el) => (this._footerElement = el as HTMLTableRowElement)}
              >
                <td colSpan={100}>
                  <div>
                    <c-pagination
                      {...this.footerOptions}
                      value={this.pagination}
                      simple={this._isPaginationSimple}
                      onChangeValue={(e) => this._onPaginationChange(e)}
                    ></c-pagination>
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </Host>
    );
  }
}
