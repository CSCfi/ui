/**
 * Custom Elements Manifest assembly (ADR-0012).
 *
 * Shapes the per-component analysis into the CEM schema
 * (https://github.com/webcomponents/custom-elements-manifest). Everything
 * CSC-specific rides in a single `csc` vendor-extension object:
 *   - declaration-level: `csc.usage` (dist-relative path of the usage doc),
 *                        `csc.subcomponents` (composed children folded into
 *                        this parent's docs page, ADR-0013)
 *   - manifest-level:    `csc.types` (shared public types from src/types.ts,
 *                        which CEM has no first-class kind for)
 */

const kebab = (name) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Props whose type can meaningfully round-trip through an HTML attribute.
 * Functions / objects / arrays are property-only. Tested against the
 * *resolved* type when the prop is typed via an alias (ADR-0015) so e.g. a
 * function-typed alias is not mistaken for an attribute.
 */
const isAttributeCompatible = (type) => !/=>|\{|\[\]|Record<|Array</.test(type);

/**
 * The manifest's standard `type.text` carries the expanded literal union so
 * third-party IDE-data generators can derive value completions; the alias
 * name and the `@freeform` marker ride in the `csc` vendor extension
 * (ADR-0015).
 */
const typeCsc = (prop) => {
  const csc = {
    ...(prop.typeAlias ? { typeAlias: prop.typeAlias } : {}),
    ...(prop.freeform ? { freeform: prop.freeform } : {}),
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

export const buildManifest = (components, sharedTypes) => ({
  schemaVersion: '1.0.0',
  ...(sharedTypes.length ? { csc: { types: sharedTypes } } : {}),
  modules: components.map((c) => ({
    declarations: [
      {
        customElement: true,
        kind: 'class',
        name: c.className,
        tagName: c.tagName,
        ...(c.description ? { description: c.description } : {}),
        ...declarationCsc(c),
        attributes: c.props
          .filter((p) => isAttributeCompatible(p.typeResolved ?? p.type))
          .map(attribute),
        cssParts: docTagEntries(c.docTags, 'csspart'),
        cssProperties: docTagEntries(c.docTags, 'cssprop').map((entry) => ({
          ...entry,
          name: entry.name,
        })),
        events: c.events.map((e) => {
          // camelCase events dispatch a kebab-case twin at runtime
          // (ADR-0021, useHostEmit) so Vue templates can bind them;
          // surface the twin in the docs.
          const twin = e.name.replace(/\B([A-Z])/g, '-$1').toLowerCase();
          const note =
            twin === e.name
              ? ''
              : `Also dispatched as \`${twin}\` — bind that name in Vue templates.`;
          const description = [e.description, note]
            .filter(Boolean)
            .join(' ');

          return {
            name: e.name,
            type: { text: `CustomEvent<${e.detailType || 'unknown'}>` },
            ...(description ? { description } : {}),
          };
        }),
        members: [
          ...c.props.map(field),
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
