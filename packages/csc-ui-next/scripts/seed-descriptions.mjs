/**
 * One-shot seeding script (ADR-0012): imports API descriptions from the old
 * Stencil library's docs.json into the csc-ui-next SFC sources, so the
 * docblock rollout starts from reviewed-able text instead of blank lines.
 *
 * What it seeds (only where the SFC has NO description yet — existing JSDoc
 * always wins):
 *
 *   - prop descriptions      → JSDoc above the defineProps interface member
 *   - exposed methods        → JSDoc above the defineExpose'd declaration
 *   - component description  → top-of-script docblock (old Stencil top docs)
 *   - @slot tags             → for template slots whose (normalized) name has
 *                              docs in the old library ("Default slot" → default)
 *
 * NOT seeded: @csspart (the old library never documented parts), @cssprop
 * (theming moved to global tokens), events (already described via the typed
 * event maps).
 *
 * Every seeded JSDoc block carries an `@seeded from csc-ui — verify` tag.
 * The analyzer ignores unknown tags, so it never reaches the manifest; grep
 * for `@seeded` to find text still awaiting human review, and delete the tag
 * once reviewed. Component semantics HAVE changed in places — treat seeded
 * text as a draft.
 *
 * Usage:
 *   node scripts/seed-descriptions.mjs [--dry-run] [--only <tag>]
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { parse } from 'vue/compiler-sfc';

import { analyzeTemplate } from './analyzer/template.mjs';

const packageRoot = path.resolve(fileURLToPath(import.meta.url), '../..');

const componentsDir = path.join(packageRoot, 'src/components');

const stencilDocsPath = path.resolve(packageRoot, '../csc-ui/docs.json');

const args = process.argv.slice(2);

const dryRun = args.includes('--dry-run');

const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

const SEEDED_TAG = '@seeded from csc-ui — verify';

/** "Default slot" / "default slot" → "default"; other names pass through. */
const normalizeSlotName = (name) =>
  name
    .toLowerCase()
    .replace(/\s+slot$/, '')
    .trim() || 'default';

/** Old docs text → JSDoc-safe lines (escape any comment terminator). */
const docLines = (text) => text.replace(/\*\//g, '*\\/').trim().split('\n');

const jsDocBlock = (text, indent) => {
  const lines = [
    '/**',
    ...docLines(text).map((line) => ` * ${line}`.trimEnd()),
    ' *',
    ` * ${SEEDED_TAG}`,
    ' */',
  ];

  return lines.map((line) => `${indent}${line}`).join('\n');
};

const hasJsDoc = (node) =>
  ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc).length > 0;

/** Indentation of the line `offset` sits on. */
const lineIndent = (content, offset) => {
  const lineStart = content.lastIndexOf('\n', offset - 1) + 1;

  return content.slice(lineStart, offset).match(/^\s*/)[0];
};

