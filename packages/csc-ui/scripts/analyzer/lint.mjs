/**
 * Docs-contract lint.
 *
 * Hard errors (the template and the docblock must agree 1:1 — parts are the
 * customization API, so an undocumented or phantom name is an API
 * defect):
 *   - template slot without an `@slot` tag / `@slot` naming no template slot
 *   - part (own, stamped by an imported `src/shared/*.vue` SFC, or
 *     exportparts-exposed) without an `@csspart` tag / `@csspart` naming no
 *     part
 *   - a `setState('<name>')` custom state without a `@cssstate` tag /
 *     `@cssstate` naming a state the script never sets
 *   - a raw `new CustomEvent(` / `new Event(` in the SFC — events must go
 *     through `useHostEmit` (or `emitModelValue`) so the event map stays the
 *     single source of truth
 *   - an `emitModelValue` caller whose event map is missing the
 *     `changeValue` / `update:value` / `input` triple that helper dispatches
 *   - an `@subcomponents` tag naming an unknown tag, or the component itself
 *     (the composed-children list must resolve to real components)
 *   - a prop typed bare `string` without an `@freeform` tag
 *     (set-of-accepted-values props must be named exported unions; genuinely
 *     open-ended props declare it explicitly), or an `@freeform` tag on a
 *     prop that is not a bare `string`
 *   - `@defaultable` (app-wide defaults via `applyDefaults()`) out of step
 *     with the script: a tag without its built-in literal, a literal whose
 *     shape disagrees with the prop type, a withDefaults entry that is not
 *     `undefined` (an absent Boolean default resolves to `false`, so the app
 *     default could never apply), a missing/mismatched
 *     `appDefault('<name>', <built-in>)` call, a `useAppDefault('<tag>')`
 *     whose tag is not this component's (or missing / present without any
 *     tagged prop), a resolver call for an untagged prop, or a leftover direct
 *     read — `props.<name>` in the script, or a shorthand `:<kebab>` /
 *     `="<name>"` binding in the template — that bypasses the resolved value
 *     (a shorthand `:size` would hand `undefined` to c-input, whose own
 *     default then silently wins)
 *
 * Warnings (best-effort surface):
 *   - `@cssprop` naming a custom property never referenced in the SFC source
 *     (usages hide inside Tailwind arbitrary-value strings, so only the
 *     tag→usage direction is checked; the global `--c-*` theme tokens are NOT
 *     per-component API and are never required to be tagged)
 *   - dynamic slot-name / part bindings the analyzer cannot verify
 *   - missing `usage.md`
 *   - free text in the component docblock (the component description lives
 *     in usage.md's first paragraph; the docblock carries tags only)
 */

