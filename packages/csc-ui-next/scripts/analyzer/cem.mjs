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
 * Functions / objects / arrays are property-only.
 */
const isAttributeCompatible = (type) => !/=>|\{|\[\]|Record<|Array</.test(type);

const field = (prop) => ({
  kind: 'field',
  name: prop.name,
  privacy: 'public',
  ...(prop.description ? { description: prop.description } : {}),
  ...(prop.type ? { type: { text: prop.type } } : {}),
  ...(prop.default !== undefined ? { default: prop.default } : {}),
});

const attribute = (prop) => ({
  fieldName: prop.name,
  name: kebab(prop.name),
  ...(prop.description ? { description: prop.description } : {}),
  ...(prop.type ? { type: { text: prop.type } } : {}),
  ...(prop.default !== undefined ? { default: prop.default } : {}),
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
          .filter((p) => isAttributeCompatible(p.type))
          .map(attribute),
        cssParts: docTagEntries(c.docTags, 'csspart'),
        cssProperties: docTagEntries(c.docTags, 'cssprop').map((entry) => ({
          ...entry,
          name: entry.name,
        })),
        events: c.events.map((e) => ({
          name: e.name,
          type: { text: `CustomEvent<${e.detailType || 'unknown'}>` },
          ...(e.description ? { description: e.description } : {}),
        })),
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
