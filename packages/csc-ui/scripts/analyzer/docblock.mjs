/**
 * Minimal JSDoc block parser for the component-level docblock.
 *
 * The analyzer only needs the free-text description plus the doc tags that
 * carry the slot / CSS-part / CSS-custom-property contract:
 *
 *   @slot <name> - <description>
 *   @csspart <name> - <description>
 *   @cssprop --<name> - <description>
 *
 * The `- ` separator is optional; everything after the name is description.
 * Multi-line descriptions continue until the next `@tag` line.
 */

/** Strip the comment fences and leading `*` gutters from a raw block comment. */
const stripFences = (raw) =>
  raw
    .replace(/^\/\*\*?/, '')
    .replace(/\*\/\s*$/, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*( |$)/, ''))
    .join('\n')
    .trim();

/**
 * Parse a raw block comment into `{ description, tags }` where each tag is
 * `{ tag, name, description }`.
 */
export const parseDocblock = (raw) => {
  const text = stripFences(raw);

  const descriptionLines = [];

  const rawTags = [];

  let current = null;

  for (const line of text.split('\n')) {
    const tagMatch = line.match(/^@([\w-]+)\s*(.*)$/);

    if (tagMatch) {
      if (current) rawTags.push(current);
      current = { body: tagMatch[2], tag: tagMatch[1] };
    } else if (current) {
      current.body += `\n${line}`;
    } else {
      descriptionLines.push(line);
    }
  }

  if (current) rawTags.push(current);

  const tags = rawTags.map(({ body, tag }) => {
    // Name = first whitespace-delimited token (slot/part names, `--var` names,
    // and event names like `update:value` all fit). Optional ` - ` before the
    // description.
    const match = body.trim().match(/^(\S+)\s*(?:-\s*)?([\s\S]*)$/);

    return {
      description: (match?.[2] ?? '').trim(),
      name: match?.[1] ?? '',
      tag,
    };
  });

  return { description: descriptionLines.join('\n').trim(), tags };
};
