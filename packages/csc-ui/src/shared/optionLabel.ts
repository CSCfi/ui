/**
 * The label of a slotted `<c-option>` — what a value-selection field shows
 * for the option in its row, its closed field and its tags, and what
 * `c-autocomplete`'s filter matches (ADR-0045).
 *
 * Resolution chain:
 *   1. the option's `name` (the property, else the attribute — the element may
 *      not be upgraded yet when a parent reads it during mount);
 *   2. else the text of its first `<c-option-value>`, the label region: it
 *      lets an option carry richer content (a description, an icon) that is
 *      not part of the label;
 *   3. else the option's whole text content.
 *
 * Trimmed; an empty `name` counts as absent. Callers keep their own last
 * resort (the raw value) so a label is never blank.
 */
export const optionValueElement = (option: Element): Element | null =>
  option.querySelector('c-option-value');

export const optionLabel = (option: HTMLElement): string => {
  const name =
    (option as { name?: string } & HTMLElement).name ??
    option.getAttribute('name');

  if (name) return name.trim();

  const wrapper = optionValueElement(option)?.textContent?.trim();

  return wrapper || (option.textContent ?? '').trim();
};
