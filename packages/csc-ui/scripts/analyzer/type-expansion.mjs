/**
 * Type-alias resolution for the manifest.
 *
 * The manifest's standard `type.text` field carries the transitively expanded
 * literal union (third-party IDE-data generators parse it for attribute value
 * sets); the alias name rides in the `csc.typeAlias` vendor extension for the
 * docs site's Types-page cross-links. Only literal unions expand — interfaces,
 * functions and object shapes keep their names (they are property-only and
 * never become attributes), but their *resolved* declaration text still feeds
 * the attribute-compatibility test so e.g. a function-typed alias is not
 * mistaken for an attribute.
 */

import ts from 'typescript';

/**
 * Index every top-level type alias / interface of the given sources by name.
 * Later sources win on name collisions (they should not collide in practice).
 *
 * @param {Array<{content: string, fileName: string}>} sources
 * @returns {Map<string, {node: import('typescript').Node, sf: import('typescript').SourceFile}>}
 */
export const buildAliasTable = (sources) => {
  const table = new Map();

  for (const { content, fileName } of sources) {
    if (!content) continue;

    const sf = ts.createSourceFile(
      fileName,
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    for (const statement of sf.statements) {
      if (
        ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement)
      ) {
        table.set(statement.name.text, { node: statement, sf });
      }
    }
  }

  return table;
};

/** Flatten a type node into its literal-union members, or null if it has any
 *  non-literal constituent (after resolving type references via the table). */
const literalMembers = (node, sf, table, seen) => {
  if (ts.isParenthesizedTypeNode(node)) {
    return literalMembers(node.type, sf, table, seen);
  }

  if (ts.isUnionTypeNode(node)) {
    const members = [];

    for (const part of node.types) {
      const resolved = literalMembers(part, sf, table, seen);

      if (!resolved) return null;

      members.push(...resolved);
    }

    return members;
  }

  if (ts.isLiteralTypeNode(node)) {
    const literal = node.literal;

    if (
      ts.isStringLiteral(literal) ||
      ts.isNumericLiteral(literal) ||
      literal.kind === ts.SyntaxKind.TrueKeyword ||
      literal.kind === ts.SyntaxKind.FalseKeyword
    ) {
      return [node.getText(sf)];
    }

    return null;
  }

  if (ts.isTypeReferenceNode(node) && !node.typeArguments) {
    const name = node.typeName.getText(sf);

    if (seen.has(name)) return null;

    const entry = table.get(name);

    if (!entry || !ts.isTypeAliasDeclaration(entry.node)) return null;

    return literalMembers(
      entry.node.type,
      entry.sf,
      table,
      new Set([...seen, name]),
    );
  }

  return null;
};

/** Resolve a single type reference to its declaration's text (transitively for
 *  alias-of-alias), for the attribute-compatibility test. */
const resolvedText = (node, sf, table, seen = new Set()) => {
  if (!ts.isTypeReferenceNode(node) || node.typeArguments) return null;

  const name = node.typeName.getText(sf);

  if (seen.has(name)) return null;

  const entry = table.get(name);

  if (!entry) return null;

  if (ts.isInterfaceDeclaration(entry.node)) {
    // Object shape — anything with a `{` is property-only downstream.
    return '{...}';
  }

  const target = entry.node.type;

  return (
    resolvedText(target, entry.sf, table, new Set([...seen, name])) ??
    target.getText(entry.sf).replace(/\s+/g, ' ').trim()
  );
};

/**
 * Analyze a prop's type node against the alias table.
 *
 * @returns {{expanded: string|null, alias: string|null, resolved: string|null}}
 *   - expanded: the full literal-union text (`'a' | 'b'`), when every
 *     constituent resolves to a literal
 *   - alias: the alias name, when the entire type is one expandable reference
 *   - resolved: the referenced declaration's text, for attribute-compatibility
 */
export const expandTypeNode = (node, sf, table) => {
  if (!node) return { alias: null, expanded: null, resolved: null };

  const members = literalMembers(node, sf, table, new Set());

  const expanded = members ? [...new Set(members)].join(' | ') : null;

  const alias =
    expanded && ts.isTypeReferenceNode(node) ? node.typeName.getText(sf) : null;

  return {
    alias,
    expanded,
    resolved: resolvedText(node, sf, table),
  };
};
