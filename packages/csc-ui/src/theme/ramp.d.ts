// Type surface for the plain-JS shared ramp core (ramp.js). Authored by hand
// because the core is JS (so the Node build script can import it without a TS
// loader) while consumers and the runtime API need types.

/** One of the chromatic brand/status families a consumer may re-seed. */
export type Family =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'link';

/** Built-in brand seed (step-500) per family. */
export declare const DEFAULT_SEEDS: Record<Family, string>;

/** The chromatic families, in canonical order. */
export declare const FAMILIES: readonly Family[];

/** Ramp steps, in ascending order (`[50, 100, …, 950]`). */
export declare const STEPS: readonly number[];

/** Generate a full 50–950 ramp from a single step-500 seed. */
export declare function ramp(seedHex: string): Record<string, string>;

/** The `--c-<family>-*` custom-property map (steps + `-rgb`) for one seed. */
export declare function familyVars(
  family: Family,
  seedHex: string,
): Record<string, string>;
