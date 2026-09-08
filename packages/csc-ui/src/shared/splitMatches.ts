/**
 * Split a label into the runs that equal the query and the runs between them
 * — the shape `c-autocomplete`'s match marking renders as text and
 * `<mark part="match">` nodes (ADR-0045).
 *
 * The query is matched literally (regex metacharacters escaped — the 3.x
 * implementation built an unescaped RegExp and threw on `c++` or `(`) and
 * case-insensitively via the `i` flag on the original string, so indices never
 * drift the way a lowercased `indexOf` can when case mapping changes a
 * string's length. Every occurrence is marked, left to right, without
 * overlap; adjacent occurrences yield adjacent marks. An empty query yields
 * one plain run (or nothing for empty text).
 */
export interface MatchSegment {
  match: boolean;
  text: string;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const splitMatches = (text: string, query: string): MatchSegment[] => {
  if (!query) return text ? [{ match: false, text }] : [];

  // A capturing group makes `split` keep the matches: [gap, match, gap, …],
  // so odd indices are the marked runs.
  const re = new RegExp(`(${escapeRegExp(query)})`, 'i');

  return text
    .split(re)
    .map((part, i) => ({ match: i % 2 === 1, text: part }))
    .filter((s) => s.text);
};
