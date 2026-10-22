/**
 * The toast's **swipe dismiss** rules (CONTEXT.md, ADR-0073), kept free of the
 * DOM so the node project can pin them down. The component feeds in pointer
 * travel and samples; these decide when a press becomes a swipe, how faded the
 * dragged toast is and whether letting go dismisses it.
 */

/** Travel in px before a press decides between a swipe and the page's own gesture. */
export const SWIPE_SLOP_PX = 10;

/** Share of the toast's width past which a release dismisses. */
export const SWIPE_DISMISS_FRACTION = 1 / 3;

/** Release speed in px/ms that dismisses however short the drag (a flick). */
export const SWIPE_FLICK_PX_PER_MS = 0.5;

/** How far back, in ms, the release velocity looks. */
export const SWIPE_VELOCITY_WINDOW_MS = 100;

/** Opacity at the dismiss threshold; it keeps falling past it, down to the floor. */
const OPACITY_AT_THRESHOLD = 0.5;

/**
 * Never fully transparent while dragged: the dismissal fades to 0 from here,
 * and an opacity that does not change starts no transition, so the
 * `transitionend` the exit waits for would never come.
 */
const OPACITY_FLOOR = 0.2;

/** What a press is after travelling `dx`, `dy`: still undecided, a swipe, or the page's. */
export type CToastSwipeIntent = 'claim' | 'pending' | 'release';

/** One pointer position on the swipe axis, stamped with the event's `timeStamp`. */
export interface CToastSwipeSample {
  t: number;
  x: number;
}

export const swipeIntent = (dx: number, dy: number): CToastSwipeIntent => {
  const x = Math.abs(dx);

  const y = Math.abs(dy);

  if (x < SWIPE_SLOP_PX && y < SWIPE_SLOP_PX) return 'pending';

  return x > y ? 'claim' : 'release';
};

/**
 * Velocity in px/ms over the samples inside the window ending at `now`. Fewer
 * than two samples, or no time between them (synthetic events can share a
 * coarsened stamp), read as standing still.
 */
export const swipeVelocity = (
  samples: readonly CToastSwipeSample[],
  now: number,
): number => {
  const recent = samples.filter((s) => now - s.t <= SWIPE_VELOCITY_WINDOW_MS);

  if (recent.length < 2) return 0;

  const first = recent[0];

  const last = recent[recent.length - 1];

  const dt = last.t - first.t;

  return dt > 0 ? (last.x - first.x) / dt : 0;
};

/**
 * Whether a release at offset `dx` moving at `velocity` dismisses: a flick
 * along the drag always does and a flick back toward rest never does;
 * otherwise the toast must be past the threshold.
 */
export const swipeOutcome = ({
  dx,
  velocity,
  width,
}: {
  dx: number;
  velocity: number;
  width: number;
}): 'dismiss' | 'return' => {
  if (dx === 0) return 'return';

  if (Math.abs(velocity) >= SWIPE_FLICK_PX_PER_MS) {
    return Math.sign(velocity) === Math.sign(dx) ? 'dismiss' : 'return';
  }

  return Math.abs(dx) >= width * SWIPE_DISMISS_FRACTION ? 'dismiss' : 'return';
};

/** The dragged toast's opacity at offset `dx`. */
export const swipeOpacity = (dx: number, width: number): number => {
  const threshold = width * SWIPE_DISMISS_FRACTION;

  if (threshold <= 0) return 1;

  const faded = 1 - ((1 - OPACITY_AT_THRESHOLD) * Math.abs(dx)) / threshold;

  return Math.max(OPACITY_FLOOR, faded);
};
