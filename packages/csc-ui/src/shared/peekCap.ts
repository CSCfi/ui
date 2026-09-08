/**
 * The peek (CONTEXT.md, ADR-0043).
 *
 * A transient list panel — the menu and submenu panels, `c-dropdown`'s
 * listbox, `c-autocomplete`'s options list — hides its scrollbar. In its
 * place an overflowing list must end at an item row's midpoint: the
 * half-visible row is the one cue that more rows follow. This module computes
 * that cap from the real row boxes, so mixed-height menus (items, labels,
 * dividers) and taller slotted option rows cut correctly.
 */

export interface PeekCapOptions {
  /**
   * Upper bound for the list's `max-height`, in px. `Infinity` for none.
   * `applyPeekCap` defaults it to the list's stylesheet `max-height`.
   */
  ceiling?: number;
  /** Full rows shown before the peek. `0` (or less): no row cap. */
  itemsPerPage?: number;
  /** Item rows in visual order — only these can be the peek row. */
  rows: readonly HTMLElement[];
}

const px = (value: string) => parseFloat(value) || 0;

/**
 * The `max-height` (px) that ends `list` at a row midpoint, or `null` when
 * the content fits and needs no cap. Rows are located relative to the list's
 * scroll content (rect deltas plus `scrollTop`), so the result is independent
 * of the panel's positioning scheme and of any cap currently applied.
 */
export const peekCap = (
  list: HTMLElement,
  { ceiling = Infinity, itemsPerPage = 0, rows }: PeekCapOptions,
): null | number => {
  // Not rendered (closed popover / dialog): nothing to measure.
  if (!list.isConnected || list.getClientRects().length === 0) return null;

  const cs = getComputedStyle(list);

  const border = px(cs.borderTopWidth) + px(cs.borderBottomWidth);

  const padding = px(cs.paddingTop) + px(cs.paddingBottom);

  // `max-height` sizes the border box (Tailwind preflight) or the content
  // box; the peek is defined on the client box the rows scroll through.
  const borderBox = cs.boxSizing === 'border-box';

  const toClient = (maxHeight: number) =>
    borderBox ? maxHeight - border : maxHeight + padding;

  const toMaxHeight = (client: number) =>
    borderBox ? client + border : client - padding;

  const clientCeiling = toClient(ceiling);

  const rowCapApplies = itemsPerPage > 0 && rows.length > itemsPerPage;

  if (!rowCapApplies && list.scrollHeight <= clientCeiling) return null;

  // y of scroll-content coordinate 0 in viewport space.
  const origin =
    list.getBoundingClientRect().top + list.clientTop - list.scrollTop;

  const midpoint = (row: HTMLElement) => {
    const r = row.getBoundingClientRect();

    return r.top - origin + r.height / 2;
  };

  let cap = rowCapApplies ? midpoint(rows[itemsPerPage]) : Infinity;

  if (cap > clientCeiling) {
    // Snap down to the last item midpoint under the ceiling — past any label
    // or divider, which are not rows and never the peek.
    let best = 0;

    for (const row of rows) {
      const m = midpoint(row);

      if (m <= clientCeiling && m > best) best = m;
    }

    cap = best > 0 ? best : clientCeiling;
  }

  if (!Number.isFinite(cap)) return null;

  return Math.round(toMaxHeight(cap));
};

/**
 * Write the peek cap as the list's inline `max-height` (cleared when no cap
 * is needed). Without `ceiling` the list's stylesheet `max-height` (e.g.
 * `max-h-[80vh]`, or a consumer's `::part()` override) is the ceiling; the
 * inline value is cleared first so that stylesheet value is what gets read.
 */
export const applyPeekCap = (
  list: HTMLElement,
  options: PeekCapOptions,
): void => {
  list.style.maxHeight = '';

  const ceiling = options.ceiling ?? px(getComputedStyle(list).maxHeight);

  const cap = peekCap(list, {
    ...options,
    ceiling: ceiling > 0 ? ceiling : Infinity,
  });

  if (cap !== null) list.style.maxHeight = `${cap}px`;
};
