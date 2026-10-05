/**
 * The breadcrumb's fold arithmetic (ADR-0067), kept free of the DOM so the
 * node project can pin it down. The component measures each crumb once, in
 * the row and untruncated, and asks `fitCrumbs` how to lay out the current
 * width.
 */

/** One crumb's widths in px, measured in the row: its whole item, separator included. */
export interface CBreadcrumbCrumbWidth {
  /** The narrowest the crumb may get when its label truncates. */
  floor: number;
  /** The untruncated width. */
  natural: number;
}

export interface CBreadcrumbFit {
  /** Width cap for the current (last) crumb, or `null` when it keeps its natural width. */
  currentMax: null | number;
  /** Width cap for the first crumb, or `null` when it keeps its natural width. */
  firstMax: null | number;
  /** How many crumbs fold, counted from the second one. */
  folded: number;
}

/** Sub-pixel slack: rects are fractional, and a row that fits by 0.3px fits. */
const EPSILON = 0.5;

/**
 * Lay the crumbs out in `available` px: fold middle crumbs, the one nearest
 * the first crumb first, until the row fits — the fold button joining it at
 * `foldWidth` — never the first or the current (last) crumb. When nothing
 * more can fold, truncate the current crumb down to its floor, then the
 * first one.
 */
export const fitCrumbs = (
  crumbs: readonly CBreadcrumbCrumbWidth[],
  foldWidth: number,
  available: number,
): CBreadcrumbFit => {
  const n = crumbs.length;

  const fit: CBreadcrumbFit = { currentMax: null, firstMax: null, folded: 0 };

  if (n === 0) return fit;

  let total = crumbs.reduce((sum, c) => sum + c.natural, 0);

  if (total > available + EPSILON && n > 2) {
    total += foldWidth;

    while (fit.folded < n - 2 && total > available + EPSILON) {
      total -= crumbs[1 + fit.folded].natural;
      fit.folded++;
    }
  }

  let deficit = total - available;

  if (deficit <= EPSILON) return fit;

  const current = crumbs[n - 1];

  const currentCut = Math.min(
    Math.max(current.natural - current.floor, 0),
    deficit,
  );

  fit.currentMax = current.natural - currentCut;
  deficit -= currentCut;

  if (n > 1 && deficit > EPSILON) {
    const head = crumbs[0];

    fit.firstMax =
      head.natural - Math.min(Math.max(head.natural - head.floor, 0), deficit);
  }

  return fit;
};
