import rawManifest from '@cscfi/csc-ui-next/custom-elements.json';

/** The subset of the Custom Elements Manifest schema the analyzer emits. */
export interface CemTypeRef {
  text: string;
}

export interface CemAttribute {
  default?: string;
  description?: string;
  fieldName?: string;
  name: string;
  type?: CemTypeRef;
}

export interface CemEvent {
  description?: string;
  name: string;
  type?: CemTypeRef;
}

export interface CemNamed {
  description?: string;
  name: string;
}

export interface CemMember {
  csc?: { freeform?: boolean | string; signature?: string; typeAlias?: string };
  default?: string;
  description?: string;
  kind: 'field' | 'method';
  name: string;
  privacy?: string;
  type?: CemTypeRef;
}

export interface CemDeclaration {
  attributes?: CemAttribute[];
  csc?: { subcomponents?: string[]; usage?: string };
  cssParts?: CemNamed[];
  cssProperties?: CemNamed[];
  customElement?: boolean;
  description?: string;
  events?: CemEvent[];
  kind: string;
  members?: CemMember[];
  name: string;
  slots?: CemNamed[];
  tagName?: string;
}

export interface CemSharedType {
  declaration: string;
  description?: string;
  kind: string;
  name: string;
  /** Owning component tag for component-owned types; absent for shared types. */
  owner?: string;
}

export interface CemModule {
  declarations: CemDeclaration[];
  path: string;
}

export interface Cem {
  csc?: { types?: CemSharedType[] };
  modules: CemModule[];
  schemaVersion: string;
}

const manifest = rawManifest as unknown as Cem;

// Elements the consumer never authors (instantiated internally by a parent).
// They get no nav entry and no page.
const INTERNAL_ONLY = new Set(['c-dropdown']);

const components = manifest.modules
  .flatMap((module) => module.declarations)
  .filter((declaration): declaration is CemDeclaration & { tagName: string } =>
    Boolean(declaration.customElement && declaration.tagName),
  )
  .sort((a, b) => a.tagName.localeCompare(b.tagName));

const byTag = new Map(
  components.map((component) => [component.tagName, component]),
);

// child tag -> the parent whose page documents it (first declaring parent wins;
// only c-option is shared today). Used to redirect a folded child's old route.
const parentByChild = new Map<string, string>();

for (const component of components) {
  for (const child of component.csc?.subcomponents ?? []) {
    if (!parentByChild.has(child)) parentByChild.set(child, component.tagName);
  }
}

// Standalone components keep a nav entry and a page: everything that is neither
// a composed child nor internal-only.
const navComponents = components.filter(
  (component) =>
    !parentByChild.has(component.tagName) &&
    !INTERNAL_ONLY.has(component.tagName),
);

/**
 * The ordered list of components documented on a parent's page: the parent
 * first, then its composed children in declared order (internal-only or
 * unknown tags skipped). A standalone leaf resolves to just itself.
 */
type ResolvedComponent = CemDeclaration & { tagName: string };

const resolveGroup = (tag: string): ResolvedComponent[] => {
  const parent = byTag.get(tag);

  if (!parent) return [];

  const children = (parent.csc?.subcomponents ?? [])
    .filter((child) => !INTERNAL_ONLY.has(child))
    .map((child) => byTag.get(child))
    .filter((child): child is ResolvedComponent => Boolean(child));

  return [parent, ...children];
};

export interface PropView {
  attribute: null | string;
  default?: string;
  description?: string;
  name: string;
  type: string;
  /** Alias name behind the expanded `type` text — links to the type's
   *  declaration in the Types section on the same page. */
  typeAlias?: string;
}

export interface EventView {
  description?: string;
  detail: string;
  name: string;
}

export interface MethodView {
  description?: string;
  name: string;
  signature: string;
}

export interface ComponentView {
  cssParts: CemNamed[];
  cssProperties: CemNamed[];
  description?: string;
  events: EventView[];
  methods: MethodView[];
  props: PropView[];
  sections: { id: string; label: string }[];
  slots: CemNamed[];
  tagName: string;
  /** Public types documented under this component: its owned types plus any
   *  shared type its API references (rendered on every referencing page —
   *  the pages' self-containment rule applied to types). */
  types: CemSharedType[];
}

