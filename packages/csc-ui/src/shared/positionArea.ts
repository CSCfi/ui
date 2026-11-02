/**
 * A panel's placement relative to its anchor: the side, and `-start`/`-end`
 * to align their edges on the cross axis. Private: c-menu, c-popover and
 * c-tooltip each own a public alias of it (`CMenuPosition`, …).
 */
export type Placement =
  | 'bottom-end'
  | 'bottom-start'
  | 'bottom'
  | 'left-end'
  | 'left-start'
  | 'left'
  | 'right-end'
  | 'right-start'
  | 'right'
  | 'top-end'
  | 'top-start'
  | 'top';

/**
 * `Placement` → CSS `position-area`, shared by the anchor-positioned overlay
 * components (`c-menu`, `c-tooltip`, `c-popover`; ADR-0008). Native flip/shift
 * comes from each component's `position-try-fallbacks` escape-hatch rule.
 */
export const POSITION_AREA: Record<Placement, string> = {
  bottom: 'bottom',
  'bottom-end': 'bottom span-left',
  'bottom-start': 'bottom span-right',
  left: 'left',
  'left-end': 'left span-top',
  'left-start': 'left span-bottom',
  right: 'right',
  'right-end': 'right span-top',
  'right-start': 'right span-bottom',
  top: 'top',
  'top-end': 'top span-left',
  'top-start': 'top span-right',
};

/**
 * The logical axis of a placement's side — the axis the trigger→panel gap
 * margin is applied on (both sides, so the gap survives the position-try
 * flip fallbacks).
 */
export const placementAxis = (position: Placement): 'block' | 'inline' =>
  position.startsWith('left') || position.startsWith('right')
    ? 'inline'
    : 'block';
