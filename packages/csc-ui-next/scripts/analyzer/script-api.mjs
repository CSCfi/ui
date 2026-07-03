/**
 * `<script setup>` analysis for the docs analyzer (ADR-0012), via the
 * TypeScript compiler API. Extracts:
 *
 *   - the component docblock: the `/**` block at the very top of the script
 *     (before the first statement), carrying the description and the
 *     `@slot` / `@csspart` / `@cssprop` tags
 *   - props: the type argument of `defineProps<T>()` (+ `withDefaults`
 *     defaults), with per-member JSDoc descriptions
 *   - methods: `defineExpose({ … })` entries, resolved to their top-level
 *     declarations for JSDoc and signature text
 *   - events: the JSDoc-annotated event-map interface (`<Component>Events`,
 *     ADR-0012's typed emit-helper convention). Components not yet migrated to
 *     the helper simply have no event map — the manifest section stays empty
 *     until they are.
 */

import ts from 'typescript';

import { expandTypeNode } from './type-expansion.mjs';

/** Collapse a multi-line type annotation into one readable line. */
const typeText = (node, sf) =>
  node ? node.getText(sf).replace(/\s+/g, ' ').trim() : '';

/** The `@freeform` member tag (ADR-0015): marks a `string`-typed prop as
 *  intentionally open-ended. Returns the tag's comment (or `true`). */
const freeformTag = (member) => {
  const tag = ts
    .getJSDocTags(member)
    .find((t) => t.tagName.text === 'freeform');

  if (!tag) return undefined;

  const comment =
    typeof tag.comment === 'string'
      ? tag.comment
      : (tag.comment ?? []).map((part) => part.text ?? '').join('');

  return comment.trim() || true;
};

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

const memberName = (member, sf) => {
  const name = member.name;

  if (!name) return '';

  return ts.isStringLiteral(name) ? name.text : name.getText(sf);
};

/** The `/**` block(s) sitting before the first statement of the script. */
const topDocblock = (content) => {
  const ranges = ts.getLeadingCommentRanges(content, 0) ?? [];

  const blocks = ranges.filter(
    (r) =>
      r.kind === ts.SyntaxKind.MultiLineCommentTrivia &&
      content.slice(r.pos, r.pos + 3) === '/**',
  );

  if (!blocks.length) return '';

  const last = blocks[blocks.length - 1];

  return content.slice(last.pos, last.end);
};

const interfaceMembers = (
  decl,
  sf,
  defaults = new Map(),
  aliasTable = new Map(),
) =>
  decl.members.filter(ts.isPropertySignature).map((member) => {
    const { alias, expanded, resolved } = expandTypeNode(
      member.type,
      sf,
      aliasTable,
    );

    return {
      default: defaults.get(memberName(member, sf)),
      description: jsDocDescription(member),
      freeform: freeformTag(member),
      name: memberName(member, sf),
      optional: Boolean(member.questionToken),
      type: typeText(member.type, sf),
      typeAlias: alias ?? undefined,
      typeExpanded: expanded ?? undefined,
      typeResolved: resolved ?? undefined,
    };
  });

/**
 * @param {string} content - the `<script setup>` block's source
 * @param {string} fileName - for diagnostics only
 * @param {string} className - e.g. `CButton`; selects the event-map interface
 * @param {object} [options]
 * @param {string} [options.plainContent] - the plain `<script>` block's source
 *   (exported component-owned types + props interface live there, ADR-0015)
 * @param {Map} [options.aliasTable] - name → declaration for type expansion
 */
export const analyzeScript = (content, fileName, className, options = {}) => {
  const { aliasTable = new Map(), plainContent = '' } = options;

  const sf = ts.createSourceFile(
    fileName,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  // Interfaces may live in either block; each entry remembers its source file
  // so member extraction reads the right text. The plain block is indexed
  // first so a same-named setup declaration would win (it never should).
  const interfaces = new Map();

  if (plainContent) {
    const psf = ts.createSourceFile(
      `${fileName}#plain`,
      plainContent,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    for (const statement of psf.statements) {
      if (ts.isInterfaceDeclaration(statement)) {
        interfaces.set(statement.name.text, { decl: statement, sf: psf });
      }
    }
  }

  let definePropsType = null;

  const defaults = new Map();

  const exposedNames = [];

  const topLevelDecls = new Map();

  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      interfaces.set(node.name.text, { decl: node, sf });
    }

    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const callee = node.expression.text;

      if (callee === 'defineProps' && node.typeArguments?.[0]) {
        definePropsType = node.typeArguments[0];
      }

      if (
        callee === 'withDefaults' &&
        node.arguments[1] &&
        ts.isObjectLiteralExpression(node.arguments[1])
      ) {
        for (const prop of node.arguments[1].properties) {
          if (ts.isPropertyAssignment(prop)) {
            const value = prop.initializer.getText(sf);

            if (value !== 'undefined') {
              defaults.set(memberName(prop, sf), value);
            }
          }
        }
      }

      if (
        callee === 'defineExpose' &&
        node.arguments[0] &&
        ts.isObjectLiteralExpression(node.arguments[0])
      ) {
        for (const prop of node.arguments[0].properties) {
          if (
            ts.isShorthandPropertyAssignment(prop) ||
            ts.isPropertyAssignment(prop) ||
            ts.isMethodDeclaration(prop)
          ) {
            exposedNames.push(memberName(prop, sf));
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sf);

  // Index top-level declarations so defineExpose entries can be resolved back
  // to their JSDoc and signature.
  for (const statement of sf.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          topLevelDecls.set(decl.name.text, { decl, statement });
        }
      }
    }

    if (ts.isFunctionDeclaration(statement) && statement.name) {
      topLevelDecls.set(statement.name.text, { decl: statement, statement });
    }
  }

  // ---- props ---------------------------------------------------------------
  let props = [];

  if (definePropsType) {
    if (ts.isTypeReferenceNode(definePropsType)) {
      const iface = interfaces.get(definePropsType.typeName.getText(sf));

      if (iface) {
        props = interfaceMembers(iface.decl, iface.sf, defaults, aliasTable);
      }
    } else if (ts.isTypeLiteralNode(definePropsType)) {
      // A TypeLiteralNode has the same `.members` shape as an interface body.
      props = interfaceMembers(definePropsType, sf, defaults, aliasTable);
    }
  }

  // ---- methods ---------------------------------------------------------------
  const methods = exposedNames.map((name) => {
    const found = topLevelDecls.get(name);

    let description = '';

    let signature = '';

    if (found) {
      description = jsDocDescription(found.statement);

      const init = ts.isVariableDeclaration(found.decl)
        ? found.decl.initializer
        : found.decl;

      if (init && (ts.isArrowFunction(init) || ts.isFunctionLike(init))) {
        const params = init.parameters
          .map((p) => p.getText(sf).replace(/\s+/g, ' '))
          .join(', ');

        const ret = init.type ? `: ${typeText(init.type, sf)}` : '';

        signature = `(${params})${ret}`;
      }
    }

    return { description, name, signature };
  });

  // ---- events (event map, when present) --------------------------------------
  const eventMapName = `${className}Events`;

  const eventMap =
    interfaces.get(eventMapName) ??
    [...interfaces.entries()].find(([name]) => name.endsWith('Events'))?.[1];

  const events = eventMap
    ? interfaceMembers(eventMap.decl, eventMap.sf).map(
        ({ description, name, type }) => ({
          description,
          detailType: type,
          name,
        }),
      )
    : [];

  return {
    docblock: topDocblock(content),
    events,
    hasEventMap: Boolean(eventMap),
    methods,
    props,
  };
};
