/**
 * Docs-contract lint (ADR-0012).
 *
 * Hard errors (the template and the docblock must agree 1:1 — parts are the
 * customization API per ADR-0006, so an undocumented or phantom name is an API
 * defect):
 *   - template slot without an `@slot` tag / `@slot` naming no template slot
 *   - part (own or exportparts-exposed) without an `@csspart` tag /
 *     `@csspart` naming no part
 *   - a raw `new CustomEvent(` / `new Event(` in the SFC — events must go
 *     through `useHostEmit` (or `emitModelValue`) so the event map stays the
 *     single source of truth
 *   - an `emitModelValue` caller whose event map is missing the
 *     `changeValue` / `update:value` / `input` triple that helper dispatches
 *   - an `@subcomponents` tag naming an unknown tag, or the component itself
 *     (ADR-0013 — the composed-children list must resolve to real components)
 *   - a prop typed bare `string` without an `@freeform` tag (ADR-0015 —
 *     set-of-accepted-values props must be named exported unions; genuinely
 *     open-ended props declare it explicitly), or an `@freeform` tag on a
 *     prop that is not a bare `string`
 *
 * Warnings (best-effort surface):
 *   - `@cssprop` naming a custom property never referenced in the SFC source
 *     (usages hide inside Tailwind arbitrary-value strings, so only the
 *     tag→usage direction is checked; the global `--c-*` theme tokens are NOT
 *     per-component API and are never required to be tagged)
 *   - dynamic slot-name / part bindings the analyzer cannot verify
 *   - missing `usage.md`
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

  for (const prop of component.props) {
    if (prop.type === 'string' && !prop.freeform) {
      errors.push(
        `prop "${prop.name}" is a bare string — give it a union type or tag it @freeform (ADR-0015)`,
      );
    }

    if (prop.freeform && prop.type !== 'string') {
      errors.push(
        `prop "${prop.name}" is tagged @freeform but is not a bare string`,
      );
    }
  }

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

  return { errors, warnings };
};
