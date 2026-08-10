/**
 * Public type extraction for the manifest's `csc.types` vendor extension
 * (CEM has no first-class type-alias kind; component-owned types live in
 * each SFC's plain `<script>` block, shared types in `src/types.ts`). The
 * docs site renders these as the Types page and
 * cross-links them from prop/event type text. Component-owned entries carry
 * an `owner` tag name; shared entries have none.
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

export const extractExportedTypes = (content, fileName, owner = null) => {
  const sf = ts.createSourceFile(
    fileName,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const types = [];

  for (const statement of sf.statements) {
    if (!isExported(statement)) continue;

    if (
      ts.isTypeAliasDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement)
    ) {
      types.push({
        declaration: statement.getText(sf),
        description: jsDocDescription(statement),
        kind: ts.isTypeAliasDeclaration(statement) ? 'type-alias' : 'interface',
        name: statement.name.text,
        ...(owner ? { owner } : {}),
      });
    }
  }

  return types;
};

export const extractSharedTypes = (filePath) =>
  extractExportedTypes(readFileSync(filePath, 'utf8'), filePath);
