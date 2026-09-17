/**
 * Colour reading for the conformance suites.
 *
 * The same colour has more than one computed spelling — Chromium serialises a
 * `color-mix()` or an interpolated value as `oklab()` where the token itself
 * reads `oklch()` (c-checkbox's focus ring is one), and `getComputedStyle`
 * never collapses the two. Reading `fillStyle` back does not either: canvas
 * preserves the colour space. Rasterising does, and the sRGB bytes are the
 * colour the user actually sees. Two modes' tokens are never 8-bit-adjacent,
 * so the quantisation cannot hide a real difference.
 */
const probe = document
  .createElement('canvas')
  .getContext('2d', { willReadFrequently: true })!;

/** A computed colour as sRGB bytes, `[r, g, b, a]`. */
export const rasterise = (value: string): number[] => {
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = value;
  probe.fillRect(0, 0, 1, 1);

  return [...probe.getImageData(0, 0, 1, 1).data];
};

/** `rasterise` as a comparable key. */
export const normalise = (value: string): string => rasterise(value).join(',');

/**
 * An opaque ground: whatever is painted behind it contributes nothing, so the
 * box owns what reads against it. Translucent grounds are deliberately not
 * opaque — the page still shows through, so inheriting its ink is defensible.
 */
export const isOpaque = (value: string): boolean => rasterise(value)[3] === 255;
