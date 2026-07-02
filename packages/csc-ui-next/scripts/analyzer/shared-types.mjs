/**
 * Shared public types (`src/types.ts`) for the manifest's `csc.types`
 * vendor extension (ADR-0012 — CEM has no first-class type-alias kind).
 * The docs site renders these as the Types page and cross-links them from
 * prop/event type text.
 */

import { readFileSync } from 'node:fs';
import ts from 'typescript';

const jsDocDescription = (node) => {
  const docs = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc);

  if (!docs.length) return '';

  const comment = docs[docs.length - 1].comment;

  if (!comment) return '';

  return typeof comment === 'string'
    ? comment.trim()
    : comment
        .map((part) => part.text ?? '')
        .join('')
        .trim();
};

const isExported = (node) =>
  node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

export const extractSharedTypes = (filePath) => {
  const content = readFileSync(filePath, 'utf8');

  const sf = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const types = [];

  for (const statement of sf.statements) {
    if (!isExported(statement)) continue;

    if (ts.isTypeAliasDeclaration(statement)) {
      types.push({
        declaration: statement.getText(sf),
        description: jsDocDescription(statement),
        kind: 'type-alias',
        name: statement.name.text,
      });
    }

    if (ts.isInterfaceDeclaration(statement)) {
      types.push({
        declaration: statement.getText(sf),
        description: jsDocDescription(statement),
        kind: 'interface',
        name: statement.name.text,
      });
    }
  }

  return types;
};