const seedComponent = (tagName, old) => {
  const dir = path.join(componentsDir, tagName);

  const sfcName = readdirSync(dir).find((f) => f.endsWith('.vue'));

  if (!sfcName) return null;

  const sfcPath = path.join(dir, sfcName);

  const source = readFileSync(sfcPath, 'utf8');

  const { descriptor, errors } = parse(source, { filename: sfcPath });

  if (errors.length || !descriptor.scriptSetup) return null;

  const script = descriptor.scriptSetup;

  const content = script.content;

  const sf = ts.createSourceFile(
    sfcPath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  // Edits are { start, end, text } ranges in script-content offsets,
  // applied bottom-up so earlier offsets stay valid.
  const edits = [];

  const seeded = { description: 0, methods: 0, props: 0, slots: 0 };

  // ---- locate defineProps / defineExpose / interfaces ------------------------

  const interfaces = new Map();

  let definePropsType = null;

  const exposedNames = [];

  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      interfaces.set(node.name.text, node);
    }

    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      if (node.expression.text === 'defineProps' && node.typeArguments?.[0]) {
        definePropsType = node.typeArguments[0];
      }

      if (
        node.expression.text === 'defineExpose' &&
        node.arguments[0] &&
        ts.isObjectLiteralExpression(node.arguments[0])
      ) {
        for (const prop of node.arguments[0].properties) {
          if (prop.name && ts.isIdentifier(prop.name)) {
            exposedNames.push(prop.name.text);
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sf);

  // ---- props ------------------------------------------------------------------

  const oldProps = new Map(
    (old.props ?? []).filter((p) => p.docs).map((p) => [p.name, p.docs]),
  );

  let propsMembers = [];

  if (definePropsType && ts.isTypeReferenceNode(definePropsType)) {
    const iface = interfaces.get(definePropsType.typeName.getText(sf));

    if (iface) propsMembers = iface.members.filter(ts.isPropertySignature);
  } else if (definePropsType && ts.isTypeLiteralNode(definePropsType)) {
    propsMembers = definePropsType.members.filter(ts.isPropertySignature);
  }

  for (const member of propsMembers) {
    if (hasJsDoc(member)) continue;

    const name = ts.isStringLiteral(member.name)
      ? member.name.text
      : member.name.getText(sf);

    const docs = oldProps.get(name);

    if (!docs) continue;

    const start = member.getStart(sf);

    const indent = lineIndent(content, start);

    edits.push({
      end: start,
      start,
      text: `${jsDocBlock(docs, indent).slice(indent.length)}\n${indent}`,
    });
    seeded.props += 1;
  }

  // ---- exposed methods ----------------------------------------------------------

  const oldMethods = new Map(
    (old.methods ?? []).filter((m) => m.docs).map((m) => [m.name, m.docs]),
  );

  for (const statement of sf.statements) {
    let names = [];

    if (ts.isVariableStatement(statement)) {
      names = statement.declarationList.declarations
        .filter((d) => ts.isIdentifier(d.name))
        .map((d) => d.name.text);
    } else if (ts.isFunctionDeclaration(statement) && statement.name) {
      names = [statement.name.text];
    }

    const exposed = names.find(
      (n) => exposedNames.includes(n) && oldMethods.has(n),
    );

    if (!exposed || hasJsDoc(statement)) continue;

    const start = statement.getStart(sf);

    edits.push({
      end: start,
      start,
      text: `${jsDocBlock(oldMethods.get(exposed), '')}\n`,
    });
    seeded.methods += 1;
  }

  // ---- top docblock: component description + @slot tags -------------------------

  const commentRanges = (ts.getLeadingCommentRanges(content, 0) ?? []).filter(
    (r) =>
      r.kind === ts.SyntaxKind.MultiLineCommentTrivia &&
      content.slice(r.pos, r.pos + 3) === '/**',
  );

  const existingBlock = commentRanges.length
    ? commentRanges[commentRanges.length - 1]
    : null;

  const existingBlockText = existingBlock
    ? content.slice(existingBlock.pos, existingBlock.end)
    : '';

  const taggedSlots = new Set(
    [...existingBlockText.matchAll(/@slot\s+(\S+)/g)].map((m) => m[1]),
  );

  const oldSlots = new Map(
    (old.slots ?? [])
      .filter((s) => s.docs)
      .map((s) => [normalizeSlotName(s.name), s.docs]),
  );

  const templateSlots = analyzeTemplate(descriptor.template?.ast).slots;

  const slotTagLines = templateSlots
    .filter((slot) => !taggedSlots.has(slot) && oldSlots.has(slot))
    .map(
      (slot) => `@slot ${slot} - ${oldSlots.get(slot).replace(/\s+/g, ' ')}`,
    );

  seeded.slots = slotTagLines.length;

  const wantDescription = !existingBlock && old.docs ? old.docs : '';

  if (wantDescription) seeded.description = 1;

  if (existingBlock && slotTagLines.length) {
    // Append the missing tags just above the closing fence.
    edits.push({
      end: existingBlock.end,
      start: existingBlock.pos,
      text: existingBlockText.replace(
        /\n(\s*)\*\//,
        `\n$1*\n${slotTagLines.map((l) => `$1* ${l}`).join('\n')}\n$1* ${SEEDED_TAG}\n$1*/`,
      ),
    });
  } else if (!existingBlock && (wantDescription || slotTagLines.length)) {
    const lines = [
      '/**',
      ...(wantDescription
        ? docLines(wantDescription).map((l) => ` * ${l}`.trimEnd())
        : []),
      ...(wantDescription && slotTagLines.length ? [' *'] : []),
      ...slotTagLines.map((l) => ` * ${l}`),
      ' *',
      ` * ${SEEDED_TAG}`,
      ' */',
    ];

    const insertAt = content.search(/\S/);

    edits.push({
      end: insertAt < 0 ? 0 : insertAt,
      start: insertAt < 0 ? 0 : insertAt,
      text: `${lines.join('\n')}\n`,
    });
  }

  if (!edits.length) return { seeded, sfcPath, touched: false };

  // ---- apply, bottom-up ----------------------------------------------------------

  edits.sort((a, b) => b.start - a.start);

  let nextContent = content;

  for (const edit of edits) {
    nextContent =
      nextContent.slice(0, edit.start) +
      edit.text +
      nextContent.slice(edit.end);
  }

  const scriptStart = script.loc.start.offset;

  const scriptEnd = script.loc.end.offset;

  const nextSource =
    source.slice(0, scriptStart) + nextContent + source.slice(scriptEnd);

  if (!dryRun) writeFileSync(sfcPath, nextSource);

  return { seeded, sfcPath, touched: true };
};

// ---- run ------------------------------------------------------------------------

const stencilDocs = JSON.parse(readFileSync(stencilDocsPath, 'utf8'));

const oldByTag = new Map(stencilDocs.components.map((c) => [c.tag, c]));

const tags = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((tag) => !only || tag === only)
  .sort();

const totals = { description: 0, methods: 0, props: 0, slots: 0 };

const touchedFiles = [];

for (const tag of tags) {
  const old = oldByTag.get(tag);

  if (!old) {
    console.log(`${tag.padEnd(28)} (no counterpart in csc-ui — skipped)`);
    continue;
  }

  const result = seedComponent(tag, old);

  if (!result) continue;

  const { seeded, sfcPath, touched } = result;

  if (touched) {
    touchedFiles.push(sfcPath);
    console.log(
      `${tag.padEnd(28)} props ${seeded.props}  slots ${seeded.slots}  methods ${seeded.methods}${seeded.description ? '  +description' : ''}`,
    );
  }

  for (const key of Object.keys(totals)) totals[key] += seeded[key];
}

console.log(
  `\n${dryRun ? '[dry-run] would seed' : 'seeded'}: ${totals.props} props, ${totals.slots} slots, ${totals.methods} methods, ${totals.description} descriptions across ${touchedFiles.length} files`,
);
console.log('review: rg "@seeded" src/components');
