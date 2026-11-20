/**
 * Element binding guard.
 *
 * Every attribute or property a docs template binds on a `c-*` element must
 * be one the built Custom Elements Manifest declares (or a global HTML
 * attribute). A custom element takes any attribute without complaint, so a
 * name a release removed or renamed binds nothing and fails silently: after
 * 4.0.0 the site's toolbar menus still bound 3.x's `active` on
 * `c-menu-item` and showed no checked choice.
 *
 * Checked: every `.vue` file under `app/` (site and canon examples) and the
 * ```vue snippets in each component's usage.md. Templates are parsed with
 * Vue's compiler; event listeners, `v-model` and object or dynamic `v-bind`
 * are not names to check.
 *
 * Usage: node scripts/check-element-bindings.mjs
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'vue/compiler-sfc';

const resolve = (relative) => fileURLToPath(new URL(relative, import.meta.url));

const appDir = resolve('../app');

const componentsDir = resolve('../../csc-ui/src/components');

const manifestPath = resolve('../../csc-ui/dist/custom-elements.json');

if (!existsSync(manifestPath)) {
  console.error(
    `custom-elements.json not found at ${manifestPath} — build @cscfi/csc-ui first`,
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** tag → every attribute name and property name it declares. */
const declared = new Map(
  manifest.modules
    .flatMap((module) => module.declarations ?? [])
    .filter((declaration) => declaration.tagName)
    .map((declaration) => [
      declaration.tagName,
      new Set([
        ...(declaration.attributes ?? []).map((a) => a.name),
        ...(declaration.members ?? [])
          .filter((m) => m.kind === 'field' && m.privacy !== 'private')
          .flatMap((m) => [m.name, kebab(m.name)]),
      ]),
    ]),
);

/** HTML global attributes and the ones Vue itself consumes. */
const GLOBAL = new Set([
  'accesskey',
  'autofocus',
  'class',
  'contenteditable',
  'dir',
  'draggable',
  'enterkeyhint',
  'exportparts',
  'hidden',
  'id',
  'inert',
  'inputmode',
  'is',
  'key',
  'lang',
  'nonce',
  'part',
  'popover',
  'ref',
  'role',
  'slot',
  'spellcheck',
  'style',
  'tabindex',
  'title',
  'translate',
]);

const isGlobal = (name) =>
  GLOBAL.has(name) || name.startsWith('aria-') || name.startsWith('data-');

const ELEMENT = 1;

const ATTRIBUTE = 6;

const DIRECTIVE = 7;

/** The bound names of one element: static attributes and static `v-bind` args. */
const boundNames = (element) =>
  element.props.flatMap((prop) => {
    if (prop.type === ATTRIBUTE) return [prop.name];

    if (prop.type === DIRECTIVE && prop.name === 'bind' && prop.arg?.isStatic) {
      return [prop.arg.content];
    }

    return [];
  });

/**
 * Problems in one template AST; `lineOffset` maps a snippet's lines back to
 * its file.
 */
const check = (root, where, lineOffset = 0) => {
  const problems = [];

  const visit = (node) => {
    if (node.type === ELEMENT && node.tag.startsWith('c-')) {
      const line = node.loc.start.line + lineOffset;

      const names = declared.get(node.tag);

      if (!names) {
        problems.push(`${where}:${line}: <${node.tag}> is not in the manifest`);
      } else {
        for (const name of boundNames(node)) {
          if (isGlobal(name) || names.has(name) || names.has(kebab(name))) {
            continue;
          }

          problems.push(
            `${where}:${line}: <${node.tag}> binds "${name}", which it does not declare`,
          );
        }
      }
    }

    for (const child of node.children ?? []) visit(child);
  };

  visit(root);

  return problems;
};

const templateOf = (source, where) => {
  const { descriptor, errors } = parse(source, { filename: where });

  if (errors.length) {
    throw new Error(`${where}: ${errors[0].message ?? errors[0]}`);
  }

  return descriptor.template?.ast;
};

const vueFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) return vueFiles(full);

    return entry.name.endsWith('.vue') ? [full] : [];
  });

const problems = [];

for (const file of vueFiles(appDir)) {
  const where = path.relative(resolve('..'), file);

  const ast = templateOf(readFileSync(file, 'utf8'), where);

  if (ast) problems.push(...check(ast, where));
}

for (const dir of readdirSync(componentsDir, { withFileTypes: true })) {
  const usagePath = path.join(componentsDir, dir.name, 'usage.md');

  if (!dir.isDirectory() || !existsSync(usagePath)) continue;

  const usage = readFileSync(usagePath, 'utf8');

  const where = `${dir.name}/usage.md`;

  for (const match of usage.matchAll(/```vue\n([\s\S]*?)```/g)) {
    const snippet = match[1];

    // A snippet is either a whole SFC or bare template markup.
    const sfc = /^\s*<(template|script)[\s>]/m.test(snippet);

    const ast = templateOf(
      sfc ? snippet : `<template>\n${snippet}</template>`,
      where,
    );

    // The fence line, plus the wrapper line a bare snippet gained.
    const offset =
      usage.slice(0, match.index).split('\n').length - (sfc ? 0 : 1);

    if (ast) problems.push(...check(ast, where, offset));
  }
}

if (problems.length) {
  console.error(`element bindings: ${problems.length} problem(s)\n`);

  for (const problem of problems) console.error(`  ${problem}`);

  process.exit(1);
}

console.log(
  'element bindings: every c-* binding is declared in the manifest or global',
);
