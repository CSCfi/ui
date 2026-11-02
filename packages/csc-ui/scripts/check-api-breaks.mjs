/**
 * API break guard (ADR-0074, plan D10). Diffs every tag's `api.snapshot.json`
 * and the entry snapshot (runtime exports and exported type shapes) against
 * the base branch, and classifies each change:
 *
 *   - breaking: a tag, attribute, property, event, method, slot, part, CSS
 *     state or custom property, defaultable prop, subcomponent, runtime
 *     export, type or type field removed or renamed; a type changed other
 *     than by widening a union; a built-in default changed; an optional type
 *     field made required, or a required one added;
 *   - added: anything new.
 *
 * A breaking diff needs a new `major` changeset in the branch; while the
 * changesets pre tag is anything but `alpha` (the release candidates) it
 * fails outright. Outside pre mode, an addition needs at least a `minor` one.
 * The snapshots themselves are kept in step with the source by
 * `src/api-snapshot.node.spec.ts`.
 *
 * Usage: node scripts/check-api-breaks.mjs [--base <ref>]   (default: origin/main)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const baseFlag = process.argv.indexOf('--base');

const baseRef = baseFlag === -1 ? 'origin/main' : process.argv[baseFlag + 1];

const root = fileURLToPath(new URL('../../../', import.meta.url));

const componentsDir = 'packages/csc-ui/src/components';

const entryPath = 'packages/csc-ui/src/api.entry.snapshot.json';

const git = (...args) =>
  execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    maxBuffer: 1e8,
  });

// Compare from where the branch left the base, as a pull request's diff does.
const base = git('merge-base', baseRef, 'HEAD').trim();

const readBase = (path) => {
  try {
    return JSON.parse(git('show', `${base}:${path}`));
  } catch {
    return null;
  }
};

const readHead = (path) =>
  existsSync(`${root}${path}`)
    ? JSON.parse(readFileSync(`${root}${path}`, 'utf8'))
    : null;

/** Index of `token` outside brackets (the `>` of `=>` closes nothing). */
const topLevelIndex = (text, token) => {
  let depth = 0;

  for (let index = 0; index < text.length; index++) {
    const char = text[index];

    if ('{([<'.includes(char)) depth++;

    if ('})]'.includes(char) || (char === '>' && text[index - 1] !== '=')) {
      depth--;
    }

    if (depth === 0 && text.startsWith(token, index)) return index;
  }

  return -1;
};

const unionMembers = (type) => {
  const members = [];

  let rest = type;

  for (let index = topLevelIndex(rest, '|'); index !== -1;) {
    members.push(rest.slice(0, index).trim());
    rest = rest.slice(index + 1);
    index = topLevelIndex(rest, '|');
  }

  return [...members, rest.trim()].filter(Boolean);
};

/** `next` accepts everything `previous` did: unchanged, or a widened union. */
const widens = (previous, next) => {
  const members = new Set(unionMembers(next));

  return unionMembers(previous).every((member) => members.has(member));
};

/** Split a snapshot's `type = default`; a bare boolean defaults to false. */
const typed = (text) => {
  const index = topLevelIndex(text, ' = ');

  const type = index === -1 ? text : text.slice(0, index);

  const fallback = type === 'boolean' ? 'false' : undefined;

  return {
    default: index === -1 ? fallback : text.slice(index + 3),
    type,
  };
};

const breaking = [];

const added = [];

const compareTyped = (label, previous = {}, next = {}, withDefaults = true) => {
  for (const [name, text] of Object.entries(previous)) {
    if (!(name in next)) {
      breaking.push(`${label} \`${name}\` removed`);
      continue;
    }

    const was = withDefaults ? typed(text) : { type: text };

    const now = withDefaults ? typed(next[name]) : { type: next[name] };

    if (!widens(was.type, now.type)) {
      breaking.push(`${label} \`${name}\` type ${was.type} → ${now.type}`);
    }

    if (was.default !== now.default) {
      breaking.push(
        `${label} \`${name}\` default ${was.default ?? '(none)'} → ${now.default ?? '(none)'}`,
      );
    }
  }

  for (const name of Object.keys(next)) {
    if (!(name in previous)) added.push(`${label} \`${name}\``);
  }
};

const compareNames = (label, previous = [], next = []) => {
  for (const name of previous) {
    if (!next.includes(name)) breaking.push(`${label} \`${name}\` removed`);
  }

  for (const name of next) {
    if (!previous.includes(name)) added.push(`${label} \`${name}\``);
  }
};

/** Interface fields keyed without their `?`. */
const fields = (shape) =>
  new Map(
    Object.entries(shape).map(([key, type]) => [
      key.replace(/\?$/, ''),
      { optional: key.endsWith('?'), type },
    ]),
  );

const compareType = (name, previous, next) => {
  const label = `type ${name}`;

  if (typeof previous === 'string' && typeof next === 'string') {
    if (!widens(previous, next)) {
      breaking.push(`${label}: ${previous} → ${next}`);
    } else if (previous !== next) {
      added.push(`${label}: ${previous} → ${next}`);
    }

    return;
  }

  if (typeof previous !== typeof next) {
    breaking.push(`${label} changed shape`);

    return;
  }

  const was = fields(previous);

  const now = fields(next);

  for (const [field, { optional, type }] of was) {
    const current = now.get(field);

    if (!current) {
      breaking.push(`${label} field \`${field}\` removed`);
    } else if (!widens(type, current.type)) {
      breaking.push(`${label} field \`${field}\`: ${type} → ${current.type}`);
    } else if (optional && !current.optional) {
      breaking.push(`${label} field \`${field}\` made required`);
    }
  }

  for (const [field, { optional }] of now) {
    if (was.has(field)) continue;

    if (optional) added.push(`${label} field \`${field}?\``);
    else breaking.push(`${label} required field \`${field}\` added`);
  }
};

