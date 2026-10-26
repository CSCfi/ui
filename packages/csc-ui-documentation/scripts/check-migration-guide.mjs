/**
 * Migration-guide completeness guard (ADR-0027 amendment, plan R2).
 *
 * Diffs the 3.x API (`v3-api.json`, from the 3.0.19 readmes) against the
 * built 4.x Custom Elements Manifest and fails when a 3.x name an upgrade
 * can trip over has no entry in `app/content/migration-api.ts`:
 *
 *   - a tag that is gone or internal;
 *   - a prop whose attribute or property name is gone, whose built-in
 *     default changed, or whose type is not the 3.x type or a widening of it;
 *   - an event, method, slot or CSS custom property that is gone.
 *
 * It also fails an entry that names no 3.x API, and an entry for a name that
 * did not change unless it says `meaningChanged`, so the lookup never tells
 * an upgrader to change something that still works.
 *
 * `migration-guide-baseline.json` lists the names still waiting for an
 * entry. It may only shrink (a listed name that now has an entry, or no
 * longer changed, fails until removed), and it must be empty once the
 * changesets pre tag is no longer `alpha` (rc.1 freezes the guide's
 * coverage with the API, ADR-0028).
 *
 * Usage: node scripts/check-migration-guide.mjs [--write-baseline]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { V3_API_CHANGES } from '../app/content/migration-api.ts';

const resolve = (relative) => fileURLToPath(new URL(relative, import.meta.url));

const manifestPath = resolve('../../csc-ui/dist/custom-elements.json');

const baselinePath = resolve('migration-guide-baseline.json');

const prePath = resolve('../../../.changeset/pre.json');

if (!existsSync(manifestPath)) {
  console.error(
    `custom-elements.json not found at ${manifestPath} — build @cscfi/csc-ui first`,
  );
  process.exit(1);
}

const v3 = JSON.parse(readFileSync(resolve('v3-api.json'), 'utf8')).tags;

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const baseline = new Set(JSON.parse(readFileSync(baselinePath, 'utf8')));

const declarations = new Map(
  manifest.modules
    .flatMap((module) => module.declarations ?? [])
    .filter((declaration) => declaration.tagName)
    .map((declaration) => [declaration.tagName, declaration]),
);

/** Shared type aliases, so `CSelectValue` compares as its union. */
const aliases = new Map(
  (manifest.csc?.types ?? [])
    .filter((type) => type.kind === 'type-alias')
    .map((type) => [
      type.name,
      type.declaration.replace(/^export type \w+\s*=\s*/, '').replace(/;$/, ''),
    ]),
);

