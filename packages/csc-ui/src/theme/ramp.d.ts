// Type surface for the plain-JS shared ramp core (ramp.js). Authored by hand
// because the core is JS (so the Node build script can import it without a TS
// loader) while consumers and the runtime API need types.

/** One of the chromatic brand/status families a consumer may re-seed. */
export type Family =
  | 'accent'
  | 'error'
  | 'info'
  | 'link'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning';

/** Built-in brand seed (step-500) per family. */
export declare const DEFAULT_SEEDS: Record<Family, string>;

/** The chromatic families, in canonical order. */
export declare const FAMILIES: readonly Family[];

/** Ramp steps, in ascending order (`[50, 100, …, 950]`). */
export declare const STEPS: readonly number[];

/**
 * The CSS value the library emits for a colour: a hex becomes `oklch(L C H)`
 * at a precision that round-trips exactly; non-hex values pass through.
 */
export declare function cssColor(value: string): string;

/** The `--c-<family>-*` custom-property map (steps + `-rgb`) for one seed. */
export declare function familyVars(
  family: Family,
  seedHex: string,
): Record<string, string>;

/** Generate a full 50–950 ramp from a single step-500 seed. */
export declare function ramp(seedHex: string): Record<string, string>;