const snapshotTags = (list) =>
  list
    .filter((path) => path.endsWith('/api.snapshot.json'))
    .map((path) => path.split('/').at(-2));

const baseTags = snapshotTags(
  git('ls-tree', '-r', '--full-tree', '--name-only', base, '--', componentsDir)
    .split('\n')
    .filter(Boolean),
);

const headTags = readdirSync(`${root}${componentsDir}`).filter((tag) =>
  existsSync(`${root}${componentsDir}/${tag}/api.snapshot.json`),
);

for (const tag of new Set([...baseTags, ...headTags])) {
  const path = `${componentsDir}/${tag}/api.snapshot.json`;

  const previous = baseTags.includes(tag) ? readBase(path) : null;

  const next = headTags.includes(tag) ? readHead(path) : null;

  if (!next) {
    breaking.push(`<${tag}> removed`);
    continue;
  }

  if (!previous) {
    added.push(`<${tag}>`);
    continue;
  }

  compareTyped(`<${tag}> attribute`, previous.attributes, next.attributes);
  compareTyped(`<${tag}> property`, previous.props, next.props);
  compareTyped(`<${tag}> event`, previous.events, next.events, false);
  compareTyped(
    `<${tag}> read-only property`,
    previous.readonly,
    next.readonly,
    false,
  );

  for (const [name, signature] of Object.entries(previous.methods ?? {})) {
    if (!(name in (next.methods ?? {}))) {
      breaking.push(`<${tag}> method \`${name}\` removed`);
    } else if (next.methods[name] !== signature) {
      breaking.push(
        `<${tag}> method \`${name}\` ${signature} → ${next.methods[name]}`,
      );
    }
  }

  for (const name of Object.keys(next.methods ?? {})) {
    if (!(name in (previous.methods ?? {}))) {
      added.push(`<${tag}> method \`${name}\``);
    }
  }

  compareNames(`<${tag}> slot`, previous.slots, next.slots);
  compareNames(`<${tag}> part`, previous.parts, next.parts);
  compareNames(`<${tag}> CSS state`, previous.states, next.states);
  compareNames(
    `<${tag}> CSS custom property`,
    previous.cssProperties,
    next.cssProperties,
  );
  compareNames(
    `<${tag}> defaultable prop`,
    previous.defaultable,
    next.defaultable,
  );
  compareNames(
    `<${tag}> subcomponent`,
    previous.subcomponents,
    next.subcomponents,
  );
}

const previousEntry = readBase(entryPath) ?? {};

const nextEntry = readHead(entryPath) ?? {};

compareNames(
  'runtime export',
  previousEntry.runtimeExports,
  nextEntry.runtimeExports,
);

// Before the entry snapshot recorded shapes, it listed type names only.
const previousTypes = Array.isArray(previousEntry.types)
  ? Object.fromEntries(previousEntry.types.map((name) => [name, null]))
  : (previousEntry.types ?? {});

const nextTypes = nextEntry.types ?? {};

for (const [name, shape] of Object.entries(previousTypes)) {
  if (!(name in nextTypes)) breaking.push(`type ${name} removed`);
  else if (shape !== null) compareType(name, shape, nextTypes[name]);
}

for (const name of Object.keys(nextTypes)) {
  if (!(name in previousTypes)) added.push(`type ${name}`);
}

const BUMPS = ['patch', 'minor', 'major'];

// The highest bump any changeset new to the branch gives either package
// (one fixed group, ADR-0028); untracked files count for a local run.
const newChangesets = [
  ...git('diff', '--name-only', '--diff-filter=A', base, '--', '.changeset')
    .split('\n')
    .filter(Boolean),
  ...git('ls-files', '--others', '--exclude-standard', '--', '.changeset')
    .split('\n')
    .filter(Boolean),
].filter((path) => path.endsWith('.md') && !path.endsWith('README.md'));

const bump = newChangesets
  .flatMap((path) => {
    const frontmatter =
      readFileSync(`${root}${path}`, 'utf8').match(
        /^---\n([\s\S]*?)\n---/,
      )?.[1] ?? '';

    return [
      ...frontmatter.matchAll(
        /^['"]?@cscfi\/csc-ui(?:-react)?['"]?\s*:\s*(patch|minor|major)\s*$/gm,
      ),
    ].map(([, level]) => BUMPS.indexOf(level));
  })
  .reduce((highest, level) => Math.max(highest, level), -1);

const prePath = `${root}.changeset/pre.json`;

const pre = existsSync(prePath)
  ? JSON.parse(readFileSync(prePath, 'utf8'))
  : null;

const inPre = pre?.mode === 'pre';

const list = (items) => items.map((item) => `\n  - ${item}`).join('');

if (added.length > 0) console.log(`API additions:${list(added)}`);

if (breaking.length > 0) console.log(`Breaking API changes:${list(breaking)}`);

const failure =
  breaking.length > 0 && inPre && pre.tag !== 'alpha'
    ? `The API is frozen while the changesets pre tag is "${pre.tag}" (ADR-0074): revert the breaking changes above.`
    : breaking.length > 0 && bump < BUMPS.indexOf('major')
      ? 'Breaking API changes need a new major changeset (pnpm changeset) in this branch (ADR-0074).'
      : added.length > 0 && !inPre && bump < BUMPS.indexOf('minor')
        ? 'API additions need at least a new minor changeset in this branch (ADR-0074).'
        : null;

if (failure) {
  console.error(failure);
  process.exitCode = 1;
} else {
  console.log(
    `API check passed against ${baseRef} (${base.slice(0, 8)}): ${breaking.length} breaking, ${added.length} added.`,
  );
}