/** Split a type at its top-level `separator`s (`|`, `&`, `;`). */
const splitTopLevel = (type, separator) => {
  const parts = [];

  let depth = 0;

  let current = '';

  for (const char of type) {
    if ('{([<'.includes(char)) depth++;

    // The `>` of an arrow (`=>`) closes nothing.
    if ('})]>'.includes(char) && !current.endsWith('=')) depth--;

    if (char === separator && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  return [...parts, current]
    .map((part) => part.replaceAll(/\s+/g, ' ').replaceAll('"', "'").trim())
    .filter(Boolean);
};

const unionMembers = (type) => splitTopLevel(type, '|');

/**
 * An object type's members, sorted, with their types normalized: the 3.x
 * readmes inline some named types (`{ name: string; value: string | number;
 * disabled?: boolean; }` is `CSelectItem`).
 */
const objectShape = (body) =>
  `{ ${splitTopLevel(
    body.replaceAll(/\/\*[\s\S]*?\*\//g, '').replaceAll(/\n/g, ';'),
    ';',
  )
    .map((member) => {
      const [, name, type] = /^([\w$]+\??)\s*:\s*(.*)$/s.exec(member) ?? [];

      return name ? `${name}: ${normalizeType(type)}` : member;
    })
    .sort()
    .join('; ')} }`;

/** Interfaces, so an inline 3.x object type compares as the interface it is. */
const interfaces = new Map(
  (manifest.csc?.types ?? [])
    .filter((type) => type.kind === 'interface')
    .map((type) => [type.name, /\{([\s\S]*)\}/.exec(type.declaration)[1]]),
);

const normalizeType = (type) => {
  const members = unionMembers(type);

  if (members.length > 1) return members.map(normalizeType).sort().join(' | ');

  const [member = ''] = members;

  if (interfaces.has(member)) return objectShape(interfaces.get(member));

  return /^\{(.*)\}$/s.test(member) ? objectShape(member.slice(1, -1)) : member;
};

const expand = (type) =>
  unionMembers(type).flatMap((member) =>
    aliases.has(member) ? expand(aliases.get(member)) : [member],
  );

/**
 * The 4.x type accepts every 3.x member: unchanged or widened. A 3.x
 * intersection (`CSelectItem & { ref?: HTMLElement; }`) is accepted where
 * one of its parts is, since it is a subtype of each.
 */
const accepts = (type4, type3) => {
  const members = new Set(expand(type4).map(normalizeType));

  const accepted = (member) => members.has(normalizeType(member));

  return unionMembers(type3).every(
    (member) => accepted(member) || splitTopLevel(member, '&').some(accepted),
  );
};

/** `undefined`, `null`, `''`, `false` and no default all mean "unset". */
const normalizeDefault = (value) => {
  const normalized = (value ?? '')
    .replace(/^\(\) => \((.*)\)$/s, '$1')
    .replace(/^\(\) => /, '')
    .replaceAll('"', "'")
    .replaceAll(/\s+/g, '')
    .replaceAll(/,([}\]])/g, '$1');

  return ['', "''", 'false', 'null', 'undefined'].includes(normalized)
    ? ''
    : normalized;
};

const keyOf = (tag, kind, name = '') => `${tag} ${kind} ${name}`.trimEnd();

/** key → why it needs an entry */
const changed = new Map();

/** every 3.x key, for checking that entries name real 3.x API */
const known = new Set();

for (const [tag, api] of Object.entries(v3)) {
  known.add(keyOf(tag, 'tag'));

  const declaration = declarations.get(tag);

  const members = [
    ...(api.props ?? []).map((prop) => [
      'prop',
      prop.attribute ?? prop.property,
    ]),
    ...(api.events ?? []).map((event) => ['event', event.name]),
    ...(api.methods ?? []).map((method) => ['method', method]),
    ...(api.slots ?? []).map((slot) => ['slot', slot]),
    ...(api.cssProperties ?? []).map((property) => ['cssProperty', property]),
  ];

  for (const [kind, name] of members) known.add(keyOf(tag, kind, name));

  if (!declaration) {
    const internal = manifest.csc?.internalTags?.includes(tag);

    changed.set(keyOf(tag, 'tag'), internal ? 'is internal' : 'is gone');
    continue;
  }

  const attributes = new Map(
    (declaration.attributes ?? []).map((attribute) => [
      attribute.name,
      attribute,
    ]),
  );

  const fields = new Map(
    (declaration.members ?? [])
      .filter((member) => member.kind === 'field')
      .map((field) => [field.name, field]),
  );

  for (const prop of api.props ?? []) {
    const reasons = [];

    const attribute = prop.attribute && attributes.get(prop.attribute);

    const field = fields.get(prop.property);

    const now = attribute || field;

    if (prop.attribute && !attribute) {
      reasons.push(`attribute \`${prop.attribute}\` is gone`);
    }

    if (!field) reasons.push(`property \`${prop.property}\` is gone`);

    // A required 3.x prop was always set, so a new default changes nothing.
    if (
      now &&
      !prop.required &&
      normalizeDefault(prop.default) !== normalizeDefault(now.default)
    ) {
      reasons.push(`default ${prop.default} → ${now.default ?? '(none)'}`);
    }

    // The readme's type is the property's; an attribute lists only the
    // string and number members of a type that also takes objects.
    const typed = field ?? attribute;

    if (typed && !accepts(typed.type?.text ?? '', prop.type)) {
      reasons.push(`type ${prop.type} → ${typed.type?.text}`);
    }

    if (reasons.length > 0) {
      changed.set(
        keyOf(tag, 'prop', prop.attribute ?? prop.property),
        reasons.join('; '),
      );
    }
  }

  const named = (list, normalize = (name) => name) =>
    new Set((list ?? []).map((item) => normalize(item.name)));

  const events = named(declaration.events);

  const methods = named(
    (declaration.members ?? []).filter((member) => member.kind === 'method'),
  );

  // The 4.x manifest names the default slot `default`.
  const slots = named(declaration.slots, (name) =>
    name === 'default' ? '' : name,
  );

  const cssProperties = named(declaration.cssProperties);

  for (const event of api.events ?? []) {
    if (!events.has(event.name))
      changed.set(keyOf(tag, 'event', event.name), 'is gone');
  }

  for (const method of api.methods ?? []) {
    if (!methods.has(method))
      changed.set(keyOf(tag, 'method', method), 'is gone');
  }

  for (const slot of api.slots ?? []) {
    if (!slots.has(slot)) changed.set(keyOf(tag, 'slot', slot), 'is gone');
  }

  for (const property of api.cssProperties ?? []) {
    if (!cssProperties.has(property)) {
      changed.set(keyOf(tag, 'cssProperty', property), 'is gone');
    }
  }
}

