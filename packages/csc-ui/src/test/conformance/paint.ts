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

/** A translucent colour composited over an opaque one, as the eye sees it. */
export const over = (top: string, under: string): string => {
  const [r, g, b, a] = rasterise(top);

  const below = rasterise(under);

  const t = a! / 255;

  const mix = (c: number, i: number) => Math.round(c * t + below[i]! * (1 - t));

  return `rgb(${mix(r!, 0)} ${mix(g!, 1)} ${mix(b!, 2)})`;
};

/**
 * A role mixed into a ground at a share, as the tint utility paints it
 * (ADR-0082): the page surface unless a tinted container's own colour is
 * given.
 */
export const tintOf = (
  role: string,
  share: number,
  ground = 'var(--c-surface)',
): number[] => {
  const box = document.createElement('div');

  box.style.background = `color-mix(in srgb, var(--c-${role}) ${share}%, ${ground})`;
  document.body.append(box);

  const painted = rasterise(getComputedStyle(box).backgroundColor);

  box.remove();

  return painted;
};
