import { describe, expect, it } from 'vitest';

import { monotonicClock } from './monotonicClock';

const play = (samples: number[]): number[] => {
  const queue = [...samples];

  const now = monotonicClock(() => queue.shift() ?? Number.NaN);

  return samples.map(() => now());
};

describe('monotonicClock', () => {
  it('passes a healthy clock through untouched', () => {
    expect(play([1000, 1001, 1050, 1050, 1200])).toEqual([
      1000, 1001, 1050, 1050, 1200,
    ]);
  });

  it('steps one millisecond past the last reading on a backwards step, then follows the source', () => {
    // A 135 ms step back at the third sample: the reading moves to 1051 (never
    // equal to the pre-step 1050), then follows the source 1:1 (offset 136).
    expect(play([1000, 1050, 915, 920, 1100])).toEqual([
      1000, 1050, 1051, 1056, 1236,
    ]);
  });

  it('accumulates repeated steps', () => {
    expect(play([100, 50, 60, 10, 20])).toEqual([100, 101, 111, 112, 122]);
  });
});
