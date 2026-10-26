/**
 * Custom Elements Manifest assembly.
 *
 * Shapes the per-component analysis into the CEM schema
 * (https://github.com/webcomponents/custom-elements-manifest). Everything
 * CSC-specific rides in a single `csc` vendor-extension object:
 *   - declaration-level: `csc.usage` (dist-relative path of the usage doc),
 *                        `csc.subcomponents` (composed children folded into
 *                        this parent's docs page)
 *   - member-level:      `csc.typeAlias` / `csc.freeform` (see typeCsc) and
 *                        `csc.defaultable` (the prop accepts an app-wide
 *                        default via `applyDefaults()`)
 *   - manifest-level:    `csc.types` (shared public types from src/types.ts,
 *                        which CEM has no first-class kind for),
 *                        `csc.internalTags` (registered tags only another
 *                        component instantiates — named, never described)
 *
 * Anything marked internal (ADR-0075) is left out: an `@internal` component
 * gets no declaration, an `@internal` prop or event no entry, and an
 * `@internalslot` no slot, an `@internalpart` no part. The manifest is the
 * public API (ADR-0074).
 */

const kebab = (name) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Props whose type can meaningfully round-trip through an HTML attribute.
 * Functions / objects / arrays are property-only. Tested against the
 * *resolved* type when the prop is typed via an alias so e.g. a
 * function-typed alias is not mistaken for an attribute.
 */
const isAttributeCompatible = (type) => !/=>|\{|\[\]|Record<|Array</.test(type);

/**
 * The manifest's standard `type.text` carries the expanded literal union so
 * third-party IDE-data generators can derive value completions; the alias
 * name, the `@freeform` marker and the `@defaultable` flag ride in the `csc`
 * vendor extension.
 */
const typeCsc = (prop) => {
  const csc = {
    ...(prop.typeAlias ? { typeAlias: prop.typeAlias } : {}),
    ...(prop.freeform ? { freeform: prop.freeform } : {}),
    ...(prop.defaultable ? { defaultable: true } : {}),
  };

  return Object.keys(csc).length ? { csc } : {};
};

const typeEntry = (prop) => {
  const text = prop.typeExpanded ?? prop.type;

  return text ? { type: { text } } : {};
};

const field = (prop) => ({
  kind: 'field',
  name: prop.name,
  privacy: 'public',
  ...(prop.description ? { description: prop.description } : {}),
  ...typeEntry(prop),
  ...(prop.default !== undefined ? { default: prop.default } : {}),
  ...typeCsc(prop),
});

const attribute = (prop) => ({
  fieldName: prop.name,
  name: kebab(prop.name),
  ...(prop.description ? { description: prop.description } : {}),
  ...typeEntry(prop),
  ...(prop.default !== undefined ? { default: prop.default } : {}),
  ...typeCsc(prop),
});

const docTagEntries = (docTags, tag) =>
  docTags
    .filter((t) => t.tag === tag)
    .map((t) => ({
      name: t.name,
      ...(t.description ? { description: t.description } : {}),
    }));

const declarationCsc = (c) => {
  const csc = {
    ...(c.usagePath ? { usage: c.usagePath } : {}),
    ...(c.subcomponents.length ? { subcomponents: c.subcomponents } : {}),
  };

  return Object.keys(csc).length ? { csc } : {};
};

const manifestCsc = (components, sharedTypes) => {
  const internalTags = components
    .filter((c) => c.internal)
    .map((c) => c.tagName);

  const csc = {
    ...(sharedTypes.length ? { types: sharedTypes } : {}),
    ...(internalTags.length ? { internalTags } : {}),
  };

  return Object.keys(csc).length ? { csc } : {};
};

const isPublic = (entry) => !entry.internal;

export const buildManifest = (components, sharedTypes) => ({
  schemaVersion: '1.0.0',
  ...manifestCsc(components, sharedTypes),
  modules: components.filter(isPublic).map((c) => ({
    declarations: [
      {
        customElement: true,
        kind: 'class',
        name: c.className,
        tagName: c.tagName,
        ...(c.description ? { description: c.description } : {}),
        ...declarationCsc(c),
        attributes: c.props
          .filter(isPublic)
          .filter((p) => isAttributeCompatible(p.typeResolved ?? p.type))
          .map(attribute),
        cssParts: docTagEntries(c.docTags, 'csspart'),
        cssProperties: docTagEntries(c.docTags, 'cssprop').map((entry) => ({
          ...entry,
          name: entry.name,
        })),
        // Host custom states (`:state()` selectors, ADR-0035). `cssStates` is
        // the CEM 2.x field name; harmless extra data under schema 1.0.0.
        cssStates: docTagEntries(c.docTags, 'cssstate'),
        events: c.events.filter(isPublic).map((e) => ({
          name: e.name,
          type: { text: `CustomEvent<${e.detailType || 'unknown'}>` },
          ...(e.description ? { description: e.description } : {}),
        })),
        members: [
          ...c.props.filter(isPublic).map(field),
          ...c.readonlyProperties.map((r) => ({
            kind: 'field',
            name: r.name,
            privacy: 'public',
            readonly: true,
            type: { text: r.type },
            ...(r.description ? { description: r.description } : {}),
          })),
          ...c.methods.map((m) => ({
            kind: 'method',
            name: m.name,
            privacy: 'public',
            ...(m.description ? { description: m.description } : {}),
            ...(m.signature ? { csc: { signature: m.signature } } : {}),
          })),
        ],
        slots: docTagEntries(c.docTags, 'slot'),
      },
    ],
    exports: [
      {
        declaration: { module: c.modulePath, name: c.className },
        kind: 'js',
        name: c.className,
      },
      {
        declaration: { module: c.modulePath, name: c.className },
        kind: 'custom-element-definition',
        name: c.tagName,
      },
    ],
    kind: 'javascript-module',
    path: c.modulePath,
  })),
});
