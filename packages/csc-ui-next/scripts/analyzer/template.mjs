/**
 * Template-AST extraction for the docs analyzer.
 *
 * Walks a compiled SFC template AST and discovers the component's projection
 * and customization surface:
 *   - slots:        every `<slot>` element (default + named)
 *   - parts:        every static `part="…"` attribute (space-separated names)
 *   - exportparts:  nested parts re-exposed under the `<child>-<part>`
 *                   convention (the *exposed* name is public API)
 *
 * Dynamic bindings (`:name` on a slot, `:part`) can't be verified statically;
 * they are collected separately so the lint can warn instead of silently
 * missing part of the contract.
 */

// @vue/compiler-core NodeTypes (stable public numeric enum)
const ELEMENT = 1;

const ATTRIBUTE = 6;

const DIRECTIVE = 7;

/** Depth-first walk over element/if/for containers. */
const walk = (node, visit) => {
  if (!node || typeof node !== 'object') return;

  visit(node);

  for (const key of ['branches', 'children']) {
    const children = node[key];

    if (Array.isArray(children)) {
      for (const child of children) walk(child, visit);
    }
  }
};

const staticAttr = (node, name) =>
  node.props?.find((p) => p.type === ATTRIBUTE && p.name === name);

const boundAttr = (node, name) =>
  node.props?.find(
    (p) =>
      p.type === DIRECTIVE &&
      p.name === 'bind' &&
      p.arg?.content === name &&
      p.arg?.isStatic,
  );

/**
 * @param {object} ast - `descriptor.template.ast` from `vue/compiler-sfc`
 * @returns {{
 *   dynamics: string[],
 *   exportedParts: {exposed: string, inner: string, tag: string}[],
 *   parts: string[],
 *   slots: string[],
 * }}
 */
export const analyzeTemplate = (ast) => {
  const slots = new Set();

  const parts = new Set();

  const exportedParts = [];

  const dynamics = [];

  walk(ast, (node) => {
    if (node.type !== ELEMENT) return;

    if (node.tag === 'slot') {
      const name = staticAttr(node, 'name');

      if (name) {
        slots.add(name.value?.content ?? 'default');
      } else if (boundAttr(node, 'name')) {
        dynamics.push('slot with dynamic :name');
      } else {
        slots.add('default');
      }
    }

    const part = staticAttr(node, 'part');

    if (part?.value?.content) {
      for (const name of part.value.content.split(/\s+/)) parts.add(name);
    }

    if (boundAttr(node, 'part')) {
      dynamics.push(`dynamic :part on <${node.tag}>`);
    }

    const exported = staticAttr(node, 'exportparts');

    if (exported?.value?.content) {
      for (const segment of exported.value.content.split(',')) {
        const [inner, exposed = inner] = segment
          .split(':')
          .map((s) => s.trim());

        if (inner) exportedParts.push({ exposed, inner, tag: node.tag });
      }
    }

    if (boundAttr(node, 'exportparts')) {
      dynamics.push(`dynamic :exportparts on <${node.tag}>`);
    }
  });

  return {
    dynamics,
    exportedParts,
    parts: [...parts],
    slots: [...slots],
  };
};
