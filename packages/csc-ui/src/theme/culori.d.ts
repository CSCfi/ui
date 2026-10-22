// The slice of culori (a runtime dependency since ADR-0011) the TypeScript
// sources call. culori ships no types; the JS ramp core needs none.
declare module 'culori' {
  /** A parsed colour: its mode, its channels (an absent channel is `none`) and alpha. */
  export interface Color {
    [channel: string]: number | string | undefined;
    alpha?: number;
    mode: string;
  }

  export function clampChroma(
    color: Color,
    mode?: string,
    rgbGamut?: string,
  ): Color;

  export function converter(
    mode: string,
  ): (color: Color | string) => Color | undefined;

  export function parse(color: string): Color | undefined;
}
