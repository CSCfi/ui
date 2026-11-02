/**
 * The toast's swipe dismiss rules (CONTEXT.md "Swipe dismiss", ADR-0073): a
 * press claims a mostly horizontal drag after the slop; letting go past a
 * third of the width or with a flick along the drag dismisses.
 */
import { describe, expect, it } from 'vitest';

import {
  SWIPE_SLOP_PX,
  swipeIntent,
  swipeOpacity,
  swipeOutcome,
  swipeVelocity,
} from './swipe';

describe('swipeIntent', () => {
  it('waits until the press has travelled the slop', () => {
    expect(swipeIntent(SWIPE_SLOP_PX - 1, SWIPE_SLOP_PX - 1)).toBe('pending');
  });

  it('claims mostly horizontal travel either way', () => {
    expect(swipeIntent(SWIPE_SLOP_PX, 4)).toBe('claim');
    expect(swipeIntent(-SWIPE_SLOP_PX, -4)).toBe('claim');
  });

  it('leaves mostly vertical travel, and a diagonal, to the page', () => {
    expect(swipeIntent(4, SWIPE_SLOP_PX)).toBe('release');
    expect(swipeIntent(12, -12)).toBe('release');
  });
});

describe('swipeVelocity', () => {
  it('measures across the samples inside the window', () => {
    const samples = [
      { t: 0, x: 0 },
      { t: 200, x: 10 },
      { t: 250, x: 40 },
      { t: 300, x: 90 },
    ];

    // Only 200..300 lie within 100ms of 300: 80px over 100ms.
    expect(swipeVelocity(samples, 300)).toBeCloseTo(0.8);
  });

  it('reads a pause before the release as standing still', () => {
    expect(
      swipeVelocity(
        [
          { t: 0, x: 0 },
          { t: 20, x: 60 },
        ],
        300,
      ),
    ).toBe(0);
  });

  it('stays finite when samples share a stamp', () => {
    expect(
      swipeVelocity(
        [
          { t: 50, x: 0 },
          { t: 50, x: 60 },
        ],
        50,
      ),
    ).toBe(0);
  });
});

describe('swipeOutcome', () => {
  const width = 300;

  it('dismisses past a third of the width, either way', () => {
    expect(swipeOutcome({ dx: 100, velocity: 0, width })).toBe('dismiss');
    expect(swipeOutcome({ dx: -100, velocity: 0, width })).toBe('dismiss');
  });

  it('springs back short of a third', () => {
    expect(swipeOutcome({ dx: 99, velocity: 0, width })).toBe('return');
  });

  it('dismisses a short flick along the drag', () => {
    expect(swipeOutcome({ dx: 30, velocity: 0.5, width })).toBe('dismiss');
    expect(swipeOutcome({ dx: -30, velocity: -0.9, width })).toBe('dismiss');
  });

  it('springs back on a flick toward rest, even past a third', () => {
    expect(swipeOutcome({ dx: 200, velocity: -0.6, width })).toBe('return');
  });

  it('never dismisses a toast let go at rest', () => {
    expect(swipeOutcome({ dx: 0, velocity: 2, width: 0 })).toBe('return');
  });
});

describe('swipeOpacity', () => {
  it('is opaque at rest and half faded at the threshold', () => {
    expect(swipeOpacity(0, 300)).toBe(1);
    expect(swipeOpacity(-100, 300)).toBeCloseTo(0.5);
  });

  it('keeps fading past the threshold, never below the floor', () => {
    expect(swipeOpacity(150, 300)).toBeCloseTo(0.25);
    expect(swipeOpacity(1000, 300)).toBe(0.2);
  });
});
