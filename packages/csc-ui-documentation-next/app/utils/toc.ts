/**
 * One link in the "On this page" rail (see TocRail.vue). `id` is the anchor
 * of the target element; `kind` selects the link styling: top-level (default),
 * indented sub-entry, or mono component tag heading.
 */
export interface TocItem {
  id: string;
  kind?: 'component' | 'sub';
  label: string;
}
