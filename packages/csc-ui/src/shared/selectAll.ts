/**
 * The select-all row (CONTEXT.md, ADR-0046): the selection maths `c-select`
 * and `c-autocomplete` share in `multiple` mode.
 *
 * `listed` is the enabled options currently in the list, in list order —
 * every option in c-select, the current matches in c-autocomplete; callers
 * filter disabled options out first. Duplicate option values collapse in the
 * Set maths, exactly as they do when a single row is toggled.
 */

/** `c-select` ↔ `c-dropdown` `index` contract: the select-all row is highlighted. */
export const SELECT_ALL_INDEX = -1;

export type SelectAllState = 'all' | 'none' | 'some';

export interface SelectAllListedOption {
  label: string;
  value: number | string;
}

/** What the row's indicator shows: none, some (indeterminate) or all listed selected. */
export const selectAllState = (
  listed: readonly (number | string)[],
  selected: ReadonlySet<number | string>,
): SelectAllState => {
  const hits = listed.filter((v) => selected.has(v)).length;

  if (hits === 0) return 'none';

  return hits === listed.length ? 'all' : 'some';
};

/**
 * The next selection after the row is activated. Every listed option already
 * selected → drop the listed values (the others keep their order); otherwise
 * append the unselected listed options in list order (selection order,
 * ADR-0044). `added` / `removed` let a caller keep per-value bookkeeping.
 */
export const toggleAllValues = <T>(
  current: readonly T[],
  listed: readonly SelectAllListedOption[],
  valueOf: (v: T) => number | string,
  make: (o: SelectAllListedOption) => T,
): {
  added: SelectAllListedOption[];
  next: T[];
  removed: (number | string)[];
} => {
  const selected = new Set(current.map(valueOf));

  const listedSet = new Set(listed.map((o) => o.value));

  if (listed.length && listed.every((o) => selected.has(o.value))) {
    return {
      added: [],
      next: current.filter((v) => !listedSet.has(valueOf(v))),
      removed: listed.map((o) => o.value),
    };
  }

  const added = listed.filter((o) => !selected.has(o.value));

  return { added, next: [...current, ...added.map(make)], removed: [] };
};