const errors = [];

/** The entry covering a 3.x key, wildcards included. */
const entryFor = (key) => {
  const [tag, kind, name = ''] = key.split(' ');

  return V3_API_CHANGES.find(
    (entry) =>
      (entry.tag === tag || entry.tag === '*') &&
      entry.kind === kind &&
      (kind === 'tag' || entry.name === name || entry.name === '*'),
  );
};

for (const entry of V3_API_CHANGES) {
  const wildcard = entry.tag === '*' || entry.name === '*';

  const key = keyOf(entry.tag, entry.kind, entry.name);

  const label = `migration-api.ts entry "${key}"`;

  if (wildcard) {
    const covers = [...known].some(
      (candidate) => entryFor(candidate) === entry,
    );

    if (!covers) errors.push(`${label} matches no 3.x API.`);
    continue;
  }

  if (!known.has(key)) {
    errors.push(`${label} names no 3.x API (see scripts/v3-api.json).`);
  } else if (entry.meaningChanged && changed.has(key)) {
    errors.push(
      `${label} says meaningChanged, but the name changed too (${changed.get(key)}): drop meaningChanged.`,
    );
  } else if (!entry.meaningChanged && !changed.has(key)) {
    errors.push(
      `${label} names something that did not change: delete it, or set meaningChanged if its behaviour did.`,
    );
  }
}

const missing = [...changed.keys()].filter((key) => !entryFor(key));

if (process.argv.includes('--write-baseline')) {
  writeFileSync(baselinePath, `${JSON.stringify(missing.sort(), null, 2)}\n`);
  console.log(`Wrote ${missing.length} names to ${baselinePath}`);
  process.exit(0);
}

for (const key of missing) {
  if (!baseline.has(key)) {
    errors.push(
      `3.x ${key} ${changed.get(key)}, but the migration guide has no entry for it (app/content/migration-api.ts).`,
    );
  }
}

for (const key of baseline) {
  if (!changed.has(key)) {
    errors.push(
      `Baseline name "${key}" did not change: remove it from the baseline.`,
    );
  } else if (entryFor(key)) {
    errors.push(
      `Baseline name "${key}" has an entry now: remove it from the baseline.`,
    );
  }
}

const pre = existsSync(prePath)
  ? JSON.parse(readFileSync(prePath, 'utf8'))
  : null;

const alpha = pre?.mode === 'pre' && pre.tag === 'alpha';

if (!alpha && baseline.size > 0) {
  errors.push(
    `The changesets pre tag is no longer alpha, so every changed 3.x name needs its entry: ${baseline.size} remain in the baseline.`,
  );
}

// exitCode, not exit(): exit() can cut off a long report written to a pipe.
if (errors.length > 0) {
  console.error(`Migration guide check failed:\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(
    `Migration guide covers ${changed.size - baseline.size} of ${changed.size} changed 3.x names (${baseline.size} in the baseline).`,
  );
}