export const lintComponent = (component, knownTags = new Set()) => {
  const errors = [];

  const warnings = [];

  const { docTags, source, subcomponents, tagName, template, usagePath } =
    component;

  const tagged = (tag) =>
    docTags.filter((t) => t.tag === tag).map((t) => t.name);

  const taggedSlots = tagged('slot');

  const taggedParts = tagged('csspart');

  const taggedCssProps = tagged('cssprop');

  const actualSlots = template.slots;

  const actualParts = [
    ...template.parts,
    ...template.exportedParts.map((p) => p.exposed),
  ];

  for (const slot of actualSlots) {
    if (!taggedSlots.includes(slot)) {
      errors.push(`slot "${slot}" has no @slot tag`);
    }
  }

  for (const slot of taggedSlots) {
    if (!actualSlots.includes(slot)) {
      errors.push(`@slot "${slot}" does not exist in the template`);
    }
  }

  for (const part of actualParts) {
    if (!taggedParts.includes(part)) {
      errors.push(`part "${part}" has no @csspart tag`);
    }
  }

  for (const part of taggedParts) {
    if (!actualParts.includes(part)) {
      errors.push(`@csspart "${part}" does not exist in the template`);
    }
  }

  const scriptSource = component.script ?? '';

  // Custom states are customization API like parts: every `setState('<name>')`
  // call must be documented with a `@cssstate` tag and vice versa. States are
  // set from script (useHostStates), not stamped in the template, so the
  // symmetry check reads the script's literal state names.
  const taggedStates = tagged('cssstate');

  const actualStates = [
    ...new Set(
      [...scriptSource.matchAll(/setState\(\s*'([^']+)'/g)].map((m) => m[1]),
    ),
  ];

  for (const state of actualStates) {
    if (!taggedStates.includes(state)) {
      errors.push(`custom state "${state}" has no @cssstate tag`);
    }
  }

  for (const state of taggedStates) {
    if (!actualStates.includes(state)) {
      errors.push(`@cssstate "${state}" is never set in the script`);
    }
  }

  const rawDispatches =
    scriptSource.match(/new (?:Custom)?Event\(/g)?.length ?? 0;

  if (rawDispatches) {
    errors.push(
      `${rawDispatches} raw new CustomEvent/Event dispatch(es) — use useHostEmit (event map) or emitModelValue`,
    );
  }

  if (scriptSource.includes('emitModelValue(')) {
    const eventNames = component.events.map((e) => e.name);

    for (const name of ['changeValue', 'update:value', 'input']) {
      if (!eventNames.includes(name)) {
        errors.push(
          `emitModelValue is used but "${name}" is missing from the event map`,
        );
      }
    }
  }

  // New-style components use emitModelChange, which
  // dispatches the all-lowercase `change` instead of the grandfathered
  // `changeValue`.
  if (scriptSource.includes('emitModelChange(')) {
    const eventNames = component.events.map((e) => e.name);

    for (const name of ['change', 'update:value', 'input']) {
      if (!eventNames.includes(name)) {
        errors.push(
          `emitModelChange is used but "${name}" is missing from the event map`,
        );
      }
    }
  }

  for (const prop of component.props) {
    if (prop.type === 'string' && !prop.freeform) {
      errors.push(
        `prop "${prop.name}" is a bare string — give it a union type or tag it @freeform`,
      );
    }

    if (prop.freeform && prop.type !== 'string') {
      errors.push(
        `prop "${prop.name}" is tagged @freeform but is not a bare string`,
      );
    }
  }

  lintDefaultable(component, errors);

  for (const child of subcomponents ?? []) {
    if (child === tagName) {
      errors.push(`@subcomponents lists the component itself ("${child}")`);
    } else if (!knownTags.has(child)) {
      errors.push(`@subcomponents "${child}" is not a known component`);
    }
  }

  for (const prop of taggedCssProps) {
    if (!source.includes(`var(${prop}`)) {
      warnings.push(`@cssprop "${prop}" is never referenced in the component`);
    }
  }

  for (const dynamic of template.dynamics) {
    warnings.push(`unverifiable ${dynamic}`);
  }

  if (!usagePath) {
    warnings.push('no usage.md');
  }

  // The component description lives in usage.md (its first paragraph); the
  // docblock carries tags only. Free text there is dead — it feeds nothing.
  if (component.docblockProse) {
    warnings.push(
      'docblock free text is ignored — describe the component in usage.md',
    );
  }

  return { errors, warnings };
};

const hyphenate = (key) =>
  key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** The shape of a `@defaultable` literal, for the type-agreement check. */
const literalShape = (text) => {
  if (text === 'true' || text === 'false') return 'boolean';

  if (/^-?\d/.test(text)) return 'number';

  if (/^['"`]/.test(text)) return 'string';

  if (text.startsWith('{')) return 'object';

  return 'unknown';
};

/** Whether a prop type text accepts a literal of the given shape. */
const typeAccepts = (type, shape) => {
  const text = type.replace(/\s+/g, '');

  if (shape === 'boolean') return text === 'boolean';

  if (shape === 'number') return text === 'number';

  if (shape === 'string') return text === 'string' || /['"`]/.test(text);

  if (shape === 'object') {
    return !['boolean', 'number', 'string'].includes(text) && !/['"`]/.test(text);
  }

  return false;
};

const normalizeLiteral = (text) => text.trim().replace(/"/g, "'");

/**
 * App-wide defaults contract: a `@defaultable <built-in>` prop must be
 * resolved through `useAppDefault` / `appDefault` (src/shared/appDefaults.ts)
 * and nowhere else. See the header for the individual rules.
 */
const lintDefaultable = (component, errors) => {
  const scriptSource = component.script ?? '';

  const templateSource = component.templateSource ?? '';

  const defaultable = component.props.filter((p) => p.defaultable);

  const useTags = [
    ...scriptSource.matchAll(/useAppDefault\(\s*'([^']+)'/g),
  ].map((m) => m[1]);

  // `appDefault('<name>', <built-in>)` — the literal may itself hold quotes
  // or an identifier (`DEFAULT_TEXTS`), never a nested call.
  const resolved = new Map(
    [
      ...scriptSource.matchAll(
        /(?<![\w.])appDefault\(\s*'([^']+)'\s*,\s*([^()]+?)\s*\)/g,
      ),
    ].map((m) => [m[1], m[2]]),
  );

  if (defaultable.length && !useTags.length) {
    errors.push(
      `has @defaultable props but never calls useAppDefault('${component.tagName}', props)`,
    );
  }

  if (!defaultable.length && useTags.length) {
    errors.push('calls useAppDefault but has no @defaultable prop');
  }

  for (const tag of useTags) {
    if (tag !== component.tagName) {
      errors.push(
        `useAppDefault('${tag}') names another component — expected '${component.tagName}'`,
      );
    }
  }

  for (const name of resolved.keys()) {
    if (!defaultable.some((p) => p.name === name)) {
      errors.push(
        `appDefault('${name}') resolves a prop that is not tagged @defaultable`,
      );
    }
  }

  for (const prop of defaultable) {
    if (prop.defaultable === true) {
      errors.push(
        `prop "${prop.name}" is tagged @defaultable without its built-in default literal (e.g. \`@defaultable false\`)`,
      );
      continue;
    }

    const literal = normalizeLiteral(prop.defaultable);

    const shape = literalShape(literal);

    const type = prop.typeResolved ?? prop.typeExpanded ?? prop.type;

    if (!typeAccepts(type, shape)) {
      errors.push(
        `prop "${prop.name}" @defaultable literal ${literal} does not fit its type ${type}`,
      );
    }

    if (prop.withDefault !== 'undefined') {
      errors.push(
        `prop "${prop.name}" is @defaultable but its withDefaults value is ${prop.withDefault ?? 'missing'} — must be \`undefined\``,
      );
    }

    const call = resolved.get(prop.name);

    if (call === undefined) {
      errors.push(
        `prop "${prop.name}" is @defaultable but the script never calls appDefault('${prop.name}', ${literal})`,
      );
    } else if (shape !== 'object' && normalizeLiteral(call) !== literal) {
      errors.push(
        `prop "${prop.name}" appDefault built-in ${normalizeLiteral(call)} differs from its @defaultable literal ${literal}`,
      );
    }

    if (new RegExp(`\\bprops\\.${prop.name}\\b`).test(scriptSource)) {
      errors.push(
        `prop "${prop.name}" is @defaultable but the script reads props.${prop.name} directly — use the appDefault() computed`,
      );
    }

    const kebab = hyphenate(prop.name);

    const shorthand = new RegExp(`:${kebab}(?=[\\s/>])`);

    const bound = new RegExp(`="(?:!|props\\.)?${prop.name}"`);

    if (shorthand.test(templateSource) || bound.test(templateSource)) {
      errors.push(
        `prop "${prop.name}" is @defaultable but the template binds it directly — bind the appDefault() computed instead`,
      );
    }
  }
};
