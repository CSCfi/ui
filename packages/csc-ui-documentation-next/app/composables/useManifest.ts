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
  csc?: { signature?: string };
  default?: string;
  description?: string;
  kind: 'field' | 'method';
  name: string;
  privacy?: string;
  type?: CemTypeRef;
}

export interface CemDeclaration {
  attributes?: CemAttribute[];
  csc?: { usage?: string };
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

const components = manifest.modules
  .flatMap((module) => module.declarations)
  .filter(
    (declaration): declaration is CemDeclaration & { tagName: string } =>
      Boolean(declaration.customElement && declaration.tagName),
  )
  .sort((a, b) => a.tagName.localeCompare(b.tagName));

const byTag = new Map(components.map((component) => [component.tagName, component]));

export const useManifest = () => ({
  components,
  findComponent: (tag: string) => byTag.get(tag) ?? null,
  sharedTypes: manifest.csc?.types ?? [],
});