const publicTypes: CemSharedType[] = manifest.csc?.types ?? [];

const sharedPublicTypes = publicTypes.filter((t) => !t.owner);

/**
 * The types documented under one component: everything it owns, plus every
 * shared type reachable from its API text (prop/event/method types and the
 * declarations of already-included types — `CToastMessage` pulls in
 * `CToastType`).
 */
const typesFor = (c: CemDeclaration): CemSharedType[] => {
  const tag = c.tagName ?? c.name;

  const included = publicTypes.filter((t) => t.owner === tag);

  const apiText = [
    ...(c.members ?? []).flatMap((m) => [
      m.type?.text ?? '',
      m.csc?.typeAlias ?? '',
      m.csc?.signature ?? '',
    ]),
    ...(c.events ?? []).map((e) => e.type?.text ?? ''),
  ].join('\n');

  // Fixpoint over declaration texts so transitive references resolve.
  let grew = true;

  while (grew) {
    grew = false;

    const corpus = `${apiText}\n${included.map((t) => t.declaration).join('\n')}`;

    for (const shared of sharedPublicTypes) {
      if (included.includes(shared)) continue;

      if (new RegExp(`\\b${shared.name}\\b`).test(corpus)) {
        included.push(shared);
        grew = true;
      }
    }
  }

  return included;
};

/**
 * Flatten one manifest declaration into the render/TOC view for its page
 * group. `claimedTypes` dedupes types across the group's views — a type
 * renders once per page, under the first (parent-first) component that
 * documents it.
 */
export const toComponentView = (
  c: CemDeclaration,
  claimedTypes: Set<string> = new Set(),
): ComponentView => {
  const tag = c.tagName ?? c.name;

  const types = typesFor(c).filter((t) => {
    if (claimedTypes.has(t.name)) return false;

    claimedTypes.add(t.name);

    return true;
  });

  // Fields hold the property-side truth; the attributes array is the
  // attribute-compatible subset — join them so both names show.
  const attributeByField = new Map(
    (c.attributes ?? []).map((a) => [a.fieldName, a.name]),
  );

  const props: PropView[] = (c.members ?? [])
    .filter((m) => m.kind === 'field')
    .map((m) => ({
      attribute: attributeByField.get(m.name) ?? null,
      default: m.default,
      description: m.description,
      name: m.name,
      type: m.type?.text ?? '',
      typeAlias: m.csc?.typeAlias,
    }));

  const events: EventView[] = (c.events ?? []).map((e) => ({
    description: e.description,
    detail: e.type?.text.replace(/^CustomEvent<([\s\S]*)>$/, '$1') ?? 'void',
    name: e.name,
  }));

  const methods: MethodView[] = (c.members ?? [])
    .filter((m) => m.kind === 'method')
    .map((m) => ({
      description: m.description,
      name: m.name,
      signature: m.csc?.signature ?? '()',
    }));

  const cssParts = c.cssParts ?? [];

  const cssProperties = c.cssProperties ?? [];

  const slots = c.slots ?? [];

  const sections = [
    props.length && { id: `${tag}--properties`, label: 'Properties' },
    events.length && { id: `${tag}--events`, label: 'Events' },
    methods.length && { id: `${tag}--methods`, label: 'Methods' },
    slots.length && { id: `${tag}--slots`, label: 'Slots' },
    cssParts.length && { id: `${tag}--css-parts`, label: 'CSS parts' },
    cssProperties.length && {
      id: `${tag}--css-properties`,
      label: 'CSS custom properties',
    },
    types.length && { id: `${tag}--types`, label: 'Types' },
  ].filter(Boolean) as { id: string; label: string }[];

  return {
    cssParts,
    cssProperties,
    description: c.description,
    events,
    methods,
    props,
    sections,
    slots,
    tagName: tag,
    types,
  };
};

export const useManifest = () => ({
  components,
  findComponent: (tag: string) => byTag.get(tag) ?? null,
  navComponents,
  // The parent page a folded child's route should redirect to, or null.
  parentOf: (tag: string) => parentByChild.get(tag) ?? null,
  resolveGroup,
  sharedTypes: manifest.csc?.types ?? [],
});
